import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import { Leaf, Camera, Gift, MapPin, Store, Users, ArrowRight, Sparkles, Globe, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Animated counter component with improved animation
const AnimatedCounter = ({ end, duration = 2, suffix = "" }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easedProgress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// Cursor-following glow effect
const CursorGlow = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed pointer-events-none z-30"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      {/* Main glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, hsl(145 60% 45% / 0.08) 0%, hsl(200 60% 45% / 0.04) 40%, transparent 70%)",
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Inner bright spot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 150,
          height: 150,
          background: "radial-gradient(circle, hsl(145 60% 50% / 0.15) 0%, transparent 70%)",
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Tiny core */}
      <motion.div
        className="absolute rounded-full blur-sm"
        style={{
          width: 30,
          height: 30,
          background: "radial-gradient(circle, hsl(145 60% 55% / 0.3) 0%, transparent 70%)",
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </motion.div>
  );
};

// Accumulating particles - symbolizing small actions adding up
const AccumulatingParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; delay: number }>>([]);
  const maxParticles = 200;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start with some initial particles
    const initialParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.4 + 0.2,
      delay: Math.random() * 2,
    }));
    setParticles(initialParticles);

    // Add new particles over time
    const interval = setInterval(() => {
      setParticles(prev => {
        if (prev.length >= maxParticles) return prev;
        
        const newParticle = {
          id: Date.now() + Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          delay: 0,
        };
        
        return [...prev, newParticle];
      });
    }, 800); // Add a new particle every 800ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: particle.opacity,
            scale: 1,
          }}
          transition={{ 
            duration: 2,
            delay: particle.delay,
            ease: "easeOut",
          }}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, hsl(145 60% 50% / ${particle.opacity + 0.2}) 0%, hsl(145 60% 45% / ${particle.opacity}) 100%)`,
            boxShadow: `0 0 ${particle.size * 2}px hsl(145 60% 50% / ${particle.opacity * 0.5})`,
          }}
        />
      ))}
      {/* Particle counter - subtle indicator */}
      <motion.div 
        className="fixed bottom-6 right-6 text-xs text-muted-foreground/30 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5 }}
      >
        {particles.length} small actions
      </motion.div>
    </div>
  );
};

// Animated grid background
const GridBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <div 
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(hsl(145 60% 40% / 0.1) 1px, transparent 1px),
          linear-gradient(90deg, hsl(145 60% 40% / 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '100px 100px',
      }}
    />
    <motion.div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, hsl(220 20% 8%) 70%)',
      }}
    />
  </div>
);

// Glowing orb decoration
const GlowingOrb = ({ className, color = "green", size = "lg" }: { className?: string; color?: "green" | "blue" | "gold"; size?: "sm" | "md" | "lg" }) => {
  const colors = {
    green: "hsl(145 60% 45%)",
    blue: "hsl(200 65% 50%)",
    gold: "hsl(45 80% 55%)",
  };
  const sizes = { sm: 150, md: 300, lg: 500 };
  
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{
        width: sizes[size],
        height: sizes[size],
        background: `radial-gradient(circle, ${colors[color]}20 0%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Step card component with enhanced animations
const StepCard = ({ 
  step, 
  icon: Icon, 
  title, 
  items, 
  delay 
}: { 
  step: number; 
  icon: React.ElementType; 
  title: string; 
  items: string[]; 
  delay: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative perspective-1000"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-swap-green/20 to-transparent rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
      <motion.div 
        className="absolute -inset-0.5 bg-gradient-to-r from-swap-green/30 via-swap-sky/20 to-swap-green/30 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 h-full transition-all duration-500 group-hover:border-swap-green/40 group-hover:-translate-y-3 group-hover:shadow-2xl group-hover:shadow-swap-green/10">
        <div className="flex items-center gap-4 mb-6">
          <motion.div 
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-swap-green/20 to-swap-sky/10 flex items-center justify-center group-hover:from-swap-green/30 group-hover:to-swap-sky/20 transition-all duration-500"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon className="w-7 h-7 text-swap-green" />
          </motion.div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-swap-green/70">Step</span>
            <span className="text-2xl font-bold text-gradient-swap">{step}</span>
          </div>
        </div>
        <h3 className="text-2xl font-semibold mb-5 text-foreground group-hover:text-gradient-swap transition-all duration-300">{title}</h3>
        <ul className="space-y-3">
          {items.map((item, i) => (
            <motion.li 
              key={i} 
              className="flex items-center gap-3 text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: delay + 0.1 * (i + 1), duration: 0.5 }}
            >
              <motion.div 
                className="w-2 h-2 rounded-full bg-gradient-to-r from-swap-green to-swap-sky"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// Use case card component with enhanced effects
const UseCaseCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay,
  accentColor = "green"
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  delay: number;
  accentColor?: "green" | "blue" | "gold";
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const colors = {
    green: "from-swap-green/20 to-swap-green/5",
    blue: "from-swap-sky/20 to-swap-sky/5",
    gold: "from-swap-gold/20 to-swap-gold/5",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: 40 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div className="relative bg-card/40 backdrop-blur-xl border border-border/30 rounded-3xl p-8 h-full overflow-hidden transition-all duration-500 group-hover:border-swap-green/50 group-hover:bg-card/60 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-swap-green/5">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors[accentColor]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        <motion.div 
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-swap-green/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        />
        <div className="relative z-10">
          <motion.div 
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors[accentColor]} border border-border/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-8 h-8 text-swap-green" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-swap-green transition-colors duration-300">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Improved Stats card - uniform sizing
const StatCard = ({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-swap-green/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-card/30 backdrop-blur-sm border border-border/20 rounded-3xl p-8 h-full min-h-[180px] flex flex-col items-center justify-center group-hover:border-swap-green/30 transition-all duration-300">
        <motion.div 
          className="flex items-baseline justify-center gap-1 mb-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="text-4xl sm:text-5xl font-bold text-gradient-swap tabular-nums">
            <AnimatedCounter end={value} duration={2.5} />
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-gradient-swap">
            {suffix}
          </span>
        </motion.div>
        <p className="text-muted-foreground text-base font-medium text-center">{label}</p>
      </div>
    </motion.div>
  );
};

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.12], [0, 80]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Cursor glow effect */}
      <CursorGlow />
      
      {/* Accumulating particles */}
      <AccumulatingParticles />

      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <GridBackground />
        
        {/* Animated background gradients */}
        <div className="absolute inset-0">
          <GlowingOrb className="top-1/4 -left-1/4" color="green" size="lg" />
          <GlowingOrb className="bottom-1/4 -right-1/4" color="blue" size="lg" />
          <GlowingOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" color="green" size="md" />
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 container mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-swap-green/10 border border-swap-green/20 text-swap-green text-sm font-medium mb-8 backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: "hsl(145 60% 45% / 0.4)" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              Now available worldwide
              <Globe className="w-4 h-4 ml-1 opacity-60" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight mb-8 leading-[1.05]"
          >
            <motion.span 
              className="block"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Do good.
            </motion.span>
            <motion.span 
              className="block text-gradient-swap"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              Get back.
            </motion.span>
            <motion.span 
              className="block text-muted-foreground/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Change the planet.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed"
          >
            SWAP is a global platform where people help the planet and each other —
            and get rewarded by local businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="group relative px-10 py-7 text-lg font-semibold bg-swap-green hover:bg-swap-green-light text-background transition-all duration-300 glow-green overflow-hidden"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative flex items-center gap-2">
                    Join SWAP
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </Link>
            <a href="#how-it-works">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-10 py-7 text-lg font-semibold border-border/50 hover:border-swap-green/50 hover:bg-swap-green/5 transition-all duration-300 backdrop-blur-sm"
                >
                  See how it works
                </Button>
              </motion.div>
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-7 h-12 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2 backdrop-blur-sm"
          >
            <motion.div 
              className="w-1.5 h-3 rounded-full bg-gradient-to-b from-swap-green to-swap-sky"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 px-6">
        <GlowingOrb className="-left-40 top-1/2 -translate-y-1/2" color="green" size="md" />
        <GlowingOrb className="-right-40 top-1/3" color="blue" size="sm" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-swap-green/10 border border-swap-green/20 mb-6"
            >
              <Zap className="w-8 h-8 text-swap-green" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              How SWAP <span className="text-gradient-swap">works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Three simple steps to make an impact and earn rewards.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <StepCard
              step={1}
              icon={Leaf}
              title="Do something good"
              items={["Clean a beach", "Help a local business", "Support your community"]}
              delay={0}
            />
            <StepCard
              step={2}
              icon={Camera}
              title="Get verified"
              items={["Upload proof", "Reviewed by humans, not bots", "Earn trust over time"]}
              delay={0.2}
            />
            <StepCard
              step={3}
              icon={Gift}
              title="Get rewarded"
              items={["Earn SWAP Points", "Redeem food, showers, beds", "Unlock local discounts"]}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-swap-green/5 via-transparent to-transparent" />
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, hsl(145 60% 35% / 0.06) 0%, transparent 60%)",
          }}
        />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-swap-green/10 border border-swap-green/20 mb-6"
            >
              <Heart className="w-8 h-8 text-swap-green" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Our <span className="text-gradient-swap">impact</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Numbers that speak louder than words.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard value={100} suffix="M+" label="Users by 2030" delay={0} />
            <StatCard value={12} suffix="M+" label="Cleanup actions" delay={0.1} />
            <StatCard value={4} suffix="M+ kg" label="Waste removed" delay={0.2} />
            <StatCard value={25} suffix="K+" label="Local partners" delay={0.3} />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-32 px-6">
        <GlowingOrb className="-right-40 top-1/4" color="gold" size="md" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-swap-green/10 border border-swap-green/20 mb-6"
            >
              <Users className="w-8 h-8 text-swap-green" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Built for <span className="text-gradient-swap">everyone</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Whether you're traveling, local, or running a business.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <UseCaseCard
              icon={MapPin}
              title="For Travelers & Campers"
              description="Do good wherever you are. Get food, showers, or a place to stay in exchange for helping local communities."
              delay={0}
              accentColor="green"
            />
            <UseCaseCard
              icon={Users}
              title="For Locals"
              description="Improve your city and get rewarded. Turn your neighborhood cleanup into real value."
              delay={0.15}
              accentColor="blue"
            />
            <UseCaseCard
              icon={Store}
              title="For Businesses"
              description="Support your community and attract conscious customers. Become a SWAP partner."
              delay={0.3}
              accentColor="gold"
            />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-swap-green/3 to-transparent" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.p 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
            >
              <span className="text-muted-foreground/80">SWAP is not about saving the world alone.</span>
              <br />
              <motion.span 
                className="text-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                It's about millions of small actions —
              </motion.span>
              <br />
              <motion.span 
                className="text-gradient-swap font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 1 }}
              >
                finally adding up.
              </motion.span>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-swap-green/10 via-transparent to-transparent" />
        <GlowingOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" color="green" size="lg" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              The planet needs action.
              <br />
              <span className="text-gradient-swap">SWAP makes it easy.</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
              <Link to="/auth">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    className="group relative px-10 py-7 text-lg font-semibold bg-swap-green hover:bg-swap-green-light text-background transition-all duration-300 glow-green overflow-hidden"
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative flex items-center gap-2">
                      Join the movement
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              </Link>
              <Link to="/auth">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="px-10 py-7 text-lg font-semibold border-border/50 hover:border-swap-green/50 hover:bg-swap-green/5 transition-all duration-300 backdrop-blur-sm"
                  >
                    Create your first quest
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-border/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-swap-green/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-swap-green" />
              </div>
              <div>
                <span className="font-bold text-xl">SWAP</span>
                <p className="text-sm text-muted-foreground">A product by Earth Swap</p>
              </div>
            </div>
            
            <nav className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
              <Link to="/rewards" className="hover:text-foreground transition-colors">Rewards</Link>
              <Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
            </nav>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Earth Swap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
