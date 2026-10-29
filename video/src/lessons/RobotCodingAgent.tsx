import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Misconception, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './robot-coding-agent.narration.json'
import { script } from './robot-coding-agent.script'

// Numbers follow lessons/robot-coding-agent/README.md (see robot-coding-agent.script.ts). The ray drawing's block height and
// the two-view drawing are schematic (heights exaggerated, marked 모식도); every number on screen is the lesson's.

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
      <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 999, border: `1.5px solid ${color}77`, background: `${color}14`, color, fontSize: 24, fontWeight: 600, fontFamily: mono ? MONO : undefined }}>
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

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            FRONTIER · ROBOT CODING AGENT
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Robot Coding Agent</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            HexaShell · <span style={{ color: C.accent }}>a thin harness</span> for a VLM coding agent
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            시연도 학습도 없이, 명령줄 하나와 사진 세 장으로 로봇을 다루는 coding agent
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

function Question() {
  const t = useSec()
  const rates: [string, number, string][] = [
    ['VPP2 (학습한 policy)', 32.3, C.blue],
    ['GPT-6-Astra · 고정 harness', 22.5, C.red],
    ['GPT-6-Astra · HexaShell', 46.9, C.green],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1792} h={300}>
        <div style={{ padding: '26px 32px', display: 'grid', gap: 22 }}>
          <Label size={24}>소프트웨어 저장소에서 일하는 coding agent</Label>
          <Flow steps={['코드 실행', '에러 읽기', '고치기']} color={C.blue} at={0.6} last="→ 고친 코드가 저장소에 남는다" />
          <div style={{ opacity: prog(t, 4.6) }}>
            <Label size={24}>로봇에서도 같은 방식으로?</Label>
          </div>
          <Flow steps={['사진 보기', '명령 실행', '실패 읽기', 'tool 고치기']} color={C.orange} at={4.8} gap={0.4} last="→ tool 이 남는다 · 시연 ✕ 학습 ✕" />
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 470, width: 1792 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          시연이나 학습 없이 <span style={{ color: C.accent }}>얼마나 잘하게 되고, 어디서 막힐까?</span>
        </div>
      </Appear>
      <Panel x={330} y={610} w={1260} h={270}>
        <div style={{ padding: '22px 30px', display: 'grid', gap: 14, opacity: prog(t, 6) }}>
          <Label size={22}>RoboDojo 성공률 (작업 42 개 · leaderboard 2026-10-20)</Label>
          {rates.map(([n, v, c], i) => (
            <Bar key={n} label={n} value={v} max={60} color={c} at={6.2 + i * 0.5} width={520} unit="%" labelW={330} />
          ))}
        </div>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- thin harness ----------

function Harness() {
  const t = useSec()
  const cmds: [string, string, boolean][] = [
    ['obs · status', '사진·상태를 새로 받기 / 마지막 결과 다시 보기', false],
    ['move', 'TCP 를 세상 좌표축을 따라 옮김 · 축마다 최대 0.20 m', true],
    ['rotate', 'TCP 를 중심으로 gripper 를 돌림 · 축마다 최대 90°', true],
    ['point', 'gripper 방향(아래·앞·45°)과 손가락이 벌어지는 축', true],
    ['gripper · home · wait', '열고 닫기 · 처음 자세 · 최대 5 초 기다리기', true],
    ['done', 'episode 를 끝냄', false],
  ]
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 64, top: 140, display: 'flex', gap: 16 }}>
        <Chip at={0.5}>harness = 명령을 관절 움직임으로 옮긴다</Chip>
        <Chip at={1.6} color={C.red}>무엇을 할지는 정하지 않는다</Chip>
        <Chip at={5.7} color={C.muted}>고치지 않은 Codex 명령줄 agent · container 안 (network ✕ · API key ✕)</Chip>
      </div>
      <Box x={64} y={215} w={780} h={440} at={5.9} title={<Head color={C.accent}>agent 가 받는 것 셋</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['robo', '실행 파일 하나 · 로봇을 다루는 유일한 길', 6.4],
            ['obs/', '요청할 때마다 새로 채워지는 폴더', 7.2],
            ['설명서', '60 줄 남짓 · 좌표축 · 명령 · 출력 · pixel 을 ray 로 바꾸는 식', 8.2],
          ].map(([a, b, at]) => (
            <div key={a as string} style={{ display: 'flex', gap: 18, alignItems: 'baseline', opacity: prog(t, at as number) }}>
              <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 600, color: C.accent, width: 150 }}>{a}</span>
              <span style={line()}>{b}</span>
            </div>
          ))}
          <div style={{ marginTop: 2, padding: '12px 18px', borderRadius: 14, background: C.bg, border: `1.5px solid ${C.cardEdge}`, display: 'grid', gap: 5, opacity: prog(t, 11.7) }}>
            <Label size={22} color={C.muted}>
              obs/ 안에
            </Label>
            {[
              ['머리 + 양쪽 손목 카메라의 640×480 RGB 사진 3 장', 11.9],
              ['카메라마다 intrinsics 와 세상 좌표의 pose', 13.2],
              ['두 팔의 TCP pose 와 관절 각도', 14.3],
            ].map(([s, at]) => (
              <span key={s as string} style={{ ...line(C.text, 22), opacity: prog(t, at as number) }}>
                · {s}
              </span>
            ))}
            <span style={{ ...line(C.red, 22), fontWeight: 600, opacity: prog(t, 15.5) }}>✕ depth 사진은 없다</span>
          </div>
        </div>
      </Box>
      <Box x={876} y={215} w={980} h={440} at={17} title={<Head color={C.accent}>명령 아홉 개</Head>}>
        <div style={{ display: 'grid', gap: 9 }}>
          {cmds.map(([c, d, costs], i) => (
            <div key={c} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 17.4 + i * 0.5) }}>
              <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, color: C.text, width: 300, whiteSpace: 'nowrap' }}>{c}</span>
              <span style={{ ...line(C.muted, 22), flex: 1 }}>{d}</span>
              <span style={{ fontSize: 22, fontWeight: 600, color: costs ? C.orange : C.green, width: 130, textAlign: 'right' }}>{costs ? 'step 씀' : 'step 안 씀'}</span>
            </div>
          ))}
        </div>
      </Box>
      <Box x={64} y={680} w={1792} h={200} at={22.6} title={<Head color={C.accent}>server: 명령 하나가 action 이 되기까지</Head>}>
        <Flow steps={['robo move left --dy 0.10', '검사', '2 cm 간격 → 0.10 ÷ 0.02 = 5 구간', 'waypoint 마다 cuRobo IK', '사다리꼴 속도 → 1초에 25 번 action']} color={C.blue} at={22.9} gap={0.55} />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 26.5) }}>돌아오는 것: JSON 결과(plan_ok · 안 된 이유 · 도달한 pose 의 오차 · 남은 시간과 명령 수) + 사진 3 장 · motion planner 와 물체 충돌 검사는 없다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Steps() {
  const t = useSec()
  const sx = (s: number) => 60 + (s / 1900) * 820
  const marks: [number, string, string][] = [
    [200, '최소 200', C.muted],
    [600, 'push T 600', C.orange],
    [1100, 'tic tac toe 1100', C.muted],
    [1900, '최대 1900', C.muted],
  ]
  const rules: [string, string][] = [
    ['harness 는 옮기기만', '결정 ✕'],
    ['container 에', 'simulator · 작업 정의 · 채점 코드 ✕'],
    ['성공 판정은', 'benchmark 의 checker 만'],
    ['설명서에는', 'interface 만 · 전략은 tool 에'],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={470}>
        <svg width={1000} height={470}>
          <text x={30} y={48} fill={C.text} fontSize={28} fontWeight={600} opacity={prog(t, 0.3)}>
            작업마다 action step 한도
          </text>
          <line x1={sx(0)} x2={sx(1900)} y1={130} y2={130} stroke={C.muted} strokeWidth={3} opacity={prog(t, 0.6)} />
          {marks.map(([s, l, c], i) => (
            <g key={s} opacity={prog(t, 0.8 + i * 0.4)}>
              <line x1={sx(s)} x2={sx(s)} y1={118} y2={142} stroke={c} strokeWidth={3} />
              <text x={sx(s)} y={176} textAnchor={i === 3 ? 'end' : i === 0 ? 'start' : 'middle'} fill={c} fontSize={22} fontFamily={MONO}>
                {l}
              </text>
            </g>
          ))}
          <text x={30} y={238} fill={C.orange} fontSize={28} fontFamily={MONO} fontWeight={600} opacity={prog(t, 2.6)}>
            600 ÷ 25 = 24 초
          </text>
          <text x={320} y={238} fill={C.muted} fontSize={22} opacity={prog(t, 2.6)}>
            action 1초에 25 번 → step 수 ÷ 25 = 로봇 시간
          </text>
          <g opacity={prog(t, 5.9)}>
            <text x={30} y={300} fill={C.text} fontSize={26} fontWeight={600}>
              step 이 드는 것은 실행한 action 뿐
            </text>
            {[
              ['사진 보기', false],
              ['측정', false],
              ['모델의 생각', false],
              ['action 실행', true],
            ].map(([s, yes], i) => (
              <g key={s as string} opacity={prog(t, 6.3 + i * 0.5)}>
                <rect x={30 + i * 235} y={330} width={215} height={64} rx={12} fill={yes ? `${C.orange}22` : C.bg} stroke={yes ? C.orange : C.cardEdge} strokeWidth={1.5} />
                <text x={137 + i * 235} y={370} textAnchor="middle" fill={yes ? C.orange : C.muted} fontSize={24} fontWeight={600}>
                  {s as string} {yes ? '· 1 step' : '· 0 step'}
                </text>
              </g>
            ))}
            <text x={30} y={440} fill={C.dim} fontSize={22} opacity={prog(t, 8.6)}>
              simulation 은 명령이 실행되는 동안에만 흐른다
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={470} at={10.8} title={<Head color={C.accent}>다시 잰 episode 하나의 시간 (중앙값)</Head>}>
        <div style={{ display: 'grid', gap: 18, marginTop: 10 }}>
          <Bar label="로봇 시간" value={26} max={760} color={C.green} at={11.2} width={300} unit=" 초" labelW={160} />
          <Bar label="실제 시간" value={739} max={760} color={C.red} at={12.4} width={300} unit=" 초" labelW={160} />
          <div style={{ opacity: prog(t, 14.4) }}>
            <Label color={C.text} size={26}>
              739 ÷ 26 ≈ <span style={{ fontFamily: MONO, color: C.red, fontWeight: 600 }}>28 배</span> · 거의 모두 모델의 응답을 기다린 시간
            </Label>
          </div>
          <div style={{ opacity: prog(t, 15.2) }}>
            <Label size={22}>simulation 은 생각하는 동안 멈추지만, 실물 장면에서는 그동안에도 시간이 흐른다</Label>
          </div>
        </div>
      </Box>
      <div style={{ position: 'absolute', left: 64, top: 650, width: 1792, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {rules.map(([a, b], i) => (
          <Appear key={a} at={16.6 + i * 1.1}>
            <div style={{ height: 200, padding: '22px 26px', borderRadius: 18, background: C.card, border: `1.5px solid ${C.accent}55`, display: 'grid', alignContent: 'start', gap: 10 }}>
              <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 600, color: C.accent }}>{i + 1}</span>
              <Label color={C.text} size={26} weight={600}>
                {a}
              </Label>
              <Label size={24}>{b}</Label>
            </div>
          </Appear>
        ))}
      </div>
    </AbsoluteFill>
  )
}

