import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';
import { CONTRACT_ADDRESS, STUDIONET_CONFIG, EXPLORER_TX_URL } from '../config/chains';

// Confirmed working pattern (project knowledge, section 7): a real
// Error subclass carrying the tx hash and a timeout flag as real
// properties, not just a string message, so the UI can distinguish a
// timeout from a genuine rejection.
export class TimeoutError extends Error {
  txHash: string;
  isTimeout = true;
  constructor(hash: string) {
    super(
      `Consensus is taking longer than expected. Your transaction was submitted — check its status directly: ${EXPLORER_TX_URL(
        hash
      )}`
    );
    this.txHash = hash;
    this.name = 'TimeoutError';
  }
}

async function ensureChain(): Promise<void> {
  const eth = (window as any).ethereum;
  if (!eth) return;
  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: STUDIONET_CONFIG.chainId }],
    });
  } catch (err: any) {
    if (err && err.code === 4902) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [STUDIONET_CONFIG],
      });
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: STUDIONET_CONFIG.chainId }],
      });
    } else if (err && err.code === -32002) {
      await new Promise((r) => setTimeout(r, 3000));
    } else {
      throw err;
    }
  }
}

export function useGenLayer() {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const readClientRef = useRef(createClient({ chain: studionet }));

  // On mount: silently check eth_accounts (never eth_requestAccounts,
  // which would prompt) to reconnect without a click if already
  // authorized, and subscribe to accountsChanged to stay in sync.
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    eth
      .request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts[0]) setAccount(accounts[0]);
      })
      .catch(() => {});
    const handleAccountsChanged = (accounts: string[]) => setAccount(accounts[0] || null);
    if (eth.on) eth.on('accountsChanged', handleAccountsChanged);
    return () => {
      if (eth.removeListener) eth.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      throw new Error('No wallet found. Install a browser wallet extension to continue.');
    }
    setConnecting(true);
    try {
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0] || null);
    } finally {
      setConnecting(false);
    }
  }, []);

  const getWriteClient = useCallback(async () => {
    if (!account) throw new Error('Wallet not connected.');
    await ensureChain();
    // account is the connected wallet's plain address string — never
    // wrapped in createAccount(), which expects a private key, not an
    // address (confirmed live bug, section 7).
    const client = createClient({
      chain: studionet,
      account: account as `0x${string}`,
      provider: (window as any).ethereum,
    });
    // Defensive: some SDK versions expose an extra connect() step.
    if (typeof (client as any).connect === 'function') {
      try {
        await (client as any).connect('studionet');
      } catch {
        // Not fatal — guarded because not every SDK version has this.
      }
    }
    return client;
  }, [account]);

  const readContract = useCallback(async (method: string, args: any[] = []) => {
    const raw = await readClientRef.current.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      functionName: method,
      args,
    });
    return JSON.parse(raw as string);
  }, []);

  const writeContract = useCallback(
    async (method: string, args: any[] = []) => {
      const client = await getWriteClient();
      const hash = await client.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: method,
        args,
        value: BigInt(0),
      });
      try {
        const receipt = await client.waitForTransactionReceipt({
          hash,
          status: TransactionStatus.ACCEPTED,
          retries: 120,
          interval: 4000,
        });
        return { hash, receipt };
      } catch (err) {
        throw new TimeoutError(hash);
      }
    },
    [getWriteClient]
  );

  return {
    account,
    connecting,
    connect,
    readContract,
    writeContract,
  };
}
