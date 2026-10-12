import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { Project, CurveMode } from '../types';
import { playTick, playShutter } from '../services/audio';

interface SliderViewProps {
  projects: Project[];
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
  onSelectProject: (project: Project) => void;
  onOpenServices?: () => void;
  fisheyeOn: boolean;
  curveMode?: CurveMode;
  paused?: boolean;
}

type DisplayProject = Project & { virtualKey: string; originalIndex: number; slot: number };

// Global cache of requested/loaded image URLs across slider navigation
const loadedSliderImageUrls = new Set<string>();

const SliderCardMedia: React.FC<{
  project: DisplayProject;
  isActive: boolean;
  distance: number;
  curveMode: string;
  fisheyeOn: boolean;
  isDragging: boolean;
  paused?: boolean;
}> = ({ project, isActive, distance, curveMode, fisheyeOn, isDragging, paused = false }) => {
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVideo = Boolean(project.video) && (project.type === 'motion' || Boolean(project.video));

  // Immediate visibility zone: center active card + immediate neighbor cards (~2.6 slots)
  // Cards far off-screen do not request network resources until user scrolls nearby
  const isNearView = distance <= 2.6 || isActive;
  const shouldLoad = isNearView || loadedSliderImageUrls.has(project.image);
  const [isImgReady, setIsImgReady] = useState(() => loadedSliderImageUrls.has(project.image));

  useEffect(() => {
    if (shouldLoad && !isImgReady && loadedSliderImageUrls.has(project.image)) {
      setIsImgReady(true);
    }
  }, [shouldLoad, project.image, isImgReady]);

  const handleMouseEnter = () => {
    // Only the center image (isActive) should play video on hover when not paused
    if (isDragging || paused || !isVideo || !isActive) return;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    // Start preloading video only on intentional hover
    setIsHovering(true);
    // Extended intentional delay (750ms) on hover before playing video
    hoverTimerRef.current = setTimeout(() => {
      setIsVideoActive(true);
    }, 750);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHovering(false);
    setIsVideoActive(false);
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.muted = true;
      } catch {}
    }
  };

  // If card loses active status, user starts dragging, or slider is paused, immediately cancel pending timer and stop playback
  useEffect(() => {
    if (!isActive || isDragging || paused) {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      setIsHovering(false);
      setIsVideoActive(false);
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.muted = true;
        } catch {}
      }
    }
  }, [isActive, isDragging, paused]);

  // Clean up timer and video on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.muted = true;
        } catch {}
      }
    };
  }, []);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    videoRef.current.muted = true;
    if (isVideoActive && isActive && !isDragging && !paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      try {
        videoRef.current.pause();
        videoRef.current.muted = true;
      } catch {}
    }
  }, [isVideoActive, isActive, isDragging, isVideo, paused]);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-black"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* High-performance Lazy Loaded Image */}
      {shouldLoad ? (
        <img
          src={project.image}
          alt={project.alt}
          draggable={false}
          loading={isActive ? 'eager' : 'lazy'}
          decoding={isActive ? 'sync' : 'async'}
          {...({ fetchPriority: isActive ? 'high' : 'low' } as any)}
          referrerPolicy="no-referrer"
          onLoad={() => {
            loadedSliderImageUrls.add(project.image);
            setIsImgReady(true);
          }}
          style={{
            filter:
              curveMode === 'cylinder' && isActive
                ? 'saturate(1.38) contrast(1.08) brightness(1.02)'
                : 'saturate(1) contrast(1) brightness(1)',
            transition: 'filter 0.85s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            opacity: isImgReady ? (isVideo && isVideoActive && isActive && !isDragging && !paused ? 0 : 1) : 0,
          }}
          className={`w-full h-full object-cover select-none pointer-events-none ${
            fisheyeOn && isActive ? 'fisheye-optical' : ''
          }`}
        />
      ) : (
        /* Dark low-overhead placeholder for offscreen cards */
        <div className="w-full h-full bg-[#0d0e12] flex items-center justify-center pointer-events-none" />
      )}

      {/* Video in Frame on hover with slight delay - strictly lazy-loaded on hover for the active center card */}
      {isVideo && project.video && isActive && !paused && (isHovering || isVideoActive) && (
        <video
          ref={videoRef}
          src={project.video}
          muted
          playsInline
          loop
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 ${
            isVideoActive && !isDragging && !paused ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

export const SliderView: React.FC<SliderViewProps> = ({
  projects,
  currentIndex,
  setCurrentIndex,
  onSelectProject,
  onOpenServices,
  fisheyeOn,
  curveMode = 'arch',
  paused = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const mousePosRef = useRef({ x: -200, y: -200 });
  const tailPosRef = useRef({ x: -200, y: -200 });
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isHoveringStage, setIsHoveringStage] = useState(false);
  const [isHoveringCenterCard, setIsHoveringCenterCard] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== 'undefined' ? (window.visualViewport?.width || window.innerWidth) : 1200,
    height: typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 800,
  }));
  const isMobile = windowSize.width < 768;
  const effectiveCurveMode: CurveMode = isMobile ? (curveMode === 'off' ? 'off' : 'arch') : curveMode;
  const effectiveFisheye = isMobile ? false : fisheyeOn;

  const [frameDimensions, setFrameDimensions] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = window.visualViewport?.width || window.innerWidth;
      const h = window.visualViewport?.height || window.innerHeight;
      if (w < 768) {
        return {
          width: w,
          height: h,
          fisheyeSize: Math.min(w, h),
        };
      }
    }
    return { width: 395, height: 573, fisheyeSize: 840 };
  });
  const frameGap = isMobile ? 0 : (effectiveCurveMode === 'off' || effectiveFisheye ? 0 : 36);
  const step = frameDimensions.width + frameGap;

  // Smooth elastic trailing physics for the cursor tail
  useEffect(() => {
    let animId: number;
    const LERP = 0.12;

    const updateTail = () => {
      if (mousePosRef.current.x > 0) {
        // Offset so the badge trails behind and to the bottom-right as a tail, not centered on cursor
        const isNearRight = mousePosRef.current.x > window.innerWidth - 130;
        const isNearBottom = mousePosRef.current.y > window.innerHeight - 60;
        const offsetX = isNearRight ? -115 : 16;
        const offsetY = isNearBottom ? -36 : 16;

        const targetX = mousePosRef.current.x + offsetX;
        const targetY = mousePosRef.current.y + offsetY;

        tailPosRef.current.x += (targetX - tailPosRef.current.x) * LERP;
        tailPosRef.current.y += (targetY - tailPosRef.current.y) * LERP;

        if (followerRef.current) {
          followerRef.current.style.transform = `translate3d(${tailPosRef.current.x}px, ${tailPosRef.current.y}px, 0)`;
        }
      }
      animId = requestAnimationFrame(updateTail);
    };

    animId = requestAnimationFrame(updateTail);
    return () => cancelAnimationFrame(animId);
  }, []);

  const displayTotal = projects.length;

  // Smooth continuous floating scroll position
  const [scrollPos, setScrollPos] = useState(() => Math.max(0, Math.min(projects.length - 1, currentIndex)));
  const targetScrollRef = useRef(Math.max(0, Math.min(projects.length - 1, currentIndex)));
  const smoothScrollRef = useRef(targetScrollRef.current);
  const lastCenterRef = useRef(currentIndex);
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Clear any drag or hover state when paused
  useEffect(() => {
    if (paused) {
      isDraggingRef.current = false;
      setIsDragging(false);
      setIsHoveringCenterCard(false);
      setIsHoveringStage(false);
    }
  }, [paused]);

  // Infinite conveyor on the left, strictly ending at displayTotal - 1 (Titan) on the right
  const isLastSlide =
    displayTotal > 0 &&
    ((Math.round(smoothScrollRef.current) % displayTotal + displayTotal) % displayTotal === displayTotal - 1) &&
    smoothScrollRef.current >= displayTotal - 1.4;

  // Smooth curve mode switch transition state on desktop
  const [isCurveTransitioning, setIsCurveTransitioning] = useState(false);
  const [trackedMode, setTrackedMode] = useState(effectiveCurveMode);
  const [trackedFisheye, setTrackedFisheye] = useState(effectiveFisheye);
  const curveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronously catch mode changes during render so transition styles are present on the very first frame!
  if (trackedMode !== effectiveCurveMode || trackedFisheye !== effectiveFisheye) {
    setTrackedMode(effectiveCurveMode);
    setTrackedFisheye(effectiveFisheye);
    if (!isMobile) {
      setIsCurveTransitioning(true);
    }
  }

  useEffect(() => {
    if (isCurveTransitioning) {
      if (curveTimerRef.current) clearTimeout(curveTimerRef.current);
      curveTimerRef.current = setTimeout(() => {
        setIsCurveTransitioning(false);
      }, 1000);
    }
  }, [isCurveTransitioning]);

  // Continuous physics animation loop for liquid 60/120fps smooth momentum
  useEffect(() => {
    let animId: number;
    let lastTickTime = performance.now();
    let scrollVelocity = 0;

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.04, Math.max(0.001, (now - lastTickTime) / 1000));
      lastTickTime = now;

      const delta = targetScrollRef.current - smoothScrollRef.current;
      const isMoving = Math.abs(delta) > 0.0001 || Math.abs(scrollVelocity) > 0.0001 || isDraggingRef.current;

      if (isMoving && displayTotal > 0) {
        if (isDraggingRef.current) {
          // Responsive tracking while dragging
          smoothScrollRef.current += delta * 0.35;
          scrollVelocity = 0;
        } else {
          // Second-order critically damped smooth spring:
          // Instantaneous response with a silky, cushioned settle
          const STIFFNESS = 46; // Snappy, instant pull
          const DAMPING = 13.5; // Perfectly critically damped for a smooth, cushioned settle
          const springForce = delta * STIFFNESS;
          const dampingForce = scrollVelocity * DAMPING;
          const acceleration = springForce - dampingForce;

          scrollVelocity += acceleration * dt;
          smoothScrollRef.current += scrollVelocity * dt;

          // Snap to rest when settled
          if (Math.abs(delta) < 0.0002 && Math.abs(scrollVelocity) < 0.001) {
            smoothScrollRef.current = targetScrollRef.current;
            scrollVelocity = 0;
          }
        }

        // Right side is bounded at projects.length - 1 (Titan)
        const maxScroll = displayTotal - 1;
        if (smoothScrollRef.current > maxScroll + 0.35) {
          smoothScrollRef.current = maxScroll + 0.35;
        }

        // Left side is infinite (never clamped or forcibly wrapped)

        setScrollPos(smoothScrollRef.current);

        // Check if active center frame has changed to sync audio tick & parent state
        const currentVirtualCenter = Math.round(smoothScrollRef.current);
        if (currentVirtualCenter !== lastCenterRef.current) {
          lastCenterRef.current = currentVirtualCenter;
          playTick();
          const currentProjectIndex = ((currentVirtualCenter % displayTotal) + displayTotal) % displayTotal;
          if (currentProjectIndex !== currentIndexRef.current) {
            setCurrentIndex(currentProjectIndex);
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [displayTotal, setCurrentIndex]);

  // Sync scroll position when external currentIndex changes
  useEffect(() => {
    if (displayTotal === 0) return;
    const maxScroll = displayTotal - 1;
    const currentNorm = ((Math.round(smoothScrollRef.current) % displayTotal) + displayTotal) % displayTotal;
    if (currentNorm !== currentIndex) {
      targetScrollRef.current = Math.max(0, Math.min(maxScroll, currentIndex));
    }
  }, [currentIndex, displayTotal]);

  // Dynamically populated cards: infinite conveyor on the left, strictly bounded at displayTotal - 1 on the right
  const visibleCards = useMemo(() => {
    if (displayTotal === 0) return [];
    const centerSlot = Math.round(scrollPos);
    const range = isMobile ? 3 : (isCurveTransitioning ? 9 : 8);
    const minSlot = centerSlot - range;
    const maxSlot = Math.min(displayTotal - 1, centerSlot + range);

    const cards: DisplayProject[] = [];

    for (let s = minSlot; s <= maxSlot; s++) {
      const originalIndex = ((s % displayTotal) + displayTotal) % displayTotal;
      const proj = projects[originalIndex];
      if (proj) {
        cards.push({
          ...proj,
          slot: s,
          originalIndex,
          virtualKey: `${proj.id}-slot-${s}`,
        });
      }
    }
    return cards;
  }, [displayTotal, scrollPos, isMobile, isCurveTransitioning, projects]);

  // Reset center hover when active project changes
  useEffect(() => {
    setIsHoveringCenterCard(false);
  }, [currentIndex]);

  // Responsive frame size: full-screen on mobile, tall portrait frames on desktop
  useEffect(() => {
    const updateSize = () => {
      const vw = typeof window !== 'undefined' ? (window.visualViewport?.width ?? window.innerWidth) : 1200;
      const vh = typeof window !== 'undefined' ? (window.visualViewport?.height ?? window.innerHeight) : 800;
      const isMob = vw < 768;

      if (isMob) {
        setWindowSize({ width: Math.round(vw), height: Math.round(vh) });
        setFrameDimensions({
          width: Math.round(vw),
          height: Math.round(vh),
          fisheyeSize: Math.round(Math.min(vw, vh)),
        });
        return;
      }

      let w = vw;
      let h = vh;

      // Accurately measure the actual rendered layout space if containerRef is mounted (desktop only)
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          w = rect.width;
          h = rect.height;
        }
      }

      setWindowSize({ width: Math.round(w), height: Math.round(h) });

      const availableH = h - 210;
      const baseH = Math.max(availableH, 260);
      const finalH = baseH + 23;

      const targetW = Math.round(baseH * 0.72);
      const finalW = Math.min(targetW, Math.round(w * 0.85));

      const minDimension = Math.min(w, h);
      const fisheyeSize = Math.min(Math.round(minDimension * 0.96), 940);

      setFrameDimensions({
        width: Math.max(finalW, 220),
        height: Math.max(finalH, 283),
        fisheyeSize: Math.max(fisheyeSize, 280),
      });
    };

    updateSize();

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);
    window.visualViewport?.addEventListener('resize', updateSize);
    window.visualViewport?.addEventListener('scroll', updateSize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => {
        updateSize();
      });
      ro.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
      window.visualViewport?.removeEventListener('resize', updateSize);
      window.visualViewport?.removeEventListener('scroll', updateSize);
      ro?.disconnect();
    };
  }, [paused]);

  // 3D cylindrical radius scaled responsively to viewport width
  const radius = useMemo(() => {
    if (windowSize.width < 640) return 800;
    if (windowSize.width < 1024) return 1080;
    if (windowSize.width < 1600) return 1380;
    return 1650;
  }, [windowSize.width]);

  const goToNext = useCallback(() => {
    if (displayTotal === 0) return;
    const maxScroll = displayTotal - 1;
    if (Math.round(smoothScrollRef.current) >= maxScroll || Math.round(targetScrollRef.current) >= maxScroll) {
      if (onOpenServices) {
        onOpenServices();
      }
      return;
    }
    targetScrollRef.current = Math.min(maxScroll, Math.round(targetScrollRef.current) + 1);
  }, [displayTotal, onOpenServices]);

  const goToPrev = useCallback(() => {
    if (displayTotal === 0) return;
    targetScrollRef.current = Math.round(targetScrollRef.current) - 1;
  }, [displayTotal]);

  // Auto-scroll: every 4 seconds, the slide goes to next one automatically until slides end
  const autoScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAutoScroll = useCallback(() => {
    if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
    if (paused || displayTotal === 0) return;

    autoScrollTimerRef.current = setTimeout(() => {
      if (!isDraggingRef.current && !isHoveringCenterCard && !paused) {
        const maxScroll = displayTotal - 1;
        if (Math.round(targetScrollRef.current) < maxScroll) {
          goToNext();
        }
      }
      resetAutoScroll();
    }, 4000);
  }, [paused, displayTotal, goToNext, isHoveringCenterCard]);

  useEffect(() => {
    resetAutoScroll();
    return () => {
      if (autoScrollTimerRef.current) clearTimeout(autoScrollTimerRef.current);
    };
  }, [resetAutoScroll]);

  // Idle background prefetch for next and previous items to guarantee silky instant transitions
  useEffect(() => {
    if (typeof window === 'undefined' || projects.length === 0 || paused) return;
    const nextProj = projects[(currentIndex + 1) % projects.length];
    const prevProj = projects[(currentIndex - 1 + projects.length) % projects.length];

    const preload = (url?: string) => {
      if (!url || loadedSliderImageUrls.has(url)) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      img.onload = () => loadedSliderImageUrls.add(url);
    };

    const schedulePreload = () => {
      preload(nextProj?.image);
      preload(prevProj?.image);
    };

    if ('requestIdleCallback' in window) {
      const handle = (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(schedulePreload);
      return () => (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
    } else {
      const t = setTimeout(schedulePreload, 1200);
      return () => clearTimeout(t);
    }
  }, [currentIndex, projects, paused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (paused) return;
      if (isCurveTransitioning) {
        setIsCurveTransitioning(false);
        if (curveTimerRef.current) clearTimeout(curveTimerRef.current);
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        resetAutoScroll();
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        resetAutoScroll();
        goToPrev();
      } else if (e.key === 'Enter') {
        const centerIdx = ((Math.round(smoothScrollRef.current) % displayTotal) + displayTotal) % displayTotal;
        const activeProject = projects[centerIdx];
        if (activeProject) {
          playShutter();
          onSelectProject(activeProject);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, projects, displayTotal, onSelectProject, isCurveTransitioning, resetAutoScroll, paused]);

  // Wheel scroll: instant and responsive like native scroll
  // As soon as the user scrolls, images advance forward/backward immediately with zero delay
  const lastScrollTimeRef = useRef(0);
  const lastDirectionRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (paused) return;
      e.preventDefault();
      if (displayTotal === 0) return;

      if (isCurveTransitioning) {
        setIsCurveTransitioning(false);
        if (curveTimerRef.current) clearTimeout(curveTimerRef.current);
      }

      // Normalize delta based on deltaMode (0: pixels, 1: lines, 2: pages)
      const rawDeltaX = e.deltaMode === 1 ? e.deltaX * 36 : e.deltaMode === 2 ? e.deltaX * 400 : e.deltaX;
      const rawDeltaY = e.deltaMode === 1 ? e.deltaY * 36 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;

      // Determine predominant scroll delta with direction
      const dominantDelta = Math.abs(rawDeltaX) > Math.abs(rawDeltaY) ? rawDeltaX : rawDeltaY;

      // Filter negligible micro-jitter from resting fingers
      if (Math.abs(dominantDelta) < 3) return;

      const direction = dominantDelta > 0 ? 1 : -1;
      const now = performance.now();
      const timeSinceLast = now - lastScrollTimeRef.current;

      // If scrolled, immediately advance the images with zero delay!
      if (direction !== lastDirectionRef.current || timeSinceLast > 180) {
        lastScrollTimeRef.current = now;
        lastDirectionRef.current = direction;

        const maxScroll = displayTotal - 1;
        if (direction > 0) {
          // Scrolling forward / right
          if (Math.round(smoothScrollRef.current) >= maxScroll || Math.round(targetScrollRef.current) >= maxScroll) {
            // Once the videos slides end, upon the next scroll, the service page should open
            if (onOpenServices) {
              onOpenServices();
            }
            return;
          }
          targetScrollRef.current = Math.min(maxScroll, Math.round(targetScrollRef.current) + 1);
        } else {
          // Scrolling backward / left: infinite on the left!
          targetScrollRef.current = Math.round(targetScrollRef.current) - 1;
        }
        resetAutoScroll();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [displayTotal, isCurveTransitioning, resetAutoScroll, onOpenServices]);

  // Pointer drag handling: 1:1 direct tracking with momentum fling release
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const startYRef = useRef(0);
  const clickedCardRef = useRef<{
    project: DisplayProject;
    startX: number;
    startY: number;
    continuousOffset: number;
    isActive: boolean;
    slot: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.pointerType === 'touch') setIsTouchDevice(true);
    resetAutoScroll();

    if (isCurveTransitioning) {
      setIsCurveTransitioning(false);
      if (curveTimerRef.current) clearTimeout(curveTimerRef.current);
    }

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startScrollRef.current = targetScrollRef.current;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;

    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') setIsTouchDevice(true);
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    if (tailPosRef.current.x < 0) {
      tailPosRef.current = { x: e.clientX + 16, y: e.clientY + 16 };
    }
    if (!isHoveringStage) setIsHoveringStage(true);

    if (!isDraggingRef.current || displayTotal === 0) return;

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 8) {
      velocityRef.current = (e.clientX - lastXRef.current) / dt;
      lastXRef.current = e.clientX;
      lastTimeRef.current = now;
    }

    const diffX = e.clientX - startXRef.current;
    const diffY = e.clientY - startYRef.current;
    const dist = Math.hypot(diffX, diffY);
    if (dist > 8) {
      hasDraggedRef.current = true;
      setIsDragging(true);
      setIsHoveringCenterCard(false);
      try {
        if (!containerRef.current?.hasPointerCapture(e.pointerId)) {
          containerRef.current?.setPointerCapture(e.pointerId);
        }
      } catch {}
    }

    const curStep = effectiveFisheye ? 180 : step;
    const maxScroll = displayTotal - 1;
    const rawTarget = startScrollRef.current - diffX / curStep;
    if (rawTarget > maxScroll) {
      targetScrollRef.current = maxScroll + (rawTarget - maxScroll) * 0.35;
    } else {
      targetScrollRef.current = rawTarget;
    }
  };

  const handlePointerUp = (e?: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (e) {
      try {
        if (containerRef.current?.hasPointerCapture(e.pointerId)) {
          containerRef.current?.releasePointerCapture(e.pointerId);
        }
      } catch {}
    }

    // Direct card tap or click selection
    if (!hasDraggedRef.current && clickedCardRef.current && e) {
      const dist = Math.hypot(
        e.clientX - clickedCardRef.current.startX,
        e.clientY - clickedCardRef.current.startY
      );
      if (dist < 12) {
        const { project: card, isActive, slot } = clickedCardRef.current;
        if (isActive) {
          playShutter();
          onSelectProject(card);
        } else {
          // If clicked on non-center card, bring smoothly to center
          playTick();
          targetScrollRef.current = Math.min(displayTotal - 1, slot);
          setCurrentIndex(card.originalIndex);
        }
        clickedCardRef.current = null;
        return;
      }
    }
    clickedCardRef.current = null;

    const curStep = effectiveFisheye ? 180 : step;
    const maxScroll = displayTotal - 1;
    // Cushioned fling momentum calculation
    const velocity = velocityRef.current; // px per ms
    const momentum = (velocity * 160) / curStep;
    const nextTarget = Math.round(targetScrollRef.current - momentum);

    // If already at or past the last slide, and swiping left (advancing forward into services)
    const draggedLeftPastEnd =
      Math.round(smoothScrollRef.current) >= maxScroll &&
      (startXRef.current - (e?.clientX ?? startXRef.current) > 35 || velocity < -0.25 || momentum < -0.3);

    if (draggedLeftPastEnd) {
      if (onOpenServices) {
        onOpenServices();
      }
      targetScrollRef.current = maxScroll;
    } else {
      targetScrollRef.current = Math.min(maxScroll, nextTarget);
    }
    resetAutoScroll();
  };

  if (projects.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 font-mono">
        NO WORKS MATCH FILTER
      </div>
    );
  }

  return (
    <div
      id="slider-stage"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'touch') {
          mousePosRef.current = { x: e.clientX, y: e.clientY };
          if (tailPosRef.current.x < 0) {
            tailPosRef.current = { x: e.clientX + 16, y: e.clientY + 16 };
          }
          setIsHoveringStage(true);
        }
      }}
      onPointerLeave={() => {
        setIsHoveringStage(false);
        setIsHoveringCenterCard(false);
      }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
    >
      {/* Smooth Dark Backdrop when Fisheye is active */}
      <div
        className={`fixed inset-0 bg-black pointer-events-none z-10 transition-opacity duration-700 ease-out ${
          effectiveFisheye ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Authentic Circular Fisheye Vignette (covers whole screen, smoothly fades and scales in/out) */}
      <div
        className={`fisheye-vignette ${
          effectiveFisheye ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
        }`}
      />

      {/* Subtle Ambient Curved Stage Illumination */}
      <div
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ease-out"
        style={{
          opacity: effectiveCurveMode !== 'off' && !effectiveFisheye ? 0.7 : 0,
          background:
            'radial-gradient(ellipse 70% 35% at 50% 50%, rgba(37, 84, 242, 0.035) 0%, rgba(246, 244, 238, 0.012) 35%, transparent 70%)',
        }}
      />

      {/* 3D Perspective Stage for Curved Ribbon */}
      <div
        id="slider-3d-scene"
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        style={{
          perspective: '1250px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          id="slider-3d-track"
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {visibleCards.map((project) => {
            // Linear bounded continuous offset around scrollPos (infinite on the left, bounded on the right)
            const continuousOffset = project.slot - scrollPos;

            const isActive = Math.abs(continuousOffset) < 0.48;

            // Frames up to 8.5 steps away during curve transition on desktop, 7.0 normally, 2.5 on mobile are rendered
            const isFarOffscreen = isMobile
              ? Math.abs(continuousOffset) > 2.5
              : Math.abs(continuousOffset) > (isCurveTransitioning ? 8.5 : 7.0);
            if (isFarOffscreen) return null;

            const width = effectiveFisheye && isActive
              ? frameDimensions.fisheyeSize
              : frameDimensions.width;
            const height = effectiveFisheye && isActive ? frameDimensions.fisheyeSize : frameDimensions.height;

            let targetX = 0;
            let targetY = 0;
            let targetZ = 0;
            let rotY = 0;
            let rotZ = 0;
            let scale = 1;

            if (effectiveFisheye) {
              if (isActive) {
                targetX = continuousOffset * (step * 0.35);
                scale = 1;
              } else {
                targetX = continuousOffset * (step + 280);
                scale = 0.85;
                targetZ = -220;
              }
            } else if (effectiveCurveMode === 'arch') {
              if (isMobile) {
                // Mobile Full-screen Arch Effect:
                // Active center card is completely flush, flat, level, and 100% full-screen.
                // The incoming and outgoing cards follow an arch trajectory with subtle tilt and vertical sweep.
                const archThetaStep = 8.5 * (Math.PI / 180);
                const angleRad = continuousOffset * archThetaStep;
                const angleDeg = continuousOffset * 8.5;
                const archRadius = Math.max(1100, (step * 0.98) / Math.sin(archThetaStep));

                targetX = archRadius * Math.sin(angleRad);
                targetY = archRadius * (1 - Math.cos(angleRad)) * 0.65 + Math.pow(Math.abs(continuousOffset), 1.6) * 44;
                targetZ = -Math.abs(continuousOffset) * 50;
                rotZ = angleDeg;
                rotY = -continuousOffset * 3.8;
                scale = 1 - Math.min(0.08, Math.abs(continuousOffset) * 0.035);
              } else {
                // Desktop Fanned Arch / Rainbow Bridge mode matching user reference screenshot
                const archThetaStep = 9.8 * (Math.PI / 180);
                const angleRad = continuousOffset * archThetaStep;
                const angleDeg = continuousOffset * 9.8;
                const archRadius = Math.max(1500, (step * 0.98) / Math.sin(archThetaStep));

                targetX = archRadius * Math.sin(angleRad);
                targetY = archRadius * (1 - Math.cos(angleRad)) - 32;
                targetZ = -Math.abs(continuousOffset) * 22;
                rotZ = angleDeg;
                rotY = -continuousOffset * 3.5;
                scale = 1 - Math.min(0.08, Math.abs(continuousOffset) * 0.022);
              }
            } else if (effectiveCurveMode === 'arc') {
              // Concave Panoramic Ribbon: sides curve backward into depth and face toward center
              const baseAngleStep = Math.min(0.30, Math.max(0.18, step / radius));
              const sign = Math.sign(continuousOffset);
              const abs = Math.abs(continuousOffset);
              // Soft compression on outer frames for a cinema-grade panoramic wrap
              const taperedOffset = sign * (abs <= 2.5 ? abs : 2.5 + Math.pow(abs - 2.5, 0.72));
              const angleRad = taperedOffset * baseAngleStep;
              const angleDeg = angleRad * (180 / Math.PI);

              targetX = radius * Math.sin(angleRad);
              targetZ = radius * (Math.cos(angleRad) - 1);
              rotY = -angleDeg;
              rotZ = 0;
              targetY = 0;
            } else if (effectiveCurveMode === 'cylinder') {
              // Convex Cylinder Carousel: sides wrap around outward cylinder drum
              const baseAngleStep = Math.min(0.28, Math.max(0.18, step / radius));
              const sign = Math.sign(continuousOffset);
              const abs = Math.abs(continuousOffset);
              const taperedOffset = sign * (abs <= 2.5 ? abs : 2.5 + Math.pow(abs - 2.5, 0.72));
              const angleRad = taperedOffset * baseAngleStep;
              const angleDeg = angleRad * (180 / Math.PI);

              const centerProminence = Math.max(0, 1 - Math.abs(continuousOffset));

              targetX = radius * Math.sin(angleRad);
              // Elevate the center card forward and push sides into depth so the center card stays cleanly in front without clipping
              targetZ =
                -radius * (1 - Math.cos(angleRad)) * 1.05 -
                Math.abs(taperedOffset) * 28 +
                centerProminence * 85;
              rotY = angleDeg * 0.85;
              rotZ = 0;
              targetY = 0;
              scale = 1 - Math.min(0.06, Math.abs(continuousOffset) * 0.015);
            } else {
              // Flat linear conveyor
              targetX = continuousOffset * step;
              targetZ = 0;
              rotY = 0;
              rotZ = 0;
            }

            const opacity = effectiveFisheye ? (isActive ? 1 : 0) : 1;
            const pointerEvents = effectiveFisheye ? (isActive ? 'auto' : 'none') : 'auto';
            const zIndex = isMobile
              ? isActive
                ? 30
                : Math.max(1, 20 - Math.round(Math.abs(continuousOffset)))
              : Math.max(1, 100 - Math.round(Math.abs(continuousOffset) * 6));

            return (
              <div
                key={project.virtualKey}
                id={`frame-card-${project.virtualKey}`}
                onPointerEnter={() => {
                  if (isActive && !isDraggingRef.current) {
                    setIsHoveringCenterCard(true);
                  } else {
                    setIsHoveringCenterCard(false);
                  }
                }}
                onPointerLeave={() => {
                  if (isActive) {
                    setIsHoveringCenterCard(false);
                  }
                }}
                onPointerDown={(e) => {
                  if (e.button !== 0 && e.pointerType === 'mouse') return;
                  clickedCardRef.current = {
                    project,
                    startX: e.clientX,
                    startY: e.clientY,
                    continuousOffset,
                    isActive,
                    slot: project.slot,
                  };
                }}
                onPointerUp={(e) => {
                  if (e.button !== 0 && e.pointerType === 'mouse') return;
                  if (
                    clickedCardRef.current &&
                    clickedCardRef.current.project.virtualKey === project.virtualKey
                  ) {
                    const dist = Math.hypot(
                      e.clientX - clickedCardRef.current.startX,
                      e.clientY - clickedCardRef.current.startY
                    );
                    if (dist < 10) {
                      if (isActive) {
                        playShutter();
                        onSelectProject(project);
                      } else {
                        // Non-center card clicked: bring smoothly to center
                        playTick();
                        targetScrollRef.current = Math.min(displayTotal - 1, project.slot);
                        setCurrentIndex(project.originalIndex);
                      }
                      clickedCardRef.current = null;
                    }
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isActive) {
                    playShutter();
                    onSelectProject(project);
                  } else {
                    // Non-center card clicked: bring smoothly to center
                    playTick();
                    targetScrollRef.current = Math.min(displayTotal - 1, project.slot);
                    setCurrentIndex(project.originalIndex);
                  }
                }}
                style={{
                  width: isMobile ? '100vw' : `${width}px`,
                  height: isMobile ? '100dvh' : `${height}px`,
                  marginLeft: isMobile ? '-50vw' : `-${width / 2}px`,
                  marginTop: isMobile ? '-50dvh' : `-${height / 2}px`,
                  transform: `translate3d(${targetX}px, ${targetY}px, ${targetZ}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  zIndex,
                  opacity,
                  pointerEvents,
                  boxShadow:
                    effectiveCurveMode === 'off'
                      ? '0 0 0 0 rgba(0,0,0,0)'
                      : isMobile
                      ? isActive
                        ? '0 0 0 0 rgba(0,0,0,0)'
                        : '0 20px 45px -10px rgba(0,0,0,0.85)'
                      : isActive
                      ? '0 25px 60px -15px rgba(0,0,0,0.95)'
                      : effectiveCurveMode === 'arch'
                      ? '0 20px 45px -10px rgba(0,0,0,0.85)'
                      : '0 15px 35px -10px rgba(0,0,0,0.85)',
                  transition:
                    isCurveTransitioning && !isDragging
                      ? 'transform 0.95s cubic-bezier(0.16, 1, 0.3, 1), width 0.8s cubic-bezier(0.16, 1, 0.3, 1), height 0.8s cubic-bezier(0.16, 1, 0.3, 1), margin 0.8s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.95s cubic-bezier(0.16, 1, 0.3, 1)'
                      : 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1), height 0.7s cubic-bezier(0.16, 1, 0.3, 1), margin 0.7s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                  willChange: 'transform',
                }}
                className={`select-none overflow-hidden cursor-pointer rounded-none ${
                  isMobile
                    ? 'filter-none'
                    : isActive
                    ? 'filter-none'
                    : effectiveCurveMode === 'arch'
                    ? 'filter grayscale contrast-90 brightness-90 hover:brightness-100'
                    : 'filter grayscale contrast-90 brightness-90'
                }`}
              >
                {/* Media in Frame (plays on hover for video) */}
                <SliderCardMedia
                  project={project}
                  isActive={isActive}
                  distance={Math.abs(continuousOffset)}
                  curveMode={effectiveCurveMode}
                  fisheyeOn={effectiveFisheye}
                  isDragging={isDragging}
                  paused={paused}
                />

                {/* Mobile Overlapped Project Name & Info (hidden on desktop, finely balanced vertical offset) */}
                <div className="md:hidden absolute bottom-0 inset-x-0 z-30 pointer-events-none pb-[max(3.5rem,calc(env(safe-area-inset-bottom)+2.5rem))] pt-32 px-6 bg-gradient-to-t from-black/95 via-black/55 to-transparent flex flex-col items-start justify-end">
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#fcf8ef] leading-tight drop-shadow-md">
                    {project.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {project.client && (
                      <span className="text-xs text-[#c7c4bd] font-mono tracking-wide uppercase">
                        {project.client}
                      </span>
                    )}
                    {project.client && project.tag && (
                      <span className="text-xs text-[#737373] font-mono">•</span>
                    )}
                    {project.tag && (
                      <span className="text-xs text-[#c7c4bd] font-mono tracking-wide uppercase">
                        {project.tag}
                      </span>
                    )}
                  </div>

                  {project.originalIndex === displayTotal - 1 && isLastSlide && (
                    <div
                      className="mt-3 pointer-events-auto inline-flex md:hidden items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 border border-white/20 backdrop-blur-md cursor-pointer active:scale-95 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTick();
                        onOpenServices?.();
                      }}
                    >
                      <span className="text-xs font-mono tracking-wider uppercase text-white font-medium">
                        Scroll for services
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#FF9B00]" />
                    </div>
                  )}
                </div>

                {/* 3D Mode Framing Border Overlay - smoothly fades out to zero in off mode so it never affects content sizing */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-900 ease-out"
                  style={{
                    border: '1px solid',
                    borderColor:
                      isActive
                        ? 'rgba(255, 255, 255, 0.15)'
                        : effectiveCurveMode === 'arch'
                        ? 'rgba(255, 255, 255, 0.10)'
                        : 'rgba(255, 255, 255, 0.05)',
                    opacity: isMobile || effectiveCurveMode === 'off' ? 0 : 1,
                  }}
                />

                {/* 3D Atmospheric Depth Shading Overlay across curve (used for arc/cylinder) */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-900 ease-out"
                  style={{
                    background:
                      continuousOffset > 0.05
                        ? 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 100%)'
                        : continuousOffset < -0.05
                        ? 'linear-gradient(to left, transparent 0%, rgba(0,0,0,0.6) 100%)'
                        : 'none',
                    opacity:
                      isMobile || isActive || effectiveCurveMode === 'off' || effectiveCurveMode === 'arch' || effectiveFisheye
                        ? 0
                        : Math.min(0.68, Math.pow(Math.abs(continuousOffset) / 3.2, 1.2) * 0.72),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* "Scroll for services" Instruction Cue on desktop right edge when at the end of slides */}
      <div
        id="scroll-for-services-cue"
        className={`hidden md:flex fixed right-6 sm:right-10 top-1/2 -translate-y-1/2 z-40 items-center gap-3 cursor-pointer group select-none transition-all duration-700 ease-out ${
          isLastSlide && !isDragging
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 translate-x-6 pointer-events-none'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          playTick();
          onOpenServices?.();
        }}
      >
        <div className="flex flex-col items-end">
          <span className="text-xs sm:text-[13px] font-mono tracking-wider uppercase text-[#c7c4bd] group-hover:text-white transition-colors">
            Scroll for services
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#737373] group-hover:text-[#FF9B00] transition-colors">
            Next section
          </span>
        </div>
        <div className="w-8 h-8 rounded-full border border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:bg-[#FF9B00] group-hover:border-[#FF9B00] transition-all duration-300">
          <ArrowRight className="w-4 h-4 text-white transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Delayed Mouse Tail "View project" Badge portaled directly to document.body so pointer distance is 100% identical in both normal and fisheye modes */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={followerRef}
            id="cursor-tail-view-project"
            className="fixed top-0 left-0 pointer-events-none z-50 will-change-transform select-none hidden md:block"
            style={{
              transform: 'translate3d(-300px, -300px, 0)',
              opacity: isHoveringCenterCard && !isDragging && !isTouchDevice ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <div className="corner-box-sm px-2.5 py-1 flex items-center justify-center bg-[#111111]/90 backdrop-blur-md shadow-xl border border-white/10">
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-white uppercase font-mono whitespace-nowrap">
                View project
              </span>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
