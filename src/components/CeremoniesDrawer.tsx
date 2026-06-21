import React, { useEffect, useRef } from "react";
import { X, CheckCircle2, Sparkles, Compass, MapPin, Calendar, HelpCircle } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";
import { useScrollSync } from "../hooks/useScrollSync";

const CEREMONY_PACKAGES = [
  {
    id: "ceremony-kuomboka",
    name: "Kuomboka Traditional Pageant",
    tagline: "Witness the Lozi King cruise the flooded plains in the giant Nalikwanda barge",
    durationDays: 5,
    province: "Western Province (Mongu / Limulunga)",
    season: "April (End of Rainy Season)",
    tribe: "Lozi Tribe",
    features: [
      "VIP access seat on Limulunga landing pavilion",
      "Private river boat chase of the Nalikwanda Royal Barge",
      "Audience with the Royal Litunga's council (Optional)",
      "Charter flight from Lusaka to Mongu and eco-luxe accommodation"
    ],
    symbol: "🛶"
  },
  {
    id: "ceremony-ncwala",
    name: "Nc'wala Thanksgiving Festival",
    tagline: "Taste first harvests and witness epic warrior dances with Chief Mpezeni",
    durationDays: 4,
    province: "Eastern Province (Chipata)",
    season: "Late February",
    tribe: "Ngoni Tribe",
    features: [
      "VIP reservation seating at Mutenguleni arena",
      "Authentic Ngoni host and translation guide",
      "Charter private shuttle flights from Lusaka to Mfuwe",
      "Premium safari extension in South Luangwa (Optional)"
    ],
    symbol: "🐆"
  },
  {
    id: "ceremony-umutomboko",
    name: "Umutomboko Conquest Triumph",
    tagline: "See the sword-slashing royal war dance of Paramount Chief Mwata Kazembe",
    durationDays: 4,
    province: "Luapula Province (Mwansabombwe)",
    season: "Late July",
    tribe: "Lunda Tribe",
    features: [
      "Reserved front-row royal court seating arrangements",
      "Expert folklore and heritage translation guide",
      "Bespoke expedition catering and luxury tent stays",
      "Private regional flight and scenic drives"
    ],
    symbol: "⚔️"
  },
  {
    id: "ceremony-shimunenga",
    name: "Shimunenga Cattle River Crossing",
    tagline: "Commemorate Ila tribal ancestors & massive cattle herds crossing the Kafue flats",
    durationDays: 3,
    province: "Southern Province (Namwala)",
    season: "September / October (Lunar cycle)",
    tribe: "Ila Tribe",
    features: [
      "Cattle parade and river crossing priority boat seating",
      "Guided Ila cultural etiquette briefing and market walk",
      "Riverside camp and stargazing gourmet dinners",
      "Private overland 4x4 cruiser shuttle from Lusaka"
    ],
    symbol: "🐂"
  },
  {
    id: "ceremony-mize",
    name: "Likumbi Lya Mize & Makishi Masques",
    tagline: "Unlock the vibrant ancient masquerades and timber carvings of northwestern clans",
    durationDays: 5,
    province: "Northwestern Province (Zambezi)",
    season: "August",
    tribe: "Luvale Tribe",
    features: [
      "Exclusive entry into the Mize capital assembly base",
      "Full access pass to the sacred Makishi dance circles",
      "Purchase opportunities of custom certified ancestral woodcarvings",
      "Special regional flights and village homestays"
    ],
    symbol: "🎭"
  }
];

interface CeremoniesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCeremony: (ceremonyPkg: any) => void;
}

