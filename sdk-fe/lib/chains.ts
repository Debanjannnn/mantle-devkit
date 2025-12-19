import { defineChain } from 'viem'

// Mantle Testnet configuration
export const MantleTestnet = defineChain({
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Mantle Sepolia Testnet',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://mantle-sepolia.drpc.org'],
    },
    public: {
      http: ['https://mantle-sepolia.drpc.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.sepolia.mantle.xyz',
    },
  },
  testnet: true,
})

// Mantle Mainnet configuration
export const MantleMainnet = defineChain({
  id: 5000,
  name: 'Mantle',
  nativeCurrency: {
    decimals: 18,
    name: 'Mantle',
    symbol: 'MNT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.mantle.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mantle Explorer',
      url: 'https://explorer.mantle.xyz',
    },
  },
  testnet: false,
})


