<template>
  <view class="bubble-page">
    <!-- 背景粒子效果 -->
    <view class="background-particles">
      <view 
        v-for="i in 6" 
        :key="i"
        class="bg-particle"
        :class="`bg-particle-${i}`"
      ></view>
    </view>
    
    <!-- 顶部布局区域 - 左右结构 -->
    <view class="top-layout">
      <!-- 左侧：进度面板 -->
      <view class="progress-compact">
        <!-- 等级进度 -->
        <view class="level-progress">
          <view class="level-info">
            <text class="level-badge">Lv.{{ getLevel() }}</text>
            <text class="exp-info">{{ userExp }} 经验</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{width: `${getProgressPercentage()}%`}"></view>
          </view>
        </view>
        
        <!-- 状态速览 -->
        <view class="quick-stats">
          <view class="stat-item">
            <text class="stat-emoji">🎯</text>
            <text class="stat-text">{{ currentBubbles.length }}</text>
          </view>
          <view v-if="collectedStickers.length > 0" class="stat-item">
            <text class="stat-emoji">🏆</text>
            <text class="stat-text">{{ collectedStickers.length }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-emoji">⚡</text>
            <text class="stat-text">{{ getStreak() }}</text>
          </view>
        </view>
      </view>


    </view>

    <!-- 简化底部文字显示 -->
    
    <!-- 沉浸式泡泡容器 -->
    <view class="bubble-container">
      <view class="bubbles-wrapper">
        <!-- 动态背景光效 -->
        <view class="bg-lights">
          <view 
            v-for="i in 3" 
            :key="i"
            class="bg-light"
            :class="`bg-light-${i}`"
          ></view>
        </view>
        
        <view 
          v-for="(bubble, index) in currentBubbles" 
          :key="bubble.id"
          class="bubble-wrapper"
          :style="getBubblePosition(index)"
          :class="getBubbleWrapperClass(index)"
        >
          <Bubble
            :bubble="bubble"
            :size="getBubbleSize(index)"
            :floating-class="getFloatingClass(index)"
            @click="handleBubbleClick"
          />
        </view>
      </view>
    </view>
    
    <!-- 精简底部操作栏 -->
    <view class="bottom-bar">
      <view class="bar-content">
        <button class="create-btn" @click="openCustomModal">
          <text class="create-icon">✨</text>
          <text class="create-text">创建泡泡</text>
        </button>
        
        <view class="quick-tip">
          <text class="tip-emoji">
            {{ currentBubbles.length > 2 ? "👆" : 
               currentBubbles.length > 0 ? "🔮" : "✨" }}
          </text>
          <text class="tip-message">
            {{ currentBubbles.length > 2 ? "戳泡泡开始探索" : 
               currentBubbles.length > 0 ? "泡泡数量较少，即将自动补充" : "太棒了！创建更多泡泡" }}
          </text>
        </view>
      </view>
    </view>

    <!-- 统一模态弹窗系统 -->
    <view v-if="showModal" class="modal-overlay" @click="closeModal">
      <view class="modal-container" @click.stop>
        <!-- 完成弹窗 -->
        <view v-if="modalType === 'completion'" class="completion-modal">
          <view class="modal-header">
            <text class="modal-icon">🎉</text>
            <text class="modal-title">反思完成！</text>
            <button class="close-btn" @click="closeModal">×</button>
          </view>
          <view class="modal-body">
            <text class="completion-message">恭喜你完成了所有泡泡的探索之旅</text>
            <view class="stats-summary">
              <view class="stat-item">
                <text class="stat-value">{{ userExp }}</text>
                <text class="stat-label">总经验</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ collectedStickers.length }}</text>
                <text class="stat-label">收集贴纸</text>
              </view>
              <view class="stat-item">
                <text class="stat-value">{{ getStreak() }}</text>
                <text class="stat-label">连续天数</text>
              </view>
            </view>
          </view>
          <view class="modal-footer">
            <button class="btn btn-secondary" @click="handleRestart">
              <text class="btn-text">🔄 重新开始</text>
            </button>
            <button class="btn btn-primary" @click="handleCreateMore">
              <text class="btn-text">✨ 创建新泡泡</text>
            </button>
          </view>
        </view>

        <!-- 写一局弹窗 -->
        <view v-else-if="modalType === 'write'" class="write-modal">
          <view class="modal-header">
            <text class="modal-icon">✍️</text>
            <text class="modal-title">写一局反思</text>
            <button class="close-btn" @click="closeModal">×</button>
          </view>
          <view class="modal-body">
            <view class="bubble-info">
              <view class="bubble-preview">
                <text class="bubble-text">{{ currentModalBubble?.text || '写一局' }}</text>
                <view class="bubble-type-badge">写一局</view>
              </view>
            </view>
            <view class="write-form">
              <textarea 
                class="write-input"
                v-model="writeContent"
                placeholder="写下你的想法、感受或反思..."
                :maxlength="200"
                @input="updateCharCount"
              ></textarea>
              <view class="input-footer">
                <text class="char-count">{{ writeContent.length }}/200</text>
                <button class="btn-primary" @click="submitWrite" :disabled="!writeContent.trim()">
                  完成
                </button>
              </view>
            </view>
          </view>
        </view>

        <!-- 行动任务弹窗 -->
        <view v-else-if="modalType === 'action'" class="action-modal">
          <view class="modal-header">
            <text class="modal-icon">⚡</text>
            <text class="modal-title">行动任务</text>
            <button class="close-btn" @click="closeModal">×</button>
          </view>
          <view class="modal-body">
            <view class="bubble-info">
              <view class="bubble-preview">
                <text class="bubble-text">{{ currentModalBubble?.text || '行动' }}</text>
                <view class="bubble-type-badge action">行动</view>
              </view>
            </view>
            
            <!-- 倒计时显示区域 -->
            <view v-if="currentModalBubble?.hasTimer" class="timer-section" :class="{ 'timer-active': timerActive }">
              <view class="timer-display">
                <view class="timer-circle">
                  <view class="timer-progress">
                    <view class="timer-progress-ring" :style="timerProgressStyle">
                      <view class="timer-inner">
                        <text class="timer-text">{{ formatTime(remainingTime) }}</text>
                        <text class="timer-label">{{ getTimerCategoryLabel(currentModalBubble?.timerCategory) }}</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
              
              <!-- 倒计时控制按钮 -->
              <view class="timer-controls">
                <view v-if="timerActive" class="timer-btn warning" @click="pauseTimer">
                  暂停
                </view>
                <view v-if="!timerActive && remainingTime < (currentModalBubble?.duration || 0) && !timerCompleted" class="timer-btn primary" @click="resumeTimer">
                  继续
                </view>
              </view>
              
              <!-- 倒计时提示 -->
              <view class="timer-tip">
                <text v-if="!timerActive && !timerCompleted && remainingTime === 0" class="tip-text">
                  ⏰ 准备开始正念练习...
                </text>
                <text v-if="!timerActive && !timerCompleted && remainingTime > 0" class="tip-text">
                  ⏸️ 暂停中，需要时可以继续
                </text>
                <text v-if="timerActive" class="tip-text">
                  🌸 专注于当下，享受这个时刻
                </text>
                <text v-if="timerCompleted" class="tip-text completion-text">
                  🎉 太棒了！练习完成，正念时刻记录成功
                </text>
              </view>
            </view>
            
            <!-- 无倒计时任务的简单显示 -->
            <view v-else class="simple-action">
              <view class="action-check-icon">✓</view>
              <text class="action-complete-text">准备好完成这个任务了吗？</text>
              <text class="action-description">{{ currentModalBubble?.actionDescription || '开始行动吧' }}</text>
            </view>
          </view>
          <view class="modal-footer">
            <button v-if="!currentModalBubble?.hasTimer || timerCompleted" class="btn btn-secondary" @click="closeModal">
              <text class="btn-text">稍后再说</text>
            </button>
            <button v-if="!currentModalBubble?.hasTimer || timerCompleted" class="btn btn-primary" @click="completeAction">
              <text class="btn-text">{{ currentModalBubble?.hasTimer ? '稍后再说' : '立即行动' }}</text>
            </button>
            <!-- 有倒计时的任务不显示底部按钮，完成后自动处理 -->
          </view>
        </view>

        <!-- 创建泡泡弹窗 -->
        <view v-else-if="modalType === 'create'" class="create-modal">
          <view class="modal-header">
            <text class="modal-icon">✨</text>
            <text class="modal-title">创建自定义泡泡</text>
            <button class="close-btn" @click="closeModal">×</button>
          </view>
          <view class="modal-body">
            <view class="create-form">
              <view class="form-group">
                <text class="form-label">泡泡文字</text>
                <input 
                  class="form-input"
                  v-model="createForm.text"
                  placeholder="输入泡泡内容..."
                  maxlength="20"
                />
              </view>
              <view class="form-group">
                <text class="form-label">泡泡类型</text>
                <view class="type-selector">
                  <button 
                    v-for="type in bubbleTypes" 
                    :key="type.value"
                    class="type-btn"
                    :class="{ active: createForm.type === type.value }"
                    @click="createForm.type = type.value"
                  >
                    <text class="type-icon">{{ type.icon }}</text>
                    <text class="type-name">{{ type.name }}</text>
                  </button>
                </view>
              </view>
              <view class="form-group">
                <text class="form-label">预览</text>
                <view class="bubble-preview-large" :class="`type-${createForm.type}`">
                  <text class="preview-text">{{ createForm.text || '预览文字' }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">
              <text class="btn-text">取消</text>
            </button>
            <button class="btn btn-primary" @click="createBubble" :disabled="!createForm.text.trim()">
              <text class="btn-text">创建泡泡</text>
            </button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 引导动画遮罩层 -->
    <view v-if="showGuide" class="guide-overlay animate-fade-out">
      <view class="guide-content">
        <view class="guide-bubble animate-pulse">
          <text class="guide-text">🎈 点击泡泡开始你的反思之旅</text>
        </view>
        <view class="guide-hint animate-bounce">
          <text>👇</text>
        </view>
      </view>
    </view>
    
    <!-- 底部文字显示 -->
    <view class="hero-section">
      <view class="hero-content">
        <text class="hero-title">心迹泡泡</text>
        <text class="hero-subtitle">轻松戳泡泡 · 深度反思</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// 泡泡数据类型定义
interface Bubble {
  id: string
  text: string
  type: 'emotion' | 'keyword'
  category: string
  bubbleType: 'normal' | 'write' | 'action' | 'golden'
  expReward: number
  actionDescription: string
  icon: string
  stickerReward?: string
  isRarity?: boolean
  requiredLevel?: number
  // 倒计时相关字段
  hasTimer?: boolean
  duration?: number // 倒计时长度（秒）
  timerCategory?: 'breathing' | 'rest' | 'exercise' | 'work' | 'meditation'
}

// 动画状态
const showGuide = ref(true)

// 扩展泡泡数据库 - 按等级分类
interface BubbleDatabase {
  beginner: Bubble[];
  intermediate: Bubble[];
  advanced: Bubble[];
  golden: Bubble[];
  daily: Bubble[];
}

const BUBBLE_DATABASE: BubbleDatabase = {
  // 等级1-3：基础泡泡
  beginner: [
    { id: 'b_normal1', text: '平静', type: 'emotion', category: 'peaceful', bubbleType: 'normal', expReward: 1, actionDescription: '你选了 #平静，轻轻一弹，感受片刻宁静。', icon: '🧘', requiredLevel: 1 },
    { id: 'b_normal2', text: '开心', type: 'emotion', category: 'happy', bubbleType: 'normal', expReward: 1, actionDescription: '你选了 #开心，记住这个美好的瞬间！', icon: '😊', requiredLevel: 1 },
    { id: 'b_normal3', text: '健康', type: 'keyword', category: 'health', bubbleType: 'normal', expReward: 1, actionDescription: '你选了 #健康，关心一下自己的身体吧。', icon: '💪', requiredLevel: 1 },
    { id: 'b_normal4', text: '改变', type: 'keyword', category: 'change', bubbleType: 'normal', expReward: 1, actionDescription: '你选了 #改变，小改变带来大不同！', icon: '🔄', requiredLevel: 1 },
    { id: 'b_write1', text: '感恩', type: 'emotion', category: 'grateful', bubbleType: 'write', expReward: 2, actionDescription: '写一句吧：我今天愿意…', icon: '🙏', requiredLevel: 1 },
    { id: 'b_write2', text: '工作', type: 'keyword', category: 'work', bubbleType: 'write', expReward: 2, actionDescription: '写一句吧：今天工作中最让我…', icon: '💼', requiredLevel: 2 },
    { id: 'b_action1', text: '焦虑', type: 'emotion', category: 'anxious', bubbleType: 'action', expReward: 1, actionDescription: '深呼吸 30 秒。让自己松一松。', icon: '😰', requiredLevel: 1, hasTimer: true, duration: 30, timerCategory: 'breathing' },
    { id: 'b_action2', text: '休息', type: 'keyword', category: 'rest', bubbleType: 'action', expReward: 1, actionDescription: '闭目养神 1 分钟，让大脑放松。', icon: '😴', requiredLevel: 1, hasTimer: true, duration: 60, timerCategory: 'rest' },
  ],
  
  // 等级4-6：进阶泡泡
  intermediate: [
    { id: 'i_normal1', text: '专注', type: 'emotion', category: 'focus', bubbleType: 'normal', expReward: 2, actionDescription: '你选了 #专注，集中注意力，排除干扰。', icon: '🎯', requiredLevel: 4 },
    { id: 'i_normal2', text: '自信', type: 'emotion', category: 'confidence', bubbleType: 'normal', expReward: 2, actionDescription: '你选了 #自信，相信自己，你能做到！', icon: '💪', requiredLevel: 4 },
    { id: 'i_normal3', text: '创意', type: 'keyword', category: 'creativity', bubbleType: 'normal', expReward: 2, actionDescription: '你选了 #创意，让想象力自由飞翔！', icon: '💡', requiredLevel: 5 },
    { id: 'i_normal4', text: '平衡', type: 'keyword', category: 'balance', bubbleType: 'normal', expReward: 2, actionDescription: '你选了 #平衡，工作生活要平衡。', icon: '⚖️', requiredLevel: 5 },
    { id: 'i_write1', text: '成长', type: 'keyword', category: 'growth', bubbleType: 'write', expReward: 3, actionDescription: '写一句吧：我在…方面成长了…', icon: '🌱', requiredLevel: 4 },
    { id: 'i_write2', text: '挑战', type: 'emotion', category: 'challenge', bubbleType: 'write', expReward: 3, actionDescription: '写一句吧：面对挑战，我选择…', icon: '⛰️', requiredLevel: 5 },
    { id: 'i_action1', text: '运动', type: 'keyword', category: 'exercise', bubbleType: 'action', expReward: 2, actionDescription: '站起来活动5分钟，舒展筋骨。', icon: '🏃', requiredLevel: 4 },
    { id: 'i_action2', text: '整理', type: 'keyword', category: 'organize', bubbleType: 'action', expReward: 2, actionDescription: '整理桌面或房间，创造整洁环境。', icon: '📦', requiredLevel: 6 },
  ],
  
  // 等级7-10：高级泡泡
  advanced: [
    { id: 'a_normal1', text: '自律', type: 'emotion', category: 'discipline', bubbleType: 'normal', expReward: 3, actionDescription: '你选了 #自律，坚持就是胜利！', icon: '🏆', requiredLevel: 7 },
    { id: 'a_normal2', text: '乐观', type: 'emotion', category: 'optimism', bubbleType: 'normal', expReward: 3, actionDescription: '你选了 #乐观，积极面对每一天！', icon: '☀️', requiredLevel: 7 },
    { id: 'a_normal3', text: '耐心', type: 'emotion', category: 'patience', bubbleType: 'normal', expReward: 3, actionDescription: '你选了 #耐心，好事多磨，慢慢来。', icon: '⏳', requiredLevel: 8 },
    { id: 'a_normal4', text: '勇气', type: 'emotion', category: 'courage', bubbleType: 'normal', expReward: 3, actionDescription: '你选了 #勇气，勇敢面对困难！', icon: '🦁', requiredLevel: 8 },
    { id: 'a_write1', text: '价值', type: 'keyword', category: 'values', bubbleType: 'write', expReward: 4, actionDescription: '写一句吧：我最看重的价值观是…', icon: '💎', requiredLevel: 7 },
    { id: 'a_write2', text: '梦想', type: 'keyword', category: 'dreams', bubbleType: 'write', expReward: 4, actionDescription: '写一句吧：我的梦想是…', icon: '🌟', requiredLevel: 9 },
    { id: 'a_action1', text: '冥想', type: 'keyword', category: 'meditation', bubbleType: 'action', expReward: 3, actionDescription: '进行5分钟正念冥想，专注当下。', icon: '🧘', requiredLevel: 7 },
    { id: 'a_action2', text: '学习', type: 'keyword', category: 'learning', bubbleType: 'action', expReward: 3, actionDescription: '学习一项新技能或新知识15分钟。', icon: '📚', requiredLevel: 10 },
  ],
  
  // 特殊金色泡泡
  golden: [
    { id: 'g_golden1', text: '奇迹', type: 'emotion', category: 'wonder', bubbleType: 'golden', expReward: 5, stickerReward: '🌟', actionDescription: '恭喜解锁金色泡泡！奖励 +5经验 + 奇迹贴纸', isRarity: true, icon: '🌟', requiredLevel: 3 },
    { id: 'g_golden2', text: '突破', type: 'keyword', category: 'breakthrough', bubbleType: 'golden', expReward: 5, stickerReward: '💎', actionDescription: '恭喜解锁金色泡泡！奖励 +5经验 + 突破贴纸', isRarity: true, icon: '💎', requiredLevel: 5 },
    { id: 'g_golden3', text: '智慧', type: 'emotion', category: 'wisdom', bubbleType: 'golden', expReward: 5, stickerReward: '🧠', actionDescription: '恭喜解锁金色泡泡！奖励 +5经验 + 智慧贴纸', isRarity: true, icon: '🧠', requiredLevel: 7 },
    { id: 'g_golden4', text: '自由', type: 'emotion', category: 'freedom', bubbleType: 'golden', expReward: 6, stickerReward: '🕊️', actionDescription: '恭喜解锁金色泡泡！奖励 +6经验 + 自由贴纸', isRarity: true, icon: '🕊️', requiredLevel: 10 },
  ],
  
  // 每日挑战泡泡
  daily: [
    { id: 'd_daily1', text: '今日目标', type: 'keyword', category: 'daily_goal', bubbleType: 'write', expReward: 3, actionDescription: '写今天最想完成的一件事…', icon: '📝', requiredLevel: 1 },
    { id: 'd_daily2', text: '小确幸', type: 'emotion', category: 'small_joy', bubbleType: 'write', expReward: 2, actionDescription: '写今天让你开心的小事…', icon: '✨', requiredLevel: 1 },
    { id: 'd_daily3', text: '感恩瞬间', type: 'emotion', category: 'gratitude', bubbleType: 'write', expReward: 2, actionDescription: '写今天感恩的瞬间…', icon: '🙏', requiredLevel: 1 },
  ]
}

// 默认初始泡泡（用于新用户）
const DEFAULT_BUBBLES: Bubble[] = [
  ...BUBBLE_DATABASE.beginner.slice(0, 4), // 4个基础普通泡泡
  ...BUBBLE_DATABASE.beginner.slice(4, 6), // 2个写一局泡泡
  ...BUBBLE_DATABASE.beginner.slice(6, 8), // 2个行动泡泡
]

// 响应式数据
const currentBubbles = ref<Bubble[]>([...DEFAULT_BUBBLES])
const customBubbles = ref<Bubble[]>([])
const usedBubbles = ref<Set<string>>(new Set(DEFAULT_BUBBLES.map(b => b.id))) // 跟踪已使用的泡泡
const userExp = ref(0)
const collectedStickers = ref<string[]>([])
const isCompleted = ref(false)
const windowSize = ref({ width: 375, height: 667 })

// 模态弹窗状态
const showModal = ref(false)
const modalType = ref<'completion' | 'write' | 'action' | 'create'>('completion')
const currentModalBubble = ref<Bubble | null>(null)

// 写一局相关
const writeContent = ref('')

// 创建泡泡表单
const createForm = ref({
  text: '',
  type: 'normal'
})

// 倒计时相关状态
const timerActive = ref(false)
const timerCompleted = ref(false)
const remainingTime = ref(0)
const timerInterval = ref<number | null>(null)

// 泡泡类型选项
const bubbleTypes = [
  { value: 'normal', name: '普通', icon: '💫' },
  { value: 'write', name: '写一局', icon: '✍️' },
  { value: 'action', name: '行动', icon: '⚡' },
  { value: 'golden', name: '金色', icon: '⭐' }
]

// 组件导入
import Bubble from '@/components/Bubble/Bubble.vue'
import CompletionModal from '@/components/Modal/CompletionModal.vue'

// 计算属性
const totalBubbles = computed(() => currentBubbles.value.length)

// 倒计时进度环样式
const timerProgressStyle = computed(() => {
    if (!currentModalBubble.value?.duration) return {}
    
    const progress = 1 - (remainingTime.value / (currentModalBubble.value?.duration || 0))
  const circumference = 2 * Math.PI * 45 // 半径45的圆周长
  const strokeDasharray = `${circumference * progress} ${circumference}`
  
  return {
    strokeDasharray,
    // 移除固定的旋转样式，使用CSS中设置的transform: none
    transformOrigin: 'center'
  }
})

// 响应式窗口大小检测
const updateWindowSize = () => {
  const systemInfo = uni.getSystemInfoSync()
  windowSize.value = {
    width: systemInfo.windowWidth || 375,
    height: systemInfo.windowHeight || 667
  }
}

// 获取泡泡位置
const getBubblePosition = (index: number) => {
  const { width, height } = windowSize.value
  
  // 优化后的布局：使用更均匀的网格分布，避免重叠和过于密集
  if (width <= 640) {
    // 手机端优化布局
    const mobilePositions = [
      { x: '30%', y: '35%' },
      { x: '70%', y: '35%' },
      { x: '20%', y: '60%' },
      { x: '80%', y: '60%' },
      { x: '50%', y: '25%' },
      { x: '30%', y: '80%' },
      { x: '70%', y: '80%' },
      { x: '50%', y: '90%' }
    ]
    const pos = mobilePositions[index] || { x: '50%', y: '50%' }
    return {
      left: pos.x,
      top: pos.y
    }
  } else if (width <= 768) {
    // 平板端优化布局
    const tabletPositions = [
      { x: '25%', y: '35%' },
      { x: '75%', y: '35%' },
      { x: '35%', y: '60%' },
      { x: '65%', y: '60%' },
      { x: '50%', y: '25%' },
      { x: '25%', y: '80%' },
      { x: '75%', y: '80%' },
      { x: '50%', y: '70%' }
    ]
    const pos = tabletPositions[index] || { x: '50%', y: '50%' }
    return {
      left: pos.x,
      top: pos.y
    }
  } else {
    // 桌面端优化布局
    const desktopPositions = [
      { x: '25%', y: '30%' },
      { x: '75%', y: '30%' },
      { x: '35%', y: '50%' },
      { x: '65%', y: '50%' },
      { x: '50%', y: '25%' },
      { x: '25%', y: '70%' },
      { x: '75%', y: '70%' },
      { x: '50%', y: '75%' }
    ]
    const pos = desktopPositions[index] || { x: '50%', y: '50%' }
    return {
      left: pos.x,
      top: pos.y
    }
  }
}

// 获取泡泡尺寸
const getBubbleSize = (index: number) => {
  const { width } = windowSize.value
  if (width <= 640) return 'small'
  if (width <= 768) return 'medium'
  return 'large'
}

// 获取浮动动画类
const getFloatingClass = (index: number) => {
  const floatingClasses = [
    'bubble-float-1', 'bubble-float-2', 'bubble-float-3', 'bubble-float-4',
    'bubble-float-5', 'bubble-float-6', 'bubble-float-7', 'bubble-float-8'
  ]
  return floatingClasses[index % floatingClasses.length]
}

// 处理泡泡点击
const handleBubbleClick = (bubble: any) => {
  switch (bubble.bubbleType) {
    case 'normal':
      handleBubbleComplete(bubble)
      break
    case 'write':
      openModal('write', bubble)
      break
    case 'action':
      // 检查是否有倒计时
      if (bubble.hasTimer) {
        openModal('action', bubble)
        // 自动开始倒计时
        setTimeout(() => {
          startTimer()
        }, 500) // 延迟500ms确保模态框已完全显示
      } else {
        openModal('action', bubble)
      }
      break
    case 'golden':
      handleBubbleComplete(bubble)
      break
  }
}

// 处理泡泡完成
const handleBubbleComplete = (bubble: Bubble) => {
  // 移除泡泡
  currentBubbles.value = currentBubbles.value.filter(b => b.id !== bubble.id)
  
  // 增加经验值
  userExp.value += bubble.expReward
  
  // 如果是金色泡泡，添加贴纸
  if (bubble.bubbleType === 'golden' && bubble.stickerReward) {
    collectedStickers.value.push(bubble.stickerReward)
  }
  
  // 显示完成提示
  uni.showToast({
    title: `🎈 "${bubble.text}" 完成！\n${bubble.actionDescription}\n🏆 获得 +${bubble.expReward} 经验${bubble.stickerReward ? ` + ${bubble.stickerReward} 贴纸` : ''}`,
    icon: 'none',
    duration: 3000
  })
  
  // 延迟检查是否需要补充泡泡
  setTimeout(() => {
    checkBubbleSupplement()
  }, 2000)
}

// 打开模态弹窗
const openModal = (type: 'completion' | 'write' | 'action' | 'create', bubble?: Bubble) => {
  modalType.value = type
  currentModalBubble.value = bubble || null
  
  // 重置表单数据
  if (type === 'write') {
    writeContent.value = ''
  } else if (type === 'create') {
    createForm.value = {
      text: '',
      type: 'normal'
    }
  }
  
  // 重置倒计时状态
  resetTimer()
  
  showModal.value = true
}

// 关闭模态弹窗
const closeModal = () => {
  showModal.value = false
  currentModalBubble.value = null
  
  // 重置倒计时状态
  resetTimer()
}

// 打开自定义泡泡模态框
const openCustomModal = () => {
  openModal('create')
}

// 重新开始
const handleRestart = () => {
  currentBubbles.value = [...DEFAULT_BUBBLES]
  customBubbles.value = []
  usedBubbles.value = new Set(DEFAULT_BUBBLES.map(b => b.id)) // 重置已使用泡泡记录
  isCompleted.value = false
  userExp.value = 0
  collectedStickers.value = []
  
  // 清除每日挑战标记
  uni.removeStorageSync('lastDailyDate')
  
  uni.showToast({
    title: '🔄 重新开始！继续你的反思之旅',
    icon: 'none',
    duration: 2000
  })
}

// 创建更多泡泡
const handleCreateMore = () => {
  isCompleted.value = false
  openCustomModal()
}

// 获取用户等级
const getLevel = () => {
  const exp = userExp.value
  if (exp >= 100) return Math.floor(exp / 100) + 5
  if (exp >= 50) return Math.floor(exp / 50) + 3
  if (exp >= 10) return Math.floor(exp / 10) + 1
  return 1
}

// 获取进度旋转角度（用于3D进度圆环）
const getProgressRotation = () => {
  const level = getLevel()
  const baseLevelExp = level >= 5 ? 100 : level >= 3 ? 50 : 10
  const currentLevelExp = (level - 1) * baseLevelExp
  const remainingExp = userExp.value - currentLevelExp
  const rotation = (remainingExp / baseLevelExp) * 360
  return rotation
}

// 获取连续天数（模拟数据）
const getStreak = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentDay = now.getDate()
  
  // 模拟连续天数 - 在实际应用中，这里应该从数据库获取
  return Math.min(Math.floor(userExp.value / 3) + 1, 30)
}

