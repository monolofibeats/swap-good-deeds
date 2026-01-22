import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface GlowingCTAButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
  onClick?: () => void;
}

const GlowingCTAButton = ({ children, variant = "primary", className = "", onClick }: GlowingCTAButtonProps) => {
  if (variant === "primary") {
    return (
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.98 }}
      >
        {/* Animated glow ring */}
        <motion.div
          className="absolute -inset-1 rounded-xl bg-gradient-to-r from-swap-green via-swap-green-light to-swap-green opacity-50 blur-md"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Pulse ring */}
        <motion.div
          className="absolute -inset-2 rounded-xl border-2 border-swap-green/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        
        <Button 
          size="lg" 
          className={`group relative px-10 py-7 text-lg font-semibold bg-swap-green hover:bg-swap-green-light text-background transition-all duration-300 overflow-hidden ${className}`}
          onClick={onClick}
        >
          {/* Shimmer effect */}
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
          />
          <span className="relative">{children}</span>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="relative"
      whileHover={{ scale: 1.05 }} 
      whileTap={{ scale: 0.98 }}
    >
      {/* Subtle glow for outline */}
      <motion.div
        className="absolute -inset-0.5 rounded-xl bg-swap-green/20 opacity-0 blur-sm"
        animate={{
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <Button 
        variant="outline" 
        size="lg"
        className={`px-10 py-7 text-lg font-semibold border-border/50 hover:border-swap-green/50 hover:bg-swap-green/5 transition-all duration-300 backdrop-blur-sm ${className}`}
        onClick={onClick}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default GlowingCTAButton;
