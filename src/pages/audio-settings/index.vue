<template>
  <view class="audio-settings-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="nav-bar">
        <view class="back-btn" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="page-title">音频设置</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <!-- 设置内容 -->
    <view class="settings-container">
      <!-- 音效开关 -->
      <view class="setting-section">
        <view class="section-title">
          <text class="title-text">🔊 音效设置</text>
        </view>
        
        <view class="setting-item">
          <view class="item-left">
            <text class="item-label">启用音效</text>
            <text class="item-desc">开启后将在各种操作时播放音效</text>
          </view>
          <switch 
            :checked="settings.soundEnabled" 
            @change="onSoundEnabledChange"
            color="#667eea"
          />
        </view>

        <!-- 主音量 -->
        <view class="setting-item" v-if="settings.soundEnabled">
          <view class="item-left">
            <text class="item-label">主音量</text>
            <text class="item-desc">控制整体音效音量大小</text>
          </view>
        </view>
        <view class="volume-control" v-if="settings.soundEnabled">
          <slider 
            :value="settings.masterVolume * 100"
            @change="onMasterVolumeChange"
            min="0"
            max="100"
            activeColor="#667eea"
            backgroundColor="#e5e7eb"
            blockSize="20"
          />
          <text class="volume-text">{{ Math.round(settings.masterVolume * 100) }}%</text>
        </view>

        <!-- 音效音量 -->
        <view class="setting-item" v-if="settings.soundEnabled">
          <view class="item-left">
            <text class="item-label">音效音量</text>
            <text class="item-desc">控制泡泡破裂等音效音量</text>
          </view>
        </view>
        <view class="volume-control" v-if="settings.soundEnabled">
          <slider 
            :value="settings.soundVolume * 100"
            @change="onSoundVolumeChange"
            min="0"
            max="100"
            activeColor="#667eea"
            backgroundColor="#e5e7eb"
            blockSize="20"
          />
          <text class="volume-text">{{ Math.round(settings.soundVolume * 100) }}%</text>
        </view>
      </view>

      <!-- 音效测试 -->
      <view class="setting-section" v-if="settings.soundEnabled">
        <view class="section-title">
          <text class="title-text">🎵 音效测试</text>
        </view>
        
        <view class="test-sounds">
          <view class="test-item" @click="playTestSound('bubble-pop')">
            <text class="test-icon">🫧</text>
            <text class="test-label">泡泡破裂</text>
            <text class="test-btn">▶️</text>
          </view>
          
          <view class="test-item" @click="playTestSound('achievement')">
            <text class="test-icon">🏆</text>
            <text class="test-label">成就奖励</text>
            <text class="test-btn">▶️</text>
          </view>
          
          <view class="test-item" @click="playTestSound('level-up')">
            <text class="test-icon">⬆️</text>
            <text class="test-label">等级提升</text>
            <text class="test-btn">▶️</text>
          </view>
          
          <view class="test-item" @click="playTestSound('countdown-complete')">
            <text class="test-icon">⏰</text>
            <text class="test-label">倒计时完成</text>
            <text class="test-btn">▶️</text>
          </view>
          
          <view class="test-item" @click="playTestSound('reward')">
            <text class="test-icon">🎁</text>
            <text class="test-label">通用奖励</text>
            <text class="test-btn">▶️</text>
          </view>
        </view>
      </view>

      <!-- 快捷操作 -->
      <view class="setting-section">
        <view class="section-title">
          <text class="title-text">⚡ 快捷操作</text>
        </view>
        
        <view class="quick-actions">
          <view class="action-btn" @click="setMuted(true)">
            <text class="action-icon">🔇</text>
            <text class="action-text">一键静音</text>
          </view>
          
          <view class="action-btn" @click="resetToDefault">
            <text class="action-icon">🔄</text>
            <text class="action-text">恢复默认</text>
          </view>
        </view>
      </view>

      <!-- 状态信息 -->
      <view class="setting-section" v-if="soundStatus">
        <view class="section-title">
          <text class="title-text">📊 状态信息</text>
        </view>
        
        <view class="status-info">
          <view class="status-item">
            <text class="status-label">音频系统</text>
            <text class="status-value" :class="soundStatus.initialized ? 'success' : 'error'">
              {{ soundStatus.initialized ? '已初始化' : '未初始化' }}
            </text>
          </view>
          
          <view class="status-item">
            <text class="status-label">当前平台</text>
            <text class="status-value">{{ getPlatformLabel(soundStatus.platform) }}</text>
          </view>
          
          <view class="status-item">
            <text class="status-label">正在播放</text>
            <text class="status-value">{{ soundStatus.playingCount }} 个音效</text>
          </view>
          
          <view class="status-item">
            <text class="status-label">已加载音效</text>
            <text class="status-value">{{ getLoadedSoundsCount() }} 个</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { SoundType } from '@/utils/audioTypes'
