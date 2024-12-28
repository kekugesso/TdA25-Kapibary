type BoardProps = {
  board: string[][];
  handleClick: (x: number, y: number) => void;
  buttonClass?: string;
};

export default function Board({
  board,
  handleClick,
  buttonClass = "w-16 h-16 border border-black",
}: BoardProps) {
  return (
    <div className="flex flex-col items-center">
      {board.map((row, y) => (
        <div key={y} className="flex">
          {row.map((cell, x) => (
            <button
              key={x}
              className={`${buttonClass} ${x % 2 == 0 && "bg-black"}`}
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
