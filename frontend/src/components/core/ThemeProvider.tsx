"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeAlocator>{children}</ThemeAlocator>
    </NextThemesProvider>
  );
}

function ThemeAlocator({ children }: { children?: React.ReactNode }) {
  "use client";
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme && theme !== "system") return;

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    )
      setTheme("dark");
    else setTheme("light");
  }, [theme]);
  return <>{children}</>;
}