// 获取进度百分比（用于进度条显示）
const getProgressPercentage = () => {
  const level = getLevel()
  const baseLevelExp = level >= 5 ? 100 : level >= 3 ? 50 : 10
  const currentLevelExp = (level - 1) * baseLevelExp
  const remainingExp = userExp.value - currentLevelExp
  return Math.min((remainingExp / baseLevelExp) * 100, 100)
}

// 获取泡泡包装器样式类
const getBubbleWrapperClass = (index: number) => {
  const baseClass = 'bubble-wrapper'
  const animationClasses = [
    'bubble-wrapper-1', 'bubble-wrapper-2', 'bubble-wrapper-3', 'bubble-wrapper-4',
    'bubble-wrapper-5', 'bubble-wrapper-6', 'bubble-wrapper-7', 'bubble-wrapper-8'
  ]
  return `${baseClass} ${animationClasses[index % animationClasses.length]}`
}

// 智能泡泡补充系统
// 获取当前用户等级可用的泡泡池
const getAvailableBubbles = (): Bubble[] => {
  const level = getLevel()
  const available: Bubble[] = []
  
  // 基础泡泡
  available.push(...BUBBLE_DATABASE.beginner.filter(b => 
    (b.requiredLevel || 1) <= level && !usedBubbles.value.has(b.id)
  ))
  
  // 进阶泡泡
  if (level >= 4) {
    available.push(...BUBBLE_DATABASE.intermediate.filter(b => 
      (b.requiredLevel || 4) <= level && !usedBubbles.value.has(b.id)
    ))
  }
  
  // 高级泡泡
  if (level >= 7) {
    available.push(...BUBBLE_DATABASE.advanced.filter(b => 
      (b.requiredLevel || 7) <= level && !usedBubbles.value.has(b.id)
    ))
  }
  
  // 金色泡泡
  if (level >= 3) {
    available.push(...BUBBLE_DATABASE.golden.filter(b => 
      (b.requiredLevel || 3) <= level && !usedBubbles.value.has(b.id)
    ))
  }
  
  return available
}

