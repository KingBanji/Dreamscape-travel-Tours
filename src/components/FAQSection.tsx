import { useState } from "react";
import { FAQItem } from "../types";
import { HelpCircle, ChevronRight, ChevronDown, Award, MailCheck, ShieldCheck, Footprints } from "lucide-react";

interface FAQSectionProps {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "booking" | "safari" | "general" | "health">("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>("fq-1");

  const categories = [
    { key: "all", label: "All Questions" },
    { key: "safari", label: "Safari & Safety" },
    { key: "booking", label: "Visas & Rescheduling" },
    { key: "health", label: "Vaccines & Health" },
    { key: "general", label: "General Guidelines" }
  ];

  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCategory === "all") return true;
    return faq.category === selectedCategory;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faq" className="py-24 bg-brand-sand/50 border-t border-brand-sand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-teal font-extrabold block mb-2">
            Professional Safety & Logistics
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-dark uppercase">
            Traveler FAQ
          </h2>
          <div className="h-0.5 w-16 bg-brand-teal mx-auto mt-4 mb-3" />
          <p className="text-brand-dark/70 text-sm sm:text-base">
            Understand details regarding guides safety, cancellation refunds, e-Visas, and malaria vaccinations in the Zambian territory.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left panel category tabs */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="liquid-glass-card p-4 hover:bg-white/60 transition-all duration-300">
              <span className="text-[10px] font-mono uppercase text-brand-teal/80 tracking-widest block mb-3 font-bold">
                Categorized Guides
              </span>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key as any)}
                    className={`text-left w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      selectedCategory === cat.key
                        ? "bg-brand-dark text-brand-gold shadow-md"
                        : "text-brand-dark/70 hover:text-brand-dark hover:bg-brand-sand-dark"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedCategory === cat.key ? "rotate-90 text-brand-gold" : "text-brand-dark/40"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency banner card */}
            <div className="bg-brand-medium text-brand-sand p-6 rounded-2xl border border-brand-teal/20 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 bg-brand-teal/20 rounded-full blur-xl" />
              <Footprints className="w-8 h-8 text-brand-gold mx-auto mb-3" />
              <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                Direct Safari Support
              </h4>
              <p className="text-[11px] text-brand-sand/75 leading-relaxed mt-1.5">
                Our adventure advisors are available via WhatsApp or telephone for emergency changes.
              </p>
              <span className="text-xs font-mono font-bold text-brand-gold mt-3 block space-y-1">
                <a href="tel:+260975222136" className="block hover:underline">📞 +260 975 222 136</a>
                <a href="tel:+260977671016" className="block hover:underline">📞 +260 977 671 016</a>
              </span>
            </div>
          </div>

          {/* Right panel FAQ Accordions */}
          <div className="lg:col-span-8 space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="liquid-glass-card hover:bg-white/60 hover:border-white/50 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-brand-sand/30"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-brand-teal flex-shrink-0" />
                      <span className="font-bold text-xs sm:text-base text-brand-dark font-serif">
                        {faq.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-5 h-5 text-brand-gold flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-brand-dark/40 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-8 text-brand-dark/75 text-xs sm:text-sm leading-relaxed border-t border-brand-sand-dark/60 pt-4 bg-brand-sand/20">
                      <p>{faq.answer}</p>
                      
                      {/* Interactive quality stamps inside answer block to look premium */}
                      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-brand-sand-dark/60 text-[10px] font-mono uppercase text-brand-teal font-extrabold select-none">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" /> Verified Policy
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-brand-gold" /> Tourism Excellence
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
