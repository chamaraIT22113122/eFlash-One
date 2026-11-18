/**
 * RECITAL ELECTRONIC - Secure Multi-Admin Authentication Engine
 * Cryptographic SHA-256 Hashing • Dynamic Role Permissions • Account Management (Main Admin Control)
 * Main Admin & Co-Admins + Custom Accounts
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
      displayName: 'Main Admin',
      role: 'super_admin',
      roleLabel: 'Main Administrator',
      avatar: '👨‍💻',
      permissions: {
        cloud_config: true,
        system_settings: true,
        delete_records: true,
        manage_users: true,
        view_cogs: true
      }
    },
    {
      id: 'admin2',
      username: 'admin2',
      passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // '123'
      displayName: 'Co-Admin',
      role: 'admin',
      roleLabel: 'Co-Administrator',
      avatar: '👨‍💼',
      permissions: {
        cloud_config: false,
        system_settings: false,
        delete_records: false,
        manage_users: false,
        view_cogs: false
      }
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
          for (const u of parsed) {
            // Auto-upgrade legacy names
            if (u.id === 'admin1' && (u.displayName.includes('Chamara') || !u.displayName)) {
              u.displayName = 'Main Admin';
              u.roleLabel = 'Main Administrator';
            }
            if (u.id === 'admin2' && (u.displayName.includes('Father') || !u.displayName)) {
              u.displayName = 'Co-Admin';
              u.roleLabel = 'Co-Administrator';
            }
            // Auto-upgrade legacy plain text passwords to SHA-256
            if (u.password && !u.passwordHash) {
              u.passwordHash = await sha256(u.password);
              delete u.password;
            }
            // Auto-upgrade permissions to object format
            if (!u.permissions || Array.isArray(u.permissions)) {
              if (u.id === 'admin1') {
                u.permissions = {
                  cloud_config: true,
                  system_settings: true,
                  delete_records: true,
                  manage_users: true,
                  view_cogs: true
                };
              } else {
                u.permissions = {
                  cloud_config: false,
                  system_settings: false,
                  delete_records: false,
                  manage_users: false,
                  view_cogs: false
                };
              }
            }
          }
          this.users = parsed;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.users));
        } else {
          this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.users));
        }
      } catch (e) {
        this.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
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
            passwordHash: u.passwordHash,
            permissions: u.permissions
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
          this.lockoutUntil = Date.now() + 30000;
          localStorage.setItem(LOCKOUT_KEY, String(this.lockoutUntil));
          return { success: false, message: 'Too many failed attempts. System locked for 30 seconds.' };
        }
        return { success: false, message: 'Invalid username or password.' };
      }

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

      const isSuperAdmin = caller.id === 'admin1';
      if (!isSuperAdmin) {
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

    // Admin 1 Control Methods: Create, Delete, Update Permissions
    createUser: async function (userData) {
      if (!this.isSuperAdmin()) {
        return { success: false, message: 'Permission denied. Only Admin 1 can create new accounts.' };
      }

      const cleanUsername = (userData.username || '').trim().toLowerCase();
      if (!cleanUsername || cleanUsername.length < 2) {
        return { success: false, message: 'Username must be at least 2 characters.' };
      }

      if (this.users.some(u => u.username.toLowerCase() === cleanUsername)) {
        return { success: false, message: 'Username "' + cleanUsername + '" already exists.' };
      }

      if (!userData.password || userData.password.length < 3) {
        return { success: false, message: 'Initial password must be at least 3 characters.' };
      }

      const passHash = await sha256(userData.password.trim());
      const newUser = {
        id: 'usr_' + Date.now(),
        username: cleanUsername,
        passwordHash: passHash,
        displayName: (userData.displayName || cleanUsername).trim(),
        role: userData.role || 'staff',
        roleLabel: userData.roleLabel || (userData.role === 'admin' ? 'Administrator' : 'Staff Cashier'),
        avatar: userData.avatar || (userData.role === 'admin' ? '👨‍💼' : '👤'),
        permissions: {
          cloud_config: !!userData.permissions?.cloud_config,
          system_settings: !!userData.permissions?.system_settings,
          delete_records: !!userData.permissions?.delete_records,
          manage_users: false,
          view_cogs: !!userData.permissions?.view_cogs
        }
      };

      this.users.push(newUser);
      this.saveUsers();
      return { success: true, user: newUser };
    },

    deleteUser: function (userId) {
      if (!this.isSuperAdmin()) {
        return { success: false, message: 'Permission denied. Only Admin 1 can delete accounts.' };
      }
      if (userId === 'admin1') {
        return { success: false, message: 'Cannot delete Super Admin account (Admin 1).' };
      }
      this.users = this.users.filter(u => u.id !== userId);
      this.saveUsers();
      return { success: true };
    },

    updateUserPermissions: function (userId, permissions) {
      if (!this.isSuperAdmin()) {
        return { success: false, message: 'Permission denied. Only Admin 1 can customize permissions.' };
      }
      const user = this.users.find(u => u.id === userId);
      if (!user) return { success: false, message: 'User not found.' };
      if (user.id === 'admin1') {
        return { success: false, message: 'Super Admin permissions are permanent and cannot be modified.' };
      }

      user.permissions = Object.assign(user.permissions || {}, permissions);
      this.saveUsers();
      this.applyRoleRestrictions();
      return { success: true };
    },

    getCurrentUser: function () {
      return this.currentUser || DEFAULT_USERS[0];
    },

    isSuperAdmin: function () {
      return this.getCurrentUser().id === 'admin1';
    },

    can: function (action) {
      if (this.isSuperAdmin()) return true;
      const user = this.getCurrentUser();
      if (user && user.permissions && user.permissions[action] !== undefined) {
        return !!user.permissions[action];
      }
      return false;
    },

    applyRoleRestrictions: function () {
      const user = this.getCurrentUser();
      const isSuper = user.id === 'admin1';

      // 1. Manage Accounts Dropdown option
      const manageBtn = document.getElementById('btn-dropdown-manage-users');
      if (manageBtn) {
        manageBtn.style.display = isSuper ? 'flex' : 'none';
      }

      // 2. Cloud Sync button restrictions
      const fbBadge = document.getElementById('firebase-status-badge');
      if (fbBadge) {
        const canCloud = this.can('cloud_config');
        if (!canCloud) {
          fbBadge.title = 'Cloud Sync (Active - Managed by Admin 1)';
          fbBadge.onclick = function () {
            alert('Cloud Database settings and credentials can only be configured by Main Admin.');
          };
        } else {
          fbBadge.title = 'Firebase Cloud Database & Sync (Click to configure)';
          fbBadge.onclick = function () {
            if (typeof openFirebaseModal === 'function') openFirebaseModal();
          };
        }
      }

      // 3. Settings button behavior
      const setBtn = document.querySelector('button[onclick="openSettingsModal()"]');
      if (setBtn) {
        const canSettings = this.can('system_settings');
        if (!canSettings) {
          setBtn.title = 'Settings (View-only for Admin 2)';
        } else {
          setBtn.title = 'Business & System Settings (Full Access)';
        }
      }

      // 4. User Badge styling
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

  const selectWrap = document.getElementById('chg-pass-account-select-wrap');
  const selectEl = document.getElementById('chg-pass-target-account');
  const currentPassGroup = document.getElementById('chg-pass-current-group');

  if (isSuper && selectWrap && selectEl) {
    selectWrap.style.display = 'block';
    selectEl.innerHTML = window.authSystem.users.map(u => 
      `<option value="${u.id}">${u.displayName} (${u.username})</option>`
    ).join('');
    selectEl.value = currentUser.id;
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

/* =========================================================
   USER & ROLE PERMISSIONS MANAGEMENT (ADMIN 1 EXCLUSIVE)
   ========================================================= */

