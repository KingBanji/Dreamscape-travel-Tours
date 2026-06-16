import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Bot, RotateCcw, Compass, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useScrollSync } from "../hooks/useScrollSync";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

const QUICK_SUGGESTIONS = [
  "🧭 Shantumbu Falls Tour?",
  "👑 Traditional Ceremonies?",
  "🐆 Leopard safari?",
  "💰 Mobile Money booking?",
  "🇿🇲 Kopala vs LSK slang?"
];

interface AIChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatBot({ isOpen, onClose }: AIChatBotProps) {
  const [unreadCount, setUnreadCount] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Salibonani & Greetings! 🐆 I am your Dreamscape Tours Zambia AI Safari Expert. I've been fully briefed on our premium Zambia expeditions—like our hidden Shantumbu Falls day tour (ZK 650), the nocturnal South Luangwa leopard safaris, or our 12-day absolute luxury rivers tour. Ask me anything about routes, customizable itineraries, secure Mobile Money, or traditional ceremonies! Modern and traditional, we are ready to guide you.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clear unread badge when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollSync = useScrollSync(isOpen, drawerRef);

  const handleMouseEnter = scrollSync.handleMouseEnter;
  const handleMouseLeave = scrollSync.handleMouseLeave;
  const handleTouchStart = scrollSync.handleTouchStart;
  const handleTouchEnd = scrollSync.handleTouchEnd;

  // Keep chat scrolls pinned to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = customText !== undefined ? customText.trim() : inputText.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (customText === undefined) {
      setInputText("");
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.reply || "I couldn't contact the ranger outpost. Please query the trails assistant again in a moment!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: "Our radio frequencies hit a brief dust wind! Please verify your online connection and submit again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (window.confirm("Do you want to reset your conversational trail log with the AI Advisor?")) {
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: "Radio trail reset! Where would you like to direct your next luxury Zambian coordinates? 🧭",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  return (
    <div
      id="aichatbot-drawer-backdrop"
      className={`fixed inset-0 z-50 bg-brand-dark/70 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      } flex justify-start`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="chat-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`w-full max-w-md bg-gradient-to-b from-white to-brand-sand/10 dark:from-brand-dark dark:to-brand-dark/95 h-full shadow-2xl overflow-hidden flex flex-col justify-between border-r border-brand-sand-dark/20 text-brand-dark dark:text-slate-100 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header section with brand gradients */}
        <div className="bg-gradient-to-r from-brand-teal/80 to-brand-dark/90 p-4 text-white flex items-center justify-between border-b border-brand-sand-dark/20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-brand-gold/15 flex items-center justify-center border border-brand-gold/30 shrink-0">
              <Bot className="w-5 h-5 text-brand-gold shrink-0 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-gold flex items-center gap-1">
                AI Safari Advisor <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              </h4>
              <span className="text-[9px] text-teal-300 dark:text-teal-400 font-mono tracking-widest block uppercase">
                ● Trail Intelligence
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleResetChat}
              className="w-8 h-8 rounded-lg bg-black/10 hover:bg-black/25 flex items-center justify-center cursor-pointer transition-colors text-white/80 hover:text-white"
              title="Reset Discussion Logs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-black/10 hover:bg-black/25 flex items-center justify-center cursor-pointer transition-colors text-white/80 hover:text-white"
              title="Close Advisor Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages Log viewports with responsive height */}
        <div
          id="chatbox"
          ref={drawerRef}
          className="flex-1 overflow-y-auto overscroll-contain p-4 bg-brand-sand/10 dark:bg-[#070c16]/25 space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-brand-sand-dark"
        >
          {messages.map((msg) => {
            const isAI = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  isAI ? "self-start" : "self-end items-end"
                }`}
              >
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm font-sans ${
                    isAI
                      ? "bg-white dark:bg-[#0f1b35] text-brand-dark dark:text-slate-100 rounded-tl-none border border-brand-sand-dark dark:border-teal-900/20"
                      : "bg-brand-teal text-white rounded-tr-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[8px] text-brand-dark/35 dark:text-slate-400/50 mt-1 pl-1 font-mono uppercase tracking-tight">
                  {msg.time}
                </span>
              </div>
            );
          })}

          {isLoading && (
            <div className="self-start max-w-[85%] bg-white dark:bg-[#0f1b35] text-brand-dark dark:text-slate-100 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 border border-brand-sand-dark dark:border-teal-900/20">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-teal" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-teal animate-pulse">
                Mapping coordinate...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Chips (WhatsApp-style) */}
        <div className="px-3.5 py-2.5 bg-brand-sand/15 dark:bg-black/15 border-t border-brand-sand-dark/15 dark:border-teal-950/20">
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none snap-x mask-fade-edges">
            {QUICK_SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(undefined, sug)}
                className="shrink-0 snap-center bg-white/90 dark:bg-slate-900/95 text-brand-dark/95 dark:text-slate-200 border border-brand-sand-dark/60 dark:border-slate-800 rounded-full px-3 py-1.5 text-xs font-semibold hover:border-brand-teal hover:bg-brand-teal/5 transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* In-app action suggestion board */}
        <div className="p-2.5 bg-brand-sand/10 dark:bg-black/25 border-t border-b border-brand-sand-dark/10 dark:border-teal-950/30 flex items-center gap-2 justify-center">
          <Compass className="w-3.5 h-3.5 text-brand-teal shrink-0" />
          <span className="text-[9px] font-bold font-mono text-brand-teal tracking-wide uppercase text-center">
            Secure bookings instantly with Mobile Money
          </span>
        </div>

        {/* Input Submission forms */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white/20 dark:bg-black/30 backdrop-blur-md flex items-center gap-2 border-t border-brand-sand-dark/20 dark:border-teal-950/45"
        >
          <input
            id="userInput"
            type="text"
            autoComplete="off"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask details..."
            disabled={isLoading}
            className="flex-1 bg-brand-sand/50 dark:bg-[#050b14] hover:bg-brand-sand/80 border border-brand-sand-dark dark:border-teal-900/30 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all text-brand-dark dark:text-white"
          />
          <button
            type="submit"
            id="sendMessageBtn"
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 rounded-lg bg-brand-teal hover:bg-brand-teal-light text-white flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send Message"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
