"use client";

import LINKS from "@/shared/constants/links";
import { redirect } from "next/navigation";

export default function Home() {
  redirect(LINKS.PANEL);
  return (
    <div className="mx-auto px-4 py-2 max-w-3xl container">
      Redirect to panel....
    </div>
  );
}
