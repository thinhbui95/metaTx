// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Counter {
    uint256 public a;
    function increase(uint256 _a) public {
        a = a + _a;
    }
}
contract Caller {
    function trans(address _ex, uint256 _a) public  returns(bool, bytes memory) {
        return _ex.call(abi.encodeWithSignature("increase(uint256)", _a));
    }
}