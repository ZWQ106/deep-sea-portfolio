"use client";
import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

useGLTF.preload("/shark.glb"); 
useGLTF.preload("/tuna.glb");
useGLTF.preload("/mantaray.glb");

export function SmartFish({ modelUrl, depthY, scale = 1, speed = 1, rangeX = 10, rangeZ = 5, frequency = 0.5, rotationOffset = 0 }) {
  const group = useRef();
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, group);
  const timeOffset = useMemo(() => Math.random() * 100, []);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      actions[Object.keys(actions)[0]].reset().fadeIn(0.5).setEffectiveTimeScale(1).play();
    }
  }, [actions]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) child.frustumCulled = false; 
    });
  }, [scene]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + timeOffset;
    if (group.current) {
      const targetX = Math.sin(t * frequency) * rangeX;
      const targetZ = Math.cos(t * frequency * 1.3) * rangeZ;
      const targetY = depthY + Math.sin(t * 1.5) * 0.8; 
      
      const nextT = t + 0.1;
      const nextX = Math.sin(nextT * frequency) * rangeX;
      const nextZ = Math.cos(nextT * frequency * 1.3) * rangeZ;
      
      const dx = nextX - group.current.position.x;
      const dz = nextZ - group.current.position.z;
      const targetRotationY = Math.atan2(dx, dz);

      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, 0.02);
      group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, 0.02);
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.02);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotationY + rotationOffset, 0.03);
    }
  });

  return <primitive ref={group} object={scene} position={[0, depthY, 0]} scale={scale} rotation={[0, rotationOffset, 0]} />;
}

export function School({ count = 10 }) { 
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { scene } = useGLTF("/tuna.glb");
  
  const fishGeometry = useMemo(() => {
    let geom;
    scene.traverse((child) => { if (child.isMesh && !geom) geom = child.geometry; });
    return geom;
  }, [scene]);

  const fishData = useMemo(() => {
    return new Array(count).fill().map(() => ({
      u: Math.random() * 0.15, radius: 1.5 + Math.random() * 2, phase: Math.random() * Math.PI * 2, speedFactor: 0.9 + Math.random() * 0.1, scale: 0.2 + Math.random() * 0.3 
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (!fishGeometry || !mesh.current) return;
    const t = clock.getElapsedTime();
    const surgeT = t * 0.05 + Math.sin(t * 0.3) * 0.05;

    fishData.forEach((data, i) => {
      const progress = (surgeT * data.speedFactor + data.u) % 1;
      const x = (progress - 0.5) * 80; 
      const spineY = Math.sin(x * 0.1 + t * 0.5) * 8 + Math.cos(x * 0.05 + t * 0.2) * 4;
      const spineZ = Math.cos(x * 0.1 + t * 0.3) * 10 - 6; 
      const angle = data.phase + surgeT * 2 + x * 0.2;
      const spiralY = Math.cos(angle) * data.radius;
      const spiralZ = Math.sin(angle) * data.radius;

      dummy.position.set(x, spineY + spiralY, spineZ + spiralZ);

      const nextProgress = progress + 0.01;
      const nextX = (nextProgress - 0.5) * 80;
      const nextSpineY = Math.sin(nextX * 0.1 + t * 0.5) * 8 + Math.cos(nextX * 0.05 + t * 0.2) * 4;
      const nextSpineZ = Math.cos(nextX * 0.1 + t * 0.3) * 10 - 6;
      const nextAngle = data.phase + surgeT * 2 + nextX * 0.2;
      
      dummy.lookAt(nextX, nextSpineY + Math.cos(nextAngle) * data.radius, nextSpineZ + Math.sin(nextAngle) * data.radius);
      dummy.scale.set(data.scale, data.scale, data.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  if (!fishGeometry) return null;
  return (
    <instancedMesh ref={mesh} args={[fishGeometry, undefined, count]}>
      <meshStandardMaterial color="#aaccff" emissive="#001133" roughness={0.1} metalness={0.9} />
    </instancedMesh>
  );
}