import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './teleop-dataset.narration.json'
import { script } from './teleop-dataset.script'

// Numbers follow lessons/teleop-dataset/README.md (see teleop-dataset.script.ts). The arm, gripper and timeline drawings are
// schematic (marked 모식도 / 예로 든 값); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 26 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
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
      {sub && <span style={{ fontSize: 22, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>{sub}</span>}
    </div>
  )
}

function Box({ x, y, w, h, title, color = C.cardEdge, at, gap = 14, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; gap?: number; children?: ReactNode }) {
  return (
    <Appear at={at} style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ height: h, boxSizing: 'border-box', padding: '22px 28px', borderRadius: 20, background: C.card, border: `1.5px solid ${color}`, display: 'grid', alignContent: 'start', gap }}>
        {title && <div>{title}</div>}
        {children}
      </div>
    </Appear>
  )
}

function Flow({ steps, color, at, gap = 0.5, last }: { steps: string[]; color: string; at: number; gap?: number; last?: string }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
      {last && <span style={{ fontSize: 26, fontWeight: 600, color, marginLeft: 8, whiteSpace: 'nowrap', opacity: prog(t, at + steps.length * gap) }}>{last}</span>}
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

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

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

/** rows of left-aligned cells; `monoCols` are set in MONO */
function Rows({ head, rows, widths, at, step = 0.5, size = 21, monoCols = [], colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; monoCols?: number[]; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], flexShrink: 0, fontFamily: monoCols.includes(i) ? MONO : undefined, fontSize: size, whiteSpace: 'nowrap' })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 1 }}>
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
            IMITATION · TELEOP DATASET
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Teleop Dataset</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            사람이 조종한 시연 → frame 마다 <span style={{ color: C.accent }}>사진 · state · action · timestamp</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            같은 시각끼리 묶어 쌓은 기록을 만드는 장치 · 형식 · 품질 기준
          </Label>
        </Appear>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, marginTop: 24, maxWidth: 1700 }}>
          {script.sections.map((c, i) => (
            <Appear key={c} at={4.4 + i * 0.45}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999, border: `1.5px solid ${C.cardEdge}`, background: C.card, fontSize: 28, transform: `scale(${1 + 0.04 * Math.sin(Math.max(0, t - 4.4 - i * 0.45) * 2)})` }}>
                <span style={{ fontFamily: MONO, color: C.accent, fontWeight: 600 }}>{i + 1}</span>
                <span>{c}</span>
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
  const tile = (big: string, label: string, color: string, at: number) => (
    <div style={{ flex: 1, padding: '12px 18px', borderRadius: 16, border: `1.5px solid ${color}55`, background: `${color}10`, display: 'grid', gap: 4, opacity: prog(t, at) }}>
      <span style={{ fontFamily: MONO, fontSize: 38, fontWeight: 600, color, whiteSpace: 'nowrap' }}>{big}</span>
      <span style={line(C.muted, 21)}>{label}</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={250} at={0.5} color={`${C.green}88`} title={<Head color={C.green}>dataset A · SO-101 로 블록을 상자에 넣는 시연 50 개</Head>}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 0.9) }}>
          <span style={{ color: C.green, fontSize: 34, fontWeight: 700 }}>✓</span>
          <span style={line(C.text, 26)}>이 dataset 으로 학습한 policy 는 블록을 잘 집는다</span>
        </div>
      </Box>
      <Box x={976} y={140} w={880} h={250} at={1.2} color={`${C.red}88`} title={<Head color={C.red}>dataset B · 같은 작업, 같은 시연 50 개</Head>}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 1.6) }}>
          <span style={{ color: C.red, fontSize: 34, fontWeight: 700 }}>✕</span>
          <span style={line(C.text, 26)}>policy 가 블록 위에서 한참 멈추거나, 엉뚱한 높이에서 집게를 닫는다</span>
        </div>
      </Box>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 425, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          <span>
            무엇을 어떻게 기록해야 <span style={{ color: C.accent }}>학습에 쓸 수 있는 dataset</span> 이 될까?
          </span>
        </div>
      </Appear>
      <Card x={330} y={560} w={1260} h={230} at={5.6}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 16 }}>
          <Label size={22} style={{ opacity: prog(t, 5.8) }}>
            LeRobot 논문 · 2025 년 9 월 기준으로 공개된 dataset
          </Label>
          <div style={{ display: 'flex', gap: 18 }}>
            {tile('2,200 명 넘게', '기여자', C.blue, 6.0)}
            {tile('16,000 개 이상', 'LeRobotDataset 형식의 dataset', C.accent, 6.4)}
            {tile('절반 넘게', 'SO-100 · SO-101 계열의 값싼 팔로 모음', C.orange, 6.8)}
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- S1: input devices ----------

function DeviceDiagram({ t }: { t: number }) {
  const box = (x: number, y: number, w: number, h: number, color: string, at: number, label: ReactNode) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={`${color}18`} stroke={color} strokeWidth={2} />
      {label}
    </g>
  )
  return (
    <svg width={1792} height={390}>
      <g opacity={prog(t, 0.3)}>
        <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
          입력 장치가 내는 값 → follower 의 목표 각도 6 개
        </text>
        <text x={1762} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
          모식도
        </text>
      </g>
      {box(1300, 130, 430, 120, C.accent, 0.6, (
        <>
          <text x={1515} y={182} textAnchor="middle" fill={C.text} fontSize={26} fontWeight={600}>
            follower 목표 각도 6 개
          </text>
          <text x={1515} y={220} textAnchor="middle" fill={C.muted} fontSize={21}>
            SO-101 · 관절 5 개 + 집게 1 개
          </text>
        </>
      ))}
      {/* joint-space: leader arm */}
      {box(30, 82, 300, 56, C.blue, 1.4, (
        <text x={180} y={118} textAnchor="middle" fill={C.text} fontSize={24} fontWeight={600}>
          leader 팔
        </text>
      ))}
      <g opacity={prog(t, 1.8)}>{arrow(330, 110, 516, 110, C.blue)}</g>
      {box(520, 82, 280, 56, C.blue, 2.0, (
        <text x={660} y={118} textAnchor="middle" fill={C.text} fontSize={24}>
          calibration
        </text>
      ))}
      <g opacity={prog(t, 2.4)}>
        {arrow(800, 110, 1296, 168, C.blue)}
        <text x={520} y={170} fill={C.blue} fontSize={20} fontWeight={600}>
          joint-space mapping · 관절 각도 그대로
        </text>
      </g>
      {/* task-space: the other devices */}
      {box(30, 196, 300, 50, C.orange, 7.2, (
        <text x={180} y={229} textAnchor="middle" fill={C.text} fontSize={22}>
          VR 조종기 · 스마트폰
        </text>
      ))}
      {box(30, 258, 300, 50, C.orange, 7.5, (
        <text x={180} y={291} textAnchor="middle" fill={C.text} fontSize={22}>
          spacemouse
        </text>
      ))}
      {box(30, 320, 300, 50, C.orange, 7.8, (
        <text x={180} y={353} textAnchor="middle" fill={C.text} fontSize={22}>
          키보드
        </text>
      ))}
      <g opacity={prog(t, 8.3)}>
        {arrow(330, 221, 516, 272, C.orange)}
        {arrow(330, 283, 516, 283, C.orange)}
        {arrow(330, 345, 516, 294, C.orange)}
      </g>
      {box(520, 250, 280, 66, C.orange, 8.6, (
        <>
          <text x={660} y={278} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
            손끝 목표
          </text>
          <text x={660} y={304} textAnchor="middle" fill={C.muted} fontSize={20}>
            end-effector
          </text>
        </>
      ))}
      <g opacity={prog(t, 9.2)}>{arrow(800, 283, 896, 283, C.orange)}</g>
      {box(900, 250, 240, 66, C.orange, 9.4, (
        <text x={1020} y={291} textAnchor="middle" fill={C.text} fontSize={22}>
          IK 로 관절 각도
        </text>
      ))}
      <g opacity={prog(t, 9.9)}>
        {arrow(1140, 283, 1296, 226, C.orange)}
        <text x={520} y={354} fill={C.orange} fontSize={20} fontWeight={600}>
          task-space mapping · IK 계산을 한 번 더
        </text>
      </g>
    </svg>
  )
}

