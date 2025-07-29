// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraSecureWheelGameV2 is ReentrancyGuard, AccessControl, Pausable {
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
    
    IERC20 public maoToken;
    IERC20 public piToken;
    
    // 新增：奖金池钱包
    address public prizePoolWallet;
    address public profitWallet;
    
    mapping(address => bool) public blacklistedAddresses;
    mapping(bytes32 => uint256) public timelockOperations;
    mapping(bytes32 => bool) public executedOperations;
    
    struct GameStats {
        uint256 totalGames;
        uint256 totalWins;
        uint256 totalBets;
        uint256 totalRewards;
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
        bool wasProtected
    );
    
    event SecurityAlert(
        string alertType,
        address indexed triggeredBy,
        string description,
        uint256 timestamp
    );
    
    event BlacklistUpdated(address indexed addr, bool isBlacklisted);
    event EmergencyAction(string action, address indexed by, uint256 timestamp);
    
    // 新增事件
    event PrizePoolWalletUpdated(address indexed newWallet);
    event ProfitWalletUpdated(address indexed newWallet);
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
        address _profitWallet
    ) {
        require(_maoToken != address(0), "Invalid MAO token");
        require(_piToken != address(0), "Invalid PI token");
        require(_admins.length >= MIN_ADMIN_COUNT, "Need at least 5 admins");
        require(_trustedOwner != address(0), "Invalid trusted owner");
        require(_prizePoolWallet != address(0), "Invalid prize pool wallet");
        require(_profitWallet != address(0), "Invalid profit wallet");
        
        maoToken = IERC20(_maoToken);
        piToken = IERC20(_piToken);
        prizePoolWallet = _prizePoolWallet;
        profitWallet = _profitWallet;
        
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
            "Ultra secure wheel game V2 deployed with enhanced features",
            block.timestamp
        );
        
        emit BlacklistUpdated(0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7, true);
        emit PrizePoolWalletUpdated(_prizePoolWallet);
        emit ProfitWalletUpdated(_profitWallet);
    }
    
    // 优化后的游戏函数
    function playMAOGame() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(maoToken.transferFrom(msg.sender, address(this), maoGameCost), "MAO transfer failed");
        
        uint256 randomSeed = _generateRandomSeed();
        (uint256 rewardAmount, uint8 rewardLevel, bool isWin) = _calculateOptimizedReward(randomSeed, 0);
        
        if (isWin && rewardAmount > 0) {
            require(maoToken.transfer(msg.sender, rewardAmount), "MAO reward transfer failed");
        }
        
        _recordGame(msg.sender, 0, maoGameCost, rewardAmount, rewardLevel, randomSeed);
        
        emit GamePlayed(msg.sender, 0, maoGameCost, rewardAmount, rewardLevel, randomSeed, false);
    }
    
    function playPIGame() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(piToken.transferFrom(msg.sender, address(this), piGameCost), "PI transfer failed");
        
        uint256 randomSeed = _generateRandomSeed();
        (uint256 rewardAmount, uint8 rewardLevel, bool isWin) = _calculateOptimizedReward(randomSeed, 1);
        
        if (isWin && rewardAmount > 0) {
            require(piToken.transfer(msg.sender, rewardAmount), "PI reward transfer failed");
        }
        
        _recordGame(msg.sender, 1, piGameCost, rewardAmount, rewardLevel, randomSeed);
        
        emit GamePlayed(msg.sender, 1, piGameCost, rewardAmount, rewardLevel, randomSeed, false);
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
    
    // 奖金池管理函数
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
        uint256 randomSeed
    ) private {
        GameRecord memory record = GameRecord({
            player: player,
            tokenType: tokenType,
            betAmount: betAmount,
            rewardAmount: rewardAmount,
            rewardLevel: rewardLevel,
            timestamp: block.timestamp,
            randomSeed: randomSeed,
            wasProtected: true
        });
        
        playerHistory[player].push(record);
        
        GameStats storage stats = gameStats[tokenType];
        stats.totalGames++;
        stats.totalBets += betAmount;
        
        if (rewardAmount > 0) {
            stats.totalWins++;
            stats.totalRewards += rewardAmount;
        }
    }
    
    receive() external payable {
        revert("Contract does not accept ETH");
    }
} 
 
 
 