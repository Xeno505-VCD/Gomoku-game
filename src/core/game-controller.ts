import { DEFAULT_AI_LEVEL } from '../constants';
import { AiLevel, ChessColor, GameMode, GameStatus, PlayerRole } from '../enums';
import type { GameStats, Point } from '../types';
import { Board } from './board';
import { Judge } from './judge';

/**
 * 游戏流程控制器
 * 负责模式切换、落子流程、投降/和棋/悔棋等逻辑编排
 */
export class GameController {
  board: Board;
  currentPlayer: ChessColor = ChessColor.BLACK;
  gameMode: GameMode = GameMode.AI;
  aiLevel: AiLevel = DEFAULT_AI_LEVEL;
  status: GameStatus = GameStatus.PLAYING;
  winLine: Point[] = [];
  stats: GameStats = { total: 0, wins: 0, losses: 0, draws: 0, streak: 0, maxStreak: 0 };

  constructor() {
    this.board = new Board();
  }

  /** 切换模式并重开 */
  setMode(mode: GameMode): void {
    this.gameMode = mode;
    this.reset();
  }

  /** 设置AI难度 */
  setAiLevel(level: AiLevel): void {
    this.aiLevel = level;
  }

  /** 重置对局 */
  reset(): void {
    this.board.reset();
    this.currentPlayer = ChessColor.BLACK;
    this.status = GameStatus.PLAYING;
    this.winLine = [];
  }

  /** 执行落子，返回对局结果 */
  placeStone(row: number, col: number): { action: 'MOVE' | 'WIN' | 'DRAW'; winner?: ChessColor; winLine?: Point[] } {
    if (this.status !== GameStatus.PLAYING && this.status !== GameStatus.AI_THINKING) {
      return { action: 'MOVE' };
    }
    if (this.board.get(row, col) !== ChessColor.EMPTY) {
      return { action: 'MOVE' };
    }

    this.board.placeStone(row, col, this.currentPlayer);

    // 胜负判定
    const winResult = Judge.checkWin(this.board.getGrid(), row, col);
    if (winResult) {
      this.status = GameStatus.WIN;
      this.winLine = winResult.winLine;
      return { action: 'WIN', winner: winResult.winner, winLine: winResult.winLine };
    }

    // 满盘判定
    if (this.board.isFull()) {
      this.status = GameStatus.DRAW;
      return { action: 'DRAW' };
    }

    // 切换执棋方，并重置AI思考状态
    this.currentPlayer = this.currentPlayer === ChessColor.BLACK ? ChessColor.WHITE : ChessColor.BLACK;
    if (this.status === GameStatus.AI_THINKING) {
      this.status = GameStatus.PLAYING;
    }
    return { action: 'MOVE' };
  }

  /** 认输 */
  surrender(): ChessColor {
    const winner = this.currentPlayer === ChessColor.BLACK ? ChessColor.WHITE : ChessColor.BLACK;
    this.status = GameStatus.DRAW;
    return winner;
  }

  /** 和棋 */
  draw(): void {
    this.status = GameStatus.DRAW;
  }

  /** 悔棋（人机模式撤回2步，双人模式撤回1步） */
  undo(): ChessColor {
    if (this.gameMode === GameMode.AI) {
      if (this.board.getHistory().length < 2) return this.currentPlayer;
      this.board.undo(2);
      this.currentPlayer = ChessColor.BLACK;
    } else {
      if (this.board.getHistory().length < 1) return this.currentPlayer;
      const removed = this.board.undo(1);
      this.currentPlayer = removed[0].color;
    }
    this.status = GameStatus.PLAYING;
    this.winLine = [];
    return this.currentPlayer;
  }

  /** 获取对手颜色 */
  getOpponentColor(): ChessColor {
    return this.currentPlayer === ChessColor.BLACK ? ChessColor.WHITE : ChessColor.BLACK;
  }

  /** 更新战绩统计 */
  recordResult(result: 'win' | 'loss' | 'draw'): GameStats {
    this.stats.total++;
    if (result === 'win') {
      this.stats.wins++;
      this.stats.streak++;
      this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.streak);
    } else if (result === 'loss') {
      this.stats.losses++;
      this.stats.streak = 0;
    } else {
      this.stats.draws++;
    }
    return { ...this.stats };
  }

  /** 设置战绩（从存储加载） */
  setStats(s: GameStats): void {
    this.stats = s;
  }
}