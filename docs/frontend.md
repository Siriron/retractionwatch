# Frontend

React + Vite + TypeScript + Tailwind CSS.

## Structure

- `src/config/chains.ts` — the single plain constant holding the deployed contract address. No `.env`, no dotfiles.
- `src/config/contract.ts` — type definitions mirroring the contract's actual method return shapes.
- `src/hooks/useGenLayer.ts` — the SDK integration: wallet connection persistence, `ensureChain()` before every write, `account` passed as a plain address string (never wrapped in `createAccount()`, which expects a private key), generous receipt-wait configuration, and a `TimeoutError` class carrying the transaction hash as a real property.
- `src/components/shared.tsx` — shared UI: the stamp-impression verdict display (this app's signature design element), loading states, and transaction error handling.
- `src/pages/` — one file per route: home, register, paper lookup + check filing, check resolution, docs, 404.

## Design system

The visual world is an archival card catalog — the specific vocabulary of a formal record being annotated, not a courtroom or an instrument panel. Signature element: a resolved verdict animates in as a rubber-stamp impression overprinting the record, rather than appearing as a generic status pill.

**Palette:** aged paper `#F7F4ED`, archive ink `#1C1B19`, stamp red `#8B1A1A`, verified green `#2D5A3D`, brass accession `#B8860B`, pencil grey `#6B6862`, conflict ochre `#8B5A1A`.

**Type:** Fraunces (display), Inter (body/UI), IBM Plex Mono (identifiers — DOIs and arXiv IDs are exact strings and are set as such).

## Build

```bash
npm install
npm run dev      # local development
npm run build    # production build
```

## Testing status

This frontend has been structurally audited (import/export resolution checked against real exports, Rules-of-Hooks proxy check, JSX-in-`.ts`-file check, per-file brace balance, `hidden md:` breakpoint patterns confirmed to each have a real working mobile equivalent, no `console.log`/TODO/localhost artifacts). It has **not** been run through a real `npm install` / `tsc` / `vite build` in a networked environment — the build environment used to write this code had no network access. Run a real build once before treating this as final; a no-network structural audit and a real compiler pass are different claims.
