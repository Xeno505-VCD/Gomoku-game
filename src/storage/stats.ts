import { STORAGE_KEY_STATS } from '../constants';
import { AiLevel } from '../enums';
import type { GameStats } from '../types';

const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  aiWinRates: {
    [AiLevel.NOVICE]: { wins: 0, total: 0 },
    [AiLevel.EASY]: { wins: 0, total: 0 },
    [AiLevel.MEDIUM]: { wins: 0, total: 0 },
    [AiLevel.HARD]: { wins: 0, total: 0 },
    [AiLevel.MASTER]: { wins: 0, total: 0 },
  },
  winStreak: 0,
  maxWinStreak: 0,
};

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (raw) {
      return { ...DEFAULT_STATS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('[Stats] 读取失败，使用默认值');
  }
  return { ...DEFAULT_STATS };
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch (e) {
    console.warn('[Stats] 保存失败');
  }
}

export function clearStats(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_STATS);
  } catch (e) {
    console.warn('[Stats] 清除失败');
  }
}