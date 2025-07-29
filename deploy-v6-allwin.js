const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 部署 UltraSecureWheelGameV6_AllWin 合约...");
    
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
        const [deployer] = await ethers.getSigners();
        console.log("📋 部署者地址:", deployer.address);
        const balance = await deployer.provider.getBalance(deployer.address);
        console.log("💰 部署者余额:", ethers.formatEther(balance), "ALV");
        if (balance < ethers.parseEther("0.1")) {
            throw new Error("余额不足，需要至少0.1 ALV");
        }
        
        console.log("🔨 开始部署合约...");
        const GameContract = await ethers.getContractFactory("UltraSecureWheelGameV6_AllWin");
        
        const gameContract = await GameContract.deploy(
            MAO_TOKEN, PI_TOKEN, ADMIN_ADDRESSES, TRUSTED_OWNER, PRIZE_POOL_WALLET, PROFIT_WALLET, MARKETING_WALLET
        );
        
        console.log("⏳ 等待合约部署确认...");
        await gameContract.waitForDeployment();
        
        const contractAddress = await gameContract.getAddress();
        console.log("✅ 合约部署成功！");
        console.log("📋 合约地址:", contractAddress);
        
        console.log("🔍 验证合约部署...");
        const code = await deployer.provider.getCode(contractAddress);
        if (code === "0x") {
            throw new Error("合约部署失败，地址没有代码");
        }
        console.log("✅ 合约验证成功！");
        
        // 打印合约配置
        console.log("\n📊 合约配置信息:");
        console.log("🔗 MAO代币地址:", MAO_TOKEN);
        console.log("🔗 PI代币地址:", PI_TOKEN);
        console.log("👑 主管理员:", TRUSTED_OWNER);
        console.log("🏆 奖金池钱包:", PRIZE_POOL_WALLET);
        console.log("💰 利润钱包:", PROFIT_WALLET);
        console.log("📢 营销钱包:", MARKETING_WALLET);
        
        // 打印奖励系统
        console.log("\n🏆 全中奖盈利奖励系统:");
        console.log("特等奖 (0.1%): 10000 MAO / 100000 PI (100倍盈利)");
        console.log("一等奖 (0.5%): 2000 MAO / 20000 PI (20倍盈利)");
        console.log("二等奖 (2%): 500 MAO / 5000 PI (5倍盈利)");
        console.log("三等奖 (5%): 200 MAO / 2000 PI (2倍盈利)");
        console.log("四等奖 (15%): 110 MAO / 1100 PI (1.1倍盈利)");
        console.log("安慰奖 (27.4%): 101 MAO / 1010 PI (1.01倍盈利)");
        
        // 打印游戏配置
        console.log("\n🎮 游戏配置:");
        console.log("💰 MAO游戏费用: 100 MAO");
        console.log("💰 PI游戏费用: 1000 PI");
        console.log("🎯 基础胜率: 50%");
        console.log("📈 最大胜率: 70%");
        
        // 打印分配比例
        console.log("\n📊 代币分配比例:");
        console.log("🔥 销毁: 10%");
        console.log("📢 营销: 20%");
        console.log("🏆 奖励池: 60%");
        console.log("💻 开发基金: 10%");
        
        // 打印经济模型
        console.log("\n📈 经济模型分析:");
        console.log("总胜率: 50%");
        console.log("预期收益率: 84.17%");
        console.log("项目方收益: 15.83% (可持续)");
        console.log("所有中奖都有盈利！");
        
        console.log("\n🎉 部署完成！所有中奖玩家都能获得盈利！");
        
    } catch (error) {
        console.error("❌ 部署失败:", error.message);
        process.exit(1);
    }
}

main().then(() => process.exit(0)).catch((error) => { 
    console.error(error); 
    process.exit(1); 
}); 