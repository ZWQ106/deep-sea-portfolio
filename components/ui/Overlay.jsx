"use client";
import { motion } from "framer-motion";
import ProjectCard from "./ProjectCard"; 

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    transition={{ duration: 1.0, delay: delay, ease: [0.25, 0.4, 0.25, 1] }}
    viewport={{ once: true, margin: "-100px" }}
  >
    {children}
  </motion.div>
);

const Section = ({ children, style }) => (
  <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10vw', ...style }}>
    {children}
  </section>
);

export default function DOMContent() {
  return (
    <div style={{ width: '100%', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      <Section style={{ alignItems: 'flex-start' }}>
        <FadeIn>
          <h1 style={{ fontSize: '6vw', fontWeight: '800', lineHeight: '1', margin: 0 }}>
            HELLO,<br /> I'M <span style={{ color: '#66ccff' }}>WENQIAN.</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p style={{ fontSize: '1.5rem', marginTop: '20px', opacity: 0.8, maxWidth: '600px' }}>
            CE Student @ UCR.<br /> Learning to bridge the gap between <b>AI</b> and the <b>Physical World</b>.
          </p>
        </FadeIn>
      </Section>

      <Section style={{ alignItems: 'flex-end', textAlign: 'right' }}>
        <FadeIn>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', maxWidth: '600px', marginLeft: 'auto' }}>
            <h2 style={{ fontSize: '3rem', margin: '0 0 20px 0' }}>About Me</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', opacity: 0.9 }}>Hi, I'm a third-year Computer Engineering student at <b>UCR</b>.</p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', opacity: 0.9, marginTop: '15px' }}>I have a strong interest in <b>Embodied AI</b> and <b>Robotics</b>. Currently, I am lucky enough to be conducting research on safe robot autonomy at the <i style={{color:'#66ccff'}}>Trustworthy Autonomous Systems Lab (TASL)</i>.</p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', opacity: 0.9, marginTop: '15px' }}>Outside the lab, I'm just a huge fan of <i>Dave the Diver</i> (hence the ocean theme!) and a cat dad to <i>Yuanbao</i>.</p>
          </div>
        </FadeIn>
      </Section>

      <Section style={{ alignItems: 'center' }}>
        <FadeIn>
          <h2 style={{ fontSize: '3rem', marginBottom: '60px', textShadow: '0 0 30px #66ccff50' }}>Current Work</h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', width: '100%', maxWidth: '1200px' }}>
          <FadeIn delay={0.1}>
            <ProjectCard title="Ghost Hand" category="Robotics / Experiment" description="[ PROTOTYPING ] Exploring visual actuation systems to see how digital gestures can control physical objects." accentColor="#ff0055" />
          </FadeIn>
          <FadeIn delay={0.3}>
            <ProjectCard title="CatSignal" category="Computer Vision" description="[ RESEARCHING ] An attempt to decode feline body language using pose estimation models (inspired by my cat)." accentColor="#66ccff" />
          </FadeIn>
          <FadeIn delay={0.5}>
             <ProjectCard title="Wenqian.com" category="Web Development" description="[ LIVE ] My little corner of the internet. A tribute to the ocean, built with React Three Fiber." accentColor="#00ff99" link="https://github.com/ZWQ106/" />
          </FadeIn>
        </div>
      </Section>

      <Section style={{ alignItems: 'center', justifyContent: 'center' }}>
        <FadeIn>
          <h2 style={{ fontSize: '4vw', marginBottom: '30px' }}>Let's Connect</h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div style={{ display: 'flex', gap: '40px', fontSize: '1.2rem' }}>
            <a href="mailto:wzhan240@ucr.edu" style={{ color: 'white', textDecoration: 'none', borderBottom: '1px solid white' }}>Email</a>
            <a href="https://linkedin.com/in/wenqianzhang106" target="_blank" style={{ color: 'white', textDecoration: 'none', borderBottom: '1px solid white' }}>LinkedIn</a>
            <a href="https://github.com/ZWQ106" target="_blank" style={{ color: 'white', textDecoration: 'none', borderBottom: '1px solid white' }}>GitHub</a>
          </div>
        </FadeIn>
        <FadeIn delay={0.4}>
          <p style={{ marginTop: '100px', opacity: 0.5, fontSize: '0.8rem' }}>© 2026 Wenqian Zhang. All rights reserved.</p>
        </FadeIn>
      </Section>
    </div>
  );
}
