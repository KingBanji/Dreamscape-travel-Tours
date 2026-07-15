import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Share2, Compass, Sparkles, Film, Heart, MessageSquare } from "lucide-react";
import { motion } from "motion/react";

interface VideosPageProps {
  onBackToMain: () => void;
  theme: "sand" | "dark";
}

export default function VideosPage({ onBackToMain, theme }: VideosPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [likesCount, setLikesCount] = useState(() => {
    const saved = localStorage.getItem("dreamscape_video_likes");
    return saved ? parseInt(saved, 10) : 124;
  });
  const [hasLiked, setHasLiked] = useState(() => {
    return localStorage.getItem("dreamscape_video_has_liked") === "true";
  });
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ id: string; author: string; text: string; time: string }[]>(() => {
    const saved = localStorage.getItem("dreamscape_video_comments");
    return saved ? JSON.parse(saved) : [
      { id: "1", author: "Mwansa K.", text: "This tour looks absolutely magical! Can't wait to book my next safari.", time: "2 hours ago" },
      { id: "2", author: "Sarah M.", text: "The editing is pristine. Zambia is beautiful! 🇿🇲", time: "1 day ago" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("dreamscape_video_likes", likesCount.toString());
    localStorage.setItem("dreamscape_video_has_liked", hasLiked.toString());
  }, [likesCount, hasLiked]);

  useEffect(() => {
    localStorage.setItem("dreamscape_video_comments", JSON.stringify(comments));
  }, [comments]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.log("Video playback error", err));
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
      setCurrentTime(current);
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
      const newTime = (seekValue / 100) * duration;
      videoRef.current.currentTime = newTime;
      setProgress(seekValue);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => console.log("Video play error", err));
      setIsPlaying(true);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      author: "Explorer Desk",
      text: commentText.trim(),
      time: "Just now"
    };
    setComments([newComment, ...comments]);
    setCommentText("");
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className={`min-h-screen py-24 px-4 sm:px-6 lg:px-8 font-sans ${theme === "dark" ? "bg-[#081225] text-slate-100" : "bg-[#fcfaf4] text-slate-800"}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top bar with back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToMain}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand-teal hover:text-brand-gold transition-colors font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dreamscape Home
          </button>
          
          <div className="flex items-center gap-1.5 text-xs font-mono tracking-widest text-brand-gold-light bg-brand-dark/20 px-3 py-1.5 rounded-full border border-brand-teal/10">
            <Film className="w-3.5 h-3.5 animate-pulse" />
            <span>EXCELLENCE IN MOTION</span>
          </div>
        </div>

        {/* Header Title Section */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono tracking-[0.25em] text-brand-teal uppercase font-extrabold block">
            Visual Expeditions & Memories
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            Dreamscape <span className="text-brand-gold">Vlogs & Promos</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-brand-sand/60 font-medium leading-relaxed">
            Immerse yourself in spectacular Zambian landscapes, luxury safaris, and traditional ceremonies. Real moments captured by our explorers on tour.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Video Cinema Card (Left 8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative group rounded-3xl overflow-hidden bg-black/85 border border-brand-teal/20 shadow-2xl shadow-brand-teal/5">
              
              {/* Subtle ambient blur behind video */}
              <div className="absolute inset-0 bg-brand-teal/5 filter blur-3xl pointer-events-none -z-10" />

              {/* HTML5 Video Player */}
              <video
                ref={videoRef}
                src="/videos/Pink And White Modern Lifestyle Tik Tok Video.mp4"
                className="w-full aspect-[16/9] object-contain cursor-pointer"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={handlePlayPause}
                playsInline
              />

              {/* Overlay Play Indicator when paused */}
              {!isPlaying && (
                <div 
                  onClick={handlePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300 cursor-pointer"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-gold hover:bg-yellow-400 text-brand-dark flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95">
                    <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-brand-dark ml-1" />
                  </div>
                </div>
              )}

              {/* Custom Controller Bar */}
              <div className="absolute bottom-0 left-0 w-full p-3 sm:p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent border-t border-white/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 space-y-3 font-mono">
                
                {/* Timeline slider */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-brand-sand/70 min-w-[35px]">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/20 accent-brand-gold focus:outline-none"
                  />
                  <span className="text-[10px] text-brand-sand/70 min-w-[35px]">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Control Buttons row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      onClick={handlePlayPause}
                      className="p-1.5 text-white hover:text-brand-gold transition-colors cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                    </button>

                    <button
                      onClick={handleRestart}
                      className="p-1.5 text-white hover:text-brand-gold transition-colors cursor-pointer"
                      title="Restart Video"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleMuteToggle}
                        className="p-1.5 text-white hover:text-brand-gold transition-colors cursor-pointer"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleFullscreen}
                      className="p-1.5 text-white hover:text-brand-gold transition-colors cursor-pointer"
                      title="Fullscreen"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video description, title & stats */}
            <div className="bg-[#030712]/40 border border-brand-teal/10 p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h2 className="font-serif text-lg sm:text-2xl font-bold text-white uppercase tracking-wide">
                    Pink and White Modern Lifestyle - Zambia Promo
                  </h2>
                  <p className="text-[10px] font-mono text-brand-teal mt-0.5">
                    FEATURED OFFICIAL MEMORIES // 4K HIGH DEFINITION
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-xs font-mono font-bold cursor-pointer ${
                      hasLiked
                        ? "bg-rose-500/10 border-rose-500/35 text-rose-400"
                        : "bg-white/5 border-white/10 text-brand-sand hover:border-brand-gold/40 hover:text-brand-gold"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{likesCount} LIKES</span>
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "Dreamscape Tours - Zambia Video Promo",
                          url: window.location.href
                        }).catch(err => console.log(err));
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                      }
                    }}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-brand-sand hover:text-brand-gold hover:border-brand-gold/40 transition-all cursor-pointer"
                    title="Share Link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-brand-sand/70 font-sans">
                <p>
                  Experience the vibrant heartbeat of Zambia. This luxury promo captures the pristine harmony of modern, beautiful stays combined with unfiltered safari wildlands, high-quality aesthetics, and authentic Zambian travel elegance.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[10px] font-mono bg-brand-teal/10 border border-brand-teal/20 text-brand-teal px-2 py-0.5 rounded-md font-bold">#ZambiaPromo</span>
                  <span className="text-[10px] font-mono bg-brand-teal/10 border border-brand-teal/20 text-brand-teal px-2 py-0.5 rounded-md font-bold">#LuxuryTravel</span>
                  <span className="text-[10px] font-mono bg-brand-teal/10 border border-brand-teal/20 text-brand-teal px-2 py-0.5 rounded-md font-bold">#SafariVibes</span>
                  <span className="text-[10px] font-mono bg-brand-teal/10 border border-brand-teal/20 text-brand-teal px-2 py-0.5 rounded-md font-bold">#DreamscapeExperience</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat & Interactivity sidebar (Right 4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* CTA Book Now widget */}
            <div className="bg-gradient-to-br from-brand-teal/15 to-brand-gold/5 border border-brand-teal/25 p-6 rounded-3xl space-y-4 shadow-xl">
              <span className="text-[9px] font-mono text-brand-gold font-extrabold tracking-widest block uppercase">
                ✦ LIVE ADVENTURES PENDING ✦
              </span>
              <h3 className="font-serif text-xl font-black text-white leading-tight">
                LOVE WHAT YOU SEE? SECURE YOUR SPOT
              </h3>
              <p className="text-[11px] text-brand-sand/70 leading-relaxed font-sans">
                Book a custom tailored luxury itinerary or safari package instantly. Flexible installments via mobile money, bank transfers or cards supported.
              </p>
              <button
                onClick={onBackToMain}
                className="w-full py-3 bg-brand-gold hover:bg-yellow-500 text-brand-dark rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-lg shadow-brand-gold/10 hover:shadow-brand-gold/25"
              >
                Plan Custom Itinerary
              </button>
            </div>

            {/* Comments / Interactive Desk */}
            <div className="bg-[#030712]/40 border border-brand-teal/10 p-6 rounded-3xl space-y-4">
              <h4 className="font-serif text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-gold" />
                Explorer Feed ({comments.length})
              </h4>

              {/* Comment submission */}
              <form onSubmit={handleAddComment} className="space-y-2">
                <input
                  type="text"
                  placeholder="Share your thoughts about this clip..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-brand-dark border border-white/10 focus:border-brand-teal/50 rounded-xl py-2 px-3 text-xs outline-none text-white placeholder:text-brand-sand/30 font-sans"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-3 py-1.5 bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal border border-brand-teal/35 rounded-lg font-mono text-[10px] uppercase font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Post Comment
                  </button>
                </div>
              </form>

              {/* Comments list */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-[#030712]/30 border border-white/5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-brand-teal">{comment.author}</span>
                      <span className="text-brand-sand/40">{comment.time}</span>
                    </div>
                    <p className="text-[11px] text-brand-sand/80 font-sans leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Behind the scenes metadata */}
            <div className="bg-brand-dark/30 border border-white/5 p-4 rounded-2xl space-y-2 text-[10px] font-mono text-brand-sand/55">
              <div className="flex justify-between">
                <span>FILE RESOLUTION:</span>
                <span className="text-brand-gold">1080 x 1920 (Vertical)</span>
              </div>
              <div className="flex justify-between">
                <span>FORMAT:</span>
                <span className="text-brand-gold">MPEG-4 AVC</span>
              </div>
              <div className="flex justify-between">
                <span>BITRATE:</span>
                <span className="text-brand-gold">Dynamic VBR</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
