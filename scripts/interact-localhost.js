const hre = require("hardhat");
const Library = require("../artifacts/contracts/Library.sol/Library.json");

const run = async function () {
  const provider = new hre.ethers.providers.JsonRpcProvider(
    "http://localhost:8545"
  );

  const wallet = new hre.ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );
  const balance = await wallet.getBalance();
  console.log(hre.ethers.utils.formatEther(balance, 18));

  const contractAddress = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";
  const libraryContract = new hre.ethers.Contract(
    contractAddress,
    Library.abi,
    wallet
  );

  const newBook = await libraryContract.addBook("Awesome Book 2", "By Me", 10);
  const transactionReceipt = await newBook.wait();
  if (transactionReceipt.status != 1) {
    console.log("Transaction was not successful");
    return;
  }
  console.log("Book added successfully");

    const allBooks = await libraryContract.allBooks();
    console.log("All books: " + allBooks)

  const borrowedBook = await libraryContract.borrowBook(0);
  const borrowedBookReceipt = await borrowedBook.wait();
  if (borrowedBookReceipt.status != 1) {
    console.log("Transaction was not successful");
    return;
  }
  console.log("Book borrowed successfully");

  const borrowedBookHistory = await libraryContract.bookHistory(0);
  console.log("Addresses that borrowed book: " + borrowedBookHistory);

  const returnedBook = await libraryContract.returnBook(0);
  const returnedBookReceipt = await returnedBook.wait();
  if (returnedBookReceipt.status != 1) {
    console.log("Transaction was not successful");
    return;
  }
  console.log("Book returned successfully");

  const allAvailableBooks = await libraryContract.allAvailableBooks();
  console.log("Available books: " + allAvailableBooks);

};

run();
