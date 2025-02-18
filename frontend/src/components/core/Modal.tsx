import React, { ReactNode, useRef } from "react";

interface ModalProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  ignoreBackdropClick?: boolean;
}

export function Modal({
  children,
  open,
  onClose,
  ignoreBackdropClick,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (
      dialogRef.current &&
      event.target === dialogRef.current &&
      !ignoreBackdropClick
    )
      onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="flex w-[100vw] h-[100dvh] inset-0 bg-transparent z-40 flex-center"
      open={open}
      onClick={handleBackdropClick}
    >
      <div className="flex flex-col justify-between bg-white dark:bg-black-dark rounded-lg shadow-black shadow-lg w-96 h-72 max-w-lg p-6 relative z-50">
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
  className?: string;
}

export function ModalHeader({
  children,
  className = "pb-4",
}: ModalSectionProps) {
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold">{children}</h2>
    </div>
  );
}

export function ModalBody({ children, className = "py-4" }: ModalSectionProps) {
  return <div className={className}>{children}</div>;
}

export function ModalFooter({
  children,
  className = "flex flex-center",
}: ModalSectionProps) {
  return <div className={className}>{children}</div>;
}
