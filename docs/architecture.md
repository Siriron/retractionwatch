# Architecture

## Overview

RetractionWatch has one write path that matters structurally: a paper is registered by a bare identifier, checks are filed against it, and resolution fetches two independent evidence sources inside the same consensus round that produces a verdict.

## Why the identifier is the only submitter input

Every prior single-fetch-single-judgment contract in this project's history (NEXUS, VERITY, SourceChecker) failed the same way: the thing being judged was either a free-text claim or a submitter-selected URL, with no structural link forcing the evidence to actually be about the claim. Chronomark's rejection was the same failure wearing different clothes — a submitter-supplied evidence URL and a submitter-set deadline, neither locked before the claim existed.

RetractionWatch avoids this by construction: `register_paper` accepts only a DOI or arXiv ID, validated by shape (not by resolving it against a live source at registration time — an invalid-but-shaped identifier correctly resolves to `no_record_found` later, rather than erroring at registration). Both evidence fetch URLs are built from that identifier inside `resolve_check` itself:

- `https://api.crossref.org/works/{doi}`
- `http://export.arxiv.org/api/query?id_list={arxiv_id}`

There is no field anywhere in the contract where a submitter supplies a URL that gets fetched as evidence.

## The verdict shape

Four verdicts, not two or three:

- `confirmed_active` — a usable record exists, no retraction signal present.
- `confirmed_retracted` — a source affirmatively shows retraction or withdrawal.
- `no_record_found` — the fetched source returned no usable record at all.
- `sources_conflict` — reserved for a future version implementing counterpart-identifier resolution; **not reachable in this version**.

The last two are structurally different failure modes ("nothing found" vs. "found, but disagreeing") and are kept separate in the verdict model rather than collapsed into a single "unverifiable" bucket, which would hide a real distinction a filer needs to see once counterpart resolution exists. See "Single-source behavior" below for why only one of Crossref/arXiv is ever fetched per paper in this version, which is what makes `sources_conflict` currently unreachable.

## Single-source behavior (this version)

`identifier_kind` is fixed once, at `register_paper` time, from the shape of the identifier supplied — `"doi"` or `"arxiv"`. `resolve_check` fetches exactly one evidence leg for the life of that paper record: Crossref if `identifier_kind == "doi"`, arXiv if `identifier_kind == "arxiv"`. It never attempts the other leg, even though a real paper's Crossref record can reference a counterpart arXiv ID (or vice versa) — no code in this version parses that counterpart identifier out of the fetched record and fetches the other API with it.

This means every resolution in this version is genuinely single-source: one real fetch, one `"[not attempted: ...]"` marker standing in for the other leg. `sources_conflict` requires both legs to return usable, disagreeing records in the same resolution — which cannot happen while only one leg is ever fetched. A future version implementing counterpart resolution would restore `sources_conflict`'s reachability without changing the verdict model itself, which is why the verdict is kept rather than removed.

## Assertion comparison

`file_check` requires the filer to assert a belief (`active` or `retracted_or_withdrawn`) before resolution happens. This is what makes the check a genuine claim rather than an oracle question — the assertion is recorded before the verdict is known, and `resolve_check` computes `assertion_accurate` (`true`/`false`/`unverifiable`) as plain deterministic comparison logic after the nondet consensus round returns, never inside the LLM judgment itself.

## No stake, no settlement

This contract moves no value. The shape is single-party attestation with a real evidentiary claim at stake, not a staked adversarial dispute — see the contract's own module docstring for the full reasoning behind this choice.