// ---------- ray and plane ----------

function Ray() {
  const t = useSec()
  const cam = { x: 230, y: 110 }
  const tableY = 640
  const blockTop = tableY - 70 // 15 mm, exaggerated
  const hit = { x: cam.x + 400, y: tableY } // forward 0.400 m at the table
  const k = (blockTop - cam.y) / (tableY - cam.y)
  const hitB = { x: cam.x + 400 * k, y: blockTop } // where the drawn ray crosses the block top
  const grow = prog(t, 6.2, 1.6)
  const rayEnd = { x: cam.x + (hit.x - cam.x) * grow, y: cam.y + (hit.y - cam.y) * grow }
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1000} h={740}>
        <svg width={1000} height={740}>
          <text x={30} y={46} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            pixel + calibration = ray 하나 · 어디서 멈추는지는 모른다
          </text>
          <text x={970} y={46} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도 · 블록 높이 과장
          </text>
          {/* table */}
          <g opacity={prog(t, 5.2)}>
            <line x1={60} x2={940} y1={tableY} y2={tableY} stroke={C.muted} strokeWidth={4} />
            <text x={60} y={tableY - 14} fill={C.muted} fontSize={22}>
              탁자 면 (높이를 아는 평면)
            </text>
          </g>
          {/* camera */}
          <g opacity={prog(t, 0.6)}>
            <rect x={cam.x - 28} y={cam.y - 20} width={56} height={40} rx={8} fill={C.card} stroke={C.accent} strokeWidth={3} />
            <circle cx={cam.x} cy={cam.y} r={9} fill={C.accent} />
            <text x={cam.x + 44} y={cam.y + 8} fill={C.accent} fontSize={24} fontWeight={600}>
              카메라
            </text>
          </g>
          <g opacity={prog(t, 5.4)}>
            <line x1={cam.x - 60} x2={cam.x - 60} y1={cam.y} y2={tableY} stroke={C.dim} strokeWidth={2} strokeDasharray="8 8" />
            <text x={cam.x - 72} y={(cam.y + tableY) / 2} textAnchor="end" fill={C.muted} fontSize={24} fontFamily={MONO}>
              0.60 m
            </text>
            <line x1={cam.x} x2={hit.x} y1={tableY + 62} y2={tableY + 62} stroke={C.dim} strokeWidth={2} strokeDasharray="8 8" />
            <text x={cam.x + 40} y={tableY + 92} fill={C.muted} fontSize={24} fontFamily={MONO}>
              앞으로 0.400 m
            </text>
          </g>
          {/* the ray, then the table hit */}
          <line x1={cam.x} y1={cam.y} x2={rayEnd.x} y2={rayEnd.y} stroke={C.blue} strokeWidth={5} strokeLinecap="round" opacity={prog(t, 1)} />
          <g opacity={prog(t, 8)}>
            <circle cx={hit.x} cy={hit.y} r={11} fill={C.blue} />
            <text x={hit.x + 16} y={hit.y + 34} fill={C.blue} fontSize={24} fontWeight={600}>
              탁자 면과 만남 · 0.400 m
            </text>
          </g>
          {/* the block and the wrong position */}
          <g opacity={prog(t, 10.7)}>
            <rect x={hitB.x - 150} y={blockTop} width={250} height={tableY - blockTop} rx={6} fill={`${C.green}22`} stroke={C.green} strokeWidth={2.5} />
            <text x={hitB.x - 140} y={blockTop + 44} fill={C.green} fontSize={22} fontWeight={600}>
              블록 · 탁자 + 15 mm
            </text>
            <circle cx={hitB.x} cy={hitB.y} r={11} fill={C.green} />
            <text x={hitB.x + 22} y={blockTop - 18} fill={C.green} fontSize={24} fontWeight={600}>
              실제 점 · 0.390 m
            </text>
          </g>
          <g opacity={prog(t, 13.8)}>
            <line x1={hitB.x} x2={hit.x} y1={tableY + 12} y2={tableY + 12} stroke={C.red} strokeWidth={6} />
            <text x={hitB.x - 16} y={tableY + 40} textAnchor="end" fill={C.red} fontSize={26} fontWeight={700}>
              탁자 높이를 쓰면 10 mm 밀림
            </text>
          </g>
          <g opacity={prog(t, 11.5)}>
            <rect x={540} y={100} width={430} height={160} rx={14} fill={C.bg} stroke={C.cardEdge} strokeWidth={1.5} />
            <text x={560} y={138} fill={C.muted} fontSize={22}>
              블록 윗면까지 내려가는 거리
            </text>
            <text x={560} y={174} fill={C.text} fontSize={26} fontFamily={MONO}>
              0.600 − 0.015 = 0.585 m
            </text>
            <text x={560} y={214} fill={C.muted} fontSize={22}>
              앞으로 간 거리
            </text>
            <text x={560} y={248} fill={C.text} fontSize={26} fontFamily={MONO}>
              0.585 × 0.40 ÷ 0.60 = 0.390 m
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1096} y={140} w={760} h={330} at={16.7} title={<Head color={C.orange}>push T 의 실제 시도</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={{ ...line(), opacity: prog(t, 17.2) }}>
            블록 윗면 <span style={{ fontFamily: MONO, color: C.green }}>0.780 m</span> 대신 탁자 높이 <span style={{ fontFamily: MONO, color: C.red }}>0.765 m</span> 를 씀
          </span>
          <span style={{ ...line(), opacity: prog(t, 18.4) }}>
            높이 오차 15 mm → 블록 윤곽 <span style={{ fontFamily: MONO, color: C.red, fontWeight: 600 }}>10 mm</span> 밀림 → episode 실패
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 19.6) }}>같은 ray 라서 높이 오차 × 0.40 ÷ 0.60 만큼 위치가 틀린다 · 원인과 수리는 뒤에서</span>
        </div>
      </Box>
      <Box x={1096} y={500} w={760} h={380} at={22.3} title={<Head color={C.accent}>table_plane · plane sweep</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 22.6) }}>후보 높이마다 한 카메라 사진을 그 평면을 거쳐 다른 카메라 시점으로 옮기고(warp), 가장 잘 겹치는 높이를 고른다 · step 0</span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 25.4) }}>
            <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 600, color: C.green }}>0.7646 ~ 0.7656 m</span>
            <span style={line(C.text)}>카메라 세 쌍이 1 mm 안에서 일치</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, 27.6) }}>
            <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 600, color: C.red }}>0.74 m</span>
            <span style={line(C.text)}>설명서의 값 · 그대로 쓰면 25 mm 틀린다</span>
          </div>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- the second view ----------

