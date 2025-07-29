const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 部署 UltraSecureWheelGameV6_Final 合约...");
    
    // 合约地址
    const MAO_TOKEN = "0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022";
    const PI_TOKEN = "0xFd4680e25E05b3435C7F698668d1ce80D2a9F444";
    
    // 管理员地址
    const ADMIN_ADDRESSES = [
        "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408", // 主管理员
        "0x861A48051eFaA1876D4B38904516C9F7bbCca36d", // 营销钱包
        "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7", // 管理员1
        "0xE15881Fc413c6cd47a512C24608F94Fa2896b374", // 管理员2
        "0x1234567890123456789012345678901234567890"  // 管理员3
    ];
    
    // 钱包地址
    const TRUSTED_OWNER = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PRIZE_POOL_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PROFIT_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const MARKETING_WALLET = "0x861A48051eFaA1876D4B38904516C9F7bbCca36d";
    
    try {
        // 获取部署者
        const [deployer] = await ethers.getSigners();
        console.log("📋 部署者地址:", deployer.address);
        
        // 检查余额
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log("💰 部署者余额:", ethers.formatEther(balance), "ALV");
        
        if (balance < ethers.parseEther("0.1")) {
            throw new Error("余额不足，需要至少0.1 ALV");
        }
        
        // 部署合约
        console.log("🔨 开始部署合约...");
        const GameContract = await ethers.getContractFactory("UltraSecureWheelGameV6_Final");
        
        const gameContract = await GameContract.deploy(
            MAO_TOKEN,
            PI_TOKEN,
            ADMIN_ADDRESSES,
            TRUSTED_OWNER,
            PRIZE_POOL_WALLET,
            PROFIT_WALLET,
            MARKETING_WALLET
        );
        
        console.log("⏳ 等待合约部署确认...");
        await gameContract.waitForDeployment();
        
        const contractAddress = await gameContract.getAddress();
        console.log("✅ 合约部署成功！");
        console.log("📋 合约地址:", contractAddress);
        
        // 验证部署
        console.log("🔍 验证合约部署...");
        const code = await deployer.provider.getCode(contractAddress);
        if (code === "0x") {
            throw new Error("合约部署失败，地址没有代码");
        }
        console.log("✅ 合约验证成功！");
        
        // 显示合约信息
        console.log("\n📊 合约配置信息:");
        console.log("   MAO Token:", MAO_TOKEN);
        console.log("   PI Token:", PI_TOKEN);
        console.log("   Trusted Owner:", TRUSTED_OWNER);
        console.log("   Prize Pool Wallet:", PRIZE_POOL_WALLET);
        console.log("   Profit Wallet:", PROFIT_WALLET);
        console.log("   Marketing Wallet:", MARKETING_WALLET);
        console.log("   管理员数量:", ADMIN_ADDRESSES.length);
        
        // 显示奖励系统
        console.log("\n🏆 奖励系统配置:");
        console.log("   特等奖 (0.1%): 12000 MAO / 120000 PI (120倍)");
        console.log("   一等奖 (0.5%): 2500 MAO / 25000 PI (25倍)");
        console.log("   二等奖 (2%): 600 MAO / 6000 PI (6倍)");
        console.log("   三等奖 (5%): 250 MAO / 2500 PI (2.5倍)");
        console.log("   四等奖 (15%): 120 MAO / 1200 PI (1.2倍)");
        console.log("   安慰奖 (17.4%): 80 MAO / 800 PI (0.8倍)");
        
        console.log("\n🎯 游戏配置:");
        console.log("   MAO游戏费用: 100 MAO");
        console.log("   PI游戏费用: 1000 PI");
        console.log("   基础胜率: 40%");
        console.log("   最大胜率: 60%");
        
        console.log("\n💰 分配比例:");
        console.log("   销毁: 10%");
        console.log("   营销: 20%");
        console.log("   奖励池: 60%");
        console.log("   开发基金: 10%");
        
        console.log("\n🎉 部署完成！");
        console.log("📋 合约地址:", contractAddress);
        console.log("🌐 网络: AlveyChain (Chain ID: 3797)");
        
        // 保存部署信息
        const deploymentInfo = {
            contractAddress: contractAddress,
            network: "AlveyChain",
            chainId: 3797,
            deployer: deployer.address,
            deploymentTime: new Date().toISOString(),
            config: {
                maoToken: MAO_TOKEN,
                piToken: PI_TOKEN,
                trustedOwner: TRUSTED_OWNER,
                prizePoolWallet: PRIZE_POOL_WALLET,
                profitWallet: PROFIT_WALLET,
                marketingWallet: MARKETING_WALLET,
                adminAddresses: ADMIN_ADDRESSES
            },
            rewardSystem: {
                special: { probability: "0.1%", reward: "12000 MAO / 120000 PI", multiplier: "120x" },
                first: { probability: "0.5%", reward: "2500 MAO / 25000 PI", multiplier: "25x" },
                second: { probability: "2%", reward: "600 MAO / 6000 PI", multiplier: "6x" },
                third: { probability: "5%", reward: "250 MAO / 2500 PI", multiplier: "2.5x" },
                fourth: { probability: "15%", reward: "120 MAO / 1200 PI", multiplier: "1.2x" },
                consolation: { probability: "17.4%", reward: "80 MAO / 800 PI", multiplier: "0.8x" }
            }
        };
        
        console.log("\n📄 部署信息已保存");
        
    } catch (error) {
        console.error("❌ 部署失败:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 

async function main() {
    console.log("🚀 部署 UltraSecureWheelGameV6_Final 合约...");
    
    // 合约地址
    const MAO_TOKEN = "0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022";
    const PI_TOKEN = "0xFd4680e25E05b3435C7F698668d1ce80D2a9F444";
    
    // 管理员地址
    const ADMIN_ADDRESSES = [
        "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408", // 主管理员
        "0x861A48051eFaA1876D4B38904516C9F7bbCca36d", // 营销钱包
        "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7", // 管理员1
        "0xE15881Fc413c6cd47a512C24608F94Fa2896b374", // 管理员2
        "0x1234567890123456789012345678901234567890"  // 管理员3
    ];
    
    // 钱包地址
    const TRUSTED_OWNER = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PRIZE_POOL_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PROFIT_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const MARKETING_WALLET = "0x861A48051eFaA1876D4B38904516C9F7bbCca36d";
    
    try {
        // 获取部署者
        const [deployer] = await ethers.getSigners();
        console.log("📋 部署者地址:", deployer.address);
        
        // 检查余额
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log("💰 部署者余额:", ethers.formatEther(balance), "ALV");
        
        if (balance < ethers.parseEther("0.1")) {
            throw new Error("余额不足，需要至少0.1 ALV");
        }
        
        // 部署合约
        console.log("🔨 开始部署合约...");
        const GameContract = await ethers.getContractFactory("UltraSecureWheelGameV6_Final");
        
        const gameContract = await GameContract.deploy(
            MAO_TOKEN,
            PI_TOKEN,
            ADMIN_ADDRESSES,
            TRUSTED_OWNER,
            PRIZE_POOL_WALLET,
            PROFIT_WALLET,
            MARKETING_WALLET
        );
        
        console.log("⏳ 等待合约部署确认...");
        await gameContract.waitForDeployment();
        
        const contractAddress = await gameContract.getAddress();
        console.log("✅ 合约部署成功！");
        console.log("📋 合约地址:", contractAddress);
        
        // 验证部署
        console.log("🔍 验证合约部署...");
        const code = await deployer.provider.getCode(contractAddress);
        if (code === "0x") {
            throw new Error("合约部署失败，地址没有代码");
        }
        console.log("✅ 合约验证成功！");
        
        // 显示合约信息
        console.log("\n📊 合约配置信息:");
        console.log("   MAO Token:", MAO_TOKEN);
        console.log("   PI Token:", PI_TOKEN);
        console.log("   Trusted Owner:", TRUSTED_OWNER);
        console.log("   Prize Pool Wallet:", PRIZE_POOL_WALLET);
        console.log("   Profit Wallet:", PROFIT_WALLET);
        console.log("   Marketing Wallet:", MARKETING_WALLET);
        console.log("   管理员数量:", ADMIN_ADDRESSES.length);
        
        // 显示奖励系统
        console.log("\n🏆 奖励系统配置:");
        console.log("   特等奖 (0.1%): 12000 MAO / 120000 PI (120倍)");
        console.log("   一等奖 (0.5%): 2500 MAO / 25000 PI (25倍)");
        console.log("   二等奖 (2%): 600 MAO / 6000 PI (6倍)");
        console.log("   三等奖 (5%): 250 MAO / 2500 PI (2.5倍)");
        console.log("   四等奖 (15%): 120 MAO / 1200 PI (1.2倍)");
        console.log("   安慰奖 (17.4%): 80 MAO / 800 PI (0.8倍)");
        
        console.log("\n🎯 游戏配置:");
        console.log("   MAO游戏费用: 100 MAO");
        console.log("   PI游戏费用: 1000 PI");
        console.log("   基础胜率: 40%");
        console.log("   最大胜率: 60%");
        
        console.log("\n💰 分配比例:");
        console.log("   销毁: 10%");
        console.log("   营销: 20%");
        console.log("   奖励池: 60%");
        console.log("   开发基金: 10%");
        
        console.log("\n🎉 部署完成！");
        console.log("📋 合约地址:", contractAddress);
        console.log("🌐 网络: AlveyChain (Chain ID: 3797)");
        
        // 保存部署信息
        const deploymentInfo = {
            contractAddress: contractAddress,
            network: "AlveyChain",
            chainId: 3797,
            deployer: deployer.address,
            deploymentTime: new Date().toISOString(),
            config: {
                maoToken: MAO_TOKEN,
                piToken: PI_TOKEN,
                trustedOwner: TRUSTED_OWNER,
                prizePoolWallet: PRIZE_POOL_WALLET,
                profitWallet: PROFIT_WALLET,
                marketingWallet: MARKETING_WALLET,
                adminAddresses: ADMIN_ADDRESSES
            },
            rewardSystem: {
                special: { probability: "0.1%", reward: "12000 MAO / 120000 PI", multiplier: "120x" },
                first: { probability: "0.5%", reward: "2500 MAO / 25000 PI", multiplier: "25x" },
                second: { probability: "2%", reward: "600 MAO / 6000 PI", multiplier: "6x" },
                third: { probability: "5%", reward: "250 MAO / 2500 PI", multiplier: "2.5x" },
                fourth: { probability: "15%", reward: "120 MAO / 1200 PI", multiplier: "1.2x" },
                consolation: { probability: "17.4%", reward: "80 MAO / 800 PI", multiplier: "0.8x" }
            }
        };
        
        console.log("\n📄 部署信息已保存");
        
    } catch (error) {
        console.error("❌ 部署失败:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 

async function main() {
    console.log("🚀 部署 UltraSecureWheelGameV6_Final 合约...");
    
    // 合约地址
    const MAO_TOKEN = "0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022";
    const PI_TOKEN = "0xFd4680e25E05b3435C7F698668d1ce80D2a9F444";
    
    // 管理员地址
    const ADMIN_ADDRESSES = [
        "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408", // 主管理员
        "0x861A48051eFaA1876D4B38904516C9F7bbCca36d", // 营销钱包
        "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7", // 管理员1
        "0xE15881Fc413c6cd47a512C24608F94Fa2896b374", // 管理员2
        "0x1234567890123456789012345678901234567890"  // 管理员3
    ];
    
    // 钱包地址
    const TRUSTED_OWNER = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PRIZE_POOL_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PROFIT_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const MARKETING_WALLET = "0x861A48051eFaA1876D4B38904516C9F7bbCca36d";
    
    try {
        // 获取部署者
        const [deployer] = await ethers.getSigners();
        console.log("📋 部署者地址:", deployer.address);
        
        // 检查余额
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log("💰 部署者余额:", ethers.formatEther(balance), "ALV");
        
        if (balance < ethers.parseEther("0.1")) {
            throw new Error("余额不足，需要至少0.1 ALV");
        }
        
        // 部署合约
        console.log("🔨 开始部署合约...");
        const GameContract = await ethers.getContractFactory("UltraSecureWheelGameV6_Final");
        
        const gameContract = await GameContract.deploy(
            MAO_TOKEN,
            PI_TOKEN,
            ADMIN_ADDRESSES,
            TRUSTED_OWNER,
            PRIZE_POOL_WALLET,
            PROFIT_WALLET,
            MARKETING_WALLET
        );
        
        console.log("⏳ 等待合约部署确认...");
        await gameContract.waitForDeployment();
        
        const contractAddress = await gameContract.getAddress();
        console.log("✅ 合约部署成功！");
        console.log("📋 合约地址:", contractAddress);
        
        // 验证部署
        console.log("🔍 验证合约部署...");
        const code = await deployer.provider.getCode(contractAddress);
        if (code === "0x") {
            throw new Error("合约部署失败，地址没有代码");
        }
        console.log("✅ 合约验证成功！");
        
        // 显示合约信息
        console.log("\n📊 合约配置信息:");
        console.log("   MAO Token:", MAO_TOKEN);
        console.log("   PI Token:", PI_TOKEN);
        console.log("   Trusted Owner:", TRUSTED_OWNER);
        console.log("   Prize Pool Wallet:", PRIZE_POOL_WALLET);
        console.log("   Profit Wallet:", PROFIT_WALLET);
        console.log("   Marketing Wallet:", MARKETING_WALLET);
        console.log("   管理员数量:", ADMIN_ADDRESSES.length);
        
        // 显示奖励系统
        console.log("\n🏆 奖励系统配置:");
        console.log("   特等奖 (0.1%): 12000 MAO / 120000 PI (120倍)");
        console.log("   一等奖 (0.5%): 2500 MAO / 25000 PI (25倍)");
        console.log("   二等奖 (2%): 600 MAO / 6000 PI (6倍)");
        console.log("   三等奖 (5%): 250 MAO / 2500 PI (2.5倍)");
        console.log("   四等奖 (15%): 120 MAO / 1200 PI (1.2倍)");
        console.log("   安慰奖 (17.4%): 80 MAO / 800 PI (0.8倍)");
        
        console.log("\n🎯 游戏配置:");
        console.log("   MAO游戏费用: 100 MAO");
        console.log("   PI游戏费用: 1000 PI");
        console.log("   基础胜率: 40%");
        console.log("   最大胜率: 60%");
        
        console.log("\n💰 分配比例:");
        console.log("   销毁: 10%");
        console.log("   营销: 20%");
        console.log("   奖励池: 60%");
        console.log("   开发基金: 10%");
        
        console.log("\n🎉 部署完成！");
        console.log("📋 合约地址:", contractAddress);
        console.log("🌐 网络: AlveyChain (Chain ID: 3797)");
        
        // 保存部署信息
        const deploymentInfo = {
            contractAddress: contractAddress,
            network: "AlveyChain",
            chainId: 3797,
            deployer: deployer.address,
            deploymentTime: new Date().toISOString(),
            config: {
                maoToken: MAO_TOKEN,
                piToken: PI_TOKEN,
                trustedOwner: TRUSTED_OWNER,
                prizePoolWallet: PRIZE_POOL_WALLET,
                profitWallet: PROFIT_WALLET,
                marketingWallet: MARKETING_WALLET,
                adminAddresses: ADMIN_ADDRESSES
            },
            rewardSystem: {
                special: { probability: "0.1%", reward: "12000 MAO / 120000 PI", multiplier: "120x" },
                first: { probability: "0.5%", reward: "2500 MAO / 25000 PI", multiplier: "25x" },
                second: { probability: "2%", reward: "600 MAO / 6000 PI", multiplier: "6x" },
                third: { probability: "5%", reward: "250 MAO / 2500 PI", multiplier: "2.5x" },
                fourth: { probability: "15%", reward: "120 MAO / 1200 PI", multiplier: "1.2x" },
                consolation: { probability: "17.4%", reward: "80 MAO / 800 PI", multiplier: "0.8x" }
            }
        };
        
        console.log("\n📄 部署信息已保存");
        
    } catch (error) {
        console.error("❌ 部署失败:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 

async function main() {
    console.log("🚀 部署 UltraSecureWheelGameV6_Final 合约...");
    
    // 合约地址
    const MAO_TOKEN = "0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022";
    const PI_TOKEN = "0xFd4680e25E05b3435C7F698668d1ce80D2a9F444";
    
    // 管理员地址
    const ADMIN_ADDRESSES = [
        "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408", // 主管理员
        "0x861A48051eFaA1876D4B38904516C9F7bbCca36d", // 营销钱包
        "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7", // 管理员1
        "0xE15881Fc413c6cd47a512C24608F94Fa2896b374", // 管理员2
        "0x1234567890123456789012345678901234567890"  // 管理员3
    ];
    
    // 钱包地址
    const TRUSTED_OWNER = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PRIZE_POOL_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PROFIT_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const MARKETING_WALLET = "0x861A48051eFaA1876D4B38904516C9F7bbCca36d";
    
    try {
        // 获取部署者
        const [deployer] = await ethers.getSigners();
        console.log("📋 部署者地址:", deployer.address);
        
        // 检查余额
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log("💰 部署者余额:", ethers.formatEther(balance), "ALV");
        
        if (balance < ethers.parseEther("0.1")) {
            throw new Error("余额不足，需要至少0.1 ALV");
        }
        
        // 部署合约
        console.log("🔨 开始部署合约...");
        const GameContract = await ethers.getContractFactory("UltraSecureWheelGameV6_Final");
        
        const gameContract = await GameContract.deploy(
            MAO_TOKEN,
            PI_TOKEN,
            ADMIN_ADDRESSES,
            TRUSTED_OWNER,
            PRIZE_POOL_WALLET,
            PROFIT_WALLET,
            MARKETING_WALLET
        );
        
        console.log("⏳ 等待合约部署确认...");
        await gameContract.waitForDeployment();
        
        const contractAddress = await gameContract.getAddress();
        console.log("✅ 合约部署成功！");
        console.log("📋 合约地址:", contractAddress);
        
        // 验证部署
        console.log("🔍 验证合约部署...");
        const code = await deployer.provider.getCode(contractAddress);
        if (code === "0x") {
            throw new Error("合约部署失败，地址没有代码");
        }
        console.log("✅ 合约验证成功！");
        
        // 显示合约信息
        console.log("\n📊 合约配置信息:");
        console.log("   MAO Token:", MAO_TOKEN);
        console.log("   PI Token:", PI_TOKEN);
        console.log("   Trusted Owner:", TRUSTED_OWNER);
        console.log("   Prize Pool Wallet:", PRIZE_POOL_WALLET);
        console.log("   Profit Wallet:", PROFIT_WALLET);
        console.log("   Marketing Wallet:", MARKETING_WALLET);
        console.log("   管理员数量:", ADMIN_ADDRESSES.length);
        
        // 显示奖励系统
        console.log("\n🏆 奖励系统配置:");
        console.log("   特等奖 (0.1%): 12000 MAO / 120000 PI (120倍)");
        console.log("   一等奖 (0.5%): 2500 MAO / 25000 PI (25倍)");
        console.log("   二等奖 (2%): 600 MAO / 6000 PI (6倍)");
        console.log("   三等奖 (5%): 250 MAO / 2500 PI (2.5倍)");
        console.log("   四等奖 (15%): 120 MAO / 1200 PI (1.2倍)");
        console.log("   安慰奖 (17.4%): 80 MAO / 800 PI (0.8倍)");
        
        console.log("\n🎯 游戏配置:");
        console.log("   MAO游戏费用: 100 MAO");
        console.log("   PI游戏费用: 1000 PI");
        console.log("   基础胜率: 40%");
        console.log("   最大胜率: 60%");
        
        console.log("\n💰 分配比例:");
        console.log("   销毁: 10%");
        console.log("   营销: 20%");
        console.log("   奖励池: 60%");
        console.log("   开发基金: 10%");
        
        console.log("\n🎉 部署完成！");
        console.log("📋 合约地址:", contractAddress);
        console.log("🌐 网络: AlveyChain (Chain ID: 3797)");
        
        // 保存部署信息
        const deploymentInfo = {
            contractAddress: contractAddress,
            network: "AlveyChain",
            chainId: 3797,
            deployer: deployer.address,
            deploymentTime: new Date().toISOString(),
            config: {
                maoToken: MAO_TOKEN,
                piToken: PI_TOKEN,
                trustedOwner: TRUSTED_OWNER,
                prizePoolWallet: PRIZE_POOL_WALLET,
                profitWallet: PROFIT_WALLET,
                marketingWallet: MARKETING_WALLET,
                adminAddresses: ADMIN_ADDRESSES
            },
            rewardSystem: {
                special: { probability: "0.1%", reward: "12000 MAO / 120000 PI", multiplier: "120x" },
                first: { probability: "0.5%", reward: "2500 MAO / 25000 PI", multiplier: "25x" },
                second: { probability: "2%", reward: "600 MAO / 6000 PI", multiplier: "6x" },
                third: { probability: "5%", reward: "250 MAO / 2500 PI", multiplier: "2.5x" },
                fourth: { probability: "15%", reward: "120 MAO / 1200 PI", multiplier: "1.2x" },
                consolation: { probability: "17.4%", reward: "80 MAO / 800 PI", multiplier: "0.8x" }
            }
        };
        
        console.log("\n📄 部署信息已保存");
        
    } catch (error) {
        console.error("❌ 部署失败:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 

async function main() {
    console.log("🚀 部署 UltraSecureWheelGameV6_Final 合约...");
    
    // 合约地址
    const MAO_TOKEN = "0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022";
    const PI_TOKEN = "0xFd4680e25E05b3435C7F698668d1ce80D2a9F444";
    
    // 管理员地址
    const ADMIN_ADDRESSES = [
        "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408", // 主管理员
        "0x861A48051eFaA1876D4B38904516C9F7bbCca36d", // 营销钱包
        "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7", // 管理员1
        "0xE15881Fc413c6cd47a512C24608F94Fa2896b374", // 管理员2
        "0x1234567890123456789012345678901234567890"  // 管理员3
    ];
    
    // 钱包地址
    const TRUSTED_OWNER = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PRIZE_POOL_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PROFIT_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const MARKETING_WALLET = "0x861A48051eFaA1876D4B38904516C9F7bbCca36d";
    
    try {
        // 获取部署者
        const [deployer] = await ethers.getSigners();
        console.log("📋 部署者地址:", deployer.address);
        
        // 检查余额
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log("💰 部署者余额:", ethers.formatEther(balance), "ALV");
        
        if (balance < ethers.parseEther("0.1")) {
            throw new Error("余额不足，需要至少0.1 ALV");
        }
        
        // 部署合约
        console.log("🔨 开始部署合约...");
        const GameContract = await ethers.getContractFactory("UltraSecureWheelGameV6_Final");
        
        const gameContract = await GameContract.deploy(
            MAO_TOKEN,
            PI_TOKEN,
            ADMIN_ADDRESSES,
            TRUSTED_OWNER,
            PRIZE_POOL_WALLET,
            PROFIT_WALLET,
            MARKETING_WALLET
        );
        
        console.log("⏳ 等待合约部署确认...");
        await gameContract.waitForDeployment();
        
        const contractAddress = await gameContract.getAddress();
        console.log("✅ 合约部署成功！");
        console.log("📋 合约地址:", contractAddress);
        
        // 验证部署
        console.log("🔍 验证合约部署...");
        const code = await deployer.provider.getCode(contractAddress);
        if (code === "0x") {
            throw new Error("合约部署失败，地址没有代码");
        }
        console.log("✅ 合约验证成功！");
        
        // 显示合约信息
        console.log("\n📊 合约配置信息:");
        console.log("   MAO Token:", MAO_TOKEN);
        console.log("   PI Token:", PI_TOKEN);
        console.log("   Trusted Owner:", TRUSTED_OWNER);
        console.log("   Prize Pool Wallet:", PRIZE_POOL_WALLET);
        console.log("   Profit Wallet:", PROFIT_WALLET);
        console.log("   Marketing Wallet:", MARKETING_WALLET);
        console.log("   管理员数量:", ADMIN_ADDRESSES.length);
        
        // 显示奖励系统
        console.log("\n🏆 奖励系统配置:");
        console.log("   特等奖 (0.1%): 12000 MAO / 120000 PI (120倍)");
        console.log("   一等奖 (0.5%): 2500 MAO / 25000 PI (25倍)");
        console.log("   二等奖 (2%): 600 MAO / 6000 PI (6倍)");
        console.log("   三等奖 (5%): 250 MAO / 2500 PI (2.5倍)");
        console.log("   四等奖 (15%): 120 MAO / 1200 PI (1.2倍)");
        console.log("   安慰奖 (17.4%): 80 MAO / 800 PI (0.8倍)");
        
        console.log("\n🎯 游戏配置:");
        console.log("   MAO游戏费用: 100 MAO");
        console.log("   PI游戏费用: 1000 PI");
        console.log("   基础胜率: 40%");
        console.log("   最大胜率: 60%");
        
        console.log("\n💰 分配比例:");
        console.log("   销毁: 10%");
        console.log("   营销: 20%");
        console.log("   奖励池: 60%");
        console.log("   开发基金: 10%");
        
        console.log("\n🎉 部署完成！");
        console.log("📋 合约地址:", contractAddress);
        console.log("🌐 网络: AlveyChain (Chain ID: 3797)");
        
        // 保存部署信息
        const deploymentInfo = {
            contractAddress: contractAddress,
            network: "AlveyChain",
            chainId: 3797,
            deployer: deployer.address,
            deploymentTime: new Date().toISOString(),
            config: {
                maoToken: MAO_TOKEN,
                piToken: PI_TOKEN,
                trustedOwner: TRUSTED_OWNER,
                prizePoolWallet: PRIZE_POOL_WALLET,
                profitWallet: PROFIT_WALLET,
                marketingWallet: MARKETING_WALLET,
                adminAddresses: ADMIN_ADDRESSES
            },
            rewardSystem: {
                special: { probability: "0.1%", reward: "12000 MAO / 120000 PI", multiplier: "120x" },
                first: { probability: "0.5%", reward: "2500 MAO / 25000 PI", multiplier: "25x" },
                second: { probability: "2%", reward: "600 MAO / 6000 PI", multiplier: "6x" },
                third: { probability: "5%", reward: "250 MAO / 2500 PI", multiplier: "2.5x" },
                fourth: { probability: "15%", reward: "120 MAO / 1200 PI", multiplier: "1.2x" },
                consolation: { probability: "17.4%", reward: "80 MAO / 800 PI", multiplier: "0.8x" }
            }
        };
        
        console.log("\n📄 部署信息已保存");
        
    } catch (error) {
        console.error("❌ 部署失败:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 

async function main() {
    console.log("🚀 部署 UltraSecureWheelGameV6_Final 合约...");
    
    // 合约地址
    const MAO_TOKEN = "0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022";
    const PI_TOKEN = "0xFd4680e25E05b3435C7F698668d1ce80D2a9F444";
    
    // 管理员地址
    const ADMIN_ADDRESSES = [
        "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408", // 主管理员
        "0x861A48051eFaA1876D4B38904516C9F7bbCca36d", // 营销钱包
        "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7", // 管理员1
        "0xE15881Fc413c6cd47a512C24608F94Fa2896b374", // 管理员2
        "0x1234567890123456789012345678901234567890"  // 管理员3
    ];
    
    // 钱包地址
    const TRUSTED_OWNER = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PRIZE_POOL_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const PROFIT_WALLET = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408";
    const MARKETING_WALLET = "0x861A48051eFaA1876D4B38904516C9F7bbCca36d";
    
    try {
        // 获取部署者
        const [deployer] = await ethers.getSigners();
        console.log("📋 部署者地址:", deployer.address);
        
        // 检查余额
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log("💰 部署者余额:", ethers.formatEther(balance), "ALV");
        
        if (balance < ethers.parseEther("0.1")) {
            throw new Error("余额不足，需要至少0.1 ALV");
        }
        
        // 部署合约
        console.log("🔨 开始部署合约...");
        const GameContract = await ethers.getContractFactory("UltraSecureWheelGameV6_Final");
        
        const gameContract = await GameContract.deploy(
            MAO_TOKEN,
            PI_TOKEN,
            ADMIN_ADDRESSES,
            TRUSTED_OWNER,
            PRIZE_POOL_WALLET,
            PROFIT_WALLET,
            MARKETING_WALLET
        );
        
        console.log("⏳ 等待合约部署确认...");
        await gameContract.waitForDeployment();
        
        const contractAddress = await gameContract.getAddress();
        console.log("✅ 合约部署成功！");
        console.log("📋 合约地址:", contractAddress);
        
        // 验证部署
        console.log("🔍 验证合约部署...");
        const code = await deployer.provider.getCode(contractAddress);
        if (code === "0x") {
            throw new Error("合约部署失败，地址没有代码");
        }
        console.log("✅ 合约验证成功！");
        
        // 显示合约信息
        console.log("\n📊 合约配置信息:");
        console.log("   MAO Token:", MAO_TOKEN);
        console.log("   PI Token:", PI_TOKEN);
        console.log("   Trusted Owner:", TRUSTED_OWNER);
        console.log("   Prize Pool Wallet:", PRIZE_POOL_WALLET);
        console.log("   Profit Wallet:", PROFIT_WALLET);
        console.log("   Marketing Wallet:", MARKETING_WALLET);
        console.log("   管理员数量:", ADMIN_ADDRESSES.length);
        
        // 显示奖励系统
        console.log("\n🏆 奖励系统配置:");
        console.log("   特等奖 (0.1%): 12000 MAO / 120000 PI (120倍)");
        console.log("   一等奖 (0.5%): 2500 MAO / 25000 PI (25倍)");
        console.log("   二等奖 (2%): 600 MAO / 6000 PI (6倍)");
        console.log("   三等奖 (5%): 250 MAO / 2500 PI (2.5倍)");
        console.log("   四等奖 (15%): 120 MAO / 1200 PI (1.2倍)");
        console.log("   安慰奖 (17.4%): 80 MAO / 800 PI (0.8倍)");
        
        console.log("\n🎯 游戏配置:");
        console.log("   MAO游戏费用: 100 MAO");
        console.log("   PI游戏费用: 1000 PI");
        console.log("   基础胜率: 40%");
        console.log("   最大胜率: 60%");
        
        console.log("\n💰 分配比例:");
        console.log("   销毁: 10%");
        console.log("   营销: 20%");
        console.log("   奖励池: 60%");
        console.log("   开发基金: 10%");
        
        console.log("\n🎉 部署完成！");
        console.log("📋 合约地址:", contractAddress);
        console.log("🌐 网络: AlveyChain (Chain ID: 3797)");
        
        // 保存部署信息
        const deploymentInfo = {
            contractAddress: contractAddress,
            network: "AlveyChain",
            chainId: 3797,
            deployer: deployer.address,
            deploymentTime: new Date().toISOString(),
            config: {
                maoToken: MAO_TOKEN,
                piToken: PI_TOKEN,
                trustedOwner: TRUSTED_OWNER,
                prizePoolWallet: PRIZE_POOL_WALLET,
                profitWallet: PROFIT_WALLET,
                marketingWallet: MARKETING_WALLET,
                adminAddresses: ADMIN_ADDRESSES
            },
            rewardSystem: {
                special: { probability: "0.1%", reward: "12000 MAO / 120000 PI", multiplier: "120x" },
                first: { probability: "0.5%", reward: "2500 MAO / 25000 PI", multiplier: "25x" },
                second: { probability: "2%", reward: "600 MAO / 6000 PI", multiplier: "6x" },
                third: { probability: "5%", reward: "250 MAO / 2500 PI", multiplier: "2.5x" },
                fourth: { probability: "15%", reward: "120 MAO / 1200 PI", multiplier: "1.2x" },
                consolation: { probability: "17.4%", reward: "80 MAO / 800 PI", multiplier: "0.8x" }
            }
        };
        
        console.log("\n📄 部署信息已保存");
        
    } catch (error) {
        console.error("❌ 部署失败:", error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 