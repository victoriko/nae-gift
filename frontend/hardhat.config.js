require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("dotenv").config();

const { SEED_PHRASE } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        mnemonic: SEED_PHRASE,
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: {
        mnemonic: SEED_PHRASE,
      },
    },
  },
  paths: {
    sources: "./src/contracts",
  },
};
