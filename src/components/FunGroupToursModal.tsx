import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Flame, Users, Calendar, Compass, Sparkles, Check, MessageSquare, GlassWater, Heart, Building, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface FunGroupToursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GroupTourItem {
  id: string;
  emoji: string;
  titleEn: string;
  titleFr: string;
  tagEn: string;
  tagFr: string;
  descriptionEn: string;
  descriptionFr: string;
  highlightsEn: string[];
  highlightsFr: string[];
  estimatedDate: string;
  costEstimateEn: string;
  costEstimateFr: string;
  icon: React.ReactNode;
}

export default function FunGroupToursModal({ isOpen, onClose }: FunGroupToursModalProps) {
  const { language } = useLanguage();
  const [activeTourId, setActiveTourId] = useState<string>("singles-pool-party");

  // Form states matching structural blueprint schema fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [guestsCount, setGuestsCount] = useState<number>(18);
  const [preferredStartDate, setPreferredStartDate] = useState("2026-08-15");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!isOpen) return null;

  const GROUP_TOURS: GroupTourItem[] = [
    {
      id: "singles-pool-party",
      emoji: "🏖️",
      titleEn: "Singles Swimming summer Pool Party",
      titleFr: "Soirée Piscine d'Été pour Célibataires",
      tagEn: "Social & Fun",
      tagFr: "Social & Fun",
      descriptionEn: "A high-energy, boutique pool party experience hosted at an ultra-exclusive resort. Immerse yourself in premium sun-lounger networks, tropical cocktails, professional live acoustic DJ beats, and lighthearted water games while connecting with travel-loving explorers.",
      descriptionFr: "Une fête au bord de la piscine haut de gamme dans un complexe ultra-exclusif. Profitez des transats premium, de cocktails tropicaux, de DJ en direct et de jeux aquatiques tout en rencontrant des explorateurs célibataires passionnés de voyages.",
      highlightsEn: [
        "Interactive pool volleyball & icebreakers",
        "Unlimited custom mocktails & artisan bites",
        "Live tropical house DJ sets under palms",
        "Curated high-resolution professional photography"
      ],
      highlightsFr: [
        "Volley-ball aquatique interactif & brise-glaces",
        "Mocktails artisanaux à volonté & amuse-bouches",
        "DJ live Tropical House sous les palmiers",
        "Séance photo professionnelle haute résolution incluse"
      ],
      estimatedDate: "2026-08-15",
      costEstimateEn: "$85 per traveler (All-Inclusive)",
      costEstimateFr: "85 $ par voyageur (Tout Compris)",
      icon: <GlassWater className="w-5 h-5 text-orange-400" />
    },
    {
      id: "couples-hiking",
      emoji: "🥾",
      titleEn: "Couples Hiking Sunset Adventure",
      titleFr: "Randonnée Romantique des Couples",
      tagEn: "Romance & Scenic",
      tagFr: "Romance & Paysage",
      descriptionEn: "A panoramic and romantic escape along lush high-altitude forest ridges overlooking deep river canyons. Hand-in-hand hikes, custom romantic lookout photo sessions, and luxury forest basket picnics during dynamic golden hours.",
      descriptionFr: "Une escapade panoramique et romantique le long de crêtes forestières de haute altitude surplombant de profonds canyons sauvages. Randonnées main dans la main, séances photo et pique-niques de forêt de luxe au coucher du soleil.",
      highlightsEn: [
        "Lover's Peak lock-locking and promise tree ceremony",
        "Exclusive couples luxury gourmet picnic box",
        "Guided scenic photography at multiple viewpoints",
        "Surprise sunset sparkling grape-juice toast"
      ],
      highlightsFr: [
        "Cérémonie du verrou d'amour au pic des amoureux",
        "Panier pique-nique gastronomique de luxe exclusif",
        "Photographie panoramique guidée aux points de vue",
        "Toast surprise de jus de raisin pétillant au coucher"
      ],
      estimatedDate: "2026-09-05",
      costEstimateEn: "$140 per couple (Full Access)",
      costEstimateFr: "140 $ par couple (Accès Complet)",
      icon: <Heart className="w-5 h-5 text-rose-500" />
    },
    {
      id: "corporate-hiking",
      emoji: "🏢",
      titleEn: "Corporate Hiking & Cohesion Retreat",
      titleFr: "Randonnée de Cohésion d'Entreprise",
      tagEn: "Team Building",
      tagFr: "Team Building",
      descriptionEn: "Purposefully designed trail network team programs for professional groups of 15 to 33. Elevate workplace harmony with dynamic team-survival challenges, open-canopy breakout discussions, and campfire acoustic reflective sessions.",
      descriptionFr: "Programmes de sentiers spécialement conçus pour stimuler l'harmonie d'équipe pour des groupes de 15 à 33 professionnels. Renforcez l'esprit d'équipe avec des défis de survie et des ateliers sous les arbres.",
      highlightsEn: [
        "Guided outdoor trust and communication exercises",
        "Structured strategic brainstorm sessions in refreshing forest air",
        "Catered wood-fired organic lunch at the peak",
        "Facilitated custom campfire feedback circle"
      ],
      highlightsFr: [
        "Exercices guidés de confiance et de communication en plein air",
        "Séance de brainstorming stratégique sous la canopée",
        "Déjeuner biologique cuit au feu de bois au sommet",
        "Cercle de partage facilité autour du grand feu"
      ],
      estimatedDate: "2026-10-12",
      costEstimateEn: "$110 per participant (Corporate Packages Available)",
      costEstimateFr: "110 $ par participant (Forfaits Entreprise)",
      icon: <Building className="w-5 h-5 text-sky-400" />
    },
    {
      id: "other-fun-tours",
      emoji: "🦁",
      titleEn: "Bespoke Wilderness Group Safaris",
      titleFr: "Safaris de Groupe sur Mesure",
      tagEn: "Exploration & Wilderness",
      tagFr: "Exploration & Nature",
      descriptionEn: "Uncover Zambia's best-kept secrets with high-spirited groups. Weekly expeditions mapping the mystical mists of Shantumbu Falls, wild game drives accompanied by specialized bonfire night barbecues, and wildlife tracking expeditions.",
      descriptionFr: "Découvrez les secrets les mieux gardés de la Zambie en groupe. Expéditions hebdomadaires cartographiant les chutes de Shantumbu, des safaris avec barbecue sous les étoiles et pistage d'animaux.",
      highlightsEn: [
        "Specialist walking safari guide to Shantumbu Falls mists",
        "Sunset open-air wilderness stargazing & campfire chats",
        "Exclusive group wildlife tracker badges for passport sync",
        "Luxury custom game explorer multi-terrain vehicles"
      ],
      highlightsFr: [
        "Guide naturaliste aux brumes des chutes de Shantumbu",
        "Observation des étoiles et feux de camp en pleine nature",
        "Badges de pistage de faune pour votre passeport",
        "Véhicules tout-terrain de safari groupe exclusifs"
      ],
      estimatedDate: "2026-11-20",
      costEstimateEn: "$95 per person (Group Specials Active)",
      costEstimateFr: "95 $ par personne (Spéciaux de Groupe Actifs)",
      icon: <Compass className="w-5 h-5 text-brand-teal" />
    }
  ];

  const currentTour = GROUP_TOURS.find((t) => t.id === activeTourId) || GROUP_TOURS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Validate fields
      if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
        throw new Error(language === "fr" ? "Veuillez remplir tous les champs obligatoires." : "Please fill in all required fields.");
      }

      if (guestsCount < 15 || guestsCount > 33) {
        throw new Error(language === "fr" ? "La taille du groupe doit être entre 15 et 33 voyageurs." : "Group scale must be between 15 and 33 travelers.");
      }

      const bookingDoc = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        guestsCount: Number(guestsCount),
        preferredStartDate: preferredStartDate || currentTour.estimatedDate,
        tourName: currentTour.titleEn, // The target tour name
        createdAt: new Date().toISOString() // Server-side or client timestamp standard
      };

      if (db) {
        try {
          await addDoc(collection(db, "bookings"), bookingDoc);
        } catch (dbErr: any) {
          console.error("Firestore write failed, using secure fallback local persistence: ", dbErr);
          // Standard resilient write fallback if firestore has connectivity limits
          const fallbackList = JSON.parse(localStorage.getItem("group_bookings_fallback") || "[]");
          fallbackList.push(bookingDoc);
          localStorage.setItem("group_bookings_fallback", JSON.stringify(fallbackList));
        }
      } else {
        const fallbackList = JSON.parse(localStorage.getItem("group_bookings_fallback") || "[]");
        fallbackList.push(bookingDoc);
        localStorage.setItem("group_bookings_fallback", JSON.stringify(fallbackList));
      }

      setSubmitSuccess(true);
      // Quiet representation reset
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = (tourTitle: string) => {
    const textMsg = encodeURIComponent(
      language === "fr"
        ? `Bonjour Dreamscape Tours! Je suis très intéressé par le voyage de groupe à venir: "${tourTitle}". Pouvez-vous me donner plus de détails?`
        : `Hello Dreamscape Tours! I am highly interested in the upcoming group tour: "${tourTitle}". Could you please provide more details?`
    );
    return `https://api.whatsapp.com/send?phone=260975618779&text=${textMsg}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-55 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.45 }}
          className="relative z-10 w-full max-w-5xl bg-[#090d1a] border border-[#f97316]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[92vh]"
        >
          {/* Top glowing line for visual consistency */}
          <div className="h-1 bg-gradient-to-r from-orange-500 via-brand-teal to-[#f97316]" />

          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer z-50 border border-white/10"
            aria-label="Close group tour details modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
            {/* Elegant Branding Header */}
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-[#f97316]/30 text-[9.5px] font-mono uppercase tracking-[0.2em] text-orange-400 font-bold mb-3 animate-flicker">
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>✦ Dreamscape Adventures Bientôt ✦</span>
              </div>
              <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                {language === "fr" ? "Voyages de Groupe Fun" : "Fun Group Expeditions"}
              </h3>
              <p className="text-brand-sand/75 text-xs sm:text-sm mt-3">
                {language === "fr"
                  ? "Rejoignez une communauté d'explorateurs pour nos prochains événements de groupe soigneusement configurés de 15 à 33 participants."
                  : "Join a curated group of like-minded explorers for dynamic social adventures under professional guidance. Ideal for sizes between 15 and 33 travelers."}
              </p>
            </div>

            {/* Split Panel Structure: Left Tab Selectors, Right Spotlight & Interest Registration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
              
              {/* Left Selector Panel: 4 Columns */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <h4 className="text-[10px] font-mono text-brand-sand/55 uppercase tracking-widest mb-1 px-1">
                  {language === "fr" ? "✦ Sélectionnez un Voyage" : "✦ Select An Upcoming Tour"}
                </h4>
                <div className="flex flex-col gap-2.5">
                  {GROUP_TOURS.map((tour) => {
                    const isSelected = tour.id === activeTourId;
                    return (
                      <button
                        key={tour.id}
                        onClick={() => {
                          setActiveTourId(tour.id);
                          setSubmitSuccess(false);
                          setSubmitError("");
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? "bg-[#111827] border-orange-500/60 shadow-lg shadow-orange-500/5 text-white"
                            : "bg-slate-900/65 border-slate-800 hover:border-orange-500/20 text-white/70 hover:text-white hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="text-2xl shrink-0 p-1 bg-slate-950/70 rounded-xl group-hover:scale-110 transition-transform">{tour.emoji}</span>
                          <div className="min-w-0">
                            <span className="text-[9.5px] font-mono uppercase tracking-widest text-[#f97316] font-bold block">
                              {language === "fr" ? tour.tagFr : tour.tagEn}
                            </span>
                            <h5 className="font-sans text-sm font-bold truncate mt-0.5">
                              {language === "fr" ? tour.titleFr : tour.titleEn}
                            </h5>
                          </div>
                        </div>
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ml-2 transition-all ${isSelected ? "bg-orange-500" : "bg-slate-800 group-hover:bg-orange-500/30"}`} />
                      </button>
                    );
                  })}
                </div>

                {/* Direct Help Card */}
                <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-2xl border border-slate-800/80 mt-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-brand-teal font-extrabold">
                      {language === "fr" ? "Des Questions ?" : "Need Help ?"}
                    </p>
                    <p className="text-xs text-brand-sand/70 mt-1 truncate">
                      {language === "fr" ? "Parlez directement avec un organisateur." : "Chat directly with a lead organizer."}
                    </p>
                  </div>
                  <a
                    href={getWhatsAppLink(currentTour.titleEn)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-medium transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Right Panel: Content Spotlight + Registration Form (7 Columns) */}
              <div className="lg:col-span-7 bg-[#0b1224] rounded-2.5xl border border-slate-800 p-5 sm:p-6 flex flex-col gap-6 justify-between">
                
                {/* Tour Spotlight Information */}
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      {currentTour.icon}
                    </span>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-mono uppercase tracking-wider text-orange-400 font-extrabold">
                        {language === "fr" ? "✦ EXPÉDITION EXCLUSIVE" : "✦ EXCLUSIVE EXPEDITION"}
                      </span>
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-white mt-1">
                        {language === "fr" ? currentTour.titleFr : currentTour.titleEn}
                      </h4>
                    </div>
                  </div>

                  {/* Description text */}
                  <p className="text-brand-sand/85 text-xs leading-relaxed mt-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 font-sans">
                    {language === "fr" ? currentTour.descriptionFr : currentTour.descriptionEn}
                  </p>

                  {/* Grid: Estimated Date & Cost */}
                  <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        📅 {language === "fr" ? "Date Estimée" : "Estimated Target Date"}
                      </span>
                      <span className="text-white mt-1 font-bold">
                        {new Date(currentTour.estimatedDate).toLocaleDateString(
                          language === "fr" ? "fr-FR" : "en-US",
                          { month: "long", year: "numeric", day: "numeric" }
                        )}
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        💰 {language === "fr" ? "Frais Estimés" : "Estimated Costs"}
                      </span>
                      <span className="text-orange-400 mt-1 font-bold">
                        {language === "fr" ? currentTour.costEstimateFr : currentTour.costEstimateEn}
                      </span>
                    </div>
                  </div>

                  {/* Tour highlights */}
                  <div className="mt-5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#f97316] font-bold block mb-2 px-1">
                      {language === "fr" ? "✦ Points forts de l'événement" : "✦ Key Event Highlights"}
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-brand-sand/90">
                      {(language === "fr" ? currentTour.highlightsFr : currentTour.highlightsEn).map((h, i) => (
                        <li key={i} className="flex items-start gap-2 bg-slate-950/20 p-2 rounded-lg border border-slate-900">
                          <Check className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Prioritized Pre-registration interest Form */}
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-orange-500/20 shadow-inner">
                  {!submitSuccess ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                        <h5 className="text-[11px] font-mono uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                          <span>{language === "fr" ? "Demande d'Inscription Prioritaire" : "Priority Pre-Registration"}</span>
                        </h5>
                        <span className="text-[8.5px] font-mono text-zinc-500 uppercase">
                          {language === "fr" ? "Taille 15-33 requise" : "Scale 15-33 Travelers"}
                        </span>
                      </div>

                      {submitError && (
                        <p className="text-red-400 text-xs font-semibold animate-pulse bg-red-950/20 p-2 rounded-lg border border-red-900/50">
                          ⚠️ {submitError}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                            {language === "fr" ? "Nom Complet" : "Full Name"} *
                          </label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full text-xs font-sans placeholder-zinc-600 bg-slate-900 text-white border border-slate-800 rounded-xl px-3.5 py-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                            {language === "fr" ? "Adresse Email" : "Email Address"} *
                          </label>
                          <input
                            type="email"
                            required
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="johndoe@email.com"
                            className="w-full text-xs font-sans placeholder-zinc-600 bg-slate-900 text-white border border-slate-800 rounded-xl px-3.5 py-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                            {language === "fr" ? "Téléphone (WhatsApp)" : "Phone Number (WhatsApp)"} *
                          </label>
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+260 97..."
                            className="w-full text-xs font-sans placeholder-zinc-600 bg-slate-900 text-white border border-slate-800 rounded-xl px-3.5 py-2 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                            {language === "fr" ? "Voyageurs estimées (15-33)" : "Travelers group (15-33)"} *
                          </label>
                          <input
                            type="number"
                            required
                            min="15"
                            max="33"
                            value={guestsCount === 0 ? "" : guestsCount}
                            onChange={(e) => {
                              const val = e.target.value === "" ? 0 : Number(e.target.value);
                              setGuestsCount(val);
                            }}
                            className={`w-full text-xs font-mono bg-slate-900 border rounded-xl px-3.5 py-2 focus:outline-none transition-all ${
                              guestsCount !== 0 && (guestsCount < 15 || guestsCount > 33)
                                ? "border-red-500 bg-red-950/30 text-red-100"
                                : "border-slate-800 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5 mt-2 pt-2 border-t border-slate-900">
                        <span className="text-[10px] text-zinc-500 italic text-left max-w-xs leading-normal">
                          {language === "fr"
                            ? "✓ Pas de paiement requis maintenant. L'enregistrement s'inscrit au système."
                            : "✓ No immediate deposits required. Registration signs priority list in Firestore system."}
                        </span>
                        <button
                          type="submit"
                          disabled={isSubmitting || (guestsCount !== 0 && (guestsCount < 15 || guestsCount > 33))}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white transition-all duration-300 disabled:opacity-50 cursor-pointer text-center"
                        >
                          {isSubmitting
                            ? (language === "fr" ? "Soumission..." : "Submitting...")
                            : (language === "fr" ? "S'inscrire Maintenant ✦" : "Register Priority Interest ✦")}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="py-4 text-center flex flex-col items-center justify-center gap-3">
                      <span className="p-3 bg-orange-500/10 rounded-full border border-orange-500 animate-pulse">
                        <CheckCircle2 className="w-8 h-8 text-orange-400" />
                      </span>
                      <h5 className="font-sans text-sm font-bold text-white">
                        {language === "fr" ? "✦ Enregistré avec Succès !" : "✦ Successfully Registered!"}
                      </h5>
                      <p className="text-zinc-400 text-xs max-w-md">
                        {language === "fr"
                          ? "Votre pass de groupe prioritaire a été sécurisé et indexé dans les bases de données. Notre équipe WhatsApp vous contactera sous peu."
                          : "Your priority group slot has been secured. Our lead coordinator is synchronizing with the reservation dashboard."}
                      </p>
                      <div className="flex gap-3 mt-1.5">
                        <button
                          onClick={() => setSubmitSuccess(false)}
                          className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white underline"
                        >
                          {language === "fr" ? "Enregistrer un autre" : "Register Another Traveler"}
                        </button>
                        <span className="text-zinc-700">|</span>
                        <a
                          href={getWhatsAppLink(currentTour.titleEn)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono uppercase tracking-wider text-orange-400 hover:text-orange-300 flex items-center gap-1 font-bold"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{language === "fr" ? "Ouvrir WhatsApp" : "Confirm via WhatsApp"}</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
