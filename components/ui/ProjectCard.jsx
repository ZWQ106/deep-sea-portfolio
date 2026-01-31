"use client";
import { useState } from "react";

export default function ProjectCard({ title, category, description, accentColor = '#66ccff', link }) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle = {
    position: 'relative', background: 'rgba(0, 15, 30, 0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', 
    padding: '35px', borderRadius: '20px', border: `1px solid rgba(255, 255, 255, 0.08)`, 
    cursor: link ? 'pointer' : 'default', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', overflow: 'hidden',
    transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
    boxShadow: isHovered ? `0 15px 35px -10px rgba(0,0,0,0.5), 0 0 25px ${accentColor}40, inset 0 0 15px ${accentColor}20` : '0 5px 15px -5px rgba(0,0,0,0.3)', 
  };
  const accentBarStyle = {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: accentColor, boxShadow: `0 0 15px ${accentColor}`, 
    opacity: isHovered ? 1 : 0.7, transition: 'opacity 0.4s ease'
  };
  const titleStyle = {
    fontSize: '2rem', margin: '0 0 10px 0', color: isHovered ? 'white' : 'rgba(255,255,255,0.9)',
    textShadow: isHovered ? `0 0 15px ${accentColor}80` : 'none', transition: 'all 0.4s ease'
  };

  return (
    <div style={baseStyle} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={() => link && window.open(link, '_blank')}>
      <div style={accentBarStyle} />
      <div style={{ paddingLeft: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={titleStyle}>{title}</h3>
          {link && <span style={{ opacity: 0.5, fontSize: '1.5rem', color: 'white', transform: isHovered ? 'translate(2px, -2px)' : 'none', transition: 'transform 0.3s' }}>↗</span>}
        </div>
        <p style={{ color: accentColor, fontSize: '0.9rem', marginBottom: '20px', fontWeight: '600', letterSpacing: '1px', opacity: isHovered ? 1 : 0.8, textTransform: 'uppercase' }}>{category}</p>
        <p style={{ lineHeight: '1.7', opacity: 0.8, fontSize: '1.05rem', maxWidth: '90%' }}>{description}</p>
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.05) 0%, transparent 50%)', pointerEvents: 'none', opacity: isHovered ? 1 : 0 }} />
    </div>
  );
}