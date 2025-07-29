const { ethers } = require('ethers');

// 合约配置
const CONFIG = {
    trustedOwner: "0xd0dC6Ff0eA6a27a0a4Ba0002F019d0E1b9666c28",
    admins: [
        "0xd0dC6Ff0eA6a27a0a4Ba0002F019d0E1b9666c28",
        "0x4f05108dEF45CdE35Bc38F73B6a95C74b96a16E7",
        "0x8300b4276Ac4DBbB8e73C0E99E4179D594b71eB5",
        "0x24c8fE3a662C58c6Ae589A9Aca8060B4741a24a5",
        "0x64294e2f66AB7221ecC8FAeF418cdA75E215A053"
    ],
    maoToken: "0x22f49bcb3dad370a9268ba3fca33cb037ca3d022",
    piToken: "0xfd4680e25e05b3435c7f698668d1ce80d2a9f444"
};

// 网络配置
const NETWORK = {
    name: "AlveyChain",
    rpcUrl: "https://elves-core2.alvey.io",
    chainId: 3797
};

async function deployContract() {
    try {
        console.log('🚀 开始真实部署MAO游戏合约...');
        
        // 连接到网络
        const provider = new ethers.providers.JsonRpcProvider(NETWORK.rpcUrl);
        
        // 这里需要你的私钥（请替换为你的真实私钥）
        const privateKey = 'YOUR_PRIVATE_KEY_HERE'; // 请替换为你的私钥
        const wallet = new ethers.Wallet(privateKey, provider);
        
        console.log('📋 部署者地址:', wallet.address);
        
        // 合约代码（简化版本，便于部署）
        const contractCode = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UltraSecureWheelGame is ReentrancyGuard, AccessControl, Pausable {
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
}`;

        // 创建合约工厂
        const contractFactory = new ethers.ContractFactory(
            ['constructor(address,address,address[],address)'],
            contractCode,
            wallet
        );
        
        console.log('📝 准备部署参数...');
        
        // 部署参数
        const deployParams = [
            CONFIG.maoToken,
            CONFIG.piToken,
            CONFIG.admins,
            CONFIG.trustedOwner
        ];
        
        console.log('🚀 开始部署合约...');
        
        // 部署合约
        const contract = await contractFactory.deploy(...deployParams);
        await contract.deployed();
        
        console.log('✅ 合约部署成功！');
        console.log('📋 合约地址:', contract.address);
        console.log('🔗 区块浏览器:', `https://alveyscan.com/address/${contract.address}`);
        
        // 验证部署
        const owner = await contract.owner();
        console.log('👑 主管理员:', owner);
        
        return {
            success: true,
            contractAddress: contract.address,
            deployer: wallet.address,
            owner: owner,
            network: NETWORK.name,
            chainId: NETWORK.chainId
        };
        
    } catch (error) {
        console.error('❌ 部署失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 运行部署
if (require.main === module) {
    deployContract()
        .then(result => {
            if (result.success) {
                console.log('\n🎉 部署完成！');
                console.log('📋 合约信息:');
                console.log('  地址:', result.contractAddress);
                console.log('  网络:', result.network);
                console.log('  链ID:', result.chainId);
                console.log('  部署者:', result.deployer);
                console.log('  主管理员:', result.owner);
            } else {
                console.log('\n❌ 部署失败:', result.error);
            }
        })
        .catch(error => {
            console.error('❌ 脚本执行失败:', error);
        });
}

module.exports = { deployContract, CONFIG, NETWORK }; 
 
 
 
 
 
 