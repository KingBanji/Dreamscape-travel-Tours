import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Destination, Booking } from "../types";
import { 
  X, Calendar, Users, ClipboardCheck, Trash2, Printer, Compass, 
  Sparkles, Receipt, CheckSquare, Square, Sun, CloudRain, Droplets, Wind, 
  ShieldAlert, HelpCircle, ChevronDown, ChevronUp, CheckCircle, Briefcase,
  Award, Trophy, Zap, Shield, Gift, Ticket
} from "lucide-react";
import { useCurrency } from "../lib/CurrencyContext";
import { useScrollSync } from "../hooks/useScrollSync";
import { useAuthAndData } from "../lib/FirebaseContext";
import SafariCalendar from "./SafariCalendar";

interface ChecklistItem {
  id: string;
  item: string;
  reason: string;
}

interface ClimateProfile {
  title: string;
  bgClass: string;
  borderClass: string;
  iconColor: string;
  icon: any;
  tempAndHumidity: string;
  description: string;
  items: ChecklistItem[];
}

const getClimateProfile = (destId: string): ClimateProfile => {
  const normId = (destId || "").toLowerCase();
  
  if (normId.includes("shantumbu") || normId.includes("victoria")) {
    return {
      title: "Mist/Spray & Escarpment Wet Trail",
      bgClass: "bg-teal-50/70 border-teal-150 text-teal-950",
      borderClass: "border-teal-100",
      iconColor: "text-brand-teal",
      icon: Droplets,
      tempAndHumidity: "Humid Spray Zone • Slippery Basalt Rocks",
      description: "Atmosphere heavily saturated with continuous gorge mist. High sun-glare exposure, requiring stable water traction on basalt paths.",
      items: [
        { id: "poncho", item: "Waterproof Rain Poncho/Jacket", reason: "Shields against immersive waterfall mist" },
        { id: "shoes", item: "Non-slip Sandal/Water Shoes", reason: "Gain extra safe traction on slick basalt escarpments" },
        { id: "drybag", item: "Waterproof Phone/Gear pouch", reason: "Shields optics and electronics against structural moisture" },
        { id: "sunscreen", item: "Eco-safe sunscreen", reason: "UV protection from water reflections without harming riverbeds" },
        { id: "drywear", item: "Spare dry apparel items", reason: "Quick post-hike change after deep gorge trail walks" }
      ]
    };
  }
  
  if (normId.includes("luangwa") || normId.includes("kafue")) {
    return {
      title: "Dry Savannah & Nocturnal Bushveld",
      bgClass: "bg-amber-50/70 border-amber-150 text-amber-950",
      borderClass: "border-amber-100",
      iconColor: "text-amber-700",
      icon: Sun,
      tempAndHumidity: "Tropical Arid Day • Cold Winds at Dawn/Night",
      description: "Prone to abrupt low temperatures after sunset. High concentrations of malaria vectors and mosquitoes around dry savanna shrub basins.",
      items: [
        { id: "deet", item: "Mosquito repellent (DEET)", reason: "Protects against aggressive savanna and river mosquitoes" },
        { id: "fleece", item: "Warm Windbreaker/Fleece Jacket", reason: "Crucial for chilling morning/night safari drives in open vehicles" },
        { id: "khaki", item: "Neutral Earth/Khaki clothing", reason: "Evades drawing tsetse flies which love dark colors and blue hued jeans" },
        { id: "binos", item: "Optics Compact Binoculars", reason: "Safely view high-elevation species and walking big cats" },
        { id: "boots", item: "Closed-toe Hiking/Bush Boots", reason: "Shields feet across off-trail walking brush expeditions" }
      ]
    };
  }
  
  if (normId.includes("zambezi") || normId.includes("tanganyika")) {
    return {
      title: "Open Water Riverine & Lake Glares",
      bgClass: "bg-sky-50/70 border-sky-150 text-sky-950",
      borderClass: "border-sky-100",
      iconColor: "text-sky-600",
      icon: Wind,
      tempAndHumidity: "Aggressive Mirror Glares • Steady Lake Winds",
      description: "High exposure to secondary UV reflections off wide water sheets. Gusty winds on speedboat transits.",
      items: [
        { id: "rashguard", item: "Light Long-Sleeve UV Sunshirt", reason: "Prevents immediate shoulder solar-burn on canvas boats" },
        { id: "hat", item: "Wide-Brim Safari Hat with strap", reason: "Tethers headwear during rapid open-river transits" },
        { id: "glass", item: "Polarized Sun glasses", reason: "Cuts down painful light reflections off open lakes" },
        { id: "drybag_boat", item: "Floating dry gear bag", reason: "Encapsulates important items during canoe trips" },
        { id: "gnat", item: "Riverbed Bug Spray", reason: "Keeps riverside biting gnats at arm's length" }
      ]
    };
  }

  // Fallback
  return {
    title: "General Zambia Wilderness Trail",
    bgClass: "bg-stone-50/70 border-stone-150 text-stone-950",
    borderClass: "border-stone-100",
    iconColor: "text-stone-600",
    icon: Compass,
    tempAndHumidity: "Sunny Daytime • Sub-tropical Savannas",
    description: "Diverse trails requiring versatile protection elements against sun, dust, and native insects.",
    items: [
      { id: "buglotion", item: "Multi-pest Deterrent Spray/Cream", reason: "Safeguards against sandflies and bush insects" },
      { id: "waterflask", item: "Reusable Filtering Water Flask", reason: "Offers emergency sterile hydration and cooling" },
      { id: "torch", item: "Compact Night Pathway Flashlight", reason: "Treads safely during campsite evening walkabouts" },
      { id: "aidkit", item: "Personal Small Travel Aid Kit", reason: "Supports scratch disinfection and quick trail dressings" }
    ]
  };
};

