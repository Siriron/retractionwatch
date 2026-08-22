import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenLayer } from '../hooks/useGenLayer';
import { LoadingSpinner, TransactionError } from '../components/shared';
import { EXPLORER_TX_URL } from '../config/chains';

// Mirrors the contract's own _looks_like_doi / _looks_like_arxiv_id
// shape checks — client-side, so a person gets fast feedback before
// spending a transaction on something the contract would reject anyway.
// This is a courtesy check only; the contract's own assertion is the
// real source of truth.
function looksLikeDoi(id: string): boolean {
  return id.startsWith('10.') && id.includes('/');
}

function looksLikeArxivId(id: string): boolean {
  let stripped = id;
  const vIdx = stripped.lastIndexOf('v');
  if (vIdx > 0 && /^\d+$/.test(stripped.slice(vIdx + 1))) {
    stripped = stripped.slice(0, vIdx);
  }
  if (stripped.includes('.') && !stripped.includes('/')) {
    const [left, right] = stripped.split('.');
    return left.length === 4 && /^\d+$/.test(left) && /^\d{4,}$/.test(right || '');
  }
  if (stripped.includes('/')) {
    const right = stripped.split('/').pop() || '';
    return right.length === 7 && /^\d+$/.test(right);
  }
  return false;
}

type Phase = 'idle' | 'pending' | 'success' | 'error';

export default function RegisterPage() {
  const { account, connect, connecting, writeContract } = useGenLayer();
  const [paperId, setPaperId] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<unknown>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const navigate = useNavigate();

  const trimmed = paperId.trim();
  const validShape = trimmed.length > 0 && (looksLikeDoi(trimmed) || looksLikeArxivId(trimmed));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validShape) return;
    setPhase('pending');
    setError(null);
    try {
      const { hash } = await writeContract('register_paper', [trimmed]);
      setTxHash(hash);
      setPhase('success');
    } catch (err) {
      setError(err);
      setPhase('error');
    }
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-16">
      <p className="font-mono text-xs text-brass tracking-widest uppercase mb-3">Step one</p>
      <h1 className="font-display font-semibold text-3xl text-ink mb-3">Register a paper</h1>
      <p className="font-body text-ink-soft mb-8 leading-relaxed">
        A DOI (e.g. <span className="font-mono text-sm">10.1038/nature12373</span>) or an arXiv ID
        (e.g. <span className="font-mono text-sm">1706.03762</span>). No URL, no free-text
        description — the identifier is the only thing every later evidence fetch derives from.
      </p>

      {!account ? (
        <div className="border border-brass/30 bg-paper-dim/50 rounded-sm p-5">
          <p className="font-body text-sm text-ink-soft mb-3">Connect a wallet to register.</p>
          <button
            onClick={() => connect().catch((e) => setError(e))}
            disabled={connecting}
            className="focus-ring bg-ink text-paper font-body text-sm rounded px-5 py-2.5 disabled:opacity-60"
          >
            {connecting ? 'Connecting…' : 'Connect wallet'}
          </button>
          {error != null && phase === 'idle' && <TransactionError error={error} />}
        </div>
      ) : phase === 'success' ? (
        <div className="border border-verified/40 bg-verified/5 rounded-sm p-6">
          <p className="font-display text-lg text-ink mb-2">Registered.</p>
          <p className="font-body text-sm text-ink-soft mb-4">
            <span className="font-mono">{trimmed}</span> is now on-chain. Anyone can file a status
            check against it.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/paper/${encodeURIComponent(trimmed)}`)}
              className="focus-ring bg-stamp hover:bg-stamp-dim text-paper font-body text-sm rounded px-5 py-2.5"
            >
              View paper record
            </button>
            {txHash && (
              <a
                href={EXPLORER_TX_URL(txHash)}
                target="_blank"
                rel="noreferrer"
                className="focus-ring text-sm text-pencil underline self-center"
              >
                View transaction
              </a>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="paper_id" className="font-body text-sm text-ink-soft block mb-1.5">
              DOI or arXiv ID
            </label>
            <input
              id="paper_id"
              type="text"
              value={paperId}
              onChange={(e) => setPaperId(e.target.value)}
              placeholder="10.1038/nature12373"
              className="focus-ring w-full font-mono text-sm border border-brass/30 rounded-sm px-4 py-3 bg-white/60"
              disabled={phase === 'pending'}
            />
            {trimmed.length > 0 && !validShape && (
              <p className="text-xs text-stamp font-body mt-1.5">
                Doesn't look like a DOI (starts with "10." and contains a "/") or an arXiv ID
                (e.g. "1706.03762"). The contract will reject anything else.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!validShape || phase === 'pending'}
            className="focus-ring w-full sm:w-auto bg-stamp hover:bg-stamp-dim text-paper font-body font-medium rounded px-6 py-3 transition-colors disabled:opacity-50"
          >
            {phase === 'pending' ? 'Registering…' : 'Register paper'}
          </button>

          {phase === 'pending' && (
            <div className="pt-1">
              <LoadingSpinner label="Waiting for confirmation…" />
              <p className="text-xs text-pencil font-body mt-2">
                This is a deterministic write — no evidence fetch yet, so it should confirm
                quickly.
              </p>
            </div>
          )}

          {phase === 'error' && <TransactionError error={error} />}
        </form>
      )}
    </div>
  );
}
