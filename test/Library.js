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

    await library.deployed();

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

  describe("Book add actions", () => {
    it("Should revert with the right error if called from non-owner account", async () => {
      const { library, otherAccount } = await loadFixture(deployLibraryFixture);

      await expect(
        library
          .connect(otherAccount)
          .addBook("Lord of The Rings", "J.R.R Tolkien", 10)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

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

    it("Should update number of copies of existing book when book is already in stock", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 15);

      expect(await library.allBooks()).to.have.deep.members([
        ["Lord of The Rings", "J.R.R Tolkien", 15],
      ]);
    });

    it("Should update number of copies of existing book when multiple books are already in stock", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await library.addBook("Sword of Destiny", "A. Sapkowski", 1);
      await library.addBook("Sword of Destiny", "A. Sapkowski", 8);

      expect(await library.allBooks()).to.have.deep.members([
        ["Lord of The Rings", "J.R.R Tolkien", 10],
        ["Sword of Destiny", "A. Sapkowski", 8],
      ]);
    });

    it("Should emit NewBookAdded event when no book with given name not present in stock", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await expect(
        library.addBook("Lord of The Rings", "J.R.R Tolkien", 10)
      ).to.emit(library, "NewBookAdded");
    });

    it("Should emit BookCopiesUpdated event when book with given name already present in stock", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await expect(
        library.addBook("Lord of The Rings", "J.R.R Tolkien", 5)
      ).to.emit(library, "BookCopiesUpdated");
    });
  });

  describe("Book borrow actions", () => {
    it("Should lower number of books in stock when user borrows a copy", async () => {
      const { library, otherAccount } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);

      await library.connect(otherAccount).borrowBook(0);

      expect(await library.allBooks()).to.have.deep.members([
        ["Lord of The Rings", "J.R.R Tolkien", 9],
      ]);
    });

    it("Should revert with the right error if no book copies avaialbe in stock", async () => {
      const { library, otherAccount } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 1);
      await library.borrowBook(0);

      await expect(
        library.connect(otherAccount).borrowBook(0)
      ).to.be.revertedWith("Cannot borrow book. No more books in stock.");
    });

    it("Should revert with the right error if user tries to borrow same book twice", async () => {
      const { library, otherAccount } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await library.connect(otherAccount).borrowBook(0);

      await expect(
        library.connect(otherAccount).borrowBook(0)
      ).to.be.revertedWith("Cannot borrow same book twice!");
    });

    it("Should add user to book history when user borrows book", async () => {
      const { library, otherAccount } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await library.connect(otherAccount).borrowBook(0);

      expect(await library.bookHistory(0)).to.have.deep.members([
        otherAccount.address,
      ]);
    });

    it("Should emit BookBorrowed event when user sucessfully borrowed a book", async () => {
      const { library, otherAccount } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await expect(await library.connect(otherAccount).borrowBook(0)).to.emit(
        library,
        "BookBorrowed"
      );
    });
  });

  describe("Book return actions", () => {
    it("Should revert with the right error if user tries to return book he don't own", async () => {
      const { library, otherAccount } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await library.borrowBook(0);

      await expect(
        library.connect(otherAccount).returnBook(0)
      ).to.be.revertedWith("Cannot return book, which wasn't borrowed!");
    });

    it("Should increase number of books in stock when user returns a copy", async () => {
      const { library, otherAccount } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await library.borrowBook(0);

      await library.connect(otherAccount).borrowBook(0);
      await library.connect(otherAccount).returnBook(0);

      expect(await library.allBooks()).to.have.deep.members([
        ["Lord of The Rings", "J.R.R Tolkien", 9],
      ]);
    });

    it("Should emit BookReturned event when user sucessfully returned a book", async () => {
      const { library, otherAccount } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);

      await library.connect(otherAccount).borrowBook(0);

      await expect(library.connect(otherAccount).returnBook(0)).to.emit(
        library,
        "BookReturned"
      );
    });
  });

  describe("Library actions", () => {
    it("Should add users to book history when book being borrowed", async () => {
      const { library, otherAccount, owner } = await loadFixture(
        deployLibraryFixture
      );

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await library.connect(otherAccount).borrowBook(0);
      await library.borrowBook(0);

      expect(await library.bookHistory(0)).to.have.deep.members([
        otherAccount.address,
        owner.address,
      ]);
    });

    it("Should revert with the right error if user tries to get history of non existing book", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await expect(library.bookHistory(1)).to.be.revertedWith(
        "Book with given id does not exist!"
      );
    });

    it("Should add users to book history when book being borrowed", async () => {
      const { library, otherAccount, owner } = await loadFixture(
        deployLibraryFixture
      );

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await library.connect(otherAccount).borrowBook(0);
      await library.borrowBook(0);

      expect(await library.bookHistory(0)).to.have.deep.members([
        otherAccount.address,
        owner.address,
      ]);
    });

    it("Should revert with the right error if user tries to get book by name with empty string", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await expect(library.bookByName("")).to.be.revertedWith(
        "Book name cannot be empty!"
      );
    });

    it("Should get book by name when book present in stock", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);

      expect(
        await library.bookByName("Lord of The Rings")
      ).to.have.deep.members(["Lord of The Rings", "J.R.R Tolkien", 10]);
    });

    it("Should get all books from stock", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await library.addBook("Sword of Destiny", "A. Sapkowski", 100);

      expect(await library.allBooks()).to.have.deep.members([
        ["Lord of The Rings", "J.R.R Tolkien", 10],
        ["Sword of Destiny", "A. Sapkowski", 100],
      ]);
    });

    it("Should return only avaliable books in stock when calling allAvailableBooks", async () => {
      const { library } = await loadFixture(deployLibraryFixture);

      await library.addBook("Lord of The Rings", "J.R.R Tolkien", 10);
      await library.addBook("Sword of Destiny", "A. Sapkowski", 1);
      await library.borrowBook(1);

      expect(await library.allAvailableBooks()).to.have.deep.members([
        ["Lord of The Rings", "J.R.R Tolkien", 10],
        ["", "", 0],
      ]);
    });
  });
});