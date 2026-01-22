import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, MousePointerClick } from "lucide-react";

interface Domino {
  id: number;
  x: number;
  fallen: boolean;
  wobble: number;
}

const DominoAnimation = () => {
  const [dominoes, setDominoes] = useState<Domino[]>([]);
  const [falling, setFalling] = useState(false);
  const [showLeaves, setShowLeaves] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseX = useRef(0);

  const handleMouseDown = () => {
    setIsMouseDown(true);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (falling || !isMouseDown) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const progress = x / rect.width;
    
    // Add domino when mouse moves while pressed
    if (Math.abs(x - lastMouseX.current) > 25 && dominoes.length < 30) {
      lastMouseX.current = x;
      setDominoes(prev => {
        if (prev.length >= 30) return prev;
        return [...prev, { 
          id: Date.now(), 
          x: progress * 100, 
          fallen: false,
          wobble: (Math.random() - 0.5) * 8 // Random initial wobble
        }];
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
    setIsMouseDown(false);
    
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
      className="relative w-full h-32 cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-swap-green/5 via-transparent to-swap-green/5" />
      
      {/* Domino track */}
      <div className="absolute bottom-6 left-8 right-8 h-1 bg-gradient-to-r from-swap-green/30 via-swap-green/50 to-swap-green/30 rounded-full" />
      
      {/* Dominoes */}
      <AnimatePresence>
        {dominoes.map((domino) => (
          <motion.div
            key={domino.id}
            className="absolute bottom-6 w-2.5 h-12 bg-gradient-to-t from-swap-green to-swap-green-light rounded-sm origin-bottom shadow-lg shadow-swap-green/20"
            style={{ left: `calc(8% + ${domino.x * 0.84}%)` }}
            initial={{ scaleY: 0, rotateZ: domino.wobble }}
            animate={{ 
              scaleY: 1, 
              rotateZ: domino.fallen ? 85 : [domino.wobble, -domino.wobble, domino.wobble],
              opacity: domino.fallen ? 0.6 : 1
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              scaleY: { type: "spring", stiffness: 300, damping: 20 },
              rotateZ: domino.fallen 
                ? { duration: 0.3, ease: "easeOut" }
                : { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Counter */}
      <motion.div 
        className="absolute top-3 right-4 text-sm font-medium text-swap-green/70"
        animate={{ opacity: dominoes.length > 0 ? 1 : 0 }}
      >
        {dominoes.length}/30 actions
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
      
      {/* Instruction */}
      {dominoes.length === 0 && !falling && (
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <MousePointerClick className="w-5 h-5" />
            <span className="text-sm font-medium">Click & drag to add actions</span>
          </motion.div>
          <p className="text-xs text-muted-foreground/50">Build up 30 actions to see them fall together</p>
        </motion.div>
      )}
    </div>
  );
};

export default DominoAnimation;
