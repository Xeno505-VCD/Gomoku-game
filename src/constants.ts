// ==================== 棋盘常量 ====================
export const BOARD_SIZE = 15;
export const WIN_COUNT = 5;

/** 星位坐标列表 */
export const STAR_POINTS: { row: number; col: number }[] = [
  { row: 3, col: 3 }, { row: 3, col: 7 }, { row: 3, col: 11 },
  { row: 7, col: 3 }, { row: 7, col: 7 }, { row: 7, col: 11 },
  { row: 11, col: 3 }, { row: 11, col: 7 }, { row: 11, col: 11 },
];

// ==================== 渲染颜色常量 ====================
export const BOARD_BG_COLOR = '#DEB887';
export const BOARD_LINE_COLOR = '#5D4037';
export const STONE_BLACK_COLOR = '#1a1a1a';
export const STONE_BLACK_HIGHLIGHT = '#555555';
export const STONE_WHITE_COLOR = '#F5F5F5';
export const STONE_WHITE_BORDER = '#BDBDBD';
export const STONE_WHITE_HIGHLIGHT = '#FFFFFF';
export const LAST_MOVE_MARKER = '#FF5722';
export const WIN_HIGHLIGHT_COLOR = '#FFD700';

// ==================== 布局常量 ====================
export const CANVAS_MAX_WIDTH = 900;
export const CANVAS_MAX_HEIGHT = 650;
export const STONE_RADIUS_RATIO = 0.42;
export const MOBILE_WIDTH_THRESHOLD = 600;
export const BOARD_PADDING_RATIO = 0.05;

// ==================== AI常量 ====================
export const DEFAULT_AI_LEVEL = 2; // MEDIUM

// ==================== 存储Key ====================
export const STORAGE_KEY_STATS = 'gomoku_stats';

// ==================== 联机 ====================
/** 本地开发时连 localhost，部署后连 Render */
export const WS_URL = 
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'ws://localhost:3000'
    : 'https://gomoku-game-m1ls.onrender.com';
export const MOVE_TIMER_SECONDS = 30;
