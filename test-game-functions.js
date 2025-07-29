const { ethers } = require("hardhat");

async function main() {
    console.log("🎮 测试游戏合约功能...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const GAME_ABI = [
        "function playMAOGame() external",
        "function playPIGame() external",
        "function getGameStats(uint8 tokenType) external view returns (tuple(uint256 totalGames, uint256 totalWins, uint256 totalBets, uint256 totalRewards, uint256 totalBurned, uint256 totalMarketing, uint256 totalProfit))",
        "function getPlayerHistory(address player) external view returns (tuple(address player, uint8 tokenType, uint256 betAmount, uint256 rewardAmount, uint8 rewardLevel, uint256 timestamp, bool isWin, uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount, uint256 profitAmount)[])",
        "function getDistributionStats() external view returns (uint256, uint256, uint256, uint256)",
        "function getProfitStats() external view returns (uint256, uint256)",
        "function getPoolStatus() external view returns (uint256, uint256, bool)",
        "function maoGameCost() external view returns (uint256)",
        "function piGameCost() external view returns (uint256)",
        "function BURN_PERCENTAGE() external view returns (uint256)",
        "function MARKETING_PERCENTAGE() external view returns (uint256)",
        "function CONTRACT_PERCENTAGE() external view returns (uint256)"
    ];
    
    const TOKEN_ABI = [
        "function balanceOf(address owner) external view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GAME_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试游戏配置
        console.log("🎯 游戏配置测试:");
        try {
            const maoCost = await contract.maoGameCost();
            const piCost = await contract.piGameCost();
            const burnPercent = await contract.BURN_PERCENTAGE();
            const marketingPercent = await contract.MARKETING_PERCENTAGE();
            const contractPercent = await contract.CONTRACT_PERCENTAGE();
            
            console.log("   MAO游戏费用:", ethers.formatEther(maoCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piCost), "PI");
            console.log("   销毁比例:", burnPercent.toString(), "%");
            console.log("   营销比例:", marketingPercent.toString(), "%");
            console.log("   合约比例:", contractPercent.toString(), "%");
        } catch (error) {
            console.log("   ❌ 游戏配置查询失败:", error.message);
        }
        console.log("");
        
        // 测试游戏统计
        console.log("📊 游戏统计测试:");
        try {
            const maoStats = await contract.getGameStats(0);
            const piStats = await contract.getGameStats(1);
            
            console.log("   MAO游戏统计:");
            console.log("     总游戏次数:", maoStats.totalGames.toString());
            console.log("     胜利次数:", maoStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(maoStats.totalBets), "MAO");
            console.log("     总奖励:", ethers.formatEther(maoStats.totalRewards), "MAO");
            console.log("     已销毁:", ethers.formatEther(maoStats.totalBurned), "MAO");
            console.log("     营销费用:", ethers.formatEther(maoStats.totalMarketing), "MAO");
            console.log("     总利润:", ethers.formatEther(maoStats.totalProfit), "MAO");
            
            console.log("   PI游戏统计:");
            console.log("     总游戏次数:", piStats.totalGames.toString());
            console.log("     胜利次数:", piStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(piStats.totalBets), "PI");
            console.log("     总奖励:", ethers.formatEther(piStats.totalRewards), "PI");
            console.log("     已销毁:", ethers.formatEther(piStats.totalBurned), "PI");
            console.log("     营销费用:", ethers.formatEther(piStats.totalMarketing), "PI");
            console.log("     总利润:", ethers.formatEther(piStats.totalProfit), "PI");
        } catch (error) {
            console.log("   ❌ 游戏统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试资金池状态
        console.log("💰 资金池状态测试:");
        try {
            const poolStatus = await contract.getPoolStatus();
            console.log("   MAO余额:", ethers.formatEther(poolStatus[0]), "MAO");
            console.log("   PI余额:", ethers.formatEther(poolStatus[1]), "PI");
            console.log("   资金池健康:", poolStatus[2] ? "✅ 健康" : "❌ 需要充值");
        } catch (error) {
            console.log("   ❌ 资金池状态查询失败:", error.message);
        }
        console.log("");
        
        // 测试分配统计
        console.log("📈 分配统计测试:");
        try {
            const distributionStats = await contract.getDistributionStats();
            console.log("   总销毁:", ethers.formatEther(distributionStats[0]));
            console.log("   总营销:", ethers.formatEther(distributionStats[1]));
            console.log("   总合约:", ethers.formatEther(distributionStats[2]));
            console.log("   总利润:", ethers.formatEther(distributionStats[3]));
        } catch (error) {
            console.log("   ❌ 分配统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试利润统计
        console.log("💎 利润统计测试:");
        try {
            const profitStats = await contract.getProfitStats();
            console.log("   总利润:", ethers.formatEther(profitStats[0]));
            console.log("   利润率:", profitStats[1].toString(), "%");
        } catch (error) {
            console.log("   ❌ 利润统计查询失败:", error.message);
        }
        console.log("");
        
        console.log("✅ 游戏功能测试完成！");
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🎮 测试游戏合约功能...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const GAME_ABI = [
        "function playMAOGame() external",
        "function playPIGame() external",
        "function getGameStats(uint8 tokenType) external view returns (tuple(uint256 totalGames, uint256 totalWins, uint256 totalBets, uint256 totalRewards, uint256 totalBurned, uint256 totalMarketing, uint256 totalProfit))",
        "function getPlayerHistory(address player) external view returns (tuple(address player, uint8 tokenType, uint256 betAmount, uint256 rewardAmount, uint8 rewardLevel, uint256 timestamp, bool isWin, uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount, uint256 profitAmount)[])",
        "function getDistributionStats() external view returns (uint256, uint256, uint256, uint256)",
        "function getProfitStats() external view returns (uint256, uint256)",
        "function getPoolStatus() external view returns (uint256, uint256, bool)",
        "function maoGameCost() external view returns (uint256)",
        "function piGameCost() external view returns (uint256)",
        "function BURN_PERCENTAGE() external view returns (uint256)",
        "function MARKETING_PERCENTAGE() external view returns (uint256)",
        "function CONTRACT_PERCENTAGE() external view returns (uint256)"
    ];
    
    const TOKEN_ABI = [
        "function balanceOf(address owner) external view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GAME_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试游戏配置
        console.log("🎯 游戏配置测试:");
        try {
            const maoCost = await contract.maoGameCost();
            const piCost = await contract.piGameCost();
            const burnPercent = await contract.BURN_PERCENTAGE();
            const marketingPercent = await contract.MARKETING_PERCENTAGE();
            const contractPercent = await contract.CONTRACT_PERCENTAGE();
            
            console.log("   MAO游戏费用:", ethers.formatEther(maoCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piCost), "PI");
            console.log("   销毁比例:", burnPercent.toString(), "%");
            console.log("   营销比例:", marketingPercent.toString(), "%");
            console.log("   合约比例:", contractPercent.toString(), "%");
        } catch (error) {
            console.log("   ❌ 游戏配置查询失败:", error.message);
        }
        console.log("");
        
        // 测试游戏统计
        console.log("📊 游戏统计测试:");
        try {
            const maoStats = await contract.getGameStats(0);
            const piStats = await contract.getGameStats(1);
            
            console.log("   MAO游戏统计:");
            console.log("     总游戏次数:", maoStats.totalGames.toString());
            console.log("     胜利次数:", maoStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(maoStats.totalBets), "MAO");
            console.log("     总奖励:", ethers.formatEther(maoStats.totalRewards), "MAO");
            console.log("     已销毁:", ethers.formatEther(maoStats.totalBurned), "MAO");
            console.log("     营销费用:", ethers.formatEther(maoStats.totalMarketing), "MAO");
            console.log("     总利润:", ethers.formatEther(maoStats.totalProfit), "MAO");
            
            console.log("   PI游戏统计:");
            console.log("     总游戏次数:", piStats.totalGames.toString());
            console.log("     胜利次数:", piStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(piStats.totalBets), "PI");
            console.log("     总奖励:", ethers.formatEther(piStats.totalRewards), "PI");
            console.log("     已销毁:", ethers.formatEther(piStats.totalBurned), "PI");
            console.log("     营销费用:", ethers.formatEther(piStats.totalMarketing), "PI");
            console.log("     总利润:", ethers.formatEther(piStats.totalProfit), "PI");
        } catch (error) {
            console.log("   ❌ 游戏统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试资金池状态
        console.log("💰 资金池状态测试:");
        try {
            const poolStatus = await contract.getPoolStatus();
            console.log("   MAO余额:", ethers.formatEther(poolStatus[0]), "MAO");
            console.log("   PI余额:", ethers.formatEther(poolStatus[1]), "PI");
            console.log("   资金池健康:", poolStatus[2] ? "✅ 健康" : "❌ 需要充值");
        } catch (error) {
            console.log("   ❌ 资金池状态查询失败:", error.message);
        }
        console.log("");
        
        // 测试分配统计
        console.log("📈 分配统计测试:");
        try {
            const distributionStats = await contract.getDistributionStats();
            console.log("   总销毁:", ethers.formatEther(distributionStats[0]));
            console.log("   总营销:", ethers.formatEther(distributionStats[1]));
            console.log("   总合约:", ethers.formatEther(distributionStats[2]));
            console.log("   总利润:", ethers.formatEther(distributionStats[3]));
        } catch (error) {
            console.log("   ❌ 分配统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试利润统计
        console.log("💎 利润统计测试:");
        try {
            const profitStats = await contract.getProfitStats();
            console.log("   总利润:", ethers.formatEther(profitStats[0]));
            console.log("   利润率:", profitStats[1].toString(), "%");
        } catch (error) {
            console.log("   ❌ 利润统计查询失败:", error.message);
        }
        console.log("");
        
        console.log("✅ 游戏功能测试完成！");
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🎮 测试游戏合约功能...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const GAME_ABI = [
        "function playMAOGame() external",
        "function playPIGame() external",
        "function getGameStats(uint8 tokenType) external view returns (tuple(uint256 totalGames, uint256 totalWins, uint256 totalBets, uint256 totalRewards, uint256 totalBurned, uint256 totalMarketing, uint256 totalProfit))",
        "function getPlayerHistory(address player) external view returns (tuple(address player, uint8 tokenType, uint256 betAmount, uint256 rewardAmount, uint8 rewardLevel, uint256 timestamp, bool isWin, uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount, uint256 profitAmount)[])",
        "function getDistributionStats() external view returns (uint256, uint256, uint256, uint256)",
        "function getProfitStats() external view returns (uint256, uint256)",
        "function getPoolStatus() external view returns (uint256, uint256, bool)",
        "function maoGameCost() external view returns (uint256)",
        "function piGameCost() external view returns (uint256)",
        "function BURN_PERCENTAGE() external view returns (uint256)",
        "function MARKETING_PERCENTAGE() external view returns (uint256)",
        "function CONTRACT_PERCENTAGE() external view returns (uint256)"
    ];
    
    const TOKEN_ABI = [
        "function balanceOf(address owner) external view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GAME_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试游戏配置
        console.log("🎯 游戏配置测试:");
        try {
            const maoCost = await contract.maoGameCost();
            const piCost = await contract.piGameCost();
            const burnPercent = await contract.BURN_PERCENTAGE();
            const marketingPercent = await contract.MARKETING_PERCENTAGE();
            const contractPercent = await contract.CONTRACT_PERCENTAGE();
            
            console.log("   MAO游戏费用:", ethers.formatEther(maoCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piCost), "PI");
            console.log("   销毁比例:", burnPercent.toString(), "%");
            console.log("   营销比例:", marketingPercent.toString(), "%");
            console.log("   合约比例:", contractPercent.toString(), "%");
        } catch (error) {
            console.log("   ❌ 游戏配置查询失败:", error.message);
        }
        console.log("");
        
        // 测试游戏统计
        console.log("📊 游戏统计测试:");
        try {
            const maoStats = await contract.getGameStats(0);
            const piStats = await contract.getGameStats(1);
            
            console.log("   MAO游戏统计:");
            console.log("     总游戏次数:", maoStats.totalGames.toString());
            console.log("     胜利次数:", maoStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(maoStats.totalBets), "MAO");
            console.log("     总奖励:", ethers.formatEther(maoStats.totalRewards), "MAO");
            console.log("     已销毁:", ethers.formatEther(maoStats.totalBurned), "MAO");
            console.log("     营销费用:", ethers.formatEther(maoStats.totalMarketing), "MAO");
            console.log("     总利润:", ethers.formatEther(maoStats.totalProfit), "MAO");
            
            console.log("   PI游戏统计:");
            console.log("     总游戏次数:", piStats.totalGames.toString());
            console.log("     胜利次数:", piStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(piStats.totalBets), "PI");
            console.log("     总奖励:", ethers.formatEther(piStats.totalRewards), "PI");
            console.log("     已销毁:", ethers.formatEther(piStats.totalBurned), "PI");
            console.log("     营销费用:", ethers.formatEther(piStats.totalMarketing), "PI");
            console.log("     总利润:", ethers.formatEther(piStats.totalProfit), "PI");
        } catch (error) {
            console.log("   ❌ 游戏统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试资金池状态
        console.log("💰 资金池状态测试:");
        try {
            const poolStatus = await contract.getPoolStatus();
            console.log("   MAO余额:", ethers.formatEther(poolStatus[0]), "MAO");
            console.log("   PI余额:", ethers.formatEther(poolStatus[1]), "PI");
            console.log("   资金池健康:", poolStatus[2] ? "✅ 健康" : "❌ 需要充值");
        } catch (error) {
            console.log("   ❌ 资金池状态查询失败:", error.message);
        }
        console.log("");
        
        // 测试分配统计
        console.log("📈 分配统计测试:");
        try {
            const distributionStats = await contract.getDistributionStats();
            console.log("   总销毁:", ethers.formatEther(distributionStats[0]));
            console.log("   总营销:", ethers.formatEther(distributionStats[1]));
            console.log("   总合约:", ethers.formatEther(distributionStats[2]));
            console.log("   总利润:", ethers.formatEther(distributionStats[3]));
        } catch (error) {
            console.log("   ❌ 分配统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试利润统计
        console.log("💎 利润统计测试:");
        try {
            const profitStats = await contract.getProfitStats();
            console.log("   总利润:", ethers.formatEther(profitStats[0]));
            console.log("   利润率:", profitStats[1].toString(), "%");
        } catch (error) {
            console.log("   ❌ 利润统计查询失败:", error.message);
        }
        console.log("");
        
        console.log("✅ 游戏功能测试完成！");
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🎮 测试游戏合约功能...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const GAME_ABI = [
        "function playMAOGame() external",
        "function playPIGame() external",
        "function getGameStats(uint8 tokenType) external view returns (tuple(uint256 totalGames, uint256 totalWins, uint256 totalBets, uint256 totalRewards, uint256 totalBurned, uint256 totalMarketing, uint256 totalProfit))",
        "function getPlayerHistory(address player) external view returns (tuple(address player, uint8 tokenType, uint256 betAmount, uint256 rewardAmount, uint8 rewardLevel, uint256 timestamp, bool isWin, uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount, uint256 profitAmount)[])",
        "function getDistributionStats() external view returns (uint256, uint256, uint256, uint256)",
        "function getProfitStats() external view returns (uint256, uint256)",
        "function getPoolStatus() external view returns (uint256, uint256, bool)",
        "function maoGameCost() external view returns (uint256)",
        "function piGameCost() external view returns (uint256)",
        "function BURN_PERCENTAGE() external view returns (uint256)",
        "function MARKETING_PERCENTAGE() external view returns (uint256)",
        "function CONTRACT_PERCENTAGE() external view returns (uint256)"
    ];
    
    const TOKEN_ABI = [
        "function balanceOf(address owner) external view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GAME_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试游戏配置
        console.log("🎯 游戏配置测试:");
        try {
            const maoCost = await contract.maoGameCost();
            const piCost = await contract.piGameCost();
            const burnPercent = await contract.BURN_PERCENTAGE();
            const marketingPercent = await contract.MARKETING_PERCENTAGE();
            const contractPercent = await contract.CONTRACT_PERCENTAGE();
            
            console.log("   MAO游戏费用:", ethers.formatEther(maoCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piCost), "PI");
            console.log("   销毁比例:", burnPercent.toString(), "%");
            console.log("   营销比例:", marketingPercent.toString(), "%");
            console.log("   合约比例:", contractPercent.toString(), "%");
        } catch (error) {
            console.log("   ❌ 游戏配置查询失败:", error.message);
        }
        console.log("");
        
        // 测试游戏统计
        console.log("📊 游戏统计测试:");
        try {
            const maoStats = await contract.getGameStats(0);
            const piStats = await contract.getGameStats(1);
            
            console.log("   MAO游戏统计:");
            console.log("     总游戏次数:", maoStats.totalGames.toString());
            console.log("     胜利次数:", maoStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(maoStats.totalBets), "MAO");
            console.log("     总奖励:", ethers.formatEther(maoStats.totalRewards), "MAO");
            console.log("     已销毁:", ethers.formatEther(maoStats.totalBurned), "MAO");
            console.log("     营销费用:", ethers.formatEther(maoStats.totalMarketing), "MAO");
            console.log("     总利润:", ethers.formatEther(maoStats.totalProfit), "MAO");
            
            console.log("   PI游戏统计:");
            console.log("     总游戏次数:", piStats.totalGames.toString());
            console.log("     胜利次数:", piStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(piStats.totalBets), "PI");
            console.log("     总奖励:", ethers.formatEther(piStats.totalRewards), "PI");
            console.log("     已销毁:", ethers.formatEther(piStats.totalBurned), "PI");
            console.log("     营销费用:", ethers.formatEther(piStats.totalMarketing), "PI");
            console.log("     总利润:", ethers.formatEther(piStats.totalProfit), "PI");
        } catch (error) {
            console.log("   ❌ 游戏统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试资金池状态
        console.log("💰 资金池状态测试:");
        try {
            const poolStatus = await contract.getPoolStatus();
            console.log("   MAO余额:", ethers.formatEther(poolStatus[0]), "MAO");
            console.log("   PI余额:", ethers.formatEther(poolStatus[1]), "PI");
            console.log("   资金池健康:", poolStatus[2] ? "✅ 健康" : "❌ 需要充值");
        } catch (error) {
            console.log("   ❌ 资金池状态查询失败:", error.message);
        }
        console.log("");
        
        // 测试分配统计
        console.log("📈 分配统计测试:");
        try {
            const distributionStats = await contract.getDistributionStats();
            console.log("   总销毁:", ethers.formatEther(distributionStats[0]));
            console.log("   总营销:", ethers.formatEther(distributionStats[1]));
            console.log("   总合约:", ethers.formatEther(distributionStats[2]));
            console.log("   总利润:", ethers.formatEther(distributionStats[3]));
        } catch (error) {
            console.log("   ❌ 分配统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试利润统计
        console.log("💎 利润统计测试:");
        try {
            const profitStats = await contract.getProfitStats();
            console.log("   总利润:", ethers.formatEther(profitStats[0]));
            console.log("   利润率:", profitStats[1].toString(), "%");
        } catch (error) {
            console.log("   ❌ 利润统计查询失败:", error.message);
        }
        console.log("");
        
        console.log("✅ 游戏功能测试完成！");
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🎮 测试游戏合约功能...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const GAME_ABI = [
        "function playMAOGame() external",
        "function playPIGame() external",
        "function getGameStats(uint8 tokenType) external view returns (tuple(uint256 totalGames, uint256 totalWins, uint256 totalBets, uint256 totalRewards, uint256 totalBurned, uint256 totalMarketing, uint256 totalProfit))",
        "function getPlayerHistory(address player) external view returns (tuple(address player, uint8 tokenType, uint256 betAmount, uint256 rewardAmount, uint8 rewardLevel, uint256 timestamp, bool isWin, uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount, uint256 profitAmount)[])",
        "function getDistributionStats() external view returns (uint256, uint256, uint256, uint256)",
        "function getProfitStats() external view returns (uint256, uint256)",
        "function getPoolStatus() external view returns (uint256, uint256, bool)",
        "function maoGameCost() external view returns (uint256)",
        "function piGameCost() external view returns (uint256)",
        "function BURN_PERCENTAGE() external view returns (uint256)",
        "function MARKETING_PERCENTAGE() external view returns (uint256)",
        "function CONTRACT_PERCENTAGE() external view returns (uint256)"
    ];
    
    const TOKEN_ABI = [
        "function balanceOf(address owner) external view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GAME_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试游戏配置
        console.log("🎯 游戏配置测试:");
        try {
            const maoCost = await contract.maoGameCost();
            const piCost = await contract.piGameCost();
            const burnPercent = await contract.BURN_PERCENTAGE();
            const marketingPercent = await contract.MARKETING_PERCENTAGE();
            const contractPercent = await contract.CONTRACT_PERCENTAGE();
            
            console.log("   MAO游戏费用:", ethers.formatEther(maoCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piCost), "PI");
            console.log("   销毁比例:", burnPercent.toString(), "%");
            console.log("   营销比例:", marketingPercent.toString(), "%");
            console.log("   合约比例:", contractPercent.toString(), "%");
        } catch (error) {
            console.log("   ❌ 游戏配置查询失败:", error.message);
        }
        console.log("");
        
        // 测试游戏统计
        console.log("📊 游戏统计测试:");
        try {
            const maoStats = await contract.getGameStats(0);
            const piStats = await contract.getGameStats(1);
            
            console.log("   MAO游戏统计:");
            console.log("     总游戏次数:", maoStats.totalGames.toString());
            console.log("     胜利次数:", maoStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(maoStats.totalBets), "MAO");
            console.log("     总奖励:", ethers.formatEther(maoStats.totalRewards), "MAO");
            console.log("     已销毁:", ethers.formatEther(maoStats.totalBurned), "MAO");
            console.log("     营销费用:", ethers.formatEther(maoStats.totalMarketing), "MAO");
            console.log("     总利润:", ethers.formatEther(maoStats.totalProfit), "MAO");
            
            console.log("   PI游戏统计:");
            console.log("     总游戏次数:", piStats.totalGames.toString());
            console.log("     胜利次数:", piStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(piStats.totalBets), "PI");
            console.log("     总奖励:", ethers.formatEther(piStats.totalRewards), "PI");
            console.log("     已销毁:", ethers.formatEther(piStats.totalBurned), "PI");
            console.log("     营销费用:", ethers.formatEther(piStats.totalMarketing), "PI");
            console.log("     总利润:", ethers.formatEther(piStats.totalProfit), "PI");
        } catch (error) {
            console.log("   ❌ 游戏统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试资金池状态
        console.log("💰 资金池状态测试:");
        try {
            const poolStatus = await contract.getPoolStatus();
            console.log("   MAO余额:", ethers.formatEther(poolStatus[0]), "MAO");
            console.log("   PI余额:", ethers.formatEther(poolStatus[1]), "PI");
            console.log("   资金池健康:", poolStatus[2] ? "✅ 健康" : "❌ 需要充值");
        } catch (error) {
            console.log("   ❌ 资金池状态查询失败:", error.message);
        }
        console.log("");
        
        // 测试分配统计
        console.log("📈 分配统计测试:");
        try {
            const distributionStats = await contract.getDistributionStats();
            console.log("   总销毁:", ethers.formatEther(distributionStats[0]));
            console.log("   总营销:", ethers.formatEther(distributionStats[1]));
            console.log("   总合约:", ethers.formatEther(distributionStats[2]));
            console.log("   总利润:", ethers.formatEther(distributionStats[3]));
        } catch (error) {
            console.log("   ❌ 分配统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试利润统计
        console.log("💎 利润统计测试:");
        try {
            const profitStats = await contract.getProfitStats();
            console.log("   总利润:", ethers.formatEther(profitStats[0]));
            console.log("   利润率:", profitStats[1].toString(), "%");
        } catch (error) {
            console.log("   ❌ 利润统计查询失败:", error.message);
        }
        console.log("");
        
        console.log("✅ 游戏功能测试完成！");
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🎮 测试游戏合约功能...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const GAME_ABI = [
        "function playMAOGame() external",
        "function playPIGame() external",
        "function getGameStats(uint8 tokenType) external view returns (tuple(uint256 totalGames, uint256 totalWins, uint256 totalBets, uint256 totalRewards, uint256 totalBurned, uint256 totalMarketing, uint256 totalProfit))",
        "function getPlayerHistory(address player) external view returns (tuple(address player, uint8 tokenType, uint256 betAmount, uint256 rewardAmount, uint8 rewardLevel, uint256 timestamp, bool isWin, uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount, uint256 profitAmount)[])",
        "function getDistributionStats() external view returns (uint256, uint256, uint256, uint256)",
        "function getProfitStats() external view returns (uint256, uint256)",
        "function getPoolStatus() external view returns (uint256, uint256, bool)",
        "function maoGameCost() external view returns (uint256)",
        "function piGameCost() external view returns (uint256)",
        "function BURN_PERCENTAGE() external view returns (uint256)",
        "function MARKETING_PERCENTAGE() external view returns (uint256)",
        "function CONTRACT_PERCENTAGE() external view returns (uint256)"
    ];
    
    const TOKEN_ABI = [
        "function balanceOf(address owner) external view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, GAME_ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试游戏配置
        console.log("🎯 游戏配置测试:");
        try {
            const maoCost = await contract.maoGameCost();
            const piCost = await contract.piGameCost();
            const burnPercent = await contract.BURN_PERCENTAGE();
            const marketingPercent = await contract.MARKETING_PERCENTAGE();
            const contractPercent = await contract.CONTRACT_PERCENTAGE();
            
            console.log("   MAO游戏费用:", ethers.formatEther(maoCost), "MAO");
            console.log("   PI游戏费用:", ethers.formatEther(piCost), "PI");
            console.log("   销毁比例:", burnPercent.toString(), "%");
            console.log("   营销比例:", marketingPercent.toString(), "%");
            console.log("   合约比例:", contractPercent.toString(), "%");
        } catch (error) {
            console.log("   ❌ 游戏配置查询失败:", error.message);
        }
        console.log("");
        
        // 测试游戏统计
        console.log("📊 游戏统计测试:");
        try {
            const maoStats = await contract.getGameStats(0);
            const piStats = await contract.getGameStats(1);
            
            console.log("   MAO游戏统计:");
            console.log("     总游戏次数:", maoStats.totalGames.toString());
            console.log("     胜利次数:", maoStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(maoStats.totalBets), "MAO");
            console.log("     总奖励:", ethers.formatEther(maoStats.totalRewards), "MAO");
            console.log("     已销毁:", ethers.formatEther(maoStats.totalBurned), "MAO");
            console.log("     营销费用:", ethers.formatEther(maoStats.totalMarketing), "MAO");
            console.log("     总利润:", ethers.formatEther(maoStats.totalProfit), "MAO");
            
            console.log("   PI游戏统计:");
            console.log("     总游戏次数:", piStats.totalGames.toString());
            console.log("     胜利次数:", piStats.totalWins.toString());
            console.log("     总投注:", ethers.formatEther(piStats.totalBets), "PI");
            console.log("     总奖励:", ethers.formatEther(piStats.totalRewards), "PI");
            console.log("     已销毁:", ethers.formatEther(piStats.totalBurned), "PI");
            console.log("     营销费用:", ethers.formatEther(piStats.totalMarketing), "PI");
            console.log("     总利润:", ethers.formatEther(piStats.totalProfit), "PI");
        } catch (error) {
            console.log("   ❌ 游戏统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试资金池状态
        console.log("💰 资金池状态测试:");
        try {
            const poolStatus = await contract.getPoolStatus();
            console.log("   MAO余额:", ethers.formatEther(poolStatus[0]), "MAO");
            console.log("   PI余额:", ethers.formatEther(poolStatus[1]), "PI");
            console.log("   资金池健康:", poolStatus[2] ? "✅ 健康" : "❌ 需要充值");
        } catch (error) {
            console.log("   ❌ 资金池状态查询失败:", error.message);
        }
        console.log("");
        
        // 测试分配统计
        console.log("📈 分配统计测试:");
        try {
            const distributionStats = await contract.getDistributionStats();
            console.log("   总销毁:", ethers.formatEther(distributionStats[0]));
            console.log("   总营销:", ethers.formatEther(distributionStats[1]));
            console.log("   总合约:", ethers.formatEther(distributionStats[2]));
            console.log("   总利润:", ethers.formatEther(distributionStats[3]));
        } catch (error) {
            console.log("   ❌ 分配统计查询失败:", error.message);
        }
        console.log("");
        
        // 测试利润统计
        console.log("💎 利润统计测试:");
        try {
            const profitStats = await contract.getProfitStats();
            console.log("   总利润:", ethers.formatEther(profitStats[0]));
            console.log("   利润率:", profitStats[1].toString(), "%");
        } catch (error) {
            console.log("   ❌ 利润统计查询失败:", error.message);
        }
        console.log("");
        
        console.log("✅ 游戏功能测试完成！");
        
    } catch (error) {
        console.error("❌ 测试失败:", error.message);
    }
}

main(); 