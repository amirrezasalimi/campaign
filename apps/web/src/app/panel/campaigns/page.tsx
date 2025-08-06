"use client";
import React, { Suspense } from "react";
import Campaigns from "@/modules/campaigns";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Campaigns />
    </Suspense>
  );
}
