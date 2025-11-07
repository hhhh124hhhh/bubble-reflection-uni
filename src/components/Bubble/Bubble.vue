<template>
  <view 
    class="bubble"
    :class="[
      `bubble-${props.bubble.bubbleType}`,
      `bubble-${props.bubble.type}`,
      `bubble-${props.bubble.category}`,
      props.floatingClass,
      { 'bubble-clicked': isClicked }
    ]"
    :style="bubbleStyle"
    @click="handleClick"
  >
    <!-- 泡泡类型标识 -->
    <view class="bubble-type-indicator" :class="`type-${props.bubble.bubbleType}`">
      <text class="indicator-icon">{{ props.bubble.icon || getBubbleIcon(props.bubble.bubbleType) }}</text>
    </view>

    <!-- 粒子效果 -->
    <view v-if="showParticles" class="particles-container">
      <view 
        v-for="(particle, index) in particles" 
        :key="particle.id"
        class="particle"
        :class="`particle-${index + 1}`"
        :style="getParticleStyle(particle)"
      ></view>
    </view>
    
    <!-- 悬浮标签 -->
    <view v-if="isHovered && !isClicked" class="floating-tag">
      {{ getBubbleTypeLabel(props.bubble.bubbleType) }} · +{{ props.bubble.expReward }}经验
    </view>
    
    <!-- 泡泡内容 -->
    <text class="bubble-text">{{ props.bubble.text }}</text>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 定义props
interface Props {
  bubble: {
    id: string
    text: string
    type: 'emotion' | 'keyword'
    category: string
    bubbleType: 'normal' | 'write' | 'action' | 'golden'
    expReward: number
    icon?: string
    stickerReward?: string
  }
  size?: 'small' | 'medium' | 'large'
  floatingClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  floatingClass: 'bubble-float-1'
})

// 定义emits
const emit = defineEmits<{
  click: [bubble: Props['bubble']]
}>()

// 响应式数据
const isHovered = ref(false)
const isClicked = ref(false)
const showParticles = ref(false)
const particles = ref<Array<{ id: number; color: string; x: number; y: number }>>([])

// 计算属性
const bubbleStyle = computed(() => {
  const sizeMap = {
    small: '112rpx',
    medium: '144rpx',
    large: '176rpx'
  }
  
  return {
    width: sizeMap[props.size],
    height: sizeMap[props.size]
  }
})

// 获取泡泡图标
const getBubbleIcon = (bubbleType: string) => {
  const iconMap: Record<string, string> = {
    normal: '💫',
    write: '✍️',
    action: '⚡',
    golden: '⭐'
  }
  return iconMap[bubbleType] || '💫'
}

// 获取泡泡类型标签
const getBubbleTypeLabel = (bubbleType: string) => {
  const labelMap: Record<string, string> = {
    normal: '普通',
    write: '写一句',
    action: '行动',
    golden: '金色'
  }
  return labelMap[bubbleType] || '普通'
}

// 获取粒子样式
const getParticleStyle = (particle: any) => {
  return {
    backgroundColor: particle.color,
    left: '50%',
    top: '50%',
    marginLeft: '-4rpx',
    marginTop: '-4rpx',
    width: '8rpx',
    height: '8rpx',
    boxShadow: '0 0 10rpx rgba(255,255,255,0.8)'
  }
}

// 处理点击
const handleClick = () => {
  if (isClicked.value) return;
  
  isClicked.value = true;
  showParticles.value = true;
  
  // 创建粒子效果
  particles.value = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    color: getRandomColor(),
    x: 0,
    y: 0
  }));
  
  // 触发点击事件
  emit('click', props.bubble);
  
  // 重置状态
  setTimeout(() => {
    isClicked.value = false;
    showParticles.value = false;
    particles.value = [];
  }, 1500);
};

// 生成随机颜色
const getRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 已在handleClick中直接实现粒子效果创建

// 处理鼠标悬停（仅在H5端有效）
const handleMouseEnter = () => {
  // #ifdef H5
  isHovered.value = true
  // #endif
}

const handleMouseLeave = () => {
  // #ifdef H5
  isHovered.value = false
  // #endif
}
</script>

<style scoped>
.bubble {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12rpx;
  color: #333;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  box-shadow: 0 8rpx 32rpx rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(10rpx);
}

/* 泡泡类型基础样式 - 使用新的柔和色彩系统 */
.bubble-normal {
  background: rgba(255, 255, 255, 0.9);
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10rpx);
}

.bubble-write {
  background: linear-gradient(135deg, rgba(224, 231, 255, 0.9), rgba(237, 233, 254, 0.9));
  box-shadow: 0 8rpx 32rpx rgba(99, 102, 241, 0.15);
  animation: writeShine 3s ease-in-out infinite;
  border: 2rpx solid rgba(99, 102, 241, 0.3);
  backdrop-filter: blur(10rpx);
}

