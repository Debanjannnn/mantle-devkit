import {
  createWalletClient,
  http,
  type Chain,
  type Transport,
  type WalletClient,
} from "viem";
import {
  privateKeyToAccount,
  type Address,
  type PrivateKeyAccount,
} from "viem/accounts";
import { mantle, mantleSepoliaTestnet } from "viem/chains";

export class MNTAgentKit {
  public account: PrivateKeyAccount;
  public client: WalletClient<Transport, Chain, PrivateKeyAccount>;

  constructor(privateKey: Address, chain: "mainnet" | "testnet") {
    this.account = privateKeyToAccount(privateKey);
    this.client = createWalletClient({
      chain: chain == "mainnet" ? mantle : mantleSepoliaTestnet,
      transport: http(),
      account: this.account,
    });
  }
}
