import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { CONFIG } from '../config'
import { CONNECTABLE } from '../curriculum/learner'

interface Props {
  firstLessonId: string
  lessonCount: number
  onClose(): void
  onStart(id: string): void
  onPortfolio(): void
  onConnect(): void
}

export function Intro({ firstLessonId, lessonCount, onClose, onStart, onPortfolio, onConnect }: Props) {
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
      <p className="intro-kicker">{CONFIG.owner.name} · study record</p>
      <h2 id="intro-title">Robotics Roadmap</h2>
      <p className="intro-lead">
        제어·상태 추정·딥러닝부터 VLA 까지, 로보틱스 일을 하는 데 필요한 아이디어 {lessonCount}개를 강의로 읽고 면접에서 나올
        법한 퀴즈로 확인하는 지도입니다. 원 하나가 강의 하나이고, 선은 먼저 읽어 두면 좋은 강의를 잇습니다. 이 지도를 따라
        공부하며 남긴 퀴즈 기록, 직접 쓴 노트, 직접 구현한 코드가 함께 있습니다.
      </p>
      <ol className="intro-steps">
        <li>
          <strong>가운데 동심원에서 출발</strong>
          <span>세 트리가 함께 쓰는 수학·ROS 2·좌표 변환·제어 기초가 가운데 동심원에 있습니다. 그 바깥으로 아래는 robot learning, 왼쪽 위는 manipulation, 오른쪽 위는 mobile robot·자율주행 트리가 뻗고, 지원하는 직무의 트리를 따라 읽어 나갑니다.</span>
        </li>
        <li>
          <strong>원을 눌러 강의 읽기</strong>
          <span>처음 보는 사람 기준으로 그림과 숫자 예시로 설명하고, 수식과 계산은 접힌 심화 블록에 둡니다. 원 오른쪽 위의 점은 내 노트, 왼쪽 위의 마름모는 구현 코드가 있는 강의이고, 강의 창의 탭에서 열립니다.</span>
        </li>
        <li>
          <strong>강의 끝의 퀴즈 풀기</strong>
          <span>
            틀린 문항은 해설을 보여 주고, 틀린 문항만 같은 원리의 다른 문항으로 다시 풉니다. 틀린 문항이 남지 않으면 통과이고 이어지는 강의가 밝아집니다.
            GitHub 를 연결하면 답안이 내 리포의 <code>progress/&lt;강의&gt;.json</code> 에 커밋되고, 통과한 강의가 지도에 칠해집니다.
          </span>
        </li>
      </ol>
      <p className="intro-note">
        선수 관계는 권장 순서일 뿐 잠금이 아닙니다. GitHub 를 연결하지 않고 푼 퀴즈는 새로고침하면 사라집니다. <b>내 공부 시작</b> 으로 내
        GitHub 리포를 연결하면 퀴즈와 노트가 그 리포에 커밋되어 내 잔디가 되고, 폰에서도 이어서 공부할 수 있습니다. 커리큘럼은{' '}
        <a href={CONFIG.upstreamUrl} target="_blank" rel="noreferrer">
          {CONFIG.upstreamUrl.replace('https://github.com/', '')}
        </a>{' '}
        를 바탕으로 합니다.
      </p>
      <div className="intro-actions">
        <button type="button" className="primary-button" onClick={onPortfolio}>
          공부 기록 보기
        </button>
        {CONNECTABLE && (
          <button type="button" className="text-button" onClick={onConnect}>
            내 공부 시작
          </button>
        )}
        <button type="button" className="text-button" onClick={() => onStart(firstLessonId)}>
          첫 강의 열기
        </button>
        <a className="text-button" href={CONFIG.repoUrl} target="_blank" rel="noreferrer">
          GitHub 리포
        </a>
      </div>
    </dialog>
  )
}
