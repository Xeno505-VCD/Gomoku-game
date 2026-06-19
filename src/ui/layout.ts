import {
  BOARD_PADDING_RATIO,
  BOARD_WIDTH_RATIO,
  BUTTON_HEIGHT,
  BUTTON_MIN_WIDTH,
  BUTTON_MOBILE_SIZE,
  CANVAS_DEFAULT_HEIGHT,
  CANVAS_DEFAULT_WIDTH,
  INFO_PANEL_HEIGHT,
  MIN_SCREEN_WIDTH,
  MOBILE_WIDTH_THRESHOLD,
  PANEL_WIDTH_RATIO,
  STONE_RADIUS_RATIO,
} from '../constants';
import type { LayoutConfig } from '../types';

/**
 * 自适应布局计算
 * 输出棋盘坐标、按键区域、弹窗坐标等的全局变量
 */
export function calculateLayout(
  width = CANVAS_DEFAULT_WIDTH,
  height = CANVAS_DEFAULT_HEIGHT
): LayoutConfig {
  const isMobile = width <= MOBILE_WIDTH_THRESHOLD;
  const scale = Math.max(1, width / (isMobile ? MIN_SCREEN_WIDTH : CANVAS_DEFAULT_WIDTH));

  // 可用区域（减去顶部信息栏）
  const usableWidth = width;
  const usableHeight = height - INFO_PANEL_HEIGHT;

  // 棋盘占据可用宽度比例
  const boardAreaWidth = usableWidth * BOARD_WIDTH_RATIO;
  const boardAreaHeight = usableHeight;

  // 棋盘尺寸取较小的一边（正方形）
  const maxBoardSize = Math.min(boardAreaWidth, boardAreaHeight);
  const padding = maxBoardSize * BOARD_PADDING_RATIO;
  const boardSize = maxBoardSize - padding * 2;
  const cellSize = boardSize / 14; // 15个格子 = 14个间隔

  // 棋盘左上角
  const boardX = padding + (boardAreaWidth - maxBoardSize) / 2;
  const boardY = INFO_PANEL_HEIGHT + padding + (boardAreaHeight - maxBoardSize) / 2;

  // 棋子半径
  const stoneRadius = cellSize * STONE_RADIUS_RATIO;

  // 右侧面板
  const panelX = boardX + boardSize + cellSize + padding;

  return {
    boardX,
    boardY,
    cellSize,
    boardSize,
    stoneRadius,
    canvasWidth: width,
    canvasHeight: height,
    panelX,
    infoY: INFO_PANEL_HEIGHT,
  };
}

/**
 * 获取按钮尺寸（区分PC/移动端）
 */
export function getButtonSize(canvasWidth: number): { width: number; height: number } {
  const isMobile = canvasWidth <= MOBILE_WIDTH_THRESHOLD;
  if (isMobile) {
    return { width: BUTTON_MOBILE_SIZE, height: BUTTON_MOBILE_SIZE };
  }
  return { width: BUTTON_MIN_WIDTH, height: BUTTON_HEIGHT };
}