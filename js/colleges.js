import { evidenceStatuses } from './evidence.js';
export { typeColors, metrics } from './cartography.js';
import { typeColors, metrics } from './cartography.js';

export function collegeColor(properties, metric, mode = 'ranges') {
  if (metric === 'institution_type') return typeColors[properties.institution_type] || '#65766f';
  const value = properties[metric];
  if (value !== null && metric === 'housing_insecurity_pct' && mode === 'continuous') {
    const t = Math.max(0, Math.min(1, value / 100));
    return `rgb(${Math.round(242 - 161 * t)} ${Math.round(236 - 184 * t)} ${Math.round(248 - 140 * t)})`;
  }
  return value === null ? '#89918e' : metrics[metric].bins.find((bin) => value < bin.max).color;
}

export function missingCollegeValue(properties, metric) {
  return properties.evidence_status === 'outside_survey' ? 'No separate survey result' : metric === 'housing_insecurity_pct' ? 'Scale result unavailable' : 'Item result unavailable';
}

function line(parent, text) {
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  parent.append(paragraph);
}

export function campusCard(properties) {
  const card = document.createElement('div');
  const heading = document.createElement('h3');
  heading.textContent = properties.name;
  card.append(heading);
  line(card, `${properties.borough} · ${properties.institution_type}`);
  line(card, properties.address);
  line(card, `Evidence review: ${evidenceStatuses[properties.evidence_status] || 'Not yet checked'}. ${properties.review_note || ''}`);
  if (properties.survey_year) {
    for (const [label, field] of [['Homelessness', 'homelessness_pct'], ['CUNY housing scale', 'housing_insecurity_pct'], ['Rent increase difficulty', 'rent_increase_difficulty_pct'], ['Unable to pay / underpaid rent', 'underpaid_rent_pct']]) {
      line(card, `${label}: ${properties[field] === null ? missingCollegeValue(properties, field) : `${properties[field]}%`}`);
    }
    line(card, `Spring ${properties.survey_year} · past 12 months. ${properties.sample_size === null ? 'Campus total response information not included in this extract.' : `Campus report total respondents: ${properties.sample_size}; response rate: ${properties.response_rate_pct}%.`}`);
    line(card, `Question: “${properties.question_wording}” Reference period: ${properties.recall_period}. Population: ${properties.survey_population}.`);
    line(card, properties.weighting);
    line(card, properties.uncertainty_note);
    if (properties.housing_insecurity_definition) line(card, properties.housing_insecurity_definition);
    const source = document.createElement('a');
    source.href = properties.survey_source;
    source.textContent = `Survey source · ${properties.source_pages} ↗`;
    card.append(source);
  } else {
    line(card, 'This institution has no separate column in the checked 2024 undergraduate dashboard. A missing figure does not mean no students experience homelessness.');
  }
  if (!properties.survey_year && properties.review_source) {
    const reviewed = document.createElement('a'); reviewed.href = properties.review_source; reviewed.textContent = 'Reviewed campus source ↗'; card.append(reviewed);
  }
  if (properties.support_url) {
    const support = document.createElement('a');
    support.href = properties.support_url;
    support.className = 'support-link';
    support.textContent = `${properties.support_name} ↗`;
    card.append(support);
    line(card, 'Campus support information; eligibility, capacity, hours, and outcomes are not verified here.');
  }
  const website = document.createElement('a');
  website.href = properties.website;
  website.textContent = 'Institution website ↗';
  card.append(website);
  return card;
}

export class CollegeExplorer {
  constructor(map, onChange) {
    this.map = map;
    this.onChange = onChange;
    this.metric = 'homelessness_pct';
    this.collection = null;
    this.filtered = { type: 'FeatureCollection', features: [] };
    this.form = document.querySelector('#college-filters');
    this.form.addEventListener('submit', (event) => event.preventDefault());
    this.form.addEventListener('input', () => this.apply());
    this.form.addEventListener('reset', () => setTimeout(() => this.apply(), 0));
  }

