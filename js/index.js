import { districtLayer, addOrientation } from './map-layers.js';
import { loadData } from './data.js';
import { COUNT_BINS as countBins, CHANGE_BINS as changeBins, countRadius } from './cartography.js';
import { RATE_METRIC, RATE_BINS, RATE_NOTE, GEOGRAPHY_NOTE } from './evidence.js';
import { SlideDeck } from './slidedeck.js';
import { AtlasExplorer } from './atlas-explorer.js';
import { CollegeExplorer, collegeColor, campusCard, metrics, typeColors, campusLayer, renderCampusTable, campusDistribution } from './colleges.js';

const status = document.querySelector('#map-status');
const interactiveAtlas = new AtlasExplorer();
const format = (value) => value === null ? 'Unavailable' : value.toLocaleString('en-US');
const binsFor = (slide) => slide.dataset.metric === RATE_METRIC ? RATE_BINS : slide.id === 'change' ? changeBins : countBins;
const colorFor = (value, bins) => value === null ? '#cccccc' : bins.find((bin) => value < bin.max).color;

function renderLegend(slide) {
  const isCollege = slide.dataset.layer === 'colleges';
  const metric = document.querySelector('#campus-metric').value;
  document.querySelector('#map-title').textContent = `${isCollege ? 'CUNY institution locations' : 'NYC school districts'} / ${slide.dataset.year}`;
  document.querySelector('#legend-title').textContent = isCollege ? (metric === 'institution_type' ? 'CUNY institution type' : metrics[metric].title) : slide.dataset.metric === RATE_METRIC ? 'AFC estimated share · 2023–24 (ranges)' : slide.id === 'change' ? 'Change in reported count (%)' : `Reported students · ${slide.dataset.year}`;
  const items = document.querySelector('#legend-items');
  items.replaceChildren();
  if (!isCollege && slide.dataset.metric.startsWith('homeless_')) {
    const note = document.createElement('p'); note.className = 'size-key'; note.textContent = 'Circle area is proportional to reported count, with the same size scale in every year. Anchors are inside reference districts, not student locations.'; items.append(note);
    for (const count of [2000, 8000]) { const key = document.createElement('div'); key.className = 'count-size-key'; const circle = document.createElement('span'); circle.className = 'count-size-swatch'; const diameter = 2 * countRadius(count); circle.style.width = `${diameter}px`; circle.style.height = `${diameter}px`; key.append(circle, document.createTextNode(count.toLocaleString('en-US'))); items.append(key); }
  }
  document.querySelector('.legend small').textContent = isCollege ? 'Campus locations · not student residences' : slide.dataset.metric === RATE_METRIC ? 'AFC published analysis · current reference boundaries' : 'Reporting LEAs · not residence locations';
  document.querySelector('#map-method-text').textContent = isCollege ? 'Campus locations, not residences. Spring 2024 degree-seeking undergraduate surveys ask about the past 12 months. 19 campuses have central-dashboard results; seven institution records have no separate undergraduate result. Survey differences are descriptive, not significance tests.' : slide.dataset.metric === RATE_METRIC ? `${RATE_NOTE} DCP 2026 reference boundaries; historical consistency not established.` : GEOGRAPHY_NOTE;
  if (isCollege && metric === 'housing_insecurity_pct') { const note = document.createElement('p'); note.className = 'size-key'; note.textContent = document.querySelector('#campus-color-mode').value === 'continuous' ? 'Continuous color, fixed 0–100%. Display ranges are descriptive, not risk thresholds.' : 'Four descriptive display ranges, not risk thresholds.'; items.append(note); }
  const entries = isCollege ? metric === 'institution_type' ? Object.entries(typeColors).map(([label, color]) => ({ label, color })) : [...metrics[metric].bins, { color: '#89918e', label: 'No separate survey result' }] : [...binsFor(slide), { color: '#cccccc', label: 'Unavailable' }];
  for (const bin of entries) {
    const row = document.createElement('div');
    row.className = 'legend-row';
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = bin.color;
    swatch.setAttribute('aria-hidden', 'true');
    row.append(swatch, document.createTextNode(bin.label));
    if (isCollege || !slide.dataset.metric.startsWith('homeless_')) items.append(row);
  }
}

function popup(properties) {
  const container = document.createElement('div');
  const heading = document.createElement('h3');
  heading.textContent = `District ${properties.district}`;
  container.append(heading);
  for (const [label, value] of [
    ['County', properties.county],
    ['2021–22', format(properties.homeless_2021_22)],
    ['2022–23', format(properties.homeless_2022_23)],
    ['2023–24', format(properties.homeless_2023_24)],
    ['Count change', properties.change_pct_2021_22_to_2023_24 === null ? 'Unavailable' : `${properties.change_pct_2021_22_to_2023_24}%`],
  ]) {
    const line = document.createElement('p');
    line.textContent = `${label}: ${value}`;
    container.append(line);
  }
  const method = document.createElement('p');
  method.textContent = `${GEOGRAPHY_NOTE} AFC estimated share in 2023–24: ${properties.afc_rate_band_label}. ${RATE_NOTE}`;
  container.append(method);
  const source = document.createElement('a'); source.href = properties.afc_rate_source; source.textContent = 'AFC rate methods ↗'; container.append(source);
  container.append(exploreButton('districts', properties.district));
  return container;
}

