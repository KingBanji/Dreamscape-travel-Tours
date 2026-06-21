import React from "react";
import { Users, Mail, Compass, ArrowUpRight, Shield, Heart } from "lucide-react";
import { motion } from "motion/react";

interface TeamMember {
  name: string;
  role: string;
  avatarInitials: string;
  avatarGradient: string;
  details: string;
  quote: string;
  specialties: string[];
  contactEmail: string;
  experienceYears: number;
  imageUrl?: string;
}

export default function TeamSection() {
  const teamMembers: TeamMember[] = [
    {
      name: "Banji Luyando",
      role: "Co-Founder & Director",
      avatarInitials: "BL",
      avatarGradient: "from-brand-teal via-emerald-600 to-teal-800",
      details: "A native of Zambia, Banji co-founded Dreamscape Tours Zambia with an ambitious vision: to bridge high-concept, sustainable luxury travel with raw, authentic African wilderness. Bringing three years of pioneer-level expertise in directing remote wildlife expeditions, conservation alliances, and eco-safari business, his intimate knowledge of Kafue's waterways and Luangwa's private trails positions him at the vanguard of Zambian tourism.",
      quote: "We don't merely guide you through the wilderness; we partner with local traditional custodians so that you truly connect to the pulse of Africa.",
      specialties: ["Conservation Alliances", "Expedition Management", "Bespoke Itinerary Blueprinting"],
      contactEmail: "luyandobanjilb@gmail.com",
      experienceYears: 3,
      imageUrl: "/images/Banji Luyando Co Founder & Director.jpeg"
    },
    {
      name: "Mirriam Musonda",
      role: "Co-Founder & Director",
      avatarInitials: "MM",
      avatarGradient: "from-brand-gold via-amber-500 to-orange-700",
      details: "Mirriam co-founded Dreamscape Tours to redefine luxury adventure throughout Southern Africa. With three years of specialized expertise in high-end hospitality logistics, luxury lodge syndication, and premium customer experience design, she orchestrates our flawless logistics behind the scenes. Her extensive research into eco-tourism ensures sustainable practices and unparalleled service.",
      quote: "True luxury is the harmony of detailed precision and effortless immersion. We craft the absolute finest travel experiences in Zambia.",
      specialties: ["Lodge & Villa Partnerships", "Eco-Luxury Design", "Vetted Guide Network Operations"],
      contactEmail: "musondamirriam60@gmail.com",
      experienceYears: 3,
      imageUrl: "/images/Mirriam Musonda Co founder & Co Director.png"
    }
  ];

  return (
    <section 
      id="our-team" 
      className="py-24 relative overflow-hidden transition-all duration-300 border-b border-brand-sand-dark/30"
    >
      {/* Decorative ambient subtle background glows to match applet themes */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-teal/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-brand-gold/5 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title Block */}
        <div className="text-center max-w-2xl mx-auto mb-16" id="team-header-block">
          <div className="flex justify-center items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-brand-teal" />
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand-teal dark:text-brand-teal/95 font-bold block">
              Zambian Born // Expertly Guided
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight uppercase leading-tight">
            Meet Our Leadership
          </h2>
          <div className="h-0.5 w-16 bg-brand-gold mx-auto mt-4 mb-3" />
          <p className="text-sm sm:text-base font-sans text-blue-700 dark:text-blue-300 leading-relaxed max-w-lg mx-auto font-medium">
            Our directors unite rich local heritage, decades of combined field-craft, and a committed passion for Zambian conservation.
          </p>
        </div>

        {/* Layout Column/Grid for the Leaders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto" id="team-members-grid">
          {teamMembers.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              id={`team-card-${idx}`}
              className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-brand-sand-dark/30 dark:border-white/10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shadow-lg overflow-hidden hover:border-brand-teal/40 dark:hover:border-brand-teal/30 hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative z-10">
                {/* Upper row: Avatar & Basic Title */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                  {/* Styled Avatar Initials/Image Emblem */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative group-hover:scale-105 transition-transform duration-300 border border-white/10 shadow-inner bg-brand-dark/20 flex items-center justify-center">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${member.avatarGradient} flex items-center justify-center text-white font-serif font-black text-xl tracking-wider`}>
                        {member.avatarInitials}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-brand-dark p-1 rounded-md text-brand-gold scale-90 z-10">
                      {idx === 0 ? <Compass className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 leading-tight">
                      {member.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs font-mono font-bold tracking-widest text-brand-gold uppercase">
                        {member.role}
                      </span>
                      <span className="text-[10px] py-0.5 px-2 font-mono rounded-full bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal dark:text-brand-teal/90 font-extrabold uppercase shrink-0">
                        {member.experienceYears} {member.experienceYears === 1 ? "Year" : "Years"} Field Experience
                      </span>
                    </div>
                  </div>
                </div>

                {/* Director Narrative details */}
                <div className="mb-6">
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100 font-sans font-medium">
                    {member.details}
                  </p>
                </div>

                {/* Interactive Pills of Specialties */}
                <div className="flex flex-wrap gap-2 mb-6" id={`specialties-${idx}`}>
                  {member.specialties.map((spec) => (
                    <span 
                      key={spec} 
                      className="text-[10px] font-bold px-3 py-1 font-sans rounded-full border border-brand-sand-dark text-slate-700 dark:text-slate-200 bg-brand-dark/[0.04] dark:bg-white/[0.04]"
                    >
                      ✦ {spec}
                    </span>
                  ))}
                </div>

                {/* Personal quote in blockquote styling */}
                <div className="relative pl-4 border-l-2 border-brand-gold py-1 mb-8" id={`quote-${idx}`}>
                  <div className="absolute top-0 left-0 translate-x-[-120%] text-2xl font-serif text-brand-gold/40 select-none">“</div>
                  <p className="text-xs sm:text-sm italic text-slate-800 dark:text-slate-200 font-serif leading-relaxed font-medium">
                    {member.quote}
                  </p>
                </div>
              </div>

              {/* Lower dynamic section: Actions & direct details */}
              <div className="pt-5 border-t border-brand-sand-dark/15 dark:border-white/5 flex items-center justify-between mt-auto">
                <a 
                  href={`mailto:${member.contactEmail}`}
                  className="flex items-center gap-2 text-xs font-mono text-brand-teal dark:text-brand-teal/90 hover:text-brand-gold dark:hover:text-brand-gold transition-colors font-bold uppercase tracking-wider"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>Reach Direct</span>
                  <ArrowUpRight className="w-3 h-3 translate-y-[-1px] opacity-60" />
                </a>

                {/* Decorative Small Accent */}
                <div className="flex items-center gap-1 text-[10px] opacity-50 font-mono">
                  <Heart className="w-3 h-3 text-red-500 fill-red-500/20" />
                  <span>Vetted Host</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
