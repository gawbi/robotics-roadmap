import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './vla-reasoning.narration.json'
import { script } from './vla-reasoning.script'

// Numbers follow lessons/vla-reasoning/README.md (see vla-reasoning.script.ts). The ER photo's box and trajectory are
// schematic (marked 모식도); every number on screen is the lesson's.

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
function Bar({ label, value, max, color, at, width = 520, unit = '', fmt, sub, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; sub?: string; labelW?: number }) {
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
      {sub && (
        <span style={{ fontSize: 22, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>
          {sub}
        </span>
      )}
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

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

function Flow({ steps, color, at, gap = 0.5, last }: { steps: string[]; color: string; at: number; gap?: number; last?: string }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
      {last && (
        <span style={{ fontSize: 26, fontWeight: 600, color, marginLeft: 8, opacity: prog(t, at + steps.length * gap) }}>
          {last}
        </span>
      )}
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
            FRONTIER · REASONING VLA
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Reasoning VLA</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 32, color: C.muted }}>
            π0.5 · Hi Robot · ECoT · <span style={{ color: C.accent }}>knowledge insulation</span> · Gemini Robotics
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            action 앞에 subtask 글이나 물체 위치를 먼저 내고, 그 글을 보고 움직이는 VLA
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
        <div style={{ padding: '26px 32px', display: 'grid', gap: 18 }}>
          <Label size={24}>π0 · 사진과 짧은 지시문에서 action chunk 로</Label>
          <Flow steps={['사진 + "pick up the plate"', 'π0', 'action chunk', '50 Hz 로봇 · 0.5 초마다 다시 추론']} color={C.blue} at={0.6} />
          <div style={{ opacity: prog(t, 4.6) }}>
            <Label size={24}>사람의 지시는 몇 분짜리이고, 일하는 도중에 고쳐 말하기도 한다</Label>
          </div>
          <Flow steps={['"clean the kitchen" · 몇 분', '도중에 "that\'s not trash"', '지금이 몇 번째 단계인지는 사진만 보고 알아내야']} color={C.orange} at={4.8} gap={0.4} />
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 462, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          다음에 할 일을 먼저 글로 정하고 그 글을 보고 움직이면서도,
          <br />
          <span style={{ color: C.accent }}>1 초에 50 개씩 필요한 관절 목표를 제때 낼 수 있을까?</span>
        </div>
      </Appear>
      <Appear at={6} style={{ position: 'absolute', left: 330, top: 650 }}>
        <Panel x={0} y={0} w={1260} h={230}>
        <div style={{ padding: '20px 30px', display: 'grid', gap: 12 }}>
          <Label size={24}>reasoning VLA · action 앞에 중간 결과를 먼저 내는 VLA</Label>
          <div style={{ display: 'flex', gap: 16 }}>
            <Chip at={6.2}>subtask 글 · "pick up the pillow"</Chip>
            <Chip at={6.6} color={C.green}>물체 위치 · bounding box</Chip>
            <Chip at={7} color={C.orange}>그 글을 조건으로 action chunk</Chip>
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 7.2) }}>π0.5 는 "clean the bedroom" 을 받으면 "pick up the pillow" 를 먼저 내고, 학습 데이터에 없던 집에서 10 ~ 15 분짜리 정리 작업을 해냈다</span>
        </div>
        </Panel>
      </Appear>
    </AbsoluteFill>
  )
}

// ---------- S1: flat VLA and the hierarchy ----------

