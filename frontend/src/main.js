// Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// API Configuration
const API_URL = window.location.origin + '/api';
let authToken = null;
let userData = null;

// Game State
let tapQueue = [];
let lastTapTime = 0;
let comboCount = 0;
let critCount = 0;
let energyRegenInterval = null;

// Cache for data
let dataCache = {
  upgrades: null,
  tasks: null,
  referrals: null,
  lastUpdate: {}
};

// Initialize
async function init() {
  try {
    console.log('🚀 Initializing app...');
    console.log('API URL:', API_URL);
    
    // Get init data from Telegram
    const initData = tg.initData;
    
    console.log('Telegram initData:', initData ? 'Present' : 'Missing');
    console.log('Telegram user:', tg.initDataUnsafe?.user);
    
    if (!initData) {
      console.error('❌ No initData from Telegram');
      showError('Please open this app from Telegram bot');
      return;
    }
    
    // Extract referrer from start param
    const startParam = tg.initDataUnsafe?.start_parameter;
    
    console.log('📡 Authenticating with server...');
    
    // Authenticate
    const response = await fetch(`${API_URL}/auth/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initData,
        referrerId: startParam || null,
        ipAddress: null,
        deviceId: null
      })
    });
    
    const data = await response.json();
    
    console.log('Server response:', response.status, data);
    
    if (!response.ok) {
      console.error('❌ Auth failed:', data);
      throw new Error(data.details || data.error || 'Authentication failed');
    }
    
    authToken = data.token;
    userData = data.user;
    
    console.log('✅ Authentication successful');
    
    // Check admin access
    checkAdminAccess();
    
    // Update UI immediately with auth data
    updateUI();
    
    // Start energy regeneration immediately
    startEnergyRegen();
    
    // Setup tap handler immediately
    setupTapHandler();
    
    // Start periodic sync
    startPeriodicSync();
    
    console.log('✅ App ready - loading data in background...');
    
    // Load data in background (non-blocking)
    // This makes the app feel instant!
    Promise.all([
      loadProfile(),
      loadUpgrades(),
      loadTasks()
    ]).then(() => {
      console.log('✅ All data loaded');
    }).catch(error => {
      console.error('Error loading data:', error);
    });
    
    // Check for offline earnings
    if (data.user.offlineEarnings > 0) {
      setTimeout(() => {
        showNotification(`💰 Earned ${data.user.offlineEarnings} coins while offline!`);
      }, 1000);
    }
    
  } catch (error) {
    console.error('❌ Init error:', error);
    showError(`Error: ${error.message}`);
    
    // Show more details in console
    console.error('Full error:', error);
  }
}

// API Helper - With better error handling
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }
    
    return data;
  } catch (error) {
    // Network error or parsing error
    if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error - please check your connection');
    }
    throw error;
  }
}

// Load Profile
async function loadProfile() {
  try {
    const data = await apiCall('/user/profile');
    userData = { ...userData, ...data };
    updateUI();
    
    // Check for auto-miner earnings
    if (data.autoMinerEarnings > 0) {
      showNotification(`⛏️ Auto-miner earned ${data.autoMinerEarnings} coins!`);
    }
  } catch (error) {
    console.error('Load profile error:', error);
  }
}

// Update UI - Enhanced with dynamic energy bar states
function updateUI() {
  if (!userData) return;
  
  document.getElementById('balance').textContent = formatNumber(userData.balance);
  document.getElementById('energy').textContent = `${Math.floor(userData.energy)}/${userData.maxEnergy}`;
  document.getElementById('tapPower').textContent = userData.tapPower;
  document.getElementById('totalTaps').textContent = formatNumber(userData.totalTaps || 0);
  document.getElementById('referralCount').textContent = userData.referralCount || 0;
  document.getElementById('referralEarnings').textContent = formatNumber(userData.referralEarnings || 0);
  
  // Update energy bar with dynamic states
  const energyPercent = (userData.energy / userData.maxEnergy) * 100;
  const energyBar = document.getElementById('energyBar');
  
  energyBar.style.width = `${energyPercent}%`;
  
  // Remove all state classes
  energyBar.classList.remove('energy-full', 'energy-medium', 'energy-low', 'energy-critical');
  
  // Add appropriate state class based on energy level
  if (energyPercent < 10) {
    energyBar.classList.add('energy-critical');
  } else if (energyPercent < 30) {
    energyBar.classList.add('energy-low');
  } else if (energyPercent < 80) {
    energyBar.classList.add('energy-medium');
  } else {
    energyBar.classList.add('energy-full');
  }
}

// Setup Tap Handler
function setupTapHandler() {
  const bananaBtn = document.getElementById('bananaBtn');
  
  bananaBtn.addEventListener('click', handleTap);
  bananaBtn.addEventListener('touchstart', handleTap);
}

// Handle Tap - Enhanced with animations
function handleTap(e) {
  e.preventDefault();
  
  if (userData.energy < 1) {
    tg.HapticFeedback.notificationOccurred('error');
    showNotification('⚡ No energy left!');
    
    // Shake animation when no energy
    const bananaBtn = document.getElementById('bananaBtn');
    bananaBtn.style.animation = 'shake 0.5s';
    setTimeout(() => {
      bananaBtn.style.animation = '';
    }, 500);
    
    return;
  }
  
  const now = Date.now();
  
  // Add to queue
  tapQueue.push(now);
  
  // Update local state
  userData.energy -= 1;
  userData.totalTaps = (userData.totalTaps || 0) + 1;
  
  // Check combo
  if (now - lastTapTime < 500) {
    comboCount++;
  } else {
    comboCount = 0;
  }
  
  lastTapTime = now;
  
  // Update UI immediately for better feedback
  updateUI();
  document.getElementById('combo').textContent = `${comboCount}x`;
  
  // Show floating coin
  showFloatingCoin(e);
  
  // Add click burst effect
  showClickBurst(e);
  
  // Haptic feedback
  tg.HapticFeedback.impactOccurred('light');
  
  // Send taps to server more frequently (every 5 taps or 500ms)
  if (tapQueue.length >= 5 || (tapQueue.length > 0 && now - tapQueue[0] > 500)) {
    sendTaps();
  }
}

// Show click burst effect
function showClickBurst(e) {
  const rect = e.target.getBoundingClientRect();
  const x = (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2);
  const y = (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2);
  
  // Create burst container
  const burst = document.createElement('div');
  burst.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    pointer-events: none;
    z-index: 9999;
  `;
  
  // Create multiple burst particles
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 60 + Math.random() * 20;
    const size = 8 + Math.random() * 6;
    
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, #FFD700, #FFA500);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
      animation: burstParticle 0.6s ease-out forwards;
      --angle: ${angle}rad;
      --distance: ${distance}px;
    `;
    
    burst.appendChild(particle);
  }
  
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 600);
}

// Add burst particle animation CSS
if (!document.getElementById('burstStyle')) {
  const style = document.createElement('style');
  style.id = 'burstStyle';
  style.textContent = `
    @keyframes burstParticle {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(
          calc(cos(var(--angle)) * var(--distance)),
          calc(sin(var(--angle)) * var(--distance))
        ) scale(0);
        opacity: 0;
      }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
}

// Send Taps to Server - Optimized for faster updates
async function sendTaps() {
  if (tapQueue.length === 0) return;
  
  const taps = [...tapQueue];
  tapQueue = [];
  
  try {
    const data = await apiCall('/user/tap', 'POST', {
      tapCount: taps.length,
      timestamps: taps
    });
    
    // Update balance immediately from server
    userData.balance = data.balance;
    userData.energy = data.energy;
    userData.totalTaps = (userData.totalTaps || 0) + taps.length;
    
    // Update total taps display
    document.getElementById('totalTaps').textContent = formatNumber(userData.totalTaps);
    
    if (data.criticalHits > 0) {
      critCount += data.criticalHits;
      document.getElementById('crits').textContent = critCount;
      tg.HapticFeedback.notificationOccurred('success');
    }
    
    // Force UI update
    updateUI();
    
    console.log(`✅ Sent ${taps.length} taps, balance: ${userData.balance}`);
    
  } catch (error) {
    console.error('❌ Send taps error:', error);
    
    // Put taps back in queue to retry
    tapQueue = [...taps, ...tapQueue];
    
    // Restore energy (since taps weren't processed)
    userData.energy = Math.min(userData.energy + taps.length, userData.maxEnergy);
    
    updateUI();
    
    // Only show error if it's a real network issue
    if (error.message && !error.message.includes('fetch')) {
      console.log('⚠️ Tap sync failed, will retry automatically');
    }
  }
}

// Show Advanced Floating Coin with Effects
function showFloatingCoin(e) {
  const rect = e.target.getBoundingClientRect();
  const x = (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2);
  const y = (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2);
  
  // Floating coin text
  const coin = document.createElement('div');
  coin.className = 'coin-float';
  coin.textContent = `+${userData.tapPower}`;
  coin.style.left = `${x - 20}px`;
  coin.style.top = `${y - 20}px`;
  document.body.appendChild(coin);
  setTimeout(() => coin.remove(), 1200);
  
  // Ripple effect
  const ripple = document.createElement('div');
  ripple.className = 'tap-ripple';
  ripple.style.left = `${x - 100}px`;
  ripple.style.top = `${y - 100}px`;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
  
  // Particle burst (6 particles)
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const angle = (Math.PI * 2 * i) / 6;
    const distance = 50 + Math.random() * 30;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    particle.style.animation = `particleFloat 0.8s ease-out forwards`;
    particle.style.animationDelay = `${i * 0.05}s`;
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
  }
}

// Energy Regeneration - Enhanced with visual feedback
function startEnergyRegen() {
  if (energyRegenInterval) clearInterval(energyRegenInterval);
  
  // Regenerate energy every 1 second
  energyRegenInterval = setInterval(() => {
    if (userData.energy < userData.maxEnergy) {
      const previousEnergy = userData.energy;
      userData.energy = Math.min(
        userData.energy + (userData.energyRegenRate || 0.5),
        userData.maxEnergy
      );
      
      // Check if energy just became full
      if (previousEnergy < userData.maxEnergy && userData.energy >= userData.maxEnergy) {
        // Energy is now full - show notification
        showEnergyFullNotification();
      }
      
      updateUI();
    }
  }, 1000);
}

// Show energy full notification
function showEnergyFullNotification() {
  try {
    // Haptic feedback
    tg.HapticFeedback.notificationOccurred('success');
    
    // Show floating notification
    const notification = document.createElement('div');
    notification.className = 'energy-full-notification';
    notification.innerHTML = '⚡ Energy Full!';
    notification.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #00FF00, #32CD32);
      color: white;
      padding: 15px 30px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 18px;
      box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
      z-index: 9999;
      animation: energyFullPop 2s ease-out forwards;
      pointer-events: none;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
    
    console.log('⚡ Energy is now full!');
  } catch (error) {
    console.error('Error showing energy full notification:', error);
  }
}

// Add CSS for energy full notification animation
if (!document.getElementById('energyFullStyle')) {
  const style = document.createElement('style');
  style.id = 'energyFullStyle';
  style.textContent = `
    @keyframes energyFullPop {
      0% {
        opacity: 0;
        transform: translateX(-50%) scale(0.5);
      }
      20% {
        opacity: 1;
        transform: translateX(-50%) scale(1.1);
      }
      80% {
        opacity: 1;
        transform: translateX(-50%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateX(-50%) scale(0.8) translateY(-20px);
      }
    }
  `;
  document.head.appendChild(style);
}

// Load Upgrades - Optimized with caching
async function loadUpgrades(forceRefresh = false) {
  try {
    // Check cache (valid for 30 seconds)
    const cacheAge = Date.now() - (dataCache.lastUpdate.upgrades || 0);
    if (!forceRefresh && dataCache.upgrades && cacheAge < 30000) {
      console.log('📦 Using cached upgrades');
      renderUpgrades(dataCache.upgrades);
      return;
    }
    
    const data = await apiCall('/user/upgrades');
    
    // Update cache
    dataCache.upgrades = data.upgrades;
    dataCache.lastUpdate.upgrades = Date.now();
    
    renderUpgrades(data.upgrades);
    
  } catch (error) {
    console.error('Load upgrades error:', error);
  }
}

// Render Upgrades - Separated for reusability
function renderUpgrades(upgrades) {
  const upgradesList = document.getElementById('upgradesList');
  upgradesList.innerHTML = '';
  
  // Group upgrades by priority/importance
  const priorityOrder = ['tapPower', 'maxEnergy', 'energyRegen', 'criticalChance', 'comboMultiplier', 'autoMiner', 'streakBoost', 'offlineEarnings'];
  const sortedUpgrades = upgrades.sort((a, b) => {
    return priorityOrder.indexOf(a.id) - priorityOrder.indexOf(b.id);
  });
    
    sortedUpgrades.forEach(upgrade => {
      const card = document.createElement('div');
      card.className = 'upgrade-card rounded-2xl p-4';
      
      const canAfford = upgrade.canAfford && !upgrade.isMaxed;
      
      // Calculate next level benefit
      let benefit = '';
      const nextLevel = upgrade.currentLevel + 1;
      
      switch(upgrade.id) {
        case 'tapPower':
          benefit = `+1 coin per tap (${upgrade.currentLevel + 1} → ${nextLevel + 1})`;
          break;
        case 'maxEnergy':
          benefit = `+50 max energy (${500 + upgrade.currentLevel * 50} → ${500 + nextLevel * 50})`;
          break;
        case 'energyRegen':
          benefit = `+0.3/sec regen (${(0.5 + upgrade.currentLevel * 0.3).toFixed(1)} → ${(0.5 + nextLevel * 0.3).toFixed(1)})`;
          break;
        case 'criticalChance':
          benefit = `+1% crit chance (${(5 + upgrade.currentLevel)}% → ${(5 + nextLevel)}%)`;
          break;
        case 'comboMultiplier':
          benefit = `+0.1x combo (${(1 + upgrade.currentLevel * 0.1).toFixed(1)}x → ${(1 + nextLevel * 0.1).toFixed(1)}x)`;
          break;
        case 'autoMiner':
          benefit = `+10 coins/min (${upgrade.currentLevel * 10} → ${nextLevel * 10})`;
          break;
        case 'streakBoost':
          benefit = `+5% daily reward (${upgrade.currentLevel * 5}% → ${nextLevel * 5}%)`;
          break;
        case 'offlineEarnings':
          benefit = `+10% offline (${upgrade.currentLevel * 10}% → ${nextLevel * 10}%)`;
          break;
      }
      
      // Calculate progress percentage
      const progressPercent = (upgrade.currentLevel / upgrade.maxLevel) * 100;
      
      card.innerHTML = `
        <div class="flex justify-between items-center gap-4">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <div class="font-bold text-lg">${upgrade.name}</div>
              <div class="text-xs opacity-60">Lv ${upgrade.currentLevel}/${upgrade.maxLevel}</div>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-black bg-opacity-30 rounded-full h-2 mb-2 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
            </div>
            
            <div class="text-sm opacity-75 mb-1">${upgrade.description}</div>
            ${!upgrade.isMaxed ? `<div class="text-xs text-yellow-400">📈 ${benefit}</div>` : '<div class="text-xs text-green-400">✨ Maxed Out!</div>'}
          </div>
          <button 
            onclick="buyUpgrade('${upgrade.id}')"
            class="${canAfford ? 'btn-primary' : 'btn-primary btn-disabled'} py-3 px-6 rounded-xl font-bold text-sm whitespace-nowrap"
            ${!canAfford ? 'disabled' : ''}
          >
            ${upgrade.isMaxed ? '✅ MAX' : '💰 ' + formatNumber(upgrade.price)}
          </button>
        </div>
      `;
      
      upgradesList.appendChild(card);
    });
}

// Buy Upgrade - Fast and smooth
async function buyUpgrade(upgradeId) {
  try {
    const data = await apiCall('/user/upgrade', 'POST', { upgradeId });
    
    userData.balance = data.balance;
    userData.upgrades = data.upgrades;
    
    // Update stats
    if (data.stats) {
      userData.tapPower = data.stats.tapPower;
      userData.maxEnergy = data.stats.maxEnergy;
      userData.energyRegenRate = data.stats.energyRegenRate;
    }
    
    updateUI();
    
    // Force refresh upgrades (invalidate cache)
    await loadUpgrades(true);
    
    // Just haptic feedback, no popup
    tg.HapticFeedback.notificationOccurred('success');
    
    console.log(`✅ Upgraded ${upgradeId}`);
    
  } catch (error) {
    tg.HapticFeedback.notificationOccurred('error');
    console.error('Upgrade error:', error);
    showNotification(`❌ ${error.message}`);
  }
}

// Load Tasks - Optimized with caching
async function loadTasks(forceRefresh = false) {
  try {
    // Check cache (valid for 60 seconds)
    const cacheAge = Date.now() - (dataCache.lastUpdate.tasks || 0);
    if (!forceRefresh && dataCache.tasks && cacheAge < 60000) {
      console.log('📦 Using cached tasks');
      renderTasks(dataCache.tasks);
      return;
    }
    
    console.log('📋 Loading tasks...');
    const data = await apiCall('/tasks/list');
    
    if (!data || !data.tasks) {
      console.error('❌ No tasks data received');
      return;
    }
    
    // Update cache
    dataCache.tasks = data.tasks;
    dataCache.lastUpdate.tasks = Date.now();
    
    console.log(`✅ Loaded ${data.tasks.length} tasks`);
    
    renderTasks(data.tasks);
    
  } catch (error) {
    console.error('❌ Load tasks error:', error);
    showNotification('Failed to load tasks');
  }
}

// Render Tasks - Advanced with better sorting and UI
function renderTasks(tasks) {
  try {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';
    
    // Sort tasks: available first, then by reward, then completed
    const sortedTasks = tasks.sort((a, b) => {
      // Priority 1: Available tasks first
      if (a.canComplete && !b.canComplete) return -1;
      if (!a.canComplete && b.canComplete) return 1;
      
      // Priority 2: Higher rewards first
      if (a.canComplete && b.canComplete) {
        return b.reward - a.reward;
      }
      
      // Priority 3: Completed tasks last
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      
      return 0;
    });
    
    sortedTasks.forEach((task, index) => {
      const card = document.createElement('div');
      card.className = 'task-card rounded-2xl p-4';
      
      // Add animation delay for staggered appearance
      card.style.animationDelay = `${index * 0.05}s`;
      
      // Determine button state and text
      let buttonText = '🎯 Start';
      let canComplete = task.canComplete;
      let buttonClass = 'btn-primary';
      let cardOpacity = '';
      
      if (task.completed && task.type === 'one-time') {
        buttonText = '✅ Completed';
        canComplete = false;
        buttonClass = 'btn-primary btn-disabled';
        cardOpacity = 'opacity-60';
      } else if (task.type === 'daily' && task.completed && task.timeRemaining > 0) {
        const hours = Math.floor(task.timeRemaining / 3600);
        const minutes = Math.floor((task.timeRemaining % 3600) / 60);
        buttonText = `⏰ ${hours}h ${minutes}m`;
        canComplete = false;
        buttonClass = 'btn-primary btn-disabled';
        cardOpacity = 'opacity-75';
      } else if (!task.canComplete && task.timeRemaining > 0) {
        const hours = Math.floor(task.timeRemaining / 3600);
        const minutes = Math.floor((task.timeRemaining % 3600) / 60);
        buttonText = `⏰ ${hours}h ${minutes}m`;
        canComplete = false;
        buttonClass = 'btn-primary btn-disabled';
        cardOpacity = 'opacity-75';
      } else if (task.canComplete && !task.link) {
        // Tasks without links show "Collect" (can be claimed directly)
        buttonText = '💰 Collect';
        card.classList.add('task-available');
      } else if (task.canComplete && task.link) {
        // Tasks with links show "Start" (need to complete action first)
        buttonText = '🎯 Start';
        card.classList.add('task-available');
      }
      
      // Add opacity class
      if (cardOpacity) {
        card.classList.add(cardOpacity);
      }
      
      // Add completion count for repeatable tasks
      let completionInfo = '';
      if (task.completionCount > 0 && task.type !== 'one-time') {
        completionInfo = `<div class="text-xs opacity-60 mt-1">✨ Completed ${task.completionCount} times</div>`;
      }
      
      // Add progress indicator for tasks with cooldown
      let progressBar = '';
      if (task.timeRemaining > 0 && (task.type === 'daily' || task.type === 'cooldown')) {
        const cooldownTotal = task.type === 'daily' ? 86400 : task.cooldownSeconds || 86400;
        const progressPercent = ((cooldownTotal - task.timeRemaining) / cooldownTotal) * 100;
        progressBar = `
          <div class="w-full bg-black bg-opacity-30 rounded-full h-1 mt-2 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
          </div>
        `;
      }
      
      card.innerHTML = `
        <div class="flex justify-between items-center gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-4xl ${canComplete ? 'animate-bounce' : ''}">${task.icon}</span>
              <div class="flex-1">
                <div class="font-bold text-lg">${task.title}</div>
                <div class="text-sm opacity-75">${task.description}</div>
                ${completionInfo}
              </div>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="text-yellow-400 font-bold glow text-lg">+${formatNumber(task.reward)}</span>
                <span class="text-xs opacity-75">coins</span>
              </div>
              ${task.type === 'daily' ? '<span class="text-xs bg-blue-500 bg-opacity-30 px-2 py-1 rounded-full border border-blue-400 border-opacity-30">🔄 Daily</span>' : ''}
              ${task.type === 'one-time' ? '<span class="text-xs bg-purple-500 bg-opacity-30 px-2 py-1 rounded-full border border-purple-400 border-opacity-30">⭐ One-time</span>' : ''}
              ${task.type === 'cooldown' ? '<span class="text-xs bg-orange-500 bg-opacity-30 px-2 py-1 rounded-full border border-orange-400 border-opacity-30">⏱️ Cooldown</span>' : ''}
            </div>
            ${progressBar}
          </div>
          <button 
            onclick="completeTask('${task.taskId}')"
            class="${buttonClass} py-3 px-6 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 hover:scale-105"
            ${!canComplete ? 'disabled' : ''}
          >
            ${buttonText}
          </button>
        </div>
      `;
      
      tasksList.appendChild(card);
    });
    
    console.log('✅ Tasks rendered successfully');
    
  } catch (error) {
    console.error('❌ Render tasks error:', error);
  }
}

// Complete Task - Perfect logic with verification
async function completeTask(taskId) {
  try {
    console.log(`🎯 Attempting to complete task: ${taskId}`);
    
    // Fetch fresh task data
    const tasksData = await apiCall('/tasks/list');
    
    if (!tasksData || !tasksData.tasks) {
      throw new Error('Failed to load tasks');
    }
    
    const task = tasksData.tasks.find(t => t.taskId === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    console.log(`📋 Task details:`, {
      id: task.taskId,
      type: task.type,
      completed: task.completed,
      canComplete: task.canComplete,
      timeRemaining: task.timeRemaining
    });
    
    // Check if already completed (one-time tasks)
    if (task.completed && task.type === 'one-time') {
      showNotification('✅ Task already completed');
      return;
    }
    
    // Check if on cooldown
    if (!task.canComplete) {
      if (task.timeRemaining > 0) {
        const hours = Math.floor(task.timeRemaining / 3600);
        const minutes = Math.floor((task.timeRemaining % 3600) / 60);
        showNotification(`⏰ Please wait ${hours}h ${minutes}m before completing again`);
      } else {
        showNotification('❌ Cannot complete this task right now');
      }
      return;
    }
    
    let verified = false;
    
    // If task has a link, require verification
    if (task.link && task.link.trim() !== '') {
      console.log(`🔗 Task has link: ${task.link}`);
      
      try {
        // Open the link
        tg.openLink(task.link);
        console.log('✅ Link opened');
        
        // Wait 3 seconds to ensure user sees the content
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Show confirmation dialog
        const confirmed = await new Promise((resolve) => {
          try {
            tg.showConfirm(
              `Did you complete: "${task.title}"?\n\n⚠️ Only confirm if you actually completed the task.\nFalse confirmations may result in account suspension.`,
              (result) => {
                console.log(`User confirmation result: ${result}`);
                resolve(result);
              }
            );
          } catch (err) {
            console.error('Error showing confirm dialog:', err);
            resolve(false);
          }
        });
        
        if (!confirmed) {
          console.log('❌ User cancelled task verification');
          showNotification('❌ Task cancelled');
          return;
        }
        
        verified = true;
        console.log('✅ Task verified by user');
        
      } catch (linkError) {
        console.error('Error opening link or showing dialog:', linkError);
        showNotification('❌ Failed to open task link');
        return;
      }
    } else {
      // Tasks without links can be collected directly (no confirmation needed)
      console.log('💰 Task has no link, collecting directly');
      verified = true;
    }
    
    // Complete the task with verification
    console.log(`📤 Sending completion request with verification: ${verified}`);
    
    const data = await apiCall('/tasks/complete', 'POST', { 
      taskId,
      verification: {
        confirmed: verified,
        timestamp: Date.now()
      }
    });
    
    console.log('✅ Task completion response:', data);
    
    // Update balance and stats
    userData.balance = data.balance;
    userData.tasksCompleted = data.tasksCompleted;
    
    // Update UI
    updateUI();
    
    // Reload tasks to show updated status (force refresh)
    await loadTasks(true);
    
    // Show success with haptic feedback
    tg.HapticFeedback.notificationOccurred('success');
    showNotification(`🎉 Task completed! Earned +${data.reward} coins`);
    
    console.log(`✅ Task completed successfully. New balance: ${userData.balance}`);
    
  } catch (error) {
    console.error('❌ Complete task error:', error);
    tg.HapticFeedback.notificationOccurred('error');
    
    // Show specific error message
    const errorMsg = error.message || 'Failed to complete task';
    showNotification(`❌ ${errorMsg}`);
    
    // Reload tasks to ensure UI is in sync (force refresh)
    try {
      await loadTasks(true);
    } catch (reloadError) {
      console.error('Failed to reload tasks:', reloadError);
    }
  }
}

// Load Leaderboard
async function loadLeaderboard(type) {
  try {
    const data = await apiCall(`/leaderboard/${type}`);
    
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    
    data.leaderboard.forEach(user => {
      const card = document.createElement('div');
      card.className = 'upgrade-card rounded-2xl p-4 flex justify-between items-center';
      
      const medal = user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `${user.rank}.`;
      const isTopThree = user.rank <= 3;
      
      card.innerHTML = `
        <div class="flex items-center gap-4 flex-1">
          <div class="text-4xl ${isTopThree ? 'glow' : ''}">${medal}</div>
          <div class="flex-1">
            <div class="font-bold text-lg ${isTopThree ? 'glow' : ''}">${user.username}</div>
            <div class="text-sm opacity-75">${formatNumber(user.totalEarned)} coins</div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs opacity-75">Referrals</div>
          <div class="font-bold">${user.referralCount}</div>
        </div>
      `;
      
      leaderboardList.appendChild(card);
    });
    
    // Show user rank
    if (data.userRank) {
      const userCard = document.createElement('div');
      userCard.className = 'upgrade-card rounded-lg p-3 mt-4 border-2 border-yellow-500';
      userCard.innerHTML = `
        <div class="text-center">
          <div class="font-bold">Your Rank: #${data.userRank.rank}</div>
          <div class="text-sm opacity-75">${formatNumber(data.userRank.totalEarned)} coins</div>
        </div>
      `;
      leaderboardList.appendChild(userCard);
    }
    
  } catch (error) {
    console.error('Load leaderboard error:', error);
  }
}

// Load Referral Stats
async function loadReferralStats() {
  try {
    console.log('📊 Loading referral stats...');
    const data = await apiCall('/referrals/stats');
    
    console.log('✅ Referral stats loaded:', data);
    
    // Update stats display
    document.getElementById('referralCount').textContent = data.referralCount || 0;
    document.getElementById('referralEarnings').textContent = formatNumber(data.referralEarnings || 0);
    
    // Display referral list
    const referralsList = document.getElementById('referralsList');
    
    if (referralsList) {
      referralsList.innerHTML = '';
      
      if (data.referrals && data.referrals.length > 0) {
        // Add header
        const header = document.createElement('div');
        header.className = 'text-lg font-bold mb-3 mt-4';
        header.textContent = `👥 Your Friends (${data.activeReferrals}/${data.totalReferrals})`;
        referralsList.appendChild(header);
        
        // Add each referral
        data.referrals.forEach((ref, index) => {
          const card = document.createElement('div');
          card.className = 'upgrade-card rounded-xl p-3 flex justify-between items-center';
          
          const statusIcon = ref.isActive ? '✅' : '⏳';
          const statusText = ref.isActive ? 'Active' : 'Pending';
          const statusColor = ref.isActive ? 'text-green-400' : 'text-yellow-400';
          
          card.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="text-2xl">${index + 1}.</div>
              <div>
                <div class="font-bold">${ref.username}</div>
                <div class="text-xs opacity-75">Joined ${new Date(ref.joinedAt).toLocaleDateString()}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="${statusColor} text-sm font-bold">${statusIcon} ${statusText}</div>
              <div class="text-xs opacity-75">+${formatNumber(ref.earned)} earned</div>
            </div>
          `;
          
          referralsList.appendChild(card);
        });
      } else {
        const emptyState = document.createElement('div');
        emptyState.className = 'text-center py-8 opacity-75';
        emptyState.innerHTML = `
          <div class="text-4xl mb-2">👥</div>
          <div class="text-sm">No referrals yet</div>
          <div class="text-xs mt-1">Invite friends to earn 20% of their earnings!</div>
        `;
        referralsList.appendChild(emptyState);
      }
    }
    
  } catch (error) {
    console.error('❌ Load referral stats error:', error);
  }
}

// Share Referral - Improved
function shareReferral() {
  const botUsername = 'banabillionbot';
  const referralLink = `https://t.me/${botUsername}?start=${userData.userId}`;
  const text = `🍌 Join me on BananaBillion!\n\n💰 Tap to earn coins\n🎮 Play mini games\n🎁 Complete tasks\n\n🎁 Use my link and we both get bonuses!\n\n${referralLink}`;
  
  tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`);
  
  // Haptic feedback
  tg.HapticFeedback.notificationOccurred('success');
  
  console.log('📤 Shared referral link');
}

// Copy Referral Link
function copyReferralLink() {
  const botUsername = 'banabillionbot';
  const referralLink = `https://t.me/${botUsername}?start=${userData.userId}`;
  
  // Try to copy to clipboard
  try {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      showNotification('✅ Link copied to clipboard!');
    } else {
      // Fallback: show link
      showNotification(`📋 ${referralLink}`);
    }
    tg.HapticFeedback.notificationOccurred('success');
  } catch (error) {
    console.error('Copy error:', error);
    showNotification(`📋 ${referralLink}`);
  }
}

// Load Profile Data - Enhanced
async function loadProfileData() {
  try {
    console.log('📊 Loading profile data...');
    
    // Fetch fresh profile data
    const data = await apiCall('/user/profile');
    
    // Update userData with fresh data
    userData = { ...userData, ...data };
    
    // Update profile with current user data
    document.getElementById('profileUsername').textContent = userData.username || userData.firstName || 'Anonymous';
    document.getElementById('profileUserId').textContent = `ID: ${userData.userId}`;
    document.getElementById('profileTotalEarned').textContent = formatNumber(userData.totalEarned || 0);
    document.getElementById('profileTotalTaps').textContent = formatNumber(userData.totalTaps || 0);
    document.getElementById('profileTasksCompleted').textContent = userData.tasksCompleted || 0;
    document.getElementById('profileReferralCount').textContent = userData.referralCount || 0;
    
    // Power stats - Calculate from upgrades
    const tapPower = 1 + (userData.upgrades?.tapPower || 0);
    const maxEnergy = 500 + ((userData.upgrades?.maxEnergy || 0) * 50);
    const energyRegen = 0.5 + ((userData.upgrades?.energyRegen || 0) * 0.3);
    const critChance = 5 + (userData.upgrades?.criticalChance || 0);
    
    document.getElementById('profileTapPower').textContent = tapPower;
    document.getElementById('profileMaxEnergy').textContent = maxEnergy;
    document.getElementById('profileEnergyRegen').textContent = `${energyRegen.toFixed(1)}/s`;
    document.getElementById('profileCritChance').textContent = `${critChance}%`;
    
    // Account info
    document.getElementById('profileDailyStreak').textContent = `${userData.dailyStreak || 0} days`;
    
    // Member since (from createdAt if available)
    const memberSince = userData.createdAt 
      ? new Date(userData.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      : new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
    document.getElementById('profileMemberSince').textContent = memberSince;
    
    // Play time - Calculate from account age and activity
    const accountAge = userData.createdAt 
      ? Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60))
      : 0;
    
    // Estimate play time based on taps (rough estimate: 1 tap = 1 second of play)
    const estimatedPlayTime = Math.floor((userData.totalTaps || 0) / 60);
    const playTimeMinutes = Math.min(estimatedPlayTime, accountAge);
    
    document.getElementById('profilePlayTime').textContent = playTimeMinutes > 60 
      ? `${Math.floor(playTimeMinutes / 60)}h ${playTimeMinutes % 60}m`
      : `${playTimeMinutes} min`;
    
    console.log('✅ Profile data loaded successfully');
  } catch (error) {
    console.error('❌ Error loading profile:', error);
    
    // Fallback to cached userData
    if (userData) {
      document.getElementById('profileUsername').textContent = userData.username || userData.firstName || 'Anonymous';
      document.getElementById('profileUserId').textContent = `ID: ${userData.userId}`;
      document.getElementById('profileTotalEarned').textContent = formatNumber(userData.totalEarned || 0);
      document.getElementById('profileTotalTaps').textContent = formatNumber(userData.totalTaps || 0);
      document.getElementById('profileTasksCompleted').textContent = userData.tasksCompleted || 0;
      document.getElementById('profileReferralCount').textContent = userData.referralCount || 0;
    }
  }
}

// Switch Tab
function switchTab(tab, event) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('tab-active'));
  
  // Show selected tab
  const tabElement = document.getElementById(`${tab}Tab`);
  if (tabElement) {
    tabElement.classList.remove('hidden');
  }
  
  // Set active button
  if (event && event.target) {
    const button = event.target.closest('.tab-btn');
    if (button) {
      button.classList.add('tab-active');
    }
  } else {
    // Fallback: find button by tab name
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('onclick')?.includes(`'${tab}'`)) {
        btn.classList.add('tab-active');
      }
    });
  }
  
  // Load data for tab
  if (tab === 'leaderboard') {
    loadLeaderboard('global');
  } else if (tab === 'friends') {
    loadReferralStats();
  } else if (tab === 'profile') {
    loadProfileData();
  } else if (tab === 'admin') {
    if (isAdmin()) {
      loadAdminStats();
    } else {
      showNotification('❌ Admin access required');
      switchTab('game');
    }
  }
}

