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

  await hre.run("verify:verify", {
    address: library.address,
    constructorArguments: [],
  });
}

deployLibraryContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports = deployLibraryContract;
