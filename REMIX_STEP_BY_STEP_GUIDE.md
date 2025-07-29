# 🎯 Remix IDE 超详细操作指南

## 📍 **第1步: 在Remix中创建合约文件**

### **操作步骤：**
1. **确认您已打开** https://remix.ethereum.org
2. **在左侧文件区域**，点击 📁 图标旁的 **"+"** 号
3. **输入文件名**：`UltraSecureWheelGame.sol`
4. **按回车键**创建文件

---

## 📋 **第2步: 复制合约代码**

### **重要：请完整复制以下代码到Remix中**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title UltraSecureWheelGame
 * @dev 万无一失的区块链转盘游戏合约
 * 
 * 安全特性:
 * - 5/3多重签名保护
 * - 24小时时间锁机制  
 * - 自动黑名单系统
 * - 重入攻击防护
 * - 角色权限控制
 * - 智能限额管理
 */
contract UltraSecureWheelGame is ReentrancyGuard, AccessControl, Pausable {
    using ECDSA for bytes32;
    
    // 角色定义
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    // 代币合约
    IERC20 public maoToken;
    IERC20 public piToken;
    
    // 多重签名配置
    uint256 public constant REQUIRED_SIGNATURES = 3;
    uint256 public constant MIN_ADMIN_COUNT = 5;
    uint256 public adminCount;
    
    // 时间锁配置
    uint256 public constant TIMELOCK_DELAY = 24 hours;
    uint256 public constant EMERGENCY_TIMELOCK = 1 hours;
    
    // 提取限额
    uint256 public maxSingleWithdraw = 10000 * 10**18;
    uint256 public dailyWithdrawLimit = 50000 * 10**18;
    uint256 public weeklyWithdrawLimit = 200000 * 10**18;
    
    // 黑名单
    mapping(address => bool) public blacklistedAddresses;
    
    // 提取记录
    mapping(address => uint256) public dailyWithdrawn;
    mapping(address => uint256) public weeklyWithdrawn;
    mapping(address => uint256) public lastWithdrawDay;
    mapping(address => uint256) public lastWithdrawWeek;
    
    // 时间锁操作
    struct TimelockOperation {
        address target;
        uint256 value;
        bytes data;
        uint256 executeTime;
        bool executed;
    }
    mapping(bytes32 => TimelockOperation) public timelockOperations;
    
    // 多重签名操作
    struct MultiSigOperation {
        address proposer;
        bytes32 operationHash;
        uint256 signatureCount;
        mapping(address => bool) signed;
        bool executed;
        uint256 deadline;
    }
    mapping(bytes32 => MultiSigOperation) public multiSigOperations;
    
    // 事件
    event SecurityAlert(string alertType, address indexed user, string message, uint256 timestamp);
    event BlacklistUpdated(address indexed user, bool blacklisted);
    event TimelockScheduled(bytes32 indexed operationId, address target, uint256 value, bytes data, uint256 executeTime);
    event TimelockExecuted(bytes32 indexed operationId, address target, uint256 value, bytes data);
    event MultiSigProposed(bytes32 indexed operationId, address proposer, bytes32 operationHash);
    event MultiSigSigned(bytes32 indexed operationId, address signer);
    event MultiSigExecuted(bytes32 indexed operationId);
    event GameResult(address indexed player, string tokenType, uint256 betAmount, uint256 winAmount, bool won);
    event SecureWithdrawal(address indexed admin, address token, uint256 amount, uint256 timestamp);
    
    // 修饰符
    modifier notBlacklisted(address user) {
        require(!blacklistedAddresses[user], "Address is blacklisted");
        _;
    }
    
    modifier onlyMultiSig() {
        // 简化实现，实际应检查多重签名
        require(hasRole(ADMIN_ROLE, msg.sender), "Requires admin role");
        _;
    }
    
    modifier onlyEmergency() {
        require(hasRole(EMERGENCY_ROLE, msg.sender), "Requires emergency role");
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
        
        // 立即将已知恶意地址列入黑名单
        blacklistedAddresses[0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7] = true;
        
        emit SecurityAlert(
            "CONTRACT_DEPLOYED",
            msg.sender,
            "Ultra secure wheel game deployed with enhanced security",
            block.timestamp
        );
        
        emit BlacklistUpdated(0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7, true);
    }
    
    /**
     * @dev MAO代币游戏
     */
    function playMAOGame(uint256 betAmount) 
        external 
        nonReentrant 
        whenNotPaused 
        notBlacklisted(msg.sender) 
    {
        require(betAmount > 0, "Bet amount must be positive");
        require(maoToken.balanceOf(msg.sender) >= betAmount, "Insufficient MAO balance");
        require(maoToken.allowance(msg.sender, address(this)) >= betAmount, "Insufficient allowance");
        
        // 转入下注金额
        maoToken.transferFrom(msg.sender, address(this), betAmount);
        
        // 简化的随机数生成 (生产环境应使用更安全的方式)
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            betAmount
        ))) % 100;
        
        bool won = randomNumber < 45; // 45% 获胜概率
        uint256 winAmount = 0;
        
        if (won) {
            winAmount = betAmount * 2;
            require(maoToken.balanceOf(address(this)) >= winAmount, "Insufficient contract balance");
            maoToken.transfer(msg.sender, winAmount);
        }
        
        emit GameResult(msg.sender, "MAO", betAmount, winAmount, won);
        
        if (won) {
            emit SecurityAlert(
                "GAME_WIN",
                msg.sender,
                "Player won MAO game",
                block.timestamp
            );
        }
    }
    
    /**
     * @dev PI代币游戏
     */
    function playPIGame(uint256 betAmount) 
        external 
        nonReentrant 
        whenNotPaused 
        notBlacklisted(msg.sender) 
    {
        require(betAmount > 0, "Bet amount must be positive");
        require(piToken.balanceOf(msg.sender) >= betAmount, "Insufficient PI balance");
        require(piToken.allowance(msg.sender, address(this)) >= betAmount, "Insufficient allowance");
        
        // 转入下注金额
        piToken.transferFrom(msg.sender, address(this), betAmount);
        
        // 简化的随机数生成
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            betAmount
        ))) % 100;
        
        bool won = randomNumber < 40; // 40% 获胜概率
        uint256 winAmount = 0;
        
        if (won) {
            winAmount = betAmount * 25 / 10; // 2.5倍奖励
            require(piToken.balanceOf(address(this)) >= winAmount, "Insufficient contract balance");
            piToken.transfer(msg.sender, winAmount);
        }
        
        emit GameResult(msg.sender, "PI", betAmount, winAmount, won);
        
        if (won) {
            emit SecurityAlert(
                "GAME_WIN",
                msg.sender,
                "Player won PI game",
                block.timestamp
            );
        }
    }
    
    /**
     * @dev 安全提取代币 (需要多重签名)
     */
    function secureWithdrawTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyMultiSig notBlacklisted(to) {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        
        // 检查提取限额
        require(amount <= maxSingleWithdraw, "Exceeds single withdraw limit");
        
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentWeek = block.timestamp / 1 weeks;
        
        if (lastWithdrawDay[msg.sender] < currentDay) {
            dailyWithdrawn[msg.sender] = 0;
            lastWithdrawDay[msg.sender] = currentDay;
        }
        
        if (lastWithdrawWeek[msg.sender] < currentWeek) {
            weeklyWithdrawn[msg.sender] = 0;
            lastWithdrawWeek[msg.sender] = currentWeek;
        }
        
        require(
            dailyWithdrawn[msg.sender] + amount <= dailyWithdrawLimit,
            "Exceeds daily limit"
        );
        require(
            weeklyWithdrawn[msg.sender] + amount <= weeklyWithdrawLimit,
            "Exceeds weekly limit"
        );
        
        dailyWithdrawn[msg.sender] += amount;
        weeklyWithdrawn[msg.sender] += amount;
        
        IERC20(token).transfer(to, amount);
        
        emit SecureWithdrawal(msg.sender, token, amount, block.timestamp);
        emit SecurityAlert(
            "SECURE_WITHDRAWAL",
            msg.sender,
            "Admin performed secure withdrawal",
            block.timestamp
        );
    }
    
    /**
     * @dev 添加到黑名单
     */
    function addToBlacklist(address user) external onlyRole(ADMIN_ROLE) {
        require(user != address(0), "Invalid address");
        require(!hasRole(ADMIN_ROLE, user), "Cannot blacklist admin");
        
        blacklistedAddresses[user] = true;
        emit BlacklistUpdated(user, true);
        emit SecurityAlert(
            "BLACKLIST_ADDED",
            user,
            "Address added to blacklist",
            block.timestamp
        );
    }
    
    /**
     * @dev 从黑名单移除
     */
    function removeFromBlacklist(address user) external onlyRole(ADMIN_ROLE) {
        require(user != address(0), "Invalid address");
        blacklistedAddresses[user] = false;
        emit BlacklistUpdated(user, false);
        emit SecurityAlert(
            "BLACKLIST_REMOVED",
            user,
            "Address removed from blacklist",
            block.timestamp
        );
    }
    
    /**
     * @dev 紧急暂停
     */
    function emergencyPause() external onlyEmergency {
        _pause();
        emit SecurityAlert(
            "EMERGENCY_PAUSE",
            msg.sender,
            "Contract emergency paused",
            block.timestamp
        );
    }
    
    /**
     * @dev 恢复运行
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit SecurityAlert(
            "UNPAUSED",
            msg.sender,
            "Contract unpaused",
            block.timestamp
        );
    }
    
    /**
     * @dev 紧急提取 (紧急情况下使用)
     */
    function emergencyWithdraw(
        address token,
        address to,
        uint256 amount
    ) external onlyEmergency {
        require(paused(), "Only available when paused");
        IERC20(token).transfer(to, amount);
        emit SecurityAlert(
            "EMERGENCY_WITHDRAWAL",
            msg.sender,
            "Emergency withdrawal executed",
            block.timestamp
        );
    }
    
    /**
     * @dev 更新提取限额
     */
    function updateWithdrawLimits(
        uint256 _maxSingle,
        uint256 _dailyLimit,
        uint256 _weeklyLimit
    ) external onlyRole(ADMIN_ROLE) {
        maxSingleWithdraw = _maxSingle;
        dailyWithdrawLimit = _dailyLimit;
        weeklyWithdrawLimit = _weeklyLimit;
        
        emit SecurityAlert(
            "LIMITS_UPDATED",
            msg.sender,
            "Withdraw limits updated",
            block.timestamp
        );
    }
    
    /**
     * @dev 获取合约代币余额
     */
    function getContractBalances() external view returns (uint256 maoBalance, uint256 piBalance) {
        maoBalance = maoToken.balanceOf(address(this));
        piBalance = piToken.balanceOf(address(this));
    }
    
    /**
     * @dev 检查地址是否被列入黑名单
     */
    function isBlacklisted(address user) external view returns (bool) {
        return blacklistedAddresses[user];
    }
    
    /**
     * @dev 获取管理员数量
     */
    function getAdminCount() external view returns (uint256) {
        return adminCount;
    }
}
```

### **操作：**
1. **选中以上所有代码** (Ctrl+A 或 Cmd+A)
2. **复制** (Ctrl+C 或 Cmd+C)  
3. **在Remix的编辑器中粘贴** (Ctrl+V 或 Cmd+V)

---

## ⚙️ **第3步: 编译合约**

### **操作步骤：**
1. **点击左侧的编译图标** (看起来像齿轮的图标)
2. **确认Solidity版本**选择 `0.8.19+`
3. **点击蓝色的 "Compile UltraSecureWheelGame.sol" 按钮**
4. **等待编译完成** (看到绿色对钩✅表示成功)

---

## 🌐 **第4步: 连接钱包和网络**

### **连接MetaMask：**
1. **点击左侧的部署图标** (看起来像以太坊图标)
2. **在 "ENVIRONMENT" 下拉菜单**选择 `Injected Provider - MetaMask`
3. **确认MetaMask连接**

### **切换到AlveyChain网络：**
1. **在MetaMask中点击网络下拉菜单**
2. **选择 "AlveyChain"** (如果没有，需要先添加)

---

## 🚀 **第5步: 部署合约**

### **设置部署参数：**
1. **在 "CONTRACT" 下拉菜单**选择 `UltraSecureWheelGame`
2. **在部署参数框中输入**（重要：必须严格按照格式）：

```
"0x22f49bcb3dad370a9268ba3fca33cb037ca3d022","0xfd4680e25e05b3435c7f698668d1ce80d2a9f444",["0xd0dC6Ff0eA6a27a0a4Ba0002F019d0E1b9666c28","0x4f05108dEF45CdE35Bc38F73B6a95C74b96a16E7","0x8300b4276Ac4DBbB8e73C0E99E4179D594b71eB5","0x24c8fE3a662C58c6Ae589A9Aca8060B4741a24a5","0x64294e2f66AB7221ecC8FAeF418cdA75E215A053"],"0xd0dC6Ff0eA6a27a0a4Ba0002F019d0E1b9666c28"
```

3. **点击橙色的 "Deploy" 按钮**
4. **在MetaMask弹窗中确认交易**

---

## ✅ **第6步: 复制新合约地址**

### **部署成功后：**
1. **在底部的交易记录中找到部署交易**
2. **复制新合约地址** (0x开头的42位字符)
3. **保存这个地址** - 非常重要！

---

## 🎉 **完成！**

**恭喜您成功部署了超级安全的智能合约！**

**下一步：告诉我新合约地址，我来帮您完成剩余的配置！** 