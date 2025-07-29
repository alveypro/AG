const { ethers } = require('ethers');

// 配置
const CONFIG = {
    rpcUrl: 'https://rpc.alveychain.com',
    maoToken: '0x22f49bcb3dad370a9268ba3fca33cb037ca3d022',
    piToken: '0xfd4680e25e05b3435c7f698668d1ce80d2a9f444',
    maoGameCost: '1000000000000000000',
    piGameCost: '1000000000000000000'
};

async function verifyTokens() {
    console.log('🔍 验证代币合约...');
    
    const provider = new ethers.providers.JsonRpcProvider(CONFIG.rpcUrl);
    
    try {
        // 验证MAO代币
        console.log(`检查MAO代币: ${CONFIG.maoToken}`);
        const maoCode = await provider.getCode(CONFIG.maoToken);
        if (maoCode === '0x') {
            console.log('❌ MAO代币合约不存在');
            return false;
        }
        console.log('✅ MAO代币合约存在');
        
        // 验证PI代币
        console.log(`检查PI代币: ${CONFIG.piToken}`);
        const piCode = await provider.getCode(CONFIG.piToken);
        if (piCode === '0x') {
            console.log('❌ PI代币合约不存在');
            return false;
        }
        console.log('✅ PI代币合约存在');
        
        return true;
    } catch (error) {
        console.log('❌ 验证失败:', error.message);
        return false;
    }
}

async function testDeployParams() {
    console.log('\n🧪 测试部署参数...');
    
    try {
        const params = [
            CONFIG.maoToken,
            CONFIG.piToken,
            CONFIG.maoGameCost,
            CONFIG.piGameCost
        ];
        
        console.log('部署参数:');
        console.log('_maoToken:', params[0]);
        console.log('_piToken:', params[1]);
        console.log('_maoGameCost:', params[2]);
        console.log('_piGameCost:', params[3]);
        
        // 测试参数编码
        const abiCoder = new ethers.utils.AbiCoder();
        const encoded = abiCoder.encode(
            ['address', 'address', 'uint256', 'uint256'],
            params
        );
        
        console.log('✅ 参数编码成功');
        console.log('编码长度:', encoded.length);
        
        return true;
    } catch (error) {
        console.log('❌ 参数编码失败:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 开始验证部署配置...\n');
    
    // 验证代币合约
    const tokensValid = await verifyTokens();
    if (!tokensValid) {
        console.log('\n❌ 代币合约验证失败，无法部署');
        return;
    }
    
    // 测试部署参数
    const paramsValid = await testDeployParams();
    if (!paramsValid) {
        console.log('\n❌ 部署参数验证失败');
        return;
    }
    
    console.log('\n✅ 所有验证通过！');
    console.log('\n📋 在Remix IDE中使用以下参数:');
    console.log('_maoToken: 0x22f49bcb3dad370a9268ba3fca33cb037ca3d022');
    console.log('_piToken: 0xfd4680e25e05b3435c7f698668d1ce80d2a9f444');
    console.log('_maoGameCost: 1000000000000000000');
    console.log('_piGameCost: 1000000000000000000');
    
    console.log('\n💡 如果Remix IDE输入框有问题，请尝试:');
    console.log('1. 清空字段后重新输入');
    console.log('2. 检查输入框是否有字符限制');
    console.log('3. 尝试复制粘贴完整地址');
}

main().catch(console.error); 
 
 
 