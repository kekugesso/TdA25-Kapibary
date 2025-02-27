"use client";

import React, { createContext, useContext, useState } from "react";
import BanModal from "./BanModal";
import ChangeEloModal from "./ChangeEloModal";

export interface AdminManagerContextProps {
  isLoading: boolean;
  ban: (username: string, uuid: string) => void;
  changeElo: (username: string, uuid: string, elo: number) => void;
}

const AdminManagerContext = createContext<AdminManagerContextProps | null>(
  null,
);

export function AdminManager({
  children,
  banAction,
  changeEloAction,
}: {
  children: React.ReactNode;
  banAction: (uuid: string) => void;
  changeEloAction: (uuid: string, elo: number) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isBanModalOpen, setBanModalOpen] = useState(false);
  const [isEloModalOpen, setEloModalOpen] = useState(false);
  const [targetUuid, setTargetUuid] = useState<string | null>(null);
  const [targetUsername, setTargetUsername] = useState<string | null>(null);
  const [targetElo, setTargetElo] = useState<number | null>(null);

  const openBanModal = (username: string, uuid: string) => {
    setTargetUuid(uuid);
    setTargetUsername(username);
    setBanModalOpen(true);
  };

  const closeBanModal = () => {
    setTargetUuid(null);
    setBanModalOpen(false);
  };

  const openEloModal = (username: string, uuid: string, elo: number) => {
    setTargetUuid(uuid);
    setTargetUsername(username);
    setTargetElo(elo);
    setEloModalOpen(true);
  };

  const closeEloModal = () => {
    setTargetUuid(null);
    setEloModalOpen(false);
  };

  const ban = (uuid: string) => {
    setIsLoading(true);
    try {
      banAction(uuid);
      console.log("Ban action executed:", uuid);
    } finally {
      setIsLoading(false);
      closeBanModal();
    }
  };

  const changeElo = (uuid: string, elo: number) => {
    setIsLoading(true);
    try {
      changeEloAction(uuid, elo);
      console.log("Change Elo action executed:", uuid, elo);
    } finally {
      setIsLoading(false);
      closeEloModal();
    }
  };

  return (
    <AdminManagerContext.Provider
      value={{ isLoading, ban: openBanModal, changeElo: openEloModal }}
    >
      {children}
      {isBanModalOpen && targetUuid && targetUsername && (
        <BanModal
          username={targetUsername}
          onConfirm={() => ban(targetUuid)}
          onCancel={closeBanModal}
        />
      )}
      {isEloModalOpen && targetUuid && targetUsername && targetElo && (
        <ChangeEloModal
          username={targetUsername}
          elo={targetElo}
          onConfirm={(elo: number) => changeElo(targetUuid, elo)}
          onCancel={closeEloModal}
        />
      )}
    </AdminManagerContext.Provider>
  );
}

export function useAdminManager() {
  const context = useContext(AdminManagerContext);
  if (!context)
    throw new Error("useAdminManager must be used within an AdminManager");
  return context;
}
