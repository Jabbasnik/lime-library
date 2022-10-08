// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Library is Ownable {

    using SafeMath for uint256;

    event ValueReceived(address user, uint amount);

    receive() external payable {
        emit ValueReceived(msg.sender, msg.value);
    }

    fallback() external payable {
        require(msg.data.length == 0);
        emit ValueReceived(msg.sender, msg.value);
    }
}
