const hre = require("hardhat");
const ethers = hre.ethers;

async function deployLibraryContract() {
  await hre.run("compile");
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Library = await hre.ethers.getContractFactory("Library");
  const library = await Library.deploy();

  await library.deployed();

  console.log(`Library deployed to ${library.address}`);
}

deployLibraryContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports = deployLibraryContract;