"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div className="wrapper">
        <Navbar />
        {children}
      </div>
      <Footer />
    </>
  );
}
