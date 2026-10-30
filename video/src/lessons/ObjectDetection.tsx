import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './object-detection.narration.json'
import { script } from './object-detection.script'

// Numbers follow lessons/object-detection/README.md (see object-detection.script.ts). The desk, cup, anchor, tracking and
// ring drawings are schematic (marked 모식도); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
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

const line = (color = C.text, size = 24): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** a simple text table: first column sans, the rest mono */
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): React.CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
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

/** a cup seen from the front: body and handle */
function Cup({ x, y, w, h, color = C.muted }: { x: number; y: number; w: number; h: number; color?: string }) {
  return (
    <g>
      <path d={`M${x + w - 4},${y + h * 0.25} q${w * 0.32},0 ${w * 0.32},${h * 0.25} q0,${h * 0.25} ${-w * 0.32},${h * 0.25}`} fill="none" stroke={color} strokeWidth={6} />
      <rect x={x} y={y} width={w} height={h} rx={10} fill={`${color}55`} stroke={color} strokeWidth={2} />
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
            VISION · OBJECT DETECTION
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Object Detection</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            물체마다 <span style={{ color: C.accent }}>bounding box · class · 점수</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            카메라 사진 한 장에서, 개수를 모르는 물체를 하나씩 둘러싸서 찾는 일
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
      <Panel x={64} y={140} w={1792} h={320}>
        <svg width={600} height={320} style={{ position: 'absolute', left: 20, top: 0 }}>
          <g opacity={prog(t, 0.4)}>
            <rect x={20} y={30} width={540} height={260} rx={12} fill={C.bg} stroke={C.cardEdge} strokeWidth={2} />
            <line x1={20} y1={230} x2={560} y2={230} stroke={C.cardEdge} strokeWidth={2} />
            <rect x={90} y={120} width={150} height={110} rx={6} fill={`${C.red}66`} stroke={C.red} strokeWidth={2} />
            <Cup x={340} y={150} w={70} h={80} />
            <text x={36} y={64} fill={C.dim} fontSize={20}>
              카메라 사진 · 모식도
            </text>
          </g>
          <g opacity={prog(t, 4.6)}>
            <rect x={80} y={110} width={170} height={130} fill="none" stroke={C.accent} strokeWidth={3} strokeDasharray="10 6" />
            <rect x={330} y={140} width={112} height={100} fill="none" stroke={C.green} strokeWidth={3} strokeDasharray="10 6" />
            <text x={80} y={100} fill={C.accent} fontSize={22} fontWeight={600}>
              상자
            </text>
            <text x={330} y={130} fill={C.green} fontSize={22} fontWeight={600}>
              컵
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 680, top: 40, width: 1070, display: 'grid', gap: 22 }}>
          <div style={{ display: 'grid', gap: 6, opacity: prog(t, 0.9) }}>
            <Head color={C.muted} size={24}>
              image classifier (예: ResNet)
            </Head>
            <span style={line(C.text, 26)}>
              사진 한 장에 이름 하나 <span style={mono(C.red, 26)}>"상자"</span> → 어느 자리에 있는지, 컵과 함께 있으면 각각 어디인지 모른다
            </span>
          </div>
          <div style={{ display: 'grid', gap: 6, opacity: prog(t, 4.6) }}>
            <Head color={C.accent} size={24}>
              detector
            </Head>
            <span style={line(C.text, 26)}>물체마다 둘러싼 직사각형(bounding box) · 종류(class) · 맞을 가능성(점수)</span>
          </div>
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 500, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          개수를 모르는 box 를 어떻게 내고, <span style={{ color: C.accent }}>로봇 팔이 갈 3D 좌표는 어떻게 얻을까?</span>
        </div>
      </Appear>
      <Card x={260} y={660} w={1400} h={200} at={5.4}>
        <div style={{ padding: '26px 34px', display: 'grid', gap: 14, opacity: prog(t, 5.6) }}>
          <span style={line(C.text, 26)}>사진 속 물체는 하나일 수도 있고 열 개일 수도 있지만, network 의 출력 크기는 정해져 있어야 한다</span>
          <span style={line(C.muted, 24)}>box 는 사진 속 pixel 위치일 뿐이라, 팔을 보내려면 robot frame 의 3D 좌표로 바꿔야 한다</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- IoU and YOLO ----------

