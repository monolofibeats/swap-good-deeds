import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import { Camera, Gift, MapPin, Store, Users, ArrowRight, Sparkles, Globe, Zap, Heart, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/landing/LanguageSwitcher";
import EarthAnimation from "@/components/landing/EarthAnimation";
import HelpChatbot from "@/components/landing/HelpChatbot";
import FloatingLeaves from "@/components/landing/FloatingLeaves";
import AnimatedParticles from "@/components/landing/AnimatedParticles";
import DeepDiveSection from "@/components/landing/DeepDiveSection";
import DominoAnimation from "@/components/landing/DominoAnimation";
import ImpactGalleryModal from "@/components/landing/ImpactGalleryModal";
import GlowingCTAButton from "@/components/landing/GlowingCTAButton";
import { SwapLogo } from "@/components/shared/SwapLogo";

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
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, hsl(152 72% 45% / 0.06) 0%, hsl(152 72% 45% / 0.02) 40%, transparent 70%)",
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 150,
          height: 150,
          background: "radial-gradient(circle, hsl(152 72% 50% / 0.12) 0%, transparent 70%)",
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      <motion.div
        className="absolute rounded-full blur-sm"
        style={{
          width: 30,
          height: 30,
          background: "radial-gradient(circle, hsl(152 72% 55% / 0.25) 0%, transparent 70%)",
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </motion.div>
  );
};

