// Single source of truth for site settings. Curriculum content lives in ../lessons/.

export const CONFIG = {
  repoUrl: 'https://github.com/woolimi/robotics-roadmap',
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

  // multiple-choice quiz that closes each lesson. The dev server grades a submission and appends it to the lesson's
  // progress file; a lesson is done once one attempt gets every answer right.
  quiz: {
    bankFile: 'quiz.yaml', // lessons/<id>/quiz.yaml; the globs in curriculum/load.ts must use the same names (globs take literals only)
    progressDir: 'progress', // <repo>/progress/<id>.json, kept apart from lessons/ so a fork commits only its own records
    endpoint: '/__quiz', // POST /__quiz/<id>, served by the dev server only
    choiceCount: 4,
  },

  // when the dev server starts it checks the original repository (repoUrl) for commits the fork does not have yet, and
  // the page offers to merge them
  update: {
    remote: 'upstream', // the git remote the original is fetched into; added to the fork if it is missing
    endpoint: '/__update', // GET: the fork's state; POST: merge the original. Served by the dev server only
    event: 'roadmap:update', // Vite WebSocket event that carries every change of state to the page
    fetchTimeoutMs: 20_000,
    gitTimeoutMs: 10_000,
    restartFiles: ['site/package.json', 'site/package-lock.json', 'site/vite.config.ts', 'site/quiz-server.ts', 'site/update-server.ts'],
  },

  // layered map from ELK: prerequisites above, the lessons they open below
  layout: {
    nodeRadius: { small: 13, medium: 16, large: 19 },
    hoursForSize: { medium: 12, large: 25 }, // hours >= threshold
    labelFontSize: 13,
    labelLineHeight: 15,
    labelCharWidth: 7.9, // JetBrains Mono advance at labelFontSize
    labelWrapAt: 12, // titles longer than this wrap onto two lines
    labelOffset: 7, // gap between node circle and its label
    boxPad: 10, // breathing room on each side of a node+label box
    startTagHeight: 18, // space reserved above the starting lesson for its START tag
    nodeGap: 64, // px between neighbouring lessons in a layer
    layerGap: 96, // px between layers
    edgeNodeGap: 14, // px between an edge and a lesson it passes
    edgeGap: 20, // px between parallel edges and between the waypoints of long edges
    trunkStraightness: 10, // ELK priority for keeping core-chain edges straight
    curveSamples: 12, // points per Bézier segment when an edge is sampled
    orderRestarts: 100, // random starts of the crossing minimisation; 100 settles on the same crossing count for any seed
    orderSweeps: 8, // barycentre sweeps per start
    orderSeed: 1,
    hubRing: 60, // px from the start to the first ring of hub lessons around it, and between further rings
    hubExit: 0.8, // how far to the side of a tree's axis an edge may leave the outermost ring, as a share of its radius
    hubPullAgreement: 0.4, // a hub lesson faces its trees only when their directions agree this much (1: all the same way)
    hubTurnStep: 2, // degrees two touching hub lessons on one ring turn apart per round
    treeGap: 24, // least px between the labels of lessons in different trees
    pushStep: 8, // px a tree moves away from the centre per round while its labels touch another tree's
    pushRounds: 200, // rounds of pushing before the layout gives up
    edgeBend: 0.2, // how far an edge between two trees reaches along each tree's direction, as a share of its length
  },

  sector: {
    charWidth: 46, // JetBrains Mono advance at the name's 64px, with its letter spacing
    lineHeight: 74,
    gap: 40, // least px between a tree's name and the hub
    angleGap: 3, // least degrees between a tree's name and the lines that mark off its area
    searchStep: 16, // px between the spots tried for a name, outward from the middle of its tree
    searchRadius: 1200,
  },

  zoom: {
    min: 0.25,
    max: 3,
    labelMinPx: 10, // zoomed out, labels grow to keep at least this on-screen size ...
    labelMaxGrow: 1.5, // ... but never past this many times their size, where neighbouring labels would touch
    initialMinScale: 0.85, // first view never zooms out further than this, so labels stay readable
    fitPadding: 40,
  },
} as const

export type Config = typeof CONFIG
