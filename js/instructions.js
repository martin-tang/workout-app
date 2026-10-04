(function () {
  var modal = document.getElementById('instructions-modal');
  if (!modal) return;

  function open() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }
  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  modal.querySelectorAll('[data-close="instructions"]').forEach(function (el) {
    el.addEventListener('click', close);
  });

  // Show once per browser (skip repeat visits), mirroring the original onboarding modal.
  var seen = localStorage.getItem('wb_instructions_seen');
  if (!seen) {
    open();
    modal.querySelectorAll('[data-close="instructions"]').forEach(function (el) {
      el.addEventListener('click', function () { localStorage.setItem('wb_instructions_seen', '1'); }, { once: true });
    });
  }

  window.Instructions = { open: open, close: close };
})();
