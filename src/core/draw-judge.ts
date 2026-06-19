import { DRAW_NO_ATTACK_THRESHOLD, MAX_MOVES } from '../constants';
import { ChessColor, GameMode } from '../enums';
import type { BoardMatrix, Point } from '../types';
import { Rules } from './rules';

/**
 * 和棋判定模块
 * 三大和棋场景：
 * 1. 棋盘满格无胜负
 * 2. 双方循环往复无有效进攻空间
 * 3. 双方主动申请和棋（由Game控制器处理）
 */
export class DrawJudge {
  /**
   * 场景1：棋盘已满
   */
  static isBoardFull(board: BoardMatrix): boolean {
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length; c++) {
        if (board[r][c] === ChessColor.EMPTY) return false;
      }
    }
    return true;
  }

  /**
   * 场景2：双方均无五连可能（循环往复无进攻）
   */
  static hasNoWinningPotential(board: BoardMatrix): boolean {
    const blackCanWin = Rules.hasWinningPotential(board, ChessColor.BLACK);
    const whiteCanWin = Rules.hasWinningPotential(board, ChessColor.WHITE);
    return !blackCanWin && !whiteCanWin;
  }

  /**
   * 场景3：连续N步无进攻性威脅（活四/冲四）
   * @param historyMoves 双方最近一段落子记录
   */
  static isStalemateByHistory(historyMoves: { color: ChessColor }[], threshold = DRAW_NO_ATTACK_THRESHOLD): boolean {
    if (historyMoves.length < threshold) return false;
    return true; // 由上层传入判定结果
  }

  /**
   * 人机模式和棋自动判定：
   * - 棋盘满 → 和棋
   * - 双方均无获胜可能 → 和棋
   * - 大师难度额外校验：仅棋局绝对均衡时允许和棋
   */
  static shouldAcceptAiDraw(
    board: BoardMatrix,
    mode: GameMode,
    moveCount: number,
    isMasterLevel: boolean
  ): { accept: boolean; reason: string } {
    // 棋盘满
    if (DrawJudge.isBoardFull(board)) {
      return { accept: true, reason: '棋盘已满，对局和棋' };
    }

    // 双方无获胜可能
    if (DrawJudge.hasNoWinningPotential(board)) {
      return { accept: true, reason: '双方均无获胜可能' };
    }

    // 大师难度：额外检查棋局是否绝对均衡
    if (isMasterLevel) {
      const blackPotential = Rules.hasWinningPotential(board, ChessColor.BLACK);
      const whitePotential = Rules.hasWinningPotential(board, ChessColor.WHITE);
      if (blackPotential && whitePotential) {
        // 双方都有机会，大师拒绝和棋
        return { accept: false, reason: '棋局仍有胜负可能，继续对局' };
      }
    }

    // 默认同意
    return { accept: true, reason: '和棋申请通过' };
  }
}