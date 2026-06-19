import type { EventCallback } from '../types';

/**
 * 全局事件总线（发布订阅模式）
 * 用于解耦UI、Game控制器、AI、Storage模块
 */
class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * 订阅事件
   */
  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    // 返回取消订阅函数
    return () => this.off(event, callback);
  }

  /**
   * 取消订阅
   */
  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback as EventCallback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 发布事件
   */
  emit<T = unknown>(event: string, data: T): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[EventBus] Error in handler for "${event}":`, e);
        }
      });
    }
  }

  /**
   * 清除所有监听
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * 获取事件监听数量
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

/** 全局事件总线单例 */
export const eventBus = new EventBus();

// ==================== 事件名称常量 ====================

/** 落子事件 */
export const EVENT_PLACE_CHESS = 'place_chess';

/** 胜负判定事件 */
export const EVENT_GAME_OVER = 'game_over';

/** 对局状态变更 */
export const EVENT_STATUS_CHANGE = 'status_change';

/** 和棋申请 */
export const EVENT_DRAW_REQUEST = 'draw_request';

/** 和棋结果 */
export const EVENT_DRAW_RESULT = 'draw_result';

/** 悔棋申请 */
export const EVENT_UNDO_REQUEST = 'undo_request';

/** 悔棋执行 */
export const EVENT_UNDO_EXECUTED = 'undo_executed';

/** 认输 */
export const EVENT_SURRENDER = 'surrender';

/** 重新开局 */
export const EVENT_RESTART = 'restart';

/** 弹窗打开 */
export const EVENT_DIALOG_OPEN = 'dialog_open';

/** 弹窗关闭 */
export const EVENT_DIALOG_CLOSE = 'dialog_close';

/** AI开始计算 */
export const EVENT_AI_THINKING = 'ai_thinking';

/** AI计算完成 */
export const EVENT_AI_DONE = 'ai_done';

/** 棋盘渲染请求 */
export const EVENT_RENDER = 'render';