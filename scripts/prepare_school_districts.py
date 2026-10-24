"""Join the supplied NYSED workbook to downloaded NYC district boundaries.

Usage: python3 scripts/prepare_school_districts.py /path/to/workbook.xlsx
Uses only Python's standard library. No network requests.
"""
import csv
import json
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
YEARS = {'G': '2021_22', 'H': '2022_23', 'I': '2023_24'}


def read_districts(path):
    with zipfile.ZipFile(path) as archive:
        strings = [''.join(node.itertext()) for node in
                   ET.fromstring(archive.read('xl/sharedStrings.xml')).findall('s:si', NS)]
        sheet = ET.fromstring(archive.read('xl/worksheets/sheet1.xml'))
    districts = {}
    for row in sheet.findall('.//s:sheetData/s:row', NS):
        values = {}
        for cell in row.findall('s:c', NS):
            value_node = cell.find('s:v', NS)
            value = value_node.text if value_node is not None else ''
            if cell.get('t') == 's':
                value = strings[int(value)]
            values[re.sub(r'\d', '', cell.get('r'))] = value
        match = re.match(r'NYC GEOG DIST\s*#\s*(\d+)', values.get('B', ''))
        if not match or values.get('C') != 'SCHOOL DISTRICT':
            continue
        district = int(match.group(1))
        assert district not in districts, f'Duplicate workbook district {district}'
        properties = {'district': district, 'beds_code': values['A'],
                      'lea_name': values['B'], 'county': values['D']}
        for column, year in YEARS.items():
            raw = values.get(column, '')
            properties[f'homeless_{year}'] = None if raw in ('s', '') else int(raw)
            properties[f'suppressed_{year}'] = raw == 's'
        first, last = properties['homeless_2021_22'], properties['homeless_2023_24']
        properties['change_count_2021_22_to_2023_24'] = (
            last - first if first is not None and last is not None else None)
        properties['change_pct_2021_22_to_2023_24'] = (
            round((last - first) / first * 100, 2)
            if first is not None and first > 0 and last is not None else None)
        districts[district] = properties
    assert set(districts) == set(range(1, 33)), 'Expected all 32 workbook districts'
    return districts


def rounded(value):
    if isinstance(value, list):
        return [rounded(item) for item in value]
    return round(value, 6) if isinstance(value, float) else value


def main():
    districts = read_districts(sys.argv[1])
    raw = json.loads((ROOT / 'data/raw/nyc-school-districts.geojson').read_text())
    polygons = {}
    for feature in raw['features']:
        district = int(feature['properties']['schooldist'])
        geometry = feature['geometry']
        assert geometry['type'] in ('Polygon', 'MultiPolygon')
        parts = geometry['coordinates'] if geometry['type'] == 'MultiPolygon' else [geometry['coordinates']]
        polygons.setdefault(district, []).extend(parts)
    assert set(polygons) == set(districts), 'Unmatched boundary/workbook districts'
    features = [{'type': 'Feature', 'id': district, 'properties': districts[district],
                 'geometry': {'type': 'MultiPolygon', 'coordinates': rounded(polygons[district])}}
                for district in sorted(districts)]
    for feature in features:
        for polygon in feature['geometry']['coordinates']:
            for ring in polygon:
                assert len(ring) >= 4 and ring[0] == ring[-1], 'Invalid polygon ring'
                assert all(-75 < x < -73 and 40 < y < 42 for x, y in ring), 'Unexpected coordinates'
    output = {'type': 'FeatureCollection', 'features': features}
    (ROOT / 'data/nyc-student-homelessness-districts.geojson').write_text(json.dumps(output, separators=(',', ':')) + '\n')
    with (ROOT / 'data/nyc-student-homelessness-districts.csv').open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=list(districts[1]))
        writer.writeheader()
        writer.writerows(districts[district] for district in sorted(districts))
    print(f'Validated {len(features)} matched districts; {len(raw["features"])} source boundary features.')
    print('District 4:', json.dumps(districts[4]))


if __name__ == '__main__':
    main()
