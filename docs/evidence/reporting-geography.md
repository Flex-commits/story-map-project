# What the school district geography means

Reviewed October 24, 2026.

## Established

- The NYS-TEACHS [source page](https://www.nysteachs.org/grantees) describes students enrolled in NYS school districts and charter schools who experienced homelessness at any point in 2021–22, 2022–23, or 2023–24.
- The workbook itself says values are students identified **by each LEA** during the year. Students identified by more than one LEA can appear in multiple rows.
- We join the 32 `NYC GEOG DIST` LEA identifiers to identically numbered DCP administrative areas. The result is an agency-count map, not a map of student residences or shelter placements.
- [NYSED SIRS Manual 2023–24, version 19.8](https://www.nysed.gov/sites/default/files/programs/information-reporting-services/sirs-manual-2023-2024.pdf), printed page 52, says the District of Residence field for students designated homeless should reflect district of attendance. The following sentence describes NYC Community School District residence codes generally. Printed page 64 describes homeless program code 8262 and primary nighttime residence reporting.

## Not established by those documents

The manual explains reporting fields; it does not establish the exact aggregation query used for this particular summary or resolve every NYC district-assignment exception. We must not substitute that general rule for a documented extract specification. In particular, agency identity is not proof of residence or school-building location within a polygon.

## Map treatment

Keep the verified counts. Label them "students identified by reporting LEA" and display "not residence locations" next to the map. Explain the 2026 boundary vintage at the point of use. Keep separately published AFC percentage categories distinct: that analysis uses cumulative enrollment and includes charter schools, with District 75 excluded from district denominators. Do not reconcile the two by silently changing counts.

## Question prepared for NYSED / NYS-TEACHS — not sent

For the SED-SIRS-3-Year-Summary-2022-2024 workbook, what exact field and aggregation rule assigns a student to each NYC GEOG DIST row? Is it reporting LEA, school district of enrollment/attendance, school-building geography, or the Student Lite District of Residence field? How are transfers, District 75 pupils, and charter schools handled? Are counts unique within each LEA-year, and is a cumulative enrollment denominator with identical coverage available? Were there coding or aggregation changes across the three years?

Contacting the agency is a remaining external verification step; no outreach has been performed.
