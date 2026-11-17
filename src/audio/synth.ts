import { CharacterId } from '../game/types';

class LumaAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private volume = 0.65;

  public configure(enabled: boolean, volume: number) {
    this.enabled = enabled;
    this.volume = Math.max(0, Math.min(1, volume));
  }

  private ensureContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private playTone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType,
    gainPeak: number,
    delay = 0
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    const peak = gainPeak * this.volume;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playFootstep() {
    const pitchVar = 0.92 + Math.random() * 0.16;
    this.playTone(130 * pitchVar, 75 * pitchVar, 0.065, 'triangle', 0.06);
  }

  public playSwitch() {
    this.playTone(220, 180, 0.12, 'triangle', 0.14, 0);
    this.playTone(440, 660, 0.22, 'sine', 0.12, 0.05);
  }

  public playRotate() {
    this.playTone(165, 196, 0.16, 'triangle', 0.13, 0);
    this.playTone(330, 392, 0.18, 'sine', 0.09, 0.04);
  }

  public playLift() {
    this.playTone(146, 220, 0.28, 'triangle', 0.12, 0);
    this.playTone(293, 392, 0.26, 'sine', 0.08, 0.06);
  }

  public playPrism() {
    const pitchVar = 0.96 + Math.random() * 0.08;
    this.playTone(587 * pitchVar, 880 * pitchVar, 0.24, 'sine', 0.11, 0);
    this.playTone(1174 * pitchVar, 1318 * pitchVar, 0.2, 'triangle', 0.05, 0.04);
  }

  public playCrystalRestore() {
    const notes = [392, 493.88, 587.33, 783.99, 987.77];
    notes.forEach((n, idx) => {
      this.playTone(n, n * 1.01, 0.45, 'sine', 0.12, idx * 0.075);
    });
  }

  public playPortalComplete() {
    const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99];
    notes.forEach((n, idx) => {
      this.playTone(n, n, 0.55, 'sine', 0.11, idx * 0.065);
    });
  }

  public playUiClick() {
    this.playTone(480, 560, 0.07, 'sine', 0.08);
  }

  public playStarEarned(starIndex: 1 | 2 | 3) {
    const baseFreqs: Record<1 | 2 | 3, number> = {
      1: 523.25,
      2: 659.25,
      3: 783.99,
    };
    const freq = baseFreqs[starIndex];
    this.playTone(freq, freq * 1.015, 0.24, 'sine', 0.1);
    this.playTone(freq * 1.5, freq * 1.51, 0.18, 'triangle', 0.04, 0.03);
  }

  public playMasteryThreeStar() {
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((n, idx) => {
      this.playTone(n, n * 1.005, 0.42, 'sine', 0.09, idx * 0.055);
    });
  }

  public playNewRecord() {
    this.playTone(587.33, 880, 0.2, 'sine', 0.085, 0);
    this.playTone(880, 1174.66, 0.22, 'triangle', 0.05, 0.06);
  }

  public playCosmeticUnlock() {
    const arpeggio = [440, 554.37, 659.25, 880, 1108.73];
    arpeggio.forEach((n, idx) => {
      this.playTone(n, n, 0.36, 'sine', 0.09, idx * 0.06);
    });
  }

  public playCosmeticEquip() {
    this.playTone(392, 523.25, 0.14, 'triangle', 0.08, 0);
    this.playTone(659.25, 783.99, 0.16, 'sine', 0.07, 0.04);
  }

  public playHeroAbility(characterId: CharacterId) {
    const chords: Record<CharacterId, number[]> = {
      wayfinder: [523.25, 659.25, 987.77],
      sylvi: [392.0, 493.88, 739.99],
      neris: [440.0, 587.33, 880.0],
      kael: [220.0, 329.63, 440.0],
      zeph: [587.33, 783.99, 1174.66],
    };
    chords[characterId].forEach((n, idx) => {
      this.playTone(n, n * 1.06, 0.3, 'sine', 0.09, idx * 0.045);
    });
  }

  public playEchoCollect() {
    const chime = [659.25, 783.99, 987.77, 1318.51];
    chime.forEach((n, idx) => {
      this.playTone(n, n * 1.02, 0.38, 'sine', 0.1, idx * 0.055);
    });
  }

  public playPurchaseCosmetic() {
    this.playTone(440, 659.25, 0.16, 'triangle', 0.09, 0);
    this.playTone(659.25, 880, 0.22, 'sine', 0.09, 0.05);
  }

  public playAchievementUnlock() {
    const fanfare = [523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((n, idx) => {
      this.playTone(n, n, 0.34, 'triangle', 0.075, idx * 0.06);
    });
  }
}

export const audioEngine = new LumaAudioEngine();
