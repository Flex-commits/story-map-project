# NYC student homelessness mapping data

Prepared October 24, 2026.

## Files

- `nyc-student-homelessness-districts.geojson`: mapping-ready WGS84 longitude/latitude polygons, one feature per NYC geographic school district (1–32), joined to the supplied workbook.
- `nyc-student-homelessness-districts.csv`: the same district attributes without geometry; BEDS codes should be imported as text.
- `raw/nyc-school-districts.geojson`: unmodified official boundary download (33 source features). Multiple features for one district are combined as a MultiPolygon, without dissolving or changing their parts. Output coordinates are rounded to six decimal places; geometry has not otherwise been simplified.

## Sources and reproduction

Boundaries: NYC Department of City Planning, **School Districts**, NYC Open Data dataset `8ugf-3d8u`.

- Catalog: https://data.cityofnewyork.us/City-Government/School-Districts/8ugf-3d8u
- Download: https://data.cityofnewyork.us/resource/8ugf-3d8u.geojson?$limit=100
- Catalog identified release 26b, updated May 26, 2026, when consulted. Downloaded October 24, 2026. These are current boundaries, not verified historical boundaries for 2021–24. Check archived versions before making claims dependent on historical boundary stability.

Counts: user-supplied `SED-SIRS-3-Year-Summary-2022-2024.xlsx`, worksheet `3-yr Homeless Counts`, annual columns 2021–22, 2022–23, 2023–24. The original workbook remains outside this repository; its publishing URL has not been independently verified. Cite NYSED SIRS and verify the original publication before public release.

Run from the project root with Python 3 (no additional packages):

```sh
python3 scripts/prepare_school_districts.py '/path/to/SED-SIRS-3-Year-Summary-2022-2024.xlsx'
```

## Join and fields

Only `SCHOOL DISTRICT` records named `NYC GEOG DIST #...` are included. District numbers parsed from those names join to boundary `schooldist`. Charter records, District 75, and the central office are excluded, not redistributed. The output is not a complete count of all NYC public school students experiencing homelessness.

- `district`: numeric join key, 1–32.
- `beds_code`, `lea_name`, `county`: workbook identifiers and labels.
- `homeless_2021_22`, `homeless_2022_23`, `homeless_2023_24`: reported annual counts.
- `suppressed_YEAR`: whether the original annual cell was `s`.
- `change_count_2021_22_to_2023_24`: last-year count minus first-year count.
- `change_pct_2021_22_to_2023_24`: percentage change in the count, rounded to two decimals. This is NOT the percentage of enrolled students experiencing homelessness. Null if inputs are unavailable or the starting count is zero.

## Interpretation

- These polygons are school districts, not individual school attendance zones, community board districts, or student residence locations. The workbook does not establish where students live.
- No individual school coordinates, student records, enrollment denominators, shelter status, attendance outcomes, or referral histories are included.
- Workbook note: counts are students identified by each LEA during each year and are not deduplicated across LEAs. Do not describe a sum as a unique citywide student total or sum years as unique people.
- Workbook note: `s` indicates suppression associated with 1–4 identified students; all annual cells may be suppressed even if another year has a larger count. The script retains suppression as null plus an explicit flag, never zero, and does not use averages to reconstruct suppressed counts.
- This workbook does not substantiate the 2024–25 “nearly one in seven” headline. It covers earlier years and has no enrollment denominator.
- Count changes do not establish causes or a failure of service coordination.

## Validation performed

The preparation script checks that workbook and boundary IDs both cover exactly 1–32, each workbook district is unique, all districts match, output polygon rings close, and coordinates fall within the NYC region. All 32 districts matched. The script does not perform a full topological validity check.

## College extension

`cuny-colleges.geojson` and `cuny-colleges.csv` contain all 26 institution-location records downloaded from NY Open Data on October 24, 2026. The source is [CUNY University Campus Locations](https://data.ny.gov/d/irqs-74ez), API `https://data.ny.gov/resource/irqs-74ez.json?$limit=100`, retained as `raw/cuny-campus-locations.json`. The source includes different institution types and co-located institutions; it does not enumerate every NYC university or every campus building. `campus_id` is a local generated key in source order, not an official institutional identifier. Borough is derived from the source city label (New York = Manhattan; Bayside, Flushing, Jamaica, and Long Island City = Queens).

Reproduce the derived data with `python3 scripts/prepare_colleges.py` after downloading that raw file.

Two campuses have manually verified spring 2024 survey fields:

- [Queensborough report](https://www.qcc.cuny.edu/oira/docs/StudentExperienceSurvey_Spring24.pdf): homelessness 4%, housing insecurity 38%, rent increase difficulty 31%, unable to pay/underpaid rent 17%. Total survey respondents 474, response rate 12%. The report describes weighting. Its 2022 homelessness item is 2%. See printed pages 3, 5, and 21–23.
- [LaGuardia report](https://www.laguardia.edu/wp-content/uploads/2025/01/cuny-student-experience-survey-2024.pdf): homelessness 5%, rent increase difficulty 40%, unable to pay/underpaid rent 21%. Total survey respondents 747, response rate 14.9%. Weighting detail is not established here. See printed pages 1 and 11. An overall housing insecurity percentage is not assigned.

These are campus survey percentages, mostly concerning the past 12 months, not administrative counts. Total survey sample sizes are not guaranteed to be item-specific denominators. The rounded percentages do not establish significant differences between institutions. Null means **not verified in this project**, not zero and not proof that no published data exists. No rate has been imputed to another campus or converted to a headcount. Homelessness, housing insecurity, and rent difficulty are overlapping but different concepts; never add them. College results are not longitudinally linked to K–12 records.

Campus support links are sourced from [Queensborough ARC](https://www.qcc.cuny.edu/arc/index.html) and [LaGuardia's student services catalog](https://laguardia.catalog.cuny.edu/student-programs-and-services/student-services/overview). They identify support descriptions, not verified service capacity, outcomes, or separate geocoded office entrances.

### Map presentation

The application uses a 2D Leaflet atlas. The experimental statistical extrusion view has been removed. No building models, student residences, or inferred student travel paths are displayed.
