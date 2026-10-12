/**
 * Audio Engine replicating ODD MANGO mechanical shutter,
 * film advance, and tick feedback sounds.
 */

let audioCtx: AudioContext | null = null;
let tickBuffer: AudioBuffer | null = null;
let soundEnabled = true;
let isLoaded = false;
let lastTickTime = 0;

// Initialize or get the AudioContext
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

// Load tick audio sample
export async function loadSoundAssets(): Promise<void> {
  if (isLoaded || typeof window === 'undefined') return;

  try {
    const base = import.meta.env.BASE_URL || './';
    const tickUrl = `${base.endsWith('/') ? base : `${base}/`}tick.mp3`;
    const response = await fetch(tickUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();

    const ctx = getAudioContext();
    if (ctx) {
      tickBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      isLoaded = true;
    }
  } catch (err) {
    console.warn('Could not load tick.mp3, will use synthesized audio fallback:', err);
    isLoaded = true;
  }
}

// Synthesized click fallback in case buffer is not ready yet
function playSynthClick(ctx: AudioContext, time: number, freq = 2400, gainVal = 0.3) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.025);

  gain.gain.setValueAtTime(gainVal, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.03);
}

/**
 * Play a light mechanical tick (e.g. for slider steps, dial turns, hover)
 */
export function playTick(): void {
  if (!soundEnabled) return;
  tapHaptic();

  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const now = ctx.currentTime;
  if (now - lastTickTime < 0.02) return;
  lastTickTime = now;

  if (tickBuffer) {
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();

    source.buffer = tickBuffer;
    source.playbackRate.value = 0.95 + Math.random() * 0.1;
    gainNode.gain.value = 0.55;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(now);
  } else {
    playSynthClick(ctx, now, 3200, 0.15);
  }
}

/**
 * Play authentic camera shutter mechanism:
 * Two distinct mechanical curtains opening and snapping shut
 */
export function playShutter(): void {
  if (!soundEnabled) return;
  tapHaptic();

  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const now = ctx.currentTime;

  if (tickBuffer) {
    const hits = [
      { at: 0, rate: 0.65, gain: 0.65 },
      { at: 0.085, rate: 1.05, gain: 0.85 },
      { at: 0.14, rate: 1.4, gain: 0.4 },
    ];

    hits.forEach((hit) => {
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = tickBuffer;
      source.playbackRate.value = hit.rate;
      gainNode.gain.value = hit.gain;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(now + hit.at);
    });
  } else {
    playSynthClick(ctx, now, 1200, 0.4);
    playSynthClick(ctx, now + 0.08, 2800, 0.5);
  }
}

/**
 * Play film motor / advance motor winding sound
 */
export function playPrintMotor(seconds = 1.2): void {
  if (!soundEnabled) return;
  tapHaptic();

  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'running') return;

  const startTime = ctx.currentTime;

  if (tickBuffer) {
    for (let offset = 0; offset < seconds; offset += 0.052) {
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = tickBuffer;
      source.playbackRate.value = 1.8 + Math.random() * 0.4;
      gainNode.gain.value = 0.12 * Math.sin((offset / seconds) * Math.PI);

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(startTime + offset);
    }
  } else {
    for (let offset = 0; offset < seconds; offset += 0.06) {
      playSynthClick(ctx, startTime + offset, 1800 + Math.random() * 600, 0.08);
    }
  }
}

/**
 * Tactile device haptic feedback if supported
 */
export function tapHaptic(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(8);
    } catch {
      // Ignored if device does not support vibration
    }
  }
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (enabled) {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    playTick();
  }
}
