"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeSwitch from "@/components/ThemeSwitch";

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
      href: "/about",
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
    <nav className="pb-4 md:pb-8 flex justify-between items-center">
      <Link href="/" className="flex items-center justify-center">
        <Image
          src={"logo.svg"}
          alt="Think diffrent academy"
          height={50}
          width={100}
        />
      </Link>
      {Items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`text-lg font-semibold text-gray-800 hover:text-gray-900 ${
            isCurrent(item.href) ? "text-gray-900" : ""
          }`}
        >
          {item.label}
        </Link>
      ))}
      <ThemeSwitch />
    </nav>
  );
}
