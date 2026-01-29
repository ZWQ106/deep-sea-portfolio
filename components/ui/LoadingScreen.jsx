import { useProgress } from "@react-three/drei";
import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const { progress } = useProgress();
  const [finished, setFinished] = useState(false);
  const [logs, setLogs] = useState([
    "INITIALIZING SYSTEM...",
    "CONNECTING TO SATELLITE...",
  ]);

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
      const randomLog = fakeLogs[Math.floor(Math.random() * fakeLogs.length)];
      setLogs((prev) => [...prev.slice(-4), `> ${randomLog}`]);
    }, 400);
    return () => clearInterval(interval);
  }, [finished]);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, "> SYSTEM READY.", "> DIVING IN..."]);
        setTimeout(() => setFinished(true), 1000); 
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (finished) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#000510", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#66ccff", fontFamily: "'Courier New', monospace", transition: "opacity 1.5s ease-out", opacity: finished ? 0 : 1, pointerEvents: finished ? "none" : "auto" }}>
      <div style={{ width: '80px', height: '80px', border: '2px solid rgba(102, 204, 255, 0.3)', borderTop: '2px solid #66ccff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '40px' }}>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
      <div style={{ width: "300px", height: "4px", background: "rgba(102, 204, 255, 0.2)", marginBottom: "15px", position: 'relative', borderRadius: '2px' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: "100%", width: `${progress}%`, background: "#66ccff", boxShadow: "0 0 15px #66ccff", transition: "width 0.3s ease" }} />
      </div>
      <div style={{ fontSize: "3rem", fontWeight: "900", letterSpacing: "5px", marginBottom: "30px", textShadow: "0 0 20px #66ccff" }}>{Math.round(progress)}%</div>
      <div style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', opacity: 0.7, fontSize: '0.8rem', textAlign: 'left', width: '300px' }}>
        {logs.map((log, i) => (<div key={i} style={{ marginBottom: '5px' }}>{log}</div>))}
      </div>
    </div>
  );
}