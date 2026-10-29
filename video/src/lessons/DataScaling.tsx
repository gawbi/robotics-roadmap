import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './data-scaling.narration.json'
import { script } from './data-scaling.script'

// Numbers follow lessons/data-scaling/README.md (see data-scaling.script.ts). The place / scene drawings and the UMI gripper
// are schematic (marked 모식도); every number on screen is the lesson's.

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
      <span style={{ width: labelW, fontSize: 24, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
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

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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

/** a tiny robot arm, drawn from its base at (x, y) */
function Arm({ x, y, color, scale = 1 }: { x: number; y: number; color: string; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-22} y={-8} width={44} height={10} rx={3} fill={color} />
      <polyline points="0,-8 -14,-46 18,-74 40,-62" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={-14} cy={-46} r={6} fill={color} />
      <circle cx={18} cy={-74} r={6} fill={color} />
      <path d="M40,-62 l10,-8 M40,-62 l12,4" stroke={color} strokeWidth={5} strokeLinecap="round" />
    </g>
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
            IMITATION · ROBOT DATA SCALING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Robot Data Scaling</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            OXE · DROID · UMI · <span style={{ color: C.accent }}>data scaling law</span> · MimicGen · CUPID · π0.5
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            처음 보는 곳에서도 일하는 policy 를 위한 시연의 수집, 합성, 고르기, 섞기
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
        <svg width={1792} height={300}>
          <text x={1760} y={36} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            UMI 논문의 컵 정리 실험 · 모식도
          </text>
          {/* one lab */}
          <g opacity={prog(t, 0.5)}>
            <rect x={40} y={50} width={150} height={150} rx={16} fill={`${C.orange}18`} stroke={C.orange} strokeWidth={2.5} />
            <Arm x={115} y={180} color={C.orange} />
            <text x={115} y={236} textAnchor="middle" fill={C.orange} fontSize={24} fontWeight={600}>
              실험실 1 곳
            </text>
            <text x={230} y={92} fill={C.text} fontSize={26}>
              2 명이 모은 시연 305 개
            </text>
            <text x={230} y={150} fill={C.green} fontSize={26} fontWeight={600}>
              ✓ 같은 실험실: 20 번 중 20 번 성공
            </text>
            <text x={230} y={198} fill={C.red} fontSize={26} fontWeight={600}>
              ✕ 처음 보는 카페 테이블: 컵 쪽으로 움직이지도 않음
            </text>
          </g>
          {/* thirty places */}
          <g opacity={prog(t, 4.6)}>
            {Array.from({ length: 30 }, (_, i) => (
              <rect key={i} x={960 + (i % 10) * 34} y={56 + Math.floor(i / 10) * 34} width={28} height={28} rx={5} fill={`${C.green}33`} stroke={C.green} strokeWidth={1.5} />
            ))}
            <Arm x={1130} y={208} color={C.green} scale={0.6} />
            <text x={1130} y={236} textAnchor="middle" fill={C.green} fontSize={24} fontWeight={600}>
              집·사무실·식당·야외 30 곳
            </text>
            <text x={1330} y={92} fill={C.text} fontSize={26}>
              3 명이 모은 시연 1,400 개
            </text>
            <text x={1330} y={150} fill={C.green} fontSize={26} fontWeight={600}>
              ✓ 처음 보는 두 장소: 60 번 중 43 번
            </text>
            <text x={1330} y={198} fill={C.green} fontSize={26} fontFamily={MONO} fontWeight={600}>
              43 ÷ 60 ≈ 71.7%
            </text>
          </g>
        </svg>
      </Panel>
      <Appear at={5} style={{ position: 'absolute', left: 64, top: 470, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          처음 보는 곳에서도 일하려면 <span style={{ color: C.accent }}>어떤 시연을 얼마나, 어떻게 그만큼</span> 모아야 할까?
        </div>
      </Appear>
      <Panel x={64} y={630} w={1792} h={250}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 18, opacity: prog(t, 6) }}>
          <Label size={24}>이 강의의 답 (Lin 등 2024 · 시연 4 만 개 이상, 실물 시험 1 만 5 천 번 이상으로 잰 결과)</Label>
          <Flow steps={['시연 개수보다 장면·물체의 가짓수부터', '환경 32 곳 × 곳마다 다른 물체 1 개 × 시연 50 개', '4 명 · 오후 한나절']} color={C.green} at={6.2} gap={0.45} last="→ 새 환경·물체에서 약 90%" />
          <Label size={22} color={C.dim}>
            그 데이터를 마련하는 방법(OXE · DROID · UMI · MimicGen)과 모은 뒤 고르고 섞는 방법(CUPID · π0.5)을 본다
          </Label>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- OXE ----------

function Oxe() {
  const t = useSec()
  const align: [string, string, number][] = [
    ['카메라', 'dataset 마다 대표 카메라 1 대 · 같은 해상도로', 6.4],
    ['action', 'x, y, z, roll, pitch, yaw, 집게 = 숫자 7 개', 7.2],
    ['크기', 'dataset 마다 따로 정규화 → 256 칸', 8.0],
    ['좌표계', '맞추지 않음 (x 가 앞쪽인 로봇과 옆쪽인 로봇)', 8.8],
  ]
  const rows: [string, number, number, number, number][] = [
    ['Bridge (Stanford, WidowX)', 40, 27, 50, 24.6],
    ['Bridge (UC Berkeley, WidowX)', 30, 27, 30, 25.1],
    ['RT-1 과제 (Google 로봇)', 92, 73, 91, 25.6],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={740}>
        <div style={{ padding: '24px 28px', display: 'grid', gap: 14, alignContent: 'start' }}>
          <div style={{ opacity: prog(t, 0.3) }}>
            <Head color={C.accent}>Open X-Embodiment (OXE) · dataset 60 개를 RLDS 한 형식으로</Head>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Chip at={0.8} color={C.blue}>기관 21 개 · 연구실 34 곳</Chip>
            <Chip at={1.4} color={C.blue}>로봇 22 종</Chip>
            <Chip at={2.0} color={C.blue}>trajectory 100 만 개 이상</Chip>
            <Chip at={2.6} color={C.blue}>skill 527 가지</Chip>
          </div>
          <div style={{ opacity: prog(t, 6) }}>
            <Head>RT-X 의 coarse alignment · 대략만 맞춘다</Head>
          </div>
          <div style={{ display: 'grid', gap: 2 }}>
            {align.map(([k, v, at]) => (
              <div key={k} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
                <span style={{ ...mono(C.accent, 22), width: 100 }}>{k}</span>
                <span style={line(C.text, 22)}>{v}</span>
              </div>
            ))}
          </div>
          <svg width={840} height={300}>
            <text x={0} y={24} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 12)}>
              dataset 마다 따로 정규화하는 이유 (예로 든 두 로봇)
            </text>
            {[
              ['로봇 A · 최대 ±2 cm', '이번 이동 1 cm', '÷ 2', '× 2', 'A 에 1 cm', 70, 12.3, C.blue],
              ['로봇 B · 최대 ±0.5 cm', '이번 이동 0.25 cm', '÷ 0.5', '× 0.5', 'B 에 0.25 cm', 190, 13.3, C.orange],
            ].map(([name, mv, div, mul, back, y, at, col]) => (
              <g key={name as string} opacity={prog(t, at as number)}>
                <text x={0} y={(y as number) - 6} fill={col as string} fontSize={22} fontWeight={600}>
                  {name as string}
                </text>
                <text x={0} y={(y as number) + 26} fill={C.text} fontSize={22} fontFamily={MONO}>
                  {mv as string}
                </text>
                <line x1={250} x2={320} y1={(y as number) + 10} y2={(y as number) + 10} stroke={C.muted} strokeWidth={2.5} />
                <text x={285} y={(y as number) - 2} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                  {div as string}
                </text>
                <rect x={330} y={(y as number) - 14} width={70} height={48} rx={10} fill={`${col as string}22`} stroke={col as string} strokeWidth={2} />
                <text x={365} y={(y as number) + 19} textAnchor="middle" fill={col as string} fontSize={26} fontFamily={MONO} fontWeight={600}>
                  0.5
                </text>
                <g opacity={prog(t, 15.3)}>
                  <line x1={580} x2={650} y1={(y as number) + 10} y2={(y as number) + 10} stroke={C.muted} strokeWidth={2.5} />
                  <text x={615} y={(y as number) - 2} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                    {mul as string}
                  </text>
                  <text x={660} y={(y as number) + 18} fill={col as string} fontSize={23} fontFamily={MONO} fontWeight={600}>
                    {back as string}
                  </text>
                </g>
              </g>
            ))}
            <g opacity={prog(t, 14.3)}>
              <rect x={430} y={50} width={150} height={180} rx={14} fill={`${C.green}14`} stroke={C.green} strokeWidth={2} />
              <text x={505} y={128} textAnchor="middle" fill={C.green} fontSize={26} fontWeight={700}>
                모델
              </text>
              <text x={505} y={158} textAnchor="middle" fill={C.muted} fontSize={19}>
                같은 크기로
              </text>
              <text x={505} y={182} textAnchor="middle" fill={C.muted} fontSize={19}>
                배운다
              </text>
              <line x1={400} x2={430} y1={80} y2={80} stroke={C.muted} strokeWidth={2.5} />
              <line x1={400} x2={430} y1={200} y2={200} stroke={C.muted} strokeWidth={2.5} />
            </g>
            <text x={0} y={282} fill={C.orange} fontSize={21} fontWeight={600} opacity={prog(t, 16.5)}>
              같은 범위(±2 cm)로 다루면 B 의 움직임은 A 의 4 분의 1 → loss 에서 거의 보이지 않는다
            </text>
          </svg>
        </div>
      </Panel>
      <Box x={996} y={140} w={860} h={330} at={18} title={<Head color={C.green}>데이터가 적은 dataset 5 개 · 원래 로봇에서 시험</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 18.4) }}>
            <span style={mono(C.green, 34)}>5 개 중 4 개</span>
            <span style={line()}>RT-1-X 가 원래 방법보다 나은 dataset</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 19.6) }}>
            <span style={mono(C.green, 34)}>+50%</span>
            <span style={line()}>평균 성공률 (1.5 배)</span>
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 21) }}>RT-1-X 는 RT-1 과 구조가 같은 3,500 만 parameter 모델 · 로봇 9 종의 dataset 12 개로 학습 · 구조가 같으니 차이는 다른 로봇의 데이터에서 왔다</span>
        </div>
      </Box>
      <Box x={996} y={495} w={860} h={385} at={24} gap={8} title={<Head color={C.red}>데이터가 많은 dataset · 성공률</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: '310px 110px 1fr 1fr', gap: 8, alignItems: 'baseline' }}>
          <span style={line(C.dim, 20)}>시험한 곳</span>
          <span style={line(C.dim, 20)}>RT-1</span>
          <span style={line(C.dim, 20)}>RT-1-X 3,500 만</span>
          <span style={line(C.dim, 20)}>RT-2-X 550 억</span>
          {rows.map(([n, a, b, c, at]) => (
            <div key={n} style={{ display: 'contents' }}>
              <span style={{ ...line(C.text, 22), opacity: prog(t, at) }}>{n}</span>
              <span style={{ ...mono(C.text, 26), opacity: prog(t, at) }}>{a}%</span>
              <span style={{ ...mono(b < a ? C.red : C.text, 26), opacity: prog(t, at) }}>{b}%</span>
              <span style={{ ...mono(C.green, 26), opacity: prog(t, at) }}>{c}%</span>
            </div>
          ))}
        </div>
        <span style={{ ...line(C.text, 21), opacity: prog(t, 26.6) }}>
          작은 모델이 여러 로봇의 데이터를 다 담지 못한 <b style={{ color: C.red }}>underfitting</b> · VLM 위의 550 억 RT-2-X 는 담아냈다
        </span>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 28.2) }}>WidowX 의 skill 을 Google 로봇에: RT-2 27.3% → RT-2-X 75.8% (≈ 2.8 배) · Bridge 빼면 42.8%</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- DROID ----------

