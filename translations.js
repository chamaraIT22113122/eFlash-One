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

    // Navigation Tabs
    tabDashboard: "Dashboard",
    tabInvoiceBuilder: "Invoice & Quotation",
    tabStoreBilling: "Store Billing & POS",
    tabInventory: "Items & Inventory",
    tabHistory: "History & Records",

    // Manual Service in Billing
    manualServiceTitle: "⚡ Quick Manual Service Entry",
    manualServiceSubtitle: "Add custom repairs, hire packages or labor charges directly to current bill",
    manualServiceDesc: "Service / Repair Description",
    manualServicePrice: "Service Fee (Rs.)",
    addManualServiceBtn: "+ Add Service to Bill",

    // Inventory Tab
    invTitle: "Items & Services Inventory Catalog",
    invSubtitle: "Manage your sound equipment, sales items, and repair service charges",
    invTotalItems: "Total Products in Stock",
    invTotalServices: "Total Services Offered",
    invLowStock: "Low Stock Items",
    invSearchPlaceholder: "Find any item, part or service by name...",
    invColType: "Type",
    invColName: "Item / Service Name",
    invColPrice: "Price (Rs.)",
    invColStock: "Stock Qty",
    invColActions: "Actions",
    invActionEdit: "Edit",
    invActionDelete: "Delete",
    invActionAddToBill: "+ Add to POS",

    // Dashboard
    dashWelcome: "Welcome to Recital Electronic",
    dashSubtitle: "Business Overview & Quick Billing Terminal",
    dashTodaySales: "Today's Revenue",
    dashMonthSales: "This Month's Sales",
    dashPendingBalances: "Pending Balances to Collect",
    dashTotalDocs: "Total Documents Created",
    dashQuickActions: "Quick Actions",
    dashNewInvoiceBtn: "Create Invoice",
    dashNewQuotationBtn: "Create Quotation",
    dashQuickBillBtn: "Open Store POS",
    dashRecentDocs: "Recent Documents & Receipts",
    dashPendingAlert: "Pending Payments Alert",
    dashNoPending: "All customer payments are settled! No pending dues.",
    dashRemindWA: "Send WhatsApp Reminder",
    dashViewAll: "View All Documents",

    // New Navigation Tabs
    navRepairs: "Repair Job Cards",
    navHire: "Sound Hire & Events",
    navReports: "Reports & Z-Close",

    // Repair Job Cards System
    repairsTitle: "Repair & Service Job Cards",
    repairsSubtitle: "Equipment intake, customer phone search, serial tags, spare parts, and pickup notifications",
    btnNewJobCard: "New Repair Job Card",
    searchRepairsPlaceholder: "Search by Customer Phone, Job ID (#RE-JOB-...), or Item Serial / Tag ID...",
    jobFilterAll: "All Jobs",
    jobFilterReceived: "Received",
    jobFilterDiagnosing: "Diagnosing",
    jobFilterParts: "Awaiting Parts",
    jobFilterReady: "Ready for Pickup",
    jobFilterCompleted: "Completed & Settled",
    statActiveJobs: "Active Repair Jobs",
    statAwaitingParts: "Awaiting Parts",
    statReadyPickup: "Ready for Pickup",
    statCompletedJobs: "Completed This Month",

    // Sound Hire & Event Bookings
    hireTitle: "Sound System Hire & Event Bookings",
    hireSubtitle: "Schedule sound packages, DJ setups, venue bookings, advances, and gear checklists",
    btnNewHireBooking: "Book Sound Hire / Event",
    searchHirePlaceholder: "Search by Customer, Phone, Venue, or Booking #...",
    hireStatUpcoming: "Upcoming Events",
    hireStatAdvances: "Advances Collected",
    hireStatPending: "Pending Event Balances",
    hireStatTotalRev: "Total Hire Revenue",

    // Reports & Daily Z-Report
    reportsTitle: "Reports, Profit & Loss & Daily Cash Register Closing",
    reportsSubtitle: "Cash drawer reconciliation, Cost of Goods Sold (COGS), profit margins, and CSV export",
    btnOpenZReport: "🧾 Daily Z-Report Closing",
    btnExportSales: "📥 Export Sales (CSV)",
    btnExportInventory: "📥 Export Inventory (CSV)",
    repStatGrossSales: "Today's Gross Sales",
    repStatEstCOGS: "Estimated COGS (Cost)",
    repStatNetProfit: "Estimated Net Profit",
    repStatCashInDrawer: "Cash In Drawer Today",

    // Store Billing & POS
    billingTitle: "Store Billing & Point of Sale",
    billingSubtitle: "Fast billing for items sales, repair services, or both combined",
    filterAll: "Both (Services + Items)",
    filterServices: "Services Only",
    filterItems: "Items Selling Only",
    searchCatalog: "Search items, services, cables, repairs...",
    addNewProductBtn: "+ Add Store Item / Service",
    cartTitle: "Current Bill / Basket",
    cartEmpty: "No items added to bill yet. Click items on the left to add.",
    cartCheckoutInvoice: "Convert to Official Invoice",
    cartCheckoutQuotation: "Convert to Quotation",
    cartPrintReceipt: "Print Quick Receipt",
    cartCustomerName: "Customer Name",
    cartCustomerPhone: "Customer Phone (WhatsApp)",
    cartDiscount: "Discount (Rs.)",
    cartPaid: "Cash Paid (Rs.)",
    cartChange: "Change / Balance Due",
    categoryService: "Service",
    categoryItem: "Item Selling",
    inStock: "In Stock",
    addToBill: "+ Add",

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

    // Navigation Tabs
    tabDashboard: "මුල් පුවරුව (Dashboard)",
    tabInvoiceBuilder: "ඉන්වොයිස් සහ මිල ගණන්",
    tabStoreBilling: "විකුණුම් සහ සේවා බිල්පත් (Store Billing)",
    tabInventory: "භාණ්ඩ සහ තොග (Inventory)",
    tabHistory: "ඉතිහාසය සහ වාර්තා (Records)",

    // Manual Service in Billing
    manualServiceTitle: "⚡ ක්ෂණික සේවා ගාස්තු එක්කිරීම",
    manualServiceSubtitle: "අලුත්වැඩියා, කුලී හෝ ශ්‍රම ගාස්තු සෘජුවම බිල්පතට එකතු කරන්න",
    manualServiceDesc: "සේවා / අලුත්වැඩියා විස්තරය",
    manualServicePrice: "සේවා ගාස්තුව (රු.)",
    addManualServiceBtn: "+ සේවාව බිල්පතට එක්කරන්න",

    // Inventory Tab
    invTitle: "භාණ්ඩ සහ සේවා නාමාවලිය (Catalog & Inventory)",
    invSubtitle: "ශබ්ද උපකරණ, විකිණීමේ අමතර කොටස් සහ අලුත්වැඩියා සේවා ගාස්තු කළමනාකරණය",
    invTotalItems: "තොගයේ ඇති මුළු භාණ්ඩ",
    invTotalServices: "ලබාදෙන මුළු සේවා ගණන",
    invLowStock: "අඩු තොග භාණ්ඩ (Low Stock)",
    invSearchPlaceholder: "නම මගින් ඕනෑම භාණ්ඩයක්, කොටසක් හෝ සේවාවක් සොයන්න...",
    invColType: "වර්ගය",
    invColName: "භාණ්ඩයේ / සේවාවේ නම",
    invColPrice: "මිල (රු.)",
    invColStock: "තොග ප්‍රමාණය",
    invColActions: "ක්‍රියා",
    invActionEdit: "සංස්කරණය",
    invActionDelete: "ඉවත් කරන්න",
    invActionAddToBill: "+ බිලට එක්කරන්න",

    // Dashboard
    dashWelcome: "Recital Electronic ව්‍යාපාරික පුවරුව",
    dashSubtitle: "දෛනික ආදායම්, ඉතිරි ගෙවීම් සහ ඉක්මන් බිල්පත් පද්ධතිය",
    dashTodaySales: "අද දවසේ ආදායම",
    dashMonthSales: "මෙම මාසයේ ආදායම",
    dashPendingBalances: "පාරිභෝගිකයින්ගෙන් අයවීමට ඇති මුදල්",
    dashTotalDocs: "සකස් කළ මුළු ලේඛන ගණන",
    dashQuickActions: "ඉක්මන් ක්‍රියාමාර්ග",
    dashNewInvoiceBtn: "නව ඉන්වොයිසියක්",
    dashNewQuotationBtn: "නව මිල ගණන් කැඳවීමක්",
    dashQuickBillBtn: "Store POS බිල්පත",
    dashRecentDocs: "නවතම ලේඛන සහ රිසිට්පත්",
    dashPendingAlert: "අයවීමට ඇති මුදල් පිළිබඳ දැනුම්දීම",
    dashNoPending: "සියලු පාරිභෝගික ගෙවීම් බේරා අවසන් කර ඇත!",
    dashRemindWA: "WhatsApp මගින් මතක් කරන්න",
    dashViewAll: "සියලු ලේඛන බලන්න",

    // New Navigation Tabs
    navRepairs: "අලුත්වැඩියා කාඩ්පත්",
    navHire: "ශබ්ද කුලියට දීම්",
    navReports: "වාර්තා & Z-Close",

    // Repair Job Cards System
    repairsTitle: "ඉලෙක්ට්‍රොනික් සහ ශබ්ද උපකරණ අලුත්වැඩියා කාඩ්පත්",
    repairsSubtitle: "උපකරණ භාරගැනීම, දුරකථන අංකයෙන් හෝ අයිතම ID මගින් සෙවීම, අමතර කොටස් සටහන් සහ පාරිභෝගික දැනුම්දීම්",
    btnNewJobCard: "නව අලුත්වැඩියා කාඩ්පතක්",
    searchRepairsPlaceholder: "පාරිභෝගික දුරකථන අංකය, Job ID (#RE-JOB-...), හෝ උපකරණයේ Serial/Tag ID මගින් සොයන්න...",
    jobFilterAll: "සියලු අලුත්වැඩියා",
    jobFilterReceived: "භාරගත් (Received)",
    jobFilterDiagnosing: "පරීක්ෂා කරමින් (Diagnosing)",
    jobFilterParts: "අමතර කොටස් ලැබෙන තුරු (Parts)",
    jobFilterReady: "භාරදීමට සූදානම් (Ready)",
    jobFilterCompleted: "අවසන් කර භාරදුන් (Completed)",
    statActiveJobs: "ක්‍රියාකාරී අලුත්වැඩියා",
    statAwaitingParts: "අමතර කොටස් අවශ්‍ය",
    statReadyPickup: "භාරදීමට සූදානම්",
    statCompletedJobs: "මෙම මස නිමකළ",

    // Sound Hire & Event Bookings
    hireTitle: "ශබ්ද විකාශන යන්ත්‍ර කුලියට දීම් සහ වෙන්කිරීම්",
    hireSubtitle: "සංගීත ප්‍රසංග, විවාහ උත්සව සහ උත්සව ශබ්ද පරිපාලන උපකරණ කාලසටහන සහ අත්තිකාරම්",
    btnNewHireBooking: "නව ශබ්ද කුලියට දීමක්",
    searchHirePlaceholder: "පාරිභෝගික නම, දුරකථනය, ස්ථානය හෝ වෙන්කිරීම් # මගින් සොයන්න...",
    hireStatUpcoming: "ඉදිරි උත්සව",
    hireStatAdvances: "ලද අත්තිකාරම් මුදල්",
    hireStatPending: "අයවීමට ඇති මුදල්",
    hireStatTotalRev: "මුළු කුලී ආදායම",

    // Reports & Daily Z-Report
    reportsTitle: "ව්‍යාපාරික වාර්තා, ලාභ අලාභ සහ දෛනික Z-වාර්තාව (Daily Closing)",
    reportsSubtitle: "මුදල් පෙට්ටියේ ශේෂයන්, භාණ්ඩ වියදම (COGS), ලාභ ප්‍රතිශත සහ CSV ඩවුන්ලෝඩ්",
    btnOpenZReport: "🧾 දෛනික Z-වාර්තාව (Closing)",
    btnExportSales: "📥 විකුණුම් වාර්තාව (CSV)",
    btnExportInventory: "📥 තොග වාර්තාව (CSV)",
    repStatGrossSales: "අද දින දළ ආදායම",
    repStatEstCOGS: "භාණ්ඩ වියදම (COGS)",
    repStatNetProfit: "ඇස්තමේන්තු ශුද්ධ ලාභය",
    repStatCashInDrawer: "මුදල් පෙට්ටියේ ඇති මුදල",

    // Store Billing & POS
    billingTitle: "කඩේ බඩු විකිණීම සහ සේවා බිල්පත් කිරීම",
    billingSubtitle: "භාණ්ඩ විකිණීම, අලුත්වැඩියා සේවා හෝ දෙකම එකවර ඉක්මනින් බිල් කරන්න",
    filterAll: "දෙකම (සේවා + භාණ්ඩ)",
    filterServices: "සේවා පමණි (Services Only)",
    filterItems: "භාණ්ඩ අලෙවිය පමණි (Items Only)",
    searchCatalog: "භාණ්ඩ, කේබල්, මයික් හෝ අලුත්වැඩියා සොයන්න...",
    addNewProductBtn: "+ නව භාණ්ඩයක් / සේවාවක් එක්කරන්න",
    cartTitle: "වත්මන් බිල්පත (Current Bill)",
    cartEmpty: "තවමත් බිල්පතට කිසිවක් එක් කර නැත. වම්පසින් භාණ්ඩ තෝරන්න.",
    cartCheckoutInvoice: "ඉන්වොයිසියක් බවට පත්කරන්න",
    cartCheckoutQuotation: "මිල ගණන් ලේඛනයක් කරන්න",
    cartPrintReceipt: "ඉක්මන් රිසිට්පත මුද්‍රණය",
    cartCustomerName: "පාරිභෝගික නම",
    cartCustomerPhone: "දුරකථන / WhatsApp අංකය",
    cartDiscount: "වට්ටම (රු.)",
    cartPaid: "ගෙවූ මුදල (රු.)",
    cartChange: "ඉතිරි මුදල / අයවිය යුතු මුදල",
    categoryService: "සේවාව",
    categoryItem: "විකිණීමේ භාණ්ඩය",
    inStock: "තොග ඇත",
    addToBill: "+ එක්කරන්න",

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

