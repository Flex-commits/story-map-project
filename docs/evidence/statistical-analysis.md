# Analysis notes — October 24, 2026

## Scope and calculations

This is descriptive analysis of public administrative records and published weighted survey estimates. It is not a model of individual homelessness risk. No missing campus value was imputed. No contacts or outreach were made.

1. **Workbook check.** The supplied and published NYS-TEACHS workbooks have identical SHA-256 hashes and zero differences across 10,530 worksheet cells. See [comparison record](workbook-comparison.json). The map retains 32 NYC geographic-district LEAs, excluding separate charter records, District 75, and the central office. LEA records can duplicate students across agencies; years can also repeat students.
2. **District change.** For each district, change = `(2023–24 count − 2021–22 count) / 2021–22 count × 100`. All baseline counts are positive and all 32 changes are increases. Calculate summaries from the unrounded ratios: median 42.1%, minimum 10.9%, maximum 131.1%, rounded to one decimal. This is an equal-district summary, not an enrollment-weighted citywide growth rate. No unique city total, exact enrollment rate, causal effect, or sampling confidence interval is inferred from these administrative counts.
3. **College extraction.** The public CUNY dashboard now has a “2026StudentExperienceSurvey” URL and defaults to 2026 / Senior Colleges / Academic Experience. We explicitly selected `year=2024`, `Section=Basic Needs, Mental Health, & Household Composition`, and each sector. Tableau requires commas in a single filter value to be escaped as `\,`; unescaped commas produced empty exports. We checked the visible dashboard controls: 2024, Community Colleges, and the requested section. Both retained CSVs contain only Housing Insecurity subsection rows; their URLs, SHA-256 hashes, filters, and crosswalk are recorded in [the extraction record](../../data/raw/evidence/cuny-ses-2024-extract.json).
4. **Published values.** Use the source column `Numeric Display Calculation`, converted from whole-percent text to numeric percentages. Do not interpret `Avg. Weighted Freq` as a percentage: for these rows it contains weighted frequencies. Do not use `Weighted Count` as an unweighted respondent count or a population headcount. Do not infer extra decimal precision by dividing these columns. The separate university result is CUNY's published 5% homelessness estimate and 49% housing scale estimate, using university weights—not an average of campus percentages. The 19 campus homelessness estimates range from 1% to 11%; this is an observed published range, not a confidence interval.
5. **Coverage.** There are 19 separate campus columns: seven community colleges and 12 senior/comprehensive/professional-studies colleges. Seven of the 26 institution points have no separate result in this undergraduate export. These records remain gray: School of Labor and Urban Studies, School of Law, Graduate School and University Center, School of Public Health, School of Journalism, Macaulay Honors College, School of Medicine. This does not prove no public research exists for them or that their students experience no homelessness. Honors/medicine students may overlap other institutional populations; no separate estimate is assigned. SUNY and private institutions are outside this map.
6. **Uncertainty.** CUNY's public introduction describes a 50% random sample of degree-seeking undergraduates, April 10–June 5, 2024: 7,035 completed surveys and an 8.6% response rate. College and university estimates use their respective post-stratification raking weights. Item samples vary due to missing answers, question routing, and survey design. The dashboard suppresses items with fewer than 25 respondents. Total campus responses are not item denominators. Low response and remaining nonresponse bias can affect representativeness. Without item-level unweighted samples, weight distributions and survey-design information, no defensible confidence intervals or significance tests are calculated here. The map does not rank campus risk or infer differences from small percentage gaps.

## Independent checks and source differences

| Measure | Central dashboard, 2024 | Campus report, 2024 | Treatment |
| --- | --- | --- | --- |
| Queensborough homelessness | 4% | 4% | Agreement; central value mapped. |
| Queensborough rent-increase difficulty | 31% | 31% | Agreement; central value mapped. |
| Queensborough rent underpayment | 17% | 17% | Agreement; central value mapped. |
| Queensborough housing insecurity | 44% on central scale | 38%, four-item composite | Different measure definitions/scoring may apply. Exact central scoring not established; do not equate the two. Central scale mapped; four-item 38% kept separately in the narrative. |
| LaGuardia homelessness | 5% | 5% | Agreement; central value mapped. |
| LaGuardia rent underpayment | 21% | 21% | Agreement; central value mapped. |
| LaGuardia rent-increase difficulty | 39% | 40% | Unresolved one-percentage-point discrepancy; no assumption about rounding or cause. Central value mapped consistently. |

The Queensborough report's four-item composite is a yes to at least one of: a difficult rent increase, unpaid/underpaid rent, unpaid utilities, or homelessness. The central table includes additional housing questions and a published scale result, but the exact scale algorithm is not established by this review. It is labeled **CUNY housing insecurity scale**, not the narrower campus composite. Neither measure should be added to homelessness: overlap is possible.

[Queensborough report](https://www.qcc.cuny.edu/oira/docs/StudentExperienceSurvey_Spring24.pdf), printed pages 3, 5, 21–23. [LaGuardia report](https://www.laguardia.edu/wp-content/uploads/2025/01/cuny-student-experience-survey-2024.pdf), printed pages 1 and 11. [CUNY survey introduction and methods](https://insights.cuny.edu/t/CUNYGuest/views/2026StudentExperienceSurvey/Intro). Exact filtered campus-table links are retained in the extraction record and the public source register.

## Other limits that calculations cannot resolve

- K–12 homelessness eligibility and the college past-12-month self-report question are distinct. These datasets do not follow the same students over time.
- DCP 2026 geometry is a reference layer. Historical boundary consistency for 2021–24 remains unresolved; no calculation proves the districts were stable.
- AFC enrollment-based ranges come from a separate charter-inclusive cumulative-enrollment analysis. No midpoint or exact district rate is inferred from the published categories.
- The service questions at the end require interviews or operational evidence. A prevalence estimate cannot establish staff workflow problems, budgets, current capacity, or product demand.

## Reproduce

From the repository root:

```sh
python3 scripts/extract_cuny_survey.py
python3 scripts/prepare_colleges.py
python3 scripts/analyze_evidence.py
python3 scripts/audit_evidence.py
```

The extract script reads the retained aggregate CSVs; no credentials or private student records are required. Source hashes and explicit table filters preserve the version used in this story. [Calculated findings](statistical-analysis.json) are machine readable. Re-fetching a live dashboard later may produce revisions and requires a new comparison rather than silently overwriting the evidence.