function Devices() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={390} at={0.3}>
        <DeviceDiagram t={t} />
      </Card>
      <Box x={64} y={555} w={1100} h={325} at={14} title={<Head size={24}>RoboTurk · 대학생 8 명 · simulation 속 Sawyer 팔 · picking 평균 완료 시간</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="VR 조종기" value={79.36} max={160} color={C.green} at={14.3} width={560} labelW={230} unit=" 초" />
          <Bar label="스마트폰" value={89.97} max={160} color={C.blue} at={14.8} width={560} labelW={230} unit=" 초" />
          <Bar label="spacemouse" value={112.57} max={160} color={C.orange} at={15.3} width={560} labelW={230} unit=" 초" />
          <Bar label="키보드" value={151.45} max={160} color={C.red} at={15.8} width={560} labelW={230} unit=" 초" />
        </div>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 17.5) }}>키보드 · spacemouse 는 통계적으로 유의하게 느렸고, 스마트폰과 VR 의 차이는 확인되지 않았다</span>
      </Box>
      <Box x={1188} y={555} w={668} h={325} at={21} color={`${C.red}77`} title={<Head size={24} color={C.red}>키보드 시연이 남기는 버릇</Head>}>
        <svg width={612} height={150}>
          <path d="M40,130 L180,130 L180,95 L330,95 L330,62 L470,62 L470,30 L580,30" fill="none" stroke={C.red} strokeWidth={4} opacity={prog(t, 21.4)} />
          <path d="M40,130 C250,130 380,30 580,30" fill="none" stroke={C.green} strokeWidth={3} strokeDasharray="8 7" opacity={prog(t, 22.2)} />
          <circle cx={40} cy={130} r={8} fill={C.text} opacity={prog(t, 21.2)} />
          <circle cx={580} cy={30} r={8} fill={C.accent} opacity={prog(t, 21.2)} />
        </svg>
        <div style={{ display: 'grid', gap: 4 }}>
          <span style={{ ...line(C.red, 21), opacity: prog(t, 21.6) }}>━ 키보드: 축에 나란한 움직임을 이어 붙인 길 · 늘 같은 속도</span>
          <span style={{ ...line(C.green, 21), opacity: prog(t, 22.4) }}>┅ VR 조종기: 손의 움직임 그대로 · policy 는 둘 다 따라 배운다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

/** a two-link arm standing on a base at (x, y) */
function Arm({ x, y, color, dashed = false }: { x: number; y: number; color: string; dashed?: boolean }) {
  const ex = x + 90
  const ey = y - 130
  const hx = ex + 140
  const hy = ey + 30
  const dash = dashed ? '8 6' : undefined
  return (
    <g>
      <rect x={x - 50} y={y} width={100} height={24} rx={6} fill={C.cardEdge} stroke={C.muted} strokeWidth={1.5} />
      <line x1={x} y1={y} x2={ex} y2={ey} stroke={color} strokeWidth={14} strokeLinecap="round" strokeDasharray={dash} />
      <line x1={ex} y1={ey} x2={hx} y2={hy} stroke={color} strokeWidth={11} strokeLinecap="round" strokeDasharray={dash} />
      <circle cx={x} cy={y} r={10} fill={C.card} stroke={color} strokeWidth={3} />
      <circle cx={ex} cy={ey} r={8} fill={C.card} stroke={color} strokeWidth={3} />
      <line x1={hx} y1={hy} x2={hx + 18} y2={hy - 14} stroke={color} strokeWidth={5} strokeLinecap="round" />
      <line x1={hx} y1={hy} x2={hx + 18} y2={hy + 14} stroke={color} strokeWidth={5} strokeLinecap="round" />
    </g>
  )
}

