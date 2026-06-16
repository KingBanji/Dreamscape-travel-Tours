import { useState, useEffect } from "react";
import { Music, Headphones, Radio, Sparkles, Volume2, Flame, ExternalLink, Grid, List, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SpotifyPlayerProps {
  currentTheme?: "sand" | "dark";
  activePlaylistId?: string;
  setActivePlaylistId?: (id: string) => void;
}

export default function SpotifyPlayer({ 
  currentTheme,
  activePlaylistId,
  setActivePlaylistId
}: SpotifyPlayerProps) {
  // Master Playlists matching the request precisely (updated for June 2026)
  const genres = [
    {
      id: "zambia",
      title: "Zambian Hits",
      emoji: "🇿🇲",
      playlistId: "1yblI7ebgVbsBf67ztoo6H",
      description: "Top Zambian music hits 2026. Featuring Lusaka's deepest local vibes, afro-pop, and kalindula infusions.",
      color: "from-emerald-500 to-teal-600",
      accent: "#10b981",
      short: "Zambian"
    },
    {
      id: "afrobeats",
      title: "Afrobeats",
      emoji: "🔥",
      playlistId: "5FDBAbJobJWaKh1RDiqtyn",
      description: "Afro100 Best Of Afrobeats 2026. Non-stop electric anthems, highlife, and West African club rhythms.",
      color: "from-orange-500 to-amber-600",
      accent: "#f97316",
      short: "Afrobeats"
    },
    {
      id: "amapiano",
      title: "Amapiano Grooves",
      emoji: "🇿🇦",
      playlistId: "4z8jM6c6NLp0H0szju3flc",
      description: "Deep log drums and jazzy house piano chords originating from South African streets, moving the whole continent.",
      color: "from-indigo-500 to-purple-600",
      accent: "#6366f1",
      short: "Amapiano"
    }
  ];

  const [localActiveTab, setLocalActiveTab] = useState("zambia");
  const activeTab = activePlaylistId !== undefined ? activePlaylistId : localActiveTab;
  const setActiveTab = setActivePlaylistId !== undefined ? setActivePlaylistId : setLocalActiveTab;

  const [viewMode, setViewMode] = useState<"focus" | "grid">("grid");

  // Functional volume & backing ambient sound engine
  const [ambientVolume, setAmbientVolume] = useState<number>(70);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
  const [audioFeedbackMsg, setAudioFeedbackMsg] = useState<string>("");

  useEffect(() => {
    // Cleanup synthesized audio on unmount safely
    return () => {
      try {
        const ctx = (window as any)._dreamscapeAmbientCtx;
        const source = (window as any)._dreamscapeAmbientSource;
        if (source) source.stop();
        if (ctx) ctx.close();
      } catch (err) {}
      (window as any)._dreamscapeAmbientCtx = null;
      (window as any)._dreamscapeAmbientGain = null;
      (window as any)._dreamscapeAmbientSource = null;
    };
  }, []);

  const startWildernessAmbient = (initVol: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        setAudioFeedbackMsg("⚠️ AudioContext is not supported on this device.");
        return;
      }

      // Stop old if running
      stopWildernessAmbient();

      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.gain.value = isMuted ? 0 : initVol / 100;

      // Generate soft loopable savanna forest-wind noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Approximation filter to simulate breeze wind noise
        lastOut = 0.985 * lastOut + white * 0.015;
        data[i] = lastOut * 0.12; 
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // Deep bandpass/lowpass filter simulating wind rumbling through trees
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 320;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      source.start(0);

      // Save global handles safely
      (window as any)._dreamscapeAmbientCtx = ctx;
      (window as any)._dreamscapeAmbientGain = gain;
      (window as any)._dreamscapeAmbientSource = source;

      setIsAmbientPlaying(true);
      setAudioFeedbackMsg("🍃 Calm Savanna Wind audio enabled! Drag the volume slider to adjust.");
    } catch (err) {
      console.warn("User action needed to start synthesizer context:", err);
      setAudioFeedbackMsg("💡 Click again after interacting to enable savanna backing sound.");
    }
  };

  const stopWildernessAmbient = () => {
    try {
      const ctx = (window as any)._dreamscapeAmbientCtx;
      const source = (window as any)._dreamscapeAmbientSource;
      if (source) source.stop();
      if (ctx) ctx.close();
    } catch (err) {}
    (window as any)._dreamscapeAmbientCtx = null;
    (window as any)._dreamscapeAmbientGain = null;
    (window as any)._dreamscapeAmbientSource = null;
    setIsAmbientPlaying(false);
    setAudioFeedbackMsg("");
  };

  const handleVolumeChange = (newVal: number) => {
    setAmbientVolume(newVal);
    if (newVal > 0 && isMuted) {
      setIsMuted(false);
    }

    const gainNode = (window as any)._dreamscapeAmbientGain;
    const ctx = (window as any)._dreamscapeAmbientCtx;
    if (gainNode && ctx) {
      try {
        const targetVol = isMuted ? 0 : newVal / 100;
        gainNode.gain.setValueAtTime(targetVol, ctx.currentTime);
      } catch (e) {}
    }

    if (newVal === 0) {
      setAudioFeedbackMsg("🔇 Ambient soundtrack muted");
    } else {
      setAudioFeedbackMsg(`🔊 Atmosphere level set to ${newVal}%`);
    }
  };

  const toggleMutedState = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    const gainNode = (window as any)._dreamscapeAmbientGain;
    const ctx = (window as any)._dreamscapeAmbientCtx;
    if (gainNode && ctx) {
      try {
        const targetVol = nextMuted ? 0 : ambientVolume / 100;
        gainNode.gain.setValueAtTime(targetVol, ctx.currentTime);
      } catch (e) {}
    }

    setAudioFeedbackMsg(nextMuted ? "🔇 Backing ambiance muted" : `🔊 Ambiance restored to ${ambientVolume}%`);
  };

  const currentGenre = genres.find((g) => g.id === activeTab) || genres[0];
  const spotifyOpenUrl = `https://open.spotify.com/playlist/${currentGenre.playlistId}`;

  return (
    <section id="music-station" className="py-24 relative overflow-hidden transition-all border-b border-brand-sand-dark">
      {/* Immersive background glow elements matching current active genre colors */}
      <div 
        className="absolute top-[20%] left-[5%] w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-1000" 
        style={{ 
          background: viewMode === "focus" 
            ? `${currentGenre.accent}15` 
            : "rgba(45, 212, 191, 0.08)" 
        }} 
      />
      <div 
        className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-1000" 
        style={{ 
          background: viewMode === "focus" 
            ? `${currentGenre.accent}08` 
            : "rgba(14, 165, 233, 0.08)" 
        }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Module Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Radio className="w-5 h-5 text-brand-teal animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-brand-teal font-extrabold block">
              Zambian & African Soundtracks
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-brand-dark uppercase">
            🎵 Local & African Vibes for This Stop
          </h2>
          <div className="h-0.5 w-16 bg-brand-gold mx-auto mt-4 mb-3" />
          <p className="text-brand-dark/70 text-sm sm:text-base font-sans">
            Stream authentic Zambian hits, heat up with electric Afrobeats, or feel the heavy log drums of Amapiano direct from our deep blue immersive dashboard.
          </p>
          
          {/* Quick interactive Toggle Controls */}
          <div className="inline-flex items-center gap-1 bg-brand-dark/10 dark:bg-white/5 border border-brand-sand-dark/60 rounded-xl p-1.5 mt-8">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#0A2540] text-white shadow"
                  : "text-brand-dark/70 dark:text-slate-300 hover:bg-brand-dark/5"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              All Tracks Grid
            </button>
            <button
              onClick={() => setViewMode("focus")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "focus"
                  ? "bg-[#0A2540] text-white shadow"
                  : "text-brand-dark/70 dark:text-slate-300 hover:bg-brand-dark/5"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Single Focus Player
            </button>
          </div>
        </div>

        {/* ================= VIEW MODE: GRID (3 Players side-by-side) ================= */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div 
              key="grid-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            >
              {genres.map((g) => (
                <div 
                  key={g.id}
                  className="bg-[#0A2540] border border-brand-teal/20 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-[#0a2540]/30 hover:-translate-y-1"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{g.emoji}</span>
                        <div>
                          <h3 className="text-base font-bold text-white uppercase tracking-tight font-serif">
                            {g.title}
                          </h3>
                          <span className="text-[9px] font-mono text-slate-400 block uppercase">
                            Authentic Sound
                          </span>
                        </div>
                      </div>
                      <a
                        href={`https://open.spotify.com/playlist/${g.playlistId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-black text-[10px] font-bold rounded-full flex items-center gap-1 transition-all"
                      >
                        Spotify <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                      {g.description}
                    </p>
                  </div>

                  {/* Explicit custom Spotify Embedded frame */}
                  <div className="relative overflow-hidden rounded-xl bg-black/40 border border-brand-sand-dark/60 h-[380px] flex items-center justify-center">
                    <iframe
                      style={{ borderRadius: "12px", width: "100%" }}
                      src={`https://open.spotify.com/embed/playlist/${g.playlistId}?utm_source=generator`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            /* ================= VIEW MODE: FOCUS (Big Interactive Player + Left Controls) ================= */
            <motion.div 
              key="focus-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto"
            >
              
              {/* Left Panel: Station Controls & Curated playlists */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                <div className="p-6 flex flex-col justify-between h-full bg-[#0A2540] border border-brand-teal/20 rounded-3xl shadow-xl">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Headphones className="w-5 h-5 text-brand-gold" />
                        <span className="font-mono text-xs uppercase tracking-wider text-brand-gold font-bold">
                          African Rhythms
                        </span>
                      </div>
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-teal"></span>
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white uppercase mb-1 tracking-tight">
                      {currentGenre.emoji} {currentGenre.title}
                    </h3>
                    <p className="text-xs text-brand-teal font-mono inline-block mb-4 bg-brand-teal/5 border border-brand-teal/25 px-2.5 py-1 rounded-lg">
                      ⚡ Playback Selected
                    </p>

                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                      {currentGenre.description}
                    </p>

                    {/* Highly visible selection buttons strictly aligned with Spotify standards */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                        Select Soundtrack Channel:
                      </span>
                      
                      <div className="flex flex-col gap-2">
                        {genres.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => setActiveTab(g.id)}
                            className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                              activeTab === g.id
                                ? "bg-gradient-to-r from-brand-teal/30 to-brand-gold/15 border-brand-teal text-white shadow-md shadow-brand-teal/10"
                                : "bg-white/5 border-brand-sand-dark/40 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-base">{g.emoji}</span>
                              {g.title}
                            </span>
                            {activeTab === g.id && (
                              <Flame className="w-3.5 h-3.5 text-brand-teal shrink-0 animate-bounce" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Highly visible, styled Spotify Button */}
                  <div className="mt-8 pt-6 border-t border-brand-sand-dark/30 flex flex-col gap-4.5">
                    <a
                      href={spotifyOpenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 text-black font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1DB954]/25"
                    >
                      <Music className="w-4 h-4" />
                      Open Playlist In Spotify
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center text-center">
                      <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
                      <span>Enjoy Zambian hits live through standard Spotify streaming!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Primary Spotify Iframe Focus Widget */}
              <div className="lg:col-span-7">
                <div className="bg-[#0A2540] border border-brand-teal/20 rounded-3xl p-4 sm:p-6 shadow-2xl h-full flex flex-col justify-between">
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                        <Music className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <span id="city-name" className="text-sm font-bold text-white uppercase tracking-wider font-serif">
                          {currentGenre.emoji} {currentGenre.title} Feed
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          Official Spotify Embed Integration
                        </span>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-emerald-500/10 rounded-full text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                      Sync Live
                    </div>
                  </div>

                  {/* Responsive Spotify Frame wrapper with layout fallback */}
                  <div className="relative overflow-hidden rounded-2xl bg-black/40 border border-brand-sand-dark/60 h-[400px] flex items-center justify-center">
                    <iframe
                      key={currentGenre.playlistId}
                      style={{ borderRadius: "12px", width: "100%" }}
                      src={`https://open.spotify.com/embed/playlist/${currentGenre.playlistId}?utm_source=generator`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="w-full h-full"
                    />
                  </div>

                  <div className="text-center mt-3 text-[10px] text-slate-400/80 bg-brand-medium/40 py-2.5 px-3 rounded-full flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                    <span>Selected dynamically for authentic, local safari atmospheres!</span>
                  </div>

                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
