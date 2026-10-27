"""Record exact retained sources and derived release files; no network requests."""
import hashlib
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
paths=['data/nyc-student-homelessness-districts.geojson','data/nyc-student-homelessness-districts.csv',
       'data/cuny-colleges.geojson','data/cuny-colleges.csv','data/nyc-district-display.geojson',
       'data/nyc-district-display.geojson.gz','data/district-symbol-anchors.json',
       'data/raw/evidence/cuny-ses-2024-senior-housing.csv','data/raw/evidence/cuny-ses-2024-community-housing.csv',
       'data/raw/evidence/SED-SIRS-3-Year-Summary-2022-2024.xlsx']
result=dict(release='geospatial-2026-10-27',prepared_on='2026-10-27',source_retrieval_date='2026-10-24',
    geography='DCP26b (2026) reference geography, not residences; historical equivalence unresolved.',
    geometry_derivative='Original geometry retained. Display file repairs original polygon parts; see docs/evidence/geometry-validation.json.',
    periods=dict(school_counts=['2021–22','2022–23','2023–24'],college_survey='Spring2024; past12months',opening_context='2024–25'),
    missingness='Suppressed and missing values are not zero. Seven institution records have no separate undergraduate survey column.',
    sources=json.loads((ROOT/'docs/evidence/source-register.json').read_text())['sources'],
    methods=['docs/measure-dictionary.md','docs/evidence/statistical-analysis.md','docs/evidence/geometry-validation.json'],
    rights='Source publications retain their respective rights and terms. Application licensing does not relicense third-party sources. Retained survey CSVs contain public aggregates; report PDFs and graphics are linked, not republished.',
    files=[dict(path=p,bytes=(ROOT/p).stat().st_size,sha256=hashlib.sha256((ROOT/p).read_bytes()).hexdigest()) for p in paths])
(ROOT/'data/release-metadata.json').write_text(json.dumps(result,indent=2)+'\n')
print('Recorded',len(paths),'release files with hashes and source metadata.')
