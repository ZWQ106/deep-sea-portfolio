"use client";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { ScrollControls, Scroll, Environment } from "@react-three/drei";

// 引入你刚才拆分的组件
import OceanBackground from "@/components/canvas/Ocean";
import SunBeams from "@/components/canvas/SunBeams";
import Bubbles from "@/components/canvas/Bubbles";
import { SmartFish, School } from "@/components/canvas/SmartFish";
import Jellyfish from "@/components/canvas/Jellyfish";
import { CameraRig, DepthSyncer } from "@/components/canvas/SceneLogic";

import DOMContent from "@/components/ui/Overlay";
import HUD from "@/components/ui/HUD";
import LoadingScreen from "@/components/ui/Loading";

export default function DeepSeaPage() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: 'black', position: 'relative' }}>
      
      {/* 1. UI 层 */}
      <LoadingScreen />
      <HUD />

      {/* 2. 3D 场景层 */}
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <Environment preset="city" /> 
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        <ScrollControls pages={5} damping={0.3}>
          {/* 逻辑控制 */}
          <DepthSyncer />
          <CameraRig />
          
          {/* 环境 */}
          <OceanBackground />
          <SunBeams count={12} />
          <Bubbles count={400} />
          
          {/* 生物 */}
          <School count={20} />
          <SmartFish modelUrl="/shark.glb" depthY={-20} scale={1.5} speed={1.2} rangeX={18} rangeZ={8} />
          <SmartFish modelUrl="/mantaray.glb" depthY={-35} scale={0.02} speed={0.6} rangeX={22} rangeZ={12} />
          <Jellyfish depthY={-45} scale={1} color="#00ffff" />
          
          {/* HTML 滚动内容 */}
          <Scroll html style={{ width: '100%' }}>
            <DOMContent />
          </Scroll>
          
        </ScrollControls>

        {/* 后处理 */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.9} intensity={0.05} />
          <Noise opacity={0.03} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}