// Daily Modal
function showDailyModal(reward, streak) {
  document.getElementById('dailyReward').textContent = `+${reward}`;
  document.getElementById('dailyStreak').textContent = streak;
  document.getElementById('dailyModal').classList.add('active');
}

function closeDailyModal() {
  document.getElementById('dailyModal').classList.remove('active');
}

// Utilities - Enhanced for unlimited balance
function formatNumber(num) {
  if (num >= 1000000000000) {
    return (num / 1000000000000).toFixed(2) + 'T'; // Trillion
  } else if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B'; // Billion
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'; // Million
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'; // Thousand
  }
  return Math.floor(num).toString();
}

function showNotification(message) {
  tg.showAlert(message);
}

function showError(message) {
  console.error('Showing error:', message);
  
  // Show in UI as well
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 10px;
    max-width: 80%;
    text-align: center;
    z-index: 9999;
  `;
  errorDiv.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 10px;">❌</div>
    <div style="font-weight: bold; margin-bottom: 10px;">Error</div>
    <div style="font-size: 14px;">${message}</div>
    <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: white; color: black; border: none; border-radius: 5px; font-weight: bold;">
      Retry
    </button>
  `;
  document.body.appendChild(errorDiv);
  
  // Also try Telegram alert
  try {
    tg.showAlert('❌ ' + message);
  } catch (e) {
    console.error('Could not show Telegram alert:', e);
  }
}

