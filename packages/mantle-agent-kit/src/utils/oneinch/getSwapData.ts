import axios from "axios";
import { ONEINCH_BASE_URL, ONEINCH_CHAIN_ID } from "../../constants/oneinch";
import { getHeaders } from "../../helpers/oneinch";

export interface OneInchQuote {
  srcToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  dstToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  srcAmount: string;
  dstAmount: string;
  gas: number;
}

export interface OneInchSwapData {
  srcToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  dstToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  srcAmount: string;
  dstAmount: string;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: number;
    gasPrice: string;
  };
}


/**
 * Get swap quote from 1inch API
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (in smallest units)
 * @param chain - Chain identifier ("mainnet" | "testnet")
 * @returns Quote data
 */
export async function getQuoteData(
  fromToken: string,
  toToken: string,
  amount: string,
  chain: "mainnet" | "testnet",
): Promise<OneInchQuote> {
  try {
    const chainId = ONEINCH_CHAIN_ID[chain];
    const url = `${ONEINCH_BASE_URL}/${chainId}/quote`;

    const params = {
      src: fromToken,
      dst: toToken,
      amount: amount,
    };

    const response = await axios.get(url, {
      params,
      headers: getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error("Failed to get 1inch quote:", (error as Error).message);
    throw error;
  }
}

/**
 * Get swap transaction data from 1inch API
 * @param fromToken - Source token address
 * @param toToken - Destination token address
 * @param amount - Amount to swap (in smallest units)
 * @param userAddress - User's wallet address
 * @param slippage - Slippage percentage (e.g., "1" for 1%)
 * @param chain - Chain identifier ("mainnet" | "testnet")
 * @returns Swap transaction data
 */
export async function getSwapData(
  fromToken: string,
  toToken: string,
  amount: string,
  userAddress: string,
  slippage: string,
  chain: "mainnet" | "testnet",
): Promise<OneInchSwapData> {
  try {
    const chainId = ONEINCH_CHAIN_ID[chain];
    const url = `${ONEINCH_BASE_URL}/${chainId}/swap`;

    const params = {
      src: fromToken,
      dst: toToken,
      amount: amount,
      from: userAddress,
      slippage: slippage,
      disableEstimate: "true", // We'll estimate gas ourselves
    };

    const response = await axios.get(url, {
      params,
      headers: getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error("Failed to get 1inch swap data:", (error as Error).message);
    throw error;
  }
}
