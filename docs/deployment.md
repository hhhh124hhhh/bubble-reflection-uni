# 部署指南

本文档详细说明如何将心迹泡泡应用部署到各个平台。

## 目录

- [环境准备](#环境准备)
- [云开发环境配置](#云开发环境配置)
- [H5 部署](#h5-部署)
- [微信小程序部署](#微信小程序部署)
- [支付宝小程序部署](#支付宝小程序部署)
- [抖音小程序部署](#抖音小程序部署)
- [App 部署](#app-部署)
- [云函数部署](#云函数部署)

## 环境准备

### 必需工具

- **Node.js**: 版本 16.0 或更高
- **Git**: 用于版本控制
- **VS Code**: 推荐的代码编辑器
- **HBuilderX**: 用于 App 开发（可选）

### 腾讯云账号

1. 注册腾讯云账号
2. 开通云开发服务
3. 创建云开发环境

## 云开发环境配置

### 1. 创建环境

1. 登录 [腾讯云开发控制台](https://console.cloud.tencent.com/tcb)
2. 点击「新建环境」
3. 选择环境规格（推荐：按量付费）
4. 填写环境名称（如：bubble-reflection-prod）
5. 环境创建完成后，记录环境 ID

### 2. 开启登录认证

在云开发控制台的「扩展能力」→「身份认证」→「登录方式」中开启：

- ✅ 匿名登录
- ✅ 邮箱密码登录
- ✅ 手机号验证码登录
- ✅ 邮箱验证码登录
- ✅ 微信小程序 openId 登录（如需要）

### 3. 配置安全域名

#### H5 端域名配置

在「环境配置」→「安全来源」→「安全域名」中添加：

- 开发域名：`http://localhost:8888`
- 生产域名：`https://your-domain.com`

#### 微信小程序域名配置

在微信小程序管理后台的「开发」→「开发管理」→「开发设置」→「服务器域名」中配置：

```
request 合法域名:
https://tcb-api.tencentcloudapi.com
https://your-env-id.service.tcloudbase.com

uploadFile 合法域名:
https://cos.ap-shanghai.myqcloud.com

downloadFile 合法域名:
https://your-env-id.tcb.qcloud.la
https://cos.ap-shanghai.myqcloud.com
```

### 4. 配置项目

修改 `src/utils/cloudbase.ts` 中的环境 ID：

```typescript
const ENV_ID: string = 'your-cloudbase-env-id'; // 替换为您的环境ID
```

## H5 部署

### 1. 构建项目

```bash
# 安装依赖
npm install

# 构建 H5 版本
npm run build:h5
```

### 2. 部署到云开发静态托管

#### 方法一：使用 CloudBase CLI

```bash
# 安装 CLI
npm install -g @cloudbase/cli

# 登录
tcb login

# 部署
tcb hosting deploy dist/build/h5
```

#### 方法二：使用控制台

1. 进入云开发控制台
2. 选择「静态网站托管」
3. 点击「上传文件」
4. 上传 `dist/build/h5` 目录中的所有文件
5. 配置域名（可选）

### 3. CDN 配置

部署完成后，等待几分钟 CDN 缓存更新。可以通过以下方式验证部署：

```bash
# 使用随机查询字符串验证
curl "https://your-domain.com/index.html?v=$(date +%s)"
```

## 微信小程序部署

### 1. 构建项目

```bash
# 构建微信小程序版本
npm run build:mp-weixin
```

### 2. 使用微信开发者工具

1. 打开微信开发者工具
2. 点击「导入项目」
3. 选择 `dist/build/mp-weixin` 目录
4. 填写 AppID（如果没有，请先注册小程序）
5. 点击「导入」

### 3. 预览和测试

1. 点击「编译」
2. 点击「预览」扫描二维码在手机上测试
3. 确保所有功能正常工作

### 4. 上传代码

1. 点击「上传」
2. 填写版本号和项目备注
3. 选择体验版或直接上传到正式版

### 5. 提交审核

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 在「开发」→「开发版本」中选择版本
3. 点击「提交审核」
4. 等待审核通过（通常需要 1-7 个工作日）

## 支付宝小程序部署

### 1. 构建项目

```bash
# 构建支付宝小程序版本
npm run build:mp-alipay
```

### 2. 使用支付宝开发者工具

1. 打开支付宝小程序开发者工具
2. 点击「导入项目」
3. 选择 `dist/build/mp-alipay` 目录
4. 填写小程序 ID（如果没有，请先注册）
5. 点击「确认导入」

### 3. 配置域名

在支付宝开发者工具中配置服务器域名：

```
request 域名:
https://tcb-api.tencentcloudapi.com
https://your-env-id.service.tcloudbase.com

uploadFile 域名:
https://cos.ap-shanghai.myqcloud.com

downloadFile 域名:
https://your-env-id.tcb.qcloud.la
https://cos.ap-shanghai.myqcloud.com
```

### 4. 预览和上传

1. 点击「模拟器」测试功能
2. 点击「真机调试」在真机上测试
3. 点击「上传」上传代码
4. 提交审核

## 抖音小程序部署

### 1. 构建项目

```bash
# 构建抖音小程序版本
npm run build:mp-toutiao
```

### 2. 使用抖音开发者工具

1. 打开抖音开发者工具
2. 点击「导入项目」
3. 选择 `dist/build/mp-toutiao` 目录
4. 填写 AppID（如果没有，请先注册）
5. 点击「确认」

### 3. 配置域名

在抖音开发者工具中配置安全域名：

```
开发域名:
tmaservice.developer.toutiao.com
```

### 4. 预览和上传

1. 在开发者工具中测试功能
2. 点击「上传」上传代码
3. 在开发者控制台提交审核

## App 部署

### 1. 使用 HBuilderX

1. 打开 HBuilderX
2. 点击「文件」→「导入」→「从本地目录导入」
3. 选择项目根目录
4. 等待项目加载完成

### 2. 配置应用签名

#### Android 签名

1. 生成签名文件：
   ```bash
   keytool -genkey -alias bubble-key -keyalg RSA -keysize 2048 -validity 3650 -keystore bubble-key.keystore
   ```

2. 在 HBuilderX 中配置：
   - 点击「发行」→「原生App-云打包」
   - 选择 Android 平台
   - 上传签名文件
   - 配置包名、版本等信息

#### iOS 签名

1. 需要 Apple Developer 账号
2. 在 HBuilderX 中配置证书和描述文件
3. 配置 Bundle Identifier

### 3. 云打包

#### Android 云打包

1. 点击「发行」→「原生App-云打包」
2. 选择 Android 平台
3. 配置应用图标、启动页等
4. 点击「打包」
5. 等待打包完成（通常需要几分钟到几小时）

#### iOS 云打包

1. 点击「发行」→「原生App-云打包」
2. 选择 iOS 平台
3. 配置证书、描述文件等
4. 点击「打包」
5. 等待打包完成

### 4. 本地打包

如果需要本地打包，可以使用：

```bash
# 生成 Android 打包配置
npx @dcloudio/uni-cli create --platform android

# 生成 iOS 打包配置
npx @dcloudio/uni-cli create --platform ios
```

## 云函数部署

### 1. 自动部署（推荐）

使用项目中的 CI/CD 流程自动部署：

```bash
# 自动部署会在 CI/CD 流程中触发
# 查看配置：.github/workflows/ci.yml
```

### 2. 手动部署

#### 使用 CloudBase CLI

```bash
# 安装 CLI
npm install -g @cloudbase/cli

# 登录
tcb login

# 部署所有云函数
tcb functions:deploy

# 部署特定函数
tcb functions:deploy hello
```

#### 使用项目脚本

在 `package.json` 中添加部署脚本：

```json
{
  "scripts": {
    "deploy:functions": "tcb functions:deploy"
  }
}
```

然后执行：

```bash
npm run deploy:functions
```

### 3. 验证部署

在云开发控制台中验证：

1. 进入「云函数」页面
2. 检查函数列表
3. 测试函数调用

## 域名配置

### HTTPS 证书

为生产环境配置 HTTPS 证书：

1. 购买或获取免费 SSL 证书
2. 在云开发控制台上传证书
3. 配置自定义域名

### CDN 配置

配置 CDN 加速：

1. 在云开发控制台开启 CDN 加速
2. 配置缓存策略
3. 设置域名解析

## 监控和维护

### 日志监控

1. 在云开发控制台查看日志
2. 配置日志告警
3. 设置错误通知

### 性能监控

1. 监控应用加载速度
2. 监控 API 响应时间
3. 配置性能告警

### 备份策略

1. 定期备份数据库
2. 备份代码仓库
3. 配置自动备份

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本
   - 清除 node_modules 重新安装
   - 检查 TypeScript 配置

2. **部署失败**
   - 检查网络连接
   - 验证云开发配置
   - 查看错误日志

3. **功能异常**
   - 检查云开发域名配置
   - 验证登录认证设置
   - 调试控制台错误

### 获取帮助

- 查看项目文档
- 提交 GitHub Issue
- 联系技术支持

---

🎉 部署完成后，请访问应用并测试所有功能！