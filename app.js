/**
 * Recital Electronic - Invoice & Quotation Builder
 * Core Application Logic, State Management & Event Handlers
 */

// Default settings
const DEFAULT_SETTINGS = {
  bizName: "RECITAL ELECTRONIC",
  bizAddress: "583/2,Dewata Road, Kudhanelumkulama, Galkulama, Anuradhapura",
  bizPhone: "0763366993",
  bizReg: "NCP/NPE/004141",
  invPrefix: "RE-INV-",
  qtPrefix: "RE-QT-",
  invCounter: 101,
  qtCounter: 101,
  bankName: "Bank of Ceylon / Commercial Bank",
  accountNumber: "1234567890",
  accountName: "Recital Electronic",
  branch: "Anuradhapura"
};

// Load Settings from LocalStorage
function loadSettings() {
  try {
    const saved = localStorage.getItem('recital_settings');
    if (saved) return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(saved));
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return Object.assign({}, DEFAULT_SETTINGS);
}

// Save Settings to LocalStorage
function persistSettings(newSettings) {
  if (typeof state !== 'undefined' && state) {
    state.settings = Object.assign({}, state.settings, newSettings);
  }
  localStorage.setItem('recital_settings', JSON.stringify(newSettings));
}

// Generate Next Document Number
function getNextDocNumber(type, settings) {
  const s = settings || (typeof state !== 'undefined' && state ? state.settings : DEFAULT_SETTINGS);
  const year = new Date().getFullYear();
  if (type === 'invoice') {
    const num = s.invCounter || 101;
    return `${s.invPrefix || 'RE-INV-'}${year}-${String(num).padStart(3, '0')}`;
  } else {
    const num = s.qtCounter || 101;
    return `${s.qtPrefix || 'RE-QT-'}${year}-${String(num).padStart(3, '0')}`;
  }
}

// Helper: Format Date to YYYY-MM-DD
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Format Date to display string (e.g. 18 Nov, 2026)
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

// Helper: Format Currency (Rs. 12,500.00)
function formatCurrency(val) {
  const num = parseFloat(val) || 0;
  return 'Rs. ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Create Initial Fresh Document
function createInitialDoc(type, settings) {
  const s = settings || (typeof state !== 'undefined' && state ? state.settings : DEFAULT_SETTINGS);
  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + (type === 'invoice' ? 7 : 14));

  const t = typeof window !== 'undefined' && window.AppTranslations && window.AppTranslations.en ? window.AppTranslations.en : null;
  const initialTerms = t ? [t.termsPresets[0].textEn, t.termsPresets[2].textEn] : [];

  return {
    id: Date.now().toString(),
    type: type,
    number: getNextDocNumber(type, s),
    date: formatDate(today),
    dueDate: formatDate(due),
    status: 'Draft',
    customer: {
      name: '',
      phone: '',
      address: '',
      email: ''
    },
    items: [
      { id: '1', description: 'Sound System Hire (Standard Package)', qty: 1, unitPrice: 25000, amount: 25000 },
      { id: '2', description: 'Power Amplifier Repair Service', qty: 1, unitPrice: 4500, amount: 4500 }
    ],
    discount: 0,
    delivery: 0,
    advance: 0,
    payment: {
      bankName: s.bankName,
      accountNumber: s.accountNumber,
      accountName: s.accountName,
      branch: s.branch
    },
    terms: initialTerms,
    notes: '',
    showBackground: true,
    inventoryDeducted: false
  };
}

// Store Catalog State
const DEFAULT_STORE_CATALOG = [
  // Services (Sound Rentals & Repairs)
  { id: 'srv-1', type: 'service', nameEn: 'Sound System Hire (Standard Package)', nameSi: 'ශබ්ද විකාශන කුලියට දීම (සාමාන්‍ය)', price: 25000, stock: 99 },
  { id: 'srv-2', type: 'service', nameEn: 'Sound System Hire (Full Stage Setup)', nameSi: 'ප්‍රසංග ශබ්ද පරිපාලනය (Full Stage)', price: 65000, stock: 99 },
  { id: 'srv-3', type: 'service', nameEn: 'Power Amplifier Repair Service', nameSi: 'ඇම්ප්ලිෆයර් අලුත්වැඩියාව', price: 4500, stock: 99 },
  { id: 'srv-4', type: 'service', nameEn: 'Speaker Box Re-coning & Coil Repair', nameSi: 'ස්පීකර් කොයිල් දැමීම සහ රිකෝනින්', price: 3500, stock: 99 },
  { id: 'srv-5', type: 'service', nameEn: 'Electronic Circuit / PCB Repair', nameSi: 'ඉලෙක්ට්‍රොනික පරිපථ පුවරු අලුත්වැඩියාව', price: 2500, stock: 99 },
  { id: 'srv-6', type: 'service', nameEn: 'Sound Operator / Technician Daily Fee', nameSi: 'ශබ්ද පරිපාලක දෛනික සේවා ගාස්තුව', price: 5000, stock: 99 },
  { id: 'srv-7', type: 'service', nameEn: 'DJ Setup & Club Lighting Rental', nameSi: 'DJ සහ ආලෝකකරණ පද්ධතිය කුලියට දීම', price: 35000, stock: 99 },

  // Items Selling (Products & Parts)
  { id: 'itm-1', type: 'item', nameEn: '15-Inch Speaker Box (Pair)', nameSi: '15 ඉන්චි ස්පීකර් පෙට්ටි (ජෝඩුව)', price: 48000, stock: 4 },
  { id: 'itm-2', type: 'item', nameEn: '18-Inch Subwoofer Bass Box', nameSi: '18 ඉන්චි සබ්වූෆර් බේස් පෙට්ටිය', price: 55000, stock: 2 },
  { id: 'itm-3', type: 'item', nameEn: 'Wireless Microphone Set (Dual Channel)', nameSi: 'රැහැන් රහිත මයික් කට්ටලය', price: 16500, stock: 8 },
  { id: 'itm-4', type: 'item', nameEn: 'Heavy-Duty Speakon Speaker Cable (10m)', nameSi: 'ස්පීකන් කේබල් මීටර් 10', price: 3500, stock: 25 },
  { id: 'itm-5', type: 'item', nameEn: 'Professional Audio Mixer (8 Channel)', nameSi: 'ශබ්ද මිශ්‍රණ යන්ත්‍රය (8 Channel)', price: 38000, stock: 3 },
  { id: 'itm-6', type: 'item', nameEn: 'Heavy Duty Microphone Stand', nameSi: 'මයික්‍රෆෝන් ස්ටෑන්ඩ්', price: 4200, stock: 12 },
  { id: 'itm-7', type: 'item', nameEn: 'XLR Male/Female Connector Pair', nameSi: 'XLR කනෙක්ටර් යුගලයක්', price: 1200, stock: 50 },
  { id: 'itm-8', type: 'item', nameEn: '2SC5200 / 2SA1943 Power Transistors', nameSi: 'ට්‍රාන්සිස්ටර් ජෝඩුව (Power Transistors)', price: 1800, stock: 40 },
  { id: 'itm-9', type: 'item', nameEn: '12V 7Ah Rechargeable Battery', nameSi: '12V 7Ah නැවත ආරෝපණය කළ හැකි බැටරිය', price: 6800, stock: 15 }
];

function loadStoreCatalog() {
  try {
    const saved = localStorage.getItem('recital_store_catalog');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_STORE_CATALOG.slice();
}

function persistStoreCatalog(cat) {
  localStorage.setItem('recital_store_catalog', JSON.stringify(cat));
  if (window.firebaseDB && window.firebaseDB.isInitialized && !window.firebaseDB.isSyncing) {
    cat.forEach(item => {
      const id = item.code || item.id || ('ITM-' + Date.now());
      window.firebaseDB.saveItem('inventory', id, item);
    });
  }
}

var storeCatalog = loadStoreCatalog();
var posCart = [];
var currentPosFilter = 'all';
var currentPosSearch = '';
var isPosCartDeducted = false;

/**
 * Deduct physical items from inventory when a sale is finalized, printed, or saved.
 * Services (type === 'service') are excluded since they do not carry physical stock.
 * @param {Array} itemsList - items from posCart or doc.items
 * @param {string} sourceDoc - origin description (e.g. 'POS Receipt', 'Invoice', 'Quotation')
 * @returns {Array} List of deducted items with name, qty, remainingStock
 */
function deductItemsFromCatalog(itemsList, sourceDoc) {
  if (!itemsList || !Array.isArray(itemsList) || itemsList.length === 0) return [];
  const deducted = [];
  let catalogUpdated = false;

  itemsList.forEach(item => {
    const qty = Math.max(0, parseFloat(item.qty) || 1);
    if (qty <= 0) return;

    // 1. Direct ID or catalogId lookup
    let target = null;
    if (item.catalogId) {
      target = storeCatalog.find(c => c.id === item.catalogId);
    }
    if (!target && item.id) {
      target = storeCatalog.find(c => c.id === item.id);
    }

    // 2. Exact name match (English or Sinhala)
    if (!target) {
      const desc = (item.description || item.nameEn || item.nameSi || '').trim().toLowerCase();
      if (desc) {
        target = storeCatalog.find(c => {
          const en = (c.nameEn || '').trim().toLowerCase();
          const si = (c.nameSi || '').trim().toLowerCase();
          return (en && desc === en) || (si && desc === si);
        });

        // 3. Fallback: startsWith / contains match for physical items
        if (!target) {
          target = storeCatalog.find(c => {
            if (c.type !== 'item') return false;
            const en = (c.nameEn || '').trim().toLowerCase();
            const si = (c.nameSi || '').trim().toLowerCase();
            return (en && desc.includes(en)) || (si && desc.includes(si));
          });
        }
      }
    }

    // Only deduct physical items (never services)
    if (target && target.type === 'item') {
      const curStock = parseInt(target.stock, 10) || 0;
      const newStock = Math.max(0, curStock - qty);
      target.stock = newStock;
      catalogUpdated = true;
      deducted.push({
        id: target.id,
        name: target.nameEn,
        qty: qty,
        remainingStock: newStock
      });
    }
  });

  if (catalogUpdated) {
    persistStoreCatalog(storeCatalog);
    if (typeof renderPosCatalog === 'function') renderPosCatalog();
    if (typeof renderInventoryView === 'function') renderInventoryView();
    if (typeof updateDashboard === 'function') updateDashboard();
  }

  return deducted;
}

// Initial settings load
const initialSettings = loadSettings();

// Global App State
var state = {
  currentTab: 'dashboard', // Default landing page: dashboard
  currentLang: 'en', // Default UI language: English (can toggle to Sinhala anytime)
  printLang: 'bilingual', // Document print language: bilingual
  docType: 'quotation', // 'quotation' or 'invoice'
  showBackground: true,
  showBizHeader: false, // Hidden/removed from preview header by default as requested
  settings: initialSettings,
  doc: createInitialDoc('quotation', initialSettings)
};

// ==========================================
// Initialization & Rendering
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  populatePresetDropdown();
  renderTermsCheckboxes();
  syncFormWithState();
  updateLivePreview();
  renderPosCatalog();
  renderPosCart();
  renderInventoryView();
  renderRepairsView();
  renderHireView();
  renderReportsView();
  updateDashboard();
  applyLanguage(state.currentLang);
  setupModalDismissal();

  // Auto-dismiss splash animation
  setTimeout(dismissSplash, 1400);
}

// Dismiss Splash Screen
function dismissSplash() {
  const splash = document.getElementById('splash-overlay');
  if (splash) {
    splash.classList.add('fade-out');
  }
}

// Setup modal listeners for backdrop click and Escape key
function setupModalDismissal() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeHistoryModal();
      closeSettingsModal();
      closeWhatsappModal();
      closeAddProductModal();
      closeJobCardModal();
      closeJobSlipModal();
      closeHireBookingModal();
      closeZReportModal();
    }
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

