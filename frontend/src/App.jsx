import React, { useState, useEffect } from 'react';
import { ethers } from "ethers";
import {a} from '../public/abi';
import {PinataSDK} from 'pinata-web3'
import Button from './components/Button';
import Card from './components/Card';
import Input from './components/Input';
import {generateRandomImage} from './openAi';

// Pinata SDK:Add your Pinata API key here
const pinata = new PinataSDK({
  pinataJwt: "",
  pinataGateway: "https://gateway.pinata.cloud"
});



const PatternNftMinter = () => {
  // Pattern Generator State
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [pattern, setPattern] = useState(() => generateRandomPattern(400, 300));
  
  // NFT Minter State
  const [contract, setContract] = useState(null);
  const [price, setPrice] = useState('');
  const [nfts, setNfts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    checkWalletConnection();
  }, []);

  // Convert SVG to File
  const svgToFile = (svgElement) => {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const file = new File([svgBlob], 'pattern.svg', { type: 'image/svg+xml' });
    return file;
  };

  // Upload to IPFS using Pinata
  const uploadToIPFS = async (file) => {
  
    try {
      // const response = await axios.post(PINATA_URL, formData, config);
      // return response.data.IpfsHash;      
      const x=await pinata.upload.file(file);
      console.log(x)
      return x.IpfsHash;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  };

  // Pattern Generation Functions
  function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 40 + Math.floor(Math.random() * 60);
    const lightness = 40 + Math.floor(Math.random() * 40);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  // ... (keep existing shape generation functions)
  function generateRandomShape(index) {
    const shapes = [
      // Circle
      () => {
        const cx = Math.random() * width;
        const cy = Math.random() * height;
        const r = 10 + Math.random() * 50;
        return (
          <circle
            key={`circle-${index}`}
            cx={cx}
            cy={cy}
            r={r}
            fill={getRandomColor()}
            opacity={0.3 + Math.random() * 0.4}
          />
        );
      },
      // Rectangle
      () => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const w = 20 + Math.random() * 60;
        const h = 20 + Math.random() * 60;
        const rotation = Math.random() * 360;
        return (
          <rect
            key={`rect-${index}`}
            x={x}
            y={y}
            width={w}
            height={h}
            fill={getRandomColor()}
            opacity={0.3 + Math.random() * 0.4}
            transform={`rotate(${rotation} ${x + w/2} ${y + h/2})`}
          />
        );
      },
      // Triangle
      () => {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const x2 = x1 + (-30 + Math.random() * 60);
        const y2 = y1 + (-30 + Math.random() * 60);
        const x3 = x1 + (-30 + Math.random() * 60);
        const y3 = y1 + (-30 + Math.random() * 60);
        return (
          <path
            key={`triangle-${index}`}
            d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`}
            fill={getRandomColor()}
            opacity={0.3 + Math.random() * 0.4}
          />
        );
      }
    ];
    
    return shapes[Math.floor(Math.random() * shapes.length)]();
  }

  function generateRandomPattern(w, h) {
    const numShapes = 15 + Math.floor(Math.random() * 20);
    const shapes = [];
    
    // Background shapes
    for (let i = 0; i < 5; i++) {
      shapes.push(
        <rect
          key={`bg-${i}`}
          x={Math.random() * w}
          y={Math.random() * h}
          width={w * 0.4}
          height={h * 0.4}
          fill={getRandomColor()}
          opacity={0.2}
        />
      );
    }
    
    // Foreground shapes
    for (let i = 0; i < numShapes; i++) {
      shapes.push(generateRandomShape(i));
    }
    
    return shapes;
  }

  // Modified mint function to handle IPFS upload
  const mintNft = async () => {
    if (!contract || !price || isUploading) return;
    
    try {
      setIsUploading(true);
      setUploadStatus('Uploading to IPFS...');

      // Get SVG element and convert to file
      const svgElement = document.querySelector('svg');
      const file = svgToFile(svgElement);

      // Upload to IPFS
      const ipfsHash = await uploadToIPFS(file);
      setUploadStatus('Minting NFT...');

      // Mint NFT with IPFS hash
      const tx = await contract.mintNft(ipfsHash, ethers.parseEther(price));
      await tx.wait();
      console.log(tx)
      
      setUploadStatus('NFT Minted Successfully!');
      getNftsByOwner();
      setPrice('');
      
      setTimeout(() => {
        setUploadStatus('');
      }, 3000);
    } catch (error) {
      console.error("Error minting NFT:", error);
      setUploadStatus('Error: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  
  const getNftsByOwner = async () => {
    if (!contract) return;
    try {
      const address = await signer.getAddress();
      const nfts = await contract.getNftsByOwner(address);
      console.log("NFTS",nfts)
      setNfts(nfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  const regeneratePattern = () => {
    setPattern(generateRandomPattern(width, height));
  };

  const handleDimensionChange = (newWidth, newHeight) => {
    const w = Number(newWidth) || width;
    const h = Number(newHeight) || height;
    setWidth(w);
    setHeight(h);
    setPattern(generateRandomPattern(w, h));
  };

  const checkWalletConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          await connectWallet();
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const connectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract= new ethers.Contract("0x5fbdb2315678afecb367f032d93f642f64180aa3",a.abi,signer);
      setContract(contract);
      setSigner(signer);
      setIsConnected(true);
      getNftsByOwner();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };


  // ... (keep existing wallet connection and other functions)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pattern NFT Generator
          </h1>
          <p className="text-gray-600 mb-6">
            Generate unique patterns and mint them as NFTs
          </p>
          <Button
            onClick={connectWallet}
            className="inline-flex items-center gap-2"
          >
            {isConnected ? '✓ Wallet Connected' : '🔗 Connect Wallet'}
          </Button>
        </div>

        {/* Pattern Generator */}
        <Card title="Pattern Generator">
          <div className="space-y-6">
            {/* Dimensions Input */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Width"
                type="number"
                value={width}
                onChange={(e) => handleDimensionChange(e.target.value, height)}
                min="100"
                max="1200"
              />
              <Input
                label="Height"
                type="number"
                value={height}
                onChange={(e) => handleDimensionChange(width, e.target.value)}
                min="100"
                max="1200"
              />
            </div>

            {/* Pattern Display */}
            <div className="flex flex-col items-center gap-4">
              <div className="border rounded-lg shadow-md overflow-hidden">
                <svg width={width} height={height} style={{ background: '#ffffff' }}>
                  {pattern}
                </svg>
              </div>
              
              <Button onClick={regeneratePattern} className="w-full">
                Generate New Pattern
              </Button>
            </div>

            {/* NFT Minting Form */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <Input
                label="NFT Price (ETH)"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter NFT price in ETH..."
                step="0.01"
                min="0"
              />

              {uploadStatus && (
                <div className={`text-center p-2 rounded ${
                  uploadStatus.includes('Error') 
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {uploadStatus}
                </div>
              )}

              <Button
                onClick={mintNft}
                disabled={!isConnected || !price || isUploading}
                className="w-full"
              >
                {isUploading ? 'Processing...' : 'Mint NFT'}
              </Button>
            </div>
          </div>
        </Card>

        {/* NFT Collection */}
        <Card title="Your NFT Collection" className="mt-8">
          {!isConnected ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500">Connect your wallet to view your NFTs</p>
            </div>
          ) : nfts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500">No NFTs found in your collection</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nfts.map((nft, index) => (
                <div key={index} className="border rounded-xl p-4 hover:shadow-lg transition-all">
                  <div className="h-48 bg-gray-100 rounded-lg mb-4">
                    <img 
                      src={`https://gateway.pinata.cloud/ipfs/${nft.ipfsHash}`}
                      alt={`NFT ${index}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 truncate">
                      <span className="font-medium">IPFS Hash:</span> {nft.ipfsHash}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price:</span> {ethers.formatEther(nft.price)} ETH
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PatternNftMinter;