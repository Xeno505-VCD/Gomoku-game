import { CANVAS_DEFAULT_HEIGHT, CANVAS_DEFAULT_WIDTH } from './constants';
import { Board } from './core/board';
import { Judge } from './core/judge';
import { Rules } from './core/rules';
import { ChessColor, GameStatus } from './enums';
import { InputHandler } from './input/input-handler';
import type { LayoutConfig, Point } from './types';
import { calculateLayout } from './ui/layout';
import { Renderer } from './ui/renderer';

/**
 * 五子棋游戏主入口
 * 阶段1：基础棋盘 + 落子 + 胜负判定
 */
class GomokuApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private board: Board;
  private renderer: Renderer;
  private inputHandler: InputHandler;
  private layout: LayoutConfig;
  private status: GameStatus = GameStatus.PLAYING;
  private currentPlayer: ChessColor = ChessColor.BLACK;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    // 布局计算
    this.layout = calculateLayout(CANVAS_DEFAULT_WIDTH, CANVAS_DEFAULT_HEIGHT);
    this.canvas.width = this.layout.canvasWidth;
    this.canvas.height = this.layout.canvasHeight;

    // 初始化模块
    this.board = new Board();
    this.renderer = new Renderer(this.ctx, this.layout);
    this.inputHandler = new InputHandler(this.canvas, this.renderer);
    this.inputHandler.setOnClick(this.handlePlayerMove.bind(this));

    // 状态栏
    this.updateStatusBar();

    // 初始渲染
    this.render();
  }

  private handlePlayerMove(point: Point): void {
    // 校验落子
    const valid = Rules.isValidMove(
      this.board.getGrid(),
      point.row,
      point.col,
      this.status
    );

    if (!valid.valid) {
      console.warn('无效落子:', valid.reason);
      return;
    }

    // 执行落子
    this.board.placeStone(point.row, point.col, this.currentPlayer);
    this.renderer.setLastMove(point);

    // 胜负判定
    const winResult = Judge.checkWin(this.board.getGrid(), point.row, point.col);
    if (winResult) {
      this.status = GameStatus.WIN;
      this.renderer.setWinLine(winResult.winLine);
      this.render();
      this.showResult(winResult.winner);
      return;
    }

    // 棋盘满判定
    if (this.board.isFull()) {
      this.status = GameStatus.DRAW;
      this.render();
      this.showResult(null);
      return;
    }

    // 切换执棋方
    this.currentPlayer = Rules.opponentColor(this.currentPlayer);
    this.updateStatusBar();
    this.render();
  }

  private showResult(winner: ChessColor | null): void {
    const statusEl = document.getElementById('gameStatus');
    if (!statusEl) return;

    if (winner === null) {
      statusEl.textContent = '对局和棋！棋盘已满';
    } else if (winner === ChessColor.BLACK) {
      statusEl.textContent = '黑棋胜利！';
    } else {
      statusEl.textContent = '白棋胜利！';
    }
  }

  private updateStatusBar(): void {
    const turnEl = document.getElementById('currentTurn');
    if (turnEl) {
      turnEl.textContent = this.currentPlayer === ChessColor.BLACK ? '黑棋' : '白棋';
    }
  }

  private render(): void {
    this.renderer.draw(this.board.getGrid());
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  new GomokuApp();
});