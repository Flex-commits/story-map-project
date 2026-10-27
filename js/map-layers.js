import { countRadius } from './cartography.js';

export function districtLayer(collection, options, metric, onSelect) {
  const counts = metric.startsWith('homeless_');
  const polygons = L.geoJSON(collection, { ...options,
    style: (feature) => ({ ...options.style(feature), ...(counts ? { fillColor: '#d5c9b4', fillOpacity: 0.22 } : {}) }),
  });
  if (!counts) return polygons;
  const circles = collection.features.filter((feature) => feature.symbolAnchor && feature.properties[metric] !== null)
    .sort((a, b) => b.properties[metric] - a.properties[metric]).map((feature) => {
      const marker = L.circleMarker([...feature.symbolAnchor].reverse(), {
        radius: countRadius(feature.properties[metric]), color: '#743b30', weight: 1,
        fillColor: options.style(feature).fillColor, fillOpacity: 0.82,
      });
      marker.feature = feature;
      marker.bindTooltip(`District ${feature.id}: ${feature.properties[metric].toLocaleString('en-US')} identified by reporting LEA. Circle anchor is not a student location.`);
      if (options.onEachFeature) options.onEachFeature(feature, marker);
      if (onSelect) marker.on('click', () => onSelect(feature));
      return marker;
    });
  return L.featureGroup([...polygons.getLayers(), ...circles]);
}

export function addOrientation(map) {
  const pane = map.getPane('orientation') || map.createPane('orientation'); pane.style.zIndex = '450'; pane.style.pointerEvents = 'none';
  const labels = [
    ['Manhattan', 40.782, -73.974], ['Bronx', 40.868, -73.867], ['Queens', 40.72, -73.81],
    ['Brooklyn', 40.639, -73.957], ['Staten Island', 40.579, -74.154],
    ['Hudson River', 40.77, -74.025], ['Upper New York Bay', 40.625, -74.063],
  ];
  return L.featureGroup(labels.map(([name, lat, lon]) => L.marker([lat, lon], { pane: 'orientation', interactive: false, keyboard: false,
    icon: L.divIcon({ className: 'geographic-label', html: name, iconSize: [110, 20], iconAnchor: [55, 10] }),
  }))).addTo(map);
}
