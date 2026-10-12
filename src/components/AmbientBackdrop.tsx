import React, { useState, useEffect, useRef } from 'react';
import { RGB, getDimDarkStyle, getDimLightStyle } from '../services/colorExtractor';

interface AmbientBackdropProps {
  rgb: RGB;
  mode: 'dark' | 'light';
  className?: string;
  duration?: number; // duration in ms
}

interface LayerState {
  background: string;
  backgroundColor: string;
  rgb: RGB;
}

export const AmbientBackdrop: React.FC<AmbientBackdropProps> = ({
  rgb,
  mode,
  className = '',
  duration = 900,
}) => {
  const getStyle = (targetRgb: RGB) => {
    return mode === 'dark' ? getDimDarkStyle(targetRgb) : getDimLightStyle(targetRgb);
  };

  const initialStyle = getStyle(rgb);
  const [layerA, setLayerA] = useState<LayerState>({ ...initialStyle, rgb });
  const [layerB, setLayerB] = useState<LayerState>({ ...initialStyle, rgb });
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');

  const prevRgbRef = useRef<RGB>(rgb);
  const prevModeRef = useRef<string>(mode);

  useEffect(() => {
    const isSameColor =
      prevRgbRef.current.r === rgb.r &&
      prevRgbRef.current.g === rgb.g &&
      prevRgbRef.current.b === rgb.b &&
      prevModeRef.current === mode;

    if (isSameColor) return;

    prevRgbRef.current = rgb;
    prevModeRef.current = mode;

    const newStyle = getStyle(rgb);

    if (activeLayer === 'A') {
      setLayerB({ ...newStyle, rgb });
      setActiveLayer('B');
    } else {
      setLayerA({ ...newStyle, rgb });
      setActiveLayer('A');
    }
  }, [rgb.r, rgb.g, rgb.b, mode, activeLayer]);

  const activeStyle = activeLayer === 'A' ? layerA : layerB;
  const transitionEase = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
  const bgTransitionEase = `background-color ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;

  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: activeStyle.backgroundColor,
        transition: bgTransitionEase,
      }}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}
    >
      {/* Layer A */}
      <div
        style={{
          background: layerA.background,
          opacity: activeLayer === 'A' ? 1 : 0,
          transition: transitionEase,
          willChange: 'opacity',
        }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Layer B */}
      <div
        style={{
          background: layerB.background,
          opacity: activeLayer === 'B' ? 1 : 0,
          transition: transitionEase,
          willChange: 'opacity',
        }}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
};
