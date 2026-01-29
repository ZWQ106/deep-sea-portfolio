import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Water } from "three-stdlib";

extend({ Water });

export default function WaterSurface() {
  const ref = useRef();
  const gl = useThree((state) => state.gl);
  const waterNormals = useTexture("/waternormals.jpg");
  
  // 设置纹理重复
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

  const geom = useMemo(() => new THREE.PlaneGeometry(500, 500), []);
  
  const config = useMemo(() => ({
    textureWidth: 128, 
    textureHeight: 128, 
    waterNormals,
    
    // 🌅 关键修改 1：太阳方向
    // 必须和 page.tsx 里的 <directionalLight position={[30, 2, 20]} /> 保持方向一致
    // 这样高光才会出现在正确的位置
    sunDirection: new THREE.Vector3(30, 2, 20).normalize(),
    
    // 🌅 关键修改 2：反光颜色
    // 从白色 (0xffffff) 改成金色 (0xffaa00)，让水面反射出金光
    sunColor: 0xffaa00,
    
    waterColor: 0x001e0f, // 水本来的颜色保持深邃
    distortionScale: 3.7, 
    fog: false, 
    format: gl.encoding,
  }), [waterNormals, gl.encoding]);

  useFrame((state, delta) => {
    if (ref.current) ref.current.material.uniforms["time"].value += delta * 0.5;
  });

  return <water ref={ref} args={[geom, config]} rotation-x={-Math.PI / 2} position-y={-0.1} />;
}