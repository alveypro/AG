// 🔐 MAO游戏合约权限检查工具
// 用途: 检查您是否有权限提取合约中的代币

const { ethers } = require('ethers');

class ContractPermissionChecker {
    constructor(contractAddress, userAddress) {
        this.contractAddress = contractAddress;
        this.userAddress = userAddress;
        
        // 支持ethers v5和v6
        if (ethers.providers) {
            // ethers v5
            this.provider = new ethers.providers.JsonRpcProvider('https://elves-core2.alvey.io');
        } else {
            // ethers v6
            this.provider = new ethers.JsonRpcProvider('https://elves-core2.alvey.io');
        }
        
        console.log('🛡️ MAO合约权限检查工具启动');
        console.log('='.repeat(60));
    }
    
    async checkAllPermissions() {
        console.log('🔍 开始检查合约权限...');
        console.log('📍 合约地址:', this.contractAddress);
        console.log('👤 用户地址:', this.userAddress);
        console.log('-'.repeat(60));
        
        const results = {
            isOwner: false,
            isAdmin: false,
            hasWithdrawFunction: false,
            canWithdraw: false,
            ownerAddress: null,
            availableFunctions: []
        };
        
        try {
            // 检查Owner权限
            results.isOwner = await this.checkOwner(results);
            
            // 检查Admin权限
            results.isAdmin = await this.checkAdmin();
            
            // 检查提取函数
            results.hasWithdrawFunction = await this.checkWithdrawFunctions(results);
            
            // 检查其他常见管理函数
            await this.checkOtherAdminFunctions(results);
            
            // 综合判断
            results.canWithdraw = (results.isOwner || results.isAdmin) && results.hasWithdrawFunction;
            
            this.displayResults(results);
            this.provideActionPlan(results);
            
        } catch (error) {
            console.error('❌ 权限检查失败:', error.message);
        }
        
        return results;
    }
    
    async checkOwner(results) {
        console.log('\n👑 检查Owner权限...');
        
        try {
            const contract = new ethers.Contract(this.contractAddress, [
                'function owner() view returns (address)'
            ], this.provider);
            
            const owner = await contract.owner();
            const isOwner = owner.toLowerCase() === this.userAddress.toLowerCase();
            
            results.ownerAddress = owner;
            
            console.log('  📋 合约Owner:', owner);
            console.log('  🎯 您是Owner:', isOwner ? '✅ 是' : '❌ 否');
            
            if (isOwner) {
                console.log('  🎉 恭喜！您拥有最高管理权限');
            }
            
            return isOwner;
        } catch (error) {
            console.log('  ❓ 合约可能没有owner函数或使用其他权限模式');
            console.log('  🔍 详细错误:', error.message);
            return false;
        }
    }
    
    async checkAdmin() {
        console.log('\n🔐 检查Admin权限...');
        
        const adminFunctions = [
            'function admins(address) view returns (bool)',
            'function isAdmin(address) view returns (bool)',
            'function administrators(address) view returns (bool)'
        ];
        
        for (const func of adminFunctions) {
            try {
                const contract = new ethers.Contract(this.contractAddress, [func], this.provider);
                const funcName = func.split('(')[0].split(' ')[1];
                const isAdmin = await contract[funcName](this.userAddress);
                
                console.log(`  📋 ${funcName}函数检查:`, isAdmin ? '✅ 是管理员' : '❌ 非管理员');
                
                if (isAdmin) {
                    console.log('  🎉 您拥有管理员权限！');
                    return true;
                }
            } catch (error) {
                console.log(`  ❓ ${func.split('(')[0].split(' ')[1]}函数不存在`);
            }
        }
        
        console.log('  📝 结论: 未找到您的管理员权限');
        return false;
    }
    
