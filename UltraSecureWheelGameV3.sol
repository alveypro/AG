// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraSecureWheelGameV3 is ReentrancyGuard, AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    uint256 public constant REQUIRED_SIGNATURES = 3;
    uint256 public constant MIN_ADMIN_COUNT = 5;
    uint256 public adminCount;

    uint256 public constant TIMELOCK_DELAY = 24 hours;
    uint256 public maxSingleWithdraw = 10000 * 10**18;
    uint256 public dailyWithdrawLimit = 50000 * 10**18;
    
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
    address public marketingWallet;  // 新增：营销钱包
    
    mapping(address => bool) public blacklistedAddresses;
    mapping(bytes32 => uint256) public timelockOperations;
    mapping(bytes32 => bool) public executedOperations;
    
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
    }
    
    struct GameRecord {
        address player;
        uint8 tokenType;
        uint256 betAmount;
        uint256 rewardAmount;
        uint8 rewardLevel;
        uint256 timestamp;
        uint256 randomSeed;
        bool wasProtected;
        uint256 burnedAmount;
        uint256 marketingAmount;
        uint256 contractAmount;
    }
    
    mapping(uint8 => GameStats) public gameStats;
    mapping(address => GameRecord[]) public playerHistory;
    
    event GamePlayed(
        address indexed player,
        uint8 tokenType,
        uint256 betAmount,
        uint256 rewardAmount,
        uint8 rewardLevel,
        uint256 randomSeed,
        bool wasProtected,
        uint256 burnedAmount,
        uint256 marketingAmount,
        uint256 contractAmount
    );
    
    event TokenBurned(address indexed token, uint256 amount);
    event MarketingFeeCollected(address indexed token, uint256 amount);
    event SecurityAlert(
        string alertType,
        address indexed triggeredBy,
        string description,
        uint256 timestamp
    );
    
    event BlacklistUpdated(address indexed addr, bool isBlacklisted);
    event EmergencyAction(string action, address indexed by, uint256 timestamp);
    
    event PrizePoolWalletUpdated(address indexed newWallet);
    event ProfitWalletUpdated(address indexed newWallet);
    event MarketingWalletUpdated(address indexed newWallet);
    event ContractToppedUp(uint256 maoAmount, uint256 piAmount);
    event WithdrawnToPrizePool(uint256 maoAmount, uint256 piAmount);
    event ProfitWithdrawn(address indexed token, uint256 amount, address indexed to);

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
        
        emit SecurityAlert(
            "CONTRACT_DEPLOYED",
            msg.sender,
            "Ultra secure wheel game V3 deployed with token distribution mechanism",
            block.timestamp
        );
        
        emit BlacklistUpdated(0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7, true);
        emit PrizePoolWalletUpdated(_prizePoolWallet);
        emit ProfitWalletUpdated(_profitWallet);
        emit MarketingWalletUpdated(_marketingWallet);
    }
    
    // 新的游戏函数 - 实现代币分配机制
    function playMAOGame() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        uint256 betAmount = maoGameCost;
        require(maoToken.transferFrom(msg.sender, address(this), betAmount), "MAO transfer failed");
        
        // 执行代币分配
        (uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount) = _distributeTokens(maoToken, betAmount);
        
        uint256 randomSeed = _generateRandomSeed();
        (uint256 rewardAmount, uint8 rewardLevel, bool isWin) = _calculateOptimizedReward(randomSeed, 0);
        
        if (isWin && rewardAmount > 0) {
            require(maoToken.transfer(msg.sender, rewardAmount), "MAO reward transfer failed");
        }
        
        _recordGame(msg.sender, 0, betAmount, rewardAmount, rewardLevel, randomSeed, burnedAmount, marketingAmount, contractAmount);
        
        emit GamePlayed(msg.sender, 0, betAmount, rewardAmount, rewardLevel, randomSeed, false, burnedAmount, marketingAmount, contractAmount);
    }
    
    function playPIGame() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        uint256 betAmount = piGameCost;
        require(piToken.transferFrom(msg.sender, address(this), betAmount), "PI transfer failed");
        
        // 执行代币分配
        (uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount) = _distributeTokens(piToken, betAmount);
        
        uint256 randomSeed = _generateRandomSeed();
        (uint256 rewardAmount, uint8 rewardLevel, bool isWin) = _calculateOptimizedReward(randomSeed, 1);
        
        if (isWin && rewardAmount > 0) {
            require(piToken.transfer(msg.sender, rewardAmount), "PI reward transfer failed");
        }
        
        _recordGame(msg.sender, 1, betAmount, rewardAmount, rewardLevel, randomSeed, burnedAmount, marketingAmount, contractAmount);
        
        emit GamePlayed(msg.sender, 1, betAmount, rewardAmount, rewardLevel, randomSeed, false, burnedAmount, marketingAmount, contractAmount);
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
        
        // 剩余70%留在合约中用于奖励
        // contractAmount 自动留在合约中，无需额外操作
    }
    
    // 销毁代币函数
    function _burnTokens(IERC20 token, uint256 amount) private {
        // 如果代币支持销毁功能
        try this._tryBurn(token, amount) {
            // 销毁成功
        } catch {
            // 如果代币不支持销毁，则发送到零地址
            require(token.transfer(address(0), amount), "Burn transfer failed");
        }
        
        // 更新销毁统计
        if (address(token) == address(maoToken)) {
            totalBurnedMAO += amount;
        } else if (address(token) == address(piToken)) {
            totalBurnedPI += amount;
        }
        
        emit TokenBurned(address(token), amount);
    }
    
    // 尝试销毁代币的外部函数
    function _tryBurn(IERC20 token, uint256 amount) external {
        // 这里可以调用代币的burn函数（如果存在）
        // 由于大多数ERC20代币没有burn函数，我们发送到零地址
        require(token.transfer(address(0), amount), "Burn transfer failed");
    }
    
    // 优化后的奖励计算函数
    function _calculateOptimizedReward(uint256 randomSeed, uint8 tokenType) private view returns (uint256 rewardAmount, uint8 rewardLevel, bool isWin) {
        uint256 chance = randomSeed % 100;
        
        // 提高中奖概率到45%
        if (chance < 45) {
            isWin = true;
            
            if (chance < 1) {        // 1% 特大奖
                rewardLevel = 4;
                rewardAmount = tokenType == 0 ? 8000 * 10**18 : 40000 * 10**18;
            } else if (chance < 5) { // 4% 大奖
                rewardLevel = 3;
                rewardAmount = tokenType == 0 ? 1500 * 10**18 : 7500 * 10**18;
            } else if (chance < 20) { // 15% 中奖
                rewardLevel = 2;
                rewardAmount = tokenType == 0 ? 400 * 10**18 : 2000 * 10**18;
            } else {                  // 25% 小奖
                rewardLevel = 1;
                rewardAmount = tokenType == 0 ? 120 * 10**18 : 1200 * 10**18;
            }
        } else {
            isWin = false;
            rewardLevel = 0;
            rewardAmount = 0;
        }
    }
    
    // 钱包管理函数
    function setPrizePoolWallet(address _prizePoolWallet) external onlyTrustedAdmin {
        require(_prizePoolWallet != address(0), "Invalid address");
        prizePoolWallet = _prizePoolWallet;
        emit PrizePoolWalletUpdated(_prizePoolWallet);
    }
    
    function setProfitWallet(address _profitWallet) external onlyTrustedAdmin {
        require(_profitWallet != address(0), "Invalid address");
        profitWallet = _profitWallet;
        emit ProfitWalletUpdated(_profitWallet);
    }
    
    function setMarketingWallet(address _marketingWallet) external onlyTrustedAdmin {
        require(_marketingWallet != address(0), "Invalid address");
        marketingWallet = _marketingWallet;
        emit MarketingWalletUpdated(_marketingWallet);
    }
    
    // 从奖金池钱包向合约充值
    function topUpContract(uint256 maoAmount, uint256 piAmount) external onlyTrustedAdmin {
        require(prizePoolWallet != address(0), "Prize pool wallet not set");
        
        if (maoAmount > 0) {
            require(maoToken.transferFrom(prizePoolWallet, address(this), maoAmount), "MAO top-up failed");
        }
        if (piAmount > 0) {
            require(piToken.transferFrom(prizePoolWallet, address(this), piAmount), "PI top-up failed");
        }
        
        emit ContractToppedUp(maoAmount, piAmount);
    }
    
    // 提取合约资金到奖金池钱包
    function withdrawToPrizePool(uint256 maoAmount, uint256 piAmount) external onlyTrustedAdmin {
        require(prizePoolWallet != address(0), "Prize pool wallet not set");
        
        if (maoAmount > 0) {
            require(maoToken.transfer(prizePoolWallet, maoAmount), "MAO withdrawal failed");
        }
        if (piAmount > 0) {
            require(piToken.transfer(prizePoolWallet, piAmount), "PI withdrawal failed");
        }
        
        emit WithdrawnToPrizePool(maoAmount, piAmount);
    }
    
    // 提取利润到利润钱包
    function withdrawProfit(address token, uint256 amount) external onlyTrustedAdmin {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(profitWallet != address(0), "Profit wallet not set");
        require(IERC20(token).transfer(profitWallet, amount), "Profit withdrawal failed");
        
        emit ProfitWithdrawn(token, amount, profitWallet);
    }
    
    // 获取资金池状态
    function getPoolStatus() external view returns (
        uint256 maoContractBalance,
        uint256 piContractBalance,
        uint256 maoPrizePoolBalance,
        uint256 piPrizePoolBalance,
        bool isHealthy
    ) {
        maoContractBalance = maoToken.balanceOf(address(this));
        piContractBalance = piToken.balanceOf(address(this));
        maoPrizePoolBalance = maoToken.balanceOf(prizePoolWallet);
        piPrizePoolBalance = piToken.balanceOf(prizePoolWallet);
        
        // 检查资金池健康状态
        uint256 minRequired = maoGameCost * 100; // 至少支持100次游戏
        isHealthy = maoContractBalance >= minRequired && piContractBalance >= minRequired;
    }
    
    // 获取销毁和营销统计
    function getDistributionStats() external view returns (
        uint256 _totalBurnedMAO,
        uint256 _totalBurnedPI,
        uint256 _totalMarketingMAO,
        uint256 _totalMarketingPI
    ) {
        return (totalBurnedMAO, totalBurnedPI, totalMarketingMAO, totalMarketingPI);
    }
    
    // 原有的管理功能
    function addToBlacklist(address addr) external onlyTrustedAdmin {
        require(addr != address(0), "Invalid address");
        require(!hasRole(ADMIN_ROLE, addr), "Cannot blacklist admin");
        
        blacklistedAddresses[addr] = true;
        emit BlacklistUpdated(addr, true);
        
        emit SecurityAlert(
            "BLACKLIST_ADDED",
            msg.sender,
            "Address added to blacklist",
            block.timestamp
        );
    }
    
    function removeFromBlacklist(address addr) external onlyTrustedAdmin {
        blacklistedAddresses[addr] = false;
        emit BlacklistUpdated(addr, false);
    }
    
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyAction("PAUSE", msg.sender, block.timestamp);
        
        emit SecurityAlert(
            "EMERGENCY_PAUSE",
            msg.sender,
            "Contract paused due to emergency",
            block.timestamp
        );
    }
    
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
        emit EmergencyAction("UNPAUSE", msg.sender, block.timestamp);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(EMERGENCY_ROLE) whenPaused {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        IERC20(token).transfer(msg.sender, amount);
        
        emit EmergencyAction("EMERGENCY_WITHDRAW", msg.sender, block.timestamp);
        
        emit SecurityAlert(
            "EMERGENCY_WITHDRAWAL",
            msg.sender,
            "Emergency withdrawal executed",
            block.timestamp
        );
    }
    
    // 查询功能
    function getPlayerHistory(address player) external view returns (GameRecord[] memory) {
        return playerHistory[player];
    }
    
    function getGameStats(uint8 tokenType) external view returns (GameStats memory) {
        return gameStats[tokenType];
    }
    
    function getContractBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    function isAddressSafe(address addr) external view returns (bool) {
        return !blacklistedAddresses[addr] && addr != address(0);
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
    
    function _recordGame(
        address player,
        uint8 tokenType,
        uint256 betAmount,
        uint256 rewardAmount,
        uint8 rewardLevel,
        uint256 randomSeed,
        uint256 burnedAmount,
        uint256 marketingAmount,
        uint256 contractAmount
    ) private {
        GameRecord memory record = GameRecord({
            player: player,
            tokenType: tokenType,
            betAmount: betAmount,
            rewardAmount: rewardAmount,
            rewardLevel: rewardLevel,
            timestamp: block.timestamp,
            randomSeed: randomSeed,
            wasProtected: true,
            burnedAmount: burnedAmount,
            marketingAmount: marketingAmount,
            contractAmount: contractAmount
        });
        
        playerHistory[player].push(record);
        
        GameStats storage stats = gameStats[tokenType];
        stats.totalGames++;
        stats.totalBets += betAmount;
        stats.totalBurned += burnedAmount;
        stats.totalMarketing += marketingAmount;
        
        if (rewardAmount > 0) {
            stats.totalWins++;
            stats.totalRewards += rewardAmount;
        }
    }
    
    receive() external payable {
        revert("Contract does not accept ETH");
    }
} 
 
 
 