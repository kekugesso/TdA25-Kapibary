"use client";
import { PopoverArrow } from "@radix-ui/react-popover";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import ThemeSwitch from "./ThemeSwitch";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import Loading from "./Loading";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function UserButton({ center }: { center: boolean }) {
  const { user, isLogged, loading } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <Popover open={open} onOpenChange={(open) => setOpen(open)}>
      <PopoverTrigger asChild>
        <button className="flex">
          <Image
            src="/img/user.svg"
            alt="User"
            width="24"
            height="24"
            className="rounded-full invert mr-1"
            loading="eager"
          />
          {user && isLogged ? user.username : "Anonymus"}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={center ? "center" : "end"}
        side="bottom"
        className="bg-white border border-black-light dark:bg-black-light p-2 rounded-md text-center z-40"
      >
        <div className="flex flex-col space-y-3 text-lg">
          {loading ? (
            <Loading height="h-8" />
          ) : isLogged ? (
            <>
              <Link href="/profile">Uživatelský profil</Link>
              <Link
                href="/logout"
                className="flex text-red-light dark:text-red-dark flex-center"
              >
                <div
                  className="w-[18px] h-[18px] bg-red-light dark:bg-red-dark mr-1"
                  style={{
                    WebkitMaskImage: "url(/img/logout.svg)",
                    WebkitMaskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                  }}
                ></div>
                Odhlásit se
              </Link>
            </>
          ) : (
            <Link href="/login">Přihlášení</Link>
          )}
          <ThemeSwitch />
        </div>
        <PopoverArrow />
      </PopoverContent>
    </Popover>
  );
}
