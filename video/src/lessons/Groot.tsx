import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO, SANS } from '../theme'
import narration from './groot.narration.json'
import { script } from './groot.script'

// Numbers follow lessons/groot/README.md (see groot.script.ts). The pyramid, architecture and VQ-VAE drawings are schematic
// redraws of the lesson's figures; every number on screen is the lesson's.

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

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 520, unit = '', fmt, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2 }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {fmt ?? value}
        {unit}
      </span>
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

const line = (color = C.text, size = 22): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const one = (color = C.text, size = 22): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45, whiteSpace: 'nowrap' })
const mono = (color = C.text, size = 24): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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

/** a text table with sans cells, one row fading in after another */
function Table({ head, rows, widths, at, step = 0.5, size = 21, colors, monoCols = [] }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[]; monoCols?: number[] }) {
  const t = useSec()
  const cell = (i: number): React.CSSProperties => ({ width: widths[i], fontSize: size, whiteSpace: 'nowrap', fontFamily: monoCols.includes(i) ? MONO : undefined, fontWeight: monoCols.includes(i) ? 600 : 500 })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, fontWeight: 500, color: C.muted, fontSize: size - 1 }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', opacity: prog(t, at + 0.3 + k * step), color: colors?.[k] ?? C.text }}>
          {r.map((v, i) => (
            <span key={i} style={{ ...cell(i), color: i === 0 ? C.muted : undefined }}>
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
            VLA · HUMANOID
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>GR00T N1</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            <span style={{ color: C.blue }}>System 2 (VLM)</span> + <span style={{ color: C.green }}>System 1 (diffusion transformer)</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={36}>
            사람 영상 · 생성 영상 · simulation 을 실물 조종 88 시간 아래에 쌓아 함께 배우는 humanoid VLA
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
      <Panel x={64} y={140} w={1792} h={300}>
        <div style={{ padding: '28px 30px', display: 'grid', gap: 16 }}>
          <span style={{ opacity: prog(t, 0.4) }}>
            <Head>사람이 직접 조종해 모은 로봇 데이터</Head>
          </span>
          <Bar label="π0 · pretraining 로봇 데이터" value={10000} max={10000} color={C.blue} at={0.8} width={1000} fmt="약 10,000" unit=" 시간" labelW={380} />
          <Bar label="GR00T N1 · GR-1 조종" value={88} max={10000} color={C.red} at={1.6} width={1000} fmt="88" unit=" 시간" labelW={380} />
          <span style={{ ...mono(C.orange, 26), opacity: prog(t, 2.6) }}>
            10,000 ÷ 88.4 ≈ 113 배 <span style={{ fontFamily: SANS, color: C.muted, fontWeight: 500, fontSize: 24 }}>· 100 분의 1 도 안 된다</span>
          </span>
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 476, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.35, textAlign: 'center' }}>
          <div>조종 데이터가 100 시간도 안 되는 humanoid 에게</div>
          <div style={{ color: C.accent }}>처음 보는 물건을 그릇에 옮기는 일을 어떻게 가르칠까?</div>
        </div>
      </Appear>
      <Card x={64} y={660} w={1792} h={200} at={5.6}>
        <div style={{ padding: '26px 30px', display: 'grid', gap: 18, justifyItems: 'center' }}>
          <Label size={24} color={C.muted}>
            GR00T N1 의 방법: 성격이 다른 데이터를 세 층으로 쌓아 한 모델로 함께 학습한다
          </Label>
          <div style={{ display: 'flex', gap: 16 }}>
            <Chip at={6} color={C.red}>
              실물 조종 기록 (꼭대기)
            </Chip>
            <Chip at={6.4} color={C.orange}>
              simulation · 생성 영상 (가운데)
            </Chip>
            <Chip at={6.8} color={C.blue}>
              사람 영상 · 인터넷 사진·글 (바닥)
            </Chip>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- data pyramid ----------

function Pyramid() {
  const t = useSec()
  const cx = 255
  const hw = (y: number) => 30 + ((y - 110) * 185) / 560
  const layer = (y0: number, y1: number) => `${cx - hw(y0)},${y0} ${cx + hw(y0)},${y0} ${cx + hw(y1)},${y1} ${cx - hw(y1)},${y1}`
  const layers: { y0: number; y1: number; color: string; inside?: string; name: string; lines: string[]; at: number }[] = [
    { y0: 490, y1: 670, color: C.blue, inside: '사람 영상', name: '바닥 · 사람 영상', lines: ['머리에 카메라를 단 1 인칭 영상', '+ VLM 이 배운 인터넷 사진·글', '넓은 경험 · 관절 값은 없다'], at: 20.3 },
    { y0: 300, y1: 480, color: C.orange, inside: '만든 데이터', name: '가운데 · 만든 데이터', lines: ['simulation 기록 78 만 개', '생성한 로봇 영상 827 시간', 'GPU 시간만 들이면 늘어난다'], at: 21.6 },
    { y0: 110, y1: 290, color: C.red, name: '꼭대기 · 실물 로봇', lines: ['GR-1 조종 88 시간', '+ 다른 로봇의 공개 데이터', '적지만 실제 몸의 기록'], at: 23 },
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={360} at={0.3} title={<Head color={C.red}>사람이 한 건씩 모으는 humanoid 조종 데이터</Head>}>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 0.7) }}>손목에 tracker 를 차고 손에 장갑을 껴서, 손 동작을 그대로 옮긴다</span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 6.8) }}>GR-1 을 조종하며 1초에 20 번 (20 Hz) 관절 명령과 머리 카메라 사진을 기록</span>
        <div>
          <Chip at={8.6} color={C.red} mono>
            GR-1 조종 데이터 88 시간
          </Chip>
        </div>
      </Box>
      <Box x={64} y={520} w={860} h={360} at={13} title={<Head color={C.purple}>data islands · 서로 이어지지 않은 로봇 데이터</Head>}>
        <svg width={804} height={130} style={{ opacity: prog(t, 13.4) }}>
          {[
            ['로봇 A', '관절 수'],
            ['로봇 B', '카메라 위치'],
            ['로봇 C', '제어 방식'],
          ].map(([a, b], i) => (
            <g key={a} opacity={prog(t, 13.4 + i * 0.4)}>
              <ellipse cx={140 + i * 262} cy={65} rx={120} ry={52} fill={`${C.purple}1c`} stroke={C.purple} strokeWidth={2} />
              <text x={140 + i * 262} y={58} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
                {a}
              </text>
              <text x={140 + i * 262} y={88} textAnchor="middle" fill={C.purple} fontSize={20}>
                {b}
              </text>
            </g>
          ))}
        </svg>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 15) }}>Open X-Embodiment 처럼 모은 공개 데이터도 로봇마다 관절 수 · 카메라 위치 · 제어 방식이 달라 하나로 합치기 어렵다</span>
      </Box>
      <Card x={956} y={140} w={900} h={740} at={20}>
        <svg width={900} height={740}>
          <text x={30} y={50} fill={C.text} fontSize={26} fontWeight={600}>
            data pyramid · 양과 실제 몸까지의 거리로 나눈 세 층
          </text>
          {layers.map((l) => (
            <g key={l.name} opacity={prog(t, l.at)}>
              <polygon points={layer(l.y0, l.y1)} fill={`${l.color}2a`} stroke={l.color} strokeWidth={2.5} />
              {l.inside && (
                <text x={cx} y={(l.y0 + l.y1) / 2 + 8} textAnchor="middle" fill={l.color} fontSize={22} fontWeight={600}>
                  {l.inside}
                </text>
              )}
              <text x={500} y={l.y0 + 40} fill={l.color} fontSize={24} fontWeight={700}>
                {l.name}
              </text>
              {l.lines.map((s, k) => (
                <text key={s} x={500} y={l.y0 + 76 + k * 32} fill={k === 2 ? C.muted : C.text} fontSize={21}>
                  {s}
                </text>
              ))}
            </g>
          ))}
          <text x={40} y={712} fill={C.muted} fontSize={22} opacity={prog(t, 24)}>
            ↑ 실제 몸에 가깝다 · ↓ 양이 많다
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Hours() {
  const t = useSec()
  const rows: { name: string; sub: string; data: string; hours: string; color: string; at: number }[] = [
    { name: '꼭대기', sub: '실물 로봇', data: 'GR-1 조종 88.4 · AgiBot-Alpha 1,979.4 · DROID 428.3 시간 등', hours: '3,288.8', color: C.red, at: 0.8 },
    { name: '가운데', sub: '만든 데이터', data: 'simulation 1,742.6 · 생성한 로봇 영상 827.3 시간', hours: '2,569.9', color: C.orange, at: 2 },
    { name: '바닥', sub: '사람 영상', data: 'Ego4D 2,144.7 시간 등 7 가지', hours: '2,517.0', color: C.blue, at: 3.2 },
    { name: '합', sub: '', data: '', hours: '8,375.7', color: C.text, at: 4.4 },
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1000} h={740} at={0.3}>
        <div style={{ padding: '26px 30px', display: 'grid', gap: 14 }}>
          <Head>논문 표 7 · pretraining 에 쓴 데이터의 시간 (층별 합)</Head>
          <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, color: C.muted, fontSize: 21 }}>
            <span style={{ width: 220 }}>층</span>
            <span style={{ width: 520 }}>데이터</span>
            <span style={{ width: 200, textAlign: 'right' }}>합 (시간)</span>
          </div>
          {rows.map((r) => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', height: 84, opacity: prog(t, r.at), borderBottom: `1px solid ${C.grid}` }}>
              <div style={{ width: 220, display: 'grid', gap: 2 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: r.color }}>{r.name}</span>
                {r.sub && <span style={{ fontSize: 21, color: C.muted }}>{r.sub}</span>}
              </div>
              <span style={{ width: 500, marginRight: 20, fontSize: 22, lineHeight: 1.4, color: C.text }}>{r.data}</span>
              <span style={{ width: 200, textAlign: 'right', ...mono(r.color, 32) }}>{r.hours}</span>
            </div>
          ))}
          <div style={{ display: 'grid', gap: 10, marginTop: 10, opacity: prog(t, 6.6) }}>
            <Label size={22} color={C.muted}>
              꼭대기가 가장 긴 것은 다른 로봇 데이터가 섞여서 · humanoid GR-1 은 그중 88.4 시간뿐
            </Label>
            <Bar label="꼭대기 전체" value={3288.8} max={3288.8} color={C.red} at={7} width={420} fmt="3,288.8" unit=" 시간" labelW={200} />
            <Bar label="GR-1 조종" value={88.4} max={3288.8} color={C.orange} at={8} width={420} fmt="88.4" unit=" 시간" labelW={200} />
          </div>
        </div>
      </Card>
      <Box x={1096} y={140} w={760} h={360} at={13} gap={12} title={<Head color={C.orange}>neural trajectory · 생성한 로봇 영상</Head>}>
        <span style={{ ...one(C.text, 22), opacity: prog(t, 13.4) }}>① GR-1 조종 88 시간으로 영상 생성 모델을 fine-tuning</span>
        <span style={{ ...one(C.text, 22), opacity: prog(t, 14.4) }}>② 첫 장면 + 새 지시문으로 영상 생성 → 맞지 않는 영상은 거름</span>
        <span style={{ ...one(C.text, 22), opacity: prog(t, 15.4) }}>③ 남은 영상에 latent action · IDM pseudo-action 을 붙임</span>
        <span style={{ ...mono(C.orange, 24), opacity: prog(t, 16.6) }}>827 시간 · 827 ÷ 88 ≈ 9.4 배</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 17.8) }}>영상 1 초에 L40 2 분 → 약 10 만 5 천 GPU 시간 · L40 3,600 장으로 약 1.5 일</span>
      </Box>
      <Box x={1096} y={520} w={760} h={360} at={20} gap={12} title={<Head color={C.green}>DexMimicGen · simulation 기록</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 20.4) }}>사람이 simulation 안에서 조종한 시연 수십 개를 물체별 구간으로 나눠, 새 위치로 옮기고 성공한 기록만 남긴다</span>
        <span style={{ ...mono(C.green, 30), opacity: prog(t, 21.8) }}>78 만 개 · 11 시간</span>
        <span style={{ ...one(C.text, 22), opacity: prog(t, 23.2) }}>사람이 조종했다면 6,500 시간 · 쉬지 않고 9 개월</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 24.6) }}>pretraining 용: 그릇 조합 54 가지 × 10,000 개 = 54 만 개</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- System 2 and System 1 ----------

