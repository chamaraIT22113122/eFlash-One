/**
 * RECITAL ELECTRONIC - Authentication & Multi-Admin System
 * Admin 1 (Chamara) & Admin 2 (Father)
 */

(function () {
  const AUTH_STORAGE_KEY = 'recital_auth_users';
  const SESSION_STORAGE_KEY = 'recital_active_session';

  const DEFAULT_USERS = [
    {
      id: 'admin1',
      username: 'admin1',
      password: '123',
      displayName: 'Chamara (Admin 1)',
      role: 'Admin',
      avatar: '👨‍💻'
    },
    {
      id: 'admin2',
      username: 'admin2',
      password: '123',
      displayName: 'Father (Admin 2)',
      role: 'Admin',
      avatar: '👨‍💼'
    }
  ];

  const authSystem = {
    users: [],
    currentUser: null,

    init: function () {
      this.loadUsers();
      this.checkSession();
      this.setupGlobalEvents();
    },

    loadUsers: function () {
      try {
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          this.users = JSON.parse(saved);
        } else {
          this.users = DEFAULT_USERS.slice();
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.users));
        }
      } catch (e) {
        this.users = DEFAULT_USERS.slice();
      }
    },

    saveUsers: function () {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.users));
      // Cloud sync if available
      if (window.firebaseDB && window.firebaseDB.isInitialized) {
        window.firebaseDB.saveItem('settings', 'admin_users', { users: this.users });
      }
    },

    checkSession: function () {
      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
          const sessionUser = JSON.parse(raw);
          const found = this.users.find(u => u.id === sessionUser.id || u.username.toLowerCase() === sessionUser.username.toLowerCase());
          if (found) {
            this.currentUser = found;
            this.hideLoginOverlay();
            this.updateHeaderUI();
            return true;
          }
        }
      } catch (e) {}

      // If no valid session, show login overlay
      this.showLoginOverlay();
      return false;
    },

    login: function (username, password, rememberMe) {
      if (!username || !password) {
        return { success: false, message: 'Please enter both username and password.' };
      }

      const u = this.users.find(user => 
        user.username.toLowerCase() === username.trim().toLowerCase() ||
        user.id.toLowerCase() === username.trim().toLowerCase()
      );

      if (!u) {
        return { success: false, message: 'Invalid username. Use "admin1" or "admin2".' };
      }

      if (u.password !== password.trim()) {
        return { success: false, message: 'Incorrect password. (Default is 123)' };
      }

      // Login success
      this.currentUser = u;
      const sessionData = {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        role: u.role,
        avatar: u.avatar,
        loginTime: new Date().toISOString()
      };

      if (rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }

      this.hideLoginOverlay();
      this.updateHeaderUI();
      if (typeof showToast === 'function') {
        showToast('Welcome, ' + u.displayName + '!');
      }
      return { success: true, user: u };
    },

    logout: function () {
      this.currentUser = null;
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      this.showLoginOverlay();
      this.updateHeaderUI();
    },

    changePassword: function (userId, oldPass, newPass) {
      const u = this.users.find(user => user.id === userId);
      if (!u) return { success: false, message: 'User not found.' };

      if (u.password !== oldPass) {
        return { success: false, message: 'Current password does not match.' };
      }

      if (!newPass || newPass.length < 3) {
        return { success: false, message: 'New password must be at least 3 characters long.' };
      }

      u.password = newPass;
      this.saveUsers();
      return { success: true, message: 'Password updated successfully!' };
    },

    getCurrentUser: function () {
      return this.currentUser || {
        id: 'admin1',
        username: 'admin1',
        displayName: 'Chamara (Admin 1)',
        role: 'Admin',
        avatar: '👨‍💻'
      };
    },

    showLoginOverlay: function () {
      const el = document.getElementById('auth-login-overlay');
      if (el) {
        el.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    },

    hideLoginOverlay: function () {
      const el = document.getElementById('auth-login-overlay');
      if (el) {
        el.classList.remove('active');
        document.body.style.overflow = '';
      }
    },

    updateHeaderUI: function () {
      const user = this.getCurrentUser();
      const avatarEl = document.getElementById('header-user-avatar');
      const nameEl = document.getElementById('header-user-name');
      const dropNameEl = document.getElementById('dropdown-user-name');
      const dropRoleEl = document.getElementById('dropdown-user-role');

      if (avatarEl) avatarEl.textContent = user.avatar || '👤';
      if (nameEl) nameEl.textContent = user.displayName || user.username;
      if (dropNameEl) dropNameEl.textContent = user.displayName || user.username;
      if (dropRoleEl) dropRoleEl.textContent = (user.role || 'Admin') + ' Account';

      // Update POS receipt cashier default to current user
      if (window.defaultReceiptConfig) {
        window.defaultReceiptConfig.cashier = user.displayName;
      }
      const rcptCashierEl = document.getElementById('rcpt-disp-cashier');
      if (rcptCashierEl) {
        rcptCashierEl.textContent = user.displayName;
      }
    },

    setupGlobalEvents: function () {
      // Close user dropdown when clicking outside
      document.addEventListener('click', (e) => {
        const wrap = document.getElementById('user-profile-menu-wrap');
        const drop = document.getElementById('user-profile-dropdown');
        if (wrap && drop && !wrap.contains(e.target)) {
          drop.classList.remove('active');
        }
      });
    }
  };

  window.authSystem = authSystem;

  document.addEventListener('DOMContentLoaded', function () {
    authSystem.init();
  });
})();