// 智能补充泡泡
const supplementBubbles = () => {
  const currentCount = currentBubbles.value.length
  
  // 当泡泡数量 <= 2 时触发补充
  if (currentCount <= 2) {
    const available = getAvailableBubbles()
    
    if (available.length === 0) {
      // 如果没有可用泡泡，生成每日挑战泡泡
      addDailyChallengeBubbles()
      return
    }
    
    // 根据等级决定补充数量
    const level = getLevel()
    const supplementCount = level >= 5 ? Math.min(5, available.length) : Math.min(3, available.length)
    
    // 随机选择泡泡
    const selected = available
      .sort(() => Math.random() - 0.5)
      .slice(0, supplementCount)
    
    // 添加到当前泡泡列表
    selected.forEach(bubble => {
      currentBubbles.value.push(bubble)
      usedBubbles.value.add(bubble.id)
    })
    
    // 显示补充提示
    uni.showToast({
      title: `✨ 发现了 ${selected.length} 个新泡泡！`,
      icon: 'none',
      duration: 2000
    })
  }
}

// 添加每日挑战泡泡
const addDailyChallengeBubbles = () => {
  // 检查今日是否已添加过每日挑战
  const today = new Date().toDateString()
  const lastDailyDate = uni.getStorageSync('lastDailyDate')
  
  if (lastDailyDate === today) {
    return // 今日已添加过
  }
  
  // 随机选择1-2个每日挑战泡泡
  const dailyBubbles = BUBBLE_DATABASE.daily
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2) + 1)
  
  dailyBubbles.forEach(bubble => {
    const dailyBubble = {
      ...bubble,
      id: `${bubble.id}_${Date.now()}`, // 确保ID唯一
      expReward: bubble.expReward + 1, // 每日挑战额外奖励
      actionDescription: `${bubble.actionDescription} (每日挑战)`
    }
    currentBubbles.value.push(dailyBubble)
  })
  
  // 保存今日已添加标记
  uni.setStorageSync('lastDailyDate', today)
  
  uni.showToast({
    title: `🎯 每日挑战任务已更新！`,
    icon: 'none',
    duration: 2000
  })
}

