import React, { useState, useEffect, useRef } from "react";
import { X, MapPin, Search, Compass, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";
import { useScrollSync } from "../hooks/useScrollSync";

interface Attraction {
  id: string;
  name: string;
  category: "National Parks" | "Waterfalls" | "Lakes & Rivers" | "Heritage & Activities";
  location: string;
  image: string;
  description: string;
  bestTime: string;
  fact: string;
}

const ATTRACTIONS: Attraction[] = [
  {
    id: "victoria-falls",
    name: "Victoria Falls Adventure Tour Zambia",
    category: "Waterfalls",
    location: "Livingstone, Southern Province",
    image: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery.webp",
    description: "Experience the power of Victoria Falls, one of the Seven Natural Wonders of the World. This unforgettable tour takes you to the heart of Livingstone where you’ll witness the mighty Zambezi River crashing into the gorge below. Enjoy guided tours, breathtaking viewpoints, and optional activities like helicopter flights and river cruises.",
    bestTime: "February to June (High water levels)",
    fact: "Locally named 'The Smoke that Thunders' due to mist rising over 400 meters."
  },
  {
    id: "siavonga-town",
    name: "Siavonga Lake Kariba Weekend Getaway",
    category: "Heritage & Activities",
    location: "Siavonga, Southern Province",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
    description: "Enjoy a relaxing escape to Siavonga, a scenic lakeside town on Lake Kariba. Perfect for weekend trips, offering beautiful views, resorts, and water-based activities just a few hours from Lusaka.",
    bestTime: "All Year Round",
    fact: "Commonly named the 'Riviera of Zambia' due to its scenic tropical weather and resorts."
  },
  {
    id: "lake-kariba",
    name: "Lake Kariba Relaxation & Houseboat Experience",
    category: "Lakes & Rivers",
    location: "Siavonga, Southern Province",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80",
    description: "Unwind on the shores of Lake Kariba with a relaxing getaway featuring houseboat cruises, fishing adventures, and stunning sunsets. Perfect for couples, families, or groups looking for a peaceful escape in Zambia.",
    bestTime: "All Year Round",
    fact: "The local Tonga people believe their river deity, Nyami Nyami, resides beneath the waves."
  },
  {
    id: "south-luangwa",
    name: "South Luangwa National Park Safari Experience",
    category: "National Parks",
    location: "Mfuwe, Eastern Province",
    image: "/images/south luangwa .jpeg",
    description: "Explore South Luangwa National Park, Zambia’s premier wildlife destination known for its incredible walking safaris. Discover elephants, lions, leopards, and diverse birdlife in their natural habitat. This safari offers an authentic African wilderness experience with expert guides and unforgettable game drives.",
    bestTime: "June to October (Dry game tracking season)",
    fact: "Leopards here are uniquely active, leading to supreme nocturnal safari game counts."
  },
  {
    id: "lower-zambezi",
    name: "Lower Zambezi Canoe & Wildlife Safari",
    category: "National Parks",
    location: "Chirundu, Lusaka Province",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80",
    description: "Enjoy a unique safari experience along the Zambezi River with canoeing adventures and close wildlife encounters. Lower Zambezi National Park offers stunning landscapes, abundant wildlife, and peaceful river safaris perfect for travelers seeking both relaxation and adventure.",
    bestTime: "May to November",
    fact: "One of the few parks globally where you can glide past massive elephants in silent canoes."
  },
  {
    id: "blue-lagoon",
    name: "Blue Lagoon National Park Wildlife Tour",
    category: "National Parks",
    location: "Kafue Flats, Lusaka Province",
    image: "https://images.unsplash.com/photo-1444464666168-19d633b86e23?auto=format&fit=crop&w=600&q=80",
    description: "Discover the seasonal beauty of Blue Lagoon National Park on the Kafue Flats. Known for its rich birdlife and floodplain wildlife, this destination offers a peaceful and scenic safari close to Lusaka.",
    bestTime: "December to April",
    fact: "Originally a private cattle ranch, bought by the state due to its spectacular biodiversity."
  },
  {
    id: "shantumbu-village-att",
    name: "Shantumbu Falls Village Cultural Tour Lusaka",
    category: "Heritage & Activities",
    location: "Kafue District, Lusaka Province",
    image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=600&q=80",
    description: "Immerse yourself in authentic Zambian culture with a visit to Shantumbu Village. Engage with local communities, experience traditional lifestyles, and enjoy a meaningful cultural exchange just outside Lusaka.",
    bestTime: "All Year Round",
    fact: "Features ancient local tales of traditional leaders dating back centuries."
  },
  {
    id: "kundalila-falls",
    name: "Kundalila Falls Hiking & Nature Tour",
    category: "Waterfalls",
    location: "Serenje, Central Province",
    image: "/images/kundalila falls1.jpg",
    description: "Enjoy a refreshing escape to Kundalila Falls, ideal for hiking, picnics, and camping. Located in Central Zambia, this destination is perfect for outdoor lovers.",
    bestTime: "May to September",
    fact: "The name 'Kundalila' translate from the Bemba language to mean 'Cooing Dove'."
  },
  {
    id: "mafinga-hills",
    name: "Mafinga Hills Hiking Adventure",
    category: "Heritage & Activities",
    location: "Isoka District, Muchinga Province",
    image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=600&q=80",
    description: "Reach Zambia’s highest point at Mafinga Hills. This adventure offers breathtaking views, cool climates, and a rewarding hiking experience for nature enthusiasts.",
    bestTime: "May to August (Cool dry season)",
    fact: "Feeds the headwaters of the Luangwa River, Zambia's biggest life-bringing river system."
  },
  {
    id: "shiwa-ngandu",
    name: "Shiwa Ng’andu Historic Estate Tour",
    category: "Heritage & Activities",
    location: "Chinsali, Muchinga Province",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80",
    description: "Step into history at Shiwa Ng’andu, a grand estate set against stunning landscapes. This destination offers a blend of history, culture, and scenic beauty.",
    bestTime: "May to September",
    fact: "Features a fully operational historical archive, equine trails, and geothermal waters."
  },
  {
    id: "kasanka-national",
    name: "Kasanka National Park",
    category: "National Parks",
    location: "Northern Province",
    image: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80",
    description: "Famous for the massive annual bat migration where millions of fruit bats converge in a small swamp forest, making it one of the most incredible wildlife sights on Earth.",
    bestTime: "October to December",
    fact: "The bat migration is the largest mammal migration on earth by sheer quantity."
  },
  {
    id: "chishimba-falls",
    name: "Chishimba Falls Cultural & Nature Tour",
    category: "Waterfalls",
    location: "Kasama, Northern Province",
    image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80",
    description: "Explore the stunning Chishimba Falls near Kasama, a series of three waterfalls surrounded by lush forest. This tour combines natural beauty with cultural significance for a unique travel experience.",
    bestTime: "April to August",
    fact: "Traditional elders forbid negative thoughts or actions near the falls to respect local spirits."
  },
  {
    id: "lumangwe-falls",
    name: "Lumangwe Falls Scenic Tour",
    category: "Waterfalls",
    location: "Kawambwa, Northern Province",
    image: "https://images.unsplash.com/photo-1433832597046-4f10e10ac764?auto=format&fit=crop&w=600&q=80",
    description: "Visit Lumangwe Falls, one of Zambia’s most powerful and scenic waterfalls. Often compared to Victoria Falls, this destination offers breathtaking views and a peaceful, uncrowded atmosphere.",
    bestTime: "April to July",
    fact: "The misty spray sustains a tranquil local rainforest on the neighboring riverbanks."
  },
  {
    id: "kalambo-falls",
    name: "Kalambo Falls Adventure Tour",
    category: "Waterfalls",
    location: "Mbala, Northern Province",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80",
    description: "Visit Kalambo Falls, one of Africa’s highest waterfalls located on the Zambia–Tanzania border. This hidden gem offers dramatic views, scenic hikes, and a unique off-the-beaten-path experience for adventure lovers.",
    bestTime: "May to September",
    fact: "An globally vital archaeological site, displaying human activity dating back 300,000 years."
  },
  {
    id: "bangweulu-wetlands",
    name: "Bangweulu Wetlands Shoebill Safari",
    category: "Lakes & Rivers",
    location: "Mpika, Luapula Province",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=600&q=80",
    description: "Explore the unique Bangweulu Wetlands, home to the rare shoebill stork and diverse birdlife. This extraordinary ecosystem offers a one-of-a-kind safari experience ideal for birdwatchers and nature enthusiasts.",
    bestTime: "May to August (Optimal bird tracking)",
    fact: "The place where legendary Scottish missionary & explorer David Livingstone passed away."
  },
  {
    id: "liuwa-plain",
    name: "Liuwa Plain Wildebeest Migration Tour",
    category: "National Parks",
    location: "Kalabo, Western Province",
    image: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=600&q=80",
    description: "Witness one of Africa’s hidden natural spectacles—the Liuwa Plain wildebeest migration. This remote and untouched destination offers dramatic landscapes, rare wildlife sightings, and a truly exclusive safari experience away from the crowds.",
    bestTime: "October to December",
    fact: "Home of Lady Liuwa, the legendary lone lioness who sought companionship among humans."
  },
  {
    id: "sioma-ngwezi",
    name: "Sioma Ngwezi Wilderness Safari",
    category: "National Parks",
    location: "Senanga, Western Province",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    description: "Venture into one of Zambia’s most remote parks, Sioma Ngwezi, for a true wilderness experience. Perfect for adventurous travelers seeking untouched landscapes and authentic safari exploration.",
    bestTime: "July to October",
    fact: "Entirely devoid of commercial crowds, offering total wilderness self-navigation."
  },
  {
    id: "ngonye-falls",
    name: "Ngonye (Sioma) Falls Adventure",
    category: "Waterfalls",
    location: "Sioma, Western Province",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    description: "Discover Ngonye Falls, known for its dramatic rock formations and cascading rapids along the Zambezi River. A perfect stop for scenic exploration and photography.",
    bestTime: "June to September",
    fact: "Water volumes during flood seasons exceed many other waterfalls due to the massive Zambezi width."
  }
];

interface AttractionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AttractionsDrawer({ isOpen, onClose }: AttractionsDrawerProps) {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollSync = useScrollSync(isOpen, drawerRef);

  if (!isOpen) return null;

  const categories = ["All", "National Parks", "Waterfalls", "Lakes & Rivers", "Heritage & Activities"];

  const filteredAttractions = ATTRACTIONS.filter((att) => {
    const matchesCategory = selectedCategory === "All" || att.category === selectedCategory;
    const matchesSearch =
      att.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      id="attractions-drawer-backdrop"
      className="fixed inset-0 z-50 bg-brand-dark/70 backdrop-blur-xs flex justify-end"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "attractions-drawer-backdrop") {
          onClose();
        }
      }}
    >
      <div
        ref={drawerRef}
        onMouseEnter={scrollSync.handleMouseEnter}
        onMouseLeave={scrollSync.handleMouseLeave}
        onTouchStart={scrollSync.handleTouchStart}
        onTouchEnd={scrollSync.handleTouchEnd}
        onTouchCancel={scrollSync.handleTouchCancel}
        className="w-full max-w-lg bg-gradient-to-b from-white to-brand-sand/15 dark:from-brand-medium dark:to-brand-dark h-full shadow-2xl overflow-y-auto overscroll-contain flex flex-col border-l border-brand-sand-dark/20 text-brand-dark dark:text-slate-100"
      >
        {/* Header Block */}
        <div className="p-6 border-b border-brand-sand-dark/20 flex items-center justify-between bg-brand-medium text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/20 border border-brand-teal/30 flex items-center justify-center">
              <Compass className="w-5 h-5 text-brand-gold-light animate-spin-slow" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-tight text-white">
                {language === "fr" ? "Attractions de Zambie" : "Zambian Attractions"}
              </h2>
              <p className="text-[10px] font-mono text-brand-teal uppercase tracking-widest font-black">
                {language === "fr" ? "21 Merveilles Curieuses" : "21 Curated Wilderness Sights"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar & Filter */}
        <div className="p-5 bg-brand-sand/50 dark:bg-brand-medium/40 border-b border-brand-sand-dark/20 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/45 dark:text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === "fr" ? "Rechercher une attraction..." : "Search attractions or provinces..."}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black/20 border border-brand-sand-dark text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-brand-teal"
            />
          </div>

          {/* Categories Horizontal Scrolling */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-brand-teal border-brand-teal text-white shadow-xs"
                    : "bg-white dark:bg-black/10 border-brand-sand-dark hover:bg-brand-sand/60 text-brand-dark/80 dark:text-slate-350"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Attractions List Scroll area */}
        <div className="flex-1 p-5 space-y-5">
          {filteredAttractions.length > 0 ? (
            filteredAttractions.map((att) => (
              <div
                key={att.id}
                className="bg-white dark:bg-brand-medium/30 rounded-2xl border border-brand-sand-dark/40 overflow-hidden shadow-xs hover:border-brand-teal/30 hover:shadow-md transition-all group duration-300"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={att.image}
                    alt={att.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    <span className="bg-brand-dark/80 backdrop-blur-xs text-[10px] font-mono font-bold text-brand-gold-light border border-brand-teal/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {att.category}
                    </span>
                    {att.id === "kundalila-falls" && (
                      <span className="bg-amber-500 text-brand-dark text-[9px] font-mono font-black px-2 py-0.5 rounded-md border border-amber-600 shadow-md animate-pulse">
                        ⛺ PRE-SALE • MARCH 2027 • K3,800
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-brand-dark dark:text-slate-100">
                      {att.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-brand-teal">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{att.location}</span>
                    </div>
                  </div>

                  <p className="text-xs text-brand-dark/75 dark:text-slate-300 leading-relaxed font-mono font-medium">
                    {att.description}
                  </p>

                  <div className="pt-2 border-t border-brand-sand-dark/15 grid grid-cols-2 gap-3 text-[11px]">
                    <div className="space-y-0.5">
                      <span className="text-brand-dark/50 dark:text-slate-400 block font-semibold uppercase tracking-wider text-[9px] font-mono">
                        {language === "fr" ? "Saison Idéale" : "Best Season"}
                      </span>
                      <span className="font-bold text-brand-dark dark:text-slate-200 block truncate">
                        {att.bestTime}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-brand-dark/50 dark:text-slate-400 block font-semibold uppercase tracking-wider text-[9px] font-mono">
                        {language === "fr" ? "Fait Insolite" : "Quick Fact"}
                      </span>
                      <span className="font-semibold text-brand-teal block italic truncate" title={att.fact}>
                        {att.fact}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 whitespace-pre-line text-brand-dark/60">
              <Compass className="w-12 h-12 text-brand-sand-dark mx-auto mb-3" />
              <p className="text-sm font-semibold">{language === "fr" ? "Aucune attraction trouvée." : "No attractions match your request."}</p>
              <p className="text-xs text-brand-dark/40 mt-1">{language === "fr" ? "Essayez de modifier votre recherche ou de vider le filtre." : "Try adjusting your filters or typing other keywords."}</p>
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="p-5 border-t border-brand-sand-dark/20 text-center bg-brand-sand-dark/10">
          <p className="text-[10px] font-mono uppercase tracking-widest text-brand-teal font-extrabold flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-gold" />
            <span>Discover the Wild Beauty</span>
          </p>
        </div>
      </div>
    </div>
  );
}
