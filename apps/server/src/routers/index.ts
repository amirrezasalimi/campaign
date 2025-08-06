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
import { eq, sql } from "drizzle-orm";

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

// GET /campaigns?page=&take=&title=&sort_key=&sort_type=
router.get("/", async (req, res) => {
  try {
    const { page, take, title, sort_key, sort_type } =
      paginationQuerySchema.parse(req.query);

    // Pagination
    const offset = (page - 1) * take;

    // Optional title filter
    const whereClause = title
      ? sql`${campaigns.title} LIKE ${"%" + title + "%"}`
      : undefined;

    // Sorting
    const orderBy =
      sort_key === "title"
        ? sql`${campaigns.title} ${sql.raw(sort_type.toUpperCase())}`
        : sort_key === "reward"
        ? sql`${campaigns.reward} ${sql.raw(sort_type.toUpperCase())}`
        : sort_key === "status"
        ? sql`${campaigns.status} ${sql.raw(sort_type.toUpperCase())}`
        : sort_key === "endDate"
        ? sql`${campaigns.endDate} ${sql.raw(sort_type.toUpperCase())}`
        : sql`${campaigns.created_at} ${sql.raw(sort_type.toUpperCase())}`;

    const rows = await db
      .select()
      .from(campaigns)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(take)
      .offset(offset);

    // Normalize DB rows to Campaign[] by narrowing status to enum
    const items = rows.map((r: any) => ({
      ...r,
      status: r.status as string as CampaignStatus,
    })) as Campaign[];

    const response: ListCampaignsResponse = {
      success: true,
      data: { items, nextCursor: undefined },
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
