const hre = require("hardhat");

async function main() {
  const Library = await hre.ethers.getContractFactory("Library");
  const library = await Library.deploy();

  await library.deployed();

  console.log(
    `Library deployed to ${library.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
