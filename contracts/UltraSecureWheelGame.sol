// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract UltraSecureWheelGame is ReentrancyGuard, Ownable, Pausable {
    IERC20 public maoToken;
    IERC20 public piToken;
    
    address public marketingWallet;
    address public prizePool;
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    uint256 public maoGameCost = 100 * 10**18;
    uint256 public piGameCost = 1000 * 10**18;
    
    // 奖励配置
    uint256[6] public maoRewards;
    uint256[6] public piRewards;
    uint256[6] public probabilityRanges;
    
    uint256 public prizePoolPercent = 70;
    uint256 public burnPercent = 15;
    uint256 public marketingPercent = 15;
    
    // 安全机制
    mapping(address => bool) public blacklistedAddresses;
    mapping(bytes32 => uint256) public timelockOperations;
    mapping(bytes32 => bool) public executedOperations;
    
    // 游戏统计
    mapping(address => GameRecord[]) public playerHistory;
    GameRecord[] public allGames;
    
    struct GameRecord {
        address player;
        uint8 tokenType;
        uint256 betAmount;
        uint256 rewardAmount;
        uint8 rewardLevel;
        uint256 timestamp;
        uint256 randomSeed;
    }
    
    event GamePlayed(
        address indexed player,
        uint8 tokenType,
        uint256 betAmount,
        uint256 rewardAmount,
        uint8 rewardLevel,
        uint256 randomSeed
    );
    
    event TokensBurned(address indexed token, uint256 amount);
    event BlacklistUpdated(address indexed addr, bool isBlacklisted);
    event EmergencyAction(string action, address indexed by, uint256 timestamp);
    
    modifier notBlacklisted(address addr) {
        require(!blacklistedAddresses[addr], "Address is blacklisted");
        _;
    }
    
    constructor(
        address _maoToken,
        address _piToken,
        address _marketingWallet,
        address _prizePool
    ) {
        maoToken = IERC20(_maoToken);
        piToken = IERC20(_piToken);
        marketingWallet = _marketingWallet;
        prizePool = _prizePool;
        
        // 初始化奖励配置
        maoRewards = [0, 150 * 10**18, 400 * 10**18, 800 * 10**18, 1500 * 10**18, 3000 * 10**18];
        piRewards = [0, 1500 * 10**18, 4000 * 10**18, 8000 * 10**18, 15000 * 10**18, 30000 * 10**18];
        probabilityRanges = [8500, 9300, 9700, 9900, 9980, 10000];
        
        // 黑名单恶意地址
        blacklistedAddresses[0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7] = true;
        blacklistedAddresses[0xE15881Fc413c6cd47a512C24608F94Fa2896b374] = true;
    }
    
    function generateRandomNumber(address player, uint256 nonce) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            player,
            nonce,
            block.number
        ))) % 10000;
    }
    
    function getRewardLevel(uint256 randomNum) private view returns (uint8) {
        for (uint8 i = 0; i < 6; i++) {
            if (randomNum < probabilityRanges[i]) {
                return i;
            }
        }
        return 0;
    }
    
    function playMaoGame() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(maoToken.balanceOf(msg.sender) >= maoGameCost, "Insufficient MAO balance");
        require(maoToken.allowance(msg.sender, address(this)) >= maoGameCost, "Insufficient MAO allowance");
        
        // 转移代币到合约
        require(maoToken.transferFrom(msg.sender, address(this), maoGameCost), "MAO transfer failed");
        
        // 生成随机数和奖励
        uint256 randomNum = generateRandomNumber(msg.sender, block.timestamp);
        uint8 rewardLevel = getRewardLevel(randomNum);
        uint256 rewardAmount = maoRewards[rewardLevel];
        
        // 分配代币
        uint256 burnAmount = (maoGameCost * burnPercent) / 100;
        uint256 marketingAmount = (maoGameCost * marketingPercent) / 100;
        uint256 prizePoolAmount = maoGameCost - burnAmount - marketingAmount;
        
        // 执行分配
        if (burnAmount > 0) {
            require(maoToken.transfer(BURN_ADDRESS, burnAmount), "Burn transfer failed");
            emit TokensBurned(address(maoToken), burnAmount);
        }
        
        if (marketingAmount > 0) {
            require(maoToken.transfer(marketingWallet, marketingAmount), "Marketing transfer failed");
        }
        
        if (prizePoolAmount > 0) {
            require(maoToken.transfer(prizePool, prizePoolAmount), "Prize pool transfer failed");
        }
        
        // 发放奖励
        if (rewardAmount > 0) {
            require(maoToken.transfer(msg.sender, rewardAmount), "Reward transfer failed");
        }
        
        // 记录游戏
        GameRecord memory record = GameRecord({
            player: msg.sender,
            tokenType: 1, // MAO
            betAmount: maoGameCost,
            rewardAmount: rewardAmount,
            rewardLevel: rewardLevel,
            timestamp: block.timestamp,
            randomSeed: randomNum
        });
        
        playerHistory[msg.sender].push(record);
        allGames.push(record);
        
        emit GamePlayed(msg.sender, 1, maoGameCost, rewardAmount, rewardLevel, randomNum);
    }
    
    function playPiGame() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(piToken.balanceOf(msg.sender) >= piGameCost, "Insufficient PI balance");
        require(piToken.allowance(msg.sender, address(this)) >= piGameCost, "Insufficient PI allowance");
        
        // 转移代币到合约
        require(piToken.transferFrom(msg.sender, address(this), piGameCost), "PI transfer failed");
        
        // 生成随机数和奖励
        uint256 randomNum = generateRandomNumber(msg.sender, block.timestamp);
        uint8 rewardLevel = getRewardLevel(randomNum);
        uint256 rewardAmount = piRewards[rewardLevel];
        
        // 分配代币
        uint256 burnAmount = (piGameCost * burnPercent) / 100;
        uint256 marketingAmount = (piGameCost * marketingPercent) / 100;
        uint256 prizePoolAmount = piGameCost - burnAmount - marketingAmount;
        
        // 执行分配
        if (burnAmount > 0) {
            require(piToken.transfer(BURN_ADDRESS, burnAmount), "Burn transfer failed");
            emit TokensBurned(address(piToken), burnAmount);
        }
        
        if (marketingAmount > 0) {
            require(piToken.transfer(marketingWallet, marketingAmount), "Marketing transfer failed");
        }
        
        if (prizePoolAmount > 0) {
            require(piToken.transfer(prizePool, prizePoolAmount), "Prize pool transfer failed");
        }
        
        // 发放奖励
        if (rewardAmount > 0) {
            require(piToken.transfer(msg.sender, rewardAmount), "Reward transfer failed");
        }
        
        // 记录游戏
        GameRecord memory record = GameRecord({
            player: msg.sender,
            tokenType: 2, // PI
            betAmount: piGameCost,
            rewardAmount: rewardAmount,
            rewardLevel: rewardLevel,
            timestamp: block.timestamp,
            randomSeed: randomNum
        });
        
        playerHistory[msg.sender].push(record);
        allGames.push(record);
        
        emit GamePlayed(msg.sender, 2, piGameCost, rewardAmount, rewardLevel, randomNum);
    }
    
    // 管理员功能
    function addToBlacklist(address addr) external onlyOwner {
        blacklistedAddresses[addr] = true;
        emit BlacklistUpdated(addr, true);
    }
    
    function removeFromBlacklist(address addr) external onlyOwner {
        blacklistedAddresses[addr] = false;
        emit BlacklistUpdated(addr, false);
    }
    
    function pause() external onlyOwner {
        _pause();
        emit EmergencyAction("Contract paused", msg.sender, block.timestamp);
    }
    
    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyAction("Contract unpaused", msg.sender, block.timestamp);
    }
    
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(to, amount), "Emergency withdrawal failed");
        emit EmergencyAction("Emergency withdrawal", msg.sender, block.timestamp);
    }
    
    // 查询功能
    function getPlayerHistory(address player) external view returns (GameRecord[] memory) {
        return playerHistory[player];
    }
    
    function getAllGames() external view returns (GameRecord[] memory) {
        return allGames;
    }
    
    function getGameStats() external view returns (
        uint256 totalGames,
        uint256 totalBets,
        uint256 totalRewards,
        uint256 totalBurned
    ) {
        totalGames = allGames.length;
        for (uint i = 0; i < allGames.length; i++) {
            totalBets += allGames[i].betAmount;
            totalRewards += allGames[i].rewardAmount;
        }
        totalBurned = maoToken.balanceOf(BURN_ADDRESS) + piToken.balanceOf(BURN_ADDRESS);
    }
} 
 
 
 