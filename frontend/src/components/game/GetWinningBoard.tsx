import { BoardType } from "@/types/board/BoardType";
import { GameData } from "@/types/games/GameData";

export default function GetWinningBoard(
  board: BoardType,
  winning: number,
): BoardType | null {
  // check if the board has 'winning' number of 'X' or 'O' in a row
  // if it does it adds 'w' at the end of the position and returns the board
  // else return null

  const checkHorizontal = (board: BoardType, turn: string) => {
    for (let i = 0; i < board.length; i++) {
      let count = 0;
      for (let j = 0; j < board.length; j++) {
        if (board[i][j] === turn) count++;
        else count = 0;

        if (count === winning) {
          for (let k = 0; k < winning; k++) {
            board[i][j - k] += "w";
          }
          return board;
        }
      }
    }
    return null;
  };

  const checkVertical = (board: BoardType, turn: string) => {
    for (let i = 0; i < board.length; i++) {
      let count = 0;
      for (let j = 0; j < board.length; j++) {
        if (board[j][i] === turn) count++;
        else count = 0;

        if (count === winning) {
          for (let k = 0; k < winning; k++) {
            board[j - k][i] += "w";
          }
          return board;
        }
      }
    }
    return null;
  };

  // const checkDiagonal = (board: BoardType, turn: string) => {
  //   for (let i = 0; i < board.length; i++) {
  //     let count = 0;
  //     for (let j = 0; j < board.length; j++) {
  //
  //     }
  //   }
  //   return null;
  // };
  //
  // const checkAntiDiagonal = (board: BoardType, turn: string) => {
  //   for (let i = 0; i < board.length; i++) {
  //     let count = 0;
  //     for (let j = 0; j < board.length; j++) {
  //       if (board[j][board.length - 1 - j] === turn) count++;
  //       else count = 0;
  //
  //       if (count === winning) {
  //         for (let k = 0; k < winning; k++) {
  //           board[j - k][board.length - 1 - j + k] += "w";
  //         }
  //         return board;
  //       }
  //     }
  //   }
  //   return null;
  // };

  if (board) {
    const horizontal =
      checkHorizontal(board, "X") || checkHorizontal(board, "O");
    const vertical = checkVertical(board, "X") || checkVertical(board, "O");
    // const diagonal = checkDiagonal(board, "X") || checkDiagonal(board, "O");
    // const antiDiagonal =
    //   checkAntiDiagonal(board, "X") || checkAntiDiagonal(board, "O");

    return horizontal || vertical; //|| diagonal || antiDiagonal;
  }
}
