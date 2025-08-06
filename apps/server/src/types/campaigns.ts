import { z } from "zod";
import {
  addCampaignSchema,
  editCampaignSchema,
  paginationQuerySchema,
  idParamSchema,
  CampaignStatusEnum,
} from "@/routers/validations/campaigns";

export type CampaignStatus = z.infer<typeof CampaignStatusEnum>;

export interface Campaign {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: CampaignStatus;
  endDate: string;
  created_at?: string | null;
  updated_at?: string | null;
}

// Requests
export type AddCampaignRequest = z.infer<typeof addCampaignSchema>;
export type EditCampaignRequest = z.infer<typeof editCampaignSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;

// Responses
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type AddCampaignResponse = ApiSuccess<Campaign> | ApiError;
export type ListCampaignsResponse =
  | ApiSuccess<{ items: Campaign[]; nextCursor?: string }>
  | ApiError;
export type RemoveCampaignResponse = ApiSuccess<{ id: string }> | ApiError;
export type EditCampaignResponse = ApiSuccess<Campaign> | ApiError;
