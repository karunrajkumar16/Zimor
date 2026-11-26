/**
 * Subtle Luxury Notification Chime for ZIMOR Admin Portal.
 * Synthesized using the standard Web Audio API oscillator — zero external audio asset dependencies.
 * Non-blocking, fails gracefully in background tabs or under autoplay browser policies.
 */
export function playNotificationChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // Auto-resume if context was created in suspended state
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic two-tone chord: 587.33 Hz (D5) -> 880 Hz (A5)
    // Tone 1: Gentle initial chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: Shimmering resolving tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1);
    gain2.gain.setValueAtTime(0.1, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.6);

    // Clean up context after audio nodes have finished
    setTimeout(() => {
      try {
        if (ctx.state !== 'closed') {
          ctx.close().catch(() => {});
        }
      } catch {}
    }, 1000);
  } catch {
    // Gracefully catch and swallow any audio policy / hardware permission blocks
  }
}