.bubble-action {
  background: linear-gradient(135deg, rgba(220, 252, 231, 0.9), rgba(236, 253, 245, 0.9));
  box-shadow: 0 8rpx 32rpx rgba(16, 185, 129, 0.15);
  border: 2rpx solid rgba(16, 185, 129, 0.3);
  backdrop-filter: blur(10rpx);
}

.bubble-golden {
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.9), rgba(253, 230, 138, 0.9));
  box-shadow: 0 10rpx 40rpx rgba(251, 191, 36, 0.25);
  animation: goldenGlow 2s ease-in-out infinite;
  border: 2rpx solid rgba(251, 191, 36, 0.4);
  backdrop-filter: blur(10rpx);
}

/* 情绪颜色 */
.bubble-emotion-peaceful { 
  background: linear-gradient(135deg, rgba(224, 195, 252, 0.2), rgba(240, 230, 255, 0.3)); 
  border: 2rpx solid rgba(224, 195, 252, 0.6);
}
.bubble-emotion-happy { 
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.2), rgba(250, 220, 255, 0.3)); 
  border: 2rpx solid rgba(240, 147, 251, 0.6);
}
.bubble-emotion-sad { 
  background: linear-gradient(135deg, rgba(168, 237, 234, 0.2), rgba(220, 250, 250, 0.3)); 
  border: 2rpx solid rgba(168, 237, 234, 0.6);
}
.bubble-emotion-anxious { 
  background: linear-gradient(135deg, rgba(255, 236, 210, 0.2), rgba(255, 245, 235, 0.3)); 
  border: 2rpx solid rgba(255, 236, 210, 0.6);
}
.bubble-emotion-grateful { 
  background: linear-gradient(135deg, rgba(168, 237, 234, 0.2), rgba(220, 250, 250, 0.3)); 
  border: 2rpx solid rgba(168, 237, 234, 0.6);
}

/* 关键词颜色 */
.bubble-keyword-health { 
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(220, 240, 255, 0.3)); 
  border: 2rpx solid rgba(79, 172, 254, 0.6);
}
.bubble-keyword-work { 
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(220, 230, 255, 0.3)); 
  border: 2rpx solid rgba(102, 126, 234, 0.6);
}
.bubble-keyword-family { 
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.2), rgba(250, 220, 255, 0.3)); 
  border: 2rpx solid rgba(240, 147, 251, 0.6);
}
.bubble-keyword-goal { 
  background: linear-gradient(135deg, rgba(48, 207, 208, 0.2), rgba(220, 250, 250, 0.3)); 
  border: 2rpx solid rgba(48, 207, 208, 0.6);
}
.bubble-keyword-future { 
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.2), rgba(220, 255, 230, 0.3)); 
  border: 2rpx solid rgba(67, 233, 123, 0.6);
}

/* 泡泡类型标识 */
.bubble-type-indicator {
  position: absolute;
  top: -15rpx;
  right: -15rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.3);
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10rpx);
  z-index: 10;
}