function Leader() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={860} h={450} at={0.3}>
        <svg width={860} height={450}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            leader 와 follower · 같은 자세, 다른 센서 값
          </text>
          <text x={830} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
            모식도
          </text>
          <g opacity={prog(t, 0.6)}>
            <Arm x={180} y={270} color={C.blue} />
            <text x={180} y={330} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
              leader 팔
            </text>
            <text x={180} y={362} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
              어깨 센서 20°
            </text>
          </g>
          <g opacity={prog(t, 1.2)}>
            <Arm x={560} y={270} color={C.green} />
            <text x={560} y={330} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
              follower 팔
            </text>
            <text x={560} y={362} textAnchor="middle" fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600}>
              어깨 센서 25°
            </text>
          </g>
          <text x={30} y={94} fill={C.accent} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 2.4)}>
            follower 목표 = leader 20° + offset 5° = 25°
          </text>
          <g opacity={prog(t, 6.3)}>
            <text x={30} y={404} fill={C.text} fontSize={21}>
              calibration · 모터마다 저장 (leader 와 follower 각각)
            </text>
            <text x={30} y={436} fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
              homing_offset · drive_mode · range_min · range_max
            </text>
          </g>
        </svg>
      </Card>
      <Box x={956} y={140} w={900} h={450} at={12} color={`${C.orange}77`} title={<Head color={C.orange}>ALOHA 가 관절 각도를 그대로 옮긴 이유</Head>}>
        <div style={{ display: 'grid', gap: 14 }}>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 12.4) }}>① 정밀한 작업은 특이 자세(singularity) 근처에서 할 때가 많은데, 관절 6 개짜리 팔에서는 기성 IK 가 그 근처에서 자주 실패한다</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 14.2) }}>② leader 팔은 무게가 있어서 너무 빠른 움직임과 작은 떨림을 줄여 준다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 16) }}>대신 로봇마다 같은 모양의 팔을 한 대 더 갖춰야 한다</span>
        </div>
      </Box>
      <Box x={64} y={610} w={1792} h={270} at={18} title={<Head>action 에는 leader 의 각도를 적는다 · svla_so101_pickplace episode 0, 블록을 쥔 frame 170 ~ 210</Head>}>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <svg width={520} height={170}>
            <g opacity={prog(t, 18.4)}>
              <line x1={20} y1={160} x2={500} y2={160} stroke={C.cardEdge} strokeWidth={3} />
              <rect x={220} y={70} width={80} height={90} rx={6} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={2} />
              <text x={340} y={124} fill={C.orange} fontSize={22} fontWeight={600}>
                블록
              </text>
              <rect x={200} y={20} width={120} height={12} rx={4} fill={C.green} />
              <rect x={200} y={20} width={20} height={130} rx={5} fill={C.green} />
              <rect x={300} y={20} width={20} height={130} rx={5} fill={C.green} />
              <text x={20} y={70} fill={C.green} fontSize={21} fontWeight={600}>
                follower
              </text>
              <text x={20} y={98} fill={C.muted} fontSize={20}>
                블록에 막힘
              </text>
            </g>
            <g opacity={prog(t, 19.4)}>
              <rect x={234} y={36} width={18} height={114} rx={5} fill="none" stroke={C.blue} strokeWidth={2.5} strokeDasharray="6 5" />
              <rect x={268} y={36} width={18} height={114} rx={5} fill="none" stroke={C.blue} strokeWidth={2.5} strokeDasharray="6 5" />
              <text x={20} y={136} fill={C.blue} fontSize={21} fontWeight={600}>
                leader (점선)
              </text>
            </g>
          </svg>
          <div style={{ display: 'grid', gap: 8 }}>
            <span style={{ ...line(C.text, 22), opacity: prog(t, 19.6) }}>집게가 블록을 쥐면 follower 는 덜 닫히고 leader 는 더 닫혀 있다</span>
            <span style={{ ...line(C.text, 22), opacity: prog(t, 20.6) }}>모터는 그 차이에 비례한 힘으로 쥔다 → follower 각도를 적으면 쥐는 힘이 기록에서 사라진다</span>
            <span style={{ ...mono(C.blue, 26), opacity: prog(t, 24.4) }}>action (leader 집게) 1.0 ~ 1.2</span>
            <span style={{ ...mono(C.green, 26), opacity: prog(t, 25.2) }}>follower 집게 값 7.0 · 집게 값 범위 0 ~ 100</span>
          </div>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S2: frames and clocks ----------

function Timeline({ t }: { t: number }) {
  const cx = (i: number) => 420 + i * 300
  const ts = ['0.000', '0.033', '0.067', '0.100', '0.133']
  return (
    <svg width={1792} height={360}>
      <g opacity={prog(t, 0.3)}>
        <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
          frame 다섯 개 · 어깨 관절 하나만 놓고 보면
        </text>
        <text x={1762} y={40} textAnchor="end" fill={C.dim} fontSize={20}>
          예로 든 값 · 1초에 30°
        </text>
      </g>
      <g opacity={prog(t, 6.3)}>
        <text x={30} y={108} fill={C.accent} fontSize={22}>
          timestamp (초)
        </text>
      </g>
      <g opacity={prog(t, 0.8)}>
        <text x={30} y={168} fill={C.muted} fontSize={22}>
          사진
        </text>
      </g>
      <g opacity={prog(t, 18.3)}>
        <text x={30} y={238} fill={C.blue} fontSize={22}>
          state: 어깨 각도
        </text>
        <text x={30} y={298} fill={C.green} fontSize={22}>
          action: 어깨 목표
        </text>
      </g>
      {ts.map((s, i) => (
        <g key={i}>
          <g opacity={prog(t, 0.5 + i * 0.25)}>
            <rect x={cx(i) - 100} y={56} width={200} height={268} rx={14} fill="none" stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={cx(i)} y={78} textAnchor="middle" fill={C.text} fontSize={22} fontWeight={600}>
              frame {i}
            </text>
            <rect x={cx(i) - 50} y={134} width={100} height={52} rx={6} fill={C.grid} stroke={C.muted} strokeWidth={1.5} />
            <path d={`M${cx(i) - 42},178 L${cx(i) - 14},152 L${cx(i) + 4},170 L${cx(i) + 20},158 L${cx(i) + 42},178 Z`} fill={`${C.muted}88`} />
          </g>
          <text x={cx(i)} y={108} textAnchor="middle" fill={C.accent} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 6.5 + i * 0.2)}>
            {s}
          </text>
          <text x={cx(i)} y={238} textAnchor="middle" fill={C.blue} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 18.5 + i * 0.15)}>
            {10 + i}°
          </text>
          <text x={cx(i)} y={298} textAnchor="middle" fill={C.green} fontSize={26} fontFamily={MONO} fontWeight={600} opacity={prog(t, 18.8 + i * 0.15)}>
            {11 + i}°
          </text>
          {i < 4 && <g opacity={prog(t, 20 + i * 0.3)}>{arrow(cx(i) + 40, 290, cx(i + 1) - 40, 236, C.green, 2.5, 10)}</g>}
        </g>
      ))}
      <text x={30} y={350} fill={C.muted} fontSize={21} opacity={prog(t, 21.5)}>
        초록 화살표: frame k 에 보낸 목표가 다음 frame 의 state 가 된다 → 관측은 action 을 보내기 직전에 읽는다
      </text>
    </svg>
  )
}

