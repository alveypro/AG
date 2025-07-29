const { ethers } = require("hardhat");

async function queryContractAddresses() {
    console.log("🔍 开始查询合约钱包地址信息...");
    
    // 合约地址
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    // 合约ABI（只包含查询函数）
    const CONTRACT_ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)",
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)",
        "function hasRole(bytes32,address) view returns (bool)",
        "function getRoleMember(bytes32,uint256) view returns (address)",
        "function getRoleMemberCount(bytes32) view returns (uint256)"
    ];
    
    try {
        // 连接到AlveyChain网络
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        
        // 创建合约实例
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("🌐 网络: AlveyChain");
        console.log("");
        
        // 查询代币地址
        console.log("🪙 代币地址:");
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        // 查询钱包地址
        console.log("💰 钱包地址:");
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        // 查询管理员信息
        console.log("👥 管理员信息:");
        const adminCount = await contract.adminCount();
        console.log("   管理员数量:", adminCount.toString());
        
        // 尝试获取管理员地址（如果合约支持）
        try {
            const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
            const memberCount = await contract.getRoleMemberCount(ADMIN_ROLE);
            console.log("   角色成员数量:", memberCount.toString());
            
            console.log("   管理员地址列表:");
            for (let i = 0; i < memberCount; i++) {
                try {
                    const member = await contract.getRoleMember(ADMIN_ROLE, i);
                    console.log(`     ${i + 1}. ${member}`);
                } catch (error) {
                    console.log(`     ${i + 1}. 无法获取第${i + 1}个管理员地址`);
                }
            }
        } catch (error) {
            console.log("   无法获取管理员地址列表，请手动查询");
        }
        console.log("");
        
        // 查询游戏配置
        console.log("🎮 游戏配置:");
        try {
            const maoGameCost = await contract.maoGameCost();
            const piGameCost = await contract.piGameCost();
            console.log("   MAO游戏费用:", ethers.formatEther(maoGameCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piGameCost), "PI");
        } catch (error) {
            console.log("   无法获取游戏费用配置");
        }
        
        // 查询分配比例
        try {
            const burnPercentage = await contract.BURN_PERCENTAGE();
            const marketingPercentage = await contract.MARKETING_PERCENTAGE();
            const contractPercentage = await contract.CONTRACT_PERCENTAGE();
            console.log("   销毁比例:", burnPercentage.toString(), "%");
            console.log("   营销比例:", marketingPercentage.toString(), "%");
            console.log("   合约比例:", contractPercentage.toString(), "%");
        } catch (error) {
            console.log("   无法获取分配比例");
        }
        console.log("");
        
        // 查询合约余额
        console.log("💎 合约余额:");
        try {
            const maoBalance = await contract.getContractBalance(maoToken);
            const piBalance = await contract.getContractBalance(piToken);
            console.log("   MAO余额:", ethers.formatEther(maoBalance), "MAO");
            console.log("   PI余额:", ethers.formatEther(piBalance), "PI");
        } catch (error) {
            console.log("   无法获取合约余额");
        }
        console.log("");
        
        // 生成查询报告
        const report = {
            contractAddress: CONTRACT_ADDRESS,
            network: "AlveyChain",
            queryTime: new Date().toISOString(),
            tokens: {
                maoToken: maoToken,
                piToken: piToken
            },
            wallets: {
                marketingWallet: marketingWallet,
                prizePoolWallet: prizePoolWallet,
                profitWallet: profitWallet
            },
            adminInfo: {
                adminCount: adminCount.toString()
            },
            gameConfig: {
                maoGameCost: ethers.formatEther(await contract.maoGameCost()),
                piGameCost: ethers.formatEther(await contract.piGameCost())
            }
        };
        
        console.log("📊 查询报告:");
        console.log(JSON.stringify(report, null, 2));
        
        // 保存报告到文件
        const fs = require('fs');
        fs.writeFileSync('contract-addresses-report.json', JSON.stringify(report, null, 2));
        console.log("\n💾 报告已保存到 contract-addresses-report.json");
        
        console.log("\n✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
        
        if (error.message.includes("network")) {
            console.log("\n💡 提示: 请确保网络连接正常，或检查RPC地址是否正确");
        }
        
        if (error.message.includes("contract")) {
            console.log("\n💡 提示: 请检查合约地址是否正确，或合约是否已部署");
        }
    }
}

