import type { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './tokenizer.narration.json'
import { script } from './tokenizer.script'

// Numbers follow lessons/tokenizer/README.md (see tokenizer.script.ts). Token splits, ids and counts are the lesson's own
// examples (cat hat cat that, that cat, unbelievable, 하 in GPT-2); the bin number line and the DCT row are its worked examples.

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 28 }: { children: ReactNode; color?: string; size?: number }) {
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
          <div style={{ padding: '10px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
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

/** absolutely placed content inside a Card, faded in at `at` */
function At({ x = 28, y, w, at, children, style }: { x?: number; y: number; w?: number; at: number; children: ReactNode; style?: CSSProperties }) {
  const t = useSec()
  return <div style={{ position: 'absolute', left: x, top: y, width: w, opacity: prog(t, at), ...style }}>{children}</div>
}

const line = (color = C.text, size = 24): CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 26): CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** one token drawn as a box; ␣ marks a space */
function Tok({ s, color = C.cardEdge, fill, size = 24 }: { s: string; color?: string; fill?: string; size?: number }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', minWidth: 24, textAlign: 'center', borderRadius: 8, border: `1.5px solid ${color}`, background: fill ?? C.bg, fontFamily: MONO, fontSize: size, fontWeight: 600, whiteSpace: 'nowrap', color: C.text }}>
      {s}
    </span>
  )
}

/** a row of tokens; the indices in `hi` are the ones just merged */
function Toks({ toks, hi = [], color = C.blue, size = 24 }: { toks: string[]; hi?: number[]; color?: string; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {toks.map((s, i) => (hi.includes(i) ? <Tok key={i} s={s} color={color} fill={`${color}33`} size={size} /> : <Tok key={i} s={s} size={size} />))}
    </div>
  )
}

/** a token over its id */
function TokId({ s, id, color = C.cardEdge, w = 92 }: { s: string; id: string; color?: string; w?: number }) {
  return (
    <div style={{ width: w, display: 'grid', justifyItems: 'center', gap: 6 }}>
      <Tok s={s} color={color} />
      <span style={mono(C.accent, 22)}>{id}</span>
    </div>
  )
}

/** a text table; first column sans, the rest mono; each row fades in at its own time */
function Table({ head, rows, widths, times, size = 24, colors }: { head: string[]; rows: ReactNode[][]; widths: number[]; times: number[]; size?: number; colors?: (string | undefined)[] }) {
  const t = useSec()
  const cell = (i: number): CSSProperties => ({ width: widths[i], fontFamily: i === 0 ? undefined : MONO, fontSize: size, whiteSpace: 'nowrap', textAlign: i === 0 ? 'left' : 'right', paddingRight: i === 0 ? 0 : 10 })
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', opacity: prog(t, times[0] - 0.3), borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
        {head.map((h, i) => (
          <span key={i} style={{ ...cell(i), fontFamily: undefined, color: C.muted, fontSize: size - 2 }}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r, k) => (
        <div key={k} style={{ display: 'flex', opacity: prog(t, times[k]), color: colors?.[k] ?? C.text }}>
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
            LANGUAGE · TOKENIZER
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>BPE Tokenizer</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            text <span style={{ color: C.accent }}>→</span> token id 열 <span style={{ color: C.accent }}>→</span> text
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            자주 붙어 나오는 조각 쌍을 하나씩 합쳐 가며 vocabulary 를 만든다
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
  return (
    <AbsoluteFill>
      <Card x={160} y={140} w={1600} h={240} at={0.4}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 18 }}>
          <Label size={24}>GPT-2 tokenizer 로 자른 token 수 (tiktoken 으로 센 값)</Label>
          <Bar label='"Pick up the red cup."' value={6} max={20} color={C.blue} at={0.8} width={760} unit=" 개" labelW={380} sub="UTF-8 20 byte" />
          <Bar label='"빨간 컵을 집어."' value={18} max={20} color={C.orange} at={1.6} width={760} unit=" 개" labelW={380} sub="UTF-8 21 byte" />
        </div>
      </Card>
      <Appear at={4.6} style={{ position: 'absolute', left: 60, top: 420, width: 1800 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}>
          같은 지시인데 한국어는 왜 <span style={{ color: C.accent }}>token 이 세 배</span>일까?
        </div>
      </Appear>
      <Card x={360} y={560} w={1200} h={250} at={5.6}>
        <div style={{ padding: '24px 32px', display: 'grid', gap: 18 }}>
          <Label size={24}>로봇 행동도 token 으로 · 두 팔 로봇이 1 초 동안 내는 행동 숫자 (FAST 논문)</Label>
          <Bar label="값마다 token 하나" value={700} max={700} color={C.dim} at={6} width={560} unit=" 개" labelW={260} />
          <Bar label="FAST tokenizer" value={53} max={700} color={C.green} at={6.6} width={560} unit=" 개" fmt="평균 53" labelW={260} />
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- section 1: token 과 vocabulary ----------

function Bytes() {
  const t = useSec()
  const bits = [128, 64, 32, 16, 8, 4, 2, 1]
  const on = [64, 32, 1]
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={880} h={740} at={0.3}>
        <At y={26} at={0.3}>
          <Head>모델은 숫자만 계산한다</Head>
        </At>
        <At y={80} at={0.6}>
          <Flow steps={['text', '숫자 열', 'language model', 'text']} color={C.accent} at={0.8} />
        </At>
        <At y={176} at={7}>
          <Head color={C.blue}>ASCII 문자 코드 · 공백은 ␣ 로 적는다</Head>
        </At>
        <At y={228} at={7.3}>
          <div style={{ display: 'flex', gap: 18 }}>
            {[
              ['c', '99'],
              ['a', '97'],
              ['t', '116'],
              ['␣', '32'],
            ].map(([ch, n]) => (
              <div key={ch} style={{ width: 110, display: 'grid', justifyItems: 'center', gap: 6, padding: '10px 0', borderRadius: 14, border: `1.5px solid ${C.blue}66`, background: `${C.blue}12` }}>
                <span style={mono(C.text, 40)}>{ch}</span>
                <span style={mono(C.blue, 28)}>{n}</span>
              </div>
            ))}
          </div>
        </At>
        <At y={392} at={10}>
          <Head color={C.orange}>byte = 스위치 8 개 · 0 ~ 255 의 정수 하나</Head>
        </At>
        <At y={444} at={10.4}>
          <div style={{ display: 'flex', gap: 8 }}>
            {bits.map((b) => {
              const lit = on.includes(b)
              return (
                <div key={b} style={{ width: 78, height: 72, borderRadius: 10, display: 'grid', placeItems: 'center', border: `1.5px solid ${lit ? C.orange : C.cardEdge}`, background: lit ? `${C.orange}33` : C.bg }}>
                  <span style={mono(lit ? C.orange : C.dim, 22)}>{b}</span>
                </div>
              )
            })}
          </div>
        </At>
        <At y={540} at={11}>
          <span style={mono(C.orange, 26)}>a 의 97 = 64 + 32 + 1</span>
        </At>
        <At y={590} at={11.8} w={824}>
          <span style={line(C.muted, 24)}>
            모두 켜면 <span style={mono(C.text, 24)}>255</span> · 경우의 수 <span style={mono(C.text, 24)}>2⁸ = 256</span> 가지
          </span>
        </At>
      </Card>
      <Card x={980} y={130} w={880} h={740} at={13.5}>
        <At y={26} at={13.5}>
          <Head color={C.accent}>UTF-8 · 글자 하나를 byte 1 ~ 4 개로</Head>
        </At>
        <At y={84} at={13.8}>
          <Table
            head={['글자', 'Unicode 번호', 'UTF-8 byte', 'byte 수']}
            widths={[120, 210, 340, 120]}
            times={[14.1, 14.6, 15.4, 16.2]}
            colors={[undefined, undefined, C.accent, undefined]}
            rows={[
              ['h', '104', '104', '1'],
              ['é', '233', '195 169', '2'],
              ['안', '50504', '236 149 136', '3'],
              ['emoji', '128578', '240 159 153 130', '4'],
            ]}
          />
        </At>
        <At y={330} at={20.5} w={824}>
          <span style={line(C.text, 25)}>
            한글 음절 <span style={mono(C.accent, 25)}>44032 ~ 55203</span> 은 모두 <span style={mono(C.accent, 25)}>3 byte</span>
          </span>
        </At>
        <At y={400} at={21.5} w={824}>
          <Label size={22} color={C.muted}>
            같은 뜻의 두 문장 · UTF-8 byte 수
          </Label>
        </At>
        <At y={448} at={21.8} w={824}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Bar label='"Pick up the red cup."' value={20} max={21} color={C.blue} at={22} width={290} unit=" byte" labelW={300} />
            <Bar label='"빨간 컵을 집어."' value={21} max={21} color={C.orange} at={22.6} width={290} unit=" byte" labelW={300} />
          </div>
        </At>
        <At y={560} at={24} w={824}>
          <span style={line(C.muted, 23)}>글자 수는 절반도 안 되지만 한 글자가 3 byte 라서 byte 수는 비슷하다 · 어떤 text 든 0 ~ 255 의 byte 열이 된다</span>
        </At>
      </Card>
    </AbsoluteFill>
  )
}

function Units() {
  const catHat: [string, string][] = [
    ['c', '99'],
    ['a', '97'],
    ['t', '116'],
    ['␣', '32'],
    ['h', '104'],
    ['a', '97'],
    ['t', '116'],
  ]
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={1800} h={300} at={0.3}>
        <At y={26} at={0.3}>
          <Flow steps={['text', 'token 으로 자르기', 'vocabulary 에서 번호 찾기', 'token id 열']} color={C.accent} at={0.5} />
        </At>
        <At x={1180} y={34} at={2.6}>
          <span style={line(C.muted, 23)}>encode → · ← decode · 두 일을 하는 것이 tokenizer</span>
        </At>
        <At y={120} at={6.5}>
          <div style={{ display: 'flex', gap: 10 }}>
            {catHat.map(([s, id], i) => (
              <TokId key={i} s={s} id={id} w={88} />
            ))}
          </div>
        </At>
        <At x={760} y={128} at={7.6} w={1000}>
          <div style={{ display: 'grid', gap: 8 }}>
            <span style={line(C.text, 25)}>
              byte 256 개가 그대로 vocabulary · byte 값 = token id
            </span>
            <span style={line(C.text, 25)}>
              "cat hat" → token <span style={mono(C.accent, 25)}>7</span> 개 · sequence 길이 <span style={mono(C.accent, 25)}>7</span>
            </span>
          </div>
        </At>
      </Card>
      <Card x={60} y={460} w={1100} h={410} at={12.5}>
        <At y={24} at={12.5}>
          <Head>unbelievable 을 자르는 세 단위</Head>
        </At>
        <At y={80} at={12.8}>
          <Table
            head={['단위', '자른 결과', 'token 수', 'vocabulary 크기']}
            widths={[130, 400, 140, 330]}
            times={[13, 13.8, 14.6]}
            colors={[undefined, undefined, C.accent]}
            rows={[
              ['글자', 'u n b e l i e v a b l e', '12', '100 개 안팎'],
              ['단어', 'unbelievable', '1', '수만 ~ 수십만'],
              ['subword', 'un bel iev able', '4', 'GPT-2 50,257'],
            ]}
          />
        </At>
        <At y={268} at={15.6} w={1044}>
          <span style={line(C.text, 23)}>subword: 자주 나오는 단어는 통째로 token 하나, 드문 단어는 자주 나오는 조각 몇 개</span>
        </At>
        <At y={318} at={16.8} w={1044}>
          <span style={line(C.muted, 22)}>GPT-2 에서 앞에 공백이 붙은 "␣unbelievable" 은 token 1 개 · token 은 단어와 같은 말이 아니다</span>
        </At>
      </Card>
      <Box x={1200} y={460} w={660} h={200} at={18.5} color={`${C.red}88`} title={<Head color={C.red}>단어 단위의 {'<unk>'}</Head>} gap={10}>
        <span style={line(C.text, 22)}>오타 unbelievabel · 새로 생긴 말 → 모두 {'<unk>'} 하나</span>
        <span style={line(C.text, 22)}>decode 해도 원래 단어를 되살릴 수 없다</span>
      </Box>
      <Box x={1200} y={680} w={660} h={190} at={24.5} color={`${C.green}88`} title={<Head color={C.green}>GPT-2 는 byte 에서 출발</Head>} gap={10}>
        <span style={line(C.text, 22)}>Unicode 글자에서 출발: 기본만 13만 개가 넘음</span>
        <span style={line(C.text, 22)}>byte 출발: 256 개 · 최악이면 byte 하나 = token 하나</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- section 2: BPE 학습과 encode ----------

const R0 = ['c', 'a', 't', '␣', 'h', 'a', 't', '␣', 'c', 'a', 't', '␣', 't', 'h', 'a', 't']
const R1 = ['c', 'at', '␣', 'h', 'at', '␣', 'c', 'at', '␣', 't', 'h', 'at']
const R2 = ['c', 'at␣', 'h', 'at␣', 'c', 'at␣', 't', 'h', 'at']
const R3 = ['cat␣', 'h', 'at␣', 'cat␣', 't', 'h', 'at']

function BpeTrain() {
  const t = useSec()
  const rows: [string, string[], number[], number][] = [
    ['시작 · 16', R0, [], 6.8],
    ['1회차 · 12', R1, [1, 4, 7, 11], 13.4],
    ['2회차 · 9', R2, [1, 3, 5], 19],
    ['3회차 · 7', R3, [0, 3], 21],
  ]
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={720} h={440} at={6.5}>
        <At y={24} at={6.5}>
          <Head>첫 회차 쌍 빈도 · 이웃한 자리 15 군데</Head>
        </At>
        <At y={84} at={6.8} w={664}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Bar label="(a, t)" value={4} max={4} color={C.accent} at={7.2} width={360} unit=" 번" labelW={170} />
            <Bar label="(t, ␣)" value={3} max={4} color={C.blue} at={7.6} width={360} unit=" 번" labelW={170} />
            <Bar label="(c, a)" value={2} max={4} color={C.blue} at={8} width={360} unit=" 번" labelW={170} />
            <Bar label="(h, a)" value={2} max={4} color={C.blue} at={8.4} width={360} unit=" 번" labelW={170} />
            <Bar label="나머지 4 쌍" value={1} max={4} color={C.dim} at={8.8} width={360} fmt="1 씩" labelW={170} />
          </div>
        </At>
        <At y={330} at={10}>
          <span style={mono(C.muted, 24)}>2 + 4 + 3 + 2 + 4 × 1 = 15</span>
        </At>
        <At y={380} at={10.6} w={664}>
          <span style={line(C.muted, 21)}>(a, t) 와 (t, a) 는 순서가 달라서 다른 쌍이다</span>
        </At>
      </Card>
      <Card x={820} y={130} w={1040} h={440} at={0.3}>
        <At y={24} at={0.3}>
          <Head color={C.accent}>BPE 학습 · 정한 횟수만큼 되풀이</Head>
        </At>
        <At y={80} at={0.6}>
          <Flow steps={['쌍마다 빈도 세기', '가장 큰 쌍에 새 id', '모두 새 token 으로']} color={C.accent} at={0.8} gap={0.8} />
        </At>
        <At y={170} at={12.5}>
          <Table
            head={['회차', '고른 쌍', '빈도', '새 id', '새 token', 'sequence 길이']}
            widths={[90, 170, 90, 110, 160, 220]}
            times={[12.8, 18.8, 20.6]}
            colors={[C.accent, C.accent, C.accent]}
            rows={[
              ['1', '(a, t)', '4', '256', 'at', '16 → 12'],
              ['2', '(at, ␣)', '3', '257', 'at␣', '12 → 9'],
              ['3', '(c, at␣)', '2', '258', 'cat␣', '9 → 7'],
            ]}
          />
        </At>
        <At y={350} at={24.6}>
          <span style={mono(C.orange, 26)}>vocabulary 259 = 256 + 3 → merge 259 − 256 = 3 번</span>
        </At>
        <At y={398} at={26.2} w={984}>
          <span style={line(C.dim, 21)}>Gage 1994 의 압축 방법 → Sennrich 등 2016 번역 모델 → GPT-2 2019 byte 단위 BPE</span>
        </At>
      </Card>
      <Card x={60} y={600} w={1800} h={270} at={6.5}>
        {rows.map(([label, toks, hi, at], i) => (
          <div key={label} style={{ position: 'absolute', left: 28, top: 22 + i * 58, display: 'flex', alignItems: 'center', gap: 20, opacity: prog(t, at) }}>
            <span style={{ width: 170, fontSize: 22, color: i === 0 ? C.muted : C.blue, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
            <Toks toks={toks} hi={hi} />
          </div>
        ))}
      </Card>
    </AbsoluteFill>
  )
}

function Encode() {
  const t = useSec()
  const steps: [string, string[] | null, number[], string, number, string][] = [
    ['시작', ['t', 'h', 'a', 't', '␣', 'c', 'a', 't'], [], '8', 0.8, C.muted],
    ['1 · (a, t) → 256', ['t', 'h', 'at', '␣', 'c', 'at'], [2, 5], '6', 2.4, C.blue],
    ['2 · (at, ␣) → 257', ['t', 'h', 'at␣', 'c', 'at'], [2], '5', 4, C.blue],
    ['3 · (c, at␣) → 258', null, [], '5', 7.3, C.red],
  ]
  const ids: [string, string][] = [
    ['t', '116'],
    ['h', '104'],
    ['at␣', '257'],
    ['c', '99'],
    ['at', '256'],
  ]
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={1000} h={740} at={0.3}>
        <At y={24} at={0.3}>
          <Head>"that cat" 을 배운 merge 로 encode</Head>
        </At>
        {steps.map(([label, toks, hi, n, at, color], i) => (
          <div key={label} style={{ position: 'absolute', left: 28, top: 84 + i * 62, display: 'flex', alignItems: 'center', gap: 20, opacity: prog(t, at) }}>
            <span style={{ ...mono(color, 22), width: 270 }}>{label}</span>
            <div style={{ width: 520 }}>{toks ? <Toks toks={toks} hi={hi} /> : <span style={line(C.red, 23)}>바뀌는 자리 없음</span>}</div>
            <span style={mono(C.text, 24)}>{n} 개</span>
          </div>
        ))}
        <At y={350} at={9}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ ...line(C.muted, 22), width: 120, paddingTop: 4 }}>id 열</span>
            {ids.map(([s, id], i) => (
              <TokId key={i} s={s} id={id} w={100} color={s.startsWith('at') ? C.blue : C.cardEdge} />
            ))}
          </div>
        </At>
        <At y={470} at={10.8} w={944}>
          <span style={line(C.text, 23)}>끝의 cat 뒤에는 공백이 없어서 c 다음이 at␣ 가 아니라 at → merge 3 은 적용되지 않는다</span>
        </At>
        <At y={570} at={12} w={944}>
          <div style={{ display: 'grid', gap: 8 }}>
            <span style={line(C.muted, 22)}>decode: id 마다 vocabulary 의 byte 를 찾아 이어 붙인다</span>
            <span style={mono(C.green, 22)}>116 / 104 / 97 116 32 / 99 / 97 116 → "that cat"</span>
          </div>
        </At>
      </Card>
      <Card x={1100} y={130} w={760} h={350} at={13.5}>
        <At y={24} at={13.5}>
          <Head color={C.orange}>"cat␣" · merge 적용 순서가 바뀌면</Head>
        </At>
        <At y={88} at={14}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ ...mono(C.green, 22), width: 250 }}>배운 순서 1 → 2 → 3</span>
            <Toks toks={['cat␣']} hi={[0]} color={C.green} />
            <span style={mono(C.green, 24)}>1 개</span>
          </div>
        </At>
        <At y={158} at={15.6}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ ...mono(C.red, 22), width: 250 }}>거꾸로 3 → 2 → 1</span>
            <Toks toks={['c', 'at', '␣']} hi={[1]} color={C.red} />
            <span style={mono(C.red, 24)}>3 개</span>
          </div>
        </At>
        <At y={232} at={17} w={704}>
          <span style={line(C.muted, 22)}>거꾸로면 merge 3 이 쓸 at␣ 도, merge 2 가 쓸 at 도 아직 없어서 merge 1 만 적용된다</span>
        </At>
      </Card>
      <Card x={1100} y={510} w={760} h={360} at={20.5}>
        <At y={24} at={20.5}>
          <Head color={C.pink}>GPT-2 가 자른 "하"</Head>
        </At>
        <At y={80} at={20.9}>
          <span style={line(C.text, 23)}>
            "하" 의 UTF-8 byte: <span style={mono(C.pink, 24)}>237 149 152</span>
          </span>
        </At>
        <At y={136} at={21.8}>
          <div style={{ display: 'flex', gap: 18 }}>
            <TokId s="237 149" id="47991" w={170} color={C.pink} />
            <TokId s="152" id="246" w={110} />
          </div>
        </At>
        <At y={236} at={23} w={704}>
          <span style={line(C.red, 23)}>47991 만 decode → 3 byte 글자가 끝나지 않아 �</span>
        </At>
        <At y={284} at={25} w={704}>
          <span style={line(C.green, 23)}>152 를 담은 246 과 이어 붙여야 "하" 가 완성된다</span>
        </At>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- section 3: vocabulary 크기 ----------

function Pretoken() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={900} h={470} at={0.3}>
        <At y={24} at={0.3}>
          <Head>pre-tokenization · BPE 전에 조각내기</Head>
        </At>
        <At y={82} at={0.8} w={844}>
          <span style={line(C.muted, 23)}>byte 열에 BPE 를 그대로 쓰면 "dog." "dog!" "dog?" 가 모두 다른 token</span>
        </At>
        <At y={142} at={2.4}>
          <Toks toks={['dog', '.', '␣dog', '!', '␣dog', '?']} hi={[0, 2, 4]} />
        </At>
        <At y={220} at={6.5} w={844}>
          <span style={line(C.text, 23)}>쌍은 조각 안에서만 센다 · cat hat cat that 의 네 조각</span>
        </At>
        <At y={276} at={7}>
          <Toks toks={['cat', '␣hat', '␣cat', '␣that']} hi={[0, 1, 2, 3]} color={C.green} />
        </At>
        <At y={350} at={8.6} w={844}>
          <span style={line(C.muted, 22)}>
            조각 경계에 걸친 <span style={{ color: C.red }}>(t, ␣) 3 번</span>은 세지 않아서 merge 세 번의 결과는 at, cat, hat · 압축은 조금 덜 된다 (1.94 → 1.88)
          </span>
        </At>
      </Card>
      <Card x={1000} y={130} w={860} h={470} at={12.5}>
        <At y={24} at={12.5}>
          <Head color={C.accent}>special token 은 먼저 떼어 낸다</Head>
        </At>
        {['① special token 분리', '② GPT-2 정규식으로 조각내기', '③ 조각마다 merge → id'].map((s, i) => (
          <At key={s} y={84 + i * 62} at={12.9 + i * 0.5}>
            <span style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 12, border: `1.5px solid ${C.accent}88`, background: `${C.accent}12`, fontSize: 23, fontWeight: 600 }}>{s}</span>
          </At>
        ))}
        <At y={290} at={15}>
          <span style={mono(C.text, 24)}>"Hello world's" → 15496, 995, 338</span>
        </At>
        <At y={340} at={16}>
          <span style={mono(C.accent, 24)}>{'<|endoftext|>'} → 50256 (merge 없이)</span>
        </At>
        <At y={392} at={17} w={804}>
          <span style={line(C.muted, 21)}>GPT-2 는 학습 데이터의 문서와 문서 사이에 이 표시를 넣었다</span>
        </At>
      </Card>
      <Card x={60} y={630} w={1800} h={240} at={19}>
        <At y={60} at={19.2}>
          <span style={mono(C.orange, 56)}>V = 256 + M + S</span>
        </At>
        <At x={640} y={40} at={20} w={1120}>
          <div style={{ display: 'grid', gap: 18 }}>
            <span style={line(C.muted, 24)}>byte 256 개 · merge 횟수 M · special token 개수 S</span>
            <span style={mono(C.text, 28)}>GPT-2: 256 + 50,000 + 1 = 50,257</span>
            <span style={line(C.muted, 23)}>
              마지막 번호 <span style={mono(C.accent, 24)}>50256</span> 이 {'<|endoftext|>'}
            </span>
          </div>
        </At>
      </Card>
    </AbsoluteFill>
  )
}

