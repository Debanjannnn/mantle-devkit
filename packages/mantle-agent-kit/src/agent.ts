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
import {
  aaveSupply as executeAaveSupply,
  aaveWithdraw as executeAaveWithdraw,
  aaveBorrow as executeAaveBorrow,
} from "./tools/aave";
import { crossChainSwapViaSquid, getSquidRoute } from "./tools/squid";
import {
  bridgeViaStargate,
  getStargateBridgeQuote,
} from "./tools/stargate";

export class MNTAgentKit {
  public account: PrivateKeyAccount;
  public client: WalletClient<Transport, Chain, PrivateKeyAccount> &
    PublicActions;
  public chain: "testnet" | "mainnet";

  constructor(privateKey: Address, chain: "mainnet" | "testnet") {
    this.account = privateKeyToAccount(privateKey);
    this.chain = chain;
    this.client = createWalletClient({
      chain: chain == "mainnet" ? mantle : mantleSepoliaTestnet,
      transport: http(),
      account: this.account,
    }).extend(publicActions);
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

  // Aave V3 Lending
  async aaveSupply(tokenAddress: Address, amount: string) {
    return await executeAaveSupply(this, tokenAddress, amount);
  }

  async aaveWithdraw(
    tokenAddress: Address,
    amount: string,
    to?: Address,
  ) {
    return await executeAaveWithdraw(this, tokenAddress, amount, to);
  }

  async aaveBorrow(
    tokenAddress: Address,
    amount: string,
    interestRateMode: 1 | 2 = 2,
    onBehalfOf?: Address,
  ) {
    return await executeAaveBorrow(
      this,
      tokenAddress,
      amount,
      interestRateMode,
      onBehalfOf,
    );
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

  // Stargate Cross-chain Bridge
  async getStargateBridgeQuote(
    tokenAddress: Address,
    amount: string,
    dstChainId: number,
    slippage: number = 0.1,
  ) {
    return await getStargateBridgeQuote(
      this,
      tokenAddress,
      amount,
      dstChainId,
      slippage,
    );
  }

  async bridgeViaStargate(
    tokenAddress: Address,
    amount: string,
    dstChainId: number,
    dstAddress: Address,
    srcPoolId?: number,
    dstPoolId?: number,
    slippage: number = 0.1,
  ) {
    return await bridgeViaStargate(
      this,
      tokenAddress,
      amount,
      dstChainId,
      dstAddress,
      srcPoolId,
      dstPoolId,
      slippage,
    );
  }
}
