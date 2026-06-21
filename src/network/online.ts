import { WS_URL, MOVE_TIMER_SECONDS } from '../constants';
import { ChessColor, GameStatus } from '../enums';
import type { BoardMatrix, HistoryStep, Point, WsMessage } from '../types';

/**
 * 联机对局事件回调
 */
export interface OnlineCallbacks {
  /** 分配到颜色 */
  onAssign: (color: ChessColor) => void;
  /** 等待对手 */
  onWaiting: (msg: string) => void;
  /** 对局开始 */
  onGameStart: (board: BoardMatrix, currentPlayer: ChessColor) => void;
  /** 对方落子（服务器确认） */
  onMove: (row: number, col: number, color: ChessColor, currentPlayer: ChessColor) => void;
  /** 对局结束 */
  onGameOver: (winner: ChessColor | null, winLine: Point[], reason?: string) => void;
  /** 和棋申请 */
  onDrawRequest: () => void;
  /** 和棋被拒 */
  onDrawRejected: () => void;
  /** 悔棋申请 */
  onUndoRequest: () => void;
  /** 悔棋被拒 */
  onUndoRejected: () => void;
  /** 悔棋已执行 */
  onUndoExecuted: (board: BoardMatrix, currentPlayer: ChessColor, moves: HistoryStep[]) => void;
  /** 对手离开 */
  onOpponentLeft: () => void;
  /** 连接断开 */
  onDisconnect: () => void;
  /** 倒计时开始 */
  onTimerStart: () => void;
  /** 倒计时重置 */
  onTimerReset: () => void;
  /** 倒计时停止 */
  onTimerStop: () => void;
}

/**
 * 联机WebSocket管理器
 * 采用SSOT（单一真相源）模式：服务器为唯一权威，客户端不本地先行绘制
 */
export class OnlineManager {
  private ws: WebSocket | null = null;
  private roomId = '';
  private myColor: ChessColor = ChessColor.EMPTY;
  private callbacks: OnlineCallbacks | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private intentionalClose = false;

  /** 注册回调 */
  setCallbacks(cbs: OnlineCallbacks): void {
    this.callbacks = cbs;
  }

  /** 创建房间 */
  createRoom(): string {
    this.roomId = String(Math.floor(1000 + Math.random() * 9000));
    this.connect();
    return this.roomId;
  }

  /** 加入房间 */
  joinRoom(roomId: string): void {
    this.roomId = roomId;
    this.connect();
  }

  /** 获取当前房间号 */
  getRoomId(): string {
    return this.roomId;
  }

  /** 获取我的颜色 */
  getMyColor(): ChessColor {
    return this.myColor;
  }

  /** 发送落子 */
  sendMove(row: number, col: number): void {
    this.send({ type: 'MOVE', row, col });
  }

  /** 发送认输 */
  sendSurrender(): void {
    this.send({ type: 'SURRENDER' });
  }

  /** 发送和棋申请 */
  sendDrawRequest(): void {
    this.send({ type: 'DRAW_REQUEST' });
  }

  /** 发送和棋回复 */
  sendDrawResponse(accept: boolean): void {
    this.send({ type: 'DRAW_RESPONSE', accept });
  }

  /** 发送悔棋申请 */
  sendUndoRequest(): void {
    this.send({ type: 'UNDO_REQUEST' });
  }

  /** 发送悔棋回复 */
  sendUndoResponse(accept: boolean): void {
    this.send({ type: 'UNDO_RESPONSE', accept });
  }

  /** 断开连接 */
  disconnect(): void {
    this.intentionalClose = true;
    this.cleanup();
  }

  // ==================== 内部实现 ====================

  private connect(): void {
    this.intentionalClose = false;
    this.cleanup();
    const wsUrl = WS_URL.replace('https', 'wss') + '/join?room=' + this.roomId;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      if (this.callbacks) {
        this.callbacks.onTimerStop();
      }
    };

    this.ws.onmessage = (e) => {
      try {
        const msg: WsMessage = JSON.parse(e.data);
        this.handleMessage(msg);
      } catch { /* 忽略解析失败的消息 */ }
    };

    this.ws.onclose = () => {
      this.stopPing();
      if (!this.intentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      } else {
        if (this.callbacks) this.callbacks.onDisconnect();
      }
    };

    this.startPing();
  }

  private handleMessage(msg: WsMessage): void {
    const cb = this.callbacks;
    if (!cb) return;

    switch (msg.type) {
      case 'ASSIGN':
        this.myColor = msg.color as ChessColor;
        cb.onAssign(this.myColor);
        break;
      case 'WAITING':
        cb.onWaiting(msg.msg as string);
        break;
      case 'GAME_START':
        cb.onGameStart(
          (msg.board as BoardMatrix) || [],
          (msg.currentPlayer as ChessColor) || ChessColor.BLACK,
        );
        cb.onTimerStart();
        break;
      case 'MOVE':
        // SSOT模式：完全信任服务器，直接绘制
        cb.onMove(
          msg.row as number,
          msg.col as number,
          msg.color as ChessColor,
          msg.currentPlayer as ChessColor,
        );
        cb.onTimerReset();
        break;
      case 'GAME_OVER':
        cb.onGameOver(
          (msg.winner as ChessColor) || null,
          (msg.winLine as Point[]) || [],
          msg.reason as string | undefined,
        );
        cb.onTimerStop();
        break;
      case 'DRAW_REQUEST':
        cb.onDrawRequest();
        break;
      case 'DRAW_REJECTED':
        cb.onDrawRejected();
        break;
      case 'UNDO_REQUEST':
        cb.onUndoRequest();
        break;
      case 'UNDO_REJECTED':
        cb.onUndoRejected();
        break;
      case 'UNDO_EXECUTED':
        cb.onUndoExecuted(
          msg.board as BoardMatrix,
          msg.currentPlayer as ChessColor,
          (msg.moves as HistoryStep[]) || [],
        );
        cb.onTimerReset();
        break;
      case 'OPPONENT_LEFT':
        cb.onOpponentLeft();
        cb.onTimerStop();
        break;
      case 'FULL':
        cb.onDisconnect();
        break;
    }
  }

  private send(data: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 16000);
    this.reconnectTimer = setTimeout(() => {
      if (!this.intentionalClose) {
        this.connect();
      }
    }, delay);
  }

  private cleanup(): void {
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onmessage = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
  }
}