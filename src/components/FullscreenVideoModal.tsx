import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Project } from '../types';
import { playTick, playShutter } from '../services/audio';

interface FullscreenVideoModalProps {
  project: Project | null;
  onClose: () => void;
  soundOn?: boolean;
  setSoundOn?: (val: boolean) => void;
  totalProjectsCount?: number;
  onNextProject?: () => void;
  nextProject?: Project | null;
  isSwitchingVideo?: boolean;
}

export const FullscreenVideoModal: React.FC<FullscreenVideoModalProps> = ({
  project,
  onClose,
  soundOn = true,
  setSoundOn,
  totalProjectsCount = 21,
  onNextProject,
  nextProject,
  isSwitchingVideo = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const isCancelledRef = useRef(false);
  const hasTriggeredNextRef = useRef(false);
  const accumulatedProgressRef = useRef(0);
  const progressAnimRef = useRef<number | null>(null);
  const [isLocalSwitching, setIsLocalSwitching] = useState(false);
  const isSwitching = Boolean(isSwitchingVideo || isLocalSwitching);

  const [isMuted, setIsMuted] = useState(!soundOn);
  const [isPlaying, setIsPlaying] = useState(true);
  const isPlayingRef = useRef(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(project?.duration || 0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [nextFillProgress, setNextFillProgress] = useState(0);

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isProjectReel = Boolean(
    project?.isReel ||
    project?.slug === 'starfish-showreel' ||
    project?.slug === 'cafe' ||
    project?.name?.toLowerCase().includes('reel')
  );

  const [isReel, setIsReel] = useState<boolean>(() => isProjectReel);
  const [videoAspect, setVideoAspect] = useState<string>('9 / 16');

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.videoWidth && v.videoHeight) {
      if (v.videoHeight >= v.videoWidth || isProjectReel) {
        setIsReel(true);
        setVideoAspect(`${v.videoWidth} / ${v.videoHeight}`);
      } else {
        setIsReel(false);
        setVideoAspect(`${v.videoWidth} / ${v.videoHeight}`);
      }
    }
  };

  useEffect(() => {
    setIsReel(isProjectReel);
  }, [project, isProjectReel]);

  // High-frequency requestAnimationFrame loop for liquid, ultra-smooth progress bar progression (60/120Hz)
  useEffect(() => {
    let animId: number;

    const renderProgress = () => {
      const video = videoRef.current;
      if (video && video.duration > 0) {
        const progress = Math.min(1, Math.max(0, video.currentTime / video.duration));
        if (progressFillRef.current) {
          progressFillRef.current.style.transform = `scaleX(${progress})`;
        }
      }
      animId = requestAnimationFrame(renderProgress);
    };

    animId = requestAnimationFrame(renderProgress);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Safely and immediately stop all video and audio playback
  const stopPlayback = () => {
    isCancelledRef.current = true;
    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
        video.muted = true;
        video.currentTime = 0;
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
  };

  // Controlled playback with user-specified audio preference
  useEffect(() => {
    isCancelledRef.current = false;
    const video = videoRef.current;
    if (!video) return;

    video.muted = !soundOn;
    setIsMuted(!soundOn);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (isCancelledRef.current) {
            video.pause();
            video.muted = true;
            return;
          }
          setIsPlaying(true);
        })
        .catch((err: unknown) => {
          // If aborted or closing, do NOT retry playing
          if (isCancelledRef.current) return;
          const errorName = (err as { name?: string })?.name;
          if (errorName === 'AbortError') return;

          // If browser policy rejects unmuted autoplay, fallback to muted autoplay
          if (video && !isCancelledRef.current) {
            video.muted = true;
            setIsMuted(true);
            video
              .play()
              .then(() => {
                if (isCancelledRef.current) {
                  video.pause();
                  video.muted = true;
                } else {
                  setIsPlaying(true);
                }
              })
              .catch(() => {});
          }
        });
    }

    return () => {
      isCancelledRef.current = true;
      if (video) {
        try {
          video.pause();
          video.muted = true;
        } catch {
          // ignore
        }
      }
    };
  }, [soundOn, project]);

  // Clean up video stream on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  // Stop playback immediately if project becomes null
  useEffect(() => {
    if (!project) {
      stopPlayback();
    }
  }, [project]);

  // Handle modal close with guaranteed video and audio termination
  const handleClose = () => {
    stopPlayback();
    playTick();
    onClose();
  };

  // Trigger transition to next project
  const handleTriggerNext = () => {
    if (hasTriggeredNextRef.current) return;
    hasTriggeredNextRef.current = true;
    setIsLocalSwitching(true);
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
      progressAnimRef.current = null;
    }
    setNextFillProgress(1);
    stopPlayback();
    playTick();
    if (onNextProject) {
      onNextProject();
    }
  };

  // Reset next video prompt whenever project changes
  useEffect(() => {
    hasTriggeredNextRef.current = false;
    accumulatedProgressRef.current = 0;
    setShowNextPrompt(false);
    setNextFillProgress(0);
    setIsLocalSwitching(false);
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
      progressAnimRef.current = null;
    }
  }, [project]);

  // Single-run auto-fill countdown timer - runs strictly once, triggers next video immediately upon completion
  useEffect(() => {
    if (!showNextPrompt || !nextProject) {
      if (progressAnimRef.current) {
        cancelAnimationFrame(progressAnimRef.current);
        progressAnimRef.current = null;
      }
      return;
    }

    if (hasTriggeredNextRef.current) return;

    const COUNTDOWN_MS = 3000;
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (hasTriggeredNextRef.current) return;
      const delta = now - lastTime;
      lastTime = now;

      accumulatedProgressRef.current += delta;
      const p = Math.min(1, Math.max(0, accumulatedProgressRef.current / COUNTDOWN_MS));
      setNextFillProgress(p);

      if (p >= 1) {
        handleTriggerNext();
        return;
      }

      progressAnimRef.current = requestAnimationFrame(tick);
    };

    progressAnimRef.current = requestAnimationFrame(tick);

    return () => {
      if (progressAnimRef.current) {
        cancelAnimationFrame(progressAnimRef.current);
        progressAnimRef.current = null;
      }
    };
  }, [showNextPrompt, nextProject]);

  // Video time tracking for bottom scrubber bar and end-of-video detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const cur = video.currentTime;
      const dur = video.duration;
      setCurrentTime(cur);
      if (dur && !isNaN(dur) && dur > 0) {
        setDuration(dur);
        // If already triggered next video, do not re-evaluate
        if (hasTriggeredNextRef.current) return;

        // Show prompt in the last 3.5 seconds or near the end
        const triggerThreshold = Math.max(0.5, dur - 3.5);
        if (cur >= triggerThreshold && nextProject) {
          setShowNextPrompt(true);
        }
      }
    };

    const handleEnded = () => {
      if (nextProject && !hasTriggeredNextRef.current) {
        setShowNextPrompt(true);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [nextProject]);

  const handleToggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playTick();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.volume = 1;
        videoRef.current.play().catch(() => {});
      }
    }

    if (setSoundOn) {
      setSoundOn(!nextMuted);
    }
  };

  const handleTogglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    playShutter();
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        handleClose();
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMute();
      } else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, isMuted]);

  if (!project) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      key={`fullscreen-video-wrapper-${project.id}`}
      className="fixed inset-0 z-[20000] overflow-hidden pointer-events-auto"
    >
      {/* 1. SLIDE: Glides across and fully covers the entire screen first (solid, sharp slit) */}
      <motion.div
        key={`slide-video-${project.id}`}
        initial={{ x: '100%' }}
        animate={{ x: '0%' }}
        exit={
          isSwitching
            ? { opacity: 0, transition: { duration: 0.1 } }
            : {
                x: '100%',
                transition: { duration: 0.95, delay: 0.45, ease: [0.14, 1, 0.22, 1] },
              }
        }
        transition={{
          duration: 1.35,
          ease: [0.14, 1, 0.22, 1],
        }}
        style={{ willChange: 'transform' }}
        className="fixed inset-0 z-[20000] bg-[#FF9B00] pointer-events-none"
      />

      {/* 2. FULLSCREEN VIDEO SCREEN: Arrives right behind blue slide with silky smooth deceleration */}
      <motion.div
        id="fullscreen-video-screen"
        key={`video-content-slide-${project.id}`}
        initial={{ x: '100%' }}
        animate={{ x: '0%' }}
        exit={
          isSwitching
            ? { opacity: 0, transition: { delay: 0.55, duration: 0.1 } }
            : {
                x: '100%',
                transition: { duration: 0.9, ease: [0.14, 1, 0.22, 1] },
              }
        }
        onAnimationStart={(definition) => {
          if (definition === 'exit') {
            stopPlayback();
          }
        }}
        transition={{
          duration: 1.18,
          delay: 0.7,
          ease: [0.12, 1, 0.2, 1],
        }}
        style={{ willChange: 'transform' }}
        className="fixed inset-0 z-[20005] bg-black text-[#fcf8ef] select-none flex flex-col justify-between overflow-hidden pointer-events-auto"
      >
        {/* Video Stage: Fullscreen on mobile & landscape desktop; Full vertical Reel format with sharp edges on desktop for reels */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center cursor-pointer"
          onClick={handleTogglePlay}
        >
          {/* Ambient blurred backdrop for reels on desktop only */}
          {isReel && (
            <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none select-none">
              <img
                src={project.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover filter blur-3xl opacity-20 scale-125"
              />
              <div className="absolute inset-0 bg-black/70" />
            </div>
          )}

          {/* Video Container: Edge-to-edge on mobile; Full height vertically with sharp edges on desktop for reels */}
          <div
            style={
              isDesktop && isReel
                ? {
                    aspectRatio: videoAspect,
                    width: `min(100vw, calc(100vh * (${videoAspect})))`,
                    maxWidth: `min(100vw, calc(100vh * (${videoAspect})))`,
                    height: '100%',
                  }
                : undefined
            }
            className={
              isReel
                ? 'w-full h-full md:w-auto md:h-full md:max-h-full md:rounded-none md:overflow-hidden md:border-x md:border-white/10 md:shadow-[0_0_90px_rgba(0,0,0,0.95)] relative z-10 transition-all flex items-center justify-center bg-black'
                : 'w-full h-full relative z-10 flex items-center justify-center bg-black'
            }
          >
            <video
              ref={videoRef}
              src={project.video}
              poster={project.image}
              playsInline
              preload="auto"
              muted={isMuted}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-cover select-none rounded-none"
            />
          </div>
        </div>

        {/* UPPER NAVBAR: Positioned cleanly OVER the fullscreen video */}
        <header className="relative z-30 px-6 sm:px-10 pt-[max(1.5rem,calc(env(safe-area-inset-top)+0.5rem))] pb-8 flex items-start justify-between text-sm sm:text-base font-medium tracking-tight bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none">
          {/* Top-Left: RS® Logo */}
          <button
            id="video-home-btn"
            onClick={handleClose}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#fcf8ef] tracking-tighter leading-none hover:opacity-75 transition-opacity cursor-pointer flex items-baseline pointer-events-auto drop-shadow-md"
          >
            <span>ODD MANGO</span>
            <sup className="text-xs sm:text-sm font-bold ml-0.5 relative -top-3">®</sup>
          </button>

          {/* Top-Center: Project Name & Client */}
          <div className="flex flex-col items-center justify-center text-center px-2 sm:px-4 max-w-[45%] sm:max-w-none">
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#fcf8ef] drop-shadow-md truncate max-w-full">
              {project.name}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-[#cbc7c2]/80 mt-0.5 drop-shadow truncate max-w-full">
              {project.client} {project.tag ? `• ${project.tag}` : ''}
            </span>
          </div>

          {/* Top-Right: Works count & Close */}
          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium tracking-wider uppercase text-[#cbc7c2]/90 pointer-events-auto">
            <button
              id="video-btn-works"
              onClick={handleClose}
              className="hidden sm:inline-block hover:text-[#fcf8ef] transition-colors cursor-pointer drop-shadow-md"
            >
              works({totalProjectsCount})
            </button>
            <button
              id="video-close-btn"
              onClick={handleClose}
              className="text-[#fcf8ef] hover:opacity-70 active:scale-95 transition-all p-2 -mr-2 sm:p-1 sm:mr-0 cursor-pointer drop-shadow-md flex items-center justify-center"
              title="Close Video"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* BOTTOM CONTROLS: Overlaid ON the video with Sound and Playback options */}
        <footer className="relative z-30 px-6 sm:px-10 pb-[max(1.75rem,calc(env(safe-area-inset-bottom)+1rem))] pt-12 flex flex-col justify-end gap-3 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none">
          {/* Main Controls Row */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-mono tracking-tight pointer-events-auto">
            {/* Bottom-Left: Sound Option + Play/Pause */}
            <div className="flex items-center gap-5 sm:gap-7">
              {/* Sound on/off toggle */}
              <button
                id="video-sound-toggle-btn"
                onClick={handleToggleMute}
                className="text-[#cbc7c2] hover:text-[#fcf8ef] transition-colors cursor-pointer uppercase tracking-wider"
                title={isMuted ? 'Turn Sound On' : 'Turn Sound Off'}
              >
                <span className="roll">
                  <span className="roll-inner">
                    <span className="roll-face">sound : [{isMuted ? 'off' : 'on'}]</span>
                    <span className="roll-face text-white">sound : [{isMuted ? 'off' : 'on'}]</span>
                  </span>
                </span>
              </button>

              {/* Play / Pause toggle */}
              <button
                id="video-playback-toggle-btn"
                onClick={handleTogglePlay}
                className="text-[#cbc7c2] hover:text-[#fcf8ef] transition-colors cursor-pointer uppercase tracking-wider"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <span className="roll">
                  <span className="roll-inner">
                    <span className="roll-face">[{isPlaying ? 'pause' : 'play'}]</span>
                    <span className="roll-face text-white">[{isPlaying ? 'pause' : 'play'}]</span>
                  </span>
                </span>
              </button>
            </div>

            {/* Bottom-Center: Project Name & Type */}
            <div className="hidden md:flex flex-col items-center justify-center text-center">
              <span className="text-xs font-mono uppercase text-[#cbc7c2]/70 tracking-wider">
                {project.type.toUpperCase()}[{formatTime(currentTime)} / {formatTime(duration)}]
              </span>
            </div>

            {/* Bottom-Right: Time */}
            <div className="flex items-center text-xs font-mono text-[#cbc7c2]/80 uppercase">
              <span className="text-[11px] sm:text-xs tracking-wider">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Slim Interactive Progress / Scrubber Bar at bottom edge */}
          <div
            className="w-full h-1 bg-white/20 hover:h-1.5 transition-all cursor-pointer relative rounded-full overflow-hidden pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              if (videoRef.current && duration > 0) {
                const newTime = ratio * duration;
                videoRef.current.currentTime = newTime;
                if (progressFillRef.current) {
                  progressFillRef.current.style.transform = `scaleX(${ratio})`;
                }
                playTick();
                if (newTime < Math.max(0.5, duration - 4.5) && !hasTriggeredNextRef.current) {
                  setShowNextPrompt(false);
                  accumulatedProgressRef.current = 0;
                  setNextFillProgress(0);
                }
              }
            }}
          >
            <div
              ref={progressFillRef}
              className="h-full w-full bg-[#FF9B00] origin-left will-change-transform"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        </footer>

        {/* Next Video Button in Bottom-Right Corner */}
        <AnimatePresence>
          {showNextPrompt && nextProject && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-24 sm:bottom-28 right-5 sm:right-10 z-[20030] pointer-events-auto"
            >
              <button
                id="next-video-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTriggerNext();
                }}
                className="group relative overflow-hidden bg-black/85 hover:bg-black text-[#fcf8ef] border border-white/20 hover:border-[#FF9B00] shadow-[0_12px_35px_rgba(0,0,0,0.85)] px-6 sm:px-7 py-3 sm:py-3.5 cursor-pointer select-none transition-all flex items-center justify-center min-w-[140px]"
                title="Play next video"
              >
                {/* Dynamic Ambient Loading Fill */}
                <div
                  className="absolute inset-0 bg-[#FF9B00]/30 pointer-events-none origin-left will-change-transform"
                  style={{ transform: `scaleX(${nextFillProgress})` }}
                />

                {/* Only One Text: The Next Video */}
                <span className="relative z-10 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#fcf8ef] group-hover:text-white transition-colors">
                  the next video
                </span>

                {/* Loading Fill Progress Bar at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 overflow-hidden">
                  <div
                    className="h-full bg-[#FF9B00] origin-left will-change-transform"
                    style={{ transform: `scaleX(${nextFillProgress})` }}
                  />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
