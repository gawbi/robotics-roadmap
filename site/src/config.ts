// Single source of truth for site settings. Curriculum content lives in ../lessons/.

export const CONFIG = {
  repoUrl: 'https://github.com/woolimi/physical-ai-study',
  repoBranch: 'main',

  storage: {
    introSeenKey: 'pafs.intro-seen.v1',
    panelWidthKey: 'pafs.panel-width.v1',
  },

  // lesson panel on wide screens; its left edge drags to resize
  panel: {
    defaultWidth: 600,
    minWidth: 380,
    edgeGutter: 48, // the panel may grow over the sidebar and graph up to this strip at the window's left edge
    keyStep: 32, // arrow keys on the resize handle
  },

  // multiple-choice quiz that closes each lesson. The dev server grades a submission and appends it to the result
  // file; a lesson is done once one attempt gets every answer right.
  quiz: {
    bankFile: 'quiz.yaml', // lessons/<id>/quiz.yaml; the globs in curriculum/load.ts must use the same names (globs take literals only)
    resultFile: 'quiz-result.json', // lessons/<id>/quiz-result.json
    endpoint: '/__quiz', // POST /__quiz/<id>, served by the dev server only
    choiceCount: 4,
  },

  // layered map from ELK: prerequisites above, the lessons they open below
  layout: {
    nodeRadius: { small: 9, medium: 11.5, large: 14 },
    hoursForSize: { medium: 12, large: 25 }, // hours >= threshold
    labelFontSize: 13,
    labelLineHeight: 15,
    labelCharWidth: 7.9, // JetBrains Mono advance at labelFontSize
    labelWrapAt: 12, // titles longer than this wrap onto two lines
    labelOffset: 7, // gap between node circle and its label
    boxPad: 10, // breathing room on each side of a node+label box
    startTagHeight: 18, // space reserved above the starting lesson for its START tag
    nodeGap: 32, // px between neighbouring lessons in a layer
    layerGap: 64, // px between layers
    edgeNodeGap: 14, // px between an edge and a lesson it passes
    edgeGap: 20, // px between parallel edges and between the waypoints of long edges
    trunkStraightness: 10, // ELK priority for keeping core-chain edges straight
    curveSamples: 12, // points per Bézier segment when an edge is sampled
    orderRestarts: 100, // random starts of the crossing minimisation; 100 settles on the same crossing count for any seed
    orderSweeps: 8, // barycentre sweeps per start
    orderSeed: 1,
  },

  zoom: {
    min: 0.25,
    max: 3,
    labelMinScale: 0.55, // below this zoom, labels of locked lessons hide
    initialMinScale: 0.85, // first view never zooms out further than this, so labels stay readable
    fitPadding: 40,
  },
} as const

export type Config = typeof CONFIG
