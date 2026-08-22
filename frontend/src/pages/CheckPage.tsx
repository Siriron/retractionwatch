import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGenLayer } from '../hooks/useGenLayer';
import { StampMark, AccuracyNote, LoadingSpinner, NondetPendingNote, TransactionError } from '../components/shared';
import { CheckRecordView, ASSERTED_STATUS_LABELS } from '../config/contract';
import { EXPLORER_TX_URL } from '../config/chains';

type LoadState = 'loading' | 'found' | 'not_found' | 'error';
type ResolvePhase = 'idle' | 'pending' | 'error';

export default function CheckPage() {
  const { checkId } = useParams<{ checkId: string }>();
  const { readContract, writeContract } = useGenLayer();

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [check, setCheck] = useState<CheckRecordView | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);

  const [resolvePhase, setResolvePhase] = useState<ResolvePhase>('idle');
  const [resolveError, setResolveError] = useState<unknown>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const fetchCheck = useCallback(() => {
    if (!checkId) return;
    setLoadState('loading');
    readContract('get_check', [Number(checkId)])
      .then((data) => {
        setCheck(data);
        setLoadState('found');
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes('not found')) {
          setLoadState('not_found');
        } else {
          setLoadError(err);
          setLoadState('error');
        }
      });
  }, [checkId, readContract]);

  useEffect(() => {
    fetchCheck();
  }, [fetchCheck]);

  async function handleResolve() {
    if (!checkId) return;
    setResolvePhase('pending');
    setResolveError(null);
    try {
      const { hash } = await writeContract('resolve_check', [Number(checkId)]);
      setTxHash(hash);
      setResolvePhase('idle');
      fetchCheck();
    } catch (err) {
      setResolveError(err);
      setResolvePhase('error');
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-16">
        <LoadingSpinner label="Loading check…" />
      </div>
    );
  }

  if (loadState === 'not_found') {
    return (
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-16 text-center">
        <p className="font-display text-2xl text-ink mb-3">No such check.</p>
        <p className="font-body text-ink-soft">
          Check #{checkId} doesn't exist on this contract yet.
        </p>
      </div>
    );
  }

  if (loadState === 'error' || !check) {
    return (
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-16">
        <TransactionError error={loadError} />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-16">
      <p className="font-mono text-xs text-brass tracking-widest uppercase mb-3">
        Check #{check.check_id}
      </p>
      <h1 className="font-display font-semibold text-2xl text-ink mb-2 break-all">
        {check.paper_id}
      </h1>
      <p className="font-body text-sm text-pencil mb-8">
        Filed by {check.filer.slice(0, 8)}… · asserted "
        {ASSERTED_STATUS_LABELS[check.asserted_status]}"
      </p>

      {check.status === 'filed' ? (
        <div className="border-t border-brass/15 pt-8">
          <p className="font-body text-ink-soft mb-5">
            This check hasn't been resolved yet. Resolving fetches the paper's live record from
            Crossref and, if applicable, arXiv — then runs multi-validator consensus to reach a
            verdict.
          </p>
          <button
            onClick={handleResolve}
            disabled={resolvePhase === 'pending'}
            className="focus-ring bg-stamp hover:bg-stamp-dim text-paper font-body font-medium rounded px-6 py-3 transition-colors disabled:opacity-50"
          >
            {resolvePhase === 'pending' ? 'Resolving…' : 'Resolve check'}
          </button>
          {resolvePhase === 'pending' && (
            <div className="mt-3">
              <LoadingSpinner label="Fetching evidence and running consensus…" />
              <NondetPendingNote />
            </div>
          )}
          {resolvePhase === 'error' && (
            <div className="mt-3">
              <TransactionError error={resolveError} />
            </div>
          )}
        </div>
      ) : (
        <div className="border-t border-brass/15 pt-8 space-y-5">
          <StampMark verdict={check.verdict} />
          <AccuracyNote accuracy={check.assertion_accurate} />

          <div className="bg-paper-dim/50 border border-brass/20 rounded-sm p-5">
            <p className="font-mono text-xs text-pencil mb-2 uppercase tracking-wide">
              Reasoning · confidence {(check.confidence_bps / 10).toFixed(1)}%
            </p>
            <p className="font-body text-sm text-ink-soft leading-relaxed">
              {check.reasoning_summary}
            </p>
          </div>

          {txHash && (
            <a
              href={EXPLORER_TX_URL(txHash)}
              target="_blank"
              rel="noreferrer"
              className="focus-ring text-sm text-pencil underline"
            >
              View resolution transaction
            </a>
          )}
        </div>
      )}
    </div>
  );
}
