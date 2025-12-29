// 1inch API configuration
export const ONEINCH_BASE_URL = "https://api.1inch.dev/swap/v6.0";

// Chain IDs for 1inch
export const ONEINCH_CHAIN_ID = {
  mainnet: "5000", // Mantle mainnet
  testnet: "5003", // Mantle testnet (may not be supported)
} as const;

// Native token address
export const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// 1inch Aggregation Router v6 on Mantle
export const ONEINCH_ROUTER_ADDRESS = "0x111111125421cA6dc452d289314280a0f8842A65";

// API configuration (optional - for rate limit increase)
export const configs = {
  apiKey: process.env.ONEINCH_API_KEY, // Optional: for higher rate limits
};
