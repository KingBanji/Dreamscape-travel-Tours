import { useState, useEffect } from "react";
import { Compass, Calendar, Menu, X, User, Briefcase, HelpCircle, LogOut, Coins, Sparkles, Sun, Moon, Shield } from "lucide-react";
import { Booking } from "../types";
import { useAuthAndData } from "../lib/FirebaseContext";
import { useCurrency } from "../lib/CurrencyContext";
import { useLanguage } from "../lib/LanguageContext";
import DreamscapeLogo from "./DreamscapeLogo";
import MfaSettingsModal from "./MfaSettingsModal";

interface HeaderProps {
  onOpenAttractions: () => void;
  onOpenMyTrips: () => void;
  onOpenCeremonies: () => void;
  onOpenPackages: () => void;
  onOpenMediaGallery: () => void;
  bookingCount: number;
  theme: "sand" | "dark";
  onChangeTheme: (theme: "sand" | "dark") => void;
  onOpenAuth?: (tab: "signup" | "login") => void;
  isAuthModalOpen?: boolean;
}

export default function Header({ 
  onOpenAttractions, 
  onOpenMyTrips, 
  onOpenCeremonies, 
  onOpenPackages, 
  onOpenMediaGallery,
  bookingCount, 
  theme, 
  onChangeTheme,
  onOpenAuth,
  isAuthModalOpen
}: HeaderProps) {
  const { user, signIn, signOut, isDbEnabled } = useAuthAndData();
  const { currency, setCurrency, exchangeRate } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isAuthModalOpen) return null;

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 110;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <header
      id="main-app-header"
      className={`fixed top-0 left-0 w-full z-45 transition-all duration-500 ${
        scrolled
          ? "bg-brand-dark/95 backdrop-blur-md shadow-2xl border-b border-brand-teal/20 py-2.5"
          : "bg-transparent py-4"
      }`}
    >
      {/* Premium Luxury Pre-Header Strip */}
      <div className="border-b border-white/5 pb-2 mb-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[9px] font-mono tracking-[0.18em] text-brand-sand/60">
          <div className="hidden sm:flex items-center gap-4">
            <span>COORDINATES: 15°25&apos;S // 28°17&apos;E</span>
            <span className="text-brand-gold/50">•</span>
            <span>Est. 2024 Lusaka</span>
          </div>
          <div className="flex sm:hidden items-center gap-2">
            <span>COORDINATES: 15°25&apos;S</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 font-mono text-[9px] text-brand-gold-light select-none tracking-widest uppercase">
              <span>✦ Dreamscape Passport Club ✦</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2.5 sm:gap-4">
          {/* Logo Brand */}
          <div 
            onClick={() => handleNavClick("home")} 
            className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group flex-shrink-0 justify-start"
          >
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-white overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-105 border border-brand-teal/20 p-0.5 shadow-sm flex-shrink-0">
              <DreamscapeLogo className="w-full h-full object-contain" />
            </div>
            <div className="flex-shrink-0">
              <span className="font-serif text-xs xs:text-sm sm:text-lg md:text-xl font-bold tracking-tight text-white block whitespace-nowrap">
                DREAMSCAPE TOURS
              </span>
              <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-mono tracking-[0.1em] xs:tracking-[0.15em] sm:tracking-[0.25em] text-brand-teal uppercase block -mt-0.5 font-bold whitespace-nowrap">
                {t("zambiaTravels")}
              </span>
            </div>
          </div>

          {/* Large Screens Links */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-5 border-r border-brand-teal/20 pr-4 flex-shrink-0">
            <button
              onClick={() => handleNavClick("home")}
              className="font-medium text-[10px] xl:text-xs font-mono uppercase tracking-wider xl:tracking-widest text-brand-sand/80 hover:text-brand-gold transition-colors py-1 cursor-pointer whitespace-nowrap flex-shrink-0"
              aria-label="Navigate to Home section"
            >
              {t("home")}
            </button>
            <button
              onClick={() => handleNavClick("destinations")}
              className="font-medium text-[10px] xl:text-xs font-mono uppercase tracking-wider xl:tracking-widest text-brand-sand/80 hover:text-brand-gold transition-colors py-1 cursor-pointer whitespace-nowrap flex-shrink-0"
              aria-label="Navigate to Destinations section"
            >
              {t("destinations")}
            </button>
            <button
              onClick={() => handleNavClick("planner")}
              className="font-medium text-[10px] xl:text-xs font-mono uppercase tracking-wider xl:tracking-widest text-brand-sand/80 hover:text-brand-gold transition-colors py-1 cursor-pointer whitespace-nowrap flex-shrink-0"
              aria-label="Navigate to Custom Trip Planner section"
            >
              {t("customTrip")}
            </button>
            <button
              onClick={onOpenPackages}
              className="font-medium text-[10px] xl:text-xs font-mono uppercase tracking-wider xl:tracking-widest text-brand-sand/80 hover:text-brand-gold transition-colors py-1 cursor-pointer whitespace-nowrap flex-shrink-0"
              aria-label="Open Signature Packages and Tours catalog"
            >
              {t("tours")}
            </button>
            <button
              onClick={() => handleNavClick("faq")}
              className="font-medium text-[10px] xl:text-xs font-mono uppercase tracking-wider xl:tracking-widest text-brand-sand/80 hover:text-brand-gold transition-colors py-1 cursor-pointer whitespace-nowrap flex-shrink-0"
              aria-label="Navigate to Frequently Asked Questions section"
            >
              {t("faq")}
            </button>
            <button
              onClick={() => handleNavClick("team")}
              className="font-medium text-[10px] xl:text-xs font-mono uppercase tracking-wider xl:tracking-widest text-brand-sand/80 hover:text-brand-gold transition-colors py-1 cursor-pointer whitespace-nowrap flex-shrink-0"
              aria-label="Navigate to Team section"
            >
              {t("team")}
            </button>
            <button
              onClick={() => handleNavClick("contact")}
              className="font-medium text-[10px] xl:text-xs font-mono uppercase tracking-wider xl:tracking-widest text-brand-sand/80 hover:text-brand-gold transition-colors py-1 cursor-pointer whitespace-nowrap flex-shrink-0"
              aria-label="Navigate to Contact Information section"
            >
              {t("contact")}
            </button>
            <button
              onClick={onOpenMediaGallery}
              className="font-medium text-[10px] xl:text-xs font-mono uppercase tracking-wider xl:tracking-widest text-brand-sand/80 hover:text-brand-gold transition-colors py-1 cursor-pointer whitespace-nowrap flex-shrink-0 bg-transparent border-none outline-none"
              aria-label="View media gallery, videos, photos and brochures"
            >
              {language === "fr" ? "Galerie" : "Gallery"}
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Currency switcher - hidden on small mobile screens to prevent header wrapping */}
            <div className="hidden sm:flex items-center bg-brand-medium/60 rounded-full p-0.5 border border-brand-teal/30 shadow-inner flex-shrink-0">
              <button
                onClick={() => setCurrency("ZMW")}
                className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wide transition-all whitespace-nowrap flex-shrink-0 ${
                  currency === "ZMW"
                    ? "bg-brand-gold text-brand-dark shadow-sm"
                    : "text-brand-sand/65 hover:text-white"
                }`}
                title="Zambian Kwacha"
                aria-label="Switch display currency to Zambian Kwacha"
              >
                ZMW
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wide transition-all whitespace-nowrap flex-shrink-0 ${
                  currency === "USD"
                    ? "bg-brand-gold text-brand-dark shadow-sm"
                    : "text-brand-sand/65 hover:text-white"
                }`}
                title={`US Dollar (Exchange rate: 1 USD ≈ ${exchangeRate.toFixed(2)} ZMW)`}
                aria-label="Switch display currency to US Dollars"
              >
                USD
              </button>
            </div>

            {/* Theme switcher - hidden on mobile, visible on sm and up */}
            <div className="hidden sm:flex items-center bg-brand-medium/60 rounded-full p-0.5 border border-brand-teal/30 shadow-inner flex-shrink-0">
              <button
                onClick={() => onChangeTheme("sand")}
                className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wide transition-all flex items-center justify-center gap-1 whitespace-nowrap flex-shrink-0 pr-1.5 sm:pr-2 ${
                  theme === "sand"
                    ? "bg-brand-teal text-white shadow-sm"
                    : "text-brand-sand/65 hover:text-white"
                }`}
                title="Light Theme"
                aria-label="Switch visual style to light theme"
              >
                <Sun className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">LIGHT</span>
              </button>
              <button
                onClick={() => onChangeTheme("dark")}
                className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tracking-wide transition-all flex items-center justify-center gap-1 whitespace-nowrap flex-shrink-0 pr-1.5 sm:pr-2 ${
                  theme === "dark"
                    ? "bg-[#0ea5e9] text-white shadow-sm"
                    : "text-brand-sand/65 hover:text-white"
                }`}
                title="Deep Dark Theme"
                aria-label="Switch visual style to dark theme"
              >
                <Moon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">DARK</span>
              </button>
            </div>





            <button
              onClick={onOpenPackages}
              id="btn-signature-packages"
              className="relative hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-brand-teal/40 bg-brand-medium/50 hover:bg-brand-teal/20 text-brand-teal transition-all whitespace-nowrap flex-shrink-0"
              aria-label="Open signature tours and packages catalog"
            >
              <Compass className="w-3.5 h-3.5 text-brand-teal" />
              <span>{language === "fr" ? "Circuits" : "Signature Tours"}</span>
            </button>

            <button
              onClick={onOpenCeremonies}
              id="btn-ceremonies"
              className="relative hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-brand-gold-light/40 bg-brand-medium/50 hover:bg-brand-gold-light/20 text-brand-gold transition-all whitespace-nowrap flex-shrink-0"
              aria-label="Open traditional ceremonies visual portal"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
              <span>{language === "fr" ? "Cérémonies" : "Ceremonies"}</span>
            </button>

            <button
              onClick={onOpenAttractions}
              id="btn-attractions"
              className="relative hidden 2xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-brand-teal/40 bg-brand-medium/50 hover:bg-brand-teal/20 text-brand-sand transition-all whitespace-nowrap flex-shrink-0"
              aria-label="Open Zambian heritage attractions guide"
            >
              <Compass className="w-4 h-4 text-brand-gold" />
              <span>{language === "fr" ? "Attractions" : "Attractions"}</span>
            </button>

            {/* Main Header Sign Up / Log In buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 select-none border-l-0 sm:border-l border-white/10 sm:pl-2 flex-shrink-0">
              {user ? (
                <div className="flex items-center gap-1.5 sm:gap-2 bg-brand-medium/50 p-1 sm:p-1.5 pr-2.5 rounded-full border border-brand-teal/20 flex-shrink-0 font-sans">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || "Explorer")}`} 
                    alt="Profile" 
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full border border-brand-teal flex-shrink-0"
                    style={{ height: '20px', width: '20px', objectFit: 'cover' }}
                  />
                  <span className="hidden sm:inline text-[11px] font-semibold text-brand-sand/90 truncate max-w-[80px] whitespace-nowrap">
                    {user.displayName?.split(" ")[0] || "Explorer"}
                  </span>
                  {user.isCredentialsUser && (
                    <button 
                      onClick={() => setMfaModalOpen(true)}
                      title="Two-Factor Security (MFA)"
                      className="p-1 text-brand-sand/65 hover:text-brand-gold transition-colors rounded-full cursor-pointer flex items-center justify-center bg-brand-medium/40 hover:bg-brand-gold/10 flex-shrink-0"
                      aria-label="Manage multi-factor authentication security settings"
                    >
                      <Shield className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button 
                    onClick={signOut} 
                    title={t("signOut")} 
                    className="p-1 text-brand-sand/65 hover:text-red-400 transition-colors rounded-full cursor-pointer flex items-center justify-center bg-brand-medium/40 hover:bg-red-500/10 flex-shrink-0"
                    aria-label="Sign out of your account"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}
            </div>

            {/* Mobile menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-brand-sand hover:bg-brand-medium transition-colors flex-shrink-0"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 flex-shrink-0" /> : <Menu className="w-6 h-6 flex-shrink-0" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-brand-dark/95 backdrop-blur-md border-b border-brand-teal/20 px-4 pt-3 pb-6 space-y-2">

          <button
            onClick={() => { setMobileMenuOpen(false); onOpenPackages(); }}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-brand-teal bg-brand-medium/40 hover:bg-brand-medium hover:text-white transition-colors border border-brand-teal/20"
            aria-label="Open signature tours catalog on mobile"
          >
            🧭 {language === "fr" ? "Circuits Signatures" : "Signature Tours"}
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenCeremonies(); }}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-brand-gold bg-brand-medium/40 hover:bg-brand-medium hover:text-white transition-colors border border-brand-gold-light/20"
            aria-label="Open traditional ceremonies portal on mobile"
          >
            👑 {language === "fr" ? "Cérémonies Traditionnelles" : "Traditional Ceremonies"}
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenAttractions(); }}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-brand-gold-light bg-brand-medium/40 hover:bg-brand-medium hover:text-white transition-colors border border-brand-gold-light/20"
            aria-label="Open Zambian attractions guide on mobile"
          >
            🧭 {language === "fr" ? "Attractions Zambie" : "Zambian Attractions"}
          </button>
          <button
            onClick={() => handleNavClick("home")}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-brand-sand hover:bg-brand-medium hover:text-brand-gold transition-colors"
            aria-label="Navigate to Home section on mobile"
          >
            {t("home")}
          </button>
          <button
            onClick={() => handleNavClick("destinations")}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-brand-sand hover:bg-brand-medium hover:text-brand-gold transition-colors"
            aria-label="Navigate to Destinations section on mobile"
          >
            {t("destinations")}
          </button>
          <button
            onClick={() => handleNavClick("planner")}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-brand-sand hover:bg-brand-medium hover:text-brand-gold transition-colors"
            aria-label="Navigate to Custom Trip Planner on mobile"
          >
            {t("customTrip")}
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenPackages(); }}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-brand-sand hover:bg-brand-medium hover:text-brand-gold transition-colors"
            aria-label="Navigate to Signature Tours catalog on mobile"
          >
            {t("tours")}
          </button>
          <button
            onClick={() => handleNavClick("faq")}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-brand-sand hover:bg-brand-medium hover:text-brand-gold transition-colors"
            aria-label="Navigate to Frequently Asked Questions section on mobile"
          >
            {t("faq")}
          </button>
          <button
            onClick={() => handleNavClick("team")}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-brand-sand hover:bg-brand-medium hover:text-brand-gold transition-colors"
            aria-label="Navigate to Team section on mobile"
          >
            {t("team")}
          </button>
          <button
            onClick={() => handleNavClick("contact")}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-brand-sand hover:bg-brand-medium hover:text-brand-gold transition-colors"
            aria-label="Navigate to Contact section on mobile"
          >
            {t("contact")}
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenMediaGallery();
            }}
            className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-brand-sand hover:bg-brand-medium hover:text-brand-gold transition-colors bg-transparent border-none outline-none cursor-pointer"
            aria-label="View media gallery, videos, photos and brochures on mobile"
          >
            🖼️ {language === "fr" ? "Galerie & Médias" : "Gallery & Media"}
          </button>

          {!user && (
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5 mt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuth) onOpenAuth("signup");
                }}
                className="bg-[#f97316] hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-center text-xs uppercase tracking-wider transition-all cursor-pointer block w-full select-none"
                aria-label="Open sign up form on mobile"
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuth) onOpenAuth("login");
                }}
                className="bg-white hover:bg-gray-100 text-black font-bold py-2.5 rounded-xl text-center text-xs uppercase tracking-wider transition-all cursor-pointer block w-full select-none"
                aria-label="Open login form on mobile"
              >
                Log In
              </button>
            </div>
          )}

          {/* Dedicated mobile theme and currency settings drawer section */}
          <div className="pt-4 border-t border-white/10 mt-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-sand/50">CURRENCY</span>
              <div className="flex items-center bg-brand-medium/60 rounded-full p-0.5 border border-brand-teal/30 shadow-inner">
                <button
                  onClick={() => setCurrency("ZMW")}
                  className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide transition-all ${
                    currency === "ZMW"
                      ? "bg-brand-gold text-brand-dark shadow-sm"
                      : "text-brand-sand/65 hover:text-white"
                  }`}
                  aria-label="Switch display currency to Zambian Kwacha on mobile"
                >
                  ZMW
                </button>
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide transition-all ${
                    currency === "USD"
                      ? "bg-brand-gold text-brand-dark shadow-sm"
                      : "text-brand-sand/65 hover:text-white"
                  }`}
                  aria-label="Switch display currency to US Dollars on mobile"
                >
                  USD
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-sand/50">THEME MODE</span>
              <div className="flex items-center bg-brand-medium/60 rounded-full p-0.5 border border-brand-teal/30 shadow-inner block">
                <button
                  onClick={() => onChangeTheme("sand")}
                  className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide transition-all flex items-center justify-center gap-1 ${
                    theme === "sand"
                      ? "bg-brand-teal text-white shadow-sm"
                      : "text-brand-sand/65 hover:text-white"
                  }`}
                  aria-label="Switch visual style to light theme on mobile"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>LIGHT</span>
                </button>
                <button
                  onClick={() => onChangeTheme("dark")}
                  className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wide transition-all flex items-center justify-center gap-1 ${
                    theme === "dark"
                      ? "bg-[#0ea5e9] text-white shadow-sm"
                      : "text-brand-sand/65 hover:text-white"
                  }`}
                  aria-label="Switch visual style to dark theme on mobile"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>DARK</span>
                </button>
              </div>
            </div>


          </div>


        </div>
      )}
      <MfaSettingsModal isOpen={mfaModalOpen} onClose={() => setMfaModalOpen(false)} />
    </header>
  );
}
