/**
 * 音频系统类型定义
 */

export enum SoundType {
  BUBBLE_POP = 'bubble-pop',        // 泡泡破裂音效
  ACHIEVEMENT = 'achievement',       // 成就奖励音效
  LEVEL_UP = 'level-up',            // 等级提升音效
  COUNTDOWN_COMPLETE = 'countdown-complete', // 倒计时完成音效
  UI_CLICK = 'ui-click',            // UI点击音效
  REWARD = 'reward',                // 通用奖励音效
}

export interface SoundConfig {
  type: SoundType;
  volume: number;           // 0.0 - 1.0
  loop: boolean;           // 是否循环播放
  preload: boolean;        // 是否预加载
}

export interface AudioManagerConfig {
  masterVolume: number;     // 主音量 0.0 - 1.0
  muted: boolean;          // 全局静音
  enablePreload: boolean;  // 是否启用预加载
  maxConcurrentSounds: number; // 最大同时播放音效数量
}

export interface AudioSettings {
  soundEnabled: boolean;   // 音效总开关
  musicEnabled: boolean;   // 背景音乐开关（预留）
  masterVolume: number;    // 主音量
  soundVolume: number;     // 音效音量
}

export interface AudioFileInfo {
  path: string;            // 音频文件路径
  duration?: number;       // 音频时长（秒）
  size?: number;          // 文件大小（字节）
  loaded: boolean;        // 是否已加载
  error?: string;         // 加载错误信息
}

// 音频播放状态
export enum AudioState {
  IDLE = 'idle',           // 空闲
  LOADING = 'loading',     // 加载中
  PLAYING = 'playing',     // 播放中
  PAUSED = 'paused',       // 暂停
  ERROR = 'error'          // 错误
}

// 音频播放实例
export interface AudioInstance {
  id: string;
  type: SoundType;
  state: AudioState;
  audioContext: any;      // 平台相关的音频上下文
  startTime: number;      // 开始播放时间
  volume: number;         // 当前音量
}