<template>
  <view class="completion-modal">
    <!-- 背景装饰 -->
    <view class="bg-decoration-1"></view>
    <view class="bg-decoration-2"></view>
    
    <view class="modal-content">
      <!-- 完成图标 -->
      <view class="completion-icon">
        <view class="icon-circle">
          <text class="icon-emoji">🎉</text>
        </view>
      </view>
      
      <!-- 标题和描述 -->
      <view class="content-section">
        <text class="title">🎊 反思完成！</text>
        <text class="subtitle">恭喜你完成了所有泡泡的探索之旅</text>
      </view>
      
      <!-- 操作建议 -->
      <view class="suggestions-section">
        <text class="suggestions-title">接下来你可以：</text>
        <view class="suggestions-list">
          <view class="suggestion-item">
            <text class="suggestion-icon">✨</text>
            <text class="suggestion-text">创建新的自定义泡泡继续反思</text>
          </view>
          <view class="suggestion-item">
            <text class="suggestion-icon">🔄</text>
            <text class="suggestion-text">重新开始探索新的情绪和关键词</text>
          </view>
          <view class="suggestion-item">
            <text class="suggestion-icon">📝</text>
            <text class="suggestion-text">记录和分享你的反思成果</text>
          </view>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="actions-section">
        <button class="btn btn-secondary" @click="handleRestart">
          🔄 重新开始
        </button>
        <button class="btn btn-primary" @click="handleCreateMore">
          + 创建新泡泡
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 定义emits
const emit = defineEmits<{
  restart: []
  createMore: []
}>()

// 处理重新开始
const handleRestart = () => {
  emit('restart')
}

// 处理创建更多泡泡
const handleCreateMore = () => {
  emit('createMore')
}
</script>

<style scoped>
.completion-modal {
  @include premium-glass;
  border-radius: 48rpx;
  padding: 48rpx;
  max-width: 600rpx;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 0 32rpx 120rpx rgba(31, 38, 135, 0.4);
}

/* 背景装饰 */
.bg-decoration-1 {
  position: absolute;
  top: -80rpx;
  right: -80rpx;
  width: 160rpx;
  height: 160rpx;
  background: $primary-gradient-soft;
  border-radius: 50%;
  filter: blur(60rpx);
  opacity: 0.6;
  animation: decorationFloat1 8s ease-in-out infinite;
}

.bg-decoration-2 {
  position: absolute;
  bottom: -80rpx;
  left: -80rpx;
  width: 128rpx;
  height: 128rpx;
  background: $warm-orange-gradient;
  border-radius: 50%;
  filter: blur(48rpx);
  opacity: 0.5;
  animation: decorationFloat2 6s ease-in-out infinite;
}

@keyframes decorationFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20rpx, -30rpx) scale(1.1); }
}

@keyframes decorationFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30rpx, 20rpx) scale(1.05); }
}

.modal-content {
  position: relative;
  z-index: 10;
  text-align: center;
}

/* 完成图标 */
.completion-icon {
  margin-bottom: 48rpx;
}

.icon-circle {
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto;
  border-radius: 50%;
  background: $primary-gradient;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 40rpx rgba(102, 126, 234, 0.4);
  animation: iconPulse 2s ease-in-out infinite;
  border: 3rpx solid rgba(255, 255, 255, 0.8);
}

.icon-emoji {
  font-size: 96rpx;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 内容区域 */
.content-section {
  margin-bottom: 48rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.4;
}

/* 建议区域 */
.suggestions-section {
  margin-bottom: 48rpx;
  @include modern-glass;
  border-radius: 32rpx;
  padding: 32rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.6);
}

.suggestions-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  text-align: left;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  text-align: left;
}

.suggestion-icon {
  font-size: 32rpx;
  width: 40rpx;
  text-align: center;
}

.suggestion-text {
  font-size: 26rpx;
  color: #555;
  line-height: 1.4;
  flex: 1;
}

/* 操作按钮区域 */
.actions-section {
  display: flex;
  gap: 24rpx;
}

.btn {
  flex: 1;
  padding: 32rpx 48rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  text-align: center;
}

.btn-primary {
  @include modern-btn-primary;
}

.btn-secondary {
  @include soft-btn;
  color: #333;
  border: 2rpx solid rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 0.9);
}

.btn-primary:active {
  transform: translateY(2rpx);
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.btn-secondary:active {
  transform: translateY(1rpx);
  background: rgba(255, 255, 255, 0.2);
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .completion-modal {
    padding: 32rpx;
    margin: 32rpx;
  }
  
  .icon-circle {
    width: 140rpx;
    height: 140rpx;
  }
  
  .icon-emoji {
    font-size: 80rpx;
  }
  
  .title {
    font-size: 40rpx;
  }
  
  .subtitle {
    font-size: 26rpx;
  }
  
  .suggestions-section {
    padding: 24rpx;
  }
  
  .suggestions-title {
    font-size: 26rpx;
  }
  
  .suggestion-text {
    font-size: 24rpx;
  }
  
  .btn {
    padding: 28rpx 40rpx;
    font-size: 26rpx;
  }
}

@media screen and (max-width: 480rpx) {
  .completion-modal {
    padding: 24rpx;
    margin: 24rpx;
  }
  
  .icon-circle {
    width: 120rpx;
    height: 120rpx;
  }
  
  .icon-emoji {
    font-size: 72rpx;
  }
  
  .title {
    font-size: 36rpx;
  }
  
  .subtitle {
    font-size: 24rpx;
  }
  
  .suggestions-section {
    padding: 20rpx;
  }
  
  .suggestions-title {
    font-size: 24rpx;
  }
  
  .suggestion-text {
    font-size: 22rpx;
  }
  
  .btn {
    padding: 24rpx 32rpx;
    font-size: 24rpx;
  }
  
  .actions-section {
    flex-direction: column;
    gap: 16rpx;
  }
}
</style>