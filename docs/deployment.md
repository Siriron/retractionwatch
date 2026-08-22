# Deployment

## Contract

Deployed to GenLayer StudioNet via studio.genlayer.com (uploaded `.py` directly — never pasted, never deployed via MetaMask/EVM wallet, per the confirmed rejection pattern for raw EVM encoding).

**Address:** `0xE7f4D6267903e346578cb1F5748ba61C1f30120b`
**Explorer:** https://explorer-studio.genlayer.com/address/0xE7f4D6267903e346578cb1F5748ba61C1f30120b

To redeploy: upload `contracts/retractionwatch.py` at studio.genlayer.com, then update the single constant in `frontend/src/config/chains.ts` with the new address — this is the only place it needs to change.

## Frontend

Not yet deployed to Vercel. To deploy:

```bash
cd frontend
npm install
npm run build
```

Then deploy the `frontend/` directory to Vercel. `vercel.json` already contains the required SPA rewrite.

## Testing status — matches the README exactly

The full `register_paper → file_check → resolve_check` lifecycle has been run live against the deployed contract across three structurally different real inputs: a confirmed-retracted DOI, a confirmed-active DOI, and an arXiv-only preprint. All three produced correct verdicts, correct `assertion_accurate` comparisons, and zero problematic validator rotation. The `sources_conflict` verdict has not been exercised live. The frontend has been structurally audited but not run through a real networked build.