function VocabSize() {
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={880} h={740} at={0.3}>
        <At y={24} at={0.3}>
          <Head>bytes per token = byte 수 ÷ token 수</Head>
        </At>
        <At y={76} at={1.4}>
          <span style={mono(C.accent, 28)}>cat hat cat that: 16 ÷ 7 ≈ 2.29</span>
        </At>
        <At y={140} at={6.5}>
          <Label size={22} color={C.muted}>
            Tiny Shakespeare · 앞 90% 로 학습, 뒤 10% 에서 잰 값
          </Label>
        </At>
        <At y={180} at={6.6} w={824}>
          <div style={{ display: 'grid', gap: 12 }}>
            <Bar label="256 (byte 만)" value={1} max={3.3} color={C.blue} at={6.8} width={360} fmt="1.00" labelW={230} />
            <Bar label="512" value={1.88} max={3.3} color={C.blue} at={7.4} width={360} labelW={230} />
            <Bar label="1024" value={2.26} max={3.3} color={C.blue} at={8} width={360} labelW={230} />
            <Bar label="50,257 (GPT-2)" value={3.09} max={3.3} color={C.accent} at={8.6} width={360} labelW={230} />
          </div>
        </At>
        <At y={380} at={12.5}>
          <Label size={22} color={C.muted}>
            embedding 표의 숫자 (vocabulary × 768)
          </Label>
        </At>
        <At y={420} at={12.6} w={824}>
          <div style={{ display: 'grid', gap: 12 }}>
            <Bar label="256" value={20} max={3860} color={C.orange} at={12.8} width={360} fmt="약 20만" labelW={230} />
            <Bar label="512" value={39} max={3860} color={C.orange} at={13.2} width={360} fmt="약 39만" labelW={230} />
            <Bar label="1024" value={79} max={3860} color={C.orange} at={13.6} width={360} fmt="약 79만" labelW={230} />
            <Bar label="50,257" value={3860} max={3860} color={C.red} at={14} width={360} fmt="약 3,860만" labelW={230} />
          </div>
        </At>
        <At y={622} at={15.2}>
          <div style={{ display: 'grid', gap: 6 }}>
            <span style={mono(C.text, 24)}>50,257 × 768 = 38,597,376</span>
            <span style={line(C.muted, 23)}>
              GPT-2 가장 작은 모델 전체 <span style={mono(C.text, 23)}>124,439,808</span> 개의 약 <span style={mono(C.red, 23)}>31%</span>
            </span>
          </div>
        </At>
      </Card>
      <Card x={980} y={130} w={880} h={740} at={18.5}>
        <At y={24} at={18.5}>
          <Head color={C.orange}>같은 뜻의 문장 · tokenizer 마다 token 수</Head>
        </At>
        <At y={84} at={18.8}>
          <Table
            head={['문장', 'byte', 'GPT-2', 'GPT-4', 'GPT-4o']}
            widths={[300, 110, 120, 120, 140]}
            times={[19, 19.6, 24.6, 25.2]}
            colors={[C.blue, C.orange, C.blue, C.orange]}
            rows={[
              ['Pick up the red cup.', '20', '6', '6', '6'],
              ['빨간 컵을 집어.', '21', '18', '11', '9'],
              ['The cat wore a hat.', '19', '6', '6', '6'],
              ['고양이가 모자를 썼다.', '30', '26', '13', '9'],
            ]}
          />
        </At>
        <At y={300} at={21} w={824}>
          <span style={line(C.text, 23)}>GPT-2 의 학습 text 는 대부분 영어라서 merge 50,000 개 가운데 한국어 byte 쌍을 합친 merge 가 적다</span>
        </At>
        <At y={400} at={25.4}>
          <Label size={22} color={C.muted}>
            "고양이가 모자를 썼다." 의 token 수
          </Label>
        </At>
        <At y={440} at={25.5} w={824}>
          <div style={{ display: 'grid', gap: 12 }}>
            <Bar label="GPT-2" value={26} max={26} color={C.red} at={25.6} width={420} labelW={150} unit=" 개" />
            <Bar label="GPT-4" value={13} max={26} color={C.orange} at={26.2} width={420} labelW={150} unit=" 개" />
            <Bar label="GPT-4o" value={9} max={26} color={C.green} at={26.8} width={420} labelW={150} unit=" 개" />
          </div>
        </At>
        <At y={600} at={27.6} w={824}>
          <span style={line(C.muted, 22)}>영어 문장은 이미 단어와 마침표가 하나씩 token 이라 세 tokenizer 모두 6 개</span>
        </At>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- section 4: action token ----------

function BinLine() {
  const t = useSec()
  const x0 = 40
  const bw = 97.5
  const X = (v: number) => x0 + v * bw
  return (
    <svg width={860} height={250}>
      <g opacity={prog(t, 7.2)}>
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <text x={X(i + 0.5)} y={40} textAnchor="middle" fill={i === 3 ? C.accent : C.muted} fontSize={20} fontWeight={600}>
              bin {i}
            </text>
            <rect x={X(i) + 2} y={56} width={bw - 4} height={52} rx={6} fill={i === 3 ? `${C.accent}33` : C.grid} stroke={i === 3 ? C.accent : C.cardEdge} strokeWidth={1.5} opacity={i === 3 ? 0.4 + 0.6 * prog(t, 9) : 1} />
          </g>
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <text key={i} x={X(i)} y={136} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
            {i}
          </text>
        ))}
        <text x={X(8) + 14} y={136} fill={C.dim} fontSize={20}>
          cm
        </text>
      </g>
      <g opacity={prog(t, 8.2)}>
        <polygon points={`${X(3.4)},146 ${X(3.4) - 9},164 ${X(3.4) + 9},164`} fill={C.orange} />
        <text x={X(3.4)} y={194} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
          3.4
        </text>
      </g>
      <g opacity={prog(t, 10)}>
        <circle cx={X(3.5)} cy={82} r={8} fill={C.green} />
        <text x={x0} y={236} fill={C.green} fontSize={23} fontWeight={600}>
          3 이상 4 미만 → bin 3 → 되돌리면 가운데 값 3.5 cm
        </text>
      </g>
    </svg>
  )
}