function Frames() {
  const t = useSec()
  const lag = [4.14, 3.13, 2.12, 1.09, 0.26, 1.2, 2.24]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={360} at={0.3}>
        <Timeline t={t} />
      </Card>
      <Box x={64} y={520} w={520} h={360} at={0.6} title={<Head color={C.accent}>frame 의 시각</Head>}>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 1) }}>30 fps → 간격 1000 ÷ 30 ≈ 33.3 ms</span>
        <span style={{ ...mono(C.accent, 40), opacity: prog(t, 6.2) }}>t = k ÷ fps</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 8.5) }}>frame 57 → 57 ÷ 30 = 1.9 초</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 10) }}>LeRobot 도 시계를 읽지 않고 이 식으로 timestamp 를 적는다</span>
      </Box>
      <Box x={608} y={520} w={700} h={360} at={12} title={<Head>svla_so101_pickplace 의 frame 하나</Head>}>
        <Rows
          at={12.3}
          head={['이름', '크기', '내용']}
          widths={[300, 130, 214]}
          monoCols={[0, 1]}
          size={20}
          rows={[
            ['images.up · images.side', '480×640×3', '사진 두 장'],
            ['observation.state', '6', 'follower 의 지금 값'],
            ['action', '6', 'leader 의 값 (목표)'],
            ['timestamp', '1', 'k ÷ fps 초'],
            ['task_index', '1', '작업 문장 번호'],
          ]}
          colors={[C.muted, C.blue, C.green, C.accent, C.muted]}
        />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 15) }}>관측 = 사진 + state · policy 가 맞힐 정답 = action</span>
      </Box>
      <Box x={1332} y={520} w={524} h={360} at={24} gap={10} title={<Head size={24}>action ↔ 몇 frame 뒤 state</Head>}>
        <span style={line(C.muted, 20)}>|action − state| 평균 · 좌우 회전 관절</span>
        <svg width={468} height={180}>
          {lag.map((v, i) => {
            const x = 14 + i * 66
            const h = v * 28
            const best = i === 4
            return (
              <g key={i} opacity={prog(t, 24.3 + i * 0.15)}>
                <rect x={x} y={150 - h} width={40} height={h} rx={4} fill={best ? C.green : `${C.muted}88`} />
                <text x={x + 20} y={150 - h - 8} textAnchor="middle" fill={best ? C.green : C.muted} fontSize={20} fontFamily={MONO} fontWeight={600}>
                  {v.toFixed(2)}
                </text>
                <text x={x + 20} y={174} textAnchor="middle" fill={best ? C.green : C.muted} fontSize={20} fontFamily={MONO}>
                  {i}
                </text>
              </g>
            )
          })}
        </svg>
        <span style={{ ...mono(C.green, 22), opacity: prog(t, 26) }}>4 frame × 33.3 ms ≈ 133 ms</span>
      </Box>
    </AbsoluteFill>
  )
}

function ClockSync({ t }: { t: number }) {
  const X = (ms: number) => 60 + ms * 6.6
  const joints = Array.from({ length: 14 }, (_, i) => i * 10)
  const cams: [number, string, number][] = [
    [0, '0', 0],
    [100 / 3, '33.3', 30],
    [200 / 3, '66.7', 70],
    [100, '100', 100],
    [400 / 3, '133.3', 130],
  ]
  return (
    <svg width={1060} height={485}>
      <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
        주기가 다른 센서 짝짓기
      </text>
      <text x={1030} y={44} textAnchor="end" fill={C.dim} fontSize={20}>
        예로 든 값 · 단위 ms
      </text>
      <text x={30} y={96} fill={C.purple} fontSize={22} fontWeight={600}>
        관절 값 · 100 Hz · 10 ms 마다
      </text>
      {joints.map((ms, i) => {
        const used = cams.some((c) => c[2] === ms)
        return (
          <g key={ms} opacity={prog(t, 13.2 + i * 0.05)}>
            <circle cx={X(ms)} cy={150} r={7} fill={used ? C.purple : `${C.dim}99`} />
            <text x={X(ms)} y={128} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {ms}
            </text>
          </g>
        )
      })}
      {cams.map(([ms, label, near], i) => (
        <g key={label}>
          <g opacity={prog(t, 13.8 + i * 0.1)}>
            <rect x={X(ms) - 9} y={281} width={18} height={18} rx={3} fill={C.accent} />
            <text x={X(ms)} y={328} textAnchor="middle" fill={C.accent} fontSize={20} fontFamily={MONO}>
              {label}
            </text>
          </g>
          <line x1={X(near)} y1={158} x2={X(ms)} y2={280} stroke={C.accent} strokeWidth={2.5} opacity={prog(t, 14.8 + i * 0.25)} />
        </g>
      ))}
      <text x={30} y={372} fill={C.accent} fontSize={22} fontWeight={600} opacity={prog(t, 13.8)}>
        카메라 사진 · 30 Hz · 33.3 ms 마다
      </text>
      <g opacity={prog(t, 16.5)}>
        <text x={30} y={422} fill={C.text} fontSize={22}>
          사진마다 가장 가까운 관절 값을 고르면 차이는 많아야 5 ms (10 ms 의 절반)
        </text>
        <text x={30} y={458} fill={C.muted} fontSize={21}>
          1초에 관절 값 100 개 중 사진과 짝지은 30 개만 frame 에 들어간다
        </text>
      </g>
    </svg>
  )
}

function Sync() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={230} at={0.3} gap={10} title={<Head>lerobot-record 의 한 frame · loop 한 바퀴</Head>}>
        <Flow steps={['1 관측 읽기', '2 action 만들기', '3 follower 에 보내기', '4 frame 저장', '5 1/30 초까지 기다리기']} color={C.accent} at={0.6} last="→ 다음 frame" />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 3.5) }}>기본값 30 fps · episode 60 초 · 정리 60 초 · episode 50 개 · 관측은 action 을 보내기 전에 읽는다</span>
        <span style={{ ...mono(C.orange, 22), opacity: prog(t, 7.3) }}>loop 한 번이 33.3 ms 안에 끝나야 30 fps · 예시 보고 29.88 Hz · 599 번 중 8 번 초과</span>
      </Box>
      <Card x={64} y={395} w={1060} h={485} at={13}>
        <ClockSync t={t} />
      </Card>
      <Box x={1148} y={395} w={708} h={485} at={20} color={`${C.red}77`} title={<Head color={C.red}>시각 어긋남 → 각도 오차 · 어깨 1초에 60°</Head>}>
        <Rows
          at={20.3}
          head={['시각 어긋남', '각도 오차', '손끝 오차 (30 cm)']}
          widths={[250, 160, 220]}
          monoCols={[1, 2]}
          size={22}
          rows={[
            ['3.3 ms · 짝짓기', '약 0.2°', '약 1 mm'],
            ['33.3 ms · frame 하나', '약 2°', '약 1 cm'],
            ['100 ms · 카메라 지연', '6°', '약 3.1 cm'],
          ]}
          colors={[C.green, C.orange, C.red]}
        />
        <svg width={652} height={150} style={{ opacity: prog(t, 21.5) }}>
          <line x1={40} y1={130} x2={600} y2={20} stroke={C.blue} strokeWidth={3} />
          <line x1={240} y1={90.7} x2={400} y2={90.7} stroke={C.muted} strokeWidth={2} strokeDasharray="6 5" />
          <line x1={400} y1={90.7} x2={400} y2={59.3} stroke={C.red} strokeWidth={4} />
          <circle cx={240} cy={90.7} r={7} fill={C.accent} />
          <circle cx={400} cy={59.3} r={7} fill={C.red} />
          <text x={414} y={84} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
            6°
          </text>
          <line x1={240} y1={112} x2={400} y2={112} stroke={C.muted} strokeWidth={2} />
          <line x1={240} y1={106} x2={240} y2={118} stroke={C.muted} strokeWidth={2} />
          <line x1={400} y1={106} x2={400} y2={118} stroke={C.muted} strokeWidth={2} />
          <text x={320} y={140} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
            100 ms
          </text>
          <text x={232} y={140} textAnchor="end" fill={C.accent} fontSize={20}>
            찍힌 시각
          </text>
          <text x={408} y={140} fill={C.red} fontSize={20}>
            도착 시각
          </text>
        </svg>
        <span style={{ ...line(C.text, 21), opacity: prog(t, 24.3) }}>0.06 × 100 = 6° → 사진 속 팔과 관절 값이 약 3 cm 어긋난 짝</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S3: LeRobotDataset ----------

