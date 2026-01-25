// @ts-nocheck
"use client";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { ScrollControls, useScroll, Float, Scroll, Environment, useGLTF, useAnimations, Loader, shaderMaterial, useProgress, Cloud, Preload,useTexture } from "@react-three/drei";
import { useRef, useMemo, useEffect,useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Water } from "three-stdlib";

useTexture.preload("/waternormals.jpg");
useGLTF.preload("/shark.glb"); 
useGLTF.preload("/tuna.glb");
useGLTF.preload("/jellyfish.glb");
useGLTF.preload("/mantaray.glb");

// --- 0. 工具：检测手机端 ---
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}


// --- 1. 摄像机控制器 (修正版) ---
function CameraRig() {
  const scroll = useScroll();
  useFrame((state) => {
    // 🔧 关键修改：
    // 初始高度改为 3.5 (低空视角，能看到水面在脚下)
    // 滚动时下潜到 -50
    state.camera.position.y = 3.5 - scroll.offset * 55;
    
    // 🔧 关键细节：
    // 微微低头 (-0.15弧度)，这样你的视线是看着前下方海面的
    // 这会让“水面”在视觉上占据屏幕底部，而不是看不见
    state.camera.rotation.x = -0.15;
  });
  return null;
}

function SkyClouds() {
  return (
    // 🚨 关键修改：把高度从 20 降到 5
    // 这样云就在地平线附近，你的视角能完美覆盖
    <group position={[0, 15, -35]}> 
      
      {/* ☁️ 主云团 */}
      <Cloud
        position={[-10, 2, 0]} // 稍微抬高一点点，错落有致
        opacity={1}            // 拉满不透明度，看得更清
        speed={0.2}
        width={20}
        depth={5}
        segments={20}
        color="#ffffff"
      />

      {/* ☁️ 副云团 1 */}
      <Cloud
        position={[15, -2, -5]} // 稍微低一点
        opacity={0.8}
        speed={0.15}
        width={15}
        depth={3}
        segments={15}
        color="#eef4ff"
      />

       {/* ☁️ 副云团 2 */}
       <Cloud
        position={[0, 5, 5]}   // 稍微高一点
        opacity={0.6}
        speed={0.3}
        width={10}
        color="#ffffff"
      />
    </group>
  );
}

function OceanBackground() {
  const scroll = useScroll();
  const { gl, scene, camera } = useThree();

  // 🎨 调色板升级
  const colors = {
    // 1. 天空：从沉闷的 #87CEEB 改成鲜亮的 #4facfe (加一点紫调的蓝，更洋气)
    sky: new THREE.Color("#006994"),     
    
    // 2. 地平线：从灰白的 #E0F7FA 改成洁白的 #f0f9ff (让交界处更干净)
    horizon: new THREE.Color("#4facfe"), 
    
    surface: new THREE.Color("#0077be"), 
    deep: new THREE.Color("#000000")     
  };

  useFrame(() => {
    const y = camera.position.y;
    const currentColor = new THREE.Color();

    if (y > 0) {
      // === 天空层 ===
      // 拉长渐变区间 (从 10 改到 20)，让头顶的蓝色不要太快压下来，保留更多呼吸感
      const t = Math.min(y / 20, 1); 
      currentColor.lerpColors(colors.horizon, colors.sky, t);
      
      // 🌫️ 推远雾气：
      // 之前的 (20, 100) 太近了，导致远处看起来灰蒙蒙的。
      // 改成 (40, 150)，让视野瞬间通透！
      scene.fog = new THREE.Fog(currentColor, 40, 150);
    } else {
      // === 水下层 (保持深海的压抑感) ===
      const t = Math.min(Math.abs(y) / 50, 1);
      currentColor.lerpColors(colors.surface, colors.deep, t);
      scene.fog = new THREE.Fog(currentColor, 10, 60); 
    }

    gl.setClearColor(currentColor);
  });
  return null;
}


extend({ Water });

