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
} from "./tools/lendle";
import { agniSwap } from "./tools/agni";
import { merchantMoeSwap } from "./tools/merchantmoe";
import { METH_TOKEN } from "./tools/meth";
import {
  initializePlatform,
  type ProjectConfig,
} from "./utils/x402";

export class MNTAgentKit {
  public account: PrivateKeyAccount;
  public client: WalletClient<Transport, Chain, PrivateKeyAccount> &
    PublicActions;
  public chain: "testnet" | "mainnet";
  public projectConfig?: ProjectConfig;

  constructor(privateKey: Address, chain: "mainnet" | "testnet") {
    this.account = privateKeyToAccount(privateKey);
    this.chain = chain;
    this.client = createWalletClient({
      chain: chain == "mainnet" ? mantle : mantleSepoliaTestnet,
      transport: http(),
      account: this.account,
    }).extend(publicActions);
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
    if (this.chain === "mainnet") {
      return await executeSwap(
        this,
        fromTokenAddress,
        toTokenAddress,
        amount,
        slippagePercentage,
      );
    }
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
  async get1inchQuote(
    fromToken: Address,
    toToken: Address,
    amount: string,
  ) {
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
  async getUniswapQuote(
    fromToken: Address,
    toToken: Address,
    amount: string,
  ) {
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

  async lendleWithdraw(
    tokenAddress: Address,
    amount: string,
    to?: Address,
  ) {
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
    return METH_TOKEN[this.chain];
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

}
