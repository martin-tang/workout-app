// Central place to configure where the Express API lives.
// Since this app is hosted on GitHub Pages (a different origin than the API),
// all requests use an absolute URL and rely on CORS being configured on the
// Express side to allow this GitHub Pages origin. The API runs on its own
// subdomain so it never has to share a path with the static personal site.
window.API_BASE = window.API_BASE || 'https://api.martintang.ca';

window.apiFetch = function apiFetch(path, options) {
  options = options || {};
  var headers = Object.assign({}, options.headers || {});
  return fetch(window.API_BASE + path, Object.assign({}, options, { headers: headers }));
};
