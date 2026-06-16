import React, { useState } from "react";
import { 
  Image as ImageIcon, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  SlidersHorizontal, 
  Sparkles, 
  MapPin, 
  Heart,
  Eye,
  Maximize2,
  Instagram,
  MessageCircle,
  Share2,
  Send,
  User,
  ExternalLink,
  Play,
  RotateCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GalleryItem {
  id: string;
  title: string;
  category: "Wildlife Safaris" | "Natural Wonders" | "Water Adventures" | "Desert & Lakes";
  location: string;
  mainImage: string;
  images: {
    url: string;
    caption: string;
  }[];
  photographer: string;
  description: string;
  likesCount: number;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "victoria-falls",
    title: "Victoria Falls (Mosi-oa-Tunya)",
    category: "Natural Wonders",
    location: "Livingstone, Zambia",
    mainImage: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery.webp",
    images: [
      {
        url: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery.webp",
        caption: "A magnificent view of the primary water curtain mist rising at dawn."
      },
      {
        url: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery 2.png",
        caption: "The historic Victoria Falls Border Bridge spanning the deep basalt gorge canyon."
      },
      {
        url: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery 3.jpg",
        caption: "Rainbows arching beautifully across the high-velocity mist currents inside the basalt gorge."
      },
      {
        url: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery 4.jpeg",
        caption: "A dramatic wide view of the powerful cascades crashing into the abyss."
      }
    ],
    photographer: "Luyando Banjilb",
    description: "The Smoke that Thunders. Spanning over 1.7 kilometers, witness the majestic, roaring gorge water vapor directly from the boundary bridge.",
    likesCount: 248
  },
  {
    id: "south-luangwa",
    title: "South Luangwa National Park",
    category: "Wildlife Safaris",
    location: "Mfuwe, Eastern Province",
    mainImage: "/images/south luangwa .jpeg",
    images: [
      {
        url: "/images/south luangwa .jpeg",
        caption: "A sleek leopard stalking along the dry Luangwa riverbed banks."
      },
      {
        url: "/images/south luangwa 2.jpg",
        caption: "Thriving giraffes silhouetted against the iconic hot orange dust sunrise."
      },
      {
        url: "/images/south luangwa 3.jpg",
        caption: "The vast acacia woodlands surrounding the pristine walking safari trails."
      }
    ],
    photographer: "Hon. Mfuwe Safari Guide",
    description: "Known globally as the birthplace of raw walking safaris. Home to the rarest African leopards and high-density hippopotamus lagoons.",
    likesCount: 194
  },
  {
    id: "lower-zambezi",
    title: "Lower Zambezi Channels",
    category: "Water Adventures",
    location: "Chirundu, Lusaka Province",
    mainImage: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    images: [
      {
        url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
        caption: "Elephants wading into the tranquil streams near local sandbars."
      },
      {
        url: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80",
        caption: "A serene afternoon canoeing down the silent reflective river channels."
      },
      {
        url: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=1200&q=80",
        caption: "Breathtaking multi-tonal sunset backdrop reflecting off Chirundu's waters."
      }
    ],
    photographer: "Chirundu Ranger",
    description: "A dramatic rift valley where raw wild herds roam peacefully straight to the water's edge. Renowned for premier canoeing and tiger-fishing excursions.",
    likesCount: 156
  },
  {
    id: "shantumbu-falls",
    title: "Shantumbu Falls & Escarpment",
    category: "Natural Wonders",
    location: "Shantumbu Hills, East of Lusaka",
    mainImage: "/images/shantumbufalls1-1.jpg",
    images: [
      {
        url: "/images/shantumbufalls1-1.jpg",
        caption: "The gorgeous primary water stream of Shantumbu Falls cascading into fresh rock pools."
      },
      {
        url: "/images/shantumbufalls2-1.jpg",
        caption: "The rocky hiking terrain and spectacular scenic routes along the quiet Shantumbu Escarpment."
      },
      {
        url: "/images/shantumbufalls3.jpeg",
        caption: "Bathing and taking a relaxing shower directly under the crisp, crystal-clean natural spring."
      },
      {
        url: "/images/shantumbufalls4.jpeg",
        caption: "Gathering at the serene woodland shelters with tasty local picnic snacks and chilled drinks."
      }
    ],
    photographer: "Adventure Trails Zambia",
    description: "Lusaka's elite hidden gateway. Hike across spectacular, ancient steep-ridged trails and stand beneath fresh, natural waterfall plunge pools.",
    likesCount: 112
  },
  {
    id: "kundalila-falls",
    title: "Kundalila Falls",
    category: "Natural Wonders",
    location: "Serenje, Central Province",
    mainImage: "/images/kundalila falls1.jpg",
    images: [
      {
        url: "/images/kundalila falls1.jpg",
        caption: "The majestic Kundalila Falls plunging over 70 meters into a pristine deep pool below."
      },
      {
        url: "/images/kundalila falls 2.jpg",
        caption: "An impressive view of the Kaombe River cascading down the rugged geological formations."
      },
      {
        url: "/images/kundalila falls 3.jpeg",
        caption: "Scenic hiking trails around the falls offering spectacular panoramic views of the Luangwa Valley."
      }
    ],
    photographer: "Serenje Conservator",
    description: "A legendary hidden gem in Serenje. Watch the Kaombe River break over a 70-meter cliff, forming a crystal-clear deep pool ideal for swimming at the base.",
    likesCount: 98
  }
];

