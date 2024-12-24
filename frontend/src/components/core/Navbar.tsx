"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeSwitch from "@/components/core/ThemeSwitch";

interface NavbarItem {
  id: string;
  label: string;
  href: string;
}

export default function Navbar() {
  const path = usePathname();
  const isCurrent = (href: string) => path === href;

  const Items: NavbarItem[] = [
    {
      id: "about",
      label: "O nás",
      href: "/#about-us",
    },
    {
      id: "new-game",
      label: "Nová hra",
      href: "/new-game",
    },
    {
      id: "games",
      label: "Seznam her",
      href: "/games",
    },
  ];

  return (
    <nav className="flex justify-evenly items-center text-white bg-blue-light dark:bg-blue-dark">
      <Link href="/" className="flex items-center justify-center">
        <Image
          src={"logo.svg"}
          alt="Think diffrent academy"
          height={50}
          width={250}
        />
      </Link>
      <div className="w-[20%]"></div>
      {Items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`text-lg font-semibold hover:text-gray-300 hover:scale-105 ease-in-out hover:delay-300 ${
            isCurrent(item.href) ? "text-gray-300" : ""
          }`}
        >
          {item.label}
        </Link>
      ))}
      <ThemeSwitch className="py-1 md:py-2" />
    </nav>
  );
}
