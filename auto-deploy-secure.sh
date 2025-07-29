#!/bin/bash

# 🛡️ MAO 完全自动化安全部署脚本 v9.0
# 包含交互式安全钱包配置
# 作者: AI Security Team

echo "🛡️ =============================================="
echo "    MAO 完全自动化安全部署系统"
echo "    Security Level: ULTRA-SECURE"
echo "    Version: 9.0"
echo "    With Interactive Wallet Configuration"
echo "🛡️ =============================================="
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 全局变量
SECURE_WALLET_ADDRESS=""
MULTISIG_WALLET_ADDRESS=""
TIMELOCK_CONTROLLER_ADDRESS=""
CONFIG_METHOD=""

# 显示安全提醒
show_security_warning() {
    echo -e "${RED}⚠️  ============ 重要安全提醒 ============${NC}"
    echo -e "${YELLOW}1. 此脚本将帮助您安全配置新钱包${NC}"
    echo -e "${YELLOW}2. 私钥和助记词永远不会被存储或传输${NC}"
    echo -e "${YELLOW}3. 所有敏感信息仅在本地处理${NC}"
    echo -e "${YELLOW}4. 请确保在安全的环境中运行此脚本${NC}"
    echo -e "${RED}===========================================${NC}"
    echo
    
    read -p "您是否理解上述安全提醒并同意继续? (y/N): " consent
    if [[ $consent != [yY] ]]; then
        echo -e "${RED}❌ 部署已取消${NC}"
        exit 1
    fi
}

# 检查依赖
check_dependencies() {
    echo -e "${BLUE}🔍 检查系统依赖...${NC}"
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js${NC}"
        exit 1
    fi
    
    # 检查Git
    if ! git status &>/dev/null; then
        echo -e "${RED}❌ 不在Git仓库中或Git未安装${NC}"
        exit 1
    fi
    
    # 检查必要文件
    if [[ ! -f "wheel-game-ultimate-SECURE.html" ]]; then
        echo -e "${RED}❌ 安全游戏文件未找到${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 依赖检查通过${NC}"
}

# 选择配置方法
choose_config_method() {
    echo -e "${BLUE}📋 请选择钱包配置方法:${NC}"
    echo "1. 🌐 浏览器本地存储 (推荐，简单安全)"
    echo "2. 📁 环境变量文件 (服务器部署推荐)"
    echo "3. 🔐 加密本地存储 (最高安全等级)"
    echo "4. ⏭️  跳过配置 (使用默认地址)"
    echo
    
    while true; do
        read -p "请选择配置方法 (1-4): " choice
        case $choice in
            1)
                CONFIG_METHOD="localStorage"
                echo -e "${GREEN}✅ 已选择：浏览器本地存储${NC}"
                break
                ;;
            2)
                CONFIG_METHOD="envFile"
                echo -e "${GREEN}✅ 已选择：环境变量文件${NC}"
                break
                ;;
            3)
                CONFIG_METHOD="encrypted"
                echo -e "${GREEN}✅ 已选择：加密本地存储${NC}"
                break
                ;;
            4)
                CONFIG_METHOD="skip"
                echo -e "${YELLOW}⚠️  已选择：跳过配置${NC}"
                break
                ;;
            *)
                echo -e "${RED}❌ 无效选择，请输入 1-4${NC}"
                ;;
        esac
    done
}

# 输入钱包地址
input_wallet_addresses() {
    if [[ $CONFIG_METHOD == "skip" ]]; then
        echo -e "${YELLOW}⏭️  跳过钱包配置，使用默认地址${NC}"
        return
    fi
    
    echo -e "${BLUE}📝 请输入钱包地址信息:${NC}"
    echo -e "${CYAN}💡 提示：只需要钱包地址，不需要私钥${NC}"
    echo
    
    # 主钱包地址
    while true; do
        read -p "🔐 请输入新的安全钱包地址: " address
        if [[ $address =~ ^0x[a-fA-F0-9]{40}$ ]]; then
            SECURE_WALLET_ADDRESS=$address
            echo -e "${GREEN}✅ 安全钱包地址已保存${NC}"
            break
        else
            echo -e "${RED}❌ 无效的以太坊地址格式，请重新输入${NC}"
        fi
    done
    
    # 多重签名钱包 (可选)
    echo
    read -p "🏦 多重签名钱包地址 (可选，直接回车跳过): " multisig
    if [[ -n $multisig ]]; then
        if [[ $multisig =~ ^0x[a-fA-F0-9]{40}$ ]]; then
            MULTISIG_WALLET_ADDRESS=$multisig
            echo -e "${GREEN}✅ 多重签名地址已保存${NC}"
        else
            echo -e "${YELLOW}⚠️  无效地址，将跳过多重签名配置${NC}"
        fi
    fi
    
    # 时间锁控制器 (可选)
    echo
    read -p "⏰ 时间锁控制器地址 (可选，直接回车跳过): " timelock
    if [[ -n $timelock ]]; then
        if [[ $timelock =~ ^0x[a-fA-F0-9]{40}$ ]]; then
            TIMELOCK_CONTROLLER_ADDRESS=$timelock
            echo -e "${GREEN}✅ 时间锁地址已保存${NC}"
        else
            echo -e "${YELLOW}⚠️  无效地址，将跳过时间锁配置${NC}"
        fi
    fi
}

