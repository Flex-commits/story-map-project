# Educational continuity and institutional access

## Proposed question

How does scheduled public-transit access to a school or college vary across explicitly defined public reference locations and departure times?

This can become a modeled institutional-access chapter. It would not establish the actual journeys or housing locations of students experiencing homelessness.

## Evidence required before displaying a travel time

| Input | Required check |
| --- | --- |
| School / college destination | Official source, actual academic year, active status, stable identifier, usable entrance coordinate and co-located institutions. [NYC school point catalogue](https://data.cityofnewyork.us/Education/School-Point-Locations/jfju-ynrr). |
| Public reference origins | Explicit selection rule, spatial resolution, and purpose. Origins must not be presented as student homes or shelters. |
| Transit schedules | Archived or contemporary feed matched to the modeled service date; [MTA developer sources](https://www.mta.info/developers). Current feeds do not reconstruct earlier school years. |
| Routing model | Versioned routing software/feed graph, departure window, walk speed, transfer penalties, maximum walking distance and accessible-travel assumptions. |
| Outcomes | Scheduled door-to-door duration, transfer count and walk time; unreachable results distinguished from missing feeds. |
| Sensitivity | Compare multiple departure times and parameter choices. Record uncertainty caused by schedule availability and service changes. |

## Publication gate

Publish a small reproducible scenario only when the above inputs are verified and the route outputs are inspected. Include a table, map, date/time selector and explanation that the output is modeled scheduled access. Do not infer causation or combine these scenarios with administrative counts into a personal journey. If suitable historical data are unavailable, label a current scenario as current or defer it.

## Next concrete step

Select one institution and a small, documented set of public reference origins, inspect the official location vintage and relevant GTFS service calendar, then build and verify one scenario before expanding the geography. No travel times or student-origin coordinates are claimed by this protocol.
