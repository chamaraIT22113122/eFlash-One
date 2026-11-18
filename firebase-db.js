/**
 * RECITAL ELECTRONIC - Firebase Cloud Database & Live Sync Service
 * Free Lifetime Cloud Database integration via Firebase Firestore
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

    // Initialize Firebase and Firestore
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

        // Enable offline persistence for uninterrupted billing
        try {
          await this.db.enablePersistence({ synchronizeTabs: true });
        } catch (err) {
          // Persistence can only be initialized once or fails if multi-tabs open
          console.log('[Firebase] Persistence notice:', err.message);
        }

        this.isInitialized = true;
        this.updateStatusBadge('online', 'Cloud Synced');
        console.log('[Firebase] Firestore connected successfully to project:', config.projectId);

        // Start listening to collections
        this.setupRealtimeListeners();
        return true;
      } catch (err) {
        console.error('[Firebase] Init Error:', err);
        this.updateStatusBadge('error', 'Sync Error');
        return false;
      }
    },

    // Save or update an item in a Firestore collection
    saveItem: async function (collectionName, id, data) {
      if (!this.isInitialized || !this.db) return false;
      try {
        const cleanId = String(id || Date.now()).replace(/[\/\\]/g, '-');
        const docRef = this.db.collection(collectionName).doc(cleanId);
        await docRef.set({
          ...data,
          _updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`[Firebase] Saved item to ${collectionName}/${cleanId}`);
        return true;
      } catch (err) {
        console.warn(`[Firebase] saveItem error on ${collectionName}:`, err);
        return false;
      }
    },

    // Delete an item from Firestore
    deleteItem: async function (collectionName, id) {
      if (!this.isInitialized || !this.db) return false;
      try {
        const cleanId = String(id).replace(/[\/\\]/g, '-');
        await this.db.collection(collectionName).doc(cleanId).delete();
        console.log(`[Firebase] Deleted item from ${collectionName}/${cleanId}`);
        return true;
      } catch (err) {
        console.warn(`[Firebase] deleteItem error on ${collectionName}:`, err);
        return false;
      }
    },

    // Upload ALL existing local storage data to Firebase (One-Click Migration)
    uploadAllLocalData: async function (progressCallback) {
      if (!this.isInitialized || !this.db) {
        throw new Error('Firebase is not connected yet.');
      }

      this.isSyncing = true;
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
        const id = doc.docNumber || doc.id || ('DOC-' + Date.now());
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
      return { totalCount, syncedCount };
    },

    // Download/Restore everything from Cloud to LocalStorage
    fetchFromCloud: async function (progressCallback) {
      if (!this.isInitialized || !this.db) {
        throw new Error('Firebase is not connected yet.');
      }

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
        }
      } catch (e) {}

      // Refresh UI across tabs if handlers are loaded
      if (typeof window.renderCatalogGrid === 'function') window.renderCatalogGrid();
      if (typeof window.renderRepairsTable === 'function') window.renderRepairsTable();
      if (typeof window.renderHireTable === 'function') window.renderHireTable();
      if (typeof window.renderHistoryTable === 'function') window.renderHistoryTable();
      if (typeof window.updateDashboardSummary === 'function') window.updateDashboardSummary();

      return true;
    },

    // Listen to real-time updates from other connected devices
    setupRealtimeListeners: function () {
      if (!this.db) return;

      // Clear existing listeners
      this.listeners.forEach(unsub => {
        try { unsub(); } catch (e) {}
      });
      this.listeners = [];

      try {
        // Inventory listener
        const unsubInv = this.db.collection('inventory').onSnapshot(snapshot => {
          if (snapshot.metadata.hasPendingWrites) return; // Ignore local unsent changes
          const items = [];
          snapshot.forEach(doc => items.push(doc.data()));
          if (items.length > 0) {
            localStorage.setItem('recital_store_catalog', JSON.stringify(items));
            if (typeof window.storeCatalog !== 'undefined') window.storeCatalog = items;
            if (typeof window.renderCatalogGrid === 'function') window.renderCatalogGrid();
          }
        }, err => console.log('[Firebase listener] inventory:', err.message));
        this.listeners.push(unsubInv);

        // Job cards listener
        const unsubJobs = this.db.collection('repair_jobs').onSnapshot(snapshot => {
          if (snapshot.metadata.hasPendingWrites) return;
          const jobs = [];
          snapshot.forEach(doc => jobs.push(doc.data()));
          if (jobs.length > 0) {
            localStorage.setItem('recital_job_cards', JSON.stringify(jobs));
            if (typeof window.repairJobs !== 'undefined') window.repairJobs = jobs;
            if (typeof window.renderRepairsTable === 'function') window.renderRepairsTable();
          }
        }, err => console.log('[Firebase listener] repair_jobs:', err.message));
        this.listeners.push(unsubJobs);

        // Hire bookings listener
        const unsubHire = this.db.collection('hire_bookings').onSnapshot(snapshot => {
          if (snapshot.metadata.hasPendingWrites) return;
          const bookings = [];
          snapshot.forEach(doc => bookings.push(doc.data()));
          if (bookings.length > 0) {
            localStorage.setItem('recital_hire_bookings', JSON.stringify(bookings));
            if (typeof window.hireBookings !== 'undefined') window.hireBookings = bookings;
            if (typeof window.renderHireTable === 'function') window.renderHireTable();
          }
        }, err => console.log('[Firebase listener] hire_bookings:', err.message));
        this.listeners.push(unsubHire);

      } catch (e) {
        console.warn('[Firebase] Error setting up listeners:', e);
      }
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