// UI Helpers
function quickSelectUserLogin(username) {
  const userField = document.getElementById('login-input-username');
  const passField = document.getElementById('login-input-password');
  if (userField) userField.value = username;

  // Highlight selected quick profile pill
  document.querySelectorAll('.login-quick-pill').forEach(pill => {
    pill.classList.remove('selected');
    if (pill.getAttribute('data-user') === username) {
      pill.classList.add('selected');
    }
  });

  if (passField) {
    passField.focus();
    passField.select();
  }
}

function handleLoginSubmit(event) {
  if (event) event.preventDefault();
  const username = document.getElementById('login-input-username').value;
  const password = document.getElementById('login-input-password').value;
  const remember = document.getElementById('login-input-remember').checked;
  const errEl = document.getElementById('login-error-msg');

  if (errEl) errEl.style.display = 'none';

  const res = window.authSystem.login(username, password, remember);
  if (!res.success) {
    if (errEl) {
      errEl.textContent = res.message;
      errEl.style.display = 'block';
    } else {
      alert(res.message);
    }
  }
}

function toggleLoginPasswordVisibility() {
  const passField = document.getElementById('login-input-password');
  const eyeIcon = document.getElementById('login-eye-icon');
  if (!passField) return;

  if (passField.type === 'password') {
    passField.type = 'text';
    if (eyeIcon) eyeIcon.textContent = '🙈';
  } else {
    passField.type = 'password';
    if (eyeIcon) eyeIcon.textContent = '👁️';
  }
}

function toggleUserProfileDropdown() {
  const drop = document.getElementById('user-profile-dropdown');
  if (drop) drop.classList.toggle('active');
}

function switchUserPrompt() {
  const drop = document.getElementById('user-profile-dropdown');
  if (drop) drop.classList.remove('active');
  window.authSystem.logout();
}

function logoutUser() {
  if (confirm('Are you sure you want to log out?')) {
    const drop = document.getElementById('user-profile-dropdown');
    if (drop) drop.classList.remove('active');
    window.authSystem.logout();
  }
}

function openChangePasswordModal() {
  const drop = document.getElementById('user-profile-dropdown');
  if (drop) drop.classList.remove('active');
  const modal = document.getElementById('modal-change-password');
  if (modal) {
    const user = window.authSystem.getCurrentUser();
    const nameEl = document.getElementById('chg-pass-user-name');
    if (nameEl) nameEl.textContent = user.displayName;
    document.getElementById('chg-pass-current').value = '';
    document.getElementById('chg-pass-new').value = '';
    document.getElementById('chg-pass-confirm').value = '';
    const errEl = document.getElementById('chg-pass-error-msg');
    if (errEl) errEl.style.display = 'none';
    modal.classList.add('active');
  }
}

function closeChangePasswordModal() {
  const modal = document.getElementById('modal-change-password');
  if (modal) modal.classList.remove('active');
}

function saveChangedPassword() {
  const user = window.authSystem.getCurrentUser();
  const currentPass = document.getElementById('chg-pass-current').value;
  const newPass = document.getElementById('chg-pass-new').value;
  const confirmPass = document.getElementById('chg-pass-confirm').value;
  const errEl = document.getElementById('chg-pass-error-msg');

  if (errEl) errEl.style.display = 'none';

  if (newPass !== confirmPass) {
    if (errEl) {
      errEl.textContent = 'New passwords do not match.';
      errEl.style.display = 'block';
    }
    return;
  }

  const res = window.authSystem.changePassword(user.id, currentPass, newPass);
  if (!res.success) {
    if (errEl) {
      errEl.textContent = res.message;
      errEl.style.display = 'block';
    }
  } else {
    alert('Password updated successfully!');
    closeChangePasswordModal();
  }
}