function Systems() {
  const t = useSec()
  const box = (x: number, y: number, w: number, h: number, color: string, at: number, fill = 0.12) => (
    <rect x={x} y={y} width={w} height={h} rx={12} fill={`${color}${Math.round(fill * 255).toString(16).padStart(2, '0')}`} stroke={color} strokeWidth={2} opacity={prog(t, at)} />
  )
  const hi = prog(t, 18.4)
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={460} at={0.3}>
        <svg width={1792} height={460}>
          {/* inputs */}
          <g opacity={prog(t, 0.6)}>
            {box(30, 70, 220, 70, C.muted, 0.6, 0.08)}
            <text x={140} y={113} textAnchor="middle" fill={C.text} fontSize={22}>
              카메라 사진
            </text>
            {box(30, 170, 220, 70, C.muted, 0.6, 0.08)}
            <text x={140} y={213} textAnchor="middle" fill={C.text} fontSize={22}>
              지시문
            </text>
            {arrow(250, 105, 308, 105, C.muted)}
            {arrow(250, 205, 308, 205, C.muted)}
          </g>
          {/* System 2 */}
          <g opacity={prog(t, 0.9)}>
            {box(310, 50, 420, 210, C.blue, 0.9)}
            <text x={330} y={86} fill={C.blue} fontSize={24} fontWeight={700}>
              System 2 · Eagle-2 VLM
            </text>
            <rect x={330} y={102} width={380} height={34} rx={6} fill={C.card} stroke={C.cardEdge} />
            <text x={346} y={126} fill={C.text} fontSize={20}>
              SigLIP-2 image encoder
            </text>
            <rect x={330} y={144} width={380} height={34} rx={6} fill={C.card} stroke={C.cardEdge} />
            <text x={346} y={168} fill={C.text} fontSize={20}>
              SmolLM2 언어 모델 · 12 번째 층까지
            </text>
            <rect x={330} y={186} width={380} height={34} rx={6} fill={`${C.orange}${hi > 0 ? '33' : '00'}`} stroke={hi > 0 ? C.orange : C.cardEdge} strokeWidth={hi > 0 ? 2.5 : 1} />
            <text x={346} y={210} fill={hi > 0 ? C.orange : C.text} fontSize={20} fontWeight={600}>
              12 번째 층 출력 φ
            </text>
            <text x={330} y={248} fill={C.blue} fontSize={21} fontFamily={MONO} fontWeight={600}>
              10 Hz · 13.4 억
            </text>
          </g>
          {/* System 1 */}
          <g opacity={prog(t, 6.4)}>
            {arrow(730, 203, 848, 203, C.blue, 3.5)}
            {box(850, 50, 520, 300, C.green, 6.4)}
            <text x={870} y={86} fill={C.green} fontSize={24} fontWeight={700}>
              System 1 · diffusion transformer
            </text>
            {['cross-attention block · φ 를 읽음', 'self-attention block · token 끼리', 'cross-attention block · φ 를 읽음', 'self-attention block · token 끼리'].map((s, i) => (
              <g key={i}>
                <rect x={870} y={104 + i * 44} width={480} height={36} rx={6} fill={C.card} stroke={i % 2 === 0 ? `${C.blue}99` : C.cardEdge} />
                <text x={886} y={129 + i * 44} fill={i % 2 === 0 ? C.blue : C.text} fontSize={20}>
                  {s}
                </text>
              </g>
            ))}
            <text x={870} y={330} fill={C.green} fontSize={21} fontFamily={MONO} fontWeight={600}>
              120 Hz · flow matching · 공개 설정 16 층
            </text>
          </g>
          {/* robot-specific parts */}
          <g opacity={prog(t, 7.8)}>
            {box(30, 300, 220, 80, C.muted, 7.8, 0.08)}
            <text x={140} y={334} textAnchor="middle" fill={C.text} fontSize={20}>
              로봇 상태
            </text>
            <text x={140} y={362} textAnchor="middle" fill={C.text} fontSize={20}>
              noise 섞인 action
            </text>
            {arrow(250, 340, 308, 340, C.muted)}
            {box(310, 290, 420, 110, C.orange, 7.8)}
            <text x={330} y={328} fill={C.orange} fontSize={22} fontWeight={700}>
              로봇별 state · action encoder
            </text>
            <text x={330} y={362} fill={C.text} fontSize={20}>
              작은 MLP · 로봇 번호마다 따로
            </text>
            {arrow(730, 330, 848, 330, C.orange, 3.5)}
            {box(1430, 130, 330, 140, C.orange, 7.8)}
            <text x={1450} y={170} fill={C.orange} fontSize={22} fontWeight={700}>
              로봇별 action decoder
            </text>
            <text x={1450} y={206} fill={C.text} fontSize={20}>
              속도 16 개 → 덩어리
            </text>
            {arrow(1370, 200, 1428, 200, C.green, 3.5)}
          </g>
          <text x={850} y={420} fill={C.muted} fontSize={20} opacity={prog(t, 9)}>
            파랑은 System 2 · 초록은 System 1 · 주황은 로봇마다 따로 있는 부분
          </text>
        </svg>
      </Card>
      <Box x={64} y={620} w={580} h={260} at={12.2} title={<Head color={C.accent}>parameter · GR00T-N1-2B</Head>}>
        <span style={{ ...one(C.text, 24), opacity: prog(t, 12.5) }}>
          전체 <span style={mono(C.text, 24)}>2.2B = 22 억</span>
        </span>
        <span style={{ ...one(C.blue, 24), opacity: prog(t, 13.4) }}>
          System 2 (VLM) <span style={mono(C.blue, 24)}>13.4 억</span>
        </span>
        <span style={{ ...one(C.green, 24), opacity: prog(t, 14.4) }}>
          System 1 쪽 <span style={mono(C.green, 24)}>22 − 13.4 = 8.6 억</span>
        </span>
      </Box>
      <Box x={668} y={620} w={580} h={260} at={18.2} color={`${C.orange}88`} title={<Head color={C.orange}>12 번째 층 출력 φ</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 18.6) }}>맨 마지막 층 대신 12 번째 층을 씀 → 추론이 빨라지고 성공률도 올랐다 (논문)</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 20.4) }}>공개 구현은 12 번째 층 위를 지워 계산하지도 메모리에 올리지도 않는다</span>
      </Box>
      <Box x={1272} y={620} w={584} h={260} at={24.2} title={<Head color={C.purple}>image token 과 추론 시간</Head>}>
        <span style={{ ...one(C.text, 20), opacity: prog(t, 24.5) }}>
          <span style={mono(C.text, 20)}>224 × 224</span> → pixel shuffle → <span style={mono(C.purple, 20)}>token 64 개</span>
        </span>
        <span style={{ ...one(C.text, 21), opacity: prog(t, 25.6) }}>
          π0 의 PaliGemma <span style={mono(C.text, 21)}>256 개</span>의 4 분의 1
        </span>
        <span style={{ ...one(C.text, 21), opacity: prog(t, 26.8) }}>
          action 16 개짜리 덩어리 하나 · L40 <span style={mono(C.purple, 21)}>63.9 ms</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function Embodiment() {
  const t = useSec()
  const rows = [0, 1, 2, 3]
  const ry = (i: number) => 110 + i * 52
  const tokens = (y: number, at: number) => (
    <g opacity={prog(t, at)}>
      {[0, 1, 2, 3].map((k) => (
        <rect key={k} x={590 + k * 50} y={y} width={40} height={40} rx={6} fill={`${C.green}33`} stroke={C.green} strokeWidth={2} />
      ))}
    </g>
  )
  const encRow = (y: number, a: string, b: string, lin: string, f: string, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={30} y={y} width={220} height={80} rx={10} fill={C.bg} stroke={C.muted} strokeWidth={1.5} />
      <text x={140} y={y + 33} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
        {a}
      </text>
      <text x={140} y={y + 63} textAnchor="middle" fill={C.muted} fontSize={20}>
        {b}
      </text>
      {arrow(250, y + 40, 308, y + 40, C.muted)}
      <rect x={310} y={y + 5} width={220} height={70} rx={10} fill={`${C.orange}22`} stroke={C.orange} strokeWidth={2} />
      <text x={420} y={y + 47} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
        {lin}
      </text>
      <text x={420} y={y + 105} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
        {f}
      </text>
      {arrow(530, y + 40, 588, y + 40, C.muted)}
    </g>
  )
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={880} h={410} at={0.3}>
        <svg width={880} height={410}>
          {/* pi0 */}
          <g opacity={prog(t, 0.5)}>
            <text x={40} y={56} fill={C.text} fontSize={24} fontWeight={700}>
              π0
            </text>
            <text x={125} y={96} textAnchor="middle" fill={C.blue} fontSize={20}>
              VLM
            </text>
            <text x={325} y={96} textAnchor="middle" fill={C.green} fontSize={20}>
              action expert
            </text>
            {rows.map((i) => (
              <g key={i}>
                <rect x={50} y={ry(i)} width={150} height={36} rx={6} fill={`${C.blue}22`} stroke={C.blue} />
                <rect x={250} y={ry(i)} width={150} height={36} rx={6} fill={`${C.green}22`} stroke={C.green} />
                <line x1={204} y1={ry(i) + 18} x2={246} y2={ry(i) + 18} stroke={C.muted} strokeWidth={2.5} />
              </g>
            ))}
            <text x={40} y={340} fill={C.text} fontSize={21}>
              같은 self-attention 안에서 만남
            </text>
            <text x={40} y={370} fill={C.red} fontSize={21}>
              → 층 수가 같아야 한다
            </text>
          </g>
          <line x1={450} y1={30} x2={450} y2={385} stroke={C.cardEdge} strokeWidth={1.5} />
          {/* GR00T */}
          <g opacity={prog(t, 6.8)}>
            <text x={470} y={56} fill={C.text} fontSize={24} fontWeight={700}>
              GR00T N1
            </text>
            <text x={555} y={96} textAnchor="middle" fill={C.blue} fontSize={20}>
              VLM
            </text>
            <text x={790} y={96} textAnchor="middle" fill={C.green} fontSize={20}>
              DiT
            </text>
            {rows.map((i) => (
              <g key={i}>
                <rect x={490} y={ry(i)} width={130} height={36} rx={6} fill={i === 2 ? `${C.orange}33` : `${C.blue}22`} stroke={i === 2 ? C.orange : C.blue} opacity={i === 3 ? 0.35 : 1} strokeDasharray={i === 3 ? '5 5' : undefined} />
                <rect x={720} y={ry(i)} width={140} height={36} rx={6} fill={`${C.green}22`} stroke={i % 2 === 0 ? C.blue : C.green} />
                <text x={790} y={ry(i) + 25} textAnchor="middle" fill={i % 2 === 0 ? C.blue : C.green} fontSize={20}>
                  {i % 2 === 0 ? 'cross' : 'self'}
                </text>
              </g>
            ))}
            {arrow(620, ry(2) + 18, 660, ry(2) + 18, C.orange, 2.5, 8)}
            <circle cx={662} cy={ry(2) + 18} r={5} fill={C.orange} />
            <text x={640} y={ry(2) - 2} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={700}>
              φ
            </text>
            {arrow(666, ry(2) + 16, 718, ry(0) + 18, C.orange, 2, 8)}
            {arrow(667, ry(2) + 18, 718, ry(2) + 18, C.orange, 2, 8)}
            <text x={470} y={340} fill={C.text} fontSize={21}>
              φ 를 cross-attention 으로 읽음
            </text>
            <text x={470} y={370} fill={C.green} fontSize={21}>
              → 층 수를 맞출 필요가 없다
            </text>
          </g>
        </svg>
      </Card>
      <Box x={64} y={570} w={880} h={310} at={6.5} gap={12} title={<Head color={C.blue}>cross-attention block 안에서</Head>}>
        <span style={{ ...one(C.text, 24), opacity: prog(t, 8) }}>
          <span style={mono(C.green, 24)}>query</span> ← action · 상태 token
        </span>
        <span style={{ ...one(C.text, 24), opacity: prog(t, 9.2) }}>
          <span style={mono(C.blue, 24)}>key · value</span> ← VLM 출력 φ
        </span>
        <span style={{ ...one(C.muted, 22), opacity: prog(t, 10.4) }}>VLM 쪽은 action 을 보지 않는다 · 볼 연결이 없다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 11.6) }}>self-attention block: 상태 token 과 noise 섞인 action token 16 개가 서로를 보며 덩어리를 이어지게 맞춘다</span>
      </Box>
      <Card x={968} y={140} w={888} h={410} at={13}>
        <svg width={888} height={410}>
          <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            로봇마다 따로 둔 state encoder · 공통 길이 4 와 숫자 14 개는 예
          </text>
          <text x={685} y={88} textAnchor="middle" fill={C.green} fontSize={20} opacity={prog(t, 14)}>
            token 길이 4
          </text>
          {encRow(80, 'SO-101', '숫자 6 개', 'Linear 6 → 4', '6 × 4 + 4 = 28', 13.3)}
          {tokens(100, 14)}
          {encRow(220, '팔 둘 로봇 (예)', '숫자 14 개', 'Linear 14 → 4', '14 × 4 + 4 = 60', 15.5)}
          {tokens(240, 16.2)}
          <text x={30} y={385} fill={C.text} fontSize={21} opacity={prog(t, 17.4)}>
            둘 다 길이 4 의 token → 같은 diffusion transformer 로 들어간다
          </text>
        </svg>
      </Card>
      <Box x={968} y={570} w={888} h={310} at={20} gap={12} title={<Head color={C.orange}>길이 맞추기 · π0 와 GR00T N1 공개 구현</Head>}>
        <Table
          at={20.3}
          head={['', 'π0', 'GR00T N1 공개 구현']}
          widths={[220, 230, 380]}
          rows={[
            ['길이 맞추기', '상태 · action 18 칸', '상태 64 칸 · action 32 칸'],
            ['칸에 곱하는 weight', '모든 로봇이 같음', '로봇 번호마다 다름 (최대 32 대)'],
            ['새 로봇', '같은 weight 로 학습', '빈 번호의 weight 를 새로 학습'],
          ]}
        />
        <span style={{ ...one(C.muted, 21), opacity: prog(t, 22.6) }}>남는 칸은 0 으로 채우고, loss 는 0 을 채운 칸을 빼고 잰다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- flow matching ----------

