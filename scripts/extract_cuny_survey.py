"""Rebuild the 2024 extract from retained public housing CSVs; no imputation.
Download URLs and exact filters are stored alongside the extract.
"""
import csv,json,hashlib,urllib.parse
from pathlib import Path
root=Path(__file__).resolve().parents[1]
base='https://insights.cuny.edu/t/CUNYGuest/views/2026StudentExperienceSurvey/'
section='Basic Needs\\, Mental Health\\, & Household Composition'
files=[];records=[]
for sector,filename in [('Senior Colleges','escaped'),('Community Colleges','community')]:
 p=root / ('data/raw/evidence/cuny-ses-2024-'+('senior' if filename=='escaped' else 'community')+'-housing.csv')
 rows=list(csv.DictReader(p.open()))
 rows=[r for r in rows if r['Sub Section']=='Housing Insecurity']
 out=root/('data/raw/evidence/cuny-ses-2024-'+('senior' if filename=='escaped' else 'community')+'-housing.csv')
 with out.open('w',newline='') as f:
  w=csv.DictWriter(f,fieldnames=rows[0].keys(),lineterminator="\n");w.writeheader();w.writerows(rows)
 query=urllib.parse.urlencode({'year':'2024','Section':section,'Parameters.Sector Selector':sector})
 files.append(dict(sector=sector,url=base+'AllResults.csv?'+query,view_url=base+'AllResults?'+query,file=str(out.relative_to(root)),sha256=hashlib.sha256(out.read_bytes()).hexdigest(),rows=len(rows)))
 records.extend(rows)
names={'BMCC':'Borough of Manhattan Community College','Bronx':'Bronx Community College','Hostos':'Hostos Community College','Kingsborough':'Kingsborough Community College','LaGuardia':'LaGuardia Community College','Queensborough':'Queensborough Community College','Guttman':'Guttman Community College','Medgar Evers':'Medgar Evers College','NYCCT':'New York City College of Technology','Staten Island':'College of Staten Island','Professional Studies':'School of Professional Studies','Baruch':'Baruch College','Brooklyn':'Brooklyn College','City':'The City College of New York','Hunter':'Hunter College','John Jay':'John Jay College of Criminal Justice','Lehman':'Lehman College','Queens':'Queens College','York':'York College'}
result={}
items={'homelessness_pct':('...have you ever been homeless?','Yes'),'housing_insecurity_pct':('% experiencing housing insecurity','Housing Insecure'),'rent_increase_difficulty_pct':('...was there a rent or mortgage increase that made it difficult to pay?','Yes'),'underpaid_rent_pct':('...have you been unable to pay or underpaid your rent or mortgage?','Yes')}
for short,long in names.items():
 campus={}
 for field,(item,value) in items.items():
  selected=[r for r in records if r['College']==short and r['Item']==item and r['Value']==value]
  assert len(selected)==1,(short,field)
  campus[field]=int(selected[0]['Numeric Display Calculation'].strip().rstrip('%'))
 result[long]=campus
assert result['Queensborough Community College']['homelessness_pct']==4
assert result['Queensborough Community College']['rent_increase_difficulty_pct']==31
assert result['LaGuardia Community College']['homelessness_pct']==5
assert result['LaGuardia Community College']['rent_increase_difficulty_pct']==39
(root/'data/raw/evidence/cuny-ses-2024-extract.json').write_text(json.dumps(dict(retrieved_on='2026-10-24',filters=dict(year=2024,section=section),files=files,campus_crosswalk=names,campuses=result,validation='Filtered dashboard visibly shows 2024, requested sector and Basic Needs section. Homelessness QCC 4% and LaGuardia 5%, QCC rent difficulty 31%, and both rent-underpayment figures match campus PDFs. LaGuardia rent difficulty is 39% in central dashboard versus 40% in campus PDF; use central 39% for consistent comparisons, reason not established. QCC central housing scale 44% differs from campus four-item composite 38%; retained as different measures, no reconciliation inferred.'),indent=2)+'\n')
print('19 campus profiles extracted; QCC and LaGuardia item cross-checks pass.')