// 检查是否需要补充泡泡
const checkBubbleSupplement = () => {
  supplementBubbles()
}

// 贴纸动画
const animateSticker = (event: any) => {
  // 触发贴纸点击动画
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('sticker-bounce')
    
    setTimeout(() => {
      if (event.currentTarget) {
        event.currentTarget.classList.remove('sticker-bounce')
      }
    }, 600)
  }
  
  // 播放震动反馈
  // #ifdef APP-PLUS
  uni.vibrateShort()
  // #endif
  
  // 显示提示
  uni.showToast({
    title: '🎉 收藏的贴纸！',
    icon: 'none',
    duration: 1500
  })
}

// 写一局字数统计
const updateCharCount = () => {
  // 字数统计通过计算属性自动更新
}

// 提交写一局内容
const submitWrite = () => {
  if (!writeContent.value.trim()) return
  
  // 移除泡泡
  if (currentModalBubble.value) {
    currentBubbles.value = currentBubbles.value.filter(b => b.id !== currentModalBubble.value!.id)
    
    // 增加经验值
    userExp.value += currentModalBubble.value.expReward
    
    // 显示成功提示
    uni.showToast({
      title: `📝 写一局完成！\n${writeContent.value}\n🏆 获得 +${currentModalBubble.value.expReward} 经验`,
      icon: 'none',
      duration: 3000
    })
    
    closeModal()
    
    // 延迟检查是否需要补充泡泡
    setTimeout(() => {
      checkBubbleSupplement()
    }, 2000)
  }
}

