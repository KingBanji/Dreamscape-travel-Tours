export interface SpotifyPlaylist {
  id: string;
  title: string;
  emoji: string;
  playlistId: string;
  description: string;
  color: string;
  accent: string;
}

export const PLAYLISTS: SpotifyPlaylist[] = [
  {
    id: "zambia",
    title: "Zambian Hits",
    emoji: "🇿🇲",
    playlistId: "1yblI7ebgVbsBf67ztoo6H",
    description: "Zambia's deepest local vibes, afro-pop, and kalindula infusions.",
    color: "from-emerald-500 to-teal-600",
    accent: "#10b981"
  },
  {
    id: "afrobeats",
    title: "Afrobeats",
    emoji: "🔥",
    playlistId: "5FDBAbJobJWaKh1RDiqtyn",
    description: "Electric anthems, highlife, and West African club rhythms.",
    color: "from-orange-500 to-amber-600",
    accent: "#f97316"
  },
  {
    id: "amapiano",
    title: "Amapiano Grooves",
    emoji: "🇿🇦",
    playlistId: "4z8jM6c6NLp0H0szju3flc",
    description: "Deep log drums and jazzy house piano chords.",
    color: "from-indigo-500 to-purple-600",
    accent: "#6366f1"
  }
];
