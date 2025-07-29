const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 简单查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        // 尝试不同的RPC节点
        const rpcUrls = [
            "https://elves-core1.alvey.io",
            "https://elves-core2.alvey.io", 
            "https://elves-core3.alvey.io"
        ];
        
        let provider;
        for (const rpcUrl of rpcUrls) {
            try {
                console.log(`尝试连接: ${rpcUrl}`);
                provider = new ethers.JsonRpcProvider(rpcUrl);
                await provider.getNetwork();
                console.log(`✅ 连接成功: ${rpcUrl}`);
                break;
            } catch (error) {
                console.log(`❌ 连接失败: ${rpcUrl}`);
            }
        }
        
        if (!provider) {
            throw new Error("无法连接到任何RPC节点");
        }
        
        // 检查合约是否存在
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === "0x") {
            console.log("❌ 合约地址不存在或为空");
            return;
        }
        
        console.log("✅ 合约地址存在");
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        
        // 尝试获取区块信息
        const blockNumber = await provider.getBlockNumber();
        console.log("📦 当前区块:", blockNumber);
        
        // 尝试简单的合约调用
        const simpleABI = [
            "function marketingWallet() view returns (address)"
        ];
        
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, simpleABI, provider);
            const marketingWallet = await contract.marketingWallet();
            console.log("💰 营销钱包:", marketingWallet);
        } catch (error) {
            console.log("⚠️ 无法调用marketingWallet函数:", error.message);
        }
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 简单查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        // 尝试不同的RPC节点
        const rpcUrls = [
            "https://elves-core1.alvey.io",
            "https://elves-core2.alvey.io", 
            "https://elves-core3.alvey.io"
        ];
        
        let provider;
        for (const rpcUrl of rpcUrls) {
            try {
                console.log(`尝试连接: ${rpcUrl}`);
                provider = new ethers.JsonRpcProvider(rpcUrl);
                await provider.getNetwork();
                console.log(`✅ 连接成功: ${rpcUrl}`);
                break;
            } catch (error) {
                console.log(`❌ 连接失败: ${rpcUrl}`);
            }
        }
        
        if (!provider) {
            throw new Error("无法连接到任何RPC节点");
        }
        
        // 检查合约是否存在
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === "0x") {
            console.log("❌ 合约地址不存在或为空");
            return;
        }
        
        console.log("✅ 合约地址存在");
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        
        // 尝试获取区块信息
        const blockNumber = await provider.getBlockNumber();
        console.log("📦 当前区块:", blockNumber);
        
        // 尝试简单的合约调用
        const simpleABI = [
            "function marketingWallet() view returns (address)"
        ];
        
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, simpleABI, provider);
            const marketingWallet = await contract.marketingWallet();
            console.log("💰 营销钱包:", marketingWallet);
        } catch (error) {
            console.log("⚠️ 无法调用marketingWallet函数:", error.message);
        }
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 简单查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        // 尝试不同的RPC节点
        const rpcUrls = [
            "https://elves-core1.alvey.io",
            "https://elves-core2.alvey.io", 
            "https://elves-core3.alvey.io"
        ];
        
        let provider;
        for (const rpcUrl of rpcUrls) {
            try {
                console.log(`尝试连接: ${rpcUrl}`);
                provider = new ethers.JsonRpcProvider(rpcUrl);
                await provider.getNetwork();
                console.log(`✅ 连接成功: ${rpcUrl}`);
                break;
            } catch (error) {
                console.log(`❌ 连接失败: ${rpcUrl}`);
            }
        }
        
        if (!provider) {
            throw new Error("无法连接到任何RPC节点");
        }
        
        // 检查合约是否存在
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === "0x") {
            console.log("❌ 合约地址不存在或为空");
            return;
        }
        
        console.log("✅ 合约地址存在");
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        
        // 尝试获取区块信息
        const blockNumber = await provider.getBlockNumber();
        console.log("📦 当前区块:", blockNumber);
        
        // 尝试简单的合约调用
        const simpleABI = [
            "function marketingWallet() view returns (address)"
        ];
        
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, simpleABI, provider);
            const marketingWallet = await contract.marketingWallet();
            console.log("💰 营销钱包:", marketingWallet);
        } catch (error) {
            console.log("⚠️ 无法调用marketingWallet函数:", error.message);
        }
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 简单查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        // 尝试不同的RPC节点
        const rpcUrls = [
            "https://elves-core1.alvey.io",
            "https://elves-core2.alvey.io", 
            "https://elves-core3.alvey.io"
        ];
        
        let provider;
        for (const rpcUrl of rpcUrls) {
            try {
                console.log(`尝试连接: ${rpcUrl}`);
                provider = new ethers.JsonRpcProvider(rpcUrl);
                await provider.getNetwork();
                console.log(`✅ 连接成功: ${rpcUrl}`);
                break;
            } catch (error) {
                console.log(`❌ 连接失败: ${rpcUrl}`);
            }
        }
        
        if (!provider) {
            throw new Error("无法连接到任何RPC节点");
        }
        
        // 检查合约是否存在
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === "0x") {
            console.log("❌ 合约地址不存在或为空");
            return;
        }
        
        console.log("✅ 合约地址存在");
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        
        // 尝试获取区块信息
        const blockNumber = await provider.getBlockNumber();
        console.log("📦 当前区块:", blockNumber);
        
        // 尝试简单的合约调用
        const simpleABI = [
            "function marketingWallet() view returns (address)"
        ];
        
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, simpleABI, provider);
            const marketingWallet = await contract.marketingWallet();
            console.log("💰 营销钱包:", marketingWallet);
        } catch (error) {
            console.log("⚠️ 无法调用marketingWallet函数:", error.message);
        }
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 简单查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        // 尝试不同的RPC节点
        const rpcUrls = [
            "https://elves-core1.alvey.io",
            "https://elves-core2.alvey.io", 
            "https://elves-core3.alvey.io"
        ];
        
        let provider;
        for (const rpcUrl of rpcUrls) {
            try {
                console.log(`尝试连接: ${rpcUrl}`);
                provider = new ethers.JsonRpcProvider(rpcUrl);
                await provider.getNetwork();
                console.log(`✅ 连接成功: ${rpcUrl}`);
                break;
            } catch (error) {
                console.log(`❌ 连接失败: ${rpcUrl}`);
            }
        }
        
        if (!provider) {
            throw new Error("无法连接到任何RPC节点");
        }
        
        // 检查合约是否存在
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === "0x") {
            console.log("❌ 合约地址不存在或为空");
            return;
        }
        
        console.log("✅ 合约地址存在");
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        
        // 尝试获取区块信息
        const blockNumber = await provider.getBlockNumber();
        console.log("📦 当前区块:", blockNumber);
        
        // 尝试简单的合约调用
        const simpleABI = [
            "function marketingWallet() view returns (address)"
        ];
        
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, simpleABI, provider);
            const marketingWallet = await contract.marketingWallet();
            console.log("💰 营销钱包:", marketingWallet);
        } catch (error) {
            console.log("⚠️ 无法调用marketingWallet函数:", error.message);
        }
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 

