# Evidence audit — October 24, 2026

This review changes what the map claims, not just how it looks. A working map is not proof that its geographic interpretation is correct.

| Step | Reviewable change | Status and limits |
| --- | --- | --- |
| 1. Definitions | New definition chapter before the baseline; school definition linked to NYCPS; campus cards state the actual homelessness question, recall period, population, weighting, and uncertainty. | School reporting classifications and college self-reports are kept distinct. Queensborough's 38% is identified as a four-item composite that includes homelessness. |
| 2. Workbook provenance | Published XLSX retained; all worksheet cells and SHA-256 compared; sources updated. | Exact byte match; 10,530 cells, zero differences. See `workbook-comparison.json` and `scripts/verify_workbook.py`. |
| 3. Geographic meaning | Reporting-LEA wording in map methods, tooltips, selected records, and export metadata. | Source establishes agency-year counts. Exact NYC extract aggregation/exception handling is not fully documented by the checked material; a question is prepared in `reporting-geography.md`, not sent. No residence inference. |
| 4. Enrollment context | Separate AFC published percentage-range view for all 32 districts, with source/coverage note and fixed 2023–24 period. | Uses AFC's cumulative-enrollment method and published categories, not a single-day denominator. Charter coverage differs from the LEA workbook. No exact percentages or category midpoints inferred. See `enrollment-decision.md`. |
| 5. College evidence | Central dashboard filtered to 2024 housing: 19 published campus profiles and seven institution records without a separate undergraduate column. | Whole-percent estimates; no imputation. QCC central scale 44% differs from campus four-item 38%; LaGuardia rent difficulty 39% versus report 40%. See statistical-analysis.md and retained aggregate CSVs. |
| 6. Historical boundaries | A point-of-use note and `boundary-review.md` document source access attempts. | Unresolved: DCP archive returned access denied; retired dataset was unavailable; Census administrative-area query supplied no NYC substitute. No stable-boundary or coastline-only claim. The app uses explicitly labeled DCP 2026 reference geometry. |
| 7. Educational consequences | New chapter with separately sourced absenteeism and graduation findings and population/year labels. | AFC's NYCPS educational-indicator findings exclude charter schools. They are not calculated from this workbook and do not establish causation. |
| 8. Experiences | Attributed September 2026 BCC account, clearly separated from the study years; `docs/interview-guide.md` includes questions, voluntary participation, consent, and publication checks. | No interviews or outreach conducted. The published story is not linked to the mapped cohorts, used as prevalence evidence, or turned into a personal route map. |
| 9. Bridge and ending | Explicit statement that K–12 and college populations are not longitudinally linked; current support descriptions linked; ending distinguishes supply/eligibility/funding from possible follow-up barriers. | HOMES OS remains a research direction, not an established intervention. Service availability and outcomes are not verified. |
| 10. Audit | Reproducible count/source checks, data regeneration, local-link/HTML checks, lint, and browser interaction tests. | Test results are reported in the handoff. Passing software tests does not resolve the external source limitations above. |

## What is still needed from outside this project

- A documented extract specification or agency clarification for NYC LEA attribution and transfer/District 75 treatment.
- Archived DCP geometry for the study years, with internal-boundary change notes, before claiming historical geographic consistency.
- Further research for graduate institutions, SUNY and private universities; no separate undergraduate column does not establish no public research.
- Consented interviews and current service verification before making workflow or product-effectiveness claims.

These items are visible limitations, not findings of “no change,” “no homelessness,” or “no services.” No messages have been sent on Thomas's behalf.

## Current analysis update

The opening quotation is traced to Habitat for Humanity’s interview with Matthew Desmond. The source chapter now includes descriptive findings, calculation steps, ten citation entries and direct source/download links. District median growth is 42.1%; 19 campus profiles replace the previous two-profile coverage. Current validation results are recorded after running the updated audits. Previous 2/5/19 status-filter tests do not describe the new 19/7 coverage.

## Validation of the expanded evidence and opening

- `extract_cuny_survey.py`, `prepare_colleges.py`, `analyze_evidence.py`, and `audit_evidence.py`: passed. All 76 mapped campus values (19 × 4) independently match the retained source-table display values. Workbook checks and district-rate categories remain intact. All HTML anchors and local source/download paths resolve.
- ESLint and Stylelint: passed.
- Headless Chrome, desktop and 390 px mobile: 32 districts, published-rate view, playback, legend filters, pins/comparisons, 19 / 7 campus status filters, housing-scale results, CSV contents, shared URL restoration, map expansion, Escape dismissal, ten source entries, new introduction, and no horizontal page overflow passed. No uncaught browser exceptions.
- Opening revised to Thomas's supplied HAQI Partners narrative. AFC 2024–25 figures verified against the original brief page 1 and publication page. The graphic uses published rounded 53% / 42% / 5% shares, with text labels and an accessible description. It is citywide context; district maps retain 2021–24 counts and explicit period labels. The original screenshot is not reproduced.
- Citation reachability is recorded in `citation-link-check.json`; this verifies destinations, while the source register records what supports each claim. Direct AFC PDF citations avoid automated access restrictions on their publication pages.

Outstanding limits remain: historical boundaries; exact NYC LEA extract rules; central housing-scale scoring; the one-point LaGuardia source difference; item-level survey uncertainty; graduate/SUNY/private coverage; interviews and actual service capacity. Calculations do not settle these questions.