function Flat() {
  const t = useSec()
  const x0 = 262
  const pxPerSec = 88
  const sx = (s: number) => x0 + s * pxPerSec
  const subtasks: [string, number, number, string][] = [
    ['pick up the plate', 0, 2, C.green],
    ['put the plate in the sink', 2, 5, C.blue],
    ['pick up the cup', 5, 7, C.orange],
    ['put the cup in the sink', 7, 10, C.purple],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1180} h={500}>
        <svg width={1180} height={500}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            10 초 동안의 추론 · 0.5 초마다 한 번
          </text>
          {/* flat VLA row */}
          <g opacity={prog(t, 0.8)}>
            <text x={30} y={128} fill={C.red} fontSize={24} fontWeight={700}>
              flat VLA
            </text>
            <text x={30} y={156} fill={C.muted} fontSize={21}>
              지시문만 받는다
            </text>
            {Array.from({ length: 20 }, (_, i) => (
              <rect key={i} x={sx(i * 0.5) + 3} y={110} width={pxPerSec / 2 - 6} height={44} rx={6} fill={`${C.red}33`} stroke={C.red} strokeWidth={1.5} opacity={prog(t, 1 + i * 0.05, 0.3)} />
            ))}
            <text x={sx(5)} y={94} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 2.2)}>
              "clean the kitchen" · 20 번 모두 같은 글
            </text>
          </g>
          {/* hierarchy rows */}
          <g opacity={prog(t, 12.5)}>
            <text x={30} y={252} fill={C.accent} fontSize={24} fontWeight={700}>
              계층 구조
            </text>
            <text x={30} y={280} fill={C.muted} fontSize={21}>
              high-level 의 subtask
            </text>
            <text x={30} y={354} fill={C.muted} fontSize={21}>
              low-level 의 추론
            </text>
            {subtasks.map(([name, a, b, c], i) => (
              <g key={name} opacity={prog(t, 12.8 + i * 0.5)}>
                <rect x={sx(a) + 3} y={236} width={(b - a) * pxPerSec - 6} height={50} rx={8} fill={`${c}22`} stroke={c} strokeWidth={2} />
                <text x={sx((a + b) / 2)} y={268} textAnchor="middle" fill={c} fontSize={21} fontWeight={600}>
                  {name}
                </text>
                {Array.from({ length: (b - a) * 2 }, (_, k) => (
                  <rect key={k} x={sx(a + k * 0.5) + 3} y={320} width={pxPerSec / 2 - 6} height={40} rx={6} fill={`${c}33`} stroke={c} strokeWidth={1.5} />
                ))}
                <text x={sx((a + b) / 2)} y={392} textAnchor="middle" fill={c} fontSize={21} fontFamily={MONO}>
                  같은 글 {(b - a) * 2} 번
                </text>
              </g>
            ))}
          </g>
          {/* axis */}
          <g opacity={prog(t, 0.8)}>
            <line x1={sx(0)} x2={sx(10)} y1={420} y2={420} stroke={C.dim} strokeWidth={2} />
            {[0, 2, 5, 7, 10].map((s) => (
              <g key={s}>
                <line x1={sx(s)} x2={sx(s)} y1={414} y2={426} stroke={C.dim} strokeWidth={2} />
                <text x={sx(s)} y={452} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
                  {s === 10 ? '10 초' : s}
                </text>
              </g>
            ))}
          </g>
          <text x={30} y={488} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 6.2)}>
            10 분 작업이면 600 ÷ 0.5 = 1200 번 추론 · 1200 번 모두 같은 지시문
          </text>
        </svg>
      </Panel>
      <Box x={1276} y={140} w={580} h={240} at={6} title={<Head color={C.red}>flat VLA 의 추론 횟수</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...mono(C.text, 26), opacity: prog(t, 6.4) }}>10 분 = 600 초</span>
          <span style={{ ...mono(C.red, 28), opacity: prog(t, 7.2) }}>600 ÷ 0.5 = 1200 번</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 8.4) }}>접시를 집을 차례인지 서랍을 닫을 차례인지는 지시문에 없다 · 사진만 보고 골라야 한다</span>
        </div>
      </Box>
      <Box x={1276} y={400} w={580} h={240} at={12.5} title={<Head color={C.accent}>subtask 하나가 2 초면</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ ...mono(C.accent, 28), opacity: prog(t, 13) }}>2 ÷ 0.5 = 4 번</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 14) }}>같은 글을 4 번 받고 다음 글로 넘어간다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 15.2) }}>Hi Robot 은 시연을 짧은 동작 단위로 잘랐고, 한 단위는 대개 1 ~ 3 초였다</span>
        </div>
      </Box>
      <Box x={64} y={660} w={880} h={220} at={19} color={`${C.accent}66`} title={<Head color={C.accent}>high-level policy</Head>}>
        <span style={{ ...line(C.text, 25), opacity: prog(t, 19.4) }}>긴 지시 → 몇 초짜리 subtask 글</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 20) }}>"clean the kitchen" 을 읽고 "pick up the plate" 를 고른다</span>
      </Box>
      <Box x={976} y={660} w={880} h={220} at={21} color={`${C.green}66`} title={<Head color={C.green}>low-level policy</Head>}>
        <span style={{ ...line(C.text, 25), opacity: prog(t, 21.4) }}>subtask 글 → action chunk · 1 초 안팎의 움직임</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 22) }}>"pick up the plate" 만 읽고 팔을 움직인다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Hierarchy() {
  const t = useSec()
  const box = (x: number, y: number, w: number, h: number, color: string, at: number, lines: [string, string, number][]) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={`${color}12`} stroke={color} strokeWidth={2.5} />
      {lines.map(([s, c, dy], i) => (
        <text key={i} x={x + 22} y={y + dy} fill={c} fontSize={i === 0 ? 25 : 21} fontWeight={i === 0 ? 700 : 500}>
          {s}
        </text>
      ))}
    </g>
  )
  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, at: number, label?: string, lx?: number, ly?: number) => (
    <g opacity={prog(t, at)}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} />
      <circle cx={x2} cy={y2} r={6} fill={color} />
      {label && (
        <text x={lx ?? (x1 + x2) / 2} y={ly ?? (y1 + y2) / 2 - 10} textAnchor="middle" fill={color} fontSize={21} fontWeight={600}>
          {label}
        </text>
      )}
    </g>
  )
  const seg: [string, number, string][] = [
    ['prefill 47', 47, C.blue],
    ['decode 6 × 13.2 = 79.2', 79.2, C.orange],
    ['low-level 73', 73, C.green],
  ]
  const scale = 1.5
  let acc = 0
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            계층 VLA 의 구조
          </text>
          {box(30, 70, 300, 120, C.muted, 0.5, [
            ['사용자', C.text, 34],
            ['"clean the kitchen"', C.muted, 70],
            ['"that\'s not trash"', C.muted, 100],
          ])}
          {box(30, 230, 300, 56, C.muted, 0.7, [['카메라 사진', C.text, 36]])}
          {box(30, 330, 300, 56, C.muted, 6.2, [['관절 각도', C.text, 36]])}
          {box(420, 70, 550, 170, C.accent, 0.8, [
            ['high-level policy (VLM)', C.accent, 36],
            ['입력: 사진 · 전체 지시문 · 사용자가 중간에 한 말', C.text, 72],
            ['출력: subtask 글 (Hi Robot 은 로봇의 대답도)', C.text, 104],
            ['Hi Robot: 1 초마다, 또는 사용자가 말할 때', C.muted, 140],
          ])}
          {box(420, 330, 550, 170, C.green, 6, [
            ['low-level policy (VLA)', C.green, 36],
            ['입력: 사진 · 관절 각도 · high-level 이 낸 subtask 글', C.text, 72],
            ['출력: action chunk · π0 기준 0.5 초마다', C.text, 104],
            ['전체 지시문 ✕ · "pick up the plate" 만 읽는다', C.muted, 140],
          ])}
          {box(420, 590, 550, 70, C.muted, 7.6, [['로봇 · 50 Hz 로 action 실행', C.text, 42]])}
          {arrow(330, 130, 420, 130, C.muted, 0.9)}
          {arrow(330, 258, 420, 200, C.muted, 1.1)}
          {arrow(330, 268, 420, 400, C.muted, 6.3)}
          {arrow(330, 358, 420, 430, C.muted, 6.4)}
          {arrow(695, 240, 695, 330, C.accent, 1.4)}
          <text x={678} y={292} textAnchor="end" fill={C.accent} fontSize={21} fontWeight={600} opacity={prog(t, 1.4)}>
            subtask 글 · "pick up the plate"
          </text>
          {arrow(695, 500, 695, 590, C.green, 7.4)}
          <text x={712} y={552} fill={C.green} fontSize={21} fontWeight={600} opacity={prog(t, 7.4)}>
            action chunk
          </text>
          <text x={30} y={698} fill={C.text} fontSize={22} opacity={prog(t, 12)}>
            <tspan fill={C.blue} fontWeight={700}>Hi Robot</tspan> · PaliGemma-3B 에서 출발한 VLM 두 개를 따로 학습 (low-level 은 π0)
          </text>
          <text x={30} y={728} fill={C.text} fontSize={22} opacity={prog(t, 14.4)}>
            <tspan fill={C.orange} fontWeight={700}>π0.5</tspan> · weight 한 벌이 subtask 글을 먼저 내고 그 글을 보고 action (chain-of-thought 에 견줌)
          </text>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={245} at={0.3} title={<Head color={C.accent}>두 policy 의 비교</Head>}>
        <div style={{ display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', gap: 14, opacity: prog(t, 0.5) }}>
            <span style={{ width: 120 }} />
            <span style={{ width: 290, fontSize: 21, color: C.accent, fontWeight: 600 }}>high-level</span>
            <span style={{ width: 280, fontSize: 21, color: C.green, fontWeight: 600, opacity: prog(t, 6.2) }}>low-level</span>
          </div>
          {(
            [
              ['입력', '사진 · 전체 지시문 · 사용자의 말', '사진 · 관절 각도 · subtask 글', 0.7, 6.4],
              ['출력', 'subtask 글 (대답도)', 'action chunk', 1.1, 6.8],
              ['다시 계산', '1 초마다, 또는 말할 때', 'π0 기준 0.5 초마다', 1.5, 7.2],
            ] as [string, string, string, number, number][]
          ).map(([k, h, l, at1, at2]) => (
            <div key={k} style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
              <span style={{ width: 120, fontSize: 21, color: C.muted, opacity: prog(t, at1) }}>{k}</span>
              <span style={{ width: 290, fontSize: 21, color: C.text, opacity: prog(t, at1) }}>{h}</span>
              <span style={{ width: 280, fontSize: 21, color: C.text, opacity: prog(t, at2) }}>{l}</span>
            </div>
          ))}
        </div>
      </Box>
      <Box x={1096} y={405} w={760} h={220} at={18.5} title={<Head color={C.orange}>π0.5 의 high-level 비교 · 모의 집 네 작업의 평균 진행률</Head>}>
        <div style={{ display: 'grid', gap: 6 }}>
          <Bar label="π0.5 (subtask 글)" value={79} max={100} color={C.orange} at={18.9} width={300} fmt="약 79" unit="%" labelW={200} />
          <Bar label="implicit HL" value={71} max={100} color={C.blue} at={19.9} width={300} fmt="약 71" unit="%" labelW={200} />
          <Bar label="GPT-4 가 고름" value={58} max={100} color={C.red} at={20.9} width={300} fmt="약 58" unit="%" labelW={200} />
          <span style={{ ...line(C.dim, 20), opacity: prog(t, 22) }}>implicit HL 은 학습에만 subtask 예시 · 그림 13 어림값</span>
        </div>
      </Box>
      <Box x={1096} y={645} w={760} h={235} at={25} title={<Head color={C.green}>"that's not trash" → 새 chunk 까지 (RTX 4090)</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: prog(t, 25.3) }}>
            <svg width={300} height={30}>
              {seg.map(([, v, c], i) => {
                const x = acc * scale
                acc += v
                return <rect key={i} x={x} y={2} width={v * scale * prog(t, 25.5 + i * 0.4, 0.5)} height={26} rx={4} fill={c} />
              })}
            </svg>
            <span style={mono(C.green, 24)}>199.2 ms · action 약 10 개</span>
          </div>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 26.6) }}>
            말을 듣자마자 · <span style={{ color: C.blue }}>■</span> prefill 47 ms <span style={{ color: C.orange }}>■</span> decode 6 × 13.2 = 79.2 ms <span style={{ color: C.green }}>■</span> low-level 73 ms
          </span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 28.5) }}>1 초마다만 계산하면 (가장 늦은 경우)</span>
          <span style={{ ...mono(C.red, 22), opacity: prog(t, 28.5) }}>1000 + 199.2 = 1199.2 ms · action 약 60 개</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S2: ECoT and the cost of reasoning tokens ----------

