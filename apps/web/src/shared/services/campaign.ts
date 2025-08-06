import type ApiResponse from "../types/api-response";
import type Campaign from "../types/campaign/campaign";
import type CampaignListResponse from "../types/campaign/list-response";
import API from "../utils/api";
import makeUrl from "../utils/make_url";
const PREFIX = "/campaigns";
const PATHS = {
  GET: `${PREFIX}/{id}`,
  LIST: `${PREFIX}/list`,
  ADD: `${PREFIX}/add`,
  EDIT: `${PREFIX}/{id}`,
  DELETE: `${PREFIX}/{id}`,
};
class CampaignServices {
  list = () => API.get<ApiResponse<CampaignListResponse>>(PATHS.LIST);
  get = (id: string) =>
    API.get<ApiResponse<Campaign>>(makeUrl(PATHS.GET, { id }));
  add = (data: Campaign) => API.post<ApiResponse<Campaign>>(PATHS.ADD, data);
  edit = (id: string, data: Campaign) =>
    API.patch<ApiResponse<Campaign>>(makeUrl(PATHS.EDIT, { id }), data);
  delete = (id: string) =>
    API.delete<ApiResponse<{ id: string }>>(makeUrl(PATHS.DELETE, { id }));
}

export default new CampaignServices();
