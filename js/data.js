async function fetchCollection(filename) {
  if (filename === 'nyc-student-homelessness-districts.geojson') {
    if (typeof DecompressionStream !== 'undefined') {
      try {
        const response = await fetch('data/nyc-district-display.geojson.gz');
        if (!response.ok) throw new Error('Compressed geometry unavailable');
        const bytes = await response.arrayBuffer(); const header = new Uint8Array(bytes);
        const blob = new Blob([bytes]);
        return header[0] === 31 && header[1] === 139
          ? await new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))).json()
          : JSON.parse(await blob.text());
      } catch { /* Retain a plain GeoJSON fallback for unsupported delivery. */ }
    }
    filename = 'nyc-district-display.geojson';
  }
  const response = await fetch(`data/${filename}`);
  if (!response.ok) throw new Error(`Unable to load ${filename}: ${response.status}`);
  return response.json();
}

/** One request per source file, shared by the story and exploration workspace. */
const requests = new Map();
export function loadData(filename) {
  if (!requests.has(filename)) {
    const started = performance.now();
    requests.set(filename, fetchCollection(filename).then(async (collection) => {
      if (filename === 'nyc-student-homelessness-districts.geojson') {
        const anchors = await loadData('district-symbol-anchors.json');
        for (const feature of collection.features) feature.symbolAnchor = anchors[String(feature.id)];
      }
      performance.measure(`data-ready:${filename}`, { start: started });
      return collection;
    }).catch((error) => { requests.delete(filename); throw error; }));
  }
  return requests.get(filename);
}