function Ecot() {
  const t = useSec()
  const stages: [string, string, string, number][] = [
    ['TASK', '지시를 다시 쓴다', C.blue, 6.2],
    ['PLAN', '전체 계획', C.blue, 6.55],
    ['SUBTASK', '지금 할 단계와 이유', C.blue, 6.9],
    ['MOVE', '다음 움직임의 방향', C.orange, 7.25],
    ['GRIPPER', 'gripper 끝의 pixel', C.orange, 7.6],
    ['OBJECTS', '물체 이름과 상자', C.orange, 7.95],
    ['ACTION', 'action token 7 개', C.green, 0.8],
  ]
  const examples: [string, string, number][] = [
    ['TASK', 'Place the watermelon on the towel', 12.8],
    ['PLAN', 'Move to watermelon, grasp it, …', 13.2],
    ['SUBTASK', 'Move to the watermelon', 13.6],
    ['MOVE', 'Move backward · 수박이 뒤쪽', 14],
    ['GRIPPER', '[156, 55] · gripper 끝 pixel', 14.4],
    ['OBJECTS', 'Watermelon, Towel, Spoon · box', 14.8],
  ]
  const rows: [string, number, number, string, number][] = [
    ['Octo', 21, 16, C.muted, 18.8],
    ['OpenVLA (같은 Bridge 데이터)', 44, 30, C.red, 19.2],
    ['RT-2-X (55B)', 47, 48, C.muted, 19.6],
    ['Naive CoT (계획·subtask 만)', 48, 48, C.purple, 20],
    ['ECoT', 66, 64, C.green, 20.4],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={230}>
        <svg width={1792} height={230}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            ECoT 의 추론 순서 · OpenVLA 는 그대로 두고 학습 데이터의 action 앞에 글을 붙인다
          </text>
          {stages.map(([name, sub, c, at], i) => (
            <g key={name} opacity={prog(t, at)}>
              <rect x={30 + i * 246} y={66} width={220} height={84} rx={12} fill={`${c}14`} stroke={c} strokeWidth={2} />
              <text x={140 + i * 246} y={101} textAnchor="middle" fill={c} fontSize={25} fontWeight={700} fontFamily={MONO}>
                {name}
              </text>
              <text x={140 + i * 246} y={133} textAnchor="middle" fill={C.text} fontSize={20}>
                {sub}
              </text>
              {i < 6 && (
                <text x={30 + i * 246 + 232} y={113} textAnchor="middle" fill={C.muted} fontSize={26}>
                  →
                </text>
              )}
            </g>
          ))}
          <g opacity={prog(t, 8.4)}>
            <line x1={30} x2={742} y1={170} y2={170} stroke={C.blue} strokeWidth={3} />
            <text x={386} y={200} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
              글 추론 · 보통의 chain-of-thought
            </text>
          </g>
          <g opacity={prog(t, 9.4)}>
            <line x1={768} x2={1480} y1={170} y2={170} stroke={C.orange} strokeWidth={3} />
            <text x={1124} y={200} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              embodied 추론 · 사진과 로봇 상태를 봐야 쓸 수 있다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={64} y={390} w={1000} h={200} at={12.5} title={<Head color={C.accent}>논문 그림 3 의 예</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24, rowGap: 6 }}>
          {examples.map(([k, v, at]) => (
            <div key={k} style={{ display: 'flex', gap: 12, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ fontFamily: MONO, fontSize: 20, color: k === 'TASK' || k === 'PLAN' || k === 'SUBTASK' ? C.blue : C.orange, width: 100, whiteSpace: 'nowrap' }}>{k}</span>
              <span style={{ fontSize: 20, color: C.text, whiteSpace: 'nowrap' }}>{v}</span>
            </div>
          ))}
        </div>
      </Box>
      <Box x={1096} y={390} w={760} h={200} at={15.5} title={<Head color={C.orange}>한 step 에 내는 token</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="OpenVLA" value={7} max={350} color={C.green} at={15.8} width={320} fmt="7" unit=" 개" labelW={110} />
          <Bar label="ECoT" value={350} max={350} color={C.orange} at={16.4} width={320} fmt="350" unit=" 개" sub="추론 + action" labelW={110} />
        </div>
      </Box>
      <Box x={64} y={610} w={1000} h={270} at={18.5} title={<Head color={C.accent}>WidowX 팔 · 방법마다 314 번 시도 · 성공률</Head>}>
        <div style={{ display: 'grid', gap: 5 }}>
          <div style={{ display: 'flex', gap: 16, opacity: prog(t, 18.7) }}>
            <span style={{ width: 300 }} />
            <span style={{ width: 280, fontSize: 20, color: C.muted }}>학습 때와 같은 카메라</span>
            <span style={{ width: 280, fontSize: 20, color: C.muted, marginLeft: 16 }}>다른 카메라</span>
          </div>
          {rows.map(([name, a, b, c, at]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, at) }}>
              <span style={{ width: 300, fontSize: 21, color: c === C.muted ? C.muted : C.text, textAlign: 'right', whiteSpace: 'nowrap' }}>{name}</span>
              {[a, b].map((v, k) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, width: 280, marginLeft: k ? 16 : 0 }}>
                  <div style={{ width: 190, height: 20, borderRadius: 6, background: C.grid }}>
                    <div style={{ width: `${(v / 70) * 100 * prog(t, at, 0.8)}%`, height: '100%', borderRadius: 6, background: c }} />
                  </div>
                  <span style={mono(c, 23)}>{v}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Box>
      <Box x={1096} y={610} w={760} h={270} at={24.5} title={<Head color={C.green}>같은 VLM · 같은 로봇 데이터 · 차이는 추론 글뿐</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...mono(C.green, 24), opacity: prog(t, 24.8) }}>66 − 44 = 22%p · 64 − 30 = 34%p</span>
          <span style={{ ...mono(C.green, 24), opacity: prog(t, 25.6) }}>(22 + 34) ÷ 2 = 28%p → 초록의 28%</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 27) }}>
            Naive CoT (계획·subtask 만) <span style={mono(C.purple, 23)}>48%</span> → 장면에 묶인 세 단계가 이득의 큰 몫
          </span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 28.4) }}>사람이 말 한 번으로 추론 글을 고치자 32% → 80% (OpenVLA 의 지시문을 고치면 16% → 44%)</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function TokenCost() {
  const t = useSec()
  const ax = 300
  const aw = 760
  const px = (ms: number) => ax + (ms / 5000) * aw
  const ways: [string, string, string, number][] = [
    ['위쪽 추론을 여러 step 고정', 'ECoT 가 계획·subtask 를 5 step 마다 새로 쓴다', '63% → 72% · 24% 빨라짐', 25.8],
    ['두 사본을 나란히 실행', '한 사본은 추론을 고치고 다른 사본은 action', '65% · 40% 빨라짐 · 계산 2 배', 27],
    ['학습에만 추론을 쓴다', 'ECoT-Lite · reasoning dropout', '약 3 배 빠름 · 10 ~ 19% 높음', 28.2],
    ['짧은 숨은 추론', 'Fast-ThinkAct · 연속값 token 몇 개로 생각', '지연 시간 최대 89.3% 줄임', 29.4],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={440}>
        <svg width={1100} height={440}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            추론 한 번의 시간 = prefill + 새 token 수 × decode
          </text>
          <g opacity={prog(t, 0.8)}>
            {['token 1', 'token 2', 'token 3', 'token 4', '…'].map((s, i) => (
              <g key={s} opacity={prog(t, 1 + i * 0.35)}>
                <rect x={30 + i * 150} y={66} width={120} height={42} rx={10} fill={`${C.orange}14`} stroke={C.orange} strokeWidth={1.5} />
                <text x={90 + i * 150} y={94} textAnchor="middle" fill={C.orange} fontSize={21} fontFamily={MONO}>
                  {s}
                </text>
                {i < 4 && (
                  <text x={165 + i * 150} y={94} textAnchor="middle" fill={C.muted} fontSize={24}>
                    →
                  </text>
                )}
              </g>
            ))}
            <text x={30} y={140} fill={C.muted} fontSize={21} opacity={prog(t, 2.8)}>
              앞의 token 을 보고 다음 token 을 고른다 · 새 token 수만큼 decode 를 차례로 되풀이한다
            </text>
          </g>
          <g opacity={prog(t, 6.2)}>
            <text x={30} y={180} fill={C.blue} fontSize={23} fontWeight={600}>
              prefill 47 ms
            </text>
            <text x={200} y={180} fill={C.muted} fontSize={21}>
              입력 token 을 한꺼번에 읽어 KV cache 를 채움
            </text>
            <text x={680} y={180} fill={C.orange} fontSize={23} fontWeight={600}>
              decode 13.2 ms / token
            </text>
            <text x={30} y={208} fill={C.dim} fontSize={20}>
              Hi Robot 이 PaliGemma-3B · RTX 4090 에서 잰 값을 빌린 어림 · 모델과 GPU 가 다르면 값도 다르다
            </text>
          </g>
          <text x={30} y={246} fill={C.green} fontSize={23} fontFamily={MONO} fontWeight={600} opacity={prog(t, 12.8)}>
            47 + 7 × 13.2 = 139.4 ms → 1 초에 약 7.2 번
          </text>
          <text x={30} y={278} fill={C.orange} fontSize={23} fontFamily={MONO} fontWeight={600} opacity={prog(t, 16.4)}>
            47 + 350 × 13.2 = 4667 ms → 1 초에 약 0.21 번
          </text>
          {/* bars */}
          <g opacity={prog(t, 12.5)}>
            <text x={ax - 16} y={316} textAnchor="end" fill={C.green} fontSize={22} fontWeight={600}>
              token 7 개 (action 만)
            </text>
            <rect x={ax} y={298} width={(px(139.4) - ax) * prog(t, 12.8, 0.6)} height={26} rx={4} fill={C.green} />
            <text x={px(139.4) + 12} y={316} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              139.4 ms
            </text>
          </g>
          <g opacity={prog(t, 15.5)}>
            <text x={ax - 16} y={354} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
              token 350 개 (ECoT)
            </text>
            <rect x={ax} y={336} width={(px(4667) - ax) * prog(t, 15.8, 1.2)} height={26} rx={4} fill={C.orange} />
            <text x={px(4667) - 12} y={354} textAnchor="end" fill={C.bg} fontSize={22} fontFamily={MONO} fontWeight={700} opacity={prog(t, 16.8)}>
              4667 ms
            </text>
          </g>
          <g opacity={prog(t, 0.8)}>
            <line x1={px(1000)} x2={px(1000)} y1={290} y2={372} stroke={C.accent} strokeWidth={2} strokeDasharray="8 6" />
            <line x1={ax} x2={px(5000)} y1={374} y2={374} stroke={C.dim} strokeWidth={2} />
            {[0, 1000, 2000, 3000, 4000, 5000].map((ms) => (
              <g key={ms}>
                <line x1={px(ms)} x2={px(ms)} y1={370} y2={380} stroke={C.dim} strokeWidth={2} />
                <text x={px(ms)} y={402} textAnchor="middle" fill={ms === 1000 ? C.accent : C.dim} fontSize={20} fontFamily={MONO}>
                  {ms === 5000 ? '5000 ms' : ms}
                </text>
              </g>
            ))}
            <text x={px(1000) - 40} y={428} fill={C.accent} fontSize={20}>
              ↑ 1 초 · 50 Hz 로봇이 action 50 개를 실행하는 시간
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1196} y={140} w={660} h={440} at={6} title={<Head color={C.blue}>Hi Robot 의 측정값 · RTX 4090</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          {(
            [
              ['prefill', '47 ms', '입력 token 을 한꺼번에 읽어 KV cache 를 채운다', 6.4],
              ['decode', '13.2 ms / token', 'cache 를 보며 새 token 을 하나씩 만든다', 7.6],
              ['low-level', '73 ms', 'π0 와 같은 chunk 계산', 8.8],
            ] as [string, string, string, number][]
          ).map(([k, v, d, at]) => (
            <div key={k} style={{ display: 'grid', gap: 2, opacity: prog(t, at) }}>
              <span style={line(C.text, 22)}>
                <span style={{ color: C.blue, fontWeight: 600 }}>{k}</span> <span style={mono(C.text, 22)}>{v}</span>
              </span>
              <span style={line(C.muted, 20)}>{d}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 12, display: 'grid', gap: 10, opacity: prog(t, 19) }}>
          <Head color={C.orange} size={24}>
            실제로 잰 값 · ECoT-Lite 논문 · 1 초에 action 을 내는 횟수
          </Head>
          <Bar label="ECoT · H100 · FP8 컴파일" value={1.2} max={4} color={C.orange} at={19.4} width={150} fmt="1 ~ 1.2" unit=" 번" labelW={240} />
          <Bar label="ECoT · RTX 4090" value={0.5} max={4} color={C.red} at={20.4} width={150} fmt="0.3 ~ 0.5" unit=" 번" labelW={240} />
          <Bar label="추론 없는 VLA · RTX 4090" value={4} max={4} color={C.green} at={21.6} width={150} fmt="3 ~ 4" unit=" 번" labelW={240} />
        </div>
      </Box>
      <Box x={64} y={600} w={1792} h={280} at={25.5} title={<Head color={C.accent}>비용을 줄이는 네 가지</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
          {ways.map(([h, s, r, at], i) => (
            <div key={h} style={{ display: 'grid', gap: 6, opacity: prog(t, at) }}>
              <Label color={C.text} size={24} weight={600}>
                <span style={{ fontFamily: MONO, color: C.accent }}>{i + 1}</span> {h}
              </Label>
              <span style={line(C.muted, 21)}>{s}</span>
              <span style={{ ...line(C.green, 22), fontWeight: 600 }}>{r}</span>
            </div>
          ))}
        </div>
        <span style={{ ...line(C.dim, 21), opacity: prog(t, 31) }}>빈 "thinking token" 을 같은 개수 넣으면 평균 3.8% 떨어진다 · 이득은 계산량이 아니라 뜻 있는 추론에서 온다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S3: knowledge insulation ----------

function KiGradient() {
  const t = useSec()
  const node = (x: number, y: number, w: number, h: number, color: string, at: number, lines: [string, string, number][]) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={`${color}12`} stroke={color} strokeWidth={2.5} />
      {lines.map(([s, c, dy], i) => (
        <text key={i} x={x + w / 2} y={y + dy} textAnchor="middle" fill={c} fontSize={i === 0 ? 26 : 21} fontWeight={i === 0 ? 700 : 500}>
          {s}
        </text>
      ))}
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1040} h={740}>
        <svg width={1040} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            π0 식 학습 · action expert 의 gradient 가 backbone 까지 간다
          </text>
          {node(40, 90, 440, 180, C.blue, 0.6, [
            ['VLM backbone', C.blue, 40],
            ['약 30 억 parameter', C.muted, 72],
            ['사진 · 지시문 · 상태를 읽는다', C.text, 108],
            ['subtask 를 고르는 지식이 여기 있다', C.text, 140],
          ])}
          {node(580, 90, 420, 180, C.orange, 0.9, [
            ['action expert', C.orange, 40],
            ['약 3 억 parameter · 무작위 weight 에서 시작', C.muted, 72],
            ['noise 가 섞인 action → 연속 action', C.text, 108],
            ['flow matching 으로 배운다', C.text, 140],
          ])}
          <g opacity={prog(t, 1.3)}>
            <line x1={480} y1={160} x2={580} y2={160} stroke={C.muted} strokeWidth={3} />
            <circle cx={580} cy={160} r={6} fill={C.muted} />
            <text x={530} y={146} textAnchor="middle" fill={C.muted} fontSize={20}>
              key · value
            </text>
          </g>
          {node(40, 330, 440, 64, C.blue, 11.5, [['FAST token loss · gradient +0.2', C.blue, 40]])}
          {node(580, 330, 420, 64, C.orange, 6.2, [['flow matching loss · gradient −0.5', C.orange, 40]])}
          {/* gradient arrows (dashed, upward) */}
          <g opacity={prog(t, 11.8)}>
            <line x1={160} y1={330} x2={160} y2={272} stroke={C.blue} strokeWidth={3} strokeDasharray="8 6" />
            <circle cx={160} cy={272} r={6} fill={C.blue} />
          </g>
          <g opacity={prog(t, 6.4)}>
            <line x1={790} y1={330} x2={790} y2={272} stroke={C.orange} strokeWidth={3} strokeDasharray="8 6" />
            <circle cx={790} cy={272} r={6} fill={C.orange} />
            <path d="M 580 180 L 480 180" stroke={C.red} strokeWidth={3} strokeDasharray="8 6" fill="none" />
            <circle cx={480} cy={180} r={6} fill={C.red} />
            <text x={530} y={222} textAnchor="middle" fill={C.red} fontSize={18} fontWeight={600}>
              gradient
            </text>
          </g>
          <g opacity={prog(t, 12.4)}>
            <text x={400} y={316} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={700}>
              −0.5 가 backbone 의 weight w 까지 닿는다
            </text>
          </g>
          <g opacity={prog(t, 24)}>
            <rect x={508} y={162} width={44} height={36} rx={8} fill={C.bg} stroke={C.red} strokeWidth={2.5} />
            <text x={530} y={189} textAnchor="middle" fill={C.red} fontSize={26} fontWeight={700}>
              ✕
            </text>
            <text x={530} y={250} textAnchor="middle" fill={C.red} fontSize={19} fontWeight={600}>
              차단
            </text>
          </g>
          <text x={40} y={460} fill={C.text} fontSize={21} opacity={prog(t, 6.6)}>
            지식이 상하는 이유 · flow matching loss 의 gradient 가 attention 을 거쳐 backbone 의 weight 까지 고친다
          </text>
          <g opacity={prog(t, 12)}>
            <text x={40} y={530} fill={C.text} fontSize={23} fontWeight={600}>
              gradient 의 부호 읽기
            </text>
            <text x={40} y={566} fill={C.muted} fontSize={21}>
              + 면 w 를 늘릴 때 loss 가 늘어난다 → w 를 줄여야 한다 · − 면 그 반대
            </text>
            <text x={40} y={600} fill={C.muted} fontSize={21}>
              학습 초기의 action expert 는 무작위라서 flow matching loss 의 gradient 가 반대쪽을 가리킬 수 있다
            </text>
          </g>
          <text x={40} y={680} fill={C.dim} fontSize={21} opacity={prog(t, 18)}>
            한 step 의 변화 = −learning rate × gradient · learning rate 는 0.1 로 둔다
          </text>
        </svg>
      </Panel>
      <Box x={1136} y={140} w={720} h={740} at={0.3} title={<Head color={C.accent}>backbone 의 weight w 하나로 보기</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.text, 21), opacity: prog(t, 0.9) }}>
            논문의 예 · π0 는 <span style={{ color: C.red, fontWeight: 600 }}>숟가락을 통에 넣으라는 지시를 무시하고 쓰레기를 집었다</span>
          </span>
          <div style={{ display: 'grid', gap: 6, opacity: prog(t, 11.8) }}>
            <span style={mono(C.blue, 26)}>FAST loss 의 gradient +0.2</span>
            <span style={line(C.muted, 21)}>action 을 FAST token 으로 바꾼 정답을 맞히는 loss · w 를 줄여야 줄어든다</span>
          </div>
          <div style={{ display: 'grid', gap: 6, opacity: prog(t, 14) }}>
            <span style={mono(C.orange, 26)}>flow matching loss 의 gradient −0.5</span>
            <span style={line(C.muted, 21)}>무작위 action expert 가 거꾸로 보낸다</span>
          </div>
          <div style={{ padding: '14px 20px', borderRadius: 16, background: `${C.red}12`, border: `1.5px solid ${C.red}66`, display: 'grid', gap: 5, opacity: prog(t, 18) }}>
            <Label color={C.red} size={23} weight={600}>
              두 gradient 를 모두 받는다
            </Label>
            <span style={mono(C.text, 25)}>0.2 + (−0.5) = −0.3</span>
            <span style={{ ...mono(C.text, 25), opacity: prog(t, 19.5) }}>w: −0.1 × (−0.3) = +0.03</span>
            <span style={{ ...line(C.red, 23), fontWeight: 600, opacity: prog(t, 21) }}>w 가 늘어 FAST loss 가 늘어난다 ✕</span>
          </div>
          <div style={{ padding: '14px 20px', borderRadius: 16, background: `${C.green}12`, border: `1.5px solid ${C.green}66`, display: 'grid', gap: 5, opacity: prog(t, 24) }}>
            <Label color={C.green} size={23} weight={600}>
              action expert 쪽을 막는다
            </Label>
            <span style={mono(C.text, 25)}>0.2 만 남는다</span>
            <span style={{ ...mono(C.text, 25), opacity: prog(t, 25.5) }}>w: −0.1 × 0.2 = −0.02</span>
            <span style={{ ...line(C.green, 23), fontWeight: 600, opacity: prog(t, 27) }}>FAST loss 가 줄어든다 ✓</span>
          </div>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 28.4) }}>차이: +0.03 → −0.02 · action expert 의 gradient 만 끊는다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function KiResults() {
  const t = useSec()
  const frame = (x: number, y: number, w: number, h: number, color: string, at: number, title: string) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={`${color}12`} stroke={color} strokeWidth={2.5} />
      <text x={x + 20} y={y + 38} fill={color} fontSize={26} fontWeight={700}>
        {title}
      </text>
    </g>
  )
  const lines = (x: number, y: number, at: number, items: [string, string][]) => (
    <g opacity={prog(t, at)}>
      {items.map(([s, c], i) => (
        <text key={i} x={x} y={y + i * 32} fill={c} fontSize={21}>
          {s}
        </text>
      ))}
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={420}>
        <svg width={1000} height={420}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            knowledge insulation 의 구조
          </text>
          {frame(30, 76, 440, 180, C.blue, 0.5, 'VLM backbone')}
          {lines(50, 150, 0.7, [['입력: 사진 · 지시문 · 상태', C.text]])}
          {lines(50, 182, 6.2, [
            ['배움: action 의 FAST token + 웹의 사진·글', C.text],
            ['loss: next-token 예측', C.muted],
          ])}
          {frame(550, 76, 420, 180, C.orange, 0.7, 'action expert')}
          {lines(570, 150, 0.9, [['backbone 의 key · value 를 읽기만 한다', C.text]])}
          {lines(570, 182, 12.2, [
            ['loss: flow matching → 연속 action', C.text],
            ['실행 때 flow 적분 몇 step 으로 action', C.muted],
          ])}
          <g opacity={prog(t, 1)}>
            <line x1={470} y1={150} x2={550} y2={150} stroke={C.muted} strokeWidth={3} />
            <circle cx={550} cy={150} r={6} fill={C.muted} />
            <text x={510} y={136} textAnchor="middle" fill={C.muted} fontSize={20}>
              값 →
            </text>
            <path d="M 550 176 L 470 176" stroke={C.red} strokeWidth={3} strokeDasharray="8 6" fill="none" />
            <rect x={488} y={158} width={44} height={36} rx={8} fill={C.bg} stroke={C.red} strokeWidth={2.5} />
            <text x={510} y={185} textAnchor="middle" fill={C.red} fontSize={26} fontWeight={700}>
              ✕
            </text>
            <text x={510} y={222} textAnchor="middle" fill={C.red} fontSize={20} fontWeight={600}>
              ← gradient
            </text>
          </g>
          <text x={30} y={296} fill={C.text} fontSize={21} fontWeight={600} opacity={prog(t, 1.2)}>
            stop-gradient · 앞으로 계산할 때는 backbone 의 값을 그대로 쓰고, 뒤로 gradient 를 보낼 때만 그 길을 끊는다
          </text>
          <text x={30} y={332} fill={C.muted} fontSize={21} opacity={prog(t, 6.4)}>
            끊기만 하면 backbone 은 로봇 action 을 배우지 못한다 → FAST token 과 웹 데이터로 따로 배울 거리를 준다
          </text>
          <text x={30} y={368} fill={C.muted} fontSize={21} opacity={prog(t, 12.6)}>
            FAST token 은 학습에만 쓴다 · 실행 때는 action expert 가 flow 적분 몇 step 으로 action 을 만든다
          </text>
          <text x={30} y={402} fill={C.dim} fontSize={20} opacity={prog(t, 14)}>
            openpi 의 README: 공개한 π0.5 는 knowledge insulation 으로 학습했다
          </text>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={420} at={0.3} title={<Head color={C.accent}>학습과 실행</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.text, 21), opacity: prog(t, 1.2) }}>
            <b style={{ color: C.muted }}>π0.5</b> · FAST token 으로 pretraining 뒤 action expert 를 붙이는 두 단계
          </span>
          <span style={{ ...line(C.text, 21), opacity: prog(t, 6.6) }}>
            <b style={{ color: C.green }}>knowledge insulation</b> · 처음부터 두 loss 를 함께 배우는 한 단계
          </span>
          <span style={{ ...line(C.text, 21), opacity: prog(t, 12.6) }}>
            <b style={{ color: C.orange }}>실행</b> · FAST token 은 안 쓰고 action expert 가 flow 적분 몇 step 으로 action
          </span>
        </div>
        <div style={{ borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 12, display: 'grid', gap: 10, opacity: prog(t, 18) }}>
          <Head color={C.green} size={24}>
            저자들이 보고한 결과 · 식탁 치우기에서 비슷한 성능까지의 학습 step
          </Head>
          <Bar label="π0" value={7.5} max={8} color={C.red} at={18.4} width={260} fmt="7.5 배" labelW={190} />
          <Bar label="knowledge insulation" value={1} max={8} color={C.green} at={19.2} width={260} fmt="1" labelW={190} />
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 14, rowGap: 4, opacity: prog(t, 20.8) }}>
            <span style={{ fontSize: 21, color: C.muted, whiteSpace: 'nowrap' }}>DROID 실물</span>
            <span style={mono(C.green, 20)}>knowledge insulation 0.55</span>
            <span style={mono(C.red, 20)}>π0 0.49</span>
            <span style={mono(C.muted, 20)}>π0-FAST 0.45</span>
          </div>
        </div>
      </Box>
      <div style={{ position: 'absolute', left: 64, top: 580, width: 1792 }}>
        <Misconception at={24} belief="backbone 을 얼리면 VLM 의 지식을 지키면서 action 도 배울 수 있다." fact="얼린 backbone 은 서랍 작업과 셔츠 개기에서 성공률 0% · backbone 도 action 을 배우되 gradient 만 끊는다" />
      </div>
    </AbsoluteFill>
  )
}

