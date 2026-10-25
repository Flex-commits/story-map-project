# A Stable Home, A School to Keep

Student homelessness is personal to me. I want to understand how students in New York City continue their education when they do not have a stable place to live, and where housing support could make a difference.

I started with reported student homelessness across NYC's 32 geographic school districts from 2021–22 through 2023–24. I then added CUNY institution locations and the campus survey results I have checked so far. My background is in construction, real estate, and housing research. This project connects that work to a question I care about: what does it take for a student to have both a place to live and a chance to keep learning?

Readers can follow the story or explore the map, compare districts and colleges, change years, and download the data.

## Data and sources

- **School district counts:** NYSED SIRS, `SED-SIRS-3-Year-Summary-2022-2024.xlsx`, worksheet `3-yr Homeless Counts`. Covers 2021–22, 2022–23, and 2023–24. The [published NYS-TEACHS file](https://www.nysteachs.org/grantees) exactly matches my supplied copy: identical SHA-256 hashes and all 10,530 worksheet cells.
- **School district boundaries:** [NYC Department of City Planning, School Districts](https://data.cityofnewyork.us/City-Government/School-Districts/8ugf-3d8u), release 26b. Downloaded October 24, 2026.
- **College locations:** [New York State, CUNY University Campus Locations](https://data.ny.gov/d/irqs-74ez). Downloaded October 24, 2026. The file contains 26 institution locations.
- **Queensborough survey:** [Spring 2024 Student Experience Survey](https://www.qcc.cuny.edu/oira/docs/StudentExperienceSurvey_Spring24.pdf). Reports 4% experiencing homelessness and 38% experiencing housing insecurity. There were 474 respondents and a 12% response rate; the report describes weighting.
- **LaGuardia survey:** [2024 CUNY Student Experience Survey](https://www.laguardia.edu/wp-content/uploads/2025/01/cuny-student-experience-survey-2024.pdf). Reports 5% experiencing homelessness. There were 747 respondents and a 14.9% response rate.
- **Enrollment-based district ranges:** [AFC 2023–24 brief](https://advocatesforchildren.org/wp-content/uploads/2024/nyc_student_homelessness_2024.pdf), using cumulative enrollment, including charter pupils. The map preserves its five published categories rather than inventing exact percentages. This is separate from the workbook counts.
- **Educational consequences:** [AFC 2022–23 educational indicators](https://advocatesforchildren.org/policy-resource/sth-educational-indicators-2023/), NYCPS students, excluding charter schools. These findings are not calculated from my workbook.
- **A published student account:** [Christopher Thomas’s story, published by BCC on September 10, 2026](https://www.bcc.cuny.edu/a-veterans-journey-from-a-homeless-shelter-to-columbia-university/). I did not interview him or link his experience to the mapped cohorts.
- **Later citywide context:** [Advocates for Children, Student Homelessness in NYC, 2024–25](https://advocatesforchildren.org/policy-resource/student-homelessness-data-2025/). The “nearly one in seven” figure comes from this later school year, not the three-year workbook.
- **Campus support information:** [Queensborough Advocacy Resource Center](https://www.qcc.cuny.edu/arc/index.html) and [LaGuardia student services](https://laguardia.catalog.cuny.edu/student-programs-and-services/student-services/overview).

## How I am reading the data

School district counts and college survey percentages measure different things. I keep them separate. Students may appear in more than one education agency's records, so adding district counts would not give a unique citywide total. Separate charter records, District 75, and central office records are not included in the district map.

The college map currently covers CUNY, with survey results checked for Queensborough and LaGuardia. Missing values mean I have not verified a figure for that campus; they do not mean zero. Homelessness, housing insecurity, and rent difficulty can overlap and should not be added together.

The map does not show students' home locations. It also does not explain what caused a change or establish that a particular service failed. I checked the available boundary metadata and attempted to retrieve the historical archives, but access failed. Historical boundary consistency remains unresolved, so the map explicitly uses 2026 reference geometry. I have not confirmed current service availability. Five additional campus source pages have been reviewed without establishing comparable figures; the other campus reports remain unchecked. K–12 and college data describe different populations, not the same people over time.

The [evidence audit](docs/evidence/audit.md) records what I verified and what remains open. [Interview questions and a consent approach](docs/interview-guide.md) are prepared; no interviews or outreach have been conducted.

Field definitions and preparation notes are in [data/README.md](data/README.md).

## Open the project locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. The site uses Leaflet and Google Fonts, with system font fallbacks.
