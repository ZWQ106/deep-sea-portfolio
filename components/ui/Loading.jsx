"use client";
import { useProgress } from "@react-three/drei";
import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const { progress } = useProgress();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => setFinished(true), 500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (finished) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#000000", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "'Courier New', monospace", transition: "opacity 0.8s ease-out", opacity: progress === 100 ? 0 : 1, pointerEvents: progress === 100 ? "none" : "auto" }}>
      <div style={{ width: "300px", height: "2px", background: "#333", marginBottom: "20px", position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: "100%", width: `${progress}%`, background: "#66ccff", boxShadow: "0 0 10px #66ccff", transition: "width 0.2s ease" }} />
      </div>
      <div style={{ fontSize: "1.2rem", fontWeight: "bold", letterSpacing: "2px" }}>SYSTEM INITIALIZING... {Math.round(progress)}%</div>
    </div>
  );
}
