# 7minutesworkout
A mobile app that helps you during you through the 7 minutes workout exercices.

## Live App

Hosted on GitHub Pages: https://wullemsb.github.io/7minutesworkout/

## Features

- 🎨 **Visually attractive** — dark-themed UI with animated timer ring, gradient accents and smooth transitions
- 🔊 **Audio cues** — exercise names announced via Web Speech API; countdown beeps and a victory fanfare via Web Audio API
- ⏱️ **Countdown timer** — animated SVG ring shows remaining time for each exercise and rest period
- 🏋️ **Visual exercise guides** — animated SVG stick-figure illustration + tips for all 12 exercises
- 📅 **Workout history** — streak tracking, calendar heatmap, and per-workout stats stored in `localStorage`
- 📱 **Screen stays on** — Wake Lock API keeps the display active during a workout
- ⏸️ **Pause & resume** — pause any exercise or rest period and pick up where you left off
- 📲 **Installable PWA** — works offline via service worker; add to home screen on iOS/Android

## The 12 Exercises

Each exercise lasts **30 seconds** with a **10-second rest** between them (~7 min 50 sec total):

1. Jumping Jacks
2. Wall Sit
3. Push-ups
4. Abdominal Crunch
5. Step-up onto Chair
6. Squat
7. Triceps Dip on Chair
8. Plank
9. High Knees
10. Lunge
11. Push-up & Rotation
12. Side Plank

## Development

No build step required — this is a pure vanilla HTML/CSS/JS PWA.

Open `index.html` directly in a browser, or serve with any static HTTP server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Deployment (GitHub Pages)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys the app to GitHub Pages on every push to `main`.

**One-time setup:**

1. Go to **Settings → Pages** in this repository
2. Under *Build and deployment*, select **GitHub Actions** as the source
3. Push to `main` — the workflow will deploy automatically

The live URL will be `https://<your-username>.github.io/7minutesworkout/`.
