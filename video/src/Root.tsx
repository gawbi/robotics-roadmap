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
import { LidarSlam } from './lessons/LidarSlam'
import lidarSlamNarration from './lessons/lidar-slam.narration.json'
import { script as lidarSlam } from './lessons/lidar-slam.script'
import { RewardScale } from './lessons/RewardScale'
import rewardScaleNarration from './lessons/reward-scale.narration.json'
import { script as rewardScale } from './lessons/reward-scale.script'
import { LocomotionDeployment } from './lessons/LocomotionDeployment'
import locomotionDeploymentNarration from './lessons/locomotion-deployment.narration.json'
import { script as locomotionDeployment } from './lessons/locomotion-deployment.script'
import { PathTracking } from './lessons/PathTracking'
import pathTrackingNarration from './lessons/path-tracking.narration.json'
import { script as pathTracking } from './lessons/path-tracking.script'
import { Ros2Control } from './lessons/Ros2Control'
import ros2ControlNarration from './lessons/ros2-control.narration.json'
import { script as ros2Control } from './lessons/ros2-control.script'
import { PathPlanning } from './lessons/PathPlanning'
import pathPlanningNarration from './lessons/path-planning.narration.json'
import { script as pathPlanning } from './lessons/path-planning.script'
import { HandEyeCalibration } from './lessons/HandEyeCalibration'
import handEyeCalibrationNarration from './lessons/hand-eye-calibration.narration.json'
import { script as handEyeCalibration } from './lessons/hand-eye-calibration.script'
import { MotionPlanning } from './lessons/MotionPlanning'
import motionPlanningNarration from './lessons/motion-planning.narration.json'
import { script as motionPlanning } from './lessons/motion-planning.script'
import { Pi0 } from './lessons/Pi0'
import pi0Narration from './lessons/pi0.narration.json'
import { script as pi0 } from './lessons/pi0.script'
import { ClassicalPick } from './lessons/ClassicalPick'
import classicalPickNarration from './lessons/classical-pick.narration.json'
import { script as classicalPick } from './lessons/classical-pick.script'
import { Groot } from './lessons/Groot'
import grootNarration from './lessons/groot.narration.json'
import { script as groot } from './lessons/groot.script'
import { OffPolicy } from './lessons/OffPolicy'
import offPolicyNarration from './lessons/off-policy.narration.json'
import { script as offPolicy } from './lessons/off-policy.script'
import { DiffusionPolicy } from './lessons/DiffusionPolicy'
import diffusionPolicyNarration from './lessons/diffusion-policy.narration.json'
import { script as diffusionPolicy } from './lessons/diffusion-policy.script'
import { Ppo } from './lessons/Ppo'
import ppoNarration from './lessons/ppo.narration.json'
import { script as ppo } from './lessons/ppo.script'
import { CriticLoss } from './lessons/CriticLoss'
import criticLossNarration from './lessons/critic-loss.narration.json'
import { script as criticLoss } from './lessons/critic-loss.script'
import { TeleopDataset } from './lessons/TeleopDataset'
import teleopDatasetNarration from './lessons/teleop-dataset.narration.json'
import { script as teleopDataset } from './lessons/teleop-dataset.script'
import { ImpedanceControl } from './lessons/ImpedanceControl'
import impedanceControlNarration from './lessons/impedance-control.narration.json'
import { script as impedanceControl } from './lessons/impedance-control.script'
import { Sim2realLocomotion } from './lessons/Sim2realLocomotion'
import sim2realLocomotionNarration from './lessons/sim2real-locomotion.narration.json'
import { script as sim2realLocomotion } from './lessons/sim2real-locomotion.script'
import { TrajectoryGeneration } from './lessons/TrajectoryGeneration'
import trajectoryGenerationNarration from './lessons/trajectory-generation.narration.json'
import { script as trajectoryGeneration } from './lessons/trajectory-generation.script'
import { Cnn } from './lessons/Cnn'
import cnnNarration from './lessons/cnn.narration.json'
import { script as cnn } from './lessons/cnn.script'
import { PolicyGradient } from './lessons/PolicyGradient'
import policyGradientNarration from './lessons/policy-gradient.narration.json'
import { script as policyGradient } from './lessons/policy-gradient.script'
import { ObjectDetection } from './lessons/ObjectDetection'
import objectDetectionNarration from './lessons/object-detection.narration.json'
import { script as objectDetection } from './lessons/object-detection.script'
import { Gpt } from './lessons/Gpt'
import gptNarration from './lessons/gpt.narration.json'
import { script as gpt } from './lessons/gpt.script'
import { Clip } from './lessons/Clip'
import clipNarration from './lessons/clip.narration.json'
import { script as clip } from './lessons/clip.script'
import { Vae } from './lessons/Vae'
import vaeNarration from './lessons/vae.narration.json'
import { script as vae } from './lessons/vae.script'
import { Ddpm } from './lessons/Ddpm'
import ddpmNarration from './lessons/ddpm.narration.json'
import { script as ddpm } from './lessons/ddpm.script'
import { LidarPerception } from './lessons/LidarPerception'
import lidarPerceptionNarration from './lessons/lidar-perception.narration.json'
import { script as lidarPerception } from './lessons/lidar-perception.script'
import { VisualSlam } from './lessons/VisualSlam'
import visualSlamNarration from './lessons/visual-slam.narration.json'
import { script as visualSlam } from './lessons/visual-slam.script'
import { ParticleFilter } from './lessons/ParticleFilter'
import particleFilterNarration from './lessons/particle-filter.narration.json'
import { script as particleFilter } from './lessons/particle-filter.script'
import { BanditMdp } from './lessons/BanditMdp'
import banditMdpNarration from './lessons/bandit-mdp.narration.json'
import { script as banditMdp } from './lessons/bandit-mdp.script'
import { Rt1 } from './lessons/Rt1'
import rt1Narration from './lessons/rt1.narration.json'
import { script as rt1 } from './lessons/rt1.script'
import { FlowMatching } from './lessons/FlowMatching'
import flowMatchingNarration from './lessons/flow-matching.narration.json'
import { script as flowMatching } from './lessons/flow-matching.script'
import { KalmanFilter } from './lessons/KalmanFilter'
import kalmanFilterNarration from './lessons/kalman-filter.narration.json'
import { script as kalmanFilter } from './lessons/kalman-filter.script'
import { Transformer } from './lessons/Transformer'
import transformerNarration from './lessons/transformer.narration.json'
import { script as transformer } from './lessons/transformer.script'
import { Vit } from './lessons/Vit'
import vitNarration from './lessons/vit.narration.json'
import { script as vit } from './lessons/vit.script'
import { Resnet } from './lessons/Resnet'
import resnetNarration from './lessons/resnet.narration.json'
import { script as resnet } from './lessons/resnet.script'
import { Tokenizer } from './lessons/Tokenizer'
import tokenizerNarration from './lessons/tokenizer.narration.json'
import { script as tokenizer } from './lessons/tokenizer.script'
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
  [lidarSlam, LidarSlam, lidarSlamNarration],
  [rewardScale, RewardScale, rewardScaleNarration],
  [locomotionDeployment, LocomotionDeployment, locomotionDeploymentNarration],
  [pathTracking, PathTracking, pathTrackingNarration],
  [ros2Control, Ros2Control, ros2ControlNarration],
  [pathPlanning, PathPlanning, pathPlanningNarration],
  [handEyeCalibration, HandEyeCalibration, handEyeCalibrationNarration],
  [motionPlanning, MotionPlanning, motionPlanningNarration],
  [pi0, Pi0, pi0Narration],
  [classicalPick, ClassicalPick, classicalPickNarration],
  [groot, Groot, grootNarration],
  [offPolicy, OffPolicy, offPolicyNarration],
  [diffusionPolicy, DiffusionPolicy, diffusionPolicyNarration],
  [ppo, Ppo, ppoNarration],
  [criticLoss, CriticLoss, criticLossNarration],
  [teleopDataset, TeleopDataset, teleopDatasetNarration],
  [impedanceControl, ImpedanceControl, impedanceControlNarration],
  [sim2realLocomotion, Sim2realLocomotion, sim2realLocomotionNarration],
  [trajectoryGeneration, TrajectoryGeneration, trajectoryGenerationNarration],
  [cnn, Cnn, cnnNarration],
  [policyGradient, PolicyGradient, policyGradientNarration],
  [objectDetection, ObjectDetection, objectDetectionNarration],
  [gpt, Gpt, gptNarration],
  [clip, Clip, clipNarration],
  [vae, Vae, vaeNarration],
  [ddpm, Ddpm, ddpmNarration],
  [lidarPerception, LidarPerception, lidarPerceptionNarration],
  [visualSlam, VisualSlam, visualSlamNarration],
  [particleFilter, ParticleFilter, particleFilterNarration],
  [banditMdp, BanditMdp, banditMdpNarration],
  [rt1, Rt1, rt1Narration],
  [flowMatching, FlowMatching, flowMatchingNarration],
  [kalmanFilter, KalmanFilter, kalmanFilterNarration],
  [transformer, Transformer, transformerNarration],
  [vit, Vit, vitNarration],
  [resnet, Resnet, resnetNarration],
  [tokenizer, Tokenizer, tokenizerNarration],
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