function Outputs() {
  const t = useSec()
  // plot: unit u → px 60 + (u - 80) × 3, y the same
  const px = (u: number) => 60 + (u - 80) * 3
  const py = (v: number) => 90 + (v - 80) * 3
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <svg width={860} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 6.6)}>
            IoU = 겹친 넓이 ÷ 합친 넓이
          </text>
          <g opacity={prog(t, 13.2)}>
            <rect x={px(100)} y={py(100)} width={300} height={300} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={3} />
            <rect x={px(150)} y={py(120)} width={300} height={300} fill={`${C.orange}22`} stroke={C.orange} strokeWidth={3} />
            <text x={px(100) + 14} y={py(100) + 34} fill={C.blue} fontSize={26} fontWeight={700}>
              A
            </text>
            <text x={px(250) - 14} y={py(220) - 16} textAnchor="end" fill={C.orange} fontSize={26} fontWeight={700}>
              B
            </text>
            <text x={px(100)} y={py(100) - 12} fill={C.blue} fontSize={22} fontFamily={MONO}>
              (100, 100)
            </text>
            <text x={px(250)} y={py(220) + 32} textAnchor="end" fill={C.orange} fontSize={22} fontFamily={MONO}>
              (250, 220)
            </text>
          </g>
          <g opacity={prog(t, 14.5)}>
            <rect x={px(150)} y={py(120)} width={150} height={240} fill={`${C.green}44`} stroke={C.green} strokeWidth={3} />
            <text x={px(175)} y={py(160)} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
              겹친 넓이
            </text>
            <text x={px(175)} y={py(160) + 34} textAnchor="middle" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              50 × 80
            </text>
            <text x={px(175)} y={py(160) + 66} textAnchor="middle" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              = 4,000
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 590, display: 'grid', gap: 10, opacity: prog(t, 19.2) }}>
          <span style={mono(C.text, 25)}>합친 넓이 = 10,000 + 10,000 − 4,000 = 16,000</span>
          <span style={{ ...mono(C.accent, 30), opacity: prog(t, 21.5) }}>IoU = 4,000 ÷ 16,000 = 0.25</span>
        </div>
      </Panel>
      <Box x={956} y={140} w={900} h={330} at={0.3} title={<Head color={C.accent}>detector 가 물체 하나마다 내는 것</Head>}>
        <Table
          at={0.6}
          head={['출력', '뜻', '예']}
          widths={[190, 330, 320]}
          rows={[
            ['bounding box', '두 꼭짓점의 pixel 좌표', '(200, 220)–(240, 260)'],
            ['class', '물체의 종류', 'cup'],
            ['점수', '그 class 일 가능성 (0 ~ 1)', '0.91'],
          ]}
          colors={[C.text, C.text, C.text]}
          size={23}
        />
      </Box>
      <Box x={956} y={500} w={900} h={380} at={6.5} title={<Head color={C.green}>IoU (Intersection over Union)</Head>}>
        <span style={line(C.text, 25)}>두 box 가 겹친 넓이를, 둘 중 하나라도 덮은 넓이로 나눈다</span>
        <span style={{ ...line(C.text, 25), opacity: prog(t, 9.5) }}>
          완전히 같으면 <span style={mono(C.green, 26)}>1</span> · 겹치지 않으면 <span style={mono(C.red, 26)}>0</span>
        </span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 11) }}>box 가 물체를 잘 둘렀는지를 정답 box 와 겹친 정도로 잰다</span>
        <span style={{ ...line(C.muted, 23), opacity: prog(t, 19.5) }}>
          두 box 의 넓이는 각각 <span style={mono(C.text, 24)}>100 × 100 = 10,000</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

/** the 9 anchors of one position: areas 128², 256², 512² × ratios 1:1, 1:2, 2:1, drawn at one scale */
function Anchors({ t, at }: { t: number; at: number }) {
  const s = 0.32
  const cx = 300
  const cy = 132
  const colors = [C.blue, C.green, C.orange]
  return (
    <svg width={500} height={270}>
      <text x={0} y={30} fill={C.text} fontSize={22} fontWeight={600} opacity={prog(t, at)}>
        anchor 9 개
      </text>
      <text x={0} y={60} fill={C.dim} fontSize={20} opacity={prog(t, at)}>
        모식도
      </text>
      {[128, 256, 512].map((a, i) =>
        [
          [1, 1],
          [1 / Math.SQRT2, Math.SQRT2],
          [Math.SQRT2, 1 / Math.SQRT2],
        ].map(([rw, rh], j) => {
          const w = a * s * rw
          const h = a * s * rh
          return <rect key={`${i}-${j}`} x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="none" stroke={colors[i]} strokeWidth={2.5} opacity={prog(t, at + 0.3 + i * 0.4 + j * 0.12) * 0.9} />
        }),
      )}
      <circle cx={cx} cy={cy} r={5} fill={C.text} opacity={prog(t, at + 0.2)} />
    </svg>
  )
}

