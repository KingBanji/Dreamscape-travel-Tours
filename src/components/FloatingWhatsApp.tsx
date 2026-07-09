import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useScrollSync } from "../hooks/useScrollSync";
// @ts-ignore
import directorImg from "../assets/images/luyando_banji_1779907072829.png";

import { db, isFirebaseEnabled } from "../lib/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuthAndData } from "../lib/FirebaseContext";

interface FloatingWhatsAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FloatingWhatsApp({ isOpen, onClose }: FloatingWhatsAppProps) {
  const { user } = useAuthAndData();
  const [unreadCount, setUnreadCount] = useState(1);
  const [messageText, setMessageText] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [localHistory, setLocalHistory] = useState<any[]>([]);

  // Unique session ID for guest/anonymous chat sessions
  const [chatSessionId] = useState<string>(() => {
    try {
      let id = localStorage.getItem("dreamscape_chat_session_id");
      if (!id) {
        id = "anon_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("dreamscape_chat_session_id", id);
      }
      return id;
    } catch {
      return "anon_fallback_user";
    }
  });

  const activeUserId = user?.uid || user?.email || chatSessionId;

  // Real-time Firestore subscription
  useEffect(() => {
    if (!isFirebaseEnabled || !db) return;

    const messagesRef = collection(db, "whatsapp_messages");
    const q = query(
      messagesRef,
      where("userId", "==", activeUserId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      // Sort client-side by timestamp to prevent missing index exceptions
      fetched.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeA - timeB;
      });
      setHistory(fetched);
    }, (error) => {
      console.warn("Firestore message real-time sub failed (likely cold-start/offline):", error.message);
    });

