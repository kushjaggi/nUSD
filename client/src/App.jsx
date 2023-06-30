import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import contractAbi from './contractAbi.json';

const providerUrl = 'https://goerli.infura.io/v3/6a6cf3381fef4a289119b73ae5c472f6'; // Replace with your Ethereum provider URL
const contractAddress = '0x326C977E6efc84E512bB9C30f76E30c160eD06FB'; // Replace with the deployed contract address

const web3 = new Web3(providerUrl);
const contract = new web3.eth.Contract(contractAbi, contractAddress);

function App() {
  const [ethAmount, setEthAmount] = useState('');
  const [nUSDAmount, setNUSDAmount] = useState('');

  useEffect(() => {
    initWeb3();
  }, []);

  const initWeb3 = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.enable();
        console.log('Connected to MetaMask');
      } catch (error) {
        console.error('User denied MetaMask access');
      }
    } else if (window.web3) {
      console.log('Connected to web3 provider');
    } else {
      console.error('No web3 provider detected. Please install MetaMask.');
    }
  };

  const depositETH = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const ethPriceInnUSD = await contract.methods.getETHPriceInnUSD().call();

      const nUSDAmount = web3.utils.toBN(ethAmount)
        .mul(web3.utils.toBN(ethPriceInnUSD))
        .div(web3.utils.toBN(2));

      await contract.methods.depositETH().send({
        from: accounts[0],
        value: web3.utils.toWei(ethAmount, 'ether'),
      });

      console.log(`Deposited ${ethAmount} ETH and received ${nUSDAmount} nUSD tokens.`);
    } catch (error) {
      console.error('Failed to deposit ETH:', error);
    }
  };

  const redeemETH = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const ethPriceInnUSD = await contract.methods.getETHPriceInnUSD().call();

      const ethAmount = web3.utils.toBN(nUSDAmount)
        .mul(web3.utils.toBN(2))
        .div(web3.utils.toBN(ethPriceInnUSD));

      await contract.methods.redeemETH(nUSDAmount).send({
        from: accounts[0],
      });

      console.log(`Redeemed ${nUSDAmount} nUSD tokens and received ${ethAmount} ETH.`);
    } catch (error) {
      console.error('Failed to redeem nUSD:', error);
    }
  };

  const getTotalSupply = async () => {
    try {
      const totalSupply = await contract.methods.getTotalSupply().call();
      console.log(`Total supply of nUSD tokens: ${totalSupply}`);
    } catch (error) {
      console.error('Failed to get total supply:', error);
    }
  };

  return (
    <div>
      <h1>nUSDStableCoin App</h1>

      <h2>Deposit ETH and Receive nUSD Tokens</h2>
      <input
        type="text"
        value={ethAmount}
        placeholder="Enter ETH amount"
        onChange={(e) => setEthAmount(e.target.value)}
      />
      <button onClick={depositETH}>Deposit</button>

      <h2>Redeem nUSD Tokens and Receive ETH</h2>
      <input
        type="text"
        value={nUSDAmount}
        placeholder="Enter nUSD amount"
        onChange={(e) => setNUSDAmount(e.target.value)}
      />
      <button onClick={redeemETH}>Redeem</button>

      <h2>Get Total Supply of nUSD Tokens</h2>
      <button onClick={getTotalSupply}>Get Total Supply</button>
    </div>
  );
}

export default App;