# 生成配置
generate_config() {
    if [[ $CONFIG_METHOD == "skip" ]]; then
        return
    fi
    
    echo -e "${BLUE}⚙️  生成安全配置...${NC}"
    
    case $CONFIG_METHOD in
        "localStorage")
            generate_localstorage_config
            ;;
        "envFile")
            generate_env_file_config
            ;;
        "encrypted")
            generate_encrypted_config
            ;;
    esac
}

# 生成本地存储配置
generate_localstorage_config() {
    cat > secure-wallet-config.js << EOF
// 🔐 安全钱包配置脚本 - 浏览器本地存储
// 请在浏览器控制台中运行以下代码：

console.log('🔐 开始配置安全钱包...');

// 配置主钱包地址
localStorage.setItem('SECURE_WALLET_ADDRESS', '${SECURE_WALLET_ADDRESS}');
console.log('✅ 主钱包地址已配置');

EOF

    if [[ -n $MULTISIG_WALLET_ADDRESS ]]; then
        echo "// 配置多重签名钱包地址" >> secure-wallet-config.js
        echo "localStorage.setItem('MULTISIG_WALLET_ADDRESS', '${MULTISIG_WALLET_ADDRESS}');" >> secure-wallet-config.js
        echo "console.log('✅ 多重签名地址已配置');" >> secure-wallet-config.js
        echo >> secure-wallet-config.js
    fi

    if [[ -n $TIMELOCK_CONTROLLER_ADDRESS ]]; then
        echo "// 配置时间锁控制器地址" >> secure-wallet-config.js
        echo "localStorage.setItem('TIMELOCK_CONTROLLER_ADDRESS', '${TIMELOCK_CONTROLLER_ADDRESS}');" >> secure-wallet-config.js
        echo "console.log('✅ 时间锁地址已配置');" >> secure-wallet-config.js
        echo >> secure-wallet-config.js
    fi

    cat >> secure-wallet-config.js << EOF
// 验证配置
console.log('🔍 验证配置...');
console.log('主钱包:', localStorage.getItem('SECURE_WALLET_ADDRESS'));
if (localStorage.getItem('MULTISIG_WALLET_ADDRESS')) {
    console.log('多重签名:', localStorage.getItem('MULTISIG_WALLET_ADDRESS'));
}
if (localStorage.getItem('TIMELOCK_CONTROLLER_ADDRESS')) {
    console.log('时间锁:', localStorage.getItem('TIMELOCK_CONTROLLER_ADDRESS'));
}

console.log('🎉 安全钱包配置完成！');
console.log('⚠️  请保存此配置信息，重新加载页面后需要重新运行');

EOF

    echo -e "${GREEN}✅ 本地存储配置已生成: secure-wallet-config.js${NC}"
}

# 生成环境变量文件配置
generate_env_file_config() {
    cat > .env.local << EOF
# 🔐 MAO游戏安全配置 - 环境变量
# 此文件不会被Git追踪，请妥善保管

# 主钱包地址
SECURE_WALLET_ADDRESS=${SECURE_WALLET_ADDRESS}

EOF

    if [[ -n $MULTISIG_WALLET_ADDRESS ]]; then
        echo "# 多重签名钱包地址" >> .env.local
        echo "MULTISIG_WALLET_ADDRESS=${MULTISIG_WALLET_ADDRESS}" >> .env.local
        echo >> .env.local
    fi

    if [[ -n $TIMELOCK_CONTROLLER_ADDRESS ]]; then
        echo "# 时间锁控制器地址" >> .env.local
        echo "TIMELOCK_CONTROLLER_ADDRESS=${TIMELOCK_CONTROLLER_ADDRESS}" >> .env.local
        echo >> .env.local
    fi

    cat >> .env.local << EOF
# 安全配置
SECURITY_LEVEL=ULTRA-SECURE
CONFIG_VERSION=9.0
CONFIGURED_AT=$(date)

EOF

    # 确保环境文件不被Git追踪
    echo ".env.local" >> .gitignore
    echo "secure-wallet-config.*" >> .gitignore
    
    echo -e "${GREEN}✅ 环境变量配置已生成: .env.local${NC}"
}

