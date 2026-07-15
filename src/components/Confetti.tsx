import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

interface Particle {
  id: number;
  x: number; // 0 to 100vw
  size: number;
  color: string;
  shape: "circle" | "rect" | "triangle" | "star";
  delay: number;
  duration: number;
  sway: number;
  rotateSpeed: number;
  rotateInitX: number;
  rotateInitY: number;
  rotateInitZ: number;
}

const PREMIUM_COLORS = [
  "#d4af37", // Gold
  "#f3e5ab", // Pale Gold
  "#aa771c", // Dark Gold
  "#2dd4bf", // Teal
  "#115e59", // Deep Teal
  "#10b981", // Emerald
  "#059669", // Dark Emerald
  "#b76e79", // Rose Gold
  "#e2e8f0", // Silver
  "#38bdf8", // Sky Blue
];

const SHAPES: Array<"circle" | "rect" | "triangle" | "star"> = [
  "circle",
  "rect",
  "triangle",
  "star",
];

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 120 randomized premium confetti particles
    const list: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * 100; // random X position across 0-100vw
      const size = Math.random() * 8 + 6; // random size from 6px to 14px
      const color = PREMIUM_COLORS[Math.floor(Math.random() * PREMIUM_COLORS.length)];
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const delay = Math.random() * 5; // stagger delay over 5 seconds
      const duration = Math.random() * 4 + 4; // fall duration between 4s and 8s
      const sway = Math.random() * 80 + 40; // horizontal sway variance
      const rotateSpeed = Math.random() * 4 + 1.5; // multiplier for 3D spinning
      const rotateInitX = Math.random() * 360;
      const rotateInitY = Math.random() * 360;
      const rotateInitZ = Math.random() * 360;

      list.push({
        id: i,
        x,
        size,
        color,
        shape,
        delay,
        duration,
        sway,
        rotateSpeed,
        rotateInitX,
        rotateInitY,
        rotateInitZ,
      });
    }
    setParticles(list);
  }, []);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" 
      aria-hidden="true"
    >
      {particles.map((p) => {
        let clipPathStyle = {};
        let borderRadius = "0px";

        if (p.shape === "circle") {
          borderRadius = "50%";
        } else if (p.shape === "triangle") {
          clipPathStyle = { clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" };
        } else if (p.shape === "star") {
          clipPathStyle = {
            clipPath:
              "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          };
        }

        return (
          <motion.div
            key={p.id}
            initial={{
              y: "-10vh",
              x: `${p.x}vw`,
              opacity: 0,
              scale: 0.3,
              rotateX: p.rotateInitX,
              rotateY: p.rotateInitY,
              rotateZ: p.rotateInitZ,
            }}
            animate={{
              y: "110vh",
              // Elegant pendulum sway animation
              x: [
                `${p.x}vw`,
                `calc(${p.x}vw - ${p.sway}px)`,
                `calc(${p.x}vw + ${p.sway}px)`,
                `calc(${p.x}vw - ${p.sway / 2}px)`,
              ],
              // Multiple 3D rotations during fall
              rotateX: [p.rotateInitX, p.rotateInitX + 360 * p.rotateSpeed],
              rotateY: [p.rotateInitY, p.rotateInitY + 720 * p.rotateSpeed],
              rotateZ: [p.rotateInitZ, p.rotateInitZ + 540 * p.rotateSpeed],
              opacity: [0, 1, 1, 0.8, 0],
              scale: [0.5, 1, 1, 0.8, 0.3],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: "easeInOut",
              repeat: Infinity, // continuously fall for a premium interactive atmosphere
            }}
            style={{
              position: "absolute",
              width: `${p.size}px`,
              height: p.shape === "rect" ? `${p.size * 1.6}px` : `${p.size}px`,
              backgroundColor: p.color,
              borderRadius,
              transformStyle: "preserve-3d",
              ...clipPathStyle,
            }}
          />
        );
      })}
    </div>
  );
}