function TableAndVideo({ t }: { t: number }) {
  const rows: [string, string][] = [
    ['0', '0.000'],
    ['1', '0.033'],
    ['2', '0.067'],
  ]
  return (
    <svg width={1792} height={395}>
      <g opacity={prog(t, 13.8)}>
        <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
          data/ · Parquet 표 · frame 마다 한 행
        </text>
        {['frame_index', 'timestamp', 'observation.state', 'action'].map((h, i) => (
          <text key={h} x={[30, 210, 370, 640][i]} y={92} fill={C.muted} fontSize={20} fontFamily={MONO}>
            {h}
          </text>
        ))}
        <line x1={30} y1={106} x2={860} y2={106} stroke={C.cardEdge} strokeWidth={2} />
      </g>
      {rows.map(([k, ts], i) => (
        <g key={k} opacity={prog(t, 14.4 + i * 0.4)}>
          <text x={30} y={140 + i * 40} fill={C.text} fontSize={22} fontFamily={MONO}>
            {k}
          </text>
          <text x={210} y={140 + i * 40} fill={C.accent} fontSize={22} fontFamily={MONO}>
            {ts}
          </text>
          <text x={370} y={140 + i * 40} fill={C.blue} fontSize={22}>
            값 6 개
          </text>
          <text x={640} y={140 + i * 40} fill={C.green} fontSize={22}>
            값 6 개
          </text>
        </g>
      ))}
      <text x={30} y={256} fill={C.muted} fontSize={22} fontFamily={MONO} opacity={prog(t, 15.6)}>
        …
      </text>
      <g opacity={prog(t, 18.3)}>
        <text x={30} y={300} fill={C.text} fontSize={22} fontFamily={MONO} fontWeight={600}>
          frame 11,939 개 → 표 전체 370 KB
        </text>
        <text x={30} y={336} fill={C.muted} fontSize={21}>
          열 단위로 저장해서 action 열처럼 필요한 열만 빠르게 꺼낸다
        </text>
        <text x={30} y={370} fill={C.muted} fontSize={21}>
          task 문장은 번호로 적고, 번호와 문장의 짝은 tasks 파일에 둔다
        </text>
      </g>
      <line x1={900} y1={30} x2={900} y2={370} stroke={C.cardEdge} strokeWidth={1.5} opacity={prog(t, 20.6)} />
      <g opacity={prog(t, 20.8)}>
        <text x={930} y={44} fill={C.text} fontSize={24} fontWeight={600}>
          videos/ · 카메라마다 MP4 영상
        </text>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={930 + i * 100} y={76} width={88} height={80} rx={6} fill={i % 2 === 0 ? `${C.accent}55` : C.grid} stroke={i % 2 === 0 ? C.accent : C.cardEdge} strokeWidth={1.5} />
        ))}
        <rect x={930} y={176} width={18} height={18} rx={3} fill={`${C.accent}55`} stroke={C.accent} />
        <text x={958} y={192} fill={C.text} fontSize={20}>
          keyframe 평균 6.2 KB
        </text>
        <rect x={1236} y={176} width={18} height={18} rx={3} fill={C.grid} stroke={C.cardEdge} />
        <text x={1264} y={192} fill={C.text} fontSize={20}>
          바뀐 부분만 적은 frame 평균 0.46 KB
        </text>
      </g>
      <g opacity={prog(t, 21.4)}>
        <text x={930} y={250} fill={C.text} fontSize={20} fontFamily={MONO}>
          사진 하나 480×640×3 = 921,600 byte ≈ 0.92 MB
        </text>
        <text x={930} y={286} fill={C.text} fontSize={20} fontFamily={MONO}>
          × 11,939 장 ≈ 11 GB (카메라 하나)
        </text>
      </g>
      <g opacity={prog(t, 24)}>
        <text x={930} y={332} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
          MP4 (AV1): up 40.1 MB · side 45.5 MB
        </text>
        <text x={930} y={370} fill={C.muted} fontSize={21}>
          압축하지 않은 크기의 약 270 분의 1 · 약 240 분의 1
        </text>
      </g>
    </svg>
  )
}

function Format() {
  const t = useSec()
  const tile = (big: string, label: string, at: number) => (
    <div style={{ padding: '12px 18px', borderRadius: 16, border: `1.5px solid ${C.accent}44`, background: `${C.accent}0d`, display: 'grid', gap: 4, opacity: prog(t, at) }}>
      <span style={{ fontFamily: MONO, fontSize: 40, fontWeight: 600, color: C.accent, whiteSpace: 'nowrap' }}>{big}</span>
      <span style={line(C.muted, 21)}>{label}</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={880} h={320} at={0.3} gap={10} title={<Head color={C.blue}>단위가 다르면 같은 숫자가 다른 자세</Head>}>
        <span style={{ ...mono(C.text, 28), opacity: prog(t, 0.8) }}>1.0 = 57.3° (radian) · 1° (degree)</span>
        <span style={{ ...mono(C.muted, 22), opacity: prog(t, 2) }}>1 radian = 360 ÷ (2 × 3.14) ≈ 57.3°</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 3.5) }}>SO-101 설정: 기본은 degree, 관절 범위를 −100 ~ 100 으로 옮겨 적는 방식도 있다 (집게는 0 ~ 100)</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 4.8) }}>svla_so101_pickplace 는 action 최솟값 · 최댓값이 정확히 −100 과 100 인 관절이 있어 뒤 방식으로 보인다</span>
      </Box>
      <Box x={976} y={140} w={880} h={320} at={7} title={<Head color={C.accent}>Open X-Embodiment · RLDS 한 형식으로 모음</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {tile('34 개', '연구실', 7.4)}
          {tile('60 개', 'robot dataset', 7.9)}
          {tile('22 종', '로봇', 8.4)}
          {tile('100 만 개 이상', 'trajectory', 8.9)}
        </div>
      </Box>
      <Card x={64} y={485} w={1792} h={395} at={13.5}>
        <TableAndVideo t={t} />
      </Card>
    </AbsoluteFill>
  )
}