// 完成行动任务
const completeAction = () => {
  if (currentModalBubble.value) {
    // 移除泡泡
    currentBubbles.value = currentBubbles.value.filter(b => b.id !== currentModalBubble.value!.id)
    
    // 增加经验值
    userExp.value += currentModalBubble.value.expReward
    
    // 显示行动提示
    uni.showToast({
      title: `⚡ 行动任务完成！\n${currentModalBubble.value.actionDescription}\n🏆 获得 +${currentModalBubble.value.expReward} 经验`,
      icon: 'none',
      duration: 3000
    })
    
    closeModal()
    
    // 延迟检查是否需要补充泡泡
    setTimeout(() => {
      checkBubbleSupplement()
    }, 2000)
  }
}

// 创建泡泡
const createBubble = () => {
  if (!createForm.value.text.trim()) return
  
  const newBubble: Bubble = {
    id: `custom_${Date.now()}`,
    text: createForm.value.text,
    type: 'keyword',
    category: 'custom',
    bubbleType: createForm.value.type as 'normal' | 'write' | 'action' | 'golden',
    expReward: createForm.value.type === 'golden' ? 3 : createForm.value.type === 'write' || createForm.value.type === 'action' ? 2 : 1,
    actionDescription: `自定义泡泡：${createForm.value.text}`,
    icon: createForm.value.type === 'golden' ? '⭐' : createForm.value.type === 'write' ? '✍️' : createForm.value.type === 'action' ? '⚡' : '💫',
    stickerReward: createForm.value.type === 'golden' ? '🎁' : undefined,
    isRarity: createForm.value.type === 'golden'
  }
  
  currentBubbles.value.push(newBubble)
  
  uni.showToast({
    title: `✨ 创建成功！\n"${newBubble.text}" 已添加`,
    icon: 'none',
    duration: 2000
  })
  
  closeModal()
}

// 倒计时相关方法
// 格式化时间显示
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取倒计时类别标签
const getTimerCategoryLabel = (category?: string): string => {
  const labels = {
    breathing: '深呼吸',
    rest: '休息',
    exercise: '运动',
    work: '工作',
    meditation: '冥想'
  }
  return labels[category as keyof typeof labels] || '专注'
}

// 开始倒计时
  const startTimer = () => {
    if (!currentModalBubble.value?.duration) return
    
    timerActive.value = true
    timerCompleted.value = false
    remainingTime.value = currentModalBubble.value?.duration || 0
  
  timerInterval.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
      
      // 震动反馈（每10秒）
      if (remainingTime.value % 10 === 0 && remainingTime.value > 0) {
        // #ifdef APP-PLUS
        uni.vibrateShort()
        // #endif
      }
      
      // 最后5秒震动提醒
      if (remainingTime.value <= 5 && remainingTime.value > 0) {
        // #ifdef APP-PLUS
        uni.vibrateShort()
        // #endif
      }
    } else {
      // 倒计时完成
      completeTimer()
    }
  }, 1000)
  
  // 播放开始音效反馈
  // #ifdef APP-PLUS
  uni.vibrateShort()
  // #endif
}