function Droid() {
  const t = useSec()
  const steps: [string, number][] = [
    ['새 장면마다 바깥 카메라 자리를 새로 정하고 체커보드로 다시 잰다', 10],
    ['프로그램이 작업을 무작위로 골라 주고 받침 밀기·조명 바꾸기를 지시한다', 10.8],
    ['한 장면에서 최대 100 개쯤 (20 분쯤) 모은 뒤 다음 장면으로', 11.6],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={900} h={340} at={0.3} title={<Head color={C.accent}>로봇 데이터가 웹 데이터처럼 모이지 않는 이유</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, 0.8) }}>
            <span style={{ ...mono(C.blue, 24), width: 90 }}>CLIP</span>
            <span style={line()}>사람들이 다른 목적으로 올린 사진·글 4 억 쌍 → 모으기만 하면 된다</span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, 2) }}>
            <span style={{ ...mono(C.red, 24), width: 90 }}>로봇</span>
            <span style={line()}>
              관측 + <b style={{ color: C.red }}>그 순간 로봇에 보낸 action</b> 이 있어야 한다 → 인터넷에 없다
            </span>
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 3.6) }}>시연 하나마다 사람과 로봇이 함께 있어야 하고, 한 번 할 때마다 물체를 다시 놓고 로봇을 처음 자세로 돌린다</span>
          <span style={{ ...line(C.text, 21), opacity: prog(t, 5) }}>늘리는 연구 네 갈래: 남이 모은 것을 합친다(OXE) · 같은 로봇을 여러 곳에(DROID) · 로봇 없이 손으로(UMI) · 컴퓨터로 늘린다(MimicGen)</span>
        </div>
      </Box>
      <Box x={996} y={140} w={860} h={340} at={7} gap={10} title={<Head color={C.orange}>DROID · 같은 장비를 여러 곳에 보내 장면부터 늘린다</Head>}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Chip at={7.3} color={C.orange}>로봇 18 대 · 기관 13 개</Chip>
          <Chip at={7.7} color={C.orange}>50 명 · 12 개월</Chip>
          <Chip at={8.1} color={C.orange}>성공 76,000 개 (350 시간)</Chip>
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 9.2) }}>바퀴 책상의 Franka Panda · stereo 2 대 + 손목 1 대 · VR controller · 1 초에 15 번 · 실패도 약 16,000 개</span>
        <div style={{ display: 'grid', gap: 4 }}>
          {steps.map(([s, at]) => (
            <span key={s} style={{ ...line(C.text, 21), opacity: prog(t, at) }}>
              · {s}
            </span>
          ))}
        </div>
      </Box>
      <Box x={64} y={505} w={900} h={375} at={14.5} title={<Head color={C.accent}>frame 은 많지만 장면은 564 곳</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 14.8) }}>
            <span style={mono(C.text, 28)}>350 × 3600 × 15 = 1,890 만</span>
            <span style={line(C.muted, 22)}>frame</span>
          </div>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 16) }}>이웃한 frame 은 거의 같은 사진 → Teleop Dataset 에서 영상을 270 분의 1 로 줄일 수 있었던 이유</span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 17.6) }}>
            <span style={mono(C.orange, 28)}>76,000 ÷ 564 ≈ 135</span>
            <span style={line(C.muted, 22)}>개 / 장면 · 건물 52 채 · 시점 1,417 가지 · 작업 86 가지</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 19.4) }}>
            <span style={mono(C.muted, 28)}>OXE ≈ 300 곳</span>
            <span style={line(C.muted, 22)}>이미 있던 dataset 을 모은 것이라 dataset 하나하나는 장면이 몇 곳뿐</span>
          </div>
          <span style={{ ...line(C.text, 22), fontWeight: 600, opacity: prog(t, 20.6) }}>일반화를 좌우하는 것은 frame 의 개수가 아니라 장면·물체·작업의 가짓수</span>
        </div>
      </Box>
      <Panel x={996} y={505} w={860} h={375}>
        <svg width={860} height={375}>
          <text x={28} y={44} fill={C.green} fontSize={28} fontWeight={600} opacity={prog(t, 22)}>
            다른 작업에 DROID 를 섞으면 · Diffusion Policy
          </text>
          <g opacity={prog(t, 22.4)}>
            <text x={28} y={84} fill={C.muted} fontSize={21}>
              그 자리의 시연 50 ~ 150 개 + batch 절반을 DROID 에서
            </text>
            <text x={28} y={126} fill={C.text} fontSize={24}>
              처음 위치만 바꾼 시험
            </text>
            <rect x={300} y={106} width={220 * prog(t, 22.6, 0.8)} height={26} rx={6} fill={C.green} />
            <text x={535} y={126} fill={C.green} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 23.2)}>
              +22%p
            </text>
            <text x={28} y={166} fill={C.text} fontSize={24}>
              방해 물체 · 물체 바꿈
            </text>
            <rect x={300} y={146} width={170 * prog(t, 23, 0.8)} height={26} rx={6} fill={C.green} />
            <text x={485} y={166} fill={C.green} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 23.6)}>
              +17%p
            </text>
            <text x={640} y={126} fill={C.dim} fontSize={20}>
              다음으로 좋은 방법 대비
            </text>
          </g>
          <g opacity={prog(t, 25.5)}>
            <text x={28} y={214} fill={C.text} fontSize={24} fontWeight={600}>
              같은 7,362 개를 두 방식으로 뽑으면
            </text>
            {Array.from({ length: 20 }, (_, i) => (
              <rect key={i} x={28 + (i % 10) * 30} y={232 + Math.floor(i / 10) * 30} width={26} height={26} rx={4} fill={C.orange} opacity={0.85} />
            ))}
            <text x={28} y={322} fill={C.orange} fontSize={21} fontFamily={MONO}>
              장면 20 곳 · 7,362 ÷ 20 ≈ 368 개씩
            </text>
            {Array.from({ length: 180 }, (_, i) => (
              <rect key={i} x={440 + (i % 30) * 11} y={232 + Math.floor(i / 30) * 11} width={8} height={8} rx={1.5} fill={C.green} opacity={0.35 + ((i * 7) % 10) / 20} />
            ))}
            <text x={440} y={322} fill={C.green} fontSize={21} fontFamily={MONO}>
              전체 무작위 · 564 곳이면 ≈ 13 개씩
            </text>
            <text x={28} y={356} fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 27.5)}>
              방해 물체·새 물체 시험에서는 흩어진 쪽을 섞은 policy 가 더 높았다
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- UMI ----------

