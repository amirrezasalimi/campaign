export enum CampaignStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  COMPLETED = "completed",
}
export default interface Campaign {
  id?: string;
  title: string;
  description: string;
  reward: number;
  status: CampaignStatus;
  endDate: string;
  created_at?: string | null;
  updated_at?: string | null;
}
