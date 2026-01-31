"use client";
import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { ScrollControls, Scroll, Environment, Preload } from "@react-three/drei";

// 引入组件
import OceanBackground from "@/components/canvas/Ocean";
import SunBeams from "@/components/canvas/SunBeams";
import Bubbles from "@/components/canvas/Bubbles";
import { SmartFish, School } from "@/components/canvas/SmartFish";
import Jellyfish from "@/components/canvas/Jellyfish";
import { CameraRig, DepthSyncer } from "@/components/canvas/SceneLogic";

import DOMContent from "@/components/ui/Overlay";
import HUD from "@/components/ui/HUD";
import LoadingScreen from "@/components/ui/Loading";

// 👇 1. 在这里定义检测手机的钩子函数
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    // 初始化检查
    checkMobile();
    
    // 监听窗口大小变化
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export default function DeepSeaPage() {
  const isMobile = useIsMobile(); // 2. 获取手机状态

  // 3. 根据设备调整摄像机 Z 轴 (手机退后一点，电脑近一点)
  const cameraZ = isMobile ? 18 : 10;

  return (
    <div style={{ width: "100vw", height: "100vh", background: 'black', position: 'relative' }}>
      
      {/* UI 层 */}
      <LoadingScreen />
      <HUD />

      {/* 3D 场景层 */}
      {/* 👇 4. 注意这里！把 10 改成了 cameraZ */}
      <Canvas camera={{ position: [0, 0, cameraZ], fov: 60 }}>
        <Environment preset="city" /> 
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        <ScrollControls pages={5} damping={0.3}>
          <DepthSyncer />
          <CameraRig />
          
          <OceanBackground />
          <SunBeams count={12} />
          <Bubbles count={400} />
          
          <School count={20} />
          <SmartFish modelUrl="/shark.glb" depthY={-20} scale={1.5} speed={1.2} rangeX={18} rangeZ={8} />
          <SmartFish modelUrl="/mantaray.glb" depthY={-35} scale={0.02} speed={0.6} rangeX={22} rangeZ={12} />
          <Jellyfish depthY={-45} scale={1} color="#00ffff" />
          
          <Scroll html style={{ width: '100%' }}>
            <DOMContent />
          </Scroll>
          
        </ScrollControls>

        <EffectComposer>
          <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.9} intensity={0.05} />
          <Noise opacity={0.03} />
        </EffectComposer>

        {/* 👇 5. 加回 Preload，保证资源预加载 */}
        <Preload all />
      </Canvas>
    </div>
  );
}