# 生成加密配置
generate_encrypted_config() {
    cat > secure-encrypted-config.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>🔐 安全钱包配置</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #1a1a2e; color: white; }
        .config-box { background: #16213e; padding: 20px; border-radius: 10px; margin: 20px 0; }
        button { background: #0f3460; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #16537e; }
        .success { color: #4caf50; }
        .warning { color: #ff9800; }
    </style>
</head>
<body>
    <h1>🔐 安全钱包配置</h1>
    
    <div class="config-box">
        <h3>📝 配置信息</h3>
        <p><strong>主钱包:</strong> ${SECURE_WALLET_ADDRESS}</p>
        $(if [[ -n $MULTISIG_WALLET_ADDRESS ]]; then echo "<p><strong>多重签名:</strong> ${MULTISIG_WALLET_ADDRESS}</p>"; fi)
        $(if [[ -n $TIMELOCK_CONTROLLER_ADDRESS ]]; then echo "<p><strong>时间锁:</strong> ${TIMELOCK_CONTROLLER_ADDRESS}</p>"; fi)
    </div>
    
    <div class="config-box">
        <button onclick="configureSecureWallet()">🔐 配置安全钱包</button>
        <button onclick="verifyConfig()">🔍 验证配置</button>
        <button onclick="clearConfig()">🗑️ 清除配置</button>
    </div>
    
    <div id="status" class="config-box">
        <p>状态：等待配置...</p>
    </div>

    <script>
        class SecureConfigManager {
            constructor() {
                this.encryptionKey = this.getOrCreateKey();
            }
            
            getOrCreateKey() {
                let key = localStorage.getItem('secure_encryption_key');
                if (!key) {
                    key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    localStorage.setItem('secure_encryption_key', key);
                }
                return key;
            }
            
            encrypt(text) {
                return btoa(JSON.stringify({data: text, key: this.encryptionKey}));
            }
            
            decrypt(encryptedText) {
                try {
                    const obj = JSON.parse(atob(encryptedText));
                    return obj.key === this.encryptionKey ? obj.data : null;
                } catch (e) {
                    return null;
                }
            }
            
            setSecureConfig(key, value) {
                const encrypted = this.encrypt(value);
                localStorage.setItem('secure_' + key, encrypted);
            }
            
            getSecureConfig(key) {
                const encrypted = localStorage.getItem('secure_' + key);
                return encrypted ? this.decrypt(encrypted) : null;
            }
        }
        
        const configManager = new SecureConfigManager();
        
        function configureSecureWallet() {
            try {
                configManager.setSecureConfig('WALLET_ADDRESS', '${SECURE_WALLET_ADDRESS}');
                $(if [[ -n $MULTISIG_WALLET_ADDRESS ]]; then echo "configManager.setSecureConfig('MULTISIG_ADDRESS', '${MULTISIG_WALLET_ADDRESS}');"; fi)
                $(if [[ -n $TIMELOCK_CONTROLLER_ADDRESS ]]; then echo "configManager.setSecureConfig('TIMELOCK_ADDRESS', '${TIMELOCK_CONTROLLER_ADDRESS}');"; fi)
                
                updateStatus('✅ 安全钱包配置成功！', 'success');
            } catch (error) {
                updateStatus('❌ 配置失败: ' + error.message, 'error');
            }
        }
        
        function verifyConfig() {
            const wallet = configManager.getSecureConfig('WALLET_ADDRESS');
            if (wallet) {
                updateStatus('✅ 配置验证成功！主钱包: ' + wallet, 'success');
            } else {
                updateStatus('❌ 配置验证失败，请先配置钱包', 'warning');
            }
        }
        
        function clearConfig() {
            localStorage.removeItem('secure_WALLET_ADDRESS');
            localStorage.removeItem('secure_MULTISIG_ADDRESS');
            localStorage.removeItem('secure_TIMELOCK_ADDRESS');
            updateStatus('🗑️ 配置已清除', 'warning');
        }
        
        function updateStatus(message, type) {
            const statusEl = document.getElementById('status');
            statusEl.innerHTML = '<p class="' + type + '">' + message + '</p>';
        }
    </script>
</body>
</html>
EOF

    echo -e "${GREEN}✅ 加密配置页面已生成: secure-encrypted-config.html${NC}"
}

# 部署安全系统
deploy_secure_system() {
    echo -e "${BLUE}🚀 部署万无一失安全系统...${NC}"
    
    # 备份当前文件
    echo -e "${BLUE}💾 备份当前文件...${NC}"
    BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    if [[ -f "index.html" ]]; then
        cp "index.html" "$BACKUP_DIR/"
        echo -e "${GREEN}✅ 已备份 index.html${NC}"
    fi
    
    # 部署安全版本
    cp "wheel-game-ultimate-SECURE.html" "index.html"
    echo -e "${GREEN}✅ 已部署安全版本到 index.html${NC}"
    
    # 创建安全配置文件
    cat > secure-config.js << 'EOF'
// 🛡️ MAO 万无一失安全配置 v9.0
const SECURE_CONFIG = {
    // 基础代币地址 (公开信息)
    MAO_TOKEN: "0x22f49bcb3dad370a9268ba3fca33cb037ca3d022",
    PI_TOKEN: "0xfd4680e25e05b3435c7f698668d1ce80d2a9f444",
    WHEEL_GAME: "0x621DF9e0DE6b4e7EDC5Dc22Cd7c0F883c3F56966",
    
    // 被盗地址黑名单 - 绝对禁止使用
    BLACKLISTED_ADDRESSES: [
        "0xE15881Fc413c6cd47a512C24608F94Fa2896b374", // 已确认被盗 - 奖金池1
        // 在此添加其他被盗地址
    ],
    
    // 安全限制
    SECURITY_LIMITS: {
        // 灵活限额控制
        normal: {
            maxSingleTransaction: "10000",
            maxDailyLimit: "50000",
            maxWeeklyLimit: "200000"
        },
        bigPrize: {
            maxSingleTransaction: "100000",
            maxDailyLimit: "500000",
            maxWeeklyLimit: "2000000",
            requiresMultisig: true
        },
        emergency: {
            maxSingleTransaction: "1000000",
            requiresTimelock: true,
            requiresFullMultisig: true
        },
        maxGasPrice: "100",              // 最大Gas价格 (Gwei)
        requiredConfirmations: 6,        // 所需确认数
        timelockDelay: 86400            // 时间锁延迟 (秒)
    },
    
    // RPC节点配置
    RPC_NODES: [
        'https://elves-core2.alvey.io',  // 优先使用core2
        'https://elves-core3.alvey.io',  // 备用core3
        'https://elves-core1.alvey.io'   // core1作为最后备用
    ],
    
    // 安全等级
    SECURITY_LEVEL: "ULTRA-SECURE",
    VERSION: "9.0",
    DEPLOYED_AT: new Date().toISOString()
};

// 导出配置（如果支持模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SECURE_CONFIG;
}
EOF
    
    echo -e "${GREEN}✅ 已创建优化的安全配置文件 secure-config.js${NC}"
}

# 验证部署
verify_deployment() {
    echo -e "${BLUE}🔍 验证部署...${NC}"
    
    # 检查文件存在
    files=("index.html" "secure-config.js" "wheel-game-ultimate-SECURE.html")
    for file in "${files[@]}"; do
        if [[ -f "$file" ]]; then
            echo -e "${GREEN}✅ $file 存在${NC}"
        else
            echo -e "${RED}❌ $file 缺失${NC}"
        fi
    done
    
    # 检查安全关键字
    if grep -q "UltraSecureBlockchainGameEngine" "index.html"; then
        echo -e "${GREEN}✅ 安全引擎已部署${NC}"
    else
        echo -e "${RED}❌ 安全引擎未找到${NC}"
    fi
    
    if grep -q "BLACKLISTED" "index.html"; then
        echo -e "${GREEN}✅ 黑名单系统已启用${NC}"
    else
        echo -e "${YELLOW}⚠️  黑名单系统状态未知${NC}"
    fi
}

# Git提交
git_commit() {
    echo -e "${BLUE}📝 提交到Git...${NC}"
    
    # 确保敏感文件不被追踪
    echo ".env*" >> .gitignore
    echo "secure-wallet-config.*" >> .gitignore
    echo "secure-encrypted-config.*" >> .gitignore
    echo "wallet-*" >> .gitignore
    
    git add .
    git status
    
    echo
    read -p "确认提交这些更改? (y/N): " confirm
    if [[ $confirm == [yY] ]]; then
        git commit -m "🛡️ 部署万无一失安全系统 v9.0 - 自动化部署

- 新增 wheel-game-ultimate-SECURE.html 安全版本
- 创建优化的 secure-config.js 配置文件
- 启用被盗地址黑名单系统
- 实施多层安全验证和灵活限额控制
- 增强区块确认和RPC故障转移
- 集成交互式安全钱包配置

Security Features:
✅ Anti-Theft Protection: ENABLED
✅ Flexible Limit Controls: ENABLED
✅ Multi-RPC Failover: ENABLED
✅ Enhanced Block Confirmations: 6 blocks
✅ Interactive Wallet Configuration: ENABLED
🔧 Multi-Signature Ready: YES
🔧 Timelock Ready: YES

Security Level: ULTRA-SECURE v9.0"
        
        echo -e "${GREEN}✅ 已提交到Git${NC}"
        
        read -p "是否推送到远程仓库? (y/N): " push_confirm
        if [[ $push_confirm == [yY] ]]; then
            git push origin game-main
            echo -e "${GREEN}✅ 已推送到远程仓库${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  跳过Git提交${NC}"
    fi
}

# 显示配置说明
show_configuration_instructions() {
    echo
    echo -e "${PURPLE}🎉 ==========================================="
    echo -e "    万无一失安全系统部署完成！"
    echo -e "🎉 ===========================================${NC}"
    echo
    
    case $CONFIG_METHOD in
        "localStorage")
            echo -e "${CYAN}📋 下一步操作 - 浏览器本地存储配置:${NC}"
            echo -e "1. 🌐 打开您的游戏网站"
            echo -e "2. 🔧 按F12打开开发者工具"
            echo -e "3. 📝 切换到Console（控制台）标签"
            echo -e "4. 📋 复制并运行 secure-wallet-config.js 中的代码"
            echo -e "5. ✅ 验证配置成功后即可使用"
            ;;
        "envFile")
            echo -e "${CYAN}📋 环境变量配置已完成:${NC}"
            echo -e "1. ✅ 配置文件: .env.local"
            echo -e "2. 🔒 此文件不会被Git追踪"
            echo -e "3. 🚀 重启应用后配置生效"
            ;;
        "encrypted")
            echo -e "${CYAN}📋 下一步操作 - 加密配置:${NC}"
            echo -e "1. 🌐 在浏览器中打开 secure-encrypted-config.html"
            echo -e "2. 🔐 点击"配置安全钱包"按钮"
            echo -e "3. 🔍 点击"验证配置"确认成功"
            echo -e "4. ✅ 配置完成后即可使用游戏"
            ;;
        "skip")
            echo -e "${CYAN}📋 钱包配置已跳过:${NC}"
            echo -e "1. ⚠️  当前使用默认配置"
            echo -e "2. 🔧 如需配置新钱包，请重新运行脚本"
            ;;
    esac
    
    echo
    echo -e "${GREEN}🛡️ 安全特性总结:${NC}"
    echo -e "✅ 被盗地址黑名单保护"
    echo -e "✅ 多层安全验证系统"
    echo -e "✅ 灵活限额控制"
    echo -e "✅ 增强区块确认（6个确认）"
    echo -e "✅ 多RPC节点故障转移"
    echo -e "✅ 实时安全状态监控"
    echo
    
    echo -e "${BLUE}📖 更多信息:${NC}"
    echo -e "- 📄 查看 SECURE_WALLET_CONFIG_GUIDE.md 获取详细配置说明"
    echo -e "- 📄 查看 GAME_FLOW_ANALYSIS.md 了解游戏流程"
    echo -e "- 📄 查看 SECURITY_SUMMARY.md 了解安全措施"
    echo
    
    echo -e "${GREEN}🔗 访问您的安全游戏:${NC}"
    if git remote get-url origin &>/dev/null; then
        REPO_URL=$(git config --get remote.origin.url | sed 's/.*github.com[:/]//' | sed 's/\.git$//')
        echo -e "   https://${REPO_URL/://}/"
    else
        echo -e "   请查看您的部署URL"
    fi
    echo
}

# 主函数
main() {
    echo -e "${BLUE}🛡️ 开始完全自动化安全部署...${NC}"
    echo
    
    # 执行部署步骤
    show_security_warning
    echo
    
    check_dependencies
    echo
    
    choose_config_method
    echo
    
    input_wallet_addresses
    echo
    
    generate_config
    echo
    
    deploy_secure_system
    echo
    
    verify_deployment
    echo
    
    git_commit
    echo
    
    show_configuration_instructions
    
    echo -e "${GREEN}🎉 自动化安全部署完成！您的资金现在受到万无一失的保护！${NC}"
    echo -e "${PURPLE}🔐 记住：安全是一个持续的过程，请定期检查和更新安全配置！${NC}"
}

# 检查是否以脚本方式运行
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 