import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Booking, Destination, Review, TourPackage } from "./types";
import { DESTINATIONS, TOUR_PACKAGES, FAQS, MOCK_REVIEWS } from "./data/travelData";
import { PLAYLISTS } from "./data/playlists";
import Header from "./components/Header";
import Hero from "./components/Hero";
import DestinationList from "./components/DestinationList";
import InteractiveItineraryBuilder from "./components/InteractiveItineraryBuilder";
import ReviewSection from "./components/ReviewSection";
import FAQSection from "./components/FAQSection";
import TeamSection from "./components/TeamSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import { Compass, X, Download, Award, FileText, CheckCircle2, ShieldCheck, Info, Flame, Users, Heart } from "lucide-react";
import { useAuthAndData } from "./lib/FirebaseContext";
import { useLanguage } from "./lib/LanguageContext";
// @ts-ignore
import liquidGlassBg from "./assets/images/liquid_glass_bg_1780913358891.png";

// Optimization: Lazy load heavy interactive segments, overlays, and drawers
const BookingModal = lazy(() => import("./components/BookingModal"));
const MyTripsDrawer = lazy(() => import("./components/MyTripsDrawer"));
const CeremoniesDrawer = lazy(() => import("./components/CeremoniesDrawer"));
const PackagesDrawer = lazy(() => import("./components/PackagesDrawer"));
const FunGroupToursModal = lazy(() => import("./components/FunGroupToursModal"));
const SpotifyDrawer = lazy(() => import("./components/SpotifyDrawer"));
const FloatingWhatsApp = lazy(() => import("./components/FloatingWhatsApp"));
const AIChatBot = lazy(() => import("./components/AIChatBot"));
const AttractionsDrawer = lazy(() => import("./components/AttractionsDrawer"));
const MusicTourRegisterModal = lazy(() => import("./components/MusicTourRegisterModal"));
const AdminConsoleDrawer = lazy(() => import("./components/AdminConsoleDrawer"));
const AuthModal = lazy(() => import("./components/AuthModal"));
const AdminPortalPage = lazy(() => import("./components/AdminPortalPage"));

// Simple elegant loader skeleton for Suspense fallbacks
function LazyLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/30 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-900 border border-brand-teal/20 px-6 py-4 rounded-2xl shadow-2xl">
        <div className="w-8 h-8 rounded-full border-2 border-brand-teal border-t-transparent animate-spin" />
        <span className="text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300">Loading...</span>
      </div>
    </div>
  );
}

