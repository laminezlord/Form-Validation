const form = document.getElementById('form');
// form.elements avoids clashes with form properties like form.name.
const els = form.elements;
const done = document.getElementById('done');
const summary = document.getElementById('summary');
const fields = ['name', 'email', 'password', 'confirm', 'terms'];

// Fields are only marked wrong after the user has left them once (or tried to submit),
// so nobody sees an error on their first keystroke.
const touched = new Set();

const RULES = {
  length: v => v.length >= 8,
  case: v => /[a-z]/.test(v) && /[A-Z]/.test(v),
  number: v => /\d/.test(v),
  symbol: v => /[^A-Za-z0-9\s]/.test(v),
};

const COMMON_TYPOS = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com', 'yahooo.com': 'yahoo.com', 'hotmal.com': 'hotmail.com', 'outlok.com': 'outlook.com' };

const checks = {
  name(v) {
    v = v.trim();
    if (!v) return 'Enter your full name.';
    if (v.split(/\s+/).length < 2) return 'Enter your first and last name.';
    if (/[0-9]/.test(v)) return "Names can't contain numbers.";
    return '';
  },
  email(v) {
    v = v.trim();
    if (!v) return 'Enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email like name@example.com.';
    const domain = v.split('@')[1].toLowerCase();
    if (COMMON_TYPOS[domain]) return `Did you mean ${v.split('@')[0]}@${COMMON_TYPOS[domain]}?`;
    return '';
  },
  password(v) {
    if (!v) return 'Create a password.';
    const missing = Object.keys(RULES).filter(k => !RULES[k](v));
    if (missing.length) return 'Your password needs everything in the list above.';
    return '';
  },
  confirm(v) {
    if (!v) return 'Type your password again.';
    if (v !== els.password.value) return "Passwords don't match.";
    return '';
  },
  terms() {
    return els.terms.checked ? '' : 'Agree to the terms to continue.';
  },
};

function validate(name, { show } = { show: touched.has(name) }) {
  const input = els[name];
  const wrap = form.querySelector(`[data-field="${name}"]`);
  const msg = document.getElementById(`${name}-msg`);
  const value = input.type === 'checkbox' ? input.checked : input.value;
  const error = checks[name](value);
  const empty = input.type !== 'checkbox' && !input.value;

  wrap.classList.toggle('is-valid', !error && !empty);
  wrap.classList.toggle('is-invalid', !!error && show);
  input.setAttribute('aria-invalid', String(!!error && show));
  msg.textContent = show ? error : '';
  return !error;
}

function paintStrength() {
  const v = els.password.value;
  let score = 0;
  for (const [key, test] of Object.entries(RULES)) {
    const met = test(v);
    if (met) score++;
    form.querySelector(`[data-rule="${key}"]`).classList.toggle('met', met);
  }
  if (v.length >= 14 && score >= 3) score = 4;
  form.querySelector('.meter').dataset.score = v ? Math.max(1, score) : 0;
}

fields.forEach(name => {
  const input = els[name];
  const evt = input.type === 'checkbox' ? 'change' : 'input';
  input.addEventListener(evt, () => {
    if (name === 'password') {
      paintStrength();
      if (touched.has('confirm')) validate('confirm');
    }
    if (input.type === 'checkbox') touched.add(name);
    validate(name);
    if (!summary.hidden) updateSummary();
  });
  input.addEventListener('blur', () => {
    if (input.type !== 'checkbox' && !input.value && !touched.has(name)) return;
    touched.add(name);
    validate(name);
  });
});

// Accept the "Did you mean …?" suggestion with a click on the message.
document.getElementById('email-msg').addEventListener('click', e => {
  const m = e.target.textContent.match(/^Did you mean (.+)\?$/);
  if (!m) return;
  els.email.value = m[1];
  validate('email');
  els.email.focus();
});
document.getElementById('email-msg').style.cursor = 'pointer';

document.querySelectorAll('[data-reveal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const show = btn.getAttribute('aria-pressed') !== 'true';
    ['password', 'confirm'].forEach(n => { els[n].type = show ? 'text' : 'password'; });
    btn.setAttribute('aria-pressed', show);
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    btn.textContent = show ? 'Hide' : 'Show';
  });
});

function updateSummary() {
  const bad = fields.filter(n => !validate(n, { show: true }));
  summary.hidden = !bad.length;
  summary.textContent = bad.length === 1 ? 'Fix 1 field to continue.' : `Fix ${bad.length} fields to continue.`;
  return bad;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  fields.forEach(n => touched.add(n));
  const bad = updateSummary();
  if (bad.length) {
    const card = form.closest('.card');
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    els[bad[0]].focus();
    return;
  }
  const btn = form.querySelector('.submit');
  btn.classList.add('busy');
  // Simulate a network request so the loading state is visible.
  setTimeout(() => {
    btn.classList.remove('busy');
    const first = els.name.value.trim().split(/\s+/)[0];
    document.getElementById('doneText').textContent = `Welcome, ${first}. We'd send a confirmation to ${els.email.value.trim()}.`;
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }, 900);
});

document.getElementById('again').addEventListener('click', () => {
  form.reset();
  touched.clear();
  fields.forEach(n => validate(n, { show: false }));
  paintStrength();
  summary.hidden = true;
  done.hidden = true;
  form.hidden = false;
  els.name.focus();
});

paintStrength();
