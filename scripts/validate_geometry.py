"""Audit source/derived topology; build an explicitly repaired display derivative.
Original files stay unchanged. Requires requirements-spatial.txt.
"""
import gzip
import hashlib
import json
from collections import defaultdict
from pathlib import Path
import shapely
from shapely.geometry import shape, mapping
from shapely.ops import transform, unary_union
from shapely.validation import explain_validity, make_valid
import pyproj

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'data/nyc-student-homelessness-districts.geojson'
raw = ROOT / 'data/raw/nyc-school-districts.geojson'
features = json.loads(source.read_text())['features']
project = pyproj.Transformer.from_crs('EPSG:4326', 'EPSG:26918', always_xy=True).transform
unproject = pyproj.Transformer.from_crs('EPSG:26918', 'EPSG:4326', always_xy=True).transform
parts = defaultdict(list); raw_invalid = []
for feature in json.loads(raw.read_text())['features']:
    district = int(feature['properties']['schooldist']); geo = shape(feature['geometry'])
    if not geo.is_valid: raw_invalid.append(dict(district=district, reason=explain_validity(geo)))
    parts[district].append(geo)

def polygons(geo):
    if geo.geom_type == 'Polygon': return [geo]
    if hasattr(geo, 'geoms'): return [p for g in geo.geoms for p in polygons(g)]
    return []

geometries = {}; anchors = {}; invalid = []; repairs = []; output = []
for feature in features:
    district = feature['properties']['district']; derived = shape(feature['geometry'])
    if not derived.is_valid: invalid.append(dict(district=district, reason=explain_validity(derived)))
    # Repair source parts individually and dissolve their overlaps; preserve source coordinates.
    projected_parts = [transform(project, g) for g in parts[district]]
    repaired = unary_union([p for g in projected_parts for p in polygons(make_valid(g))])
    assert repaired.is_valid and not repaired.is_empty
    result = transform(unproject, repaired)
    assert result.is_valid
    anchor = result.representative_point()
    assert result.covers(anchor)
    anchors[str(district)] = [anchor.x, anchor.y]
    geometries[district] = repaired
    if not derived.is_valid:
        repairs.append(dict(district=district, operation='make_valid on original source parts; retain polygon components; dissolve with unary_union; no simplification', derived_issue=explain_validity(derived)))
    output.append(dict(type='Feature', id=feature['id'], properties=feature['properties'], geometry=mapping(result)))
intersections=[]
for district, a in geometries.items():
    for other, b in geometries.items():
        if other <= district: continue
        area=a.intersection(b).area
        if area > 0.01: intersections.append(dict(districts=[district,other],overlap_square_metres=round(area,4)))
display=ROOT/'data/nyc-district-display.geojson'
display.write_text(json.dumps(dict(type='FeatureCollection',features=output),separators=(',',':'))+'\n')
compressed=Path(str(display)+'.gz')
compressed.write_bytes(gzip.compress(display.read_bytes(),mtime=0))
report=dict(source_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),raw_sha256=hashlib.sha256(raw.read_bytes()).hexdigest(),
    display_sha256=hashlib.sha256(display.read_bytes()).hexdigest(), original_bytes=source.stat().st_size,display_bytes=display.stat().st_size,gzip_bytes=compressed.stat().st_size,
    geometry_vintage='DCP 26b (2026)',projected_crs='EPSG:26918; NAD83 / UTM zone 18N; metres',
    shapely_version=shapely.__version__,pyproj_version=pyproj.__version__,district_features=len(features),
    raw_invalid_features=raw_invalid,original_derived_invalid_features=invalid,valid_display_features=len(geometries),repairs=repairs,
    overlap_reporting_threshold_square_metres=0.01,display_overlaps=intersections,
    union_area_square_metres=round(unary_union(list(geometries.values())).area,2),
    gap_assessment='Not established: no independent expected-coverage mask. Water/exclusions are not assumed gaps.',
    historical_comparison='Not established: no archived geometry retrieved.',
    simplification='None. Compact serialization and explicitly repaired source parts; no generalization tolerance applied.',
    anchors='Representative points inside validated display polygons. Symbol placements, not student locations. Original source and original derived files retained unchanged.')
(ROOT/'data/district-symbol-anchors.json').write_text(json.dumps(anchors,indent=2)+'\n')
(ROOT/'docs/evidence/geometry-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
