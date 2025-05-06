"use client";

import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TabBar from '../components/TabBar';

export default function Home() {
  return (
    <>
      <Head>
        <title>RapiMoni – Empowering Purchases, Empowering You</title>
        <meta name="description" content="QR/URL payments & one-loan-at-once BNPL in MXNe/BRZ, backed by USDC." />
      </Head>
      <Header />
      <main className="mt-20 mb-20 md:mb-0">
        {/* Hero */}
        <section className="bg-primary text-white text-center py-24 px-4">
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-secondary">
            Empowering Purchases, Empowering You
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Scan a QR or click a link to pay instantly in MXNe/BRZ/USDC. Or choose zero-interest BNPL—one loan at a time, with USDC collateral, automated liquidation, and daily rewards.
          </p>
          <a href="/auth" className="inline-block mt-8 px-8 py-3 bg-secondary text-primary rounded-lg font-semibold hover:bg-accent transition">
            Get Started
          </a>
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
          <Image src="/partners/aave.svg" alt="Aave" width={80} height={40} />
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
            { title: 'Automated Swaps', desc: 'Seamless USDC↔MXNe/BRZ via Aerodrome.' },
            { title: 'Multi-Rail Cash', desc: 'USDC ↔ local fiat via Coinbase On/OffRamp.' },
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
        <section id="customers" className="bg-primary/90 py-20 px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-12">How It Works: Customers</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Pay', desc: 'Scan QR / URL → confirm → complete payment or BNPL flow.' },
              { step: '2', title: 'BNPL Collateral', desc: 'Deposit 120% USDC → one active microloan.' },
              { step: '3', title: 'Repay & Unlock', desc: 'Monthly zero-interest repayments → unlock USDC.' },
            ].map((s) => (
              <div key={s.step}>
                <div className="mx-auto mb-4 w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-lg font-bold">{s.step}</div>
                <h4 className="text-lg font-semibold mb-2">{s.title}</h4>
                <p className="text-base">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="merchants" className="bg-primary/90 py-20 px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-12">How It Works: Merchants</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Charge', desc: 'Generate QR / URL with payment details.' },
              { step: '2', title: 'BNPL', desc: 'Enable customer microloans with your favorite terms.' },
              { step: '3', title: 'Manage', desc: 'Check payments received, and withdraw balances.' },
            ].map((s) => (
              <div key={s.step}>
                <div className="mx-auto mb-4 w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-lg font-bold">{s.step}</div>
                <h4 className="text-lg font-semibold mb-2">{s.title}</h4>
                <p className="text-base">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="lenders" className="bg-primary/90 py-20 px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-12">How It Works: Lenders</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Deposit', desc: 'Deposit funds in MXNe/BRZ' },
              { step: '2', title: 'Yield', desc: 'View APY & claimable fees, 90% of loan fees' },
              { step: '3', title: 'Manage', desc: 'Withdraw funds or claimable yield' },
            ].map((s) => (
              <div key={s.step}>
                <div className="mx-auto mb-4 w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-lg font-bold">{s.step}</div>
                <h4 className="text-lg font-semibold mb-2">{s.title}</h4>
                <p className="text-base">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        
      </main>
      <Footer />
      <TabBar />
    </>
  );
}
