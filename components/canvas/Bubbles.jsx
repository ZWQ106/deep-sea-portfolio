import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export default function Bubbles({ count = 200 }) {
  const mesh = useRef();
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) temp.push({ t: Math.random() * 100, speed: 0.05 + Math.random() * 0.1, xFactor: -25 + Math.random() * 50, zFactor: -25 + Math.random() * 50, yFactor: -25 + Math.random() * 60, baseScale: 0.5 + Math.random() * 1.5 });
    return temp;
  }, [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!mesh.current) return;
    particles.forEach((particle, i) => {
      particle.yFactor += particle.speed; particle.t += 0.02;
      if (particle.yFactor > -2) { particle.yFactor = -70 - Math.random() * 20; particle.xFactor = -25 + Math.random() * 50; particle.zFactor = -25 + Math.random() * 50; }
      dummy.position.set(particle.xFactor + Math.sin(particle.t) * 0.5, particle.yFactor, particle.zFactor + Math.cos(particle.t * 0.8) * 0.5);
      const s = particle.baseScale * THREE.MathUtils.mapLinear(particle.yFactor, -60, -2, 0.5, 1.5);
      dummy.scale.set(s, s * 0.85, s); dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} roughness={0} metalness={0.0} transparent={true} opacity={1} transmission={0.95} ior={1.45} thickness={0.05} clearcoat={1} attenuationColor="#ffffff" attenuationDistance={0.5} />
    </instancedMesh>
  );
}