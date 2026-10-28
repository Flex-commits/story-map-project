# A Stable Home, A School to Keep

A short story map about student homelessness and educational continuity in New York City.

**When a student’s address changes, how can the city help preserve the continuity of their education?**

[Read the story ↗](https://flex-commits.github.io/story-map-project/) · [Data and sources](data.html)

## The story

Seven chapters move from the citywide headline to school-district counts, a closer look at East Harlem, college housing uncertainty, and the question of educational continuity.

One map changes as the reader scrolls. Selecting a district or campus opens a short result and source link. Detailed tables, calculations and methods sit on a separate data page so the story stays focused.

## The geography

| Data | Coverage | What it represents |
| --- | --- | --- |
| School-district counts | 32 reporting LEAs; 2021–22 through 2023–24 | Students identified by each reporting agency. Circle area uses the same scale across years. |
| CUNY institutions | 26 official institution points; 19 separate survey profiles | Published spring 2024 undergraduate homelessness estimates, referring to the past 12 months. |
| Opening context | Citywide 2024–25 AFC findings | A later school year than the district maps; includes NYCPS and charter students. |

Spatial files use WGS84 coordinates in `[longitude, latitude]` order. Leaflet displays the map in its default Web Mercator projection. District records are joined by identifier, not assigned from student addresses. Campus coordinates come from the official institution dataset; shared locations remain independently selectable.

The district and college datasets are preserved separately, and the site presents one map at a time. The district display file is a documented, validated derivative of DCP 26b (2026) reference geometry. Original geometry remains available. Historical boundary consistency is unresolved. [Geometry report](docs/evidence/geometry-validation.json).

## Read the numbers carefully

- District polygons represent reporting areas; campus points represent institutions. Neither identifies student homes.
- Transfers can duplicate records across agencies. District counts cannot be summed into a unique citywide total.
- College percentages are weighted self-reports. They are not administrative headcounts or established statistical rankings.
- Missing survey results are not zero. Seven institution records have no separate column in the checked undergraduate export.
- School and college datasets describe different populations; they do not follow the same students over time.

## Data and evidence

The [data page](data.html) contains the complete citations, district and campus tables, source differences, analysis notes and downloads. Additional published measures remain in the downloads even when they are not shown in the short story.

- [District counts · CSV](data/nyc-student-homelessness-districts.csv) · [Validated display GeoJSON](data/nyc-district-display.geojson)
- [Campus evidence · CSV](data/cuny-colleges.csv) · [GeoJSON](data/cuny-colleges.geojson)
- [Data dictionary](data/README.md) · [Measure definitions](docs/measure-dictionary.md)
- [Source and release metadata](data/release-metadata.json) · [Analysis methods](docs/evidence/statistical-analysis.md)

The supplied SIRS workbook matches the published download: identical hashes and zero differences across 10,530 worksheet cells. Campus values are checked against retained public survey tables. No individual student records or personal routes are included.

## Run locally

The site uses the repository’s scrollytelly template, Leaflet, and plain HTML, CSS and JavaScript. No API key or build step is needed. Leaflet and Google Fonts load from external services.

```sh
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000).

For validation:

```sh
npm ci
npm test
npm run test:browser
```

The browser check starts a local server and uses installed Chrome/Chromium; set `CHROME_BIN` if necessary. Evidence checks use Python’s standard library. Optional geometry regeneration requires [requirements-spatial.txt](requirements-spatial.txt); preparation details are in the [data dictionary](data/README.md).

*Thomas Hagos · New York City*
