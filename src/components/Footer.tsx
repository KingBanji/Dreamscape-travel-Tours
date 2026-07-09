import React, { useState } from "react";
import { Compass, Mail, Phone, MapPin, Heart, Share2, Globe, Send, Sparkles, Check } from "lucide-react";
import DreamscapeLogo from "./DreamscapeLogo";
import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseEnabled } from "../lib/firebase";

interface FooterProps {
  onOpenAdmin?: () => void;
}

export default function Footer({ onOpenAdmin }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem("dreamscape_newsletter_subscribed") === "true";
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !email.includes("@")) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isFirebaseEnabled && db) {
        const id = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await setDoc(doc(db, "newsletter_subscribers", id), {
          id,
          email: email.trim().toLowerCase(),
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem("dreamscape_newsletter_subscribed", "true");
      setIsSubscribed(true);
      setSuccessMsg("Welcome aboard! You are now subscribed to Dreamscape updates.");
      setEmail("");
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      setErrorMsg("Failed to subscribe. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="bg-brand-dark text-brand-sand border-t border-brand-teal/25 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Subscription Row */}
        <div className="pb-10 mb-10 border-b border-brand-teal/15 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md text-center md:text-left">
            <h3 className="font-serif text-lg font-bold text-white tracking-wide uppercase flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-brand-gold animate-pulse" />
              Join the Wilderness Registry
            </h3>
            <p className="text-xs text-brand-sand/75 mt-1 leading-relaxed">
              Sign up for weekly safari updates, conservation stories, and exclusive Zambia travel inspiration.
            </p>
          </div>
          
          <div className="w-full md:max-w-md">
            {isSubscribed ? (
              <div className="p-3 bg-brand-teal/10 border border-brand-teal/20 rounded-xl flex items-center gap-3 text-brand-teal">
                <Check className="w-5 h-5 shrink-0" />
                <span className="text-xs font-semibold">
                  You are subscribed! Look forward to weekly wilderness updates.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-sand/55" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your explorer email"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-medium/55 border border-brand-teal/20 rounded-xl text-xs text-white placeholder:text-brand-sand/40 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-brand-teal hover:bg-brand-teal/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 shadow-md shadow-brand-teal/10"
                >
                  <span>{isSubmitting ? "Subscribing..." : "Subscribe"}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            {errorMsg && (
              <p className="text-[10px] text-red-400 mt-2 ml-1">
                {errorMsg}
              </p>
            )}
            {successMsg && (
              <p className="text-[10px] text-brand-teal mt-2 ml-1">
                {successMsg}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand pitch column */}
          <div className="md:col-span-1.5 space-y-5">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick("home")}>
              <div className="w-10 h-10 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-brand-teal/20 p-0.5">
                <DreamscapeLogo className="w-full h-full object-contain" />
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-white uppercase block">
                DREAMSCAPE TOURS
              </span>
            </div>
            
            <p className="text-xs text-brand-sand/70 leading-relaxed max-w-sm">
              Explore Mosi-oa-Tunya, track black rhinos, or drift quietly over Busanga marsh channels. Dedicated to carbon-neutral luxury and authentic community preservation.
            </p>

            {/* Immersive Social Media Channels & Quick Redirects */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-brand-teal font-extrabold block">
                Official Social Channels
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://web.facebook.com/lucidtravelandtourszm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-medium hover:bg-brand-teal hover:text-white text-brand-sand/90 border border-brand-teal/20 text-xs font-semibold tracking-wide transition-all duration-300"
                  title="Official Facebook Page"
                >
                  <span className="text-[10px] font-mono text-brand-gold font-extrabold">FB</span>
                  <span>Facebook</span>
                </a>
                <a
                  href="mailto:dreamscapetourszambia@gmail.com"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-medium hover:bg-brand-teal hover:text-white text-brand-sand/90 border border-brand-teal/20 text-xs font-semibold tracking-wide transition-all duration-300"
                  title="Email Advisory Desk"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            <div className="text-[10px] font-mono text-brand-teal uppercase tracking-widest pt-1">
              Licensed Zambia Operator #ZTA-108842
            </div>
          </div>

          {/* Quick links columns */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore Wilds
            </h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <button
                onClick={() => handleNavClick("home")}
                className="text-left text-brand-sand/75 hover:text-brand-gold transition-colors block py-0.5 cursor-pointer"
              >
                Top Overview
              </button>
              <button
                onClick={() => handleNavClick("destinations")}
                className="text-left text-brand-sand/75 hover:text-brand-gold transition-colors block py-0.5 cursor-pointer"
              >
                Ecosystems
              </button>
              <button
                onClick={() => handleNavClick("planner")}
                className="text-left text-brand-sand/75 hover:text-brand-gold transition-colors block py-0.5 cursor-pointer"
              >
                Interactive Builder
              </button>
              <button
                onClick={() => handleNavClick("packages")}
                className="text-left text-brand-sand/75 hover:text-brand-gold transition-colors block py-0.5 cursor-pointer"
              >
                Ready-Made Tours
              </button>
            </div>
          </div>

          {/* Guidelines and help column */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4">
              Resources &amp; Support
            </h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <button
                onClick={() => handleNavClick("faq")}
                className="text-left text-brand-sand/75 hover:text-brand-gold transition-colors block py-0.5 cursor-pointer"
              >
                Traveler FAQ
              </button>
              <button
                onClick={() => handleNavClick("reviews")}
                className="text-left text-brand-sand/75 hover:text-brand-gold transition-colors block py-0.5 cursor-pointer"
              >
                Verified Reviews
              </button>
              <button
                onClick={() => handleNavClick("contact")}
                className="text-left text-brand-sand/75 hover:text-brand-gold transition-colors block py-0.5 cursor-pointer"
              >
                Advisor Inquiry
              </button>
              <a
                href="#"
                className="text-left text-brand-sand/75 hover:text-brand-gold transition-colors block py-0.5"
              >
                Visa Guidelines
              </a>
            </div>
          </div>

          {/* Local contact details */}
          <div>
            <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-4">
              Official Coordinates
            </h4>
            <div className="space-y-3.5 text-xs text-brand-sand/70">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <span>Great East Road, Lusaka, Zambia</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+260975222136" className="hover:text-white transition-all">+260 975 222 136</a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <a href="mailto:dreamscapetourszambia@gmail.com" className="hover:text-white transition-all">
                  dreamscapetourszambia@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Legal copyrights notes */}
        <div className="pt-12 mt-12 border-t border-brand-teal/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-brand-sand/55 text-center">
          <div>
            &copy; {currentYear} <span onClick={onOpenAdmin} className="cursor-default hover:text-brand-gold transition-colors duration-300">Dreamscape Tours Zambia</span> Travel &amp; Tours. Zambia Tourism Agency Certified. All Rights Reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted for true explorers with</span>
            <Heart className="w-3.5 h-3.5 text-brand-gold fill-brand-gold animate-pulse" />
            <span>in Lusaka, Zambia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
