# 🫧 心迹泡泡

<div align="center">

![心迹泡泡](https://img.shields.io/badge/心迹泡泡-反思应用-blue)
![UniApp](https://img.shields.io/badge/UniApp-跨平台-green)
![Vue3](https://img.shields.io/badge/Vue3-Composition%20API-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-严格模式-blue)
![CloudBase](https://img.shields.io/badge/CloudBase-腾讯云-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

## 📖 项目介绍

**心迹泡泡**是一个基于 UniApp 和腾讯云开发的跨平台反思应用，通过游戏化的戳泡泡方式帮助用户进行日常反思和自我成长。用户可以通过戳破不同类型的泡泡来记录心情、书写感悟、完成行动任务，并通过等级系统和贴纸收集获得成就感。

[![Powered by CloudBase](https://7463-tcb-advanced-a656fc-1257967285.tcb.qcloud.la/mcp/powered-by-cloudbase-badge.svg)](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit)

> 本项目基于 [**CloudBase AI ToolKit**](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit) 开发，通过AI提示词和 MCP 协议+云开发，让开发更智能、更高效。

## ✨ 项目特色

- 🎮 **游戏化体验**: 通过戳泡泡的方式让反思变得有趣
- 🌈 **多种泡泡类型**: 普通泡泡、写一局、行动任务、金色奖励泡泡
- 📈 **等级成长系统**: 基于经验值的等级解锁机制
- 🏆 **贴纸收集**: 完成任务收集精美贴纸
- ⏱️ **倒计时任务**: 支持冥想、深呼吸、运动等倒计时功能
- 🎨 **现代UI设计**: 玻璃态设计风格，流畅动画效果
- 📱 **跨平台支持**: H5、微信小程序、支付宝小程序、抖音小程序、App

## 🚀 快速开始

### 环境要求

- Node.js 16.0+
- HBuilderX（用于 App 开发）
- 腾讯云开发账号

### 安装依赖

```bash
npm install
```

### 配置云开发

1. 创建腾讯云开发环境
2. 修改 `src/utils/cloudbase.ts` 中的环境 ID：

```typescript
const ENV_ID: string = 'your-cloudbase-env-id';
```

3. 开启登录认证方式（匿名登录、密码登录等）

### 本地开发

```bash
# H5 端开发（端口 8888）
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# 抖音小程序开发
npm run dev:mp-toutiao

# 支付宝小程序开发
npm run dev:mp-alipay

# TypeScript 类型检查
npm run type-check
```

## 📱 平台适配

| 平台 | 状态 | 功能完整度 |
|------|------|------------|
| H5 | ✅ 完全支持 | 100% |
| 微信小程序 | ✅ 完全支持 | 100% |
| 支付宝小程序 | ✅ 完全支持 | 100% |
| 抖音小程序 | ✅ 完全支持 | 100% |
| App (iOS/Android) | ✅ 完全支持 | 100% |

## 🏗️ 项目架构

### 技术栈

- **前端框架**: UniApp (Vue 3 Composition API)
- **构建工具**: Vite
- **状态管理**: Vue 3 Reactivity API + Composables
- **类型支持**: TypeScript (严格模式)
- **UI 组件**: @dcloudio/uni-ui + 自定义组件
- **云服务**: 腾讯云 CloudBase

### 核心功能

#### 🫧 泡泡系统
- **普通泡泡**: 点击即完成，获得基础经验值
- **写一局泡泡**: 需要用户输入文字反思
- **行动泡泡**: 包含倒计时任务（深呼吸、冥想、运动等）
- **金色泡泡**: 稀有泡泡，奖励特殊贴纸

#### 👤 用户系统
- **等级系统**: 基于经验值的等级成长
- **贴纸收集**: 完成任务收集精美贴纸
- **统计追踪**: 反思记录、分类统计
- **降级处理**: 云开发不可用时的本地模式

#### ⏱️ 倒计时系统
- 支持多种类型：深呼吸、休息、运动、工作、冥想
- 实时进度环显示
- 暂停/继续功能
- 震动反馈（App端）

### 数据库设计

```
users 集合
├── _openid: 用户标识
├── totalExp: 总经验值
├── stickers: 收集的贴纸数组
└── reflectionsCount: 反思记录数量

reflections 集合
├── bubbleId: 泡泡ID
├── bubbleText: 泡泡文本
├── bubbleType: 泡泡类型
├── userInput: 用户输入（写一局）
└── expGained: 获得经验值

custom_bubbles 集合
├── text: 泡泡文本
├── type: 泡泡类型
├── category: 分类
└── usageCount: 使用次数
```

## 📁 项目结构

```
src/
├── components/           # 组件目录
│   ├── Bubble/          # 泡泡组件
│   ├── Modal/           # 模态框组件
│   └── show-captcha.vue # 验证码组件
├── composables/         # 组合式函数
│   └── useUser.ts       # 用户状态管理
├── pages/               # 页面文件
│   ├── index/           # 首页（泡泡戳戳乐）
│   ├── bubble/          # 泡泡相关页面
│   ├── login/           # 登录页面
│   ├── demo/            # 云开发演示
│   └── profile/         # 用户信息
├── utils/               # 工具函数
│   ├── cloudbase.ts     # 云开发配置
│   ├── userService.ts   # 用户数据服务
│   └── index.ts         # 通用工具
├── static/              # 静态资源
├── App.vue              # 应用入口
├── main.ts              # 应用初始化
├── pages.json           # 页面配置
└── manifest.json        # 应用配置

cloudfunctions/          # 云函数目录
└── hello/               # 示例云函数

docs/                    # 项目文档
├── api.md               # API 文档
├── deployment.md        # 部署指南
└── design.md            # 设计文档
```

## 🎮 功能演示

### 泡泡戳戳乐
- 点击泡泡获得经验值
- 不同类型泡泡有不同交互方式
- 智能泡泡补充机制
- 等级解锁新泡泡

### 倒计时任务
- 深呼吸练习（30秒）
- 冥想放松（5分钟）
- 运动提醒（自定义）
- 工作专注（番茄钟）

### 成长系统
- 经验值积累升级
- 贴纸收集展示
- 统计数据追踪
- 每日挑战任务

## 🔧 开发指南

### 配置云开发域名

#### H5 端
- 开发域名：`http://localhost:8888`
- 生产域名：您的实际域名

#### 微信小程序
```
request合法域名:
https://tcb-api.tencentcloudapi.com
https://your-env-id.service.tcloudbase.com

uploadFile合法域名:
https://cos.ap-shanghai.myqcloud.com

downloadFile合法域名:
https://your-env-id.tcb.qcloud.la
https://cos.ap-shanghai.myqcloud.com
```

#### 其他小程序
- 支付宝：`devappid.hybrid.alipay-eco.com`
- 抖音：`tmaservice.developer.toutiao.com`

### 构建部署

```bash
# 构建 H5 版本
npm run build:h5

# 构建微信小程序
npm run build:mp-weixin

# 构建抖音小程序
npm run build:mp-toutiao

# 构建支付宝小程序
npm run build:mp-alipay
```

### 云函数部署

```bash
# 使用 CloudBase CLI
npm install -g @cloudbase/cli
tcb login
tcb functions:deploy

# 或使用 MCP 工具（推荐）
# 自动部署 cloudfunctions/ 目录
```

## 🎨 设计特色

- **现代玻璃态设计**: 使用毛玻璃效果和渐变色彩
- **流畅动画**: 丰富的过渡动画和微交互
- **响应式布局**: 适配不同屏幕尺寸
- **无障碍设计**: 考虑用户体验和可访问性

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

## 🔗 相关链接

- [UniApp 官方文档](https://uniapp.dcloud.io/)
- [腾讯云开发文档](https://cloud.tencent.com/document/product/876)
- [CloudBase AI ToolKit](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit)
- [项目文档](./docs/)

## ⭐ 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

<div align="center">

**让每一次反思都成为成长的契机** 🫧✨

</div>