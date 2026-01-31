"use client";
import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

export default function OceanBackground() {
  const scroll = useScroll();
  const { gl, scene } = useThree();

  const c1 = useMemo(() => new THREE.Color("#115d9e"), []); 
  const c2 = useMemo(() => new THREE.Color("#0d4b82"), []); 
  const c3 = useMemo(() => new THREE.Color("#083359"), []); 
  const c4 = useMemo(() => new THREE.Color("#031a2e"), []); 
  const c5 = useMemo(() => new THREE.Color("#000000"), []); 

  useFrame(() => {
    const r = scroll.offset;
    const currentColor = new THREE.Color();

    if (r < 0.25) {
      currentColor.lerpColors(c1, c2, r * 4);
      scene.fog = new THREE.Fog(currentColor, 10, 40);
    } else if (r < 0.5) {
      currentColor.lerpColors(c2, c3, (r - 0.25) * 4);
      scene.fog = new THREE.Fog(currentColor, 8, 35);
    } else if (r < 0.75) {
      currentColor.lerpColors(c3, c4, (r - 0.5) * 4);
      scene.fog = new THREE.Fog(currentColor, 6, 30);
    } else {
      currentColor.lerpColors(c4, c5, (r - 0.75) * 4);
      scene.fog = new THREE.Fog(currentColor, 5, 20);
    }
    gl.setClearColor(currentColor);
  });
  return null;
}