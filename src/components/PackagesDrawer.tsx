import React, { useEffect, useRef, useState } from "react";
import { X, CheckCircle2, Clock, MapPin, Compass, Sparkles, Star, ChevronDown, ChevronUp, AlertCircle, Calendar, Users } from "lucide-react";
import { TourPackage, Destination } from "../types";
import { useCurrency } from "../lib/CurrencyContext";
import { useLanguage } from "../lib/LanguageContext";
import { useScrollSync } from "../hooks/useScrollSync";

interface PackagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  packages: TourPackage[];
  destinations: Destination[];
  onSelectPackage: (pkg: TourPackage) => void;
}

export default function PackagesDrawer({
  isOpen,
  onClose,
  packages,
  destinations,
  onSelectPackage
}: PackagesDrawerProps) {
  const { formatAmount } = useCurrency();
  const { t, language } = useLanguage();
  const [expandedBlueprint, setExpandedBlueprint] = useState<string | null>("kundalila-falls-camping-tour");

  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollSync = useScrollSync(isOpen, drawerRef);

  if (!isOpen) return null;

  return (
    <div
      id="packages-drawer-backdrop"
      className="fixed inset-0 z-50 bg-brand-dark/70 backdrop-blur-sm flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Drawer box sliding */}
      <div 
        ref={drawerRef}
        onMouseEnter={scrollSync.handleMouseEnter}
        onMouseLeave={scrollSync.handleMouseLeave}
        onTouchStart={scrollSync.handleTouchStart}
        onTouchEnd={scrollSync.handleTouchEnd}
        onTouchCancel={scrollSync.handleTouchCancel}
        className="w-full max-w-lg glass-popup h-full shadow-2xl overflow-y-auto overscroll-contain flex flex-col justify-between border-l border-brand-sand-dark/20 text-brand-dark dark:text-slate-100"
      >
        
        <div>
          {/* Header banner */}
          <div className="bg-brand-dark/90 backdrop-blur-sm p-6 text-brand-sand flex items-center justify-between border-b border-brand-sand-dark/20">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-teal animate-none" />
              <span className="font-serif text-base sm:text-lg font-bold uppercase text-white tracking-wide">
                {language === "fr" ? "Circuits Signatures" : "Signature Tours"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-brand-medium text-brand-sand transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Subheader introduction and info description */}
          <div className="p-6">
            <div className="mb-6 p-4 bg-brand-teal/10 border border-brand-teal/20 rounded-2xl">
              <h4 className="font-serif text-sm font-bold text-brand-teal uppercase tracking-wider mb-1">
                {language === "fr" ? "Expéditions Prêtes à l'Emploi" : "Pre-Designed Expeditions"}
              </h4>
              <p className="text-xs text-brand-dark/80 dark:text-slate-200 leading-relaxed font-sans">
                {language === "fr" 
                  ? "Des itinéraires de prestige sculptés par des guides résidents pour harmoniser pistage de la faune sauvage, transferts et évasion totale."
                  : "Ready-made routes engineered by local scouts to balance wildlife tracking frequency, flight connections, and premier luxury lodges."}
              </p>
            </div>

            <span className="text-[10px] font-mono uppercase bg-brand-sand border border-brand-sand-dark px-3 py-1 rounded-full text-brand-medium block font-bold mb-4 w-max">
              {language === "fr" ? "Formules d'Exception en Zambie" : "Zambia Specialist Choice"}
            </span>

            {/* List of packages */}
            <div className="space-y-6">
              {packages.map((pkg) => {
                const associatedDest = destinations.find((d) => d.id === pkg.destinationId);
                return (
                  <div
                    key={pkg.id}
                    onClick={() => onSelectPackage(pkg)}
                    className={`p-5 bg-white/10 dark:bg-black/30 rounded-2xl border transition-all hover:shadow-xl hover:shadow-black/5 cursor-pointer hover:scale-[1.01] ${
                      pkg.isFeatured
                        ? "border-brand-gold bg-gradient-to-b from-brand-gold/5 to-transparent ring-[1.2px] ring-brand-gold/40"
                        : "border-brand-sand-dark/40 hover:border-brand-teal"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-brand-teal uppercase tracking-widest block">
                          {associatedDest ? associatedDest.name.split(" (")[0] : "Zambia"}
                        </span>
                        <h4 className="font-serif text-sm sm:text-base font-bold text-brand-dark dark:text-white leading-tight uppercase flex flex-wrap items-center gap-1.5 pt-0.5">
                          {pkg.name}
                          {pkg.isFeatured && <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold shrink-0" />}
                          {pkg.isPreSale && (
                            <span className="text-[9px] font-mono font-black bg-amber-500 text-brand-dark px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse inline-flex items-center gap-1">
                              ⛺ {language === "fr" ? "PRÉ-VENTE" : "PRE-SALE"}
                            </span>
                          )}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold font-mono text-brand-teal block">
                          {formatAmount(pkg.pricePerPerson)}
                        </span>
                        <span className="text-[9px] text-brand-dark/50 dark:text-slate-400 font-mono block">
                          / {language === "fr" ? "personne" : "person"}
                        </span>
                      </div>
                    </div>

                    {/* Duration / Tagline info */}
                    <div className="my-3 flex items-center gap-1.5 bg-brand-medium/10 text-brand-medium dark:text-brand-sand py-1 px-3 rounded-xl text-[10px] font-bold tracking-wide uppercase max-w-max">
                      <Clock className="w-3.5 h-3.5 text-brand-gold" />
                      {pkg.durationDays} {language === "fr" ? "Jours" : "Days"} / {pkg.durationDays - 1} {language === "fr" ? "Nuits" : "Nights"}
                    </div>

                    {pkg.isPreSale && (
                      <div className="my-3 p-3.5 bg-amber-500/10 dark:bg-amber-500/5 rounded-xl border border-amber-500/30 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-black uppercase text-[10px] tracking-wide font-mono">
                          <Compass className="w-3.5 h-3.5 shrink-0" />
                          {language === "fr" ? "DÉTAILS DE LA PRÉ-VENTE CAMPING" : "CAMPING PRE-SALE DETAILS :"}
                        </div>
                        <p className="text-xs text-brand-dark/85 dark:text-slate-200 mt-1 leading-normal font-medium">
                          {language === "fr" 
                            ? `Ce forfait exclusif de camping sera disponible à partir de ${pkg.preSaleAvailability || "Mars 2027"}.` 
                            : `This exclusive camping tour is available starting ${pkg.preSaleAvailability || "March 2027"}.`}
                        </p>
                        <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-amber-500/20 text-[11px] font-mono font-medium">
                          <span className="text-brand-dark/75 dark:text-slate-300">
                            📢 {language === "fr" ? "Pré-réservation :" : "Pre-booking :"}{" "}
                            <strong className="text-brand-teal font-extrabold text-xs">{formatAmount(pkg.preSalePriceZMW || 1400)}</strong>
                          </span>
                          <span className="text-brand-dark/75 dark:text-slate-350">
                            ⏳ {language === "fr" ? "Après le 6 mars :" : "After March 6 :"}{" "}
                            <strong className="text-amber-600 dark:text-amber-400 font-extrabold text-xs">{formatAmount(pkg.regularPriceZMW || 3800)}</strong>
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-brand-dark/75 dark:text-slate-350 italic mt-2.5 leading-relaxed border-l-2 border-brand-teal/50 pl-3">
                      {pkg.tagline}
                    </p>

                    {/* Features checklist */}
                    <div className="space-y-2 mt-4">
                      <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-brand-teal dark:text-brand-teal block font-black">
                        {language === "fr" ? "INCLUS DANS LA FORMULE / PRESTATIONS :" : "CONCIERGE DELIVERABLES // INCLUDED :"}
                      </span>
                      <ul className="space-y-1.5">
                        {pkg.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-brand-dark/85 dark:text-slate-300 leading-normal">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* What to carry list */}
                    {pkg.whatToCarry && pkg.whatToCarry.length > 0 && (
                      <div className="space-y-2 mt-4 p-3.5 bg-brand-sand/50 dark:bg-slate-800/40 rounded-xl border border-brand-sand-dark/30 dark:border-slate-700/50">
                        <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-amber-700 dark:text-amber-400 block font-black flex items-center gap-1.5">
                          🎒 {language === "fr" ? "QUE PRENDRE AVEC VOUS :" : "RECOMMENDED GEAR & PACKING CHECKLIST :"}
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {pkg.whatToCarry.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-brand-dark/85 dark:text-slate-200 leading-normal font-medium bg-white/70 dark:bg-slate-950/40 py-1 px-2.5 rounded-lg border border-brand-sand-dark/20 dark:border-slate-800/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Interactive high fidelity JSON spec expansion */}
                    {(pkg.tourId || pkg.policy || pkg.detailedIncludes || pkg.detailedItinerary) && (
                      <div className="mt-4 border border-brand-teal/20 dark:border-brand-teal/40 rounded-xl overflow-hidden bg-white/40 dark:bg-slate-950/20">
                        <button
                          type="button"
                          onClick={() => setExpandedBlueprint(expandedBlueprint === pkg.id ? null : pkg.id)}
                          className="w-full flex items-center justify-between p-3 text-xs font-bold font-mono text-brand-dark dark:text-brand-gold bg-brand-teal/10 dark:bg-brand-teal/5 hover:bg-brand-teal/20 transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-left uppercase">
                            ⛺ {language === "fr" ? "Afficher le plan détaillé" : "Show Detailed Camping Blueprint"}
                          </span>
                          {expandedBlueprint === pkg.id ? <ChevronUp className="w-4 h-4 text-brand-teal shrink-0" /> : <ChevronDown className="w-4 h-4 text-brand-teal shrink-0" />}
                        </button>
                        
                        {expandedBlueprint === pkg.id && (
                          <div className="p-3.5 space-y-4 text-xs select-none border-t border-brand-teal/10">
                            {/* Campaign Status Info */}
                            {pkg.status && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-brand-dark/5 dark:bg-slate-950/40 rounded-lg text-[10.5px] font-mono border border-brand-sand-dark/20 leading-relaxed text-brand-dark/90 dark:text-slate-350">
                                <div>
                                  <span className="text-brand-dark/50 dark:text-slate-400 font-bold block uppercase text-[8px] tracking-wide">Campaign Status :</span>
                                  <span className="text-brand-teal font-black">{pkg.status}</span>
                                </div>
                                <div>
                                  <span className="text-brand-dark/50 dark:text-slate-400 font-bold block uppercase text-[8px] tracking-wide">Launch Target :</span>
                                  <span className="text-brand-dark dark:text-white font-black">{pkg.launchDate}</span>
                                </div>
                                <div className="col-span-full pt-1.5 border-t border-brand-sand-dark/10">
                                  <span className="text-brand-dark/50 dark:text-slate-400 font-bold block uppercase text-[8px] tracking-wide">Unlock Pre-requisite :</span>
                                  <span className="text-amber-700 dark:text-amber-400 font-bold">{pkg.unlockCondition}</span>
                                </div>
                              </div>
                            )}

                            {/* Group Limits & Minimums & Deposit Info */}
                            {pkg.pricingDetails && (
                              <div className="p-2.5 bg-brand-dark/5 dark:bg-slate-950/40 rounded-lg text-[10.5px] border border-brand-sand-dark/20 space-y-1.5 font-mono text-brand-dark/90 dark:text-slate-350">
                                <span className="text-brand-dark/50 dark:text-slate-400 font-bold block uppercase text-[8px] tracking-wide">Deposit & Dynamic Group Restrictions :</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                                  <span>Standard: <strong className="text-brand-teal font-bold">{formatAmount(pkg.pricingDetails.standard)}</strong></span>
                                  <span>Deposit: <strong className="text-amber-600 dark:text-amber-400 font-bold">{formatAmount(pkg.pricingDetails.deposit)} ({pkg.pricingDetails.depositPercent}%)</strong></span>
                                  <span>Min Travelers: <strong className="font-bold">{pkg.pricingDetails.minGroup} visitors</strong></span>
                                  <span>Max Travelers: <strong className="font-bold">{pkg.pricingDetails.maxGroup} visitors</strong></span>
                                </div>
                              </div>
                            )}

                            {/* Time-by-Time itinerary schedule */}
                            {pkg.detailedItinerary && (
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-brand-teal block font-black">
                                  ⏱️ Accurate Hour-by-Hour Action Schedule :
                                </span>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                  {pkg.detailedItinerary.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 p-2 bg-brand-dark/5 dark:bg-slate-950/30 rounded border border-brand-sand-dark/10 text-[10.5px]">
                                      <span className="font-mono bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal px-1.5 py-0.5 rounded text-[10px] h-max shrink-0 font-bold leading-none">
                                        Day {item.day} @ {item.time}
                                      </span>
                                      <span className="text-brand-dark/95 dark:text-slate-200 leading-normal font-medium">{item.activity}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Detailed Includes & Excludes */}
                            {(pkg.detailedIncludes || pkg.detailedExcludes) && (
                              <div className="grid grid-cols-1 gap-3.5 pt-1">
                                {pkg.detailedIncludes && (
                                  <div className="space-y-1.5">
                                    <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-brand-teal block font-black">
                                      ✅ Premium Included Concierge Services :
                                    </span>
                                    <ul className="space-y-1.5 bg-brand-teal/5 p-2 rounded-lg border border-brand-teal/10">
                                      {pkg.detailedIncludes.map((inc, idx) => (
                                        <li key={idx} className="flex gap-1.5 text-[10.5px] items-start text-brand-dark/95 dark:text-slate-200 leading-normal">
                                          <span className="text-brand-teal font-extrabold shrink-0">✓</span>
                                          <span>{inc}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {pkg.detailedExcludes && (
                                  <div className="space-y-1.5">
                                    <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-rose-500 block font-black">
                                      ✕ Exclusions & Not Compromised Services :
                                    </span>
                                    <ul className="space-y-1.5 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                                      {pkg.detailedExcludes.map((exc, idx) => (
                                        <li key={idx} className="flex gap-1.5 text-[10.5px] items-start text-brand-dark/95 dark:text-slate-200 leading-normal">
                                          <span className="text-rose-500 font-extrabold shrink-0">✕</span>
                                          <span>{exc}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Policies (Cancellation, Weather, Physical fitness) */}
                            {pkg.policy && (
                              <div className="space-y-2 p-3 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[10.5px] leading-relaxed text-brand-dark dark:text-slate-300">
                                <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-indigo-500 block font-black">
                                  🛡️ STRICT TOUR POLICIES & COMPLIANCE :
                                </span>
                                <div className="space-y-1.5 mt-1 font-medium text-brand-dark/90 dark:text-slate-350">
                                  <p><strong>Cancellation:</strong> {pkg.policy.cancellation}</p>
                                  <p><strong>Weather Conditions:</strong> {pkg.policy.weather}</p>
                                  <p><strong>Fitness Level Recom.:</strong> {pkg.policy.fitness}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Select and Book */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPackage(pkg);
                      }}
                      className={`mt-4 w-full py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm ${
                        pkg.isFeatured
                          ? "bg-brand-gold hover:bg-brand-gold-light text-brand-dark"
                          : "bg-brand-dark hover:bg-brand-medium text-brand-gold hover:text-white"
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      {language === "fr" ? "Réserver ce Forfait" : "Configure Flight & Book Now"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic footer assurance banner */}
        <div className="p-6 bg-brand-sand dark:bg-brand-dark border-t border-brand-sand-dark/30">
          <div className="text-[10px] text-brand-dark/60 dark:text-slate-400 font-sans text-center leading-normal">
            ✨ Free rescheduling dates assurance outstanding up under policy restrictions.
          </div>
        </div>

      </div>
    </div>
  );
}
