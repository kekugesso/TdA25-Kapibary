"use client";

import Navbar from "@/components/core/Navbar";
import Footer from "@/components/core/Footer";

export default function PageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <main className="wrapper">
        <Navbar />
        {children}
      </main>
      <Footer />
    </>
  );
}
