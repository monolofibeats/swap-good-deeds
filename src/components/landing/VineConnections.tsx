import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface VineConnectionsProps {
  className?: string;
}

const VineConnections = ({ className = "" }: VineConnectionsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <svg
      ref={ref}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="vineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(152 72% 45% / 0.3)" />
          <stop offset="50%" stopColor="hsl(152 72% 55% / 0.5)" />
          <stop offset="100%" stopColor="hsl(152 72% 45% / 0.3)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Left to Center vine */}
      <motion.path
        d="M 200 200 Q 350 150 400 200 Q 450 250 500 200 Q 550 150 600 200"
        fill="none"
        stroke="url(#vineGradient)"
        strokeWidth="2"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
      />

      {/* Center to Right vine */}
      <motion.path
        d="M 600 200 Q 650 150 700 200 Q 750 250 800 200 Q 850 150 900 200 Q 950 250 1000 200"
        fill="none"
        stroke="url(#vineGradient)"
        strokeWidth="2"
        filter="url(#glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 2, delay: 1, ease: "easeOut" }}
      />

      {/* Leaves on vines */}
      {[
        { cx: 350, cy: 175, delay: 1.5 },
        { cx: 500, cy: 220, delay: 1.7 },
        { cx: 700, cy: 175, delay: 2 },
        { cx: 850, cy: 220, delay: 2.2 },
        { cx: 950, cy: 175, delay: 2.4 },
      ].map((leaf, i) => (
        <motion.g key={i}>
          <motion.ellipse
            cx={leaf.cx}
            cy={leaf.cy}
            rx="8"
            ry="5"
            fill="hsl(152 72% 45% / 0.4)"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: leaf.delay }}
          />
          <motion.ellipse
            cx={leaf.cx + 10}
            cy={leaf.cy - 5}
            rx="6"
            ry="4"
            fill="hsl(152 72% 50% / 0.3)"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: leaf.delay + 0.1 }}
          />
        </motion.g>
      ))}

      {/* Connection dots at card positions */}
      {[200, 600, 1000].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy="200"
          r="6"
          fill="hsl(152 72% 45% / 0.6)"
          filter="url(#glow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: [0, 1.5, 1], opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.5 }}
        />
      ))}
    </svg>
  );
};

export default VineConnections;
