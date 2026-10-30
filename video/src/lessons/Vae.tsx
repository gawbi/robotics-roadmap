import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './vae.narration.json'
import { script } from './vae.script'

// Numbers follow lessons/vae/README.md (see vae.script.ts). The demo paths, the latent dots and the β sketches are
// schematic (redrawn after the lesson's figures); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

function Chip({ children, color = C.accent, at, mono = false }: { children: ReactNode; color?: string; at: number; mono?: boolean }) {
  return (
    <Appear at={at}>
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, fontFamily: mono ? MONO : undefined, whiteSpace: 'nowrap' }}>
        {children}
      </span>
    </Appear>
  )
}

function Bar({ label, value, max, color, at, width = 300, unit = '', labelW = 160 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {value}
        {unit}
      </span>
    </div>
  )
}

function Box({ x, y, w, h, title, color = C.cardEdge, at, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap: 14 }}>
        {title && <div>{title}</div>}
        {children}
      </div>
    </Appear>
  )
}

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, lineHeight: 1.45, whiteSpace: 'nowrap' })

/** a pill in a flow diagram */
function Pill({ children, color, at, style }: { children: ReactNode; color: string; at: number; style?: CSSProperties }) {
  const t = useSec()
  return (
    <div style={{ padding: '10px 18px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at), ...style }}>
      {children}
    </div>
  )
}

function Arrow({ at, down = false }: { at: number; down?: boolean }) {
  const t = useSec()
  return <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at), width: down ? undefined : 40, textAlign: 'center', lineHeight: down ? '40px' : undefined }}>{down ? '↓' : '→'}</span>
}

