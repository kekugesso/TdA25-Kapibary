"use client";

import { useState } from "react";
import { ThemeProvider } from "@/components/core/ThemeProvider";
import { AuthProvider } from "@/components/core/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
