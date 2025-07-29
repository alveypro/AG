const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 查询合约钱包地址...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)", 
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 查询钱包地址
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        const adminCount = await contract.adminCount();
        
        console.log("💰 钱包地址:");
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        console.log("🪙 代币地址:");
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        console.log("👥 管理员信息:");
        console.log("   管理员数量:", adminCount.toString());
        console.log("");
        
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 查询合约钱包地址...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)", 
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 查询钱包地址
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        const adminCount = await contract.adminCount();
        
        console.log("💰 钱包地址:");
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        console.log("🪙 代币地址:");
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        console.log("👥 管理员信息:");
        console.log("   管理员数量:", adminCount.toString());
        console.log("");
        
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 查询合约钱包地址...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)", 
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 查询钱包地址
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        const adminCount = await contract.adminCount();
        
        console.log("💰 钱包地址:");
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        console.log("🪙 代币地址:");
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        console.log("👥 管理员信息:");
        console.log("   管理员数量:", adminCount.toString());
        console.log("");
        
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 查询合约钱包地址...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)", 
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 查询钱包地址
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        const adminCount = await contract.adminCount();
        
        console.log("💰 钱包地址:");
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        console.log("🪙 代币地址:");
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        console.log("👥 管理员信息:");
        console.log("   管理员数量:", adminCount.toString());
        console.log("");
        
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 查询合约钱包地址...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)", 
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 查询钱包地址
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        const adminCount = await contract.adminCount();
        
        console.log("💰 钱包地址:");
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        console.log("🪙 代币地址:");
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        console.log("👥 管理员信息:");
        console.log("   管理员数量:", adminCount.toString());
        console.log("");
        
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 查询合约钱包地址...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    const ABI = [
        "function marketingWallet() view returns (address)",
        "function prizePoolWallet() view returns (address)", 
        "function profitWallet() view returns (address)",
        "function maoToken() view returns (address)",
        "function piToken() view returns (address)",
        "function adminCount() view returns (uint256)"
    ];
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core1.alvey.io");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 查询钱包地址
        const marketingWallet = await contract.marketingWallet();
        const prizePoolWallet = await contract.prizePoolWallet();
        const profitWallet = await contract.profitWallet();
        const maoToken = await contract.maoToken();
        const piToken = await contract.piToken();
        const adminCount = await contract.adminCount();
        
        console.log("💰 钱包地址:");
        console.log("   营销钱包:", marketingWallet);
        console.log("   奖金池钱包:", prizePoolWallet);
        console.log("   利润钱包:", profitWallet);
        console.log("");
        
        console.log("🪙 代币地址:");
        console.log("   MAO Token:", maoToken);
        console.log("   PI Token:", piToken);
        console.log("");
        
        console.log("👥 管理员信息:");
        console.log("   管理员数量:", adminCount.toString());
        console.log("");
        
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 