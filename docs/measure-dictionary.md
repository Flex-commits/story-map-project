# Measures, geography, and comparison rules

Reviewed October 27, 2026. These definitions apply to the story, explorer, tables, and exports. The central color and classification definitions live in `js/cartography.js`.

| Measure | Unit and period | Population / reporting basis | Interpretation and source |
| --- | --- | --- | --- |
| Reported school count | Agency-year count; 2021–22, 2022–23, 2023–24 | 32 NYC geographic-district reporting LEAs; separate charter, District75 and central records excluded | Students identified by each LEA, not residential counts. Transfers may duplicate across agencies. [Published SIRS source](https://www.nysteachs.org/data-on-student-homelessness). Exact NYC aggregation exceptions remain unresolved. |
| Change in count | `(last − first) / first ×100`; 2021–22 to2023–24 | Same retained LEA records; not longitudinally linked individuals | Percentage change in records, not prevalence or a causal effect. Null inputs or zero baseline do not yield a rate. |
| AFC enrollment range | Published categorical percentage range; 2023–24 | Separate charter-inclusive cumulative-enrollment analysis; District75 excluded from district denominators | Preserve under5%,5–9.9%,10–14.9%,15–19.9%,20%+. Ordinal codes0–4 are not exact percentages. [Brief pp1–2](https://advocatesforchildren.org/wp-content/uploads/2024/nyc_student_homelessness_2024.pdf). |
| CUNY homelessness | Published whole-percent weighted estimate; spring2024, past12months | Degree-seeking undergraduate survey respondents | Item: “…have you ever been homeless?” under “In the last12months…”. Self-report, not the K–12 classification or a point-in-time headcount. [CUNY methods](https://insights.cuny.edu/t/CUNYGuest/views/2026StudentExperienceSurvey/Intro). |
| CUNY housing insecurity scale | Published whole-percent weighted estimate; spring2024 | Central dashboard's separately published scale | Exact algorithm/scoring remains unresolved. Not interchangeable with QCC's four-item composite. Four map classes are descriptive display ranges: under40%,40–under50%,50–under60%,60%+. Continuous mode uses a fixed0–100% color scale. Neither is a risk threshold. |
| Rent-increase difficulty | Published whole-percent weighted estimate; spring2024, past12months | College-weighted undergraduate respondents answering the item | “…was there a rent or mortgage increase that made it difficult to pay?” Central table used consistently. LaGuardia central39% differs from campus report40%; reason unresolved. |
| Rent underpayment | Published whole-percent weighted estimate; spring2024, past12months | College-weighted undergraduate respondents answering the item | “…have you been unable to pay or underpaid your rent or mortgage?” No overlap-adjusted composite is inferred. |
| Institution type | Categorical location metadata; retrieved2026-10-24 | 26 official CUNY institution records | Institutional context, not housing prevalence. Some records share coordinates and some have no separate undergraduate survey column. [Locations](https://data.ny.gov/d/irqs-74ez). |

## How comparisons work

- College percentages use the published whole-percent display column; weighted counts are not unweighted item sample sizes. No confidence intervals or significance tests are calculated without suitable design information. Alphabetical dot charts compare exact published values on a fixed0–100% axis; they do not establish statistical rankings.
- Missing and suppressed values are not zeros. Seven institution records have no separate column in the checked undergraduate export. That does not prove that no public research exists for them.
- QCC's campus report gives38% on its four-item composite; the central scale gives44%. The narrative keeps the38% separate; campus map comparisons use44%. No assumption about the central scoring algorithm resolves this difference.
- District count-circle area is proportional to count with a fixed scale across years. Anchors are representative points inside validated reference polygons, not geocoded student locations. Rate ranges and count change use separate polygon fills.
- Current reference geography, reporting rules, and differing source populations limit spatial interpretation. A district pattern does not establish residential concentrations, individual commutes, program effects, or service capacity.

## Outstanding source questions

The existing questions in [reporting-geography.md](evidence/reporting-geography.md) and [boundary-review.md](evidence/boundary-review.md) remain unsent. The October27 public-source review reconfirmed the SIRS population description, but did not obtain the exact NYC extract specification, usable archived polygons, or the central survey scale algorithm. These remain explicit unknowns rather than estimated facts.
