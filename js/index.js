import { SlideDeck } from './slidedeck.js';
import { COUNT_BINS, countRadius } from './cartography.js';
import { districtLayer, addOrientation } from './map-layers.js';
import { campusLayer, compactCampusCard, metrics } from './colleges.js';

const status = document.querySelector('#map-status');
const format = (value) => value === null ? 'Unavailable' : value.toLocaleString('en-US');

function districtCard(feature, metric) {
  const p = feature.properties;
  const card = document.createElement('div');
  const heading = document.createElement('h3'); heading.textContent = `District ${p.district}`;
  const value = document.createElement('p'); value.textContent = `${format(p[metric])} students identified by reporting LEA · ${metric.replace('homeless_', '').replace('_', '–')}`;
  const note = document.createElement('p'); note.className = 'popup-note'; note.textContent = 'Reporting records, not student home locations. Transfers can duplicate records across agencies.';
  const link = document.createElement('a'); link.href = 'data.html#source-school'; link.textContent = 'Source and annual figures ↗';
  card.append(heading, value, note, link); return card;
}

function legend(slide) {
  const college = slide.dataset.layer === 'colleges';
  document.querySelector('#map-title').textContent = college ? 'CUNY institutions · spring 2024' : `Reporting districts · ${slide.dataset.year}`;
  document.querySelector('#legend-title').textContent = college ? 'Reported homelessness (%)' : 'Reported students';
  document.querySelector('#map-note').textContent = college ? 'Institutions, not student homes.' : '2026 reference districts · not student homes.';
  const items = document.querySelector('#legend-items'); items.replaceChildren();
  if (college) {
    for (const bin of [...metrics.homelessness_pct.bins, { color: '#f6f0e5', label: 'No separate result' }]) {
      const row = document.createElement('span'); row.className = 'legend-bin';
      const swatch = document.createElement('i'); swatch.style.backgroundColor = bin.color; swatch.setAttribute('aria-hidden', 'true');
      row.append(swatch, document.createTextNode(bin.label)); items.append(row);
    }
  } else {
    for (const count of [2000, 8000]) {
      const row = document.createElement('span'); row.className = 'size-key';
      const circle = document.createElement('i'); circle.style.width = `${2 * countRadius(count)}px`; circle.style.height = `${2 * countRadius(count)}px`; circle.setAttribute('aria-hidden', 'true');
      row.append(circle, document.createTextNode(format(count))); items.append(row);
    }
  }
}

if (typeof L === 'undefined') {
  status.textContent = 'The map could not load. The story and data tables remain available.';
} else {
  const map = L.map('map', { scrollWheelZoom: false, zoomControl: false, zoomSnap: 0.1 }).setView([40.72, -73.94], 10);
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.control.scale({ imperial: false, position: 'bottomright', maxWidth: 80 }).addTo(map);
  map.attributionControl.addAttribution('Boundaries: NYC DCP · Institution points: NYS Open Data');
  addOrientation(map);
  const slides = [...document.querySelectorAll('.slide')];
  const options = {};
  const select = (feature) => { document.querySelector('#map-selection').textContent = `${feature.properties.name}: ${feature.properties.homelessness_pct === null ? 'no separate undergraduate survey result' : `${feature.properties.homelessness_pct}% reported homelessness`}.`; };
  for (const slide of slides) {
    if (slide.dataset.layer === 'colleges') {
      options[slide.id] = { createLayer: (collection) => campusLayer(collection, { metric: 'homelessness_pct', onSelect: select, card: compactCampusCard }) };
    } else {
      const config = {
        style: (feature) => ({
          color: feature.id === Number(slide.dataset.district) ? '#743b30' : '#f6f0e5',
          weight: feature.id === Number(slide.dataset.district) ? 2.5 : 1,
          fillColor: COUNT_BINS.find((bin) => feature.properties[slide.dataset.metric] < bin.max).color,
          fillOpacity: 0.8,
        }),
        onEachFeature: (feature, layer) => layer.bindPopup(() => districtCard(feature, slide.dataset.metric), { maxWidth: 280 }),
      };
      config.createLayer = (collection) => districtLayer(collection, config, slide.dataset.metric);
      options[slide.id] = config;
    }
  }
  const deck = new SlideDeck(document.querySelector('.slide-section'), slides, map, options);
  let backdrop;
  document.addEventListener('storyslide', ({ detail }) => {
    if (detail.slide.dataset.layer === 'colleges') {
      backdrop?.addTo(map); backdrop?.bringToBack();
    } else {
      if (!backdrop) backdrop = L.geoJSON(detail.collection, { interactive: false, style: { color: '#9ca697', weight: 0.5, fillColor: '#d6cfbf', fillOpacity: 0.25 } });
      backdrop.remove();
    }
    legend(detail.slide);
  });
  let scheduled = false;
  document.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { deck.calcCurrentSlideIndex(); scheduled = false; });
  }, { passive: true });
  window.addEventListener('resize', () => { map.invalidateSize(); deck.calcCurrentSlideIndex(); deck.syncMapToCurrentSlide(); });
  deck.calcCurrentSlideIndex();
}
