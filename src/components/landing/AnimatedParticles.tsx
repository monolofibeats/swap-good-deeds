import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocityX: number;
  velocityY: number;
  color: "green" | "blue" | "gold";
}

const AnimatedParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const maxParticles = 200;
  const { t } = useLanguage();
  const animationRef = useRef<number>();

  useEffect(() => {
    // Initialize with starting particles
    const initialParticles: Particle[] = Array.from({ length: 40 }, (_, i) => createParticle(i));
    setParticles(initialParticles);

    // Add new particles over time
    const addInterval = setInterval(() => {
      setParticles(prev => {
        if (prev.length >= maxParticles) return prev;
        return [...prev, createParticle(Date.now() + Math.random())];
      });
    }, 600);

    return () => clearInterval(addInterval);
  }, []);

  // Animate particles
  useEffect(() => {
    const animate = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.velocityX,
        y: p.y + p.velocityY,
        // Wrap around screen
        ...(p.x > 100 ? { x: 0 } : p.x < 0 ? { x: 100 } : {}),
        ...(p.y > 100 ? { y: 0 } : p.y < 0 ? { y: 100 } : {}),
      })));
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  function createParticle(id: number): Particle {
    const colors: Array<"green" | "blue" | "gold"> = ["green", "blue", "gold"];
    return {
      id,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      opacity: Math.random() * 0.5 + 0.2,
      velocityX: (Math.random() - 0.5) * 0.02,
      velocityY: (Math.random() - 0.5) * 0.02,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  }

  const colorMap = {
    green: "hsl(145 60% 50%)",
    blue: "hsl(200 70% 55%)",
    gold: "hsl(45 80% 55%)",
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full transition-transform duration-1000"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, ${colorMap[particle.color]} 0%, transparent 70%)`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 3}px ${colorMap[particle.color]}`,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedParticles;
