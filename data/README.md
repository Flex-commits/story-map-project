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

The brief's rates use cumulative enrollment and include charter pupils; District 75 is excluded from district denominators. This differs from the reporting-LEA workbook coverage. These categories are not calculated by dividing workbook counts by a single-day enrollment snapshot. The rate categories are retained as a separate published measure in the download; the simplified story displays counts and college homelessness. See [enrollment decision](../docs/evidence/enrollment-decision.md).

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

- `available`: 19 campus columns with published 2024 central-dashboard results.
- `outside_survey`: seven institution records with no separate column in this undergraduate export. Not zero, and not proof that other research does not exist.

The retained `raw/evidence/cuny-ses-2024-*-housing.csv` files contain the public dashboard's Housing Insecurity subsection. Exact year/section/sector filters, hashes and institution crosswalk are recorded in `raw/evidence/cuny-ses-2024-extract.json`. Use `Numeric Display Calculation` for published whole percentages; the weighted-frequency fields are not extra-precision estimates or unweighted sample counts.

All mapped campus comparisons use the central dashboard. Queensborough's central housing scale is 44%; its campus report gives 38% for a four-item composite. LaGuardia's central rent difficulty is 39%, versus 40% in its campus report. Do not silently equate these measures or resolve discrepancies by averaging. See [analysis notes](../docs/evidence/statistical-analysis.md) for details, independent cross-checks, uncertainty and reproduction steps.

The survey is spring 2024, degree-seeking undergraduates, past 12 months. Central methods describe post-stratification raking and suppression below 25 responses. No item sample sizes, confidence intervals or significance tests are inferred from weighted frequencies. No percentages are converted into headcounts.

Campus support links are descriptions, not verified availability, eligibility, or outcomes: [Queensborough ARC](https://www.qcc.cuny.edu/arc/index.html), [LaGuardia catalog](https://laguardia.catalog.cuny.edu/student-programs-and-services/student-services/overview).

## Other story evidence

- [NYCPS school definition and support](https://www.schools.nyc.gov/school-life/special-situations/students-in-temporary-housing/).
- [AFC educational indicators, 2022–23](https://advocatesforchildren.org/policy-resource/sth-educational-indicators-2023/): citywide NYCPS attendance and 2023 graduation comparisons; charter schools excluded. Separate source/population, not workbook-derived outcomes or causal estimates.
- [BCC's September 10, 2026 published account](https://www.bcc.cuny.edu/a-veterans-journey-from-a-homeless-shelter-to-columbia-university/): attributed human account, not an interview for this project or a record linked to mapped cohorts.
- [CUNY resource centers](https://www.cuny.edu/about/administration/offices/student-affairs/programs-services/cuny-resource-centers/): published descriptions of assistance, not measured service delivery.

K–12 and college data are not longitudinally linked. No personal residence or travel path is mapped. Full third-party PDF text is not redistributed; citations and document hashes are retained. No interviews or outreach have been conducted.

## Validated display geometry and release metadata — October 27, 2026

The original files above remain unchanged. The maps load `nyc-district-display.geojson` (or its losslessly compressed `.gz` copy) and `district-symbol-anchors.json`. `scripts/validate_geometry.py` checks original source parts and the earlier rounded derivative, applies explicitly recorded validity repairs and dissolves overlapping parts, then verifies all32 display geometries. No simplification is used. Count values and identifiers are unchanged.

Source ring defects affect17 and24; combined parts affect10; rounding additionally affects25 in the original derived file. Detailed causes, small inter-district intersections, software versions, source hashes, and the unassessed coverage/historical questions are recorded in [geometry-validation.json](../docs/evidence/geometry-validation.json). The display derivative is not a replacement official boundary release. Representative-point anchors are symbol placements inside the validated polygons, not student locations.

The [release metadata](release-metadata.json) records source periods, hashes, missingness, and third-party source rights. The [measure dictionary](../docs/measure-dictionary.md) distinguishes counts, percentage ranges, survey estimates and the central housing scale. The data retains the central housing scale, rent difficulty and other checked items. The simplified story map displays campus homelessness only; the complete campus table and methods are on `data.html`.
