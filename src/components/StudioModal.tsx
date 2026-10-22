import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STUDIO_INFO, TEAM_MEMBERS } from '../data/projects';
import { isModalTransitionActive } from '../services/modalTransition';
import logoYellow from '../assets/Logo/logo-yellow.png';
import founderImage from '../assets/Founder/founder1.jpg';

interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSwitchingPage?: boolean;
  zIndex?: number;
}

const slideVariants = {
  initial: { x: '100%', opacity: 1 },
  animate: {
    x: '0%',
    opacity: 1,
    transition: {
      duration: 1.15,
      ease: [0.14, 1, 0.22, 1] as const,
    },
  },
  exit: (custom?: unknown) => {
    const isSwitching = Boolean(custom) || isModalTransitionActive();
    if (isSwitching) {
      return {
        x: '0%',
        opacity: 1,
        transition: { delay: 1.1, duration: 0.05 },
      };
    }
    return {
      x: '100%',
      opacity: 1,
      transition: { duration: 0.95, delay: 0.45, ease: [0.14, 1, 0.22, 1] as const },
    };
  },
};

const contentVariants = {
  initial: { x: '100%', opacity: 1 },
  animate: {
    x: '0%',
    opacity: 1,
    transition: {
      duration: 1.05,
      delay: 0.45,
      ease: [0.12, 1, 0.2, 1] as const,
    },
  },
  exit: (custom?: unknown) => {
    const isSwitching = Boolean(custom) || isModalTransitionActive();
    if (isSwitching) {
      return {
        x: '0%',
        opacity: 1,
        transition: { delay: 1.1, duration: 0.05 },
      };
    }
    return {
      x: '100%',
      opacity: 1,
      transition: { duration: 0.9, ease: [0.14, 1, 0.22, 1] as const },
    };
  },
};

export const StudioModal: React.FC<StudioModalProps> = ({
  isOpen,
  onClose,
  isSwitchingPage = false,
  zIndex = 10010,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === 'Backspace') && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const founder = TEAM_MEMBERS[0];
  const isSwitching = isSwitchingPage || isModalTransitionActive();

  return (
    <AnimatePresence custom={isSwitching}>
      {isOpen && (
        <motion.div
          key="studio-about-wrapper"
          custom={isSwitching}
          variants={{
            initial: {},
            animate: {},
            exit: {
              transition: {
                duration: isSwitching ? 1.2 : 1.5,
              },
            },
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ zIndex }}
          className="fixed inset-0 overflow-hidden pointer-events-auto"
        >
          {/* 1. SLIDE: Glides across and fully covers the entire screen first (solid, sharp slit) */}
          <motion.div
            key="slide-about"
            custom={isSwitching}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: 'transform', zIndex: zIndex + 2 }}
            className="fixed inset-0 bg-[#FF9B00] pointer-events-none"
          />

          {/* 2. ABOUT SCREEN: Arrives right behind yellow slide with silky smooth deceleration */}
          <motion.div
            id="studio-about-modal"
            key="about-content-slide"
            custom={isSwitching}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: 'transform', zIndex: zIndex + 5 }}
            className="fixed inset-0 pointer-events-auto flex flex-col justify-between bg-[#0e0e0e] px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 2xl:px-40 pt-24 sm:pt-28 pb-12 overflow-y-auto select-none"
            onClick={onClose}
          >
          <div
            className="max-w-5xl w-full mx-auto my-auto py-4 text-[#fcf8ef] flex flex-col items-center gap-8 md:gap-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Content Columns: Left (Logo, Bio & Clients) + Right (Founder) */}
            <div className="w-full flex flex-col md:flex-row items-start gap-10 md:gap-14">
              {/* Left Column: Logo + Typography + Bio + Clients */}
              <div className="flex-1 flex flex-col items-start">
                {/* 2. Studio Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 1.0, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full flex justify-start items-center mb-6"
                >
                  <img
                    src={logoYellow}
                    alt="ODD MANGO Logo"
                    loading="lazy"
                    decoding="async"
                    className="w-40 sm:w-48 md:w-56 h-auto max-w-full block object-contain filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
                  />
                </motion.div>

                {/* 3. Main Headline: Appears third (at 0.7s) */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.0, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight uppercase leading-tight mb-5"
                >
                  A boutique production studio with unyielding passion for storytelling<span className="text-[#FF9B00]">.</span>
                </motion.h1>

                {/* 4. Bio Text: Appears fourth (at 0.95s) */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.0, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
                  className="text-sm sm:text-base text-[#cbc7c2] font-normal leading-relaxed mb-8 max-w-2xl"
                >
                  {STUDIO_INFO.bio}
                </motion.p>

                {/* 6. Client Roster: Appears sixth (at 1.2s) */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.0, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="pt-6 border-t border-neutral-800/60 w-full"
                >
                  <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest mb-3">
                    <span>CLIENTS & COLLABORATORS</span>
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm uppercase font-mono text-[#cbc7c2]">
                    {STUDIO_INFO.trustedClients.map((client) => (
                      <span key={client.slug} className="hover:text-[#FF9B00] transition-colors cursor-default">
                        {client.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Founder Portrait — Appears fifth (at 0.85s) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92, x: 24 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1.1, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="w-full sm:w-72 md:w-80 shrink-0 flex flex-col gap-3 md:-mt-12"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-neutral-900 border border-white/10 hover:border-[#FF9B00]/40 transition-colors shadow-2xl">
                  <img
                    src={founderImage}
                    alt={founder?.name || 'Founder'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover grayscale contrast-105 hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="flex flex-col text-xs font-mono pt-1 gap-0.5">
                  <span className="text-[#fcf8ef] uppercase font-bold tracking-wider">
                    {founder?.name || 'Omkar Janvekar'}
                  </span>
                  <span className="text-neutral-400 uppercase tracking-wide">
                    <span>{founder?.role || 'Founder & Creative Director'}</span>
                  </span>
                  <a
                    href={`mailto:${founder?.email || 'oddmangomedia@gmail.com'}`}
                    className="text-neutral-400 hover:text-[#FF9B00] transition-colors"
                  >
                    {founder?.email || 'oddmangomedia@gmail.com'}
                  </a>
                  <a
                    href={`tel:${(founder?.phone || '+91 93706 02824').replace(/\s+/g, '')}`}
                    className="text-neutral-400 hover:text-[#FF9B00] transition-colors"
                  >
                    {founder?.phone || '+91 93706 02824'}
                  </a>
                </div>
              </motion.div>
            </div>
          </div>

          {/* 7. Bottom Information: Appears seventh (at 1.4s) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-neutral-500 border-t border-neutral-900/60 pt-4 shrink-0 mt-6"
            onClick={(e) => e.stopPropagation()}
          >
            <span>© 2016–2026 ODD MANGO <span className="text-[#FF9B00]">&bull;</span> PRODUCTION STUDIO</span>
            <span className="text-[#cbc7c2] uppercase">PUNE, MAHARASHTRA</span>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="mailto:oddmangomedia@gmail.com"
                className="text-[#cbc7c2] hover:text-[#FF9B00] transition-colors uppercase"
              >
                ODDMANGOMEDIA@GMAIL.COM
              </a>
              <span className="text-neutral-700">&bull;</span>
              <a
                href="tel:+919370602824"
                className="text-[#fcf8ef] font-semibold text-xs sm:text-[13px] tracking-wide hover:text-[#FF9B00] transition-colors inline-flex items-center gap-1.5"
              >
                <span className="text-[#FF9B00] font-bold">TEL:</span>
                <span>+91 93706 02824</span>
              </a>
            </div>
          </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
