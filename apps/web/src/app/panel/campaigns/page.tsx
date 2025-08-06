"use client";
import React, { Suspense } from "react";
import Campaigns from "@/shared/pages/panel/campaigns";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Campaigns />
    </Suspense>
  );
}