function Bins() {
  const models: [string, string, string, number][] = [
    ['RT-1 (2022)', '11 개 (팔 7, 이동 base 3, 모드 1)', 'language model 없이 차원마다 256 개 bin 중 하나를 고른다', 14],
    ['RT-2 (2023)', '8 개 (손끝 위치·회전 변화 6, 집게 1, 종료 1)', 'PaLI-X 판은 1000 까지의 정수 token, PaLM-E 판은 드문 token 256 개를 덮어쓴다', 15.6],
    ['OpenVLA (2024)', '7 개 (손끝 위치·회전 변화 6, 집게 1)', 'Llama tokenizer 에서 가장 드문 256 개를 덮어쓴다', 17.2],
  ]
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={920} h={740} at={0.3}>
        <At y={24} at={0.3}>
          <Head>VLA 는 vocabulary 의 token 하나를 고를 뿐</Head>
        </At>
        <At y={80} at={0.9} w={864}>
          <span style={line(C.muted, 23)}>"집게를 3.4 cm 벌린다" 의 3.4 같은 실수는 직접 적어 내지 못한다</span>
        </At>
        <At y={150} at={7} w={864}>
          <Label size={23} color={C.text} weight={600}>
            0 ~ 8 cm 를 1 cm 씩 8 개 bin 으로
          </Label>
        </At>
        <At x={20} y={196} at={7.1}>
          <BinLine />
        </At>
        <At y={470} at={11} w={864}>
          <span style={line(C.text, 23)}>모델이 bin 3 에 짝지은 token 을 내면 3.5 cm 로 되돌려 로봇에 보낸다</span>
        </At>
        <At y={560} at={23.5} w={864}>
          <div style={{ display: 'grid', gap: 8 }}>
            <Label size={23} color={C.orange} weight={600}>
              OpenVLA 의 bin 범위
            </Label>
            <span style={line(C.muted, 22)}>최솟값 ~ 최댓값이 아니라 1st ~ 99th quantile · 드물게 튄 값 때문에 bin 이 넓어지지 않게</span>
          </div>
        </At>
      </Card>
      <Card x={1020} y={130} w={840} h={740} at={13.5}>
        <At y={24} at={13.5}>
          <Head color={C.accent}>행동 숫자 · 값 하나를 256 개 bin 으로</Head>
        </At>
        {models.map(([name, n, how, at], i) => (
          <At key={name} y={84 + i * 142} at={at} w={784}>
            <div style={{ display: 'grid', gap: 4, paddingLeft: 18, borderLeft: `3px solid ${C.accent}88` }}>
              <span style={mono(C.accent, 25)}>{name}</span>
              <span style={line(C.text, 22)}>{n}</span>
              <span style={line(C.muted, 21)}>{how}</span>
            </div>
          </At>
        ))}
        <At y={530} at={20.5} w={784}>
          <div style={{ padding: '16px 22px', borderRadius: 16, border: `1.5px solid ${C.orange}88`, background: `${C.orange}12`, display: 'grid', gap: 6 }}>
            <span style={line(C.text, 22)}>
              Llama tokenizer 의 새 token 자리: <span style={mono(C.orange, 23)}>100</span> 개 &lt; <span style={mono(C.orange, 23)}>256</span>
            </span>
            <span style={line(C.muted, 21)}>가장 드물게 쓰이는 256 개를 action token 으로 덮어써서, 지시문을 읽는 token 은 그대로 남는다</span>
          </div>
        </At>
      </Card>
    </AbsoluteFill>
  )
}

