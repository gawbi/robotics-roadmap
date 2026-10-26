// Turns a caption into text a Korean TTS voice reads well: English technical terms in Hangul, numbers and units read the
// way a Korean speaker says them ("0.3 m" → "영 점 삼 미터"). Pure, so export-speech.mjs can run it with plain Node.

/** marks a word this module put in, so a particle the captions keep apart ("policy 는") can join it when spoken */
const JOIN = '\u0002'
/** marks the start of a number read aloud, so its first syllable ("이" for 2) is never taken for a particle */
const NUM = '\u0003'
const PARTICLE = /\u0002 (은|는|이|가|을|를|의|에|와|과|로|으로|에서|도|만|까지|보다|이고|이면|이라|이라서|입니다|이다|이며)(?=[\s.,?!]|$)/g

/** longest first, so "compounding error" wins over "error" */
const TERMS: [RegExp, string][] = (
  [
    ['behavior cloning', '비헤이비어 클로닝'],
    ['supervised learning', '슈퍼바이즈드 러닝'],
    ['compounding error', '컴파운딩 에러'],
    ['distribution shift', '디스트리뷰션 시프트'],
    ['validation loss', '밸리데이션 로스'],
    ['validation set', '밸리데이션 셋'],
    ['diffusion policy', '디퓨전 폴리시'],
    ['multimodal', '멀티모달'],
    ['validation', '밸리데이션'],
    ['histogram', '히스토그램'],
    ['compound', '컴파운드'],
    ['episode', '에피소드'],
    ['rollout', '롤아웃'],
    ['bagnell', '배그널'],
    ['expert', '엑스퍼트'],
    ['policy', '폴리시'],
    ['action', '액션'],
    ['dagger', '대거'],
    ['style', '스타일'],
    ['error', '에러'],
    ['step', '스텝'],
    ['loss', '로스'],
    ['ross', '로스'],
    ['mode', '모드'],
    ['rt-1', '알티 원'],
    ['mse', '엠에스이'],
    ['act', '에이씨티'],
    ['t²ε', '티 제곱 엡실론'],
  ] as const
).map(([en, ko]) => [new RegExp(`(?<![A-Za-z])${en.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}(?![A-Za-z])`, 'gi'), `${ko}${JOIN}`])

const LETTERS: Record<string, string> = {
  a: '에이', b: '비', c: '씨', d: '디', e: '이', f: '에프', g: '지', h: '에이치', i: '아이', j: '제이', k: '케이', l: '엘', m: '엠',
  n: '엔', o: '오', p: '피', q: '큐', r: '알', s: '에스', t: '티', u: '유', v: '브이', w: '더블유', x: '엑스', y: '와이', z: '지',
}

const DIGIT = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

/** sino-Korean reading of a whole number below 10⁸ */
export function readInt(n: number): string {
  if (n === 0) return '영'
  const group = (g: number) =>
    [1000, 100, 10, 1]
      .map((unit, i) => {
        const d = Math.floor(g / unit) % 10
        if (d === 0) return ''
        const name = ['천', '백', '십', ''][i]
        return (d === 1 && name ? '' : DIGIT[d]) + name
      })
      .join('')
  const man = Math.floor(n / 10000)
  const rest = n % 10000
  return `${man ? `${man === 1 ? '' : group(man)}만` : ''}${rest ? group(rest) : ''}`
}

function readNumber(s: string): string {
  const [int, frac] = s.replace(/,/g, '').split('.')
  const whole = readInt(Number(int))
  return frac === undefined ? whole : `${whole} 점 ${[...frac].map((d) => DIGIT[Number(d)]).join(' ')}`
}

const UNIT_WORD: Record<string, string> = { ms: '밀리초', m: '미터', hz: '헤르츠', '°': '도', '%': '퍼센트' }

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')

/** `extra`: a video's own readings, applied before the shared list */
export function speakable(text: string, extra: [string, string][] = []): string {
  let s = text
  const own: [RegExp, string][] = [...extra]
    .sort((a, b) => b[0].length - a[0].length)
    .map(([en, ko]) => [new RegExp(/^[A-Za-z]/.test(en) ? `(?<![A-Za-z])${escape(en)}(?![A-Za-z])` : escape(en), 'gi'), `${ko}${JOIN}`])
  for (const [re, ko] of [...own, ...TERMS]) s = s.replace(re, ko)
  // numbers, with the sign before them and the unit after them; a comma counts only as a thousands separator (1,190)
  s = s.replace(
    /(±|[−-](?=\d)|\+(?=\d))?(\d(?:\d|,(?=\d{3}))*(?:\.\d+)?)(?:\s?(ms|m|Hz)(?![A-Za-z])|(°)|\s?(%))?/g,
    (_m, sign: string | undefined, num: string, unit?: string, deg?: string, pct?: string) => {
      const signWord = sign === '±' ? '플러스 마이너스 ' : sign === '+' ? '플러스 ' : sign ? '마이너스 ' : ''
      const u = unit ?? deg ?? pct
      return `${NUM}${signWord}${readNumber(num)}${u ? ` ${UNIT_WORD[u.toLowerCase()]}${JOIN}` : ''}`
    },
  )
  s = s.replace(/×/g, ' 곱하기 ').replace(/÷/g, ' 나누기 ').replace(/²/g, ' 제곱').replace(/ε/g, '엡실론').replace(/→/g, ', ').replace(/·/g, ', ')
  // single Latin letters left over (y, z) are read as letter names
  s = s.replace(/(?<![A-Za-z])([A-Za-z])(?![A-Za-z])/g, (_m, l: string) => `${LETTERS[l.toLowerCase()]}${JOIN}`)
  return s.replace(/\s+/g, ' ').replace(PARTICLE, '$1').replaceAll(JOIN, '').replaceAll(NUM, '').replace(/ ([.,?!])/g, '$1').trim()
}

/** English words the term list does not cover yet, so they can be added before a render */
export const unknownWords = (spoken: string) => [...new Set(spoken.match(/[A-Za-z]{2,}/g) ?? [])]
