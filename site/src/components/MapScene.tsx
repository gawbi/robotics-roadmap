import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  CustomBlending,
  DoubleSide,
  Mesh,
  OneFactor,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'
import { CONFIG } from '../config'
import type { Layout } from '../curriculum/layout'
import type { Curriculum } from '../curriculum/types'

/** the map's zoom: a point (x, y) of the layout is drawn at (x·k + tx, y·k + ty) on screen */
export interface ViewTransform {
  k: number
  x: number
  y: number
}

export interface SceneHandle {
  setTransform(t: ViewTransform): void
  /** the area under the pointer: 'hub', a tree's id, or null; its background lights up */
  setFocus(area: string | null): void
}

interface Props {
  curriculum: Curriculum
  layout: Layout
  /** false when WebGL is not available, so the SVG keeps drawing the trees' tints */
  onReady(ok: boolean): void
  ref?: Ref<SceneHandle>
}

const MAX_TREES = 4

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.0, 9.0); a *= 0.5; }
    return v;
  }
`

// light added onto the transparent canvas: the colour itself, with an alpha that keeps it premultiplied, so black
// adds nothing and lets the page's background show through
const LIGHT = /* glsl */ `
  vec4 light(vec3 c) { return vec4(c, max(c.r, max(c.g, c.b))); }
`

// the colour of the trees' areas at an angle round the centre, blended where two areas meet, and how lit up that spot
// is (1 plus the hovered area's share of it times the focus gain)
const TINT = /* glsl */ `
  #define PI 3.14159265
  uniform int uCount;
  uniform vec3 uColor[${MAX_TREES}];
  uniform float uMid[${MAX_TREES}], uHalf[${MAX_TREES}], uFocus[${MAX_TREES}], uInnerCut[${MAX_TREES}];
  uniform float uFocusGain;
  // xyz: the colour; w: how lit up the spot is. innerCut: how much of the clouds near the hub this angle's trees drop
  vec4 tintAt(float ang, out float innerCut) {
    vec3 tint = vec3(0.0);
    float wsum = 0.0, lit = 0.0, cut = 0.0;
    for (int i = 0; i < ${MAX_TREES}; i++) {
      if (i >= uCount) break;
      float d = abs(mod(ang - uMid[i] + PI, 2.0 * PI) - PI);
      float w = 1.0 - smoothstep(uHalf[i] * 0.55, uHalf[i] * 1.2, d);
      tint += uColor[i] * w;
      lit += uFocus[i] * w;
      cut += uInnerCut[i] * w;
      wsum += w;
    }
    innerCut = cut / max(wsum, 1e-3);
    return vec4(tint / max(wsum, 1e-3), 1.0 + uFocusGain * lit / max(wsum, 1e-3));
  }
`

// a plane in layout coordinates; the scene's y axis points up, so the layout's y is flipped once here
const PLANE_VERTEX = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = vec2(position.x, -position.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// behind everything: clouds in each tree's colour, brightest just outside the hub and fading out past the map; the
// hovered area's clouds brighten, and a hovered hub lights up in the accent colour
const BACKDROP_FRAGMENT = /* glsl */ `
  uniform float uTime, uRim, uReach, uScale, uStrength, uHubFocus, uHubGlow, uSpread;
  uniform vec3 uAccent;
  varying vec2 vPos;
  ${TINT}
  ${NOISE}
  ${LIGHT}
  void main() {
    float r = length(vPos);
    float innerCut;
    vec4 tint = tintAt(atan(vPos.x, -vPos.y), innerCut);
    vec2 q = vPos / uScale;
    float n = fbm(q + vec2(uTime * 0.012, -uTime * 0.009));
    float n2 = fbm(q * 2.4 - vec2(uTime * 0.02, uTime * 0.006));
    float cloud = smoothstep(0.32, 0.86, n) * 0.85 + smoothstep(0.52, 0.92, n2) * 0.45;
    float fall = smoothstep(uRim * 0.7, uRim * 1.25, r) * (1.0 - smoothstep(uRim * 1.5, uReach * uSpread, r));
    fall *= 1.0 - innerCut * (1.0 - smoothstep(uRim, uRim * 3.0, r));
    vec3 col = tint.rgb * (0.18 + cloud) * fall * uStrength * tint.a;
    // the hub, hovered, fills with a soft cloud of the accent colour
    float inside = 1.0 - smoothstep(uRim * 0.97, uRim, r);
    col += uAccent * uHubFocus * uHubGlow * (1.0 + cloud * 1.2) * inside;
    gl_FragColor = light(col);
  }
