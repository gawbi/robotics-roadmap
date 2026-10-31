import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './world-model.narration.json'
import { script } from './world-model.script'

// Numbers follow lessons/world-model/README.md (see world-model.script.ts). The rail, the candidate paths and the CEM curves
// are redrawn from the lesson's figures; curve heights in the CEM panel are schematic (marked 모식도).

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 27 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 300, fmt, sub, labelW = 170 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; fmt?: string; sub?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 23, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 25, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>{fmt ?? value}</span>
      {sub && <span style={{ fontSize: 21, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>{sub}</span>}
    </div>
  )
}

function Box({ x, y, w, h, title, color = C.cardEdge, at, gap = 14, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; gap?: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap }}>
        {title && <div>{title}</div>}
        {children}
      </div>
    </Appear>
  )
}

function Flow({ steps, color, at, gap = 0.5 }: { steps: string[]; color: string; at: number; gap?: number }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
    </div>
  )
}

/** a Panel that fades in at `at`, so a card is never shown empty before its cue */
function Card({ x, y, w, h, at, children }: { x: number; y: number; w: number; h: number; at: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w, height: h }}>
      <Panel x={0} y={0} w={w} h={h}>
        {children}
      </Panel>
    </Appear>
  )
}

const line = (color = C.text, size = 22): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 11, opacity = 1) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - head * Math.cos(a)
  const hy = y2 - head * Math.sin(a)
  const s = Math.sin(a) * (head / 2)
  const c = Math.cos(a) * (head / 2)
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + s},${hy - c} ${hx - s},${hy + c}`} fill={color} />
    </g>
  )
}

/** a text table; columns listed in `monoCols` use the mono font */
function Table({ head, rows, widths, at, step = 0.5, size = 22, colors, monoCols = [], align }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; monoCols?: number[]; align?: ('left' | 'right')[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: monoCols.includes(i) ? MONO : undefined, fontSize: size, whiteSpace: 'nowrap', textAlign: align?.[i] ?? 'left', paddingRight: 12, boxSizing: 'border-box' })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 2 }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', opacity: prog(t, at + 0.3 + k * step), color: colors?.[k] ?? C.text }}>
          {r.map((v, i) => (
            <span key={i} style={cell(i)}>
              {v}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            FRONTIER · WORLD MODEL
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>World Model</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            지금 장면 + 행동 → <span style={{ color: C.accent }}>다음 장면 + reward</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={38}>
            실제로 움직이기 전에, 배운 model 안에서 행동을 미리 비교한다
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
  const stages: [string, boolean][] = [
    ['뒤집힌 자세', true],
    ['몸 굴리기', true],
    ['일어서기', false],
    ['걷기', false],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={290} at={0.3}>
        <div style={{ padding: '26px 34px', display: 'grid', gap: 22 }}>
          <Head color={C.text}>DayDreamer 실험 (2022 년 6 월) · 4 다리 로봇 A1 · 실제 바닥에서 1 시간</Head>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <span style={{ ...mono(C.red, 26), width: 300 }}>SAC (model-free)</span>
            {stages.map(([s, ok], i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: prog(t, 0.9 + i * 0.5) }}>
                <div style={{ padding: '12px 22px', borderRadius: 14, border: `1.5px solid ${ok ? C.green : C.red}88`, background: `${ok ? C.green : C.red}14`, fontSize: 26, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <span style={{ color: ok ? C.green : C.red, marginRight: 10 }}>{ok ? '✓' : '✕'}</span>
                  {s}
                </div>
                {i < stages.length - 1 && <span style={{ fontSize: 30, color: C.muted }}>→</span>}
              </div>
            ))}
          </div>
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 3) }}>같은 동작을 실제로 수없이 해 봐야 하는데, 1 시간으로는 몸을 굴리는 데서 멈췄다</span>
        </div>
      </Card>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 470, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          움직이기 전에 결과를 먼저 계산해 보면, <span style={{ color: C.accent }}>같은 1 시간으로 더 많이 배울 수 있을까?</span>
        </div>
      </Appear>
      <Card x={330} y={650} w={1260} h={180} at={5.4}>
        <div style={{ padding: '24px 34px', display: 'grid', gap: 18, justifyItems: 'center' }}>
          <Label size={23} color={C.muted}>
            실제로 해 보기 전에 컴퓨터 안에서 할 일
          </Label>
          <Flow steps={['행동 후보 여럿', '결과를 model 안에서 계산', '고른 행동만 실제로']} color={C.accent} at={5.8} />
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- section 1: world model 의 입출력 ----------

const REWARD = [-4, -3, -2, -1, 0, -1, -2, -3]

function Rail() {
  const t = useSec()
  const x0 = 380
  const cw = 150
  const cx = (k: number) => x0 + k * cw + cw / 2
  const moved = prog(t, 13.6, 0.8)
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1792} h={330} at={0.3}>
        <svg width={1792} height={330}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            여덟 칸 레일 · 충전기는 칸 4
          </text>
          <g opacity={prog(t, 6.6)}>
            <text x={1762} y={44} textAnchor="end" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
              {'reward = −|칸 − 4|'}
            </text>
          </g>
          {/* row labels */}
          <text x={x0 - 30} y={133} textAnchor="end" fill={C.muted} fontSize={22}>
            레일
          </text>
          <text x={x0 - 30} y={192} textAnchor="end" fill={C.muted} fontSize={22}>
            칸 번호
          </text>
          <text x={x0 - 30} y={238} textAnchor="end" fill={C.muted} fontSize={22}>
            카메라 이미지 o
          </text>
          <text x={x0 - 30} y={300} textAnchor="end" fill={C.orange} fontSize={22} opacity={prog(t, 6.6)}>
            reward
          </text>
          {REWARD.map((r, k) => (
            <g key={k}>
              <rect x={x0 + k * cw + 4} y={90} width={cw - 8} height={70} rx={10} fill={k === 4 ? `${C.orange}22` : C.grid} stroke={k === 4 ? C.orange : C.cardEdge} strokeWidth={2} />
              <text x={cx(k)} y={192} textAnchor="middle" fill={C.dim} fontSize={22} fontFamily={MONO}>
                {k}
              </text>
              <rect x={x0 + k * cw + 4} y={210} width={cw - 8} height={40} rx={4} fill={k === (moved > 0.5 ? 2 : 1) ? C.text : '#0f1626'} stroke={C.cardEdge} strokeWidth={1.5} />
              <text x={cx(k)} y={300} textAnchor="middle" fill={k === 4 ? C.green : C.orange} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 7 + k * 0.15)}>
                {r === 0 ? '0' : `−${-r}`}
              </text>
            </g>
          ))}
          <text x={cx(4)} y={132} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
            충전기
          </text>
          {/* robot at 칸 1, then the predicted robot at 칸 2 */}
          <circle cx={cx(1)} cy={125} r={22} fill={C.blue} opacity={1 - 0.6 * moved} />
          <g opacity={moved}>
            <circle cx={cx(2)} cy={125} r={22} fill="none" stroke={C.blue} strokeWidth={3} strokeDasharray="6 5" />
            {arrow(cx(1) + 10, 76, cx(2) - 10, 76, C.accent, 3)}
            <text x={cx(2) + 10} y={82} fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600}>
              +1
            </text>
          </g>
        </svg>
      </Card>
      <Box x={64} y={480} w={880} h={400} at={13.2} title={<Head color={C.accent}>world model 이 하는 일</Head>}>
        <svg width={824} height={150}>
          <g opacity={prog(t, 13.4)}>
            <rect x={0} y={10} width={230} height={50} rx={12} fill={`${C.blue}14`} stroke={C.blue} strokeWidth={1.5} />
            <text x={115} y={43} textAnchor="middle" fill={C.text} fontSize={22}>
              이미지: 칸 1
            </text>
            <rect x={0} y={90} width={230} height={50} rx={12} fill={`${C.accent}14`} stroke={C.accent} strokeWidth={1.5} />
            <text x={115} y={123} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO}>
              action +1
            </text>
            {arrow(236, 35, 296, 70, C.muted, 2.5)}
            {arrow(236, 115, 296, 80, C.muted, 2.5)}
            <rect x={300} y={30} width={220} height={90} rx={14} fill={C.card} stroke={C.accent} strokeWidth={2.5} />
            <text x={410} y={84} textAnchor="middle" fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600}>
              world model
            </text>
          </g>
          <g opacity={prog(t, 14.2)}>
            {arrow(524, 70, 584, 35, C.muted, 2.5)}
            {arrow(524, 80, 584, 115, C.muted, 2.5)}
            <rect x={590} y={10} width={234} height={50} rx={12} fill={`${C.blue}14`} stroke={C.blue} strokeWidth={1.5} strokeDasharray="6 5" />
            <text x={707} y={43} textAnchor="middle" fill={C.text} fontSize={22}>
              다음 이미지: 칸 2
            </text>
            <rect x={590} y={90} width={234} height={50} rx={12} fill={`${C.orange}14`} stroke={C.orange} strokeWidth={1.5} strokeDasharray="6 5" />
            <text x={707} y={123} textAnchor="middle" fill={C.text} fontSize={22} fontFamily={MONO}>
              reward −2
            </text>
          </g>
        </svg>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15.5) }}>입력에는 늘 행동이 들어가고, 출력은 늘 미래다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17) }}>같은 장면이라도 넣은 행동이 다르면 예측도 달라진다</span>
      </Box>
      <Box x={968} y={480} w={888} h={400} at={20.2} title={<Head color={C.purple}>이름에 world 가 들어가도</Head>}>
        <Table
          at={20.5}
          step={0.5}
          size={22}
          head={['이름', '입력', '출력', '']}
          widths={[220, 220, 300, 60]}
          monoCols={[0]}
          rows={[
            ['world model', '장면 + 행동', '다음 장면 + reward', '✓'],
            ['YOLO-World', '이미지 + 물체 이름', '지금 물체의 위치', '✕'],
            ['물리 simulator', '상태 + 행동', '다음 상태 (사람이 만든 식)', '△'],
            ['world frame', '없음', '없음', '✕'],
          ]}
          colors={[C.green, C.red, C.orange, C.red]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 23) }}>world model 은 이 규칙을 데이터로 배운다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Latent() {
  const t = useSec()
  const sq = (x: number, y: number, color: string, key: string | number, dashed = false) => <rect key={key} x={x} y={y} width={30} height={30} rx={5} fill={dashed ? 'none' : `${color}55`} stroke={color} strokeWidth={2} strokeDasharray={dashed ? '4 4' : undefined} />
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={360} at={0.3} title={<Head color={C.accent}>세 step 짜리 후보 넷을 비교하려면</Head>}>
        <svg width={824} height={190}>
          <g opacity={prog(t, 0.6)}>
            <text x={0} y={24} fill={C.red} fontSize={23} fontFamily={MONO} fontWeight={600}>
              model-free RL
            </text>
            {[0, 1, 2, 3].map((g) => (
              <g key={g}>
                {[0, 1, 2].map((k) => sq(g * 150 + k * 38, 42, C.red, k))}
                {g < 3 && (
                  <text x={g * 150 + 128} y={66} textAnchor="middle" fill={C.muted} fontSize={24}>
                    ↺
                  </text>
                )}
              </g>
            ))}
            <text x={620} y={66} fill={C.muted} fontSize={21}>
              실제 step 12 번
            </text>
          </g>
          <g opacity={prog(t, 2.6)}>
            <text x={0} y={122} fill={C.green} fontSize={23} fontFamily={MONO} fontWeight={600}>
              model-based RL
            </text>
            <rect x={0} y={138} width={300} height={44} rx={10} fill={`${C.accent}12`} stroke={C.accent} strokeWidth={1.5} strokeDasharray="6 5" />
            <text x={150} y={168} textAnchor="middle" fill={C.accent} fontSize={21}>
              world model 안에서 비교
            </text>
            {arrow(306, 160, 360, 160, C.muted, 2.5)}
            {[0, 1, 2].map((k) => sq(372 + k * 38, 145, C.green, k))}
            <text x={620} y={168} fill={C.muted} fontSize={21}>
              고른 하나만 실행
            </text>
          </g>
        </svg>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 1.4) }}>model-free: 후보 하나가 끝날 때마다 처음 자리로 되돌리기 ↺ 3 번</span>
      </Box>
      <Box x={968} y={130} w={888} h={360} at={7} title={<Head color={C.green}>sample efficiency · 이미지만 보는 cheetah 달리기</Head>}>
        <Label size={21} color={C.muted}>
          PlaNet 논문 (2018 년 11 월) · 점수
        </Label>
        <div style={{ display: 'grid', gap: 16 }}>
          <Bar label="PlaNet" value={662} max={700} color={C.green} at={7.6} sub="episode 1,000 개" />
          <Bar label="D4PG" value={524} max={700} color={C.red} at={9.2} sub="episode 100,000 개" />
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 11) }}>
          실제 경험 <span style={mono(C.accent, 23)}>100,000 ÷ 1,000 = 100</span> 배 적게 쓰고 점수는 더 높다
        </span>
      </Box>
      <Box x={64} y={510} w={880} h={370} at={14} gap={10} title={<Head color={C.blue}>latent · 이미지를 숫자 몇 개로</Head>}>
        <svg width={824} height={180}>
          <g opacity={prog(t, 14.3)}>
            {Array.from({ length: 64 }, (_, i) => {
              const r = Math.floor(i / 8)
              const c = i % 8
              const on = Math.hypot(c - 4.5, r - 2.5) < 1.6 || (c === 4 && r > 3)
              return <rect key={i} x={c * 19} y={r * 19} width={17} height={17} fill={on ? C.blue : '#16213a'} />
            })}
            <text x={0} y={176} fill={C.muted} fontSize={21} fontFamily={MONO}>
              64 × 64 × 3 = 12,288
            </text>
          </g>
          <g opacity={prog(t, 15.2)}>
            {arrow(170, 70, 228, 70, C.muted, 2.5)}
            <polygon points="240,20 380,45 380,95 240,120" fill={`${C.blue}18`} stroke={C.blue} strokeWidth={2} />
            <text x={308} y={78} textAnchor="middle" fill={C.blue} fontSize={22} fontFamily={MONO}>
              encoder
            </text>
            {arrow(390, 70, 446, 70, C.muted, 2.5)}
            {Array.from({ length: 30 }, (_, i) => (
              <rect key={i} x={456 + i * 12} y={70 - (12 + ((i * 37) % 40))} width={8} height={2 * (12 + ((i * 37) % 40))} rx={2} fill={C.accent} opacity={0.85} />
            ))}
            <text x={456} y={176} fill={C.accent} fontSize={21} fontFamily={MONO}>
              latent 30 개
            </text>
          </g>
        </svg>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 17) }}>
          PlaNet: <span style={mono(C.accent, 23)}>12,288 ÷ 30 ≈ 410</span> 분의 1 로 줄여 그 위에서 예측
        </span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 18.5) }}>RSSM: 지난 이미지를 요약한 확정 부분 200 개 + 무작위 부분 30 개</span>
      </Box>
      <Box x={968} y={510} w={888} h={370} at={21} title={<Head color={C.orange}>dynamics model f 와 reward model g</Head>}>
        <span style={{ ...mono(C.text, 25), opacity: prog(t, 21.3) }}>f(z, a) = z + w × a</span>
        <span style={{ ...mono(C.accent, 25), opacity: prog(t, 22.3) }}>z = 1, a = +1, w = 1 → 1 + 1 × 1 = 2</span>
        <span style={{ ...mono(C.orange, 25), opacity: prog(t, 23.5) }}>{'g(z) = −|z − 4| → −|2 − 4| = −2'}</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.8) }}>w 는 실제로 움직여 본 기록 (transition) 을 맞히도록 배운다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 26) }}>예측을 다시 f 에 넣으면 2, 3, 4 · reward −2, −1, 0 (상상 속 rollout)</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseIo = () => (
  <PauseWrite
    question="칸 1 에 있는 로봇의 이미지와 action −1 을 world model 에 넣으면, 무엇을 예측해야 하는가?"
    answer={
      <>
        {'다음 이미지: 칸 0 · reward −|0 − 4| = −4'}
        <br />
        출력은 늘 미래 · 행동이 바뀌면 예측도 바뀐다
      </>
    }
  />
)

// ---------- section 2: planning 과 CEM ----------

const PLAN_HEAD = ['후보', '행동열', '예측 latent', '예측 reward', '합']
const PLAN_W = [80, 210, 160, 230, 90]

function Plan() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={340} at={0.3} title={<Head color={C.accent}>칸 1 에서 출발 · H = 3 · w = 1</Head>}>
        <Table
          at={7}
          step={0.7}
          head={PLAN_HEAD}
          widths={PLAN_W}
          monoCols={[0, 1, 2, 3, 4]}
          rows={[
            ['A', '(+1, +1, +1)', '2, 3, 4', '−2, −1, 0', '−3'],
            ['B', '(+1, +1, 0)', '2, 3, 3', '−2, −1, −1', '−4'],
            ['C', '(+1, 0, 0)', '2, 2, 2', '−2, −2, −2', '−6'],
            ['D', '(0, 0, 0)', '1, 1, 1', '−3, −3, −3', '−9'],
          ]}
          colors={[C.green, undefined, undefined, undefined]}
        />
        <span style={{ ...line(C.green, 22), opacity: prog(t, 10.5) }}>합이 가장 큰 A 를 고른다 · 셋째 step 에 충전기에 닿는다</span>
      </Box>
      <Box x={968} y={130} w={888} h={340} at={14} title={<Head color={C.orange}>같은 후보로 칸 3 에서 출발</Head>}>
        <Table
          at={14.3}
          step={0.6}
          head={PLAN_HEAD}
          widths={PLAN_W}
          monoCols={[0, 1, 2, 3, 4]}
          rows={[
            ['A', '(+1, +1, +1)', '4, 5, 6', '0, −1, −2', '−3'],
            ['B', '(+1, +1, 0)', '4, 5, 5', '0, −1, −1', '−2'],
            ['C', '(+1, 0, 0)', '4, 4, 4', '0, 0, 0', '0'],
            ['D', '(0, 0, 0)', '3, 3, 3', '−1, −1, −1', '−3'],
          ]}
          colors={[undefined, undefined, C.green, undefined]}
        />
        <span style={{ ...line(C.orange, 22), opacity: prog(t, 17.5) }}>출발 자리가 바뀌면 가장 좋은 후보도 바뀐다 → 매번 새로</span>
      </Box>
      <div style={{ position: 'absolute', left: 64, top: 500, width: 1792 }}>
        <Misconception at={21} belief="planning 은 가능한 모든 행동열 가운데 가장 좋은 것을 찾는다" fact="만들어 본 후보 안에서만 고른다 · 위 표에 A 가 없었다면 B 를 골랐을 것이다" />
      </div>
      <Appear at={24} style={{ position: 'absolute', left: 64, top: 790, width: 1792 }}>
        <div style={{ padding: '14px 28px', borderRadius: 16, border: `1.5px solid ${C.cardEdge}`, background: C.card, fontSize: 24 }}>
          행동 3 가지 · H = 3 이면 <span style={mono(C.accent, 24)}>3 × 3 × 3 = 27</span> 개를 다 넣어 볼 수 있지만, 연속 action 이나 긴 H 는 후보를 잘 만들어야 한다
        </div>
      </Appear>
    </AbsoluteFill>
  )
}

const CEM_ITERS: [number, number, string, number][] = [
  [0, 2, C.dim, 7.5],
  [1.5, 0.5, C.blue, 14],
  [2.25, 0.25, C.purple, 15.8],
  [2.625, 0.125, C.green, 17.6],
]

function Cem() {
  const t = useSec()
  const ax = (a: number) => 60 + (a + 3) * (880 / 7)
  const base = 540
  const curve = (mu: number, sd: number) => {
    const hpk = 70 * Math.pow(2 / sd, 0.62)
    const pts: string[] = []
    for (let i = 0; i <= 200; i++) {
      const a = -3 + (7 * i) / 200
      pts.push(`${ax(a).toFixed(1)},${(base - hpk * Math.exp(-0.5 * ((a - mu) / sd) ** 2)).toFixed(1)}`)
    }
    return pts.join(' ')
  }
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 140 }}>
        <Flow steps={['분포에서 후보 뽑기', 'world model 로 점수', '점수 좋은 elite 고르기', 'elite 의 평균 · 표준편차로 새 분포']} color={C.accent} at={0.6} />
      </div>
      <Card x={64} y={260} w={1000} h={620} at={7}>
        <svg width={1000} height={620}>
          <text x={30} y={44} fill={C.text} fontSize={25} fontWeight={600}>
            후보를 뽑는 정규분포 · 칸 1 · H = 1
          </text>
          <text x={970} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            높이는 모식도
          </text>
          <line x1={60} x2={940} y1={base} y2={base} stroke={C.muted} strokeWidth={2} />
          {[-2, -1, 0, 1, 2, 3, 4].map((a) => (
            <g key={a}>
              <line x1={ax(a)} x2={ax(a)} y1={base} y2={base + 8} stroke={C.muted} strokeWidth={2} />
              <text x={ax(a)} y={base + 34} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
                {a < 0 ? `−${-a}` : a}
              </text>
            </g>
          ))}
          <text x={940} y={base + 66} textAnchor="end" fill={C.dim} fontSize={20}>
            action a
          </text>
          <g opacity={prog(t, 8.5)}>
            <line x1={ax(3)} x2={ax(3)} y1={150} y2={base} stroke={C.orange} strokeWidth={2} strokeDasharray="6 6" />
            <text x={ax(3) + 10} y={140} fill={C.orange} fontSize={22} fontWeight={600}>
              정답 a = 3
            </text>
          </g>
          {CEM_ITERS.map(([mu, sd, color, at], i) => (
            <g key={i} opacity={prog(t, at)}>
              <polyline points={curve(mu, sd)} fill="none" stroke={color} strokeWidth={3.5} />
              <rect x={40} y={86 + i * 36} width={18} height={18} rx={4} fill={color} />
              <text x={68} y={102 + i * 36} fill={color} fontSize={22} fontFamily={MONO} fontWeight={600}>
                {`${i < 3 ? `반복 ${i + 1}` : '마지막'}: μ ${mu}, σ ${sd}`}
              </text>
            </g>
          ))}
        </svg>
      </Card>
      <Box x={1088} y={260} w={768} h={350} at={13.5} title={<Head color={C.purple}>예로 뽑은 후보 4 개 · 상위 2 개가 elite</Head>}>
        <Table
          at={13.8}
          step={1.2}
          head={['반복', '뽑은 후보', 'elite', '새 μ', '새 σ']}
          widths={[64, 270, 140, 120, 110]}
          monoCols={[0, 1, 2, 3, 4]}
          rows={[
            ['1', '−2, −1, 1, 2', '1, 2', '1.5', '0.5'],
            ['2', '1, 1.5, 2, 2.5', '2, 2.5', '2.25', '0.25'],
            ['3', '2, 2.25, 2.5, 2.75', '2.5, 2.75', '2.625', '0.125'],
          ]}
          colors={[C.blue, C.purple, C.green]}
        />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 18.5) }}>점수 −|a − 3| · weight 는 그대로, gradient 없이 비교만</span>
        <span style={{ ...line(C.text, 21), opacity: prog(t, 19.2) }}>μ 는 3 에 다가가고 σ 는 좁아진다 · 마지막 μ 를 계획으로</span>
      </Box>
      <Box x={1088} y={630} w={768} h={250} at={20.5} title={<Head color={C.green}>PlaNet 의 CEM · 실제 step 하나마다</Head>}>
        <span style={{ ...mono(C.text, 23), opacity: prog(t, 20.8) }}>H 12 · 후보 1,000 · 반복 10 · elite 100</span>
        <span style={{ ...mono(C.accent, 24), opacity: prog(t, 22.2) }}>1,000 × 10 × 12 = 120,000 번 예측</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24) }}>latent 200 + 30 = 230 개 · 한 batch 로 GPU 에서 계산</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseCem = () => (
  <PauseWrite
    question="CEM 의 어떤 반복에서 elite 가 3 과 5 였다. 새 평균 μ 와 표준편차 σ 는?"
    answer={
      <>
        μ = (3 + 5) ÷ 2 = 4 · 평균에서 거리 −1, +1
        <br />
        분산 ((−1)² + 1²) ÷ 2 = 1 → σ = √1 = 1
      </>
    }
  />
)

// ---------- section 3: 오차 누적과 MPC ----------

function Compound() {
  const t = useSec()
  const sx = (k: number) => 120 + k * 226
  const sy = (z: number) => 640 - z * 80
  const real = [1, 2, 3, 4]
  const pred = [1, 2.5, 4, 5.5]
  const draw = (vals: number[], upto: number) =>
    vals
      .slice(0, upto + 1)
      .map((v, k) => `${sx(k)},${sy(v)}`)
      .join(' ')
  const shown = Math.min(3, Math.floor(prog(t, 1.5, 4.5) * 3.999))
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={750} at={0.3}>
        <svg width={900} height={750}>
          <text x={30} y={44} fill={C.text} fontSize={25} fontWeight={600}>
            칸 1 에서 +1 을 세 번 · open-loop rollout
          </text>
          <g>
            <rect x={120} y={72} width={18} height={18} rx={4} fill={C.green} />
            <text x={146} y={88} fill={C.green} fontSize={22}>
              실제 칸 1, 2, 3, 4
            </text>
            <rect x={460} y={72} width={18} height={18} rx={4} fill={C.red} />
            <text x={486} y={88} fill={C.red} fontSize={22}>
              예측 (w = 1.5) 1, 2.5, 4, 5.5
            </text>
          </g>
          {[0, 1, 2, 3, 4, 5, 6].map((z) => (
            <g key={z}>
              <line x1={110} x2={850} y1={sy(z)} y2={sy(z)} stroke={C.grid} strokeWidth={1.5} />
              <text x={96} y={sy(z) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {z}
              </text>
            </g>
          ))}
          <line x1={110} x2={850} y1={sy(4)} y2={sy(4)} stroke={C.orange} strokeWidth={2} strokeDasharray="8 6" />
          <text x={140} y={sy(4) - 10} fill={C.orange} fontSize={20}>
            충전기 칸 4
          </text>
          <text x={30} y={sy(3) + 7} fill={C.muted} fontSize={20}>
            칸
          </text>
          {[0, 1, 2, 3].map((k) => (
            <text key={k} x={sx(k)} y={690} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
              {`step ${k}`}
            </text>
          ))}
          <polyline points={draw(real, 3)} fill="none" stroke={C.green} strokeWidth={4} opacity={prog(t, 1)} />
          <polyline points={draw(pred, shown)} fill="none" stroke={C.red} strokeWidth={4} strokeDasharray="10 7" opacity={prog(t, 1.5)} />
          {real.map((v, k) => (
            <circle key={`r${k}`} cx={sx(k)} cy={sy(v)} r={9} fill={C.green} opacity={prog(t, 1)} />
          ))}
          {pred.map((v, k) => (k <= shown ? <circle key={`p${k}`} cx={sx(k)} cy={sy(v)} r={9} fill={C.red} opacity={prog(t, 1.5 + k)} /> : null))}
          {[1, 2, 3].map((k) => (
            <line key={`e${k}`} x1={sx(k) + 18} x2={sx(k) + 18} y1={sy(real[k])} y2={sy(pred[k])} stroke={C.pink} strokeWidth={3} opacity={prog(t, 7.3 + (k - 1) * 0.8)} />
          ))}
          <text x={30} y={728} fill={C.pink} fontSize={21} opacity={prog(t, 7.2)}>
            오차
          </text>
          {[0, 1, 2, 3].map((k) => (
            <text key={`v${k}`} x={sx(k)} y={728} textAnchor="middle" fill={C.pink} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, k === 0 ? 7.2 : 7.3 + (k - 1) * 0.8)}>
              {(pred[k] - real[k]).toString()}
            </text>
          ))}
          <text x={120} y={128} fill={C.pink} fontSize={21} opacity={prog(t, 10)}>
            앞 step 의 오차를 고치지 못한 채 새 오차가 더해진다
          </text>
        </svg>
      </Card>
      <Box x={988} y={130} w={868} h={400} at={14} title={<Head color={C.red}>w = 1.5 인 model 로 칸 1 에서 비교</Head>}>
        <Table
          at={14.3}
          step={0.6}
          head={['후보', '행동열', '예측 latent', '예측 합', '실제 합']}
          widths={[70, 210, 220, 140, 140]}
          monoCols={[0, 1, 2, 3, 4]}
          rows={[
            ['A', '(+1, +1, +1)', '2.5, 4, 5.5', '−3', '−3'],
            ['B', '(+1, +1, 0)', '2.5, 4, 4', '−1.5', '−4'],
            ['C', '(+1, 0, 0)', '2.5, 2.5, 2.5', '−4.5', '−6'],
            ['D', '(0, 0, 0)', '1, 1, 1', '−9', '−9'],
          ]}
          colors={[undefined, C.red, undefined, undefined]}
        />
        <span style={{ ...line(C.text, 22), opacity: prog(t, 17.5) }}>B 는 두 번만 움직여도 충전기에 닿는다고 예측된다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 18.5) }}>planner 는 점수를 실제보다 높게 예측한 행동을 고른다</span>
      </Box>
      <Box x={988} y={550} w={868} h={330} at={21} title={<Head color={C.orange}>World Models (2018 년 3 월) · VizDoom</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 21.3) }}>world model 이 만든 가상 환경 안에서만 controller 를 학습</span>
        <span style={{ ...line(C.green, 23), opacity: prog(t, 22.3) }}>
          가상 환경: 대부분 만점인 <span style={mono(C.green, 24)}>2100</span> 점
        </span>
        <span style={{ ...line(C.red, 23), opacity: prog(t, 23.5) }}>실제 게임: 무작위 policy 보다도 낮은 점수</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 24.8) }}>무작위성을 낮춘 가상 환경에서는 괴물이 불덩이를 한 번도 쏘지 않았다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Mpc() {
  const t = useSec()
  const rx = (z: number) => 40 + z * 108
  const ry = (r: number) => 135 - (r + 4) * 20
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 136 }}>
        <Flow steps={['지금 이미지 → latent', '길이 H 행동열 planning', '첫 action 하나만 실행', '다음 step 에서 다시']} color={C.accent} at={0.6} />
      </div>
      <Box x={64} y={230} w={880} h={310} at={6.8} title={<Head color={C.accent}>w = 1.5 로 틀린 model 의 MPC</Head>}>
        <Table
          at={7.1}
          step={0.6}
          head={['실제 step', '실제 칸', '고른 후보', '첫 action', '다음 칸']}
          widths={[150, 150, 170, 170, 150]}
          monoCols={[0, 1, 2, 3, 4]}
          rows={[
            ['0', '1', 'B', '+1', '2'],
            ['1', '2', 'C', '+1', '3'],
            ['2', '3', 'C', '+1', '4'],
            ['3', '4', 'D', '0', '4'],
          ]}
          colors={[undefined, undefined, undefined, C.green]}
        />
      </Box>
      <Box x={968} y={230} w={888} h={310} at={9.2} title={<Head color={C.green}>처음 세 step 의 실제 reward 합</Head>}>
        <span style={{ ...mono(C.red, 26), opacity: prog(t, 9.5) }}>B 를 끝까지: −2 − 1 − 1 = −4</span>
        <span style={{ ...mono(C.green, 26), opacity: prog(t, 10.5) }}>MPC: −2 − 1 + 0 = −3</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 11.5) }}>정확한 model 로 고른 A 의 −3 과 같다</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 12.2) }}>closed-loop 지만, model 이 크게 틀리면 첫 action 부터 틀린다</span>
      </Box>
      <Box x={64} y={560} w={880} h={320} at={13} title={<Head color={C.purple}>상상 속 rollout 은 짧게</Head>}>
        <Table
          at={13.3}
          step={0.6}
          head={['시스템', '상상 속 rollout', '그 너머']}
          widths={[230, 330, 260]}
          monoCols={[0]}
          rows={[
            ['PlaNet', 'planning 12 step', '—'],
            ['Dreamer', 'imagination 15 step', 'critic 의 value'],
            ['TD-MPC2', 'planning 3 step', 'value'],
            ['V-JEPA 2-AC', 'planning 1 step (로봇 실험)', '—'],
          ]}
        />
      </Box>
      <Box x={968} y={560} w={888} h={320} at={19.5} title={<Head color={C.orange}>데이터 밖의 reward · 칸 0 ~ 3 만 본 model</Head>}>
        <svg width={832} height={170}>
          <line x1={rx(0)} x2={rx(7)} y1={ry(0)} y2={ry(0)} stroke={C.cardEdge} strokeWidth={1.5} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((z) => (
            <text key={z} x={rx(z)} y={168} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {z}
            </text>
          ))}
          <polyline points={[0, 1, 2, 3, 4, 5, 6, 7].map((z) => `${rx(z)},${ry(-Math.abs(z - 4))}`).join(' ')} fill="none" stroke={C.green} strokeWidth={3} opacity={prog(t, 20)} />
          {[0, 1, 2, 3].map((z) => (
            <circle key={z} cx={rx(z)} cy={ry(z - 4)} r={8} fill={C.blue} opacity={prog(t, 19.8)} />
          ))}
          <g opacity={prog(t, 21)}>
            <line x1={rx(0)} y1={ry(-4)} x2={rx(6)} y2={ry(2)} stroke={C.orange} strokeWidth={3} strokeDasharray="9 6" />
            <circle cx={rx(6)} cy={ry(2)} r={8} fill={C.orange} />
            <text x={540} y={22} textAnchor="end" fill={C.orange} fontSize={21} fontFamily={MONO} fontWeight={600}>
              {'직선 z − 4 → 칸 6 에서 +2'}
            </text>
          </g>
          <g opacity={prog(t, 22.5)}>
            <circle cx={rx(6)} cy={ry(-2)} r={8} fill={C.green} />
            <text x={rx(6) + 16} y={ry(-2) - 14} fill={C.green} fontSize={21} fontFamily={MONO} fontWeight={600}>
              실제 −2
            </text>
          </g>
        </svg>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 26) }}>world model 학습 ⇄ planner 로 실제 데이터 더 모으기를 되풀이</span>
      </Box>
    </AbsoluteFill>
  )
}

const PauseDrift = () => (
  <PauseWrite
    question="w = 0.8 인 world model 로 칸 0 에서 +1 을 네 번 넣으면, 넷째 step 의 예측과 오차는?"
    answer={
      <>
        예측 0.8 → 1.6 → 2.4 → 3.2 (실제 칸 4)
        <br />
        오차 3.2 − 4 = −0.8 · step 마다 −0.2 씩 쌓였다
      </>
    }
  />
)

// ---------- section 4: Dreamer 와 영상 model ----------

function Dreamer() {
  const t = useSec()
  const robots: [string, string, string][] = [
    ['A1 4 다리', '20 Hz', '1 시간 만에 걸었다 (SAC 는 굴리기에서 멈춤)'],
    ['UR5 팔', '2 Hz', '8 시간 뒤 1분에 2.5 개 옮김'],
    ['XArm 팔', '약 0.5 Hz', '10 시간 만에 1분에 3.1 개'],
    ['Sphero', '2 Hz', '2 시간 만에 목표 근처에 머묾'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={340} at={0.3} title={<Head color={C.accent}>Dreamer · 상상 속에서 policy 학습</Head>}>
        <Flow steps={['latent', 'actor', 'action', 'f → 다음 latent']} color={C.accent} at={0.6} gap={0.4} />
        <span style={{ ...line(C.text, 23), opacity: prog(t, 2.6) }}>
          이 계산을 <span style={mono(C.accent, 24)}>15</span> step 상상하고, 그 너머는 critic 의 value 로 대신
        </span>
        <span style={{ ...line(C.red, 22), opacity: prog(t, 4.2) }}>MPC: 실제 step 마다 latent 예측 120,000 번</span>
        <span style={{ ...line(C.green, 22), opacity: prog(t, 5) }}>Dreamer: 실제 step 마다 encoder 와 actor 를 한 번씩</span>
      </Box>
      <Box x={968} y={130} w={888} h={340} at={7} title={<Head color={C.green}>이미지만 보는 연속 제어 과제 20 개 · 평균 점수</Head>}>
        <div style={{ display: 'grid', gap: 16 }}>
          <Bar label="Dreamer" value={823} max={900} color={C.green} at={7.5} sub="500 만 step 뒤" />
          <Bar label="D4PG" value={786} max={900} color={C.red} at={9} sub="1 억 step 뒤" />
        </div>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 11) }}>DreamerV3 (2023 년 1 월): 같은 설정 하나로 150 개가 넘는 과제</span>
      </Box>
      <Box x={64} y={490} w={880} h={390} at={14} title={<Head color={C.orange}>DayDreamer (2022 년 6 월) · simulator 없이 실제 로봇 네 대</Head>}>
        <Table
          at={14.3}
          step={0.6}
          head={['로봇', '명령 주기', '저자들이 보고한 결과']}
          widths={[150, 140, 520]}
          monoCols={[1]}
          rows={robots}
          colors={[C.green, undefined, undefined, undefined]}
        />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 17.5) }}>로봇이 움직이는 동안 한 thread 는 학습하고, 다른 thread 는 actor 로 행동</span>
      </Box>
      <div style={{ position: 'absolute', left: 968, top: 490, width: 888 }}>
        <Misconception at={21} belief="Dreamer 는 실제 환경 없이 상상만으로 학습한다" fact="상상을 만드는 world model 은 실제 transition 으로 계속 고친다 · 실제 데이터는 줄 뿐" />
      </div>
    </AbsoluteFill>
  )
}

function Video() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={310} at={0.3} title={<Head color={C.accent}>영상 world model · 다음 장면을 pixel 로</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 0.6) }}>인터넷 · 로봇 영상 수만 ~ 수천만 시간으로 학습</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 6.9) }}>
          <b style={{ color: C.accent }}>Genie</b> (2024): 2D 게임 영상 3 만 시간 · 11B · <span style={mono(C.accent, 22)}>160 × 90 = 14,400</span> pixel
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 2.5) }}>
          <b style={{ color: C.blue }}>Genie 3</b> (2025): 1초에 24 frame · 720p · 몇 분 동안 일관
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 3.5) }}>
          <b style={{ color: C.purple }}>Cosmos</b> (2025): 원본 영상 약 2,000 만 시간 · clip 약 1 억 개
        </span>
      </Box>
      <Box x={968} y={130} w={888} h={310} at={6.8} title={<Head color={C.accent}>Genie 의 latent action</Head>}>
        <svg width={832} height={200}>
          <g opacity={prog(t, 7.2)}>
            <rect x={0} y={20} width={176} height={99} rx={8} fill="#101a2e" stroke={C.blue} strokeWidth={2} />
            <rect x={60} y={70} width={26} height={26} fill={C.blue} />
            <text x={88} y={150} textAnchor="middle" fill={C.muted} fontSize={21}>
              frame t
            </text>
            {arrow(186, 70, 236, 70, C.muted, 2.5)}
            <rect x={246} y={20} width={176} height={99} rx={8} fill="#101a2e" stroke={C.blue} strokeWidth={2} />
            <rect x={130 + 246 - 60} y={52} width={26} height={26} fill={C.blue} />
            <text x={334} y={150} textAnchor="middle" fill={C.muted} fontSize={21}>
              frame t + 1
            </text>
          </g>
          <g opacity={prog(t, 8.6)}>
            {arrow(432, 70, 482, 70, C.muted, 2.5)}
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={494 + (i % 4) * 58} y={22 + Math.floor(i / 4) * 54} width={46} height={44} rx={8} fill={i === 5 ? `${C.accent}55` : C.grid} stroke={i === 5 ? C.accent : C.cardEdge} strokeWidth={2} />
            ))}
            <text x={494} y={156} fill={C.accent} fontSize={21}>
              변화를 8 가지 중 하나로
            </text>
          </g>
          <text x={0} y={192} fill={C.muted} fontSize={21} opacity={prog(t, 10)}>
            인터넷 영상에는 action 기록이 없어서, 이 8 가지를 action 처럼 쓴다
          </text>
        </svg>
      </Box>
      <Box x={64} y={460} w={1792} h={200} at={13} title={<Head color={C.orange}>DreamGen · GR1 humanoid 시연 2,884 개로 fine-tuning</Head>}>
        <Flow steps={['영상 모델 fine-tuning', '새 지시문으로 영상 생성', 'IDM 으로 action 추정', 'GR00T N1 학습']} color={C.orange} at={13.3} gap={0.6} />
        <div style={{ display: 'flex', gap: 34, opacity: prog(t, 16) }}>
          <span style={line(C.text, 22)}>
            새 동작 14 개 평균 <span style={mono(C.green, 23)}>43.2%</span>
          </span>
          <span style={line(C.text, 22)}>
            처음 보는 환경 <span style={mono(C.green, 23)}>28.5%</span>
          </span>
          <span style={line(C.muted, 22)}>
            pick-and-place 시연만 학습: 새 환경 <span style={mono(C.red, 23)}>0%</span>
          </span>
        </div>
      </Box>
      <Box x={64} y={680} w={880} h={200} at={19.5} title={<Head color={C.green}>컵 pick-and-place 성공률 · 같은 Franka 실험</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar label="V-JEPA 2-AC" value={80} max={100} color={C.green} at={19.8} fmt="80%" labelW={190} width={340} />
          <Bar label="Cosmos" value={0} max={100} color={C.red} at={20.6} fmt="0%" labelW={190} width={340} />
        </div>
      </Box>
      <Box x={968} y={680} w={888} h={200} at={25.8} title={<Head color={C.purple}>action 하나 고르는 시간 · 240 ÷ 16 = 15 배</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar label="V-JEPA 2-AC" value={16} max={240} color={C.green} at={26.1} fmt="16 초" labelW={190} width={340} />
          <Bar label="Cosmos" value={240} max={240} color={C.red} at={26.9} fmt="4 분 (240 초)" labelW={190} width={340} />
        </div>
      </Box>
    </AbsoluteFill>
  )
}

const PauseSteps = () => (
  <PauseWrite
    question="DayDreamer 의 A1 은 1초에 20 번 명령을 받는다. 1 시간 동안 실제 step 은 몇 번인가?"
    answer={
      <>
        1 시간 = 3,600 초 → 20 × 3,600 = 72,000 번
        <br />
        A1 은 이만큼의 실제 step 으로 걷기를 배웠다
      </>
    }
  />
)

// ---------- answer / outro ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: '지금 latent + action → 다음 latent + reward · 12,288 개를 latent 30 개로', at: 1 },
    { tag: script.sections[1], color: C.blue, text: '예측 reward 합이 큰 후보 (A −3) · CEM 은 elite 로 μ 0 → 2.625 · 120,000 번 예측', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: '오차 0.5 → 1 → 1.5 · 짧은 rollout (12 · 15 · 3 step) · MPC 로 실제 합 −3', at: 8.4 },
    { tag: script.sections[3], color: C.green, text: 'A1 은 1 시간 만에 걸음 · DreamGen 43.2% · V-JEPA 2-AC 16 초 대 Cosmos 4 분', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            움직이기 전에 결과를 먼저 계산해 보면, 같은 1 시간으로 더 많이 배울 수 있을까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 25, color: it.color }}>{it.tag}</span>
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
            NEXT · FRONTIER
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>VLA + RL</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            시연으로 배운 VLA 를 simulator 나 실제 로봇에서 받은 reward 로 더 학습하기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/world-model (World Models · PlaNet · Dreamer · DayDreamer · TD-MPC2 · Genie · Cosmos · DreamGen · V-JEPA 2)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function WorldModel() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        rail: Rail,
        latent: Latent,
        'pause-io': PauseIo,
        plan: Plan,
        cem: Cem,
        'pause-cem': PauseCem,
        compound: Compound,
        mpc: Mpc,
        'pause-drift': PauseDrift,
        dreamer: Dreamer,
        video: Video,
        'pause-steps': PauseSteps,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
