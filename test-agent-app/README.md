# Agent Kit Swap Demo

A Next.js application for swapping tokens on Mantle Network using the Mantle Agent Kit.

## Features

- **Agni Finance** - Primary DEX on Mantle with deep liquidity
- **Merchant Moe** - Alternative DEX with competitive rates
- **OpenOcean** - DEX aggregator for best prices (mainnet only)

## Getting Started

### Prerequisites

- Node.js 18+
- A wallet with MNT tokens for gas fees
- MetaMask browser extension

### Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Edit `.env` and add your private key:

```env
PRIVATE_KEY=your-private-key-here
NEXT_PUBLIC_NETWORK=testnet  # or "mainnet"
```

**Important:** Never commit your private key to version control!

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Connect Wallet** - Click "Connect Wallet" to connect your MetaMask
2. **Select Protocol** - Choose Agni, Merchant Moe, or OpenOcean
3. **Select Tokens** - Choose the tokens you want to swap
4. **Enter Amount** - Enter the amount to swap
5. **Execute** - Click "Execute Swap" to perform the transaction

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── swap/
│   │       └── route.ts    # Swap API endpoint
│   ├── page.tsx            # Main page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   ├── ui/
│   │   ├── magic-card.tsx  # Animated card component
│   │   └── blur-fade.tsx   # Fade animation
│   ├── swap-form.tsx       # Swap interface
│   └── transaction-result.tsx # Result display
├── lib/
│   ├── utils.ts            # Utility functions
│   └── tokens.ts           # Token configurations
└── types/
    └── index.ts            # TypeScript types
```

## Available Tokens

### Mainnet
- MNT (Native)
- WMNT (Wrapped MNT)
- USDT
- USDC
- WETH
- mETH

### Testnet
- MNT (Native)
- WMNT (Wrapped MNT)
- USDT

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

- [Mantle Agent Kit Documentation](https://mantle-devkit.vercel.app)
- [Mantle Network](https://mantle.xyz)
- [Agni Finance](https://agni.finance)
- [Merchant Moe](https://merchantmoe.com)
- [OpenOcean](https://openocean.finance)

## License

MIT
