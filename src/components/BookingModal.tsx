import { useState, useEffect, useMemo, FormEvent } from "react";
import { Destination, Activity, Booking } from "../types";
import { X, Calendar, Users, Star, ClipboardCheck, Compass, DollarSign, Wallet2, CheckCircle, ShieldCheck } from "lucide-react";
import { useCurrency } from "../lib/CurrencyContext";
import { useLanguage } from "../lib/LanguageContext";
import { TOUR_PACKAGES } from "../data/travelData";
import { KWACHA_RATE } from "../lib/currency";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitBooking: (bookingData: Omit<Booking, "id" | "dateBooked" | "status">) => void;
  preSelectedPkg?: {
    name: string;
    tagline: string;
    totalPrice: number;
    durationDays: number;
    destinationId: string;
    isCustom: boolean;
    activitiesList?: Activity[];
    whatToCarry?: string[];
    isPreSale?: boolean;
    preSalePriceZMW?: number;
    regularPriceZMW?: number;
  };
  destinations: Destination[];
}

export default function BookingModal({
  isOpen,
  onClose,
  onSubmitBooking,
  preSelectedPkg,
  destinations
}: BookingModalProps) {
  const { formatAmount } = useCurrency();
  const { language } = useLanguage();
  // Booking contact info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [guestsCount, setGuestsCount] = useState(2);

  // Dynamic formula & duration states
  const [selectedDuration, setSelectedDuration] = useState<number>(4);
  const [currentPkgName, setCurrentPkgName] = useState("");
  const [currentPkgTagline, setCurrentPkgTagline] = useState("");
  const [currentPkgPrice, setCurrentPkgPrice] = useState(0);
  const [currentWhatToCarry, setCurrentWhatToCarry] = useState<string[]>([]);
  const [isPreSale, setIsPreSale] = useState(false);
  const [preSalePrice, setPreSalePrice] = useState<number | undefined>(undefined);
  const [regularPrice, setRegularPrice] = useState<number | undefined>(undefined);

  // Payment state
  const paymentMethod = "whatsapp";
  const [paymentDone, setPaymentDone] = useState(false);

  // Error handling
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load defaults
  useEffect(() => {
    if (isOpen) {
      setPaymentDone(false);
      setErrorMsg("");
      setIsSubmitting(false);

      if (preSelectedPkg) {
        setSelectedDuration(preSelectedPkg.durationDays || 4);
        setCurrentPkgName(preSelectedPkg.name);
        setCurrentPkgTagline(preSelectedPkg.tagline);
        setCurrentPkgPrice(preSelectedPkg.totalPrice);
        setCurrentWhatToCarry(preSelectedPkg.whatToCarry || []);
        setIsPreSale(!!preSelectedPkg.isPreSale);
        setPreSalePrice(preSelectedPkg.preSalePriceZMW);
        setRegularPrice(preSelectedPkg.regularPriceZMW);
      }

      // set default starting date: tomorrow
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      setStartDate(tomorrowStr);
    }
  }, [isOpen, preSelectedPkg]);

  // Find all packages for the current destination
  const matchingPackagesForDest = useMemo(() => {
    if (!preSelectedPkg?.destinationId) return [];
    return TOUR_PACKAGES.filter((p) => p.destinationId === preSelectedPkg.destinationId);
  }, [preSelectedPkg?.destinationId]);

  if (!isOpen) return null;

  // Compute live price
  const baseCost = preSelectedPkg?.isCustom ? (preSelectedPkg ? preSelectedPkg.totalPrice : 450) : currentPkgPrice;
  const finalPriceVal = baseCost * (preSelectedPkg?.isCustom ? 1 : guestsCount);

  const getWhatsAppLink = () => {
    const tourName = preSelectedPkg?.isCustom ? (preSelectedPkg ? preSelectedPkg.name : "Victoria Falls Explorer") : currentPkgName;
    const travelers = preSelectedPkg?.isCustom ? 2 : guestsCount;
    const durationStr = `${selectedDuration} Days`;
    const messageText = `Hello Online Agent Assistant Banji Luyando, 

I would like to complete my booking payment details!

*Booking Details:*
- *Lead Explorer:* ${name}
- *Email:* ${email}
- *Phone:* ${phone}
- *Safari Tour Name:* ${tourName}
- *Duration:* ${durationStr}
- *Preferred Date:* ${startDate}
- *Guests:* ${travelers} Traveler(s)
- *Total Price:* ${finalPriceVal === 0 ? "Bespoke / Custom Quote (On Request)" : formatAmount(finalPriceVal)}
${specialRequests.trim() ? `- *Special Requests/Dietary:* ${specialRequests.trim()}\n` : ""}
I would like to pay via WhatsApp Mobile Money (Airtel / MTN MoMo). Please guide me on completing this payment manually. Thank you!`;

    return `https://wa.me/260977671016?text=${encodeURIComponent(messageText)}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !startDate) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      window.open(getWhatsAppLink(), "_blank");
    } catch (err) {
      console.warn("Failed to auto-open WhatsApp:", err);
    }
    setTimeout(() => {
      onSubmitBooking({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        packageId: preSelectedPkg?.destinationId ? undefined : currentPkgName,
        destinationId: preSelectedPkg?.destinationId || destinations[0].id,
        isCustomTour: preSelectedPkg?.isCustom || false,
        preferredStartDate: startDate,
        guestsCount: preSelectedPkg?.isCustom ? 2 : guestsCount, // Custom planner defaults
        totalPrice: finalPriceVal,
        specialRequests,
        paymentSimulated: false,
        tourName: preSelectedPkg?.isCustom ? (preSelectedPkg ? preSelectedPkg.name : "Victoria Falls Explorer") : currentPkgName,
        paymentMethod: "whatsapp"
      });
      setIsSubmitting(false);
      setPaymentDone(true);
    }, 1200);
  };

  return (
    <div id="booking-modal-overlay" className="fixed inset-0 z-50 bg-brand-dark/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-popup rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:h-[85vh]">
        
        {/* Left column: Summary Card */}
        <div className="bg-brand-dark/85 text-brand-sand p-6 md:w-5/12 flex flex-col justify-between border-r border-brand-sand-dark/20 relative z-10 backdrop-blur-sm md:h-full overflow-y-auto">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-teal font-extrabold bg-brand-medium py-1 px-3 rounded-full">
                Selected Adventure
              </span>
              <button onClick={onClose} className="md:hidden text-brand-sand hover:text-brand-gold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-serif text-xl font-bold tracking-tight text-white uppercase leading-tight">
              {preSelectedPkg?.isCustom ? preSelectedPkg.name : currentPkgName}
            </h3>
            <p className="text-xs text-brand-sand/75 italic mt-2">
              {preSelectedPkg?.isCustom ? preSelectedPkg.tagline : currentPkgTagline}
            </p>

            {/* Micro Stats */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2.5 text-xs text-brand-sand/85">
                <Calendar className="w-4 h-4 text-brand-gold" />
                <span>Duration: {selectedDuration} Days</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-brand-sand/85">
                <Users className="w-4 h-4 text-brand-gold" />
                <span>
                  Group Multiplier: {preSelectedPkg?.isCustom ? "Included in Plan" : `${guestsCount} Person(s)`}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-brand-sand/85">
                <ShieldCheck className="w-4 h-4 text-brand-teal" />
                <span>Zambian Tourism Board Certified Route</span>
              </div>
            </div>

            {/* Display list of custom activities if it's customized */}
            {preSelectedPkg?.activitiesList && preSelectedPkg.activitiesList.length > 0 && (
              <div className="mt-6 bg-brand-medium/50 rounded-xl p-3 border border-brand-teal/10">
                <span className="text-[10px] font-mono text-brand-gold uppercase tracking-wider block mb-1.5 font-bold">
                  Included Custom Add-ons
                </span>
                <div className="space-y-1 text-[11px] text-brand-sand/80 max-h-[140px] overflow-y-auto">
                  {preSelectedPkg.activitiesList.map((act) => (
                    <div key={act.id} className="flex justify-between">
                      <span>• {act.name}</span>
                      <span className="font-mono text-[10px] text-brand-gold-light">{formatAmount(act.costPerPerson)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-brand-teal/15 mt-6">
            <span className="text-xs text-brand-sand/65 block uppercase tracking-wider font-mono">
              Total Amount
            </span>
            <span className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-gold block mt-0.5 uppercase tracking-wide">
              {finalPriceVal === 0 ? "Bespoke / Pricing on Request" : formatAmount(finalPriceVal)}
            </span>
            <span className="text-[10px] text-brand-teal block font-mono">{finalPriceVal === 0 ? "Tailored around seasonal royal cycles" : "No hidden handling fees"}</span>
          </div>
        </div>

        {/* Right column: Form Fields */}
        <div className="p-6 md:w-7/12 overflow-y-auto relative flex flex-col justify-start bg-white/45 dark:bg-black/35 backdrop-blur-md md:h-full">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-serif text-lg font-bold text-brand-dark uppercase tracking-tight">
              {paymentDone ? "Booking Secured!" : "Complete Booking"}
            </h4>
            <button onClick={onClose} className="hidden md:block text-brand-dark/50 hover:text-brand-dark">
              <X className="w-5.5 h-5.5" />
            </button>
          </div>

          {!paymentDone ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div id="booking-error-banner" className="p-2.5 bg-red-100 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Selected Package & Live Price Header Card on top */}
              <div id="selected-package-summary-header" className="bg-brand-sand border border-brand-sand-dark/60 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-brand-teal uppercase tracking-widest block">
                      Target Expedition
                    </span>
                    <h5 className="font-serif text-sm sm:text-base font-bold text-brand-dark leading-tight uppercase">
                      {preSelectedPkg?.isCustom ? preSelectedPkg.name : currentPkgName}
                    </h5>
                    <p className="text-[11px] text-brand-dark/70 leading-normal italic mt-0.5">
                      {preSelectedPkg?.isCustom ? preSelectedPkg.tagline : currentPkgTagline}
                    </p>
                  </div>
                  
                  <div className="bg-brand-teal/10 text-[#128C7E] font-mono text-[10px] uppercase font-bold py-1 px-2.5 rounded-full shrink-0">
                    {selectedDuration} Days
                  </div>
                </div>

                <div className="pt-2.5 border-t border-brand-sand-dark/60 flex items-center justify-between text-xs gap-4">
                  <div className="text-brand-dark/75">
                    <span className="text-[10px] uppercase text-brand-dark/50 block font-mono">Base Rate</span>
                    <strong className="font-mono text-brand-dark text-xs">{baseCost === 0 ? "Custom" : formatAmount(baseCost)}</strong>
                    {!preSelectedPkg?.isCustom && <span className="text-[10px] text-brand-dark/50"> / explorer</span>}
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] text-brand-dark/50 block font-mono">Secured for {preSelectedPkg?.isCustom ? "Custom Itinerary" : `${guestsCount} Explorer${guestsCount > 1 ? "s" : ""}`}</span>
                    <span className="font-serif text-base sm:text-lg font-extrabold text-[#128C7E] block leading-tight">
                      {finalPriceVal === 0 ? "Bespoke Quote" : formatAmount(finalPriceVal)}
                    </span>
                  </div>
                </div>

                {currentWhatToCarry && currentWhatToCarry.length > 0 && (
                  <div className="pt-2.5 border-t border-brand-sand-dark/60">
                    <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-amber-800 block font-extrabold mb-1.5 flex items-center gap-1">
                      🎒 {language === "fr" ? "Affaires à apporter :" : "Essential Gear to Carry:"}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {currentWhatToCarry.map((item, idx) => (
                        <span key={idx} className="text-[10px] bg-white/90 text-brand-dark px-2 py-0.5 rounded-lg border border-brand-sand-dark/45 font-medium shadow-2xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {isPreSale && (
                  <div className="pt-2.5 border-t border-brand-sand-dark/60 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-[10.5px] leading-normal">
                    <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-amber-900 block font-black mb-1 flex items-center gap-1">
                      ⛺ {language === "fr" ? "PRÉ-VENTE CONTRÔLÉE :" : "VERIFIED CAMPING PRE-SALE :"}
                    </span>
                    <p className="text-brand-dark font-medium">
                      {language === "fr" 
                        ? `Ce forfait exclusif de camping sera disponible en Mars 2027.` 
                        : `This exclusive wild camping tour series starts in March 2027.`}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-mono text-brand-dark/80 font-semibold">
                      <span>📢 {language === "fr" ? "Pré-inscription :" : "Pre-booking :"} <strong>{formatAmount(preSalePrice || 1400)}</strong></span>
                      <span>⏳ {language === "fr" ? "Après le 6 mars :" : "After March 6 :"} <strong>{formatAmount(regularPrice || 3800)}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Formula / Duration Select */}
              {!preSelectedPkg?.isCustom && (
                <div className="bg-brand-teal/5 p-3.5 rounded-2xl border border-brand-teal/20 space-y-2 mb-3">
                  <label className="block text-[10px] font-black text-[#128C7E] uppercase tracking-wider flex items-center gap-1">
                    ⏰ {language === "fr" ? "Formule et Durée du Safari" : "Safari Formula & Duration"}
                  </label>
                  <select
                    value={
                      matchingPackagesForDest.some((p) => p.durationDays === selectedDuration) 
                        ? (matchingPackagesForDest.find((p) => p.durationDays === selectedDuration)?.id || "") 
                        : "custom"
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setSelectedDuration(4);
                        if (preSelectedPkg) {
                          const basePrefix = preSelectedPkg.name.split(" -")[0].split(" Discovery")[0];
                          setCurrentPkgName(`${basePrefix} (Custom Plan)`);
                        } else {
                          setCurrentPkgName("Custom Safari Tour");
                        }
                        setCurrentPkgTagline("A bespoke custom-duration adventurous blueprint");
                        setCurrentWhatToCarry([]);
                        setIsPreSale(false);
                        const dest = destinations.find((d) => d.id === preSelectedPkg?.destinationId);
                        if (dest) {
                          setCurrentPkgPrice(dest.baseCost + (3 * 45 * KWACHA_RATE));
                        }
                      } else {
                        const pkg = TOUR_PACKAGES.find((p) => p.id === val);
                        if (pkg) {
                          setSelectedDuration(pkg.durationDays);
                          setCurrentPkgName(pkg.name);
                          setCurrentPkgTagline(pkg.tagline);
                          setCurrentPkgPrice(pkg.pricePerPerson);
                          setCurrentWhatToCarry(pkg.whatToCarry || []);
                          setIsPreSale(!!pkg.isPreSale);
                          setPreSalePrice(pkg.preSalePriceZMW);
                          setRegularPrice(pkg.regularPriceZMW);
                        }
                      }
                    }}
                    className="w-full bg-white border border-brand-sand-dark text-brand-dark text-xs sm:text-sm rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-teal cursor-pointer font-bold"
                  >
                    {matchingPackagesForDest.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.durationDays} {p.durationDays === 1 ? "Day" : "Days"}) — {formatAmount(p.pricePerPerson)}/person
                      </option>
                    ))}
                    <option value="custom">Custom Duration Days (Select custom count)</option>
                  </select>

                  {/* If custom is selected, show custom days slider */}
                  {(!matchingPackagesForDest.some((p) => p.durationDays === selectedDuration)) && (
                    <div className="pt-2">
                      <label className="block text-[9.5px] font-bold text-brand-dark/60 uppercase mb-1">
                        Select Custom Days (1 - 15 Days)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={selectedDuration}
                          onChange={(e) => {
                            const days = Number(e.target.value);
                            setSelectedDuration(days);
                            const dest = destinations.find((d) => d.id === preSelectedPkg?.destinationId);
                            if (dest) {
                              const calculatedPrice = dest.id === "shantumbu-falls" 
                                ? dest.baseCost 
                                : dest.baseCost + (Math.max(0, days - 1) * 45 * KWACHA_RATE);
                              setCurrentPkgPrice(Math.round(calculatedPrice));
                            }
                          }}
                          className="flex-grow accent-brand-gold h-1.5 bg-brand-dark/10 rounded-lg cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-brand-dark bg-white px-2.5 py-1 rounded-lg border border-brand-sand-dark shrink-0">
                          {selectedDuration} Days
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Personal details */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-brand-dark/75 uppercase tracking-wide mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Charlotte Vance"
                    className="w-full bg-brand-sand border border-brand-sand-dark text-brand-dark text-sm rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/75 uppercase tracking-wide mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. email@domain.com"
                      className="w-full bg-brand-sand border border-brand-sand-dark text-brand-dark text-sm rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/75 uppercase tracking-wide mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +260 970 000"
                      className="w-full bg-brand-sand border border-brand-sand-dark text-brand-dark text-sm rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/75 uppercase tracking-wide mb-1">
                      Preferred Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-brand-sand border border-brand-sand-dark text-brand-dark text-xs sm:text-sm rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                    />
                  </div>
                  
                  {!preSelectedPkg?.isCustom && (
                    <div>
                      <label className="block text-[10px] font-bold text-brand-dark/75 uppercase tracking-wide mb-1">
                        Travelers Count
                      </label>
                      <select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Number(e.target.value))}
                        className="w-full bg-brand-sand border border-brand-sand-dark text-brand-dark text-sm rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-teal cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 12].map((n) => (
                          <option key={n} value={n}>
                            {n} Explorer{n > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-dark/75 uppercase tracking-wide mb-1">
                    Special Requests &amp; Dietary Notes
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Vegetarian diet, photography focus, wheelchair accessibility..."
                    rows={2}
                    className="w-full bg-brand-sand border border-brand-sand-dark text-brand-dark text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-teal resize-none"
                  />
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="pt-4 border-t border-brand-sand-dark bg-[#25D366]/5 border border-[#25D366]/15 p-3.5 rounded-2xl space-y-2 text-xs">
                <span className="block text-[10px] font-bold text-brand-dark/75 uppercase tracking-wide mb-1 text-center">
                  Preferred Payment Method
                </span>
                <div className="p-2.5 rounded-xl border border-[#25D366] bg-white text-[#128C7E] text-xs font-bold uppercase font-mono tracking-wider flex items-center justify-center gap-2">
                  💬 WhatsApp Mobile Money Dispatch
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white border border-[#25D366]/20 rounded-xl">
                  <span className="font-bold text-brand-dark">MTN MoMo Transfer</span>
                  <span className="font-mono text-[#128C7E] font-bold">+260 977 671 016</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white border border-[#25D366]/20 rounded-xl">
                  <span className="font-bold text-brand-dark">Airtel Money Pay</span>
                  <span className="font-mono text-[#128C7E] font-bold">+260 977 671 016</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white border border-[#25D366]/20 rounded-xl">
                  <span className="font-bold text-brand-dark">Zanaco Transfer</span>
                  <span className="font-mono text-[#128C7E] font-bold">A/C: 100260977671016</span>
                </div>
                <div className="p-2.5 bg-white border border-brand-teal/20 rounded-xl text-brand-dark space-y-1">
                  <span className="font-bold text-[10px] block uppercase text-emerald-700 tracking-wider">Your Contact Dispatch Data</span>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>Name:</span>
                    <span className="font-bold">{name || "(Please fill above field)"}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span>Contact / Phone:</span>
                    <span className="font-bold text-brand-teal">{phone || "(Please fill above field)"}</span>
                  </div>
                </div>
                <p className="text-[10px] text-brand-dark/65 leading-tight mt-1">
                  Your request saves to our secure database immediately in real-time. On success, tap the green <strong>WhatsApp Dispatch</strong> button to complete the transfer directly with Online Agent Assistant <strong>Banji Luyando</strong> at <strong>+260 977 671 016</strong>.
                </p>
              </div>
 
               {/* Submission Button */}
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="w-full font-bold py-3 px-4 rounded-xl text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-emerald-500/10 shadow-lg border-b-[3px] border-[#1b9d4c]"
               >
                 {isSubmitting ? (
                   <span className="inline-block border-2 border-brand-gold/30 border-t-brand-gold w-4 h-4 rounded-full animate-spin" />
                 ) : (
                   "💬 Confirm & WhatsApp Dispatch"
                 )}
               </button>
             </form>
           ) : (
             // Success State Details
             <div className="text-center py-6 flex flex-col items-center justify-center flex-grow">
               <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle className="w-8 h-8" />
               </div>
               <h5 className="font-serif text-xl font-bold text-brand-dark">
                 Booking Reserved!
               </h5>
               <p className="text-xs text-brand-dark/70 mt-3 max-w-sm">
                 Thank you for selecting Dreamscape Tours Zambia, <strong className="text-brand-dark">{name}</strong>. Your customized African safari has been recorded under confirmation hash <strong>#DS-{Math.floor(Math.random() * 8999) + 1000}</strong>.
               </p>
               <div className="mt-6 p-4 bg-brand-sand border border-brand-sand-dark/60 rounded-xl space-y-1 text-left w-full text-xs">
                 <div>
                   <span className="text-brand-dark/50 block">Registered Phone:</span>
                  <span className="font-bold text-brand-dark block mb-2">{phone}</span>
                  <span className="text-brand-dark/50 block">Registered Email:</span>
                   <span className="font-bold text-brand-dark block">{email}</span>
                 </div>
                 <div className="pt-2">
                   <span className="text-brand-dark/50 block">Departure Date:</span>
                   <span className="font-bold text-brand-dark block">{startDate}</span>
                 </div>
                 <div className="pt-2">
                   <span className="text-brand-dark/50 block">Assigned Advisor:</span>
                   <span className="font-semibold text-brand-teal block">Online Agent Assistant Banji Luyando</span>
                 </div>
                 <div className="pt-2">
                   <span className="text-brand-dark/50 block">Payment Choice:</span>
                   <span className="font-mono text-[11px] font-extrabold text-[#128C7E] uppercase block">
                     💬 WhatsApp Mobile Money
                   </span>
                 </div>
               </div>
 
               {true && (
                 <a
                   href={getWhatsAppLink()}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full mt-4 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md border-b-[3px] border-[#1b9d4c]"
                 >
                   💬 Send Payment Receipt via WhatsApp
                 </a>
               )}

               <button
                 onClick={onClose}
                 className="mt-6 px-6 py-2 bg-brand-dark hover:bg-brand-medium text-brand-gold font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
               >
                 Close Dashboard
               </button>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
