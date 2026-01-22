import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sparkles } from "lucide-react";

interface PlantGrowthTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

const PlantGrowthTransition = ({ isActive, onComplete }: PlantGrowthTransitionProps) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setStage(0);
      return;
    }

    // Stage progression
    const timers = [
      setTimeout(() => setStage(1), 100),   // Start growing
      setTimeout(() => setStage(2), 800),   // Full plant
      setTimeout(() => setStage(3), 1500),  // Show message
      setTimeout(() => setStage(4), 2800),  // Fade out
      setTimeout(() => {
        onComplete();
        setStage(0);
      }, 3300),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 1 ? 1 : 0 }}
            exit={{ opacity: 0 }}
          />

          {/* Plant container */}
          <div className="relative flex flex-col items-center">
            {/* Soil/base */}
            <motion.div
              className="absolute bottom-0 w-20 h-4 bg-gradient-to-t from-amber-900/50 to-amber-800/30 rounded-full blur-sm"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={stage >= 1 ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 0.3 }}
            />

            {/* Stem */}
            <motion.div
              className="absolute bottom-2 w-1 bg-gradient-to-t from-swap-green to-swap-green-light rounded-full origin-bottom"
              initial={{ height: 0 }}
              animate={stage >= 1 ? { height: 80 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {/* Leaves */}
            <motion.div
              className="absolute bottom-16"
              initial={{ scale: 0, opacity: 0 }}
              animate={stage >= 2 ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <motion.div
                className="flex gap-1"
                animate={stage >= 2 ? { rotate: [0, -5, 5, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Leaf className="w-8 h-8 text-swap-green -rotate-45" />
                <Leaf className="w-8 h-8 text-swap-green rotate-45 scale-x-[-1]" />
              </motion.div>
            </motion.div>

            {/* Top leaf */}
            <motion.div
              className="absolute bottom-24"
              initial={{ scale: 0, opacity: 0 }}
              animate={stage >= 2 ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Leaf className="w-10 h-10 text-swap-green" />
            </motion.div>

            {/* Sparkles */}
            <AnimatePresence>
              {stage >= 2 && stage < 4 && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-swap-gold"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: Math.cos((i * 45 * Math.PI) / 180) * 60,
                        y: Math.sin((i * 45 * Math.PI) / 180) * 60 - 40,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Message */}
            <motion.div
              className="absolute -bottom-20 whitespace-nowrap"
              initial={{ opacity: 0, y: 20 }}
              animate={stage >= 3 ? { opacity: 1, y: 0 } : {}}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl sm:text-2xl font-semibold text-foreground">
                Welcome to the{" "}
                <span className="text-gradient-swap">chain</span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlantGrowthTransition;