// 运行查询
queryContractAddresses()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 

async function queryContractAddresses() {
    console.log("🔍 开始查询合约钱包地址信息...");
    
    // 合约地址
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    // 合约ABI（只包含查询函数）
    const CONTRACT_ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)",
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)",
        "function hasRole(bytes32,address) view returns (bool)",
        "function getRoleMember(bytes32,uint256) view returns (address)",
        "function getRoleMemberCount(bytes32) view returns (uint256)"
    ];
    
    try {
        // 连接到AlveyChain网络
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        
        // 创建合约实例
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("🌐 网络: AlveyChain");
        console.log("");
        
        // 查询代币地址
        console.log("🪙 代币地址:");
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        // 查询钱包地址
        console.log("💰 钱包地址:");
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        // 查询管理员信息
        console.log("👥 管理员信息:");
        const adminCount = await contract.adminCount();
        console.log("   管理员数量:", adminCount.toString());
        
        // 尝试获取管理员地址（如果合约支持）
        try {
            const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
            const memberCount = await contract.getRoleMemberCount(ADMIN_ROLE);
            console.log("   角色成员数量:", memberCount.toString());
            
            console.log("   管理员地址列表:");
            for (let i = 0; i < memberCount; i++) {
                try {
                    const member = await contract.getRoleMember(ADMIN_ROLE, i);
                    console.log(`     ${i + 1}. ${member}`);
                } catch (error) {
                    console.log(`     ${i + 1}. 无法获取第${i + 1}个管理员地址`);
                }
            }
        } catch (error) {
            console.log("   无法获取管理员地址列表，请手动查询");
        }
        console.log("");
        
        // 查询游戏配置
        console.log("🎮 游戏配置:");
        try {
            const maoGameCost = await contract.maoGameCost();
            const piGameCost = await contract.piGameCost();
            console.log("   MAO游戏费用:", ethers.formatEther(maoGameCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piGameCost), "PI");
        } catch (error) {
            console.log("   无法获取游戏费用配置");
        }
        
        // 查询分配比例
        try {
            const burnPercentage = await contract.BURN_PERCENTAGE();
            const marketingPercentage = await contract.MARKETING_PERCENTAGE();
            const contractPercentage = await contract.CONTRACT_PERCENTAGE();
            console.log("   销毁比例:", burnPercentage.toString(), "%");
            console.log("   营销比例:", marketingPercentage.toString(), "%");
            console.log("   合约比例:", contractPercentage.toString(), "%");
        } catch (error) {
            console.log("   无法获取分配比例");
        }
        console.log("");
        
        // 查询合约余额
        console.log("💎 合约余额:");
        try {
            const maoBalance = await contract.getContractBalance(maoToken);
            const piBalance = await contract.getContractBalance(piToken);
            console.log("   MAO余额:", ethers.formatEther(maoBalance), "MAO");
            console.log("   PI余额:", ethers.formatEther(piBalance), "PI");
        } catch (error) {
            console.log("   无法获取合约余额");
        }
        console.log("");
        
        // 生成查询报告
        const report = {
            contractAddress: CONTRACT_ADDRESS,
            network: "AlveyChain",
            queryTime: new Date().toISOString(),
            tokens: {
                maoToken: maoToken,
                piToken: piToken
            },
            wallets: {
                marketingWallet: marketingWallet,
                prizePoolWallet: prizePoolWallet,
                profitWallet: profitWallet
            },
            adminInfo: {
                adminCount: adminCount.toString()
            },
            gameConfig: {
                maoGameCost: ethers.formatEther(await contract.maoGameCost()),
                piGameCost: ethers.formatEther(await contract.piGameCost())
            }
        };
        
        console.log("📊 查询报告:");
        console.log(JSON.stringify(report, null, 2));
        
        // 保存报告到文件
        const fs = require('fs');
        fs.writeFileSync('contract-addresses-report.json', JSON.stringify(report, null, 2));
        console.log("\n💾 报告已保存到 contract-addresses-report.json");
        
        console.log("\n✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
        
        if (error.message.includes("network")) {
            console.log("\n💡 提示: 请确保网络连接正常，或检查RPC地址是否正确");
        }
        
        if (error.message.includes("contract")) {
            console.log("\n💡 提示: 请检查合约地址是否正确，或合约是否已部署");
        }
    }
}