// ---------- S4: Gemini Robotics-ER and the thinking VLA ----------

function Er() {
  const t = useSec()
  const fx = 80
  const fy = 90
  const k = 1.1
  const P = (x: number, y: number) => ({ x: fx + x * k, y: fy + y * k })
  const pt = P(160, 240)
  const traj = [P(150, 440), P(250, 410), P(340, 370), P(420, 330), P(470, 300)]
  const outs: [string, string][] = [
    ['2D bounding box', '[y0, x0, y1, x1]'],
    ['point', '[y, x]'],
    ['2D trajectory', 'point 여러 개를 순서대로'],
    ['위에서 잡는 grasp', 'y, x 와 회전각 θ (−90 ~ 90 도)'],
    ['3D bounding box', '중심 x, y, z · 크기 w, h, l · Euler 각 셋'],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <svg width={900} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            예로 든 640×480 사진 · Gemini Robotics-ER 의 출력
          </text>
          <text x={870} y={46} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            상자·경로는 모식도
          </text>
          <g opacity={prog(t, 0.6)}>
            <rect x={fx} y={fy} width={640 * k} height={480 * k} rx={10} fill={C.bg} stroke={C.cardEdge} strokeWidth={2} />
            <text x={fx + 12} y={fy + 30} fill={C.dim} fontSize={20} fontFamily={MONO}>
              (0, 0)
            </text>
            <text x={fx + 640 * k - 12} y={fy + 480 * k - 12} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
              (640, 480)
            </text>
          </g>
          {/* the scene: a cup and the gripper */}
          <g opacity={prog(t, 0.9)}>
            <rect x={P(430, 220).x} y={P(430, 220).y} width={110 * k} height={130 * k} rx={14} fill={`${C.muted}22`} stroke={C.muted} strokeWidth={2} />
            <text x={P(485, 295).x} y={P(485, 295).y} textAnchor="middle" fill={C.muted} fontSize={21}>
              컵
            </text>
            <rect x={traj[0].x - 22} y={traj[0].y - 6} width={44} height={30} rx={6} fill={`${C.muted}22`} stroke={C.muted} strokeWidth={2} />
            <text x={traj[0].x} y={traj[0].y + 52} textAnchor="middle" fill={C.muted} fontSize={21}>
              gripper
            </text>
          </g>
          {/* 2D box */}
          <g opacity={prog(t, 6.8)}>
            <rect x={P(400, 170).x} y={P(400, 170).y} width={170 * k} height={210 * k} rx={8} fill="none" stroke={C.blue} strokeWidth={3} strokeDasharray="10 6" />
            <text x={P(400, 170).x} y={P(400, 170).y - 12} fill={C.blue} fontSize={21} fontWeight={600}>
              2D box [y0, x0, y1, x1]
            </text>
          </g>
          {/* trajectory from the gripper */}
          <g opacity={prog(t, 8.2)}>
            <polyline points={traj.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={C.green} strokeWidth={3} strokeDasharray="6 6" />
            {traj.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={8} fill={C.green} opacity={prog(t, 8.4 + i * 0.25)} />
            ))}
            <text x={traj[1].x + 16} y={traj[1].y + 44} fill={C.green} fontSize={21} fontWeight={600}>
              trajectory · point 5 개
            </text>
          </g>
          {/* the point */}
          <g opacity={prog(t, 13.2)}>
            <line x1={fx} x2={pt.x} y1={pt.y} y2={pt.y} stroke={C.orange} strokeWidth={1.5} strokeDasharray="6 6" />
            <line x1={pt.x} x2={pt.x} y1={fy} y2={pt.y} stroke={C.orange} strokeWidth={1.5} strokeDasharray="6 6" />
            <circle cx={pt.x} cy={pt.y} r={12} fill={C.orange} />
            <text x={pt.x + 20} y={pt.y - 16} fill={C.orange} fontSize={22} fontWeight={600}>
              point [y, x] = [500, 250]
            </text>
            <text x={pt.x + 20} y={pt.y + 34} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              → pixel (160, 240)
            </text>
            <text x={pt.x} y={fy - 12} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
              x = 160
            </text>
            <text x={fx + 14} y={pt.y - 10} fill={C.orange} fontSize={20} fontFamily={MONO}>
              y = 240
            </text>
          </g>
          <text x={30} y={658} fill={C.muted} fontSize={21} opacity={prog(t, 7.4)}>
            좌표는 0 ~ 1000 의 정수로 정규화 · y 가 먼저 · 2D 상자는 위쪽 y, 왼쪽 x, 아래쪽 y, 오른쪽 x
          </text>
          <text x={30} y={694} fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 13.4)}>
            pixel x = 250 ÷ 1000 × 640 = 160
          </text>
          <text x={30} y={726} fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 15)}>
            pixel y = 500 ÷ 1000 × 480 = 240
          </text>
          <text x={500} y={694} fill={C.dim} fontSize={20} opacity={prog(t, 16.6)}>
            depth 를 알면 back-projection 으로
          </text>
          <text x={500} y={722} fill={C.dim} fontSize={20} opacity={prog(t, 16.6)}>
            3 차원 위치를 구해 팔을 보낸다
          </text>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={210} at={0.3} title={<Head color={C.accent}>Google DeepMind · 추론과 action 을 따로 만든다</Head>}>
        <div style={{ display: 'flex', gap: 14 }}>
          <Chip at={0.7}>추론 · VLM · Gemini Robotics-ER</Chip>
          <Chip at={1.3} color={C.green}>action · VLA · Gemini Robotics</Chip>
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 2) }}>ER 는 embodied reasoning · 로봇이 움직이는 데 필요한 공간과 물리의 이해 · Gemini 2.0 Flash 에 이 능력을 더 키운 VLM 이 좌표를 글로 낸다</span>
      </Box>
      <Box x={996} y={370} w={860} h={255} at={6.5} title={<Head color={C.blue}>출력 형식 · 좌표는 0 ~ 1000 정수</Head>}>
        <div style={{ display: 'grid', gap: 5 }}>
          {outs.map(([a, b], i) => (
            <div key={a} style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, 6.9 + i * 0.4) }}>
              <span style={{ width: 230, fontSize: 22, color: C.text, whiteSpace: 'nowrap' }}>{a}</span>
              <span style={{ fontFamily: MONO, fontSize: 22, color: C.blue, whiteSpace: 'nowrap' }}>{b}</span>
            </div>
          ))}
        </div>
      </Box>
      <Box x={996} y={645} w={860} h={235} at={20} title={<Head color={C.green}>코드로 로봇 움직이기 · zero-shot · ALOHA 2 의 7 가지 작업</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="Gemini 2.0 Flash" value={27} max={60} color={C.muted} at={20.4} width={240} unit="%" labelW={250} />
          <Bar label="Gemini Robotics-ER" value={53} max={60} color={C.green} at={21.4} width={240} unit="%" labelW={250} />
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 23) }}>물체 찾기 · grasp · gripper 함수를 부른다 · 옷 개기처럼 정밀한 grasp 는 못 했다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function Thinking() {
  const t = useSec()
  const scores: [string, number, number, number][] = [
    ['ALOHA', 0.26, 0.55, 14.4],
    ['Bi-arm Franka', 0.55, 0.6, 15.6],
    ['Apollo humanoid', 0.51, 0.67, 16.8],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            Gemini Robotics 1.5 · 추론을 두 층에 나눈다
          </text>
          <g opacity={prog(t, 0.7)}>
            <rect x={30} y={80} width={940} height={110} rx={16} fill={`${C.purple}12`} stroke={C.purple} strokeWidth={2.5} />
            <text x={50} y={120} fill={C.purple} fontSize={26} fontWeight={700}>
              orchestrator · Gemini Robotics-ER 1.5
            </text>
            <text x={50} y={158} fill={C.text} fontSize={21}>
              사용자의 말을 듣고 전체 계획 · 단계가 끝났는지 판정 · 필요하면 웹 검색 같은 도구
            </text>
          </g>
          <g opacity={prog(t, 7.2)}>
            <line x1={500} y1={190} x2={500} y2={290} stroke={C.purple} strokeWidth={3} />
            <circle cx={500} cy={290} r={6} fill={C.purple} />
            <text x={520} y={248} fill={C.purple} fontSize={22} fontWeight={600}>
              "pack the rain jacket into the luggage"
            </text>
          </g>
          <g opacity={prog(t, 1.6)}>
            <rect x={30} y={290} width={940} height={310} rx={16} fill={`${C.accent}10`} stroke={C.accent} strokeWidth={2.5} />
            <text x={50} y={330} fill={C.accent} fontSize={26} fontWeight={700}>
              thinking VLA · Gemini Robotics 1.5
            </text>
          </g>
          <text x={50} y={364} fill={C.muted} fontSize={21} opacity={prog(t, 7.4)}>
            action 앞에 생각을 글로 쓴다 · 받은 명령을 몇 초짜리 단계와 기본 동작으로 다시 쪼갠다
          </text>
          <g opacity={prog(t, 8.6)}>
            <rect x={50} y={386} width={900} height={48} rx={10} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={70} y={418} fill={C.text} fontSize={22}>
              생각 1 · "pick up the rain jacket from the wardrobe" <tspan fill={C.muted}>· 몇 초짜리 단계</tspan>
            </text>
          </g>
          <g opacity={prog(t, 9.8)}>
            <rect x={50} y={448} width={900} height={48} rx={10} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={70} y={480} fill={C.text} fontSize={22}>
              생각 2 · "move the gripper to the left" <tspan fill={C.muted}>· 기본 동작</tspan>
            </text>
          </g>
          <text x={50} y={548} fill={C.accent} fontSize={22} fontWeight={600} opacity={prog(t, 11)}>
            → 생각을 문맥에 붙인 뒤 action 을 낸다 · 어려운 번역 한 번을 쉬운 두 단계로 나눈다
          </text>
          <g opacity={prog(t, 11.6)}>
            <line x1={500} y1={600} x2={500} y2={660} stroke={C.accent} strokeWidth={3} />
            <circle cx={500} cy={660} r={6} fill={C.accent} />
            <rect x={30} y={660} width={940} height={60} rx={14} fill={`${C.muted}10`} stroke={C.muted} strokeWidth={2} />
            <text x={500} y={698} textAnchor="middle" fill={C.text} fontSize={23} fontWeight={600}>
              action · 로봇
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={215} at={0.3} title={<Head color={C.purple}>보고서의 두 가지 예</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.text, 21), opacity: prog(t, 1.2) }}>
            success detection 을 1 초에 5 번 부르고 추론 지연을 흉내 내 시험 · 판정에 2 초가 걸리면 50 Hz 로봇은 그새 action 100 개를 실행한다
          </span>
          <span style={{ ...line(C.text, 21), opacity: prog(t, 12) }}>
            물병을 놓치자 다음 생각이 "pick up the water bottle with the left hand" 로 바뀌어 스스로 회복했다
          </span>
        </div>
      </Box>
      <Box x={1096} y={375} w={760} h={280} at={14} title={<Head color={C.accent}>여러 단계 작업의 진행 점수 · thinking 끔 → 켬</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          {scores.map(([name, off, on, at]) => (
            <div key={name} style={{ display: 'grid', gap: 3, opacity: prog(t, at) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 170, fontSize: 22, color: C.text }}>{name}</span>
                <div style={{ width: 300, height: 16, borderRadius: 5, background: C.grid }}>
                  <div style={{ width: `${off * 100 * prog(t, at, 0.8)}%`, height: '100%', borderRadius: 5, background: C.muted }} />
                </div>
                <span style={mono(C.muted, 22)}>{off.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 170 }} />
                <div style={{ width: 300, height: 16, borderRadius: 5, background: C.grid }}>
                  <div style={{ width: `${on * 100 * prog(t, at + 0.3, 0.8)}%`, height: '100%', borderRadius: 5, background: C.accent }} />
                </div>
                <span style={mono(C.accent, 22)}>{on.toFixed(2)}</span>
                {name === 'ALOHA' && <span style={{ ...mono(C.green, 22), opacity: prog(t, at + 0.8) }}>+0.29</span>}
              </div>
            </div>
          ))}
          <span style={{ ...line(C.muted, 20), opacity: prog(t, 18.6) }}>
            <span style={{ color: C.muted }}>■</span> thinking 끔 <span style={{ color: C.accent }}>■</span> thinking 켬
          </span>
        </div>
      </Box>
      <Box x={1096} y={675} w={760} h={205} at={22} title={<Head color={C.purple}>도구 · 기억 · 계획이 필요한 8 가지 작업</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="thinking VLA 혼자" value={44} max={100} color={C.accent} at={22.4} width={240} fmt="최대 44" unit="%" labelW={220} />
          <Bar label="ER 1.5 orchestrator + VLA" value={80} max={100} color={C.purple} at={23.6} width={240} fmt="80" unit="% 근처" labelW={220} />
          <span style={{ ...line(C.muted, 20), opacity: prog(t, 25) }}>thinking VLA 는 action 에 맞춘 작은 모델이라 계획이 ER 모델보다 약하다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'high · low-level', color: C.accent, text: 'high-level 은 subtask 글, low-level 은 그 글만 보고 chunk · π0.5 는 weight 한 벌, Hi Robot 은 VLM 두 개', at: 1 },
    { tag: 'ECoT 와 token 비용', color: C.orange, text: 'ECoT 44% → 66% · token 7 → 350 개, H100 에서 1 초에 1 ~ 1.2 번 · 고정 · 주기 나누기 · 학습에만 추론', at: 4.8 },
    { tag: 'stop-gradient', color: C.green, text: 'gradient 를 끊고 backbone 은 FAST token 으로 배운다 · 학습 step 은 π0 의 7.5 분의 1 · DROID 0.55 대 0.49', at: 8.8 },
    { tag: 'ER 와 thinking VLA', color: C.purple, text: 'ER 는 좌표를 0 ~ 1000 의 글로 · thinking VLA 는 ALOHA 0.26 → 0.55 · orchestrator 를 붙인 agent 는 80% 근처', at: 12.6 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1640 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            다음 할 일을 글로 먼저 정하면서도, 1 초에 50 개씩 필요한 관절 목표를 제때 낼 수 있을까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 32px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 24, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.4 }}>{it.text}</span>
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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>World Model · VLA + RL</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            행동의 결과를 미리 상상해 계획을 비교하기 · 실제로 해 본 성공과 실패로 VLA 를 더 학습하기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · π0.5 arXiv 2504.16054 · Hi Robot 2502.19417 · ECoT 2407.08693 · knowledge insulation 2505.23705
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseLatency = () => (
  <PauseWrite
    question="high-level 을 2 초마다만 다시 계산하고, 수정에 맞는 새 명령이 token 10 개다. prefill 47 ms, decode 한 step 13.2 ms 면 말한 뒤 새 명령까지 가장 늦으면 몇 ms?"
    answer={
      <>
        가장 늦으면 2000 + 47 + 10 × 13.2 = 2179 ms
        <br />
        말을 듣자마자 계산하면 47 + 132 = 179 ms
      </>
    }
  />
)

