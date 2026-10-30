import type { ReactNode } from 'react'
import { AbsoluteFill } from 'remotion'
import { Appear, Label, Panel, PauseWrite, prog, useSec } from '../kit'
import { LessonVideo } from '../LessonVideo'
import { C, MONO } from '../theme'
import narration from './motion-planning.narration.json'
import { script } from './motion-planning.script'

// Numbers follow lessons/motion-planning/README.md (see motion-planning.script.ts). The C-obstacle bands, the PRM roadmap,
// the RRT-Connect trees and the four paths are redrawn from the lesson's own figures (mp-quality, mp-prm, mp-rrt-connect),
// in degrees of the two joints; the ACM table is the one in mp-acm. The shelf and the small tree in the RRT step are
// schematic (marked 모식도).

// ---------- data redrawn from the lesson's figures (degrees: [joint 1, joint 2]) ----------

const BANDS: [number, number, number, number, number][] = [[-164,115,14.4,3,1],[-166,113,20.4,3,1],[-166,111,24.4,3,1],[-166,109,26.4,3,1],[-30,109,12.4,3,0],[-166,107,30.4,3,1],[-32,107,16.3,3,0],[-166,105,34.3,3,1],[-32,105,20.4,3,0],[-166,103,38.4,3,1],[-32,103,22.3,3,0],[-164,101,38.4,3,1],[-32,101,26.4,3,0],[-164,99,42.4,3,1],[-32,99,28.3,3,0],[-162,97,44.4,3,1],[-32,97,30.4,3,0],[-162,95,46.3,3,1],[-30,95,32.4,3,0],[-160,93,48.4,3,1],[-30,93,34.3,3,0],[-160,91,50.4,3,1],[-30,91,36.4,3,0],[-158,89,50.4,3,1],[-28,89,36.4,3,0],[-158,87,52.3,3,1],[-28,87,38.4,3,0],[-156,85,52.3,3,1],[-26,85,38.4,3,0],[-154,83,52.3,3,1],[-26,83,40.3,3,0],[-152,81,50.4,3,1],[-24,81,40.3,3,0],[-152,79,52.3,3,1],[-22,79,38.4,3,0],[-150,77,50.4,3,1],[-22,77,40.3,3,0],[-148,75,48.4,3,1],[-20,75,40.3,3,0],[-146,73,48.4,3,1],[-18,73,38.4,3,0],[-146,71,48.4,3,1],[-18,71,40.3,3,0],[-144,69,46.3,3,1],[-16,69,38.4,3,0],[-142,67,44.4,3,1],[-14,67,38.4,3,0],[-140,65,44.4,3,1],[-12,65,36.4,3,0],[-140,63,44.4,3,1],[-12,63,38.4,3,0],[-138,61,42.4,3,1],[-10,61,36.4,3,0],[-136,59,40.3,3,1],[-8,59,36.4,3,0],[-136,57,40.3,3,1],[-8,57,36.4,3,0],[-134,55,40.3,3,1],[-6,55,34.3,3,0],[-134,53,40.3,3,1],[-6,53,36.4,3,0],[-132,51,38.4,3,1],[-4,51,34.3,3,0],[-132,49,38.4,3,1],[-2,49,32.4,3,0],[-130,47,36.4,3,1],[-2,47,34.3,3,0],[-130,45,36.4,3,1],[0,45,32.4,3,0],[-128,43,36.4,3,1],[0,43,32.4,3,0],[-128,41,36.4,3,1],[2,41,32.4,3,0],[-126,39,34.3,3,1],[2,39,32.4,3,0],[-126,37,34.3,3,1],[4,37,30.4,3,0],[-124,35,32.4,3,1],[4,35,30.4,3,0],[-124,33,34.3,3,1],[4,33,32.4,3,0],[-124,31,34.3,3,1],[6,31,30.4,3,0],[-122,29,32.4,3,1],[6,29,30.4,3,0],[-122,27,32.4,3,1],[8,27,28.3,3,0],[-122,25,32.4,3,1],[8,25,30.4,3,0],[-120,23,32.4,3,1],[8,23,30.4,3,0],[-120,21,32.4,3,1],[10,21,28.3,3,0],[-120,19,32.4,3,1],[10,19,30.4,3,0],[-118,17,30.4,3,1],[12,17,28.3,3,0],[-118,15,30.4,3,1],[12,15,28.3,3,0],[-118,13,32.4,3,1],[12,13,28.3,3,0],[-116,11,30.4,3,1],[14,11,28.3,3,0],[-116,9,30.4,3,1],[14,9,28.3,3,0],[-116,7,30.4,3,1],[14,7,28.3,3,0],[-116,5,30.4,3,1],[14,5,28.3,3,0],[-114,3,30.4,3,1],[16,3,28.3,3,0],[-114,1,30.4,3,1],[16,1,28.3,3,0],[-114,-1,30.4,3,1],[16,-1,28.3,3,0],[-114,-3,30.4,3,1],[18,-3,28.3,3,0],[-112,-5,30.4,3,1],[18,-5,28.3,3,0],[-112,-7,30.4,3,1],[18,-7,28.3,3,0],[-112,-9,30.4,3,1],[20,-9,26.4,3,0],[-112,-11,30.4,3,1],[20,-11,28.3,3,0],[-110,-13,30.4,3,1],[20,-13,28.3,3,0],[-110,-15,30.4,3,1],[20,-15,28.3,3,0],[-110,-17,30.4,3,1],[22,-17,28.3,3,0],[-110,-19,30.4,3,1],[22,-19,28.3,3,0],[-110,-21,32.4,3,1],[22,-21,28.3,3,0],[-108,-23,30.4,3,1],[22,-23,30.4,3,0],[-108,-25,30.4,3,1],[24,-25,28.3,3,0],[-108,-27,32.4,3,1],[24,-27,30.4,3,0],[-108,-29,32.4,3,1],[24,-29,30.4,3,0],[-108,-31,32.4,3,1],[26,-31,28.3,3,0],[-106,-33,32.4,3,1],[26,-33,30.4,3,0],[-106,-35,32.4,3,1],[26,-35,30.4,3,0],[-106,-37,34.3,3,1],[26,-37,32.4,3,0],[-106,-39,34.3,3,1],[28,-39,30.4,3,0],[-106,-41,34.3,3,1],[28,-41,30.4,3,0],[-104,-43,34.3,3,1],[28,-43,32.4,3,0],[-104,-45,34.3,3,1],[28,-45,32.4,3,0],[-104,-47,36.4,3,1],[30,-47,32.4,3,0],[-104,-49,36.4,3,1],[30,-49,32.4,3,0],[-104,-51,38.4,3,1],[30,-51,34.3,3,0],[-104,-53,38.4,3,1],[32,-53,32.4,3,0],[-102,-55,38.4,3,1],[32,-55,34.3,3,0],[-102,-57,38.4,3,1],[32,-57,36.4,3,0],[-102,-59,40.3,3,1],[34,-59,34.3,3,0],[-102,-61,40.3,3,1],[34,-61,36.4,3,0],[-102,-63,42.4,3,1],[34,-63,36.4,3,0],[-100,-65,42.4,3,1],[36,-65,36.4,3,0],[-100,-67,42.4,3,1],[36,-67,38.4,3,0],[-100,-69,44.4,3,1],[38,-69,36.4,3,0],[-100,-71,46.3,3,1],[38,-71,38.4,3,0],[-100,-73,46.3,3,1],[40,-73,38.4,3,0],[-98,-75,46.3,3,1],[40,-75,40.3,3,0],[-98,-77,48.4,3,1],[42,-77,38.4,3,0],[-98,-79,50.4,3,1],[42,-79,40.3,3,0],[-96,-81,48.4,3,1],[44,-81,40.3,3,0],[-96,-83,50.4,3,1],[46,-83,38.4,3,0],[-96,-85,52.3,3,1],[46,-85,40.3,3,0],[-94,-87,52.3,3,1],[48,-87,40.3,3,0],[-92,-89,50.4,3,1],[50,-89,38.4,3,0],[-90,-91,50.4,3,1],[52,-91,38.4,3,0],[-88,-93,50.4,3,1],[54,-93,36.4,3,0],[-86,-95,48.4,3,1],[56,-95,36.4,3,0],[-84,-97,48.4,3,1],[58,-97,34.3,3,0],[-82,-99,46.3,3,1],[60,-99,32.4,3,0],[-78,-101,44.4,3,1],[64,-101,30.4,3,0],[-74,-103,40.3,3,1],[66,-103,28.3,3,0],[-72,-105,40.3,3,1],[68,-105,26.4,3,0],[-68,-107,36.4,3,1],[72,-107,22.3,3,0],[-64,-109,32.4,3,1],[74,-109,20.4,3,0],[-62,-111,32.4,3,1],[78,-111,16.3,3,0],[-58,-113,28.3,3,1],[80,-113,12.4,3,0],[-54,-115,22.3,3,1],[-50,-117,18.4,3,1],[-46,-119,12.4,3,1],[-40,-121,2.4,3,1]]
const PATH_RC: [number, number][] = [[-60,30],[-45,29.5],[-30,29],[-15,28.6],[0,28.1],[-0.6,13.1],[6.1,-0.4],[6.6,-15.4],[0.7,-29],[4.7,-43.6],[17.4,-51.5],[30.1,-59.4],[39.1,-71.4],[45.4,-85],[51.6,-98.6],[57.7,-112.3],[60.7,-118.9],[75.1,-114.6],[90.1,-114.2],[100,-102.8],[92,-90.1],[91.7,-88.7],[98.2,-75.1],[111.8,-69],[105.4,-55.4],[97.7,-42.6],[107,-30.8],[111.8,-25.1],[120.4,-12.7],[108.6,-3.4],[105.4,11.3],[99.4,25],[100,40]]
const PATH_SC: [number, number][] = [[-60,30],[75.1,-114.6],[90.1,-114.2],[100,-102.8],[100,40]]
const PATH_STAR: [number, number][] = [[-60,30],[-60.1,49.4],[-58.3,66.7],[-57.5,80.3],[-48.5,97.7],[-33.1,111.6],[-17.4,120.1],[-6.5,115.8],[10.2,104.2],[30.4,96.2],[46.8,83.4],[64.3,71.8],[73.1,63.2],[84.2,54.4],[94.3,46.1],[100,40]]
const PATH_PRM: [number, number][] = [[-60,30],[-68.4,82.7],[-8.3,131.5],[46.8,124.2],[40.6,56.4],[100,40]]
const PRM_NODES: [number, number][] = [[124,92.9],[-28.6,-86.8],[4.1,-34.2],[102.1,-70.8],[-8.4,30],[146.9,1.7],[-78.5,92],[42.6,-89.8],[147.5,173.8],[111.7,144.7],[-68.4,82.7],[143.6,66.2],[-10.1,-143.8],[-23.6,40],[148.7,168],[-8.3,131.5],[-86.3,109.8],[17.5,-175],[79.1,-36.5],[117,60.5],[-179.6,-2.3],[132.4,-92.2],[-62.9,133.3],[-94.1,168.4],[109.2,-18.7],[-151.1,-64.8],[2.9,155.9],[-140.8,18.5],[74.4,17],[113.2,14.5],[167,37.2],[27.2,-75.5],[-111.8,-112.8],[40.6,56.4],[-8.4,-147.7],[92.8,135.6],[152.4,123.2],[143.4,152.3],[14.6,-39.1],[112.2,125.8],[142.2,32.3],[161.9,28.7],[-17.8,57.7],[178.7,150.1],[105.6,-150.4],[46.8,124.2],[-92.5,83.3],[-137.9,-100.7],[106.1,-60.2],[113.8,-143.8],[-163.7,26.6],[147.6,12.4],[65,-170.4],[48.6,38.3],[27.4,-39.1],[-46.8,173],[-166.9,-172.2],[166,-113.4],[-135.4,-104.2],[108.2,157.3]]
const PRM_EDGES: [number, number, number, number][] = [[124,92.9,143.6,66.2],[124,92.9,117,60.5],[124,92.9,112.2,125.8],[124,92.9,152.4,123.2],[124,92.9,92.8,135.6],[124,92.9,111.7,144.7],[-28.6,-86.8,27.2,-75.5],[-28.6,-86.8,-10.1,-143.8],[-28.6,-86.8,4.1,-34.2],[-28.6,-86.8,-8.4,-147.7],[-28.6,-86.8,14.6,-39.1],[-28.6,-86.8,42.6,-89.8],[4.1,-34.2,14.6,-39.1],[4.1,-34.2,27.4,-39.1],[4.1,-34.2,27.2,-75.5],[4.1,-34.2,-8.4,30],[4.1,-34.2,42.6,-89.8],[102.1,-70.8,106.1,-60.2],[102.1,-70.8,132.4,-92.2],[102.1,-70.8,79.1,-36.5],[102.1,-70.8,109.2,-18.7],[102.1,-70.8,113.8,-143.8],[-8.4,30,-23.6,40],[-8.4,30,-17.8,57.7],[-8.4,30,-60,30],[146.9,1.7,147.6,12.4],[146.9,1.7,161.9,28.7],[146.9,1.7,142.2,32.3],[146.9,1.7,113.2,14.5],[146.9,1.7,167,37.2],[146.9,1.7,109.2,-18.7],[-78.5,92,-68.4,82.7],[-78.5,92,-92.5,83.3],[-78.5,92,-86.3,109.8],[-78.5,92,-62.9,133.3],[-78.5,92,-60,30],[-78.5,92,-17.8,57.7],[42.6,-89.8,27.2,-75.5],[42.6,-89.8,27.4,-39.1],[42.6,-89.8,14.6,-39.1],[147.5,173.8,148.7,168],[147.5,173.8,143.4,152.3],[147.5,173.8,178.7,150.1],[147.5,173.8,108.2,157.3],[147.5,173.8,111.7,144.7],[147.5,173.8,152.4,123.2],[111.7,144.7,108.2,157.3],[111.7,144.7,112.2,125.8],[111.7,144.7,92.8,135.6],[111.7,144.7,143.4,152.3],[111.7,144.7,148.7,168],[111.7,144.7,152.4,123.2],[-68.4,82.7,-92.5,83.3],[-68.4,82.7,-86.3,109.8],[-68.4,82.7,-62.9,133.3],[-68.4,82.7,-60,30],[-68.4,82.7,-17.8,57.7],[143.6,66.2,117,60.5],[143.6,66.2,142.2,32.3],[143.6,66.2,167,37.2],[143.6,66.2,161.9,28.7],[143.6,66.2,100,40],[-10.1,-143.8,-8.4,-147.7],[-10.1,-143.8,17.5,-175],[-10.1,-143.8,42.6,-89.8],[-10.1,-143.8,27.2,-75.5],[-10.1,-143.8,65,-170.4],[-23.6,40,-17.8,57.7],[-23.6,40,-60,30],[-23.6,40,-68.4,82.7],[148.7,168,143.4,152.3],[148.7,168,178.7,150.1],[148.7,168,108.2,157.3],[148.7,168,152.4,123.2],[-8.3,131.5,2.9,155.9],[-8.3,131.5,-62.9,133.3],[-8.3,131.5,46.8,124.2],[-8.3,131.5,-46.8,173],[-8.3,131.5,-68.4,82.7],[-86.3,109.8,-92.5,83.3],[-86.3,109.8,-62.9,133.3],[-86.3,109.8,-94.1,168.4],[-86.3,109.8,-46.8,173],[17.5,-175,-8.4,-147.7],[17.5,-175,65,-170.4],[17.5,-175,42.6,-89.8],[17.5,-175,105.6,-150.4],[17.5,-175,-28.6,-86.8],[79.1,-36.5,109.2,-18.7],[79.1,-36.5,106.1,-60.2],[79.1,-36.5,74.4,17],[79.1,-36.5,113.2,14.5],[117,60.5,100,40],[117,60.5,142.2,32.3],[117,60.5,113.2,14.5],[117,60.5,161.9,28.7],[-179.6,-2.3,-163.7,26.6],[-179.6,-2.3,-140.8,18.5],[-179.6,-2.3,-151.1,-64.8],[-179.6,-2.3,-137.9,-100.7],[-179.6,-2.3,-135.4,-104.2],[132.4,-92.2,166,-113.4],[132.4,-92.2,106.1,-60.2],[132.4,-92.2,113.8,-143.8],[132.4,-92.2,105.6,-150.4],[132.4,-92.2,109.2,-18.7],[-62.9,133.3,-46.8,173],[-62.9,133.3,-94.1,168.4],[-94.1,168.4,-46.8,173],[-94.1,168.4,-78.5,92],[-94.1,168.4,-92.5,83.3],[-94.1,168.4,-68.4,82.7],[109.2,-18.7,113.2,14.5],[109.2,-18.7,106.1,-60.2],[109.2,-18.7,147.6,12.4],[109.2,-18.7,74.4,17],[-151.1,-64.8,-137.9,-100.7],[-151.1,-64.8,-135.4,-104.2],[-151.1,-64.8,-111.8,-112.8],[-151.1,-64.8,-140.8,18.5],[-151.1,-64.8,-163.7,26.6],[2.9,155.9,-46.8,173],[2.9,155.9,46.8,124.2],[2.9,155.9,-62.9,133.3],[2.9,155.9,92.8,135.6],[2.9,155.9,-94.1,168.4],[-140.8,18.5,-163.7,26.6],[74.4,17,48.6,38.3],[74.4,17,100,40],[74.4,17,113.2,14.5],[74.4,17,40.6,56.4],[113.2,14.5,100,40],[113.2,14.5,142.2,32.3],[113.2,14.5,147.6,12.4],[167,37.2,161.9,28.7],[167,37.2,142.2,32.3],[167,37.2,147.6,12.4],[167,37.2,117,60.5],[27.2,-75.5,27.4,-39.1],[27.2,-75.5,14.6,-39.1],[-111.8,-112.8,-135.4,-104.2],[-111.8,-112.8,-137.9,-100.7],[-111.8,-112.8,-166.9,-172.2],[-111.8,-112.8,-10.1,-143.8],[40.6,56.4,48.6,38.3],[40.6,56.4,100,40],[-8.4,-147.7,65,-170.4],[-8.4,-147.7,42.6,-89.8],[-8.4,-147.7,27.2,-75.5],[92.8,135.6,112.2,125.8],[92.8,135.6,108.2,157.3],[92.8,135.6,46.8,124.2],[92.8,135.6,143.4,152.3],[152.4,123.2,143.4,152.3],[152.4,123.2,178.7,150.1],[152.4,123.2,112.2,125.8],[143.4,152.3,178.7,150.1],[143.4,152.3,108.2,157.3],[14.6,-39.1,27.4,-39.1],[112.2,125.8,108.2,157.3],[112.2,125.8,143.4,152.3],[142.2,32.3,161.9,28.7],[142.2,32.3,147.6,12.4],[161.9,28.7,147.6,12.4],[161.9,28.7,113.2,14.5],[-17.8,57.7,-60,30],[178.7,150.1,111.7,144.7],[178.7,150.1,108.2,157.3],[105.6,-150.4,113.8,-143.8],[105.6,-150.4,65,-170.4],[105.6,-150.4,166,-113.4],[105.6,-150.4,102.1,-70.8],[105.6,-150.4,42.6,-89.8],[46.8,124.2,112.2,125.8],[46.8,124.2,111.7,144.7],[46.8,124.2,40.6,56.4],[-92.5,83.3,-62.9,133.3],[-92.5,83.3,-60,30],[-92.5,83.3,-17.8,57.7],[-137.9,-100.7,-135.4,-104.2],[-137.9,-100.7,-166.9,-172.2],[106.1,-60.2,146.9,1.7],[113.8,-143.8,65,-170.4],[113.8,-143.8,166,-113.4],[113.8,-143.8,106.1,-60.2],[65,-170.4,42.6,-89.8],[48.6,38.3,100,40],[48.6,38.3,113.2,14.5],[-46.8,173,-78.5,92],[-166.9,-172.2,-135.4,-104.2],[-166.9,-172.2,-151.1,-64.8],[-166.9,-172.2,-10.1,-143.8],[-166.9,-172.2,-8.4,-147.7],[166,-113.4,102.1,-70.8],[166,-113.4,106.1,-60.2],[166,-113.4,109.2,-18.7],[100,40,142.2,32.3]]
const RC_EDGES: [number, number, number, number, number][] = [[-69,42,-60,30,0],[-45,29.5,-60,30,0],[-30,29,-45,29.5,0],[-15,28.6,-30,29,0],[0,28.1,-15,28.6,0],[-0.6,13.1,0,28.1,0],[-66,16.2,-60,30,0],[6.1,-0.4,-0.6,13.1,0],[-72.6,56.5,-69,42,0],[-81,16.1,-66,16.2,0],[-13,4.8,-0.6,13.1,0],[-24.5,-4.8,-13,4.8,0],[6.6,-15.4,6.1,-0.4,0],[21,-19.6,6.6,-15.4,0],[-87.4,59.3,-72.6,56.5,0],[0.7,-29,6.6,-15.4,0],[-63.7,68.6,-72.6,56.5,0],[-83,17.3,-81,16.1,0],[1.7,-5.4,6.1,-0.4,0],[-69.8,82.3,-63.7,68.6,0],[-81.2,92.2,-69.8,82.3,0],[-37.8,27.4,-45,29.5,0],[-76.7,106.6,-81.2,92.2,0],[4.7,-43.6,0.7,-29,0],[-70,119.9,-76.7,106.6,0],[17.4,-51.5,4.7,-43.6,0],[30.1,-59.4,17.4,-51.5,0],[-6.1,-53.9,4.7,-43.6,0],[-58.6,129.6,-70,119.9,0],[-20,-59.6,-6.1,-53.9,0],[-31.3,-69.5,-20,-59.6,0],[-46.2,-71.3,-31.3,-69.5,0],[39.1,-71.4,30.1,-59.4,0],[-90,113.4,-76.7,106.6,0],[-93.1,87.8,-81.2,92.2,0],[-53.3,143.6,-58.6,129.6,0],[45.4,-85,39.1,-71.4,0],[51.6,-98.6,45.4,-85,0],[57.7,-112.3,51.6,-98.6,0],[60.7,-118.9,57.7,-112.3,0],[85,40.2,100,40,1],[70,40.3,85,40.2,1],[55,40.6,70,40.3,1],[40,40.7,55,40.6,1],[99.4,25,100,40,1],[55,55.6,55,40.6,1],[105.4,11.3,99.4,25,1],[108.6,-3.4,105.4,11.3,1],[120.4,-12.7,108.6,-3.4,1],[111.8,-25.1,120.4,-12.7,1],[134.2,-18.5,120.4,-12.7,1],[107,-30.8,111.8,-25.1,1],[68.9,61.1,55,55.6,1],[43.6,65.3,55,55.6,1],[97.7,-42.6,107,-30.8,1],[143.3,-6.6,134.2,-18.5,1],[38,79.3,43.6,65.3,1],[105.4,-55.4,97.7,-42.6,1],[23.2,77.8,38,79.3,1],[111.8,-69,105.4,-55.4,1],[109.7,51.5,100,40,1],[98.2,-75.1,111.8,-69,1],[40.1,25.7,40,40.7,1],[109,66.5,109.7,51.5,1],[91.7,-88.7,98.2,-75.1,1],[92,-90.1,91.7,-88.7,1],[118.8,77.9,109,66.5,1],[11.9,87.6,23.2,77.8,1],[118.2,92.8,118.8,77.9,1],[120.8,107.5,118.2,92.8,1],[100,-102.8,92,-90.1,1],[135.7,106,120.8,107.5,1],[45.6,92.2,38,79.3,1],[131.9,70.6,118.8,77.9,1],[115,-103.1,100,-102.8,1],[119,-49.2,105.4,-55.4,1],[122.4,43.6,109.7,51.5,1],[132.4,32.4,122.4,43.6,1],[90.1,-114.2,100,-102.8,1],[75.1,-114.6,90.1,-114.2,1],[126.7,-71.2,111.8,-69,1],[141.7,-71.9,126.7,-71.2,1],[60.7,-118.9,75.1,-114.6,1]]

