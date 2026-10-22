import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { STUDIO_INFO } from '../data/projects';
import { playTick } from '../services/audio';
import { isModalTransitionActive } from '../services/modalTransition';
import logoTransparent from '../assets/Logo/logo transparent.png';

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
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

interface ServiceItem {
  number: string;
  phase: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
}

const SERVICES_DATA: ServiceItem[] = [
  {
    number: '01',
    phase: 'FOUNDATION',
    title: 'Brand Films',
    tagline: 'Give your brand a story people can feel.',
    description: 'Cinematic films that capture who you are and why people should care.',
    deliverables: ['Brand Manifesto', 'Origin Story', 'Vision & Culture Films'],
  },
  {
    number: '02',
    phase: 'AMPLIFICATION',
    title: 'Commercials & Campaigns',
    tagline: 'Turn ideas into something people remember.',
    description: 'Concept-led films and campaigns built to make an impact.',
    deliverables: ['Campaign Narrative', 'Concept Development', 'Broadcast & Digital Cuts'],
  },
  {
    number: '03',
    phase: 'EXPERIENCE',
    title: 'Product & Lifestyle Films',
    tagline: 'Make what you sell look irresistible.',
    description: 'Cinematic visuals that bring products, spaces, and experiences to life.',
    deliverables: ['Sensory Macro Visuals', 'Atmospheric Lighting', 'World-Building'],
  },
  {
    number: '04',
    phase: 'CREDIBILITY',
    title: 'Corporate & Institutional Films',
    tagline: 'Say what you do differently.',
    description: 'Clear, human films that make businesses and ideas easier to understand.',
    deliverables: ['Investor & Partner Stories', 'Culture Documentaries', 'Executive Comms'],
  },
  {
    number: '05',
    phase: 'ELEVATION',
    title: 'Photography & Creative Design',
    tagline: 'Make every touchpoint feel like your brand.',
    description: 'Photography and design that extend your visual identity beyond video.',
    deliverables: ['Editorial Stills Sets', 'Visual Identity Cohesion', 'Campaign Key Art'],
  },
  {
    number: '06',
    phase: 'ACCELERATION',
    title: 'Social Media Content',
    tagline: 'Keep your brand moving.',
    description: 'Reels and short-form content built to hold attention and stay unmistakably yours.',
    deliverables: ['High-Retention Reels', 'Content Architecture', 'Visual Series & Sound'],
  },
];

