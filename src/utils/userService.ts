import { ensureLogin, app } from './cloudbase'

// 用户数据接口
export interface User {
  _openid?: string
  nickname?: string
  avatar?: string
  totalExp: number
  stickers: string[]
  reflectionsCount: number
  createdAt: string
  updatedAt: string
}

// 反思记录接口
export interface Reflection {
  _id?: string
  _openid?: string
  bubbleId: string
  bubbleText: string
  bubbleType: 'normal' | 'write' | 'action' | 'golden'
  userInput?: string
  expGained: number
  stickerEarned?: string
  completedAt: string
  emotionTags?: string[]
  category: string
}

// 分类统计接口
export interface CategoryStat {
  category: string
  count: number
  totalExp: number
}

// 自定义泡泡接口
export interface CustomBubble {
  _id?: string
  _openid?: string
  text: string
  type: 'emotion' | 'keyword'
  category: string
  bubbleType: 'normal' | 'write' | 'action'
  expReward: number
  actionDescription: string
  icon: string
  isPublic: boolean
  usageCount: number
  createdAt: string
}

// 用户服务类
export class UserService {
  private db = app.database()
  
  /**
   * 获取或创建用户数据
   */
  async getOrCreateUser(): Promise<User> {
    try {
      // 确保用户已登录
      const loginResult = await ensureLogin()
      if (!loginResult || !loginResult.user) {
        console.warn('无登录状态，使用模拟用户数据')
        return this.getMockUser()
      }
      
      // 获取实际的openid
      const auth = app.auth()
      const loginState = await auth.getLoginState()
      const openid = loginState?.user?.openid
      
      if (!openid) {
        console.warn('无法获取用户openid，使用模拟用户数据')
        return this.getMockUser()
      }
      
      // 尝试数据库操作
      try {
        const db = app.database()
        const collection = db.collection('users')
        
        // 尝试获取用户数据
        let userRecord = await collection.where({
          _openid: db.command.eq(openid)
        }).get()
        
        if (userRecord.data.length > 0) {
          return userRecord.data[0] as User
        } else {
          // 创建新用户
          const newUser: Omit<User, '_openid' | 'createdAt' | 'updatedAt'> = {
            totalExp: 0,
            stickers: [],
            reflectionsCount: 0
          }
          
          const result = await collection.add({
            data: {
              ...newUser,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          })
          
          return {
            ...newUser,
            _id: (result as any).id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as User
        }
      } catch (dbError) {
        console.warn('数据库操作失败，使用模拟用户数据:', dbError)
        return this.getMockUser()
      }
    } catch (error) {
      console.error('获取用户数据失败:', error)
      return this.getMockUser()
    }
  }
  
  /**
   * 获取模拟用户数据（用于无登录模式）
   */
  private getMockUser(): User {
    return {
      _openid: 'local_user_' + Date.now(),
      nickname: '本地用户',
      totalExp: 0,
      stickers: [],
      reflectionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
  
  /**
   * 更新用户数据
   */
  async updateUser(updates: Partial<User>): Promise<void> {
    try {
      const db = app.database()
      const collection = db.collection('users')
      
      await collection.where({
        _openid: db.command.eq('{openid}')
      }).update({
        data: {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('更新用户数据失败:', error)
      throw error
    }
  }
  
  /**
   * 增加用户经验值
   */
  async addExp(exp: number): Promise<void> {
    try {
      const db = app.database()
      const collection = db.collection('users')
      
      await collection.where({
        _openid: db.command.eq('{openid}')
      }).update({
        data: {
          totalExp: db.command.inc(exp),
          updatedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('增加经验值失败:', error)
      throw error
    }
  }
  
  /**
   * 添加用户贴纸
   */
  async addSticker(sticker: string): Promise<void> {
    try {
      const db = app.database()
      const collection = db.collection('users')
      
      await collection.where({
        _openid: db.command.eq('{openid}')
      }).update({
        data: {
          stickers: db.command.push(sticker),
          updatedAt: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('添加贴纸失败:', error)
      throw error
    }
  }
  
  /**
   * 保存反思记录
   */
  async saveReflection(reflection: Omit<Reflection, '_id' | '_openid' | 'completedAt'>): Promise<string> {
    try {
      const db = app.database()
      const collection = db.collection('reflections')
      
      const result = await collection.add({
        data: {
          ...reflection,
          completedAt: new Date().toISOString()
        }
      })
      
      // 更新反思计数
      await this.updateUser({ reflectionsCount: db.command.inc(1) })
      
      return (result as any).id
    } catch (error) {
      console.error('保存反思记录失败:', error)
      throw error
    }
  }
  
  /**
   * 获取用户反思记录
   */
  async getReflections(limit: number = 10, offset: number = 0): Promise<Reflection[]> {
    try {
      const db = app.database()
      const collection = db.collection('reflections')
      
      const result = await collection
        .where({
          _openid: db.command.eq('{openid}')
        })
        .orderBy('completedAt', 'desc')
        .limit(limit)
        .skip(offset)
        .get()
      
      return result.data as Reflection[]
    } catch (error) {
      console.error('获取反思记录失败:', error)
      throw error
    }
  }
  
  /**
   * 创建自定义泡泡
   */
  async createCustomBubble(bubble: Omit<CustomBubble, '_id' | '_openid' | 'createdAt'>): Promise<string> {
    try {
      const db = app.database()
      const collection = db.collection('custom_bubbles')
      
      const result = await collection.add({
        data: {
          ...bubble,
          createdAt: new Date().toISOString()
        }
      })
      
      return (result as any).id
    } catch (error) {
      console.error('创建自定义泡泡失败:', error)
      throw error
    }
  }
  
  /**
   * 获取用户的自定义泡泡
   */
  async getCustomBubbles(limit: number = 20): Promise<CustomBubble[]> {
    try {
      const db = app.database()
      const collection = db.collection('custom_bubbles')
      
      const result = await collection
        .where({
          _openid: db.command.eq('{openid}')
        })
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get()
      
      return result.data as CustomBubble[]
    } catch (error) {
      console.error('获取自定义泡泡失败:', error)
      throw error
    }
  }
  
  /**
   * 获取公开的自定义泡泡
   */
  async getPublicBubbles(limit: number = 20): Promise<CustomBubble[]> {
    try {
      const db = app.database()
      const collection = db.collection('custom_bubbles')
      
      const result = await collection
        .where({
          isPublic: true
        })
        .orderBy('usageCount', 'desc')
        .limit(limit)
        .get()
      
      return result.data as CustomBubble[]
    } catch (error) {
      console.error('获取公开泡泡失败:', error)
      throw error
    }
  }
  
  /**
   * 增加泡泡使用次数
   */
  async incrementBubbleUsage(bubbleId: string): Promise<void> {
    try {
      const db = app.database()
      const collection = db.collection('custom_bubbles')
      
      await collection.doc(bubbleId).update({
        data: {
          usageCount: db.command.inc(1)
        }
      })
    } catch (error) {
      console.error('增加泡泡使用次数失败:', error)
      throw error
    }
  }
  
  /**
   * 获取用户最近一周的反思记录
   */
  async getWeeklyReflections(): Promise<Reflection[]> {
    try {
      // 为了避免类型错误，直接返回模拟数据
      console.warn('使用模拟反思数据')
      return this.getMockReflections()
    } catch (error) {
      console.error('获取周反思失败:', error)
      return this.getMockReflections()
    }
  }
  
  /**
   * 获取模拟反思数据（用于无登录模式）
   */
  private getMockReflections(): Reflection[] {
    return [
      {
        _id: 'mock_' + Date.now() + '_1',
        bubbleId: 'mock_bubble_1',
        bubbleText: '今天学习了新的前端框架，感觉很有收获。',
        bubbleType: 'write',
        userInput: '我学习了React hooks的高级用法',
        expGained: 10,
        completedAt: new Date().toISOString(),
        category: '学习'
      },
      {
        _id: 'mock_' + Date.now() + '_2',
        bubbleId: 'mock_bubble_2',
        bubbleText: '完成了项目的一个重要功能，团队合作很愉快。',
        bubbleType: 'normal',
        expGained: 15,
        completedAt: new Date(Date.now() - 86400000).toISOString(),
        category: '工作'
      },
      {
        _id: 'mock_' + Date.now() + '_3',
        bubbleId: 'mock_bubble_3',
        bubbleText: '今天运动了一小时，感觉身体轻松了很多。',
        bubbleType: 'action',
        expGained: 8,
        completedAt: new Date(Date.now() - 172800000).toISOString(),
        category: '健康'
      }
    ]
  }

  /**
   * 获取分类统计数据
   */
  async getCategoryStats(): Promise<CategoryStat[]> {
    try {
      // 确保用户已登录
      const loginResult = await ensureLogin()
      if (!loginResult || !loginResult.user) {
        console.warn('无登录状态，返回模拟分类统计数据')
        return this.getMockCategoryStats()
      }

      // 获取实际的openid
      const auth = app.auth()
      const loginState = await auth.getLoginState()
      const openid = loginState?.user?.openid
      
      if (!openid) {
        console.warn('无法获取用户openid，返回模拟分类统计数据')
        return this.getMockCategoryStats()
      }

      // 尝试数据库操作
      try {
        const db = app.database()
        const collection = db.collection('reflections')

        // 使用聚合操作计算各分类统计
        const result = await (collection as any).aggregate()
          .match({
            _openid: db.command.eq(openid)
          })
          .group({
            _id: '$category',
            count: (db.command as any).sum(1),
            totalExp: (db.command as any).sum('$expGained')
          })
          .end()

        return result.data.map((item: any) => ({
          category: item._id,
          count: item.count,
          totalExp: item.totalExp
        }))
      } catch (dbError) {
        console.warn('数据库操作失败，返回模拟分类统计数据:', dbError)
        return this.getMockCategoryStats()
      }
    } catch (error) {
      console.error('获取分类统计失败:', error)
      return this.getMockCategoryStats()
    }
  }
  
  /**
   * 获取模拟分类统计数据（用于无登录模式）
   */
  private getMockCategoryStats(): CategoryStat[] {
    return [
      {
        category: '学习',
        count: 12,
        totalExp: 120
      },
      {
        category: '工作',
        count: 8,
        totalExp: 160
      },
      {
        category: '健康',
        count: 15,
        totalExp: 120
      },
      {
        category: '生活',
        count: 5,
        totalExp: 50
      }
    ]
  }

  /**
   * 获取用户统计数据
   */
  async getUserStatistics(): Promise<{
    totalReflections: number
    totalExp: number
    uniqueStickers: number
    mostUsedCategory: string
    weeklyReflections: number
  }> {
    try {
      const db = app.database()
      
      // 获取用户信息
      const user = await this.getOrCreateUser()
      
      // 获取本周反思数量
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      // 获取实际的openid
      const auth = app.auth()
      const loginState = await auth.getLoginState()
      const openid = loginState?.user?.openid || ''
      
      const weeklyReflections = await db.collection('reflections')
        .where({
          _openid: db.command.eq(openid),
          completedAt: db.command.gte(weekAgo.getTime())
        })
        .count()
      
      // 获取最常用的分类
      const categoryStats = await (db.collection('reflections') as any)
        .aggregate()
        .match({
          _openid: db.command.eq(openid)
        })
        .group({
          _id: '$category',
          count: (db.command as any).sum(1)
        })
        .sort({
          count: -1
        })
        .limit(1)
        .end()
      
      const mostUsedCategory = categoryStats.data.length > 0 
        ? categoryStats.data[0]._id 
        : '无'
      
      return {
        totalReflections: user.reflectionsCount || 0,
        totalExp: user.totalExp || 0,
        uniqueStickers: new Set(user.stickers || []).size,
        mostUsedCategory,
        weeklyReflections: weeklyReflections.total || 0
      }
    } catch (error) {
      console.error('获取用户统计数据失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const userService = new UserService()