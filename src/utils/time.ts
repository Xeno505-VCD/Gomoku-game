/**
 * 计时器工具
 */

/** 格式化秒数为 mm:ss */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/** 倒计时工具类 */
export class Countdown {
  private remaining: number;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private onTick: ((remaining: number) => void) | null = null;
  private onComplete: (() => void) | null = null;
  private interval = 1000;

  constructor(seconds: number) {
    this.remaining = seconds;
  }

  /** 设置每秒回调 */
  setOnTick(cb: (remaining: number) => void): this {
    this.onTick = cb;
    return this;
  }

  /** 设置完成回调 */
  setOnComplete(cb: () => void): this {
    this.onComplete = cb;
    return this;
  }

  /** 开始倒计时 */
  start(): void {
    this.stop();
    this.onTick?.(this.remaining);
    this.timerId = setInterval(() => {
      this.remaining--;
      this.onTick?.(this.remaining);
      if (this.remaining <= 0) {
        this.stop();
        this.onComplete?.();
      }
    }, this.interval);
  }

  /** 停止倒计时 */
  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /** 重置倒计时 */
  reset(seconds: number): void {
    this.stop();
    this.remaining = seconds;
  }

  /** 获取剩余秒数 */
  getRemaining(): number {
    return this.remaining;
  }
}

/**
 * 冷却管理器
 */
export class CooldownManager {
  private cooldowns: Map<string, number> = new Map();

  /**
   * 尝试触发操作，返回是否允许
   * @param key 操作标识
   * @param cooldownMs 冷却时间(毫秒)
   */
  tryTrigger(key: string, cooldownMs: number): boolean {
    const now = Date.now();
    const lastTrigger = this.cooldowns.get(key);
    if (lastTrigger && now - lastTrigger < cooldownMs) {
      return false;
    }
    this.cooldowns.set(key, now);
    return true;
  }

  /** 获取剩余冷却时间(ms) */
  getRemaining(key: string, cooldownMs: number): number {
    const now = Date.now();
    const lastTrigger = this.cooldowns.get(key);
    if (!lastTrigger) return 0;
    const remaining = cooldownMs - (now - lastTrigger);
    return Math.max(0, remaining);
  }

  /** 清除冷却 */
  clear(key: string): void {
    this.cooldowns.delete(key);
  }

  /** 清除所有 */
  clearAll(): void {
    this.cooldowns.clear();
  }
}