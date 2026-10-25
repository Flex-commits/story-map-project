# Enrollment comparison decision

Reviewed October 24, 2026.

A single-day enrollment snapshot is not an acceptable automatic denominator for a workbook counting students identified at any time during a school year. Coverage must also match agency attribution, grade span, charter treatment, and district exceptions.

## Adopted source

[AFC, Student Homelessness in NYC, 2023–24](https://advocatesforchildren.org/wp-content/uploads/2024/nyc_student_homelessness_2024.pdf), page 1 footnote: estimated rates use cumulative 2023–24 NYSED enrollment, include DOE and charter pupils, and omit District 75 from borough/district denominators (but include it in the citywide denominator). Page 2 publishes five district rate categories, not exact percentages.

The app therefore adds a categorical **AFC estimated share, 2023–24** layer. The 32 categories were transcribed from the map on page 2 and reviewed against its rendered page. `afc_rate_band_2023_24` is a category code 0–4, NOT a percentage. Labels are in `afc_rate_band_label`. The source PDF hash and the transcription are retained; the public PDF is linked rather than redistributed. The app does not infer exact percentages, assign category midpoints, calculate ratios from mismatched data, or imply these rates were calculated from its LEA workbook counts.

## Coverage difference

AFC's school-location presentation and charter-inclusive cumulative analysis are separate from the workbook's reporting-LEA counts. Switching views changes both measure and source coverage. The legend, popups, export fields, and methodology must state this. Boundary historical consistency remains a separate unresolved limitation.

## Deferred

No comparable enrollment-based rates are calculated for 2021–22 or 2022–23. The timeline applies to counts only. Any future calculation requires a matching cumulative denominator and a resolved district aggregation specification.
