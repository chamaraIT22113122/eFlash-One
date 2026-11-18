/**
 * Recital Electronic - Invoice & Quotation Builder
 * Bilingual Translation Dictionary & Number-to-Words Engine
 * Sinhala & English Support
 */

const translations = {
  en: {
    appTitle: "Recital Electronic - Invoice & Quotation Builder",
    tagline: "Sound Systems & Electronic Solutions",
    quotation: "Quotation",
    invoice: "Invoice",
    quotationNo: "Quotation No",
    invoiceNo: "Invoice No",
    docType: "Document Type",
    language: "Language",
    printDocLang: "Document Print Language",
    langBilingual: "Bilingual (English + සිංහල)",
    langEnglish: "English Only",
    langSinhala: "Sinhala Only (සිංහල පමණි)",
    newDoc: "New Document",
    saveDoc: "Save / Update",
    savedAlert: "Document saved successfully!",
    savedHistory: "Saved History",
    settings: "Settings",
    printPdf: "Print / Save PDF",
    downloadPdf: "Download PDF",
    sendWhatsapp: "Share on WhatsApp",
    convertInvoice: "Convert to Invoice",
    convertQuotation: "Convert to Quotation",
    
    // Business Details
    bizDetailsCard: "Business & Issuer Information",
    showBizHeaderToggle: "Show Business Details on Letterhead Header",
    hideBizHeaderNotice: "Business details removed from header (ideal for pre-printed paper)",

    // Details
    docDetails: "Document Information",
    docNumber: "Document #",
    docDate: "Date",
    dueDate: "Due Date",
    validUntil: "Valid Until",
    status: "Status",
    statusDraft: "Draft",
    statusSent: "Sent",
    statusPaid: "Paid",
    statusPartiallyPaid: "Partially Paid",
    statusCancelled: "Cancelled",

    // Customer
    customerDetails: "Customer Information (Bill To)",
    customerName: "Customer / Company Name",
    customerPhone: "Phone / WhatsApp Number",
    customerAddress: "Customer Address",
    customerEmail: "Email / Note (Optional)",

    // Items
    itemsList: "Items & Services List",
    quickAddPreset: "+ Quick Add Common Item",
    addItemRow: "+ Add New Item",
    itemNo: "#",
    itemDescription: "Item / Service Description",
    itemQty: "Qty",
    itemUnitPrice: "Unit Price (Rs.)",
    itemAmount: "Amount (Rs.)",
    action: "Action",
    clearAllItems: "Clear All Items",

    // Summary
    summary: "Financial Summary",
    subtotal: "Subtotal",
    discount: "Discount",
    discountPercent: "Discount (%)",
    discountFixed: "Discount (Rs.)",
    deliveryFee: "Transport / Service Charge",
    totalAmount: "Grand Total",
    advancePaid: "Advance Paid",
    balanceDue: "Balance Due",
    amountInWords: "Amount in Words",
    rupees: "Rupees",
    cents: "Cents",
    only: "Only",

    // Payment & Terms
    paymentBankDetails: "Bank & Payment Details",
    bankName: "Bank Name",
    accountNumber: "Account Number",
    accountName: "Account Name",
    branch: "Branch",
    paymentInstructions: "Please use the document number as reference for bank deposits.",
    
    termsAndConditions: "Terms & Conditions / Warranty",
    termsPresetSelect: "Select Preset Terms:",
    customNotes: "Special Notes / Instructions",
    authorizedSignature: "Authorized Signature",
    customerSignature: "Customer Signature",

    // Letterhead Settings
    letterheadBgOption: "Letterhead Background",
    showLetterheadBg: "Include Graphics (For Blank Paper / PDF)",
    hideLetterheadBg: "Hide Graphics (For Pre-Printed Paper)",

    // History Modal
    historyTitle: "Saved Invoices & Quotations",
    searchHistoryPlaceholder: "Search by number, customer, phone...",
    noSavedDocs: "No saved documents found yet.",
    openDoc: "Open",
    duplicateDoc: "Duplicate",
    deleteDoc: "Delete",
    confirmDelete: "Are you sure you want to delete this document?",
    exportAllJson: "Backup (Export JSON)",
    importJson: "Restore (Import JSON)",
    importSuccess: "Data imported successfully!",

    // Settings Modal
    settingsTitle: "Business & System Settings",
    businessName: "Business Name",
    businessRegNo: "Business Registration No.",
    businessPhone: "Phone Number(s)",
    businessAddress: "Business Address",
    invoicePrefix: "Invoice Number Prefix",
    quotationPrefix: "Quotation Number Prefix",
    saveSettings: "Save Settings",
    settingsSavedAlert: "Settings updated successfully!",
    resetDefaultSettings: "Reset to Defaults",

    // WhatsApp Modal
    whatsappTitle: "Send via WhatsApp",
    sendToNumber: "Send to Customer WhatsApp",
    openWhatsappWeb: "Open WhatsApp Chat",
    copySummary: "Copy Text Summary",
    copiedAlert: "Copied to clipboard!",

    // Common Item Presets
    presets: [
      { nameEn: "Sound System Hire (Standard Package)", nameSi: "ශබ්ද විකාශන යන්ත්‍ර කුලියට දීම (සාමාන්‍ය පැකේජය)", price: 25000 },
      { nameEn: "Power Amplifier Repair Service", nameSi: "ඇම්ප්ලිෆයර් අලුත්වැඩියා සේවාව", price: 4500 },
      { nameEn: "15-Inch Speaker Box (Pair)", nameSi: "15 ඉන්චි ස්පීකර් පෙට්ටි (ජෝඩුව)", price: 48000 },
      { nameEn: "Wireless Microphone Set (Dual Channel)", nameSi: "රැහැන් රහිත මයික්‍රෆෝන් කට්ටලය", price: 16500 },
      { nameEn: "Professional Audio Mixer (8 Channel)", nameSi: "ශබ්ද මිශ්‍රණ යන්ත්‍රය (8 Channel)", price: 38000 },
      { nameEn: "Subwoofer 18-Inch Bass Box", nameSi: "18 ඉන්චි සබ්වූෆර් බේස් පෙට්ටිය", price: 55000 },
      { nameEn: "Audio Cable & XLR/Jack Connectors", nameSi: "ශබ්ද කේබල් සහ කනෙක්ටර්ස්", price: 2500 },
      { nameEn: "Electronic Circuit / PCB Repair & Service", nameSi: "ඉලෙක්ට්‍රොනික පරිපථ අලුත්වැඩියාව", price: 3500 },
      { nameEn: "Sound Operator / Technician Daily Fee", nameSi: "ශබ්ද පරිපාලක දෛනික ගාස්තුව", price: 5000 }
    ],

    // Terms presets
    termsPresets: [
      { textEn: "3 Months Warranty for electronic repairs.", textSi: "ඉලෙක්ට්‍රොනික අලුත්වැඩියාව සඳහා මාස 3 ක වගකීමක් පිරිනැමේ." },
      { textEn: "6 Months Warranty on manufactured speaker cabinets.", textSi: "නිෂ්පාදිත ස්පීකර් පෙට්ටි සඳහා මාස 6 ක වගකීමක් හිමිවේ." },
      { textEn: "50% Advance payment required upon order confirmation.", textSi: "ඇණවුම තහවුරු කිරීමට 50% ක අත්තිකාරම් මුදලක් අවශ්‍ය වේ." },
      { textEn: "Full balance must be cleared upon delivery/completion.", textSi: "භාණ්ඩ හෝ සේවාව භාරදීමට පෙර ඉතිරි මුදල ගෙවා අවසන් කළ යුතුය." },
      { textEn: "Physical damages and power surges void the warranty.", textSi: "විදුලි සැර වැදීම් සහ බාහිර හානි සඳහා වගකීම් සහතිකය අදාළ නොවේ." },
      { textEn: "Quotation is valid for 14 days from the date of issue.", textSi: "මෙම මිල ප්‍රකාශය නිකුත් කළ දින සිට දින 14ක් සඳහා වලංගු වේ." }
    ]
  },

  si: {
    appTitle: "Recital Electronic - ඉන්වොයිස් සහ මිල ගණන් පද්ධතිය",
    tagline: "ශබ්ද පරිපාලන සහ ඉලෙක්ට්‍රොනික සේවා",
    quotation: "මිල ගණන් කැඳවීම",
    invoice: "ඉන්වොයිසිය",
    quotationNo: "මිල ගණන් අංකය",
    invoiceNo: "ඉන්වොයිස් අංකය",
    docType: "ලේඛන වර්ගය",
    language: "භාෂාව",
    printDocLang: "මුද්‍රණ භාෂාව",
    langBilingual: "ද්විභාෂික (ඉංග්‍රීසි + සිංහල)",
    langEnglish: "ඉංග්‍රීසි පමණි (English Only)",
    langSinhala: "සිංහල පමණි",
    newDoc: "නව ලේඛනයක්",
    saveDoc: "සුරකින්න / යාවත්කාලීන කරන්න",
    savedAlert: "ලේඛනය සාර්ථකව සුරකින ලදී!",
    savedHistory: "සුරැකි ලේඛන",
    settings: "සැකසුම්",
    printPdf: "මුද්‍රණය / PDF",
    downloadPdf: "PDF බාගන්න",
    sendWhatsapp: "WhatsApp යවන්න",
    convertInvoice: "ඉන්වොයිසියක් බවට හරවන්න",
    convertQuotation: "මිල ගණන් කැඳවීමක් බවට හරවන්න",

    // Business Details
    bizDetailsCard: "ව්‍යාපාරික තොරතුරු (නිකුත් කරන්නා)",
    showBizHeaderToggle: "ලෙටර්හෙඩ් ශීර්ෂයේ ව්‍යාපාර විස්තර පෙන්වන්න",
    hideBizHeaderNotice: "ශීර්ෂයෙන් ව්‍යාපාර විස්තර ඉවත් කර ඇත (මුද්‍රිත ලෙටර්හෙඩ් සඳහා සුදුසුයි)",

    // Details
    docDetails: "ලේඛන තොරතුරු",
    docNumber: "ලේඛන අංකය",
    docDate: "දිනය",
    dueDate: "ගෙවිය යුතු දිනය",
    validUntil: "වලංගු කාලය",
    status: "තත්වය",
    statusDraft: "කටුසටහන (Draft)",
    statusSent: "යවන ලදී (Sent)",
    statusPaid: "සම්පූර්ණයෙන් ගෙවා ඇත (Paid)",
    statusPartiallyPaid: "කොටසක් ගෙවා ඇත",
    statusCancelled: "අවලංගුයි",

    // Customer
    customerDetails: "පාරිභෝගික විස්තර (ලබන්නා)",
    customerName: "පාරිභෝගිකයාගේ / ආයතනයේ නම",
    customerPhone: "දුරකථන / WhatsApp අංකය",
    customerAddress: "ලිපිනය",
    customerEmail: "ඊමේල් / වෙනත් සටහන් (විකල්ප)",

    // Items
    itemsList: "භාණ්ඩ සහ සේවා ලැයිස්තුව",
    quickAddPreset: "+ නිතර භාවිතා වන භාණ්ඩ එක්කරන්න",
    addItemRow: "+ නව පේළියක් එක්කරන්න",
    itemNo: "#",
    itemDescription: "භාණ්ඩය / සේවාව විස්තරය",
    itemQty: "ප්‍රමාණය",
    itemUnitPrice: "ඒකක මිල (රු.)",
    itemAmount: "එකතුව (රු.)",
    action: "ක්‍රියාව",
    clearAllItems: "සියල්ල ඉවත් කරන්න",

    // Summary
    summary: "මූල්‍ය සාරාංශය",
    subtotal: "මුළු එකතුව",
    discount: "වට්ටම",
    discountPercent: "වට්ටම (%)",
    discountFixed: "වට්ටම (රු.)",
    deliveryFee: "ප්‍රවාහන / සේවා ගාස්තු",
    totalAmount: "අවසාන එකතුව",
    advancePaid: "ගෙවූ අත්තිකාරම්",
    balanceDue: "ඉතිරි ගෙවීම",
    amountInWords: "මුදල අකුරින්",
    rupees: "රුපියල්",
    cents: "සත",
    only: "පමණි",

    // Payment & Terms
    paymentBankDetails: "ගෙවීම් සහ බැංකු ගිණුම් විස්තර",
    bankName: "බැංකුවේ නම",
    accountNumber: "ගිණුම් අංකය",
    accountName: "ගිණුමේ නම",
    branch: "ශාඛාව",
    paymentInstructions: "බැංකු තැන්පතු වලදී කරුණාකර ලේඛන අංකය සඳහන් කරන්න.",

    termsAndConditions: "කොන්දේසි සහ වගකීම්",
    termsPresetSelect: "කොන්දේසි තෝරාගන්න:",
    customNotes: "විශේෂ සටහන්",
    authorizedSignature: "බලයලත් අත්සන",
    customerSignature: "පාරිභෝගික අත්සන",

    // Letterhead Settings
    letterheadBgOption: "ලෙටර්හෙඩ් පසුබිම",
    showLetterheadBg: "සම්පූර්ණ ලෙටර්හෙඩ් සමග (සුදු කොළ / PDF සඳහා)",
    hideLetterheadBg: "පසුබිම රහිතව (මුද්‍රිත ලෙටර්හෙඩ් කොළ සඳහා)",

    // History Modal
    historyTitle: "සුරැකි ඉන්වොයිස් සහ මිල ගණන්",
    searchHistoryPlaceholder: "අංකය, පාරිභෝගික නම, දුරකථන අංකයෙන් සොයන්න...",
    noSavedDocs: "තවමත් කිසිදු ලේඛනයක් සුරැකී නොමැත.",
    openDoc: "විවෘත කරන්න",
    duplicateDoc: "පිටපතක් ගන්න",
    deleteDoc: "මකන්න",
    confirmDelete: "ඔබට මෙම ලේඛනය මැකීමට අවශ්‍ය බව සහතිකද?",
    exportAllJson: "දත්ත සුරකින්න (Backup JSON)",
    importJson: "දත්ත නැවත ලබාගන්න (Restore)",
    importSuccess: "දත්ත සාර්ථකව ඇතුළත් කරන ලදී!",

    // Settings Modal
    settingsTitle: "ව්‍යාපාරික සහ පද්ධති සැකසුම්",
    businessName: "ව්‍යාපාරයේ නම",
    businessRegNo: "ව්‍යාපාර ලියාපදිංචි අංකය",
    businessPhone: "දුරකථන අංක",
    businessAddress: "ලිපිනය",
    invoicePrefix: "ඉන්වොයිස් අංක මුලකුරු",
    quotationPrefix: "මිල ගණන් අංක මුලකුරු",
    saveSettings: "සැකසුම් සුරකින්න",
    settingsSavedAlert: "සැකසුම් සාර්ථකව සුරකින ලදී!",
    resetDefaultSettings: "මුල් සැකසුම් යොදන්න",

    // WhatsApp Modal
    whatsappTitle: "WhatsApp මගින් පාරිභෝගිකයාට යවන්න",
    sendToNumber: "පාරිභෝගික WhatsApp අංකයට යවන්න",
    openWhatsappWeb: "WhatsApp චැට් විවෘත කරන්න",
    copySummary: "සාරාංශය Copy කරන්න",
    copiedAlert: "පිටපත් කරගන්නා ලදී!",

    // Presets in Sinhala
    presets: [
      { nameEn: "Sound System Hire (Standard Package)", nameSi: "ශබ්ද විකාශන යන්ත්‍ර කුලියට දීම (සාමාන්‍ය පැකේජය)", price: 25000 },
      { nameEn: "Power Amplifier Repair Service", nameSi: "ඇම්ප්ලිෆයර් අලුත්වැඩියා සේවාව", price: 4500 },
      { nameEn: "15-Inch Speaker Box (Pair)", nameSi: "15 ඉන්චි ස්පීකර් පෙට්ටි (ජෝඩුව)", price: 48000 },
      { nameEn: "Wireless Microphone Set (Dual Channel)", nameSi: "රැහැන් රහිත මයික්‍රෆෝන් කට්ටලය", price: 16500 },
      { nameEn: "Professional Audio Mixer (8 Channel)", nameSi: "ශබ්ද මිශ්‍රණ යන්ත්‍රය (8 Channel)", price: 38000 },
      { nameEn: "Subwoofer 18-Inch Bass Box", nameSi: "18 ඉන්චි සබ්වූෆර් බේස් පෙට්ටිය", price: 55000 },
      { nameEn: "Audio Cable & XLR/Jack Connectors", nameSi: "ශබ්ද කේබල් සහ කනෙක්ටර්ස්", price: 2500 },
      { nameEn: "Electronic Circuit / PCB Repair & Service", nameSi: "ඉලෙක්ට්‍රොනික පරිපථ අලුත්වැඩියාව", price: 3500 },
      { nameEn: "Sound Operator / Technician Daily Fee", nameSi: "ශබ්ද පරිපාලක දෛනික ගාස්තුව", price: 5000 }
    ],

    termsPresets: [
      { textEn: "3 Months Warranty for electronic repairs.", textSi: "ඉලෙක්ට්‍රොනික අලුත්වැඩියාව සඳහා මාස 3 ක වගකීමක් පිරිනැමේ." },
      { textEn: "6 Months Warranty on manufactured speaker cabinets.", textSi: "නිෂ්පාදිත ස්පීකර් පෙට්ටි සඳහා මාස 6 ක වගකීමක් හිමිවේ." },
      { textEn: "50% Advance payment required upon order confirmation.", textSi: "ඇණවුම තහවුරු කිරීමට 50% ක අත්තිකාරම් මුදලක් අවශ්‍ය වේ." },
      { textEn: "Full balance must be cleared upon delivery/completion.", textSi: "භාණ්ඩ හෝ සේවාව භාරදීමට පෙර ඉතිරි මුදල ගෙවා අවසන් කළ යුතුය." },
      { textEn: "Physical damages and power surges void the warranty.", textSi: "විදුලි සැර වැදීම් සහ බාහිර හානි සඳහා වගකීම් සහතිකය අදාළ නොවේ." },
      { textEn: "Quotation is valid for 14 days from the date of issue.", textSi: "මෙම මිල ප්‍රකාශය නිකුත් කළ දින සිට දින 14ක් සඳහා වලංගු වේ." }
    ]
  }
};

