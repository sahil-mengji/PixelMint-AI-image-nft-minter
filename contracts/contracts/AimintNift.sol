// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract AiNifter {
    uint public counter = 1;
    
    struct NFT {
        uint id;
        string ipfsHash;
        address owner;
        uint price;
    }
    
    NFT[] public nfts;
    mapping(address => uint[]) public ownerToNFTs;
    
    event NFTMinted(uint id, string ipfsHash, address owner, uint price);
    
    constructor() {
        nfts.push(NFT(0, "", address(0), 0));
    }
    
    function mintNft(string memory _ipfsHash, uint _price) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        
        NFT memory temp = NFT({
            id: counter,
            ipfsHash: _ipfsHash,
            owner: msg.sender,
            price: _price
        });
        
        nfts.push(temp);
        ownerToNFTs[msg.sender].push(counter);
        
        emit NFTMinted(counter, _ipfsHash, msg.sender, _price);
        
        counter++;
    }

    function getAllNfts() public view returns(NFT[] memory) {
        return nfts;
    }
    
    function getNftById(uint _id) public view returns(NFT memory) {
        require(_id < nfts.length && _id > 0, "NFT does not exist");
        return nfts[_id];
    }
    
    function getTotalNFTs() public view returns(uint) {
        return counter - 1;
    }

    function getNftsByOwner(address _owner) public view returns(NFT[] memory) {
        uint[] memory ownerNftIds = ownerToNFTs[_owner];
        NFT[] memory ownerNfts = new NFT[](ownerNftIds.length);
        
        for(uint i = 0; i < ownerNftIds.length; i++) {
            ownerNfts[i] = nfts[ownerNftIds[i]];
        }
        
        return ownerNfts;
    }
}