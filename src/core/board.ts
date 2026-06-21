import { BOARD_SIZE } from '../constants';
import { ChessColor } from '../enums';
import type { BoardMatrix, HistoryStep, Point } from '../types';

/**
 * 棋盘状态管理器
 * 负责棋盘数据层的所有操作
 */
export class Board {
  private grid: BoardMatrix;
  private lastMove: Point | null = null;
  private moveHistory: HistoryStep[] = [];

  constructor() {
    this.grid = this.createEmpty();
  }

  /** 创建空棋盘 */
  private createEmpty(): BoardMatrix {
    const grid: BoardMatrix = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      grid[r] = new Array(BOARD_SIZE).fill(ChessColor.EMPTY);
    }
    return grid;
  }

  /** 重置棋盘 */
  reset(): void {
    this.grid = this.createEmpty();
    this.lastMove = null;
    this.moveHistory = [];
  }

  /** 获取棋盘数据（只读） */
  getGrid(): BoardMatrix {
    return this.grid;
  }

  /** 获取指定位置棋子 */
  get(row: number, col: number): ChessColor {
    return this.grid[row][col];
  }

  /** 落子 */
  placeStone(row: number, col: number, color: ChessColor): void {
    this.grid[row][col] = color;
    this.lastMove = { row, col };
    this.moveHistory.push({ row, col, color });
  }

  /** 获取最后落子位置 */
  getLastMove(): Point | null {
    return this.lastMove;
  }

  /** 获取落子历史 */
  getHistory(): HistoryStep[] {
    return this.moveHistory;
  }

  /** 悔棋（移除最后n步） */
  undo(steps: number): HistoryStep[] {
    const removed: HistoryStep[] = [];
    for (let i = 0; i < steps && this.moveHistory.length > 0; i++) {
      const step = this.moveHistory.pop()!;
      this.grid[step.row][step.col] = ChessColor.EMPTY;
      removed.push(step);
    }
    this.lastMove = this.moveHistory.length > 0
      ? { row: this.moveHistory[this.moveHistory.length - 1].row, col: this.moveHistory[this.moveHistory.length - 1].col }
      : null;
    return removed;
  }

  /** 棋盘是否已满 */
  isFull(): boolean {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.grid[r][c] === ChessColor.EMPTY) return false;
      }
    }
    return true;
  }

  /** 导入棋盘状态（联机同步） */
  importState(grid: BoardMatrix, history: HistoryStep[]): void {
    this.grid = grid;
    this.moveHistory = history;
    this.lastMove = history.length > 0
      ? { row: history[history.length - 1].row, col: history[history.length - 1].col }
      : null;
  }
}