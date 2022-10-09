// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Library is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter public id;

    struct Book {
        string name;
        string author;
        uint32 copies;
    }

    modifier checkCopies(uint32 copies) {
        require(copies != 0, "Book copies cannot be 0!");
        _;
    }

    modifier checkName(string memory _name) {
        require(bytes(_name).length != 0, "Book name cannot be empty!");
        _;
    }

    mapping(bytes32 => uint256) public bookIdMapping;
    mapping(address => mapping(uint256 => bool)) public borrowedBooksMapping;
    mapping(uint256 => address[]) public bookHistoryMapping;
    Book[] public bookStock;

    event ValueReceived(address user, uint256 amount);
    event NewBookAdded(uint256 id, string name, string author, uint32 copies);
    event BookCopiesUpdated(
        uint256 id,
        string name,
        string author,
        uint32 copies
    );
    event BookBorrowed(uint256 id, address borrower);
    event BookReturned(uint256 id, address borrower);

    function addBook(
        string memory _name,
        string memory _author,
        uint32 _copies
    ) public onlyOwner checkCopies(_copies) checkName(_name) {
        require(bytes(_author).length != 0, "Author name cannot be empty!");

        bytes32 nameHash = keccak256(abi.encodePacked(_name));

        if (bookIdMapping[nameHash] == 0) {
            addNewBook(_name, nameHash, _author, _copies);
        } else {
            updateBook(nameHash, _copies);
        }
    }

    function addNewBook(
        string memory _name,
        bytes32 _nameHash,
        string memory _author,
        uint32 _copies
    ) private {
        Book memory newBook = Book(_name, _author, _copies);
        bookStock.push(newBook);
        uint256 currentId = id.current();
        bookIdMapping[_nameHash] = currentId;
        id.increment();
        emit NewBookAdded(currentId, _name, _author, _copies);
    }

    function updateBook(bytes32 _nameHash, uint32 _copies) private {
        uint256 bookId = bookIdMapping[_nameHash];
        Book storage existingBook = bookStock[bookId];
        bookStock[bookId].copies = _copies;
        emit BookCopiesUpdated(
            bookId,
            existingBook.name,
            existingBook.author,
            _copies
        );
    }

    function borrowBook(uint256 _id) public {
        require(
            bookStock[_id].copies > 0,
            "Cannot borrow book. No more books in stock."
        );

        require(
            borrowedBooksMapping[msg.sender][_id] == false,
            "Cannot borrow same book twice!"
        );

        bookHistoryMapping[_id].push(msg.sender);
        borrowedBooksMapping[msg.sender][_id] = true;
        bookStock[_id].copies--;

        emit BookBorrowed(_id, msg.sender);
    }

    function returnBook(uint256 _id) public {
        require(
            borrowedBooksMapping[msg.sender][_id] == true,
            "Cannot return book, which wasn't borrowed!"
        );
        borrowedBooksMapping[msg.sender][_id] = false;

        bookStock[_id].copies++;

        emit BookReturned(_id, msg.sender);
    }

    function bookHistory(uint256 _id) public view returns (address[] memory) {
        require(id.current() > _id, "Book with given id does not exist!");
        return bookHistoryMapping[_id];
    }

    function bookByName(string memory _name)
        public
        view
        checkName(_name)
        returns (Book memory)
    {
        bytes32 nameHash = keccak256(abi.encodePacked(_name));
        uint256 bookId = bookIdMapping[nameHash];
        return bookStock[bookId];
    }

    function allBooks() public view returns (Book[] memory) {
        return bookStock;
    }

    function allAvailableBooks() public view returns (Book[] memory) {
        Book[] memory books = bookStock;
        Book[] memory availableBooks = new Book[](books.length);
        for (uint256 i = 0; i < id.current(); i = unsafe_inc(i)) {
            if (books[i].copies > 0) {
                availableBooks[i] = books[i];
            }
        }
        return availableBooks;
    }

    function unsafe_inc(uint256 x) private pure returns (uint256) {
        unchecked {
            return x + 1;
        }
    }

    receive() external payable {
        emit ValueReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        require(msg.data.length == 0);
        emit ValueReceived(msg.sender, msg.value);
    }
}
