import React, { useState } from "react";
import { Popover } from "react-tiny-popover";

const TopPopover = ({
  children,
  content,
  disabled = false,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      isOpen={isOpen}
      positions="top" // Position: top, left, right, or bottom
      content={
        <div
          className={`bg-white text-gray-700 text-sm px-4 py-2 rounded-md shadow-lg border border-gray-300 ${disabled ? "hidden" : ""}`}
        >
          {content}
        </div>
      }
      onClickOutside={() => setIsOpen(false)}
    >
      <div
        onMouseLeave={() => setIsOpen(!isOpen)}
        onMouseOver={() => setIsOpen(!isOpen)}
      >
        {children}
      </div>
    </Popover>
  );
};

export default TopPopover;
