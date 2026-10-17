import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { CONFIG } from '../config'

interface Props {
  firstProjectId: string
  projectCount: number
  onClose(): void
  onStart(id: string): void
}

export function Intro({ firstProjectId, projectCount, onClose, onStart }: Props) {
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
      <p className="intro-kicker">project-based self-study</p>
      <h2 id="intro-title">Physical AI from Scratch</h2>
      <p className="intro-lead">
        perceptron 부터 VLA·실물 로봇 배포까지, Physical AI 를 이루는 아이디어 {projectCount}개를 직접 구현하며 따라가는
        과제 지도입니다. 원 하나가 과제 하나이고, 선은 먼저 해 두면 좋은 과제를 잇습니다.
      </p>
      <ol className="intro-steps">
        <li>
          <strong>가운데 원에서 출발</strong>
          <span>NumPy Warm-up 부터 시작해 바깥쪽으로 넓혀 갑니다.</span>
        </li>
        <li>
          <strong>원을 눌러 과제 읽기</strong>
          <span>배경, 만들 것, 시작 코드 모양, 스스로 확인할 기준이 들어 있습니다.</span>
        </li>
        <li>
          <strong>리포를 fork 해서 직접 구현</strong>
          <span>
            <code>projects/&lt;과제&gt;/</code> 폴더에 코드를 둡니다. 정답 코드는 막혔을 때만 참고 자료에서 엽니다.
          </span>
        </li>
        <li>
          <strong>끝나면 완료로 표시</strong>
          <span>이어지는 과제가 밝아집니다. 이미 아는 내용이면 바로 완료로 표시하고 넘어가도 됩니다.</span>
        </li>
      </ol>
      <p className="intro-note">
        선수 관계는 권장 순서일 뿐 잠금이 아닙니다. 진행 기록은 이 브라우저에만 저장되고, 상단의 “진행 기록” 에서 파일로
        옮길 수 있습니다.
      </p>
      <div className="intro-actions">
        <button type="button" className="primary-button" onClick={() => onStart(firstProjectId)}>
          첫 과제 열기
        </button>
        <a className="text-button" href={CONFIG.repoUrl} target="_blank" rel="noreferrer">
          GitHub 리포
        </a>
      </div>
    </dialog>
  )
}
