import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface Leaf {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  type: "leaf" | "seed" | "sparkle";
}

const FloatingLeaves = () => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const { scrollYProgress } = useScroll();
  const leafOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7], [0, 0.6, 1]);

  useEffect(() => {
    const initialLeaves: Leaf[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 15 + Math.random() * 20,
      size: 12 + Math.random() * 18,
      rotation: Math.random() * 360,
      type: Math.random() > 0.7 ? "seed" : Math.random() > 0.5 ? "sparkle" : "leaf",
    }));
    setLeaves(initialLeaves);
  }, []);

  const LeafSVG = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C6.5 2 2 6.5 2 12c0 4.5 3 8.5 7.5 9.5C14 21 17 17 17 12c0-2-.5-4-1.5-5.5C14.5 5 13 3.5 12 2z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M12 4v14M8 8c2 2 4 3 6 3M8 14c2-2 4-3 6-3"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.5"
      />
    </svg>
  );

  const SeedSVG = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="12" rx="4" ry="8" fill="currentColor" opacity="0.7" />
      <path d="M12 4v4" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
    </svg>
  );

  const SparkleSVG = ({ size }: { size: number }) => (
    <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );

  return (
    <motion.div 
      className="fixed inset-0 pointer-events-none z-[2] overflow-hidden"
      style={{ opacity: leafOpacity }}
    >
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute text-swap-green/40"
          initial={{
            left: `${leaf.x}%`,
            top: "-5%",
            rotate: leaf.rotation,
          }}
          animate={{
            top: "105%",
            rotate: leaf.rotation + 720,
            x: [0, 30, -20, 40, -30, 0],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "linear",
            x: {
              duration: leaf.duration / 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {leaf.type === "leaf" && <LeafSVG size={leaf.size} />}
          {leaf.type === "seed" && <SeedSVG size={leaf.size} />}
          {leaf.type === "sparkle" && <SparkleSVG size={leaf.size} />}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FloatingLeaves;
