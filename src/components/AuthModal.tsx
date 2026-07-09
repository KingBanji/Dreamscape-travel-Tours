import React, { useState, useEffect, useRef } from "react";
import { X, Lock, Mail, User, Chrome, Sparkles, CheckCircle, AlertCircle, Eye, EyeOff, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthAndData } from "../lib/FirebaseContext";
import { useLanguage } from "../lib/LanguageContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signup" | "login";
}

export default function AuthModal({ isOpen, onClose, initialTab = "signup" }: AuthModalProps) {
  const { signIn, isDbEnabled, setCredentialsUser, user } = useAuthAndData();
  const isInIframe = typeof window !== "undefined" && window.self !== window.top;

  const handleOpenInNewTab = () => {
    window.open(window.location.href, "_blank");
  };
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot" | "mfa">(initialTab as any);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // MFA 2FA State Nodes
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [mfaPhone, setMfaPhone] = useState<string>("");
  const [mfaCode, setMfaCode] = useState<string>("");
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  // References for form elements
  const signupFormRef = useRef<HTMLFormElement>(null);
  const loginFormRef = useRef<HTMLFormElement>(null);

  // Sync activeTab with initialTab when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setShowSignupPassword(false);
      setShowLoginPassword(false);
    }
  }, [isOpen, initialTab]);

  // Clear states when tab changes
  useEffect(() => {
    setFeedbackMsg(null);
    setShowSignupPassword(false);
    setShowLoginPassword(false);
  }, [activeTab]);

  // Bind exact signup event listener as specified by user
  useEffect(() => {
    if (!isOpen || activeTab !== "signup") return;

    const form = document.getElementById("signupForm") as HTMLFormElement;
    if (!form) return;

    const handleSignupSubmit = async (e: Event) => {
      e.preventDefault();
      setLoading(true);
      setFeedbackMsg(null);

      const targetForm = e.target as HTMLFormElement;
      const formData = new FormData(targetForm);
      const body = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password")
      };

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        const data = await res.json();
        if (data.success) {
          setFeedbackMsg({
            type: "success",
            text: language === "fr" ? "Inscription réussie ! Veuillez vous connecter." : "Signup successful! Please log in."
          });
          // Show alert fallback as requested programmatically
          alert(language === "fr" ? "Inscription réussie ! Veuillez vous connecter." : "Signup successful! Please log in.");
          // Switch to login tab after success
          setTimeout(() => {
            setActiveTab("login");
          }, 1500);
        } else {
          setFeedbackMsg({
            type: "error",
            text: data.message || (language === "fr" ? "Une erreur est survenue." : "An error occurred.")
          });
          alert(data.message || "Error");
        }
      } catch (err: any) {
        setFeedbackMsg({
          type: "error",
          text: err.message || "Failed to register"
        });
        alert("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    form.addEventListener("submit", handleSignupSubmit);
    return () => {
      form.removeEventListener("submit", handleSignupSubmit);
    };
  }, [isOpen, activeTab, language]);

  // Handler for custom credentials login
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.mfaRequired) {
          setTempToken(data.tempToken);
          setMfaPhone(data.phone || "");
          setSimulatedOtp(data.code || "123456");
          setMfaCode("");
          setActiveTab("mfa");
          setFeedbackMsg({
            type: "success",
            text: language === "fr" 
              ? "Étape 1 réussie ! Code SMS généré." 
              : "Step 1 complete! SMS Code generated."
          });
          return;
        }

        // Log in user inside our state Context
        setCredentialsUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          token: data.token
        });

        setFeedbackMsg({
          type: "success",
          text: language === "fr" ? "Connexion réussie !" : "Login successful!"
        });

        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setFeedbackMsg({
          type: "error",
          text: data.message || (language === "fr" ? "Identifiants incorrects." : "Invalid credentials.")
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Failed to connect to the server."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/mfa/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, code: mfaCode })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCredentialsUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          token: data.token
        });

        setFeedbackMsg({
          type: "success",
          text: language === "fr" ? "Authentification 2FA réussie !" : "Two-Factor authentication approved!"
        });

        setTimeout(() => {
          onClose();
        }, 850);
      } else {
        setFeedbackMsg({
          type: "error",
          text: data.message || (language === "fr" ? "Code de vérification incorrect." : "Incorrect verification code.")
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Failed to verify. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    try {
      setLoading(true);
      setFeedbackMsg(null);
      await signIn();
      onClose();
    } catch (e: any) {
      console.error("Google Web Auth Exception Caught in Modal:", e);
      const errStr = e && typeof e === "object" ? (e.message || JSON.stringify(e)) : String(e);
      let localizedError = language === "fr"
        ? `L'authentification Google a échoué : ${errStr}`
        : `Google Authentication Error: ${errStr}`;

      if (
        errStr.includes("auth/internal-error") || 
        errStr.includes("auth/network-request-failed") || 
        errStr.includes("popup-closed-by-user") || 
        errStr.includes("popup-blocked") ||
        errStr.includes("iframe-restriction")
      ) {
        localizedError = language === "fr"
          ? "🔐 L'authentification Google est restreinte par les règles de sécurité de l'iframe de votre navigateur. Veuillez vous inscrire ou vous connecter ci-dessus avec votre E-mail et Mot de passe, ou ouvrez cette application dans un nouvel onglet pour utiliser Google."
          : "🔐 Google authentication is restricted by your browser's iframe/third-party cookie isolation rules in this preview canvas. Please use the standard Email & Password registration/login forms above, or open the application in a new tab to authenticate via Google.";
      }

      setFeedbackMsg({
        type: "error",
        text: localizedError
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (!isDbEnabled || !auth) {
      setFeedbackMsg({
        type: "error",
        text: language === "fr" ? "La base de données n'est pas activée." : "Firebase features are currently offline."
      });
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setFeedbackMsg({
        type: "success",
        text: language === "fr" 
          ? "E-mail de réinitialisation envoyé ! Veuillez vérifier votre boîte de réception." 
          : "Password reset email sent! Please check your inbox."
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || (language === "fr" ? "Erreur lors de l'envoi de l'e-mail." : "Failed to send reset email.")
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start sm:items-center justify-center p-2 sm:p-4 py-6 sm:py-8">
      {/* Dark overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-brand-dark/90 backdrop-blur-md z-0"
      />

      {/* Main Drawer or Dialog Body */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-brand-dark border border-brand-teal/20 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh] sm:max-h-[90vh] z-10 scrollbar-thin scrollbar-thumb-brand-teal/20 my-auto"
      >
        {/* Glowing visual accents */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-brand-sand/65 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-20"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-1.5 text-[8px] sm:text-[9px] font-mono tracking-widest text-brand-gold bg-brand-gold/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-brand-gold/20 mb-1.5 sm:mb-2">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand-gold animate-pulse" />
            <span>EXCLUSIVITY MEMBER SPACE</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white uppercase">
            {activeTab === "signup" ? (language === "fr" ? "Rejoindre l'Aventure" : "Dreamscape Passport") : (language === "fr" ? "Se Connecter" : "Explorer Passport")}
          </h3>
          <p className="text-[10px] sm:text-xs text-brand-sand/70 mt-0.5 sm:mt-1 font-sans px-2">
            {activeTab === "signup"
              ? (language === "fr" ? "Configurez votre espace d'expédition de luxe" : "Configure your custom luxury expedition portal")
              : (language === "fr" ? "Entrez vos identifiants de voyage" : "Access your registered safari credentials")}
          </p>
        </div>

        {/* Custom inline errors / success feedback */}
        <AnimatePresence mode="popLayout">
          {feedbackMsg && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`p-2.5 sm:p-3 rounded-xl text-[11px] sm:text-xs flex gap-2 sm:gap-2.5 items-start mb-3 sm:mb-4 border ${
                feedbackMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {feedbackMsg.type === "success" ? (
                <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="font-sans font-medium leading-relaxed">{feedbackMsg.text}</span>
                {feedbackMsg.text.includes("iframe") && (
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    className="self-start mt-1 px-3 py-1 bg-brand-gold text-brand-dark text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-brand-gold-light transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {language === "fr" ? "Ouvrir dans un nouvel onglet" : "Open in New Tab"}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab switch buttons */}
        <div className="flex bg-brand-medium/50 p-0.5 sm:p-1 rounded-xl border border-brand-teal/15 mb-3 sm:mb-4">
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-1 sm:py-2 text-[10px] sm:text-xs font-mono uppercase tracking-wider rounded-lg font-bold transition-all ${
              activeTab === "signup"
                ? "bg-brand-dark text-brand-gold shadow-md border border-brand-teal/20"
                : "text-brand-sand/60 hover:text-white"
            }`}
          >
            {language === "fr" ? "S'Inscrire" : "Sign Up"}
          </button>
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-1 sm:py-2 text-[10px] sm:text-xs font-mono uppercase tracking-wider rounded-lg font-bold transition-all ${
              activeTab === "login" || activeTab === "forgot"
                ? "bg-brand-dark text-brand-gold shadow-md border border-brand-teal/20"
                : "text-brand-sand/60 hover:text-white"
            }`}
          >
            {language === "fr" ? "Connexion" : "Log In"}
          </button>
        </div>

        {/* Account Creation Tab: Rendered exactly matching user requirements */}
        {activeTab === "signup" && (
          <section className="signup">
            <h2 className="text-xs sm:text-sm font-sans font-semibold text-center text-brand-gold uppercase tracking-widest mb-2.5 sm:mb-3.5">Create Your Account</h2>
            <form id="signupForm" action="/api/register" method="POST" className="flex flex-col space-y-3 sm:space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-brand-medium/30 border border-brand-teal/20 text-brand-sand placeholder-brand-sand/40 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-gold transition-all"
              />

              <input
                type="type" // Keep standard properties while styled elegantly
                style={{ display: "none" }}
                disabled
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-brand-medium/30 border border-brand-teal/20 text-brand-sand placeholder-brand-sand/40 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-gold transition-all"
              />

              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                  className="w-full pl-3.5 pr-9 py-2.5 sm:pl-4 sm:pr-10 sm:py-3 bg-brand-medium/30 border border-brand-teal/20 text-brand-sand placeholder-brand-sand/40 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-gold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-sand/50 hover:text-white transition-colors p-1"
                  aria-label={showSignupPassword ? "Hide password" : "Show password"}
                >
                  {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold uppercase tracking-wider text-[11px] sm:text-xs transition-all cursor-pointer shadow-lg shadow-purple-900/10 min-h-[40px] sm:min-h-[44px] disabled:opacity-50 mt-1"
              >
                {loading ? (language === "fr" ? "Inscription..." : "Signing Up...") : "Sign Up"}
              </button>
            </form>
          </section>
        )}

        {/* Credentials Login Tab */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} ref={loginFormRef} className="space-y-3 sm:space-y-4">
            {/* Email Field */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-sand/50">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full pl-10 pr-3.5 py-2.5 sm:pl-10 sm:pr-4 sm:py-3 bg-brand-medium/30 border border-brand-teal/20 text-brand-sand placeholder-brand-sand/40 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-gold transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-sand/50">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <input
                type={showLoginPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
                className="w-full pl-10 pr-9 py-2.5 sm:pl-10 sm:pr-10 sm:py-3 bg-brand-medium/30 border border-brand-teal/20 text-brand-sand placeholder-brand-sand/40 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-gold transition-all"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-sand/50 hover:text-white transition-colors p-1"
                aria-label={showLoginPassword ? "Hide password" : "Show password"}
              >
                {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex justify-end pr-1">
              <button
                type="button"
                onClick={() => setActiveTab("forgot")}
                className="text-[10px] sm:text-xs text-brand-teal hover:text-brand-gold transition-colors font-semibold"
              >
                {language === "fr" ? "Mot de passe oublié ?" : "Forgot Password?"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3.5 bg-[#0ea5e9] text-black font-black font-sans text-xs sm:text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/20 mt-1 sm:bg-gradient-to-r sm:from-brand-gold sm:to-brand-gold-light sm:text-brand-dark"
            >
              {loading ? (language === "fr" ? "Connexion..." : "Verifying...") : (language === "fr" ? "Log In" : "Log In")}
            </button>
          </form>
        )}

        {/* Forgot Password View */}
        {activeTab === "forgot" && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3 sm:space-y-4">
            <div className="text-center mb-1">
              <p className="text-[11px] sm:text-xs text-brand-sand/70">
                {language === "fr" 
                  ? "Entrez votre adresse e-mail pour recevoir un lien de réinitialisation de mot de passe." 
                  : "Enter your email address to receive a password reset link."}
              </p>
            </div>
            {/* Email Field */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-sand/50">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full pl-10 pr-3.5 py-2.5 sm:pl-10 sm:pr-4 sm:py-3 bg-brand-medium/30 border border-brand-teal/20 text-brand-sand placeholder-brand-sand/40 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-gold transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3.5 bg-gradient-to-r from-brand-gold to-brand-gold-light text-brand-dark font-black font-sans text-xs sm:text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-sky-500/20 mt-1"
            >
              {loading ? (language === "fr" ? "Envoi..." : "Sending...") : (language === "fr" ? "Envoyer le lien" : "Send Reset Link")}
            </button>

            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="text-[11px] sm:text-xs text-brand-teal hover:text-brand-gold transition-all font-semibold"
              >
                {language === "fr" ? "Retour à la connexion" : "Back to Log In"}
              </button>
            </div>
          </form>
        )}

        {/* MFA Verification View */}
        {activeTab === "mfa" && (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="text-center mb-2 bg-brand-medium/20 p-3.5 rounded-xl border border-brand-teal/10">
              <p className="text-xs text-brand-gold font-bold uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 animate-pulse text-brand-gold" />
                Two-Step Verification
              </p>
              <p className="text-[11px] text-brand-sand/75 leading-relaxed">
                {language === "fr" 
                  ? `Saisissez le code d'authentification envoyé à votre téléphone` 
                  : `Please enter the 6-digit authentication code sent via SMS to your configured device:`}
                {mfaPhone && <span className="block font-mono text-brand-gold mt-1 font-bold">{mfaPhone}</span>}
              </p>
            </div>

            {/* Simulated SMS Broadcast Center for sandbox check */}
            {simulatedOtp && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center text-xs">
                <span className="block font-semibold text-yellow-400 mb-1 font-mono uppercase tracking-wider text-[10px]">
                  📡 Sandboxed Mobile Network Carrier
                </span>
                <p className="text-[11px] text-brand-sand/80 mb-2">
                  To complete testing in this sandbox, use the simulated code:
                </p>
                <div className="flex justify-center items-center gap-2">
                  <span className="px-3.5 py-1 bg-yellow-500/15 border border-yellow-500/35 rounded-lg text-yellow-300 font-mono font-black text-sm tracking-widest leading-none select-all cursor-pointer">
                    {simulatedOtp}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMfaCode(simulatedOtp);
                      setFeedbackMsg({
                        type: "success",
                        text: language === "fr" ? "OTP collé !" : "OTP Populated into Field!"
                      });
                    }}
                    className="text-[9px] uppercase tracking-wider bg-yellow-500 text-black px-2 py-1 rounded font-bold hover:bg-yellow-400 transition-colors cursor-pointer shrink-0"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>
            )}

            {/* OTP Code Field */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-sand/50">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                name="code"
                placeholder="6-Digit Code (e.g. 123456)"
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-3 bg-brand-medium/30 border border-brand-teal/20 text-brand-sand text-center placeholder-brand-sand/40 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:border-brand-gold transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3.5 bg-gradient-to-r from-brand-gold to-brand-gold-light text-brand-dark font-black font-sans text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-gold/10 mt-1"
            >
              {loading ? (language === "fr" ? "Vérification..." : "Verifying Code...") : (language === "fr" ? "Vérifier et Se Connecter" : "Verify & Sign In")}
            </button>

            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setTempToken(null);
                  setSimulatedOtp(null);
                  setFeedbackMsg(null);
                }}
                className="text-[11px] sm:text-xs text-brand-teal hover:text-brand-gold transition-all font-semibold"
              >
                {language === "fr" ? "Annuler et retourner" : "Cancel and Return"}
              </button>
            </div>
          </form>
        )}

        {/* Google Authentication Integration */}
        {isDbEnabled && (
          <div className="mt-6 pt-6 border-t border-brand-teal/15 space-y-3">
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-brand-dark px-2 text-brand-sand/50 font-mono text-[9px] tracking-wider">
                {language === "fr" ? "Ou utiliser Google Passport" : "Or use Google Passport"}
              </span>
            </div>

            {isInIframe && (
              <div className="p-3 bg-brand-teal/5 rounded-xl border border-brand-teal/15 text-[10.5px] text-brand-sand/75 flex items-start gap-2 leading-relaxed mb-1">
                <AlertCircle className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-brand-teal block">
                    {language === "fr" ? "Avis d'authentification de l'Aperçu" : "Preview Sandbox Authentication Notice"}
                  </span>
                  <p>
                    {language === "fr"
                      ? "La sécurité de votre navigateur restreint la connexion Google dans cet aperçu. Si l'ouverture échoue ou si vous préférez un flux direct, veuillez cliquer ci-dessous pour ouvrir l'application dans un nouvel onglet standard."
                      : "Your browser's security rules restrict Google sign-in inside this preview iframe. If it fails or you want a direct login, click below to open the application in a new top-level tab."}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    className="inline-flex px-3 py-1 bg-brand-teal hover:bg-brand-teal-light text-brand-dark text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors items-center gap-1 cursor-pointer mt-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {language === "fr" ? "Ouvrir dans un nouvel onglet" : "Open in New Tab"}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleGoogleSignInClick}
              disabled={loading}
              className="w-full py-3 bg-brand-medium/55 hover:bg-brand-medium hover:border-brand-teal/40 text-brand-sand font-bold text-xs font-mono uppercase tracking-widest rounded-xl border border-brand-teal/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Chrome className="w-4 h-4 text-brand-gold" />
              <span>{language === "fr" ? "S'authentifier avec Google" : "Connect via Google"}</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
