import { loadData } from './data.js';
/** Adapted from templates/scrollytelly/js/slidedeck.js.
 * Retains the template's slide/data/map model with a shared data cache,
 * stale-request protection, and responsive scroll activation.
 */
class SlideDeck {
  constructor(container, slides, map, slideOptions = {}) {
    this.container = container;
    this.slides = slides;
    this.map = map;
    this.slideOptions = slideOptions;
    this.dataLayer = L.layerGroup().addTo(map);
    this.currentSlideIndex = -1;
    this.collections = new Map();
    this.requestIndex = 0;
  }

  async getSlideFeatureCollection(slide) {
    // All chapters share one geometry file rather than downloading duplicates.
    const url = slide.dataset.layer === 'colleges' ? 'data/cuny-colleges.geojson' : 'data/nyc-student-homelessness-districts.geojson';
    return loadData(url.replace('data/', ''));
  }

  updateDataLayer(collection, options) {
    this.dataLayer.clearLayers();
    return (options.createLayer ? options.createLayer(collection) : L.geoJSON(collection, options)).addTo(this.dataLayer);
  }

  async syncMapToSlide(slide) {
    const request = ++this.requestIndex;
    try {
      const collection = await this.getSlideFeatureCollection(slide);
      if (request !== this.requestIndex) return;
      const options = this.slideOptions[slide.id];
      const layer = this.updateDataLayer(collection, options);
      const district = Number(slide.dataset.district);
      const campus = Number(slide.dataset.campus);
      const focusLayer = district || campus ? L.featureGroup(layer.getLayers().filter((item) => district ? item.feature?.properties.district === district : (item.groupFeatures || [item.feature]).some((feature) => feature?.properties.campus_id === campus))) : layer;
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      this.map.invalidateSize();
      this.map.stop();
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.map.flyToBounds(focusLayer.getBounds(), {
        paddingTopLeft: [35, mobile ? 45 : 155],
        paddingBottomRight: [35, mobile ? 100 : 190],
        maxZoom: district || campus ? 13 : 11,
        animate: !reducedMotion,
        duration: 1.25,
      });
      document.querySelector('#map-status').textContent = '';
      document.body.dataset.chapter = slide.id;
      document.dispatchEvent(new CustomEvent('storyslide', { detail: { slide, collection } }));
    } catch (error) {
      console.error('Unable to update story map:', error);
      document.querySelector('#map-status').textContent = 'The district map could not load. Please reload the page, or use the CSV download in Sources.';
    }
  }

  syncMapToCurrentSlide() {
    this.syncMapToSlide(this.slides[this.currentSlideIndex]);
  }

  calcCurrentSlideIndex() {
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const threshold = mobile ? window.innerHeight * 0.43 + 100 : window.innerHeight * 0.5;
    let index = 0;
    for (let i = 0; i < this.slides.length; i++) {
      if (this.slides[i].getBoundingClientRect().top <= threshold) index = i;
    }
    if (index !== this.currentSlideIndex) {
      this.currentSlideIndex = index;
      this.syncMapToCurrentSlide();
    }
  }
}

export { SlideDeck };