function exploreButton(layer, selected) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'popup-explore';
  button.textContent = 'Explore and compare ↗';
  button.addEventListener('click', () => document.dispatchEvent(new CustomEvent('atlasexplore', { detail: { layer, selected } })));
  return button;
}

function renderTable(collection) {
  const body = document.querySelector('#district-table');
  if (body.children.length) return;
  for (const { properties: p } of collection.features) {
    const row = document.createElement('tr');
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = String(p.district);
    row.append(heading);
    for (const year of ['2021_22', '2022_23', '2023_24']) {
      const cell = document.createElement('td');
      cell.textContent = format(p[`homeless_${year}`]);
      row.append(cell);
    }
    body.append(row);
  }
}

function renderCharts(collection) {
  for (const figure of document.querySelectorAll('[data-chart-district]')) {
    const container = figure.querySelector('.chart-bars');
    if (container.children.length) continue;
    const p = collection.features.find((feature) => feature.properties.district === Number(figure.dataset.chartDistrict)).properties;
    const years = ['2021_22', '2022_23', '2023_24'];
    const maximum = Math.max(...years.map((year) => p[`homeless_${year}`] ?? 0));
    for (const year of years) {
      const value = p[`homeless_${year}`];
      const row = document.createElement('div');
      row.className = 'chart-row';
      const label = document.createElement('span');
      label.textContent = year.replace('_', '–');
      const track = document.createElement('span');
      track.className = 'chart-track';
      const bar = document.createElement('span');
      bar.style.width = `${maximum ? (value ?? 0) / maximum * 100 : 0}%`;
      track.setAttribute('aria-hidden', 'true');
      track.append(bar);
      const number = document.createElement('strong');
      number.textContent = format(value);
      row.append(label, track, number);
      container.append(row);
    }
  }
}

function updateChapter(slide) {
  const slides = [...document.querySelectorAll('.slide')];
  const index = slides.indexOf(slide);
  document.querySelector('#map-folio').textContent = `PLATE ${String(index).padStart(2, '0')} / ${String(slides.length - 1).padStart(2, '0')}`;
  document.querySelector('#story-position').textContent = `${index + 1} / ${slides.length}`;
  document.querySelector('#story-previous').disabled = index === 0;
  document.querySelector('#story-next').disabled = index === slides.length - 1;
  for (const link of document.querySelectorAll('.chapter-nav a')) {
    if (link.hash === `#${slide.id}`) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  }
}

function updateProgress() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector('#reading-progress').style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
}

