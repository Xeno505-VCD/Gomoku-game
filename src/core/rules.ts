import { BOARD_SIZE } from '../constants';
import { ChessColor, GameStatus } from '../enums';
import type { BoardMatrix, Point } from '../types';
import { isInBoard } from '../utils/chess-helper';

/**
 * 落子合法性校验
 */
export class Rules {
  /**
   * 校验落子是否合法
   */
  static isValidMove(
    board: BoardMatrix,
    row: number,
    col: number,
    status: GameStatus
  ): { valid: boolean; reason?: string } {
    // 对局状态锁：仅PLAYING状态可落子
    if (status !== GameStatus.PLAYING) {
      return { valid: false, reason: '当前对局状态不允许落子' };
    }

    // 边界校验
    if (!isInBoard(row, col)) {
      return { valid: false, reason: '超出棋盘范围' };
    }

    // 空位校验
    if (board[row][col] !== ChessColor.EMPTY) {
      return { valid: false, reason: '该位置已有棋子' };
    }

    return { valid: true };
  }

  /**
   * 获取对手颜色
   */
  static opponentColor(color: ChessColor): ChessColor {
    if (color === ChessColor.BLACK) return ChessColor.WHITE;
    if (color === ChessColor.WHITE) return ChessColor.BLACK;
    return ChessColor.EMPTY;
  }

  /**
   * 检查是否有五连存在的可能（双方都已无法形成5连时强制和棋）
   * 简化判定：检查每条线是否有足够的空位+已方棋子凑成5连
   */
  static hasWinningPotential(board: BoardMatrix, color: ChessColor): boolean {
    const directions: [number, number][] = [
      [0, 1], [1, 0], [1, 1], [1, -1],
    ];

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] !== ChessColor.EMPTY && board[r][c] !== color) continue;

        for (const [dr, dc] of directions) {
          let sameColor = 0;
          let empty = 0;

          for (let i = -4; i <= 4; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (!isInBoard(nr, nc)) continue;
            if (board[nr][nc] === color) {
              sameColor++;
            } else if (board[nr][nc] === ChessColor.EMPTY) {
              empty++;
            }
          }

          // 同色棋子+空位 >= 5 即有可能
          if (sameColor + empty >= 5 && sameColor > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * 检查棋盘上某色棋子是否有活四或冲四（进攻性棋型检测，用于循环和棋判定）
   */
  static hasAttackingThreat(board: BoardMatrix, color: ChessColor): boolean {
    const directions: [number, number][] = [
      [0, 1], [1, 0], [1, 1], [1, -1],
    ];

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] !== color) continue;

        for (const [dr, dc] of directions) {
          let consecutive = 1;
          // 正方向
          for (let i = 1; i < 5; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (isInBoard(nr, nc) && board[nr][nc] === color) consecutive++;
            else break;
          }
          // 反方向
          for (let i = 1; i < 5; i++) {
            const nr = r - dr * i;
            const nc = c - dc * i;
            if (isInBoard(nr, nc) && board[nr][nc] === color) consecutive++;
            else break;
          }

          // 活四或冲四（连四且有开放端）
          if (consecutive >= 4) {
            const forwardR = r + dr * consecutive;
            const forwardC = c + dc * consecutive;
            const backwardR = r - dr;
            const backwardC = c - dc;
            const forwardOpen = isInBoard(forwardR, forwardC) && board[forwardR][forwardC] === ChessColor.EMPTY;
            const backwardOpen = isInBoard(backwardR, backwardC) && board[backwardR][backwardC] === ChessColor.EMPTY;
            if (forwardOpen || backwardOpen) return true;
          }
        }
      }
    }
    return false;
  }
}