`

// stars behind the clouds: soft round points a few screen pixels wide, steady except for a few larger ones that blink,
// each on its own period of a few seconds, from nearly out to brighter than the rest
const STAR_VERTEX = /* glsl */ `
  attribute float size;
  attribute float phase;
  attribute float blink;
  uniform float uTime, uPixelRatio;
  varying float vGlow;
  void main() {
    float wave = 0.5 + 0.5 * sin(uTime * (1.6 + phase * 1.6) + phase * 40.0);
    vGlow = mix(1.0, 0.1 + 1.8 * wave * wave, blink);
    gl_PointSize = (size + blink * 1.5) * uPixelRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const STAR_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uBrightness;
  varying float vGlow;
  ${LIGHT}
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float g = exp(-dot(c, c) * 18.0);
    gl_FragColor = light(uColor * g * vGlow * uBrightness);
  }
`

// a fixed sequence of random numbers, so the stars sit in the same places on every visit
function random(seed: number) {
  let x = seed
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296
    return x / 4294967296
  }
}

// a shooting star: a thin streak, brightest at its head and fading along its tail, that fades in and out over its life
const METEOR_VERTEX = /* glsl */ `
  uniform vec2 uHead, uDir;
  uniform float uLength, uWidth;
  varying vec2 vAt;
  void main() {
    vAt = position.xy + 0.5;
    vec2 across = vec2(-uDir.y, uDir.x);
    vec2 p = uHead - uDir * (1.0 - vAt.x) * uLength + across * position.y * uWidth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p.x, -p.y, 0.0, 1.0);
  }
`
const METEOR_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uLife, uBrightness;
  varying vec2 vAt;
  ${LIGHT}
  void main() {
    float along = pow(vAt.x, 1.6);
    float across = 1.0 - abs(vAt.y * 2.0 - 1.0);
    float fade = sin(uLife * 3.14159);
    gl_FragColor = light(uColor * along * across * fade * uBrightness);
  }
`

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The WebGL layer under the map: slowly drifting clouds in each tree's colour, brightest just outside the hub, lighting
 * up under the pointer. The SVG on top keeps everything else and all interaction; this layer only follows its zoom.
 */
