export const RATE_METRIC = 'afc_rate_band_2023_24';
export const RATE_BINS = [
  { max: 1, color: '#e8e4f0', label: 'Under 5%' },
  { max: 2, color: '#c6bddb', label: '5–9.9%' },
  { max: 3, color: '#9a87b9', label: '10–14.9%' },
  { max: 4, color: '#745a94', label: '15–19.9%' },
  { max: Infinity, color: '#4c3268', label: '20% or more' },
];
export const RATE_NOTE = 'AFC published ranges · 2023–24 cumulative enrollment · includes charter pupils · District 75 excluded from district denominators. Separate analysis, not a ratio of the workbook counts. Mapped on 2026 reference boundaries; historical consistency is unresolved.';
export const GEOGRAPHY_NOTE = 'Reporting LEAs, not student residences. DCP 2026 reference boundaries; documented display-geometry repair; historical consistency not established.';
export const evidenceStatuses = {
  available: 'Campus figures available',
  outside_survey: 'No separate undergraduate survey result',
  reviewed_pending: 'Source reviewed; comparable figure pending',
  not_yet_checked: 'Campus report not yet checked',
};
