"""Prepare official CUNY institution points plus explicitly verified survey fields.

Run after downloading https://data.ny.gov/resource/irqs-74ez.json?$limit=100
Missing survey values mean not verified in this project, not zero or absent data.
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
 'Queensborough Community College': {
  'homelessness_pct': 4, 'housing_insecurity_pct': 38,
  'rent_increase_difficulty_pct': 31, 'underpaid_rent_pct': 17,
  'homelessness_2022_pct': 2, 'sample_size': 474, 'response_rate_pct': 12,
  'survey_source': 'https://www.qcc.cuny.edu/oira/docs/StudentExperienceSurvey_Spring24.pdf',
  'method_note': 'College-level weighted survey results. 474 total respondents; item sample sizes may differ. Past-12-month self-report, not an administrative count. No confidence intervals supplied here.',
  'source_pages': 'Printed pages 5, 21–23; executive summary page 3',
  'support_name': 'Advocacy Resource Center',
  'support_url': 'https://www.qcc.cuny.edu/arc/index.html',
 },
 'LaGuardia Community College': {
  'homelessness_pct': 5, 'housing_insecurity_pct': None,
  'rent_increase_difficulty_pct': 40, 'underpaid_rent_pct': 21,
  'homelessness_2022_pct': None, 'sample_size': 747, 'response_rate_pct': 14.9,
  'survey_source': 'https://www.laguardia.edu/wp-content/uploads/2025/01/cuny-student-experience-survey-2024.pdf',
  'method_note': 'Published campus survey percentages. 747 total respondents; item sample sizes may differ. Past-12-month self-report. Weighting details and confidence intervals not established in this project.',
  'source_pages': 'Printed pages 1 and 11',
  'support_name': 'LaGuardia CARES (catalog description)',
  'support_url': 'https://laguardia.catalog.cuny.edu/student-programs-and-services/student-services/overview',
 },
}
rows = json.loads((ROOT / 'data/raw/cuny-campus-locations.json').read_text())
features = []
for index, row in enumerate(rows):
 city = row['city']
 borough = city if city in ('Bronx', 'Brooklyn', 'Staten Island') else 'Manhattan' if city == 'New York' else 'Queens'
 p = dict(campus_id=index + 1, name=row['campus'], institution_type=row['college_or_institution_type'], borough=borough,
          address=row['address'], website=row['campus_website']['url'], survey_year=None,
          homelessness_pct=None, housing_insecurity_pct=None, rent_increase_difficulty_pct=None, underpaid_rent_pct=None,
          homelessness_2022_pct=None, sample_size=None, response_rate_pct=None, survey_source=None,
          method_note='Campus survey results have not yet been verified in this project.', source_pages=None, support_name=None, support_url=None)
 if p['name'] in SOURCES:
  p.update(SOURCES[p['name']]); p['survey_year'] = 2024
 coords=[float(row['long']), float(row['lat'])]
 assert -75 < coords[0] < -73 and 40 < coords[1] < 42
 features.append(dict(type='Feature', id=p['campus_id'], properties=p, geometry=dict(type='Point', coordinates=coords)))
assert len({f['properties']['name'] for f in features}) == len(features)
assert sum(f['properties']['homelessness_pct'] is not None for f in features) == 2
(ROOT/'data/cuny-colleges.geojson').write_text(json.dumps(dict(type='FeatureCollection', features=features), indent=2)+'\n')
with (ROOT/'data/cuny-colleges.csv').open('w',newline='') as handle:
 writer=csv.DictWriter(handle,fieldnames=[*features[0]['properties'], 'longitude','latitude']);writer.writeheader()
 for f in features:writer.writerow(dict(**f['properties'],longitude=f['geometry']['coordinates'][0],latitude=f['geometry']['coordinates'][1]))
print(f'Validated {len(features)} institution locations; 2 verified campus survey records.')