  setData(collection) {
    this.collection = collection;
    this.apply();
  }

  select(feature, move = true) {
    document.querySelector('#campus-detail').replaceChildren(campusCard(feature.properties));
    if (move) {
      const [longitude, latitude] = feature.geometry.coordinates;
      this.map.flyTo([latitude, longitude], 12, { animate: !matchMedia('(prefers-reduced-motion: reduce)').matches });
      document.dispatchEvent(new CustomEvent('campusselect', { detail: feature }));
    }
  }

  apply() {
    if (!this.collection) return;
    this.metric = document.querySelector('#campus-metric').value;
    const search = document.querySelector('#campus-search').value.trim().toLowerCase();
    const borough = document.querySelector('#campus-borough').value;
    const verified = document.querySelector('#campus-verified').checked;
    const review = document.querySelector('#campus-evidence-status').value;
    this.filtered = { type: 'FeatureCollection', features: this.collection.features.filter(({ properties: p }) => {
      return (!review || p.evidence_status === review) && (!borough || p.borough === borough)
        && (!search || `${p.name} ${p.borough} ${p.address}`.toLowerCase().includes(search))
        && (!verified || (this.metric === 'institution_type' ? p.survey_year !== null : p[this.metric] !== null));
    }) };
    const known = this.collection.features.filter((feature) => this.metric === 'institution_type' ? feature.properties.survey_year !== null : feature.properties[this.metric] !== null).length;
    document.querySelector('#college-coverage').textContent = `${known} of ${this.collection.features.length} institution records have verified ${this.metric === 'institution_type' ? 'campus survey evidence' : 'values for this measure'}.`;
    document.querySelector('#campus-result-count').textContent = `${this.filtered.features.length} matching institutions. Select one to inspect its evidence.`;
    const list = document.querySelector('#campus-list');
    list.replaceChildren();
    for (const feature of this.filtered.features) {
      const button = document.createElement('button');
      button.type = 'button';
      const dot = document.createElement('span');
      dot.className = 'campus-dot';
      dot.style.backgroundColor = collegeColor(feature.properties, this.metric);
      dot.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span');
      name.textContent = feature.properties.name;
      const value = document.createElement('small');
      value.textContent = this.metric === 'institution_type' ? feature.properties.institution_type : feature.properties[this.metric] === null ? missingCollegeValue(feature.properties, this.metric) : `${feature.properties[this.metric]}%`;
      button.append(dot, name, value);
      button.addEventListener('click', () => this.select(feature));
      list.append(button);
    }
    if (!this.filtered.features.length) line(list, 'No institutions match. Clear the search or reset the filters.');
    document.querySelector('#campus-detail').replaceChildren();
    line(document.querySelector('#campus-detail'), 'Select a matching institution to inspect its source and methods.');
    document.querySelector('#campus-color-mode-label').hidden = this.metric !== 'housing_insecurity_pct';
    document.querySelector('#campus-distribution').replaceChildren(...(this.metric === 'institution_type' ? [] : [campusDistribution(this.filtered, this.metric, (feature) => this.select(feature))]));
    this.onChange(this.filtered, this.metric);
  }
}

