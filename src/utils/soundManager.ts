/**
 * 音频管理器 - 跨平台音效播放和管理
 * 支持 H5、小程序、App 等多平台
 */

import { SoundType, SoundConfig, AudioManagerConfig, AudioSettings, AudioFileInfo, AudioState, AudioInstance } from './audioTypes';
import { globalEventBus } from './index';

class SoundManager {
  private static instance: SoundManager | null = null;
  
  // 配置
  private config: AudioManagerConfig = {
    masterVolume: 0.8,
    muted: false,
    enablePreload: true,
    maxConcurrentSounds: 5
  };
  
  // 用户设置
  private settings: AudioSettings = {
    soundEnabled: true,
    musicEnabled: true,
    masterVolume: 0.8,
    soundVolume: 0.8
  };
  
  // 音频文件信息
  private audioFiles: Map<SoundType, AudioFileInfo> = new Map();
  
  // 音频配置
  private soundConfigs: Map<SoundType, SoundConfig> = new Map();
  
  // 当前播放的音频实例
  private playingInstances: Map<string, AudioInstance> = new Map();
  
  // 音频上下文缓存
  private audioContextCache: Map<SoundType, any[]> = new Map();
  
  private initialized: boolean = false;
  private platform: string = '';

  constructor() {
    this.initSoundConfigs();
    this.detectPlatform();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * 初始化音频管理器
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 加载用户设置
      this.loadSettings();
      
      // 初始化音频文件路径
      this.initAudioFiles();
      
      // 预加载音效（如果启用）
      if (this.config.enablePreload) {
        await this.preloadSounds();
      }
      
      this.initialized = true;
      console.log('音频管理器初始化成功');
      
    } catch (error) {
      console.error('音频管理器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 检测运行平台
   */
  private detectPlatform(): void {
    // #ifdef H5
    this.platform = 'h5';
    // #endif
    
    // #ifdef MP-WEIXIN
    this.platform = 'mp-weixin';
    // #endif
    
    // #ifdef MP-ALIPAY
    this.platform = 'mp-alipay';
    // #endif
    
    // #ifdef APP-PLUS
    this.platform = 'app';
    // #endif
  }

  /**
   * 初始化音效配置
   */
  private initSoundConfigs(): void {
    const configs: SoundConfig[] = [
      {
        type: SoundType.BUBBLE_POP,
        volume: 0.8,
        loop: false,
        preload: true
      },
      {
        type: SoundType.ACHIEVEMENT,
        volume: 0.9,
        loop: false,
        preload: true
      },
      {
        type: SoundType.LEVEL_UP,
        volume: 1.0,
        loop: false,
        preload: true
      },
      {
        type: SoundType.COUNTDOWN_COMPLETE,
        volume: 0.7,
        loop: false,
        preload: true
      },
      {
        type: SoundType.UI_CLICK,
        volume: 0.5,
        loop: false,
        preload: false
      },
      {
        type: SoundType.REWARD,
        volume: 0.8,
        loop: false,
        preload: true
      }
    ];

    configs.forEach(config => {
      this.soundConfigs.set(config.type, config);
    });
  }

  /**
   * 初始化音频文件路径
   */
  private initAudioFiles(): void {
    const soundFiles: { type: SoundType; path: string }[] = [
      { type: SoundType.BUBBLE_POP, path: '/static/sounds/bubble-pop.mp3' },
      { type: SoundType.ACHIEVEMENT, path: '/static/sounds/achievement.mp3' },
      { type: SoundType.LEVEL_UP, path: '/static/sounds/level-up.mp3' },
      { type: SoundType.COUNTDOWN_COMPLETE, path: '/static/sounds/countdown-complete.mp3' },
      { type: SoundType.UI_CLICK, path: '/static/sounds/ui-click.mp3' },
      { type: SoundType.REWARD, path: '/static/sounds/reward.mp3' }
    ];

    soundFiles.forEach(({ type, path }) => {
      this.audioFiles.set(type, {
        path,
        loaded: false
      });
    });
  }

  /**
   * 预加载音效
   */
  async preloadSounds(): Promise<void> {
    const preloadPromises: Promise<void>[] = [];

    this.soundConfigs.forEach((config, type) => {
      if (config.preload) {
        preloadPromises.push(this.loadSound(type));
      }
    });

    try {
      await Promise.all(preloadPromises);
      console.log('音效预加载完成');
    } catch (error) {
      console.warn('部分音效预加载失败:', error);
    }
  }

  /**
   * 加载单个音效
   */
  async loadSound(type: SoundType): Promise<void> {
    const fileInfo = this.audioFiles.get(type);
    if (!fileInfo || fileInfo.loaded) {
      return;
    }

    try {
      const audioContext = await this.createAudioContext(fileInfo.path);
      if (audioContext) {
        fileInfo.loaded = true;
        
        // 缓存音频上下文
        if (!this.audioContextCache.has(type)) {
          this.audioContextCache.set(type, []);
        }
        this.audioContextCache.get(type)!.push(audioContext);
        
        console.log(`音效 ${type} 加载成功`);
      }
    } catch (error) {
      fileInfo.error = error instanceof Error ? error.message : '加载失败';
      console.warn(`音效 ${type} 加载失败:`, error);
    }
  }

  /**
   * 创建音频上下文
   */
  private async createAudioContext(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.platform === 'h5') {
        // H5 平台使用 Audio
        const audio = new Audio(path);
        audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
        audio.addEventListener('error', reject, { once: true });
      } else {
        // 小程序和App平台使用 uni.createInnerAudioContext
        const audioContext = uni.createInnerAudioContext();
        audioContext.src = path;
        audioContext.onCanplay(() => resolve(audioContext));
        audioContext.onError((error: any) => reject(error));
      }
    });
  }

  /**
   * 播放音效
   */
  playSound(type: SoundType, volume?: number): void {
    // 检查音效是否启用
    if (!this.settings.soundEnabled || this.config.muted) {
      return;
    }

    // 检查是否超过最大同时播放数
    if (this.playingInstances.size >= this.config.maxConcurrentSounds) {
      console.warn('超过最大同时播放音效数量');
      return;
    }

    const config = this.soundConfigs.get(type);
    if (!config) {
      console.warn(`未找到音效配置: ${type}`);
      return;
    }

    // 计算实际音量
    const finalVolume = this.calculateVolume(volume || config.volume);

    this.executePlay(type, finalVolume);
  }

  /**
   * 执行播放逻辑
   */
  private async executePlay(type: SoundType, volume: number): Promise<void> {
    const fileInfo = this.audioFiles.get(type);
    if (!fileInfo) {
      console.warn(`未找到音效文件: ${type}`);
      return;
    }

    try {
      let audioContext: any;

      // 尝试从缓存获取
      const cachedContexts = this.audioContextCache.get(type);
      if (cachedContexts && cachedContexts.length > 0) {
        audioContext = cachedContexts.shift();
      } else {
        // 创建新的音频上下文
        audioContext = await this.createAudioContext(fileInfo.path);
      }

      if (!audioContext) {
        throw new Error('无法创建音频上下文');
      }

      // 设置音量
      this.setAudioContextVolume(audioContext, volume);

      // 播放音频 - 优化版本
      if (this.platform === 'h5') {
        // 先检查音频状态
        if (audioContext.readyState >= audioContext.HAVE_ENOUGH_DATA) {
          audioContext.currentTime = 0;
        } else {
          // 如果音频未加载完成，监听事件
          audioContext.addEventListener('canplay', () => {
            audioContext.currentTime = 0;
          }, { once: true });
        }
        
        // 处理自动播放策略限制
        const playPromise = audioContext.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } else {
        // 小程序和App平台
        audioContext.stop(); // 先停止可能正在播放的实例
        audioContext.seek(0); // 重置到开始位置
        audioContext.play();
      }

      // 创建播放实例
      const instance: AudioInstance = {
        id: this.generateInstanceId(),
        type,
        state: AudioState.PLAYING,
        audioContext,
        startTime: Date.now(),
        volume
      };

      this.playingInstances.set(instance.id, instance);

      // 设置播放结束回调
      this.setupPlaybackEndCallback(instance);

      console.log(`播放音效: ${type}`);

    } catch (error) {
      console.error(`播放音效失败 ${type}:`, error);
      // 尝试直接加载并播放（降级方案）
      try {
        console.log(`尝试降级方案播放音效: ${type}`);
        const newAudioContext = await this.createAudioContext(fileInfo.path);
        if (newAudioContext) {
          this.setAudioContextVolume(newAudioContext, volume);
          if (this.platform === 'h5') {
            const playPromise = newAudioContext.play();
            if (playPromise) await playPromise;
          } else {
            newAudioContext.play();
          }
        }
      } catch (fallbackError) {
        console.error(`降级方案也失败: ${fallbackError}`);
      }
    }
  }

  /**
   * 设置播放结束回调
   */
  private setupPlaybackEndCallback(instance: AudioInstance): void {
    const audioContext = instance.audioContext;
    
    const onEnd = () => {
      this.cleanupInstance(instance.id);
      
      // 将音频上下文放回缓存
      if (!this.audioContextCache.has(instance.type)) {
        this.audioContextCache.set(instance.type, []);
      }
      this.audioContextCache.get(instance.type)!.push(audioContext);
    };

    if (this.platform === 'h5') {
      audioContext.addEventListener('ended', onEnd, { once: true });
    } else {
      audioContext.onEnded(onEnd);
    }
  }

  /**
   * 清理播放实例
   */
  private cleanupInstance(instanceId: string): void {
    this.playingInstances.delete(instanceId);
  }

  /**
   * 计算实际音量
   */
  private calculateVolume(baseVolume: number): number {
    return baseVolume * this.settings.masterVolume * this.settings.soundVolume;
  }

  /**
   * 设置音频上下文音量
   */
  private setAudioContextVolume(audioContext: any, volume: number): void {
    if (this.platform === 'h5') {
      audioContext.volume = volume;
    } else {
      audioContext.volume = volume;
    }
  }

  /**
   * 生成实例ID
   */
  private generateInstanceId(): string {
    return `sound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 设置主音量
   */
  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * 设置音效音量
   */
  setSoundVolume(volume: number): void {
    this.settings.soundVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * 设置静音状态
   */
  setMuted(muted: boolean): void {
    this.config.muted = muted;
    if (muted) {
      this.stopAllSounds();
    }
    this.saveSettings();
  }

  /**
   * 设置音效开关
   */
  setSoundEnabled(enabled: boolean): void {
    this.settings.soundEnabled = enabled;
    if (!enabled) {
      this.stopAllSounds();
    }
    this.saveSettings();
  }

  /**
   * 停止所有音效
   */
  stopAllSounds(): void {
    this.playingInstances.forEach(instance => {
      try {
        if (this.platform === 'h5') {
          instance.audioContext.pause();
          instance.audioContext.currentTime = 0;
        } else {
          instance.audioContext.stop();
        }
      } catch (error) {
        console.warn('停止音效失败:', error);
      }
    });
    this.playingInstances.clear();
  }

  /**
   * 获取当前设置
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * 加载用户设置
   */
  private loadSettings(): void {
    try {
      const savedSettings = uni.getStorageSync('audio_settings');
      if (savedSettings) {
        Object.assign(this.settings, savedSettings);
      }
    } catch (error) {
      console.warn('加载音频设置失败:', error);
    }
  }

  /**
   * 保存用户设置
   */
  private saveSettings(): void {
    try {
      uni.setStorageSync('audio_settings', this.settings);
      globalEventBus.emit('audio-settings-changed', this.settings);
    } catch (error) {
      console.warn('保存音频设置失败:', error);
    }
  }

  /**
   * 获取音效状态信息
   */
  getSoundStatus(): { [key: string]: any } {
    return {
      initialized: this.initialized,
      platform: this.platform,
      playingCount: this.playingInstances.size,
      maxConcurrentSounds: this.config.maxConcurrentSounds,
      loadedSounds: Array.from(this.audioFiles.entries()).map(([type, info]) => ({
        type,
        loaded: info.loaded,
        error: info.error
      })),
      settings: this.settings
    };
  }

  /**
   * 销毁音频管理器
   */
  destroy(): void {
    this.stopAllSounds();
    
    // 清理缓存的音频上下文
    this.audioContextCache.forEach(contexts => {
      contexts.forEach(context => {
        try {
          if (this.platform === 'h5') {
            context.pause();
            context.src = '';
          } else {
            context.destroy();
          }
        } catch (error) {
          console.warn('清理音频上下文失败:', error);
        }
      });
    });
    
    this.audioContextCache.clear();
    this.audioFiles.clear();
    this.soundConfigs.clear();
    this.initialized = false;
  }
}

// 导出单例实例
export const soundManager = SoundManager.getInstance();

// 导出便捷方法
export const playSound = (type: SoundType, volume?: number) => {
  soundManager.playSound(type, volume);
};

export const setMasterVolume = (volume: number) => {
  soundManager.setMasterVolume(volume);
};

export const setSoundVolume = (volume: number) => {
  soundManager.setSoundVolume(volume);
};

export const setMuted = (muted: boolean) => {
  soundManager.setMuted(muted);
};

export const setSoundEnabled = (enabled: boolean) => {
  soundManager.setSoundEnabled(enabled);
};