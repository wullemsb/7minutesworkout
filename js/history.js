'use strict';

/**
 * Workout history management using localStorage.
 */
const WorkoutHistory = (() => {
  const STORAGE_KEY = '7min_workout_history';

  /** Load all workout records */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /** Save all workout records */
  function save(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Could not save workout history:', e);
    }
  }

  /**
   * Add a completed workout record.
   * @param {Object} data
   * @param {string}  data.date         - ISO date string
   * @param {number}  data.duration     - seconds
   * @param {number}  data.exercisesDone
   * @param {number}  data.calories
   * @returns {Object} The saved record
   */
  function addWorkout(data) {
    const records = load();
    const record = {
      id: Date.now(),
      date: data.date || new Date().toISOString(),
      duration: data.duration || 0,
      exercisesDone: data.exercisesDone || 0,
      calories: data.calories || 0
    };
    records.unshift(record); // newest first
    save(records);
    return record;
  }

  /** Get total number of workouts */
  function getTotalWorkouts() {
    return load().length;
  }

  /** Get workouts in the current week (Mon–Sun) */
  function getThisWeekCount() {
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);

    return load().filter(r => new Date(r.date) >= monday).length;
  }

  /** Get total calories burned across all workouts */
  function getTotalCalories() {
    return load().reduce((sum, r) => sum + (r.calories || 0), 0);
  }

  /** Get total minutes of activity */
  function getTotalMinutes() {
    return Math.round(load().reduce((sum, r) => sum + (r.duration || 0), 0) / 60);
  }

  /**
   * Calculate current and best streak (consecutive days with at least one workout).
   * @returns {{ current: number, best: number }}
   */
  function getStreaks() {
    const records = load();
    if (records.length === 0) return { current: 0, best: 0 };

    // Collect unique workout dates (YYYY-MM-DD)
    const dates = [...new Set(
      records.map(r => r.date.slice(0, 10))
    )].sort().reverse(); // newest first

    let current = 0;
    let best = 0;
    let streak = 1;

    // Check if the most recent workout was today or yesterday
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (dates[0] !== today && dates[0] !== yesterday) {
      // streak broken — current is 0
      current = 0;
    } else {
      // Walk backwards through sorted dates counting consecutive days
      for (let i = 0; i < dates.length - 1; i++) {
        const d1 = new Date(dates[i]);
        const d2 = new Date(dates[i + 1]);
        const diff = Math.round((d1 - d2) / 86400000);
        if (diff === 1) {
          streak++;
        } else {
          break; // gap found — streak ends here
        }
      }
      current = streak;
    }

    // Best streak: scan all dates
    let tempStreak = 1;
    const sortedAsc = [...dates].sort();
    for (let i = 1; i < sortedAsc.length; i++) {
      const d1 = new Date(sortedAsc[i - 1]);
      const d2 = new Date(sortedAsc[i]);
      const diff = Math.round((d2 - d1) / 86400000);
      if (diff === 1) {
        tempStreak++;
        best = Math.max(best, tempStreak);
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    best = Math.max(best, tempStreak);

    return { current, best };
  }

  /**
   * Get the set of dates (YYYY-MM-DD) that have workouts (for calendar rendering).
   * @returns {Set<string>}
   */
  function getWorkoutDates() {
    const records = load();
    return new Set(records.map(r => r.date.slice(0, 10)));
  }

  /** Clear all history (for testing) */
  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    load,
    addWorkout,
    getTotalWorkouts,
    getThisWeekCount,
    getTotalCalories,
    getTotalMinutes,
    getStreaks,
    getWorkoutDates,
    clear
  };
})();
