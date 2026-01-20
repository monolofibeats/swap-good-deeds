import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="fixed top-6 right-6 z-50"
    >
      <div className="flex items-center gap-2 bg-card/60 backdrop-blur-xl border border-border/50 rounded-full px-4 py-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-1">
          <button
            onClick={() => setLanguage("en")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
              language === "en"
                ? "bg-swap-green text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("de")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
              language === "de"
                ? "bg-swap-green text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            DE
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LanguageSwitcher;
