import { useEffect, useState, useMemo } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Leaf } from "lucide-react";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [isComplete, setIsComplete] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Section markers (approximate scroll positions)
  const sections = useMemo(() => [
    { id: 'hero', position: 0, label: 'Start' },
    { id: 'how-it-works', position: 0.15, label: 'How It Works' },
    { id: 'use-cases', position: 0.3, label: 'For Everyone' },
    { id: 'impact', position: 0.5, label: 'Our Impact' },
    { id: 'deep-dive', position: 0.65, label: 'Deep Dive' },
    { id: 'philosophy', position: 0.8, label: 'Philosophy' },
    { id: 'cta', position: 0.95, label: 'Join' },
  ], []);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      setIsComplete(value > 0.95);
      setCurrentProgress(value);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Transform progress to height
  const progressHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-3">
      {/* Progress track with section dots */}
      <div className="relative w-2 h-80 bg-border/20 rounded-full overflow-visible">
        {/* Progress fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-swap-green via-swap-green to-swap-green-light rounded-full"
          style={{ height: progressHeight }}
        />
        
        {/* Section dots */}
        {sections.map((section, i) => {
          const isActive = currentProgress >= section.position;
          const isPast = currentProgress > section.position + 0.1;
          
          return (
            <motion.div
              key={section.id}
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3"
              style={{ bottom: `${section.position * 100}%` }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {/* Dot */}
              <motion.div
                className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                  isActive 
                    ? 'bg-swap-green border-swap-green shadow-[0_0_8px_2px_hsl(152_72%_45%/0.5)]' 
                    : 'bg-background border-border/50'
                }`}
                animate={isPast ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
              
              {/* Label tooltip on hover */}
              <motion.div
                className="absolute left-6 whitespace-nowrap px-2 py-1 bg-card/90 backdrop-blur-sm border border-border/50 rounded text-xs text-muted-foreground opacity-0 pointer-events-none"
                whileHover={{ opacity: 1 }}
                style={{ opacity: 0 }}
              >
                {section.label}
              </motion.div>
            </motion.div>
          );
        })}
        
        {/* Current position indicator glow */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-swap-green/50 blur-md"
          style={{ 
            bottom: progressHeight,
            y: '50%'
          }}
        />
      </div>
      
      {/* Leaf indicator at bottom */}
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
        className="relative mt-2"
      >
        <motion.div
          animate={isComplete ? {
            boxShadow: [
              "0 0 0 0 rgba(34, 197, 94, 0)",
              "0 0 25px 12px rgba(34, 197, 94, 0.4)",
              "0 0 0 0 rgba(34, 197, 94, 0)"
            ]
          } : {}}
          transition={{ duration: 1.5, repeat: isComplete ? Infinity : 0 }}
          className="w-12 h-12 rounded-full bg-swap-green/20 border-2 border-swap-green/50 flex items-center justify-center"
        >
          <Leaf className={`w-6 h-6 transition-colors duration-500 ${isComplete ? 'text-swap-green' : 'text-muted-foreground/50'}`} />
        </motion.div>
        
        {/* Celebration particles */}
        {isComplete && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-swap-green"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: ['-50%', `calc(-50% + ${Math.cos((i * 45 * Math.PI) / 180) * 30}px)`],
                  y: ['-50%', `calc(-50% + ${Math.sin((i * 45 * Math.PI) / 180) * 30}px)`],
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
        
        {/* "Earth Saved" text when complete */}
        <motion.div
          className="absolute -right-20 top-1/2 -translate-y-1/2 whitespace-nowrap"
          initial={{ opacity: 0, x: -10 }}
          animate={isComplete ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-xs font-medium text-swap-green">🌍 Saved!</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ScrollProgress;
