"""Audit source hashes, all derived district values, rate categories, campus methods,
and local public-page references. Uses Python standard library only.
"""
import csv
import hashlib
from html.parser import HTMLParser
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_json(path):
    return json.loads((ROOT / path).read_text())


spec = importlib.util.spec_from_file_location('district_preparation', ROOT / 'scripts/prepare_school_districts.py')
preparation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(preparation)
workbook = ROOT / 'data/raw/evidence/SED-SIRS-3-Year-Summary-2022-2024.xlsx'
report = read_json('docs/evidence/workbook-comparison.json')
assert report['supplied_sha256'] == report['published_sha256'] == hashlib.sha256(workbook.read_bytes()).hexdigest()
assert report['different_cells'] == 0 and report['compared_cells'] == 10530
source = preparation.read_districts(workbook)
features = read_json('data/nyc-student-homelessness-districts.geojson')['features']
assert {feature['id'] for feature in features} == set(range(1, 33))
for feature in features:
    p = feature['properties']
    for field, value in source[feature['id']].items():
        assert p[field] == value, (feature['id'], field)
    assert '2026' in p['boundary_vintage'] and 'not established' in p['boundary_vintage']
    assert 'not residence' in p['count_basis']
    assert p['afc_rate_band_2023_24'] in range(5)
    assert p['afc_rate_source'].startswith('https://advocatesforchildren.org/')
assert next(f for f in features if f['id'] == 4)['properties']['afc_rate_band_label'] == '20% or more'
assert next(f for f in features if f['id'] == 26)['properties']['afc_rate_band_label'] == 'Under 5%'
with (ROOT / 'data/nyc-student-homelessness-districts.csv').open() as handle:
    rows = list(csv.DictReader(handle))
assert len(rows) == 32
for row in rows:
    p = next(f['properties'] for f in features if f['id'] == int(row['district']))
    assert row['afc_rate_band_label'] == p['afc_rate_band_label']
    for year in ('2021_22', '2022_23', '2023_24'):
        assert row[f'homeless_{year}'] == ('' if p[f'homeless_{year}'] is None else str(p[f'homeless_{year}']))
colleges = read_json('data/cuny-colleges.geojson')['features']
assert len(colleges) == 26
statuses = {status: sum(f['properties']['evidence_status'] == status for f in colleges)
            for status in ('available', 'reviewed_pending', 'not_yet_checked')}
assert statuses == dict(available=2, reviewed_pending=5, not_yet_checked=19)
raw_points = {r['campus']: r for r in read_json('data/raw/cuny-campus-locations.json')}
for feature in colleges:
    p = feature['properties']
    raw = raw_points[p['name']]
    assert feature['geometry']['coordinates'] == [float(raw['long']), float(raw['lat'])]
    if p['evidence_status'] == 'available':
        assert p['question_wording'] == 'Have you been homeless?'
        assert p['recall_period'] == 'Past 12 months, asked in spring 2024'
        assert p['item_sample_size'] is None and p['weighting'] and p['uncertainty_note']
    else:
        assert p['homelessness_pct'] is None and p['housing_insecurity_pct'] is None


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.references = [], []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for field in ('href', 'src'):
            value = attrs.get(field)
            if value:
                self.references.append(value)


page = Page()
html = (ROOT / 'index.html').read_text()
page.feed(html)
assert len(page.ids) == len(set(page.ids))
assert html.index('id="definitions"') < html.index('id="baseline"')
for reference in page.references:
    if reference.startswith('#'):
        assert reference[1:] in page.ids, reference
    elif not reference.startswith(('https:', 'http:', 'data:')):
        assert (ROOT / reference).is_file(), reference
assert 'I still need to confirm the original publication' not in html
assert '67%' in html and '34%' in html and '2022–23' in html
assert '63%' in html and '85%' in html and 'For 2023' in html
for district in (4, 24, 30):
    for year in ('2021_22', '2023_24'):
        assert f'{source[district][f"homeless_{year}"]:,}' in html
assert '3,045' in html
assert round(source[30]['change_pct_2021_22_to_2023_24']) == 131 and '+131%' in html
assert round(source[4]['change_pct_2021_22_to_2023_24']) == 122 and '122%' in html
assert '4%' in html and '38%' in html and '747' in html and '14.9%' in html
assert '2026 reference boundaries' in html
assert 'different student populations' in html and 'do not follow the same people' in html
assert 'I did not interview Christopher' in html
print('PASS: source hash and 10,530-cell record; all 32 district values; 32 published rate bands; export consistency; 26 campus coordinates; 2/5/19 evidence statuses; survey methods; local links and HTML anchors.')
