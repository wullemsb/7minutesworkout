'use strict';

/**
 * Workout engine: manages state, timer, Wake Lock, and events.
 *
 * States: idle → running → paused → complete
 * Phases: 'exercise' | 'rest'
 *
 * Emits custom events on document:
 *   workout:tick       { phase, timeLeft, totalLeft, exerciseIndex }
 *   workout:phase      { phase, exerciseIndex, exercise }
 *   workout:pause      {}
 *   workout:resume     {}
 *   workout:complete   { duration, exercisesDone }
 *   workout:skip       { exerciseIndex }
 */
const WorkoutEngine = (() => {
  // ── State ─────────────────────────────────────────────────────────────────
  let state = 'idle';      // idle | running | paused | complete
  let phase = 'exercise';  // exercise | rest
  let exerciseIndex = 0;
  let timeLeft = 0;
  let intervalId = null;
  let wakeLock = null;
  let startTimestamp = null;
  let totalElapsed = 0;     // seconds elapsed in the whole workout

  // ── Helpers ───────────────────────────────────────────────────────────────
  function emit(name, detail = {}) {
    document.dispatchEvent(new CustomEvent(`workout:${name}`, { detail }));
  }

  function totalDuration() {
    const n = EXERCISES.length;
    return n * EXERCISE_DURATION + (n - 1) * REST_DURATION;
  }

  function calcTotalLeft() {
    const remaining = [];
    if (phase === 'exercise') {
      remaining.push(timeLeft);
      for (let i = exerciseIndex + 1; i < EXERCISES.length; i++) {
        remaining.push(REST_DURATION, EXERCISE_DURATION);
      }
    } else {
      remaining.push(timeLeft);
      for (let i = exerciseIndex + 1; i < EXERCISES.length; i++) {
        remaining.push(EXERCISE_DURATION);
        if (i < EXERCISES.length - 1) remaining.push(REST_DURATION);
      }
    }
    return remaining.reduce((a, b) => a + b, 0);
  }

  // ── Wake Lock ──────────────────────────────────────────────────────────────
  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } catch {
      // Wake Lock not available — silently ignore
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }
  }

  // Re-acquire wake lock when tab becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state === 'running') {
      requestWakeLock();
    }
  });

  // ── Core tick ─────────────────────────────────────────────────────────────
  function tick() {
    if (state !== 'running') return;

    timeLeft--;
    totalElapsed++;

    emit('tick', {
      phase,
      timeLeft,
      exerciseIndex,
      exercise: EXERCISES[exerciseIndex],
      totalLeft: calcTotalLeft(),
      totalDuration: totalDuration()
    });

    // Halfway announcement
    const half = Math.floor(totalDuration() / 2);
    if (totalElapsed === half) {
      AudioSystem.announceHalfway();
    }

    // Last 3 seconds of exercise or rest: beep
    if (timeLeft <= 3 && timeLeft > 0) {
      AudioSystem.beep();
    }

    if (timeLeft <= 0) {
      advance();
    }
  }

  // ── Phase transitions ─────────────────────────────────────────────────────
  function advance() {
    if (phase === 'exercise') {
      if (exerciseIndex >= EXERCISES.length - 1) {
        // Workout complete
        finish();
        return;
      }
      // Transition to rest
      phase = 'rest';
      timeLeft = REST_DURATION;
      AudioSystem.restTone();
      AudioSystem.announceRest();
      // Announce next exercise after a short delay
      const nextName = EXERCISES[exerciseIndex + 1].name;
      setTimeout(() => AudioSystem.announceExercise(nextName), 1500);
      emit('phase', { phase, exerciseIndex, exercise: EXERCISES[exerciseIndex] });
    } else {
      // Transition from rest to next exercise
      exerciseIndex++;
      phase = 'exercise';
      timeLeft = EXERCISE_DURATION;
      AudioSystem.beepGo();
      AudioSystem.announceStart(EXERCISES[exerciseIndex].name);
      emit('phase', { phase, exerciseIndex, exercise: EXERCISES[exerciseIndex] });
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  function start() {
    if (state !== 'idle') reset();
    state = 'running';
    phase = 'exercise';
    exerciseIndex = 0;
    timeLeft = EXERCISE_DURATION;
    totalElapsed = 0;
    startTimestamp = Date.now();

    requestWakeLock();
    AudioSystem.announceStart(EXERCISES[0].name);
    emit('phase', { phase, exerciseIndex, exercise: EXERCISES[0] });
    emit('tick', {
      phase,
      timeLeft,
      exerciseIndex,
      exercise: EXERCISES[exerciseIndex],
      totalLeft: calcTotalLeft(),
      totalDuration: totalDuration()
    });

    intervalId = setInterval(tick, 1000);
  }

  function pause() {
    if (state !== 'running') return;
    state = 'paused';
    pauseStart = Date.now();
    clearInterval(intervalId);
    releaseWakeLock();
    if (window.speechSynthesis) window.speechSynthesis.pause();
    emit('pause', {});
  }

  function resume() {
    if (state !== 'paused') return;
    state = 'running';
    requestWakeLock();
    if (window.speechSynthesis) window.speechSynthesis.resume();
    emit('resume', {});
    intervalId = setInterval(tick, 1000);
  }

  function skip() {
    if (state !== 'running' && state !== 'paused') return;
    clearInterval(intervalId);
    emit('skip', { exerciseIndex, phase });

    if (phase === 'exercise') {
      if (exerciseIndex >= EXERCISES.length - 1) {
        finish();
        return;
      }
      phase = 'rest';
      timeLeft = REST_DURATION;
      emit('phase', { phase, exerciseIndex, exercise: EXERCISES[exerciseIndex] });
    } else {
      exerciseIndex++;
      phase = 'exercise';
      timeLeft = EXERCISE_DURATION;
      emit('phase', { phase, exerciseIndex, exercise: EXERCISES[exerciseIndex] });
    }

    if (state === 'running') {
      intervalId = setInterval(tick, 1000);
    }
  }

  function finish() {
    clearInterval(intervalId);
    releaseWakeLock();
    state = 'complete';
    const duration = Math.round((Date.now() - startTimestamp) / 1000);
    const exercisesDone = exerciseIndex + 1;
    const calories = Math.round(exercisesDone * 5.5); // ~5–6 cal per exercise segment
    AudioSystem.victory();
    AudioSystem.announceComplete();
    emit('complete', { duration, exercisesDone, calories });
  }

  function reset() {
    clearInterval(intervalId);
    releaseWakeLock();
    state = 'idle';
    phase = 'exercise';
    exerciseIndex = 0;
    timeLeft = 0;
    totalElapsed = 0;
    startTimestamp = null;
    intervalId = null;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function getState() { return state; }
  function getPhase() { return phase; }
  function getExerciseIndex() { return exerciseIndex; }
  function getTimeLeft() { return timeLeft; }

  return {
    start,
    pause,
    resume,
    skip,
    reset,
    getState,
    getPhase,
    getExerciseIndex,
    getTimeLeft,
    totalDuration
  };
})();
