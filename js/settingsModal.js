(function () {
  var modal = document.getElementById('settings-modal');
  if (!modal) return;

  var form = document.getElementById('settings-form');
  var successEl = document.getElementById('settings-success');
  var errorEl = document.getElementById('settings-error');
  var levelsWrap = document.getElementById('set-levels');
  var goalsWrap = document.getElementById('set-goals');

  var FITNESS_LEVELS = [
    { value: 'beginner', label: 'Beginner', description: 'New to exercise or getting back into fitness' },
    { value: 'intermediate', label: 'Intermediate', description: 'Regular exercise routine for 6+ months' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced athlete or fitness enthusiast' },
  ];
  var FITNESS_GOALS = [
    { value: 'weight_loss', label: 'Weight Loss', icon: '\uD83D\uDD25' },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: '\uD83D\uDCAA' },
    { value: 'strength', label: 'Strength', icon: '\uD83C\uDFCB\uFE0F' },
    { value: 'endurance', label: 'Endurance', icon: '\uD83C\uDFC3' },
    { value: 'flexibility', label: 'Flexibility', icon: '\uD83E\uDD38' },
    { value: 'general_fitness', label: 'General Fitness', icon: '\u26A1' },
  ];

  FITNESS_LEVELS.forEach(function (level) {
    var label = document.createElement('label');
    label.className = 'radio-tile';
    label.innerHTML =
      '<input type="radio" name="fitnessLevel" value="' + level.value + '" />' +
      '<div><div class="title">' + level.label + '</div><div class="desc">' + level.description + '</div></div>';
    var input = label.querySelector('input');
    input.addEventListener('change', function () {
      levelsWrap.querySelectorAll('.radio-tile').forEach(function (el) { el.classList.remove('is-checked'); });
      label.classList.add('is-checked');
    });
    levelsWrap.appendChild(label);
  });

  FITNESS_GOALS.forEach(function (goal) {
    var label = document.createElement('label');
    label.className = 'check-tile';
    label.innerHTML =
      '<input type="checkbox" value="' + goal.value + '" />' +
      '<span>' + goal.icon + ' ' + goal.label + '</span>';
    var input = label.querySelector('input');
    input.addEventListener('change', function () { label.classList.toggle('is-checked', input.checked); });
    goalsWrap.appendChild(label);
  });

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    successEl.hidden = true;
    errorEl.hidden = true;
  }
  modal.querySelectorAll('[data-close="settings"]').forEach(function (el) { el.addEventListener('click', close); });

  function populate() {
    var user = window.Auth.getState().user;
    if (!user) return;
    var profile = user.profile || {};
    form.firstName.value = profile.firstName || '';
    form.lastName.value = profile.lastName || '';

    levelsWrap.querySelectorAll('input').forEach(function (input) {
      var checked = input.value === (profile.fitnessLevel || 'beginner');
      input.checked = checked;
      input.closest('.radio-tile').classList.toggle('is-checked', checked);
    });
    var goals = profile.goals || [];
    goalsWrap.querySelectorAll('input').forEach(function (input) {
      var checked = goals.indexOf(input.value) !== -1;
      input.checked = checked;
      input.closest('.check-tile').classList.toggle('is-checked', checked);
    });
  }

  function open() {
    populate();
    successEl.hidden = true;
    errorEl.hidden = true;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    successEl.hidden = true;
    errorEl.hidden = true;

    var fitnessLevel = (levelsWrap.querySelector('input:checked') || {}).value || 'beginner';
    var goals = Array.prototype.slice.call(goalsWrap.querySelectorAll('input:checked')).map(function (i) { return i.value; });

    var payload = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      fitnessLevel: fitnessLevel,
      goals: goals,
    };

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    window.Auth.updateProfile(payload).then(function (result) {
      submitBtn.disabled = false;
      if (result.success) {
        successEl.textContent = 'Settings updated successfully!';
        successEl.hidden = false;
        setTimeout(function () { successEl.hidden = true; }, 3000);
      } else {
        errorEl.textContent = result.error || 'Failed to update settings';
        errorEl.hidden = false;
      }
    });
  });

  window.SettingsModal = { open: open, close: close };
})();
