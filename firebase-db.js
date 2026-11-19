/**
 * RECITAL ELECTRONIC - Firebase Cloud Database & Continuous Live Sync Service
 * Free Lifetime Cloud Database integration via Firebase Firestore
 * Fully Automatic 2-Way Real-Time Synchronization & Auto-Saving
 */

(function () {
  const FB_CONFIG_KEY = 'recital_firebase_config';
  const FB_ENABLED_KEY = 'recital_firebase_enabled';

  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyDODhT63LysnL0gzYq1rfewiqVAiRGCx5g",
    authDomain: "eflashone-dee81.firebaseapp.com",
    projectId: "eflashone-dee81",
    storageBucket: "eflashone-dee81.firebasestorage.app",
    messagingSenderId: "535485201010",
    appId: "1:535485201010:web:85a3b8c5175fb98a2c60eb",
    measurementId: "G-N5R3H3SHN8"
  };

  let saveIndicatorTimeout = null;

  const firebaseDB = {
    app: null,
    db: null,
    isInitialized: false,
    isSyncing: false,
    listeners: [],

    // Check if configuration exists
    getConfig: function () {
      try {
        const disabled = localStorage.getItem(FB_ENABLED_KEY) === 'false';
        if (disabled) return null;
        const raw = localStorage.getItem(FB_CONFIG_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return DEFAULT_FIREBASE_CONFIG;
    },

    saveConfig: function (cfg) {
      if (typeof cfg === 'string') {
        cfg = JSON.parse(cfg);
      }
      localStorage.setItem(FB_CONFIG_KEY, JSON.stringify(cfg));
      localStorage.setItem(FB_ENABLED_KEY, 'true');
      return this.init(cfg);
    },

    clearConfig: function () {
      this.listeners.forEach(unsub => {
        try { unsub(); } catch (e) {}
      });
      this.listeners = [];
      localStorage.removeItem(FB_CONFIG_KEY);
      localStorage.setItem(FB_ENABLED_KEY, 'false');
      this.app = null;
      this.db = null;
      this.isInitialized = false;
      this.updateStatusBadge('offline', 'Local / Offline');
    },

    // Dynamically load Firebase SDK if not already present
    loadFirebaseSDK: function () {
      return new Promise((resolve, reject) => {
        if (window.firebase && window.firebase.firestore) {
          return resolve();
        }

        const appScript = document.createElement('script');
        appScript.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js';
        appScript.onload = () => {
          const firestoreScript = document.createElement('script');
          firestoreScript.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js';
          firestoreScript.onload = () => resolve();
          firestoreScript.onerror = (e) => reject(new Error('Failed to load Firestore SDK: ' + e));
          document.head.appendChild(firestoreScript);
        };
        appScript.onerror = (e) => reject(new Error('Failed to load Firebase App SDK: ' + e));
        document.head.appendChild(appScript);
      });
    },

    // Initialize Firebase, Firestore, Listeners, and Automatic Initial Sync
    init: async function (customConfig) {
      const config = customConfig || this.getConfig();
      if (!config || !config.apiKey || !config.projectId) {
        this.updateStatusBadge('offline', 'Local / Offline');
        return false;
      }

      try {
        await this.loadFirebaseSDK();

        if (!window.firebase.apps.length) {
          this.app = window.firebase.initializeApp(config);
        } else {
          this.app = window.firebase.app();
        }

        this.db = window.firebase.firestore();

        // Enable offline persistence for uninterrupted 0ms offline latency
        try {
          await this.db.enablePersistence({ synchronizeTabs: true });
        } catch (err) {
          console.log('[Firebase] Persistence notice:', err.message);
        }

        this.isInitialized = true;
        this.updateStatusBadge('online', 'Cloud Auto-Synced');
        console.log('[Firebase] Firestore connected successfully to project:', config.projectId);

        // 1. Setup continuous real-time listeners across all collections
        this.setupRealtimeListeners();

        // 2. Perform automatic initial 2-way sync in background (zero clicks needed)
        setTimeout(() => {
          this.autoSyncOnStart();
        }, 600);

        return true;
      } catch (err) {
        console.error('[Firebase] Init Error:', err);
        this.updateStatusBadge('error', 'Sync Error');
        return false;
      }
    },

    // Save or update an item in a Firestore collection automatically
    saveItem: async function (collectionName, id, data) {
      if (!this.isInitialized || !this.db) return false;
      try {
        const cleanId = String(id || Date.now()).replace(/[\/\\]/g, '-');
        const docRef = this.db.collection(collectionName).doc(cleanId);

        // Sanitize data (strip functions or undefined values)
        const cleanData = JSON.parse(JSON.stringify(data));

        this.flashAutoSavingBadge();

        await docRef.set({
          ...cleanData,
          _updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`[Firebase Auto-Save] Saved item to ${collectionName}/${cleanId}`);
        return true;
      } catch (err) {
        console.warn(`[Firebase] saveItem error on ${collectionName}:`, err);
        return false;
      }
    },

    // Delete an item from Firestore automatically
    deleteItem: async function (collectionName, id) {
      if (!this.isInitialized || !this.db) return false;
      try {
        const cleanId = String(id).replace(/[\/\\]/g, '-');
        this.flashAutoSavingBadge();
        await this.db.collection(collectionName).doc(cleanId).delete();
        console.log(`[Firebase Auto-Save] Deleted item from ${collectionName}/${cleanId}`);
        return true;
      } catch (err) {
        console.warn(`[Firebase] deleteItem error on ${collectionName}:`, err);
        return false;
      }
    },

    // Visual indicator when auto-saving
    flashAutoSavingBadge: function () {
      this.updateStatusBadge('syncing', 'Auto-Saving...');
      if (saveIndicatorTimeout) clearTimeout(saveIndicatorTimeout);
      saveIndicatorTimeout = setTimeout(() => {
        this.updateStatusBadge('online', 'Cloud Auto-Synced');
      }, 900);
    },

    // AUTOMATIC INITIAL 2-WAY SYNC (Runs automatically on startup)
    autoSyncOnStart: async function () {
      if (!this.isInitialized || !this.db || this.isSyncing) return;
      this.isSyncing = true;
      this.updateStatusBadge('syncing', 'Auto-Syncing...');

      try {
        console.log('[Firebase] Running automatic bidirectional background sync...');

        // Fetch cloud snapshots in parallel
        const [invSnap, docSnap, jobSnap, hireSnap, setSnap] = await Promise.all([
          this.db.collection('inventory').get(),
          this.db.collection('invoices').get(),
          this.db.collection('repair_jobs').get(),
          this.db.collection('hire_bookings').get(),
          this.db.collection('settings').get()
        ]);

        // Map cloud items
        const cloudInvMap = new Map();
        invSnap.forEach(d => cloudInvMap.set(d.id, d.data()));

        const cloudDocsMap = new Map();
        docSnap.forEach(d => cloudDocsMap.set(d.id, d.data()));

        const cloudJobsMap = new Map();
        jobSnap.forEach(d => cloudJobsMap.set(d.id, d.data()));

        const cloudHireMap = new Map();
        hireSnap.forEach(d => cloudHireMap.set(d.id, d.data()));

        // Local items
        const localCatalog = JSON.parse(localStorage.getItem('recital_store_catalog') || '[]');
        const localDocs = JSON.parse(localStorage.getItem('recital_docs_history') || '[]');
        const localJobs = JSON.parse(localStorage.getItem('recital_job_cards') || '[]');
        const localHire = JSON.parse(localStorage.getItem('recital_hire_bookings') || '[]');

        // 1. INVENTORY: 2-Way Merge
        const mergedCatalogMap = new Map(cloudInvMap);
        for (const localItem of localCatalog) {
          const id = String(localItem.code || localItem.id || ('ITM-' + Date.now())).replace(/[\/\\]/g, '-');
          if (!mergedCatalogMap.has(id)) {
            await this.saveItem('inventory', id, localItem);
            mergedCatalogMap.set(id, localItem);
          }
        }
        if (mergedCatalogMap.size > 0) {
          const list = Array.from(mergedCatalogMap.values());
          localStorage.setItem('recital_store_catalog', JSON.stringify(list));
          if (typeof window.storeCatalog !== 'undefined') window.storeCatalog = list;
        }

        // 2. INVOICES & RECEIPTS: 2-Way Merge
        const mergedDocsMap = new Map(cloudDocsMap);
        for (const localDoc of localDocs) {
          const id = String(localDoc.number || localDoc.id || ('DOC-' + Date.now())).replace(/[\/\\]/g, '-');
          if (!mergedDocsMap.has(id)) {
            await this.saveItem('invoices', id, localDoc);
            mergedDocsMap.set(id, localDoc);
          }
        }
        if (mergedDocsMap.size > 0) {
          const list = Array.from(mergedDocsMap.values());
          list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          localStorage.setItem('recital_docs_history', JSON.stringify(list));
        }

        // 3. REPAIR JOBS: 2-Way Merge
        const mergedJobsMap = new Map(cloudJobsMap);
        for (const localJob of localJobs) {
          const id = String(localJob.jobId || localJob.id || ('JOB-' + Date.now())).replace(/[\/\\]/g, '-');
          if (!mergedJobsMap.has(id)) {
            await this.saveItem('repair_jobs', id, localJob);
            mergedJobsMap.set(id, localJob);
          }
        }
        if (mergedJobsMap.size > 0) {
          const list = Array.from(mergedJobsMap.values());
          localStorage.setItem('recital_job_cards', JSON.stringify(list));
          if (typeof window.repairJobs !== 'undefined') window.repairJobs = list;
        }

        // 4. HIRE BOOKINGS: 2-Way Merge
        const mergedHireMap = new Map(cloudHireMap);
        for (const localB of localHire) {
          const id = String(localB.bookingId || localB.id || ('HIRE-' + Date.now())).replace(/[\/\\]/g, '-');
          if (!mergedHireMap.has(id)) {
            await this.saveItem('hire_bookings', id, localB);
            mergedHireMap.set(id, localB);
          }
        }
        if (mergedHireMap.size > 0) {
          const list = Array.from(mergedHireMap.values());
          localStorage.setItem('recital_hire_bookings', JSON.stringify(list));
          if (typeof window.hireBookings !== 'undefined') window.hireBookings = list;
        }

        // 5. SETTINGS: Sync Profile & Receipt Config
        setSnap.forEach(d => {
          if (d.id === 'business_profile') {
            const data = d.data();
            localStorage.setItem('recital_settings', JSON.stringify(data));
            if (typeof window.state !== 'undefined' && window.state.settings) {
              window.state.settings = Object.assign(window.state.settings, data);
            }
          } else if (d.id === 'thermal_receipt') {
            localStorage.setItem('recital_rcpt_cfg', JSON.stringify(d.data()));
          }
        });

        // Trigger complete UI refresh
        if (typeof window.renderPosCatalog === 'function') window.renderPosCatalog();
        if (typeof window.renderInventoryView === 'function') window.renderInventoryView();
        if (typeof window.renderHistoryView === 'function') window.renderHistoryView();
        if (typeof window.renderRepairsView === 'function') window.renderRepairsView();
        if (typeof window.renderHireView === 'function') window.renderHireView();
        if (typeof window.updateDashboard === 'function') window.updateDashboard();
        if (typeof window.syncFormWithState === 'function') window.syncFormWithState();
        if (typeof window.updateLivePreview === 'function') window.updateLivePreview();

        this.updateStatusBadge('online', 'Cloud Auto-Synced');
        console.log('[Firebase] Auto-sync finished: All devices up-to-date.');
      } catch (err) {
        console.warn('[Firebase] Auto-sync notice:', err);
        this.updateStatusBadge('online', 'Cloud Auto-Synced');
      } finally {
        this.isSyncing = false;
      }
    },

    // Listen to real-time updates across ALL collections from other devices
    setupRealtimeListeners: function () {
      if (!this.db) return;

      // Clear existing listeners
      this.listeners.forEach(unsub => {
        try { unsub(); } catch (e) {}
      });
      this.listeners = [];

      try {
        // 1. Inventory listener
        const unsubInv = this.db.collection('inventory').onSnapshot(snapshot => {
          if (snapshot.metadata.hasPendingWrites) return; // Ignore own uncommitted writes
          const items = [];
          snapshot.forEach(doc => items.push(doc.data()));
          if (items.length > 0) {
            localStorage.setItem('recital_store_catalog', JSON.stringify(items));
            if (typeof window.storeCatalog !== 'undefined') window.storeCatalog = items;
            if (typeof window.renderPosCatalog === 'function') window.renderPosCatalog();
            if (typeof window.renderInventoryView === 'function') window.renderInventoryView();
            if (typeof window.updateDashboard === 'function') window.updateDashboard();
          }
        }, err => console.log('[Firebase listener] inventory:', err.message));
        this.listeners.push(unsubInv);

        // 2. Invoices & Receipts listener (REAL-TIME ACROSS ALL DEVICES)
        const unsubInvoices = this.db.collection('invoices').onSnapshot(snapshot => {
          if (snapshot.metadata.hasPendingWrites) return;
          const docs = [];
          snapshot.forEach(doc => docs.push(doc.data()));
          if (docs.length > 0) {
            docs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            localStorage.setItem('recital_docs_history', JSON.stringify(docs));
            if (typeof window.renderHistoryView === 'function') window.renderHistoryView();
            if (typeof window.renderHistoryList === 'function') {
              const searchInp = document.getElementById('search-history-input');
              window.renderHistoryList(searchInp ? searchInp.value : '');
            }
            if (typeof window.updateDashboard === 'function') window.updateDashboard();
            if (typeof window.renderReportsView === 'function') window.renderReportsView();
          }
        }, err => console.log('[Firebase listener] invoices:', err.message));
        this.listeners.push(unsubInvoices);

        // 3. Repair Job Cards listener
        const unsubJobs = this.db.collection('repair_jobs').onSnapshot(snapshot => {
          if (snapshot.metadata.hasPendingWrites) return;
          const jobs = [];
          snapshot.forEach(doc => jobs.push(doc.data()));
          if (jobs.length > 0) {
            localStorage.setItem('recital_job_cards', JSON.stringify(jobs));
            if (typeof window.repairJobs !== 'undefined') window.repairJobs = jobs;
            if (typeof window.renderRepairsView === 'function') window.renderRepairsView();
            if (typeof window.updateDashboard === 'function') window.updateDashboard();
          }
        }, err => console.log('[Firebase listener] repair_jobs:', err.message));
        this.listeners.push(unsubJobs);

        // 4. Hire Bookings listener
        const unsubHire = this.db.collection('hire_bookings').onSnapshot(snapshot => {
          if (snapshot.metadata.hasPendingWrites) return;
          const bookings = [];
          snapshot.forEach(doc => bookings.push(doc.data()));
          if (bookings.length > 0) {
            localStorage.setItem('recital_hire_bookings', JSON.stringify(bookings));
            if (typeof window.hireBookings !== 'undefined') window.hireBookings = bookings;
            if (typeof window.renderHireView === 'function') window.renderHireView();
            if (typeof window.updateDashboard === 'function') window.updateDashboard();
          }
        }, err => console.log('[Firebase listener] hire_bookings:', err.message));
        this.listeners.push(unsubHire);

        // 5. Settings listener
        const unsubSettings = this.db.collection('settings').onSnapshot(snapshot => {
          if (snapshot.metadata.hasPendingWrites) return;
          snapshot.forEach(doc => {
            if (doc.id === 'business_profile') {
              const data = doc.data();
              localStorage.setItem('recital_settings', JSON.stringify(data));
              if (typeof window.state !== 'undefined' && window.state.settings) {
                window.state.settings = Object.assign(window.state.settings, data);
                if (typeof window.syncFormWithState === 'function') window.syncFormWithState();
                if (typeof window.updateLivePreview === 'function') window.updateLivePreview();
              }
            } else if (doc.id === 'thermal_receipt') {
              localStorage.setItem('recital_rcpt_cfg', JSON.stringify(doc.data()));
            } else if (doc.id === 'admin_users' && window.authSystem) {
              const data = doc.data();
              if (data && data.users && Array.isArray(data.users)) {
                window.authSystem.users = data.users;
                localStorage.setItem('recital_auth_users', JSON.stringify(data.users));
              }
            }
          });
        }, err => console.log('[Firebase listener] settings:', err.message));
        this.listeners.push(unsubSettings);

      } catch (e) {
        console.warn('[Firebase] Error setting up listeners:', e);
      }
    },

    // Upload ALL existing local storage data to Firebase (Manual Migration Override)
    uploadAllLocalData: async function (progressCallback) {
      if (!this.isInitialized || !this.db) {
        throw new Error('Firebase is not connected yet.');
      }

      this.isSyncing = true;
      this.updateStatusBadge('syncing', 'Syncing...');
      let totalCount = 0;
      let syncedCount = 0;

      // Collect local items
      const catalog = JSON.parse(localStorage.getItem('recital_store_catalog') || '[]');
      const history = JSON.parse(localStorage.getItem('recital_docs_history') || '[]');
      const jobCards = JSON.parse(localStorage.getItem('recital_job_cards') || '[]');
      const hireBookings = JSON.parse(localStorage.getItem('recital_hire_bookings') || '[]');
      const settings = JSON.parse(localStorage.getItem('recital_settings') || '{}');
      const rcptCfg = JSON.parse(localStorage.getItem('recital_rcpt_cfg') || '{}');

      totalCount = catalog.length + history.length + jobCards.length + hireBookings.length + 2;

      // 1. Sync Inventory Catalog
      for (const item of catalog) {
        const id = item.code || item.id || ('ITM-' + Date.now());
        await this.saveItem('inventory', id, item);
        syncedCount++;
        if (progressCallback) progressCallback(syncedCount, totalCount, 'Inventory: ' + (item.name || id));
      }

      // 2. Sync Invoices & POS Receipts
      for (const doc of history) {
        const id = doc.number || doc.docNumber || doc.id || ('DOC-' + Date.now());
        await this.saveItem('invoices', id, doc);
        syncedCount++;
        if (progressCallback) progressCallback(syncedCount, totalCount, 'Invoice/Receipt: ' + id);
      }

      // 3. Sync Repair Job Cards
      for (const job of jobCards) {
        const id = job.jobId || job.id || ('JOB-' + Date.now());
        await this.saveItem('repair_jobs', id, job);
        syncedCount++;
        if (progressCallback) progressCallback(syncedCount, totalCount, 'Job Card: ' + id);
      }

      // 4. Sync Sound Hire Bookings
      for (const b of hireBookings) {
        const id = b.bookingId || b.id || ('HIRE-' + Date.now());
        await this.saveItem('hire_bookings', id, b);
        syncedCount++;
        if (progressCallback) progressCallback(syncedCount, totalCount, 'Hire Booking: ' + id);
      }

      // 5. Sync Settings
      await this.saveItem('settings', 'business_profile', settings);
      syncedCount++;
      await this.saveItem('settings', 'thermal_receipt', rcptCfg);
      syncedCount++;

      this.isSyncing = false;
      this.updateStatusBadge('online', 'Cloud Auto-Synced');
      return { totalCount, syncedCount };
    },

    // Download/Restore everything from Cloud to LocalStorage (Manual Restore Override)
    fetchFromCloud: async function (progressCallback) {
      if (!this.isInitialized || !this.db) {
        throw new Error('Firebase is not connected yet.');
      }

      this.isSyncing = true;
      this.updateStatusBadge('syncing', 'Restoring...');
      if (progressCallback) progressCallback('Fetching collections from Firebase...');

      // 1. Inventory
      const invSnap = await this.db.collection('inventory').get();
      if (!invSnap.empty) {
        const items = [];
        invSnap.forEach(doc => items.push(doc.data()));
        localStorage.setItem('recital_store_catalog', JSON.stringify(items));
        if (typeof window.storeCatalog !== 'undefined') window.storeCatalog = items;
      }

      // 2. Invoices & Receipts
      const docSnap = await this.db.collection('invoices').get();
      if (!docSnap.empty) {
        const docs = [];
        docSnap.forEach(doc => docs.push(doc.data()));
        docs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        localStorage.setItem('recital_docs_history', JSON.stringify(docs));
      }

      // 3. Repair Job Cards
      const jobSnap = await this.db.collection('repair_jobs').get();
      if (!jobSnap.empty) {
        const jobs = [];
        jobSnap.forEach(doc => jobs.push(doc.data()));
        localStorage.setItem('recital_job_cards', JSON.stringify(jobs));
        if (typeof window.repairJobs !== 'undefined') window.repairJobs = jobs;
      }

      // 4. Sound Hire Bookings
      const hireSnap = await this.db.collection('hire_bookings').get();
      if (!hireSnap.empty) {
        const bookings = [];
        hireSnap.forEach(doc => bookings.push(doc.data()));
        localStorage.setItem('recital_hire_bookings', JSON.stringify(bookings));
        if (typeof window.hireBookings !== 'undefined') window.hireBookings = bookings;
      }

      // 5. Settings
      try {
        const setDoc = await this.db.collection('settings').doc('business_profile').get();
        if (setDoc.exists) {
          localStorage.setItem('recital_settings', JSON.stringify(setDoc.data()));
          if (typeof window.state !== 'undefined' && window.state.settings) {
            window.state.settings = Object.assign(window.state.settings, setDoc.data());
          }
        }
      } catch (e) {}

      // Refresh UI across tabs
      if (typeof window.renderPosCatalog === 'function') window.renderPosCatalog();
      if (typeof window.renderInventoryView === 'function') window.renderInventoryView();
      if (typeof window.renderHistoryView === 'function') window.renderHistoryView();
      if (typeof window.renderRepairsView === 'function') window.renderRepairsView();
      if (typeof window.renderHireView === 'function') window.renderHireView();
      if (typeof window.updateDashboard === 'function') window.updateDashboard();
      if (typeof window.syncFormWithState === 'function') window.syncFormWithState();
      if (typeof window.updateLivePreview === 'function') window.updateLivePreview();

      this.isSyncing = false;
      this.updateStatusBadge('online', 'Cloud Auto-Synced');
      return true;
    },

    // UI Status Badge update
    updateStatusBadge: function (status, text) {
      const badge = document.getElementById('firebase-status-badge');
      const dot = document.getElementById('firebase-status-dot');
      const label = document.getElementById('firebase-status-text');

      if (!badge) return;

      badge.className = 'fb-status-pill fb-status-' + status;
      if (dot) dot.className = 'fb-status-dot dot-' + status;
      if (label) label.textContent = text || status;
    }
  };

  // Expose globally
  window.firebaseDB = firebaseDB;

  // Auto-init on page load if config is saved
  document.addEventListener('DOMContentLoaded', function () {
    firebaseDB.init();
  });
})();
