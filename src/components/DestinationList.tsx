import React, { useState, useMemo } from "react";
import { Destination } from "../types";
import { MapPin, Calendar, Clock, ArrowRight, Filter, Compass, ChevronLeft, ChevronRight, X } from "lucide-react";
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
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    gallery: string[];
    currentIndex: number;
  } | null>(null);

  const openLightbox = (destName: string, imageUrl: string, gallery: string[] | undefined) => {
    const imagesList = gallery && gallery.length > 0 ? gallery : [imageUrl];
    const initialIndex = imagesList.indexOf(imageUrl);
    setLightboxImage({
      url: imageUrl,
      title: destName,
      gallery: imagesList,
      currentIndex: initialIndex >= 0 ? initialIndex : 0,
    });
  };

  React.useEffect(() => {
    if (lightboxImage) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.body.classList.add("lightbox-active");
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setLightboxImage(null);
        } else if (e.key === "ArrowLeft") {
          const newIdx = (lightboxImage.currentIndex - 1 + lightboxImage.gallery.length) % lightboxImage.gallery.length;
          setLightboxImage((prev) =>
            prev
              ? {
                  ...prev,
                  currentIndex: newIdx,
                  url: prev.gallery[newIdx],
                }
              : null
          );
        } else if (e.key === "ArrowRight") {
          const newIdx = (lightboxImage.currentIndex + 1) % lightboxImage.gallery.length;
          setLightboxImage((prev) =>
            prev
              ? {
                  ...prev,
                  currentIndex: newIdx,
                  url: prev.gallery[newIdx],
                }
              : null
          );
        }
      };
      
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.classList.remove("lightbox-active");
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [lightboxImage]);

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
              {filteredDestinations.map((dest, index) => {
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
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                      layout: { type: "spring", stiffness: 180, damping: 25 }
                    }}
                    key={dest.id}
                    onClick={() => onSelectDestination(dest)}
                    className="liquid-glass-card overflow-hidden hover:shadow-2xl hover:border-white/50 group flex flex-col h-full transform transition-all duration-500 hover:-translate-y-2 hover:bg-white/60 cursor-pointer"
                  >
                    {/* Card Cover with floating action tags layout */}
                    <div className="relative h-64 overflow-hidden z-0">
                      {/* Interactive slide transition - zoom handler is attached strictly to the image */}
                      <img
                        src={displayImg}
                        alt={dest.name}
                        referrerPolicy="no-referrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(dest.name, displayImg, dest.gallery);
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out cursor-zoom-in"
                        key={`${dest.id}-${currentImgIdx}`}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/10 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90 pointer-events-none" />

                      {/* Floating prev/next overlay buttons for gallery cycling */}
                      {hasGallery && (
                        <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-25 pointer-events-none">
                          <button
                            onClick={handlePrevImage}
                            className="w-8 h-8 rounded-full bg-brand-dark/80 hover:bg-brand-dark text-brand-gold flex items-center justify-center border border-brand-teal/20 shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95 pointer-events-auto"
                            title="Previous Image"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="w-8 h-8 rounded-full bg-brand-dark/80 hover:bg-brand-dark text-brand-gold flex items-center justify-center border border-brand-teal/20 shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95 pointer-events-auto"
                            title="Next Image"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Multi-image indicators tracking indicator line dots */}
                      {hasGallery && dest.gallery && (
                        <div className="absolute top-4 right-4 z-30 flex gap-1.5 bg-brand-dark/40 backdrop-blur-xs py-1 px-2 rounded-full border border-white/10">
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
                      <div className="absolute top-4 left-4 z-30 flex flex-col gap-1.5 items-start">
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

                      <div className="absolute bottom-4 left-4 right-4 z-30 flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono tracking-widest text-[#2dd4bf] uppercase font-bold">
                            {dest.category} // LOC-{dest.id.slice(0, 3).toUpperCase()}
                          </span>
                          <h3 className="font-serif text-lg font-bold text-white tracking-tight drop-shadow-md">
                            {dest.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDestination(dest);
                          }}
                          className="bg-brand-gold hover:bg-brand-gold-light active:scale-95 text-brand-dark font-black text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1 transition-all cursor-pointer z-30"
                        >
                          {dest.id === "kundalila-falls" 
                            ? "Reserve" 
                            : (language === "fr" ? "Réserver" : "Book Now")}
                        </button>
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
                        <span className="text-[9px] text-brand-teal uppercase font-bold tracking-wider mr-1">Rating</span>
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

      {/* Lightbox / Zoom Overlay */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex flex-col justify-center items-center p-4 select-none overflow-hidden"
          onClick={() => setLightboxImage(null)}
        >
          {/* Exclusive, prominent floating Close button on top-right, away from images and hero elements */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 z-[10000] p-3 rounded-full bg-white/10 hover:bg-[#f97316]/20 text-white hover:text-[#f97316] transition-all cursor-pointer border border-white/10 shadow-lg hover:scale-105 active:scale-95"
            aria-label="Close image preview"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main image zoom container */}
          <div 
            className="relative max-w-4xl w-full max-h-[70vh] flex items-center justify-center group"
            onClick={(e) => e.stopPropagation()} // Stop propagation so clicking inside doesn't close lightbox
          >
            {lightboxImage.gallery.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIdx = (lightboxImage.currentIndex - 1 + lightboxImage.gallery.length) % lightboxImage.gallery.length;
                  setLightboxImage(prev => prev ? {
                    ...prev,
                    currentIndex: newIdx,
                    url: prev.gallery[newIdx]
                  } : null);
                }}
                className="absolute left-4 z-50 p-3 rounded-full bg-black/70 hover:bg-black/90 hover:text-brand-gold text-white border border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border border-white/10 transition-all duration-300"
            />

            {lightboxImage.gallery.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIdx = (lightboxImage.currentIndex + 1) % lightboxImage.gallery.length;
                  setLightboxImage(prev => prev ? {
                    ...prev,
                    currentIndex: newIdx,
                    url: prev.gallery[newIdx]
                  } : null);
                }}
                className="absolute right-4 z-50 p-3 rounded-full bg-black/70 hover:bg-black/90 hover:text-brand-gold text-white border border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
                aria-label="Next Image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Caption & Indicator dot navigation */}
          <div className="mt-6 flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {lightboxImage.gallery.length > 1 && (
              <div className="flex gap-2 bg-black/40 backdrop-blur-xs py-1.5 px-3.5 rounded-full border border-white/10">
                {lightboxImage.gallery.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setLightboxImage(prev => prev ? {
                        ...prev,
                        currentIndex: index,
                        url: prev.gallery[index]
                      } : null);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      lightboxImage.currentIndex === index ? "w-6 bg-brand-gold" : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                    title={`View slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
            <span className="text-[10px] text-white/50 font-mono tracking-wider">
              {language === "fr" ? "IMAGE" : "IMAGE"} {lightboxImage.currentIndex + 1} OF {lightboxImage.gallery.length}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
