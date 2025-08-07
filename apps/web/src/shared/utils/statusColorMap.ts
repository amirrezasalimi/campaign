import { CampaignStatus } from "@/shared/types/campaign/campaign";

export type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

// Centralized mapping for campaign status to Chip color
export const statusColorMap: Record<CampaignStatus, ChipColor> = {
  [CampaignStatus.ACTIVE]: "success",
  [CampaignStatus.INACTIVE]: "default",
  [CampaignStatus.COMPLETED]: "secondary",
};
