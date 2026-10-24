# A Place to Learn, A Place to Live

A scrolling story map by Thomas Hagos exploring reported student homelessness across NYC's 32 geographic school districts, school years 2021–22 through 2023–24. Built from the course's `templates/scrollytelly` Leaflet and SlideDeck template, with a shared data cache and responsive layout.

## Run locally

From this directory:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Serve over HTTP rather than opening the HTML file directly, because the app fetches GeoJSON. Leaflet and optional Google Fonts require internet access; district geometry is local and no external basemap tiles are required. Serif and sans-serif system fallbacks are provided. The story and CSV download remain available if the map library fails.

## What is included

Six numbered chapters plus an introduction: baseline counts, later counts with the same legend thresholds, percentage change in counts, a District 4 focus, research questions, and sources. Districts have tooltips and clickable popups. The sources chapter includes a full data table and CSV download. Mobile keeps a shorter map above the story, and reduced-motion settings are respected.

The map does not show students' home locations or enrollment-based homelessness rates. Separate charter records, District 75, and central office rows are excluded. Do not sum agency records into unique student totals. Current boundaries have not yet been checked against historical releases. This is an initial descriptive research project, not evidence that service coordination caused homelessness or a deployed HOMES OS product.

## Data and citations

- User-supplied NYSED SIRS workbook: `SED-SIRS-3-Year-Summary-2022-2024.xlsx`, worksheet `3-yr Homeless Counts`. Original publication URL remains to be verified.
- [NYC Department of City Planning: School Districts](https://data.cityofnewyork.us/City-Government/School-Districts/8ugf-3d8u), release 26b, downloaded October 24, 2026.
- [Advocates for Children: 2024–25 student homelessness](https://advocatesforchildren.org/policy-resource/student-homelessness-data-2025/), linked only to distinguish the later headline from the workbook years.

See [data/README.md](data/README.md) for field definitions, preparation instructions, and limitations. Source notes also appear in the app.

## Code checks

```sh
npm ci
npx eslint js
npx stylelint css/index.css
```

The original templates remain in `templates/`. The root `index.html` is the story map entry point and can be served by GitHub Pages. Publishing is not part of this initial local implementation.

## Atlas art direction

Warm paper texture, copper choropleths, Cormorant Garamond italic lettering, an animated SVG ink flourish, compass, coordinate grid, scale bar, and plate numbers give the story an atlas composition. The original scrolling template structure is retained. Chapter navigation and a reading-progress line support the narrative; small charts compare annual counts in Districts 24 and 4. Map fly transitions respect reduced-motion preferences. Decorative marks do not represent student routes or inferred movement.

Desktop (1440 × 1050) and mobile (390 × 844) browser checks cover the introduction and District 4 views, all 32 table rows, chart rendering, no horizontal overflow, and successful map loading.

## College explorer

The story now includes all 26 records in NY Open Data's CUNY institution-location dataset, two sourced campus survey profiles, campus search, borough filters, measure selection, a verified-value filter, source cards, and a campus CSV. Gray means not verified here, not zero. This is not a complete survey of all NYC universities. See the college section of `data/README.md` for methodology.

### Extension validation

JavaScript and CSS lint checks pass. Prior browser checks at desktop and mobile sizes verified 26 institution entries, search, metric changes, verified-value filtering, reset, selected source cards, year selection, and chapter transitions. The 3D experiment has been removed; the application uses the 2D Leaflet atlas. Institutional coverage remains limited to the supplied CUNY location dataset, with two campus survey profiles verified.

## Interactive exploration workspace

Open **Explore & compare** on the map, or **Open the interactive atlas** on the cover. The authored story remains in the original scrolling template; the native dialog supplies a separate Leaflet exploration map.

- Switch between 32 K–12 districts and 26 CUNY institution locations.
- Search by district/name, borough, or campus address; filter by borough, institution type, evidence coverage, and verified support links.
- Select a year on the slider or explicitly play/pause the three K–12 years. Playback stops when the dialog closes, when the browser tab is hidden, or when the growth measure is selected.
- Select a legend color to filter its features. Select it again to clear. Missing evidence is never treated as zero.
- Select a map feature or result for details; toggle compact labels; fit the map to current results. Relevant filters automatically reframe the map.
- Pin up to three districts or institutions. District comparison bars share a zero baseline and common scale; campus cards keep separate measures and survey methods visible. Changing evidence layers clears comparisons.
- Download the filtered records or pinned comparison as CSV.
- Share a URL containing the evidence layer, year, measure, filters, labels, selected feature, and pins. Opening that URL restores the workspace. The copyable input remains available if clipboard permission is unavailable.
- On phones, enlarge the map with **Larger map**, then restore the filter space with **More filters**. Escape or **Back to the story** closes the dialog. Focus returns to the original opener.
- Previous/next chapter buttons and map reset support the guided narrative. District and college story popups can open a selected record in the comparison workspace.

Browser validation covered time playback, district/campus selection, the three-pin limit, linked comparison charts, legend filters, search/borough/type/evidence filters, empty results, actual filtered CSV contents, shared-URL restoration, mobile overflow and map expansion, Escape dismissal, and no uncaught exceptions. JavaScript and CSS lint checks pass. The prior data coverage limitations still apply; no new survey rates, student residences, or travel routes are inferred.
