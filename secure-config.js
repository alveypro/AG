// 🛡️ MAO 万无一失安全配置 v9.0
const SECURE_CONFIG = {
    // 基础代币地址 (公开信息)
    MAO_TOKEN: "0x22f49bcb3dad370a9268ba3fca33cb037ca3d022",
    PI_TOKEN: "0xfd4680e25e05b3435c7f698668d1ce80d2a9f444",
    WHEEL_GAME: "0x621DF9e0DE6b4e7EDC5Dc22Cd7c0F883c3F56966",
    
    // 被盗地址黑名单 - 绝对禁止使用
    BLACKLISTED_ADDRESSES: [
        "0xE15881Fc413c6cd47a512C24608F94Fa2896b374", // 已确认被盗 - 奖金池1
        // 在此添加其他被盗地址
    ],
    
    // 安全限制
    SECURITY_LIMITS: {
        // 灵活限额控制
        normal: {
            maxSingleTransaction: "10000",
            maxDailyLimit: "50000",
            maxWeeklyLimit: "200000"
        },
        bigPrize: {
            maxSingleTransaction: "100000",
            maxDailyLimit: "500000",
            maxWeeklyLimit: "2000000",
            requiresMultisig: true
        },
        emergency: {
            maxSingleTransaction: "1000000",
            requiresTimelock: true,
            requiresFullMultisig: true
        },
        maxGasPrice: "100",              // 最大Gas价格 (Gwei)
        requiredConfirmations: 6,        // 所需确认数
        timelockDelay: 86400            // 时间锁延迟 (秒)
    },
    
    // RPC节点配置
    RPC_NODES: [
        'https://elves-core2.alvey.io',  // 优先使用core2
        'https://elves-core3.alvey.io',  // 备用core3
        'https://elves-core1.alvey.io'   // core1作为最后备用
    ],
    
    // 安全等级
    SECURITY_LEVEL: "ULTRA-SECURE",
    VERSION: "9.0",
    DEPLOYED_AT: new Date().toISOString()
};

// 导出配置（如果支持模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SECURE_CONFIG;
}
