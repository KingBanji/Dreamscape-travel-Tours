import React, { useState, useMemo } from "react";
import { Destination } from "../types";
import { Star, MapPin, Calendar, Clock, ArrowRight, Sparkles, Filter, Compass, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCurrency } from "../lib/CurrencyContext";
import { useLanguage } from "../lib/LanguageContext";
import LiveWeatherWidget from "./LiveWeatherWidget";

interface DestinationListProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onCustomizeDestination: (dest: Destination) => void;
  searchFilter: { destinationId: string; activityLevel: string; guestCount: number } | null;
  onClearSearch: () => void;
}

export default function DestinationList({
  destinations,
  onSelectDestination,
  onCustomizeDestination,
  searchFilter,
  onClearSearch
}: DestinationListProps) {
  const { formatAmount } = useCurrency();
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});

  // Auto-cycle gallery images every 4 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageIndices((prev) => {
        const updated = { ...prev };
        destinations.forEach((dest) => {
          if (dest.gallery && dest.gallery.length > 1) {
            const currentIdx = prev[dest.id] || 0;
            updated[dest.id] = (currentIdx + 1) % dest.gallery.length;
          }
        });
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [destinations]);

  const categories = useMemo(() => {
    const list = new Set(destinations.map((d) => d.category));
    return ["All", ...Array.from(list)];
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      // Category match
      if (selectedCategory !== "All" && dest.category !== selectedCategory) {
        return false;
      }
      // Hero search override match
      if (searchFilter) {
        if (searchFilter.destinationId && dest.id !== searchFilter.destinationId) {
          return false;
        }
        if (searchFilter.activityLevel && dest.activityLevel !== searchFilter.activityLevel) {
          return false;
        }
      }
      return true;
    });
  }, [destinations, selectedCategory, searchFilter]);

  return (
    <section id="destinations" className="py-24 bg-brand-sand transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-brand-gold" />
            <span className="text-xs font-mono uppercase tracking-widest text-brand-teal font-extrabold">
              Zambian Explorations
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-dark uppercase tracking-tight">
            Curated Wilderness Gems
          </h2>
          <div className="h-0.5 w-16 bg-brand-teal mx-auto mt-4 mb-3" />
          <p className="text-brand-dark/70 text-sm sm:text-base">
            Handpicked safari ecosystems and extreme adventure reserves selected for breathtaking sights, premier tracking density, and safe access.
          </p>
        </div>

        {/* Filter Toolbar / Category Selector */}
        <div className="flex flex-col items-center gap-6 mb-12">
          {searchFilter ? (
            <div className="flex flex-wrap items-center justify-center gap-3 bg-brand-sand-dark/60 border border-brand-teal/20 py-2.5 px-5 rounded-2xl max-w-2xl">
              <span className="text-xs font-mono text-brand-medium">
                Active Filter Applied from Search:
              </span>
              <span className="bg-brand-dark text-brand-gold text-xs px-2.5 py-1 rounded-full font-semibold">
                {searchFilter.destinationId
                  ? destinations.find((d) => d.id === searchFilter.destinationId)?.name
                  : "All Destinations"}
              </span>
              {searchFilter.activityLevel && (
                <span className="bg-brand-dark text-brand-gold text-xs px-2.5 py-1 rounded-full font-semibold">
                  {searchFilter.activityLevel} Activity
                </span>
              )}
              <button
                onClick={onClearSearch}
                className="text-xs text-brand-gold hover:text-brand-dark underline font-bold transition-all ml-2 hover:no-underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5 bg-brand-sand-dark/40 p-1.5 rounded-2xl border border-brand-sand-dark">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-brand-dark text-brand-gold shadow-md"
                      : "text-brand-medium/80 hover:text-brand-dark hover:bg-brand-sand-dark"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Destinations Grid with staggered entry animations */}
        {filteredDestinations.length === 0 ? (
          <div className="text-center py-16 bg-brand-sand-dark/20 rounded-3xl border border-dashed border-brand-teal/20 max-w-xl mx-auto">
            <Compass className="w-12 h-12 text-brand-teal/40 mx-auto mb-4" />
            <span className="block font-serif text-lg font-bold text-brand-dark">No custom matches found</span>
            <span className="block text-sm text-brand-dark/60 mt-1">
              Try choosing different search options or click clear to explore all gems.
            </span>
            <button
              onClick={onClearSearch}
              className="mt-4 px-5 py-2 bg-brand-dark text-brand-gold rounded-full text-xs font-bold transition-transform active:scale-95"
            >
              Show All Wilds
            </button>
          </div>
        ) : (
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredDestinations.map((dest) => {
                const currentImgIdx = activeImageIndices[dest.id] || 0;
                const hasGallery = dest.gallery && dest.gallery.length > 1;
                const displayImg = hasGallery && dest.gallery ? dest.gallery[currentImgIdx] : dest.image;

                const handlePrevImage = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (!dest.gallery) return;
                  const len = dest.gallery.length;
                  setActiveImageIndices((prev) => ({
                    ...prev,
                    [dest.id]: (currentImgIdx - 1 + len) % len
                  }));
                };

                const handleNextImage = (e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (!dest.gallery) return;
                  const len = dest.gallery.length;
                  setActiveImageIndices((prev) => ({
                    ...prev,
                    [dest.id]: (currentImgIdx + 1) % len
                  }));
                };

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    key={dest.id}
                    onClick={() => onSelectDestination(dest)}
                    className="liquid-glass-card overflow-hidden hover:shadow-2xl hover:border-white/50 group flex flex-col h-full transform transition-all duration-500 hover:-translate-y-2 hover:bg-white/60 cursor-pointer"
                  >
                    {/* Card Cover with floating action tags layout */}
                    <div className="relative h-64 overflow-hidden z-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/10 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90" />
                      
                      {/* Interactive slide transition */}
                      <img
                        src={displayImg}
                        alt={dest.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        key={`${dest.id}-${currentImgIdx}`}
                      />

                      {/* Floating prev/next overlay buttons for gallery cycling */}
                      {hasGallery && (
                        <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-25">
                          <button
                            onClick={handlePrevImage}
                            className="w-8 h-8 rounded-full bg-brand-dark/80 hover:bg-brand-dark text-brand-gold flex items-center justify-center border border-brand-teal/20 shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
                            title="Previous Image"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="w-8 h-8 rounded-full bg-brand-dark/80 hover:bg-brand-dark text-brand-gold flex items-center justify-center border border-brand-teal/20 shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
                            title="Next Image"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Multi-image indicators tracking indicator line dots */}
                      {hasGallery && dest.gallery && (
                        <div className="absolute top-4 right-4 z-20 flex gap-1.5 bg-brand-dark/40 backdrop-blur-xs py-1 px-2 rounded-full border border-white/10">
                          {dest.gallery.map((_, index) => (
                            <div
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageIndices((prev) => ({
                                  ...prev,
                                  [dest.id]: index
                                }));
                              }}
                              className={`h-1.5 cursor-pointer transition-all duration-300 rounded-full ${
                                currentImgIdx === index ? "w-4 bg-brand-gold" : "w-1.5 bg-brand-sand/60"
                              }`}
                              title={`View slide ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Floating Season Tag & live weather widget */}
                      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start">
                        <span className="bg-brand-dark/95 backdrop-blur-sm shadow-md text-[10px] font-mono font-bold text-brand-gold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-brand-teal/20">
                          <Calendar className="w-3 h-3 text-brand-gold" /> {dest.bestSeason}
                        </span>
                        {dest.id === "kundalila-falls" && (
                          <span className="bg-amber-500 text-brand-dark shadow-md text-[9px] font-mono font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-amber-600 animate-pulse">
                            ⛺ PRE-SALE • MARCH 2027 • K3,800
                          </span>
                        )}
                        <LiveWeatherWidget destinationId={dest.id} />
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono tracking-widest text-[#2dd4bf] uppercase font-bold">
                            {dest.category} // LOC-{dest.id.slice(0, 3).toUpperCase()}
                          </span>
                          <h3 className="font-serif text-lg font-bold text-white tracking-tight drop-shadow-md">
                            {dest.name}
                          </h3>
                        </div>
                        <div className="bg-brand-gold hover:bg-brand-gold-light active:scale-95 text-brand-dark font-black text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 transition-all">
                          {language === "fr" ? "Réserver" : "Book Now"}
                        </div>
                      </div>
                    </div>

                  {/* Card Content Descriptions & Stats items */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-xs font-mono text-brand-teal justify-between">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                          <span className="font-medium text-brand-medium">{dest.location}</span>
                        </div>
                        <span className="text-[9px] text-brand-teal/70 font-mono tracking-wider font-semibold">
                          [ LAT DEG OUTPOST ]
                        </span>
                      </div>

                      <p className="text-brand-dark/70 text-sm leading-relaxed line-clamp-3 mb-5">
                        {dest.shortDescription}
                      </p>

                      {/* Highlights quick tags */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {dest.keyFeatures.slice(0, 2).map((feature, idx) => (
                          <span
                            key={idx}
                            className="bg-brand-sand text-[10px] font-semibold text-brand-medium px-2.5 py-1 rounded-lg border border-brand-sand-dark"
                          >
                            ✓ {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer Actions Row - Book button and custom design button */}
                    <div className="pt-4 border-t border-brand-sand-dark/80 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs font-mono text-brand-dark font-bold bg-brand-sand px-2.5 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                        <span>{dest.rating}</span>
                        <span className="text-[10px] font-light text-brand-dark/60">
                          ({dest.reviewCount})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCustomizeDestination(dest);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-teal/10 hover:bg-brand-teal text-brand-dark hover:text-white transition-all cursor-pointer"
                          title="Open Custom interactive builder with this destination"
                        >
                          Modify
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDestination(dest);
                          }}
                          className="px-3.5 py-1.5 bg-brand-dark hover:bg-brand-medium text-brand-gold hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer group-hover:bg-brand-teal group-hover:text-white"
                        >
                          View Plan <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