function Stages() {
  const t = useSec()
  const cell = 40
  const gx = 30
  const gy = 66
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={300}>
        <div style={{ position: 'absolute', left: 32, top: 24, width: 1180, display: 'grid', gap: 18 }}>
          <div style={{ opacity: prog(t, 0.3) }}>
            <Head color={C.blue}>two-stage · Faster R-CNN (Ren 등, 2015)</Head>
          </div>
          <Flow steps={['사진', 'backbone (VGG-16)', 'region proposal network', '영역마다 분류 · box 다듬기']} color={C.blue} at={0.8} />
          <span style={{ ...line(C.text, 24), opacity: prog(t, 6.2) }}>첫 module 은 feature map 의 위치마다 anchor 9 개를 기준으로 물체가 있을 만한 영역을 낸다</span>
          <span style={{ ...line(C.muted, 24), opacity: prog(t, 8) }}>
            anchor 9 개 = 넓이 <span style={mono(C.text, 24)}>128², 256², 512²</span> × 가로세로 비 <span style={mono(C.text, 24)}>1:1, 1:2, 2:1</span>
          </span>
        </div>
        <div style={{ position: 'absolute', left: 1260, top: 16 }}>
          <Anchors t={t} at={6.2} />
        </div>
      </Panel>
      <Card x={64} y={470} w={860} h={410} at={12}>
        <svg width={860} height={410}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600}>
            one-stage · YOLO (Redmon 등, 2016)
          </text>
          {Array.from({ length: 49 }, (_, k) => {
            const i = k % 7
            const j = Math.floor(k / 7)
            const on = i === 3 && j === 3
            return <rect key={k} x={gx + i * cell} y={gy + j * cell} width={cell} height={cell} fill={on ? `${C.orange}44` : 'none'} stroke={on ? C.orange : C.cardEdge} strokeWidth={on ? 3 : 1.5} opacity={on ? prog(t, 13.5) : 1} />
          })}
          <g opacity={prog(t, 13.5)}>
            <rect x={gx + 2.2 * cell} y={gy + 2.4 * cell} width={2.6 * cell} height={2.2 * cell} fill="none" stroke={C.green} strokeWidth={3} />
            <circle cx={gx + 3.5 * cell} cy={gy + 3.5 * cell} r={6} fill={C.green} />
          </g>
          <text x={gx} y={gy + 7 * cell + 34} fill={C.muted} fontSize={21} opacity={prog(t, 13.5)}>
            가운데가 든 칸이 그 물체를 맡는다
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 390, top: 76, width: 440, display: 'grid', gap: 12 }}>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 12.5) }}>
            grid <span style={mono(C.orange, 24)}>S = 7</span> → 7 × 7 칸
          </span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 18.2) }}>
            칸마다 box <span style={mono(C.orange, 24)}>B = 2</span> 개
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 18.8) }}>box 마다 x, y, w, h, confidence = 5 개</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 19.4) }}>
            칸마다 class 확률 <span style={mono(C.orange, 24)}>C = 20</span> 개
          </span>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 20.6) }}>B × 5 + C = 2 × 5 + 20 = 30</span>
          <span style={{ ...mono(C.accent, 28), opacity: prog(t, 21.6) }}>출력 7 × 7 × 30</span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 22.4) }}>출력 크기가 정해져 개수 문제가 사라진다</span>
        </div>
      </Card>
      <Box x={956} y={470} w={900} h={410} at={24} title={<Head color={C.accent}>PASCAL VOC 2007 (class 20 개)</Head>}>
        <Table
          at={24.3}
          head={['', 'Faster R-CNN', 'YOLO']}
          widths={[260, 290, 290]}
          rows={[
            ['방식', '영역 후보 → 분류', 'grid 한 번에'],
            ['mAP', '73.2%', '63.4%'],
            ['1초에 처리한 사진', '5 장 (K40)', '45 장 (Titan X)'],
          ]}
          colors={[C.text, C.text, C.text]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 26) }}>서로 다른 GPU 에서 잰 속도라 그대로 견주지 않는다</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 27) }}>
          mAP 는 <span style={mono(C.orange, 24)}>73.2 − 63.4 = 9.8</span> 점 낮지만, 한 번에 내는 쪽이 몇 배 빠르다
        </span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- NMS and score threshold ----------

