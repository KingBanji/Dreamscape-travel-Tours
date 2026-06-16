import React, { useState } from "react";
import { X, Calendar, Ticket, Compass, CheckCircle2, Music, Sparkles } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

interface MusicTourRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MusicTourRegisterModal({ isOpen, onClose }: MusicTourRegisterModalProps) {
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tourCity, setTourCity] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const docData = {
        name,
        email,
        phone,
        tourCity,
        message,
        createdAt: new Date().toISOString()
      };

      if (db) {
        // Save directly to Firestore collection "music_tour_registrations"
        try {
          await addDoc(collection(db, "music_tour_registrations"), docData);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, "music_tour_registrations");
        }
      } else {
        // Fallback to localStorage if Firebase is not enabled (simulating connection)
        const localData = JSON.parse(localStorage.getItem("music_tour_registrations") || "[]");
        localData.push(docData);
        localStorage.setItem("music_tour_registrations", JSON.stringify(localData));
      }

      setSubmitSuccess(true);
      // Reset form fields
      setName("");
      setEmail("");
      setPhone("");
      setTourCity("");
      setMessage("");
    } catch (err: any) {
      console.error("Music tour registration fail:", err);
      setSubmitError(language === "fr" ? "Une erreur est survenue lors de l'enregistrement." : "An error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="music-tour-modal-backdrop"
      className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "music-tour-modal-backdrop") {
          onClose();
        }
      }}
    >
      <div 
        id="music-tour-modal-container"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl border border-[#1DB954]/30 bg-gradient-to-br from-[#0A2540] via-[#0b1426] to-[#1E3A8A] text-white animate-fade-in duration-300"
      >
        {/* Absolute Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#1DB954]/15 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 pb-2 flex items-center justify-between border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954] animate-pulse">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold tracking-tight text-[#1DB954] flex items-center gap-1.5 uppercase">
                <span>🎟️</span>
                <span>{language === "fr" ? "Inscription Tour Musical" : "Zambia Music Tour"}</span>
              </h3>
              <p className="text-[10px] font-mono tracking-wider text-slate-300 uppercase">
                {language === "fr" ? "Accès anticipé et playlists" : "Free updates & early tickets"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 relative z-10">
          {submitSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-[#1DB954]/20 border border-[#1DB954] rounded-full flex items-center justify-center mx-auto text-[#1DB954] animate-bounce-slow">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-xl font-bold text-white">
                  {language === "fr" ? "Inscription Réussie !" : "Registration Successful!"}
                </h4>
                <p className="text-sm text-slate-350 max-w-sm mx-auto">
                  {language === "fr" 
                    ? "Merci ! Nous vous enverrons toutes les nouveautés et l'accès exclusif aux tickets sous peu." 
                    : "Join the rhythm! We have locked in your spot and will send updates, early ticket options, and playlist releases to your email."}
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setSubmitSuccess(false);
                    onClose();
                  }}
                  className="px-6 py-2 bg-[#1DB954] text-black font-semibold text-xs rounded-full uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  {language === "fr" ? "Fermer" : "View Dashboard"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-sm">
              <p className="text-xs text-slate-300 text-center bg-[#112240]/60 p-3 rounded-xl border border-blue-500/20 leading-relaxed font-sans">
                {language === "fr" 
                  ? "Rejoignez l'aventure exclusive ! Recevez des informations sur le circuit, des accès privilégiés aux tickets et des playlists." 
                  : "Join the ultimate rhythm! Sign up now to receive live updates, early bird ticket sales, and special Zambian curator playlists."}
              </p>

              {submitError && (
                <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-200 text-xs rounded-lg text-center">
                  {submitError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase text-brand-teal tracking-wider mb-1 font-bold">
                    {language === "fr" ? "Nom complet" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mwansa Banda"
                    className="w-full p-3 rounded-lg border-none bg-[#112240] text-white text-xs focus:ring-1 focus:ring-[#1DB954] outline-hidden placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-brand-teal tracking-wider mb-1 font-bold">
                      {language === "fr" ? "Adresse email" : "Email Address"}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mwansa@gmail.com"
                      className="w-full p-3 rounded-lg border-none bg-[#112240] text-white text-xs focus:ring-1 focus:ring-[#1DB954] outline-hidden placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-brand-teal tracking-wider mb-1 font-bold">
                      {language === "fr" ? "Numéro téléphone" : "Phone (WhatsApp)"}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+260 97..."
                      className="w-full p-3 rounded-lg border-none bg-[#112240] text-white text-xs focus:ring-1 focus:ring-[#1DB954] outline-hidden placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-brand-teal tracking-wider mb-1 font-bold">
                    {language === "fr" ? "Ville / Intérêt" : "Select Tour City / Interest"}
                  </label>
                  <select
                    required
                    value={tourCity}
                    onChange={(e) => setTourCity(e.target.value)}
                    className="w-full p-3 rounded-lg border-none bg-[#112240] text-white text-xs focus:ring-1 focus:ring-[#1DB954] outline-hidden cursor-pointer"
                  >
                    <option value="" className="bg-[#112240]">-- {language === "fr" ? "Choisir" : "Select City"} --</option>
                    <option value="Lusaka" className="bg-[#112240]">Lusaka</option>
                    <option value="Livingstone" className="bg-[#112240]">Livingstone (Victoria Falls)</option>
                    <option value="Kitwe" className="bg-[#112240]">Kitwe</option>
                    <option value="Ndola" className="bg-[#112240]">Ndola</option>
                    <option value="All" className="bg-[#112240] font-bold text-[#1DB954]">{language === "fr" ? "Toutes les villes" : "All Cities - Full Tour"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-brand-teal tracking-wider mb-1 font-bold">
                    {language === "fr" ? "Demandes spéciales" : "Special Requests / Questions?"}
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={language === "fr" ? "Des requêtes ou questions particulières ?" : "Any special requests or details..."}
                    className="w-full p-3 rounded-lg border-none bg-[#112240] text-white text-xs focus:ring-1 focus:ring-[#1DB954] outline-hidden resize-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#1DB954] text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-emerald-450 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
                >
                  {isSubmitting ? (
                    <span>{language === "fr" ? "Enregistrement..." : "Locking In Spot..."}</span>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      <span>{language === "fr" ? "S'enregistrer maintenant - Gratuit !" : "Register Now - It's Free!"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