function openUserManagementModal() {
  const drop = document.getElementById('user-profile-dropdown');
  if (drop) drop.classList.remove('active');

  if (!window.authSystem || !window.authSystem.isSuperAdmin()) {
    alert('Access Denied: Only Main Admin can manage user accounts and permissions.');
    return;
  }

  const modal = document.getElementById('modal-user-management');
  if (!modal) return;

  renderUserManagementList();
  modal.classList.add('active');
}

function closeUserManagementModal() {
  const modal = document.getElementById('modal-user-management');
  if (modal) modal.classList.remove('active');
  const form = document.getElementById('user-create-form-wrap');
  if (form) form.style.display = 'none';
}

function toggleCreateUserForm() {
  const form = document.getElementById('user-create-form-wrap');
  if (!form) return;
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
  if (form.style.display === 'block') {
    document.getElementById('new-user-username').value = '';
    document.getElementById('new-user-display-name').value = '';
    document.getElementById('new-user-password').value = '';
    document.getElementById('new-user-perm-cloud').checked = false;
    document.getElementById('new-user-perm-settings').checked = false;
    document.getElementById('new-user-perm-delete').checked = false;
    document.getElementById('new-user-perm-cogs').checked = false;
    document.getElementById('new-user-username').focus();
  }
}

async function handleCreateUserSubmit(event) {
  if (event) event.preventDefault();
  const username = document.getElementById('new-user-username').value;
  const displayName = document.getElementById('new-user-display-name').value;
  const password = document.getElementById('new-user-password').value;
  const role = document.getElementById('new-user-role').value;
  const cloud = document.getElementById('new-user-perm-cloud').checked;
  const settings = document.getElementById('new-user-perm-settings').checked;
  const del = document.getElementById('new-user-perm-delete').checked;
  const cogs = document.getElementById('new-user-perm-cogs').checked;

  const res = await window.authSystem.createUser({
    username: username,
    displayName: displayName,
    password: password,
    role: role,
    roleLabel: role === 'admin' ? 'Administrator' : 'Staff Cashier',
    permissions: {
      cloud_config: cloud,
      system_settings: settings,
      delete_records: del,
      view_cogs: cogs,
      manage_users: false
    }
  });

  if (!res.success) {
    alert(res.message);
  } else {
    alert(`Account "${displayName}" created successfully!`);
    toggleCreateUserForm();
    renderUserManagementList();
  }
}

