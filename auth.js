/**
 * RECITAL ELECTRONIC - Secure Multi-Admin Authentication Engine
 * Cryptographic SHA-256 Hashing • Role-Based Access Control • Brute Force Lockout
 * Admin 1 (Chamara - Super Admin) & Admin 2 (Father - Admin)
 */

(function () {
  const AUTH_STORAGE_KEY = 'recital_auth_users';
  const SESSION_STORAGE_KEY = 'recital_active_session';
  const LOCKOUT_KEY = 'recital_auth_lockout';

  // Helper: SHA-256 password hashing via native Web Crypto API
  async function sha256(plainText) {
    if (!plainText) return '';
    try {
      const msgBuffer = new TextEncoder().encode(plainText);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback for non-crypto contexts
      let hash = 0;
      for (let i = 0; i < plainText.length; i++) {
        hash = ((hash << 5) - hash) + plainText.charCodeAt(i);
        hash |= 0;
      }
      return 'fallback_' + Math.abs(hash).toString(16);
    }
  }

  // Initial user definitions
  // Password '123' SHA-256 hash = a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
  const DEFAULT_USERS = [
    {
      id: 'admin1',
      username: 'admin1',
      passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // '123'
      displayName: 'Chamara (Admin 1)',
      role: 'super_admin',
      roleLabel: 'Super Administrator',
      avatar: '👨‍💻',
      permissions: ['all']
    },
    {
      id: 'admin2',
      username: 'admin2',
      passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // '123'
      displayName: 'Father (Admin 2)',
      role: 'admin',
      roleLabel: 'Administrator',
      avatar: '👨‍💼',
      permissions: ['pos', 'invoices', 'repairs', 'hire', 'inventory_view', 'print']
    }
  ];

  const authSystem = {
    users: [],
    currentUser: null,
    failedAttempts: 0,
    lockoutUntil: 0,

    init: async function () {
      await this.loadUsers();
      this.checkLockout();
      this.checkSession();
      this.setupGlobalEvents();
      this.applyRoleRestrictions();
    },

    loadUsers: async function () {
      try {
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Auto-upgrade plain text passwords from legacy sessions to SHA-256 hashes
          for (const u of parsed) {
            if (u.password && !u.passwordHash) {
              u.passwordHash = await sha256(u.password);
              delete u.password;
            }
          }
          this.users = parsed;
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
      if (window.firebaseDB && window.firebaseDB.isInitialized) {
        window.firebaseDB.saveItem('settings', 'admin_users', {
          users: this.users.map(u => ({
            id: u.id,
            username: u.username,
            displayName: u.displayName,
            role: u.role,
            roleLabel: u.roleLabel,
            avatar: u.avatar,
            passwordHash: u.passwordHash
          }))
        });
      }
    },

    checkLockout: function () {
      try {
        const lock = localStorage.getItem(LOCKOUT_KEY);
        if (lock) {
          const lockTime = parseInt(lock, 10);
          if (Date.now() < lockTime) {
            this.lockoutUntil = lockTime;
          } else {
            localStorage.removeItem(LOCKOUT_KEY);
            this.failedAttempts = 0;
            this.lockoutUntil = 0;
          }
        }
      } catch (e) {}
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
            this.applyRoleRestrictions();
            return true;
          }
        }
      } catch (e) {}

      this.showLoginOverlay();
      return false;
    },

    login: async function (username, password, rememberMe) {
      this.checkLockout();
      if (this.lockoutUntil > Date.now()) {
        const sec = Math.ceil((this.lockoutUntil - Date.now()) / 1000);
        return { success: false, message: `Access temporarily locked. Please wait ${sec}s.` };
      }

      if (!username || !password) {
        return { success: false, message: 'Please enter both username and password.' };
      }

      const cleanUser = username.trim().toLowerCase();
      const u = this.users.find(user => 
        user.username.toLowerCase() === cleanUser ||
        user.id.toLowerCase() === cleanUser
      );

      const passHash = await sha256(password.trim());

      if (!u || u.passwordHash !== passHash) {
        this.failedAttempts++;
        if (this.failedAttempts >= 5) {
          this.lockoutUntil = Date.now() + 30000; // 30 sec lockout
          localStorage.setItem(LOCKOUT_KEY, String(this.lockoutUntil));
          return { success: false, message: 'Too many failed attempts. System locked for 30 seconds.' };
        }
        return { success: false, message: 'Invalid username or password.' };
      }

      // Success - reset lockout
      this.failedAttempts = 0;
      localStorage.removeItem(LOCKOUT_KEY);
      this.currentUser = u;

      const sessionData = {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        role: u.role,
        roleLabel: u.roleLabel,
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
      this.applyRoleRestrictions();

      if (typeof showToast === 'function') {
        showToast('Welcome back, ' + u.displayName + '!');
      }
      return { success: true, user: u };
    },

    logout: function () {
      this.currentUser = null;
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      this.showLoginOverlay();
      this.updateHeaderUI();
      this.applyRoleRestrictions();
    },

    changePassword: async function (targetUserId, oldPass, newPass) {
      const caller = this.getCurrentUser();
      const targetUser = this.users.find(u => u.id === targetUserId);
      if (!targetUser) return { success: false, message: 'User not found.' };

      // Admin 1 (Super Admin) can change any password without knowing the old one!
      const isSuperAdmin = caller.id === 'admin1';
      if (!isSuperAdmin) {
        // Other users must provide their current password
        if (caller.id !== targetUserId) {
          return { success: false, message: 'Permission denied. Only Admin 1 can change other accounts.' };
        }
        const oldHash = await sha256(oldPass);
        if (targetUser.passwordHash !== oldHash) {
          return { success: false, message: 'Current password does not match.' };
        }
      }

      if (!newPass || newPass.length < 3) {
        return { success: false, message: 'New password must be at least 3 characters.' };
      }

      targetUser.passwordHash = await sha256(newPass);
      this.saveUsers();
      return { success: true, message: `Password for ${targetUser.displayName} updated successfully!` };
    },

    getCurrentUser: function () {
      return this.currentUser || DEFAULT_USERS[0];
    },

    isSuperAdmin: function () {
      return this.getCurrentUser().id === 'admin1';
    },

    can: function (action) {
      if (this.isSuperAdmin()) return true;

      // Restrictions for Admin 2:
      switch (action) {
        case 'cloud_config':
        case 'system_settings':
        case 'delete_records':
        case 'manage_users':
        case 'view_cogs':
          return false;
        default:
          return true;
      }
    },

    applyRoleRestrictions: function () {
      const user = this.getCurrentUser();
      const isSuper = user.id === 'admin1';

      // 1. Cloud Sync button restrictions
      const fbBadge = document.getElementById('firebase-status-badge');
      if (fbBadge) {
        if (!isSuper) {
          fbBadge.title = 'Cloud Sync (Active - Managed by Admin 1)';
          fbBadge.onclick = function () {
            alert('Cloud Database settings and credentials can only be configured by Admin 1 (Chamara).');
          };
        } else {
          fbBadge.title = 'Firebase Cloud Database & Sync (Click to configure)';
          fbBadge.onclick = function () {
            if (typeof openFirebaseModal === 'function') openFirebaseModal();
          };
        }
      }

      // 2. Settings button behavior
      const setBtn = document.querySelector('button[onclick="openSettingsModal()"]');
      if (setBtn) {
        if (!isSuper) {
          setBtn.title = 'Settings (View-only for Admin 2)';
        } else {
          setBtn.title = 'Business & System Settings (Full Access)';
        }
      }

      // 3. User Badge styling
      const avatarEl = document.getElementById('header-user-avatar');
      const badgeBtn = document.getElementById('btn-user-profile');
      if (badgeBtn) {
        if (isSuper) {
          badgeBtn.style.border = '1.5px solid #0052cc';
          badgeBtn.style.background = '#eff6ff';
        } else {
          badgeBtn.style.border = '1.5px solid #059669';
          badgeBtn.style.background = '#f0fdf4';
        }
      }
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
      if (dropRoleEl) dropRoleEl.textContent = user.roleLabel || 'Administrator';

      // Update POS Cashier display
      if (window.defaultReceiptConfig) {
        window.defaultReceiptConfig.cashier = user.displayName;
      }
      const rcptCashierEl = document.getElementById('rcpt-disp-cashier');
      if (rcptCashierEl) {
        rcptCashierEl.textContent = user.displayName;
      }
    },

    setupGlobalEvents: function () {
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
async function handleLoginSubmit(event) {
  if (event) event.preventDefault();
  const username = document.getElementById('login-input-username').value;
  const password = document.getElementById('login-input-password').value;
  const remember = document.getElementById('login-input-remember').checked;
  const errEl = document.getElementById('login-error-msg');
  const btn = document.querySelector('.btn-login-submit');

  if (errEl) errEl.style.display = 'none';
  if (btn) btn.disabled = true;

  try {
    const res = await window.authSystem.login(username, password, remember);
    if (!res.success) {
      if (errEl) {
        errEl.textContent = res.message;
        errEl.style.display = 'block';
      } else {
        alert(res.message);
      }
    }
  } finally {
    if (btn) btn.disabled = false;
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
  if (!modal) return;

  const currentUser = window.authSystem.getCurrentUser();
  const isSuper = window.authSystem.isSuperAdmin();

  // Populate account select dropdown (Super Admin can change either account)
  const selectWrap = document.getElementById('chg-pass-account-select-wrap');
  const selectEl = document.getElementById('chg-pass-target-account');
  const currentPassGroup = document.getElementById('chg-pass-current-group');

  if (isSuper && selectWrap && selectEl) {
    selectWrap.style.display = 'block';
    selectEl.innerHTML = `
      <option value="admin1">Chamara (Admin 1)</option>
      <option value="admin2">Father (Admin 2)</option>
    `;
    selectEl.value = currentUser.id;
    // Super admin doesn't need to enter current password
    if (currentPassGroup) currentPassGroup.style.display = 'none';
  } else {
    if (selectWrap) selectWrap.style.display = 'none';
    if (currentPassGroup) currentPassGroup.style.display = 'block';
  }

  const nameEl = document.getElementById('chg-pass-user-name');
  if (nameEl) nameEl.textContent = currentUser.displayName;

  const curPass = document.getElementById('chg-pass-current');
  if (curPass) curPass.value = '';
  document.getElementById('chg-pass-new').value = '';
  document.getElementById('chg-pass-confirm').value = '';
  const errEl = document.getElementById('chg-pass-error-msg');
  if (errEl) errEl.style.display = 'none';

  modal.classList.add('active');
}

function closeChangePasswordModal() {
  const modal = document.getElementById('modal-change-password');
  if (modal) modal.classList.remove('active');
}

async function saveChangedPassword() {
  const isSuper = window.authSystem.isSuperAdmin();
  let targetId = window.authSystem.getCurrentUser().id;

  const selectEl = document.getElementById('chg-pass-target-account');
  if (isSuper && selectEl) {
    targetId = selectEl.value;
  }

  const currentPass = document.getElementById('chg-pass-current')?.value || '';
  const newPass = document.getElementById('chg-pass-new')?.value || '';
  const confirmPass = document.getElementById('chg-pass-confirm')?.value || '';
  const errEl = document.getElementById('chg-pass-error-msg');

  if (errEl) errEl.style.display = 'none';

  if (!newPass || newPass.length < 3) {
    if (errEl) {
      errEl.textContent = 'New password must be at least 3 characters.';
      errEl.style.display = 'block';
    }
    return;
  }

  if (newPass !== confirmPass) {
    if (errEl) {
      errEl.textContent = 'New passwords do not match.';
      errEl.style.display = 'block';
    }
    return;
  }

  const res = await window.authSystem.changePassword(targetId, currentPass, newPass);
  if (!res.success) {
    if (errEl) {
      errEl.textContent = res.message;
      errEl.style.display = 'block';
    }
  } else {
    alert(res.message);
    closeChangePasswordModal();
  }
}
