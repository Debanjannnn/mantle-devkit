import {
  createWalletClient,
  http,
  publicActions,
  type Chain,
  type PublicActions,
  type Transport,
  type WalletClient,
} from "viem";
import {
  privateKeyToAccount,
  type Address,
  type PrivateKeyAccount,
} from "viem/accounts";
import { mantle, mantleSepoliaTestnet } from "viem/chains";
import { executeSwap, sendTransaction } from "./tools";
import { getSwapQuote } from "./tools/okx/getSwapQuote";
import { swapOnOpenOcean, getOpenOceanQuote } from "./tools/openocean";
import { swapOn1inch, get1inchQuote } from "./tools/oneinch";
import { swapOnUniswap, getUniswapQuote } from "./tools/uniswap";
import { crossChainSwapViaSquid, getSquidRoute } from "./tools/squid";
import {
  lendleSupply,
  lendleWithdraw,
  lendleBorrow,
  lendleRepay,
  lendleGetPositions,
} from "./tools/lendle";
import { agniSwap } from "./tools/agni";
import { merchantMoeSwap } from "./tools/merchantmoe";
import { METH_TOKEN } from "./tools/meth";
import { methGetPosition, swapToMeth, swapFromMeth } from "./tools/meth-staking";
import {
  pikeperpsOpenLong,
  pikeperpsOpenShort,
  pikeperpsClosePosition,
  pikeperpsGetPositions,
  pikeperpsGetMarketData,
} from "./tools/pikeperps";
import { initializePlatform, type ProjectConfig } from "./utils/x402";
import { getUserAccountData } from "./utils/lendle";
import { erc7811Actions, type Erc7811Actions } from "viem/experimental";

export class MNTAgentKit {
  public account: PrivateKeyAccount;
  public client: WalletClient<Transport, Chain, PrivateKeyAccount> &
    PublicActions &
    Erc7811Actions;
  public chain: "testnet" | "mainnet";
  public demo: boolean;
  public projectConfig?: ProjectConfig;

  constructor(privateKey: Address, chain: "mainnet" | "testnet" | "testnet-demo") {
    this.account = privateKeyToAccount(privateKey);
    this.demo = chain === "testnet-demo";
    this.chain = chain === "testnet-demo" ? "testnet" : chain;
    this.client = createWalletClient({
      chain: this.chain == "mainnet" ? mantle : mantleSepoliaTestnet,
      transport: http(),
      account: this.account,
    })
      .extend(publicActions)
      .extend(erc7811Actions());
  }

  /**
   * Initialize the agent with platform validation
   *
   * Validates APP_ID with the platform API.
   * Must be called after creating the agent instance.
   *
   * @returns The initialized agent instance
   * @throws Error if APP_ID is not set or validation fails
   *
   * @example
   * ```typescript
   * const agent = new MNTAgentKit(privateKey, "mainnet");
   * await agent.initialize(); // Validates APP_ID
   * ```
   */
  async initialize(): Promise<MNTAgentKit> {
    this.projectConfig = await initializePlatform();
    return this;
  }

  async sendTransaction(to: Address, amount: string) {
    return await sendTransaction(this, to, amount);
  }

  // OKX DEX Aggregator
  async getSwapQuote(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    slippagePercentage: string = "0.5",
  ) {
    return await getSwapQuote(
      this,
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippagePercentage,
    );
  }

  async executeSwap(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    slippagePercentage: string = "0.5",
  ) {
    return await executeSwap(
      this,
      fromTokenAddress,
      toTokenAddress,
      amount,
      slippagePercentage,
    );
  }

  // OpenOcean DEX Aggregator
  async getOpenOceanQuote(
    fromToken: Address,
    toToken: Address,
    amount: string,
  ) {
    return await getOpenOceanQuote(this, fromToken, toToken, amount);
  }

  async swapOnOpenOcean(
    fromToken: Address,
    toToken: Address,
    amount: string,
    slippage: number = 0.5,
  ) {
    return await swapOnOpenOcean(
      this,
      fromToken,
      toToken,
      amount,
      slippage.toString(),
    );
  }

  // 1inch DEX Aggregator
  async get1inchQuote(fromToken: Address, toToken: Address, amount: string) {
    return await get1inchQuote(this, fromToken, toToken, amount);
  }

  async swapOn1inch(
    fromToken: Address,
    toToken: Address,
    amount: string,
    slippage: number = 0.5,
  ) {
    return await swapOn1inch(
      this,
      fromToken,
      toToken,
      amount,
      slippage.toString(),
    );
  }

  // Uniswap V3 DEX
  async getUniswapQuote(fromToken: Address, toToken: Address, amount: string) {
    return await getUniswapQuote(this, fromToken, toToken, amount);
  }

  async swapOnUniswap(
    fromToken: Address,
    toToken: Address,
    amount: string,
    slippage: number = 0.5,
  ) {
    return await swapOnUniswap(
      this,
      fromToken,
      toToken,
      amount,
      slippage.toString(),
    );
  }

  // Lendle Lending Protocol
  async lendleSupply(tokenAddress: Address, amount: string) {
    return await lendleSupply(this, tokenAddress, amount);
  }

  async lendleWithdraw(tokenAddress: Address, amount: string, to?: Address) {
    return await lendleWithdraw(this, tokenAddress, amount, to);
  }

  async lendleBorrow(
    tokenAddress: Address,
    amount: string,
    interestRateMode: 1 | 2 = 2,
    onBehalfOf?: Address,
  ) {
    return await lendleBorrow(
      this,
      tokenAddress,
      amount,
      interestRateMode,
      onBehalfOf,
    );
  }

