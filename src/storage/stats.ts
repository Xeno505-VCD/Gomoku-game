import { STORAGE_KEY_STATS } from '../constants';
import type { GameStats } from '../types';

/**
 * 战绩持久化（localStorage）
 */
export class StatsStorage {
  private static defaults: GameStats = {
    total: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    streak: 0,
    maxStreak: 0,
  };

  /** 加载战绩 */
  static load(): GameStats {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STATS);
      if (!raw) return { ...StatsStorage.defaults };
      const parsed = JSON.parse(raw);
      return {
        total: parsed.total || 0,
        wins: parsed.wins || 0,
        losses: parsed.losses || 0,
        draws: parsed.draws || 0,
        streak: parsed.streak || 0,
        maxStreak: parsed.maxStreak || 0,
      };
    } catch {
      return { ...StatsStorage.defaults };
    }
  }

  /** 保存战绩 */
  static save(stats: GameStats): void {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch { /* localStorage 不可用时静默失败 */ }
  }
}