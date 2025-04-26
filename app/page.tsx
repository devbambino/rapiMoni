import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <Head>
        <title>RapiMoni – Your credit, instantly</title>
        <meta name="description" content="Zero-interest BNPL microloans for LatAm users" />
      </Head>

      <main className="text-center p-6">
        <Image
          src="/logo-dark.png"
          alt="RapiMoni Logo"
          width={120}
          height={120}
          priority
        />
        <h1 className="mt-4 text-5xl font-bold text-secondary">
          RapiMoni
        </h1>
        <p className="mt-2 text-xl text-neutral">
          Your credit, instantly
        </p>
        <button className="mt-6 px-6 py-3 bg-secondary text-primary rounded-lg font-semibold hover:bg-accent transition">
          Get Early Access
        </button>
      </main>
    </div>
  );
}
