import { ethers } from "hardhat";
import { expect } from "chai";

describe("nUSDStablecoin", function () {
  let nUSDStablecoin;
  let oracle;
  let owner;
  let user1;
  let user2;

  const ethPrice = 2000; // Assuming ETH price is 2000 USD

  beforeEach(async () => {
    // Deploy the nUSDStablecoin contract
    const nUSDStablecoinFactory = await ethers.getContractFactory("nUSDStablecoin");
    nUSDStablecoin = await nUSDStablecoinFactory.deploy();

    // Deploy the Chainlink oracle mock
    const OracleMock = await ethers.getContractFactory("OracleMock");
    oracle = await OracleMock.deploy(ethPrice);

    // Set the oracle address in the nUSDStablecoin contract
    await nUSDStablecoin.setOracleAddress(oracle.address);

    // Get the accounts from the Hardhat network
    [owner, user1, user2] = await ethers.getSigners();
  });

  it("should deposit ETH and receive nUSD in return", async function () {
    const ethAmount = ethers.utils.parseEther("1");
    const expectednUSDAmount = ethAmount.mul(ethPrice).div(2);

    // Deposit ETH
    await nUSDStablecoin.connect(user1).depositETH({ value: ethAmount });

    // Check the nUSD balance of the user1
    const nUSDBalance = await nUSDStablecoin.balanceOf(user1.address);
    expect(nUSDBalance).to.equal(expectednUSDAmount);
  });

  it("should redeem nUSD and convert it back into ETH", async function () {
    const ethAmount = ethers.utils.parseEther("1");
    const nUSDAmount = ethAmount.mul(ethPrice).div(2);

    // Deposit ETH for user1
    await nUSDStablecoin.connect(user1).depositETH({ value: ethAmount });

    // Redeem nUSD for ETH
    await nUSDStablecoin.connect(user1).redeemETH(nUSDAmount);

    // Check the ETH balance of user1
    const ethBalance = await ethers.provider.getBalance(user1.address);
    expect(ethBalance).to.be.above(ethAmount);
  });

  it("should return the total supply of nUSD", async function () {
    const ethAmount = ethers.utils.parseEther("1");

    // Deposit ETH for user1
    await nUSDStablecoin.connect(user1).depositETH({ value: ethAmount });

    // Check the total supply of nUSD
    const totalSupply = await nUSDStablecoin.getTotalSupply();
    expect(totalSupply).to.equal(ethAmount.mul(ethPrice).div(2));
  });
});
