import React, { createContext, useContext, useState } from "react";

export type LanguageType = "en" | "fr";

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string) => string;
}

const translations: Record<LanguageType, Record<string, string>> = {
  en: {
    // Header & Navigation
    home: "Home",
    destinations: "Destinations",
    customTrip: "Custom Trip",
    tours: "Tours",
    gallery: "Gallery",
    faq: "FAQ",
    team: "Team",
    contact: "Contact",
    myAdventures: "My Adventures",
    signIn: "Sign In",
    signOut: "Sign Out",
    zambiaTravels: "ZAMBIA TRAVELS & SAFARIS",

    // Hero Section
    heroSub: "Zambia's Premier Luxury Safari Operator",
    heroTitle: "CRAFT YOUR ULTIMATE WILDERNESS EXPEDITION",
    bookNow: "Book Now",
    exploreDest: "Explore Destinations",
    searchPlaceholder: "Search by destination, activity or province...",
    allActivities: "All Activities",
    allProvinces: "All Provinces",
    searchBtn: "Search Tours",
    resetBtn: "Reset",

    // Destination List
    destTitle: "Pristine Destinations",
    destSub: "Explore Zambia's most spectacular ecosystems from South Luangwa to Victoria Falls.",
    allDest: "All",
    parks: "National Parks",
    falls: "Waterfalls",
    lakes: "Lakes & Rivers",
    hiddenGems: "Hidden Gems",
    activityLevel: "Activity Level",
    baseCost: "Base Cost",
    customizeBtn: "Customize Plan",
    bookDirect: "Quick Book",

    // Planner Workspace
    plannerTitle: "Interactive Itinerary Workspace",
    plannerSub: "Curate your private safari. Drag or select custom lodges, walking routes, and game drives.",
    selectDestPrompt: "Select a destination to begin building your custom blueprint",
    durationDays: "Duration (Days)",
    guestsCount: "Number of Guests",
    estimatedCost: "Estimated Custom Cost",
    createItineraryBtn: "Deploy Custom Itinerary",
    resetPlanner: "Reset Workspace",

    // Packages Section
    packagesTitle: "Signature Luxury Tour Packages",
    packagesSub: "Settle into award-winning luxury lodges and remote bush camps with all-inclusive transfers.",
    days: "Days",
    pricePerPerson: "Per Person",
    bookPackage: "Book Package",
    heritageLandmarks: "Zambia's Heritage Landmarks",
    traditionalCeremonies: "Major Traditional Ceremonies",
    ceremoniesSub: "Participate in legendary sacred pageants of the royal kingdoms. We facilitate full permits, tribal court hospitality, private flights, and premium spectator seating.",
    bespokePricing: "Bespoke Pricing on Request",
    royalItinerary: "ROYAL ITINERARY INCLUSIONS",
    inquireBespoke: "Inquire Bespoke Ceremony Tour",

    // FAQ Section
    faqTitle: "Traveler FAQ",
    faqSub: "Essential information, health advisories, and payment options for your Zambian expedition.",

    // Team Section
    teamTitle: "Meet the Expert Team",
    teamSub: "Our highly certified wilderness guides, conservation pioneers, and logistics operators.",

    // Contact Section
    contactTitle: "Get In Touch",
    contactSub: "Begin designing your dream luxury itinerary. Our certified expert managers answer within 2 hours.",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    message: "Your Message",
    sendMessage: "Submit Secure Inquiry",

    // General Common
    close: "Close"
  },
  fr: {
    // Header & Navigation
    home: "Accueil",
    destinations: "Destinations",
    customTrip: "Sur Mesure",
    tours: "Circuits",
    gallery: "Galerie",
    faq: "FAQ",
    team: "Équipe",
    contact: "Contact",
    myAdventures: "Mes Aventures",
    signIn: "Connexion",
    signOut: "Déconnexion",
    zambiaTravels: "VOYAGES & SAFARIS EN ZAMBIE",

    // Hero Section
    heroSub: "Premier Opérateur de Safaris de Luxe en Zambie",
    heroTitle: "CRÉEZ VOTRE EXPÉDITION SAUVAGE DE RÊVE",
    bookNow: "Réserver",
    exploreDest: "Explorer les Destinations",
    searchPlaceholder: "Rechercher par destination, activité ou province...",
    allActivities: "Toutes les Activités",
    allProvinces: "Toutes les Provinces",
    searchBtn: "Rechercher",
    resetBtn: "Réinitialiser",

    // Destination List
    destTitle: "Destinations Vierges",
    destSub: "Explorez les écosystèmes les plus spectaculaires de Zambie, de South Luangwa aux Chutes Victoria.",
    allDest: "Tout",
    parks: "Parcs Nationaux",
    falls: "Chutes d'Eau",
    lakes: "Lacs & Rivières",
    hiddenGems: "Joyaux Cachés",
    activityLevel: "Niveau d'Activité",
    baseCost: "Coût de Base",
    customizeBtn: "Personnaliser le Plan",
    bookDirect: "Réservation Rapide",

    // Planner Workspace
    plannerTitle: "Espace de Itinéraire Interactif",
    plannerSub: "Organisez votre safari privé. Glissez ou sélectionnez des lodges, des itinéraires de marche et des safaris.",
    selectDestPrompt: "Sélectionnez une destination pour commencer à concevoir votre plan sur mesure",
    durationDays: "Durée (Jours)",
    guestsCount: "Nombre d'Invités",
    estimatedCost: "Coût Estimé Personnalisé",
    createItineraryBtn: "Déployer l'Itinéraire Sur Mesure",
    resetPlanner: "Réinitialiser l'Espace",

    // Packages Section
    packagesTitle: "Forfaits de Luxe Emblématiques",
    packagesSub: "Installez-vous dans des lodges de luxe primés et des camps de brousse isolés avec transferts tout compris.",
    days: "Jours",
    pricePerPerson: "Par Personne",
    bookPackage: "Réserver le Forfait",
    heritageLandmarks: "Sites du Patrimoine de la Zambie",
    traditionalCeremonies: "Cérémonies Traditionnelles Majeures",
    ceremoniesSub: "Participez aux légendaires défilés sacrés des royaumes royaux. Nous facilitons les permis complets, l'hospitalité de la cour tribale, les vols privés et les places de choix.",
    bespokePricing: "Tarifs Sur Mesure (Sur Demande)",
    royalItinerary: "INCLUSIONS DE L'ITINÉRAIRE ROYAL",
    inquireBespoke: "Demander un Devis Célébration",

    // FAQ Section
    faqTitle: "FAQ des Voyageurs",
    faqSub: "Informations essentielles, conseils de santé et options de paiement pour votre expédition en Zambie.",

    // Team Section
    teamTitle: "Rencontrez l'Équipe d'Experts",
    teamSub: "Nos guides de brousse hautement certifiés, pionniers de la conservation et opérateurs logistiques.",

    // Contact Section
    contactTitle: "Contactez-nous",
    contactSub: "Commencez à concevoir l'itinéraire de luxe de vos rêves. Nos gestionnaires experts certifiés répondent sous 2 heures.",
    fullName: "Nom Complet",
    emailAddress: "Adresse E-mail",
    phoneNumber: "Numéro de Téléphone",
    message: "Votre Message",
    sendMessage: "Soumettre l'Enquête Sécurisée",

    // General Common
    close: "Fermer"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    try {
      const saved = localStorage.getItem("dreamscape_language");
      return (saved as LanguageType) || "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("dreamscape_language", lang);
    } catch (e) {
      console.warn("localStorage is not writeable", e);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