/** Panda SRDF self-collision table from mp-acm: row r lists the pairs (r, r + 1), (r, r + 2), …; A Adjacent, N Never, D Default, C checked */
const ACM = ['ANNNCCCCCC', 'ANNCCCCCC', 'ANCNCCCC', 'ANNNNNN', 'ANNNNN', 'ACCCC', 'ANNN', 'ANN', 'AA', 'D']

const S_Q: [number, number] = [-60, 30]
const G_Q: [number, number] = [100, 40]

// the 2-joint example: link 1 m each, pillar A at (1.25, 0.75) m, pillar B below the base, radius 0.3 m, link radius 0.05 m
const PILLAR_A: [number, number] = [1.25, 0.75]
const PILLAR_B: [number, number] = [-0.2, -1.35]
const RAD = Math.PI / 180

function fk(q: [number, number]): { e: [number, number]; p: [number, number] } {
  const e: [number, number] = [Math.cos(q[0] * RAD), Math.sin(q[0] * RAD)]
  return { e, p: [e[0] + Math.cos((q[0] + q[1]) * RAD), e[1] + Math.sin((q[0] + q[1]) * RAD)] }
}

function segDist(c: [number, number], a: [number, number], b: [number, number]) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const u = Math.max(0, Math.min(1, ((c[0] - a[0]) * dx + (c[1] - a[1]) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(a[0] + u * dx - c[0], a[1] + u * dy - c[1])
}

function hits(q: [number, number]): boolean {
  const { e, p } = fk(q)
  return [PILLAR_A, PILLAR_B].some((c) => Math.min(segDist(c, [0, 0], e), segDist(c, e, p)) < 0.35)
}

// ---------- small building blocks ----------

function Head({ children, color = C.text, size = 26 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <Label color={color} size={size} weight={600}>
      {children}
    </Label>
  )
}

/** a horizontal bar with its label on the left and the value at its end */
function Bar({ label, value, max, color, at, width = 420, unit = '', fmt, sub, labelW = 250, size = 24 }: { label: ReactNode; value: number; max: number; color: string; at: number; width?: number; unit?: string; fmt?: string; sub?: string; labelW?: number; size?: number }) {
  const t = useSec()
  const p = prog(t, at, 0.9)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: prog(t, at - 0.2, 0.3) }}>
      <span style={{ width: labelW, fontSize: size, textAlign: 'right', color: C.muted, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ width, height: 28, borderRadius: 8, background: C.grid }}>
        <div style={{ width: `${(100 * value * p) / max}%`, minWidth: 4, height: '100%', borderRadius: 8, background: color }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 600, color, whiteSpace: 'nowrap', opacity: prog(t, at + 0.6) }}>
        {fmt ?? value}
        {unit}
      </span>
      {sub && <span style={{ fontSize: 21, color: C.dim, whiteSpace: 'nowrap', opacity: prog(t, at + 0.8) }}>{sub}</span>}
    </div>
  )
}

