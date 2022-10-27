require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

const ALCHEMY_API_KEY = "KEY";
const GOERLI_PRIVATE_KEY = "YOUR GOERLI PRIVATE KEY";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.0",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  // networks: {
  //   goerli: {
  //     url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  //     accounts: [GOERLI_PRIVATE_KEY],
  //   },
  // },
  etherscan: {
    apiKey: "CHIRAADNUI814XIT9ST36R63UFNBNDKBDY",
  },
};

task("deploy-testnet", "Deploys contract on a provided network").setAction(
  async () => {
    const deployLibraryContract = require("./scripts/deploy-testnet");
    await deployLibraryContract();
  }
);

task("deploy-goerli", "Deploys contract on a provided network")
  .addParam("privateKey", "Please provide the private key")
  .setAction(async ({ privateKey }) => {
    const deployLibraryContract = require("./scripts/deploy-goerli");
    await deployLibraryContract(privateKey);
  });

subtask("print", "Prints a message")
  .addParam("message", "The message to print")
  .setAction(async (taskArgs) => {
    console.log(taskArgs.message);
  });
