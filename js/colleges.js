import { evidenceStatuses } from './evidence.js';
export const typeColors = {
  'Community Colleges': '#267b91',
  'Comprehensive Colleges': '#77629a',
  'Graduate Colleges': '#b07835',
  'Senior Colleges': '#417858',
  'Honors Colleges': '#985f68',
};

export const metrics = {
  homelessness_pct: { title: 'Reported homelessness · 2024 (%)', bins: [{ max: 5, color: '#72abb9', label: '0–<5%' }, { max: 10, color: '#246c85', label: '5–<10%' }, { max: Infinity, color: '#123f59', label: '10% or more' }] },
  housing_insecurity_pct: { title: 'Reported housing insecurity · 2024 (%)', bins: [{ max: 20, color: '#cbc0dc', label: '0–<20%' }, { max: 40, color: '#8972a6', label: '20–<40%' }, { max: Infinity, color: '#55416e', label: '40% or more' }] },
  rent_increase_difficulty_pct: { title: 'Rent increase made payment difficult · 2024 (%)', bins: [{ max: 20, color: '#dbbc89', label: '0–<20%' }, { max: 40, color: '#b78c42', label: '20–<40%' }, { max: Infinity, color: '#805b23', label: '40% or more' }] },
};

export function collegeColor(properties, metric) {
  if (metric === 'institution_type') return typeColors[properties.institution_type] || '#65766f';
  const value = properties[metric];
  return value === null ? '#89918e' : metrics[metric].bins.find((bin) => value < bin.max).color;
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
    for (const [label, field] of [['Homelessness', 'homelessness_pct'], ['Housing insecurity', 'housing_insecurity_pct'], ['Rent increase difficulty', 'rent_increase_difficulty_pct'], ['Unable to pay / underpaid rent', 'underpaid_rent_pct']]) {
      line(card, `${label}: ${properties[field] === null ? 'Not verified here' : `${properties[field]}%`}`);
    }
    line(card, `Spring ${properties.survey_year} · past 12 months. Total survey respondents: ${properties.sample_size}; response rate: ${properties.response_rate_pct}%.`);
    line(card, `Question: “${properties.question_wording}” Reference period: ${properties.recall_period}. Population: ${properties.survey_population}.`);
    line(card, properties.weighting);
    line(card, properties.uncertainty_note);
    if (properties.housing_insecurity_definition) line(card, properties.housing_insecurity_definition);
    const source = document.createElement('a');
    source.href = properties.survey_source;
    source.textContent = `Survey source · ${properties.source_pages} ↗`;
    card.append(source);
  } else {
    line(card, 'A campus homelessness figure has not yet been verified in this project. This does not mean no students experience homelessness.');
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
      value.textContent = this.metric === 'institution_type' ? feature.properties.institution_type : feature.properties[this.metric] === null ? 'Not verified' : `${feature.properties[this.metric]}%`;
      button.append(dot, name, value);
      button.addEventListener('click', () => this.select(feature));
      list.append(button);
    }
    if (!this.filtered.features.length) line(list, 'No institutions match. Clear the search or reset the filters.');
    document.querySelector('#campus-detail').replaceChildren();
    line(document.querySelector('#campus-detail'), 'Select a matching institution to inspect its source and methods.');
    this.onChange(this.filtered, this.metric);
  }
}
