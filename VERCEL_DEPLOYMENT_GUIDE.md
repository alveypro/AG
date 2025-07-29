# 🚀 Vercel部署指南 - 解决maopi.me问题

## 🎯 为什么选择Vercel？

**优势：**
- ✅ 免费额度大（100GB带宽/月）
- ✅ 自动HTTPS
- ✅ 自定义域名支持
- ✅ 部署速度快
- ✅ 全球CDN
- ✅ 无GitHub限制

## 📋 部署步骤

### 步骤1：安装Vercel CLI

```bash
# 安装Vercel CLI
npm install -g vercel

# 或使用yarn
yarn global add vercel
```

### 步骤2：登录Vercel

```bash
# 登录Vercel账户
vercel login
```

### 步骤3：部署项目

```bash
# 在项目目录中运行
vercel --prod
```

### 步骤4：配置自定义域名

1. **登录Vercel控制台**
2. **选择项目**
3. **进入Settings → Domains**
4. **添加自定义域名：maopi.me**

## 🔧 自动部署配置

### 创建vercel.json配置文件：

```json
{
  "version": 2,
  "name": "mao-game",
  "builds": [
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/index.html"
    },
    {
      "src": "/game",
      "dest": "/game-production.html"
    }
  ]
}
```

## 🌐 域名配置

### DNS设置：

在域名提供商处添加以下记录：

```
类型: CNAME
名称: @
值: cname.vercel-dns.com
```

### 验证域名：

```bash
# 检查DNS传播
nslookup maopi.me

# 测试访问
curl -I https://maopi.me
```

## 📱 部署后的访问地址

### 默认Vercel地址：
```
https://mao-game-xxx.vercel.app
```

### 自定义域名：
```
https://maopi.me
```

### 游戏入口：
- 主游戏：https://maopi.me/game
- 测试游戏：https://maopi.me/test
- 验证测试：https://maopi.me/verify

## 🔄 自动部署

### 连接GitHub仓库：

1. **在Vercel控制台中**
2. **选择"Import Project"**
3. **选择GitHub仓库：maowillpi/maopigame**
4. **配置部署设置**

### 自动触发：

- 每次推送到`game-main`分支
- 自动部署到Vercel
- 自动更新maopi.me

## 💰 费用说明

**Vercel免费计划：**
- 100GB带宽/月
- 无限部署
- 自定义域名支持
- 自动HTTPS
- 全球CDN

**对于MAO游戏完全够用！**

## 🎯 优势对比

| 功能 | GitHub Pages | Vercel |
|------|-------------|--------|
| 自定义域名 | ❌ 当前受限 | ✅ 完全支持 |
| 部署速度 | 慢 | 快 |
| 免费额度 | 有限 | 大 |
| 全球CDN | 基础 | 高级 |
| 自动HTTPS | ✅ | ✅ |

## 🚀 立即行动

### 选择1：使用Vercel（推荐）

```bash
# 快速部署
npm install -g vercel
vercel login
vercel --prod
```

### 选择2：继续使用GitHub Pages

```
临时地址：https://maowillpi.github.io/maopigame/
```

### 选择3：联系GitHub支持

等待GitHub解决自定义域名问题

---

**建议：** 使用Vercel部署，可以立即解决maopi.me问题，用户体验更好！ 