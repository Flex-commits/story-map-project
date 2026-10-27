# Geospatial implementation record — October 27, 2026

## Implemented in this release

1. **Campus colors:** four housing-scale classes instead of putting18 of19 values in the darkest class; optional continuous0–100% color mode; alphabetical, interactive exact-value dot chart. Breaks are descriptive, not risk categories. Classification definitions are shared between both maps.
2. **Shared locations:** coincident campus records are grouped without moving coordinates. The popup offers a button for every institution, and both institution lists remain keyboard accessible. City College and School of Medicine can be inspected independently.
3. **Geographic meaning:** reporting-LEA wording retained; the measure dictionary states the assignment uncertainty. Exports now include per-measure source, unit and period, with a release-metadata link.
4. **Geometry:** raw source defects in districts17 and24; combining parts produces an invalid district10; six-decimal rounding adds district25 to the invalid derived set. Original files remain unchanged. A separately named display derivative repairs source polygon parts with Shapely `make_valid`, retains polygon components and dissolves overlaps. All32 display features validate. No simplification is used. Small inter-district intersections are reported rather than silently erased. Gaps cannot be assessed without an independent coverage mask. See [machine-readable report](geometry-validation.json).
5. **Map encodings:** reported counts use circles with area proportional to count and a fixed cross-year scale, placed at validated interior anchors. Enrollment categories and count change remain separate polygon measures. Circle anchors do not locate students. Existing aligned comparison bars retain a common scale across pinned districts.
6. **Measure definitions:** [dictionary](../measure-dictionary.md), source differences and missingness rules; no invented survey uncertainty or scoring.
7. **Guided exploration:** task shortcuts, clearer return-to-story wording, active period labels, and support-link wording that reflects documented links rather than service availability.
8. **Readable alternatives:** district and campus tables are included in the delivered HTML, so they remain available without JavaScript. Scrollable tables are keyboard focusable. Borough/water labels provide context; the institution lists and dot charts offer exact-value selection.
9. **Engineering:** shared data loader, common metric definitions, documented compressed display geometry with uncompressed fallback, evidence/unit checks, retained browser checks and meaningful npm commands. Original input files and source hashes remain available.

## Research performed; not resolved by code

- The NYS-TEACHS [data page](https://www.nysteachs.org/data-on-student-homelessness), reviewed October27, describes enrolled district/charter students experiencing homelessness at any point in each school year. It does not settle the full NYC extract specification or transfer/District75 exceptions.
- DCP's [school-district resource page](https://www.nyc.gov/content/planning/pages/resources/datasets/school-districts) again returned a page shell in the public reader. The [legacy metadata PDF](https://www.nyc.gov/assets/planning/download/pdf/data-maps/open-data/nysd_metadata.pdf) is available but its text is not reliably readable, and metadata alone is not archived geometry. No historical boundary equivalence is claimed.
- Public CUNY and campus survey resources were reviewed again. No authoritative central scale algorithm or explanation of the LaGuardia discrepancy was established. Published percentages remain intact and comparison limitations remain visible.

## Access and educational continuity: prepared, not fabricated

Official school-location and MTA sources are candidates for an access chapter. The school point catalogue includes historical releases; a recently updated catalogue date must not be confused with a current school year. No school receives an allocated share of a district's homelessness total. No historical commute is inferred from current schedules.

The [access-analysis protocol](../access-analysis-protocol.md) defines the data, assumptions, and release checks needed before publishing modeled travel times. It provides a concrete research deliverable without implying that origins, historical routes, or student journeys have been established.

A separate [continuity pilot brief](../continuity-pilot-brief.md) narrows the product investigation to confirming transportation after a placement change. Buyer, workflow delay, and outcomes are hypotheses until interviews and operational records establish them. No outreach, agency contact, or participant interviews have been performed.

## Validation boundaries

Automated checks and browser tests can establish implemented behavior and agreement with retained records. They do not replace observed reader tests, screen-reader testing on actual assistive technology, historical agency confirmation, consented interviews, or service-capacity verification. This release does not claim full accessibility compliance or decision-grade residential analysis.

## Validation results

`npm test` passes: retained evidence audit, seven focused cartographic/data-loading checks, ESLint and Stylelint. Retained Chrome checks pass for the four-class and continuous campus views, exact-value charts, both shared-location selections, count-area rendering, year playback, comparison/export/share state, mobile sizing, static26-campus/32-district tables with JavaScript disabled, map-library failure fallback, and no uncaught browser exceptions. Mobile map-key filters collapse by default to preserve map area. Resource timing confirms one compressed district-geometry request before navigation; the retained gzip file is1,363,446bytes versus3,717,878bytes for the exact uncompressed display derivative. These are local measurements, not a field-network benchmark. No full accessibility-compliance or observed-reader-test claim is made.