.type-normal { 
  background: linear-gradient(135deg, #667eea, #764ba2); 
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
}
.type-write { 
  background: linear-gradient(135deg, #FFD700, #FFA500); 
  box-shadow: 0 6rpx 20rpx rgba(255, 215, 0, 0.4);
}
.type-action { 
  background: linear-gradient(135deg, #10B981, #34D399); 
  box-shadow: 0 6rpx 20rpx rgba(16, 185, 129, 0.4);
}
.type-golden { 
  background: linear-gradient(135deg, #FFD700, #FF8C00); 
  box-shadow: 0 6rpx 20rpx rgba(255, 215, 0, 0.6);
}

.indicator-icon {
  font-size: 24rpx;
  font-weight: bold;
  color: white;
  text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.3);
}

/* 悬浮标签 */
.floating-tag {
  position: absolute;
  top: -50rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  font-size: 20rpx;
  font-weight: 600;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 6rpx 24rpx rgba(31, 38, 135, 0.4);
  backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
}

/* 粒子效果 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.particle-1 { animation: particleFloat1 2s ease-out forwards; }
.particle-2 { animation: particleFloat2 2.5s ease-out forwards; }
.particle-3 { animation: particleFloat3 1.8s ease-out forwards; }
.particle-4 { animation: particleFloat4 2.2s ease-out forwards; }
.particle-5 { animation: particleFloat5 1.9s ease-out forwards; }

/* 泡泡文本 */
.bubble-text {
  font-size: 24rpx;
  font-weight: 600;
  position: relative;
  z-index: 10;
  line-height: 1.2;
  text-align: center;
  color: #333;
  text-shadow: 0 1rpx 3rpx rgba(255, 255, 255, 0.8);
}

/* hover效果 */
.bubble:hover {
  transform: scale(1.05);
  box-shadow: 0 12rpx 40rpx rgba(31, 38, 135, 0.4);
  z-index: 20;
}

.bubble:hover .bubble-type-indicator {
  transform: scale(1.1);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.4);
}

/* 戳击动画 */
.bubble-clicked {
  animation: bubblePop 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 按压效果 */
.bubble:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

/* 浮动动画 */
@keyframes bubbleFloat1 {
  0%, 100% { transform: translateY(0rpx) translateX(0rpx) scale(1); }
  25% { transform: translateY(-24rpx) translateX(4rpx) scale(1.02); }
  50% { transform: translateY(-12rpx) translateX(-2rpx) scale(0.98); }
  75% { transform: translateY(-30rpx) translateX(6rpx) scale(1.01); }
}

@keyframes bubbleFloat2 {
  0%, 100% { transform: translateY(0rpx) translateX(0rpx) scale(1); }
  33% { transform: translateY(-16rpx) translateX(-6rpx) scale(1.03); }
  66% { transform: translateY(-20rpx) translateX(4rpx) scale(0.97); }
}

@keyframes bubbleFloat3 {
  0%, 100% { transform: translateY(0rpx) translateX(0rpx) scale(1); }
  20% { transform: translateY(-28rpx) translateX(2rpx) scale(1.01); }
  60% { transform: translateY(-14rpx) translateX(-4rpx) scale(1.02); }
  80% { transform: translateY(-22rpx) translateX(6rpx) scale(0.99); }
}

/* 戳击动画 */
@keyframes bubblePop {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  15% { transform: scale(1.5) rotate(8deg); opacity: 0.9; }
  30% { transform: scale(1.2) rotate(-5deg); opacity: 0.8; }
  50% { transform: scale(0.8) rotate(12deg); opacity: 0.6; }
  70% { transform: scale(0.4) rotate(-15deg); opacity: 0.3; }
  100% { transform: scale(0) rotate(0deg); opacity: 0; }
}

/* 粒子动画 */
@keyframes particleFloat1 {
  0% { transform: translate(0, 0) scale(1.5); opacity: 1; }
  50% { transform: translate(40rpx, -50rpx) scale(1.8); opacity: 0.8; }
  100% { transform: translate(100rpx, -120rpx) scale(0.5); opacity: 0; }
}

@keyframes particleFloat2 {
  0% { transform: translate(0, 0) scale(1.2); opacity: 1; }
  50% { transform: translate(-40rpx, -60rpx) scale(1.6); opacity: 0.7; }
  100% { transform: translate(-80rpx, -100rpx) scale(0.3); opacity: 0; }
}

@keyframes particleFloat3 {
  0% { transform: translate(0, 0) scale(1.4); opacity: 1; }
  50% { transform: translate(50rpx, -40rpx) scale(1.7); opacity: 0.9; }
  100% { transform: translate(90rpx, -80rpx) scale(0.4); opacity: 0; }
}

@keyframes particleFloat4 {
  0% { transform: translate(0, 0) scale(1.3); opacity: 1; }
  50% { transform: translate(-50rpx, -30rpx) scale(1.5); opacity: 0.8; }
  100% { transform: translate(-100rpx, -60rpx) scale(0.2); opacity: 0; }
}

@keyframes particleFloat5 {
  0% { transform: translate(0, 0) scale(1.6); opacity: 1; }
  50% { transform: translate(20rpx, -70rpx) scale(1.9); opacity: 0.7; }
  100% { transform: translate(50rpx, -130rpx) scale(0.6); opacity: 0; }
}

/* 写一句泡泡闪光效果 */
@keyframes writeShine {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}

/* 金色泡泡发光效果 */
@keyframes goldenGlow {
  0%, 100% { 
    box-shadow: 0 0 40rpx rgba(255, 215, 0, 0.6);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 80rpx rgba(255, 215, 0, 0.9);
    transform: scale(1.05);
  }
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .bubble-text {
    font-size: 20rpx;
  }
  
  .bubble-type-indicator {
    width: 40rpx;
    height: 40rpx;
    top: -12rpx;
    right: -12rpx;
  }
  
  .indicator-icon {
    font-size: 20rpx;
  }
  
  .floating-tag {
    font-size: 18rpx;
    padding: 6rpx 16rpx;
    top: -40rpx;
  }
}

@media screen and (max-width: 480rpx) {
  .bubble-text {
    font-size: 18rpx;
  }
  
  .bubble-type-indicator {
    width: 36rpx;
    height: 36rpx;
    top: -10rpx;
    right: -10rpx;
  }
  
  .indicator-icon {
    font-size: 18rpx;
  }
  
  .floating-tag {
    font-size: 16rpx;
    padding: 4rpx 12rpx;
    top: -36rpx;
  }
}
</style>