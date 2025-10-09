let jwtToken = null;

// DOM Elements
const registerSection = document.getElementById('registerSection');
const loginSection = document.getElementById('loginSection');
const shortenerSection = document.getElementById('shortenerSection');
const logoutSection = document.getElementById('logoutSection');
const messageDiv = document.getElementById('message');
const resultDiv = document.getElementById('result');

// Register
async function registerUser() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  messageDiv.textContent = '';
  resultDiv.textContent = '';

  if (!username || !password) {
    showMessage('Username and password are required for registration.', 'red');
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const msg = await response.text();

    if (response.ok) {
      showMessage('Registered successfully! Please login.', 'green');

      // Hide register, show login with autofilled values
      registerSection.style.display = 'none';
      loginSection.style.display = 'block';

      document.getElementById('loginUsername').value = username;
      document.getElementById('loginPassword').value = password;

      toggleButtons();
    } else {
      showMessage(`Registration failed: ${msg}`, 'red');
    }
  } catch {
    showMessage('Failed to connect to the server.', 'red');
  }
}

// Login (used in both login page and register section)
async function loginUser(fromRegisterSection = false) {
  const username = document.getElementById(
    fromRegisterSection ? 'registerUsername' : 'loginUsername'
  ).value.trim();
  const password = document.getElementById(
    fromRegisterSection ? 'registerPassword' : 'loginPassword'
  ).value.trim();
  messageDiv.textContent = '';
  resultDiv.textContent = '';

  if (!username || !password) {
    showMessage('Username and password are required for login.', 'red');
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const msg = await response.text();
      showMessage(`Login failed: ${msg}`, 'red');
      return;
    }

    const data = await response.json();
    jwtToken = data.token;
    localStorage.setItem('user', JSON.stringify({ token: jwtToken }));

    showMessage('Login successful! You can now shorten URLs.', 'green');
    registerSection.style.display = 'none';
    loginSection.style.display = 'none';
    shortenerSection.style.display = 'block';
    logoutSection.style.display = 'block';
  } catch {
    showMessage('Failed to connect to the server.', 'red');
  }
}

// Shorten URL
async function shortenURL() {
  const urlInput = document.getElementById('urlInput').value.trim();
  messageDiv.textContent = '';
  resultDiv.textContent = '';

  if (!urlInput) {
    showMessage('Please enter a URL to shorten.', 'red');
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/api/v1/shortener/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwtToken && { Authorization: 'Bearer ' + jwtToken }),
      },
      body: JSON.stringify({ url: urlInput }),
    });

    if (!response.ok) {
      const msg = await response.text();
      showMessage(`Error: ${msg}`, 'red');
      return;
    }

    const data = await response.json();
    const shortUrl = data.shortUrl;
    showMessage('URL shortened successfully!', 'green');
    resultDiv.innerHTML = `Shortened URL: <a href="${shortUrl}" target="_blank">${shortUrl}</a>`;
  } catch {
    showMessage('Could not connect to server.', 'red');
  }
}

// Logout
function logoutUser() {
  jwtToken = null;
  localStorage.removeItem('user');
  showMessage('You have been logged out.', 'black');

  loginSection.style.display = 'block';
  shortenerSection.style.display = 'none';
  logoutSection.style.display = 'none';
  clearInputs();
  toggleButtons();
}

// Helpers
function showMessage(message, color) {
  messageDiv.textContent = message;
  messageDiv.style.color = color;
}

function clearInputs() {
  ['loginUsername', 'loginPassword', 'registerUsername', 'registerPassword', 'urlInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function toggleButtons() {
  // Register section buttons
  const regFilled =
    document.getElementById('registerUsername').value.trim() &&
    document.getElementById('registerPassword').value.trim();

  document.getElementById('registerBtn').disabled = !regFilled;
  document.getElementById('loginFromRegisterBtn').disabled = !regFilled;

  // Login section
  const loginFilled =
    document.getElementById('loginUsername').value.trim() &&
    document.getElementById('loginPassword').value.trim();

  document.getElementById('loginBtn').disabled = !loginFilled;

  // Shorten
  const url = document.getElementById('urlInput').value.trim();
  document.getElementById('shortenBtn').disabled = !url;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('registerBtn').addEventListener('click', registerUser);
  document.getElementById('loginBtn').addEventListener('click', () => loginUser(false));
  document.getElementById('loginFromRegisterBtn').addEventListener('click', () => loginUser(true));
  document.getElementById('shortenBtn').addEventListener('click', shortenURL);
  document.getElementById('logoutBtn').addEventListener('click', logoutUser);

  ['registerUsername', 'registerPassword', 'loginUsername', 'loginPassword', 'urlInput'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', toggleButtons);
  });

  // Restore login if exists
  const user = localStorage.getItem('user');
  if (user) {
    const { token } = JSON.parse(user);
    jwtToken = token;
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    shortenerSection.style.display = 'block';
    logoutSection.style.display = 'block';
    showMessage('Welcome back! You are logged in.', 'green');
  }

  toggleButtons();
});
