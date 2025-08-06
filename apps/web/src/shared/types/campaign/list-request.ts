import type { CampaignStatus } from "./campaign";

export enum CampaignSortFields {
  CREATED_AT = "created_at",
  END_DATE = "endDate",
  REWARD = "reward",
  TITLE = "title",
  STATUS = "status",
}
export default interface CampaignListRequest {
  title?: string;
  sort_key?: string;
  sort_type?: "asc" | "desc";
  status?: CampaignStatus;

  page?: number;
  take?: number;
}
