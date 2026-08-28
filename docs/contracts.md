# Smart contract

Deployed on GenLayer StudioNet: `0x36ba2f2bC63dD2558c211CA04571F3f28AEb5380`

[View on explorer](https://explorer-studio.genlayer.com/address/0x36ba2f2bC63dD2558c211CA04571F3f28AEb5380)

## Methods

| Method | Type | Description |
|---|---|---|
| `register_paper(paper_id: str)` | write | Registers a paper by DOI or arXiv ID. Rejects anything that doesn't shape-match either format. |
| `file_check(paper_id: str, asserted_status: str)` | write | Files a status check against a registered paper. `asserted_status` must be `active` or `retracted_or_withdrawn`. |
| `resolve_check(check_id: u256)` | write | Fetches exactly one evidence leg — Crossref for a DOI-registered paper, arXiv for an arXiv-registered paper, never both — runs multi-validator consensus, records the verdict and the assertion-accuracy comparison. |
| `get_paper(paper_id: str)` | view | Returns a paper's registration record and check count. |
| `get_check(check_id: u256)` | view | Returns a check's current state, including its verdict once resolved. |
| `get_next_check_id()` | view | Returns the next check ID that will be assigned. |

## Nondet pattern

`resolve_check` follows the project's confirmed ten-item nondet safety pattern in full: positional `run_nondet_unsafe` call, `gl.vm.Return`/`.calldata` handling in `validator_fn`, `copy_to_memory()` for every storage-backed value used inside the nondet block, module-level constants only, nested functions with zero `self.` references, no `float()` anywhere reachable from nondet code, and identifier-key normalization at every read/write site.

## Live-tested, not just theoretically correct

Three full `register_paper → file_check → resolve_check` lifecycles have been run directly against the deployed contract:

1. **DOI `10.1016/S0140-6736(97)11096-0`** (Wakefield et al., Lancet — a real, well-documented retraction), asserting `active` on purpose to exercise the false-assertion path → `confirmed_retracted`, `assertion_accurate: false`, `confidence_bps: 1000`, 0 rotations. `reasoning_summary` quoted the literal `"RETRACTED: "` title-prefix string from the live Crossref response.
2. **DOI `10.1038/nature12373`** (real, active paper), asserting `active` (correct) → `confirmed_active`, `assertion_accurate: true`, `confidence_bps: 970`, 0 rotations.
3. **arXiv `1706.03762`** ("Attention Is All You Need"), asserting `active` (correct) → `confirmed_active`, `assertion_accurate: true`, `confidence_bps: 1000`, 0 rotations. This was the first live exercise of the arXiv Atom API fetch path anywhere in this project's history.

All three: empty stdout, empty stderr, `SUCCESS` execution result, `Accepted` consensus result, 5 initial validators.

## Known, deliberate gaps

- `reasoning_summary` content validation is a length threshold (>20 chars) only, not criteria-based — the same gap named in this project's prior contracts, not resolved here either.
- `sources_conflict` is not reachable in this version: `resolve_check` fetches exactly one evidence leg per paper (Crossref for DOI, arXiv for arXiv ID), so no resolution can ever populate two disagreeing sources to conflict. See `docs/architecture.md`'s "Single-source behavior" section.
- No appeal or re-resolution path in this version.
