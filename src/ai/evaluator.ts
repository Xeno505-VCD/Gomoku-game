import { BOARD_SIZE } from '../constants';
import { ChessColor } from '../enums';
import type { AiConfig, BoardMatrix, ChessScore, Point } from '../types';
import { isInBoard } from '../utils/chess-helper';

/**
 * 棋型常量
 */
const CHESS_TYPE = {
  FIVE: 5,        // 五连
  LIVE_FOUR: 4,   // 活四
  RUSH_FOUR: 3,   // 冲四
  LIVE_THREE: 2,  // 活三
  SLEEP_THREE: 1, // 眠三
  LIVE_TWO: 0,    // 活二
};

/**
 * 棋型权重打分引擎
 * 所有AI难度共用，通过权重参数做差异化
 */
export class Evaluator {
  private config: AiConfig;
  private directions: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

  constructor(config: AiConfig) {
    this.config = config;
  }

  /**
   * 对棋盘上所有空位打分
   * @param board 当前棋盘
   * @param aiColor AI执棋颜色
   * @returns 所有空位及其得分
   */
  evaluateAll(board: BoardMatrix, aiColor: ChessColor): ChessScore[] {
    const playerColor = aiColor === ChessColor.BLACK ? ChessColor.WHITE : ChessColor.BLACK;
    const scores: ChessScore[] = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] !== ChessColor.EMPTY) continue;

        const attack = this.evaluatePoint(board, r, c, aiColor);
        const defense = this.evaluatePoint(board, r, c, playerColor);

        const score = attack * this.config.attackWeight + defense * this.config.defenseWeight;
        scores.push({ point: { row: r, col: c }, score });
      }
    }

    return scores;
  }

  /**
   * 评估单个空位对指定颜色的价值
   */
  private evaluatePoint(board: BoardMatrix, row: number, col: number, color: ChessColor): number {
    let totalScore = 0;

    for (const [dr, dc] of this.directions) {
      const { count, openEnds } = this.analyzeLine(board, row, col, dr, dc, color);
      totalScore += this.scorePattern(count, openEnds);
    }

    return totalScore;
  }

  /**
   * 分析在指定方向上模拟落子后的棋型
   * @returns count=连续同色棋子数（包含模拟点）, openEnds=开放端数(0/1/2)
   */
  private analyzeLine(
    board: BoardMatrix,
    row: number,
    col: number,
    dr: number,
    dc: number,
    color: ChessColor
  ): { count: number; openEnds: number } {
    let count = 1; // 模拟落子点
    let openEnds = 0;

    // 正方向
    let r = row + dr;
    let c = col + dc;
    while (isInBoard(r, c) && board[r][c] === color) {
      count++;
      r += dr;
      c += dc;
    }
    if (isInBoard(r, c) && board[r][c] === ChessColor.EMPTY) {
      openEnds++;
    }

    // 反方向
    r = row - dr;
    c = col - dc;
    while (isInBoard(r, c) && board[r][c] === color) {
      count++;
      r -= dr;
      c -= dc;
    }
    if (isInBoard(r, c) && board[r][c] === ChessColor.EMPTY) {
      openEnds++;
    }

    return { count, openEnds };
  }

  /**
   * 根据连续数和开放端数打分
   */
  private scorePattern(count: number, openEnds: number): number {
    if (count >= 5) return 100000; // 五连
    if (count === 4) {
      if (openEnds === 2) return 50000;  // 活四
      if (openEnds === 1) return 5000;   // 冲四
    }
    if (count === 3) {
      if (openEnds === 2) return 3000;   // 活三
      if (openEnds === 1) return 500;    // 眠三
    }
    if (count === 2) {
      if (openEnds === 2) return 200;    // 活二
      if (openEnds === 1) return 50;     // 眠二
    }
    if (count === 1 && openEnds === 2) return 10;
    return 0;
  }

  /**
   * 获取最优落子（按分数排序取最高）
   * @param scores 所有落子评分
   * @param mistakeRate 失误概率，0-1之间
   */
  selectBest(scores: ChessScore[], mistakeRate: number): Point {
    if (scores.length === 0) {
      return { row: Math.floor(BOARD_SIZE / 2), col: Math.floor(BOARD_SIZE / 2) };
    }

    // 按分数降序排列
    scores.sort((a, b) => b.score - a.score);

    // 根据失误概率随机选择非最优解
    if (mistakeRate > 0 && Math.random() < mistakeRate) {
      // 从非最优中选择（避开前20%的高分）
      const startIdx = Math.max(1, Math.floor(scores.length * 0.2));
      const pool = scores.slice(startIdx);
      if (pool.length > 0) {
        // 在前50%-80%分位随机选
        const midStart = Math.floor(pool.length * 0.3);
        const midEnd = Math.min(midStart + Math.max(1, Math.floor(pool.length * 0.3)), pool.length);
        const idx = midStart + Math.floor(Math.random() * Math.max(1, midEnd - midStart));
        return pool[Math.min(idx, pool.length - 1)].point;
      }
    }

    // 默认返回最优
    return scores[0].point;
  }

  /**
   * 评估局面的胜负确定度（用于大师难度判断是否接受和棋）
   */
  evaluateBoardBalance(board: BoardMatrix): { blackAdvantage: number; whiteAdvantage: number } {
    const blackScores = this.evaluateAll(board, ChessColor.BLACK);
    const whiteScores = this.evaluateAll(board, ChessColor.WHITE);

    const blackBest = blackScores.length > 0 ? Math.max(...blackScores.map(s => s.score)) : 0;
    const whiteBest = whiteScores.length > 0 ? Math.max(...whiteScores.map(s => s.score)) : 0;

    return { blackAdvantage: blackBest, whiteAdvantage: whiteBest };
  }
}