export function MapScene({ curriculum: c, layout, onReady, ref }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const api = useRef<SceneHandle | null>(null)

  useImperativeHandle(ref, () => ({
    setTransform: (t) => api.current?.setTransform(t),
    setFocus: (area) => api.current?.setFocus(area),
  }))

  useEffect(() => {
    const canvas = canvasRef.current!
    const S = CONFIG.scene
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch {
      onReady(false)
      return
    }
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, S.maxPixelRatio))

    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, -10, 10)
    const view: ViewTransform = { k: 1, x: 0, y: 0 }
    const trees = layout.sectors.slice(0, MAX_TREES)
    const geometry = new PlaneGeometry(layout.reach * S.nebulaSpread * 2.2, layout.reach * S.nebulaSpread * 2.2)
    // light is added onto the transparent canvas (see LIGHT)
    const blend = {
      transparent: true,
      depthWrite: false,
      blending: CustomBlending,
      blendSrc: OneFactor,
      blendDst: OneFactor,
      blendSrcAlpha: OneFactor,
      blendDstAlpha: OneFactor,
    } as const
    const nebula = new ShaderMaterial({
      vertexShader: PLANE_VERTEX,
      fragmentShader: BACKDROP_FRAGMENT,
      ...blend,
      uniforms: {
        uTime: { value: 0 },
        uRim: { value: layout.rim },
        uReach: { value: layout.reach },
        uScale: { value: S.nebulaScale },
        uStrength: { value: S.nebulaStrength },
        uSpread: { value: S.nebulaSpread },
        uFocusGain: { value: S.focusGain },
        uFocus: { value: Array.from({ length: MAX_TREES }, () => 0) },
        uInnerCut: { value: Array.from({ length: MAX_TREES }, (_, i) => (trees[i] ? (S.innerCut[trees[i].tree] ?? 0) : 0)) },
        uHubFocus: { value: 0 },
        uHubGlow: { value: S.hubGlow },
        uAccent: { value: new Color(S.accent) },
        uCount: { value: trees.length },
        uColor: {
          // a tree's colour, scaled by how thick its clouds should be
          value: Array.from({ length: MAX_TREES }, (_, i) =>
            trees[i] ? new Color(c.trees.find((t) => t.id === trees[i].tree)!.color).multiplyScalar(S.treeDensity[trees[i].tree] ?? 1) : new Color(0),
          ),
        },
        uMid: { value: Array.from({ length: MAX_TREES }, (_, i) => (trees[i] ? (((trees[i].start + trees[i].end) / 2) * Math.PI) / 180 : 0)) },
        uHalf: { value: Array.from({ length: MAX_TREES }, (_, i) => (trees[i] ? (((trees[i].end - trees[i].start) / 2) * Math.PI) / 180 : 1)) },
      },
    })
    // stars spread over the same square as the clouds and drawn before them, so the clouds lie over the stars
    const rand = random(S.stars.seed)
    const half = layout.reach * S.nebulaSpread * 1.1
    const starGeometry = new BufferGeometry()
    starGeometry.setAttribute('position', new BufferAttribute(new Float32Array(Array.from({ length: S.stars.count * 3 }, (_, i) => (i % 3 === 2 ? 0 : (rand() * 2 - 1) * half))), 3))
    starGeometry.setAttribute('size', new BufferAttribute(new Float32Array(Array.from({ length: S.stars.count }, () => S.stars.minSize + rand() ** 3 * (S.stars.maxSize - S.stars.minSize))), 1))
    starGeometry.setAttribute('phase', new BufferAttribute(new Float32Array(Array.from({ length: S.stars.count }, () => rand())), 1))
    starGeometry.setAttribute('blink', new BufferAttribute(new Float32Array(Array.from({ length: S.stars.count }, () => (rand() < S.stars.blinkShare ? 1 : 0))), 1))
    const stars = new ShaderMaterial({
      vertexShader: STAR_VERTEX,
      fragmentShader: STAR_FRAGMENT,
      ...blend,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uColor: { value: new Color(S.stars.color) },
        uBrightness: { value: S.stars.brightness },
      },
    })
    const starPoints = new Points(starGeometry, stars)
    starPoints.frustumCulled = false
    scene.add(starPoints)

    const mesh = new Mesh(geometry, nebula)
    mesh.frustumCulled = false
    scene.add(mesh)

    // one shooting star at a time, every few seconds, crossing the part of the map in view
    const M = S.meteors
    const meteorGeometry = new PlaneGeometry(1, 1)
    const meteor = new ShaderMaterial({
      vertexShader: METEOR_VERTEX,
      fragmentShader: METEOR_FRAGMENT,
      ...blend,
      // the streak is laid out in the map's y-down frame, which mirrors its triangles
      side: DoubleSide,
      uniforms: {
        uHead: { value: new Vector2() },
        uDir: { value: new Vector2(1, 0) },
        uLength: { value: 1 },
        uWidth: { value: 1 },
        uLife: { value: 0 },
        uColor: { value: new Color(M.color) },
        uBrightness: { value: M.brightness },
      },
    })
    const meteorMesh = new Mesh(meteorGeometry, meteor)
    meteorMesh.frustumCulled = false
    meteorMesh.visible = false
    scene.add(meteorMesh)
    const flight = { from: new Vector2(), to: new Vector2(), born: 0, next: performance.now() + M.firstAfter * 1000 }
    const launch = (now: number) => {
      const { clientWidth: w, clientHeight: h } = canvas
      const toLayout = (x: number, y: number) => new Vector2((x - view.x) / view.k, (y - view.y) / view.k)
      const angle = ((M.angle + (Math.random() * 2 - 1) * M.angleSpread) * Math.PI) / 180
      const dir = new Vector2(Math.cos(angle) * (Math.random() < 0.5 ? -1 : 1), Math.sin(angle))
      flight.from = toLayout(w * (0.15 + Math.random() * 0.7), h * (0.05 + Math.random() * 0.35))
      flight.to = flight.from.clone().addScaledVector(dir, M.travel / view.k)
      flight.born = now
      meteor.uniforms.uDir.value.copy(dir)
      meteor.uniforms.uLength.value = M.length / view.k
      meteor.uniforms.uWidth.value = M.width / view.k
      meteorMesh.visible = true
    }
    const fly = (now: number) => {
      if (!meteorMesh.visible && now >= flight.next) launch(now)
      if (!meteorMesh.visible) return
      const life = (now - flight.born) / (M.duration * 1000)
      if (life >= 1) {
        meteorMesh.visible = false
        flight.next = now + (M.every[0] + Math.random() * (M.every[1] - M.every[0])) * 1000
        return
      }
      meteor.uniforms.uLife.value = life
      meteor.uniforms.uHead.value.lerpVectors(flight.from, flight.to, life)
    }

    // the camera shows exactly the part of the layout the SVG shows
    const fit = () => {
      const { clientWidth: w, clientHeight: h } = canvas
      camera.left = -view.x / view.k
      camera.right = (w - view.x) / view.k
      camera.top = view.y / view.k
      camera.bottom = (view.y - h) / view.k
      camera.updateProjectionMatrix()
    }
    const resize = () => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
      fit()
    }

    const still = reducedMotion()
    const start = performance.now()
    let last = 0
    // each area's light eases toward 1 while it is hovered and back to 0 after
    let focus: string | null = null
    let previous = start
    const draw = (now: number) => {
      const dt = Math.min((now - previous) / 1000, 0.1)
      previous = now
      const ease = still ? 1 : Math.min(1, dt * S.focusEase)
      const lit: number[] = nebula.uniforms.uFocus.value
      trees.forEach((t, i) => (lit[i] += ((focus === t.tree ? 1 : 0) - lit[i]) * ease))
      nebula.uniforms.uHubFocus.value += ((focus === 'hub' ? 1 : 0) - nebula.uniforms.uHubFocus.value) * ease
      nebula.uniforms.uTime.value = stars.uniforms.uTime.value = still ? 0 : (now - start) / 1000
      if (!still) fly(now)
      renderer.render(scene, camera)
    }
    const loop = (now: number) => {
      if (now - last < 1000 / S.fps) return
      last = now
      draw(now)
    }
    const run = () => renderer.setAnimationLoop(document.hidden || still ? null : loop)

    resize()
    draw(start)
    run()
    const observer = new ResizeObserver(() => {
      resize()
      draw(performance.now())
    })
    observer.observe(canvas)
    document.addEventListener('visibilitychange', run)
    api.current = {
      setFocus(area) {
        focus = area
        if (still) draw(performance.now())
      },
      setTransform(t) {
        Object.assign(view, t)
        fit()
        if (still) draw(start)
      },
    }
    onReady(true)

    return () => {
      api.current = null
      observer.disconnect()
      document.removeEventListener('visibilitychange', run)
      renderer.setAnimationLoop(null)
      geometry.dispose()
      nebula.dispose()
      starGeometry.dispose()
      stars.dispose()
      meteorGeometry.dispose()
      meteor.dispose()
      renderer.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c, layout])

  return <canvas ref={canvasRef} className="map-scene" aria-hidden="true" />
}