    return () => unsubscribe();
  }, [activeUserId]);

  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, history, localHistory, showTyping]);

  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollSync = useScrollSync(isOpen, drawerRef);

  const quickPrompts = [
    { text: "🐾 Custom Safari Planning Guide", label: "Custom Safari" },
    { text: "💰 Quick Tour Package Pricing Request", label: "Safari Price Quote" },
    { text: "💳 Confirm My Mobile Money / Airtel / MTN MoMo Payment", label: "Confirm MoMo Pay" },
    { text: "🦁 Book a Victoria Falls Day Exploration Tour", label: "Vic Falls Day Tour" }
  ];

  const triggerAgentReply = async (userText: string) => {
    setShowTyping(true);
    
    let replyText = "";
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });
      if (response.ok) {
        const data = await response.json();
        replyText = data.reply;
        // Strip out instructions or keys-missing boilerplate if we want to fallback, but actually
        // the server's message is helpful. If it says API keys are unconfigured, we can still show it or fall back.
        if (replyText.includes("API Keys are currently unconfigured")) {
          // If unconfigured, use keyword fallback for a better polished sandbox demo experience
          replyText = "";
        }
      }
    } catch (err) {
      console.warn("Failed to fetch AI reply from /api/ai:", err);
    }

    setShowTyping(false);

    if (!replyText) {
      replyText = "Thanks for reaching out! 🐆 I am on standby and have received your inquiry. Tap the green dispatch button to link directly to my active WhatsApp line (+260 975 222 136) so we can wrap up your details immediately!";
      
      const lowerText = userText.toLowerCase();
      if (lowerText.includes("custom safari") || lowerText.includes("safari planning")) {
        replyText = "Excellent! 🦁 I am our principal safari coordinator here in Lusaka. For custom safaris, we normally recommend starting with a 3-day South Luangwa Wildlife Package or a lower Zambezi boat cruise. Check your WhatsApp tab where I've opened a direct session for us, or type your preferred dates and guest count right here!";
      } else if (lowerText.includes("pricing") || lowerText.includes("price") || lowerText.includes("rates")) {
        replyText = "Certainly! 💵 Our standard pricing ranges from $150 to $450 per person depending on group size and length of the safari. I have launched a direct secure session in your WhatsApp tab to finalize the group rates. Let me know which parks you are most excited about!";
      } else if (lowerText.includes("confirm") || lowerText.includes("mobile money") || lowerText.includes("momo")) {
        replyText = "Airtel / MTN Mobile Money payments are processed instantly! 💳 I am reviewing the dispatch logs right now. Once you confirm on the WhatsApp tab, please upload your MoMo transaction ID or screenshot here so we can mark your booking as 'Confirmed' in real-time.";
      } else if (lowerText.includes("victoria falls") || lowerText.includes("vic falls") || lowerText.includes("livingstone")) {
        replyText = "Wonderful choice! Victoria Falls is breathtaking this season. 🌊 I can confirm availability for our Livingstone Day Tour right now. Please tell me your preferred start date and we'll secure your park entry tickets immediately!";
      }
    }

    const agentMsg = {
      userId: activeUserId,
      sender: "agent",
      text: replyText,
      timestamp: new Date().toISOString(),
      agentName: "Banji Luyando"
    };

    try {
      if (isFirebaseEnabled && db) {
        await addDoc(collection(db, "whatsapp_messages"), agentMsg);
      } else {
        setLocalHistory(prev => [...prev, { id: Math.random().toString(), ...agentMsg }]);
      }
    } catch (err) {
      console.warn("Firestore agent reply save failed, operating in fallback mode:", err);
      setLocalHistory(prev => [...prev, { id: Math.random().toString(), ...agentMsg }]);
    }
  };

  const handleSendPrompt = async (promptText: string) => {
    const userMsg = {
      userId: activeUserId,
      sender: "user",
      text: promptText,
      timestamp: new Date().toISOString()
    };

    try {
      if (isFirebaseEnabled && db) {
        await addDoc(collection(db, "whatsapp_messages"), userMsg);
      } else {
        setLocalHistory(prev => [...prev, { id: Math.random().toString(), ...userMsg }]);
      }
    } catch (err) {
      console.warn("Firestore save failed:", err);
      setLocalHistory(prev => [...prev, { id: Math.random().toString(), ...userMsg }]);
    }

    const formattedText = `Hello Online Agent Assistant Banji Luyando! \n\nI am contacting you from the Dreamscape Tours Zambia platform regarding your tour services. \n\nInquiry details: ${promptText}`;
    const url = `https://wa.me/260975222136?text=${encodeURIComponent(formattedText)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    triggerAgentReply(promptText);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    const textToSend = messageText.trim();
    setMessageText("");

    const userMsg = {
      userId: activeUserId,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    try {
      if (isFirebaseEnabled && db) {
        await addDoc(collection(db, "whatsapp_messages"), userMsg);
      } else {
        setLocalHistory(prev => [...prev, { id: Math.random().toString(), ...userMsg }]);
      }
    } catch (err) {
      console.warn("Firestore save failed:", err);
      setLocalHistory(prev => [...prev, { id: Math.random().toString(), ...userMsg }]);
    }

    const formattedText = `Hello Online Agent Assistant Banji Luyando! \n\nInquiry from Dreamscape Tours Zambia applet: \n\n"${textToSend}"`;
    const url = `https://wa.me/260975222136?text=${encodeURIComponent(formattedText)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    triggerAgentReply(textToSend);
  };

  const formatTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "08:00 AM";
    }
  };

  const displayMessages = isFirebaseEnabled && db ? history : localHistory;

  return (
    <div
      id="whatsapp-drawer-backdrop"
      className={`fixed inset-0 z-50 bg-brand-dark/70 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      } flex justify-start`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={drawerRef}
        onMouseEnter={scrollSync.handleMouseEnter}
        onMouseLeave={scrollSync.handleMouseLeave}
        onTouchStart={scrollSync.handleTouchStart}
        onTouchEnd={scrollSync.handleTouchEnd}
        onTouchCancel={scrollSync.handleTouchCancel}
        className={`w-full max-w-md bg-gradient-to-b from-white to-[#f0f4f2] dark:from-[#0d1612] dark:to-[#090f0c] h-full shadow-2xl overflow-hidden flex flex-col justify-between border-r border-[#128C7E]/20 text-brand-dark dark:text-slate-100 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#075e54]/95 to-[#128C7E]/80 backdrop-blur-md p-4 text-white flex items-center justify-between border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-medium border-[2px] border-emerald-400/50 shadow-inner shrink-0">
                <img 
                  src={directorImg} 
                  alt="Online Agent Assistant Banji Luyando" 
                  className="w-full h-full object-cover scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=150&q=80";
                  }}
                />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border-2 border-[#075e54] shadow-sm animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase font-sans">
                Banji Luyando
              </h4>
              <span className="text-[9px] text-emerald-300 font-medium flex items-center gap-1 font-mono uppercase">
                ● Online Agent Assistant
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/15 hover:bg-black/30 flex items-center justify-center transition-all cursor-pointer text-white/90 hover:text-white"
            title="Close Support"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Body Bubble section */}
        <div 
          ref={chatBodyRef}
          className="flex-1 p-4 bg-[#e5ddd5]/75 dark:bg-[#0a100d]/90 overflow-y-auto overscroll-contain space-y-3 flex flex-col custom-scroll scrollbar-thin scrollbar-thumb-emerald-700/30"
        >
          {/* Welcome greetings */}
          <div className="self-start max-w-[85%] bg-white/95 dark:bg-[#14231b] text-brand-dark dark:text-slate-100 rounded-r-2xl rounded-bl-2xl p-3 shadow-xs text-xs leading-relaxed relative border border-emerald-500/10 shrink-0">
            <p className="font-semibold text-[10px] text-[#25D366] mb-0.5 uppercase tracking-wide">Dreamscape Assistant</p>
            <p className="text-brand-dark/85 dark:text-slate-300">
              Greetings from beautiful Zambia! 🇿🇲 Let me help you craft the perfect wildlife safari trip or process custom Mobile Money payments directly.
            </p>
            <span className="text-[8px] text-brand-dark/40 dark:text-slate-400 block text-right mt-1 font-mono">08:00 AM</span>
          </div>

          <div className="self-start max-w-[85%] bg-white/95 dark:bg-[#14231b] text-brand-dark rounded-r-2xl rounded-bl-2xl p-3 shadow-xs text-xs leading-relaxed border border-emerald-500/10 shrink-0">
            <p className="text-brand-dark/85 dark:text-slate-200">
              Select a shortcut helper below, or write your query directly into our dispatch board! 🐆
            </p>
          </div>

          {/* Render real-time Firestore message logs */}
          {displayMessages.map((msg, index) => {
            const isUser = msg.sender === "user";
            return (
              <div 
                key={msg.id || index} 
                className={`max-w-[85%] p-3 shadow-xs text-xs leading-relaxed border shrink-0 ${
                  isUser 
                    ? "self-end bg-emerald-600 dark:bg-emerald-700 text-white rounded-l-2xl rounded-br-2xl border-emerald-500/10" 
                    : "self-start bg-white/95 dark:bg-[#14231b] text-brand-dark dark:text-slate-100 rounded-r-2xl rounded-bl-2xl border-emerald-500/10"
                }`}
              >
                <p className={`font-semibold text-[10px] uppercase tracking-wide mb-0.5 ${
                  isUser ? "text-emerald-100" : "text-[#25D366]"
                }`}>
                  {isUser ? "You" : (msg.agentName || "Banji Luyando")}
                </p>
                <p className={isUser ? "text-white" : "text-brand-dark/85 dark:text-slate-200"}>
                  {msg.text}
                </p>
                <span className={`text-[8px] block text-right mt-1 font-mono ${
                  isUser ? "text-white/60" : "text-brand-dark/40 dark:text-slate-400"
                }`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            );
          })}

          {showTyping && (
            <div className="self-start bg-white/95 dark:bg-[#14231b] text-brand-dark/65 px-3 py-2 rounded-r-2xl rounded-bl-2xl shadow-xs text-xs flex items-center gap-1 font-mono border border-emerald-500/10 shrink-0">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        {/* Quick shortcuts board */}
        <div className="p-3 bg-white/40 dark:bg-slate-950/45 border-t border-b border-brand-sand-dark/10 dark:border-emerald-950/30 flex flex-col gap-2">
          <span className="text-[9px] font-bold text-brand-dark/45 dark:text-slate-400 uppercase tracking-wider block px-1">
            ⚡ Interactive Direct Actions
          </span>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(p.text)}
                type="button"
                className="p-2 sm:p-2.5 text-left bg-white/90 dark:bg-slate-900/90 hover:bg-emerald-500/10 dark:hover:bg-emerald-950/20 text-[10px] sm:text-[11px] font-bold text-brand-dark/85 dark:text-slate-200 rounded-xl border border-brand-sand-dark/40 dark:border-slate-800 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all flex items-center justify-between gap-1.5 cursor-pointer truncate"
                title={p.text}
              >
                <span className="truncate">{p.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Custom Send Input board */}
        <form onSubmit={handleCustomSubmit} className="p-3 bg-white/50 dark:bg-black/25 backdrop-blur-md flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type details..."
            className="flex-1 bg-brand-sand/50 dark:bg-[#050b14] hover:bg-brand-sand/80 border border-brand-sand-dark dark:border-emerald-900/30 rounded-lg py-2 px-3.5 text-sm focus:outline-none focus:border-emerald-500 transition-all text-brand-dark dark:text-white"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-lg bg-[#25D366] hover:bg-[#1ebd59] text-white flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
