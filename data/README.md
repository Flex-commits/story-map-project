# Data used in the story map

Evidence reviewed October 24, 2026. The complete review is in [docs/evidence/audit.md](../docs/evidence/audit.md).

## School district reporting counts

`nyc-student-homelessness-districts.geojson` and `.csv` contain 32 geographic-district LEA records, annual counts for 2021–22, 2022–23, 2023–24, and first-to-last count changes. Source: [NYS-TEACHS SIRS three-year summary](https://www.nysteachs.org/grantees). The published workbook is retained in `raw/evidence/SED-SIRS-3-Year-Summary-2022-2024.xlsx`.

The published file and Thomas's supplied copy have identical SHA-256 hashes and all 10,530 worksheet cells match. See [comparison record](../docs/evidence/workbook-comparison.json).

```sh
python3 scripts/verify_workbook.py '/path/to/supplied-workbook.xlsx'
python3 scripts/prepare_school_districts.py data/raw/evidence/SED-SIRS-3-Year-Summary-2022-2024.xlsx
```

- `district` joins the NYC GEOG DIST reporting-LEA number to DCP `schooldist`; `beds_code` is retained as text.
- `homeless_YEAR` means students identified by that LEA during the year. Transfers can cause multiple agency records; the values must not be summed into unique citywide totals or summed across years into unique people.
- `suppressed_YEAR` preserves an original `s`; numeric value is null, never zero. Suppression in one year can result in all annual cells being suppressed. Averages are not used to reconstruct hidden values.
- `change_count_2021_22_to_2023_24` is the difference; `change_pct_2021_22_to_2023_24` is the percentage change in counts, not an enrollment-based rate. Missing inputs/zero starting count yield null.
- Separate charter, District 75, and central-office rows are excluded rather than geographically reassigned.
- `count_basis` explains reporting geography; `boundary_vintage` describes the reference geometry.

The [NYSED SIRS Manual 2023–24](https://www.nysed.gov/sites/default/files/programs/information-reporting-services/sirs-manual-2023-2024.pdf), printed pages 52 and 64, describes attendance/residence fields and homeless program reporting. It does not provide this workbook's full NYC extract specification. See [geography review](../docs/evidence/reporting-geography.md). The map does not show student residences.

## Separate published enrollment-based categories

AFC's [2023–24 brief](https://advocatesforchildren.org/wp-content/uploads/2024/nyc_student_homelessness_2024.pdf), page 2, maps five estimated percentage categories. `raw/evidence/afc-rate-bands-2023-24.json` records the manually transcribed categories and methods. No exact percentages are inferred.

- `afc_rate_band_2023_24` is an ordinal category code **0–4**, not a percentage.
- `afc_rate_band_label` is the published range: under 5%, 5–9.9%, 10–14.9%, 15–19.9%, or 20% or more.
- `afc_rate_source` links to the source brief.

The brief's rates use cumulative enrollment and include charter pupils; District 75 is excluded from district denominators. This differs from the reporting-LEA workbook coverage. These categories are not calculated by dividing workbook counts by a single-day enrollment snapshot. The rate view is fixed to 2023–24; only count views support year playback. See [enrollment decision](../docs/evidence/enrollment-decision.md).

## Boundaries

[NYC DCP School Districts](https://data.cityofnewyork.us/City-Government/School-Districts/8ugf-3d8u), release 26b, retrieved October 24, 2026. Unmodified GeoJSON is in `raw/nyc-school-districts.geojson`. Thirty-three source features are combined into 32 MultiPolygons by district ID. Coordinates are WGS84 longitude/latitude, rounded to six decimals. Rings and region bounds are checked, not full topological validity.

Historical consistency is **not established**. Archive retrieval attempts failed; no boundary differences have been quantified or attributed to coastlines. The map uses explicitly labeled 2026 reference geometry. See [boundary review](../docs/evidence/boundary-review.md).

## College locations and survey evidence

`cuny-colleges.geojson` and `.csv` retain all 26 institution-location records from [NY Open Data](https://data.ny.gov/d/irqs-74ez), downloaded October 24, 2026, with checked campus survey fields. Raw points are in `raw/cuny-campus-locations.json`. They do not represent every NYC university, every campus building, or student home locations. Some institutions share a location.

```sh
python3 scripts/prepare_colleges.py
```

`campus_id` is a local ID in source order. Borough is derived from the source city label. Campus methods, population, recall period, actual question, weighting, uncertainty note, review source, review status, and retrieval date are included in exports.

Review statuses:

- `available`: campus figures checked against a published report (2).
- `reviewed_pending`: a campus source was reviewed without establishing a comparable 2024 percentage (5).
- `not_yet_checked`: no campus-specific review completed (19).

No campus is classified as having no public data simply because a value was not found. Some Graduate Center internal reports explicitly require login; public reports also exist. See `raw/evidence/campus-review.json` and [public-source review](../docs/evidence/public-source-review.json).

Verified profiles:

- [Queensborough 2024](https://www.qcc.cuny.edu/oira/docs/StudentExperienceSurvey_Spring24.pdf): homelessness 4%; four-item housing-insecurity composite 38%; difficult rent increase 31%; unpaid/underpaid rent 17%. Total respondents 474; response rate 12%. Printed pages 3, 5, 21–23.
- [LaGuardia 2024](https://www.laguardia.edu/wp-content/uploads/2025/01/cuny-student-experience-survey-2024.pdf): homelessness 5%; difficult rent increase 40%; unpaid/underpaid rent 21%. Total respondents 747; response rate 14.9%. Printed pages 1 and 11. No overall housing-insecurity figure assigned.

The public [CUNY dashboard](https://www.cuny.edu/about/administration/offices/oareda/insights-reporting-analytics/) confirms a spring 2024 random sample of degree-seeking undergraduates, college-level post-stratification raking, variable item denominators, and suppression below 25 respondents. Total sample sizes are not item denominators. No significance tests or confidence intervals are established here. Null is not zero. The four-item composite includes the homelessness item; never add the measures. No survey rate is converted into a headcount or imputed to another campus.

Campus support links are descriptions, not verified availability, eligibility, or outcomes: [Queensborough ARC](https://www.qcc.cuny.edu/arc/index.html), [LaGuardia catalog](https://laguardia.catalog.cuny.edu/student-programs-and-services/student-services/overview).

## Other story evidence

- [NYCPS school definition and support](https://www.schools.nyc.gov/school-life/special-situations/students-in-temporary-housing/).
- [AFC educational indicators, 2022–23](https://advocatesforchildren.org/policy-resource/sth-educational-indicators-2023/): citywide NYCPS attendance and 2023 graduation comparisons; charter schools excluded. Separate source/population, not workbook-derived outcomes or causal estimates.
- [BCC's September 10, 2026 published account](https://www.bcc.cuny.edu/a-veterans-journey-from-a-homeless-shelter-to-columbia-university/): attributed human account, not an interview for this project or a record linked to mapped cohorts.
- [CUNY resource centers](https://www.cuny.edu/about/administration/offices/student-affairs/programs-services/cuny-resource-centers/): published descriptions of assistance, not measured service delivery.

K–12 and college data are not longitudinally linked. No personal residence or travel path is mapped. Full third-party PDF text is not redistributed; citations and document hashes are retained. No interviews or outreach have been conducted.
