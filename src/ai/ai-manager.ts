import { AI_CONFIGS } from '../constants';
import { AiLevel, ChessColor } from '../enums';
import type { AiConfig, BoardMatrix, Point } from '../types';
import { validateAiConfig } from '../utils/validate';
import { Evaluator } from './evaluator';
import { STAR_POINTS, CENTER_POINT } from '../constants';

/**
 * AI调度管理器
 * 工厂模式：根据难度等级创建不同策略的AI
 * 所有难度共用Evaluator打分引擎，仅通过配置参数做差异化
 */
export class AiManager {
  private config: AiConfig;
  private evaluator: Evaluator;

  constructor(level: AiLevel = AiLevel.MEDIUM) {
    this.config = this.getValidConfig(level);
    this.evaluator = new Evaluator(this.config);
  }

  /** 获取校验后的配置（非法参数自动降级） */
  private getValidConfig(level: AiLevel): AiConfig {
    const rawConfig = AI_CONFIGS[level] ?? AI_CONFIGS[AiLevel.MEDIUM];
    return validateAiConfig(rawConfig);
  }

  /** 切换AI难度 */
  setLevel(level: AiLevel): void {
    this.config = this.getValidConfig(level);
    this.evaluator = new Evaluator(this.config);
  }

  /** 获取当前难度 */
  getLevel(): AiLevel {
    return this.config.level;
  }

  /** 获取当前配置 */
  getConfig(): AiConfig {
    return { ...this.config };
  }

  /**
   * 计算AI落子
   * @param board 当前棋盘
   * @param aiColor AI执棋颜色
   * @returns 落子坐标和附加信息
   */
  computeMove(board: BoardMatrix, aiColor: ChessColor): { point: Point; isMistake: boolean } {
    const { searchDepth, mistakeRate, useOpeningBook } = this.config;

    // 开局定式：优先占天元/星位
    if (useOpeningBook) {
      const bookMove = this.getOpeningBookMove(board);
      if (bookMove) {
        return { point: bookMove, isMistake: false };
      }
    }

    // 新手/简单难度：纯评分+随机失误，不做深度搜索
    if (searchDepth <= 0) {
      const scores = this.evaluator.evaluateAll(board, aiColor);
      const point = this.evaluator.selectBest(scores, mistakeRate);
      const bestScore = scores.length > 0 ? scores[0].score : 0;
      return { point, isMistake: false };
    }

    // 普通及以上：Minimax + Alpha-Beta剪枝搜索
    const color = aiColor;
    const opponent = color === ChessColor.BLACK ? ChessColor.WHITE : ChessColor.BLACK;

    let bestPoint: Point = { row: 7, col: 7 };
    let bestScore = -Infinity;
    let isMistake = false;

    // 获取候选落子点（评分最高的前N个，减少搜索空间）
    const candidates = this.getCandidates(board, aiColor);

    for (const point of candidates) {
      const newBoard = this.cloneBoard(board);
      newBoard[point.row][point.col] = color;
      const score = this.alphaBeta(newBoard, searchDepth - 1, -Infinity, Infinity, false, color, opponent);
      if (score > bestScore) {
        bestScore = score;
        bestPoint = point;
      }
    }

    // 失误判定：有一定概率选次优解
    if (mistakeRate > 0 && Math.random() < mistakeRate && candidates.length > 1) {
      isMistake = true;
      const filtered = candidates.filter(p => p.row !== bestPoint.row || p.col !== bestPoint.col);
      if (filtered.length > 0) {
        bestPoint = filtered[Math.floor(Math.random() * Math.min(filtered.length, 5))];
      }
    }

    return { point: bestPoint, isMistake };
  }

  /**
   * Alpha-Beta剪枝搜索
   */
  private alphaBeta(
    board: BoardMatrix,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    aiColor: ChessColor,
    opponentColor: ChessColor
  ): number {
    if (depth === 0) {
      return this.evaluateBoard(board, aiColor, opponentColor);
    }

    const currentColor = isMaximizing ? aiColor : opponentColor;
    const candidates = this.getCandidates(board, currentColor, 10);

    if (candidates.length === 0) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const point of candidates) {
        const newBoard = this.cloneBoard(board);
        newBoard[point.row][point.col] = currentColor;
        const evalScore = this.alphaBeta(newBoard, depth - 1, alpha, beta, false, aiColor, opponentColor);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const point of candidates) {
        const newBoard = this.cloneBoard(board);
        newBoard[point.row][point.col] = currentColor;
        const evalScore = this.alphaBeta(newBoard, depth - 1, alpha, beta, true, aiColor, opponentColor);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  /**
   * 评估棋盘局势（AI视角）
   */
  private evaluateBoard(board: BoardMatrix, aiColor: ChessColor, opponentColor: ChessColor): number {
    const aiScores = this.evaluator.evaluateAll(board, aiColor);
    const oppScores = this.evaluator.evaluateAll(board, opponentColor);

    const aiBest = aiScores.length > 0 ? Math.max(...aiScores.map(s => s.score)) : 0;
    const oppBest = oppScores.length > 0 ? Math.max(...oppScores.map(s => s.score)) : 0;

    return aiBest * this.config.attackWeight - oppBest * this.config.defenseWeight;
  }

  /**
   * 获取候选落子点（按评分排序，取前N个）
   */
  private getCandidates(board: BoardMatrix, color: ChessColor, topN = 15): Point[] {
    const scores = this.evaluator.evaluateAll(board, color);
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topN).map(s => s.point);
  }

  /**
   * 开局定式：优先占关键点位
   */
  private getOpeningBookMove(board: BoardMatrix): Point | null {
    const emptyCount = this.countStones(board);
    if (emptyCount > 2) return null; // 仅前2步使用定式

    // 第一步：天元
    if (emptyCount === 0) {
      if (board[CENTER_POINT.row][CENTER_POINT.col] === ChessColor.EMPTY) {
        return CENTER_POINT;
      }
    }

    // 第二步：对方占了天元则占星位
    if (emptyCount <= 2) {
      for (const sp of STAR_POINTS) {
        if (board[sp.row][sp.col] === ChessColor.EMPTY) {
          return sp;
        }
      }
    }

    return null;
  }

  private countStones(board: BoardMatrix): number {
    let count = 0;
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] !== ChessColor.EMPTY) count++;
      }
    }
    return count;
  }

  private cloneBoard(board: BoardMatrix): BoardMatrix {
    return board.map(row => [...row]);
  }
}