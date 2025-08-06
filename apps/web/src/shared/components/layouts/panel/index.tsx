"use client";

import Link from "next/link";
import LINKS from "../../../constants/links";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";

type MenuItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
};

const campaignMenu: MenuItem = {
  label: "Campaign",
  children: [
    { label: "Campaigns", href: LINKS.CAMPAIGN_LIST },
    { label: "Add campaign", href: LINKS.ADD_CAMPAIGN },
  ],
};

const sidebarMenu: MenuItem[] = [campaignMenu];

export default function PanelLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href?: string) => {
    if (!href) return false;
    // Exact match first
    if (pathname === href) return true;
    // handle sub-paths
    try {
      const url = new URL(href, window.location.origin);
      const path = url.pathname;
      // Check if the current pathname starts with the href path
      if (pathname.startsWith(path)) return true;
    } catch {}
    return false;
  };

  return (
    <div className="bg-gray-50 w-full min-h-screen">
      <div className="flex w-full min-h-screen">
        {/* sidebar */}
        <aside className="bg-white border-neutral-300 border-r w-64 shrink-0">
          <div className="p-4 border-neutral-300 border-b">
            <h1 className="font-semibold text-lg">Panel</h1>
          </div>
          <nav className="p-2">
            <ul className="space-y-1">
              {sidebarMenu.map((section) => (
                <li key={section.label}>
                  <div className="px-3 py-2 font-semibold text-gray-500 text-xs uppercase">
                    {section.label}
                  </div>
                  {section.children?.length ? (
                    <ul className="flex flex-col gap-1 mb-3">
                      {section.children.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <li key={item.href}>
                            <Button
                              fullWidth
                              as={Link}
                              href={item.href}
                              size="md"
                              className="justify-start !text-left"
                              variant={active ? "solid" : "light"}
                              color={active ? "primary" : "default"}
                            >
                              {item.label}
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : section.href ? (
                    <Button
                      fullWidth
                      as={Link}
                      href={section.href}
                      size="md"
                      className="justify-start !text-left"
                    >
                      {section.label}
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
