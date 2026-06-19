import { ChessColor } from '../enums';
import type { HistoryStep, Point } from '../types';

/**
 * 落子历史栈管理
 * 统一支撑悔棋、对局回放
 */
export class History {
  private steps: HistoryStep[] = [];

  /** 记录落子 */
  push(point: Point, color: ChessColor): void {
    this.steps.push({
      point: { ...point },
      color,
      stepNumber: this.steps.length + 1,
    });
  }

  /** 撤销最后一步，返回被撤销的步骤 */
  pop(): HistoryStep | null {
    if (this.steps.length === 0) return null;
    return this.steps.pop()!;
  }

  /** 撤销最后N步，返回被撤销的步骤列表 */
  popSteps(n: number): HistoryStep[] {
    const result: HistoryStep[] = [];
    const count = Math.min(n, this.steps.length);
    for (let i = 0; i < count; i++) {
      const step = this.steps.pop();
      if (step) result.push(step);
    }
    return result.reverse();
  }

  /** 获取最后一步 */
  last(): HistoryStep | null {
    if (this.steps.length === 0) return null;
    return this.steps[this.steps.length - 1];
  }

  /** 获取总步数 */
  size(): number {
    return this.steps.length;
  }

  /** 获取完整落子序列（供给回放存储） */
  getStepList(): HistoryStep[] {
    return [...this.steps];
  }

  /** 获取指定索引的步骤 */
  getStep(index: number): HistoryStep | null {
    if (index < 0 || index >= this.steps.length) return null;
    return this.steps[index];
  }

  /** 当前执棋颜色（根据步数奇偶） */
  currentColor(): ChessColor {
    return this.steps.length % 2 === 0 ? ChessColor.BLACK : ChessColor.WHITE;
  }

  /** 清空历史 */
  clear(): void {
    this.steps = [];
  }

  /** 从已有历史恢复 */
  restore(steps: HistoryStep[]): void {
    this.steps = steps.map(s => ({ ...s, point: { ...s.point } }));
  }

  /** 获取最近N步 */
  recentSteps(n: number): HistoryStep[] {
    const start = Math.max(0, this.steps.length - n);
    return this.steps.slice(start);
  }

  /** 对局是否刚开始 */
  isNewGame(): boolean {
    return this.steps.length === 0;
  }
}