import { Oicon, Xicon } from "@/components/game/Icons";

type BoardProps = {
  board: string[][];
  handleClick: (x: number, y: number) => void;
  buttonClass?: string;
};

export default function Board({
  board,
  handleClick,
  buttonClass = "[--size:calc(99vmin/var(--board-size))] sm:[--size:5vmin] w-[--size] h-[--size]",
}: BoardProps) {
  return (
    <div
      className="flex flex-col items-center rounded-lg border-white border overflow-hidden"
      style={{ "--board-size": board.length } as React.CSSProperties}
    >
      {board.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <button
              key={x}
              data-position={`${y},${x}`}
              className={`${buttonClass} border-white ${(x + y) % 2 == 0 ? "bg-black" : ""} ${x != row.length - 1 ? "border-r" : ""} ${y != board.length - 1 ? "border-b" : ""} flex flex-center`}
              onClick={() => handleClick(x, y)}
            >
              {cell == "" ? (
                " "
              ) : cell[0] == "X" ? (
                <Xicon
                  turn={cell[0]}
                  width="95%"
                  height="95%"
                  {...(cell[1] == "w"
                    ? {
                        className:
                          "border border-black dark:border-white border-solid",
                      }
                    : {})}
                />
              ) : cell[0] == "O" ? (
                <Oicon
                  turn={cell[0]}
                  width="95%"
                  height="95%"
                  {...(cell[1] == "w"
                    ? {
                        className:
                          "border border-black dark:border-white border-solid",
                      }
                    : {})}
                />
              ) : (
                cell
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