// 运行查询
queryContractAddresses()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 

async function queryContractAddresses() {
    console.log("🔍 开始查询合约钱包地址信息...");
    
    // 合约地址
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    // 合约ABI（只包含查询函数）
    const CONTRACT_ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)",
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)",
        "function hasRole(bytes32,address) view returns (bool)",
        "function getRoleMember(bytes32,uint256) view returns (address)",
        "function getRoleMemberCount(bytes32) view returns (uint256)"
    ];
    
    try {
        // 连接到AlveyChain网络
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        
        // 创建合约实例
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("🌐 网络: AlveyChain");
        console.log("");
        
        // 查询代币地址
        console.log("🪙 代币地址:");
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        // 查询钱包地址
        console.log("💰 钱包地址:");
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        // 查询管理员信息
        console.log("👥 管理员信息:");
        const adminCount = await contract.adminCount();
        console.log("   管理员数量:", adminCount.toString());
        
        // 尝试获取管理员地址（如果合约支持）
        try {
            const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
            const memberCount = await contract.getRoleMemberCount(ADMIN_ROLE);
            console.log("   角色成员数量:", memberCount.toString());
            
            console.log("   管理员地址列表:");
            for (let i = 0; i < memberCount; i++) {
                try {
                    const member = await contract.getRoleMember(ADMIN_ROLE, i);
                    console.log(`     ${i + 1}. ${member}`);
                } catch (error) {
                    console.log(`     ${i + 1}. 无法获取第${i + 1}个管理员地址`);
                }
            }
        } catch (error) {
            console.log("   无法获取管理员地址列表，请手动查询");
        }
        console.log("");
        
        // 查询游戏配置
        console.log("🎮 游戏配置:");
        try {
            const maoGameCost = await contract.maoGameCost();
            const piGameCost = await contract.piGameCost();
            console.log("   MAO游戏费用:", ethers.formatEther(maoGameCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piGameCost), "PI");
        } catch (error) {
            console.log("   无法获取游戏费用配置");
        }
        
        // 查询分配比例
        try {
            const burnPercentage = await contract.BURN_PERCENTAGE();
            const marketingPercentage = await contract.MARKETING_PERCENTAGE();
            const contractPercentage = await contract.CONTRACT_PERCENTAGE();
            console.log("   销毁比例:", burnPercentage.toString(), "%");
            console.log("   营销比例:", marketingPercentage.toString(), "%");
            console.log("   合约比例:", contractPercentage.toString(), "%");
        } catch (error) {
            console.log("   无法获取分配比例");
        }
        console.log("");
        
        // 查询合约余额
        console.log("💎 合约余额:");
        try {
            const maoBalance = await contract.getContractBalance(maoToken);
            const piBalance = await contract.getContractBalance(piToken);
            console.log("   MAO余额:", ethers.formatEther(maoBalance), "MAO");
            console.log("   PI余额:", ethers.formatEther(piBalance), "PI");
        } catch (error) {
            console.log("   无法获取合约余额");
        }
        console.log("");
        
        // 生成查询报告
        const report = {
            contractAddress: CONTRACT_ADDRESS,
            network: "AlveyChain",
            queryTime: new Date().toISOString(),
            tokens: {
                maoToken: maoToken,
                piToken: piToken
            },
            wallets: {
                marketingWallet: marketingWallet,
                prizePoolWallet: prizePoolWallet,
                profitWallet: profitWallet
            },
            adminInfo: {
                adminCount: adminCount.toString()
            },
            gameConfig: {
                maoGameCost: ethers.formatEther(await contract.maoGameCost()),
                piGameCost: ethers.formatEther(await contract.piGameCost())
            }
        };
        
        console.log("📊 查询报告:");
        console.log(JSON.stringify(report, null, 2));
        
        // 保存报告到文件
        const fs = require('fs');
        fs.writeFileSync('contract-addresses-report.json', JSON.stringify(report, null, 2));
        console.log("\n💾 报告已保存到 contract-addresses-report.json");
        
        console.log("\n✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
        
        if (error.message.includes("network")) {
            console.log("\n💡 提示: 请确保网络连接正常，或检查RPC地址是否正确");
        }
        
        if (error.message.includes("contract")) {
            console.log("\n💡 提示: 请检查合约地址是否正确，或合约是否已部署");
        }
    }
}

