// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraSecureWheelGameV5 is ReentrancyGuard, AccessControl, Pausable {
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
    
    // 新增: 玩家历史记录
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
        uint256 contractAmount;
        uint256 profitAmount;
    }
    
    mapping(address => PlayerRecord[]) public playerHistory;
    
    // 新增: 时间锁机制
    mapping(bytes32 => uint256) public timelockOperations;
    uint256 public constant TIMELOCK_DELAY = 24 hours;
    
    // 新增: 多重签名
    uint256 public constant REQUIRED_SIGNATURES = 3;
    mapping(bytes32 => mapping(address => bool)) public operationSignatures;
    mapping(bytes32 => uint256) public operationSignatureCounts;
    
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
    
    // 事件
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
    
    // 新增事件
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event EmergencyPaused(address indexed admin);
    event EmergencyUnpaused(address indexed admin);
    event EmergencyWithdraw(address indexed admin, address indexed token, uint256 amount);
    event GameCostUpdated(uint8 indexed tokenType, uint256 newCost);
    event PoolToppedUp(uint256 maoAmount, uint256 piAmount);
    event ProfitWithdrawn(address indexed token, uint256 amount);
    event OperationScheduled(bytes32 indexed operationId);
    event OperationSigned(bytes32 indexed operationId, address indexed signer);
    event OperationExecuted(bytes32 indexed operationId);

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
    
    // 游戏函数
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
    
    // 新增: 管理员权限管理
    function addAdmin(address admin) external onlyTrustedAdmin {
        require(admin != address(0), "Invalid address");
        require(!hasRole(ADMIN_ROLE, admin), "Already admin");
        _grantRole(ADMIN_ROLE, admin);
        adminCount++;
        emit AdminAdded(admin);
    }
    
    function removeAdmin(address admin) external onlyTrustedAdmin {
        require(hasRole(ADMIN_ROLE, admin), "Not admin");
        require(adminCount > MIN_ADMIN_COUNT, "Too few admins");
        _revokeRole(ADMIN_ROLE, admin);
        adminCount--;
        emit AdminRemoved(admin);
    }
    
    // 新增: 紧急功能
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender);
    }
    
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(EMERGENCY_ROLE) whenPaused {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(msg.sender, amount);
        emit EmergencyWithdraw(msg.sender, token, amount);
    }
    
    // 新增: 动态参数调整
    function setGameCost(uint8 tokenType, uint256 newCost) external onlyTrustedAdmin {
        require(newCost > 0, "Invalid cost");
        if (tokenType == 0) {
            maoGameCost = newCost;
        } else {
            piGameCost = newCost;
        }
        emit GameCostUpdated(tokenType, newCost);
    }
    
    // 新增: 资金管理功能
    function topUpContract(uint256 maoAmount, uint256 piAmount) external onlyTrustedAdmin {
        if (maoAmount > 0) {
            require(maoToken.transferFrom(msg.sender, address(this), maoAmount), "MAO topup failed");
        }
        if (piAmount > 0) {
            require(piToken.transferFrom(msg.sender, address(this), piAmount), "PI topup failed");
        }
        emit PoolToppedUp(maoAmount, piAmount);
    }
    
    function withdrawProfit(address token, uint256 amount) external onlyTrustedAdmin {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(profitWallet, amount);
        emit ProfitWithdrawn(token, amount);
    }
    
    // 新增: 时间锁和多重签名
    function scheduleOperation(bytes32 operationId) external onlyTrustedAdmin {
        timelockOperations[operationId] = block.timestamp + TIMELOCK_DELAY;
        emit OperationScheduled(operationId);
    }
    
    function signOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(!operationSignatures[operationId][msg.sender], "Already signed");
        operationSignatures[operationId][msg.sender] = true;
        operationSignatureCounts[operationId]++;
        emit OperationSigned(operationId, msg.sender);
    }
    
    function executeOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(block.timestamp >= timelockOperations[operationId], "Timelock not expired");
        require(operationSignatureCounts[operationId] >= REQUIRED_SIGNATURES, "Insufficient signatures");
        // 这里可以添加具体的操作逻辑
        emit OperationExecuted(operationId);
    }
    
    // 查询功能
    function getPlayerHistory(address player) external view returns (PlayerRecord[] memory) {
        return playerHistory[player];
    }
    
    function getPoolStatus() external view returns (uint256 maoBalance, uint256 piBalance, bool isHealthy) {
        maoBalance = maoToken.balanceOf(address(this));
        piBalance = piToken.balanceOf(address(this));
        isHealthy = maoBalance >= maoGameCost * 50 && piBalance >= piGameCost * 50;
    }
    
    // 内部函数
    function _distributeTokens(IERC20 token, uint256 amount) private returns (uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount) {
        burnedAmount = (amount * BURN_PERCENTAGE) / 100;
        marketingAmount = (amount * MARKETING_PERCENTAGE) / 100;
        contractAmount = (amount * CONTRACT_PERCENTAGE) / 100;
        
        if (burnedAmount > 0) {
            _burnTokens(token, burnedAmount);
        }
        
        if (marketingAmount > 0) {
            require(token.transfer(marketingWallet, marketingAmount), "Marketing transfer failed");
            emit MarketingFeeCollected(address(token), marketingAmount);
        }
    }
    
    function _burnTokens(IERC20 token, uint256 amount) private {
        require(token.transfer(address(0), amount), "Burn transfer failed");
        
        if (address(token) == address(maoToken)) {
            totalBurnedMAO += amount;
        } else if (address(token) == address(piToken)) {
            totalBurnedPI += amount;
        }
        
        emit TokenBurned(address(token), amount);
    }
    
    function _calculateSustainableReward(uint256 randomSeed, uint8 tokenType, uint256 availableAmount) private view returns (uint256 rewardAmount, uint8 rewardLevel, bool isWin) {
        uint256 chance = randomSeed % 100;
        
        if (chance < 35) {
            isWin = true;
            
            if (chance < 0.5) {
                rewardLevel = 4;
                rewardAmount = tokenType == 0 ? 2000 * 10**18 : 10000 * 10**18;
            } else if (chance < 2.5) {
                rewardLevel = 3;
                rewardAmount = tokenType == 0 ? 500 * 10**18 : 2500 * 10**18;
            } else if (chance < 10) {
                rewardLevel = 2;
                rewardAmount = tokenType == 0 ? 200 * 10**18 : 1000 * 10**18;
            } else {
                rewardLevel = 1;
                rewardAmount = tokenType == 0 ? 80 * 10**18 : 800 * 10**18;
            }
            
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
        
        // 记录玩家历史
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
            contractAmount: contractAmount,
            profitAmount: profitAmount
        }));
    }
    
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
 
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraSecureWheelGameV5 is ReentrancyGuard, AccessControl, Pausable {
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
    
    // 新增: 玩家历史记录
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
        uint256 contractAmount;
        uint256 profitAmount;
    }
    
    mapping(address => PlayerRecord[]) public playerHistory;
    
    // 新增: 时间锁机制
    mapping(bytes32 => uint256) public timelockOperations;
    uint256 public constant TIMELOCK_DELAY = 24 hours;
    
    // 新增: 多重签名
    uint256 public constant REQUIRED_SIGNATURES = 3;
    mapping(bytes32 => mapping(address => bool)) public operationSignatures;
    mapping(bytes32 => uint256) public operationSignatureCounts;
    
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
    
    // 事件
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
    
    // 新增事件
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event EmergencyPaused(address indexed admin);
    event EmergencyUnpaused(address indexed admin);
    event EmergencyWithdraw(address indexed admin, address indexed token, uint256 amount);
    event GameCostUpdated(uint8 indexed tokenType, uint256 newCost);
    event PoolToppedUp(uint256 maoAmount, uint256 piAmount);
    event ProfitWithdrawn(address indexed token, uint256 amount);
    event OperationScheduled(bytes32 indexed operationId);
    event OperationSigned(bytes32 indexed operationId, address indexed signer);
    event OperationExecuted(bytes32 indexed operationId);

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
    
    // 游戏函数
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
    
    // 新增: 管理员权限管理
    function addAdmin(address admin) external onlyTrustedAdmin {
        require(admin != address(0), "Invalid address");
        require(!hasRole(ADMIN_ROLE, admin), "Already admin");
        _grantRole(ADMIN_ROLE, admin);
        adminCount++;
        emit AdminAdded(admin);
    }
    
    function removeAdmin(address admin) external onlyTrustedAdmin {
        require(hasRole(ADMIN_ROLE, admin), "Not admin");
        require(adminCount > MIN_ADMIN_COUNT, "Too few admins");
        _revokeRole(ADMIN_ROLE, admin);
        adminCount--;
        emit AdminRemoved(admin);
    }
    
    // 新增: 紧急功能
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender);
    }
    
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(EMERGENCY_ROLE) whenPaused {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(msg.sender, amount);
        emit EmergencyWithdraw(msg.sender, token, amount);
    }
    
    // 新增: 动态参数调整
    function setGameCost(uint8 tokenType, uint256 newCost) external onlyTrustedAdmin {
        require(newCost > 0, "Invalid cost");
        if (tokenType == 0) {
            maoGameCost = newCost;
        } else {
            piGameCost = newCost;
        }
        emit GameCostUpdated(tokenType, newCost);
    }
    
    // 新增: 资金管理功能
    function topUpContract(uint256 maoAmount, uint256 piAmount) external onlyTrustedAdmin {
        if (maoAmount > 0) {
            require(maoToken.transferFrom(msg.sender, address(this), maoAmount), "MAO topup failed");
        }
        if (piAmount > 0) {
            require(piToken.transferFrom(msg.sender, address(this), piAmount), "PI topup failed");
        }
        emit PoolToppedUp(maoAmount, piAmount);
    }
    
    function withdrawProfit(address token, uint256 amount) external onlyTrustedAdmin {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(profitWallet, amount);
        emit ProfitWithdrawn(token, amount);
    }
    
    // 新增: 时间锁和多重签名
    function scheduleOperation(bytes32 operationId) external onlyTrustedAdmin {
        timelockOperations[operationId] = block.timestamp + TIMELOCK_DELAY;
        emit OperationScheduled(operationId);
    }
    
    function signOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(!operationSignatures[operationId][msg.sender], "Already signed");
        operationSignatures[operationId][msg.sender] = true;
        operationSignatureCounts[operationId]++;
        emit OperationSigned(operationId, msg.sender);
    }
    
    function executeOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(block.timestamp >= timelockOperations[operationId], "Timelock not expired");
        require(operationSignatureCounts[operationId] >= REQUIRED_SIGNATURES, "Insufficient signatures");
        // 这里可以添加具体的操作逻辑
        emit OperationExecuted(operationId);
    }
    
    // 查询功能
    function getPlayerHistory(address player) external view returns (PlayerRecord[] memory) {
        return playerHistory[player];
    }
    
    function getPoolStatus() external view returns (uint256 maoBalance, uint256 piBalance, bool isHealthy) {
        maoBalance = maoToken.balanceOf(address(this));
        piBalance = piToken.balanceOf(address(this));
        isHealthy = maoBalance >= maoGameCost * 50 && piBalance >= piGameCost * 50;
    }
    
    // 内部函数
    function _distributeTokens(IERC20 token, uint256 amount) private returns (uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount) {
        burnedAmount = (amount * BURN_PERCENTAGE) / 100;
        marketingAmount = (amount * MARKETING_PERCENTAGE) / 100;
        contractAmount = (amount * CONTRACT_PERCENTAGE) / 100;
        
        if (burnedAmount > 0) {
            _burnTokens(token, burnedAmount);
        }
        
        if (marketingAmount > 0) {
            require(token.transfer(marketingWallet, marketingAmount), "Marketing transfer failed");
            emit MarketingFeeCollected(address(token), marketingAmount);
        }
    }
    
    function _burnTokens(IERC20 token, uint256 amount) private {
        require(token.transfer(address(0), amount), "Burn transfer failed");
        
        if (address(token) == address(maoToken)) {
            totalBurnedMAO += amount;
        } else if (address(token) == address(piToken)) {
            totalBurnedPI += amount;
        }
        
        emit TokenBurned(address(token), amount);
    }
    
    function _calculateSustainableReward(uint256 randomSeed, uint8 tokenType, uint256 availableAmount) private view returns (uint256 rewardAmount, uint8 rewardLevel, bool isWin) {
        uint256 chance = randomSeed % 100;
        
        if (chance < 35) {
            isWin = true;
            
            if (chance < 0.5) {
                rewardLevel = 4;
                rewardAmount = tokenType == 0 ? 2000 * 10**18 : 10000 * 10**18;
            } else if (chance < 2.5) {
                rewardLevel = 3;
                rewardAmount = tokenType == 0 ? 500 * 10**18 : 2500 * 10**18;
            } else if (chance < 10) {
                rewardLevel = 2;
                rewardAmount = tokenType == 0 ? 200 * 10**18 : 1000 * 10**18;
            } else {
                rewardLevel = 1;
                rewardAmount = tokenType == 0 ? 80 * 10**18 : 800 * 10**18;
            }
            
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
        
        // 记录玩家历史
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
            contractAmount: contractAmount,
            profitAmount: profitAmount
        }));
    }
    
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
 
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraSecureWheelGameV5 is ReentrancyGuard, AccessControl, Pausable {
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
    
    // 新增: 玩家历史记录
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
        uint256 contractAmount;
        uint256 profitAmount;
    }
    
    mapping(address => PlayerRecord[]) public playerHistory;
    
    // 新增: 时间锁机制
    mapping(bytes32 => uint256) public timelockOperations;
    uint256 public constant TIMELOCK_DELAY = 24 hours;
    
    // 新增: 多重签名
    uint256 public constant REQUIRED_SIGNATURES = 3;
    mapping(bytes32 => mapping(address => bool)) public operationSignatures;
    mapping(bytes32 => uint256) public operationSignatureCounts;
    
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
    
    // 事件
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
    
    // 新增事件
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event EmergencyPaused(address indexed admin);
    event EmergencyUnpaused(address indexed admin);
    event EmergencyWithdraw(address indexed admin, address indexed token, uint256 amount);
    event GameCostUpdated(uint8 indexed tokenType, uint256 newCost);
    event PoolToppedUp(uint256 maoAmount, uint256 piAmount);
    event ProfitWithdrawn(address indexed token, uint256 amount);
    event OperationScheduled(bytes32 indexed operationId);
    event OperationSigned(bytes32 indexed operationId, address indexed signer);
    event OperationExecuted(bytes32 indexed operationId);

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
    
    // 游戏函数
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
    
    // 新增: 管理员权限管理
    function addAdmin(address admin) external onlyTrustedAdmin {
        require(admin != address(0), "Invalid address");
        require(!hasRole(ADMIN_ROLE, admin), "Already admin");
        _grantRole(ADMIN_ROLE, admin);
        adminCount++;
        emit AdminAdded(admin);
    }
    
    function removeAdmin(address admin) external onlyTrustedAdmin {
        require(hasRole(ADMIN_ROLE, admin), "Not admin");
        require(adminCount > MIN_ADMIN_COUNT, "Too few admins");
        _revokeRole(ADMIN_ROLE, admin);
        adminCount--;
        emit AdminRemoved(admin);
    }
    
    // 新增: 紧急功能
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender);
    }
    
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(EMERGENCY_ROLE) whenPaused {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(msg.sender, amount);
        emit EmergencyWithdraw(msg.sender, token, amount);
    }
    
    // 新增: 动态参数调整
    function setGameCost(uint8 tokenType, uint256 newCost) external onlyTrustedAdmin {
        require(newCost > 0, "Invalid cost");
        if (tokenType == 0) {
            maoGameCost = newCost;
        } else {
            piGameCost = newCost;
        }
        emit GameCostUpdated(tokenType, newCost);
    }
    
    // 新增: 资金管理功能
    function topUpContract(uint256 maoAmount, uint256 piAmount) external onlyTrustedAdmin {
        if (maoAmount > 0) {
            require(maoToken.transferFrom(msg.sender, address(this), maoAmount), "MAO topup failed");
        }
        if (piAmount > 0) {
            require(piToken.transferFrom(msg.sender, address(this), piAmount), "PI topup failed");
        }
        emit PoolToppedUp(maoAmount, piAmount);
    }
    
    function withdrawProfit(address token, uint256 amount) external onlyTrustedAdmin {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(profitWallet, amount);
        emit ProfitWithdrawn(token, amount);
    }
    
    // 新增: 时间锁和多重签名
    function scheduleOperation(bytes32 operationId) external onlyTrustedAdmin {
        timelockOperations[operationId] = block.timestamp + TIMELOCK_DELAY;
        emit OperationScheduled(operationId);
    }
    
    function signOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(!operationSignatures[operationId][msg.sender], "Already signed");
        operationSignatures[operationId][msg.sender] = true;
        operationSignatureCounts[operationId]++;
        emit OperationSigned(operationId, msg.sender);
    }
    
    function executeOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(block.timestamp >= timelockOperations[operationId], "Timelock not expired");
        require(operationSignatureCounts[operationId] >= REQUIRED_SIGNATURES, "Insufficient signatures");
        // 这里可以添加具体的操作逻辑
        emit OperationExecuted(operationId);
    }
    
    // 查询功能
    function getPlayerHistory(address player) external view returns (PlayerRecord[] memory) {
        return playerHistory[player];
    }
    
    function getPoolStatus() external view returns (uint256 maoBalance, uint256 piBalance, bool isHealthy) {
        maoBalance = maoToken.balanceOf(address(this));
        piBalance = piToken.balanceOf(address(this));
        isHealthy = maoBalance >= maoGameCost * 50 && piBalance >= piGameCost * 50;
    }
    
    // 内部函数
    function _distributeTokens(IERC20 token, uint256 amount) private returns (uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount) {
        burnedAmount = (amount * BURN_PERCENTAGE) / 100;
        marketingAmount = (amount * MARKETING_PERCENTAGE) / 100;
        contractAmount = (amount * CONTRACT_PERCENTAGE) / 100;
        
        if (burnedAmount > 0) {
            _burnTokens(token, burnedAmount);
        }
        
        if (marketingAmount > 0) {
            require(token.transfer(marketingWallet, marketingAmount), "Marketing transfer failed");
            emit MarketingFeeCollected(address(token), marketingAmount);
        }
    }
    
    function _burnTokens(IERC20 token, uint256 amount) private {
        require(token.transfer(address(0), amount), "Burn transfer failed");
        
        if (address(token) == address(maoToken)) {
            totalBurnedMAO += amount;
        } else if (address(token) == address(piToken)) {
            totalBurnedPI += amount;
        }
        
        emit TokenBurned(address(token), amount);
    }
    
    function _calculateSustainableReward(uint256 randomSeed, uint8 tokenType, uint256 availableAmount) private view returns (uint256 rewardAmount, uint8 rewardLevel, bool isWin) {
        uint256 chance = randomSeed % 100;
        
        if (chance < 35) {
            isWin = true;
            
            if (chance < 0.5) {
                rewardLevel = 4;
                rewardAmount = tokenType == 0 ? 2000 * 10**18 : 10000 * 10**18;
            } else if (chance < 2.5) {
                rewardLevel = 3;
                rewardAmount = tokenType == 0 ? 500 * 10**18 : 2500 * 10**18;
            } else if (chance < 10) {
                rewardLevel = 2;
                rewardAmount = tokenType == 0 ? 200 * 10**18 : 1000 * 10**18;
            } else {
                rewardLevel = 1;
                rewardAmount = tokenType == 0 ? 80 * 10**18 : 800 * 10**18;
            }
            
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
        
        // 记录玩家历史
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
            contractAmount: contractAmount,
            profitAmount: profitAmount
        }));
    }
    
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
 
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraSecureWheelGameV5 is ReentrancyGuard, AccessControl, Pausable {
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
    
    // 新增: 玩家历史记录
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
        uint256 contractAmount;
        uint256 profitAmount;
    }
    
    mapping(address => PlayerRecord[]) public playerHistory;
    
    // 新增: 时间锁机制
    mapping(bytes32 => uint256) public timelockOperations;
    uint256 public constant TIMELOCK_DELAY = 24 hours;
    
    // 新增: 多重签名
    uint256 public constant REQUIRED_SIGNATURES = 3;
    mapping(bytes32 => mapping(address => bool)) public operationSignatures;
    mapping(bytes32 => uint256) public operationSignatureCounts;
    
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
    
    // 事件
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
    
    // 新增事件
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event EmergencyPaused(address indexed admin);
    event EmergencyUnpaused(address indexed admin);
    event EmergencyWithdraw(address indexed admin, address indexed token, uint256 amount);
    event GameCostUpdated(uint8 indexed tokenType, uint256 newCost);
    event PoolToppedUp(uint256 maoAmount, uint256 piAmount);
    event ProfitWithdrawn(address indexed token, uint256 amount);
    event OperationScheduled(bytes32 indexed operationId);
    event OperationSigned(bytes32 indexed operationId, address indexed signer);
    event OperationExecuted(bytes32 indexed operationId);

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
    
    // 游戏函数
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
    
    // 新增: 管理员权限管理
    function addAdmin(address admin) external onlyTrustedAdmin {
        require(admin != address(0), "Invalid address");
        require(!hasRole(ADMIN_ROLE, admin), "Already admin");
        _grantRole(ADMIN_ROLE, admin);
        adminCount++;
        emit AdminAdded(admin);
    }
    
    function removeAdmin(address admin) external onlyTrustedAdmin {
        require(hasRole(ADMIN_ROLE, admin), "Not admin");
        require(adminCount > MIN_ADMIN_COUNT, "Too few admins");
        _revokeRole(ADMIN_ROLE, admin);
        adminCount--;
        emit AdminRemoved(admin);
    }
    
    // 新增: 紧急功能
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender);
    }
    
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(EMERGENCY_ROLE) whenPaused {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(msg.sender, amount);
        emit EmergencyWithdraw(msg.sender, token, amount);
    }
    
    // 新增: 动态参数调整
    function setGameCost(uint8 tokenType, uint256 newCost) external onlyTrustedAdmin {
        require(newCost > 0, "Invalid cost");
        if (tokenType == 0) {
            maoGameCost = newCost;
        } else {
            piGameCost = newCost;
        }
        emit GameCostUpdated(tokenType, newCost);
    }
    
    // 新增: 资金管理功能
    function topUpContract(uint256 maoAmount, uint256 piAmount) external onlyTrustedAdmin {
        if (maoAmount > 0) {
            require(maoToken.transferFrom(msg.sender, address(this), maoAmount), "MAO topup failed");
        }
        if (piAmount > 0) {
            require(piToken.transferFrom(msg.sender, address(this), piAmount), "PI topup failed");
        }
        emit PoolToppedUp(maoAmount, piAmount);
    }
    
    function withdrawProfit(address token, uint256 amount) external onlyTrustedAdmin {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(profitWallet, amount);
        emit ProfitWithdrawn(token, amount);
    }
    
    // 新增: 时间锁和多重签名
    function scheduleOperation(bytes32 operationId) external onlyTrustedAdmin {
        timelockOperations[operationId] = block.timestamp + TIMELOCK_DELAY;
        emit OperationScheduled(operationId);
    }
    
    function signOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(!operationSignatures[operationId][msg.sender], "Already signed");
        operationSignatures[operationId][msg.sender] = true;
        operationSignatureCounts[operationId]++;
        emit OperationSigned(operationId, msg.sender);
    }
    
    function executeOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(block.timestamp >= timelockOperations[operationId], "Timelock not expired");
        require(operationSignatureCounts[operationId] >= REQUIRED_SIGNATURES, "Insufficient signatures");
        // 这里可以添加具体的操作逻辑
        emit OperationExecuted(operationId);
    }
    
    // 查询功能
    function getPlayerHistory(address player) external view returns (PlayerRecord[] memory) {
        return playerHistory[player];
    }
    
    function getPoolStatus() external view returns (uint256 maoBalance, uint256 piBalance, bool isHealthy) {
        maoBalance = maoToken.balanceOf(address(this));
        piBalance = piToken.balanceOf(address(this));
        isHealthy = maoBalance >= maoGameCost * 50 && piBalance >= piGameCost * 50;
    }
    
    // 内部函数
    function _distributeTokens(IERC20 token, uint256 amount) private returns (uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount) {
        burnedAmount = (amount * BURN_PERCENTAGE) / 100;
        marketingAmount = (amount * MARKETING_PERCENTAGE) / 100;
        contractAmount = (amount * CONTRACT_PERCENTAGE) / 100;
        
        if (burnedAmount > 0) {
            _burnTokens(token, burnedAmount);
        }
        
        if (marketingAmount > 0) {
            require(token.transfer(marketingWallet, marketingAmount), "Marketing transfer failed");
            emit MarketingFeeCollected(address(token), marketingAmount);
        }
    }
    
    function _burnTokens(IERC20 token, uint256 amount) private {
        require(token.transfer(address(0), amount), "Burn transfer failed");
        
        if (address(token) == address(maoToken)) {
            totalBurnedMAO += amount;
        } else if (address(token) == address(piToken)) {
            totalBurnedPI += amount;
        }
        
        emit TokenBurned(address(token), amount);
    }
    
    function _calculateSustainableReward(uint256 randomSeed, uint8 tokenType, uint256 availableAmount) private view returns (uint256 rewardAmount, uint8 rewardLevel, bool isWin) {
        uint256 chance = randomSeed % 100;
        
        if (chance < 35) {
            isWin = true;
            
            if (chance < 0.5) {
                rewardLevel = 4;
                rewardAmount = tokenType == 0 ? 2000 * 10**18 : 10000 * 10**18;
            } else if (chance < 2.5) {
                rewardLevel = 3;
                rewardAmount = tokenType == 0 ? 500 * 10**18 : 2500 * 10**18;
            } else if (chance < 10) {
                rewardLevel = 2;
                rewardAmount = tokenType == 0 ? 200 * 10**18 : 1000 * 10**18;
            } else {
                rewardLevel = 1;
                rewardAmount = tokenType == 0 ? 80 * 10**18 : 800 * 10**18;
            }
            
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
        
        // 记录玩家历史
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
            contractAmount: contractAmount,
            profitAmount: profitAmount
        }));
    }
    
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
 
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraSecureWheelGameV5 is ReentrancyGuard, AccessControl, Pausable {
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
    
    // 新增: 玩家历史记录
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
        uint256 contractAmount;
        uint256 profitAmount;
    }
    
    mapping(address => PlayerRecord[]) public playerHistory;
    
    // 新增: 时间锁机制
    mapping(bytes32 => uint256) public timelockOperations;
    uint256 public constant TIMELOCK_DELAY = 24 hours;
    
    // 新增: 多重签名
    uint256 public constant REQUIRED_SIGNATURES = 3;
    mapping(bytes32 => mapping(address => bool)) public operationSignatures;
    mapping(bytes32 => uint256) public operationSignatureCounts;
    
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
    
    // 事件
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
    
    // 新增事件
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event EmergencyPaused(address indexed admin);
    event EmergencyUnpaused(address indexed admin);
    event EmergencyWithdraw(address indexed admin, address indexed token, uint256 amount);
    event GameCostUpdated(uint8 indexed tokenType, uint256 newCost);
    event PoolToppedUp(uint256 maoAmount, uint256 piAmount);
    event ProfitWithdrawn(address indexed token, uint256 amount);
    event OperationScheduled(bytes32 indexed operationId);
    event OperationSigned(bytes32 indexed operationId, address indexed signer);
    event OperationExecuted(bytes32 indexed operationId);

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
    
    // 游戏函数
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
    
    // 新增: 管理员权限管理
    function addAdmin(address admin) external onlyTrustedAdmin {
        require(admin != address(0), "Invalid address");
        require(!hasRole(ADMIN_ROLE, admin), "Already admin");
        _grantRole(ADMIN_ROLE, admin);
        adminCount++;
        emit AdminAdded(admin);
    }
    
    function removeAdmin(address admin) external onlyTrustedAdmin {
        require(hasRole(ADMIN_ROLE, admin), "Not admin");
        require(adminCount > MIN_ADMIN_COUNT, "Too few admins");
        _revokeRole(ADMIN_ROLE, admin);
        adminCount--;
        emit AdminRemoved(admin);
    }
    
    // 新增: 紧急功能
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender);
    }
    
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(EMERGENCY_ROLE) whenPaused {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(msg.sender, amount);
        emit EmergencyWithdraw(msg.sender, token, amount);
    }
    
    // 新增: 动态参数调整
    function setGameCost(uint8 tokenType, uint256 newCost) external onlyTrustedAdmin {
        require(newCost > 0, "Invalid cost");
        if (tokenType == 0) {
            maoGameCost = newCost;
        } else {
            piGameCost = newCost;
        }
        emit GameCostUpdated(tokenType, newCost);
    }
    
    // 新增: 资金管理功能
    function topUpContract(uint256 maoAmount, uint256 piAmount) external onlyTrustedAdmin {
        if (maoAmount > 0) {
            require(maoToken.transferFrom(msg.sender, address(this), maoAmount), "MAO topup failed");
        }
        if (piAmount > 0) {
            require(piToken.transferFrom(msg.sender, address(this), piAmount), "PI topup failed");
        }
        emit PoolToppedUp(maoAmount, piAmount);
    }
    
    function withdrawProfit(address token, uint256 amount) external onlyTrustedAdmin {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(profitWallet, amount);
        emit ProfitWithdrawn(token, amount);
    }
    
    // 新增: 时间锁和多重签名
    function scheduleOperation(bytes32 operationId) external onlyTrustedAdmin {
        timelockOperations[operationId] = block.timestamp + TIMELOCK_DELAY;
        emit OperationScheduled(operationId);
    }
    
    function signOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(!operationSignatures[operationId][msg.sender], "Already signed");
        operationSignatures[operationId][msg.sender] = true;
        operationSignatureCounts[operationId]++;
        emit OperationSigned(operationId, msg.sender);
    }
    
    function executeOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(block.timestamp >= timelockOperations[operationId], "Timelock not expired");
        require(operationSignatureCounts[operationId] >= REQUIRED_SIGNATURES, "Insufficient signatures");
        // 这里可以添加具体的操作逻辑
        emit OperationExecuted(operationId);
    }
    
    // 查询功能
    function getPlayerHistory(address player) external view returns (PlayerRecord[] memory) {
        return playerHistory[player];
    }
    
    function getPoolStatus() external view returns (uint256 maoBalance, uint256 piBalance, bool isHealthy) {
        maoBalance = maoToken.balanceOf(address(this));
        piBalance = piToken.balanceOf(address(this));
        isHealthy = maoBalance >= maoGameCost * 50 && piBalance >= piGameCost * 50;
    }
    
    // 内部函数
    function _distributeTokens(IERC20 token, uint256 amount) private returns (uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount) {
        burnedAmount = (amount * BURN_PERCENTAGE) / 100;
        marketingAmount = (amount * MARKETING_PERCENTAGE) / 100;
        contractAmount = (amount * CONTRACT_PERCENTAGE) / 100;
        
        if (burnedAmount > 0) {
            _burnTokens(token, burnedAmount);
        }
        
        if (marketingAmount > 0) {
            require(token.transfer(marketingWallet, marketingAmount), "Marketing transfer failed");
            emit MarketingFeeCollected(address(token), marketingAmount);
        }
    }
    
    function _burnTokens(IERC20 token, uint256 amount) private {
        require(token.transfer(address(0), amount), "Burn transfer failed");
        
        if (address(token) == address(maoToken)) {
            totalBurnedMAO += amount;
        } else if (address(token) == address(piToken)) {
            totalBurnedPI += amount;
        }
        
        emit TokenBurned(address(token), amount);
    }
    
    function _calculateSustainableReward(uint256 randomSeed, uint8 tokenType, uint256 availableAmount) private view returns (uint256 rewardAmount, uint8 rewardLevel, bool isWin) {
        uint256 chance = randomSeed % 100;
        
        if (chance < 35) {
            isWin = true;
            
            if (chance < 0.5) {
                rewardLevel = 4;
                rewardAmount = tokenType == 0 ? 2000 * 10**18 : 10000 * 10**18;
            } else if (chance < 2.5) {
                rewardLevel = 3;
                rewardAmount = tokenType == 0 ? 500 * 10**18 : 2500 * 10**18;
            } else if (chance < 10) {
                rewardLevel = 2;
                rewardAmount = tokenType == 0 ? 200 * 10**18 : 1000 * 10**18;
            } else {
                rewardLevel = 1;
                rewardAmount = tokenType == 0 ? 80 * 10**18 : 800 * 10**18;
            }
            
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
        
        // 记录玩家历史
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
            contractAmount: contractAmount,
            profitAmount: profitAmount
        }));
    }
    
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
 
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraSecureWheelGameV5 is ReentrancyGuard, AccessControl, Pausable {
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
    
    // 新增: 玩家历史记录
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
        uint256 contractAmount;
        uint256 profitAmount;
    }
    
    mapping(address => PlayerRecord[]) public playerHistory;
    
    // 新增: 时间锁机制
    mapping(bytes32 => uint256) public timelockOperations;
    uint256 public constant TIMELOCK_DELAY = 24 hours;
    
    // 新增: 多重签名
    uint256 public constant REQUIRED_SIGNATURES = 3;
    mapping(bytes32 => mapping(address => bool)) public operationSignatures;
    mapping(bytes32 => uint256) public operationSignatureCounts;
    
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
    
    // 事件
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
    
    // 新增事件
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event EmergencyPaused(address indexed admin);
    event EmergencyUnpaused(address indexed admin);
    event EmergencyWithdraw(address indexed admin, address indexed token, uint256 amount);
    event GameCostUpdated(uint8 indexed tokenType, uint256 newCost);
    event PoolToppedUp(uint256 maoAmount, uint256 piAmount);
    event ProfitWithdrawn(address indexed token, uint256 amount);
    event OperationScheduled(bytes32 indexed operationId);
    event OperationSigned(bytes32 indexed operationId, address indexed signer);
    event OperationExecuted(bytes32 indexed operationId);

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
    
    // 游戏函数
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
    
    // 新增: 管理员权限管理
    function addAdmin(address admin) external onlyTrustedAdmin {
        require(admin != address(0), "Invalid address");
        require(!hasRole(ADMIN_ROLE, admin), "Already admin");
        _grantRole(ADMIN_ROLE, admin);
        adminCount++;
        emit AdminAdded(admin);
    }
    
    function removeAdmin(address admin) external onlyTrustedAdmin {
        require(hasRole(ADMIN_ROLE, admin), "Not admin");
        require(adminCount > MIN_ADMIN_COUNT, "Too few admins");
        _revokeRole(ADMIN_ROLE, admin);
        adminCount--;
        emit AdminRemoved(admin);
    }
    
    // 新增: 紧急功能
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender);
    }
    
    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(EMERGENCY_ROLE) whenPaused {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(msg.sender, amount);
        emit EmergencyWithdraw(msg.sender, token, amount);
    }
    
    // 新增: 动态参数调整
    function setGameCost(uint8 tokenType, uint256 newCost) external onlyTrustedAdmin {
        require(newCost > 0, "Invalid cost");
        if (tokenType == 0) {
            maoGameCost = newCost;
        } else {
            piGameCost = newCost;
        }
        emit GameCostUpdated(tokenType, newCost);
    }
    
    // 新增: 资金管理功能
    function topUpContract(uint256 maoAmount, uint256 piAmount) external onlyTrustedAdmin {
        if (maoAmount > 0) {
            require(maoToken.transferFrom(msg.sender, address(this), maoAmount), "MAO topup failed");
        }
        if (piAmount > 0) {
            require(piToken.transferFrom(msg.sender, address(this), piAmount), "PI topup failed");
        }
        emit PoolToppedUp(maoAmount, piAmount);
    }
    
    function withdrawProfit(address token, uint256 amount) external onlyTrustedAdmin {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance");
        IERC20(token).transfer(profitWallet, amount);
        emit ProfitWithdrawn(token, amount);
    }
    
    // 新增: 时间锁和多重签名
    function scheduleOperation(bytes32 operationId) external onlyTrustedAdmin {
        timelockOperations[operationId] = block.timestamp + TIMELOCK_DELAY;
        emit OperationScheduled(operationId);
    }
    
    function signOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(!operationSignatures[operationId][msg.sender], "Already signed");
        operationSignatures[operationId][msg.sender] = true;
        operationSignatureCounts[operationId]++;
        emit OperationSigned(operationId, msg.sender);
    }
    
    function executeOperation(bytes32 operationId) external onlyTrustedAdmin {
        require(block.timestamp >= timelockOperations[operationId], "Timelock not expired");
        require(operationSignatureCounts[operationId] >= REQUIRED_SIGNATURES, "Insufficient signatures");
        // 这里可以添加具体的操作逻辑
        emit OperationExecuted(operationId);
    }
    
    // 查询功能
    function getPlayerHistory(address player) external view returns (PlayerRecord[] memory) {
        return playerHistory[player];
    }
    
    function getPoolStatus() external view returns (uint256 maoBalance, uint256 piBalance, bool isHealthy) {
        maoBalance = maoToken.balanceOf(address(this));
        piBalance = piToken.balanceOf(address(this));
        isHealthy = maoBalance >= maoGameCost * 50 && piBalance >= piGameCost * 50;
    }
    
    // 内部函数
    function _distributeTokens(IERC20 token, uint256 amount) private returns (uint256 burnedAmount, uint256 marketingAmount, uint256 contractAmount) {
        burnedAmount = (amount * BURN_PERCENTAGE) / 100;
        marketingAmount = (amount * MARKETING_PERCENTAGE) / 100;
        contractAmount = (amount * CONTRACT_PERCENTAGE) / 100;
        
        if (burnedAmount > 0) {
            _burnTokens(token, burnedAmount);
        }
        
        if (marketingAmount > 0) {
            require(token.transfer(marketingWallet, marketingAmount), "Marketing transfer failed");
            emit MarketingFeeCollected(address(token), marketingAmount);
        }
    }
    
    function _burnTokens(IERC20 token, uint256 amount) private {
        require(token.transfer(address(0), amount), "Burn transfer failed");
        
        if (address(token) == address(maoToken)) {
            totalBurnedMAO += amount;
        } else if (address(token) == address(piToken)) {
            totalBurnedPI += amount;
        }
        
        emit TokenBurned(address(token), amount);
    }
    
    function _calculateSustainableReward(uint256 randomSeed, uint8 tokenType, uint256 availableAmount) private view returns (uint256 rewardAmount, uint8 rewardLevel, bool isWin) {
        uint256 chance = randomSeed % 100;
        
        if (chance < 35) {
            isWin = true;
            
            if (chance < 0.5) {
                rewardLevel = 4;
                rewardAmount = tokenType == 0 ? 2000 * 10**18 : 10000 * 10**18;
            } else if (chance < 2.5) {
                rewardLevel = 3;
                rewardAmount = tokenType == 0 ? 500 * 10**18 : 2500 * 10**18;
            } else if (chance < 10) {
                rewardLevel = 2;
                rewardAmount = tokenType == 0 ? 200 * 10**18 : 1000 * 10**18;
            } else {
                rewardLevel = 1;
                rewardAmount = tokenType == 0 ? 80 * 10**18 : 800 * 10**18;
            }
            
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
        
        // 记录玩家历史
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
            contractAmount: contractAmount,
            profitAmount: profitAmount
        }));
    }
    
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
 