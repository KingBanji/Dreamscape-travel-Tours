import React, { useState, useRef, useEffect } from "react";
import { 
  X, Play, Pause, FileText, Image as ImageIcon, Film, 
  ChevronLeft, ChevronRight, Eye, CheckSquare, Square, 
  Volume2, VolumeX, Maximize, RotateCcw, Search, Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../lib/LanguageContext";

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "sand" | "dark";
}

const videos = [
  {
    id: "v1",
    title: { en: "Dreamscape Zambia Wilderness", fr: "Dreamscape Zambie Sauvage" },
    description: { en: "An immersive look into raw Zambia safaris, pristine rivers, and ancient plains.", fr: "Un regard immersif sur les safaris bruts de Zambie, les rivières vierges et les plaines anciennes." },
    url: "/videos/dreamscapezambia hero.mp4",
    duration: "1:45"
  },
  {
    id: "v2",
    title: { en: "Shantumbu Falls Showcase - Part 1", fr: "Présentation des Chutes de Shantumbu - Partie 1" },
    description: { en: "Explore the magical cascade, ancient rocks, and misty valleys of Shantumbu.", fr: "Explorez la cascade magique, les roches anciennes et les vallées brumeuses de Shantumbu." },
    url: "/videos/shantumbu promo video 1.mp4",
    duration: "2:10"
  },
  {
    id: "v3",
    title: { en: "Serene Nature Escape - Part 2", fr: "Évasion Naturelle Sereine - Partie 2" },
    description: { en: "Discover peaceful rivers, active safaris, and local luxury accommodations.", fr: "Découvrez des rivières paisibles, des safaris actifs et des hébergements de luxe locaux." },
    url: "/videos/shantumbu promo video 2.mp4",
    duration: "1:55"
  },
  {
    id: "v4",
    title: { en: "Safari & Waterfall Expedition", fr: "Expédition Safari & Chutes" },
    description: { en: "Our official promotional walkthrough highlighting Zambia's best wonders.", fr: "Notre présentation promotionnelle officielle mettant en valeur les meilleures merveilles de la Zambie." },
    url: "/videos/Pink And White Modern Lifestyle Tik Tok Video.mp4",
    duration: "3:02"
  },
  {
    id: "v5",
    title: { en: "Shantumbu Falls Retreat Promo", fr: "Promo Retraite des Chutes de Shantumbu" },
    description: { en: "A showcase of the upcoming luxury retreat near Shantumbu Falls.", fr: "Une présentation de la future retraite de luxe près des chutes de Shantumbu." },
    url: "/videos/download.mp4",
    duration: "1:15"
  }
];

const photos = [
  {
    id: "p1",
    title: { en: "South Luangwa Wilderness", fr: "Désert de South Luangwa" },
    category: "Safari",
    url: "/images/south luangwa .jpeg"
  },
  {
    id: "p2",
    title: { en: "South Luangwa Safari Camp", fr: "Camp de Safari de South Luangwa" },
    category: "Lodges",
    url: "/images/south luangwa 2.jpg"
  },
  {
    id: "p3",
    title: { en: "South Luangwa Wildlife", fr: "Faune de South Luangwa" },
    category: "Safari",
    url: "/images/south luangwa 3.jpg"
  },
  {
    id: "p4",
    title: { en: "Shantumbu Falls Cascade", fr: "Cascade des Chutes de Shantumbu" },
    category: "Waterfalls",
    url: "/images/shantumbufalls1-1.jpg"
  },
  {
    id: "p5",
    title: { en: "Shantumbu Escarpment", fr: "Escarpement de Shantumbu" },
    category: "Safari",
    url: "/images/shantumbufalls2-1.jpg"
  },
  {
    id: "p6",
    title: { en: "Shantumbu Sunset View", fr: "Vue du Coucher de Soleil à Shantumbu" },
    category: "Safari",
    url: "/images/shantumbufalls3.jpeg"
  },
  {
    id: "p7",
    title: { en: "Shantumbu Gorge Walk", fr: "Marche dans les Gorges de Shantumbu" },
    category: "Waterfalls",
    url: "/images/shantumbufalls4.jpeg"
  },
  {
    id: "p8",
    title: { en: "Victoria Falls Mosi-oa-Tunya", fr: "Chutes Victoria Mosi-oa-Tunya" },
    category: "Waterfalls",
    url: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery.webp"
  },
  {
    id: "p9",
    title: { en: "Victoria Falls Rainbow", fr: "Arc-en-ciel des Chutes Victoria" },
    category: "Waterfalls",
    url: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery 2.png"
  },
  {
    id: "p10",
    title: { en: "Victoria Falls Misty View", fr: "Chutes Victoria Brumeuses" },
    category: "Waterfalls",
    url: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery 3.jpg"
  },
  {
    id: "p11",
    title: { en: "Victoria Falls High-Angle", fr: "Chutes Victoria Haute-Altitude" },
    category: "Waterfalls",
    url: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery 4.jpeg"
  },
  {
    id: "p12",
    title: { en: "Kundalila Falls Cascade", fr: "Cascade des Chutes Kundalila" },
    category: "Waterfalls",
    url: "/images/kundalila falls1.jpg"
  },
  {
    id: "p13",
    title: { en: "Kundalila Falls Camping", fr: "Camping aux Chutes Kundalila" },
    category: "Lodges",
    url: "/images/kundalila falls 2.jpg"
  },
  {
    id: "p14",
    title: { en: "Kundalila Falls Pool", fr: "Piscine des Chutes Kundalila" },
    category: "Waterfalls",
    url: "/images/kundalila falls 3.jpeg"
  },
  {
    id: "p15",
    title: { en: "Zambezi River Boat Cruise", fr: "Croisière sur le fleuve Zambèze" },
    category: "Safari",
    url: "/images/boatcruise hero.png"
  }
];

