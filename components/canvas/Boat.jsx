// components/canvas/Boat.jsx
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export default function Boat() {
  // Directly load the model you already have!
  const { scene } = useGLTF('/fishing_boat.glb')
  const boatRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    
    if (boatRef.current) {
      // 🌊 简单的漂浮动画
      // Y轴：随波浪上下
      boatRef.current.position.y = Math.sin(t) * 0.1 - 0.2 
      // Z轴：随波浪左右摇摆
      boatRef.current.rotation.z = Math.sin(t * 0.5) * 0.05 
      // X轴：船头轻轻俯仰
      boatRef.current.rotation.x = Math.sin(t * 0.3) * 0.02
    }
  })

  return (
    <primitive 
      ref={boatRef} 
      object={scene} 
      scale={0.5} // 如果船太大了就调小这个数
      position={[2, 0, -5]} // 放在右前方
      rotation-y={-0.5} // 侧一点身
    />
  )
}

// 预加载，防闪烁
useGLTF.preload('/fishing_boat.glb')