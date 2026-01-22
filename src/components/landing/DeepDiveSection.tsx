import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, ChevronRight, Leaf, Droplets, TreePine, Recycle, Globe, Wind, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

interface Article {
  id: string;
  icon: React.ElementType;
  quoteKey: string;
  titleKey: string;
  contentKey: string;
  color: string;
  readTime: number; // minutes
}

const articles: Article[] = [
  {
    id: "trees",
    icon: TreePine,
    quoteKey: "deepdive.trees.quote",
    titleKey: "deepdive.trees.title",
    contentKey: "deepdive.trees.content",
    color: "swap-green",
    readTime: 3,
  },
  {
    id: "ocean",
    icon: Droplets,
    quoteKey: "deepdive.ocean.quote",
    titleKey: "deepdive.ocean.title",
    contentKey: "deepdive.ocean.content",
    color: "swap-sky",
    readTime: 4,
  },
  {
    id: "circular",
    icon: Recycle,
    quoteKey: "deepdive.circular.quote",
    titleKey: "deepdive.circular.title",
    contentKey: "deepdive.circular.content",
    color: "swap-gold",
    readTime: 3,
  },
  {
    id: "local",
    icon: Globe,
    quoteKey: "deepdive.local.quote",
    titleKey: "deepdive.local.title",
    contentKey: "deepdive.local.content",
    color: "swap-green",
    readTime: 2,
  },
  {
    id: "climate",
    icon: Wind,
    quoteKey: "deepdive.climate.quote",
    titleKey: "deepdive.climate.title",
    contentKey: "deepdive.climate.content",
    color: "swap-sky",
    readTime: 4,
  },
  {
    id: "biodiversity",
    icon: Leaf,
    quoteKey: "deepdive.biodiversity.quote",
    titleKey: "deepdive.biodiversity.title",
    contentKey: "deepdive.biodiversity.content",
    color: "swap-green",
    readTime: 3,
  },
];

const DeepDiveSection = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Track reading progress
  useEffect(() => {
    if (!selectedArticle) {
      setReadProgress(0);
      return;
    }

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight - target.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setReadProgress(Math.min(100, progress));
    };

    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [selectedArticle]);

  return (
    <>
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-swap-green/3 to-transparent" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-swap-green/10 border border-swap-green/20 mb-6"
            >
              <BookOpen className="w-8 h-8 text-swap-green" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t("deepdive.title")} <span className="text-gradient-swap">{t("deepdive.title2")}</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              {t("deepdive.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => {
              const Icon = article.icon;
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="relative bg-card/40 backdrop-blur-sm border border-border/30 rounded-2xl p-6 h-full transition-all duration-500 group-hover:border-swap-green/50 group-hover:bg-card/60 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-swap-green/5 overflow-hidden">
                    {/* Decorative book spine */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${article.color}/50 rounded-l-2xl`} />
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-${article.color}/10 border border-${article.color}/20 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 text-${article.color}`} />
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-swap-green group-hover:translate-x-1 transition-all ml-auto mt-3" />
                    </div>
                    
                    <p className="text-lg font-medium text-foreground/90 leading-relaxed italic">
                      "{t(article.quoteKey)}"
                    </p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground group-hover:text-swap-green transition-colors">
                        {t("deepdive.readmore")} →
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime} min</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Easter egg hint */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.5 }}
            className="text-center text-xs text-muted-foreground/30 mt-12"
          >
            {t("deepdive.easteregg")}
          </motion.p>
        </div>
      </section>

      {/* Article Modal with Reading Progress */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-card border border-border/50 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Reading Progress Bar */}
              <div className="absolute top-0 left-0 right-0 z-10">
                <Progress value={readProgress} className="h-1 rounded-none bg-border/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between p-6 pt-7 border-b border-border/30 bg-card/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${selectedArticle.color}/10 border border-${selectedArticle.color}/20 flex items-center justify-center`}>
                    <selectedArticle.icon className={`w-6 h-6 text-${selectedArticle.color}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{t(selectedArticle.titleKey)}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{selectedArticle.readTime} min read</span>
                      </div>
                      <span className="text-xs text-muted-foreground/50">•</span>
                      <span className="text-xs text-swap-green">{Math.round(readProgress)}% complete</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedArticle(null)}
                  className="rounded-full hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea ref={scrollRef} className="h-[calc(85vh-120px)]">
                <div className="p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="prose prose-invert prose-lg max-w-none"
                  >
                    <p className="text-xl text-muted-foreground italic mb-8 border-l-4 border-swap-green/30 pl-6">
                      "{t(selectedArticle.quoteKey)}"
                    </p>
                    
                    <div className="text-foreground/90 leading-relaxed space-y-6 whitespace-pre-line">
                      {t(selectedArticle.contentKey)}
                    </div>
                  </motion.div>
                </div>
              </ScrollArea>

              {/* Completion celebration */}
              <AnimatePresence>
                {readProgress >= 95 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-swap-green/20 border border-swap-green/40 rounded-full"
                  >
                    <Leaf className="w-4 h-4 text-swap-green" />
                    <span className="text-sm font-medium text-swap-green">Article complete!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DeepDiveSection;
