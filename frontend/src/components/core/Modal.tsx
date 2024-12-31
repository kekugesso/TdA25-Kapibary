import React, { ReactNode, useRef } from "react";

interface ModalProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}

export function Modal({ children, open, onClose }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (dialogRef.current && event.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 flex items-center justify-center bg-transparent"
      open={open}
      onClick={handleBackdropClick}
    >
      <div className="flex flex-col justify-between bg-white dark:bg-black-dark rounded-lg shadow-black shadow-lg w-96 h-72 max-w-lg p-6 relative">
        {children}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </dialog>
  );
}

interface ModalSectionProps {
  children: ReactNode;
}

export function ModalHeader({ children }: ModalSectionProps) {
  return (
    <div className="pb-4">
      <h2 className="text-xl font-semibold">{children}</h2>
    </div>
  );
}

export function ModalBody({ children }: ModalSectionProps) {
  return <div className="py-4">{children}</div>;
}

export function ModalFooter({ children }: ModalSectionProps) {
  return <div className="flex flex-center">{children}</div>;
}
