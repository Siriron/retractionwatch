// Single plain constant for the deployed contract address — no .env,
// no .env.example, no Vercel environment variable. Confirmed standing
// pattern for this project (see project knowledge, section 7): changing
// the deployed address means editing this one line, nowhere else.
export const CONTRACT_ADDRESS = '0xE7f4D6267903e346578cb1F5748ba61C1f30120b';

export const STUDIONET_CONFIG = {
  chainId: '0xF22F', // 61999
  chainName: 'GenLayer StudioNet',
  rpcUrls: ['https://studio.genlayer.com/api'],
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  blockExplorerUrls: ['https://explorer-studio.genlayer.com'],
};

export const EXPLORER_TX_URL = (hash: string) =>
  `https://explorer-studio.genlayer.com/tx/${hash}`;

export const EXPLORER_ADDRESS_URL = (address: string) =>
  `https://explorer-studio.genlayer.com/address/${address}`;

// This project targets StudioNet exclusively — no network toggle, no
// Bradbury wiring (section 7: "a network toggle with only one real
// network behind it is worse than no toggle at all").
