"use client";

import { useState } from "react";
import { ThemeProvider } from "@/components/core/ThemeProvider";
import { AuthProvider } from "@/components/core/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorModalProvider } from "@/components/core/ErrorModalProvider";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorModalProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ErrorModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
