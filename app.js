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

// Global App State
let state = {
  currentLang: 'si', // Default UI language: Sinhala
  printLang: 'bilingual', // Document print language: bilingual
  docType: 'quotation', // 'quotation' or 'invoice'
  showBackground: true,
  showBizHeader: false, // Hidden/removed from preview header by default as requested
  settings: loadSettings(),
  doc: createInitialDoc('quotation')
};

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
  state.settings = Object.assign({}, state.settings, newSettings);
  localStorage.setItem('recital_settings', JSON.stringify(state.settings));
}

// Generate Next Document Number
function getNextDocNumber(type) {
  const year = new Date().getFullYear();
  if (type === 'invoice') {
    const num = state.settings.invCounter;
    return `${state.settings.invPrefix}${year}-${String(num).padStart(3, '0')}`;
  } else {
    const num = state.settings.qtCounter;
    return `${state.settings.qtPrefix}${year}-${String(num).padStart(3, '0')}`;
  }
}

// Create Initial Fresh Document
function createInitialDoc(type) {
  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + (type === 'invoice' ? 7 : 14));

  const t = window.AppTranslations && window.AppTranslations.en ? window.AppTranslations.en : null;
  const initialTerms = t ? [t.termsPresets[0].textEn, t.termsPresets[2].textEn] : [];

  return {
    id: Date.now().toString(),
    type: type,
    number: getNextDocNumber(type),
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
      bankName: state && state.settings ? state.settings.bankName : DEFAULT_SETTINGS.bankName,
      accountNumber: state && state.settings ? state.settings.accountNumber : DEFAULT_SETTINGS.accountNumber,
      accountName: state && state.settings ? state.settings.accountName : DEFAULT_SETTINGS.accountName,
      branch: state && state.settings ? state.settings.branch : DEFAULT_SETTINGS.branch
    },
    terms: initialTerms,
    notes: '',
    showBackground: true
  };
}

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
  applyLanguage(state.currentLang);
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
        <input type="number" min="1" step="1" value="${item.qty}" oninput="updateItemField(${idx}, 'qty', this.value)">
      </td>
      <td>
        <input type="number" min="0" step="50" value="${item.unitPrice}" oninput="updateItemField(${idx}, 'unitPrice', this.value)">
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
  state.doc.items.push({
    id: Date.now().toString(),
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
    state.doc.items[index].qty = Math.max(1, parseInt(value, 10) || 1);
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

  const discountRow = document.getElementById('pv-discount-row');
  if (discount > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('pv-discount-val').textContent = '- ' + formatCurrency(discount);
  } else {
    discountRow.style.display = 'none';
  }

  const deliveryRow = document.getElementById('pv-delivery-row');
  if (delivery > 0) {
    deliveryRow.style.display = 'flex';
    document.getElementById('pv-delivery-val').textContent = '+ ' + formatCurrency(delivery);
  } else {
    deliveryRow.style.display = 'none';
  }

  const advanceRow = document.getElementById('pv-advance-row');
  const balanceRow = document.getElementById('pv-balance-row');
  if (advance > 0) {
    advanceRow.style.display = 'flex';
    document.getElementById('pv-advance-val').textContent = formatCurrency(advance);
    balanceRow.style.display = 'flex';
    document.getElementById('pv-balance-val').textContent = formatCurrency(balanceDue);
  } else {
    advanceRow.style.display = 'none';
    balanceRow.style.display = 'none';
  }

  // 8. Amount in Words
  const wordsEn = window.numberToEnglishWords(grandTotal);
  const wordsSi = window.numberToSinhalaWords(grandTotal);
  document.getElementById('pv-words-en').textContent = wordsEn;
  document.getElementById('pv-words-si').textContent = wordsSi;

  // 9. Payment Details
  document.getElementById('pv-bank-name').textContent = state.doc.payment.bankName || state.settings.bankName;
  document.getElementById('pv-acc-name').textContent = state.doc.payment.accountName || state.settings.accountName;
  document.getElementById('pv-acc-number').textContent = state.doc.payment.accountNumber || state.settings.accountNumber;
  document.getElementById('pv-branch').textContent = state.doc.payment.branch || state.settings.branch;

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

  document.getElementById('lbl-prev-bill-to').textContent = isBi ? 'CUSTOMER DETAILS / බිල්පත ලබන්නා' : (isSi ? 'පාරිභෝගික විස්තර' : 'CUSTOMER DETAILS');
  document.getElementById('lbl-prev-doc-details').textContent = isBi ? 'DOCUMENT DETAILS / ලේඛන තොරතුරු' : (isSi ? 'ලේඛන තොරතුරු' : 'DOCUMENT DETAILS');
  const lblDateMeta = document.getElementById('lbl-prev-date-meta');
  if (lblDateMeta) lblDateMeta.textContent = isSi ? 'දිනය:' : 'Date:';
  document.getElementById('lbl-prev-no').textContent = isSi ? 'අංකය:' : 'Number:';
  document.getElementById('lbl-prev-validity').textContent = state.docType === 'invoice' ? (isSi ? 'ගෙවිය යුතු දිනය:' : 'Payment Due Date:') : (isSi ? 'වලංගු කාලය:' : 'Valid Until:');
  document.getElementById('lbl-prev-status').textContent = isSi ? 'තත්වය:' : 'Status:';

  document.getElementById('pv-th-no').textContent = '#';
  document.getElementById('pv-th-desc').textContent = isBi ? 'DESCRIPTION / විස්තරය' : (isSi ? 'විස්තරය' : 'DESCRIPTION');
  document.getElementById('pv-th-qty').textContent = isBi ? 'QTY / ප්‍රමාණය' : (isSi ? 'ප්‍රමාණය' : 'QTY');
  document.getElementById('pv-th-price').textContent = isBi ? 'UNIT PRICE / ඒකක මිල (RS.)' : (isSi ? 'ඒකක මිල (රු.)' : 'UNIT PRICE (RS.)');
  document.getElementById('pv-th-amount').textContent = isBi ? 'AMOUNT / එකතුව (RS.)' : (isSi ? 'එකතුව (රු.)' : 'AMOUNT (RS.)');

  document.getElementById('lbl-pv-bank').textContent = isBi ? 'BANK PAYMENT DETAILS / බැංකු විස්තර' : (isSi ? 'බැංකු ගිණුම් විස්තර' : 'BANK PAYMENT DETAILS');
  document.getElementById('lbl-pv-subtotal').textContent = isSi ? 'මුළු එකතුව:' : 'Subtotal:';
  document.getElementById('lbl-pv-discount').textContent = isSi ? 'වට්ටම:' : 'Discount:';
  document.getElementById('lbl-pv-delivery').textContent = isSi ? 'ප්‍රවාහන / අමතර ගාස්තු:' : 'Transport / Extra:';
  document.getElementById('lbl-pv-total').textContent = isSi ? 'අවසාන එකතුව:' : 'GRAND TOTAL:';
  document.getElementById('lbl-pv-advance').textContent = isSi ? 'ගෙවූ අත්තිකාරම්:' : 'Advance Paid:';
  document.getElementById('lbl-pv-balance').textContent = isSi ? 'ඉතිරි ගෙවීම:' : 'BALANCE DUE:';

  document.getElementById('lbl-pv-words').textContent = isSi ? 'මුදල අකුරින්:' : 'Amount in Words:';
  document.getElementById('lbl-pv-terms').textContent = isBi ? 'TERMS & CONDITIONS / කොන්දේසි සහ වගකීම්:' : (isSi ? 'කොන්දේසි සහ වගකීම්:' : 'TERMS & CONDITIONS:');
  document.getElementById('lbl-pv-cust-sign').textContent = isSi ? 'පාරිභෝගික අත්සන' : 'Customer Signature';
  document.getElementById('lbl-pv-auth-sign').textContent = isSi ? 'බලයලත් අත්සන' : 'Authorized Signature';
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

  // Mode buttons
  document.getElementById('ui-mode-quotation').textContent = lang === 'si' ? 'මිල ගණන් (Quotation)' : 'Quotation';
  document.getElementById('ui-mode-invoice').textContent = lang === 'si' ? 'ඉන්වොයිසිය (Invoice)' : 'Invoice';
  document.getElementById('ui-btn-convert').textContent = state.docType === 'quotation' ? t.convertInvoice : t.convertQuotation;

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
    syncFormWithState();
    updateLivePreview();
    showToast(state.currentLang === 'si' ? 'නව ලේඛනයක් සූදානම් කරන ලදී' : 'New document created');
  }
}

