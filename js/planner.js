(function () {
  var MUSCLE_GROUPS = [
    { id: 'chest-cb', name: 'Chest', image: './assets/torso-chest.png' },
    { id: 'back-cb', name: 'Back', image: './assets/torso-back.png' },
    { id: 'abs-cb', name: 'Abs', image: './assets/torso-abs.png' },
    { id: 'lower-back-cb', name: 'Lower Back', image: './assets/torso-lower-back.png' },
    { id: 'biceps-cb', name: 'Biceps', image: './assets/arms-biceps.png' },
    { id: 'triceps-cb', name: 'Triceps', image: './assets/arms-triceps.png' },
    { id: 'forearms-cb', name: 'Forearms', image: './assets/arms-forearms.png' },
    { id: 'shoulders-cb', name: 'Shoulders', image: './assets/arms-shoulders.png' },
    { id: 'quadriceps-cb', name: 'Quadriceps', image: './assets/legs-quads.png' },
    { id: 'hamstrings-cb', name: 'Hamstrings', image: './assets/legs-hamstrings.png' },
    { id: 'glutes-cb', name: 'Glutes', image: './assets/legs-glutes.png' },
    { id: 'calves-cb', name: 'Calves', image: './assets/legs-calves.png' },
    { id: 'abductors-cb', name: 'Abductors', image: './assets/legs-abductors.png' },
    { id: 'adductors-cb', name: 'Adductors', image: './assets/legs-adductors.png' },
  ];

  var grid = document.getElementById('muscle-grid');
  var form = document.getElementById('planner-form');
  var generateBtn = document.getElementById('generate-btn');
  var generateLabel = document.getElementById('generate-label');
  var planSection = document.getElementById('plan');
  var planBody = document.getElementById('plan-body');
  var guestNote = document.getElementById('plan-guest-note');
  if (!grid || !form) return;

  var selected = [];

  MUSCLE_GROUPS.forEach(function (group) {
    var tile = document.createElement('div');
    tile.className = 'muscle-tile';
    tile.style.backgroundImage = 'url(' + group.image + ')';
    tile.innerHTML =
      '<span class="muscle-tile__label">' + group.name + '</span>' +
      '<span class="muscle-tile__check" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg></span>';

    tile.addEventListener('click', function () {
      var idx = selected.indexOf(group.name);
      var isSelected;
      if (idx === -1) { selected.push(group.name); isSelected = true; }
      else { selected.splice(idx, 1); isSelected = false; }
      tile.classList.toggle('is-selected', isSelected);
      tile.querySelector('.muscle-tile__check').hidden = !isSelected;
      generateBtn.disabled = selected.length === 0;
    });

    grid.appendChild(tile);
  });

  function buildExerciseCard(exercise) {
    var card = document.createElement('div');
    card.className = 'exercise-card';
    card.innerHTML =
      '<button type="button" class="exercise-card__head">' +
      '<div>' +
      '<span class="exercise-card__tag">' + exercise.muscleGroup + '</span>' +
      '<div class="exercise-card__name">' + exercise.name + '</div>' +
      '<div class="exercise-card__meta">' +
      '<span><b>' + exercise.sets + '</b> sets</span>' +
      '<span><b>' + exercise.reps + '</b> reps</span>' +
      '<span><b>' + exercise.rest + '</b> rest</span>' +
      '</div></div>' +
      '<svg class="exercise-card__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>' +
      '</button>' +
      '<div class="exercise-card__details"><div class="exercise-card__details-inner">' +
      '<h4>How to Perform</h4><p>' + exercise.instructions + '</p>' +
      '</div></div>';

    card.querySelector('.exercise-card__head').addEventListener('click', function () {
      card.classList.toggle('is-open');
    });
    return card;
  }

  function renderPlan(plan) {
    planBody.innerHTML = '';

    if (typeof plan !== 'object' || plan === null) {
      var pre = document.createElement('pre');
      pre.style.whiteSpace = 'pre-wrap';
      pre.style.fontFamily = 'inherit';
      pre.textContent = String(plan);
      planBody.appendChild(pre);
      planSection.hidden = false;
      return;
    }

    if (plan.introduction) {
      var intro = document.createElement('div');
      intro.className = 'plan-block';
      intro.innerHTML = '<h3>Introduction</h3><p>' + plan.introduction + '</p>';
      planBody.appendChild(intro);
    }
    if (plan.warmup) {
      var warm = document.createElement('div');
      warm.className = 'plan-block';
      warm.innerHTML = '<h3>Warm-up</h3><p>' + plan.warmup + '</p>';
      planBody.appendChild(warm);
    }
    if (Array.isArray(plan.exercises) && plan.exercises.length) {
      var exHeading = document.createElement('h3');
      exHeading.style.margin = '0.5rem 0 0.75rem';
      exHeading.style.fontSize = '1.2rem';
      exHeading.textContent = 'Exercises';
      planBody.appendChild(exHeading);
      plan.exercises.forEach(function (ex) { planBody.appendChild(buildExerciseCard(ex)); });
    }
    if (plan.cooldown) {
      var cool = document.createElement('div');
      cool.className = 'plan-block';
      cool.innerHTML = '<h3>Cool-down</h3><p>' + plan.cooldown + '</p>';
      planBody.appendChild(cool);
    }
    if (plan.tips) {
      var tips = document.createElement('div');
      tips.className = 'plan-block plan-block--tips';
      tips.innerHTML = '<h3>\uD83D\uDCA1 Tips</h3><p>' + plan.tips + '</p>';
      planBody.appendChild(tips);
    }

    planSection.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (selected.length === 0) return;

    generateBtn.disabled = true;
    generateLabel.textContent = 'Generating...';
    planSection.hidden = true;
    guestNote.hidden = true;

    var isAuthed = window.Auth.isAuthenticated();
    var endpoint = isAuthed ? '/workout-submit' : '/workout-submit-demo';
    var headers = Object.assign({ 'Content-Type': 'application/json' }, isAuthed ? window.Auth.getAuthHeader() : {});

    window
      .apiFetch(endpoint, { method: 'POST', headers: headers, body: JSON.stringify({ muscleGroups: selected }) })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.workoutPlan) {
          var parsed;
          try { parsed = JSON.parse(data.workoutPlan); } catch (err) { parsed = data.workoutPlan; }
          renderPlan(parsed);
          guestNote.hidden = isAuthed;
          if (data.saved) {
            setTimeout(function () { window.alert('\u2705 Workout saved to your history!'); }, 400);
          }
        } else if (data.error) {
          renderPlan('Error generating workout plan: ' + data.error);
        }
      })
      .catch(function () {
        renderPlan('Error connecting to server. Please try again.');
      })
      .finally(function () {
        generateBtn.disabled = selected.length === 0;
        generateLabel.textContent = 'Generate Workout Plan';
      });
  });

  window.Planner = { getSelected: function () { return selected.slice(); } };
})();
