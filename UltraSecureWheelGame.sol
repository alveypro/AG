// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UltraSecureWheelGame {
    // 角色管理
    mapping(address => bool) public admins;
    mapping(address => bool) public emergencyOperators;
    address public trustedOwner;

    // 游戏配置
    uint256 public constant REQUIRED_SIGNATURES = 3;
    uint256 public constant MIN_ADMIN_COUNT = 5;
    uint256 public adminCount;

    uint256 public constant TIMELOCK_DELAY = 24 hours;
    uint256 public maxSingleWithdraw = 10000 * 10**18;
    uint256 public dailyWithdrawLimit = 50000 * 10**18;
    
    uint256 public maoGameCost = 100 * 10**18;
    uint256 public piGameCost = 1000 * 10**18;
    
    // 代币接口
    address public maoToken;
    address public piToken;
    
    // 安全机制
    mapping(address => bool) public blacklistedAddresses;
    mapping(bytes32 => uint256) public timelockOperations;
    mapping(bytes32 => bool) public executedOperations;
    bool public paused;
    
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
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    
    // 修饰符
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == trustedOwner, "Not admin");
        require(!blacklistedAddresses[msg.sender], "Admin is blacklisted");
        _;
    }
    
    modifier onlyEmergencyOperator() {
        require(emergencyOperators[msg.sender] || msg.sender == trustedOwner, "Not emergency operator");
        _;
    }
    
    modifier notBlacklisted(address addr) {
        require(!blacklistedAddresses[addr], "Address is blacklisted");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier whenPaused() {
        require(paused, "Contract is not paused");
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
        
        maoToken = _maoToken;
        piToken = _piToken;
        trustedOwner = _trustedOwner;
        
        // 设置管理员
        admins[_trustedOwner] = true;
        emergencyOperators[_trustedOwner] = true;
        adminCount = 1;
        
        for (uint i = 0; i < _admins.length; i++) {
            require(_admins[i] != address(0), "Invalid admin address");
            require(!blacklistedAddresses[_admins[i]], "Admin is blacklisted");
            admins[_admins[i]] = true;
            adminCount++;
        }
        
        // 黑名单恶意地址
        blacklistedAddresses[0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7] = true;
        
        emit SecurityAlert(
            "CONTRACT_DEPLOYED",
            msg.sender,
            "Ultra secure wheel game deployed with enhanced security",
            block.timestamp
        );
        
        emit BlacklistUpdated(0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7, true);
    }
    
    // 代币转账函数
    function transferFrom(address token, address from, address to, uint256 amount) internal returns (bool) {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, amount)
        );
        return success && (data.length == 0 || abi.decode(data, (bool)));
    }
    
    function transfer(address token, address to, uint256 amount) internal returns (bool) {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSignature("transfer(address,uint256)", to, amount)
        );
        return success && (data.length == 0 || abi.decode(data, (bool)));
    }
    
    function playMAOGame() external whenNotPaused notBlacklisted(msg.sender) {
        require(transferFrom(maoToken, msg.sender, address(this), maoGameCost), "MAO transfer failed");
        
        uint256 randomSeed = _generateRandomSeed();
        (uint256 rewardAmount, uint8 rewardLevel, bool isWin) = _calculateReward(randomSeed, 0);
        
        if (isWin && rewardAmount > 0) {
            require(transfer(maoToken, msg.sender, rewardAmount), "MAO reward transfer failed");
        }
        
        _recordGame(msg.sender, 0, maoGameCost, rewardAmount, rewardLevel, randomSeed);
        
        emit GamePlayed(msg.sender, 0, maoGameCost, rewardAmount, rewardLevel, randomSeed, false);
    }
    
    function playPIGame() external whenNotPaused notBlacklisted(msg.sender) {
        require(transferFrom(piToken, msg.sender, address(this), piGameCost), "PI transfer failed");
        
        uint256 randomSeed = _generateRandomSeed();
        (uint256 rewardAmount, uint8 rewardLevel, bool isWin) = _calculateReward(randomSeed, 1);
        
        if (isWin && rewardAmount > 0) {
            require(transfer(piToken, msg.sender, rewardAmount), "PI reward transfer failed");
        }
        
        _recordGame(msg.sender, 1, piGameCost, rewardAmount, rewardLevel, randomSeed);
        
        emit GamePlayed(msg.sender, 1, piGameCost, rewardAmount, rewardLevel, randomSeed, false);
    }
    
    // 管理员功能
    function addToBlacklist(address addr) external onlyAdmin {
        require(addr != address(0), "Invalid address");
        require(!admins[addr], "Cannot blacklist admin");
        
        blacklistedAddresses[addr] = true;
        emit BlacklistUpdated(addr, true);
        
        emit SecurityAlert(
            "BLACKLIST_ADDED",
            msg.sender,
            "Address added to blacklist",
            block.timestamp
        );
    }
    
    function removeFromBlacklist(address addr) external onlyAdmin {
        blacklistedAddresses[addr] = false;
        emit BlacklistUpdated(addr, false);
    }
    
    function addAdmin(address addr) external onlyAdmin {
        require(addr != address(0), "Invalid address");
        require(!admins[addr], "Already admin");
        require(!blacklistedAddresses[addr], "Address is blacklisted");
        
        admins[addr] = true;
        adminCount++;
        emit AdminAdded(addr);
    }
    
    function removeAdmin(address addr) external onlyAdmin {
        require(addr != trustedOwner, "Cannot remove trusted owner");
        require(admins[addr], "Not admin");
        
        admins[addr] = false;
        adminCount--;
        emit AdminRemoved(addr);
    }
    
    function addEmergencyOperator(address addr) external onlyAdmin {
        require(addr != address(0), "Invalid address");
        require(!blacklistedAddresses[addr], "Address is blacklisted");
        
        emergencyOperators[addr] = true;
    }
    
    // 紧急功能
    function emergencyPause() external onlyEmergencyOperator {
        paused = true;
        emit EmergencyAction("PAUSE", msg.sender, block.timestamp);
        
        emit SecurityAlert(
            "EMERGENCY_PAUSE",
            msg.sender,
            "Contract paused due to emergency",
            block.timestamp
        );
    }
    
    function emergencyUnpause() external onlyEmergencyOperator {
        paused = false;
        emit EmergencyAction("UNPAUSE", msg.sender, block.timestamp);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyEmergencyOperator whenPaused {
        require(token == maoToken || token == piToken, "Invalid token");
        require(transfer(token, msg.sender, amount), "Transfer failed");
        
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
        (bool success, bytes memory data) = token.staticcall(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );
        if (success && data.length >= 32) {
            return abi.decode(data, (uint256));
        }
        return 0;
    }
    
    function isAddressSafe(address addr) external view returns (bool) {
        return !blacklistedAddresses[addr] && addr != address(0);
    }
    
    function isAdmin(address addr) external view returns (bool) {
        return admins[addr] || addr == trustedOwner;
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
    
    // 防止接收ETH
    receive() external payable {
        revert("Contract does not accept ETH");
    }
    
    fallback() external payable {
        revert("Contract does not accept ETH");
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
    
    // 防止意外发送的ETH
    receive() external payable {
        revert("Contract does not accept ETH");
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
    
    // 防止意外发送的ETH
    receive() external payable {
        revert("Contract does not accept ETH");
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
    
    // 防止意外发送的ETH
    receive() external payable {
        revert("Contract does not accept ETH");
    }
} 