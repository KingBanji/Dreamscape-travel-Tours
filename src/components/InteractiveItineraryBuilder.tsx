import { useState, useEffect, useMemo, FormEvent } from "react";
import { Destination, Activity } from "../types";
import { Compass, Calendar, Users, Sliders, CheckCircle2, ChevronRight, Printer, DollarSign, HelpCircle, Flame, Luggage, Plus, Trash2, Copy, Check, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { KWACHA_RATE } from "../lib/currency";
import { useCurrency } from "../lib/CurrencyContext";
import LiveWeatherWidget from "./LiveWeatherWidget";

interface PackingItem {
  id: string;
  name: string;
  category: string;
}

function getPackingList(destId: string, activityIds: string[], customItems: string[]): PackingItem[] {
  // Base essentials for any Zambian safari
  const baseItems: PackingItem[] = [
    { id: "base-sun", name: "Broad-spectrum sunscreen (SPF 50+)", category: "Essentials" },
    { id: "base-insect", name: "High-DEET insect repellent", category: "Essentials" },
    { id: "base-meds", name: "Malaria prophylactics & personal first-aid kit", category: "Essentials" },
    { id: "base-pass", name: "Physical passport, visa docs & yellow fever card", category: "Essentials" },
    { id: "base-cash", name: "Emergency cash (ZMW Kwacha / USD bills)", category: "Essentials" },
    { id: "base-adapt", name: "Type G UK adapter plugs & reliable powerbanks", category: "Essentials" },
  ];

  const destinationItems: Record<string, string[]> = {
    "shantumbu-falls": [
      "Lightweight athletic hiking wear for warm climates",
      "Grip-focused trail runners or walking shoes",
      "Small secure daypack (for snacks & water)",
      "Swimming trunks / bikini & small microfiber towel",
      "Foldable chair (optional for picnic sessions)"
    ],
    "kundalila-falls": [
      "Warm insulation layer (Serenje evenings can be chilly!)",
      "Thick wool hiking socks (prevents boot grazes on slopes)",
      "Compact quick-dry towel & swimwear for the deep canyon plunge",
      "Sturdy hiking boots with ankle protection",
      "Waterproof container for camera / lens protection"
    ],
    "victoria-falls": [
      "Heavy-duty waterproof rain poncho (for thundering spray zone)",
      "Secure dry-bag for phones, cameras & passports",
      "Secure strap sandals or high-traction water shoes",
      "Light casual clothing that dries rapidly",
      "Sunglasses with head-strap retention"
    ],
    "south-luangwa": [
      "Strict neutral clothing: khaki, beige, olive (no bright or dark navy)",
      "Light canvas boots or high-support trail trekking shoes",
      "Wide-brimmed safari hat with chin cord",
      "High-power compact binoculars",
      "Warm windbreaker layer for early morning open-top cruises"
    ],
    "lower-zambezi": [
      "Waterproof dry pouch for accessories",
      "Polarized sun protection glasses (defeats river glare)",
      "Wide sunshade flap hat to avoid neck-burn",
      "Breathable UV-protection long-sleeve action shirts",
      "Comfortable shoes suitable for getting wet on canoe channels"
    ]
  };

  const activityItems: Record<string, string[]> = {
    // Shantumbu
    "sh-hike": ["Hard-shell water bottle (1.5L+ recommended)", "Electrolyte hydration packs"],
    "sh-waterfall": ["High-grip waterproof sandals", "Wet-clothing ziploc bag"],
    "sh-picnic": ["Stylish sunglasses", "Hand-sanitizer wipes"],
    // Vic Falls
    "vf-heli": ["Camera with strap", "Polarized lens filter (optional)"],
    "vf-devil": ["Waterproof action camera with floating grip", "Slip-resistant water shoes"],
    "vf-sunset": ["Smart casual dinner outfit", "Light evening cardigan / jacket"],
    "vf-bridge": ["Extremely tight lace shoes", "GoPro/Action cam head mount"],
    // South Luangwa
    "sl-walk": ["Sturdy double-layered socks", "Natural-toned belt / accessories"],
    "sl-night": ["Red-filter headlamp (biodiversity friendly)", "Cozy thermal fleece"],
    "sl-village": ["Cash for community craft purchases", "Comfortable walking shoes"],
    // Lower Zambezi
    "lz-canoe": ["Waterproof phone holder", "Quick-dry active shorts"],
    "lz-fish": ["Light-weight sports gloves", "Sunscreen lip-balm"],
    // Kundalila
    "kl-hike": ["Trekking pole (highly suggested for steep Kaombe gorge)", "Protein / energy bars"],
    "kl-swim": ["Quick-dry swimming gear", "Rashguard shirt"]
  };

  const list: PackingItem[] = [...baseItems];

  const destSpecifics = destinationItems[destId] || [];
  destSpecifics.forEach((item, idx) => {
    list.push({
      id: `dest-${destId}-${idx}`,
      name: item,
      category: "Destination Specifics"
    });
  });

  activityIds.forEach((actId) => {
    const actSpecifics = activityItems[actId] || [];
    actSpecifics.forEach((item, idx) => {
      list.push({
        id: `act-${actId}-${idx}`,
        name: item,
        category: "Activity Gear"
      });
    });
  });

  customItems.forEach((item, idx) => {
    list.push({
      id: `custom-${idx}`,
      name: item,
      category: "My Custom Additions"
    });
  });

  return list;
}

interface InteractiveItineraryBuilderProps {
  destinations: Destination[];
  preSelectedDestinationId?: string;
  onBookCustomTour: (customData: {
    destination: Destination;
    selectedActivities: Activity[];
    days: number;
    guests: number;
    totalCost: number;
  }) => void;
}

export default function InteractiveItineraryBuilder({
  destinations,
  preSelectedDestinationId,
  onBookCustomTour
}: InteractiveItineraryBuilderProps) {
  const { formatAmount } = useCurrency();
  // Select active destination
  const [selectedDestId, setSelectedDestId] = useState(destinations[0].id);
  const [daysCount, setDaysCount] = useState(4);
  const [guestsCount, setGuestsCount] = useState<number>(() => {
    const saved = localStorage.getItem("dreamscape_passport_travelers");
    const num = saved ? Number(saved) : 15;
    if (num < 15) return 15;
    if (num > 33) return 33;
    return num;
  });
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);

  // TAB select for Compiled Blueprint View
  const [activeTab, setActiveTab ] = useState<"itinerary" | "packing">("itinerary");
  // Pack List checked IDs
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("dreamscape_pack_checked");
    return saved ? JSON.parse(saved) : [];
  });
  // Personal custom pack list additions
  const [customItems, setCustomItems] = useState<string[]>(() => {
    const saved = localStorage.getItem("dreamscape_pack_customs");
    return saved ? JSON.parse(saved) : [];
  });
  const [newCustomItemText, setNewCustomItemText] = useState("");
  const [copiedState, setCopiedState] = useState(false);

  // Sync checklist edits dynamically with local storage for high durability
  useEffect(() => {
    localStorage.setItem("dreamscape_pack_checked", JSON.stringify(checkedItemIds));
  }, [checkedItemIds]);

  useEffect(() => {
    localStorage.setItem("dreamscape_pack_customs", JSON.stringify(customItems));
  }, [customItems]);

  const handleTogglePackingItem = (id: string) => {
    if (checkedItemIds.includes(id)) {
      setCheckedItemIds(checkedItemIds.filter((itemId) => itemId !== id));
    } else {
      setCheckedItemIds([...checkedItemIds, id]);
    }
  };

  const handleAddCustomItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newCustomItemText.trim()) return;
    setCustomItems([...customItems, newCustomItemText.trim()]);
    setNewCustomItemText("");
  };

  const handleRemoveCustomItem = (index: number) => {
    const updatedCustoms = customItems.filter((_, idx) => idx !== index);
    setCustomItems(updatedCustoms);
    const generatedId = `custom-${index}`;
    setCheckedItemIds(checkedItemIds.filter((id) => id !== generatedId));
  };

  const handleResetPacking = () => {
    setCheckedItemIds([]);
    setCustomItems([]);
  };

  // If a destination was forwarded via quick option, update immediate state
  useEffect(() => {
    if (preSelectedDestinationId) {
      setSelectedDestId(preSelectedDestinationId);
      // Automatically preselect the first two activities
      const dest = destinations.find((d) => d.id === preSelectedDestinationId);
      if (dest && dest.activities.length > 0) {
        setSelectedActivityIds(dest.activities.slice(0, 2).map((a) => a.id));
      }
      if (preSelectedDestinationId === "shantumbu-falls") {
        setDaysCount(1);
      }
    }
  }, [preSelectedDestinationId, destinations]);

  // Force daysCount to 1 for Shantumbu Falls
  useEffect(() => {
    if (selectedDestId === "shantumbu-falls") {
      setDaysCount(1);
    } else if (daysCount === 1) {
      setDaysCount(4);
    }
  }, [selectedDestId]);

  const activeDestination = useMemo(() => {
    return destinations.find((d) => d.id === selectedDestId) || destinations[0];
  }, [selectedDestId, destinations]);

  // Handle destination change: reset activity selection to first two by default
  const handleDestinationChange = (id: string) => {
    setSelectedDestId(id);
    const dest = destinations.find((d) => d.id === id);
    if (dest && dest.activities.length > 0) {
      setSelectedActivityIds(dest.activities.slice(0, 2).map((a) => a.id));
    } else {
      setSelectedActivityIds([]);
    }
    if (id === "shantumbu-falls") {
      setDaysCount(1);
    } else {
      setDaysCount((prev) => prev === 1 ? 4 : prev);
    }
  };

  const handleToggleActivity = (actId: string) => {
    if (selectedActivityIds.includes(actId)) {
      setSelectedActivityIds(selectedActivityIds.filter((id) => id !== actId));
    } else {
      setSelectedActivityIds([...selectedActivityIds, actId]);
    }
  };

  const selectedActivities = useMemo(() => {
    return activeDestination.activities.filter((act) =>
      selectedActivityIds.includes(act.id)
    );
  }, [activeDestination, selectedActivityIds]);

  const costCalculations = useMemo(() => {
    const isShantumbu = activeDestination.id === "shantumbu-falls";
    const actualDays = isShantumbu ? 1 : daysCount;
    const baseCostAcrossDays = isShantumbu 
      ? activeDestination.baseCost 
      : activeDestination.baseCost + (actualDays * 45 * KWACHA_RATE); // small daily accommodation/transfers scaling
    const activitiesSum = selectedActivities.reduce((acc, curr) => acc + curr.costPerPerson, 0);
    const costPerPersonValue = baseCostAcrossDays + activitiesSum;
    const grossTotal = costPerPersonValue * guestsCount;
    return {
      costPerPerson: costPerPersonValue,
      grossTotal
    };
  }, [activeDestination, daysCount, guestsCount, selectedActivities]);

  const currentPackingList = useMemo(() => {
    return getPackingList(selectedDestId, selectedActivityIds, customItems);
  }, [selectedDestId, selectedActivityIds, customItems]);

  const totalItems = currentPackingList.length;
  const checkedCount = currentPackingList.filter(item => checkedItemIds.includes(item.id)).length;
  const packingPercentage = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const handleCopyPackingList = () => {
    const textToCopy = currentPackingList
      .map((item) => {
        const isChecked = checkedItemIds.includes(item.id);
        return `${isChecked ? "✔" : "☐"} ${item.name} [${item.category}]`;
      })
      .join("\n");

    const header = `🎒 DREAMSCAPE TOURS ZAMBIA - CUSTOM PACKING LIST\n` +
      `District: ${activeDestination.name} (${activeDestination.location})\n` +
      `Duration: ${selectedDestId === "shantumbu-falls" ? "1-Day Outing" : `${daysCount} Days`}\n` +
      `Completion: ${checkedCount} of ${totalItems} packed (${packingPercentage}%)\n\n` +
      `ITEMS TO CARRY:\n-----------------------------\n`;

    navigator.clipboard.writeText(header + textToCopy + `\n-----------------------------\nHave an incredible safe journey! 🇿🇲`);
    
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <section id="planner" className="py-24 bg-brand-dark text-brand-sand relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-teal/5 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Module Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-brand-teal font-extrabold block">
              Dynamic Custom Blueprints
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase">
            Build Your Own Safari
          </h2>
          <div className="h-0.5 w-16 bg-brand-gold mx-auto mt-4 mb-3" />
          <p className="text-brand-sand/70 text-sm sm:text-base">
            Mix and match premium wild safaris, accommodation scale, and local extreme activities in real-time. Witness your customized timeline compile below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left panel - Config Dial Board */}
          <div className="lg:col-span-5 bg-brand-medium/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-brand-teal/20 space-y-8 shadow-xl">
            <div className="flex items-center gap-2 pb-4 border-b border-brand-teal/10">
              <Sliders className="w-5 h-5 text-brand-gold" />
              <h3 className="font-serif text-lg font-bold uppercase tracking-wide text-brand-sand">
                Configuration Dashboard
              </h3>
            </div>

            {/* Step 1: Destination Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-teal mb-2">
                1. Select Wildlife District
              </label>
              <select
                value={selectedDestId}
                onChange={(e) => handleDestinationChange(e.target.value)}
                className="w-full bg-brand-dark/80 border border-brand-teal/20 text-brand-sand text-sm rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
              >
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name} - {formatAmount(dest.baseCost)} Base
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Expedition Duration & Travelers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-teal mb-2">
                  2. Duration: <span className="text-brand-gold">{selectedDestId === "shantumbu-falls" ? 1 : daysCount} {selectedDestId === "shantumbu-falls" ? "Day" : "Days"}</span>
                </label>
                <input
                  type="range"
                  min={selectedDestId === "shantumbu-falls" ? "1" : "2"}
                  max={selectedDestId === "shantumbu-falls" ? "1" : "12"}
                  value={selectedDestId === "shantumbu-falls" ? 1 : daysCount}
                  disabled={selectedDestId === "shantumbu-falls"}
                  onChange={(e) => setDaysCount(Number(e.target.value))}
                  className={`w-full accent-brand-gold h-1.5 bg-brand-dark/95 rounded-lg transition-all ${
                    selectedDestId === "shantumbu-falls" ? "opacity-45 cursor-not-allowed" : "cursor-pointer"
                  }`}
                />
                <div className="flex justify-between text-[10px] text-brand-sand/65 font-mono mt-1">
                  <span>{selectedDestId === "shantumbu-falls" ? "1 Day" : "2 Days"}</span>
                  <span>{selectedDestId === "shantumbu-falls" ? "1 Day" : "12 Days"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-teal mb-2">
                  3. Expeditioners: <span className="text-brand-gold">{guestsCount}</span>
                </label>
                <div className="flex items-center gap-2 bg-brand-dark/80 border border-brand-teal/20 rounded-xl p-2.5">
                  <button
                    type="button"
                    onClick={() => setGuestsCount(prev => Math.max(15, (Number(prev) || 15) - 1))}
                    className="w-8 h-8 rounded-lg bg-brand-medium hover:bg-brand-teal/40 flex items-center justify-center font-bold text-sm cursor-pointer shrink-0"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="15"
                    max="33"
                    value={guestsCount}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : Number(e.target.value);
                      setGuestsCount(val as any);
                    }}
                    onBlur={() => {
                      if (guestsCount === "" || isNaN(guestsCount)) {
                        setGuestsCount(15);
                      } else if (guestsCount < 15) {
                        setGuestsCount(15);
                      } else if (guestsCount > 33) {
                        setGuestsCount(33);
                      }
                    }}
                    className={`flex-grow text-center text-sm font-bold font-mono bg-transparent outline-none focus:outline-none focus:ring-0 ${
                      (guestsCount !== "" && (guestsCount < 15 || guestsCount > 33))
                        ? "text-red-500 bg-red-500/10 focus:ring-1 focus:ring-red-500 rounded-lg p-1 animate-pulse border border-red-500"
                        : "text-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setGuestsCount(prev => Math.min(33, (Number(prev) || 15) + 1))}
                    className="w-8 h-8 rounded-lg bg-brand-medium hover:bg-brand-teal/40 flex items-center justify-center font-bold text-sm cursor-pointer shrink-0"
                  >
                    +
                  </button>
                </div>
                {guestsCount !== "" && (guestsCount < 15 || guestsCount > 33) && (
                  <p className="text-[10px] text-red-400 font-bold font-sans mt-2 flex items-center gap-1 animate-pulse">
                    ⚠️ Strict group limit is 15 to 33 travelers.
                  </p>
                )}
              </div>
            </div>

            {/* Step 3: Immersive Activities checklist */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-teal mb-3">
                4. Select Custom Activites
              </label>
              
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {activeDestination.activities.map((act) => {
                  const isChecked = selectedActivityIds.includes(act.id);
                  return (
                    <div
                      key={act.id}
                      onClick={() => handleToggleActivity(act.id)}
                      className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? "bg-brand-teal/20 border-brand-gold/80 hover:bg-brand-teal/35"
                          : "bg-brand-dark/40 border-brand-teal/10 hover:border-brand-teal/30"
                      }`}
                    >
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div click
                          className="rounded text-brand-gold accent-brand-gold cursor-pointer"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-brand-sand">
                            {act.name}
                          </span>
                          <span className="text-xs font-mono font-bold text-brand-gold">
                            +{formatAmount(act.costPerPerson)}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-sand/70 mt-1 pl-0.5 leading-snug">
                          {act.description}
                        </p>
                        <span className="inline-block text-[9px] font-mono text-brand-teal mt-1.5 uppercase tracking-widest bg-brand-dark/60 px-2 py-0.5 rounded">
                          ⏱ {act.duration}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Pricing Overview Panel */}
            <div className="bg-brand-dark/80 rounded-2xl p-5 border border-brand-teal/20 text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-sand/50">
                Live Pricing Breakdown
              </span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-brand-sand/70 text-xs sm:text-sm">
                  {formatAmount(costCalculations.costPerPerson)} / Person
                </span>
                <span className="text-brand-teal">•</span>
                <span className="text-brand-sand/70 text-xs sm:text-sm">
                  {guestsCount} Guested
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-brand-gold mt-2">
                {formatAmount(costCalculations.grossTotal)}
              </div>
              <button
                onClick={() =>
                  onBookCustomTour({
                    destination: activeDestination,
                    selectedActivities,
                    days: daysCount,
                    guests: guestsCount,
                    totalCost: costCalculations.grossTotal
                  })
                }
                className="w-full mt-4 py-3 bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer shadow-lg shadow-brand-gold/10"
              >
                Secure This Custom Tour
              </button>
            </div>
          </div>

          {/* Right panel - Compiled Visual Itinerary Timeline */}
          <div className="lg:col-span-7 liquid-glass-card hover:bg-white/60 text-brand-dark p-6 sm:p-8 shadow-2xl border-white/50 flex flex-col justify-between h-full min-h-[660px] transition-all duration-300">
            
            {/* Timeline Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-brand-sand-dark/90">
                <div className="flex items-center gap-1.5 text-brand-medium">
                  <Compass className="w-5 h-5 text-brand-gold" />
                  <span className="font-serif text-lg font-bold tracking-tight uppercase">
                    Compiled Itinerary Blueprint
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-brand-teal uppercase tracking-widest font-bold block bg-brand-sand px-2 py-0.5 rounded-lg border border-brand-sand-dark">
                    Custom Route Draft #LCM
                  </span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-brand-sand rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-xs text-brand-dark/50 block">Active Territory</span>
                  <span className="font-serif font-bold text-base text-brand-dark block text-brand-dark">
                    {activeDestination.location}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-brand-dark/50 block">Outpost Weather</span>
                  <div className="mt-1">
                    <LiveWeatherWidget destinationId={activeDestination.id} />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-brand-dark/50 block">Travel Duration</span>
                  <span className="font-bold text-sm text-brand-dark block">
                    {selectedDestId === "shantumbu-falls" ? "1 Day (No Overnight)" : `${daysCount} Days / ${daysCount - 1} Nights`}
                  </span>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="mt-5 flex bg-brand-sand border border-brand-sand-dark p-1 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("itinerary")}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer ${
                    activeTab === "itinerary"
                      ? "bg-brand-medium text-white shadow-xs"
                      : "text-brand-dark/60 hover:text-brand-dark hover:bg-neutral-200/50"
                  }`}
                >
                  🗺️ Daily Itinerary
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("packing")}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === "packing"
                      ? "bg-brand-medium text-white shadow-xs"
                      : "text-brand-dark/60 hover:text-brand-dark hover:bg-neutral-200/50"
                  }`}
                >
                  🎒 Packing List
                  {totalItems - checkedCount > 0 && (
                    <span className="bg-brand-teal text-white text-[9px] px-2 py-0.5 rounded-full font-mono font-bold leading-none animate-pulse">
                      {totalItems - checkedCount}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === "itinerary" ? (
                /* Dynamic Day Timeline Nodes */
                <div className="mt-6 space-y-6 relative border-l-2 border-brand-sand-dark pl-6 ml-3">
                  
                  {selectedDestId === "shantumbu-falls" ? (
                    <>
                      {/* Shantumbu 1-Day Node 1 */}
                      <div className="relative">
                        <div className="absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full bg-brand-dark border-2 border-white shadow-md" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-brand-dark text-brand-gold px-2 py-0.5 rounded-lg">
                            08:00
                          </span>
                          <h4 className="font-bold text-sm text-brand-dark">
                            Lusaka Departure &amp; Inbound Countryside Drive
                          </h4>
                        </div>
                        <p className="text-xs text-brand-dark/70 mt-1 leading-relaxed pl-1">
                          Convenient private vehicle pickup from your Lusaka location. Drive east through scenic rolling hills to reach the quiet Shantumbu escarpment.
                        </p>
                      </div>

                      {/* Shantumbu 1-Day Node 2 */}
                      <div className="relative">
                        <div className="absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full bg-brand-gold border-2 border-white shadow-md animate-pulse" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-brand-dark text-brand-gold px-2 py-0.5 rounded-lg">
                            Midday
                          </span>
                          <h4 className="font-bold text-sm text-brand-dark">
                            Escarpment Trekking &amp; Active Cascade Bathe
                          </h4>
                        </div>
                        <p className="text-xs text-brand-dark/70 mt-1 leading-relaxed pl-1">
                          Hike the rocky ridge peaks with our expert guide. Recharge under the pristine Shantumbu falls and refreshing rock pools.
                        </p>

                        <div className="mt-3.5 space-y-2.5">
                          {selectedActivities.length === 0 ? (
                            <div className="p-3 bg-brand-sand border border-brand-sand-dark border-dashed rounded-xl text-xs text-brand-dark/50 text-center">
                              No custom activities selected on your list yet. Select some on the sidebar to build your itinerary schedule!
                            </div>
                          ) : (
                            selectedActivities.map((act) => (
                              <div key={act.id} className="p-3 bg-brand-sand border border-brand-sand-dark/60 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">⭐</span>
                                  <div>
                                    <span className="font-bold text-xs text-brand-dark block">
                                      {act.name}
                                    </span>
                                    <span className="text-[9px] font-mono text-brand-teal uppercase tracking-wider block">
                                      Duration: {act.duration}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-bold font-mono text-brand-dark bg-white border border-brand-sand-dark px-2.5 py-1 rounded-lg">
                                  +{formatAmount(act.costPerPerson)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Shantumbu 1-Day Node 3 */}
                      <div className="relative">
                        <div className="absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full bg-brand-dark border-2 border-white shadow-md" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-brand-dark text-brand-gold px-2 py-0.5 rounded-lg">
                            16:30
                          </span>
                          <h4 className="font-bold text-sm text-brand-dark">
                            Picnic Retreat &amp; Safe Lusaka Return
                          </h4>
                        </div>
                        <p className="text-xs text-brand-dark/70 mt-1 leading-relaxed pl-1 font-sans">
                          Relish local gourmet picnic snacks and chilled beverages in absolute peace. Set off on a comfortable return drive back to Lusaka, arriving before nightfall.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Day 1 node */}
                      <div className="relative">
                        <div className="absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full bg-brand-dark border-2 border-white shadow-md" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-brand-dark text-brand-gold px-2 py-0.5 rounded-lg">
                            Day 1
                          </span>
                          <h4 className="font-bold text-sm text-brand-dark">
                            Jungle Flight &amp; River Orientation
                          </h4>
                        </div>
                        <p className="text-xs text-brand-dark/70 mt-1 leading-relaxed pl-1">
                          Arrive in luxurious {activeDestination.location}. Board a private riverboat shuttle to settle into custom elevated tents. Settle down with dynamic stargazing cocktails at the hearth.
                        </p>
                      </div>

                      {/* Day 2 (Activities node) */}
                      <div className="relative">
                        <div className="absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full bg-brand-gold border-2 border-white shadow-md animate-pulse" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-brand-dark text-brand-gold px-2 py-0.5 rounded-lg">
                            Day 2
                          </span>
                          <h4 className="font-bold text-sm text-brand-dark">
                            Personalized Wildlife Adventures
                          </h4>
                        </div>
                        <p className="text-xs text-brand-dark/70 mt-1 leading-relaxed pl-1">
                          Prepare for sunrise tea, then depart for deep habitat exploration.
                        </p>

                        <div className="mt-3.5 space-y-2.5">
                          {selectedActivities.length === 0 ? (
                            <div className="p-3 bg-brand-sand border border-brand-sand-dark border-dashed rounded-xl text-xs text-brand-dark/50 text-center">
                              No custom activities selected on your list yet. Select some on the sidebar to build your Day 2 schedule!
                            </div>
                          ) : (
                            selectedActivities.map((act) => (
                              <div key={act.id} className="p-3 bg-brand-sand border border-brand-sand-dark/60 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">⭐</span>
                                  <div>
                                    <span className="font-bold text-xs text-brand-dark block">
                                      {act.name}
                                    </span>
                                    <span className="text-[9px] font-mono text-brand-teal uppercase tracking-wider block">
                                      Duration: {act.duration}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-bold font-mono text-brand-dark bg-white border border-brand-sand-dark px-2.5 py-1 rounded-lg">
                                  +{formatAmount(act.costPerPerson)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Day 3 (Wilderness Trek/Canoe node) */}
                      <div className="relative">
                        <div className="absolute -left-[30px] top-1 w-3.5 h-3.5 rounded-full bg-brand-dark border-2 border-white shadow-md" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-brand-dark text-brand-gold px-2 py-0.5 rounded-lg">
                            Day 3-{daysCount}
                          </span>
                          <h4 className="font-bold text-sm text-brand-dark">
                            Pristine Escape &amp; Walking Safari Trails
                          </h4>
                        </div>
                        <p className="text-xs text-brand-dark/70 mt-1 leading-relaxed pl-1 font-sans">
                          Venture into deep-lying woodland clearings. Track local buffalo herds, search for elusive leopards hidden on marula tree branches, and gather for custom campfire dinners cooked by master bushchefs.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Dynamic Smart Packing checklist */
                <div className="mt-6 space-y-6">
                  {/* Dynamic Header & Progress Bar */}
                  <div className="bg-brand-sand p-4 rounded-2xl border border-brand-sand-dark">
                    <div className="flex justify-between items-center text-[10px] text-brand-dark/70 mb-2 font-mono uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Luggage className="w-3.5 h-3.5 text-brand-teal" /> Expedition Loadout Progress</span>
                      <span className="font-bold text-brand-teal">{checkedCount} / {totalItems} Packed ({packingPercentage}%)</span>
                    </div>
                    <div className="w-full bg-neutral-200/55 rounded-full h-3 overflow-hidden p-0.5 border border-brand-sand-dark/60">
                      <div
                        className="bg-brand-teal h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${packingPercentage}%` }}
                      />
                    </div>
                    {packingPercentage === 100 ? (
                      <div className="text-[11px] font-mono font-bold text-emerald-600 mt-2 flex items-center gap-1 uppercase tracking-wide">
                        ⚡ Loadout Complete! Enjoy your premium adventure.
                      </div>
                    ) : (
                      <div className="text-[10px] text-brand-dark/50 mt-1.5 font-medium">
                        Suggested packing items change dynamically with your destination & activity selections.
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleCopyPackingList}
                      className="px-3 py-1.5 border border-brand-sand-dark bg-brand-sand hover:bg-neutral-100 rounded-xl text-[10px] font-bold font-mono flex items-center gap-1 transition-colors cursor-pointer text-brand-dark"
                    >
                      {copiedState ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-brand-dark/70" />
                          <span>Copy Checklist</span>
                        </>
                      )}
                    </button>
                    {(checkedItemIds.length > 0 || customItems.length > 0) && (
                      <button
                        type="button"
                        onClick={handleResetPacking}
                        className="px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-[10px] font-bold font-mono flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Packing List Categorized Group lists */}
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {["Essentials", "Destination Specifics", "Activity Gear", "My Custom Additions"].map((cat) => {
                      const catItems = currentPackingList.filter((item) => item.category === cat);
                      if (catItems.length === 0) return null;
                      return (
                        <div key={cat} className="space-y-1.5">
                          <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-teal font-extrabold px-1">
                            {cat}
                          </h4>
                          <div className="bg-brand-sand border border-brand-sand-dark/60 rounded-2xl p-3 space-y-2">
                            {catItems.map((item, index) => {
                              const isChecked = checkedItemIds.includes(item.id);
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between gap-3 text-xs"
                                >
                                  <label
                                    onClick={() => handleTogglePackingItem(item.id)}
                                    className="flex items-start gap-3 cursor-pointer flex-1"
                                  >
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                                      isChecked
                                        ? "bg-brand-medium border-brand-medium text-white shadow-inner"
                                        : "border-brand-sand-dark bg-white hover:border-brand-teal"
                                    }`}>
                                      {isChecked && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`leading-snug transition-all ${
                                      isChecked ? "line-through text-brand-dark/40" : "text-brand-dark"
                                    }`}>
                                      {item.name}
                                    </span>
                                  </label>

                                  {cat === "My Custom Additions" && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCustomItem(index)}
                                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Remove item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Custom Item Form */}
                  <form onSubmit={handleAddCustomItem} className="flex gap-2 pt-2 border-t border-brand-sand-dark/60">
                    <input
                      type="text"
                      placeholder="Add custom packing item..."
                      value={newCustomItemText}
                      onChange={(e) => setNewCustomItemText(e.target.value)}
                      className="flex-1 text-xs border border-brand-sand-dark rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold text-brand-dark hover:bg-neutral-50"
                    />
                    <button
                      type="submit"
                      disabled={!newCustomItemText.trim()}
                      className="px-4 py-2 bg-brand-medium text-white hover:bg-brand-medium/90 disabled:opacity-45 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Custom footer */}
            <div className="pt-6 border-t border-brand-sand-dark/95 mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-brand-dark/55 text-center sm:text-left leading-tight">
                <Compass className="w-5 h-5 text-brand-teal" />
                <span>Dreamscape Tours Zambia handles logistics, charter aviation, and insurance setups.</span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 border border-brand-sand-dark bg-brand-sand hover:bg-neutral-200 text-brand-dark rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-brand-dark" /> Print Outline
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
