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

## IMPORTANT!!!!

The app is working on Base Sepolia. You will need Sepolia ETH, USDC and Test MXNe for testing. 
For getting Test MXNe tokens you have two options:
1. I've created a smart contract faucet for Test MXNe tokens, deployed to Base Sepolia. You only need to send Sepolia ETH from your wallet to the SC's address(`0xc70D51E8b96bf8f7b11aE9Aa51083fFdB817Fc7F`) in Base Sepolia and the SC will automatically transfer back the corresponding amount of Test MXNe tokens(the FX rate is 1 ETH to 49000 MXNe). As a reference, for getting 100 Test MXNe you would need to send around 0.002 Sepolia ETH. Each wallet could receive up to 4000 Test MXNe tokens(around 200 USD), which would be more than enough for testing the app. The Faucet smart contract is located at `/contracts/TokenFaucet.sol`. For checking the real time liquidity of the faucet in Sepolia Basescan [click here](https://sepolia.basescan.org/address/0xc70D51E8b96bf8f7b11aE9Aa51083fFdB817Fc7F), which is currently around 40000 Test MXNe tokens.
2. Contact me at devbambinoacc@gmail.com with your ETH address and I will send you tokens.

All the smart contracts are located inside `/contracts`. There you could use `TestMXNe.sol` for deploying your own version of Test MXNe tokens.

The term period for the loans are scaled down to 2 min(120 secs) for testing, so 1 month of term adds 2 mins to the term inside the smart contract.

For checking the proof of deployment go to: [Proof of Deployment](#proof-of-deployment)

---

## Intro 
RapiMoni is a Layer-2 DeFi platform built on Base, designed to bring seamless payments and zero-interest microloans to underbanked communities in Latin America. With just a web browser and a wallet, merchants can generate QR codes or URL links to accept payments in local stablecoins—MXNe (pegged to MXN)—and users can choose to pay on the spot or tap into a Buy-Now-Pay-Later microloan collateralized with USDC.

Check RapiMoni out at: www.rapimoni.com

---

## Quick Demo  

[▶️ View Demo on YouTube](https://youtu.be/epzRZL6Aldc)
_Check out a quick walkthrough of QR/URL payments and microloan flows for Mexico._

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

## Proof Of Deployment

### RapiMoni Contracts in Base Sepolia
```bash
NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS=0xc1Cde6Fb555cdC4d58e6b41c4754D5Fc8bc61531
NEXT_PUBLIC_FEE_POOL_ADDRESS=0xF4a53704D6267FA9842639F09397E079BFE75F52
NEXT_PUBLIC_MANAGER_ADDRESS=0xd75f49DbF59aa7cc59c41066122b255eBfA47260
#Test Tokens
NEXT_PUBLIC_MXNE_ADDRESS=0x0cE47838bCf7A9643F8d572bd490163e2549C074
TEST_MXNE_FAUCET=0xc70D51E8b96bf8f7b11aE9Aa51083fFdB817Fc7F
```

### RapiMoni Contracts in Base Mainnet
```bash
NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS=0x6D3254e211378F11DFEe2F75a3A42825096ecAf7
NEXT_PUBLIC_FEE_POOL_ADDRESS=0x2aF37428C75Ef929a7B0973CEfC8C3BFfBbD39cA
NEXT_PUBLIC_MANAGER_ADDRESS=0x374B51C4966853012B631Df184839F11ca786950
```

### RapiMoni Contracts transactions in Base Mainnet
Here you could see the approve, deposit, and withdraw transactions in RapiMoni's Liquidity Pool contract deployed to Base Mainnet, demostrating how a lender could provide liquidity in real MXNe tokens to enable the BNPL option for the users(borrowers) and safely withdraw their tokens after the locked in period is completed(in our case 12 mins after the deposit is made):
https://basescan.org/address/0x6d3254e211378f11dfee2f75a3a42825096ecaf7

---

## Installation  
```bash
git clone https://github.com/devbambino/rapimoni.git
cd rapimoni
npm install
```

- Create a `.env` with your keys and copy `.env.template`:


- Start the dev server:

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
| **Phase 3** | Oracle integration, multi-rail off ramps, comprehensive testing.         |
| **Phase 4** | Mainnet deployment & merchant partnerships.                                 |
| **Future**  | YieldManager on Aave, RewardsManager, MONI token launch.                    |

---

## Acknowledgments

* Special thanks to the Brale(MXNe), Aerodrome, Coinbase and Base team for building a wonderful suit of tools that made this project possible.

---
