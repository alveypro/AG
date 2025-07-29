# 🔧 修复maopi.me自定义域名配置

## 🚨 问题诊断

从GitHub Pages设置页面可以看出：
- ✅ 网站已部署：https://maowillpi.github.io/maopigame/
- ❌ **Custom domain字段为空** - 这就是maopi.me无法访问的原因

## 🔧 修复步骤

### 步骤1：在GitHub Pages设置中添加自定义域名

1. **登录GitHub**
2. **进入仓库设置：**
   - 访问：https://github.com/maowillpi/maopigame/settings/pages
3. **找到Custom domain部分**
4. **在文本框中输入：** `maopi.me`
5. **点击"Save"按钮**

### 步骤2：验证CNAME文件

确保CNAME文件内容正确：
```bash
maopi.me
```

### 步骤3：等待DNS传播

- DNS更改可能需要几分钟到几小时
- 通常5-10分钟内生效

## 📋 详细操作指南

### 在GitHub网页界面操作：

1. **打开GitHub仓库：**
   - 访问：https://github.com/maowillpi/maopigame

2. **进入Settings：**
   - 点击仓库页面顶部的"Settings"标签

3. **找到Pages设置：**
   - 在左侧菜单中点击"Pages"

4. **配置Custom domain：**
   - 在"Custom domain"部分
   - 在文本框中输入：`maopi.me`
   - 点击"Save"按钮

5. **等待配置生效：**
   - GitHub会自动创建/更新CNAME文件
   - 等待几分钟让配置生效

## 🔍 验证步骤

配置完成后，可以通过以下方式验证：

```bash
# 检查maopi.me是否可访问
curl -I https://maopi.me

# 检查DNS解析
nslookup maopi.me

# 检查GitHub Pages默认地址
curl -I https://maowillpi.github.io/maopigame/
```

## ⚠️ 注意事项

1. **确保仓库是公开的** - 私有仓库无法使用自定义域名
2. **等待时间** - DNS传播需要时间，请耐心等待
3. **HTTPS强制** - GitHub会自动为自定义域名启用HTTPS

## 🎯 预期结果

配置完成后：
- ✅ maopi.me 应该可以正常访问
- ✅ 自动重定向到HTTPS
- ✅ 显示最新的游戏内容

---

**重要提醒：** 这个配置必须在GitHub网页界面手动完成，无法通过代码推送自动设置。 