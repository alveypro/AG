// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract UltraSecureWheelGame {
    // 事件定义
    event GamePlayed(
        address indexed player,
        uint8 tokenType,
        uint256 betAmount,
        uint256 rewardAmount,
        uint8 rewardLevel,
        uint256 randomSeed,
        bool wasProtected
    );
    
    event BlacklistUpdated(address indexed addr, bool isBlacklisted);
    event AdminAdded(address indexed addr);
    event AdminRemoved(address indexed addr);
    event EmergencyAction(string action, address indexed operator, uint256 timestamp);
    event SecurityAlert(string alertType, address indexed operator, string message, uint256 timestamp);
    event EmergencyWithdrawRequested(address indexed operator, address indexed recipient, uint256 amount, uint256 timestamp);
    event EmergencyWithdrawExecuted(address indexed recipient, uint256 amount, uint256 timestamp);
    
    // 结构体定义
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
    
    struct GameStats {
        uint256 totalGames;
        uint256 totalBets;
        uint256 totalWins;
        uint256 totalRewards;
    }
    
    struct EmergencyWithdrawRequest {
        address recipient;
        uint256 amount;
        uint256 requestTime;
        bool executed;
        uint256 requiredConfirmations;
        mapping(address => bool) confirmations;
    }
    
    // 状态变量
    address public trustedOwner;
    address public maoToken;
    address public piToken;
    uint256 public maoGameCost;
    uint256 public piGameCost;
    
    mapping(address => bool) public admins;
    mapping(address => bool) public emergencyOperators;
    mapping(address => bool) public blacklistedAddresses;
    mapping(address => GameRecord[]) public playerHistory;
    mapping(uint8 => GameStats) public gameStats;
    
    uint256 public adminCount;
    bool public paused;
    
    // 安全配置
    uint256 public constant EMERGENCY_WITHDRAW_DELAY = 24 hours; // 24小时延迟
    uint256 public constant MIN_EMERGENCY_CONFIRMATIONS = 2; // 最少需要2个确认
    uint256 public emergencyWithdrawRequestCount;
    mapping(uint256 => EmergencyWithdrawRequest) public emergencyWithdrawRequests;
    
    // 修饰符
    modifier onlyOwner() {
        require(msg.sender == trustedOwner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == trustedOwner, "Only admin can call this function");
        _;
    }
    
    modifier onlyEmergencyOperator() {
        require(emergencyOperators[msg.sender] || admins[msg.sender] || msg.sender == trustedOwner, "Only emergency operator can call this function");
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
    
    modifier notBlacklisted(address addr) {
        require(!blacklistedAddresses[addr], "Address is blacklisted");
        _;
    }
    
    // 构造函数
    constructor(
        address _maoToken,
        address _piToken,
        uint256 _maoGameCost,
        uint256 _piGameCost
    ) {
        trustedOwner = msg.sender;
        admins[msg.sender] = true;
        adminCount = 1;
        
        maoToken = _maoToken;
        piToken = _piToken;
        maoGameCost = _maoGameCost;
        piGameCost = _piGameCost;
        
        // 初始化游戏统计
        gameStats[0] = GameStats(0, 0, 0, 0);
        gameStats[1] = GameStats(0, 0, 0, 0);
        
        emit SecurityAlert(
            "CONTRACT_DEPLOYED",
            msg.sender,
            "UltraSecureWheelGame deployed successfully",
            block.timestamp
        );
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
    
    // 安全的紧急功能
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
    
    // 安全的紧急提款 - 需要多重确认和时间延迟
    function requestEmergencyWithdraw(address token, address recipient, uint256 amount) external onlyEmergencyOperator whenPaused {
        require(token == maoToken || token == piToken, "Invalid token");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 requestId = emergencyWithdrawRequestCount++;
        EmergencyWithdrawRequest storage request = emergencyWithdrawRequests[requestId];
        
        request.recipient = recipient;
        request.amount = amount;
        request.requestTime = block.timestamp;
        request.executed = false;
        request.requiredConfirmations = MIN_EMERGENCY_CONFIRMATIONS;
        request.confirmations[msg.sender] = true;
        
        emit EmergencyWithdrawRequested(msg.sender, recipient, amount, block.timestamp);
    }
    
    function confirmEmergencyWithdraw(uint256 requestId) external onlyEmergencyOperator {
        EmergencyWithdrawRequest storage request = emergencyWithdrawRequests[requestId];
        require(!request.executed, "Request already executed");
        require(!request.confirmations[msg.sender], "Already confirmed");
        
        request.confirmations[msg.sender] = true;
        
        // 检查是否有足够的确认
        uint256 confirmations = 0;
        if (request.confirmations[trustedOwner]) confirmations++;
        if (admins[msg.sender]) confirmations++;
        if (emergencyOperators[msg.sender]) confirmations++;
        
        if (confirmations >= request.requiredConfirmations && 
            block.timestamp >= request.requestTime + EMERGENCY_WITHDRAW_DELAY) {
            _executeEmergencyWithdraw(requestId);
        }
    }
    
    function _executeEmergencyWithdraw(uint256 requestId) private {
        EmergencyWithdrawRequest storage request = emergencyWithdrawRequests[requestId];
        require(!request.executed, "Already executed");
        require(block.timestamp >= request.requestTime + EMERGENCY_WITHDRAW_DELAY, "Delay not met");
        
        request.executed = true;
        
        // 确定代币类型
        address token = (request.amount <= getContractBalance(maoToken)) ? maoToken : piToken;
        
        require(transfer(token, request.recipient, request.amount), "Transfer failed");
        
        emit EmergencyWithdrawExecuted(request.recipient, request.amount, block.timestamp);
        emit SecurityAlert(
            "EMERGENCY_WITHDRAWAL_EXECUTED",
            msg.sender,
            "Emergency withdrawal executed with proper confirmations",
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
    
    function getContractBalance(address token) public view returns (uint256) {
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
            block.prevrandao,
            msg.sender,
            blockhash(block.number - 1)
        )));
    }
    
    function _calculateReward(uint256 randomSeed, uint8 tokenType) private pure returns (uint256 rewardAmount, uint8 rewardLevel, bool isWin) {
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
 
 
 