export function WaterSurface() {
  const ref = useRef();
  const gl = useThree((state) => state.gl);

  // 1. 加载纹理
  const waterNormals = useMemo(
    () =>
      new THREE.TextureLoader().load("/waternormals.jpg", (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
    []
  );

  // 2. 关键修正：必须显式创建几何体！
  // Water 对象需要几何体作为第一个参数
  const geom = useMemo(() => new THREE.PlaneGeometry(500, 500), []);

  // 3. 配置参数
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: false,
      format: gl.encoding,
    }),
    [waterNormals, gl.encoding]
  );

  useFrame((state, delta) => {
    if (ref.current) {
      // 让水动起来
      ref.current.material.uniforms["time"].value += delta * 0.5;
    }
  });

  // 4. 渲染 Water 对象本身
  // args={[geom, config]} -> 对应 new Water(geometry, options)
  return (
    <water
      ref={ref}
      args={[geom, config]}
      rotation-x={-Math.PI / 2}
      position-y={-0.1} // 稍微放低一点点
    />
  );
}


const BeamMaterial = shaderMaterial(
  {
    uColor: new THREE.Color("white"),
    uOpacity: 0.5,
    uTime: 0,
  },
  // Vertex Shader (处理位置)
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader (处理颜色和透明度)
  `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying vec2 vUv;
    
    void main() {
      // 1. 水平方向的渐变：中间(0.5)最亮，两边(0.0和1.0)变暗
      float strength = pow(0.5 - abs(vUv.x - 0.5), 2.0) * 4.0;
      
      // 2. 垂直方向的渐变：上面(1.0)亮，下面(0.0)消失
      float fade = smoothstep(0.0, 0.8, vUv.y);
      
      // 3. 组合透明度
      float alpha = strength * fade * uOpacity;
      
      gl_FragColor = vec4(uColor, alpha);
    }
  `
);

extend({ BeamMaterial });

