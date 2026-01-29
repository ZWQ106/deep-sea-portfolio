import { useState } from "react";
import { motion } from "framer-motion";

// --- 辅助组件 ---
function ProjectCard({ title, category, description, accentColor = '#66ccff' }) {
  const [isHovered, setIsHovered] = useState(false);
  // ... (保留你原来的样式逻辑)
  const baseStyle = { position: 'relative', background: 'rgba(0, 15, 30, 0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: '35px', borderRadius: '20px', border: `1px solid rgba(255, 255, 255, 0.08)`, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', overflow: 'hidden', transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)', boxShadow: isHovered ? `0 15px 35px -10px rgba(0,0,0,0.5), 0 0 25px ${accentColor}40, inset 0 0 15px ${accentColor}20` : '0 5px 15px -5px rgba(0,0,0,0.3)' };
  const accentBarStyle = { position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: accentColor, boxShadow: `0 0 15px ${accentColor}`, opacity: isHovered ? 1 : 0.7, transition: 'opacity 0.4s ease' };
  const titleStyle = { fontSize: '2rem', margin: '0 0 10px 0', color: isHovered ? 'white' : 'rgba(255,255,255,0.9)', textShadow: isHovered ? `0 0 15px ${accentColor}80` : 'none', transition: 'all 0.4s ease' };

  return (
    <div style={baseStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div style={accentBarStyle} />
      <div style={{ paddingLeft: '15px' }}>
        <h3 style={titleStyle}>{title}</h3>
        <p style={{ color: accentColor, fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600', letterSpacing: '1px', opacity: isHovered ? 1 : 0.8, textTransform: 'uppercase' }}>{category}</p>
        <p style={{ lineHeight: '1.7', opacity: 0.8, fontSize: '1.05rem', maxWidth: '90%' }}>{description}</p>
      </div>
    </div>
  );
}

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1.0, delay: delay, ease: [0.25, 0.4, 0.25, 1] }} viewport={{ once: true, margin: "-100px" }}>
    {children}
  </motion.div>
);

const Section = ({ children, style }) => (
  <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10vw', ...style }}>
    {children}
  </section>
);

// --- 主导出组件 ---
export default function Overlay() {
  return (
    <div style={{ width: '100%', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      <Section style={{ alignItems: 'flex-start' }}>
        <FadeIn>
          <h1 style={{ fontSize: '6vw', fontWeight: '800', lineHeight: '1', margin: 0 }}>HELLO,<br />I'M <span style={{ color: '#66ccff' }}>WENQIAN.</span></h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p style={{ fontSize: '1.5rem', marginTop: '20px', opacity: 0.8, maxWidth: '600px' }}>CE Student & Creative Developer.<br />Creating digital aesthetics in the deep sea of code.</p>
        </FadeIn>
      </Section>
      <Section style={{ alignItems: 'flex-end', textAlign: 'right' }}>
        <FadeIn>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', maxWidth: '500px', marginLeft: 'auto' }}>
            <h2 style={{ fontSize: '3rem', margin: '0 0 20px 0' }}>About Me</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', opacity: 0.9 }}>I am a third-year Computer Engineering student based in Riverside, CA.</p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', opacity: 0.9, marginTop: '15px' }}>My passion lies in the intersection of <b style={{color:'#66ccff'}}>AI</b> and <b style={{color:'#66ccff'}}>Visual Arts</b>.</p>
          </div>
        </FadeIn>
      </Section>
      <Section style={{ alignItems: 'center' }}>
        <FadeIn>
          <h2 style={{ fontSize: '3rem', marginBottom: '60px', textShadow: '0 0 30px #66ccff50' }}>Selected Projects</h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', width: '100%', maxWidth: '1200px' }}>
          <FadeIn delay={0.1}><ProjectCard title="CatSignal" category="AI / Computer Vision" description="A cat intent inference system designed to understand feline behavior using deep learning models." /></FadeIn>
          <FadeIn delay={0.3}><ProjectCard title="Ghost Hand" category="Robotics / Interaction" description="A visual actuation system allowing for precise, ghostly manipulation of digital objects." accentColor="#ff0055" /></FadeIn>
          <FadeIn delay={0.5}><ProjectCard title="Deep Sea" category="Three.js / WebGL" description="The immersive 3D website you are currently exploring. A digital recovery space." accentColor="#00ff99" /></FadeIn>
        </div>
      </Section>
    </div>
  );
}