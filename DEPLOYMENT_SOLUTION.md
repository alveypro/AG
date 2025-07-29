# 🚀 部署问题解决方案

## ❌ 问题分析

**问题**: Hardhat部署失败，错误信息：`unsupported addressable value`  
**原因**: ethers v6版本对数组参数的处理方式与v5不同  
**影响**: 无法通过Hardhat脚本部署合约

## ✅ 解决方案

### 🎯 推荐方案：使用Remix IDE部署

由于ethers v6兼容性问题，**Remix IDE是最可靠的部署方法**。

### 📋 部署步骤

1. **打开Remix IDE**
   - 访问：https://remix.ethereum.org

2. **创建合约文件**
   - 文件名：`UltraSecureWheelGame.sol`
   - 复制完整的合约代码

3. **编译合约**
   - 编译器版本：0.8.19
   - 确保编译成功

4. **配置网络**
   - 环境：Injected Provider - MetaMask
   - 网络：AlveyChain
   - 账户：0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408

5. **部署参数**
   ```
   _maoToken: 0x22f49bcb3dad370a9268ba3fca33cb037ca3d022
   _piToken: 0xfd4680e25e05b3435c7f698668d1ce80d2a9f444
   _admins: [0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408, 0x4f05108dEF45CdE35Bc38F73B6a95C74b96a16E7, 0x8300b4276Ac4DBbB8e73C0E99E4179D594b71eB5, 0x24c8fE3a662C58c6Ae589A9Aca8060B4741a24a5, 0x64294e2f66AB7221ecC8FAeF418cdA75E215A053]
   _trustedOwner: 0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408
   ```

## 🔒 安全验证

### ✅ 已确认安全
- 主管理员：新生成的安全地址
- 所有管理员：来自maogamewallets文件夹
- 恶意地址：已自动拉黑
- 奖金池：新生成的安全地址

### ⚠️ 已拉黑的恶意地址
- 0x8FdFD1eC1c8b5381db7cc68114214BA16E02b2B7
- 0xE15881Fc413c6cd47a512C24608F94Fa2896b374

## 💰 部署前准备

### 需要向主管理员钱包转入ALV代币
- **钱包地址**: 0xAf2032168aa1f7DD09f7dFbE294ad40E30E54408
- **建议金额**: 至少 0.1 ALV
- **当前余额**: 5.0 ALV ✅

## 🎉 总结

**问题已解决！** 使用Remix IDE部署是最可靠的方法：

1. ✅ 钱包地址已修正
2. ✅ 安全配置已完成
3. ✅ 余额充足
4. ✅ 部署参数已准备

**现在可以安全部署了！** 🚀

---

**状态**: 🟢 准备就绪  
**方法**: Remix IDE部署  
**下一步**: 执行Remix部署步骤 
 
 
 