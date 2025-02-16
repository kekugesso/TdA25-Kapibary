"use client";

import { useAuth } from "@/components/core/AuthProvider";
import Loading from "@/components/core/Loading";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";

export default function Logout() {
  const { logout } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);

  const handleClose = () => {
    setError(null);
    router.back();
  };

  useEffect(() => {
    const handleLogout = async () => {
      const error = await logout();
      if (error) setError(error);
      router.push("/");
    };

    handleLogout();
  }, [logout, router]);

  return (
    <>
      <Loading />
      {error && (
        <Modal open={true} onClose={handleClose}>
          <ModalHeader>Error</ModalHeader>
          <ModalBody>
            <p className="text-center text-balance font-medium">
              {error.message || "An error ocured while logging out"}
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={handleClose}
              className="bg-blue-light dark:bg-blue-dark text-white dark:text-black font-semibold rounded-lg py-2 px-6"
            >
              Go back
            </button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