function TwoView() {
  const t = useSec()
  const head = { x: 90, y: 90 }
  const wrist = { x: 740, y: 130 }
  const P = { x: 470, y: 330 }
  const est1 = { x: P.x + 60, y: P.y - 40 } // one-camera estimate, off along the ray (schematic)
  const g1 = prog(t, 1, 1.4)
  const g2 = prog(t, 11.8, 1.2)
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={900} h={430}>
        <svg width={900} height={430}>
          <text x={30} y={40} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            두 ray 가 가장 가까워지는 곳 = triangulation
          </text>
          <text x={870} y={40} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 0.3)}>
            모식도
          </text>
          {[
            [head, '머리 카메라', C.blue, 0.6],
            [wrist, '오른쪽 손목 카메라', C.orange, 11.5],
          ].map(([p, name, c, at]) => {
            const q = p as { x: number; y: number }
            return (
              <g key={name as string} opacity={prog(t, at as number)}>
                <rect x={q.x - 26} y={q.y - 18} width={52} height={36} rx={8} fill={C.card} stroke={c as string} strokeWidth={3} />
                <text x={q.x} y={q.y + 46} textAnchor="middle" fill={c as string} fontSize={22} fontWeight={600}>
                  {name as string}
                </text>
              </g>
            )
          })}
          {/* mallet head */}
          <g opacity={prog(t, 5.6)}>
            <circle cx={P.x} cy={P.y} r={22} fill={`${C.green}33`} stroke={C.green} strokeWidth={3} />
            <text x={P.x + 36} y={P.y + 12} fill={C.green} fontSize={22}>
              손에 든 말렛 머리
            </text>
          </g>
          <line x1={head.x} y1={head.y} x2={head.x + (est1.x - head.x) * g1 * 1.25} y2={head.y + (est1.y - head.y) * g1 * 1.25} stroke={C.blue} strokeWidth={4} strokeLinecap="round" opacity={prog(t, 1)} />
          <g opacity={prog(t, 7.4)}>
            <circle cx={est1.x} cy={est1.y} r={9} fill={C.red} />
            <text x={30} y={372} fill={C.red} fontSize={24} fontWeight={700}>
              ● 카메라 하나 · 반지름으로 어림 → 22.9 mm 어긋남 · 여덟 번 쳤지만 checker 는 0 개
            </text>
          </g>
          <line x1={wrist.x} y1={wrist.y} x2={wrist.x + (P.x - wrist.x) * g2 * 1.1} y2={wrist.y + (P.y - wrist.y) * g2 * 1.1} stroke={C.orange} strokeWidth={4} strokeLinecap="round" opacity={prog(t, 11.8)} />
          <g opacity={prog(t, 13.6)}>
            <circle cx={P.x} cy={P.y} r={10} fill={C.accent} />
            <text x={P.x - 30} y={P.y - 36} textAnchor="end" fill={C.accent} fontSize={24} fontWeight={700}>
              두 view → 2.7 mm · ray 사이 0.7 mm
            </text>
            <text x={30} y={404} fill={C.text} fontSize={24}>
              play Xylophone · 고친 뒤 500 step 중 377 번째 step 에 성공
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={996} y={140} w={860} h={430} at={17.2} title={<Head color={C.red}>monocular depth network 로 재면?</Head>}>
        <div style={{ display: 'grid', gap: 16, marginTop: 6 }}>
          <Label size={22}>Depth Anything V2 · 탁자로 scale 을 맞춘 뒤 물체 pixel 의 depth 오차 중앙값</Label>
          <Bar label="머리 카메라" value={41} max={110} color={C.orange} at={18.2} width={360} unit=" mm" labelW={180} />
          <Bar label="손목 카메라" value={100} max={110} color={C.red} at={19.2} width={360} fmt="약 100" unit=" mm" labelW={180} />
          <Bar label="grasp 에 필요" value={10} max={110} color={C.green} at={20.6} width={360} fmt="약 10" unit=" mm" sub="1 cm 안팎" labelW={180} />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.6) }}>geometry 로 재면 이런 하한이 없다: 평면이나 두 view 라는 가정이 맞으면 오차는 calibration 과 pixel 에서만 온다</span>
        </div>
      </Box>
      <Box x={64} y={600} w={900} h={280} at={23.2} title={<Head color={C.accent}>개발용 장면의 점수 (leaderboard 방식)</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar label="triangulation (RGB 만)" value={38.3} max={60} color={C.green} at={23.6} width={260} />
          <Bar label="Depth Anything V2" value={29.6} max={60} color={C.red} at={24.3} width={260} sub="8.7 점 차이 · 장면 57 대 23" />
          <Bar label="simulator 가 그린 depth" value={48.8} max={60} color={C.muted} at={25.6} width={260} sub="표준 관측에 없음" />
        </div>
      </Box>
      <Box x={996} y={600} w={860} h={280} at={28.2} title={<Head color={C.orange}>두 번째 view 의 비용 · 보는 움직임 (active perception)</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <Bar label="실행한 step 중" value={3.6} max={5} color={C.orange} at={28.6} width={240} unit="%" sub="depth network 판 0.7%" />
          <Bar label="보는 움직임이 있는 episode" value={43} max={50} color={C.orange} at={29.8} width={240} unit="%" sub="depth network 판 10%" />
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 31) }}>팔을 움직여야 손목 카메라가 보니 step 한도를 쓴다 · 큰 tool 안의 보는 단계는 세지 않은 최소값</span>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- the repair loop ----------

