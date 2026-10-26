"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { toast, Toaster } from "sonner";
import { ApiError } from "@/features/auth/api/auth.api";
import { SESSION_QUERY_KEY } from "@/features/auth/hooks/use-session";

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [queryClient] = useState(() => {
    let clientInstance: QueryClient;

    const handleAuthRedirect = () => {
      const isAuthPage =
        pathname?.startsWith("/login") ||
        pathname?.startsWith("/register") ||
        pathname?.startsWith("/verify-otp");

      if (!isAuthPage) {
        if (clientInstance) {
          clientInstance.removeQueries({ queryKey: SESSION_QUERY_KEY });
        }
        const nextParam = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
        router.replace(`/login${nextParam}`);
      }
    };

    clientInstance = new QueryClient({
      queryCache: new QueryCache({
        onError: (error) => {
          const status =
            (error as ApiError)?.status ??
            (error as { status?: number })?.status;

          if (status === 401) {
            handleAuthRedirect();
          }
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          const status =
            (error as ApiError)?.status ??
            (error as { status?: number })?.status;

          if (status === 401) {
            handleAuthRedirect();
            return;
          }

          if (status === 403) {
            toast.error("شما دسترسی لازم را ندارید.");
            return;
          }

          if (status === 429) {
            toast.error("تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی بعد تلاش کنید.");
            return;
          }
        },
      }),
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // ۱ دقیقه کش پیش‌فرض
          gcTime: 10 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });

    return clientInstance;
  });

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
