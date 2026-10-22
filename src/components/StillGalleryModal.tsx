import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '../types';
import { playTick, playShutter } from '../services/audio';

interface StillGalleryModalProps {
  project: Project | null;
  projects?: Project[];
  onSelectProject?: (proj: Project) => void;
  onClose: () => void;
  soundOn: boolean;
  setSoundOn: (val: boolean) => void;
  gesturesOn: boolean;
  setGesturesOn: (val: boolean) => void;
  totalProjectsCount?: number;
}

// Global cache of loaded gallery image URLs across sessions
const loadedGalleryUrls = new Set<string>();

export const StillGalleryModal: React.FC<StillGalleryModalProps> = ({
  project,
  projects = [],
  onSelectProject,
  onClose,
  soundOn,
  setSoundOn,
  totalProjectsCount = 16,
}) => {
  // If a projects array is provided, use it so the user can browse ALL projects/images in the slider.
  // Otherwise fallback to project's gallery.
  const activeProjects = projects.length > 0 ? projects : (project ? [project] : []);

  // Find the index of the currently opened project in activeProjects
  const activeProjectIndex = activeProjects.findIndex((p) => p.id === project?.id);
  const currentProjectIndex = activeProjectIndex >= 0 ? activeProjectIndex : 0;

  // Track sub-index within a project's gallery if it has multiple images
  const [gallerySubIndex, setGallerySubIndex] = useState(0);

  const currentActiveProject = activeProjects[currentProjectIndex] || project;
  const currentGallery =
    currentActiveProject?.gallery && currentActiveProject.gallery.length > 0
      ? currentActiveProject.gallery
      : [currentActiveProject?.image || ''];

  // Reset gallery sub-index whenever the project changes
  useEffect(() => {
    setGallerySubIndex(0);
  }, [project?.id]);

  const totalCount = activeProjects.length > 1 ? activeProjects.length : currentGallery.length;
  const displayIndex = activeProjects.length > 1 ? currentProjectIndex : gallerySubIndex;

  // Navigate to previous project/image in the slider
  const handlePrev = useCallback(() => {
    playShutter();
    if (activeProjects.length > 1 && onSelectProject) {
      // Navigate directly to previous project in slider (1 click = 1 slide)
      const prevProjectIdx =
        (currentProjectIndex - 1 + activeProjects.length) % activeProjects.length;
      const prevProject = activeProjects[prevProjectIdx];
      if (prevProject) {
        setGallerySubIndex(0);
        onSelectProject(prevProject);
      }
    } else if (currentGallery.length > 1) {
      setGallerySubIndex((prev) => (prev > 0 ? prev - 1 : currentGallery.length - 1));
    }
  }, [activeProjects, currentProjectIndex, onSelectProject, currentGallery.length]);

  // Navigate to next project/image in the slider
  const handleNext = useCallback(() => {
    playShutter();
    if (activeProjects.length > 1 && onSelectProject) {
      // Navigate directly to next project in slider (1 click = 1 slide)
      const nextProjectIdx = (currentProjectIndex + 1) % activeProjects.length;
      const nextProject = activeProjects[nextProjectIdx];
      if (nextProject) {
        setGallerySubIndex(0);
        onSelectProject(nextProject);
      }
    } else if (currentGallery.length > 1) {
      setGallerySubIndex((prev) => (prev < currentGallery.length - 1 ? prev + 1 : 0));
    }
  }, [activeProjects, currentProjectIndex, onSelectProject, currentGallery.length]);

  // Idle background prefetch for adjacent images/projects in the slider
  useEffect(() => {
    if (typeof window === 'undefined' || !activeProjects.length) return;

    const preload = (url?: string) => {
      if (!url || loadedGalleryUrls.has(url)) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      img.onload = () => loadedGalleryUrls.add(url);
    };

    const schedulePreload = () => {
      if (activeProjects.length > 1) {
        const nextIdx = (currentProjectIndex + 1) % activeProjects.length;
        const prevIdx = (currentProjectIndex - 1 + activeProjects.length) % activeProjects.length;
        preload(activeProjects[nextIdx]?.image);
        preload(activeProjects[prevIdx]?.image);
      } else if (currentGallery.length > 1) {
        const nextSub = (gallerySubIndex + 1) % currentGallery.length;
        const prevSub = (gallerySubIndex - 1 + currentGallery.length) % currentGallery.length;
        preload(currentGallery[nextSub]);
        preload(currentGallery[prevSub]);
      }
    };

    if ('requestIdleCallback' in window) {
      const handle = (
        window as Window & { requestIdleCallback: (cb: () => void) => number }
      ).requestIdleCallback(schedulePreload);
      return () =>
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(
          handle
        );
    } else {
      const t = setTimeout(schedulePreload, 1000);
      return () => clearTimeout(t);
    }
  }, [activeProjects, currentProjectIndex, gallerySubIndex, currentGallery]);

  // Keyboard navigation
  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        playTick();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [project, onClose, handlePrev, handleNext]);

  // Wheel gesture handling with cooldown
  const wheelAccumulatorRef = useRef(0);
  const isWheelLockedRef = useRef(false);
  const wheelCooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (activeProjects.length <= 1 && currentGallery.length <= 1) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAccumulatorRef.current += delta;
    const WHEEL_THRESHOLD = 30;

    if (!isWheelLockedRef.current && Math.abs(wheelAccumulatorRef.current) >= WHEEL_THRESHOLD) {
      isWheelLockedRef.current = true;
      if (wheelAccumulatorRef.current > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      wheelAccumulatorRef.current = 0;

      if (wheelCooldownTimerRef.current) clearTimeout(wheelCooldownTimerRef.current);
      wheelCooldownTimerRef.current = setTimeout(() => {
        isWheelLockedRef.current = false;
        wheelAccumulatorRef.current = 0;
      }, 420);
    }

    if (wheelCooldownTimerRef.current) clearTimeout(wheelCooldownTimerRef.current);
    wheelCooldownTimerRef.current = setTimeout(() => {
      isWheelLockedRef.current = false;
      wheelAccumulatorRef.current = 0;
    }, 280);
  };

  if (!currentActiveProject) return null;

  const currentImageUrl =
    activeProjects.length > 1
      ? currentGallery[0] || currentActiveProject.image || ''
      : currentGallery[gallerySubIndex] || currentActiveProject.image || '';

  return (
    <div
      key="gallery-screen-wrapper"
      className="fixed inset-0 z-[20000] overflow-hidden pointer-events-auto"
    >
      {/* 1. SLIDE: Glides across screen first (orange transition) */}
      <motion.div
        key="slide-orange-transition"
        initial={{ x: '100%' }}
        animate={{ x: '0%' }}
        exit={{
          x: '100%',
          transition: { duration: 0.95, delay: 0.45, ease: [0.14, 1, 0.22, 1] },
        }}
        transition={{
          duration: 1.35,
          ease: [0.14, 1, 0.22, 1],
        }}
        style={{ willChange: 'transform' }}
        className="fixed inset-0 z-[20000] bg-[#FF9B00] pointer-events-none"
      />

      {/* 2. WHITE SCREEN: Directly shows the opened image in the middle on the white background */}
      <motion.div
        id="still-gallery-screen"
        key="white-slide-stage"
        initial={{ x: '100%' }}
        animate={{ x: '0%' }}
        exit={{
          x: '100%',
          transition: { duration: 0.9, ease: [0.14, 1, 0.22, 1] },
        }}
        transition={{
          duration: 1.18,
          delay: 0.7,
          ease: [0.12, 1, 0.2, 1],
        }}
        style={{ willChange: 'transform' }}
        onClick={() => {
          // Clicking outside the image closes the view
          playTick();
          onClose();
        }}
        onWheel={handleWheel}
        className="fixed inset-0 z-[20005] bg-white text-[#111111] select-none flex flex-col justify-between overflow-hidden cursor-pointer pointer-events-auto"
      >
        {/* TOP HEADER */}
        <header
          onClick={(e) => e.stopPropagation()}
          className="w-full px-6 sm:px-10 pt-6 pb-2 flex items-start justify-between text-sm sm:text-base font-medium tracking-tight cursor-default z-30"
        >
          {/* Top-Left: Logo */}
          <button
            id="gallery-home-btn"
            onClick={() => {
              playTick();
              onClose();
            }}
            className="text-3xl sm:text-4xl font-extrabold text-[#FF9B00] tracking-tighter leading-none hover:opacity-80 transition-opacity cursor-pointer flex items-baseline"
          >
            <span>ODD MANGO</span>
            <sup className="text-xs sm:text-sm font-bold ml-0.5 relative -top-3">®</sup>
          </button>

          {/* Top-Center: Project Name & Client */}
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-black">
              {currentActiveProject.name}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-[#737373]">
              {currentActiveProject.client}
            </span>
          </div>

          {/* Top-Right: Works count & Close Button */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium tracking-wider uppercase text-[#737373]">
            <button
              id="gallery-btn-works"
              onClick={() => {
                playTick();
                onClose();
              }}
              className="hidden sm:inline-block hover:text-black transition-colors cursor-pointer"
            >
              works({totalProjectsCount})
            </button>
            <button
              id="gallery-close-btn"
              onClick={() => {
                playTick();
                onClose();
              }}
              className="text-black hover:opacity-60 transition-opacity p-1.5 cursor-pointer flex items-center gap-1 rounded-full hover:bg-black/5"
              title="Close Showcase"
            >
              <span className="hidden sm:inline-block text-xs font-mono uppercase text-[#737373]">CLOSE</span>
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </header>

        {/* MAIN STAGE: DIRECTLY SHOWS ONLY THAT IMAGE IN THE MIDDLE ON THE WHITE BACKGROUND */}
        <div className="relative flex-1 min-h-0 w-full flex items-center justify-center px-10 sm:px-14 md:px-16 py-2 sm:py-3 select-none">
          {/* Left Arrow for navigating project images in slider */}
          {totalCount > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-1 sm:left-5 md:left-7 z-30 p-1.5 sm:p-3 rounded-full text-black hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer touch-manipulation"
              title="Previous image"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Single Focused Image in the Middle: Perfectly dimensioned so it is NEVER cut off from top and bottom */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`direct-still-${currentActiveProject.id}-${displayIndex}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex items-center justify-center cursor-default select-none shadow-[0_15px_50px_rgba(0,0,0,0.12)] border border-black/10 bg-neutral-900"
              style={{
                maxHeight: 'min(calc(100vh - 160px), 74vh)',
                maxWidth: 'min(calc(100vw - 84px), 82vw)',
              }}
            >
              <img
                src={currentImageUrl}
                alt={`${currentActiveProject.name} ${displayIndex + 1}`}
                draggable={false}
                loading="eager"
                decoding="async"
                {...({ fetchPriority: 'high' } as any)}
                referrerPolicy="no-referrer"
                onLoad={() => loadedGalleryUrls.add(currentImageUrl)}
                className="w-auto h-auto max-w-full max-h-full object-contain select-none pointer-events-auto block"
                style={{
                  maxHeight: 'min(calc(100vh - 160px), 74vh)',
                  maxWidth: 'min(calc(100vw - 84px), 82vw)',
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Right Arrow for navigating project images in slider */}
          {totalCount > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-1 sm:right-6 md:right-8 z-30 p-1.5 sm:p-3 rounded-full text-black hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer touch-manipulation"
              title="Next image"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}
        </div>

        {/* BOTTOM INSPECTOR FOOTER */}
        <footer
          onClick={(e) => e.stopPropagation()}
          className="w-full flex flex-col justify-end cursor-default z-30"
        >
          <div className="px-6 sm:px-10 pb-3 flex items-center justify-center text-xs font-mono font-medium tracking-wider text-[#737373]">
            {/* Bottom-Center: Slide Counter */}
            <div className="flex flex-col items-center leading-none text-xs font-bold text-black mx-auto select-none">
              <span>{String(displayIndex + 1).padStart(2, '0')}</span>
              <div className="w-4 h-[1px] bg-black/40 my-0.5" />
              <span>{String(totalCount).padStart(2, '0')}</span>
            </div>

            {/* Bottom-Right: Sound toggle */}
            <div className="absolute right-6 sm:right-10 flex items-center text-[11px]">
              <button
                id="gallery-sound-toggle"
                onClick={() => {
                  playTick();
                  setSoundOn(!soundOn);
                }}
                className="hover:text-black transition-colors cursor-pointer uppercase font-mono"
              >
                SOUND : [{soundOn ? 'ON' : 'OFF'}]
              </button>
            </div>
          </div>

          {/* Bottom Edge Yellow Line */}
          <div className="w-full h-[3px] bg-[#FF9B00]" />
        </footer>
      </motion.div>
    </div>
  );
};
