const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 查找合约中的钱包相关函数...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试各种可能的函数名
        const possibleFunctions = [
            // 营销钱包相关
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "marketing", abi: "function marketing() view returns (address)" },
            { name: "marketingAddress", abi: "function marketingAddress() view returns (address)" },
            
            // 奖金池相关
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "prizePool", abi: "function prizePool() view returns (address)" },
            { name: "poolWallet", abi: "function poolWallet() view returns (address)" },
            { name: "prizeWallet", abi: "function prizeWallet() view returns (address)" },
            { name: "rewardWallet", abi: "function rewardWallet() view returns (address)" },
            
            // 利润钱包相关
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "profit", abi: "function profit() view returns (address)" },
            { name: "revenueWallet", abi: "function revenueWallet() view returns (address)" },
            { name: "treasuryWallet", abi: "function treasuryWallet() view returns (address)" },
            
            // 管理员相关
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "admin", abi: "function admin() view returns (address)" },
            { name: "administrator", abi: "function administrator() view returns (address)" },
            { name: "getAdminCount", abi: "function getAdminCount() view returns (uint256)" },
            
            // 其他可能的函数
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getOwner", abi: "function getOwner() view returns (address)" },
            { name: "contractOwner", abi: "function contractOwner() view returns (address)" }
        ];
        
        console.log("🔍 测试可能的函数:");
        console.log("");
        
        const workingFunctions = [];
        
        for (const func of possibleFunctions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                const result = await contract[func.name]();
                console.log(`✅ ${func.name}: ${result}`);
                workingFunctions.push({ name: func.name, value: result });
            } catch (error) {
                console.log(`❌ ${func.name}: 调用失败`);
            }
        }
        
        console.log("");
        console.log("📊 查询结果总结:");
        console.log("");
        
        if (workingFunctions.length > 0) {
            console.log("✅ 成功查询到的函数:");
            workingFunctions.forEach(func => {
                console.log(`   ${func.name}: ${func.value}`);
            });
        } else {
            console.log("❌ 没有找到任何可用的函数");
        }
        
        console.log("");
        console.log("💡 已知信息:");
        console.log("   营销钱包: 0x861A48051eFaA1876D4B38904516C9F7bbCca36d (用户提供)");
        console.log("   MAO Token: 0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022");
        console.log("   PI Token: 0xFd4680e25E05b3435C7F698668d1ce80D2a9F444");
        console.log("   Owner: 0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408");
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 查找合约中的钱包相关函数...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试各种可能的函数名
        const possibleFunctions = [
            // 营销钱包相关
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "marketing", abi: "function marketing() view returns (address)" },
            { name: "marketingAddress", abi: "function marketingAddress() view returns (address)" },
            
            // 奖金池相关
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "prizePool", abi: "function prizePool() view returns (address)" },
            { name: "poolWallet", abi: "function poolWallet() view returns (address)" },
            { name: "prizeWallet", abi: "function prizeWallet() view returns (address)" },
            { name: "rewardWallet", abi: "function rewardWallet() view returns (address)" },
            
            // 利润钱包相关
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "profit", abi: "function profit() view returns (address)" },
            { name: "revenueWallet", abi: "function revenueWallet() view returns (address)" },
            { name: "treasuryWallet", abi: "function treasuryWallet() view returns (address)" },
            
            // 管理员相关
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "admin", abi: "function admin() view returns (address)" },
            { name: "administrator", abi: "function administrator() view returns (address)" },
            { name: "getAdminCount", abi: "function getAdminCount() view returns (uint256)" },
            
            // 其他可能的函数
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getOwner", abi: "function getOwner() view returns (address)" },
            { name: "contractOwner", abi: "function contractOwner() view returns (address)" }
        ];
        
        console.log("🔍 测试可能的函数:");
        console.log("");
        
        const workingFunctions = [];
        
        for (const func of possibleFunctions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                const result = await contract[func.name]();
                console.log(`✅ ${func.name}: ${result}`);
                workingFunctions.push({ name: func.name, value: result });
            } catch (error) {
                console.log(`❌ ${func.name}: 调用失败`);
            }
        }
        
        console.log("");
        console.log("📊 查询结果总结:");
        console.log("");
        
        if (workingFunctions.length > 0) {
            console.log("✅ 成功查询到的函数:");
            workingFunctions.forEach(func => {
                console.log(`   ${func.name}: ${func.value}`);
            });
        } else {
            console.log("❌ 没有找到任何可用的函数");
        }
        
        console.log("");
        console.log("💡 已知信息:");
        console.log("   营销钱包: 0x861A48051eFaA1876D4B38904516C9F7bbCca36d (用户提供)");
        console.log("   MAO Token: 0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022");
        console.log("   PI Token: 0xFd4680e25E05b3435C7F698668d1ce80D2a9F444");
        console.log("   Owner: 0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408");
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 查找合约中的钱包相关函数...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试各种可能的函数名
        const possibleFunctions = [
            // 营销钱包相关
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "marketing", abi: "function marketing() view returns (address)" },
            { name: "marketingAddress", abi: "function marketingAddress() view returns (address)" },
            
            // 奖金池相关
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "prizePool", abi: "function prizePool() view returns (address)" },
            { name: "poolWallet", abi: "function poolWallet() view returns (address)" },
            { name: "prizeWallet", abi: "function prizeWallet() view returns (address)" },
            { name: "rewardWallet", abi: "function rewardWallet() view returns (address)" },
            
            // 利润钱包相关
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "profit", abi: "function profit() view returns (address)" },
            { name: "revenueWallet", abi: "function revenueWallet() view returns (address)" },
            { name: "treasuryWallet", abi: "function treasuryWallet() view returns (address)" },
            
            // 管理员相关
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "admin", abi: "function admin() view returns (address)" },
            { name: "administrator", abi: "function administrator() view returns (address)" },
            { name: "getAdminCount", abi: "function getAdminCount() view returns (uint256)" },
            
            // 其他可能的函数
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getOwner", abi: "function getOwner() view returns (address)" },
            { name: "contractOwner", abi: "function contractOwner() view returns (address)" }
        ];
        
        console.log("🔍 测试可能的函数:");
        console.log("");
        
        const workingFunctions = [];
        
        for (const func of possibleFunctions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                const result = await contract[func.name]();
                console.log(`✅ ${func.name}: ${result}`);
                workingFunctions.push({ name: func.name, value: result });
            } catch (error) {
                console.log(`❌ ${func.name}: 调用失败`);
            }
        }
        
        console.log("");
        console.log("📊 查询结果总结:");
        console.log("");
        
        if (workingFunctions.length > 0) {
            console.log("✅ 成功查询到的函数:");
            workingFunctions.forEach(func => {
                console.log(`   ${func.name}: ${func.value}`);
            });
        } else {
            console.log("❌ 没有找到任何可用的函数");
        }
        
        console.log("");
        console.log("💡 已知信息:");
        console.log("   营销钱包: 0x861A48051eFaA1876D4B38904516C9F7bbCca36d (用户提供)");
        console.log("   MAO Token: 0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022");
        console.log("   PI Token: 0xFd4680e25E05b3435C7F698668d1ce80D2a9F444");
        console.log("   Owner: 0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408");
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 查找合约中的钱包相关函数...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试各种可能的函数名
        const possibleFunctions = [
            // 营销钱包相关
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "marketing", abi: "function marketing() view returns (address)" },
            { name: "marketingAddress", abi: "function marketingAddress() view returns (address)" },
            
            // 奖金池相关
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "prizePool", abi: "function prizePool() view returns (address)" },
            { name: "poolWallet", abi: "function poolWallet() view returns (address)" },
            { name: "prizeWallet", abi: "function prizeWallet() view returns (address)" },
            { name: "rewardWallet", abi: "function rewardWallet() view returns (address)" },
            
            // 利润钱包相关
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "profit", abi: "function profit() view returns (address)" },
            { name: "revenueWallet", abi: "function revenueWallet() view returns (address)" },
            { name: "treasuryWallet", abi: "function treasuryWallet() view returns (address)" },
            
            // 管理员相关
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "admin", abi: "function admin() view returns (address)" },
            { name: "administrator", abi: "function administrator() view returns (address)" },
            { name: "getAdminCount", abi: "function getAdminCount() view returns (uint256)" },
            
            // 其他可能的函数
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getOwner", abi: "function getOwner() view returns (address)" },
            { name: "contractOwner", abi: "function contractOwner() view returns (address)" }
        ];
        
        console.log("🔍 测试可能的函数:");
        console.log("");
        
        const workingFunctions = [];
        
        for (const func of possibleFunctions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                const result = await contract[func.name]();
                console.log(`✅ ${func.name}: ${result}`);
                workingFunctions.push({ name: func.name, value: result });
            } catch (error) {
                console.log(`❌ ${func.name}: 调用失败`);
            }
        }
        
        console.log("");
        console.log("📊 查询结果总结:");
        console.log("");
        
        if (workingFunctions.length > 0) {
            console.log("✅ 成功查询到的函数:");
            workingFunctions.forEach(func => {
                console.log(`   ${func.name}: ${func.value}`);
            });
        } else {
            console.log("❌ 没有找到任何可用的函数");
        }
        
        console.log("");
        console.log("💡 已知信息:");
        console.log("   营销钱包: 0x861A48051eFaA1876D4B38904516C9F7bbCca36d (用户提供)");
        console.log("   MAO Token: 0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022");
        console.log("   PI Token: 0xFd4680e25E05b3435C7F698668d1ce80D2a9F444");
        console.log("   Owner: 0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408");
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 查找合约中的钱包相关函数...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试各种可能的函数名
        const possibleFunctions = [
            // 营销钱包相关
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "marketing", abi: "function marketing() view returns (address)" },
            { name: "marketingAddress", abi: "function marketingAddress() view returns (address)" },
            
            // 奖金池相关
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "prizePool", abi: "function prizePool() view returns (address)" },
            { name: "poolWallet", abi: "function poolWallet() view returns (address)" },
            { name: "prizeWallet", abi: "function prizeWallet() view returns (address)" },
            { name: "rewardWallet", abi: "function rewardWallet() view returns (address)" },
            
            // 利润钱包相关
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "profit", abi: "function profit() view returns (address)" },
            { name: "revenueWallet", abi: "function revenueWallet() view returns (address)" },
            { name: "treasuryWallet", abi: "function treasuryWallet() view returns (address)" },
            
            // 管理员相关
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "admin", abi: "function admin() view returns (address)" },
            { name: "administrator", abi: "function administrator() view returns (address)" },
            { name: "getAdminCount", abi: "function getAdminCount() view returns (uint256)" },
            
            // 其他可能的函数
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getOwner", abi: "function getOwner() view returns (address)" },
            { name: "contractOwner", abi: "function contractOwner() view returns (address)" }
        ];
        
        console.log("🔍 测试可能的函数:");
        console.log("");
        
        const workingFunctions = [];
        
        for (const func of possibleFunctions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                const result = await contract[func.name]();
                console.log(`✅ ${func.name}: ${result}`);
                workingFunctions.push({ name: func.name, value: result });
            } catch (error) {
                console.log(`❌ ${func.name}: 调用失败`);
            }
        }
        
        console.log("");
        console.log("📊 查询结果总结:");
        console.log("");
        
        if (workingFunctions.length > 0) {
            console.log("✅ 成功查询到的函数:");
            workingFunctions.forEach(func => {
                console.log(`   ${func.name}: ${func.value}`);
            });
        } else {
            console.log("❌ 没有找到任何可用的函数");
        }
        
        console.log("");
        console.log("💡 已知信息:");
        console.log("   营销钱包: 0x861A48051eFaA1876D4B38904516C9F7bbCca36d (用户提供)");
        console.log("   MAO Token: 0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022");
        console.log("   PI Token: 0xFd4680e25E05b3435C7F698668d1ce80D2a9F444");
        console.log("   Owner: 0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408");
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 查找合约中的钱包相关函数...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 测试各种可能的函数名
        const possibleFunctions = [
            // 营销钱包相关
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "marketing", abi: "function marketing() view returns (address)" },
            { name: "marketingAddress", abi: "function marketingAddress() view returns (address)" },
            
            // 奖金池相关
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "prizePool", abi: "function prizePool() view returns (address)" },
            { name: "poolWallet", abi: "function poolWallet() view returns (address)" },
            { name: "prizeWallet", abi: "function prizeWallet() view returns (address)" },
            { name: "rewardWallet", abi: "function rewardWallet() view returns (address)" },
            
            // 利润钱包相关
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "profit", abi: "function profit() view returns (address)" },
            { name: "revenueWallet", abi: "function revenueWallet() view returns (address)" },
            { name: "treasuryWallet", abi: "function treasuryWallet() view returns (address)" },
            
            // 管理员相关
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "admin", abi: "function admin() view returns (address)" },
            { name: "administrator", abi: "function administrator() view returns (address)" },
            { name: "getAdminCount", abi: "function getAdminCount() view returns (uint256)" },
            
            // 其他可能的函数
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getOwner", abi: "function getOwner() view returns (address)" },
            { name: "contractOwner", abi: "function contractOwner() view returns (address)" }
        ];
        
        console.log("🔍 测试可能的函数:");
        console.log("");
        
        const workingFunctions = [];
        
        for (const func of possibleFunctions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                const result = await contract[func.name]();
                console.log(`✅ ${func.name}: ${result}`);
                workingFunctions.push({ name: func.name, value: result });
            } catch (error) {
                console.log(`❌ ${func.name}: 调用失败`);
            }
        }
        
        console.log("");
        console.log("📊 查询结果总结:");
        console.log("");
        
        if (workingFunctions.length > 0) {
            console.log("✅ 成功查询到的函数:");
            workingFunctions.forEach(func => {
                console.log(`   ${func.name}: ${func.value}`);
            });
        } else {
            console.log("❌ 没有找到任何可用的函数");
        }
        
        console.log("");
        console.log("💡 已知信息:");
        console.log("   营销钱包: 0x861A48051eFaA1876D4B38904516C9F7bbCca36d (用户提供)");
        console.log("   MAO Token: 0x22f49BCb3DAd370a9268bA3Fca33cB037ca3d022");
        console.log("   PI Token: 0xFd4680e25E05b3435C7F698668d1ce80D2a9F444");
        console.log("   Owner: 0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408");
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 