/**
 * Synthesized "rubber stamp" click sound for the Daily Reflection mood picker.
 * No audio file/asset — generated on the fly with the Web Audio API so there's
 * nothing to download or ship. Lazily creates one AudioContext on first use
 * (autoplay policies require a user gesture, which a click handler already is).
 */
let audioCtx;

function getContext() {
  const Ctx = typeof window !== "undefined" && (window.AudioContext || window.webkitAudioContext);
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playStampSound() {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Low-frequency "thump" — the ink block hitting paper.
  const thump = ctx.createOscillator();
  thump.type = "sine";
  thump.frequency.setValueAtTime(190, now);
  thump.frequency.exponentialRampToValueAtTime(65, now + 0.09);

  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.5, now + 0.008);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

  thump.connect(thumpGain);
  thumpGain.connect(ctx.destination);
  thump.start(now);
  thump.stop(now + 0.16);

  // Short high-passed noise burst — the papery "press" texture.
  const bufferSize = Math.floor(ctx.sampleRate * 0.06);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1200;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.16, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.07);
}