interface TierInfo {
  name: string;
  badge: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  pointsRequired: number;
  perks: string[];
  nextPerk: string;
  icon: any;
  nextTierBookings: number | null;
  nextTierName: string;
}

const getTierInfo = (completedCount: number): TierInfo => {
  if (completedCount === 0) {
    return {
      name: "Sable Scout",
      badge: "🦌 Sable Scout (Bronze)",
      bgColor: "bg-amber-500/5 dark:bg-amber-500/10",
      borderColor: "border-amber-600/30",
      textColor: "text-amber-700 dark:text-amber-400 font-bold",
      iconColor: "text-amber-600 dark:text-amber-450",
      pointsRequired: 1250,
      perks: [
        "Earn 1,250 Explorer Points on every confirmed trip",
        "Official Dreamscape Digital Passport access",
        "Weekly newsletter with priority off-peak safari rates"
      ],
      nextPerk: "Complimentary sundowner riverboat cocktail (unlocked at Silver)",
      icon: Award,
      nextTierBookings: 1,
      nextTierName: "Savanna Pioneer"
    };
  } else if (completedCount === 1) {
    return {
      name: "Savanna Pioneer",
      badge: "🥈 Savanna Pioneer (Silver)",
      bgColor: "bg-slate-400/5 dark:bg-slate-400/10",
      borderColor: "border-slate-450/30",
      textColor: "text-slate-600 dark:text-slate-300 font-bold",
      iconColor: "text-slate-500 dark:text-slate-350",
      pointsRequired: 2500,
      perks: [
        "Earn 1.1x multiplier on checklist task completeness",
        "Free double-walled thermal safari flask at checkout",
        "Complimentary guided canopy tour of Victoria Falls"
      ],
      nextPerk: "VIP priority lounge invitation at Livingstone Airport (unlocked at Gold)",
      icon: Shield,
      nextTierBookings: 2,
      nextTierName: "Luangwa Ranger"
    };
  } else if (completedCount >= 2 && completedCount <= 3) {
    return {
      name: "Luangwa Ranger",
      badge: "🥇 Luangwa Ranger (Gold)",
      bgColor: "bg-yellow-500/5 dark:bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      textColor: "text-yellow-600 dark:text-brand-gold font-bold",
      iconColor: "text-yellow-600 dark:text-brand-gold",
      pointsRequired: 5000,
      perks: [
        "1.2x multiplier on all checklist points",
        "Priority premium open-top safari car booking guarantees",
        "Complimentary evening bush dinner under the Baobab stars",
        "VIP lounge invitations & express airport transfers"
      ],
      nextPerk: "Exclusive private light aircraft transfers & luxury suite upgrades (unlocked at Platinum)",
      icon: Trophy,
      nextTierBookings: 4,
      nextTierName: "Imperial Explorer"
    };
  } else {
    return {
      name: "Imperial Explorer",
      badge: "👑 Imperial Explorer (Platinum Royal)",
      bgColor: "bg-teal-500/5 dark:bg-teal-500/10",
      borderColor: "border-teal-500/30",
      textColor: "text-teal-600 dark:text-brand-teal font-bold",
      iconColor: "text-teal-600 dark:text-brand-teal",
      pointsRequired: 5000, // already reached
      perks: [
        "Private light aircraft transit upgrade guarantees",
        "Personalized private lead wildlife tracker assigned per tour",
        "Complimentary champagne welcome baskets on arrival",
        "Strict 100% deposit protection and zero cancel fees"
      ],
      nextPerk: "You have unlocked the highest possible Zambian travel honor!",
      icon: Zap,
      nextTierBookings: null,
      nextTierName: ""
    };
  }
};

