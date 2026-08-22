import { FormEvent, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGenLayer } from '../hooks/useGenLayer';
import { LoadingSpinner, TransactionError } from '../components/shared';
import { PaperRecordView, AssertedStatus, ASSERTED_STATUS_LABELS } from '../config/contract';

type LoadState = 'loading' | 'found' | 'not_found' | 'error';
type FilePhase = 'idle' | 'pending' | 'success' | 'error';

export default function PaperPage() {
  const { paperId } = useParams<{ paperId: string }>();
  const { account, connect, connecting, readContract, writeContract } = useGenLayer();
  const navigate = useNavigate();

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [paper, setPaper] = useState<PaperRecordView | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);

  const [assertedStatus, setAssertedStatus] = useState<AssertedStatus>('active');
  const [filePhase, setFilePhase] = useState<FilePhase>('idle');
  const [fileError, setFileError] = useState<unknown>(null);

  const decodedId = paperId ? decodeURIComponent(paperId) : '';

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    readContract('get_paper', [decodedId])
      .then((data) => {
        if (cancelled) return;
        setPaper(data);
        setLoadState('found');
      })
      .catch((err) => {
        if (cancelled) return;
        // The contract's own get_paper raises "not found" via assert —
        // treat that specifically as a real empty state, not a crash.
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes('not found')) {
          setLoadState('not_found');
        } else {
          setLoadError(err);
          setLoadState('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [decodedId, readContract]);

  async function handleFileCheck(e: FormEvent) {
    e.preventDefault();
    setFilePhase('pending');
    setFileError(null);
    try {
      const { receipt } = await writeContract('file_check', [decodedId, assertedStatus]);
      // Parse the check_id out of the return value to route straight
      // to the resolution page.
      const returnValue = (receipt as any)?.result?.return_value ?? (receipt as any)?.returnValue;
      let checkId: number | null = null;
      if (typeof returnValue === 'string') {
        try {
          checkId = JSON.parse(returnValue).check_id;
        } catch {
          // fall through — still show success even if we can't parse it
        }
      }
      setFilePhase('success');
      if (checkId != null) {
        navigate(`/check/${checkId}`);
      }
    } catch (err) {
      setFileError(err);
      setFilePhase('error');
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-16">
        <LoadingSpinner label="Looking up paper record…" />
      </div>
    );
  }

  if (loadState === 'not_found') {
    return (
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-16 text-center">
        <p className="font-display text-2xl text-ink mb-3">Not registered yet.</p>
        <p className="font-body text-ink-soft mb-6">
          <span className="font-mono text-sm">{decodedId}</span> hasn't been registered on this
          contract. Register it first, then anyone can file a check.
        </p>
        <Link
          to="/register"
          className="focus-ring inline-block bg-stamp hover:bg-stamp-dim text-paper font-body text-sm rounded px-5 py-2.5"
        >
          Register this paper
        </Link>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="max-w-xl mx-auto px-5 sm:px-8 py-16">
        <TransactionError error={loadError} />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-16">
      <p className="font-mono text-xs text-brass tracking-widest uppercase mb-3">
        {paper?.identifier_kind === 'doi' ? 'DOI' : 'arXiv ID'}
      </p>
      <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink mb-2 break-all">
        {paper?.paper_id}
      </h1>
      <p className="font-body text-sm text-pencil mb-8">
        Registered by {paper?.registrant.slice(0, 8)}… · {paper?.check_count} check
        {paper?.check_count === 1 ? '' : 's'} filed
      </p>

      <div className="border-t border-brass/15 pt-8">
        <h2 className="font-display text-lg text-ink mb-4">File a status check</h2>

        {!account ? (
          <div className="border border-brass/30 bg-paper-dim/50 rounded-sm p-5">
            <p className="font-body text-sm text-ink-soft mb-3">Connect a wallet to file a check.</p>
            <button
              onClick={() => connect().catch((e) => setFileError(e))}
              disabled={connecting}
              className="focus-ring bg-ink text-paper font-body text-sm rounded px-5 py-2.5 disabled:opacity-60"
            >
              {connecting ? 'Connecting…' : 'Connect wallet'}
            </button>
          </div>
        ) : filePhase === 'success' ? (
          <div className="border border-verified/40 bg-verified/5 rounded-sm p-5">
            <p className="font-body text-sm text-ink-soft">
              Check filed. Redirecting to the resolution page — if it doesn't redirect
              automatically, the check was recorded and can be resolved from its own page.
            </p>
          </div>
        ) : (
          <form onSubmit={handleFileCheck} className="space-y-4">
            <div>
              <p className="font-body text-sm text-ink-soft mb-2">
                What do you believe this paper's current status is?
              </p>
              <div className="flex flex-col gap-2">
                {(Object.keys(ASSERTED_STATUS_LABELS) as AssertedStatus[]).map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2.5 font-body text-sm text-ink cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="asserted_status"
                      checked={assertedStatus === opt}
                      onChange={() => setAssertedStatus(opt)}
                      className="accent-stamp"
                      disabled={filePhase === 'pending'}
                    />
                    {ASSERTED_STATUS_LABELS[opt]}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={filePhase === 'pending'}
              className="focus-ring bg-stamp hover:bg-stamp-dim text-paper font-body font-medium rounded px-6 py-3 transition-colors disabled:opacity-50"
            >
              {filePhase === 'pending' ? 'Filing…' : 'File check'}
            </button>

            {filePhase === 'pending' && (
              <div>
                <LoadingSpinner label="Waiting for confirmation…" />
              </div>
            )}

            {filePhase === 'error' && <TransactionError error={fileError} />}
          </form>
        )}
      </div>
    </div>
  );
}
