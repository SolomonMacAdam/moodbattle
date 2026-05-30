import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

export const BASE_APP_ID = "";

// Replace with the ERC-8021 builder code encoded string after base.dev verifies the app.
export const BASE_BUILDER_DATA_SUFFIX = "0x" as `0x${string}`;

export const baseAttribution = {
  dataSuffix: BASE_BUILDER_DATA_SUFFIX,
};

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: "MoodBattle",
      appLogoUrl: "/moodbattle.svg",
    }),
  ],
  multiInjectedProviderDiscovery: true,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [base.id]: http(),
  },
});