    async checkWithdrawFunctions(results) {
        console.log('\n💰 检查代币提取函数...');
        
        const withdrawFunctions = [
            { 
                sig: 'function withdraw()', 
                desc: '基础提取函数',
                risk: '🔴 高风险 - 可提取所有ALV'
            },
            { 
                sig: 'function withdrawTokens(address,uint256)', 
                desc: '指定代币提取',
                risk: '🟡 中风险 - 可提取指定代币'
            },
            { 
                sig: 'function emergencyWithdraw()', 
                desc: '紧急提取函数',
                risk: '🔴 高风险 - 紧急情况使用'
            },
            { 
                sig: 'function rescue(address,uint256)', 
                desc: '救援资金函数',
                risk: '🟡 中风险 - 救援意外发送的资金'
            },
            { 
                sig: 'function withdrawERC20(address,uint256)', 
                desc: 'ERC20代币提取',
                risk: '🟡 中风险 - 提取ERC20代币'
            },
            { 
                sig: 'function drainTo(address)', 
                desc: '转移所有资金',
                risk: '🔴 高风险 - 转移全部资金'
            },
            { 
                sig: 'function claimTokens(address)', 
                desc: '声明代币提取',
                risk: '🟡 中风险 - 声明并提取代币'
            }
        ];
        
        let foundFunctions = 0;
        
        for (const func of withdrawFunctions) {
            try {
                const contract = new ethers.Contract(this.contractAddress, [func.sig], this.provider);
                const funcName = func.sig.split('(')[0].split(' ')[1];
                
                // 使用getFunction检查函数是否存在
                const funcFragment = contract.interface.getFunction(funcName);
                if (funcFragment) {
                    console.log(`  ✅ 找到: ${func.desc}`);
                    console.log(`    🔧 函数: ${func.sig}`);
                    console.log(`    ⚠️  风险: ${func.risk}`);
                    
                    results.availableFunctions.push({
                        name: funcName,
                        signature: func.sig,
                        description: func.desc,
                        risk: func.risk
                    });
                    
                    foundFunctions++;
                }
            } catch (error) {
                // 静默失败 - 函数不存在
            }
        }
        
        if (foundFunctions === 0) {
            console.log('  ❌ 未找到常见的代币提取函数');
            console.log('  💡 这可能意味着:');
            console.log('    - 合约采用锁定设计，无法提取代币');
            console.log('    - 使用了自定义的提取函数名称');
            console.log('    - 提取功能集成在其他函数中');
        } else {
            console.log(`  📊 总计找到 ${foundFunctions} 个提取相关函数`);
        }
        
        return foundFunctions > 0;
    }
    
    async checkOtherAdminFunctions(results) {
        console.log('\n🔧 检查其他管理功能...');
        
        const adminFunctions = [
            { sig: 'function pause()', desc: '暂停合约' },
            { sig: 'function unpause()', desc: '恢复合约' },
            { sig: 'function setAdmin(address)', desc: '设置管理员' },
            { sig: 'function transferOwnership(address)', desc: '转移所有权' },
            { sig: 'function updateFees(uint256)', desc: '更新费用' },
            { sig: 'function setRewardRate(uint256)', desc: '设置奖励率' }
        ];
        
        let adminFuncCount = 0;
        
        for (const func of adminFunctions) {
            try {
                const contract = new ethers.Contract(this.contractAddress, [func.sig], this.provider);
                const funcName = func.sig.split('(')[0].split(' ')[1];
                const funcFragment = contract.interface.getFunction(funcName);
                if (funcFragment) {
                    console.log(`  ✅ 找到管理功能: ${func.desc}`);
                    adminFuncCount++;
                }
            } catch (error) {
                // 静默失败
            }
        }
        
        if (adminFuncCount > 0) {
            console.log(`  📊 找到 ${adminFuncCount} 个管理功能`);
        } else {
            console.log('  ❓ 未找到常见的管理功能');
        }
    }
    
    displayResults(results) {
        console.log('\n📊 权限检查结果总结');
        console.log('='.repeat(60));
        
        // 权限状态
        console.log('🔑 权限状态:');
        console.log('  👑 Owner权限:', results.isOwner ? '✅ 有' : '❌ 无');
        console.log('  🔐 Admin权限:', results.isAdmin ? '✅ 有' : '❌ 无');
        console.log('  💰 提取函数:', results.hasWithdrawFunction ? '✅ 存在' : '❌ 不存在');
        console.log('  🎯 可以提取:', results.canWithdraw ? '✅ 可以' : '❌ 不可以');
        
        // 风险评估
        console.log('\n⚠️  风险评估:');
        if (results.canWithdraw) {
            console.log('  🔴 高风险: 您有权限操作合约资金');
            console.log('  📋 可用函数数量:', results.availableFunctions.length);
            
            if (results.availableFunctions.length > 0) {
                console.log('  🔧 可用提取函数:');
                results.availableFunctions.forEach(func => {
                    console.log(`    - ${func.name}: ${func.description}`);
                });
            }
        } else {
            console.log('  🟢 低风险: 您无法直接操作合约资金');
            console.log('  💡 这通常是好的安全设计');
        }
        
        // 合约信息
        console.log('\n📋 合约信息:');
        console.log('  📍 合约地址:', this.contractAddress);
        if (results.ownerAddress) {
            console.log('  👑 合约Owner:', results.ownerAddress);
        }
        console.log('  🌐 区块链: AlveyChain (3797)');
    }
    
