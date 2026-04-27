/* =====================================================
   ROHINI FOODS INDIA — auth.js
   Complete authentication handler with backend integration
   ===================================================== */

class AuthManager {
  constructor() {
    this.apiBase = '/api/auth';
    this.currentUser = null;
    this.init();
  }

  init() {
    this.loadCurrentUser();
    this.setupModeSwitching();
    this.setupForms();
    this.setupGoogleSignIn();
  }

  loadCurrentUser() {
    const userData = localStorage.getItem('rf_user');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.updateUIForLoggedInUser();
      } catch (e) {
        localStorage.removeItem('rf_user');
      }
    }
  }

  saveUser(userData) {
    this.currentUser = userData;
    localStorage.setItem('rf_user', JSON.stringify(userData));
    this.updateUIForLoggedInUser();
    window.dispatchEvent(new Event('rf-auth-changed'));
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('rf_user');
    window.dispatchEvent(new Event('rf-auth-changed'));
    window.location.href = 'login.html';
  }

  updateUIForLoggedInUser() {
    // Update navigation if user is logged in
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && this.currentUser) {
      // Add logout option or update nav
      const existingLogout = navLinks.querySelector('.nav-logout');
      if (!existingLogout) {
        const logoutLink = document.createElement('li');
        logoutLink.innerHTML = '<a href="#" class="nav-logout">Logout</a>';
        logoutLink.querySelector('a').addEventListener('click', (e) => {
          e.preventDefault();
          this.logout();
        });
        navLinks.appendChild(logoutLink);
      }
    }
  }

  async apiRequest(endpoint, data = null) {
    const url = `${this.apiBase}${endpoint}`;
    const config = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  showMessage(elementId, message, type = 'error') {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.className = `form-msg ${type}`;
      element.style.display = 'block';

      // Auto-hide success messages after 5 seconds
      if (type === 'success') {
        setTimeout(() => {
          element.style.display = 'none';
        }, 5000);
      }
    }
  }

  hideMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = 'none';
    }
  }

  setupModeSwitching() {
    const modeButtons = document.querySelectorAll('.auth-mode-btn');
    const forms = document.querySelectorAll('.auth-form');

    modeButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons
        modeButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        // Hide all forms
        forms.forEach(form => form.classList.remove('active'));

        // Show selected form
        const mode = button.dataset.mode;
        const targetForm = document.getElementById(`${mode}Form`);
        if (targetForm) {
          targetForm.classList.add('active');
        }

        // Hide reset form if switching modes
        document.getElementById('resetForm').style.display = 'none';

        // Clear all messages
        document.querySelectorAll('.form-msg').forEach(msg => {
          msg.style.display = 'none';
        });
      });
    });
  }

  setupForms() {
    // Password login
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => this.handlePasswordLogin(e));
    }

    // Forgot password
    const forgotBtn = document.getElementById('forgotPasswordBtn');
    if (forgotBtn) {
      forgotBtn.addEventListener('click', () => this.showResetForm());
    }

    // Email OTP
    const requestEmailOtpBtn = document.getElementById('requestEmailOtpBtn');
    if (requestEmailOtpBtn) {
      requestEmailOtpBtn.addEventListener('click', () => this.requestEmailOtp());
    }

    const emailOtpForm = document.getElementById('emailOtpForm');
    if (emailOtpForm) {
      emailOtpForm.addEventListener('submit', (e) => this.verifyEmailOtp(e));
    }

    // Mobile OTP
    const requestMobileOtpBtn = document.getElementById('requestMobileOtpBtn');
    if (requestMobileOtpBtn) {
      requestMobileOtpBtn.addEventListener('click', () => this.requestMobileOtp());
    }

    const mobileOtpForm = document.getElementById('mobileOtpForm');
    if (mobileOtpForm) {
      mobileOtpForm.addEventListener('submit', (e) => this.verifyMobileOtp(e));
    }

    // Password reset
    const requestResetBtn = document.getElementById('requestResetBtn');
    if (requestResetBtn) {
      requestResetBtn.addEventListener('click', () => this.requestPasswordReset());
    }

    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
      resetForm.addEventListener('submit', (e) => this.resetPassword(e));
    }

    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener('click', () => this.hideResetForm());
    }
  }

  async handlePasswordLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      this.showMessage('passwordMsg', 'Please enter both email and password.');
      return;
    }

    const result = await this.apiRequest('/login', { email, password });

    if (result.success) {
      this.saveUser(result.data);
      this.showMessage('passwordMsg', 'Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = result.data.email === 'admin@rohini-foods.com' ? 'admin.html' : 'index.html';
      }, 1000);
    } else {
      this.showMessage('passwordMsg', result.error || 'Login failed. Please try again.');
    }
  }

  setupGoogleSignIn() {
    const googleBtn = document.getElementById('googleSignInBtn');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => this.handleGoogleSignIn());
    }
  }

  async handleGoogleSignIn() {
    try {
      // Load Google API if not loaded
      if (!window.google) {
        await this.loadGoogleAPI();
      }

      const config = await this.apiRequest('/config');
      if (!config.success || !config.googleClientId) {
        this.showMessage('googleMsg', 'Google Sign-In is not configured.');
        return;
      }

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: (response) => this.handleGoogleCallback(response),
      });

      // Trigger sign-in
      window.google.accounts.id.prompt();

    } catch (error) {
      console.error('Google Sign-In error:', error);
      this.showMessage('googleMsg', 'Failed to initialize Google Sign-In.');
    }
  }

  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async handleGoogleCallback(response) {
    const result = await this.apiRequest('/google', { idToken: response.credential });

    if (result.success) {
      this.saveUser(result.data);
      this.showMessage('googleMsg', 'Google Sign-In successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      this.showMessage('googleMsg', result.error || 'Google Sign-In failed.');
    }
  }

  async requestEmailOtp() {
    const email = document.getElementById('otpEmail').value.trim();
    if (!email) {
      this.showMessage('emailOtpMsg', 'Please enter your email address.');
      return;
    }

    const result = await this.apiRequest('/request-email-otp', { email });

    if (result.success) {
      this.showMessage('emailOtpMsg', result.message, 'success');
      document.querySelector('#emailOtpForm .otp-input-group').style.display = 'block';
      document.getElementById('verifyEmailOtpBtn').style.display = 'block';
      document.getElementById('requestEmailOtpBtn').style.display = 'none';
    } else {
      this.showMessage('emailOtpMsg', result.error || 'Failed to send OTP.');
    }
  }

  async verifyEmailOtp(e) {
    e.preventDefault();
    const email = document.getElementById('otpEmail').value.trim();
    const code = document.getElementById('emailOtpCode').value.trim();

    if (!email || !code) {
      this.showMessage('emailOtpMsg', 'Please enter both email and OTP code.');
      return;
    }

    const result = await this.apiRequest('/verify-otp', { target: email, code, type: 'email_login' });

    if (result.success) {
      this.saveUser(result.data);
      this.showMessage('emailOtpMsg', 'Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      this.showMessage('emailOtpMsg', result.error || 'Invalid OTP code.');
    }
  }

  async requestMobileOtp() {
    const phone = document.getElementById('otpPhone').value.trim();
    if (!phone) {
      this.showMessage('mobileOtpMsg', 'Please enter your phone number.');
      return;
    }

    const result = await this.apiRequest('/request-mobile-otp', { phone });

    if (result.success) {
      this.showMessage('mobileOtpMsg', result.message, 'success');
      document.querySelector('#mobileOtpForm .otp-input-group').style.display = 'block';
      document.getElementById('verifyMobileOtpBtn').style.display = 'block';
      document.getElementById('requestMobileOtpBtn').style.display = 'none';
    } else {
      this.showMessage('mobileOtpMsg', result.error || 'Failed to send OTP.');
    }
  }

  async verifyMobileOtp(e) {
    e.preventDefault();
    const phone = document.getElementById('otpPhone').value.trim();
    const code = document.getElementById('mobileOtpCode').value.trim();

    if (!phone || !code) {
      this.showMessage('mobileOtpMsg', 'Please enter both phone number and OTP code.');
      return;
    }

    const result = await this.apiRequest('/verify-otp', { target: phone, code, type: 'mobile_login' });

    if (result.success) {
      this.saveUser(result.data);
      this.showMessage('mobileOtpMsg', 'Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      this.showMessage('mobileOtpMsg', result.error || 'Invalid OTP code.');
    }
  }

  showResetForm() {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById('resetForm').style.display = 'block';
  }

  hideResetForm() {
    document.getElementById('resetForm').style.display = 'none';
    document.querySelector('.auth-mode-btn[data-mode="password"]').click();
  }

  async requestPasswordReset() {
    const email = document.getElementById('resetEmail').value.trim();
    if (!email) {
      this.showMessage('resetMsg', 'Please enter your email address.');
      return;
    }

    const result = await this.apiRequest('/request-reset-password', { email });

    if (result.success) {
      this.showMessage('resetMsg', result.message, 'success');
      document.querySelector('#resetForm .otp-input-group').style.display = 'block';
      document.querySelector('#resetForm .new-password-group').style.display = 'block';
      document.getElementById('resetPasswordBtn').style.display = 'block';
      document.getElementById('requestResetBtn').style.display = 'none';
    } else {
      this.showMessage('resetMsg', result.error || 'Failed to send reset code.');
    }
  }

  async resetPassword(e) {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value.trim();
    const code = document.getElementById('resetOtpCode').value.trim();
    const newPassword = document.getElementById('newPassword').value;

    if (!email || !code || !newPassword) {
      this.showMessage('resetMsg', 'Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      this.showMessage('resetMsg', 'Password must be at least 6 characters long.');
      return;
    }

    const result = await this.apiRequest('/reset-password', {
      target: email,
      code,
      newPassword,
      type: 'reset_password'
    });

    if (result.success) {
      this.showMessage('resetMsg', result.message, 'success');
      setTimeout(() => {
        this.hideResetForm();
      }, 2000);
    } else {
      this.showMessage('resetMsg', result.error || 'Password reset failed.');
    }
  }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});
