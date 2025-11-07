<template>
  <view class="audio-test-page">
    <view class="test-header">
      <text class="page-title">🔊 音频系统测试</text>
      <text class="platform-info">平台: {{ platform }}</text>
    </view>

    <view class="test-container">
      <!-- 测试控制 -->
      <view class="test-section">
        <text class="section-title">🧪 测试控制</text>
        <button class="test-btn primary" @click="runFullTest" :disabled="testing">
          {{ testing ? '测试中...' : '运行完整测试' }}
        </button>
        <button class="test-btn secondary" @click="runQuickTest">
          快速音效测试
        </button>
      </view>

      <!-- 手动测试 -->
      <view class="test-section">
        <text class="section-title">🎵 手动测试</text>
        <view class="sound-buttons">
          <button 
            v-for="sound in soundTypes" 
            :key="sound.type"
            class="sound-btn"
            @click="playSound(sound.type)"
          >
            <text class="sound-icon">{{ sound.icon }}</text>
            <text class="sound-label">{{ sound.label }}</text>
          </button>
        </view>
      </view>

      <!-- 音量控制测试 -->
      <view class="test-section">
        <text class="section-title">🔊 音量控制测试</text>
        <view class="volume-controls">
          <view class="volume-item">
            <text class="volume-label">主音量: {{ Math.round(masterVolume * 100) }}%</text>
            <slider 
              :value="masterVolume * 100"
              @change="onMasterVolumeChange"
              min="0"
              max="100"
              activeColor="#667eea"
              backgroundColor="#e5e7eb"
              blockSize="20"
            />
          </view>
          <view class="volume-item">
            <text class="volume-label">音效音量: {{ Math.round(soundVolume * 100) }}%</text>
            <slider 
              :value="soundVolume * 100"
              @change="onSoundVolumeChange"
              min="0"
              max="100"
              activeColor="#667eea"
              backgroundColor="#e5e7eb"
              blockSize="20"
            />
          </view>
        </view>
        <view class="quick-actions">
          <button class="action-btn" @click="toggleMute">
            <text class="action-icon">{{ muted ? '🔇' : '🔊' }}</text>
            <text class="action-text">{{ muted ? '取消静音' : '静音' }}</text>
          </button>
          <button class="action-btn" @click="resetVolume">
            <text class="action-icon">🔄</text>
            <text class="action-text">重置音量</text>
          </button>
        </view>
      </view>

      <!-- 测试结果 -->
      <view class="test-section" v-if="testResults">
        <text class="section-title">📊 测试结果</text>
        <view class="results-grid">
          <view 
            v-for="(result, key) in testResults.results" 
            :key="key"
            class="result-item"
            :class="{ success: result, error: !result }"
          >
            <text class="result-icon">{{ result ? '✅' : '❌' }}</text>
            <text class="result-label">{{ getTestLabel(key) }}</text>
          </view>
        </view>
        <view class="test-summary" :class="{ success: testResults.success, error: !testResults.success }">
          <text class="summary-text">
            总体结果: {{ testResults.success ? '通过' : '失败' }}
          </text>
          <text class="summary-time">
            测试时间: {{ formatTime(testResults.timestamp) }}
          </text>
        </view>
      </view>

      <!-- 优化建议 -->
      <view class="test-section" v-if="optimizations.length > 0">
        <text class="section-title">💡 优化建议</text>
        <view class="optimizations">
          <view 
            v-for="(optimization, index) in optimizations" 
            :key="index"
            class="optimization-item"
          >
            <text class="optimization-text">{{ optimization }}</text>
          </view>
        </view>
      </view>

      <!-- 系统状态 -->
      <view class="test-section" v-if="soundStatus">
        <text class="section-title">📈 系统状态</text>
        <view class="status-grid">
          <view class="status-item">
            <text class="status-label">初始化状态</text>
            <text class="status-value" :class="{ success: soundStatus.initialized }">
              {{ soundStatus.initialized ? '已初始化' : '未初始化' }}
            </text>
          </view>
          <view class="status-item">
            <text class="status-label">当前平台</text>
            <text class="status-value">{{ platform }}</text>
          </view>
          <view class="status-item">
            <text class="status-label">正在播放</text>
            <text class="status-value">{{ soundStatus.playingCount }} 个音效</text>
          </view>
          <view class="status-item">
            <text class="status-label">最大并发</text>
            <text class="status-value">{{ soundStatus.maxConcurrentSounds }} 个</text>
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
import { ref, computed, onMounted } from 'vue'
import { useAudio } from '@/composables/useAudio'
import { SoundType } from '@/utils/audioTypes'
import { runAudioTest, audioTester } from '@/utils/audioTester'

const { 
  playSound,
  settings,
  soundStatus,
  setMasterVolume,
  setSoundVolume,
  setMuted,
  init
} = useAudio()

const testing = ref(false)
const testResults = ref<any>(null)
const optimizations = ref<string[]>([])

const masterVolume = computed(() => settings.masterVolume)
const soundVolume = computed(() => settings.soundVolume)
const muted = computed(() => settings.soundEnabled === false)

const platform = ref('')

