// Lightweight auth store, ported from AuthContext.jsx.
// Exposes window.Auth with the same surface used across modules.
(function () {
  var state = {
    user: null,
    loading: true,
    error: null,
  };
  var listeners = [];

  function notify() {
    listeners.forEach(function (cb) { cb(state); });
  }

  function setState(patch) {
    Object.assign(state, patch);
    notify();
  }

  function getToken() {
    return localStorage.getItem('token');
  }

  function getAuthHeader() {
    var token = getToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  function checkAuth() {
    var token = getToken();
    if (!token) {
      setState({ loading: false });
      return Promise.resolve();
    }
    return window
      .apiFetch('/auth/verify', { headers: getAuthHeader() })
      .then(function (res) {
        if (res.ok) return res.json();
        throw new Error('invalid token');
      })
      .then(function (data) {
        setState({ user: data.user, loading: false });
      })
      .catch(function () {
        localStorage.removeItem('token');
        setState({ user: null, loading: false });
      });
  }

  function login(email, password) {
    setState({ error: null, loading: true });
    return window
      .apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      })
      .then(function (res) { return res.json().then(function (data) { return { res: res, data: data }; }); })
      .then(function (_ref) {
        var res = _ref.res, data = _ref.data;
        if (res.ok) {
          localStorage.setItem('token', data.token);
          setState({ user: data.user, loading: false });
          return { success: true, user: data.user };
        }
        setState({ error: data.error || 'Login failed', loading: false });
        return { success: false, error: data.error || 'Login failed' };
      })
      .catch(function () {
        setState({ error: 'Network error. Please try again.', loading: false });
        return { success: false, error: 'Network error. Please try again.' };
      });
  }

  function register(userData) {
    setState({ error: null, loading: true });
    return window
      .apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      .then(function (res) { return res.json().then(function (data) { return { res: res, data: data }; }); })
      .then(function (_ref) {
        var res = _ref.res, data = _ref.data;
        if (res.ok) {
          localStorage.setItem('token', data.token);
          setState({ user: data.user, loading: false });
          return { success: true, user: data.user };
        }
        var msg = data.error || (data.errors && data.errors[0] && data.errors[0].msg) || 'Registration failed';
        setState({ error: msg, loading: false });
        return { success: false, error: msg, errors: data.errors };
      })
      .catch(function () {
        setState({ error: 'Network error. Please try again.', loading: false });
        return { success: false, error: 'Network error. Please try again.' };
      });
  }

  function logout() {
    localStorage.removeItem('token');
    setState({ user: null, error: null });
  }

  function updateProfile(profileData) {
    setState({ error: null });
    return window
      .apiFetch('/auth/profile', {
        method: 'PUT',
        headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeader()),
        body: JSON.stringify(profileData),
      })
      .then(function (res) { return res.json().then(function (data) { return { res: res, data: data }; }); })
      .then(function (_ref) {
        var res = _ref.res, data = _ref.data;
        if (res.ok) {
          setState({ user: data.user });
          return { success: true, user: data.user };
        }
        var msg = data.error || (data.errors && data.errors[0] && data.errors[0].msg) || 'Profile update failed';
        setState({ error: msg });
        return { success: false, error: msg, errors: data.errors };
      })
      .catch(function () {
        setState({ error: 'Network error. Please try again.' });
        return { success: false, error: 'Network error. Please try again.' };
      });
  }

  window.Auth = {
    subscribe: function (cb) { listeners.push(cb); cb(state); },
    getState: function () { return state; },
    getAuthHeader: getAuthHeader,
    login: login,
    register: register,
    logout: logout,
    updateProfile: updateProfile,
    isAuthenticated: function () { return !!state.user; },
    init: checkAuth,
  };
})();
