import type { Point } from '../types';
import { Renderer } from '../ui/renderer';

/**
 * 统一输入处理
 * 屏蔽PC鼠标与移动端触摸差异，统一输出棋盘坐标
 */
export class InputHandler {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private onClickCallback: ((point: Point) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, renderer: Renderer) {
    this.canvas = canvas;
    this.renderer = renderer;

    this.bindMouse();
    this.bindTouch();
  }

  /**
   * 设置点击回调（棋盘坐标）
   */
  setOnClick(callback: (point: Point) => void): void {
    this.onClickCallback = callback;
  }

  private handleCanvasPoint(px: number, py: number): void {
    const point = this.renderer.hitTest(px, py);
    if (point && this.onClickCallback) {
      this.onClickCallback(point);
    }
  }

  private bindMouse(): void {
    this.canvas.addEventListener('click', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      this.handleCanvasPoint(px, py);
    });
  }

  private bindTouch(): void {
    // 单点触摸锁定：仅响应单指操作
    let lastTouchTime = 0;

    this.canvas.addEventListener('touchstart', (e: TouchEvent) => {
      e.preventDefault();

      // 多指触摸忽略
      if (e.touches.length > 1) return;

      const now = Date.now();
      // 防连点（300ms内忽略）
      if (now - lastTouchTime < 300) return;
      lastTouchTime = now;

      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const px = (touch.clientX - rect.left) * scaleX;
      const py = (touch.clientY - rect.top) * scaleY;
      this.handleCanvasPoint(px, py);
    }, { passive: false });
  }

  /** 销毁事件监听 */
  destroy(): void {
    // 可通过记录绑定的函数引用来精准移除，此处简化处理
  }
}