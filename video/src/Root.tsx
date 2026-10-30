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
import { LinearRegression } from './lessons/LinearRegression'
import linearRegressionNarration from './lessons/linear-regression.narration.json'
import { script as linearRegression } from './lessons/linear-regression.script'
import { Autograd } from './lessons/Autograd'
import autogradNarration from './lessons/autograd.narration.json'
import { script as autograd } from './lessons/autograd.script'
import { PytorchMlp } from './lessons/PytorchMlp'
import pytorchMlpNarration from './lessons/pytorch-mlp.narration.json'
import { script as pytorchMlp } from './lessons/pytorch-mlp.script'
import { Ros2Basics } from './lessons/Ros2Basics'
import ros2BasicsNarration from './lessons/ros2-basics.narration.json'
import { script as ros2Basics } from './lessons/ros2-basics.script'
import { ForwardKinematics } from './lessons/ForwardKinematics'
import forwardKinematicsNarration from './lessons/forward-kinematics.narration.json'
import { script as forwardKinematics } from './lessons/forward-kinematics.script'
import { Probability } from './lessons/Probability'
import probabilityNarration from './lessons/probability.narration.json'
import { script as probability } from './lessons/probability.script'
import { Transforms } from './lessons/Transforms'
import transformsNarration from './lessons/transforms.narration.json'
import { script as transforms } from './lessons/transforms.script'
import { Perceptron } from './lessons/Perceptron'
import perceptronNarration from './lessons/perceptron.narration.json'
import { script as perceptron } from './lessons/perceptron.script'
import { InverseKinematics } from './lessons/InverseKinematics'
import inverseKinematicsNarration from './lessons/inverse-kinematics.narration.json'
import { script as inverseKinematics } from './lessons/inverse-kinematics.script'
import { Derivatives } from './lessons/Derivatives'
import derivativesNarration from './lessons/derivatives.narration.json'
import { script as derivatives } from './lessons/derivatives.script'
import { MujocoSim } from './lessons/MujocoSim'
import mujocoSimNarration from './lessons/mujoco-sim.narration.json'
import { script as mujocoSim } from './lessons/mujoco-sim.script'
import { PidControl } from './lessons/PidControl'
import pidControlNarration from './lessons/pid-control.narration.json'
import { script as pidControl } from './lessons/pid-control.script'
import { VectorsMatrices } from './lessons/VectorsMatrices'
import vectorsMatricesNarration from './lessons/vectors-matrices.narration.json'
import { script as vectorsMatrices } from './lessons/vectors-matrices.script'
import { CameraGeometry } from './lessons/CameraGeometry'
import cameraGeometryNarration from './lessons/camera-geometry.narration.json'
import { script as cameraGeometry } from './lessons/camera-geometry.script'
import { RlExperiments } from './lessons/RlExperiments'
import rlExperimentsNarration from './lessons/rl-experiments.narration.json'
import { script as rlExperiments } from './lessons/rl-experiments.script'
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
  [linearRegression, LinearRegression, linearRegressionNarration],
  [autograd, Autograd, autogradNarration],
  [pytorchMlp, PytorchMlp, pytorchMlpNarration],
  [ros2Basics, Ros2Basics, ros2BasicsNarration],
  [forwardKinematics, ForwardKinematics, forwardKinematicsNarration],
  [probability, Probability, probabilityNarration],
  [transforms, Transforms, transformsNarration],
  [perceptron, Perceptron, perceptronNarration],
  [inverseKinematics, InverseKinematics, inverseKinematicsNarration],
  [derivatives, Derivatives, derivativesNarration],
  [mujocoSim, MujocoSim, mujocoSimNarration],
  [pidControl, PidControl, pidControlNarration],
  [vectorsMatrices, VectorsMatrices, vectorsMatricesNarration],
  [cameraGeometry, CameraGeometry, cameraGeometryNarration],
  [rlExperiments, RlExperiments, rlExperimentsNarration],
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
