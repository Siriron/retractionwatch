import { Component, ReactNode, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useGenLayer } from './hooks/useGenLayer';

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function Navbar() {
  const { account, connecting, connect } = useGenLayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/register', label: 'Register a paper' },
    { to: '/docs', label: 'Docs' },
  ];

  return (
    <header className="border-b border-brass/25 bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 focus-ring rounded" onClick={() => setMenuOpen(false)}>
          <img src="/favicon.svg" alt="" width={32} height={32} />
          <span className="font-display font-semibold text-lg tracking-tight text-ink">
            RetractionWatch
          </span>
        </Link>

        {/* Desktop nav — visible md and up */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`font-body text-sm focus-ring rounded ${
                location.pathname === l.to ? 'text-stamp font-medium' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <WalletButton account={account} connecting={connecting} connect={connect} />
        </nav>

        {/* Mobile: a real, working menu button — not a hidden nav item
            with no equivalent. Opens a full in-page panel below. */}
        <button
          className="md:hidden focus-ring rounded p-2 -mr-2"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {menuOpen ? (
              <path d="M4 4L18 18M18 4L4 18" stroke="#1C1B19" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6H19" stroke="#1C1B19" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 11H19" stroke="#1C1B19" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 16H19" stroke="#1C1B19" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu panel — the actual functioning equivalent to the
          desktop nav, not a decorative hamburger with nothing behind it. */}
      {menuOpen && (
        <div className="md:hidden border-t border-brass/20 bg-paper px-5 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="font-body text-base text-ink-soft focus-ring rounded"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-brass/15">
            <WalletButton account={account} connecting={connecting} connect={connect} />
          </div>
        </div>
      )}
    </header>
  );
}

function WalletButton({
  account,
  connecting,
  connect,
}: {
  account: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);

  if (account) {
    return (
      <span className="font-mono text-xs bg-paper-dim border border-brass/30 rounded px-3 py-1.5 text-ink-soft">
        {shortenAddress(account)}
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          setError(null);
          connect().catch((e) => setError(e.message || 'Could not connect wallet.'));
        }}
        disabled={connecting}
        className="focus-ring bg-stamp hover:bg-stamp-dim text-paper font-body text-sm font-medium rounded px-4 py-2 transition-colors disabled:opacity-60"
      >
        {connecting ? 'Connecting…' : 'Connect wallet'}
      </button>
      {error && <p className="text-xs text-stamp mt-1 font-body max-w-[220px]">{error}</p>}
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-brass/20 mt-24">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row justify-between gap-6 text-sm text-pencil font-body">
        <div>
          <p className="font-display text-ink font-medium mb-1">RetractionWatch</p>
          <p>Built on GenLayer · StudioNet</p>
        </div>
        <div className="flex flex-col sm:items-end gap-1">
          <a
            href="https://genlayer.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink focus-ring rounded"
          >
            genlayer.com
          </a>
          <a
            href="https://portal.genlayer.foundation/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink focus-ring rounded"
          >
            Portal submission
          </a>
          <Link to="/docs" className="hover:text-ink focus-ring rounded">
            Documentation
          </Link>
        </div>
      </div>
    </footer>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('RetractionWatch crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
          <p className="font-display text-2xl text-ink mb-2">Something tore.</p>
          <p className="font-body text-pencil max-w-md mb-6">
            This page hit an error it couldn't recover from. Reloading usually fixes it — if it
            keeps happening, the wallet connection or network is a good next place to check.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="focus-ring bg-ink text-paper font-body text-sm rounded px-5 py-2.5"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <div className="min-h-screen bg-paper bg-paper-grain flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
