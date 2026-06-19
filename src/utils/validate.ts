import { AI_CONFIGS, BOARD_SIZE } from '../constants';
import { AiLevel } from '../enums';
import type { AiConfig, Point } from '../types';
import { isInBoard } from './chess-helper';

/**
 * 校验落子合法性
 */
export function validateMove(
  row: number,
  col: number,
  board: number[][]
): { valid: boolean; reason?: string } {
  if (!isInBoard(row, col)) {
    return { valid: false, reason: '超出棋盘范围' };
  }
  if (board[row][col] !== 0) {
    return { valid: false, reason: '该位置已有棋子' };
  }
  return { valid: true };
}

/**
 * 校验AI配置参数合法性
 * 非法参数自动降级为普通难度
 */
export function validateAiConfig(config: Partial<AiConfig>): AiConfig {
  const fallback = AI_CONFIGS[AiLevel.MEDIUM];
  const { level = AiLevel.MEDIUM, searchDepth, mistakeRate, attackWeight, defenseWeight } = config;

  return {
    level,
    searchDepth: isValidNumber(searchDepth) ? searchDepth! : fallback.searchDepth,
    mistakeRate: isValidNumber(mistakeRate, 0, 1) ? mistakeRate! : fallback.mistakeRate,
    attackWeight: isValidNumber(attackWeight, 0, 2) ? attackWeight! : fallback.attackWeight,
    defenseWeight: isValidNumber(defenseWeight, 0, 2) ? defenseWeight! : fallback.defenseWeight,
    useOpeningBook: config.useOpeningBook ?? fallback.useOpeningBook,
  };
}

/**
 * 校验数值是否在合法范围
 */
function isValidNumber(val: unknown, min = -Infinity, max = Infinity): val is number {
  if (typeof val !== 'number' || isNaN(val)) return false;
  return val >= min && val <= max;
}

/**
 * 校验棋盘是否已满
 */
export function isBoardFull(board: number[][]): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return true;
}

/**
 * 校验点是否在给定列表中
 */
export function pointInList(point: Point, list: Point[]): boolean {
  return list.some(p => p.row === point.row && p.col === point.col);
}