// Populate the preset items dropdown
function populatePresetDropdown() {
  const select = document.getElementById('select-preset-items');
  if (!select) return;
  const t = window.AppTranslations[state.currentLang] || window.AppTranslations['en'];

  select.innerHTML = `<option value="">+ ${state.currentLang === 'si' ? 'නිතර භාවිතා වන භාණ්ඩ/සේවා එක්කරන්න...' : 'Quick Add Common Item/Service...'}</option>`;

  t.presets.forEach((item, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${item.nameSi} (${formatCurrency(item.price)})`;
    select.appendChild(opt);
  });
}

// Render Terms & Warranty Checkboxes
function renderTermsCheckboxes() {
  const container = document.getElementById('terms-checkbox-container');
  if (!container) return;
  container.innerHTML = '';

  const t = window.AppTranslations[state.currentLang] || window.AppTranslations['en'];
  t.termsPresets.forEach((preset, idx) => {
    const label = document.createElement('label');
    label.className = 'terms-item';

    const textToShow = state.currentLang === 'si' ? preset.textSi : preset.textEn;
    const isChecked = state.doc.terms.some(term => term === preset.textEn || term === preset.textSi);

    label.innerHTML = `
      <input type="checkbox" value="${idx}" ${isChecked ? 'checked' : ''} onchange="toggleTermPreset(${idx}, this.checked)">
      <span>${textToShow}</span>
    `;
    container.appendChild(label);
  });
}

// Toggle term preset checkbox
function toggleTermPreset(idx, checked) {
  const t = window.AppTranslations.en;
  const termEn = t.termsPresets[idx].textEn;
  const termSi = t.termsPresets[idx].textSi;

  if (checked) {
    if (!state.doc.terms.includes(termEn)) {
      state.doc.terms.push(termEn);
    }
  } else {
    state.doc.terms = state.doc.terms.filter(item => item !== termEn && item !== termSi);
  }
  updateLivePreview();
}

// Sync Editor Form Fields with State
function syncFormWithState() {
  document.getElementById('input-biz-name').value = state.settings.bizName || '';
  document.getElementById('input-biz-address').value = state.settings.bizAddress || '';
  document.getElementById('input-biz-phone').value = state.settings.bizPhone || '';
  document.getElementById('input-biz-reg').value = state.settings.bizReg || '';
  document.getElementById('input-show-biz-header').checked = !!state.showBizHeader;

  document.getElementById('input-doc-number').value = state.doc.number || '';
  document.getElementById('input-doc-date').value = state.doc.date || '';
  document.getElementById('input-doc-due-date').value = state.doc.dueDate || '';
  document.getElementById('input-doc-status').value = state.doc.status || 'Draft';

  document.getElementById('input-customer-name').value = state.doc.customer.name || '';
  document.getElementById('input-customer-phone').value = state.doc.customer.phone || '';
  document.getElementById('input-customer-address').value = state.doc.customer.address || '';
  document.getElementById('input-customer-email').value = state.doc.customer.email || '';

  document.getElementById('input-discount-val').value = state.doc.discount || 0;
  document.getElementById('input-delivery-fee').value = state.doc.delivery || 0;
  document.getElementById('input-advance-paid').value = state.doc.advance || 0;

  document.getElementById('input-bank-name').value = state.doc.payment.bankName || '';
  document.getElementById('input-acc-number').value = state.doc.payment.accountNumber || '';
  document.getElementById('input-acc-name').value = state.doc.payment.accountName || '';
  document.getElementById('input-bank-branch').value = state.doc.payment.branch || '';
  document.getElementById('input-custom-notes').value = state.doc.notes || '';

  renderItemsEditorTable();
}

// Render items in editor table
function renderItemsEditorTable() {
  const tbody = document.getElementById('items-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  state.doc.items.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align:center; color:#64748b; font-weight:600;">${idx + 1}</td>
      <td>
        <input type="text" value="${escapeHtml(item.description)}" placeholder="Description" oninput="updateItemField(${idx}, 'description', this.value)">
      </td>
      <td>
        <input type="number" min="0" step="any" value="${item.qty}" oninput="updateItemField(${idx}, 'qty', this.value)">
      </td>
      <td>
        <input type="number" min="0" step="any" value="${item.unitPrice}" oninput="updateItemField(${idx}, 'unitPrice', this.value)">
      </td>
      <td class="row-total-val" style="text-align:right;">
        ${formatCurrency(item.amount)}
      </td>
      <td style="text-align:center;">
        <button type="button" class="btn btn-danger-outline btn-sm" onclick="removeItemRow(${idx})" title="Delete row">
          &times;
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Add New Empty Row
function addNewItemRow() {
  state.doc.items.push({
    id: Date.now().toString(),
    description: '',
    qty: 1,
    unitPrice: 0,
    amount: 0
  });
  renderItemsEditorTable();
  updateLivePreview();
}

// Add Preset Item
function addPresetItem(presetIndex) {
  if (presetIndex === '') return;
  const t = window.AppTranslations[state.currentLang] || window.AppTranslations['en'];
  const preset = t.presets[parseInt(presetIndex, 10)];
  if (!preset) return;

  const desc = state.currentLang === 'si' ? preset.nameSi : preset.nameEn;
  const catItem = storeCatalog.find(c =>
    (c.nameEn && preset.nameEn && c.nameEn.toLowerCase() === preset.nameEn.toLowerCase()) ||
    (c.nameSi && preset.nameSi && c.nameSi.toLowerCase() === preset.nameSi.toLowerCase())
  );

  state.doc.items.push({
    id: Date.now().toString(),
    catalogId: catItem ? catItem.id : null,
    type: catItem ? catItem.type : 'item',
    description: desc,
    qty: 1,
    unitPrice: preset.price,
    amount: preset.price
  });
  renderItemsEditorTable();
  updateLivePreview();
}

// Update Item Field
function updateItemField(index, field, value) {
  if (!state.doc.items[index]) return;
  if (field === 'qty') {
    state.doc.items[index].qty = Math.max(0, parseFloat(value) || 0);
  } else if (field === 'unitPrice') {
    state.doc.items[index].unitPrice = Math.max(0, parseFloat(value) || 0);
  } else {
    state.doc.items[index][field] = value;
  }
  state.doc.items[index].amount = state.doc.items[index].qty * state.doc.items[index].unitPrice;

  // Re-render row amount in editor
  const rows = document.getElementById('items-table-body').querySelectorAll('tr');
  if (rows[index]) {
    rows[index].querySelector('.row-total-val').textContent = formatCurrency(state.doc.items[index].amount);
  }
  updateLivePreview();
}

// Remove Item Row
function removeItemRow(index) {
  state.doc.items.splice(index, 1);
  if (state.doc.items.length === 0) {
    addNewItemRow();
  } else {
    renderItemsEditorTable();
    updateLivePreview();
  }
}

// Clear All Items
function clearAllItems() {
  state.doc.items = [];
  addNewItemRow();
}

// Update Business Fields from Form
function updateBizField(field, value) {
  state.settings[field] = value;
  persistSettings(state.settings);
  updateLivePreview();
}

function toggleBizHeaderDisplay(checked) {
  state.showBizHeader = checked;
  updateLivePreview();
}

// Update Document Fields
function updateDocField(field, value) {
  state.doc[field] = value;
  updateLivePreview();
}

function updateCustomerField(field, value) {
  state.doc.customer[field] = value;
  updateLivePreview();
}

function updateSummaryField(field, value) {
  state.doc[field] = Math.max(0, parseFloat(value) || 0);
  updateLivePreview();
}

function updatePaymentField(field, value) {
  state.doc.payment[field] = value;
  updateLivePreview();
}

// ==========================================
// Mode Toggle: Quotation ↔ Invoice
// ==========================================

function setDocType(type) {
  state.docType = type;
  state.doc.type = type;

  const btnQ = document.getElementById('btn-mode-quotation');
  const btnI = document.getElementById('btn-mode-invoice');
  const btnConvert = document.getElementById('ui-btn-convert');
  const heading = document.getElementById('prev-heading-title');
  const tag = document.getElementById('preview-mode-tag');

  if (type === 'quotation') {
    btnQ.classList.add('active');
    btnI.classList.remove('active');
    heading.textContent = 'QUOTATION';
    heading.className = 'doc-heading-title quotation';
    tag.textContent = 'QUOTATION PREVIEW';
    if (btnConvert) btnConvert.textContent = state.currentLang === 'si' ? 'ඉන්වොයිසියක් බවට හරවන්න' : 'Convert to Invoice';
  } else {
    btnI.classList.add('active');
    btnQ.classList.remove('active');
    heading.textContent = 'INVOICE';
    heading.className = 'doc-heading-title invoice';
    tag.textContent = 'INVOICE PREVIEW';
    if (btnConvert) btnConvert.textContent = state.currentLang === 'si' ? 'මිල ගණන් කැඳවීමක් බවට හරවන්න' : 'Convert to Quotation';
  }

  // Update doc number prefix if it matches previous default
  if (state.doc.number.startsWith('RE-')) {
    state.doc.number = getNextDocNumber(type);
    document.getElementById('input-doc-number').value = state.doc.number;
  }

  updateLivePreview();
}

function toggleConvertType() {
  const nextType = state.docType === 'quotation' ? 'invoice' : 'quotation';
  setDocType(nextType);
  showToast(nextType === 'invoice' ? 'Converted to Invoice!' : 'Converted to Quotation!');
}

function toggleDocType() {
  toggleConvertType();
}

// ==========================================
// Print Language & Background Settings
// ==========================================

function setPrintLanguage(val) {
  state.printLang = val;
  updateLivePreview();
}

function toggleBackgroundGraphics(val) {
  state.showBackground = (val === 'show');
  state.doc.showBackground = state.showBackground;
  const container = document.getElementById('invoice-preview');
  if (state.showBackground) {
    container.classList.remove('hide-bg');
  } else {
    container.classList.add('hide-bg');
  }
}

// ==========================================
// Financial Calculations & Live Preview Update
// ==========================================

function updateLivePreview() {
  // 1. Calculations
  let subtotal = 0;
  state.doc.items.forEach(item => {
    subtotal += (item.amount || 0);
  });

  const discount = state.doc.discount || 0;
  const delivery = state.doc.delivery || 0;
  const grandTotal = Math.max(0, subtotal - discount + delivery);
  const advance = state.doc.advance || 0;
  const balanceDue = Math.max(0, grandTotal - advance);

  // 2. Update Editor Summary Badges
  document.getElementById('ed-subtotal-val').textContent = formatCurrency(subtotal);
  document.getElementById('ed-grandtotal-val').textContent = formatCurrency(grandTotal);
  document.getElementById('ed-balance-val').textContent = formatCurrency(balanceDue);

  // 3. Update Preview Company Details & Visibility
  const headerBlock = document.getElementById('prev-biz-header-block');
  if (headerBlock) {
    headerBlock.style.display = state.showBizHeader ? 'block' : 'none';
  }
  document.getElementById('prev-biz-name').textContent = state.settings.bizName;
  document.getElementById('prev-biz-address').textContent = state.settings.bizAddress;
  document.getElementById('prev-biz-phone').textContent = state.settings.bizPhone;
  document.getElementById('prev-biz-reg').textContent = state.settings.bizReg;
  document.getElementById('prev-doc-date').textContent = formatDisplayDate(state.doc.date);

  // 4. Update Document Meta
  const dateMeta = document.getElementById('prev-doc-date-meta');
  if (dateMeta) dateMeta.textContent = formatDisplayDate(state.doc.date);
  document.getElementById('prev-doc-number').textContent = state.doc.number || '---';
  document.getElementById('prev-doc-due').textContent = formatDisplayDate(state.doc.dueDate);
  document.getElementById('prev-doc-status').textContent = state.doc.status || 'Draft';

  // 5. Update Customer Info
  const custName = state.doc.customer.name.trim();
  document.getElementById('prev-cust-name').textContent = custName ? custName : (state.currentLang === 'si' ? 'පාරිභෝගික නම ඇතුළත් කරන්න' : 'Walk-in Customer');
  document.getElementById('prev-cust-phone').textContent = state.doc.customer.phone ? 'Tel / WA: ' + state.doc.customer.phone : '';
  document.getElementById('prev-cust-address').textContent = state.doc.customer.address || '';

  // 6. Update Items Table in Preview
  const pvTbody = document.getElementById('preview-table-body');
  pvTbody.innerHTML = '';

  state.doc.items.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-center">${idx + 1}</td>
      <td class="td-desc">${escapeHtml(item.description) || '-'}</td>
      <td class="td-center">${item.qty}</td>
      <td class="td-right">${formatCurrency(item.unitPrice).replace('Rs. ', '')}</td>
      <td class="td-right">${formatCurrency(item.amount).replace('Rs. ', '')}</td>
    `;
    pvTbody.appendChild(tr);
  });

  // 7. Update Totals in Preview
  document.getElementById('pv-subtotal-val').textContent = formatCurrency(subtotal);
  document.getElementById('pv-grandtotal-val').textContent = formatCurrency(grandTotal);

  const discountRow = document.getElementById('pv-row-discount') || document.getElementById('pv-discount-row');
  if (discountRow) {
    if (discount > 0) {
      discountRow.style.display = 'flex';
      const el = document.getElementById('pv-discount-val');
      if (el) el.textContent = '- ' + formatCurrency(discount);
    } else {
      discountRow.style.display = 'none';
    }
  }

  const deliveryRow = document.getElementById('pv-row-delivery') || document.getElementById('pv-delivery-row');
  if (deliveryRow) {
    if (delivery > 0) {
      deliveryRow.style.display = 'flex';
      const el = document.getElementById('pv-delivery-val');
      if (el) el.textContent = '+ ' + formatCurrency(delivery);
    } else {
      deliveryRow.style.display = 'none';
    }
  }

  const advanceRow = document.getElementById('pv-row-advance') || document.getElementById('pv-advance-row');
  const balanceRow = document.getElementById('pv-row-balance') || document.getElementById('pv-balance-row');
  if (advanceRow && balanceRow) {
    if (advance > 0) {
      advanceRow.style.display = 'flex';
      const elAdv = document.getElementById('pv-advance-val');
      if (elAdv) elAdv.textContent = formatCurrency(advance);
      balanceRow.style.display = 'flex';
      const elBal = document.getElementById('pv-balance-val');
      if (elBal) elBal.textContent = formatCurrency(balanceDue);
    } else {
      advanceRow.style.display = 'none';
      balanceRow.style.display = 'none';
    }
  }

  // 9. Payment Details
  const elBankName = document.getElementById('pv-bank-name');
  if (elBankName) elBankName.textContent = state.doc.payment.bankName || state.settings.bankName;
  const elAccName = document.getElementById('pv-bank-acc-name') || document.getElementById('pv-acc-name');
  if (elAccName) elAccName.textContent = state.doc.payment.accountName || state.settings.accountName;
  const elAccNum = document.getElementById('pv-bank-acc-num') || document.getElementById('pv-acc-number');
  if (elAccNum) elAccNum.textContent = state.doc.payment.accountNumber || state.settings.accountNumber;
  const elBranch = document.getElementById('pv-bank-branch') || document.getElementById('pv-branch');
  if (elBranch) elBranch.textContent = state.doc.payment.branch || state.settings.branch;

  // 10. Terms & Conditions
  const termsList = document.getElementById('pv-terms-list');
  termsList.innerHTML = '';
  if (state.doc.terms && state.doc.terms.length > 0) {
    state.doc.terms.forEach(term => {
      const li = document.createElement('li');
      li.textContent = term;
      termsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'Standard terms apply.';
    termsList.appendChild(li);
  }

  const customNotesEl = document.getElementById('pv-custom-notes');
  if (state.doc.notes && state.doc.notes.trim()) {
    customNotesEl.textContent = 'Note: ' + state.doc.notes.trim();
    customNotesEl.style.display = 'block';
  } else {
    customNotesEl.style.display = 'none';
  }

  // 11. Adapt Preview Headers to Print Language
  updatePreviewLabelsByPrintLang();
}

function updatePreviewLabelsByPrintLang() {
  const pl = state.printLang;
  const isSi = (pl === 'si');
  const isEn = (pl === 'en');
  const isBi = (pl === 'bilingual');

  const setTxt = (idList, txt) => {
    for (const id of idList) {
      const el = document.getElementById(id);
      if (el) { el.textContent = txt; return; }
    }
  };

  setTxt(['lbl-pv-cust-box', 'lbl-prev-bill-to'], isBi ? 'CUSTOMER DETAILS / බිල්පත ලබන්නා' : (isSi ? 'පාරිභෝගික විස්තර' : 'CUSTOMER DETAILS'));
  setTxt(['lbl-pv-doc-box', 'lbl-prev-doc-details'], isBi ? 'DOCUMENT DETAILS / ලේඛන තොරතුරු' : (isSi ? 'ලේඛන තොරතුරු' : 'DOCUMENT DETAILS'));
  setTxt(['lbl-pv-date', 'lbl-prev-date-meta'], isSi ? 'දිනය:' : 'Date:');
  setTxt(['lbl-pv-doc-no', 'lbl-prev-no'], isSi ? 'අංකය:' : 'Number:');
  setTxt(['lbl-pv-due-date', 'lbl-prev-validity'], state.docType === 'invoice' ? (isSi ? 'ගෙවිය යුතු දිනය:' : 'Payment Due Date:') : (isSi ? 'වලංගු කාලය:' : 'Valid Until:'));
  setTxt(['lbl-pv-status', 'lbl-prev-status'], isSi ? 'තත්වය:' : 'Status:');

  setTxt(['pv-th-no', 'th-pv-num'], '#');
  setTxt(['lbl-pv-th-desc', 'pv-th-desc'], isBi ? 'DESCRIPTION / විස්තරය' : (isSi ? 'විස්තරය' : 'DESCRIPTION'));
  setTxt(['lbl-pv-th-qty', 'pv-th-qty'], isBi ? 'QTY / ප්‍රමාණය' : (isSi ? 'ප්‍රමාණය' : 'QTY'));
  setTxt(['lbl-pv-th-price', 'pv-th-price'], isBi ? 'UNIT PRICE / ඒකක මිල (RS.)' : (isSi ? 'ඒකක මිල (රු.)' : 'UNIT PRICE (RS.)'));
  setTxt(['lbl-pv-th-amount', 'pv-th-amount'], isBi ? 'AMOUNT / එකතුව (RS.)' : (isSi ? 'එකතුව (රු.)' : 'AMOUNT (RS.)'));

  setTxt(['lbl-pv-bank-title', 'lbl-pv-bank'], isBi ? 'BANK PAYMENT DETAILS / බැංකු විස්තර' : (isSi ? 'බැංකු ගිණුම් විස්තර' : 'BANK PAYMENT DETAILS'));
  setTxt(['lbl-pv-subtotal'], isSi ? 'මුළු එකතුව:' : 'Subtotal:');
  setTxt(['lbl-pv-discount'], isSi ? 'වට්ටම:' : 'Discount:');
  setTxt(['lbl-pv-delivery'], isSi ? 'ප්‍රවාහන / අමතර ගාස්තු:' : 'Transport / Extra:');
  setTxt(['lbl-pv-grandtotal', 'lbl-pv-total'], isSi ? 'අවසාන එකතුව:' : 'GRAND TOTAL:');
  setTxt(['lbl-pv-advance'], isSi ? 'ගෙවූ අත්තිකාරම්:' : 'Advance Paid:');
  setTxt(['lbl-pv-balance'], isSi ? 'ඉතිරි ගෙවීම:' : 'BALANCE DUE:');

  setTxt(['lbl-pv-terms'], isBi ? 'TERMS & CONDITIONS / කොන්දේසි සහ වගකීම්:' : (isSi ? 'කොන්දේසි සහ වගකීම්:' : 'TERMS & CONDITIONS:'));
  setTxt(['lbl-pv-cust-sign'], isSi ? 'පාරිභෝගික අත්සන' : 'Customer Signature');
  setTxt(['lbl-pv-auth-sign'], isSi ? 'බලයලත් අත්සන' : 'Authorized Signature');
}

// ==========================================
// UI Language Toggle (English ↔ Sinhala)
// ==========================================

function toggleLanguage() {
  const newLang = state.currentLang === 'en' ? 'si' : 'en';
  applyLanguage(newLang);
}

function applyLanguage(lang) {
  state.currentLang = lang;
  const t = window.AppTranslations[lang];
  if (!t) return;

  // Language button indicator shows opposite language to switch to
  document.getElementById('lang-indicator').textContent = lang === 'en' ? 'සිංහල' : 'English';

  // Header
  document.getElementById('ui-btn-new').textContent = t.newDoc;
  document.getElementById('ui-btn-save').textContent = t.saveDoc.split(' / ')[0];
  document.getElementById('ui-btn-history').textContent = t.savedHistory;
  document.getElementById('ui-btn-settings').textContent = t.settings;
  document.getElementById('ui-btn-print').textContent = t.printPdf;
  document.getElementById('ui-btn-download').textContent = t.downloadPdf;

  // Navigation Tabs
  const navDash = document.getElementById('ui-nav-dashboard');
  if (navDash) navDash.textContent = t.tabDashboard;
  const navGen = document.getElementById('ui-nav-generator');
  if (navGen) navGen.textContent = t.tabInvoiceBuilder;
  const navPos = document.getElementById('ui-nav-pos');
  if (navPos) navPos.textContent = t.tabStoreBilling;
  const navRep = document.getElementById('ui-nav-repairs');
  if (navRep) navRep.textContent = t.navRepairs || (lang === 'si' ? 'අලුත්වැඩියා කාඩ්පත්' : 'Repair Job Cards');
  const navHr = document.getElementById('ui-nav-hire');
  if (navHr) navHr.textContent = t.navHire || (lang === 'si' ? 'ශබ්ද කුලියට දීම්' : 'Sound Hire & Events');
  const navReprt = document.getElementById('ui-nav-reports');
  if (navReprt) navReprt.textContent = t.navReports || (lang === 'si' ? 'වාර්තා & Z-Close' : 'Reports & Z-Close');
  const navHist = document.getElementById('ui-nav-history');
  if (navHist) navHist.textContent = t.tabHistory || (lang === 'si' ? 'ඉතිහාසය සහ වාර්තා' : 'History & Records');

  // Repair Job Cards Tab Texts
  const repTitle = document.getElementById('rep-ui-main-title');
  if (repTitle && t.repairsTitle) repTitle.textContent = t.repairsTitle;
  const repSub = document.getElementById('rep-ui-main-subtitle');
  if (repSub && t.repairsSubtitle) repSub.textContent = t.repairsSubtitle;
  const repBtnNew = document.getElementById('rep-ui-btn-new');
  if (repBtnNew && t.btnNewJobCard) repBtnNew.textContent = t.btnNewJobCard;
  const repSearchInp = document.getElementById('rep-search-input');
  if (repSearchInp && t.searchRepairsPlaceholder) repSearchInp.placeholder = t.searchRepairsPlaceholder;
  const repPillAll = document.getElementById('rep-pill-all');
  if (repPillAll && t.jobFilterAll) repPillAll.textContent = t.jobFilterAll;
  const repPillRec = document.getElementById('rep-pill-received');
  if (repPillRec && t.jobFilterReceived) repPillRec.textContent = t.jobFilterReceived;
  const repPillDiag = document.getElementById('rep-pill-diagnosing');
  if (repPillDiag && t.jobFilterDiagnosing) repPillDiag.textContent = t.jobFilterDiagnosing;
  const repPillParts = document.getElementById('rep-pill-parts');
  if (repPillParts && t.jobFilterParts) repPillParts.textContent = t.jobFilterParts;
  const repPillRdy = document.getElementById('rep-pill-ready');
  if (repPillRdy && t.jobFilterReady) repPillRdy.textContent = t.jobFilterReady;
  const repPillComp = document.getElementById('rep-pill-completed');
  if (repPillComp && t.jobFilterCompleted) repPillComp.textContent = t.jobFilterCompleted;
  const repLblAct = document.getElementById('rep-lbl-active');
  if (repLblAct && t.statActiveJobs) repLblAct.textContent = t.statActiveJobs;
  const repLblParts = document.getElementById('rep-lbl-parts');
  if (repLblParts && t.statAwaitingParts) repLblParts.textContent = t.statAwaitingParts;
  const repLblRdy = document.getElementById('rep-lbl-ready');
  if (repLblRdy && t.statReadyPickup) repLblRdy.textContent = t.statReadyPickup;
  const repLblComp = document.getElementById('rep-lbl-completed');
  if (repLblComp && t.statCompletedJobs) repLblComp.textContent = t.statCompletedJobs;

  // Sound Hire Tab Texts
  const hireTitle = document.getElementById('hire-ui-main-title');
  if (hireTitle && t.hireTitle) hireTitle.textContent = t.hireTitle;
  const hireSub = document.getElementById('hire-ui-main-subtitle');
  if (hireSub && t.hireSubtitle) hireSub.textContent = t.hireSubtitle;
  const hireBtnNew = document.getElementById('hire-ui-btn-new');
  if (hireBtnNew && t.btnNewHireBooking) hireBtnNew.textContent = t.btnNewHireBooking;
  const hireSearchInp = document.getElementById('hire-search-input');
  if (hireSearchInp && t.searchHirePlaceholder) hireSearchInp.placeholder = t.searchHirePlaceholder;
  const hireLblUp = document.getElementById('hire-lbl-upcoming');
  if (hireLblUp && t.hireStatUpcoming) hireLblUp.textContent = t.hireStatUpcoming;
  const hireLblAdv = document.getElementById('hire-lbl-advances');
  if (hireLblAdv && t.hireStatAdvances) hireLblAdv.textContent = t.hireStatAdvances;
  const hireLblPend = document.getElementById('hire-lbl-pending');
  if (hireLblPend && t.hireStatPending) hireLblPend.textContent = t.hireStatPending;
  const hireLblRev = document.getElementById('hire-lbl-revenue');
  if (hireLblRev && t.hireStatTotalRev) hireLblRev.textContent = t.hireStatTotalRev;

  // Reports & Z-Report Texts
  const rptTitle = document.getElementById('rep-ui-reports-title');
  if (rptTitle && t.reportsTitle) rptTitle.textContent = t.reportsTitle;
  const rptSub = document.getElementById('rep-ui-reports-subtitle');
  if (rptSub && t.reportsSubtitle) rptSub.textContent = t.reportsSubtitle;
  const rptBtnZ = document.getElementById('rep-ui-btn-zreport');
  if (rptBtnZ && t.btnOpenZReport) rptBtnZ.textContent = t.btnOpenZReport;
  const rptLblGross = document.getElementById('rep-lbl-gross');
  if (rptLblGross && t.repStatGrossSales) rptLblGross.textContent = t.repStatGrossSales;
  const rptLblCogs = document.getElementById('rep-lbl-cogs');
  if (rptLblCogs && t.repStatEstCOGS) rptLblCogs.textContent = t.repStatEstCOGS;
  const rptLblProfit = document.getElementById('rep-lbl-profit');
  if (rptLblProfit && t.repStatNetProfit) rptLblProfit.textContent = t.repStatNetProfit;
  const rptLblCash = document.getElementById('rep-lbl-cash');
  if (rptLblCash && t.repStatCashInDrawer) rptLblCash.textContent = t.repStatCashInDrawer;

  // Dashboard Texts
  const dWelcome = document.getElementById('dash-ui-welcome');
  if (dWelcome) dWelcome.textContent = t.dashWelcome;
  const dSubtitle = document.getElementById('dash-ui-subtitle');
  if (dSubtitle) dSubtitle.textContent = t.dashSubtitle;
  const dTodayLbl = document.getElementById('dash-ui-today-lbl');
  if (dTodayLbl) dTodayLbl.textContent = t.dashTodaySales;
  const dMonthLbl = document.getElementById('dash-ui-month-lbl');
  if (dMonthLbl) dMonthLbl.textContent = t.dashMonthSales;
  const dPendingLbl = document.getElementById('dash-ui-pending-lbl');
  if (dPendingLbl) dPendingLbl.textContent = t.dashPendingBalances;
  const dDocsLbl = document.getElementById('dash-ui-docs-lbl');
  if (dDocsLbl) dDocsLbl.textContent = t.dashTotalDocs;
  const dActions = document.getElementById('dash-ui-actions-title');
  if (dActions) dActions.textContent = t.dashQuickActions;
  const dBtnInv = document.getElementById('dash-btn-new-inv');
  if (dBtnInv) dBtnInv.textContent = t.dashNewInvoiceBtn;
  const dBtnQt = document.getElementById('dash-btn-new-qt');
  if (dBtnQt) dBtnQt.textContent = t.dashNewQuotationBtn;
  const dBtnPos = document.getElementById('dash-btn-quick-bill');
  if (dBtnPos) dBtnPos.textContent = t.dashQuickBillBtn;
  const dRecentTitle = document.getElementById('dash-ui-recent-title');
  if (dRecentTitle) dRecentTitle.textContent = t.dashRecentDocs;
  const dViewAll = document.getElementById('dash-ui-view-all');
  if (dViewAll) dViewAll.textContent = t.dashViewAll;
  const dPendingTitle = document.getElementById('dash-ui-pending-box-title');
  if (dPendingTitle) dPendingTitle.textContent = t.dashPendingAlert;

  // POS Store Texts
  const posAll = document.getElementById('pos-ui-filter-all');
  if (posAll) posAll.textContent = t.filterAll;
  const posSrv = document.getElementById('pos-ui-filter-services');
  if (posSrv) posSrv.textContent = t.filterServices;
  const posItm = document.getElementById('pos-ui-filter-items');
  if (posItm) posItm.textContent = t.filterItems;
  const posAddBtn = document.getElementById('pos-ui-add-btn');
  if (posAddBtn) posAddBtn.textContent = t.addNewProductBtn;
  const posCartTitle = document.getElementById('pos-ui-cart-title');
  if (posCartTitle) posCartTitle.textContent = t.cartTitle;
  const posBtnInv = document.getElementById('pos-ui-btn-invoice');
  if (posBtnInv) posBtnInv.textContent = t.cartCheckoutInvoice;
  const posBtnQt = document.getElementById('pos-ui-btn-qt');
  if (posBtnQt) posBtnQt.textContent = t.cartCheckoutQuotation;
  const posBtnReceipt = document.getElementById('pos-ui-btn-receipt');
  if (posBtnReceipt) posBtnReceipt.textContent = t.cartPrintReceipt;
  const rcptModalTitle = document.getElementById('ui-modal-receipt-title');
  if (rcptModalTitle) rcptModalTitle.textContent = lang === 'si' ? 'ක්ෂණික තාප මුද්‍රිත රිසිට්පත (Thermal Slip)' : 'Quick Thermal Cash Receipt';
  const posModalTitle = document.getElementById('ui-modal-add-prod-title');
  if (posModalTitle) posModalTitle.textContent = t.addNewProductBtn;

  // Manual Service in POS Texts
  const manualTitle = document.getElementById('pos-ui-manual-title');
  if (manualTitle) manualTitle.textContent = t.manualServiceTitle || "⚡ Quick Manual Service Entry";
  const manualSub = document.getElementById('pos-ui-manual-sub');
  if (manualSub) manualSub.textContent = t.manualServiceSubtitle || "Add custom repairs, hire packages or labor charges directly to current bill";
  const manualDesc = document.getElementById('pos-manual-desc');
  if (manualDesc && t.manualServiceDesc) manualDesc.placeholder = t.manualServiceDesc;
  const manualPrice = document.getElementById('pos-manual-price');
  if (manualPrice && t.manualServicePrice) manualPrice.placeholder = t.manualServicePrice;
  const manualBtn = document.getElementById('pos-ui-add-manual-btn');
  if (manualBtn) manualBtn.textContent = t.addManualServiceBtn || "+ Add to Bill";

  // Inventory Tab Texts
  const navInv = document.getElementById('ui-nav-inventory');
  if (navInv) navInv.textContent = t.tabInventory || "Items & Inventory";
  const invTitle = document.getElementById('inv-ui-title');
  if (invTitle) invTitle.textContent = t.invTitle || "Items & Services Inventory Catalog";
  const invSub = document.getElementById('inv-ui-subtitle');
  if (invSub) invSub.textContent = t.invSubtitle || "Manage your sound equipment, sales items, and repair service charges";
  const invTotItm = document.getElementById('inv-ui-total-items-lbl');
  if (invTotItm) invTotItm.textContent = t.invTotalItems || "Total Products in Stock";
  const invTotSrv = document.getElementById('inv-ui-total-services-lbl');
  if (invTotSrv) invTotSrv.textContent = t.invTotalServices || "Total Services Offered";
  const invLowStk = document.getElementById('inv-ui-low-stock-lbl');
  if (invLowStk) invLowStk.textContent = t.invLowStock || "Low Stock Alerts";
  const invSearch = document.getElementById('inv-search-input');
  if (invSearch && t.invSearchPlaceholder) invSearch.placeholder = t.invSearchPlaceholder;
  const invThType = document.getElementById('inv-th-type');
  if (invThType) invThType.textContent = t.invColType || "Type";
  const invThName = document.getElementById('inv-th-name');
  if (invThName) invThName.textContent = t.invColName || "Item / Service Name";
  const invThPrice = document.getElementById('inv-th-price');
  if (invThPrice) invThPrice.textContent = t.invColPrice || "Price (Rs.)";
  const invThStock = document.getElementById('inv-th-stock');
  if (invThStock) invThStock.textContent = t.invColStock || "Stock Qty";
  const invThActions = document.getElementById('inv-th-actions');
  if (invThActions) invThActions.textContent = t.invColActions || "Actions";
  const invAddBtn = document.getElementById('inv-ui-add-btn');
  if (invAddBtn) invAddBtn.textContent = t.addNewProductBtn;

  // Mode buttons
  const modeQt = document.getElementById('ui-mode-quotation');
  if (modeQt) modeQt.textContent = lang === 'si' ? 'මිල ගණන් (Quotation)' : 'Quotation';
  const modeInv = document.getElementById('ui-mode-invoice');
  if (modeInv) modeInv.textContent = lang === 'si' ? 'ඉන්වොයිසිය (Invoice)' : 'Invoice';
  const lblCreateMode = document.getElementById('ui-lbl-create-mode');
  if (lblCreateMode) lblCreateMode.textContent = lang === 'si' ? 'මාදිලිය:' : 'Mode:';
  const btnNewTab = document.getElementById('ui-btn-new-tab');
  if (btnNewTab) btnNewTab.textContent = lang === 'si' ? '+ අලුත්' : '+ New';
  const btnSaveTab = document.getElementById('ui-btn-save-tab');
  if (btnSaveTab) btnSaveTab.textContent = lang === 'si' ? 'සුරකින්න' : 'Save';
  const btnConvert = document.getElementById('ui-btn-convert');
  if (btnConvert) btnConvert.textContent = state.docType === 'quotation' ? t.convertInvoice : t.convertQuotation;

  // Card 0: Business Info
  const cardBiz = document.getElementById('ui-card-biz-info');
  if (cardBiz) cardBiz.textContent = t.bizDetailsCard;
  const lblBizName = document.getElementById('ui-lbl-biz-name');
  if (lblBizName) lblBizName.textContent = t.businessName;
  const lblBizAddr = document.getElementById('ui-lbl-biz-address');
  if (lblBizAddr) lblBizAddr.textContent = t.businessAddress;
  const lblBizPhone = document.getElementById('ui-lbl-biz-phone');
  if (lblBizPhone) lblBizPhone.textContent = t.businessPhone;
  const lblBizReg = document.getElementById('ui-lbl-biz-reg');
  if (lblBizReg) lblBizReg.textContent = t.businessRegNo;
  const lblShowBiz = document.getElementById('ui-lbl-show-biz-header');
  if (lblShowBiz) lblShowBiz.textContent = t.showBizHeaderToggle;

  // Card 1
  document.getElementById('ui-card-doc-info').textContent = t.docDetails;
  document.getElementById('ui-lbl-doc-number').textContent = t.docNumber;
  document.getElementById('ui-lbl-doc-date').textContent = t.docDate;
  document.getElementById('ui-lbl-doc-due-date').textContent = state.docType === 'invoice' ? t.dueDate : t.validUntil;
  document.getElementById('ui-lbl-doc-status').textContent = t.status;
  document.getElementById('opt-status-draft').textContent = t.statusDraft;
  document.getElementById('opt-status-sent').textContent = t.statusSent;
  document.getElementById('opt-status-paid').textContent = t.statusPaid;
  document.getElementById('opt-status-partial').textContent = t.statusPartiallyPaid;

  // Card 2
  document.getElementById('ui-card-customer').textContent = t.customerDetails;
  document.getElementById('ui-lbl-cust-name').textContent = t.customerName;
  document.getElementById('ui-lbl-cust-phone').textContent = t.customerPhone;
  document.getElementById('ui-lbl-cust-address').textContent = t.customerAddress;
  document.getElementById('ui-lbl-cust-email').textContent = t.customerEmail;

  // Card 3
  document.getElementById('ui-card-items').textContent = t.itemsList;
  document.getElementById('th-item-no').textContent = t.itemNo;
  document.getElementById('th-item-desc').textContent = t.itemDescription;
  document.getElementById('th-item-qty').textContent = t.itemQty;
  document.getElementById('th-item-price').textContent = t.itemUnitPrice;
  document.getElementById('th-item-amount').textContent = t.itemAmount;
  document.getElementById('ui-btn-add-item').textContent = t.addItemRow;
  document.getElementById('ui-btn-clear-items').textContent = t.clearAllItems;

  // Card 4
  document.getElementById('ui-card-summary').textContent = t.summary;
  document.getElementById('ui-lbl-discount').textContent = t.discountFixed;
  document.getElementById('ui-lbl-delivery').textContent = t.deliveryFee;
  document.getElementById('ui-lbl-advance').textContent = t.advancePaid;
  document.getElementById('ui-sum-subtotal').textContent = t.subtotal + ':';
  document.getElementById('ui-sum-total').textContent = t.totalAmount + ':';
  document.getElementById('ui-sum-balance').textContent = t.balanceDue + ':';

  // Card 5
  document.getElementById('ui-card-payment-terms').textContent = t.paymentBankDetails;
  document.getElementById('ui-lbl-bank-name').textContent = t.bankName;
  document.getElementById('ui-lbl-acc-number').textContent = t.accountNumber;
  document.getElementById('ui-lbl-acc-name').textContent = t.accountName;
  document.getElementById('ui-lbl-bank-branch').textContent = t.branch;
  document.getElementById('ui-lbl-terms-presets').textContent = t.termsPresetSelect;
  document.getElementById('ui-lbl-notes').textContent = t.customNotes;

  // Card 6
  document.getElementById('ui-card-print-options').textContent = lang === 'si' ? 'මුද්‍රණ සහ ලෙටර්හෙඩ් සැකසුම්' : 'Print & Letterhead Settings';
  document.getElementById('ui-lbl-print-lang').textContent = t.printDocLang;
  document.getElementById('opt-print-bilingual').textContent = t.langBilingual;
  document.getElementById('opt-print-en').textContent = t.langEnglish;
  document.getElementById('opt-print-si').textContent = t.langSinhala;

  document.getElementById('ui-lbl-bg-mode').textContent = t.letterheadBgOption;
  document.getElementById('opt-bg-show').textContent = t.showLetterheadBg;
  document.getElementById('opt-bg-hide').textContent = t.hideLetterheadBg;

  // Modals
  document.getElementById('ui-modal-history-title').textContent = t.historyTitle;
  document.getElementById('ui-modal-settings-title').textContent = t.settingsTitle;
  document.getElementById('ui-modal-whatsapp-title').textContent = t.whatsappTitle;

  populatePresetDropdown();
  renderTermsCheckboxes();
  updateLivePreview();
}

// ==========================================
// Mobile View Switching
// ==========================================

function switchMobileTab(tab) {
  const editor = document.getElementById('editor-panel');
  const preview = document.getElementById('preview-panel');
  const btnEd = document.getElementById('tab-btn-editor');
  const btnPv = document.getElementById('tab-btn-preview');

  if (tab === 'editor') {
    editor.classList.remove('tab-hidden');
    preview.classList.add('tab-hidden');
    btnEd.classList.add('active');
    btnPv.classList.remove('active');
  } else {
    editor.classList.add('tab-hidden');
    preview.classList.remove('tab-hidden');
    btnPv.classList.add('active');
    btnEd.classList.remove('active');
    updateLivePreview();
  }
}

// ==========================================
// Save, History & LocalStorage
// ==========================================

function createNewDoc() {
  if (confirm(state.currentLang === 'si' ? 'ඔබට නව ලේඛනයක් ඇරඹීමට අවශ්‍යද? නොසුරකින ලද වෙනස්කම් ඉවත්වනු ඇත.' : 'Start a new document? Unsaved changes will be discarded.')) {
    // Increment counter
    if (state.docType === 'invoice') state.settings.invCounter++;
    else state.settings.qtCounter++;
    persistSettings(state.settings);

    state.doc = createInitialDoc(state.docType);
    state.doc.inventoryDeducted = false;
    syncFormWithState();
    updateLivePreview();
    showToast(state.currentLang === 'si' ? 'නව ලේඛනයක් සූදානම් කරන ලදී' : 'New document created');
  }
}

function saveCurrentDoc(isSilent) {
  try {
    // Deduct physical items from inventory on first save
    if (!state.doc.inventoryDeducted && state.doc.items && state.doc.items.length > 0) {
      const deducted = deductItemsFromCatalog(state.doc.items, state.docType === 'invoice' ? 'Invoice' : 'Quotation');
      if (deducted.length > 0) {
        state.doc.inventoryDeducted = true;
        if (!isSilent) {
          showToast(state.currentLang === 'si'
            ? `📦 භාණ්ඩ ${deducted.length} ක තොග ප්‍රමාණය අඩු කරන ලදී!`
            : `📦 Stock deducted for ${deducted.length} item(s)!`);
        }
      }
    }

    const history = getSavedDocsHistory();
    const existingIndex = history.findIndex(d => d.id === state.doc.id || d.number === state.doc.number);

    if (existingIndex >= 0) {
      history[existingIndex] = JSON.parse(JSON.stringify(state.doc));
    } else {
      history.unshift(JSON.parse(JSON.stringify(state.doc)));
    }

    localStorage.setItem('recital_docs_history', JSON.stringify(history));
    if (window.firebaseDB && window.firebaseDB.isInitialized && !window.firebaseDB.isSyncing) {
      const docId = state.doc.number || state.doc.id || ('DOC-' + Date.now());
      window.firebaseDB.saveItem('invoices', docId, state.doc);
    }
    if (!isSilent) {
      showToast(state.currentLang === 'si' ? 'ලේඛනය සාර්ථකව සුරකින ලදී!' : 'Document saved successfully!');
    }
  } catch (e) {
    console.error('Failed to save document:', e);
    if (!isSilent) alert('Storage error: Could not save document.');
  }
}

function getSavedDocsHistory() {
  try {
    const data = localStorage.getItem('recital_docs_history');
    if (data) {
      const history = JSON.parse(data);
      let updated = false;
      history.forEach(doc => {
        // Ensure receipts default to Paid with full payment unless explicitly marked Partially Paid
        if (doc && doc.type === 'receipt') {
          if (!doc.status || doc.status === 'Paid') {
            doc.status = 'Paid';
            const docTot = (typeof doc.total === 'number') ? doc.total : (doc.items ? doc.items.reduce((sum, it) => sum + (it.amount || 0), 0) : 0);
            if (!doc.paid || doc.paid === 0) {
              doc.paid = docTot;
              doc.advance = docTot;
              updated = true;
            }
          }
        }
      });
      if (updated) {
        try { localStorage.setItem('recital_docs_history', JSON.stringify(history)); } catch (e) {}
      }
      return history;
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

function openHistoryModal() {
  document.getElementById('modal-history').classList.add('active');
  renderHistoryList('');
}

function closeHistoryModal() {
  document.getElementById('modal-history').classList.remove('active');
}

function renderHistoryList(filterText) {
  const tbody = document.getElementById('history-table-body');
  tbody.innerHTML = '';
  const history = getSavedDocsHistory();

  const filter = (filterText || '').toLowerCase().trim();
  const filtered = history.filter(d => {
    if (!filter) return true;
    return (d.number && d.number.toLowerCase().includes(filter)) ||
      (d.customer && d.customer.name && d.customer.name.toLowerCase().includes(filter)) ||
      (d.customer && d.customer.phone && d.customer.phone.includes(filter));
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#64748b;">${state.currentLang === 'si' ? 'කිසිදු ලේඛනයක් හමු නොවීය.' : 'No saved documents found.'}</td></tr>`;
    return;
  }

  filtered.forEach(d => {
    let grandTotal = 0;
    if (d.items) {
      d.items.forEach(i => grandTotal += (i.amount || 0));
      grandTotal = Math.max(0, grandTotal - (d.discount || 0) + (d.delivery || 0));
    }

    const tr = document.createElement('tr');
    const badgeClass = d.type === 'quotation' ? 'badge-quotation' : 'badge-invoice';
    const badgeText = d.type === 'quotation' ? 'Quotation' : 'Invoice';

    tr.innerHTML = `
      <td><span class="badge ${badgeClass}">${badgeText}</span></td>
      <td style="font-weight:700;">${d.number || '-'}</td>
      <td>${formatDisplayDate(d.date)}</td>
      <td>${d.customer && d.customer.name ? d.customer.name : 'Walk-in'}</td>
      <td style="font-weight:600;">${formatCurrency(grandTotal)}</td>
      <td>
        <button type="button" class="btn btn-outline btn-sm" onclick="loadSavedDoc('${d.id}')">Open</button>
        <button type="button" class="btn btn-danger-outline btn-sm" onclick="deleteSavedDoc('${d.id}')">&times;</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function loadSavedDoc(id) {
  const history = getSavedDocsHistory();
  const doc = history.find(d => d.id === id);
  if (!doc) return;

  state.doc = JSON.parse(JSON.stringify(doc));
  setDocType(state.doc.type || 'quotation');
  syncFormWithState();
  updateLivePreview();
  closeHistoryModal();
  showToast(state.currentLang === 'si' ? 'ලේඛනය විවෘත කරන ලදී' : 'Document loaded');
}

function deleteSavedDoc(id) {
  if (confirm(state.currentLang === 'si' ? 'මෙම ලේඛනය මකා දැමීමට අවශ්‍ය බව සහතිකද?' : 'Are you sure you want to delete this document?')) {
    let history = getSavedDocsHistory();
    history = history.filter(d => d.id !== id);
    localStorage.setItem('recital_docs_history', JSON.stringify(history));
    if (window.firebaseDB && window.firebaseDB.isInitialized && !window.firebaseDB.isSyncing) {
      const docId = state.doc.number || state.doc.id || ('DOC-' + Date.now());
      window.firebaseDB.saveItem('invoices', docId, state.doc);
    }
    renderHistoryList(document.getElementById('search-history-input').value);
    showToast('Deleted!');
  }
}

// Backup & Restore
function exportDataJson() {
  const history = getSavedDocsHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Recital_Electronic_Backup_${formatDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importDataJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        localStorage.setItem('recital_docs_history', JSON.stringify(imported));
        renderHistoryList('');
        showToast('Backup restored successfully!');
      } else {
        alert('Invalid JSON structure.');
      }
    } catch (err) {
      alert('Error parsing backup file.');
    }
  };
  reader.readAsText(file);
}

// ==========================================
// Settings Modal
// ==========================================

function openSettingsModal() {
  document.getElementById('set-biz-name').value = state.settings.bizName;
  document.getElementById('set-biz-address').value = state.settings.bizAddress;
  document.getElementById('set-biz-phone').value = state.settings.bizPhone;
  document.getElementById('set-biz-reg').value = state.settings.bizReg;
  document.getElementById('set-prefix-inv').value = state.settings.invPrefix;
  document.getElementById('set-prefix-qt').value = state.settings.qtPrefix;
  document.getElementById('set-bank-name').value = state.settings.bankName;
  document.getElementById('set-bank-acc').value = state.settings.accountNumber;
  document.getElementById('set-bank-acc-name').value = state.settings.accountName;
  document.getElementById('set-bank-branch').value = state.settings.branch;

  document.getElementById('modal-settings').classList.add('active');
}

function closeSettingsModal() {
  document.getElementById('modal-settings').classList.remove('active');
}

function saveSettingsForm() {
  const newSettings = {
    bizName: document.getElementById('set-biz-name').value.trim() || DEFAULT_SETTINGS.bizName,
    bizAddress: document.getElementById('set-biz-address').value.trim() || DEFAULT_SETTINGS.bizAddress,
    bizPhone: document.getElementById('set-biz-phone').value.trim() || DEFAULT_SETTINGS.bizPhone,
    bizReg: document.getElementById('set-biz-reg').value.trim() || DEFAULT_SETTINGS.bizReg,
    invPrefix: document.getElementById('set-prefix-inv').value.trim() || DEFAULT_SETTINGS.invPrefix,
    qtPrefix: document.getElementById('set-prefix-qt').value.trim() || DEFAULT_SETTINGS.qtPrefix,
    bankName: document.getElementById('set-bank-name').value.trim() || DEFAULT_SETTINGS.bankName,
    accountNumber: document.getElementById('set-bank-acc').value.trim() || DEFAULT_SETTINGS.accountNumber,
    accountName: document.getElementById('set-bank-acc-name').value.trim() || DEFAULT_SETTINGS.accountName,
    branch: document.getElementById('set-bank-branch').value.trim() || DEFAULT_SETTINGS.branch
  };

  persistSettings(newSettings);
  syncFormWithState();
  updateLivePreview();
  closeSettingsModal();
  showToast(state.currentLang === 'si' ? 'සැකසුම් සුරකින ලදී!' : 'Settings saved!');
}

function resetSettingsToDefault() {
  if (confirm(state.currentLang === 'si' ? 'සියලු සැකසුම් මුල් තත්වයට පත් කිරීමට අවශ්‍යද?' : 'Reset settings to defaults?')) {
    persistSettings(DEFAULT_SETTINGS);
    openSettingsModal();
    syncFormWithState();
    updateLivePreview();
  }
}

// ==========================================
// WhatsApp Sharing
// ==========================================

function openWhatsappModal() {
  const phone = (state.doc.customer.phone || '').replace(/[^0-9]/g, '');
  document.getElementById('wa-recipient-phone').value = phone;

  // Build message
  let subtotal = 0;
  state.doc.items.forEach(i => subtotal += (i.amount || 0));
  const grandTotal = Math.max(0, subtotal - (state.doc.discount || 0) + (state.doc.delivery || 0));
  const advance = state.doc.advance || 0;
  const balance = Math.max(0, grandTotal - advance);

  const docTitle = state.docType === 'invoice' ? 'INVOICE / ඉන්වොයිසිය' : 'QUOTATION / මිල ගණන්';

  let msg = `*${state.settings.bizName}*\n`;
  msg += `📍 ${state.settings.bizAddress}\n`;
  msg += `📞 ${state.settings.bizPhone} | Reg: ${state.settings.bizReg}\n`;
  msg += `─────────────────────────\n`;
  msg += `📄 *${docTitle}*\n`;
  msg += `🔢 Doc #: *${state.doc.number}*\n`;
  msg += `📅 Date: ${formatDisplayDate(state.doc.date)}\n`;
  if (state.doc.customer.name) {
    msg += `👤 Customer: *${state.doc.customer.name}*\n`;
  }
  msg += `─────────────────────────\n`;
  msg += `*ITEMS / භාණ්ඩ හා සේවා:*\n`;

  state.doc.items.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.description} (${item.qty} × ${formatCurrency(item.unitPrice).replace('Rs. ', '')}) = ${formatCurrency(item.amount)}\n`;
  });

  msg += `─────────────────────────\n`;
  msg += `💰 *TOTAL: ${formatCurrency(grandTotal)}*\n`;
  if (advance > 0) {
    msg += `💵 Advance Paid: ${formatCurrency(advance)}\n`;
    msg += `🔴 *BALANCE DUE: ${formatCurrency(balance)}*\n`;
  }
  msg += `─────────────────────────\n`;
  msg += `💳 *BANK TRANSFER DETAILS:*\n`;
  msg += `Bank: ${state.doc.payment.bankName}\n`;
  msg += `Account: ${state.doc.payment.accountNumber} (${state.doc.payment.accountName})\n`;
  msg += `Branch: ${state.doc.payment.branch}\n`;
  msg += `─────────────────────────\n`;
  msg += `Thank you for your business! | ස්තූතියි! 🙏\n`;

  document.getElementById('wa-message-text').value = msg;
  document.getElementById('modal-whatsapp').classList.add('active');
}

function closeWhatsappModal() {
  document.getElementById('modal-whatsapp').classList.remove('active');
}

function copyWhatsappMessage() {
  const textarea = document.getElementById('wa-message-text');
  const text = textarea ? textarea.value : '';

  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Message copied to clipboard!');
    }).catch(() => {
      fallbackCopyText(textarea);
    });
  } else if (textarea) {
    fallbackCopyText(textarea);
  }
}

function fallbackCopyText(textarea) {
  try {
    if (textarea && textarea.select) {
      textarea.select();
      if (textarea.setSelectionRange) textarea.setSelectionRange(0, 99999);
      if (typeof document !== 'undefined' && document.execCommand) {
        document.execCommand('copy');
      }
    }
    showToast('Message copied to clipboard!');
  } catch (err) {
    showToast('Copied!');
  }
}

function sendWhatsappDirect() {
  let phone = document.getElementById('wa-recipient-phone').value.replace(/[^0-9]/g, '');
  // Auto-prefix Sri Lanka country code (94) if starts with 0
  if (phone.startsWith('0') && phone.length === 10) {
    phone = '94' + phone.substring(1);
  }

  const text = encodeURIComponent(document.getElementById('wa-message-text').value);
  const waUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
  window.open(waUrl, '_blank');
}

// ==========================================
// Print & PDF Generation
// ==========================================

function printDocument() {
  if (!state.doc.inventoryDeducted && state.doc.items && state.doc.items.length > 0) {
    saveCurrentDoc(true);
    showToast(state.currentLang === 'si' 
      ? '📦 තොග ප්‍රමාණය අඩු කර මුද්‍රණය කෙරේ...' 
      : '📦 Stock deducted & printing document...');
  }
  window.print();
}

function downloadPdfFile() {
  if (!state.doc.inventoryDeducted && state.doc.items && state.doc.items.length > 0) {
    saveCurrentDoc(true);
  }
  const element = document.getElementById('invoice-preview');
  const filename = `${state.docType.toUpperCase()}_${state.doc.number || 'Doc'}.pdf`;

  if (typeof html2pdf !== 'undefined') {
    showToast('Generating PDF...');
    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      showToast('PDF downloaded successfully!');
    }).catch(err => {
      console.error('html2pdf error:', err);
      window.print();
    });
  } else {
    // Fallback to native print
    window.print();
  }
}

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2500);
}

// ==========================================
// Main Navigation Tabs Switching
// ==========================================
function switchMainTab(tabName) {
  state.currentTab = tabName;

  // Update nav buttons
  ['dashboard', 'generator', 'pos', 'inventory', 'repairs', 'hire', 'reports', 'history'].forEach(name => {
    const btn = document.getElementById('tab-nav-' + name);
    const view = document.getElementById('view-' + name);
    if (btn) btn.classList.toggle('active', name === tabName);
    if (view) view.classList.toggle('active', name === tabName);
  });

  if (tabName === 'dashboard') {
    updateDashboard();
  } else if (tabName === 'generator') {
    updateLivePreview();
  } else if (tabName === 'pos') {
    renderPosCatalog();
    renderPosCart();
  } else if (tabName === 'inventory') {
    renderInventoryView();
  } else if (tabName === 'repairs') {
    renderRepairsView();
  } else if (tabName === 'hire') {
    renderHireView();
  } else if (tabName === 'reports') {
    renderReportsView();
  } else if (tabName === 'history') {
    renderHistoryView();
  }
}

function openGeneratorWithMode(mode) {
  setDocType(mode);
  switchMainTab('generator');
}

// ==========================================
// Dashboard Logic & Calculations
// ==========================================
function updateDashboard() {
  const history = getSavedDocsHistory();
  const todayStr = formatDate(new Date());
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  let todaySales = 0;
  let monthSales = 0;
  let pendingBalances = 0;
  const debtors = [];

  history.forEach(doc => {
    let grandTotal = (typeof doc.total === 'number') ? doc.total : 0;
    if (!grandTotal && doc.items) {
      let subtotal = 0;
      doc.items.forEach(i => subtotal += (i.amount || 0));
      grandTotal = Math.max(0, subtotal - (doc.discount || 0) + (doc.delivery || 0));
    }

    const docType = (doc.type || 'quotation').toLowerCase();
    const docDate = doc.date || '';

    // Sales Revenue: Count both official Invoices and Counter Receipts
    if (docType === 'invoice' || docType === 'receipt') {
      if (docDate === todayStr) {
        todaySales += grandTotal;
      }
      if (docDate.startsWith(currentMonthStr)) {
        monthSales += grandTotal;
      }
    }

    // Dues / Pending Balances Calculation:
    // 1. Quotations NEVER have dues (they are estimates)
    // 2. Documents marked status === 'Paid' NEVER have dues
    // 3. Receipts are paid counter sales; only consider due if explicitly 'Partially Paid' or 'Unpaid'
    // 4. Invoices have dues only if grandTotal > advance and status !== 'Paid'
    let balanceDue = 0;
    if (docType === 'quotation') {
      balanceDue = 0;
    } else if (doc.status === 'Paid') {
      balanceDue = 0;
    } else if (docType === 'receipt') {
      if (doc.status === 'Partially Paid') {
        const paidAmt = (typeof doc.paid === 'number') ? doc.paid : (doc.advance || 0);
        balanceDue = Math.max(0, grandTotal - paidAmt);
      } else {
        balanceDue = 0;
      }
    } else if (docType === 'invoice') {
      const paidAmt = (typeof doc.advance === 'number') ? doc.advance : (doc.paid || 0);
      balanceDue = Math.max(0, grandTotal - paidAmt);
    }

    if (balanceDue > 0) {
      pendingBalances += balanceDue;
      debtors.push({
        id: doc.id,
        number: doc.number,
        customerName: doc.customer && doc.customer.name ? doc.customer.name : 'Walk-in Customer',
        phone: doc.customer && doc.customer.phone ? doc.customer.phone : '',
        balanceDue: balanceDue,
        date: doc.date
      });
    }
  });

  // Display metrics
  const todayEl = document.getElementById('dash-stat-today');
  if (todayEl) todayEl.textContent = formatCurrency(todaySales);

  const monthEl = document.getElementById('dash-stat-month');
  if (monthEl) monthEl.textContent = formatCurrency(monthSales);

  const pendingEl = document.getElementById('dash-stat-pending');
  if (pendingEl) pendingEl.textContent = formatCurrency(pendingBalances);

  const docsEl = document.getElementById('dash-stat-docs');
  if (docsEl) docsEl.textContent = history.length;

  // Live Date Badge
  const dateBadge = document.getElementById('dash-today-date');
  if (dateBadge) {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    dateBadge.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  // Populate Recent Docs (Last 5)
  const recentTbody = document.getElementById('dash-recent-table-body');
  if (recentTbody) {
    recentTbody.innerHTML = '';
    const recent5 = history.slice(0, 5);
    if (recent5.length === 0) {
      recentTbody.innerHTML = `<tr><td colspan="5" class="dash-table-empty">📋 ${state.currentLang === 'si' ? 'කිසිදු ලේඛනයක් සකසා නැත.' : 'No invoices, quotations or receipts created yet.'}</td></tr>`;
    } else {
      recent5.forEach(d => {
        let grandTotal = (typeof d.total === 'number') ? d.total : 0;
        if (!grandTotal && d.items) {
          let sub = 0;
          d.items.forEach(i => sub += (i.amount || 0));
          grandTotal = Math.max(0, sub - (d.discount || 0) + (d.delivery || 0));
        }

        const docType = (d.type || 'quotation').toLowerCase();
        let badgeClass = 'badge-invoice';
        let badgeText = state.currentLang === 'si' ? 'ඉන්වොයිස්' : 'Invoice';
        if (docType === 'quotation') {
          badgeClass = 'badge-quotation';
          badgeText = state.currentLang === 'si' ? 'මිල ගණන්' : 'Quotation';
        } else if (docType === 'receipt') {
          badgeClass = 'badge-receipt';
          badgeText = state.currentLang === 'si' ? 'රිසිට්පත' : 'Receipt';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="badge ${badgeClass}">${badgeText}</span></td>
          <td><strong style="color:#0f172a;">${d.number || '-'}</strong></td>
          <td><div style="font-weight:600;">${d.customer && d.customer.name ? escapeHtml(d.customer.name) : 'Walk-in Customer'}</div></td>
          <td><strong style="color:#0052cc;">${formatCurrency(grandTotal)}</strong></td>
          <td>
            <button type="button" class="btn btn-outline btn-sm" onclick="openDocFromDashboard('${d.id}')">
              ${state.currentLang === 'si' ? 'විවෘත' : 'Open'}
            </button>
          </td>
        `;
        recentTbody.appendChild(tr);
      });
    }
  }

  // Update Debtors Badge & List
  const debtorsCountEl = document.getElementById('dash-debtors-count');
  if (debtorsCountEl) {
    if (debtors.length === 0) {
      debtorsCountEl.className = 'badge badge-success';
      debtorsCountEl.textContent = state.currentLang === 'si' ? 'හිඟ මුදල් නැත' : '0 Dues';
    } else {
      debtorsCountEl.className = 'badge badge-danger';
      debtorsCountEl.textContent = `${debtors.length} ${state.currentLang === 'si' ? 'හිඟ ගෙවීම්' : 'Pending Dues'}`;
    }
  }

  const debtorsList = document.getElementById('dash-debtors-list');
  if (debtorsList) {
    debtorsList.innerHTML = '';
    if (debtors.length === 0) {
      debtorsList.innerHTML = `
        <div class="debtors-empty">
          <span style="font-size:26px;">🎉</span>
          <span style="font-size:13.5px; font-weight:700;">${state.currentLang === 'si' ? 'සියලු පාරිභෝගික ගෙවීම් බේරා අවසන් කර ඇත!' : 'All customer payments are settled! No pending dues.'}</span>
        </div>
      `;
    } else {
      debtors.forEach(debtor => {
        const div = document.createElement('div');
        div.className = 'debtor-item';
        div.innerHTML = `
          <div class="debtor-info">
            <strong>${escapeHtml(debtor.customerName)}</strong>
            <span>${debtor.number} • ${formatDisplayDate(debtor.date)}</span>
          </div>
          <div class="debtor-due">
            <span class="debtor-due-amt">${formatCurrency(debtor.balanceDue)}</span>
            ${debtor.phone ? `
              <button type="button" class="btn btn-whatsapp btn-sm" style="margin-top:4px;" onclick="sendDebtorReminder('${escapeHtml(debtor.customerName)}', '${debtor.phone}', ${debtor.balanceDue}, '${debtor.number}')">
                WhatsApp
              </button>
            ` : ''}
          </div>
        `;
        debtorsList.appendChild(div);
      });
    }
  }
}

function openDocFromDashboard(id) {
  const history = getSavedDocsHistory();
  const doc = history.find(d => d.id === id);
  if (doc && doc.type === 'receipt') {
    editRecordFromHistory(id);
  } else {
    loadSavedDoc(id);
    switchMainTab('generator');
  }
}

function sendDebtorReminder(name, phone, amount, docNo) {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    cleanPhone = '94' + cleanPhone.substring(1);
  }
  const msg = `*RECITAL ELECTRONIC - Payment Reminder*\nDear ${name},\nKindly be reminded of the pending balance of *${formatCurrency(amount)}* for document *#${docNo}*.\nBank details:\nBank: ${state.settings.bankName}\nAccount: ${state.settings.accountNumber} (${state.settings.accountName})\nBranch: ${state.settings.branch}\nThank you! 🙏`;
  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ==========================================
// Store Billing & POS Terminal
// ==========================================
function filterPosCatalog(filterType) {
  currentPosFilter = filterType;
  ['all', 'services', 'items'].forEach(pill => {
    const el = document.getElementById('pos-pill-' + pill);
    if (el) el.classList.remove('active');
  });

  if (filterType === 'all') {
    const p = document.getElementById('pos-pill-all');
    if (p) p.classList.add('active');
  } else if (filterType === 'service') {
    const p = document.getElementById('pos-pill-services');
    if (p) p.classList.add('active');
  } else if (filterType === 'item') {
    const p = document.getElementById('pos-pill-items');
    if (p) p.classList.add('active');
  }

  renderPosCatalog();
}

function searchPosCatalog(query) {
  currentPosSearch = (query || '').toLowerCase().trim();
  renderPosCatalog();
}

function renderPosCatalog() {
  const grid = document.getElementById('pos-catalog-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const isSi = (state.currentLang === 'si');
  const filtered = storeCatalog.filter(item => {
    // Category filter
    if (currentPosFilter !== 'all' && item.type !== currentPosFilter) return false;
    // Search query filter
    if (currentPosSearch) {
      const matchEn = (item.nameEn || '').toLowerCase().includes(currentPosSearch);
      const matchSi = (item.nameSi || '').toLowerCase().includes(currentPosSearch);
      if (!matchEn && !matchSi) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; padding:30px; text-align:center; color:#64748b;">No matching items or services found.</div>`;
    return;
  }

  filtered.forEach((item, catalogIdx) => {
    // Find real index in storeCatalog
    const realIdx = storeCatalog.findIndex(x => x.id === item.id);
    const card = document.createElement('div');
    card.className = 'pos-item-card';
    card.onclick = () => addPosToCart(realIdx);

    const isService = item.type === 'service';
    const badgeText = isService ? (isSi ? 'සේවාව (Service)' : 'Service') : (isSi ? 'භාණ්ඩය (Item)' : 'Item Selling');
    const badgeClass = isService ? 'badge-service' : 'badge-item';
    const icon = isService ? (item.nameEn.toLowerCase().includes('hire') ? '🎤' : '🔧') : '🔌';
    const stockQty = parseInt(item.stock, 10) || 0;
    const stockBadge = !isService 
      ? `<div style="font-size:11px; font-weight:700; margin-top:4px; color:${stockQty <= 5 ? '#dc2626' : '#059669'};">
           ${stockQty <= 5 ? '⚠️ ' : '📦 '}${stockQty} ${isSi ? 'තොගයේ ඇත' : 'in stock'}
         </div>`
      : '';

    card.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="pos-card-badge ${badgeClass}">${badgeText}</span>
          <span style="font-size:18px;">${icon}</span>
        </div>
        <div class="pos-item-name-en">${escapeHtml(item.nameEn)}</div>
        <div class="pos-item-name-si">${escapeHtml(item.nameSi)}</div>
        ${stockBadge}
      </div>
      <div class="pos-card-footer">
        <span class="pos-card-price">${formatCurrency(item.price)}</span>
        <button type="button" class="pos-add-btn">+ Add</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function addPosToCart(catalogIndex) {
  const prod = storeCatalog[catalogIndex];
  if (!prod) return;

  isPosCartDeducted = false;
  const existing = posCart.find(c => c.id === prod.id);
  if (existing) {
    existing.qty += 1;
  } else {
    posCart.push({
      id: prod.id,
      nameEn: prod.nameEn,
      nameSi: prod.nameSi,
      type: prod.type,
      price: prod.price,
      qty: 1
    });
  }

  renderPosCart();
  showToast(`Added: ${state.currentLang === 'si' ? prod.nameSi : prod.nameEn}`);
}

function updatePosCartQty(cartIndex, delta) {
  if (!posCart[cartIndex]) return;
  isPosCartDeducted = false;
  posCart[cartIndex].qty += delta;
  if (posCart[cartIndex].qty <= 0) {
    posCart.splice(cartIndex, 1);
  }
  renderPosCart();
}

function removePosCartItem(cartIndex) {
  isPosCartDeducted = false;
  posCart.splice(cartIndex, 1);
  renderPosCart();
}

function clearPosCart() {
  isPosCartDeducted = false;
  posCart = [];
  renderPosCart();
}

function renderPosCart() {
  const container = document.getElementById('pos-cart-items-list');
  if (!container) return;
  container.innerHTML = '';

  const isSi = (state.currentLang === 'si');

  if (posCart.length === 0) {
    container.innerHTML = `
      <div style="padding:30px 10px; text-align:center; color:#94a3b8; font-size:13px;">
        🛒 ${isSi ? 'බිල්පත හිස්ය. භාණ්ඩ එක්කිරීමට වම්පසින් Click කරන්න.' : 'Bill is empty. Click items on the left to add.'}
      </div>
    `;
    updatePosCartCalculations();
    return;
  }

  posCart.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'pos-cart-row';
    const name = isSi ? item.nameSi : item.nameEn;
    const lineTotal = item.qty * item.price;

    row.innerHTML = `
      <div class="cart-row-info">
        <div class="cart-row-title">${escapeHtml(name)}</div>
        <div class="cart-row-price">${formatCurrency(item.price)} each</div>
      </div>
      <div class="cart-qty-controls">
        <button type="button" class="cart-qty-btn" onclick="updatePosCartQty(${idx}, -1)">-</button>
        <span class="cart-qty-val">${item.qty}</span>
        <button type="button" class="cart-qty-btn" onclick="updatePosCartQty(${idx}, 1)">+</button>
      </div>
      <div class="cart-row-total">${formatCurrency(lineTotal).replace('Rs. ', '')}</div>
      <button type="button" class="btn btn-danger-outline btn-sm" onclick="removePosCartItem(${idx})">&times;</button>
    `;
    container.appendChild(row);
  });

  updatePosCartCalculations();
}

function updatePosCartCalculations() {
  let subtotal = 0;
  posCart.forEach(i => subtotal += (i.qty * i.price));

  const discountInput = document.getElementById('pos-cart-discount');
  const paidInput = document.getElementById('pos-cart-paid');

  const discount = Math.max(0, parseFloat(discountInput ? discountInput.value : 0) || 0);
  const paid = Math.max(0, parseFloat(paidInput ? paidInput.value : 0) || 0);
  const totalPayable = Math.max(0, subtotal - discount);
  const changeOrBalance = paid - totalPayable;

  const subtotalEl = document.getElementById('pos-cart-subtotal');
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);

  const totalEl = document.getElementById('pos-cart-total');
  if (totalEl) totalEl.textContent = formatCurrency(totalPayable);

  const changeLabel = document.getElementById('pos-cart-change-label');
  const changeEl = document.getElementById('pos-cart-change');

  if (changeLabel && changeEl) {
    if (paid === 0) {
      changeLabel.textContent = 'Balance Due:';
      changeEl.textContent = formatCurrency(totalPayable);
      changeEl.style.color = '#dc2626';
    } else if (changeOrBalance >= 0) {
      changeLabel.textContent = 'Change to Return:';
      changeEl.textContent = formatCurrency(changeOrBalance);
      changeEl.style.color = '#059669';
    } else {
      changeLabel.textContent = 'Remaining Due:';
      changeEl.textContent = formatCurrency(Math.abs(changeOrBalance));
      changeEl.style.color = '#dc2626';
    }
  }
}

function convertPosToInvoice(docType) {
  if (posCart.length === 0) {
    alert('Please add items to the bill first!');
    return;
  }

  const custName = (document.getElementById('pos-cust-name').value || '').trim();
  const custPhone = (document.getElementById('pos-cust-phone').value || '').trim();
  const discount = Math.max(0, parseFloat(document.getElementById('pos-cart-discount').value) || 0);
  const paid = Math.max(0, parseFloat(document.getElementById('pos-cart-paid').value) || 0);

  // Set document items
  state.doc.items = posCart.map(item => ({
    id: Date.now().toString() + Math.random().toString().substring(2, 5),
    catalogId: item.id,
    type: item.type,
    description: state.currentLang === 'si' ? item.nameSi : item.nameEn,
    qty: item.qty,
    unitPrice: item.price,
    amount: item.qty * item.price
  }));

  if (custName) state.doc.customer.name = custName;
  if (custPhone) state.doc.customer.phone = custPhone;
  state.doc.discount = discount;
  state.doc.advance = paid;
  state.doc.inventoryDeducted = !!isPosCartDeducted;

  // Set doc mode
  setDocType(docType);

  // Sync editor form and preview
  syncFormWithState();
  updateLivePreview();

  // Switch to Generator tab
  switchMainTab('generator');
  showToast(`Converted to official ${docType === 'invoice' ? 'Invoice' : 'Quotation'}!`);
}

// Quick Cash Tenders for POS
function setPosExactCash() {
  let subtotal = 0;
  posCart.forEach(i => subtotal += (i.qty * i.price));
  const discount = Math.max(0, parseFloat(document.getElementById('pos-cart-discount').value) || 0);
  const total = Math.max(0, subtotal - discount);
  const paidInput = document.getElementById('pos-cart-paid');
  if (paidInput) {
    paidInput.value = total;
    updatePosCartCalculations();
  }
}

function addPosCash(amount) {
  const paidInput = document.getElementById('pos-cart-paid');
  if (paidInput) {
    const current = parseFloat(paidInput.value) || 0;
    paidInput.value = current + amount;
    updatePosCartCalculations();
  }
}

function clearPosCash() {
  const paidInput = document.getElementById('pos-cart-paid');
  if (paidInput) {
    paidInput.value = 0;
    updatePosCartCalculations();
  }
}

// ==========================================
// Thermal Quick Receipt Generator & Print Engine
// ==========================================
var currentReceiptNumber = '';

var defaultReceiptConfig = {
  storeName: "RECITAL ELECTRONIC",
  tagline: "SOUND SYSTEMS & ELECTRONIC SOLUTIONS",
  address: "583/2, Dewata Road, Kudhanelumkulama, Galkulama, Anuradhapura",
  phone: "0763366993",
  reg: "NCP/NPE/004141",
  cashier: "Counter 01 / Recital POS",
  width: "80mm",
  thanksEn: "*** THANK YOU FOR YOUR BUSINESS! ***",
  thanksSi: "ඔබගේ පැමිණීමට සහ විශ්වාසයට ස්තූතියි!",
  terms1: "Exchangeable within 7 days with original receipt.",
  terms2: "Electronic & sound repairs carry service warranty.",
  showLogo: true,
  showBarcode: true,
  showSinhala: true,
  showTerms: true
};

function getReceiptConfig() {
  try {
    const raw = localStorage.getItem('recital_rcpt_cfg');
    if (raw) return Object.assign({}, defaultReceiptConfig, JSON.parse(raw));
  } catch (e) {
    console.error('Error loading receipt config', e);
  }
  return Object.assign({}, defaultReceiptConfig);
}

function syncReceiptConfigForm() {
  const cfg = getReceiptConfig();
  const setV = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  const setC = (id, val) => { const el = document.getElementById(id); if (el) el.checked = Boolean(val); };

  setV('cfg-rcpt-store-name', cfg.storeName);
  setV('cfg-rcpt-tagline', cfg.tagline);
  setV('cfg-rcpt-address', cfg.address);
  setV('cfg-rcpt-phone', cfg.phone);
  setV('cfg-rcpt-reg', cfg.reg);
  setV('cfg-rcpt-cashier', cfg.cashier);
  setV('cfg-rcpt-width', cfg.width || '80mm');
  setV('cfg-rcpt-thanks-en', cfg.thanksEn);
  setV('cfg-rcpt-thanks-si', cfg.thanksSi);
  setV('cfg-rcpt-terms-1', cfg.terms1);
  setV('cfg-rcpt-terms-2', cfg.terms2);

  setC('cfg-rcpt-show-logo', cfg.showLogo !== false);
  setC('cfg-rcpt-show-barcode', cfg.showBarcode !== false);
  setC('cfg-rcpt-show-sinhala', cfg.showSinhala !== false);
  setC('cfg-rcpt-show-terms', cfg.showTerms !== false);
}

function toggleReceiptCustomizer() {
  const drawer = document.getElementById('rcpt-customizer-drawer');
  if (!drawer) return;
  const isHidden = (drawer.style.display === 'none' || !drawer.style.display);
  drawer.style.display = isHidden ? 'block' : 'none';
  if (isHidden) syncReceiptConfigForm();
}

function liveUpdateReceiptConfig() {
  const getV = (id, def) => { const el = document.getElementById(id); return el ? el.value : def; };
  const getC = (id, def) => { const el = document.getElementById(id); return el ? el.checked : def; };

  const cfg = {
    storeName: getV('cfg-rcpt-store-name', defaultReceiptConfig.storeName),
    tagline: getV('cfg-rcpt-tagline', defaultReceiptConfig.tagline),
    address: getV('cfg-rcpt-address', defaultReceiptConfig.address),
    phone: getV('cfg-rcpt-phone', defaultReceiptConfig.phone),
    reg: getV('cfg-rcpt-reg', defaultReceiptConfig.reg),
    cashier: getV('cfg-rcpt-cashier', defaultReceiptConfig.cashier),
    width: getV('cfg-rcpt-width', '80mm'),
    thanksEn: getV('cfg-rcpt-thanks-en', defaultReceiptConfig.thanksEn),
    thanksSi: getV('cfg-rcpt-thanks-si', defaultReceiptConfig.thanksSi),
    terms1: getV('cfg-rcpt-terms-1', defaultReceiptConfig.terms1),
    terms2: getV('cfg-rcpt-terms-2', defaultReceiptConfig.terms2),
    showLogo: getC('cfg-rcpt-show-logo', true),
    showBarcode: getC('cfg-rcpt-show-barcode', true),
    showSinhala: getC('cfg-rcpt-show-sinhala', true),
    showTerms: getC('cfg-rcpt-show-terms', true)
  };

  applyReceiptConfigToDOM(cfg);
}

function applyReceiptConfigToDOM(cfg) {
  if (!cfg) cfg = getReceiptConfig();

  const setT = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  const setH = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  setT('rcpt-disp-title', cfg.storeName);
  setT('rcpt-disp-tagline', cfg.tagline);
  setH('rcpt-disp-address', (cfg.address || '').replace(/\n/g, '<br>'));
  setH('rcpt-disp-contact', `Tel: <strong>${cfg.phone}</strong> • Reg: ${cfg.reg}`);
  setT('rcpt-disp-cashier', cfg.cashier);
  setT('rcpt-disp-thanks', cfg.thanksEn);
  setT('rcpt-disp-sinhala', cfg.thanksSi);
  setT('rcpt-disp-terms-1', cfg.terms1);
  setT('rcpt-disp-terms-2', cfg.terms2);

  const wrapLogo = document.getElementById('rcpt-wrap-logo');
  if (wrapLogo) wrapLogo.style.display = cfg.showLogo ? 'flex' : 'none';

  const wrapBarcode = document.getElementById('rcpt-wrap-barcode');
  if (wrapBarcode) wrapBarcode.style.display = cfg.showBarcode ? 'block' : 'none';

  const dispSinhala = document.getElementById('rcpt-disp-sinhala');
  if (dispSinhala) dispSinhala.style.display = cfg.showSinhala ? 'block' : 'none';

  const wrapTerms = document.getElementById('rcpt-wrap-terms');
  if (wrapTerms) wrapTerms.style.display = cfg.showTerms ? 'block' : 'none';

  const paper = document.getElementById('pos-receipt-print-area');
  const wrap = document.getElementById('rcpt-paper-wrapper');
  if (paper && wrap) {
    if (cfg.width === '58mm') {
      paper.classList.add('width-58mm');
      wrap.style.width = '250px';
    } else {
      paper.classList.remove('width-58mm');
      wrap.style.width = '320px';
    }
  }
}

function saveReceiptConfigPermanent() {
  const getV = (id, def) => { const el = document.getElementById(id); return el ? el.value : def; };
  const getC = (id, def) => { const el = document.getElementById(id); return el ? el.checked : def; };

  const cfg = {
    storeName: getV('cfg-rcpt-store-name', defaultReceiptConfig.storeName),
    tagline: getV('cfg-rcpt-tagline', defaultReceiptConfig.tagline),
    address: getV('cfg-rcpt-address', defaultReceiptConfig.address),
    phone: getV('cfg-rcpt-phone', defaultReceiptConfig.phone),
    reg: getV('cfg-rcpt-reg', defaultReceiptConfig.reg),
    cashier: getV('cfg-rcpt-cashier', defaultReceiptConfig.cashier),
    width: getV('cfg-rcpt-width', '80mm'),
    thanksEn: getV('cfg-rcpt-thanks-en', defaultReceiptConfig.thanksEn),
    thanksSi: getV('cfg-rcpt-thanks-si', defaultReceiptConfig.thanksSi),
    terms1: getV('cfg-rcpt-terms-1', defaultReceiptConfig.terms1),
    terms2: getV('cfg-rcpt-terms-2', defaultReceiptConfig.terms2),
    showLogo: getC('cfg-rcpt-show-logo', true),
    showBarcode: getC('cfg-rcpt-show-barcode', true),
    showSinhala: getC('cfg-rcpt-show-sinhala', true),
    showTerms: getC('cfg-rcpt-show-terms', true)
  };

  localStorage.setItem('recital_rcpt_cfg', JSON.stringify(cfg));
  applyReceiptConfigToDOM(cfg);
  toggleReceiptCustomizer();
  showToast(state.currentLang === 'si' ? 'රිසිට්පත් සැකසුම් ස්ථිරව සුරකින ලදී!' : 'Receipt settings saved permanently!');
}

function resetReceiptConfigDefaults() {
  localStorage.removeItem('recital_rcpt_cfg');
  syncReceiptConfigForm();
  applyReceiptConfigToDOM(defaultReceiptConfig);
  showToast('Reset to default receipt layout!');
}

function openPosReceiptModal() {
  if (posCart.length === 0) {
    alert(state.currentLang === 'si' ? 'කරුණාකර පළමුව බිල්පතට භාණ්ඩ හෝ සේවා එක් කරන්න!' : 'Please add items or services to the bill first!');
    return;
  }
  
  const now = new Date();
  const dateCode = now.getFullYear().toString() + 
                   String(now.getMonth() + 1).padStart(2, '0') + 
                   String(now.getDate()).padStart(2, '0');
  const randNum = String(Math.floor(1000 + Math.random() * 9000));
  currentReceiptNumber = `RE-RCP-${dateCode}-${randNum}`;

  renderPosReceipt(now);
  saveCurrentPosReceiptToHistory();

  const modal = document.getElementById('modal-pos-receipt');
  if (modal) {
    modal.classList.add('active');
    const scrollBody = modal.querySelector('.receipt-modal-body');
    if (scrollBody) scrollBody.scrollTop = 0;
  }
}

function closePosReceiptModal() {
  const modal = document.getElementById('modal-pos-receipt');
  if (modal) modal.classList.remove('active');
}

function renderPosReceipt(now) {
  if (!now) now = new Date();

  // Apply customizable shop settings
  applyReceiptConfigToDOM();

  // Receipt Number
  const numEl = document.getElementById('rcpt-meta-number');
  if (numEl) numEl.textContent = currentReceiptNumber;
  const barEl = document.getElementById('rcpt-barcode-digits');
  if (barEl) barEl.textContent = currentReceiptNumber;

  // Date & Time
  const dtEl = document.getElementById('rcpt-meta-datetime');
  if (dtEl) {
    const dStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const tStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    dtEl.textContent = `${dStr}  ${tStr}`;
  }

  // Customer
  const custNameInput = document.getElementById('pos-cust-name');
  const custPhoneInput = document.getElementById('pos-cust-phone');
  const custName = custNameInput && custNameInput.value.trim() ? custNameInput.value.trim() : (state.currentLang === 'si' ? 'සාමාන්‍ය පාරිභෝගිකයා (Walk-in)' : 'Walk-in Customer');
  const custPhone = custPhoneInput ? custPhoneInput.value.trim() : '';

  const custEl = document.getElementById('rcpt-meta-customer');
  if (custEl) custEl.textContent = custName;

  const phoneRow = document.getElementById('rcpt-phone-row');
  const phoneEl = document.getElementById('rcpt-meta-phone');
  if (phoneRow && phoneEl) {
    if (custPhone) {
      phoneRow.style.display = 'flex';
      phoneEl.textContent = custPhone;
    } else {
      phoneRow.style.display = 'none';
    }
  }

  // Render Items List
  const itemsContainer = document.getElementById('rcpt-items-container');
  if (itemsContainer) {
    itemsContainer.innerHTML = '';
    let totalQty = 0;
    let subtotal = 0;

    posCart.forEach((item, idx) => {
      totalQty += item.qty;
      const lineTotal = item.qty * item.price;
      subtotal += lineTotal;
      const itemName = state.currentLang === 'si' ? (item.nameSi || item.nameEn) : item.nameEn;

      const row = document.createElement('div');
      row.className = 'rcpt-item-row';
      row.innerHTML = `
        <div class="rcpt-item-top">${idx + 1}. ${escapeHtml(itemName)}</div>
        <div class="rcpt-item-bottom">
          <span>${item.qty} x ${formatCurrency(item.price).replace('Rs. ', '')}</span>
          <span style="font-weight:700;">${formatCurrency(lineTotal)}</span>
        </div>
      `;
      itemsContainer.appendChild(row);
    });

    // Subtotal
    const subtotalEl = document.getElementById('rcpt-subtotal');
    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);

    // Discount
    const discountInput = document.getElementById('pos-cart-discount');
    const discount = Math.max(0, parseFloat(discountInput ? discountInput.value : 0) || 0);
    const rowDisc = document.getElementById('rcpt-row-discount');
    const discEl = document.getElementById('rcpt-discount');
    if (rowDisc && discEl) {
      if (discount > 0) {
        rowDisc.style.display = 'flex';
        discEl.textContent = `-${formatCurrency(discount)}`;
      } else {
        rowDisc.style.display = 'none';
      }
    }

    // Total Payable
    const totalPayable = Math.max(0, subtotal - discount);
    const totEl = document.getElementById('rcpt-total-payable');
    if (totEl) totEl.textContent = formatCurrency(totalPayable);

    // Cash Received & Change
    const paidInput = document.getElementById('pos-cart-paid');
    const paid = Math.max(0, parseFloat(paidInput ? paidInput.value : 0) || 0);
    const paidEl = document.getElementById('rcpt-cash-paid');
    if (paidEl) paidEl.textContent = formatCurrency(paid);

    const changeRowLbl = document.getElementById('rcpt-change-lbl');
    const changeRowVal = document.getElementById('rcpt-change-val');
    const changeDiff = paid - totalPayable;
    if (changeRowLbl && changeRowVal) {
      if (paid === 0) {
        changeRowLbl.textContent = 'Balance Due:';
        changeRowVal.textContent = formatCurrency(totalPayable);
        changeRowVal.style.color = '#dc2626';
      } else if (changeDiff >= 0) {
        changeRowLbl.textContent = 'Change Returned:';
        changeRowVal.textContent = formatCurrency(changeDiff);
        changeRowVal.style.color = '#000000';
      } else {
        changeRowLbl.textContent = 'Balance Remaining:';
        changeRowVal.textContent = formatCurrency(Math.abs(changeDiff));
        changeRowVal.style.color = '#dc2626';
      }
    }

    // Counts line
    const countsEl = document.getElementById('rcpt-counts-line');
    if (countsEl) {
      countsEl.textContent = `Items Count: ${posCart.length} • Total Qty: ${totalQty}`;
    }
  }
}

function saveCurrentPosReceiptToHistory() {
  if (posCart.length === 0) return;
  const history = getSavedDocsHistory();
  const existingIdx = history.findIndex(d => d.number === currentReceiptNumber);

  const custNameInput = document.getElementById('pos-cust-name');
  const custPhoneInput = document.getElementById('pos-cust-phone');
  const custName = custNameInput && custNameInput.value.trim() ? custNameInput.value.trim() : (state.currentLang === 'si' ? 'සාමාන්‍ය පාරිභෝගිකයා (Walk-in)' : 'Walk-in Customer');
  const custPhone = custPhoneInput ? custPhoneInput.value.trim() : '';

  let subtotal = 0;
  posCart.forEach(i => subtotal += (i.qty * i.price));
  const discount = Math.max(0, parseFloat(document.getElementById('pos-cart-discount').value) || 0);
  const total = Math.max(0, subtotal - discount);

  const paidInput = document.getElementById('pos-cart-paid');
  const rawPaid = paidInput ? parseFloat(paidInput.value) : 0;
  // If paid input is 0 or empty in POS, cash receipt defaults to fully paid (exact total)
  const paid = (!isNaN(rawPaid) && rawPaid > 0) ? rawPaid : total;
  const status = (paid >= total) ? 'Paid' : (paid > 0 ? 'Partially Paid' : 'Paid');

  const receiptRecord = {
    id: existingIdx >= 0 ? history[existingIdx].id : ('rcpt_' + Date.now()),
    type: 'receipt',
    number: currentReceiptNumber,
    date: formatDate(new Date()),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    customer: { name: custName, phone: custPhone },
    items: posCart.map(i => ({
      id: i.id || ('item-' + Date.now()),
      catalogId: i.id,
      nameEn: i.nameEn || i.description,
      nameSi: i.nameSi || i.description,
      description: state.currentLang === 'si' ? (i.nameSi || i.nameEn) : i.nameEn,
      qty: i.qty,
      unitPrice: i.price,
      price: i.price,
      type: i.type || 'item',
      amount: i.qty * i.price
    })),
    subtotal: subtotal,
    discount: discount,
    delivery: 0,
    advance: paid,
    total: total,
    paid: paid,
    status: status,
    inventoryDeducted: !!isPosCartDeducted
  };

  if (existingIdx >= 0) {
    history[existingIdx] = receiptRecord;
  } else {
    history.unshift(receiptRecord);
  }
  localStorage.setItem('recital_docs_history', JSON.stringify(history));
}

function executeReceiptPrint() {
  if (!isPosCartDeducted && posCart.length > 0) {
    const deducted = deductItemsFromCatalog(posCart, 'POS Receipt');
    isPosCartDeducted = true;
    if (deducted.length > 0) {
      showToast(state.currentLang === 'si'
        ? `📦 භාණ්ඩ ${deducted.length} ක තොග ප්‍රමාණය අඩු කරන ලදී!`
        : `📦 Stock deducted for ${deducted.length} item(s)!`);
    }
  }
  saveCurrentPosReceiptToHistory();
  const receiptEl = document.getElementById('pos-receipt-print-area');
  if (!receiptEl) return;

  const printContent = receiptEl.innerHTML;
  const cfg = getReceiptConfig();
  const is58mm = (cfg.width === '58mm');

  let iframe = document.getElementById('receipt-print-frame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'receipt-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow.document;
  doc.open();
  const baseHref = window.location.href.split('#')[0].split('?')[0];
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <base href="${baseHref}">
      <meta charset="utf-8">
      <title>Receipt - ${currentReceiptNumber}</title>
      <style>
        @page {
          size: ${is58mm ? '58mm' : '80mm'} auto;
          margin: 0;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Courier New', Courier, monospace, 'Segoe UI', Tahoma, sans-serif;
          width: ${is58mm ? '54mm' : '74mm'};
          margin: 0 auto;
          padding: 6mm 2mm 10mm 2mm;
          color: #000000;
          background: #ffffff;
          font-size: ${is58mm ? '10px' : '11px'};
          line-height: 1.35;
        }
        .rcpt-header { text-align: center; margin-bottom: 6px; padding-top: 6px; }
        .rcpt-logo-wrap { display: flex; justify-content: center; align-items: center; margin: 0 auto 6px auto; }
        .rcpt-logo { width: ${is58mm ? '45px' : '58px'}; height: ${is58mm ? '45px' : '58px'}; margin: 0 auto; display: block; object-fit: contain; }
        .rcpt-title { font-size: ${is58mm ? '13.5px' : '15.5px'}; font-weight: 900; letter-spacing: 0.5px; margin: 2px 0; text-transform: uppercase; }
        .rcpt-tagline { font-size: 8.5px; font-weight: 700; color: #222; margin-bottom: 3px; }
        .rcpt-address { font-size: 9px; color: #111; line-height: 1.25; margin-bottom: 2px; }
        .rcpt-contact { font-size: 9.5px; }
        .rcpt-divider { border-top: 1px dashed #000; margin: 6px 0; }
        .rcpt-divider-dotted { border-top: 1px dotted #333; margin: 5px 0; }
        .rcpt-divider-solid { border-top: 1.5px solid #000; margin: 5px 0; }
        .rcpt-meta { font-size: 9.5px; line-height: 1.35; }
        .rcpt-meta-row { display: flex; justify-content: space-between; }
        .rcpt-items-head { display: flex; font-weight: 900; font-size: 9.5px; padding: 2px 0; }
        .rcpt-col-desc { flex: 2; text-align: left; }
        .rcpt-col-qty { width: 26px; text-align: center; }
        .rcpt-col-price { width: 48px; text-align: right; }
        .rcpt-col-amt { width: 52px; text-align: right; }
        .rcpt-items-list { display: flex; flex-direction: column; gap: 4px; }
        .rcpt-item-row { font-size: 10px; line-height: 1.3; }
        .rcpt-item-top { font-weight: 700; }
        .rcpt-item-bottom { display: flex; justify-content: space-between; font-size: 9.5px; }
        .rcpt-totals { display: flex; flex-direction: column; gap: 3px; }
        .rcpt-total-row { display: flex; justify-content: space-between; font-size: 10px; }
        .rcpt-total-row.net-total { font-size: 13.5px; font-weight: 900; padding: 3px 0; }
        .rcpt-total-row.change { font-weight: 800; }
        .rcpt-footer { text-align: center; font-size: 9px; line-height: 1.35; margin-top: 4px; }
        .rcpt-counts { font-weight: 700; margin-bottom: 5px; font-size: 9.5px; }
        .rcpt-thankyou { font-weight: 900; font-size: 10.5px; margin: 3px 0 1px 0; }
        .rcpt-sinhala { font-size: 9.5px; font-weight: 600; margin-bottom: 5px; }
        .rcpt-terms { font-size: 8px; color: #444; line-height: 1.2; }
        .rcpt-barcode { margin: 8px auto 0 auto; text-align: center; width: 140px; }
        .barcode-lines { height: 26px; background: repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 5px, #fff 5px, #fff 8px, #000 8px, #000 11px, #fff 11px, #fff 13px, #000 13px, #000 16px, #fff 16px, #fff 18px); margin-bottom: 2px; }
        .barcode-digits { font-size: 8.5px; letter-spacing: 1.5px; color: #333; }
      </style>
    </head>
    <body>
      ${printContent}
      <script>
        window.onload = function() {
          window.focus();
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  doc.close();
}

function printPosQuickReceipt() {
  openPosReceiptModal();
}

function sendReceiptToWhatsappPdf() {
  if (posCart.length === 0) return;
  if (!isPosCartDeducted && posCart.length > 0) {
    const deducted = deductItemsFromCatalog(posCart, 'POS Receipt');
    isPosCartDeducted = true;
    if (deducted.length > 0) {
      showToast(state.currentLang === 'si'
        ? `📦 භාණ්ඩ ${deducted.length} ක තොග ප්‍රමාණය අඩු කරන ලදී!`
        : `📦 Stock deducted for ${deducted.length} item(s)!`);
    }
  }
  saveCurrentPosReceiptToHistory();

  const custNameInput = document.getElementById('pos-cust-name');
  const custPhoneInput = document.getElementById('pos-cust-phone');
  const custName = custNameInput && custNameInput.value.trim() ? custNameInput.value.trim() : 'Customer';
  const custPhone = custPhoneInput ? custPhoneInput.value.trim() : '';

  let subtotal = 0;
  posCart.forEach(i => subtotal += (i.qty * i.price));
  const discount = Math.max(0, parseFloat(document.getElementById('pos-cart-discount').value) || 0);
  const paid = Math.max(0, parseFloat(document.getElementById('pos-cart-paid').value) || 0);
  const total = Math.max(0, subtotal - discount);

  let msg = `🧾 *RECITAL ELECTRONIC - PAYMENT RECEIPT*\n`;
  msg += `Sound Systems & Electronic Solutions\n`;
  msg += `Tel: 0763366993 | Anuradhapura\n`;
  msg += `─────────────────────────\n`;
  msg += `Receipt: *${currentReceiptNumber}*\n`;
  msg += `Customer: *${custName}*\n`;
  msg += `Date: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\n`;
  msg += `─────────────────────────\n`;
  msg += `*ITEMS / SERVICES:*\n`;
  posCart.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.nameEn} (×${item.qty}) = ${formatCurrency(item.qty * item.price)}\n`;
  });
  msg += `─────────────────────────\n`;
  msg += `*TOTAL AMOUNT:* *${formatCurrency(total)}*\n`;
  if (paid > 0) msg += `Cash Received: ${formatCurrency(paid)} | Change: ${formatCurrency(Math.max(0, paid - total))}\n`;
  msg += `─────────────────────────\n`;
  msg += `Thank you for choosing Recital Electronic!\n`;
  msg += `ඔබගේ පැමිණීමට සහ විශ්වාසයට ස්තූතියි!`;

  let cleanPhone = custPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '94' + cleanPhone.substring(1);
  if (cleanPhone.length >= 9 && !cleanPhone.startsWith('94')) cleanPhone = '94' + cleanPhone;

  const element = document.getElementById('pos-receipt-print-area');
  const filename = `RECEIPT_${currentReceiptNumber}.pdf`;

  if (typeof html2pdf !== 'undefined' && element) {
    showToast('Generating Receipt PDF...');
    const opt = {
      margin: [2, 2, 2, 2],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: [80, 220], orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).outputPdf('blob').then(pdfBlob => {
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        navigator.share({
          files: [pdfFile],
          title: filename,
          text: msg
        }).then(() => {
          showToast('Receipt PDF shared to WhatsApp!');
        }).catch(err => {
          if (err.name !== 'AbortError') {
            dispatchWhatsappWebWithPdf(pdfBlob, filename, cleanPhone, msg);
          }
        });
      } else {
        dispatchWhatsappWebWithPdf(pdfBlob, filename, cleanPhone, msg);
      }
    }).catch(err => {
      console.error('PDF generation error', err);
      dispatchWhatsappWebFallback(cleanPhone, msg);
    });
  } else {
    dispatchWhatsappWebFallback(cleanPhone, msg);
  }
}

function shareCurrentDocToWhatsappPdf() {
  if (!state.doc.inventoryDeducted && state.doc.items && state.doc.items.length > 0) {
    saveCurrentDoc(true);
  }
  const phoneInput = document.getElementById('wa-recipient-phone');
  let phone = (phoneInput ? phoneInput.value : '').replace(/[^0-9]/g, '');
  if (phone.startsWith('0') && phone.length === 10) phone = '94' + phone.substring(1);

  const msg = document.getElementById('wa-message-text').value;
  const element = document.getElementById('invoice-preview');
  const filename = `${state.docType.toUpperCase()}_${state.doc.number || 'Doc'}.pdf`;

  if (typeof html2pdf !== 'undefined' && element) {
    showToast('Generating Document PDF...');
    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).outputPdf('blob').then(pdfBlob => {
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        navigator.share({
          files: [pdfFile],
          title: filename,
          text: msg
        }).then(() => {
          showToast('Shared PDF successfully!');
          closeWhatsappModal();
        }).catch(err => {
          if (err.name !== 'AbortError') {
            dispatchWhatsappWebWithPdf(pdfBlob, filename, phone, msg);
            closeWhatsappModal();
          }
        });
      } else {
        dispatchWhatsappWebWithPdf(pdfBlob, filename, phone, msg);
        closeWhatsappModal();
      }
    }).catch(err => {
      console.error('PDF error', err);
      sendWhatsappDirect();
    });
  } else {
    sendWhatsappDirect();
  }
}

function dispatchWhatsappWebWithPdf(blob, filename, phone, msg) {
  // 1. Download file directly
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  // 2. Open WhatsApp Web / App
  const waUrl = phone 
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');

  alert(state.currentLang === 'si'
    ? '📄 PDF ගොනුව බාගත විය!\nWhatsApp විවෘත වූ පසු එම PDF ගොනුව Attach කර පාරිභෝගිකයාට යවන්න.'
    : '📄 PDF document has been downloaded!\nWhatsApp is opened — simply attach the downloaded PDF file to send it.');
}

function dispatchWhatsappWebFallback(phone, msg) {
  const waUrl = phone 
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

function resetPosForNewSale() {
  // If sale was not yet deducted (e.g. user finished sale & clicked New Sale without printing)
  if (!isPosCartDeducted && posCart.length > 0) {
    const deducted = deductItemsFromCatalog(posCart, 'POS Sale');
    isPosCartDeducted = true;
    saveCurrentPosReceiptToHistory();
    if (deducted.length > 0) {
      showToast(state.currentLang === 'si'
        ? `📦 භාණ්ඩ ${deducted.length} ක තොග ප්‍රමාණය අඩු කරන ලදී!`
        : `📦 Stock deducted for ${deducted.length} item(s)!`);
    }
  }

  isPosCartDeducted = false;
  clearPosCart();
  const cName = document.getElementById('pos-cust-name');
  if (cName) cName.value = '';
  const cPhone = document.getElementById('pos-cust-phone');
  if (cPhone) cPhone.value = '';
  const disc = document.getElementById('pos-cart-discount');
  if (disc) disc.value = '0';
  const paid = document.getElementById('pos-cart-paid');
  if (paid) paid.value = '0';
  updatePosCartCalculations();
  closePosReceiptModal();
  showToast(state.currentLang === 'si' ? 'නව විකිණුම සඳහා සූදානම්!' : 'Ready for new sale!');
}

// ==========================================
// VIEW 5: History & Records Management Logic
// ==========================================
var currentHistoryFilter = 'all';
var currentHistoryStatusFilter = 'all';
var currentHistoryDatePreset = 'all';
var currentHistoryDateFrom = '';
var currentHistoryDateTo = '';
var currentHistorySearch = '';

function setHistoryTabFilter(filter) {
  currentHistoryFilter = filter;
  ['all', 'invoice', 'quotation', 'receipt'].forEach(type => {
    const btn = document.getElementById('hist-pill-' + type);
    if (btn) btn.classList.toggle('active', type === filter);
  });
  renderHistoryView();
}

function handleHistoryStatusFilter(val) {
  currentHistoryStatusFilter = val;
  renderHistoryView();
}

function handleHistDatePreset(preset) {
  currentHistoryDatePreset = preset;
  const wrap = document.getElementById('hist-custom-date-wrap');
  if (wrap) wrap.style.display = (preset === 'custom') ? 'inline-flex' : 'none';

  if (preset === 'custom') {
    const today = formatDate(new Date());
    const fromInp = document.getElementById('hist-date-from');
    const toInp = document.getElementById('hist-date-to');
    if (fromInp && !fromInp.value) fromInp.value = today;
    if (toInp && !toInp.value) toInp.value = today;
    currentHistoryDateFrom = fromInp ? fromInp.value : '';
    currentHistoryDateTo = toInp ? toInp.value : '';
  }
  renderHistoryView();
}

function handleHistoryDateChange() {
  const fromInp = document.getElementById('hist-date-from');
  const toInp = document.getElementById('hist-date-to');
  currentHistoryDateFrom = fromInp ? fromInp.value : '';
  currentHistoryDateTo = toInp ? toInp.value : '';
  renderHistoryView();
}

function handleHistorySearch(text) {
  currentHistorySearch = (text || '').toLowerCase().trim();
  renderHistoryView();
}

function clearHistorySearch() {
  currentHistorySearch = '';
  const input = document.getElementById('hist-search-input');
  if (input) input.value = '';
  renderHistoryView();
}

function renderHistoryView() {
  const tbody = document.getElementById('history-tab-table-body');
  if (!tbody) return;

  const history = getSavedDocsHistory();
  const isSi = (state.currentLang === 'si');

  // Compute live summary metrics across all records
  let invoiceCount = 0;
  let quotationCount = 0;
  let receiptCount = 0;
  let totalRevenue = 0;

  history.forEach(doc => {
    const type = (doc.type || 'quotation').toLowerCase();
    let total = 0;
    if (typeof doc.total === 'number') {
      total = doc.total;
    } else if (doc.items) {
      let sub = 0;
      doc.items.forEach(i => sub += (i.amount || 0));
      total = Math.max(0, sub - (doc.discount || 0) + (doc.delivery || 0));
    }

    if (type === 'invoice') {
      invoiceCount++;
      totalRevenue += total;
    } else if (type === 'quotation') {
      quotationCount++;
    } else if (type === 'receipt') {
      receiptCount++;
      totalRevenue += total;
    }
  });

  const elTotDocs = document.getElementById('hist-val-total-docs');
  if (elTotDocs) elTotDocs.textContent = history.length;
  const elInvs = document.getElementById('hist-val-invoices');
  if (elInvs) elInvs.textContent = invoiceCount;
  const elQts = document.getElementById('hist-val-quotations');
  if (elQts) elQts.textContent = quotationCount;
  const elRcpts = document.getElementById('hist-val-receipts');
  if (elRcpts) elRcpts.textContent = receiptCount;
  const elRev = document.getElementById('hist-val-total-rev');
  if (elRev) elRev.textContent = formatCurrency(totalRevenue);

  // Filter records
  const filtered = history.filter(doc => {
    const docType = (doc.type || 'quotation').toLowerCase();
    if (currentHistoryFilter !== 'all' && docType !== currentHistoryFilter) {
      return false;
    }

    // Status Filter (Paid vs Pending)
    if (currentHistoryStatusFilter === 'Paid') {
      if (doc.status !== 'Paid') return false;
    } else if (currentHistoryStatusFilter === 'Pending') {
      if (doc.status === 'Paid') return false;
    }

    // Date Filter
    if (currentHistoryDatePreset !== 'all') {
      const docDateStr = (doc.date || '').substring(0, 10);
      const today = new Date();
      const todayStr = formatDate(today);
      if (currentHistoryDatePreset === 'today') {
        if (docDateStr !== todayStr) return false;
      } else if (currentHistoryDatePreset === 'this_week') {
        const d = new Date(docDateStr);
        const diffDays = (today - d) / (1000 * 60 * 60 * 24);
        if (isNaN(diffDays) || diffDays < 0 || diffDays > 7) return false;
      } else if (currentHistoryDatePreset === 'this_month') {
        if (!docDateStr.startsWith(todayStr.substring(0, 7))) return false;
      } else if (currentHistoryDatePreset === 'custom') {
        if (currentHistoryDateFrom && docDateStr < currentHistoryDateFrom) return false;
        if (currentHistoryDateTo && docDateStr > currentHistoryDateTo) return false;
      }
    }

    if (currentHistorySearch) {
      const numMatch = (doc.number || '').toLowerCase().includes(currentHistorySearch);
      const nameMatch = (doc.customer && doc.customer.name || '').toLowerCase().includes(currentHistorySearch);
      const phoneMatch = (doc.customer && doc.customer.phone || '').includes(currentHistorySearch);
      const dateMatch = (doc.date || '').toLowerCase().includes(currentHistorySearch);
      if (!numMatch && !nameMatch && !phoneMatch && !dateMatch) return false;
    }
    return true;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:36px 16px; color:#64748b; font-size:13.5px;">
          📋 ${isSi ? 'කිසිදු ලේඛනයක් හෝ රිසිට්පතක් හමු නොවීය.' : 'No invoices, quotations or receipts found.'}
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(doc => {
    const tr = document.createElement('tr');
    const docType = (doc.type || 'quotation').toLowerCase();

    let badgeClass = 'badge-doc-quotation';
    let typeName = isSi ? 'මිල ගණන්' : 'Quotation';
    if (docType === 'invoice') {
      badgeClass = 'badge-doc-invoice';
      typeName = isSi ? 'ඉන්වොයිස්' : 'Invoice';
    } else if (docType === 'receipt') {
      badgeClass = 'badge-doc-receipt';
      typeName = isSi ? 'රිසිට්පත' : 'Thermal Receipt';
    }

    let total = 0;
    if (typeof doc.total === 'number') {
      total = doc.total;
    } else if (doc.items) {
      let sub = 0;
      doc.items.forEach(i => sub += (i.amount || 0));
      total = Math.max(0, sub - (doc.discount || 0) + (doc.delivery || 0));
    }

    const custName = (doc.customer && doc.customer.name) ? doc.customer.name : 'Walk-in Customer';
    const custPhone = (doc.customer && doc.customer.phone) ? doc.customer.phone : '';
    const dateStr = doc.date || '';
    const timeStr = doc.time ? ` <span style="color:#94a3b8; font-size:11px;">${doc.time}</span>` : '';

    const statusBadge = (doc.status === 'Paid') 
      ? `<span class="badge badge-success" style="font-size:11px;">Paid</span>`
      : (doc.status === 'Draft' ? `<span class="badge" style="background:#e2e8f0; color:#475569; font-size:11px;">Draft</span>` : `<span class="badge badge-warning" style="font-size:11px;">${doc.status || 'Active'}</span>`);

    tr.innerHTML = `
      <td><span class="${badgeClass}">${typeName}</span></td>
      <td><strong style="color:#0f172a; font-size:13px;">${escapeHtml(doc.number || '-')}</strong></td>
      <td>${dateStr}${timeStr}</td>
      <td>
        <div style="font-weight:600; color:#1e293b;">${escapeHtml(custName)}</div>
        ${custPhone ? `<div style="font-size:11px; color:#64748b;">📞 ${escapeHtml(custPhone)}</div>` : ''}
      </td>
      <td style="text-align:right; font-weight:800; color:#0f172a;">${formatCurrency(total)}</td>
      <td style="text-align:center;">${statusBadge}</td>
      <td style="text-align:center;">
        <div class="hist-action-group">
          <button type="button" class="btn btn-outline btn-sm" onclick="editRecordFromHistory('${doc.id}')" title="Fix / Edit Details">
            ✏️ ${isSi ? 'හදන්න' : 'Fix / Edit'}
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="printRecordFromHistory('${doc.id}')" title="Print Document">
            🖨️
          </button>
          <button type="button" class="btn btn-whatsapp btn-sm" onclick="shareRecordToWhatsappPdf('${doc.id}')" title="Send PDF to WhatsApp">
            💬 PDF
          </button>
          <button type="button" class="btn btn-danger-outline btn-sm" onclick="deleteHistoryRecord('${doc.id}')" title="Delete">
            🗑️
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editRecordFromHistory(id) {
  const history = getSavedDocsHistory();
  const doc = history.find(d => d.id === id);
  if (!doc) return;

  const docType = (doc.type || 'quotation').toLowerCase();

  if (docType === 'receipt') {
    // Load into POS Cart so user can fix items, quantities, or prices
    isPosCartDeducted = (doc.inventoryDeducted !== false);
    posCart = (doc.items || []).map(i => ({
      id: i.id || ('item-' + Date.now()),
      nameEn: i.nameEn || i.description || 'Custom Item',
      nameSi: i.nameSi || i.description || 'Custom Item',
      type: i.type || 'item',
      price: i.unitPrice || i.price || 0,
      qty: i.qty || 1
    }));

    currentReceiptNumber = doc.number;
    const cName = document.getElementById('pos-cust-name');
    if (cName) cName.value = (doc.customer && doc.customer.name) ? doc.customer.name : '';
    const cPhone = document.getElementById('pos-cust-phone');
    if (cPhone) cPhone.value = (doc.customer && doc.customer.phone) ? doc.customer.phone : '';
    const disc = document.getElementById('pos-cart-discount');
    if (disc) disc.value = doc.discount || 0;
    const paid = document.getElementById('pos-cart-paid');
    if (paid) paid.value = doc.advance || doc.paid || 0;

    switchMainTab('pos');
    renderPosCart();
    showToast(state.currentLang === 'si' ? 'රිසිට්පත POS බිල්පතට පූරණය විය. අවශ්‍ය පරිදි සංස්කරණය කරන්න!' : 'Receipt loaded into Store POS! You can now fix or update any items.');
  } else {
    // Load into Invoice & Quotation generator
    state.doc = JSON.parse(JSON.stringify(doc));
    setDocType(state.doc.type || 'quotation');
    syncFormWithState();
    updateLivePreview();
    switchMainTab('generator');
    showToast(state.currentLang === 'si' ? 'ලේඛනය සංස්කාරකයට පූරණය විය. අවශ්‍ය පරිදි සංස්කරණය කරන්න!' : 'Document loaded into Editor! You can now fix or update any items.');
  }
}

function printRecordFromHistory(id) {
  const history = getSavedDocsHistory();
  const doc = history.find(d => d.id === id);
  if (!doc) return;

  const docType = (doc.type || 'quotation').toLowerCase();
  if (docType === 'receipt') {
    currentReceiptNumber = doc.number;
    posCart = (doc.items || []).map(i => ({
      id: i.id,
      nameEn: i.nameEn || i.description,
      nameSi: i.nameSi || i.description,
      type: i.type || 'item',
      price: i.unitPrice || i.price || 0,
      qty: i.qty || 1
    }));
    isPosCartDeducted = true;
    openPosReceiptModal();
    setTimeout(() => executeReceiptPrint(), 300);
  } else {
    state.doc = JSON.parse(JSON.stringify(doc));
    setDocType(state.doc.type || 'quotation');
    syncFormWithState();
    updateLivePreview();
    switchMainTab('generator');
    setTimeout(() => window.print(), 300);
  }
}

function shareRecordToWhatsappPdf(id) {
  const history = getSavedDocsHistory();
  const doc = history.find(d => d.id === id);
  if (!doc) return;

  const docType = (doc.type || 'quotation').toLowerCase();
  if (docType === 'receipt') {
    currentReceiptNumber = doc.number;
    posCart = (doc.items || []).map(i => ({
      id: i.id,
      nameEn: i.nameEn || i.description,
      nameSi: i.nameSi || i.description,
      type: i.type || 'item',
      price: i.unitPrice || i.price || 0,
      qty: i.qty || 1
    }));
    isPosCartDeducted = true;
    openPosReceiptModal();
    sendReceiptToWhatsappPdf();
  } else {
    state.doc = JSON.parse(JSON.stringify(doc));
    setDocType(state.doc.type || 'quotation');
    syncFormWithState();
    updateLivePreview();
    openWhatsappModal();
  }
}

function deleteHistoryRecord(id) {
  if (confirm(state.currentLang === 'si' ? 'මෙම ලේඛනය සම්පූර්ණයෙන්ම මකා දැමීමට අවශ්‍ය බව සහතිකද?' : 'Are you sure you want to permanently delete this record?')) {
    let history = getSavedDocsHistory();
    history = history.filter(d => d.id !== id);
    localStorage.setItem('recital_docs_history', JSON.stringify(history));
    if (window.firebaseDB && window.firebaseDB.isInitialized && !window.firebaseDB.isSyncing) {
      const docId = state.doc.number || state.doc.id || ('DOC-' + Date.now());
      window.firebaseDB.saveItem('invoices', docId, state.doc);
    }
    renderHistoryView();
    updateDashboard();
    showToast(state.currentLang === 'si' ? 'ලේඛනය මකා දමන ලදී!' : 'Record deleted successfully!');
  }
}

// ==========================================
// Quick Manual Service Entry in POS
// ==========================================
function addManualServiceToPos() {
  const descInput = document.getElementById('pos-manual-desc');
  const priceInput = document.getElementById('pos-manual-price');
  if (!descInput || !priceInput) return;

  const desc = descInput.value.trim();
  const price = parseFloat(priceInput.value) || 0;

  if (!desc) {
    alert(state.currentLang === 'si' ? 'කරුණාකර සේවා විස්තරය ඇතුළත් කරන්න.' : 'Please enter the service or repair description.');
    descInput.focus();
    return;
  }
  if (price <= 0) {
    alert(state.currentLang === 'si' ? 'කරුණාකර නිවැරදි සේවා ගාස්තුවක් ඇතුළත් කරන්න.' : 'Please enter a valid service fee.');
    priceInput.focus();
    return;
  }

  const customService = {
    id: 'manual-' + Date.now(),
    nameEn: desc,
    nameSi: desc,
    type: 'service',
    price: price,
    qty: 1
  };

  isPosCartDeducted = false;
  posCart.push(customService);
  renderPosCart();

  descInput.value = '';
  priceInput.value = '';

  showToast(`${state.currentLang === 'si' ? 'සේවාව එක්කරන ලදී' : 'Added service'}: ${desc}`);
}

// ==========================================
// Add / Edit Product Modal & Handlers
// ==========================================
var editingStoreItemId = null;

function openAddProductModal() {
  editingStoreItemId = null;
  const modal = document.getElementById('modal-add-product');
  if (!modal) return;
  const title = document.getElementById('ui-modal-add-prod-title');
  if (title) {
    title.textContent = window.AppTranslations[state.currentLang] ? window.AppTranslations[state.currentLang].addNewProductBtn : 'Add Store Item / Service';
  }
  // Clear inputs
  document.getElementById('new-item-type').value = 'item';
  document.getElementById('new-item-name-en').value = '';
  document.getElementById('new-item-name-si').value = '';
  document.getElementById('new-item-price').value = '';
  document.getElementById('new-item-stock').value = '10';
  toggleNewItemStockField('item');

  modal.classList.add('active');
}

function closeAddProductModal() {
  const modal = document.getElementById('modal-add-product');
  if (modal) modal.classList.remove('active');
  editingStoreItemId = null;
}

function toggleNewItemStockField(type) {
  const stockGroup = document.getElementById('group-new-item-stock');
  if (stockGroup) {
    stockGroup.style.display = (type === 'service') ? 'none' : 'block';
  }
}

function saveNewStoreItem() {
  const type = document.getElementById('new-item-type').value;
  const nameEn = (document.getElementById('new-item-name-en').value || '').trim();
  const nameSi = (document.getElementById('new-item-name-si').value || '').trim();
  const price = parseFloat(document.getElementById('new-item-price').value) || 0;
  const stock = parseInt(document.getElementById('new-item-stock').value, 10) || 0;

  if (!nameEn) {
    alert(state.currentLang === 'si' ? 'කරුණාකර භාණ්ඩයේ හෝ සේවාවේ නම ඇතුළත් කරන්න.' : 'Please enter an item or service name.');
    return;
  }

  if (editingStoreItemId) {
    // Update existing item in catalog
    const item = storeCatalog.find(x => x.id === editingStoreItemId);
    if (item) {
      item.type = type;
      item.nameEn = nameEn;
      item.nameSi = nameSi || nameEn;
      item.price = price;
      item.stock = (type === 'service') ? 0 : stock;
    }
    editingStoreItemId = null;
    showToast(state.currentLang === 'si' ? 'සාර්ථකව යාවත්කාලීන කරන ලදී!' : 'Updated successfully!');
  } else {
    // Create new catalog item
    const newItem = {
      id: 'prod-' + Date.now(),
      type: type,
      nameEn: nameEn,
      nameSi: nameSi || nameEn,
      price: price,
      stock: (type === 'service') ? 0 : (stock || 10)
    };
    storeCatalog.unshift(newItem);
    showToast(state.currentLang === 'si' ? 'නාමාවලියට සුරකින ලදී!' : 'Saved to catalog!');
  }

  persistStoreCatalog(storeCatalog);
  closeAddProductModal();

  renderPosCatalog();
  renderInventoryView();
}

// ==========================================
// Items & Inventory Management Tab Logic
// ==========================================
var currentInvFilter = 'all';
var currentInvSearch = '';

function filterInventoryCategory(cat) {
  currentInvFilter = cat;
  ['all', 'services', 'items'].forEach(pill => {
    const el = document.getElementById('inv-pill-' + pill);
    if (el) el.classList.remove('active');
  });

  if (cat === 'all') {
    const p = document.getElementById('inv-pill-all');
    if (p) p.classList.add('active');
  } else if (cat === 'service') {
    const p = document.getElementById('inv-pill-services');
    if (p) p.classList.add('active');
  } else if (cat === 'item') {
    const p = document.getElementById('inv-pill-items');
    if (p) p.classList.add('active');
  }

  renderInventoryView();
}

function onInventorySearch(query) {
  currentInvSearch = (query || '').toLowerCase().trim();
  renderInventoryView();
}

function renderInventoryView() {
  const tbody = document.getElementById('inventory-table-body');
  if (!tbody) return;

  const isSi = (state.currentLang === 'si');

  // Compute live metrics
  const totalItems = storeCatalog.filter(x => x.type === 'item').length;
  const totalServices = storeCatalog.filter(x => x.type === 'service').length;
  const lowStockCount = storeCatalog.filter(x => x.type === 'item' && (parseInt(x.stock, 10) || 0) <= 5).length;

  const statItemsEl = document.getElementById('inv-stat-items');
  if (statItemsEl) statItemsEl.textContent = totalItems;
  const statSrvEl = document.getElementById('inv-stat-services');
  if (statSrvEl) statSrvEl.textContent = totalServices;
  const statLowEl = document.getElementById('inv-stat-low-stock');
  if (statLowEl) statLowEl.textContent = lowStockCount;

  // Filter catalog
  const filtered = storeCatalog.filter(item => {
    if (currentInvFilter !== 'all' && item.type !== currentInvFilter) return false;
    if (currentInvSearch) {
      const matchEn = (item.nameEn || '').toLowerCase().includes(currentInvSearch);
      const matchSi = (item.nameSi || '').toLowerCase().includes(currentInvSearch);
      if (!matchEn && !matchSi) return false;
    }
    return true;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:32px 16px; color:#64748b; font-size:13.5px;">
          🔍 ${isSi ? 'ගැලපෙන කිසිදු භාණ්ඩයක් හෝ සේවාවක් හමු නොවීය.' : 'No matching items or services found in inventory.'}
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement('tr');
    const isService = item.type === 'service';
    const badgeText = isService ? (isSi ? 'සේවාව (Service)' : 'Service') : (isSi ? 'භාණ්ඩය (Item)' : 'Item Selling');
    const badgeClass = isService ? 'badge-service' : 'badge-item';
    const stockQty = parseInt(item.stock, 10) || 0;

    let stockDisplay = '';
    if (isService) {
      stockDisplay = `<span style="color:#64748b; font-size:12px;">${isSi ? 'සේවාව (අදාළ නොවේ)' : 'Service (N/A)'}</span>`;
    } else if (stockQty <= 5) {
      stockDisplay = `<span style="color:#dc2626; font-weight:700;">⚠️ ${stockQty} (${isSi ? 'අඩු තොග' : 'Low Stock'})</span>`;
    } else {
      stockDisplay = `<span style="color:#059669; font-weight:700;">${stockQty} in stock</span>`;
    }

    tr.innerHTML = `
      <td><span class="pos-card-badge ${badgeClass}">${badgeText}</span></td>
      <td>
        <div style="font-weight:700; color:#0f172a; font-size:13px;">${escapeHtml(item.nameEn)}</div>
        <div style="font-size:11.5px; color:#64748b; margin-top:2px;">${escapeHtml(item.nameSi)}</div>
      </td>
      <td style="font-weight:800; color:#0052cc;">${formatCurrency(item.price)}</td>
      <td>${stockDisplay}</td>
      <td style="text-align:center;">
        <div class="inv-action-btns">
          <button type="button" class="btn btn-outline btn-sm" onclick="addStoreItemToPos('${item.id}')" title="Add to POS Bill">
            🛒 ${isSi ? 'බිලට' : '+ POS'}
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="openEditStoreItemModal('${item.id}')" title="Edit">
            ✏️
          </button>
          <button type="button" class="btn btn-danger-outline btn-sm" onclick="deleteStoreItem('${item.id}')" title="Delete">
            🗑️
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function addStoreItemToPos(id) {
  const item = storeCatalog.find(x => x.id === id);
  if (!item) return;

  isPosCartDeducted = false;
  const existing = posCart.find(c => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    posCart.push({
      id: item.id,
      nameEn: item.nameEn,
      nameSi: item.nameSi,
      type: item.type,
      price: item.price,
      qty: 1
    });
  }

  renderPosCart();
  showToast(`${state.currentLang === 'si' ? 'බිල්පතට එක්කරන ලදී' : 'Added to POS'}: ${state.currentLang === 'si' ? item.nameSi : item.nameEn}`);
}

function openEditStoreItemModal(id) {
  const item = storeCatalog.find(x => x.id === id);
  if (!item) return;

  editingStoreItemId = id;
  const modal = document.getElementById('modal-add-product');
  if (!modal) return;

  const title = document.getElementById('ui-modal-add-prod-title');
  if (title) {
    title.textContent = state.currentLang === 'si' ? 'භාණ්ඩය / සේවාව සංස්කරණය' : 'Edit Item / Service';
  }

  document.getElementById('new-item-type').value = item.type;
  document.getElementById('new-item-name-en').value = item.nameEn;
  document.getElementById('new-item-name-si').value = item.nameSi || item.nameEn;
  document.getElementById('new-item-price').value = item.price;
  document.getElementById('new-item-stock').value = item.stock || 10;

  toggleNewItemStockField(item.type);
  modal.classList.add('active');
}

function deleteStoreItem(id) {
  const item = storeCatalog.find(x => x.id === id);
  if (!item) return;

  const name = state.currentLang === 'si' ? item.nameSi : item.nameEn;
  if (!confirm(`${state.currentLang === 'si' ? 'ඔබට මෙම භාණ්ඩය/සේවාව ඉවත් කිරීමට අවශ්‍යද?' : 'Are you sure you want to delete this item?'} \n\n"${name}"`)) {
    return;
  }

  storeCatalog = storeCatalog.filter(x => x.id !== id);
  persistStoreCatalog(storeCatalog);

  renderInventoryView();
  renderPosCatalog();
  showToast(state.currentLang === 'si' ? 'සාර්ථකව ඉවත් කරන ලදී' : 'Item removed successfully');
}


// ==========================================
// MODULE 1: Repair & Service Job Card System
// ==========================================
const DEFAULT_REPAIR_JOBS = [
  {
    id: 'job-1',
    jobId: 'RE-JOB-20261118-101',
    itemTag: 'SN-YAM-7000-884',
    customerName: 'Priyantha Bandara',
    customerPhone: '0763366993',
    deviceType: 'Power Amplifier',
    brandModel: 'Yamaha P7000S',
    fault: 'Ch B distorted output, protection LED stays red after 5 mins',
    accessories: 'Power Cable, Rack Ears',
    status: 'Diagnosing',
    estimatedCost: 6500,
    technician: 'Chamara',
    intakeDate: '2026-11-18',
    createdAt: '2026-11-18T09:30:00.000Z'
  },
  {
    id: 'job-2',
    jobId: 'RE-JOB-20261117-092',
    itemTag: 'SN-JBL-EON15-331',
    customerName: 'Kasun Kumara',
    customerPhone: '0771234567',
    deviceType: 'Speaker Box',
    brandModel: 'JBL EON 15-inch Powered',
    fault: 'Voice coil scratch, requires re-coning and spider realignment',
    accessories: 'None (Speaker cabinet only)',
    status: 'Ready for Pickup',
    estimatedCost: 4500,
    technician: 'Chamara',
    intakeDate: '2026-11-17',
    createdAt: '2026-11-17T14:30:00.000Z'
  },
  {
    id: 'job-3',
    jobId: 'RE-JOB-20261116-081',
    itemTag: 'SN-MG16XU-902',
    customerName: 'Sunil Shantha',
    customerPhone: '0719876543',
    deviceType: 'Audio Mixer',
    brandModel: 'Yamaha MG16XU 16-Channel',
    fault: 'Ch 3 & 4 gain pots crackling, phantom power switch loose',
    accessories: 'AC Power Adapter',
    status: 'Awaiting Parts',
    estimatedCost: 3500,
    technician: 'Kamal',
    intakeDate: '2026-11-16',
    createdAt: '2026-11-16T11:15:00.000Z'
  }
];

function loadRepairJobs() {
  try {
    const saved = localStorage.getItem('recital_job_cards');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_REPAIR_JOBS.slice();
}

function persistRepairJobs(jobs) {
  localStorage.setItem('recital_job_cards', JSON.stringify(jobs));
  if (window.firebaseDB && window.firebaseDB.isInitialized && !window.firebaseDB.isSyncing) {
    jobs.forEach(job => {
      const id = job.jobId || job.id || ('JOB-' + Date.now());
      window.firebaseDB.saveItem('repair_jobs', id, job);
    });
  }
}

var repairJobs = loadRepairJobs();
var currentRepairFilter = 'all';
var currentRepairsDeviceFilter = 'all';
var currentRepairsDatePreset = 'all';
var currentRepairsDateFrom = '';
var currentRepairsDateTo = '';
var currentRepairSearch = '';
var editingJobId = null;

function handleRepairsSearch(query) {
  currentRepairSearch = (query || '').toLowerCase().trim();
  renderRepairsView();
}

function clearRepairsSearch() {
  currentRepairSearch = '';
  const inp = document.getElementById('rep-search-input');
  if (inp) inp.value = '';
  renderRepairsView();
}

function handleRepairsDeviceFilter(val) {
  currentRepairsDeviceFilter = val;
  renderRepairsView();
}

function handleRepDatePreset(preset) {
  currentRepairsDatePreset = preset;
  const wrap = document.getElementById('rep-custom-date-wrap');
  if (wrap) wrap.style.display = (preset === 'custom') ? 'inline-flex' : 'none';

  if (preset === 'custom') {
    const today = formatDate(new Date());
    const fromInp = document.getElementById('rep-date-from');
    const toInp = document.getElementById('rep-date-to');
    if (fromInp && !fromInp.value) fromInp.value = today;
    if (toInp && !toInp.value) toInp.value = today;
    currentRepairsDateFrom = fromInp ? fromInp.value : '';
    currentRepairsDateTo = toInp ? toInp.value : '';
  }
  renderRepairsView();
}

function handleRepairsDateChange() {
  const fromInp = document.getElementById('rep-date-from');
  const toInp = document.getElementById('rep-date-to');
  currentRepairsDateFrom = fromInp ? fromInp.value : '';
  currentRepairsDateTo = toInp ? toInp.value : '';
  renderRepairsView();
}

function setRepairsFilter(status) {
  currentRepairFilter = status;
  const pills = ['all', 'received', 'diagnosing', 'parts', 'ready', 'completed'];
  pills.forEach(p => {
    const el = document.getElementById('rep-pill-' + p);
    if (el) el.classList.remove('active');
  });

  const activePill = document.getElementById('rep-pill-' + (status === 'all' ? 'all' : (status === 'Received' ? 'received' : (status === 'Diagnosing' ? 'diagnosing' : (status === 'Awaiting Parts' ? 'parts' : (status === 'Ready for Pickup' ? 'ready' : 'completed'))))));
  if (activePill) activePill.classList.add('active');

  renderRepairsView();
}

function getFilteredRepairJobs() {
  return repairJobs.filter(job => {
    // 1. Status Filter
    if (currentRepairFilter !== 'all' && job.status !== currentRepairFilter) {
      return false;
    }

    // 2. Device Category Filter
    if (currentRepairsDeviceFilter !== 'all') {
      const dev = (job.deviceType || '').toLowerCase();
      const target = currentRepairsDeviceFilter.toLowerCase();
      if (target === 'speaker box') {
        if (!dev.includes('speaker') && !dev.includes('subwoofer')) return false;
      } else if (target === 'other') {
        if (dev.includes('amplifier') || dev.includes('mixer') || dev.includes('speaker') || dev.includes('subwoofer') || dev.includes('microphone') || dev.includes('pcb')) return false;
      } else {
        if (!dev.includes(target)) return false;
      }
    }

    // 3. Date Filter
    if (currentRepairsDatePreset !== 'all') {
      const jobDateStr = (job.intakeDate || '').substring(0, 10);
      const today = new Date();
      const todayStr = formatDate(today);
      if (currentRepairsDatePreset === 'today') {
        if (jobDateStr !== todayStr) return false;
      } else if (currentRepairsDatePreset === 'this_week') {
        const d = new Date(jobDateStr);
        const diffDays = (today - d) / (1000 * 60 * 60 * 24);
        if (isNaN(diffDays) || diffDays < 0 || diffDays > 7) return false;
      } else if (currentRepairsDatePreset === 'this_month') {
        if (!jobDateStr.startsWith(todayStr.substring(0, 7))) return false;
      } else if (currentRepairsDatePreset === 'custom') {
        if (currentRepairsDateFrom && jobDateStr < currentRepairsDateFrom) return false;
        if (currentRepairsDateTo && jobDateStr > currentRepairsDateTo) return false;
      }
    }

    // 4. Search Filter
    if (currentRepairSearch) {
      const q = currentRepairSearch;
      const cleanQ = q.replace(/[^0-9]/g, '');
      const cleanPhone = (job.customerPhone || '').replace(/[^0-9]/g, '');
      const matchPhone = cleanQ.length >= 3 && cleanPhone.includes(cleanQ);
      const matchJobId = (job.jobId || '').toLowerCase().includes(q);
      const matchItemTag = (job.itemTag || '').toLowerCase().includes(q);
      const matchCustomer = (job.customerName || '').toLowerCase().includes(q);
      const matchModel = (job.brandModel || '').toLowerCase().includes(q);
      const matchFault = (job.fault || '').toLowerCase().includes(q);

      if (!matchPhone && !matchJobId && !matchItemTag && !matchCustomer && !matchModel && !matchFault) {
        return false;
      }
    }
    return true;
  });
}

function generateNextJobId() {
  const now = new Date();
  const dateCode = now.getFullYear().toString() +
                   String(now.getMonth() + 1).padStart(2, '0') +
                   String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(100 + Math.random() * 900);
  return 'RE-JOB-' + dateCode + '-' + rand;
}

function openNewJobCardModal() {
  editingJobId = null;
  const modal = document.getElementById('modal-job-card');
  if (!modal) return;

  const title = document.getElementById('ui-modal-job-title');
  if (title) title.textContent = state.currentLang === 'si' ? '🛠️ නව අලුත්වැඩියා කාඩ්පතක් එක්කිරීම' : '🛠️ Equipment Repair Job Card Intake';

  document.getElementById('job-input-id').value = generateNextJobId();
  document.getElementById('job-input-item-tag').value = '';
  document.getElementById('job-input-cust-name').value = '';
  document.getElementById('job-input-cust-phone').value = '';
  document.getElementById('job-input-device-type').value = 'Power Amplifier';
  document.getElementById('job-input-brand-model').value = '';
  document.getElementById('job-input-fault').value = '';
  document.getElementById('job-input-accessories').value = '';
  document.getElementById('job-input-status').value = 'Received';
  document.getElementById('job-input-est-cost').value = '';
  document.getElementById('job-input-technician').value = '';

  modal.classList.add('active');
}

function closeJobCardModal() {
  const modal = document.getElementById('modal-job-card');
  if (modal) modal.classList.remove('active');
  editingJobId = null;
}

function saveJobCard() {
  const jobId = document.getElementById('job-input-id').value.trim();
  const itemTag = document.getElementById('job-input-item-tag').value.trim();
  const custName = document.getElementById('job-input-cust-name').value.trim();
  const custPhone = document.getElementById('job-input-cust-phone').value.trim();
  const deviceType = document.getElementById('job-input-device-type').value;
  const brandModel = document.getElementById('job-input-brand-model').value.trim();
  const fault = document.getElementById('job-input-fault').value.trim();
  const accessories = document.getElementById('job-input-accessories').value.trim();
  const status = document.getElementById('job-input-status').value;
  const estCost = parseFloat(document.getElementById('job-input-est-cost').value) || 0;
  const technician = document.getElementById('job-input-technician').value.trim();

  if (!custName || !custPhone) {
    alert(state.currentLang === 'si' ? 'කරුණාකර පාරිභෝගික නම සහ දුරකථන අංකය ඇතුළත් කරන්න.' : 'Please enter customer name and phone number.');
    return;
  }

  if (editingJobId) {
    const job = repairJobs.find(j => j.id === editingJobId);
    if (job) {
      job.jobId = jobId;
      job.itemTag = itemTag;
      job.customerName = custName;
      job.customerPhone = custPhone;
      job.deviceType = deviceType;
      job.brandModel = brandModel;
      job.fault = fault;
      job.accessories = accessories;
      job.status = status;
      job.estimatedCost = estCost;
      job.technician = technician;
    }
    showToast(state.currentLang === 'si' ? 'අලුත්වැඩියා කාඩ්පත යාවත්කාලීන විය!' : 'Job card updated successfully!');
  } else {
    const newJob = {
      id: 'job-' + Date.now(),
      jobId: jobId || generateNextJobId(),
      itemTag: itemTag,
      customerName: custName,
      customerPhone: custPhone,
      deviceType: deviceType,
      brandModel: brandModel,
      fault: fault,
      accessories: accessories,
      status: status,
      estimatedCost: estCost,
      technician: technician,
      intakeDate: formatDate(new Date()),
      createdAt: new Date().toISOString()
    };
    repairJobs.unshift(newJob);
    showToast(state.currentLang === 'si' ? 'අලුත්වැඩියා කාඩ්පත සුරකින ලදී!' : 'Repair job card saved successfully!');
  }

  persistRepairJobs(repairJobs);
  closeJobCardModal();
  renderRepairsView();
}

function editJobCard(id) {
  const job = repairJobs.find(j => j.id === id);
  if (!job) return;

  editingJobId = id;
  const modal = document.getElementById('modal-job-card');
  if (!modal) return;

  const title = document.getElementById('ui-modal-job-title');
  if (title) title.textContent = state.currentLang === 'si' ? '🛠️ අලුත්වැඩියා කාඩ්පත සංස්කරණය' : '🛠️ Edit Repair Job Card';

  document.getElementById('job-input-id').value = job.jobId || '';
  document.getElementById('job-input-item-tag').value = job.itemTag || '';
  document.getElementById('job-input-cust-name').value = job.customerName || '';
  document.getElementById('job-input-cust-phone').value = job.customerPhone || '';
  document.getElementById('job-input-device-type').value = job.deviceType || 'Power Amplifier';
  document.getElementById('job-input-brand-model').value = job.brandModel || '';
  document.getElementById('job-input-fault').value = job.fault || '';
  document.getElementById('job-input-accessories').value = job.accessories || '';
  document.getElementById('job-input-status').value = job.status || 'Received';
  document.getElementById('job-input-est-cost').value = job.estimatedCost || '';
  document.getElementById('job-input-technician').value = job.technician || '';

  modal.classList.add('active');
}

function deleteJobCard(id) {
  const job = repairJobs.find(j => j.id === id);
  if (!job) return;

  if (confirm(state.currentLang === 'si' ? 'මෙම අලුත්වැඩියා කාඩ්පත (' + job.jobId + ') මකා දැමීමට අවශ්‍ය බව සහතිකද?' : 'Are you sure you want to delete job card ' + job.jobId + '?')) {
    repairJobs = repairJobs.filter(j => j.id !== id);
    persistRepairJobs(repairJobs);
    renderRepairsView();
    showToast(state.currentLang === 'si' ? 'කාඩ්පත මකා දමන ලදී!' : 'Job card deleted!');
  }
}

function renderRepairsView() {
  const tbody = document.getElementById('repairs-tab-table-body');
  if (!tbody) return;

  const isSi = (state.currentLang === 'si');

  // Metrics
  const activeCount = repairJobs.filter(j => j.status !== 'Completed' && j.status !== 'Cancelled').length;
  const partsCount = repairJobs.filter(j => j.status === 'Awaiting Parts').length;
  const readyCount = repairJobs.filter(j => j.status === 'Ready for Pickup').length;
  const completedCount = repairJobs.filter(j => j.status === 'Completed').length;

  const elAct = document.getElementById('rep-val-active');
  if (elAct) elAct.textContent = activeCount;
  const elParts = document.getElementById('rep-val-parts');
  if (elParts) elParts.textContent = partsCount;
  const elRdy = document.getElementById('rep-val-ready');
  if (elRdy) elRdy.textContent = readyCount;
  const elComp = document.getElementById('rep-val-completed');
  if (elComp) elComp.textContent = completedCount;

  const filtered = getFilteredRepairJobs();
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:36px 16px; color:#64748b; font-size:13.5px;">🔍 ' + (isSi ? 'ගැලපෙන කිසිදු අලුත්වැඩියා කාඩ්පතක් හමු නොවීය.' : 'No matching repair job cards found.') + '</td></tr>';
    return;
  }

  filtered.forEach(job => {
    const tr = document.createElement('tr');

    let badgeClass = 'badge-job-received';
    if (job.status === 'Diagnosing') badgeClass = 'badge-job-diagnosing';
    else if (job.status === 'Awaiting Parts') badgeClass = 'badge-job-parts';
    else if (job.status === 'Ready for Pickup') badgeClass = 'badge-job-ready';
    else if (job.status === 'Completed') badgeClass = 'badge-job-completed';
    else if (job.status === 'Cancelled') badgeClass = 'badge-job-cancelled';

    const itemTagHtml = job.itemTag
      ? '<div class="job-item-tag-pill">🏷️ ' + escapeHtml(job.itemTag) + '</div>'
      : '<span style="font-size:11px; color:#94a3b8; font-style:italic;">No Tag ID</span>';

    tr.innerHTML = '<td>' +
      '<div style="font-weight:800; color:#0052cc; font-size:13px; font-family:monospace;">' + escapeHtml(job.jobId) + '</div>' +
      itemTagHtml +
      '</td>' +
      '<td>' +
      '<div style="font-weight:700; color:#0f172a; font-size:13px;">' + escapeHtml(job.customerName) + '</div>' +
      '<div style="font-size:11.5px; color:#64748b; margin-top:2px;">' +
      '<a href="tel:' + escapeHtml(job.customerPhone) + '" style="color:#0284c7; text-decoration:none;">📞 ' + escapeHtml(job.customerPhone) + '</a>' +
      '</div>' +
      '</td>' +
      '<td>' +
      '<div style="font-weight:700; color:#1e293b; font-size:12.5px;">' + escapeHtml(job.deviceType || '') + (job.brandModel ? ' • ' + escapeHtml(job.brandModel) : '') + '</div>' +
      '<div style="font-size:11.5px; color:#64748b; margin-top:3px; max-width:280px; white-space:normal; line-height:1.35;">' +
      escapeHtml(job.fault || 'No defect details') +
      '</div>' +
      (job.accessories ? '<div style="font-size:10.5px; color:#94a3b8; margin-top:2px;">Acc: ' + escapeHtml(job.accessories) + '</div>' : '') +
      '</td>' +
      '<td style="font-size:12px; color:#475569; white-space:nowrap;">📅 ' + escapeHtml(job.intakeDate || '') + '</td>' +
      '<td style="text-align:center;"><span class="' + badgeClass + '">' + escapeHtml(job.status) + '</span></td>' +
      '<td style="text-align:right; font-weight:800; color:#0f172a; font-size:13px;">' + formatCurrency(job.estimatedCost || 0) + '</td>' +
      '<td style="text-align:center;">' +
      '<div class="hist-action-group">' +
      '<button type="button" class="btn btn-outline btn-sm" onclick="openJobSlipModal(\'' + job.id + '\')" title="Print Equipment Intake Slip / Sticker">🏷️ ' + (isSi ? 'ස්ටිකරය' : 'Sticker') + '</button>' +
      '<button type="button" class="btn btn-outline btn-sm" onclick="sendJobStatusWhatsapp(\'' + job.id + '\')" title="Send WhatsApp Update">💬</button>' +
      '<button type="button" class="btn btn-outline btn-sm" onclick="convertJobToInvoice(\'' + job.id + '\')" title="Convert to Official Invoice / POS Bill">🧾 ' + (isSi ? 'බිලට' : 'Bill') + '</button>' +
      '<button type="button" class="btn btn-outline btn-sm" onclick="editJobCard(\'' + job.id + '\')" title="Edit">✏️</button>' +
      '<button type="button" class="btn btn-danger-outline btn-sm" onclick="deleteJobCard(\'' + job.id + '\')" title="Delete">🗑️</button>' +
      '</div>' +
      '</td>';
    tbody.appendChild(tr);
  });
}

var activeJobSlipId = null;

function openJobSlipModal(id) {
  const job = repairJobs.find(j => j.id === id);
  if (!job) return;

  activeJobSlipId = id;
  const modal = document.getElementById('modal-job-slip');
  const printArea = document.getElementById('job-slip-print-area');
  if (!modal || !printArea) return;

  printArea.innerHTML = '<div style="text-align:center; padding-bottom:8px; border-bottom:1px dashed #000;">' +
    '<div style="font-weight:900; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">RECITAL ELECTRONIC</div>' +
    '<div style="font-size:9.5px; font-weight:700; color:#222;">SOUND SYSTEMS &amp; ELECTRONIC SOLUTIONS</div>' +
    '<div style="font-size:8.5px; color:#444; margin-top:2px;">583/2, Dewata Rd, Kudhanelumkulama, Anuradhapura</div>' +
    '<div style="font-size:9px; font-weight:700; margin-top:2px;">Tel / WA: 0763366993</div>' +
    '</div>' +
    '<div style="text-align:center; margin:8px 0 6px 0; background:#f1f5f9; padding:4px; border-radius:3px;">' +
    '<div style="font-weight:900; font-size:11px; letter-spacing:0.5px;">*** EQUIPMENT REPAIR INTAKE ***</div>' +
    '<div style="font-size:9px; color:#475569;">උපකරණ භාරගැනීමේ රිසිට්පත සහ ස්ටිකරය</div>' +
    '</div>' +
    '<div style="margin:6px 0; font-size:10px; line-height:1.45;">' +
    '<div style="display:flex; justify-content:space-between; margin-bottom:3px;">' +
    '<strong>JOB TICKET:</strong>' +
    '<strong style="font-size:12px; font-family:monospace; color:#000;">' + escapeHtml(job.jobId) + '</strong>' +
    '</div>' +
    '<div style="display:flex; justify-content:space-between; margin-bottom:3px; background:#fffbeb; padding:2px 4px; border:1px solid #fde68a;">' +
    '<strong>ITEM TAG / SERIAL:</strong>' +
    '<strong style="font-size:11.5px; font-family:monospace; color:#b45309;">' + escapeHtml(job.itemTag || 'TAG-N/A') + '</strong>' +
    '</div>' +
    '<div style="display:flex; justify-content:space-between; margin-bottom:2px;">' +
    '<span>Intake Date:</span>' +
    '<span>' + escapeHtml(job.intakeDate || formatDate(new Date())) + '</span>' +
    '</div>' +
    '<div style="display:flex; justify-content:space-between; margin-bottom:2px;">' +
    '<span>Customer:</span>' +
    '<strong>' + escapeHtml(job.customerName) + '</strong>' +
    '</div>' +
    '<div style="display:flex; justify-content:space-between; margin-bottom:2px;">' +
    '<span>Contact:</span>' +
    '<span>' + escapeHtml(job.customerPhone) + '</span>' +
    '</div>' +
    '<div style="border-top:1px dotted #888; margin:5px 0;"></div>' +
    '<div style="margin-bottom:2px;">' +
    '<strong>Device:</strong> ' + escapeHtml(job.deviceType || '') + (job.brandModel ? ' • ' + escapeHtml(job.brandModel) : '') +
    '</div>' +
    '<div style="margin-bottom:2px;">' +
    '<strong>Fault:</strong> ' + escapeHtml(job.fault || 'Not specified') +
    '</div>' +
    (job.accessories ? '<div style="margin-bottom:2px;"><strong>Accessories:</strong> ' + escapeHtml(job.accessories) + '</div>' : '') +
    '<div style="border-top:1px dotted #888; margin:5px 0;"></div>' +
    '<div style="display:flex; justify-content:space-between; font-size:11px; margin-top:3px;">' +
    '<strong>Est. Repair Fee:</strong>' +
    '<strong style="font-size:12px;">' + formatCurrency(job.estimatedCost || 0) + '</strong>' +
    '</div>' +
    '</div>' +
    '<div style="margin:8px auto 4px auto; text-align:center; width:150px;">' +
    '<div style="height:22px; background:repeating-linear-gradient(90deg, #000 0px, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 5px, #fff 5px, #fff 8px, #000 8px, #000 11px, #fff 11px, #fff 13px, #000 13px, #000 16px, #fff 16px, #fff 18px); margin-bottom:2px;"></div>' +
    '<div style="font-size:8.5px; letter-spacing:1px; font-family:monospace;">*' + escapeHtml(job.jobId) + '*</div>' +
    '</div>' +
    '<div style="font-size:7.5px; color:#555; text-align:center; line-height:1.2; margin-top:6px; border-top:1px dashed #000; padding-top:4px;">' +
    'Please retain this ticket to collect equipment.<br>' +
    'උපකරණය ලබාගැනීමට මෙම පත්‍රිකාව ඉදිරිපත් කරන්න.<br>' +
    'Items not claimed within 30 days are not our responsibility.' +
    '</div>';

  modal.classList.add('active');
}

function closeJobSlipModal() {
  const modal = document.getElementById('modal-job-slip');
  if (modal) modal.classList.remove('active');
  activeJobSlipId = null;
}

function printJobSlip() {
  const area = document.getElementById('job-slip-print-area');
  if (!area) return;

  let iframe = document.getElementById('receipt-print-frame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'receipt-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Intake Sticker</title><style>@page { size: 80mm auto; margin: 0; } body { font-family: Courier New, monospace; width: 72mm; margin: 0 auto; padding: 6mm 2mm; color: #000; font-size: 10px; }</style></head><body>' + area.innerHTML + '<script>window.onload=function(){window.focus();window.print();};<\/script></body></html>');
  doc.close();
}

function sendJobStatusWhatsapp(id) {
  const job = repairJobs.find(j => j.id === id);
  if (!job) return;

  let cleanPhone = (job.customerPhone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    cleanPhone = '94' + cleanPhone.substring(1);
  }

  const statusNote = (job.status === 'Ready for Pickup')
    ? '✅ *GOOD NEWS:* Your equipment has been fully repaired, bench-tested, and is ready for pickup!\nඔබගේ උපකරණය සාර්ථකව අලුත්වැඩියා කර අවසන් බැවින් අපගේ ආයතනයෙන් ලබාගත හැක.'
    : (job.status === 'Awaiting Parts')
    ? '⏳ *STATUS UPDATE:* We are awaiting necessary spare parts to complete your repair. We will update you shortly.\nඅමතර කොටස් සපයා ගනිමින් පවතී.'
    : (job.status === 'Diagnosing')
    ? '🔍 *STATUS UPDATE:* Your equipment is currently on the diagnosis bench with our technician.\nපරීක්ෂා කරමින් පවතී.'
    : ('*STATUS UPDATE:* Current status is *' + job.status + '*.');

  const msg = '*RECITAL ELECTRONIC - Repair Status Update*\n' +
    'Dear ' + job.customerName + ',\n\n' +
    'Ticket ID: *#' + job.jobId + '*\n' +
    (job.itemTag ? ('Item Tag / Serial: *' + job.itemTag + '*\n') : '') +
    'Device: *' + job.deviceType + (job.brandModel ? (' ' + job.brandModel) : '') + '*\n' +
    'Reported Issue: ' + (job.fault || '-') + '\n' +
    'Est. Repair Fee: *' + formatCurrency(job.estimatedCost || 0) + '*\n\n' +
    statusNote + '\n\n' +
    '📍 *Location:* 583/2, Dewata Road, Kudhanelumkulama, Anuradhapura\n' +
    '📞 *Hotline:* 0763366993\n' +
    'Thank you for trusting Recital Electronic! 🙏';

  const url = 'https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

function convertJobToInvoice(id) {
  const job = repairJobs.find(j => j.id === id);
  if (!job) return;

  isPosCartDeducted = false;
  const serviceItem = {
    id: 'rep-' + job.id,
    nameEn: 'Repair Service: ' + job.deviceType + ' ' + (job.brandModel || '') + ' (' + (job.fault || '') + ')',
    nameSi: 'අලුත්වැඩියා සේවාව: ' + job.deviceType + ' ' + (job.brandModel || ''),
    type: 'service',
    price: job.estimatedCost || 0,
    qty: 1
  };

  posCart.push(serviceItem);

  const cName = document.getElementById('pos-cust-name');
  if (cName) cName.value = job.customerName || '';
  const cPhone = document.getElementById('pos-cust-phone');
  if (cPhone) cPhone.value = job.customerPhone || '';

  renderPosCart();
  switchMainTab('pos');
  showToast(state.currentLang === 'si' ? 'අලුත්වැඩියාව POS බිල්පතට එක්කරන ලදී!' : 'Repair service loaded into POS Bill!');
}

// ==========================================
// MODULE 2: Sound System Hire & Event Bookings
// ==========================================
const DEFAULT_HIRE_BOOKINGS = [
  {
    id: 'hire-1',
    bookingId: 'RE-HIRE-20261125-01',
    customerName: 'Anuradhapura Youth Sports Club',
    customerPhone: '0763366993',
    eventDate: '2026-11-25',
    venue: 'Town Hall Ground, Anuradhapura',
    package: 'Sound System Hire (Standard Package)',
    totalAmount: 25000,
    advancePaid: 10000,
    status: 'Confirmed',
    checklist: '4x Mics, 8ch Mixer, 2x 15-inch tops, 2x Stands, Speakon cables',
    createdAt: '2026-11-18T11:00:00.000Z'
  },
  {
    id: 'hire-2',
    bookingId: 'RE-HIRE-20261205-02',
    customerName: 'Sathsara Musical Festival',
    customerPhone: '0776543210',
    eventDate: '2026-12-05',
    venue: 'Hotel Miridiya Outdoor Stage',
    package: 'Sound System Hire (Full Stage Setup)',
    totalAmount: 65000,
    advancePaid: 25000,
    status: 'Confirmed',
    checklist: 'Full Stage Line-Array, 4x Bass Bins, 16ch Digital Mixer, Stage Monitors, 6x Wireless Mics',
    createdAt: '2026-11-17T16:00:00.000Z'
  }
];

function loadHireBookings() {
  try {
    const saved = localStorage.getItem('recital_hire_bookings');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_HIRE_BOOKINGS.slice();
}

function persistHireBookings(b) {
  localStorage.setItem('recital_hire_bookings', JSON.stringify(b));
  if (window.firebaseDB && window.firebaseDB.isInitialized && !window.firebaseDB.isSyncing) {
    b.forEach(booking => {
      const id = booking.bookingId || booking.id || ('HIRE-' + Date.now());
      window.firebaseDB.saveItem('hire_bookings', id, booking);
    });
  }
}

var hireBookings = loadHireBookings();
var currentHireFilter = 'all';
var currentHireDatePreset = 'all';
var currentHireDateFrom = '';
var currentHireDateTo = '';
var currentHireSearch = '';
var editingHireId = null;

function handleHireSearch(query) {
  currentHireSearch = (query || '').toLowerCase().trim();
  renderHireView();
}

function clearHireSearch() {
  currentHireSearch = '';
  const inp = document.getElementById('hire-search-input');
  if (inp) inp.value = '';
  renderHireView();
}

function handleHireDatePreset(preset) {
  currentHireDatePreset = preset;
  const wrap = document.getElementById('hire-custom-date-wrap');
  if (wrap) wrap.style.display = (preset === 'custom') ? 'inline-flex' : 'none';

  if (preset === 'custom') {
    const today = formatDate(new Date());
    const fromInp = document.getElementById('hire-date-from');
    const toInp = document.getElementById('hire-date-to');
    if (fromInp && !fromInp.value) fromInp.value = today;
    if (toInp && !toInp.value) toInp.value = today;
    currentHireDateFrom = fromInp ? fromInp.value : '';
    currentHireDateTo = toInp ? toInp.value : '';
  }
  renderHireView();
}

function handleHireDateChange() {
  const fromInp = document.getElementById('hire-date-from');
  const toInp = document.getElementById('hire-date-to');
  currentHireDateFrom = fromInp ? fromInp.value : '';
  currentHireDateTo = toInp ? toInp.value : '';
  renderHireView();
}

function setHireFilter(status) {
  currentHireFilter = status;
  ['all', 'confirmed', 'dispatched', 'completed'].forEach(p => {
    const el = document.getElementById('hire-pill-' + p);
    if (el) el.classList.remove('active');
  });

  const activePill = document.getElementById('hire-pill-' + (status === 'all' ? 'all' : (status === 'Confirmed' ? 'confirmed' : (status === 'Dispatched' ? 'dispatched' : 'completed'))));
  if (activePill) activePill.classList.add('active');

  renderHireView();
}

function getFilteredHireBookings() {
  return hireBookings.filter(b => {
    // 1. Status Filter
    if (currentHireFilter !== 'all' && b.status !== currentHireFilter) {
      return false;
    }

    // 2. Date Filter
    if (currentHireDatePreset !== 'all') {
      const eventDateStr = (b.eventDate || '').substring(0, 10);
      const today = new Date();
      const todayStr = formatDate(today);
      if (currentHireDatePreset === 'upcoming') {
        if (eventDateStr < todayStr) return false;
      } else if (currentHireDatePreset === 'this_month') {
        if (!eventDateStr.startsWith(todayStr.substring(0, 7))) return false;
      } else if (currentHireDatePreset === 'past') {
        if (eventDateStr >= todayStr) return false;
      } else if (currentHireDatePreset === 'custom') {
        if (currentHireDateFrom && eventDateStr < currentHireDateFrom) return false;
        if (currentHireDateTo && eventDateStr > currentHireDateTo) return false;
      }
    }

    // 3. Search Filter
    if (currentHireSearch) {
      const q = currentHireSearch;
      const cleanQ = q.replace(/[^0-9]/g, '');
      const cleanPhone = (b.customerPhone || '').replace(/[^0-9]/g, '');
      const matchPhone = cleanQ.length >= 3 && cleanPhone.includes(cleanQ);
      const matchId = (b.bookingId || '').toLowerCase().includes(q);
      const matchCustomer = (b.customerName || '').toLowerCase().includes(q);
      const matchVenue = (b.venue || '').toLowerCase().includes(q);
      const matchPackage = (b.package || '').toLowerCase().includes(q);

      if (!matchPhone && !matchId && !matchCustomer && !matchVenue && !matchPackage) {
        return false;
      }
    }
    return true;
  });
}

function generateNextHireId() {
  const now = new Date();
  const dateCode = now.getFullYear().toString() +
                   String(now.getMonth() + 1).padStart(2, '0') +
                   String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(10 + Math.random() * 90);
  return 'RE-HIRE-' + dateCode + '-' + rand;
}

function openNewHireBookingModal() {
  editingHireId = null;
  const modal = document.getElementById('modal-hire-booking');
  if (!modal) return;

  const title = document.getElementById('ui-modal-hire-title');
  if (title) title.textContent = state.currentLang === 'si' ? '📅 නව ශබ්ද පද්ධති වෙන්කිරීමක් (Sound Hire)' : '📅 Book Sound System Hire & Event';

  document.getElementById('hire-input-cust-name').value = '';
  document.getElementById('hire-input-cust-phone').value = '';
  document.getElementById('hire-input-date').value = formatDate(new Date());
  document.getElementById('hire-input-venue').value = '';
  document.getElementById('hire-input-package').value = 'Sound System Hire (Standard Package)';
  document.getElementById('hire-input-status').value = 'Confirmed';
  document.getElementById('hire-input-total').value = '25000';
  document.getElementById('hire-input-advance').value = '5000';
  document.getElementById('hire-input-checklist').value = '4x Mics, 8ch Mixer, 2x 15-inch tops, 2x Stands, Speakon cables';

  modal.classList.add('active');
}

function closeHireBookingModal() {
  const modal = document.getElementById('modal-hire-booking');
  if (modal) modal.classList.remove('active');
  editingHireId = null;
}

function saveHireBooking() {
  const custName = document.getElementById('hire-input-cust-name').value.trim();
  const custPhone = document.getElementById('hire-input-cust-phone').value.trim();
  const eventDate = document.getElementById('hire-input-date').value;
  const venue = document.getElementById('hire-input-venue').value.trim();
  const pkg = document.getElementById('hire-input-package').value;
  const status = document.getElementById('hire-input-status').value;
  const total = parseFloat(document.getElementById('hire-input-total').value) || 0;
  const advance = parseFloat(document.getElementById('hire-input-advance').value) || 0;
  const checklist = document.getElementById('hire-input-checklist').value.trim();

  if (!custName || !custPhone || !eventDate || !venue) {
    alert(state.currentLang === 'si' ? 'කරුණාකර පාරිභෝගික නම, දුරකථනය, දිනය සහ ස්ථානය ඇතුළත් කරන්න.' : 'Please enter customer name, phone, date, and venue.');
    return;
  }

  if (editingHireId) {
    const booking = hireBookings.find(b => b.id === editingHireId);
    if (booking) {
      booking.customerName = custName;
      booking.customerPhone = custPhone;
      booking.eventDate = eventDate;
      booking.venue = venue;
      booking.package = pkg;
      booking.status = status;
      booking.totalAmount = total;
      booking.advancePaid = advance;
      booking.checklist = checklist;
    }
    showToast(state.currentLang === 'si' ? 'වෙන්කිරීම යාවත්කාලීන කරන ලදී!' : 'Hire booking updated successfully!');
  } else {
    const newBooking = {
      id: 'hire-' + Date.now(),
      bookingId: generateNextHireId(),
      customerName: custName,
      customerPhone: custPhone,
      eventDate: eventDate,
      venue: venue,
      package: pkg,
      status: status,
      totalAmount: total,
      advancePaid: advance,
      checklist: checklist,
      createdAt: new Date().toISOString()
    };
    hireBookings.unshift(newBooking);
    showToast(state.currentLang === 'si' ? 'වෙන්කිරීම සාර්ථකව සුරකින ලදී!' : 'Sound hire booking saved!');
  }

  persistHireBookings(hireBookings);
  closeHireBookingModal();
  renderHireView();
}

function editHireBooking(id) {
  const booking = hireBookings.find(b => b.id === id);
  if (!booking) return;

  editingHireId = id;
  const modal = document.getElementById('modal-hire-booking');
  if (!modal) return;

  const title = document.getElementById('ui-modal-hire-title');
  if (title) title.textContent = state.currentLang === 'si' ? '📅 වෙන්කිරීම සංස්කරණය' : '📅 Edit Sound Hire Booking';

  document.getElementById('hire-input-cust-name').value = booking.customerName || '';
  document.getElementById('hire-input-cust-phone').value = booking.customerPhone || '';
  document.getElementById('hire-input-date').value = booking.eventDate || formatDate(new Date());
  document.getElementById('hire-input-venue').value = booking.venue || '';
  document.getElementById('hire-input-package').value = booking.package || 'Sound System Hire (Standard Package)';
  document.getElementById('hire-input-status').value = booking.status || 'Confirmed';
  document.getElementById('hire-input-total').value = booking.totalAmount || 0;
  document.getElementById('hire-input-advance').value = booking.advancePaid || 0;
  document.getElementById('hire-input-checklist').value = booking.checklist || '';

  modal.classList.add('active');
}

function deleteHireBooking(id) {
  const booking = hireBookings.find(b => b.id === id);
  if (!booking) return;

  if (confirm(state.currentLang === 'si' ? 'මෙම වෙන්කිරීම (' + booking.bookingId + ') මකා දැමීමට අවශ්‍ය බව සහතිකද?' : 'Are you sure you want to delete booking ' + booking.bookingId + '?')) {
    hireBookings = hireBookings.filter(b => b.id !== id);
    persistHireBookings(hireBookings);
    renderHireView();
    showToast(state.currentLang === 'si' ? 'වෙන්කිරීම මකා දමන ලදී!' : 'Booking deleted!');
  }
}

function renderHireView() {
  const tbody = document.getElementById('hire-tab-table-body');
  if (!tbody) return;

  const isSi = (state.currentLang === 'si');

  // Metrics
  const upcomingCount = hireBookings.filter(b => b.status === 'Confirmed' || b.status === 'Dispatched').length;
  let totalAdvance = 0;
  let totalPending = 0;
  let totalRevenue = 0;

  hireBookings.forEach(b => {
    totalRevenue += (b.totalAmount || 0);
    totalAdvance += (b.advancePaid || 0);
    const balance = Math.max(0, (b.totalAmount || 0) - (b.advancePaid || 0));
    if (b.status !== 'Completed' && b.status !== 'Cancelled') {
      totalPending += balance;
    }
  });

  const elUp = document.getElementById('hire-val-upcoming');
  if (elUp) elUp.textContent = upcomingCount;
  const elAdv = document.getElementById('hire-val-advances');
  if (elAdv) elAdv.textContent = formatCurrency(totalAdvance);
  const elPend = document.getElementById('hire-val-pending');
  if (elPend) elPend.textContent = formatCurrency(totalPending);
  const elRev = document.getElementById('hire-val-revenue');
  if (elRev) elRev.textContent = formatCurrency(totalRevenue);

  const filtered = getFilteredHireBookings();
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:36px 16px; color:#64748b; font-size:13.5px;">🔍 ' + (isSi ? 'ගැලපෙන කිසිදු ශබ්ද කුලියට දීමේ වෙන්කිරීමක් හමු නොවීය.' : 'No matching sound hire bookings found.') + '</td></tr>';
    return;
  }

  filtered.forEach(b => {
    const tr = document.createElement('tr');
    const balanceDue = Math.max(0, (b.totalAmount || 0) - (b.advancePaid || 0));

    let badgeClass = 'badge-hire-confirmed';
    if (b.status === 'Dispatched') badgeClass = 'badge-hire-dispatched';
    else if (b.status === 'Completed') badgeClass = 'badge-hire-completed';
    else if (b.status === 'Cancelled') badgeClass = 'badge-hire-cancelled';

    tr.innerHTML = '<td><strong style="color:#0052cc; font-family:monospace; font-size:13px;">' + escapeHtml(b.bookingId || '') + '</strong></td>' +
      '<td style="font-weight:700; color:#0f172a; font-size:12.5px; white-space:nowrap;">📅 ' + escapeHtml(b.eventDate || '') + '</td>' +
      '<td>' +
      '<div style="font-weight:700; color:#0f172a; font-size:13px;">' + escapeHtml(b.customerName) + '</div>' +
      '<div style="font-size:11.5px; color:#64748b; margin-top:2px;">' +
      '<a href="tel:' + escapeHtml(b.customerPhone) + '" style="color:#0284c7; text-decoration:none;">📞 ' + escapeHtml(b.customerPhone) + '</a>' +
      '</div>' +
      '</td>' +
      '<td>' +
      '<div style="font-weight:700; color:#1e293b; font-size:12.5px;">' + escapeHtml(b.package || '') + '</div>' +
      '<div style="font-size:11.5px; color:#64748b; margin-top:2px;">📍 ' + escapeHtml(b.venue || '') + '</div>' +
      (b.checklist ? ('<div style="font-size:10.5px; color:#94a3b8; margin-top:2px;">Gear: ' + escapeHtml(b.checklist) + '</div>') : '') +
      '</td>' +
      '<td style="text-align:right; font-weight:800; color:#0f172a; font-size:13px;">' + formatCurrency(b.totalAmount || 0) + '</td>' +
      '<td style="text-align:right; font-size:12px;">' +
      '<div style="color:#059669; font-weight:700;">Adv: ' + formatCurrency(b.advancePaid || 0) + '</div>' +
      '<div style="color:' + (balanceDue > 0 ? '#dc2626' : '#64748b') + '; font-weight:700; margin-top:2px;">Due: ' + formatCurrency(balanceDue) + '</div>' +
      '</td>' +
      '<td style="text-align:center;"><span class="' + badgeClass + '">' + escapeHtml(b.status) + '</span></td>' +
      '<td style="text-align:center;">' +
      '<div class="hist-action-group">' +
      '<button type="button" class="btn btn-outline btn-sm" onclick="sendHireBookingWhatsapp(\'' + b.id + '\')" title="Send WhatsApp Booking Confirmation">💬 WA</button>' +
      '<button type="button" class="btn btn-outline btn-sm" onclick="convertHireToInvoice(\'' + b.id + '\')" title="Convert to Official Invoice">📄 ' + (isSi ? 'ඉන්වොයිස්' : 'Invoice') + '</button>' +
      '<button type="button" class="btn btn-outline btn-sm" onclick="editHireBooking(\'' + b.id + '\')" title="Edit">✏️</button>' +
      '<button type="button" class="btn btn-danger-outline btn-sm" onclick="deleteHireBooking(\'' + b.id + '\')" title="Delete">🗑️</button>' +
      '</div>' +
      '</td>';
    tbody.appendChild(tr);
  });
}

function sendHireBookingWhatsapp(id) {
  const b = hireBookings.find(x => x.id === id);
  if (!b) return;

  let cleanPhone = (b.customerPhone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    cleanPhone = '94' + cleanPhone.substring(1);
  }

  const balance = Math.max(0, (b.totalAmount || 0) - (b.advancePaid || 0));

  const msg = '*RECITAL ELECTRONIC - Sound Hire & Event Booking Confirmation*\n' +
    'Dear ' + b.customerName + ',\n\n' +
    'Booking No: *#' + b.bookingId + '*\n' +
    'Package: *' + b.package + '*\n' +
    'Event Date: *' + b.eventDate + '*\n' +
    'Venue: *' + b.venue + '*\n' +
    (b.checklist ? ('Equipment Checklist: ' + b.checklist + '\n') : '') +
    '---------------------------\n' +
    'Agreed Total: *' + formatCurrency(b.totalAmount || 0) + '*\n' +
    'Advance Paid: *' + formatCurrency(b.advancePaid || 0) + '*\n' +
    'Remaining Balance: *' + formatCurrency(balance) + '*\n' +
    'Status: *' + b.status + '*\n\n' +
    'Bank details for balance settlement:\n' +
    'Bank: ' + state.settings.bankName + '\n' +
    'Account: ' + state.settings.accountNumber + ' (' + state.settings.accountName + ')\n' +
    'Branch: ' + state.settings.branch + '\n\n' +
    'Hotline: 0763366993\n' +
    'Thank you for choosing Recital Electronic! 🎶';

  const url = 'https://api.whatsapp.com/send?phone=' + cleanPhone + '&text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

function convertHireToInvoice(id) {
  const b = hireBookings.find(x => x.id === id);
  if (!b) return;

  state.doc.customer.name = b.customerName || '';
  state.doc.customer.phone = b.customerPhone || '';
  state.doc.customer.address = b.venue || '';
  state.doc.date = formatDate(new Date());

  state.doc.items = [
    {
      id: 'hire-' + b.id,
      description: b.package + ' - Event at ' + b.venue + ' on ' + b.eventDate + (b.checklist ? ' (' + b.checklist + ')' : ''),
      qty: 1,
      unitPrice: b.totalAmount || 0,
      amount: b.totalAmount || 0
    }
  ];

  state.doc.advance = b.advancePaid || 0;
  state.doc.discount = 0;
  state.doc.delivery = 0;

  setDocType('invoice');
  syncFormWithState();
  updateLivePreview();
  switchMainTab('generator');
  showToast(state.currentLang === 'si' ? 'වෙන්කිරීම ඉන්වොයිසියක් බවට පත් කරන ලදී!' : 'Booking loaded into official Invoice!');
}

// ==========================================
// MODULE 5: Profit & Loss, COGS & Daily Z-Report
// ==========================================
var reportsSelectedDate = formatDate(new Date());

function onReportsDateChange(val) {
  if (!val) return;
  reportsSelectedDate = val;
  const disp = document.getElementById('reports-date-display');
  const todayStr = formatDate(new Date());
  if (disp) {
    disp.textContent = (val === todayStr) ? 'Today (' + val + ')' : val;
  }
  const lblGross = document.getElementById('rep-lbl-gross');
  if (lblGross) {
    lblGross.textContent = (val === todayStr) ? "Today's Gross Sales" : "Sales on " + val;
  }
  const lblCash = document.getElementById('rep-lbl-cash');
  if (lblCash) {
    lblCash.textContent = (val === todayStr) ? "Cash in Drawer (Today)" : "Cash on " + val;
  }
  renderReportsView();
}

function setReportsDateToday() {
  const today = formatDate(new Date());
  const inp = document.getElementById('reports-selected-date');
  if (inp) inp.value = today;
  onReportsDateChange(today);
}

function setReportsDateYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yest = formatDate(d);
  const inp = document.getElementById('reports-selected-date');
  if (inp) inp.value = yest;
  onReportsDateChange(yest);
}

function renderReportsView() {
  const history = getSavedDocsHistory();
  const targetDate = reportsSelectedDate || formatDate(new Date());

  const dateInp = document.getElementById('reports-selected-date');
  if (dateInp && !dateInp.value) dateInp.value = targetDate;

  let periodGrossSales = 0;
  let periodEstimatedCogs = 0;
  let periodCashInDrawer = 0;

  const periodDocs = history.filter(d => {
    const docDate = d.date ? d.date.substring(0, 10) : '';
    return docDate === targetDate;
  });

  periodDocs.forEach(doc => {
    const total = parseFloat(doc.grandTotal) || 0;
    const paid = parseFloat(doc.paid !== undefined ? doc.paid : (doc.advance || 0));

    periodGrossSales += total;
    if (doc.type === 'receipt') {
      periodCashInDrawer += (paid > 0 ? paid : total);
    } else {
      periodCashInDrawer += paid;
    }

    (doc.items || []).forEach(it => {
      const catItem = storeCatalog.find(c =>
        (c.id && it.id && c.id === it.id) ||
        (c.nameEn && it.nameEn && c.nameEn.toLowerCase() === it.nameEn.toLowerCase()) ||
        (c.nameEn && it.description && c.nameEn.toLowerCase() === it.description.toLowerCase())
      );
      const qty = parseFloat(it.qty) || 1;
      let cost = 0;
      if (catItem) {
        cost = catItem.costPrice !== undefined ? catItem.costPrice : (catItem.type === 'item' ? Math.round(catItem.price * 0.7) : 0);
      } else {
        const itemPrice = parseFloat(it.price || it.unitPrice) || 0;
        cost = it.type === 'service' ? 0 : Math.round(itemPrice * 0.7);
      }
      periodEstimatedCogs += (cost * qty);
    });
  });

  const periodNetProfit = Math.max(0, periodGrossSales - periodEstimatedCogs);

  const elGross = document.getElementById('rep-val-gross');
  if (elGross) elGross.textContent = formatCurrency(periodGrossSales);
  const elCogs = document.getElementById('rep-val-cogs');
  if (elCogs) elCogs.textContent = formatCurrency(periodEstimatedCogs);
  const elProfit = document.getElementById('rep-val-profit');
  if (elProfit) elProfit.textContent = formatCurrency(periodNetProfit);
  const elCash = document.getElementById('rep-val-cash');
  if (elCash) elCash.textContent = formatCurrency(periodCashInDrawer);

  const tbody = document.getElementById('cogs-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const isSi = (state.currentLang === 'si');

  storeCatalog.forEach(item => {
    const isService = item.type === 'service';
    const defaultCost = isService ? 0 : Math.round(item.price * 0.7);
    const costVal = (item.costPrice !== undefined) ? item.costPrice : defaultCost;
    const marginRs = item.price - costVal;
    const marginPct = item.price > 0 ? ((marginRs / item.price) * 100).toFixed(1) : 0;

    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' +
      '<div style="font-weight:700; color:#0f172a; font-size:13px;">' + escapeHtml(item.nameEn) + '</div>' +
      '<div style="font-size:11.5px; color:#64748b; margin-top:2px;">' + escapeHtml(item.nameSi) + '</div>' +
      '<span class="pos-card-badge ' + (isService ? 'badge-service' : 'badge-item') + '" style="margin-top:3px; display:inline-block; font-size:10px;">' +
      (isService ? 'Service' : 'Item Selling') +
      '</span>' +
      '</td>' +
      '<td>' +
      '<input type="number" class="cogs-cost-input" id="cogs-input-' + item.id + '" value="' + costVal + '" min="0" step="any">' +
      '</td>' +
      '<td style="font-weight:800; color:#0052cc;">' +
      formatCurrency(item.price) +
      '</td>' +
      '<td style="font-weight:700; color:' + (marginRs >= 0 ? '#059669' : '#dc2626') + ';">' +
      formatCurrency(marginRs) +
      '</td>' +
      '<td>' +
      '<span style="font-weight:800; color:' + (marginPct >= 20 ? '#059669' : '#d97706') + '; font-size:12px;">' +
      marginPct + '%' +
      '</span>' +
      '</td>' +
      '<td style="text-align:center;">' +
      '<button type="button" class="btn btn-primary btn-sm" onclick="saveProductCost(\'' + item.id + '\')" style="padding:4px 10px; font-size:11.5px;">💾 ' + (isSi ? 'සුරකින්න' : 'Save') + '</button>' +
      '</td>';
    tbody.appendChild(tr);
  });
}

function saveProductCost(id) {
  const item = storeCatalog.find(x => x.id === id);
  if (!item) return;

  const inp = document.getElementById('cogs-input-' + id);
  if (!inp) return;

  const newCost = Math.max(0, parseFloat(inp.value) || 0);
  item.costPrice = newCost;
  persistStoreCatalog(storeCatalog);

  renderReportsView();
  showToast(state.currentLang === 'si' ? 'වියදම් මිල (COGS) යාවත්කාලීන විය!' : 'Product cost price saved!');
}

function openZReportModal() {
  const modal = document.getElementById('modal-z-report');
  const printArea = document.getElementById('z-report-print-area');
  if (!modal || !printArea) return;

  const history = getSavedDocsHistory();
  const reportDateStr = reportsSelectedDate || formatDate(new Date());
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const targetDocs = history.filter(d => {
    const docDate = d.date ? d.date.substring(0, 10) : '';
    return docDate === reportDateStr;
  });

  let invoicesCount = 0;
  let receiptsCount = 0;
  let quotationsCount = 0;
  let grossSales = 0;
  let totalDiscounts = 0;
  let totalCashCollected = 0;
  let totalPendingReceivables = 0;
  let totalCogs = 0;

  targetDocs.forEach(d => {
    const type = (d.type || '').toLowerCase();
    if (type === 'invoice') invoicesCount++;
    else if (type === 'receipt') receiptsCount++;
    else if (type === 'quotation') quotationsCount++;

    const sub = parseFloat(d.subtotal) || 0;
    const disc = parseFloat(d.discount) || 0;
    const tot = parseFloat(d.grandTotal) || 0;
    const paid = parseFloat(d.paid !== undefined ? d.paid : (d.advance || 0));

    grossSales += sub;
    totalDiscounts += disc;

    if (type === 'receipt') {
      totalCashCollected += (paid > 0 ? paid : tot);
    } else if (type === 'invoice') {
      totalCashCollected += paid;
      if (d.status !== 'Paid') {
        totalPendingReceivables += Math.max(0, tot - paid);
      }
    }

    (d.items || []).forEach(it => {
      const catItem = storeCatalog.find(c =>
        (c.id && it.id && c.id === it.id) ||
        (c.nameEn && it.nameEn && c.nameEn.toLowerCase() === it.nameEn.toLowerCase()) ||
        (c.nameEn && it.description && c.nameEn.toLowerCase() === it.description.toLowerCase())
      );
      const qty = parseFloat(it.qty) || 1;
      let cost = 0;
      if (catItem) {
        cost = catItem.costPrice !== undefined ? catItem.costPrice : (catItem.type === 'item' ? Math.round(catItem.price * 0.7) : 0);
      } else {
        const itemPrice = parseFloat(it.price || it.unitPrice) || 0;
        cost = it.type === 'service' ? 0 : Math.round(itemPrice * 0.7);
      }
      totalCogs += (cost * qty);
    });
  });

  const netSales = Math.max(0, grossSales - totalDiscounts);
  const netProfit = Math.max(0, netSales - totalCogs);

  printArea.innerHTML = '<div style="text-align:center; padding-bottom:8px; border-bottom:1px dashed #000;">' +
    '<div style="font-weight:900; font-size:15px; letter-spacing:0.5px; text-transform:uppercase;">RECITAL ELECTRONIC</div>' +
    '<div style="font-size:9.5px; font-weight:700;">SOUND SYSTEMS &amp; ELECTRONIC SOLUTIONS</div>' +
    '<div style="font-size:8.5px; color:#444;">583/2, Dewata Rd, Kudhanelumkulama, Anuradhapura</div>' +
    '<div style="font-size:9px; font-weight:700; margin-top:2px;">Tel: 0763366993 • Reg: NCP/NPE/004141</div>' +
    '</div>' +
    '<div style="text-align:center; margin:8px 0 6px 0; background:#f1f5f9; padding:5px; border-radius:3px;">' +
    '<div style="font-weight:900; font-size:12px; letter-spacing:1px;">DAILY Z-REPORT (DAY CLOSING)</div>' +
    '<div style="font-size:9.5px; color:#475569;">දෛනික ගිණුම් අවසන් කිරීමේ වාර්තාව</div>' +
    '</div>' +
    '<div style="font-size:10px; line-height:1.4; margin:6px 0;">' +
    '<div style="display:flex; justify-content:space-between;"><span>DATE:</span> <strong>' + reportDateStr + '</strong></div>' +
    '<div style="display:flex; justify-content:space-between;"><span>CLOSING TIME:</span> <strong>' + timeStr + '</strong></div>' +
    '<div style="display:flex; justify-content:space-between;"><span>TERMINAL:</span> <span>Counter 01 / Main POS</span></div>' +
    '<div style="display:flex; justify-content:space-between;"><span>CASHIER:</span> <span>Recital Admin</span></div>' +
    '<div style="border-top:1px dashed #000; margin:6px 0;"></div>' +
    '<div style="font-weight:900; font-size:10.5px; margin-bottom:3px;">DOCUMENT COUNTS</div>' +
    '<div style="display:flex; justify-content:space-between;"><span>Official Invoices Issued:</span> <strong>' + invoicesCount + '</strong></div>' +
    '<div style="display:flex; justify-content:space-between;"><span>Thermal POS Cash Receipts:</span> <strong>' + receiptsCount + '</strong></div>' +
    '<div style="display:flex; justify-content:space-between;"><span>Quotations Drafted:</span> <strong>' + quotationsCount + '</strong></div>' +
    '<div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px dotted #888; padding-top:2px; margin-top:2px;"><span>Total Transactions:</span> <strong>' + targetDocs.length + '</strong></div>' +
    '<div style="border-top:1px dashed #000; margin:6px 0;"></div>' +
    '<div style="font-weight:900; font-size:10.5px; margin-bottom:3px;">FINANCIAL BREAKDOWN</div>' +
    '<div style="display:flex; justify-content:space-between;"><span>Gross Subtotal:</span> <span>' + formatCurrency(grossSales) + '</span></div>' +
    '<div style="display:flex; justify-content:space-between;"><span>Discounts Given:</span> <span>- ' + formatCurrency(totalDiscounts) + '</span></div>' +
    '<div style="display:flex; justify-content:space-between; font-weight:800; font-size:11px; margin-top:2px;"><span>NET SALES:</span> <strong>' + formatCurrency(netSales) + '</strong></div>' +
    '<div style="border-top:1px dotted #888; margin:5px 0;"></div>' +
    '<div style="display:flex; justify-content:space-between; font-weight:800; color:#000; font-size:11.5px; background:#f8fafc; padding:2px 0;">' +
    '<span>CASH IN DRAWER (TODAY):</span> <strong style="font-size:12.5px;">' + formatCurrency(totalCashCollected) + '</strong>' +
    '</div>' +
    '<div style="display:flex; justify-content:space-between; color:#dc2626; font-size:10px; margin-top:2px;"><span>Pending Receivables (Dues):</span> <strong>' + formatCurrency(totalPendingReceivables) + '</strong></div>' +
    '<div style="border-top:1px dashed #000; margin:6px 0;"></div>' +
    '<div style="font-weight:900; font-size:10.5px; margin-bottom:3px;">ESTIMATED PROFITABILITY</div>' +
    '<div style="display:flex; justify-content:space-between;"><span>Estimated COGS (Cost):</span> <span>' + formatCurrency(totalCogs) + '</span></div>' +
    '<div style="display:flex; justify-content:space-between; font-weight:800; font-size:11.5px; color:#059669; margin-top:2px;"><span>ESTIMATED NET PROFIT:</span> <strong>' + formatCurrency(netProfit) + '</strong></div>' +
    '</div>' +
    '<div style="border-top:1px dashed #000; margin:16px 0 6px 0; padding-top:14px; display:flex; justify-content:space-between; font-size:9.5px;">' +
    '<div style="text-align:center;"><div>___________________</div><div style="margin-top:2px;">Cashier Signature</div></div>' +
    '<div style="text-align:center;"><div>___________________</div><div style="margin-top:2px;">Manager Verified</div></div>' +
    '</div>';

  modal.classList.add('active');
}

function closeZReportModal() {
  const modal = document.getElementById('modal-z-report');
  if (modal) modal.classList.remove('active');
}

function printZReport() {
  const area = document.getElementById('z-report-print-area');
  if (!area) return;

  let iframe = document.getElementById('receipt-print-frame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'receipt-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Daily Z-Report</title><style>@page { size: 80mm auto; margin: 0; } body { font-family: Courier New, monospace; width: 74mm; margin: 0 auto; padding: 6mm 2mm; color: #000; font-size: 10.5px; }</style></head><body>' + area.innerHTML + '<script>window.onload=function(){window.focus();window.print();};<\/script></body></html>');
  doc.close();
}

function exportSalesCsv() {
  const history = getSavedDocsHistory();
  if (history.length === 0) {
    alert(state.currentLang === 'si' ? 'අපනයනය කිරීමට කිසිදු ලේඛනයක් නැත.' : 'No sales or document records found to export.');
    return;
  }

  let csv = 'Document Number,Type,Date,Customer Name,Phone,Subtotal,Discount,Grand Total,Paid Amount,Status\n';
  history.forEach(d => {
    const num = '"' + (d.number || '').replace(/"/g, '""') + '"';
    const type = '"' + (d.type || '').replace(/"/g, '""') + '"';
    const date = '"' + (d.date || '').replace(/"/g, '""') + '"';
    const name = '"' + (d.customer && d.customer.name ? d.customer.name : '').replace(/"/g, '""') + '"';
    const phone = '"' + (d.customer && d.customer.phone ? d.customer.phone : '').replace(/"/g, '""') + '"';
    const sub = d.subtotal || 0;
    const disc = d.discount || 0;
    const tot = d.grandTotal || 0;
    const paid = (d.paid !== undefined ? d.paid : (d.advance || 0));
    const status = '"' + (d.status || '').replace(/"/g, '""') + '"';

    csv += num + ',' + type + ',' + date + ',' + name + ',' + phone + ',' + sub + ',' + disc + ',' + tot + ',' + paid + ',' + status + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'recital_sales_' + formatDate(new Date()) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(state.currentLang === 'si' ? 'විකුණුම් වාර්තාව (CSV) බාගත විය!' : 'Sales CSV exported successfully!');
}

function exportInventoryCsv() {
  if (storeCatalog.length === 0) {
    alert(state.currentLang === 'si' ? 'අපනයනය කිරීමට තොග දත්ත නැත.' : 'No catalog items found to export.');
    return;
  }

  let csv = 'Product ID,Type,Name (EN),Name (SI),Selling Price,Cost Price (COGS),Stock Quantity,Estimated Stock Value\n';
  storeCatalog.forEach(item => {
    const id = '"' + (item.id || '').replace(/"/g, '""') + '"';
    const type = '"' + (item.type || '').replace(/"/g, '""') + '"';
    const nameEn = '"' + (item.nameEn || '').replace(/"/g, '""') + '"';
    const nameSi = '"' + (item.nameSi || '').replace(/"/g, '""') + '"';
    const price = item.price || 0;
    const cost = item.costPrice !== undefined ? item.costPrice : (item.type === 'item' ? Math.round(price * 0.7) : 0);
    const stock = item.type === 'service' ? 'N/A' : (item.stock || 0);
    const stockVal = item.type === 'service' ? 0 : (stock * price);

    csv += id + ',' + type + ',' + nameEn + ',' + nameSi + ',' + price + ',' + cost + ',' + stock + ',' + stockVal + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'recital_inventory_' + formatDate(new Date()) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(state.currentLang === 'si' ? 'තොග වාර්තාව (CSV) බාගත විය!' : 'Inventory CSV exported successfully!');
}


/* =========================================================
   FIREBASE CLOUD DATABASE CONTROLS & UI HANDLERS
   ========================================================= */

function openFirebaseModal() {
  const modal = document.getElementById('modal-firebase');
  if (!modal) return;
  modal.classList.add('active');
  updateFirebaseModalUI();
}

function closeFirebaseModal() {
  const modal = document.getElementById('modal-firebase');
  if (modal) modal.classList.remove('active');
}

function updateFirebaseModalUI() {
  const textarea = document.getElementById('fb-input-config');
  const statusEl = document.getElementById('fb-connection-status');
  const btnUpload = document.getElementById('btn-fb-upload-all');
  const btnFetch = document.getElementById('btn-fb-fetch-all');
  const btnDisconnect = document.getElementById('btn-fb-disconnect');

  const cfg = window.firebaseDB ? window.firebaseDB.getConfig() : null;
  if (cfg && textarea && !textarea.value) {
    textarea.value = JSON.stringify(cfg, null, 2);
  }

  const isConnected = window.firebaseDB && window.firebaseDB.isInitialized;
  if (isConnected) {
    statusEl.innerHTML = '<span style="color:#059669;">🟢 Connected to Project: <b>' + (cfg && cfg.projectId ? cfg.projectId : 'Active') + '</b></span>';
    if (btnUpload) btnUpload.style.display = 'inline-flex';
    if (btnFetch) btnFetch.style.display = 'inline-flex';
    if (btnDisconnect) btnDisconnect.style.display = 'inline-flex';
  } else {
    statusEl.innerHTML = '<span style="color:#64748b;">⚪ Not connected. System is currently running on Local Storage.</span>';
    if (btnUpload) btnUpload.style.display = 'none';
    if (btnFetch) btnFetch.style.display = 'none';
    if (btnDisconnect) btnDisconnect.style.display = 'none';
  }
}

async function testAndSaveFirebaseConfig() {
  const textarea = document.getElementById('fb-input-config');
  const raw = textarea ? textarea.value.trim() : '';
  const statusEl = document.getElementById('fb-connection-status');
  if (!raw) {
    alert('Please paste your Firebase configuration object.');
    return;
  }

  let configObj = null;
  try {
    if (raw.startsWith('{')) {
      try {
        configObj = JSON.parse(raw);
      } catch (err) {
        configObj = (new Function('return ' + raw))();
      }
    } else if (raw.includes('firebaseConfig')) {
      const match = raw.match(/firebaseConfig\s*=\s*({[\s\S]*?});/);
      if (match) {
        configObj = (new Function('return ' + match[1]))();
      }
    }
  } catch (e) {
    alert('Could not parse Firebase configuration: ' + e.message);
    return;
  }

  if (!configObj || !configObj.projectId) {
    alert('Invalid configuration! Make sure it contains "apiKey" and "projectId".');
    return;
  }

  statusEl.innerHTML = '<span style="color:#0284c7;">⏳ Connecting to Firebase Firestore...</span>';

  try {
    const success = await window.firebaseDB.saveConfig(configObj);
    if (success) {
      statusEl.innerHTML = '<span style="color:#059669;">✅ Connected successfully to <b>' + configObj.projectId + '</b>!</span>';
      updateFirebaseModalUI();
      showToast('Firebase connected successfully!');
    } else {
      statusEl.innerHTML = '<span style="color:#dc2626;">❌ Connection failed. Check your Firebase credentials or permissions.</span>';
    }
  } catch (err) {
    statusEl.innerHTML = '<span style="color:#dc2626;">❌ Error: ' + err.message + '</span>';
  }
}

async function uploadLocalDataToFirebase() {
  if (!confirm('This will upload all current local inventory, invoices, repair jobs, and hire bookings to your Firebase Cloud database. Proceed?')) {
    return;
  }

  const pBar = document.getElementById('fb-sync-progress-bar');
  const pFill = document.getElementById('fb-sync-progress-fill');
  const pText = document.getElementById('fb-sync-status-text');

  if (pBar) pBar.style.display = 'block';

  try {
    const result = await window.firebaseDB.uploadAllLocalData(function (current, total, detail) {
      const pct = Math.round((current / total) * 100);
      if (pFill) pFill.style.width = pct + '%';
      if (pText) pText.textContent = 'Syncing (' + current + '/' + total + '): ' + detail;
    });

    if (pText) pText.innerHTML = '<b style="color:#059669;">✅ All ' + result.syncedCount + ' records synced to Firebase Cloud!</b>';
    showToast('All local data backed up to Cloud!');
  } catch (err) {
    if (pText) pText.innerHTML = '<b style="color:#dc2626;">❌ Sync failed: ' + err.message + '</b>';
  }
}

async function fetchCloudDataToLocal() {
  if (!confirm('This will download all records from Firebase Cloud and refresh your screen. Proceed?')) {
    return;
  }

  const pText = document.getElementById('fb-sync-status-text');
  try {
    if (pText) pText.textContent = 'Downloading from Cloud...';
    await window.firebaseDB.fetchFromCloud(function (msg) {
      if (pText) pText.textContent = msg;
    });
    if (pText) pText.innerHTML = '<b style="color:#059669;">✅ Local data updated from Cloud!</b>';
    showToast('Downloaded from Cloud!');
  } catch (err) {
    if (pText) pText.innerHTML = '<b style="color:#dc2626;">❌ Fetch failed: ' + err.message + '</b>';
  }
}

function disconnectFirebase() {
  if (!confirm('Are you sure you want to disconnect Firebase? Your app will return to using only browser Local Storage.')) {
    return;
  }
  if (window.firebaseDB) {
    window.firebaseDB.clearConfig();
  }
  const textarea = document.getElementById('fb-input-config');
  if (textarea) textarea.value = '';
  updateFirebaseModalUI();
  showToast('Firebase disconnected.');
}
