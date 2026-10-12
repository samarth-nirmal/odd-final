import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { loadSoundAssets, playShutter, setSoundEnabled } from '../services/audio';
import logoIntroDesktop from '../assets/Loading Video/Logo Intro desktop.mp4';
import logoIntroMobile from '../assets/Loading Video/Logo Intro mobile.mp4';

interface SoundIntroProps {
  onEnter: (sound: boolean) => void;
}

export const SoundIntro: React.FC<SoundIntroProps> = ({ onEnter }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const enteredRef = useRef(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerEnter = useCallback(() => {
    if (enteredRef.current) return;
    enteredRef.current = true;

    if (videoRef.current) {
      videoRef.current.pause();
    }

    setSoundEnabled(true);
    loadSoundAssets().then(() => {
      playShutter();
    }).catch(() => {});

    onEnter(true);
  }, [onEnter]);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser restricts even muted autoplay, provide a gentle fallback
          const fallbackTimer = setTimeout(() => {
            triggerEnter();
          }, 3000);
          return () => clearTimeout(fallbackTimer);
        });
      }
    }
  }, [isMobile, triggerEnter]);

  // Trigger when video reaches completion
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration > 0 && v.currentTime >= v.duration - 0.05) {
      triggerEnter();
    }
  };

  // Safety fallback (10s) only in case video network/decoding fails completely
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerEnter();
    }, 10000);

    return () => clearTimeout(timer);
  }, [triggerEnter]);

  const videoSource = isMobile ? logoIntroMobile : logoIntroDesktop;

  return (
    <motion.div
      id="sound-intro-modal"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black text-[#fcf8ef] select-none overflow-hidden"
    >
      {/* Crisp Logo Intro Video — Plays fully to completion */}
      <video
        key={videoSource}
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={triggerEnter}
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-cover pointer-events-none"
        src={videoSource}
      />
    </motion.div>
  );
};