// 运行查询
queryContractAddresses()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 

async function queryContractAddresses() {
    console.log("🔍 开始查询合约钱包地址信息...");
    
    // 合约地址
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    // 合约ABI（只包含查询函数）
    const CONTRACT_ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)",
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)",
        "function hasRole(bytes32,address) view returns (bool)",
        "function getRoleMember(bytes32,uint256) view returns (address)",
        "function getRoleMemberCount(bytes32) view returns (uint256)"
    ];
    
    try {
        // 连接到AlveyChain网络
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        
        // 创建合约实例
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("🌐 网络: AlveyChain");
        console.log("");
        
        // 查询代币地址
        console.log("🪙 代币地址:");
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        // 查询钱包地址
        console.log("💰 钱包地址:");
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        // 查询管理员信息
        console.log("👥 管理员信息:");
        const adminCount = await contract.adminCount();
        console.log("   管理员数量:", adminCount.toString());
        
        // 尝试获取管理员地址（如果合约支持）
        try {
            const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
            const memberCount = await contract.getRoleMemberCount(ADMIN_ROLE);
            console.log("   角色成员数量:", memberCount.toString());
            
            console.log("   管理员地址列表:");
            for (let i = 0; i < memberCount; i++) {
                try {
                    const member = await contract.getRoleMember(ADMIN_ROLE, i);
                    console.log(`     ${i + 1}. ${member}`);
                } catch (error) {
                    console.log(`     ${i + 1}. 无法获取第${i + 1}个管理员地址`);
                }
            }
        } catch (error) {
            console.log("   无法获取管理员地址列表，请手动查询");
        }
        console.log("");
        
        // 查询游戏配置
        console.log("🎮 游戏配置:");
        try {
            const maoGameCost = await contract.maoGameCost();
            const piGameCost = await contract.piGameCost();
            console.log("   MAO游戏费用:", ethers.formatEther(maoGameCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piGameCost), "PI");
        } catch (error) {
            console.log("   无法获取游戏费用配置");
        }
        
        // 查询分配比例
        try {
            const burnPercentage = await contract.BURN_PERCENTAGE();
            const marketingPercentage = await contract.MARKETING_PERCENTAGE();
            const contractPercentage = await contract.CONTRACT_PERCENTAGE();
            console.log("   销毁比例:", burnPercentage.toString(), "%");
            console.log("   营销比例:", marketingPercentage.toString(), "%");
            console.log("   合约比例:", contractPercentage.toString(), "%");
        } catch (error) {
            console.log("   无法获取分配比例");
        }
        console.log("");
        
        // 查询合约余额
        console.log("💎 合约余额:");
        try {
            const maoBalance = await contract.getContractBalance(maoToken);
            const piBalance = await contract.getContractBalance(piToken);
            console.log("   MAO余额:", ethers.formatEther(maoBalance), "MAO");
            console.log("   PI余额:", ethers.formatEther(piBalance), "PI");
        } catch (error) {
            console.log("   无法获取合约余额");
        }
        console.log("");
        
        // 生成查询报告
        const report = {
            contractAddress: CONTRACT_ADDRESS,
            network: "AlveyChain",
            queryTime: new Date().toISOString(),
            tokens: {
                maoToken: maoToken,
                piToken: piToken
            },
            wallets: {
                marketingWallet: marketingWallet,
                prizePoolWallet: prizePoolWallet,
                profitWallet: profitWallet
            },
            adminInfo: {
                adminCount: adminCount.toString()
            },
            gameConfig: {
                maoGameCost: ethers.formatEther(await contract.maoGameCost()),
                piGameCost: ethers.formatEther(await contract.piGameCost())
            }
        };
        
        console.log("📊 查询报告:");
        console.log(JSON.stringify(report, null, 2));
        
        // 保存报告到文件
        const fs = require('fs');
        fs.writeFileSync('contract-addresses-report.json', JSON.stringify(report, null, 2));
        console.log("\n💾 报告已保存到 contract-addresses-report.json");
        
        console.log("\n✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
        
        if (error.message.includes("network")) {
            console.log("\n💡 提示: 请确保网络连接正常，或检查RPC地址是否正确");
        }
        
        if (error.message.includes("contract")) {
            console.log("\n💡 提示: 请检查合约地址是否正确，或合约是否已部署");
        }
    }
}