function Fast() {
  const t = useSec()
  const sets: [string, number, number, number][] = [
    ['BridgeV2 · 7 차원 · 5 Hz', 35, 20, 0.6],
    ['DROID · 7 차원 · 15 Hz', 105, 29, 1.2],
    ['Bussing · 7 차원 · 20 Hz', 140, 28, 1.8],
    ['Shirt Fold · 14 차원 · 50 Hz', 700, 53, 2.4],
  ]
  const joint = ['0.10', '0.12', '0.16', '0.22', '0.30', '0.38', '0.44', '0.48']
  const coef = ['0.778', '−0.388', '0.032', '0.003', '0.000', '−0.003', '0.002', '0.000']
  const coefV = [0.778, -0.388, 0.032, 0.003, 0, -0.003, 0.002, 0]
  const q = ['8', '−4', '0', '0', '0', '0', '0', '0']
  const cellW = 90
  const row = (label: string, vals: string[], at: number, color: string, hiN = 0) => (
    <div style={{ display: 'flex', alignItems: 'center', opacity: prog(t, at) }}>
      <span style={{ width: 150, fontSize: 22, color: C.muted, whiteSpace: 'nowrap' }}>{label}</span>
      {vals.map((v, i) => (
        <span key={i} style={{ ...mono(i < hiN ? color : C.text, 20), width: cellW, textAlign: 'right' }}>
          {v}
        </span>
      ))}
    </div>
  )
  return (
    <AbsoluteFill>
      <Card x={60} y={130} w={820} h={740} at={0.3}>
        <At y={24} at={0.3}>
          <Head>1 초 분량 chunk 의 평균 token 수</Head>
        </At>
        <At y={74} at={0.4}>
          <span style={line(C.muted, 22)}>
            <span style={{ color: C.dim }}>■</span> 값마다 bin 하나 (차원 × 주기) <span style={{ color: C.green, marginLeft: 18 }}>■</span> FAST
          </span>
        </At>
        {sets.map(([name, bin, fast, at], i) => (
          <At key={name} y={124 + i * 132} at={at} w={764}>
            <div style={{ display: 'grid', gap: 8 }}>
              <span style={line(i === 3 ? C.accent : C.text, 22)}>{name}</span>
              <Bar label="bin" value={bin} max={700} color={C.dim} at={at + 0.2} width={470} labelW={90} />
              <Bar label="FAST" value={fast} max={700} color={C.green} at={25.6 + i * 0.3} width={470} labelW={90} />
            </div>
          </At>
        ))}
        <At y={668} at={27.2} w={764}>
          <span style={line(C.muted, 21)}>압축 비율 1.75 · 3.6 · 5.0 · 13.2 (FAST 논문 Table I)</span>
        </At>
      </Card>
      <Card x={920} y={130} w={940} h={520} at={6.5}>
        <At y={24} at={6.5}>
          <Head color={C.accent}>FAST · 관절 하나의 8 step 예</Head>
        </At>
        <At y={78} at={7}>
          {row('관절 값', joint, 7, C.text)}
        </At>
        <At y={120} at={9} w={884}>
          <span style={line(C.muted, 21)}>로봇 팔의 움직임은 부드러워서 DCT 하면 앞의 몇 계수만 크다</span>
        </At>
        <At y={164} at={12.8}>
          {row('DCT 계수', coef, 12.8, C.orange, 2)}
        </At>
        <At x={178} y={204} at={13.3}>
          <svg width={8 * cellW} height={66}>
            <line x1={0} y1={33} x2={8 * cellW} y2={33} stroke={C.cardEdge} strokeWidth={1.5} />
            {coefV.map((v, i) => {
              const h = Math.max(2, Math.abs(v) * 40)
              return <rect key={i} x={i * cellW + cellW - 40} y={v >= 0 ? 33 - h : 33} width={28} height={h} rx={3} fill={i < 2 ? C.orange : C.dim} />
            })}
          </svg>
        </At>
        <At y={286} at={15.5}>
          {row('× 10 반올림', q, 15.5, C.orange, 2)}
        </At>
        <At y={328} at={17} w={884}>
          <span style={line(C.dim, 21)}>10 으로 나눠 되돌리면 원래 값과 가장 많이 달라도 약 0.024 · scale 10</span>
        </At>
        <At y={378} at={19}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 136, fontSize: 22, color: C.muted }}>BPE</span>
            <Toks toks={['8', '−4', '0 0 0 0 0 0']} hi={[2]} color={C.green} />
          </div>
        </At>
        <At y={442} at={20.2} w={884}>
          <span style={line(C.text, 22)}>
            이어진 0 같은 자주 나오는 묶음을 token 하나로 · BPE vocabulary <span style={mono(C.green, 22)}>1024</span>
          </span>
        </At>
      </Card>
      <Card x={920} y={680} w={940} h={190} at={25.5}>
        <At y={22} at={25.5}>
          <Head color={C.green} size={26}>
            π0-FAST 와 π0 (FAST 논문)
          </Head>
        </At>
        <At y={76} at={26.5} w={884}>
          <span style={line(C.text, 23)}>π0-FAST: 학습 GPU 시간이 π0 의 5 분의 1 · 비슷한 성능</span>
        </At>
        <At y={124} at={28.5} w={884}>
          <span style={line(C.muted, 22)}>RTX 4090 · 1 초 chunk 하나: π0 100 ms 안쪽, π0-FAST 약 750 ms</span>
        </At>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: 'text → UTF-8 byte 열 → token id 열 · byte 256 개에서 출발해 <unk> 없음', at: 1 },
    { tag: script.sections[1], color: C.blue, text: '가장 잦은 쌍을 merge · 16 → 12 → 9 → 7 · encode 는 배운 순서대로', at: 4.4 },
    { tag: script.sections[2], color: C.orange, text: 'bytes per token 1.00 → 3.09 · embedding 약 31% · 한국어 18 대 영어 6', at: 8.4 },
    { tag: script.sections[3], color: C.green, text: '값마다 256 개 bin 의 token · FAST = DCT + BPE · 700 → 평균 53', at: 12.4 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 160, display: 'grid', gap: 20, width: 1560 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={34}>
            같은 지시인데 한국어에는 왜 token 이 세 배나 필요하고, 로봇 행동은 어떻게 token 이 될까?
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
            NEXT · LANGUAGE
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 84, fontWeight: 600 }}>Transformer</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={34}>
            id 를 embedding 으로 바꾸고, 다른 token 을 함께 보며 뜻을 정하는 계산
          </Label>
        </Appear>
        <Appear at={1.6}>
          <Label color={C.muted} size={28}>
            action token 을 하나씩 생성하는 과정 · RT-2 → OpenVLA
          </Label>
        </Appear>
        <Appear at={2.2} style={{ marginTop: 50, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/tokenizer (Gage · Sennrich · GPT-2 · OpenVLA · FAST 논문)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseUnits = () => (
  <PauseWrite
    question='"hello world" (공백 포함) 를 글자 단위로 자르면 token 이 몇 개이고, 단어 단위로 자르면 몇 개일까?'
    answer={
      <>
        글자: h, e, l, l, o, ␣, w, o, r, l, d → 11 개
        <br />
        단어 (공백을 경계로): hello, world → 2 개
      </>
    }
  />
)

const PauseMerge = () => (
  <PauseWrite
    question='corpus "ab ab abc" 의 첫 회차에서 빈도가 가장 큰 쌍은? merge 한 뒤 sequence 는 token 몇 개일까?'
    answer={
      <>
        a b ␣ a b ␣ a b c 의 9 개 · (a, b) 3, (b, ␣) 2, (␣, a) 2, (b, c) 1
        <br />
        (a, b) 세 자리를 256 으로 → 9 − 3 = 6 개 (ab ␣ ab ␣ ab c)
      </>
    }
  />
)

const PauseVocab = () => (
  <PauseWrite
    question="special token 2 개를 두고 vocabulary 크기를 1000 으로 만들려면 merge 를 몇 번 해야 할까?"
    answer={
      <>
        V = 256 + M + S 에서 1000 = 256 + M + 2
        <br />M = 1000 − 256 − 2 = 742 번
      </>
    }
  />
)

const PauseBin = () => (
  <PauseWrite
    question="0 ~ 8 cm 를 1 cm 씩 8 개 bin 으로 나눌 때 6.7 cm 는 몇 번 bin 이고, 그 bin 을 되돌리면 몇 cm 일까?"
    answer={
      <>
        6.7 은 6 이상 7 미만 → bin 6 · 가운데 값 (6 + 7) ÷ 2 = 6.5 cm
        <br />
        0.2 cm 의 차이는 bin 으로 나눌 때 생기는 오차
      </>
    }
  />
)

export function Tokenizer() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        bytes: Bytes,
        units: Units,
        'pause-units': PauseUnits,
        'bpe-train': BpeTrain,
        encode: Encode,
        'pause-merge': PauseMerge,
        pretoken: Pretoken,
        'vocab-size': VocabSize,
        'pause-vocab': PauseVocab,
        bins: Bins,
        fast: Fast,
        'pause-bin': PauseBin,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