function Umi() {
  const t = useSec()
  const rates: [string, number, string, string, number][] = [
    ['spacemouse 조종', 35, '1,000 개에 28.6 시간', C.red, 0.6],
    ['UMI 집게', 111, '1,000 개에 9.0 시간', C.green, 1.6],
    ['맨손', 231, '1,000 개에 4.3 시간', C.blue, 2.6],
  ]
  const table: [string, string, string, number][] = [
    ['같은 사진을 본다', '집게에 고정한 손목 카메라만', '다른 팔 Franka FR2 에서도 20 번 중 18 번', 22.3],
    ['주변이 보인다', '155° fisheye · 사진을 펴지 않음', '69° 로 잘라 펴면 20 번 중 11 번', 22.9],
    ['깊이를 짐작한다', '화면 양옆의 거울', '뒤집어 넣으면 20 · 그대로 17 · 없으면 18', 23.5],
    ['6 DoF 궤적을 안다', 'GoPro 영상 + IMU 로 SLAM', '위치 오차 6.1 mm · 회전 오차 3.5°', 24.1],
    ['집게 폭을 안다', '손가락의 marker 를 사진에서', '던지기처럼 놓는 순간이 중요한 작업', 24.7],
    ['할 수 있는 움직임', '관절 한계를 넘는 시연은 지움', '', 25.3],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={320}>
        <svg width={900} height={320}>
          <text x={28} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            같은 사람이 컵 정리 시연을 1 시간에 모은 개수 (UMI 논문)
          </text>
          {rates.map(([n, v, sub, col, at], i) => {
            const y = 76 + i * 62
            const w = (v / 300) * 400
            return (
              <g key={n} opacity={prog(t, at)}>
                <text x={230} y={y + 32} textAnchor="end" fill={C.text} fontSize={24}>
                  {n}
                </text>
                <rect x={250} y={y + 8} width={w * prog(t, at, 0.9)} height={34} rx={7} fill={col} opacity={0.85} />
                <text x={260 + w} y={y + 33} fill={col} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, at + 0.6)}>
                  {v} 개
                </text>
                <text x={880} y={y + 33} textAnchor="end" fill={C.muted} fontSize={21} opacity={prog(t, 7.2 + i * 0.5)}>
                  {sub}
                </text>
              </g>
            )
          })}
          <text x={28} y={278} fill={C.dim} fontSize={20} opacity={prog(t, 7)}>
            시연 1,000 개에 드는 시간: 1000 ÷ 35 ≈ 28.6 · 1000 ÷ 111 ≈ 9.0 · 1000 ÷ 231 ≈ 4.3 시간
          </text>
          <text x={28} y={304} fill={C.dim} fontSize={20} opacity={prog(t, 7)}>
            물체를 다시 놓는 시간과 로봇 고장 처리까지 넣은 값 · 맨손 시연은 로봇 학습에 바로 쓸 수 없다
          </text>
        </svg>
      </Panel>
      <Panel x={64} y={485} w={900} h={395}>
        <svg width={900} height={395}>
          <text x={28} y={44} fill={C.accent} fontSize={26} fontWeight={600} opacity={prog(t, 14)}>
            UMI · 손에 쥐는 집게 (모식도)
          </text>
          <g opacity={prog(t, 14.4)} transform="translate(0 30)">
            {/* handle and body */}
            <rect x={120} y={200} width={60} height={150} rx={14} fill={C.card} stroke={C.muted} strokeWidth={3} />
            <rect x={60} y={150} width={200} height={60} rx={12} fill={C.card} stroke={C.muted} strokeWidth={3} />
            {/* fingers */}
            <rect x={70} y={210} width={26} height={110} rx={6} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={2.5} />
            <rect x={224} y={210} width={26} height={110} rx={6} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={2.5} />
            <circle cx={83} cy={300} r={6} fill={C.orange} />
            <circle cx={237} cy={300} r={6} fill={C.orange} />
            {/* GoPro on top with fisheye */}
            <rect x={110} y={96} width={100} height={56} rx={10} fill={C.card} stroke={C.accent} strokeWidth={3} />
            <circle cx={160} cy={124} r={16} fill={C.accent} opacity={0.9} />
            <path d="M 80 124 A 80 80 0 0 1 240 124" fill="none" stroke={C.accent} strokeWidth={2} strokeDasharray="6 6" />
            {/* mirrors */}
            <line x1={48} x2={70} y1={160} y2={110} stroke={C.purple} strokeWidth={5} strokeLinecap="round" />
            <line x1={272} x2={250} y1={160} y2={110} stroke={C.purple} strokeWidth={5} strokeLinecap="round" />
          </g>
          <g opacity={prog(t, 15)}>
            <text x={300} y={112} fill={C.accent} fontSize={23} fontWeight={600}>
              GoPro 1 대 · 155° fisheye
            </text>
            <text x={300} y={146} fill={C.purple} fontSize={23} fontWeight={600}>
              양옆 거울 → 다른 시점 2 개
            </text>
            <text x={300} y={180} fill={C.blue} fontSize={23} fontWeight={600}>
              3D 프린터로 만든 집게
            </text>
            <text x={300} y={214} fill={C.orange} fontSize={23} fontWeight={600}>
              손가락 marker → 집게 폭
            </text>
          </g>
          <g opacity={prog(t, 17)}>
            <text x={300} y={262} fill={C.text} fontSize={22} fontFamily={MONO}>
              집게 73 달러 + GoPro·부속 298 달러 · 780 g
            </text>
            <text x={300} y={296} fill={C.muted} fontSize={22}>
              실행: 로봇 팔 끝에 같은 집게와 GoPro 를 같은 자리에
            </text>
          </g>
          <g opacity={prog(t, 18.5)}>
            <Arm x={790} y={330} color={C.green} scale={0.9} />
            <rect x={812} y={246} width={36} height={26} rx={6} fill={C.card} stroke={C.accent} strokeWidth={2.5} />
            <circle cx={830} cy={259} r={6} fill={C.accent} />
            <text x={790} y={368} textAnchor="middle" fill={C.green} fontSize={21}>
              UR5 팔 + 같은 집게
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={740} at={22} gap={10} title={<Head color={C.green}>사람의 시연을 로봇이 따라 배우려면 (컵 정리에서 잰 효과)</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: '190px 270px 1fr', gap: 8, alignItems: 'baseline' }}>
          <span style={line(C.dim, 20)}>필요한 것</span>
          <span style={line(C.dim, 20)}>UMI 의 방법</span>
          <span style={line(C.dim, 20)}>논문의 비교</span>
          {table.map(([a, b, c, at]) => (
            <div key={a} style={{ display: 'contents' }}>
              <span style={{ ...line(C.text, 22), fontWeight: 600, opacity: prog(t, at) }}>{a}</span>
              <span style={{ ...line(C.green, 22), opacity: prog(t, at) }}>{b}</span>
              <span style={{ ...line(C.muted, 21), opacity: prog(t, at) }}>{c}</span>
            </div>
          ))}
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 26) }}>SLAM: 카메라가 움직이며 찍은 영상으로 주변 지도와 카메라 위치를 함께 구한다 · 카메라 하나로는 실제 크기를 모르니 IMU 의 가속도로 크기를 정하는 ORB-SLAM3</span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 28) }}>
          <span style={mono(C.green, 34)}>20 번 중 20 번</span>
          <span style={line()}>모두 갖춘 policy · UR5 팔</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function Latency() {
  const t = useSec()
  const sx = (ms: number) => 120 + ms * 2 // 0 ~ 500 ms over 1000 px
  const limits: [string, number][] = [
    ['SLAM 은 사진 속 무늬로 위치를 잡는다 → 흰 벽만 보이면 궤적을 잃는다', 21.8],
    ['Lin 등은 UMI 로 모은 시연의 약 90% 만 쓸 수 있었다', 22.8],
    ['문·서랍처럼 화면을 크게 가리는 물체 → 카메라가 멈춘 것으로 잘못 읽어 그런 작업을 피했다', 23.8],
    ['수집 속도는 맨손의 48%', 24.8],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1180} h={400}>
        <svg width={1180} height={400}>
          <text x={28} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 7)}>
            latency matching · 사진이 찍힌 시각을 0 으로 둔 시간표 (예로 든 지연)
          </text>
          {[
            [0, 80, '카메라 80', C.purple, 7.3],
            [80, 200, '추론 120', C.orange, 7.9],
            [200, 300, '팔 실행 100', C.red, 8.5],
          ].map(([a, b, l, col, at]) => (
            <g key={l as string} opacity={prog(t, at as number)}>
              <rect x={sx(a as number)} y={70} width={sx(b as number) - sx(a as number)} height={44} rx={6} fill={col as string} opacity={0.85} />
              <text x={(sx(a as number) + sx(b as number)) / 2} y={99} textAnchor="middle" fill={C.bg} fontSize={22} fontWeight={700}>
                {l as string}
              </text>
            </g>
          ))}
          <text x={sx(310)} y={92} fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 9)}>
            80 + 120 + 100 = 300 ms
          </text>
          <text x={sx(310)} y={120} fill={C.muted} fontSize={20} opacity={prog(t, 9)}>
            뒤에야 첫 명령이 팔에서 실현된다
          </text>
          <g opacity={prog(t, 7.3)}>
            <line x1={sx(0)} x2={sx(520)} y1={170} y2={170} stroke={C.muted} strokeWidth={2.5} />
            {[0, 100, 200, 300, 400, 500].map((ms) => (
              <g key={ms}>
                <line x1={sx(ms)} x2={sx(ms)} y1={162} y2={178} stroke={C.muted} strokeWidth={2.5} />
                <text x={sx(ms)} y={204} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
                  {ms === 500 ? '500 ms' : ms}
                </text>
              </g>
            ))}
          </g>
          <text x={28} y={262} fill={C.muted} fontSize={22} opacity={prog(t, 10.5)}>
            action
          </text>
          {[0, 100, 200].map((ms, i) => (
            <g key={ms} opacity={prog(t, 10.7 + i * 0.3)}>
              <circle cx={sx(ms)} cy={255} r={16} fill={C.card} stroke={C.muted} strokeWidth={2} />
              <path d={`M${sx(ms) - 8},247 L${sx(ms) + 8},263 M${sx(ms) + 8},247 L${sx(ms) - 8},263`} stroke={C.red} strokeWidth={2.5} />
            </g>
          ))}
          {[300, 400, 500].map((ms, i) => (
            <circle key={ms} cx={sx(ms)} cy={255} r={16} fill={C.green} opacity={0.9 * prog(t, 12 + i * 0.3)} />
          ))}
          <line x1={sx(300)} x2={sx(300)} y1={122} y2={236} stroke={C.green} strokeWidth={2} strokeDasharray="7 6" opacity={prog(t, 12)} />
          <text x={sx(100)} y={304} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 11.6)}>
            이미 지난 몫 → 버린다
          </text>
          <text x={sx(400)} y={304} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600} opacity={prog(t, 12.8)}>
            300 ms 의 action 부터 보낸다
          </text>
          <text x={28} y={352} fill={C.dim} fontSize={21} opacity={prog(t, 13.5)}>
            policy 는 1 초에 10 번(100 ms 간격) action 을 낸다 · 관측 쪽도 가장 느린 카메라의 시각에 맞춰 보간해 짝짓는다
          </text>
          <text x={28} y={382} fill={C.dim} fontSize={21} opacity={prog(t, 13.5)}>
            팔 100 ms · 집게 120 ms 처럼 실행 지연이 다르면 집게 명령을 20 ms 더 일찍 보낸다
          </text>
        </svg>
      </Panel>
      <Box x={1276} y={140} w={580} h={400} at={0.3} title={<Head color={C.accent}>같은 순간의 값인가</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={{ ...line(C.green, 23), opacity: prog(t, 0.8) }}>✓ 손에 든 UMI: 사진 · 손끝 궤적 · 집게 폭이 모두 GoPro 한 대에서 → 같은 순간</span>
          <span style={{ ...line(C.red, 23), opacity: prog(t, 3) }}>✕ 로봇: 사진이 컴퓨터로 오는 시간, policy 가 계산하는 시간, 팔이 명령을 따라가는 시간이 각각 든다</span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 5) }}>그대로 두면 policy 는 이미 지난 순간의 사진을 보고, 이미 지난 순간의 몫인 action 을 보낸다</span>
        </div>
      </Box>
      <Box x={64} y={565} w={880} h={315} at={14.5} title={<Head color={C.orange}>맞추지 않으면</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 14.8) }}>
            <span style={mono(C.orange, 28)}>0.5 × 0.3 = 0.15 m</span>
            <span style={line(C.muted, 22)}>1 초에 0.5 m 로 움직일 때 300 ms 의 차이 → 15 cm</span>
          </div>
          <Bar label="latency matching 켬" value={87.5} max={100} color={C.green} at={17.4} width={240} fmt="105/120 = 87.5" unit="%" labelW={220} />
          <Bar label="지연을 모두 0 으로" value={57.5} max={100} color={C.red} at={18.6} width={240} fmt="69/120 = 57.5" unit="%" labelW={220} />
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 19.8) }}>물체를 집어 알맞은 통에 던지는 작업 · 팔이 흔들려 속도가 안 나오고, 팔과 집게의 시각이 어긋나 놓는 순간이 틀린다</span>
        </div>
      </Box>
      <Box x={976} y={565} w={880} h={315} at={21.5} title={<Head color={C.red}>UMI 의 한계</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          {limits.map(([s, at]) => (
            <span key={s} style={{ ...line(C.text, 22), opacity: prog(t, at) }}>
              · {s}
            </span>
          ))}
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- data scaling law ----------

function Scaling() {
  const t = useSec()
  const pts: [number, number, number, string][] = [
    [8, 0.69, 0.31, '0.31'],
    [16, 0.81, 0.19, '0.19'],
    [32, 0.88, 0.12, '0.12'],
    [64, 0.93, 0.074, '0.074'],
  ]
  const px = (i: number) => 120 + i * 220
  const py = (s: number) => 440 - s * 320
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={880} h={740}>
        <div style={{ padding: '24px 28px', display: 'grid', gap: 14, alignContent: 'start' }}>
          <div style={{ opacity: prog(t, 0.3) }}>
            <Head color={C.accent}>Lin 등 (2024) · 시연 4 만 개 이상 · 실물 시험 1 만 5 천 번 이상</Head>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Chip at={0.8} color={C.blue}>Pour Water · 물 따르기</Chip>
            <Chip at={1.3} color={C.blue}>Mouse Arrangement · 마우스 정리</Chip>
            <Chip at={1.8} color={C.muted}>Diffusion Policy + DINOv2 ViT-L/14</Chip>
            <Chip at={2.3} color={C.muted}>새 환경·물체에서만 시험 · 점수 0 ~ 1</Chip>
          </div>
          <div style={{ opacity: prog(t, 6) }}>
            <Head>세 묶음 · 각각 시연 120 개씩</Head>
          </div>
          <svg width={824} height={150}>
            {[
              ['환경 1 곳', '물체 32 개', C.orange, 6.3],
              ['환경 32 곳', '같은 물체 1 개', C.green, 7.1],
              ['환경 32 곳', '곳마다 다른 물체 1 개', C.accent, 7.9],
            ].map(([a, b, col, at], i) => (
              <g key={a as string} opacity={prog(t, at as number)}>
                <rect x={i * 276} y={4} width={260} height={100} rx={14} fill={`${col as string}14`} stroke={col as string} strokeWidth={2} />
                <text x={i * 276 + 130} y={44} textAnchor="middle" fill={col as string} fontSize={25} fontWeight={700}>
                  {a as string}
                </text>
                <text x={i * 276 + 130} y={80} textAnchor="middle" fill={C.text} fontSize={23}>
                  {b as string}
                </text>
              </g>
            ))}
            <text x={0} y={140} fill={C.muted} fontSize={21} opacity={prog(t, 9)}>
              가짓수 1, 2, 4, 8, 16, 32 개를 골라 그 시연의 100%, 50%, …, 3.125% 로 policy 를 따로 학습
            </text>
          </svg>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              ['✓', '환경·물체의 가짓수를 늘리면 새 환경·물체의 점수가 꾸준히 오른다 · 물체 8 개로 두 작업 모두 새 물체에서 0.8 넘음', C.green, 12.3],
              ['✕', '가짓수를 고정하고 시연만 늘리면 금방 멈춘다 · 환경 실험에서 시연 50% 곡선 ≈ 100% 곡선', C.red, 14],
              ['!', '환경을 바꾸는 쪽이 물체를 바꾸는 쪽보다 어렵다 · 가짓수가 적을 때 환경을 늘린 쪽의 점수가 덜 올랐다', C.orange, 15.6],
            ].map(([m, s, col, at]) => (
              <div key={s as string} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', opacity: prog(t, at as number) }}>
                <span style={{ ...mono(col as string, 26), width: 30 }}>{m as string}</span>
                <span style={line(C.text, 22)}>{s as string}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <Panel x={976} y={140} w={880} h={740}>
        <svg width={880} height={740}>
          <text x={28} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 18)}>
            Mouse Arrangement · 환경·물체 쌍의 수와 점수
          </text>
          <text x={852} y={44} textAnchor="end" fill={C.muted} fontSize={22} fontFamily={MONO} opacity={prog(t, 18.6)}>
            gap = 1.263 × x
            <tspan baselineShift="super" fontSize={16}>
              −0.683
            </tspan>
          </text>
          <g opacity={prog(t, 18.2)}>
            <line x1={80} x2={840} y1={py(0)} y2={py(0)} stroke={C.muted} strokeWidth={2} />
            <line x1={80} x2={840} y1={py(1)} y2={py(1)} stroke={C.muted} strokeWidth={1.5} strokeDasharray="6 6" />
            <line x1={80} x2={840} y1={py(0.5)} y2={py(0.5)} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={70} y={py(0) + 8} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              0
            </text>
            <text x={70} y={py(0.5) + 8} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              0.5
            </text>
            <text x={70} y={py(1) + 8} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              1
            </text>
            {pts.map(([n], i) => (
              <text key={n} x={px(i)} y={py(0) + 34} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
                {n}
              </text>
            ))}
            <text x={460} y={py(0) + 66} textAnchor="middle" fill={C.muted} fontSize={21}>
              환경·물체 쌍의 수 (두 배 간격)
            </text>
          </g>
          <polyline points={pts.map(([, s], i) => `${px(i)},${py(s)}`).join(' ')} fill="none" stroke={C.blue} strokeWidth={3} strokeDasharray={1000} strokeDashoffset={1000 * (1 - prog(t, 24.3, 1.6))} />
          {pts.map(([, s, , g], i) => (
            <g key={i} opacity={prog(t, 24.3 + i * 0.4)}>
              <circle cx={px(i)} cy={py(s)} r={8} fill={C.blue} />
              <text x={px(i)} y={py(s) + 38} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
                {s.toFixed(2)}
              </text>
              <text x={px(i)} y={py(s) + 66} textAnchor="middle" fill={C.muted} fontSize={21} fontFamily={MONO}>
                gap {g}
              </text>
            </g>
          ))}
          {['+0.12', '+0.07', '+0.05'].map((d, i) => (
            <text key={d} x={(px(i) + px(i + 1)) / 2} y={py((pts[i][1] + pts[i + 1][1]) / 2) - 16} textAnchor="middle" fill={C.orange} fontSize={21} fontFamily={MONO} opacity={prog(t, 25.6 + i * 0.3)}>
              {d}
            </text>
          ))}
          <g opacity={prog(t, 18.8)}>
            <text x={28} y={540} fill={C.text} fontSize={24}>
              gap = 1 − 점수 · 쌍이 두 배가 될 때마다
            </text>
            <text x={28} y={578} fill={C.accent} fontSize={26} fontFamily={MONO} fontWeight={600}>
              2
              <tspan baselineShift="super" fontSize={18}>
                −0.683
              </tspan>{' '}
              ≈ 0.62 배
            </text>
            <text x={28} y={614} fill={C.muted} fontSize={22}>
              0.31 × 0.62 ≈ 0.19 · 0.19 × 0.62 ≈ 0.12 · 0.12 × 0.62 ≈ 0.074 → power law
            </text>
          </g>
          <g opacity={prog(t, 27.5)}>
            <text x={28} y={664} fill={C.text} fontSize={24}>
              두 배마다 오르는 폭은 0.12, 0.07, 0.05 로 줄어든다
            </text>
            <text x={28} y={700} fill={C.orange} fontSize={24} fontWeight={600}>
              점수 0.99 에는 쌍 1,191 개 (식으로 예측 · 검증은 다음 연구로)
            </text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

function Plan() {
  const t = useSec()
  const grid: [string, string[], number][] = [
    ['1', ['0.14', '0.37', '0.44', '0.36'], 0.6],
    ['4', ['0.46', '0.61', '0.54', '0.52'], 1.4],
    ['16', ['0.74', '0.76', '0.79', '0.73'], 2.2],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={580} h={400} at={0.3} gap={10} title={<Head color={C.accent}>Pour Water · 환경 수 × 환경당 물체 수</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: '110px repeat(4, 1fr)', gap: 6, alignItems: 'baseline' }}>
          <span style={line(C.dim, 20)}>환경 수</span>
          {['물체 1', '2', '3', '4'].map((h) => (
            <span key={h} style={{ ...line(C.dim, 20), textAlign: 'center' }}>
              {h}
            </span>
          ))}
          {grid.map(([n, vs, at]) => (
            <div key={n} style={{ display: 'contents' }}>
              <span style={{ ...mono(C.text, 24), opacity: prog(t, at) }}>{n} 곳</span>
              {vs.map((v, j) => (
                <span key={j} style={{ ...mono(n === '16' ? C.green : C.text, 24), textAlign: 'center', opacity: prog(t, at + j * 0.1), background: n === '16' ? `${C.green}${Math.round(0x22 * prog(t, 4)).toString(16).padStart(2, '0')}` : undefined, borderRadius: 8, padding: '4px 0' }}>
                  {v}
                </span>
              ))}
            </div>
          ))}
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 4) }}>환경 1 곳이면 물체를 늘린 효과가 컸지만, 16 곳이면 0.73 ~ 0.79 로 거의 같다</span>
        <div style={{ opacity: prog(t, 7.2) }}>
          <Chip at={7.2} color={C.green}>환경은 최대한 많이 · 환경마다 물체는 1 개</Chip>
        </div>
      </Box>
      <Box x={664} y={140} w={580} h={400} at={7.8} gap={10} title={<Head color={C.orange}>쌍마다 시연 50 개에서 점수가 멈춘다</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <Bar label="쌍 8 개" value={400} max={1700} color={C.orange} at={8.2} width={200} fmt="400" unit=" 개" labelW={90} />
          <Bar label="쌍 16 개" value={800} max={1700} color={C.orange} at={8.8} width={200} fmt="800" unit=" 개" labelW={90} />
          <Bar label="쌍 32 개" value={1600} max={1700} color={C.orange} at={9.4} width={200} fmt="1,600" unit=" 개" labelW={90} />
        </div>
        <span style={{ ...mono(C.text, 24), opacity: prog(t, 10.4) }}>400 ÷ 8 = 800 ÷ 16 = 1600 ÷ 32 = 50</span>
        <div style={{ opacity: prog(t, 14) }}>
          <span style={mono(C.green, 26)}>쌍 32 개 × 시연 50 개 = 1,600 개</span>
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 15.5) }}>수건 접기 · 충전기 뽑기 · 4 명이 오후 한나절에 수집 → 새 환경 8 곳에서</span>
        <div style={{ display: 'flex', gap: 24, opacity: prog(t, 17) }}>
          <span style={mono(C.green, 30)}>87.5%</span>
          <span style={mono(C.green, 30)}>90.0%</span>
        </div>
      </Box>
      <Box x={1264} y={140} w={592} h={400} at={21} gap={10} title={<Head color={C.blue}>image encoder 의 크기 (쌍 32 개)</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="ViT-S" value={0.66} max={1} color={C.blue} at={21.4} width={220} fmt="0.66" labelW={110} />
          <Bar label="ViT-B" value={0.81} max={1} color={C.blue} at={22} width={220} fmt="0.81" labelW={110} />
          <Bar label="ViT-L" value={0.9} max={1} color={C.blue} at={22.6} width={220} fmt="0.90" labelW={110} />
          <Bar label="처음부터" value={0.03} max={1} color={C.red} at={23.6} width={160} fmt="0.03" sub="pretrained 없이" labelW={110} />
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 25) }}>action 을 만드는 U-Net 을 키우는 것은 효과가 없었다</span>
      </Box>
      <div style={{ position: 'absolute', left: 64, top: 568, width: 1792 }}>
        <Misconception at={10.8} belief="새 장소에서 성공률이 낮으면 지금 장소의 시연을 더 모으면 된다." fact="환경 수를 고정하고 시연을 50% 에서 100% 로 늘려도 처음 보는 환경의 점수는 거의 그대로였다. 시연 1,600 개라면 환경 32 곳에 50 개씩 나눈 쪽이 약 90% 를 냈다." />
      </div>
    </AbsoluteFill>
  )
}

