# Client approvals — collected for the end of the clean-up

TeraWulf is specific about what appears on the site. **New content** (new
copy or new sections) waits here for the client; the agency raises the list
with the client as the last step of the clean-up. Fixes to existing links,
cards, redirects, indexing and schema are agency decisions
([`DECISIONS.md`](DECISIONS.md)) and do not go through this file. Record each
outcome in the Status column.

| ID | What changes | Where | Why | Status |
| --- | --- | --- | --- | --- |
| A1 | New FAQ sections (4–6 questions each), drafted only from facts already on the site, with FAQPage schema | WULF Compute, Our Sites | AEO/GEO: plain, quotable answers for AI search | Draft ready, 12 questions (see A1 below) |
| A2 | New `llms.txt` file at www.terawulf.com/llms.txt: a plain-text guide for AI assistants, built only from wording already on the site (the page meta descriptions and the company schema). Draft: `docs/audit/batch-2/llms.txt` | Site root (not a visible page) | AEO/GEO: tells AI answer engines what TeraWulf is and which pages to cite | Draft updated 2026-10-09 (see A2 below) |

---

## A1 — FAQ draft (for client review)

**What it is:** 12 short questions and answers that people and AI assistants
commonly ask about TeraWulf. Every answer repeats or closely paraphrases
wording already live on www.terawulf.com (checked 2026-10-09). Each answer has
a "Source" line with the page it comes from. Nothing new is claimed.

**Suggested placement:** one "Frequently asked questions" section on the
**About page** (`/about#faq`), after Leadership and before "Partner With Us".
The questions cover the whole company (ticker, contact, careers), so one place
works better than splitting them. If you prefer the original plan, Q3–Q6 fit
the WULF Compute page and Q2, Q5–Q7 fit Our Sites; Q1, Q8–Q12 would then stay
on About.

**Why:** AI assistants and search engines quote short, plain answers. The
FAQ code below (FAQPage schema) labels each question and answer for them.
Google now shows FAQ rich results only for government and health sites, so
the benefit is mainly AI answers, not a change in how Google results look.

**Rule:** the answers in the code must match the text on the page word for
word. If any answer is edited, the code is updated to match.

### Questions and answers

**Q1. What does TeraWulf do?**

TeraWulf develops and operates large-scale digital infrastructure designed for AI and high-performance computing (HPC) workloads. The company describes itself as energy operators first: it secures power, develops scalable sites and operates them with disciplined execution. Its view is that AI and HPC scale only as fast as power allows, so TeraWulf delivers both the power and the infrastructure that make sustained growth possible.

Source: https://www.terawulf.com/about · https://www.terawulf.com/

**Q2. Where are TeraWulf's data center campuses?**

TeraWulf lists five campuses: Lake Mariner Data in Barker, New York; Lake Hawkeye Data in Lansing, New York; Justified Data in Hawesville, Kentucky; Muskie Data in Eastern, Kentucky; and Chesapeake Data & Energy in Charles County, Maryland. Lake Mariner, the flagship campus, is operating. Justified Data is in development, Muskie Data is in planning and permitting, and Lake Hawkeye and Chesapeake are in permitting.

Source: https://www.terawulf.com/our-sites · https://www.terawulf.com/our-operations

**Q3. What is WULF Compute?**

WULF Compute is the digital infrastructure arm of TeraWulf. It develops and operates high-density AI and HPC data campuses powered by energy-secured infrastructure. It is built for hyperscale technology companies and AI developers that need secure, high-density infrastructure for AI model training, AI inference and high-performance computing. The infrastructure is Tier III–aligned and engineered for rapid deployment.

Source: https://www.terawulf.com/wulf-compute · https://www.terawulf.com/our-operations

**Q4. How does TeraWulf secure power for its data centers?**

TeraWulf's strategy starts from the view that AI compute is increasingly limited by access to power. The company combines generation control, grid infrastructure expertise and demand response to secure reliable, dispatchable power. It prioritizes locations where energy and grid infrastructure already exist, often redeveloping legacy energy and industrial sites. Its sites offer direct grid connectivity and, in select locations, integrated generation.

Source: https://www.terawulf.com/our-operations · https://www.terawulf.com/about · https://www.terawulf.com/our-impact

