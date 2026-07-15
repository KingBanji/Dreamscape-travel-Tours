import React, { useState, useEffect, useMemo } from "react";
import { 
  Shield, Key, Sparkles, Compass, Users, DollarSign, Mail, 
  Trash2, Plus, Edit, Check, X, ArrowLeft, RefreshCw, Send, HelpCircle,
  MessageSquare
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from "recharts";
import { TOUR_PACKAGES } from "../data/travelData";
import { useAuthAndData } from "../lib/FirebaseContext";
import { useLanguage } from "../lib/LanguageContext";
import { useCurrency } from "../lib/CurrencyContext";
import { useGoogleWorkspace } from "../lib/GoogleWorkspaceContext";
import { db, isFirebaseEnabled, handleFirestoreError, OperationType, triggerWelcomeEmail } from "../lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";

interface AdminPortalPageProps {
  onBackToMain: () => void;
}

export default function AdminPortalPage({ onBackToMain }: AdminPortalPageProps) {
  const { user, bookings, signIn, tours: localTours, publishTour, deleteTour } = useAuthAndData();
  const { accessToken, sendEmailViaGmail, signInWithWorkspace, listChatSpaces, sendChatMessage } = useGoogleWorkspace();
  const { language } = useLanguage();
  const { formatAmount } = useCurrency();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authTab, setAuthTab] = useState<"passcode" | "db_auth">("passcode");
  const [passcode, setPasscode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resettingPasscode, setResettingPasscode] = useState(false);
  const [newCustomPasscode, setNewCustomPasscode] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<"tours" | "inquiries" | "sales" | "clients" | "newsletter" | "google_chat">("tours");

  // Google Chat integration states
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>(() => {
    return localStorage.getItem("dreamscape_selected_chat_space") || "";
  });
  const [chatMessageText, setChatMessageText] = useState("");
  const [isFetchingSpaces, setIsFetchingSpaces] = useState(false);
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);
  const [chatError, setChatError] = useState("");

  // Clients directory state
  const [clients, setClients] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState("");

  // Newsletter states
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [dispatchSubject, setDispatchSubject] = useState("");
  const [dispatchContent, setDispatchContent] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);

  // Tours state is now globally managed and synchronized via useAuthAndData()

  // Tour form states
  const [editingTourId, setEditingTourId] = useState<string | null>(null);
  const [newTourName, setNewTourName] = useState("");
  const [newTourTagline, setNewTourTagline] = useState("");
  const [newTourPrice, setNewTourPrice] = useState(1200);
  const [newTourDuration, setNewTourDuration] = useState(5);
  const [newTourLocation, setNewTourLocation] = useState("shantumbu-falls");
  const [newTourDesc, setNewTourDesc] = useState("");
  const [newTourFeaturesText, setNewTourFeaturesText] = useState("");
  const [newTourIsFeatured, setNewTourIsFeatured] = useState(false);
  const [newTourItinerary, setNewTourItinerary] = useState<any[]>([]);

  useEffect(() => {
    const duration = Number(newTourDuration) || 1;
    setNewTourItinerary((prev) => {
      const next = [...prev];
      if (next.length < duration) {
        for (let i = next.length; i < duration; i++) {
          next.push({
            day: i + 1,
            title: `Day ${i + 1} Highlight`,
            description: "",
            accommodation: "Luxury Safari Camp",
            meals: "Breakfast / Lunch / Dinner"
          });
        }
      }
      return next.slice(0, duration);
    });
  }, [newTourDuration]);

  // Load Google Chat spaces helper
  const handleLoadChatSpaces = async () => {
    if (!accessToken) return;
    setIsFetchingSpaces(true);
    setChatError("");
    try {
      const spaces = await listChatSpaces();
      setChatSpaces(spaces);
      if (spaces.length > 0 && !selectedSpace) {
        setSelectedSpace(spaces[0].name);
        localStorage.setItem("dreamscape_selected_chat_space", spaces[0].name);
      }
    } catch (err: any) {
      console.error("Failed fetching spaces", err);
      setChatError(err?.message || "Failed to retrieve Google Chat spaces.");
    } finally {
      setIsFetchingSpaces(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      handleLoadChatSpaces();
    }
  }, [accessToken]);

  // Inquiries database state
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Reply state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Check admin email
  const isAdminEmail = user?.email === "luyandobanjilb@gmail.com" || user?.isAdmin || user?.role === "admin" || localStorage.getItem("dreamscape_is_admin") === "true";

  useEffect(() => {
    if (isAdminEmail) {
      setIsAuthenticated(true);
    }
  }, [user, isAdminEmail]);

  // Load inquiries live from Firestore (with localstorage fallback)
  useEffect(() => {
    if (isFirebaseEnabled && db && user && isAdminEmail) {
      const unsub = onSnapshot(collection(db, "inquiries"), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((snap) => {
          list.push({ id: snap.id, ...snap.data() });
        });
        // Sort inquiries newest first
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setInquiries(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, "inquiries");
        loadLocalInquiries();
      });
      return () => unsub();
    } else {
      loadLocalInquiries();
    }
  }, [user]);

  // Load clients live from Firestore (with localstorage fallback) and merge with SQL clients
  useEffect(() => {
    let unsub: () => void = () => {};
    let sqlClients: any[] = [];
    let firestoneClients: any[] = [];

    const fetchSqlClients = async () => {
      try {
        const res = await fetch("/api/admin/clients");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.clients) {
            sqlClients = data.clients;
            mergeLists();
          }
        }
      } catch (e) {
        console.warn("Error fetching SQL clients:", e);
      }
    };

    const mergeLists = () => {
      const mergedMap = new Map<string, any>();
      
      // 1. Add SQL clients
      sqlClients.forEach(c => {
        if (c.email) {
          mergedMap.set(c.email.toLowerCase(), {
            ...c,
            source: "standard"
          });
        }
      });

      // 2. Add/Overwrite with Firestore clients if they exist
      firestoneClients.forEach(c => {
        if (c.email) {
          const emailKey = c.email.toLowerCase();
          const existing = mergedMap.get(emailKey);
          
          let createdAtVal = c.createdAt;
          if (createdAtVal && typeof createdAtVal === "object" && createdAtVal.seconds) {
            createdAtVal = new Date(createdAtVal.seconds * 1000).toISOString();
          } else if (!createdAtVal) {
            createdAtVal = new Date().toISOString();
          }

          mergedMap.set(emailKey, {
            uid: c.uid || c.id || existing?.uid || `fs-${Date.now()}`,
            name: c.name || existing?.name || "Explorer",
            email: c.email,
            phone: c.phone || existing?.phone || "",
            createdAt: createdAtVal,
            totalBookings: c.totalBookings !== undefined ? c.totalBookings : (existing?.totalBookings || 0),
            totalSpent: c.totalSpent !== undefined ? c.totalSpent : (existing?.totalSpent || 0),
            billingSummary: c.billingSummary || existing?.billingSummary || {
              totalInvoices: c.totalBookings || 0,
              paid: c.totalBookings || 0,
              outstanding: 0
            },
            source: "google"
          });
        }
      });

      const combined = Array.from(mergedMap.values());
      // Sort combined list newest first
      combined.sort((a, b) => {
        const t1 = new Date(a.createdAt || 0).getTime();
        const t2 = new Date(b.createdAt || 0).getTime();
        return t2 - t1;
      });

      setClients(combined);
      localStorage.setItem("dreamscape_clients", JSON.stringify(combined));
    };

    fetchSqlClients();

    if (isFirebaseEnabled && db && user && user.email === "luyandobanjilb@gmail.com") {
      unsub = onSnapshot(collection(db, "clients"), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((snap) => {
          list.push({ uid: snap.id, ...snap.data() });
        });
        firestoneClients = list;
        mergeLists();
      }, (error) => {
        console.warn("Firestore collection clients list error:", error);
        loadLocalClients();
      });
    } else {
      loadLocalClients();
    }

    return () => {
      unsub();
    };
  }, [user]);

  const loadLocalClients = async () => {
    try {
      const res = await fetch("/api/admin/clients");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.clients) {
          setClients(data.clients);
          localStorage.setItem("dreamscape_clients", JSON.stringify(data.clients));
          return;
        }
      }
    } catch (apiErr) {
      console.warn("Failed fetching live database clients, falling back to local storage:", apiErr);
    }

    try {
      const stored = localStorage.getItem("dreamscape_clients");
      if (stored) {
        setClients(JSON.parse(stored));
      } else {
        const mockClients = [
          {
            uid: "USR001",
            name: "Kalila Mwansa",
            email: "kalila@example.com",
            phone: "+260971234567",
            createdAt: "2026-05-20T10:00:00.000Z",
            totalBookings: 3,
            totalSpent: 32400,
            billingSummary: {
              totalInvoices: 3,
              paid: 2,
              outstanding: 1
            }
          },
          {
            uid: "USR002",
            name: "Chipo Banda",
            email: "chipo@example.com",
            phone: "+260976543210",
            createdAt: "2026-06-01T14:30:00.000Z",
            totalBookings: 1,
            totalSpent: 650,
            billingSummary: {
              totalInvoices: 1,
              paid: 1,
              outstanding: 0
            }
          }
        ];
        setClients(mockClients);
        localStorage.setItem("dreamscape_clients", JSON.stringify(mockClients));
      }
    } catch (err) {
      console.error("Local storage clients parse error", err);
    }
  };

  const loadLocalInquiries = () => {
    try {
      const stored = localStorage.getItem("dreamscape_inquiries");
      if (stored) {
        setInquiries(JSON.parse(stored));
      } else {
        // Mock inquiries so there is rich material to showcase by default
        const mockList = [
          {
            id: "inq-mock-1",
            customerName: "Alistair Cook",
            customerEmail: "alistair.cook@expedition.co.uk",
            customerPhone: "+44 7911 123456",
            message: "Looking to reserve a premium honeymoon package to Shantumbu Falls. Is chartered flight transport included?",
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            replied: false,
            replyText: null
          },
          {
            id: "inq-mock-2",
            customerName: "Sarah Jenkins",
            customerEmail: "sarahj@safari-guide.org",
            customerPhone: "+1 (555) 019-2834",
            message: "Can we request an eco-sustainable guide fluent in English and French for the August Elephant Tracking tour?",
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            replied: true,
            replyText: "Hi Sarah! Yes, all our expert guides on the Elephant Tracking tour are fully certified in bilingual communication and eco-sustainable safari techniques."
          }
        ];
        setInquiries(mockList);
        localStorage.setItem("dreamscape_inquiries", JSON.stringify(mockList));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load newsletter subscribers live from Firestore
  useEffect(() => {
    if (isFirebaseEnabled && db && user && user.email === "luyandobanjilb@gmail.com") {
      const unsub = onSnapshot(collection(db, "newsletter_subscribers"), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((snap) => {
          list.push({ id: snap.id, ...snap.data() });
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setSubscribers(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, "newsletter_subscribers");
        loadLocalSubscribers();
      });
      return () => unsub();
    } else {
      loadLocalSubscribers();
    }
  }, [user]);

  const loadLocalSubscribers = () => {
    try {
      const stored = localStorage.getItem("dreamscape_newsletter_subscribers");
      if (stored) {
        setSubscribers(JSON.parse(stored));
      } else {
        const mockList = [
          {
            id: "sub-mock-1",
            email: "adventure.seeker@gmail.com",
            createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
          },
          {
            id: "sub-mock-2",
            email: "wildlife_photographer@yahoo.com",
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
          }
        ];
        setSubscribers(mockList);
        localStorage.setItem("dreamscape_newsletter_subscribers", JSON.stringify(mockList));
      }
    } catch (err) {
      console.error("Local storage subscribers parse error", err);
    }
  };

  // Load dispatched newsletters live from Firestore
  useEffect(() => {
    if (isFirebaseEnabled && db && user && user.email === "luyandobanjilb@gmail.com") {
      const unsub = onSnapshot(collection(db, "dispatched_newsletters"), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((snap) => {
          list.push({ id: snap.id, ...snap.data() });
        });
        list.sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime());
        setDispatches(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, "dispatched_newsletters");
        loadLocalDispatches();
      });
      return () => unsub();
    } else {
      loadLocalDispatches();
    }
  }, [user]);

  const loadLocalDispatches = () => {
    try {
      const stored = localStorage.getItem("dreamscape_dispatched_newsletters");
      if (stored) {
        setDispatches(JSON.parse(stored));
      } else {
        const mockList = [
          {
            id: "dispatch-mock-1",
            subject: "The Great Luangwa Migration Begins!",
            content: "Dear explorers, the elephant herds are on the move! Experience the majestic walks of South Luangwa with our limited bookings.",
            sentAt: new Date(Date.now() - 3600000 * 120).toISOString(),
            recipientCount: 2
          }
        ];
        setDispatches(mockList);
        localStorage.setItem("dreamscape_dispatched_newsletters", JSON.stringify(mockList));
      }
    } catch (err) {
      console.error("Local storage dispatches parse error", err);
    }
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchSubject.trim() || !dispatchContent.trim()) {
      alert("Please fill in both the subject and the content.");
      return;
    }

    if (subscribers.length === 0) {
      alert("You have no subscribers to dispatch this newsletter to.");
      return;
    }

    setIsDispatching(true);
    const dispatchId = `dispatch-${Date.now()}`;
    const newDispatch = {
      id: dispatchId,
      subject: dispatchSubject.trim(),
      content: dispatchContent.trim(),
      sentAt: new Date().toISOString(),
      recipientCount: subscribers.length
    };

    try {
      let activeToken = accessToken;

      if (!activeToken) {
        const wantReal = window.confirm(
          "Google Workspace GMail connection is not active.\n\n" +
          "• Click OK to sign in with Google Workspace to send REAL broadcast emails straight to your subscribers now.\n" +
          "• Click Cancel to perform an offline simulation dispatch."
        );
        if (wantReal) {
          try {
            activeToken = await signInWithWorkspace();
          } catch (authErr: any) {
            console.warn("On-the-fly workspace authorization skipped or failed:", authErr);
            setIsDispatching(false);
            return;
          }
        }
      }

      let sentCount = 0;
      let failedCount = 0;

      for (const sub of subscribers) {
        if (sub.email) {
          try {
            if (activeToken) {
              const newsletterHtml = `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 32px; background-color: #fcfbf7; border-radius: 20px; border: 1px solid #e1dcce; max-width: 600px; margin: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                  <div style="text-align: center; margin-bottom: 28px; border-bottom: 1px solid #f0ede6; padding-bottom: 20px;">
                    <h2 style="color: #115e59; font-family: serif; font-size: 24px; font-weight: bold; margin: 0 0 6px 0; letter-spacing: 0.5px; text-transform: uppercase;">Dreamscape Tours Zambia</h2>
                    <span style="font-size: 10px; text-transform: uppercase; background-color: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-family: monospace; border: 1px solid #fde68a;">Official Wilderness Gazette</span>
                  </div>
                  
                  <h3 style="color: #1a2e26; font-family: serif; font-size: 18px; font-weight: bold; margin-bottom: 16px; line-height: 1.4;">${dispatchSubject.trim()}</h3>
                  
                  <div style="font-size: 14px; color: #3f3f46; line-height: 1.7; white-space: pre-wrap; margin-bottom: 28px;">
                    ${dispatchContent.trim()}
                  </div>

                  <div style="background-color: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0; padding: 16px; margin-bottom: 28px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #166534; font-weight: bold;">Ready to secure your spot?</p>
                    <p style="margin: 0; font-size: 11px; color: #15803d; line-height: 1.5;">Contact our certified expert guide Banji Luyando on WhatsApp or visit our online explorer desk to request custom quotes or dates!</p>
                  </div>
                  
                  <div style="text-align: center; border-top: 1px solid #f0ede6; padding-top: 20px; font-size: 10px; color: #a1a1aa; font-family: monospace;">
                    You are receiving this because you registered at the Dreamscape Wilderness Registry.<br/>
                    © ${new Date().getFullYear()} Dreamscape Tours Zambia. All Rights Reserved.
                  </div>
                </div>
              `;
              await sendEmailViaGmail(sub.email, dispatchSubject.trim(), newsletterHtml, activeToken);
              sentCount++;
            } else {
              console.log(`[NEWSLETTER SIMULATOR] Dispatching "${dispatchSubject.trim()}" to subscriber: ${sub.email}`);
              sentCount++;
            }
          } catch (mailErr) {
            console.error(`Failed to send email to ${sub.email}:`, mailErr);
            failedCount++;
          }
        }
      }

      if (isFirebaseEnabled && db && user && user.email === "luyandobanjilb@gmail.com") {
        await setDoc(doc(db, "dispatched_newsletters", dispatchId), {
          ...newDispatch,
          sentCount,
          failedCount,
          status: failedCount === 0 ? "Delivered" : "Partial Delivery"
        });
      }
      
      const updated = [newDispatch, ...dispatches];
      setDispatches(updated);
      localStorage.setItem("dreamscape_dispatched_newsletters", JSON.stringify(updated));

      // Clear form
      setDispatchSubject("");
      setDispatchContent("");
      
      if (activeToken) {
        setSuccessMsg(`Successfully sent "${newDispatch.subject}" to ${sentCount} subscriber(s) via Google Mail API!${failedCount > 0 ? ` (${failedCount} failed)` : ""}`);
      } else {
        setSuccessMsg(`Successfully dispatched "${newDispatch.subject}" locally to ${sentCount} subscriber(s)! (Connect Google Workspace above to transmit actual emails).`);
      }
      setTimeout(() => setSuccessMsg(""), 7000);
    } catch (err) {
      console.error("Newsletter dispatch error:", err);
      alert("Failed to complete newsletter broadcast.");
    } finally {
      setIsDispatching(false);
    }
  };

  const handleSendChatManualMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpace) {
      alert("Please select a Google Chat space first.");
      return;
    }
    if (!chatMessageText.trim()) return;

    setIsSendingChatMessage(true);
    setChatError("");
    try {
      await sendChatMessage(selectedSpace, chatMessageText.trim());
      setSuccessMsg("Successfully posted message to Google Chat space!");
      setChatMessageText("");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      console.error("Failed sending Google Chat message", err);
      setChatError(err?.message || "Failed to post message to Google Chat.");
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  const handleDeleteSubscriber = async (subId: string) => {
    if (!window.confirm("Permanently unsubscribe this user?")) return;
    try {
      if (isFirebaseEnabled && db && user && user.email === "luyandobanjilb@gmail.com") {
        await deleteDoc(doc(db, "newsletter_subscribers", subId));
      }
      const updated = subscribers.filter((s) => s.id !== subId);
      setSubscribers(updated);
      localStorage.setItem("dreamscape_newsletter_subscribers", JSON.stringify(updated));
      setSuccessMsg("Subscriber unsubscribed successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error unsubscribing user:", err);
      alert("Unsubscribe failed.");
    }
  };

  // Persist managed tours is handled by public snapshot listeners in FirebaseContext

  // Handle Passcode login submit
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
      setSuccessMsg("Logged in successfully as Admin.");
    } else {
      setErrorMsg("Error: Invalid passcode access key.");
    }
  };

  // Reset admin passcode helper
  const handleResetPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomPasscode.trim()) {
      setErrorMsg("Error: Passcode cannot be blank.");
      return;
    }
    const cleanCode = newCustomPasscode.trim();
    localStorage.setItem("dreamscape_admin_passcode", cleanCode);
    setPasscode(cleanCode);
    setIsAuthenticated(true);
    setErrorMsg("");
    setSuccessMsg(`Success! Admin passcode reset to "${cleanCode}" and logged in.`);
    setResettingPasscode(false);
  };

  // Handle Database Password login submit
  const handleDbAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Error: Email and password are required.");
      return;
    }
    // Simulate auth / check admin permissions
    if (email === "luyandobanjilb@gmail.com" && password === "admin") {
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Error: Authorization failed. Only admin accounts exist.");
    }
  };

  // Manage Tours actions
  const resetTourForm = () => {
    setEditingTourId(null);
    setNewTourName("");
    setNewTourTagline("");
    setNewTourPrice(1200);
    setNewTourDuration(5);
    setNewTourLocation("shantumbu-falls");
    setNewTourDesc("");
    setNewTourFeaturesText("");
    setNewTourIsFeatured(false);
    setNewTourItinerary([]);
  };

  const handleCreateTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourName) return;
    
    const parsedFeatures = newTourFeaturesText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const newTour = {
      id: `tour-custom-${Date.now()}`,
      name: newTourName,
      tagline: newTourTagline || "Pristine wilderness redefined",
      pricePerPerson: Number(newTourPrice),
      durationDays: Number(newTourDuration),
      destinationId: newTourLocation,
      description: newTourDesc,
      features: parsedFeatures.length > 0 ? parsedFeatures : ["Bespoke tailored luxury safari guide"],
      isFeatured: newTourIsFeatured,
      itinerary: newTourItinerary.length > 0 ? newTourItinerary : [
        {
          day: 1,
          title: "Expedition Commencement",
          description: newTourDesc || "Arrival and check-in to luxury base camp environment with gourmet meals.",
          accommodation: "Luxury Base Camp",
          meals: "Dinner"
        }
      ]
    };

    publishTour(newTour);
    resetTourForm();
    setSuccessMsg("Created tour draft on /api/tours successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleDeleteTour = (tourId: string) => {
    if (window.confirm("Permanently delete this tour package from active packages?")) {
      deleteTour(tourId);
    }
  };

  const handleStartEditTour = (tour: any) => {
    setEditingTourId(tour.id);
    setNewTourName(tour.name);
    setNewTourTagline(tour.tagline);
    setNewTourPrice(tour.pricePerPerson);
    setNewTourDuration(tour.durationDays);
    setNewTourLocation(tour.destinationId || "shantumbu-falls");
    setNewTourDesc(tour.description || "");
    setNewTourFeaturesText(tour.features ? tour.features.join("\n") : "");
    setNewTourIsFeatured(!!tour.isFeatured);
    setNewTourItinerary(tour.itinerary ? JSON.parse(JSON.stringify(tour.itinerary)) : []);
  };

  const handleSaveEditTour = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedFeatures = newTourFeaturesText
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const updated = localTours.map((t) => {
      if (t.id === editingTourId) {
        return {
          ...t,
          name: newTourName,
          tagline: newTourTagline,
          pricePerPerson: Number(newTourPrice),
          durationDays: Number(newTourDuration),
          destinationId: newTourLocation,
          description: newTourDesc,
          features: parsedFeatures.length > 0 ? parsedFeatures : (t.features || []),
          isFeatured: newTourIsFeatured,
          itinerary: newTourItinerary.slice(0, Number(newTourDuration))
        };
      }
      return t;
    });

    const updatedTour = updated.find(t => t.id === editingTourId);
    if (updatedTour) {
      publishTour(updatedTour);
    }
    resetTourForm();
    setSuccessMsg("Updated tour packet successfully.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Respond to inquiries
  const handleSendResponse = async (inqId: string) => {
    const text = replyTextMap[inqId];
    if (!text || !text.trim()) return;

    // Resolve update locally & in Firestore
    const updated = inquiries.map((inq) => {
      if (inq.id === inqId) {
        return { ...inq, replied: true, replyText: text };
      }
      return inq;
    });

    setInquiries(updated);

    if (isFirebaseEnabled && db) {
      try {
        await setDoc(doc(db, "inquiries", inqId), { replied: true, replyText: text }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, "inquiries");
      }
    } else {
      localStorage.setItem("dreamscape_inquiries", JSON.stringify(updated));
    }

    setReplyTextMap({ ...replyTextMap, [inqId]: "" });
    alert(`Success: Response routed to candidate client via simulation of /api/inquiries!`);
  };

  const handleDeleteInquiry = async (inqId: string) => {
    if (window.confirm("Permanently delete this inquiry from desk logs?")) {
      const filtered = inquiries.filter((inq) => inq.id !== inqId);
      setInquiries(filtered);
      if (isFirebaseEnabled && db) {
        try {
          await deleteDoc(doc(db, "inquiries", inqId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, "inquiries");
        }
      } else {
        localStorage.setItem("dreamscape_inquiries", JSON.stringify(filtered));
      }
    }
  };

  const handleDeleteClient = async (clientUid: string) => {
    if (window.confirm("Are you sure you want to permanently delete this client profile? All metadata will be cleared.")) {
      const filtered = clients.filter((c) => c.uid !== clientUid);
      setClients(filtered);

      try {
        await fetch(`/api/admin/clients/${clientUid}`, {
          method: "DELETE"
        });
      } catch (apiErr) {
        console.warn("Failed deleting live backend database client, updating locales only:", apiErr);
      }

      if (isFirebaseEnabled && db) {
        try {
          await deleteDoc(doc(db, "clients", clientUid));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, "clients");
        }
      } else {
        localStorage.setItem("dreamscape_clients", JSON.stringify(filtered));
      }
    }
  };

  // Recharts trends data preparation
  const dailyTrendsData = useMemo(() => {
    const datesMap: Record<string, { date: string; bookingsCount: number; revenue: number }> = {};
    
    bookings.forEach((b) => {
      let dateStr = "Unknown";
      if (b.dateBooked) {
        dateStr = b.dateBooked;
      }
      
      if (!datesMap[dateStr]) {
        datesMap[dateStr] = { date: dateStr, bookingsCount: 0, revenue: 0 };
      }
      
      const price = Number(b.totalPrice || 2400); 
      datesMap[dateStr].bookingsCount += 1;
      datesMap[dateStr].revenue += price;
    });

    const entries = Object.values(datesMap)
      .filter((item) => item.date !== "Unknown")
      .sort((a, b) => a.date.localeCompare(b.date));

    // If empty, generate beautiful fallback baseline metrics to display
    if (entries.length === 0) {
      return [
        { date: "2026-06-08", bookingsCount: 2, revenue: 4800 },
        { date: "2026-06-09", bookingsCount: 4, revenue: 9600 },
        { date: "2026-06-10", bookingsCount: 3, revenue: 7200 },
        { date: "2026-06-11", bookingsCount: 6, revenue: 14400 },
        { date: "2026-06-12", bookingsCount: 5, revenue: 12000 },
      ];
    }
    return entries;
  }, [bookings]);

  // Aggregate statistics
  const stats = useMemo(() => {
    const defaultTotal = bookings.length || 20;
    const defaultGuests = bookings.reduce((sum, b) => sum + Number(b.guestsCount || 2), 0) || 45;
    const defaultRevenue = bookings.reduce((sum, b) => sum + (b.status === "confirmed" ? Number(b.totalPrice || 2400) : 0), 0) || 48000;
    return {
      total: defaultTotal,
      guests: defaultGuests,
      confirmedRevenue: defaultRevenue,
      averageTicket: defaultTotal > 0 ? defaultRevenue / defaultTotal : 2400
    };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-brand-gold selection:text-brand-dark pb-20 relative overflow-hidden">
      {/* Decorative blurred background colors */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-teal/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Persistent admin header */}
      <header className="border-b border-brand-teal/15 bg-[#030712]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 shadow-md shadow-brand-gold/5">
              <Shield className="w-5 h-5 text-brand-gold animate-pulse" />
            </div>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
                <span>Dreamscape Elite</span>
                <span className="text-[10px] bg-brand-teal/20 text-brand-teal font-mono px-2 py-0.5 rounded-md border border-brand-teal/30">PORTAL</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] font-mono text-brand-sand/65">
                Authorized Executive Command & Control Space
              </p>
            </div>
          </div>
          
          <button
            onClick={onBackToMain}
            className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 border border-white/10 rounded-xl transition-all cursor-pointer text-xs font-semibold text-brand-sand uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Leave Admin
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        
        {!isAuthenticated ? (
          /* SECTION 1: CUSTOM LOGINFORM WALL */
          <div className="max-w-md mx-auto my-12 bg-brand-dark/50 backdrop-blur-xl border border-brand-teal/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="text-center mb-6">
              <div className="inline-flex p-4 bg-brand-gold/10 rounded-full border border-brand-gold/20 mb-4 shadow-xl">
                <Key className="w-8 h-8 text-brand-gold" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-white uppercase tracking-wide">
                Credentials Required
              </h3>
              <p className="text-xs text-brand-sand/70 mt-1 font-sans">
                Access is restricted to authorized agents of Dreamscape Tours.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-4 font-mono text-center">
                {errorMsg}
              </div>
            )}

            {/* Form tab selector */}
            <div className="flex bg-brand-medium/20 border border-brand-teal/10 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setAuthTab("passcode"); setErrorMsg(""); }}
                className={`flex-1 py-2 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all ${
                  authTab === "passcode" ? "bg-brand-gold text-brand-dark font-extrabold" : "text-brand-sand/65 hover:text-white"
                }`}
              >
                Agent Passcode
              </button>
              <button
                onClick={() => { setAuthTab("db_auth"); setErrorMsg(""); }}
                className={`flex-1 py-2 text-[10px] font-mono tracking-widest uppercase rounded-lg transition-all ${
                  authTab === "db_auth" ? "bg-[#e2e8f0]/10 text-white font-extrabold" : "text-brand-sand/65 hover:text-white"
                }`}
              >
                Lead GMail (OAUTH)
              </button>
            </div>

            {authTab === "passcode" ? (
              resettingPasscode ? (
                <form onSubmit={handleResetPasscode} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[#f59e0b] mb-2 text-center font-bold">
                      ⚠️ Create New Admin Passcode
                    </label>
                    <input
                      type="text"
                      placeholder="Enter desired new passcode/token"
                      value={newCustomPasscode}
                      onChange={(e) => setNewCustomPasscode(e.target.value)}
                      className="w-full bg-[#070d18] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-3 px-4 text-xs font-mono tracking-widest text-[#f59e0b] placeholder-brand-sand/30 outline-none transition-all text-center"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-gold hover:bg-yellow-500 text-brand-dark rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-brand-gold/10"
                  >
                    Set New Passcode & Login
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setResettingPasscode(false); setErrorMsg(""); }}
                      className="text-[10px] uppercase tracking-widest text-brand-sand/55 hover:text-white transition-colors"
                    >
                      ← Back to standard login
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-sand/50 mb-2">
                      Console Security Passcode
                    </label>
                    <input
                      type="password"
                      placeholder="Enter admin passcode"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full bg-[#070d18] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-3 px-4 text-xs font-mono tracking-widest text-[#10b981] placeholder-brand-sand/30 outline-none transition-all text-center"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-gold hover:bg-yellow-500 text-brand-dark rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-brand-gold/10"
                  >
                    Verify Access Token
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleDbAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-sand/50 mb-1">
                    System Administrator Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. luyandobanjilb@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#070d18] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2.5 px-4 text-xs font-mono tracking-wide placeholder-brand-sand/30 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-sand/50 mb-1">
                    Passphrase Credentials
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#070d18] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2.5 px-4 text-xs font-mono placeholder-brand-sand/30 outline-none transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-gold hover:bg-yellow-500 text-brand-dark rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-brand-gold/10"
                >
                  Sign In (Admin Passport)
                </button>

                <div className="h-px bg-white/5 my-4" />
                <button
                  type="button"
                  onClick={signIn}
                  className="w-full py-2.5 bg-[#4285F4] hover:bg-blue-600 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Connect with Lead Google Acc
                </button>
              </form>
            )}
          </div>
        ) : (
          /* SECTION 2: AUTHENTICATED EXECUTIVE DASHBOARD CONSOLE */
          <div className="space-y-8 animate-fade-in">
            
            {/* Real Stats Panel with scrolling assurance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-brand-dark/40 border border-brand-teal/15 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-teal/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[9px] font-mono tracking-widest text-brand-sand/50 uppercase block">Registered Expedition Leads</span>
                <span className="text-2xl sm:text-3xl font-bold text-white block mt-2 font-mono">{stats.total}</span>
                <span className="text-[10px] text-brand-teal font-mono flex items-center gap-1 mt-1">
                  <span>●</span> live bookings synced
                </span>
              </div>

              <div className="p-5 bg-brand-dark/40 border border-brand-teal/15 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[9px] font-mono tracking-widest text-brand-sand/50 uppercase block">Reserved Safari Seats</span>
                <span className="text-2xl sm:text-3xl font-bold text-teal-400 block mt-2 font-mono">{stats.guests}</span>
                <span className="text-[10px] text-brand-sand/50 font-mono block mt-1">Confirmed Guests Total</span>
              </div>

              <div className="p-5 bg-brand-dark/40 border border-brand-teal/15 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[9px] font-mono tracking-widest text-brand-sand/50 uppercase block">Projected Revenue Pool</span>
                <span className="text-2xl sm:text-3xl font-bold text-[#f59e0b] block mt-2 font-mono">{formatAmount(stats.confirmedRevenue)}</span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-1">Estimated Deposit Receipts</span>
              </div>

              <div className="p-5 bg-brand-dark/40 border border-brand-teal/15 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[9px] font-mono tracking-widest text-brand-sand/50 uppercase block">Average Ticket Scale</span>
                <span className="text-2xl sm:text-3xl font-bold text-purple-400 block mt-2 font-mono">{formatAmount(stats.averageTicket)}</span>
                <span className="text-[10px] text-brand-sand/50 font-mono block mt-1">Per Safari Package Contract</span>
              </div>
            </div>

            {/* Unified Control Navigation Tab Bar */}
            <div className="flex flex-col sm:flex-row border-b border-brand-teal/15 bg-brand-dark/20 p-1.5 rounded-2xl gap-2">
              <button
                onClick={() => setActiveTab("tours")}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "tours"
                    ? "bg-brand-gold text-brand-dark shadow-md border border-brand-teal/20"
                    : "text-brand-sand/70 hover:text-white"
                }`}
              >
                <Compass className="w-4 h-4" />
                Manage Tours
              </button>
              
              <button
                onClick={() => { setActiveTab("inquiries"); loadLocalInquiries(); }}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "inquiries"
                    ? "bg-brand-gold text-brand-dark shadow-md border border-brand-teal/20"
                    : "text-brand-sand/70 hover:text-white"
                }`}
              >
                <Mail className="w-4 h-4" />
                Inquiries ({inquiries.length})
              </button>

              <button
                onClick={() => setActiveTab("clients")}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "clients"
                    ? "bg-brand-gold text-brand-dark shadow-md border border-brand-teal/20"
                    : "text-brand-sand/70 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                Clients Directory ({clients.length})
              </button>

              <button
                onClick={() => setActiveTab("sales")}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "sales"
                    ? "bg-brand-gold text-brand-dark shadow-md border border-brand-teal/20"
                    : "text-brand-sand/70 hover:text-white"
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Performance Metrics
              </button>

              <button
                onClick={() => setActiveTab("newsletter")}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "newsletter"
                    ? "bg-brand-gold text-brand-dark shadow-md border border-brand-teal/20"
                    : "text-brand-sand/70 hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Newsletter Registry ({subscribers.length})
              </button>

              <button
                onClick={() => setActiveTab("google_chat")}
                className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "google_chat"
                    ? "bg-brand-gold text-brand-dark shadow-md border border-brand-teal/20"
                    : "text-brand-sand/70 hover:text-white"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Google Chat {chatSpaces.length > 0 ? `(${chatSpaces.length})` : ""}
              </button>
            </div>

            {/* Success notification banner */}
            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-2xl font-mono text-center animate-pulse">
                {successMsg}
              </div>
            )}

            {/* TAB CONTENT SPACES */}
            <div className="bg-[#0b1329]/40 border border-brand-teal/10 rounded-3xl p-6 sm:p-8 relative min-h-[500px]">
              
              {/* TAB 1: MANAGE TOURS package system */}
              {activeTab === "tours" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div>
                      <h4 className="font-serif text-xl font-bold text-white uppercase tracking-wide">
                        Safari Packages Inventory
                      </h4>
                      <p className="text-xs text-brand-sand/70 mt-1">
                        Configure, write, or remove luxury travel packages exposed on `/api/tours`
                      </p>
                    </div>
                  </div>

                  {/* Add or Edit Tour package Form panel */}
                  <form onSubmit={editingTourId ? handleSaveEditTour : handleCreateTour} className="bg-brand-dark/50 border border-brand-teal/15 p-6 rounded-2xl space-y-4">
                    <h5 className="text-xs font-mono uppercase tracking-widest text-brand-gold font-bold flex items-center gap-2">
                      <span>{editingTourId ? "Modify Existing Safari Package" : "Publish Bespoke Safari Package"}</span>
                      {editingTourId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTourId(null);
                            setNewTourName("");
                            setNewTourDesc("");
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white font-mono text-[9px] px-2 py-0.5 rounded"
                        >
                          Cancel Editing
                        </button>
                      )}
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-brand-sand/60 mb-1">Safari Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Shantumbu Falls Tour"
                          value={newTourName}
                          onChange={(e) => setNewTourName(e.target.value)}
                          className="w-full bg-[#030712] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2 px-3 text-xs outline-none text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-brand-sand/60 mb-1">Catchy Tagline</label>
                        <input
                          type="text"
                          placeholder="e.g. Unveil the mist at dawn"
                          value={newTourTagline}
                          onChange={(e) => setNewTourTagline(e.target.value)}
                          className="w-full bg-[#030712] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2 px-3 text-xs outline-none text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-brand-sand/60 mb-1">Price (USD)</label>
                          <input
                            type="number"
                            required
                            min="10"
                            value={newTourPrice}
                            onChange={(e) => setNewTourPrice(Number(e.target.value))}
                            className="w-full bg-[#030712] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2 px-3 text-xs outline-none text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-brand-sand/60 mb-1">Duration Days</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={newTourDuration}
                            onChange={(e) => setNewTourDuration(Number(e.target.value))}
                            className="w-full bg-[#030712] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2 px-3 text-xs outline-none text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-mono uppercase text-brand-sand/60 mb-1">Safari Destination Base</label>
                        <select
                          value={newTourLocation}
                          onChange={(e) => setNewTourLocation(e.target.value)}
                          className="w-full bg-[#030712] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2 px-3 text-xs outline-none text-slate-300"
                        >
                          <option value="shantumbu-falls">Shantumbu Falls (Hidden Gem)</option>
                          <option value="kundalila-falls">Kundalila Falls (Hidden Gem)</option>
                          <option value="victoria-falls">Victoria Falls (Mosi-oa-Tunya)</option>
                          <option value="south-luangwa">South Luangwa National Park</option>
                          <option value="lower-zambezi">Lower Zambezi National Park</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-mono uppercase text-brand-sand/60 mb-1">Inclusions / Features (One per line)</label>
                        <textarea
                          placeholder="e.g. Guided Waterfall Excursions&#10;Gourmet meals under stars&#10;Professional guides included"
                          value={newTourFeaturesText}
                          onChange={(e) => setNewTourFeaturesText(e.target.value)}
                          rows={2}
                          className="w-full bg-[#030712] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2 px-3 text-xs outline-none text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-brand-sand/60 mb-1">Extended Package Description</label>
                        <textarea
                          placeholder="Summarize coordinates, wild lodges, and custom itineraries..."
                          required
                          value={newTourDesc}
                          onChange={(e) => setNewTourDesc(e.target.value)}
                          rows={2}
                          className="w-full bg-[#030712] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2 px-3 text-xs outline-none text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 pb-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={newTourIsFeatured}
                        onChange={(e) => setNewTourIsFeatured(e.target.checked)}
                        className="rounded border-brand-teal/25 text-brand-teal focus:ring-transparent bg-[#030712] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="is_featured" className="text-[11px] font-mono uppercase text-brand-sand/80 cursor-pointer select-none">
                        Mark Tour as Featured (Displays distinct layout highlight with golden star accent)
                      </label>
                    </div>

                    <div className="border-t border-brand-teal/10 pt-4 space-y-3">
                      <h6 className="text-[10px] font-mono uppercase tracking-widest text-brand-gold font-bold">Configure Day-by-Day Itineraries ({newTourDuration} Days)</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                        {newTourItinerary.map((dayItem, index) => (
                          <div key={index} className="p-3.5 bg-[#030712]/60 border border-brand-teal/15 rounded-xl space-y-2">
                            <span className="text-[9px] font-mono font-bold text-brand-teal uppercase">DAY {index + 1} CONFIGURATION</span>
                            <div>
                              <input
                                type="text"
                                placeholder={`Day ${index + 1} Title`}
                                value={dayItem.title || ""}
                                onChange={(e) => {
                                  const updated = [...newTourItinerary];
                                  updated[index].title = e.target.value;
                                  setNewTourItinerary(updated);
                                }}
                                className="w-full bg-[#030712] border border-brand-teal/15 focus:border-brand-gold/30 rounded-lg py-1.5 px-2.5 text-xs outline-none text-white font-medium"
                              />
                            </div>
                            <div>
                              <textarea
                                placeholder={`Day ${index + 1} Description`}
                                value={dayItem.description || ""}
                                onChange={(e) => {
                                  const updated = [...newTourItinerary];
                                  updated[index].description = e.target.value;
                                  setNewTourItinerary(updated);
                                }}
                                rows={2}
                                className="w-full bg-[#030712] border border-brand-teal/15 focus:border-brand-gold/30 rounded-lg py-1.5 px-2.5 text-xs outline-none text-brand-sand/90"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <input
                                  type="text"
                                  placeholder="Accommodation"
                                  value={dayItem.accommodation || ""}
                                  onChange={(e) => {
                                    const updated = [...newTourItinerary];
                                    updated[index].accommodation = e.target.value;
                                    setNewTourItinerary(updated);
                                  }}
                                  className="w-full bg-[#030712] border border-brand-teal/15 focus:border-brand-gold/30 rounded-lg py-1 px-2 text-[10px] outline-none text-brand-sand-light"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="Meals (e.g. B, L, D)"
                                  value={dayItem.meals || ""}
                                  onChange={(e) => {
                                    const updated = [...newTourItinerary];
                                    updated[index].meals = e.target.value;
                                    setNewTourItinerary(updated);
                                  }}
                                  className="w-full bg-[#030712] border border-brand-teal/15 focus:border-brand-gold/30 rounded-lg py-1 px-2 text-[10px] outline-none text-brand-sand-light"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-brand-teal hover:bg-teal-500 text-black font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                      >
                        {editingTourId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {editingTourId ? "Commit Edits" : "Publish Tour Package"}
                      </button>
                    </div>
                  </form>

                  {/* Tours inventory list table */}
                  <div className="overflow-x-auto border border-white/5 rounded-2xl">
                    <table className="w-full border-collapse text-left text-xs text-slate-300">
                      <thead>
                        <tr className="bg-brand-medium/20 text-brand-sand-dark uppercase font-mono tracking-widest text-[10px] border-b border-white/5">
                          <th className="p-4">Safari Details</th>
                          <th className="p-4">Location</th>
                          <th className="p-4">Duration</th>
                          <th className="p-4">Cost/person</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {localTours.map((tour) => (
                          <tr key={tour.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                            <td className="p-4">
                              <span className="font-bold text-white text-sm block">{tour.name}</span>
                              <span className="text-xs text-brand-sand/50 italic font-sans block mt-0.5">{tour.tagline}</span>
                            </td>
                            <td className="p-4">
                              <span className="bg-brand-teal/10 font-mono text-[10px] text-brand-teal py-1 px-2.5 rounded-full border border-brand-teal/20 block w-max uppercase">
                                {tour.destinationId || tour.location || "shantumbu-falls"}
                              </span>
                            </td>
                            <td className="p-4 font-mono font-medium">{tour.durationDays} Days</td>
                            <td className="p-4 text-brand-gold font-mono font-extrabold">{formatAmount(tour.pricePerPerson || 1200)}</td>
                            <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleStartEditTour(tour)}
                                className="p-2 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 text-[#f59e0b] rounded-lg border border-[#f59e0b]/15 transition-all cursor-pointer"
                                title="Edit tour package"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTour(tour.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/15 transition-all cursor-pointer"
                                title="Delete tour package"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: USER INQUIRIES */}
              {activeTab === "inquiries" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h4 className="font-serif text-xl font-bold text-white uppercase tracking-wide">
                        Inbound Customer Desk
                      </h4>
                      <p className="text-xs text-brand-sand/70 mt-1">
                        Respond directly to guest questions synchronously simulated on `/api/inquiries`
                      </p>
                    </div>
                  </div>

                  {inquiries.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-sm text-brand-sand/40 font-mono italic">No safari contact inquiry logs found. Submit the Contact Us form on main site to test.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {inquiries.map((inq) => (
                        <div key={inq.id} className="p-5 bg-brand-dark/60 rounded-2xl border border-brand-teal/15 flex flex-col md:flex-row justify-between gap-6 relative">
                          <div className="space-y-3 flex-grow max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-white text-base">{inq.customerName}</span>
                              <span className="text-xs text-brand-sand/60 font-mono">({inq.customerEmail})</span>
                              {inq.customerPhone && (
                                <span className="text-[10px] font-mono text-brand-teal/80 bg-brand-teal/10 px-2 py-0.5 rounded border border-brand-teal/20">{inq.customerPhone}</span>
                              )}
                              
                              <span className="text-[10px] font-mono text-brand-sand/40 ml-auto md:ml-0 bg-white/5 px-2 py-0.5 rounded">
                                {new Date(inq.createdAt).toLocaleString("en-GB", { timeZone: "Africa/Cairo" })}
                              </span>
                            </div>

                            <div className="p-4 bg-[#030712] rounded-xl border border-white/5 text-xs sm:text-sm text-brand-sand/90 leading-relaxed font-sans whitespace-pre-wrap">
                              {inq.message}
                            </div>

                            {inq.replied ? (
                              <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-xs text-brand-sand-light space-y-1">
                                <span className="font-mono text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider block flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5" />
                                  Replied to Client Desk:
                                </span>
                                <p className="italic font-sans mt-1">"{inq.replyText}"</p>
                              </div>
                            ) : (
                              <div className="space-y-2 mt-3 p-1">
                                <label className="block text-[10px] font-mono uppercase text-brand-gold tracking-widest font-extrabold">Send Custom Response</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Type your official reply here..."
                                    value={replyTextMap[inq.id] || ""}
                                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [inq.id]: e.target.value })}
                                    className="flex-grow bg-[#050914] border border-brand-teal/20 focus:border-brand-gold/40 text-xs px-3.5 py-2.5 rounded-xl outline-none"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSendResponse(inq.id);
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSendResponse(inq.id)}
                                    className="px-4 py-2.5 bg-brand-gold hover:bg-yellow-500 text-brand-dark rounded-xl font-bold text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    Send
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4">
                            <button
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/15 text-xs flex items-center gap-1.5 transition-all cursor-pointer inline-flex self-start"
                              title="Delete inquiry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete inquiry
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VOLUME AND REVENUE REPORTS */}
              {activeTab === "sales" && (
                <div className="space-y-6 animate-fade-in overflow-y-auto">
                  <div>
                    <h4 className="font-serif text-xl font-bold text-white uppercase tracking-wide">
                      Safari Operations Performance Metrics
                    </h4>
                    <p className="text-xs text-brand-sand/70 mt-1">
                      Aggregated overview of customer reservation volume & projected revenue metrics. All charts support horizontal and vertical scrolling adjustments.
                    </p>
                  </div>

                  {/* Chart volume visual container with guaranteed overflow/scrolling handling */}
                  <div className="p-5 bg-brand-dark/60 rounded-2xl border border-brand-teal/15 space-y-6 overflow-x-auto">
                    <h5 className="text-[11px] font-mono uppercase tracking-widest text-brand-gold font-bold">
                      Dynamic Daily Booking Trends (EST)
                    </h5>
                    
                    <div className="min-w-[600px] h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={dailyTrendsData}
                          margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.04} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#94a3b8" 
                            opacity={0.5} 
                            fontSize={10}
                            fontFamily="monospace"
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            opacity={0.5} 
                            fontSize={10}
                            fontFamily="monospace"
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#0b1329", borderColor: "rgba(13, 148, 136, 0.3)", borderRadius: "10px", fontSize: "11px", fontFamily: "monospace" }}
                          />
                          <Area 
                            name="Revenue Generated ($)" 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#d97706" 
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                            strokeWidth={2}
                          />
                          <Area 
                            name="Bookings Count" 
                            type="monotone" 
                            dataKey="bookingsCount" 
                            stroke="#0d9488" 
                            fillOpacity={1} 
                            fill="url(#colorCount)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="p-4 bg-brand-dark/80 rounded-xl border border-white/5 flex gap-4 text-xs font-sans text-brand-sand/70">
                      <HelpCircle className="w-5 h-5 text-brand-teal shrink-0" />
                      <div>
                        <span className="font-bold text-white block">Interactive Metrics Notice:</span>
                        The golden path charts total financial deposits booked. The teal path represents customer count. Tap nodes to focus dates and investigate safari details.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CLIENTS REGISTER DIRECTORY */}
              {activeTab === "clients" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h4 className="font-serif text-xl font-bold text-white uppercase tracking-wide">
                        Elite Explorer CRM Client Directory
                      </h4>
                      <p className="text-xs text-brand-sand/70 mt-1">
                        Track and manage users registered with Dreamscape Tours ZM, including historical counts and billing summaries.
                      </p>
                    </div>

                    {/* Search bar input */}
                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        placeholder="Search name or email..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="w-full bg-[#070d18] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2 px-3 pl-8 text-xs font-mono text-white placeholder-brand-sand/30 outline-none transition-all"
                      />
                      <Compass className="w-3.5 h-3.5 text-brand-sand/30 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Filtered Clients list */}
                  {(() => {
                    const filtered = clients.filter((c) => {
                      const query = clientSearch.toLowerCase();
                      return (c.name || "").toLowerCase().includes(query) || (c.email || "").toLowerCase().includes(query);
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-16">
                          <p className="text-sm text-brand-sand/40 font-mono italic">No clients match search credentials.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-brand-teal/20 text-brand-gold uppercase tracking-wider font-mono text-[10px]">
                              <th className="p-4">Customer Details</th>
                              <th className="p-4">Phone Contact</th>
                              <th className="p-4">Registered On</th>
                              <th className="p-4 text-center">Invoices count</th>
                              <th className="p-4 text-center">Billing summary</th>
                              <th className="p-4 text-right">Total Spent</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((client) => {
                              // Safely parse date
                              let dateText = "N/A";
                              if (client.createdAt) {
                                try {
                                  let dateObj;
                                  if (client.createdAt.seconds) {
                                    dateObj = new Date(client.createdAt.seconds * 1000);
                                  } else {
                                    dateObj = new Date(client.createdAt);
                                  }
                                  dateText = dateObj.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric"
                                  });
                                } catch (_) {}
                              }

                              const billing = client.billingSummary || {
                                totalInvoices: client.totalBookings || 0,
                                paid: client.totalBookings > 0 ? Math.ceil(client.totalBookings * 0.7) : 0,
                                outstanding: client.totalBookings > 0 ? Math.floor(client.totalBookings * 0.3) : 0
                              };

                              return (
                                <tr key={client.uid} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                  <td className="p-4">
                                    <span className="font-bold text-white text-sm block">{client.name}</span>
                                    <span className="text-xs text-brand-sand/50 italic font-mono block mt-0.5">{client.email}</span>
                                  </td>
                                  <td className="p-4 font-mono text-brand-sand/80">
                                    {client.phone || <span className="text-brand-sand/30 italic">No contact phone</span>}
                                  </td>
                                  <td className="p-4 font-mono text-brand-sand/80">
                                    {dateText}
                                  </td>
                                  <td className="p-4 text-center font-mono font-medium text-brand-teal">
                                    {billing.totalInvoices || 0}
                                  </td>
                                  <td className="p-4 text-center space-x-1.5 whitespace-nowrap">
                                    <span className="font-mono text-[9px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                                      {billing.paid || 0} Paid
                                    </span>
                                    {billing.outstanding > 0 ? (
                                      <span className="font-mono text-[9px] font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">
                                        {billing.outstanding} Due
                                      </span>
                                    ) : (
                                      <span className="font-mono text-[9px] font-extrabold uppercase bg-[#0d9488]/10 border border-[#0d9488]/20 text-brand-teal px-1.5 py-0.5 rounded">
                                        0 Due
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-4 text-right font-mono font-extrabold text-[#f59e0b]">
                                    {formatAmount(client.totalSpent || 0)}
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      onClick={() => handleDeleteClient(client.uid)}
                                      className="p-1 px-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/15 transition-all text-[10px] font-mono font-bold cursor-pointer transition-colors"
                                      title="Purge profile entry"
                                    >
                                      Purge profile
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 5: NEWSLETTER BROADCAST AND REGISTRY */}
              {activeTab === "newsletter" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h4 className="font-serif text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
                        Wilderness Registry & Dispatch Hub
                      </h4>
                      <p className="text-xs text-brand-sand/70 mt-1">
                        Compose premium safari newsletters, view campaign logs, and oversee the registered explorer contacts list.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN - COMPOSE CAMPAIGN */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-brand-dark/50 border border-brand-teal/15 p-6 rounded-2xl space-y-4">
                        <h5 className="text-xs font-mono uppercase tracking-widest text-brand-gold font-bold flex items-center gap-2">
                          <Send className="w-4 h-4 text-brand-gold" />
                          Compose Broadcast Campaign
                        </h5>

                        {accessToken ? (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center justify-between gap-3 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                              <span>GOOGLE WORKSPACE DISPATCHER: ACTIVE</span>
                            </div>
                            <span className="text-[10px] text-emerald-400/70">Broadcasting via GMail API</span>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-brand-sand rounded-xl text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 font-mono text-amber-400 font-bold uppercase tracking-wider">
                                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                                <span>WORKSPACE CONNECTION PENDING</span>
                              </div>
                              <p className="text-[11px] text-brand-sand/70 leading-relaxed max-w-lg">
                                Transmit real, beautifully styled emails straight to all your newsletter subscribers by activating your Google Workspace connection.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await signInWithWorkspace();
                                } catch (err: any) {
                                  alert(err?.message || "Failed to authenticate Google Workspace.");
                                }
                              }}
                              className="px-4 py-2 shrink-0 bg-amber-500 hover:bg-amber-400 text-brand-dark font-mono text-[10px] uppercase tracking-wider rounded-lg font-extrabold transition-all cursor-pointer shadow-lg active:scale-95"
                            >
                              Connect GMail
                            </button>
                          </div>
                        )}
                        
                        <form onSubmit={handleSendNewsletter} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-brand-sand/60 mb-1">
                              Newsletter Subject / Headline
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. South Luangwa Walking Safari Specials - September 2026"
                              value={dispatchSubject}
                              onChange={(e) => setDispatchSubject(e.target.value)}
                              className="w-full bg-[#030712] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2.5 px-3.5 text-xs outline-none text-white transition-all placeholder:text-brand-sand/30"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-brand-sand/60 mb-1">
                              Campaign Content (Markdown or Text)
                            </label>
                            <textarea
                              required
                              rows={8}
                              placeholder="Type your wilderness bulletin message or newsletter HTML/Text. Invite them to join bespoke tour options..."
                              value={dispatchContent}
                              onChange={(e) => setDispatchContent(e.target.value)}
                              className="w-full bg-[#030712] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2.5 px-3.5 text-xs outline-none text-white transition-all font-sans leading-relaxed placeholder:text-brand-sand/30 resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[10px] font-mono text-brand-sand/40">
                              Will be dispatched to {subscribers.length} recipient(s).
                            </span>
                            <button
                              type="submit"
                              disabled={isDispatching || subscribers.length === 0}
                              className="px-6 py-2.5 bg-brand-gold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-brand-dark font-mono text-xs uppercase tracking-wider rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-brand-gold/10"
                            >
                              <span>{isDispatching ? "Transmitting..." : "Send Newsletter Blast"}</span>
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* DISPATCH CAMPAIGN ARCHIVE */}
                      <div className="bg-brand-dark/30 border border-brand-teal/10 p-6 rounded-2xl space-y-4">
                        <h5 className="text-xs font-mono uppercase tracking-widest text-brand-teal font-bold">
                          Campaign Broadcast Archives ({dispatches.length})
                        </h5>

                        {dispatches.length === 0 ? (
                          <p className="text-xs text-brand-sand/40 italic font-mono text-center py-4">No historical campaigns recorded.</p>
                        ) : (
                          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                            {dispatches.map((disp) => {
                              let dateStr = "N/A";
                              if (disp.sentAt) {
                                try {
                                  dateStr = new Date(disp.sentAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  });
                                } catch (_) {}
                              }
                              return (
                                <div key={disp.id} className="p-3.5 bg-[#030712]/50 border border-brand-teal/10 rounded-xl space-y-2">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                      <h6 className="text-xs font-bold text-white leading-snug truncate">{disp.subject}</h6>
                                      <span className="text-[10px] font-mono text-brand-sand/50 block mt-1">
                                        Sent: {dateStr}
                                      </span>
                                    </div>
                                    <span className="shrink-0 text-[9px] font-mono font-extrabold uppercase bg-brand-teal/10 border border-brand-teal/20 text-brand-teal px-2 py-0.5 rounded">
                                      {disp.recipientCount} Recipients
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-brand-sand/70 whitespace-pre-wrap bg-brand-dark/40 p-3 rounded-lg font-mono">
                                    {disp.content}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN - CONTACT REGISTRY */}
                    <div className="space-y-6">
                      <div className="bg-brand-dark/50 border border-brand-teal/15 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-mono uppercase tracking-widest text-brand-gold font-bold">
                            Explorer Contacts List
                          </h5>
                          <span className="text-[10px] font-mono text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-2 py-0.5 rounded-full font-extrabold">
                            {subscribers.length} total
                          </span>
                        </div>

                        {/* Search Subscribers */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search subscriber email..."
                            value={subscriberSearch}
                            onChange={(e) => setSubscriberSearch(e.target.value)}
                            className="w-full bg-[#070d18] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2 px-3 pl-8 text-xs font-mono text-white placeholder-brand-sand/30 outline-none transition-all"
                          />
                          <Compass className="w-3.5 h-3.5 text-brand-sand/30 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>

                        {/* Subscribers Contact Cards */}
                        {(() => {
                          const filtered = subscribers.filter((s) => {
                            return (s.email || "").toLowerCase().includes(subscriberSearch.toLowerCase());
                          });

                          if (filtered.length === 0) {
                            return (
                              <p className="text-xs text-brand-sand/40 italic font-mono text-center py-8">
                                {subscriberSearch ? "No matching contacts." : "No registered subscribers."}
                              </p>
                            );
                          }

                          return (
                            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                              {filtered.map((sub) => {
                                let dateStr = "N/A";
                                if (sub.createdAt) {
                                  try {
                                    dateStr = new Date(sub.createdAt).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric"
                                    });
                                  } catch (_) {}
                                }
                                return (
                                  <div key={sub.id} className="p-3 bg-[#030712]/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 hover:bg-white/5 transition-all">
                                    <div className="min-w-0 flex-1">
                                      <span className="text-xs font-semibold text-white truncate block" title={sub.email}>
                                        {sub.email}
                                      </span>
                                      <span className="text-[9px] font-mono text-brand-sand/45 block mt-0.5">
                                        Subscribed: {dateStr}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteSubscriber(sub.id)}
                                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/15 rounded-lg text-red-400 text-[10px] font-mono cursor-pointer transition-colors shrink-0"
                                      title="Unsubscribe reader"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: GOOGLE CHAT INTEGRATION */}
              {activeTab === "google_chat" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h4 className="font-serif text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-brand-gold" />
                        Google Chat Workspace Control
                      </h4>
                      <p className="text-xs text-brand-sand/70 mt-1">
                        Connect, dispatch custom alert messages, and monitor workspace space notifications instantly.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN - WORKSPACE & DISPATCH */}
                    <div className="lg:col-span-2 space-y-8">
                      
                      {/* Connection and setup card */}
                      <div className="bg-brand-dark/50 border border-brand-teal/15 p-6 rounded-2xl space-y-4">
                        <h5 className="text-xs font-mono uppercase tracking-widest text-brand-gold font-bold flex items-center gap-2">
                          <Shield className="w-4 h-4 text-brand-gold" />
                          Google Workspace Chat Authentication
                        </h5>

                        {accessToken ? (
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs space-y-2 font-mono">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span>CHAT INTEGRATION CONNECTED</span>
                              </div>
                              <span className="text-[10px] text-emerald-400/70">Authenticated via OAuth</span>
                            </div>
                            <p className="text-[11px] text-brand-sand/60 font-sans mt-2 normal-case leading-relaxed">
                              Your account is verified with permissions to read accessible spaces and compose alert messages. Below you can select your primary space.
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-brand-sand rounded-xl text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 font-mono text-amber-400 font-bold uppercase tracking-wider">
                                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                                <span>WORKSPACE CONNECTION PENDING</span>
                              </div>
                              <p className="text-[11px] text-brand-sand/70 leading-relaxed max-w-lg">
                                Grant secure access to read your Google Chat spaces and authorize dispatching real-time booking alerts.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await signInWithWorkspace();
                                } catch (err: any) {
                                  alert(err?.message || "Failed to authenticate Google Workspace.");
                                }
                              }}
                              className="px-4 py-2 shrink-0 bg-amber-500 hover:bg-amber-400 text-brand-dark font-mono text-[10px] uppercase tracking-wider rounded-lg font-extrabold transition-all cursor-pointer shadow-lg active:scale-95"
                            >
                              Connect Google Chat
                            </button>
                          </div>
                        )}

                        {accessToken && (
                          <div className="space-y-4 pt-2">
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-brand-sand/60 mb-2">
                                Select Notification Space Target
                              </label>
                              {isFetchingSpaces ? (
                                <div className="flex items-center gap-2 py-2 text-xs font-mono text-brand-sand/50">
                                  <RefreshCw className="w-4 h-4 animate-spin text-brand-gold" />
                                  Scanning available spaces...
                                </div>
                              ) : chatSpaces.length === 0 ? (
                                <div className="space-y-2">
                                  <p className="text-xs text-amber-400 font-mono italic">No spaces found or no permissions in your Google Workspace directory.</p>
                                  <button
                                    type="button"
                                    onClick={handleLoadChatSpaces}
                                    className="px-3 py-1.5 bg-brand-teal/10 hover:bg-brand-teal/20 border border-brand-teal/20 text-brand-teal rounded-lg font-mono text-[10px] uppercase transition-colors"
                                  >
                                    Retry Space Scan
                                  </button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {chatSpaces.map((space) => {
                                    const isSelected = selectedSpace === space.name;
                                    return (
                                      <button
                                        key={space.name}
                                        type="button"
                                        onClick={() => {
                                          setSelectedSpace(space.name);
                                          localStorage.setItem("dreamscape_selected_chat_space", space.name);
                                          setSuccessMsg(`Notification target updated to ${space.displayName || space.name}`);
                                          setTimeout(() => setSuccessMsg(""), 4000);
                                        }}
                                        className={`p-3.5 rounded-xl text-left border transition-all duration-200 cursor-pointer ${
                                          isSelected
                                            ? "bg-brand-teal/15 border-brand-teal text-white shadow-md shadow-brand-teal/5"
                                            : "bg-[#030712]/40 border-white/5 text-brand-sand/70 hover:bg-[#030712]/80 hover:text-white"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold font-mono leading-tight truncate">
                                              {space.displayName || "Unnamed Space"}
                                            </p>
                                            <p className="text-[9px] font-mono text-brand-sand/40 mt-1 truncate">
                                              Type: {space.spaceType || "N/A"}
                                            </p>
                                          </div>
                                          {isSelected && (
                                            <span className="w-2 h-2 bg-brand-gold rounded-full shrink-0 animate-pulse" title="Selected Target" />
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Send Message Card */}
                      {accessToken && selectedSpace && (
                        <div className="bg-brand-dark/50 border border-brand-teal/15 p-6 rounded-2xl space-y-4">
                          <h5 className="text-xs font-mono uppercase tracking-widest text-brand-gold font-bold flex items-center gap-2">
                            <Send className="w-4 h-4 text-brand-gold" />
                            Dispatch Manual Alert Message
                          </h5>

                          <form onSubmit={handleSendChatManualMessage} className="space-y-4">
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-brand-sand/60 mb-1">
                                Message Content
                              </label>
                              <textarea
                                required
                                rows={4}
                                placeholder="Write an instant notice to the selected Google Chat room, e.g. 'Notice: Shuttle maintenance scheduled for tomorrow morning.'"
                                value={chatMessageText}
                                onChange={(e) => setChatMessageText(e.target.value)}
                                className="w-full bg-[#030712] border border-brand-teal/20 focus:border-brand-gold/50 rounded-xl py-2.5 px-3.5 text-xs outline-none text-white transition-all font-sans leading-relaxed placeholder:text-brand-sand/30 resize-none"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] font-mono text-brand-sand/40">
                                Target Space ID: <span className="text-brand-teal">{selectedSpace.split("/").pop()}</span>
                              </span>
                              <button
                                type="submit"
                                disabled={isSendingChatMessage || !chatMessageText.trim()}
                                className="px-6 py-2.5 bg-brand-gold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-brand-dark font-mono text-xs uppercase tracking-wider rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-brand-gold/10"
                              >
                                <span>{isSendingChatMessage ? "Sending..." : "Dispatch Alert"}</span>
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {chatError && (
                        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-mono">
                          🚨 Error: {chatError}
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN - SYSTEM INSIGHTS */}
                    <div className="space-y-6">
                      <div className="bg-brand-dark/50 border border-brand-teal/15 p-6 rounded-2xl space-y-4">
                        <h5 className="text-xs font-mono uppercase tracking-widest text-brand-teal font-bold">
                          Automated Notification Channels
                        </h5>
                        <p className="text-xs text-brand-sand/70 leading-relaxed">
                          Once a Google Chat target space is configured and connected, the system automatically posts rich informational summaries to keep your operations desk synced.
                        </p>

                        <div className="space-y-3 pt-2">
                          <div className="p-3 bg-[#030712]/30 border border-white/5 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-white font-mono uppercase">Adventure Inquiries</span>
                              <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-extrabold">Active</span>
                            </div>
                            <p className="text-[10px] text-brand-sand/60 leading-normal">
                              Client queries from the main inquiry desk are parsed and structured immediately into real-time Chat alerts containing client contact details and messages.
                            </p>
                          </div>

                          <div className="p-3 bg-[#030712]/30 border border-white/5 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-white font-mono uppercase">Safari Bookings</span>
                              <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-extrabold">Active</span>
                            </div>
                            <p className="text-[10px] text-brand-sand/60 leading-normal">
                              Whenever a traveler completes a safari package reservation, a message with traveler name, email, headcount, safari package name, and itinerary date is dispatched.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-brand-dark/30 border border-brand-teal/10 p-6 rounded-2xl space-y-3">
                        <h5 className="text-xs font-mono uppercase tracking-widest text-brand-sand/50 font-bold">
                          Quick Integration Help
                        </h5>
                        <ul className="text-[11px] text-brand-sand/60 space-y-2 list-disc list-inside leading-relaxed">
                          <li>Ensure Google Chat app permissions are granted on your Google Account consent screen.</li>
                          <li>Create or configure a space in Google Chat workspace before initiating scan.</li>
                          <li>Keep this tab open while you receive bookings or inquiries to verify automatic dispatches in real-time.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
