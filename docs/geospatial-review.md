# Geospatial product review

**Project:** A Stable Home, A School to Keep  
**Reviewed:** October 27, 2026  
**Basis:** Current local source, retained spatial datasets, evidence records, documentation, and a successful run of `scripts/audit_evidence.py`. This review does not represent a new live-site usability test, a full topology audit, or confirmation from the reporting agencies.

## Assessment

The project has a coherent public-interest question, a distinctive visual identity, and a substantially improved source trail. It works as an exploratory story about housing instability in two educational settings. Its next stage should strengthen the relationship between the numbers, the geography, and the decisions a reader can reasonably make.

For planning or resource-allocation use, the largest remaining gaps are the exact meaning of the school-district records, historical geographic consistency, and survey comparability. More controls or additional decorative dimensions would not resolve those gaps. The current 2D approach should remain the foundation.

The most useful organizing question is: **where does the evidence point to pressure on educational continuity, and what further evidence would help someone respond?** District counts establish a reporting pattern. They do not identify residential concentrations, service shortages, or the causes of disrupted attendance.

## Findings from the current implementation

| Observation | Evidence inspected | Implication |
| --- | --- | --- |
| Housing-scale colors conceal variation | Published campus scale values range from 39% to 68%; current breaks are below 20%, 20–under 40%, and 40%+. Eighteen of 19 available results occupy the darkest class. | The map distinguishes almost none of the measured campus variation. |
| Two institution points coincide | City College and the School of Medicine have identical coordinates in the retained official dataset. | One marker can obscure the other. A source coordinate should not be moved to make the map look clearer. |
| The main geometry file is about 2.18 MB before transfer compression | District GeoJSON is 2,178,933 bytes. | A measured performance review is justified, especially on mobile. This file size alone does not prove poor loading performance. |
| The story and explorer maintain separate data-loading paths | `SlideDeck.collections` caches story requests; `AtlasExplorer.loading` fetches both files separately. | A shared loader could reduce repeated application-level work. Browser caching may already reduce network transfer; measure that before claiming savings. |
| Metric definitions are duplicated | Count/change breaks appear in both story and atlas code; some labels still say “Housing insecurity” while other views specify the central scale. | Separate edits can cause inconsistent maps or terminology. |
| Core evidence audit passes | Workbook-derived district values, retained campus-table percentages, source hashes, coordinates, categories, and page references pass. | The retained evidence and application agree on the checks implemented. The audit does not resolve external reporting rules or topology. |
| Routine test entry point is incomplete | `package.json` retains a template description and an `npm test` placeholder that exits with an error. | Reproduction is documented, but the repository does not yet provide a clear single validation command. |

## Priority 1 — Make geographic interpretation defensible

### 1. Resolve the district reporting rule

**Why:** A technically successful district-ID join does not establish where counted students live, where their school buildings are, or whether the count has the same geographic meaning as a denominator.

**Work:** Obtain the exact NYC aggregation specification from NYSED or NYS-TEACHS. Confirm within-LEA uniqueness, transfer treatment, charter exclusions, District 75 treatment, attendance/residence fields, and any coding changes across years. A question is already prepared in the evidence notes; contacting an agency remains a separate authorized action.

**Reviewable result:** A short reporting-definition record with an authoritative source or dated agency response, plus consistent title, legend, tooltip, and export wording. If unresolved, preserve the explicit reporting-LEA interpretation and avoid claims about residential concentration.

### 2. Verify the historical geography and topology

**Why:** Current reference geometry is acceptable when labeled, but historical comparison needs a documented geographic basis before it informs planning.

**Work:** Retrieve official archived releases and change notes. Compare district IDs, internal borders, and coverage in an appropriate projected coordinate system with declared units. Distinguish coastline edits from internal boundary changes. Check invalid polygons, duplicate IDs, unexpected overlaps, and gaps against the intended coverage; water and legitimate exclusions are not automatically errors. Inspect material differences rather than relying only on area totals.

**Reviewable result:** A boundary comparison map and validation table, with a decision to use a documented stable reference geography, year-specific geometry, or a restricted comparison. Retain original inputs and record any repair. Never silently repair geometry and call it an official boundary.

### 3. Complete the college measure definitions

**Why:** A published percentage can be faithfully transcribed while its interpretation remains incomplete. The central housing scale's scoring is not yet established; campus-report composites should not be treated as interchangeable.