**Q5. What kind of energy powers TeraWulf's campuses?**

It depends on the campus. Lake Mariner Data and Lake Hawkeye Data in New York have access to predominantly zero-carbon grid power. Chesapeake Data & Energy in Maryland uses a Bring Your Own Generation (BYOG) model with on-site generation, battery storage and optional gas firming. Justified Data in Kentucky reuses existing industrial and transmission infrastructure at the former Century Aluminum smelter site.

Source: https://www.terawulf.com/our-sites · https://www.terawulf.com/our-impact

**Q6. How much power capacity does TeraWulf have?**

TeraWulf reports 2.9 GW of power controlled and 839 MW contracted across five locations. Critical IT capacity by campus is 600 MW at Lake Mariner Data, 401 MW at Justified Data, 800 MW at Muskie Data, 320 MW at Lake Hawkeye Data and 800 MW at Chesapeake Data & Energy. The Our Sites page shows the latest figures for each campus.

Source: https://www.terawulf.com/ · https://www.terawulf.com/our-sites

**Q7. Do TeraWulf's data centers use a lot of water?**

TeraWulf says its campuses use a closed-loop cooling design: a fully sealed system that continuously recirculates cooling fluid, renewed only every 7–15 years, with no local water withdrawal or discharge. The campuses are also designed for low noise, keeping sound levels well below local limits through acoustic engineering and enclosed equipment structures.

Source: https://www.terawulf.com/our-impact

**Q8. What is Beowulf Energy & Data?**

Beowulf Energy & Data is TeraWulf's energy infrastructure and operations platform, responsible for developing, operating and managing power and digital infrastructure assets. Across North America, Beowulf teams have developed and operated generation assets, managed large-scale infrastructure projects and delivered reliable power to the electric grid and industrial customers. That experience now supports TeraWulf's infrastructure for AI and high-performance computing.

Source: https://www.terawulf.com/our-expertise

**Q9. Who leads TeraWulf?**

TeraWulf was co-founded by Paul Prager, its Chairman and Chief Executive Officer, and Nazar Khan, its Chief Technology Officer. The management team also includes Patrick Fleury, Chief Financial Officer; Sean Farrell, Chief Operating Officer; Kerri Langlais, Chief Strategy Officer; Stefanie Fleischmann, Chief Legal Officer & Secretary; and Will Tanimoto, Chief Accounting Officer. Full biographies are on the About page.

Source: https://www.terawulf.com/about#leadership

**Q10. What is TeraWulf's stock ticker?**

TeraWulf Inc. is listed on Nasdaq under the ticker symbol WULF. Financial reports, SEC filings, governance documents, press releases and company updates are on the TeraWulf investor portal at investors.terawulf.com. John Larkin, Director of Investor Relations, is the company's primary point of contact for investors.

Source: https://www.terawulf.com/ · https://investors.terawulf.com/ · https://www.terawulf.com/about#leadership

**Q11. How do I contact TeraWulf about partnerships, media or investor relations?**

Use the form on the Connect page and choose a reason for your inquiry: General Inquiry, Media, Partnerships or Careers. The TeraWulf team will direct your request to the appropriate department. You can also email info@terawulf.com. Investors can find financial reports, SEC filings and company updates on the investor portal at investors.terawulf.com.

Source: https://www.terawulf.com/connect · https://www.terawulf.com/

**Q12. Is TeraWulf hiring?**

Current openings are listed on the Careers page at terawulf.com/careers. TeraWulf offers competitive pay with long-term incentive opportunities, comprehensive health and well-being benefits, and a 401(k) with a 5% company match for eligible employees. Its projects also create skilled construction and trade jobs during development and permanent technical and operational roles once campuses are operating.

Source: https://www.terawulf.com/careers · https://www.terawulf.com/our-impact

### Please confirm (flagged for the client)

1. **Capacity figures (Q6).** The homepage shows "2.9 GW Controlled" and
   "839 MW Contracted", but a sentence higher on the same page says TeraWulf
   "currently controls 2.3 gigawatts". Which is current? (The Our Sites
   campus figures add up to 2.9 GW and 839 MW contracted.) These numbers will
   change over time; you may prefer to drop Q6 rather than keep it updated.
