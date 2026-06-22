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
  const boardAreaW = usableW * (isMobile ? 0.92 : 0.78);
  const maxBoard = Math.min(boardAreaW, usableH);
  const padding = Math.max(maxBoard * BOARD_PADDING_RATIO, 8);
  const boardSize = maxBoard - padding * 2;
  const cellSize = boardSize / 14;
  const stoneRadius = cellSize * STONE_RADIUS_RATIO;

  // 手机端：Canvas像素也正方形，刚好包含棋盘(14格+半格边距)，与CSS aspect-ratio对齐
  let canvasW = W;
  let canvasH = H;
  let boardX = (W - boardSize) / 2 - cellSize;
  let boardY = padding;
  if (isMobile) {
    const boardPixels = Math.round(cellSize * 15);
    canvasW = boardPixels;
    canvasH = boardPixels;
    boardX = cellSize * 0.5;
    boardY = cellSize * 0.5;
  }

  return {
    canvasWidth: canvasW,
    canvasHeight: canvasH,
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