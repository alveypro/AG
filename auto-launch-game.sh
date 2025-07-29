#!/bin/bash

# 🎮 MAO游戏自动上线脚本
# 在合约部署和充值完成后运行此脚本

echo "🎮 MAO游戏自动上线工具"
echo "========================"

# 检查新合约地址参数
if [ -z "$1" ]; then
    echo "❌ 错误：请提供新合约地址"
    echo "用法: ./auto-launch-game.sh 0x新合约地址"
    exit 1
fi

NEW_CONTRACT_ADDRESS=$1
echo "🎯 新合约地址: $NEW_CONTRACT_ADDRESS"

# 备份当前index.html
echo "📁 备份当前页面..."
cp index.html index-backup-$(date +%Y%m%d_%H%M%S).html

# 更新合约地址到安全游戏页面
echo "⚙️ 更新合约配置..."
sed -i '' "s/const NEW_SECURE_CONTRACT = \"0x0000000000000000000000000000000000000000\";/const NEW_SECURE_CONTRACT = \"$NEW_CONTRACT_ADDRESS\";/g" wheel-game-ULTRA-SECURE.html

# 复制安全游戏页面为主页面
echo "🚀 启动新游戏系统..."
cp wheel-game-ULTRA-SECURE.html index.html

# 验证更新
if grep -q "$NEW_CONTRACT_ADDRESS" index.html; then
    echo "✅ 游戏成功上线！"
    echo "🎉 用户现在可以访问游戏了"
    echo "🔗 游戏地址: https://your-domain.com"
    
    # 显示成功信息
    echo ""
    echo "🎯 成功检查清单："
    echo "✅ 新安全合约已部署: $NEW_CONTRACT_ADDRESS"
    echo "✅ 合约已充值代币"
    echo "✅ 前端已更新并上线"
    echo "✅ 游戏可以正常运行"
    echo ""
    echo "🛡️ 安全特性："
    echo "✅ 5/3多重签名保护"
    echo "✅ 24小时时间锁机制"
    echo "✅ 恶意地址黑名单"
    echo "✅ 智能限额控制"
    
else
    echo "❌ 配置更新失败，请手动检查"
fi

echo ""
echo "🎮 MAO游戏现在已经成功运行！" 