2. **Campus status (Q2).** Operating / Development / Planning & Permitting /
   Permitting are taken from Our Sites today. Please confirm they are current.
   **Texas:** the Home page campus map still names "Abernathy TX" (in its
   image description), but Our Sites lists five campuses and none in Texas.
   The company profile in the site's structured data also says "New York,
   Texas, Kentucky and Maryland". Is Abernathy still a TeraWulf site? The
   FAQ and llms.txt drafts follow Our Sites (no Texas); we will align the
   map description and the company profile to your answer.
3. **Muskie Data location (Q2, llms.txt).** The site says "Eastern, KY". We
   wrote "Eastern, Kentucky". Is that the place name, or should it read
   "eastern Kentucky"?
4. **Nasdaq (Q10, llms.txt).** "WULF" appears in visible text, but "Nasdaq"
   appears on www.terawulf.com only in an image description and the
   company's structured data, and the investor portal shows "TeraWulf Inc.
   (WULF)". Please confirm "listed on Nasdaq under the ticker symbol WULF".
5. **Email address (Q11).** info@terawulf.com is on the Connect page only as
   an email icon, not as written text. OK to print it in an answer?
6. **Investor contact (Q11).** The Connect page says it handles investor
   relations, but the form's options are General Inquiry, Media,
   Partnerships and Careers. Should investors use the form, or only the
   investor portal?
7. **Water and noise (Q7).** Our Impact describes closed-loop cooling (fluid
   renewed every 7–15 years) and low-noise design for "our campuses". Does
   this apply to every campus, including Lake Mariner today?
8. **Benefits (Q12).** Please confirm the 401(k) 5% company match is current.
9. **Beowulf name (Q8).** Our Expertise says "Beowulf Energy & Data"; the
   leadership bios say "Beowulf Electricity & Data Inc." and "Beowulf Energy
   LLC". Which name should the FAQ use?
10. **Energy mix (Q5).** Older blog posts on the site (2022–2023) say
    TeraWulf uses "91%+ zero-carbon" power. We left that out as it describes
    the earlier bitcoin-mining business; the answer uses only the current
    Our Sites wording.

### FAQ code (FAQPage JSON-LD) for the About page

