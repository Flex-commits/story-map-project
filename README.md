# A Stable Home, A School to Keep

Student homelessness is personal to me. I want to understand how students in New York City continue their education when they do not have a stable place to live, and where housing support could make a difference.

I started with reported student homelessness across NYC's 32 geographic school districts from 2021–22 through 2023–24. I then added CUNY institution locations and the campus survey results I have checked so far. My background is in construction, real estate, and housing research. This project connects that work to a question I care about: what does it take for a student to have both a place to live and a chance to keep learning?

Readers can follow the story or explore the map, compare districts and colleges, change years, and download the data.

## Data and sources

- **School district counts:** NYSED SIRS, `SED-SIRS-3-Year-Summary-2022-2024.xlsx`, worksheet `3-yr Homeless Counts`. Covers 2021–22, 2022–23, and 2023–24. I still need to confirm the workbook's original publication link.
- **School district boundaries:** [NYC Department of City Planning, School Districts](https://data.cityofnewyork.us/City-Government/School-Districts/8ugf-3d8u), release 26b. Downloaded October 24, 2026.
- **College locations:** [New York State, CUNY University Campus Locations](https://data.ny.gov/d/irqs-74ez). Downloaded October 24, 2026. The file contains 26 institution locations.
- **Queensborough survey:** [Spring 2024 Student Experience Survey](https://www.qcc.cuny.edu/oira/docs/StudentExperienceSurvey_Spring24.pdf). Reports 4% experiencing homelessness and 38% experiencing housing insecurity. There were 474 respondents and a 12% response rate; the report describes weighting.
- **LaGuardia survey:** [2024 CUNY Student Experience Survey](https://www.laguardia.edu/wp-content/uploads/2025/01/cuny-student-experience-survey-2024.pdf). Reports 5% experiencing homelessness. There were 747 respondents and a 14.9% response rate.
- **Later citywide context:** [Advocates for Children, Student Homelessness in NYC, 2024–25](https://advocatesforchildren.org/policy-resource/student-homelessness-data-2025/). The “nearly one in seven” figure comes from this later school year, not the three-year workbook.
- **Campus support information:** [Queensborough Advocacy Resource Center](https://www.qcc.cuny.edu/arc/index.html) and [LaGuardia student services](https://laguardia.catalog.cuny.edu/student-programs-and-services/student-services/overview).

## How I am reading the data

School district counts and college survey percentages measure different things. I keep them separate. Students may appear in more than one education agency's records, so adding district counts would not give a unique citywide total. Separate charter records, District 75, and central office records are not included in the district map.

The college map currently covers CUNY, with survey results checked for Queensborough and LaGuardia. Missing values mean I have not verified a figure for that campus; they do not mean zero. Homelessness, housing insecurity, and rent difficulty can overlap and should not be added together.

The map does not show students' home locations. It also does not explain what caused a change or establish that a particular service failed. I have not yet checked the current district boundaries against historical versions, or confirmed the current availability of services linked in the map.

Field definitions and preparation notes are in [data/README.md](data/README.md).

## Open the project locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. The site uses Leaflet and Google Fonts, with system font fallbacks.
