import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface VineConnectionsProps {
  className?: string;
}

const VineConnections = ({ className = "" }: VineConnectionsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Leaf SVG path for more detailed leaves
  const LeafShape = ({ x, y, rotation, delay, scale = 1 }: { x: number; y: number; rotation: number; delay: number; scale?: number }) => (
    <motion.g
      transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { scale: scale, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 200 }}
    >
      {/* Main leaf */}
      <path
        d="M0,0 Q8,-12 0,-20 Q-8,-12 0,0"
        fill="hsl(152 72% 45% / 0.5)"
        stroke="hsl(152 72% 35% / 0.6)"
        strokeWidth="0.5"
      />
      {/* Leaf vein */}
      <path
        d="M0,0 L0,-18"
        fill="none"
        stroke="hsl(152 72% 35% / 0.4)"
        strokeWidth="0.5"
      />
      {/* Side veins */}
      <path
        d="M0,-6 Q4,-8 6,-6 M0,-10 Q4,-12 5,-10 M0,-14 Q3,-16 4,-14"
        fill="none"
        stroke="hsl(152 72% 35% / 0.3)"
        strokeWidth="0.3"
      />
      <path
        d="M0,-6 Q-4,-8 -6,-6 M0,-10 Q-4,-12 -5,-10 M0,-14 Q-3,-16 -4,-14"
        fill="none"
        stroke="hsl(152 72% 35% / 0.3)"
        strokeWidth="0.3"
      />
    </motion.g>
  );

  return (
    <svg
      ref={ref}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="vineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(152 72% 45% / 0.5)" />
          <stop offset="50%" stopColor="hsl(152 72% 55% / 0.7)" />
          <stop offset="100%" stopColor="hsl(152 72% 45% / 0.5)" />
        </linearGradient>
        <linearGradient id="vineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(152 72% 50% / 0.3)" />
          <stop offset="50%" stopColor="hsl(152 72% 60% / 0.5)" />
          <stop offset="100%" stopColor="hsl(152 72% 50% / 0.3)" />
        </linearGradient>
        <filter id="vineGlow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background subtle vines */}
      <motion.path
        d="M 180 220 Q 280 180 380 220 Q 480 260 580 200 Q 680 140 780 200 Q 880 260 980 200 Q 1020 180 1020 200"
        fill="none"
        stroke="hsl(152 72% 45% / 0.15)"
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 3, delay: 0.2, ease: "easeOut" }}
      />

      {/* Main vine - Left to Center (thicker, more prominent) */}
      <motion.path
        d="M 200 200 Q 280 140 350 200 Q 420 260 500 200 Q 580 140 600 200"
        fill="none"
        stroke="url(#vineGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#vineGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
      />

      {/* Secondary vine left to center */}
      <motion.path
        d="M 200 200 Q 300 220 400 180 Q 500 140 600 200"
        fill="none"
        stroke="url(#vineGradient2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="8 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.8 } : {}}
        transition={{ duration: 2.5, delay: 0.8, ease: "easeOut" }}
      />

      {/* Main vine - Center to Right */}
      <motion.path
        d="M 600 200 Q 680 140 750 200 Q 820 260 900 200 Q 980 140 1000 200"
        fill="none"
        stroke="url(#vineGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#vineGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 2, delay: 1, ease: "easeOut" }}
      />

      {/* Secondary vine center to right */}
      <motion.path
        d="M 600 200 Q 700 180 800 220 Q 900 260 1000 200"
        fill="none"
        stroke="url(#vineGradient2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="8 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.8 } : {}}
        transition={{ duration: 2.5, delay: 1.3, ease: "easeOut" }}
      />

      {/* Curling tendrils */}
      {[
        { d: "M 320 180 Q 330 160 340 170 Q 350 180 345 165", delay: 1.5 },
        { d: "M 480 220 Q 490 240 500 230 Q 510 220 505 235", delay: 1.7 },
        { d: "M 720 170 Q 730 150 740 160 Q 750 170 745 155", delay: 2.0 },
        { d: "M 880 230 Q 890 250 900 240 Q 910 230 905 245", delay: 2.2 },
      ].map((tendril, i) => (
        <motion.path
          key={i}
          d={tendril.d}
          fill="none"
          stroke="hsl(152 72% 50% / 0.5)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: tendril.delay, ease: "easeOut" }}
        />
      ))}

      {/* Detailed leaves at key points */}
      <LeafShape x={300} y={175} rotation={-30} delay={1.6} scale={1.2} />
      <LeafShape x={350} y={210} rotation={25} delay={1.7} scale={1} />
      <LeafShape x={450} y={170} rotation={-20} delay={1.8} scale={1.1} />
      <LeafShape x={520} y={220} rotation={35} delay={1.9} scale={0.9} />
      <LeafShape x={680} y={165} rotation={-25} delay={2.1} scale={1.2} />
      <LeafShape x={750} y={215} rotation={30} delay={2.2} scale={1} />
      <LeafShape x={830} y={175} rotation={-15} delay={2.3} scale={1.1} />
      <LeafShape x={920} y={220} rotation={40} delay={2.4} scale={0.9} />
      <LeafShape x={960} y={180} rotation={-35} delay={2.5} scale={1} />

      {/* Small decorative dots along vines */}
      {[280, 380, 440, 550, 650, 720, 800, 870, 950].map((x, i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={x}
          cy={190 + (i % 2 === 0 ? -10 : 10)}
          r="2"
          fill="hsl(152 72% 55% / 0.6)"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 1.5 + i * 0.1 }}
        />
      ))}

      {/* Connection nodes at card positions - larger and more prominent */}
      {[200, 600, 1000].map((x, i) => (
        <motion.g key={i}>
          {/* Outer glow ring */}
          <motion.circle
            cx={x}
            cy="200"
            r="16"
            fill="none"
            stroke="hsl(152 72% 45% / 0.3)"
            strokeWidth="2"
            filter="url(#softGlow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { 
              scale: [0, 1.2, 1], 
              opacity: [0, 0.8, 0.5] 
            } : {}}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.5 }}
          />
          {/* Inner glow */}
          <motion.circle
            cx={x}
            cy="200"
            r="10"
            fill="hsl(152 72% 45% / 0.2)"
            filter="url(#vineGlow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: [0, 1.3, 1], opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 + i * 0.5 }}
          />
          {/* Core dot */}
          <motion.circle
            cx={x}
            cy="200"
            r="6"
            fill="hsl(152 72% 50% / 0.9)"
            filter="url(#vineGlow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: [0, 1.5, 1], opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.5 }}
          />
          {/* Pulsing animation */}
          <motion.circle
            cx={x}
            cy="200"
            r="6"
            fill="none"
            stroke="hsl(152 72% 55% / 0.6)"
            strokeWidth="2"
            initial={{ scale: 1, opacity: 0 }}
            animate={isInView ? { 
              scale: [1, 2, 2.5], 
              opacity: [0.8, 0.4, 0] 
            } : {}}
            transition={{ 
              duration: 2, 
              delay: 1 + i * 0.5,
              repeat: Infinity,
              repeatDelay: 1
            }}
          />
        </motion.g>
      ))}
    </svg>
  );
};

export default VineConnections;