Goes in About → Page settings → custom code (before `</head>`), only after
the visible FAQ section is live with exactly the same text. Validated as
JSON.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://www.terawulf.com/about#faq",
  "url": "https://www.terawulf.com/about",
  "isPartOf": {
    "@id": "https://www.terawulf.com/#website"
  },
  "about": {
    "@id": "https://www.terawulf.com/#organization"
  },
  "inLanguage": "en-US",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does TeraWulf do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TeraWulf develops and operates large-scale digital infrastructure designed for AI and high-performance computing (HPC) workloads. The company describes itself as energy operators first: it secures power, develops scalable sites and operates them with disciplined execution. Its view is that AI and HPC scale only as fast as power allows, so TeraWulf delivers both the power and the infrastructure that make sustained growth possible."
      }
    },
    {
      "@type": "Question",
      "name": "Where are TeraWulf's data center campuses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TeraWulf lists five campuses: Lake Mariner Data in Barker, New York; Lake Hawkeye Data in Lansing, New York; Justified Data in Hawesville, Kentucky; Muskie Data in Eastern, Kentucky; and Chesapeake Data & Energy in Charles County, Maryland. Lake Mariner, the flagship campus, is operating. Justified Data is in development, Muskie Data is in planning and permitting, and Lake Hawkeye and Chesapeake are in permitting."
      }
    },
    {
      "@type": "Question",
      "name": "What is WULF Compute?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "WULF Compute is the digital infrastructure arm of TeraWulf. It develops and operates high-density AI and HPC data campuses powered by energy-secured infrastructure. It is built for hyperscale technology companies and AI developers that need secure, high-density infrastructure for AI model training, AI inference and high-performance computing. The infrastructure is Tier III–aligned and engineered for rapid deployment."
      }
    },
    {
      "@type": "Question",
      "name": "How does TeraWulf secure power for its data centers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TeraWulf's strategy starts from the view that AI compute is increasingly limited by access to power. The company combines generation control, grid infrastructure expertise and demand response to secure reliable, dispatchable power. It prioritizes locations where energy and grid infrastructure already exist, often redeveloping legacy energy and industrial sites. Its sites offer direct grid connectivity and, in select locations, integrated generation."
      }
    },
    {
      "@type": "Question",
      "name": "What kind of energy powers TeraWulf's campuses?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It depends on the campus. Lake Mariner Data and Lake Hawkeye Data in New York have access to predominantly zero-carbon grid power. Chesapeake Data & Energy in Maryland uses a Bring Your Own Generation (BYOG) model with on-site generation, battery storage and optional gas firming. Justified Data in Kentucky reuses existing industrial and transmission infrastructure at the former Century Aluminum smelter site."
      }
    },
    {
      "@type": "Question",
      "name": "How much power capacity does TeraWulf have?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TeraWulf reports 2.9 GW of power controlled and 839 MW contracted across five locations. Critical IT capacity by campus is 600 MW at Lake Mariner Data, 401 MW at Justified Data, 800 MW at Muskie Data, 320 MW at Lake Hawkeye Data and 800 MW at Chesapeake Data & Energy. The Our Sites page shows the latest figures for each campus."
      }
    },
    {
      "@type": "Question",
      "name": "Do TeraWulf's data centers use a lot of water?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TeraWulf says its campuses use a closed-loop cooling design: a fully sealed system that continuously recirculates cooling fluid, renewed only every 7–15 years, with no local water withdrawal or discharge. The campuses are also designed for low noise, keeping sound levels well below local limits through acoustic engineering and enclosed equipment structures."
      }
    },
    {
      "@type": "Question",
      "name": "What is Beowulf Energy & Data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Beowulf Energy & Data is TeraWulf's energy infrastructure and operations platform, responsible for developing, operating and managing power and digital infrastructure assets. Across North America, Beowulf teams have developed and operated generation assets, managed large-scale infrastructure projects and delivered reliable power to the electric grid and industrial customers. That experience now supports TeraWulf's infrastructure for AI and high-performance computing."
      }
    },
    {
      "@type": "Question",
      "name": "Who leads TeraWulf?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TeraWulf was co-founded by Paul Prager, its Chairman and Chief Executive Officer, and Nazar Khan, its Chief Technology Officer. The management team also includes Patrick Fleury, Chief Financial Officer; Sean Farrell, Chief Operating Officer; Kerri Langlais, Chief Strategy Officer; Stefanie Fleischmann, Chief Legal Officer & Secretary; and Will Tanimoto, Chief Accounting Officer. Full biographies are on the About page."
      }
    },
    {
      "@type": "Question",
      "name": "What is TeraWulf's stock ticker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TeraWulf Inc. is listed on Nasdaq under the ticker symbol WULF. Financial reports, SEC filings, governance documents, press releases and company updates are on the TeraWulf investor portal at investors.terawulf.com. John Larkin, Director of Investor Relations, is the company's primary point of contact for investors."
      }
    },
    {
      "@type": "Question",
      "name": "How do I contact TeraWulf about partnerships, media or investor relations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use the form on the Connect page and choose a reason for your inquiry: General Inquiry, Media, Partnerships or Careers. The TeraWulf team will direct your request to the appropriate department. You can also email info@terawulf.com. Investors can find financial reports, SEC filings and company updates on the investor portal at investors.terawulf.com."
      }
    },
    {
      "@type": "Question",
      "name": "Is TeraWulf hiring?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Current openings are listed on the Careers page at terawulf.com/careers. TeraWulf offers competitive pay with long-term incentive opportunities, comprehensive health and well-being benefits, and a 401(k) with a 5% company match for eligible employees. Its projects also create skilled construction and trade jobs during development and permanent technical and operational roles once campuses are operating."
      }
    }
  ]
}
```

---

## A2 — llms.txt draft (re-checked 2026-10-09)

**What it is:** a plain-text file at www.terawulf.com/llms.txt that tells AI
assistants what TeraWulf is and which pages to read and cite. It is not a
visible page. Today that address returns "page not found".

**Checked against the live site on 2026-10-09:** every link returns 200 with
no redirect. No `/resources` pages are listed: the three linked from the
homepage are set to noindex, and the eight that are indexed are 2022–2025
posts about bitcoin mining, which no longer describe the business.

**What changed from the first draft:**

- **Removed "Texas"** from the summary. The site lists campuses in New York,
  Kentucky and Maryland only. (The company structured data in the site head
  also says Texas; that is an agency fix, logged separately.)
- Summary now uses the About page wording.
- **Added:** Home, Leadership, the five campuses (name and location only, so
  the file does not go out of date when a status changes), Press Releases,
  and the CSR Report FY2025 linked from Our Impact.
- Investor Relations line now uses the homepage wording ("financial reports,
  SEC filings, governance documents, and company updates") instead of our
  own.
- Careers line now uses the Careers page description.
- Once the FAQ (A1) is live, add a line for `/about#faq`.

