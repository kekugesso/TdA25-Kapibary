import { GameHistory } from "@/types/auth/user";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/core/Popover";
import { PopoverArrow } from "@radix-ui/react-popover";
import { MouseEventHandler, ReactNode, useState } from "react";

export default function GraphPopover({
  game,
  children,
}: {
  game: GameHistory;
  children: (
    showAction: MouseEventHandler<SVGCircleElement>,
    hideAction: MouseEventHandler<SVGCircleElement>,
  ) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  };

  return (
    <Popover open={open}>
      <PopoverTrigger asChild>
        {children(
          () => setOpen(true),
          () => setOpen(false),
        )}
      </PopoverTrigger>
      <PopoverContent
        className="bg-black text-white p-2 rounded-md border-0 outline-none text-center"
        side="top"
        sideOffset={10}
      >
        <p>Elo: {game.elo}</p>
        <p>{formatDate(game.createdAt)}</p>
        <PopoverArrow />
      </PopoverContent>
    </Popover>
  );
}
