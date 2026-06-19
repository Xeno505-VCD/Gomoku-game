/** 对局模式 */
export enum GameMode {
  /** 模式选择页（未开始） */
  MENU = 'MENU',
  /** 人机单机 */
  SINGLE_AI = 'SINGLE_AI',
  /** 本地双人同屏 */
  LOCAL_PVP = 'LOCAL_PVP',
  /** 在线联机（二期预留） */
  ONLINE_PVP = 'ONLINE_PVP',
}

/** AI难度等级 */
export enum AiLevel {
  NOVICE = 'NOVICE',
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  MASTER = 'MASTER',
}

/** 对局状态 */
export enum GameStatus {
  /** 空闲（未开始） */
  IDLE = 'IDLE',
  /** 对局进行中 */
  PLAYING = 'PLAYING',
  /** 等待对方确认（和棋/悔棋申请中） */
  WAIT_CONFIRM = 'WAIT_CONFIRM',
  /** 胜利 */
  WIN = 'WIN',
  /** 和棋 */
  DRAW = 'DRAW',
  /** 认输 */
  GIVE_UP = 'GIVE_UP',
}

/** 棋子颜色 */
export enum ChessColor {
  EMPTY = 0,
  BLACK = 1,
  WHITE = 2,
}

/** 弹窗类型 */
export enum DialogType {
  /** 和棋申请确认 */
  DRAW_REQUEST = 'DRAW_REQUEST',
  /** 悔棋申请确认 */
  UNDO_REQUEST = 'UNDO_REQUEST',
  /** 对局结果结算 */
  GAME_RESULT = 'GAME_RESULT',
  /** 确认操作（清空战绩等） */
  CONFIRM = 'CONFIRM',
}

/** 玩家角色 */
export enum PlayerRole {
  BLACK = 'BLACK',
  WHITE = 'WHITE',
}

/** 弹窗响应 */
export enum DialogResponse {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  TIMEOUT = 'TIMEOUT',
}