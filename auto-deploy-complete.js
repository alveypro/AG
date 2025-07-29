// 🤖 MAO游戏完全自动化部署工具
// 只需要运行一次，自动完成所有部署步骤

const { ethers } = require('ethers');
const fs = require('fs');

class AutoDeployComplete {
    constructor() {
        this.config = {
            trustedOwner: "0xd0dC6Ff0eA6a27a0a4Ba0002F019d0E1b9666c28",
            admins: [
                "0xd0dC6Ff0eA6a27a0a4Ba0002F019d0E1b9666c28",
                "0x4f05108dEF45CdE35Bc38F73B6a95C74b96a16E7",
                "0x8300b4276Ac4DBbB8e73C0E99E4179D594b71eB5",
                "0x24c8fE3a662C58c6Ae589A9Aca8060B4741a24a5",
                "0x64294e2f66AB7221ecC8FAeF418cdA75E215A053"
            ],
            maoToken: "0x22f49bcb3dad370a9268ba3fca33cb037ca3d022",
            piToken: "0xfd4680e25e05b3435c7f698668d1ce80d2a9f444",
            maliciousAddress: "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7",
            network: {
                name: "AlveyChain",
                rpcUrl: "https://elves-core2.alvey.io",
                chainId: 3797,
                symbol: "ALV"
            }
        };
        
        console.log('🤖 MAO游戏完全自动化部署工具启动');
        console.log('🎯 目标：一键完成所有部署步骤');
        console.log('');
    }
    
    async deployContract() {
        try {
            console.log('🚀 开始自动化部署...');
            
            // 检查MetaMask连接
            if (typeof window !== 'undefined' && window.ethereum) {
                console.log('✅ 检测到MetaMask');
                
                // 请求账户连接
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                console.log('✅ 钱包连接成功:', accounts[0]);
                
                // 切换到AlveyChain网络
                await this.switchToAlveyChain();
                
                // 创建provider和signer
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                
                // 部署合约
                const contractAddress = await this.deployUltraSecureContract(signer);
                
                // 生成配置
                await this.generateFinalConfig(contractAddress);
                
                console.log('🎉 自动化部署完成！');
                return contractAddress;
                
            } else {
                throw new Error('未检测到MetaMask钱包');
            }
            
        } catch (error) {
            console.error('❌ 自动化部署失败:', error);
            throw error;
        }
    }
    
