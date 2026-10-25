import { RATE_METRIC, RATE_BINS, RATE_NOTE, GEOGRAPHY_NOTE } from './evidence.js';
import { campusCard, collegeColor, metrics, typeColors, missingCollegeValue } from './colleges.js';

const YEARS = ['2021_22', '2022_23', '2023_24'];
const BOROUGHS = { 'NEW YORK': 'Manhattan', 'BRONX': 'Bronx', 'KINGS': 'Brooklyn', 'QUEENS': 'Queens', 'RICHMOND': 'Staten Island' };
const COUNT_BINS = [
  { max: 2000, color: '#eadfca', label: 'Under 2,000' },
  { max: 4000, color: '#d9bd91', label: '2,000–3,999' },
  { max: 6000, color: '#c08b61', label: '4,000–5,999' },
  { max: 8000, color: '#a65c3e', label: '6,000–7,999' },
  { max: Infinity, color: '#743b30', label: '8,000+' },
];
const CHANGE_BINS = [
  { max: 0, color: '#547f8b', label: 'Decrease' },
  { max: 25, color: '#eee4cb', label: '0–<25%' },
  { max: 50, color: '#dfbb8d', label: '25–<50%' },
  { max: 100, color: '#c77b50', label: '50–<100%' },
  { max: Infinity, color: '#9b402e', label: '100%+' },
];
const fmt = (value) => value === null || value === undefined ? 'Unavailable' : Number(value).toLocaleString('en-US');
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const download = (rows, filename) => {
  if (!rows.length) return;
  const fields = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [fields, ...rows.map((row) => fields.map((field) => row[field]))].map((row) => row.map(escape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = element('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** A separate exploration workspace keeps the scrolling narrative readable. */
export class AtlasExplorer {
  constructor() {
    this.dialog = document.querySelector('#explore-dialog');
    this.data = null;
    this.map = null;
    this.geoLayer = null;
    this.pins = [];
    this.selected = null;
    this.activeBin = null;
    this.timer = null;
    this.layer = 'districts';
    this.previousFocus = null;
    this.loading = null;
    this.colors = ['#a45432', '#267b91', '#77558e'];
    this.controls = Object.fromEntries(['search', 'borough', 'metric', 'year', 'sort', 'type', 'verified', 'support', 'labels', 'evidence-status'].map((name) => [name, document.querySelector(`#atlas-${name}`)]));
    document.querySelectorAll('[data-open-explorer]').forEach((button) => button.addEventListener('click', () => this.open()));
    document.querySelector('#atlas-close').addEventListener('click', () => this.dialog.close());
    this.dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { event.preventDefault(); this.dialog.close(); }
    }, true);
    this.dialog.addEventListener('close', () => { this.pause(); document.body.classList.remove('explorer-open'); this.previousFocus?.focus(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.pause(); });
    document.addEventListener('atlasexplore', ({ detail }) => this.open(detail));
    for (const tab of document.querySelectorAll('[data-atlas-layer]')) {
      tab.addEventListener('click', () => this.switchLayer(tab.dataset.atlasLayer));
    }
    for (const [name, control] of Object.entries(this.controls)) {
      control.addEventListener('input', () => {
        if (['metric', 'year'].includes(name)) this.activeBin = null;
        if (name === 'year') this.pause();
        if (name !== 'labels' && this.selected) this.selected = null;
        this.render();
        if (['search', 'borough', 'type', 'verified', 'support', 'evidence-status'].includes(name)) this.fit();
      });
    }
    document.querySelector('#atlas-play').addEventListener('click', () => this.timer ? this.pause() : this.play());
    document.querySelector('#atlas-reset').addEventListener('click', () => this.reset());
    document.querySelector('#atlas-fit').addEventListener('click', () => this.fit());
    document.querySelector('#atlas-expand-map').addEventListener('click', () => {
      const expanded = this.dialog.classList.toggle('is-map-expanded');
      const button = document.querySelector('#atlas-expand-map');
      button.setAttribute('aria-pressed', String(expanded));
      button.textContent = expanded ? 'More filters' : 'Larger map';
      requestAnimationFrame(() => { this.map?.invalidateSize(); this.fit(); });
    });
    document.querySelector('#atlas-export').addEventListener('click', () => {
      download(this.filtered.map((feature) => ({ ...feature.properties, map_measure: this.metric(), map_value: this.metric() === RATE_METRIC ? feature.properties.afc_rate_band_label : this.value(feature) })), `nyc-${this.layer}-filtered.csv`);
    });
    document.querySelector('#atlas-export-pins').addEventListener('click', () => {
      download(this.features().filter((feature) => this.pins.includes(feature.id)).map((feature) => feature.properties), `nyc-${this.layer}-comparison.csv`);
    });
    document.querySelector('#atlas-share').addEventListener('click', () => this.share());
    document.querySelector('#atlas-share-url').addEventListener('focus', (event) => event.target.select());
    document.querySelector('#atlas-clear-pins').addEventListener('click', () => { this.pins = []; this.render(); });
    const params = new URLSearchParams(location.search);
    if (params.get('explore') === '1') this.open({ shared: params });
  }

  async open(options = {}) {
    if (!this.dialog.open) {
      this.previousFocus = document.activeElement;
      this.dialog.showModal();
      document.body.classList.add('explorer-open');
    }
    const message = document.querySelector('#atlas-message');
    message.textContent = 'Loading the exploration workspace…';
    try {
      if (!this.loading) this.loading = Promise.all(['nyc-student-homelessness-districts.geojson', 'cuny-colleges.geojson'].map(async (filename) => {
        const response = await fetch(`data/${filename}`);
        if (!response.ok) throw new Error('Data unavailable');
        return response.json();
      })).catch((error) => { this.loading = null; throw error; });
      this.data = await this.loading;
      if (!this.dialog.open) return;
      if (!this.map) {
        this.map = L.map('explore-map', { scrollWheelZoom: false, zoomSnap: 0.25 }).setView([40.72, -73.94], 10);
        this.map.attributionControl.addAttribution('Boundaries: NYC DCP · Campus locations: NY Open Data');
      }
      if (options.shared) this.restore(options.shared);
      else if (options.layer) {
        if (this.layer !== options.layer) this.switchLayer(options.layer, false);
        if (options.selected) {
          this.controls.search.value = ''; this.controls.borough.value = ''; this.controls.type.value = ''; this.controls['evidence-status'].value = '';
          this.controls.verified.checked = false; this.controls.support.checked = false; this.activeBin = null;
        }
        this.selected = options.selected ?? null;
      }
      this.updateTabs();
      this.map.invalidateSize();
      this.render();
      message.textContent = '';
      if (this.selected) this.select(this.selected, true);
      else this.fit();
    } catch (error) {
      message.textContent = 'The explorer could not load. Close it to continue reading, or try again. Source CSV files remain available in the story.';
    }
  }

  features() {
    return this.data?.[this.layer === 'districts' ? 0 : 1].features ?? [];
  }

  metric() {
    return this.controls.metric.value;
  }

  value(feature) {
    return feature.properties[this.metric()] ?? null;
  }

  bins() {
    const metric = this.metric();
    if (metric === 'institution_type') return Object.entries(typeColors).map(([label, color]) => ({ label, color }));
    if (this.layer === 'colleges') return metrics[metric].bins;
    return metric === RATE_METRIC ? RATE_BINS : metric === 'change_pct_2021_22_to_2023_24' ? CHANGE_BINS : COUNT_BINS;
  }

  color(feature) {
    if (this.layer === 'colleges') return collegeColor(feature.properties, this.metric());
    const value = this.value(feature);
    return value === null ? '#89918e' : this.bins().find((bin) => value < bin.max).color;
  }

  displayValue(feature) {
    if (this.metric() === RATE_METRIC) return `${feature.properties.afc_rate_band_label} (AFC estimate)`;
    const value = this.value(feature);
    return value === null ? (this.layer === 'colleges' ? missingCollegeValue(feature.properties, this.metric()) : 'Unavailable') : typeof value === 'number' ? `${fmt(value)}${this.metric().includes('pct') ? '%' : ' identified by LEA'}` : value;
  }

  binIndex(feature) {
    const value = this.value(feature);
    if (value === null) return -1;
    if (this.metric() === 'institution_type') return this.bins().findIndex((bin) => bin.label === value);
    return this.bins().findIndex((bin) => value < bin.max);
  }

  name(feature) {
    return this.layer === 'colleges' ? feature.properties.name : `District ${feature.properties.district}`;
  }

  borough(feature) {
    return this.layer === 'colleges' ? feature.properties.borough : BOROUGHS[feature.properties.county];
  }

  updateTabs() {
    const college = this.layer === 'colleges';
    for (const tab of document.querySelectorAll('[data-atlas-layer]')) tab.setAttribute('aria-pressed', String(tab.dataset.atlasLayer === this.layer));
    document.querySelector('#atlas-timeline').hidden = college;
    document.querySelector('#atlas-college-options').hidden = !college;
    document.querySelector('#atlas-scope').textContent = college ? '26 CUNY institution records. 19 campus survey profiles; 7 institution records have no separate result in this undergraduate export. Campus points are not student residences.' : '32 reporting LEAs; counts can duplicate students across agencies. Current reference boundaries, not residences. Published AFC rate ranges use a separate charter-inclusive analysis.';
    const old = this.controls.metric.value;
    const choices = college
      ? [
          ['homelessness_pct', 'Homelessness · 2024 (%)'], ['housing_insecurity_pct', 'Housing insecurity · 2024 (%)'],
          ['rent_increase_difficulty_pct', 'Rent increase difficulty · 2024 (%)'], ['institution_type', 'Institution type'],
        ]
      : [[`homeless_${YEARS[Number(this.controls.year.value)]}`, 'Reported count'], ['change_pct_2021_22_to_2023_24', 'Count change · 2021–24 (%)'], [RATE_METRIC, 'AFC share · 2023–24 (ranges)']];
    this.controls.metric.replaceChildren(...choices.map(([value, label]) => { const option = element('option', '', label); option.value = value; return option; }));
    if (choices.some(([value]) => value === old)) this.controls.metric.value = old;
    document.querySelector('#atlas-time-label').textContent = YEARS[Number(this.controls.year.value)].replace('_', '–');
  }

  switchLayer(layer, render = true) {
    this.pause(); this.layer = layer; this.pins = []; this.selected = null; this.activeBin = null;
    this.controls.search.value = ''; this.controls.borough.value = '';
    this.controls.verified.checked = false; this.controls.support.checked = false; this.controls.type.value = ''; this.controls['evidence-status'].value = '';
    this.updateTabs();
    if (render && this.data) { this.render(); this.fit(); }
  }

  reset() {
    this.pause(); this.selected = null; this.activeBin = null; this.pins = [];
    this.controls.search.value = ''; this.controls.borough.value = ''; this.controls.sort.value = 'name';
    this.controls.type.value = ''; this.controls['evidence-status'].value = ''; this.controls.verified.checked = false; this.controls.support.checked = false;
    this.controls.labels.checked = false; this.controls.year.value = '2';
    this.controls.metric.value = this.layer === 'colleges' ? 'homelessness_pct' : 'homeless_2023_24';
    this.updateTabs(); this.render(); this.fit();
    document.querySelector('#atlas-share-url').hidden = true;
  }

  render() {
    if (!this.data) return;
    if (this.layer === 'districts') {
      if (this.metric().startsWith('homeless_')) this.controls.metric.options[0].value = `homeless_${YEARS[Number(this.controls.year.value)]}`;
      document.querySelector('#atlas-time-label').textContent = YEARS[Number(this.controls.year.value)].replace('_', '–');
      this.controls.year.setAttribute('aria-valuetext', YEARS[Number(this.controls.year.value)].replace('_', '–'));
      const growth = this.metric().startsWith('change_') || this.metric() === RATE_METRIC;
      this.controls.year.disabled = growth;
      document.querySelector('#atlas-play').disabled = growth;
      if (growth) this.pause();
      if (this.metric() === RATE_METRIC) document.querySelector('#atlas-time-label').textContent = '2023–24 · fixed source';
    }
    const search = this.controls.search.value.trim().toLowerCase();
    this.filtered = this.features().filter((feature) => {
      const p = feature.properties;
      return (!search || `${this.name(feature)} ${this.borough(feature)} ${p.address ?? ''} ${p.lea_name ?? ''}`.toLowerCase().includes(search))
        && (!this.controls.borough.value || this.borough(feature) === this.controls.borough.value)
        && (this.layer !== 'colleges' || ((!this.controls.type.value || p.institution_type === this.controls.type.value)
          && (!this.controls.verified.checked || (this.metric() === 'institution_type' ? p.survey_year !== null : this.value(feature) !== null))
          && (!this.controls.support.checked || p.support_url)
          && (!this.controls['evidence-status'].value || p.evidence_status === this.controls['evidence-status'].value)))
        && (this.activeBin === null || this.binIndex(feature) === this.activeBin);
    });
    this.filtered.sort((a, b) => {
      if (this.controls.sort.value === 'value' && this.metric() !== 'institution_type') return (this.value(b) ?? -Infinity) - (this.value(a) ?? -Infinity) || a.id - b.id;
      return this.layer === 'districts' ? a.id - b.id : this.name(a).localeCompare(this.name(b));
    });
    if (this.selected && !this.filtered.some((feature) => feature.id === this.selected)) this.selected = null;
    document.querySelector('#atlas-method-note').textContent = this.layer === 'colleges' ? 'Past-year undergraduate survey answers, not school classifications. Review statuses distinguish checked sources from unreviewed campuses; missing figures are never zeros.' : this.metric() === RATE_METRIC ? RATE_NOTE : GEOGRAPHY_NOTE;
    this.renderMap(); this.renderLegend(); this.renderList(); this.renderDetail(); this.renderPins();
    document.querySelector('#atlas-results').textContent = `${this.filtered.length} of ${this.features().length} ${this.layer === 'colleges' ? 'institutions' : 'districts'} shown. ${this.pins.length} pinned for comparison.`;
    document.querySelector('#atlas-export').disabled = !this.filtered.length;
    document.querySelector('#atlas-fit').disabled = !this.filtered.length;
  }

  style(feature) {
    const pin = this.pins.indexOf(feature.id);
    return { color: this.selected === feature.id ? '#152f36' : pin >= 0 ? this.colors[pin] : '#f6f0e5',
      weight: this.selected === feature.id ? 3 : pin >= 0 ? 2.5 : 1,
      fillColor: this.color(feature), fillOpacity: this.layer === 'colleges' ? 0.95 : 0.82 };
  }

  renderMap() {
    this.geoLayer?.remove();
    if (this.layer === 'colleges' && !this.backdrop) this.backdrop = L.geoJSON(this.data[0], { interactive: false, style: { color: '#94a18f', weight: 0.6, fillColor: '#d7d0bf', fillOpacity: 0.3 } });
    if (this.layer === 'colleges') { this.backdrop.addTo(this.map); this.backdrop.bringToBack(); } else this.backdrop?.remove();
    this.geoLayer = L.geoJSON({ type: 'FeatureCollection', features: this.filtered }, {
      style: (feature) => this.style(feature),
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, { ...this.style(feature), radius: this.selected === feature.id ? 11 : 7 }),
      onEachFeature: (feature, layer) => {
        const value = this.value(feature);
        const text = `${this.name(feature)} · ${this.displayValue(feature)}`;
        const label = this.controls.labels.checked && this.layer === 'districts' ? `D${feature.id}` : text;
        layer.bindTooltip(label, { permanent: this.controls.labels.checked, direction: 'top', className: 'atlas-feature-label' });
        layer.on('click', () => this.select(feature.id));
        layer.on('mouseover', () => layer.setStyle({ weight: 3, color: '#152f36' }));
        layer.on('mouseout', () => layer.setStyle(this.style(feature)));
      },
    }).addTo(this.map);
    document.querySelector('#atlas-map-heading').textContent = this.layer === 'colleges' ? 'CUNY campus evidence · spring 2024' : this.metric() === RATE_METRIC ? 'AFC estimated share · 2023–24 (published ranges)' : this.metric().startsWith('change_') ? 'Change in counts · 2021–22 to 2023–24' : `Reported students · ${YEARS[Number(this.controls.year.value)].replace('_', '–')}`;
  }

  renderLegend() {
    const container = document.querySelector('#atlas-legend'); container.replaceChildren();
    const bins = [...this.bins(), { color: '#89918e', label: this.layer === 'colleges' ? 'No separate result' : 'Unavailable' }];
    bins.forEach((bin, index) => {
      const binId = index === bins.length - 1 ? -1 : index;
      const button = element('button', 'atlas-legend-button'); button.type = 'button';
      button.setAttribute('aria-pressed', String(this.activeBin === binId));
      const swatch = element('span', 'swatch'); swatch.style.backgroundColor = bin.color;
      button.append(swatch, document.createTextNode(bin.label));
      button.addEventListener('click', () => { this.activeBin = this.activeBin === binId ? null : binId; this.render(); this.fit(); });
      container.append(button);
    });
    if (this.activeBin !== null) {
      const clear = element('button', 'atlas-legend-button', 'Show all colors ×'); clear.type = 'button';
      clear.addEventListener('click', () => { this.activeBin = null; this.render(); this.fit(); }); container.append(clear);
    }
  }

  renderList() {
    const container = document.querySelector('#atlas-list'); container.replaceChildren();
    for (const feature of this.filtered) {
      const row = element('div', 'atlas-result');
      row.dataset.featureId = String(feature.id);
      row.classList.toggle('is-selected', feature.id === this.selected);
      const select = element('button', 'atlas-result-select'); select.type = 'button';
      select.setAttribute('aria-pressed', String(feature.id === this.selected));
      const dot = element('span', 'campus-dot'); dot.style.backgroundColor = this.color(feature); dot.setAttribute('aria-hidden', 'true');
      const text = element('span', '', this.name(feature));
      const value = this.value(feature);
      const description = element('small', '', `${this.borough(feature)} · ${this.displayValue(feature)}`);
      text.append(description); select.append(dot, text);
      select.addEventListener('click', () => this.select(feature.id, true));
      const pin = element('button', 'atlas-pin', this.pins.includes(feature.id) ? 'Pinned ✓' : '+ Compare'); pin.type = 'button';
      pin.setAttribute('aria-label', `${this.pins.includes(feature.id) ? 'Unpin' : 'Compare'} ${this.name(feature)}`);
      pin.setAttribute('aria-pressed', String(this.pins.includes(feature.id)));
      pin.addEventListener('click', () => this.pin(feature.id));
      row.append(select, pin); container.append(row);
    }
    if (!this.filtered.length) container.append(element('p', '', 'No matches. Clear filters or select “Reset exploration.”'));
  }

  select(id, move = false) {
    this.selected = id; this.renderMap(); this.renderList(); this.renderDetail();
    if (move) {
      document.querySelector(`[data-feature-id="${id}"] .atlas-result-select`)?.focus({ preventScroll: true });
      const layers = this.geoLayer.getLayers().filter((layer) => layer.feature.id === id);
      if (layers.length) this.map.fitBounds(L.featureGroup(layers).getBounds(), { padding: [40, 40], maxZoom: 13, animate: !matchMedia('(prefers-reduced-motion: reduce)').matches });
    }
  }

  pin(id) {
    if (this.pins.includes(id)) this.pins = this.pins.filter((value) => value !== id);
    else if (this.pins.length < 3) this.pins.push(id);
    else { document.querySelector('#atlas-message').textContent = 'Compare up to three at a time. Unpin one to add another.'; return; }
    document.querySelector('#atlas-message').textContent = '';
    this.render();
    const button = document.querySelector(`[data-feature-id="${id}"] .atlas-pin`);
    button?.focus({ preventScroll: true });
  }

  renderDetail() {
    const container = document.querySelector('#atlas-selection'); container.replaceChildren();
    const feature = this.features().find((item) => item.id === this.selected);
    if (!feature) { container.append(element('p', '', 'Select a map feature or a result to inspect its evidence. Pin up to three to compare.')); return; }
    if (this.layer === 'colleges') container.append(campusCard(feature.properties));
    else {
      const p = feature.properties;
      container.append(element('h3', '', `${this.name(feature)} · ${this.borough(feature)}`));
      const rows = this.districtBars(feature, Math.max(...YEARS.map((year) => p[`homeless_${year}`] ?? 0)), '#a45432');
      container.append(element('p', 'atlas-small', `${GEOGRAPHY_NOTE} AFC estimated share: ${p.afc_rate_band_label}. ${RATE_NOTE}`));
      container.append(rows, element('p', 'atlas-small', `${fmt(p.change_count_2021_22_to_2023_24)} more reported students; ${fmt(p.change_pct_2021_22_to_2023_24)}% change from 2021–22 to 2023–24. This is not an enrollment rate.`));
    }
  }

  districtBars(feature, maximum, color) {
    const container = element('div', 'atlas-series');
    for (const year of YEARS) {
      const value = feature.properties[`homeless_${year}`];
      const row = element('div', 'chart-row');
      const track = element('span', 'chart-track'); track.setAttribute('aria-hidden', 'true');
      const bar = element('span'); bar.style.width = `${maximum ? (value ?? 0) / maximum * 100 : 0}%`; bar.style.backgroundColor = color; track.append(bar);
      row.append(element('span', '', year.replace('_', '–')), track, element('strong', '', fmt(value))); container.append(row);
    }
    return container;
  }

  renderPins() {
    const container = document.querySelector('#atlas-comparison'); container.replaceChildren();
    const features = this.pins.map((id) => this.features().find((feature) => feature.id === id)).filter(Boolean);
    document.querySelector('#atlas-export-pins').disabled = !features.length;
    document.querySelector('#atlas-clear-pins').disabled = !features.length;
    if (!features.length) { container.append(element('p', 'atlas-small', 'Use “+ Compare” beside a result. Comparisons remain visible as you filter; switching between school districts and colleges clears them.')); return; }
    const maximum = Math.max(1, ...features.flatMap((feature) => YEARS.map((year) => feature.properties[`homeless_${year}`] ?? 0)));
    features.forEach((feature, index) => {
      const card = element('article', 'atlas-comparison-card'); card.style.borderTopColor = this.colors[index];
      card.append(element('h4', '', this.name(feature)));
      const unpin = element('button', 'atlas-unpin', 'Remove ×'); unpin.type = 'button'; unpin.setAttribute('aria-label', `Remove ${this.name(feature)} from comparison`); unpin.addEventListener('click', () => this.pin(feature.id));
      card.append(unpin);
      if (this.layer === 'districts') {
        if (this.metric() === RATE_METRIC) card.append(element('p', '', `AFC estimated share: ${feature.properties.afc_rate_band_label}`));
        card.append(this.districtBars(feature, maximum, this.colors[index]));
      } else {
        for (const [label, field] of [['Homelessness', 'homelessness_pct'], ['CUNY housing scale', 'housing_insecurity_pct'], ['Rent difficulty', 'rent_increase_difficulty_pct']]) card.append(element('p', '', `${label}: ${feature.properties[field] === null ? missingCollegeValue(feature.properties, field) : `${feature.properties[field]}%`}`));
        card.append(element('p', 'atlas-small', feature.properties.survey_year ? (feature.properties.sample_size === null ? 'Spring 2024 · item sample size not supplied here; no confidence interval calculated.' : `Spring 2024 · campus report n=${feature.properties.sample_size} total respondents · response ${feature.properties.response_rate_pct}%`) : 'No separate result in this undergraduate export.'));
        if (feature.properties.survey_source) { const a = element('a', '', 'Read survey ↗'); a.href = feature.properties.survey_source; card.append(a); }
      }
      container.append(card);
    });
    container.append(element('p', 'atlas-small', this.layer === 'districts' ? 'All district bars use the same zero baseline and scale. Counts may include students reported by more than one agency; do not add them into a unique student total.' : 'Overlapping measures must not be added. Small survey differences do not establish significant differences between campuses.'));
  }

  fit() {
    const bounds = this.geoLayer?.getBounds();
    if (bounds?.isValid()) {
      const mobile = matchMedia('(max-width: 760px)').matches;
      this.map.fitBounds(bounds, { paddingTopLeft: [25, mobile ? 55 : 75], paddingBottomRight: [25, mobile ? 115 : 130], maxZoom: 12, animate: false });
    }
  }

  play() {
    if (this.layer !== 'districts' || this.metric().startsWith('change_') || this.metric() === RATE_METRIC) return;
    document.querySelector('#atlas-play').textContent = 'Pause years'; document.querySelector('#atlas-play').setAttribute('aria-pressed', 'true');
    this.timer = setInterval(() => { this.controls.year.value = String((Number(this.controls.year.value) + 1) % 3); this.activeBin = null; this.render(); }, 1800);
  }

  pause() {
    clearInterval(this.timer); this.timer = null;
    document.querySelector('#atlas-play').textContent = 'Play years'; document.querySelector('#atlas-play').setAttribute('aria-pressed', 'false');
  }

  async share() {
    const url = new URL(location.href); const params = new URLSearchParams();
    params.set('explore', '1'); params.set('layer', this.layer); params.set('year', this.controls.year.value); params.set('metric', this.metric());
    for (const name of ['search', 'borough', 'sort', 'type', 'evidence-status']) if (this.controls[name].value) params.set(name, this.controls[name].value);
    for (const name of ['verified', 'support', 'labels']) if (this.controls[name].checked) params.set(name, '1');
    if (this.activeBin !== null) params.set('bin', String(this.activeBin));
    if (this.selected !== null) params.set('selected', String(this.selected));
    if (this.pins.length) params.set('pins', this.pins.join(','));
    url.search = params; url.hash = '';
    const input = document.querySelector('#atlas-share-url'); input.value = url.href; input.hidden = false;
    try { await navigator.clipboard.writeText(url.href); document.querySelector('#atlas-message').textContent = 'Exploration link copied. It preserves filters, year, selection, and comparisons.'; } catch (error) { input.focus(); input.select(); document.querySelector('#atlas-message').textContent = 'Select and copy this exploration link.'; }
  }

  restore(params) {
    this.layer = params.get('layer') === 'colleges' ? 'colleges' : 'districts';
    this.controls.year.value = ['0', '1', '2'].includes(params.get('year')) ? params.get('year') : '2';
    this.updateTabs();
    if ([...this.controls.metric.options].some((option) => option.value === params.get('metric'))) this.controls.metric.value = params.get('metric');
    for (const name of ['search', 'borough', 'sort', 'type', 'evidence-status']) {
      const control = this.controls[name]; const value = params.get(name) ?? '';
      if (name === 'search' || [...control.options].some((option) => option.value === value)) control.value = value;
    }
    for (const name of ['verified', 'support', 'labels']) this.controls[name].checked = params.get(name) === '1';
    const ids = new Set(this.features().map((feature) => feature.id));
    this.pins = [...new Set((params.get('pins') ?? '').split(',').map(Number).filter((id) => ids.has(id)))].slice(0, 3);
    this.selected = ids.has(Number(params.get('selected'))) ? Number(params.get('selected')) : null;
    const bin = Number(params.get('bin'));
    this.activeBin = params.has('bin') && Number.isInteger(bin) && bin >= -1 && bin < this.bins().length ? bin : null;
  }
}
