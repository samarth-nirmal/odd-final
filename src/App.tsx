import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ViewMode, Project } from './types';
import { PROJECTS, STILL_PROJECTS, ALL_PROJECTS } from './data/projects';
import { Header } from './components/Header';
import { SliderView } from './components/SliderView';
import { ListView } from './components/ListView';
import { SoundIntro } from './components/SoundIntro';
import { Footer } from './components/Footer';
import { loadSoundAssets, setSoundEnabled } from './services/audio';
import { getImageRGB } from './services/colorExtractor';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { setModalTransitionActive } from './services/modalTransition';

import { FullscreenVideoModal } from './components/FullscreenVideoModal';
import { StillGalleryModal } from './components/StillGalleryModal';
import { StudioModal } from './components/StudioModal';
import { ContactModal } from './components/ContactModal';
import { ServicesModal } from './components/ServicesModal';

export default function App() {
  const [showSoundIntro, setShowSoundIntro] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [gesturesOn, setGesturesOn] = useState(true);
  const [fisheyeOn, setFisheyeOn] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  
  // Independent index tracking for video slider and stills slider
  const [videoIndex, setVideoIndex] = useState(0);
  const [stillsIndex, setStillsIndex] = useState(0);
  const [listIndex, setListIndex] = useState(0);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSwitchingVideo, setIsSwitchingVideo] = useState(false);
  const [isSwitchingModal, setIsSwitchingModal] = useState(false);

  // Independent per-modal z-indices so the opening modal is ALWAYS on top regardless of DOM order
  const [aboutZIndex, setAboutZIndex] = useState(10010);
  const [servicesZIndex, setServicesZIndex] = useState(10010);
  const [contactZIndex, setContactZIndex] = useState(10010);
  const nextZIndexRef = useRef(10015);

  const bringModalToFront = (modal: 'about' | 'services' | 'contact') => {
    nextZIndexRef.current += 10;
    if (nextZIndexRef.current > 10900) {
      nextZIndexRef.current = 10020;
    }
    const z = nextZIndexRef.current;
    if (modal === 'about') setAboutZIndex(z);
    else if (modal === 'services') setServicesZIndex(z);
    else if (modal === 'contact') setContactZIndex(z);
    return z;
  };

  // Auto-reset transition flags after entrance animations settle
  useEffect(() => {
    if (isSwitchingVideo) {
      const t = setTimeout(() => setIsSwitchingVideo(false), 900);
      return () => clearTimeout(t);
    }
  }, [isSwitchingVideo, selectedProject]);

  useEffect(() => {
    if (isSwitchingModal) {
      const t = setTimeout(() => {
        setIsSwitchingModal(false);
        setModalTransitionActive(false);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [isSwitchingModal]);

  // Preload sound on startup and schedule idle prefetch of secondary modal chunks
  useEffect(() => {
    loadSoundAssets().catch(() => {});

    const prefetchModals = () => {
      import('./components/StillGalleryModal');
      import('./components/FullscreenVideoModal');
      import('./components/StudioModal');
      import('./components/ContactModal');
      import('./components/ServicesModal');
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(prefetchModals);
      } else {
        setTimeout(prefetchModals, 2500);
      }
    }
  }, []);

  // Determine current active project collection based on viewMode
  const filteredProjects = useMemo(() => {
    if (viewMode === 'stills') return STILL_PROJECTS;
    if (viewMode === 'list') return ALL_PROJECTS;
    return PROJECTS;
  }, [viewMode]);

  const currentIndex = useMemo(() => {
    if (viewMode === 'stills') return stillsIndex;
    if (viewMode === 'list') return listIndex;
    return videoIndex;
  }, [viewMode, stillsIndex, listIndex, videoIndex]);

  const setCurrentIndex = (idx: number) => {
    if (viewMode === 'stills') {
      setStillsIndex(idx);
    } else if (viewMode === 'list') {
      setListIndex(idx);
    } else {
      setVideoIndex(idx);
    }
  };

  const currentProject = filteredProjects[currentIndex] || filteredProjects[0] || null;

  // Extract dim color for the project currently at the center
  const centerRGB = useMemo(() => {
    return getImageRGB(currentProject?.image, currentProject?.slug);
  }, [currentProject]);

  // Next & previous project navigation inside lightbox
  const currentProjectIndex = useMemo(() => {
    if (!selectedProject) return -1;
    return filteredProjects.findIndex((p) => p.id === selectedProject.id);
  }, [selectedProject, filteredProjects]);

  const nextProject = useMemo(() => {
    if (!selectedProject || currentProjectIndex === -1) return null;
    if (selectedProject.type === 'motion' || Boolean(selectedProject.video)) {
      // For video lightbox: prefer next video project
      for (let i = 1; i <= filteredProjects.length; i++) {
        const candidate = filteredProjects[(currentProjectIndex + i) % filteredProjects.length];
        if (candidate.type === 'motion' || Boolean(candidate.video)) {
          return candidate;
        }
      }
    }
    const nextIdx = (currentProjectIndex + 1) % filteredProjects.length;
    return filteredProjects[nextIdx] || null;
  }, [selectedProject, currentProjectIndex, filteredProjects]);

  const handleNextProject = () => {
    if (!nextProject) return;
    setIsSwitchingVideo(true);
    const nextIdx = filteredProjects.findIndex((p) => p.id === nextProject.id);
    if (nextIdx !== -1) {
      setCurrentIndex(nextIdx);
    }
    setSelectedProject(nextProject);
  };

  const handleSoundIntroDismiss = (withSound: boolean) => {
    setSoundOn(withSound);
    setSoundEnabled(withSound);
    setShowSoundIntro(false);
  };

  // Global shortcut: Upon pressing Backspace or Escape from service, About, Contact, or any video-playing page, navigate to the active slider page
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Escape') {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if ((activeTag === 'input' || activeTag === 'textarea') && e.key === 'Backspace') {
          return;
        }

        const isOverlayOpen = Boolean(
          isAboutOpen || isServicesOpen || isContactOpen || selectedProject
        );

        if (isOverlayOpen) {
          e.preventDefault();
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          }
          setModalTransitionActive(false);
          setIsSwitchingModal(false);
          setIsSwitchingVideo(false);
          setIsAboutOpen(false);
          setIsServicesOpen(false);
          setIsContactOpen(false);
          setSelectedProject(null);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isAboutOpen, isServicesOpen, isContactOpen, selectedProject]);

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden text-[#f6f4ee] select-none flex flex-col justify-between selection:bg-[#FF9B00] selection:text-black">
      {/* Silky-smooth Dual-Layer Ambient Backdrop */}
      <AmbientBackdrop rgb={centerRGB} mode="dark" duration={900} />

      {/* Start Screen Gatekeeper with Exit Animation */}
      <AnimatePresence>
        {showSoundIntro && <SoundIntro key="sound-intro" onEnter={handleSoundIntroDismiss} />}
      </AnimatePresence>

      {/* Main Screen Content with Staggered Object-by-Object Reveal */}
      <div className="w-full h-full flex flex-col justify-between">
        {/* Top Minimal Chrome Navigation */}
        <motion.div
          animate={{
            opacity: showSoundIntro ? 0 : 1,
            y: showSoundIntro ? -16 : 0,
          }}
          transition={{
            duration: 1.0,
            delay: showSoundIntro ? 0 : 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`fixed top-0 inset-x-0 z-[30000] pointer-events-none ${
            selectedProject ? 'hidden md:block' : ''
          }`}
        >
          <Header
            viewMode={viewMode}
            setViewMode={setViewMode}
            isVideoOpen={Boolean(selectedProject)}
            onOpenAbout={() => {
              const isAnyOtherOpen = isServicesOpen || isContactOpen;
              bringModalToFront('about');
              if (isAnyOtherOpen) {
                setModalTransitionActive(true, 1200);
                setIsSwitchingModal(true);
              } else {
                setModalTransitionActive(false);
                setIsSwitchingModal(false);
              }
              setIsServicesOpen(false);
              setIsContactOpen(false);
              setIsAboutOpen(true);
            }}
            onOpenServices={() => {
              const isAnyOtherOpen = isAboutOpen || isContactOpen;
              bringModalToFront('services');
              if (isAnyOtherOpen) {
                setModalTransitionActive(true, 1200);
                setIsSwitchingModal(true);
              } else {
                setModalTransitionActive(false);
                setIsSwitchingModal(false);
              }
              setIsAboutOpen(false);
              setIsContactOpen(false);
              setIsServicesOpen(true);
            }}
            onOpenContact={() => {
              const isAnyOtherOpen = isAboutOpen || isServicesOpen;
              bringModalToFront('contact');
              if (isAnyOtherOpen) {
                setModalTransitionActive(true, 1200);
                setIsSwitchingModal(true);
              } else {
                setModalTransitionActive(false);
                setIsSwitchingModal(false);
              }
              setIsAboutOpen(false);
              setIsServicesOpen(false);
              setIsContactOpen(true);
            }}
            onCloseModals={() => {
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
              }
              setModalTransitionActive(false);
              setIsSwitchingModal(false);
              setIsAboutOpen(false);
              setIsServicesOpen(false);
              setIsContactOpen(false);
            }}
            isAboutOpen={isAboutOpen}
            isServicesOpen={isServicesOpen}
            isContactOpen={isContactOpen}
            soundOn={soundOn}
            setSoundOn={setSoundOn}
          />
        </motion.div>

        {/* Hero Section / Main Stage (Gallery / Slider): Appears promptly upon video finish */}
        <motion.main
          animate={{
            opacity: showSoundIntro ? 0 : 1,
            scale: showSoundIntro ? 0.95 : 1,
            y: showSoundIntro ? 16 : 0,
          }}
          transition={{
            duration: 1.2,
            delay: 0,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden"
        >
          {/* Active Slider View: displays video projects when on 'slider' or still photography when on 'stills' */}
          {(viewMode === 'slider' || viewMode === 'stills') && (
            <SliderView
              key={`slider-${viewMode}`}
              projects={filteredProjects}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              onSelectProject={(proj) => setSelectedProject(proj)}
              onOpenServices={() => {
                bringModalToFront('services');
                setModalTransitionActive(false);
                setIsSwitchingModal(false);
                setIsServicesOpen(true);
              }}
              fisheyeOn={fisheyeOn}
              curveMode="arch"
              paused={showSoundIntro || Boolean(selectedProject) || isAboutOpen || isContactOpen || isServicesOpen}
            />
          )}

          {viewMode === 'list' && (
            <ListView
              projects={filteredProjects}
              onSelectProject={(proj) => setSelectedProject(proj)}
              currentIndex={currentIndex}
              onHoverIndex={setCurrentIndex}
            />
          )}
        </motion.main>

        {/* Bottom Minimal Chrome */}
        <motion.div
          animate={{
            opacity: showSoundIntro ? 0 : 1,
            y: showSoundIntro ? 16 : 0,
          }}
          transition={{
            duration: 1.0,
            delay: showSoundIntro ? 0 : 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed bottom-0 inset-x-0 z-40 pointer-events-none"
        >
          <Footer
            currentProject={currentProject}
            projects={filteredProjects}
            currentIndex={currentIndex}
            onSelectIndex={setCurrentIndex}
            fisheyeOn={fisheyeOn}
            setFisheyeOn={setFisheyeOn}
            soundOn={soundOn}
            setSoundOn={setSoundOn}
          />
        </motion.div>
      </div>

      {/* Image Detailed Slide Screen (for stills) / Smooth Fullscreen Video Modal (for videos) */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {selectedProject && (selectedProject.type === 'motion' || Boolean(selectedProject.video)) && (
            <FullscreenVideoModal
              key={`video-${selectedProject.id}`}
              project={selectedProject}
              onClose={() => {
                setIsSwitchingVideo(false);
                setSelectedProject(null);
              }}
              soundOn={soundOn}
              setSoundOn={setSoundOn}
              totalProjectsCount={filteredProjects.length}
              onNextProject={handleNextProject}
              nextProject={nextProject}
              isSwitchingVideo={isSwitchingVideo}
            />
          )}

          {selectedProject && selectedProject.type !== 'motion' && !selectedProject.video && (
            <StillGalleryModal
              key="stills-active-viewer"
              project={selectedProject}
              projects={filteredProjects}
              onSelectProject={(proj) => {
                const idx = filteredProjects.findIndex((p) => p.id === proj.id);
                if (idx !== -1) {
                  setCurrentIndex(idx);
                }
                setSelectedProject(proj);
              }}
              onClose={() => {
                setSelectedProject(null);
              }}
              soundOn={soundOn}
              setSoundOn={setSoundOn}
              gesturesOn={gesturesOn}
              setGesturesOn={setGesturesOn}
              totalProjectsCount={filteredProjects.length}
            />
          )}
        </AnimatePresence>
      </Suspense>

      {/* Studio / About Modal */}
      <StudioModal
        isOpen={isAboutOpen}
        isSwitchingPage={isSwitchingModal}
        zIndex={aboutZIndex}
        onClose={() => {
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          }
          setModalTransitionActive(false);
          setIsSwitchingModal(false);
          setIsAboutOpen(false);
        }}
      />

      {/* Services Modal */}
      <ServicesModal
        isOpen={isServicesOpen}
        isSwitchingPage={isSwitchingModal}
        zIndex={servicesZIndex}
        onClose={() => {
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          }
          setModalTransitionActive(false);
          setIsSwitchingModal(false);
          setIsServicesOpen(false);
        }}
        onOpenContact={() => {
          bringModalToFront('contact');
          setModalTransitionActive(true, 1200);
          setIsSwitchingModal(true);
          setIsServicesOpen(false);
          setIsContactOpen(true);
        }}
      />

      {/* Contact Page Modal */}
      <ContactModal
        isOpen={isContactOpen}
        isSwitchingPage={isSwitchingModal}
        zIndex={contactZIndex}
        onClose={() => {
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          }
          setModalTransitionActive(false);
          setIsSwitchingModal(false);
          setIsContactOpen(false);
        }}
      />
    </div>
  );
}
