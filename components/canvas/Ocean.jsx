import { useThree, useFrame } from "@react-three/fiber"; // 核心钩子在这
import { useScroll } from "@react-three/drei";         // 滚动钩子在这
import * as THREE from "three";
function OceanBackground() {
    const scroll = useScroll();
    const { gl, scene, camera } = useThree();
  
    // 🎨 修复版调色板 (增加冷暖对比)
    const colors = {
      // === 天空部分 (水面以上) ===
      // 1. 天顶：改为深邃的夜空残留蓝紫色，不要全是粉色
      sky: new THREE.Color("#1e1e30"),     
      
      // 2. 地平线：柔和的金色渐变，不要太刺眼的红
      horizon: new THREE.Color("#ffaa5e"), 
      
      // === 水下部分 (绝对不能是粉色!) ===
      // 3. 水面下层：深邃的青蓝色 (Deep Teal)
      surface: new THREE.Color("#004d66"), 
      // 4. 深渊：纯黑
      deep: new THREE.Color("#000000")     
    };
  
    useFrame(() => {
      const y = camera.position.y;
      const currentColor = new THREE.Color();
  
      if (y > 0) {
        // === 水上：日出天空 ===
        const t = Math.min(y / 25, 1); //稍微拉长渐变
        currentColor.lerpColors(colors.horizon, colors.sky, t);
        
        // 🌫️ 水上的雾气：要配合地平线的颜色
        scene.fog = new THREE.Fog(currentColor, 30, 120);
      } else {
        // === 水下：回归深海蓝 ===
        const t = Math.min(Math.abs(y) / 50, 1);
        currentColor.lerpColors(colors.surface, colors.deep, t);
        
        // 🌫️ 水下的雾气：必须是蓝色/黑色的！
        scene.fog = new THREE.Fog(currentColor, 10, 60); 
      }
  
      gl.setClearColor(currentColor);
    });
    return null;
}
export default OceanBackground;