interface BrochurePage {
  title: { en: string; fr: string; };
  content?: { en: string; fr: string; };
  checklist?: { label: { en: string; fr: string; }; id: string; }[];
}

interface Brochure {
  id: string;
  title: { en: string; fr: string; };
  description: { en: string; fr: string; };
  pagesCount: number;
  size: string;
  isChecklist?: boolean;
  pages: BrochurePage[];
}

const brochures: Brochure[] = [
  {
    id: "b1",
    title: { en: "Zambia Wilderness Safari Catalog", fr: "Catalogue de Safari de la Zambie Sauvage" },
    description: { en: "Our official 2026 travel portfolio showcasing luxury lodges, flight networks, and signature paths.", fr: "Notre portefeuille officiel de voyage 2026 présentant nos lodges de luxe, réseaux de vol et itinéraires signatures." },
    pagesCount: 4,
    size: "4.8 MB",
    pages: [
      {
        title: { en: "A Legacy of Exploration", fr: "Un Héritage d'Exploration" },
        content: {
          en: "Welcome to Dreamscape Tours. Zambia is a territory blessed with pristine, wild sanctuaries. From the historic walking trails of South Luangwa to the power of Victoria Falls, we curate intimate, zero-footprint adventures. Our guests receive fully customized expedition designs including private executive flight coordination, expert field ecologists, and access to tribal royalty events.",
          fr: "Bienvenue chez Dreamscape Tours. La Zambie est un territoire béni par des sanctuaires sauvages et intacts. Des sentiers de randonnée historiques de South Luangwa à la puissance des chutes Victoria, nous organisons des aventures intimes à empreinte carbone nulle. Nos invités bénéficient de conceptions d'expédition entièrement personnalisées."
        }
      },
      {
        title: { en: "South Luangwa National Park", fr: "Parc National de South Luangwa" },
        content: {
          en: "South Luangwa is the birthplace of the modern walking safari. Here, you are not merely a spectator in an armored vehicle; you are an active tracker walking alongside conservation guides. Discover massive prides of leopards, breeding herds of elephants, and rare Thornicroft giraffes, returning each evening to five-star eco-villas with open-air views of the Luangwa River.",
          fr: "South Luangwa est le lieu de naissance du safari à pied moderne. Ici, vous n'êtes pas seulement spectateur dans un véhicule blindé; vous êtes un pisteur actif marchant aux côtés de guides de conservation. Découvrez des léopards, des éléphants et des girafes rares, puis rentrez chaque soir dans des éco-villas cinq étoiles."
        }
      },
      {
        title: { en: "Victoria Falls & Mosi-oa-Tunya", fr: "Chutes Victoria et Mosi-oa-Tunya" },
        content: {
          en: "Known as 'The Smoke That Thunders', Mosi-oa-Tunya is a UNESCO World Heritage site and the largest falling curtain of water on Earth. Experience private helicopter rides (the 'Flight of Angels'), sunset river cruises on luxury catamarans, and guided swims on the edge of the abyss at Devil's Pool, hosted by certified elite safety navigators.",
          fr: "Connue sous le nom de 'La Fumée qui Gronde', Mosi-oa-Tunya est un site du patrimoine mondial de l'UNESCO et le plus grand rideau d'eau de la planète. Profitez de vols privés en hélicoptère, de croisières au coucher du soleil et de baignades guidées au bord de l'abîme à la piscine du Diable (Devil's Pool)."
        }
      },
      {
        title: { en: "Remote Falls & Camps", fr: "Chutes Reculées & Camps Sauvages" },
        content: {
          en: "For travelers seeking absolute seclusion, our Northern Province route uncovers Kundalila Falls and regional treasures. Camp on deep quartzite ridges, swim in crystal-clear natural pools beneath star-studded skies, and enjoy bespoke bush dining prepared by a private culinary team using fresh local organic ingredients.",
          fr: "Pour les voyageurs en quête de solitude absolue, notre itinéraire de la province du Nord dévoile les chutes de Kundalila. Campez sur de profondes crêtes de quartzite, nagez dans des bassins naturels cristallins et savourez un dîner de brousse sur mesure préparé par une équipe culinaire privée."
        }
      }
    ]
  },
  {
    id: "b2",
    title: { en: "Ultimate Safari Packing & Gear Guide", fr: "Guide Ultime des Bagages & Équipements" },
    description: { en: "An expert packing advisory outlining medical preparation, clothing specifications, camera setups, and luggage guidelines.", fr: "Un guide d'expert décrivant la préparation médicale, les vêtements appropriés, le matériel photo et les règles de bagages." },
    pagesCount: 3,
    size: "1.2 MB",
    isChecklist: true,
    pages: [
      {
        title: { en: "Safari Apparel Principles", fr: "Principes des Vêtements de Safari" },
        checklist: [
          { label: { en: "Neutral colors (khaki, olive, tan) - avoid bright whites and dark blues/blacks which attract tsetse flies.", fr: "Couleurs neutres (kaki, olive, beige) - évitez le blanc vif et le bleu/noir foncé." }, id: "c1" },
          { label: { en: "Lightweight, breathable long-sleeve shirts (protection from sun and insects).", fr: "Chemises à manches longues légères et respirantes (protection soleil/insectes)." }, id: "c2" },
          { label: { en: "Sturdy, broken-in trail walking boots with ankle support.", fr: "Chaussures de randonnée robustes et déjà portées avec maintien de la cheville." }, id: "c3" },
          { label: { en: "Wide-brimmed sun hat with chin strap and UV polarized sunglasses.", fr: "Chapeau de soleil à larges bords avec jugulaire et lunettes de soleil polarisées." }, id: "c4" },
          { label: { en: "Windbreaker or warm fleece jacket for early morning game drives.", fr: "Coupe-vent ou veste polaire chaude pour les safaris tôt le matin." }, id: "c5" }
        ]
      },
      {
        title: { en: "Photographic & Optical Kit", fr: "Kit Photographique & Optique" },
        checklist: [
          { label: { en: "Binoculars (magnification 8x42 or 10x42 is highly recommended).", fr: "Jumelles (grossissement 8x42 ou 10x42 fortement recommandé)." }, id: "c6" },
          { label: { en: "DSLR or Mirrorless camera body with secondary backup body.", fr: "Boîtier reflex ou hybride avec boîtier de rechange secondaire." }, id: "c7" },
          { label: { en: "Telephoto zoom lens (minimum 300mm to capture distant predators).", fr: "Téléobjectif zoom (minimum 300mm pour capturer les prédateurs éloignés)." }, id: "c8" },
          { label: { en: "Extra high-speed memory cards and dust-proof camera lens wraps.", fr: "Cartes mémoire haute vitesse supplémentaires et étuis anti-poussière." }, id: "c9" },
          { label: { en: "Universal travel plug adapters and multi-port charging power bank.", fr: "Adaptateurs de voyage universels et batterie externe de secours." }, id: "c10" }
        ]
      },
      {
        title: { en: "Health & Field Pharmacy", fr: "Santé & Pharmacie de Terrain" },
        checklist: [
          { label: { en: "Malaria prophylaxis prescriptions as advised by your local travel clinic.", fr: "Prescriptions de prophylaxie antipaludique selon votre clinique de voyage." }, id: "c11" },
          { label: { en: "Insect repellent spray containing DEET or Picaridin.", fr: "Spray répulsif anti-insectes contenant du DEET ou de la Picaridine." }, id: "c12" },
          { label: { en: "Broad-spectrum SPF 50+ sunscreen and soothing after-sun lotion.", fr: "Écran solaire à large spectre SPF 50+ et lotion après-soleil apaisante." }, id: "c13" },
          { label: { en: "Personal first-aid kit containing antihistamines, bandages, and rehydration salts.", fr: "Trousse de premiers soins contenant antihistaminiques, bandages et sels de réhydratation." }, id: "c14" },
          { label: { en: "Yellow Fever vaccination certificate (required if arriving from infected zones).", fr: "Certificat de vaccination contre la fièvre jaune (requis en provenance de zones infectées)." }, id: "c15" }
        ]
      }
    ]
  },
  {
    id: "b3",
    title: { en: "Conservation & Tribal Heritage Guide", fr: "Guide de la Conservation & du Patrimoine Tribal" },
    description: { en: "Read about our sustainable tourism pledge, community development partnerships, and royal permits.", fr: "Découvrez notre engagement en faveur du tourisme durable, nos partenariats communautaires et nos permis royaux." },
    pagesCount: 3,
    size: "2.4 MB",
    pages: [
      {
        title: { en: "The Sustainable Tourism Pledge", fr: "L'Engagement pour le Tourisme Durable" },
        content: {
          en: "At Dreamscape Tours, sustainable travel is not a tagline—it is our primary operating contract. We pledge 12% of all booking revenues directly to community-led anti-poaching scouts in South Luangwa and northern water basin reserves. Our vehicles operate with strict speed limits and route discipline to reduce wildlife stress and prevent vehicle carbon impacts.",
          fr: "Chez Dreamscape Tours, le voyage durable n'est pas un slogan, c'est notre contrat d'exploitation principal. Nous reversons 12 % de tous les revenus de réservation directement aux patrouilles anti-braconnage à South Luangwa et dans les réserves du Nord. Nos véhicules respectent des limites de vitesse strictes."
        }
      },
      {
        title: { en: "Royal Traditional Seating Permits", fr: "Permis de Placement Royal Traditionnel" },
        content: {
          en: "Zambia's royal ceremonies (such as the Kuomboka of the Lozi people or Mutomboko of the Lunda people) are ancient, sovereign cultural practices. Through deep respect and mutual consultation with tribal councils, we facilitate restricted visitor passes, premium private seating, secure local accommodations, and expert guides who interpret every drumming sequence, dance, and symbol.",
          fr: "Les cérémonies royales de Zambie (comme le Kuomboka du peuple Lozi ou le Mutomboko du peuple Lunda) sont des pratiques culturelles anciennes et souveraines. Grâce à un profond respect et à des consultations mutuelles avec les conseils tribaux, nous facilitons des laissez-passer restreints pour les visiteurs."
        }
      },
      {
        title: { en: "Direct Community Uplift", fr: "Élévation Directe de la Communauté" },
        content: {
          en: "Every expedition booked supports permanent rural employment. We hire and train 100% of our lodge staff, hospitality professionals, and field tracking teams directly from communities bordering national parks. This provides viable, long-term alternatives to poaching, and builds local ownership over Zambia's spectacular natural heritage.",
          fr: "Chaque expédition réservée soutient un emploi rural permanent. Nous recrutons et formons 100 % de notre personnel de lodge, professionnels de l'accueil et pisteurs directement au sein des communautés bordant les parcs nationaux, offrant des alternatives viables au braconnage."
        }
      }
    ]
  }
];