function Nms() {
  const t = useSec()
  const cut = prog(t, 18.3)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <svg width={860} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            컵 하나 근처에 나온 box 셋
          </text>
          <text x={830} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          <g opacity={prog(t, 0.5)}>
            <Cup x={300} y={220} w={180} h={210} />
          </g>
          <g opacity={prog(t, 1.2)}>
            <rect x={250} y={190} width={280} height={260} fill="none" stroke={C.green} strokeWidth={4} />
            <text x={236} y={222} textAnchor="end" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              ① 0.9
            </text>
          </g>
          <g opacity={prog(t, 1.8) * (1 - 0.65 * cut)}>
            <rect x={285} y={160} width={280} height={265} fill="none" stroke={cut > 0.5 ? C.red : C.blue} strokeWidth={4} strokeDasharray={cut > 0.5 ? '12 8' : undefined} />
            <text x={425} y={146} textAnchor="middle" fill={cut > 0.5 ? C.red : C.blue} fontSize={24} fontFamily={MONO} fontWeight={600}>
              ② 0.8
            </text>
          </g>
          <g opacity={prog(t, 2.4)}>
            <rect x={440} y={250} width={290} height={250} fill="none" stroke={C.orange} strokeWidth={4} />
            <text x={730} y={534} textAnchor="end" fill={C.orange} fontSize={24} fontFamily={MONO} fontWeight={600}>
              ③ 0.6
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 580, display: 'grid', gap: 10 }}>
          <span style={{ ...line(C.green, 24), opacity: prog(t, 18.6) }}>① 0.9 · 가장 높아서 남김</span>
          <span style={{ ...line(C.red, 24), opacity: prog(t, 19.4) }}>② 0.8 · IoU 0.75 &gt; 0.7 이라 지움</span>
          <span style={{ ...line(C.orange, 24), opacity: prog(t, 20.2) }}>③ 0.6 · IoU 0.3 &lt; 0.7 이라 남김</span>
        </div>
      </Panel>
      <Box x={956} y={140} w={900} h={300} at={6} title={<Head color={C.accent}>NMS (non-maximum suppression)</Head>}>
        <span style={line(C.text, 25)}>1. 점수가 가장 높은 box 를 남긴다</span>
        <span style={{ ...line(C.text, 25), opacity: prog(t, 7.5) }}>2. 그 box 와 IoU 가 기준보다 큰 box 를 지운다</span>
        <span style={{ ...line(C.text, 25), opacity: prog(t, 9) }}>3. 남은 box 로 1 ~ 2 를 되풀이한다</span>
      </Box>
      <Box x={956} y={470} w={900} h={410} at={12} title={<Head color={C.orange}>Ultralytics 의 기본 NMS 기준 0.7</Head>}>
        <Table
          at={12.3}
          head={['box', '점수', '0.9 box 와의 IoU', '결과']}
          widths={[100, 120, 280, 340]}
          rows={[
            ['①', '0.9', '', <span style={{ opacity: prog(t, 18.6) }}>가장 높아서 남김</span>],
            ['②', '0.8', '0.75', <span style={{ opacity: prog(t, 19.4), color: C.red }}>0.7 보다 커서 지움</span>],
            ['③', '0.6', '0.3', <span style={{ opacity: prog(t, 20.2), color: C.green }}>0.7 보다 작아서 남김</span>],
          ]}
        />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 24.2) }}>③ 이 옆의 다른 컵이면 맞게 남긴 것이고, 같은 컵을 크게 어긋나게 잡았으면 지웠어야 할 중복이다</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 26) }}>NMS 는 IoU 만 보므로 두 경우를 구별하지 못한다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Thresholds() {
  const t = useSec()
  const row = (y: number, at: number, ok: boolean, text: ReactNode) => (
    <div style={{ position: 'absolute', left: 30, top: y, display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
      <span style={{ color: ok ? C.green : C.red, fontSize: 30, fontWeight: 700 }}>{ok ? '✓' : '✕'}</span>
      <span style={line(C.text, 25)}>{text}</span>
    </div>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <div style={{ position: 'absolute', left: 30, top: 24, width: 800, display: 'grid', gap: 10 }}>
          <Head color={C.accent}>NMS 기준을 바꾸면</Head>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 0.6) }}>
            낮추면 <span style={{ color: C.green }}>중복이 줄지만</span> <span style={{ color: C.red }}>붙은 물체 하나를 지운다</span>
          </span>
          <span style={{ ...line(C.text, 24), opacity: prog(t, 3.2) }}>
            높이면 <span style={{ color: C.green }}>붙은 물체를 지키지만</span> <span style={{ color: C.red }}>중복이 남는다</span>
          </span>
        </div>
        <svg width={860} height={740} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g opacity={prog(t, 6.6)}>
            <text x={30} y={238} fill={C.text} fontSize={23} fontWeight={600}>
              나란히 붙은 두 컵 · box 의 IoU 0.5
            </text>
            <text x={830} y={238} textAnchor="end" fill={C.dim} fontSize={20}>
              모식도
            </text>
            <Cup x={235} y={300} w={130} h={150} />
            <Cup x={385} y={300} w={130} h={150} />
            <rect x={220} y={280} width={240} height={190} fill="none" stroke={C.blue} strokeWidth={4} />
            <rect x={300} y={286} width={240} height={190} fill="none" stroke={C.orange} strokeWidth={4} strokeDasharray="12 7" />
          </g>
        </svg>
        {row(520, 8.5, true, <>기준 <span style={mono(C.text, 26)}>0.7</span>: 0.5 &lt; 0.7 이라 두 box 가 다 남는다</>)}
        {row(580, 10.3, false, <>기준 <span style={mono(C.text, 26)}>0.45</span>: 0.5 &gt; 0.45 라 컵 하나가 사라진다</>)}
        <div style={{ position: 'absolute', left: 30, top: 650, width: 800, opacity: prog(t, 11.5) }}>
          <span style={line(C.muted, 22)}>컵을 하나씩 집어 옮기는 로봇에게는 컵 하나가 사라지는 것이 더 큰 문제일 수 있다</span>
        </div>
      </Panel>
      <Box x={956} y={140} w={900} h={740} at={13} gap={18} title={<Head color={C.orange}>점수 기준 (NMS 보다 먼저)</Head>}>
        <Flow steps={['network 의 box', '점수 0.25 미만 버림', 'NMS', '남은 box']} color={C.orange} at={13.3} gap={0.4} />
        <span style={{ ...line(C.text, 24), opacity: prog(t, 15.5) }}>
          Ultralytics 가 예측할 때 쓰는 점수 기준의 기본값 <span style={mono(C.orange, 26)}>0.25</span>
        </span>
        <div style={{ display: 'grid', gap: 10, opacity: prog(t, 19.7), marginTop: 10 }}>
          <span style={line(C.text, 24)}>
            기준을 올리면 false positive(잘못 찾은 box) <span style={{ color: C.green }}>↓</span> · 놓친 물체 <span style={{ color: C.red }}>↑</span>
          </span>
          <span style={line(C.text, 24)}>기준을 내리면 반대가 된다</span>
        </div>
        <div style={{ display: 'grid', gap: 10, opacity: prog(t, 21.5), marginTop: 10 }}>
          <span style={line(C.text, 24)}>
            <span style={{ color: C.blue, fontWeight: 600 }}>precision</span> = 낸 box 가운데 맞은 비율
          </span>
          <span style={line(C.text, 24)}>
            <span style={{ color: C.green, fontWeight: 600 }}>recall</span> = 정답 가운데 찾은 비율
          </span>
          <span style={line(C.muted, 22)}>
            점수 기준을 높은 데서 낮은 데로 옮기며 둘이 바뀌는 모양으로 성능을 잰다 · Ultralytics 는 평가할 때 기준을 <span style={mono(C.muted, 22)}>0.001</span> 로 낮춘다
          </span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- mAP and fine-tuning ----------

function MapScene() {
  const t = useSec()
  const k = 6 // px per image pixel
  const x0 = 120
  const y0 = 110
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={860} h={330} at={0.3} title={<Head color={C.accent}>AP 와 mAP</Head>}>
        <span style={line(C.text, 24)}>
          <span style={{ color: C.green, fontWeight: 600 }}>recall</span>(가로축) · <span style={{ color: C.blue, fontWeight: 600 }}>precision</span>(세로축) 곡선 아래 넓이 = <span style={mono(C.accent, 25)}>AP</span>
        </span>
        <span style={{ ...line(C.text, 24), opacity: prog(t, 3.2) }}>
          class 마다 구한 AP 의 평균 = <span style={mono(C.accent, 25)}>mAP</span>
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 4.2) }}>100% 에 가까울수록 좋다 · 맞은 box 로 치는 IoU 기준은 benchmark 마다 다르다</span>
      </Box>
      <Box x={64} y={500} w={860} h={380} at={6} title={<Head color={C.orange}>맞은 box 의 기준</Head>}>
        <div style={{ display: 'grid', gap: 4 }}>
          <span style={{ ...line(C.blue, 24), fontWeight: 600 }}>PASCAL VOC 2007</span>
          <span style={line(C.text, 23)}>IoU 0.5 초과면 맞음 · recall 11 점에서 precision 의 평균</span>
        </div>
        <div style={{ display: 'grid', gap: 4, opacity: prog(t, 8.4) }}>
          <span style={{ ...line(C.green, 24), fontWeight: 600 }}>COCO (class 80 개)</span>
          <span style={line(C.text, 23)}>IoU 0.50, 0.55, …, 0.95 의 10 단계마다 AP 를 내서 평균</span>
          <span style={line(C.muted, 22)}>box 를 정확히 맞혀야 높게 나온다 · AP50 과 AP75 도 따로 낸다</span>
        </div>
      </Box>
      <Panel x={956} y={140} w={900} h={740}>
        <svg width={900} height={420}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 12.2)}>
            40 × 40 pixel 컵의 box 가 8 pixel 어긋나면
          </text>
          <g opacity={prog(t, 12.5)}>
            <rect x={x0} y={y0} width={40 * k} height={40 * k} fill={`${C.blue}22`} stroke={C.blue} strokeWidth={3} />
            <rect x={x0 + 8 * k} y={y0} width={40 * k} height={40 * k} fill={`${C.orange}1a`} stroke={C.orange} strokeWidth={3} strokeDasharray="12 7" />
            <text x={x0} y={y0 + 40 * k + 32} fill={C.blue} fontSize={22} fontWeight={600}>
              정답 box
            </text>
            <text x={x0 + 48 * k} y={y0 + 40 * k + 32} textAnchor="end" fill={C.orange} fontSize={22} fontWeight={600}>
              예측 box
            </text>
            <line x1={x0} y1={y0 - 26} x2={x0 + 8 * k} y2={y0 - 26} stroke={C.red} strokeWidth={3} />
            <text x={x0 + 8 * k + 12} y={y0 - 19} fill={C.red} fontSize={22} fontFamily={MONO} fontWeight={600}>
              8 pixel
            </text>
          </g>
          <g opacity={prog(t, 13.5)}>
            <text x={x0 + 24 * k} y={y0 + 20 * k - 6} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
              겹친 부분
            </text>
            <text x={x0 + 24 * k} y={y0 + 20 * k + 26} textAnchor="middle" fill={C.green} fontSize={24} fontFamily={MONO} fontWeight={600}>
              32 × 40
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 420, display: 'grid', gap: 10 }}>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 14) }}>겹친 넓이 32 × 40 = 1,280</span>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 15) }}>합친 넓이 1,600 + 1,600 − 1,280 = 1,920</span>
          <span style={{ ...mono(C.accent, 28), opacity: prog(t, 16) }}>IoU = 1,280 ÷ 1,920 = 0.67</span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 580, display: 'flex', gap: 20 }}>
          <span style={{ ...mono(C.green, 24), padding: '8px 16px', borderRadius: 12, border: `1.5px solid ${C.green}77`, opacity: prog(t, 18.3) }}>VOC 기준 0.5 → 맞음 ✓</span>
          <span style={{ ...mono(C.red, 24), padding: '8px 16px', borderRadius: 12, border: `1.5px solid ${C.red}77`, opacity: prog(t, 19.5) }}>AP75 기준 0.75 → 틀림 ✕</span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 650, width: 840, opacity: prog(t, 24.2) }}>
          <span style={line(C.text, 23)}>컵이 있는지만 알면 될 때 AP50 · gripper 를 컵 가운데로 보낼 때 AP75 나 COCO mAP</span>
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