// 暂停倒计时
const pauseTimer = () => {
  timerActive.value = false
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

// 继续倒计时
const resumeTimer = () => {
  if (remainingTime.value > 0) {
    startTimer()
  }
}

// 完成倒计时
const completeTimer = () => {
  timerActive.value = false
  timerCompleted.value = true
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
  
  // 播放完成反馈
  // #ifdef APP-PLUS
  uni.vibrateLong()
  // #endif
  
  // 自动完成任务
  if (currentModalBubble.value) {
    // 移除泡泡
    currentBubbles.value = currentBubbles.value.filter(b => b.id !== currentModalBubble.value!.id)
    
    // 增加经验值
    userExp.value += currentModalBubble.value.expReward
    
    // 显示完成提示
    uni.showToast({
      title: `⚡ 正念练习完成！\n${currentModalBubble.value.actionDescription}\n🏆 获得 +${currentModalBubble.value.expReward} 经验`,
      icon: 'none',
      duration: 3000
    })
    
    // 延迟2秒后自动关闭弹窗并检查补充泡泡
    setTimeout(() => {
      closeModal()
      setTimeout(() => {
        checkBubbleSupplement()
      }, 500)
    }, 2000)
  }
}

// 重置倒计时状态
const resetTimer = () => {
  timerActive.value = false
  timerCompleted.value = false
  remainingTime.value = 0
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

// 生命周期
onMounted(() => {
  updateWindowSize()
  
  // 监听窗口大小变化
  // #ifdef H5
  window.addEventListener('resize', updateWindowSize)
  // #endif
  
  // 初始化时添加每日挑战泡泡（如果今天还没有）
  setTimeout(() => {
    addDailyChallengeBubbles()
  }, 1000)
  
  // 显示引导动画，3秒后隐藏
  setTimeout(() => {
    showGuide.value = false
  }, 3000)
})

// 组件卸载时清理倒计时
onUnmounted(() => {
  resetTimer()
})
</script>

<style lang="scss" scoped>
@import "@/uni.scss";
.bubble-page {
  background: $primary-gradient;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  animation: pageEntry 1s cubic-bezier(0.4, 0, 0.2, 1);
  padding-bottom: 120rpx; /* 为底部栏留出空间 */
}

@keyframes pageEntry {
  0% { 
    opacity: 0; 
    transform: translateY(40rpx);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0);
  }
}

/* 背景粒子效果 */
.background-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.bg-particle {
  position: absolute;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.2) 100%);
  border-radius: 50%;
  filter: blur(2rpx);
}

.bg-particle-1 {
  width: 120rpx;
  height: 120rpx;
  top: 10%;
  left: 15%;
  animation: floatParticle1 8s ease-in-out infinite;
}

.bg-particle-2 {
  width: 80rpx;
  height: 80rpx;
  top: 30%;
  right: 20%;
  animation: floatParticle2 6s ease-in-out infinite;
}

.bg-particle-3 {
  width: 150rpx;
  height: 150rpx;
  bottom: 25%;
  left: 25%;
  animation: floatParticle3 10s ease-in-out infinite;
}

.bg-particle-4 {
  width: 60rpx;
  height: 60rpx;
  top: 60%;
  right: 35%;
  animation: floatParticle4 7s ease-in-out infinite;
}

.bg-particle-5 {
  width: 100rpx;
  height: 100rpx;
  bottom: 15%;
  right: 10%;
  animation: floatParticle5 9s ease-in-out infinite;
}

.bg-particle-6 {
  width: 70rpx;
  height: 70rpx;
  top: 45%;
  left: 8%;
  animation: floatParticle6 5.5s ease-in-out infinite;
}

@keyframes floatParticle1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
  33% { transform: translate(30rpx, -40rpx) scale(1.1); opacity: 0.8; }
  66% { transform: translate(-20rpx, -60rpx) scale(0.9); opacity: 0.7; }
}

@keyframes floatParticle2 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  50% { transform: translate(-40rpx, -30rpx) scale(1.2); opacity: 0.9; }
}

@keyframes floatParticle3 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
  25% { transform: translate(40rpx, -50rpx) scale(1.15); opacity: 0.6; }
  75% { transform: translate(-30rpx, -70rpx) scale(0.85); opacity: 0.5; }
}

@keyframes floatParticle4 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
  40% { transform: translate(-35rpx, -25rpx) scale(1.05); opacity: 0.9; }
  80% { transform: translate(25rpx, -40rpx) scale(0.95); opacity: 0.8; }
}

@keyframes floatParticle5 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
  60% { transform: translate(20rpx, -60rpx) scale(1.1); opacity: 0.8; }
}

@keyframes floatParticle6 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
  30% { transform: translate(-25rpx, -35rpx) scale(1.2); opacity: 0.8; }
  70% { transform: translate(15rpx, -50rpx) scale(0.9); opacity: 0.7; }
}

/* 底部文字显示 */
.hero-section {
  position: relative;
  text-align: center;
  padding: 20rpx 0;
  margin-top: 20rpx;
}

.hero-content {
  max-width: 100%;
  margin: 0 auto;
}

.hero-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8rpx;
  display: block;
}

.hero-subtitle {
  font-size: 24rpx;
  color: #6b7280;
  font-weight: 400;
  display: block;
}

.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
}

