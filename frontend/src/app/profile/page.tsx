"use client";

import { useAuth } from "@/components/core/AuthProvider";
import Loading from "@/components/core/Loading";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ignore, setIgnore] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (ignore) return;
    setIgnore(true);
    if (!user) router.push("/login");
    else router.push(`/profile/${user.uuid}`);
  }, [user, router, ignore, loading]);

  return <Loading />;
}