// --- 3. 组件本体 ---
function SunBeams({ count = 12 }) {
  const group = useRef();

  const beams = useMemo(() => {
    return new Array(count).fill().map(() => {
      const isFocused = Math.random() < 0.4;

      const scaleX = isFocused 
        ? 5 + Math.random() * 5  
        : 20 + Math.random() * 15; 

      // 2. 透明度调整
      const opacity = isFocused
        ? 0.04 + Math.random() * 0.04
        : 0.015 + Math.random() * 0.02;

      const scaleY = isFocused 
        ? 60 + Math.random() * 30 
        : 40 + Math.random() * 20;

      return {
        // 范围保持 60 不变
        x: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 20 - 5,
        scaleX,
        scaleY,
        opacity,
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
        <mesh 
          key={i} 
          position={[data.x, 0, data.z]} 
          rotation={[0, 0, data.rotation]}
        >
          <planeGeometry args={[data.scaleX, data.scaleY]} />
          {/* @ts-ignore */}
          <beamMaterial 
            transparent 
            uColor="#d0f0ff" 
            uOpacity={data.opacity} 
            depthWrite={false} 
            side={THREE.DoubleSide} 
            blending={THREE.AdditiveBlending} 
          />
        </mesh>
      ))}
    </group>
  );
}


function Bubbles({ count = 200 }) {
  const mesh = useRef();
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const speed = 0.05 + Math.random() * 0.1;
      const xFactor = -25 + Math.random() * 50;
      const zFactor = -25 + Math.random() * 50;
      const yFactor = -25 + Math.random() * 60; 
      const baseScale = 0.5 + Math.random() * 1.5;
      temp.push({ t, speed, xFactor, yFactor, zFactor, baseScale });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current) return;

    particles.forEach((particle, i) => {
      // --- 运动逻辑 ---
      particle.yFactor += particle.speed;
      particle.t += 0.02;
      const wobbleX = Math.sin(particle.t) * 0.5;
      const wobbleZ = Math.cos(particle.t * 0.8) * 0.5;

      if (particle.yFactor > -2) {
         particle.yFactor = -70 - Math.random() * 20; 
         particle.xFactor = -25 + Math.random() * 50;
         particle.zFactor = -25 + Math.random() * 50;
      }

      dummy.position.set(
        particle.xFactor + wobbleX,
        particle.yFactor,
        particle.zFactor + wobbleZ
      );

      // --- 形状逻辑: 微微压扁 (保留这个细节，很真实) ---
      const depthScale = THREE.MathUtils.mapLinear(particle.yFactor, -60, -2, 0.5, 1.5);
      const s = particle.baseScale * depthScale;
      dummy.scale.set(s, s * 0.85, s); 
      
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      {/* 几何体保持高精度 */}
      <sphereGeometry args={[0.1, 32, 32]} />
      
      {/* 🌟 材质：浅海透亮风格 (Crystal Clear) */}
      <meshPhysicalMaterial
        color="#ffffff"          // 纯白
        emissive="#ffffff"       // 自发光：白色
        emissiveIntensity={0.2}  // 🚨 关键：微微发光 (0.2)，防止在深海变全黑
        
        roughness={0}            // 绝对光滑
        metalness={0.0}          // 🚨 归零！去掉金属黑感
        
        transparent={true}
        opacity={1}              // 不透明度设为 1，完全靠 transmission 控制
        
        transmission={0.95}      // 95% 透光，保留 5% 的白色表面
        ior={1.45}               // 玻璃/水晶的折射率，让它亮晶晶
        thickness={0.05}         // 🚨 极薄：像肥皂泡一样的厚度，消除“实心球”感
        
        clearcoat={1}            // 清漆层，增加高光
        attenuationColor="#ffffff" // 内部光线颜色：白
        attenuationDistance={0.5}  // 光线穿透距离
      />
    </instancedMesh>
  );
}


// --- 4. 普通鱼组件 (锦鲤、鲨鱼、魔鬼鱼) ---
function SmartFish({ modelUrl, depthY, scale = 1, speed = 1, rangeX = 10, rangeZ = 5, frequency = 0.5, rotationOffset = 0 }) {
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
      if (child.isMesh) {
        child.frustumCulled = false; 
      }
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


//鱼群
function School({ count = 10, depthY = -20 }) { 
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
      // 路径计算
      const progress = (surgeT * data.speedFactor + data.u) % 1;
      const x = (progress - 0.5) * 80; 
      
      const spineY = Math.sin(x * 0.1 + t * 0.5) * 8 + Math.cos(x * 0.05 + t * 0.2) * 4;
      const spineZ = Math.cos(x * 0.1 + t * 0.3) * 10 - 6; 

      const angle = data.phase + surgeT * 2 + x * 0.2;
      const spiralY = Math.cos(angle) * data.radius;
      const spiralZ = Math.sin(angle) * data.radius;

      dummy.position.set(x, spineY + spiralY, spineZ + spiralZ);

      // 朝向计算
      const nextProgress = progress + 0.01;
      const nextX = (nextProgress - 0.5) * 80;
      const nextSpineY = Math.sin(nextX * 0.1 + t * 0.5) * 8 + Math.cos(nextX * 0.05 + t * 0.2) * 4;
      const nextSpineZ = Math.cos(nextX * 0.1 + t * 0.3) * 10 - 6;
      const nextAngle = data.phase + surgeT * 2 + nextX * 0.2;
      
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


//水母组件
function Jellyfish({ modelUrl, depthY, scale = 1, color = "#00ffff" }) {
  const group = useRef();
  const jellyMesh = useRef();
  const { scene, animations } = useGLTF("/jellyfish.glb");
  const { actions } = useAnimations(animations, group);
  const clone = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clone.traverse((child) => {
      if (child.isMesh) {
        jellyMesh.current = child;
        child.material = new THREE.MeshStandardMaterial({
          map: child.material.map,
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.6, // 半透明
          roughness: 0.4,
          metalness: 0.8,
          emissive: new THREE.Color(color),
          emissiveIntensity: 2.0, 
          side: THREE.DoubleSide,
          toneMapped: false 
        });
      }
    });
  }, [clone, color]);

  // 2. 播放游动动画
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      actions[Object.keys(actions)[0]].reset().fadeIn(0.5).setEffectiveTimeScale(0.8).play();
    }
  }, [actions]);

  // 3. 呼吸与浮动逻辑
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const speed = 2.0; 
    
    if (group.current) {
      group.current.position.y = depthY + Math.sin(t * 0.5) * 2;
      group.current.rotation.y += 0.005;
      
      const pulse = Math.sin(t * speed); 
      const s = scale + pulse * 0.08 * scale;
      group.current.scale.set(s, s * 0.95, s);
    }

    // 变色逻辑
    if (jellyMesh.current) {
      const cycle = Math.floor(t * speed / (Math.PI * 2));
      const targetHue = (cycle * 0.25) % 1; 
      const targetColor = new THREE.Color().setHSL(targetHue, 0.9, 0.6);
      
      jellyMesh.current.material.emissive.lerp(targetColor, 0.05);
      jellyMesh.current.material.color.lerp(targetColor, 0.05);
    }
  });

  return (
    <group>
      <primitive ref={group} object={clone} position={[0, depthY, 0]} scale={scale} />
    </group>
  );
}

