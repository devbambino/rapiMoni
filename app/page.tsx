"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TabBar from '@/components/TabBar';
import { HowItWorks, Step } from '@/components/HowItWorks';
import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { cbWalletConnector } from "@/wagmi";
import { useRouter } from 'next/navigation';
import { Wallet } from "lucide-react";

//https://github.com/wilsoncusack/wagmi-scw/
export default function Home() {
  const router = useRouter();
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  // define each role’s steps once
  const customerSteps: Step[] = [
    { step: '1', title: 'Pay', desc: 'Scan QR / URL → confirm → complete payment or BNPL flow.' },
    { step: '2', title: 'BNPL Collateral', desc: 'Deposit 120% USDC → one active microloan.' },
    { step: '3', title: 'Repay & Unlock', desc: 'Monthly zero-interest repayments → unlock USDC.' },
  ];

  const merchantSteps: Step[] = [
    { step: '1', title: 'Charge', desc: 'Generate QR / URL with payment details.' },
    { step: '2', title: 'BNPL', desc: 'Enable customer microloans with your favorite terms.' },
    { step: '3', title: 'Manage', desc: 'Check payments received, and withdraw balances.' },
  ];

  const lenderSteps: Step[] = [
    { step: '1', title: 'Deposit', desc: 'Deposit funds in MXNe' },
    { step: '2', title: 'Yield', desc: 'View APY & claimable fees, 90% of loan fees' },
    { step: '3', title: 'Manage', desc: 'Withdraw funds or claimable yield' },
  ];

  useEffect(() => {
    if (isConnected) router.push('/manage');
  }, [address, isConnected, router]);

  return (
    <>
      <main className="mt-20 mb-20 md:mb-0">
        {/* Hero */}
        <section className="flex flex-col bg-primary text-white items-center text-center py-24 px-4">
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-secondary">
            Empowering Purchases, Empowering You
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Scan a QR or click a link to pay instantly in MXNe/USDC. Or choose zero-interest BNPL—one loan at a time, with USDC collateral, and yield.
          </p>
          <Button
                onClick={() => connect({ connector: cbWalletConnector })}
                variant="gradient"
                size="xl"
                className="flex items-center py-2 px-4 gap-1.5 mt-8 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full"
              >
                <Wallet className="h-4 w-4 text-[#50e2c3] hover:text-gray-900" />
                Get Started
              </Button>
        </section>

        {/* Partners / Trust Logos */}
        <section
          id="partners"
          className="mt-10 flex flex-wrap justify-center items-center gap-12 bg-primary/80 py-8 px-4"
        >
          {/* Replace with real SVGs */}
          <Image
            src="/partners/aerodrome.svg"
            alt="Aerodrome"
            width={80}
            height={40}
          />
          <Image
            src="/partners/chainlink.svg"
            alt="Chainlink"
            width={80}
            height={40}
          />
          <Image
            src="/partners/coinbase.svg"
            alt="Coinbase"
            width={80}
            height={40}
          />
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-4 py-20 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'QR/URL Payments', desc: 'Scan or click to pay—no app needed.' },
            { title: 'One-Loan BNPL', desc: 'Single active microloan with zero interest, sponsored by merchants.' },
            { title: 'Swaps', desc: 'Seamless USDC↔MXNe via Aerodrome.' },
            { title: 'Multi-Rail Cash', desc: 'USDC ↔ local fiat via Coinbase OffRamp.' },
            { title: 'Lender Rewards', desc: '90% loan fees to lenders, daily claims.' },
            { title: 'Secure Collateral', desc: '120% USDC locked, Chainlink-backed pricing.' },
          ].map((f) => (
            <div key={f.title} className="p-6 bg-primary/90 rounded-lg">
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-base">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* How It Works */}
        <HowItWorks
          id="customers"
          heading="How It Works: Customers"
          steps={customerSteps}
        />

        {/* How It Works */}
        <HowItWorks
          id="merchants"
          heading="How It Works: Merchants"
          steps={merchantSteps}
        />

        {/* How It Works */}
        <HowItWorks
          id="lenders"
          heading="How It Works: Lenders"
          steps={lenderSteps}
        />

      </main>
    </>
  );
}