**Work:** Verify the central scale algorithm, population, question routing, and item denominators where published. Preserve the Queensborough 44% versus four-item 38% distinction. Investigate LaGuardia's 39% versus 40% rent-difficulty discrepancy without assuming its cause. Seek usable design and item-sample information before calculating uncertainty intervals.

**Reviewable result:** A measure dictionary with wording, recall period, population, scoring, weighting, source version, and missing-data rules. Use the same central-scale label everywhere. Keep campus comparisons descriptive until uncertainty is supportable.

## Priority 2 — Improve what the cartography communicates

### 4. Match the visual encoding to the question

For **how many reported records**, offer proportional circles anchored inside districts alongside exact-value tables. Circle area should be proportional to count, with a size legend; use an interior anchor rather than an outside-polygon centroid. Explain that the anchor is a symbol placement, not a student location.

For **what share of enrollment**, use the separately published AFC percentage-range choropleth. Preserve its original ranges and explain its different coverage. Do not relabel workbook counts as enrollment rates or distribute them among schools.

For **change over time**, combine the map with aligned small-multiple maps or a dot/slope chart. Hold classification thresholds and chart axes constant across comparable years. Distinguish count growth from a percentage-point change in prevalence.

**Reviewable result:** Three named views—reported count, published enrollment range, and count change—with units and source period always visible. Test whether a reader can explain what a dark district means in each view.

### 5. Repair the campus classifications and overlapping markers

Replace the housing-scale breaks that put 18 of 19 results in one class. A reasonable candidate to evaluate against the current 39–68% range is **under 40%, 40–under 50%, 50–under 60%, and 60%+**. These would be descriptive display classes, not validated risk thresholds. Compare them with a continuous scale and a companion dot plot before choosing. Keep the selected breaks fixed within a release.

Use sequential light-to-dark palettes for increasing values, an explicit empty/hollow or outlined symbol for missing evidence, and readable numeric labels in selection panels. Avoid relying on color alone. Color-vision simulation and actual reader testing should inform the final palette.

For coincident institutions, offer an expandable grouped marker or a popup listing each record, with keyboard access through the institution list. Preserve the stored official coordinates; do not create false campus geography through arbitrary jitter.

**Reviewable result:** A legend occupancy check for every measure and a test proving both City College and the School of Medicine can be selected independently from the shared location.

### 6. Add geographic orientation with restraint

The artistic map benefits from more contextual anchors: a limited set of borough names, water labels, district labels at suitable zooms, and the selected institution's name. Keep decorative elements visually subordinate to the data and legend.

A few verified neighborhood labels can help a public audience, but a district should not be described as though it were identical to one neighborhood. Avoid adding dozens of layers merely to make the map feel detailed.

**Reviewable result:** Desktop and mobile views in which readers can locate the featured area without opening another map, and selected labels do not overlap the legend or hide nearby features.

## Priority 3 — Make interaction answer useful questions

### 7. Provide guided analytical tasks

Organize the interface around a few actions: compare reported counts across years; inspect AFC's enrollment ranges; examine available campus survey evidence; and inspect the limitations of a selected record. Keep advanced filters available through progressive disclosure.

Add a clear distinction between **Follow the story** and **Explore freely**. A manually selected year should remain visible in the title, and readers should understand when scrolling restores a chapter's view. Existing explanatory text is a useful foundation.

Support-link filters must say they reflect **links documented in this project**, not the existence, quality, or availability of services. Only a small subset of campus support pages has been recorded.

**Reviewable result:** Observed reader tests covering five tasks: identify period and unit, select a district, compare two years, distinguish missing evidence from zero, and open the supporting source. Record where readers hesitate and whether they interpret reporting areas as residences.

### 8. Make the evidence inspectable without operating a map

Provide a campus table alongside the existing district table. Offer keyboard-accessible selection and source links, visible focus, adequate touch targets, and readable contrast. Test the actual focus order, dialog behavior, dynamic announcements, reduced-motion settings, and screen-reader experience.

A no-JavaScript or failed-script summary should retain the main findings, periods, and data links. External mapping-library failure should not hide the story's evidence. Existing accessible labels and native dialog behavior are helpful, but they do not establish full accessibility compliance.

**Reviewable result:** A person can complete the core evidence-reading tasks through tables and text. Document tested devices and assistive technology; do not claim compliance based on markup alone.

## Priority 4 — Strengthen spatial engineering and reproducibility

### 9. Treat geometry and measures as separate maintained assets