// ============================================
// ADMIN FUNCTIONS - In-App Admin Panel
// ============================================

// Admin user IDs (from environment)
const ADMIN_IDS = ['5866442043']; // Your admin Telegram ID

// Check if current user is admin
function isAdmin() {
  return userData && ADMIN_IDS.includes(userData.userId.toString());
}

// Show admin tab if user is admin
function checkAdminAccess() {
  if (isAdmin()) {
    document.getElementById('adminTabBtn').classList.remove('hidden');
    console.log('🔐 Admin access granted');
  }
}

// Load admin statistics
async function loadAdminStats() {
  try {
    if (!isAdmin()) {
      showNotification('❌ Admin access required');
      return;
    }
    
    console.log('📊 Loading admin stats...');
    
    const data = await apiCall('/admin/stats');
    
    document.getElementById('adminTotalUsers').textContent = formatNumber(data.totalUsers || 0);
    document.getElementById('adminActiveUsers').textContent = formatNumber(data.activeUsers || 0);
    document.getElementById('adminTotalCoins').textContent = formatNumber(data.totalBalance || 0);
    document.getElementById('adminTotalTaps').textContent = formatNumber(data.totalEarned || 0);
    
    showNotification('✅ Stats refreshed');
    
  } catch (error) {
    console.error('Admin stats error:', error);
    showNotification('❌ Failed to load stats: ' + error.message);
  }
}

