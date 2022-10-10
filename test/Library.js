const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Library", () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLibraryFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Library = await ethers.getContractFactory("Library");
    const library = await Library.deploy();

    return { library, owner, otherAccount };
  }

  describe("Deployment", () => {
    it("Should have zero books in stock after deployment", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      expect(await library.allBooks()).to.deep.equal([]);
    });

    it("Should set the right owner", async () => {
      const { library, owner } = await loadFixture(deployLibraryFixture);

      expect(await library.owner()).to.equal(owner.address);
    });
  });

  describe("Book actions", () => {
    it("Should revert when adding new book to book stock with number of copies is less than 0", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await expect(
        library.addBook("Lord of The Rings", "J.R.R Tolkien", 0)
      ).to.be.revertedWith("Book copies cannot be 0!");
    });

    it("Should revert when adding new book to book stock with empty book title", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await expect(library.addBook("", "J.R.R Tolkien", 10)).to.be.revertedWith(
        "Book name cannot be empty!"
      );
    });

    it("Should revert when adding new book to book stock with empty book author", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await expect(
        library.addBook("Lord of The Rings", "", 10)
      ).to.be.revertedWith("Author name cannot be empty!");
    });

    it("Should add new book to book stock when no book with given name not present in stock", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);

      expect(await library.allBooks()).to.have.deep.members([
        ["Lord of The Rings", "J.R.R Tolkien", 10],
      ]);
    });

    it("Should add multiple new books to book stock when no books with given names not present in stock", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await library.addBook("Sword of Destiny", "A. Sapkowski", 1);

      expect(await library.allBooks()).to.have.deep.members([
        ["Lord of The Rings", "J.R.R Tolkien", 10],
        ["Sword of Destiny", "A. Sapkowski", 1],
      ]);
    });
  });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployLibraryFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployLibraryFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(deployLibraryFixture);

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployLibraryFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployLibraryFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
});
