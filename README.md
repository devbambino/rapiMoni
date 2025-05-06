<!-- Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/status-beta-blue" alt="status">
  <img src="https://img.shields.io/github/issues/devbambino/rapimoni" alt="issues">
  <img src="https://img.shields.io/github/stars/devbambino/rapimoni" alt="stars">
  <img src="https://img.shields.io/github/license/devbambino/rapimoni" alt="license">
</p>

# RapiMoni  
<p align="center">
  <img src="./public/logo-sm.png" alt="RapiMoni Logo" width="160" />
</p>
<p align="center"><em>Empowering Purchases, Empowering You</em></p>

---

## Table of Contents  
1. [Overview](#overview)  
2. [Quick Demo](#quick-demo)  
3. [Features](#features)  
4. [Installation](#installation)  
5. [Usage](#usage)  
6. [Architecture](#architecture)  
7. [Roadmap](#roadmap)  
8. [Contributing](#contributing)  
9. [License](#license)  

---

## Overview  
RapiMoni is a Base L2 DeFi platform tailored for Latin America, offering:  
- **QR/URL–Based Payments:** Seamlessly pay merchants by scanning a dynamic QR code or clicking a payment link (no apps required).  
- **Zero-Interest Microloans:** BNPL in MXNe (MXN stablecoin) or BRZ (BRL stablecoin), collateralized with USDC, funded by merchant fees.  
- **Automated On-Chain Swaps:** Currency-abstracted payments via Aerodrome Finance pools with programmable smart contracts.  
- **Yield Stacking(Future):** Idle USDC collateral earns ~3–6% APY on Aave, distributed 50% to users as rewards in MONI tokens.  
- **Tokenomics(Future):** Gamified MONI token backed by idle yield for extra incentives.

---

## Quick Demo  
![RapiMoni Demo](./docs/rapimoni-demo.gif)  
_Check out a quick walkthrough of QR payments and microloan flows._

---

## Features  
### 1. Instant QR/URL Payments  
- Merchants generate a QR code or share a URL with payment details.  
- Customers open the link or scan the QR → review price & currency → confirm → pay with on-wallet or in-app → funds sent in MXNe/BRZ/USDC.  

### 2. Automated On-Chain Swaps  
- If customer balance isn’t in the merchant’s preferred currency, a swap is triggered.  
- Uses **Aerodrome** Mix of USDC/MXNe & USDC/BRZ pools for optimized rates and liquidity.

### 3. Zero-Interest Microloans  
- Users select BNPL, choose term (1–6 months), deposit 120% USDC collateral.  
- Receive MXNe/BRZ instantly; repay monthly with zero interest; merchant covers microloan fees.  

### 4. Multi-Rail Cash In/Out  
- Via **Coinbase On/OffRamp**, convert between USDC and local fiat in seconds.  

### 5. Lender Yield  
- Merchant microloan fees (1–6% per month) split 90% → lenders, 10% → protocol treasury.  
- On-chain liquidation via Aerodrome pools if montly repayment is missed.  

### 6. Yield Stacking (Future)  
- Idle USDC supplies to **Aave**, ~3–6% APY.  

### 7. MONI Token Rewards (Future)  
- Fraction of idle yield(50%) backs a native **MONI** token for gamified staking and governance.

---

## Installation  
```bash
git clone https://github.com/devbambino/rapimoni.git
cd rapimoni
npm install
```

Create a `.env.local` with your keys:

```bash
NEXT_PUBLIC_AERODROME_ROUTER=0x...
NEXT_PUBLIC_CHAINLINK_FEED=0x...
NEXT_PUBLIC_AAVE_POOL=0x...
NEXT_PUBLIC_COINBASE_API_KEY=...
```

Start the dev server:

```bash
npm run dev
```

---

## Usage

### Merchant Portal

1. Log in with Coinbase Wallet.
2. Generate QR/URL with `amount`, `description`, `currency`, and optional `loan` settings.
3. Share link or display QR for customer checkout.

### Customer Flow

1. Scan QR or open URL.
2. Select “Pay Now” or “Use BNPL”
3. For BNPL: choose term, deposit USDC collateral, receive MXNe/BRZ.
4. Confirm purchase and repay monthly as scheduled.

### Lender Dashboard

1. Deposit MXNe/BRZ into **Liquidity Pool**.
2. View daily accrued yield (merchant fees).
3. Claim (or compound) yield.

---

## Architecture

![](./docs/architecture-diagram.png)

1. **LiquidityPool**: MXNe/BRZ deposits + share accounting.
2. **MicroloanManager**: USDC collateral, MXNe/BRZ disbursement, repayment scheduling.
3. **LiquidationHook**: Aerodrome router integration for auto-swaps on default.
4. **FeePool**: Aggregates merchant fees → 90% to lenders (FeeDistributor), 10% to Treasury.
5. **RewardsManager** (Future): Aave integration, idle yield tracking, and MONI distribution.

---

## Roadmap

| Phase       | Deliverables                                                                |
| ----------- | --------------------------------------------------------------------------- |
| **Phase 1** | QR/URL payments, merchant/customer/lender portals, base microloan flows.         |
| **Phase 2** | Smart contracts: LiquidityPool, MicroloanManager, FeePool, LiquidationHook. |
| **Phase 3** | Oracle integration, multi-rail on/off ramps, comprehensive testing.         |
| **Phase 4** | Mainnet deployment & merchant partnerships.                                 |
| **Future**  | YieldManager on Aave, RewardsManager, MONI token launch.                    |

---

## Acknowledgments

* Special thanks to the Coinbase and Base team for building a wonderful suit of tools that made this project possible.

---
