import Image from 'next/image';
import { useState } from 'react';
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { WalletConnect } from '@/components/WalletConnect';

export default function Header() {
  const [isOpen, setOpen] = useState(false);
  const account = useAccount();

  return (
    <header className="fixed top-0 w-full bg-primary/95 backdrop-blur-sm z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <a href="/">
          <Image src="/logo-sm.png" alt="RapiMoni" width={120} height={32} />
        </a>
        {/* Desktop Nav */}
        {account.status === "connected" ? (
          <nav className="hidden md:flex space-x-6 text-white">
            <a href="/pay" className="hover:underline">Pay</a>
            <a href="/charge" className="hover:underline">Charge</a>
            <a href="/borrow" className="hover:underline">Borrow</a>
            <a href="/lend" className="hover:underline">Lend</a>
            <a href="/manage" className="hover:underline">Manage</a>
          </nav>
        ) : (
          <nav className="hidden md:flex space-x-6 text-white">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#customers" className="hover:underline">Customers</a>
            <a href="#merchants" className="hover:underline">Merchants</a>
            <a href="#lenders" className="hover:underline">Lenders</a>
          </nav>

        )}
        <div className="hidden md:block">
          <WalletConnect />
        </div>
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>
      {/* Mobile Nav */}
      {isOpen && (
        <nav className="md:hidden bg-primary/90 px-4 py-2 space-y-2">
          {account.status === "connected" ? (
            ['pay', 'charge', 'borrow', 'lend', 'manage'].map((id) => (
              <a key={id} href={`#${id}`} className="block text-white py-1 hover:underline">
                {id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </a>
            ))
          ) : (
            ['features', 'customers', 'merchants', 'lenders'].map((id) => (
              <a key={id} href={`#${id}`} className="block text-white py-1 hover:underline">
                {id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </a>
            ))
          )
          }
          <div className="mt-2">
            <WalletConnect />
          </div>
        </nav>
      )}
    </header>
  );
}