function Flow() {
  const t = useSec()
  const X = (tau: number) => 120 + tau * 700
  const Y = (v: number) => 320 - v * 160
  const a = [-1.0, -0.5, 0, 0.5, 1.0]
  const b = [0.5, 0.25, 0, -0.25, -0.5]
  const stepAt = (k: number) => 24.4 + k * 0.9
  const path = (vals: number[]) =>
    vals
      .map((v, k) => [k, v] as const)
      .filter(([k]) => k === 0 || t >= stepAt(k - 1))
      .map(([k, v], i) => `${i === 0 ? 'M' : 'L'}${X(k * 0.25)},${Y(v)}`)
      .join(' ')
  const steps = [
    ['1', '0', '(−1.0, 0.5)', '(−0.5, 0.25)'],
    ['2', '0.25', '(−0.5, 0.25)', '(0, 0)'],
    ['3', '0.5', '(0, 0)', '(0.5, −0.25)'],
    ['4', '0.75', '(0.5, −0.25)', '(1.0, −0.5)'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={400} at={0.3} gap={12} title={<Head color={C.accent}>flow matching 의 세 식</Head>}>
        <span style={{ ...one(C.text, 26), opacity: prog(t, 0.6) }}>
          섞은 점 = <span style={mono(C.accent, 26)}>τ × A + (1 − τ) × ε</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 1.6) }}>A 는 시연의 action 덩어리 · ε 은 noise · τ = 0 이면 noise 이고 τ = 1 이면 시연</span>
        <span style={{ ...one(C.text, 26), opacity: prog(t, 6.4) }}>
          정답 속도 = <span style={mono(C.green, 26)}>A − ε</span> <span style={{ color: C.red, fontSize: 22 }}>(ε − A 가 아님)</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 8) }}>τ 가 1 늘 때 섞은 점이 변하는 양이 A − ε · 공개 구현도 actions − noise 로 계산</span>
        <span style={{ ...one(C.text, 26), opacity: prog(t, 12.4) }}>
          Euler step: 새 값 = 지금 값 + <span style={mono(C.orange, 26)}>V ÷ K</span>
        </span>
      </Box>
      <Box x={64} y={560} w={860} h={320} at={12.2} gap={12} title={<Head color={C.orange}>π0 와 GR00T N1</Head>}>
        <Table
          at={12.6}
          head={['', 'π0', 'GR00T N1']}
          widths={[260, 220, 320]}
          monoCols={[]}
          rows={[
            ['덩어리 길이 H', '50', '16'],
            ['Euler step 수', '10', 'K = 4'],
            ['한 step 길이', '0.1', '1 ÷ 4 = 0.25'],
            ['속도를 내는 부분', 'action expert', 'diffusion transformer'],
          ]}
        />
      </Box>
      <Card x={956} y={140} w={900} h={740} at={18.2}>
        <svg width={900} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            두 칸짜리 덩어리의 Euler 4 step (예)
          </text>
          <text x={30} y={82} fill={C.muted} fontSize={21}>
            예로 든 A = (1.0, −0.5) · ε = (−1.0, 0.5)
          </text>
          <text x={30} y={112} fill={C.muted} fontSize={21} opacity={prog(t, 19.6)}>
            속도 V = A − ε = (2.0, −1.0) · 한 step 에 0.25 × V = (0.5, −0.25)
          </text>
          <g opacity={prog(t, 18.6)}>
            <line x1={X(0)} y1={500} x2={X(1)} y2={500} stroke={C.muted} strokeWidth={1.5} />
            <line x1={X(0) - 10} y1={Y(0)} x2={X(1)} y2={Y(0)} stroke={C.cardEdge} strokeWidth={1.5} strokeDasharray="6 6" />
            {[0, 0.25, 0.5, 0.75, 1].map((tau) => (
              <g key={tau}>
                <line x1={X(tau)} y1={494} x2={X(tau)} y2={506} stroke={C.muted} strokeWidth={1.5} />
                <text x={X(tau)} y={530} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {tau}
                </text>
              </g>
            ))}
            <text x={X(1) + 18} y={505} fill={C.muted} fontSize={22}>
              τ
            </text>
            {[
              [1, '1.0'],
              [0, '0'],
              [-1, '−1.0'],
            ].map(([v, s]) => (
              <text key={s as string} x={96} y={Y(v as number) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {s as string}
              </text>
            ))}
            <path d={path(a)} fill="none" stroke={C.green} strokeWidth={3.5} />
            <path d={path(b)} fill="none" stroke={C.orange} strokeWidth={3.5} />
            {a.map((v, k) => (k === 0 || t >= stepAt(k - 1) ? <circle key={`a${k}`} cx={X(k * 0.25)} cy={Y(v)} r={7} fill={C.green} /> : null))}
            {b.map((v, k) => (k === 0 || t >= stepAt(k - 1) ? <circle key={`b${k}`} cx={X(k * 0.25)} cy={Y(v)} r={7} fill={C.orange} /> : null))}
          </g>
          <text x={30} y={572} fill={C.muted} fontSize={20} opacity={prog(t, 19)}>
            <tspan fill={C.green}>초록: 첫째 칸 (step t 의 관절 1)</tspan> · <tspan fill={C.orange}>주황: 둘째 칸 (step t + 1 의 관절 1)</tspan>
          </text>
          {steps.map(([k, tau, from, to], i) => (
            <text key={k} x={30} y={612 + i * 32} fill={i === 3 ? C.green : C.text} fontSize={21} fontFamily={MONO} style={{ whiteSpace: 'pre' }} opacity={prog(t, stepAt(i) - 0.3)}>
              {`step ${k}  τ ${tau.padEnd(4, ' ')}  ${from} → ${to}`}
            </text>
          ))}
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Timing() {
  const t = useSec()
  const ms = 4 // px per ms on the timeline
  const x0 = 260
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={340} at={0.3} gap={12} title={<Head color={C.accent}>덩어리 16 개가 덮는 시간</Head>}>
        <Table
          at={0.6}
          head={['제어 주기', 'action 하나', '16 개', '앞 8 개']}
          widths={[170, 220, 200, 200]}
          monoCols={[1, 2, 3]}
          rows={[
            ['20 Hz', '0.05 초', '0.8 초', '0.4 초'],
            ['30 Hz', '≈ 0.033 초', '≈ 0.53 초', '≈ 0.27 초'],
          ]}
        />
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 2.6) }}>16 × 0.05 = 0.8 초 · 16 ÷ 30 ≈ 0.53 초</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 6.8) }}>공개 구현은 앞부분만 실행하고 새 사진으로 다음 덩어리를 만든다 · N1.6 예시 명령은 16 개 중 8 개 실행</span>
      </Box>
      <Box x={948} y={140} w={908} h={340} at={13} gap={12} title={<Head color={C.green} size={24}>N1.6 · 덩어리 하나를 만드는 시간 (4 step, 카메라 한 대)</Head>}>
        {(
          [
            ['H100', 23, 11, 38],
            ['RTX 4090', 25, 17, 44],
            ['Jetson AGX Thor', 39, 61, 105],
          ] as const
        ).map(([name, v, a, all], i) => {
          const at = 13.4 + i * 0.8
          const p = prog(t, at, 0.9)
          return (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, at - 0.2, 0.3) }}>
              <span style={{ width: 200, fontSize: 22, color: C.muted, textAlign: 'right' }}>{name}</span>
              <div style={{ width: 273, height: 30, borderRadius: 8, background: C.grid, display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: v * 2.6 * p, background: C.blue }} />
                <div style={{ width: a * 2.6 * p, background: C.green }} />
              </div>
              <span style={{ ...mono(i === 2 ? C.orange : C.text, 24), opacity: prog(t, at + 0.6) }}>{all} ms</span>
              <span style={{ fontSize: 20, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>
                (VLM {v} · action {a})
              </span>
            </div>
          )
        })}
        <span style={{ ...one(C.muted, 20), opacity: prog(t, 16.4) }}>
          <span style={{ color: C.blue }}>파랑 VLM 계산</span> · <span style={{ color: C.green }}>초록 action 계산</span> · 전체에는 데이터 준비 몇 ms 포함
        </span>
      </Box>
      <Card x={64} y={500} w={1792} h={380} at={20}>
        <svg width={1792} height={380}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            30 Hz 로봇 · Jetson AGX Thor (덩어리 하나에 105 ms) 의 시간표
          </text>
          <g opacity={prog(t, 20.3)}>
            <text x={30} y={118} fill={C.text} fontSize={22} fontWeight={600}>
              앞 8 개 실행
            </text>
            <rect x={x0} y={90} width={267 * ms * prog(t, 20.3, 1.2)} height={34} rx={6} fill={`${C.blue}cc`} />
            <text x={x0 + 16} y={114} fill={C.bg} fontSize={20} fontWeight={700} opacity={prog(t, 21)}>
              action 8 개 실행 · 8 ÷ 30 ≈ 267 ms
            </text>
            <rect x={x0} y={136} width={105 * ms * prog(t, 20.6, 0.8)} height={34} rx={6} fill={`${C.green}cc`} />
            <text x={x0 + 16} y={160} fill={C.bg} fontSize={20} fontWeight={700} opacity={prog(t, 21.2)}>
              다음 덩어리 계산 105 ms
            </text>
            <text x={x0 + 267 * ms + 20} y={114} fill={C.green} fontSize={22} fontWeight={700} opacity={prog(t, 21.8)}>
              제때 끝남 ✓
            </text>
          </g>
          <g opacity={prog(t, 23.5)}>
            <text x={30} y={238} fill={C.text} fontSize={22} fontWeight={600}>
              앞 2 개만 실행
            </text>
            <rect x={x0} y={210} width={67 * ms} height={34} rx={6} fill={`${C.blue}cc`} />
            <text x={x0 + 16} y={234} fill={C.bg} fontSize={20} fontWeight={700}>
              2 개 · 약 67 ms
            </text>
            <rect x={x0 + 67 * ms} y={210} width={38 * ms * prog(t, 24.2, 0.8)} height={34} rx={6} fill={`${C.red}55`} stroke={C.red} strokeDasharray="6 4" />
            <rect x={x0} y={256} width={105 * ms} height={34} rx={6} fill={`${C.green}cc`} />
            <text x={x0 + 16} y={280} fill={C.bg} fontSize={20} fontWeight={700}>
              다음 덩어리 계산 105 ms
            </text>
            <text x={x0 + 105 * ms + 20} y={234} fill={C.red} fontSize={22} fontWeight={700} opacity={prog(t, 24.8)}>
              로봇이 38 ms 기다림
            </text>
          </g>
          <text x={30} y={345} fill={C.muted} fontSize={21} opacity={prog(t, 25.6)}>
            실행하는 개수가 적을수록 새 사진을 자주 보지만, 그 시간 안에 다음 계산이 끝나야 로봇이 멈추지 않는다
          </text>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- latent action and results ----------

