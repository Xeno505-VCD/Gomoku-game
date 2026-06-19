import { AiLevel, PlayerRole } from './enums';
import type { AiConfig } from './types';

// ==================== 调试开关 ====================
/** 开发调试模式，开启后输出AI打分/对局状态日志 */
export const DEBUG = false;

// ==================== 棋盘常量 ====================
/** 棋盘行列数 */
export const BOARD_SIZE = 15;

/** 棋盘总格数 */
export const MAX_MOVES = BOARD_SIZE * BOARD_SIZE;

/** 天元坐标 */
export const CENTER_POINT = { row: 7, col: 7 };

/** 星位坐标列表 */
export const STAR_POINTS: { row: number; col: number }[] = [
  { row: 3, col: 3 }, { row: 3, col: 7 }, { row: 3, col: 11 },
  { row: 7, col: 3 }, { row: 7, col: 7 }, { row: 7, col: 11 },
  { row: 11, col: 3 }, { row: 11, col: 7 }, { row: 11, col: 11 },
];

// ==================== 对局规则常量 ====================
/** 连续同色棋子数判定胜利 */
export const WIN_COUNT = 5;

/** 和棋循环判定：无有效进攻回合阈值 */
export const DRAW_NO_ATTACK_THRESHOLD = 20;

/** 落子渲染棋子半径占格子比例 */
export const STONE_RADIUS_RATIO = 0.42;

// ==================== AI难度配置表 ====================
/** 各难度AI参数配置 */
export const AI_CONFIGS: Record<AiLevel, AiConfig> = {
  [AiLevel.NOVICE]: {
    level: AiLevel.NOVICE,
    searchDepth: 0,
    mistakeRate: 0.6,
    attackWeight: 0.2,
    defenseWeight: 0.8,
    useOpeningBook: false,
  },
  [AiLevel.EASY]: {
    level: AiLevel.EASY,
    searchDepth: 0,
    mistakeRate: 0.35,
    attackWeight: 0.3,
    defenseWeight: 0.7,
    useOpeningBook: false,
  },
  [AiLevel.MEDIUM]: {
    level: AiLevel.MEDIUM,
    searchDepth: 2,
    mistakeRate: 0.15,
    attackWeight: 0.55,
    defenseWeight: 0.65,
    useOpeningBook: false,
  },
  [AiLevel.HARD]: {
    level: AiLevel.HARD,
    searchDepth: 4,
    mistakeRate: 0.05,
    attackWeight: 0.7,
    defenseWeight: 0.6,
    useOpeningBook: true,
  },
  [AiLevel.MASTER]: {
    level: AiLevel.MASTER,
    searchDepth: 6,
    mistakeRate: 0,
    attackWeight: 0.85,
    defenseWeight: 0.75,
    useOpeningBook: true,
  },
};

/** AI工作线程超时时间（毫秒），大师级搜索超过此时间强制中断 */
export const AI_WORKER_TIMEOUT = 5000;

/** 默认AI难度 */
export const DEFAULT_AI_LEVEL = AiLevel.MEDIUM;

/** 默认玩家执棋方（人机模式） */
export const DEFAULT_PLAYER_ROLE = PlayerRole.BLACK;

// ==================== UI布局常量 ====================
/** PC端画布默认宽度 */
export const CANVAS_DEFAULT_WIDTH = 900;

/** PC端画布默认高度 */
export const CANVAS_DEFAULT_HEIGHT = 650;

/** 棋盘边距（占棋盘总尺寸的比例） */
export const BOARD_PADDING_RATIO = 0.05;

/** 棋盘占画布可用宽度的比例 */
export const BOARD_WIDTH_RATIO = 0.72;

/** 右侧面板宽度占画布比例 */
export const PANEL_WIDTH_RATIO = 0.22;

/** 顶部信息栏高度 */
export const INFO_PANEL_HEIGHT = 40;

/** 小屏幕宽阈值（低于此值使用移动端布局） */
export const MOBILE_WIDTH_THRESHOLD = 600;

/** 极小屏幕宽阈值（低于此值整体缩放） */
export const MIN_SCREEN_WIDTH = 320;

// ==================== 按钮尺寸常量 ====================
/** PC端按钮最小宽度(px) */
export const BUTTON_MIN_WIDTH = 80;

/** PC端按钮高度 */
export const BUTTON_HEIGHT = 36;

/** 移动端按钮最小边长(dp) */
export const BUTTON_MOBILE_SIZE = 48;

/** 按钮间距比例 */
export const BUTTON_GAP_RATIO = 0.33;

// ==================== 颜色常量 ====================
/** 棋盘背景色 */
export const BOARD_BG_COLOR = '#DEB887';

/** 棋盘线色 */
export const BOARD_LINE_COLOR = '#5D4037';

