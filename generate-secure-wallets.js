// 🔐 MAO游戏安全钱包生成器
// 目的：生成5个管理员钱包用于多重签名保护

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecureWalletGenerator {
    constructor() {
        this.walletDir = path.join(require('os').homedir(), 'Desktop', 'maogamewallets');
        this.maliciousAddress = "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7";
        this.userSafeAddress = "0xd0dC6Ff0eA6a27a0a4Ba0002F019d0E1b9666c28";
        
        // 确保文件夹存在
        if (!fs.existsSync(this.walletDir)) {
            fs.mkdirSync(this.walletDir, { recursive: true });
        }
        
        console.log('🔐 MAO游戏安全钱包生成器启动');
        console.log('='.repeat(60));
        console.log(`📁 钱包保存路径: ${this.walletDir}`);
        console.log('');
    }
    
    generateSecureWallet(index) {
        // 生成随机钱包
        const wallet = ethers.Wallet.createRandom();
        
        // 确保不是恶意地址
        if (wallet.address.toLowerCase() === this.maliciousAddress.toLowerCase()) {
            console.log('⚠️ 检测到冲突地址，重新生成...');
            return this.generateSecureWallet(index);
        }
        
        return {
            index: index,
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic,
            publicKey: wallet.publicKey
        };
    }
    
    encryptPrivateKey(privateKey, password) {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync(password, 'salt', 32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipher(algorithm, key);
        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            encrypted: encrypted,
            iv: iv.toString('hex')
        };
    }
    
    saveWalletSecurely(walletInfo, masterPassword) {
        const filename = `admin-wallet-${walletInfo.index}.json`;
        const filepath = path.join(this.walletDir, filename);
        
        // 加密私钥
        const encryptedPrivateKey = this.encryptPrivateKey(walletInfo.privateKey, masterPassword);
        
        const walletData = {
            version: "1.0",
            id: `admin-${walletInfo.index}`,
            address: walletInfo.address,
            role: `MAO游戏管理员${walletInfo.index}`,
            createdAt: new Date().toISOString(),
            encrypted: {
                privateKey: encryptedPrivateKey.encrypted,
                iv: encryptedPrivateKey.iv
            },
            mnemonic: {
                phrase: walletInfo.mnemonic.phrase,
                path: walletInfo.mnemonic.path,
                locale: walletInfo.mnemonic.locale
            },
            security: {
                blacklistedCheck: true,
                maliciousAddress: this.maliciousAddress,
                verified: walletInfo.address.toLowerCase() !== this.maliciousAddress.toLowerCase()
            }
        };
        
        // 保存加密钱包文件
        fs.writeFileSync(filepath, JSON.stringify(walletData, null, 2));
        
        // 保存纯文本私钥到单独的安全文件
        const privateKeyFile = path.join(this.walletDir, `admin-wallet-${walletInfo.index}-PRIVATE.txt`);
        const privateKeyContent = `
🔐 MAO游戏管理员钱包 ${walletInfo.index}
=====================================

📍 钱包地址: ${walletInfo.address}
🔑 私钥: ${walletInfo.privateKey}

🔤 助记词: ${walletInfo.mnemonic.phrase}

⚠️ 重要安全提醒:
- 此文件包含您的私钥，请妥善保管
- 不要分享给任何人
- 建议打印备份并离线存储
- 删除此文件前请确保已安全备份

生成时间: ${new Date().toLocaleString()}
        `.trim();
        
        fs.writeFileSync(privateKeyFile, privateKeyContent);
        
        return filepath;
    }
    
    async generateMultiSigWallets() {
        console.log('🎯 开始生成5个管理员钱包...\n');
        
        // 生成主密码
        const masterPassword = crypto.randomBytes(32).toString('hex');
        console.log(`🔐 主加密密码: ${masterPassword}`);
        console.log('⚠️ 请妥善保存此密码，用于解密私钥!\n`);
        
        const wallets = [];
        
        // 第一个钱包使用用户现有的安全地址
        wallets.push({
            index: 1,
            address: this.userSafeAddress,
            role: "主管理员 (您的安全地址)",
            isExisting: true
        });
        
        // 生成4个新钱包
        for (let i = 2; i <= 5; i++) {
            console.log(`生成管理员钱包 ${i}...`);
            
            const walletInfo = this.generateSecureWallet(i);
            const filepath = this.saveWalletSecurely(walletInfo, masterPassword);
            
            wallets.push({
                index: i,
                address: walletInfo.address,
                privateKey: walletInfo.privateKey,
                mnemonic: walletInfo.mnemonic.phrase,
                filepath: filepath,
                role: `管理员${i}`
            });
            
            console.log(`✅ 管理员${i}: ${walletInfo.address}`);
            console.log(`   💾 已保存到: ${filepath}\n`);
        }
        
        // 生成汇总文件
        this.generateSummaryFile(wallets, masterPassword);
        
        // 生成配置文件
        this.generateConfigFile(wallets);
        
        // 生成安全指南
        this.generateSecurityGuide(wallets, masterPassword);
        
        return wallets;
    }
    
    generateSummaryFile(wallets, masterPassword) {
        const summaryFile = path.join(this.walletDir, 'WALLETS_SUMMARY.md');
        
        let content = `# 🔐 MAO游戏管理员钱包汇总

## 📊 钱包概览

### 多重签名配置: 5/3 (5个管理员，3个签名)

| 管理员 | 地址 | 角色 | 状态 |
|--------|------|------|------|
`;

        wallets.forEach(wallet => {
            const status = wallet.isExisting ? '现有地址' : '新生成';
            content += `| ${wallet.index} | \`${wallet.address}\` | ${wallet.role} | ${status} |\n`;
        });

        content += `
## 🔑 安全信息

### 主加密密码
\`\`\`
${masterPassword}
\`\`\`

⚠️ **请立即备份此密码!** 用于解密所有私钥文件。

## 📁 文件说明

### 钱包文件
`;

        wallets.forEach(wallet => {
            if (!wallet.isExisting) {
                content += `- \`admin-wallet-${wallet.index}.json\` - 加密钱包文件\n`;
                content += `- \`admin-wallet-${wallet.index}-PRIVATE.txt\` - 私钥明文文件\n`;
            }
        });

        content += `
## 🛡️ 安全检查

### 黑名单验证
✅ 所有生成的地址已验证，确保不包含恶意地址: \`${this.maliciousAddress}\`

### 地址验证
`;

        wallets.forEach(wallet => {
            const isBlacklisted = wallet.address.toLowerCase() === this.maliciousAddress.toLowerCase();
            const status = isBlacklisted ? '❌ 危险' : '✅ 安全';
            content += `- ${wallet.address}: ${status}\n`;
        });

        content += `
## 📋 下一步操作

1. **立即备份**: 将整个 \`maogamewallets\` 文件夹备份到安全位置
2. **打印备份**: 打印重要的私钥和助记词，离线存储
3. **更新合约**: 使用这些地址部署新的安全合约
4. **测试签名**: 确保所有管理员都能正常签名
5. **删除明文**: 确认备份后，可删除 \`*-PRIVATE.txt\` 文件

## ⚠️ 安全提醒

- 🔐 **绝不**通过网络传输私钥
- 💾 **立即**备份所有钱包文件
- 🖨️ **打印**重要信息作为物理备份
- 🗑️ **定期**清理不需要的明文文件
- 👥 **分散**管理员私钥，避免单点故障

---
生成时间: ${new Date().toLocaleString()}
生成工具: MAO游戏安全钱包生成器 v1.0
`;

        fs.writeFileSync(summaryFile, content);
        console.log(`📄 钱包汇总已保存到: ${summaryFile}`);
    }
    
    generateConfigFile(wallets) {
        const configFile = path.join(this.walletDir, 'multisig-config.json');
        
        const config = {
            contractName: "UltraSecureWheelGame",
            version: "1.0",
            trustedOwner: this.userSafeAddress,
            adminAddresses: wallets.map(w => w.address),
            multiSigConfig: {
                requiredSignatures: 3,
                totalAdmins: 5,
                threshold: "3/5"
            },
            blacklistedAddresses: [this.maliciousAddress],
            securityFeatures: {
                multiSigRequired: 3,
                timelockDelay: "24 hours",
                dailyWithdrawLimit: "50000",
                weeklyWithdrawLimit: "200000",
                maxSingleWithdraw: "10000"
            },
            tokens: {
                MAO_TOKEN: "0x22f49bcb3dad370a9268ba3fca33cb037ca3d022",
                PI_TOKEN: "0xfd4680e25e05b3435c7f698668d1ce80d2a9f444"
            },
            generatedAt: new Date().toISOString(),
            deploymentReady: true
        };
        
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        console.log(`⚙️ 配置文件已保存到: ${configFile}`);
        
        return config;
    }
    
    generateSecurityGuide(wallets, masterPassword) {
        const guideFile = path.join(this.walletDir, 'SECURITY_GUIDE.md');
        
        const content = `# 🛡️ MAO游戏钱包安全管理指南

## 🎯 立即执行清单

### ✅ 必须立即完成
- [ ] **备份整个文件夹**: 复制 \`maogamewallets\` 到安全位置
- [ ] **记录主密码**: \`${masterPassword}\`
- [ ] **打印私钥**: 打印所有 \`*-PRIVATE.txt\` 文件
- [ ] **测试钱包**: 导入MetaMask确认可用性
- [ ] **分发管理**: 将管理员私钥分发给对应人员

### 🔐 私钥管理

#### 管理员1 (您的地址)
- 地址: \`${this.userSafeAddress}\`
- 状态: 现有钱包，请确保私钥安全

#### 新生成的管理员钱包
`;

        wallets.forEach(wallet => {
            if (!wallet.isExisting) {
                content += `
##### 管理员${wallet.index}
- 地址: \`${wallet.address}\`
- 私钥文件: \`admin-wallet-${wallet.index}-PRIVATE.txt\`
- 加密文件: \`admin-wallet-${wallet.index}.json\`
`;
            }
        });

        content += `
## 📱 钱包导入指南

### MetaMask导入步骤
1. 打开MetaMask钱包
2. 点击账户图标 → "导入账户"
3. 选择"私钥"方式
4. 粘贴私钥 (从 \`*-PRIVATE.txt\` 文件中获取)
5. 设置账户名称 (如: "MAO管理员2")
6. 完成导入

### 助记词恢复 (备用方法)
1. 在新设备上安装MetaMask
2. 选择"使用助记词恢复"
3. 输入助记词 (从钱包文件中获取)
4. 设置新密码
5. 恢复钱包

## 🔒 安全最佳实践

### 物理安全
- 🖨️ **打印备份**: 将私钥和助记词打印在纸上
- 🏦 **银行保险箱**: 考虑将备份存放在银行保险箱
- 🔥 **防火防水**: 使用防火防水的存储盒
- 📷 **避免拍照**: 不要用手机拍照私钥

### 数字安全
- 💾 **离线存储**: 在离线电脑上生成和存储
- 🔐 **加密硬盘**: 使用加密的外置硬盘备份
- 🌐 **避免云存储**: 不要上传到任何云服务
- 🦠 **防病毒**: 确保电脑安全，无恶意软件

### 操作安全
- 👥 **分散管理**: 不同管理员私钥分别保管
- ⏰ **定期检查**: 每月检查钱包文件完整性
- 🔄 **定期演练**: 定期进行多重签名操作演练
- 📋 **操作记录**: 记录所有重要操作

## 🚨 紧急响应

### 如果私钥泄露
1. **立即转移资金**: 将所有资金转移到新地址
2. **通知其他管理员**: 立即通知所有管理员
3. **生成新钱包**: 重新生成新的管理员钱包
4. **更新合约**: 部署新的合约或更新管理员列表

### 如果文件丢失
1. **检查备份**: 从备份位置恢复文件
2. **使用助记词**: 通过助记词重新生成钱包
3. **联系其他管理员**: 确认多重签名仍可正常工作

## 🔧 技术支持

### 解密私钥
\`\`\`javascript
// 如需解密 .json 文件中的私钥
const crypto = require('crypto');

function decryptPrivateKey(encryptedData, password) {
    // 解密代码 (需要技术人员操作)
}
\`\`\`

### 验证地址
\`\`\`javascript
// 验证生成的地址是否安全
const blacklistedAddress = "${this.maliciousAddress}";
// 确保所有地址都不等于黑名单地址
\`\`\`

---

**🎯 记住: 多重签名的安全性取决于每个管理员私钥的安全性！**

生成时间: ${new Date().toLocaleString()}
`;

        fs.writeFileSync(guideFile, content);
        console.log(`📖 安全指南已保存到: ${guideFile}`);
    }
}

// 主执行函数
async function main() {
    console.log('🚀 启动MAO游戏安全钱包生成...\n');
    
    const generator = new SecureWalletGenerator();
    
    try {
        const wallets = await generator.generateMultiSigWallets();
        
        console.log('\n🎉 钱包生成完成！');
        console.log('='.repeat(60));
        console.log('📁 所有文件已保存到: ~/Desktop/maogamewallets/');
        console.log('');
        console.log('📋 生成的文件:');
        console.log('  🔑 admin-wallet-[2-5].json - 加密钱包文件');
        console.log('  📄 admin-wallet-[2-5]-PRIVATE.txt - 私钥明文');
        console.log('  📊 WALLETS_SUMMARY.md - 钱包汇总');
        console.log('  ⚙️ multisig-config.json - 配置文件');
        console.log('  📖 SECURITY_GUIDE.md - 安全指南');
        console.log('');
        console.log('🔐 管理员地址:');
        wallets.forEach(wallet => {
            const type = wallet.isExisting ? '(现有)' : '(新生成)';
            console.log(`  ${wallet.index}. ${wallet.address} ${type}`);
        });
        console.log('');
        console.log('⚠️ 下一步:');
        console.log('  1. 立即备份 maogamewallets 文件夹');
        console.log('  2. 阅读 SECURITY_GUIDE.md');
        console.log('  3. 使用 multisig-config.json 部署合约');
        console.log('  4. 测试所有管理员钱包');
        
        return wallets;
        
    } catch (error) {
        console.error('❌ 钱包生成失败:', error);
        throw error;
    }
}

// 导出模块
module.exports = { SecureWalletGenerator, main };

// 如果直接运行
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 脚本执行失败:', error);
        process.exit(1);
    });
} 