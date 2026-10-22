"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // ۱ دقیقه کش پیش‌فرض
            gcTime: 10 * 60 * 1000, // ۱۰ دقیقه حفظ داده در حافظه
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        dir="rtl"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: "var(--font-vazirmatn), Vazirmatn, sans-serif",
            borderRadius: "0.75rem",
          },
        }}
      />
    </QueryClientProvider>
  );
}
