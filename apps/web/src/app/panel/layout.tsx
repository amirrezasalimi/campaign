"use client";
import PanelLayout from "@/shared/components/layouts/panel";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PanelLayout>{children}</PanelLayout>;
}
