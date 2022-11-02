# Library project for week 1 & 2!

Current functionalities:
* The administrator (owner) of the library is able to add new books and the number of copies in the library.
* Users are able to see the available books and borrow them by their id.
* Users are able to return books.
* A user are able borrow more than one copy of a book at a time. The users are not be able to borrow a book more times than the copies in the libraries unless copy is returned.
* Everyone are able to see the addresses of all people that have ever borrowed a given book.
* Users are able to see all *available* books in stock
* Users are able to get books by it's name.

```shell
npx hardhat test
npx hardhat compile
npx hardhat run scripts/deploy-localhost.js         // for localhost deployment
npx hardhat run scripts/deploy-goerli.js            // for testnet deployment
``` 
