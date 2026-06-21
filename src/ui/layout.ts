import {
  BOARD_PADDING_RATIO,
  CANVAS_MAX_HEIGHT,
  CANVAS_MAX_WIDTH,
  MOBILE_WIDTH_THRESHOLD,
  STONE_RADIUS_RATIO,
} from '../constants';
import type { LayoutConfig } from '../types';

/**
 * 响应式布局计算器
 * 根据窗口尺寸计算棋盘各元素位置
 */
export function calculateLayout(): LayoutConfig {
  const isMobile = window.innerWidth <= MOBILE_WIDTH_THRESHOLD;
  const W = Math.min(window.innerWidth - 20, CANVAS_MAX_WIDTH);
  const H = Math.min(window.innerHeight - 160, isMobile ? 650 : CANVAS_MAX_HEIGHT);
  const usableW = W;
  const usableH = H;
  const boardAreaW = usableW * (isMobile ? 0.95 : 0.78);
  const maxBoard = Math.min(boardAreaW, usableH);
  const padding = Math.max(maxBoard * BOARD_PADDING_RATIO, 8);
  const boardSize = maxBoard - padding * 2;
  const cellSize = boardSize / 14;
  const stoneRadius = cellSize * STONE_RADIUS_RATIO;
  // 手机端棋盘向右下偏移，为下方面板留空间
  const boardX = isMobile
    ? ((W - boardSize) / 2 - cellSize) + cellSize * 2
    : (W - boardSize) / 2 - cellSize;
  const boardY = isMobile ? padding + cellSize : padding;

  return {
    canvasWidth: W,
    canvasHeight: H,
    boardX,
    boardY,
    cellSize,
    stoneRadius,
  };
}

/** 根据布局和棋盘坐标计算Canvas像素坐标 */
export function getPixelX(layout: LayoutConfig, col: number): number {
  return layout.boardX + col * layout.cellSize;
}

export function getPixelY(layout: LayoutConfig, row: number): number {
  return layout.boardY + row * layout.cellSize;
}