export const ServicesModal: React.FC<ServicesModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
  isSwitchingPage = false,
  zIndex = 10010,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([0]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Handle keyboard ESC or Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === 'Backspace') && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle scroll-based roadmap progress & revealing
  useEffect(() => {
    if (!isOpen) {
      setRevealedIndices([0]);
      setFocusedIndex(0);
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollState = () => {
      const containerRect = container.getBoundingClientRect();
      const triggerY = containerRect.top + containerRect.height * 0.72; // reveals as item scrolls into upper 72%
      const focusTargetY = containerRect.top + containerRect.height * 0.45;

      let closestDist = Infinity;
      let closestIdx = 0;

      itemRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();

        // Reveal service as user scrolls down to it
        if (rect.top <= triggerY) {
          setRevealedIndices((prev) => (prev.includes(index) ? prev : [...prev, index]));
        }

        // Determine which item is centrally focused
        const itemCenter = rect.top + rect.height / 2;
        const dist = Math.abs(itemCenter - focusTargetY);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = index;
        }
      });

      setFocusedIndex(closestIdx);
    };

    // Initial check after paint
    const timer = setTimeout(() => {
      checkScrollState();
    }, 200);

    container.addEventListener('scroll', checkScrollState, { passive: true });
    return () => {
      clearTimeout(timer);
      container.removeEventListener('scroll', checkScrollState);
    };
  }, [isOpen]);

  const handleInquire = () => {
    playTick();
    if (onOpenContact) {
      onOpenContact();
    } else {
      onClose();
    }
  };

  // Compute how far along the roadmap line has been revealed
  const maxRevealed = Math.max(...revealedIndices, 0);
  const lineProgressPct = (maxRevealed / (SERVICES_DATA.length - 1)) * 100;

  const isSwitching = isSwitchingPage || isModalTransitionActive();

  return (
    <AnimatePresence custom={isSwitching}>
      {isOpen && (
        <motion.div
          key="studio-services-wrapper"
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
            key="slide-services"
            custom={isSwitching}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: 'transform', zIndex: zIndex + 2 }}
            className="fixed inset-0 bg-[#FF9B00] pointer-events-none"
          />

          {/* 2. SERVICES SCREEN: Arrives right behind yellow slide with silky smooth deceleration */}
          <motion.div
            ref={scrollContainerRef}
            id="studio-services-modal"
            key="services-content-slide"
            custom={isSwitching}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ willChange: 'transform', zIndex: zIndex + 5 }}
            className="fixed inset-0 pointer-events-auto flex flex-col justify-between bg-[#0e0e0e] px-6 sm:px-12 pt-24 sm:pt-28 pb-12 overflow-y-auto select-none text-[#fcf8ef]"
            onClick={onClose}
          >
            {/* Main Content Area */}
            <div
              className="max-w-6xl w-full mx-auto py-4 sm:py-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Section (Preserved top heading as requested) */}
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 pb-8 border-b border-neutral-800/80">
                <div className="max-w-2xl">
                  {/* Category Label */}
                  <motion.p
                    initial={{ opacity: 0, y: 10, letterSpacing: '0.12em' }}
                    animate={{ opacity: 1, y: 0, letterSpacing: '0.22em' }}
                    transition={{ duration: 0.9, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xs font-mono text-[#FF9B00] uppercase tracking-widest font-semibold mb-3"
                  >
                    <span>SERVICES</span>
                  </motion.p>

                  {/* Main Headline */}
                  <div className="flex items-start justify-between">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.0, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.08] text-[#fcf8ef] mb-5"
                    >
                      We make brands worth watching<span className="text-[#FF9B00]">.</span>
                    </motion.h1>
                  </div>

                  {/* Intro Paragraphs */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-2.5 text-sm sm:text-base text-[#cbc7c2] leading-relaxed font-normal"
                  >
                    <p>
                      From idea to final frame, we create video-led work that gives brands a stronger voice, sharper identity, and something worth remembering.
                    </p>
                    <p className="text-[#fcf8ef] font-medium">
                      We figure out how it should look, sound, and feel.
                    </p>
                  </motion.div>
                </div>

                {/* Inquire CTA Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  onClick={handleInquire}
                  className="px-5 py-2.5 bg-[#FF9B00] hover:bg-white text-black transition-all cursor-pointer font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-2 group shrink-0 rounded-sm shadow-md"
                >
                  <span>Contact Us</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </motion.button>
              </div>

              {/* SERVICES ROADMAP CONTAINER */}
              <div className="relative py-4 sm:py-6 mb-16">
                {/* 1. Desktop Central Line (Centered between left & right cards) */}
                <div className="hidden md:block absolute left-1/2 top-4 bottom-8 -translate-x-1/2 w-[2px] bg-neutral-800 pointer-events-none" />
                
                {/* Desktop Active Line Progress Fill (Solid Orange, No Glow) */}
                <div
                  className="hidden md:block absolute left-1/2 top-4 -translate-x-1/2 w-[2px] bg-[#FF9B00] pointer-events-none transition-all duration-700 ease-out"
                  style={{
                    height: `calc(${lineProgressPct}% + 1.5rem)`,
                    maxHeight: 'calc(100% - 2rem)',
                  }}
                />

                {/* 2. Mobile Left-Aligned Line */}
                <div className="md:hidden absolute left-5 sm:left-6 top-4 bottom-8 -translate-x-1/2 w-[2px] bg-neutral-800 pointer-events-none" />
                
                {/* Mobile Active Line Progress Fill (Solid Orange, No Glow) */}
                <div
                  className="md:hidden absolute left-5 sm:left-6 top-4 -translate-x-1/2 w-[2px] bg-[#FF9B00] pointer-events-none transition-all duration-700 ease-out"
                  style={{
                    height: `calc(${lineProgressPct}% + 1.5rem)`,
                    maxHeight: 'calc(100% - 2rem)',
                  }}
                />

                {/* 3. Alternating Diagonal Roadmap Steps */}
                <div className="space-y-12 sm:space-y-16 md:space-y-20">
                  {SERVICES_DATA.map((service, index) => {
                    const isLeft = index % 2 === 0;
                    const isRevealed = revealedIndices.includes(index);
                    const isFocused = focusedIndex === index || hoveredIndex === index;
                    const isActive = isRevealed || isFocused;

                    return (
                      <div
                        key={service.number}
                        ref={(el) => {
                          itemRefs.current[index] = el;
                        }}
                        data-index={index}
                        onMouseEnter={() => {
                          setHoveredIndex(index);
                          playTick();
                        }}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className="relative flex flex-col md:flex-row items-stretch md:items-center w-full"
                      >
                        {/* Roadmap Node Indicator on the Line (Solid Orange, No Glow) */}
                        {/* Desktop Node (Exact center of the line) */}
                        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 items-center justify-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-all duration-500 ${
                              isActive
                                ? 'bg-[#FF9B00] text-black border border-[#FF9B00]'
                                : 'bg-[#141414] text-neutral-500 border border-neutral-700/80 scale-90'
                            }`}
                          >
                            {service.number}
                          </div>
                        </div>

                        {/* Mobile Node (Positioned on the left mobile spine) */}
                        <div className="md:hidden absolute left-5 sm:left-6 top-8 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold transition-all duration-500 ${
                              isActive
                                ? 'bg-[#FF9B00] text-black border border-[#FF9B00]'
                                : 'bg-[#141414] text-neutral-500 border border-neutral-700 scale-90'
                            }`}
                          >
                            {service.number}
                          </div>
                        </div>

                        {/* DESKTOP ALTERNATING SIDES: */}
                        {/* Left Side: If isLeft, renders the card; otherwise empty diagonal spacer */}
                        <div className={`hidden md:block w-[calc(50%-2.5rem)] ${isLeft ? 'mr-auto' : 'pointer-events-none select-none opacity-0'}`}>
                          {isLeft && (
                            <div className="relative group">
                              {/* Horizontal connector line linking card to center node */}
                              <div
                                className={`absolute right-[-2.5rem] top-1/2 -translate-y-1/2 h-[1.5px] w-10 transition-all duration-500 pointer-events-none ${
                                  isActive
                                    ? 'bg-[#FF9B00]'
                                    : 'bg-neutral-800'
                                }`}
                              />

                              {/* Service Card: Black until scrolled to, then yellow with black text */}
                              <div
                                className={`p-6 sm:p-7 rounded-sm relative overflow-hidden transition-all duration-500 ease-out border ${
                                  isActive
                                    ? 'bg-[#FF9B00] text-black border-[#FF9B00] shadow-[0_14px_40px_rgba(255,155,0,0.22)] scale-100 opacity-100'
                                    : 'bg-[#121214] text-[#fcf8ef] border-neutral-800/80 shadow-none scale-[0.98] opacity-85'
                                } hover:bg-[#FF9B00] hover:text-black hover:border-[#FF9B00] hover:opacity-100 hover:scale-100 group`}
                              >
                                {/* Card Header */}
                                <div
                                  className={`flex items-center justify-between font-mono text-xs uppercase tracking-wider mb-4 pb-3 border-b transition-colors duration-500 ${
                                    isActive ? 'border-black/15' : 'border-white/10 group-hover:border-black/15'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-extrabold transition-colors duration-500 ${
                                        isActive ? 'text-black' : 'text-neutral-500 group-hover:text-black'
                                      }`}
                                    >
                                      {service.number}
                                    </span>
                                    <span
                                      className={`font-bold transition-colors duration-500 ${
                                        isActive ? 'text-black/40' : 'text-neutral-600 group-hover:text-black/40'
                                      }`}
                                    >
                                      —
                                    </span>
                                    <h2
                                      className={`text-sm sm:text-base font-extrabold tracking-tight transition-colors duration-500 ${
                                        isActive ? 'text-black' : 'text-[#fcf8ef] group-hover:text-black'
                                      }`}
                                    >
                                      {service.title}
                                    </h2>
                                  </div>
                                  <span
                                    className={`text-[10px] tracking-widest font-mono font-bold transition-colors duration-500 ${
                                      isActive ? 'text-black/75' : 'text-neutral-500 group-hover:text-black/75'
                                    }`}
                                  >
                                    {service.phase}
                                  </span>
                                </div>

                                {/* Tagline */}
                                <p
                                  className={`text-base sm:text-[17px] font-extrabold leading-snug mb-3 transition-colors duration-500 ${
                                    isActive ? 'text-black' : 'text-[#fcf8ef] group-hover:text-black'
                                  }`}
                                >
                                  {service.tagline}
                                </p>

                                {/* Description */}
                                <p
                                  className={`text-xs sm:text-sm leading-relaxed font-medium mb-5 transition-colors duration-500 ${
                                    isActive ? 'text-black/85' : 'text-[#cbc7c2] group-hover:text-black/85'
                                  }`}
                                >
                                  {service.description}
                                </p>

                                {/* Deliverables / Scope Preview */}
                                <div
                                  className={`pt-3 border-t flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-mono transition-colors duration-500 ${
                                    isActive ? 'border-black/15' : 'border-white/10 group-hover:border-black/15'
                                  }`}
                                >
                                  {service.deliverables.map((item, dIdx) => (
                                    <React.Fragment key={item}>
                                      <span
                                        className={`font-semibold transition-colors duration-500 ${
                                          isActive ? 'text-black/85' : 'text-neutral-400 group-hover:text-black/85'
                                        }`}
                                      >
                                        {item}
                                      </span>
                                      {dIdx < service.deliverables.length - 1 && (
                                        <span
                                          className={`font-bold transition-colors duration-500 ${
                                            isActive ? 'text-black/35' : 'text-neutral-600 group-hover:text-black/35'
                                          }`}
                                        >
                                          ·
                                        </span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Side: If !isLeft (odd index), renders the card on the opposite side; otherwise empty diagonal spacer */}
                        <div className={`hidden md:block w-[calc(50%-2.5rem)] ${!isLeft ? 'ml-auto' : 'pointer-events-none select-none opacity-0'}`}>
                          {!isLeft && (
                            <div className="relative group">
                              {/* Horizontal connector line linking card to center node */}
                              <div
                                className={`absolute left-[-2.5rem] top-1/2 -translate-y-1/2 h-[1.5px] w-10 transition-all duration-500 pointer-events-none ${
                                  isActive
                                    ? 'bg-[#FF9B00]'
                                    : 'bg-neutral-800'
                                }`}
                              />

                              {/* Service Card: Black until scrolled to, then yellow with black text */}
                              <div
                                className={`p-6 sm:p-7 rounded-sm relative overflow-hidden transition-all duration-500 ease-out border ${
                                  isActive
                                    ? 'bg-[#FF9B00] text-black border-[#FF9B00] shadow-[0_14px_40px_rgba(255,155,0,0.22)] scale-100 opacity-100'
                                    : 'bg-[#121214] text-[#fcf8ef] border-neutral-800/80 shadow-none scale-[0.98] opacity-85'
                                } hover:bg-[#FF9B00] hover:text-black hover:border-[#FF9B00] hover:opacity-100 hover:scale-100 group`}
                              >
                                {/* Card Header */}
                                <div
                                  className={`flex items-center justify-between font-mono text-xs uppercase tracking-wider mb-4 pb-3 border-b transition-colors duration-500 ${
                                    isActive ? 'border-black/15' : 'border-white/10 group-hover:border-black/15'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-extrabold transition-colors duration-500 ${
                                        isActive ? 'text-black' : 'text-neutral-500 group-hover:text-black'
                                      }`}
                                    >
                                      {service.number}
                                    </span>
                                    <span
                                      className={`font-bold transition-colors duration-500 ${
                                        isActive ? 'text-black/40' : 'text-neutral-600 group-hover:text-black/40'
                                      }`}
                                    >
                                      —
                                    </span>
                                    <h2
                                      className={`text-sm sm:text-base font-extrabold tracking-tight transition-colors duration-500 ${
                                        isActive ? 'text-black' : 'text-[#fcf8ef] group-hover:text-black'
                                      }`}
                                    >
                                      {service.title}
                                    </h2>
                                  </div>
                                  <span
                                    className={`text-[10px] tracking-widest font-mono font-bold transition-colors duration-500 ${
                                      isActive ? 'text-black/75' : 'text-neutral-500 group-hover:text-black/75'
                                    }`}
                                  >
                                    {service.phase}
                                  </span>
                                </div>

                                {/* Tagline */}
                                <p
                                  className={`text-base sm:text-[17px] font-extrabold leading-snug mb-3 transition-colors duration-500 ${
                                    isActive ? 'text-black' : 'text-[#fcf8ef] group-hover:text-black'
                                  }`}
                                >
                                  {service.tagline}
                                </p>

                                {/* Description */}
                                <p
                                  className={`text-xs sm:text-sm leading-relaxed font-medium mb-5 transition-colors duration-500 ${
                                    isActive ? 'text-black/85' : 'text-[#cbc7c2] group-hover:text-black/85'
                                  }`}
                                >
                                  {service.description}
                                </p>

                                {/* Deliverables / Scope Preview */}
                                <div
                                  className={`pt-3 border-t flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-mono transition-colors duration-500 ${
                                    isActive ? 'border-black/15' : 'border-white/10 group-hover:border-black/15'
                                  }`}
                                >
                                  {service.deliverables.map((item, dIdx) => (
                                    <React.Fragment key={item}>
                                      <span
                                        className={`font-semibold transition-colors duration-500 ${
                                          isActive ? 'text-black/85' : 'text-neutral-400 group-hover:text-black/85'
                                        }`}
                                      >
                                        {item}
                                      </span>
                                      {dIdx < service.deliverables.length - 1 && (
                                        <span
                                          className={`font-bold transition-colors duration-500 ${
                                            isActive ? 'text-black/35' : 'text-neutral-600 group-hover:text-black/35'
                                          }`}
                                        >
                                          ·
                                        </span>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* MOBILE VERSION: Clean right-offset card connected to the mobile line */}
                        <div className="md:hidden pl-12 sm:pl-14 w-full">
                          <div className="relative group">
                            {/* Horizontal small connector on mobile */}
                            <div
                              className={`absolute left-[-1.5rem] top-8 h-[1.5px] w-6 pointer-events-none transition-colors duration-500 ${
                                isActive ? 'bg-[#FF9B00]' : 'bg-neutral-800'
                              }`}
                            />

                            <div
                              className={`p-5 sm:p-6 rounded-sm relative overflow-hidden transition-all duration-500 ease-out border ${
                                isActive
                                  ? 'bg-[#FF9B00] text-black border-[#FF9B00] shadow-[0_14px_40px_rgba(255,155,0,0.22)] opacity-100'
                                  : 'bg-[#121214] text-[#fcf8ef] border-neutral-800/80 shadow-none opacity-85'
                              } hover:bg-[#FF9B00] hover:text-black hover:border-[#FF9B00] hover:opacity-100`}
                            >
                              {/* Card Header */}
                              <div
                                className={`flex items-center justify-between font-mono text-xs uppercase tracking-wider mb-3 pb-2.5 border-b transition-colors duration-500 ${
                                  isActive ? 'border-black/15' : 'border-white/10 group-hover:border-black/15'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-extrabold transition-colors duration-500 ${
                                      isActive ? 'text-black' : 'text-neutral-500 group-hover:text-black'
                                    }`}
                                  >
                                    {service.number}
                                  </span>
                                  <span
                                    className={`font-bold transition-colors duration-500 ${
                                      isActive ? 'text-black/40' : 'text-neutral-600 group-hover:text-black/40'
                                    }`}
                                  >
                                    —
                                  </span>
                                  <h2
                                    className={`text-sm font-extrabold tracking-tight transition-colors duration-500 ${
                                      isActive ? 'text-black' : 'text-[#fcf8ef] group-hover:text-black'
                                    }`}
                                  >
                                    {service.title}
                                  </h2>
                                </div>
                                <span
                                  className={`text-[10px] tracking-widest font-mono font-bold transition-colors duration-500 ${
                                    isActive ? 'text-black/75' : 'text-neutral-500 group-hover:text-black/75'
                                  }`}
                                >
                                  {service.phase}
                                </span>
                              </div>

                              {/* Tagline */}
                              <p
                                className={`text-sm sm:text-base font-extrabold leading-snug mb-2.5 transition-colors duration-500 ${
                                  isActive ? 'text-black' : 'text-[#fcf8ef] group-hover:text-black'
                                }`}
                              >
                                {service.tagline}
                              </p>

                              {/* Description */}
                              <p
                                className={`text-xs leading-relaxed font-medium mb-3.5 transition-colors duration-500 ${
                                  isActive ? 'text-black/85' : 'text-[#cbc7c2] group-hover:text-black/85'
                                }`}
                              >
                                {service.description}
                              </p>

                              {/* Deliverables / Scope Preview */}
                              <div
                                className={`pt-2.5 border-t flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-mono transition-colors duration-500 ${
                                  isActive ? 'border-black/15' : 'border-white/10 group-hover:border-black/15'
                                }`}
                              >
                                {service.deliverables.map((item, dIdx) => (
                                  <React.Fragment key={item}>
                                    <span
                                      className={`font-semibold transition-colors duration-500 ${
                                        isActive ? 'text-black/85' : 'text-neutral-400 group-hover:text-black/85'
                                      }`}
                                    >
                                      {item}
                                    </span>
                                    {dIdx < service.deliverables.length - 1 && (
                                      <span
                                        className={`font-bold transition-colors duration-500 ${
                                          isActive ? 'text-black/35' : 'text-neutral-600 group-hover:text-black/35'
                                        }`}
                                      >
                                        ·
                                      </span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Information Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-neutral-500 border-t border-neutral-900/60 pt-4 shrink-0 mt-6"
              onClick={(e) => e.stopPropagation()}
            >
              <span>© 2016–2026 ODD MANGO <span className="text-[#FF9B00]">&bull;</span> PRODUCTION STUDIO</span>
              <span className="text-[#cbc7c2] uppercase">COMMERCIAL <span className="text-[#FF9B00]">&bull;</span> CINEMA PRACTICE</span>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <a
                  href={`mailto:${STUDIO_INFO.email}`}
                  className="text-[#cbc7c2] hover:text-[#FF9B00] transition-colors uppercase"
                >
                  {STUDIO_INFO.email}
                </a>
                <span className="text-neutral-700">&bull;</span>
                <a
                  href={`tel:${(STUDIO_INFO.phone || '+91 93706 02824').replace(/\s+/g, '')}`}
                  className="text-[#fcf8ef] font-semibold text-xs sm:text-[13px] tracking-wide hover:text-[#FF9B00] transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="text-[#FF9B00] font-bold">TEL:</span>
                  <span>{STUDIO_INFO.phone || '+91 93706 02824'}</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

