import { BOARD_SIZE } from '../constants';
import type { Point } from '../types';

/**
 * 校验坐标是否在棋盘范围内
 */
export function isInBoard(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * 校验Point对象是否在棋盘范围内
 */
export function isPointInBoard(p: Point): boolean {
  return isInBoard(p.row, p.col);
}

/**
 * 将像素坐标转换为棋盘格坐标（取最近交叉点）
 */
export function pixelToGrid(
  px: number,
  py: number,
  boardX: number,
  boardY: number,
  cellSize: number
): Point {
  const col = Math.round((px - boardX) / cellSize);
  const row = Math.round((py - boardY) / cellSize);
  return { row, col };
}

/**
 * 将棋盘格坐标转换为像素坐标（交叉点）
 */
export function gridToPixel(row: number, col: number, boardX: number, boardY: number, cellSize: number): Point {
  return {
    row: boardX + col * cellSize,
    col: boardY + row * cellSize, // 这里col存的是Y像素
  };
}

/**
 * 获取棋盘交叉点的像素X坐标
 */
export function getPixelX(col: number, boardX: number, cellSize: number): number {
  return boardX + col * cellSize;
}

/**
 * 获取棋盘交叉点的像素Y坐标
 */
export function getPixelY(row: number, boardY: number, cellSize: number): number {
  return boardY + row * cellSize;
}

/**
 * 判断两个坐标是否相同
 */
export function isSamePoint(a: Point, b: Point): boolean {
  return a.row === b.row && a.col === b.col;
}

/**
 * 获取坐标的唯一key字符串
 */
export function pointKey(p: Point): string {
  return `${p.row},${p.col}`;
}

/**
 * 获取棋盘所有空位
 */
export function getEmptyPoints(board: number[][]): Point[] {
  const empty: Point[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) {
        empty.push({ row: r, col: c });
      }
    }
  }
  return empty;
}

/**
 * 统计棋盘空位数
 */
export function countEmpty(board: number[][]): number {
  let count = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) count++;
    }
  }
  return count;
}