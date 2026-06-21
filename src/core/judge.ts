import { BOARD_SIZE, WIN_COUNT } from '../constants';
import { ChessColor } from '../enums';
import type { BoardMatrix, Point } from '../types';

/**
 * 胜负裁判
 * 负责落子后判定是否产生五连
 */
export class Judge {
  /** 四个方向：水平、垂直、对角线、反对角线 */
  private static readonly DIRECTIONS: [number, number][] = [
    [0, 1],  // 水平
    [1, 0],  // 垂直
    [1, 1],  // 对角线
    [1, -1], // 反对角线
  ];

  /**
   * 判定在(row, col)落子后是否获胜
   * @returns 若获胜返回{ winner, winLine }，否则返回null
   */
  static checkWin(board: BoardMatrix, row: number, col: number): { winner: ChessColor; winLine: Point[] } | null {
    const color = board[row][col];
    if (color === ChessColor.EMPTY) return null;

    for (const [dr, dc] of Judge.DIRECTIONS) {
      const line: Point[] = [{ row, col }];

      // 正方向扩展
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === color) {
        line.push({ row: r, col: c });
        r += dr;
        c += dc;
      }

      // 反方向扩展
      r = row - dr;
      c = col - dc;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === color) {
        line.unshift({ row: r, col: c });
        r -= dr;
        c -= dc;
      }

      if (line.length >= WIN_COUNT) {
        return { winner: color, winLine: line };
      }
    }

    return null;
  }
}