// 运行查询
queryContractAddresses()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 

async function queryContractAddresses() {
    console.log("🔍 开始查询合约钱包地址信息...");
    
    // 合约地址
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    // 合约ABI（只包含查询函数）
    const CONTRACT_ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)",
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)",
        "function hasRole(bytes32,address) view returns (bool)",
        "function getRoleMember(bytes32,uint256) view returns (address)",
        "function getRoleMemberCount(bytes32) view returns (uint256)"
    ];
    
    try {
        // 连接到AlveyChain网络
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        
        // 创建合约实例
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("🌐 网络: AlveyChain");
        console.log("");
        
        // 查询代币地址
        console.log("🪙 代币地址:");
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        // 查询钱包地址
        console.log("💰 钱包地址:");
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        // 查询管理员信息
        console.log("👥 管理员信息:");
        const adminCount = await contract.adminCount();
        console.log("   管理员数量:", adminCount.toString());
        
        // 尝试获取管理员地址（如果合约支持）
        try {
            const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
            const memberCount = await contract.getRoleMemberCount(ADMIN_ROLE);
            console.log("   角色成员数量:", memberCount.toString());
            
            console.log("   管理员地址列表:");
            for (let i = 0; i < memberCount; i++) {
                try {
                    const member = await contract.getRoleMember(ADMIN_ROLE, i);
                    console.log(`     ${i + 1}. ${member}`);
                } catch (error) {
                    console.log(`     ${i + 1}. 无法获取第${i + 1}个管理员地址`);
                }
            }
        } catch (error) {
            console.log("   无法获取管理员地址列表，请手动查询");
        }
        console.log("");
        
        // 查询游戏配置
        console.log("🎮 游戏配置:");
        try {
            const maoGameCost = await contract.maoGameCost();
            const piGameCost = await contract.piGameCost();
            console.log("   MAO游戏费用:", ethers.formatEther(maoGameCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piGameCost), "PI");
        } catch (error) {
            console.log("   无法获取游戏费用配置");
        }
        
        // 查询分配比例
        try {
            const burnPercentage = await contract.BURN_PERCENTAGE();
            const marketingPercentage = await contract.MARKETING_PERCENTAGE();
            const contractPercentage = await contract.CONTRACT_PERCENTAGE();
            console.log("   销毁比例:", burnPercentage.toString(), "%");
            console.log("   营销比例:", marketingPercentage.toString(), "%");
            console.log("   合约比例:", contractPercentage.toString(), "%");
        } catch (error) {
            console.log("   无法获取分配比例");
        }
        console.log("");
        
        // 查询合约余额
        console.log("💎 合约余额:");
        try {
            const maoBalance = await contract.getContractBalance(maoToken);
            const piBalance = await contract.getContractBalance(piToken);
            console.log("   MAO余额:", ethers.formatEther(maoBalance), "MAO");
            console.log("   PI余额:", ethers.formatEther(piBalance), "PI");
        } catch (error) {
            console.log("   无法获取合约余额");
        }
        console.log("");
        
        // 生成查询报告
        const report = {
            contractAddress: CONTRACT_ADDRESS,
            network: "AlveyChain",
            queryTime: new Date().toISOString(),
            tokens: {
                maoToken: maoToken,
                piToken: piToken
            },
            wallets: {
                marketingWallet: marketingWallet,
                prizePoolWallet: prizePoolWallet,
                profitWallet: profitWallet
            },
            adminInfo: {
                adminCount: adminCount.toString()
            },
            gameConfig: {
                maoGameCost: ethers.formatEther(await contract.maoGameCost()),
                piGameCost: ethers.formatEther(await contract.piGameCost())
            }
        };
        
        console.log("📊 查询报告:");
        console.log(JSON.stringify(report, null, 2));
        
        // 保存报告到文件
        const fs = require('fs');
        fs.writeFileSync('contract-addresses-report.json', JSON.stringify(report, null, 2));
        console.log("\n💾 报告已保存到 contract-addresses-report.json");
        
        console.log("\n✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
        
        if (error.message.includes("network")) {
            console.log("\n💡 提示: 请确保网络连接正常，或检查RPC地址是否正确");
        }
        
        if (error.message.includes("contract")) {
            console.log("\n💡 提示: 请检查合约地址是否正确，或合约是否已部署");
        }
    }
}

// 运行查询
queryContractAddresses()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 

