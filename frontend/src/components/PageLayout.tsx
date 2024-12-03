"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
    <div className="wrapper">
      <Navbar />
      <main className="container mx-auto px-4">
        {children}
      </main>
    </div>
    <Footer />
    </>
  )
}
