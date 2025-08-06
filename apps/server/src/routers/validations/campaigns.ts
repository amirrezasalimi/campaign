import { z } from "zod";

export const CampaignStatusEnum = z.enum(["active", "inactive", "completed"]);

export const addCampaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  reward: z.number().int().nonnegative(),
  status: CampaignStatusEnum.optional().default("active"),
  endDate: z.string().min(1),
});

export const editCampaignSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    reward: z.number().int().nonnegative().optional(),
    status: CampaignStatusEnum.optional(),
    endDate: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().positive().max(100).default(10),
  title: z.string().min(1).optional(),
  sort_key: z
    .enum(["created_at", "title", "reward", "endDate", "status"])
    .optional()
    .default("created_at"),
  sort_type: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});