function Latent() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={240} at={0.3} gap={12} title={<Head color={C.accent}>action 이 없는 데이터</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 0.6) }}>사람 영상 (바닥) 과 생성 영상 (가운데) 에는 관절 값이 없는데, flow matching loss 는 정답 action 덩어리가 있어야 계산된다</span>
        <div style={{ display: 'flex', gap: 14 }}>
          <Chip at={2.4} color={C.purple}>
            ① latent action
          </Chip>
          <Chip at={3} color={C.orange}>
            ② IDM pseudo-action
          </Chip>
        </div>
      </Box>
      <Card x={64} y={400} w={860} h={480} at={6.2}>
        <svg width={860} height={480}>
          <text x={30} y={42} fill={C.text} fontSize={26} fontWeight={600}>
            latent action 을 만드는 VQ-VAE
          </text>
          <g opacity={prog(t, 6.5)}>
            <rect x={30} y={80} width={200} height={60} rx={10} fill={C.bg} stroke={C.muted} />
            <text x={130} y={118} textAnchor="middle" fill={C.text} fontSize={21}>
              지금 장면
            </text>
            <rect x={30} y={160} width={200} height={60} rx={10} fill={C.bg} stroke={C.muted} />
            <text x={130} y={198} textAnchor="middle" fill={C.text} fontSize={21}>
              H step 뒤 장면
            </text>
            {arrow(230, 110, 278, 135, C.muted, 2.5, 9)}
            {arrow(230, 190, 278, 165, C.muted, 2.5, 9)}
            <rect x={280} y={100} width={140} height={100} rx={12} fill={`${C.purple}22`} stroke={C.purple} strokeWidth={2} />
            <text x={350} y={157} textAnchor="middle" fill={C.purple} fontSize={22} fontWeight={700}>
              encoder
            </text>
          </g>
          <text x={260} y={236} fill={C.purple} fontSize={20} fontFamily={MONO} fontWeight={600} opacity={prog(t, 7.6)}>
            e = (0.8, 0.3)
          </text>
          <g opacity={prog(t, 9.4)}>
            <rect x={575} y={300} width={150} height={80} rx={12} fill={`${C.purple}22`} stroke={C.purple} strokeWidth={2} />
            <text x={650} y={347} textAnchor="middle" fill={C.purple} fontSize={22} fontWeight={700}>
              decoder
            </text>
            {arrow(575, 340, 522, 340, C.purple, 2.5, 9)}
            <rect x={300} y={300} width={220} height={80} rx={10} fill={C.bg} stroke={C.muted} />
            <text x={410} y={334} textAnchor="middle" fill={C.text} fontSize={21}>
              H step 뒤 장면
            </text>
            <text x={410} y={362} textAnchor="middle" fill={C.muted} fontSize={20}>
              (되살림)
            </text>
          </g>
          <g opacity={prog(t, 12.4)}>
            {arrow(420, 150, 478, 150, C.purple, 2.5, 9)}
            <rect x={480} y={66} width={350} height={174} rx={12} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={500} y={96} fill={C.muted} fontSize={20}>
              codebook (예) · e 와의 거리
            </text>
            {[
              ['c1 = (1, 0)', '0.13', true],
              ['c2 = (−1, 0)', '3.33', false],
              ['c3 = (0, 1)', '1.13', false],
            ].map(([c, d, best], i) => (
              <g key={c as string} opacity={prog(t, 12.8 + i * 0.4)}>
                {best && <rect x={492} y={110 + i * 40} width={326} height={34} rx={6} fill={`${C.green}${prog(t, 14.4) > 0 ? '2a' : '00'}`} stroke={prog(t, 14.4) > 0 ? C.green : 'none'} />}
                <text x={506} y={134 + i * 40} fill={best ? C.green : C.text} fontSize={21} fontFamily={MONO} fontWeight={600}>
                  {c as string}
                </text>
                <text x={800} y={134 + i * 40} textAnchor="end" fill={best ? C.green : C.muted} fontSize={21} fontFamily={MONO} fontWeight={600}>
                  {d as string}
                </text>
              </g>
            ))}
            {arrow(650, 240, 650, 298, C.green, 2.5, 9)}
          </g>
          <text x={30} y={428} fill={C.text} fontSize={21} opacity={prog(t, 10.4)}>
            decoder 가 지금 장면을 이미 받으므로, 넘긴 vector 에는 두 장면 사이의 움직임이 담긴다
          </text>
          <text x={30} y={460} fill={C.muted} fontSize={21} opacity={prog(t, 15.6)}>
            학습 뒤에는 encoder 만 떼어, 바꾸기 전의 e 를 latent action 으로 쓴다
          </text>
        </svg>
      </Card>
      <Box x={948} y={140} w={908} h={360} at={18.2} gap={12} title={<Head color={C.orange}>IDM · inverse dynamics model</Head>}>
        <span style={{ ...one(C.muted, 22), opacity: prog(t, 18.5) }}>dynamics model: 지금 상태 + action → 다음 상태</span>
        <span style={{ ...one(C.text, 22), opacity: prog(t, 19.4) }}>IDM: 지금 장면 + 나중 장면 → 그사이의 action</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 20.6) }}>장면과 action 이 함께 있는 실물 로봇 데이터로 flow matching 학습 · SigLIP-2 + diffusion transformer</span>
        <span style={{ ...line(C.orange, 22), opacity: prog(t, 22) }}>action 이 없는 생성 영상에 대면 그럴듯한 action 이 나온다 → pseudo-action</span>
      </Box>
      <Box x={948} y={520} w={908} h={360} at={24.2} gap={12} title={<Head color={C.purple}>latent action 과 IDM pseudo-action</Head>}>
        <Table
          at={24.4}
          step={0.4}
          size={20}
          head={['', 'latent action', 'IDM pseudo-action']}
          widths={[200, 290, 340]}
          rows={[
            ['학습에 필요한 것', '영상만', '장면 + action 이 있는 로봇 데이터'],
            ['나오는 숫자', '어느 로봇의 action 도 아님', '그 로봇의 action 형식'],
            ['붙이는 데이터', '사람 · 생성 · 로봇 영상', '생성한 로봇 영상'],
          ]}
        />
        <span style={{ ...line(C.text, 21), opacity: prog(t, 26.4) }}>
          RoboCasa · 작업당 시연 <span style={mono(C.purple, 21)}>30 개</span>: latent action 이 조금 나음 · <span style={mono(C.orange, 21)}>100 개 · 300 개</span>: IDM 이 나음
        </span>
      </Box>
    </AbsoluteFill>
  )
}

