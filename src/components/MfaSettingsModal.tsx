import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Shield, ShieldAlert, Phone, Key, HelpCircle, Check, Loader2 } from "lucide-react";
import { useAuthAndData } from "../lib/FirebaseContext";
import { useLanguage } from "../lib/LanguageContext";

interface MfaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MfaSettingsModal({ isOpen, onClose }: MfaSettingsModalProps) {
  const { user, updateLocalUserFields } = useAuthAndData();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [step, setStep] = useState<"status" | "setup_phone" | "verify_otp">("status");

  if (!isOpen || !user) return null;

  const isMfaEnabled = user.mfa_enabled === true || user.mfa_enabled === "true";

  // Reset local state on cancel / close
  const handleClose = () => {
    setPhone("");
    setCode("");
    setTempToken(null);
    setSimulatedOtp(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    setStep("status");
    onClose();
  };

  // Start MFA activation request
  const handleStartSetup = () => {
    setPhone(user.phone || "");
    setErrorMsg(null);
    setSuccessMsg(null);
    setStep("setup_phone");
  };

  // Submit phone number to setup backend
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/mfa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTempToken(data.tempToken);
        setSimulatedOtp(data.code || "123456");
        setStep("verify_otp");
        setSuccessMsg(
          language === "fr"
            ? "Code de vérification envoyé !"
            : "Verification code sent successfully via simulated carrier."
        );
      } else {
        setErrorMsg(data.message || "Failed to process phone setup.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP submission to complete configuration
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !tempToken) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({ tempToken, code })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update user state context
        if (updateLocalUserFields) {
          updateLocalUserFields({ mfa_enabled: true, phone });
        }
        setSuccessMsg(
          language === "fr"
            ? "Authentification à deux facteurs activée avec succès !"
            : "Two-Factor authentication configured and active!"
        );
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setErrorMsg(data.message || "Verification code failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Verification error.");
    } finally {
      setLoading(false);
    }
  };

  // Disable MFA security block
  const handleDisableMfa = async () => {
    if (!window.confirm(
      language === "fr"
        ? "Êtes-vous sûr de vouloir désactiver l'A2F ? Cela réduira la sécurité de votre compte."
        : "Are you sure you want to disable SMS 2FA? This will decrease your account protection."
    )) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/mfa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (updateLocalUserFields) {
          updateLocalUserFields({ mfa_enabled: false, phone: null });
        }
        setSuccessMsg(
          language === "fr"
            ? "Sécurité A2F désactivée."
            : "Two-Factor authentication has been disabled."
        );
        setTimeout(() => {
          handleClose();
        }, 1200);
      } else {
        setErrorMsg(data.message || "Failed to disable 2FA.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error disabling MFA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Glow transparent overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-brand-dark/85 backdrop-blur-md z-0"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-md bg-brand-dark border border-brand-teal/20 backdrop-blur-md rounded-2xl p-5 sm:p-7 shadow-2xl z-10 text-brand-sand font-sans overflow-hidden"
      >
        {/* Subtle glowing core backdrops */}
        <div className="absolute -top-24 -left-20 w-48 h-48 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-20 w-48 h-48 bg-brand-teal/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header toolbar */}
        <div className="flex justify-between items-center pb-3 border-b border-brand-teal/10 mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-gold" />
            <h3 className="font-bold font-sans text-xs sm:text-sm uppercase tracking-wider text-brand-sand">
              {language === "fr" ? "Sécurité de Compte (A2F)" : "Shield Security (MFA)"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg bg-brand-medium/30 border border-brand-teal/10 text-brand-sand/65 hover:text-brand-gold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedbacks */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs flex gap-2 items-center mb-4">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <p className="font-medium">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-brand-teal/15 border border-brand-teal/30 text-brand-teal rounded-xl text-xs flex gap-2 items-center mb-4">
            <Check className="w-4 h-4 shrink-0 text-brand-gold" />
            <p className="font-semibold">{successMsg}</p>
          </div>
        )}

        {/* Step Views */}
        {step === "status" && (
          <div className="space-y-4">
            <div className="text-center py-3 bg-brand-medium/10 rounded-xl border border-brand-teal/10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 bg-brand-medium border border-brand-teal/20 shadow-lg">
                <Shield className={`w-8 h-8 ${isMfaEnabled ? "text-brand-teal fill-brand-teal/20" : "text-brand-sand/45"}`} />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-brand-sand mb-1">
                {language === "fr" ? "Authentification à deux facteurs" : "Two-Step Authentication Status"}
              </h4>
              <p className="text-[10px] sm:text-xs">
                {language === "fr" ? "Technologie de sécurisation par code éphémère SMS" : "Secure transient key delivery by simulated mobile SMS carriers."}
              </p>

              <div className="mt-4 flex justify-center">
                <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest border flex items-center gap-1.5 ${isMfaEnabled ? "bg-brand-teal/10 text-brand-teal border-brand-teal/30" : "bg-brand-medium/55 text-brand-sand/60 border-brand-teal/10"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isMfaEnabled ? "bg-brand-teal animate-pulse" : "bg-brand-sand/40"}`} />
                  {isMfaEnabled ? (language === "fr" ? "ACTIVÉ" : "SHIELD ENFORCED") : (language === "fr" ? "INACTIF" : "DISABLED")}
                </span>
              </div>
            </div>

            {isMfaEnabled ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-brand-medium/10 rounded-xl border border-brand-teal/10 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-brand-sand/60">Configured SMS Line:</span>
                    <span className="font-mono text-brand-gold font-bold">{user.phone || "No Registered Device"}</span>
                  </div>
                  <p className="text-[10px] text-brand-sand/65 leading-relaxed text-center pt-1 border-t border-brand-teal/5">
                    Whenever you register a session path or verify credentials, we will challenge you with a 6-digit secure key.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleDisableMfa}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs uppercase tracking-widest border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all cursor-pointer"
                  >
                    {loading ? "Disabling..." : "Disable 2FA"}
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 py-2.5 bg-brand-medium hover:bg-brand-medium/85 text-brand-sand font-bold text-xs uppercase tracking-widest border border-brand-teal/20 rounded-xl transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <p className="text-[11px] text-brand-sand/75 leading-relaxed text-center">
                  Add an extra layer of protection. Once set up, signing into your account will require both your passport credentials and a secure code sent via SMS.
                </p>

                <button
                  onClick={handleStartSetup}
                  className="w-full py-3 bg-gradient-to-r from-brand-gold to-brand-gold-light text-brand-dark font-black font-sans text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-brand-gold/15 cursor-pointer"
                >
                  Configure SMS 2FA
                </button>
              </div>
            )}
          </div>
        )}

        {step === "setup_phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="text-center bg-brand-medium/20 p-3 rounded-xl border border-brand-teal/10">
              <p className="text-xs text-brand-gold font-bold uppercase tracking-widest mb-1">
                Step 1: Contact Detail
              </p>
              <p className="text-[11px] text-brand-sand/70">
                Register a mobile phone number to receive temporary authorization tokens.
              </p>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-sand/50">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <input
                type="tel"
                placeholder="+260 971 234567"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-brand-medium/30 border border-brand-teal/20 text-brand-sand rounded-xl text-xs focus:outline-none focus:border-brand-gold transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("status")}
                className="flex-1 py-2.5 bg-brand-medium text-brand-sand border border-brand-teal/20 hover:bg-brand-medium/80 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-brand-teal to-[#0d9488] text-brand-sand border border-brand-teal/20 hover:to-[#115e59] rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? "Sending..." : "Send Token"}
              </button>
            </div>
          </form>
        )}

        {step === "verify_otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center bg-brand-medium/20 p-3 rounded-xl border border-brand-teal/10">
              <p className="text-xs text-brand-gold font-bold uppercase tracking-widest mb-1">
                Step 2: Verification Challenge
              </p>
              <p className="text-[11px] text-brand-sand/70">
                Enter the 6-digit confirmation code generated.
              </p>
            </div>

            {/* Sandbox Simulation Widget */}
            {simulatedOtp && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center text-xs">
                <span className="block font-semibold text-yellow-400 mb-1 font-mono uppercase tracking-wider text-[10px]">
                  📡 Sandbox Simulated Cellular Transmitter
                </span>
                <p className="text-[11px] text-brand-sand/80 mb-2">
                  SMS transmitted successfully! Simulated payload verification code:
                </p>
                <div className="flex justify-center items-center gap-2">
                  <span className="px-3.5 py-1 bg-yellow-500/15 border border-yellow-500/35 rounded-lg text-yellow-300 font-mono font-black text-sm tracking-widest leading-none select-all cursor-pointer">
                    {simulatedOtp}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCode(simulatedOtp)}
                    className="text-[9px] uppercase tracking-wider bg-yellow-500 text-black px-2 py-1 rounded font-bold hover:bg-yellow-400 transition-colors cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-sand/50">
                <Key className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="6-Digit Verification Code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-2.5 bg-brand-medium/30 border border-brand-teal/20 text-brand-sand rounded-xl text-center font-mono tracking-widest text-xs focus:outline-none focus:border-brand-gold transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("setup_phone")}
                className="flex-1 py-2.5 bg-brand-medium text-brand-sand border border-brand-teal/20 hover:bg-brand-medium/85 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                Change Phone
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-brand-gold to-brand-gold-light text-brand-dark font-black font-sans text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-dark" />}
                {loading ? "Verifying..." : "Secure Account"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
