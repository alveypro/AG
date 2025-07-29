const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 详细查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 检查合约代码
        const code = await provider.getCode(CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        console.log("");
        
        // 逐个测试不同的函数
        const functions = [
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "maoToken", abi: "function maoToken() view returns (address)" },
            { name: "piToken", abi: "function piToken() view returns (address)" },
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getRoleMember", abi: "function getRoleMember(bytes32 role, uint256 index) view returns (address)" },
            { name: "getRoleMemberCount", abi: "function getRoleMemberCount(bytes32 role) view returns (uint256)" }
        ];
        
        console.log("🔍 测试合约函数:");
        console.log("");
        
        for (const func of functions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                
                if (func.name === "getRoleMember") {
                    // 测试管理员角色
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const admin = await contract.getRoleMember(adminRole, 0);
                    console.log(`   ${func.name}: ${admin}`);
                } else if (func.name === "getRoleMemberCount") {
                    // 测试管理员数量
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const count = await contract.getRoleMemberCount(adminRole);
                    console.log(`   ${func.name}: ${count.toString()}`);
                } else {
                    const result = await contract[func.name]();
                    console.log(`   ${func.name}: ${result}`);
                }
            } catch (error) {
                console.log(`   ${func.name}: ❌ 调用失败 - ${error.message}`);
            }
        }
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 详细查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 检查合约代码
        const code = await provider.getCode(CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        console.log("");
        
        // 逐个测试不同的函数
        const functions = [
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "maoToken", abi: "function maoToken() view returns (address)" },
            { name: "piToken", abi: "function piToken() view returns (address)" },
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getRoleMember", abi: "function getRoleMember(bytes32 role, uint256 index) view returns (address)" },
            { name: "getRoleMemberCount", abi: "function getRoleMemberCount(bytes32 role) view returns (uint256)" }
        ];
        
        console.log("🔍 测试合约函数:");
        console.log("");
        
        for (const func of functions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                
                if (func.name === "getRoleMember") {
                    // 测试管理员角色
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const admin = await contract.getRoleMember(adminRole, 0);
                    console.log(`   ${func.name}: ${admin}`);
                } else if (func.name === "getRoleMemberCount") {
                    // 测试管理员数量
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const count = await contract.getRoleMemberCount(adminRole);
                    console.log(`   ${func.name}: ${count.toString()}`);
                } else {
                    const result = await contract[func.name]();
                    console.log(`   ${func.name}: ${result}`);
                }
            } catch (error) {
                console.log(`   ${func.name}: ❌ 调用失败 - ${error.message}`);
            }
        }
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 详细查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 检查合约代码
        const code = await provider.getCode(CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        console.log("");
        
        // 逐个测试不同的函数
        const functions = [
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "maoToken", abi: "function maoToken() view returns (address)" },
            { name: "piToken", abi: "function piToken() view returns (address)" },
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getRoleMember", abi: "function getRoleMember(bytes32 role, uint256 index) view returns (address)" },
            { name: "getRoleMemberCount", abi: "function getRoleMemberCount(bytes32 role) view returns (uint256)" }
        ];
        
        console.log("🔍 测试合约函数:");
        console.log("");
        
        for (const func of functions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                
                if (func.name === "getRoleMember") {
                    // 测试管理员角色
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const admin = await contract.getRoleMember(adminRole, 0);
                    console.log(`   ${func.name}: ${admin}`);
                } else if (func.name === "getRoleMemberCount") {
                    // 测试管理员数量
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const count = await contract.getRoleMemberCount(adminRole);
                    console.log(`   ${func.name}: ${count.toString()}`);
                } else {
                    const result = await contract[func.name]();
                    console.log(`   ${func.name}: ${result}`);
                }
            } catch (error) {
                console.log(`   ${func.name}: ❌ 调用失败 - ${error.message}`);
            }
        }
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 详细查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 检查合约代码
        const code = await provider.getCode(CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        console.log("");
        
        // 逐个测试不同的函数
        const functions = [
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "maoToken", abi: "function maoToken() view returns (address)" },
            { name: "piToken", abi: "function piToken() view returns (address)" },
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getRoleMember", abi: "function getRoleMember(bytes32 role, uint256 index) view returns (address)" },
            { name: "getRoleMemberCount", abi: "function getRoleMemberCount(bytes32 role) view returns (uint256)" }
        ];
        
        console.log("🔍 测试合约函数:");
        console.log("");
        
        for (const func of functions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                
                if (func.name === "getRoleMember") {
                    // 测试管理员角色
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const admin = await contract.getRoleMember(adminRole, 0);
                    console.log(`   ${func.name}: ${admin}`);
                } else if (func.name === "getRoleMemberCount") {
                    // 测试管理员数量
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const count = await contract.getRoleMemberCount(adminRole);
                    console.log(`   ${func.name}: ${count.toString()}`);
                } else {
                    const result = await contract[func.name]();
                    console.log(`   ${func.name}: ${result}`);
                }
            } catch (error) {
                console.log(`   ${func.name}: ❌ 调用失败 - ${error.message}`);
            }
        }
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 详细查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 检查合约代码
        const code = await provider.getCode(CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        console.log("");
        
        // 逐个测试不同的函数
        const functions = [
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "maoToken", abi: "function maoToken() view returns (address)" },
            { name: "piToken", abi: "function piToken() view returns (address)" },
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getRoleMember", abi: "function getRoleMember(bytes32 role, uint256 index) view returns (address)" },
            { name: "getRoleMemberCount", abi: "function getRoleMemberCount(bytes32 role) view returns (uint256)" }
        ];
        
        console.log("🔍 测试合约函数:");
        console.log("");
        
        for (const func of functions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                
                if (func.name === "getRoleMember") {
                    // 测试管理员角色
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const admin = await contract.getRoleMember(adminRole, 0);
                    console.log(`   ${func.name}: ${admin}`);
                } else if (func.name === "getRoleMemberCount") {
                    // 测试管理员数量
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const count = await contract.getRoleMemberCount(adminRole);
                    console.log(`   ${func.name}: ${count.toString()}`);
                } else {
                    const result = await contract[func.name]();
                    console.log(`   ${func.name}: ${result}`);
                }
            } catch (error) {
                console.log(`   ${func.name}: ❌ 调用失败 - ${error.message}`);
            }
        }
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 详细查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        const provider = new ethers.JsonRpcProvider("https://elves-core2.alvey.io");
        
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("");
        
        // 检查合约代码
        const code = await provider.getCode(CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        console.log("");
        
        // 逐个测试不同的函数
        const functions = [
            { name: "marketingWallet", abi: "function marketingWallet() view returns (address)" },
            { name: "prizePoolWallet", abi: "function prizePoolWallet() view returns (address)" },
            { name: "profitWallet", abi: "function profitWallet() view returns (address)" },
            { name: "maoToken", abi: "function maoToken() view returns (address)" },
            { name: "piToken", abi: "function piToken() view returns (address)" },
            { name: "adminCount", abi: "function adminCount() view returns (uint256)" },
            { name: "owner", abi: "function owner() view returns (address)" },
            { name: "getRoleMember", abi: "function getRoleMember(bytes32 role, uint256 index) view returns (address)" },
            { name: "getRoleMemberCount", abi: "function getRoleMemberCount(bytes32 role) view returns (uint256)" }
        ];
        
        console.log("🔍 测试合约函数:");
        console.log("");
        
        for (const func of functions) {
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, [func.abi], provider);
                
                if (func.name === "getRoleMember") {
                    // 测试管理员角色
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const admin = await contract.getRoleMember(adminRole, 0);
                    console.log(`   ${func.name}: ${admin}`);
                } else if (func.name === "getRoleMemberCount") {
                    // 测试管理员数量
                    const adminRole = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
                    const count = await contract.getRoleMemberCount(adminRole);
                    console.log(`   ${func.name}: ${count.toString()}`);
                } else {
                    const result = await contract[func.name]();
                    console.log(`   ${func.name}: ${result}`);
                }
            } catch (error) {
                console.log(`   ${func.name}: ❌ 调用失败 - ${error.message}`);
            }
        }
        
        console.log("");
        console.log("✅ 查询完成！");
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 