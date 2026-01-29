import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";

export function SmartFish({ modelUrl, depthY, scale = 1, speed = 1, rangeX = 10, rangeZ = 5, frequency = 0.5, rotationOffset = 0 }) {
  const group = useRef();
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, group);
  const timeOffset = useMemo(() => Math.random() * 100, []);

  useEffect(() => { if (actions && Object.keys(actions).length > 0) actions[Object.keys(actions)[0]].reset().fadeIn(0.5).setEffectiveTimeScale(1).play(); }, [actions]);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + timeOffset;
    if (group.current) {
      const targetX = Math.sin(t * frequency) * rangeX;
      const targetZ = Math.cos(t * frequency * 1.3) * rangeZ;
      const targetY = depthY + Math.sin(t * 1.5) * 0.8;
      const dx = Math.sin((t + 0.1) * frequency) * rangeX - group.current.position.x;
      const dz = Math.cos((t + 0.1) * frequency * 1.3) * rangeZ - group.current.position.z;
      
      group.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.02);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.atan2(dx, dz) + rotationOffset, 0.03);
    }
  });
  return <primitive ref={group} object={scene} position={[0, depthY, 0]} scale={scale} rotation={[0, rotationOffset, 0]} />;
}
// src/components/canvas/SmartFish.jsx

// ... SmartFish 组件不用动 ...

// 👇 把 School 组件替换成这个
export function School({ count = 10, depthY = -20 }) { 
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { scene } = useGLTF("/tuna.glb");
  
  const fishGeometry = useMemo(() => {
    let geom;
    scene.traverse((child) => {
      if (child.isMesh && !geom) {
        geom = child.geometry;
      }
    });
    return geom;
  }, [scene]);

  const fishData = useMemo(() => {
    return new Array(count).fill().map(() => ({
      u: Math.random() * 0.15, 
      radius: 1.5 + Math.random() * 2, 
      phase: Math.random() * Math.PI * 2, 
      speedFactor: 0.9 + Math.random() * 0.1, 
      scale: 0.2 + Math.random() * 0.3 
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (!fishGeometry || !mesh.current) return;

    const t = clock.getElapsedTime();
    const surgeT = t * 0.05 + Math.sin(t * 0.3) * 0.05;

    fishData.forEach((data, i) => {
      // 1. 计算当前位置 (Present)
      const progress = (surgeT * data.speedFactor + data.u) % 1;
      const x = (progress - 0.5) * 80; 
      
      const spineY = Math.sin(x * 0.1 + t * 0.5) * 8 + Math.cos(x * 0.05 + t * 0.2) * 4;
      const spineZ = Math.cos(x * 0.1 + t * 0.3) * 10 - 6; 

      const angle = data.phase + surgeT * 2 + x * 0.2;
      const spiralY = Math.cos(angle) * data.radius;
      const spiralZ = Math.sin(angle) * data.radius;

      dummy.position.set(x, spineY + spiralY, spineZ + spiralZ);

      // 2. 🚨 关键修复：计算未来位置 (Future) 以便正确朝向
      // 我之前把这一段简化掉了，现在加回来！
      const nextProgress = progress + 0.01; // 往前看一点点
      const nextX = (nextProgress - 0.5) * 80;
      
      // 同样复杂的曲线公式，算出下一步的 Y 和 Z
      const nextSpineY = Math.sin(nextX * 0.1 + t * 0.5) * 8 + Math.cos(nextX * 0.05 + t * 0.2) * 4;
      const nextSpineZ = Math.cos(nextX * 0.1 + t * 0.3) * 10 - 6;
      
      const nextAngle = data.phase + surgeT * 2 + nextX * 0.2;
      
      // 让鱼看着未来的那个点 -> 这样身体就会自然弯曲
      dummy.lookAt(
        nextX,
        nextSpineY + Math.cos(nextAngle) * data.radius,
        nextSpineZ + Math.sin(nextAngle) * data.radius
      );
 
      dummy.scale.set(data.scale, data.scale, data.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  if (!fishGeometry) return null;

  return (
    <group position={[0, depthY, 0]}>
      <instancedMesh ref={mesh} args={[fishGeometry, null, count]}>
        <meshStandardMaterial 
          color="#aaccff" 
          emissive="#001133"
          roughness={0.1} 
          metalness={0.9} 
        />
      </instancedMesh>
    </group>
  );
}