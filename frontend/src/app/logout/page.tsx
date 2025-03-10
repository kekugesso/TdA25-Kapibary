"use client";

import { useAuth } from "@/components/core/AuthProvider";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import Loading from "@/components/core/Loading";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Logout() {
  const { logout } = useAuth();
  const router = useRouter();
  const [ignore, setIgnore] = useState(false);
  const { displayError } = useErrorModal();

  useEffect(() => {
    if (ignore) return;
    setIgnore(true);
    const handleLogout = async () => {
      const error = await logout();
      if (error)
        displayError(error, {
          onClose: () => router.push("/login"),
          disableDefaultButtonAction: true,
          overrideButtonMessage: "Back to login",
          defaultMessage: "An error ocured while logging out",
        });
    };

    handleLogout();
  }, [logout, router, ignore, displayError]);

  return <Loading />;
}
