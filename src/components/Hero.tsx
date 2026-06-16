import { useState, FormEvent } from "react";
import { Search, MapPin, Calendar, Compass, Star, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../lib/LanguageContext";

const heroBg = "/images/hero.jpg";

interface HeroProps {
  onSearch: (filters: { destinationId: string; activityLevel: string; guestCount: number }) => void;
  destinationKeys: { id: string; name: string }[];
  onBookTour?: () => void;
}

export default function Hero({ onSearch, destinationKeys, onBookTour }: HeroProps) {
  const { t, language } = useLanguage();
  const [selectedDestId, setSelectedDestId] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [guests, setGuests] = useState(2);

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
      {/* Immersive background decoration with custom matching ambient underlay to fit and display all people beautifully */}
      <div className="absolute inset-0 z-0 bg-black/95">
        {/* Soft blurred ambient underlay of the same image to prevent ugly margins on unexpected ratios */}
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-110 select-none pointer-events-none"
        />
        {/* Primary crisp foreground image fitting 100% of visible details and people */}
        <img
          src={heroBg}
          alt="Zambezi Sunset Safari"
          referrerPolicy="no-referrer"
          className="relative w-full h-full object-contain object-center z-10 select-none"
        />
        {/* Layered high-contrast gradients for luxury readability of text overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-brand-dark z-20" />
      </div>

      {/* Decorative slant bottom banner in vintage warm white style to blend with content section */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-brand-sand z-10 clip-path-slant hidden md:block" />

      {/* Hero Central Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mt-8 sm:mt-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-medium/40 border border-brand-teal/20 backdrop-blur-sm mb-6 text-[10px] font-mono tracking-[0.25em] text-brand-gold uppercase font-bold"
        >
          <Compass className="w-3.5 h-3.5 text-brand-gold animate-spin-slow" />
          <span>{t("heroSub")}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center w-full font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white uppercase leading-tight md:leading-none max-w-5xl mx-auto"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-gold-light to-brand-gold block sm:inline text-center">
            {language === "fr" ? "Explorez la Zambie" : "Explore Zambia"}
          </span>{" "}
          <br className="hidden md:inline" />
          <span className="block sm:inline text-center">
            {language === "fr" ? "Comme Jamais" : "Like Never Before"}
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
            👉 {t("bookNow")}
          </button>
          <a
            href="#packages"
            className="px-8 py-4 bg-brand-medium/60 border border-brand-gold/45 hover:bg-brand-medium/90 text-brand-gold-light rounded-full font-bold text-xs sm:text-sm font-mono uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer flex items-center gap-2"
          >
            👉 {t("exploreDest")}
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
              <Star className="w-3 h-3 text-brand-gold" /> Expedition Size
            </span>
            <div className="relative">
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-brand-sand border border-brand-sand-dark text-brand-dark text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-teal appearance-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Traveler" : "Travelers"}
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
    </section>
  );
}
