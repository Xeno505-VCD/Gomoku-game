import {
  BOARD_BG_COLOR,
  BOARD_LINE_COLOR,
  BOARD_SIZE,
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
import { getPixelX, getPixelY } from './layout';

/**
 * Canvas 2D 渲染器
 * 负责棋盘线、棋子径向渐变、最后落子标记、五连高亮等全部绘制
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private layout: LayoutConfig;

  constructor(ctx: CanvasRenderingContext2D, layout: LayoutConfig) {
    this.ctx = ctx;
    this.layout = layout;
  }

  updateLayout(layout: LayoutConfig): void {
    this.layout = layout;
  }

  /** 完整绘制一帧 */
  draw(
    board: BoardMatrix,
    lastMove: Point | null,
    winLine: Point[],
  ): void {
    const { ctx, layout } = this;
    const { canvasWidth: W, canvasHeight: H } = layout;

    ctx.clearRect(0, 0, W, H);
    this.drawBoard();
    this.drawStones(board);
    if (lastMove) this.drawLastMarker(lastMove);
    if (winLine.length > 0) this.drawWinHighlight(winLine);
  }

  /** 绘制棋盘背景 + 网格线 + 星位 */
  private drawBoard(): void {
    const { ctx, layout } = this;
    const { boardX, boardY, cellSize } = layout;

    // 背景
    const bps = cellSize * 14;
    ctx.fillStyle = BOARD_BG_COLOR;
    ctx.fillRect(boardX - cellSize * 0.5, boardY - cellSize * 0.5, bps + cellSize, bps + cellSize);

    // 网格线
    ctx.strokeStyle = BOARD_LINE_COLOR;
    ctx.lineWidth = 1;
    for (let i = 0; i < BOARD_SIZE; i++) {
      const x = getPixelX(layout, i);
      const y = getPixelY(layout, i);
      ctx.beginPath();
      ctx.moveTo(getPixelX(layout, 0), y);
      ctx.lineTo(getPixelX(layout, 14), y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, getPixelY(layout, 0));
      ctx.lineTo(x, getPixelY(layout, 14));
      ctx.stroke();
    }

    // 星位
    ctx.fillStyle = BOARD_LINE_COLOR;
    for (const { row, col } of STAR_POINTS) {
      ctx.beginPath();
      ctx.arc(getPixelX(layout, col), getPixelY(layout, row), Math.max(2, cellSize * 0.08), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** 绘制棋盘上所有棋子 */
  private drawStones(board: BoardMatrix): void {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === ChessColor.EMPTY) continue;
        this.drawStone(r, c, board[r][c]);
      }
    }
  }

  /** 绘制单颗棋子（径向渐变 + 光照效果） */
  private drawStone(row: number, col: number, color: ChessColor): void {
    const { ctx, layout } = this;
    const x = getPixelX(layout, col);
    const y = getPixelY(layout, row);
    const r = layout.stoneRadius;

    ctx.save();
    if (color === ChessColor.BLACK) {
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      g.addColorStop(0, STONE_BLACK_HIGHLIGHT);
      g.addColorStop(1, STONE_BLACK_COLOR);
      ctx.fillStyle = g;
    } else {
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      g.addColorStop(0, STONE_WHITE_HIGHLIGHT);
      g.addColorStop(1, '#D6D6D6');
      ctx.fillStyle = g;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    if (color === ChessColor.WHITE) {
      ctx.strokeStyle = STONE_WHITE_BORDER;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** 绘制最后落子红点标记 */
  private drawLastMarker(move: Point): void {
    const { ctx, layout } = this;
    const x = getPixelX(layout, move.col);
    const y = getPixelY(layout, move.row);
    ctx.fillStyle = LAST_MOVE_MARKER;
    ctx.beginPath();
    ctx.arc(x, y, layout.stoneRadius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  /** 绘制五连金色高亮 */
  private drawWinHighlight(winLine: Point[]): void {
    const { ctx, layout } = this;
    ctx.save();
    ctx.fillStyle = WIN_HIGHLIGHT_COLOR;
    ctx.globalAlpha = 0.5;
    for (const p of winLine) {
      ctx.beginPath();
      ctx.arc(getPixelX(layout, p.col), getPixelY(layout, p.row), layout.stoneRadius + 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}