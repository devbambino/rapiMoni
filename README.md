# RapiMoni

<p align="center">
  <img src="./public/logo-dark.png" alt="RapiMoni Logo" width="160" />
</p>

<p align="center"><em>Your credit, instantly</em></p>

---

## Description

RapiMoni is a Base Layer-2 DeFi Buy-Now-Pay-Later (BNPL) platform serving Latin America. It enables zero-interest microloans in MXNe (Mexican peso stablecoin) collateralized with USDC, offering swift payouts, automatic collateral liquidation, and yield stacking for lenders.

## Core Features

- **Zero-Interest Microloans**  
  Users deposit 120% USDC collateral to instantly receive MXNe for purchases.  
- **Automatic Liquidation**  
  On-chain liquidation via Aerodrome Finance’s USDC/MXNe Slipstream pool when collateral falls below threshold.  
- **Yield Stacking**  
  Idle USDC collateral earns ~3–6% APR by supplying to Aave Base v3, distributed daily.  
- **Fair Fee Split**  
  Merchant fees (1–6%) split 90% to lenders and 10% to the protocol treasury.  
- **Optional RMP Token (Phase 3)**  
  Gamified reward token backed by 50% of idle USDC yield.

## Problem

High inflation and currency devaluation erode savings in Latin America, while traditional credit solutions are costly or inaccessible for many underbanked users.

## Solution

RapiMoni offers instant, interest-free credit in local currency, with transparent on-chain processes, secure collateral management, and rewards for liquidity providers.

## Architecture

- **LiquidityPool**: Manages lender MXNe deposits and share accounting.  
- **MicroloanManager**: Handles USDC collateral locking, MXNe disbursement, repayment scheduling, and fee collection.  
- **LiquidationHook**: Integrates with Aerodrome’s router to auto-swap USDC→MXNe on default using Chainlink price feeds.  
- **YieldManager**: Supplies idle USDC to Aave Base v3 and tracks interest accrual.  
- **RewardsDistributor**: Splits merchant fees and idle yield, enabling daily lender claims.  
- **ProtocolTreasury**: Secures protocol’s 10% fee and 50% idle-yield revenue.

## Roadmap

| Phase        | Deliverables                                                                         |
|--------------|---------------------------------------------------------------------------------------|
| **Phase 1**  | Smart-contracts: LiquidityPool, MicroloanManager, FeePool, LiquidationHook setup.     |
| **Phase 2**  | YieldManager integration with Aave; Chainlink oracles; comprehensive testing.         |
| **Phase 3**  | Frontend dashboards (merchant, customer, lender); Testnet → Mainnet deployment.       |
| **Phase 4**  | *(Optional)* RMP token & ReserveVault; RewardsDistributor for gamified rewards.       |

## Tech Stack

- **Next.js (TypeScript)** – SSR, API routes, React Server Components  
- **TailwindCSS** – Utility-first styling  
- **Base (Ethereum L2)** – Low-cost, secure on-chain infrastructure  
- **Aerodrome Finance** – MXNe/USDC concentrated-liquidity pool for collateral swaps  
- **Aave Base v3** – USDC lending market for idle-collateral yield  
- **Chainlink** – MXNe/USDC price feeds for liquidation triggers  
- **Coinbase SDKs** – OnchainKit, Onramp, Wallet SDK for wallet onboarding

## Getting Started
```bash
git clone https://github.com/devbambino/rapimoni.git
cd rapimoni
npm install
npm run dev
```

Create a .env.local with:
```bash
NEXT_PUBLIC_AERODROME_ROUTER=0xYourAerodromeRouterAddress
NEXT_PUBLIC_CHAINLINK_FEED=0xYourChainlinkFeedAddress
NEXT_PUBLIC_AAVE_POOL=0xYourAavePoolAddress
```