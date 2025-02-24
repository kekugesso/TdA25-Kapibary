"use client";

import { useAuth } from "@/components/core/AuthProvider";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import Loading from "@/components/core/Loading";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";
import { UserSettings, UserSettingsError } from "@/types/auth/user";
import { useMutation } from "@tanstack/react-query";
import { getCookie } from "cookies-next/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfileSettings() {
  const { user, loading } = useAuth();
  const { displayError, displayMessage } = useErrorModal();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>({});
  const [settingsError, setSettingsError] = useState<UserSettingsError | null>(
    null,
  );

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
  }, [user, router, loading]);

  const saveChangesMutation = useMutation({
    mutationFn: async (data: UserSettings) => {
      const response = await fetch(`/api/users/${user?.uuid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${getCookie("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message);
      }
    },
    onError: (error) => {
      displayError(error as Error, {
        defaultMessage: "Failed to save changes",
      });
    },
    onSuccess: () => {
      router.push("/profile");
    },
  });

  const Validation = (settings: UserSettings): UserSettingsError | void => {
    // if (settings?.username)
    //   return { username: ["Uživatelské jméno je povinné"] };
    // if (!settings.password)
    //   return { password: ["Uživatelské jméno je povinné"] };
    //
    // // password validation
    // if (settings.password.length < 8)
    //   return { password: ["Heslo musí mít alespoň 8 znaků"] };
    // if (!settings.password.match(/[0-9]/))
    //   return { password: ["Heslo musí obsahovat alespoň jedno číslo"] };
    // if (!settings.password.match(/[a-z]/))
    //   return { password: ["Heslo musí obsahovat alespoň jedno malé písmeno"] };
    // if (!settings.password.match(/[A-Z]/))
    //   return { password: ["Heslo musí obsahovat alespoň jedno velké písmeno"] };
    // if (!settings.password.match(/[^a-zA-Z0-9]/))
    //   return {
    //     password: ["Heslo musí obsahovat alespoň jeden speciální znak"],
    //   };

    return;
  };

  const saveChanges = async () => {
    const error = Validation(settings);
    if (error) {
      setSettingsError(error);
      return;
    }
    saveChangesMutation.mutate(settings);
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${user?.uuid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${getCookie("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error((await response.json()).message);
      }
    },
    onError: (error) => {
      displayError(error as Error, {
        defaultMessage: "Failed to delete account",
      });
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  const handleSettingsChange = (key: keyof UserSettings, value: string) => {
    // handle delete of key
    // @ts-expect-error - TS doesn't know that key is a valid key of UserSettings
    if (value === "" || value === user?.[key]) {
      setSettings((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
      return;
    }
    // handle change of key
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const [isDraging, setIsDraging] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const handleDrag = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLoadingAvatar(true);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
      setLoadingAvatar(false);
      setIsDraging(false);
      return;
    }

    const url = e.dataTransfer.getData("text/uri-list");

    if (!/\.(png|jpe?g|gif|webp)$/i.test(url)) {
      displayMessage("Can't find image extention in URL");
      console.error("Can't find image extention in URL");
      setLoadingAvatar(false);
      setIsDraging(false);
      return;
    }

    // If we got a URL, fetch the image and convert it to a Data URI.
    if (url) {
      try {
        const response = await fetch(url, {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        });
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = () => {
          const dataurl = reader.result;
          if (typeof dataurl !== "string") {
            displayMessage("Couldn't convert image to dataurl");
            console.error("Couldn't convert image to dataurl");
            setLoadingAvatar(false);
            return;
          }
          if (dataurl.split(";")[0].split(":")[1].split("/")[0] !== "image") {
            displayMessage("Invalid image format");
            console.error("Invalid image format");
            setLoadingAvatar(false);
            return;
          }
          setSettings((prev) => ({ ...prev, avatar: dataurl }));
        };
        reader.readAsDataURL(blob);
        setLoadingAvatar(false);
        setIsDraging(false);
        return;
      } catch (error) {
        displayMessage(`Error fetching image from URL: ${error}`);
        console.error("Error fetching image from URL", error);
        setIsDraging(false);
        setLoadingAvatar(false);
        return;
      }
    }

    displayMessage("No file dropped");
    console.error("No file dropped");
    setLoadingAvatar(false);
    setIsDraging(false);
    return;
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoadingAvatar(true);

    if (!e.target.files || !e.target.files[0]) {
      displayMessage("No file selected");
      console.error("No file selected");
      setLoadingAvatar(false);
      return;
    }

    handleFile(e.target.files[0]);

    setIsDraging(false);
  };

  const handleFile = (file: File) => {
    setLoadingAvatar(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataurl = reader.result;
      if (typeof dataurl !== "string") {
        displayMessage("Couldn't convert image to dataurl");
        console.error("Couldn't convert image to dataurl");
        setLoadingAvatar(false);
        return;
      }
      setSettings((prev) => ({ ...prev, avatar: dataurl }));
    };
    reader.readAsDataURL(file);

    setLoadingAvatar(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraging(false);
  };

  return loading || saveChangesMutation.isPending ? (
    <Loading />
  ) : (
    <article
      className="flex flex-col items-center justify-center space-y-4 w-full h-full p-4"
      onDrop={handleDrag}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col flex-center sm:flex-row space-y-4 w-full">
        <div className="relative min-w-[250px] min-h-[250px] w-[250px] h-[250px] flex flex-center cursor-pointer">
          <Image
            src={settings?.avatar || /* user?.avatar || */ "/img/bulb.svg"}
            alt="Profile"
            width="64"
            height="64"
            className="w-full h-full rounded-lg bg-gray-100 dark:bg-white-dark object-cover"
            onClick={() => setIsDraging(true)}
          />
          <Image
            src={"/img/edit_icon.svg"}
            alt="Edit Profile"
            width="16"
            height="16"
            className="absolute top-1 right-1 invert dark:invert-0"
            onClick={() => setIsDraging(true)}
          />
        </div>
        <div className="flex flex-col space-y-2 w-[50%] ml-5">
          <div className="flex flex-col space-y-2 w-full">
            <label htmlFor="username">Uživatelské jméno</label>
            <input
              type="text"
              id="username"
              value={settings?.username || user?.username || ""}
              onChange={(e) => handleSettingsChange("username", e.target.value)}
              className="w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none focus:ring-1 focus:ring-blue-light"
            />
            <div className="text-red-500 text-sm">
              {settingsError?.username || " "}
            </div>
          </div>
          <div className="flex flex-col space-y-2 w-full">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={settings?.email || user?.email || ""}
              onChange={(e) => handleSettingsChange("email", e.target.value)}
              className="w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none focus:ring-1 focus:ring-blue-light"
            />
            <div className="text-red-500 text-sm">
              {settingsError?.email || " "}
            </div>
          </div>
          <div className="flex flex-col space-y-2 w-full">
            <label htmlFor="password">Heslo</label>
            <input
              type="password"
              id="password"
              value={settings?.password || ""}
              onChange={(e) => handleSettingsChange("password", e.target.value)}
              className="w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none focus:ring-1 focus:ring-blue-light"
            />
            <div className="text-red-500 text-sm">
              {settingsError?.password || " "}
            </div>
          </div>
        </div>
      </div>
      <button
        className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
        onClick={() => deleteAccountMutation.mutate()}
      >
        Smazat účet
      </button>

      <button
        className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
        onClick={saveChanges}
      >
        Uložit
      </button>
      <button
        className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
        onClick={() => router.push("/profile")}
      >
        Neukládat
      </button>

      {isDraging && (
        <Modal open onClose={() => setIsDraging(false)}>
          <ModalHeader>
            <div className="text-2xl">Nahrání obrázku</div>
          </ModalHeader>
          <ModalBody className="flex flex-center h-full">
            {loadingAvatar ? (
              <Loading height="min-h-full" />
            ) : (
              <>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileInput}
                  onDrop={handleDrag}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-full p-4 rounded-lg border border-dashed border-black-light dark:border-white dark:bg-black-light bg-white text-black-light dark:text-white cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  Nahrajte obrázek přetáhnutím nebo klikněte.
                </label>
              </>
            )}
          </ModalBody>
          <ModalFooter className="mt-2 flex flex-center">
            <button
              className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 px-5 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
              onClick={() => (setIsDraging(false), setLoadingAvatar(false))}
            >
              Zrušit
            </button>
          </ModalFooter>
        </Modal>
      )}
    </article>
  );
}