// 深海幽灵风格项目卡片 ---
function ProjectCard({ title, category, description, accentColor = '#66ccff' }) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    position: 'relative',
    background: 'rgba(0, 15, 30, 0.5)', // 深蓝黑色半透明基底
    backdropFilter: 'blur(12px)',       // 毛玻璃效果
    WebkitBackdropFilter: 'blur(12px)', 
    padding: '35px',
    borderRadius: '20px',
    border: `1px solid rgba(255, 255, 255, 0.08)`, 
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
    overflow: 'hidden',
    transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
    boxShadow: isHovered 
      ? `0 15px 35px -10px rgba(0,0,0,0.5), 0 0 25px ${accentColor}40, inset 0 0 15px ${accentColor}20` 
      : '0 5px 15px -5px rgba(0,0,0,0.3)', 
  };

  const accentBarStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    background: accentColor,
    boxShadow: `0 0 15px ${accentColor}`, 
    opacity: isHovered ? 1 : 0.7,
    transition: 'opacity 0.4s ease'
  };

  const titleStyle = {
    fontSize: '2rem',
    margin: '0 0 10px 0',
    color: isHovered ? 'white' : 'rgba(255,255,255,0.9)',
    textShadow: isHovered ? `0 0 15px ${accentColor}80` : 'none',
    transition: 'all 0.4s ease'
  };

  return (
    <div 
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={accentBarStyle} />
      
      <div style={{ paddingLeft: '15px' }}>
        <h3 style={titleStyle}>{title}</h3>
        <p style={{ 
          color: accentColor, 
          fontSize: '0.9rem', 
          marginBottom: '20px', 
          fontWeight: '600',
          letterSpacing: '1px',
          opacity: isHovered ? 1 : 0.8,
          textTransform: 'uppercase'
        }}>
          {category}
        </p>
        <p style={{ 
          lineHeight: '1.7', 
          opacity: 0.8, 
          fontSize: '1.05rem',
          maxWidth: '90%'
        }}>
          {description}
        </p>
      </div>

      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
        opacity: isHovered ? 1 : 0
      }} />
    </div>
  );
}

// 数据同步器 ---
function DepthSyncer() {
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

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }} // 初始：透明、下沉、模糊
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} // 出现：显形、回正、清晰
    transition={{ duration: 1.0, delay: delay, ease: [0.25, 0.4, 0.25, 1] }} // 丝滑的缓动曲线
    viewport={{ once: true, margin: "-100px" }} // 进入视口 100px 后才触发，且只触发一次
  >
    {children}
  </motion.div>
);

// Section 布局组件 ---
const Section = ({ children, style }) => (
  <section style={{ 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    padding: '10vw',
    ...style 
  }}>
    {children}
  </section>
);