// Glowing orb decoration - green only, more subtle
const GlowingOrb = ({ className, size = "lg" }: { className?: string; size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: 150, md: 300, lg: 500 };
  
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{
        width: sizes[size],
        height: sizes[size],
        background: `radial-gradient(circle, hsl(152 72% 45% / 0.08) 0%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Step card component with translations
const StepCard = ({ 
  step, 
  icon: Icon, 
  titleKey,
  itemKeys, 
  delay 
}: { 
  step: number; 
  icon: React.ElementType; 
  titleKey: string;
  itemKeys: string[]; 
  delay: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative perspective-1000"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-swap-green/10 to-transparent rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
      <div className="relative bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 h-full transition-all duration-500 group-hover:border-swap-green/40 group-hover:-translate-y-3 group-hover:shadow-2xl group-hover:shadow-swap-green/10">
        <div className="flex items-center gap-4 mb-6">
          <motion.div 
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-swap-green/20 to-swap-green/5 flex items-center justify-center group-hover:from-swap-green/30 group-hover:to-swap-green/10 transition-all duration-500"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon className="w-7 h-7 text-swap-green" />
          </motion.div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-swap-green/70">Step</span>
            <span className="text-2xl font-bold text-gradient-swap">{step}</span>
          </div>
        </div>
        <h3 className="text-2xl font-semibold mb-5 text-foreground group-hover:text-gradient-swap transition-all duration-300">{t(titleKey)}</h3>
        <ul className="space-y-3">
          {itemKeys.map((itemKey, i) => (
            <motion.li 
              key={i} 
              className="flex items-center gap-3 text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: delay + 0.1 * (i + 1), duration: 0.5 }}
            >
              <motion.div 
                className="w-2 h-2 rounded-full bg-swap-green"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
              {t(itemKey)}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// Use case card component
const UseCaseCard = ({ 
  icon: Icon, 
  titleKey, 
  descKey, 
  delay,
  accentColor = "green"
}: { 
  icon: React.ElementType; 
  titleKey: string; 
  descKey: string; 
  delay: number;
  accentColor?: "green" | "blue" | "gold";
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();
  
  // All accent colors map to green for consistency
  const colors = {
    green: "from-swap-green/20 to-swap-green/5",
    blue: "from-swap-green/15 to-swap-green/5",
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
          <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-swap-green transition-colors duration-300">{t(titleKey)}</h3>
          <p className="text-muted-foreground leading-relaxed">{t(descKey)}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Stats card with glow effect - now clickable with gallery
const StatCard = ({ 
  value, 
  suffix, 
  labelKey, 
  delay,
  onClick 
}: { 
  value: number; 
  suffix: string; 
  labelKey: string; 
  delay: number;
  onClick?: () => void;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { t } = useLanguage();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-swap-green/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-card/30 backdrop-blur-sm border border-border/20 rounded-3xl p-8 h-full min-h-[180px] flex flex-col items-center justify-center group-hover:border-swap-green/30 transition-all duration-300 group-hover:-translate-y-1">
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
        <p className="text-muted-foreground text-base font-medium text-center">{t(labelKey)}</p>
        <p className="text-xs text-muted-foreground/50 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to see gallery
        </p>
      </div>
    </motion.div>
  );
};

// Dummy images for gallery (using placeholder)
const dummyGalleryImages = {
  users: [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80",
    "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&q=80",
  ],
  cleanups: [
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
    "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80",
  ],
  waste: [
    "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800&q=80",
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
    "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80",
    "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80",
  ],
  partners: [
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80",
  ],
};

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.12], [0, 80]);
  const { t } = useLanguage();
  
  // Gallery modal state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryCategory, setGalleryCategory] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const openGallery = (category: string, images: string[]) => {
    setGalleryCategory(category);
    setGalleryImages(images);
    setGalleryOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Earth Animation Background */}
      <EarthAnimation />
      
      {/* Language Switcher */}
      <LanguageSwitcher />
      
      {/* Help Chatbot */}
      <HelpChatbot />
      
      {/* Cursor glow effect */}
      <CursorGlow />
      
      {/* Animated particles */}
      <AnimatedParticles />
      
      {/* Floating leaves */}
      <FloatingLeaves />

      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <GlowingOrb className="top-1/4 -left-1/4" size="lg" />
          <GlowingOrb className="bottom-1/4 -right-1/4" size="lg" />
          <GlowingOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size="md" />
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
              whileHover={{ scale: 1.05, borderColor: "hsl(152 72% 45% / 0.4)" }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              {t("hero.badge")}
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
              {t("hero.title1")}
            </motion.span>
            <motion.span 
              className="block text-gradient-swap"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              {t("hero.title2")}
            </motion.span>
            <motion.span 
              className="block text-muted-foreground/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {t("hero.title3")}
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/auth">
              <GlowingCTAButton variant="primary">
                <span className="flex items-center gap-2">
                  {t("hero.cta.join")}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </GlowingCTAButton>
            </Link>
            <a href="#how-it-works">
              <GlowingCTAButton variant="outline">
                {t("hero.cta.how")}
              </GlowingCTAButton>
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
              className="w-1.5 h-3 rounded-full bg-swap-green"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section - More subtle background */}
      <section id="how-it-works" className="relative py-32 px-6">
        {/* Very subtle orbs */}
        <GlowingOrb className="-left-60 top-1/2 -translate-y-1/2 opacity-30" size="sm" />
        <GlowingOrb className="-right-60 top-1/3 opacity-30" size="sm" />
        
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
              {t("how.title")} <span className="text-gradient-swap">{t("how.title2")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              {t("how.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <StepCard
              step={1}
              icon={Leaf}
              titleKey="how.step1.title"
              itemKeys={["how.step1.item1", "how.step1.item2", "how.step1.item3"]}
              delay={0}
            />
            <StepCard
              step={2}
              icon={Camera}
              titleKey="how.step2.title"
              itemKeys={["how.step2.item1", "how.step2.item2", "how.step2.item3"]}
              delay={0.2}
            />
            <StepCard
              step={3}
              icon={Gift}
              titleKey="how.step3.title"
              itemKeys={["how.step3.item1", "how.step3.item2", "how.step3.item3"]}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Impact Section - with clickable gallery */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-swap-green/3 via-transparent to-transparent" />
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, hsl(152 72% 35% / 0.03) 0%, transparent 60%)",
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
              {t("impact.title")} <span className="text-gradient-swap">{t("impact.title2")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              {t("impact.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              value={100} 
              suffix="M+" 
              labelKey="impact.users" 
              delay={0} 
              onClick={() => openGallery("Users", dummyGalleryImages.users)}
            />
            <StatCard 
              value={12} 
              suffix="M+" 
              labelKey="impact.cleanups" 
              delay={0.1}
              onClick={() => openGallery("Cleanups", dummyGalleryImages.cleanups)}
            />
            <StatCard 
              value={4} 
              suffix="M+ kg" 
              labelKey="impact.waste" 
              delay={0.2}
              onClick={() => openGallery("Waste Collected", dummyGalleryImages.waste)}
            />
            <StatCard 
              value={25} 
              suffix="K+" 
              labelKey="impact.partners" 
              delay={0.3}
              onClick={() => openGallery("Partners", dummyGalleryImages.partners)}
            />
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-32 px-6">
        <GlowingOrb className="-right-60 top-1/4 opacity-30" size="sm" />
        
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
              {t("usecases.title")} <span className="text-gradient-swap">{t("usecases.title2")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              {t("usecases.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <UseCaseCard
              icon={MapPin}
              titleKey="usecases.travelers.title"
              descKey="usecases.travelers.desc"
              delay={0}
              accentColor="green"
            />
            <UseCaseCard
              icon={Users}
              titleKey="usecases.locals.title"
              descKey="usecases.locals.desc"
              delay={0.15}
              accentColor="green"
            />
            <UseCaseCard
              icon={Store}
              titleKey="usecases.business.title"
              descKey="usecases.business.desc"
              delay={0.3}
              accentColor="gold"
            />
          </div>
        </div>
      </section>

      {/* Deep Dive Reading Section */}
      <DeepDiveSection />

      {/* Philosophy Section with Domino Animation */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-swap-green/2 to-transparent" />
        
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
              <span className="text-muted-foreground/80">{t("philosophy.line1")}</span>
              <br />
              <motion.span 
                className="text-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                {t("philosophy.line2")}
              </motion.span>
              <br />
              <motion.span 
                className="text-gradient-swap font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 1 }}
              >
                {t("philosophy.line3")}
              </motion.span>
            </motion.p>
            
            {/* Domino Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-12"
            >
              <DominoAnimation />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-swap-green/5 via-transparent to-transparent" />
        <GlowingOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40" size="lg" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              {t("cta.title1")}
              <br />
              <span className="text-gradient-swap">{t("cta.title2")}</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
              <Link to="/auth">
                <GlowingCTAButton variant="primary">
                  <span className="flex items-center gap-2">
                    {t("cta.join")}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </GlowingCTAButton>
              </Link>
              <Link to="/auth">
                <GlowingCTAButton variant="outline">
                  {t("cta.create")}
                </GlowingCTAButton>
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
              <SwapLogo size="lg" />
              <div>
                <span className="font-bold text-xl">SWAP</span>
                <p className="text-sm text-muted-foreground">A product by Earth Swap</p>
              </div>
            </div>
            
            <nav className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <a href="#how-it-works" className="hover:text-foreground transition-colors">{t("footer.howItWorks")}</a>
              <Link to="/rewards" className="hover:text-foreground transition-colors">{t("footer.rewards")}</Link>
              <Link to="/auth" className="hover:text-foreground transition-colors">{t("footer.signIn")}</Link>
            </nav>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Earth Swap. {t("footer.rights")}
            </p>
          </div>
        </div>
      </footer>
      
      {/* Impact Gallery Modal */}
      <ImpactGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        category={galleryCategory}
        images={galleryImages}
      />
    </div>
  );
};

export default Landing;
