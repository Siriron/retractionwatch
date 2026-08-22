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

A paper is registered on-chain by a bare DOI or arXiv ID — never a URL, never free text. Anyone can then file a check asserting what they believe its current retraction status is. Resolution fetches the paper's live record from Crossref and, if applicable, arXiv, inside the same multi-validator consensus round that produces a verdict. The evidence is structurally derived from the locked identifier, never supplied by whoever's making the claim.

<br />

<div align="center">

| | |
|---|---|
| **Concept** | Single-party attestation of a paper's retraction status |
| **Consensus need** | Someone citing a retracted paper benefits from a false "active" verdict; someone discrediting a valid paper benefits from a false "retracted" verdict — neither claim can be answered from an LLM's own memory |
| **Evidence source** | Crossref REST API + arXiv Atom API, both fetched fresh inside the resolving transaction, never a submitter-supplied URL |
| **Network** | StudioNet |

</div>

<br />

---

## How it works

1. **Register** a paper by DOI or arXiv ID — the only submitter-supplied input in the whole contract.
2. **File a check**, asserting the paper is active or retracted/withdrawn.
3. **Resolve** the check — Crossref and, if applicable, arXiv are fetched live; a four-way verdict is reached by consensus.

<br />

<details>
<summary><b>Why four verdicts, not two</b></summary>
<br />

`confirmed_active`, `confirmed_retracted`, `no_record_found`, and `sources_conflict` are all distinct, real evidentiary situations. Collapsing "nothing found" and "sources actively disagree" into one "unverifiable" bucket would hide a genuinely different case — live inconsistency between two authoritative sources — inside a bucket meant for simple absence of evidence.

</details>

<br />

---

## Deployed contract

<div align="center">

| Network | Address | Explorer |
|---|---|---|
| StudioNet | `0xE7f4D6267903e346578cb1F5748ba61C1f30120b` | [View](https://explorer-studio.genlayer.com/address/0xE7f4D6267903e346578cb1F5748ba61C1f30120b) |

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
![Untested](https://img.shields.io/badge/sources__conflict%20verdict-untested-yellow?style=flat-square)

</div>

The full `register_paper → file_check → resolve_check` lifecycle has been run live against the deployed contract across three structurally different real inputs: a confirmed-retracted DOI (Wakefield et al., Lancet — asserting the wrong status on purpose to exercise the false-assertion path), a confirmed-active DOI, and an arXiv-only preprint. All three produced correct verdicts, correct `assertion_accurate` comparisons, zero problematic validator rotation, and reasoning that referenced real fetched content rather than the model's own training-data familiarity with these papers. The `sources_conflict` verdict branch has not been exercised live — no test case with two genuinely disagreeing sources was available during this pass — and is a named, deliberate gap rather than an oversight. The frontend has been built and structurally audited (import resolution, Rules of Hooks, JSX/file-extension mismatches, brace balance, responsive-breakpoint equivalence) but has not yet been run through a real `npm install`/`tsc`/`vite build` in a networked environment.

<br />

---

<div align="center">

Built on [GenLayer](https://genlayer.com) · [Portal submission](https://portal.genlayer.foundation/)

</div>
