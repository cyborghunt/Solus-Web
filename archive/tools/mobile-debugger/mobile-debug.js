/**
 * SOLUS — Mobile Viewport Debugger & Simulator
 * Provides a left-edge toggle button, realistic device frames,
 * live viewport inspection, and touch testing tools.
 */
(function () {
  'use strict';

  // Do not initialize inside an iframe
  if (window.self !== window.top) {
    document.documentElement.classList.add('is-in-iframe');
    document.addEventListener('DOMContentLoaded', function () {
      document.body.classList.add('is-in-iframe');
    });
    return;
  }

  // Device Presets
  var PRESETS = [
    { id: 'iphone-15', name: 'iPhone 15 Pro', w: 393, h: 852, dpr: 3.0, os: 'iOS' },
    { id: 'iphone-se', name: 'iPhone SE', w: 375, h: 667, dpr: 2.0, os: 'iOS' },
    { id: 'pixel-8', name: 'Pixel 8', w: 412, h: 915, dpr: 2.6, os: 'Android' },
    { id: 'ipad-mini', name: 'iPad Mini', w: 768, h: 1024, dpr: 2.0, os: 'iPadOS' }
  ];

  var currentPreset = PRESETS[0];
  var isLandscape = false;
  var currentScale = 'fit';
  var isOutlinesActive = false;
  var simOverlay = null;
  var phoneChassis = null;
  var phoneScreen = null;
  var statDims = null;
  var statBp = null;
  var nativeHud = null;

  function init() {
    createLeftEdgeTrigger();
    createSimulatorModal();
    createNativeMobileHud();
    attachKeyShortcuts();
  }

  // 1. Create Left Edge Trigger Button
  function createLeftEdgeTrigger() {
    if (document.getElementById('solusDebugTrigger')) return;

    var btn = document.createElement('button');
    btn.id = 'solusDebugTrigger';
    btn.className = 'solus-debug-trigger';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', 'Toggle Mobile View Debugger (Alt+M)');
    btn.setAttribute('title', 'Debug Mobile View (Alt+M)');

    btn.innerHTML =
      '<div class="sdt-icon" aria-hidden="true"></div>' +
      '<div class="sdt-label">Mobile View</div>' +
      '<div class="sdt-dot" aria-hidden="true"></div>';

    btn.addEventListener('click', toggleDebugger);
    document.body.appendChild(btn);
  }

  // 2. Create Simulator Modal
  function createSimulatorModal() {
    if (document.getElementById('solusMobileSimulator')) return;

    var overlay = document.createElement('div');
    overlay.id = 'solusMobileSimulator';
    overlay.className = 'solus-sim-overlay';
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('role', 'dialog');

    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    overlay.innerHTML =
      '<div class="solus-sim-bar">' +
        '<div class="solus-sim-title">' +
          '<span>Solus</span>' +
          '<span class="badge">Mobile Debug</span>' +
        '</div>' +
        '<div class="solus-sim-devices" id="solusSimDevices"></div>' +
        '<div class="solus-sim-actions">' +
          '<button class="solus-sim-btn" id="solusSimRotate" title="Toggle Orientation">🔄 <span id="solusSimOrientLabel">Portrait</span></button>' +
          '<button class="solus-sim-btn" id="solusSimScale" title="Toggle Scale">🔍 <span id="solusSimScaleLabel">Fit</span></button>' +
          '<button class="solus-sim-btn" id="solusSimOutlines" title="Inspect Layout Overflow">📐 Outlines</button>' +
          '<button class="solus-sim-btn" id="solusSimReload" title="Reload Device View">↻ Reload</button>' +
          '<button class="solus-sim-close" id="solusSimClose" aria-label="Close Mobile View">✕</button>' +
        '</div>' +
      '</div>' +
      '<div class="solus-sim-stage" id="solusSimStage">' +
        '<div class="solus-phone-chassis" id="solusPhoneChassis">' +
          '<div class="solus-phone-island" aria-hidden="true">' +
            '<div class="solus-phone-camera"></div>' +
            '<div class="solus-phone-sensor"></div>' +
          '</div>' +
          '<iframe class="solus-phone-screen" id="solusPhoneScreen" title="Solus Mobile Viewport"></iframe>' +
          '<div class="solus-phone-homebar" aria-hidden="true"></div>' +
        '</div>' +
      '</div>' +
      '<div class="solus-sim-footer">' +
        '<div>Device: <b id="solusStatName">iPhone 15 Pro</b> | Viewport: <b id="solusStatDims">393 × 852 px</b> | DPR: <b id="solusStatDpr">3.0x</b></div>' +
        '<div>Active Query: <span class="status-tag" id="solusStatBp">max-width: 600px</span> | Page: <b>' + currentPage + '</b> | [Esc / Alt+M to close]</div>' +
      '</div>';

    document.body.appendChild(overlay);

    simOverlay = overlay;
    phoneChassis = document.getElementById('solusPhoneChassis');
    phoneScreen = document.getElementById('solusPhoneScreen');
    statDims = document.getElementById('solusStatDims');
    statBp = document.getElementById('solusStatBp');

    // Populate Device Buttons
    var devContainer = document.getElementById('solusSimDevices');
    PRESETS.forEach(function (preset) {
      var btn = document.createElement('button');
      btn.className = 'solus-sim-btn' + (preset.id === currentPreset.id ? ' is-active' : '');
      btn.textContent = preset.name;
      btn.addEventListener('click', function () {
        setPreset(preset);
      });
      devContainer.appendChild(btn);
    });

    // Event listeners
    document.getElementById('solusSimClose').addEventListener('click', closeSimulator);
    document.getElementById('solusSimRotate').addEventListener('click', toggleOrientation);
    document.getElementById('solusSimScale').addEventListener('click', cycleScale);
    document.getElementById('solusSimOutlines').addEventListener('click', toggleOutlines);
    document.getElementById('solusSimReload').addEventListener('click', function () {
      if (phoneScreen) {
        phoneScreen.src = phoneScreen.src;
      }
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.id === 'solusSimStage') {
        closeSimulator();
      }
    });

    window.addEventListener('resize', function () {
      if (simOverlay && simOverlay.classList.contains('is-active')) {
        applyDimensions();
      }
    });
  }

  // 3. Create Native Mobile HUD (for small screens)
  function createNativeMobileHud() {
    if (document.getElementById('solusNativeHud')) return;

    var hud = document.createElement('div');
    hud.id = 'solusNativeHud';
    hud.className = 'solus-native-hud';

    hud.innerHTML =
      '<div class="solus-native-hud-header">' +
        '<h4>Mobile Inspector HUD</h4>' +
        '<button class="solus-sim-close" style="width:24px;height:24px;font-size:11px" id="solusNativeHudClose">✕</button>' +
      '</div>' +
      '<div class="solus-native-hud-info">' +
        '<div><span>Resolution:</span> <b id="snhRes">' + window.innerWidth + ' × ' + window.innerHeight + '</b></div>' +
        '<div><span>DPR:</span> <b>' + (window.devicePixelRatio || 1) + 'x</b></div>' +
        '<div><span>Overflow Leak:</span> <b id="snhLeak">Checking...</b></div>' +
        '<div><span>Touch Coarse:</span> <b>' + (window.matchMedia('(pointer: coarse)').matches ? 'YES' : 'NO') + '</b></div>' +
      '</div>' +
      '<div class="solus-native-hud-tools">' +
        '<button class="solus-sim-btn" id="snhOutlines">📐 Toggle Red Outlines</button>' +
        '<button class="solus-sim-btn" id="snhCheckLeak">🔍 Test Leaks</button>' +
      '</div>';

    document.body.appendChild(hud);
    nativeHud = hud;

    document.getElementById('solusNativeHudClose').addEventListener('click', function () {
      hud.classList.remove('is-open');
    });

    document.getElementById('snhOutlines').addEventListener('click', toggleOutlines);
    document.getElementById('snhCheckLeak').addEventListener('click', checkHorizontalLeak);
  }

  function checkHorizontalLeak() {
    var docWidth = document.documentElement.offsetWidth;
    var winWidth = window.innerWidth;
    var leakEl = document.getElementById('snhLeak');
    if (document.documentElement.scrollWidth > winWidth + 2) {
      if (leakEl) leakEl.innerHTML = '<span style="color:#ff1f2d">DETECTED (+' + (document.documentElement.scrollWidth - winWidth) + 'px)</span>';
      alert('Horizontal overflow detected: ' + (document.documentElement.scrollWidth - winWidth) + 'px beyond viewport! Outlines enabled.');
      toggleOutlines(true);
    } else {
      if (leakEl) leakEl.innerHTML = '<span style="color:#52c41a">NONE (Clean 100%)</span>';
    }
  }

  // Toggle Function
  function toggleDebugger() {
    if (window.innerWidth <= 768) {
      // Small screen: open the native mobile HUD
      if (nativeHud) {
        nativeHud.classList.toggle('is-open');
        document.getElementById('snhRes').textContent = window.innerWidth + ' × ' + window.innerHeight + ' px';
        checkHorizontalLeak();
      }
    } else {
      // Desktop / Tablet: open the phone frame simulator
      if (simOverlay.classList.contains('is-active')) {
        closeSimulator();
      } else {
        openSimulator();
      }
    }
  }

  function openSimulator() {
    simOverlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // Set current page as iframe source
    var currentUrl = window.location.href;
    if (phoneScreen.src !== currentUrl) {
      phoneScreen.src = currentUrl;
    }

    setPreset(currentPreset);
  }

  function closeSimulator() {
    simOverlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  function setPreset(preset) {
    currentPreset = preset;
    document.querySelectorAll('#solusSimDevices .solus-sim-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.textContent === preset.name);
    });

    document.getElementById('solusStatName').textContent = preset.name;
    document.getElementById('solusStatDpr').textContent = preset.dpr + 'x';
    applyDimensions();
  }

  function toggleOrientation() {
    isLandscape = !isLandscape;
    var label = document.getElementById('solusSimOrientLabel');
    if (label) label.textContent = isLandscape ? 'Landscape' : 'Portrait';
    applyDimensions();
  }

  function cycleScale() {
    var scales = ['fit', '100%', '85%', '75%'];
    var nextIdx = (scales.indexOf(currentScale) + 1) % scales.length;
    currentScale = scales[nextIdx];
    document.getElementById('solusSimScaleLabel').textContent = currentScale;
    applyDimensions();
  }

  function applyDimensions() {
    if (!phoneChassis) return;

    var w = isLandscape ? currentPreset.h : currentPreset.w;
    var h = isLandscape ? currentPreset.w : currentPreset.h;

    phoneChassis.style.width = w + 'px';
    phoneChassis.style.height = h + 'px';

    if (statDims) statDims.textContent = w + ' × ' + h + ' px';

    // Update matching query
    var activeBp = 'None';
    if (w <= 600) activeBp = 'max-width: 600px';
    else if (w <= 760) activeBp = 'max-width: 760px';
    else if (w <= 860) activeBp = 'max-width: 860px';
    if (statBp) statBp.textContent = activeBp;

    // Apply scale
    var stageH = document.getElementById('solusSimStage').offsetHeight - 48;
    var stageW = document.getElementById('solusSimStage').offsetWidth - 48;

    var scale = 1;
    if (currentScale === 'fit') {
      var scaleY = stageH / (h + 30);
      var scaleX = stageW / (w + 30);
      scale = Math.min(1, Math.min(scaleX, scaleY));
    } else if (currentScale === '85%') {
      scale = 0.85;
    } else if (currentScale === '75%') {
      scale = 0.75;
    }

    phoneChassis.style.transform = 'scale(' + scale + ')';
  }

  function toggleOutlines(forceOn) {
    if (typeof forceOn === 'boolean') {
      isOutlinesActive = forceOn;
    } else {
      isOutlinesActive = !isOutlinesActive;
    }

    document.body.classList.toggle('solus-debug-outlines', isOutlinesActive);

    // If iframe is loaded, toggle outlines inside iframe too
    try {
      if (phoneScreen && phoneScreen.contentDocument) {
        phoneScreen.contentDocument.body.classList.toggle('solus-debug-outlines', isOutlinesActive);
      }
    } catch (e) {}

    var btn = document.getElementById('solusSimOutlines');
    if (btn) btn.classList.toggle('is-active', isOutlinesActive);
  }

  function attachKeyShortcuts() {
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && simOverlay && simOverlay.classList.contains('is-active')) {
        closeSimulator();
      }
      // Alt + M shortcut
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        toggleDebugger();
      }
    });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