/** Keep coincident official locations intact; disclose and select every record. */
export function campusLayer(collection, { metric, mode = 'ranges', onSelect, labels = false, selected = null, style = () => ({}) }) {
  const groups = new Map();
  for (const feature of collection.features) {
    const key = feature.geometry.coordinates.join(',');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(feature);
  }
  const layers = [...groups.values()].map((features) => {
    const feature = features.find((item) => item.id === selected) || features[0];
    const p = feature.properties;
    const marker = L.circleMarker([...feature.geometry.coordinates].reverse(), {
      radius: 9, color: '#384a4d', weight: 1.5,
      fillColor: p[metric] === null && metric !== 'institution_type' ? '#f6f0e5' : collegeColor(p, metric, mode),
      fillOpacity: 0.95, ...style(feature),
      ...(p[metric] === null && metric !== 'institution_type' ? { fillColor: '#f6f0e5', fillOpacity: 1 } : {}),
      ...(features.length > 1 ? { dashArray: '3 2', weight: 3 } : {}),
    });
    marker.feature = feature;
    marker.groupFeatures = features;
    marker.bindTooltip(features.length > 1 ? `${features.length} institutions at this official location — select to choose` : p.name,
      { permanent: labels, direction: 'top' });
    if (features.length > 1) {
      marker.bindPopup(() => {
        const panel = document.createElement('div');
        const heading = document.createElement('h3'); heading.textContent = `${features.length} institutions share this location`; panel.append(heading);
        line(panel, 'Coordinates are unchanged. Choose an institution to inspect its own evidence.');
        const detail = document.createElement('div');
        for (const item of features) {
          const button = document.createElement('button'); button.type = 'button'; button.className = 'shared-campus-choice'; button.textContent = item.properties.name;
          button.addEventListener('click', () => {
            onSelect(item);
            detail.replaceChildren(campusCard(item.properties));
          }); panel.append(button);
        }
        panel.append(detail); return panel;
      }, { maxWidth: 330 });
    } else {
      marker.bindPopup(() => campusCard(p), { maxWidth: 330 });
      marker.on('click', () => onSelect(feature));
    }
    return marker;
  });
  return L.featureGroup(layers);
}

export function renderCampusTable(collection) {
  const body = document.querySelector('#campus-table');
  if (!body) return;
  body.replaceChildren();
  for (const { properties: p } of [...collection.features].sort((a, b) => a.properties.name.localeCompare(b.properties.name))) {
    const row = document.createElement('tr');
    const title = document.createElement('th'); title.scope = 'row'; title.textContent = p.name; row.append(title);
    for (const field of ['borough', 'homelessness_pct', 'housing_insecurity_pct', 'rent_increase_difficulty_pct']) {
      const cell = document.createElement('td');
      cell.textContent = p[field] === null ? missingCollegeValue(p, field) : field === 'borough' ? p[field] : `${p[field]}%`;
      row.append(cell);
    }
    const cell = document.createElement('td'); const link = document.createElement('a');
    link.href = p.survey_source || p.review_source; link.textContent = p.survey_year ? '2024 source' : 'Coverage source'; cell.append(link); row.append(cell); body.append(row);
  }
}

/** A fixed 0–100% axis keeps published values comparable, with text alternatives. */
export function campusDistribution(collection, metric, onSelect) {
  const panel = document.createElement('div'); panel.className = 'campus-distribution';
  const description = document.createElement('p'); description.textContent = `${metrics[metric].title}. Alphabetical campus order; fixed 0–100% axis. Descriptive estimates, not a statistical ranking. Select a row to inspect its source.`; panel.append(description);
  for (const feature of [...collection.features].sort((a, b) => a.properties.name.localeCompare(b.properties.name))) {
    const p = feature.properties; const value = p[metric];
    if (value === null) continue;
    const row = document.createElement('button'); row.type = 'button'; row.className = 'distribution-row';
    const label = document.createElement('span'); label.textContent = p.name;
    const track = document.createElement('span'); track.className = 'distribution-track'; track.setAttribute('aria-hidden', 'true');
    const dot = document.createElement('span'); dot.className = 'distribution-dot'; dot.style.left = `${value}%`; dot.style.backgroundColor = collegeColor(p, metric); track.append(dot);
    const number = document.createElement('strong'); number.textContent = `${value}%`; row.append(label, track, number);
    row.addEventListener('click', () => onSelect(feature)); panel.append(row);
  }
  if (!panel.querySelector('button')) line(panel, 'No published values match these filters. Missing values remain available in the institution list.');
  return panel;
}
