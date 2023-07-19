// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";



contract Example is ERC2771Context{
    constructor(address trustedForwarder_) ERC2771Context(trustedForwarder_){}
    uint public a =2 ;
    function increase(uint256 _a) public {
        a = a + _a;
    }
}

