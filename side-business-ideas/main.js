// ============================================================
// COMING SOON — main.js
// Handles: Formspree AJAX submission, form state, copyright year
// ============================================================

// Set copyright year automatically
document.getElementById('year').textContent = new Date().getFullYear();

// --- Form submission via Formspree (AJAX, no page redirect) ---
const form      = document.getElementById('signup-form');
const btn       = form.querySelector('.submit-btn');
const successEl = document.getElementById('form-success');
const errorEl   = document.getElementById('form-error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.querySelector('#email').value.trim();

  // Basic client-side validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('Please enter a valid email address.');
    return;
  }

  // Loading state
  btn.classList.add('is-loading');
  hideMessages();

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form),
    });

    if (response.ok) {
      form.reset();
      form.hidden = true;
      successEl.hidden = false;
    } else {
      const data = await response.json().catch(() => ({}));
      const msg = data?.errors?.map(err => err.message).join(', ')
                  || 'Something went wrong. Please try again.';
      showError(msg);
    }
  } catch {
    showError('Network error. Please check your connection and try again.');
  } finally {
    btn.classList.remove('is-loading');
  }
});

function hideMessages() {
  successEl.hidden = true;
  errorEl.hidden   = true;
  errorEl.textContent = '';
}

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}
