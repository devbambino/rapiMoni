import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet, walletConnect} from "wagmi/connectors";
//import { connectorsForWallets } from '@rainbow-me/rainbowkit';
//import { injectedWallet } from '@rainbow-me/rainbowkit/wallets';

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;
 
export const cbWalletConnector = coinbaseWallet({
  appName: "RapiMoni",
  preference: "all",
});

export const wcWalletConnector = walletConnect({projectId});

/*const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [injectedWallet],
    },
  ],
  {
    appName: 'RapiMoni',
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  }
);*/
 
export const config = createConfig({
  chains: [baseSepolia],
  // turn off injected provider discovery
  multiInjectedProviderDiscovery: false,
  connectors: [wcWalletConnector, cbWalletConnector],//[cbWalletConnector],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
});
 
declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}