/** a bell curve's path: centre cx, spread s (px), peak height hpx above baseY, drawn over ±k spreads */
function bell(cx: number, s: number, hpx: number, baseY: number, k = 3) {
  const pts: string[] = []
  for (let i = 0; i <= 60; i++) {
    const u = -k + (2 * k * i) / 60
    pts.push(`${(cx + u * s).toFixed(1)},${(baseY - hpx * Math.exp(-0.5 * u * u)).toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
}

/** the same bell, closed down to its baseline, for a filled area */
const bellArea = (cx: number, s: number, hpx: number, baseY: number, k = 2) => `M ${cx - k * s},${baseY} L ${bell(cx, s, hpx, baseY, k).slice(2)} L ${cx + k * s},${baseY} Z`

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            GENERATIVE · VAE
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>VAE</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            variational <span style={{ color: C.accent }}>autoencoder</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={38}>
            데이터를 latent 로 줄였다 되살리며, latent 를 N(0, I) 에 맞추는 생성 모델
          </Label>
        </Appear>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, marginTop: 24, maxWidth: 1700 }}>
          {script.sections.map((c, i) => (
            <Appear key={c} at={4.4 + i * 0.45}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999, border: `1.5px solid ${C.cardEdge}`, background: C.card, fontSize: 28, transform: `scale(${1 + 0.04 * Math.sin(Math.max(0, t - 4.4 - i * 0.45) * 2)})` }}>
                <span style={{ fontFamily: MONO, color: C.accent, fontWeight: 600 }}>{i + 1}</span>
                {c}
              </div>
            </Appear>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}

function Question() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={250}>
        <div style={{ padding: '26px 32px', display: 'grid', gap: 22 }}>
          <Label size={24}>사람이 조종한 큐브 옮기기 시연</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'grid', gap: 10 }}>
              <Pill color={C.green} at={0.6}>
                시연 A · 큐브 위에서 잠깐 멈췄다 내려감
              </Pill>
              <Pill color={C.green} at={1}>
                시연 B · 바로 내려감
              </Pill>
            </div>
            <Arrow at={1.6} />
            <Pill color={C.blue} at={1.9}>
              정답 하나를 맞히는 모델
            </Pill>
            <Arrow at={2.4} />
            <Pill color={C.red} at={2.7}>
              여러 시연의 평균에 가까운 동작
            </Pill>
          </div>
        </div>
      </Panel>
      <Appear at={4.2} style={{ position: 'absolute', left: 64, top: 430, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          여러 시연이 퍼진 모양을 배워 <span style={{ color: C.accent }}>그 안에서 하나를 뽑으려면, 무엇을 학습해야 할까?</span>
        </div>
      </Appear>
      <Panel x={330} y={640} w={1260} h={230}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14, opacity: prog(t, 5.4) }}>
          <Label size={24}>ACT (양팔 로봇 ALOHA 의 policy) · 사람 시연으로 학습한 simulator 과제</Label>
          <Bar label="CVAE 있음" value={35.3} max={40} color={C.green} at={5.6} width={600} unit="%" labelW={180} />
          <Bar label="CVAE 없음" value={2} max={40} color={C.red} at={6.1} width={600} unit="%" labelW={180} />
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- S1: MSE average and gaps ----------

function Average() {
  const t = useSec()
  const cx = 450
  const rows: [string, string, number][] = [
    ['1', '(0 + 4) ÷ 2', 2],
    ['0.5', '(0.25 + 2.25) ÷ 2', 1.25],
    ['0', '(1 + 1) ÷ 2', 1],
    ['−0.5', '(2.25 + 0.25) ÷ 2', 1.25],
  ]
  const offs = [190, 205, 220, 235, 250]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={30} y={48} fill={C.text} fontSize={28} fontWeight={600} opacity={prog(t, 0.3)}>
            시연 10 번 · 정면의 상자 비켜 가기
          </text>
          {/* the box */}
          <g opacity={prog(t, 0.5)}>
            <rect x={cx - 60} y={220} width={120} height={80} rx={10} fill={`${C.orange}22`} stroke={C.orange} strokeWidth={2} />
            <text x={cx} y={268} textAnchor="middle" fill={C.orange} fontSize={24} fontWeight={600}>
              상자
            </text>
          </g>
          {/* demos: 5 left (+1), 5 right (−1) */}
          {offs.map((o, i) => (
            <g key={o} opacity={prog(t, 1 + i * 0.25)}>
              <path d={`M ${cx} 610 C ${cx} 470, ${cx - o} 440, ${cx - o} 300 L ${cx - o} 130`} fill="none" stroke={C.green} strokeWidth={3} opacity={0.8} />
              <path d={`M ${cx} 610 C ${cx} 470, ${cx + o} 440, ${cx + o} 300 L ${cx + o} 130`} fill="none" stroke={C.green} strokeWidth={3} opacity={0.8} />
            </g>
          ))}
          <text x={cx - 220} y={108} textAnchor="middle" fill={C.green} fontSize={24} fontWeight={600} opacity={prog(t, 2.4)}>
            왼쪽 +1 · 5 번
          </text>
          <text x={cx + 220} y={108} textAnchor="middle" fill={C.green} fontSize={24} fontWeight={600} opacity={prog(t, 3.4)}>
            오른쪽 −1 · 5 번
          </text>
          {/* the average path */}
          <line x1={cx} x2={cx} y1={610} y2={305} stroke={C.red} strokeWidth={4} strokeDasharray="12 10" opacity={prog(t, 13.2)} />
          <circle cx={cx} cy={640} r={26} fill={C.blue} opacity={prog(t, 0.5)} />
          <text x={cx} y={712} textAnchor="middle" fill={C.red} fontSize={26} fontWeight={600} opacity={prog(t, 14)}>
            평균 0 을 따라가면 상자에 부딪힌다
          </text>
          <text x={cx + 50} y={648} fill={C.muted} fontSize={22} opacity={prog(t, 0.8)}>
            로봇
          </text>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={400} at={6.5} title={<Head color={C.accent}>MSE · 두 오차 제곱의 평균</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          {rows.map(([a, f, v], i) => {
            const best = a === '0'
            const c = best ? C.green : C.blue
            return (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, 6.9 + i * 0.9) }}>
                <span style={{ ...mono(C.muted, 24), width: 140 }}>a = {a}</span>
                <span style={{ ...mono(C.text, 24), width: 290 }}>{f}</span>
                <div style={{ width: 180, height: 26, borderRadius: 8, background: C.grid }}>
                  <div style={{ width: `${(100 * v * prog(t, 7.1 + i * 0.9, 0.8)) / 2}%`, height: '100%', borderRadius: 8, background: c }} />
                </div>
                <span style={{ ...mono(c, 26), fontWeight: 600 }}>{v}</span>
              </div>
            )
          })}
          <span style={{ ...line(C.green, 24), fontWeight: 600, opacity: prog(t, 11.4) }}>a = 0 에서 1 로 가장 작다 → 학습한 모델은 0 을 낸다</span>
        </div>
      </Box>
      <Box x={996} y={570} w={860} h={310} at={19.5} color={`${C.accent}66`} title={<Head color={C.accent}>multimodal → 생성 모델</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={line()}>정답이 여러 무리(mode)로 갈라진 데이터 = multimodal</span>
          <span style={{ ...line(C.red), opacity: prog(t, 20.6) }}>정답들의 평균은 어느 무리에도 속하지 않는다</span>
          <span style={{ ...line(C.green), opacity: prog(t, 22) }}>분포 자체를 배워 실행할 때마다 하나를 뽑는 모델 = 생성 모델</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function Gaps() {
  const t = useSec()
  const sx = (z: number) => 60 + ((z + 5) / 16) * 980
  const zeros = [-3.4, -3.1, -2.8, -2.6, -3.2]
  const ones = [3.6, 3.9, 4.2, 4.4, 4.0]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={320}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 18 }}>
          <Head color={C.accent}>autoencoder · 입력 자신을 정답으로 삼아 되살린다</Head>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Pill color={C.blue} at={0.6}>
              <span>
                그림 x <span style={{ fontFamily: MONO }}>(0.4, 0.6, 0.5)</span>
              </span>
            </Pill>
            <Arrow at={1} />
            <Pill color={C.purple} at={1.3}>
              encoder · 평균
            </Pill>
            <Arrow at={1.8} />
            <Pill color={C.accent} at={2.1}>
              <span>
                latent <span style={{ fontFamily: MONO }}>z = 0.5</span>
              </span>
            </Pill>
            <Arrow at={2.6} />
            <Pill color={C.purple} at={2.9}>
              decoder · 세 번 적기
            </Pill>
            <Arrow at={3.4} />
            <Pill color={C.blue} at={3.7}>
              <span>
                되살린 그림 <span style={{ fontFamily: MONO }}>(0.5, 0.5, 0.5)</span>
              </span>
            </Pill>
          </div>
          <div style={{ opacity: prog(t, 8.5) }}>
            <span style={line(C.text, 26)}>
              reconstruction loss: 차이 <span style={{ fontFamily: MONO }}>0.1, −0.1, 0</span> → 제곱의 합{' '}
              <span style={{ fontFamily: MONO, color: C.orange, fontWeight: 600 }}>0.01 + 0.01 + 0 = 0.02</span>
            </span>
          </div>
          <div style={{ opacity: prog(t, 10.6) }}>
            <span style={line(C.muted, 24)}>
              MNIST (PyTorch 공식 예제): <span style={{ fontFamily: MONO }}>784 → 400 → 20</span> 으로 줄이고 <span style={{ fontFamily: MONO }}>20 → 400 → 784</span> 로 되살린다
            </span>
          </div>
        </div>
      </Panel>
      <Panel x={64} y={490} w={1100} h={390} style={{ opacity: prog(t, 12.8) }}>
        <svg width={1100} height={390}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600}>
            1 차원 latent 직선 (예)
          </text>
          <line x1={sx(-5)} x2={sx(11)} y1={200} y2={200} stroke={C.muted} strokeWidth={3} />
          {zeros.map((z) => (
            <circle key={z} cx={sx(z)} cy={200} r={9} fill={C.blue} opacity={prog(t, 13.4)} />
          ))}
          {ones.map((z) => (
            <circle key={z} cx={sx(z)} cy={200} r={9} fill={C.green} opacity={prog(t, 14.4)} />
          ))}
          <text x={sx(-3)} y={160} textAnchor="middle" fill={C.blue} fontSize={24} fontWeight={600} opacity={prog(t, 13.4)}>
            0 그림
          </text>
          <text x={sx(4)} y={160} textAnchor="middle" fill={C.green} fontSize={24} fontWeight={600} opacity={prog(t, 14.4)}>
            1 그림
          </text>
          <g opacity={prog(t, 15.6)}>
            <circle cx={sx(0.5)} cy={200} r={14} fill="none" stroke={C.red} strokeWidth={3} strokeDasharray="5 5" />
            <text x={sx(0.5)} y={160} textAnchor="middle" fill={C.red} fontSize={24} fontWeight={600}>
              빈 곳
            </text>
            <circle cx={sx(10)} cy={200} r={14} fill="none" stroke={C.red} strokeWidth={3} strokeDasharray="5 5" />
            <text x={sx(10)} y={160} textAnchor="middle" fill={C.red} fontSize={24} fontWeight={600}>
              범위 밖
            </text>
          </g>
          {[
            [-3, '−3'],
            [0.5, '0.5'],
            [4, '4'],
            [10, '10'],
          ].map(([z, l]) => (
            <text key={l as string} x={sx(z as number)} y={250} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              {l as string}
            </text>
          ))}
          <text x={30} y={310} fill={C.text} fontSize={24} opacity={prog(t, 16.4)}>
            decoder 가 학습 중 받아 본 적 없는 자리 → 숫자가 아닌 얼룩이 나올 수 있다
          </text>
          <text x={30} y={352} fill={C.muted} fontSize={24} opacity={prog(t, 19.5)}>
            loss 식에는 z 가 latent space 의 어디에 놓일지가 없다
          </text>
        </svg>
      </Panel>
      <Box x={1196} y={490} w={660} h={390} at={19.8} color={`${C.accent}66`} title={<Head color={C.accent}>생성 모델로 쓰려면</Head>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <span style={line()}>① 그림들의 z 가 빈 곳 없이 이어져 한 영역을 채운다</span>
          <span style={{ ...line(), opacity: prog(t, 21.4) }}>② 그 영역의 모양이 N(0, I) 처럼 뽑기 쉬운 분포와 같다</span>
          <span style={{ ...line(C.green), fontWeight: 600, opacity: prog(t, 23.2) }}>N(0, I) 에서 뽑은 z → decoder → 새 그림</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S2: Gaussian encoder and reparameterization ----------

function Encoder() {
  const t = useSec()
  const sx = (z: number) => 200 + ((z + 3) / 6) * 1400
  const sp = 1400 / 6 / 2 // σ = 0.5 in px
  const baseB = 370
  const draws = [-0.8, -1.7, -0.6, -1.2]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={460}>
        <svg width={1792} height={460}>
          {/* autoencoder row */}
          <g opacity={prog(t, 0.4)}>
            <text x={30} y={118} fill={C.muted} fontSize={24} fontWeight={600}>
              autoencoder
            </text>
            <text x={30} y={148} fill={C.dim} fontSize={22}>
              점 하나
            </text>
            <line x1={sx(-3)} x2={sx(3)} y1={110} y2={110} stroke={C.cardEdge} strokeWidth={2} />
            <circle cx={sx(-1)} cy={110} r={10} fill={C.blue} />
            <circle cx={sx(1)} cy={110} r={10} fill={C.green} />
            <text x={sx(-1)} y={84} textAnchor="middle" fill={C.blue} fontSize={22}>
              0 그림
            </text>
            <text x={sx(1)} y={84} textAnchor="middle" fill={C.green} fontSize={22}>
              1 그림
            </text>
          </g>
          {/* VAE row */}
          <g opacity={prog(t, 2.5)}>
            <text x={30} y={baseB + 8} fill={C.accent} fontSize={24} fontWeight={600}>
              VAE
            </text>
            <text x={30} y={baseB + 38} fill={C.dim} fontSize={22}>
              범위 하나
            </text>
            <line x1={sx(-3)} x2={sx(3)} y1={baseB} y2={baseB} stroke={C.muted} strokeWidth={2.5} />
            {[-2, -1, 0, 1, 2].map((z) => (
              <g key={z}>
                <line x1={sx(z)} x2={sx(z)} y1={baseB - 8} y2={baseB + 8} stroke={C.muted} strokeWidth={2} />
                <text x={sx(z)} y={baseB + 36} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {z < 0 ? `−${-z}` : z}
                </text>
              </g>
            ))}
          </g>
          <g opacity={prog(t, 6.6)}>
            <path d={bellArea(sx(-1), sp, 180, baseB)} fill={`${C.blue}26`} stroke={C.blue} strokeWidth={3} />
            <text x={sx(-1)} y={baseB - 194} textAnchor="middle" fill={C.blue} fontSize={24} fontFamily={MONO} fontWeight={600}>
              N(−1, 0.5²)
            </text>
            <text x={sx(-2) - 30} y={baseB - 70} textAnchor="end" fill={C.blue} fontSize={22}>
              0 그림 · 95%: −2 ~ 0
            </text>
          </g>
          {draws.map((z, i) => (
            <circle key={z} cx={sx(z)} cy={baseB} r={8} fill={C.orange} opacity={prog(t, 8.4 + i * 0.5)} />
          ))}
          <text x={sx(-1)} y={baseB + 76} textAnchor="middle" fill={C.orange} fontSize={22} opacity={prog(t, 8.4)}>
            이 그림을 네 번 볼 때 뽑힌 z: −0.8 · −1.7 · −0.6 · −1.2
          </text>
          <g opacity={prog(t, 13)}>
            <path d={bellArea(sx(1), sp, 180, baseB)} fill={`${C.green}26`} stroke={C.green} strokeWidth={3} />
            <text x={sx(1)} y={baseB - 194} textAnchor="middle" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              N(1, 0.5²)
            </text>
            <text x={sx(2) + 30} y={baseB - 70} fill={C.green} fontSize={22}>
              1 그림 · 95%: 0 ~ 2
            </text>
          </g>
          <g opacity={prog(t, 16)}>
            <text x={sx(0)} y={baseB - 112} textAnchor="middle" fill={C.accent} fontSize={22} fontWeight={600}>
              0 에서 맞닿음
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={64} y={630} w={880} h={250} at={17.2} title={<Head color={C.accent}>encoder 가 실제로 내는 값</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={line()}>σ 는 0 보다 커야 해서 μ 와 logvar = log σ² 을 낸다</span>
          <span style={mono(C.muted, 22)}>logvar −1.386 → σ 0.5 · logvar 0 → σ 1</span>
        </div>
      </Box>
      <Box x={976} y={630} w={880} h={250} at={19.3} color={`${C.accent}66`} title={<Head color={C.accent}>prior 와 posterior</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={line()}>
            <b style={{ color: C.green }}>prior</b> p(z) = N(0, I) · 학습 전에 정해 둔 분포
          </span>
          <span style={{ ...line(), opacity: prog(t, 22) }}>
            <b style={{ color: C.blue }}>posterior</b> q(z | x) · encoder 가 그림 x 를 보고 낸 분포
          </span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function Reparam() {
  const t = useSec()
  const rows: [string, string, string][] = [
    ['−1', '−2', '−1.5'],
    ['0', '0', '0.5'],
    ['0.3', '0.6', '1.1'],
    ['1', '2', '2.5'],
  ]
  const calc: [string, string, number][] = [
    ['L = (z − 2)²', C.muted, 18.6],
    ['z = 0.5 + 2 × 0.3 = 1.1', C.text, 19.6],
    ['∂L/∂z = 2 × (1.1 − 2) = −1.8', C.text, 21],
    ['∂z/∂μ = 1   → ∂L/∂μ = −1.8', C.green, 25],
    ['∂z/∂σ = 0.3 → ∂L/∂σ = −0.54', C.green, 27],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <div style={{ padding: '24px 30px', display: 'grid', gap: 16 }}>
          <Head color={C.red}>바로 뽑으면</Head>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Pill color={C.purple} at={0.6}>
              μ, σ
            </Pill>
            <Arrow at={0.9} />
            <Pill color={C.red} at={1.2}>
              N(μ, σ²) 에서 뽑기
            </Pill>
            <Arrow at={1.5} />
            <Pill color={C.accent} at={1.8}>
              z
            </Pill>
          </div>
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 2.6) }}>μ 0.5 · σ 2 에서 1.1, μ 만 0.51 로 바꿔 다시 뽑으면 −2.3</span>
          <span style={{ ...line(C.red, 24), fontWeight: 600, opacity: prog(t, 4.2) }}>✕ 변화는 μ 의 효과가 아니라 운 → encoder 로 gradient 가 끊긴다</span>
          <div style={{ height: 2, background: C.cardEdge, margin: '8px 0', opacity: prog(t, 6.5) }} />
          <div style={{ opacity: prog(t, 6.5) }}>
            <Head color={C.green}>reparameterization trick</Head>
          </div>
          <Pill color={C.orange} at={7} style={{ justifySelf: 'start' }}>
            ε ~ N(0, 1) · 바깥에서 먼저 뽑기
          </Pill>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Pill color={C.purple} at={8}>
              μ, σ
            </Pill>
            <Arrow at={8.3} />
            <Pill color={C.accent} at={8.6}>
              <span style={{ fontFamily: MONO }}>z = μ + σ × ε</span>
            </Pill>
            <Arrow at={8.9} />
            <Pill color={C.blue} at={9.2}>
              decoder · loss
            </Pill>
          </div>
          <span style={{ ...line(C.green, 24), fontWeight: 600, opacity: prog(t, 10) }}>✓ 무작위성은 ε 한 곳 · 뽑은 뒤의 z 는 곱하고 더한 값</span>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 25) }}>∂z/∂μ = 1 · ∂z/∂σ = ε</span>
        </div>
      </Panel>
      <Box x={996} y={140} w={860} h={330} at={12.6} title={<Head color={C.accent}>μ = 0.5, σ = 2 로 옮기고 넓히기</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {['뽑은 ε', 'σ × ε', 'z = μ + σ × ε'].map((h, i) => (
              <span key={h} style={{ ...line(C.muted, 22), width: i === 2 ? 300 : 200, fontFamily: MONO }}>
                {h}
              </span>
            ))}
          </div>
          {rows.map(([e, se, z], i) => (
            <div key={e} style={{ display: 'flex', gap: 16, opacity: prog(t, 13 + i * 0.7) }}>
              <span style={{ ...mono(C.orange, 24), width: 200 }}>{e}</span>
              <span style={{ ...mono(C.text, 24), width: 200 }}>{se}</span>
              <span style={{ ...mono(C.accent, 24), width: 300, fontWeight: 600 }}>{z}</span>
            </div>
          ))}
        </div>
      </Box>
      <Box x={996} y={500} w={860} h={380} at={18.4} title={<Head color={C.accent}>gradient 를 숫자로 · ε = 0.3</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          {calc.map(([s, c, at]) => (
            <span key={s} style={{ ...mono(c, 24), opacity: prog(t, at), fontWeight: c === C.green ? 600 : 400 }}>
              {s}
            </span>
          ))}
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S3: KL, ELBO and β ----------

function Kl() {
  const t = useSec()
  // plot frames inside the KL panel
  const y = (kl: number) => 400 - (kl / 2.2) * 240
  const x1 = (m: number) => 60 + ((m + 2.3) / 4.6) * 340
  const x2 = (s: number) => 500 + ((s - 0.3) / 2.1) * 340
  const muCurve = Array.from({ length: 47 }, (_, i) => -2.3 + i * 0.1).map((m) => `${x1(m).toFixed(1)},${y((m * m) / 2).toFixed(1)}`)
  const sgCurve = Array.from({ length: 43 }, (_, i) => 0.3 + i * 0.05).map((s) => `${x2(s).toFixed(1)},${y(0.5 * (s * s - Math.log(s * s) - 1)).toFixed(1)}`)
  const muPts: [number, number, string][] = [
    [-2, 2, '2'],
    [-1, 0.5, '0.5'],
    [0, 0, '0'],
    [1, 0.5, '0.5'],
    [2, 2, '2'],
  ]
  const sgPts: [number, number, string, 'start' | 'end' | 'middle'][] = [
    [0.5, 0.318, '0.318', 'start'],
    [1, 0, '0', 'middle'],
    [2, 0.807, '0.807', 'end'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={330} at={0.3} title={<Head color={C.accent}>loss = reconstruction 항 + KL 항</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={{ ...line(), opacity: prog(t, 6.4) }}>
            회색 그림 <span style={{ fontFamily: MONO }}>(0.6, 0.6, 0.6)</span> · encoder: <span style={{ fontFamily: MONO }}>μ 0.6, σ 0.1</span>
          </span>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 7.4) }}>ε = 0  → z = 0.6 → loss 0</span>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 8.6) }}>ε = −2 → z = 0.4 → 3 × 0.2² = 0.12</span>
          <span style={{ ...line(C.orange), fontWeight: 600, opacity: prog(t, 10.2) }}>reconstruction 항만 있으면 σ 를 0 쪽으로 줄인다</span>
        </div>
      </Box>
      <Panel x={956} y={140} w={900} h={460} style={{ opacity: prog(t, 12.8) }}>
        <svg width={900} height={460}>
          <text x={30} y={50} fill={C.accent} fontSize={26} fontFamily={MONO} fontWeight={600}>
            KL = ½(μ² + σ² − log σ² − 1)
          </text>
          <text x={30} y={88} fill={C.muted} fontSize={22}>
            N(μ, σ²) 와 prior N(0, 1) 사이의 KL
          </text>
          <line x1={x1(-2.3)} x2={x1(2.3)} y1={400} y2={400} stroke={C.cardEdge} strokeWidth={2} />
          <line x1={x2(0.3)} x2={x2(2.4)} y1={400} y2={400} stroke={C.cardEdge} strokeWidth={2} />
          <path d={`M ${muCurve.join(' L ')}`} fill="none" stroke={C.blue} strokeWidth={3} />
          <path d={`M ${sgCurve.join(' L ')}`} fill="none" stroke={C.purple} strokeWidth={3} />
          {muPts.map(([m, k, l]) => (
            <g key={m} opacity={prog(t, 13.4)}>
              <circle cx={x1(m)} cy={y(k)} r={7} fill={C.blue} />
              <text x={x1(m) + (m < 0 ? 14 : m > 0 ? -14 : 0)} y={y(k) - 16} textAnchor={m < 0 ? 'start' : m > 0 ? 'end' : 'middle'} fill={C.blue} fontSize={22} fontFamily={MONO}>
                {l}
              </text>
            </g>
          ))}
          {sgPts.map(([s, k, l, a]) => (
            <g key={s} opacity={prog(t, 15.6)}>
              <circle cx={x2(s)} cy={y(k)} r={7} fill={C.purple} />
              <text x={x2(s) + (a === 'end' ? -14 : a === 'start' ? 14 : 0)} y={y(k) - 16} textAnchor={a} fill={C.purple} fontSize={22} fontFamily={MONO}>
                {l}
              </text>
            </g>
          ))}
          <text x={x1(0)} y={440} textAnchor="middle" fill={C.blue} fontSize={22}>
            μ 를 바꿈 (σ = 1)
          </text>
          <text x={x2(1.35)} y={440} textAnchor="middle" fill={C.purple} fontSize={22}>
            σ 를 바꿈 (μ = 0)
          </text>
        </svg>
      </Panel>
      <Box x={956} y={630} w={900} h={250} at={17.4} title={<Head color={C.accent}>KL 이 encoder 를 당기는 방향</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={line()}>μ → 0 쪽으로 (μ² 때문)</span>
          <span style={line()}>σ → 1 쪽으로 (1 보다 작으면 −log σ², 크면 σ² 이 KL 을 키움)</span>
        </div>
      </Box>
      <Box x={64} y={500} w={860} h={380} at={19.3} color={`${C.accent}66`} title={<Head color={C.accent}>ELBO (evidence lower bound)</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={line(C.muted)}>evidence log p(x): 모델이 그림 x 를 만들 확률의 log · 직접 계산할 수 없다</span>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 20.6) }}>log p(x) ≥ ELBO = −(reconstruction loss + KL)</span>
          <span style={{ ...mono(C.orange, 26), fontWeight: 600, opacity: prog(t, 22) }}>예: −(90 + 25) = −115 ≤ log p(x)</span>
          <span style={{ ...line(C.green), opacity: prog(t, 23.4) }}>ELBO 를 키우기 = 두 loss 의 합을 줄이기</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function BetaSketch({ kind, at }: { kind: 0 | 1 | 2; at: number }) {
  const t = useSec()
  const base = 230
  const titles = ['β = 0', 'β = 1', 'β 아주 큼']
  const notes = [
    ['σ → 0, μ 는 흩어짐', '빈 곳이 다시 생긴다'],
    ['범위들이 원점 근처에서', '겹쳐 빈 곳이 없다'],
    ['모두 N(0, 1) 하나로 겹침', 'posterior collapse'],
  ]
  const colors = [C.blue, C.green, C.orange]
  const mus = kind === 0 ? [40, 110, 180, 240] : kind === 1 ? [95, 130, 165] : [140, 140, 140]
  const sd = kind === 0 ? 5 : kind === 1 ? 28 : 40
  const hp = kind === 0 ? 120 : kind === 1 ? 90 : 80
  return (
    <div style={{ width: 280, height: 360, borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}`, opacity: prog(t, at), overflow: 'hidden' }}>
      <svg width={280} height={360}>
        <text x={140} y={44} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={600} fontFamily={MONO}>
          {titles[kind]}
        </text>
        <line x1={20} x2={260} y1={base} y2={base} stroke={C.muted} strokeWidth={2} />
        {mus.map((m, i) => (
          <path key={i} d={bell(m, sd, hp, base, 3)} fill="none" stroke={colors[i % 3]} strokeWidth={kind === 2 ? 4 : 2.5} opacity={0.9} />
        ))}
        <text x={140} y={290} textAnchor="middle" fill={kind === 2 ? C.red : C.muted} fontSize={21}>
          {notes[kind][0]}
        </text>
        <text x={140} y={322} textAnchor="middle" fill={kind === 2 ? C.red : C.muted} fontSize={21} fontWeight={kind === 2 ? 600 : 400}>
          {notes[kind][1]}
        </text>
      </svg>
    </div>
  )
}

