import React, { useState, useEffect, useRef } from "react";
import { X, Headphones, Sparkles, Music, Flame, ExternalLink } from "lucide-react";
import { useScrollSync } from "../hooks/useScrollSync";
import { PLAYLISTS, SpotifyPlaylist } from "../data/playlists";

interface SpotifyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePlaylistId: string;
  setActivePlaylistId: (id: string) => void;
  isMusicActive: boolean;
  setIsMusicActive: (active: boolean) => void;
}

export default function SpotifyDrawer({
  isOpen,
  onClose,
  activePlaylistId,
  setActivePlaylistId,
  isMusicActive,
  setIsMusicActive
}: SpotifyDrawerProps) {
  const currentPlaylist = PLAYLISTS.find((p) => p.id === activePlaylistId) || PLAYLISTS[0];

  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollSync = useScrollSync(isOpen, drawerRef);

  return (
    <div
      id="spotify-drawer-backdrop"
      className={`fixed inset-0 z-50 bg-brand-dark/70 backdrop-blur-sm transition-all duration-300 ${
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
        className={`w-full max-w-lg glass-popup h-full shadow-2xl overflow-y-auto overscroll-contain flex flex-col justify-between border-l border-brand-sand-dark/20 text-brand-dark dark:text-slate-100 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
         }`}
      >
        
        <div>
          {/* Header */}
          <div className="bg-[#0A2540] p-6 text-white flex items-center justify-between border-b border-brand-teal/20">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-brand-teal animate-pulse" />
              <span className="font-serif text-base sm:text-lg font-bold uppercase tracking-wide">
                Live African Vibes
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-brand-medium text-brand-sand transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <h4 className="font-serif text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Music className="w-4 h-4" /> Savanna Soundtracks
              </h4>
              <p className="text-xs text-brand-dark/80 dark:text-slate-350 leading-relaxed font-sans">
                Elevate your travel planning experience with authentic tunes. Select a stream channel below.
              </p>
            </div>

            {/* Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {PLAYLISTS.map((p, index) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePlaylistId(p.id);
                    setIsMusicActive(true);
                  }}
                  className={`py-3 px-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                    activePlaylistId === p.id
                      ? "bg-[#0A2540] border-brand-teal text-white shadow-md shadow-brand-teal/15"
                      : "bg-white/10 dark:bg-black/20 border-brand-sand-dark/40 dark:border-slate-800 text-brand-dark/85 dark:text-slate-300 hover:bg-white/20"
                  }`}
                  style={index === 1 ? { color: "#05071c" } : undefined}
                >
                  <span className="text-lg">{p.emoji}</span>
                  <span 
                    className="truncate w-full text-center"
                    style={index === 1 ? { color: "#946010" } : index === 2 ? { color: "#b38222" } : undefined}
                  >
                    {p.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Description of active playlist */}
            <div className="mb-4 bg-black/5 dark:bg-black/20 p-3 rounded-xl border border-brand-sand-dark/20 dark:border-slate-800 text-center">
              <p className="text-xs italic" style={{ color: "#e08b00" }}>
                &ldquo;{currentPlaylist.description}&rdquo;
              </p>
            </div>

            {/* Embed Spotify Iframe */}
            <div className="relative overflow-hidden rounded-2xl bg-black/40 border border-brand-sand-dark/60 h-[380px] flex items-center justify-center">
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
            </div>

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
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#0A2540] text-center border-t border-brand-teal/20">
          <div className="text-[10px] text-slate-300/80 font-sans leading-normal">
            🎵 Carefully selected dynamically to match the premium vibes of Dreamscape Tours Zambia.
          </div>
        </div>
      </div>
    </div>
  );
}
