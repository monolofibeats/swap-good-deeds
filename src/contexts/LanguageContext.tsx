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
  
  // Deep Dive Section
  "deepdive.title": {
    en: "Deep",
    de: "Tiefe",
  },
  "deepdive.title2": {
    en: "Dive",
    de: "Einblicke",
  },
  "deepdive.subtitle": {
    en: "For those who want to understand the bigger picture.",
    de: "Für alle, die das große Ganze verstehen wollen.",
  },
  "deepdive.readmore": {
    en: "Read full article",
    de: "Vollständigen Artikel lesen",
  },
  "deepdive.easteregg": {
    en: "💚 You found the knowledge section. There's more hidden on this page...",
    de: "💚 Du hast den Wissensbereich gefunden. Es gibt noch mehr auf dieser Seite...",
  },
  
  // Trees Article
  "deepdive.trees.quote": {
    en: "Planting trees isn't the problem. Maintaining them is.",
    de: "Bäume pflanzen ist nicht das Problem. Sie zu pflegen schon.",
  },
  "deepdive.trees.title": {
    en: "The Truth About Tree Planting",
    de: "Die Wahrheit über Baumpflanzungen",
  },
  "deepdive.trees.content": {
    en: `Every year, billions of trees are planted across the globe as part of well-intentioned reforestation efforts. Politicians pose for photos, corporations celebrate their carbon neutrality pledges, and environmental organizations trumpet their planting milestones. But here's the uncomfortable truth that rarely makes headlines: up to 80% of planted trees die within the first two years.

The problem isn't the planting—it's what happens after. Trees are living organisms that require years of care before they can survive independently. They need protection from grazing animals, competition from weeds, adequate water during droughts, and monitoring for disease. Without this ongoing stewardship, even the most ambitious planting programs become expensive exercises in futility.

This is where SWAP's approach differs fundamentally. Rather than focusing on one-time planting events, we reward ongoing environmental stewardship. When you nurture a community garden, maintain a green space, or protect existing forests from degradation, you're doing the work that actually matters for long-term environmental health.

The most effective carbon capture doesn't come from newly planted saplings—it comes from mature forests that have developed complex ecosystems over decades. Protecting what we already have is often more valuable than starting from scratch.

Consider this: a single mature tree can absorb up to 48 pounds of CO2 per year and provide habitat for hundreds of species. It takes 20-30 years for a planted sapling to reach that level of impact—assuming it survives that long.

The lesson? Real environmental impact requires sustained commitment, not just viral moments. SWAP is built on this principle: rewarding the consistent, often unglamorous work that actually makes a difference.`,
    de: `Jedes Jahr werden weltweit Milliarden von Bäumen als Teil gut gemeinter Aufforstungsbemühungen gepflanzt. Politiker posieren für Fotos, Unternehmen feiern ihre CO2-Neutralitätsversprechen, und Umweltorganisationen verkünden ihre Pflanzmeilensteine. Aber hier ist die unbequeme Wahrheit, die selten Schlagzeilen macht: Bis zu 80% der gepflanzten Bäume sterben innerhalb der ersten zwei Jahre.

Das Problem ist nicht das Pflanzen—es ist das, was danach passiert. Bäume sind lebende Organismen, die jahrelange Pflege benötigen, bevor sie selbstständig überleben können. Sie brauchen Schutz vor Weidetieren, Bekämpfung von Unkraut, ausreichend Wasser während Dürreperioden und Überwachung auf Krankheiten. Ohne diese kontinuierliche Betreuung werden selbst die ambitioniertesten Pflanzprogramme zu teuren Übungen in Vergeblichkeit.

Hier unterscheidet sich SWAPs Ansatz grundlegend. Anstatt uns auf einmalige Pflanzaktionen zu konzentrieren, belohnen wir fortlaufende Umweltpflege. Wenn du einen Gemeinschaftsgarten pflegst, eine Grünfläche erhältst oder bestehende Wälder vor Degradation schützt, machst du die Arbeit, die wirklich für die langfristige Umweltgesundheit zählt.

Die effektivste CO2-Bindung kommt nicht von neu gepflanzten Setzlingen—sie kommt von reifen Wäldern, die über Jahrzehnte komplexe Ökosysteme entwickelt haben. Was wir bereits haben zu schützen, ist oft wertvoller als von vorne anzufangen.

Bedenke: Ein einzelner ausgewachsener Baum kann bis zu 22 kg CO2 pro Jahr aufnehmen und Lebensraum für Hunderte von Arten bieten. Es dauert 20-30 Jahre, bis ein gepflanzter Setzling dieses Wirkungsniveau erreicht—vorausgesetzt, er überlebt so lange.

Die Lektion? Echter Umwelteinfluss erfordert anhaltendes Engagement, nicht nur virale Momente. SWAP basiert auf diesem Prinzip: die konsequente, oft unspektakuläre Arbeit zu belohnen, die tatsächlich einen Unterschied macht.`,
  },
  
  // Ocean Article
  "deepdive.ocean.quote": {
    en: "8 million tons of plastic enter our oceans every year. That's one garbage truck per minute.",
    de: "8 Millionen Tonnen Plastik gelangen jährlich in unsere Ozeane. Das ist ein Müllwagen pro Minute.",
  },
  "deepdive.ocean.title": {
    en: "The Ocean Plastic Crisis",
    de: "Die Ozean-Plastikkrise",
  },
  "deepdive.ocean.content": {
    en: `Our oceans are drowning in plastic. Every minute, the equivalent of a garbage truck full of plastic enters our marine environments. By 2050, scientists predict there will be more plastic in the ocean than fish by weight. This isn't a distant problem—it's happening right now, with devastating consequences for marine life, human health, and the global climate.

The plastic you see floating on the surface is just the tip of the iceberg. The majority of ocean plastic sinks to the seabed or breaks down into microplastics—tiny particles less than 5mm in diameter that infiltrate every level of the marine food chain. These microplastics have been found in the deepest ocean trenches, in Arctic ice, and yes, in our own bloodstreams.

Marine animals mistake plastic for food. Sea turtles eat plastic bags thinking they're jellyfish. Seabirds feed bottle caps to their chicks. Whales wash up on beaches with stomachs full of plastic waste. The images are heartbreaking, but they represent just a fraction of the ongoing catastrophe.

What can we actually do? The answer starts at the source. Every beach cleanup, every piece of litter picked up before it reaches the water, every conscious choice to reduce plastic consumption—these actions matter. They matter because prevention is infinitely more effective than cleanup.

SWAP's approach recognizes this reality. We reward coastal and waterway cleanups not as feel-good activities, but as frontline environmental defense. When you prevent plastic from entering the ocean, you're protecting ecosystems that regulate our climate, provide food security for billions, and support untold biodiversity.

The ocean covers 71% of our planet and produces over 50% of the world's oxygen. Its health is our health. Every action you take to protect it ripples outward in ways we're only beginning to understand.`,
    de: `Unsere Ozeane ertrinken in Plastik. Jede Minute gelangt das Äquivalent eines vollen Müllwagens an Plastik in unsere Meeresumwelt. Bis 2050 prognostizieren Wissenschaftler, dass es gewichtsmäßig mehr Plastik im Ozean geben wird als Fische. Dies ist kein fernes Problem—es passiert gerade jetzt, mit verheerenden Folgen für das Meeresleben, die menschliche Gesundheit und das globale Klima.

Das Plastik, das du an der Oberfläche schwimmen siehst, ist nur die Spitze des Eisbergs. Der Großteil des Ozeanplastiks sinkt auf den Meeresboden oder zerfällt zu Mikroplastik—winzige Partikel mit weniger als 5mm Durchmesser, die jede Ebene der marinen Nahrungskette infiltrieren. Dieses Mikroplastik wurde in den tiefsten Meeresgräben gefunden, im arktischen Eis und ja, auch in unserem eigenen Blutkreislauf.

Meerestiere verwechseln Plastik mit Nahrung. Meeresschildkröten fressen Plastiktüten in dem Glauben, es seien Quallen. Seevögel füttern ihre Küken mit Flaschenverschlüssen. Wale werden an Stränden angespült mit Mägen voller Plastikmüll. Die Bilder sind herzzerreißend, aber sie repräsentieren nur einen Bruchteil der andauernden Katastrophe.

Was können wir tatsächlich tun? Die Antwort beginnt an der Quelle. Jede Strandreinigung, jedes Stück Müll, das aufgesammelt wird, bevor es das Wasser erreicht, jede bewusste Entscheidung, Plastikkonsum zu reduzieren—diese Handlungen zählen. Sie zählen, weil Prävention unendlich wirksamer ist als Aufräumen.

SWAPs Ansatz erkennt diese Realität an. Wir belohnen Küsten- und Gewässerreinigungen nicht als Wohlfühlaktivitäten, sondern als Umweltverteidigung an vorderster Front. Wenn du verhinderst, dass Plastik in den Ozean gelangt, schützt du Ökosysteme, die unser Klima regulieren, Nahrungssicherheit für Milliarden bieten und unzählige Biodiversität unterstützen.

Der Ozean bedeckt 71% unseres Planeten und produziert über 50% des weltweiten Sauerstoffs. Seine Gesundheit ist unsere Gesundheit. Jede Aktion, die du zu seinem Schutz unternimmst, breitet sich in Weisen aus, die wir erst zu verstehen beginnen.`,
  },
  
  // Circular Economy Article
  "deepdive.circular.quote": {
    en: "We don't have a waste problem. We have a design problem.",
    de: "Wir haben kein Müllproblem. Wir haben ein Designproblem.",
  },
  "deepdive.circular.title": {
    en: "The Circular Economy Revolution",
    de: "Die Revolution der Kreislaufwirtschaft",
  },
  "deepdive.circular.content": {
    en: `For centuries, our economy has operated on a linear model: take resources, make products, throw them away. This "take-make-dispose" approach worked when human populations were small and natural resources seemed infinite. Those days are over.

Today, we extract 100 billion tons of natural resources annually—triple the amount in 1970. We generate 2 billion tons of waste each year, a number projected to rise 70% by 2050. The linear economy isn't just unsustainable; it's actively destroying the foundations of our prosperity.

Enter the circular economy: a systemic shift that designs waste out of the system entirely. In a circular model, products are created to be reused, repaired, refurbished, and ultimately recycled into new products. Nothing is truly "thrown away" because there is no "away."

The principles are elegantly simple:
• Design out waste and pollution from the start
• Keep products and materials in use as long as possible
• Regenerate natural systems rather than depleting them

Leading companies are already proving this works. Patagonia repairs over 100,000 garments yearly through their Worn Wear program. Interface has transformed from carpet manufacturer to carbon-negative company. Apple recovers millions of dollars worth of gold from recycled iPhones each year.

But the circular economy isn't just for corporations. Every person who repairs instead of replaces, who chooses products designed for longevity, who participates in sharing economies—they're part of this revolution.

SWAP amplifies this impact by connecting circular behaviors to tangible rewards. When you help others repair items, participate in swap meets, or contribute to community resource sharing, you're building the infrastructure of a new economy—one that works for both people and planet.

The transition won't happen overnight. But every circular action you take is a vote for the future we want to create.`,
    de: `Jahrhundertelang funktionierte unsere Wirtschaft nach einem linearen Modell: Ressourcen entnehmen, Produkte herstellen, wegwerfen. Dieser "Nehmen-Machen-Entsorgen"-Ansatz funktionierte, als die menschliche Bevölkerung klein war und natürliche Ressourcen unendlich schienen. Diese Zeiten sind vorbei.

Heute fördern wir jährlich 100 Milliarden Tonnen natürlicher Ressourcen—das Dreifache von 1970. Wir erzeugen jährlich 2 Milliarden Tonnen Abfall, eine Zahl, die bis 2050 voraussichtlich um 70% steigen wird. Die lineare Wirtschaft ist nicht nur nicht nachhaltig; sie zerstört aktiv die Grundlagen unseres Wohlstands.

Die Kreislaufwirtschaft betritt die Bühne: ein systemischer Wandel, der Abfall komplett aus dem System eliminiert. In einem zirkulären Modell werden Produkte so geschaffen, dass sie wiederverwendet, repariert, aufgearbeitet und schließlich zu neuen Produkten recycelt werden können. Nichts wird wirklich "weggeworfen", weil es kein "weg" gibt.

Die Prinzipien sind elegant einfach:
• Abfall und Verschmutzung von Anfang an eliminieren
• Produkte und Materialien so lange wie möglich in Gebrauch halten
• Natürliche Systeme regenerieren statt sie zu erschöpfen

Führende Unternehmen beweisen bereits, dass dies funktioniert. Patagonia repariert über 100.000 Kleidungsstücke jährlich durch ihr Worn Wear Programm. Interface hat sich vom Teppichhersteller zum CO2-negativen Unternehmen gewandelt. Apple gewinnt jährlich Gold im Wert von Millionen Dollar aus recycelten iPhones.

Aber die Kreislaufwirtschaft ist nicht nur für Konzerne. Jeder Mensch, der repariert statt ersetzt, der Produkte wählt, die für Langlebigkeit konzipiert sind, der an Sharing-Economies teilnimmt—sie alle sind Teil dieser Revolution.

SWAP verstärkt diese Wirkung, indem es zirkuläres Verhalten mit greifbaren Belohnungen verbindet. Wenn du anderen hilfst, Gegenstände zu reparieren, an Tauschbörsen teilnimmst oder zur gemeinschaftlichen Ressourcenteilung beiträgst, baust du die Infrastruktur einer neuen Wirtschaft auf—einer, die sowohl für Menschen als auch für den Planeten funktioniert.

Der Übergang wird nicht über Nacht geschehen. Aber jede zirkuläre Aktion, die du unternimmst, ist eine Stimme für die Zukunft, die wir erschaffen wollen.`,
  },
  
  // Local Impact Article
  "deepdive.local.quote": {
    en: "Think global, act local. But also: act local, impact global.",
    de: "Global denken, lokal handeln. Aber auch: lokal handeln, global wirken.",
  },
  "deepdive.local.title": {
    en: "The Power of Local Action",
    de: "Die Macht lokaler Aktionen",
  },
  "deepdive.local.content": {
    en: `The environmental crisis can feel overwhelming. Climate change, biodiversity loss, pollution—these are global problems that seem to require global solutions. What can one person, in one neighborhood, possibly do?

More than you might think.

Research consistently shows that local actions, when multiplied across communities, create significant collective impact. A single beach cleanup might seem like a drop in the ocean, but thousands of beach cleanups worldwide remove millions of pounds of waste each year. One person choosing to bike instead of drive saves perhaps a ton of CO2 annually—but a neighborhood of cyclists creates infrastructure change that lasts generations.

Local action also has unique advantages that global initiatives can't replicate:

Immediate visibility: You see the results of your work directly. A cleaned park stays clean. A planted garden grows. This feedback loop sustains motivation in ways that abstract carbon calculations never can.

Community building: Environmental action connects people. Neighbors who clean up together watch out for each other. Businesses that support local volunteers gain loyal customers. Communities become more resilient through shared purpose.

Democratic empowerment: Local environmental wins build civic confidence. When you see that collective action can change your street, you start believing it can change your city, your country, your world.

Appropriate scale: Not every problem needs a global solution. Many environmental challenges—water quality, urban heat, local biodiversity—are best addressed at the community level where specific conditions and needs are understood.

SWAP is designed around this philosophy. We don't ask you to solve climate change single-handedly. We ask you to do what you can, where you are, with what you have. We connect those individual actions to a global network of people doing the same thing, proving every day that local action adds up to global impact.

Your community is your laboratory for change. Start there.`,
    de: `Die Umweltkrise kann überwältigend wirken. Klimawandel, Biodiversitätsverlust, Verschmutzung—das sind globale Probleme, die globale Lösungen zu erfordern scheinen. Was kann eine einzelne Person in einer Nachbarschaft schon ausrichten?

Mehr als du vielleicht denkst.

Forschung zeigt konstant, dass lokale Aktionen, multipliziert über Gemeinschaften hinweg, erhebliche kollektive Wirkung erzeugen. Eine einzelne Strandreinigung mag wie ein Tropfen auf dem heißen Stein erscheinen, aber Tausende von Strandreinigungen weltweit entfernen jährlich Millionen Pfund Abfall. Eine Person, die Fahrrad statt Auto fährt, spart vielleicht eine Tonne CO2 jährlich—aber eine Nachbarschaft von Radfahrern schafft Infrastrukturwandel, der Generationen überdauert.

Lokales Handeln hat auch einzigartige Vorteile, die globale Initiativen nicht replizieren können:

Unmittelbare Sichtbarkeit: Du siehst die Ergebnisse deiner Arbeit direkt. Ein gereinigter Park bleibt sauber. Ein gepflanzter Garten wächst. Diese Feedbackschleife erhält die Motivation auf eine Weise, die abstrakte CO2-Berechnungen nie können.

Gemeinschaftsbildung: Umweltaktionen verbinden Menschen. Nachbarn, die gemeinsam aufräumen, achten aufeinander. Unternehmen, die lokale Freiwillige unterstützen, gewinnen treue Kunden. Gemeinschaften werden durch gemeinsamen Zweck widerstandsfähiger.

Demokratische Ermächtigung: Lokale Umwelterfolge bauen bürgerliches Selbstvertrauen auf. Wenn du siehst, dass kollektives Handeln deine Straße verändern kann, beginnst du zu glauben, dass es deine Stadt, dein Land, deine Welt verändern kann.

Angemessener Maßstab: Nicht jedes Problem braucht eine globale Lösung. Viele Umweltherausforderungen—Wasserqualität, städtische Hitze, lokale Biodiversität—werden am besten auf Gemeinschaftsebene angegangen, wo spezifische Bedingungen und Bedürfnisse verstanden werden.

SWAP ist um diese Philosophie herum konzipiert. Wir bitten dich nicht, den Klimawandel im Alleingang zu lösen. Wir bitten dich, zu tun, was du kannst, wo du bist, mit dem, was du hast. Wir verbinden diese individuellen Aktionen mit einem globalen Netzwerk von Menschen, die dasselbe tun, und beweisen jeden Tag, dass lokales Handeln zu globaler Wirkung führt.

Deine Gemeinschaft ist dein Labor für Veränderung. Fang dort an.`,
  },
  
  // Climate Article
  "deepdive.climate.quote": {
    en: "We are the first generation to feel the effects of climate change and the last that can do something about it.",
    de: "Wir sind die erste Generation, die die Auswirkungen des Klimawandels spürt, und die letzte, die etwas dagegen tun kann.",
  },
  "deepdive.climate.title": {
    en: "Climate Action in the Critical Decade",
    de: "Klimaschutz im entscheidenden Jahrzehnt",
  },
  "deepdive.climate.content": {
    en: `The 2020s have been called the "decisive decade" for climate action. Scientists tell us that what happens in these years will determine the trajectory of human civilization for centuries to come. This isn't hyperbole—it's physics.

The Paris Agreement set a goal of limiting warming to 1.5°C above pre-industrial levels. We've already reached 1.1°C, and we're adding roughly 0.2°C per decade. The math is unforgiving: without rapid, transformative change, we will breach the 1.5°C threshold within 10-15 years.

What does this mean in human terms? Each tenth of a degree matters enormously. The difference between 1.5°C and 2°C of warming is:
• 420 million more people exposed to extreme heat waves
• 10 million more people displaced by rising seas
• Twice as many people facing water scarcity
• Coral reefs declining by 70-90% versus virtually complete loss

The challenge is immense, but so is the opportunity. The clean energy transition is accelerating faster than anyone predicted. Solar power is now the cheapest form of electricity in history. Electric vehicle adoption is following the same exponential curve that smartphones once did. Sustainable technologies are becoming not just viable but preferable.

Individual action matters in this equation—not because personal choices alone will solve climate change, but because they shift culture, build demand for sustainable alternatives, and demonstrate the political will for systemic change.

When you reduce your carbon footprint through local environmental action, you're doing more than saving emissions. You're participating in a global demonstration project that proves a better way of living is possible.

SWAP connects these individual acts to collective power. Every point you earn represents carbon prevented or captured. Every reward you redeem comes from businesses choosing sustainability. Every user who joins amplifies the message that people want—and will work for—a livable future.

The window is closing. But it's still open. What you do in this decade matters.`,
    de: `Die 2020er Jahre wurden als das "entscheidende Jahrzehnt" für Klimaschutz bezeichnet. Wissenschaftler sagen uns, dass das, was in diesen Jahren passiert, die Entwicklung der menschlichen Zivilisation für Jahrhunderte bestimmen wird. Das ist keine Übertreibung—es ist Physik.

Das Pariser Abkommen setzte das Ziel, die Erwärmung auf 1,5°C über dem vorindustriellen Niveau zu begrenzen. Wir haben bereits 1,1°C erreicht und fügen etwa 0,2°C pro Jahrzehnt hinzu. Die Mathematik ist unerbittlich: Ohne schnellen, transformativen Wandel werden wir die 1,5°C-Schwelle in 10-15 Jahren überschreiten.

Was bedeutet das in menschlichen Begriffen? Jedes Zehntel Grad zählt enorm. Der Unterschied zwischen 1,5°C und 2°C Erwärmung ist:
• 420 Millionen mehr Menschen extremen Hitzewellen ausgesetzt
• 10 Millionen mehr Menschen durch steigende Meeresspiegel vertrieben
• Doppelt so viele Menschen von Wasserknappheit betroffen
• Korallenriffe um 70-90% zurückgehend versus nahezu vollständiger Verlust

Die Herausforderung ist immens, aber die Chance auch. Die Energiewende beschleunigt sich schneller als irgendjemand vorhergesagt hat. Solarenergie ist jetzt die günstigste Form der Stromerzeugung in der Geschichte. Die Adoption von Elektrofahrzeugen folgt der gleichen exponentiellen Kurve wie einst Smartphones. Nachhaltige Technologien werden nicht nur tragfähig, sondern vorzuziehen.

Individuelles Handeln zählt in dieser Gleichung—nicht weil persönliche Entscheidungen allein den Klimawandel lösen werden, sondern weil sie Kultur verschieben, Nachfrage nach nachhaltigen Alternativen aufbauen und den politischen Willen für systemischen Wandel demonstrieren.

Wenn du deinen CO2-Fußabdruck durch lokale Umweltaktionen reduzierst, tust du mehr als Emissionen einzusparen. Du nimmst an einem globalen Demonstrationsprojekt teil, das beweist, dass eine bessere Lebensweise möglich ist.

SWAP verbindet diese individuellen Taten mit kollektiver Macht. Jeder Punkt, den du verdienst, repräsentiert verhinderte oder eingefangene Emissionen. Jede Belohnung, die du einlöst, kommt von Unternehmen, die Nachhaltigkeit wählen. Jeder Nutzer, der beitritt, verstärkt die Botschaft, dass Menschen eine lebenswerte Zukunft wollen—und dafür arbeiten werden.

Das Fenster schließt sich. Aber es ist noch offen. Was du in diesem Jahrzehnt tust, zählt.`,
  },
  
  // Biodiversity Article
  "deepdive.biodiversity.quote": {
    en: "Every species we lose is a book from the library of life that we can never read again.",
    de: "Jede Art, die wir verlieren, ist ein Buch aus der Bibliothek des Lebens, das wir nie wieder lesen können.",
  },
  "deepdive.biodiversity.title": {
    en: "The Sixth Mass Extinction",
    de: "Das sechste Massenaussterben",
  },
  "deepdive.biodiversity.content": {
    en: `Earth has experienced five mass extinction events in its 4.5-billion-year history. The last one, 66 million years ago, wiped out the dinosaurs. Scientists now believe we are living through the sixth—and this time, we are the asteroid.

Species are disappearing at a rate 100 to 1,000 times faster than the natural background extinction rate. One million animal and plant species are threatened with extinction, many within decades. We're losing species we haven't even discovered yet—the medicine that could cure cancer, the enzyme that could digest plastic, the pollinator that sustains critical food crops.

Biodiversity isn't just about saving charismatic animals—though that matters too. It's about the intricate web of relationships that makes life on Earth possible:

Ecosystem services: Forests purify our water. Wetlands buffer us from floods. Insects pollinate our crops. Microbes make soil fertile. These services are worth trillions of dollars annually, and they have no technological substitute.

Resilience: Diverse ecosystems are more stable. When one species fails, others can fill its role. Monocultures—whether agricultural or natural—are fragile, vulnerable to disease and environmental change.

Medicine: 70% of cancer drugs are inspired by natural compounds. The next breakthrough treatment could be living in a rainforest we haven't yet explored—or one we're currently destroying.

Food security: Wild relatives of crops carry genetic diversity essential for breeding disease-resistant varieties. Without them, our agricultural system becomes increasingly vulnerable.

The good news: we know how to protect biodiversity. Habitat conservation, sustainable land use, reducing pollution, controlling invasive species—these approaches work. And they often work best when implemented by local communities who understand their ecosystems intimately.

SWAP rewards actions that protect local biodiversity: cleaning habitats, removing invasive plants, supporting native species, maintaining corridors that allow wildlife to move and adapt. Every action that preserves a small corner of nature contributes to the great tapestry of life.

We are the generation that will either preside over the sixth extinction or prevent it. There is no neutral option.`,
    de: `Die Erde hat in ihrer 4,5 Milliarden Jahre alten Geschichte fünf Massenaussterben erlebt. Das letzte, vor 66 Millionen Jahren, löschte die Dinosaurier aus. Wissenschaftler glauben nun, dass wir das sechste durchleben—und diesmal sind wir der Asteroid.

Arten verschwinden mit einer Rate, die 100 bis 1.000 Mal schneller ist als die natürliche Hintergrund-Aussterberate. Eine Million Tier- und Pflanzenarten sind vom Aussterben bedroht, viele innerhalb von Jahrzehnten. Wir verlieren Arten, die wir noch nicht einmal entdeckt haben—die Medizin, die Krebs heilen könnte, das Enzym, das Plastik verdauen könnte, der Bestäuber, der kritische Nahrungspflanzen erhält.

Biodiversität geht nicht nur darum, charismatische Tiere zu retten—obwohl das auch wichtig ist. Es geht um das komplexe Beziehungsgeflecht, das Leben auf der Erde möglich macht:

Ökosystemleistungen: Wälder reinigen unser Wasser. Feuchtgebiete schützen uns vor Überschwemmungen. Insekten bestäuben unsere Ernten. Mikroben machen Boden fruchtbar. Diese Leistungen sind jährlich Billionen Dollar wert, und sie haben keinen technologischen Ersatz.

Resilienz: Vielfältige Ökosysteme sind stabiler. Wenn eine Art versagt, können andere ihre Rolle übernehmen. Monokulturen—ob landwirtschaftlich oder natürlich—sind fragil, anfällig für Krankheiten und Umweltveränderungen.

Medizin: 70% der Krebsmedikamente sind von natürlichen Verbindungen inspiriert. Die nächste bahnbrechende Behandlung könnte in einem Regenwald leben, den wir noch nicht erforscht haben—oder einem, den wir gerade zerstören.

Ernährungssicherheit: Wilde Verwandte von Nutzpflanzen tragen genetische Vielfalt, die für die Züchtung krankheitsresistenter Sorten unerlässlich ist. Ohne sie wird unser Agrarsystem zunehmend verwundbar.

Die gute Nachricht: Wir wissen, wie man Biodiversität schützt. Habitatschutz, nachhaltige Landnutzung, Reduzierung von Verschmutzung, Kontrolle invasiver Arten—diese Ansätze funktionieren. Und sie funktionieren oft am besten, wenn sie von lokalen Gemeinschaften umgesetzt werden, die ihre Ökosysteme genau kennen.

SWAP belohnt Aktionen, die lokale Biodiversität schützen: Habitate reinigen, invasive Pflanzen entfernen, einheimische Arten unterstützen, Korridore erhalten, die Wildtieren ermöglichen, sich zu bewegen und anzupassen. Jede Aktion, die eine kleine Ecke der Natur bewahrt, trägt zum großen Wandteppich des Lebens bei.

Wir sind die Generation, die entweder das sechste Aussterben beaufsichtigen oder verhindern wird. Es gibt keine neutrale Option.`,
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
