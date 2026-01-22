import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface VineConnectionsProps {
  className?: string;
}

const VineConnections = ({ className = "" }: VineConnectionsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Detailed leaf SVG with stem
  const DetailedLeaf = ({ x, y, rotation, delay, scale = 1 }: { x: number; y: number; rotation: number; delay: number; scale?: number }) => (
    <motion.g
      transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { scale: scale, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 200 }}
    >
      {/* Leaf body */}
      <path
        d="M0,0 Q10,-15 0,-25 Q-10,-15 0,0"
        fill="hsl(152 72% 40% / 0.6)"
        stroke="hsl(152 72% 30% / 0.7)"
        strokeWidth="0.8"
      />
      {/* Central vein */}
      <path
        d="M0,-2 L0,-22"
        fill="none"
        stroke="hsl(152 72% 30% / 0.5)"
        strokeWidth="0.6"
      />
      {/* Side veins */}
      <path
        d="M0,-8 Q5,-10 7,-8 M0,-13 Q4,-15 6,-13 M0,-18 Q3,-20 4,-18"
        fill="none"
        stroke="hsl(152 72% 35% / 0.4)"
        strokeWidth="0.4"
      />
      <path
        d="M0,-8 Q-5,-10 -7,-8 M0,-13 Q-4,-15 -6,-13 M0,-18 Q-3,-20 -4,-18"
        fill="none"
        stroke="hsl(152 72% 35% / 0.4)"
        strokeWidth="0.4"
      />
    </motion.g>
  );

  // Small decorative leaf cluster
  const LeafCluster = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
    <g>
      <DetailedLeaf x={x} y={y} rotation={-20} delay={delay} scale={0.8} />
      <DetailedLeaf x={x + 8} y={y + 5} rotation={15} delay={delay + 0.1} scale={0.6} />
      <DetailedLeaf x={x - 6} y={y + 8} rotation={-35} delay={delay + 0.15} scale={0.5} />
    </g>
  );

  return (
    <svg
      ref={ref}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="vineGradientMain" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(152 72% 35% / 0.7)" />
          <stop offset="50%" stopColor="hsl(152 72% 45% / 0.9)" />
          <stop offset="100%" stopColor="hsl(152 72% 35% / 0.7)" />
        </linearGradient>
        <linearGradient id="vineGradientSecondary" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(152 72% 40% / 0.5)" />
          <stop offset="50%" stopColor="hsl(152 72% 50% / 0.7)" />
          <stop offset="100%" stopColor="hsl(152 72% 40% / 0.5)" />
        </linearGradient>
        <filter id="vineGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="leafGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* === OVERGROWN VINES OVER CARDS === */}
      
      {/* Card 1 (left) overgrowth - top vines */}
      <motion.path
        d="M 100 80 Q 150 40 200 60 Q 250 80 280 50 Q 300 30 320 60"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#vineGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.8, delay: 0.3, ease: "easeOut" }}
      />
      <motion.path
        d="M 80 120 Q 130 90 180 110 Q 220 130 260 100"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.7 } : {}}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
      />

      {/* Card 1 bottom vines */}
      <motion.path
        d="M 100 380 Q 150 420 200 400 Q 260 380 300 410"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.8 } : {}}
        transition={{ duration: 1.6, delay: 0.8, ease: "easeOut" }}
      />

      {/* Card 2 (center) overgrowth */}
      <motion.path
        d="M 500 60 Q 550 30 600 50 Q 650 70 700 40"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#vineGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
      />
      <motion.path
        d="M 480 100 Q 540 70 600 90 Q 660 110 720 80"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.7 } : {}}
        transition={{ duration: 1.4, delay: 0.8, ease: "easeOut" }}
      />

      {/* Card 2 bottom vines */}
      <motion.path
        d="M 480 400 Q 540 430 600 410 Q 670 390 720 420"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.8 } : {}}
        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
      />

      {/* Card 3 (right) overgrowth */}
      <motion.path
        d="M 880 70 Q 930 40 980 60 Q 1030 80 1080 50 Q 1100 35 1120 55"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#vineGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.8, delay: 0.4, ease: "easeOut" }}
      />
      <motion.path
        d="M 900 110 Q 960 80 1020 100 Q 1080 120 1120 90"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.7 } : {}}
        transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
      />

      {/* Card 3 bottom vines */}
      <motion.path
        d="M 880 390 Q 940 420 1000 400 Q 1060 380 1100 410"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.8 } : {}}
        transition={{ duration: 1.6, delay: 1.1, ease: "easeOut" }}
      />

      {/* === MAIN CONNECTION VINES === */}
      
      {/* Primary vine left to center - thick and prominent */}
      <motion.path
        d="M 320 250 Q 380 180 440 250 Q 500 320 560 250"
        fill="none"
        stroke="url(#vineGradientMain)"
        strokeWidth="5"
        strokeLinecap="round"
        filter="url(#vineGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
      />
      
      {/* Secondary vine left to center - parallel */}
      <motion.path
        d="M 300 280 Q 360 220 430 280 Q 490 340 550 280"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.8 } : {}}
        transition={{ duration: 2.2, delay: 0.7, ease: "easeOut" }}
      />

      {/* Third vine left to center - lower path */}
      <motion.path
        d="M 280 320 Q 350 370 420 320 Q 490 270 560 320"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}}
        transition={{ duration: 2.5, delay: 0.9, ease: "easeOut" }}
      />

      {/* Primary vine center to right */}
      <motion.path
        d="M 640 250 Q 700 180 760 250 Q 820 320 880 250"
        fill="none"
        stroke="url(#vineGradientMain)"
        strokeWidth="5"
        strokeLinecap="round"
        filter="url(#vineGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 2, delay: 1, ease: "easeOut" }}
      />

      {/* Secondary vine center to right */}
      <motion.path
        d="M 650 280 Q 710 220 780 280 Q 840 340 900 280"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.8 } : {}}
        transition={{ duration: 2.2, delay: 1.2, ease: "easeOut" }}
      />

      {/* Third vine center to right */}
      <motion.path
        d="M 640 320 Q 720 370 800 320 Q 860 270 920 320"
        fill="none"
        stroke="url(#vineGradientSecondary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}}
        transition={{ duration: 2.5, delay: 1.4, ease: "easeOut" }}
      />

      {/* === CURLING TENDRILS === */}
      {[
        { d: "M 360 220 Q 370 200 380 210 Q 390 220 385 200", delay: 1.6 },
        { d: "M 420 280 Q 430 300 440 290 Q 450 280 445 300", delay: 1.7 },
        { d: "M 500 230 Q 510 210 520 220 Q 530 230 525 210", delay: 1.8 },
        { d: "M 700 210 Q 710 190 720 200 Q 730 210 725 190", delay: 2.0 },
        { d: "M 760 290 Q 770 310 780 300 Q 790 290 785 310", delay: 2.1 },
        { d: "M 840 240 Q 850 220 860 230 Q 870 240 865 220", delay: 2.2 },
      ].map((tendril, i) => (
        <motion.path
          key={i}
          d={tendril.d}
          fill="none"
          stroke="hsl(152 72% 45% / 0.6)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: tendril.delay, ease: "easeOut" }}
        />
      ))}

      {/* === LEAVES ON CARDS === */}
      
      {/* Left card leaves */}
      <LeafCluster x={120} y={70} delay={1.4} />
      <DetailedLeaf x={200} y={55} rotation={20} delay={1.5} scale={1} />
      <DetailedLeaf x={280} y={65} rotation={-25} delay={1.6} scale={0.9} />
      <LeafCluster x={250} y={390} delay={1.7} />

      {/* Center card leaves */}
      <LeafCluster x={520} y={50} delay={1.5} />
      <DetailedLeaf x={600} y={45} rotation={15} delay={1.6} scale={1.1} />
      <DetailedLeaf x={680} y={55} rotation={-30} delay={1.7} scale={0.85} />
      <LeafCluster x={650} y={410} delay={1.8} />

      {/* Right card leaves */}
      <LeafCluster x={920} y={60} delay={1.6} />
      <DetailedLeaf x={1000} y={50} rotation={25} delay={1.7} scale={1} />
      <DetailedLeaf x={1080} y={60} rotation={-20} delay={1.8} scale={0.9} />
      <LeafCluster x={1050} y={400} delay={1.9} />

      {/* === CONNECTION LEAVES === */}
      <DetailedLeaf x={380} y={200} rotation={-35} delay={2.0} scale={1.1} />
      <DetailedLeaf x={450} y={280} rotation={30} delay={2.1} scale={1} />
      <DetailedLeaf x={520} y={240} rotation={-15} delay={2.2} scale={0.9} />
      <DetailedLeaf x={700} y={200} rotation={-40} delay={2.3} scale={1.1} />
      <DetailedLeaf x={780} y={270} rotation={25} delay={2.4} scale={1} />
      <DetailedLeaf x={850} y={230} rotation={-20} delay={2.5} scale={0.9} />

      {/* === DECORATIVE BERRIES/DOTS === */}
      {[340, 400, 470, 530, 670, 730, 800, 860].map((x, i) => (
        <motion.circle
          key={`berry-${i}`}
          cx={x}
          cy={250 + (i % 2 === 0 ? -15 : 15) + (i % 3) * 8}
          r="4"
          fill="hsl(152 72% 50% / 0.7)"
          stroke="hsl(152 72% 40% / 0.5)"
          strokeWidth="1"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 1.8 + i * 0.08 }}
        />
      ))}

      {/* === CONNECTION NODES === */}
      {[200, 600, 1000].map((x, i) => (
        <motion.g key={i}>
          <motion.circle
            cx={x}
            cy="250"
            r="18"
            fill="none"
            stroke="hsl(152 72% 40% / 0.4)"
            strokeWidth="2"
            filter="url(#vineGlow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { 
              scale: [0, 1.2, 1], 
              opacity: [0, 0.8, 0.6] 
            } : {}}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.5 }}
          />
          <motion.circle
            cx={x}
            cy="250"
            r="10"
            fill="hsl(152 72% 45% / 0.3)"
            filter="url(#vineGlow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: [0, 1.3, 1], opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 + i * 0.5 }}
          />
          <motion.circle
            cx={x}
            cy="250"
            r="6"
            fill="hsl(152 72% 50% / 0.9)"
            filter="url(#vineGlow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: [0, 1.5, 1], opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.5 }}
          />
          {/* Single pulse */}
          <motion.circle
            cx={x}
            cy="250"
            r="6"
            fill="none"
            stroke="hsl(152 72% 55% / 0.6)"
            strokeWidth="2"
            initial={{ scale: 1, opacity: 0 }}
            animate={isInView ? { 
              scale: [1, 2.5, 3], 
              opacity: [0.8, 0.3, 0] 
            } : {}}
            transition={{ 
              duration: 2, 
              delay: 1.5 + i * 0.5,
            }}
          />
        </motion.g>
      ))}
    </svg>
  );
};

export default VineConnections;
