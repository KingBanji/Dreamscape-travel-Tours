import { useState, FormEvent } from "react";
import { Review, Destination } from "../types";
import { MessageSquare, Compass, Send, CheckCircle2, Trash2 } from "lucide-react";
import { useAuthAndData } from "../lib/FirebaseContext";

interface ReviewSectionProps {
  reviews: Review[];
  destinations: Destination[];
  onAddReview: (review: Omit<Review, "id" | "date" | "avatarColor" | "verified">) => void;
}

export default function ReviewSection({ reviews, destinations, onAddReview }: ReviewSectionProps) {
  const { user, deleteReview } = useAuthAndData();
  const [filterDestId, setFilterDestId] = useState("All");
  const [newAuthor, setNewAuthor] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [selectedDestId, setSelectedDestId] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  const filteredReviews = reviews.filter((rev) => {
    if (filterDestId === "All") return true;
    return rev.destinationId === filterDestId;
  });

  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newText.trim() || !newLocation.trim()) {
      return;
    }
    onAddReview({
      authorName: newAuthor,
      authorLocation: newLocation,
      rating: newRating,
      text: newText,
      destinationId: selectedDestId || undefined
    });

    setNewAuthor("");
    setNewLocation("");
    setNewText("");
    setSelectedDestId("");
    setNewRating(5);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 5000);
  };

  return (
    <section id="reviews" className="py-24 bg-white border-t border-brand-sand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Module Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-teal font-extrabold block mb-2">
            Pioneers Shared Stories
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-dark uppercase">
            Traveler Voices
          </h2>
          <div className="h-0.5 w-16 bg-brand-teal mx-auto mt-4 mb-3" />
          <p className="text-brand-dark/70 text-sm sm:text-base">
            Read true letters and responses shared by our global wilderness explorers on recent trails.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Panel: Review Stats & Write Review Board */}
          <div className="lg:col-span-4 space-y-8 liquid-glass-card p-6 sm:p-8 hover:bg-white/60 hover:border-white/50 transition-all duration-300">
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-dark uppercase mb-3">
                Agility Overview
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-brand-dark font-mono">4.9 / 5</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-brand-teal tracking-wide">
                    Excellent Journey Rating
                  </div>
                  <span className="text-xs text-brand-dark/50 block font-mono mt-0.5">
                    184 Verified Log Entries
                  </span>
                </div>
              </div>
            </div>

            {/* Write Review Form */}
            <form onSubmit={handleSubmitReview} className="space-y-4 pt-4 border-t border-brand-sand-dark/80">
              <h4 className="font-serif text-sm font-bold text-brand-dark uppercase tracking-wide">
                Log Your Personal Trail
              </h4>

              {successMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Review logged immediately to local board!</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-brand-dark/70 uppercase mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Charlotte Vance"
                    className="w-full bg-white border border-brand-sand-dark text-xs rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-dark/70 uppercase mb-1">
                    Origin Town/Country
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Munich, Germany"
                    className="w-full bg-white border border-brand-sand-dark text-xs rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/70 uppercase mb-1">
                      Target Area
                    </label>
                    <select
                      value={selectedDestId}
                      onChange={(e) => setSelectedDestId(e.target.value)}
                      className="w-full bg-white border border-brand-sand-dark text-[11px] rounded-lg p-2.5 cursor-pointer focus:outline-none"
                    >
                      <option value="">General Service</option>
                      {destinations.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name.split(" ")[0]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark/70 uppercase mb-1">
                      Trail Rating
                    </label>
                    <select
                      value={newRating}
                      onChange={(e) => setNewRating(Number(e.target.value))}
                      className="w-full bg-white border border-brand-sand-dark text-xs rounded-lg p-2.5 cursor-pointer focus:outline-none"
                    >
                      <option value="5">5 / 5 Rating (Pristine)</option>
                      <option value="4">4 / 5 Rating (Great)</option>
                      <option value="3">3 / 5 Rating (Satisfactory)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-dark/70 uppercase mb-1">
                    Your True Story
                  </label>
                  <textarea
                    required
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Describe guide patience, wildlife frequency, or meal quality..."
                    rows={3}
                    className="w-full bg-white border border-brand-sand-dark text-xs rounded-lg p-2.5 resize-none focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-dark hover:bg-brand-medium text-brand-gold font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-brand-gold" /> Log Review
              </button>
            </form>
          </div>

          {/* Right Panel: Scrollable Review Cards Panel with destination filters */}
          <div className="lg:col-span-8 space-y-10 mt-16">
            <div className="flex justify-between items-center pb-3 border-b border-brand-sand-dark">
              <span className="text-xs font-mono font-bold text-brand-medium">
                Live Log Directory ({filteredReviews.length} Records)
              </span>

              {/* Destination Selector for reviews */}
              <div className="flex items-center gap-1.5 bg-brand-sand p-1 rounded-xl border border-brand-sand-dark text-[10px] sm:text-xs">
                <button
                  onClick={() => setFilterDestId("All")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    filterDestId === "All"
                      ? "bg-brand-dark text-brand-gold"
                      : "text-brand-dark/60 hover:text-brand-dark"
                  }`}
                >
                  All
                </button>
                {destinations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setFilterDestId(d.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all hidden sm:inline-block ${
                      filterDestId === d.id
                        ? "bg-brand-dark text-brand-gold"
                        : "text-brand-dark/60 hover:text-brand-dark"
                    }`}
                  >
                    {d.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {filteredReviews.map((rev) => {
                const canDelete = user && (rev.userId === user.uid || user.email === 'luyandobanjilb@gmail.com');
                return (
                  <div
                    key={rev.id}
                    className="p-5 sm:p-6 liquid-glass-card hover:bg-white/60 hover:border-white/50 hover:shadow-lg transition-all duration-300 relative group/card"
                  >
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to permanently delete this logged trail review?")) {
                            deleteReview(rev.id);
                          }
                        }}
                        className="absolute right-4 top-4 flex items-center justify-center p-1.5 bg-red-50/70 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-all cursor-pointer z-10 opacity-75 hover:opacity-100"
                        title="Remove Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${rev.avatarColor} text-white font-bold flex items-center justify-center text-xs uppercase`}>
                          {rev.authorName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-brand-dark block">
                            {rev.authorName}
                          </span>
                          <span className="text-[10px] text-brand-dark/50 block font-mono">
                            📍 {rev.authorLocation} • {rev.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end sm:pr-8">
                        <div className="text-xs font-mono font-bold text-brand-teal uppercase tracking-wider bg-brand-sand px-2 py-0.5 rounded-md">
                          Rating: {rev.rating} / 5
                        </div>
                        <span className="text-[9px] font-mono text-brand-teal block uppercase mt-0.5">
                          {rev.destinationId
                            ? destinations.find((d) => d.id === rev.destinationId)?.name.split(" (")[0]
                            : "General Service"}
                        </span>
                      </div>
                    </div>

                    <p className="text-brand-dark/75 text-xs sm:text-sm leading-relaxed mt-4 italic font-sans border-l-2 border-brand-teal/10 pl-3">
                      "{rev.text}"
                    </p>

                    {rev.verified && (
                      <span className="absolute bottom-4 right-5 text-[8.5px] font-mono uppercase tracking-widest text-brand-teal font-extrabold flex items-center gap-1 select-none">
                        🔒 Verified Trail Entry
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
