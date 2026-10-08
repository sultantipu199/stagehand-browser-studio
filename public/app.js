document.addEventListener('DOMContentLoaded', () => {
  // Inputs & Core Controls
  const targetUrlInput = document.getElementById('targetUrlInput');
  const aiInstructionInput = document.getElementById('aiInstructionInput');
  const headlessCheckbox = document.getElementById('headlessCheckbox');
  const headlessLabel = document.getElementById('headlessLabel');
  
  // Desktop Buttons
  const runAutomationBtn = document.getElementById('runAutomationBtn');
  const stopAutomationBtn = document.getElementById('stopAutomationBtn');

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

  // Settings Modal
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const geminiKeyInput = document.getElementById('geminiKeyInput');
  const openaiKeyInput = document.getElementById('openaiKeyInput');
  const anthropicKeyInput = document.getElementById('anthropicKeyInput');

  // Presets
  const presetChips = document.querySelectorAll('.preset-chip');

  // State
  let isRunning = false;
  let activeTab = 'control';
  let sseSource = null;

  // Toggle headless label
  headlessCheckbox.addEventListener('change', () => {
    headlessLabel.textContent = headlessCheckbox.checked ? 'Background (Headless)' : 'Visible GUI';
  });

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

    terminalBody.scrollTop = terminalBody.scrollHeight;

    // Show unread activity dot on mobile if on control tab
    if (activeTab === 'control' && window.innerWidth <= 960) {
      terminalActivityBadge.classList.add('active');
    }
  }

  // Clear Console
  clearConsoleBtn.addEventListener('click', () => {
    terminalBody.innerHTML = '';
    appendLog('Console cleared.', 'system');
  });

  // Update UI Execution State
  function setRunningState(running) {
    isRunning = running;
    if (running) {
      statusDot.className = 'status-dot running';
      engineStatusText.textContent = 'Executing';
      
      runAutomationBtn.disabled = true;
      stopAutomationBtn.disabled = false;

      mobileRunAutomationBtn.disabled = true;
      mobileStopAutomationBtn.disabled = false;
      mobileLaunchBtnText.textContent = 'Agent Running...';
    } else {
      statusDot.className = 'status-dot idle';
      engineStatusText.textContent = 'Idle';

      runAutomationBtn.disabled = false;
      stopAutomationBtn.disabled = true;

      mobileRunAutomationBtn.disabled = false;
      mobileStopAutomationBtn.disabled = true;
      mobileLaunchBtnText.textContent = 'Launch Agent';
    }
  }

  // Fetch Server Status
  async function fetchStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      activeProviderText.textContent = data.provider || 'Ready';
      setRunningState(data.isRunning);
      if (data.publicUrl) {
        tunnelDot.className = 'tunnel-dot';
        tunnelStatusText.textContent = '🌍 Global Live';
      } else {
        tunnelDot.className = 'tunnel-dot offline';
        tunnelStatusText.textContent = '🌍 Local LAN';
      }
    } catch {
      activeProviderText.textContent = 'Offline';
    }
  }

  // Fetch Network Info & Load QR Code
  async function loadNetworkInfo() {
    try {
      const res = await fetch('/api/network-info');
      const data = await res.json();

      if (data.publicUrl) {
        publicUrlDisplay.value = data.publicUrl;
        tunnelDot.className = 'tunnel-dot';
        tunnelStatusText.textContent = '🌍 Global Live';
        toggleTunnelBtn.textContent = 'Stop Worldwide Tunnel';
      } else {
        publicUrlDisplay.value = 'Tunnel inactive (Click Restart below)';
        tunnelDot.className = 'tunnel-dot offline';
        tunnelStatusText.textContent = '🌍 Local LAN';
        toggleTunnelBtn.textContent = 'Start Worldwide Tunnel';
      }

      if (data.lanUrl) {
        lanUrlDisplay.value = data.lanUrl;
      }

      if (data.qrCode) {
        qrCodeImage.src = data.qrCode;
      }
    } catch (err) {
      console.error('Failed to load network info:', err);
    }
  }

  // Initialize SSE Connection with Auto-Reconnect
  function setupEventStream() {
    if (sseSource) {
      try { sseSource.close(); } catch {}
    }

    sseSource = new EventSource('/api/stream');

    sseSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.event === 'log') {
          const { message, type, timestamp, details } = payload.data;
          appendLog(message, type, timestamp);
          if (details) {
            appendLog(`Output:\n${details}`, 'success');
          }
        } else if (payload.event === 'status_change') {
          setRunningState(payload.data.isRunning);
        } else if (payload.event === 'tunnel_update') {
          loadNetworkInfo();
        } else if (payload.event === 'task_complete') {
          setRunningState(false);
          if (payload.data && payload.data.result) {
            resultsContent.textContent = typeof payload.data.result === 'object' 
              ? JSON.stringify(payload.data.result, null, 2) 
              : String(payload.data.result);
            resultsDrawer.style.display = 'block';
          }
        } else if (payload.event === 'task_error') {
          setRunningState(false);
          appendLog(`Error: ${payload.data.error}`, 'error');
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    sseSource.onerror = () => {
      setTimeout(setupEventStream, 3500);
    };
  }

  // Re-verify connection on phone unlock / tab focus
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchStatus();
      if (!sseSource || sseSource.readyState === EventSource.CLOSED) {
        setupEventStream();
      }
    }
  });

  // Preset Handlers
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const url = chip.getAttribute('data-url');
      const inst = chip.getAttribute('data-inst');
      const mode = chip.getAttribute('data-mode');

      if (url) targetUrlInput.value = url;
      if (inst) aiInstructionInput.value = inst;
      if (mode) {
        const radio = document.querySelector(`input[name="executionMode"][value="${mode}"]`);
        if (radio) radio.checked = true;
      }

      appendLog(`Template loaded: ${chip.textContent.trim()}`, 'system');
      if (navigator.vibrate) navigator.vibrate(15);
    });
  });

  // Trigger Automation Function (used by both Desktop & Mobile buttons)
  async function triggerRun() {
    const url = targetUrlInput.value.trim();
    const instruction = aiInstructionInput.value.trim();
    const modeEl = document.querySelector('input[name="executionMode"]:checked');
    const mode = modeEl ? modeEl.value : 'act';
    const headless = headlessCheckbox.checked;

    if (!url) {
      alert('Please enter a target website URL.');
      return;
    }

    if (!instruction) {
      alert('Please enter an AI natural language instruction.');
      return;
    }

    setRunningState(true);
    resultsDrawer.style.display = 'none';
    appendLog(`Dispatching mission to Stagehand Agent...`, 'system');

    if (window.innerWidth <= 960) {
      switchMobileTab('monitor');
    }

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, instruction, mode, headless })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start automation');
      }
    } catch (err) {
      appendLog(`Launch failed: ${err.message}`, 'error');
      setRunningState(false);
    }
  }

  // Trigger Stop Function
  async function triggerStop() {
    stopAutomationBtn.disabled = true;
    mobileStopAutomationBtn.disabled = true;
    appendLog('Sending stop request to browser engine...', 'warn');
    try {
      await fetch('/api/stop', { method: 'POST' });
    } catch (err) {
      appendLog(`Failed to stop: ${err.message}`, 'error');
    }
  }

  // Event Listeners for Run & Stop
  runAutomationBtn.addEventListener('click', triggerRun);
  mobileRunAutomationBtn.addEventListener('click', triggerRun);
  stopAutomationBtn.addEventListener('click', triggerStop);
  mobileStopAutomationBtn.addEventListener('click', triggerStop);

  // Close Results Drawer
  closeResultsBtn.addEventListener('click', () => {
    resultsDrawer.style.display = 'none';
  });

  // Worldwide Remote Modal Handlers
  openTunnelModalBtn.addEventListener('click', () => {
    loadNetworkInfo();
    qrModal.style.display = 'flex';
  });

  closeQrModalBtn.addEventListener('click', () => {
    qrModal.style.display = 'none';
  });

  // Copy helper
  async function copyToClipboard(inputElement, textElement) {
    const val = inputElement.value;
    try {
      await navigator.clipboard.writeText(val);
      textElement.textContent = 'Copied!';
      setTimeout(() => { textElement.textContent = 'Copy'; }, 2000);
    } catch {
      inputElement.select();
      document.execCommand('copy');
      textElement.textContent = 'Copied!';
      setTimeout(() => { textElement.textContent = 'Copy'; }, 2000);
    }
  }

  copyPublicUrlBtn.addEventListener('click', () => copyToClipboard(publicUrlDisplay, copyPublicBtnText));
  copyLanUrlBtn.addEventListener('click', () => copyToClipboard(lanUrlDisplay, copyLanBtnText));

  // Toggle Tunnel Handler
  toggleTunnelBtn.addEventListener('click', async () => {
    toggleTunnelBtn.disabled = true;
    toggleTunnelBtn.textContent = 'Processing tunnel...';
    try {
      await fetch('/api/tunnel/toggle', { method: 'POST' });
      await loadNetworkInfo();
    } catch (err) {
      alert('Failed to toggle tunnel: ' + err.message);
    } finally {
      toggleTunnelBtn.disabled = false;
    }
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

  saveSettingsBtn.addEventListener('click', async () => {
    const geminiKey = geminiKeyInput.value.trim();
    const openaiKey = openaiKeyInput.value.trim();
    const anthropicKey = anthropicKeyInput.value.trim();

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiKey, openaiKey, anthropicKey })
      });
      const data = await res.json();
      if (res.ok) {
        appendLog('API settings updated successfully!', 'success');
        activeProviderText.textContent = data.model;
        settingsModal.style.display = 'none';
        geminiKeyInput.value = '';
        openaiKeyInput.value = '';
        anthropicKeyInput.value = '';
      }
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    }
  });

  // Close modals when clicking backdrop
  [qrModal, settingsModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  });

  // Initialize
  fetchStatus();
  loadNetworkInfo();
  setupEventStream();
});
