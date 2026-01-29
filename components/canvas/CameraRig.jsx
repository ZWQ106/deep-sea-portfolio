import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";

export function CameraRig() {
  const scroll = useScroll();
  useFrame((state) => {
    state.camera.position.y = 3.5 - scroll.offset * 55;
    state.camera.rotation.x = -0.15;
  });
  return null;
}

export function DepthSyncer() {
  const scroll = useScroll();
  useFrame(() => {
    const textEl = document.getElementById('hud-depth-text');
    const barEl = document.getElementById('hud-depth-bar');
    if (textEl && barEl) {
      const depth = Math.floor(scroll.offset * 1000);
      textEl.innerText = `-${depth} m`;
      barEl.style.height = `${scroll.offset * 100}%`;
    }
  });
  return null;
}