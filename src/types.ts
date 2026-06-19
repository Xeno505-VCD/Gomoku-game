import { AiLevel, ChessColor, DialogType, GameMode, GameStatus, PlayerRole } from './enums';

/** 棋盘坐标 */
export interface Point {
  row: number;
  col: number;
}

/** 棋盘二维数组（15×15），0=空 1=黑 2=白 */
export type BoardMatrix = ChessColor[][];

/** AI配置参数 */
export interface AiConfig {
  level: AiLevel;
  /** 搜索深度 */
  searchDepth: number;
  /** 失误概率 (0-1) */
  mistakeRate: number;
  /** 进攻权重系数 */
  attackWeight: number;
  /** 防守权重系数 */
  defenseWeight: number;
  /** 是否启用开局定式 */
  useOpeningBook: boolean;
}

/** 棋型打分结果 */
export interface ChessScore {
  point: Point;
  score: number;
}

/** AI决策返回 */
export interface AiDecision {
  point: Point;
  score: number;
  /** 是否为失误落子 */
  isMistake: boolean;
}

/** 对局状态 */
export interface GameState {
  mode: GameMode;
  status: GameStatus;
  board: BoardMatrix;
  currentPlayer: ChessColor;
  /** 当前执棋方角色 */
  currentRole: PlayerRole;
  /** 人机模式下的AI难度 */
  aiLevel: AiLevel;
  /** 人机模式下玩家角色 */
  playerRole: PlayerRole;
  /** 胜利方 */
  winner: ChessColor | null;
  /** 五连棋子坐标列表 */
  winLine: Point[];
  /** 对局步数 */
  moveCount: number;
  /** 和棋申请方（联机用） */
  drawRequester: PlayerRole | null;
  /** 悔棋申请方（联机用） */
  undoRequester: PlayerRole | null;
}

/** 落子历史记录 */
export interface HistoryStep {
  point: Point;
  color: ChessColor;
  stepNumber: number;
}

/** 弹窗配置 */
export interface DialogConfig {
  type: DialogType;
  /** 弹窗标题 */
  title: string;
  /** 弹窗消息内容 */
  message: string;
  /** 确认按钮文案 */
  confirmText?: string;
  /** 取消按钮文案 */
  cancelText?: string;
  /** 超时秒数（0=不超时） */
  timeout: number;
  /** 是否需要遮罩 */
  hasMask: boolean;
}

/** 对局数据统计 */
export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  /** 各AI难度胜率 */
  aiWinRates: Record<AiLevel, { wins: number; total: number }>;
  /** 连胜场次 */
  winStreak: number;
  /** 最大连胜 */
  maxWinStreak: number;
}

/** 用户配置 */
export interface UserConfig {
  aiLevel: AiLevel;
  playerRole: PlayerRole;
  soundEnabled: boolean;
  skinId: string;
}

/** 布局尺寸配置 */
export interface LayoutConfig {
  /** 棋盘左上角X */
  boardX: number;
  /** 棋盘左上角Y */
  boardY: number;
  /** 单个格子像素 */
  cellSize: number;
  /** 棋盘总宽（含边距） */
  boardSize: number;
  /** 棋子半径 */
  stoneRadius: number;
  /** 画布宽度 */
  canvasWidth: number;
  /** 画布高度 */
  canvasHeight: number;
  /** 右侧面板X起点 */
  panelX: number;
  /** 顶部信息栏Y */
  infoY: number;
}

/** 事件总线回调类型 */
export type EventCallback<T = unknown> = (data: T) => void;