// --- DOMContent 组件 
function DOMContent() {
  return (
    <div style={{ width: '100%', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <Section style={{ alignItems: 'flex-start' }}>
        <FadeIn>
          <h1 style={{ fontSize: '6vw', fontWeight: '800', lineHeight: '1', margin: 0 }}>
            HELLO,<br />
            I'M <span style={{ color: '#66ccff' }}>WENQIAN.</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}> {/* 延迟 0.2秒，错落感 */}
          <p style={{ fontSize: '1.5rem', marginTop: '20px', opacity: 0.8, maxWidth: '600px' }}>
            CE Student & Creative Developer.<br />
            Creating digital aesthetics in the deep sea of code.
          </p>
        </FadeIn>
      </Section>

      {/* About Me */}
      <Section style={{ alignItems: 'flex-end', textAlign: 'right' }}>
        <FadeIn>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            backdropFilter: 'blur(10px)', 
            padding: '40px', 
            borderRadius: '20px', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '500px',
            marginLeft: 'auto' 
          }}>
            <h2 style={{ fontSize: '3rem', margin: '0 0 20px 0' }}>About Me</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', opacity: 0.9 }}>
              I am a third-year Computer Engineering student based in Riverside, CA.
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', opacity: 0.9, marginTop: '15px' }}>
              My passion lies in the intersection of <b style={{color:'#66ccff'}}>AI</b> and <b style={{color:'#66ccff'}}>Visual Arts</b>. 
              When I'm not training models or building websites, you can find me taking care of my cat Yuanbao or trading stocks.
            </p>
          </div>
        </FadeIn>
      </Section>

      {/* Projects */}
      <Section style={{ alignItems: 'center' }}>
        <FadeIn>
          <h2 style={{ fontSize: '3rem', marginBottom: '60px', textShadow: '0 0 30px #66ccff50' }}>Selected Projects</h2>
        </FadeIn>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '40px', 
          width: '100%',
          maxWidth: '1200px'
        }}>
          {/* 给每个卡片不同的延迟 */}
          <FadeIn delay={0.1}>
            <ProjectCard 
              title="CatSignal"
              category="AI / Computer Vision"
              description="A cat intent inference system designed to understand feline behavior using deep learning models."
              accentColor="#66ccff" 
            />
          </FadeIn>

          <FadeIn delay={0.3}>
            <ProjectCard 
              title="Ghost Hand"
              category="Robotics / Interaction"
              description="A visual actuation system allowing for precise, ghostly manipulation of digital objects."
              accentColor="#ff0055" 
            />
          </FadeIn>

          <FadeIn delay={0.5}>
            <ProjectCard 
              title="Deep Sea"
              category="Three.js / WebGL"
              description="The immersive 3D website you are currently exploring. A digital recovery space."
              accentColor="#00ff99" 
            />
          </FadeIn>
        </div>
      </Section>

      {/* Contact */}
      <Section style={{ alignItems: 'center', justifyContent: 'center' }}>
        <FadeIn>
          <h2 style={{ fontSize: '4vw', marginBottom: '30px' }}>Let's Create Together</h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div style={{ display: 'flex', gap: '40px', fontSize: '1.2rem' }}>
            <a href="#" style={{ color: 'white', textDecoration: 'none', borderBottom: '1px solid white' }}>Email</a>
            <a href="#" style={{ color: 'white', textDecoration: 'none', borderBottom: '1px solid white' }}>LinkedIn</a>
            <a href="#" style={{ color: 'white', textDecoration: 'none', borderBottom: '1px solid white' }}>GitHub</a>
          </div>
        </FadeIn>
        <FadeIn delay={0.4}>
          <p style={{ marginTop: '100px', opacity: 0.5, fontSize: '0.8rem' }}>© 2026 Wenqian Zhang. All rights reserved.</p>
        </FadeIn>
      </Section>
      
    </div>
  );
}

