import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Leaf } from "lucide-react";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      setIsComplete(value > 0.95);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-2">
      {/* Progress track */}
      <div className="relative w-1 h-48 bg-border/30 rounded-full overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-swap-green via-swap-green to-swap-green-light rounded-full origin-bottom"
          style={{ scaleY, transformOrigin: "bottom" }}
        />
        
        {/* Glow effect at top of progress */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-swap-green blur-sm"
          style={{ 
            bottom: 0,
            y: useSpring(scrollYProgress, { stiffness: 100, damping: 30 }).get() * -192 
          }}
        />
      </div>
      
      {/* Leaf indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={isComplete ? { 
          opacity: 1, 
          scale: 1, 
          rotate: 0,
        } : { 
          opacity: 0.3, 
          scale: 0.8,
          rotate: 0 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15 
        }}
        className="relative"
      >
        <motion.div
          animate={isComplete ? {
            boxShadow: [
              "0 0 0 0 rgba(34, 197, 94, 0)",
              "0 0 20px 10px rgba(34, 197, 94, 0.3)",
              "0 0 0 0 rgba(34, 197, 94, 0)"
            ]
          } : {}}
          transition={{ duration: 1.5, repeat: isComplete ? Infinity : 0 }}
          className="w-10 h-10 rounded-full bg-swap-green/20 border border-swap-green/40 flex items-center justify-center"
        >
          <Leaf className={`w-5 h-5 transition-colors duration-500 ${isComplete ? 'text-swap-green' : 'text-muted-foreground/50'}`} />
        </motion.div>
        
        {/* Celebration particles */}
        {isComplete && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-swap-green"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos((i * 60 * Math.PI) / 180) * 25,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 25,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ScrollProgress;
