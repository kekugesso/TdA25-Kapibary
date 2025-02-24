"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import UserButton from "./UserButton";

interface NavbarItem {
  id: string;
  label: string;
  href: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const path = usePathname();
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleResize = () => window.innerWidth >= 640 && setIsOpen(false);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [path]);

  const NavLinks = () => {
    const path = usePathname();
    const isCurrent = (href: string) => path === href;

    const Items: NavbarItem[] = [
      {
        id: "about",
        label: "O nás",
        href: "/#about-us",
      },
      {
        id: "multiplayer",
        label: "Multiplayer",
        href: "/multiplayer",
      },
      {
        id: "games",
        label: "Seznam her",
        href: "/games",
      },
    ];

    return (
      <>
        {Items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`text-lg font-semibold hover:text-gray-300 hover:scale-105 ease-in-out transition-all ${
              isCurrent(item.href) && "text-gray-300"
            }`}
            onClick={() => setIsOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <UserButton center={isOpen} />
      </>
    );
  };

  return (
    <header className="flex justify-between items-center text-white bg-blue-light dark:bg-blue-dark px-5 p-1">
      <Link href="/" className="flex items-center justify-center">
        <Image
          src="/img/logo_white_full.svg"
          alt="Think diffrent academy"
          loading="eager"
          height={50}
          width={165}
          className="flex items-center"
        />
      </Link>
      <nav className="hidden sm:flex flex-row space-x-3 md:space-x-5 items-center w-fit">
        <NavLinks />
      </nav>
      <button
        aria-label="Toggle Menu"
        onClick={toggleSidebar}
        className={`sm:hidden z-50 flex flex-col group justify-between cursor-pointer h-[20px] items-center transition-all duration-300 ${isOpen ? "fixed right-[2%] hover:scale-110" : "mx-2 hover:scale-105 hover:gap-1"}`}
      >
        <div
          className={`bg-white rounded transform transition-all duration-300 h-1 w-8 ${isOpen ? "translate-y-[8px] rotate-45" : "group-hover:scale-105"}`}
        />
        <div
          className={`bg-white rounded transition-all duration-300 h-1 ${isOpen ? "opacity-0" : "w-8 group-hover:w-6"}`}
        />
        <div
          className={`bg-white rounded transform transition-all duration-300 h-1 w-8 ${isOpen ? "-translate-y-[8px] -rotate-45" : "group-hover:scale-105"}`}
        />
      </button>
      {isOpen && (
        <div
          className="fixed left-0 top-0 h-[100dvh] w-[100vw] z-30"
          onClick={toggleSidebar}
        />
      )}
      <div
        className={`${isOpen ? "translate-x-0" : "translate-x-full"} fixed sm:hidden right-0 top-0 bg-black opacity-75 h-full z-40 w-[70vw] transition-transform`}
      >
        <nav className="mt-[calc(var(--navbar-height)/1.5)] sm:hidden flex flex-col space-y-3 opacity-100 flex-center">
          <NavLinks />
        </nav>
      </div>
    </header>
  );
}