.floating-icon {
  position: absolute;
  font-size: 32rpx;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.floating-1 {
  top: 20%;
  left: 10%;
  animation: floatIcon1 4s ease-in-out infinite;
}

.floating-2 {
  top: 15%;
  right: 15%;
  animation: floatIcon2 5s ease-in-out infinite;
}

.floating-3 {
  bottom: 30%;
  right: 20%;
  animation: floatIcon3 4.5s ease-in-out infinite;
}

@keyframes floatIcon1 {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
  50% { transform: translateY(-20rpx) rotate(15deg); opacity: 1; }
}

@keyframes floatIcon2 {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
  50% { transform: translateY(-25rpx) rotate(-10deg); opacity: 1; }
}

@keyframes floatIcon3 {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
  50% { transform: translateY(-18rpx) rotate(20deg); opacity: 1; }
}

/* 顶部布局样式 - 由于进度面板已绝对定位，此容器可简化 */
.top-layout {
  position: relative;
  z-index: 10;
  padding: 20rpx 32rpx;
  animation: topLayoutEntry 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

@keyframes topLayoutEntry {
  0% { 
    opacity: 0;
    transform: translateY(-20rpx);
  }
  100% { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* 左侧进度面板 - 悬浮在右上角 */
.progress-compact {
  @include modern-glass;
  border-radius: 24rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  position: absolute;
  top: 32rpx; /* 与hero-content顶部对齐 */
  right: 32rpx; /* 与hero-content右侧对齐 */
  z-index: 20; /* 高于hero-content */
  animation: floatPanel 4s ease-in-out infinite, rightPanelEntry 1.4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  transform-origin: right top;
  transition: all 0.3s ease;
}

/* 悬浮动画效果 */
@keyframes floatPanel {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  }
  50% {
    transform: translateY(-6rpx) rotate(0.5deg);
    box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.2);
  }
}

/* 悬浮效果增强 */
.progress-compact:hover {
  transform: translateY(-8rpx) scale(1.02);
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.2);
}

@keyframes leftPanelEntry {
  0% { 
    opacity: 0;
    transform: translateX(-30rpx) scale(0.95);
  }
  100% { 
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes rightPanelEntry {
  0% { 
    opacity: 0;
    transform: translateX(30rpx) scale(0.95);
  }
  100% { 
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.level-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.level-badge {
  font-size: 28rpx;
  font-weight: bold;
  color: #374151;
  background: $primary-gradient;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  min-width: 80rpx;
  text-align: center;
}

.exp-info {
  font-size: 22rpx;
  color: #6b7280;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $primary-gradient;
  border-radius: 4rpx;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 状态速览 */
.quick-stats {
  display: flex;
  gap: 24rpx;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  min-width: 48rpx;
}

.stat-emoji {
  font-size: 20rpx;
  line-height: 1;
}

.stat-text {
  font-size: 20rpx;
  font-weight: 600;
  color: #374151;
  line-height: 1;
}

/* 右侧提示卡片 */
.hint-content {
  @include modern-glass;
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  max-width: calc(50% - 12rpx);
  animation: rightPanelEntry 1.4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
  min-height: 68rpx; /* 确保最小高度 */
}

@keyframes rightPanelEntry {
  0% { 
    opacity: 0;
    transform: translateX(30rpx) scale(0.95);
  }
  100% { 
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.hint-icon {
  font-size: 24rpx;
  flex-shrink: 0;
}

.hint-text {
  flex: 1;
  font-size: 22rpx;
  color: #374151;
  font-weight: 500;
  line-height: 1.3;
}

.hint-count {
  font-size: 20rpx;
  color: #6b7280;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

/* 沉浸式泡泡容器 */
.bubble-container {
  position: relative;
  z-index: 5;
  flex: 1;
  min-height: 440rpx;
  padding: 24rpx 32rpx 32rpx;
  animation: bubbleContainerEntry 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
}

@keyframes bubbleContainerEntry {
  0% { 
    opacity: 0; 
    transform: translateY(40rpx) scale(0.98);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
}

.bubbles-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400rpx;
}

.bg-lights {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.bg-light {
  position: absolute;
  border-radius: 50%;
  filter: blur(40rpx);
  opacity: 0.3;
  animation: lightPulse 4s ease-in-out infinite;
}

.bg-light-1 {
  width: 200rpx;
  height: 200rpx;
  top: 20%;
  left: 10%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.6), transparent);
  animation-delay: 0s;
}

.bg-light-2 {
  width: 180rpx;
  height: 180rpx;
  top: 60%;
  right: 15%;
  background: radial-gradient(circle, rgba(255, 105, 180, 0.6), transparent);
  animation-delay: 1.5s;
}

.bg-light-3 {
  width: 220rpx;
  height: 220rpx;
  bottom: 20%;
  left: 50%;
  background: radial-gradient(circle, rgba(0, 191, 255, 0.6), transparent);
  animation-delay: 3s;
}

@keyframes lightPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

.bubble-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

/* 优化动画效果：使用更协调、更缓慢的浮动动画，避免视觉混乱 */
.bubble-wrapper-1 { animation: bubbleFloat1 5s ease-in-out infinite; }
.bubble-wrapper-2 { animation: bubbleFloat2 6s ease-in-out infinite; }
.bubble-wrapper-3 { animation: bubbleFloat3 5.5s ease-in-out infinite; }
.bubble-wrapper-4 { animation: bubbleFloat4 5.8s ease-in-out infinite; }
.bubble-wrapper-5 { animation: bubbleFloat5 6.2s ease-in-out infinite; }
.bubble-wrapper-6 { animation: bubbleFloat6 5.3s ease-in-out infinite; }
.bubble-wrapper-7 { animation: bubbleFloat7 6.5s ease-in-out infinite; }
.bubble-wrapper-8 { animation: bubbleFloat8 5.7s ease-in-out infinite; }

@keyframes bubbleFloat1 {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1); }
  50% { transform: translate(-50%, -50%) translateY(-12rpx) scale(1.02); }
}

@keyframes bubbleFloat2 {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1); }
  50% { transform: translate(-50%, -50%) translateY(-15rpx) scale(1.03); }
}

@keyframes bubbleFloat3 {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1); }
  50% { transform: translate(-50%, -50%) translateY(-10rpx) scale(1.01); }
}

@keyframes bubbleFloat4 {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1); }
  50% { transform: translate(-50%, -50%) translateY(-18rpx) scale(1.04); }
}

@keyframes bubbleFloat5 {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1); }
  50% { transform: translate(-50%, -50%) translateY(-13rpx) scale(1.02); }
}

@keyframes bubbleFloat6 {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1); }
  50% { transform: translate(-50%, -50%) translateY(-14rpx) scale(1.01); }
}

@keyframes bubbleFloat7 {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1); }
  50% { transform: translate(-50%, -50%) translateY(-16rpx) scale(1.03); }
}

@keyframes bubbleFloat8 {
  0%, 100% { transform: translate(-50%, -50%) translateY(0) scale(1); }
  50% { transform: translate(-50%, -50%) translateY(-11rpx) scale(1.02); }
}

/* 底部操作栏 - 固定在底部 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 15;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-top: 1rpx solid rgba(255, 255, 255, 0.3);
  padding: 24rpx 32rpx;
  animation: bottomBarEntry 2s cubic-bezier(0.4, 0, 0.2, 1) 1s both;
}

@keyframes bottomBarEntry {
  0% { 
    opacity: 0; 
    transform: translateY(60rpx);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0);
  }
}

.bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  max-width: 600rpx;
  margin: 0 auto;
}

.create-btn {
  @include modern-btn-primary;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 32rpx;
  font-size: 26rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.create-icon {
  font-size: 28rpx;
}

.create-text {
  font-weight: 600;
}

.quick-tip {
  @include modern-glass;
  border-radius: 20rpx;
  padding: 16rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}

.tip-emoji {
  font-size: 24rpx;
  flex-shrink: 0;
}

.tip-message {
  font-size: 22rpx;
  color: #374151;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 完成页面遮罩 */
.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20rpx);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

/* 主标题区域 */
.header-section {
  position: absolute;
  top: 48rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  text-align: center;
  padding: 0 32rpx;
}

.title-container {
  @include bubble-glass;
  padding: 32rpx 64rpx;
  border-radius: 48rpx;
  box-shadow: 0 32rpx 80rpx rgba(31, 38, 135, 0.4);
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 16rpx;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* 进度状态区域 */
.progress-section {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  z-index: 20;
}

.progress-card {
  @include bubble-glass;
  padding: 24rpx 32rpx;
  border-radius: 32rpx;
  min-width: 200rpx;
}

.progress-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.progress-text {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.stickers-container {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.sticker-text {
  font-size: 20rpx;
}

.more-stickers {
  font-size: 20rpx;
  color: #666;
}

/* 泡泡说明区域 */
.info-section {
  position: absolute;
  top: 32rpx;
  left: 32rpx;
  z-index: 20;
}

.info-card {
  @include bubble-glass;
  padding: 24rpx 32rpx;
  border-radius: 80rpx;
}

.info-title {
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.info-desc {
  font-size: 20rpx;
  color: #666;
  font-weight: 500;
}

/* 泡泡容器 */
.bubble-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 160rpx 32rpx 0;
}

.bubbles-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 1200rpx;
}

.bubble-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
}

/* 底部操作栏 */
.bottom-toolbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40rpx);
  border-top: 2rpx solid rgba(255, 255, 255, 0.2);
}

.toolbar-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.toolbar-hint {
  text-align: center;
}

.hint-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* 完成页面遮罩 */
.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20rpx);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

/* 按钮样式 */
.btn {
  @include bubble-btn-primary;
  padding: 24rpx 48rpx;
  font-size: 28rpx;
  min-width: 300rpx;
}

.btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .header-section {
    top: 32rpx;
    padding: 0 16rpx;
  }
  
  .title-container {
    padding: 24rpx 32rpx;
  }
  
  .title {
    font-size: 36rpx;
  }
  
  .subtitle {
    font-size: 24rpx;
  }
  
  .progress-section {
    top: 16rpx;
    right: 16rpx;
  }
  
  .progress-card {
    padding: 16rpx 20rpx;
    min-width: 160rpx;
  }
  
  .info-section {
    top: 16rpx;
    left: 16rpx;
  }
  
  .info-card {
    padding: 16rpx 20rpx;
  }
  
  .bubble-container {
    padding: 120rpx 16rpx 0;
  }
  
  .bottom-toolbar {
    padding: 24rpx 16rpx;
  }
  
  .btn {
    min-width: 280rpx;
    padding: 20rpx 40rpx;
    font-size: 26rpx;
  }
  
  .hint-text {
    font-size: 22rpx;
  }
}

