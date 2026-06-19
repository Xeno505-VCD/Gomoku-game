import { BOARD_SIZE } from '../constants';
import { ChessColor } from '../enums';
import type { BoardMatrix } from '../types';

/**
 * 棋盘状态管理
 * 负责棋盘初始化、落子、获取状态
 */
export class Board {
  private grid: BoardMatrix;

  constructor() {
    this.grid = this.createEmptyBoard();
  }

  /** 创建空棋盘 */
  private createEmptyBoard(): BoardMatrix {
    const board: BoardMatrix = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      board[r] = [];
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[r][c] = ChessColor.EMPTY;
      }
    }
    return board;
  }

  /** 获取整个棋盘 */
  getGrid(): BoardMatrix {
    return this.grid;
  }

  /** 获取指定位置棋子 */
  getCell(row: number, col: number): ChessColor {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return ChessColor.EMPTY;
    }
    return this.grid[row][col];
  }

  /** 落子 */
  placeStone(row: number, col: number, color: ChessColor): boolean {
    if (this.grid[row][col] !== ChessColor.EMPTY) {
      return false;
    }
    this.grid[row][col] = color;
    return true;
  }

  /** 移除棋子（悔棋用） */
  removeStone(row: number, col: number): void {
    this.grid[row][col] = ChessColor.EMPTY;
  }

  /** 是否为空格 */
  isEmpty(row: number, col: number): boolean {
    return this.getCell(row, col) === ChessColor.EMPTY;
  }

  /** 是否已满 */
  isFull(): boolean {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.grid[r][c] === ChessColor.EMPTY) return false;
      }
    }
    return true;
  }

  /** 计算空格数 */
  emptyCount(): number {
    let count = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.grid[r][c] === ChessColor.EMPTY) count++;
      }
    }
    return count;
  }

  /** 重置棋盘 */
  reset(): void {
    this.grid = this.createEmptyBoard();
  }

  /** 深拷贝当前棋盘状态 */
  cloneGrid(): BoardMatrix {
    return this.grid.map(row => [...row]);
  }

  /** 从已有矩阵恢复棋盘 */
  setGrid(grid: BoardMatrix): void {
    this.grid = grid.map(row => [...row]);
  }
}