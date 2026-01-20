import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Leaf, Camera, Gift, MapPin, Store, Users, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Animated counter component
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
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// Floating particles background
const ParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-swap-green/20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Step card component
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
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-swap-green/10 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 h-full transition-all duration-500 group-hover:border-swap-green/30 group-hover:-translate-y-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-swap-green/10 flex items-center justify-center group-hover:bg-swap-green/20 transition-colors duration-300">
            <Icon className="w-6 h-6 text-swap-green" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Step {step}</span>
        </div>
        <h3 className="text-2xl font-semibold mb-4 text-foreground">{title}</h3>
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-swap-green/60" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// Use case card component
const UseCaseCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  delay: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div className="relative bg-card/30 backdrop-blur-md border border-border/30 rounded-3xl p-8 h-full overflow-hidden transition-all duration-500 group-hover:border-swap-green/40 group-hover:bg-card/50">
        <div className="absolute inset-0 bg-gradient-to-br from-swap-green/5 via-transparent to-swap-earth/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-swap-green/20 to-swap-earth/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-7 h-7 text-swap-green" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 50]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background gradients */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(145 60% 25% / 0.15) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(35 55% 30% / 0.1) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, -40, 0],
              y: [0, -40, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <ParticleField />

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-swap-green/10 border border-swap-green/20 text-swap-green text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Now available worldwide
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            <span className="block">Do good.</span>
            <span className="block text-gradient-swap">Get back.</span>
            <span className="block text-muted-foreground/80">Change the planet.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            SWAP is a global platform where people help the planet and each other —
            and get rewarded by local businesses.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/auth">
              <Button 
                size="lg" 
                className="group relative px-8 py-6 text-lg font-semibold bg-swap-green hover:bg-swap-green-light text-background transition-all duration-300 hover:scale-105 glow-green"
              >
                Join SWAP
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-lg font-semibold border-border/50 hover:border-swap-green/50 hover:bg-swap-green/5 transition-all duration-300"
              >
                See how it works
              </Button>
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              How SWAP <span className="text-gradient-swap">works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Three simple steps to make an impact and earn rewards.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
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
              delay={0.15}
            />
            <StepCard
              step={3}
              icon={Gift}
              title="Get rewarded"
              items={["Earn SWAP Points", "Redeem food, showers, beds", "Unlock local discounts"]}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-swap-green/5 via-transparent to-transparent" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Our <span className="text-gradient-swap">impact</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Numbers that speak louder than words.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 100, suffix: "M+", label: "Users by 2030", delay: 0 },
              { value: 12, suffix: "M+", label: "Cleanup actions", delay: 0.1 },
              { value: 4.8, suffix: "M kg", label: "Waste removed", delay: 0.2 },
              { value: 25000, suffix: "+", label: "Local partners", delay: 0.3 },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: stat.delay, ease: [0.16, 1, 0.3, 1] }}
                className="text-center group"
              >
                <div className="text-5xl sm:text-6xl font-bold text-gradient-swap mb-3 group-hover:scale-105 transition-transform duration-300">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-muted-foreground text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
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
            />
            <UseCaseCard
              icon={Users}
              title="For Locals"
              description="Improve your city and get rewarded. Turn your neighborhood cleanup into real value."
              delay={0.15}
            />
            <UseCaseCard
              icon={Store}
              title="For Businesses"
              description="Support your community and attract conscious customers. Become a SWAP partner."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative py-32 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-3xl sm:text-4xl md:text-5xl font-light leading-relaxed text-muted-foreground/90">
              SWAP is not about saving the world alone.
              <br />
              <span className="text-foreground">It's about millions of small actions —</span>
              <br />
              <span className="text-gradient-swap font-medium">finally adding up.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-swap-green/10 via-transparent to-transparent" />
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, hsl(145 60% 25% / 0.08) 0%, transparent 70%)",
          }}
        />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 leading-tight">
              The planet needs action.
              <br />
              <span className="text-gradient-swap">SWAP makes it easy.</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="group px-8 py-6 text-lg font-semibold bg-swap-green hover:bg-swap-green-light text-background transition-all duration-300 hover:scale-105 glow-green"
                >
                  Join the movement
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold border-border/50 hover:border-swap-green/50 hover:bg-swap-green/5 transition-all duration-300"
                >
                  Create your first quest
                </Button>
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
              <div className="w-10 h-10 rounded-xl bg-swap-green/10 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-swap-green" />
              </div>
              <span className="text-xl font-semibold">SWAP</span>
            </div>
            
            <nav className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
              <Link to="/auth" className="hover:text-foreground transition-colors">Rewards</Link>
              <Link to="/auth" className="hover:text-foreground transition-colors">Admin</Link>
              <a href="#" className="hover:text-foreground transition-colors">Legal</a>
            </nav>
            
            <p className="text-sm text-muted-foreground">
              A product by <span className="text-foreground">Earth Swap</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