function Results() {
  const t = useSec()
  const base = 420
  const H = (v: number) => v * 3
  const bars: [number, number, string, string, number][] = [
    [170, 10.2, C.red, '10.2%', 0.6],
    [270, 42.6, C.green, '42.6%', 1.2],
    [520, 46.4, C.red, '46.4%', 6.4],
    [620, 76.8, C.green, '76.8%', 7],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1000} h={470} at={0.3}>
        <svg width={1000} height={470}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            GR-1 실물 작업 네 종류의 평균 성공률 (논문 표 3)
          </text>
          <g opacity={prog(t, 0.4)}>
            <rect x={30} y={72} width={18} height={18} rx={3} fill={C.red} />
            <text x={58} y={88} fill={C.text} fontSize={21}>
              Diffusion Policy
            </text>
            <rect x={280} y={72} width={18} height={18} rx={3} fill={C.green} />
            <text x={308} y={88} fill={C.text} fontSize={21}>
              GR00T-N1-2B
            </text>
          </g>
          <line x1={120} y1={base} x2={760} y2={base} stroke={C.muted} strokeWidth={1.5} opacity={prog(t, 0.4)} />
          {bars.map(([x, v, color, s, at]) => {
            const p = prog(t, at, 0.9)
            return (
              <g key={s} opacity={prog(t, at - 0.2, 0.3)}>
                <rect x={x} y={base - H(v) * p} width={80} height={H(v) * p} rx={6} fill={color} />
                <text x={x + 40} y={base - H(v) - 12} textAnchor="middle" fill={color} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.6)}>
                  {s}
                </text>
              </g>
            )
          })}
          <text x={260} y={452} textAnchor="middle" fill={C.text} fontSize={22} opacity={prog(t, 0.6)}>
            데이터 10%
          </text>
          <text x={610} y={452} textAnchor="middle" fill={C.text} fontSize={22} opacity={prog(t, 6.4)}>
            데이터 전체
          </text>
          <g opacity={prog(t, 9.4)}>
            <line x1={350} y1={base - H(42.6)} x2={520} y2={base - H(42.6)} stroke={C.orange} strokeWidth={2} strokeDasharray="6 5" />
            <text x={30} y={134} fill={C.orange} fontSize={21} fontWeight={600}>
              10% 의 GR00T N1 과 전체의 Diffusion Policy: 46.4 − 42.6 = 3.8%p
            </text>
          </g>
        </svg>
      </Card>
      <Box x={64} y={630} w={1000} h={250} at={9.8} gap={12} title={<Head color={C.accent}>pretraining 이 주는 효과</Head>}>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 10.2) }}>
          simulation 세 곳 · 작업당 시연 100 개: Diffusion Policy <span style={mono(C.red, 22)}>33.4%</span> · GR00T N1 <span style={mono(C.green, 22)}>45.0%</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 11.2) }}>저자들: post-training 데이터가 아주 많아지면 pretraining 의 효과가 줄어드는 것이 자연스럽다</span>
      </Box>
      <Box x={1088} y={140} w={768} h={240} at={12.2} gap={10} title={<Head color={C.orange}>생성 영상을 post-training 에 섞기</Head>}>
        <span style={{ ...one(C.text, 22), opacity: prog(t, 12.5) }}>실물 데이터와 1 : 1 · IDM pseudo-action 을 붙인 영상</span>
        <span style={{ ...mono(C.orange, 40), opacity: prog(t, 14) }}>+5.8%p</span>
        <span style={{ ...one(C.muted, 22), opacity: prog(t, 14.8) }}>GR-1 실물 작업 8 가지 평균 · 작업마다 시연의 10%</span>
      </Box>
      <Box x={1088} y={400} w={768} h={250} at={18.2} gap={10} title={<Head color={C.red}>post-training 뒤 사라진 행동</Head>}>
        <span style={{ ...one(C.text, 22), opacity: prog(t, 18.5) }}>지시: 빨간 사과를 집어 바구니에 넣어라 · 사과는 일부러 왼손 쪽</span>
        <span style={{ ...one(C.green, 22), opacity: prog(t, 19.6) }}>✓ pretraining 만: 왼손으로 집어 오른손에 건넨 뒤 넣음</span>
        <span style={{ ...line(C.red, 22), opacity: prog(t, 20.8) }}>✕ post-training 뒤: 실패 · post-training 데이터는 모두 오른손만 써서 건네는 장면이 없었다</span>
      </Box>
      <Box x={1088} y={670} w={768} h={210} at={24.2} gap={10} title={<Head color={C.purple}>N1.5 · 실물 GR-1 의 language following</Head>}>
        <Bar label="N1" value={46.6} max={100} color={C.muted} at={24.6} width={420} labelW={100} unit="%" />
        <Bar label="N1.5" value={93.3} max={100} color={C.purple} at={25.4} width={420} labelW={100} unit="%" />
        <span style={{ ...one(C.muted, 21), opacity: prog(t, 26.4) }}>VLM 을 얼리고 FLARE loss 를 더함</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'data pyramid', color: C.accent, text: 'GR-1 88.4 시간 + 다른 로봇 · simulation · 생성 영상 · 사람 영상 = 8,375.7 시간', at: 0.6 },
    { tag: 'System 2 와 1', color: C.blue, text: 'Eagle-2 의 12 번째 층 φ 를 cross-attention 으로 · 로봇별 MLP (6 × 4 + 4 = 28)', at: 4.4 },
    { tag: 'flow matching', color: C.orange, text: '정답 속도 A − ε · K = 4 step 으로 action 16 개 · Thor 105 ms < 8 개 약 267 ms', at: 8.2 },
    { tag: 'latent action · 결과', color: C.green, text: 'latent action · IDM pseudo-action · 데이터 10% 로 42.6% (Diffusion Policy 전체 46.4%)', at: 12.2 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            조종 데이터 88 시간뿐인 humanoid 에게 처음 보는 물건을 옮기는 일을 어떻게 가르칠까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 32, fontWeight: 600 }}>{it.text}</span>
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
            NEXT · VLA
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>VLA + RL · World Model</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            성공 여부를 reward 로 삼아 VLA 를 더 학습하기 · 다음 장면을 예측하는 모델을 planning 에 쓰기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/groot (GR00T N1 · LAPA · DexMimicGen · DreamGen 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseFrames = () => (
  <PauseWrite
    question="GR-1 조종 데이터 88.4 시간을 20 Hz (1초에 20 번) 로 기록했다면 frame 은 모두 몇 개일까? 논문 표 7 은 6.4M frame 으로 적었다."
    answer={
      <>
        88.4 × 3600 × 20 = 6,364,800 ≈ 636 만 frame
        <br />
        논문 표 7 의 6.4M frame 과 맞는다
      </>
    }
  />
)

const PauseEncoder = () => (
  <PauseWrite
    question="상태 숫자가 20 개인 로봇에 공통 길이 4 의 Linear layer 하나로 state encoder 를 만들면 parameter 는 몇 개일까? π0 처럼 18 칸으로 맞추면 무엇이 문제일까?"
    answer={
      <>
        20 × 4 + 4 = 84 개 · 18 칸에는 20 개가 들어가지 않는다
        <br />
        공개 구현은 상태 64 칸에 넣고 빈 로봇 번호의 weight 만 새로 학습
      </>
    }
  />
)

const PauseEuler = () => (
  <PauseWrite
    question="ε = (2.0, 0), A = (0, 1.0) 이고 network 가 정답 속도를 낸다. Euler 4 step 중 2 step 뒤의 값은?"
    answer={
      <>
        속도 A − ε = (−2.0, 1.0) → step 마다 (−0.5, 0.25)
        <br />
        (2.0, 0) → (1.5, 0.25) → (1.0, 0.5)
      </>
    }
  />
)

const PauseGain = () => (
  <PauseWrite
    question="데이터를 10% 에서 전체로 늘렸을 때 성공률이 오른 폭은 두 모델이 각각 몇 %p 일까?"
    answer={
      <>
        Diffusion Policy: 46.4 − 10.2 = 36.2%p
        <br />
        GR00T-N1-2B: 76.8 − 42.6 = 34.2%p
        <br />
        오른 폭은 비슷하지만 GR00T N1 은 10% 에서 이미 42.6%
      </>
    }
  />
)

export function Groot() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        pyramid: Pyramid,
        hours: Hours,
        'pause-frames': PauseFrames,
        systems: Systems,
        embodiment: Embodiment,
        'pause-encoder': PauseEncoder,
        flow: Flow,
        timing: Timing,
        'pause-euler': PauseEuler,
        latent: Latent,
        results: Results,
        'pause-gain': PauseGain,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
