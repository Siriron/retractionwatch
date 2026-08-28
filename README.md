<div align="center">

<img src="./docs/assets/logo.svg" width="88" alt="RetractionWatch logo" />

# RetractionWatch

### On-chain retraction status attestation, cross-checked against Crossref and arXiv — never a submitter's claim alone.

<br />

![Status](https://img.shields.io/badge/status-live-brightgreen?style=flat-square)
![Network](https://img.shields.io/badge/network-StudioNet-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20GenVM-8B1A1A?style=flat-square)

<br />

**[Documentation](./docs/architecture.md)** &nbsp;·&nbsp; **[Smart Contract](./contracts/retractionwatch.py)**

</div>

<br />

---

## What this is

A paper is registered on-chain by a bare DOI or arXiv ID — never a URL, never free text. Anyone can then file a check asserting what they believe its current retraction status is. Resolution fetches the paper's live record from whichever single source matches how it was registered — Crossref for a DOI, arXiv for an arXiv ID, never both for the same paper in this version — inside the same multi-validator consensus round that produces a verdict. The evidence is structurally derived from the locked identifier, never supplied by whoever's making the claim.

<br />

<div align="center">

| | |
|---|---|
| **Concept** | Single-party attestation of a paper's retraction status |
| **Consensus need** | Someone citing a retracted paper benefits from a false "active" verdict; someone discrediting a valid paper benefits from a false "retracted" verdict — neither claim can be answered from an LLM's own memory |
| **Evidence source** | Crossref REST API (DOI-registered papers) or arXiv Atom API (arXiv-registered papers), whichever matches how the paper was registered — fetched fresh inside the resolving transaction, never a submitter-supplied URL, never both sources for the same paper in this version |
| **Network** | StudioNet |

</div>

<br />

---

## How it works

1. **Register** a paper by DOI or arXiv ID — the only submitter-supplied input in the whole contract. This also fixes which single source resolution will ever fetch for this paper.
2. **File a check**, asserting the paper is active or retracted/withdrawn.
3. **Resolve** the check — Crossref (DOI papers) or arXiv (arXiv papers) is fetched live, never both; a four-way verdict is reached by consensus.

<br />

<details>
<summary><b>Why four verdicts, not two — and why one of them can't fire yet</b></summary>
<br />

`confirmed_active`, `confirmed_retracted`, `no_record_found`, and `sources_conflict` are all distinct, real evidentiary situations. Collapsing "nothing found" and "sources actively disagree" into one "unverifiable" bucket would hide a genuinely different case — live inconsistency between two authoritative sources — inside a bucket meant for simple absence of evidence.

In this version, `sources_conflict` is reserved but **not reachable**: `resolve_check` fetches exactly one evidence leg per paper (Crossref for a DOI, arXiv for an arXiv ID), so there is never a resolution where both sources return real, disagreeing content to conflict with each other. A future version that resolves a paper's counterpart identifier (an arXiv ID referenced in a Crossref record, or vice versa) and fetches both legs would restore this verdict's reachability without needing a new verdict value.

</details>

<br />

---

## Deployed contract

<div align="center">

| Network | Address | Explorer |
|---|---|---|
| StudioNet | `0x36ba2f2bC63dD2558c211CA04571F3f28AEb5380` | [View](https://explorer-studio.genlayer.com/address/0x36ba2f2bC63dD2558c211CA04571F3f28AEb5380) |

</div>

<br />

---

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Full deployment instructions: [`docs/deployment.md`](./docs/deployment.md)

<br />

---

## Project structure

```
contracts/retractionwatch.py    The GenVM contract
frontend/                        React + Vite app
docs/                             architecture.md, deployment.md, contracts.md, frontend.md
LICENSE                           MIT
```

<br />

---

## Status

<div align="center">

![Tested](https://img.shields.io/badge/register%2Ffile%2Fresolve%20lifecycle-tested-brightgreen?style=flat-square)
![Not reachable](https://img.shields.io/badge/sources__conflict%20verdict-not%20reachable%20this%20version-yellow?style=flat-square)

</div>

The full `register_paper → file_check → resolve_check` lifecycle has been run live against the deployed contract across three structurally different real inputs: a confirmed-retracted DOI (Wakefield et al., Lancet — asserting the wrong status on purpose to exercise the false-assertion path), a confirmed-active DOI, and an arXiv-only preprint. All three produced correct verdicts, correct `assertion_accurate` comparisons, zero problematic validator rotation, and reasoning that referenced real fetched content rather than the model's own training-data familiarity with these papers. The `sources_conflict` verdict branch is not reachable in this version, not merely untested: `resolve_check` fetches exactly one evidence leg per paper (Crossref for a DOI, arXiv for an arXiv ID), so no resolution in this version can produce two disagreeing populated sources to conflict with each other — see the "Single-source behavior" section of [`docs/architecture.md`](./docs/architecture.md) for the full explanation and what a future version implementing counterpart-identifier resolution would need to add. The frontend has been built and structurally audited (import resolution, Rules of Hooks, JSX/file-extension mismatches, brace balance, responsive-breakpoint equivalence) but has not yet been run through a real `npm install`/`tsc`/`vite build` in a networked environment.

<br />

---

<div align="center">

Built on [GenLayer](https://genlayer.com) · [Portal submission](https://portal.genlayer.foundation/)

</div>