interface MyTripsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  destinations: Destination[];
  onCancelBooking: (id: string) => void;
}

export default function MyTripsDrawer({
  isOpen,
  onClose,
  bookings,
  destinations,
  onCancelBooking
}: MyTripsDrawerProps) {
  const { formatAmount } = useCurrency();
  const { user } = useAuthAndData();
  const [showBenefits, setShowBenefits] = useState(false);

  const completedCount = bookings.filter((b) => b.status === "confirmed").length;
  const pointsPerBooking = 1250;
  const totalPoints = completedCount * pointsPerBooking;
  const tier = getTierInfo(completedCount);

  // Compute progress percent to next high level tier
  let progressPercent = 0;
  if (completedCount === 0) {
    progressPercent = 0;
  } else if (completedCount === 1) {
    progressPercent = 50; // Progressing from 1 to 2
  } else if (completedCount === 2) {
    progressPercent = 50; // Progressing to 4 (e.g. 2 of 4)
  } else if (completedCount === 3) {
    progressPercent = 75; // 3 of 4
  } else {
    progressPercent = 100;
  }

  const [expandedChecklists, setExpandedChecklists] = useState<Record<string, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<string, boolean>>>({});
  const [selectedPassBooking, setSelectedPassBooking] = useState<Booking | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollSync = useScrollSync(isOpen, drawerRef);

  const toggleChecklist = (bookingId: string) => {
    setExpandedChecklists((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const toggleItemCheck = (bookingId: string, itemId: string) => {
    setCheckedItems((prev) => {
      const currentBookingData = prev[bookingId] || {};
      return {
        ...prev,
        [bookingId]: {
          ...currentBookingData,
          [itemId]: !currentBookingData[itemId]
        }
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div id="my-trips-drawer-backdrop" className="fixed inset-0 z-50 bg-brand-dark/70 backdrop-blur-sm flex justify-end">
      {/* Drawer box with sliding effect */}
      <div 
        ref={drawerRef}
        onMouseEnter={scrollSync.handleMouseEnter}
        onMouseLeave={scrollSync.handleMouseLeave}
        onTouchStart={scrollSync.handleTouchStart}
        onTouchEnd={scrollSync.handleTouchEnd}
        onTouchCancel={scrollSync.handleTouchCancel}
        className="w-full max-w-md glass-popup h-full shadow-2xl overflow-y-auto overscroll-contain flex flex-col justify-between border-l border-brand-sand-dark/20 text-brand-dark dark:text-slate-100"
      >
        
        {/* Header container */}
        <div>
          <div className="bg-brand-dark/85 backdrop-blur-sm p-6 text-brand-sand flex items-center justify-between border-b border-brand-sand-dark/20">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-gold" />
              <span className="font-serif text-base sm:text-lg font-bold uppercase text-white tracking-wide">
                Your Wilderness Logs
              </span>
            </div>
            <button 
              onClick={onClose} 
              className="p-1 rounded-lg hover:bg-brand-medium text-brand-sand transition-colors cursor-pointer"
              aria-label="Close My Trips wilderness logs"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Guidelines notes */}
          <div className="p-6">
            <span className="text-[10px] font-mono uppercase bg-brand-sand border border-brand-sand-dark px-3 py-1 rounded-full text-brand-medium block font-bold mb-4 w-max">
              Persisted Safaris Dashboard
            </span>

            {/* ─── LOYALTY BADGE & EXPLORER POINTS SECTION ─── */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-brand-dark/10 to-brand-dark/5 dark:from-black/40 dark:to-black/20 border border-brand-sand-dark/40 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-teal/5 rounded-full blur-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-brand-gold/5 rounded-full blur-lg pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between mb-3.5 pb-2 border-b border-brand-sand-dark/30">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-teal flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 animate-pulse text-brand-gold" /> Explorer Passport Club
                </span>
                {user ? (
                  <span className="text-[9px] font-sans text-brand-dark/60 dark:text-slate-400 italic font-medium">
                    ID: {user.displayName?.split(" ")[0] || "Explorer"}-{(user.uid || "").substring(0, 4).toUpperCase()}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-brand-dark/50 dark:text-slate-400 uppercase tracking-wide">
                    Anonymous Safari
                  </span>
                )}
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-3 text-left">
                {/* Active Badge */}
                <div className={`p-3 rounded-xl border ${tier.borderColor} ${tier.bgColor} flex flex-col justify-between transition-all duration-300`}>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-brand-dark/50 dark:text-slate-400/80 block mb-1">
                      Active Badge
                    </span>
                    <h3 className={`font-serif text-sm sm:text-base font-extrabold uppercase leading-tight ${tier.textColor}`}>
                      {tier.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 pt-1">
                    <tier.icon className={`w-5 h-5 ${tier.iconColor}`} />
                    <span className="text-[9px] font-bold font-mono tracking-wider dark:text-white/85 uppercase">
                      {tier.badge.split(" ")[0]}
                    </span>
                  </div>
                </div>

                {/* Explorer Points */}
                <div className="p-3 rounded-xl border border-brand-sand-dark/60 dark:border-slate-800 bg-white/40 dark:bg-black/30 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-brand-dark/50 dark:text-slate-400/80 block mb-1">
                      Explorer Points
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-extrabold text-brand-gold block leading-none">
                      {totalPoints.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-brand-dark/60 dark:text-slate-400 mt-2.5 block font-bold">
                    {completedCount} completed {completedCount === 1 ? "tour" : "tours"}
                  </span>
                </div>
              </div>

              {/* Progress to next tier slider */}
              <div className="relative z-10 mt-4 bg-brand-dark/5 dark:bg-black/20 p-2.5 rounded-xl border border-brand-sand-dark/20 dark:border-slate-800">
                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-brand-dark/60 dark:text-slate-350 uppercase mb-1">
                  <span>Tier Elevation Progress</span>
                  <span className="font-mono">{progressPercent}%</span>
                </div>
                <div className="h-1.5 bg-brand-sand-dark/40 dark:bg-slate-700/60 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-teal to-brand-gold transition-all duration-300" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {tier.nextTierBookings !== null ? (
                  <p className="text-[9px] text-brand-dark/60 dark:text-slate-400 mt-2 leading-relaxed font-sans">
                    Achieve <strong className="text-brand-teal font-mono">{tier.nextTierBookings - completedCount}</strong> more confirmed booking to elevate to <strong className="text-[#f97316] font-bold">{tier.nextTierName}</strong> status!
                  </p>
                ) : (
                  <p className="text-[9px] text-brand-teal dark:text-brand-teal mt-2 leading-relaxed font-sans flex items-center gap-1.5 font-semibold">
                    <Award className="w-3.5 h-3.5 animate-pulse text-brand-gold" /> Sovereign luxury level attained!
                  </p>
                )}
              </div>

              {/* Collapsible Perks Section */}
              <div className="relative z-10 mt-3 pt-2.5 border-t border-brand-sand-dark/30">
                <button
                  type="button"
                  onClick={() => setShowBenefits(!showBenefits)}
                  className="w-full flex items-center justify-between text-left text-[10px] font-bold text-brand-dark/70 dark:text-slate-300 hover:text-brand-teal dark:hover:text-brand-teal transition-colors cursor-pointer select-none"
                  aria-label="Toggle explorer passport club active privileges and perks overview"
                >
                  <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
                    <Gift className="w-3.5 h-3.5 text-brand-gold animate-bounce" /> Active Club Privileges
                  </span>
                  {showBenefits ? (
                    <ChevronUp className="w-3.5 h-3.5 text-brand-dark/65 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-brand-dark/65 dark:text-slate-400" />
                  )}
                </button>

                {showBenefits && (
                  <div className="mt-2.5 p-3 rounded-xl bg-neutral-50/50 dark:bg-black/40 border border-brand-sand-dark/20 dark:border-slate-800 space-y-2.5 text-xs">
                    <ul className="space-y-1.5">
                      {tier.perks.map((perk, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[10px] text-brand-dark/85 dark:text-slate-350 leading-relaxed font-sans">
                          <span className="text-brand-teal font-bold mt-0.5 shrink-0">✓</span>
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t border-brand-sand-dark/30 text-[9px] text-brand-dark/50 dark:text-slate-400 leading-normal">
                      <span className="font-bold text-brand-gold uppercase tracking-wider">Next Tier Milestone:</span> <span className="italic">"{tier.nextPerk}"</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-16 border border-brand-sand-dark border-dashed rounded-3xl p-6">
                <Compass className="w-12 h-12 text-brand-teal/40 mx-auto mb-3 animate-spin" style={{ animationDuration: "15s" }} />
                <h4 className="font-serif text-sm font-bold text-brand-dark uppercase tracking-tight">
                  No expeditions recorded
                </h4>
                <p className="text-xs text-brand-dark/65 mt-2 leading-relaxed max-w-xs mx-auto">
                  Get started by searching our curated gems, choosing predefined tour packages, or custom engineering an itinerary on our live blueprint dashboard.
                </p>
                <a
                  href="#planner"
                  onClick={onClose}
                  className="mt-5 inline-block px-4 py-1.5 bg-brand-dark text-brand-gold rounded-full text-xs font-bold transition-all"
                >
                  Go to Safari Planner
                </a>
              </div>
            ) : (
              <div className="space-y-5">
                <SafariCalendar bookings={bookings} destinations={destinations} />
                
                {bookings.map((book) => {
                  const targetDest = destinations.find((d) => d.id === book.destinationId);
                  const destId = book.destinationId || "";
                  const climate = getClimateProfile(destId);
                  const isExpanded = !!expandedChecklists[book.id];
                  const bookChecked = checkedItems[book.id] || {};
                  
                  // Calculate checked count
                  const totalItems = climate.items.length;
                  const packedCount = climate.items.filter(item => !!bookChecked[item.id]).length;
                  const ratioPercent = Math.round((packedCount / totalItems) * 100);

                  return (
                    <div
                      key={book.id}
                      className="p-5 bg-white/5 dark:bg-black/30 rounded-2xl border border-brand-sand-dark/40 relative group transition-all duration-300 hover:border-brand-teal/40 hover:shadow-xl hover:shadow-black/10"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-brand-teal font-extrabold block mb-0.5">
                            {book.isCustomTour ? "⭐ CUSTOM CODESITE" : " Ready-Made Package"}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-brand-dark dark:text-slate-100 leading-tight uppercase">
                            {book.packageId || targetDest?.name.split(" (")[0]}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {book.status}
                        </span>
                      </div>

                      <div className="h-px bg-brand-sand-dark/40 my-3" />

                      {/* Detail nodes */}
                      <div className="space-y-1.5 text-xs text-brand-dark/70 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span>Lead Traveler:</span>
                          <strong className="text-brand-dark dark:text-slate-150">{book.customerName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Preferred Date:</span>
                          <strong className="dark:text-slate-150">{book.preferredStartDate}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Escrow Cost:</span>
                          <strong className="text-brand-gold font-mono">{formatAmount(book.totalPrice)}</strong>
                        </div>
                      </div>

                      {/* Interactive Climate-Based Packing Checklist */}
                      <div className="mt-4 border border-brand-sand-dark/25 rounded-xl overflow-hidden bg-white/10 dark:bg-black/20 shadow-xs">
                        <button
                          onClick={() => toggleChecklist(book.id)}
                          type="button"
                          className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-neutral-50/50 transition-colors text-[11px] font-bold text-brand-dark dark:text-slate-200 cursor-pointer select-none"
                          aria-label={`Toggle climate packing checklist for ${book.packageId || targetDest?.name.split(" (")[0] || 'Safari'}`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-brand-teal" />
                            <span className="uppercase tracking-wider">Climate Essentials</span>
                            <span className="text-[9px] font-mono font-bold bg-brand-teal/10 text-brand-teal px-1.5 py-0.5 rounded-full">
                              {packedCount}/{totalItems}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {ratioPercent === 100 && (
                              <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-mono font-bold animate-pulse">
                                READY!
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-brand-dark/50" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-brand-dark/50" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className={`p-3 border-t border-brand-sand-dark/65 text-xs ${climate.bgClass}`}>
                            {/* Climate Profile Info */}
                            <div className="mb-2.5 pb-2 border-b border-brand-sand-dark/40">
                              <div className="flex items-center gap-1 font-bold uppercase tracking-wider text-[9px] text-brand-dark">
                                <climate.icon className={`w-3.5 h-3.5 ${climate.iconColor}`} />
                                <span>{climate.title}</span>
                              </div>
                              <p className="text-[8px] tracking-wide text-brand-dark/65 font-mono uppercase mt-0.5">
                                [ {climate.tempAndHumidity} ]
                              </p>
                              <p className="text-[10px] text-brand-dark/70 leading-relaxed mt-1 italic">
                                "{climate.description}"
                              </p>
                            </div>

                            {/* Progress bar scale */}
                            <div className="mb-2.5">
                              <div className="flex justify-between items-center text-[9px] font-bold text-brand-dark/60 uppercase mb-1 font-mono">
                                <span>Packing Ratio</span>
                                <span>{ratioPercent}%</span>
                              </div>
                              <div className="h-1 bg-brand-sand-dark/60 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-brand-teal transition-all duration-300" 
                                  style={{ width: `${ratioPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Interactive Checklist checkboxes */}
                            <div className="space-y-1.5">
                              {climate.items.map((item) => {
                                const isChecked = !!bookChecked[item.id];
                                return (
                                  <label
                                    key={item.id}
                                    className="flex items-start gap-2 p-2 bg-white/60 hover:bg-white rounded-lg border border-brand-sand-dark/30 cursor-pointer select-none transition-all hover:border-brand-teal/20"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleItemCheck(book.id, item.id)}
                                      className="sr-only"
                                    />
                                    <div className="mt-0.5 shrink-0">
                                      {isChecked ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-brand-teal" />
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-brand-dark/30 bg-transparent" />
                                      )}
                                    </div>
                                    <div className="leading-tight">
                                      <p className={`font-semibold text-[10px] ${isChecked ? 'line-through text-brand-dark/40 font-normal' : 'text-brand-dark'}`}>
                                        {item.item}
                                      </p>
                                      <p className={`text-[9px] ${isChecked ? 'text-brand-dark/30 font-normal' : 'text-brand-dark/50'}`}>
                                        {item.reason}
                                      </p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Printable receipt actions lists */}
                      <div className="mt-4 pt-3.5 border-t border-brand-sand-dark flex justify-between items-center gap-1.5 flex-wrap">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => window.print()}
                            className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 rounded-lg border border-brand-sand-dark text-[10px] font-bold uppercase font-mono tracking-wider flex items-center gap-1 transition-all cursor-pointer text-brand-dark"
                            aria-label={`Print reservation receipt for ${book.packageId || targetDest?.name.split(" (")[0] || 'Safari'}`}
                          >
                            <Receipt className="w-3 h-3 text-brand-teal" /> Receipt
                          </button>

                          <button
                            onClick={() => setSelectedPassBooking(book)}
                            className="px-2.5 py-1.5 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal rounded-lg border border-brand-teal/30 text-[10px] font-bold uppercase font-mono tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                            aria-label={`View Liquid Pass for ${book.packageId || targetDest?.name.split(" (")[0] || 'Safari'}`}
                          >
                            <Ticket className="w-3 h-3" /> Liquid Pass
                          </button>
                        </div>
                        {book.paymentMethod === "whatsapp" && (
                          <a
                            href={`https://wa.me/260975222136?text=${encodeURIComponent(
                              `Hello Online Agent Assistant Banji Luyando, \n\nI would like to confirm my payment for safari booking reference (${book.tourName || "Victoria Falls Tour"}). \n\n- Name: ${book.customerName}\n- Contact: ${book.customerPhone}\n- Date: ${book.preferredStartDate}\n- Guests: ${book.guestsCount}\n- Amount: ${formatAmount(book.totalPrice)}\n\nPlease verify my Mobile Money payment. Thank you!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-sm shrink-0"
                          >
                            💬 Confirm Pay
                          </a>
                        )}
                        <button
                          onClick={() => onCancelBooking(book.id)}
                          className="p-1 px-2.5 sm:px-3 text-red-600 hover:bg-red-50 text-[10px] font-medium rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          aria-label={`Void and cancel reservation ticket for ${book.packageId || targetDest?.name.split(" (")[0] || 'Safari'}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Void Ticket
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Emergency disclaimer notes */}
        <div className="p-6 bg-brand-sand border-t border-brand-sand-dark">
          <div className="text-xs text-brand-dark/60 leading-normal text-center space-y-2">
            <span className="block font-bold">Zambia Wildlife Licensing Registry</span>
            <span className="block">
              For immediate support, contact our lead agent at <strong>dreamscapetourszambia@gmail.com</strong> inside central African operating hours.
            </span>
          </div>
        </div>

      </div>

      {/* Glassmorphism Safari Pass Modal Overlay */}
      <AnimatePresence>
        {selectedPassBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            {/* Inner relative container to hold close button and glass card */}
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="relative"
            >
              {/* Close button on top right of the modal frame */}
              <button
                onClick={() => setSelectedPassBooking(null)}
                className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                aria-label="Close Safari Pass"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Glassmorphism Card styled with custom styling parameters */}
              <div className="glassmorphism-card w-[420px] h-[280px] max-w-full rounded-2xl border border-white/25 flex flex-col justify-between p-8 text-white relative overflow-hidden select-none">
                {/* Decorative glowing refraction spheres inside the glass */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-brand-teal/25 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-8 -left-8 w-44 h-44 bg-brand-gold/20 rounded-full blur-3xl pointer-events-none" />

                {/* Top Header Row of the card */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-2">
                    <img src="/images/logo dreamscape-1.png" alt="Dreamscape Tours Logo" className="w-9 h-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <div>
                      <h2 className="text-[12px] font-serif font-black tracking-widest uppercase text-white/95">DREAMSCAPE</h2>
                      <p className="text-[7px] font-mono tracking-[4px] text-brand-gold font-black uppercase">EXPEDITION PASS</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-extrabold tracking-widest">
                      {selectedPassBooking.status}
                    </span>
                  </div>
                </div>

                {/* Main Card Grid Information */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 my-2 z-10">
                  <div>
                    <span className="text-[7px] font-mono uppercase text-white/60 tracking-wider block">DESTINATION</span>
                    <span className="text-[11px] font-serif font-bold uppercase tracking-tight text-white line-clamp-1">
                      {selectedPassBooking.packageId || destinations.find(d => d.id === selectedPassBooking.destinationId)?.name.split(" (")[0] || "Zambia Expedition"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7px] font-mono uppercase text-white/60 tracking-wider block">EXPLORER</span>
                    <span className="text-[11px] font-serif font-bold uppercase tracking-tight text-white line-clamp-1">
                      {selectedPassBooking.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7px] font-mono uppercase text-white/60 tracking-wider block">DEPARTURE</span>
                    <span className="text-[11px] font-mono font-bold tracking-tight text-brand-gold">
                      {selectedPassBooking.preferredStartDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7px] font-mono uppercase text-white/60 tracking-wider block">PASSENGERS</span>
                    <span className="text-[11px] font-mono font-bold tracking-tight text-white">
                      {selectedPassBooking.guestsCount} ADULT{selectedPassBooking.guestsCount > 1 ? 'S' : ''}
                    </span>
                  </div>
                </div>

                {/* Card Footer with barcodes & reference details */}
                <div className="flex justify-between items-end border-t border-white/10 pt-3 mt-1 z-10">
                  <div className="space-y-0.5">
                    <span className="text-[6px] font-mono text-white/50 block">BOOKING REF</span>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-white/90 uppercase">
                      DS-{selectedPassBooking.id.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Digital barcode visual */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-0.5 items-end h-5 bg-white/10 p-1 rounded">
                      {[1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 1, 4, 1, 2, 1, 3].map((w, idx) => (
                        <div key={idx} className="bg-white/80" style={{ width: `${w}px`, height: "100%" }} />
                      ))}
                    </div>
                    <span className="text-[5px] font-mono text-white/40 tracking-[3px]">
                      *DS{selectedPassBooking.id.substring(0, 6).toUpperCase()}*
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtitle helper */}
              <p className="text-center text-[10px] text-white/85 font-mono uppercase tracking-[6px] mt-4 animate-pulse">
                💎 PREMIUM EXPEDITION MEMBER 💎
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