/**
 * Number to English Words Engine
 */
function numberToEnglishWords(num) {
  if (num === null || num === undefined || isNaN(num) || num === 0) return "Zero Rupees Only";
  
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n === 0) return '';
    if (n < 20) return a[n] + ' ';
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10] : '') + ' ';
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }

  const parts = Number(num).toFixed(2).split('.');
  const integerPart = parseInt(parts[0], 10);
  const decimalPart = parseInt(parts[1], 10);

  let result = inWords(integerPart).trim() + " Rupees";
  if (decimalPart > 0) {
    result += " and " + inWords(decimalPart).trim() + " Cents";
  }
  result += " Only";
  return result;
}

/**
 * Number to Sinhala Words Engine
 */
function numberToSinhalaWords(num) {
  if (num === null || num === undefined || isNaN(num) || num === 0) return "රුපියල් බිංදුවයි පමණි";

  const ones = ['', 'එක', 'දෙක', 'තුන', 'හතර', 'පහ', 'හය', 'හත', 'අට', 'නවය'];
  const teens = ['දහය', 'එකොළහ', 'දොළහ', 'දහතුන', 'දාහතර', 'පහළොව', 'දහසය', 'දාහත', 'දහඅට', 'දහනවය'];
  const tensEnd = ['', '', 'විස්ස', 'තිහ', 'හතළිහ', 'පනහ', 'හැට', 'හැත්තෑව', 'අසූව', 'අනූව'];
  const tensMid = ['', '', 'විසි ', 'තිස් ', 'හතළිස් ', 'පනස් ', 'හැට ', 'හැත්තෑ ', 'අසූ ', 'අනූ '];
  
  const thousandsPrefix = {
    1: 'එක්', 2: 'දෙ', 3: 'තුන්', 4: 'හාර', 5: 'පන්',
    6: 'හය', 7: 'හත්', 8: 'අට', 9: 'නව', 10: 'දස',
    11: 'එකොළොස්', 12: 'දොළොස්', 13: 'දහතුන්', 14: 'දාහතර', 15: 'පහළොස්',
    16: 'දහසය', 17: 'දාහත්', 18: 'දහඅට', 19: 'දහනව', 20: 'විසි'
  };

  const hundredsEnd = ['', 'එකසිය', 'දෙසිය', 'තුන්සිය', 'හාරසිය', 'පන්සිය', 'හයසිය', 'හත්සිය', 'අටසිය', 'නමසිය'];
  const hundredsMid = ['', 'එකසිය ', 'දෙසිය ', 'තුන්සිය ', 'හාරසිය ', 'පන්සිය ', 'හයසිය ', 'හත්සිය ', 'අටසිය ', 'නමසිය '];

  function convertUnderThousand(n, isLastPart) {
    if (n === 0) return '';
    let str = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;

    if (h > 0) {
      if (rem === 0) {
        str += (isLastPart ? hundredsEnd[h] + 'ය' : hundredsMid[h]);
        return str;
      } else {
        str += hundredsMid[h];
      }
    }

    if (rem > 0) {
      if (rem < 10) {
        str += (isLastPart ? ones[rem] + 'යි' : ones[rem] + ' ');
      } else if (rem >= 10 && rem < 20) {
        str += (isLastPart ? teens[rem - 10] + 'යි' : teens[rem - 10] + ' ');
      } else {
        const t = Math.floor(rem / 10);
        const u = rem % 10;
        if (u === 0) {
          str += (isLastPart ? tensEnd[t] + 'යි' : tensEnd[t] + ' ');
        } else {
          str += tensMid[t] + (isLastPart ? ones[u] + 'යි' : ones[u] + ' ');
        }
      }
    }
    return str;
  }

  function convertThousandsPrefix(t) {
    if (thousandsPrefix[t]) return thousandsPrefix[t] + 'දහස් ';
    if (t < 100) {
      const ten = Math.floor(t / 10);
      const unit = t % 10;
      if (unit === 0) {
        return tensMid[ten] + 'දහස් ';
      } else if (unit === 5) {
        return tensMid[ten] + 'පන්දහස් ';
      } else {
        return tensMid[ten] + (thousandsPrefix[unit] || ones[unit]) + 'දහස් ';
      }
    }
    return convertUnderThousand(t, false) + 'දහස් ';
  }

  function convertNumber(n) {
    if (n === 0) return 'බිංදුවයි';
    let output = '';

    // Millions / Lakhs (Sri Lanka typically uses Lakhs & Millions)
    const millions = Math.floor(n / 1000000);
    let remainder = n % 1000000;

    if (millions > 0) {
      if (millions === 1) output += 'මිලියන ';
      else output += convertUnderThousand(millions, false) + 'මිලියන ';
    }

    const thousands = Math.floor(remainder / 1000);
    remainder = remainder % 1000;

    if (thousands > 0) {
      if (thousands === 1 && remainder === 0 && millions === 0) {
        output += 'එක්දහස';
      } else {
        output += convertThousandsPrefix(thousands);
      }
    }

    if (remainder > 0) {
      output += convertUnderThousand(remainder, true);
    } else if (output.endsWith('දහස් ')) {
      output = output.slice(0, -5) + 'දහසයි';
    } else if (output.endsWith('මිලියන ')) {
      output = output.slice(0, -1) + 'යි';
    }

    return output.trim();
  }

  const parts = Number(num).toFixed(2).split('.');
  const integerPart = parseInt(parts[0], 10);
  const decimalPart = parseInt(parts[1], 10);

  let result = "රුපියල් " + convertNumber(integerPart);
  if (decimalPart > 0) {
    result += " සත " + convertUnderThousand(decimalPart, true);
  }
  result += " පමණි";
  return result;
}


// Export to window or global
const globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis);
globalScope.AppTranslations = translations;
globalScope.numberToEnglishWords = numberToEnglishWords;
globalScope.numberToSinhalaWords = numberToSinhalaWords;

