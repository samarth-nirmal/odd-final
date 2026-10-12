import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Project } from '../types';
import { playTick, playShutter } from '../services/audio';
import { getImageRGB } from '../services/colorExtractor';
import { AmbientBackdrop } from './AmbientBackdrop';

interface ProjectLightboxProps {
  project: Project | null;
  onClose: () => void;
  onNextProject?: () => void;
  onPrevProject?: () => void;
}

export const ProjectLightbox: React.FC<ProjectLightboxProps> = ({
  project,
  onClose,
  onNextProject,
  onPrevProject,
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  useEffect(() => {
    setCurrentFrameIndex(0);
  }, [project]);

  const gallery = project?.gallery && project.gallery.length > 0 ? project.gallery : [project?.image || ''];

  const prevFrame = useCallback(() => {
    playShutter();
    setCurrentFrameIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
  }, [gallery.length]);

  const nextFrame = useCallback(() => {
    playShutter();
    setCurrentFrameIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
  }, [gallery.length]);

  // Keyboard controls
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        playTick();
        onClose();
      }
      if (e.key === 'ArrowLeft') prevFrame();
      if (e.key === 'ArrowRight') nextFrame();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose, prevFrame, nextFrame]);

  if (!project) return null;

  const currentFrameUrl = gallery[currentFrameIndex];
  const frameRGB = useMemo(() => {
    return getImageRGB(currentFrameUrl, project.slug);
  }, [currentFrameUrl, project.slug]);

  return (
    <motion.div
      id="project-lightbox-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col justify-between select-none p-6 sm:p-10"
      onClick={onClose}
    >
      {/* Silky-smooth Dual-Layer Ambient Backdrop */}
      <AmbientBackdrop rgb={frameRGB} mode="dark" duration={850} />

      {/* Top minimal header */}
      <div
        className="w-full flex items-center justify-between text-xs sm:text-sm font-medium tracking-tight"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="font-extrabold uppercase text-[#fcf8ef] text-sm sm:text-base">
            {project.name}
          </span>
          <span className="text-neutral-500 font-mono text-xs">
            [{String(currentFrameIndex + 1).padStart(2, '0')}/{String(gallery.length).padStart(2, '0')}]
          </span>
        </div>

        <button
          id="lightbox-close-btn"
          onClick={() => {
            playTick();
            onClose();
          }}
          className="font-mono text-xs uppercase text-[#cbc7c2] hover:text-[#fcf8ef] transition-colors cursor-pointer"
        >
          <span className="roll">
            <span className="roll-inner">
              <span className="roll-face">[close]</span>
              <span className="roll-face text-white">[close]</span>
            </span>
          </span>
        </button>
      </div>

      {/* Main Rectangular Frame */}
      <div
        className="flex-1 flex items-center justify-center my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          onClick={nextFrame}
          className="relative aspect-[3/5] w-full max-w-[min(54vh,80vw)] max-h-[78vh] overflow-hidden bg-[#161616] cursor-pointer shadow-2xl"
        >
          {project.type === 'motion' && project.video && currentFrameIndex === 0 ? (
            <video
              src={project.video}
              poster={project.image}
              controls
              autoPlay
              playsInline
              loop
              preload="metadata"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentFrameUrl}
              alt={`${project.name} - Frame ${currentFrameIndex + 1}`}
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="async"
              {...({ fetchPriority: 'high' } as any)}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          )}
        </div>
      </div>

      {/* Bottom minimal thumbnail strip (Rectangular thumbnails) */}
      <div
        className="w-full flex items-center justify-between text-xs font-mono text-[#cbc7c2]/70"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="uppercase text-[11px] font-mono">
          {project.client} • {project.tag}
        </span>

        {gallery.length > 1 && (
          <div className="flex items-center gap-2">
            {gallery.map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playShutter();
                  setCurrentFrameIndex(idx);
                }}
                className={`w-7 h-10 aspect-[2/3] overflow-hidden cursor-pointer transition-all ${
                  idx === currentFrameIndex
                    ? 'ring-1 ring-[#FF9B00] opacity-100'
                    : 'opacity-40 hover:opacity-80'
                }`}
              >
                <img
                  src={thumb}
                  alt={`Thumb ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
          CLICK IMAGE OR ARROWS TO ADVANCE
        </span>
      </div>
    </motion.div>
  );
};
