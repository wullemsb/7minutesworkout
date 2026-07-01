'use strict';

const EXERCISE_DURATION = 30; // seconds per exercise
const REST_DURATION = 10;     // seconds between exercises

const EXERCISES = [
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    duration: EXERCISE_DURATION,
    description: 'Stand with feet together and arms at your sides. Jump while spreading your feet shoulder-width apart and raising your arms overhead, then return to the starting position.',
    muscles: 'Full Body · Cardio',
    tips: 'Land softly on the balls of your feet. Keep a steady, bouncy rhythm throughout.',
    intensity: 3,
    svg: `<svg viewBox="0 0 120 155" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="Jumping Jacks illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-jumping-jacks">
        <circle cx="60" cy="19" r="11" stroke="currentColor"/>
        <line x1="60" y1="30" x2="60" y2="82"/>
        <line x1="60" y1="47" x2="22" y2="26"/>
        <line x1="60" y1="47" x2="98" y2="26"/>
        <line x1="60" y1="82" x2="32" y2="128"/>
        <line x1="60" y1="82" x2="88" y2="128"/>
        <circle cx="22" cy="22" r="3" fill="currentColor" stroke="none"/>
        <circle cx="98" cy="22" r="3" fill="currentColor" stroke="none"/>
      </g>
    </svg>`
  },
  {
    id: 'wall-sit',
    name: 'Wall Sit',
    duration: EXERCISE_DURATION,
    description: 'Stand with your back flat against a wall and slide down until your thighs are parallel to the floor. Hold the position with knees at 90 degrees.',
    muscles: 'Quadriceps · Glutes · Calves',
    tips: 'Keep your back flat on the wall. Don\'t let your knees go past your toes.',
    intensity: 2,
    svg: `<svg viewBox="0 0 120 155" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="Wall Sit illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-wall-sit">
        <line x1="22" y1="20" x2="22" y2="145" stroke="#475569" stroke-width="6" stroke-linecap="butt"/>
        <circle cx="44" cy="38" r="11" stroke="currentColor"/>
        <line x1="30" y1="49" x2="30" y2="98"/>
        <line x1="30" y1="98" x2="82" y2="98"/>
        <line x1="82" y1="98" x2="82" y2="135"/>
        <line x1="30" y1="65" x2="18" y2="55"/>
        <line x1="30" y1="65" x2="50" y2="52"/>
      </g>
    </svg>`
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    duration: EXERCISE_DURATION,
    description: 'Start in a high plank position with hands shoulder-width apart. Lower your chest to the floor by bending your elbows, then push back up to the starting position.',
    muscles: 'Chest · Triceps · Shoulders',
    tips: 'Keep your core tight and body in a straight line. Don\'t let your hips sag or rise.',
    intensity: 3,
    svg: `<svg viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="Push-ups illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-push-ups">
        <line x1="10" y1="95" x2="140" y2="95" stroke="#475569" stroke-width="2"/>
        <circle cx="22" cy="60" r="10" stroke="currentColor"/>
        <line x1="30" y1="65" x2="105" y2="75"/>
        <line x1="46" y1="67" x2="42" y2="90"/>
        <line x1="42" y1="90" x2="62" y2="90"/>
        <line x1="90" y1="73" x2="88" y2="90"/>
        <line x1="88" y1="90" x2="108" y2="90"/>
        <line x1="105" y1="75" x2="130" y2="80"/>
      </g>
    </svg>`
  },
  {
    id: 'abdominal-crunch',
    name: 'Abdominal Crunch',
    duration: EXERCISE_DURATION,
    description: 'Lie on your back with knees bent and feet flat on the floor. Place hands behind your head and curl your upper body toward your knees, then lower back down.',
    muscles: 'Abdominals · Core',
    tips: 'Exhale as you crunch up. Keep your lower back pressed to the floor. Avoid pulling your neck.',
    intensity: 2,
    svg: `<svg viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="Abdominal Crunch illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-crunch">
        <line x1="10" y1="100" x2="140" y2="100" stroke="#475569" stroke-width="2"/>
        <circle cx="35" cy="62" r="10" stroke="currentColor"/>
        <line x1="43" y1="68" x2="75" y2="88"/>
        <line x1="75" y1="88" x2="105" y2="88"/>
        <line x1="105" y1="88" x2="120" y2="100"/>
        <line x1="80" y1="88" x2="95" y2="68"/>
        <line x1="95" y1="68" x2="90" y2="100"/>
        <line x1="28" y1="56" x2="18" y2="50"/>
        <line x1="28" y1="56" x2="42" y2="52"/>
      </g>
    </svg>`
  },
  {
    id: 'step-up',
    name: 'Step-up onto Chair',
    duration: EXERCISE_DURATION,
    description: 'Stand in front of a sturdy chair. Step up onto the seat with one foot, then bring the other foot up. Step back down and alternate the leading foot.',
    muscles: 'Quadriceps · Glutes · Hamstrings',
    tips: 'Use a stable chair or step. Drive through your heel as you step up. Keep your chest tall.',
    intensity: 3,
    svg: `<svg viewBox="0 0 120 155" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="Step-up illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-step-up">
        <line x1="20" y1="98" x2="65" y2="98" stroke="#f472b6" stroke-width="4"/>
        <line x1="20" y1="98" x2="20" y2="135" stroke="#f472b6" stroke-width="4"/>
        <line x1="65" y1="98" x2="65" y2="135" stroke="#f472b6" stroke-width="4"/>
        <circle cx="82" cy="28" r="11" stroke="currentColor"/>
        <line x1="82" y1="39" x2="82" y2="88"/>
        <line x1="82" y1="55" x2="68" y2="45"/>
        <line x1="82" y1="55" x2="96" y2="45"/>
        <line x1="82" y1="88" x2="55" y2="98"/>
        <line x1="82" y1="88" x2="95" y2="110"/>
        <line x1="95" y1="110" x2="95" y2="135"/>
      </g>
    </svg>`
  },
  {
    id: 'squat',
    name: 'Squat',
    duration: EXERCISE_DURATION,
    description: 'Stand with feet shoulder-width apart. Lower your body as if sitting in a chair, keeping your chest up and knees behind your toes, then rise back up.',
    muscles: 'Quadriceps · Glutes · Hamstrings',
    tips: 'Keep your weight on your heels. Drive your knees out. Aim for thighs parallel to the floor.',
    intensity: 3,
    svg: `<svg viewBox="0 0 120 155" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="Squat illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-squat">
        <circle cx="60" cy="22" r="11" stroke="currentColor"/>
        <line x1="60" y1="33" x2="60" y2="72"/>
        <line x1="60" y1="48" x2="32" y2="42"/>
        <line x1="60" y1="48" x2="88" y2="42"/>
        <line x1="60" y1="72" x2="38" y2="98"/>
        <line x1="38" y1="98" x2="30" y2="128"/>
        <line x1="60" y1="72" x2="82" y2="98"/>
        <line x1="82" y1="98" x2="90" y2="128"/>
      </g>
    </svg>`
  },
  {
    id: 'triceps-dip',
    name: 'Triceps Dip on Chair',
    duration: EXERCISE_DURATION,
    description: 'Sit on the edge of a sturdy chair with hands gripping the seat. Slide your hips off the chair, lower your body by bending your elbows, then push back up.',
    muscles: 'Triceps · Shoulders · Chest',
    tips: 'Keep your back close to the chair. Don\'t lock your elbows at the top. Legs straight for more challenge.',
    intensity: 2,
    svg: `<svg viewBox="0 0 150 120" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="Triceps Dip illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-triceps-dip">
        <line x1="65" y1="58" x2="110" y2="58" stroke="#f472b6" stroke-width="4"/>
        <line x1="65" y1="58" x2="65" y2="100" stroke="#f472b6" stroke-width="4"/>
        <line x1="110" y1="58" x2="110" y2="100" stroke="#f472b6" stroke-width="4"/>
        <circle cx="50" cy="32" r="10" stroke="currentColor"/>
        <line x1="50" y1="42" x2="55" y2="72"/>
        <line x1="55" y1="72" x2="70" y2="58"/>
        <line x1="55" y1="72" x2="40" y2="58"/>
        <line x1="55" y1="72" x2="45" y2="100"/>
        <line x1="45" y1="100" x2="90" y2="100"/>
        <line x1="90" y1="100" x2="100" y2="88"/>
      </g>
    </svg>`
  },
  {
    id: 'plank',
    name: 'Plank',
    duration: EXERCISE_DURATION,
    description: 'Get into a forearm plank position with elbows under your shoulders. Hold your body in a straight line from head to heels, engaging your core throughout.',
    muscles: 'Core · Shoulders · Back',
    tips: 'Don\'t hold your breath — breathe steadily. Tighten your glutes. Avoid lifting or dropping your hips.',
    intensity: 2,
    svg: `<svg viewBox="0 0 155 110" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="Plank illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-plank">
        <line x1="10" y1="90" x2="145" y2="90" stroke="#475569" stroke-width="2"/>
        <circle cx="18" cy="58" r="10" stroke="currentColor"/>
        <line x1="26" y1="63" x2="120" y2="63"/>
        <line x1="38" y1="63" x2="32" y2="85"/>
        <line x1="32" y1="85" x2="55" y2="85"/>
        <line x1="55" y1="85" x2="58" y2="63"/>
        <line x1="120" y1="63" x2="128" y2="80"/>
        <line x1="128" y1="80" x2="140" y2="80"/>
      </g>
    </svg>`
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    duration: EXERCISE_DURATION,
    description: 'Run in place, driving your knees up to hip height with each step. Pump your arms in rhythm with your legs for a full cardio blast.',
    muscles: 'Hip Flexors · Core · Cardio',
    tips: 'Stay on the balls of your feet. Drive your arms to help lift your knees higher. Keep your core tight.',
    intensity: 3,
    svg: `<svg viewBox="0 0 120 155" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="High Knees illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-high-knees">
        <circle cx="58" cy="22" r="11" stroke="currentColor"/>
        <line x1="58" y1="33" x2="58" y2="82"/>
        <line x1="58" y1="50" x2="40" y2="35"/>
        <line x1="58" y1="50" x2="76" y2="65"/>
        <line x1="58" y1="82" x2="72" y2="62"/>
        <line x1="72" y1="62" x2="78" y2="82"/>
        <line x1="58" y1="82" x2="48" y2="108"/>
        <line x1="48" y1="108" x2="42" y2="130"/>
      </g>
    </svg>`
  },
  {
    id: 'lunge',
    name: 'Lunge',
    duration: EXERCISE_DURATION,
    description: 'Step forward with one foot and lower your back knee toward the floor until both knees are at 90 degrees. Push back to standing and repeat on the other leg.',
    muscles: 'Quadriceps · Glutes · Hamstrings',
    tips: 'Keep your front knee above your ankle. Don\'t let your back knee touch the floor. Stay upright.',
    intensity: 3,
    svg: `<svg viewBox="0 0 140 155" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="Lunge illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-lunge">
        <circle cx="65" cy="22" r="11" stroke="currentColor"/>
        <line x1="65" y1="33" x2="65" y2="78"/>
        <line x1="65" y1="50" x2="48" y2="40"/>
        <line x1="65" y1="50" x2="82" y2="40"/>
        <line x1="65" y1="78" x2="88" y2="105"/>
        <line x1="88" y1="105" x2="95" y2="128"/>
        <line x1="65" y1="78" x2="42" y2="100"/>
        <line x1="42" y1="100" x2="28" y2="128"/>
        <circle cx="28" cy="132" r="4" fill="currentColor" stroke="none"/>
      </g>
    </svg>`
  },
  {
    id: 'push-up-rotation',
    name: 'Push-up & Rotation',
    duration: EXERCISE_DURATION,
    description: 'Perform a push-up then rotate your body to the side, raising one arm toward the ceiling to form a T shape. Alternate sides with each rep.',
    muscles: 'Chest · Core · Shoulders · Obliques',
    tips: 'Stack your feet or stagger them for balance. Keep hips level during the rotation. Breathe steadily.',
    intensity: 4,
    svg: `<svg viewBox="0 0 155 120" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="Push-up Rotation illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-push-rotation">
        <line x1="10" y1="95" x2="145" y2="95" stroke="#475569" stroke-width="2"/>
        <circle cx="22" cy="57" r="10" stroke="currentColor"/>
        <line x1="30" y1="62" x2="105" y2="72"/>
        <line x1="46" y1="65" x2="42" y2="88"/>
        <line x1="42" y1="88" x2="62" y2="88"/>
        <line x1="62" y1="65" x2="72" y2="42"/>
        <line x1="105" y1="72" x2="128" y2="76"/>
      </g>
    </svg>`
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    duration: EXERCISE_DURATION,
    description: 'Lie on your side and lift your body on one forearm, keeping feet stacked. Hold your body in a straight diagonal line. Switch sides halfway through.',
    muscles: 'Obliques · Core · Shoulders',
    tips: 'Keep your hips lifted and body straight. Don\'t let your hip drop toward the floor. Breathe steadily.',
    intensity: 3,
    svg: `<svg viewBox="0 0 155 120" xmlns="http://www.w3.org/2000/svg" class="ex-svg" aria-label="Side Plank illustration">
      <g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none" class="ex-side-plank">
        <line x1="10" y1="95" x2="145" y2="95" stroke="#475569" stroke-width="2"/>
        <circle cx="30" cy="52" r="10" stroke="currentColor"/>
        <line x1="38" y1="57" x2="115" y2="80"/>
        <line x1="38" y1="57" x2="35" y2="82"/>
        <line x1="35" y1="82" x2="58" y2="88"/>
        <line x1="58" y1="88" x2="58" y2="62"/>
        <line x1="58" y1="62" x2="72" y2="42"/>
        <line x1="115" y1="80" x2="132" y2="88"/>
      </g>
    </svg>`
  }
];
