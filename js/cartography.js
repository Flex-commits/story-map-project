/** Shared cartographic definitions: breaks remain fixed across comparable years. */
export const COUNT_BINS = [
  { max: 2000, color: '#eadfca', label: 'Under 2,000' },
  { max: 4000, color: '#d9bd91', label: '2,000–3,999' },
  { max: 6000, color: '#c08b61', label: '4,000–5,999' },
  { max: 8000, color: '#a65c3e', label: '6,000–7,999' },
  { max: Infinity, color: '#743b30', label: '8,000 or more' },
];
export const CHANGE_BINS = [
  { max: 0, color: '#547f8b', label: 'Decrease' },
  { max: 25, color: '#eee4cb', label: '0–<25%' },
  { max: 50, color: '#dfbb8d', label: '25–<50%' },
  { max: 100, color: '#c77b50', label: '50–<100%' },
  { max: Infinity, color: '#9b402e', label: '100% or more' },
];

export const COUNT_RADIUS_SCALE = 0.22;
export const countRadius = (count) => count === null ? 0 : Math.sqrt(count / Math.PI) * COUNT_RADIUS_SCALE;
export const COLLEGE_SCALE_NOTE = 'Display ranges describe published estimates; they are not risk thresholds. Differences are not established as statistically significant.';

export const typeColors = {
  'Community Colleges': '#267b91',
  'Comprehensive Colleges': '#77629a',
  'Graduate Colleges': '#b07835',
  'Senior Colleges': '#417858',
  'Honors Colleges': '#985f68',
};

export const metrics = {
  homelessness_pct: { title: 'Reported homelessness · 2024 (%)', bins: [{ max: 5, color: '#72abb9', label: '0–<5%' }, { max: 10, color: '#246c85', label: '5–<10%' }, { max: Infinity, color: '#123f59', label: '10% or more' }] },
  housing_insecurity_pct: { title: 'CUNY housing insecurity scale · 2024 (%)', bins: [{ max: 40, color: '#ded5ea', label: 'Under 40%' }, { max: 50, color: '#b29bc9', label: '40–<50%' }, { max: 60, color: '#81609f', label: '50–<60%' }, { max: Infinity, color: '#51346c', label: '60% or more' }] },
  rent_increase_difficulty_pct: { title: 'Rent increase made payment difficult · 2024 (%)', bins: [{ max: 20, color: '#dbbc89', label: '0–<20%' }, { max: 40, color: '#b78c42', label: '20–<40%' }, { max: Infinity, color: '#805b23', label: '40% or more' }] },
};

export function measureMetadata(metric) {
  if (metric === 'afc_rate_band_2023_24') return {
    source_id: 'afc_rates_2023_24', source_url: 'https://advocatesforchildren.org/wp-content/uploads/2024/nyc_student_homelessness_2024.pdf',
    measure_unit: 'Published ordinal percentage range, not an exact rate', source_period: '2023–24',
  };
  if (metric.endsWith('_pct') && metrics[metric]) return {
    source_id: 'cuny_ses_2024', source_url: 'https://insights.cuny.edu/t/CUNYGuest/views/2026StudentExperienceSurvey/Intro',
    measure_unit: 'Published whole-percent weighted survey estimate', source_period: 'Spring 2024; past 12 months',
  };
  if (metric === 'institution_type') return {
    source_id: 'cuny_locations', source_url: 'https://data.ny.gov/d/irqs-74ez', measure_unit: 'Institution category', source_period: 'Retrieved 2026-10-24',
  };
  return {
    source_id: 'sirs_2021_24', source_url: 'https://www.nysteachs.org/data-on-student-homelessness',
    measure_unit: metric.startsWith('change_') ? 'Percentage change in reporting-LEA count' : 'Students identified by reporting LEA; not residence locations',
    source_period: metric.startsWith('change_') ? '2021–22 to 2023–24' : metric.replace('homeless_', '').replace('_', '–'),
  };
}