// Store found user for actions
let foundUser = null;

// Find user
async function adminFindUser() {
  try {
    if (!isAdmin()) {
      showNotification('❌ Admin access required');
      return;
    }
    
    const query = document.getElementById('adminSearchUser').value.trim();
    
    if (!query) {
      showNotification('❌ Enter User ID or Username');
      return;
    }
    
    console.log(`🔍 Searching for user: ${query}`);
    
    const data = await apiCall(`/admin/users?search=${encodeURIComponent(query)}&limit=1`);
    
    if (!data.users || data.users.length === 0) {
      showNotification('❌ User not found');
      return;
    }
    
    foundUser = data.users[0];
    
    // Display user info
    const userInfo = document.getElementById('adminUserInfo');
    const userDetails = document.getElementById('adminUserDetails');
    
    userDetails.innerHTML = `
      <div class="font-bold text-lg mb-2">@${foundUser.username || 'Anonymous'}</div>
      <div><span class="opacity-75">ID:</span> ${foundUser.userId}</div>
      <div><span class="opacity-75">Balance:</span> ${formatNumber(foundUser.balance)}</div>
      <div><span class="opacity-75">Total Earned:</span> ${formatNumber(foundUser.totalEarned)}</div>
      <div><span class="opacity-75">Total Taps:</span> ${formatNumber(foundUser.totalTaps)}</div>
      <div><span class="opacity-75">Referrals:</span> ${foundUser.referralCount}</div>
      <div><span class="opacity-75">Status:</span> ${foundUser.isBanned ? '🚫 Banned' : '✅ Active'}</div>
    `;
    
    userInfo.classList.remove('hidden');
    
    showNotification('✅ User found');
    
  } catch (error) {
    console.error('Find user error:', error);
    showNotification('❌ User not found');
  }
}

