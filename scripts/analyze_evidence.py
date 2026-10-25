"""Reproduce descriptive findings; no imputation or design-based inference."""
import csv
import hashlib
import json
from pathlib import Path
from statistics import median

ROOT = Path(__file__).resolve().parents[1]
extract = json.loads((ROOT / 'data/raw/evidence/cuny-ses-2024-extract.json').read_text())
for source in extract['files']:
    assert hashlib.sha256((ROOT / source['file']).read_bytes()).hexdigest() == source['sha256']
    rows = list(csv.DictReader((ROOT / source['file']).open()))
    assert len(rows) == source['rows']
    for name, values in extract['campuses'].items():
        # The explicit institution crosswalk and selected rows are retained below.
        assert all(0 <= value <= 100 for value in values.values())

districts = [f['properties'] for f in json.loads((ROOT / 'data/nyc-student-homelessness-districts.geojson').read_text())['features']]
changes = [100 * (p['homeless_2023_24'] - p['homeless_2021_22']) / p['homeless_2021_22'] for p in districts]
assert all(p['homeless_2021_22'] > 0 for p in districts)
campuses = [f['properties'] for f in json.loads((ROOT / 'data/cuny-colleges.geojson').read_text())['features']]
result = dict(reviewed_on='2026-10-24', district_records=len(districts),
              districts_with_increases=sum(x > 0 for x in changes),
              median_district_count_change_pct=round(median(changes), 1),
              min_district_count_change_pct=round(min(changes), 1),
              max_district_count_change_pct=round(max(changes), 1),
              campus_records=len(campuses), campuses_with_results=sum(p['homelessness_pct'] is not None for p in campuses),
              campuses_without_separate_result=sum(p['evidence_status'] == 'outside_survey' for p in campuses),
              campus_homelessness_published_range_pct=[min(v['homelessness_pct'] for v in extract['campuses'].values()), max(v['homelessness_pct'] for v in extract['campuses'].values())])
# Use CUNY's university weighting, never an average of campus percentages.
rows = list(csv.DictReader((ROOT / extract['files'][0]['file']).open()))
for field, item, answer in [('cuny_published_homelessness_pct','...have you ever been homeless?','Yes'),
                            ('cuny_published_housing_scale_pct','% experiencing housing insecurity','Housing Insecure')]:
    selected = [r for r in rows if r['College'] == 'Total University' and r['Item'] == item and r['Value'] == answer]
    assert len(selected) == 1
    result[field] = int(selected[0]['Numeric Display Calculation'].strip().rstrip('%'))
(ROOT / 'docs/evidence/statistical-analysis.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
