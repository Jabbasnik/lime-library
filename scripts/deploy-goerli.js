const hre = require("hardhat");
const ethers = hre.ethers;

async function deployLibraryContract(_privateKey) {
  await hre.run("print", { message: "compile" });
  const wallet = new ethers.Wallet(_privateKey, hre.ethers.provider);

  await hre.run("print", {
    message: "Deploying contracts with the account:" + wallet.address,
  });
  await hre.run("print", {
    message: "Account balance:" + (await wallet.getBalance()).toString(),
  });

  const Library = await hre.ethers.getContractFactory("Library", wallet);
  const library = await Library.deploy();

  await library.deployed();

  await hre.run("print", { message: `Library deployed to ${library.address}` });
  await library.deployTransaction.wait(1);

  await hre.run("print", {
    message: `Veryfying library contract with address: ${library.address}`,
  });

  await hre.run("verify:verify", {
    address: librexitary.address,
    constructorArguments: [],
  });
}


module.exports = deployLibraryContract;
