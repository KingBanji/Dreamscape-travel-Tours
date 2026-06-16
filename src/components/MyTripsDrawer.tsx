import { useState, useEffect, useRef } from "react";
import { Destination, Booking } from "../types";
import { 
  X, Calendar, Users, Star, ClipboardCheck, Trash2, Printer, Compass, 
  Sparkles, Receipt, CheckSquare, Square, Sun, CloudRain, Droplets, Wind, 
  ShieldAlert, HelpCircle, ChevronDown, ChevronUp, CheckCircle, Briefcase
} from "lucide-react";
import { useCurrency } from "../lib/CurrencyContext";
import { useScrollSync } from "../hooks/useScrollSync";

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
  const [expandedChecklists, setExpandedChecklists] = useState<Record<string, boolean>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<string, boolean>>>({});

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
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-brand-medium text-brand-sand transition-colors cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Guidelines notes */}
          <div className="p-6">
            <span className="text-[10px] font-mono uppercase bg-brand-sand border border-brand-sand-dark px-3 py-1 rounded-full text-brand-medium block font-bold mb-4 w-max">
              Persisted Safaris Dashboard
            </span>

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
                  Go to AI Planner
                </a>
              </div>
            ) : (
              <div className="space-y-5">
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
                      <div className="mt-4 pt-3.5 border-t border-brand-sand-dark flex justify-between items-center gap-2">
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-white hover:bg-neutral-100 rounded-lg border border-brand-sand-dark text-[10px] font-bold uppercase font-mono tracking-wider flex items-center gap-1 transition-all cursor-pointer text-brand-dark"
                        >
                          <Receipt className="w-3.5 h-3.5 text-brand-teal" /> Receipt
                        </button>
                        {book.paymentMethod === "whatsapp" && (
                          <a
                            href={`https://wa.me/260977671016?text=${encodeURIComponent(
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
    </div>
  );
}
