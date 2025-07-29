const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 开始部署 UltraSecureWheelGameV3...");
    
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("📝 部署账户:", deployer.address);
    console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ALV");
    
    // 代币合约地址 (AlveyChain)
    const MAO_TOKEN_ADDRESS = "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7";
    const PI_TOKEN_ADDRESS = "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7";
    
    // 管理员地址 (从maogamewallets文件夹)
    const ADMIN_ADDRESSES = [
        "0x1234567890123456789012345678901234567890", // 请替换为实际管理员地址
        "0x1234567890123456789012345678901234567890", // 请替换为实际管理员地址
        "0x1234567890123456789012345678901234567890", // 请替换为实际管理员地址
        "0x1234567890123456789012345678901234567890", // 请替换为实际管理员地址
        "0x1234567890123456789012345678901234567890"  // 请替换为实际管理员地址
    ];
    
    // 钱包地址
    const TRUSTED_OWNER = deployer.address;
    const PRIZE_POOL_WALLET = "0x1234567890123456789012345678901234567890"; // 请替换为实际奖金池钱包
    const PROFIT_WALLET = "0x1234567890123456789012345678901234567890";     // 请替换为实际利润钱包
    const MARKETING_WALLET = "0x1234567890123456789012345678901234567890";  // 请替换为实际营销钱包
    
    console.log("\n📋 部署参数:");
    console.log("MAO Token:", MAO_TOKEN_ADDRESS);
    console.log("PI Token:", PI_TOKEN_ADDRESS);
    console.log("Trusted Owner:", TRUSTED_OWNER);
    console.log("Prize Pool Wallet:", PRIZE_POOL_WALLET);
    console.log("Profit Wallet:", PROFIT_WALLET);
    console.log("Marketing Wallet:", MARKETING_WALLET);
    console.log("Admin Count:", ADMIN_ADDRESSES.length);
    
    // 验证管理员地址
    for (let i = 0; i < ADMIN_ADDRESSES.length; i++) {
        if (ADMIN_ADDRESSES[i] === "0x1234567890123456789012345678901234567890") {
            console.log(`❌ 请更新第 ${i + 1} 个管理员地址`);
            return;
        }
    }
    
    if (PRIZE_POOL_WALLET === "0x1234567890123456789012345678901234567890") {
        console.log("❌ 请更新奖金池钱包地址");
        return;
    }
    
    if (PROFIT_WALLET === "0x1234567890123456789012345678901234567890") {
        console.log("❌ 请更新利润钱包地址");
        return;
    }
    
    if (MARKETING_WALLET === "0x1234567890123456789012345678901234567890") {
        console.log("❌ 请更新营销钱包地址");
        return;
    }
    
    try {
        // 部署合约
        console.log("\n🔨 正在部署合约...");
        const UltraSecureWheelGameV3 = await ethers.getContractFactory("UltraSecureWheelGameV3");
        
        const gameContract = await UltraSecureWheelGameV3.deploy(
            MAO_TOKEN_ADDRESS,
            PI_TOKEN_ADDRESS,
            ADMIN_ADDRESSES,
            TRUSTED_OWNER,
            PRIZE_POOL_WALLET,
            PROFIT_WALLET,
            MARKETING_WALLET
        );
        
        console.log("⏳ 等待合约部署确认...");
        await gameContract.waitForDeployment();
        
        const contractAddress = await gameContract.getAddress();
        console.log("✅ 合约部署成功!");
        console.log("📄 合约地址:", contractAddress);
        
        // 验证部署
        console.log("\n🔍 验证部署...");
        const maoToken = await gameContract.maoToken();
        const piToken = await gameContract.piToken();
        const prizePoolWallet = await gameContract.prizePoolWallet();
        const profitWallet = await gameContract.profitWallet();
        const marketingWallet = await gameContract.marketingWallet();
        
        console.log("✅ MAO Token:", maoToken);
        console.log("✅ PI Token:", piToken);
        console.log("✅ Prize Pool Wallet:", prizePoolWallet);
        console.log("✅ Profit Wallet:", profitWallet);
        console.log("✅ Marketing Wallet:", marketingWallet);
        
        // 检查分配比例
        const burnPercentage = await gameContract.BURN_PERCENTAGE();
        const marketingPercentage = await gameContract.MARKETING_PERCENTAGE();
        const contractPercentage = await gameContract.CONTRACT_PERCENTAGE();
        
        console.log("\n📊 代币分配比例:");
        console.log("🔥 销毁比例:", burnPercentage.toString(), "%");
        console.log("💰 营销比例:", marketingPercentage.toString(), "%");
        console.log("🎮 合约比例:", contractPercentage.toString(), "%");
        
        // 生成部署报告
        const deploymentReport = {
            contractAddress: contractAddress,
            deployer: deployer.address,
            network: "AlveyChain",
            deploymentTime: new Date().toISOString(),
            parameters: {
                maoToken: MAO_TOKEN_ADDRESS,
                piToken: PI_TOKEN_ADDRESS,
                trustedOwner: TRUSTED_OWNER,
                prizePoolWallet: PRIZE_POOL_WALLET,
                profitWallet: PROFIT_WALLET,
                marketingWallet: MARKETING_WALLET,
                adminCount: ADMIN_ADDRESSES.length,
                distribution: {
                    burn: "15%",
                    marketing: "15%",
                    contract: "70%"
                }
            },
            features: [
                "代币分配机制 (15%销毁 | 15%营销 | 70%合约)",
                "优化奖励系统 (45%中奖率)",
                "奖金池管理",
                "营销钱包支持",
                "销毁统计",
                "安全机制"
            ]
        };
        
        console.log("\n📋 部署报告:");
        console.log(JSON.stringify(deploymentReport, null, 2));
        
        // 保存部署信息到文件
        const fs = require('fs');
        fs.writeFileSync('V3_DEPLOYMENT_REPORT.json', JSON.stringify(deploymentReport, null, 2));
        console.log("\n💾 部署报告已保存到 V3_DEPLOYMENT_REPORT.json");
        
        console.log("\n🎉 部署完成! 合约已成功部署到 AlveyChain");
        console.log("🔗 合约地址:", contractAddress);
        
    } catch (error) {
        console.error("❌ 部署失败:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 
 
 
 