function EpisodeIndex({ t }: { t: number }) {
  const X = (row: number) => 60 + row * 2.0875
  const seg = (y: number, from: number, to: number, color: string, label: string, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={X(from)} y={y} width={X(to) - X(from) - 4} height={50} rx={8} fill={`${color}26`} stroke={color} strokeWidth={2} />
      <text x={X(to) - 22} y={y + 33} textAnchor="end" fill={C.text} fontSize={22}>
        {label}
      </text>
    </g>
  )
  const mx = X(360)
  return (
    <svg width={1792} height={330}>
      <text x={30} y={40} fill={C.text} fontSize={24} fontWeight={600}>
        여러 episode 를 이어 붙인 파일 · svla_so101_pickplace 의 실제 값
      </text>
      <text x={60} y={82} fill={C.muted} fontSize={20} opacity={prog(t, 0.6)}>
        data/…/file-000.parquet · frame 마다 한 행
      </text>
      {seg(95, 0, 303, C.blue, 'episode 0 · 행 0 ~ 302', 0.8)}
      {seg(95, 303, 569, C.green, 'episode 1 · 행 303 ~ 568', 1.3)}
      {seg(95, 569, 800, C.muted, 'ep 2 · 569 ~', 1.8)}
      <text x={60} y={217} fill={C.muted} fontSize={20} opacity={prog(t, 2.2)}>
        videos/observation.images.up/…/file-000.mp4 · 30 fps
      </text>
      {seg(230, 0, 303, C.blue, '0 ~ 10.1 초', 2.4)}
      {seg(230, 303, 569, C.green, '10.1 ~ 18.97 초', 2.9)}
      {seg(230, 569, 800, C.muted, '18.97 초 ~', 3.4)}
      <g opacity={prog(t, 6.4)}>
        <line x1={mx} y1={88} x2={mx} y2={290} stroke={C.orange} strokeWidth={3} />
        <circle cx={mx} cy={120} r={8} fill={C.orange} />
        <circle cx={mx} cy={255} r={8} fill={C.orange} />
      </g>
      <text x={mx + 16} y={182} fill={C.orange} fontSize={21} fontFamily={MONO} fontWeight={600} opacity={prog(t, 7)}>
        행 303 + 57 = 360 (episode 1 의 frame 57)
      </text>
      <text x={mx + 16} y={316} fill={C.orange} fontSize={21} fontFamily={MONO} fontWeight={600} opacity={prog(t, 8.5)}>
        10.1 + 57 ÷ 30 = 12.0 초
      </text>
    </svg>
  )
}

function Meta() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={330} at={0.3}>
        <EpisodeIndex t={t} />
      </Card>
      <Box x={64} y={495} w={1060} h={385} at={12} title={<Head>meta/ 폴더 · svla_so101_pickplace 의 값</Head>}>
        <Rows
          at={12.3}
          head={['파일', '담는 정보', '이 dataset']}
          widths={[180, 420, 404]}
          monoCols={[0]}
          rows={[
            ['info.json', '버전 · fps · 값마다 이름 · 크기', 'v3.0 · 30 fps · episode 50 개'],
            ['stats.json', '최솟값 · 최댓값 · 평균 · 표준편차', 'action · state 는 관절마다'],
            ['tasks', 'task 문장 ↔ 번호', '작업 1 가지'],
            ['episodes', '길이 · 시작 · 끝 행 · 영상 시각', '길이 183 ~ 306 frame'],
          ]}
          colors={[C.accent, C.orange, C.text, C.green]}
        />
        <span style={{ ...line(C.text, 21), opacity: prog(t, 18.4) }}>MIN_MAX: 최솟값 · 최댓값으로 −1 ~ 1 · MEAN_STD: 평균을 빼고 표준편차로 나눔</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 20) }}>LeRobot 기본: ACT 는 MEAN_STD · Diffusion Policy 는 state · action 에 MIN_MAX</span>
      </Box>
      <Box x={1148} y={495} w={708} h={385} at={24} gap={10} color={`${C.red}77`} title={<Head color={C.red}>episode 경계와 action 묶음</Head>}>
        <svg width={652} height={110}>
          <rect x={0} y={50} width={466} height={34} rx={6} fill={`${C.green}33`} stroke={C.green} strokeWidth={2} />
          <text x={16} y={74} fill={C.text} fontSize={20}>
            episode
          </text>
          <rect x={478} y={50} width={174} height={34} rx={6} fill={C.grid} stroke={C.cardEdge} strokeWidth={2} />
          <text x={574} y={74} fill={C.muted} fontSize={20}>
            다음
          </text>
          <g opacity={prog(t, 24.6)}>
            <line x1={330} y1={34} x2={560} y2={34} stroke={C.accent} strokeWidth={3} />
            <line x1={330} y1={28} x2={330} y2={44} stroke={C.accent} strokeWidth={3} />
            <line x1={560} y1={28} x2={560} y2={44} stroke={C.accent} strokeWidth={3} />
            <text x={330} y={20} fill={C.accent} fontSize={20} fontFamily={MONO}>
              action k ~ k+99
            </text>
            <text x={330} y={106} fill={C.accent} fontSize={20} fontFamily={MONO}>
              frame k
            </text>
          </g>
          <g opacity={prog(t, 25.6)}>
            <rect x={470} y={46} width={90} height={42} rx={6} fill={`${C.red}22`} stroke={C.red} strokeWidth={2.5} strokeDasharray="6 4" />
            <text x={470} y={106} fill={C.red} fontSize={20} fontFamily={MONO}>
              action_is_pad
            </text>
          </g>
        </svg>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 24.8) }}>frame k 의 관측 → action k ~ k+99 가 정답</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 25.8) }}>끝에서 모자란 자리: 마지막 행 반복 + action_is_pad</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 26.6) }}>→ 표시한 자리는 loss 에서 빠진다</span>
        <span style={{ ...line(C.red, 21), opacity: prog(t, 27.4) }}>경계를 잘못 적으면 다음 episode 의 action 이 정답에 섞인다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S4: quality and quantity ----------

