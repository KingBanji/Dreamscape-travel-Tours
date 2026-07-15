import { useState, FormEvent } from "react";
import { Search, MapPin, Calendar, Compass, Users, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../lib/LanguageContext";
import { useAuthAndData } from "../lib/FirebaseContext";

const heroBg = "/images/boatcruise hero.png";

interface HeroProps {
  onSearch: (filters: { destinationId: string; activityLevel: string; guestCount: number }) => void;
  destinationKeys: { id: string; name: string }[];
  onBookTour?: () => void;
  onOpenAuth?: (tab: "signup" | "login") => void;
}

export default function Hero({ onSearch, destinationKeys, onBookTour, onOpenAuth }: HeroProps) {
  const { t, language } = useLanguage();
  const { user } = useAuthAndData();
  const [selectedDestId, setSelectedDestId] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [guests, setGuests] = useState(15);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const heroSlides = [
    {
      url: "/images/boatcruise hero.png",
      title: language === "fr" ? "Safari au Coucher du Soleil sur le Zambèze" : "Zambezi Sunset Safari",
      description: language === "fr" 
        ? "Découvrez les rives légendaires du Zambèze, une faune spectaculaire et des levers de soleil africains bruts." 
        : "Experience legendary Zambezi riverbanks, spectacular wildlife tracking, and raw African sunrises.",
    },
    {
      url: "/images/active spotlight 2.jpg",
      title: language === "fr" ? "Retraite des Chutes de Shantumbu" : "Shantumbu Falls Retreat",
      description: language === "fr" 
        ? "La porte dérobée de Lusaka. Randonnez sur des sentiers escarpés anciens et baignez-vous sous les chutes." 
        : "Lusaka's elite hidden gateway. Hike across spectacular, ancient steep-ridged trails and stand beneath fresh, natural waterfall plunge pools.",
    },
    {
      url: "/images/south luangwa 2.jpg",
      title: language === "fr" ? "Safari à Pied de South Luangwa" : "South Luangwa Walking Safari",
      description: language === "fr" 
        ? "Au cœur de la vallée de la Luangwa, pistez les léopards et prédateurs à pied en toute sécurité." 
        : "Deep within the Luangwa River Valley, experience high-density predator tracking barefoot on the wild trails.",
    },
    {
      url: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery.webp",
      title: language === "fr" ? "Chutes Victoria (Mosi-oa-Tunya)" : "Victoria Falls (Mosi-oa-Tunya)",
      description: language === "fr" 
        ? "La Fumée qui Gronde. Admirez le plus grand rideau d'eau tombante du monde." 
        : "The Smoke that Thunders. Stand on the edge of the world's most spectacular geological sheet of falling water.",
    }
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({
      destinationId: selectedDestId,
      activityLevel: selectedActivity,
      guestCount: guests
    });

    // Elegant scroll to destinations list after searching
    const target = document.getElementById("destinations");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section 
      id="home"
      className="relative min-h-screen bg-brand-dark flex flex-col justify-center items-center overflow-hidden pt-28 pb-16 px-4"
    >
      {/* Immersive background decoration with custom subtle landscape video background */}
      <div 
        className="absolute inset-0 z-0 bg-black/95 cursor-pointer"
        onClick={() => {
          setLightboxOpen(true);
          setCurrentSlideIndex(0);
        }}
        title={language === "fr" ? "Cliquez pour ouvrir la galerie interactive" : "Click to view interactive gallery"}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-35 select-none pointer-events-none"
        >
          <source src="/videos/dreamscapezambia hero.mp4" type="video/mp4" />
          <img
            src={heroBg}
            alt="Fallback Hero Image"
            className="w-full h-full object-cover"
          />
        </video>
        {/* Layered high-contrast gradients for luxury readability of text overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-brand-dark z-20" />
      </div>

      {/* Decorative slant bottom banner in vintage warm white style to blend with content section */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-brand-sand z-10 clip-path-slant hidden md:block" />

      {/* Hero Central Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mt-8 sm:mt-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mb-8"
        >
          <button
            onClick={() => {
              if (onOpenAuth) onOpenAuth("signup");
            }}
            className="bg-[#f97316] hover:bg-orange-600 text-white font-black px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-lg hover:scale-[1.05] active:scale-95 border-2 border-[#f97316]"
          >
            {language === "fr" ? "S'inscrire" : "Sign Up"}
          </button>
          <button
            onClick={() => {
              if (onOpenAuth) onOpenAuth("login");
            }}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-md border-2 border-white/40 hover:scale-[1.05] active:scale-95"
          >
            {language === "fr" ? "Se Connecter" : "Log In"}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border-2 border-orange-500/50 backdrop-blur-md mb-6 text-xs font-mono tracking-[0.2em] text-orange-500 uppercase font-extrabold shadow-[0_0_15px_rgba(249,115,22,0.15)] select-none hover:bg-orange-500/20 transition-all duration-300"
        >
          <Compass className="w-4 h-4 text-orange-500 animate-spin-slow animate-flicker" />
          <span>
            {language === "fr" ? "Explorez la Zambie Comme Jamais" : "Explore Zambia Like Never Before"}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center w-full font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white uppercase leading-tight md:leading-none max-w-5xl mx-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        >
          <span className="wilderness-title text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-sky-500 block text-center">
            {t("heroTitle")}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="text-brand-sand/90 text-sm sm:text-base md:text-lg max-w-3xl mx-auto mt-6 leading-relaxed font-sans"
        >
          {language === "fr" 
            ? "Découvrez des cascades cachées, des samaris à pied sur mesure et des sentiers d'escarpement de luxe. Des chutes de Shantumbu aux rives légendaires du Zambèze, configurez votre véritable expédition africaine."
            : "Discover hidden waterfalls, bespoke walking safaris, and pristine luxury escarpment trails. From Shantumbu Falls to legendary Zambezi riverbanks, configure your true African expedition."
          }
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap justify-center items-center gap-4 mt-10"
        >
          <button
            onClick={() => onBookTour?.()}
            className="px-8 py-4 bg-gradient-to-r from-brand-gold to-brand-gold-light hover:brightness-110 text-brand-dark rounded-full font-bold text-xs sm:text-sm font-mono uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-gold/30 cursor-pointer flex items-center gap-2"
          >
            {t("bookNow")}
          </button>
          <a
            href="#packages"
            className="px-8 py-4 bg-brand-medium/60 border border-brand-gold/45 hover:bg-brand-medium/90 text-brand-gold-light rounded-full font-bold text-xs sm:text-sm font-mono uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer flex items-center gap-2"
          >
            {t("exploreDest")}
          </a>
        </motion.div>
      </div>

      {/* Embedded High-Fidelity Search Bar Console */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-20 w-full max-w-4xl mx-auto mt-12 liquid-glass-card p-5 shadow-2xl hover:border-white/50 transition-all duration-300"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Destination Selector */}
          <div className="md:col-span-4 flex flex-col text-left">
            <span className="text-[10px] font-bold text-brand-medium uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-brand-gold" /> Destination Focus
            </span>
            <div className="relative">
              <select
                value={selectedDestId}
                onChange={(e) => setSelectedDestId(e.target.value)}
                className="w-full bg-brand-sand border border-brand-sand-dark text-brand-dark text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-teal appearance-none cursor-pointer"
              >
                <option value="">All Zambian Highlights</option>
                {destinationKeys.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-brand-medium pointer-events-none" />
            </div>
          </div>

          {/* Activity Experience Selection */}
          <div className="md:col-span-3 flex flex-col text-left">
            <span className="text-[10px] font-bold text-brand-medium uppercase tracking-wider mb-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-brand-gold" /> Safari Style
            </span>
            <div className="relative">
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full bg-brand-sand border border-brand-sand-dark text-brand-dark text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-teal appearance-none cursor-pointer"
              >
                <option value="">All Experience Types</option>
                <option value="Easy">Relaxed (Easy)</option>
                <option value="Moderate">Exploration (Moderate)</option>
                <option value="Challenging">Active Bushwalks</option>
                <option value="High Adventure">Extreme Adventures</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-brand-medium pointer-events-none" />
            </div>
          </div>

          {/* Guest Count Input Selector */}
          <div className="md:col-span-2 flex flex-col text-left">
            <span className="text-[10px] font-bold text-brand-medium uppercase tracking-wider mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-brand-gold" /> Expedition Size
            </span>
            <div className="relative">
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-brand-sand border border-brand-sand-dark text-brand-dark text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-teal appearance-none cursor-pointer"
              >
                {Array.from({ length: 33 - 15 + 1 }, (_, i) => i + 15).map((num) => (
                  <option key={num} value={num}>
                    {num} Travelers
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-brand-medium pointer-events-none" />
            </div>
          </div>

          {/* Large Action Search button */}
          <div className="md:col-span-3 pt-4 md:pt-0">
            <button
              type="submit"
              className="w-full bg-brand-dark hover:bg-brand-medium text-brand-gold font-bold py-3 px-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer shadow-md shadow-brand-dark/10"
            >
              <Search className="w-4 h-4 text-brand-gold" /> Filter Safaris
            </button>
          </div>
        </form>
      </motion.div>

      {/* Decorative Brand Trust Statistics Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.8 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mt-12 text-center"
      >
        <div>
          <span className="block font-serif text-2xl md:text-3xl font-bold text-brand-gold">100%</span>
          <span className="text-[10px] md:text-xs text-brand-sand/75 uppercase tracking-wider block mt-0.5">
            Zambian Operated
          </span>
        </div>
        <div>
          <span className="block font-serif text-2xl md:text-3xl font-bold text-brand-gold">450+</span>
          <span className="text-[10px] md:text-xs text-brand-sand/75 uppercase tracking-wider block mt-0.5">
            Leopards Tracked
          </span>
        </div>
        <div>
          <span className="block font-serif text-2xl md:text-3xl font-bold text-brand-gold">5.0 ★</span>
          <span className="text-[10px] md:text-xs text-brand-sand/75 uppercase tracking-wider block mt-0.5">
            180+ True Reviews
          </span>
        </div>
        <div>
          <span className="block font-serif text-2xl md:text-3xl font-bold text-brand-gold">No Fee</span>
          <span className="text-[10px] md:text-xs text-brand-sand/75 uppercase tracking-wider block mt-0.5">
            On Reschedules
          </span>
        </div>
      </motion.div>

      {/* Dynamic Fullscreen Lightbox Carousel with Hidden Hero Section overlay */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between items-center py-6 px-4 select-none overflow-hidden"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Top Bar with brand and Close Button */}
            <div className="w-full max-w-6xl flex justify-between items-center z-50 px-4">
              <div className="flex flex-col text-left">
                <span className="text-[#f97316] text-[10px] font-mono uppercase tracking-[0.25em] font-extrabold animate-pulse">
                  ✦ {language === "fr" ? "VUE D'ÉLITE WILDERNESS" : "WILDERNESS ELITE GALLERY"} ✦
                </span>
                <span className="text-white font-serif text-sm sm:text-base font-bold uppercase tracking-tight">
                  Dreamscape Tour Carousel
                </span>
              </div>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-3 rounded-full bg-white/10 hover:bg-[#f97316]/20 text-white hover:text-[#f97316] transition-all cursor-pointer border border-white/10 shadow-lg hover:scale-105 active:scale-95"
                aria-label="Close Gallery Carousel"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Carousel Area */}
            <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4">
              {/* Previous Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
                }}
                className="absolute left-2 sm:left-4 z-50 p-3 rounded-full bg-black/75 hover:bg-black/90 text-white border border-white/10 hover:text-brand-gold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Slide image */}
              <div 
                className="relative w-full h-[55vh] md:h-[60vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlideIndex}
                    src={heroSlides[currentSlideIndex].url}
                    alt={heroSlides[currentSlideIndex].title}
                    referrerPolicy="no-referrer"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Soft gradient bottom overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Next Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
                }}
                className="absolute right-2 sm:right-4 z-50 p-3 rounded-full bg-black/75 hover:bg-black/90 text-white border border-white/10 hover:text-brand-gold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom: The Hidden Hero Section Overlay */}
            <div 
              className="w-full max-w-2xl bg-white/[0.06] backdrop-blur-xl border border-white/15 p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-4 z-40 relative -mt-16 sm:-mt-20 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#f97316]/15 border border-[#f97316]/35 text-[9px] font-mono uppercase tracking-[0.22em] text-[#f97316] font-extrabold mb-2 animate-pulse">
                  {language === "fr" ? "✦ EXPÉDITION DÉCOUVERTE ✦" : "✦ EXCLUSIVE BLUEPRINT SPOTLIGHT ✦"}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white uppercase tracking-tight leading-none drop-shadow-md">
                  {heroSlides[currentSlideIndex].title}
                </h3>
                <p className="text-brand-sand/85 text-xs sm:text-sm mt-3 leading-relaxed max-w-lg font-sans">
                  {heroSlides[currentSlideIndex].description}
                </p>
              </div>

              {/* Hidden Hero Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto mt-1">
                <button
                  onClick={() => {
                    setLightboxOpen(false);
                    onBookTour?.();
                  }}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-[#f97316] to-orange-600 hover:brightness-110 active:scale-95 text-black font-bold text-xs font-mono uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
                >
                  {language === "fr" ? "Réserver ce Safari" : "Reserve this Safari"}
                </button>
                <button
                  onClick={() => setLightboxOpen(false)}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs font-mono uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center border border-white/10"
                >
                  {language === "fr" ? "Fermer" : "Close Gallery"}
                </button>
              </div>

              {/* Indicator dots */}
              <div className="flex gap-2.5 mt-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlideIndex === index ? "w-6 bg-brand-gold" : "w-1.5 bg-white/40 hover:bg-white/60"
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
  );
}
