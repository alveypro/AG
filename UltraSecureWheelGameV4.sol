// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraSecureWheelGameV4 is ReentrancyGuard, AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    uint256 public constant MIN_ADMIN_COUNT = 5;
    uint256 public adminCount;
    
    uint256 public maoGameCost = 100 * 10**18;
    uint256 public piGameCost = 1000 * 10**18;
    
    // 代币分配比例
    uint256 public constant BURN_PERCENTAGE = 15;      // 15% 销毁
    uint256 public constant MARKETING_PERCENTAGE = 15; // 15% 营销钱包
    uint256 public constant CONTRACT_PERCENTAGE = 70;  // 70% 合约
    
    IERC20 public maoToken;
    IERC20 public piToken;
    
    // 钱包地址
    address public prizePoolWallet;
    address public profitWallet;
    address public marketingWallet;
    
    mapping(address => bool) public blacklistedAddresses;
    
    // 销毁统计
    uint256 public totalBurnedMAO;
    uint256 public totalBurnedPI;
    uint256 public totalMarketingMAO;
    uint256 public totalMarketingPI;
    
    struct GameStats {
        uint256 totalGames;
        uint256 totalWins;
        uint256 totalBets;
        uint256 totalRewards;
        uint256 totalBurned;
        uint256 totalMarketing;
        uint256 totalProfit;
    }
    
    mapping(uint8 => GameStats) public gameStats;
    
    event GamePlayed(
        address indexed player,
        uint8 tokenType,
        uint256 betAmount,
        uint256 rewardAmount,
        uint8 rewardLevel,
        uint256 burnedAmount,
        uint256 marketingAmount,
        uint256 contractAmount,
        uint256 profitAmount
    );
    
    event TokenBurned(address indexed token, uint256 amount);
    event MarketingFeeCollected(address indexed token, uint256 amount);

    modifier onlyTrustedAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");
        require(!blacklistedAddresses[msg.sender], "Admin is blacklisted");
        _;
    }
    
    modifier notBlacklisted(address addr) {
        require(!blacklistedAddresses[addr], "Address is blacklisted");
        _;
    }

    constructor(
        address _maoToken,
        address _piToken,
        address[] memory _admins,
        address _trustedOwner,
        address _prizePoolWallet,
        address _profitWallet,
        address _marketingWallet
    ) {
        require(_maoToken != address(0), "Invalid MAO token");
        require(_piToken != address(0), "Invalid PI token");
        require(_admins.length >= MIN_ADMIN_COUNT, "Need at least 5 admins");
        require(_trustedOwner != address(0), "Invalid trusted owner");
        require(_prizePoolWallet != address(0), "Invalid prize pool wallet");
        require(_profitWallet != address(0), "Invalid profit wallet");
        require(_marketingWallet != address(0), "Invalid marketing wallet");
        
        maoToken = IERC20(_maoToken);
        piToken = IERC20(_piToken);
        prizePoolWallet = _prizePoolWallet;
        profitWallet = _profitWallet;
        marketingWallet = _marketingWallet;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _trustedOwner);
        _grantRole(ADMIN_ROLE, _trustedOwner);
        _grantRole(EMERGENCY_ROLE, _trustedOwner);
        
        for (uint i = 0; i < _admins.length; i++) {
            require(_admins[i] != address(0), "Invalid admin address");
            require(!blacklistedAddresses[_admins[i]], "Admin is blacklisted");
            _grantRole(ADMIN_ROLE, _admins[i]);
            adminCount++;
        }
        
        blacklistedAddresses[0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7] = true;
    }
    
    // 优化的游戏函数 - 可持续奖励机制
    function playMAOGame() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        uint256 betAmount = maoGameCost;
        require(maoToken.transferFrom(msg.sender, address(this), betAmount), "MAO transfer failed");
        
        // 执行代币分配
        (uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount) = _distributeTokens(maoToken, betAmount);
        
        uint256 randomSeed = _generateRandomSeed();
        (uint256 rewardAmount, uint8 rewardLevel, bool isWin) = _calculateSustainableReward(randomSeed, 0, contractAmount);
        
        if (isWin && rewardAmount > 0) {
            require(maoToken.transfer(msg.sender, rewardAmount), "MAO reward transfer failed");
        }
        
        uint256 profitAmount = contractAmount - rewardAmount;
        _recordGame(msg.sender, 0, betAmount, rewardAmount, rewardLevel, burnedAmount, marketingAmount, contractAmount, profitAmount);
        
        emit GamePlayed(msg.sender, 0, betAmount, rewardAmount, rewardLevel, burnedAmount, marketingAmount, contractAmount, profitAmount);
    }
    
    function playPIGame() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        uint256 betAmount = piGameCost;
        require(piToken.transferFrom(msg.sender, address(this), betAmount), "PI transfer failed");
        
        // 执行代币分配
        (uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount) = _distributeTokens(piToken, betAmount);
        
        uint256 randomSeed = _generateRandomSeed();
        (uint256 rewardAmount, uint8 rewardLevel, bool isWin) = _calculateSustainableReward(randomSeed, 1, contractAmount);
        
        if (isWin && rewardAmount > 0) {
            require(piToken.transfer(msg.sender, rewardAmount), "PI reward transfer failed");
        }
        
        uint256 profitAmount = contractAmount - rewardAmount;
        _recordGame(msg.sender, 1, betAmount, rewardAmount, rewardLevel, burnedAmount, marketingAmount, contractAmount, profitAmount);
        
        emit GamePlayed(msg.sender, 1, betAmount, rewardAmount, rewardLevel, burnedAmount, marketingAmount, contractAmount, profitAmount);
    }
    
    // 代币分配函数
    function _distributeTokens(IERC20 token, uint256 amount) private returns (uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount) {
        burnedAmount = (amount * BURN_PERCENTAGE) / 100;
        marketingAmount = (amount * MARKETING_PERCENTAGE) / 100;
        contractAmount = (amount * CONTRACT_PERCENTAGE) / 100;
        
        // 销毁代币
        if (burnedAmount > 0) {
            _burnTokens(token, burnedAmount);
        }
        
        // 发送到营销钱包
        if (marketingAmount > 0) {
            require(token.transfer(marketingWallet, marketingAmount), "Marketing transfer failed");
            emit MarketingFeeCollected(address(token), marketingAmount);
        }
    }
    
    // 销毁代币函数
    function _burnTokens(IERC20 token, uint256 amount) private {
        require(token.transfer(address(0), amount), "Burn transfer failed");
        
        // 更新销毁统计
        if (address(token) == address(maoToken)) {
            totalBurnedMAO += amount;
        } else if (address(token) == address(piToken)) {
            totalBurnedPI += amount;
        }
        
        emit TokenBurned(address(token), amount);
    }
    
    // 可持续的奖励计算函数 - 优化版本
    function _calculateSustainableReward(uint256 randomSeed, uint8 tokenType, uint256 availableAmount) private view returns (uint256 rewardAmount, uint8 rewardLevel, bool isWin) {
        uint256 chance = randomSeed % 100;
        
        // 降低中奖概率到35%，确保可持续性
        if (chance < 35) {
            isWin = true;
            
            if (chance < 0.5) {      // 0.5% 特大奖
                rewardLevel = 4;
                rewardAmount = tokenType == 0 ? 2000 * 10**18 : 10000 * 10**18;
            } else if (chance < 2.5) { // 2% 大奖
                rewardLevel = 3;
                rewardAmount = tokenType == 0 ? 500 * 10**18 : 2500 * 10**18;
            } else if (chance < 10) {  // 7.5% 中奖
                rewardLevel = 2;
                rewardAmount = tokenType == 0 ? 200 * 10**18 : 1000 * 10**18;
            } else {                   // 25% 小奖
                rewardLevel = 1;
                rewardAmount = tokenType == 0 ? 80 * 10**18 : 800 * 10**18;
            }
            
            // 确保奖励不超过可用金额的80%，留出20%作为利润
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
    
    // 记录游戏数据
    function _recordGame(
        address player,
        uint8 tokenType,
        uint256 betAmount,
        uint256 rewardAmount,
        uint8 rewardLevel,
        uint256 burnedAmount,
        uint256 marketingAmount,
        uint256 contractAmount,
        uint256 profitAmount
    ) private {
        GameStats storage stats = gameStats[tokenType];
        stats.totalGames++;
        stats.totalBets += betAmount;
        stats.totalBurned += burnedAmount;
        stats.totalMarketing += marketingAmount;
        stats.totalProfit += profitAmount;
        
        if (rewardAmount > 0) {
            stats.totalWins++;
            stats.totalRewards += rewardAmount;
        }
    }
    
    // 内部函数
    function _generateRandomSeed() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            blockhash(block.number - 1)
        )));
    }
    
    // 查询功能
    function getGameStats(uint8 tokenType) external view returns (GameStats memory) {
        return gameStats[tokenType];
    }
    
    function getContractBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    function getDistributionStats() external view returns (
        uint256 _totalBurnedMAO,
        uint256 _totalBurnedPI,
        uint256 _totalMarketingMAO,
        uint256 _totalMarketingPI
    ) {
        return (totalBurnedMAO, totalBurnedPI, totalMarketingMAO, totalMarketingPI);
    }
    
    function getProfitStats() external view returns (
        uint256 _totalProfitMAO,
        uint256 _totalProfitPI
    ) {
        return (gameStats[0].totalProfit, gameStats[1].totalProfit);
    }
    
    receive() external payable {
        revert("Contract does not accept ETH");
    }
} 
 
 
 