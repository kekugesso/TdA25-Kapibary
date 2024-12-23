"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <main className="wrapper">
        <header>
          <Navbar />
        </header>
        {children}
      </main>
      <Footer />
    </>
  );
}
