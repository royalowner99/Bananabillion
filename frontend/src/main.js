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
    
    // Update UI
    updateUI();
    
    // Load initial data
    console.log('📥 Loading game data...');
    await loadProfile();
    await loadUpgrades();
    await loadTasks();
    
    // Start energy regeneration
    startEnergyRegen();
    
    // Setup tap handler
    setupTapHandler();
    
    console.log('✅ App initialized successfully');
    
    // Check for offline earnings
    if (data.user.offlineEarnings > 0) {
      showNotification(`💰 Earned ${data.user.offlineEarnings} coins while offline!`);
    }
    
  } catch (error) {
    console.error('❌ Init error:', error);
    showError(`Error: ${error.message}`);
    
    // Show more details in console
    console.error('Full error:', error);
  }
}

// API Helper
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
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
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

// Update UI
function updateUI() {
  if (!userData) return;
  
  document.getElementById('balance').textContent = formatNumber(userData.balance);
  document.getElementById('energy').textContent = `${Math.floor(userData.energy)}/${userData.maxEnergy}`;
  document.getElementById('tapPower').textContent = userData.tapPower;
  document.getElementById('totalTaps').textContent = formatNumber(userData.totalTaps || 0);
  document.getElementById('referralCount').textContent = userData.referralCount || 0;
  document.getElementById('referralEarnings').textContent = formatNumber(userData.referralEarnings || 0);
  
  // Update energy bar
  const energyPercent = (userData.energy / userData.maxEnergy) * 100;
  document.getElementById('energyBar').style.width = `${energyPercent}%`;
}

// Setup Tap Handler
function setupTapHandler() {
  const bananaBtn = document.getElementById('bananaBtn');
  
  bananaBtn.addEventListener('click', handleTap);
  bananaBtn.addEventListener('touchstart', handleTap);
}