function Loop() {
  const t = useSec()
  const node = (x: number, y: number, w: number, h: number, title: string, sub: string, color: string, at: number) => (
    <g opacity={prog(t, at)}>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={`${color}14`} stroke={color} strokeWidth={2.5} />
      <text x={x + w / 2} y={y + 40} textAnchor="middle" fill={color} fontSize={26} fontWeight={700}>
        {title}
      </text>
      <text x={x + w / 2} y={y + 72} textAnchor="middle" fill={C.muted} fontSize={21}>
        {sub}
      </text>
    </g>
  )
  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, at: number, label?: string) => (
    <g opacity={prog(t, at)}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} />
      <circle cx={x2} cy={y2} r={6} fill={color} />
      {label && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 12} textAnchor="middle" fill={color} fontSize={22} fontWeight={600}>
          {label}
        </text>
      )}
    </g>
  )
  const stats: [string, string, number][] = [
    ['6.3 분', '실패 뒤 수리 한 번 (중앙값) · 90% 가 11 분 안', 23.4],
    ['16 개', '한 round 의 shell 명령 · 92% 가 unit test 실행', 24.6],
    ['+118 / −6 줄', '수정 한 번에 더한 줄과 지운 줄 (중앙값)', 25.8],
    ['769 round', '남은 것: 명령 327 개 · Python 약 78,000 줄', 27],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1180} h={740}>
        <svg width={1180} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            수리 loop · seed 0 의 장면 10 개를 차례로
          </text>
          {node(40, 90, 330, 96, 'acting agent', '지금의 tool 로 episode 하나', C.accent, 0.6)}
          {node(760, 90, 380, 96, 'playbook.md', '성공: 어떤 tool 이 왜 통했는지', C.green, 1.8)}
          {arrow(370, 138, 760, 138, C.green, 1.6, '성공')}
          {arrow(205, 186, 205, 300, C.red, 11.2, '실패')}
          {node(40, 300, 560, 150, 'optimizer agent', '명령 기록 · 명령마다 찍은 사진 · tool 코드를 읽고', C.orange, 11.4)}
          <text x={320} y={428} textAnchor="middle" fill={C.orange} fontSize={22} opacity={prog(t, 13.4)}>
            skill.md 에 진단 → tool + unit test 를 쓰거나 고침
          </text>
          {arrow(600, 375, 700, 375, C.orange, 14.4)}
          {node(700, 330, 440, 96, '배달 검사', '파일 다 있나 · tool 이 불러와지나 · 설명에 작업·물체 이름 없나', C.purple, 17.2)}
          {arrow(920, 426, 920, 500, C.red, 18.4, '통과 못 함 → 수정 되돌림')}
          {arrow(700, 360, 370, 160, C.accent, 19.4, '통과 → 같은 장면 다시 (수정 5 번까지)')}
          {node(40, 540, 1100, 96, '열 번째 장면 뒤: tool 고정 (freeze)', 'optimizer 없이 개발용 장면 10 개 + 새 장면 10 개에서 다시 잰다', C.blue, 21)}
          <text x={40} y={700} fill={C.dim} fontSize={22} opacity={prog(t, 22)}>
            optimizer 는 그 작업의 폴더에만 쓴다 · harness · 설명서 · 공용 tool 은 건드리지 못한다
          </text>
        </svg>
      </Panel>
      <Box x={1276} y={140} w={580} h={300} at={5.7} title={<Head color={C.accent}>tool = tool.py + interface.md</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            ['✓ 관절 각도 · TCP pose', C.green, 6.2],
            ['✓ calibration 이 붙은 사진 3 장', C.green, 6.8],
            ['✓ 기본 명령과 같은 움직임 함수', C.green, 7.4],
            ['✕ simulator import · 물체 pose', C.red, 8.6],
            ['측정만 하는 명령은 step 0', C.muted, 9.6],
          ].map(([s, c, at]) => (
            <span key={s as string} style={{ ...line(c as string, 23), opacity: prog(t, at as number) }}>
              {s as string}
            </span>
          ))}
        </div>
      </Box>
      <Box x={1276} y={465} w={580} h={415} at={23} title={<Head color={C.accent}>모든 작업을 합하면</Head>}>
        <div style={{ display: 'grid', gap: 8 }}>
          {stats.map(([big, s, at]) => (
            <div key={big} style={{ display: 'grid', gap: 2, opacity: prog(t, at) }}>
              <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 600, color: C.orange }}>{big}</span>
              <span style={line(C.muted, 20)}>{s}</span>
            </div>
          ))}
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function PushT() {
  const t = useSec()
  const steps: [string, string, number][] = [
    ['높이 명령이 요청 10 번을 모두 거부', '두 view 의 넓이가 너무 다르다며', 0.6],
    ['agent 는 탁자 높이 0.765 m 를 대신 씀', '블록 윗면은 0.780 m → 윤곽 10 mm 밀림', 2.8],
    ['첫 놓기: 표시에서 3.2 mm · 한계 7 mm 안', '그러나 놓기 전 검사도 같은 틀린 높이로 12.5 mm 라고 잼', 6.4],
    ['세 번 다시 놓다가 13.6 mm 어긋난 채 멈춤', 'episode 실패', 9.6],
  ]
  const after: [string, number][] = [
    ['높이 명령이 0.780 m 를 냄 → 블록은 표시에서 3.0 mm', 27.6],
    ['600 step 중 354 번째 step 에 성공', 29],
    ['tool 고정 뒤 개발용 장면 10 개 모두 성공 (depth network 판은 4 개)', 30.4],
  ]
  const cell = 15
  const grid = (x: number, y: number, n: number, pix: number, color: string, at: number) =>
    Array.from({ length: (n / pix) * (n / pix) }, (_, i) => {
      const r = Math.floor(i / (n / pix))
      const c = i % (n / pix)
      return <rect key={i} x={x + c * pix * cell + 1} y={y + r * pix * cell + 1} width={pix * cell - 2} height={pix * cell - 2} rx={2} fill={color} opacity={0.75 * prog(t, at + i * 0.004, 0.4)} />
    })
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={900} h={430} at={0.3} title={<Head color={C.red}>push T · 실패한 시도</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          {steps.map(([a, b, at], i) => (
            <div key={a} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ fontFamily: MONO, fontSize: 26, color: C.red, fontWeight: 600, width: 36 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 2 }}>
                <span style={line(C.text, 25)}>{a}</span>
                <span style={line(C.muted, 21)}>{b}</span>
              </div>
            </div>
          ))}
        </div>
      </Box>
      <Panel x={996} y={140} w={860} h={740}>
        <svg width={860} height={740}>
          <text x={30} y={44} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 12.2)}>
            원인: 넓이를 1 mm 격자의 칸 수로 셌다
          </text>
          <text x={830} y={44} textAnchor="end" fill={C.dim} fontSize={20} opacity={prog(t, 12.2)}>
            예: 20 mm × 20 mm = 400 mm² 인 면
          </text>
          <g opacity={prog(t, 18.6)}>
            <text x={180} y={96} textAnchor="middle" fill={C.orange} fontSize={24} fontWeight={600}>
              손목 카메라 (가까움)
            </text>
            <text x={180} y={124} textAnchor="middle" fill={C.muted} fontSize={20}>
              pixel 하나 ≤ 1 mm² → 칸 400 개 채움
            </text>
            <rect x={30} y={140} width={300} height={300} rx={6} fill="none" stroke={C.cardEdge} strokeWidth={1.5} />
            {grid(30, 140, 20, 1, C.orange, 18.8)}
            <text x={180} y={478} textAnchor="middle" fill={C.orange} fontSize={28} fontFamily={MONO} fontWeight={600}>
              400 칸
            </text>
          </g>
          <g opacity={prog(t, 20.6)}>
            <text x={660} y={96} textAnchor="middle" fill={C.blue} fontSize={24} fontWeight={600}>
              머리 카메라 (멂)
            </text>
            <text x={660} y={124} textAnchor="middle" fill={C.muted} fontSize={20}>
              pixel 하나 = 2 mm × 2 mm → pixel 100 개 → 칸 100 개
            </text>
            <rect x={510} y={140} width={300} height={300} rx={6} fill="none" stroke={C.cardEdge} strokeWidth={1.5} />
            {Array.from({ length: 400 }, (_, i) => (
              <rect key={i} x={510 + (i % 20) * cell + 1} y={140 + Math.floor(i / 20) * cell + 1} width={cell - 2} height={cell - 2} rx={2} fill={C.grid} />
            ))}
            {grid(510, 140, 20, 2, C.blue, 20.8).filter((_, i) => i % 4 === 0)}
            <text x={660} y={478} textAnchor="middle" fill={C.blue} fontSize={28} fontFamily={MONO} fontWeight={600}>
              100 칸
            </text>
          </g>
          <g opacity={prog(t, 22.6)}>
            <text x={430} y={530} textAnchor="middle" fill={C.red} fontSize={28} fontFamily={MONO} fontWeight={600}>
              100 ÷ 400 = 0.25 &lt; 하한 0.85 → 높이 거부
            </text>
            <text x={430} y={562} textAnchor="middle" fill={C.dim} fontSize={20}>
              논문: 머리 카메라 pixel 은 1 mm 칸의 약 4 분의 1 만 채웠고, 저장된 사진에서 잰 비는 0.27
            </text>
          </g>
          <g opacity={prog(t, 24.8)}>
            <rect x={30} y={590} width={800} height={120} rx={14} fill={`${C.green}14`} stroke={C.green} strokeWidth={2} />
            <text x={50} y={630} fill={C.green} fontSize={26} fontWeight={700}>
              수리: 칸 세기 → pixel 마다 덮는 넓이의 합
            </text>
            <text x={50} y={668} fill={C.text} fontSize={26} fontFamily={MONO}>
              머리 100 × 4 mm² = 400 mm² · 손목 400 mm² → 맞는다
            </text>
            <text x={50} y={698} fill={C.muted} fontSize={21} opacity={prog(t, 27)}>
              새 test 는 고치기 전 실패 · 고친 뒤 통과 · 기존 test 까지 73 개 모두 통과
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={64} y={600} w={900} h={280} at={27.4} title={<Head color={C.green}>다음 시도</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          {after.map(([s, at]) => (
            <span key={s} style={{ ...line(C.text, 25), opacity: prog(t, at) }}>
              ✓ {s}
            </span>
          ))}
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- the official evaluation ----------

function Eval() {
  const t = useSec()
  const rows: [string, number, string, number][] = [
    ['Memory', 81.0, 'WorldScape-R2SI 63.7%', 6.4],
    ['Open', 55.3, 'WorldScape-R2SI 47.5%', 7.2],
    ['Generalization', 34.5, '', 8],
    ['Precision', 32.0, 'VPP2 35.2% ↑', 8.8],
    ['Long-Horizon', 31.5, 'VPP2 37.0% ↑', 9.6],
  ]
  return (
    <AbsoluteFill>
      <Box x={64} y={140} w={900} h={445} at={0.3} title={<Head color={C.accent}>공식 평가 · hidden seed</Head>}>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 0.8) }}>seed 0 의 장면 10 개로 만든 tool 을, RoboDojo 팀이 공개하지 않은 seed 에서 작업마다 50 episode · 장면 되돌리기 ✕ 실제 위치 읽기 ✕</span>
        <div style={{ display: 'grid', gap: 6, marginTop: 0 }}>
          {rows.map(([n, v, cmp, at]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: prog(t, at) }}>
              <span style={{ width: 180, fontSize: 23, color: C.text }}>{n}</span>
              <div style={{ width: 280, height: 24, borderRadius: 7, background: C.grid }}>
                <div style={{ width: `${v * prog(t, at, 0.8)}%`, height: '100%', borderRadius: 7, background: C.green }} />
              </div>
              <span style={{ fontFamily: MONO, fontSize: 25, fontWeight: 600, color: C.green, width: 100 }}>{v.toFixed(1)}%</span>
              <span style={{ fontSize: 20, color: cmp.includes('↑') ? C.orange : C.muted, whiteSpace: 'nowrap' }}>{cmp}</span>
            </div>
          ))}
          <span style={{ ...line(C.accent, 22), fontFamily: MONO, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, 10.4) }}>(34.5 + 32.0 + 31.5 + 81.0 + 55.3) ÷ 5 = 46.9 = leaderboard 점수</span>
        </div>
      </Box>
      <Box x={996} y={140} w={860} h={445} at={17.5} title={<Head color={C.accent}>cluttered 판 · 주변만 바꾼다</Head>}>
        <div style={{ display: 'grid', gap: 12, marginTop: 4 }}>
          <Bar label="HexaShell standard" value={38} max={50} color={C.green} at={17.9} width={260} fmt="38.0" unit="%" labelW={230} />
          <Bar label="HexaShell cluttered" value={31} max={50} color={C.green} at={18.7} width={260} fmt="31.0" unit="%" sub="≈ 82% 유지" labelW={230} />
          <Bar label="VPP2 standard" value={46.4} max={50} color={C.blue} at={20.2} width={260} unit="%" labelW={230} />
          <Bar label="VPP2 cluttered" value={12.6} max={50} color={C.red} at={21} width={260} unit="%" sub="policy 31 개 중앙값 20%" labelW={230} />
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 22) }}>agent 가 고른 pixel 의 물체만 재므로 주변이 늘어도 측정이 흔들리지 않는다 · 옷 개기는 56% → 24% (색이 이어진 영역으로 찾아서)</span>
        </div>
      </Box>
      <Box x={64} y={610} w={1792} h={270} at={23.2} title={<Head color={C.orange}>평가를 읽을 때: agent 에게 무엇을 줬나 · 감사</Head>}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {[
            ['acting agent 의 prompt', 'benchmark 문서의 작업 설명과 점수표, 개발 중 tool 의 동작 기록', 23.6],
            ['optimizer 의 note · 작업 25 개', 'checker 의 요구 · 일부 작업의 물체 크기·목표 위치 (저자들이 공개 작업 정의로 씀) · acting agent 는 못 본다', 25.2],
            ['감사: 작업 7 개의 tool 에 고정 geometry', '다시 잰 장면 70 개에서 3 번 성공 → 상수를 측정으로 바꾸자 일곱 작업 모두 0/10', 27],
          ].map(([h, s, at]) => (
            <div key={h as string} style={{ display: 'grid', gap: 8, opacity: prog(t, at as number) }}>
              <Label color={C.text} size={24} weight={600}>
                {h as string}
              </Label>
              <span style={line(C.muted, 21)}>{s as string}</span>
            </div>
          ))}
        </div>
        <span style={{ ...line(C.dim, 20), opacity: prog(t, 28.6) }}>실물 로봇(PiPER X 팔 둘)에서는 블록 쌓기와 글자 블록 정렬 episode 를 보였고, 성공률은 보고하지 않았다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- the contact boundary ----------

