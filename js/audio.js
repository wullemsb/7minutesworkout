'use strict';

/**
 * Audio system for the 7-minute workout app.
 * Uses Web Speech API for exercise announcements and
 * AudioContext for countdown beeps and notification tones.
 */
const AudioSystem = (() => {
  let audioCtx = null;
  let enabled = true;

  function getContext() {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Play a tone with given frequency, duration, and gain.
   * @param {number} frequency - Hz
   * @param {number} duration  - seconds
   * @param {number} gain      - 0..1
   * @param {string} type      - oscillator type
   * @param {number} startAt   - offset in seconds from AudioContext.currentTime (0 = immediately)
   */
  function playTone(frequency, duration, gain = 0.4, type = 'sine', startAt = 0) {
    if (!enabled) return;
    try {
      const ctx = getContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = type;
      osc.frequency.value = frequency;
      gainNode.gain.setValueAtTime(gain, ctx.currentTime + startAt);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);
      osc.start(ctx.currentTime + startAt);
      osc.stop(ctx.currentTime + startAt + duration + 0.05);
    } catch (e) {
      // Audio context may be unavailable in some environments
      console.warn('Audio playback failed:', e);
    }
  }

  /** Play a single short beep (countdown tick) */
  function beep() {
    playTone(880, 0.12, 0.3, 'sine');
  }

  /** Play the final beep before exercise starts (higher pitch, longer) */
  function beepGo() {
    playTone(1320, 0.25, 0.5, 'sine');
  }

  /** 3-2-1 countdown beeps */
  function countdown() {
    if (!enabled) return;
    try {
      const ctx = getContext();
      // Three short beeps at 880 Hz then a higher go beep
      playTone(880, 0.12, 0.35, 'sine', 0);
      playTone(880, 0.12, 0.35, 'sine', 1);
      playTone(880, 0.12, 0.35, 'sine', 2);
      playTone(1320, 0.3, 0.5, 'sine', 3);
    } catch (e) {
      console.warn('Countdown audio failed:', e);
    }
  }

  /** Victory fanfare for workout completion */
  function victory() {
    if (!enabled) return;
    try {
      const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
      notes.forEach((freq, i) => {
        playTone(freq, 0.25, 0.45, 'triangle', i * 0.18);
      });
      // Final long chord
      playTone(523, 0.8, 0.4, 'sine', notes.length * 0.18);
      playTone(659, 0.8, 0.3, 'sine', notes.length * 0.18);
      playTone(784, 0.8, 0.3, 'sine', notes.length * 0.18);
    } catch (e) {
      console.warn('Victory audio failed:', e);
    }
  }

  /** Rest phase notification tone */
  function restTone() {
    playTone(440, 0.2, 0.35, 'sine', 0);
    playTone(330, 0.3, 0.3, 'sine', 0.22);
  }

  /**
   * Speak text using the Web Speech API.
   * @param {string} text
   */
  function speak(text) {
    if (!enabled) return;
    if (!window.speechSynthesis) return;
    // Cancel any current speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    // Prefer a clear, natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.localService);
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }

  /** Announce the upcoming exercise by name */
  function announceExercise(name) {
    speak(`Next: ${name}`);
  }

  /** Announce start of exercise */
  function announceStart(name) {
    speak(name);
  }

  /** Announce rest */
  function announceRest() {
    speak('Rest');
  }

  /** Announce halfway through */
  function announceHalfway() {
    speak('Halfway there. Keep it up!');
  }

  /** Announce workout complete */
  function announceComplete() {
    speak('Workout complete! Well done!');
  }

  function setEnabled(val) {
    enabled = val;
    if (!val && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  function isEnabled() {
    return enabled;
  }

  return {
    beep,
    beepGo,
    countdown,
    victory,
    restTone,
    speak,
    announceExercise,
    announceStart,
    announceRest,
    announceHalfway,
    announceComplete,
    setEnabled,
    isEnabled
  };
})();