export default function MediaGalleryModal({ isOpen, onClose, theme }: MediaGalleryModalProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"videos" | "photos" | "brochures">("videos");
  
  // Photo Lightbox state
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  
  // Video Player state
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Brochure Reader state
  const [activeBrochureId, setActiveBrochureId] = useState<string | null>(null);
  const [brochurePage, setBrochurePage] = useState(0);
  const [checklistChecked, setChecklistChecked] = useState<Record<string, boolean>>({});

  // Photo Category filter
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<string>("All");

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("lightbox-active");
    } else {
      document.body.classList.remove("lightbox-active");
    }
    return () => {
      document.body.classList.remove("lightbox-active");
    };
  }, [isOpen]);

  // Video progress handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 0;
      setCurrentTime(current);
      setProgress(total > 0 ? (current / total) * 100 : 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current && duration > 0) {
      const seekValue = parseFloat(e.target.value);
      const newTime = (seekValue / 100) * duration;
      videoRef.current.currentTime = newTime;
      setProgress(seekValue);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.log("Playback error", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => console.log("Play error", err));
      setIsPlaying(true);
    }
  };

  // Switch active video
  const playVideo = (index: number) => {
    setActiveVideoIndex(index);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
  };

  const closeVideoPlayer = () => {
    setActiveVideoIndex(null);
    setIsPlaying(false);
  };

  // Checklist state handler
  const toggleChecklist = (id: string) => {
    setChecklistChecked(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter photos
  const filteredPhotos = photos.filter(p => {
    const matchesCategory = selectedPhotoCategory === "All" || p.category === selectedPhotoCategory;
    const matchesSearch = p.title[language].toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter videos
  const filteredVideos = videos.filter(v => {
    return v.title[language].toLowerCase().includes(searchQuery.toLowerCase()) || v.description[language].toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter brochures
  const filteredBrochures = brochures.filter(b => {
    return b.title[language].toLowerCase().includes(searchQuery.toLowerCase()) || b.description[language].toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!isOpen) return null;

  const activeBrochure = brochures.find(b => b.id === activeBrochureId);

  return (
    <AnimatePresence>
      <div 
        id="media-gallery-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 overflow-hidden select-none"
      >
        <motion.div
          id="media-gallery-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full max-w-6xl h-[92vh] sm:h-[88vh] bg-brand-dark border border-brand-teal/30 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-brand-dark/95 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-brand-gold text-xl sm:text-2xl">✦</span>
              <div>
                <h2 id="media-gallery-title" className="text-lg sm:text-2xl font-sans font-semibold tracking-tight text-brand-sand">
                  {language === "fr" ? "Galerie & Médiathèque" : "Media & Dynamic Gallery"}
                </h2>
                <p className="text-[10px] sm:text-xs font-mono text-brand-sand/60 tracking-wider">
                  {language === "fr" ? "EXPLOREZ NOS VIDÉOS, PHOTOS ET GUIDES INTERACTIFS" : "EXPLORE OUR CUSTOM VIDEOS, PHOTOS, & INTERACTIVE BROCHURES"}
                </p>
              </div>
            </div>

            <button
              id="media-gallery-close-btn"
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-brand-sand hover:text-brand-gold hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Close media gallery"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation tabs & Search bar */}
          <div className="px-4 sm:px-6 py-3 bg-brand-dark border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 p-1 bg-brand-medium/55 border border-brand-teal/20 rounded-xl max-w-md w-full sm:w-auto">
              <button
                id="tab-btn-videos"
                onClick={() => { setActiveTab("videos"); setActiveBrochureId(null); }}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "videos" 
                    ? "bg-brand-gold text-brand-dark shadow" 
                    : "text-brand-sand/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>{language === "fr" ? "Vidéos" : "Videos"}</span>
              </button>

              <button
                id="tab-btn-photos"
                onClick={() => { setActiveTab("photos"); setActiveBrochureId(null); }}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "photos" 
                    ? "bg-brand-gold text-brand-dark shadow" 
                    : "text-brand-sand/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{language === "fr" ? "Photos" : "Photos"}</span>
              </button>

              <button
                id="tab-btn-brochures"
                onClick={() => { setActiveTab("brochures"); }}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "brochures" 
                    ? "bg-brand-gold text-brand-dark shadow" 
                    : "text-brand-sand/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{language === "fr" ? "Brochures" : "Brochures"}</span>
              </button>
            </div>

            {/* Search input bar */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-sand/40" />
              <input
                id="media-gallery-search"
                type="text"
                placeholder={language === "fr" ? "Rechercher dans la galerie..." : "Search media repository..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-medium/50 text-white placeholder-brand-sand/40 border border-brand-teal/20 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
              />
            </div>
          </div>

          {/* Core Body Section */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#061121]/50 custom-scrollbar">
            
            {/* TAB 1: VIDEOS */}
            {activeTab === "videos" && !activeVideoIndex && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((v, idx) => {
                  const originalIndex = videos.findIndex(vid => vid.id === v.id);
                  return (
                    <motion.div
                      id={`video-card-${v.id}`}
                      key={v.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group bg-brand-dark/75 border border-brand-teal/15 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
                    >
                      <div 
                        onClick={() => playVideo(originalIndex)}
                        className="relative aspect-[16/10] bg-black cursor-pointer overflow-hidden flex items-center justify-center"
                      >
                        {/* Video thumbnail simulated video loop element */}
                        <video 
                          src={v.url} 
                          muted 
                          loop 
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                          onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-transparent opacity-80" />
                        
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[10px] font-mono text-brand-sand tracking-wide">
                          {v.duration}
                        </div>

                        <div className="absolute w-12 h-12 rounded-full bg-brand-gold/90 text-brand-dark flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <Play className="w-5 h-5 fill-brand-dark ml-0.5" />
                        </div>
                      </div>

                      <div className="p-4 flex flex-col gap-1.5">
                        <h3 className="text-sm font-sans font-semibold text-brand-sand group-hover:text-brand-gold transition-colors">
                          {v.title[language]}
                        </h3>
                        <p className="text-xs text-brand-sand/65 line-clamp-2">
                          {v.description[language]}
                        </p>
                      </div>

                      <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-white/5 mt-auto">
                        <span className="text-[9px] font-mono text-brand-teal uppercase tracking-wider">PROMOTIONAL EXPEDITION</span>
                        <button
                          onClick={() => playVideo(originalIndex)}
                          className="text-xs text-brand-gold hover:underline font-bold flex items-center gap-1"
                        >
                          <span>{language === "fr" ? "Regarder" : "Play video"}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredVideos.length === 0 && (
                  <div className="col-span-full py-16 text-center text-brand-sand/55 font-sans">
                    {language === "fr" ? "Aucune vidéo trouvée pour votre recherche." : "No promotional videos found matching your query."}
                  </div>
                )}
              </div>
            )}

            {/* VIDEO PLAYER SUB-VIEW (Expanded View) */}
            {activeTab === "videos" && activeVideoIndex !== null && (
              <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
                <div className="flex-1 flex flex-col bg-black rounded-3xl overflow-hidden border border-brand-teal/20 shadow-2xl relative">
                  <div className="relative aspect-[16/9] w-full flex items-center justify-center group/video">
                    <video
                      id="gallery-video-player"
                      ref={videoRef}
                      src={videos[activeVideoIndex].url}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onClick={togglePlay}
                      className="w-full h-full object-contain cursor-pointer"
                    />

                    {/* Big Overlay Play Icon on Pause */}
                    {!isPlaying && (
                      <div 
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center shadow-2xl scale-105 transition-all">
                          <Play className="w-7 h-7 fill-brand-dark ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Interactive Custom Video Controls panel */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover/video:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progress}
                          onChange={handleSeek}
                          className="w-full accent-brand-gold bg-white/20 h-1 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={togglePlay}
                            className="p-1 text-brand-sand hover:text-brand-gold transition-colors cursor-pointer"
                          >
                            {isPlaying ? <Pause className="w-4 h-4 fill-brand-sand" /> : <Play className="w-4 h-4 fill-brand-sand" />}
                          </button>

                          <button
                            onClick={restartVideo}
                            className="p-1 text-brand-sand hover:text-brand-gold transition-colors cursor-pointer"
                            title="Replay"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={toggleMute}
                            className="p-1 text-brand-sand hover:text-brand-gold transition-colors cursor-pointer"
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>

                          <span className="text-[10px] font-mono text-brand-sand/80">
                            {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60) < 10 ? "0" : "") + Math.floor(currentTime % 60)} / {Math.floor(duration / 60)}:{(Math.floor(duration % 60) < 10 ? "0" : "") + Math.floor(duration % 60)}
                          </span>
                        </div>

                        <button
                          onClick={() => videoRef.current?.requestFullscreen()}
                          className="p-1 text-brand-sand hover:text-brand-gold transition-colors cursor-pointer"
                        >
                          <Maximize className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 bg-brand-dark border-t border-white/5">
                    <h3 className="text-base sm:text-lg font-sans font-bold text-brand-sand">
                      {videos[activeVideoIndex].title[language]}
                    </h3>
                    <p className="text-xs text-brand-sand/65 mt-1.5">
                      {videos[activeVideoIndex].description[language]}
                    </p>
                  </div>
                </div>

                {/* Playlist sidepanel */}
                <div className="w-full lg:w-80 flex flex-col gap-3.5 bg-brand-medium/30 p-4 rounded-3xl border border-brand-teal/15 max-h-[420px] overflow-y-auto custom-scrollbar">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-brand-teal">
                    {language === "fr" ? "PRODUCTIONS MULTIMÉDIAS" : "PROMOTIONAL PLAYLIST"}
                  </h4>
                  {videos.map((vid, idx) => (
                    <div
                      key={vid.id}
                      onClick={() => playVideo(idx)}
                      className={`flex items-start gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                        activeVideoIndex === idx 
                          ? "bg-brand-gold/15 border border-brand-gold/30 text-brand-gold" 
                          : "hover:bg-white/5 border border-transparent text-brand-sand"
                      }`}
                    >
                      <div className="relative w-16 aspect-video bg-black rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <video src={vid.url} className="w-full h-full object-cover opacity-65" muted />
                        {activeVideoIndex === idx ? (
                          <div className="absolute w-6 h-6 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center shadow">
                            <Pause className="w-3 h-3 fill-brand-dark ml-0.5" />
                          </div>
                        ) : (
                          <div className="absolute w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center shadow">
                            <Play className="w-3 h-3 fill-white ml-0.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-semibold truncate">{vid.title[language]}</h5>
                        <p className="text-[10px] text-brand-sand/60 mt-0.5 truncate">{vid.duration} mins</p>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={closeVideoPlayer}
                    className="w-full py-2 border border-brand-teal/30 rounded-xl text-xs font-bold text-brand-teal hover:bg-brand-teal/10 transition-all mt-4"
                  >
                    {language === "fr" ? "Fermer le Lecteur" : "Back to Video List"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PHOTOS */}
            {activeTab === "photos" && (
              <div className="flex flex-col gap-5">
                {/* Photo Categories */}
                <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4 flex-shrink-0">
                  {["All", "Safari", "Waterfalls", "Lodges"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedPhotoCategory(cat)}
                      className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                        selectedPhotoCategory === cat
                          ? "bg-brand-teal text-brand-dark"
                          : "bg-white/5 text-brand-sand/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {cat === "All" ? (language === "fr" ? "Toutes" : "All") : cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredPhotos.map((photo, idx) => {
                    const originalIndex = photos.findIndex(p => p.id === photo.id);
                    return (
                      <motion.div
                        id={`photo-card-${photo.id}`}
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setLightboxImageIndex(originalIndex)}
                        className="group relative aspect-square rounded-2xl bg-brand-medium/45 overflow-hidden border border-brand-teal/10 cursor-pointer shadow-md"
                      >
                        <img
                          src={photo.url}
                          alt={photo.title[language]}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-108"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                          <h4 className="text-xs font-bold text-white tracking-wide truncate">{photo.title[language]}</h4>
                          <span className="text-[9px] font-mono text-brand-gold uppercase tracking-widest mt-1">
                            {photo.category}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredPhotos.length === 0 && (
                    <div className="col-span-full py-16 text-center text-brand-sand/55 font-sans">
                      {language === "fr" ? "Aucune photo trouvée pour votre recherche." : "No pristine photos found matching your query."}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: BROCHURES */}
            {activeTab === "brochures" && !activeBrochureId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBrochures.map((b, idx) => (
                  <motion.div
                    id={`brochure-card-${b.id}`}
                    key={b.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group bg-brand-dark/75 border border-brand-teal/15 rounded-2xl overflow-hidden p-5 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mb-4 group-hover:bg-brand-teal/20 transition-all">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-sans font-semibold text-brand-sand group-hover:text-brand-gold transition-colors">
                        {b.title[language]}
                      </h3>
                      <p className="text-xs text-brand-sand/65 mt-2 line-clamp-3">
                        {b.description[language]}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-brand-sand/50 uppercase tracking-wider">{language === "fr" ? "TAILLE DU FICHIER" : "DIGITAL SIZE"}</span>
                        <span className="text-[11px] font-mono font-bold text-brand-sand/80">{b.size} // {b.pagesCount} {language === "fr" ? "pages" : "pages"}</span>
                      </div>
                      <button
                        onClick={() => { setActiveBrochureId(b.id); setBrochurePage(0); }}
                        className="px-4 py-2 bg-brand-teal/15 hover:bg-brand-teal/30 text-brand-teal rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === "fr" ? "Lire" : "Read online"}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}

                {filteredBrochures.length === 0 && (
                  <div className="col-span-full py-16 text-center text-brand-sand/55 font-sans">
                    {language === "fr" ? "Aucune brochure trouvée pour votre recherche." : "No official brochures found matching your query."}
                  </div>
                )}
              </div>
            )}

            {/* BROCHURE READER PANEL */}
            {activeTab === "brochures" && activeBrochureId && activeBrochure && (
              <div className="max-w-3xl mx-auto flex flex-col gap-5 bg-brand-dark/90 border border-brand-teal/20 rounded-3xl p-4 sm:p-6 shadow-2xl relative min-h-[420px] justify-between">
                
                {/* Header of Brochure Reader */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-brand-gold" />
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-brand-sand">
                        {activeBrochure.title[language]}
                      </h3>
                      <p className="text-[10px] font-mono text-brand-sand/55 uppercase tracking-wider">
                        {language === "fr" ? "GUIDE DE LECTURE NUMÉRIQUE D'EXPÉDITION" : "INTERACTIVE DIGITAL EXPEDITION GUIDE"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveBrochureId(null)}
                    className="text-xs text-brand-sand/70 hover:text-brand-gold border border-white/10 rounded-lg px-2.5 py-1.5 hover:bg-white/5 transition-all"
                  >
                    {language === "fr" ? "Retour" : "Back to catalog"}
                  </button>
                </div>

                {/* Core Content Box with Page Flipping animations */}
                <div className="my-6 min-h-[220px] flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={brochurePage}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-4 text-brand-sand"
                    >
                      {/* Page title */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-base font-serif font-semibold text-brand-gold">
                          {activeBrochure.pages[brochurePage].title[language]}
                        </h4>
                        <span className="text-[10px] font-mono text-brand-sand/55">
                          {language === "fr" ? "Page" : "Page"} {brochurePage + 1} / {activeBrochure.pages.length}
                        </span>
                      </div>

                      {/* Content (Text description or Interactive Checklist) */}
                      {activeBrochure.isChecklist && activeBrochure.pages[brochurePage].checklist ? (
                        <div className="grid grid-cols-1 gap-2.5 mt-2">
                          {activeBrochure.pages[brochurePage].checklist.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => toggleChecklist(item.id)}
                              className="flex items-start gap-3 p-3 bg-brand-medium/20 hover:bg-brand-medium/35 border border-brand-teal/5 rounded-xl cursor-pointer transition-colors"
                            >
                              {checklistChecked[item.id] ? (
                                <CheckSquare className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-brand-sand/50 mt-0.5 flex-shrink-0" />
                              )}
                              <span className={`text-xs select-none ${checklistChecked[item.id] ? "line-through text-brand-sand/40" : "text-brand-sand"}`}>
                                {item.label[language]}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm leading-relaxed text-brand-sand/85 font-sans">
                          {activeBrochure.pages[brochurePage].content?.[language]}
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                  <button
                    onClick={() => setBrochurePage(p => Math.max(0, p - 1))}
                    disabled={brochurePage === 0}
                    className="flex items-center gap-1.5 text-xs text-brand-sand/75 hover:text-brand-gold disabled:opacity-30 disabled:hover:text-brand-sand/75 transition-colors font-bold cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{language === "fr" ? "Précédent" : "Previous Page"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {activeBrochure.pages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setBrochurePage(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          brochurePage === idx ? "bg-brand-gold w-4" : "bg-white/15"
                        }`}
                        aria-label={`Go to page ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setBrochurePage(p => Math.min(activeBrochure.pages.length - 1, p + 1))}
                    disabled={brochurePage === activeBrochure.pages.length - 1}
                    className="flex items-center gap-1.5 text-xs text-brand-sand/75 hover:text-brand-gold disabled:opacity-30 disabled:hover:text-brand-sand/75 transition-colors font-bold cursor-pointer"
                  >
                    <span>{language === "fr" ? "Suivant" : "Next Page"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Footer branding strip */}
          <div className="p-4 bg-brand-dark/95 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-brand-sand/40 tracking-wider flex-shrink-0">
            <span>LUXURY SAFARIS // DIGITAL COLLECTION</span>
            <span className="mt-1.5 sm:mt-0">© 2026 DREAMSCAPE TOURS ZM. ALL RIGHTS RESERVED</span>
          </div>
        </motion.div>
      </div>

      {/* PHOTO LIGHTBOX SUB-VIEW */}
      {lightboxImageIndex !== null && (
        <div 
          id="gallery-lightbox-overlay"
          className="fixed inset-0 z-55 flex items-center justify-center bg-black/95 select-none"
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxImageIndex(null)}
            className="absolute top-5 right-5 z-55 p-2.5 rounded-full bg-black/60 border border-white/15 text-white hover:text-brand-gold transition-colors cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          <button
            onClick={() => setLightboxImageIndex(prev => prev !== null ? (prev - 1 + photos.length) % photos.length : null)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-55 p-3 rounded-full bg-black/60 border border-white/15 text-white hover:text-brand-gold transition-colors cursor-pointer"
            aria-label="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={() => setLightboxImageIndex(prev => prev !== null ? (prev + 1) % photos.length : null)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-55 p-3 rounded-full bg-black/60 border border-white/15 text-white hover:text-brand-gold transition-colors cursor-pointer"
            aria-label="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image & Title container */}
          <div className="flex flex-col items-center max-w-4xl max-h-[85vh] p-4 text-center">
            <motion.img
              key={lightboxImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              src={photos[lightboxImageIndex].url}
              alt={photos[lightboxImageIndex].title[language]}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
            <h4 className="text-white font-sans text-base sm:text-lg font-bold mt-4 tracking-wide">
              {photos[lightboxImageIndex].title[language]}
            </h4>
            <p className="text-brand-gold font-mono text-xs uppercase tracking-widest mt-1">
              Category: {photos[lightboxImageIndex].category}
            </p>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
