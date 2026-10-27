# A Stable Home, A School to Keep

**A geospatial story of student homelessness, housing stability, and educational continuity in New York City.**

A school offers continuity. Housing helps determine whether a student can hold on to it. This project asks: **when a student’s address changes, how can the city help preserve the continuity of their education?**

[Open the story map ↗](https://flex-commits.github.io/story-map-project/) · [Validated display GeoJSON](data/nyc-district-display.geojson) · [CUNY GeoJSON](data/cuny-colleges.geojson) · [Data dictionary](data/README.md)

## Read the city through its geography

The story moves from citywide context to school-district reporting patterns, then to housing instability among CUNY undergraduates. The interactive atlas lets readers change school years, inspect individual features, filter by borough and measure, compare up to three records, and download the evidence behind a selection. Color legends also work as filters; shared links preserve an atlas view. Counts use proportional circles with a fixed cross-year scale. Campus estimates have descriptive color ranges, a continuous housing-scale option, and an exact-value dot chart; shared-location institutions remain independently selectable.

The opening uses AFC’s **2024–25 citywide findings**. The district count maps cover **2021–22 through 2023–24**, and college survey results describe **spring 2024 answers about the preceding 12 months**. These periods remain distinct throughout the project.

## The spatial layers

| Layer | Geometry and coverage | What the color represents | Source |
| --- | --- | --- | --- |
| School-district counts | 32 district MultiPolygons, joined to geographic-district reporting LEAs | Annual counts of students identified as homeless, or first-to-last percentage change in those counts | [NYSED SIRS / NYS-TEACHS workbook](https://www.nysteachs.org/_files/ugd/60b30b_705222e6c2654836a50931c50c6da244.xlsx?dn=SED-SIRS-3-Year-Summary-2022-2024.xlsx) |
| Enrollment-based district ranges | The same 32 reference district geometries; a separate 2023–24 analysis | AFC’s five published percentage categories, preserved as ranges | [AFC 2023–24 brief, page 2](https://advocatesforchildren.org/wp-content/uploads/2024/nyc_student_homelessness_2024.pdf#page=2) |
| CUNY institutions | 26 official institution Point records; 19 with separate undergraduate survey results | Published homelessness estimates, housing insecurity scale, rent difficulty, or institution type | [Institution locations](https://data.ny.gov/d/irqs-74ez) · [Survey methods](https://insights.cuny.edu/t/CUNYGuest/views/2026StudentExperienceSurvey/Intro) |

**A district polygon locates a reporting area. A campus point locates an institution. Neither locates a student’s home.** The exact NYC LEA extract rules remain partly unresolved; the map does not establish residential concentrations or individual journeys.

Seven institution records have no separate column in the checked undergraduate survey export. They remain gray with an explanation. SUNY and private universities are outside the current college layer.

## Geographic methods

The spatial files are GeoJSON FeatureCollections with WGS84 longitude/latitude coordinates in **`[longitude, latitude]` order**. Leaflet renders the story and atlas using its default Web Mercator display. Coordinate storage and map display are separate; the project does not calculate distances or travel times.

The district preparation script groups 33 source boundary features into 32 MultiPolygons by DCP’s `schooldist` identifier, then joins the workbook’s `NYC GEOG DIST` records by district number. This is an identifier join, not a geocoding exercise or a point-in-polygon assignment of student residences. BEDS identifiers remain text. The original derived file rounds district coordinates to six decimal places; that precision does not establish positional accuracy. The maps now use a separate validated display derivative built from the fuller-precision original source. Repairs are documented, not presented as new official boundaries. Original files remain available for audit.

District geometry comes from [NYC Department of City Planning, School Districts](https://data.cityofnewyork.us/City-Government/School-Districts/8ugf-3d8u), release **26b (2026)**. Historical boundary consistency over 2021–24 has not been established. The application labels these as reference boundaries rather than claiming they reconstruct each school year. [Boundary review](docs/evidence/boundary-review.md).

Campus coordinates are retained from the official location dataset. Some institutions share a location, and a single point does not represent every building belonging to a college. The mapped survey records use an explicit institution-name crosswalk, retained with the [2024 extraction record](data/raw/evidence/cuny-ses-2024-extract.json).

## What the patterns show—and what they cannot tell us

All 32 reporting districts recorded increases between 2021–22 and 2023–24. The median district increase was **42.1%**, with changes ranging from **10.9% to 131.1%**. This gives each district equal weight; it is not a citywide student growth rate. The calculation describes agency records, not the cause of an increase.

CUNY’s published university-weighted 2024 estimate is **5% reporting homelessness** in the past 12 months. Across the 19 campus profiles, published estimates range from **1% to 11%**. The university estimate comes from CUNY’s weighting, not an average of campus percentages. These are descriptive survey estimates; the campus range is not a confidence interval or a statistical ranking. [Calculations and survey limitations](docs/evidence/statistical-analysis.md).

Several distinctions matter when reading the maps:

- **Counts and prevalence:** a larger count can reflect a larger student population. AFC’s enrollment-based categories use a separate, charter-inclusive cumulative-enrollment analysis; they are not calculated by dividing the workbook counts by a snapshot enrollment figure.
- **People and records:** students may appear in multiple LEAs or school years. District counts cannot be added into a unique citywide total. Separate charter records, District 75, and central-office records are excluded from the count layer.
- **Missing and zero:** suppressed or unavailable values remain missing. Campus averages are never used to fill gaps, and ordinal rate-category codes are never treated as exact percentages.
- **Schools and colleges:** K–12 classifications and college self-reports use different definitions and populations. These datasets do not follow the same students into college.
- **Different published measures:** Queensborough’s central housing scale is 44%, while its campus report gives 38% for a four-item composite. LaGuardia’s central rent-difficulty estimate is 39%, versus 40% in its report. The map consistently uses central-dashboard results and records these differences in the [analysis notes](docs/evidence/statistical-analysis.md).

## Follow a number back to its source

The supplied SIRS workbook and the published NYS-TEACHS download are byte-identical, with zero differences across **10,530 worksheet cells**. College evidence is retained as aggregate survey tables with explicit year, section, and sector filters, source URLs, and SHA-256 hashes. No individual student records, residences, shelter addresses, or personal routes are included.

| Evidence | Read or download |
| --- | --- |
| Mapped district attributes | [CSV](data/nyc-student-homelessness-districts.csv) · [GeoJSON](data/nyc-student-homelessness-districts.geojson) |
| Mapped campus evidence and methods | [CSV](data/cuny-colleges.csv) · [GeoJSON](data/cuny-colleges.geojson) |
| Field definitions, join keys, and missing-value rules | [Data dictionary](data/README.md) |
| Calculations, survey uncertainty, and source differences | [Analysis notes](docs/evidence/statistical-analysis.md) · [Calculated results](docs/evidence/statistical-analysis.json) |
| Publication trail and workbook comparison | [Source register](docs/evidence/source-register.json) · [Workbook comparison](docs/evidence/workbook-comparison.json) |
| Geographic interpretation and unresolved questions | [Reporting geography](docs/evidence/reporting-geography.md) · [Evidence audit](docs/evidence/audit.md) |

The opening’s 154,000-plus figure and housing-arrangement shares come from [AFC’s 2024–25 brief](https://advocatesforchildren.org/wp-content/uploads/2025/student_homelessness_2024-25.pdf). Educational outcomes come from [AFC’s separate educational-indicators brief](https://advocatesforchildren.org/wp-content/uploads/2024/sth_edu_indicators_2023.pdf). The story identifies each finding’s population and period; neither is calculated from the district workbook. Full citations also appear in **11 / Data and sources** on the site.

## Run locally and reproduce the evidence

This is a static HTML, CSS, and JavaScript project, adapted from the repository’s scrollytelly template. It uses Leaflet for mapping and Python’s standard library for data preparation. No API key or build step is required to serve the site; Leaflet and Google Fonts load from external services.

From the repository root:

```sh
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000).

To rebuild the derived data from the retained inputs and run the evidence audit:

```sh
python3 scripts/prepare_school_districts.py data/raw/evidence/SED-SIRS-3-Year-Summary-2022-2024.xlsx
python3 scripts/extract_cuny_survey.py
python3 scripts/prepare_colleges.py
python3 scripts/analyze_evidence.py
python3 scripts/audit_evidence.py
```

The audit checks district values against the workbook, campus percentages against retained survey tables, source hashes, published rate categories, point coordinates, and local page references. The spatial validation checks source and derived geometry validity, within-district symbol anchors, and inter-district intersections. All 32 display features validate; original geometry issues and repairs are recorded. Historical boundary stability and completeness against an independent coverage mask remain unresolved.

## Validate the spatial release

```sh
python3 -m venv .venv-spatial
.venv-spatial/bin/python -m pip install -r requirements-spatial.txt
.venv-spatial/bin/python scripts/validate_geometry.py
python3 scripts/build_release_metadata.py
npm ci
npm test
npm run test:browser
```

The browser check starts its own local server and uses installed Chrome/Chromium; set `CHROME_BIN` when its path differs. `npm test` runs the evidence audit, cartographic/data-loading tests, and lint. The geometry command retains original inputs and rebuilds the documented display derivative and its exact gzip copy. Compression is lossless; no geometry simplification is applied. The common loader fetches the geometry once for both map modes and falls back to plain GeoJSON when needed.

See the [geometry report](docs/evidence/geometry-validation.json), [release metadata](data/release-metadata.json), [measure dictionary](docs/measure-dictionary.md), and [implementation status](docs/evidence/implementation-status.md). Local browser resource timings are recorded separately from real mobile-network performance; they do not establish a field performance improvement.

## The question beyond the map

The geography provides a starting point for asking how housing, schools, and transportation can better support educational continuity. Understanding the barriers—and whether a tool would help—requires students’ and frontline staff members’ accounts alongside operational evidence. [Interview questions and a consent approach](docs/interview-guide.md) are prepared; no project interviews or outreach have been conducted.

*Thomas Hagos · New York City*
