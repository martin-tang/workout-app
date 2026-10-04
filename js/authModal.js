(function () {
  var modal = document.getElementById('auth-modal');
  if (!modal) return;

  var title = document.getElementById('auth-modal-title');
  var loginView = document.getElementById('login-view');
  var registerView = document.getElementById('register-view');
  var loginForm = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');
  var loginError = document.getElementById('login-error');
  var registerError = document.getElementById('register-error');
  var goalsWrap = document.getElementById('reg-goals');

  var FITNESS_GOALS = [
    { value: 'weight_loss', label: 'Weight Loss', icon: '\uD83D\uDD25' },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: '\uD83D\uDCAA' },
    { value: 'strength', label: 'Strength', icon: '\uD83C\uDFCB\uFE0F' },
    { value: 'endurance', label: 'Endurance', icon: '\uD83C\uDFC3' },
    { value: 'flexibility', label: 'Flexibility', icon: '\uD83E\uDD38' },
    { value: 'general_fitness', label: 'General Fitness', icon: '\u26A1' },
  ];

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

  function open(mode) {
    showMode(mode || 'login');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }
  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    loginForm.reset();
    registerForm.reset();
    hideError(loginError);
    hideError(registerError);
    clearFieldErrors(loginForm);
    clearFieldErrors(registerForm);
  }
  function showMode(mode) {
    var isLogin = mode === 'login';
    loginView.hidden = !isLogin;
    registerView.hidden = isLogin;
    title.textContent = isLogin ? 'Welcome Back' : 'Create Account';
  }

  modal.querySelectorAll('[data-close="auth"]').forEach(function (el) { el.addEventListener('click', close); });
  document.getElementById('to-register').addEventListener('click', function () { showMode('register'); });
  document.getElementById('to-login').addEventListener('click', function () { showMode('login'); });

  function showError(el, msg) { el.textContent = msg; el.hidden = false; }
  function hideError(el) { el.hidden = true; el.textContent = ''; }

  function setFieldError(formEl, fieldName, msg) {
    var errEl = formEl.querySelector('#' + (formEl === loginForm ? 'login' : 'reg') + '-' + fieldName + '-error');
    if (errEl) { errEl.textContent = msg; errEl.hidden = false; }
  }
  function clearFieldErrors(formEl) {
    formEl.querySelectorAll('.field-error').forEach(function (el) { el.hidden = true; el.textContent = ''; });
  }

  // ----- Login -----
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    hideError(loginError);
    clearFieldErrors(loginForm);

    var email = loginForm.email.value.trim();
    var password = loginForm.password.value;
    var hasError = false;
    if (!email) { setFieldError(loginForm, 'email', 'Email is required'); hasError = true; }
    if (!password) { setFieldError(loginForm, 'password', 'Password is required'); hasError = true; }
    if (hasError) return;

    var submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    window.Auth.login(email, password).then(function (result) {
      submitBtn.disabled = false;
      if (result.success) {
        close();
      } else {
        showError(loginError, result.error);
      }
    });
  });

  // ----- Register -----
  registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    hideError(registerError);
    clearFieldErrors(registerForm);

    var data = {
      username: registerForm.username.value.trim(),
      email: registerForm.email.value.trim(),
      password: registerForm.password.value,
      firstName: registerForm.firstName.value.trim(),
      lastName: registerForm.lastName.value.trim(),
      fitnessLevel: registerForm.fitnessLevel.value,
      goals: Array.prototype.slice.call(goalsWrap.querySelectorAll('input:checked')).map(function (i) { return i.value; }),
    };
    var confirmPassword = registerForm.confirmPassword.value;

    var errors = {};
    if (!data.username) errors.username = 'Username is required';
    else if (data.username.length < 3) errors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) errors.username = 'Username can only contain letters, numbers, and underscores';

    if (!data.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Please enter a valid email address';

    if (!data.password) errors.password = 'Password is required';
    else if (data.password.length < 6) errors.password = 'Password must be at least 6 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (data.password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      Object.keys(errors).forEach(function (field) { setFieldError(registerForm, field, errors[field]); });
      return;
    }

    var submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    window.Auth.register(data).then(function (result) {
      submitBtn.disabled = false;
      if (result.success) {
        close();
      } else if (result.errors) {
        result.errors.forEach(function (err) {
          if (err.path) setFieldError(registerForm, err.path, err.msg);
        });
      } else {
        showError(registerError, result.error);
      }
    });
  });

  window.AuthModal = { open: open, close: close };
})();