// ---------- MimicGen ----------

function MimicGen() {
  const t = useSec()
  // top view, 1 cm = 6 px; x 30 ~ 85 cm → 0 ~ 330 px, y −15 ~ 30 cm (up is +y)
  const X = (cm: number) => (cm - 30) * 6
  const Y = (cm: number) => 300 - (cm + 15) * 6
  const limits: [ReactNode, number][] = [
    [
      <>
        생성률 8.2% (Gear Assembly D1) → 1,000 개에 <span style={mono(C.text, 22)}>1000 ÷ 0.082 ≈ 12,200</span> 번 시도 · 그래도 policy 는 76.0%
      </>,
      22.3,
    ],
    ['성공한 배치만 남는다 → Three Piece Assembly D1 은 배치 칸의 43.5% 만 채움', 23.5],
    ['실물: 블록 쌓기 243 번 시도 → 200 개 (82.3%), 캡슐 넣기 192 → 100 개 (52.1%) · policy 36% · 14%', 24.7],
    [
      <>
        <b style={{ color: C.green }}>DemoGen</b>: 깊이 카메라의 point cloud 에서 물체 점들을 옮겨 관측을 만든다 · 궤적 하나 0.01 초 · 실물 작업 8 개 11.0% → 74.6%
      </>,
      26.5,
    ],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <div style={{ padding: '24px 28px', display: 'grid', gap: 12, alignContent: 'start' }}>
          <div style={{ opacity: prog(t, 0.3) }}>
            <Head color={C.accent}>MimicGen · 사람 시연 몇 개를 새 물체 위치에 맞게 옮겨 수백 ~ 수천 개로</Head>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Chip at={1} color={C.muted}>action = 손끝 자세 변화량</Chip>
            <Chip at={1.6} color={C.muted}>하위 작업 순서는 사람이</Chip>
            <Chip at={2.2} color={C.muted}>물체 자세를 안다</Chip>
          </div>
          <Flow steps={['하위 작업으로 나눔', '상대 자세 그대로 옮김', '직선 끼움', '성공만 남김']} color={C.green} at={7.2} gap={0.45} />
          <svg width={944} height={385}>
            {/* original scene */}
            <g transform="translate(20 40)" opacity={prog(t, 7.5)}>
              <text x={0} y={-8} fill={C.text} fontSize={22} fontWeight={600}>
                원래 시연 · 위에서 본 모식도 (cm)
              </text>
              <rect x={0} y={0} width={340} height={300} rx={10} fill={C.bg} stroke={C.cardEdge} />
              <circle cx={X(40)} cy={Y(0)} r={22} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={2.5} />
              <rect x={X(40) + 18} y={Y(0) - 8} width={16} height={16} rx={4} fill="none" stroke={C.orange} strokeWidth={2.5} />
              <text x={X(40) + 46} y={Y(0) + 7} fill={C.orange} fontSize={21} fontFamily={MONO}>
                잔 (40, 0)
              </text>
              <line x1={X(40)} y1={Y(-10)} x2={X(40)} y2={Y(-2) + 8} stroke={C.blue} strokeWidth={4} strokeLinecap="round" />
              <circle cx={X(40)} cy={Y(-10)} r={7} fill={C.blue} />
              <text x={X(40) + 14} y={Y(-10) + 8} fill={C.blue} fontSize={20} fontFamily={MONO}>
                (40, −10) → (40, −2)
              </text>
              <text x={14} y={30} fill={C.muted} fontSize={20}>
                잔 기준 상대 위치 (0, −10), (0, −2)
              </text>
            </g>
            {/* new scene */}
            <g transform="translate(580 40)" opacity={prog(t, 9.5)}>
              <text x={0} y={-8} fill={C.text} fontSize={22} fontWeight={600}>
                새 장면 · 잔이 옮겨지고 90° 돌아감
              </text>
              <rect x={0} y={0} width={340} height={300} rx={10} fill={C.bg} stroke={C.cardEdge} />
              <circle cx={X(60)} cy={Y(20)} r={22} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={2.5} />
              <rect x={X(60) - 8} y={Y(20) - 34} width={16} height={16} rx={4} fill="none" stroke={C.orange} strokeWidth={2.5} />
              <text x={X(60)} y={Y(20) + 48} textAnchor="middle" fill={C.orange} fontSize={21} fontFamily={MONO}>
                잔 (60, 20)
              </text>
              <g opacity={prog(t, 10.5)}>
                <line x1={X(70)} y1={Y(20)} x2={X(62) + 8} y2={Y(20)} stroke={C.blue} strokeWidth={4} strokeLinecap="round" />
                <circle cx={X(70)} cy={Y(20)} r={7} fill={C.blue} />
                <text x={16} y={Y(20) - 52} fill={C.blue} fontSize={20} fontFamily={MONO}>
                  (70, 20) → (62, 20)
                </text>
              </g>
              <g opacity={prog(t, 11.5)}>
                <circle cx={X(45)} cy={Y(-10)} r={7} fill={C.green} />
                <text x={X(45) - 30} y={Y(-10) + 30} fill={C.green} fontSize={20}>
                  지금 손끝
                </text>
                <line x1={X(45)} y1={Y(-10)} x2={X(70)} y2={Y(20)} stroke={C.green} strokeWidth={3} strokeDasharray="8 7" />
                <text x={X(66)} y={Y(2)} fill={C.green} fontSize={20}>
                  끼워 넣은 직선
                </text>
              </g>
            </g>
            <text x={0} y={374} fill={C.muted} fontSize={21} opacity={prog(t, 12.5)}>
              (0, −10)·(0, −2) 를 90° 돌린 (10, 0)·(2, 0) 을 (60, 20) 에 더하면 (70, 20)·(62, 20)
            </text>
          </svg>
        </div>
      </Panel>
      <Box x={1096} y={140} w={760} h={330} at={14.5} gap={10} title={<Head color={C.green}>사람 시연 10 개 → 1,000 개 · 같은 BC-RNN</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 1fr', gap: 8, alignItems: 'baseline' }}>
          <span style={line(C.dim, 20)}>작업</span>
          <span style={line(C.dim, 20)}>사람 시연 10 개</span>
          <span style={line(C.dim, 20)}>MimicGen 1,000 개</span>
          {[
            ['Square · 너트 끼우기', '11.3%', '90.7%', 14.9],
            ['Threading · 바늘 꿰기', '19.3%', '98.0%', 15.7],
            ['Three Piece Assembly', '1.3%', '82.0%', 16.5],
          ].map(([n, a, b, at]) => (
            <div key={n as string} style={{ display: 'contents' }}>
              <span style={{ ...line(C.text, 22), opacity: prog(t, at as number) }}>{n as string}</span>
              <span style={{ ...mono(C.red, 26), opacity: prog(t, at as number) }}>{a as string}</span>
              <span style={{ ...mono(C.green, 26), opacity: prog(t, at as number) }}>{b as string}</span>
            </div>
          ))}
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 18.5) }}>작업 18 개 · 시연 약 200 → 5 만 개 이상 · 200 → 1,000 은 크게 오르고 1,000 → 5,000 은 별로 안 오름</span>
      </Box>
      <Box x={1096} y={495} w={760} h={385} at={22} gap={10} title={<Head color={C.red}>한계 · 그리고 DemoGen</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          {limits.map(([s, at], i) => (
            <span key={i} style={{ ...line(C.text, 21), opacity: prog(t, at) }}>
              · {s}
            </span>
          ))}
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- curation and the data mixture ----------

function Cupid() {
  const t = useSec()
  const data: [string, string, number][] = [
    ['MM', '이동 로봇 · 집 약 100 곳 · 집안일 약 400 시간', 26.6],
    ['ME', '여러 집의 고정 팔', 27.1],
    ['CE', '실험실의 여러 로봇 (OXE 포함)', 27.6],
    ['HL', '다음 하위 작업을 글로 맞히기', 28.1],
    ['WD', '웹 데이터 · 사진 설명 · 물체 위치', 28.6],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={28} y={44} fill={C.accent} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            시연 고르기 · validation MSE 는 실물 성공률과 어긋난다
          </text>
          <text x={28} y={78} fill={C.muted} fontSize={21} opacity={prog(t, 1)}>
            policy 는 자기 action 으로 바뀐 장면을 다시 보므로, 한 step 씩 맞히는 오차가 작아도 이어지는 결정에서 어긋난다
          </text>
          {[
            ['image encoder 를 LoRA 로만 고침', 0.0049, 0.72, 6.8],
            ['전체 weight 를 고침', 0.006, 0.9, 7.8],
          ].map(([n, mse, sc, at], i) => {
            const y = 120 + i * 58
            return (
              <g key={n as string} opacity={prog(t, at as number)}>
                <text x={28} y={y + 24} fill={C.text} fontSize={22}>
                  {n as string}
                </text>
                <rect x={370} y={y + 4} width={((mse as number) / 0.006) * 160 * prog(t, at as number, 0.8)} height={28} rx={6} fill={C.red} opacity={0.8} />
                <text x={540} y={y + 25} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  MSE {mse as number}
                </text>
                <rect x={700} y={y + 4} width={(sc as number) * 160 * prog(t, at as number, 0.8)} height={28} rx={6} fill={C.green} opacity={0.85} />
                <text x={870} y={y + 25} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  실물 {(sc as number).toFixed(2)}
                </text>
              </g>
            )
          })}
          <text x={28} y={262} fill={C.orange} fontSize={21} fontWeight={600} opacity={prog(t, 10)}>
            MSE 가 낮은 쪽(0.0049)의 실물 점수가 더 낮다 (0.72 &lt; 0.90) · Lin 등 부록
          </text>
          <g opacity={prog(t, 13)}>
            <rect x={28} y={290} width={944} height={150} rx={16} fill={`${C.accent}10`} stroke={`${C.accent}66`} strokeWidth={1.5} />
            <text x={48} y={326} fill={C.accent} fontSize={24} fontWeight={700}>
              CUPID · 시연의 값 = 실행 결과에 준 영향
            </text>
            <text x={48} y={364} fill={C.text} fontSize={23} fontFamily={MONO}>
              점수 = Σ 실행 (성공 +1 · 실패 −1) × influence
            </text>
            <text x={48} y={398} fill={C.muted} fontSize={21}>
              influence: 그 시연을 더 학습하면 그 실행의 action 이 더 잘 나오는 정도 · 다시 학습하지 않고 어림
            </text>
            <text x={48} y={428} fill={C.muted} fontSize={21}>
              policy 1 번 학습 + 실물 실행 25 번 · 점수가 − 인 시연은 지우고, 새 시연은 점수가 큰 것부터 더한다
            </text>
          </g>
          <g opacity={prog(t, 19.5)}>
            <text x={28} y={486} fill={C.text} fontSize={24} fontWeight={600}>
              TuckBox · 통을 받침대 밑에 밀어 넣기 (시연은 모두 성공한 것)
            </text>
            {Array.from({ length: 6 }, (_, i) => (
              <rect key={i} x={28 + i * 42} y={504} width={36} height={36} rx={6} fill={C.orange} opacity={0.85 * prog(t, 19.8 + i * 0.08)} />
            ))}
            {Array.from({ length: 3 }, (_, i) => (
              <rect key={i} x={300 + i * 42} y={504} width={36} height={36} rx={6} fill={C.green} opacity={0.85 * prog(t, 20.4 + i * 0.08)} />
            ))}
            <text x={28} y={568} fill={C.orange} fontSize={21}>
              밀기 : 집어 옮기기 = 2 : 1 (칸 수는 비율만 보인 예)
            </text>
            <text x={460} y={528} fill={C.red} fontSize={23} fontWeight={600} opacity={prog(t, 21.4)}>
              무게 배치를 바꾼 통 → policy 가 늘 민다 → 0%
            </text>
          </g>
          <g opacity={prog(t, 23)}>
            <text x={28} y={616} fill={C.text} fontSize={22}>
              실패한 실행의 밀기 action 을 만든 시연 → 점수 − → 지움 → 집어 옮기기가 늘어
            </text>
            <text x={760} y={616} fill={C.green} fontSize={28} fontFamily={MONO} fontWeight={700}>
              0% → 84 ~ 88%
            </text>
            <text x={28} y={656} fill={C.muted} fontSize={21} opacity={prog(t, 24.5)}>
              실행 기록 없이 시연만 보는 DemInf 는 편차가 큰 집어 옮기기를 품질이 낮다고 걸러 → 다시 밀기만 했다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={740} at={26} gap={10} title={<Head color={C.purple}>π0.5 · VLA pretraining 의 data mixture</Head>}>
        <div style={{ display: 'grid', gap: 6 }}>
          {data.map(([k, v, at]) => (
            <div key={k} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ ...mono(C.purple, 22), width: 44 }}>{k}</span>
              <span style={line(C.text, 21)}>{v}</span>
            </div>
          ))}
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 29) }}>
          정규화: dataset 마다, 차원마다 <span style={mono(C.purple, 22)}>1% · 99% quantile → −1 ~ 1</span> · 튄 값 하나가 범위를 넓히지 못하게
        </span>
        <div style={{ opacity: prog(t, 30) }}>
          <span style={line(C.text, 22)}>이동 로봇 데이터의 장소 수를 바꿔 post-training (학습 step 40,000 고정)</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
            {[3, 12, 22, 53, 82, 104].map((n, i) => (
              <span key={n} style={{ ...mono(i === 5 ? C.green : C.muted, 24), padding: '6px 12px', borderRadius: 10, border: `1.5px solid ${i === 5 ? C.green : C.cardEdge}` }}>
                {n} 곳
              </span>
            ))}
          </div>
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 30.8) }}>104 곳 → 시험하는 집의 데이터까지 넣은 모델과 비슷 · 104 곳 데이터만으로 학습하면 훨씬 낮다</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 31.4) }}>ME 나 CE 를 빼면 크게 떨어지고 둘 다 빼면 더 떨어진다 · WD 는 새 종류의 물건을 이름으로 고를 때 차이 · π0 은 첫 단계 예시의 97.6% 가 목표 로봇이 아닌 데이터</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'OXE 와 DROID', color: C.accent, text: 'OXE 는 action 7 개 + dataset 별 정규화 (작은 dataset +50%) · DROID 장면 564 곳 → +22%p', at: 1 },
    { tag: 'UMI 로봇 없는 수집', color: C.green, text: '손목 카메라 · SLAM + IMU 궤적 · latency matching (87.5% → 57.5%) · 1 시간에 111 개', at: 4.8 },
    { tag: 'data scaling law', color: C.blue, text: 'gap 은 쌍이 두 배면 0.62 배 (power law) · 쌍마다 시연 50 개 · 32 × 50 = 1,600 개로 약 90%', at: 8.8 },
    { tag: '합성 · 고르기 · 섞기', color: C.orange, text: 'MimicGen 10 → 1,000 (11.3% → 90.7%) · CUPID 0% → 84 ~ 88% · π0.5 quantile 정규화, 장소 104 곳', at: 12.8 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1620 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            처음 보는 곳에서도 일하려면 어떤 시연을 얼마나, 어떻게 그만큼 모아야 할까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 24, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 31, fontWeight: 600, whiteSpace: 'nowrap' }}>{it.text}</span>
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
            NEXT · IMITATION
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>RT-2 → OpenVLA · π0</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            이 데이터로 사진과 글을 읽는 모델에 action 출력을 붙인 VLA · 이어서 GR00T N1 과 VLA + RL
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/data-scaling
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseOxe = () => (
  <PauseWrite
    question="로봇 C 의 dataset 은 한 step 에 손끝을 최대 ±4 cm 옮기고, dataset 마다 최댓값으로 나눠 정규화했다. 모델이 −0.25 를 냈다면 로봇 C 에 보낼 이동량은?"
    answer="정규화할 때 4 cm 로 나눴으니 되돌릴 때는 4 cm 를 곱한다 · −0.25 × 4 = −1 → x 쪽으로 −1 cm"
  />
)

