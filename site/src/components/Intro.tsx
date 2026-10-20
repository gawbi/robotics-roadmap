import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { CONFIG } from '../config'

interface Props {
  firstLessonId: string
  lessonCount: number
  onClose(): void
  onStart(id: string): void
}

export function Intro({ firstLessonId, lessonCount, onClose, onStart }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialogRef.current!
    if (!d.open) d.showModal()
    const onCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }
    d.addEventListener('cancel', onCancel)
    return () => d.removeEventListener('cancel', onCancel)
  }, [onClose])

  return (
    <dialog ref={dialogRef} className="intro" aria-labelledby="intro-title">
      <button type="button" className="icon-button intro-close" onClick={onClose} aria-label="안내 닫기">
        <X size={20} aria-hidden="true" />
      </button>
      <p className="intro-kicker">lecture &amp; quiz self-study</p>
      <h2 id="intro-title">Physical AI Study</h2>
      <p className="intro-lead">
        perceptron 부터 VLA·실물 로봇 배포까지, Physical AI 를 이루는 아이디어 {lessonCount}개를 강의로 읽고 퀴즈로 확인하는
        지도입니다. 원 하나가 강의 하나이고, 선은 먼저 읽어 두면 좋은 강의를 잇습니다.
      </p>
      <ol className="intro-steps">
        <li>
          <strong>맨 위 원에서 출발</strong>
          <span>Linear Regression 부터 시작해 아래로 내려갑니다.</span>
        </li>
        <li>
          <strong>원을 눌러 강의 읽기</strong>
          <span>처음 보는 사람 기준으로 숫자 예시부터 한 단계씩 설명합니다. 코드를 짤 일은 없습니다.</span>
        </li>
        <li>
          <strong>강의 끝의 퀴즈 풀기</strong>
          <span>
            틀린 문항은 해설을 보여 주고, 틀린 문항만 같은 원리의 다른 문항으로 다시 풉니다. 틀린 문항이 남지 않으면 통과이고 이어지는 강의가 밝아집니다.
            답안은 <code>progress/&lt;강의&gt;.json</code> 에 저장되고, fork 에 커밋해 두면 다른 기기에서도 이어서 볼 수 있습니다.
          </span>
        </li>
      </ol>
      <p className="intro-note">
        선수 관계는 권장 순서일 뿐 잠금이 아닙니다. 퀴즈 답안은 리포에 저장되므로 리포의 <code>site/</code> 에서{' '}
        <code>npm run dev</code> 로 띄운 지도에서 풉니다.
      </p>
      <div className="intro-actions">
        <button type="button" className="primary-button" onClick={() => onStart(firstLessonId)}>
          첫 강의 열기
        </button>
        <a className="text-button" href={CONFIG.repoUrl} target="_blank" rel="noreferrer">
          GitHub 리포
        </a>
      </div>
    </dialog>
  )
}
