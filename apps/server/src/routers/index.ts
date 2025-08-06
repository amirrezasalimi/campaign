import type { Router as ExpressRouter } from "express";
import { Router } from "express";
import { z } from "zod";
import { db } from "@/db";
import { campaigns } from "@/db/schema/campaigns";
import {
  addCampaignSchema,
  editCampaignSchema,
  paginationQuerySchema,
  idParamSchema,
} from "@/routers/validations/campaigns";
import type {
  AddCampaignResponse,
  EditCampaignResponse,
  ListCampaignsResponse,
  RemoveCampaignResponse,
  Campaign,
  CampaignStatus,
} from "@/types/campaigns";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";

const router: ExpressRouter = Router();

// POST /campaigns/add-campaign
router.post("/add", async (req, res) => {
  try {
    const body = addCampaignSchema.parse(req.body);

    const insertValues = {
      title: body.title,
      description: body.description,
      reward: body.reward,
      status: body.status ?? "active",
      endDate: body.endDate,
    };

    const [created] = await db
      .insert(campaigns)
      .values(insertValues)
      .returning();

    const response: AddCampaignResponse = {
      success: true,
      data: {
        ...created,
        status: created.status,
      } as Campaign,
    };
    res.status(201).json(response);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const response = {
        success: false,
        error: err.flatten().formErrors.join(", ") || "Invalid input",
      } as const;
      return res.status(400).json(response);
    }
    const response = {
      success: false,
      error: "Failed to create campaign",
    } as const;
    return res.status(500).json(response);
  }
});

// GET /campaigns?page=&take=&title=&status=&sort_key=&sort_type=
router.get("/", async (req, res) => {
  try {
    // Extend parsed query to include optional status
    const { page, take, title, sort_key, sort_type, status } =
      paginationQuerySchema.parse(req.query);

    // Pagination
    const offset = (page - 1) * take;

    // title -> ilike('%title%'), status -> eq(status), combined via and()
    const clauses = [
      title ? like(campaigns.title, `%${title}%`) : undefined,
      status ? eq(campaigns.status, status as string) : undefined,
    ].filter(Boolean);

    const whereClause =
      clauses.length === 0
        ? undefined
        : clauses.length === 1
        ? clauses[0]
        : and(...clauses);

    // Sorting (Drizzle-native)
    const sortExpr =
      sort_key === "title"
        ? sort_type === "asc"
          ? asc(campaigns.title)
          : desc(campaigns.title)
        : sort_key === "reward"
        ? sort_type === "asc"
          ? asc(campaigns.reward)
          : desc(campaigns.reward)
        : sort_key === "status"
        ? sort_type === "asc"
          ? asc(campaigns.status)
          : desc(campaigns.status)
        : sort_key === "endDate"
        ? sort_type === "asc"
          ? asc(campaigns.endDate)
          : desc(campaigns.endDate)
        : sort_type === "asc"
        ? asc(campaigns.created_at)
        : desc(campaigns.created_at);

    // Fetch page items
    const rows = await db
      .select()
      .from(campaigns)
      .where(whereClause)
      .orderBy(sortExpr)
      .limit(take)
      .offset(offset);

    // Count total rows with the same filters
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(campaigns)
      .where(whereClause);

    const total = Number(count) || 0;
    const total_pages = Math.max(1, Math.ceil(total / take));

    // Normalize DB rows to Campaign[] by narrowing status to enum
    const items = rows.map((r) => ({
      ...r,
      status: r.status as string as CampaignStatus,
    })) as Campaign[];

    const response: ListCampaignsResponse = {
      success: true,
      data: { items, total_pages },
    };
    res.status(200).json(response);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const response = {
        success: false,
        error: err.flatten().formErrors.join(", ") || "Invalid query",
      } as const;
      return res.status(400).json(response);
    }
    console.log("Error fetching campaigns:", err);

    const response = {
      success: false,
      error: "Failed to fetch campaigns",
    } as const;
    return res.status(500).json(response);
  }
});

// GET /campaigns/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const rows = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id))
      .limit(1);

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      } as const);
    }

    const item = {
      ...rows[0],
      status: rows[0].status as string as CampaignStatus,
    } as Campaign;

    const response = {
      success: true,
      data: item,
    } as const;
    res.status(200).json(response);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const response = {
        success: false,
        error: err.flatten().formErrors.join(", ") || "Invalid id",
      } as const;
      return res.status(400).json(response);
    }
    const response = {
      success: false,
      error: "Failed to fetch campaign",
    } as const;
    return res.status(500).json(response);
  }
});

// DELETE /campaigns/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);

    const deleted = await db
      .delete(campaigns)
      .where(eq(campaigns.id, id))
      .returning({ id: campaigns.id });

    if (!deleted.length) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      } satisfies RemoveCampaignResponse);
    }

    const response: RemoveCampaignResponse = {
      success: true,
      data: { id: deleted[0].id },
    };
    res.status(200).json(response);
  } catch (err) {
    if (err instanceof z.ZodError) {
      const response = {
        success: false,
        error: err.flatten().formErrors.join(", ") || "Invalid id",
      } as const;
      return res.status(400).json(response);
    }
    const response = {
      success: false,
      error: "Failed to remove campaign",
    } as const;
    return res.status(500).json(response);
  }
});

// PATCH /campaigns/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = editCampaignSchema.parse(req.body);

    // Build partial update
    const updates: Record<string, any> = {
      ...data,
      updated_at: sql`(CURRENT_TIMESTAMP)`,
    };

    const updated = await db
      .update(campaigns)
      .set(updates)
      .where(eq(campaigns.id, id))
      .returning();

    if (!updated.length) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      } satisfies EditCampaignResponse);
    }

    const response: EditCampaignResponse = {
      success: true,
      data: updated[0] as Campaign,
    };
    res.status(200).json(response);
  } catch (err) {
    console.log("Error editing campaign:", err);

    if (err instanceof z.ZodError) {
      const response = {
        success: false,
        error: err.flatten().formErrors.join(", ") || "Invalid input",
      } as const;
      return res.status(400).json(response);
    }
    const response = {
      success: false,
      error: "Failed to edit campaign",
    } as const;
    return res.status(500).json(response);
  }
});

export default router;
