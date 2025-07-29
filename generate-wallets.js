const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// 配置
const WALLET_COUNT = 4; // 生成4个新钱包 + 1个现有地址
const USER_SAFE_ADDRESS = "0xd0dC6Ff0eA6a27a0a4Ba0002F019d0E1b9666c28";
const MALICIOUS_ADDRESS = "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7";
const WALLET_DIR = path.join(require('os').homedir(), 'Desktop', 'maogamewallets');

console.log('🔐 MAO游戏安全钱包生成器');
console.log('================================');

// 确保目录存在
if (!fs.existsSync(WALLET_DIR)) {
    fs.mkdirSync(WALLET_DIR, { recursive: true });
}

console.log(`📁 钱包保存路径: ${WALLET_DIR}`);
console.log('');

const wallets = [];

// 添加现有的用户地址作为管理员1
wallets.push({
    index: 1,
    address: USER_SAFE_ADDRESS,
    role: "主管理员 (您的现有地址)",
    isExisting: true
});

console.log(`✅ 管理员1: ${USER_SAFE_ADDRESS} (现有)`);

// 生成新钱包
for (let i = 2; i <= 5; i++) {
    console.log(`生成管理员钱包 ${i}...`);
    
    let wallet;
    do {
        wallet = ethers.Wallet.createRandom();
    } while (wallet.address.toLowerCase() === MALICIOUS_ADDRESS.toLowerCase());
    
    const walletInfo = {
        index: i,
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
        role: `管理员${i}`
    };
    
    wallets.push(walletInfo);
    
    // 保存私钥文件
    const privateKeyContent = `🔐 MAO游戏管理员钱包 ${i}
================================

📍 地址: ${wallet.address}
🔑 私钥: ${wallet.privateKey}
🔤 助记词: ${wallet.mnemonic.phrase}

⚠️ 请妥善保管此信息！
生成时间: ${new Date().toLocaleString()}`;
    
    const privateKeyFile = path.join(WALLET_DIR, `admin-wallet-${i}-PRIVATE.txt`);
    fs.writeFileSync(privateKeyFile, privateKeyContent);
    
    console.log(`✅ 管理员${i}: ${wallet.address}`);
    console.log(`   💾 私钥已保存: admin-wallet-${i}-PRIVATE.txt`);
}

// 生成配置文件
const config = {
    trustedOwner: USER_SAFE_ADDRESS,
    adminAddresses: wallets.map(w => w.address),
    blacklistedAddresses: [MALICIOUS_ADDRESS],
    maoToken: "0x22f49bcb3dad370a9268ba3fca33cb037ca3d022",
    piToken: "0xfd4680e25e05b3435c7f698668d1ce80d2a9f444",
    multiSigConfig: {
        requiredSignatures: 3,
        totalAdmins: 5
    },
    generatedAt: new Date().toISOString()
};

fs.writeFileSync(path.join(WALLET_DIR, 'multisig-config.json'), JSON.stringify(config, null, 2));

// 生成汇总文件
const summary = `# 🔐 MAO游戏管理员钱包汇总

## 管理员地址列表:
${wallets.map(w => `${w.index}. ${w.address} - ${w.role}`).join('\n')}

## 安全验证:
✅ 所有地址已验证，不包含恶意地址: ${MALICIOUS_ADDRESS}

## 文件说明:
- multisig-config.json - 多重签名配置
- admin-wallet-[2-5]-PRIVATE.txt - 管理员私钥

⚠️ 重要提醒:
- 立即备份此文件夹到安全位置
- 不要通过网络传输私钥文件
- 建议打印私钥作为物理备份

生成时间: ${new Date().toLocaleString()}
`;

fs.writeFileSync(path.join(WALLET_DIR, 'README.md'), summary);

console.log('\n🎉 钱包生成完成！');
console.log('================================');
console.log('📋 生成的文件:');
console.log('  📄 README.md - 钱包汇总');
console.log('  ⚙️ multisig-config.json - 配置文件');
console.log('  🔑 admin-wallet-[2-5]-PRIVATE.txt - 私钥文件');
console.log('\n🔐 管理员地址:');
wallets.forEach(w => {
    console.log(`  ${w.index}. ${w.address} ${w.isExisting ? '(现有)' : '(新生成)'}`);
});

console.log('\n⚠️ 下一步操作:');
console.log('1. 立即备份 maogamewallets 文件夹');
console.log('2. 使用这些地址更新合约配置');
console.log('3. 测试每个钱包的导入和签名功能');

module.exports = { wallets, config }; 