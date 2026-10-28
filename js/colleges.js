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

/** Keep coincident official locations intact; disclose and select every record. */
export function campusLayer(collection, { metric, mode = 'ranges', onSelect, labels = false, selected = null, style = () => ({}), card = campusCard }) {
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
        line(panel, 'Choose an institution to see its figure.');
        const detail = document.createElement('div');
        for (const item of features) {
          const button = document.createElement('button'); button.type = 'button'; button.className = 'shared-campus-choice'; button.textContent = item.properties.name;
          button.addEventListener('click', () => {
            onSelect(item);
            detail.replaceChildren(card(item.properties));
          }); panel.append(button);
        }
        panel.append(detail); return panel;
      }, { maxWidth: 330 });
    } else {
      marker.bindPopup(() => card(p), { maxWidth: 330 });
      marker.on('click', () => onSelect(feature));
    }
    return marker;
  });
  return L.featureGroup(layers);
}

export function compactCampusCard(p) {
  const card = document.createElement('div'); const heading = document.createElement('h3'); heading.textContent = p.name; card.append(heading);
  line(card, p.homelessness_pct === null ? 'No separate undergraduate survey result in the checked export. This does not mean zero.' : `${p.homelessness_pct}% reported homelessness · spring 2024, past 12 months.`);
  if (p.homelessness_pct !== null) line(card, 'Weighted survey estimate, not a student headcount.');
  const source = document.createElement('a'); source.href = p.survey_source || p.review_source; source.textContent = 'Survey source ↗';
  const data = document.createElement('a'); data.href = 'data.html#campus-table'; data.textContent = 'Campus table and methods ↗';
  card.append(source, document.createElement('br'), data); return card;
}
