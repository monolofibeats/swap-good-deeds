import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "de";

interface Translations {
  [key: string]: {
    en: string;
    de: string;
  };
}

const translations: Translations = {
  // Hero Section
  "hero.badge": {
    en: "Now available worldwide",
    de: "Jetzt weltweit verfügbar",
  },
  "hero.title1": {
    en: "Do good.",
    de: "Tu Gutes.",
  },
  "hero.title2": {
    en: "Get back.",
    de: "Erhalte zurück.",
  },
  "hero.title3": {
    en: "Change the planet.",
    de: "Verändere den Planeten.",
  },
  "hero.subtitle": {
    en: "SWAP is a global platform where people help the planet and each other — and get rewarded by local businesses.",
    de: "SWAP ist eine globale Plattform, auf der Menschen dem Planeten und einander helfen — und von lokalen Unternehmen belohnt werden.",
  },
  "hero.cta.join": {
    en: "Join SWAP",
    de: "SWAP beitreten",
  },
  "hero.cta.how": {
    en: "See how it works",
    de: "So funktioniert's",
  },
  
  // How It Works Section
  "how.title": {
    en: "How SWAP",
    de: "So funktioniert",
  },
  "how.title2": {
    en: "works",
    de: "SWAP",
  },
  "how.subtitle": {
    en: "Three simple steps to make an impact and earn rewards.",
    de: "Drei einfache Schritte, um etwas zu bewirken und Belohnungen zu verdienen.",
  },
  "how.step1.title": {
    en: "Do something good",
    de: "Tu etwas Gutes",
  },
  "how.step1.item1": {
    en: "Clean a beach",
    de: "Säubere einen Strand",
  },
  "how.step1.item2": {
    en: "Help a local business",
    de: "Hilf einem lokalen Unternehmen",
  },
  "how.step1.item3": {
    en: "Support your community",
    de: "Unterstütze deine Gemeinde",
  },
  "how.step2.title": {
    en: "Get verified",
    de: "Lass dich verifizieren",
  },
  "how.step2.item1": {
    en: "Upload proof",
    de: "Lade einen Nachweis hoch",
  },
  "how.step2.item2": {
    en: "Reviewed by humans, not bots",
    de: "Von Menschen geprüft, nicht von Bots",
  },
  "how.step2.item3": {
    en: "Earn trust over time",
    de: "Baue Vertrauen auf",
  },
  "how.step3.title": {
    en: "Get rewarded",
    de: "Werde belohnt",
  },
  "how.step3.item1": {
    en: "Earn SWAP Points",
    de: "Verdiene SWAP-Punkte",
  },
  "how.step3.item2": {
    en: "Redeem food, showers, beds",
    de: "Löse Essen, Duschen, Betten ein",
  },
  "how.step3.item3": {
    en: "Unlock local discounts",
    de: "Schalte lokale Rabatte frei",
  },
  
  // Impact Section
  "impact.title": {
    en: "Our",
    de: "Unser",
  },
  "impact.title2": {
    en: "impact",
    de: "Impact",
  },
  "impact.subtitle": {
    en: "Numbers that speak louder than words.",
    de: "Zahlen, die mehr sagen als Worte.",
  },
  "impact.users": {
    en: "Users by 2030",
    de: "Nutzer bis 2030",
  },
  "impact.cleanups": {
    en: "Cleanup actions",
    de: "Aufräumaktionen",
  },
  "impact.waste": {
    en: "Waste removed",
    de: "Müll entfernt",
  },
  "impact.partners": {
    en: "Local partners",
    de: "Lokale Partner",
  },
  
  // Use Cases Section
  "usecases.title": {
    en: "Built for",
    de: "Gemacht für",
  },
  "usecases.title2": {
    en: "everyone",
    de: "alle",
  },
  "usecases.subtitle": {
    en: "Whether you're traveling, local, or running a business.",
    de: "Ob du reist, vor Ort bist oder ein Unternehmen führst.",
  },
  "usecases.travelers.title": {
    en: "For Travelers & Campers",
    de: "Für Reisende & Camper",
  },
  "usecases.travelers.desc": {
    en: "Do good wherever you are. Get food, showers, or a place to stay in exchange for helping local communities.",
    de: "Tu Gutes, wo immer du bist. Erhalte Essen, Duschen oder eine Unterkunft im Austausch für Hilfe in lokalen Gemeinden.",
  },
  "usecases.locals.title": {
    en: "For Locals",
    de: "Für Einheimische",
  },
  "usecases.locals.desc": {
    en: "Improve your city and get rewarded. Turn your neighborhood cleanup into real value.",
    de: "Verbessere deine Stadt und werde belohnt. Verwandle deine Nachbarschafts-Aufräumaktion in echten Wert.",
  },
  "usecases.business.title": {
    en: "For Businesses",
    de: "Für Unternehmen",
  },
  "usecases.business.desc": {
    en: "Support your community and attract conscious customers. Become a SWAP partner.",
    de: "Unterstütze deine Gemeinde und gewinne bewusste Kunden. Werde SWAP-Partner.",
  },
  
  // Philosophy Section
  "philosophy.line1": {
    en: "SWAP is not about saving the world alone.",
    de: "Bei SWAP geht es nicht darum, die Welt allein zu retten.",
  },
  "philosophy.line2": {
    en: "It's about millions of small actions —",
    de: "Es geht um Millionen kleiner Aktionen —",
  },
  "philosophy.line3": {
    en: "finally adding up.",
    de: "die sich endlich summieren.",
  },
  
  // Final CTA Section
  "cta.title1": {
    en: "The planet needs action.",
    de: "Der Planet braucht Taten.",
  },
  "cta.title2": {
    en: "SWAP makes it easy.",
    de: "SWAP macht es einfach.",
  },
  "cta.join": {
    en: "Join the movement",
    de: "Werde Teil der Bewegung",
  },
  "cta.create": {
    en: "Create your first quest",
    de: "Erstelle deine erste Quest",
  },
  
  // Footer
  "footer.howItWorks": {
    en: "How it works",
    de: "So funktioniert's",
  },
  "footer.rewards": {
    en: "Rewards",
    de: "Belohnungen",
  },
  "footer.signIn": {
    en: "Sign In",
    de: "Anmelden",
  },
  "footer.rights": {
    en: "All rights reserved.",
    de: "Alle Rechte vorbehalten.",
  },
  
  // Chatbot
  "chat.title": {
    en: "SWAP Help",
    de: "SWAP Hilfe",
  },
  "chat.placeholder": {
    en: "Ask a question about SWAP...",
    de: "Stelle eine Frage zu SWAP...",
  },
  "chat.welcome": {
    en: "Hi! I'm the SWAP assistant. How can I help you today?",
    de: "Hallo! Ich bin der SWAP-Assistent. Wie kann ich dir heute helfen?",
  },
  
  // Small actions counter
  "particles.counter": {
    en: "small actions",
    de: "kleine Aktionen",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("swap-language");
    return (saved as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("swap-language", lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
