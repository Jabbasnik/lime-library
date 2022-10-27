const hre = require("hardhat");
const ethers = hre.ethers;

async function deployLibraryContract() {
  await hre.run("print", { message: "compile" });
  const [deployer] = await ethers.getSigners();

  await hre.run("print", {
    message: "Deploying contracts with the account:" + deployer.address,
  });
  await hre.run("print", {
    message: "Account balance:" + (await deployer.getBalance()).toString(),
  });

  const Library = await hre.ethers.getContractFactory("Library");
  const library = await Library.deploy();

  await library.deployed();

  await hre.run("print", { message: `Library deployed to ${library.address}`});
}

module.exports = deployLibraryContract;
