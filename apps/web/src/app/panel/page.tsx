import LINKS from "@/shared/constants/links";
import { redirect } from "next/navigation";

export default function Page() {
  return redirect(LINKS.CAMPAIGN_LIST);
}
