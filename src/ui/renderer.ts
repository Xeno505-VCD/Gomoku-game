import {
  BOARD_BG_COLOR,
  BOARD_LINE_COLOR,
  BOARD_SIZE,
  CENTER_POINT,
  LAST_MOVE_MARKER,
  STAR_POINTS,
  STONE_BLACK_COLOR,
  STONE_BLACK_HIGHLIGHT,
  STONE_WHITE_BORDER,
  STONE_WHITE_COLOR,
  STONE_WHITE_HIGHLIGHT,
  WIN_HIGHLIGHT_COLOR,
} from '../constants';
import { ChessColor } from '../enums';
import type { BoardMatrix, LayoutConfig, Point } from '../types';
import { getPixelX, getPixelY, isSamePoint } from '../utils/chess-helper';

/**
 * Canvas 棋盘渲染器
 * 负责绘制棋盘格线、棋子、标记
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private layout: LayoutConfig;
  /** 最后落子位置 */
  private lastMove: Point | null = null;
  /** 五连获胜线 */
  private winLine: Point[] = [];
  /** 高亮闪烁状态 */
  private winBlink = false;

  constructor(ctx: CanvasRenderingContext2D, layout: LayoutConfig) {
    this.ctx = ctx;
    this.layout = layout;
  }

  /** 更新布局 */
  updateLayout(layout: LayoutConfig): void {
    this.layout = layout;
  }

  /** 设置最后落子 */
  setLastMove(point: Point | null): void {
    this.lastMove = point;
  }

  /** 设置获胜线 */
  setWinLine(line: Point[]): void {
    this.winLine = line;
  }

  /** 切换高亮状态 */
  toggleWinBlink(): void {
    this.winBlink = !this.winBlink;
  }

  /** 清除所有状态 */
  clearState(): void {
    this.lastMove = null;
    this.winLine = [];
    this.winBlink = false;
  }

  /** 完整绘制棋盘 + 棋子 */
  draw(board: BoardMatrix): void {
    const { ctx, layout } = this;
    const { canvasWidth, canvasHeight } = layout;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    this.drawBoard();
    this.drawStones(board);
    this.drawLastMoveMarker();
    this.drawWinHighlight();
  }

  /** 绘制棋盘背景与网格线 */
  private drawBoard(): void {
    const { ctx, layout } = this;
    const { boardX, boardY, cellSize } = layout;

    // 背景
    ctx.fillStyle = BOARD_BG_COLOR;
    const boardPixelSize = cellSize * 14;
    ctx.fillRect(boardX - cellSize * 0.5, boardY - cellSize * 0.5, boardPixelSize + cellSize, boardPixelSize + cellSize);

    // 网格线
    ctx.strokeStyle = BOARD_LINE_COLOR;
    ctx.lineWidth = 1;

    for (let i = 0; i < BOARD_SIZE; i++) {
      const x = getPixelX(i, boardX, cellSize);
      const y = getPixelY(i, boardY, cellSize);

      // 横线
      ctx.beginPath();
      ctx.moveTo(getPixelX(0, boardX, cellSize), y);
      ctx.lineTo(getPixelX(BOARD_SIZE - 1, boardX, cellSize), y);
      ctx.stroke();

      // 竖线
      ctx.beginPath();
      ctx.moveTo(x, getPixelY(0, boardY, cellSize));
      ctx.lineTo(x, getPixelY(BOARD_SIZE - 1, boardY, cellSize));
      ctx.stroke();
    }

    // 星位标记
    this.drawStarPoints();
  }

  /** 绘制星位 */
  private drawStarPoints(): void {
    const { ctx, layout } = this;
    const { boardX, boardY, cellSize } = layout;
    const r = Math.max(2, cellSize * 0.08);

    ctx.fillStyle = BOARD_LINE_COLOR;
    for (const sp of STAR_POINTS) {
      const x = getPixelX(sp.col, boardX, cellSize);
      const y = getPixelY(sp.row, boardY, cellSize);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** 绘制所有棋子 */
  private drawStones(board: BoardMatrix): void {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const color = board[r][c];
        if (color === ChessColor.EMPTY) continue;
        this.drawStone(r, c, color);
      }
    }
  }

  /** 绘制单颗棋子 */
  private drawStone(row: number, col: number, color: ChessColor): void {
    const { ctx, layout } = this;
    const { boardX, boardY, cellSize, stoneRadius } = layout;

    const x = getPixelX(col, boardX, cellSize);
    const y = getPixelY(row, boardY, cellSize);

    ctx.save();

    if (color === ChessColor.BLACK) {
      // 黑色棋子带渐变
      const gradient = ctx.createRadialGradient(
        x - stoneRadius * 0.3, y - stoneRadius * 0.3, stoneRadius * 0.1,
        x, y, stoneRadius
      );
      gradient.addColorStop(0, STONE_BLACK_HIGHLIGHT);
      gradient.addColorStop(1, STONE_BLACK_COLOR);
      ctx.fillStyle = gradient;
    } else {
      // 白色棋子带渐变和边框
      const gradient = ctx.createRadialGradient(
        x - stoneRadius * 0.3, y - stoneRadius * 0.3, stoneRadius * 0.1,
        x, y, stoneRadius
      );
      gradient.addColorStop(0, STONE_WHITE_HIGHLIGHT);
      gradient.addColorStop(1, '#D6D6D6');
      ctx.fillStyle = gradient;
    }

    ctx.beginPath();
    ctx.arc(x, y, stoneRadius, 0, Math.PI * 2);
    ctx.fill();

    // 白棋边缘
    if (color === ChessColor.WHITE) {
      ctx.strokeStyle = STONE_WHITE_BORDER;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, stoneRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /** 绘制最后落子标记 */
  private drawLastMoveMarker(): void {
    if (!this.lastMove) return;

    const { ctx, layout } = this;
    const { boardX, boardY, cellSize, stoneRadius } = layout;

    const x = getPixelX(this.lastMove.col, boardX, cellSize);
    const y = getPixelY(this.lastMove.row, boardY, cellSize);
    const markerRadius = stoneRadius * 0.25;

    ctx.save();
    ctx.fillStyle = LAST_MOVE_MARKER;
    ctx.beginPath();
    ctx.arc(x, y, markerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** 绘制五连高亮 */
  private drawWinHighlight(): void {
    if (this.winLine.length === 0) return;

    const { ctx, layout } = this;
    const { boardX, boardY, cellSize, stoneRadius } = layout;

    if (this.winBlink) {
      ctx.save();
      ctx.fillStyle = WIN_HIGHLIGHT_COLOR;
      ctx.globalAlpha = 0.5;

      for (const p of this.winLine) {
        const x = getPixelX(p.col, boardX, cellSize);
        const y = getPixelY(p.row, boardY, cellSize);
        ctx.beginPath();
        ctx.arc(x, y, stoneRadius + 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * 根据像素坐标查找最近的棋盘交叉点
   * @returns 交叉点坐标，null表示点击位置离交叉点太远
   */
  hitTest(px: number, py: number): Point | null {
    const { boardX, boardY, cellSize } = this.layout;

    const col = Math.round((px - boardX) / cellSize);
    const row = Math.round((py - boardY) / cellSize);

    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return null;
    }

    // 校验点击位置是否在交叉点范围内（半个格子内）
    const hitX = boardX + col * cellSize;
    const hitY = boardY + row * cellSize;
    const dist = Math.sqrt((px - hitX) ** 2 + (py - hitY) ** 2);

    if (dist > cellSize * 0.45) {
      return null;
    }

    return { row, col };
  }
}