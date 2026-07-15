import React, { useState, useEffect, useMemo } from "react";
import { X, Shield, CheckCircle, Clock, AlertTriangle, Trash2, Award, Users, DollarSign, Key, RefreshCw, Search, CalendarRange, Filter, ArrowUpDown, Activity, Plus, Edit } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar, Legend } from "recharts";
import { Booking } from "../types";
import { useAuthAndData } from "../lib/FirebaseContext";
import { useCurrency } from "../lib/CurrencyContext";
import { useLanguage } from "../lib/LanguageContext";

interface AdminConsoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
}

export default function AdminConsoleDrawer({ isOpen, onClose, bookings: firestoreBookings }: AdminConsoleDrawerProps) {
  const { user, updateBookingStatus, cancelBooking, signIn, isDbEnabled, memberships, tours, publishTour, deleteTour } = useAuthAndData();
  const { formatAmount } = useCurrency();
  const { language } = useLanguage();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authTab, setAuthTab] = useState<"passcode" | "db_auth">("passcode");
  const [dbMode, setDbMode] = useState<"login" | "register">("login");
  
  // Console tabs
  const [activeConsoleTab, setActiveConsoleTab] = useState<"bookings" | "health" | "tours">("bookings");
  
  // Tour Form State inside Admin Console Drawer
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [tourName, setTourName] = useState("");
  const [tourTagline, setTourTagline] = useState("");
  const [tourPrice, setTourPrice] = useState(1200);
  const [tourDuration, setTourDuration] = useState(5);
  const [tourLocation, setTourLocation] = useState("shantumbu-falls");
  const [tourDesc, setTourDesc] = useState("");
  const [tourFeaturesText, setTourFeaturesText] = useState("");
  const [tourIsFeatured, setTourIsFeatured] = useState(false);

  const resetTourForm = () => {
    setEditingTourId(null);
    setTourName("");
    setTourTagline("");
    setTourPrice(1200);
    setTourDuration(5);
    setTourLocation("shantumbu-falls");
    setTourDesc("");
    setTourFeaturesText("");
    setTourIsFeatured(false);
  };

  const handlePublishTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourName) return;

    const parsedFeatures = tourFeaturesText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const targetId = editingTourId || `tour-custom-${Date.now()}`;
    const newTour = {
      id: targetId,
      name: tourName,
      tagline: tourTagline || "Pristine wilderness redefined",
      pricePerPerson: Number(tourPrice),
      durationDays: Number(tourDuration),
      destinationId: tourLocation,
      description: tourDesc,
      features: parsedFeatures.length > 0 ? parsedFeatures : ["Bespoke tailored luxury safari guide"],
      isFeatured: tourIsFeatured,
      itinerary: [
        {
          day: 1,
          title: "Expedition Commencement",
          description: tourDesc || "Arrival and check-in to luxury base camp environment with gourmet meals.",
          accommodation: "Luxury Base Camp",
          meals: "Dinner"
        }
      ]
    };

    await publishTour(newTour);
    resetTourForm();
    setSuccessMsg(language === "fr" ? "Forfait publié avec succès !" : "Tour package successfully published!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleStartEditTour = (t: any) => {
    setEditingTourId(t.id);
    setTourName(t.name);
    setTourTagline(t.tagline || "");
    setTourPrice(t.pricePerPerson || 1200);
    setTourDuration(t.durationDays || 5);
    setTourLocation(t.destinationId || "shantumbu-falls");
    setTourDesc(t.description || "");
    setTourFeaturesText(t.features ? t.features.join("\n") : "");
    setTourIsFeatured(!!t.isFeatured);
  };
  
  // Credentials state
  const [passcode, setPasscode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [resettingPasscode, setResettingPasscode] = useState(false);
  const [newCustomPasscode, setNewCustomPasscode] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem("admin_jwt_token"));
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<"firestore" | "express_sql">("firestore");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartMetric, setChartMetric] = useState<"volume" | "revenue">("volume");
  
  // Custom states for sorting and date-range filtering controls
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "price-desc" | "price-asc" | "guests-desc" | "guests-asc">("date-desc");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and statistics
  const activeBookingsList = dataSource === "express_sql" ? dbBookings : firestoreBookings;

  const dailyTrendsData = useMemo(() => {
    const datesMap: Record<string, { date: string; bookingsCount: number; revenue: number; seats: number }> = {};
    
    activeBookingsList.forEach((b) => {
      let dateStr = "Unknown";
      if (b.created_at) {
        dateStr = b.created_at.split("T")[0];
      } else if (b.createdAt) {
        const d = typeof b.createdAt === "string" 
          ? b.createdAt 
          : b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        try {
          dateStr = new Date(d).toISOString().split("T")[0];
        } catch {
          dateStr = String(b.createdAt).split("T")[0];
        }
      } else if (b.dateBooked) {
        dateStr = b.dateBooked;
      }
      
      if (!datesMap[dateStr]) {
        datesMap[dateStr] = { date: dateStr, bookingsCount: 0, revenue: 0, seats: 0 };
      }
      
      const seats = Number(b.seats || b.guestsCount || 0);
      const price = Number(b.total_price || b.totalPrice || 0);
      
      datesMap[dateStr].bookingsCount += 1;
      datesMap[dateStr].revenue += price;
      datesMap[dateStr].seats += seats;
    });

    return Object.values(datesMap)
      .filter((item) => item.date !== "Unknown")
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [activeBookingsList]);

  const registrationTrends = useMemo(() => {
    const trendsMap: Record<string, { date: string; membersCount: number; cumulativeMembers: number }> = {};
    const membersQuery = memberships || [];
    
    const sortedMembers = [...membersQuery].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });

    let runningCount = 0;
    sortedMembers.forEach((member) => {
      let dateStr = "Unknown";
      if (member.createdAt) {
        try {
          dateStr = new Date(member.createdAt).toISOString().split("T")[0];
        } catch {
          dateStr = String(member.createdAt).split("T")[0];
        }
      }
      if (dateStr === "Unknown" || !dateStr) {
        dateStr = new Date().toISOString().split("T")[0];
      }
      
      runningCount += 1;
      if (!trendsMap[dateStr]) {
        trendsMap[dateStr] = { date: dateStr, membersCount: 0, cumulativeMembers: 0 };
      }
      trendsMap[dateStr].membersCount += 1;
      trendsMap[dateStr].cumulativeMembers = runningCount;
    });

    if (Object.keys(trendsMap).length === 0) {
      const sortedBookings = [...activeBookingsList].sort((a, b) => getBookingDateVal(a) - getBookingDateVal(b));
      let bookingAccountCount = 0;
      const seenEmails = new Set<string>();
      
      sortedBookings.forEach((b) => {
        const email = b.customerEmail || b.email || "guest";
        if (!seenEmails.has(email)) {
          seenEmails.add(email);
          bookingAccountCount += 1;
          const dateStr = getBookingDateStr(b) || new Date().toISOString().split("T")[0];
          
          if (!trendsMap[dateStr]) {
            trendsMap[dateStr] = { date: dateStr, membersCount: 0, cumulativeMembers: 0 };
          }
          trendsMap[dateStr].membersCount += 1;
          trendsMap[dateStr].cumulativeMembers = bookingAccountCount;
        }
      });
    }

    return Object.values(trendsMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [memberships, activeBookingsList]);

  const revenueTrends = useMemo(() => {
    const revMap: Record<string, { date: string; dailyRevenue: number; cumulativeRevenue: number }> = {};
    
    const chronBookings = [...activeBookingsList]
      .filter((b) => b.status === "confirmed")
      .sort((a, b) => getBookingDateVal(a) - getBookingDateVal(b));
      
    let runningTotal = 0;
    chronBookings.forEach((b) => {
      const dateStr = getBookingDateStr(b) || "Unknown";
      if (dateStr === "Unknown") return;
      
      const price = Number(b.total_price || b.totalPrice || 0);
      runningTotal += price;
      
      if (!revMap[dateStr]) {
        revMap[dateStr] = { date: dateStr, dailyRevenue: 0, cumulativeRevenue: 0 };
      }
      revMap[dateStr].dailyRevenue += price;
      revMap[dateStr].cumulativeRevenue = runningTotal;
    });

    if (Object.keys(revMap).length === 0) {
      const chronBookingsAll = [...activeBookingsList]
        .sort((a, b) => getBookingDateVal(a) - getBookingDateVal(b));
      
      let runningTotalAll = 0;
      chronBookingsAll.forEach((b) => {
        const dateStr = getBookingDateStr(b) || "Unknown";
        if (dateStr === "Unknown") return;
        
        const price = Number(b.total_price || b.totalPrice || 0);
        runningTotalAll += price;
        
        if (!revMap[dateStr]) {
          revMap[dateStr] = { date: dateStr, dailyRevenue: 0, cumulativeRevenue: 0 };
        }
        revMap[dateStr].dailyRevenue += price;
        revMap[dateStr].cumulativeRevenue = runningTotalAll;
      });
    }
    
    return Object.values(revMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [activeBookingsList]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-brand-medium border border-brand-teal/30 p-3 rounded-xl shadow-xl font-mono text-[11px] text-white space-y-1 relative z-50">
          <p className="font-sans font-bold text-brand-teal mb-1 tracking-wide">{label}</p>
          <div className="flex justify-between gap-6">
            <span className="text-brand-sand/50">Bookings:</span>
            <span className="font-extrabold text-brand-gold-light">{payload[0]?.value}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-brand-sand/50">Seats Reserved:</span>
            <span className="font-extrabold text-teal-400">{payload[1]?.value !== undefined ? payload[1].value : payload[0]?.payload?.seats}</span>
          </div>
          <div className="flex justify-between gap-6 pt-1 border-t border-white/5">
            <span className="text-brand-sand/50">Est. Revenue:</span>
            <span className="font-extrabold text-amber-400">{formatAmount(payload[2]?.value !== undefined ? payload[2].value : payload[0]?.payload?.revenue)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Check if current authenticated user has admin email or custom administrative role / local keys
  const isAdminEmail = user?.email === "luyandobanjilb@gmail.com" || user?.isAdmin || user?.role === "admin" || localStorage.getItem("dreamscape_is_admin") === "true";

  useEffect(() => {
    if (isAdminEmail) {
      setIsAuthenticated(true);
    }
  }, [user, isAdminEmail]);

  useEffect(() => {
    // If we have an existing JWT token, we can automatically authenticate & fetch
    if (authToken) {
      setIsAuthenticated(true);
      setDataSource("express_sql");
      fetchDatabaseBookings(authToken);
    }
  }, [authToken]);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customPasscode = localStorage.getItem("dreamscape_admin_passcode");
    if (
      passcode === "travel2026" || 
      passcode === "travel@2026" || 
      passcode === "views1995" || 
      (customPasscode && passcode === customPasscode)
    ) {
      setIsAuthenticated(true);
      setErrorMsg("");
      setSuccessMsg("Logged in via authorized access token.");
    } else {
      setErrorMsg(language === "fr" ? "Code d'accès incorrect." : "Incorrect passcode access key.");
    }
  };

  const handleResetPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomPasscode.trim()) {
      setErrorMsg(language === "fr" ? "Le code ne peut pas être vide." : "Passcode cannot be blank.");
      return;
    }
    const cleanCode = newCustomPasscode.trim();
    localStorage.setItem("dreamscape_admin_passcode", cleanCode);
    setPasscode(cleanCode);
    setIsAuthenticated(true);
    setErrorMsg("");
    setSuccessMsg(language === "fr" ? `Succès! Code réinitialisé à "${cleanCode}".` : `Success! Code reset to "${cleanCode}" and logged in.`);
    setResettingPasscode(false);
  };

  const handleDbAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    try {
      setIsRefreshing(true);
      if (dbMode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        
        if (data.success) {
          localStorage.setItem("admin_jwt_token", data.token);
          setAuthToken(data.token);
          setIsAuthenticated(true);
          setDataSource("express_sql");
          await fetchDatabaseBookings(data.token);
          setSuccessMsg(`Welcome explorer ${data.user.name || ""}! Connected successfully via secure JWT session.`);
        } else {
          setErrorMsg(data.message || "Failed to login to DB account.");
        }
      } else {
        if (!registerName) {
          setErrorMsg("Full name is required for registration.");
          setIsRefreshing(false);
          return;
        }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: registerName, email, password, phone: registerPhone })
        });
        const data = await res.json();

        if (data.success) {
          localStorage.setItem("admin_jwt_token", data.token);
          setAuthToken(data.token);
          setIsAuthenticated(true);
          setDataSource("express_sql");
          await fetchDatabaseBookings(data.token);
          setSuccessMsg("Account successfully registered! Logged in as administrator.");
        } else {
          setErrorMsg(data.message || "Registration failed.");
        }
      }
    } catch (err: any) {
      setErrorMsg("Error communicating with authentication server. Check connection.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchDatabaseBookings = async (token: string) => {
    try {
      setIsRefreshing(true);
      const res = await fetch("/api/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDbBookings(data.bookings);
      }
    } catch (err) {
      console.error("Failed to query Express database records:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogoutAccount = () => {
    localStorage.removeItem("admin_jwt_token");
    setAuthToken(null);
    setIsAuthenticated(false);
    setDataSource("firestore");
    setDbBookings([]);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleStatusChange = async (bookingId: string, status: "pending" | "confirmed" | "cancelled") => {
    try {
      setIsRefreshing(true);
      if (dataSource === "express_sql" && authToken) {
        const res = await fetch(`/api/bookings/${bookingId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) {
          await fetchDatabaseBookings(authToken);
        } else {
          setErrorMsg(data.message || "Database update failure");
        }
      } else {
        await updateBookingStatus(bookingId, status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 450);
    }
  };

  const handlePermanentDelete = async (bookingId: string) => {
    const confirmationText = language === "fr" 
      ? "Voulez-vous vraiment annuler définitivement cette réservation ?" 
      : "Are you sure you want to permanently cancel this reservation? (This will restore available tour seats)";
      
    if (window.confirm(confirmationText)) {
      try {
        setIsRefreshing(true);
        if (dataSource === "express_sql" && authToken) {
          const res = await fetch(`/api/bookings/${bookingId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${authToken}`
            }
          });
          const data = await res.json();
          if (data.success) {
            await fetchDatabaseBookings(authToken);
          } else {
            alert(data.message || "Database deletion failure");
          }
        } else {
          await cancelBooking(bookingId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setIsRefreshing(false), 450);
      }
    }
  };

  // Determine which active bookings array to list
  // (already defined above)

  // Filter, search, date range, and sort logic
  const filteredBookings = useMemo(() => {
    let result = [...activeBookingsList];

    // 1. Status Filter
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    // 2. Date Range Filter
    if (filterStartDate) {
      result = result.filter((b) => {
        const bDateStr = getBookingDateStr(b);
        return bDateStr >= filterStartDate;
      });
    }
    if (filterEndDate) {
      result = result.filter((b) => {
        const bDateStr = getBookingDateStr(b);
        return bDateStr <= filterEndDate;
      });
    }

    // 3. Search Query Filter (Robust multi-field search)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((b) => {
        const docId = String(b.id || "").toLowerCase();
        const clientName = String(b.user_name || b.customerName || b.name || b.customer_name || "").toLowerCase();
        const clientEmail = String(b.email || b.customerEmail || "").toLowerCase();
        const clientPhone = String(b.customerPhone || b.phone || "").toLowerCase();
        const tourNameStr = String(b.tour_title || b.tourName || b.tourNameStr || "").toLowerCase();
        const notesStr = String(b.notes || "").toLowerCase();

        return (
          docId.includes(q) ||
          clientName.includes(q) ||
          clientEmail.includes(q) ||
          clientPhone.includes(q) ||
          tourNameStr.includes(q) ||
          notesStr.includes(q)
        );
      });
    }

    // 4. Advanced Sorting
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return getBookingDateVal(b) - getBookingDateVal(a);
      }
      if (sortBy === "date-asc") {
        return getBookingDateVal(a) - getBookingDateVal(b);
      }
      if (sortBy === "price-desc") {
        const priceA = Number(a.total_price || a.totalPrice || 0);
        const priceB = Number(b.total_price || b.totalPrice || 0);
        return priceB - priceA;
      }
      if (sortBy === "price-asc") {
        const priceA = Number(a.total_price || a.totalPrice || 0);
        const priceB = Number(b.total_price || b.totalPrice || 0);
        return priceA - priceB;
      }
      if (sortBy === "guests-desc") {
        const guestsA = Number(a.seats || a.guestsCount || 0);
        const guestsB = Number(b.seats || b.guestsCount || 0);
        return guestsB - guestsA;
      }
      if (sortBy === "guests-asc") {
        const guestsA = Number(a.seats || a.guestsCount || 0);
        const guestsB = Number(b.seats || b.guestsCount || 0);
        return guestsA - guestsB;
      }
      return 0;
    });

    return result;
  }, [activeBookingsList, statusFilter, sortBy, filterStartDate, filterEndDate, searchQuery]);

  // Helper selector to parse dates cleanly across database environments
  function getBookingDateStr(b: any): string {
    if (b.created_at) {
      return b.created_at.split("T")[0];
    }
    if (b.createdAt) {
      const d = typeof b.createdAt === "string" 
        ? b.createdAt 
        : b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      try {
        return new Date(d).toISOString().split("T")[0];
      } catch {
        return String(b.createdAt).split("T")[0];
      }
    }
    if (b.dateBooked) {
      return b.dateBooked;
    }
    return "";
  }

  function getBookingDateVal(b: any): number {
    const str = getBookingDateStr(b);
    if (!str) return 0;
    const t = new Date(str).getTime();
    return isNaN(t) ? 0 : t;
  }

  const stats = activeBookingsList.reduce(
    (acc, b) => {
      acc.total += 1;
      acc.guests += Number(b.seats || b.guestsCount || 0);
      const bookingPrice = Number(b.total_price || b.totalPrice || 0);
      if (b.status === "confirmed") {
        acc.confirmedRevenue += bookingPrice;
        acc.confirmedCount += 1;
      } else if (b.status === "pending") {
        acc.pendingCount += 1;
      } else if (b.status === "cancelled") {
        acc.cancelledCount += 1;
      }
      return acc;
    },
    { total: 0, guests: 0, confirmedRevenue: 0, confirmedCount: 0, pendingCount: 0, cancelledCount: 0 }
  );
  
  if (!isOpen) return null;

  return (
    <div id="admin-drawer-overlay" className="fixed inset-0 z-50 bg-brand-dark/80 backdrop-blur-md flex justify-end">
      {/* Drawer Body */}
      <div 
        id="admin-drawer-content"
        className="w-full max-w-4xl bg-brand-dark border-l border-brand-teal/20 h-full flex flex-col shadow-2xl relative overflow-hidden"
      >
        {/* Header decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/10 rounded-full blur-3xl pointer-events-none" />

        {/* Drawer Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center border border-brand-gold/30">
              <Shield className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide uppercase">
                {language === "fr" ? "Panneau d'Administration" : "Admin Command Center"}
              </h3>
              <p className="text-[10px] font-mono tracking-widest text-brand-teal uppercase mt-0.5">
                {authToken 
                  ? "Connected via Secure API JWT Session" 
                  : isAdminEmail 
                  ? "Logged in as Lead Administrator" 
                  : "Private Authorized Personnel Access Only"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-brand-sand/60 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
            aria-label="Close Admin Command Center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication Wall if not authorized */}
        {!isAuthenticated ? (
          <div className="flex-grow flex items-center justify-center p-8 relative z-10 overflow-y-auto">
            <div className="max-w-md w-full bg-brand-medium/50 backdrop-blur-lg border border-brand-teal/20 p-8 rounded-2xl shadow-xl text-center">
              <div className="inline-flex p-3.5 bg-brand-teal/10 rounded-full border border-brand-teal/20 mb-5">
                <Key className="w-8 h-8 text-brand-gold" />
              </div>
              <h4 className="font-serif text-xl font-bold text-white mb-2 uppercase tracking-wide">
                {language === "fr" ? "Verrouillage de Sécurité" : "Secure Credentials Required"}
              </h4>
              <p className="text-xs text-brand-sand/70 mb-6 font-sans leading-relaxed">
                Choose your preferred authorization channel to unlock administrative views:
              </p>

              {/* Tab Selector */}
              <div className="flex bg-brand-dark/60 border border-brand-teal/10 rounded-xl p-1 mb-5">
                <button
                  type="button"
                  onClick={() => { setAuthTab("passcode"); setErrorMsg(""); }}
                  className={`flex-1 py-2 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all ${
                    authTab === "passcode" ? "bg-brand-gold text-brand-dark font-extrabold" : "text-brand-sand/65 hover:text-white"
                  }`}
                  aria-label="Switch authentication tab to Global Passcode"
                >
                  Global Passcode
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab("db_auth"); setErrorMsg(""); }}
                  className={`flex-1 py-2 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all ${
                    authTab === "db_auth" ? "bg-brand-gold text-brand-dark font-extrabold" : "text-brand-sand/65 hover:text-white"
                  }`}
                  aria-label="Switch authentication tab to Database Account"
                >
                  Database Account (JWT)
                </button>
              </div>

              {authTab === "passcode" ? (
                resettingPasscode ? (
                  <form onSubmit={handleResetPasscode} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder={language === "fr" ? "Entrez le nouveau code d'accès" : "Enter new custom passcode"}
                        value={newCustomPasscode}
                        onChange={(e) => setNewCustomPasscode(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-brand-dark border border-brand-teal/20 rounded-xl text-brand-gold font-mono placeholder:text-brand-sand/35 focus:outline-none focus:border-brand-gold tracking-widest text-center transition-all animate-pulse"
                        required
                      />
                      {errorMsg && (
                        <p className="text-[11px] text-red-400 font-medium mt-2 text-center">{errorMsg}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-brand-gold to-brand-gold-light hover:brightness-110 text-brand-dark font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      {language === "fr" ? "Enregistrer & Connexion" : "Save Passcode & Login"}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => { setResettingPasscode(false); setErrorMsg(""); }}
                        className="text-[10px] uppercase tracking-widest text-brand-sand/55 hover:text-white transition-colors"
                        aria-label="Back to simple passcode login screen"
                      >
                        ← {language === "fr" ? "Retour au login" : "Back to simple login"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                    <div>
                      <input
                        type="password"
                        placeholder="Enter secret admin passcode"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="w-full px-4 py-3 text-sm bg-brand-dark border border-brand-teal/20 rounded-xl text-white font-mono placeholder:text-brand-sand/35 focus:outline-none focus:border-brand-gold tracking-widest text-center transition-all"
                        required
                      />
                      {errorMsg && (
                        <p className="text-[11px] text-red-400 font-medium mt-2 text-center">{errorMsg}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-brand-gold to-brand-gold-light hover:brightness-110 text-brand-dark font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Verify Passcode
                    </button>
                  </form>
                )
              ) : (
                <form onSubmit={handleDbAuthSubmit} className="space-y-4 text-left">
                  {dbMode === "register" && (
                    <div>
                      <label className="text-[9px] uppercase tracking-wider font-mono text-brand-teal mb-1 block">Full Name</label>
                      <input
                        type="text"
                        placeholder="Banji Luyando"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-brand-dark border border-brand-teal/20 rounded-xl text-white focus:outline-none focus:border-brand-gold transition-all"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-mono text-brand-teal mb-1 block">Email Address</label>
                    <input
                      type="email"
                      placeholder="luyandobanjilb@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-brand-dark border border-brand-teal/20 rounded-xl text-white focus:outline-none focus:border-brand-gold transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-mono text-brand-teal mb-1 block">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs bg-brand-dark border border-brand-teal/20 rounded-xl text-white focus:outline-none focus:border-brand-gold transition-all"
                      required
                    />
                  </div>

                  {dbMode === "register" && (
                    <div>
                      <label className="text-[9px] uppercase tracking-wider font-mono text-brand-teal mb-1 block">Phone Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="+260 97 1234567"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-brand-dark border border-brand-teal/20 rounded-xl text-white focus:outline-none focus:border-brand-gold transition-all"
                      />
                    </div>
                  )}

                  {errorMsg && (
                    <p className="text-[11px] text-red-400 font-medium text-center">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-brand-gold to-brand-gold-light hover:brightness-110 text-brand-dark font-extrabold text-[11px] tracking-wider uppercase rounded-xl transition-all shadow-md cursor-pointer text-center"
                  >
                    {dbMode === "login" ? "Verify Database Credentials" : "Create Admin Account"}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDbMode(dbMode === "login" ? "register" : "login");
                        setErrorMsg("");
                      }}
                      className="text-[10px] font-mono text-brand-sand/60 hover:text-white uppercase tracking-widest underline"
                      aria-label={dbMode === "login" ? "Switch to register admin account" : "Switch to log in admin account"}
                    >
                      {dbMode === "login" ? "Need a new DB account?" : "Have an account? Log in"}
                    </button>
                  </div>
                </form>
              )}

              {isDbEnabled && !user && (
                <div className="mt-6 pt-5 border-t border-white/5">
                  <p className="text-[10px] text-brand-sand/65 uppercase tracking-widest mb-3">Or Auth via SSO</p>
                  <button 
                    onClick={signIn}
                    className="w-full py-2.5 bg-brand-dark hover:bg-brand-teal/10 text-brand-sand text-xs border border-brand-teal/30 rounded-xl hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 font-semibold"
                    aria-label="Login with Lead Administrator email via Single Sign On"
                  >
                    🔐 Login with Lead Admin Email
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Premium Admin Management Center */
          <div className="flex-grow flex flex-col overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-brand-teal/20">
            {/* Quick Stats Panel */}
            <div className="p-6 bg-brand-dark border-b border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-brand-medium/40 border border-brand-teal/10 rounded-xl">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-teal block">Total Orders</span>
                <span className="text-xl font-serif font-black text-white block mt-1">{stats.total}</span>
              </div>
              <div className="p-4 bg-brand-medium/40 border border-brand-teal/10 rounded-xl">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-teal block">Confirmed Revenue</span>
                <span className="text-xl font-serif font-black text-brand-gold block mt-1">{formatAmount(stats.confirmedRevenue)}</span>
              </div>
              <div className="p-4 bg-brand-medium/40 border border-brand-teal/10 rounded-xl">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-teal block">Status Count</span>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono">
                  <span className="text-emerald-450">● {stats.confirmedCount}</span>
                  <span className="text-amber-400">● {stats.pendingCount}</span>
                  <span className="text-red-400">● {stats.cancelledCount}</span>
                </div>
              </div>
              <div className="p-4 bg-brand-medium/40 border border-brand-teal/10 rounded-xl">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-teal block">Seats Reserved</span>
                <span className="text-xl font-serif font-black text-teal-400 block mt-1">{stats.guests} guests</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 py-1 bg-brand-dark flex border-b border-white/5 gap-4 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveConsoleTab("bookings")}
                className={`pb-3 text-xs font-mono tracking-widest uppercase border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeConsoleTab === "bookings"
                    ? "border-brand-gold text-brand-gold font-extrabold"
                    : "border-transparent text-brand-sand/50 hover:text-white"
                }`}
                aria-label="Open Bookings Registry Tab"
              >
                📋 Bookings Registry
              </button>
              <button
                type="button"
                onClick={() => setActiveConsoleTab("health")}
                className={`pb-3 text-xs font-mono tracking-widest uppercase border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeConsoleTab === "health"
                    ? "border-brand-teal text-brand-teal font-extrabold"
                    : "border-transparent text-brand-sand/50 hover:text-white"
                }`}
                aria-label="Open System Health and Analytics Tab"
              >
                🛡️ System Health & Analytics
              </button>
              <button
                type="button"
                onClick={() => setActiveConsoleTab("tours")}
                className={`pb-3 text-xs font-mono tracking-widest uppercase border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeConsoleTab === "tours"
                    ? "border-brand-teal text-brand-teal font-extrabold"
                    : "border-transparent text-brand-sand/50 hover:text-white"
                }`}
                aria-label="Open Manage Tours Tab"
              >
                🦁 Manage Tours
              </button>
            </div>

            {activeConsoleTab === "bookings" && (
              <div className="flex flex-col">
                {/* Daily Booking Trends Visualization */}
                <div className="mx-6 mt-4 p-5 bg-brand-medium/30 border border-brand-teal/15 rounded-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
                <div>
                  <h4 className="font-serif text-xs font-bold text-white tracking-wide uppercase">
                    {language === "fr" ? "Tendances des Réservations Quotidiennes" : "Daily Booking Trends"}
                  </h4>
                  <p className="text-[9px] font-mono tracking-widest text-brand-teal uppercase mt-0.5">
                    Safari transaction volume and seat reserves
                  </p>
                </div>
                
                {/* Metric Selector Tabs */}
                <div className="flex bg-brand-dark/80 border border-white/5 rounded-lg p-0.5 shadow-inner">
                  <button
                    onClick={() => setChartMetric("volume")}
                    className={`px-3 py-1 text-[9px] font-mono uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                      chartMetric === "volume" 
                        ? "bg-brand-gold text-brand-dark font-extrabold shadow-sm" 
                        : "text-brand-sand/50 hover:text-white"
                    }`}
                    aria-label="View booking volume chart data"
                  >
                    Volume
                  </button>
                  <button
                    onClick={() => setChartMetric("revenue")}
                    className={`px-3 py-1 text-[9px] font-mono uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                      chartMetric === "revenue" 
                        ? "bg-brand-gold text-brand-dark font-extrabold shadow-sm" 
                        : "text-brand-sand/50 hover:text-white"
                    }`}
                    aria-label="View estimated booking revenue chart data"
                  >
                    Revenue
                  </button>
                </div>
              </div>
              
              {dailyTrendsData.length === 0 ? (
                <div className="h-44 flex items-center justify-center font-mono text-[11px] text-brand-sand/40 italic">
                  Not enough historical transaction records to populate daily trend charts.
                </div>
              ) : (
                <div className="h-44 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={dailyTrendsData}
                      margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSeats" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        tickLine={false}
                        axisLine={false}
                        dx={-4}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {chartMetric === "volume" ? (
                        <>
                          <Area 
                            type="monotone" 
                            dataKey="bookingsCount" 
                            name="Bookings" 
                            stroke="#0ea5e9" 
                            strokeWidth={2}
                            fill="url(#colorBookings)" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="seats" 
                            name="Seats" 
                            stroke="#2dd4bf" 
                            strokeWidth={2}
                            fill="url(#colorSeats)" 
                          />
                        </>
                      ) : (
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          name="Revenue" 
                          stroke="#0ea5e9" 
                          strokeWidth={2}
                          fill="url(#colorRevenue)" 
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Source and Status Controllers */}
            <div className="p-4 bg-brand-medium/20 border-b border-white/5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Database Source Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-brand-dark rounded-xl border border-white/5">
                  <button
                    onClick={() => { setDataSource("firestore"); setErrorMsg(""); }}
                    className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      dataSource === "firestore" ? "bg-brand-teal text-white font-bold" : "text-brand-sand/65 hover:text-white"
                    }`}
                    aria-label="Switch data source to Cloud Firestore"
                  >
                    Cloud Firestore
                  </button>
                  <button
                    onClick={() => {
                      if (!authToken) {
                        setErrorMsg("Please Authenticate using Database Credentials first.");
                        setAuthTab("db_auth");
                        setIsAuthenticated(false);
                      } else {
                        setDataSource("express_sql");
                        fetchDatabaseBookings(authToken);
                      }
                    }}
                    className={`px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      dataSource === "express_sql" ? "bg-brand-gold text-brand-dark font-extrabold" : "text-brand-sand/65 hover:text-white"
                    }`}
                    aria-label="Switch data source to JSON SQL Engine"
                  >
                    JSON-SQL Engine
                  </button>
                </div>

                {/* Session Logout Action */}
                {authToken && (
                  <button
                    onClick={handleLogoutAccount}
                    className="px-3 py-1 bg-red-950/40 border border-red-900/35 hover:bg-red-900/50 text-red-300 hover:text-white text-[9px] font-mono uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                    aria-label="Sign out admin database session"
                  >
                    Sign Out Account
                  </button>
                )}
              </div>

              {/* Status filter bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex gap-2">
                  {(["all", "pending", "confirmed", "cancelled"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all cursor-pointer ${
                        statusFilter === status
                          ? "bg-brand-gold text-brand-dark font-extrabold"
                          : "bg-white/5 text-brand-sand/70 hover:bg-white/10"
                      }`}
                      aria-label={`Filter bookings by status: ${status}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 text-xs font-mono text-brand-sand/60">
                  {isRefreshing && <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-gold" />}
                  <span>Active dataset: {dataSource === "express_sql" ? "Database SQL" : "Firestore"} ({filteredBookings.length})</span>
                </div>
              </div>

              {/* Advanced Controls Sub-Panel: Search, Sort, and Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-white/5">
                {/* Search */}
                <div className="sm:col-span-1 md:col-span-2 relative">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-brand-sand/50 mb-1 flex items-center gap-1">
                    <Search className="w-2.5 h-2.5 text-brand-teal" />
                    {language === "fr" ? "Recherche Voyageur / Circuit" : "Search Explorer / Tour"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={language === "fr" ? "ID, voyageur ou destination..." : "ID, explorer or destination..."}
                      className="w-full bg-brand-dark/95 border border-white/10 hover:border-brand-teal/30 focus:border-brand-teal text-[11px] font-mono text-white pl-8 pr-3 py-1.5 rounded-lg transition-all focus:outline-none placeholder-brand-sand/35"
                    />
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-brand-sand/40 pointer-events-none" />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery("")} 
                        className="absolute right-2.5 top-2 h-5 w-5 rounded-full flex items-center justify-center hover:bg-white/5 text-[9px] text-brand-sand/50 hover:text-white transition-all cursor-pointer"
                        aria-label="Clear booking search query"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Sort Order */}
                <div className="relative">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-brand-sand/50 mb-1 flex items-center gap-1">
                    <ArrowUpDown className="w-2.5 h-2.5 text-brand-gold" />
                    {language === "fr" ? "Trier par" : "Sort By"}
                  </label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="w-full bg-brand-dark border border-white/10 hover:border-brand-teal/30 focus:border-brand-teal text-[11px] font-mono text-white pl-2.5 pr-8 py-1.5 rounded-lg transition-all focus:outline-none cursor-pointer appearance-none"
                    >
                      <option value="date-desc">🕒 {language === "fr" ? "Récent d'abord" : "Recent Bookings"}</option>
                      <option value="date-asc">⏳ {language === "fr" ? "Ancien d'abord" : "Oldest Bookings"}</option>
                      <option value="price-desc">💰 {language === "fr" ? "Revenu élevé" : "Highest Revenue"}</option>
                      <option value="price-asc">🪙 {language === "fr" ? "Revenu faible" : "Lowest Revenue"}</option>
                      <option value="guests-desc">👥 {language === "fr" ? "Voyageurs: Max" : "Max Guests"}</option>
                      <option value="guests-asc">👤 {language === "fr" ? "Voyageurs: Min" : "Min Guests"}</option>
                    </select>
                    <ArrowUpDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-brand-sand/40 pointer-events-none" />
                  </div>
                </div>

                {/* Date range selection */}
                <div className="relative">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-brand-sand/50 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <CalendarRange className="w-2.5 h-2.5 text-teal-400" />
                      {language === "fr" ? "Dates de Réservation" : "Date Range"}
                    </span>
                    {(filterStartDate || filterEndDate) && (
                      <button 
                        onClick={() => { setFilterStartDate(""); setFilterEndDate(""); }}
                        className="text-[8px] text-brand-gold hover:underline cursor-pointer font-bold tracking-widest uppercase"
                        aria-label="Reset date filters"
                      >
                        Reset
                      </button>
                    )}
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="w-1/2 bg-brand-dark border border-white/10 hover:border-brand-teal/30 focus:border-brand-teal text-[9px] font-mono text-white px-1.5 py-1.5 rounded-lg transition-all focus:outline-none cursor-pointer"
                    />
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="w-1/2 bg-brand-dark border border-white/10 hover:border-brand-teal/30 focus:border-brand-teal text-[9px] font-mono text-white px-1.5 py-1.5 rounded-lg transition-all focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error displays inside drawer */}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3.5 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-xl font-mono">
                ⚠ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mx-6 mt-4 p-3.5 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs rounded-xl font-mono">
                ✔ {successMsg}
              </div>
            )}

            {/* Records List */}
            <div className="p-6 space-y-4">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm text-brand-sand/40 font-mono italic">No safari booking records found matching filter in this dataset.</p>
                </div>
              ) : (
                filteredBookings.map((book) => {
                  // Normalize mappings between SQL database fields and Firestore / local fields
                  const docId = book.id;
                  const tourNameStr = book.tour_title || book.tourName || "Luxury Custom Safari";
                  const clientName = book.user_name || book.customerName || "True Explorer";
                  const clientEmail = book.email || book.customerEmail || "";
                  const clientPhone = book.customerPhone || "";
                  const guests = book.seats || book.guestsCount || 1;
                  const price = book.total_price || book.totalPrice || 0;
                  const dateStamp = book.created_at ? book.created_at.split("T")[0] : (book.dateBooked || "Unknown");

                  return (
                    <div 
                      key={docId}
                      id={`admin-booking-card-${docId}`}
                      className="p-5 rounded-2xl bg-brand-medium/30 border border-white/5 hover:border-brand-teal/20 transition-all flex flex-col md:flex-row justify-between gap-4"
                    >
                      {/* Information Grid */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-medium text-brand-gold">REF: {docId}</span>
                          <span className={`text-[9px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full ${
                            book.status === "confirmed"
                              ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                              : book.status === "cancelled"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {book.status}
                          </span>
                          {(book.individualJoiningOthers || book.individual_joining_others) && (
                            <span className="text-[9px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-brand-teal/15 text-brand-teal border border-brand-teal/20">
                              Joining Group
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-serif text-base font-bold text-white tracking-wide">
                          {tourNameStr}
                        </h4>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-brand-sand/75">
                          <div>
                            <span className="text-brand-sand/40 font-mono text-[9px] uppercase tracking-wider block">Customer Name</span>
                            <strong>{clientName}</strong>
                          </div>
                          <div>
                            <span className="text-brand-sand/40 font-mono text-[9px] uppercase tracking-wider block">Date Booked</span>
                            <span>{dateStamp}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-brand-sand/40 font-mono text-[9px] uppercase tracking-wider block">Contact Information</span>
                            <span>{clientPhone ? `${clientPhone} / ` : ""}{clientEmail}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-brand-sand/40 font-mono text-[9px] uppercase tracking-wider block">Guests &amp; Pricing</span>
                            <strong>{guests} guests • <span className="text-brand-gold">{formatAmount(price)}</span></strong>
                          </div>
                        </div>
                      </div>

                      {/* Operational Action Buttons */}
                      <div className="flex flex-row md:flex-col items-stretch justify-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4">
                        {book.status !== "confirmed" && (
                          <button
                            onClick={() => handleStatusChange(docId, "confirmed")}
                            className="flex-1 md:flex-initial px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-brand-dark text-[10px] font-mono tracking-wider font-extrabold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            aria-label={`Confirm safari reservation for booking reference ${docId}`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        )}

                        {book.status !== "pending" && (
                          <button
                            onClick={() => handleStatusChange(docId, "pending")}
                            className="flex-1 md:flex-initial px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-brand-dark text-[10px] font-mono tracking-wider font-extrabold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            aria-label={`Set safari reservation status to pending for booking reference ${docId}`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </button>
                        )}

                        {book.status !== "cancelled" && (
                          <button
                            onClick={() => handleStatusChange(docId, "cancelled")}
                            className="flex-1 md:flex-initial px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-mono tracking-wider font-extrabold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            aria-label={`Cancel safari reservation for booking reference ${docId}`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}

                        <button
                          onClick={() => handlePermanentDelete(docId)}
                          className="p-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-400 hover:text-red-300 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                          title="Delete Record Permanently"
                          aria-label={`Permanently delete reservation record for booking reference ${docId}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeConsoleTab === "health" && (
          /* System Health Summary Tab (Interactive Recharts Panel) */
          <div className="p-6 space-y-6">
            {/* Health Overview Diagnostics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Network/Cloud Status */}
              <div className="p-4 bg-brand-medium/30 border border-brand-teal/15 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-brand-teal block">Infrastructure Status</span>
                  <span className="text-xs font-serif font-bold text-white block mt-0.5">CLOUD ONLINE</span>
                  <p className="text-[8px] font-mono text-brand-sand/55">Active connection &amp; SSL synced</p>
                </div>
              </div>

              {/* Hardened Policy Status */}
              <div className="p-4 bg-brand-medium/30 border border-brand-teal/15 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-teal/10 flex items-center justify-center border border-brand-teal/30 shrink-0">
                  <Shield className="w-4 h-4 text-brand-teal animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-brand-teal block">Security Policy</span>
                  <span className="text-xs font-serif font-bold text-white block mt-0.5">8-PILLAR ABAC</span>
                  <p className="text-[8px] font-mono text-brand-sand/55">Firestore secure ruleset</p>
                </div>
              </div>

              {/* Registered Club memberships status */}
              <div className="p-4 bg-brand-medium/30 border border-brand-teal/15 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center border border-brand-gold/30 shrink-0">
                  <Users className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-brand-teal block">Club Registrations</span>
                  <span className="text-xs font-serif font-bold text-brand-gold block mt-0.5">{(memberships || []).length} Registered</span>
                  <p className="text-[8px] font-mono text-brand-sand/55 font-bold">Active Membership Ledger</p>
                </div>
              </div>
            </div>

            {/* User Registration Trends Chart (recharts) */}
            <div className="p-5 bg-brand-medium/20 border border-brand-teal/10 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="mb-4">
                <h4 className="font-serif text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-teal animate-pulse" />
                  User Registration &amp; Account Entry Trends
                </h4>
                <p className="text-[9px] font-mono tracking-widest text-brand-teal uppercase mt-0.5">
                  Cumulative registered users and premium safari club membership approvals
                </p>
              </div>

              {registrationTrends.length === 0 ? (
                <div className="h-44 flex items-center justify-center font-mono text-[11px] text-brand-sand/40 italic">
                  No user registration or membership records available yet.
                </div>
              ) : (
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={registrationTrends}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#94a3b8" 
                        fontSize={8} 
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={8} 
                        tickLine={false}
                        axisLine={false}
                        dx={-4}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111c1c', 
                          borderColor: 'rgba(45, 212, 191, 0.3)', 
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          borderRadius: '12px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cumulativeMembers" 
                        name="Total Accounts" 
                        stroke="#2dd4bf" 
                        strokeWidth={2}
                        fill="url(#colorMembers)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Revenue Growth Trend Chart (recharts) */}
            <div className="p-5 bg-brand-medium/20 border border-[#eab308]/15 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#eab308]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h4 className="font-serif text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-brand-gold animate-bounce" />
                    Total Platform Cumulative Revenue
                  </h4>
                  <p className="text-[9px] font-mono tracking-widest text-[#eab308] uppercase mt-0.5">
                    Cumulative transaction income compiled across confirmed client bookings
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-brand-sand/50 block">Aggregated Confirmed</span>
                  <span className="text-sm font-serif font-black text-brand-gold">{formatAmount(stats.confirmedRevenue)}</span>
                </div>
              </div>

              {revenueTrends.length === 0 ? (
                <div className="h-44 flex items-center justify-center font-mono text-[11px] text-brand-sand/40 italic">
                  No transaction revenue data compiled for confirmed bookings yet.
                </div>
              ) : (
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueTrends}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCumulativeRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#eab308" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.05} vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#94a3b8" 
                        fontSize={8} 
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        fontSize={8} 
                        tickLine={false}
                        axisLine={false}
                        dx={-4}
                        tickFormatter={(value) => formatAmount(value).replace(/\.00$/, "")}
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatAmount(value), "Cumulative Revenue"]}
                        contentStyle={{ 
                          backgroundColor: '#111c1c', 
                          borderColor: 'rgba(234, 179, 8, 0.3)', 
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          borderRadius: '12px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cumulativeRevenue" 
                        name="Revenue Flow" 
                        stroke="#eab308" 
                        strokeWidth={2}
                        fill="url(#colorCumulativeRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Membership tier distribution details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-brand-medium/15 border border-brand-teal/10 rounded-xl relative overflow-hidden text-center">
                <span className="text-[9px] font-mono uppercase text-brand-sand/60">Savannah Elite Tier</span>
                <strong className="block text-2xl text-brand-teal mt-1">
                  {memberships?.filter(m => m.membershipTier === "savannah_elite").length || 0}
                </strong>
                <span className="text-[8px] font-mono text-brand-sand/50 block mt-0.5">Tier 1 Club Member Ledger</span>
              </div>
              <div className="p-4 bg-brand-medium/15 border border-brand-teal/10 rounded-xl relative overflow-hidden text-center">
                <span className="text-[9px] font-mono uppercase text-brand-sand/60">Kafue Prestige Tier</span>
                <strong className="block text-2xl text-brand-gold mt-1">
                  {memberships?.filter(m => m.membershipTier === "kafue_prestige").length || 0}
                </strong>
                <span className="text-[8px] font-mono text-brand-sand/50 block mt-0.5">Tier 2 Club Member Ledger</span>
              </div>
              <div className="p-4 bg-brand-medium/15 border border-brand-teal/10 rounded-xl relative overflow-hidden text-center">
                <span className="text-[9px] font-mono uppercase text-brand-sand/60">Luangwa Imperial Tier</span>
                <strong className="block text-2xl text-orange-500 mt-1">
                  {memberships?.filter(m => m.membershipTier === "luangwa_imperial").length || 0}
                </strong>
                <span className="text-[8px] font-mono text-brand-sand/50 block mt-0.5">Tier 3 Club Member Ledger</span>
              </div>
            </div>
          </div>
        )}

        {activeConsoleTab === "tours" && (
          <div className="p-6 space-y-6">
            <div className="mb-2">
              <h4 className="font-serif text-sm font-bold text-white tracking-wide uppercase">
                {language === "fr" ? "Gestion des Circuits de Voyage" : "Bespoke Tours & Packages"}
              </h4>
              <p className="text-[9px] font-mono tracking-widest text-brand-teal uppercase mt-0.5">
                Configure luxury packages published instantly for all clients
              </p>
            </div>

            {/* Create/Edit form */}
            <form onSubmit={handlePublishTour} className="p-5 bg-brand-medium/20 border border-brand-teal/15 rounded-2xl space-y-4">
              <span className="text-xs font-serif font-black text-white block">
                {editingTourId ? "Modify Safari Package" : "Publish New Tour Package"}
              </span>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-teal block mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-brand-dark/80 text-white border border-white/10 rounded-xl text-xs focus:border-brand-teal/50 outline-none"
                    placeholder="e.g. Shantumbu Falls Tour"
                    value={tourName}
                    onChange={(e) => setTourName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-teal block mb-1">Tagline</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-brand-dark/80 text-white border border-white/10 rounded-xl text-xs focus:border-brand-teal/50 outline-none"
                    placeholder="Pristine wilderness redefined"
                    value={tourTagline}
                    onChange={(e) => setTourTagline(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-brand-teal block mb-1">Price Per Person (USD)</label>
                    <input
                      type="number"
                      required
                      className="w-full px-3 py-2 bg-brand-dark/80 text-white border border-white/10 rounded-xl text-xs focus:border-brand-teal/50 outline-none font-mono"
                      value={tourPrice}
                      onChange={(e) => setTourPrice(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-brand-teal block mb-1">Duration (Days)</label>
                    <input
                      type="number"
                      required
                      className="w-full px-3 py-2 bg-brand-dark/80 text-white border border-white/10 rounded-xl text-xs focus:border-brand-teal/50 outline-none font-mono"
                      value={tourDuration}
                      onChange={(e) => setTourDuration(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-teal block mb-1">Destination Target</label>
                  <select
                    className="w-full px-3 py-2 bg-brand-dark/80 text-brand-sand border border-white/10 rounded-xl text-xs focus:border-brand-teal/50 outline-none cursor-pointer"
                    value={tourLocation}
                    onChange={(e) => setTourLocation(e.target.value)}
                  >
                    <option value="shantumbu-falls">Shantumbu Falls &amp; Lusaka Escarpment</option>
                    <option value="kafue-national-park">Kafue National Park (Wilderness &amp; Camps)</option>
                    <option value="livingstone-falls">Victoria Falls &amp; Livingstone Expedition</option>
                    <option value="south-luangwa">South Luangwa National Park Wildlife</option>
                    <option value="lower-zambezi">Lower Zambezi National River Cruise</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-teal block mb-1">Included Features (one per line)</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 bg-brand-dark/80 text-white border border-white/10 rounded-xl text-xs focus:border-brand-teal/50 outline-none font-sans"
                    placeholder="Luxury high-clearance 4x4 transfers&#10;Zambian gourmet snack basket included"
                    value={tourFeaturesText}
                    onChange={(e) => setTourFeaturesText(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-brand-teal block mb-1">Full Itinerary Description</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 bg-brand-dark/80 text-white border border-white/10 rounded-xl text-xs focus:border-brand-teal/50 outline-none font-sans"
                    placeholder="Brief overview of the experience"
                    value={tourDesc}
                    onChange={(e) => setTourDesc(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="drawer-tour-featured"
                    className="rounded border-white/10 text-brand-teal focus:ring-0 bg-brand-dark/80"
                    checked={tourIsFeatured}
                    onChange={(e) => setTourIsFeatured(e.target.checked)}
                  />
                  <label htmlFor="drawer-tour-featured" className="text-xs text-brand-sand/80 cursor-pointer selection:bg-transparent">
                    Mark Tour as Featured
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-gold hover:bg-yellow-600 text-brand-dark text-xs font-mono uppercase tracking-wider font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editingTourId ? "Commit Edits" : "Publish Tour Package"}</span>
                </button>
                {editingTourId && (
                  <button
                    type="button"
                    onClick={resetTourForm}
                    className="px-3 py-2 bg-brand-dark hover:bg-brand-teal/15 text-brand-sand hover:text-white text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {/* Tours Inventory List inside Drawer */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-mono uppercase tracking-widest text-brand-teal font-bold">Active Catalog ({tours?.length || 0})</h5>
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-brand-teal/20 pr-1">
                {(tours || []).map((t) => (
                  <div key={t.id} className="p-3 bg-brand-medium/40 border border-white/5 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="font-serif text-xs font-bold text-white block truncate">{t.name}</span>
                      <span className="text-[10px] text-brand-sand/60 block mt-0.5">{t.durationDays} Days • <span className="text-brand-gold font-bold">{formatAmount(t.pricePerPerson)}</span></span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditTour(t)}
                        className="p-1.5 bg-brand-dark hover:bg-brand-teal/10 border border-brand-teal/20 text-brand-teal rounded-lg transition-all cursor-pointer"
                        title="Edit Tour Package"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Permanently delete this tour package from active packages?")) {
                            deleteTour(t.id);
                          }
                        }}
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-400 rounded-lg transition-all cursor-pointer"
                        title="Delete Tour Package"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
</div>
  );
}
