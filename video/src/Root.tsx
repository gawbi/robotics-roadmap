import { Composition } from 'remotion'
import { BehaviorCloning } from './lessons/BehaviorCloning'
import behaviorCloningNarration from './lessons/behavior-cloning.narration.json'
import { script as behaviorCloning } from './lessons/behavior-cloning.script'
import { fitNarration, totalSeconds } from './script'
import { FPS, H, W } from './theme'

export function RemotionRoot() {
  return (
    <Composition
      id={behaviorCloning.id}
      component={BehaviorCloning}
      durationInFrames={Math.round(totalSeconds(fitNarration(behaviorCloning, behaviorCloningNarration).script) * FPS)}
      fps={FPS}
      width={W}
      height={H}
    />
  )
}
