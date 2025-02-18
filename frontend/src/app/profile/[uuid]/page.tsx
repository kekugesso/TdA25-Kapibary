"use client";

import { useAuth } from "@/components/core/AuthProvider";
import Loading from "@/components/core/Loading";
import { User } from "@/types/auth/user";
import { useEffect, useState } from "react";

export default function Profile(uuid: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${uuid}`);
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [uuid, authUser]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        user && (
          <div>
            <h1>Profile</h1>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <p>Elo: {user.elo}</p>
          </div>
        )
      )}
    </>
  );
}