export default function App() {
  const { language } = useLanguage();
  const {
    user,
    isDbEnabled,
    bookings,
    reviews,
    addBooking,
    cancelBooking,
    addReview,
    signIn,
    signOut,
  } = useAuthAndData();

  const [tours, setTours] = useState<TourPackage[]>(() => {
    const saved = localStorage.getItem("dreamscape_managed_tours");
    return saved ? JSON.parse(saved) : TOUR_PACKAGES;
  });

  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const saved = localStorage.getItem("dreamscape_managed_tours");
    if (saved) {
      setTours(JSON.parse(saved));
    }
  }, [currentPath]);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [theme, setTheme] = useState<"sand" | "dark">(() => {
    const saved = localStorage.getItem("dreamscape_theme");
    return saved === "sand" || saved === "dark"
      ? saved
      : "sand";
  });

  useEffect(() => {
    localStorage.setItem("dreamscape_theme", theme);
  }, [theme]);

  const [searchFilter, setSearchFilter] = useState<{
    destinationId: string;
    activityLevel: string;
    guestCount: number;
  } | null>(null);

  const [plannerDestinationId, setPlannerDestinationId] = useState<string>("");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [tripsDrawerOpen, setTripsDrawerOpen] = useState(false);
  const [ceremoniesDrawerOpen, setCeremoniesDrawerOpen] = useState(false);
  const [packagesDrawerOpen, setPackagesDrawerOpen] = useState(false);
  const [spotifyDrawerOpen, setSpotifyDrawerOpen] = useState(false);
  const [activePlaylistId, setActivePlaylistId] = useState<string>(() => {
    return localStorage.getItem("dreamscape_active_playlist") || "zambia";
  });
  const [isMusicActive, setIsMusicActive] = useState<boolean>(() => {
    return localStorage.getItem("dreamscape_music_active") === "true";
  });

  const [passportTravelers, setPassportTravelers] = useState<number>(() => {
    const saved = localStorage.getItem("dreamscape_passport_travelers");
    const num = saved ? Number(saved) : 15;
    if (num < 15) return 15;
    if (num > 33) return 33;
    return num;
  });

  useEffect(() => {
    localStorage.setItem("dreamscape_passport_travelers", String(passportTravelers));
  }, [passportTravelers]);

  useEffect(() => {
    localStorage.setItem("dreamscape_active_playlist", activePlaylistId);
  }, [activePlaylistId]);

  useEffect(() => {
    localStorage.setItem("dreamscape_music_active", String(isMusicActive));
  }, [isMusicActive]);



  const [isSpotlightSaved, setIsSpotlightSaved] = useState<boolean>(() => {
    return localStorage.getItem("dreamscape_spotlight_saved") === "true";
  });

  useEffect(() => {
    localStorage.setItem("dreamscape_spotlight_saved", String(isSpotlightSaved));
  }, [isSpotlightSaved]);

  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [attractionsDrawerOpen, setAttractionsDrawerOpen] = useState(false);
  const [musicTourRegisterOpen, setMusicTourRegisterOpen] = useState(false);
  const [adminConsoleOpen, setAdminConsoleOpen] = useState(false);
  const [isSpotlightExpanded, setIsSpotlightExpanded] = useState(false);
  const [spotlightLightboxOpen, setSpotlightLightboxOpen] = useState(false);
  const [spotlightSlideIndex, setSpotlightSlideIndex] = useState(0);

  const spotlightSlides = [
    {
      url: "/images/active spotlight 2.jpg",
      title: language === "fr" ? "Retraite des Chutes de Shantumbu" : "Shantumbu Falls Retreat",
      description: language === "fr"
        ? "Plongez dans des piscines de roche pure et des sentiers forestiers tranquilles à l'est de Lusaka."
        : "Immerse in pure rock pools and quiet forest walking trails nestled in the scenic hills east of Lusaka.",
    },
    {
      url: "/images/shantumbufalls1-1.jpg",
      title: language === "fr" ? "Randonnée dans l'Escarpement Vert" : "Lush Green Escarpment Hiking",
      description: language === "fr"
        ? "Suivez des sentiers escarpés anciens et observez des vues panoramiques sur la brousse environnante."
        : "Follow ancient steep-ridged forest trails and catch panoramic vistas of the pristine surrounding bushveld.",
    },
    {
      url: "/images/shantumbufalls2-1.jpg",
      title: language === "fr" ? "Pique-nique Éco-Gourmand Privé" : "Private Eco-Gourmet Picnic Spot",
      description: language === "fr"
        ? "Savourez un panier pique-nique frais préparé par nos guides chefs locaux au bord de l'eau."
        : "Relish a fresh gourmet picnic hamper prepared by our local guide chefs directly beside serene running streams.",
    },
    {
      url: "/images/shantumbufalls3.jpeg",
      title: language === "fr" ? "Piscines d'Eau de Source Naturelle" : "Fresh Natural Spring Pools",
      description: language === "fr"
        ? "Baignez-vous dans des piscines de roche de source naturelle fraîches, loin de la chaleur de la ville."
        : "Swim in cooling, crystal clear natural spring rock basins completely sheltered away from the city's hustle.",
    }
  ];
  const [benefitsModalOpen, setBenefitsModalOpen] = useState(false);
  const [isBrochureDownloading, setIsBrochureDownloading] = useState(false);
  const [funGroupToursModalOpen, setFunGroupToursModalOpen] = useState(false);

  const [appAuthModalOpen, setAppAuthModalOpen] = useState(false);
  const [appAuthModalTab, setAppAuthModalTab] = useState<"signup" | "login">("signup");

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href");
        if (href === "/signup") {
          e.preventDefault();
          setAppAuthModalTab("signup");
          setAppAuthModalOpen(true);
        } else if (href === "/login") {
          e.preventDefault();
          setAppAuthModalTab("login");
          setAppAuthModalOpen(true);
        } else if (href === "/admin") {
          e.preventDefault();
          navigateTo("/admin");
        }
      }
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  const [activeCheckoutPkg, setActiveCheckoutPkg] = useState<
    | {
        name: string;
        tagline: string;
        totalPrice: number;
        durationDays: number;
        destinationId: string;
        isCustom: boolean;
        activitiesList?: any[];
        whatToCarry?: string[];
        isPreSale?: boolean;
        preSalePriceZMW?: number;
        regularPriceZMW?: number;
      }
    | undefined
  >(undefined);

  const handleAddNewReview = (
    reviewData: Omit<Review, "id" | "date" | "avatarColor" | "verified">
  ) => {
    addReview(reviewData);
  };

  const handleDownloadBrochure = () => {
    setIsBrochureDownloading(true);
    setTimeout(() => {
      const content = `
======================================================
         DREAMSCAPE TOURS & TRAVEL ZAMBIA
          Official Safari & Tour Brochure
======================================================

Embark with the Explorer Elite on our bespoke wilderness journeys
across the heart of Zambia, crafted with utmost luxury and security.

📍 OUR PRIMARY DESTINATIONS & TOURS

1. SHANTUMBU FALLS WILDERNESS TREK & CAMPING
   - Locality: Lusaka Region (Bespoke Eco-Trails)
   - Highlights: Private woodland picnic, pristine waterfalls & swimming lagoon.
   - Core Concept: A serene quick escape to connect with rural Zambian beauty.

2. SIOMA NGWEZI WILDERNESS OUTPOST
   - Locality: Southwest Zambia near Kaza Transfrontier Conservation
   - Highlights: Untouched elephant migration trails, boat safari near Sioma Falls.
   - Core Concept: Pure, raw, authentic wilderness safari far away from crowds.

3. KUNDALILA FALLS ESCARPMENT CAMPING
   - Locality: Muchinga Province, Great Rift Valley Edge
   - Highlights: Spectacular 70m plunge waterfall, deep forest overnight.
   - Core Concept: Stargazing in the wild with premium safari-tented setups.

4. SOUTH LUANGWA PREMIER WALKING SAFARI
   - Locality: Luangwa River Valley
   - Highlights: High-density predator sightings, professional armed escorts.
   - Core Concept: Walking barefoot on the wild trails, experiencing nature unfiltered.

======================================================
       EXCLUSIVES OF THE EXPLORER PASSPORT CLUB
======================================================

Enhance your registration funnel and unlock these status levels:

💎 BRONZE FOOTPRINT (1 - 2 Safaris)
   - Accrue localized wildlife badges.
   - Sync customized itineraries with real-time route updates.
   - Dedicated Live-chat & Emergency Backup Channels.

💎 SILVER ELEPHANT (3 - 5 Safaris)
   - 3% Cash refund on direct Mobile Money deposit transactions.
   - Unlimited access to custom-compiled Spotify Wild Ambient tracks.
   - Priority booking windows for high-demand season periods.

💎 GOLD CHEETAH (6 - 10 Safaris)
   - Complimentary private bush dinners on your journeys.
   - Priority customize support to tailor your day-by-day itineraries.
   - Free group guest up-sizing for up to 3 companions.

💎 EMERALD EAGLE (11+ Safaris & Premium Accounts)
   - Dedicated 24/7 travel concierge hotline.
   - Private 4x4 utility car upgrades at no cost.
   - Exclusive invitations to annual tribal ceremonies & cultural tours.

======================================================
                 CONTACT INFORMATION
======================================================
📧 Email Channels: bookings@dreamscapetourszm.com
📱 WhatsApp Helpline: Connect securely via our floating chat handle
📍 Address: Lusaka, Republic of Zambia

Copyright © 2026 Dreamscape Tours Ltd. All Rights Reserved.
      `;
      
      const blob = new Blob([content.trim()], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Dreamscape-Tours-Zambia-Brochure.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsBrochureDownloading(false);
    }, 1200);
  };

  const handleSelectPredefinedPackage = (pkg: TourPackage) => {
    setActiveCheckoutPkg({
      name: pkg.name,
      tagline: pkg.tagline,
      totalPrice: pkg.pricePerPerson,
      durationDays: pkg.durationDays,
      destinationId: pkg.destinationId,
      isCustom: false,
      whatToCarry: pkg.whatToCarry,
      isPreSale: pkg.isPreSale,
      preSalePriceZMW: pkg.preSalePriceZMW,
      regularPriceZMW: pkg.regularPriceZMW,
    });
    setBookingModalOpen(true);
  };

  const handleSelectDirectDestination = (dest: Destination) => {
    const defaultPkg = TOUR_PACKAGES.find((p) => p.destinationId === dest.id);
    setActiveCheckoutPkg({
      name: defaultPkg ? defaultPkg.name : `${dest.name} Discovery`,
      tagline: defaultPkg ? defaultPkg.tagline : `Uncover raw pristine ${dest.category} elements`,
      totalPrice: defaultPkg ? defaultPkg.pricePerPerson : dest.baseCost,
      durationDays: defaultPkg ? defaultPkg.durationDays : 4,
      destinationId: dest.id,
      isCustom: false,
      whatToCarry: defaultPkg?.whatToCarry,
      isPreSale: defaultPkg?.isPreSale,
      preSalePriceZMW: defaultPkg?.preSalePriceZMW,
      regularPriceZMW: defaultPkg?.regularPriceZMW,
    });
    setBookingModalOpen(true);
  };

  const handleLaunchCustomPlannerCheckout = (customData: {
    destination: Destination;
    selectedActivities: any[];
    days: number;
    guests: number;
    totalCost: number;
  }) => {
    setActiveCheckoutPkg({
      name: `Customized Safari: ${customData.destination.name.split(" (")[0]}`,
      tagline: `Special personalized blueprint (${customData.days} Days)`,
      totalPrice: customData.totalCost,
      durationDays: customData.days,
      destinationId: customData.destination.id,
      isCustom: true,
      activitiesList: customData.selectedActivities,
    });
    setBookingModalOpen(true);
  };

  const handleFocusDestinationOnPlanner = (dest: Destination) => {
    setPlannerDestinationId(dest.id);
    const targetElement = document.getElementById("planner");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCancelBooking = (id: string) => {
    cancelBooking(id);
  };

  const handleConfirmNewBooking = (
    bookingInput: Omit<Booking, "id" | "dateBooked" | "status" | "userId">
  ) => {
    addBooking(bookingInput);
  };

  const activePlaylistObj = PLAYLISTS.find((p) => p.id === activePlaylistId) || PLAYLISTS[0];

  if (currentPath === "/admin") {
    return (
      <Suspense fallback={<LazyLoader />}>
        <AdminPortalPage
          onBackToMain={() => navigateTo("/")}
        />
      </Suspense>
    );
  }

  return (
    <div
      className={`relative min-h-screen selection:bg-brand-gold selection:text-brand-dark flex flex-col justify-between overflow-hidden transition-all duration-1000 ${
        theme === "dark"
          ? "dark bg-[#0a192f] text-slate-100"
          : "bg-brand-sand text-brand-dark"
      }`}
    >
      {/* Ambient background glows */}
      {theme === "dark" ? (
        <>
          <div className="absolute top-[8%] -left-20 w-[500px] h-[500px] bg-brand-teal/10 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse duration-[10000ms]" />
          <div className="absolute top-[40%] -right-24 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[150px] pointer-events-none z-0" />
          <div className="absolute top-[75%] left-1/4 w-[550px] h-[550px] bg-brand-teal/8 rounded-full blur-[140px] pointer-events-none z-0" />
        </>
      ) : (
        <>
          <div className="absolute top-[12%] -left-20 w-96 h-96 bg-brand-gold/15 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute top-[45%] -right-24 w-[450px] h-[450px] bg-brand-gold-light/10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute top-[80%] left-1/4 w-[500px] h-[500px] bg-brand-teal/8 rounded-full blur-3xl pointer-events-none z-0" />
        </>
      )}

      {/* Header */}
      <Header
        onOpenAttractions={() => setAttractionsDrawerOpen(true)}
        onOpenMyTrips={() => setTripsDrawerOpen(true)}
        onOpenCeremonies={() => setCeremoniesDrawerOpen(true)}
        onOpenPackages={() => setPackagesDrawerOpen(true)}
        bookingCount={bookings.length}
        theme={theme}
        onChangeTheme={(t) => setTheme(t)}
      />

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-grow relative z-10">

        {/* 1. HERO — first impression + search */}
        <Hero
          onSearch={(filters) => setSearchFilter(filters)}
          destinationKeys={DESTINATIONS.map((d) => ({ id: d.id, name: d.name }))}
          onBookTour={() => {
            setActiveCheckoutPkg(undefined);
            setBookingModalOpen(true);
          }}
        />

        {/* Custom Membership / Passport Club Welcoming Banner right above destinations */}
        {!user && (
          <section id="passport-club-section" className="relative max-w-2xl mx-auto px-4 sm:px-6 my-10 relative z-30">
            <div className="relative overflow-hidden rounded-2xl bg-brand-dark/95 border-2 border-[#f97316]/30 p-6 sm:p-8 shadow-xl backdrop-blur-md">
              {/* Decorative background visual ambient colors matching the logo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f97316]/10 border border-[#f97316]/25 text-[10px] font-mono uppercase tracking-[0.2em] text-[#f97316] font-bold mb-3.5 animate-pulse">
                  ✦ Dreamscape Passport Club ✦
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white uppercase tracking-tight leading-tight">
                  {language === "fr" ? "Rejoignez l'Expédition d'Élite" : "Embark with the Explorer Elite"}
                </h2>
                <p className="text-brand-sand/85 text-xs mt-3 leading-relaxed font-sans">
                  {language === "fr"
                    ? "Inscrivez-vous sur Dreamscape Tours pour enregistrer vos itinéraires personnalisés, suivre vos empreintes d'animaux sauvages, accumuler des jetons de guide et soumettre des dépôts de safari directs via Mobile Money."
                    : "Create a Dreamscape Traveler profile to sync bespoke safari itineraries, track wildlife footsteps, earn explorer badges, and authorize instant direct Mobile Money tour deposits securely."}
                </p>

                {/* Number of Travelers Input */}
                <div className="mt-5 max-w-xs" id="passport-club-travelers-container">
                  <label htmlFor="passport-club-travelers" className="block text-brand-sand/70 text-[10px] font-mono uppercase tracking-wider mb-2">
                    {language === "fr" ? "✦ Nombre de Voyageurs (15 - 33)" : "✦ Number of Travelers (15 - 33)"}
                  </label>
                  <input
                    id="passport-club-travelers"
                    type="number"
                    min="15"
                    max="33"
                    value={passportTravelers}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : Number(e.target.value);
                      setPassportTravelers(val as any);
                    }}
                    onBlur={() => {
                      if (passportTravelers === "" || isNaN(passportTravelers)) {
                        setPassportTravelers(15);
                      } else if (passportTravelers < 15) {
                        setPassportTravelers(15);
                      } else if (passportTravelers > 33) {
                        setPassportTravelers(33);
                      }
                    }}
                    className={`w-full bg-slate-900 border text-white text-sm px-4 py-2.5 rounded-xl transition-all font-sans focus:outline-none ${
                      (passportTravelers !== "" && (passportTravelers < 15 || passportTravelers > 33))
                        ? "border-red-500 bg-red-950/40 text-red-100 focus:ring-1 focus:ring-red-500 animate-pulse font-bold"
                        : "border-[#f97316]/30 hover:border-[#f97316]/60 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    }`}
                    placeholder="Enter travelers (15-33)"
                  />
                  {passportTravelers !== "" && (passportTravelers < 15 || passportTravelers > 33) && (
                    <p className="text-[10px] text-red-400 font-bold font-sans mt-2 animate-bounce">
                      ⚠️ {language === "fr" ? "Le groupe doit être de 15 à 33 personnes." : "Group must be between 15 and 33 travelers."}
                    </p>
                  )}
                </div>

                {/* The precise HTML segment requested by the user */}
                <div className="flex flex-wrap gap-4 mt-6">
                  <a href="/signup" id="passport-club-signup-btn" className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer block text-center">
                    Sign Up
                  </a>
                  <a href="/login" id="passport-club-login-btn" className="border border-orange-500 text-orange-500 px-6 py-3 rounded-lg hover:bg-orange-500 hover:text-black transition-all duration-300 transform hover:scale-[1.02] cursor-pointer block text-center">
                    Log In
                  </a>
                </div>

                {/* row of quick action buttons to enhance the registration funnel */}
                <div className="mt-8 pt-6 border-t border-[#f97316]/20 flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
                  <div className="flex items-center gap-1.5 text-[#f97316]/90 font-mono text-[10px] uppercase font-bold tracking-widest">
                    <Info className="w-3.5 h-3.5" />
                    <span>Quick Explorations:</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3.5 w-full sm:w-auto">
                    <button
                      onClick={handleDownloadBrochure}
                      disabled={isBrochureDownloading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#f97316]/10 border border-[#f97316]/30 hover:border-[#f97316]/60 text-xs text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 shrink-0 font-sans"
                    >
                      {isBrochureDownloading ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
                          <span>Preparing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-[#f97316] shrink-0" />
                          <span>Download Brochure</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setBenefitsModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#38bdf8]/10 border border-[#38bdf8]/30 hover:border-[#38bdf8]/60 text-xs text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 font-sans"
                    >
                      <Award className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                      <span>View Membership Benefits</span>
                    </button>

                    <button
                      onClick={() => setFunGroupToursModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#f97316]/10 border border-[#f97316]/30 hover:border-[#f97316]/60 text-xs text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 font-sans relative overflow-hidden"
                    >
                      <span className="relative flex h-2 w-2 mr-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-400"></span>
                      </span>
                      <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0 animate-flicker" />
                      <span>{language === "fr" ? "Voyages de Groupe" : "Fun Group Tours"}</span>
                      <span className="text-[8px] bg-[#f97316]/20 text-orange-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider font-mono animate-pulse">
                        {language === "fr" ? "Aperçu" : "Interactive"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Spotlight Experience Banner featuring the exact card layout from user */}
        <section id="spotlight-section" className="relative max-w-4xl mx-auto px-4 sm:px-6 my-16 z-30">
          <div className="text-center mb-6">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-teal font-extrabold block mb-1">
              {language === "fr" ? "★ VEDETTE ACTIVE ★" : "★ ACTIVE SPOTLIGHT ★"}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-orange-500 dark:text-orange-400 drop-shadow-sm">
              {language === "fr" ? "Oasis Secrète du Pays" : "Hidden Oasis Landmark"}
            </h2>
          </div>
          
          <div className="flex items-center justify-center p-4">
            <div
              className={`relative w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/10 group bg-slate-900 transition-all duration-500 ease-in-out ${
                isSpotlightExpanded ? "h-[760px]" : "h-[560px]"
              }`}
            >
              
              <img 
                src="/images/active spotlight 2.jpg" 
                alt="Active Spotlight Experience" 
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out cursor-pointer hover:brightness-105"
                onClick={() => {
                  setSpotlightLightboxOpen(true);
                  setSpotlightSlideIndex(0);
                }}
                title={language === "fr" ? "Cliquez pour ouvrir la galerie de l'oasis cachée" : "Click to view hidden oasis gallery"}
                referrerPolicy="no-referrer"
              />

              <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>

              <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
                <button 
                  onClick={() => {
                    const dest = DESTINATIONS.find(d => d.id === "shantumbu-falls");
                    if (dest) handleFocusDestinationOnPlanner(dest);
                  }}
                  className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition border border-white/10 cursor-pointer" 
                  aria-label="Go to itinerary builder"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-semibold tracking-wider text-cyan-200 uppercase bg-cyan-950/60 backdrop-blur-md rounded-full border border-cyan-500/30">
                    {language === "fr" ? "Aventure" : "Adventure"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSpotlightSaved(prev => !prev);
                    }}
                    className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition border border-white/10 cursor-pointer flex items-center justify-center group/heart"
                    title={isSpotlightSaved ? (language === "fr" ? "Retirer des favoris" : "Remove from saved") : (language === "fr" ? "Ajouter aux favoris" : "Save experience")}
                    aria-label={isSpotlightSaved ? "Remove from saved" : "Save experience"}
                  >
                    <Heart 
                      className={`w-4 h-4 transition-all duration-300 ${
                        isSpotlightSaved 
                          ? "fill-red-500 text-red-500 scale-110" 
                          : "text-white group-hover/heart:text-red-400 group-hover/heart:scale-110"
                      }`} 
                    />
                  </button>
                </div>
              </div>

              <div className="absolute bottom-4 inset-x-4 p-5 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col gap-3">
                <div>
                  <span className="text-xs font-medium text-slate-300 uppercase tracking-widest">
                    {language === "fr" ? "Expérience Vedette" : "Featured Experience"}
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                    {language === "fr" ? "Retraite des Chutes Cachées" : "Hidden Falls Retreat"}
                  </h2>
                </div>
                
                <p className="text-sm text-slate-200 leading-relaxed line-clamp-2">
                  {language === "fr" 
                    ? "Découvrez des piscines naturelles sereines et des falaises verdoyantes couvertes de mousse à l'écart des sentiers battus." 
                    : "Discover serene natural pools and lush moss-covered cliffs tucked away from the beaten path."}
                </p>

                {isSpotlightExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="border-t border-white/10 pt-3 mt-1 text-xs text-slate-200 flex flex-col gap-3"
                  >
                    <div>
                      <p className="font-semibold text-brand-teal uppercase tracking-wider mb-1">
                        {language === "fr" ? "★ ÉQUIPEMENTS INCLUS" : "★ INCLUDED AMENITIES"}
                      </p>
                      <ul className="grid grid-cols-1 gap-1 text-slate-300">
                        <li className="flex items-center gap-1.5">
                          <span className="text-brand-teal">✦</span>
                          {language === "fr" ? "Randonnée pédestre guidée" : "Guided hiking nature trail"}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-brand-teal">✦</span>
                          {language === "fr" ? "Transport aller-retour depuis Lusaka" : "Transport to and from Lusaka"}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-brand-teal">✦</span>
                          {language === "fr" ? "Caméraman professionnel" : "Professional cameraman"}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-brand-teal">✦</span>
                          {language === "fr" ? "Jeux de plein air et de groupe" : "Fun outdoor & group games"}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-brand-teal">✦</span>
                          {language === "fr" ? "Bassins rocheux naturels" : "Natural rock infinity pools"}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-brand-teal">✦</span>
                          {language === "fr" ? "Panique pique-nique gourmand" : "Gourmet eco-picnic set"}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-orange-400 uppercase tracking-wider mb-1">
                        {language === "fr" ? "★ MEILLEURS MOMENTS POUR VISITER" : "★ BEST SEASONAL VISIT TIMES"}
                      </p>
                      <p className="text-slate-300 leading-relaxed pl-3 border-l border-orange-500/30">
                        {language === "fr" 
                          ? "Avril à Août (Post-pluies pour une cascade luxuriante)" 
                          : "April to August (Post-rains for rich cascades & crystal clear pools)"}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-2 w-full mt-1">
                  <button 
                    onClick={() => setIsSpotlightExpanded(!isSpotlightExpanded)}
                    className="flex-1 py-3 px-2 bg-slate-800 hover:bg-slate-700 text-white border border-white/20 font-semibold text-xs rounded-xl active:scale-[0.98] transition-all shadow-lg cursor-pointer text-center"
                  >
                    {isSpotlightExpanded 
                      ? (language === "fr" ? "Masquer" : "Hide Details") 
                      : (language === "fr" ? "Détails ✦" : "Details ✦")}
                  </button>
                  <button 
                    onClick={() => {
                      const dest = DESTINATIONS.find(d => d.id === "shantumbu-falls");
                      if (dest) handleSelectDirectDestination(dest);
                    }}
                    className="flex-1 py-3 px-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-black/20 cursor-pointer text-center"
                  >
                    {language === "fr" ? "Réserver" : "Book Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fully Interactive Lightbox Carousel with Hidden Spotlight Details Section */}
          <AnimatePresence>
            {spotlightLightboxOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between items-center py-6 px-4 select-none overflow-hidden"
                onClick={() => setSpotlightLightboxOpen(false)}
              >
                {/* Top bar with brand and Close button */}
                <div className="w-full max-w-6xl flex justify-between items-center z-50 px-4">
                  <div className="flex flex-col text-left">
                    <span className="text-orange-500 text-[10px] font-mono uppercase tracking-[0.25em] font-extrabold animate-pulse">
                      ✦ {language === "fr" ? "DÉCOUVERTE CHUTES SHANTUMBU" : "SHANTUMBU FALLS DISCOVERY"} ✦
                    </span>
                    <span className="text-white font-serif text-sm sm:text-base font-bold uppercase tracking-tight">
                      Active Spotlight Carousel
                    </span>
                  </div>
                  <button
                    onClick={() => setSpotlightLightboxOpen(false)}
                    className="p-3 rounded-full bg-white/10 hover:bg-orange-500/20 text-white hover:text-orange-500 transition-all cursor-pointer border border-white/10 shadow-lg hover:scale-105 active:scale-95"
                    aria-label="Close Spotlight Carousel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Main Carousel Slider */}
                <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4">
                  {/* Previous Arrow */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpotlightSlideIndex((prev) => (prev - 1 + spotlightSlides.length) % spotlightSlides.length);
                    }}
                    className="absolute left-2 sm:left-4 z-50 p-3 rounded-full bg-black/75 hover:bg-black/90 text-white border border-white/10 hover:text-brand-gold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl"
                    aria-label="Previous Slide"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>

                  {/* Slide Container */}
                  <div 
                    className="relative w-full h-[55vh] md:h-[60vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={spotlightSlideIndex}
                        src={spotlightSlides[spotlightSlideIndex].url}
                        alt={spotlightSlides[spotlightSlideIndex].title}
                        referrerPolicy="no-referrer"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
                  </div>

                  {/* Next Arrow */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpotlightSlideIndex((prev) => (prev + 1) % spotlightSlides.length);
                    }}
                    className="absolute right-2 sm:right-4 z-50 p-3 rounded-full bg-black/75 hover:bg-black/90 text-white border border-white/10 hover:text-brand-gold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl"
                    aria-label="Next Slide"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>

                {/* Bottom Card (The Spotlight Hidden Hero overlay) */}
                <div 
                  className="w-full max-w-2xl bg-white/[0.06] backdrop-blur-xl border border-white/15 p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-4 z-40 relative -mt-16 sm:-mt-20 mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/35 text-[9px] font-mono uppercase tracking-[0.22em] text-orange-500 font-extrabold mb-2 animate-pulse">
                      {language === "fr" ? "✦ AVENTURE LOCALE D'ÉLITE ✦" : "✦ ACTIVE SPOTLIGHT EXPERIENCE ✦"}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white uppercase tracking-tight leading-none drop-shadow-md">
                      {spotlightSlides[spotlightSlideIndex].title}
                    </h3>
                    <p className="text-brand-sand/85 text-xs sm:text-sm mt-3 leading-relaxed max-w-lg font-sans">
                      {spotlightSlides[spotlightSlideIndex].description}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 w-full sm:w-auto mt-1">
                    <button
                      onClick={() => {
                        setSpotlightLightboxOpen(false);
                        const dest = DESTINATIONS.find(d => d.id === "shantumbu-falls");
                        if (dest) handleSelectDirectDestination(dest);
                      }}
                      className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs font-mono uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center shadow-lg shadow-orange-500/20"
                    >
                      {language === "fr" ? "Réserver l'Expérience" : "Reserve Experience"}
                    </button>
                    <button
                      onClick={() => setSpotlightLightboxOpen(false)}
                      className="flex-1 sm:flex-initial px-6 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs font-mono uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center border border-white/10"
                    >
                      {language === "fr" ? "Fermer" : "Close Gallery"}
                    </button>
                  </div>

                  {/* Dots Indicator */}
                  <div className="flex gap-2.5 mt-2">
                    {spotlightSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSpotlightSlideIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          spotlightSlideIndex === index ? "w-6 bg-brand-gold" : "w-1.5 bg-white/40 hover:bg-white/60"
                        }`}
                        title={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 2. EXPLORE & BOOK — destinations then packages, one continuous flow */}
        <DestinationList
          destinations={DESTINATIONS}
          onSelectDestination={handleSelectDirectDestination}
          onCustomizeDestination={handleFocusDestinationOnPlanner}
          searchFilter={searchFilter}
          onClearSearch={() => setSearchFilter(null)}
        />

        {/* 3. BUILD YOUR OWN — custom itinerary planner */}
        <InteractiveItineraryBuilder
          destinations={DESTINATIONS}
          preSelectedDestinationId={plannerDestinationId}
          onBookCustomTour={handleLaunchCustomPlannerCheckout}
        />


        {/* 4. TRUST — reviews and FAQ merged into one reassurance zone */}
        <ReviewSection
          reviews={reviews}
          destinations={DESTINATIONS}
          onAddReview={handleAddNewReview}
        />

        {/* 5. CONTACT + RESCHEDULE POLICY — close the sale */}
        <ContactSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 w-full relative z-20">
          <div className="bg-brand-dark text-brand-sand rounded-3xl p-6 sm:p-8 md:p-10 border border-brand-teal/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-brand-medium flex items-center justify-center border border-brand-teal/30 shrink-0 text-brand-gold shadow-lg">
                <Compass className="w-7 h-7 text-brand-gold animate-pulse" />
              </div>
              <div>
                <h4 className="font-serif text-lg sm:text-xl font-bold text-white uppercase tracking-wider">
                  {language === "fr"
                    ? "Assurance de Report & Annulation"
                    : "Reschedule Policy Assurance"}
                </h4>
                <p className="text-xs sm:text-sm text-brand-sand/80 max-w-2xl mt-2 leading-relaxed font-sans">
                  {language === "fr"
                    ? "La modification de date est 100% gratuite jusqu'à 15 jours avant le départ. Passé ce délai de 15 jours, des frais d'annulation équivalents à 20% du forfait payé s'appliqueront."
                    : "Date rescheduling is 100% free up to 15 days outstanding. After that 15-day limit, a cancellation penalty of 20% of the paid package will be charged."}
                </p>
              </div>
            </div>

            <a
              href="#faq"
              className="px-6 py-3.5 bg-gradient-to-r from-brand-gold to-brand-gold-light hover:brightness-110 active:scale-95 text-brand-dark shrink-0 rounded-xl font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md transition-all duration-300 cursor-pointer text-center w-full md:w-auto relative z-10"
            >
              {language === "fr"
                ? "Conditions de Réservation"
                : "Read Booking Conditions"}
            </a>
          </div>
        </div>

        <TeamSection />

        <FAQSection faqs={FAQS} />
      </main>

      {/* Footer */}
      <Footer onOpenAdmin={() => navigateTo("/admin")} />

      {/* Overlays */}
      <Suspense fallback={null}>
        <AdminConsoleDrawer
          isOpen={adminConsoleOpen}
          onClose={() => setAdminConsoleOpen(false)}
          bookings={bookings}
        />

        <MyTripsDrawer
          isOpen={tripsDrawerOpen}
          onClose={() => setTripsDrawerOpen(false)}
          bookings={bookings}
          destinations={DESTINATIONS}
          onCancelBooking={handleCancelBooking}
        />

        <CeremoniesDrawer
          isOpen={ceremoniesDrawerOpen}
          onClose={() => setCeremoniesDrawerOpen(false)}
          onSelectCeremony={(ceremonyPkg) => {
            setCeremoniesDrawerOpen(false);
            setActiveCheckoutPkg({
              name: ceremonyPkg.name,
              tagline: ceremonyPkg.tagline,
              totalPrice: ceremonyPkg.pricePerPerson,
              durationDays: ceremonyPkg.durationDays,
              destinationId: ceremonyPkg.destinationId,
              isCustom: false,
            });
            setBookingModalOpen(true);
          }}
        />

        <PackagesDrawer
          isOpen={packagesDrawerOpen}
          onClose={() => setPackagesDrawerOpen(false)}
          packages={tours}
          destinations={DESTINATIONS}
          onSelectPackage={(pkg) => {
            setPackagesDrawerOpen(false);
            handleSelectPredefinedPackage(pkg);
          }}
        />

        <SpotifyDrawer
          isOpen={spotifyDrawerOpen}
          onClose={() => setSpotifyDrawerOpen(false)}
          activePlaylistId={activePlaylistId}
          setActivePlaylistId={setActivePlaylistId}
          isMusicActive={isMusicActive}
          setIsMusicActive={setIsMusicActive}
        />

        <AttractionsDrawer
          isOpen={attractionsDrawerOpen}
          onClose={() => setAttractionsDrawerOpen(false)}
        />

        <MusicTourRegisterModal
          isOpen={musicTourRegisterOpen}
          onClose={() => setMusicTourRegisterOpen(false)}
        />
      </Suspense>

      {/* Side Toggle Buttons for Signature Tours and Spotify & Tour on the Right Side */}
      <div className="fixed right-0 top-28 sm:top-32 z-45 flex flex-col gap-1 sm:gap-2 select-none">
        <button
          onClick={() => setPackagesDrawerOpen(true)}
          className="bg-brand-dark/95 backdrop-blur-md text-brand-teal hover:text-white border-y border-l border-brand-teal/40 p-2 sm:py-4 sm:px-3 rounded-l-xl sm:rounded-l-2xl shadow-2xl flex flex-col items-center gap-1.5 sm:gap-2 transition-all duration-300 hover:pl-1 sm:hover:pl-0 hover:pr-4 px-2 sm:hover:pr-4.5 cursor-pointer"
          title="Explore Signature Tours"
        >
          <span className="text-sm sm:text-base">🧭</span>
          <span className="hidden sm:block [writing-mode:vertical-lr] font-mono text-[9px] uppercase tracking-[0.22em] font-extrabold text-center text-brand-teal">
            {language === "fr" ? "Circuits" : "Signature Tours"}
          </span>
         </button>
 
         <button
           onClick={() => setSpotifyDrawerOpen(true)}
           className={`bg-brand-dark/95 backdrop-blur-md border-y border-l p-2 sm:py-4 sm:px-3 rounded-l-xl sm:rounded-l-2xl shadow-2xl flex flex-col items-center gap-1.5 sm:gap-2 transition-all duration-300 hover:pl-1 sm:hover:pl-0 hover:pr-4 px-2 sm:hover:pr-4.5 cursor-pointer ${
             isMusicActive
               ? "text-[#1DB954] border-[#1DB954]/50 shadow-[#1DB954]/10"
               : "text-[#1DB954]/80 hover:text-white border-[#1DB954]/40"
           }`}
           title={language === "fr" ? "Lecteur Spotify et Circuits - En cours" : "Spotify Playlist & Tour - Dynamic Streaming"}
         >
           <div className="relative">
             <span className={`text-sm sm:text-base ${isMusicActive ? "animate-bounce inline-block" : ""}`}>
               🎵
             </span>
             {isMusicActive && (
               <span className="absolute -top-1 -right-1 flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1DB954]"></span>
               </span>
             )}
           </div>
           <span className="hidden sm:block [writing-mode:vertical-lr] font-mono text-[9px] uppercase tracking-[0.22em] font-extrabold text-center">
             {isMusicActive ? (
               <span className="text-emerald-400 font-bold tracking-[0.22em]">
                 {language === "fr" ? "VIBES ACTIVES" : "LIVE PLAYING"}
               </span>
             ) : (
               <span>{language === "fr" ? "Spotify & Circuits" : "Spotify & Tour"}</span>
             )}
           </span>
         </button>
       </div>
 
      <Suspense fallback={null}>
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onSubmitBooking={handleConfirmNewBooking}
          preSelectedPkg={activeCheckoutPkg}
          destinations={DESTINATIONS}
        />
      </Suspense>
 
       {/* Floating Bottom Left Action Bubbles for Safari Advisor Chat & WhatsApp support */}
       <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3.5 select-none sm:bottom-8 sm:left-8">
         <button
           onClick={() => setChatbotOpen(true)}
           className="w-13 h-13 rounded-full bg-brand-dark/95 backdrop-blur-md text-brand-teal hover:text-white flex items-center justify-center shadow-3xl hover:shadow-brand-teal/20 transition-all duration-300 hover:scale-110 border border-brand-teal/40 cursor-pointer active:scale-95"
           title="Open Safari Advisor"
         >
           <span className="text-xl">🧭</span>
         </button>
         <button
           onClick={() => setWhatsappOpen(true)}
           className="w-13 h-13 rounded-full bg-brand-dark/95 backdrop-blur-md text-[#25D366] hover:text-white flex items-center justify-center shadow-3xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-110 border border-[#25D366]/40 cursor-pointer active:scale-95"
           title="Chat with Agent via WhatsApp"
         >
           <span className="text-xl">💬</span>
         </button>
       </div>
 
      <Suspense fallback={null}>
        <FloatingWhatsApp
          isOpen={whatsappOpen}
          onClose={() => setWhatsappOpen(false)}
        />
        <AIChatBot
          isOpen={chatbotOpen}
          onClose={() => setChatbotOpen(false)}
        />
      </Suspense>
 
       {/* Floating Bottom Right "Now Playing" Visual Music Status Indicator */}
       {isMusicActive && !spotifyDrawerOpen && (
         <div
           id="spotify-now-playing-pill"
           className="fixed bottom-6 right-6 z-40 max-w-sm rounded-[20px] bg-[#0A2540]/95 border border-[#1DB954]/50 hover:border-[#1DB954] shadow-2xl p-3 flex items-center justify-between gap-4 text-white backdrop-blur-md select-none sm:bottom-8 sm:right-8 transition-all duration-300 hover:scale-105"
         >
           <style>{`
             @keyframes musicBarStretch1 {
               0%, 100% { height: 4px; }
               50% { height: 20px; }
             }
             @keyframes musicBarStretch2 {
               0%, 100% { height: 18px; }
               50% { height: 6px; }
             }
             @keyframes musicBarStretch3 {
               0%, 100% { height: 10px; }
               50% { height: 22px; }
             }
             .animate-music-stretch-1 { animation: musicBarStretch1 0.9s ease-in-out infinite; }
             .animate-music-stretch-2 { animation: musicBarStretch2 0.7s ease-in-out infinite; }
             .animate-music-stretch-3 { animation: musicBarStretch3 1.1s ease-in-out infinite; }
           `}</style>
 
           <div className="flex items-center gap-2.5">
             <div className="flex items-end gap-1 h-6 w-5 shrink-0" title="Audio streaming active">
               <span className="w-1 bg-[#1DB954] rounded-full animate-music-stretch-1" style={{ height: '4px' }}></span>
               <span className="w-1 bg-[#1DB954] rounded-full animate-music-stretch-2" style={{ height: '18px' }}></span>
               <span className="w-1 bg-[#1DB954] rounded-full animate-music-stretch-3" style={{ height: '10px' }}></span>
             </div>
             
             <div className="flex flex-col min-w-0">
               <span className="text-[10px] uppercase font-mono tracking-wider text-[#1DB954] font-black">
                 {language === "fr" ? "Vibe En Cours" : "Now Streaming"}
               </span>
               <span className="text-xs font-bold leading-tight truncate max-w-[140px] text-brand-sand-light flex items-center gap-1 mt-0.5">
                 <span>{activePlaylistObj.emoji}</span>
                 <span className="font-serif text-white">{activePlaylistObj.title}</span>
               </span>
             </div>
           </div>
 
           <div className="flex items-center gap-1.5 shrink-0">
             <button
               onClick={() => setSpotifyDrawerOpen(true)}
               className="px-2.5 py-1 bg-[#1DB954]/20 hover:bg-[#1DB954] text-[#1DB954] hover:text-black text-[10px] sm:text-xs font-semibold tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center border border-[#1DB954]/30 shadow-inner"
             >
               {language === "fr" ? "Afficher" : "Show"}
             </button>
             <button
               onClick={() => setIsMusicActive(false)}
               className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-md transition-all cursor-pointer"
               title={language === "fr" ? "Masquer" : "Dismiss"}
             >
               <X className="w-4 h-4" />
             </button>
           </div>
         </div>
       )}
 
      <Suspense fallback={null}>
        <AuthModal isOpen={appAuthModalOpen} onClose={() => setAppAuthModalOpen(false)} initialTab={appAuthModalTab} />
        <FunGroupToursModal isOpen={funGroupToursModalOpen} onClose={() => setFunGroupToursModalOpen(false)} />
      </Suspense>

      {/* Membership Benefits Modal */}
      <AnimatePresence>
        {benefitsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBenefitsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative z-10 w-full max-w-2xl bg-slate-900 border border-[#f97316]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                {/* Close Button */}
                <button
                  onClick={() => setBenefitsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-brand-sand-light transition-all cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f97316]/15 border border-[#f97316]/30 text-[10px] font-mono uppercase tracking-[0.2em] text-[#f97316] font-bold mb-3">
                    ✦ Member Privileges ✦
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                    Passport Club Benefits
                  </h3>
                  <p className="text-brand-sand/70 text-xs sm:text-sm mt-2 max-w-md mx-auto">
                    Accumulate explorer footsteps on every safari booking and elevate your status tiers.
                  </p>
                </div>

                {/* Tiers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Tier 1: Bronze */}
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold tracking-widest text-amber-600">BRONZE FOOTPRINT</span>
                        <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2.5 py-0.5 rounded-full">1-2 Safaris</span>
                      </div>
                      <ul className="space-y-2.5 text-xs text-brand-sand/80 font-sans">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                          <span>Track custom wildlife footprint marks on-dashboard</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                          <span>Save custom day-by-day itineraries to your cloud trips drawer</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Tier 2: Silver */}
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold tracking-widest text-[#38bdf8]">SILVER ELEPHANT</span>
                        <span className="text-[10px] font-mono bg-[#38bdf8]/15 text-[#38bdf8] px-2.5 py-0.5 rounded-full">3-5 Safaris</span>
                      </div>
                      <ul className="space-y-2.5 text-xs text-brand-sand/80 font-sans">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                          <span>3% Cashbacks on all direct Mobile Money deposits</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                          <span>Ad-free Spotify curated wildlife soundtracks stream</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                          <span>Access exclusive regional attractions maps</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Tier 3: Gold */}
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-[#f97316]/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold tracking-widest text-brand-gold">GOLD CHEETAH</span>
                        <span className="text-[10px] font-mono bg-brand-gold/15 text-brand-gold px-2.5 py-0.5 rounded-full">6-10 Safaris</span>
                      </div>
                      <ul className="space-y-2.5 text-xs text-brand-sand/80 font-sans">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                          <span>Complimentary fireside bush dinners with guide chefs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                          <span>Free groups upscale to 4 companions on-demand</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" style={{ color: "#d97706" }} />
                          <span>Priority support channels for custom itinerary edits</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Tier 4: Emerald */}
                  <div className="bg-slate-950/80 p-5 rounded-2xl border-2 border-emerald-500/20 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold tracking-widest text-emerald-400">EMERALD EAGLE</span>
                        <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full">11+ Safaris</span>
                      </div>
                      <ul className="space-y-2.5 text-xs text-brand-sand/80 font-sans">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>24/7 Dedicated offline personal safari concierge</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Complimentary private luxury 4x4 cruiser upgrade</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Invitations to sacred tribal heritage showcase events</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-[#f97316]/20 p-4 rounded-2xl flex items-start gap-3 mt-6">
                  <ShieldCheck className="w-5 h-5 text-[#f97316] shrink-0 mt-0.5" />
                  <div className="text-left font-sans">
                    <span className="text-xs font-bold text-white block">Secured Registration Funnel</span>
                    <span className="text-[10.5px] text-brand-sand/75 block mt-0.5">
                      Creating your account takes under 45 seconds and allows tracking wildlife footsteps on secure, direct-write Firestore servers.
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Button to direct to registration */}
              <div className="p-4 sm:p-6 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <span className="text-xs font-mono text-brand-sand/65">Ready to begin your journey?</span>
                <button
                  onClick={() => {
                    setBenefitsModalOpen(false);
                    setAppAuthModalTab("signup");
                    setAppAuthModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-xl text-xs sm:text-sm tracking-wide transition-all cursor-pointer transform active:scale-95 duration-200 shadow-md animate-pulse"
                >
                  Join Passport Club Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
