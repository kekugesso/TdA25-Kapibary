"use client";

import {
  ReactNode,
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";
import { usePathname, useRouter } from "next/navigation";

export interface ErrorModalOptions {
  overrideButtonMessage?: string;
  disableDefaultButtonAction?: boolean;
  onClose?: (error: Error) => void;
  defaultMessage?: string;
}

export interface ErrorModalContextType {
  error: Error | null;
  isError: boolean;
  displayError: (error: Error, options?: ErrorModalOptions) => void;
  displayMessage: (message: string, options?: ErrorModalOptions) => void;
  forceClose: () => void;
}

const ErrorModalContext = createContext<ErrorModalContextType | null>(null);

export const ErrorModalProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<Error | null>(null);
  const [options, setOptions] = useState<ErrorModalOptions | null>(null);
  const router = useRouter();
  const path = usePathname();

  // Reset error and options when path changes
  useEffect(() => (setError(null), setOptions(null)), [path]);

  const handleClose = () => {
    setError(null);
    if (options) {
      if (options.onClose) options.onClose(error as Error);
      if (!options.disableDefaultButtonAction) router.back();
      setOptions(null);
    }
  };

  const displayError = (error: Error, options?: ErrorModalOptions) => {
    if (error) setError(error);
    if (options) setOptions(options);
    if (!error && options?.defaultMessage)
      setError(new Error(options.defaultMessage));
  };

  const displayMessage = (message: string, options?: ErrorModalOptions) => {
    setError(new Error(message));
    if (options) setOptions(options);
    if (!error && options?.defaultMessage)
      setError(new Error(options.defaultMessage));
  };

  return (
    <ErrorModalContext.Provider
      value={{
        error,
        isError: !!error,
        displayError,
        displayMessage,
        forceClose: () => (setError(null), setOptions(null)),
      }}
    >
      {children}
      {error && (
        <Modal open={true} onClose={handleClose}>
          <ModalHeader>Error</ModalHeader>
          <ModalBody>
            <p className="text-center text-balance font-medium">
              {error.message || "An 'unknown' error occurred."}
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={handleClose}
              className="bg-blue-light dark:bg-blue-dark text-white dark:text-black font-semibold rounded-lg py-2 px-6"
            >
              {options?.overrideButtonMessage || "Go back"}
            </button>
          </ModalFooter>
        </Modal>
      )}
    </ErrorModalContext.Provider>
  );
};

export const useErrorModal = (): ErrorModalContextType => {
  const context = useContext(ErrorModalContext);
  if (!context) {
    throw new Error("useErrorModal must be used within an ErrorModalProvider");
  }
  return context;
};
