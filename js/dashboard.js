(function () {
  var modal = document.getElementById('dashboard-modal');
  if (!modal) return;

  var titleEl = document.getElementById('dashboard-title');
  var listView = document.getElementById('dashboard-list-view');
  var contentEl = document.getElementById('dashboard-content');
  var detailView = document.getElementById('dashboard-detail-view');
  var filterButtons = document.querySelectorAll('#dashboard-filters .filter-tab');

  var state = { workouts: [], filter: 'all', loading: true, error: null };

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }
  modal.querySelectorAll('[data-close="dashboard"]').forEach(function (el) { el.addEventListener('click', close); });

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  function difficultyBadgeClass(difficulty) {
    if (difficulty === 'easy') return 'badge--easy';
    if (difficulty === 'medium') return 'badge--medium';
    if (difficulty === 'hard') return 'badge--hard';
    return '';
  }

  function fetchWorkouts() {
    state.loading = true;
    state.error = null;
    renderList();

    var params = new URLSearchParams({ limit: '20' });
    if (state.filter !== 'all') params.set('completed', state.filter === 'completed' ? 'true' : 'false');

    return window
      .apiFetch('/workouts?' + params.toString(), {
        headers: Object.assign({ 'Content-Type': 'application/json' }, window.Auth.getAuthHeader()),
      })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to fetch workouts');
        return res.json();
      })
      .then(function (data) {
        state.workouts = data.workouts || [];
        state.loading = false;
        renderList();
      })
      .catch(function (err) {
        state.error = err.message;
        state.loading = false;
        renderList();
      });
  }

  function updateWorkout(id, updates) {
    return window
      .apiFetch('/workouts/' + id, {
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, window.Auth.getAuthHeader()),
        body: JSON.stringify(updates),
      })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to update workout');
        return res.json();
      })
      .then(function (data) {
        state.workouts = state.workouts.map(function (w) { return w._id === id ? data.workout : w; });
        renderList();
        return data.workout;
      });
  }

  function deleteWorkout(id) {
    if (!window.confirm('Are you sure you want to delete this workout?')) return Promise.resolve();
    return window
      .apiFetch('/workouts/' + id, { method: 'DELETE', headers: window.Auth.getAuthHeader() })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to delete workout');
        state.workouts = state.workouts.filter(function (w) { return w._id !== id; });
        showList();
        renderList();
      });
  }

  function showDetail(workout) {
    listView.hidden = true;
    detailView.hidden = false;

    detailView.innerHTML =
      '<div class="detail-card">' +
      '<div class="detail-card__top">' +
      '<div><h3 style="font-size:1.4rem;font-weight:800;color:#4ade80;margin-bottom:0.4rem;">' + workout.muscleGroups.join(', ') + ' Workout</h3>' +
      '<p class="muted small">Generated on ' + formatDate(workout.generatedAt) + '</p></div>' +
      '<button class="modal__close" id="detail-back" aria-label="Back">&times;</button>' +
      '</div>' +
      '<div class="plan-block"><h3>\uD83D\uDCAA Workout Plan</h3><p style="white-space:pre-line;">' + workout.workoutPlan + '</p></div>' +
      '<div class="detail-card__meta">' +
      '<div><span class="label">Status:</span><span>' + (workout.completed ? 'Completed' : 'Pending') + '</span></div>' +
      (workout.difficulty ? '<div><span class="label">Difficulty:</span><span>' + workout.difficulty + '</span></div>' : '') +
      (workout.duration ? '<div><span class="label">Duration:</span><span>' + workout.duration + ' minutes</span></div>' : '') +
      '</div>' +
      (workout.notes ? '<div class="plan-block"><h3>\uD83D\uDCDD Notes</h3><p>' + workout.notes + '</p></div>' : '') +
      '<div class="detail-card__actions">' +
      (!workout.completed ? '<button class="btn btn--primary" id="detail-complete">Mark as Completed</button>' : '') +
      '<button class="btn btn--danger" id="detail-delete">Delete Workout</button>' +
      '</div>' +
      '</div>';

    detailView.querySelector('#detail-back').addEventListener('click', showList);
    var completeBtn = detailView.querySelector('#detail-complete');
    if (completeBtn) completeBtn.addEventListener('click', function () {
      updateWorkout(workout._id, { completed: true }).then(function (updated) { showDetail(updated); });
    });
    detailView.querySelector('#detail-delete').addEventListener('click', function () { deleteWorkout(workout._id); });
  }

  function showList() {
    detailView.hidden = true;
    listView.hidden = false;
  }

  function renderList() {
    if (state.loading) {
      contentEl.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading workouts...</p></div>';
      return;
    }
    if (state.error) {
      contentEl.innerHTML =
        '<div class="empty-state"><p style="color:#f87171;margin-bottom:1rem;">' + state.error + '</p>' +
        '<button class="btn btn--primary" id="retry-fetch">Try Again</button></div>';
      contentEl.querySelector('#retry-fetch').addEventListener('click', fetchWorkouts);
      return;
    }
    if (state.workouts.length === 0) {
      contentEl.innerHTML =
        '<div class="empty-state"><div class="emoji">\uD83D\uDCAA</div><p style="font-weight:600;margin-bottom:0.4rem;">No workouts found.</p>' +
        '<p>Start by generating your first workout!</p></div>';
      return;
    }

    contentEl.innerHTML = '<div class="workout-grid" id="workout-grid"></div>';
    var grid = contentEl.querySelector('#workout-grid');

    state.workouts.forEach(function (workout) {
      var card = document.createElement('div');
      card.className = 'workout-card';
      card.innerHTML =
        '<div class="workout-card__top">' +
        '<div><div class="workout-card__title">' + workout.muscleGroups.join(', ') + '</div>' +
        '<div class="workout-card__date">' + formatDate(workout.generatedAt) + '</div></div>' +
        '<div style="display:flex;gap:0.4rem;flex-shrink:0;">' +
        (workout.difficulty ? '<span class="badge ' + difficultyBadgeClass(workout.difficulty) + '">' + workout.difficulty + '</span>' : '') +
        (workout.completed ? '<span class="badge badge--done">\u2713 Done</span>' : '') +
        '</div></div>' +
        '<div class="workout-card__footer">' +
        '<button class="text-link" data-action="view">View Details &rarr;</button>' +
        '<div class="actions">' +
        (!workout.completed ? '<button class="text-link" data-action="complete">Mark Complete</button>' : '') +
        '<button class="text-link danger" data-action="delete">Delete</button>' +
        '</div></div>';

      card.querySelector('[data-action="view"]').addEventListener('click', function () { showDetail(workout); });
      var completeBtn = card.querySelector('[data-action="complete"]');
      if (completeBtn) completeBtn.addEventListener('click', function () { updateWorkout(workout._id, { completed: true }); });
      card.querySelector('[data-action="delete"]').addEventListener('click', function () { deleteWorkout(workout._id); });

      grid.appendChild(card);
    });
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      state.filter = btn.getAttribute('data-filter');
      fetchWorkouts();
    });
  });

  function open() {
    var user = window.Auth.getState().user;
    titleEl.textContent = 'Welcome back, ' + ((user && user.profile && user.profile.firstName) || (user && user.username) || '') + '!';
    showList();
    state.filter = 'all';
    filterButtons.forEach(function (b) { b.classList.toggle('is-active', b.getAttribute('data-filter') === 'all'); });
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    fetchWorkouts();
  }

  window.Dashboard = { open: open, close: close };
})();
