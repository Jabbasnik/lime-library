require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.0",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};

task("deploy-testnets", "Deploys contract on a provided network")
    .setAction(async () => {
        const deployLibraryContract = require("./scripts/deploy-testnet.js");
        await deployLibraryContract();
    });
