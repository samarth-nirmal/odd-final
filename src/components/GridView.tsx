import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { playTick, playShutter } from '../services/audio';

interface GridViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  currentIndex: number;
  onHoverIndex: (idx: number) => void;
}

const GridCard: React.FC<{
  project: Project;
  idx: number;
  isActive: boolean;
  onHover: () => void;
  onSelect: () => void;
}> = ({ project, idx, isActive, onHover, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isVideo = Boolean(project.video) && (project.type === 'motion' || Boolean(project.video));

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isVideo) {
      setShouldLoadVideo(true);
    }
    onHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    if (isHovered) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      videoRef.current.pause();
    }
  }, [isHovered, isVideo]);

  return (
    <div
      id={`grid-card-${project.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      className={`aspect-[3/5] relative overflow-hidden cursor-pointer transition-all duration-300 group bg-black ${
        isActive
          ? 'filter-none ring-2 ring-[#FF9B00] z-10 opacity-100'
          : 'filter grayscale contrast-95 opacity-100 hover:filter-none'
      }`}
    >
      {/* Rectangular Portrait Image */}
      <img
        src={project.image}
        alt={project.alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
          isVideo && isHovered ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Video on hover - strictly lazy-loaded on hover */}
      {isVideo && project.video && shouldLoadVideo && (
        <video
          ref={videoRef}
          src={project.video}
          muted
          playsInline
          loop
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Minimal Project Title on Hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 pointer-events-none">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white truncate font-mono">
          {project.name}
        </span>
      </div>
    </div>
  );
};

export const GridView: React.FC<GridViewProps> = ({
  projects,
  onSelectProject,
  currentIndex,
  onHoverIndex,
}) => {
  if (projects.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 font-mono">
        NO WORKS MATCH FILTER
      </div>
    );
  }

  return (
    <div
      id="grid-stage"
      className="w-full h-[calc(100vh-200px)] mt-[105px] mb-[95px] overflow-y-auto px-0 sm:px-2 py-2 select-none"
    >
      <div className="w-full max-w-full mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-0">
        {projects.map((project, idx) => {
          const isActive = idx === currentIndex;
          return (
            <GridCard
              key={project.id}
              project={project}
              idx={idx}
              isActive={isActive}
              onHover={() => {
                playTick();
                onHoverIndex(idx);
              }}
              onSelect={() => {
                playShutter();
                onSelectProject(project);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