function HesitationStrip({ t }: { t: number }) {
  const markX = (cm: number) => 30 + cm * 1000
  return (
    <svg width={1792} height={440}>
      <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.4)}>
        behavior cloning (MSE) → 같은 장면 action 의 평균 · 무게는 frame 수
      </text>
      <text x={1762} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.4)}>
        예로 든 값 · 블록 바로 위 장면
      </text>
      <g opacity={prog(t, 7.2)}>
        {['시연 종류', '시연 수', 'frame 수', 'action: frame 마다 내림'].map((h, i) => (
          <text key={h} x={[30, 230, 380, 600][i]} y={92} fill={C.muted} fontSize={20}>
            {h}
          </text>
        ))}
        <text x={30} y={134} fill={C.green} fontSize={22}>
          바로 내림
        </text>
        <text x={230} y={134} fill={C.green} fontSize={22} fontFamily={MONO}>
          7
        </text>
        <text x={380} y={134} fill={C.green} fontSize={22} fontFamily={MONO}>
          7 × 2 = 14
        </text>
        <text x={600} y={134} fill={C.green} fontSize={22} fontFamily={MONO}>
          1 cm
        </text>
      </g>
      <g opacity={prog(t, 8)}>
        <text x={30} y={174} fill={C.orange} fontSize={22}>
          1초 멈춤
        </text>
        <text x={230} y={174} fill={C.orange} fontSize={22} fontFamily={MONO}>
          3
        </text>
        <text x={380} y={174} fill={C.orange} fontSize={22} fontFamily={MONO}>
          3 × 30 = 90
        </text>
        <text x={600} y={174} fill={C.orange} fontSize={22} fontFamily={MONO}>
          0 cm
        </text>
      </g>
      <g opacity={prog(t, 9.6)}>
        <text x={1000} y={134} fill={C.text} fontSize={26}>
          시연 수로는 3 / 10 이지만
        </text>
        <text x={1000} y={174} fill={C.orange} fontSize={26} fontWeight={600}>
          frame 수로는 90 / 104
        </text>
      </g>
      {Array.from({ length: 104 }, (_, i) => (
        <rect key={i} x={30 + i * 16} y={220} width={13} height={50} rx={2} fill={i < 14 ? C.green : `${C.orange}66`} opacity={prog(t, 8.4 + i * 0.012, 0.3)} />
      ))}
      <g opacity={prog(t, 9.8)}>
        <text x={30} y={302} fill={C.green} fontSize={20} fontFamily={MONO}>
          14 frame · 1 cm
        </text>
        <text x={254} y={302} fill={C.orange} fontSize={20} fontFamily={MONO}>
          90 frame · 0 cm
        </text>
      </g>
      <g opacity={prog(t, 10.5)}>
        <line x1={30} y1={372} x2={1030} y2={372} stroke={C.muted} strokeWidth={2} />
        <line x1={30} y1={364} x2={30} y2={380} stroke={C.muted} strokeWidth={2} />
        <line x1={1030} y1={364} x2={1030} y2={380} stroke={C.muted} strokeWidth={2} />
        <text x={30} y={408} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
          0 cm
        </text>
        <text x={1030} y={408} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
          1 cm
        </text>
        <circle cx={markX(0.13)} cy={372} r={9} fill={C.red} />
        <text x={markX(0.13)} y={346} textAnchor="middle" fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
          평균 ≈ 0.13 cm
        </text>
        <text x={1100} y={362} fill={C.red} fontSize={24} fontFamily={MONO} fontWeight={600}>
          (14 × 1 + 90 × 0) ÷ 104 ≈ 0.13 cm
        </text>
      </g>
      <g opacity={prog(t, 23)}>
        <circle cx={markX(0.61)} cy={372} r={9} fill={C.green} />
        <text x={markX(0.61)} y={346} textAnchor="middle" fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
          정지 3 frame → ≈ 0.61 cm
        </text>
        <text x={1100} y={406} fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
          14 ÷ (14 + 3 × 3) ≈ 0.61 cm
        </text>
      </g>
    </svg>
  )
}

function Hesitation() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={440} at={0.3}>
        <HesitationStrip t={t} />
      </Card>
      <Box x={64} y={605} w={1060} h={275} at={14} title={<Head>svla_so101_pickplace 의 멈춘 frame</Head>}>
        <Bar label="처음과 끝 정지" value={21} max={100} color={C.orange} at={14.4} width={360} labelW={200} fmt="2,556 / 11,939 = 21%" />
        <span style={{ ...line(C.text, 22), opacity: prog(t, 16) }}>처음 정지 구간 평균 26 frame (약 0.9 초) · 끝 구간 평균 25 frame</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 17.5) }}>ACT 저자들: action 여러 개를 묶어 내는 action chunking 이 이 문제를 덜어 준다</span>
      </Box>
      <Box x={1148} y={605} w={708} h={275} at={21} color={`${C.green}77`} title={<Head color={C.green}>그래서 시연은</Head>}>
        {['망설임 없이 일정한 빠르기로', '시작 전 · 끝난 뒤 정지 구간은 짧게', '이미 모은 시연은 멈춘 구간을 잘라 낸다'].map((s, i) => (
          <div key={s} style={{ display: 'flex', gap: 14, alignItems: 'baseline', opacity: prog(t, 21.3 + i * 0.6) }}>
            <span style={{ color: C.green, fontSize: 24, fontWeight: 700 }}>✓</span>
            <span style={line(C.text, 23)}>{s}</span>
          </div>
        ))}
      </Box>
    </AbsoluteFill>
  )
}

