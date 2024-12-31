type BoardProps = {
  board: string[][];
  handleClick: (x: number, y: number) => void;
  buttonClass?: string;
};

// When adding support for different board sizes, add the size for tailwind to generate the classes
const generate_classes = [
  "[--board-size:5]",
  "[--board-size:10]",
  "[--board-size:15]",
];

export default function Board({
  board,
  handleClick,
  buttonClass = "[--size:calc(99vmin/var(--board-size))] sm:[--size:5vmin] w-[--size] h-[--size]",
}: BoardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border-white border overflow-hidden">
      {board.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <button
              key={x}
              data-position={`${y},${x}`}
              className={`${buttonClass} border-white ${(x + y) % 2 == 0 ? "bg-black" : ""} ${x != row.length - 1 ? "border-r" : ""} ${y != board.length - 1 ? "border-b" : ""} [--board-size:${board.length}]`}
              onClick={() => handleClick(x, y)}
            >
              {cell}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
