"use client";

import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll, Preload, useGLTF, Loader, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";

// 引入我们的新 Hooks 和组件
import { useIsMobile } from "@/hooks/useIsMobile";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Overlay from "@/components/ui/Overlay";
import HUD from "@/components/ui/HUD";

// 引入 3D 组件
import { CameraRig, DepthSyncer } from "@/components/canvas/CameraRig";
import WaterSurface from "@/components/canvas/WaterSurface";
import SunBeams from "@/components/canvas/SunBeams";
import Bubbles from "@/components/canvas/Bubbles";
import SkyClouds from "@/components/canvas/SkyClouds";
import { SmartFish, School } from "@/components/canvas/SmartFish";
import Jellyfish from "@/components/canvas/Jellyfish";
import Boat from "@/components/canvas/Boat";           // 👈 加这个
import OceanBackground from "@/components/canvas/Ocean"; // 👈 加这个

// 预加载资源 (放在这里确保一开始就开始加载)
useTexture.preload("/waternormals.jpg");
useGLTF.preload("/shark.glb");
useGLTF.preload("/tuna.glb");
useGLTF.preload("/jellyfish.glb");
useGLTF.preload("/mantaray.glb");
useGLTF.preload("/fishing_boat.glb");

export default function DeepSeaPage() {
  const isMobile = useIsMobile();
  const cameraZ = isMobile ? 18 : 10;

  return (
    <div style={{ width: "100vw", height: "100vh", background: 'black', position: 'relative' }}>
      <LoadingScreen />
      <HUD />

      <Canvas camera={{ position: [0, 0, cameraZ], fov: 60 }}>
        {/* 光照设置 */}
        <directionalLight 
          position={[30, 2, 20]}  // 从右前方打过来，角度很平
          intensity={2.0}         // 强度适中，不要太曝
          color="#ffaa00"         // 纯金色阳光
          castShadow              
        />

        {/* 💜 2. 环境光 (Fill Light) */}
        {/* 日出时阴影不是灰色的，而是紫色的 (天空散射) */}
        <ambientLight 
          intensity={0.5} 
          color="#6a5acd"         // 蓝紫色 (SlateBlue)
        />

        {/* 🌗 3. 半球光 (Hemisphere Light) */}
        {/* 天空是紫色，海面是深色，增加立体感 */}
        <hemisphereLight 
          skyColor="#2b32b2"      // 对应 Ocean.jsx 里的 sky 颜色
          groundColor="#000000"   // 地面黑色
          intensity={0.5}         
        />
        
        {/* 🌫️ 4. 雾气 (Atmosphere) - 这里的颜色必须和地平线颜色一致！ */}
        {/* 这样海平面就会融化在金色的雾气里，非常有史诗感 */}
        <fog attach="fog" args={['#ff7e5f', 10, 120]} />

        <ScrollControls pages={6} damping={0.3}>
          <DepthSyncer />
          <CameraRig />
          
          {/* 场景元素 */}
          <SkyClouds />
          <OceanBackground />
          <WaterSurface />
          <Boat />
          <SunBeams count={isMobile ? 8 : 12} />
          <Bubbles count={isMobile ? 200 : 400} />
          
          {/* 海洋生物 */}
          <School count={isMobile ? 15 : 25} depthY={-15} />
          <SmartFish modelUrl="/shark.glb" depthY={-20} scale={isMobile ? 1.2 : 1.5} rangeX={isMobile ? 10 : 18} rangeZ={8} speed={1.2} />
          <SmartFish modelUrl="/mantaray.glb" depthY={-35} scale={isMobile ? 0.015 : 0.02} rangeX={isMobile ? 12 : 22} rangeZ={12} speed={0.6} />
          <Jellyfish depthY={-45} scale={1} color="#00ffff" />

          {/* HTML 内容层 */}
          <Scroll html style={{ width: '100%' }}>
            <Overlay />
          </Scroll>
        </ScrollControls>
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.9} intensity={0.05} />
          <Noise opacity={0.03} />
        </EffectComposer>
        <Preload all />
      </Canvas>

      <Loader containerStyles={{ background: 'black' }} innerStyles={{ background: 'white', width: '200px', height: '2px' }} barStyles={{ background: '#66ccff', height: '2px' }} dataStyles={{ color: '#66ccff', fontSize: '1rem', fontFamily: 'Arial' }} />
    </div>
  );
}
