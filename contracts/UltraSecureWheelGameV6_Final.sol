// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraSecureWheelGameV6_Final is ReentrancyGuard, AccessControl, Pausable {
    // 角色定义
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant TRUSTED_ADMIN_ROLE = keccak256("TRUSTED_ADMIN_ROLE");
    
    // 代币合约
    IERC20 public immutable maoToken;
    IERC20 public immutable piToken;
    
    // 钱包地址
    address public marketingWallet;
    address public prizePoolWallet;
    address public profitWallet;
    address public trustedOwner;
    
    // 游戏费用
    uint256 public maoGameCost = 100 * 10**18; // 100 MAO
    uint256 public piGameCost = 1000 * 10**18; // 1000 PI
    
    // 分配比例 (优化后)
    uint256 public constant BURN_PERCENTAGE = 10;      // 10% 销毁
    uint256 public constant MARKETING_PERCENTAGE = 20; // 20% 营销
    uint256 public constant REWARD_POOL_PERCENTAGE = 60; // 60% 奖励池
    uint256 public constant DEVELOPMENT_PERCENTAGE = 10; // 10% 开发基金
    
    // 胜率配置 (优化后)
    uint256 public constant BASE_WIN_RATE = 40;        // 基础胜率40%
    uint256 public constant CONSECUTIVE_LOSS_BONUS = 5; // 连续失败奖励
    uint256 public constant MAX_WIN_RATE = 60;         // 最大胜率60%
    
    // 奖励等级 (6级奖励系统 - 最终优化)
    struct RewardLevel {
        uint256 probability;  // 概率 (百分比)
        uint256 maoReward;    // MAO奖励
        uint256 piReward;     // PI奖励
        string name;          // 奖励名称
    }
    
    RewardLevel[] public rewardLevels;
    
    // 用户等级系统
    struct UserLevel {
        uint256 totalGames;
        uint256 level;        // 0=青铜, 1=白银, 2=黄金, 3=铂金, 4=钻石
        uint256 bonusRate;    // 奖励加成率
        uint256 lastGameTime;
        uint256 consecutiveDays;
    }
    
    mapping(address => UserLevel) public userLevels;
    
    // 每日奖励系统
    mapping(address => mapping(uint256 => bool)) public dailyRewards;
    mapping(address => uint256) public dailyGameCount;
    mapping(address => uint256) public lastGameDay;
    
    // 连续失败/胜利记录
    mapping(address => uint256) public consecutiveLosses;
    mapping(address => uint256) public consecutiveWins;
    
    // 游戏统计
    struct GameStats {
        uint256 totalGames;
        uint256 totalWins;
        uint256 totalBets;
        uint256 totalRewards;
        uint256 totalBurned;
        uint256 totalMarketing;
        uint256 totalProfit;
        uint256 totalDevelopment;
    }
    
    mapping(uint8 => GameStats) public gameStats; // 0=MAO, 1=PI
    
    // 玩家历史记录
    struct PlayerRecord {
        address player;
        uint8 tokenType;
        uint256 betAmount;
        uint256 rewardAmount;
        uint8 rewardLevel;
        uint256 timestamp;
        bool isWin;
        uint256 burnedAmount;
        uint256 marketingAmount;
        uint256 rewardPoolAmount;
        uint256 developmentAmount;
        uint256 userBonus;
        uint256 dailyBonus;
    }
    
    mapping(address => PlayerRecord[]) public playerHistory;
    
    // 事件
    event GamePlayed(address indexed player, uint8 tokenType, uint256 betAmount, uint256 rewardAmount, bool isWin);
    event TokenBurned(address indexed token, uint256 amount);
    event MarketingFeeCollected(address indexed token, uint256 amount);
    event DevelopmentFeeCollected(address indexed token, uint256 amount);
    event UserLevelUp(address indexed player, uint256 newLevel, uint256 bonusRate);
    event DailyRewardClaimed(address indexed player, uint256 day, uint256 bonus);
    event ConsecutiveBonus(address indexed player, uint256 consecutiveCount, uint256 bonus);
    
    constructor(
        address _maoToken,
        address _piToken,
        address[] memory _adminAddresses,
        address _trustedOwner,
        address _prizePoolWallet,
        address _profitWallet,
        address _marketingWallet
    ) {
        maoToken = IERC20(_maoToken);
        piToken = IERC20(_piToken);
        trustedOwner = _trustedOwner;
        prizePoolWallet = _prizePoolWallet;
        profitWallet = _profitWallet;
        marketingWallet = _marketingWallet;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _trustedOwner);
        _grantRole(TRUSTED_ADMIN_ROLE, _trustedOwner);
        _grantRole(EMERGENCY_ROLE, _trustedOwner);
        
        for (uint i = 0; i < _adminAddresses.length; i++) {
            _grantRole(ADMIN_ROLE, _adminAddresses[i]);
        }
        
        // 初始化奖励等级
        _initializeRewardLevels();
    }
    
    function _initializeRewardLevels() private {
        // 特等奖 (0.1%) - 120倍奖励
        rewardLevels.push(RewardLevel({
            probability: 1,
            maoReward: 12000 * 10**18, // 12000 MAO (120倍)
            piReward: 120000 * 10**18, // 120000 PI (120倍)
            name: "Special Prize"
        }));
        
        // 一等奖 (0.5%) - 25倍奖励
        rewardLevels.push(RewardLevel({
            probability: 5,
            maoReward: 2500 * 10**18,  // 2500 MAO (25倍)
            piReward: 25000 * 10**18,  // 25000 PI (25倍)
            name: "First Prize"
        }));
        
        // 二等奖 (2%) - 6倍奖励
        rewardLevels.push(RewardLevel({
            probability: 20,
            maoReward: 600 * 10**18,   // 600 MAO (6倍)
            piReward: 6000 * 10**18,   // 6000 PI (6倍)
            name: "Second Prize"
        }));
        
        // 三等奖 (5%) - 2.5倍奖励
        rewardLevels.push(RewardLevel({
            probability: 50,
            maoReward: 250 * 10**18,   // 250 MAO (2.5倍)
            piReward: 2500 * 10**18,   // 2500 PI (2.5倍)
            name: "Third Prize"
        }));
        
        // 四等奖 (15%) - 1.2倍奖励
        rewardLevels.push(RewardLevel({
            probability: 150,
            maoReward: 120 * 10**18,   // 120 MAO (1.2倍)
            piReward: 1200 * 10**18,   // 1200 PI (1.2倍)
            name: "Fourth Prize"
        }));
        
        // 安慰奖 (17.4%) - 0.8倍奖励
        rewardLevels.push(RewardLevel({
            probability: 174,
            maoReward: 80 * 10**18,    // 80 MAO (0.8倍)
            piReward: 800 * 10**18,    // 800 PI (0.8倍)
            name: "Consolation Prize"
        }));
    }
    
    // 游戏入口函数
    function playMAOGame() external nonReentrant whenNotPaused {
        _playGame(0);
    }
    
    function playPIGame() external nonReentrant whenNotPaused {
        _playGame(1);
    }
    
    function _playGame(uint8 tokenType) private {
        IERC20 token = tokenType == 0 ? maoToken : piToken;
        uint256 gameCost = tokenType == 0 ? maoGameCost : piGameCost;
        
        require(token.transferFrom(msg.sender, address(this), gameCost), "Transfer failed");
        
        // 计算动态胜率
        uint256 dynamicWinRate = _calculateDynamicWinRate(msg.sender);
        
        // 分配代币
        (uint256 burnedAmount, uint256 marketingAmount, uint256 rewardPoolAmount, uint256 developmentAmount) = _distributeTokens(token, gameCost);
        
        // 计算奖励
        (uint256 rewardAmount, uint8 rewardLevel, bool isWin) = _calculateReward(dynamicWinRate, tokenType, rewardPoolAmount);
        
        // 计算用户奖励加成
        uint256 userBonus = _calculateUserBonus(msg.sender, rewardAmount);
        uint256 dailyBonus = _calculateDailyBonus(msg.sender, rewardAmount);
        
        uint256 totalReward = rewardAmount + userBonus + dailyBonus;
        
        if (totalReward > 0) {
            require(token.transfer(msg.sender, totalReward), "Reward transfer failed");
        }
        
        // 更新用户状态
        _updateUserState(msg.sender, isWin);
        
        // 记录游戏
        _recordGame(msg.sender, tokenType, gameCost, totalReward, rewardLevel, burnedAmount, marketingAmount, rewardPoolAmount, developmentAmount, userBonus, dailyBonus);
        
        emit GamePlayed(msg.sender, tokenType, gameCost, totalReward, isWin);
    }
    
    function _calculateDynamicWinRate(address player) private view returns (uint256) {
        uint256 baseRate = BASE_WIN_RATE;
        uint256 lossBonus = (consecutiveLosses[player] / 3) * CONSECUTIVE_LOSS_BONUS;
        uint256 winPenalty = (consecutiveWins[player] / 3) * 2;
        
        uint256 dynamicRate = baseRate + lossBonus - winPenalty;
        
        if (dynamicRate > MAX_WIN_RATE) {
            dynamicRate = MAX_WIN_RATE;
        }
        
        return dynamicRate;
    }
    
    function _calculateReward(uint256 winRate, uint8 tokenType, uint256 availableAmount) private view returns (uint256 rewardAmount, uint8 rewardLevel, bool isWin) {
        uint256 randomSeed = _generateRandomSeed();
        uint256 chance = randomSeed % 1000;
        
        if (chance < winRate * 10) {
            isWin = true;
            
            // 根据概率选择奖励等级
            uint256 cumulativeProb = 0;
            for (uint8 i = 0; i < rewardLevels.length; i++) {
                cumulativeProb += rewardLevels[i].probability;
                if (chance < cumulativeProb) {
                    rewardLevel = i;
                    rewardAmount = tokenType == 0 ? rewardLevels[i].maoReward : rewardLevels[i].piReward;
                    break;
                }
            }
            
            // 限制最大奖励
            uint256 maxReward = (availableAmount * 80) / 100;
            if (rewardAmount > maxReward) {
                rewardAmount = maxReward;
            }
        } else {
            isWin = false;
            rewardLevel = 0;
            rewardAmount = 0;
        }
    }
    
    function _calculateUserBonus(address player, uint256 baseReward) private view returns (uint256) {
        UserLevel memory level = userLevels[player];
        return (baseReward * level.bonusRate) / 100;
    }
    
    function _calculateDailyBonus(address player, uint256 baseReward) private view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        uint256 dailyCount = dailyGameCount[player];
        
        if (dailyCount == 1 && !dailyRewards[player][today]) {
            return baseReward; // 每日首次游戏免费
        } else if (dailyCount == 10) {
            return baseReward; // 第10次游戏双倍
        } else if (dailyCount == 50) {
            return baseReward * 2; // 第50次游戏三倍
        }
        
        return 0;
    }
    
    function _updateUserState(address player, bool isWin) private {
        uint256 today = block.timestamp / 1 days;
        UserLevel storage level = userLevels[player];
        
        level.totalGames++;
        
        if (lastGameDay[player] != today) {
            dailyGameCount[player] = 1;
            lastGameDay[player] = today;
        } else {
            dailyGameCount[player]++;
        }
        
        if (isWin) {
            consecutiveWins[player]++;
            consecutiveLosses[player] = 0;
        } else {
            consecutiveLosses[player]++;
            consecutiveWins[player] = 0;
        }
        
        uint256 newLevel = _calculateUserLevel(level.totalGames);
        if (newLevel > level.level) {
            level.level = newLevel;
            level.bonusRate = newLevel * 5;
            emit UserLevelUp(player, newLevel, level.bonusRate);
        }
        
        if (level.lastGameTime == 0 || (block.timestamp - level.lastGameTime) <= 1 days) {
            level.consecutiveDays++;
        } else {
            level.consecutiveDays = 1;
        }
        level.lastGameTime = block.timestamp;
    }
    
    function _calculateUserLevel(uint256 totalGames) private pure returns (uint256) {
        if (totalGames >= 5000) return 4; // 钻石
        if (totalGames >= 1000) return 3; // 铂金
        if (totalGames >= 500) return 2;  // 黄金
        if (totalGames >= 100) return 1;  // 白银
        return 0; // 青铜
    }
    
    function _distributeTokens(IERC20 token, uint256 amount) private returns (uint256 burnedAmount, uint256 marketingAmount, uint256 rewardPoolAmount, uint256 developmentAmount) {
        burnedAmount = (amount * BURN_PERCENTAGE) / 100;
        marketingAmount = (amount * MARKETING_PERCENTAGE) / 100;
        rewardPoolAmount = (amount * REWARD_POOL_PERCENTAGE) / 100;
        developmentAmount = (amount * DEVELOPMENT_PERCENTAGE) / 100;
        
        if (burnedAmount > 0) {
            _burnTokens(token, burnedAmount);
        }
        
        if (marketingAmount > 0) {
            require(token.transfer(marketingWallet, marketingAmount), "Marketing transfer failed");
            emit MarketingFeeCollected(address(token), marketingAmount);
        }
        
        if (developmentAmount > 0) {
            require(token.transfer(profitWallet, developmentAmount), "Development transfer failed");
            emit DevelopmentFeeCollected(address(token), developmentAmount);
        }
    }
    
    function _burnTokens(IERC20 token, uint256 amount) private {
        require(token.transfer(address(0), amount), "Burn transfer failed");
        emit TokenBurned(address(token), amount);
    }
    
    function _recordGame(
        address player,
        uint8 tokenType,
        uint256 betAmount,
        uint256 rewardAmount,
        uint8 rewardLevel,
        uint256 burnedAmount,
        uint256 marketingAmount,
        uint256 rewardPoolAmount,
        uint256 developmentAmount,
        uint256 userBonus,
        uint256 dailyBonus
    ) private {
        GameStats storage stats = gameStats[tokenType];
        stats.totalGames++;
        stats.totalBets += betAmount;
        stats.totalBurned += burnedAmount;
        stats.totalMarketing += marketingAmount;
        stats.totalDevelopment += developmentAmount;
        
        if (rewardAmount > 0) {
            stats.totalWins++;
            stats.totalRewards += rewardAmount;
        }
        
        playerHistory[player].push(PlayerRecord({
            player: player,
            tokenType: tokenType,
            betAmount: betAmount,
            rewardAmount: rewardAmount,
            rewardLevel: rewardLevel,
            timestamp: block.timestamp,
            isWin: rewardAmount > 0,
            burnedAmount: burnedAmount,
            marketingAmount: marketingAmount,
            rewardPoolAmount: rewardPoolAmount,
            developmentAmount: developmentAmount,
            userBonus: userBonus,
            dailyBonus: dailyBonus
        }));
    }
    
    function _generateRandomSeed() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            blockhash(block.number - 1)
        )));
    }
    
    // 查询功能
    function getPlayerHistory(address player) external view returns (PlayerRecord[] memory) {
        return playerHistory[player];
    }
    
    function getUserLevel(address player) external view returns (UserLevel memory) {
        return userLevels[player];
    }
    
    function getRewardLevels() external view returns (RewardLevel[] memory) {
        return rewardLevels;
    }
    
    function getGameStats(uint8 tokenType) external view returns (GameStats memory) {
        return gameStats[tokenType];
    }
    
    function getPoolStatus() external view returns (uint256 maoBalance, uint256 piBalance, bool isHealthy) {
        maoBalance = maoToken.balanceOf(address(this));
        piBalance = piToken.balanceOf(address(this));
        isHealthy = maoBalance >= maoGameCost * 50 && piBalance >= piGameCost * 50;
    }
    
    // 管理员功能
    function setGameCost(uint8 tokenType, uint256 newCost) external onlyRole(ADMIN_ROLE) {
        require(newCost > 0, "Invalid cost");
        if (tokenType == 0) {
            maoGameCost = newCost;
        } else {
            piGameCost = newCost;
        }
    }
    
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }
    
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(EMERGENCY_ROLE) whenPaused {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(msg.sender, amount);
    }
} 