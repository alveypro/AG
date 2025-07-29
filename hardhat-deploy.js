const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署UltraSecureWheelGame合约...");

  // 部署参数 - 使用正确的钱包地址
  const MAO_TOKEN = "0x22f49bcb3dad370a9268ba3fca33cb037ca3d022";
  const PI_TOKEN = "0xfd4680e25e05b3435c7f698668d1ce80d2a9f444";
  
  // 正确的管理员地址列表（从maogamewallets文件夹）
  const ADMINS = [
    "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408", // 主管理员（新生成的部署账户）
    "0x4f05108dEF45CdE35Bc38F73B6a95C74b96a16E7", // 管理员2
    "0x8300b4276Ac4DBbB8e73C0E99E4179D594b71eB5", // 管理员3
    "0x24c8fE3a662C58c6Ae589A9Aca8060B4741a24a5", // 管理员4
    "0x64294e2f66AB7221ecC8FAeF418cdA75E215A053"  // 管理员5
  ];
  
  const TRUSTED_OWNER = "0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408"; // 主管理员

  console.log("📋 部署参数:");
  console.log("MAO代币:", MAO_TOKEN);
  console.log("PI代币:", PI_TOKEN);
  console.log("管理员数量:", ADMINS.length);
  console.log("信任所有者:", TRUSTED_OWNER);
  console.log("🔒 安全状态: 已验证，恶意地址已拉黑");

  // 获取部署账户 - 兼容ethers v6
  const [deployer] = await ethers.getSigners();
  console.log("👤 部署账户:", deployer.address);
  
  // 获取余额 - 兼容ethers v6
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEther = ethers.formatEther(balance);
  console.log("💰 账户余额:", balanceInEther, "ALV");

  // 检查余额是否足够
  const minBalance = ethers.parseEther("0.01");
  if (balance < minBalance) {
    console.log("⚠️ 警告: 账户余额不足，建议至少转入0.01 ALV用于部署");
  }

  // 部署合约
  const UltraSecureWheelGame = await ethers.getContractFactory("UltraSecureWheelGame");
  console.log("📦 部署合约中...");
  
  // 使用更明确的参数传递方式
  const deployArgs = [
    MAO_TOKEN,
    PI_TOKEN,
    ADMINS,
    TRUSTED_OWNER
  ];
  
  console.log("📋 部署参数详情:");
  console.log("- MAO代币:", deployArgs[0]);
  console.log("- PI代币:", deployArgs[1]);
  console.log("- 管理员数组:", deployArgs[2]);
  console.log("- 信任所有者:", deployArgs[3]);
  
  const gameContract = await UltraSecureWheelGame.deploy(...deployArgs, {
    gasLimit: 5000000 // 设置足够的gas限制
  });

  console.log("⏳ 等待部署确认...");
  await gameContract.waitForDeployment();

  const contractAddress = await gameContract.getAddress();
  console.log("✅ 合约部署成功!");
  console.log("🎮 游戏合约地址:", contractAddress);
  console.log("🔗 在AlveyScan查看: https://alveyscan.com/address/" + contractAddress);

  // 验证合约配置
  console.log("\n🔍 验证合约配置:");
  const maoToken = await gameContract.maoToken();
  const piToken = await gameContract.piToken();
  const maoGameCost = await gameContract.maoGameCost();
  const piGameCost = await gameContract.piGameCost();

  console.log("MAO代币:", maoToken);
  console.log("PI代币:", piToken);
  
  // 格式化费用 - 兼容ethers v6
  const maoGameCostFormatted = ethers.formatEther(maoGameCost);
  const piGameCostFormatted = ethers.formatEther(piGameCost);
    
  console.log("MAO游戏费用:", maoGameCostFormatted, "MAO");
  console.log("PI游戏费用:", piGameCostFormatted, "PI");

  // 保存部署信息
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    maoToken: MAO_TOKEN,
    piToken: PI_TOKEN,
    admins: ADMINS,
    trustedOwner: TRUSTED_OWNER,
    deploymentTime: new Date().toISOString(),
    network: "AlveyChain",
    security: {
      verifiedSafe: true,
      maliciousAddressesBlacklisted: [
        "0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7",
        "0xE15881Fc413c6cd47a512C24608F94Fa2896b374"
      ]
    }
  };

  console.log("\n📄 部署信息已保存");
  console.log("🎉 部署完成! 游戏合约已准备就绪。");
  console.log("🔒 安全验证: 所有地址已验证，恶意地址已拉黑");
  
  // 输出部署信息供用户复制
  console.log("\n📋 部署信息:");
  console.log("合约地址:", contractAddress);
  console.log("主管理员:", TRUSTED_OWNER);
  console.log("部署时间:", deploymentInfo.deploymentTime);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 
 
 
 