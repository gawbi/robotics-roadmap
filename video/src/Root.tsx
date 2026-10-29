import type { ComponentType } from 'react'
import { Composition } from 'remotion'
import { Act } from './lessons/Act'
import actNarration from './lessons/act.narration.json'
import { script as act } from './lessons/act.script'
import { BehaviorCloning } from './lessons/BehaviorCloning'
import behaviorCloningNarration from './lessons/behavior-cloning.narration.json'
import { script as behaviorCloning } from './lessons/behavior-cloning.script'
import { Dagger } from './lessons/Dagger'
import daggerNarration from './lessons/dagger.narration.json'
import { script as dagger } from './lessons/dagger.script'
import { DrivingStack } from './lessons/DrivingStack'
import drivingStackNarration from './lessons/driving-stack.narration.json'
import { script as drivingStack } from './lessons/driving-stack.script'
import { PerceptiveLocomotion } from './lessons/PerceptiveLocomotion'
import perceptiveLocomotionNarration from './lessons/perceptive-locomotion.narration.json'
import { script as perceptiveLocomotion } from './lessons/perceptive-locomotion.script'
import { RealRobot } from './lessons/RealRobot'
import { RobotCodingAgent } from './lessons/RobotCodingAgent'
import robotCodingAgentNarration from './lessons/robot-coding-agent.narration.json'
import { script as robotCodingAgent } from './lessons/robot-coding-agent.script'
import realRobotNarration from './lessons/real-robot.narration.json'
import { script as realRobot } from './lessons/real-robot.script'
import { VlaTokens } from './lessons/VlaTokens'
import vlaTokensNarration from './lessons/vla-tokens.narration.json'
import { script as vlaTokens } from './lessons/vla-tokens.script'
import { TactileSensing } from './lessons/TactileSensing'
import tactileSensingNarration from './lessons/tactile-sensing.narration.json'
import { script as tactileSensing } from './lessons/tactile-sensing.script'
import { DataScaling } from './lessons/DataScaling'
import dataScalingNarration from './lessons/data-scaling.narration.json'
import { script as dataScaling } from './lessons/data-scaling.script'
import { GpuMotionGeneration } from './lessons/GpuMotionGeneration'
import gpuMotionGenerationNarration from './lessons/gpu-motion-generation.narration.json'
import { script as gpuMotionGeneration } from './lessons/gpu-motion-generation.script'
import { HumanoidLocomotion } from './lessons/HumanoidLocomotion'
import humanoidLocomotionNarration from './lessons/humanoid-locomotion.narration.json'
import { script as humanoidLocomotion } from './lessons/humanoid-locomotion.script'
import { HumanoidWbc } from './lessons/HumanoidWbc'
import humanoidWbcNarration from './lessons/humanoid-wbc.narration.json'
import { script as humanoidWbc } from './lessons/humanoid-wbc.script'
import { LeggedBalance } from './lessons/LeggedBalance'
import leggedBalanceNarration from './lessons/legged-balance.narration.json'
import { script as leggedBalance } from './lessons/legged-balance.script'
import { ObjectPose } from './lessons/ObjectPose'
import objectPoseNarration from './lessons/object-pose.narration.json'
import { script as objectPose } from './lessons/object-pose.script'
import { VlaReasoning } from './lessons/VlaReasoning'
import vlaReasoningNarration from './lessons/vla-reasoning.narration.json'
import { script as vlaReasoning } from './lessons/vla-reasoning.script'
import { fitNarration, totalSeconds, type Narration, type VideoScript } from './script'
import { FPS, H, W } from './theme'

// one composition per lesson video, in the order the study sessions use them
const VIDEOS: [VideoScript, ComponentType, Narration][] = [
  [behaviorCloning, BehaviorCloning, behaviorCloningNarration],
  [dagger, Dagger, daggerNarration],
  [act, Act, actNarration],
  [realRobot, RealRobot, realRobotNarration],
  [vlaTokens, VlaTokens, vlaTokensNarration],
  [drivingStack, DrivingStack, drivingStackNarration],
  [robotCodingAgent, RobotCodingAgent, robotCodingAgentNarration],
  [perceptiveLocomotion, PerceptiveLocomotion, perceptiveLocomotionNarration],
  [tactileSensing, TactileSensing, tactileSensingNarration],
  [dataScaling, DataScaling, dataScalingNarration],
  [gpuMotionGeneration, GpuMotionGeneration, gpuMotionGenerationNarration],
  [humanoidLocomotion, HumanoidLocomotion, humanoidLocomotionNarration],
  [humanoidWbc, HumanoidWbc, humanoidWbcNarration],
  [leggedBalance, LeggedBalance, leggedBalanceNarration],
  [objectPose, ObjectPose, objectPoseNarration],
  [vlaReasoning, VlaReasoning, vlaReasoningNarration],
]

export function RemotionRoot() {
  return (
    <>
      {VIDEOS.map(([script, component, narration]) => (
        <Composition
          key={script.id}
          id={script.id}
          component={component}
          durationInFrames={Math.round(totalSeconds(fitNarration(script, narration).script) * FPS)}
          fps={FPS}
          width={W}
          height={H}
        />
      ))}
    </>
  )
}
