// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import the ERC20 contract from OpenZeppelin library
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Import the interface of the oracle contract
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract nUSDStableCoin is ERC20 {
    AggregatorV3Interface private oracle;

    constructor() ERC20("nUSD StableCoin", "nUSD") {
        oracle = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }

    // Function to get the current ETH price in nUSD
      function getETHPriceInnUSD() public view returns (uint256) {
        (, int256 ethPrice, , , ) = oracle.latestRoundData();
        return uint256(ethPrice);
    }

    // Function for users to deposit ETH and receive nUSD in return
    function depositETH() external payable {
        uint256 ethAmount = msg.value;
        uint256 ethPriceInnUSD = getETHPriceInnUSD();

        // Calculate the nUSD amount to be received (50% of the ETH value)
       uint256 nUSDAmount = (ethAmount * ethPriceInnUSD) / 2;

        // Mint new nUSD tokens and transfer them to the user
        _mint(msg.sender, nUSDAmount);
    }

    // Function for users to redeem nUSD and convert it back into ETH
    function redeemETH(uint256 nUSDAmount) external {
        uint256 ethPriceInnUSD = getETHPriceInnUSD();

        // Calculate the required ETH amount based on the nUSDAmount
        uint256 ethAmount = (nUSDAmount * 2) / ethPriceInnUSD;

        // Verify that the user has sufficient nUSD balance
        require(balanceOf(msg.sender) >= nUSDAmount, "Insufficient nUSD balance");

        // Burn the redeemed nUSD tokens from the user's balance
        _burn(msg.sender, nUSDAmount);

        // Transfer the corresponding ETH amount back to the user
        payable(msg.sender).transfer(ethAmount);
    }

    // Function to check the total supply of nUSD
    function getTotalSupply() external view returns (uint256) {
        return totalSupply();
    }
}
