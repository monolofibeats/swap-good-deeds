import { motion, useScroll, useTransform } from "framer-motion";
import earthBurning from "@/assets/earth-burning.png";
import earthHealthy from "@/assets/earth-healthy.png";

const EarthAnimation = () => {
  const { scrollYProgress } = useScroll();
  
  // Transform values based on scroll
  const rotation = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const burningOpacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 0.5, 0]);
  const healthyOpacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [0, 0.5, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 1.15]);
  const glowIntensity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.4, 0.8]);
  const fireGlow = useTransform(scrollYProgress, [0, 0.3, 0.6], [0.6, 0.3, 0]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
      {/* Earth container */}
      <motion.div
        className="relative"
        style={{
          width: "min(90vw, 90vh)",
          height: "min(90vw, 90vh)",
          rotate: rotation,
          scale,
        }}
      >
        {/* Fire/destruction glow (fades out as you scroll) */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, hsl(25 90% 50% / 0.4) 0%, hsl(0 80% 40% / 0.3) 40%, transparent 70%)",
            opacity: fireGlow,
            scale: 1.4,
          }}
        />

        {/* Healthy earth glow (fades in as you scroll) */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, hsl(145 60% 45% / 0.3) 0%, hsl(200 70% 50% / 0.2) 40%, transparent 70%)",
            opacity: glowIntensity,
            scale: 1.4,
          }}
        />

        {/* Burning Earth Image */}
        <motion.img
          src={earthBurning}
          alt="Earth in crisis"
          className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
          style={{
            opacity: burningOpacity,
            filter: "contrast(1.1) saturate(1.2)",
          }}
        />

        {/* Healthy Earth Image */}
        <motion.img
          src={earthHealthy}
          alt="Healthy Earth"
          className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
          style={{
            opacity: healthyOpacity,
            filter: "contrast(1.05) saturate(1.1)",
          }}
        />

        {/* Smoke/pollution layer (fades out) */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(ellipse at 30% 30%, hsl(0 0% 20% / 0.4) 0%, transparent 50%)",
            opacity: useTransform(scrollYProgress, [0, 0.4], [0.5, 0]),
            scale: 1.2,
          }}
        />

        {/* Atmospheric rim light (increases with health) */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 70% 30%, transparent 40%, hsl(200 80% 60% / 0.15) 55%, transparent 70%)",
            opacity: glowIntensity,
          }}
        />
      </motion.div>

      {/* Dark overlay that fades as you scroll */}
      <motion.div
        className="absolute inset-0 bg-background"
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.3], [0.75, 0.88]),
        }}
      />
    </div>
  );
};

export default EarthAnimation;
