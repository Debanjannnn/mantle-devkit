import type { MNTAgentKit } from "../../agent";
import {
  PYTH_CONTRACT,
  PYTH_ABI,
  PYTH_PRICE_FEED_IDS,
  type PythPriceResponse,
} from "../../constants/pyth";

/**
 * Get multiple prices from Pyth in a single call
 * @param agent - MNTAgentKit instance
 * @param pairs - Array of pair names or price feed IDs
 * @returns Array of price responses
 */
export async function pythGetMultiplePrices(
  agent: MNTAgentKit,
  pairs: string[],
): Promise<PythPriceResponse[]> {
  const pythAddress = PYTH_CONTRACT[agent.chain];
  const results: PythPriceResponse[] = [];

  for (const pairOrId of pairs) {
    // Resolve price feed ID
    let priceFeedId = pairOrId;
    let pair = pairOrId;

    if (pairOrId in PYTH_PRICE_FEED_IDS) {
      priceFeedId =
        PYTH_PRICE_FEED_IDS[pairOrId as keyof typeof PYTH_PRICE_FEED_IDS];
      pair = pairOrId;
    } else {
      const foundPair = Object.entries(PYTH_PRICE_FEED_IDS).find(
        ([, id]) => id === pairOrId.replace("0x", ""),
      );
      if (foundPair) {
        pair = foundPair[0];
      }
    }

    const feedId = priceFeedId.startsWith("0x")
      ? priceFeedId
      : `0x${priceFeedId}`;

    if (agent.demo) {
      results.push(createMockPythResponse(pair, feedId));
      continue;
    }

    try {
      const priceData = (await agent.client.readContract({
        address: pythAddress,
        abi: PYTH_ABI,
        functionName: "getPriceUnsafe",
        args: [feedId as `0x${string}`],
      })) as { price: bigint; conf: bigint; expo: number; publishTime: bigint };

      const formattedPrice = formatPythPrice(
        Number(priceData.price),
        priceData.expo,
      );

      results.push({
        priceFeedId: feedId,
        pair,
        price: priceData.price.toString(),
        confidence: priceData.conf.toString(),
        exponent: priceData.expo,
        publishTime: Number(priceData.publishTime),
        formattedPrice,
      });
    } catch (error) {
      // Continue with other prices even if one fails
      results.push({
        priceFeedId: feedId,
        pair,
        price: "0",
        confidence: "0",
        exponent: 0,
        publishTime: 0,
        formattedPrice: "Error fetching price",
      });
    }
  }

  return results;
}

/**
 * Get all supported Pyth price feed IDs
 * @returns Object mapping pair names to price feed IDs
 */
export function pythGetSupportedPriceFeeds(): Record<string, string> {
  return { ...PYTH_PRICE_FEED_IDS };
}

/**
 * Check if a price feed exists on Pyth
 * @param agent - MNTAgentKit instance
 * @param priceFeedIdOrPair - Price feed ID or pair name
 * @returns Boolean indicating if feed exists
 */
export async function pythPriceFeedExists(
  agent: MNTAgentKit,
  priceFeedIdOrPair: string,
): Promise<boolean> {
  const pythAddress = PYTH_CONTRACT[agent.chain];

  let priceFeedId = priceFeedIdOrPair;
  if (priceFeedIdOrPair in PYTH_PRICE_FEED_IDS) {
    priceFeedId =
      PYTH_PRICE_FEED_IDS[priceFeedIdOrPair as keyof typeof PYTH_PRICE_FEED_IDS];
  }

  const feedId = priceFeedId.startsWith("0x") ? priceFeedId : `0x${priceFeedId}`;

  if (agent.demo) {
    return priceFeedIdOrPair in PYTH_PRICE_FEED_IDS;
  }

  try {
    const exists = (await agent.client.readContract({
      address: pythAddress,
      abi: PYTH_ABI,
      functionName: "priceFeedExists",
      args: [feedId as `0x${string}`],
    })) as boolean;

    return exists;
  } catch {
    return false;
  }
}

function formatPythPrice(price: number, exponent: number): string {
  const adjustedPrice = price * Math.pow(10, exponent);
  if (adjustedPrice >= 1) {
    return adjustedPrice.toFixed(2);
  }
  return adjustedPrice.toFixed(8);
}

function createMockPythResponse(pair: string, feedId: string): PythPriceResponse {
  const mockPrices: Record<string, number> = {
    // Major Crypto
    "BTC/USD": 97500.0, "ETH/USD": 3450.0, "SOL/USD": 185.0, "BNB/USD": 680.0,
    "XRP/USD": 2.35, "ADA/USD": 0.95, "DOGE/USD": 0.32, "DOT/USD": 7.2,
    "AVAX/USD": 38.0, "MATIC/USD": 0.48, "LINK/USD": 22.0, "ATOM/USD": 9.5,
    "LTC/USD": 105.0, "UNI/USD": 13.5, "NEAR/USD": 5.2, "TRX/USD": 0.25,
    // L2
    "ARB/USD": 0.85, "OP/USD": 1.95, "MNT/USD": 0.85, "STRK/USD": 0.45,
    // DeFi
    "AAVE/USD": 285.0, "CRV/USD": 0.52, "MKR/USD": 1850.0, "SNX/USD": 2.8,
    "LDO/USD": 1.85, "GMX/USD": 28.0, "PENDLE/USD": 4.2,
    // Stablecoins
    "USDC/USD": 1.0, "USDT/USD": 1.0, "DAI/USD": 1.0,
    // LST
    "mETH/USD": 3500.0, "stETH/USD": 3450.0, "wstETH/USD": 4100.0,
    // Meme
    "SHIB/USD": 0.000022, "PEPE/USD": 0.000018, "BONK/USD": 0.000028, "WIF/USD": 1.85,
    // Commodities
    "XAU/USD": 2650.0, "XAG/USD": 31.0,
    // Forex
    "EUR/USD": 1.08, "GBP/USD": 1.27, "JPY/USD": 0.0067,
    // Equities
    "AAPL/USD": 248.0, "NVDA/USD": 138.0, "TSLA/USD": 385.0, "MSFT/USD": 425.0,
  };

  const price = mockPrices[pair] || 100.0;
  const decimals = price < 0.01 ? 8 : price < 1 ? 4 : 2;

  return {
    priceFeedId: feedId,
    pair,
    price: Math.floor(price * 1e8).toString(),
    confidence: "50000",
    exponent: -8,
    publishTime: Math.floor(Date.now() / 1000),
    formattedPrice: price.toFixed(decimals),
  };
}
