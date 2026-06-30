'use strict';

/**
 * Main application controller.
 * Manages screen navigation and wires up WorkoutEngine events to the DOM.
 */
const App = (() => {
  // ── DOM refs ──────────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  // Screens
  const screens = {
    home:     $('screen-home'),
    workout:  $('screen-workout'),
    complete: $('screen-complete'),
    history:  $('screen-history')
  };

  // Timer ring geometry
  const RING_RADIUS = 88;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  // ── Utility ───────────────────────────────────────────────────────────────
  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // ── Screen navigation ─────────────────────────────────────────────────────
  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle('active', key === name);
    });
    // Bottom nav
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === name);
    });
    // Hide nav during workout
    $('bottom-nav').classList.toggle('hidden', name === 'workout');
    if (name === 'history') renderHistory();
    if (name === 'home') renderHome();
  }

  // ── Timer ring ─────────────────────────────────────────────────────────────
  function setRingProgress(fillId, fraction) {
    const el = $(fillId);
    if (!el) return;
    const offset = RING_CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, fraction)));
    el.style.strokeDashoffset = offset;
  }

  // ── Exercise illustration ─────────────────────────────────────────────────
  function setIllustration(containerId, exercise) {
    const el = $(containerId);
    if (!el || !exercise) return;
    el.innerHTML = exercise.svg || '';
  }

  // ── Home screen ────────────────────────────────────────────────────────────
  function renderHome() {
    const streaks = WorkoutHistory.getStreaks();
    $('streak-count').textContent = streaks.current;
    $('stat-total').textContent = WorkoutHistory.getTotalWorkouts();
    $('stat-week').textContent = WorkoutHistory.getThisWeekCount();
    $('stat-calories').textContent = WorkoutHistory.getTotalCalories();

    // Exercise chips
    const chips = $('exercise-chips');
    chips.innerHTML = '';
    EXERCISES.forEach((ex, i) => {
      const chip = document.createElement('span');
      chip.className = 'exercise-chip';
      chip.textContent = `${i + 1}. ${ex.name}`;
      chips.appendChild(chip);
    });
  }

  // ── Workout screen ─────────────────────────────────────────────────────────
  function updateWorkoutUI(detail) {
    const { phase, timeLeft, exerciseIndex, exercise, totalLeft, totalDuration } = detail;

    if (phase === 'exercise') {
      $('phase-exercise').classList.remove('hidden');
      $('phase-rest').classList.add('hidden');

      $('phase-label').textContent = 'EXERCISE ' + (exerciseIndex + 1) + ' / ' + EXERCISES.length;
      $('exercise-name').textContent = exercise.name;
      $('exercise-muscles').textContent = exercise.muscles;
      $('exercise-tips').textContent = exercise.tips;
      $('timer-number').textContent = timeLeft;

      const fraction = timeLeft / EXERCISE_DURATION;
      setRingProgress('timer-ring-fill', fraction);

    } else {
      $('phase-exercise').classList.add('hidden');
      $('phase-rest').classList.remove('hidden');

      $('rest-timer-number').textContent = timeLeft;
      const fraction = timeLeft / REST_DURATION;
      setRingProgress('rest-ring-fill', fraction);

      const nextIdx = exerciseIndex + 1;
      if (nextIdx < EXERCISES.length) {
        $('next-exercise-name').textContent = EXERCISES[nextIdx].name;
        setIllustration('next-illustration', EXERCISES[nextIdx]);
      }
    }

    // Overall progress bar
    const elapsed = totalDuration - totalLeft;
    const pct = Math.min(100, (elapsed / totalDuration) * 100);
    $('workout-progress-fill').style.width = pct + '%';
    $('exercise-counter').textContent = (exerciseIndex + 1) + ' / ' + EXERCISES.length;
  }

  function onPhaseChange(detail) {
    const { phase, exerciseIndex, exercise } = detail;
    if (phase === 'exercise') {
      setIllustration('exercise-illustration', exercise);
      $('phase-label').textContent = 'EXERCISE ' + (exerciseIndex + 1) + ' / ' + EXERCISES.length;
      $('exercise-name').textContent = exercise.name;
      $('exercise-muscles').textContent = exercise.muscles;
      $('exercise-tips').textContent = exercise.tips;
    } else {
      const nextIdx = exerciseIndex + 1;
      if (nextIdx < EXERCISES.length) {
        $('next-exercise-name').textContent = EXERCISES[nextIdx].name;
        setIllustration('next-illustration', EXERCISES[nextIdx]);
      }
    }
  }

  function setPauseUI(isPaused) {
    const pauseIcon = document.querySelector('.pause-icon');
    const playIcon  = document.querySelector('.play-icon');
    if (pauseIcon) pauseIcon.classList.toggle('hidden', isPaused);
    if (playIcon)  playIcon.classList.toggle('hidden', !isPaused);
    $('btn-pause').setAttribute('aria-label', isPaused ? 'Resume workout' : 'Pause workout');
  }

  // ── Complete screen ────────────────────────────────────────────────────────
  function showComplete(detail) {
    const { duration, exercisesDone, calories } = detail;
    $('complete-time').textContent = formatTime(duration);
    $('complete-exercises').textContent = exercisesDone;
    $('complete-calories').textContent = '~' + calories;

    // Save to history
    WorkoutHistory.addWorkout({
      date: new Date().toISOString(),
      duration,
      exercisesDone,
      calories
    });

    // Streak info
    const streaks = WorkoutHistory.getStreaks();
    const streakEl = $('complete-streak-info');
    if (streaks.current >= 2) {
      streakEl.innerHTML = `🔥 ${streaks.current} day streak! Keep it going!`;
      streakEl.style.display = '';
    } else {
      streakEl.innerHTML = '🎉 First workout today — great start!';
      streakEl.style.display = '';
    }

    showScreen('complete');
  }

  // ── History screen ─────────────────────────────────────────────────────────
  function renderHistory() {
    const streaks = WorkoutHistory.getStreaks();
    $('history-streak-count').textContent = streaks.current;
    $('history-total').textContent = WorkoutHistory.getTotalWorkouts();
    $('history-minutes').textContent = WorkoutHistory.getTotalMinutes();
    $('history-best-streak').textContent = streaks.best;

    renderCalendar();
    renderWorkoutList();
  }

  function renderCalendar() {
    const container = $('calendar-container');
    if (!container) return;
    const workoutDates = WorkoutHistory.getWorkoutDates();

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const startDow = (firstDay.getDay() + 6) % 7; // 0=Mon

    const monthName = firstDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    let html = `<div class="calendar">
      <div class="calendar-title">${monthName}</div>
      <div class="calendar-grid">
        <span class="cal-header">Mo</span>
        <span class="cal-header">Tu</span>
        <span class="cal-header">We</span>
        <span class="cal-header">Th</span>
        <span class="cal-header">Fr</span>
        <span class="cal-header">Sa</span>
        <span class="cal-header">Su</span>`;

    // Padding cells
    for (let p = 0; p < startDow; p++) {
      html += `<span class="cal-day empty"></span>`;
    }

    const todayStr = now.toISOString().slice(0, 10);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const hasWorkout = workoutDates.has(dateStr);
      const cls = ['cal-day', isToday ? 'today' : '', hasWorkout ? 'has-workout' : ''].filter(Boolean).join(' ');
      html += `<span class="${cls}" title="${dateStr}">${d}</span>`;
    }

    html += `</div></div>`;
    container.innerHTML = html;
  }

  function renderWorkoutList() {
    const list = $('workout-list');
    const records = WorkoutHistory.load();

    if (records.length === 0) {
      list.innerHTML = '<p class="empty-state">No workouts yet. Start your first workout!</p>';
      return;
    }

    list.innerHTML = records.slice(0, 20).map(r => `
      <div class="workout-record">
        <div class="record-icon">💪</div>
        <div class="record-details">
          <span class="record-date">${formatDate(r.date)}</span>
          <span class="record-meta">${r.exercisesDone} exercises · ${formatTime(r.duration)} · ~${r.calories} cal</span>
        </div>
      </div>
    `).join('');
  }

  // ── Audio toggle ───────────────────────────────────────────────────────────
  function renderAudioToggle() {
    const btn = $('btn-audio');
    if (!btn) return;
    btn.textContent = AudioSystem.isEnabled() ? '🔊' : '🔇';
    btn.setAttribute('aria-label', AudioSystem.isEnabled() ? 'Mute audio' : 'Unmute audio');
  }

  // ── Event wiring ───────────────────────────────────────────────────────────

  /** Reset UI and start a fresh workout */
  function beginWorkout() {
    WorkoutEngine.reset();
    showScreen('workout');
    setIllustration('exercise-illustration', EXERCISES[0]);
    $('phase-label').textContent = 'EXERCISE 1 / ' + EXERCISES.length;
    $('exercise-name').textContent = EXERCISES[0].name;
    $('exercise-muscles').textContent = EXERCISES[0].muscles;
    $('exercise-tips').textContent = EXERCISES[0].tips;
    $('timer-number').textContent = EXERCISE_DURATION;
    $('rest-timer-number').textContent = REST_DURATION;
    $('phase-exercise').classList.remove('hidden');
    $('phase-rest').classList.add('hidden');
    setRingProgress('timer-ring-fill', 1);
    $('workout-progress-fill').style.width = '0%';
    setPauseUI(false);
    WorkoutEngine.start();
  }

  function bindEvents() {
    // Start workout
    $('btn-start').addEventListener('click', beginWorkout);

    // Back/quit workout
    $('btn-back').addEventListener('click', () => {
      if (WorkoutEngine.getState() === 'running' || WorkoutEngine.getState() === 'paused') {
        if (confirm('Quit workout? Your progress will be lost.')) {
          WorkoutEngine.reset();
          showScreen('home');
        }
      } else {
        showScreen('home');
      }
    });

    // Pause / resume
    $('btn-pause').addEventListener('click', () => {
      if (WorkoutEngine.getState() === 'running') {
        WorkoutEngine.pause();
        setPauseUI(true);
      } else if (WorkoutEngine.getState() === 'paused') {
        WorkoutEngine.resume();
        setPauseUI(false);
      }
    });

    // Skip
    $('btn-skip').addEventListener('click', () => {
      WorkoutEngine.skip();
    });

    // Stop
    $('btn-stop').addEventListener('click', () => {
      if (confirm('Stop and quit workout?')) {
        WorkoutEngine.reset();
        showScreen('home');
      }
    });

    // Complete screen
    $('btn-do-again').addEventListener('click', beginWorkout);

    $('btn-go-home').addEventListener('click', () => {
      showScreen('home');
    });

    // Bottom nav
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.screen;
        if (WorkoutEngine.getState() === 'running' || WorkoutEngine.getState() === 'paused') {
          if (target !== 'workout' && !confirm('Leave workout? Your progress will be lost.')) return;
          if (target !== 'workout') WorkoutEngine.reset();
        }
        showScreen(target);
      });
    });

    // Audio toggle
    const audioBtn = $('btn-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        AudioSystem.setEnabled(!AudioSystem.isEnabled());
        renderAudioToggle();
      });
    }

    // WorkoutEngine events
    document.addEventListener('workout:tick', e => {
      updateWorkoutUI(e.detail);
    });

    document.addEventListener('workout:phase', e => {
      onPhaseChange(e.detail);
    });

    document.addEventListener('workout:pause', () => {
      setPauseUI(true);
    });

    document.addEventListener('workout:resume', () => {
      setPauseUI(false);
    });

    document.addEventListener('workout:complete', e => {
      showComplete(e.detail);
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    // CSS already sets stroke-dasharray on .ring-fill elements; set precise value via JS
    document.querySelectorAll('.ring-fill').forEach(el => {
      el.style.strokeDasharray = RING_CIRCUMFERENCE;
      el.style.strokeDashoffset = 0;
    });

    bindEvents();
    renderHome();
    renderAudioToggle();
    showScreen('home');

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.warn('Service Worker registration failed:', err);
      });
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