const soundTypes = [
  { type: SoundType.BUBBLE_POP, label: '泡泡破裂', icon: '🫧' },
  { type: SoundType.ACHIEVEMENT, label: '成就奖励', icon: '🏆' },
  { type: SoundType.LEVEL_UP, label: '等级提升', icon: '⬆️' },
  { type: SoundType.COUNTDOWN_COMPLETE, label: '倒计时完成', icon: '⏰' },
  { type: SoundType.REWARD, label: '通用奖励', icon: '🎁' },
  { type: SoundType.UI_CLICK, label: 'UI点击', icon: '👆' }
]

onMounted(async () => {
  // 检测平台
  // #ifdef H5
  platform.value = 'H5网页'
  // #endif
  
  // #ifdef MP-WEIXIN
  platform.value = '微信小程序'
  // #endif
  
  // #ifdef MP-ALIPAY
  platform.value = '支付宝小程序'
  // #endif
  
  // #ifdef APP-PLUS
  platform.value = 'App应用'
  // #endif
  
  // 初始化音频系统
  try {
    await init()
  } catch (error) {
    console.warn('音频系统初始化失败:', error)
  }
  
  // 获取平台优化建议
  optimizations.value = audioTester.getPlatformOptimizations()
})

// 运行完整测试
const runFullTest = async () => {
  testing.value = true
  testResults.value = null
  
  try {
    const results = await runAudioTest()
    testResults.value = results
  } catch (error) {
    console.error('测试执行失败:', error)
  } finally {
    testing.value = false
  }
}

// 快速音效测试
const runQuickTest = () => {
  soundTypes.forEach((sound, index) => {
    setTimeout(() => {
      playSound(sound.type, 0.3)
    }, index * 200) // 每200ms播放一个音效
  })
}

// 播放单个音效
const playTestSound = (type: SoundType) => {
  playSound(type, 0.5)
}

// 主音量变更
const onMasterVolumeChange = (event: any) => {
  const volume = event.detail.value / 100
  setMasterVolume(volume)
}

// 音效音量变更
const onSoundVolumeChange = (event: any) => {
  const volume = event.detail.value / 100
  setSoundVolume(volume)
}

// 切换静音状态
const toggleMute = () => {
  setMuted(!muted.value)
}

// 重置音量
const resetVolume = () => {
  setMasterVolume(0.8)
  setSoundVolume(0.8)
}

// 获取测试标签
const getTestLabel = (key: string): string => {
  const labels: { [key: string]: string } = {
    initialization: '初始化测试',
    soundPlayback: '音效播放',
    volumeControl: '音量控制',
    muteFunction: '静音功能',
    concurrentPlayback: '并发播放',
    settingsPersistence: '设置持久化',
    errorHandling: '错误处理',
    performance: '性能测试'
  }
  return labels[key] || key
}

// 获取已加载音效数量
const getLoadedSoundsCount = (): number => {
  if (!soundStatus.value?.loadedSounds) return 0
  return soundStatus.value.loadedSounds.filter((sound: any) => sound.loaded).length
}

// 格式化时间
const formatTime = (timestamp: string): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}
</script>

<style lang="scss" scoped>
.audio-test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 32rpx;
}

.test-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  display: block;
  margin-bottom: 16rpx;
}

.platform-info {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.test-container {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.test-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: white;
  display: block;
  margin-bottom: 24rpx;
}

.test-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: white;
  border: none;
  margin-bottom: 16rpx;
  transition: all 0.3s ease;
}

.test-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.test-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sound-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.sound-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  transition: all 0.3s ease;
}

.sound-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.2);
}

.sound-icon {
  font-size: 32rpx;
}

.sound-label {
  font-size: 24rpx;
  color: white;
  text-align: center;
}

.volume-controls {
  margin-bottom: 24rpx;
}

.volume-item {
  margin-bottom: 24rpx;
}

.volume-label {
  font-size: 28rpx;
  color: white;
  display: block;
  margin-bottom: 16rpx;
}

.quick-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.2);
}

.action-icon {
  font-size: 24rpx;
}

.action-text {
  font-size: 20rpx;
  color: white;
  text-align: center;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.1);
}

.result-item.success {
  background: rgba(16, 185, 129, 0.2);
}

.result-item.error {
  background: rgba(239, 68, 68, 0.2);
}

.result-icon {
  font-size: 24rpx;
}

.result-label {
  font-size: 24rpx;
  color: white;
}

.test-summary {
  padding: 20rpx;
  border-radius: 12rpx;
  text-align: center;
}

.test-summary.success {
  background: rgba(16, 185, 129, 0.2);
}

.test-summary.error {
  background: rgba(239, 68, 68, 0.2);
}

.summary-text {
  font-size: 28rpx;
  font-weight: 600;
  color: white;
  display: block;
  margin-bottom: 8rpx;
}

.summary-time {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

.optimizations {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.optimization-item {
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
  border-left: 4rpx solid #fbbf24;
}

.optimization-text {
  font-size: 24rpx;
  color: white;
  line-height: 1.5;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12rpx;
}

.status-label {
  font-size: 24rpx;
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
</style>