const hre = require("hardhat");
require("dotenv").config();

const { ALCHEMY_API_KEY, GOERLI_PRIVATE_KEY } = process.env;

const run = async function () {
  const provider = new hre.ethers.providers.JsonRpcProvider(
    `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`
  );

  const wallet = new hre.ethers.Wallet(GOERLI_PRIVATE_KEY, provider);
  const balance = await wallet.getBalance();
  console.log(hre.ethers.utils.formatEther(balance, 18));

  const contractAddress = "0xb781110bf836f54c7a14a785d2a5278e2c184273";
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
  console.log("All books: " + allBooks);

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