Keep original geometry for analysis. Measure whether a smaller, topology-preserving display version improves load and interaction performance. Validate any simplified output against the original using a documented positional tolerance in projected units and review small features, holes, and shared borders. Never present simplified geometry as a more accurate boundary.

Centralize data loading and metric configuration: labels, units, source IDs, date ranges, missing-value behavior, colors, and breaks should come from one definition used by the story, explorer, and exports.

**Reviewable result:** Before/after measurements under declared device/network conditions, a geometry-fidelity report, and matching legends and labels across both map modes. With only 32 districts and 26 institution records, a spatial database or vector-tile stack should be introduced only if measured needs justify it.

### 10. Make a release reproducible and citable

Replace the template package description and placeholder test command. Provide one documented validation command covering evidence checks and relevant lint, plus a separate browser smoke-test command. Preserve the meaningful interaction tests in the repository rather than relying on temporary scripts.

Add per-measure source IDs and versions to exports. Include geometry vintage, survey period, extraction date, and missing-data semantics in a downloadable metadata record. Record redistribution terms for each source; the application package's license does not automatically cover third-party data or report graphics.

A scheduled workflow can check source links and flag upstream changes. It should open a reviewable update rather than silently replacing published figures. Store the release's hashes and derived findings so a later live dashboard revision can be compared.

**Reviewable result:** Another person can reproduce the retained release, run its checks, and trace an exported value to the exact source and transformation used.

## Priority 5 — Add a new analytical chapter only when its evidence supports it

### 11. Add school and transportation context carefully

Official [NYC School Point Locations](https://data.cityofnewyork.us/Education/School-Point-Locations/jfju-ynrr) provide a candidate institutional context layer. Verify vintage, identifiers, coordinates, co-located schools, and active status before use. Location points alone provide no school-level homelessness prevalence and cannot legitimately receive a share of a district total.

The [MTA developer resources](https://www.mta.info/developers) provide official static GTFS schedules and transit feeds. A proposed travel-access analysis would need documented origins and destinations, a routing model, departure times, walking/transfer assumptions, and an appropriate service date. Current schedules cannot reconstruct a historical journey automatically. Distance to the nearest station does not establish a child's commute.

A responsible first chapter could show scheduled public-transit access to selected institutions from explicitly defined public reference locations. Label these as modeled scenarios, with no claim that they represent identified homeless students. Actual student-commute analysis requires suitable, authorized, protected data; personal routes should not be published.

**Reviewable result:** A method note and prototype demonstrating what is modeled, for whom, on what date, and what remains unknown. If suitable origins or historical service data are unavailable, keep the result as institutional access context or defer it.

### 12. Connect the map to a specific operational investigation

Choose one process to investigate, such as continuity of transportation after a placement change, maintaining school enrollment after a move, or completing a campus housing referral. Do not select the product simply because it matches available map layers.

Interview students and staff with consent; map the actual handoffs and record where delays occur. Identify the budget owner and the existing system of record. Agree on a measurable baseline and a feasible outcome before designing a HOMES OS pilot. Examples of candidate measures are time to referral completion or time to confirmed transportation arrangements; the present map does not establish either baseline.

**Reviewable result:** A narrow problem statement, documented workflow, named prospective buyer role, baseline measurement plan, and a pilot hypothesis. This is the bridge from a research story to a potentially useful product.

## Recommended sequence

| Pass | Deliverable | Completion condition |
| --- | --- | --- |
| 1. Correct the immediate visual issues | Campus class redesign, coincident-marker handling, consistent measure labels | All available values and both co-located institutions remain independently inspectable; legends explain the encoding. |
| 2. Resolve the external evidence questions | Reporting specification, historical boundary comparison, central survey scoring | Authoritative evidence is retained, or the unresolved limitation explicitly constrains the relevant claim and use. |
| 3. Improve comprehension | Clear map modes, period labels, geographic context, campus table, reader/accessibility testing | Readers can explain unit, period, coverage, source, and missingness and complete the core tasks. |
| 4. Make maintenance dependable | Shared metric definitions, repeatable checks, measured display optimization, versioned exports | A second person can reproduce and audit a release without undocumented steps. |
| 5. Investigate educational continuity | A carefully sourced access chapter and one operational workflow study | The analysis supports a specific question, and any pilot has a buyer, baseline, and outcome to test. |

The strongest next release would help a reader interpret fewer measures more accurately. The strongest next research phase would explain one practical barrier to educational continuity with evidence the current district and campus layers cannot supply.
