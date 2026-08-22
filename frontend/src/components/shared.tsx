import { Verdict, AssertionAccuracy, VERDICT_LABELS } from '../config/contract';
import { EXPLORER_TX_URL } from '../config/chains';
import { TimeoutError } from '../hooks/useGenLayer';

// The signature element: a verdict overprints onto the record like a
// rubber-stamp impression, not a generic status pill. Color and label
// come from the verdict; rotation and ink-bleed styling are constant.
export function StampMark({ verdict, size = 'md' }: { verdict: Verdict; size?: 'sm' | 'md' }) {
  if (!verdict) return null;

  const palette: Record<Exclude<Verdict, ''>, { border: string; text: string; bg: string }> = {
    confirmed_active: { border: 'border-verified', text: 'text-verified', bg: 'bg-verified/5' },
    confirmed_retracted: { border: 'border-stamp', text: 'text-stamp', bg: 'bg-stamp/5' },
    no_record_found: { border: 'border-pencil', text: 'text-pencil', bg: 'bg-pencil/5' },
    sources_conflict: { border: 'border-conflict', text: 'text-conflict', bg: 'bg-conflict/5' },
  };
  const p = palette[verdict];
  const dims = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-5 py-2.5 text-sm sm:text-base';

  return (
    <div
      className={`stamp-animate inline-flex items-center border-[3px] rounded-sm font-display font-bold uppercase tracking-wider ${p.border} ${p.text} ${p.bg} ${dims}`}
      style={{ transform: 'rotate(-8deg)' }}
    >
      {VERDICT_LABELS[verdict]}
    </div>
  );
}

export function AccuracyNote({ accuracy }: { accuracy: AssertionAccuracy }) {
  if (!accuracy) return null;
  const copy: Record<Exclude<AssertionAccuracy, ''>, { text: string; cls: string }> = {
    true: { text: 'The filed assertion matched the verdict.', cls: 'text-verified' },
    false: { text: 'The filed assertion did not match the verdict.', cls: 'text-stamp' },
    unverifiable: {
      text: 'The assertion could not be scored — evidence was inconclusive.',
      cls: 'text-pencil',
    },
  };
  const c = copy[accuracy];
  return <p className={`font-body text-sm ${c.cls}`}>{c.text}</p>;
}

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-pencil font-body text-sm">
      <span className="inline-block w-4 h-4 border-2 border-brass/40 border-t-brass rounded-full animate-spin" />
      {label || 'Loading…'}
    </div>
  );
}

// Every write that triggers a nondet/LLM judgment must show this note
// under the pending button — GenLayer consensus genuinely takes real
// minutes for these, not seconds (project knowledge, section 7).
export function NondetPendingNote() {
  return (
    <p className="text-xs text-pencil font-body mt-2">
      This step fetches live evidence and runs multi-validator consensus — it can take a few
      minutes. Don't close this tab.
    </p>
  );
}

export function TransactionError({ error }: { error: unknown }) {
  if (error instanceof TimeoutError) {
    return (
      <div className="border border-brass/40 bg-brass/5 rounded p-4 font-body text-sm text-ink-soft">
        <p className="font-medium text-ink mb-1">Still processing.</p>
        <p>
          Consensus is taking longer than expected. Your transaction was submitted and may still
          succeed —{' '}
          <a
            href={EXPLORER_TX_URL(error.txHash)}
            target="_blank"
            rel="noreferrer"
            className="text-stamp underline focus-ring rounded"
          >
            check its status on the explorer
          </a>
          .
        </p>
      </div>
    );
  }
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  return (
    <div className="border border-stamp/40 bg-stamp/5 rounded p-4 font-body text-sm text-stamp">
      {message}
    </div>
  );
}
