import type Campaign from "./campaign";

export default interface CampaignListResponse {
  items: Campaign[];
  total_pages: number;
}
