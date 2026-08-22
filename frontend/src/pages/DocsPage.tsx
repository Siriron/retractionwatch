import { CONTRACT_ADDRESS, EXPLORER_ADDRESS_URL } from '../config/chains';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-10 border-t border-brass/15 first:border-t-0 first:pt-0">
      <h2 className="font-display font-semibold text-2xl text-ink mb-4">{title}</h2>
      <div className="font-body text-ink-soft leading-relaxed space-y-4">{children}</div>
    </section>
  );
}

export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16">
      <p className="font-mono text-xs text-brass tracking-widest uppercase mb-3">Documentation</p>
      <h1 className="font-display font-semibold text-3xl text-ink mb-10">RetractionWatch</h1>

      <Section id="overview" title="Overview">
        <p>
          RetractionWatch attests to a paper's current retraction status on-chain, cross-checked
          against two independent, fixed evidence sources — never a submitter-supplied claim
          alone. A paper is registered once, by a bare DOI or arXiv ID. Anyone can then file a
          check asserting what they believe its status is; resolution fetches the paper's live
          record and produces a verdict.
        </p>
      </Section>

      <Section id="how-it-works" title="How it works">
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong className="text-ink">Register</strong> — submit a DOI or arXiv ID. This is
            the only submitter-supplied input in the whole contract; every fetch later derives
            from it.
          </li>
          <li>
            <strong className="text-ink">File a check</strong> — assert whether you believe the
            paper is currently active, or retracted/withdrawn.
          </li>
          <li>
            <strong className="text-ink">Resolve</strong> — the contract fetches Crossref's DOI
            registry record and, if applicable, arXiv's own listing, inside the same
            multi-validator consensus round that reaches a verdict.
          </li>
        </ol>
      </Section>

      <Section id="verdicts" title="Verdict shape">
        <p>Four possible verdicts, not two — collapsing them would hide real distinctions:</p>
        <ul className="list-disc list-inside space-y-1.5">
          <li>
            <strong className="text-ink">Confirmed Active</strong> — a usable record exists and
            shows no retraction signal.
          </li>
          <li>
            <strong className="text-ink">Confirmed Retracted</strong> — a source affirmatively
            shows retraction or withdrawal.
          </li>
          <li>
            <strong className="text-ink">No Record Found</strong> — neither source returned a
            usable record for this identifier at all.
          </li>
          <li>
            <strong className="text-ink">Sources Conflict</strong> — Crossref and arXiv genuinely
            disagree with each other.
          </li>
        </ul>
      </Section>

      <Section id="architecture" title="Architecture">
        <p>
          Two evidence legs, both fixed and neither submitter-selected: Crossref's REST API
          (<code className="font-mono text-sm">api.crossref.org/works/{'{doi}'}</code>) and
          arXiv's Atom API (
          <code className="font-mono text-sm">export.arxiv.org/api/query</code>). Both fetch URLs
          are constructed deterministically from the locked identifier inside the same nondet
          block that produces the verdict — there is no field anywhere in the contract where a
          submitter supplies a URL that gets fetched as evidence.
        </p>
      </Section>

      <Section id="contract" title="Smart contract">
        <p>
          Deployed on GenLayer StudioNet at{' '}
          <a
            href={EXPLORER_ADDRESS_URL(CONTRACT_ADDRESS)}
            target="_blank"
            rel="noreferrer"
            className="text-stamp underline focus-ring rounded font-mono text-sm break-all"
          >
            {CONTRACT_ADDRESS}
          </a>
          .
        </p>
      </Section>

      <Section id="api" title="API reference">
        <div className="space-y-4">
          <div>
            <p className="font-mono text-sm text-ink mb-1">
              register_paper(paper_id: str) → write
            </p>
            <p className="text-sm">Registers a paper by DOI or arXiv ID.</p>
          </div>
          <div>
            <p className="font-mono text-sm text-ink mb-1">
              file_check(paper_id: str, asserted_status: str) → write
            </p>
            <p className="text-sm">
              Files a status check. <code className="font-mono text-xs">asserted_status</code> is
              either <code className="font-mono text-xs">active</code> or{' '}
              <code className="font-mono text-xs">retracted_or_withdrawn</code>.
            </p>
          </div>
          <div>
            <p className="font-mono text-sm text-ink mb-1">resolve_check(check_id: u256) → write</p>
            <p className="text-sm">
              Fetches evidence and runs consensus to reach a verdict on a filed check.
            </p>
          </div>
          <div>
            <p className="font-mono text-sm text-ink mb-1">get_paper(paper_id: str) → view</p>
            <p className="text-sm">Returns a paper's registration record.</p>
          </div>
          <div>
            <p className="font-mono text-sm text-ink mb-1">get_check(check_id: u256) → view</p>
            <p className="text-sm">Returns a check's current state, including its verdict once resolved.</p>
          </div>
        </div>
      </Section>

      <Section id="faq" title="FAQ">
        <div className="space-y-4">
          <div>
            <p className="font-medium text-ink mb-1">What if a paper has neither identifier fetch a record?</p>
            <p className="text-sm">
              The verdict resolves to "No Record Found" — this is a real, expected outcome, not
              an error.
            </p>
          </div>
          <div>
            <p className="font-medium text-ink mb-1">Is there a stake or penalty for a wrong assertion?</p>
            <p className="text-sm">
              No. This contract has no staking or settlement of any kind — the record itself,
              and whether an assertion turned out accurate, is the only consequence.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
