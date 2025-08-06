"use client";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        {children}
        <ToastProvider />
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
