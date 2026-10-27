# Historical boundary review

Reviewed October 24, 2026. Status: **historical consistency not established**.

## What is established

The downloaded NYC DCP source identifies its current release as 26b (2026). It contains 33 geometry features, joined into 32 district features for the map. District identifiers and ring closure were checked. These checks do not establish stable boundaries over time or full topological validity.

## Retrieval attempts

1. Official [DCP archive page](https://www.nyc.gov/content/planning/pages/resources/datasets/school-districts): the search reader returned only a page shell; direct download returned HTTP 403; public Chrome inspection returned Access Denied. The browser observation is retained in `public-source-review.json`.
2. Legacy official archive candidate `https://www.nyc.gov/assets/planning/download/zip/data-maps/open-data/nysd_23d.zip`: HTTP 403; no geometry retrieved or compared. The exact archive filename was not verified from an accessible index.
3. Retired Socrata dataset `r8nu-ymqj`: metadata request returned HTTP 404.
4. Independent Census TIGERweb ACS2023 School District Administrative Areas layer 84 queried for New York: returned zero features. This is not a substitute for NYC's 32 community district boundaries. The empty response is retained as a diagnostic JSON, not used as map geometry.

## Decision

Do not claim unchanged boundaries, zero area change, or that any difference was merely coastal. Keep the 2026 geometry as an explicitly labeled reference map. Explain this beside the map, in downloads, and in the source notes. Numerical LEA changes remain changes in the reported records; they are not evidence of change within a historically fixed residential area.

A full area/interior-boundary comparison requires the actual archived releases. No comparison statistics have been fabricated. If an archive becomes available, compare releases for 2021–22, 2022–23, and 2023–24 in a common projected CRS, separate coastline differences from internal district-border changes, and inspect changed areas before choosing a common or year-specific geography.

## Draft archive request — not sent

Please provide archived NYC community school district polygons and change notes covering school years 2021–22, 2022–23, and 2023–24, with release dates, CRS, and any changes in district assignment. We are using DCP 26b as a reference layer and need to establish whether internal district boundaries changed during the study period.

## October 27 topology update

A new Shapely/PROJ review distinguishes source, combination, and rounding defects. Original downloaded and derived files remain unchanged; a separately named display derivative repairs source polygon parts and dissolves within-district overlaps. All32 display features validate. The [report](geometry-validation.json) records the source defects, four invalid features in the earlier derivative, operations, interior anchors, small inter-district intersections and file hashes. No simplification is used. An independent coverage mask and archived releases remain unavailable, so gap completeness and historical equivalence are still unestablished. Geometry validity does not resolve either question.
