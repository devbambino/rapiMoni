'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useSignMessage, usePublicClient } from 'wagmi';
import { SiweMessage } from 'siwe';
import { ConnectWallet } from '@coinbase/onchainkit/wallet'; // Base OnchainKit’s <Wallet />

export default function AuthPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { signMessageAsync } = useSignMessage();

  // 1. Prompt SIWE when wallet connects
  useEffect(() => {
    async function signInWithEthereum() {
      if (!address || !publicClient) return;
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to RapiMoni',
        uri: window.location.origin,
        version: '1',
        chainId: await publicClient.getChainId(),
        nonce: Date.now().toString(),
      });
      const signature = await signMessageAsync({ message: message.prepareMessage() });
      // TODO: send `message` + `signature` to backend for verification per EIP-4361
      router.push('/pay');
    }
    if (isConnected) signInWithEthereum();
  }, [address, isConnected, publicClient, signMessageAsync, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Connect Your Wallet</h1>
      <ConnectWallet
        onConnect={() => {/* useAccount hook triggers SIWE */}}
      />
      <p className="mt-4 text-center max-w-xs">
        Use your Coinbase Smart Wallet to securely sign in. No seed phrase or extension needed.
      </p>
    </div>
  );
}
