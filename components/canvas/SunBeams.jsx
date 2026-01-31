"use client";
import { useRef, useMemo } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

const BeamMaterial = shaderMaterial(
  {
    uColor: new THREE.Color("white"),
    uOpacity: 0.5,
    uTime: 0,
  },
  `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  `uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv; void main() { float strength = pow(0.5 - abs(vUv.x - 0.5), 2.0) * 4.0; float fade = smoothstep(0.0, 0.8, vUv.y); float alpha = strength * fade * uOpacity; gl_FragColor = vec4(uColor, alpha); }`
);

extend({ BeamMaterial });

export default function SunBeams({ count = 12 }) {
  const group = useRef();
  const beams = useMemo(() => {
    return new Array(count).fill().map(() => {
      const isFocused = Math.random() < 0.4;
      return {
        x: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 20 - 5,
        scaleX: isFocused ? 5 + Math.random() * 5 : 20 + Math.random() * 15,
        scaleY: isFocused ? 60 + Math.random() * 30 : 40 + Math.random() * 20,
        opacity: isFocused ? 0.04 + Math.random() * 0.04 : 0.015 + Math.random() * 0.02,
        speed: isFocused ? 0.5 : 0.2, 
        rotation: (Math.random() - 0.5) * 0.3
      };
    });
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.children.forEach((mesh, i) => {
         mesh.rotation.z = beams[i].rotation + Math.sin(t * beams[i].speed + i) * 0.02;
      });
    }
  });

  return (
    <group ref={group} position={[0, 10, 0]}>
      {beams.map((data, i) => (
        <mesh key={i} position={[data.x, 0, data.z]} rotation={[0, 0, data.rotation]}>
          <planeGeometry args={[data.scaleX, data.scaleY]} />
          {/* @ts-ignore */}
          <beamMaterial transparent uColor="#d0f0ff" uOpacity={data.opacity} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}