    async switchToAlveyChain() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xED5' }], // 3797 in hex
            });
            console.log('✅ 已切换到AlveyChain网络');
        } catch (switchError) {
            // 如果网络不存在，添加网络
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xED5',
                        chainName: 'AlveyChain',
                        rpcUrls: [this.config.network.rpcUrl],
                        nativeCurrency: {
                            name: 'ALV',
                            symbol: 'ALV',
                            decimals: 18
                        }
                    }]
                });
                console.log('✅ AlveyChain网络已添加并切换');
            } else {
                throw switchError;
            }
        }
    }
    
    async deployUltraSecureContract(signer) {
        console.log('📝 准备部署UltraSecureWheelGame合约...');
        
        // 合约ABI和字节码
        const contractABI = [
            "constructor(address _maoToken, address _piToken, address[] memory _admins, address _trustedOwner)",
            "function getAdminCount() external view returns (uint256)",
            "function isBlacklisted(address user) external view returns (bool)",
            "function getContractBalances() external view returns (uint256 maoBalance, uint256 piBalance)"
        ];
        
        // 创建合约工厂
        const contractFactory = new ethers.ContractFactory(
            contractABI,
            this.getContractBytecode(),
            signer
        );
        
        console.log('🔧 使用以下参数部署合约:');
        console.log('MAO Token:', this.config.maoToken);
        console.log('PI Token:', this.config.piToken);
        console.log('管理员数量:', this.config.admins.length);
        console.log('信任Owner:', this.config.trustedOwner);
        
        // 部署合约
        const contract = await contractFactory.deploy(
            this.config.maoToken,
            this.config.piToken,
            this.config.admins,
            this.config.trustedOwner
        );
        
        console.log('⏳ 等待合约部署确认...');
        await contract.deployed();
        
        console.log('✅ 合约部署成功!');
        console.log('📍 新合约地址:', contract.address);
        
        return contract.address;
    }
    
    getContractBytecode() {
        // 这里应该是UltraSecureWheelGame的编译后字节码
        // 由于字节码很长，这里用占位符表示
        return "0x608060405234801561001057600080fd5b50..."; // 实际字节码会很长
    }
    
    async generateFinalConfig(contractAddress) {
        console.log('📋 生成最终配置文件...');
        
        const config = {
            deploymentSuccess: true,
            contractAddress: contractAddress,
            deployedAt: new Date().toISOString(),
            network: this.config.network.name,
            chainId: this.config.network.chainId,
            deployer: await window.ethereum.request({method: 'eth_accounts'}),
            admins: this.config.admins,
            tokens: {
                mao: this.config.maoToken,
                pi: this.config.piToken
            },
            securityFeatures: {
                multiSig: "5/3",
                timelock: "24 hours",
                blacklist: [this.config.maliciousAddress],
                reentracyGuard: true,
                accessControl: true,
                pausable: true
            },
            nextSteps: [
                `向合约 ${contractAddress} 充值代币`,
                "MAO代币: 至少 200,000 MAO",
                "PI代币: 至少 2,000,000 PI",
                "测试游戏功能",
                "正式上线"
            ],
            warnings: [
                "请立即备份此配置文件",
                "向新合约充值前请先小额测试",
                "确保所有管理员钱包都安全保存"
            ]
        };
        
        // 保存配置文件
        const configBlob = new Blob([JSON.stringify(config, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(configBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mao-game-deployment-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ 配置文件已生成并下载');
        
        // 更新前端配置
        await this.updateFrontendConfig(contractAddress);
        
        return config;
    }
    
    async updateFrontendConfig(contractAddress) {
        console.log('🎨 更新前端配置...');
        
        // 生成新的游戏前端配置
        const frontendConfig = `
// 🎮 MAO游戏新配置 - 自动生成
const GAME_CONFIG = {
    CONTRACT_ADDRESS: "${contractAddress}",
    NETWORK: "${this.config.network.name}",
    CHAIN_ID: ${this.config.network.chainId},
    RPC_URL: "${this.config.network.rpcUrl}",
    TOKENS: {
        MAO: "${this.config.maoToken}",
        PI: "${this.config.piToken}"
    },
    ADMINS: [
        "${this.config.admins.join('",\n        "')}"
    ],
    BLACKLIST: ["${this.config.maliciousAddress}"],
    SECURITY_LEVEL: "ULTRA",
    DEPLOYED_AT: "${new Date().toISOString()}"
};

// 导出配置
if (typeof module !== 'undefined') {
    module.exports = GAME_CONFIG;
}
        `;
        
        // 下载配置文件
        const configBlob = new Blob([frontendConfig], { type: 'text/javascript' });
        const url = URL.createObjectURL(configBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'game-config.js';
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ 前端配置文件已生成');
    }
    
    // 显示最终结果
    displayResults(contractAddress) {
        console.log('\n🎉 ================ 部署完成 ================');
        console.log('🛡️ MAO游戏超级安全系统部署成功！');
        console.log('');
        console.log('📍 新合约地址:', contractAddress);
        console.log('🔐 管理员数量:', this.config.admins.length);
        console.log('🚫 恶意地址已拉黑:', this.config.maliciousAddress);
        console.log('');
        console.log('🎯 下一步操作:');
        console.log('1. 向新合约充值 MAO 和 PI 代币');
        console.log('2. 进行小额测试验证');
        console.log('3. 正式启用新游戏系统');
        console.log('');
        console.log('🛡️ 安全特性:');
        console.log('✅ 5/3多重签名保护');
        console.log('✅ 24小时时间锁机制');
        console.log('✅ 自动黑名单拦截');
        console.log('✅ 重入攻击防护');
        console.log('✅ 智能限额控制');
        console.log('==========================================');
    }
}

// 一键启动部署
async function startAutoDeploy() {
    const deployer = new AutoDeployComplete();
    try {
        const contractAddress = await deployer.deployContract();
        deployer.displayResults(contractAddress);
        alert(`🎉 部署成功！\n新合约地址: ${contractAddress}\n\n请查看控制台获取详细信息。`);
    } catch (error) {
        alert(`❌ 部署失败: ${error.message}\n\n请查看控制台获取详细错误信息。`);
    }
}

// 如果在浏览器环境中，提供全局函数
if (typeof window !== 'undefined') {
    window.startAutoDeploy = startAutoDeploy;
    window.AutoDeployComplete = AutoDeployComplete;
}

// Node.js 环境导出
if (typeof module !== 'undefined') {
    module.exports = { AutoDeployComplete, startAutoDeploy };
}

console.log('🚀 自动化部署工具已准备就绪！');
console.log('💡 在浏览器控制台运行: startAutoDeploy()'); 