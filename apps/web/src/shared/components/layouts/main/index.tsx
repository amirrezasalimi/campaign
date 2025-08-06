import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Geist } from "next/font/google";

const queryClient = new QueryClient();

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>{children}</HeroUIProvider>;
    </QueryClientProvider>
  );
}
