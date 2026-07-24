function showAlert(elementId, message, type = 'error') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} show`;
}

function hideAlert(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.classList.remove('show');
}

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
  e.preventDefault(); // Prevent default form submission (page reload)
  hideAlert('alertMsg');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = document.getElementById('loginBtn');

  // Basic client-side validation
  if (!email || !password) {
    showAlert('alertMsg', 'Please fill in all fields.');
    return;
  }

  setLoading(btn, true, 'Sign In');

  try {
    // Send POST request to backend with user credentials
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      // Server returned an error (e.g. wrong password)
      throw new Error(data.message || 'Login failed');
    }

    // Save JWT token and user info to localStorage for future requests
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    showAlert('successMsg', 'Login successful! Redirecting...', 'success');

    // Redirect to dashboard after short delay
    setTimeout(() => { window.location.href = '/dashboard'; }, 800);

  } catch (error) {
    showAlert('alertMsg', error.message);
  } finally {
    setLoading(btn, false, 'Sign In');
  }
}

// Helper function to set loading state on button
function setLoading(btn, isLoading, originalText = 'Sign In') {
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.textContent = 'Loading...';
  } else {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}