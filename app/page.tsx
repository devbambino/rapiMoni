import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <Head>
        <title>RapiMoni – Your credit, instantly</title>
        <meta
          name="description"
          content="Instant, zero-interest BNPL microloans with automatic liquidation and yield stacking."
        />
      </Head>

      <div className="min-h-screen bg-primary text-white flex flex-col">
        {/* Nav Bar */}
        <nav className="flex items-center justify-between px-8 py-4 bg-primary/90 fixed w-full top-0 z-50">
          <Image src="/logo-dark.png" alt="RapiMoni Logo" width={40} height={40} />
          <ul className="hidden md:flex space-x-8 text-lg">
            <li><a href="#features" className="hover:underline">Features</a></li>
            <li><a href="#how-it-works" className="hover:underline">How It Works</a></li>
            <li><a href="#partners" className="hover:underline">Partners</a></li>
          </ul>
          <button className="px-6 py-2 bg-secondary text-primary rounded-lg font-semibold hover:bg-accent transition">
            Get Early Access
          </button>
        </nav>

        {/* Hero Section */}
        <header className="flex flex-col items-center justify-center text-center py-40 px-6">
          <Image
            src="/logo-dark.png"
            alt="RapiMoni Logo"
            width={120}
            height={120}
            priority
          />
          <h1 className="mt-6 text-6xl font-bold text-secondary">
            Your credit, instantly
          </h1>
          <p className="mt-4 text-2xl max-w-2xl">
            Zero-interest microloans in MXNe with automatic liquidation and daily lender rewards.
          </p>
          <button className="mt-8 px-8 py-3 bg-secondary text-primary rounded-lg font-semibold hover:bg-accent transition">
            Get Started Free
          </button>
        </header>

        {/* Partners / Trust Logos */}
        <section id="partners" className="flex items-center justify-center space-x-12 py-12 bg-primary/80">
          {/* Replace src and alt with actual partner logos */}
          <Image src="/partners/aerodrome.svg" alt="Aerodrome Finance" width={80} height={40} />
          <Image src="/partners/aave.svg" alt="Aave Base v3" width={80} height={40} />
          <Image src="/partners/chainlink.svg" alt="Chainlink" width={80} height={40} />
          <Image src="/partners/coinbase.svg" alt="Coinbase" width={80} height={40} />
        </section>

        {/* Core Features */}
        <section id="features" className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-semibold mb-8 text-center">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-primary/90 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Automatic Liquidation</h3>
              <p>On-chain swaps via Aerodrome’s USDC/MXNe pool if collateral dips below threshold.</p>
            </div>
            <div className="p-6 bg-primary/90 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Yield Stacking</h3>
              <p>Idle USDC earns ~3–6% APR on Aave Base v3 and is distributed daily to lenders.</p>
            </div>
            <div className="p-6 bg-primary/90 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Fair Fee Split</h3>
              <p>Merchant fees split 90% to lenders, 10% to RapiMoni Treasury for sustainability.</p>
            </div>
            <div className="p-6 bg-primary/90 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Zero-Interest Loans</h3>
              <p>Borrow MXNe with 120% USDC collateral, repay over 1–6 months with no interest.</p>
            </div>
            <div className="p-6 bg-primary/90 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Secure Collateral</h3>
              <p>Over-collateralized USDC ensures lender security; Chainlink oracles power trust.</p>
            </div>
            <div className="p-6 bg-primary/90 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Optional RMP Token</h3>
              <p>Phase 3 adds a gamified reward token backed by 50% of idle USDC yield.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-primary/90 py-20 px-6">
          <h2 className="text-4xl font-semibold mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-secondary rounded-full flex items-center justify-center">1</div>
              <h4 className="text-xl font-bold mb-2">Lend MXNe</h4>
              <p>Deposit MXNe to earn daily rewards from merchant fees.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-secondary rounded-full flex items-center justify-center">2</div>
              <h4 className="text-xl font-bold mb-2">Request Loan</h4>
              <p>Borrow MXNe instantly with 120% USDC collateral for purchases.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-secondary rounded-full flex items-center justify-center">3</div>
              <h4 className="text-xl font-bold mb-2">Repay & Unlock</h4>
              <p>Repay zero-interest monthly and reclaim your USDC collateral.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-16 bg-secondary text-primary">
          <h3 className="text-3xl font-semibold mb-4">Ready to get started?</h3>
          <button className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition">
            Join RapiMoni Today
          </button>
        </section>

        {/* Footer */}
        <footer className="bg-primary/80 text-neutral py-8 text-center">
          <p>© {new Date().getFullYear()} RapiMoni. All rights reserved.</p>
          <div className="mt-4 space-x-6">
            <a href="/terms" className="hover:underline">Terms</a>
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/contact" className="hover:underline">Contact</a>
          </div>
        </footer>
      </div>
    </>
  )
}
