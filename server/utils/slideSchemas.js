/**
 * Slide layout definitions for PPT-GEN.
 * Each layout describes a visual arrangement used by the frontend renderer.
 */
const LAYOUTS = {
  standard: {
    name: 'Standard',
    description: 'Title + bullet points',
  },
  split: {
    name: 'Two-Column Split',
    description: 'Left heading, right content',
  },
  cards: {
    name: '3-Card Grid',
    description: 'Three equal content cards',
  },
  metrics: {
    name: 'Metric Showcase',
    description: 'Key numbers/stats display',
  },
  headline: {
    name: 'Headline Callout',
    description: 'Big bold statement slide',
  },
};

/**
 * Returns an array of valid layout keys.
 */
const getValidLayouts = () => Object.keys(LAYOUTS);

module.exports = { LAYOUTS, getValidLayouts };
