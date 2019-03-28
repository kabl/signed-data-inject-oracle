pragma solidity ^0.5.0;


contract DataVerifier {

    address payable public owner;
    address public trustedOracle;

    event NewFxRateUsdEth(uint256 data);

    constructor() public {
        owner = msg.sender;
    }

    function setTrustedOracle(
        address _trustedOracle
    ) 
        public 
        returns (bool) 
    {
        require(owner == msg.sender);
        trustedOracle = _trustedOracle;
    }

    //fxRateUsdEth has 3 decimals. As there are no floating point numbers in Solidity
    function verifySignature(
        uint256 fxRateUsdEth, 
        uint256 timestamp, 
        bytes memory signature
    ) 
        public 
        returns (bool) 
    {
        require(timestamp < block.timestamp + 5 minutes, "TS check1");
        require(timestamp > block.timestamp - 5 minutes, "TS check2");

        bytes32 calcedHash = calcHash(fxRateUsdEth, timestamp);
        address addressFromSig = recoverSigner(calcedHash, signature);
        require(addressFromSig == trustedOracle, "wrong singer!");
        //check timestamp
        emit NewFxRateUsdEth(fxRateUsdEth);
        return true;
    }

    function calcHash(
        uint256 data, 
        uint256 timestamp
    ) 
        public pure 
        returns (bytes32) 
    {  
        bytes memory encoded = abi.encodePacked(data, timestamp);
        return keccak256(encoded);
    }

    /**
    * @dev Recover signer address from a message by using their signature
    * @param hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
    * @param sig bytes signature, the signature is generated using web3.eth.sign(). Inclusive "0x..."
    */
    function recoverSigner(
        bytes32 hash, 
        bytes memory sig
    ) 
        public pure 
        returns (address) 
    {
        require(sig.length == 65, "Require correct length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        // Divide the signature in r, s and v variables
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Signature version not match");

        return recoverSigner2(hash, v, r, s);
    }

    function recoverSigner2(
        bytes32 h, 
        uint8 v, 
        bytes32 r, 
        bytes32 s
    ) 
        public pure 
        returns (address) 
    {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, h));
        address addr = ecrecover(prefixedHash, v, r, s);

        return addr;
    }

    function destroy() 
        public 
        returns (bool) 
    {
        require(owner == msg.sender);

        selfdestruct(owner);
        return true;
    }
}