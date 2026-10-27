import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { metrics, countRadius, measureMetadata } from '../js/cartography.js';
const readJSON = async (file) => JSON.parse(await readFile(new URL(file, import.meta.url), 'utf8'));

test('housing classes reveal retained variation and preserve exact source values', async () => {
  const colleges = await readJSON('../data/cuny-colleges.geojson');
  const known = colleges.features.filter((f) => f.properties.housing_insecurity_pct !== null);
  const bins = metrics.housing_insecurity_pct.bins;
  const occupancy = bins.map((bin, i) => known.filter((f) => bins.findIndex((b) => f.properties.housing_insecurity_pct < b.max) === i).length);
  assert.equal(known.length, 19);
  assert.ok(occupancy.every((n) => n > 0));
  assert.ok(Math.max(...occupancy) < 18);
  assert.equal(colleges.features.find((f) => f.properties.name === 'Queensborough Community College').properties.housing_insecurity_pct, 44);
});

test('circle area ratios match count ratios across years', () => {
  const area = (n) => Math.PI * countRadius(n) ** 2;
  assert.ok(Math.abs(area(8000) / area(2000) - 4) < 1e-12);
  assert.equal(countRadius(null), 0);
  assert.equal(countRadius(0), 0);
});

test('shared campuses retain official identical coordinates and independent evidence', async () => {
  const colleges = await readJSON('../data/cuny-colleges.geojson');
  const city = colleges.features.find((f) => f.properties.name === 'The City College of New York');
  const medicine = colleges.features.find((f) => f.properties.name === 'School of Medicine');
  assert.deepEqual(city.geometry.coordinates, medicine.geometry.coordinates);
  assert.notEqual(city.id, medicine.id);
  assert.equal(typeof city.properties.homelessness_pct, 'number');
  assert.equal(medicine.properties.homelessness_pct, null);
});

test('all map records have retained evidence and interior-anchor metadata', async () => {
  const original = await readJSON('../data/nyc-student-homelessness-districts.geojson');
  const display = await readJSON('../data/nyc-district-display.geojson');
  const anchors = await readJSON('../data/district-symbol-anchors.json');
  assert.equal(display.features.length, 32);
  assert.equal(Object.keys(anchors).length, 32);
  for (const f of display.features) {
    assert.deepEqual(f.properties, original.features.find((o) => o.id === f.id).properties);
    assert.equal(anchors[f.id].length, 2);
  }
  const report = await readJSON('../docs/evidence/geometry-validation.json');
  assert.equal(report.valid_display_features, 32);
  assert.equal(report.original_derived_invalid_features.length, 4);
});

test('export provenance separates published ordinal ranges, counts and survey percentages', () => {
  assert.match(measureMetadata('afc_rate_band_2023_24').measure_unit, /not an exact rate/);
  assert.match(measureMetadata('homelessness_pct').measure_unit, /survey/);
  assert.match(measureMetadata('homeless_2021_22').measure_unit, /not residence/);
  assert.equal(measureMetadata('homeless_2021_22').source_period, '2021–22');
});

test('shared loader deduplicates concurrent requests and retries after an error', async () => {
  const originalFetch = globalThis.fetch;
  const { loadData } = await import('../js/data.js?dedup-test');
  let calls = 0;
  try {
    globalThis.fetch = async () => { calls++; return new Response('{"ok":true}'); };
    const [a, b] = await Promise.all([loadData('test.json'), loadData('test.json')]);
    assert.equal(calls, 1); assert.equal(a, b);
    globalThis.fetch = async () => { calls++; return new Response('', { status: 500 }); };
    await assert.rejects(loadData('retry.json'));
    globalThis.fetch = async () => { calls++; return new Response('{"retry":true}'); };
    assert.equal((await loadData('retry.json')).retry, true);
    assert.equal(calls, 3);
  } finally { globalThis.fetch = originalFetch; }
});

test('compressed geometry decodes without changing properties and shares anchor fetch', async () => {
  const originalFetch = globalThis.fetch;
  const { loadData } = await import('../js/data.js?compressed-test');
  const compressed = await readFile(new URL('../data/nyc-district-display.geojson.gz', import.meta.url));
  const anchors = await readFile(new URL('../data/district-symbol-anchors.json', import.meta.url));
  const calls = [];
  try {
    globalThis.fetch = async (url) => { calls.push(url); return new Response(url.endsWith('.gz') ? compressed : anchors); };
    const data = await loadData('nyc-student-homelessness-districts.geojson');
    assert.equal(data.features.length, 32);
    assert.deepEqual(data.features[0].symbolAnchor, JSON.parse(anchors)[String(data.features[0].id)]);
    assert.equal(calls.length, 2);
  } finally { globalThis.fetch = originalFetch; }
});
