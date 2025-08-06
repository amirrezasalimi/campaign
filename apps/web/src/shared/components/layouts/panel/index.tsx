"use client";

import Link from "next/link";
import LINKS from "../../../constants/links";
import { usePathname } from "next/navigation";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  useDisclosure,
} from "@heroui/react";
import { useEffect } from "react";

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
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  // Close mobile drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  const isActive = (href?: string) => {
    if (!href) return false;
    // Exact match first
    if (pathname === href) return true;
    // handle sub-paths
    try {
      const url = new URL(
        href,
        typeof window !== "undefined"
          ? window.location.origin
          : "https://localhost"
      );
      const path = url.pathname;
      // Check if the current pathname starts with the href path
      if (pathname.startsWith(path)) return true;
    } catch {}
    return false;
  };

  const MenuList = () => (
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
  );

  return (
    <div className="bg-gray-50 w-full min-h-screen">
      {/* Mobile top bar */}
      <div className="md:hidden top-0 z-40 sticky bg-white border-neutral-200 border-b">
        <div className="flex justify-between items-center px-4 py-3">
          <Button
            aria-label="Open menu"
            size="sm"
            variant="light"
            onPress={onOpen}
            className="p-2 min-w-0"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 7h16M4 12h16M4 17h16"
              />
            </svg>
          </Button>
          <Link href={LINKS.PANEL}>
            <h1 className="font-semibold text-base">Panel</h1>
          </Link>
          <span className="w-8" />
        </div>
      </div>

      <div className="flex w-full min-h-[calc(100vh-0px)]">
        {/* Desktop sidebar */}
        <aside className="hidden md:block bg-white border-neutral-300 border-r w-64 shrink-0">
          <div className="p-4 border-neutral-300 border-b">
            <Link href={LINKS.PANEL}>
              <h1 className="font-semibold text-lg">Panel</h1>
            </Link>
          </div>
          <nav className="p-2">
            <MenuList />
          </nav>
        </aside>

        {/* Mobile Drawer */}
        <Drawer
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          placement="left"
          size="xs"
        >
          <DrawerContent className="max-w-72">
            {(close) => (
              <>
                <DrawerHeader className="flex justify-between items-center">
                  <span className="font-semibold">Panel</span>
                </DrawerHeader>
                <DrawerBody className="p-2">
                  <MenuList />
                </DrawerBody>
                <DrawerFooter className="pt-0">
                  <Button variant="light" onPress={close}>
                    Close
                  </Button>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </Drawer>

        {/* content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
