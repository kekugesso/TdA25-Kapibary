import { BoardType } from "@/types/board/BoardType";
// BoardType is string[][]

export default function GetWinningBoard(
  board: BoardType,
  winning: number,
  turn: "X" | "O",
): BoardType | null {
  // check if the board has 'winning' number of 'X' or 'O' in a row
  // if it does it adds 'w' at the end of the position and returns the board
  // else return null

  const HorizontalWin = (shiftRow: number, shiftCol: number) => {
    for (let k = 0; k < winning; k++) {
      board[shiftRow][shiftCol - k] += "w";
    }
    return board;
  };

  const VerticalWin = (shiftRow: number, shiftCol: number) => {
    for (let k = 0; k < winning; k++) {
      board[shiftRow - k][shiftCol] += "w";
    }
    return board;
  };

  const DiagonalWin = (shiftRow: number, shiftCol: number) => {
    for (let k = 0; k < winning; k++) {
      board[shiftRow - k][shiftCol - k] += "w";
    }
    return board;
  };

  const AntiDiagonalWin = (shiftRow: number, shiftCol: number) => {
    for (let k = 0; k < winning; k++) {
      board[shiftRow - k][shiftCol + k] += "w";
    }
    return board;
  };

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      let countHorizontal = 0;
      let countVertical = 0;
      let countDiagonal = 0;
      let countAntiDiagonal = 0;

      // Horizontal Check
      for (let k = 0; k < winning && col + k < board[row].length; k++) {
        if (board[row][col + k] === turn) countHorizontal++;
        else break;
      }
      if (countHorizontal === winning)
        return HorizontalWin(row, col + winning - 1);

      // Vertical Check
      for (let k = 0; k < winning && row + k < board.length; k++) {
        if (board[row + k][col] === turn) countVertical++;
        else break;
      }
      if (countVertical === winning) return VerticalWin(row + winning - 1, col);

      // Diagonal Check
      for (
        let k = 0;
        k < winning && row + k < board.length && col + k < board[row].length;
        k++
      ) {
        if (board[row + k][col + k] === turn) countDiagonal++;
        else break;
      }
      if (countDiagonal === winning)
        return DiagonalWin(row + winning - 1, col + winning - 1);

      // Anti-Diagonal Check
      for (
        let k = 0;
        k < winning && row + k < board.length && col - k >= 0;
        k++
      ) {
        if (board[row + k][col - k] === turn) countAntiDiagonal++;
        else break;
      }
      if (countAntiDiagonal === winning)
        return AntiDiagonalWin(row + winning - 1, col - winning + 1);
    }
  }

  return null;
}
