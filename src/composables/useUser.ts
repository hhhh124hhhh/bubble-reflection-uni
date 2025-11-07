import { ref, computed } from 'vue'
import { userService, type User, type Reflection, type CustomBubble } from '@/utils/userService'

// 用户状态
const currentUser = ref<User | null>(null)
const userReflections = ref<Reflection[]>([])
const customBubbles = ref<CustomBubble[]>([])
const isLoading = ref(false)

export function useUser() {
  // 计算属性
  const isLoggedIn = computed(() => currentUser.value !== null)
  const userLevel = computed(() => {
    if (!currentUser.value) return 1
    return Math.floor((currentUser.value.totalExp || 0) / 10) + 1
  })
  const nextLevelExp = computed(() => userLevel.value * 10)
  const currentLevelProgress = computed(() => {
    if (!currentUser.value) return 0
    const exp = currentUser.value.totalExp || 0
    return exp % 10
  })
  const uniqueStickers = computed(() => {
    if (!currentUser.value) return []
    return [...new Set(currentUser.value.stickers || [])]
  })
  
  /**
   * 初始化用户数据
   */
  const initUser = async () => {
    if (isLoading.value) return
    
    isLoading.value = true
    try {
      console.log('开始初始化用户数据...');
      currentUser.value = await userService.getOrCreateUser()
      
      // 检查是否是无登录模式
      if (currentUser.value && currentUser.value._openid?.includes('local_user_')) {
        console.log('应用运行在无登录模式下');
        // 可以选择静默模式，不显示提示
        // 或者显示一个友好的提示
        // uni.showToast({
        //   title: '运行在离线模式',
        //   icon: 'none',
        //   duration: 2000
        // })
      }
    } catch (error: any) {
      console.error('初始化用户数据失败:', error)
      // 即使失败，也尝试提供基本功能
      if (!currentUser.value) {
        console.warn('创建本地默认用户...');
        // 创建一个本地默认用户
        currentUser.value = {
          _openid: 'local_user_fallback_' + Date.now(),
          totalExp: 0,
          stickers: [],
          reflectionsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
      // 避免过多打扰用户，只在控制台打印错误
      console.log('应用将在有限功能下运行');
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 添加经验值
   */
  const addExp = async (exp: number) => {
    if (!currentUser.value) return
    
    try {
      // 先更新本地状态，保证即时反馈
      currentUser.value.totalExp = (currentUser.value.totalExp || 0) + exp
      
      // 尝试同步到服务器
      try {
        await userService.addExp(exp)
      } catch (syncError) {
        console.warn('无法同步经验值到服务器，但本地已更新:', syncError)
        // 不影响用户体验，本地状态已经更新
      }
      
      // 显示奖励动画
      uni.showToast({
        title: `🏆 +${exp} 经验值`,
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('添加经验值失败:', error)
      // 即使失败，也尝试提供基本体验
      if (currentUser.value) {
        currentUser.value.totalExp = (currentUser.value.totalExp || 0) + exp
      }
    }
  }
  
  /**
   * 添加贴纸
   */
  const addSticker = async (sticker: string) => {
    if (!currentUser.value) return
    
    try {
      await userService.addSticker(sticker)
      if (!currentUser.value.stickers) {
        currentUser.value.stickers = []
      }
      currentUser.value.stickers.push(sticker)
      
      // 显示获得贴纸动画
      uni.showToast({
        title: `🌟 获得贴纸: ${sticker}`,
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('添加贴纸失败:', error)
    }
  }
  
  /**
   * 保存反思记录
   */
  const saveReflection = async (reflectionData: Omit<Reflection, '_id' | '_openid' | 'completedAt'>) => {
    try {
      // 生成临时ID用于本地状态
      const tempId = 'local_' + Date.now()
      
      // 先添加到本地状态，保证即时反馈
      const newReflection: Reflection = {
        ...reflectionData,
        _id: tempId,
        completedAt: new Date().toISOString()
      }
      userReflections.value.unshift(newReflection)
      
      // 尝试同步到服务器
      try {
        const serverId = await userService.saveReflection(reflectionData)
        // 如果成功，更新ID
        if (serverId && userReflections.value[0]._id === tempId) {
          userReflections.value[0]._id = serverId
        }
        return serverId || tempId
      } catch (syncError) {
        console.warn('无法同步反思记录到服务器，但本地已保存:', syncError)
        // 返回临时ID，应用仍能继续使用
        return tempId
      }
    } catch (error) {
      console.error('保存反思记录失败:', error)
      // 即使失败，也尝试提供基本体验
      try {
        const tempId = 'local_fallback_' + Date.now()
        const fallbackReflection: Reflection = {
          ...reflectionData,
          _id: tempId,
          completedAt: new Date().toISOString()
        }
        userReflections.value.unshift(fallbackReflection)
        return tempId
      } catch (fallbackError) {
        throw error
      }
    }
  }
  
  /**
   * 获取反思记录
   */
  const fetchReflections = async (limit: number = 10) => {
    try {
      userReflections.value = await userService.getReflections(limit)
    } catch (error) {
      console.error('获取反思记录失败:', error)
    }
  }
  
  /**
   * 创建自定义泡泡
   */
  const createCustomBubble = async (bubbleData: Omit<CustomBubble, '_id' | '_openid' | 'createdAt'>) => {
    try {
      const bubbleId = await userService.createCustomBubble(bubbleData)
      
      // 添加到本地状态
      const newBubble: CustomBubble = {
        ...bubbleData,
        _id: bubbleId,
        createdAt: new Date().toISOString()
      }
      customBubbles.value.unshift(newBubble)
      
      return bubbleId
    } catch (error) {
      console.error('创建自定义泡泡失败:', error)
      throw error
    }
  }
  
  /**
   * 获取自定义泡泡
   */
  const fetchCustomBubbles = async (limit: number = 20) => {
    try {
      customBubbles.value = await userService.getCustomBubbles(limit)
    } catch (error) {
      console.error('获取自定义泡泡失败:', error)
    }
  }
  
  /**
   * 获取用户统计数据
   */
  const getUserStatistics = async () => {
    try {
      return await userService.getUserStatistics()
    } catch (error) {
      console.error('获取用户统计数据失败:', error)
      return {
        totalReflections: 0,
        totalExp: 0,
        uniqueStickers: 0,
        mostUsedCategory: '无',
        weeklyReflections: 0
      }
    }
  }
  
  /**
   * 重置用户状态
   */
  const resetUser = () => {
    currentUser.value = null
    userReflections.value = []
    customBubbles.value = []
    isLoading.value = false
  }
  
  return {
    // 状态
    currentUser,
    userReflections,
    customBubbles,
    isLoading,
    
    // 计算属性
    isLoggedIn,
    userLevel,
    nextLevelExp,
    currentLevelProgress,
    uniqueStickers,
    
    // 方法
    initUser,
    addExp,
    addSticker,
    saveReflection,
    fetchReflections,
    createCustomBubble,
    fetchCustomBubbles,
    getUserStatistics,
    resetUser
  }
}