// Single source of truth for site settings. Curriculum content lives in ../projects/.

export const CONFIG = {
  repoUrl: 'https://github.com/woolimi/physical-ai-from-scratch',
  repoBranch: 'main',

  storage: {
    progressKey: 'pafs.progress.v1',
    introSeenKey: 'pafs.intro-seen.v1',
    panelWidthKey: 'pafs.panel-width.v1',
  },

  // project panel on wide screens; its left edge drags to resize
  panel: {
    defaultWidth: 600,
    minWidth: 380,
    minGraphWidth: 320, // room the graph keeps between the sidebar and the panel, unless that would push the panel below defaultWidth
    keyStep: 32, // arrow keys on the resize handle
  },

  // ?from=<owner>/<repo> shows the progress.yaml committed in that learner repo, read-only
  shared: {
    fromParam: 'from',
    embedParam: 'embed', // ?embed=1 inside an iframe: no intro, wheel zooms only with ctrl/cmd
    file: 'progress.yaml',
    rawBase: 'https://raw.githubusercontent.com',
    webBase: 'https://github.com',
    ref: 'HEAD',
    wheelHintMs: 1600,
  },

  // multiple-choice part of /evaluate. Answers are submitted to the local dev server, which writes them into the
  // learner repo; the deployed map only shows that the quiz needs the local map.
  quiz: {
    bankFile: 'quiz.yaml', // projects/<id>/quiz.yaml; the glob in curriculum/load.ts must use the same name (globs take literals only)
    resultFile: 'quiz-result.json', // projects/<id>/quiz-result.json, read by /evaluate
    endpoint: '/__quiz', // GET|POST /__quiz/<id>, served by the dev server only
    choiceCount: 4,
  },

  layout: {
    hubRadius: 60, // core projects sit on this circle around the starting project
    ringGap: 58, // distance between rank rings
    nodeSpacing: 72, // arc length between neighbours when first placed on a ring
    sectorPadding: 0.05, // radians kept empty at each sector edge
    spiralMaxAngle: 0.7, // edges spanning less than this follow the rings, longer ones bow inward
    nodeRadius: { small: 9, medium: 11.5, large: 14 },
    hoursForSize: { medium: 12, large: 25 }, // hours >= threshold
    labelFontSize: 13,
    labelLineHeight: 15,
    labelCharWidth: 7.9, // JetBrains Mono advance at labelFontSize
    labelWrapAt: 12, // titles longer than this wrap onto two lines
    labelOffset: 7, // gap between node circle and its label
    boxPad: 10, // breathing room around each node+label box
    startTagHeight: 18, // space reserved above the starting project for its START tag
    relaxIterations: 400,
    ringStiffness: 0.12, // how hard nodes are pulled back onto their ring
    angleStiffness: 0.03, // how hard nodes are pulled back toward their intended angle
    branchLabelGap: 34, // distance from the outermost label to sector titles
  },

  zoom: {
    min: 0.25,
    max: 3,
    labelMinScale: 0.55, // below this zoom, labels of locked projects hide
    initialMinScale: 0.85, // first view never zooms out further than this, so labels stay readable
    fitPadding: 40,
  },
} as const

export type Config = typeof CONFIG
