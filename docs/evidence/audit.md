# Evidence audit — October 24, 2026

This review changes what the map claims, not just how it looks. A working map is not proof that its geographic interpretation is correct.

| Step | Reviewable change | Status and limits |
| --- | --- | --- |
| 1. Definitions | New definition chapter before the baseline; school definition linked to NYCPS; campus cards state the actual homelessness question, recall period, population, weighting, and uncertainty. | School reporting classifications and college self-reports are kept distinct. Queensborough's 38% is identified as a four-item composite that includes homelessness. |
| 2. Workbook provenance | Published XLSX retained; all worksheet cells and SHA-256 compared; sources updated. | Exact byte match; 10,530 cells, zero differences. See `workbook-comparison.json` and `scripts/verify_workbook.py`. |
| 3. Geographic meaning | Reporting-LEA wording in map methods, tooltips, selected records, and export metadata. | Source establishes agency-year counts. Exact NYC extract aggregation/exception handling is not fully documented by the checked material; a question is prepared in `reporting-geography.md`, not sent. No residence inference. |
| 4. Enrollment context | Separate AFC published percentage-range view for all 32 districts, with source/coverage note and fixed 2023–24 period. | Uses AFC's cumulative-enrollment method and published categories, not a single-day denominator. Charter coverage differs from the LEA workbook. No exact percentages or category midpoints inferred. See `enrollment-decision.md`. |
| 5. College evidence | Two checked profiles now carry methods; five additional campus source pages reviewed; evidence-status filters added. Central CUNY methods reviewed in a public browser. | 2 available, 5 reviewed/pending, 19 not yet checked. A default Tableau CSV was 2026/Academic Experience, so it was rejected as housing evidence. No campus is labeled “no public data” merely because a value was not found. No SUNY/private prevalence mapped. |
| 6. Historical boundaries | A point-of-use note and `boundary-review.md` document source access attempts. | Unresolved: DCP archive returned access denied; retired dataset was unavailable; Census administrative-area query supplied no NYC substitute. No stable-boundary or coastline-only claim. The app uses explicitly labeled DCP 2026 reference geometry. |
| 7. Educational consequences | New chapter with separately sourced absenteeism and graduation findings and population/year labels. | AFC's NYCPS educational-indicator findings exclude charter schools. They are not calculated from this workbook and do not establish causation. |
| 8. Experiences | Attributed September 2026 BCC account, clearly separated from the study years; `docs/interview-guide.md` includes questions, voluntary participation, consent, and publication checks. | No interviews or outreach conducted. The published story is not linked to the mapped cohorts, used as prevalence evidence, or turned into a personal route map. |
| 9. Bridge and ending | Explicit statement that K–12 and college populations are not longitudinally linked; current support descriptions linked; ending distinguishes supply/eligibility/funding from possible follow-up barriers. | HOMES OS remains a research direction, not an established intervention. Service availability and outcomes are not verified. |
| 10. Audit | Reproducible count/source checks, data regeneration, local-link/HTML checks, lint, and browser interaction tests. | Test results are reported in the handoff. Passing software tests does not resolve the external source limitations above. |

## What is still needed from outside this project

- A documented extract specification or agency clarification for NYC LEA attribution and transfer/District 75 treatment.
- Archived DCP geometry for the study years, with internal-boundary change notes, before claiming historical geographic consistency.
- Further campus-specific source review before broadening prevalence coverage. Inaccessible internal reports do not imply all evidence for that campus is private.
- Consented interviews and current service verification before making workflow or product-effectiveness claims.

These items are visible limitations, not findings of “no change,” “no homelessness,” or “no services.” No messages have been sent on Thomas's behalf.

## Validation results

- `python3 scripts/verify_workbook.py <supplied workbook>`: identical SHA-256 and zero cell differences.
- `python3 scripts/audit_evidence.py`: all 32 mapped counts and count changes match the published workbook; rate-band coverage and labels, exports, all 26 point coordinates, 2/5/19 review statuses, methods fields, key narrative statistics, definition ordering, and local links pass.
- `npx eslint .` and `npx stylelint '**/*.css'`: pass.
- Chrome desktop and mobile checks: published rate chapter and method text; categorical labels (D26 under 5%, D4 20%+); exactly four districts in the top published band; fixed source year with playback disabled for rate categories; 2/5/19 review-status filters; selected survey wording and composite definition; existing timeline, comparisons, legend filters, CSV download contents, share restoration, mobile map expansion, and Escape dismissal pass. No uncaught browser exceptions observed.

The software checks verify implementation against retained evidence. They do not settle unavailable historical geometry, the exact NYC aggregation specification, unreviewed campus figures, or service availability.
