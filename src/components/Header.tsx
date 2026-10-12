import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Volume2, VolumeX, ArrowUpRight } from 'lucide-react';
import { ViewMode } from '../types';
import { playTick, setSoundEnabled } from '../services/audio';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenAbout: () => void;
  onOpenServices?: () => void;
  onOpenContact?: () => void;
  onCloseModals?: () => void;
  isAboutOpen?: boolean;
  isServicesOpen?: boolean;
  isContactOpen?: boolean;
  isVideoOpen?: boolean;
  soundOn?: boolean;
  setSoundOn?: (on: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  onOpenAbout,
  onOpenServices,
  onOpenContact,
  onCloseModals,
  isAboutOpen = false,
  isServicesOpen = false,
  isContactOpen = false,
  isVideoOpen = false,
  soundOn = true,
  setSoundOn,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile drawer immediately if a video is opened
  useEffect(() => {
    if (isVideoOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isVideoOpen]);

  const hasActiveModal = isAboutOpen || isServicesOpen || isContactOpen;
  const isHomePage = !hasActiveModal && (viewMode === 'slider' || viewMode === 'stills');

  // Monitor scroll position on window and any active scrollable container (modals, list view)
  useEffect(() => {
    // If on home page (slider or stills without active modals), strictly reset isScrolled to false
    if (isHomePage) {
      setIsScrolled(false);
      if (typeof window !== 'undefined') {
        if (window.scrollY > 0) {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        }
        if (document.documentElement && document.documentElement.scrollTop > 0) {
          document.documentElement.scrollTop = 0;
        }
        if (document.body && document.body.scrollTop > 0) {
          document.body.scrollTop = 0;
        }
      }
      return;
    }

    const checkScroll = () => {
      // Home page must NEVER have scroll background
      if (!isAboutOpen && !isServicesOpen && !isContactOpen && (viewMode === 'slider' || viewMode === 'stills')) {
        setIsScrolled(false);
        return;
      }

      // Check window scroll
      if (window.scrollY > 15 || (document.documentElement && document.documentElement.scrollTop > 15) || (document.body && document.body.scrollTop > 15)) {
        setIsScrolled(true);
        return;
      }

      // Check ONLY the actively open modal or view
      if (isAboutOpen) {
        const el = document.getElementById('studio-about-modal');
        if (el && el.scrollTop > 15) {
          setIsScrolled(true);
          return;
        }
      } else if (isServicesOpen) {
        const el = document.getElementById('studio-services-modal');
        if (el && el.scrollTop > 15) {
          setIsScrolled(true);
          return;
        }
      } else if (isContactOpen) {
        const el = document.getElementById('studio-contact-modal');
        if (el && el.scrollTop > 15) {
          setIsScrolled(true);
          return;
        }
      } else if (viewMode === 'list') {
        const el = document.getElementById('list-stage');
        if (el && el.scrollTop > 15) {
          setIsScrolled(true);
          return;
        }
      }

      setIsScrolled(false);
    };

    // Run check immediately on mount and whenever modal/view mode changes
    checkScroll();

    window.addEventListener('scroll', checkScroll, { passive: true });
    document.addEventListener('scroll', checkScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener('scroll', checkScroll);
      document.removeEventListener('scroll', checkScroll, { capture: true });
    };
  }, [isAboutOpen, isServicesOpen, isContactOpen, viewMode, hasActiveModal, isHomePage, isVideoOpen]);

  const handleModeChange = (mode: ViewMode) => {
    playTick();
    if (mode === 'slider' || mode === 'stills') {
      setIsScrolled(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      }
    }
    if (hasActiveModal && onCloseModals) {
      onCloseModals();
    }
    setViewMode(mode);
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    playTick();
    if (setSoundOn) {
      setSoundOn(next);
    }
    setSoundEnabled(next);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[30000] px-6 sm:px-10 pt-[max(1.25rem,calc(env(safe-area-inset-top)+0.5rem))] pb-3 sm:pb-3.5 pointer-events-none flex items-center justify-between text-sm sm:text-base font-medium tracking-tight transition-all duration-300 ease-out ${
          isVideoOpen ? 'hidden md:flex' : ''
        } ${
          isScrolled && !isHomePage
            ? 'bg-[#0c0d10]/85 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(0,0,0,0.85)] border-b border-neutral-800/60'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        {/* Left: Brand Logo */}
        <div className="flex items-start pointer-events-auto">
          <button
            onClick={() => {
              playTick();
              setIsScrolled(false);
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
              }
              if (hasActiveModal && onCloseModals) {
                onCloseModals();
              }
              setIsMobileMenuOpen(false);
              setViewMode('slider');
            }}
            className="text-3xl sm:text-4xl font-extrabold text-[#fcf8ef] tracking-tighter leading-none hover:opacity-75 transition-opacity cursor-pointer flex items-baseline"
          >
            <span>ODD MANGO</span>
            <sup className="text-sm font-bold ml-0.5">®</sup>
          </button>
        </div>

        {/* Center: View Toggles (SLIDER | STILLS | LIST) */}
        <div className="pointer-events-auto hidden md:flex items-center absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="flex items-center gap-5 sm:gap-7">
            {(['slider', 'stills', 'list'] as const).map((mode) => {
              const isActive = !hasActiveModal && viewMode === mode;
              return (
                <div key={mode} className="flex flex-col items-center">
                  <button
                    id={`view-toggle-${mode}`}
                    onClick={() => handleModeChange(mode)}
                    className={`uppercase font-bold tracking-tight text-sm sm:text-base transition-colors cursor-pointer ${
                      isActive ? 'text-[#f6f4ee]' : 'text-[#c7c4bd]/70 hover:text-[#f6f4ee]'
                    }`}
                  >
                    <span className="roll">
                      <span className="roll-inner">
                        <span className="roll-face">{mode}</span>
                        <span className="roll-face text-white">{mode}</span>
                      </span>
                    </span>
                  </button>

                  {/* Active underline indicator */}
                  <div className="h-[2px] flex items-center justify-center mt-[2px] w-full relative">
                    {isActive && (
                      <motion.div
                        layoutId="active-view-indicator-underline"
                        className="w-1/2 max-w-[20px] h-[2px] bg-[#FF9B00]"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Desktop Navigation (Services + About + Contact) */}
        <div className="pointer-events-auto hidden md:flex items-start gap-6 sm:gap-8">
          {/* SERVICES */}
          <div className="flex flex-col items-center">
            <button
              id="nav-services-btn"
              onClick={() => {
                playTick();
                if (isServicesOpen && onCloseModals) {
                  setIsScrolled(false);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                  }
                  onCloseModals();
                } else {
                  onOpenServices?.();
                }
              }}
              className={`text-xs sm:text-sm uppercase transition-colors cursor-pointer font-medium ${
                isServicesOpen ? 'text-[#fcf8ef]' : 'text-[#cbc7c2]/80 hover:text-[#fcf8ef]'
              }`}
            >
              <span className="roll">
                <span className="roll-inner">
                  <span className="roll-face">services</span>
                  <span className="roll-face text-white">services</span>
                </span>
              </span>
            </button>
            <div className="h-[2px] flex items-center justify-center mt-[2px] w-full relative">
              {isServicesOpen && (
                <motion.div
                  layoutId="active-view-indicator-underline"
                  className="w-1/2 max-w-[20px] h-[2px] bg-[#FF9B00]"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
            </div>
          </div>

          {/* ABOUT */}
          <div className="flex flex-col items-center">
            <button
              id="nav-about-btn"
              onClick={() => {
                playTick();
                if (isAboutOpen && onCloseModals) {
                  setIsScrolled(false);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                  }
                  onCloseModals();
                } else {
                  onOpenAbout();
                }
              }}
              className={`text-xs sm:text-sm uppercase transition-colors cursor-pointer font-medium ${
                isAboutOpen ? 'text-[#fcf8ef]' : 'text-[#cbc7c2]/80 hover:text-[#fcf8ef]'
              }`}
            >
              <span className="roll">
                <span className="roll-inner">
                  <span className="roll-face">about</span>
                  <span className="roll-face text-white">about</span>
                </span>
              </span>
            </button>
            <div className="h-[2px] flex items-center justify-center mt-[2px] w-full relative">
              {isAboutOpen && (
                <motion.div
                  layoutId="active-view-indicator-underline"
                  className="w-1/2 max-w-[20px] h-[2px] bg-[#FF9B00]"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
            </div>
          </div>

          {/* CONTACT */}
          <div className="flex flex-col items-center">
            <button
              id="nav-contact-btn"
              onClick={() => {
                playTick();
                if (isContactOpen && onCloseModals) {
                  setIsScrolled(false);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                  }
                  onCloseModals();
                } else {
                  onOpenContact?.();
                }
              }}
              className={`text-xs sm:text-sm uppercase transition-colors cursor-pointer font-medium ${
                isContactOpen ? 'text-[#fcf8ef]' : 'text-[#cbc7c2]/80 hover:text-[#fcf8ef]'
              }`}
            >
              <span className="roll">
                <span className="roll-inner">
                  <span className="roll-face">contact</span>
                  <span className="roll-face text-white">contact</span>
                </span>
              </span>
            </button>
            <div className="h-[2px] flex items-center justify-center mt-[2px] w-full relative">
              {isContactOpen && (
                <motion.div
                  layoutId="active-view-indicator-underline"
                  className="w-1/2 max-w-[20px] h-[2px] bg-[#FF9B00]"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right: Mobile Hamburger Button (Visible only on mobile screen) */}
        <div className="pointer-events-auto md:hidden">
          <button
            id="mobile-hamburger-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => {
              playTick();
              setIsMobileMenuOpen((prev) => !prev);
            }}
            className="p-2 -mr-2 flex items-center justify-center text-[#fcf8ef] hover:opacity-75 active:scale-90 transition-all cursor-pointer drop-shadow-md"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer / Overlay - Portaled directly to body to guarantee pointer-events and top z-index */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {!isVideoOpen && isMobileMenuOpen && (
              <motion.div
                id="mobile-nav-drawer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 z-[29000] bg-[#0c0d10]/98 backdrop-blur-2xl flex flex-col justify-between p-6 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.25rem))] pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.5rem))] select-none pointer-events-auto md:hidden"
              >
                {/* Drawer Center: Links & Controls */}
                <div className="flex flex-col gap-8 my-auto py-4">
                  {/* Primary Links */}
                  <div className="flex flex-col gap-6">
                    {/* WORKS */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTick();
                        setIsScrolled(false);
                        if (typeof window !== 'undefined') {
                          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                        }
                        setIsMobileMenuOpen(false);
                        if (hasActiveModal && onCloseModals) {
                          onCloseModals();
                        }
                        setViewMode('slider');
                      }}
                      className={`flex items-center justify-between text-left text-3xl sm:text-4xl font-black uppercase tracking-tight transition-colors cursor-pointer group pointer-events-auto ${
                        !hasActiveModal ? 'text-[#FF9B00]' : 'text-[#fcf8ef] hover:text-[#FF9B00] active:text-[#FF9B00]'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span>Works</span>
                        {!hasActiveModal && (
                          <div className="w-12 h-[2px] bg-[#FF9B00] mt-1" />
                        )}
                      </div>
                      <ArrowUpRight className={`transition-all ${!hasActiveModal ? 'opacity-100 text-[#FF9B00]' : 'opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1'}`} size={28} />
                    </button>

                    {/* SERVICES */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTick();
                        setIsMobileMenuOpen(false);
                        if (!isServicesOpen) {
                          onOpenServices?.();
                        }
                      }}
                      className={`flex items-center justify-between text-left text-3xl sm:text-4xl font-black uppercase tracking-tight transition-colors cursor-pointer group pointer-events-auto ${
                        isServicesOpen ? 'text-[#FF9B00]' : 'text-[#fcf8ef] hover:text-[#FF9B00] active:text-[#FF9B00]'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span>Services</span>
                        {isServicesOpen && (
                          <div className="w-12 h-[2px] bg-[#FF9B00] mt-1" />
                        )}
                      </div>
                      <ArrowUpRight className={`transition-all ${isServicesOpen ? 'opacity-100 text-[#FF9B00]' : 'opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1'}`} size={28} />
                    </button>

                    {/* ABOUT */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTick();
                        setIsMobileMenuOpen(false);
                        if (!isAboutOpen) {
                          onOpenAbout();
                        }
                      }}
                      className={`flex items-center justify-between text-left text-3xl sm:text-4xl font-black uppercase tracking-tight transition-colors cursor-pointer group pointer-events-auto ${
                        isAboutOpen ? 'text-[#FF9B00]' : 'text-[#fcf8ef] hover:text-[#FF9B00] active:text-[#FF9B00]'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span>About Studio</span>
                        {isAboutOpen && (
                          <div className="w-12 h-[2px] bg-[#FF9B00] mt-1" />
                        )}
                      </div>
                      <ArrowUpRight className={`transition-all ${isAboutOpen ? 'opacity-100 text-[#FF9B00]' : 'opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1'}`} size={28} />
                    </button>

                    {/* CONTACT */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTick();
                        setIsMobileMenuOpen(false);
                        if (!isContactOpen) {
                          onOpenContact?.();
                        }
                      }}
                      className={`flex items-center justify-between text-left text-3xl sm:text-4xl font-black uppercase tracking-tight transition-colors cursor-pointer group pointer-events-auto ${
                        isContactOpen ? 'text-[#FF9B00]' : 'text-[#fcf8ef] hover:text-[#FF9B00] active:text-[#FF9B00]'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span>Contact</span>
                        {isContactOpen && (
                          <div className="w-12 h-[2px] bg-[#FF9B00] mt-1" />
                        )}
                      </div>
                      <ArrowUpRight className={`transition-all ${isContactOpen ? 'opacity-100 text-[#FF9B00]' : 'opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1'}`} size={28} />
                    </button>
                  </div>

                  {/* Status & Options Card */}
                  <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                    {/* View Mode Toggle for Mobile */}
                    <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#c7c4bd]">
                      <span>View Mode</span>
                      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
                        {(['slider', 'stills', 'list'] as const).map((mode) => {
                          const isActive = !hasActiveModal && viewMode === mode;
                          return (
                            <button
                              key={mode}
                              onClick={() => {
                                playTick();
                                if (mode === 'slider' || mode === 'stills') {
                                  setIsScrolled(false);
                                  if (typeof window !== 'undefined') {
                                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
                                  }
                                }
                                setIsMobileMenuOpen(false);
                                if (hasActiveModal && onCloseModals) {
                                  onCloseModals();
                                }
                                setViewMode(mode);
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-mono uppercase transition-all ${
                                isActive
                                  ? 'bg-[#FF9B00] text-black font-bold'
                                  : 'text-[#c7c4bd] hover:text-white'
                              }`}
                            >
                              {mode}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-[#c7c4bd]">
                      <span>Audio Feedback</span>
                      <button
                        onClick={handleToggleSound}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-[#fcf8ef] active:scale-95 transition-all cursor-pointer pointer-events-auto"
                      >
                        {soundOn ? <Volume2 size={14} className="text-[#FF9B00]" /> : <VolumeX size={14} />}
                        <span>{soundOn ? 'SOUND : ON' : 'SOUND : OFF'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Drawer Bottom: Studio Location & Year */}
                <div className="pt-4 border-t border-white/10 flex flex-col gap-1 text-xs font-mono text-[#c7c4bd]/70 uppercase">
                  <div className="flex justify-between">
                    <span>Pune, Maharashtra</span>
                    <span>© 2026</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