export default function CeremoniesDrawer({
  isOpen,
  onClose,
  onSelectCeremony
}: CeremoniesDrawerProps) {
  const { t, language } = useLanguage();

  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollSync = useScrollSync(isOpen, drawerRef);

  if (!isOpen) return null;

  return (
    <div
      id="ceremonies-drawer-backdrop"
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
              <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
              <span className="font-serif text-base sm:text-lg font-bold uppercase text-white tracking-wide">
                {language === "fr" ? "Cérémonies Traditionnelles" : "Traditional Ceremonies"}
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
            <div className="mb-6 p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl">
              <h4 className="font-serif text-sm font-bold text-brand-gold uppercase tracking-wider mb-1">
                {language === "fr" ? "Royaumes Sacrés de Zambie" : "Zambia's Royal Kingdoms"}
              </h4>
              <p className="text-xs text-brand-dark/80 dark:text-slate-200 leading-relaxed font-sans">
                {t("ceremoniesSub")}
              </p>
            </div>

            <span className="text-[10px] font-mono uppercase bg-brand-sand border border-brand-sand-dark px-3 py-1 rounded-full text-brand-medium block font-bold mb-4 w-max">
              {language === "fr" ? "Calendrier Culturel de la Dynastie" : "Dynasty Cultural Calendar"}
            </span>

            {/* List of custom ceremonies */}
            <div className="space-y-6">
              {CEREMONY_PACKAGES.map((cmy) => (
                <div
                  key={cmy.id}
                  className="p-5 bg-white/10 dark:bg-black/30 rounded-2xl border border-brand-sand-dark/40 hover:border-brand-teal/40 transition-all hover:shadow-xl hover:shadow-black/5"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-brand-medium/20 border border-brand-teal/20 flex items-center justify-center text-xl shadow-xs">
                        {cmy.symbol}
                      </div>
                      <div>
                        <span className="text-[9px] font-mono font-bold text-brand-teal uppercase tracking-widest block">
                          {cmy.tribe}
                        </span>
                        <h4 className="font-serif text-sm sm:text-base font-bold text-brand-dark dark:text-white leading-tight uppercase">
                          {cmy.name}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[9px] tracking-wide text-brand-gold font-mono font-bold bg-brand-dark px-2.5 py-1 rounded-lg shrink-0">
                      BESPOKE
                    </span>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-brand-dark/75 dark:text-slate-350 italic mt-3 leading-relaxed border-l-2 border-brand-gold/50 pl-3">
                    {cmy.tagline}
                  </p>

                  {/* Metadata coordinates */}
                  <div className="grid grid-cols-2 gap-2.5 my-4 p-3 bg-brand-sand-dark/10 dark:bg-black/20 rounded-xl text-[11px]">
                    <div className="flex items-center gap-1.5 text-brand-dark/70 dark:text-slate-305">
                      <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                      <span className="truncate">{cmy.province}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-brand-dark/70 dark:text-slate-305">
                      <Calendar className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                      <span className="truncate">{cmy.season}</span>
                    </div>
                  </div>

                  {/* Checklist Royal inclusions */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-brand-teal dark:text-brand-teal block font-black">
                      {t("royalItinerary")}
                    </span>
                    <ul className="space-y-1.5">
                      {cmy.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-brand-dark/80 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Request */}
                  <button
                    onClick={() => {
                      onSelectCeremony({
                        id: cmy.id,
                        name: cmy.name,
                        tagline: cmy.tagline,
                        durationDays: cmy.durationDays,
                        pricePerPerson: 0,
                        destinationId: "shantumbu-falls", // generic safety fallback
                        features: cmy.features,
                        itinerary: [
                          {
                            day: 1,
                            title: `${cmy.tribe} Royal Ingress & Welcome`,
                            description: `Settle into premier eco-luxe lodgings or luxury safari tents located near the sacred assembly arenas. Accept traditional gifts and hospitality briefing.`,
                            accommodation: "Bespoke Royal Camps / Safari Tents"
                          },
                          {
                            day: 2,
                            title: "Peak Celebration Day",
                            description: `Secure premium VIP front-row seating at the main pageant arenas. Experience tribal songs, deep legacy rhythms, and sacred ceremonies from beginning to end.`
                          }
                        ]
                      });
                    }}
                    className="mt-4 w-full py-2.5 bg-brand-dark hover:bg-brand-medium text-brand-gold hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Compass className="w-3.5 h-3.5 text-brand-gold" />
                    {t("inquireBespoke")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footprint Disclaimer */}
        <div className="p-6 bg-brand-sand dark:bg-brand-dark border-t border-brand-sand-dark/30">
          <div className="text-[10px] text-brand-dark/60 dark:text-slate-400 font-sans text-center leading-normal">
            ✓ Facilitated under the special tribal hospitality licensing acts of the Republic of Zambia.
          </div>
        </div>

      </div>
    </div>
  );
}