async function main() {
    console.log("🔍 简单查询合约信息...");
    
    const CONTRACT_ADDRESS = "0x2Ba6025C49681d55e9a2504C62b2253D2F79e913";
    
    try {
        // 尝试不同的RPC节点
        const rpcUrls = [
            "https://elves-core1.alvey.io",
            "https://elves-core2.alvey.io", 
            "https://elves-core3.alvey.io"
        ];
        
        let provider;
        for (const rpcUrl of rpcUrls) {
            try {
                console.log(`尝试连接: ${rpcUrl}`);
                provider = new ethers.JsonRpcProvider(rpcUrl);
                await provider.getNetwork();
                console.log(`✅ 连接成功: ${rpcUrl}`);
                break;
            } catch (error) {
                console.log(`❌ 连接失败: ${rpcUrl}`);
            }
        }
        
        if (!provider) {
            throw new Error("无法连接到任何RPC节点");
        }
        
        // 检查合约是否存在
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === "0x") {
            console.log("❌ 合约地址不存在或为空");
            return;
        }
        
        console.log("✅ 合约地址存在");
        console.log("📋 合约地址:", CONTRACT_ADDRESS);
        console.log("📄 合约代码长度:", code.length);
        
        // 尝试获取区块信息
        const blockNumber = await provider.getBlockNumber();
        console.log("📦 当前区块:", blockNumber);
        
        // 尝试简单的合约调用
        const simpleABI = [
            "function marketingWallet() view returns (address)"
        ];
        
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESS, simpleABI, provider);
            const marketingWallet = await contract.marketingWallet();
            console.log("💰 营销钱包:", marketingWallet);
        } catch (error) {
            console.log("⚠️ 无法调用marketingWallet函数:", error.message);
        }
        
    } catch (error) {
        console.error("❌ 查询失败:", error.message);
    }
}

main(); 