if (typeof L === 'undefined') {
  status.textContent = 'The map library could not load. You can still read the story and download the CSV in Sources.';
  fetch('data/nyc-student-homelessness-districts.geojson').then((response) => response.json()).then((collection) => { renderTable(collection); renderCharts(collection); }).catch(() => {});
} else {
  const map = L.map('map', { scrollWheelZoom: false }).setView([40.72, -73.94], 10);
  addOrientation(map);
  map.attributionControl.addAttribution('Boundaries: <a href="https://data.cityofnewyork.us/City-Government/School-Districts/8ugf-3d8u">NYC DCP</a>');
  // A quiet coordinate grid keeps the actual district geometry at the center.
  // No decorative paths represent student journeys or inferred movement.
  for (let latitude = 40.45; latitude <= 40.95; latitude += 0.05) {
    L.polyline([[latitude, -74.3], [latitude, -73.65]], { color: '#738580', weight: 0.5, opacity: 0.16, interactive: false }).addTo(map);
  }
  for (let longitude = -74.3; longitude <= -73.65; longitude += 0.05) {
    L.polyline([[40.45, longitude], [40.95, longitude]], { color: '#738580', weight: 0.5, opacity: 0.16, interactive: false }).addTo(map);
  }
  L.control.scale({ imperial: false, position: 'bottomright', maxWidth: 90 }).addTo(map);
  const slides = document.querySelectorAll('.slide');
  const slideOptions = {};
  let activeSlide = null;
  let deck;
  let districtBackdrop;
  let districtData;
  const explorer = new CollegeExplorer(map, (collection, metric) => {
    if (!activeSlide || activeSlide.dataset.layer !== 'colleges') return;
    deck.updateDataLayer(collection, slideOptions[activeSlide.id]);
    renderLegend(activeSlide);
  });
  for (const slide of slides) {
    if (slide.dataset.layer === 'colleges') {
      slideOptions[slide.id] = {
        createLayer: (collection) => campusLayer(collection, {
          metric: explorer.metric, mode: document.querySelector('#campus-color-mode').value,
          onSelect: (feature) => explorer.select(feature, false),
        }),
      };
      continue;
    }
    slideOptions[slide.id] = {
      style: (feature) => ({
        color: slide.dataset.district === String(feature.properties.district) ? '#643225' : '#f9f3e7',
        weight: slide.dataset.district === String(feature.properties.district) ? 3 : 1,
        fillColor: colorFor(feature.properties[slide.dataset.metric], binsFor(slide)),
        fillOpacity: slide.dataset.district && slide.dataset.district !== String(feature.properties.district) ? 0.2 : 0.82,
      }),
      onEachFeature: (feature, layer) => {
        layer.on('mouseover', () => layer.setStyle({ weight: 2.5, color: '#382d27', fillOpacity: 0.95 }));
        layer.on('mouseout', () => layer.setStyle(slideOptions[slide.id].style(feature)));
        layer.bindTooltip(`District ${feature.properties.district}: ${slide.dataset.metric === RATE_METRIC ? feature.properties.afc_rate_band_label + ' (AFC estimate)' : format(feature.properties[slide.dataset.metric]) + (slide.id === 'change' ? '% count change' : ' identified by LEA')}`);
        layer.bindPopup(popup(feature.properties));
      },
    };
  }
  for (const slide of slides) {
    if (slide.dataset.layer === 'colleges') continue;
    const options = slideOptions[slide.id];
    options.createLayer = (collection) => districtLayer(collection, options, slide.dataset.metric);
  }
  deck = new SlideDeck(document.querySelector('.slide-section'), slides, map, slideOptions);
  document.addEventListener('storyslide', ({ detail }) => {
    activeSlide = detail.slide;
    if (activeSlide.id === 'baseline') {
      document.querySelector('#district-year').value = '2021_22';
      document.querySelector('#year-explorer-note').textContent = 'The chapter begins in 2021–22. Changing the year updates the map only.';
    }
    if (activeSlide.dataset.layer === 'colleges') {
      if (districtBackdrop) { districtBackdrop.addTo(map); districtBackdrop.bringToBack(); }
      renderCampusTable(detail.collection);
      if (!explorer.collection) explorer.setData(detail.collection);
      else explorer.apply();
      if (activeSlide.dataset.campus) {
        const selected = detail.collection.features.find((feature) => feature.properties.campus_id === Number(activeSlide.dataset.campus));
        // The case-study chapter always shows its featured campus, independently of explorer filters.
        deck.updateDataLayer(detail.collection, slideOptions[activeSlide.id]);
        explorer.select(selected, false);
      }
    } else {
      districtData = detail.collection;
      if (!districtBackdrop) districtBackdrop = L.geoJSON(detail.collection, { interactive: false, style: { color: '#8c9b8d', weight: 0.6, fillColor: '#d2cbbd', fillOpacity: 0.3 } });
      districtBackdrop.remove();
      renderTable(detail.collection);
      renderCharts(detail.collection);
    }
    renderLegend(activeSlide);
    updateChapter(activeSlide);
  });
  document.querySelector('#district-year').addEventListener('change', (event) => {
    if (!districtData) return;
    const year = event.target.value;
    const slide = document.createElement('article');
    slide.id = 'year-exploration';
    slide.dataset.year = year.replace('_', '–');
    slide.dataset.metric = `homeless_${year}`;
    const options = {
      style: (feature) => ({ color: '#f9f3e7', weight: 1, fillColor: colorFor(feature.properties[slide.dataset.metric], countBins), fillOpacity: 0.82 }),
      onEachFeature: (feature, layer) => { layer.bindTooltip(`District ${feature.properties.district}: ${format(feature.properties[slide.dataset.metric])} students`); layer.bindPopup(popup(feature.properties)); },
    };
    options.createLayer = (collection) => districtLayer(collection, options, slide.dataset.metric);
    deck.updateDataLayer(districtData, options);
    renderLegend(slide);
    document.querySelector('#year-explorer-note').textContent = `Exploring ${slide.dataset.year} on the map. Chapter text remains the 2021–22 baseline. Scrolling to another chapter restores its map.`;
  });
  document.querySelector('#story-map-reset').addEventListener('click', () => deck.syncMapToCurrentSlide());
  for (const [id, delta] of [['story-previous', -1], ['story-next', 1]]) {
    document.querySelector(`#${id}`).addEventListener('click', () => {
      const index = Math.min(slides.length - 1, Math.max(0, deck.currentSlideIndex + delta));
      slides[index].scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  }
  document.querySelector('#show-published-rates').addEventListener('click', () => {
    const slide = document.querySelector('#consequences');
    slide.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  let scheduled = false;
  document.addEventListener('scroll', () => {
    updateProgress();
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      deck.calcCurrentSlideIndex();
      scheduled = false;
    });
  }, { passive: true });
  window.addEventListener('resize', () => {
    map.invalidateSize();
    deck.calcCurrentSlideIndex();
    deck.syncMapToCurrentSlide();
  });
  loadData('cuny-colleges.geojson').then(renderCampusTable).catch(() => { document.querySelector('#campus-table-status').textContent = 'Campus table could not load. Use the campus CSV link below.'; });
  deck.calcCurrentSlideIndex();
  updateProgress();
}