// Ban user
async function adminBanUser() {
  try {
    if (!isAdmin() || !foundUser) return;
    
    const confirmed = confirm(`Ban user @${foundUser.username || foundUser.userId}?`);
    if (!confirmed) return;
    
    await apiCall('/admin/ban', 'POST', { userId: foundUser.userId });
    
    showNotification('✅ User banned');
    adminFindUser(); // Refresh user info
    
  } catch (error) {
    console.error('Ban user error:', error);
    showNotification('❌ Failed to ban user');
  }
}

// Unban user
async function adminUnbanUser() {
  try {
    if (!isAdmin() || !foundUser) return;
    
    await apiCall('/admin/unban', 'POST', { userId: foundUser.userId });
    
    showNotification('✅ User unbanned');
    adminFindUser(); // Refresh user info
    
  } catch (error) {
    console.error('Unban user error:', error);
    showNotification('❌ Failed to unban user');
  }
}

// Add coins to user
async function adminAddCoins() {
  try {
    if (!isAdmin() || !foundUser) {
      showNotification('❌ Find a user first');
      return;
    }
    
    const amount = parseInt(document.getElementById('adminCoinsAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
      showNotification('❌ Enter valid amount');
      return;
    }
    
    const newBalance = foundUser.balance + amount;
    
    await apiCall('/admin/balance', 'POST', {
      userId: foundUser.userId,
      amount: newBalance
    });
    
    showNotification(`✅ Added ${formatNumber(amount)} coins`);
    document.getElementById('adminCoinsAmount').value = '';
    adminFindUser(); // Refresh user info
    
  } catch (error) {
    console.error('Add coins error:', error);
    showNotification('❌ Failed to add coins: ' + error.message);
  }
}

// Broadcast message
async function adminBroadcast() {
  try {
    if (!isAdmin()) return;
    
    const message = document.getElementById('adminBroadcastMsg').value.trim();
    
    if (!message) {
      showNotification('❌ Enter a message');
      return;
    }
    
    const confirmed = confirm(`Send message to all users?\n\n"${message}"`);
    if (!confirmed) return;
    
    await apiCall('/admin/broadcast', 'POST', { message });
    
    showNotification('✅ Message sent to all users');
    document.getElementById('adminBroadcastMsg').value = '';
    
  } catch (error) {
    console.error('Broadcast error:', error);
    showNotification('❌ Failed to send broadcast');
  }
}

// Give coins to all users
async function adminGiveAll() {
  try {
    if (!isAdmin()) return;
    
    showNotification('⚠️ Use bot command /giveall for this feature');
    
  } catch (error) {
    console.error('Give all error:', error);
  }
}

// View top users
async function adminViewTopUsers() {
  try {
    if (!isAdmin()) return;
    
    const data = await apiCall('/admin/users?limit=20');
    
    let message = '🏆 Top 20 Users:\n\n';
    data.users.forEach((user, i) => {
      message += `${i + 1}. @${user.username || user.userId}\n`;
      message += `   💰 ${formatNumber(user.totalEarned)} | Balance: ${formatNumber(user.balance)}\n\n`;
    });
    
    alert(message);
    
  } catch (error) {
    console.error('Top users error:', error);
    showNotification('❌ Failed to load users: ' + error.message);
  }
}

// View recent users
async function adminViewRecentUsers() {
  try {
    if (!isAdmin()) return;
    
    const data = await apiCall('/admin/users?limit=20');
    
    let message = '🆕 Recent 20 Users:\n\n';
    data.users.forEach((user, i) => {
      const joinDate = new Date(user.createdAt).toLocaleDateString();
      message += `${i + 1}. @${user.username || user.userId}\n`;
      message += `   Joined: ${joinDate} | Balance: ${formatNumber(user.balance)}\n\n`;
    });
    
    alert(message);
    
  } catch (error) {
    console.error('Recent users error:', error);
    showNotification('❌ Failed to load users: ' + error.message);
  }
}

// Start app
init();

// Periodic sync to keep balance updated
let syncInterval = null;
let syncFailCount = 0;

function startPeriodicSync() {
  if (syncInterval) clearInterval(syncInterval);
  
  syncInterval = setInterval(async () => {
    // Send any pending taps first
    if (tapQueue.length > 0) {
      try {
        await sendTaps();
        syncFailCount = 0; // Reset fail count on success
      } catch (error) {
        syncFailCount++;
        console.log(`⚠️ Tap sync failed (${syncFailCount} times)`);
        
        // If failed too many times, show warning
        if (syncFailCount >= 3) {
          console.error('❌ Multiple sync failures, check connection');
          syncFailCount = 0; // Reset counter
        }
      }
    }
    
    // Sync profile every 10 seconds to ensure balance is accurate
    try {
      const data = await apiCall('/user/profile');
      
      // Update balance if different
      if (Math.abs(data.balance - userData.balance) > 10) {
        console.log(`🔄 Synced balance: ${userData.balance} → ${data.balance}`);
        userData.balance = data.balance;
        userData.totalEarned = data.totalEarned;
        userData.energy = data.energy;
        updateUI();
      }
      
      syncFailCount = 0; // Reset on successful sync
    } catch (error) {
      console.error('Profile sync error:', error);
      // Don't show error to user, will retry automatically
    }
  }, 10000); // Every 10 seconds
}

// Cleanup on close
window.addEventListener('beforeunload', () => {
  if (tapQueue.length > 0) {
    sendTaps();
  }
  if (energyRegenInterval) {
    clearInterval(energyRegenInterval);
  }
  if (syncInterval) {
    clearInterval(syncInterval);
  }
});