function Beta() {
  const t = useSec()
  const rows: [string, string, string, string, string, string][] = [
    ['A', '3', '0.1', '0.01', '6.308', '6.318'],
    ['B', '1', '0.5', '0.2', '0.818', '1.018'],
  ]
  const widths = [110, 80, 100, 160, 140, 140]
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 140, display: 'flex', alignItems: 'center', gap: 26 }}>
        <Appear at={0.3}>
          <span style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600 }}>
            L = L<sub style={{ fontSize: 24 }}>rec</sub> + <span style={{ color: C.accent }}>β</span> · KL
          </span>
        </Appear>
        <Chip at={3.2} mono>
          VAE 논문 β = 1
        </Chip>
        <Chip at={4.4} color={C.orange} mono>
          ACT β = 10
        </Chip>
      </div>
      <Box x={64} y={240} w={860} h={360} at={6.3} title={<Head color={C.accent}>β = 1 일 때 encoder 두 개</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {['encoder', 'μ', 'σ', 'rec loss', 'KL', 'loss'].map((h, i) => (
              <span key={h} style={{ ...line(C.muted, 22), width: widths[i] }}>
                {h}
              </span>
            ))}
          </div>
          {rows.map((r, j) => (
            <div key={r[0]} style={{ display: 'flex', gap: 10, opacity: prog(t, 6.8 + j * 2.2) }}>
              {r.map((v, i) => (
                <span key={i} style={{ ...mono(i === 5 ? (j === 1 ? C.green : C.red) : C.text, 24), width: widths[i], fontWeight: i === 5 ? 600 : 400 }}>
                  {v}
                </span>
              ))}
            </div>
          ))}
          <span style={{ ...mono(C.muted, 22), opacity: prog(t, 8) }}>KL A = ½(9 + 0.01 + 4.605 − 1) = 6.308</span>
          <span style={{ ...mono(C.muted, 22), opacity: prog(t, 10.2) }}>KL B = ½(1 + 0.25 + 1.386 − 1) = 0.818</span>
          <span style={{ ...line(C.green), opacity: prog(t, 11.2) }}>B 는 덜 정확해도 KL 이 작아서 loss 가 훨씬 작다</span>
        </div>
      </Box>
      <div style={{ position: 'absolute', left: 956, top: 240, display: 'flex', gap: 30 }}>
        <BetaSketch kind={0} at={12.6} />
        <BetaSketch kind={1} at={15.4} />
        <BetaSketch kind={2} at={18.6} />
      </div>
      <Box x={64} y={630} w={1792} h={250} at={24.7} color={`${C.orange}66`} title={<Head color={C.orange}>LeRobot 의 ACT 구현에서 두 항의 비율</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={line()}>
            reconstruction: L1 을 <span style={{ fontFamily: MONO }}>100 step × 관절 목표 14 개 = 1400</span> 개 숫자로 평균 · KL: 32 차원을 더한 뒤 <span style={{ fontFamily: MONO }}>× 10</span>
          </span>
          <span style={{ ...line(), opacity: prog(t, 27) }}>
            L1 을 더한 loss 기준 KL 의 무게 <span style={{ fontFamily: MONO, color: C.orange, fontWeight: 600 }}>1400 × 10 = 14,000</span> 배 → z 에 담기는 정보가 적어진다
          </span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S4: CVAE and ACT ----------

function Cvae() {
  const t = useSec()
  const rows: [string, string, string][] = [
    ['되살릴 x', '손글씨 그림', 'action chunk (100 step × 관절 목표 14 개)'],
    ['encoder 입력', '그림 · 숫자 label', '시연 action chunk · 관절 위치'],
    ['decoder 입력', 'z · 숫자 label', 'z · 카메라 이미지 · 관절 위치'],
    ['latent z', '2 차원 (예)', '32 차원'],
    ['rec loss', 'BCE 의 합', 'L1 (오차의 절댓값)'],
    ['KL 의 weight β', '1', '10'],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={250}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Pill color={C.blue} at={0.6}>
              그림 x · 조건 c
            </Pill>
            <Arrow at={0.9} />
            <Pill color={C.purple} at={1.2}>
              encoder q(z | x, c)
            </Pill>
            <Arrow at={1.5} />
            <Pill color={C.accent} at={1.8}>
              μ, σ → z
            </Pill>
            <Arrow at={2.1} />
            <Pill color={C.purple} at={2.4}>
              decoder p(x | z, c)
            </Pill>
            <Arrow at={2.7} />
            <Pill color={C.blue} at={3}>
              조건 c 의 그림
            </Pill>
          </div>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 3.6) }}>
            MNIST 의 조건 c: 숫자 7 = one-hot <span style={{ fontFamily: MONO }}>(0, 0, 0, 0, 0, 0, 0, 1, 0, 0)</span>
          </span>
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 4.6) }}>z 에는 굵기·기울기처럼 c 로 정해지지 않는 성질이 담기기를 기대한다</span>
        </div>
      </Panel>
      <Box x={64} y={420} w={1100} h={460} at={6.3} title={<Head color={C.accent}>MNIST CVAE 와 ACT</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {['항목', 'MNIST CVAE', 'ACT'].map((h, i) => (
              <span key={h} style={{ ...line(C.muted, 22), width: [180, 280, 540][i] }}>
                {h}
              </span>
            ))}
          </div>
          {rows.map(([a, b, c], i) => (
            <div key={a} style={{ display: 'flex', gap: 16, opacity: prog(t, 6.6 + i * 0.8) }}>
              <span style={{ ...line(C.muted, 22), width: 180, whiteSpace: 'nowrap' }}>{a}</span>
              <span style={{ ...line(C.text, 22), width: 280, whiteSpace: 'nowrap' }}>{b}</span>
              <span style={{ ...line(C.orange, 22), width: 540, whiteSpace: 'nowrap', fontWeight: 600 }}>{c}</span>
            </div>
          ))}
        </div>
      </Box>
      <Box x={1196} y={420} w={660} h={240} at={12.6} color={`${C.accent}66`} title={<Head color={C.accent}>학습 때 encoder 가 z 에 담는 것</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={line(C.text, 22)}>같은 장면에서도 시연마다 달라지는 움직임 (큐브 위에서 멈췄는지)</span>
          <span style={{ ...line(C.green, 22), opacity: prog(t, 15.4) }}>→ 정답 chunk 가 여럿이어도 policy 는 평균을 낼 필요가 없다</span>
        </div>
      </Box>
      <Box x={1196} y={680} w={660} h={200} at={19} title={<Head color={C.accent}>CVAE 를 빼면 · 사람 시연</Head>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Bar label="CVAE 있음" value={35.3} max={40} color={C.green} at={19.4} width={260} unit="%" labelW={140} />
          <Bar label="CVAE 없음" value={2} max={40} color={C.red} at={20.6} width={260} unit="%" labelW={140} />
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function ActRun() {
  const t = useSec()
  const col = (items: [ReactNode, string, number][]) => (
    <div style={{ display: 'grid', justifyItems: 'start' }}>
      {items.map(([s, c, at], i) => (
        <div key={i} style={{ display: 'grid', justifyItems: 'start' }}>
          {i > 0 && (
            <span style={{ marginLeft: 30 }}>
              <Arrow at={at - 0.2} down />
            </span>
          )}
          <Pill color={c} at={at}>
            {s}
          </Pill>
        </div>
      ))}
    </div>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={430} at={0.3} title={<Head color={C.accent}>학습할 때</Head>}>
        {col([
          ['encoder ← 시연 action chunk · 관절 위치', C.purple, 0.6],
          [<span style={{ fontFamily: MONO }}>μ, σ → z = μ + σ ⊙ ε</span>, C.accent, 1.4],
          ['policy ← z · 카메라 이미지 · 관절 위치', C.blue, 2.2],
          ['action chunk · L1 + β × KL 로 학습', C.green, 3],
        ])}
      </Box>
      <Box x={976} y={140} w={880} h={430} at={6.3} color={`${C.orange}88`} title={<Head color={C.orange}>로봇을 움직일 때</Head>}>
        {col([
          ['encoder ✕ · 넣을 시연 action chunk 가 없다', C.red, 6.6],
          [<span style={{ fontFamily: MONO }}>z = 0 (prior 의 평균)</span>, C.accent, 7.6],
          ['policy ← z · 카메라 이미지 · 관절 위치', C.blue, 8.6],
          ['같은 관측 → 늘 같은 action chunk', C.green, 13],
        ])}
      </Box>
      <Box x={64} y={600} w={1100} h={280} at={14.6} title={<Head color={C.accent}>오해와 사실</Head>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <span style={{ ...line(C.red, 26) }}>✕ ACT 는 실행할 때마다 z 를 뽑아 여러 움직임 중 하나를 고른다</span>
          <span style={{ ...line(C.green, 26), opacity: prog(t, 16.4) }}>✓ encoder 는 학습 때만 쓰고, 실행할 때는 z 를 0 하나로 고정한다</span>
        </div>
      </Box>
      <Box x={1196} y={600} w={660} h={280} at={19.3} color={`${C.red}66`} title={<Head color={C.red}>한계</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={line(C.text, 23)}>시연이 왼쪽 잡기와 오른쪽 잡기로 반반 갈림</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 20.8) }}>z = 0 하나 · β = 10 이라 z 의 정보도 적다</span>
          <span style={{ ...line(C.red, 23), fontWeight: 600, opacity: prog(t, 22.4) }}>→ 둘 중 하나를 고른다는 보장이 없다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: '정답 하나는 평균 0 → 충돌 · autoencoder 는 −3 과 4 사이 0.5 가 빈 곳', at: 0.4 },
    { tag: script.sections[1], color: C.blue, text: 'z = μ + σ ⊙ ε · ∂z/∂μ = 1, ∂z/∂σ = ε 이라 gradient 가 encoder 까지', at: 4.2 },
    { tag: script.sections[2], color: C.orange, text: 'loss = rec + β · KL · β 가 0 이면 빈 곳, 너무 크면 posterior collapse', at: 8 },
    { tag: script.sections[3], color: C.red, text: 'β = 10 CVAE · 실행할 때는 encoder 없이 z = 0 · CVAE 를 빼면 35.3% → 2%', at: 11.8 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            시연이 퍼진 모양을 배워 하나를 뽑으려면 무엇을 학습해야 할까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 24, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 30, fontWeight: 600 }}>{it.text}</span>
              </div>
            </div>
          </Appear>
        ))}
      </div>
    </AbsoluteFill>
  )
}