function Quality() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={560} h={380} at={0.3} color={`${C.red}77`} title={<Head size={24} color={C.red}>실패한 시연 섞기 · 집게를 닫은 높이</Head>}>
        <div style={{ display: 'grid', gap: 10 }}>
          <Bar label="성공 45 개" value={2} max={6} color={C.green} at={0.8} width={150} labelW={200} unit=" cm" />
          <Bar label="실패 5 개" value={6} max={6} color={C.red} at={1.4} width={150} labelW={200} unit=" cm" />
          <Bar label="섞어 배운 policy" value={2.4} max={6} color={C.orange} at={3} width={150} labelW={200} unit=" cm" />
        </div>
        <span style={{ ...mono(C.orange, 22), opacity: prog(t, 3.6) }}>(45 × 2 + 5 × 6) ÷ 50 = 2.4 cm</span>
        <span style={{ ...mono(C.muted, 20), opacity: prog(t, 4.6) }}>실패 10 개 → (40 × 2 + 10 × 6) ÷ 50 = 2.8 cm</span>
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 5.4) }}>→ 실패한 episode 는 바로 지우고 다시 찍는다</span>
      </Box>
      <Box x={656} y={140} w={560} h={380} at={6.5} color={`${C.purple}77`} title={<Head size={24} color={C.purple}>방식 섞기 · 손목 각도</Head>}>
        <svg width={504} height={190}>
          <line x1={20} y1={175} x2={484} y2={175} stroke={C.cardEdge} strokeWidth={3} />
          <rect x={217} y={125} width={70} height={50} rx={6} fill={`${C.orange}33`} stroke={C.orange} strokeWidth={2} />
          <g opacity={prog(t, 6.9)}>
            {arrow(252, 20, 252, 115, C.green, 4)}
            <text x={270} y={50} fill={C.green} fontSize={20} fontWeight={600}>
              위에서 · 손목 0°
            </text>
          </g>
          <g opacity={prog(t, 7.6)}>
            {arrow(40, 150, 205, 150, C.blue, 4)}
            <text x={40} y={132} fill={C.blue} fontSize={20} fontWeight={600}>
              옆에서 · 손목 90°
            </text>
          </g>
          <g opacity={prog(t, 9)}>
            <line x1={90} y1={30} x2={210} y2={115} stroke={C.red} strokeWidth={4} strokeDasharray="9 7" />
            <text x={310} y={104} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              평균 45°
            </text>
          </g>
        </svg>
        <span style={{ ...line(C.red, 21), opacity: prog(t, 9.6) }}>평균 45° 로 다가가 어느 쪽으로도 못 잡는다</span>
        <span style={{ ...line(C.muted, 20), opacity: prog(t, 10.6) }}>시연 수를 늘려도 평균은 45° 그대로</span>
      </Box>
      <Box x={1248} y={140} w={608} h={380} at={12.5} gap={10} title={<Head size={24}>robomimic · Square · BC 성공률</Head>}>
        <span style={line(C.muted, 20)}>RoboTurk 로 모은 시연 · 사진 대신 물체 위치를 숫자로</span>
        <Bar label="숙련자 한 명" value={78.7} max={100} color={C.green} at={12.9} width={100} labelW={210} unit="%" sub="200 개" />
        <Bar label="숙련도 다른 6 명" value={52.7} max={100} color={C.orange} at={13.6} width={100} labelW={210} unit="%" sub="300 개" />
        <Bar label="Better · 숙련 2 명" value={58.7} max={100} color={C.blue} at={19.3} width={100} labelW={210} unit="%" sub="100 개" />
        <Bar label="Worse · 서툰 2 명" value={22} max={100} color={C.red} at={19.9} width={100} labelW={210} unit="%" fmt="22.0" sub="100 개" />
        <Bar label="Better + Worse" value={46.7} max={100} color={C.purple} at={20.6} width={100} labelW={210} unit="%" sub="200 개" />
      </Box>
      <Card x={64} y={545} w={1792} h={335} at={25.5}>
        <div style={{ position: 'absolute', left: 24, top: 22, display: 'grid', gap: 10 }}>
          <div style={{ opacity: prog(t, 25.7) }}>
            <Head size={24}>학습한 policy 를 블록 자리마다 10 번씩 실행 · 예로 든 값</Head>
          </div>
          <Bar label="A (왼쪽 앞)" value={90} max={100} color={C.green} at={26} width={420} labelW={220} unit="%" />
          <Bar label="B (오른쪽 앞)" value={80} max={100} color={C.green} at={26.3} width={420} labelW={220} unit="%" />
          <Bar label="C (가운데)" value={100} max={100} color={C.green} at={26.6} width={420} labelW={220} unit="%" />
          <Bar label="D (왼쪽 뒤)" value={70} max={100} color={C.orange} at={26.9} width={420} labelW={220} unit="%" />
          <Bar label="E (오른쪽 뒤)" value={30} max={100} color={C.red} at={27.2} width={420} labelW={220} unit="%" />
        </div>
        <div style={{ position: 'absolute', left: 860, top: 70, width: 900, display: 'grid', gap: 18 }}>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 28) }}>전체 (9 + 8 + 10 + 7 + 3) ÷ 50 = 74%</span>
          <span style={{ ...line(C.red, 23), opacity: prog(t, 28.8) }}>E 만 30% → 고루 더하지 말고 E 에 시연을 10 개쯤 더 모아 다시 학습</span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 29.6) }}>출발점: 물체 자리마다 10 개씩 50 개 이상 (LeRobot 안내)</span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 30.3) }}>조건을 늘리면 조합이 곱셈으로 는다: 위치 5 × 색 2 × 조명 2 = 20 가지</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- pauses, answer, outro ----------

const PauseKeyboard = () => (
  <PauseWrite
    question="키보드 조종에서 frame 마다 손끝을 4 mm 씩 옮기고 frame 은 1초에 30 번 온다. 키를 3 초 동안 누르면 손끝은 몇 mm 움직일까?"
    answer={
      <>
        4 × 30 × 3 = 360 mm (36 cm)
        <br />
        1초에 frame 30 개 × 3 초 = frame 90 개 동안 4 mm 씩
      </>
    }
  />
)

const PauseFps = () => (
  <PauseWrite
    question="20 fps 로 기록한 8 초짜리 episode 는 frame 이 몇 개이고, frame 30 의 timestamp 는 몇 초일까?"
    answer={
      <>
        frame 수 = 8 × 20 = 160 개
        <br />
        frame 30 의 timestamp = 30 ÷ 20 = 1.5 초 (t = k ÷ fps)
      </>
    }
  />
)

const PauseIndex = () => (
  <PauseWrite
    question="episode 0 이 240 frame, episode 1 이 250 frame 이고 30 fps 다. episode 1 의 frame 10 은 표의 몇 번 행이고, 영상의 몇 초에 있을까?"
    answer={
      <>
        episode 1 은 행 240 부터 → 240 + 10 = 250 번 행
        <br />
        영상은 240 ÷ 30 = 8.0 초부터 → 8.0 + 10 ÷ 30 ≈ 8.33 초
      </>
    }
  />
)

const PausePause = () => (
  <PauseWrite
    question="같은 장면에서 시연 8 개는 frame 2 개 동안 1 cm 씩 내렸고, 시연 2 개는 frame 12 개 동안 멈췄다. policy 가 배우는 평균은?"
    answer={
      <>
        내림 8 × 2 = 16 frame · 멈춤 2 × 12 = 24 frame
        <br />
        16 × 1 ÷ (16 + 24) = 16 ÷ 40 = 0.4 cm
      </>
    }
  />
)

function Answer() {
  const items = [
    { tag: '입력 장치', color: C.accent, text: 'leader 팔은 관절 각도를 그대로 · VR · spacemouse · 키보드는 IK · action 은 leader 의 값', at: 0.5 },
    { tag: 'frame 과 시각 맞추기', color: C.blue, text: 'timestamp = k ÷ fps · state 는 action 을 약 133 ms 늦게 따라감 · 가까운 시각끼리 짝짓기', at: 4.4 },
    { tag: 'LeRobotDataset 형식', color: C.orange, text: 'Parquet 표 + MP4 영상에 episode 를 이어 붙이고 · meta 에 형식 · stats · 경계', at: 8.4 },
    { tag: '시연의 품질과 수', color: C.red, text: '평균은 frame 수로 매겨진다 · 0.13 cm · 2.4 cm · 45° · 일관된 시연이 수보다 중요', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            시연을 모을 때 무엇을 어떻게 기록해야 학습에 쓸 수 있는 dataset 이 될까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 31, fontWeight: 600 }}>{it.text}</span>
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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>DAgger · ACT · Real Robot</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={32}>
            시연 밖 상태에서 정답 다시 묻기 · action 묶음으로 배우기 · 실물 팔에서 실행하고 평가하기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/teleop-dataset (RoboTurk · ALOHA · robomimic · Open X-Embodiment · LeRobot 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

export function TeleopDataset() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        devices: Devices,
        leader: Leader,
        'pause-keyboard': PauseKeyboard,
        frames: Frames,
        sync: Sync,
        'pause-fps': PauseFps,
        format: Format,
        meta: Meta,
        'pause-index': PauseIndex,
        hesitation: Hesitation,
        quality: Quality,
        'pause-pause': PausePause,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
