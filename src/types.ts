import { AiLevel, ChessColor, GameMode, GameStatus, PlayerRole } from './enums';

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

/** 落子历史记录 */
export interface HistoryStep {
  row: number;
  col: number;
  color: ChessColor;
}

/** 对局数据统计 */
export interface GameStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  /** 连胜场次 */
  streak: number;
  /** 最大连胜 */
  maxStreak: number;
}

/** 布局尺寸配置 */
export interface LayoutConfig {
  /** 画布宽度 */
  canvasWidth: number;
  /** 画布高度 */
  canvasHeight: number;
  /** 棋盘左上角X */
  boardX: number;
  /** 棋盘左上角Y */
  boardY: number;
  /** 单个格子像素 */
  cellSize: number;
  /** 棋子半径 */
  stoneRadius: number;
}

/** 联机WebSocket消息 */
export interface WsMessage {
  type: string;
  [key: string]: unknown;
}