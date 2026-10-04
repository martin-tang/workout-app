(function () {
  var headerActions = document.getElementById('header-actions');
  var welcomeChip = document.getElementById('welcome-chip');
  var appSub = document.getElementById('app-sub');

  function gearIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';
  }

  function renderHeader(state) {
    headerActions.innerHTML = '';

    if (state.user) {
      welcomeChip.hidden = false;
      welcomeChip.textContent = 'Welcome, ' + (state.user.profile && state.user.profile.firstName ? state.user.profile.firstName : state.user.username) + '!';
      appSub.textContent = 'Select muscle groups to generate a personalized workout plan tailored to your fitness goals.';

      var settingsBtn = document.createElement('button');
      settingsBtn.type = 'button';
      settingsBtn.className = 'btn btn--icon';
      settingsBtn.title = 'Settings';
      settingsBtn.innerHTML = gearIcon();
      settingsBtn.addEventListener('click', function () { window.SettingsModal.open(); });

      var dashboardBtn = document.createElement('button');
      dashboardBtn.type = 'button';
      dashboardBtn.className = 'btn btn--secondary';
      dashboardBtn.textContent = 'My Workouts';
      dashboardBtn.addEventListener('click', function () { window.Dashboard.open(); });

      var logoutBtn = document.createElement('button');
      logoutBtn.type = 'button';
      logoutBtn.className = 'btn btn--ghost';
      logoutBtn.textContent = 'Logout';
      logoutBtn.addEventListener('click', function () { window.Auth.logout(); });

      headerActions.appendChild(settingsBtn);
      headerActions.appendChild(dashboardBtn);
      headerActions.appendChild(logoutBtn);
    } else {
      welcomeChip.hidden = true;
      appSub.textContent = 'Select muscle groups to generate a workout plan. Sign up to save your workouts and track your progress!';

      var loginBtn = document.createElement('button');
      loginBtn.type = 'button';
      loginBtn.className = 'btn btn--primary';
      loginBtn.textContent = 'Login / Sign Up';
      loginBtn.addEventListener('click', function () { window.AuthModal.open('login'); });

      headerActions.appendChild(loginBtn);
    }
  }

  window.Auth.subscribe(renderHeader);
  window.Auth.init();
})();
