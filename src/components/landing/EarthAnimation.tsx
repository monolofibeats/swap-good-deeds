import { motion, useScroll, useTransform } from "framer-motion";

const EarthAnimation = () => {
  const { scrollYProgress } = useScroll();
  
  // Transform values based on scroll
  const rotation = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const healthiness = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  
  // Colors transition from dead to alive
  const oceanColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["hsl(220 10% 25%)", "hsl(200 40% 35%)", "hsl(200 70% 45%)"]
  );
  const landColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["hsl(30 20% 20%)", "hsl(80 30% 30%)", "hsl(145 60% 35%)"]
  );
  const atmosphereOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.1, 0.3, 0.5]);
  const pollutionOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.2, 0]);
  const glowIntensity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.3, 0.6]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
      {/* Earth container */}
      <motion.div
        className="relative"
        style={{
          width: "min(80vw, 80vh)",
          height: "min(80vw, 80vh)",
          rotate: rotation,
        }}
      >
        {/* Outer glow (healthy earth glow) */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, hsl(145 60% 45% / var(--glow)) 0%, transparent 70%)`,
            opacity: glowIntensity,
            scale: 1.3,
          }}
        />

        {/* Main Earth sphere */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            boxShadow: "inset -30px -30px 60px rgba(0,0,0,0.5), inset 20px 20px 40px rgba(255,255,255,0.1)",
          }}
        >
          {/* Ocean layer */}
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: oceanColor }}
          />

          {/* Continents - stylized shapes */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {/* North America-ish */}
            <motion.path
              d="M20 25 Q25 20 35 22 Q40 25 38 35 Q35 45 25 48 Q18 45 15 35 Q15 28 20 25"
              style={{ fill: landColor }}
            />
            {/* South America-ish */}
            <motion.path
              d="M28 55 Q32 52 35 55 Q38 65 35 75 Q30 80 27 75 Q24 65 28 55"
              style={{ fill: landColor }}
            />
            {/* Europe/Africa-ish */}
            <motion.path
              d="M48 20 Q55 18 58 25 Q60 35 55 45 Q52 55 48 65 Q45 70 42 65 Q40 55 42 45 Q44 30 48 20"
              style={{ fill: landColor }}
            />
            {/* Asia-ish */}
            <motion.path
              d="M62 22 Q75 20 82 28 Q85 35 80 42 Q72 48 65 45 Q58 40 60 32 Q60 25 62 22"
              style={{ fill: landColor }}
            />
            {/* Australia-ish */}
            <motion.path
              d="M72 60 Q80 58 82 65 Q82 72 75 74 Q68 72 70 65 Q70 60 72 60"
              style={{ fill: landColor }}
            />
          </svg>

          {/* Pollution/smog layer */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at 30% 30%, hsl(30 40% 30% / 0.6) 0%, hsl(0 0% 20% / 0.4) 50%, transparent 70%)",
              opacity: pollutionOpacity,
            }}
          />

          {/* Healthy atmosphere glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 30%, hsl(200 70% 60% / 0.3) 0%, transparent 50%)",
              opacity: atmosphereOpacity,
            }}
          />

          {/* Clouds layer (becomes more visible as earth heals) */}
          <motion.div
            className="absolute inset-0"
            style={{ opacity: atmosphereOpacity }}
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <ellipse cx="25" cy="30" rx="12" ry="4" fill="white" opacity="0.4" />
              <ellipse cx="70" cy="25" rx="15" ry="5" fill="white" opacity="0.3" />
              <ellipse cx="55" cy="55" rx="10" ry="3" fill="white" opacity="0.35" />
              <ellipse cx="30" cy="70" rx="8" ry="3" fill="white" opacity="0.3" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Atmospheric rim light */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 70% 30%, transparent 40%, hsl(200 60% 50% / 0.2) 60%, transparent 70%)",
            opacity: atmosphereOpacity,
          }}
        />

        {/* Stars around (more visible when earth is dead) */}
        <motion.div
          className="absolute -inset-20"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.15, 0.05]) }}
        >
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Dark overlay that fades as you scroll */}
      <motion.div
        className="absolute inset-0 bg-background"
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.3], [0.7, 0.85]),
        }}
      />
    </div>
  );
};

export default EarthAnimation;
