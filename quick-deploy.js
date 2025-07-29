// 🚀 MAO游戏快速部署脚本 - 在浏览器控制台运行

console.log('🚀 开始MAO游戏快速部署...');

// 配置信息
const CONFIG = {
    trustedOwner: "0xd0dC6Ff0eA6a27a0a4Ba0002F019d0E1b9666c28",
    admins: [
        "0xd0dC6Ff0eA6a27a0a4Ba0002F019d0E1b9666c28",
        "0x4f05108dEF45CdE35Bc38F73B6a95C74b96a16E7",
        "0x8300b4276Ac4DBbB8e73C0E99E4179D594b71eB5",
        "0x24c8fE3a662C58c6Ae589A9Aca8060B4741a24a5",
        "0x64294e2f66AB7221ecC8FAeF418cdA75E215A053"
    ],
    maoToken: "0x22f49bcb3dad370a9268ba3fca33cb037ca3d022",
    piToken: "0xfd4680e25e05b3435c7f698668d1ce80d2a9f444"
};

async function quickDeploy() {
    try {
        // 检查MetaMask
        if (typeof window.ethereum === 'undefined') {
            throw new Error('请先安装MetaMask!');
        }
        
        console.log('✅ 检测到MetaMask');
        
        // 连接钱包
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        console.log('✅ 钱包连接成功:', accounts[0]);
        
        // 检查网络
        const chainId = await window.ethereum.request({
            method: 'eth_chainId'
        });
        
        if (chainId !== '0xED5') { // 3797 in hex
            console.log('🔄 切换到AlveyChain网络...');
            
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xED5' }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xED5',
                            chainName: 'AlveyChain',
                            rpcUrls: ['https://elves-core2.alvey.io'],
                            nativeCurrency: {
                                name: 'ALV',
                                symbol: 'ALV',
                                decimals: 18
                            }
                        }]
                    });
                }
            }
        }
        
        console.log('✅ 网络设置正确');
        console.log('🎯 所有准备工作完成！');
        console.log('');
        console.log('📋 下一步操作：');
        console.log('1. 打开 https://remix.ethereum.org');
        console.log('2. 创建新文件 UltraSecureWheelGame.sol');
        console.log('3. 复制合约代码进行部署');
        console.log('');
        console.log('🔧 构造函数参数：');
        console.log('maoToken:', CONFIG.maoToken);
        console.log('piToken:', CONFIG.piToken);
        console.log('admins:', CONFIG.admins);
        console.log('trustedOwner:', CONFIG.trustedOwner);
        
        return true;
        
    } catch (error) {
        console.error('❌ 部署失败:', error.message);
        return false;
    }
}

// 执行部署
quickDeploy(); 