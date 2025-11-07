# API 文档

本文档描述心迹泡泡项目的 API 接口和使用方法。

## 云开发 SDK 初始化

```typescript
import { app, ensureLogin } from '@/utils/cloudbase'

// 初始化应用
const app = initializeApp()

// 确保用户已登录
await ensureLogin()
```

## 用户服务 API

### 用户数据接口

```typescript
interface User {
  _openid?: string
  nickname?: string
  avatar?: string
  totalExp: number
  stickers: string[]
  reflectionsCount: number
  createdAt: string
  updatedAt: string
}
```

### 反思记录接口

```typescript
interface Reflection {
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
```

### 自定义泡泡接口

```typescript
interface CustomBubble {
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
```

## 主要 API 方法

### 用户管理

#### 获取或创建用户
```typescript
const user = await userService.getOrCreateUser()
```

#### 添加经验值
```typescript
await userService.addExp(10)
```

#### 添加贴纸
```typescript
await userService.addSticker('🌟')
```

### 反思记录

#### 保存反思记录
```typescript
const reflectionData = {
  bubbleId: 'bubble_1',
  bubbleText: '开心',
  bubbleType: 'normal',
  expGained: 5,
  category: '情绪'
}

const reflectionId = await userService.saveReflection(reflectionData)
```

#### 获取反思记录
```typescript
const reflections = await userService.getReflections(10) // 获取最近10条
```

### 自定义泡泡

#### 创建自定义泡泡
```typescript
const bubbleData = {
  text: '自定义泡泡',
  type: 'emotion',
  category: 'custom',
  bubbleType: 'normal',
  expReward: 3,
  actionDescription: '点击完成',
  icon: '💫',
  isPublic: false
}

const bubbleId = await userService.createCustomBubble(bubbleData)
```

#### 获取自定义泡泡
```typescript
const bubbles = await userService.getCustomBubbles(20)
```

### 统计数据

#### 获取用户统计
```typescript
const stats = await userService.getUserStatistics()
```

#### 获取分类统计
```typescript
const categoryStats = await userService.getCategoryStats()
```

## 云函数调用

### 调用示例云函数
```typescript
try {
  const result = await app.callFunction({
    name: 'hello',
    data: {
      name: 'World',
      timestamp: Date.now()
    }
  })
  
  console.log('云函数调用结果:', result)
} catch (error) {
  console.error('云函数调用失败:', error)
}
```

## 数据库操作

### 基础数据库操作
```typescript
const db = app.database()

// 查询数据
const result = await db.collection('users').get()

// 添加数据
const addResult = await db.collection('reflections').add({
  data: {
    bubbleId: 'bubble_1',
    completedAt: new Date().toISOString()
  }
})

// 更新数据
await db.collection('users').where({
  _openid: db.command.eq(openid)
}).update({
  data: {
    totalExp: db.command.inc(5)
  }
})

// 删除数据
await db.collection('reflections').doc('reflection_id').remove()
```

## 文件存储

### 上传文件
```typescript
const uploadResult = await app.uploadFile({
  cloudPath: 'user-avatar.jpg',
  filePath: localFilePath
})
```

### 下载文件
```typescript
app.downloadFile({
  fileID: "cloud://env-id.avatar/user-avatar.jpg"
}).then((res) => {
  console.log('下载结果:', res)
})
```

## 错误处理

### 统一错误处理
```typescript
try {
  const result = await userService.getReflections()
  // 处理成功结果
} catch (error) {
  if (error.statusCode === 403) {
    // 处理权限错误
    console.error('权限不足')
  } else {
    // 处理其他错误
    console.error('操作失败:', error)
  }
}
```

## 类型定义

### 泡泡类型
```typescript
type BubbleType = 'normal' | 'write' | 'action' | 'golden'
```

### 用户等级
```typescript
type UserLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
```

### 分类标签
```typescript
type Category = 
  | 'peaceful'    // 平静
  | 'happy'       // 开心
  | 'health'      // 健康
  | 'change'      // 改变
  | 'work'        // 工作
  | 'growth'      // 成长
  | 'life'        // 生活
  | 'custom'      // 自定义
```

## 最佳实践

1. **错误处理**: 始终使用 try-catch 包装异步操作
2. **类型安全**: 充分利用 TypeScript 类型检查
3. **数据验证**: 在发送数据前进行验证
4. **性能优化**: 合理使用缓存和批量操作
5. **安全性**: 不要在前端暴露敏感信息

更多详细信息请参考 [腾讯云开发文档](https://docs.cloudbase.net/)。