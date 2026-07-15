import React, { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Film, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function PromotionalVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => console.log("Video play error:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 0;
      setProgress(total > 0 ? (current / total) * 100 : 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current && duration > 0) {
      const seekValue = parseFloat(e.target.value);
      videoRef.current.currentTime = (seekValue / 100) * duration;
      setProgress(seekValue);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 w-full relative z-25">
      <div className="space-y-6">
        {/* Title / Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-teal/15 pb-4">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-brand-teal uppercase font-extrabold block">
              Zambia Travel Showcase
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
              Experience <span className="text-brand-gold">Dreamscape in Motion</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-brand-sand/60 max-w-md font-medium leading-relaxed font-sans">
            A visual preview of the breathtaking landscapes, luxury accommodations, and wild safaris awaiting you on our custom itineraries.
          </p>
        </div>

        {/* Video Cinema Card */}
        <div className="relative group rounded-3xl overflow-hidden bg-black/90 border border-brand-teal/20 shadow-2xl shadow-brand-teal/5">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-brand-teal/5 filter blur-3xl pointer-events-none" />

          {/* Video element */}
          <video
            ref={videoRef}
            src="/videos/Pink And White Modern Lifestyle Tik Tok Video.mp4"
            className="w-full aspect-[16/9] object-contain cursor-pointer"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={handlePlayPause}
            playsInline
          />

          {/* Central play overlay (only when paused) */}
          {!isPlaying && (
            <div
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px] transition-all duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-gold hover:bg-yellow-400 text-brand-dark flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95">
                <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-brand-dark ml-1 text-brand-dark" />
              </div>
            </div>
          )}

          {/* Bottom control bar (shows on hover / active) */}
          <div className="absolute bottom-0 left-0 w-full p-3 sm:p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent border-t border-white/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 space-y-3 font-mono">
            {/* Timeline Progress Bar */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/20 accent-brand-gold focus:outline-none"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="p-1.5 text-white hover:text-brand-gold transition-colors cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white text-white" /> : <Play className="w-4 h-4 fill-white text-white" />}
                </button>

                <button
                  type="button"
                  onClick={handleMuteToggle}
                  className="p-1.5 text-white hover:text-brand-gold transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] text-brand-sand/60">
                  <Film className="w-3 h-3 text-brand-gold" />
                  <span>PREVIEW CLIP</span>
                </div>

                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="p-1.5 text-white hover:text-brand-gold transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  <Maximize className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
