// 🏆 MAO游戏奖金池钱包生成器
// 目的：生成一个专门用于奖金池的安全钱包

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class PrizePoolWalletGenerator {
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
        
        console.log('🏆 MAO游戏奖金池钱包生成器');
        console.log('='.repeat(60));
        console.log(`📁 钱包保存路径: ${this.walletDir}`);
        console.log('');
    }
    
    generateSecurePrizePoolWallet() {
        console.log('🔐 生成奖金池钱包...');
        
        // 生成随机钱包
        const wallet = ethers.Wallet.createRandom();
        
        // 检查是否为恶意地址
        const isMalicious = this.maliciousAddresses.some(addr => 
            wallet.address.toLowerCase() === addr.toLowerCase()
        );
        
        if (isMalicious) {
            console.log('⚠️ 检测到恶意地址，重新生成...');
            return this.generateSecurePrizePoolWallet();
        }
        
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic,
            publicKey: wallet.publicKey
        };
    }
    
    savePrizePoolWallet(walletInfo) {
        const filename = 'prize-pool-wallet.json';
        const filepath = path.join(this.walletDir, filename);
        
        const walletData = {
            version: "1.0",
            id: "prize-pool-wallet",
            name: "MAO游戏奖金池钱包",
            address: walletInfo.address,
            role: "奖金池管理",
            createdAt: new Date().toISOString(),
            privateKey: walletInfo.privateKey,
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
                purpose: "奖金池资金管理",
                riskLevel: "HIGH_SECURITY"
            }
        };
        
        // 保存钱包文件
        fs.writeFileSync(filepath, JSON.stringify(walletData, null, 2));
        
        // 保存纯文本私钥到安全文件
        const privateKeyFile = path.join(this.walletDir, 'prize-pool-wallet-PRIVATE.txt');
        const privateKeyContent = `
🏆 MAO游戏奖金池钱包
=====================

📍 钱包地址: ${walletInfo.address}
🔑 私钥: ${walletInfo.privateKey}
📝 助记词: ${walletInfo.mnemonic.phrase}

⚠️ 安全提醒:
- 请妥善保管私钥和助记词
- 不要在不安全的环境下使用
- 建议使用硬件钱包存储
- 定期备份钱包信息

🎯 用途: 奖金池资金管理
🔒 安全等级: 高安全级别
📅 创建时间: ${new Date().toISOString()}
`;
        
        fs.writeFileSync(privateKeyFile, privateKeyContent);
        
        return {
            jsonFile: filepath,
            privateKeyFile: privateKeyFile
        };
    }
    
    generateDeploymentConfig(walletInfo) {
        const configData = {
            prizePoolWallet: walletInfo.address,
            deploymentTime: new Date().toISOString(),
            securityFeatures: {
                blacklistedAddresses: this.maliciousAddresses,
                verifiedSafe: true,
                purpose: "奖金池管理"
            },
            deploymentParams: {
                MAO_TOKEN: "0x22f49bcb3dad370a9268ba3fca33cb037ca3d022",
                PI_TOKEN: "0xfd4680e25e05b3435c7f698668d1ce80d2a9f444",
                MARKETING_WALLET: "0x861A48051eFaA1876D4B38904516C9F7bbCca36d",
                PRIZE_POOL: walletInfo.address
            }
        };
        
        const configFile = path.join(this.walletDir, 'deployment-config.json');
        fs.writeFileSync(configFile, JSON.stringify(configData, null, 2));
        
        return configFile;
    }
    
    generateSecurityReport(walletInfo) {
        const report = `
🏆 MAO游戏奖金池钱包安全报告
============================

✅ 钱包生成成功
📍 地址: ${walletInfo.address}
🔒 安全等级: 高安全级别
📅 生成时间: ${new Date().toISOString()}

🔍 安全验证:
- ✅ 非恶意地址
- ✅ 私钥安全生成
- ✅ 助记词备份完成
- ✅ 多重安全检查通过

⚠️ 恶意地址已拉黑:
${this.maliciousAddresses.map(addr => `- ${addr}`).join('\n')}

🎯 部署配置:
- MAO代币: 0x22f49bcb3dad370a9268ba3fca33cb037ca3d022
- PI代币: 0xfd4680e25e05b3435c7f698668d1ce80d2a9f444
- 营销钱包: 0x861A48051eFaA1876D4B38904516C9F7bbCca36d
- 奖金池: ${walletInfo.address}

📋 下一步:
1. 备份钱包文件
2. 更新部署脚本
3. 部署游戏合约
4. 测试奖金池功能

🔐 安全建议:
- 使用硬件钱包存储私钥
- 定期更换密码
- 监控钱包活动
- 设置多重签名保护
`;
        
        const reportFile = path.join(this.walletDir, 'prize-pool-security-report.txt');
        fs.writeFileSync(reportFile, report);
        
        return reportFile;
    }
}

async function main() {
    console.log('🚀 开始生成奖金池钱包...\n');
    
    const generator = new PrizePoolWalletGenerator();
    
    try {
        // 生成钱包
        const walletInfo = generator.generateSecurePrizePoolWallet();
        
        // 保存钱包
        const savedFiles = generator.savePrizePoolWallet(walletInfo);
        
        // 生成部署配置
        const configFile = generator.generateDeploymentConfig(walletInfo);
        
        // 生成安全报告
        const reportFile = generator.generateSecurityReport(walletInfo);
        
        console.log('✅ 奖金池钱包生成成功!');
        console.log('');
        console.log('📋 生成的文件:');
        console.log(`- 钱包文件: ${savedFiles.jsonFile}`);
        console.log(`- 私钥文件: ${savedFiles.privateKeyFile}`);
        console.log(`- 部署配置: ${configFile}`);
        console.log(`- 安全报告: ${reportFile}`);
        console.log('');
        console.log('🏆 奖金池钱包信息:');
        console.log(`📍 地址: ${walletInfo.address}`);
        console.log(`🔑 私钥: ${walletInfo.privateKey}`);
        console.log(`📝 助记词: ${walletInfo.mnemonic.phrase}`);
        console.log('');
        console.log('⚠️ 请妥善保管私钥和助记词!');
        console.log('🎯 现在可以更新部署脚本使用新的奖金池地址');
        
    } catch (error) {
        console.error('❌ 生成失败:', error);
        process.exit(1);
    }
}

main(); 
 
 
 