/** 黑棋颜色 */
export const STONE_BLACK_COLOR = '#1a1a1a';

/** 黑棋高亮色 */
export const STONE_BLACK_HIGHLIGHT = '#555555';

/** 白棋颜色 */
export const STONE_WHITE_COLOR = '#F5F5F5';

/** 白棋边缘色 */
export const STONE_WHITE_BORDER = '#BDBDBD';

/** 白棋高亮色 */
export const STONE_WHITE_HIGHLIGHT = '#FFFFFF';

/** 最后落子标记色 */
export const LAST_MOVE_MARKER = '#FF5722';

/** 五连高亮色 */
export const WIN_HIGHLIGHT_COLOR = '#FFD700';

/** 按钮-认输红色 */
export const BUTTON_SURRENDER_COLOR = '#E53935';

/** 按钮-和棋橙色 */
export const BUTTON_DRAW_COLOR = '#FB8C00';

/** 按钮-常规蓝 */
export const BUTTON_NORMAL_COLOR = '#1E88E5';

/** 按钮-同意绿色 */
export const BUTTON_AGREE_COLOR = '#43A047';

/** 按钮-拒绝灰色 */
export const BUTTON_REJECT_COLOR = '#757575';

/** 按钮-禁用状态色 */
export const BUTTON_DISABLED_COLOR = '#9E9E9E';

/** 按钮-禁用文字色 */
export const BUTTON_DISABLED_TEXT = '#616161';

/** 按钮文字色 */
export const BUTTON_TEXT_COLOR = '#FFFFFF';

/** 信息面板背景色 */
export const INFO_BG_COLOR = '#3E2723';

/** 信息面板文字色 */
export const INFO_TEXT_COLOR = '#FFECB3';

// ==================== 弹窗常量 ====================
/** 弹窗宽度 */
export const DIALOG_WIDTH = 280;

/** 弹窗高度 */
export const DIALOG_HEIGHT = 180;

/** 弹窗遮罩颜色 */
export const DIALOG_MASK_COLOR = 'rgba(0, 0, 0, 0.5)';

/** 和棋/悔棋申请超时秒数 */
export const DRAW_REQUEST_TIMEOUT = 15;

/** 和棋/悔棋申请冷却秒数 */
export const REQUEST_COOLDOWN = 10;

// ==================== 动画常量 ====================
/** 五连高亮闪烁次数 */
export const WIN_BLINK_COUNT = 4;

/** 高亮闪烁间隔(ms) */
export const WIN_BLINK_INTERVAL = 300;

/** 弹窗淡入时间(ms) */
export const DIALOG_FADE_IN = 200;

/** 按钮点击缩放时间(ms) */
export const BUTTON_CLICK_SCALE_DURATION = 100;

// ==================== 存储Key常量 ====================
export const STORAGE_KEY_STATS = 'gomoku_stats';
export const STORAGE_KEY_CONFIG = 'gomoku_config';
export const STORAGE_KEY_RECORDS = 'gomoku_records';

/** 最多存储的回放对局数 */
export const MAX_RECORD_COUNT = 20;

// ==================== 按钮文案常量 ====================
export const TEXT_SURRENDER = '认输';
export const TEXT_DRAW = '申请和棋';
export const TEXT_UNDO = '悔棋';
export const TEXT_RESTART = '重新开局';
export const TEXT_SWAP_SIDE = '切换先后手';
export const TEXT_PAUSE_TIMER = '暂停计时';
export const TEXT_BACK = '返回主页';
export const TEXT_SOUND = '音效';
export const TEXT_SKIN = '皮肤';
export const TEXT_RULES = '规则说明';
export const TEXT_REPLAY = '对局回放';
export const TEXT_CLEAR_STATS = '清空战绩';
export const TEXT_REPLAY_AGAIN = '再来一局';
export const TEXT_BACK_MENU = '返回选模式';
export const TEXT_CONFIRM_CLEAR = '确认清空';
export const TEXT_CANCEL = '取消';
export const TEXT_AGREE_DRAW = '同意和棋';
export const TEXT_REJECT_DRAW = '拒绝和棋';
export const TEXT_AGREE_UNDO = '同意悔棋';
export const TEXT_REJECT_UNDO = '拒绝悔棋';

/** 和棋文案 */
export const TEXT_DRAW_RESULT = '对局和棋！';
export const TEXT_WIN_RESULT = '你赢了！';
export const TEXT_LOSE_RESULT = '你输了！';
export const TEXT_DRAW_SENT = '已向对手发送和棋申请，等待对方确认';
export const TEXT_UNDO_SENT = '已向对手发送悔棋申请，等待对方确认';
export const TEXT_COOLDOWN = '请稍后再试';
export const TEXT_WAITING_OPPONENT = '等待对方操作...';