const PauseTokens = () => (
  <PauseWrite
    question="한 step 에 추론 token 100 개와 action token 7 개를 내는 모델. prefill 47 ms, decode 한 step 13.2 ms 로 어림하면 1 초에 action 을 몇 번 낼까? 50 Hz 로봇에 1 초 분량의 chunk 를 낸다면 로봇이 기다릴까?"
    answer={
      <>
        47 + 107 × 13.2 = 1459.4 ms → 1000 ÷ 1459.4 ≈ 0.69 번
        <br />
        chunk 하나는 1 초인데 다음 chunk 에 약 1.46 초 → chunk 마다 약 0.46 초씩 모자라 로봇이 기다린다
      </>
    }
  />
)

const PauseGradient = () => (
  <PauseWrite
    question="backbone 의 w 에 FAST loss 의 gradient −0.3 과 flow matching loss 의 gradient +0.5 가 온다. learning rate 0.1 로 한 step 고치면, stop-gradient 가 없을 때와 있을 때 w 와 FAST loss 는?"
    answer={
      <>
        없으면 −0.3 + 0.5 = +0.2 → w 는 −0.1 × 0.2 = −0.02, FAST loss 는 늘어난다
        <br />
        있으면 −0.3 만 → w 는 −0.1 × (−0.3) = +0.03, FAST loss 는 줄어든다
      </>
    }
  />
)

const PausePoint = () => (
  <PauseWrite
    question="1280×720 사진에서 Gemini Robotics-ER 가 point [y, x] = [250, 600] 을 냈다. pixel 좌표는?"
    answer="순서는 [y, x] · pixel x = 600 ÷ 1000 × 1280 = 768 · pixel y = 250 ÷ 1000 × 720 = 180"
  />
)

export function VlaReasoning() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        flat: Flat,
        hierarchy: Hierarchy,
        'pause-latency': PauseLatency,
        ecot: Ecot,
        'token-cost': TokenCost,
        'pause-tokens': PauseTokens,
        'ki-gradient': KiGradient,
        'ki-results': KiResults,
        'pause-gradient': PauseGradient,
        er: Er,
        thinking: Thinking,
        'pause-point': PausePoint,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
