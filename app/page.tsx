// @ts-nocheck
"use client";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { ScrollControls, useScroll, Float, Scroll, Environment, useGLTF, useAnimations, Loader, shaderMaterial, useProgress } from "@react-three/drei";
import { useRef, useMemo, useEffect,useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";

useGLTF.preload("/shark.glb"); 
useGLTF.preload("/tuna.glb");
useGLTF.preload("/jellyfish.glb");
useGLTF.preload("/mantaray.glb");

// --- 1. 摄像机控制器 ---
function CameraRig() {
  const scroll = useScroll();
  useFrame((state) => {
    state.camera.position.y = -scroll.offset * 50;
  });
  return null;
}

// --- 2. 背景组件 (5级变色) ---
function OceanBackground() {
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
      // 深渊层：确保最后一段是纯黑
      currentColor.lerpColors(c4, c5, (r - 0.75) * 4);
      scene.fog = new THREE.Fog(currentColor, 5, 20);
    }
    gl.setClearColor(currentColor);
  });
  return null;
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
// --- 3. 气泡组件 ---
function Bubbles({ count = 100 }) {
  const mesh = useRef();
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -5 + Math.random() * 10;
      const yFactor = -5 + Math.random() * 10;
      const zFactor = -10 + Math.random() * 20; 
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const s = Math.cos(t) * 0.5 + 0.5; 
      const dummy = new THREE.Object3D();
      const deepY = (particle.my % 60) - 55; 
      
      dummy.position.set(
        (particle.mx += (state.mouse.x * 5 - particle.mx) * 0.02) + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my += (state.mouse.y * 5 - particle.my) * 0.02) + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10 - (state.camera.position.y),
        zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color="#88ccff" roughness={0.1} transparent opacity={0.4} />
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
function School({ count = 10 }) { 
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
    <instancedMesh ref={mesh} args={[fishGeometry, null, count]}>
      <meshStandardMaterial 
        color="#aaccff" 
        emissive="#001133"
        roughness={0.1} 
        metalness={0.9} 
      />
    </instancedMesh>
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

// 加载屏组件 ---
function LoadingScreen() {
  const { progress } = useProgress();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // 加载到 100% 后，延迟 500ms 再消失，体验更平滑
    if (progress === 100) {
      const timer = setTimeout(() => setFinished(true), 500);
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
        background: "#000000",
        zIndex: 99999, // 保证在最顶层
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "'Courier New', monospace",
        transition: "opacity 0.8s ease-out", // 淡出动画
        opacity: progress === 100 ? 0 : 1,   // 完成变透明
        pointerEvents: progress === 100 ? "none" : "auto", // 穿透鼠标
      }}
    >
      {/* 进度条 */}
      <div style={{ width: "300px", height: "2px", background: "#333", marginBottom: "20px", position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: "100%",
            width: `${progress}%`,
            background: "#66ccff",
            boxShadow: "0 0 10px #66ccff",
            transition: "width 0.2s ease",
          }}
        />
      </div>

      {/* 文字 */}
      <div style={{ fontSize: "1.2rem", fontWeight: "bold", letterSpacing: "2px" }}>
        SYSTEM INITIALIZING... {Math.round(progress)}%
      </div>

      {/* 底部小字提示 */}
      <div style={{ position: "absolute", bottom: "50px", textAlign: "center", opacity: 0.5, fontSize: "0.8rem" }}>
         <p>RECOMMENDED FOR DESKTOP & LARGE DISPLAYS</p>
      </div>
    </div>
  );
}

// --- 主程序入口 ---
export default function DeepSeaPage() {
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
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <Environment preset="city" /> 
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        
        <ScrollControls pages={5} damping={0.3}>
          <DepthSyncer />
          <CameraRig />
          <OceanBackground />
          <SunBeams count={12} />
          <Bubbles count={400} />
          
          <School count={20} depthY={-6} radius={10} />
          
          {/* 2. 鲨鱼 (-25m) */}
          <SmartFish modelUrl="/shark.glb" depthY={-20} scale={1.5} speed={1.2} frequency={0.3} rangeX={18} rangeZ={8} rotationOffset={0} />

          {/* 3. Manta Ray (-35m) */}
          <SmartFish modelUrl="/mantaray.glb" depthY={-35} scale={0.02} speed={0.6} frequency={0.15} rangeX={22} rangeZ={12} rotationOffset={0} />

          {/* 4. 水母 (-45m)*/}
          
          <Jellyfish 
            modelUrl="/jellyfish.glb" 
            depthY={-45} 
            scale={1}      
            color="#00ffff" // 赛博青
          />
          
          <Scroll html style={{ width: '100%' }}>
            <DOMContent />
          </Scroll>
          
        </ScrollControls>
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.9} // 只让极亮的部分发光
            luminanceSmoothing={0.9} 
            intensity={0.05}         
          />
          <Noise opacity={0.03} />
        </EffectComposer>
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