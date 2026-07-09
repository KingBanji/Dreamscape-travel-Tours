import React, { useState, useEffect, useRef } from "react";
import { X, Headphones, Sparkles, Music, Flame, ExternalLink, Volume2, VolumeX, Sliders, Activity, Info, Zap, RefreshCw, Sun, Droplets, Rainbow, Wind } from "lucide-react";
import { useScrollSync } from "../hooks/useScrollSync";
import { PLAYLISTS, SpotifyPlaylist } from "../data/playlists";
import { motion, AnimatePresence } from "motion/react";

interface SpotifyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePlaylistId: string;
  setActivePlaylistId: (id: string) => void;
  isMusicActive: boolean;
  setIsMusicActive: (active: boolean) => void;
}

type VisualizerTheme = "sunset" | "zambezi" | "mist";
type MotionSpeed = "relax" | "vibrant" | "wild";

export default function SpotifyDrawer({
  isOpen,
  onClose,
  activePlaylistId,
  setActivePlaylistId,
  isMusicActive,
  setIsMusicActive
}: SpotifyDrawerProps) {
  const currentPlaylist = PLAYLISTS.find((p) => p.id === activePlaylistId) || PLAYLISTS[0];
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"player" | "visualizer">("player");
  const [visualizerTheme, setVisualizerTheme] = useState<VisualizerTheme>("sunset");
  const [motionSpeed, setMotionSpeed] = useState<MotionSpeed>("vibrant");
  const [barHeights, setBarHeights] = useState<number[]>(new Array(36).fill(6));

  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollSync = useScrollSync(isOpen, drawerRef);

  // High-performance real-time audio spectrum animation using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;
    
    // Control refresh rate based on speed preferences
    const getInterval = () => {
      if (motionSpeed === "relax") return 90;
      if (motionSpeed === "wild") return 35;
      return 60; // vibrant default
    };

    const updateBars = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(updateBars);

      const interval = getInterval();
      if (timestamp - lastTime < interval) return;
      lastTime = timestamp;

      setBarHeights((prev) =>
        prev.map((currentHeight, idx) => {
          if (!isMusicActive) {
            // Gentle ambient breathing wave when inactive
            const wave = Math.sin(timestamp / 500 + idx * 0.25) * 5 + 8;
            return Math.max(4, wave);
          }

          // Generate soundwave spectrum bands (Bass -> Mid -> Treble)
          let minHeight = 12;
          let maxHeight = 90;
          let responsiveness = 0.5;

          // Bass Range (Left 25% of bars)
          if (idx < 9) {
            minHeight = 35;
            maxHeight = 100;
            responsiveness = motionSpeed === "wild" ? 0.65 : motionSpeed === "relax" ? 0.35 : 0.5;
          }
          // Mid Range (Middle 50% of bars)
          else if (idx < 27) {
            minHeight = 20;
            maxHeight = 80;
            responsiveness = motionSpeed === "wild" ? 0.6 : motionSpeed === "relax" ? 0.3 : 0.45;
          }
          // Treble Range (Right 25% of bars)
          else {
            minHeight = 10;
            maxHeight = 50;
            responsiveness = motionSpeed === "wild" ? 0.55 : motionSpeed === "relax" ? 0.25 : 0.4;
          }

          // Calculate random destination and smooth using linear interpolation (LERP)
          const target = minHeight + Math.random() * (maxHeight - minHeight);
          const smoothed = currentHeight + (target - currentHeight) * responsiveness;
          return Math.max(4, Math.min(100, smoothed));
        })
      );
    };

    animationFrameId = requestAnimationFrame(updateBars);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMusicActive, motionSpeed]);

  // Calculate simulated sound level (average height) for beat pulsing
  const averageHeight = barHeights.reduce((sum, h) => sum + h, 0) / barHeights.length;
  const pulseScale = 1 + (averageHeight / 100) * 0.12;

  // Theme gradient mapping
  const getThemeGradient = (theme: VisualizerTheme) => {
    switch (theme) {
      case "zambezi":
        return "from-[#00A896] via-brand-teal to-sky-400";
      case "mist":
        return "from-violet-500 via-fuchsia-500 to-pink-400";
      case "sunset":
      default:
        return "from-orange-500 via-amber-500 to-yellow-400";
    }
  };

  const getThemeShadow = (theme: VisualizerTheme) => {
    switch (theme) {
      case "zambezi":
        return "shadow-[0_0_20px_rgba(0,168,150,0.3)] border-brand-teal/30";
      case "mist":
        return "shadow-[0_0_20px_rgba(139,92,246,0.3)] border-violet-500/30";
      case "sunset":
      default:
        return "shadow-[0_0_20px_rgba(249,115,22,0.3)] border-[#f97316]/30";
    }
  };

  return (
    <div
      id="spotify-drawer-backdrop"
      className={`fixed inset-0 z-50 bg-brand-dark/75 backdrop-blur-sm transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      } flex justify-end`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={drawerRef}
        onMouseEnter={scrollSync.handleMouseEnter}
        onMouseLeave={scrollSync.handleMouseLeave}
        onTouchStart={scrollSync.handleTouchStart}
        onTouchEnd={scrollSync.handleTouchEnd}
        onTouchCancel={scrollSync.handleTouchCancel}
        className={`w-full max-w-lg glassmorphism-drawer h-full shadow-2xl overflow-y-auto overscroll-contain flex flex-col justify-between border-l border-white/20 text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          {/* Header */}
          <div className="bg-[#0A2540]/40 backdrop-blur-md p-6 text-white flex items-center justify-between border-b border-white/15">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-brand-teal animate-pulse" />
              <span className="font-serif text-base sm:text-lg font-bold uppercase tracking-wide">
                Live African Vibes
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              aria-label="Close live African music portal"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Dual Segmented Tabs (Player & Channels vs Immersive Visualizer) */}
          <div className="px-6 pt-5">
            <div className="flex p-1 bg-black/45 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab("player")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "player"
                    ? "bg-brand-teal text-white shadow-md shadow-brand-teal/20"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Player Feed</span>
              </button>
              <button
                onClick={() => setActiveTab("visualizer")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden ${
                  activeTab === "visualizer"
                    ? "bg-brand-teal text-white shadow-md shadow-brand-teal/20"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Visualizer Studio</span>
                {isMusicActive && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#f97316] animate-ping" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content Areas */}
          <AnimatePresence mode="wait">
            {activeTab === "player" ? (
              <motion.div
                key="player-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <div className="mb-6 p-4 bg-emerald-500/15 border border-emerald-500/25 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-[#1DB954]" /> Savanna Soundtracks
                    </h4>
                    <p className="text-xs text-white/90 leading-relaxed font-sans">
                      Elevate your travel planning experience with authentic tunes. Select a stream channel below.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const nextMuted = !isMuted;
                      setIsMuted(nextMuted);
                      if (nextMuted) {
                        setIsMusicActive(false);
                      } else {
                        setIsMusicActive(true);
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0 ${
                      isMuted
                        ? "bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                        : "bg-white/10 border-white/15 text-emerald-300 hover:bg-white/20"
                    }`}
                    title={isMuted ? "Unmute Ambient Stream" : "Mute Ambient Stream"}
                    aria-label={isMuted ? "Unmute Ambient Stream" : "Mute Ambient Stream"}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 animate-bounce" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Selector Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {PLAYLISTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePlaylistId(p.id);
                        setIsMusicActive(true);
                        setIsMuted(false);
                      }}
                      className={`py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                        activePlaylistId === p.id
                          ? "bg-brand-teal border-brand-teal text-white shadow-md shadow-brand-teal/25"
                          : "bg-white/10 border-white/15 text-white/90 hover:bg-white/20"
                      }`}
                      aria-label={`Select active music playlist: ${p.title}`}
                    >
                      <span className="text-lg">{p.emoji}</span>
                      <span className="truncate w-full text-center">
                        {p.title}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Description of active playlist */}
                <div className="mb-4 bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-xs italic text-brand-gold">
                    &ldquo;{currentPlaylist.description}&rdquo;
                  </p>
                </div>

                {/* Embed Spotify Iframe */}
                <div className="relative overflow-hidden rounded-2xl bg-black/40 border border-white/15 h-[320px] flex items-center justify-center">
                  {isMuted ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 bg-black/30 backdrop-blur-md h-full w-full">
                      <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-4 text-red-400">
                        <VolumeX className="w-10 h-10 animate-pulse" />
                      </div>
                      <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider mb-2">
                        Audio Stream Muted
                      </h4>
                      <p className="text-xs text-white/70 max-w-[280px] leading-relaxed mb-5">
                        We've temporarily stopped the streaming player to maintain silence during your experience.
                      </p>
                      <button
                        onClick={() => {
                          setIsMuted(false);
                          setIsMusicActive(true);
                        }}
                        className="px-5 py-2.5 bg-brand-teal hover:bg-brand-teal/95 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:scale-[1.03] active:scale-[0.97]"
                      >
                        Unmute Soundscapes
                      </button>
                    </div>
                  ) : (
                    <iframe
                      key={currentPlaylist.playlistId}
                      style={{ borderRadius: "12px", width: "100%" }}
                      src={`https://open.spotify.com/embed/playlist/${currentPlaylist.playlistId}?utm_source=generator&theme=0`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="w-full h-full"
                    />
                  )}
                </div>

                {/* Mini Equalizer Indicator */}
                {isMusicActive && !isMuted && (
                  <div 
                    onClick={() => setActiveTab("visualizer")}
                    className="mt-4 p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group"
                    title="Click to view full immersive visualizer mode"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex gap-1 h-6 items-end shrink-0 px-1">
                        {barHeights.slice(0, 10).map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${Math.max(15, h * 0.7)}%` }}
                            className="w-1 bg-gradient-to-t from-emerald-500 to-brand-teal rounded-full transition-all duration-100"
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-300">
                        Equalizer Active &middot; Tap to go immersive
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#f97316]/20 border border-[#f97316]/30 text-[#f97316] font-mono font-bold uppercase tracking-wider group-hover:bg-[#f97316]/30 transition-all">
                      Live
                    </span>
                  </div>
                )}

                <a
                  href={`https://open.spotify.com/playlist/${currentPlaylist.playlistId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 w-full bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 text-black font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Music className="w-4 h-4" />
                  Open Playlist In Spotify
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            ) : (
              <motion.div
                key="visualizer-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6 flex flex-col gap-6"
              >
                {/* Visualizer Panel Container */}
                <div className={`relative rounded-3xl bg-black/60 border ${getThemeShadow(visualizerTheme)} p-6 flex flex-col justify-between overflow-hidden h-[340px] transition-all duration-500`}>
                  
                  {/* Subtle pulsing background ambiance circle */}
                  <div 
                    style={{ transform: `scale(${pulseScale})` }}
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br ${getThemeGradient(visualizerTheme)} opacity-[0.06] blur-2xl transition-transform duration-100 ease-out pointer-events-none`}
                  />

                  {/* Top Bar inside panel */}
                  <div className="flex justify-between items-start z-10">
                    <div className="flex flex-col">
                      <span className="text-white/40 text-[9px] font-mono uppercase tracking-[0.2em]">
                        Active Soundtrack
                      </span>
                      <span className="text-white font-serif text-sm font-bold truncate max-w-[200px]">
                        {currentPlaylist.emoji} {currentPlaylist.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isMusicActive ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                        {isMusicActive ? "Streaming" : "Standby"}
                      </span>
                    </div>
                  </div>

                  {/* Main Equalizer Bars Canvas */}
                  <div className="relative h-44 flex items-end justify-between gap-[3px] z-10 px-2 mt-4 select-none">
                    {barHeights.map((h, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${h}%` }}
                        className={`w-full bg-gradient-to-t ${getThemeGradient(visualizerTheme)} rounded-full transition-all duration-100 ease-in-out`}
                      />
                    ))}
                  </div>

                  {/* Bottom info banner inside panel */}
                  <div className="mt-4 flex items-center justify-between text-[11px] text-white/50 border-t border-white/5 pt-3 z-10 font-mono">
                    <span>Freq: 24Hz - 22kHz</span>
                    <span className="animate-pulse text-[#f97316]">
                      {isMusicActive ? "SPECTRUM ACTIVE" : "PLAY SOUND TO AWAKEN"}
                    </span>
                  </div>
                </div>

                {/* Theme Customizer Panel */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
                  <h4 className="text-xs font-mono uppercase tracking-[0.15em] text-white/60 mb-3 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-brand-teal" /> Visualizer Aura
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setVisualizerTheme("sunset")}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        visualizerTheme === "sunset"
                          ? "bg-orange-500/25 border-orange-500/50 text-white"
                          : "bg-black/25 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <Sun className="w-4 h-4 text-orange-400" />
                      <span>Sunset Glow</span>
                    </button>
                    <button
                      onClick={() => setVisualizerTheme("zambezi")}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        visualizerTheme === "zambezi"
                          ? "bg-brand-teal/25 border-brand-teal/50 text-white"
                          : "bg-black/25 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <Droplets className="w-4 h-4 text-brand-teal" />
                      <span>Zambezi Deep</span>
                    </button>
                    <button
                      onClick={() => setVisualizerTheme("mist")}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        visualizerTheme === "mist"
                          ? "bg-violet-500/25 border-violet-500/50 text-white"
                          : "bg-black/25 border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <Rainbow className="w-4 h-4 text-violet-400" />
                      <span>Victoria Mist</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-white/40 italic font-sans mt-2.5 text-center">
                    {visualizerTheme === "sunset" && "🌅 Warm, grounding tones of the Zambian savanna at dusk."}
                    {visualizerTheme === "zambezi" && "🌊 Cooling teals and blues inspired by flowing river channels."}
                    {visualizerTheme === "mist" && "🌈 Vibrant purples and pinks reflecting light in the waterfall mist."}
                  </p>
                </div>

                {/* Physics & Movement dynamics */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
                  <h4 className="text-xs font-mono uppercase tracking-[0.15em] text-white/60 mb-3 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-brand-gold" /> Movement Tempo
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setMotionSpeed("relax")}
                      className={`py-2 px-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        motionSpeed === "relax"
                          ? "bg-brand-teal/25 border-brand-teal/40 text-brand-teal"
                          : "bg-black/20 border-white/5 text-white/50 hover:text-white"
                      }`}
                    >
                      <Wind className="w-3.5 h-3.5" />
                      <span>Chill</span>
                    </button>
                    <button
                      onClick={() => setMotionSpeed("vibrant")}
                      className={`py-2 px-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        motionSpeed === "vibrant"
                          ? "bg-brand-gold/25 border-brand-gold/40 text-brand-gold"
                          : "bg-black/20 border-white/5 text-white/50 hover:text-white"
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Rhythm</span>
                    </button>
                    <button
                      onClick={() => setMotionSpeed("wild")}
                      className={`py-2 px-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        motionSpeed === "wild"
                          ? "bg-red-500/25 border-red-500/40 text-red-400 animate-pulse"
                          : "bg-black/20 border-white/5 text-white/50 hover:text-white"
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Wild</span>
                    </button>
                  </div>
                </div>

                {/* Helpful Guide / Notice banner */}
                <div className="p-3.5 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex items-start gap-3 text-left">
                  <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider">
                      Immersive Synergy Guide
                    </span>
                    <span className="text-[10px] text-white/80 leading-relaxed mt-0.5">
                      Ensure you start the music player in the <strong>Player Feed</strong> tab. Once active, the spectrum here dances in sync with savanna frequencies.
                    </span>
                  </div>
                </div>

                {/* Back to player button */}
                <button
                  onClick={() => setActiveTab("player")}
                  className="w-full py-3 bg-white/10 hover:bg-white/15 active:scale-95 border border-white/10 text-white rounded-xl text-xs font-mono uppercase tracking-widest transition-all cursor-pointer text-center"
                >
                  Configure Audio Channels
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#0A2540]/45 backdrop-blur-md text-center border-t border-white/15">
          <div className="text-[10px] text-white/80 font-sans leading-normal">
            🎵 Carefully selected dynamically to match the premium vibes of Dreamscape Tours Zambia.
          </div>
        </div>
      </div>
    </div>
  );
}
