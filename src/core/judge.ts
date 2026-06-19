import { BOARD_SIZE, WIN_COUNT } from '../constants';
import { ChessColor } from '../enums';
import type { BoardMatrix, Point } from '../types';
import { isInBoard } from '../utils/chess-helper';

/**
 * 方向向量（横、纵、左斜、右斜）
 */
const DIRECTIONS: [number, number][] = [
  [0, 1],   // 横向
  [1, 0],   // 纵向
  [1, 1],   // 右斜（\）
  [1, -1],  // 左斜（/）
];

/**
 * 胜负判定模块
 * 检测连续五子及以上
 */
export class Judge {
  /**
   * 检查在指定位置落子后是否胜利
   * @returns 胜利方颜色和五连坐标列表，null表示未胜利
   */
  static checkWin(board: BoardMatrix, row: number, col: number): { winner: ChessColor; winLine: Point[] } | null {
    const color = board[row][col];
    if (color === ChessColor.EMPTY) return null;

    for (const [dr, dc] of DIRECTIONS) {
      const line = Judge.countLine(board, row, col, dr, dc);
      if (line.length >= WIN_COUNT) {
        return { winner: color, winLine: line };
      }
    }
    return null;
  }

  /**
   * 计算从某点出发沿指定方向（含反向）的连续同色棋子坐标列表
   */
  private static countLine(board: BoardMatrix, row: number, col: number, dr: number, dc: number): Point[] {
    const color = board[row][col];
    const line: Point[] = [{ row, col }];

    // 正方向延伸
    let r = row + dr;
    let c = col + dc;
    while (isInBoard(r, c) && board[r][c] === color) {
      line.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    // 反方向延伸
    r = row - dr;
    c = col - dc;
    while (isInBoard(r, c) && board[r][c] === color) {
      line.unshift({ row: r, col: c });
      r -= dr;
      c -= dc;
    }

    return line;
  }

  /**
   * 检查在指定方向上的连续同色棋子数
   */
  static countInDirection(
    board: BoardMatrix,
    row: number,
    col: number,
    dr: number,
    dc: number,
    color: ChessColor
  ): number {
    let count = 0;
    let r = row + dr;
    let c = col + dc;
    while (isInBoard(r, c) && board[r][c] === color) {
      count++;
      r += dr;
      c += dc;
    }
    return count;
  }

  /**
   * 双向连续同色棋子数（含中心点）
   */
  static countBidirectional(
    board: BoardMatrix,
    row: number,
    col: number,
    dr: number,
    dc: number,
    color: ChessColor
  ): number {
    return (
      1 +
      Judge.countInDirection(board, row, col, dr, dc, color) +
      Judge.countInDirection(board, row, col, -dr, -dc, color)
    );
  }

  /**
   * 检查两个端点是空格还是边界/棋子
   * @returns [正方向端是否开放, 反方向端是否开放]
   */
  static checkEndsOpen(
    board: BoardMatrix,
    row: number,
    col: number,
    dr: number,
    dc: number,
    color: ChessColor
  ): [boolean, boolean] {
    let r = row + dr;
    let c = col + dc;
    while (isInBoard(r, c) && board[r][c] === color) {
      r += dr;
      c += dc;
    }
    const forwardOpen = isInBoard(r, c) && board[r][c] === ChessColor.EMPTY;

    r = row - dr;
    c = col - dc;
    while (isInBoard(r, c) && board[r][c] === color) {
      r -= dr;
      c -= dc;
    }
    const backwardOpen = isInBoard(r, c) && board[r][c] === ChessColor.EMPTY;

    return [forwardOpen, backwardOpen];
  }

  /**
   * 遍历整个棋盘，检查是否存在任意五连
   */
  static scanBoard(board: BoardMatrix): { winner: ChessColor; winLine: Point[] } | null {
    // 优化：只检查有落子的行
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === ChessColor.EMPTY) continue;
        const result = Judge.checkWin(board, r, c);
        if (result) return result;
      }
    }
    return null;
  }
}