function Box({ x, y, w, h, title, color = C.cardEdge, at, gap = 12, children }: { x: number; y: number; w: number; h: number; title?: ReactNode; color?: string; at: number; gap?: number; children?: ReactNode }) {
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
          <div style={{ padding: '11px 16px', borderRadius: 14, border: `1.5px solid ${color}88`, background: `${color}12`, fontSize: 23, fontWeight: 600, whiteSpace: 'nowrap', opacity: prog(t, at + i * gap) }}>{s}</div>
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

const line = (color = C.text, size = 22): React.CSSProperties => ({ fontSize: size, color, lineHeight: 1.45 })
const mono = (color = C.text, size = 24): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, color, fontWeight: 600, whiteSpace: 'nowrap' })

/** an SVG arrow with a triangular head */
function arrow(x1: number, y1: number, x2: number, y2: number, color: string, width = 3, head = 11, opacity = 1) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - head * Math.cos(a)
  const hy = y2 - head * Math.sin(a)
  const s = Math.sin(a) * (head / 2)
  const c = Math.cos(a) * (head / 2)
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + s},${hy - c} ${hx - s},${hy + c}`} fill={color} />
    </g>
  )
}

const pts = (p: [number, number][], X: (a: number) => number, Y: (b: number) => number) => p.map(([a, b]) => `${X(a)},${Y(b)}`).join(' ')

/** the whole C-space of the 2-joint example, −180° ~ 180° on both axes, drawn at (x, y) with side `size` */
function CSpace({ x, y, size, t, at, bandsAt, children }: { x: number; y: number; size: number; t: number; at: number; bandsAt: number; children?: (X: (a: number) => number, Y: (b: number) => number) => ReactNode }) {
  const k = size / 360
  const X = (a: number) => (a + 180) * k
  const Y = (b: number) => (180 - b) * k
  return (
    <g transform={`translate(${x}, ${y})`}>
      <g opacity={prog(t, at)}>
        <rect x={0} y={0} width={size} height={size} fill="#0f172a" stroke={C.cardEdge} strokeWidth={1.5} />
        <line x1={X(0)} x2={X(0)} y1={0} y2={size} stroke={C.cardEdge} strokeWidth={1} strokeDasharray="4 6" />
        <line x1={0} x2={size} y1={Y(0)} y2={Y(0)} stroke={C.cardEdge} strokeWidth={1} strokeDasharray="4 6" />
        {[-180, 0, 180].map((v) => (
          <g key={v}>
            <text x={X(v)} y={size + 26} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
              {v === -180 ? '−180°' : `${v}°`}
            </text>
            {v > -180 && (
              <text x={-8} y={Y(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {`${v}°`}
              </text>
            )}
          </g>
        ))}
      </g>
      <g opacity={prog(t, bandsAt, 0.9)}>
        {BANDS.map(([a, b, w, h, kind], i) => (
          <rect key={i} x={X(a)} y={Y(b + h)} width={w * k} height={h * k} fill={kind === 0 ? C.orange : C.purple} opacity={0.5} />
        ))}
      </g>
      {children?.(X, Y)}
    </g>
  )
}

function QDot({ X, Y, q, color, label, dx = 12, dy = -12, anchor = 'start', r = 7 }: { X: (a: number) => number; Y: (b: number) => number; q: [number, number]; color: string; label?: string; dx?: number; dy?: number; anchor?: 'start' | 'middle' | 'end'; r?: number }) {
  return (
    <g>
      <circle cx={X(q[0])} cy={Y(q[1])} r={r} fill={color} stroke={C.card} strokeWidth={2} />
      {label && (
        <text x={X(q[0]) + dx} y={Y(q[1]) + dy} textAnchor={anchor} fill={color} fontSize={22} fontWeight={700}>
          {label}
        </text>
      )}
    </g>
  )
}

/** a polyline revealed from start to end between `at` and `at + dur` */
function DrawLine({ p, X, Y, t, at, dur = 1.2, color, width = 4, dash }: { p: [number, number][]; X: (a: number) => number; Y: (b: number) => number; t: number; at: number; dur?: number; color: string; width?: number; dash?: string }) {
  const k = prog(t, at, dur)
  const n = Math.max(2, Math.ceil(k * p.length))
  const shown = p.slice(0, n)
  return <polyline points={pts(shown, X, Y)} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} opacity={prog(t, at - 0.1, 0.3)} />
}

// ---------- intro / question ----------

function Intro() {
  const t = useSec()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 24, marginTop: -60 }}>
        <Appear at={0.2}>
          <Label mono color={C.accent} size={28} weight={600} style={{ letterSpacing: '0.18em' }}>
            MOTION · MOTION PLANNING
          </Label>
        </Appear>
        <Appear at={0.5} dy={30}>
          <div style={{ fontFamily: MONO, fontSize: 112, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>Motion Planning</div>
        </Appear>
        <Appear at={0.8}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.muted }}>
            관절 각도의 공간에서 찾는 <span style={{ color: C.accent }}>충돌 없는 길</span>
          </div>
        </Appear>
        <Appear at={1.2}>
          <Label color={C.muted} size={40}>
            손끝뿐 아니라 팔 전체가 아무 데도 닿지 않는 길을 몇 초 안에 찾는 방법
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

/** side view of an arm reaching into a shelf (schematic); the elbow of the middle pose hits the shelf's front corner */
function Shelf({ t }: { t: number }) {
  const sh: [number, number] = [150, 330]
  const poses: { e: [number, number]; p: [number, number]; color: string; at: number; op: number }[] = [
    { e: [98, 35], p: [158, 246], color: C.dim, at: 0.6, op: 0.8 },
    { e: [400, 165], p: [617, 203], color: C.red, at: 1.6, op: 0.85 },
    { e: [432, 227], p: [647, 272], color: C.green, at: 1.1, op: 1 },
  ]
  return (
    <svg width={900} height={430}>
      <g opacity={prog(t, 0.4)}>
        <rect x={400} y={151} width={360} height={14} rx={3} fill={C.cardEdge} stroke={C.muted} strokeWidth={1.5} />
        <rect x={400} y={300} width={360} height={14} rx={3} fill={C.cardEdge} stroke={C.muted} strokeWidth={1.5} />
        <rect x={746} y={151} width={14} height={163} rx={3} fill={C.cardEdge} stroke={C.muted} strokeWidth={1.5} />
        <text x={580} y={138} textAnchor="middle" fill={C.muted} fontSize={22}>
          선반
        </text>
        <rect x={652} y={246} width={44} height={54} rx={6} fill={`${C.blue}33`} stroke={C.blue} strokeWidth={2} />
        <text x={674} y={234} textAnchor="middle" fill={C.blue} fontSize={22} fontWeight={600}>
          컵
        </text>
        <rect x={120} y={330} width={60} height={26} rx={5} fill={C.cardEdge} />
        <text x={880} y={30} textAnchor="end" fill={C.dim} fontSize={20}>
          모식도
        </text>
      </g>
      {poses.map(({ e, p, color, at, op }, i) => (
        <g key={i} opacity={prog(t, at) * op}>
          <polyline points={`${sh[0]},${sh[1]} ${e[0]},${e[1]} ${p[0]},${p[1]}`} fill="none" stroke={color} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
          <circle cx={e[0]} cy={e[1]} r={8} fill={C.text} />
          <circle cx={sh[0]} cy={sh[1]} r={9} fill={C.text} />
        </g>
      ))}
      <g opacity={prog(t, 2.2)}>
        <circle cx={400} cy={165} r={20} fill="none" stroke={C.red} strokeWidth={3} />
        <text x={230} y={118} fill={C.red} fontSize={22} fontWeight={600}>
          팔꿈치가 선반 모서리에 닿음
        </text>
      </g>
      <g opacity={prog(t, 1.4)}>
        <text x={470} y={360} fill={C.green} fontSize={22} fontWeight={600}>
          손은 컵 앞에 도착
        </text>
      </g>
    </svg>
  )
}

function Question() {
  const t = useSec()
  const rows: [string, string, string, number][] = [
    ['→', C.muted, 'Inverse Kinematics 로 구한 목표 각도까지 관절마다 고르게 돌리면', 0.6],
    ['✓', C.green, '손은 컵 앞에 제대로 도착한다', 1.2],
    ['✕', C.red, '가는 도중에 팔꿈치가 선반 모서리를 칠 수 있다', 2.0],
    ['?', C.accent, '관절 7 개의 각도 조합은 셀 수 없이 많다', 2.8],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={1792} h={430}>
        <div style={{ position: 'absolute', left: 0, top: 0 }}>
          <Shelf t={t} />
        </div>
        <div style={{ position: 'absolute', left: 930, top: 50, width: 820, display: 'grid', gap: 22 }}>
          <Label size={24} color={C.muted}>
            선반 안쪽의 컵을 집으려는 7 관절 팔
          </Label>
          {rows.map(([m, color, s, at]) => (
            <div key={s} style={{ display: 'flex', gap: 16, alignItems: 'baseline', opacity: prog(t, at) }}>
              <span style={{ color, fontSize: 28, fontWeight: 700, width: 28 }}>{m}</span>
              <span style={line(C.text, 26)}>{s}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Appear at={4.6} style={{ position: 'absolute', left: 64, top: 596, width: 1792 }}>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.3, textAlign: 'center', textWrap: 'balance' }}>
          손끝뿐 아니라 팔의 어느 부분도 닿지 않는 길을, <span style={{ color: C.accent }}>어떻게 몇 초 안에 찾을까?</span>
        </div>
      </Appear>
      <Card x={210} y={770} w={1500} h={110} at={5.6}>
        <div style={{ padding: '18px 30px', opacity: prog(t, 5.8) }}>
          <span style={line(C.muted, 24)}>
            <span style={{ color: C.text, fontWeight: 600 }}>motion planning</span>: 관절 각도의 공간에서 충돌 없는 길을 찾는 일 · 7 차원 공간은 칸으로 빠짐없이 나눌 수 없어서 자세를 무작위로 뽑는 sampling-based planner 를 쓴다
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

// ---------- C-space and the grid ----------

/** top view of the 2-joint arm and the two pillars; scale 100 px per m, base at (340, 270) */
function Workspace({ t, q, poseAt, pillarsAt }: { t: number; q: [number, number]; poseAt: number; pillarsAt: number }) {
  const s = 100
  const O: [number, number] = [340, 270]
  const P = (v: [number, number]) => [O[0] + v[0] * s, O[1] - v[1] * s]
  const arm = (qq: [number, number], color: string, w = 12, op = 1) => {
    const { e, p } = fk(qq)
    const [ex, ey] = P(e)
    const [px, py] = P(p)
    return (
      <g opacity={op}>
        <polyline points={`${O[0]},${O[1]} ${ex},${ey} ${px},${py}`} fill="none" stroke={color} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={O[0]} cy={O[1]} r={7} fill={C.text} />
        <circle cx={ex} cy={ey} r={6} fill={C.text} stroke={C.card} strokeWidth={2} />
      </g>
    )
  }
  const [ax, ay] = P(PILLAR_A)
  const [bx, by] = P(PILLAR_B)
  const hit = hits(q)
  return (
    <svg width={680} height={486}>
      <text x={24} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
        작업 공간 · 위에서 본 2 관절 팔
      </text>
      <g opacity={prog(t, pillarsAt)}>
        <circle cx={ax} cy={ay} r={0.3 * s} fill={`${C.orange}55`} stroke={C.orange} strokeWidth={2} />
        <text x={ax + 40} y={ay + 8} fill={C.orange} fontSize={22} fontWeight={600}>
          기둥 A
        </text>
        <circle cx={bx} cy={by} r={0.3 * s} fill={`${C.purple}55`} stroke={C.purple} strokeWidth={2} />
        <text x={bx - 40} y={by + 8} textAnchor="end" fill={C.purple} fontSize={22} fontWeight={600}>
          기둥 B
        </text>
        <text x={24} y={470} fill={C.muted} fontSize={20}>
          link 길이 1 m 두 개 · 기둥 반지름 0.3 m
        </text>
      </g>
      <g opacity={prog(t, poseAt)}>
        {arm(G_Q, C.red, 8, 0.45)}
        {arm(q, hit ? C.red : C.green)}
        <text x={656} y={40} textAnchor="end" fill={hit ? C.red : C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
          ({Math.round(q[0])}°, {Math.round(q[1])}°){hit ? ' · 닿음' : ''}
        </text>
      </g>
    </svg>
  )
}

function CSpaceScene() {
  const t = useSec()
  const u = prog(t, 22.6, 4.4)
  const q: [number, number] = [S_Q[0] + (G_Q[0] - S_Q[0]) * u, S_Q[1] + (G_Q[1] - S_Q[1]) * u]
  const notes: [ReactNode, number][] = [
    [<span style={line(C.text, 22)}>점 하나 = 두 관절 각도를 모두 정한 팔의 자세 하나</span>, 5.8],
    [
      <span style={line(C.muted, 22)}>
        출발 S <span style={mono(C.green, 22)}>(−60°, 30°)</span> · 목표 G <span style={mono(C.red, 22)}>(100°, 40°)</span>
      </span>,
      7.5,
    ],
    [
      <span style={line(C.muted, 22)}>
        <span style={{ color: C.orange, fontWeight: 600 }}>■ 기둥 A 에 닿는 자세</span> · <span style={{ color: C.purple, fontWeight: 600 }}>■ 기둥 B 에 닿는 자세</span>
      </span>,
      12.4,
    ],
    [
      <span style={line(C.text, 22)}>
        2° 칸 <span style={mono(C.text, 22)}>32,400</span> 개 중 <span style={mono(C.orange, 22)}>3,987</span> 개 → <span style={mono(C.orange, 22)}>3987 ÷ 32400 = 12.3%</span>
      </span>,
      16.8,
    ],
    [
      <span style={line(C.muted, 22)}>
        관절 1 이 <span style={mono(C.text, 22)}>31°</span> 면 관절 2 가 <span style={mono(C.orange, 22)}>−49° ~ 49°</span> 일 때 닿고, <span style={mono(C.text, 22)}>0°</span> 면 <span style={mono(C.orange, 22)}>46° ~ 97°</span>, <span style={mono(C.text, 22)}>60°</span> 면 <span style={mono(C.orange, 22)}>−96° ~ −42°</span> 일 때만 닿는다
      </span>,
      18.6,
    ],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={680} h={486}>
        <Workspace t={t} q={q} poseAt={0.5} pillarsAt={11.2} />
      </Panel>
      <Card x={768} y={130} w={1088} h={486} at={5.5}>
        <svg width={1088} height={486} style={{ position: 'absolute', left: 0, top: 0 }}>
          <text x={90} y={30} fill={C.muted} fontSize={20} opacity={prog(t, 5.7)}>
            관절 2 각도 ↑
          </text>
          <text x={270} y={462} textAnchor="middle" fill={C.muted} fontSize={20} opacity={prog(t, 5.7)}>
            관절 1 각도 →
          </text>
          <CSpace x={90} y={44} size={360} t={t} at={5.7} bandsAt={12}>
            {(X, Y) => (
              <>
                <g opacity={prog(t, 22.2)}>
                  <line x1={X(S_Q[0])} y1={Y(S_Q[1])} x2={X(G_Q[0])} y2={Y(G_Q[1])} stroke={C.text} strokeWidth={3} strokeDasharray="8 6" />
                </g>
                <g opacity={prog(t, 7.3)}>
                  <QDot X={X} Y={Y} q={S_Q} color={C.green} label="S" dx={-12} dy={-12} anchor="end" />
                  <QDot X={X} Y={Y} q={G_Q} color={C.red} label="G" dx={12} dy={-12} />
                </g>
                <g opacity={prog(t, 0.5)}>
                  <circle cx={X(q[0])} cy={Y(q[1])} r={9} fill="none" stroke={hits(q) ? C.red : C.text} strokeWidth={3} />
                </g>
              </>
            )}
          </CSpace>
        </svg>
        <div style={{ position: 'absolute', left: 500, top: 40, width: 560, display: 'grid', gap: 14 }}>
          {notes.map(([n, at], i) => (
            <div key={i} style={{ opacity: prog(t, at) }}>
              {n}
            </div>
          ))}
        </div>
      </Card>
      <Box x={64} y={636} w={880} h={244} at={0.4} title={<Head color={C.accent}>용어</Head>}>
        <span style={line(C.text, 23)}>
          <span style={{ color: C.accent, fontWeight: 600 }}>configuration</span>: 관절 각도를 모은 묶음, 팔의 자세 하나
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 2.6) }}>
          <span style={{ color: C.accent, fontWeight: 600 }}>C-space</span>: 관절이 가질 수 있는 모든 자세의 공간
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 14) }}>
          <span style={{ color: C.orange, fontWeight: 600 }}>C-obstacle</span>: 팔이 물체에 닿는 자세 · 나머지는 C-free
        </span>
      </Box>
      <Box x={968} y={636} w={888} h={244} at={22.2} color={`${C.red}88`} title={<Head color={C.red}>S → G 를 직선으로 이으면</Head>}>
        <span style={mono(C.text, 24)}>C-space 길이 √(160² + 10²) = 160.3°</span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 23.6) }}>
          관절 1 이 <span style={mono(C.orange, 23)}>5° ~ 35°</span> 를 지나는 동안 주황 띠 안에 있다
        </span>
        <span style={{ ...line(C.text, 23), opacity: prog(t, 25.2) }}>손끝은 닿지 않고 link 1 · link 2 의 몸통이 기둥 A 에 닿는다</span>
      </Box>
    </AbsoluteFill>
  )
}

function GridScene() {
  const t = useSec()
  const rows: [string, string, number, string, number, string][] = [
    ['2 관절', '1,296', Math.log10(1296), '162 byte', 0.6, C.green],
    ['3 관절', '46,656', Math.log10(46656), '5.8 KB', 1.4, C.green],
    ['6 관절', '약 21.8억', Math.log10(2.18e9), '272 MB', 6.2, C.orange],
    ['7 관절', '약 784억', Math.log10(7.84e10), '9.8 GB', 7.4, C.red],
  ]
  const piv: [number, number] = [60, 220]
  const L = 420
  const hi: [number, number] = [piv[0] + L * Math.cos(10 * RAD), piv[1] - L * Math.sin(10 * RAD)]
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={1040} h={470} at={0.3} title={<Head color={C.accent}>관절마다 10° 칸 36 개로 나눈 grid</Head>}>
        <div style={{ display: 'flex', gap: 20, color: C.muted, fontSize: 22, borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
          <span style={{ width: 120 }}>관절 수</span>
          <span style={{ width: 190, textAlign: 'right' }}>칸 수 (36ⁿ)</span>
          <span style={{ width: 330 }}>칸 수의 자릿수</span>
          <span style={{ width: 200, textAlign: 'right' }}>칸마다 1 bit</span>
        </div>
        {rows.map(([n, count, lg, size, at, color]) => (
          <div key={n} style={{ display: 'flex', gap: 20, alignItems: 'center', opacity: prog(t, at) }}>
            <span style={{ width: 120, fontSize: 26 }}>{n}</span>
            <span style={{ ...mono(color, 26), width: 190, textAlign: 'right' }}>{count}</span>
            <div style={{ width: 330, height: 26, borderRadius: 7, background: C.grid }}>
              <div style={{ width: `${(100 * lg * prog(t, at, 0.9)) / 11}%`, height: '100%', borderRadius: 7, background: color }} />
            </div>
            <span style={{ ...mono(color, 26), width: 200, textAlign: 'right' }}>{size}</span>
          </div>
        ))}
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 2.6) }}>
          <span style={mono(C.text, 22)}>36 × 36 = 1,296</span> 칸이면 A* 로 뒤져도 되지만, 관절이 하나 늘 때마다 칸 수가 <span style={mono(C.orange, 22)}>× 36</span>
        </span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 9.6) }}>7 관절은 막혔는지 아닌지만 적어도 9.8 GB · 칸마다 forward kinematics 와 충돌 검사도 한 번씩</span>
      </Box>
      <Box x={1128} y={130} w={728} h={470} at={12} title={<Head color={C.orange}>10° 칸도 촘촘하지 않다</Head>}>
        <svg width={672} height={270}>
          <g opacity={prog(t, 12.3)}>
            <line x1={piv[0]} y1={piv[1]} x2={piv[0] + L} y2={piv[1]} stroke={C.blue} strokeWidth={10} strokeLinecap="round" />
            <line x1={piv[0]} y1={piv[1]} x2={hi[0]} y2={hi[1]} stroke={C.blue} strokeWidth={10} strokeLinecap="round" opacity={0.45 + 0.55 * prog(t, 13.2)} />
            <circle cx={piv[0]} cy={piv[1]} r={9} fill={C.text} />
            <path d={`M ${piv[0] + 70} ${piv[1]} A 70 70 0 0 0 ${piv[0] + 70 * Math.cos(10 * RAD)} ${piv[1] - 70 * Math.sin(10 * RAD)}`} fill="none" stroke={C.muted} strokeWidth={2} />
            <text x={110} y={190} fill={C.muted} fontSize={22} fontFamily={MONO}>
              10°
            </text>
            <text x={240} y={256} fill={C.blue} fontSize={22}>
              link 0.8 m
            </text>
          </g>
          <g opacity={prog(t, 13.4)}>
            <path d={`M ${piv[0] + L} ${piv[1]} A ${L} ${L} 0 0 0 ${hi[0]} ${hi[1]}`} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="6 5" />
            <circle cx={piv[0] + L} cy={piv[1]} r={7} fill={C.orange} />
            <circle cx={hi[0]} cy={hi[1]} r={7} fill={C.orange} />
            <text x={520} y={190} fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              0.14 m
            </text>
          </g>
          <g opacity={prog(t, 15)}>
            <rect x={451} y={157} width={52} height={52} rx={6} fill={`${C.red}33`} stroke={C.red} strokeWidth={2} />
            <text x={451} y={262} fill={C.red} fontSize={22}>
              10 cm 물체
            </text>
          </g>
        </svg>
        <span style={{ ...mono(C.orange, 26), opacity: prog(t, 13.6) }}>0.8 × 0.1745 = 0.14 m</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 15.2) }}>칸 가운데에서만 검사하면 그 사이의 10 cm 물체를 놓칠 수 있다</span>
      </Box>
      <Box x={64} y={624} w={1792} h={256} at={18} color={`${C.accent}66`} title={<Head color={C.accent}>그래서 표를 만들지 않고, 필요한 자세만 그때그때 묻는다</Head>}>
        <Flow steps={['질문할 자세를 무작위로 고른다', 'collision checker: 이 자세가 충돌하는가?', 'PRM · RRT 가 graph · tree 로 잇는다']} color={C.accent} at={18.4} gap={1.1} />
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 21) }}>
          Franka Panda 의 관절 7 개를 실제 관절 범위대로 1° 칸으로 나누면, 칸마다 1 bit 씩만 적어도 <span style={mono(C.red, 22)}>14.5 PB</span>
        </span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- collision checking ----------

/** the seven primitives FCL handles, as small icons with their names */
function Primitives({ t, at }: { t: number; at: number }) {
  const names = ['sphere', 'box', 'cone', 'cylinder', 'capsule', 'convex mesh', 'plane']
  const cx = (i: number) => 58 + i * 116
  const c = C.blue
  const f = `${C.blue}33`
  const icon = (i: number) => {
    const x = cx(i)
    switch (i) {
      case 0:
        return <circle cx={x} cy={50} r={30} fill={f} stroke={c} strokeWidth={2} />
      case 1:
        return <rect x={x - 28} y={22} width={56} height={56} rx={4} fill={f} stroke={c} strokeWidth={2} />
      case 2:
        return <polygon points={`${x},18 ${x + 30},80 ${x - 30},80`} fill={f} stroke={c} strokeWidth={2} />
      case 3:
        return (
          <g>
            <rect x={x - 24} y={26} width={48} height={50} fill={f} stroke={c} strokeWidth={2} />
            <ellipse cx={x} cy={26} rx={24} ry={8} fill={C.card} stroke={c} strokeWidth={2} />
          </g>
        )
      case 4:
        return <rect x={x - 18} y={16} width={36} height={68} rx={18} fill={f} stroke={c} strokeWidth={2} />
      case 5:
        return <polygon points={`${x - 12},18 ${x + 26},30 ${x + 30},64 ${x},82 ${x - 30},60 ${x - 28},30`} fill={f} stroke={c} strokeWidth={2} />
      default:
        return <polygon points={`${x - 34},70 ${x - 12},34 ${x + 34},34 ${x + 12},70`} fill={f} stroke={c} strokeWidth={2} />
    }
  }
  return (
    <svg width={824} height={140}>
      {names.map((n, i) => (
        <g key={n} opacity={prog(t, at + i * 0.15)}>
          {icon(i)}
          <text x={cx(i)} y={124} textAnchor="middle" fill={C.muted} fontSize={20}>
            {n}
          </text>
        </g>
      ))}
    </svg>
  )
}

/** the Panda SRDF self-collision table: one cell per link pair, letters for the pairs switched off */
function AcmGrid({ t, at }: { t: number; at: number }) {
  const s = 27
  const fill = { A: '#475569', N: C.dim, D: C.purple, C: C.accent } as Record<string, string>
  return (
    <svg width={290} height={290}>
      {ACM.map((row, r) =>
        [...row].map((k, j) => {
          const c = r + j
          return (
            <g key={`${r}-${c}`} opacity={prog(t, at + r * 0.12)}>
              <rect x={10 + c * s} y={10 + r * s} width={s - 2} height={s - 2} rx={4} fill={fill[k]} opacity={k === 'C' ? 0.85 : 0.6} />
              {k !== 'C' && (
                <text x={10 + c * s + (s - 2) / 2} y={10 + r * s + 20} textAnchor="middle" fill={C.text} fontSize={20} fontFamily={MONO}>
                  {k}
                </text>
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}

function Collision() {
  const t = useSec()
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={880} h={330} at={0.3} title={<Head color={C.accent}>충돌 검사를 부른 횟수 · 2 관절 예시를 직접 실행</Head>}>
        <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
          <Bar label="RRT-Connect 경로 하나" value={943} max={5773} color={C.green} at={0.8} width={300} labelW={280} unit=" 번" />
          <Bar label="PRM roadmap 하나" value={5773} max={5773} color={C.blue} at={2.2} width={300} labelW={280} unit=" 번" fmt="5,773" />
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 3.6) }}>collision checker 는 자세마다 forward kinematics 로 link 를 놓고 겹치는지 검사한다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 4.6) }}>그래서 planner 전체의 속도는 검사 한 번에 드는 비용에 달려 있다</span>
      </Box>
      <Box x={968} y={130} w={888} h={330} at={6} title={<Head color={C.orange}>link 모양의 삼각형 수 · MoveIt 예제 Panda</Head>}>
        <div style={{ display: 'grid', gap: 14, marginTop: 8 }}>
          <Bar label="visual mesh" value={134924} max={134924} color={C.muted} at={6.4} width={380} labelW={200} fmt="134,924" />
          <Bar label="collision mesh" value={2364} max={134924} color={C.orange} at={7.6} width={380} labelW={200} fmt="2,364" />
        </div>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 9) }}>
          collision mesh 가 <span style={mono(C.orange, 22)}>약 57 분의 1</span> · link0 하나만 보면 <span style={mono(C.text, 22)}>20,483</span> 개 → <span style={mono(C.orange, 22)}>200</span> 개
        </span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 10.4) }}>URDF 의 link 마다 화면에 그릴 visual 모양과 충돌 검사용 collision 모양을 따로 적는다</span>
      </Box>
      <Box x={64} y={484} w={880} h={396} at={12.5} title={<Head color={C.blue}>primitive · MoveIt 2 의 기본 checker FCL 이 다루는 일곱 가지</Head>}>
        <Primitives t={t} at={12.8} />
        <span style={{ ...line(C.text, 22), opacity: prog(t, 14.4) }}>숫자 몇 개로 모양이 정해진다 · 대신 실제 link 보다 커서 좁은 틈을 막는다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 16) }}>일반 mesh 는 bounding volume hierarchy 로 먼 삼각형 쌍을 건너뛴다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 17.4) }}>cuRobo 같은 GPU planner 는 팔 전체를 구 여러 개로 근사한다</span>
      </Box>
      <Box x={968} y={484} w={888} h={396} at={19} title={<Head color={C.accent}>self-collision · allowed collision matrix (ACM)</Head>}>
        <div style={{ display: 'flex', gap: 20 }}>
          <AcmGrid t={t} at={19.3} />
          <div style={{ display: 'grid', gap: 8, alignContent: 'start', width: 500 }}>
            <span style={{ ...line(C.text, 21), opacity: prog(t, 19.5) }}>
              link 11 개 → <span style={mono(C.text, 21)}>11 × 10 ÷ 2 = 55</span> 쌍
            </span>
            <span style={{ ...line(C.muted, 21), opacity: prog(t, 20.8) }}>
              <span style={mono(C.text, 21)}>A</span> Adjacent <span style={mono(C.text, 21)}>10</span> 쌍 · 관절로 이어진 이웃
            </span>
            <span style={{ ...line(C.muted, 21), opacity: prog(t, 21.4) }}>
              <span style={mono(C.text, 21)}>N</span> Never <span style={mono(C.text, 21)}>23</span> 쌍 · 무작위 자세에서 한 번도 안 닿음
            </span>
            <span style={{ ...line(C.muted, 21), opacity: prog(t, 22) }}>
              <span style={mono(C.purple, 21)}>D</span> Default <span style={mono(C.text, 21)}>1</span> 쌍 · 기본 자세에서 닿아 있음
            </span>
            <span style={{ ...line(C.accent, 21), opacity: prog(t, 22.8) }}>
              <span style={mono(C.accent, 21)}>■</span> 검사 <span style={mono(C.accent, 21)}>21</span> 쌍 · 자세마다 <span style={mono(C.accent, 21)}>2.6 분의 1</span>
            </span>
            <span style={{ ...line(C.dim, 20), opacity: prog(t, 24) }}>SRDF 의 disable_collisions 로 적는다 · gripper 를 바꾸면 다시 만든다</span>
          </div>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

function Padding() {
  const t = useSec()
  // padding grows 0 → 0.05 → 0.1 m with the table, then to 0.11 m when the path disappears
  const pad = 0.05 * prog(t, 6.6, 0.9) + 0.05 * prog(t, 8.4, 0.9) + 0.01 * prog(t, 18.6, 0.8)
  const s = 400
  const ox = 50
  const oy = 300
  const r = (0.05 + pad) * s
  const closed = pad > 0.108
  const pc = ox + 1.458 * s
  const rows: [string, string, string, number, string][] = [
    ['0 m', '12.3%', '있음', 6.2, C.green],
    ['0.05 m', '17.3%', '있음', 6.9, C.green],
    ['0.1 m', '21.3%', '있음', 8.7, C.orange],
    ['0.11 m', '23.0%', '없음', 18.6, C.red],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={900} h={560}>
        <svg width={900} height={560}>
          <text x={24} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            link 1 이 기둥 A 옆을 지나는 틈 · 축척대로
          </text>
          <text x={876} y={40} textAnchor="end" fill={closed ? C.red : C.orange} fontSize={22} fontFamily={MONO} fontWeight={600} opacity={prog(t, 6.4)}>
            padding {pad < 0.025 ? '0' : pad < 0.075 ? '0.05' : pad < 0.105 ? '0.1' : '0.11'} m
          </text>
          <g opacity={prog(t, 0.5)}>
            <circle cx={pc} cy={oy} r={0.3 * s} fill={`${C.orange}44`} stroke={C.orange} strokeWidth={2} />
            <text x={pc + 20} y={oy - 10} textAnchor="middle" fill={C.orange} fontSize={22} fontWeight={600}>
              기둥 A
            </text>
            <text x={pc + 20} y={oy + 26} textAnchor="middle" fill={C.orange} fontSize={22}>
              반지름 0.3 m
            </text>
            <rect x={ox - r} y={oy - r} width={s + 2 * r} height={2 * r} rx={r} fill={closed ? `${C.red}33` : `${C.blue}22`} stroke={closed ? C.red : C.blue} strokeWidth={2} strokeDasharray={pad > 0.001 ? '6 5' : undefined} />
            <line x1={ox} y1={oy} x2={ox + s} y2={oy} stroke={C.blue} strokeWidth={0.1 * s} strokeLinecap="round" />
            <circle cx={ox} cy={oy} r={8} fill={C.text} />
            <text x={24} y={410} fill={C.blue} fontSize={22}>
              link 1 · 길이 1 m · 반지름 0.05 m
            </text>
          </g>
          <g opacity={prog(t, 12.2)}>
            <line x1={ox} x2={pc} y1={448} y2={448} stroke={C.muted} strokeWidth={2} />
            <line x1={ox} x2={ox} y1={438} y2={458} stroke={C.muted} strokeWidth={2} />
            <line x1={pc} x2={pc} y1={438} y2={458} stroke={C.muted} strokeWidth={2} />
            <text x={(ox + pc) / 2} y={486} textAnchor="middle" fill={C.muted} fontSize={22} fontFamily={MONO}>
              √(1.25² + 0.75²) = 1.458 m
            </text>
            {arrow(491, 170, 491, 222, closed ? C.red : C.green, 3, 11)}
            <text x={491} y={158} textAnchor="middle" fill={closed ? C.red : C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              {closed ? '틈 없음' : '틈 0.108 m'}
            </text>
          </g>
          <text x={24} y={534} fill={C.text} fontSize={24} fontFamily={MONO} fontWeight={600} opacity={prog(t, 13.4)}>
            틈 = 1.458 − 0.3 − 0.05 − 1 = 0.108 m
          </text>
        </svg>
      </Panel>
      <Box x={988} y={130} w={868} h={330} at={6} gap={10} title={<Head color={C.accent}>padding 과 막힌 자세 · 2° 칸으로 다시 셈</Head>}>
        <div style={{ display: 'flex', gap: 20, color: C.muted, fontSize: 22, borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
          <span style={{ width: 200 }}>padding</span>
          <span style={{ width: 260, textAlign: 'right' }}>막힌 자세의 비율</span>
          <span style={{ width: 240, textAlign: 'right' }}>S → G 경로</span>
        </div>
        {rows.map(([p, ratio, path, at, color]) => (
          <div key={p} style={{ display: 'flex', gap: 20, opacity: prog(t, at) }}>
            <span style={{ ...mono(C.text, 25), width: 200 }}>{p}</span>
            <span style={{ ...mono(color, 25), width: 260, textAlign: 'right' }}>{ratio}</span>
            <span style={{ fontSize: 25, color, fontWeight: 600, width: 240, textAlign: 'right' }}>{path}</span>
          </div>
        ))}
      </Box>
      <Box x={988} y={484} w={868} h={212} at={0.6} gap={8} title={<Head color={C.orange}>padding · 모양을 사방으로 키우는 안전 여유</Head>}>
        <span style={mono(C.text, 22)}>default_robot_padding = 0.0</span>
        <span style={mono(C.text, 22)}>default_object_padding = 0.0</span>
        <span style={line(C.muted, 22)}>MoveIt 2 의 기본값이 0 이라서 calibration · 추종 오차만큼 직접 정한다</span>
      </Box>
      <div style={{ position: 'absolute', left: 64, top: 714, width: 1792, display: 'flex', gap: 24 }}>
        <Appear at={19.6} style={{ width: 620 }}>
          <div style={{ height: 166, boxSizing: 'border-box', padding: '20px 26px', borderRadius: 18, background: `${C.red}14`, border: `1.5px solid ${C.red}55`, display: 'grid', alignContent: 'start', gap: 6 }}>
            <Label color={C.red} size={22} weight={600}>
              ✕ 흔한 오해
            </Label>
            <span style={line(C.text, 28)}>padding 은 클수록 안전하다</span>
          </div>
        </Appear>
        <Appear at={21} style={{ width: 1148 }}>
          <div style={{ height: 166, boxSizing: 'border-box', padding: '20px 26px', borderRadius: 18, background: `${C.green}14`, border: `1.5px solid ${C.green}55`, display: 'grid', alignContent: 'start', gap: 6 }}>
            <Label color={C.green} size={22} weight={600}>
              ✓ 사실
            </Label>
            <span style={line(C.text, 26)}>틈보다 크면 C-space 가 둘로 끊겨 길이 사라지고, 시작 자세가 padding 안이면 planning 을 시작하지도 못한다</span>
          </div>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

// ---------- PRM, RRT, RRT-Connect, RRT* ----------

function PrmRrt() {
  const t = useSec()
  // the RRT step, zoomed: joint 1 −20° ~ 100°, joint 2 0° ~ 100°, 3.2 px per degree
  const zx = (a: number) => 70 + (a + 20) * 3.2
  const zy = (b: number) => 384 - b * 3.2
  const near: [number, number] = [0, 20]
  const rand: [number, number] = [80, 80]
  const nw: [number, number] = [12, 29]
  const root: [number, number] = [-12, 4]
  const other: [number, number] = [25, 2]
  const steps: [string, string, number][] = [
    ['①', 'q_rand: C-space 에서 무작위로 뽑은 자세', 12.3],
    ['②', 'q_near: tree 에서 q_rand 와 가장 가까운 점', 13.4],
    ['③', 'q_new: q_near 에서 q_rand 쪽으로 ε 만큼 간 자세', 14.5],
    ['④', 'q_new 와 그 선분이 충돌 없으면 tree 에 붙이고, 막히면 버린다', 15.6],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={880} h={750}>
        <svg width={880} height={520}>
          <text x={24} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            PRM · 2 관절 예시의 roadmap
          </text>
          <CSpace x={70} y={64} size={384} t={t} at={0.4} bandsAt={0.4}>
            {(X, Y) => (
              <>
                <g opacity={prog(t, 6.2, 1.4) * 0.55}>
                  {PRM_EDGES.map(([a1, b1, a2, b2], i) => (
                    <line key={i} x1={X(a1)} y1={Y(b1)} x2={X(a2)} y2={Y(b2)} stroke={C.blue} strokeWidth={1.4} />
                  ))}
                </g>
                {PRM_NODES.map(([a, b], i) => (
                  <circle key={i} cx={X(a)} cy={Y(b)} r={4} fill={C.blue} opacity={prog(t, 1 + i * 0.05, 0.3)} />
                ))}
                <DrawLine p={PATH_PRM} X={X} Y={Y} t={t} at={8.6} dur={1.4} color={C.green} width={5} />
                <QDot X={X} Y={Y} q={S_Q} color={C.green} label="S" dx={-12} dy={-12} anchor="end" />
                <QDot X={X} Y={Y} q={G_Q} color={C.red} label="G" dx={12} dy={-12} />
              </>
            )}
          </CSpace>
        </svg>
        <div style={{ position: 'absolute', left: 490, top: 64, width: 366, display: 'grid', gap: 10 }}>
          <span style={{ ...mono(C.accent, 22), opacity: prog(t, 0.8) }}>① learning phase</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 1) }}>충돌 없는 자세 60 개를 무작위로 뽑고, 자세마다 가까운 6 개와 직선으로 이어 본다</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 6.4) }}>
            <span style={mono(C.blue, 22)}>228</span> 쌍 중 <span style={mono(C.blue, 22)}>197</span> 쌍이 충돌 없이 이어져 roadmap 이 된다
          </span>
          <span style={{ ...mono(C.accent, 22), opacity: prog(t, 8.2), marginTop: 8 }}>② query phase</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 8.4) }}>S 와 G 를 roadmap 의 가까운 점에 붙이고 graph search</span>
          <span style={{ ...mono(C.green, 22), opacity: prog(t, 9.6) }}>꼭짓점 6 개 · 316.1°</span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 560, width: 820, display: 'grid', gap: 8 }}>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 10.4) }}>roadmap 을 한 번 만들어 두면 같은 장면의 다른 질문에는 두 점만 붙이면 된다 (multi-query)</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 11) }}>물체가 움직이면 roadmap 의 edge 를 쓸 수 없게 되어, 질문 하나를 빨리 푸는 single-query 방법이 맞다</span>
          <span style={{ ...line(C.dim, 20), opacity: prog(t, 11.4) }}>Kavraki 와 동료들 · 1996</span>
        </div>
      </Panel>
      <Card x={968} y={130} w={888} h={750} at={12}>
        <svg width={888} height={420}>
          <text x={24} y={40} fill={C.text} fontSize={24} fontWeight={600}>
            RRT 의 한 step · C-space 를 확대
          </text>
          <rect x={70} y={64} width={384} height={320} fill="#0f172a" stroke={C.cardEdge} strokeWidth={1.5} />
          {[0, 50, 100].map((v) => (
            <g key={v}>
              <text x={zx(v)} y={410} textAnchor="middle" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {v}°
              </text>
              <text x={62} y={zy(v) + 7} textAnchor="end" fill={C.dim} fontSize={20} fontFamily={MONO}>
                {v}°
              </text>
            </g>
          ))}
          <g opacity={prog(t, 12.4) * 0.8}>
            <line x1={zx(root[0])} y1={zy(root[1])} x2={zx(near[0])} y2={zy(near[1])} stroke={C.muted} strokeWidth={2.5} />
            <line x1={zx(root[0])} y1={zy(root[1])} x2={zx(other[0])} y2={zy(other[1])} stroke={C.muted} strokeWidth={2.5} />
            <circle cx={zx(root[0])} cy={zy(root[1])} r={6} fill={C.muted} />
            <circle cx={zx(other[0])} cy={zy(other[1])} r={6} fill={C.muted} />
          </g>
          <g opacity={prog(t, 12.6)}>
            <circle cx={zx(rand[0])} cy={zy(rand[1])} r={8} fill={C.orange} />
            <text x={zx(rand[0])} y={zy(rand[1]) - 36} textAnchor="middle" fill={C.orange} fontSize={22} fontFamily={MONO} fontWeight={600}>
              q_rand
            </text>
            <text x={zx(rand[0])} y={zy(rand[1]) - 14} textAnchor="middle" fill={C.orange} fontSize={20} fontFamily={MONO}>
              (80°, 80°)
            </text>
          </g>
          <g opacity={prog(t, 13.6)}>
            <line x1={zx(near[0])} y1={zy(near[1])} x2={zx(rand[0])} y2={zy(rand[1])} stroke={C.orange} strokeWidth={2} strokeDasharray="7 6" opacity={0.7} />
            <circle cx={zx(near[0])} cy={zy(near[1])} r={8} fill={C.blue} />
            <text x={zx(near[0]) - 12} y={zy(near[1]) - 20} textAnchor="end" fill={C.blue} fontSize={22} fontFamily={MONO} fontWeight={600}>
              q_near
            </text>
          </g>
          <g opacity={prog(t, 14.6)}>
            {arrow(zx(near[0]), zy(near[1]), zx(nw[0]), zy(nw[1]), C.green, 5, 14)}
            <circle cx={zx(nw[0])} cy={zy(nw[1])} r={7} fill={C.green} />
            <text x={zx(nw[0]) + 18} y={zy(nw[1]) + 26} fill={C.green} fontSize={22} fontFamily={MONO} fontWeight={600}>
              q_new
            </text>
            <text x={zx(nw[0]) + 6} y={zy(nw[1]) + 52} fill={C.green} fontSize={22} fontFamily={MONO}>
              ε = 15°
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 480, top: 64, width: 384, display: 'grid', gap: 14 }}>
          {steps.map(([n, s, at]) => (
            <div key={n} style={{ display: 'flex', gap: 10, opacity: prog(t, at) }}>
              <span style={{ ...mono(C.accent, 22), width: 26 }}>{n}</span>
              <span style={line(C.text, 21)}>{s}</span>
            </div>
          ))}
          <span style={{ ...line(C.dim, 20), opacity: prog(t, 12.4) }}>회색 tree 는 모식도 · 세 점의 좌표는 강의 예시</span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 440, width: 828, display: 'grid', gap: 12 }}>
          <span style={{ ...mono(C.text, 24), opacity: prog(t, 18.2) }}>방향 (80, 60) · 길이 √(80² + 60²) = 100</span>
          <span style={{ ...mono(C.green, 24), opacity: prog(t, 19.6) }}>q_new = (0, 20) + (80, 60) × 15 ÷ 100 = (12°, 29°)</span>
          <span style={{ ...line(C.text, 22), opacity: prog(t, 24.2), marginTop: 6 }}>둘레가 빈 점일수록 q_near 로 뽑힐 확률이 커서, tree 가 아직 안 가 본 곳으로 빠르게 퍼진다</span>
          <span style={{ ...line(C.muted, 22), opacity: prog(t, 26.4) }}>
            goal bias: 일정 확률로 q_rand 자리에 목표를 넣는다 · OMPL RRT 기본값 <span style={mono(C.orange, 22)}>0.05</span> = 20 번에 한 번꼴
          </span>
        </div>
      </Card>
    </AbsoluteFill>
  )
}

function Connect() {
  const t = useSec()
  const fade = 1 - 0.7 * prog(t, 19, 0.8)
  const legend: [string, string, number, string?][] = [
    ['S 쪽 tree', C.green, 0.5],
    ['G 쪽 tree', C.blue, 0.8],
    ['RRT-Connect 경로', C.text, 7, '8 6'],
    ['shortcut 뒤', C.accent, 19.4],
    ['RRT* 표본 3,000', C.green, 26],
  ]
  return (
    <AbsoluteFill>
      <Panel x={64} y={130} w={880} h={750}>
        <svg width={880} height={620}>
          <text x={24} y={40} fill={C.text} fontSize={24} fontWeight={600} opacity={prog(t, 0.3)}>
            같은 2 관절 예시의 경로들
          </text>
          <CSpace x={70} y={64} size={510} t={t} at={0.3} bandsAt={0.3}>
            {(X, Y) => (
              <>
                <g opacity={fade}>
                  {RC_EDGES.map(([a1, b1, a2, b2, tree], i) => (
                    <line key={i} x1={X(a1)} y1={Y(b1)} x2={X(a2)} y2={Y(b2)} stroke={tree === 0 ? C.green : C.blue} strokeWidth={2} opacity={prog(t, 0.6 + i * 0.065, 0.3) * 0.85} />
                  ))}
                </g>
                <DrawLine p={PATH_RC} X={X} Y={Y} t={t} at={7} dur={1.6} color={C.text} width={3} dash="8 6" />
                <DrawLine p={PATH_SC} X={X} Y={Y} t={t} at={19.4} dur={1} color={C.accent} width={5} />
                <DrawLine p={PATH_STAR} X={X} Y={Y} t={t} at={26} dur={1.4} color={C.green} width={5} />
                <QDot X={X} Y={Y} q={S_Q} color={C.green} label="S" dx={-12} dy={-12} anchor="end" />
                <QDot X={X} Y={Y} q={G_Q} color={C.red} label="G" dx={12} dy={-12} />
              </>
            )}
          </CSpace>
          {legend.map(([name, color, at, dash], i) => (
            <g key={name} opacity={prog(t, at)}>
              <line x1={600} x2={628} y1={90 + i * 40} y2={90 + i * 40} stroke={color} strokeWidth={4} strokeDasharray={dash} />
              <text x={638} y={97 + i * 40} fill={C.muted} fontSize={21}>
                {name}
              </text>
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 30, top: 624, width: 820, display: 'grid', gap: 6 }}>
          <span style={{ ...line(C.text, 21), opacity: prog(t, 12.6) }}>
            <span style={{ color: C.accent, fontWeight: 600 }}>probabilistic completeness</span>: 길이 있다면 표본이 늘수록 찾을 확률 → 1
          </span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 14.4) }}>길이 없으면 정해 둔 시간을 다 쓰고 실패할 뿐, 없다는 증명은 못 한다</span>
          <span style={{ ...line(C.muted, 21), opacity: prog(t, 16) }}>좁은 틈은 무작위 점이 떨어질 확률이 낮아서 표본이 훨씬 많이 필요하다</span>
        </div>
      </Panel>
      <Box x={968} y={130} w={888} h={300} at={0.3} gap={10} title={<Head color={C.accent}>RRT-Connect · S 와 G 에서 tree 를 하나씩</Head>}>
        <span style={line(C.text, 22)}>tree A 를 무작위 점 쪽으로 ε 만큼 뻗는다</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 1.8) }}>tree B 는 A 에 새로 붙은 점을 향해 막힐 때까지 계속 뻗는다 (connect)</span>
        <span style={{ ...line(C.text, 22), opacity: prog(t, 3.4) }}>닿으면 경로 완성, 막히면 두 tree 의 역할을 바꿔 다음 반복</span>
        <span style={{ ...mono(C.text, 22), opacity: prog(t, 6.6) }}>ε = 15° · 144 번 반복 · tree 41 개 + 44 개</span>
        <span style={{ ...line(C.dim, 20), opacity: prog(t, 9) }}>Kuffner 와 LaValle · 2000 · MoveIt 2 가 따로 정하지 않으면 쓰는 방법</span>
      </Box>
      <Box x={968} y={454} w={888} h={426} at={6.6} gap={10} title={<Head color={C.orange}>경로 길이 · C-space 에서 잰 각도 합</Head>}>
        <Bar label="S · G 직선" value={160.3} max={460} color={C.dim} at={7} width={300} unit="°" sub="기둥에 막힘" />
        <Bar label="RRT-Connect" value={451.2} max={460} color={C.text} at={7.8} width={300} unit="°" sub="꼭짓점 33 개" />
        <Bar label="shortcut 100 번" value={370.7} max={460} color={C.accent} at={19.6} width={300} unit="°" sub="꼭짓점 5 개" />
        <Bar label="RRT* 표본 500" value={347.1} max={460} color={C.green} at={26} width={300} unit="°" />
        <Bar label="RRT* 표본 1,500" value={268.6} max={460} color={C.green} at={26.8} width={300} unit="°" />
        <Bar label="RRT* 표본 3,000" value={252.1} max={460} color={C.green} at={27.6} width={300} unit="°" sub="위쪽 길" />
        <Bar label="2° grid 의 최단" value={240} max={460} color={C.muted} at={29} width={300} unit="°" fmt="약 240" />
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 21.6) }}>shortcut 은 경로를 그 근처에서 곧게 펼 뿐, 띠를 넘어 위쪽 길로 옮기지 못한다</span>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- MoveIt 2 ----------

function Stage({ x, w, title, color, at, lines }: { x: number; w: number; title: string; color: string; at: number; lines: ReactNode[] }) {
  const t = useSec()
  return (
    <Box x={x} y={140} w={w} h={320} at={at} color={`${color}88`} gap={8} title={<span style={mono(color, 24)}>{title}</span>}>
      {lines.map((l, i) => (
        <span key={i} style={{ ...line(i === lines.length - 1 ? C.muted : C.text, 20), opacity: prog(t, at + 0.3 + i * 0.4) }}>
          {l}
        </span>
      ))}
    </Box>
  )
}

function MoveIt() {
  const t = useSec()
  const ws = [300, 380, 310, 320, 322]
  const xs = [64, 404, 824, 1174, 1534]
  const ats = [0.5, 6.2, 9.4, 12.8, 19.2]
  return (
    <AbsoluteFill>
      <Stage x={xs[0]} w={ws[0]} title="move_group" color={C.accent} at={ats[0]} lines={['ROS 2 action 으로 목표를 받는다', '/joint_states 와 TF 로 현재 자세를 안다', '계획과 실행 도중에 상태를 받아 보고 취소할 수 있다']} />
      <Stage x={xs[1]} w={ws[1]} title="request adapter" color={C.blue} at={ats[1]} lines={['작업 공간 범위가 비면 기본값으로 채운다', '관절 범위 밖: START_STATE_INVALID', '이미 충돌 중: START_STATE_IN_COLLISION', '어느 쪽이든 planner 를 부르지 않는다']} />
      <Stage x={xs[2]} w={ws[2]} title="OMPL planner" color={C.green} at={ats[2]} lines={['planning_pipeline 과 planner_id 로 고른다', 'PRM · RRT · RRT-Connect · RRT* 등', '자세가 유효한지는 밖에서 넘겨받은 함수에 묻는다']} />
      <Stage x={xs[3]} w={ws[3]} title="response adapter" color={C.orange} at={ats[3]} lines={['time parameterization 으로 시간을 붙인다', 'ValidateSolution: 경로를 다시 검사', 'DisplayMotionPath: RViz 에 경로 표시']} />
      <Stage x={xs[4]} w={ws[4]} title="controller" color={C.pink} at={ats[4]} lines={['FollowJointTrajectory action 으로 보낸다', '받는 server 는 move_group 이 아니라 로봇 쪽', 'ros2_control 의 controller 가 실행한다']} />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        {[1, 2, 3, 4].map((i) => (
          <g key={i}>{arrow(xs[i] - 36, 300, xs[i] - 4, 300, C.muted, 3, 12, prog(t, ats[i] - 0.2))}</g>
        ))}
        {[1, 2, 3].map((i) => (
          <line key={i} x1={xs[i] + ws[i] / 2} x2={xs[i] + ws[i] / 2} y1={466} y2={524} stroke={C.purple} strokeWidth={2} strokeDasharray="6 5" opacity={prog(t, Math.max(10.6, ats[i] + 0.4))} />
        ))}
      </svg>
      <Box x={64} y={530} w={1792} h={124} at={10.4} color={`${C.purple}88`} gap={6} title={<Head color={C.purple}>planning scene · 모든 단계가 여기에 충돌을 묻는다</Head>}>
        <span style={line(C.text, 21)}>로봇의 현재 자세 · 사용자가 넣은 물체 (상자 · 원기둥 · mesh) · 손에 든 물체 · depth 카메라로 만든 octomap · ACM · 충돌 검사는 FCL</span>
      </Box>
      <Box x={64} y={676} w={880} h={204} at={20.2} color={`${C.pink}88`} gap={8} title={<Head color={C.pink}>결과는 path 가 아니라 trajectory</Head>}>
        <span style={line(C.text, 22)}>관절 각도만 늘어놓은 것이 아니라 꼭짓점마다 시각 · 속도 · 가속도가 붙는다</span>
        <span style={{ ...line(C.muted, 22), opacity: prog(t, 21.4) }}>경로가 나왔는데 팔이 움직이지 않으면 controller 이름과 action 연결부터 의심한다</span>
      </Box>
      <Box x={968} y={676} w={888} h={204} at={22.4} gap={8}>
        <span style={line(C.red, 23)}>✕ planning 이 실패하면 planning 시간을 늘리면 된다</span>
        <span style={{ ...line(C.green, 23), opacity: prog(t, 23.6) }}>✓ 시작 자세가 이미 충돌 중이거나 목표 자세가 padding 안이면 시간을 아무리 늘려도 길이 없다</span>
      </Box>
    </AbsoluteFill>
  )
}

function Planners() {
  const t = useSec()
  const rows: [string, string, string, string, string, number][] = [
    ['OMPL RRTConnect', '무작위 tree 두 개', '돌아간다', '일반적인 이동', C.green, 0.4],
    ['Pilz PTP · LIN · CIRC', '정해진 모양 (관절 직선 · 손끝 직선 · 원호)', '돌아가지 않고, 닿으면 실패', '손끝 직선이 필요한 삽입, 같은 동작 반복', C.blue, 6.2],
    ['CHOMP', '초기 경로를 gradient 로 밀어냄', '밀어내며 피한다', '매끄러운 경로, OMPL 경로 다듬기', C.orange, 12.2],
    ['STOMP', '초기 경로에 noise 를 더한 후보를 비교', '후보 중 싼 쪽으로', 'gradient 를 구하기 어려운 비용', C.pink, 14.6],
  ]
  const w = [290, 520, 340, 520]
  return (
    <AbsoluteFill>
      <Box x={64} y={130} w={1792} h={360} at={0.3} gap={10} title={<Head color={C.accent}>MoveIt 2 에 함께 들어 있는 planner</Head>}>
        <div style={{ display: 'flex', gap: 16, color: C.muted, fontSize: 22, borderBottom: `1.5px solid ${C.cardEdge}`, paddingBottom: 6 }}>
          {['planner', '경로를 만드는 방식', '장애물', '쓰는 곳'].map((h, i) => (
            <span key={h} style={{ width: w[i] }}>
              {h}
            </span>
          ))}
        </div>
        {rows.map(([n, how, obs, use, color, at]) => (
          <div key={n} style={{ display: 'flex', gap: 16, fontSize: 23, opacity: prog(t, at), whiteSpace: 'nowrap' }}>
            <span style={{ width: w[0], color, fontWeight: 600 }}>{n}</span>
            <span style={{ width: w[1] }}>{how}</span>
            <span style={{ width: w[2] }}>{obs}</span>
            <span style={{ width: w[3], color: C.muted }}>{use}</span>
          </div>
        ))}
        <span style={{ ...line(C.muted, 21), opacity: prog(t, 8.4) }}>
          Pilz 는 사다리꼴 속도 profile 을 쓴다 · 장애물이 많으면 CHOMP 는 local minimum 에 갇히기 쉬워 OMPL 경로를 초기값으로 쓴다
        </span>
      </Box>
      <Box x={64} y={514} w={1792} h={366} at={18} color={`${C.accent}66`} title={<Head color={C.accent}>cuRobo · GPU planner · 논문 벤치마크 (MotionBenchMaker · MπNets 문제 2,600 개, RTX 4090)</Head>}>
        <div style={{ display: 'flex', gap: 40 }}>
          <div style={{ display: 'grid', gap: 10, width: 860 }}>
            <Label size={21} color={C.muted}>
              평균 계획 시간
            </Label>
            <Bar label="cuRobo" value={50} max={2950} color={C.accent} at={18.6} width={420} labelW={220} fmt="50 ms" />
            <Bar label="Tesseract (CPU)" value={2950} max={2950} color={C.muted} at={19.6} width={420} labelW={220} fmt="2.95 초" />
            <Label size={21} color={C.muted} style={{ opacity: prog(t, 24) }}>
              성공률
            </Label>
            <Bar label="cuRobo" value={99.8} max={100} color={C.accent} at={24.4} width={420} labelW={220} unit="%" />
            <Bar label="Tesseract (CPU)" value={98.53} max={100} color={C.muted} at={25.2} width={420} labelW={220} unit="%" />
          </div>
          <div style={{ display: 'grid', gap: 10, alignContent: 'start', width: 820 }}>
            <span style={{ ...line(C.text, 22), opacity: prog(t, 20.4) }}>팔을 구 여러 개로 근사해 충돌 거리를 빠르게 구한다</span>
            <span style={{ ...line(C.text, 22), opacity: prog(t, 21.2) }}>초기 경로 여러 개 (대부분의 환경에서 12 개) 를 동시에 최적화해 jerk 가 작은 trajectory 를 고른다</span>
            <span style={{ ...line(C.text, 22), opacity: prog(t, 26.4) }}>
              어려운 문제가 몰린 98번째 백분위: cuRobo <span style={mono(C.accent, 22)}>260 ms</span>, Tesseract <span style={mono(C.muted, 22)}>22 초</span>
            </span>
            <span style={{ ...line(C.muted, 22), opacity: prog(t, 27.4) }}>대신 GPU 가 필요하고 로봇마다 구 근사를 만든다 · MoveIt 2 plugin 은 cuMotion</span>
          </div>
        </div>
      </Box>
    </AbsoluteFill>
  )
}

// ---------- answer / outro / pauses ----------

function Answer() {
  const items = [
    { tag: script.sections[0], color: C.accent, text: '자세 하나 = C-space 의 점 하나 · 7 관절 10° 칸이면 약 784억 칸 → 필요한 자세만 뽑아 묻는다', at: 0.3 },
    { tag: script.sections[1], color: C.blue, text: 'collision mesh 2,364 개 · ACM 으로 55 → 21 쌍 · padding 은 틈 0.108 m 보다 작게', at: 4 },
    { tag: script.sections[2], color: C.orange, text: 'RRT-Connect 451.2° → shortcut 370.7° · RRT* 3,000 개 252.1° (최단 약 240°)', at: 8 },
    { tag: script.sections[3], color: C.pink, text: 'request adapter → OMPL RRTConnect (5 초) → time parameterization → controller', at: 12 },
  ]
  return (
    <AbsoluteFill style={{ alignItems: 'center' }}>
      <div style={{ marginTop: 150, display: 'grid', gap: 18, width: 1600 }}>
        <Appear at={0.2}>
          <Label color={C.muted} size={32}>
            팔 전체가 닿지 않는 길을 어떻게 몇 초 안에 찾을까?
          </Label>
        </Appear>
        {items.map((it, i) => (
          <Appear key={it.tag} at={it.at}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '18px 34px', borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardEdge}` }}>
              <span style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: it.color, width: 50 }}>{i + 1}</span>
              <div style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: 24, color: it.color }}>{it.tag}</span>
                <span style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.4 }}>{it.text}</span>
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
            NEXT
          </Label>
        </Appear>
        <Appear at={0.5}>
          <div style={{ fontFamily: MONO, fontSize: 76, fontWeight: 600 }}>ros2_control · Grasp Planning</div>
        </Appear>
        <Appear at={1}>
          <Label color={C.muted} size={32}>
            trajectory 가 FollowJointTrajectory action 을 거쳐 motor 의 position · velocity · effort 명령이 되는 과정
          </Label>
        </Appear>
        <Appear at={1.4}>
          <Label color={C.muted} size={32}>
            목표 자세를 어디로 정할지, 물체를 어떤 자세로 잡을지
          </Label>
        </Appear>
        <Appear at={2} style={{ marginTop: 60, display: 'grid', justifyItems: 'center', gap: 8 }}>
          <Label color={C.dim} size={22}>
            강의 원문: gawbi/robotics-roadmap · lessons/motion-planning (PRM · RRT · RRT-Connect · RRT* · OMPL · FCL · cuRobo 논문, MoveIt 2 문서)
          </Label>
          <Label mono color={C.dim} size={22}>
            gawbi.github.io/robotics-roadmap
          </Label>
        </Appear>
      </div>
    </AbsoluteFill>
  )
}