const PauseLatency = () => (
  <PauseWrite
    question="policy 가 1 초에 20 번(50 ms 간격) action 을 내고, 카메라 60 ms, 추론 90 ms, 팔 100 ms 가 걸린다. 버리는 action 은 몇 개이고 몇 ms 의 action 부터 보낼까?"
    answer="60 + 90 + 100 = 250 ms → 0, 50, 100, 150, 200 ms 의 5 개를 버리고 250 ms 의 action 부터 보낸다"
  />
)

const PauseScaling = () => (
  <PauseWrite
    question="쌍을 두 배로 늘릴 때마다 gap 이 0.62 배가 된다. 쌍 16 개에서 점수가 0.80 이었다면 64 개에서는 몇 점쯤일까?"
    answer="gap: 1 − 0.80 = 0.20 → 32 개 0.20 × 0.62 = 0.124 → 64 개 0.124 × 0.62 ≈ 0.077 → 점수 1 − 0.077 ≈ 0.92"
  />
)

const PauseCupid = () => (
  <PauseWrite
    question="실행 결과가 성공, 성공, 실패이고 어떤 시연의 influence 가 차례로 +0.1, +0.3, +0.6 이다. 이 시연의 점수는 얼마이고, 지울 후보인가?"
    answer="(+1)(0.1) + (+1)(0.3) + (−1)(0.6) = 0.1 + 0.3 − 0.6 = −0.2 · 점수가 − 라서 policy 를 실패한 실행 쪽으로 미는 시연, 지울 후보"
  />
)

export function DataScaling() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        oxe: Oxe,
        droid: Droid,
        'pause-oxe': PauseOxe,
        umi: Umi,
        latency: Latency,
        'pause-latency': PauseLatency,
        scaling: Scaling,
        plan: Plan,
        'pause-scaling': PauseScaling,
        mimicgen: MimicGen,
        cupid: Cupid,
        'pause-cupid': PauseCupid,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
