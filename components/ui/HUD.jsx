export default function HUD() {
    return (
      <div style={{ position: 'fixed', right: '40px', bottom: '40px', zIndex: 9999, pointerEvents: 'none', display: 'flex', alignItems: 'flex-end', gap: '20px', color: 'white', fontFamily: "'Courier New', monospace" }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#66ccff', letterSpacing: '2px', marginBottom: '5px', opacity: 0.8 }}>CURRENT DEPTH</div>
          <div id="hud-depth-text" style={{ fontSize: '2rem', fontWeight: 'bold', textShadow: '0 0 10px #66ccff' }}>-0 m</div>
          <div style={{ fontSize: '10px', opacity: 0.3, marginTop: '2px' }}>PRESSURIZATION: NORMAL</div>
        </div>
        <div style={{ width: '4px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
          <div id="hud-depth-bar" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '0%', background: '#66ccff', boxShadow: '0 0 15px #66ccff' }} />
        </div>
      </div>
    );
  }