import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useScrollSync } from "../hooks/useScrollSync";
// @ts-ignore
import directorImg from "../assets/images/luyando_banji_1779907072829.png";

interface FloatingWhatsAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FloatingWhatsApp({ isOpen, onClose }: FloatingWhatsAppProps) {
  const [unreadCount, setUnreadCount] = useState(1);
  const [messageText, setMessageText] = useState("");
  const [showTyping, setShowTyping] = useState(false);

  // Trigger brief typing animation when opened to simulate live response
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setShowTyping(true);
      const timer = setTimeout(() => {
        setShowTyping(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollSync = useScrollSync(isOpen, drawerRef);

  const quickPrompts = [
    { text: "🐾 Custom Safari Planning Guide", label: "Custom Safari" },
    { text: "💰 Quick Tour Package Pricing Request", label: "Safari Price Quote" },
    { text: "💳 Confirm My Mobile Money / Airtel / MTN MoMo Payment", label: "Confirm MoMo Pay" },
    { text: "🦁 Book a Victoria Falls Day Exploration Tour", label: "Vic Falls Day Tour" }
  ];

  const handleSendPrompt = (promptText: string) => {
    const formattedText = `Hello Online Agent Assistant Banji Luyando! \n\nI am contacting you from the Dreamscape Tours Zambia platform regarding your tour services. \n\nInquiry details: ${promptText}`;
    const url = `https://wa.me/260977671016?text=${encodeURIComponent(formattedText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    const formattedText = `Hello Online Agent Assistant Banji Luyando! \n\nInquiry from Dreamscape Tours Zambia applet: \n\n"${messageText.trim()}"`;
    const url = `https://wa.me/260977671016?text=${encodeURIComponent(formattedText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setMessageText("");
  };

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
        <div className="flex-1 p-4 bg-[#e5ddd5]/75 dark:bg-[#0a100d]/90 overflow-y-auto overscroll-contain space-y-3 flex flex-col justify-end custom-scroll scrollbar-thin scrollbar-thumb-emerald-700/30">
          <div className="self-start max-w-[85%] bg-white/95 dark:bg-[#14231b] text-brand-dark dark:text-slate-100 rounded-r-2xl rounded-bl-2xl p-3 shadow-xs text-xs leading-relaxed relative border border-emerald-500/10">
            <p className="font-semibold text-[10px] text-[#25D366] mb-0.5 uppercase tracking-wide">Dreamscape Assistant</p>
            <p className="text-brand-dark/85 dark:text-slate-300">
              Greetings from beautiful Zambia! 🇿🇲 Let me help you craft the perfect wildlife safari trip or process custom Mobile Money payments directly.
            </p>
            <span className="text-[8px] text-brand-dark/40 dark:text-slate-400 block text-right mt-1 font-mono">16:53 AM</span>
          </div>

          {showTyping ? (
            <div className="self-start bg-white/95 dark:bg-[#14231b] text-brand-dark/65 px-3 py-2 rounded-r-2xl rounded-bl-2xl shadow-xs text-xs flex items-center gap-1 font-mono border border-emerald-500/10">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <div className="self-start max-w-[85%] bg-white/95 dark:bg-[#14231b] text-brand-dark rounded-r-2xl rounded-bl-2xl p-3 shadow-xs text-xs leading-relaxed border border-emerald-500/10">
              <p className="text-brand-dark/85 dark:text-slate-200">
                Select a shortcut helper below, or write your query directly into our dispatch board! 🐆
              </p>
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
            className="w-10 h-10 rounded-lg bg-[#25D366] hover:bg-[#1ebd59] text-white flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0 animate-none"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