async function queryContractAddresses() {
    console.log("🔍 开始查询合约钱包地址信息...");
    
    // 合约地址
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    // 合约ABI（只包含查询函数）
    const CONTRACT_ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)",
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)",
        "function hasRole(bytes32,address) view returns (bool)",
        "function getRoleMember(bytes32,uint256) view returns (address)",
        "function getRoleMemberCount(bytes32) view returns (uint256)"
    ];
    
    try {
        // 连接到AlveyChain网络
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        
        // 创建合约实例
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("🌐 网络: AlveyChain");
        console.log("");
        
        // 查询代币地址
        console.log("🪙 代币地址:");
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        // 查询钱包地址
        console.log("💰 钱包地址:");
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        // 查询管理员信息
        console.log("👥 管理员信息:");
        const adminCount = await contract.adminCount();
        console.log("   管理员数量:", adminCount.toString());
        
        // 尝试获取管理员地址（如果合约支持）
        try {
            const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
            const memberCount = await contract.getRoleMemberCount(ADMIN_ROLE);
            console.log("   角色成员数量:", memberCount.toString());
            
            console.log("   管理员地址列表:");
            for (let i = 0; i < memberCount; i++) {
                try {
                    const member = await contract.getRoleMember(ADMIN_ROLE, i);
                    console.log(`     ${i + 1}. ${member}`);
                } catch (error) {
                    console.log(`     ${i + 1}. 无法获取第${i + 1}个管理员地址`);
                }
            }
        } catch (error) {
            console.log("   无法获取管理员地址列表，请手动查询");
        }
        console.log("");
        
        // 查询游戏配置
        console.log("🎮 游戏配置:");
        try {
            const maoGameCost = await contract.maoGameCost();
            const piGameCost = await contract.piGameCost();
            console.log("   MAO游戏费用:", ethers.formatEther(maoGameCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piGameCost), "PI");
        } catch (error) {
            console.log("   无法获取游戏费用配置");
        }
        
        // 查询分配比例
        try {
            const burnPercentage = await contract.BURN_PERCENTAGE();
            const marketingPercentage = await contract.MARKETING_PERCENTAGE();
            const contractPercentage = await contract.CONTRACT_PERCENTAGE();
            console.log("   销毁比例:", burnPercentage.toString(), "%");
            console.log("   营销比例:", marketingPercentage.toString(), "%");
            console.log("   合约比例:", contractPercentage.toString(), "%");
        } catch (error) {
            console.log("   无法获取分配比例");
        }
        console.log("");
        
        // 查询合约余额
        console.log("💎 合约余额:");
        try {
            const maoBalance = await contract.getContractBalance(maoToken);
            const piBalance = await contract.getContractBalance(piToken);
            console.log("   MAO余额:", ethers.formatEther(maoBalance), "MAO");
            console.log("   PI余额:", ethers.formatEther(piBalance), "PI");
        } catch (error) {
            console.log("   无法获取合约余额");
        }
        console.log("");
        
        // 生成查询报告
        const report = {
            contractAddress: CONTRACT_ADDRESS,
            network: "AlveyChain",
            queryTime: new Date().toISOString(),
            tokens: {
                maoToken: maoToken,
                piToken: piToken
            },
            wallets: {
                marketingWallet: marketingWallet,
                prizePoolWallet: prizePoolWallet,
                profitWallet: profitWallet
            },
            adminInfo: {
                adminCount: adminCount.toString()
            },
            gameConfig: {
                maoGameCost: ethers.formatEther(await contract.maoGameCost()),
                piGameCost: ethers.formatEther(await contract.piGameCost())
            }
        };
        
        console.log("📊 查询报告:");
        console.log(JSON.stringify(report, null, 2));
        
        // 保存报告到文件
        const fs = require('fs');
        fs.writeFileSync('contract-addresses-report.json', JSON.stringify(report, null, 2));
        console.log("\n💾 报告已保存到 contract-addresses-report.json");
        
        console.log("\n✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
        
        if (error.message.includes("network")) {
            console.log("\n💡 提示: 请确保网络连接正常，或检查RPC地址是否正确");
        }
        
        if (error.message.includes("contract")) {
            console.log("\n💡 提示: 请检查合约地址是否正确，或合约是否已部署");
        }
    }
}

// 运行查询
queryContractAddresses()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 