const CLASSES: [string, number, number, number][] = [
  ['밀기 · 누르기 (4)', 60.0, 92.5, 24.7],
  ['단단한 물체 집기·놓기·쌓기 (22)', 36.9, 50.0, 30.0],
  ['스스로 움직이는 물체 (2)', 33.0, 40.0, 43.0],
  ['무른 물체·액체·알갱이 (6)', 26.0, 33.3, 49.4],
  ['mm·몇 도 오차의 끼우기 (12)', 1.7, 8.3, 28.1],
  ['관절이 있는 물체·도구 (8)', 2.0, 7.5, 21.6],
]

function Contact() {
  const t = useSec()
  const bx = 330
  const bw = 600
  const ry = (i: number) => 96 + i * 60
  const ends: [string, number, string, string][] = [
    ['step 을 거의 다 씀', 57, C.red, '실행의 부족: 틀린 결과를 보고도 동작을 못 해냄'],
    ['끝났다고 했지만 checker 는 실패', 30, C.orange, '인식·작업 조건 이해의 부족 · 기억 작업은 50%'],
    ['포기', 13, C.muted, ''],
  ]
  let acc = 0
  return (
    <AbsoluteFill>
      <Panel x={64} y={140} w={1100} h={490}>
        <svg width={1100} height={490}>
          <text x={30} y={40} fill={C.text} fontSize={26} fontWeight={600} opacity={prog(t, 0.3)}>
            새 장면에서 다시 잰 성공률 · 성공에 필요한 접촉으로 나누면
          </text>
          <g opacity={prog(t, 0.5)}>
            {[
              ['■ HexaShell', C.green],
              ['■ tool 없는 같은 모델', C.muted],
              ['■ VPP2', C.blue],
            ].map(([s, c], i) => (
              <text key={s} x={30 + i * 250} y={72} fill={c} fontSize={21} fontWeight={600}>
                {s}
              </text>
            ))}
          </g>
          {CLASSES.map(([name, none, ours, vpp], i) => {
            const at = 0.7 + i * 0.5
            const bars: [number, string, number][] = [
              [ours, C.green, 0],
              [none, C.muted, 1],
              [vpp, C.blue, 2],
            ]
            return (
              <g key={name} opacity={prog(t, at)}>
                <text x={bx - 16} y={ry(i) + 26} textAnchor="end" fill={C.text} fontSize={21}>
                  {name}
                </text>
                {bars.map(([v, c, k]) => (
                  <g key={k}>
                    <rect x={bx} y={ry(i) + k * 14} width={(bw * v * prog(t, at, 0.8)) / 100} height={12} rx={3} fill={c} opacity={k === 0 ? 1 : 0.8} />
                    <text x={bx + (bw * v) / 100 + 10} y={ry(i) + k * 14 + 11} fill={c} fontSize={16} fontFamily={MONO} opacity={prog(t, at + 0.6)}>
                      {v.toFixed(1)}
                    </text>
                  </g>
                ))}
              </g>
            )
          })}
          <text x={30} y={452} fill={C.red} fontSize={22} fontWeight={600} opacity={prog(t, 4.4)}>
            끼우기 12 개 가운데 7 개는 0%
          </text>
          <g opacity={prog(t, 6.3)}>
            <text x={30} y={482} fill={C.accent} fontSize={22} fontWeight={600}>
              tool 이 더한 몫 · 밀기 +33 · 기억 +26 (38.7 → 65.0) · 단단한 물체 +13
            </text>
          </g>
        </svg>
      </Panel>
      <Box x={1196} y={140} w={660} h={490} at={11.6} title={<Head color={C.red}>왜 끼우기에서 막히나</Head>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <span style={{ ...line(), opacity: prog(t, 12) }}>
            구멍과 부품을 <b>몇 mm</b> 안으로 맞춰야 하는데, 머리 카메라의 pixel 하나는 탁자 위 <span style={{ fontFamily: MONO, color: C.red, fontWeight: 600 }}>2 ~ 3 mm</span>
          </span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 13.4) }}>구멍을 잘 볼 손목 view 는 gripper 가 부품을 든 채로 만들어야 한다</span>
          <div style={{ display: 'grid', gap: 10, marginTop: 6, opacity: prog(t, 14.6) }}>
            <Bar label="끼우기 · simulator depth" value={30.1} max={40} color={C.muted} at={14.8} width={200} unit="%" labelW={260} />
            <Bar label="끼우기 · RGB tool" value={8.3} max={40} color={C.red} at={15.6} width={200} unit="%" labelW={260} />
          </div>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 16.6) }}>액체 따르기 둘도 59 ~ 95% → 0 ~ 10% · 옷 개기는 tool 없는 agent 가 더 나았다 (50% 대 72%)</span>
        </div>
      </Box>
      <Panel x={64} y={660} w={1792} h={220}>
        <svg width={1792} height={220}>
          <text x={30} y={40} fill={C.text} fontSize={25} fontWeight={600} opacity={prog(t, 17.8)}>
            실패한 episode 268 개 − tool 에러 5 개 = 263 개는 어떻게 끝났나
          </text>
          {ends.map(([n, v, c, d], i) => {
            const x = 30 + (acc / 100) * 1732
            acc += v
            const w = (v / 100) * 1732 * prog(t, 18.2 + i * 0.8, 0.8)
            return (
              <g key={n}>
                <rect x={x} y={62} width={w} height={44} rx={6} fill={c} opacity={0.85} />
                <text x={x + 14} y={92} fill={C.bg} fontSize={22} fontWeight={700} opacity={prog(t, 18.6 + i * 0.8)}>
                  {n} {v}%
                </text>
                {d && (
                  <text x={x} y={150} fill={c} fontSize={21} fontWeight={600} opacity={prog(t, 24.2 + i * 1.2)}>
                    → {d}
                  </text>
                )}
              </g>
            )
          })}
          <text x={30} y={200} fill={C.accent} fontSize={23} fontWeight={600} opacity={prog(t, 29.2)}>
            다음 단계: 부품을 든 동안에도 계속 재고, 접촉하는 도중에 동작을 고치는 tool
          </text>
        </svg>
      </Panel>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: 'thin harness', color: C.accent, text: '결정하지 않는 robo 와 사진 3 장 · 22.5% → 46.9%, RoboDojo 1 위', at: 1 },
    { tag: 'ray · 평면 · 두 번째 view', color: C.blue, text: '높이 15 mm 오차 → 위치 10 mm 오차 · depth network 29.6 → triangulation 38.3', at: 3.6 },
    { tag: '실패를 tool 로', color: C.orange, text: 'optimizer 가 unit test 붙은 tool 하나를 고친다 · 수리 한 번 6.3 분 · hidden seed 와 감사', at: 6.2 },
    { tag: '접촉의 경계', color: C.red, text: '밀기 92.5% · 끼우기 8.3% · 로봇 시간 26 초에 실제 739 초', at: 9 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            coding agent 에게 로봇을 맡기면 얼마나 잘하게 되고, 어디서 막힐까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '20px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 34, fontWeight: 600 }}>{it.text}</span>
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
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>VLA + RL · Tactile Sensing</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            실제 성공과 실패로 VLA 를 더 학습하기 · 카메라가 보지 못하는 접촉을 재기
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · HexaShell 논문 arXiv 2610.23479 (CC BY 4.0)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseSteps = () => (
  <PauseWrite
    question="step 한도 1100 인 tic tac toe 는 로봇 시간으로 몇 초? 그중 520 step 을 상대 팔을 기다렸다면 몇 초?"
    answer={
      <>
        1초에 action 25 개 → 1100 ÷ 25 = 44 초 · 520 ÷ 25 = 20.8 초
        <br />
        한도의 절반 가까이를 기다렸다
      </>
    }
  />
)

const PauseRay = () => (
  <PauseWrite
    question="0.60 m 내려갈 때 0.40 m 나아가는 ray 에서, 잰 탁자 높이 0.765 m 대신 설명서의 0.74 m 를 쓰면 위치는 얼마나 틀릴까?"
    answer="높이 오차 0.765 − 0.74 = 0.025 m → 0.025 × 0.40 ÷ 0.60 ≈ 0.017 m, 약 17 mm · grasp 에 필요한 1 cm 를 넘는다"
  />
)

const PauseClutter = () => (
  <PauseWrite
    question="VPP2 는 standard 판 46.4%, cluttered 판 12.6% 다. 성공의 몇 % 를 지켰고, HexaShell 의 82% 와 비교하면?"
    answer="12.6 ÷ 46.4 ≈ 0.27 → 27% 를 지킴 · HexaShell 은 31.0 ÷ 38.0 ≈ 82% 라서 약 3 배"
  />
)

const PausePixel = () => (
  <PauseWrite
    question="머리 카메라의 pixel 하나가 탁자 위 2 ~ 3 mm 를 덮는다. 구멍의 중심을 2 pixel 틀리게 고르면 위치 오차는? 끼우기에 왜 문제인가?"
    answer="2 × 2 = 4 mm 에서 2 × 3 = 6 mm · 끼우기는 몇 mm 안으로 맞춰야 해서 pixel 하나둘의 차이로 허용 오차를 넘는다 · 가까운 손목 view 는 부품을 든 채로 만들어야 한다"
  />
)

export function RobotCodingAgent() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        harness: Harness,
        steps: Steps,
        'pause-steps': PauseSteps,
        ray: Ray,
        'pause-ray': PauseRay,
        'two-view': TwoView,
        loop: Loop,
        'push-t': PushT,
        eval: Eval,
        'pause-clutter': PauseClutter,
        contact: Contact,
        'pause-pixel': PausePixel,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