import { navigateTo } from '@/utils'

const { 
  settings, 
  soundStatus, 
  updateSettings, 
  setMuted, 
  playTestSound,
  init 
} = useAudio()

// 页面初始化
onMounted(async () => {
  // 确保音频系统已初始化
  if (!soundStatus.value?.initialized) {
    try {
      await init()
    } catch (error) {
      console.warn('音频系统初始化失败:', error)
    }
  }
})

// 返回上一页
const goBack = () => {
  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU
  uni.navigateBack()
  // #endif
  
  // #ifdef H5 || APP-PLUS
  navigateTo('/pages/index/index')
  // #endif
}

// 音效开关变更
const onSoundEnabledChange = (event: any) => {
  updateSettings({ soundEnabled: event.detail.value })
}

// 主音量变更
const onMasterVolumeChange = (event: any) => {
  const volume = event.detail.value / 100
  updateSettings({ masterVolume: volume })
}

// 音效音量变更
const onSoundVolumeChange = (event: any) => {
  const volume = event.detail.value / 100
  updateSettings({ soundVolume: volume })
}

// 重置为默认设置
const resetToDefault = () => {
  uni.showModal({
    title: '确认重置',
    content: '是否要恢复默认音频设置？',
    success: (res) => {
      if (res.confirm) {
        updateSettings({
          soundEnabled: true,
          masterVolume: 0.8,
          soundVolume: 0.8
        })
        
        uni.showToast({
          title: '已恢复默认设置',
          icon: 'success',
          duration: 1500
        })
      }
    }
  })
}

// 获取平台标签
const getPlatformLabel = (platform: string): string => {
  const labels = {
    'h5': 'H5网页',
    'mp-weixin': '微信小程序',
    'mp-alipay': '支付宝小程序',
    'mp-baidu': '百度小程序',
    'app': 'App应用'
  }
  return labels[platform as keyof typeof labels] || '未知平台'
}

// 获取已加载音效数量
const getLoadedSoundsCount = (): number => {
  if (!soundStatus.value?.loadedSounds) return 0
  return soundStatus.value.loadedSounds.filter((sound: any) => sound.loaded).length
}
</script>

<style lang="scss" scoped>
.audio-settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 40rpx;
}

.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  height: 88rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.back-icon {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: white;
}

.placeholder {
  width: 64rpx;
}

.settings-container {
  padding: 32rpx;
}

.setting-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 32rpx;
  overflow: hidden;
}

.section-title {
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: white;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.setting-item:last-child {
  border-bottom: none;
}

.item-left {
  flex: 1;
  margin-right: 24rpx;
}

.item-label {
  font-size: 28rpx;
  color: white;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.item-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  display: block;
}

.volume-control {
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx 24rpx;
  gap: 24rpx;
}

slider {
  flex: 1;
}

.volume-text {
  font-size: 24rpx;
  color: white;
  font-weight: 500;
  min-width: 80rpx;
  text-align: right;
}

.test-sounds {
  padding: 24rpx 32rpx;
}

.test-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.test-item:last-child {
  margin-bottom: 0;
}

.test-item:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.1);
}

.test-icon {
  font-size: 32rpx;
  margin-right: 24rpx;
}

.test-label {
  flex: 1;
  font-size: 28rpx;
  color: white;
}

.test-btn {
  font-size: 24rpx;
}

.quick-actions {
  padding: 24rpx 32rpx;
  display: flex;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.1);
}

.action-icon {
  font-size: 32rpx;
  margin-bottom: 12rpx;
}

.action-text {
  font-size: 24rpx;
  color: white;
  text-align: center;
}

.status-info {
  padding: 24rpx 32rpx;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.status-value {
  font-size: 26rpx;
  color: white;
  font-weight: 500;
}

.status-value.success {
  color: #10b981;
}

.status-value.error {
  color: #ef4444;
}
</style>