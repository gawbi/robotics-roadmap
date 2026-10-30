import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './pytorch-mlp.narration.json'
import { script } from './pytorch-mlp.script'

// Numbers follow lessons/pytorch-mlp/README.md (see pytorch-mlp.script.ts). The shuffled photo order is schematic (marked
// 모식도); every number on screen is the lesson's.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 520, unit = '', fmt, labelW = 250 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: ReactNode; labelW?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: 23, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 30, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
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

function Flow({ steps, color, at, gap = 0.5, last }: { steps: string[]; color: string; at: number; gap?: number; last?: string }) {
  const t = useSec()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
          {i < steps.length - 1 && <span style={{ fontSize: 30, color: C.muted, opacity: prog(t, at + i * gap + 0.25) }}>→</span>}
        </div>
      ))}
      {last && (
        <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 600, color, marginLeft: 8, opacity: prog(t, at + steps.length * gap) }}>
          {last}
        </span>
      )}
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

/** a simple text table: first column sans, the rest mono */
function Table({ head, rows, widths, at, step = 0.6, size = 24, colors }: { head: ReactNode[]; rows: ReactNode[][]; widths: number[]; at: number; step?: number; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, at), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 3 }}>
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

/** a line of text that fades in at `at` */
function Say({ at, children, color = C.text, size = 24, style }: { at: number; children: ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  const t = useSec()
  return <div style={{ ...line(color, size), opacity: prog(t, at), ...style }}>{children}</div>
}

const M = ({ children, color = C.accent, size = 25 }: { children: ReactNode; color?: string; size?: number }) => <span style={mono(color, size)}>{children}</span>

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            FOUNDATIONS · TRAINING LOOP
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 108, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>PyTorch Training Loop</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            mini-batch 마다 <span style={{ color: C.accent }}>forward · loss · backward · update</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={38}>
            GPU 가 100,000 번 되풀이하는 한 번의 계산을 숫자로 따라가기
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
  const left: [ReactNode, number][] = [
    [<><M>200 step</M> 마다 step 번호와 loss 가 찍힌다</>, 0.8],
    [<><M>20,000 step</M> 마다 checkpoint 파일이 하나씩 쌓인다</>, 1.5],
    [<>기본 설정: 같은 계산을 <M>100,000</M> 번 되풀이</>, 2.3],
  ]
  const right: [ReactNode, number][] = [
    [<>parameter <M color={C.orange}>약 8,000 만</M> 개인 policy</>, 1.2],
    [<>RTX 2080 Ti 한 장에서 <M color={C.orange}>5 시간</M>쯤 학습</>, 1.9],
    [<>한 번에 시연 frame <M color={C.orange}>8</M> 개를 꺼내 계산</>, 2.7],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={140} w={1792} h={290} at={0.3}>
        <div style={{ position: 'absolute', left: 40, top: 28, width: 820, display: 'grid', gap: 14 }}>
          <Head color={C.accent} size={26}>
            LeRobot 으로 ACT policy 를 학습시킬 때
          </Head>
          {left.map(([s, at], i) => (
            <Say key={i} at={at} size={25}>
              {s}
            </Say>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 940, top: 28, width: 812, display: 'grid', gap: 14 }}>
          <Head color={C.orange} size={26}>
            ACT 논문의 학습
          </Head>
          {right.map(([s, at], i) => (
            <Say key={i} at={at} size={25}>
              {s}
            </Say>
          ))}
        </div>
      </Card>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 470, width: 1792 }}>
        <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.3, textAlign: 'center', textWrap: 'balance' }}>
          그 한 번의 계산에서 GPU 는 <span style={{ color: C.accent }}>무엇을 계산하고</span>, optimizer 는 <span style={{ color: C.accent }}>parameter 를 어떻게 고칠까?</span>
        </div>
      </Appear>
      <div style={{ position: 'absolute', left: 64, top: 700, width: 1792 }}>
        <Flow steps={['mini-batch (frame 8 개)', 'forward', 'loss', 'backward', 'update']} color={C.accent} at={5.6} gap={0.3} last="× 100,000 step" />
      </div>
    </AbsoluteFill>
  )
}

// ---------- S1: step and epoch ----------