function renderUserManagementList() {
  const container = document.getElementById('user-management-list-container');
  if (!container || !window.authSystem) return;

  const users = window.authSystem.users;

  let html = '';
  users.forEach(u => {
    const isSuper = u.id === 'admin1';
    html += `
      <div class="user-mgmt-row" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:14px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:26px;">${u.avatar || '👤'}</span>
            <div>
              <strong style="font-size:14px; color:#0f172a;">${u.displayName}</strong>
              <div style="font-size:11.5px; color:#64748b;">Username: <code style="background:#f1f5f9; padding:2px 5px; border-radius:4px; font-weight:700;">${u.username}</code></div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="badge ${isSuper ? 'badge-primary' : 'badge-secondary'}" style="font-size:11px; padding:3px 8px; border-radius:4px; font-weight:700;">
              ${isSuper ? '👑 Super Admin' : (u.role === 'admin' ? '🛡️ Admin' : '👤 Staff')}
            </span>
            <button type="button" class="btn btn-outline btn-sm" onclick="adminResetUserPassword('${u.id}')" title="Reset Password" style="padding:4px 8px; font-size:11.5px;">
              🔑 Reset Pass
            </button>
            ${!isSuper ? `
              <button type="button" class="btn btn-outline btn-sm text-danger" onclick="adminDeleteUser('${u.id}', '${u.displayName}')" title="Delete Account" style="padding:4px 8px; font-size:11.5px; border-color:#fecaca;">
                🗑️ Delete
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Customizable Permission Toggles -->
        <div style="background:#f8fafc; border-radius:8px; padding:10px; font-size:12px;">
          <div style="font-weight:700; color:#334155; margin-bottom:6px;">Custom Permissions:</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:8px;">
            <label style="display:flex; align-items:center; gap:6px; cursor:${isSuper ? 'not-allowed' : 'pointer'};">
              <input type="checkbox" ${u.permissions?.cloud_config ? 'checked' : ''} ${isSuper ? 'disabled' : ''} onchange="toggleUserPerm('${u.id}', 'cloud_config', this.checked)">
              <span>☁️ Cloud Database Config</span>
            </label>
            <label style="display:flex; align-items:center; gap:6px; cursor:${isSuper ? 'not-allowed' : 'pointer'};">
              <input type="checkbox" ${u.permissions?.system_settings ? 'checked' : ''} ${isSuper ? 'disabled' : ''} onchange="toggleUserPerm('${u.id}', 'system_settings', this.checked)">
              <span>⚙️ Business &amp; Bank Profile</span>
            </label>
            <label style="display:flex; align-items:center; gap:6px; cursor:${isSuper ? 'not-allowed' : 'pointer'};">
              <input type="checkbox" ${u.permissions?.delete_records ? 'checked' : ''} ${isSuper ? 'disabled' : ''} onchange="toggleUserPerm('${u.id}', 'delete_records', this.checked)">
              <span>🗑️ Delete Records &amp; Bills</span>
            </label>
            <label style="display:flex; align-items:center; gap:6px; cursor:${isSuper ? 'not-allowed' : 'pointer'};">
              <input type="checkbox" ${u.permissions?.view_cogs ? 'checked' : ''} ${isSuper ? 'disabled' : ''} onchange="toggleUserPerm('${u.id}', 'view_cogs', this.checked)">
              <span>💰 View Cost Prices &amp; Margins</span>
            </label>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function toggleUserPerm(userId, permKey, isChecked) {
  const permObj = {};
  permObj[permKey] = isChecked;
  const res = window.authSystem.updateUserPermissions(userId, permObj);
  if (!res.success) {
    alert(res.message);
    renderUserManagementList();
  } else {
    if (typeof showToast === 'function') {
      showToast('Permissions updated!');
    }
  }
}

async function adminResetUserPassword(userId) {
  const user = window.authSystem.users.find(u => u.id === userId);
  if (!user) return;

  const newPass = prompt(`Enter a new password for "${user.displayName}" (${user.username}):`);
  if (newPass === null) return;
  if (!newPass.trim() || newPass.trim().length < 3) {
    alert('Password must be at least 3 characters.');
    return;
  }

  const res = await window.authSystem.changePassword(userId, '', newPass.trim());
  if (res.success) {
    alert(`Password for "${user.displayName}" has been updated successfully!`);
  } else {
    alert(res.message);
  }
}

function adminDeleteUser(userId, displayName) {
  if (confirm(`Are you sure you want to permanently delete account "${displayName}"? This cannot be undone.`)) {
    const res = window.authSystem.deleteUser(userId);
    if (res.success) {
      alert(`Account "${displayName}" has been deleted.`);
      renderUserManagementList();
    } else {
      alert(res.message);
    }
  }
}