function saveCurrentDoc() {
  try {
    const history = getSavedDocsHistory();
    const existingIndex = history.findIndex(d => d.id === state.doc.id || d.number === state.doc.number);

    if (existingIndex >= 0) {
      history[existingIndex] = JSON.parse(JSON.stringify(state.doc));
    } else {
      history.unshift(JSON.parse(JSON.stringify(state.doc)));
    }

    localStorage.setItem('recital_docs_history', JSON.stringify(history));
    showToast(state.currentLang === 'si' ? 'ලේඛනය සාර්ථකව සුරකින ලදී!' : 'Document saved successfully!');
  } catch (e) {
    console.error('Failed to save document:', e);
    alert('Storage error: Could not save document.');
  }
}

function getSavedDocsHistory() {
  try {
    const data = localStorage.getItem('recital_docs_history');
    if (data) return JSON.parse(data);
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
  updateLivePreview();
  closeSettingsModal();
  showToast(state.currentLang === 'si' ? 'සැකසුම් සුරකින ලදී!' : 'Settings saved!');
}

function resetSettingsToDefault() {
  if (confirm(state.currentLang === 'si' ? 'සියලු සැකසුම් මුල් තත්වයට පත් කිරීමට අවශ්‍යද?' : 'Reset settings to defaults?')) {
    persistSettings(DEFAULT_SETTINGS);
    openSettingsModal();
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
  const text = document.getElementById('wa-message-text').value;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Message copied to clipboard!');
  });
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
  window.print();
}

function downloadPdfFile() {
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
