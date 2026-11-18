# Recital Electronic - Invoice & Quotation Builder
### ඉන්වොයිස් සහ මිල ගණන් පද්ධතිය (Sinhala & English)

A modern, easy-to-use **Invoice & Quotation Builder** web application designed specifically for **Recital Electronic** (Anuradhapura, Sri Lanka).

Built to match the official letterhead template with exact logos, decorative ribbons, registration details, bilingual (Sinhala ↔ English) controls, auto calculations, and one-click PDF & WhatsApp sharing.

---

## 🌟 Key Features

1. **Bilingual UI (සිංහල සහ ඉංග්‍රීසි)**:
   - 1-click toggle between **සිංහල** and **English** for the entire interface.
   - Print language options: **Bilingual (English + සිංහල)**, **English Only**, or **සිංහල පමණි**.
   - **Amount in Words (මුදල අකුරින්)**: Automatically generates the grand total in both English (*e.g., "Twenty-Five Thousand Rupees Only"*) and Sinhala (*e.g., "රුපියල් විසිපන්දහසයි පමණි"*).

2. **Quotation ↔ Invoice Toggle**:
   - 1-click switcher between **Quotation (මිල ගණන් කැඳවීම)** and **Invoice (ඉන්වොයිසිය)**.
   - Auto-generated sequential numbers with custom prefixes (`RE-QT-2026-001`, `RE-INV-2026-001`).
   - "Convert to Invoice" button to instantly convert a quotation into an official invoice without retyping!

3. **Exact Official Letterhead Design**:
   - Official **Recital Sounds & Electronics** red horn logo.
   - High-resolution top & bottom red/gold ribbon graphics matching the original PDF template.
   - Pre-configured with business details:
     - **Name:** RECITAL ELECTRONIC
     - **Address:** 583/2, Dewata Road, Kudhanelumkulama, Galkulama, Anuradhapura
     - **Phone:** 0763366993
     - **Business Reg No:** NCP/NPE/004141
   - Toggle to show graphics (for blank paper / PDF) or hide graphics (when printing on pre-printed company letterhead).

4. **Items & Services Builder with Quick Presets**:
   - Common sound system hire and electronic repair presets:
     - Sound System Hire (Standard Package) / ශබ්ද විකාශන යන්ත්‍ර කුලියට දීම
     - Power Amplifier Repair Service / ඇම්ප්ලිෆයර් අලුත්වැඩියාව
     - 15-Inch Speaker Boxes / ස්පීකර් පෙට්ටි
     - Wireless Microphones / රැහැන් රහිත මයික්‍රෆෝන්
     - Audio Mixers, Subwoofers, Cables, PCB repair, etc.
   - Automatic line-total calculations: `Quantity × Unit Price = Amount`.

5. **Financial Summary & Payment**:
   - Subtotal, Discount (Rs.), Transport / Delivery charges, Advance Paid, and Balance Due.
   - Pre-configured Bank Details (Bank of Ceylon / Commercial Bank, Account Number, Branch).
   - Warranty & Terms checklist (3 Months Repair Warranty, 50% Advance on bookings, etc.).

6. **Export & Sharing**:
   - **Print / Save as PDF**: Formatted standard A4 layout via `@media print`.
   - **Direct PDF Download**: Client-side single-click PDF file download.
   - **WhatsApp Share**: Formats a clean WhatsApp bill summary with emojis and opens customer's WhatsApp chat directly (auto formats Sri Lankan numbers starting with `07x` to `+947x`).
   - **Offline Auto-Save & History**: Saves documents in browser LocalStorage. View past invoices, reopen, duplicate, delete, and export/import JSON backups.

---

## 🚀 How to Host on GitHub Pages (Step-by-Step)

This application is 100% static (HTML, CSS, Vanilla JS) with **zero build steps** or server requirements. It runs directly on GitHub Pages!

### Step 1: Create a Repository on GitHub
1. Go to [GitHub.com](https://github.com/) and log into your account.
2. Click the **+** (plus icon) at the top right and select **New repository**.
3. Name your repository (e.g., `invoice-builder` or `recital-invoices`).
4. Set it to **Public** and leave "Initialize this repository with a README" **unchecked** (we already have one).
5. Click **Create repository**.

### Step 2: Push Your Code from This Folder
Open PowerShell or your terminal in this directory (`c:\Users\Chamara\OneDrive - Wardena Group\Documents\Invoice builder`) and run:

```bash
# 1. Initialize git (if not already done)
git init
git checkout -b main

# 2. Add all files and commit
git add .
git commit -m "Initial release of Recital Electronic Invoice & Quotation Builder"

# 3. Link your new GitHub repository (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 4. Push to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. On your GitHub repository page, click the **Settings** tab (the gear icon).
2. In the left sidebar, click **Pages** (under "Code and automation").
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `main` and folder `/ (root)`.
   - Click **Save**.
4. Wait about 30 to 60 seconds. Refresh the page, and GitHub will provide your live URL:
   `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

---

## 📱 Use on Mobile / Tablet (Father's Phone)
1. Open the GitHub Pages URL in Google Chrome or Safari on your father's phone or tablet.
2. Tap the browser menu (three dots `⋮` on Chrome or Share `⎙` on Safari).
3. Tap **Add to Home screen** (මුල් තිරයට එක් කරන්න).
4. An app icon named **Recital Electronic** will appear on his phone screen. He can tap it anytime to generate invoices and send them to customers over WhatsApp in seconds!

---

## 📁 File Structure

```
├── index.html          # Main application interface and preview layout
├── style.css           # Styling, typography, responsive rules, and @media print
├── app.js              # Application state, calculations, PDF export, WhatsApp sharing
├── translations.js     # Sinhala & English dictionaries, Number-to-Words engines
├── README.md           # Documentation & GitHub Pages deployment guide
└── assets/
    ├── logo.png                     # Official Recital Sounds & Electronics logo
    ├── letterhead_bg.png            # A4 Background with top & bottom ribbon graphics
    ├── letterhead_bg_transparent.png# Transparent ribbons version
    ├── top_ribbon.png               # Standalone top ribbon graphic
    └── bottom_ribbon.png            # Standalone bottom ribbon graphic
```

---

© 2026 Recital Electronic, Anuradhapura. Built with ❤️ for family business.
