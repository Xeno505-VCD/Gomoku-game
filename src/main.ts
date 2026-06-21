import { BOARD_SIZE } from './constants';
import { ChessColor, GameMode, GameStatus } from './enums';
import type { BoardMatrix, HistoryStep, Point } from './types';
import { Board } from './core/board';
import { Judge } from './core/judge';
import { GameController } from './core/game-controller';
import { calculateLayout } from './ui/layout';
import { Renderer } from './ui/renderer';
import { Panel } from './ui/panel';
import { InputHandler } from './input/input-handler';
import { OnlineManager } from './network/online';
import { MoveTimer } from './utils/timer';
import { StatsStorage } from './storage/stats';

/**
 * 五子棋应用主入口
 * 组装所有模块并编排游戏流程
 */
class GomokuApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer!: Renderer;
  private inputHandler!: InputHandler;
  private controller: GameController;
  private panel: Panel;
  private online: OnlineManager;
  private timer: MoveTimer;

  // 联机状态
  private onlineActive = false;
  private myColor: ChessColor = ChessColor.EMPTY;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.controller = new GameController();
    this.panel = new Panel();
    this.online = new OnlineManager();
    this.timer = new MoveTimer();

    // 初始化布局
    this.recalcLayout();
    window.addEventListener('resize', () => this.recalcLayout());

    // 加载战绩
    this.controller.setStats(StatsStorage.load());
    this.panel.updateStats(this.controller.stats);

    // 模式切换
    this.panel.initModeListeners(() => this.controller.gameMode);
    this.panel.onModeChange((mode) => this.switchMode(mode));

    // 按钮事件
    this.bindButtons();

    // 计时器
    this.timer.setOnTick((s) => this.panel.updateTimer(s));
    this.timer.setOnTimeout(() => {
      if (this.controller.gameMode === GameMode.ONLINE && this.onlineActive) {
        this.panel.updateHint('超时！你输了');
        this.online.sendSurrender();
      }
    });

    // 联机回调
    this.online.setCallbacks({
      onAssign: (color) => {
        this.myColor = color;
        this.panel.updateHint('你执' + (color === ChessColor.BLACK ? '黑棋' : '白棋'));
      },
      onWaiting: (msg) => {
        this.panel.updateHint(msg);
      },
      onGameStart: (board, currentPlayer) => {
        this.controller.reset();
        this.controller.board.importState(board || [], []);
        this.controller.currentPlayer = currentPlayer;
        this.panel.updateTurn(currentPlayer);
        this.panel.updateStatus('对局中');
        this.panel.updateHint('你执' + (this.myColor === ChessColor.BLACK ? '黑棋' : '白棋'));
        this.render();
        this.timer.start();
      },
      onMove: (row, col, color, currentPlayer) => {
        // SSOT：服务器是唯一真相源
        this.controller.board.placeStone(row, col, color);
        this.controller.currentPlayer = currentPlayer;
        this.panel.updateTurn(currentPlayer);
        this.render();
        this.timer.reset();
      },
      onGameOver: (winner, winLine, reason) => {
        if (winner) {
          this.controller.status = GameStatus.WIN;
          this.controller.winLine = winLine;
          const myWin = winner === this.myColor;
          this.panel.updateStatus(myWin ? '你赢了！' : '你输了！');
          this.controller.recordResult(myWin ? 'win' : 'loss');
        } else {
          this.controller.status = GameStatus.DRAW;
          this.panel.updateStatus('对局和棋！');
          this.controller.recordResult('draw');
        }
        this.panel.setButtonsEnabled(false);
        this.timer.stop();
        StatsStorage.save(this.controller.stats);
        this.panel.updateStats(this.controller.stats);
        this.render();
      },
      onDrawRequest: () => {
        if (confirm('对手申请和棋，同意？')) {
          this.online.sendDrawResponse(true);
        } else {
          this.online.sendDrawResponse(false);
        }
      },
      onDrawRejected: () => {
        this.panel.updateHint('对手拒绝和棋');
      },
      onUndoRequest: () => {
        if (confirm('对手申请悔棋，同意？')) {
          this.online.sendUndoResponse(true);
        } else {
          this.online.sendUndoResponse(false);
        }
      },
      onUndoRejected: () => {
        this.panel.updateHint('对手拒绝悔棋');
      },
      onUndoExecuted: (board, currentPlayer, moves) => {
        this.controller.board.importState(board, moves);
        this.controller.currentPlayer = currentPlayer;
        this.controller.status = GameStatus.PLAYING;
        this.panel.updateStatus('对局中');
        this.panel.updateTurn(currentPlayer);
        this.render();
        this.timer.reset();
      },
      onOpponentLeft: () => {
        this.panel.updateHint('对手已离开');
        this.timer.stop();
      },
      onDisconnect: () => {
        this.panel.updateHint('连接已断开');
        this.timer.stop();
      },
      onTimerStart: () => {
        this.timer.start();
      },
      onTimerReset: () => {
        this.timer.reset();
      },
      onTimerStop: () => {
        this.timer.stop();
      },
    });

    // 初始渲染
    this.render();
  }

  private recalcLayout(): void {
    const layout = calculateLayout();
    this.canvas.width = layout.canvasWidth;
    this.canvas.height = layout.canvasHeight;
    if (!this.renderer) {
      this.renderer = new Renderer(this.ctx, layout);
      this.inputHandler = new InputHandler(this.canvas, layout);
      this.inputHandler.setOnClick((point) => this.handleClick(point));
    } else {
      this.renderer.updateLayout(layout);
      this.inputHandler.updateLayout(layout);
    }
    this.render();
  }

  private bindButtons(): void {
    this.panel.btnSurrender.addEventListener('click', () => this.surrender());
    this.panel.btnDraw.addEventListener('click', () => this.requestDraw());
    this.panel.btnUndo.addEventListener('click', () => this.requestUndo());
    document.getElementById('btnCreateRoom')!.addEventListener('click', () => this.createRoom());
    document.getElementById('btnJoinRoom')!.addEventListener('click', () => this.joinRoom());
    document.getElementById('aiLevel')!.addEventListener('change', () => {
      this.controller.setAiLevel(this.panel.getAiLevel());
      this.restart();
    });
    document.getElementById('restartBtn')!.addEventListener('click', () => this.restart());
  }

  private switchMode(mode: GameMode): void {
    this.online.disconnect();
    this.onlineActive = false;
    this.timer.stop();
    this.panel.hideTimer();
    this.controller.setMode(mode);
    this.panel.showModeUI(mode);
    this.panel.setButtonsEnabled(true);
    this.panel.updateStatus('对局中');
    this.panel.updateHint('');
    this.render();
  }

  private restart(): void {
    this.controller.setAiLevel(this.panel.getAiLevel());
    this.controller.reset();
    this.panel.setButtonsEnabled(true);
    this.panel.updateStatus('对局中');
    this.panel.updateTurn(ChessColor.BLACK);
    this.panel.updateHint('');
    this.timer.stop();
    this.panel.hideTimer();
    this.render();
  }

  private handleClick(point: Point): void {
    if (this.controller.gameMode === GameMode.ONLINE) {
      if (!this.onlineActive) return;
      if (this.controller.status !== GameStatus.PLAYING) return;
      if (this.controller.currentPlayer !== this.myColor) return;
      // SSOT：只发WS，不本地落子
      this.online.sendMove(point.row, point.col);
      return;
    }

    // 人机模式检查
    if (this.controller.gameMode === GameMode.AI &&
        this.controller.currentPlayer !== ChessColor.BLACK) return;

    // 本地模式
    const result = this.controller.placeStone(point.row, point.col);
    this.handleMoveResult(result);
  }

  private handleMoveResult(result: { action: 'MOVE' | 'WIN' | 'DRAW'; winner?: ChessColor; winLine?: Point[] }): void {
    this.render();
    this.panel.updateTurn(this.controller.currentPlayer);

    if (result.action === 'WIN') {
      this.panel.setButtonsEnabled(false);
      const winnerText = result.winner === ChessColor.BLACK ? '黑棋胜利！' : '白棋胜利！';
      this.panel.updateStatus(winnerText);
      if (this.controller.gameMode === GameMode.AI) {
        this.controller.recordResult(result.winner === ChessColor.BLACK ? 'win' : 'loss');
      } else {
        this.controller.recordResult(result.winner === ChessColor.BLACK ? 'win' : 'loss');
      }
      StatsStorage.save(this.controller.stats);
      this.panel.updateStats(this.controller.stats);
      return;
    }

    if (result.action === 'DRAW') {
      this.panel.setButtonsEnabled(false);
      this.panel.updateStatus('对局和棋！棋盘已满');
      this.controller.recordResult('draw');
      StatsStorage.save(this.controller.stats);
      this.panel.updateStats(this.controller.stats);
      return;
    }

    // MOVE - AI模式自动响应
    if (this.controller.gameMode === GameMode.AI &&
        this.controller.currentPlayer === ChessColor.WHITE &&
        this.controller.status === GameStatus.PLAYING) {
      this.controller.status = GameStatus.AI_THINKING;
      this.panel.updateHint('AI思考中...');
      setTimeout(() => {
        if (this.controller.status !== GameStatus.AI_THINKING) return;
        const empty: Point[] = [];
        for (let r = 0; r < BOARD_SIZE; r++)
          for (let c = 0; c < BOARD_SIZE; c++)
            if (this.controller.board.get(r, c) === ChessColor.EMPTY)
              empty.push({ row: r, col: c });
        if (empty.length === 0) return;
        const mv = empty[Math.floor(Math.random() * empty.length)];
        const aiResult = this.controller.placeStone(mv.row, mv.col);
        this.handleMoveResult(aiResult);
      }, 50);
    }
  }

  private surrender(): void {
    if (this.controller.gameMode === GameMode.ONLINE && this.onlineActive) {
      this.online.sendSurrender();
      this.controller.status = GameStatus.DRAW;
      this.panel.setButtonsEnabled(false);
      this.timer.stop();
      this.panel.updateStatus('你认输了！');
      this.render();
      return;
    }
    if (this.controller.status !== GameStatus.PLAYING &&
        this.controller.status !== GameStatus.AI_THINKING) return;
    const loser = this.controller.currentPlayer;
    this.controller.surrender();
    this.panel.setButtonsEnabled(false);
    this.panel.updateStatus(
      loser === ChessColor.BLACK ? '黑棋认输，白棋胜！' : '白棋认输，黑棋胜！'
    );
    this.controller.recordResult('loss');
    StatsStorage.save(this.controller.stats);
    this.panel.updateStats(this.controller.stats);
    this.render();
  }

  private requestDraw(): void {
    if (this.controller.status !== GameStatus.PLAYING &&
        this.controller.status !== GameStatus.AI_THINKING) return;

    if (this.controller.gameMode === GameMode.ONLINE && this.onlineActive) {
      this.online.sendDrawRequest();
      return;
    }

    if (this.controller.gameMode === GameMode.AI) {
      this.controller.draw();
      this.panel.setButtonsEnabled(false);
      this.panel.updateStatus('对局和棋！');
      this.controller.recordResult('draw');
      StatsStorage.save(this.controller.stats);
      this.panel.updateStats(this.controller.stats);
      this.render();
    } else {
      if (confirm('确定和棋？')) {
        this.controller.draw();
        this.panel.setButtonsEnabled(false);
        this.panel.updateStatus('对局和棋！');
        this.controller.recordResult('draw');
        StatsStorage.save(this.controller.stats);
        this.panel.updateStats(this.controller.stats);
        this.render();
      }
    }
  }

  private requestUndo(): void {
    if (this.controller.gameMode === GameMode.ONLINE && this.onlineActive) {
      this.online.sendUndoRequest();
      return;
    }
    this.controller.undo();
    this.panel.updateStatus('对局中');
    this.panel.updateTurn(this.controller.currentPlayer);
    this.render();
  }

  private createRoom(): void {
    const roomId = this.online.createRoom();
    this.panel.updateRoomInfo('房间号: ' + roomId);
    this.onlineActive = true;
    this.controller.setMode(GameMode.ONLINE);
    this.controller.reset();
  }

  private joinRoom(): void {
    const roomId = this.panel.getRoomInput();
    if (!roomId || roomId.length !== 4) {
      alert('请输入4位房间号');
      return;
    }
    this.online.joinRoom(roomId);
    this.panel.updateRoomInfo('已连接 房间:' + roomId);
    this.onlineActive = true;
    this.controller.setMode(GameMode.ONLINE);
    this.controller.reset();
  }

  private render(): void {
    this.renderer.draw(
      this.controller.board.getGrid(),
      this.controller.board.getLastMove(),
      this.controller.winLine,
    );
  }
}

// 启动
document.addEventListener('DOMContentLoaded', () => {
  new GomokuApp();
});