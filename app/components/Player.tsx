"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Script from "next/script";
import { Track } from "../data/playlists";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

interface PlayerProps {
  tracks: Track[];
}

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function Player({ tracks }: PlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const isDragging = useRef(false);
  const isApiReady = useRef(false);
  const isFirstLoad = useRef(true);

  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    const initPlayer = () => {
      if (playerRef.current) return;
      
      playerRef.current = new (window as any).YT.Player("youtube-player", {
        height: "112",
        width: "200",
        videoId: tracks[0]?.videoId,
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            isApiReady.current = true;
            setDuration(event.target.getDuration());
          },
          onStateChange: (event: any) => {
            const YT = (window as any).YT;
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(event.target.getDuration());
            } else if (event.data === YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === YT.PlayerState.ENDED) {
              setCurrentIndex(prev => (prev + 1) % tracks.length);
            }
          },
          onError: (event: any) => {
            console.error("YouTube Player Error:", event.data);
            setTimeout(() => {
              setCurrentIndex(prev => (prev + 1) % tracks.length);
            }, 1000);
          }
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      // Only destroy if the component is unmounting
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [tracks]); // Safe to depend on tracks since it's a stable array reference

  // Handle track change when API is already ready
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function' && currentTrack) {
      playerRef.current.loadVideoById(currentTrack.videoId);
      setIsPlaying(true);
    }
  }, [currentIndex, currentTrack]);

  // Progress update loop
  useEffect(() => {
    if (isPlaying && !isDragging.current) {
      progressInterval.current = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          setProgress(playerRef.current.getCurrentTime());
        }
      }, 250);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying]);

  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  }, [tracks.length]);

  const handlePrev = useCallback(() => {
    if (!playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : 0;
    if (currentTime > 3) {
      playerRef.current.seekTo(0, true);
      return;
    }
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  const handleSeek = (clientX: number, target: HTMLElement) => {
    if (!playerRef.current || !duration) return;
    const rect = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    setProgress(newTime);
    if (typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(newTime, true);
    }
  };

  const handleSeekPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleSeek(e.clientX, e.currentTarget);
  };

  const handleSeekPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      handleSeek(e.clientX, e.currentTarget);
    }
  };

  const handleSeekPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      isDragging.current = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleSeekBackward = useCallback(() => {
    if (!playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : 0;
    const newTime = Math.max(0, currentTime - 10);
    if (typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(newTime, true);
    }
    setProgress(newTime);
  }, []);

  const handleSeekForward = useCallback(() => {
    if (!playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : 0;
    const dur = playerRef.current.getDuration ? playerRef.current.getDuration() : duration;
    const newTime = Math.min(dur, currentTime + 10);
    if (typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(newTime, true);
    }
    setProgress(newTime);
  }, [duration]);
  
  const handleQueueToggle = useCallback(() => {
    setIsQueueOpen(prev => !prev);
  }, []);

  if (!currentTrack) return null;

  const coverUrl = currentTrack.thumbnailUrl || `https://i.ytimg.com/vi/${currentTrack.videoId}/hqdefault.jpg`;
  const animationState = isPlaying ? "running" : "paused";
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      <KeyboardShortcuts 
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeekBackward={handleSeekBackward}
        onSeekForward={handleSeekForward}
        onQueueToggle={handleQueueToggle}
      />
      
      {/* 
        The YouTube player itself is hidden visually because the user did not want it showing,
        but it stays in the DOM to comply with YouTube TOS. 
      */}
      <div className="absolute top-0 left-0 w-[200px] h-[112px] opacity-[0.01] pointer-events-none z-[-1]">
        <div id="youtube-player"></div>
      </div>

      <div className="w-full max-w-xl mx-auto z-40 px-4 sm:px-0 relative">
        
        {/* QUEUE UI OVERLAY */}
        {isQueueOpen && (
          <div className="absolute bottom-full mb-4 w-full glass-panel rounded-2xl max-h-[300px] overflow-y-auto z-50 flex flex-col p-4 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="text-white font-semibold">Queue</h3>
              <button onClick={handleQueueToggle} className="text-white/60 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {tracks.map((track, i) => (
                <button 
                  key={track.id} 
                  onClick={() => {
                    setCurrentIndex(i);
                    if (!isPlaying) handlePlayPause();
                  }}
                  className={`flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    i === currentIndex ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="w-6 text-center text-xs text-white/40 font-mono shrink-0">
                    {i + 1}
                  </div>
                  <img src={track.thumbnailUrl || `https://i.ytimg.com/vi/${track.videoId}/default.jpg`} className="w-12 h-9 object-cover rounded shadow-sm" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] truncate ${i === currentIndex ? "text-[var(--color-accent)] font-medium" : "text-white/90"}`}>{track.title}</p>
                    <p className="text-[11px] text-white/50 truncate">{track.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DESKTOP PLAYER */}
        <div className="hidden sm:flex items-center glass-panel rounded-full p-3 pr-6 gap-4 relative">
          {/* Spinning Vinyl */}
          <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden shrink-0 shadow-lg border-2 border-white/10 group">
            <div 
              className="w-full h-full bg-cover bg-center animate-spin-linear"
              style={{ 
                backgroundImage: `url('${coverUrl}')`,
                animationPlayState: animationState
              }}
            />
            {/* Spindle hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black/70 ring-2 ring-white/40 rounded-full z-10" />
            
            {/* Play overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full cursor-pointer" onClick={handlePlayPause}>
               <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                {isPlaying ? (
                  <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                ) : (
                  <path d="M8 5v14l11-7z"/>
                )}
               </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* Title & Artist */}
            <div className="mb-2">
              <h3 className="text-[15px] font-semibold text-white truncate leading-tight drop-shadow-sm">{currentTrack.title}</h3>
              <p className="text-[12.5px] text-white/70 truncate">{currentTrack.artist}</p>
            </div>

            {/* Seek Bar */}
            <div 
              className="h-6 -my-2 flex items-center cursor-pointer touch-none group relative"
              onPointerDown={handleSeekPointerDown}
              onPointerMove={handleSeekPointerMove}
              onPointerUp={handleSeekPointerUp}
              onPointerCancel={handleSeekPointerUp}
              onPointerLeave={handleSeekPointerUp}
            >
              <div className="w-full h-[3px] bg-white/15 rounded-full relative overflow-hidden group-hover:bg-white/25 transition-colors">
                <div 
                  className="absolute top-0 left-0 bottom-0 bg-[var(--color-accent)] shadow-[0_0_10px_rgba(245,158,11,0.5)] rounded-full transition-[width] duration-100 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div 
                className="absolute w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity -ml-1.5"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
            
            {/* Time */}
            <div className="flex justify-between mt-2 text-[10.5px] tabular-nums text-white/50 font-medium">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Transport */}
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <button onClick={handlePrev} className="p-2 text-white/60 hover:text-white transition-colors cursor-pointer outline-none">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button 
              onClick={handlePlayPause} 
              className="w-10 h-10 rounded-full flex items-center justify-center glass-button text-white shadow-lg active:scale-95 transition-transform cursor-pointer outline-none"
            >
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                {isPlaying ? (
                  <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                ) : (
                  <path d="M8 5v14l11-7z"/>
                )}
              </svg>
            </button>
            <button onClick={handleNext} className="p-2 text-white/60 hover:text-white transition-colors cursor-pointer outline-none">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
            <button onClick={handleQueueToggle} className={`p-2 transition-colors cursor-pointer outline-none ${isQueueOpen ? "text-[var(--color-accent)]" : "text-white/60 hover:text-white"}`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
            </button>
          </div>
        </div>

        {/* MOBILE PLAYER */}
        <div className="sm:hidden flex flex-col glass-panel rounded-[26px] p-5 gap-4">
          
          {/* Row 1: Vinyl + Title */}
          <div className="flex items-center gap-4">
            <div className="relative w-[64px] h-[64px] rounded-full overflow-hidden shrink-0 shadow-lg border-2 border-white/10 group">
              <div 
                className="w-full h-full bg-cover bg-center animate-spin-linear"
                style={{ 
                  backgroundImage: `url('${coverUrl}')`,
                  animationPlayState: animationState
                }}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black/70 ring-2 ring-white/40 rounded-full z-10" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-semibold text-white truncate drop-shadow-sm">{currentTrack.title}</h3>
              <p className="text-[12.5px] text-white/70 truncate mt-0.5">{currentTrack.artist}</p>
            </div>
            
            <button onClick={handleQueueToggle} className={`p-2 transition-colors cursor-pointer outline-none ${isQueueOpen ? "text-[var(--color-accent)]" : "text-white/60 hover:text-white"}`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
            </button>
          </div>

          {/* Row 2: Seek Bar */}
          <div 
            className="h-8 -my-2 flex items-center cursor-pointer touch-none relative group"
            onPointerDown={handleSeekPointerDown}
            onPointerMove={handleSeekPointerMove}
            onPointerUp={handleSeekPointerUp}
            onPointerCancel={handleSeekPointerUp}
            onPointerLeave={handleSeekPointerUp}
          >
            <div className="w-full h-[3px] bg-white/15 rounded-full relative overflow-hidden group-hover:bg-white/25 transition-colors">
              <div 
                className="absolute top-0 left-0 bottom-0 bg-[var(--color-accent)] shadow-[0_0_10px_rgba(245,158,11,0.5)] rounded-full transition-[width] duration-100 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div 
              className="absolute w-4 h-4 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity -ml-2"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Row 3: Times & Transport */}
          <div className="flex items-center justify-between relative mt-1">
            <div className="absolute left-0 text-[10.5px] tabular-nums text-white/50 font-medium">
              {formatTime(progress)} / {formatTime(duration)}
            </div>
            
            <div className="flex-1 flex justify-center items-center gap-6">
              <button onClick={handlePrev} className="p-3 text-white/60 hover:text-white transition-colors cursor-pointer outline-none">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              
              <button 
                onClick={handlePlayPause} 
                className="w-[52px] h-[52px] rounded-full flex items-center justify-center glass-button ring-1 ring-white/25 text-white shadow-xl active:scale-95 transition-transform shrink-0 cursor-pointer outline-none"
              >
                <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  {isPlaying ? (
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                  ) : (
                    <path d="M8 5v14l11-7z"/>
                  )}
                </svg>
              </button>
              
              <button onClick={handleNext} className="p-3 text-white/60 hover:text-white transition-colors cursor-pointer outline-none">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>
          </div>

        </div>
        
        {/* Visible Keyboard Shortcuts Legend */}
        <div className="mt-4 text-[11px] font-medium text-white/50 flex flex-wrap justify-center gap-4 px-2">
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded">Space</kbd> Play/Pause</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded">←</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded">→</kbd> Seek</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded">N</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded">P</kbd> Track</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded">Q</kbd> Queue</span>
        </div>
      </div>
    </>
  );
}
