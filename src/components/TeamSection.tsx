import { motion } from "motion/react";
import { Mail, MessageSquare, ShieldCheck, Award, Heart } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

export default function TeamSection() {
  const { language, t } = useLanguage();

  const teamMembers = [
    {
      name: "Banji Luyando",
      roleEn: "Founder & Lead Director",
      roleFr: "Fondateur & Directeur Principal",
      image: "/images/Banji Luyando Co Founder & Director.jpeg",
      briefEn: "An avid conservationist and Zambian travel mastermind with 3 years of luxury safari operations experience. Banji founded Dreamscape Tours with a mission to showcase the pristine, untouched beauty of Zambia's wild wonders.",
      briefFr: "Un ardent défenseur de l'environnement et un maître de voyage zambien avec 3 ans d'expérience dans les safaris de luxe. Banji a fondé Dreamscape Tours avec pour mission de faire découvrir la beauté sauvage de la Zambie.",
      email: "luyandobanjilb@gmail.com",
      phone: "+260975222136",
      badgesEn: ["Lead Expeditionist", "Wildlife Conservationist"],
      badgesFr: ["Éclaireur en Chef", "Protecteur de la Faune"]
    },
    {
      name: "Kalila Chella",
      roleEn: "Lead Travel Consultant",
      roleFr: "Consultante en Voyage Principale",
      image: "/images/Kalila Chella.png",
      briefEn: "A passionate and knowledgeable travel specialist with 2 years of experience crafting bespoke journeys, managing guest relations, and highlighting Zambia's magnificent wonders.",
      briefFr: "Une spécialiste du voyage passionnée et compétente avec 2 ans d'expérience dans l'élaboration de voyages sur mesure, la gestion des relations clients et la mise en valeur des merveilles de la Zambie.",
      email: "info@dreamscapetourszm.com",
      phone: "+260571139345",
      badgesEn: ["Itinerary Specialist", "Guest Relations"],
      badgesFr: ["Spécialiste de l'Itinéraire", "Relations Invités"]
    },
    {
      name: "Mizinga Cheelo",
      roleEn: "Tour Operations Manager",
      roleFr: "Directrice des Opérations de Voyage",
      image: "/images/Mizinga Cheelo manager.png",
      briefEn: "A dedicated operations manager with 2 years of experience streamlining complex safari logistics, organizing luxury excursions, and ensuring every client experiences the peak hospitality of Zambia.",
      briefFr: "Une directrice des opérations dévouée avec 2 ans d'expérience dans la rationalisation de la logistique complexe des safaris, l'organisation d'excursions de luxe et la garantie que chaque client bénéficie de l'hospitalité maximale de la Zambie.",
      email: "info@dreamscapetourszm.com",
      phone: "+260973331843",
      badgesEn: ["Operations Expert", "Guest Logistics"],
      badgesFr: ["Experte en Opérations", "Logistique des Invités"]
    }
  ];

  return (
    <section id="team" className="py-24 bg-brand-sand/30 border-t border-brand-sand-dark relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-brand-teal/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-teal font-extrabold block mb-2">
            {language === "fr" ? "L'Âme de Nos Expéditions" : "The Soul of Our Journeys"}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-dark uppercase">
            {t("teamTitle")}
          </h2>
          <div className="h-0.5 w-16 bg-brand-teal mx-auto mt-4 mb-3" />
          <p className="text-brand-dark/75 text-sm sm:text-base leading-relaxed">
            {t("teamSub")}
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="liquid-glass-card group overflow-hidden flex flex-col items-stretch gap-6 border border-brand-sand-dark/60 bg-white/50 p-5 rounded-3xl shadow-xl hover:shadow-2xl hover:bg-white/80 transition-all duration-300"
            >
              {/* Image Frame with Golden Border Aspect */}
              <div className="w-full h-64 rounded-2xl overflow-hidden shrink-0 border-2 border-brand-gold/20 shadow-md relative group-hover:border-brand-gold/50 transition-colors duration-300">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <span className="text-[10px] font-mono font-bold text-brand-gold-light uppercase tracking-wider">
                    {language === "fr" ? "✦ Dreamscape Leaders" : "✦ Dreamscape Leaders"}
                  </span>
                </div>
              </div>

              {/* Bio Details */}
              <div className="flex flex-col justify-between py-1 flex-1">
                <div>
                  <div className="flex items-center gap-1 text-brand-gold mb-1">
                    <Award className="w-4 h-4 shrink-0" />
                    <span className="font-mono text-[9px] uppercase tracking-widest font-black">
                      {language === "fr" ? member.roleFr : member.roleEn}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-extrabold text-brand-dark group-hover:text-brand-teal transition-colors mb-2.5">
                    {member.name}
                  </h3>

                  <p className="text-xs text-brand-dark/80 font-sans leading-relaxed mb-4">
                    {language === "fr" ? member.briefFr : member.briefEn}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {(language === "fr" ? member.badgesFr : member.badgesEn).map((badge) => (
                      <span
                        key={badge}
                        className="text-[9px] font-mono font-semibold px-2 py-0.5 bg-brand-medium/30 text-brand-dark border border-brand-sand-dark/50 rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Action Contacts */}
                <div className="flex items-center gap-2 pt-3 border-t border-brand-sand-dark/40">
                  <a
                    href={`mailto:${member.email}`}
                    className="p-2 bg-slate-100 hover:bg-brand-teal hover:text-white text-brand-dark/80 rounded-xl transition-all cursor-pointer border border-brand-sand-dark/20"
                    title={`Email ${member.name}`}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${member.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white rounded-xl text-xs font-bold font-sans tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-[#25D366]/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Seal Banner */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 py-4 px-6 bg-brand-dark/5 rounded-2xl max-w-3xl mx-auto border border-brand-sand-dark/50 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center border border-brand-teal/20 text-brand-teal shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-brand-dark uppercase tracking-wider">
                {language === "fr" ? "SÉCURITÉ & EXPÉRIENCE CERTIFIÉES" : "CERTIFIED SAFETY & EXPERTISE"}
              </p>
              <p className="text-[10px] text-brand-dark/70 leading-normal">
                {language === "fr" 
                  ? "Nos directeurs sont certifiés par la Zambia Tourism Agency (ZTA) avec une formation avancée en premiers secours."
                  : "Our directors are certified by the Zambia Tourism Agency (ZTA) with advanced Wilderness First Aid credentials."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