function LoadingScreen() {
  const { progress, active } = useProgress();
  const [finished, setFinished] = useState(false);
  const [logs, setLogs] = useState([
    "INITIALIZING SYSTEM...",
    "CONNECTING TO SATELLITE...",
  ]);

  // 📝 模拟系统日志：让用户觉得你的网站在进行很厉害的计算
  useEffect(() => {
    if (finished) return;
    
    const fakeLogs = [
      "CALIBRATING PRESSURE SENSORS...",
      "LOADING BATHYMETRIC DATA...",
      "SYNCHRONIZING HYDROPHONES...",
      "DETECTING MARINE LIFEFORMS...",
      "ANALYZING WATER SALINITY...",
      "OPTIMIZING SHADER CACHE...",
      "ESTABLISHING NEURAL LINK...",
    ];

    const interval = setInterval(() => {
      // 随机挑一个日志加进去
      const randomLog = fakeLogs[Math.floor(Math.random() * fakeLogs.length)];
      setLogs((prev) => [...prev.slice(-4), `> ${randomLog}`]); // 只保留最后5行
    }, 400);

    return () => clearInterval(interval);
  }, [finished]);

  // ⏳ 只有当进度 100% 且至少过了一小会儿，才允许结束
  useEffect(() => {
    if (progress === 100) {
      // 强制多等 1 秒，让 GPU 有时间喘口气 (Warm up)
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, "> SYSTEM READY.", "> DIVING IN..."]);
        setTimeout(() => setFinished(true), 1000); 
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (finished) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000510", // 深海黑
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#66ccff",
        fontFamily: "'Courier New', monospace",
        transition: "opacity 1.5s ease-out", // 消失得慢一点，更优雅
        opacity: finished ? 0 : 1,
        pointerEvents: finished ? "none" : "auto",
      }}
    >
      {/* 装饰：旋转的雷达圈 */}
      <div style={{
        width: '80px', height: '80px', 
        border: '2px solid rgba(102, 204, 255, 0.3)',
        borderTop: '2px solid #66ccff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '40px'
      }}>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>

      {/* 进度条外框 */}
      <div style={{ 
        width: "300px", 
        height: "4px", 
        background: "rgba(102, 204, 255, 0.2)", 
        marginBottom: "15px", 
        position: 'relative',
        borderRadius: '2px'
      }}>
        {/* 进度条本体 */}
        <div
          style={{
            position: 'absolute',
            left: 0, top: 0, height: "100%",
            width: `${progress}%`,
            background: "#66ccff",
            boxShadow: "0 0 15px #66ccff",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* 核心改动：百分比大字 */}
      <div style={{ fontSize: "3rem", fontWeight: "900", letterSpacing: "5px", marginBottom: "30px", textShadow: "0 0 20px #66ccff" }}>
        {Math.round(progress)}%
      </div>

      {/* 核心改动：滚动日志区域 */}
      <div style={{ 
        height: '120px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-end', 
        opacity: 0.7,
        fontSize: '0.8rem',
        textAlign: 'left',
        width: '300px'
      }}>
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '5px' }}>{log}</div>
        ))}
      </div>
      
    </div>
  );
}