  async lendleRepay(
    tokenAddress: Address,
    amount: string,
    rateMode: 1 | 2 = 2,
    onBehalfOf?: Address,
  ) {
    return await lendleRepay(this, tokenAddress, amount, rateMode, onBehalfOf);
  }

  /**
   * Get user account data from Lendle LendingPool
   * Returns overall position including total collateral, debt, and health factor
   * @param userAddress - User wallet address (optional, defaults to agent account)
   * @returns User account data with collateral, debt, available borrows, and health factor
   */
  async lendleGetUserAccountData(userAddress?: Address) {
    return await getUserAccountData(this, userAddress);
  }

  /**
   * Get all Lendle positions for a user (per-token breakdown)
   * Returns detailed supply and borrow amounts for each asset
   * @param userAddress - User wallet address (optional, defaults to agent account)
   * @returns Array of positions with supply/borrow amounts per asset
   */
  async lendleGetPositions(userAddress?: Address) {
    return await lendleGetPositions(this, userAddress);
  }

  // Agni Finance DEX (#1 on Mantle)
  async agniSwap(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: string,
    slippagePercent: number = 0.5,
    feeTier?: number,
  ) {
    return await agniSwap(
      this,
      tokenIn,
      tokenOut,
      amountIn,
      slippagePercent,
      feeTier,
    );
  }

  // Merchant Moe DEX (#2 on Mantle)
  async merchantMoeSwap(
    tokenIn: Address,
    tokenOut: Address,
    amountIn: string,
    slippagePercent: number = 0.5,
  ) {
    return await merchantMoeSwap(
      this,
      tokenIn,
      tokenOut,
      amountIn,
      slippagePercent,
    );
  }

  // mETH Protocol - Liquid Staking Token
  getMethTokenAddress() {
    if (this.demo) {
      return METH_TOKEN.mainnet;
    }
    return METH_TOKEN[this.chain];
  }

  /**
   * Get mETH staking position for a user
   * Returns mETH balance and WETH balance for comparison
   * @param userAddress - User wallet address (optional, defaults to agent account)
   * @returns mETH position with balances
   */
  async methGetPosition(userAddress?: Address) {
    return await methGetPosition(this, userAddress);
  }

  /**
   * Swap WETH to mETH using DEX aggregator
   * @param amount - Amount of WETH to swap (in wei as string)
   * @param slippage - Slippage tolerance percentage (default 0.5%)
   * @returns Transaction hash
   */
  async swapToMeth(amount: string, slippage: number = 0.5) {
    return await swapToMeth(this, amount, slippage);
  }

  /**
   * Swap mETH to WETH using DEX aggregator
   * @param amount - Amount of mETH to swap (in wei as string)
   * @param slippage - Slippage tolerance percentage (default 0.5%)
   * @returns Transaction hash
   */
  async swapFromMeth(amount: string, slippage: number = 0.5) {
    return await swapFromMeth(this, amount, slippage);
  }

  // Squid Router Cross-chain
  async getSquidRoute(
    fromToken: Address,
    toToken: Address,
    fromChain: number,
    toChain: number,
    amount: string,
    slippage: number = 1,
  ) {
    return await getSquidRoute(
      this,
      fromToken,
      toToken,
      fromChain,
      toChain,
      amount,
      slippage,
    );
  }

  async crossChainSwapViaSquid(
    fromToken: Address,
    toToken: Address,
    fromChain: number,
    toChain: number,
    amount: string,
    slippage: number = 1,
  ) {
    return await crossChainSwapViaSquid(
      this,
      fromToken,
      toToken,
      fromChain,
      toChain,
      amount,
      slippage,
    );
  }

  // PikePerps - Perpetual Trading
  /**
   * Open a long position on PikePerps
   * @param tokenAddress - Token to trade (meme token address)
   * @param margin - Margin amount in wei (as string)
   * @param leverage - Leverage multiplier (1-100, default 10)
   * @returns Position ID and transaction hash
   */
  async pikeperpsOpenLong(
    tokenAddress: Address,
    margin: string,
    leverage: number = 10,
  ) {
    return await pikeperpsOpenLong(this, tokenAddress, margin, leverage);
  }

  /**
   * Open a short position on PikePerps
   * @param tokenAddress - Token to trade (meme token address)
   * @param margin - Margin amount in wei (as string)
   * @param leverage - Leverage multiplier (1-100, default 10)
   * @returns Position ID and transaction hash
   */
  async pikeperpsOpenShort(
    tokenAddress: Address,
    margin: string,
    leverage: number = 10,
  ) {
    return await pikeperpsOpenShort(this, tokenAddress, margin, leverage);
  }

  /**
   * Close an existing position on PikePerps
   * @param positionId - Position ID to close
   * @returns Transaction hash
   */
  async pikeperpsClosePosition(positionId: bigint) {
    return await pikeperpsClosePosition(this, positionId);
  }

  /**
   * Get all positions for a user on PikePerps
   * Returns detailed position data including PnL and liquidation prices
   * @param userAddress - User wallet address (optional, defaults to agent account)
   * @returns Array of positions with PnL and liquidation data
   */
  async pikeperpsGetPositions(userAddress?: Address) {
    return await pikeperpsGetPositions(this, userAddress);
  }

  /**
   * Get market data for a token on PikePerps
   * Returns current price and recent trades
   * @param tokenAddress - Token address to get market data for
   * @param limit - Maximum number of recent trades to return (default 20)
   * @returns Market data with price and recent trades
   */
  async pikeperpsGetMarketData(tokenAddress: Address, limit: number = 20) {
    return await pikeperpsGetMarketData(this, tokenAddress, limit);
  }
}
