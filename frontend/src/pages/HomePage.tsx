import { Link } from 'react-router-dom';
import { StampMark } from '../components/shared';

export default function HomePage() {
  return (
    <div>
      {/* Hero: the thesis is the mechanism itself. Rather than a
          generic headline/subhead/button stack, show what a resolved
          record actually looks like — the stamp is the product. */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
        <div className="max-w-2xl">
          <p className="font-mono text-xs text-brass tracking-widest uppercase mb-4">
            On-chain retraction status attestation
          </p>
          <h1 className="font-display font-semibold text-4xl sm:text-5xl leading-[1.1] text-ink mb-6">
            A paper's status,
            <br />
            stamped by evidence
            <br />
            no one party controls.
          </h1>
          <p className="font-body text-lg text-ink-soft leading-relaxed mb-8">
            Register a paper by its DOI or arXiv ID. Anyone can file a check on what they believe
            its status is. The verdict comes from Crossref's registry record and arXiv's own
            listing — fetched fresh, judged by multi-validator consensus, never taken on a
            submitter's word.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="focus-ring bg-stamp hover:bg-stamp-dim text-paper font-body font-medium rounded px-6 py-3 transition-colors"
            >
              Register a paper
            </Link>
            <Link
              to="/docs"
              className="focus-ring border border-ink/20 hover:border-ink/40 text-ink font-body font-medium rounded px-6 py-3 transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>

        {/* A concrete, real example of the signature element — not a
            mockup, the actual component the app produces, pre-filled
            with a real live-tested case. */}
        <div className="mt-16 border border-brass/25 bg-paper-dim/60 rounded-sm p-6 sm:p-8 max-w-xl">
          <p className="font-mono text-xs text-pencil mb-3">
            10.1016/S0140-6736(97)11096-0 · The Lancet
          </p>
          <p className="font-body text-sm text-ink-soft mb-5">
            "The Crossref record explicitly lists the title of the paper as 'RETRACTED:
            Ileal-lymphoid-nodular hyperplasia, non-specific colitis, and pervasive developmental
            disorder in children'."
          </p>
          <StampMark verdict="confirmed_retracted" />
        </div>
      </section>

      {/* Concept summary — plain prose, matches the actual mechanism */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-16 border-t border-brass/15">
        <div className="grid sm:grid-cols-3 gap-10">
          <div>
            <p className="font-mono text-xs text-brass mb-2">01 — Register</p>
            <p className="font-display text-lg text-ink mb-2">A bare identifier, nothing else</p>
            <p className="font-body text-sm text-ink-soft leading-relaxed">
              No URL, no free text. Just a DOI or an arXiv ID — the one thing every later fetch
              derives from.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-brass mb-2">02 — File a check</p>
            <p className="font-display text-lg text-ink mb-2">State what you believe</p>
            <p className="font-body text-sm text-ink-soft leading-relaxed">
              Assert the paper is active, or retracted/withdrawn. This is a claim that can turn
              out right or wrong — not a guess the contract already knows the answer to.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-brass mb-2">03 — Get a verdict</p>
            <p className="font-display text-lg text-ink mb-2">Two sources, cross-checked</p>
            <p className="font-body text-sm text-ink-soft leading-relaxed">
              Crossref and arXiv are fetched fresh, live, inside the same consensus round that
              produces the verdict — sources can even conflict, and the contract says so.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
