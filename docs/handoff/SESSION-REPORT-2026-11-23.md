# Session report: 2026-11-23

The Claude Code sessions listed below were archived on 2026-11-23 to keep the Claude app responsive. This file records where each one left off, so a new session can pick up the work.

Read this with `HANDOFF.md` (the project brief and its Status section). If something here conflicts with `HANDOFF.md`, `HANDOFF.md` and the git history are more current.

To reopen a session, go to the Claude app's sidebar → Archived, or use the session link while the app is installed.

## Open items

- None recorded. Check `HANDOFF.md` › Status and `MANUAL-TODO.md`.

## Repo state on 2026-11-23

Latest commits on the default branch:

- bd35fa3 2026-11-20 Merge pull request #14 from brandvm/chore/template-1.0.1
- 875bd02 2026-11-20 docs: rollback point 2026-11-20 (before batch TW-1)
- ad222f2 2026-11-20 chore: wf-template 1.0.1
- 7b84c7d 2026-11-20 Merge pull request #13 from brandvm/chore/template-1.0.0
- 8a4691f 2026-11-20 chore: wf-template 1.0.0 — skills, tooling, loader without dev mode
- d4e5f19 2026-11-03 GOTCHAS: mark 3 entries harvested into wf-template 0.15.0 (#12)

Branches not merged into the default branch:

- `origin/docs/batch-6-live`
- `origin/feat/ix2-to-repo`

Open pull requests:

- #11 B7: move the remaining 14 Webflow IX2 interactions into the repo (v1.5.0) (`feat/ix2-to-repo`)

## Sessions (newest first)

### TeraWulf: batch 1 (template 1.0.0, loader, icons)

- **Active:** 2026-11-20 → 2026-11-23 12:54
- **Session:** [local_735d3b10-4a92-47d9-90ef-409e5b6c0b37](claude://claude.ai/epitaxy/local_735d3b10-4a92-47d9-90ef-409e5b6c0b37) (archived)
- **PR:** [brandvm/terawulf#13](https://github.com/brandvm/terawulf/pull/13)
- **PR:** [brandvm/terawulf#14](https://github.com/brandvm/terawulf/pull/14)
- **Started with:** "Another Claude session sent a message: <cross-session-message from="local_63d734be-a5b4-428c-b937-21a62dc9c2d3" from-name="Harvest client lessons, then audit 8 client sites"> Go-ahead from the user ("can you tell them?", after the next-step list): merge brandvm/terawulf#13 (CI is green), then contin…"
- **Status:** staging on 1.4.3, prod unchanged; awaiting publish call
- **Recent progress:**
  - 2026-11-20 20:25 UTC: Auto-fix couldn't be turned on for PR #13: the app can't match the terawulf repository to this session's folders. CI's test job is running. Nothing is merged or tagged yet.
  - 2026-11-20 22:38 UTC: PR #13 is merged. PR #14 (template 1.0.1) is open with CI running, and the rollback folder for today is written but not committed. Webflow writes are blocked: the webflow-terawulf MCP server isn't loaded in this session.
  - 2026-11-20 22:47 UTC: The rest of TeraWulf batch 1 has moved to a new session in the TeraWulf (Live) folder, where the webflow-terawulf connection loads. It starts by asking you to sign in with /mcp, ticking only the TeraWulf site. PR #14, tag v1.4.3, the staging writes, Lighthouse and Figma are still to do there, each asked for first.

### TeraWulf batch 1: staging via the MCP

- **Active:** 2026-11-20 → 2026-11-23 10:12
- **Session:** [local_bedf9d1d-8150-4fac-aca1-d71b7cf20fc2](claude://claude.ai/epitaxy/local_bedf9d1d-8150-4fac-aca1-d71b7cf20fc2) (archived)
- **PR:** [brandvm/terawulf#14](https://github.com/brandvm/terawulf/pull/14)
- **Where it ended:** Staging is verified: the 1.4.3 loader leaves `/`, `/our-operations` and `/wulf-compute` pixel-identical to production at all three widths, with no console errors.
- **Recent progress:**
  - 2026-11-23 15:05 UTC: `webflow-terawulf` reaches only TeraWulf (69cc1149…), and the live head, footer and Embeds 2a/2b match the rollback files. The backup is ticked in the README locally, not committed yet. The four 1.4.3 snippets are ready, and nothing has been written to Webflow so far.
  - 2026-11-23 15:10 UTC: The 1.4.3 loader is on staging only; production still runs 1.4.2. The loader checks pass on staging and in a simulated production run: CSS in head, one fetch, clean console. The visual baseline comparison is still running.
  - 2026-11-23 15:12 UTC: Staging is verified: the 1.4.3 loader leaves `/`, `/our-operations` and `/wulf-compute` pixel-identical to production at all three widths, with no console errors. Production (www) is still on 1.4.2 and waits for your "publish" or "hold". Lighthouse, docs and Figma come next.

