# MoodBattle

MoodBattle is a Base mini app for onchain mood faction battles. Users can choose a mood, release energy, boost any mood, reset their state, and watch the global power board update from the deployed contract.

## Stack

- Next.js App Router
- TypeScript
- Wagmi
- Viem
- Tailwind CSS

## Contract

Base contract: `0xe56f9079042F7c17B40e043E790D459C28B9c9f7`

## Wallets

The app uses native Wagmi configuration only:

- `injected()` for Base App embedded wallet, MetaMask, OKX, and other injected wallets
- `coinbaseWallet()` for Coinbase Wallet
- No RainbowKit
- No WalletConnect project ID

## Base Attribution

Offchain attribution is hardcoded in `src/app/layout.tsx`:

```tsx
<meta name="base:app_id" content="" />
```

Onchain attribution is configured in `src/lib/wagmi.ts` and passed explicitly to every write:

```ts
export const BASE_BUILDER_DATA_SUFFIX = "0x" as `0x${string}`;
```

After base.dev verification, replace the empty app id and the builder data suffix, then redeploy.

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```
