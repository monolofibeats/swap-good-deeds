import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";

interface Domino {
  id: number;
  x: number;
  fallen: boolean;
}

const DominoAnimation = () => {
  const [dominoes, setDominoes] = useState<Domino[]>([]);
  const [falling, setFalling] = useState(false);
  const [showLeaves, setShowLeaves] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseX = useRef(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (falling) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    
    // Add domino when mouse moves significantly
    if (Math.abs(x - lastMouseX.current) > 20 && dominoes.length < 30) {
      lastMouseX.current = x;
      setDominoes(prev => {
        if (prev.length >= 30) return prev;
        return [...prev, { id: Date.now(), x: progress * 100, fallen: false }];
      });
    }
    
    // Trigger fall when we reach 30
    if (dominoes.length >= 29) {
      triggerFall();
    }
  };

  const triggerFall = () => {
    if (falling) return;
    setFalling(true);
    
    // Fall dominoes one by one
    const sortedDominoes = [...dominoes].sort((a, b) => a.x - b.x);
    sortedDominoes.forEach((domino, index) => {
      setTimeout(() => {
        setDominoes(prev => 
          prev.map(d => d.id === domino.id ? { ...d, fallen: true } : d)
        );
      }, index * 50);
    });
    
    // Show leaves celebration
    setTimeout(() => {
      setShowLeaves(true);
    }, sortedDominoes.length * 50 + 200);
    
    // Reset after animation
    setTimeout(() => {
      setShowLeaves(false);
      setFalling(false);
      setDominoes([]);
    }, sortedDominoes.length * 50 + 3000);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-24 cursor-pointer overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Domino track */}
      <div className="absolute bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-swap-green/20 to-transparent" />
      
      {/* Dominoes */}
      <AnimatePresence>
        {dominoes.map((domino, index) => (
          <motion.div
            key={domino.id}
            className="absolute bottom-4 w-2 h-10 bg-gradient-to-t from-swap-green to-swap-green-light rounded-sm origin-bottom"
            style={{ left: `${domino.x}%` }}
            initial={{ scaleY: 0, rotateZ: 0 }}
            animate={{ 
              scaleY: 1, 
              rotateZ: domino.fallen ? 85 : 0,
              opacity: domino.fallen ? 0.6 : 1
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              scaleY: { type: "spring", stiffness: 300, damping: 20 },
              rotateZ: { duration: 0.3, ease: "easeOut" }
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Counter hint */}
      <motion.div 
        className="absolute top-0 right-4 text-xs text-muted-foreground/50"
        animate={{ opacity: dominoes.length > 0 ? 1 : 0 }}
      >
        {dominoes.length}/30
      </motion.div>
      
      {/* Leaves celebration */}
      <AnimatePresence>
        {showLeaves && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-swap-green"
                initial={{ 
                  x: "50%", 
                  y: "100%", 
                  scale: 0,
                  rotate: 0 
                }}
                animate={{ 
                  x: `${20 + Math.random() * 60}%`, 
                  y: `${-20 - Math.random() * 80}%`,
                  scale: [0, 1.5, 1],
                  rotate: Math.random() * 360 - 180
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 1.5 + Math.random() * 0.5,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
              >
                <Leaf className="w-4 h-4 sm:w-6 sm:h-6" />
              </motion.div>
            ))}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <span className="text-swap-green font-bold text-lg sm:text-xl">
                ✨ Together! ✨
              </span>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Instruction text */}
      {dominoes.length === 0 && !falling && (
        <motion.p 
          className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/40"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Swipe here to add actions...
        </motion.p>
      )}
    </div>
  );
};

export default DominoAnimation;