**Please confirm:** the Nasdaq wording and "Eastern, Kentucky" (A1 items 3
and 4). Should the old blog posts be listed? We suggest not.

```markdown
# TeraWulf

> TeraWulf develops and operates large-scale digital infrastructure designed for AI and high-performance computing workloads, with power-secured data center campuses in New York, Kentucky and Maryland. TeraWulf Inc. is listed on Nasdaq as WULF.

## Company

- [Home](https://www.terawulf.com/): Energy infrastructure for next-generation AI and high-performance computing. TeraWulf delivers scalable, power-secured infrastructure for AI and HPC growth.
- [About](https://www.terawulf.com/about): TeraWulf develops and operates large-scale digital infrastructure designed for AI and high-performance computing workloads.
- [Leadership](https://www.terawulf.com/about#leadership): TeraWulf's management team and board of directors.
- [Our Operations](https://www.terawulf.com/our-operations): TeraWulf develops and operates digital infrastructure for large-scale AI and high-performance computing, built on secured power and scalable design.
- [WULF Compute](https://www.terawulf.com/wulf-compute): WULF Compute develops and operates high-density AI and HPC data campuses powered by energy-secured infrastructure.
- [Our Expertise](https://www.terawulf.com/our-expertise): TeraWulf's energy infrastructure expertise, including Beowulf Energy & Data's role in developing, operating, and managing power and digital infrastructure assets.
- [Our Impact](https://www.terawulf.com/our-impact): TeraWulf develops and operates digital infrastructure with a focus on responsible energy use, community partnership, and long-term economic impact.

## Sites

- [Our Sites](https://www.terawulf.com/our-sites): TeraWulf's growing portfolio of power-secured data center campuses designed for scalable compute infrastructure and long-term expansion.
- [Lake Mariner Data](https://www.terawulf.com/our-sites#lake-mariner-data): TeraWulf's flagship campus in Barker, New York.
- [Lake Hawkeye Data](https://www.terawulf.com/our-sites#lake-hawkeye-data): Campus in Lansing, New York.
- [Justified Data](https://www.terawulf.com/our-sites#justified-data): Campus in Hawesville, Kentucky.
- [Muskie Data](https://www.terawulf.com/our-sites#muskie-data): Campus in Eastern, Kentucky.
- [Chesapeake Data & Energy](https://www.terawulf.com/our-sites#chesapeake-data-energy): Campus in Charles County, Maryland.

## News and investors

- [News & Media](https://www.terawulf.com/news): Updates, announcements, and insights from TeraWulf, including company news, videos, blog posts, and media coverage.
- [Investor Relations](https://investors.terawulf.com/): TeraWulf's investor resources, such as financial reports, SEC filings, governance documents, and company updates.
- [Press Releases](https://investors.terawulf.com/news-events/press-releases): TeraWulf press releases on the investor portal.

## Contact

- [Connect](https://www.terawulf.com/connect): Partnership opportunities, media inquiries, investor relations, or general questions.
- [Careers](https://www.terawulf.com/careers): Career opportunities at TeraWulf, building energy-first infrastructure for AI and high-performance computing.

## Optional

- [CSR Report FY2025](https://d1io3yog0oux5.cloudfront.net/_286bff50c78a813f7d4e259725325763/terawulf/db/2386/21653/pdf/TeraWulf+CSR+Report+FY2025.pdf): TeraWulf's corporate social responsibility report, linked from the Our Impact page.
```