function Finetune() {
  const t = useSec()
  const s = 0.55 // image px → screen px
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={1792} h={200} at={0.3} title={<Head color={C.accent}>내 물체로 학습하기 (fine-tuning)</Head>}>
        <Flow steps={['COCO 의 class 80 개에 없는 부품 · 공구', 'COCO 로 학습한 model 에서 출발', '내 물체 사진으로 다시 학습']} color={C.accent} at={0.6} gap={0.8} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 3.2) }}>앞쪽 층이 모서리 · 질감 같은 일반적인 특징을 이미 배워서, 처음부터 학습할 때보다 적은 사진으로 학습할 수 있다</span>
      </Box>
      <Card x={64} y={370} w={860} h={510} at={6.5}>
        <div style={{ position: 'absolute', left: 30, top: 24, display: 'grid', gap: 8 }}>
          <Head color={C.orange} size={26}>
            Ultralytics 형식 · 사진마다 txt 파일 하나
          </Head>
          <span style={mono(C.text, 24)}>class x_center y_center width height</span>
          <span style={line(C.muted, 22)}>좌표는 사진의 가로 · 세로 길이로 나눈 0 ~ 1 값 · class 번호는 0 부터</span>
        </div>
        <svg width={860} height={510} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g opacity={prog(t, 13.2)}>
            <rect x={30} y={170} width={640 * s} height={480 * s} fill={C.bg} stroke={C.cardEdge} strokeWidth={2} />
            <text x={30 + 640 * s + 18} y={196} fill={C.muted} fontSize={22} fontFamily={MONO}>
              640 × 480
            </text>
            <rect x={30 + 200 * s} y={170 + 220 * s} width={40 * s} height={40 * s} fill={`${C.green}44`} stroke={C.green} strokeWidth={3} />
            <text x={60} y={170 + 260 * s + 32} fill={C.green} fontSize={21} fontFamily={MONO}>
              (200, 220)–(240, 260)
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 450, opacity: prog(t, 15.5) }}>
          <span style={mono(C.accent, 28)}>0 0.34375 0.5 0.0625 0.0833</span>
        </div>
      </Card>
      <Box x={956} y={370} w={900} h={510} at={13} title={<Head color={C.green}>class 0 물체 한 줄 만들기</Head>}>
        <Table
          at={13.3}
          head={['값', '계산', '결과']}
          widths={[180, 440, 220]}
          size={23}
          rows={[
            ['x_center', '(200 + 240) ÷ 2 ÷ 640', '0.34375'],
            ['y_center', '(220 + 260) ÷ 2 ÷ 480', '0.5'],
            ['width', '(240 − 200) ÷ 640', '0.0625'],
            ['height', '(260 − 220) ÷ 480', '0.0833'],
          ]}
          step={0.5}
        />
        <div style={{ display: 'grid', gap: 8, marginTop: 8, opacity: prog(t, 19.7) }}>
          <span style={line(C.red, 23)}>꼭짓점 좌표를 0 ~ 1 로 나눠 적으면 값이 모두 0 ~ 1 이라 검사를 통과하고, 오류 없이 엉뚱한 자리의 box 를 배운다</span>
          <span style={{ ...line(C.text, 23), opacity: prog(t, 22.2) }}>→ 학습 전에 label 을 사진 위에 다시 그려 본다</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- 3D, tracking, open vocabulary ----------

