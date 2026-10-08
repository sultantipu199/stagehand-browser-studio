document.addEventListener('DOMContentLoaded', () => {
  // Inputs & Core Controls
  const targetUrlInput = document.getElementById('targetUrlInput');
  const aiInstructionInput = document.getElementById('aiInstructionInput');
  const headlessCheckbox = document.getElementById('headlessCheckbox');
  const headlessLabel = document.getElementById('headlessLabel');
  
  // Desktop Buttons
  const runAutomationBtn = document.getElementById('runAutomationBtn');
  const stopAutomationBtn = document.getElementById('stopAutomationBtn');
  const btnRunText = document.getElementById('btnRunText');
  const btnStopText = document.getElementById('btnStopText');

  // Mobile Bottom Bar Buttons
  const mobileRunAutomationBtn = document.getElementById('mobileRunAutomationBtn');
  const mobileStopAutomationBtn = document.getElementById('mobileStopAutomationBtn');
  const mobileLaunchBtnText = document.getElementById('mobileLaunchBtnText');

  // Mobile Tabs
  const tabBtnControl = document.getElementById('tabBtnControl');
  const tabBtnConsole = document.getElementById('tabBtnConsole');
  const controlPanelSection = document.getElementById('controlPanelSection');
  const monitorPanelSection = document.getElementById('monitorPanelSection');
  const terminalActivityBadge = document.getElementById('terminalActivityBadge');

  // Terminal & Status
  const terminalBody = document.getElementById('terminalBody');
  const clearConsoleBtn = document.getElementById('clearConsoleBtn');
  const statusDot = document.getElementById('statusDot');
  const engineStatusText = document.getElementById('engineStatusText');
  const activeProviderText = document.getElementById('activeProviderText');

  // Language Switcher
  const langToggleBtn = document.getElementById('langToggleBtn');
  const langFlag = document.getElementById('langFlag');
  const langText = document.getElementById('langText');

  // Voice Input Elements
  const voiceMicBtn = document.getElementById('voiceMicBtn');
  const voiceStatusText = document.getElementById('voiceStatusText');
  const voiceListeningBar = document.getElementById('voiceListeningBar');
  const voiceListeningNotice = document.getElementById('voiceListeningNotice');

  // Progress Stepper Items
  const stepLaunch = document.getElementById('stepLaunch');
  const stepNavigate = document.getElementById('stepNavigate');
  const stepExecute = document.getElementById('stepExecute');
  const stepDone = document.getElementById('stepDone');

  // Presets
  const presetCards = document.querySelectorAll('.preset-card');

  // Worldwide Tunnel & Remote Elements
  const openTunnelModalBtn = document.getElementById('openTunnelModalBtn');
  const tunnelDot = document.getElementById('tunnelDot');
  const tunnelStatusText = document.getElementById('tunnelStatusText');
  const qrModal = document.getElementById('qrModal');
  const closeQrModalBtn = document.getElementById('closeQrModalBtn');
  const qrCodeImage = document.getElementById('qrCodeImage');
  const publicUrlDisplay = document.getElementById('publicUrlDisplay');
  const lanUrlDisplay = document.getElementById('lanUrlDisplay');
  const copyPublicUrlBtn = document.getElementById('copyPublicUrlBtn');
  const copyPublicBtnText = document.getElementById('copyPublicBtnText');
  const copyLanUrlBtn = document.getElementById('copyLanUrlBtn');
  const copyLanBtnText = document.getElementById('copyLanBtnText');
  const toggleTunnelBtn = document.getElementById('toggleTunnelBtn');

  // Results Drawer
  const resultsDrawer = document.getElementById('resultsDrawer');
  const resultsContent = document.getElementById('resultsContent');
  const closeResultsBtn = document.getElementById('closeResultsBtn');
  const copyResultBtn = document.getElementById('copyResultBtn');

  // Settings Modal
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const geminiKeyInput = document.getElementById('geminiKeyInput');
  const openaiKeyInput = document.getElementById('openaiKeyInput');
  const anthropicKeyInput = document.getElementById('anthropicKeyInput');

  // State
  let currentLang = localStorage.getItem('stagehand_lang') || 'bn'; // default to Bengali
  let isRunning = false;
  let activeTab = 'control';
  let sseSource = null;
  let speechRecognition = null;
  let isRecordingVoice = false;

  // =========================================================================
  // BILINGUAL TRANSLATION SYSTEM
  // =========================================================================
  const i18n = {
    bn: {
      logoTitle: 'Stagehand এআই ব্রাউজার',
      logoSub: 'কম্পিউটার ও মোবাইল থেকে অটোমেটিক ব্রাউজার কন্ট্রোলার',
      statusIdle: 'প্রস্তুত (Idle)',
      statusRunning: 'কাজ করছে... (Running)',
      tunnelBtnText: '🌍 মোবাইল লিংক ও QR',
      tabControl: 'কন্ট্রোল প্যানেল',
      tabConsole: 'লাইভ মনিটর',
      step1: 'নিচে লিখুন বা মাইকে বলুন',
      step2: '"শুরু করুন" চাপুন',
      step3: 'এআই নিজে সব কাজ করবে!',
      quickPresets: '⚡ জনপ্রিয় কাজসমূহ (১-ক্লিকে সিলেক্ট করুন):',
      presetGoogleTitle: 'গুগলে সার্চ',
      presetGoogleSub: 'যেকোনো তথ্য বা উত্তর খুঁজুন',
      presetYouTubeTitle: 'ইউটিউব ভিডিও',
      presetYouTubeSub: 'ভিডিও সার্চ করে প্লে করুন',
      presetNewsTitle: 'আজকের খবর',
      presetNewsSub: 'প্রথম আলোর প্রধান খবর পড়ুন',
      presetDarazTitle: 'দারাজ শপিং',
      presetDarazSub: 'পছন্দের পণ্যের দাম ও অফার',
      instructionLabel: '🎯 আপনি কী করাতে চান বলুন (বাংলা বা ইংরেজিতে):',
      instructionPlaceholder: 'যেমন: ইউটিউবে গিয়ে সুন্দর রিল্যাক্সিং গান বাজাও, অথবা গুগলে আজকের ঢাকা আবহাওয়া দেখো...',
      voiceSpeak: 'মুখে বলুন',
      voiceListening: '🎙️ আপনার কথা শুনছি... এখন বাংলায় বলুন...',
      urlLabel: '🌐 ওয়েবসাইট লিংক (ঐচ্ছিক - খালি রাখলেও এআই নিজে বুঝে নেবে)',
      urlPlaceholder: 'যেমন: https://www.google.com বা youtube.com',
      advancedOptions: '⚙️ উন্নত সেটিংস ও মোড (Advanced Options)',
      browserViewVisible: 'স্ক্রিনে ব্রাউজার দেখাও',
      browserViewHidden: 'পেছনে চলবে (হিডেন)',
      btnRun: '🚀 এআই ব্রাউজার শুরু করুন',
      btnRunning: 'কাজ চলছে...',
      btnStop: 'থামুন (Stop)',
      progressTitle: '📊 কাজের বর্তমান অবস্থা:',
      stepLaunchTxt: 'ব্রাউজার চালু',
      stepLaunchSub: 'কম্পিউটারে ক্রোম ওপেন হচ্ছে',
      stepNavTxt: 'ওয়েবসাইটে প্রবেশ',
      stepNavSub: 'পেজ লোড সম্পন্ন',
      stepExecTxt: 'এআই কাজ করছে',
      stepExecSub: 'ক্লিক ও টাইপিং সম্পাদন',
      stepDoneTxt: 'কাজ সম্পন্ন!',
      stepDoneSub: 'সফলভাবে সমাপ্ত',
      consoleTitle: 'লাইভ টার্মিনাল লগ',
      initialLog: 'Stagehand এআই স্টুডিও প্রস্তুত। উপরে আপনার নির্দেশ লিখে "শুরু করুন" বাটনে চাপ দিন।',
      resultTitle: '🎉 সংগৃহীত ফলাফল:',
      copyBtn: 'কপি করুন',
      copiedBtn: 'কপি হয়েছে!',
      modalQrTitle: '🌍 মোবাইল ফোন থেকে ব্যবহার করার নিয়ম',
      modalQrDesc: 'বিশ্বের যেকোনো প্রান্ত থেকে যেকোনো সিম কার্ডের ইন্টারনেট (4G/5G) বা ওয়াই-ফাই দিয়ে আপনার ফোন থেকে নিয়ন্ত্রণ করুন।',
      qrTip: '💡 সহজ উপায়: আপনার ফোনের ক্যামেরা দিয়ে এই QR কোডটি স্ক্যান করলেই সরাসরি এই ড্যাশবোর্ড আপনার ফোনে চালু হবে!'
    },
    en: {
      logoTitle: 'Stagehand AI Studio',
      logoSub: 'Autonomous AI Browser Automation Controller',
      statusIdle: 'Idle & Ready',
      statusRunning: 'Executing Task...',
      tunnelBtnText: '🌍 Remote Link & QR',
      tabControl: 'Mission Control',
      tabConsole: 'Live Terminal',
      step1: 'Type prompt or use mic',
      step2: 'Click "Launch Agent"',
      step3: 'AI automates the browser!',
      quickPresets: '⚡ Quick Presets (1-Click Select):',
      presetGoogleTitle: 'Google Search',
      presetGoogleSub: 'Search answers or information',
      presetYouTubeTitle: 'YouTube Video',
      presetYouTubeSub: 'Find & play video automatically',
      presetNewsTitle: 'Latest News',
      presetNewsSub: 'Extract breaking headline stories',
      presetDarazTitle: 'Online Shopping',
      presetDarazSub: 'Check product prices & deals',
      instructionLabel: '🎯 What do you want the AI to do (in English or Bengali):',
      instructionPlaceholder: 'e.g. Type Generative AI into Google, or go to YouTube and play relaxed ambient music...',
      voiceSpeak: 'Voice Input',
      voiceListening: '🎙️ Listening... Please speak your prompt...',
      urlLabel: '🌐 Target Website URL (Optional - AI auto-deduces if omitted)',
      urlPlaceholder: 'e.g. https://www.google.com or youtube.com',
      advancedOptions: '⚙️ Advanced Options & Execution Mode',
      browserViewVisible: 'Visible Browser GUI',
      browserViewHidden: 'Background (Headless)',
      btnRun: '🚀 Launch AI Agent',
      btnRunning: 'Executing Mission...',
      btnStop: 'Stop Session',
      progressTitle: '📊 Execution Status Tracker:',
      stepLaunchTxt: 'Launch Browser',
      stepLaunchSub: 'Spinning up Chrome CDP',
      stepNavTxt: 'Navigate Page',
      stepNavSub: 'Target URL loaded',
      stepExecTxt: 'AI Action',
      stepExecSub: 'Clicking & inputting',
      stepDoneTxt: 'Task Complete!',
      stepDoneSub: 'Mission finished',
      consoleTitle: 'Live Execution Console',
      initialLog: 'Stagehand Studio initialized. Ready for automation mission.',
      resultTitle: '🎉 Extracted Output:',
      copyBtn: 'Copy',
      copiedBtn: 'Copied!',
      modalQrTitle: '🌍 Worldwide Remote & Mobile Access',
      modalQrDesc: 'Access this dashboard from ANY device, ANY cellular network (4G/5G), or ANY Wi-Fi worldwide.',
      qrTip: '💡 Scan the QR Code with your smartphone camera to immediately control your agent from anywhere.'
    }
  };

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('stagehand_lang', lang);
    const t = i18n[lang];

    // Language Toggle Button UI
    langFlag.textContent = lang === 'bn' ? '🇧🇩' : '🇺🇸';
    langText.textContent = lang === 'bn' ? 'বাংলা' : 'English';

    // Header & Titles
    document.getElementById('txtLogoTitle').textContent = t.logoTitle;
    document.getElementById('txtLogoSub').textContent = t.logoSub;
    if (!isRunning) {
      engineStatusText.textContent = t.statusIdle;
    }
    tunnelStatusText.textContent = t.tunnelBtnText;

    // Mobile tabs
    document.getElementById('tabControlLabel').textContent = t.tabControl;
    document.getElementById('tabConsoleLabel').textContent = t.tabConsole;

    // Step banner
    document.getElementById('txtStep1').textContent = t.step1;
    document.getElementById('txtStep2').textContent = t.step2;
    document.getElementById('txtStep3').textContent = t.step3;

    // Presets
    document.getElementById('txtQuickPresets').textContent = t.quickPresets;
    document.getElementById('presetGoogleTitle').textContent = t.presetGoogleTitle;
    document.getElementById('presetGoogleSub').textContent = t.presetGoogleSub;
    document.getElementById('presetYouTubeTitle').textContent = t.presetYouTubeTitle;
    document.getElementById('presetYouTubeSub').textContent = t.presetYouTubeSub;
    document.getElementById('presetNewsTitle').textContent = t.presetNewsTitle;
    document.getElementById('presetNewsSub').textContent = t.presetNewsSub;
    document.getElementById('presetDarazTitle').textContent = t.presetDarazTitle;
    document.getElementById('presetDarazSub').textContent = t.presetDarazSub;

    // Inputs
    document.getElementById('txtInstructionLabel').textContent = t.instructionLabel;
    aiInstructionInput.placeholder = t.instructionPlaceholder;
    voiceStatusText.textContent = t.voiceSpeak;
    voiceListeningNotice.textContent = t.voiceListening;
    document.getElementById('txtUrlLabel').innerHTML = `${t.urlLabel} <span class="badge-optional">(${lang === 'bn' ? 'ঐচ্ছিক' : 'Optional'})</span>`;
    targetUrlInput.placeholder = t.urlPlaceholder;

    // Advanced
    document.getElementById('txtAdvancedOptions').textContent = t.advancedOptions;
    headlessLabel.textContent = headlessCheckbox.checked ? t.browserViewHidden : t.browserViewVisible;

    // Buttons
    if (!isRunning) {
      btnRunText.textContent = t.btnRun;
      mobileLaunchBtnText.textContent = t.btnRun;
    } else {
      btnRunText.textContent = t.btnRunning;
      mobileLaunchBtnText.textContent = t.btnRunning;
    }
    btnStopText.textContent = t.btnStop;

    // Stepper
    document.getElementById('txtProgressTitle').textContent = t.progressTitle;
    document.getElementById('stepLaunchTxt').textContent = t.stepLaunchTxt;
    document.getElementById('stepLaunchSub').textContent = t.stepLaunchSub;
    document.getElementById('stepNavTxt').textContent = t.stepNavTxt;
    document.getElementById('stepNavSub').textContent = t.stepNavSub;
    document.getElementById('stepExecTxt').textContent = t.stepExecTxt;
    document.getElementById('stepExecSub').textContent = t.stepExecSub;
    document.getElementById('stepDoneTxt').textContent = t.stepDoneTxt;
    document.getElementById('stepDoneSub').textContent = t.stepDoneSub;

    // Monitor
    document.getElementById('txtConsoleTitle').textContent = t.consoleTitle;
    document.getElementById('txtResultTitle').textContent = t.resultTitle;
    document.getElementById('copyResultBtn').textContent = t.copyBtn;

    // Modal
    document.getElementById('txtModalQrTitle').textContent = t.modalQrTitle;
    document.getElementById('txtModalQrDesc').textContent = t.modalQrDesc;
    document.getElementById('txtQrTip').textContent = t.qrTip;
  }

  // Toggle Language Handler
  langToggleBtn.addEventListener('click', () => {
    const nextLang = currentLang === 'bn' ? 'en' : 'bn';
    applyLanguage(nextLang);
  });

  // Initialize Language
  applyLanguage(currentLang);

  // Toggle headless label
  headlessCheckbox.addEventListener('change', () => {
    const t = i18n[currentLang];
    headlessLabel.textContent = headlessCheckbox.checked ? t.browserViewHidden : t.browserViewVisible;
  });

  // =========================================================================
  // PRESET CARDS SELECTION (1-CLICK POPULAR ACTIONS)
  // =========================================================================
  presetCards.forEach((card) => {
    card.addEventListener('click', () => {
      presetCards.forEach(c => c.classList.remove('active-card'));
      card.classList.add('active-card');

      const url = card.getAttribute('data-url');
      const inst = card.getAttribute('data-inst');
      const mode = card.getAttribute('data-mode') || 'act';

      if (url) targetUrlInput.value = url;
      if (inst) aiInstructionInput.value = inst;

      const radio = document.querySelector(`input[name="executionMode"][value="${mode}"]`);
      if (radio) radio.checked = true;

      // Provide gentle tactile feedback
      card.style.transform = 'scale(0.97)';
      setTimeout(() => { card.style.transform = ''; }, 150);
    });
  });

  // Smart URL Deduction on Typing: If user mentions a service in instruction, suggest domain
  aiInstructionInput.addEventListener('input', () => {
    const val = aiInstructionInput.value.toLowerCase();
    // Only auto-fill if user hasn't typed an explicit custom URL or it's standard Google
    if (!targetUrlInput.value || targetUrlInput.value.includes('google.com')) {
      if (val.includes('youtube') || val.includes('ইউটিউব')) {
        targetUrlInput.value = 'https://www.youtube.com';
      } else if (val.includes('daraz') || val.includes('দারাজ')) {
        targetUrlInput.value = 'https://www.daraz.com.bd';
      } else if (val.includes('prothomalo') || val.includes('প্রথম আলো')) {
        targetUrlInput.value = 'https://www.prothomalo.com';
      } else if (val.includes('facebook') || val.includes('ফেসবুক')) {
        targetUrlInput.value = 'https://www.facebook.com';
      } else if (val.includes('wikipedia') || val.includes('উইকিপিডিয়া')) {
        targetUrlInput.value = 'https://en.wikipedia.org';
      }
    }
  });

  // =========================================================================
  // VOICE SPEECH-TO-TEXT INPUT (মুখে বলে নির্দেশ দেওয়া)
  // =========================================================================
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;

    speechRecognition.onstart = () => {
      isRecordingVoice = true;
      voiceMicBtn.classList.add('recording');
      voiceListeningBar.style.display = 'flex';
      voiceStatusText.textContent = currentLang === 'bn' ? 'শুনছি...' : 'Listening...';
    };

    speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        aiInstructionInput.value = transcript;
        aiInstructionInput.dispatchEvent(new Event('input'));
      }
    };

    speechRecognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      stopVoiceRecording();
    };

    speechRecognition.onend = () => {
      stopVoiceRecording();
    };

    function stopVoiceRecording() {
      isRecordingVoice = false;
      voiceMicBtn.classList.remove('recording');
      voiceListeningBar.style.display = 'none';
      voiceStatusText.textContent = i18n[currentLang].voiceSpeak;
    }

    voiceMicBtn.addEventListener('click', () => {
      if (isRecordingVoice) {
        speechRecognition.stop();
        stopVoiceRecording();
      } else {
        speechRecognition.lang = currentLang === 'bn' ? 'bn-BD' : 'en-US';
        try {
          speechRecognition.start();
        } catch {
          // Restart if already active
          speechRecognition.stop();
          setTimeout(() => speechRecognition.start(), 200);
        }
      }
    });
  } else {
    // Web speech not supported in this browser
    voiceMicBtn.style.opacity = '0.5';
    voiceMicBtn.title = 'Voice input not supported in this browser';
  }

  // =========================================================================
  // STEP PROGRESS TRACKER (BEGINNER FRIENDLY)
  // =========================================================================
  function resetStepper() {
    [stepLaunch, stepNavigate, stepExecute, stepDone].forEach(step => {
      if (step) {
        step.classList.remove('active', 'completed');
      }
    });
  }

  function setStep(stepNum) {
    resetStepper();
    if (stepNum >= 1) stepLaunch.classList.add(stepNum === 1 ? 'active' : 'completed');
    if (stepNum >= 2) stepNavigate.classList.add(stepNum === 2 ? 'active' : 'completed');
    if (stepNum >= 3) stepExecute.classList.add(stepNum === 3 ? 'active' : 'completed');
    if (stepNum >= 4) stepDone.classList.add('completed');
  }

  // Mobile Tab Switching
  function switchMobileTab(targetTab) {
    activeTab = targetTab;
    if (targetTab === 'control') {
      tabBtnControl.classList.add('active');
      tabBtnConsole.classList.remove('active');
      controlPanelSection.classList.add('tab-view-active');
      monitorPanelSection.classList.remove('tab-view-active');
    } else {
      tabBtnConsole.classList.add('active');
      tabBtnControl.classList.remove('active');
      monitorPanelSection.classList.add('tab-view-active');
      controlPanelSection.classList.remove('tab-view-active');
      terminalActivityBadge.classList.remove('active');
      setTimeout(() => {
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }, 50);
    }
  }

  tabBtnControl.addEventListener('click', () => switchMobileTab('control'));
  tabBtnConsole.addEventListener('click', () => switchMobileTab('monitor'));

  // Append Log Line to Terminal
  function appendLog(message, type = 'info', timestamp = new Date().toLocaleTimeString()) {
    const line = document.createElement('div');
    line.className = `log-line log-${type}`;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = `[${timestamp}]`;

    const msgSpan = document.createElement('span');
    msgSpan.className = 'log-msg';
    msgSpan.textContent = message;

    line.appendChild(timeSpan);
    line.appendChild(msgSpan);
    terminalBody.appendChild(line);

    // Auto scroll
    terminalBody.scrollTop = terminalBody.scrollHeight;

    // Notify mobile tab if in background
    if (activeTab !== 'monitor' && type !== 'info') {
      terminalActivityBadge.classList.add('active');
    }

    // Step tracker heuristics
    if (message.includes('Launching local Chrome browser') || message.includes('Browser launched')) {
      setStep(1);
    } else if (message.includes('Navigating to') || message.includes('Successfully loaded')) {
      setStep(2);
    } else if (message.includes('Running stagehand') || message.includes('Act executed') || message.includes('Extraction complete')) {
      setStep(3);
    } else if (message.includes('Task execution finished successfully')) {
      setStep(4);
    }
  }

  // Clear Terminal
  clearConsoleBtn.addEventListener('click', () => {
    terminalBody.innerHTML = '';
    appendLog(i18n[currentLang].initialLog, 'system');
  });

  // Copy Extracted Result
  copyResultBtn.addEventListener('click', () => {
    if (navigator.clipboard && resultsContent.textContent) {
      navigator.clipboard.writeText(resultsContent.textContent);
      copyResultBtn.textContent = i18n[currentLang].copiedBtn;
      setTimeout(() => {
        copyResultBtn.textContent = i18n[currentLang].copyBtn;
      }, 2000);
    }
  });

  closeResultsBtn.addEventListener('click', () => {
    resultsDrawer.style.display = 'none';
  });

  // Update Execution State UI
  function setRunningState(running) {
    isRunning = running;
    const t = i18n[currentLang];

    runAutomationBtn.disabled = running;
    mobileRunAutomationBtn.disabled = running;
    stopAutomationBtn.disabled = !running;
    mobileStopAutomationBtn.disabled = !running;

    if (running) {
      statusDot.className = 'status-dot running';
      engineStatusText.textContent = t.statusRunning;
      btnRunText.textContent = t.btnRunning;
      mobileLaunchBtnText.textContent = t.btnRunning;
      setStep(1);
    } else {
      statusDot.className = 'status-dot';
      engineStatusText.textContent = t.statusIdle;
      btnRunText.textContent = t.btnRun;
      mobileLaunchBtnText.textContent = t.btnRun;
    }
  }

  // Start Automation Mission
  async function startAutomation() {
    const url = targetUrlInput.value.trim();
    const instruction = aiInstructionInput.value.trim();
    const mode = document.querySelector('input[name="executionMode"]:checked')?.value || 'act';
    const headless = headlessCheckbox.checked;

    if (!instruction) {
      alert(currentLang === 'bn' ? 'অনুগ্রহ করে এআই নির্দেশ লিখুন!' : 'Please enter an AI instruction!');
      aiInstructionInput.focus();
      return;
    }

    setRunningState(true);
    resultsDrawer.style.display = 'none';
    appendLog(`🚀 Mission Initialized: [${mode.toUpperCase()}]`, 'info');

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, instruction, mode, headless }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server rejected the request');
      }

      appendLog(`Server accepted task. Executing with ${data.task.mode}...`, 'info');
      // If mobile, automatically transition to Live Terminal view to watch progress
      if (window.innerWidth <= 960) {
        switchMobileTab('monitor');
      }
    } catch (err) {
      appendLog(`Error: ${err.message}`, 'error');
      setRunningState(false);
      resetStepper();
    }
  }

  // Stop Automation Session
  async function stopAutomation() {
    appendLog('Sending Stop signal...', 'warn');
    stopAutomationBtn.disabled = true;
    mobileStopAutomationBtn.disabled = true;

    try {
      const response = await fetch('/api/stop', { method: 'POST' });
      const data = await response.json();
      appendLog(data.message || 'Automation stopped.', 'warn');
    } catch (err) {
      appendLog(`Failed to stop: ${err.message}`, 'error');
    }
  }

  runAutomationBtn.addEventListener('click', startAutomation);
  mobileRunAutomationBtn.addEventListener('click', startAutomation);
  stopAutomationBtn.addEventListener('click', stopAutomation);
  mobileStopAutomationBtn.addEventListener('click', stopAutomation);

  // SSE Real-Time Connection
  function setupSSE() {
    if (sseSource) {
      sseSource.close();
    }

    sseSource = new EventSource('/api/stream');

    sseSource.onopen = () => {
      console.log('Telemetry stream connected.');
    };

    sseSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.event === 'log') {
          const { message, type, timestamp } = payload.data;
          appendLog(message, type, timestamp);
        } else if (payload.event === 'task_complete') {
          setStep(4);
          if (payload.data && payload.data.result) {
            resultsContent.textContent = typeof payload.data.result === 'object' 
              ? JSON.stringify(payload.data.result, null, 2) 
              : String(payload.data.result);
            resultsDrawer.style.display = 'block';
          }
        } else if (payload.event === 'status_change') {
          setRunningState(payload.data.isRunning);
        } else if (payload.event === 'tunnel_update') {
          updateTunnelStatus(payload.data.publicUrl, payload.data.active);
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    sseSource.onerror = () => {
      console.warn('SSE stream disconnected, reconnecting in 3s...');
      sseSource.close();
      setTimeout(setupSSE, 3000);
    };
  }

  // Mobile App Lifecycle: Reconnect on page resume
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchNetworkInfo();
      fetchStatus();
      if (!sseSource || sseSource.readyState === EventSource.CLOSED) {
        setupSSE();
      }
    }
  });

  // Fetch Initial Engine Status
  async function fetchStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      activeProviderText.textContent = data.provider || 'Gemini 3.5 Flash';
      setRunningState(Boolean(data.isRunning));
      if (data.publicUrl) {
        updateTunnelStatus(data.publicUrl, true);
      }
    } catch {
      activeProviderText.textContent = 'Disconnected';
    }
  }

  // Fetch Network Info & QR Code
  async function fetchNetworkInfo() {
    try {
      const res = await fetch('/api/network-info');
      const data = await res.json();

      if (data.qrCode) {
        qrCodeImage.src = data.qrCode;
      }
      lanUrlDisplay.value = data.lanUrl || `http://${data.ip}:${data.port}`;
      if (data.publicUrl) {
        publicUrlDisplay.value = data.publicUrl;
        updateTunnelStatus(data.publicUrl, true);
      } else {
        publicUrlDisplay.value = 'টানেল সক্রিয় হচ্ছে...';
        updateTunnelStatus(null, false);
      }
    } catch (err) {
      console.error('Network info error:', err);
    }
  }

  function updateTunnelStatus(url, active) {
    if (active && url) {
      tunnelDot.className = 'tunnel-dot active';
      tunnelStatusText.textContent = currentLang === 'bn' ? '🌍 অনলাইন' : '🌍 Online';
      publicUrlDisplay.value = url;
    } else {
      tunnelDot.className = 'tunnel-dot';
      tunnelStatusText.textContent = currentLang === 'bn' ? '🌍 কানেক্টিং...' : '🌍 Connecting...';
      publicUrlDisplay.value = currentLang === 'bn' ? 'টানেল শুরু হচ্ছে...' : 'Starting tunnel...';
    }
  }

  // Copy helper
  function setupCopyButton(btn, inputElem, labelElem) {
    btn.addEventListener('click', () => {
      if (!inputElem.value) return;
      navigator.clipboard.writeText(inputElem.value).then(() => {
        const original = labelElem.textContent;
        labelElem.textContent = i18n[currentLang].copiedBtn;
        setTimeout(() => {
          labelElem.textContent = original;
        }, 1500);
      });
    });
  }

  setupCopyButton(copyPublicUrlBtn, publicUrlDisplay, copyPublicBtnText);
  setupCopyButton(copyLanUrlBtn, lanUrlDisplay, copyLanBtnText);

  // Toggle Worldwide Public Tunnel
  toggleTunnelBtn.addEventListener('click', async () => {
    toggleTunnelBtn.disabled = true;
    toggleTunnelBtn.textContent = currentLang === 'bn' ? 'রিস্টার্ট হচ্ছে...' : 'Restarting...';
    try {
      const res = await fetch('/api/tunnel/toggle', { method: 'POST' });
      const data = await res.json();
      updateTunnelStatus(data.publicUrl, data.active);
      fetchNetworkInfo();
    } catch (err) {
      alert(`Tunnel toggle failed: ${err.message}`);
    } finally {
      toggleTunnelBtn.disabled = false;
      toggleTunnelBtn.textContent = currentLang === 'bn' ? 'টানেল রিস্টার্ট করুন' : 'Restart Tunnel';
    }
  });

  // Worldwide Remote Modal
  openTunnelModalBtn.addEventListener('click', () => {
    fetchNetworkInfo();
    qrModal.style.display = 'flex';
  });

  closeQrModalBtn.addEventListener('click', () => {
    qrModal.style.display = 'none';
  });

  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) qrModal.style.display = 'none';
  });

  // Settings Modal Handlers
  openSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
  });

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  cancelSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.style.display = 'none';
  });

  saveSettingsBtn.addEventListener('click', async () => {
    const geminiKey = geminiKeyInput.value.trim();
    const openaiKey = openaiKeyInput.value.trim();
    const anthropicKey = anthropicKeyInput.value.trim();

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiKey, openaiKey, anthropicKey }),
      });
      const data = await res.json();
      if (data.success) {
        alert(currentLang === 'bn' ? 'এপিআই কি সফলভাবে সংরক্ষিত হয়েছে!' : 'API Keys saved successfully!');
        settingsModal.style.display = 'none';
        fetchStatus();
      }
    } catch (err) {
      alert(`Failed to save settings: ${err.message}`);
    }
  });

  // Keyboard shortcut: Ctrl + Enter to launch
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!isRunning) {
        startAutomation();
      }
    }
  });

  // Boot
  setupSSE();
  fetchStatus();
  fetchNetworkInfo();
});