    provideActionPlan(results) {
        console.log('\n🎯 建议行动计划');
        console.log('='.repeat(60));
        
        if (results.canWithdraw) {
            console.log('✅ 您有提取权限 - 请按以下步骤谨慎操作:');
            console.log('');
            console.log('🔴 立即行动 (0-24小时):');
            console.log('  1. 检查当前资金池余额 (目前为0，需要立即补充！)');
            console.log('  2. 确认游戏运营所需的最小资金量');
            console.log('  3. 计算可安全提取的数量');
            console.log('  4. 准备提取操作（但先要补充资金池）');
            console.log('');
            console.log('🟡 短期行动 (1-7天):');
            console.log('  1. 立即向合约充值至少 50,000 MAO + 500,000 PI');
            console.log('  2. 实施资金池监控系统');
            console.log('  3. 设置自动补充机制');
            console.log('  4. 建立提取操作记录');
            console.log('');
            console.log('🟢 长期改进 (1-4周):');
            console.log('  1. 部署多重签名钱包');
            console.log('  2. 实施时间锁机制');
            console.log('  3. 建立DAO治理');
            console.log('  4. 完善资金管理流程');
            console.log('');
            console.log('⚠️  重要提醒:');
            console.log('  - 🚨 当前资金池为空，游戏无法发放奖励！');
            console.log('  - 建议立即充值至少 100,000 MAO + 1,000,000 PI');
            console.log('  - 提取前请充分测试，确保不影响游戏运行');
            console.log('  - 考虑分批管理而非一次性操作所有资金');
            console.log('  - 保持操作透明度，记录所有重要操作');
            
        } else {
            console.log('❌ 您没有提取权限 - 建议行动:');
            console.log('');
            console.log('🔍 确认阶段:');
            console.log('  1. 确认这是否符合您的预期');
            console.log('  2. 检查您是否应该拥有这些权限');
            console.log('  3. 确认是否有其他管理员账户');
            console.log('');
            console.log('📞 联系阶段:');
            console.log('  1. 联系合约部署者或开发团队');
            console.log('  2. 索要合约的完整文档和权限说明');
            console.log('  3. 了解现有的资金管理机制');
            console.log('');
            console.log('🔧 解决方案:');
            console.log('  1. 如果需要权限，请要求添加为管理员');
            console.log('  2. 如果无法获得权限，考虑部署新合约');
            console.log('  3. 建立替代的资金管理方案');
            console.log('  4. 实施外部监控和预警系统');
            console.log('');
            console.log('🚨 紧急状况:');
            console.log('  - 当前资金池为空，无论谁有权限都需要立即补充');
            console.log('  - 联系有权限的人员立即处理资金池问题');
            console.log('  - 考虑临时暂停游戏直到资金池恢复');
            
            if (results.ownerAddress) {
                console.log('');
                console.log('👑 合约Owner信息:');
                console.log(`  地址: ${results.ownerAddress}`);
                console.log('  🚨 请立即联系Owner解决资金池问题！');
            }
        }
        
        console.log('\n💡 下一步:');
        console.log('  1. 如有权限，立即补充资金池');
        console.log('  2. 查看紧急状态报告: cat URGENT_POOL_STATUS_REPORT.md');
        console.log('  3. 实施安全改进: cat CONTRACT_PERMISSION_ANALYSIS.md');
        console.log('');
        console.log('🆘 紧急支持文档已准备就绪！');
    }
}

// 主执行函数
async function main() {
    // 配置参数
    const GAME_CONTRACT = '0x621DF9e0DE6b4e7EDC5Dc22Cd7c0F883c3F56966';
    const USER_ADDRESS = '0xd0dC6Ff0eA6a27a0a4Ba0002F019d0E1b9666c28'; // 您在配置中设置的地址
    
    console.log('🚀 启动MAO游戏合约权限检查...');
    console.log('📅 检查时间:', new Date().toLocaleString());
    console.log('');
    
    // 创建检查器
    const checker = new ContractPermissionChecker(GAME_CONTRACT, USER_ADDRESS);
    
    // 执行检查
    const results = await checker.checkAllPermissions();
    
    console.log('\n🏁 检查完成！');
    console.log('⏰ 完成时间:', new Date().toLocaleString());
    console.log('');
    
    return results;
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 脚本执行失败:', error);
        console.error('📍 错误位置:', error.stack);
        process.exit(1);
    });
}

module.exports = { ContractPermissionChecker, main }; 