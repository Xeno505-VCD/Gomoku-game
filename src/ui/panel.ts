import { ChessColor, GameMode, GameStatus } from '../enums';
import type { GameStats } from '../types';

/**
 * DOM面板管理器
 * 负责信息栏、侧面板按钮、战绩显示的绑定与更新
 */
export class Panel {
  // 元素引用
  currentTurnEl: HTMLElement;
  gameStatusEl: HTMLElement;
  timerBarEl: HTMLElement;
  aiHintEl: HTMLElement;
  statsBarEl: HTMLElement;
  onlinePanelEl: HTMLElement;
  aiPanelEl: HTMLElement;
  roomInfoEl: HTMLElement;
  btnSurrender: HTMLButtonElement;
  btnDraw: HTMLButtonElement;
  btnUndo: HTMLButtonElement;

  // 模式单选
  modeAiRadio: HTMLInputElement;
  modePvpRadio: HTMLInputElement;
  modeOnlineRadio: HTMLInputElement;

  // 联机房间
  btnCreateRoom: HTMLButtonElement;
  btnJoinRoom: HTMLButtonElement;
  roomInput: HTMLInputElement;

  // AI难度
  aiLevelSelect: HTMLSelectElement;

  private modeChangeCallbacks: ((mode: GameMode) => void)[] = [];

  constructor() {
    this.currentTurnEl = document.getElementById('currentTurn')!;
    this.gameStatusEl = document.getElementById('gameStatus')!;
    this.timerBarEl = document.getElementById('timerBar')!;
    this.aiHintEl = document.getElementById('aiHint')!;
    this.statsBarEl = document.getElementById('statsBar')!;
    this.onlinePanelEl = document.getElementById('onlinePanel')!;
    this.aiPanelEl = document.getElementById('aiPanel')!;
    this.roomInfoEl = document.getElementById('roomInfo')!;
    this.btnSurrender = document.getElementById('btnSurrender') as HTMLButtonElement;
    this.btnDraw = document.getElementById('btnDraw') as HTMLButtonElement;
    this.btnUndo = document.getElementById('btnUndo') as HTMLButtonElement;
    this.modeAiRadio = document.getElementById('modeAi') as HTMLInputElement;
    this.modePvpRadio = document.getElementById('modePvp') as HTMLInputElement;
    this.modeOnlineRadio = document.getElementById('modeOnline') as HTMLInputElement;
    this.btnCreateRoom = document.getElementById('btnCreateRoom') as HTMLButtonElement;
    this.btnJoinRoom = document.getElementById('btnJoinRoom') as HTMLButtonElement;
    this.roomInput = document.getElementById('roomInput') as HTMLInputElement;
    this.aiLevelSelect = document.getElementById('aiLevel') as HTMLSelectElement;
  }

  /** 绑定模式切换事件 */
  onModeChange(cb: (mode: GameMode) => void): void {
    this.modeChangeCallbacks.push(cb);
  }

  /** 初始化模式切换监听 */
  initModeListeners(getCurrentMode: () => GameMode): void {
    this.modeAiRadio.addEventListener('change', () => this.fireModeChange(GameMode.AI));
    this.modePvpRadio.addEventListener('change', () => this.fireModeChange(GameMode.PVP));
    this.modeOnlineRadio.addEventListener('change', () => {
      this.onlinePanelEl.style.display = 'flex';
      this.aiPanelEl.style.display = 'none';
      this.fireModeChange(GameMode.ONLINE);
    });
  }

  private fireModeChange(mode: GameMode): void {
    for (const cb of this.modeChangeCallbacks) cb(mode);
  }

  /** 切换到模式对应的面板显示 */
  showModeUI(mode: GameMode): void {
    if (mode === GameMode.ONLINE) {
      this.onlinePanelEl.style.display = 'flex';
      this.aiPanelEl.style.display = 'none';
    } else {
      this.onlinePanelEl.style.display = 'none';
      this.aiPanelEl.style.display = 'block';
      this.timerBarEl.style.display = 'none';
    }
  }

  /** 更新当前执棋方显示 */
  updateTurn(color: ChessColor): void {
    this.currentTurnEl.textContent = color === ChessColor.BLACK ? '黑棋' : '白棋';
  }

  /** 更新对局状态文字 */
  updateStatus(text: string): void {
    this.gameStatusEl.textContent = text;
  }

  /** 更新提示文字 */
  updateHint(text: string): void {
    this.aiHintEl.textContent = text;
  }

  /** 更新战绩显示 */
  updateStats(stats: GameStats): void {
    this.statsBarEl.textContent =
      `总局:${stats.total} 胜:${stats.wins} 负:${stats.losses} 和:${stats.draws} | 连胜:${stats.streak}(${stats.maxStreak}场最佳)`;
  }

  /** 更新联机房间信息 */
  updateRoomInfo(text: string): void {
    this.roomInfoEl.textContent = text;
  }

  /** 设置按钮可用/禁用 */
  setButtonsEnabled(enabled: boolean): void {
    this.btnSurrender.disabled = !enabled;
    this.btnDraw.disabled = !enabled;
    this.btnUndo.disabled = !enabled;
  }

  /** 显示/隐藏计时器 */
  showTimer(seconds: number): void {
    this.timerBarEl.style.display = 'inline';
    this.timerBarEl.textContent = `⏱ ${seconds}s`;
  }

  hideTimer(): void {
    this.timerBarEl.style.display = 'none';
  }

  updateTimer(seconds: number): void {
    this.timerBarEl.textContent = `⏱ ${seconds}s`;
  }

  /** 获取当前选中的AI难度值 */
  getAiLevel(): number {
    return parseInt(this.aiLevelSelect.value);
  }

  /** 获取房间号输入 */
  getRoomInput(): string {
    return this.roomInput.value;
  }

  /** 生成随机房间号 */
  static randomRoomId(): string {
    return String(Math.floor(1000 + Math.random() * 9000));
  }
}