function Loop() {
  const t = useSec()
  const steps: { text: ReactNode; sub?: ReactNode; at: number; color: string }[] = [
    { text: <>mini-batch 를 꺼낸다 · 사진 <M size={24}>100</M> 장과 label <M size={24}>100</M> 개</>, at: 0.6, color: C.blue },
    { text: 'forward 로 logits 를 계산한다', sub: 'autograd 가 연산을 graph 로 기록한다', at: 1.6, color: C.blue },
    { text: 'logits 와 label 로 cross-entropy 를 구해 평균한다', at: 3.2, color: C.blue },
    { text: <>지난 step 의 gradient 를 <M size={24}>0</M> 으로 지운다</>, at: 6.6, color: C.orange },
    { text: <>backward 로 parameter <M size={24}>203,530</M> 개의 gradient 를 채운다</>, sub: 'autograd 가 graph 를 거꾸로 훑는다', at: 8, color: C.orange },
    { text: 'optimizer 가 gradient 를 읽어 parameter 를 고친다', at: 9.6, color: C.green },
  ]
  type Row = { name: ReactNode; shape: ReactNode; param: ReactNode; at: number; pAt?: number }
  const rows: Row[] = [
    { name: '사진 한 장 (흑백)', shape: '28 × 28', param: '밝기 0 ~ 1', at: 12.8 },
    { name: 'flatten 으로 펴기', shape: '(B, 784)', param: '28 × 28 = 784', at: 13.5 },
    { name: 'Linear 784 → 256, ReLU', shape: '(B, 256)', param: '256 × (784 + 1) = 200,960', at: 14.3, pAt: 19.3 },
    { name: 'Linear 256 → 10 · logits', shape: '(B, 10)', param: '10 × (256 + 1) = 2,570', at: 15.2, pAt: 20.3 },
    { name: 'cross-entropy 평균', shape: '숫자 1 개', param: 'loss', at: 16.1 },
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={860} h={750} at={0.3} gap={20} title={<Head>training loop 의 한 step</Head>}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', opacity: prog(t, s.at) }}>
            <span style={{ width: 44, height: 44, flex: 'none', borderRadius: 999, border: `2px solid ${s.color}`, color: s.color, display: 'grid', placeItems: 'center', fontFamily: MONO, fontSize: 24, fontWeight: 600 }}>{i + 1}</span>
            <div style={{ display: 'grid', gap: 2, paddingTop: 4 }}>
              <span style={line(C.text, 24)}>{s.text}</span>
              {s.sub && <span style={line(C.purple, 21)}>{s.sub}</span>}
            </div>
          </div>
        ))}
        <div style={{ borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 16, display: 'grid', gap: 8, opacity: prog(t, 10.6) }}>
          <span style={line(C.purple, 23)}>autograd: 어느 쪽으로 고치면 loss 가 줄어드는지 계산</span>
          <span style={line(C.green, 23)}>optimizer: 실제로 얼마나 움직일지 결정</span>
          <span style={{ ...line(C.muted, 23), opacity: prog(t, 11.4) }}>↺ 다음 mini-batch 로 같은 여섯 단계를 되풀이</span>
        </div>
      </Box>
      <Card x={956} y={130} w={904} h={750} at={12.5}>
        <div style={{ padding: '24px 28px', display: 'grid', gap: 10 }}>
          <Head>예제 MLP · MNIST 손글씨 숫자</Head>
          <span style={line(C.muted, 22)}>B 는 batch 크기 · 이 강의의 mini-batch 는 사진 100 장</span>
          <div style={{ display: 'flex', gap: 13, padding: '8px 16px 0', color: C.muted, fontSize: 20 }}>
            <span style={{ width: 290 }}>단계</span>
            <span style={{ width: 150 }}>shape</span>
            <span style={{ width: 350 }}>parameter 수</span>
          </div>
          <div style={{ display: 'grid' }}>
            {rows.map((r, i) => (
              <div key={i}>
                <div style={{ display: 'flex', gap: 13, alignItems: 'center', height: 62, padding: '0 16px', borderRadius: 14, border: `1.5px solid ${C.blue}66`, background: `${C.blue}10`, opacity: prog(t, r.at) }}>
                  <span style={{ width: 290, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.name}</span>
                  <span style={{ width: 150, ...mono(C.blue, 22) }}>{r.shape}</span>
                  <span style={{ width: 350, ...mono(r.pAt ? C.green : C.muted, 21), opacity: r.pAt ? prog(t, r.pAt) : 1 }}>{r.param}</span>
                </div>
                {i < rows.length - 1 && (
                  <div style={{ height: 40, paddingLeft: 120, display: 'flex', alignItems: 'center', color: C.muted, fontSize: 26, opacity: prog(t, rows[i + 1].at) }}>↓</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, opacity: prog(t, 21.5) }}>
            <span style={line(C.text, 24)}>parameter 합 </span>
            <M color={C.green} size={30}>
              200,960 + 2,570 = 203,530
            </M>
            <span style={line(C.text, 24)}> 개</span>
          </div>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Epoch() {
  const t = useSec()
  const orders = [
    [7, 2, 11, 4, 9, 1, 12, 5, 3, 10, 6, 8],
    [5, 12, 1, 8, 2, 6, 10, 3, 11, 7, 4, 9],
  ]
  const sq = 46
  const sx = (i: number) => 68 + i * (sq + 8) + Math.floor(i / 4) * 36
  const nx = (v: number) => 160 + (v + 5) * 97
  const dot = (v: number, y: number, color: string, at: number, dx = 0) => <circle cx={nx(v) + dx} cy={y} r={10} fill={color} opacity={prog(t, at)} />
  const val = (v: number, y: number, s: string, color: string, at: number) => (
    <text x={nx(v)} y={y} textAnchor="middle" fill={color} fontSize={21} fontFamily={MONO} fontWeight={600} opacity={prog(t, at)}>
      {s}
    </text>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={860} h={340} at={0.3} title={<Head>step 과 epoch</Head>}>
        <Say at={0.6}>
          <M>step</M> parameter 를 한 번 고치는 단위
        </Say>
        <Say at={2.6}>
          <M>epoch</M> 데이터 전체를 한 번씩 다 쓰는 단위
        </Say>
        <Say at={6.6}>
          MNIST 학습용 <M color={C.green} size={28}>60,000 ÷ 100 = 600 step</M>
        </Say>
        <Say at={9.6} color={C.muted}>
          epoch 마다 순서를 무작위로 섞는다 (shuffle)
        </Say>
      </Box>
      <Box x={64} y={500} w={860} h={380} at={12.5} gap={12} color={`${C.orange}88`} title={<Head color={C.orange}>LeRobot · ALOHA 시뮬레이션 데이터</Head>}>
        <span style={{ ...mono(C.muted, 21), opacity: prog(t, 12.7) }}>aloha_sim_transfer_cube_human</span>
        <Say at={13}>
          시연 <M color={C.orange}>50</M> 개 · <M color={C.orange}>50 Hz</M> 로 녹화 · frame 모두 <M color={C.orange}>20,000</M> 개
        </Say>
        <Say at={14.5} color={C.muted} size={22}>
          기본 batch 크기 8 → epoch 하나
        </Say>
        <Say at={14.8}>
          <M color={C.green} size={28}>20,000 ÷ 8 = 2,500 step</M>
        </Say>
        <Say at={18.7} color={C.muted} size={22}>
          기본 학습 길이 100,000 step
        </Say>
        <Say at={19}>
          <M color={C.green} size={28}>100,000 ÷ 2,500 = 40 epoch</M>
        </Say>
      </Box>
      <Card x={956} y={130} w={904} h={750} at={6.4}>
        <svg width={904} height={750}>
          <text x={30} y={46} fill={C.text} fontSize={24} fontWeight={600}>
            epoch 마다 다시 섞어 4 장씩 나누기
          </text>
          <text x={874} y={46} textAnchor="end" fill={C.dim} fontSize={20}>
            사진 12 장 · 모식도
          </text>
          {orders.map((o, r) => {
            const y0 = 96 + r * 132
            const at = 7 + r * 2.2
            return (
              <g key={r} opacity={prog(t, at)}>
                <text x={30} y={y0} fill={C.muted} fontSize={21} fontFamily={MONO}>
                  epoch {r + 1}
                </text>
                {o.map((n, i) => (
                  <g key={i}>
                    <rect x={sx(i)} y={y0 + 14} width={sq} height={sq} rx={8} fill={`${[C.blue, C.green, C.orange][Math.floor(i / 4)]}22`} stroke={[C.blue, C.green, C.orange][Math.floor(i / 4)]} strokeWidth={2} />
                    <text x={sx(i) + sq / 2} y={y0 + 14 + 30} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={MONO}>
                      {n}
                    </text>
                  </g>
                ))}
                {[0, 1, 2].map((g) => (
                  <text key={g} x={(sx(g * 4) + sx(g * 4 + 3) + sq) / 2} y={y0 + 92} textAnchor="middle" fill={[C.blue, C.green, C.orange][g]} fontSize={20}>
                    mini-batch {g + 1}
                  </text>
                ))}
              </g>
            )
          })}
          <g opacity={prog(t, 23.6)}>
            <line x1={30} x2={874} y1={352} y2={352} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={30} y={390} fill={C.text} fontSize={24} fontWeight={600}>
              mini-batch 의 gradient 는 흔들린다
            </text>
            <text x={874} y={390} textAnchor="end" fill={C.dim} fontSize={20}>
              예로 든 sample 별 gradient
            </text>
            <line x1={nx(-1)} x2={nx(-1)} y1={434} y2={632} stroke={C.accent} strokeWidth={2} strokeDasharray="6 6" />
            <text x={nx(-1)} y={424} textAnchor="middle" fill={C.accent} fontSize={21} fontWeight={600}>
              epoch 평균 −1
            </text>
            <line x1={nx(-5)} x2={nx(2)} y1={632} y2={632} stroke={C.muted} strokeWidth={2} />
            {[-4, -3, -2, -1, 0, 1].map((v) => (
              <g key={v}>
                <line x1={nx(v)} x2={nx(v)} y1={626} y2={638} stroke={C.muted} strokeWidth={2} />
                <text x={nx(v)} y={664} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {v < 0 ? `−${-v}` : v}
                </text>
              </g>
            ))}
            <text x={30} y={482} fill={C.muted} fontSize={21}>
              sample 별
            </text>
            <text x={30} y={542} fill={C.muted} fontSize={21}>
              섞은 순서 A
            </text>
            <text x={30} y={602} fill={C.muted} fontSize={21}>
              섞은 순서 B
            </text>
          </g>
          {dot(-4, 475, C.text, 24)}
          {dot(-2, 475, C.text, 24)}
          {dot(1, 475, C.text, 24, -12)}
          {dot(1, 475, C.text, 24, 12)}
          {val(-4, 456, '−4', C.text, 24)}
          {val(-2, 456, '−2', C.text, 24)}
          {val(1, 456, '1, 1', C.text, 24)}
          {dot(-3, 535, C.orange, 25.2)}
          {dot(1, 535, C.orange, 25.2)}
          {val(-3, 516, '−3', C.orange, 25.2)}
          {val(1, 516, '1', C.orange, 25.2)}
          {dot(-1.5, 595, C.pink, 26.2)}
          {dot(-0.5, 595, C.pink, 26.2)}
          {val(-1.5, 576, '−1.5', C.pink, 26.2)}
          {val(-0.5, 576, '−0.5', C.pink, 26.2)}
          <g opacity={prog(t, 27)}>
            <text x={30} y={702} fill={C.text} fontSize={21}>
              두 장씩 묶은 평균은 섞은 순서에 따라 부호까지 바뀌지만,
            </text>
            <text x={30} y={732} fill={C.accent} fontSize={21}>
              epoch 하나에 걸쳐 평균하면 언제나 −1
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- S2: loss and optimizer ----------

function Softmax() {
  const t = useSec()
  const p = (s: string, at: number) => <span style={{ opacity: prog(t, at) }}>{s}</span>
  // cross-entropy curve: p 0..1 → x 90..820, L 0..2.5 → y 330..80
  const cx = (q: number) => 90 + q * 730
  const cy = (L: number) => 330 - (L / 2.5) * 250
  const curve = Array.from({ length: 60 }, (_, i) => {
    const q = 0.09 + (i / 59) * 0.91
    return `${i ? 'L' : 'M'}${cx(q).toFixed(1)},${cy(-Math.log(q)).toFixed(1)}`
  }).join(' ')
  const pts: [number, number, string, string][] = [
    [0.107, 2.24, '0.107 → 2.240', C.red],
    [0.333, 1.099, '0.333 → 1.099', C.orange],
    [0.659, 0.417, '0.659 → 0.417', C.accent],
  ]
  const gx0 = 520
  const gs = 560
  const grads: [string, number, string, string][] = [
    ['class 0 · 정답', -0.341, '−0.341', C.green],
    ['class 1', 0.242, '0.242', C.red],
    ['class 2', 0.099, '0.099', C.red],
  ]
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={900} h={420} at={0.3}>
        <div style={{ padding: '22px 28px', display: 'grid', gap: 14 }}>
          <Head>softmax · 점수를 확률로</Head>
          <Say at={0.8}>
            <M size={26}>
              p = e<sup>z</sup> ÷ (모든 class 의 e<sup>z</sup> 를 더한 합)
            </M>
          </Say>
          <Table
            at={1.4}
            step={0.5}
            widths={[150, 130, 160, 380]}
            size={23}
            head={['class', '점수 z', <>e<sup>z</sup></>, '확률 p']}
            rows={[
              ['0 (정답)', '2.0', '7.389', p('7.389 ÷ 11.213 = 0.659', 7)],
              ['1', '1.0', '2.718', p('2.718 ÷ 11.213 = 0.242', 7.6)],
              ['2', '0.1', '1.105', p('1.105 ÷ 11.213 = 0.099', 8.2)],
              [p('합', 6.7), '', p('11.213', 6.7), p('0.659 + 0.242 + 0.099 = 1', 9.6)],
            ]}
            colors={[C.accent, undefined, undefined, C.muted]}
          />
        </div>
      </Card>
      <div style={{ position: 'absolute', left: 64, top: 580, width: 900 }}>
        <Misconception at={18.6} belief="loss 가 0.417 이면 41.7% 틀렸다" fact="맞힌 비율은 accuracy 로 따로 잰다" />
      </div>
      <Card x={996} y={130} w={864} h={380} at={12.5}>
        <svg width={864} height={380}>
          <text x={28} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            cross-entropy L = −log p
          </text>
          <text x={836} y={44} textAnchor="end" fill={C.muted} fontSize={20}>
            p 는 정답 class 의 확률
          </text>
          <line x1={90} x2={830} y1={330} y2={330} stroke={C.muted} strokeWidth={2} />
          <line x1={90} x2={90} y1={78} y2={330} stroke={C.muted} strokeWidth={2} />
          {[0, 0.5, 1].map((q) => (
            <text key={q} x={cx(q)} y={358} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {q}
            </text>
          ))}
          {[0, 1, 2].map((L) => (
            <text key={L} x={78} y={cy(L) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
              {L}
            </text>
          ))}
          <text x={640} y={358} textAnchor="middle" fill={C.muted} fontSize={20}>
            정답 확률 p
          </text>
          <path d={curve} fill="none" stroke={C.blue} strokeWidth={3.5} strokeDasharray={1400} strokeDashoffset={1400 * (1 - prog(t, 12.8, 1.4))} />
          {pts.map(([q, L, s, color], i) => (
            <g key={s} opacity={prog(t, 14 + i * 0.8)}>
              <circle cx={cx(q)} cy={cy(L)} r={8} fill={color} />
              <text x={cx(q) + 14} y={cy(L) - 14} fill={color} fontSize={21} fontFamily={MONO} fontWeight={600}>
                {s}
              </text>
            </g>
          ))}
        </svg>
      </Card>
      <Card x={996} y={540} w={864} h={340} at={24}>
        <svg width={864} height={340}>
          <text x={28} y={44} fill={C.text} fontSize={24} fontWeight={600}>
            점수의 gradient = p − onehot(y)
          </text>
          <line x1={gx0} x2={gx0} y1={66} y2={200} stroke={C.muted} strokeWidth={2} />
          {grads.map(([name, g, s, color], i) => {
            const y = 96 + i * 46
            const w = Math.abs(g) * gs * prog(t, 24.4 + i * 0.4, 0.8)
            return (
              <g key={name} opacity={prog(t, 24.2 + i * 0.4)}>
                <text x={28} y={y + 8} fill={C.muted} fontSize={22}>
                  {name}
                </text>
                <rect x={g < 0 ? gx0 - w : gx0} y={y - 13} width={w} height={26} rx={5} fill={color} />
                <text x={g < 0 ? gx0 - Math.abs(g) * gs - 10 : gx0 + Math.abs(g) * gs + 10} y={y + 8} textAnchor={g < 0 ? 'end' : 'start'} fill={color} fontSize={22} fontFamily={MONO} fontWeight={600}>
                  {s}
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 25.6)}>
            <text x={28} y={250} fill={C.text} fontSize={22} fontFamily={MONO}>
              (0.659, 0.242, 0.099) − (1, 0, 0)
            </text>
            <text x={28} y={296} fill={C.muted} fontSize={21}>
              반대 방향으로 고치면 정답 점수는 오르고, class 1 점수가 가장 크게 내려간다
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Optimizer() {
  const t = useSec()
  const rows: [number, string, number][] = [
    [1, '0 + 1 = 1', 0.1],
    [2, '0.9 + 1 = 1.9', 0.19],
    [3, '1.71 + 1 = 2.71', 0.271],
    [4, '2.439 + 1 = 3.439', 0.3439],
  ]
  const BW = 300
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={750} at={0.3} title={<Head>SGD 와 momentum</Head>}>
        <Say at={0.6}>
          <M size={26}>SGD: θ ← θ − η g</M>
        </Say>
        <Say at={1.4} color={C.muted} size={22}>
          parameter θ 에서 learning rate η 와 mini-batch gradient g 의 곱을 뺀다
        </Say>
        <Say at={6.5}>
          <M size={26} color={C.blue}>
            momentum: b ← μ b + g, θ ← θ − η b
          </M>
        </Say>
        <Say at={7.2} color={C.muted} size={22}>
          μ = 0.9 · buffer b 는 0 에서 시작 · 예: gradient 가 매번 1, η = 0.1
        </Say>
        <div style={{ display: 'flex', gap: 16, color: C.muted, fontSize: 20, borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6, opacity: prog(t, 7.6) }}>
          <span style={{ width: 70 }}>step</span>
          <span style={{ width: 230 }}>b = 0.9 × 지난 b + 1</span>
          <span style={{ width: 400 }}>움직인 거리 · momentum / SGD</span>
        </div>
        {rows.map(([s, b, d], i) => (
          <div key={s} style={{ display: 'flex', gap: 16, alignItems: 'center', opacity: prog(t, 8 + i * 0.9) }}>
            <span style={{ width: 70, ...mono(C.muted, 22) }}>{s}</span>
            <span style={{ width: 230, ...mono(C.blue, 21) }}>{b}</span>
            <div style={{ width: 400, display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: (BW * d) / 0.3439, height: 16, borderRadius: 4, background: C.blue }} />
                <span style={mono(C.blue, 20)}>{d}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: (BW * 0.1) / 0.3439, height: 16, borderRadius: 4, background: C.dim }} />
                <span style={mono(C.dim, 20)}>0.1</span>
              </div>
            </div>
          </div>
        ))}
        <Say at={12.6} style={{ marginTop: 6 }}>
          같은 방향이면 <M size={28} color={C.green}>b → 1 ÷ (1 − 0.9) = 10</M>
        </Say>
        <Say at={14.5} color={C.muted} size={22}>
          SGD 의 10 배 거리를 움직인다 · gradient 가 +1, −1 로 번갈아 오면 buffer 의 크기는 1 을 넘지 않는다
        </Say>
      </Box>
      <Box x={976} y={130} w={884} h={420} at={18.3} color={`${C.green}88`} title={<Head color={C.green}>Adam · 첫 step 에 움직이는 거리</Head>}>
        <Say at={18.6} color={C.muted} size={22}>
          parameter 마다 gradient 평균 m 과 제곱 평균 v 를 두고, m ÷ √v 에 η 를 곱해 뺀다
        </Say>
        <Bar label="gradient 0.02" value={1} max={1} color={C.green} at={19.6} width={380} labelW={200} fmt="η" />
        <Bar label="gradient 2" value={1} max={1} color={C.green} at={20.2} width={380} labelW={200} fmt="η" />
        <Bar label="gradient 200" value={1} max={1} color={C.green} at={20.8} width={380} labelW={200} fmt="η" />
        <Say at={22} color={C.muted} size={22}>
          gradient 를 자기 크기로 나눠서 크기와 상관없이 정확히 η · bias correction 을 빼면 3.16η
        </Say>
      </Box>
      <Box x={976} y={580} w={884} h={300} at={24.3} title={<Head>기본값</Head>}>
        <Table
          at={24.6}
          step={0.5}
          size={22}
          widths={[210, 120, 110, 350]}
          head={['', 'optimizer', 'η', '그 밖의 설정']}
          rows={[
            ['Adam 논문 · PyTorch', 'Adam', '0.001', 'β₁ 0.9 · β₂ 0.999 · ε 10⁻⁸'],
            ['LeRobot ACT', 'AdamW', '10⁻⁵', 'weight decay 10⁻⁴'],
            ['Diffusion Policy', 'Adam', '10⁻⁴', 'β₁ 0.95 · warmup 500'],
          ]}
          colors={[undefined, C.orange, undefined]}
        />
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S3: normalization and validation ----------

function Normalize() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={750} at={0.3} title={<Head>그대로 넣으면</Head>}>
        <Say at={0.6}>
          관절 각도 · radian · <M color={C.blue}>−3 ~ 3</M>
        </Say>
        <Say at={1.4}>
          집게 벌림 · mm · <M color={C.orange}>0 ~ 80</M>
        </Say>
        <Say at={3} color={C.muted} size={22}>
          weight 의 처음 크기는 입력이 1 안팎이라고 보고 정한다
        </Say>
        <Say at={6.5} style={{ marginTop: 12 }}>
          <M size={26}>z = w₁x₁ + w₂x₂</M>
        </Say>
        <Say at={6.9}>
          weight 의 gradient = z 의 gradient <M>0.1</M> × 입력
        </Say>
        <Bar label="집게 40 mm" value={4} max={4} color={C.orange} at={8} width={300} labelW={190} fmt="0.1 × 40 = 4" />
        <Bar label="관절 0.5 rad" value={0.05} max={4} color={C.blue} at={9} width={300} labelW={190} fmt="0.1 × 0.5 = 0.05" />
        <Say at={10.6} style={{ marginTop: 8 }}>
          <M size={28} color={C.red}>
            4 ÷ 0.05 = 80 배
          </M>
        </Say>
        <Say at={11.4} color={C.muted} size={22}>
          SGD 의 learning rate 하나를 두 weight 에 함께 맞추기 어렵다
        </Say>
      </Box>
      <Box x={976} y={130} w={884} h={420} at={13} color={`${C.green}88`} title={<Head color={C.green}>standardization · (값 − 평균) ÷ 표준편차</Head>}>
        <Say at={13.3} color={C.muted} size={22}>
          집게 · 평균 20 mm · 표준편차 25 mm
        </Say>
        <Say at={13.8}>
          <M color={C.orange}>(40 − 20) ÷ 25 = 0.8</M> → gradient <M color={C.orange}>0.08</M>
        </Say>
        <Say at={15.6} color={C.muted} size={22}>
          관절 · 평균 0.2 rad · 표준편차 0.5 rad
        </Say>
        <Say at={16}>
          <M color={C.blue}>(0.5 − 0.2) ÷ 0.5 = 0.6</M> → gradient <M color={C.blue}>0.06</M>
        </Say>
        <Say at={17.8} style={{ marginTop: 8 }}>
          두 입력이 모두 1 안팎 · gradient 도 0.08 과 0.06
        </Say>
      </Box>
      <Box x={976} y={580} w={884} h={300} at={20.5} gap={12} color={`${C.orange}88`} title={<Head color={C.orange}>LeRobot 의 통계 파일</Head>}>
        <Say at={20.8} size={23}>
          값마다 평균 · 표준편차 · 최솟값 · 최댓값
        </Say>
        <Say at={21.8} size={23}>
          ACT: 사진 · 관절 상태 · action 모두 standardization
        </Say>
        <Say at={22.6} size={23}>
          Diffusion Policy: 관절 상태 · action 을 min-max 로 −1 ~ 1
        </Say>
        <Say at={23.8} size={23} color={C.green}>
          policy 가 낸 action 을 되돌리려고 통계를 checkpoint 와 함께 저장
        </Say>
      </Box>
    </AbsoluteFill>
  )
}

function EarlyStop() {
  const t = useSec()
  const ep = [0, 20, 50, 111, 200, 500, 1000]
  const tr = [1.512, 0.685, 0.574, 0.313, 0.101, 0.022, 0.01]
  const va = [1.213, 0.401, 0.306, 0.208, 0.306, 0.321, 0.353]
  const X = (i: number) => 170 + i * 118
  const Y = (v: number) => 640 - (v / 1.6) * 470
  const path = (vs: number[]) => vs.map((v, i) => `${i ? 'L' : 'M'}${X(i)},${Y(v).toFixed(1)}`).join(' ')
  const draw = prog(t, 7, 2.5)
  return (
    <AbsoluteFill>
      <Card x={64} y={130} w={1060} h={750} at={0.3}>
        <svg width={1060} height={750}>
          <g opacity={prog(t, 6.6)}>
            <text x={30} y={44} fill={C.text} fontSize={24} fontWeight={600}>
              직접 해 본 실험 · sin 3x 위 12 점 + noise (표준편차 0.4)
            </text>
            <text x={30} y={78} fill={C.muted} fontSize={21}>
              ReLU MLP 1 → 32 → 32 → 1 · Adam (η = 0.005) · MSE · validation 은 따로 뽑은 60 점
            </text>
            <line x1={90} x2={130} y1={116} y2={116} stroke={C.blue} strokeWidth={4} />
            <text x={140} y={123} fill={C.blue} fontSize={21}>
              train loss
            </text>
            <line x1={300} x2={340} y1={116} y2={116} stroke={C.orange} strokeWidth={4} />
            <text x={350} y={123} fill={C.orange} fontSize={21}>
              validation loss
            </text>
            <line x1={80} x2={880} y1={640} y2={640} stroke={C.muted} strokeWidth={2} />
            <line x1={80} x2={80} y1={150} y2={640} stroke={C.muted} strokeWidth={2} />
            {[0, 0.5, 1, 1.5].map((v) => (
              <g key={v}>
                <text x={70} y={Y(v) + 7} textAnchor="end" fill={C.muted} fontSize={20} fontFamily={MONO}>
                  {v}
                </text>
              </g>
            ))}
            {ep.map((e, i) => (
              <text key={e} x={X(i)} y={672} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {e}
              </text>
            ))}
            <text x={80} y={712} fill={C.muted} fontSize={20}>
              epoch (간격은 비례하지 않음)
            </text>
          </g>
          <path d={path(tr)} fill="none" stroke={C.blue} strokeWidth={4} strokeDasharray={1600} strokeDashoffset={1600 * (1 - draw)} />
          <path d={path(va)} fill="none" stroke={C.orange} strokeWidth={4} strokeDasharray={1600} strokeDashoffset={1600 * (1 - draw)} />
          <g opacity={prog(t, 7.4)}>
            <circle cx={X(0)} cy={Y(tr[0])} r={6} fill={C.blue} />
            <circle cx={X(0)} cy={Y(va[0])} r={6} fill={C.orange} />
            <text x={X(0) - 14} y={Y(tr[0]) + 7} textAnchor="end" fill={C.blue} fontSize={20} fontFamily={MONO} fontWeight={600}>
              1.512
            </text>
            <text x={X(0) - 14} y={Y(va[0]) + 7} textAnchor="end" fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
              1.213
            </text>
          </g>
          <g opacity={prog(t, 9.5)}>
            <circle cx={X(6)} cy={Y(tr[6])} r={6} fill={C.blue} />
            <text x={X(6) + 16} y={Y(tr[6]) - 6} fill={C.blue} fontSize={20} fontFamily={MONO} fontWeight={600}>
              0.010
            </text>
          </g>
          <g opacity={prog(t, 12.8)}>
            <circle cx={X(3)} cy={Y(va[3])} r={9} fill={C.green} />
            <text x={X(3)} y={Y(va[3]) + 36} textAnchor="middle" fill={C.green} fontSize={20} fontFamily={MONO} fontWeight={600}>
              0.208
            </text>
            <circle cx={X(6)} cy={Y(va[6])} r={6} fill={C.orange} />
            <text x={X(6) + 16} y={Y(va[6]) + 7} fill={C.orange} fontSize={20} fontFamily={MONO} fontWeight={600}>
              0.353
            </text>
          </g>
          <g opacity={prog(t, 14.5)}>
            <text x={X(3)} y={250} textAnchor="middle" fill={C.green} fontSize={22} fontWeight={600}>
              epoch 111 에서 최저
            </text>
            <line x1={X(3)} x2={X(3)} y1={262} y2={Y(va[3]) - 52} stroke={C.green} strokeWidth={2} strokeDasharray="5 6" />
            <text x={X(5)} y={500} textAnchor="middle" fill={C.red} fontSize={22} fontWeight={600}>
              overfitting
            </text>
          </g>
        </svg>
      </Card>
      <Box x={1156} y={130} w={704} h={320} at={0.3} gap={12} title={<Head size={26}>데이터 나누기 · MNIST 예</Head>}>
        <div style={{ display: 'flex', gap: 4, height: 30 }}>
          <div style={{ width: 440, borderRadius: 6, background: C.blue }} />
          <div style={{ width: 88, borderRadius: 6, background: C.orange, opacity: prog(t, 1.6) }} />
          <div style={{ width: 88, borderRadius: 6, background: C.purple, opacity: prog(t, 3.2) }} />
        </div>
        <Say at={0.8} size={22}>
          <M color={C.blue} size={22}>train 50,000</M> 장 · parameter 를 고친다
        </Say>
        <Say at={1.6} size={22}>
          <M color={C.orange} size={22}>validation 10,000</M> 장 · 설정과 멈출 시점을 고른다
        </Say>
        <Say at={3.2} size={22}>
          <M color={C.purple} size={22}>test 10,000</M> 장 · 모든 선택이 끝난 뒤 한 번만
        </Say>
      </Box>
      <Box x={1156} y={470} w={704} h={190} at={18.5} color={`${C.green}88`} title={<Head size={26} color={C.green}>early stopping</Head>}>
        <Say at={18.8} size={22}>
          validation loss 가 가장 낮았던 parameter 를 저장해 두고, 한동안 더 내려가지 않으면 학습을 멈춘다
        </Say>
      </Box>
      <Box x={1156} y={680} w={704} h={200} at={24.5} gap={12} color={`${C.red}88`} title={<Head size={24} color={C.red}>robomimic · Square 작업 성공률</Head>}>
        <Bar label="가장 좋은 checkpoint" value={80.7} max={100} color={C.green} at={24.9} width={200} labelW={260} unit="%" />
        <Bar label="validation loss 최저" value={2.7} max={100} color={C.red} at={26} width={200} labelW={260} unit="%" />
      </Box>
    </AbsoluteFill>
  )
}

// ---------- S4: GPU memory ----------

function Memory() {
  const t = useSec()
  const items: [string, ReactNode, string, number][] = [
    ['parameter', '학습하는 숫자 자체', C.blue, 0.6],
    ['gradient', 'parameter 마다 하나', C.orange, 1.6],
    ['optimizer 의 값', 'Adam 은 parameter 마다 m, v', C.green, 2.6],
    ['activation', 'backward 에 다시 쓸 forward 중간값 · batch 크기에 비례', C.purple, 3.6],
  ]
  const blocks: [string, string][] = [
    ['parameter', C.blue],
    ['gradient', C.orange],
    ['m', C.green],
    ['v', C.green],
  ]
  // chart: 0..80 GB over 590 px, starting at x 250
  const X0 = 250
  const GX = (gb: number) => X0 + (gb / 80) * 590
  const bars: [string, number, string, string, number][] = [
    ['이 강의의 MNIST MLP', 0.0033, '약 3.3 MB', C.blue, 12.8],
    ['ACT · 약 8,000 만', 1.28, '1.28 GB', C.orange, 13.6],
    ['π0 · 약 33 억', 52.8, '52.8 GB', C.red, 20.8],
  ]
  const extra: [string, number, string, number][] = [
    ['π0 · 전체 학습', 70, '70 GB 넘게', 22.6],
    ['π0 · LoRA', 22.5, '22.5 GB 남짓', 23.4],
  ]
  const gpus: [string, number, number, number, 'start' | 'end'][] = [
    ['RTX 2080 Ti 11 GB', 11, 100, 13.8, 'start'],
    ['RTX 4090 24 GB', 24, 128, 21.2, 'start'],
    ['A100 80 GB', 80, 100, 21.6, 'end'],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={700} h={750} at={0.3} gap={10} title={<Head>학습 중 GPU memory 에 올라가는 것</Head>}>
        {items.map(([name, desc, color, at]) => (
          <div key={name} style={{ display: 'grid', gap: 2, opacity: prog(t, at) }}>
            <span style={{ ...line(color, 24), fontWeight: 600 }}>{name}</span>
            <span style={line(C.muted, 21)}>{desc}</span>
          </div>
        ))}
        <Say at={6.5} style={{ marginTop: 10 }}>
          float32 숫자 하나 <M>4 byte</M> · Adam 은 네 숫자
        </Say>
        <div style={{ display: 'flex', gap: 12, opacity: prog(t, 7.2) }}>
          {blocks.map(([n, color]) => (
            <div key={n} style={{ width: 136, height: 64, borderRadius: 12, border: `1.5px solid ${color}`, background: `${color}18`, display: 'grid', placeItems: 'center', alignContent: 'center', gap: 2 }}>
              <span style={{ fontSize: 21, fontWeight: 600, color }}>{n}</span>
              <span style={mono(C.muted, 19)}>4 byte</span>
            </div>
          ))}
        </div>
        <Say at={8.6}>
          parameter 하나에 <M color={C.green} size={28}>4 × 4 = 16 byte</M>
        </Say>
        <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
          <Say at={12.8}>
            <M color={C.blue} size={23}>203,530 × 16 ≈ 3.3 MB</M>
          </Say>
          <Say at={13.6}>
            <M color={C.orange} size={23}>8 × 10⁷ × 16 = 1.28 GB</M>
          </Say>
          <Say at={20.8}>
            <M color={C.red} size={23}>3.3 × 10⁹ × 16 = 52.8 GB</M>
          </Say>
        </div>
      </Box>
      <Card x={796} y={130} w={1064} h={750} at={12.5}>
        <svg width={1064} height={750}>
          <text x={28} y={46} fill={C.text} fontSize={24} fontWeight={600}>
            parameter · gradient · m · v 의 memory (float32)
          </text>
          {gpus.map(([name, gb, ly, at, anchor]) => (
            <g key={name} opacity={prog(t, at)}>
              <text x={anchor === 'start' ? GX(gb) + 8 : GX(gb) - 8} y={ly} textAnchor={anchor} fill={C.muted} fontSize={20}>
                {name}
              </text>
              <line x1={GX(gb)} x2={GX(gb)} y1={ly + 10} y2={372} stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" />
              <line x1={GX(gb)} x2={GX(gb)} y1={428} y2={560} stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" />
            </g>
          ))}
          {bars.map(([name, gb, s, color, at], i) => {
            const y = 180 + i * 72
            return (
              <g key={name} opacity={prog(t, at)}>
                <text x={X0 - 14} y={y + 8} textAnchor="end" fill={C.text} fontSize={21}>
                  {name}
                </text>
                <rect x={X0} y={y - 14} width={Math.max(4, GX(gb) - X0) * prog(t, at, 0.9)} height={28} rx={5} fill={color} />
                <text x={GX(80) + 16} y={y + 8} fill={color} fontSize={21} fontFamily={MONO} fontWeight={600}>
                  {s}
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 22.4)}>
            <line x1={28} x2={1036} y1={380} y2={380} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={28} y={414} fill={C.muted} fontSize={20}>
              openpi README 의 π0 학습에 필요한 memory
            </text>
          </g>
          {extra.map(([name, gb, s, at], i) => {
            const y = 456 + i * 64
            return (
              <g key={name} opacity={prog(t, at)}>
                <text x={X0 - 14} y={y + 8} textAnchor="end" fill={C.text} fontSize={21}>
                  {name}
                </text>
                <rect x={X0} y={y - 14} width={(GX(gb) - X0) * prog(t, at, 0.9)} height={28} rx={5} fill={`${C.pink}aa`} />
                <text x={GX(80) + 16} y={y + 8} fill={C.pink} fontSize={21} fontFamily={MONO} fontWeight={600}>
                  {s}
                </text>
              </g>
            )
          })}
          <g opacity={prog(t, 12.8)}>
            <line x1={X0} x2={GX(80)} y1={560} y2={560} stroke={C.muted} strokeWidth={2} />
            {[0, 40, 80].map((gb) => (
              <text key={gb} x={GX(gb)} y={588} textAnchor="middle" fill={C.muted} fontSize={20} fontFamily={MONO}>
                {gb} GB
              </text>
            ))}
          </g>
          <g opacity={prog(t, 16)}>
            <text x={28} y={648} fill={C.text} fontSize={21}>
              ACT 는 RTX 2080 Ti 에서 batch 8 로 학습 · 남는 memory 는 카메라 사진 같은 입력과 activation 몫
            </text>
          </g>
          <g opacity={prog(t, 24.5)}>
            <text x={28} y={690} fill={C.text} fontSize={21}>
              LoRA: weight 는 고정하고 덧붙인 작은 행렬만 학습 · gradient 와 m, v 도 그 몫만
            </text>
          </g>
        </svg>
      </Card>
    </AbsoluteFill>
  )
}

function Accumulate() {
  const t = useSec()
  const chip = (s: string, color: string) => (
    <span key={s + color} style={{ width: 64, height: 50, borderRadius: 10, border: `1.5px solid ${color}`, background: `${color}18`, display: 'grid', placeItems: 'center', ...mono(color, 22) }}>
      {s}
    </span>
  )
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={750} at={0.3} title={<Head>gradient 는 더해서 쌓인다</Head>}>
        <Say at={0.6}>autograd 는 새로 구한 gradient 를 parameter 에 저장된 값에 더한다</Say>
        <Say at={2.4} color={C.muted} size={22}>
          한 값이 여러 곳에 쓰이면 길마다 구한 gradient 를 더해야 해서 이렇게 만들었다
        </Say>
        <Say at={4.2} color={C.orange}>
          그래서 training loop 의 4 단계에서 gradient 를 0 으로 지운다
        </Say>
        <Say at={6.5} style={{ marginTop: 14 }}>
          SGD 두 step 의 예 · <M>w = 1</M> · <M>η = 0.1</M>
        </Say>
        <Table
          at={7}
          step={1}
          size={22}
          widths={[80, 150, 140, 220, 160]}
          head={['step', '이번 gradient', '지울 때 w', '안 지울 때 쓰는 값', '안 지울 때 w']}
          rows={[
            ['1', '0.5', '0.95', '0.5', '0.95'],
            ['2', '0.3', <span style={{ color: C.green }}>0.92</span>, '0.5 + 0.3 = 0.8', <span style={{ color: C.red }}>0.87</span>],
          ]}
        />
        <Say at={9.8} style={{ marginTop: 10 }}>
          <M color={C.green} size={24}>
            지울 때: 0.95 − 0.1 × 0.3 = 0.92
          </M>
        </Say>
        <Say at={11.2}>
          <M color={C.red} size={24}>
            안 지울 때: 0.95 − 0.1 × 0.8 = 0.87
          </M>
        </Say>
      </Box>
      <Box x={976} y={130} w={884} h={750} at={13.3} gap={16} color={`${C.green}88`} title={<Head color={C.green}>gradient accumulation</Head>}>
        <Say at={13.6} color={C.muted} size={22}>
          예로 든 sample 별 gradient −4, −2, 1, 1 의 batch 4 를 두 장씩 나누기
        </Say>
        <div style={{ display: 'grid', gap: 10, opacity: prog(t, 14.2) }}>
          <span style={line(C.text, 23)}>batch 4 한 번 · 한 번에 4 장</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {['−4', '−2', '1', '1'].map((s, i) => (
              <span key={i}>{chip(s, C.blue)}</span>
            ))}
            <span style={{ marginLeft: 16, ...mono(C.blue, 23) }}>(−4 − 2 + 1 + 1) ÷ 4 = −1</span>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10, marginTop: 10, opacity: prog(t, 16) }}>
          <span style={line(C.text, 23)}>batch 2 두 번 · loss 를 2 로 나눔 · 한 번에 2 장</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {chip('−4', C.orange)}
            {chip('−2', C.orange)}
            <span style={{ ...mono(C.orange, 22), marginLeft: 6 }}>평균 −3</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', opacity: prog(t, 17.4) }}>
            {chip('1', C.purple)}
            {chip('1', C.purple)}
            <span style={{ ...mono(C.purple, 22), marginLeft: 6 }}>평균 1</span>
          </div>
        </div>
        <Say at={20.5} style={{ marginTop: 6 }}>
          쌓인 gradient <M color={C.green} size={28}>−3 ÷ 2 + 1 ÷ 2 = −1</M>
        </Say>
        <div style={{ display: 'grid', gap: 8, marginTop: 8, borderTop: `1.5px solid ${C.cardEdge}`, paddingTop: 14 }}>
          <Say at={22.4} size={23}>
            memory: activation 이 두 장 분량만 올라간다
          </Say>
          <Say at={23.6} size={23}>
            시간: step 하나에 forward 와 backward 를 두 번 한다
          </Say>
          <Say at={25} size={22} color={C.muted}>
            LeRobot 의 학습 설정에도 gradient accumulation 항목이 있다
          </Say>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'step 과 epoch', color: C.accent, text: 'forward → loss → backward → update · 20,000 ÷ 8 = 2,500 step · 40 epoch', at: 0.8 },
    { tag: 'loss 와 optimizer', color: C.blue, text: 'gradient = p − onehot · −0.341, 0.242, 0.099 · Adam 첫 step 은 η', at: 4.4 },
    { tag: 'normalization 과 검증', color: C.orange, text: '(40 − 20) ÷ 25 = 0.8 · validation 최저 0.208 · 성공률 80.7% 대 2.7%', at: 8.4 },
    { tag: 'GPU memory', color: C.red, text: 'parameter 하나 16 byte · ACT 1.28 GB · π0 52.8 GB · batch 4 = 2 장 × 2 번', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            그 한 번의 계산에서 GPU 는 무엇을 계산하고, optimizer 는 parameter 를 어떻게 고칠까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
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
            NEXT · FOUNDATIONS
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>CNN · Transformer · VAE</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={32}>
            가까운 pixel 끼리 묶기 · 입력 조각끼리 서로 참고하기 · 숫자 몇 개로 압축했다 되살리기
          </Label>
        </Appear>
        <Appear at={3.7}>
          <Label color={C.text} size={32}>
            같은 training loop 를 쓰는 강의 · Behavior Cloning · Policy Gradient · DQN → SAC
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/pytorch-mlp (Robbins–Monro · Adam · He 초기화 · robomimic 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseEpoch = () => (
  <PauseWrite
    question="시연 frame 12,000 개를 batch 크기 8 로 학습하면 epoch 하나는 몇 step 이고, 30,000 step 은 몇 epoch 일까?"
    answer={
      <>
        epoch 하나: 12,000 ÷ 8 = 1,500 step
        <br />
        30,000 step: 30,000 ÷ 1,500 = 20 epoch
      </>
    }
  />
)

const PauseAdam = () => (
  <PauseWrite
    question="Adam 의 첫 step 에서 gradient 가 −4 이고 η = 0.01 이면 parameter 는 어느 쪽으로 얼마나 움직일까?"
    answer={
      <span style={{ fontSize: 32 }}>
        m = 0.1 × (−4) = −0.4 · v = 0.001 × 16 = 0.016
        <br />
        bias correction: −0.4 ÷ 0.1 = −4 · 0.016 ÷ 0.001 = 16 · √16 = 4
        <br />
        θ − 0.01 × (−4) ÷ 4 = θ + 0.01 → gradient 가 음수라 0.01 커진다
      </span>
    }
  />
)

const PauseStd = () => (
  <PauseWrite
    question="평균 0.2 rad, 표준편차 0.5 rad 인 관절이 −0.3 rad 이면 standardization 한 값은?"
    answer={
      <>
        (−0.3 − 0.2) ÷ 0.5 = −0.5 ÷ 0.5 = −1
        <br />
        평균보다 표준편차 하나만큼 작다
      </>
    }
  />
)

const PauseMemory = () => (
  <PauseWrite
    question="parameter 가 10 억 개인 모델을 float32 Adam 으로 학습하면 parameter · gradient · m · v 에만 memory 가 얼마나 들까?"
    answer={
      <>
        parameter 하나에 4 byte 숫자 네 개 → 16 byte
        <br />
        10⁹ × 16 = 1.6 × 10¹⁰ byte = 16 GB · activation 은 따로 더 든다
      </>
    }
  />
)

export function PytorchMlp() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        loop: Loop,
        epoch: Epoch,
        'pause-epoch': PauseEpoch,
        softmax: Softmax,
        optimizer: Optimizer,
        'pause-adam': PauseAdam,
        normalize: Normalize,
        'early-stop': EarlyStop,
        'pause-std': PauseStd,
        memory: Memory,
        accumulate: Accumulate,
        'pause-memory': PauseMemory,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
