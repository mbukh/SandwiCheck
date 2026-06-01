export const ANIMATION = {
  DURATION: {
    QUICK: 200, // Quick interactions
    STANDARD: 300, // Standard transitions
    LAYER_REORDER: 400, // Layer position changes
    MODE_SWITCH: 500, // Mode transitions
    PREVIEW_COLLAPSE: 600, // Preview layer collapse
  },
  EASING: {
    STANDARD: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material Design
    EASE_OUT: 'cubic-bezier(0.0, 0, 0.2, 1)',
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  DELAY: {
    STAGGER: 100, // Delay between layers in staggered animations
  },
} as const;