function To3d() {
  const t = useSec()
  const s = 0.75
  const ox = 30
  const oy = 70
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={860} h={740}>
        <svg width={860} height={440}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            box 가운데 pixel + 그 자리의 depth
          </text>
          <g opacity={prog(t, 0.6)}>
            <rect x={ox} y={oy} width={640 * s} height={480 * s} fill={C.bg} stroke={C.cardEdge} strokeWidth={2} />
            <text x={ox + 14} y={oy + 32} fill={C.dim} fontSize={20}>
              사진 · 모식도
            </text>
          </g>
          <g opacity={prog(t, 6.3)}>
            <circle cx={ox + 320 * s} cy={oy + 240 * s} r={7} fill={C.blue} />
            <text x={ox + 320 * s - 14} y={oy + 240 * s - 22} textAnchor="end" fill={C.blue} fontSize={21} fontFamily={MONO}>
              (320, 240)
            </text>
            <rect x={ox + 350 * s} y={oy + 205 * s} width={60 * s} height={70 * s} fill="none" stroke={C.green} strokeWidth={3} />
            <circle cx={ox + 380 * s} cy={oy + 240 * s} r={6} fill={C.green} />
            <text x={ox + 380 * s - 10} y={oy + 275 * s + 30} fill={C.green} fontSize={21} fontFamily={MONO}>
              (380, 240) · 0.5 m
            </text>
          </g>
          <g opacity={prog(t, 7.5)}>
            <text x={ox + 640 * s + 20} y={oy + 60} fill={C.blue} fontSize={21}>
              사진 가운데
            </text>
            <text x={ox + 640 * s + 20} y={oy + 88} fill={C.blue} fontSize={21}>
              (principal point)
            </text>
            <text x={ox + 640 * s + 20} y={oy + 140} fill={C.muted} fontSize={21}>
              초점 거리
            </text>
            <text x={ox + 640 * s + 20} y={oy + 168} fill={C.muted} fontSize={21} fontFamily={MONO}>
              600 pixel
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 450 }}>
          <Table
            at={12.2}
            head={['값', '계산', '결과']}
            widths={[190, 420, 170]}
            size={23}
            rows={[
              ['X (오른쪽)', '(380 − 320) × 0.5 ÷ 600', '0.05 m'],
              ['Y (아래)', '(240 − 240) × 0.5 ÷ 600', '0 m'],
              ['Z (앞)', 'depth', '0.5 m'],
            ]}
            step={0.5}
          />
        </div>
        <div style={{ position: 'absolute', left: 30, top: 640, width: 800, opacity: prog(t, 14.5) }}>
          <span style={line(C.text, 25)}>
            물체는 카메라 앞 <span style={mono(C.accent, 26)}>0.5 m</span>, 오른쪽 <span style={mono(C.accent, 26)}>5 cm</span>
          </span>
        </div>
      </Panel>
      <Box x={956} y={140} w={900} h={240} at={18} title={<Head color={C.purple}>camera frame → robot frame</Head>}>
        <Flow steps={['camera frame 의 점', '× extrinsics', '팔이 갈 좌표']} color={C.purple} at={18.3} gap={0.5} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 20.5) }}>extrinsics: 카메라에서 robot base 로 가는 변환 · 손목 카메라는 Hand-Eye Calibration 으로 구한다</span>
      </Box>
      <Card x={956} y={410} w={900} h={470} at={24}>
        <svg width={900} height={300}>
          <text x={30} y={44} fill={C.red} fontSize={26} fontWeight={600}>
            가운데가 빈 물체 · 옆에서 본 모식도
          </text>
          <rect x={50} y={150} width={60} height={44} rx={8} fill={C.card} stroke={C.accent} strokeWidth={3} />
          <text x={80} y={232} textAnchor="middle" fill={C.accent} fontSize={21}>
            카메라
          </text>
          <rect x={390} y={110} width={30} height={40} rx={4} fill={`${C.orange}66`} stroke={C.orange} strokeWidth={2} />
          <rect x={390} y={194} width={30} height={40} rx={4} fill={`${C.orange}66`} stroke={C.orange} strokeWidth={2} />
          <text x={405} y={268} textAnchor="middle" fill={C.orange} fontSize={21}>
            고리 모양 물체 · 0.5 m
          </text>
          <line x1={650} y1={80} x2={650} y2={250} stroke={C.muted} strokeWidth={6} />
          <text x={670} y={110} fill={C.muted} fontSize={21}>
            뒤쪽 벽 · 0.8 m
          </text>
          <line x1={110} y1={172} x2={644} y2={172} stroke={C.red} strokeWidth={2.5} strokeDasharray="10 7" />
          <circle cx={650} cy={172} r={7} fill={C.red} />
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 300, display: 'grid', gap: 8 }}>
          <span style={mono(C.text, 22)}>X = (380 − 320) × 0.8 ÷ 600 = 0.08 m</span>
          <span style={mono(C.red, 22)}>옆 0.08 − 0.05 = 0.03 m · 앞 0.8 − 0.5 = 0.3 m</span>
          <span style={{ ...line(C.green, 23), opacity: prog(t, 25.5) }}>→ box 안 depth 여러 개의 중앙값, 또는 segmentation mask</span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Track() {
  const t = useSec()
  const cols = [330, 520, 710, 900]
  const score = ['0.9', '0.9', '0.2', '0.9']
  const cellBox = (cx: number, y: number, id: string, color: string, sub?: string) => (
    <g>
      <rect x={cx - 75} y={y} width={150} height={80} rx={12} fill={`${color}14`} stroke={color} strokeWidth={2} />
      <text x={cx} y={y + (sub ? 36 : 50)} textAnchor="middle" fill={color} fontSize={26} fontFamily={MONO} fontWeight={600}>
        {id}
      </text>
      {sub && (
        <text x={cx} y={y + 66} textAnchor="middle" fill={color} fontSize={20}>
          {sub}
        </text>
      )}
    </g>
  )
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={480}>
        <svg width={1100} height={480}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            프레임마다 컵에 붙는 번호
          </text>
          <text x={1070} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          {cols.map((cx, i) => (
            <g key={cx} opacity={prog(t, 0.6 + i * 0.3)}>
              <text x={cx} y={92} textAnchor="middle" fill={C.muted} fontSize={21}>
                프레임 {i + 1}
              </text>
              <text x={cx} y={124} textAnchor="middle" fill={i === 2 ? C.red : C.text} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={i === 2 ? prog(t, 6.5) : 1}>
                점수 {score[i]}
              </text>
              {i === 2 && (
                <text x={cx} y={152} textAnchor="middle" fill={C.red} fontSize={20} opacity={prog(t, 6.5)}>
                  사람이 가림
                </text>
              )}
            </g>
          ))}
          <g opacity={prog(t, 7.2)}>
            <text x={30} y={222} fill={C.text} fontSize={22} fontWeight={600}>
              점수 기준
            </text>
            <text x={30} y={250} fill={C.text} fontSize={22} fontWeight={600}>
              0.25 만
            </text>
            {cellBox(cols[0], 180, '#1', C.blue)}
            {cellBox(cols[1], 180, '#1', C.blue)}
            {cellBox(cols[2], 180, '버림', C.red)}
            {cellBox(cols[3], 180, '#2', C.red, '새 번호')}
          </g>
          <g opacity={prog(t, 12.3)}>
            <text x={30} y={340} fill={C.green} fontSize={22} fontWeight={600}>
              ByteTrack
            </text>
            {cellBox(cols[0], 300, '#1', C.green)}
            {cellBox(cols[1], 300, '#1', C.green)}
            {cellBox(cols[2], 300, '#1', C.green, '② 다시 짝')}
            {cellBox(cols[3], 300, '#1', C.green)}
          </g>
          <g opacity={prog(t, 14)}>
            <text x={30} y={428} fill={C.muted} fontSize={21}>
              ① 점수가 높은 box 로 먼저 짝짓기 → ② 짝 못 찾은 기존 물체를 낮은 점수 box 와 한 번 더 짝짓기
            </text>
            <text x={30} y={458} fill={C.dim} fontSize={20}>
              기존 물체와 이어지지 않는 낮은 점수 box 는 배경으로 버린다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1196} y={140} w={660} h={480} at={18} title={<Head color={C.green}>ByteTrack (Zhang 등, 2022)</Head>}>
        <span style={line(C.muted, 22)}>사람 추적 benchmark MOT17 의 시험 데이터</span>
        <div style={{ display: 'flex', gap: 30 }}>
          <span style={mono(C.green, 32)}>MOTA 80.3</span>
          <span style={mono(C.green, 32)}>IDF1 77.3</span>
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 19.5) }}>MOTA: 놓침 · 잘못 찾음 · 번호 바뀜을 함께 반영한 정확도</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 20.5) }}>IDF1: 같은 물체에 같은 번호를 얼마나 일관되게 붙였는지</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 21.5) }}>
          V100 GPU 에서 1초에 <span style={mono(C.accent, 24)}>30</span> 프레임
        </span>
      </Box>
      <Box x={64} y={650} w={1792} h={230} at={24} gap={10} title={<Head color={C.purple}>이름으로 찾는 open-vocabulary detector · Grounding DINO (Liu 등, 2023)</Head>}>
        <span style={line(C.text, 23)}>class 이름이나 "왼쪽 컵" 같은 설명을 받아 그에 맞는 물체를 찾는다 · 목록이 정해진 COCO detector 는 목록 밖의 물체를 못 찾는다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 25.5) }}>
          COCO 학습 데이터 없이 COCO 로 평가한 zero-shot AP <span style={mono(C.purple, 23)}>52.5</span>: 가장 큰 Swin-L 을 COCO 와 class 가 많이 겹치는 Objects365 등으로 pretraining 한 결과 · Swin-T 는 <span style={mono(C.purple, 23)}>46.7 ~ 48.4</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: '물체마다 box · class · 점수 · YOLO 는 7 × 7 × 30 의 정해진 출력을 한 번에 낸다', at: 0.5 },
    { tag: script.sections[1], color: C.orange, text: '점수 0.25 미만 버림 · NMS 기준 0.7: IoU 0.75 는 지우고 0.3 은 남긴다', at: 4.4 },
    { tag: script.sections[2], color: C.green, text: 'COCO mAP 는 IoU 0.50 ~ 0.95 평균 · IoU 0.67 은 AP50 맞음, AP75 틀림', at: 8.4 },
    { tag: script.sections[3], color: C.purple, text: '(380 − 320) × 0.5 ÷ 600 = 0.05 m · depth 중앙값이나 mask · ByteTrack', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            개수를 모르는 box 를 어떻게 내고, 로봇 팔이 갈 3D 좌표는 어떻게 얻을까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
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
          <div style={{ fontFamily: MONO, fontSize: 72, fontWeight: 600 }}>Grasp Planning · 6D Object Pose</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            찾은 물체를 어떤 자세로 집을지 · 물체의 3D 자세를 정확히 구하기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/object-detection (YOLO · Faster R-CNN · PASCAL VOC · COCO · ByteTrack · Grounding DINO 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseIou = () => (
  <PauseWrite
    question="box A (0, 0)–(100, 100) 과 box B (50, 0)–(150, 100) 의 IoU 는 얼마인가?"
    answer={
      <>
        겹친 넓이 50 × 100 = 5,000 · 합친 넓이 10,000 + 10,000 − 5,000 = 15,000
        <br />
        IoU = 5,000 ÷ 15,000 ≈ 0.33 · 가로로 절반이 어긋나도 0.5 가 아니다
      </>
    }
  />
)

const PauseNms = () => (
  <PauseWrite
    question="점수 0.95, 0.85, 0.7 인 box 셋. 0.95 box 와의 IoU 는 0.85 box 가 0.6, 0.7 box 가 0.8 이다. NMS 기준 0.7 이면 몇 개가 남나? 0.5 면?"
    answer={
      <>
        기준 0.7: IoU 0.6 인 0.85 box 는 남고, IoU 0.8 인 0.7 box 는 지운다 → 2 개
        <br />
        기준 0.5: 0.6 과 0.8 이 모두 0.5 보다 커서 둘 다 지운다 → 1 개
      </>
    }
  />
)

const PauseLabel = () => (
  <PauseWrite
    question="1280 × 720 사진에서 box (640, 300)–(740, 420) 인 class 2 물체를 Ultralytics 형식의 한 줄로 쓰면?"
    answer={
      <>
        x 690 ÷ 1280 ≈ 0.539 · y 360 ÷ 720 = 0.5
        <br />
        w 100 ÷ 1280 ≈ 0.078 · h 120 ÷ 720 ≈ 0.167
        <br />→ 2 0.539 0.5 0.078 0.167
      </>
    }
  />
)

const Pause3d = () => (
  <PauseWrite
    question="가로 초점 거리 500 pixel, principal point 의 u 는 320, box 가운데의 u 는 220, depth 는 1.0 m. 물체는 옆으로 얼마나 떨어져 있나?"
    answer={
      <>
        220 − 320 = −100 pixel → X = −100 × 1.0 ÷ 500 = −0.2 m
        <br />X 가 음수라서 왼쪽으로 0.2 m
      </>
    }
  />
)

export function ObjectDetection() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        outputs: Outputs,
        stages: Stages,
        'pause-iou': PauseIou,
        nms: Nms,
        thresholds: Thresholds,
        'pause-nms': PauseNms,
        map: MapScene,
        finetune: Finetune,
        'pause-label': PauseLabel,
        to3d: To3d,
        track: Track,
        'pause-3d': Pause3d,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