// --- 主程序入口 ---
export default function DeepSeaPage() {
  const isMobile = useIsMobile(); // 1. 获取手机状态

  // 2. 根据设备调整摄像机 Z 轴 (手机退后一点，电脑近一点)
  const cameraZ = isMobile ? 18 : 10;

  return (
    <div style={{ width: "100vw", height: "100vh", background: 'black', position: 'relative' }}>
      <LoadingScreen />
      
      <div style={{
        position: 'fixed', // 真正的 fixed
        right: '40px',
        bottom: '40px',
        zIndex: 9999, // 保证在最上面
        pointerEvents: 'none', // 鼠标穿透
        display: 'flex',
        alignItems: 'flex-end',
        gap: '20px',
        color: 'white',
        fontFamily: "'Courier New', monospace"
      }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#66ccff', letterSpacing: '2px', marginBottom: '5px', opacity: 0.8 }}>
            CURRENT DEPTH
          </div>
          {/* 给个 ID，方便我们用 JS 直接控制它 */}
          <div id="hud-depth-text" style={{ fontSize: '2rem', fontWeight: 'bold', textShadow: '0 0 10px #66ccff' }}>
            -0 m
          </div>
          <div style={{ fontSize: '10px', opacity: 0.3, marginTop: '2px' }}>
            PRESSURIZATION: NORMAL
          </div>
        </div>

        <div style={{ width: '4px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
          {/* 给个 ID，控制高度 */}
          <div id="hud-depth-bar" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '0%', background: '#66ccff', boxShadow: '0 0 15px #66ccff' }} />
        </div>
      </div>


      <Canvas camera={{ position: [0, 0, cameraZ], fov: 60 }}>
        {/* ⚠️ 关键：增强太阳光！
          这个光的位置和方向直接决定了水面反光的效果。
          把它放在侧后方 (5, 10, -10) 会产生非常漂亮的效果。
        */}
        {/* ☀️ 1. 太阳光：增强强度，位置稍微调高，制造明亮的主光源 */}
        <directionalLight 
          position={[10, 15, 10]} // 位置高一点，从右上方打下来
          intensity={2.5}         // 强度提高到 2.5 或 3
          color="#ffffff"         // 纯白阳光
          castShadow              // 开启投影，增加立体感
        />

        {/* ☁️ 2. 环境光：关键！调亮，并带一点天空蓝，填充阴影 */}
        {/* 原来可能是 intensity={0.5}，太暗了 */}
        <ambientLight 
          intensity={0.8}         // 提高到 0.8，让暗部变亮
          color="#eef4ff"         // 微微带蓝的白色环境光，模拟蓝天漫射
        />

        {/* 💡 额外技巧：加一个半球光 (HemisphereLight) 模拟天光地光 */}
        {/* 天空是亮的蓝白色，地面是稍微暗一点的海洋反射色 */}
        <hemisphereLight 
          skyColor="#ffffff"      // 天顶颜色
          groundColor="#0077be"   // 地面/海面反射颜色
          intensity={0.6}         // 强度
        />
        
        {/* 雾气：颜色要配合天空 */}
        <fog attach="fog" args={['#87CEEB', 10, 100]} />

        <ScrollControls pages={6} damping={0.3}>
          <CameraRig />
          <OceanBackground />
          <SkyClouds />

          {/* ▼▼▼ 使用全新的水面组件 ▼▼▼ */}
          <WaterSurface />
          <SunBeams count={isMobile ? 8 : 12} /> {/* 手机上减少光柱数量 */}
          <Bubbles count={isMobile ? 200 : 400} />
          
          {/* 鱼群位置微调：保持在水面以下 (Y < 0) */}
          <School count={isMobile ? 15 : 25} depthY={-15} radius={isMobile ? 5 : 10} />
          
          <SmartFish 
            modelUrl="/shark.glb" 
            depthY={-20} 
            scale={isMobile ? 1.2 : 1.5} 
            rangeX={isMobile ? 10 : 18} // 手机上游动范围小一点
            rangeZ={8} 
            speed={1.2} 
          />

          <SmartFish 
            modelUrl="/mantaray.glb" 
            depthY={-35} 
            scale={isMobile ? 0.015 : 0.02} 
            rangeX={isMobile ? 12 : 22} 
            rangeZ={12} 
            speed={0.6} 
          />

          <Jellyfish 
            modelUrl="/jellyfish.glb" 
            depthY={-45} 
            scale={1}      
            color="#00ffff"
          />
          
          <Scroll html style={{ width: '100%' }}>
            <DOMContent />
          </Scroll>
          
        </ScrollControls>
        
        <EffectComposer>
          <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.9} intensity={0.05} />
          <Noise opacity={0.03} />
        </EffectComposer>
        <Preload all />
      </Canvas>

      <Loader 
        containerStyles={{ background: 'black' }} 
        innerStyles={{ background: 'white', width: '200px', height: '2px' }} 
        barStyles={{ background: '#66ccff', height: '2px' }} 
        dataStyles={{ color: '#66ccff', fontSize: '1rem', fontFamily: 'Arial' }} 
      />
    </div>
  );
}