import Head from "next/head";
import Image from "next/image";

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
        <nav className="fixed top-0 w-full bg-primary/95 backdrop-blur-sm z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
            <Image
              src="/logo-dark.png"
              alt="RapiMoni Logo"
              width={107}
              height={36}
            />
            <ul className="hidden md:flex space-x-8 text-lg">
              <li>
                <a href="#features" className="hover:underline">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:underline">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#partners" className="hover:underline">
                  Partners
                </a>
              </li>
            </ul>
            <button className="px-6 py-2 bg-secondary text-primary rounded-lg font-semibold hover:bg-accent transition">
              Get Early Access
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="pt-28 flex flex-col items-center text-center px-6">
          <Image
            src="/logo-dark.png"
            alt="RapiMoni Logo"
            width={240}
            height={240}
            priority
          />
          <h1 className="mt-6 text-5xl md:text-6xl font-bold text-secondary">
            Your credit, instantly
          </h1>
          <p className="mt-4 text-lg md:text-2xl max-w-2xl leading-relaxed">
            Zero-interest BNPL microloans in MXNe, backed by USDC collateral, with
            automatic liquidation and daily lender rewards.
          </p>
          <button className="mt-8 px-8 py-3 bg-secondary text-primary rounded-lg font-semibold hover:bg-accent transition">
            Get Started Free
          </button>
        </header>

        {/* Partners / Trust Logos */}
        <section
          id="partners"
          className="mt-20 flex flex-wrap justify-center items-center gap-12 bg-primary/80 py-8 px-4"
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

        {/* Feature Grid */}
        <section
          id="features"
          className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <h2 className="col-span-full text-4xl font-semibold text-center mb-10">
            Core Features
          </h2>

          {/* Grid cards */}
          {[
            {
              title: "Automatic Liquidation",
              desc: "On-chain swaps via Aerodrome’s USDC/MXNe pool if collateral dips below threshold.",
            },
            {
              title: "Yield Stacking",
              desc: "Idle USDC earns ~3–6% APR on Aave Base v3 and is distributed daily.",
            },
            {
              title: "Fair Fee Split",
              desc: "Merchant fees split 90% to lenders, 10% to RapiMoni Treasury.",
            },
            {
              title: "Zero-Interest Loans",
              desc: "Borrow MXNe with 120% USDC collateral, repay over 1–6 months with no interest.",
            },
            {
              title: "Secure Collateral",
              desc: "Over-collateralized USDC ensures lender security; Chainlink oracles power trust.",
            },
            {
              title: "Optional RMP Token",
              desc: "Phase 3 adds a gamified reward token backed by 50% of idle USDC yield.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-6 bg-primary/90 rounded-lg flex flex-col"
            >
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-base leading-snug">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="bg-primary/90 py-20 px-6 text-center"
        >
          <h2 className="text-4xl font-semibold mb-12">How It Works</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: "1",
                title: "Lend MXNe",
                desc: "Deposit MXNe to earn daily rewards from merchant fees.",
              },
              {
                step: "2",
                title: "Request Loan",
                desc: "Borrow MXNe instantly with 120% USDC collateral for purchases.",
              },
              {
                step: "3",
                title: "Repay & Unlock",
                desc: "Repay zero-interest monthly and reclaim your USDC collateral.",
              },
            ].map((s) => (
              <div key={s.step}>
                <div className="mx-auto mb-4 w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-xl font-bold">
                  {s.step}
                </div>
                <h4 className="text-xl font-bold mb-2">{s.title}</h4>
                <p className="text-base leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-16 bg-secondary text-primary">
          <h3 className="text-3xl font-semibold mb-4">
            Ready to get started?
          </h3>
          <button className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition">
            Join RapiMoni Today
          </button>
        </section>

        {/* Footer */}
        <footer className="bg-primary/80 text-neutral py-8 text-center">
          <p>© {new Date().getFullYear()} RapiMoni. All rights reserved.</p>
          <div className="mt-4 space-x-6">
            <a href="/terms" className="hover:underline">
              Terms
            </a>
            <a href="/privacy" className="hover:underline">
              Privacy
            </a>
            <a href="/contact" className="hover:underline">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
