const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('UltimateWheelGame', function () {
  let contract, maoToken, piToken, owner, player;

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory('ERC20Mock');
    maoToken = await MockERC20.deploy('MAO', 'MAO', ethers.utils.parseEther('1000000'));
    piToken = await MockERC20.deploy('PI', 'PI', ethers.utils.parseEther('1000000'));

    const UltimateWheelGame = await ethers.getContractFactory('UltimateWheelGame');
    contract = await UltimateWheelGame.deploy(
      maoToken.address,
      piToken.address,
      owner.address,
      owner.address,
      '0xkeyhash', // mock
      0, // mock fee
      '0xvrfcoord', // mock
      '0xlink' // mock
    );

    await maoToken.transfer(player.address, ethers.utils.parseEther('1000'));
    await piToken.transfer(player.address, ethers.utils.parseEther('10000'));
    await maoToken.connect(player).approve(contract.address, ethers.utils.parseEther('1000'));
    await piToken.connect(player).approve(contract.address, ethers.utils.parseEther('10000'));
  });

  it('should allow playing MAO game', async function () {
    await expect(contract.connect(player).playMAOGame())
      .to.emit(contract, 'GamePlayed');
  });

  it('should enforce transfer limits', async function () {
    await expect(contract.connect(player).playMAOGame())
      .to.not.be.reverted;
    // Add more tests for limits
  });

  // Add more tests for randomness, rewards, pauses, etc.
});