const CATEGORIES = ["All", "Wildlife Safaris", "Natural Wonders", "Water Adventures", "Desert & Lakes"] as const;

export default function PlacesGallery() {
  const [activeView, setActiveView] = useState<"prints" | "roulette">("prints");
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>("All");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [likedList, setLikedList] = useState<Record<string, boolean>>({});
  const [likesData, setLikesData] = useState<Record<string, number>>(
    GALLERY_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: item.likesCount }), {})
  );

  // Roulette game states
  const [rouletteResult, setRouletteResult] = useState<GalleryItem>(GALLERY_ITEMS[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteHistory, setRouletteHistory] = useState<string[]>([]);

  const handleSpinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let counter = 0;
    const maxSteps = 15;
    let index = GALLERY_ITEMS.findIndex(item => item.id === rouletteResult.id);

    const spin = () => {
      index = (index + 1) % GALLERY_ITEMS.length;
      setRouletteResult(GALLERY_ITEMS[index]);
      counter++;

      if (counter < maxSteps) {
        const delay = 40 + (counter / maxSteps) * 180;
        setTimeout(spin, delay);
      } else {
        setIsSpinning(false);
        const randomIndex = Math.floor(Math.random() * GALLERY_ITEMS.length);
        const finalDest = GALLERY_ITEMS[randomIndex];
        setRouletteResult(finalDest);
        setRouletteHistory(prev => [finalDest.title, ...prev.slice(0, 3)].filter(Boolean));
      }
    };
    spin();
  };

  const getSecretTip = (id: string) => {
    switch (id) {
      case "victoria-falls":
        return "🤫 Secret Tip: Ask our ranger specifically for the Knife Edge Bridge trail at 7:45 AM to observe double primary rainbows!";
      case "south-luangwa":
        return "🤫 Secret Tip: Leopards are highly nocturnal; request our custom spotlight-equipped night drive safari commencing at 6:30 PM!";
      case "lower-zambezi":
        return "🤫 Secret Tip: Majestic elephants cross the shallow river channels around 2:00 PM. Keep your high zoom lens ready!";
      case "shantumbu-falls":
        return "🤫 Secret Tip: Rely on the local guides of our team, hike into the hidden damp caves right behind the waterfall pool!";
      case "kundalila-falls":
        return "🤫 Secret Tip: Hike the steep rocky trail down to the bottom pool; the microclimate is cool and refreshing, and you can swim safely under the misty spray!";
      default:
        return "🤫 Secret Tip: Ask your dedicated local tracker for high-value insider vantage points before sunrise!";
    }
  };

  const filteredItems = GALLERY_ITEMS.filter(
    (item) => selectedCategory === "All" || item.category === selectedCategory
  );

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = likedList[id];
    setLikedList((prev) => ({ ...prev, [id]: !isLiked }));
    setLikesData((prev) => ({
      ...prev,
      [id]: prev[id] + (isLiked ? -1 : 1)
    }));
  };

  const openLightbox = (item: GalleryItem) => {
    setActiveItem(item);
    setActiveSlideIndex(0);
  };

  const closeLightbox = () => {
    setActiveItem(null);
  };

  const nextSlide = () => {
    if (!activeItem) return;
    setActiveSlideIndex((prev) => (prev + 1) % activeItem.images.length);
  };

  const prevSlide = () => {
    if (!activeItem) return;
    setActiveSlideIndex((prev) => (prev - 1 + activeItem.images.length) % activeItem.images.length);
  };

  return (
    <section id="gallery" className="py-24 bg-brand-sand border-t border-brand-sand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col items-center text-center mb-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-brand-teal font-extrabold uppercase bg-brand-teal/5 px-2.5 py-1 rounded-full">
            <Camera className="w-3.5 h-3.5 text-brand-teal animate-pulse" /> Expedition Media Vault
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-brand-dark uppercase tracking-tight max-w-2xl">
            Aesthetic Media Hub
          </h2>
          <p className="text-xs text-brand-medium/70 max-w-xl">
            Explore high-end high-contrast photography prints and our interactive adventure generator to plan your next Zambian trek.
          </p>
        </div>

        {/* Master Navigation Tablet Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-brand-dark/5 p-1 rounded-2xl border border-brand-sand-dark/80 flex flex-wrap sm:flex-nowrap gap-1">
            <button
              onClick={() => setActiveView("prints")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeView === "prints"
                  ? "bg-brand-dark text-brand-gold shadow-md"
                  : "text-brand-dark/70 hover:bg-white/50"
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Destination Prints
            </button>
            <button
              onClick={() => {
                setActiveView("roulette");
                handleSpinRoulette();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeView === "roulette"
                  ? "bg-brand-dark text-brand-gold shadow-md"
                  : "text-brand-dark/70 hover:bg-white/50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} /> Adventure Roulette
            </button>
          </div>
        </div>

        {/* Dynamic Inner Viewport rendering */}
        <div className="min-h-[400px]">
          {activeView === "prints" && (
            <div className="space-y-10">
              {/* Category Filter bar */}
              <div className="flex flex-wrap items-center gap-2 justify-center bg-white/40 p-2.5 rounded-2xl border border-brand-sand-dark max-w-3xl mx-auto">
                <span className="text-[10px] uppercase font-bold text-brand-dark/50 mr-2 flex items-center gap-1 font-mono">
                  <SlidersHorizontal className="w-3 h-3" /> Filters:
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-brand-dark text-brand-gold shadow-sm"
                        : "bg-white text-brand-dark/70 hover:bg-brand-sand-dark/80 border border-brand-sand-dark/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Original Prints Grid */}
              <div id="gallery-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => {
                    const isLiked = likedList[item.id];
                    return (
                      <motion.div
                        key={item.id}
                        layoutId={`item-card-${item.id}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="group bg-white rounded-3xl overflow-hidden border border-brand-sand-dark shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                      >
                        {/* Photo container */}
                        <div className="relative aspect-video overflow-hidden bg-brand-dark">
                          <img
                            src={item.mainImage}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                          
                          {/* Floating elements */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                          
                          {item.id === "kundalila-falls" ? (
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-15 pointer-events-none flex-wrap gap-2">
                              <span className="bg-brand-dark/80 backdrop-blur-sm text-brand-gold font-bold font-mono text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-lg border border-brand-gold/20">
                                {item.category}
                              </span>
                              <span className="bg-amber-500 text-brand-dark font-black font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg border border-amber-600 shadow-md animate-pulse flex items-center gap-1">
                                ⛺ PRE-SALE • MARCH 2027 • K3,800
                              </span>
                            </div>
                          ) : (
                            <span className="absolute top-4 left-4 inline-block bg-brand-dark/80 backdrop-blur-sm text-brand-gold font-bold font-mono text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-lg border border-brand-gold/20">
                              {item.category}
                            </span>
                          )}

                          <button
                            type="button; button"
                            onClick={(e) => handleLike(item.id, e)}
                            className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                              isLiked 
                                ? "bg-red-500 text-white" 
                                : "bg-brand-dark/40 text-white/90 hover:bg-brand-dark/70"
                            }`}
                            title={isLiked ? "Unlike" : "Heart Place"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current scale-110" : ""}`} />
                          </button>

                          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                            <div className="flex items-center gap-1.5 text-xs font-medium drop-shadow-sm font-sans">
                              <MapPin className="w-3.5 h-3.5 text-brand-gold-light" />
                              <span className="text-[11px] tracking-wide">{item.location}</span>
                            </div>
                            <div className="text-[10px] font-mono text-white/55 flex items-center gap-1 bg-black/45 px-2 py-0.5 rounded-md backdrop-blur-xs">
                              <Eye className="w-3 h-3 text-brand-gold" />
                              {likesData[item.id]} Favs
                            </div>
                          </div>
                        </div>

                        {/* Body Info */}
                        <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                          <div className="space-y-1.5">
                            <h3 className="font-serif text-lg font-bold text-brand-dark group-hover:text-brand-teal transition-colors leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-xs text-brand-medium/70 leading-relaxed line-clamp-3">
                              {item.description}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-brand-sand-dark flex items-center justify-between text-xs text-brand-dark/55">
                            <span className="italic">
                              Photo via <strong className="font-bold text-brand-teal font-sans not-italic text-[11px]">{item.photographer}</strong>
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => openLightbox(item)}
                              className="px-3.5 py-1.5 bg-brand-sand hover:bg-brand-sand-dark hover:text-brand-dark text-brand-dark font-bold text-[10px] uppercase tracking-wider rounded-lg border border-brand-sand-dark transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5" /> Explore Prints
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}



          {activeView === "roulette" && (
            <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-[#0a1424] border border-brand-teal/20 rounded-3xl shadow-2xl relative overflow-hidden text-white">
              {/* Mechanical backdrop decoration */}
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-teal/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                {/* Left Column: Visual Filmstrip Shuffler */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="text-center font-mono text-[10px] tracking-widest text-[#1DB954] font-black uppercase mb-1 bg-white/5 py-1 px-3.5 rounded-full border border-white/5 inline-block self-center">
                    COMPASS GEAR SPIN DIAL
                  </div>

                  {/* Shuffling Dial Canvas Box */}
                  <div className="relative w-full aspect-video sm:aspect-square rounded-3xl overflow-hidden border-2 border-brand-gold/30 shadow-2xl bg-black flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={rouletteResult.id}
                        src={rouletteResult.mainImage}
                        alt={rouletteResult.title}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-all ${
                          isSpinning ? 'brightness-125 saturate-150 scale-105' : 'brightness-100 saturate-100'
                        }`}
                        initial={{ scale: 1.1, filter: "blur(4px)" }}
                        animate={{ scale: 1, filter: "blur(0px)" }}
                        exit={{ scale: 0.95, filter: "blur(6px)" }}
                        transition={{ duration: 0.12 }}
                      />
                    </AnimatePresence>

                    {/* Overlay dynamic states */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

                    {isSpinning && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 backdrop-blur-xs">
                        <div className="w-12 h-12 border-4 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-mono font-black tracking-widest text-brand-teal mt-4 animate-pulse">
                          SHUFFLING EXPLORE VALLEYS...
                        </span>
                      </div>
                    )}

                    {!isSpinning && (
                      <div className="absolute top-4 left-4 bg-brand-gold text-slate-950 font-black font-mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/20">
                        🎯 LANDED PREVIEW
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[10px] font-mono text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-2.5 py-0.5 rounded-full uppercase font-bold mr-2 inline-block">
                        {rouletteResult.category}
                      </span>
                      <h3 className="font-serif text-lg font-black uppercase mt-1 drop-shadow">{rouletteResult.title}</h3>
                    </div>
                  </div>

                  {/* Spin Logs list */}
                  {rouletteHistory.length > 0 && (
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-3">
                      <span className="text-[9px] font-mono font-bold block text-slate-400 mb-1">Spin History:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {rouletteHistory.map((h, i) => (
                          <span key={i} className="text-[8px] font-mono bg-white/5 text-slate-300 py-0.5 px-2 rounded border border-white/5">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Interactive Description & Trigger Wheel Lever */}
                <div className="lg:col-span-7 flex flex-col gap-6 justify-between h-full">
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-black tracking-widest text-brand-gold bg-brand-gold/10 border border-brand-gold/30 px-3 py-1 rounded-full">
                      <Sparkles className="w-3.5 h-3.5" /> Geographics Fortune Generator
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3.5xl font-bold uppercase tracking-tight text-white leading-tight">
                      Destination Roulette
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-xl">
                      Can&apos;t pick your next park itinerary? Trigger our mechanical geographical compass! Land on one of our top 6 certified Zambian natural hotspots to instantly unlock secret field guides.
                    </p>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5">
                      {/* Spin outcome */}
                      <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">Selected Park:</span>
                          <h4 className="font-serif text-lg font-black text-brand-gold leading-snug">
                            {rouletteResult.title}
                          </h4>
                        </div>
                        <span className="text-xs text-white/60 italic font-mono font-light hidden sm:inline-block">
                          Via {rouletteResult.photographer}
                        </span>
                      </div>

                      {/* Insider Fact */}
                      <div>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-teal block mb-1">
                          Insider Field Guidance:
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed bg-brand-teal/5 border border-brand-teal/20 rounded-xl p-3 font-mono italic">
                          {getSecretTip(rouletteResult.id)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lever buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-2">
                    <button
                      onClick={handleSpinRoulette}
                      disabled={isSpinning}
                      className={`flex-1 font-black text-xs uppercase tracking-wider py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg border cursor-pointer ${
                        isSpinning
                          ? "bg-slate-800 text-slate-500 border-slate-700 pointer-events-none"
                          : "bg-gradient-to-r from-brand-gold to-yellow-500 hover:from-yellow-500 hover:to-brand-gold text-slate-950 border-brand-gold/40 hover:scale-102 active:scale-98 shadow-brand-gold/15"
                      }`}
                    >
                      <RotateCcw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
                      {isSpinning ? "Spinning Wheels..." : "🎰 PULL FORTUNE LEVER"}
                    </button>

                    <button
                      onClick={() => {
                        document.getElementById("itinerary-builder")?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-5 py-4 bg-brand-teal text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-teal-400 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:scale-102 active:scale-98"
                    >
                      Plan Trip Here <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Fullscreen Lightbox Portal */}
        <AnimatePresence>
          {activeItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-dark/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 sm:p-6"
            >
              {/* Header inside lightbox */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold font-mono tracking-widest text-brand-gold bg-brand-gold/10 border border-brand-gold/30 px-1.5 py-0.5 rounded">
                      EXPLORE MEDIA
                    </span>
                    <span className="text-[11px] text-white/50 font-mono">
                      {activeSlideIndex + 1} of {activeItem.images.length}
                    </span>
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-semibold tracking-tight">{activeItem.title}</h3>
                </div>

                <button
                  type="button"
                  onClick={closeLightbox}
                  className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 cursor-pointer"
                  title="Close Vault"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Main Slider Panel */}
              <div className="relative w-full max-w-5xl aspect-video md:aspect-[16/10] max-h-[70vh] flex items-center justify-center">
                {/* Previous Slide trigger */}
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 p-2 sm:p-3 bg-brand-dark/60 border border-white/10 hover:bg-white/10 text-white rounded-full transition-all cursor-pointer z-10"
                  title="Previous image"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>

                {/* Animated Slide element */}
                <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-2xl bg-black">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeSlideIndex}
                      src={activeItem.images[activeSlideIndex].url}
                      alt={activeItem.images[activeSlideIndex].caption}
                      referrerPolicy="no-referrer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  {/* Gradient bottom shadow */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 text-white" />
                </div>

                {/* Next Slide trigger */}
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 p-2 sm:p-3 bg-brand-dark/60 border border-white/10 hover:bg-white/10 text-white rounded-full transition-all cursor-pointer z-10"
                  title="Next image"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Slider Meta description / indicator pills */}
              <div className="w-full max-w-5xl mt-6 space-y-4">
                <div className="bg-brand-medium/55 rounded-2xl p-4 border border-white/5 text-white backdrop-blur-sm">
                  <p className="text-xs sm:text-sm font-light text-white/90 leading-relaxed text-center sm:text-left">
                    {activeItem.images[activeSlideIndex].caption}
                  </p>
                </div>

                {/* Micro Thumbnail row indicator */}
                <div className="flex items-center justify-center gap-2">
                  {activeItem.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeSlideIndex === idx 
                          ? "bg-brand-gold w-6" 
                          : "bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