@media screen and (max-width: 480rpx) {
  .title {
    font-size: 32rpx;
  }
  
  .subtitle {
    font-size: 22rpx;
  }
  
  .progress-text, .info-title {
    font-size: 22rpx;
  }
  
  .info-desc, .hint-text {
    font-size: 20rpx;
  }
}

  /* 引导动画样式 */
  .guide-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 1s ease-out;
  }
  
  .guide-content {
    text-align: center;
  }
  
  .guide-bubble {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40rpx 60rpx;
    border-radius: 100rpx;
    font-size: 36rpx;
    box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
  }
  
  .guide-hint {
    margin-top: 60rpx;
    font-size: 60rpx;
  }
  
  /* 动画效果 */
  .animate-fade-out {
    animation: fadeOut 3s forwards;
  }
  
  .animate-pulse {
    animation: pulse 2s infinite;
  }
  
  .animate-bounce {
    animation: bounce 1.5s infinite;
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
      visibility: hidden;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20rpx);
    }
  }

/* 统一模态弹窗系统样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20rpx);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  animation: modalOverlayFadeIn 0.3s ease-out;
}

@keyframes modalOverlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30rpx);
  border-radius: 32rpx;
  max-width: 600rpx;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 32rpx 80rpx rgba(0, 0, 0, 0.2);
  animation: modalContainerSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalContainerSlideIn {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
}

.modal-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.modal-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: #374151;
}

.close-btn {
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 50%;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

.modal-body {
  padding: 32rpx;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx 32rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.08);
}

/* 完成弹窗样式 */
.completion-modal {
  text-align: center;
}

.completion-message {
  font-size: 28rpx;
  color: #374151;
  margin-bottom: 32rpx;
  line-height: 1.5;
}

.stats-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24rpx;
}

.stats-summary .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 22rpx;
  color: #6b7280;
}

/* 写一局弹窗样式 */
.write-modal .bubble-info {
  margin-bottom: 32rpx;
}

.bubble-preview {
  @include modern-glass;
  border-radius: 24rpx;
  padding: 24rpx;
  text-align: center;
  position: relative;
}

.bubble-text {
  font-size: 28rpx;
  color: #374151;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.bubble-type-badge {
  display: inline-block;
  background: $primary-gradient;
  color: white;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.write-form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.write-input {
  width: 100%;
  min-height: 200rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 1.5;
  resize: vertical;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.write-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 22rpx;
  color: #6b7280;
}

/* 行动任务弹窗样式 */
.action-modal .bubble-info {
  margin-bottom: 32rpx;
}

.action-content {
  text-align: center;
}

.action-description {
  font-size: 28rpx;
  color: #374151;
  margin-bottom: 32rpx;
  line-height: 1.5;
}

.action-steps {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12rpx;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  background: $primary-gradient;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 22rpx;
}

.step-text {
  flex: 1;
  font-size: 24rpx;
  color: #374151;
}

/* 倒计时UI样式 */
.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  margin: 32rpx 0;
}

.timer-display {
  position: relative;
  width: 240rpx;
  height: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-circle {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-progress-ring {
  width: 180rpx;
  height: 180rpx;
  border: 8rpx solid rgba(102, 126, 234, 0.2);
  border-radius: 50%;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
  transform: none;
  transform-origin: center center;
}

.timer-progress-ring::before {
  content: '';
  position: absolute;
  top: -8rpx;
  left: -8rpx;
  right: -8rpx;
  bottom: -8rpx;
  border: 8rpx solid transparent;
  border-top-color: #667eea;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.timer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.timer-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #374151;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.timer-label {
  font-size: 20rpx;
  color: #6b7280;
  font-weight: 500;
  background: rgba(102, 126, 234, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.timer-controls {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 400rpx;
}

.timer-btn {
  padding: 16rpx 32rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  text-align: center;
  min-width: 120rpx;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-btn.primary {
  background: $primary-gradient;
  color: white;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}

.timer-btn.primary:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
}

.timer-btn.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: white;
  box-shadow: 0 4rpx 16rpx rgba(245, 158, 11, 0.3);
}

.timer-btn.warning:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 20rpx rgba(245, 158, 11, 0.4);
}

.timer-btn.secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
  border: 1rpx solid rgba(0, 0, 0, 0.1);
}

.timer-btn.secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

.timer-btn.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4rpx 16rpx rgba(16, 185, 129, 0.3);
}

.timer-btn.success:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 20rpx rgba(16, 185, 129, 0.4);
}

.timer-tip {
  text-align: center;
  max-width: 300rpx;
}

.tip-text {
  font-size: 22rpx;
  color: #6b7280;
  line-height: 1.4;
  font-weight: 500;
}

.completion-text {
  font-size: 24rpx;
  color: #10b981;
  font-weight: 600;
  animation: completionPulse 2s ease-in-out infinite;
}

@keyframes completionPulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* 无倒计时任务的简单样式 */
.simple-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  margin: 32rpx 0;
  text-align: center;
}

.action-check-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 16rpx rgba(16, 185, 129, 0.3);
}

.action-complete-text {
  font-size: 28rpx;
  color: #374151;
  font-weight: 500;
  margin-bottom: 16rpx;
}

/* 倒计时动画效果 */
@keyframes timerPulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.timer-active .timer-progress-ring {
  animation: timerPulse 2s ease-in-out infinite;
}

/* 响应式设计 */
@media screen and (max-width: 480rpx) {
  .timer-display {
    width: 200rpx;
    height: 200rpx;
  }
  
  .timer-progress-ring {
    width: 150rpx;
    height: 150rpx;
  }
  
  .timer-text {
    font-size: 40rpx;
  }
  
  .timer-controls {
    gap: 12rpx;
  }
  
  .timer-btn {
    padding: 14rpx 24rpx;
    font-size: 22rpx;
    min-width: 100rpx;
  }
}

/* 创建泡泡弹窗样式 */
.create-form {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.form-label {
  font-size: 26rpx;
  color: #374151;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 20rpx 24rpx;
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  border-radius: 16rpx;
  font-size: 28rpx;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.type-selector {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.type-btn {
  flex: 1;
  min-width: 120rpx;
  padding: 16rpx 20rpx;
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  cursor: pointer;
}

.type-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.type-btn.active {
  border-color: #667eea;
  background: $primary-gradient;
  color: white;
}

.type-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.type-name {
  font-size: 22rpx;
  font-weight: 500;
}

.bubble-preview-large {
  @include modern-glass;
  border-radius: 24rpx;
  padding: 32rpx;
  text-align: center;
  min-height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-text {
  font-size: 32rpx;
  color: #374151;
  font-weight: 500;
}

.bubble-preview-large.type-normal {
  border-color: rgba(102, 126, 234, 0.3);
}

.bubble-preview-large.type-write {
  border-color: rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%);
}

.bubble-preview-large.type-action {
  border-color: rgba(251, 146, 60, 0.3);
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%);
}

.bubble-preview-large.type-golden {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%);
}

/* 通用按钮样式 */
.btn {
  padding: 20rpx 32rpx;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 120rpx;
}

.btn-primary {
  background: $primary-gradient;
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

.btn-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}
</style>
