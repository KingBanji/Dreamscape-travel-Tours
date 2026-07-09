import { useState, FormEvent } from "react";
import { 
  Mail, Phone, MapPin, Send, MessageSquare, Clock, 
  CheckCircle2 as CheckCircle, ExternalLink, 
  Lock, RefreshCw, AlertCircle, Info, Sparkles 
} from "lucide-react";
import { useGoogleWorkspace } from "../lib/GoogleWorkspaceContext";
import { useLanguage } from "../lib/LanguageContext";

export default function ContactSection() {
  const { language, setLanguage, t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);




  const {
    user,
    accessToken,
    formId,
    formUrl,
    isReconnecting,
    signInWithWorkspace,
    signOutWorkspace,
    createWorkspaceIntegration,
    submitContactInquiry,
    sendEmailViaGmail
  } = useGoogleWorkspace();

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }
    setLoading(true);
    try {
      // Submit contact inquiry & Gmail notifications
      await submitContactInquiry(name, email, phone, message);
      setLoading(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSyncWorkspace = async () => {
    setRefreshing(true);
    setWorkspaceError(null);
    try {
      if (!accessToken) {
        await signInWithWorkspace();
      }
    } catch (err: any) {
      const isPopupClosed = err?.code === "auth/popup-closed-by-user" || err?.message?.includes("popup-closed-by-user");
      if (isPopupClosed) {
        setWorkspaceError("Connection canceled: The Google sign-in window was closed by the user.");
      } else {
        setWorkspaceError(err?.message || "Failed to authenticate workspace integration. Please try again.");
        console.error(err);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleWorkspaceResetError = () => {
    setWorkspaceError(null);
  };

  const handleProvisionWorkspace = async () => {
    setIsProvisioning(true);
    setWorkspaceError(null);
    try {
      await createWorkspaceIntegration();
    } catch (err: any) {
      const isPopupClosed = err?.code === "auth/popup-closed-by-user" || err?.message?.includes("popup-closed-by-user");
      if (isPopupClosed) {
        setWorkspaceError("Workspace setup canceled: The Google sign-in window was closed.");
      } else {
        setWorkspaceError(err?.message || "Failed to provision Google Form. Please try again.");
        console.error(err);
      }
    } finally {
      setIsProvisioning(false);
    }
  };



  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Module Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-teal font-extrabold block mb-2">
            Secure Your Coordinates
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-dark uppercase">
            Get In Touch
          </h2>
          <div className="h-0.5 w-16 bg-brand-teal mx-auto mt-4 mb-3" />
          <p className="text-brand-dark/70 text-sm sm:text-base">
            Ask for custom price quotes or logistical details. Our certified expert guides answer questions directly.
          </p>
        </div>

        {/* System Language Translator */}
        <div id="contact-language-selector" className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 bg-brand-sand/50 rounded-2xl border border-brand-sand-dark max-w-xl mx-auto mb-12 gap-3 shadow-xs">
          <span className="text-xs font-mono uppercase tracking-wider text-brand-dark/80 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-teal" />
            {language === "fr" ? "Langue d'Affichage :" : "Translation / System Language :"}
          </span>
          <div className="flex items-center bg-brand-medium/25 rounded-full p-1 border border-brand-teal/20 shadow-inner">
            <button
              onClick={() => setLanguage("en")}
              type="button"
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                language === "en"
                  ? "bg-brand-dark text-brand-gold shadow-md"
                  : "text-brand-dark/70 hover:text-brand-dark"
              }`}
            >
              English (EN)
            </button>
            <button
              onClick={() => setLanguage("fr")}
              type="button"
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                language === "fr"
                  ? "bg-brand-dark text-brand-gold shadow-md"
                  : "text-brand-dark/70 hover:text-brand-dark"
              }`}
            >
              Français (FR)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left panel contact cards */}
          <div className="lg:col-span-5 bg-brand-dark text-brand-sand rounded-3xl p-6 sm:p-8 border border-brand-teal/20 flex flex-col justify-between shadow-xl">
            <div>
              <h3 className="font-serif text-xl font-bold text-white uppercase tracking-wide mb-2">
                Dreamscape Tours HQ
              </h3>
              <p className="text-xs text-brand-sand/70 leading-relaxed max-w-sm mb-8">
                Drop by our Lusaka headquarter office or connect with us directly via mail to plan custom national expeditions.
              </p>

              {/* Contact Icons lists */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-medium flex items-center justify-center border border-brand-teal/25 text-brand-gold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider block text-brand-teal font-bold">
                      Main Territory Office
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-white block mt-0.5">
                      Plot 104, Great East Road, Lusaka, Zambia
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-medium flex items-center justify-center border border-brand-teal/25 text-brand-gold">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider block text-brand-teal font-bold">
                      Electronic Mail
                    </span>
                    <a
                      href="mailto:dreamscapetourszambia@gmail.com"
                      className="font-semibold text-xs sm:text-sm text-white block mt-0.5 hover:text-brand-gold transition-colors"
                    >
                      dreamscapetourszambia@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-medium flex items-center justify-center border border-brand-teal/25 text-brand-gold">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider block text-brand-teal font-bold">
                      Hotline &amp; Telephone
                    </span>
                    <div className="space-y-0.5">
                      <a
                        href="tel:+260975222136"
                        className="font-semibold text-xs sm:text-sm text-white block hover:text-brand-gold transition-colors"
                      >
                        +260 975 222 136
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-medium flex items-center justify-center border border-brand-teal/25 text-brand-gold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider block text-brand-teal font-bold">
                      Operating Hours (CAT)
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-white block mt-0.5">
                      Monday - Friday: 8:00 AM - 6:00 PM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social handles & API redirection links */}
            <div className="pt-8 border-t border-brand-teal/15 mt-8 space-y-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold font-bold block">
                Connect &amp; Follow Raw Expeditions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="https://web.facebook.com/lucidtravelandtourszm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-brand-medium/50 hover:bg-brand-teal text-white border border-brand-teal/20 transition-all group"
                  title="Redirect to Facebook Page"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-brand-dark flex items-center justify-center font-mono font-extrabold text-[10px] text-brand-gold">FB</span>
                    <span className="text-xs font-semibold">Facebook</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-sand/40 group-hover:text-brand-gold transition-colors" />
                </a>

                <a
                  href="mailto:dreamscapetourszambia@gmail.com"
                  className="flex items-center justify-between p-3 rounded-2xl bg-brand-medium/50 hover:bg-brand-teal text-white border border-brand-teal/20 transition-all group"
                  title="Compose Email Redirect"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-brand-dark flex items-center justify-center font-mono font-extrabold text-[10px] text-brand-gold">EM</span>
                    <span className="text-xs font-semibold">Gmail Desk</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-sand/40 group-hover:text-brand-gold transition-colors" />
                </a>
              </div>

              <div className="flex justify-between items-center text-[10px] text-brand-sand/40 pt-2">
                <span>Copyrighted &amp; Bonded</span>
                <div className="flex gap-2">
                  <span className="bg-brand-medium px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">ZTA Certified</span>
                  <span className="bg-brand-medium px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">IATA Appr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel interactive input form */}
          <div className="lg:col-span-7 bg-brand-sand rounded-3xl p-6 sm:p-8 border border-brand-sand-dark flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-dark uppercase tracking-wide mb-1 flex items-center gap-2 flex-wrap">
                Adventure Inquiry Desk
              </h3>
              <p className="text-xs text-brand-dark/55 mb-6">
                Tell us about your expected guests amount, target month, and custom requests. 
              </p>

              {submitted ? (
                <div className="p-8 bg-emerald-100/85 border border-emerald-200 rounded-2xl text-center shadow-inner flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mb-3">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-emerald-900 leading-tight">
                    Inquiry Handed to Advisor!
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-md mt-2">
                    Thank you! Your message has been routed to our lead travel agent <strong>Online Agent Assistant Banji Luyando</strong> (Lusaka, Zambia). We will respond to your coordinates shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-5 px-5 py-1.5 bg-brand-dark text-brand-gold text-xs font-bold uppercase tracking-wider rounded-lg"
                  >
                    Open Desk Again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/70 uppercase mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Charlotte Vance"
                      className="w-full bg-white border border-brand-sand-dark text-xs sm:text-sm rounded-xl p-2.5 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-dark/70 uppercase mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. address@example.com"
                        className="w-full bg-white border border-brand-sand-dark text-xs sm:text-sm rounded-xl p-2.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-dark/70 uppercase mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +260 97..."
                        className="w-full bg-white border border-brand-sand-dark text-xs sm:text-sm rounded-xl p-2.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/70 uppercase mb-1">
                      Detailed message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your custom ideas, dietary queries, preferred activities range, etc..."
                      rows={5}
                      className="w-full bg-white border border-brand-sand-dark text-xs rounded-xl p-2.5 resize-none focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-brand-dark hover:bg-brand-medium text-brand-gold font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="inline-block border-2 border-brand-gold/20 border-t-brand-gold w-4.5 h-4.5 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-brand-gold" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>



      </div>
    </section>
  );
}
