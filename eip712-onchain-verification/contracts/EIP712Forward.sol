// // SPDX-License-Identifier: MIT
// // Further information: https://eips.ethereum.org/EIPS/eip-2770
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";


contract EIP712Forward is Ownable, Pausable, EIP712 {
    //using ECDSA for bytes32;

    struct ForwardRequest {
        address from;       // Externally-owned account (EOA) making the request.
        address to;         // Destination address, normally a smart contract.
        uint256 value;      // Amount of ether to transfer to the destination.
        uint256 gas;        // Amount of gas limit to set for the execution.
        uint256 nonce;      // On-chain tracked nonce of a transaction.
        bytes data;         // (Call)data to be sent to the destination.
    }

    bytes32 private constant _TYPEHASH = keccak256("ForwardRequest(address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data)");

    mapping(address => uint256) private _nonces;
    mapping(address => bool) private _senderWhitelist;


    event MetaTransactionExecuted(address indexed from, address indexed to, bytes indexed data);
    event AddressWhitelisted(address indexed sender);
    event AddressRemovedFromWhitelist(address indexed sender);

    constructor(string memory name, string memory version) EIP712(name, version) {
        address msgSender = msg.sender;
        addSenderToWhitelist(msgSender);
    }

    /**
     * @dev Triggers stopped state.
     * Requirements: The contract must not be paused.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Returns to normal state.
     * Requirements: The contract must be paused.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Returns the domain separator used in the encoding of the signature for `execute`, as defined by {EIP712}.
     * See https://eips.ethereum.org/EIPS/eip-712
     */
    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    /// @dev Retrieves the on-chain tracked nonce of an EOA making the request.
    function getNonce(address from) public view returns (uint256) {
        return _nonces[from];
    }
    function _getHash(ForwardRequest memory req) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            _TYPEHASH,
            req.from,
            req.to,
            req.value,
            req.gas,
            req.nonce,
            keccak256(req.data)
        )));
    }

    /**
     * @dev Verifies the signature based on typed structured data. 
     * See https://eips.ethereum.org/EIPS/eip-712
     */
    function verify(ForwardRequest memory req, bytes memory signature) public view returns (bool) {
        require(_nonces[req.from] == req.nonce, "invalid nonce");
        bytes32 digest = _getHash(req);
        address signer = ECDSA.recover(digest,signature); 
        return (signer == req.from && signer == req.from );
    }

    /// @dev Main function; executes the meta-transaction via a low-level call.
    function execute(ForwardRequest calldata req, bytes calldata signature) public payable whenNotPaused() returns (bytes memory) {
        require(_senderWhitelist[msg.sender], "AwlForwarder: sender of meta-transaction is not whitelisted");
        require(verify(req, signature), "AwlForwarder: signature does not match request");
       _nonces[req.from] = req.nonce + 1;

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = req.to.call{value: req.value}(abi.encodePacked(req.data, req.from));
        require(success, "fail");
        emit MetaTransactionExecuted(req.from, req.to, req.data);

        return returndata;
    }

    /// @dev Only whitelisted addresses are allowed to broadcast meta-transactions.
    function addSenderToWhitelist(address sender) public onlyOwner() {
        require(!isWhitelisted(sender), "AwlForwarder: sender address is already whitelisted"); // This requirement prevents registry duplication.
        _senderWhitelist[sender] = true;
        emit AddressWhitelisted(sender);
    }

    /// @dev Removes a whitelisted address.
    function removeSenderFromWhitelist(address sender) public onlyOwner() {
        _senderWhitelist[sender] = false;
        emit AddressRemovedFromWhitelist(sender);
    }

    /// @dev Retrieves the information whether an address is whitelisted or not.
    function isWhitelisted(address sender) public view returns (bool) {
        return _senderWhitelist[sender];
    }

}