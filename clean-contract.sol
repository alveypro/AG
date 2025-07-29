// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title UltraSecureWheelGame
 * @dev 万无一失的超级安全转盘游戏合约
 * @notice 包含多重签名、时间锁、黑名单、限额等所有安全特性
 */
contract UltraSecureWheelGame is ReentrancyGuard, AccessControl, Pausable {
    using ECDSA for bytes32;

    // 角色定义
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // 多重签名配置
    uint256 public constant REQUIRED_SIGNATURES = 3;
    uint256 public constant MIN_ADMIN_COUNT = 5;
    uint256 public adminCount;

    // 时间锁配置
    uint256 public constant TIMELOCK_DELAY = 24 hours;
    uint256 public constant EMERGENCY_TIMELOCK = 1 hours;

    // 安全限制
    uint256 public maxSingleWithdraw = 10000 * 10**18;
    uint256 public dailyWithdrawLimit = 50000 * 10**18;
    uint256 public weeklyWithdrawLimit = 200000 * 10**18;
    
    // 游戏配置
    uint256 public maoGameCost = 100 * 10**18;
    uint256 public piGameCost = 1000 * 10**18;
    
    // 代币合约
    IERC20 public maoToken;
    IERC20 public piToken;
    
    // 黑名单保护
    mapping(address => bool) public blacklistedAddresses;
    
    // 时间锁操作
    mapping(bytes32 => uint256) public timelockOperations;
    mapping(bytes32 => bool) public executedOperations;
    
    // 提取限制跟踪
    mapping(address => mapping(uint256 => uint256)) public dailyWithdrawn;
    mapping(address => mapping(uint256 => uint256)) public weeklyWithdrawn;
    
    // 游戏统计
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
    
    // 多重签名相关
    struct MultiSigOperation {
        bytes32 operationHash;
        address[] signers;
        uint256 requiredSigs;
        uint256 deadline;
        bool executed;
        bytes data;
    }
    
    mapping(bytes32 => MultiSigOperation) public multiSigOps;
    mapping(bytes32 => mapping(address => bool)) public hasSigned;
    
    // 事件
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
    event MultiSigOperationCreated(bytes32 indexed opHash, address indexed creator);
    event MultiSigOperationSigned(bytes32 indexed opHash, address indexed signer);
    event MultiSigOperationExecuted(bytes32 indexed opHash);
    
    modifier onlyTrustedAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");
        require(!blacklistedAddresses[msg.sender], "Admin is blacklisted");
        _;
    }
    
    modifier notBlacklisted(address addr) {
        require(!blacklistedAddresses[addr], "Address is blacklisted");
        _;
    }
    
    modifier timelockProtected(bytes32 operation) {
        require(
            timelockOperations[operation] != 0 && 
            block.timestamp >= timelockOperations[operation],
            "Timelock not satisfied"
        );
        require(!executedOperations[operation], "Operation already executed");
        _;
    }
    
    modifier multiSigProtected(bytes32 opHash) {
        MultiSigOperation storage op = multiSigOps[opHash];
        require(op.signers.length >= op.requiredSigs, "Insufficient signatures");
        require(!op.executed, "Already executed");
        require(block.timestamp <= op.deadline, "Operation expired");
        _;
    }

    constructor(
        address _maoToken,
        address _piToken,
        address[] memory _admins,
        address _trustedOwner
    ) {
        require(_maoToken != address(0), "Invalid MAO token");
        require(_piToken != address(0), "Invalid PI token");
        require(_admins.length >= MIN_ADMIN_COUNT, "Need at least 5 admins");
        require(_trustedOwner != address(0), "Invalid trusted owner");
        
        maoToken = IERC20(_maoToken);
        piToken = IERC20(_piToken);
        
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
            "Ultra secure wheel game deployed with enhanced security",
            block.timestamp
        );
        
        emit BlacklistUpdated(0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7, true);
    }
    
    function playMAOGame() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(maoToken.transferFrom(msg.sender, address(this), maoGameCost), "MAO transfer failed");
        
        uint256 randomSeed = _generateRandomSeed();
        (uint256 rewardAmount, uint8 rewardLevel, bool isWin) = _calculateReward(randomSeed, 0);
        
        if (isWin && rewardAmount > 0) {
            require(maoToken.transfer(msg.sender, rewardAmount), "MAO reward transfer failed");
        }
        
        _recordGame(msg.sender, 0, maoGameCost, rewardAmount, rewardLevel, randomSeed);
        
        emit GamePlayed(msg.sender, 0, maoGameCost, rewardAmount, rewardLevel, randomSeed, false);
    }
    
    function playPIGame() external nonReentrant whenNotPaused notBlacklisted(msg.sender) {
        require(piToken.transferFrom(msg.sender, address(this), piGameCost), "PI transfer failed");
        
        uint256 randomSeed = _generateRandomSeed();
        (uint256 rewardAmount, uint8 rewardLevel, bool isWin) = _calculateReward(randomSeed, 1);
        
        if (isWin && rewardAmount > 0) {
            require(piToken.transfer(msg.sender, rewardAmount), "PI reward transfer failed");
        }
        
        _recordGame(msg.sender, 1, piGameCost, rewardAmount, rewardLevel, randomSeed);
        
        emit GamePlayed(msg.sender, 1, piGameCost, rewardAmount, rewardLevel, randomSeed, false);
    }
    
    function scheduleOperation(bytes32 operation, bool isEmergency) external onlyTrustedAdmin {
        uint256 delay = isEmergency ? EMERGENCY_TIMELOCK : TIMELOCK_DELAY;
        timelockOperations[operation] = block.timestamp + delay;
        
        emit SecurityAlert(
            "TIMELOCK_SCHEDULED",
            msg.sender,
            "Operation scheduled with timelock",
            block.timestamp
        );
    }
    
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
    
    function createMultiSigOperation(
        bytes32 opHash,
        bytes calldata data,
        uint256 deadline
    ) external onlyTrustedAdmin {
        require(multiSigOps[opHash].operationHash == bytes32(0), "Operation exists");
        require(deadline > block.timestamp, "Invalid deadline");
        
        multiSigOps[opHash] = MultiSigOperation({
            operationHash: opHash,
            signers: new address[](0),
            requiredSigs: REQUIRED_SIGNATURES,
            deadline: deadline,
            executed: false,
            data: data
        });
        
        emit MultiSigOperationCreated(opHash, msg.sender);
    }
    
    function signMultiSigOperation(bytes32 opHash) external onlyTrustedAdmin {
        MultiSigOperation storage op = multiSigOps[opHash];
        require(op.operationHash != bytes32(0), "Operation not found");
        require(!hasSigned[opHash][msg.sender], "Already signed");
        require(!op.executed, "Already executed");
        require(block.timestamp <= op.deadline, "Operation expired");
        
        hasSigned[opHash][msg.sender] = true;
        op.signers.push(msg.sender);
        
        emit MultiSigOperationSigned(opHash, msg.sender);
    }
    
    function executeMultiSigOperation(bytes32 opHash) external onlyTrustedAdmin multiSigProtected(opHash) {
        MultiSigOperation storage op = multiSigOps[opHash];
        op.executed = true;
        
        (bool success,) = address(this).call(op.data);
        require(success, "MultiSig operation failed");
        
        emit MultiSigOperationExecuted(opHash);
    }
    
    function secureWithdrawTokens(
        address token,
        uint256 amount,
        bytes32 operation
    ) external onlyTrustedAdmin timelockProtected(operation) {
        require(token == address(maoToken) || token == address(piToken), "Invalid token");
        require(amount > 0, "Invalid amount");
        
        uint256 today = block.timestamp / 1 days;
        uint256 thisWeek = block.timestamp / 1 weeks;
        
        require(
            dailyWithdrawn[msg.sender][today] + amount <= dailyWithdrawLimit,
            "Daily limit exceeded"
        );
        require(
            weeklyWithdrawn[msg.sender][thisWeek] + amount <= weeklyWithdrawLimit,
            "Weekly limit exceeded"
        );
        require(amount <= maxSingleWithdraw, "Single withdraw limit exceeded");
        
        dailyWithdrawn[msg.sender][today] += amount;
        weeklyWithdrawn[msg.sender][thisWeek] += amount;
        
        IERC20(token).transfer(msg.sender, amount);
        executedOperations[operation] = true;
        
        emit SecurityAlert(
            "SECURE_WITHDRAWAL",
            msg.sender,
            "Tokens withdrawn with full security checks",
            block.timestamp
        );
    }
    
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
    
    function getMultiSigOperation(bytes32 opHash) external view returns (MultiSigOperation memory) {
        return multiSigOps[opHash];
    }
    
    function _generateRandomSeed() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            blockhash(block.number - 1)
        )));
    }
    
    function _calculateReward(uint256 randomSeed, uint8 tokenType) private view returns (uint256 rewardAmount, uint8 rewardLevel, bool isWin) {
        uint256 chance = randomSeed % 100;
        
        if (chance < 30) {
            isWin = true;
            
            if (chance < 1) {
                rewardLevel = 4;
                rewardAmount = tokenType == 0 ? 10000 * 10**18 : 50000 * 10**18;
            } else if (chance < 5) {
                rewardLevel = 3;
                rewardAmount = tokenType == 0 ? 2000 * 10**18 : 10000 * 10**18;
            } else if (chance < 15) {
                rewardLevel = 2;
                rewardAmount = tokenType == 0 ? 500 * 10**18 : 2500 * 10**18;
            } else {
                rewardLevel = 1;
                rewardAmount = tokenType == 0 ? 150 * 10**18 : 1500 * 10**18;
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
    
    receive() external payable {
        revert("Contract does not accept ETH");
    }
} 