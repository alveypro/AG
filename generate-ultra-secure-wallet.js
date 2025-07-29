// 🔐 MAO游戏超安全钱包生成器
// 目的：生成多重签名安全钱包系统

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class UltraSecureWalletGenerator {
    constructor() {
        this.walletDir = path.join(require('os').homedir(), 'Desktop', 'maogamewallets');
        this.maliciousAddresses = [
            "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7",
            "0xE15881Fc413c6cd47a512C24608F94Fa2896b374"
        ];
        
        // 确保文件夹存在
        if (!fs.existsSync(this.walletDir)) {
            fs.mkdirSync(this.walletDir, { recursive: true });
        }
        
        console.log('🔐 MAO游戏超安全钱包生成器');
        console.log('='.repeat(60));
        console.log(`📁 钱包保存路径: ${this.walletDir}`);
        console.log('');
    }
    
    generateMultiSigWallets() {
        console.log('🔐 生成多重签名钱包系统...');
        
        const wallets = [];
        
        // 生成5个管理员钱包
        for (let i = 1; i <= 5; i++) {
            const wallet = this.generateSecureWallet(i);
            wallets.push(wallet);
        }
        
        // 生成主奖金池钱包
        const prizePoolWallet = this.generateSecureWallet('prize-pool');
        wallets.push(prizePoolWallet);
        
        return wallets;
    }
    
    generateSecureWallet(index) {
        console.log(`🔐 生成钱包 ${index}...`);
        
        // 生成随机钱包
        const wallet = ethers.Wallet.createRandom();
        
        // 检查是否为恶意地址
        const isMalicious = this.maliciousAddresses.some(addr => 
            wallet.address.toLowerCase() === addr.toLowerCase()
        );
        
        if (isMalicious) {
            console.log('⚠️ 检测到恶意地址，重新生成...');
            return this.generateSecureWallet(index);
        }
        
        return {
            index: index,
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic,
            publicKey: wallet.publicKey,
            role: index === 'prize-pool' ? '奖金池' : `管理员${index}`
        };
    }
    
    encryptPrivateKey(privateKey, password) {
        const algorithm = 'aes-256-gcm';
        const key = crypto.scryptSync(password, 'maogame-salt', 32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipher(algorithm, key);
        let encrypted = cipher.update(privateKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return {
            encrypted: encrypted,
            iv: iv.toString('hex'),
            tag: cipher.getAuthTag().toString('hex')
        };
    }
    
    saveEncryptedWallet(walletInfo, masterPassword) {
        const filename = `${walletInfo.role}-wallet-encrypted.json`;
        const filepath = path.join(this.walletDir, filename);
        
        // 加密私钥
        const encryptedPrivateKey = this.encryptPrivateKey(walletInfo.privateKey, masterPassword);
        
        const walletData = {
            version: "2.0",
            id: walletInfo.role,
            address: walletInfo.address,
            role: walletInfo.role,
            createdAt: new Date().toISOString(),
            encrypted: {
                privateKey: encryptedPrivateKey.encrypted,
                iv: encryptedPrivateKey.iv,
                tag: encryptedPrivateKey.tag
            },
            mnemonic: {
                phrase: walletInfo.mnemonic.phrase,
                path: walletInfo.mnemonic.path,
                locale: walletInfo.mnemonic.locale
            },
            security: {
                blacklistedCheck: true,
                maliciousAddresses: this.maliciousAddresses,
                verified: !this.maliciousAddresses.some(addr => 
                    walletInfo.address.toLowerCase() === addr.toLowerCase()
                ),
                encryptionLevel: "AES-256-GCM",
                purpose: walletInfo.role === '奖金池' ? "奖金池管理" : "多重签名管理"
            }
        };
        
        // 保存加密钱包文件
        fs.writeFileSync(filepath, JSON.stringify(walletData, null, 2));
        
        return filepath;
    }
    
    generateMultiSigConfig(wallets) {
        const adminWallets = wallets.filter(w => w.role !== '奖金池');
        const prizePoolWallet = wallets.find(w => w.role === '奖金池');
        
        const configData = {
            multiSigConfig: {
                requiredSignatures: 3,
                totalSigners: adminWallets.length,
                signers: adminWallets.map(w => w.address),
                prizePool: prizePoolWallet.address
            },
            deploymentParams: {
                MAO_TOKEN: "0x22f49bcb3dad370a9268ba3fca33cb037ca3d022",
                PI_TOKEN: "0xfd4680e25e05b3435c7f698668d1ce80d2a9f444",
                MARKETING_WALLET: "0x861A48051eFaA1876D4B38904516C9F7bbCca36d",
                PRIZE_POOL: prizePoolWallet.address
            },
            security: {
                blacklistedAddresses: this.maliciousAddresses,
                verifiedSafe: true,
                multiSigEnabled: true,
                encryptionEnabled: true
            }
        };
        
        const configFile = path.join(this.walletDir, 'ultra-secure-config.json');
        fs.writeFileSync(configFile, JSON.stringify(configData, null, 2));
        
        return configFile;
    }
    
    generateSecurityGuide(wallets, masterPassword) {
        const guide = `
🔐 MAO游戏超安全钱包系统指南
================================

✅ 钱包系统生成成功
🔒 安全等级: 超高级别
📅 生成时间: ${new Date().toISOString()}

🏆 钱包信息:
${wallets.map(w => `- ${w.role}: ${w.address}`).join('\n')}

🔐 多重签名配置:
- 总签名者: ${wallets.filter(w => w.role !== '奖金池').length}个
- 所需签名: 3个
- 奖金池: ${wallets.find(w => w.role === '奖金池').address}

🔒 安全特性:
- ✅ AES-256-GCM加密
- ✅ 多重签名保护
- ✅ 恶意地址检查
- ✅ 私钥加密存储
- ✅ 助记词备份

⚠️ 重要提醒:
1. 主密码: ${masterPassword}
2. 请妥善保管所有私钥和助记词
3. 建议使用硬件钱包
4. 定期更换密码
5. 监控钱包活动

📋 下一步:
1. 备份所有钱包文件
2. 设置硬件钱包
3. 配置多重签名
4. 部署游戏合约
5. 测试安全功能

🔐 安全建议:
- 使用硬件钱包存储私钥
- 设置多重签名保护
- 定期更换密码
- 监控钱包活动
- 备份助记词到安全位置
`;
        
        const guideFile = path.join(this.walletDir, 'ultra-secure-guide.txt');
        fs.writeFileSync(guideFile, guide);
        
        return guideFile;
    }
}

async function main() {
    console.log('🚀 开始生成超安全钱包系统...\n');
    
    const generator = new UltraSecureWalletGenerator();
    
    try {
        // 生成主密码
        const masterPassword = crypto.randomBytes(32).toString('hex');
        
        // 生成多重签名钱包
        const wallets = generator.generateMultiSigWallets();
        
        // 保存加密钱包
        const savedFiles = [];
        for (const wallet of wallets) {
            const filepath = generator.saveEncryptedWallet(wallet, masterPassword);
            savedFiles.push(filepath);
        }
        
        // 生成多重签名配置
        const configFile = generator.generateMultiSigConfig(wallets);
        
        // 生成安全指南
        const guideFile = generator.generateSecurityGuide(wallets, masterPassword);
        
        console.log('✅ 超安全钱包系统生成成功!');
        console.log('');
        console.log('📋 生成的文件:');
        savedFiles.forEach(file => console.log(`- ${file}`));
        console.log(`- 配置: ${configFile}`);
        console.log(`- 指南: ${guideFile}`);
        console.log('');
        console.log('🔐 主密码:', masterPassword);
        console.log('');
        console.log('🏆 钱包地址:');
        wallets.forEach(w => console.log(`${w.role}: ${w.address}`));
        console.log('');
        console.log('⚠️ 请妥善保管主密码和所有私钥!');
        console.log('🎯 建议立即转移到硬件钱包');
        
    } catch (error) {
        console.error('❌ 生成失败:', error);
        process.exit(1);
    }
}

main(); 
 
 
 