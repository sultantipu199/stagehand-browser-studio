# 🎭 Stagehand Autonomous AI Browser Studio & Remote Controller

<p align="center">
  <img src="https://img.shields.io/badge/Stagehand-v3.0.8-blue.svg" alt="Stagehand Version" />
  <img src="https://img.shields.io/badge/Node.js-v20%2B-green.svg" alt="Node.js Version" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/AI_Model-Gemini_3.5_Flash-purple.svg" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Access-Worldwide_HTTPS_Tunnel-orange.svg" alt="Worldwide Tunnel" />
  <img src="https://img.shields.io/badge/License-MIT-brightgreen.svg" alt="MIT License" />
</p>

An intelligent, autonomous browser automation studio powered by **Stagehand** (by Browserbase) and **Google Gemini AI (`gemini-3.5-flash`)**. Controls local Chrome directly on your machine while allowing you to monitor and control tasks from **any device, cellular network (4G/5G), or Wi-Fi network worldwide**.

---

## 🌍 English Overview

### ✨ Key Features
- **🌐 Worldwide Remote Access (Zero-Config HTTPS Tunnel)**:
  - Automatically provisions a fast, secure Cloudflare Quick Tunnel (`*.trycloudflare.com`) on startup with automatic fallback to Localtunnel.
  - Access and operate your desktop's browser automation from your smartphone or tablet from anywhere on Earth over mobile cellular data (4G/5G).
- **📱 Instant QR Pairing & Responsive Web GUI**:
  - Automatically scans and generates a high-resolution QR code right on the desktop dashboard.
  - Scan with any phone camera to instantly pair and launch missions.
  - Mobile-first adaptive layout with tab navigation and floating launch bar.
- **⚡ Dual AI Engine Architecture**:
  - Default: **Google Gemini 3.5 Flash** (`gemini-3.5-flash`) for lightning-fast DOM comprehension with zero latency.
  - Flexible fallbacks: Supports OpenAI (`gpt-4o`) and Anthropic (`claude-3-5-sonnet`).
- **🎯 3 Automation Modes**:
  - `ACT`: Perform dynamic interactions (clicking, filling forms, searching, navigating).
  - `EXTRACT`: Extract structured data into JSON from any web page.
  - `OBSERVE`: Analyze page states and identify interactive elements.
- **📡 Real-Time Telemetry (SSE)**:
  - Live log streaming with auto-reconnect on mobile network shifts.
  - Real-time CDP (Chrome DevTools Protocol) event feedback.

---

## 🇧🇩 বাংলা নির্দেশিকা (Bangla Documentation)

### 🚀 যেকোনো জায়গা থেকে যেকোনো ইন্টারনেট কানেকশনে ব্যবহার করুন:

1. **ডেক্সটপে ড্যাশবোর্ড চালু করুন**:
   - `run-gui.bat` ফাইলে ডাবল-ক্লিক করুন অথবা টার্মিনালে `npm run gui` চালান।
2. **বিশ্বব্যাপী পাবলিক লিঙ্ক (Worldwide HTTPS URL)**:
   - সার্ভার চালু হওয়ার সাথে সাথেই এটি একটি নিরাপদ পাবলিক লিঙ্ক তৈরি করে (যেমন: `https://xxxx.trycloudflare.com`)।
3. **মোবাইল থেকে কানেক্ট করুন**:
   - আপনার ফোনের ব্রাউজারে পাবলিক লিঙ্কটি ওপেন করুন অথবা স্ক্রিনের **"📱 Worldwide & QR"** বাটনে ক্লিক করে ফোনের ক্যামেরা দিয়ে QR কোডটি স্ক্যান করুন।
   - আপনি অফিসে, রাস্তায় কিংবা যেকোনো মোবাইল ডেটা (4G/5G) ব্যবহার করেও বাসা বা অফিসের কম্পিউটারের ব্রাউজার এআই দিয়ে চালাতে পারবেন!

---

## 🛠️ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- Google Chrome installed locally
- Google Gemini API key (Get free at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/stagehand-autonomous-browser-studio.git
   cd stagehand-autonomous-browser-studio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file and add your Gemini API Key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Launch the Studio**:
   - **Windows 1-Click**: Double-click `run-gui.bat`
   - **Terminal command**:
     ```bash
     npm run gui
     ```

---

## 📦 Project Structure

```text
├── .github/workflows/
│   └── ci.yml               # Automated GitHub Actions CI workflow
├── public/
│   ├── index.html           # Glassmorphism cybernetic UI
│   ├── style.css            # Responsive CSS (Desktop & Mobile)
│   └── app.js               # Reactive client & SSE telemetry
├── index.ts                 # CLI automation runner
├── server.ts                # Express backend + Cloudflare Tunnel engine
├── run-gui.bat              # 1-click Windows launcher for Web GUI
├── run.bat                  # 1-click Windows launcher for CLI runner
├── .env.example             # Template for API credentials
├── .gitignore               # Strict security exclusion list
├── tsconfig.json            # TypeScript compiler configuration
├── package.json             # NPM dependencies & scripts
└── LICENSE                  # MIT License
```

---

## 🧑‍💻 Development Commands

| Command | Description |
| :--- | :--- |
| `npm run gui` | Starts the Express server, Cloudflare tunnel & Web GUI |
| `npm start` | Executes the CLI automation runner via `tsx index.ts` |
| `npm run typecheck` | Validates TypeScript types with `tsc --noEmit` |
| `npm run build` | Compiles TypeScript into JavaScript in `dist/` |

---

## 🔒 Security & Privacy Notice
- Never commit your `.env` file to GitHub or any public repository.
- Sensitive environment variables are excluded in `.gitignore`.
- Cloudflare Quick Tunnel traffic is encrypted via TLS/HTTPS end-to-end.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
