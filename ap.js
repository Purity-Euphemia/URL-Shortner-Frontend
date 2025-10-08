let jwtToken = null; // store token after login

// Elements
const registerSection = document.getElementById('registerSection');
const loginSection = document.getElementById('loginSection');
const shortenerSection = document.getElementById('shortenerSection');
const messageDiv = document.getElementById('message');
const resultDiv = document.getElementById('result');

// Register User
async function registerUser() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  messageDiv.textContent = '';
  resultDiv.textContent = '';

  if (!username || !password) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Username and password are required for registration.';
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
      messageDiv.style.color = 'green';
      messageDiv.textContent = 'Registered successfully! Please login.';
      // Show login, hide register
      registerSection.style.display = 'none';
      loginSection.style.display = 'block';
    } else {
      messageDiv.style.color = 'red';
      messageDiv.textContent = `Registration failed: ${msg}`;
    }
  } catch (error) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Failed to connect to the server.';
  }
}

// Login User
async function loginUser() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  messageDiv.textContent = '';
  resultDiv.textContent = '';

  if (!username || !password) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Username and password are required for login.';
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
      messageDiv.style.color = 'red';
      messageDiv.textContent = `Login failed: ${msg}`;
      return;
    }

    const data = await response.json();
    jwtToken = data.token;
    messageDiv.style.color = 'green';
    messageDiv.textContent = 'Login successful! You can now shorten URLs.';
    // Show shortener, hide login
    loginSection.style.display = 'none';
    shortenerSection.style.display = 'block';
  } catch (error) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Failed to connect to the server.';
  }
}

// Shorten URL
async function shortenURL() {
  const urlInput = document.getElementById('urlInput').value.trim();
  messageDiv.textContent = '';
  resultDiv.textContent = '';

  if (!urlInput) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Please enter a URL to shorten.';
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwtToken && { Authorization: 'Bearer ' + jwtToken }),
      },
      body: JSON.stringify({ url: urlInput }),
    });

    if (!response.ok) {
      const msg = await response.text();
      messageDiv.style.color = 'red';
      messageDiv.textContent = `Error: ${msg}`;
      return;
    }

    const data = await response.json();
    const shortUrl = data.shortenedUrl;
    messageDiv.style.color = 'green';
    resultDiv.innerHTML = `Shortened URL: <a href="${shortUrl}" target="_blank">${shortUrl}</a>`;
  } catch (error) {
    messageDiv.style.color = 'red';
    messageDiv.textContent = 'Could not connect to server.';
  }
}

// Attach event listeners after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('registerBtn').addEventListener('click', registerUser);
  document.getElementById('loginBtn').addEventListener('click', loginUser);
  document.getElementById('shortenBtn').addEventListener('click', shortenURL);
});
