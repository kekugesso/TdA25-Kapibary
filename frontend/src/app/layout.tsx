import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/core/Providers";
import PageLayout from "@/components/core/PageLayout";
import LocalStorageManager from "@/components/core/LocalStorageManager";

export const metadata: Metadata = {
  title: "Think different accademy",
  description: "A tic-tac-toe game website of Think different accademy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cz" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-white dark:bg-black-dark text-black dark:text-white">
        <Providers>
          <PageLayout>{children}</PageLayout>
        </Providers>
        <LocalStorageManager />
      </body>
    </html>
  );
}
