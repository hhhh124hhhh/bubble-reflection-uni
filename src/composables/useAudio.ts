/**
 * 音频系统 Composable
 * 提供音频系统的响应式状态和操作方法
 */

import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { soundManager } from '../utils/soundManager';
import { SoundType, AudioSettings } from '../utils/audioTypes';
import { globalEventBus } from '../utils/index';

export interface UseAudioReturn {
  // 状态
  initialized: boolean;
  settings: AudioSettings;
  soundStatus: any;
  
  // 方法
  init: () => Promise<void>;
  playSound: (type: SoundType, volume?: number) => void;
  updateSettings: (newSettings: Partial<AudioSettings>) => void;
  setMasterVolume: (volume: number) => void;
  setSoundVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  playTestSound: (type: SoundType) => void;
}

export function useAudio(): UseAudioReturn {
  const initialized = ref(false);
  const settings = reactive<AudioSettings>({
    soundEnabled: true,
    musicEnabled: true,
    masterVolume: 0.8,
    soundVolume: 0.8
  });
  const soundStatus = ref<any>(null);

  let initPromise: Promise<void> | null = null;

  /**
   * 初始化音频系统
   */
  const init = async (): Promise<void> => {
    if (initPromise) {
      return initPromise;
    }

    initPromise = soundManager.init();
    
    try {
      await initPromise;
      initialized.value = true;
      
      // 加载当前设置
      Object.assign(settings, soundManager.getSettings());
      updateSoundStatus();
      
      console.log('音频系统初始化完成');
    } catch (error) {
      console.error('音频系统初始化失败:', error);
      initPromise = null;
      throw error;
    }
  };

  /**
   * 播放音效
   */
  const playSound = (type: SoundType, volume?: number): void => {
    if (initialized.value) {
      soundManager.playSound(type, volume);
    }
  };

  /**
   * 更新设置
   */
  const updateSettings = (newSettings: Partial<AudioSettings>): void => {
    Object.assign(settings, newSettings);
    
    // 更新到音频管理器
    if (newSettings.masterVolume !== undefined) {
      soundManager.setMasterVolume(newSettings.masterVolume);
    }
    if (newSettings.soundVolume !== undefined) {
      soundManager.setSoundVolume(newSettings.soundVolume);
    }
    if (newSettings.soundEnabled !== undefined) {
      soundManager.setSoundEnabled(newSettings.soundEnabled);
    }
    
    updateSoundStatus();
  };

  /**
   * 设置主音量
   */
  const setMasterVolume = (volume: number): void => {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    soundManager.setMasterVolume(normalizedVolume);
    settings.masterVolume = normalizedVolume;
    updateSoundStatus();
  };

  /**
   * 设置音效音量
   */
  const setSoundVolume = (volume: number): void => {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    soundManager.setSoundVolume(normalizedVolume);
    settings.soundVolume = normalizedVolume;
    updateSoundStatus();
  };

  /**
   * 设置静音状态
   */
  const setMuted = (muted: boolean): void => {
    soundManager.setMuted(muted);
    updateSoundStatus();
  };

  /**
   * 设置音效开关
   */
  const setSoundEnabled = (enabled: boolean): void => {
    soundManager.setSoundEnabled(enabled);
    settings.soundEnabled = enabled;
    updateSoundStatus();
  };

  /**
   * 播放测试音效
   */
  const playTestSound = (type: SoundType): void => {
    if (initialized.value && settings.soundEnabled) {
      soundManager.playSound(type, 1.0); // 测试音效使用最大音量
    }
  };

  /**
   * 更新音效状态
   */
  const updateSoundStatus = (): void => {
    soundStatus.value = soundManager.getSoundStatus();
  };

  /**
   * 处理音频设置变化事件
   */
  const handleAudioSettingsChanged = (newSettings: AudioSettings): void => {
    Object.assign(settings, newSettings);
    updateSoundStatus();
  };

  onMounted(async () => {
    // 监听设置变化事件
    globalEventBus.on('audio-settings-changed', handleAudioSettingsChanged);
    
    // 尝试自动初始化
    try {
      await init();
    } catch (error) {
      console.warn('音频系统自动初始化失败，将在用户交互时重试');
    }
  });

  onUnmounted(() => {
    globalEventBus.off('audio-settings-changed', handleAudioSettingsChanged);
  });

  return {
    initialized,
    settings,
    soundStatus,
    init,
    playSound,
    updateSettings,
    setMasterVolume,
    setSoundVolume,
    setMuted,
    setSoundEnabled,
    playTestSound
  };
}