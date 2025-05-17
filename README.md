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

## Intro 
RapiMoni is a Layer-2 DeFi platform built on Base, designed to bring seamless payments and zero-interest microloans to underbanked communities in Latin America. With just a web browser and a wallet, merchants can generate QR codes or URL links to accept payments in local stablecoins—MXNe (pegged to MXN)—and users can choose to pay on the spot or tap into a Buy-Now-Pay-Later microloan collateralized with USDC.

---

## Quick Demo  
![RapiMoni Demo](./docs/rapimoni-demo.gif)  
_Check out a quick walkthrough of QR payments and microloan flows._

---

## Problem
* **Massive Underbanking**: Over 1.4 billion adults globally lack access to formal banking services, especially in LATAM.
* **Fragmented Payment Infrastructure**: High fees, volatile currencies, and limited local rails make digital commerce and cross-border remittances expensive.
* **No Credit Access**: Underbanked consumers lack affordable, accessible credit products to smooth consumption or bridge cash-flow gaps.

---

## Solution 
RapiMoni tackles these challenges by combining:
* **QR/URL-Based Payments** (no app required): Merchants deploy dynamic on-chain invoices; customers pay in MXNe or USDC.
* **Zero-Interest Microloans**: One active loan per user, collateralized at 120% USDC, repaid over 1–6 months. Merchant fees fund the model—no interest for users.
* **On-Chain Swaps**: If a customer lacks local stablecoin, they can swap USDC→MXNe via Aerodrome pools.
* **Lender Yield**: 90% of microloan fees flow to liquidity providers (MXNe depositors); 10% to protocol treasury.
* **Future Extensions**: Idle USDC collateral can earn Aave yield, 50% of which could back a native MONI token for rewards and governance.

---

## Features  
### 1. Instant QR/URL Payments  
- Merchants generate a QR code or share a URL with payment details.  
- Customers open the link or scan the QR → review price & select payment type  → confirm USD value if no balance in MXNe → payment sent in MXNe or USDC.  

### 2. On-Chain Swaps  
- If customer balance isn’t in the merchant’s preferred currency, a swap using Aerodrome is offered.  
- Uses **Aerodrome** Mix of USDC/MXNe & USDC/BRZ pools for optimized rates and liquidity.

### 3. Zero-Interest Microloans  
- Users select BNPL, choose term (1–6 months), deposit 120% USDC collateral.  
- Receive MXNe instantly; repay monthly with zero interest; merchant covers microloan fees.  

### 4. Multi-Rail Cash In/Out  
- Via **Coinbase On/OffRamp**, convert between USDC and local fiat in seconds.  

### 5. Lender Yield  
- Merchant microloan fees (1–6% per month) split: 90% → lenders, and 10% → protocol's treasury.  
- (Future) On-chain liquidation via Aerodrome pools if monthly repayment is missed.  

### 6. Yield Stacking (Future)  
- Idle USDC supplies to **Aave**, ~3–6% APY.  

### 7. MONI Token Rewards (Future)  
- Fraction of idle yield(50%) backs a native **MONI** token for gamified staking and governance.

---

## Architecture Overview

### 1. LiquidityPool

* **Token**: MXNe
* **Function**: Single-sided deposits mint “shares,” track balances; withdrawals burn shares; disburse and collect flows integrate with the loan manager.

### 2. MicroloanManager

* **Collateral**: Users deposit USDC (120% of purchase amount), open loan to receive MXNe instantly.
* **Repayment**: Monthly zero-interest payments; on full repayment, collateral unlocked.
* **Liquidation**: Overdue loans can be liquidated by seizing collateral.

### 3. FeePool

* **Fee Collection**: Aggregates merchant-paid fees from BNPL flows.
* **Accrual & Distribution**: Splits fees—90% claimable by liquidity providers pro-rata, 10% to treasury. Enforces claim cooldown based on loan term.

#### Data & Integration

* **Oracles**: USD/MXN feed (or fallback) for pricing and collateral calculations.
* **Swaps**: Aerodrome CLPool for USDC↔MXNe swapping when needed.
* **Frontend**: React app with WAGMI hooks for ManagePage, PayPage, ChargePage, LendPage, BorrowPage, leveraging the above contracts.

#### Future
* **LiquidationHook**: Aerodrome router integration for auto-swaps on default.
* **RewardsManager**: Aave integration, idle yield tracking, and MONI distribution.

---

## Installation  
```bash
git clone https://github.com/devbambino/rapimoni.git
cd rapimoni
npm install
```

Create a `.env.local` with your keys:

```bash
NEXT_PUBLIC_AERODROME_SWAP_POOL_FROM_MXNE_URL=
NEXT_PUBLIC_AERODROME_SWAP_POOL_TO_MXNE_URL=
NEXT_PUBLIC_COINBASE_OFFRAMP_APPID=
NEXT_PUBLIC_COINBASE_OFFRAMP_URL="https://pay.coinbase.com/v3/sell/input?appId=&partnerUserId=testUser&addresses={"0x...":["base"]}&assets=["USDC"]&redirectUrl=https://www.rapimoni.com/manage"
```

Start the dev server:

```bash
npm run dev
```

---

## Usage

### Merchant Flow

1. Log in with Coinbase Wallet.
2. Go to /Charge and generate QR/URL with `amount`, `description`, `currency`, `allow fallback` check, and optional `loan` settings.
3. Share link or display QR for customer checkout.

### Customer Flow

1. Go to /Pay and scan QR or open URL.
2. Select “Pay directly” or Pay with BNPL”
3. For BNPL: approve and deposit USDC collateral, and receive MXNe/BRZ.
4. Confirm purchase.
5. Go to /Borrow and repay monthly as scheduled.

### Lender Flow

1. Go to /Lend and deposit MXNe.
2. View accrued yield (90% of loan fees).
3. Claim yield.

---

## Roadmap

| Phase       | Deliverables                                                                |
| ----------- | --------------------------------------------------------------------------- |
| **Phase 1** | QR/URL payments, merchant/customer/lender flows.                            |
| **Phase 2** | Microloan flow. Smart contracts: LiquidityPool, MicroloanManager, FeePool.  |
| **Phase 3** | Oracle integration, multi-rail on/off ramps, comprehensive testing.         |
| **Phase 4** | Mainnet deployment & merchant partnerships.                                 |
| **Future**  | YieldManager on Aave, RewardsManager, MONI token launch.                    |

---

## Acknowledgments

* Special thanks to the Coinbase and Base team for building a wonderful suit of tools that made this project possible.

---