const PauseGrid = () => (
  <PauseWrite
    question="관절마다 20° 칸 18 개로 나누면 6 관절 팔의 칸 수는 10° 칸 (36 개) 일 때의 몇 분의 1 일까?"
    answer={
      <>
        36 → 18 로 절반 → 2⁶ = 64 분의 1 (18⁶ = 3400만 칸)
        <br />
        대신 한 칸에 손끝이 0.28 m 씩 움직여 장애물을 놓치기 쉽다
      </>
    }
  />
)

const PausePadding = () => (
  <PauseWrite
    question="길이 1 m, 반지름 0.05 m 인 link 가 원점에서 1.3 m 떨어진 반지름 0.15 m 기둥 옆을 지나간다. padding 이 몇 m 를 넘으면 지나갈 수 없을까?"
    answer={
      <>
        틈 = 1.3 − 0.15 − 0.05 − 1 = 0.1 m
        <br />
        padding 이 0.1 m 를 넘으면 link 끝이 기둥에 닿는다
      </>
    }
  />
)

const PauseRrt = () => (
  <PauseWrite
    question="q_near = (10°, 10°), q_rand = (40°, 50°), step 길이 ε = 10° 이면 q_new 는?"
    answer={
      <>
        방향 (30, 40) · 길이 √(30² + 40²) = 50
        <br />
        (30, 40) × 10 ÷ 50 = (6, 8) 을 더해 q_new = (16°, 18°)
      </>
    }
  />
)

const PauseDefault = () => (
  <PauseWrite
    question="planner_id 를 비워 두고 그룹 설정에도 default_planner_config 가 없다. 어떤 planner 가 몇 초 안에 경로를 찾으려 할까? (MoveGroupInterface 기본값)"
    answer={
      <>
        RRTConnect · 기본 planning 시간 5 초 · 시도 횟수 1
        <br />
        경로를 찾고 남은 시간은 단순화에 쓴다
      </>
    }
  />
)

export function MotionPlanning() {
  return (
    <LessonVideo
      script={script}
      narration={narration}
      scenes={{
        intro: Intro,
        question: Question,
        cspace: CSpaceScene,
        grid: GridScene,
        'pause-grid': PauseGrid,
        collision: Collision,
        padding: Padding,
        'pause-padding': PausePadding,
        'prm-rrt': PrmRrt,
        connect: Connect,
        'pause-rrt': PauseRrt,
        moveit: MoveIt,
        planners: Planners,
        'pause-default': PauseDefault,
        answer: Answer,
        outro: Outro,
      }}
    />
  )
}