function Outro() {
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 22, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.16em' }}>
            NEXT
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>DDPM · ACT · World Model</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={32}>
            작은 noise 제거 단계로 선명한 sample · CVAE 로 양팔 로봇 policy · latent 안에서 다음 장면 예측
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · Kingma &amp; Welling (2013, 2019) · Sohn 외 (2015)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseAverage = () => (
  <PauseWrite
    question="시연의 정답이 +2, +2, −2, −2 일 때 MSE 를 가장 작게 하는 예측은 얼마이고, 그 예측은 시연 중 몇 개와 같을까?"
    answer={
      <>
        정답들의 평균 (2 + 2 − 2 − 2) ÷ 4 = 0
        <br />
        시연 네 개 중 0 인 것은 하나도 없다
      </>
    }
  />
)

const PauseReparam = () => (
  <PauseWrite
    question="μ = 1, σ = 0.5 이고 뽑은 ε = 2 일 때 z 와 ∂z/∂σ 는?"
    answer={
      <>
        z = μ + σ × ε = 1 + 0.5 × 2 = 2
        <br />
        ∂z/∂σ 는 ε 과 같으므로 2
      </>
    }
  />
)

const PauseBeta = () => (
  <PauseWrite
    question="reconstruction loss 가 100, KL 이 20 인 그림의 loss 는 β = 1 일 때와 β = 4 일 때 각각 얼마일까?"
    answer={
      <>
        β = 1: 100 + 1 × 20 = 120 · β = 4: 100 + 4 × 20 = 180
        <br />
        β = 4 면 KL 이 1 줄 때 loss 가 4 줄어, 학습은 KL 을 줄이는 쪽에 무게를 둔다
      </>
    }
  />
)

const PauseAct = () => (
  <PauseWrite
    question="ACT 의 CVAE encoder 가 한 차원에서 μ = 0.5, σ = 1 을 냈다. 이 차원의 KL 과, β = 10 을 곱해 loss 에 더해지는 값은?"
    answer={
      <>
        KL = ½(0.5² + 1 − 0 − 1) = ½ × 0.25 = 0.125
        <br />β 를 곱한 값: 10 × 0.125 = 1.25
      </>
    }
  />
)

export function Vae() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        average: Average,
        gaps: Gaps,
        'pause-average': PauseAverage,
        encoder: Encoder,
        reparam: Reparam,
        'pause-reparam': PauseReparam,
        kl: Kl,
        beta: Beta,
        'pause-beta': PauseBeta,
        cvae: Cvae,
        'act-run': ActRun,
        'pause-act': PauseAct,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
