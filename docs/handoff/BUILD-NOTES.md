# Build notes

What the build handoff needs (see the skill's `checklists.md` › Build
handoff). Kept current during the build, not written at the end. No
credentials here: name the vault entry instead.

## CMS notes

How to edit what: each collection and its fields, which sections are
conditional on which field, and each component's props.

| Collection / component | How to edit | Notes |
| --- | --- | --- |
| | | |

## Integrations

| Service | What it does | Where it's configured | Vault entry |
| --- | --- | --- | --- |
| | | | |

## Changes log

Changes made during the build that differ from the approved design, and
who approved them.

- <Date> · <change> · <approved by>

## Redirect map

Every old URL → its closest new page, from the crawl saved in discovery.

| Old URL | New URL | Status |
| --- | --- | --- |
| | | 301 |

## Known issues

### Fix before launch

The site has been live since before the 2026-10 clean-up; open items are listed below.

### Fix after launch

Open to-dos from the 2026-10 clean-up (decisions: `docs/audit/DECISIONS.md`):

- Careers and About intro previews autoplay the full popup files (Careers: the 59 MB 1080p file, ~3.6 MB in the first 6 s, still streaming). Make a short compressed loop (~5–10 s, 720p, no audio, ~1–2 MB) for each preview and keep the full file for the popup only. Planned for the video step · agency
- Class `Grid Guide W`: Webflow refuses to delete it because something still uses it, probably an element inside a component. Find it, remove it, then delete the class · agency
- Component G | Embed Code: unused since 2026-10-09 (replaced by G | Components); delete its definition after production is confirmed on v1.2.0 · agency
- MANUAL-TODO row A: `crossorigin="anonymous"` on the Interactive Canvas Image (the API can't set it) · person
