import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface GlowingCTAButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
  onClick?: () => void;
  withTransition?: boolean;
}

const GlowingCTAButton = ({ children, variant = "primary", className = "", onClick, withTransition = false }: GlowingCTAButtonProps) => {
  if (variant === "primary") {
    return (
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.03 }} 
        whileTap={{ scale: 0.98 }}
      >
        {/* Subtle animated glow ring */}
        <motion.div
          className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-swap-green/40 via-swap-green-light/50 to-swap-green/40 opacity-30 blur-sm"
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Very subtle pulse ring */}
        <motion.div
          className="absolute -inset-1 rounded-xl border border-swap-green/20"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        
        <Button 
          size="lg" 
          className={`group relative px-10 py-7 text-lg font-semibold bg-swap-green hover:bg-swap-green-light text-background transition-all duration-300 overflow-hidden ${className}`}
          onClick={onClick}
        >
          {/* Subtle shimmer effect */}
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          />
          <span className="relative">{children}</span>
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="relative"
      whileHover={{ scale: 1.03 }} 
      whileTap={{ scale: 0.98 }}
    >
      {/* Very subtle glow for outline */}
      <motion.div
        className="absolute -inset-0.5 rounded-xl bg-swap-green/10 opacity-0 blur-sm"
        animate={{
          opacity: [0, 0.2, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <Button 
        variant="outline" 
        size="lg"
        className={`px-10 py-7 text-lg font-semibold border-border/50 hover:border-swap-green/40 hover:bg-swap-green/5 transition-all duration-300 backdrop-blur-sm ${className}`}
        onClick={onClick}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default GlowingCTAButton;
