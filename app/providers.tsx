"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
//import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import Layout from "@/components/Layout";
import { config } from "@/wagmi";
import { ToastProvider } from '@/components/ui/toastprovider';

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <ToastProvider>{props.children}</ToastProvider>
        </Layout>
      </QueryClientProvider>
    </WagmiProvider>
  );
}