// Handle Tap
function handleTap(e) {
  e.preventDefault();
  
  if (userData.energy < 1) {
    tg.HapticFeedback.notificationOccurred('error');
    showNotification('⚡ No energy left!');
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
  
  // Update UI
  updateUI();
  document.getElementById('combo').textContent = `${comboCount}x`;
  
  // Show floating coin
  showFloatingCoin(e);
  
  // Haptic feedback
  tg.HapticFeedback.impactOccurred('light');
  
  // Send taps to server (batch)
  if (tapQueue.length >= 10 || now - tapQueue[0] > 1000) {
    sendTaps();
  }
}

// Send Taps to Server
async function sendTaps() {
  if (tapQueue.length === 0) return;
  
  const taps = [...tapQueue];
  tapQueue = [];
  
  try {
    const data = await apiCall('/user/tap', 'POST', {
      tapCount: taps.length,
      timestamps: taps
    });
    
    // Update balance
    userData.balance = data.balance;
    userData.energy = data.energy;
    
    if (data.criticalHits > 0) {
      critCount += data.criticalHits;
      document.getElementById('crits').textContent = critCount;
      tg.HapticFeedback.notificationOccurred('success');
    }
    
    updateUI();
    
  } catch (error) {
    console.error('Send taps error:', error);
    // Restore energy on error
    userData.energy += taps.length;
    updateUI();
  }
}

// Show Floating Coin
function showFloatingCoin(e) {
  const coin = document.createElement('div');
  coin.className = 'coin-float';
  coin.textContent = `+${userData.tapPower}`;
  
  const rect = e.target.getBoundingClientRect();
  const x = (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2) - 20;
  const y = (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2) - 20;
  
  coin.style.left = `${x}px`;
  coin.style.top = `${y}px`;
  
  document.body.appendChild(coin);
  
  setTimeout(() => coin.remove(), 1000);
}

// Energy Regeneration - Slower for better engagement
function startEnergyRegen() {
  if (energyRegenInterval) clearInterval(energyRegenInterval);
  
  // Regenerate energy every 1 second (not 100ms)
  // This makes users wait and engage more with the game
  energyRegenInterval = setInterval(() => {
    if (userData.energy < userData.maxEnergy) {
      userData.energy = Math.min(
        userData.energy + (userData.energyRegenRate || 0.5),
        userData.maxEnergy
      );
      updateUI();
    }
  }, 1000); // Changed from 100ms to 1000ms (1 second)
}

// Load Upgrades
async function loadUpgrades() {
  try {
    const data = await apiCall('/user/upgrades');
    
    const upgradesList = document.getElementById('upgradesList');
    upgradesList.innerHTML = '';
    
    data.upgrades.forEach(upgrade => {
      const card = document.createElement('div');
      card.className = 'upgrade-card rounded-lg p-4';
      
      const canAfford = upgrade.canAfford && !upgrade.isMaxed;
      
      card.innerHTML = `
        <div class="flex justify-between items-center gap-4">
          <div class="flex-1">
            <div class="font-bold text-lg mb-1">${upgrade.name}</div>
            <div class="text-sm opacity-75 mb-2">${upgrade.description}</div>
            <div class="text-xs opacity-60">Level: ${upgrade.currentLevel}/${upgrade.maxLevel}</div>
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
    
  } catch (error) {
    console.error('Load upgrades error:', error);
  }
}

// Buy Upgrade
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
    await loadUpgrades();
    
    tg.HapticFeedback.notificationOccurred('success');
    showNotification('✅ Upgrade purchased!');
    
  } catch (error) {
    tg.HapticFeedback.notificationOccurred('error');
    showNotification(error.message);
  }
}

// Load Tasks
async function loadTasks() {
  try {
    const data = await apiCall('/tasks/list');
    
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';
    
    data.tasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'upgrade-card rounded-lg p-4';
      
      const canComplete = task.canComplete && !task.completed;
      
      let buttonText = 'Complete';
      if (task.completed && task.type === 'one-time') {
        buttonText = '✓ Done';
      } else if (!task.canComplete && task.timeRemaining > 0) {
        const hours = Math.floor(task.timeRemaining / 3600);
        const minutes = Math.floor((task.timeRemaining % 3600) / 60);
        buttonText = `${hours}h ${minutes}m`;
      }
      
      card.className = 'task-card rounded-2xl p-4';
      
      card.innerHTML = `
        <div class="flex justify-between items-center gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-4xl">${task.icon}</span>
              <div>
                <div class="font-bold text-lg">${task.title}</div>
                <div class="text-sm opacity-75">${task.description}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-yellow-400 font-bold glow">+${task.reward}</span>
              <span class="text-xs opacity-75">coins</span>
            </div>
          </div>
          <button 
            onclick="completeTask('${task.taskId}')"
            class="${canComplete ? 'btn-primary' : 'btn-primary btn-disabled'} py-3 px-6 rounded-xl font-bold text-sm whitespace-nowrap"
            ${!canComplete ? 'disabled' : ''}
          >
            ${buttonText}
          </button>
        </div>
      `;
      
      tasksList.appendChild(card);
    });
    
  } catch (error) {
    console.error('Load tasks error:', error);
  }
}

// Complete Task
async function completeTask(taskId) {
  try {
    // Find the task
    const tasks = await apiCall('/tasks/list');
    const task = tasks.tasks.find(t => t.taskId === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // If task has a link, open it first
    if (task.link) {
      tg.openLink(task.link);
      
      // Show confirmation dialog after opening link
      const confirmed = await new Promise((resolve) => {
        setTimeout(() => {
          tg.showConfirm(
            'Did you complete the task?',
            (result) => resolve(result)
          );
        }, 2000); // Wait 2 seconds before asking
      });
      
      if (!confirmed) {
        showNotification('❌ Task not completed');
        return;
      }
    }
    
    // Complete the task
    const data = await apiCall('/tasks/complete', 'POST', { taskId });
    
    userData.balance = data.balance;
    updateUI();
    await loadTasks();
    
    tg.HapticFeedback.notificationOccurred('success');
    showNotification(`✅ Earned ${data.reward} coins!`);
    
  } catch (error) {
    tg.HapticFeedback.notificationOccurred('error');
    showNotification(error.message);
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

// Share Referral
function shareReferral() {
  const botUsername = 'banabillionbot';
  const referralLink = `https://t.me/${botUsername}?start=${userData.userId}`;
  const text = `🍌 Join me on BananaBillion and earn coins by tapping!\n\n${referralLink}`;
  
  tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`);
}

// Switch Tab
function switchTab(tab) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('tab-active'));
  
  // Show selected tab
  document.getElementById(`${tab}Tab`).classList.remove('hidden');
  event.target.closest('.tab-btn').classList.add('tab-active');
  
  // Load data for tab
  if (tab === 'leaderboard') {
    loadLeaderboard('global');
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

// Utilities
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
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

// Start app
init();

// Cleanup on close
window.addEventListener('beforeunload', () => {
  if (tapQueue.length > 0) {
    sendTaps();
  }
  if (energyRegenInterval) {
    clearInterval(energyRegenInterval);
  }
});
