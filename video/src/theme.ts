import { loadFont as loadSans } from '@remotion/google-fonts/IBMPlexSansKR'
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono'

// the site's palette (site/src/styles.css) and the lessons' figure colours (CLAUDE.md), so a video reads like its lesson
export const C = {
  bg: '#05080f',
  card: '#0b1220',
  cardEdge: '#1e293b',
  grid: '#131c30',
  text: '#e2e8f0',
  muted: '#94a3b8',
  dim: '#64748b',
  accent: '#22d3ee',
  blue: '#7cb4d8',
  green: '#7fc4a2',
  orange: '#d6aa62',
  red: '#d88b8b',
  purple: '#a99ad6',
  pink: '#cf96b8',
}

export const SANS = loadSans('normal', { weights: ['400', '500', '600', '700'] }).fontFamily
export const MONO = loadMono('normal', { weights: ['400', '600'] }).fontFamily

export const FPS = 30
export const W = 1920
export const H = 1080
