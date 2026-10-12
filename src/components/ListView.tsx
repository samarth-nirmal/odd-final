import React, { useState } from 'react';
import { Project } from '../types';
import { playTick, playShutter } from '../services/audio';

interface ListViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  currentIndex: number;
  onHoverIndex: (idx: number) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  projects,
  onSelectProject,
  currentIndex,
  onHoverIndex,
}) => {
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
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
      id="list-stage"
      onMouseMove={handleMouseMove}
      className="w-full h-[calc(100dvh-200px)] mt-[105px] mb-[95px] overflow-y-auto px-6 sm:px-12 py-4 select-none"
    >
      <div className="max-w-5xl mx-auto">
        {/* Table header */}
        <div className="grid grid-cols-12 pb-3 border-b border-neutral-800 text-sm font-mono uppercase text-[#cbc7c2]/60 tracking-wider">
          <span className="col-span-1">No.</span>
          <span className="col-span-5 sm:col-span-6">Project</span>
          <span className="col-span-3 sm:col-span-3">Client</span>
          <span className="col-span-3 sm:col-span-2 text-right">Type</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-neutral-900/80">
          {projects.map((project, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={project.id}
                id={`list-row-${project.id}`}
                onMouseEnter={() => {
                  playTick();
                  setHoveredProject(project);
                  onHoverIndex(idx);
                }}
                onMouseLeave={() => setHoveredProject(null)}
                onClick={() => {
                  playShutter();
                  onSelectProject(project);
                }}
                className={`grid grid-cols-12 py-3.5 sm:py-4 items-center cursor-pointer transition-colors text-base sm:text-lg font-medium tracking-tight ${
                  isActive ? 'text-[#fcf8ef] bg-white/[0.03]' : 'text-[#cbc7c2]/80 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <span className="col-span-1 font-mono text-xs sm:text-sm text-neutral-500">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="col-span-5 sm:col-span-6 font-bold uppercase truncate pr-4">
                  {project.name}
                </span>
                <span className="col-span-3 sm:col-span-3 text-xs sm:text-sm font-mono uppercase text-neutral-400 truncate">
                  {project.client || '—'}
                </span>
                <span className="col-span-3 sm:col-span-2 text-right text-xs sm:text-sm font-mono uppercase text-neutral-400">
                  {project.type}[{project.count}]
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rectangular Floating Thumbnail on Hover */}
      {hoveredProject && (
        <div
          className="fixed pointer-events-none z-50 hidden md:block w-36 h-52 aspect-[2/3] overflow-hidden border border-neutral-700/80 shadow-2xl bg-neutral-950 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{
            left: `${mousePos.x + 100}px`,
            top: `${mousePos.y}px`,
          }}
        >
          <img
            src={hoveredProject.image}
            alt={hoveredProject.alt}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};
