# Finsweet: CDN v1/v2 → bundled v2 (STATUS A6)

Code side done in the repo (2026-10-09): Finsweet Attributes **2.7.1**
(List, Custom Select, Social Share) is bundled into `dist/fs-bundle.js`.
`index.js` loads it only on pages that have an `fs-list-element`,
`fs-selectcustom-element` or `fs-socialshare-element`, from the same pinned
release (no CDN, version moves with RELEASE). Every other page downloads
nothing extra.

The Webflow side needs the connector, ships in the same publish as the
release that contains `fs-bundle.js`, and is verified on staging first.

## Today (live)

| Page | Loads | Uses |
| --- | --- | --- |
| /news | 4 CDN scripts: v1 selectcustom, cmsload, cmsfilter, cmssort | the resources list (load more, filter by category + search, sort by date), filter dropdown |
| /careers | v1 selectcustom (CDN) | **nothing** — no `fs-` attributes on the page (the job list is the ADP embed) |
| Resources template | v2 loader (CDN) with `fs-socialshare` | 4 share buttons (`fs-socialshare-element`); the email one uses `socialshare-element` and its own handler |

## Webflow changes at cutover

### /news markup (v1 → v2 List)

| Element | v1 attributes (remove) | v2 attributes (add) |
| --- | --- | --- |
| `.resources-list.w-dyn-items` | `fs-cmsload-element="list"`, `fs-cmsfilter-element="list"`, `fs-cmssort-element="list"`, `fs-cmsload-mode="load-under"`, `fs-cmsfilter-showquery="true"` | `fs-list-element="list"`, `fs-list-load="more"`, `fs-list-showquery="true"` |
| `form.filter` | `fs-cmsfilter-element="filters"` | `fs-list-element="filters"` |
| search input `.filter-search-input` | `fs-cmsfilter-field="title,date,category,description,topic"` | `fs-list-field="title,date,category,description,topic"` |
| category checkboxes (3 × label span) | `fs-cmsfilter-field="category"` on the label span | `fs-list-field="category"` on the checkbox **input** (v2 reads the value from the input/label; verify on staging) |
| clear input | `fs-cmsfilter-element="clear"` | `fs-list-element="clear"` |
| `section` scroll anchor | `fs-cmsfilter-element="scroll-anchor"` | `fs-list-element="scroll-anchor"` |
| card title `.d5` | `fs-cmsfilter-field="title"` | `fs-list-field="title"` |
| card description | `fs-cmsfilter-field="description"` | `fs-list-field="description"` |
| card category pill | `fs-cmsfilter-field="category"` | `fs-list-field="category"` |
| card date | `fs-cmssort-field="date"`, `fs-cmssort-type="date"` | `fs-list-field="date"`, `fs-list-fieldtype="date"` |
| hidden sort select (`u-hide`) | `fs-cmssort-element="trigger"`, `fs-cmssort-type="date"` | `fs-list-element="sort-trigger"` (keep its options; check the default order is still newest first) |
| 4 hero pills | `fs-list-field=""` (empty, stray) | remove |
| filter dropdown | `fs-selectcustom-element="dropdown"` / `"label"` | unchanged (same names in v2) |

### Custom code

- /news head: delete the 4 v1 `<script>` tags.
- /careers head: delete the v1 selectcustom `<script>` (unused).
- Resources template head: delete the v2 CDN loader (`attributes@2` with
  `fs-socialshare`). Keep the BlogPosting JSON-LD.

### Staging checks before "publish"

- /news: first page of cards, "load more", each category filter, search
  ("AI", "Lake Mariner"), clear, sort order newest first, URL query
  (`showquery`), scroll anchor; mobile dropdown opens and closes.
- Articles: X / Facebook / LinkedIn / Pinterest share open the right
  intent URLs; email share still opens.
- No `cdn.jsdelivr.net/npm/@finsweet` requests on any page;
  `fs-bundle.js` requested only on /news and articles.

Rollback: the old head code is in `docs/rollback/2026-10-09/pages/`
(news-head, careers-head, resources-template-head).
