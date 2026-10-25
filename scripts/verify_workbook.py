"""Compare every worksheet cell and SHA-256 of supplied/published XLSX files.
Usage: python3 scripts/verify_workbook.py /path/to/supplied.xlsx
The downloaded published copy is retained in data/raw/evidence/.
"""
import hashlib
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def worksheets(path):
    with zipfile.ZipFile(path) as archive:
        strings = [''.join(node.itertext()) for node in ET.fromstring(archive.read('xl/sharedStrings.xml')).findall('s:si', NS)]
        result = {}
        for name in archive.namelist():
            if not (name.startswith('xl/worksheets/sheet') and name.endswith('.xml')):
                continue
            values = {}
            for cell in ET.fromstring(archive.read(name)).findall('.//s:c', NS):
                node = cell.find('s:v', NS)
                value = node.text if node is not None else ''
                if cell.get('t') == 's':
                    value = strings[int(value)]
                elif cell.get('t') == 'inlineStr':
                    value = ''.join(cell.find('s:is', NS).itertext())
                values[cell.get('r')] = value
            result[name] = values
    return result


supplied = Path(sys.argv[1])
published = ROOT / 'data/raw/evidence/SED-SIRS-3-Year-Summary-2022-2024.xlsx'
left, right = worksheets(supplied), worksheets(published)
differences = [(sheet, cell, left.get(sheet, {}).get(cell), right.get(sheet, {}).get(cell))
               for sheet in sorted(set(left) | set(right))
               for cell in sorted(set(left.get(sheet, {})) | set(right.get(sheet, {})))
               if left.get(sheet, {}).get(cell) != right.get(sheet, {}).get(cell)]
report = dict(retrieved='2026-10-24', source_page='https://www.nysteachs.org/grantees',
              download_url='https://www.nysteachs.org/_files/ugd/60b30b_705222e6c2654836a50931c50c6da244.xlsx?dn=SED-SIRS-3-Year-Summary-2022-2024.xlsx',
              supplied_sha256=hashlib.sha256(supplied.read_bytes()).hexdigest(),
              published_sha256=hashlib.sha256(published.read_bytes()).hexdigest(),
              compared_cells=sum(map(len, left.values())), different_cells=len(differences), differences=differences)
(ROOT / 'docs/evidence/workbook-comparison.json').write_text(json.dumps(report, indent=2) + '\n')
assert not differences, 'Published and supplied cells differ; inspect report before proceeding.'
print(f'Workbook verified: {report["compared_cells"]} cells, zero differences; identical bytes: {report["supplied_sha256"] == report["published_sha256"]}')
