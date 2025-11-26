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
    
    // Start periodic sync (every 10 seconds)
    startPeriodicSync();
    
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
  
  // Update UI immediately for better feedback
  updateUI();
  document.getElementById('combo').textContent = `${comboCount}x`;
  
  // Show floating coin
  showFloatingCoin(e);
  
  // Haptic feedback
  tg.HapticFeedback.impactOccurred('light');
  
  // Send taps to server more frequently (every 5 taps or 500ms)
  if (tapQueue.length >= 5 || (tapQueue.length > 0 && now - tapQueue[0] > 500)) {
    sendTaps();
  }
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

// Load Upgrades - Organized by category
async function loadUpgrades() {
  try {
    const data = await apiCall('/user/upgrades');
    
    const upgradesList = document.getElementById('upgradesList');
    upgradesList.innerHTML = '';
    
    // Group upgrades by priority/importance
    const priorityOrder = ['tapPower', 'maxEnergy', 'energyRegen', 'criticalChance', 'comboMultiplier', 'autoMiner', 'streakBoost', 'offlineEarnings'];
    const sortedUpgrades = data.upgrades.sort((a, b) => {
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
      
      card.innerHTML = `
        <div class="flex justify-between items-center gap-4">
          <div class="flex-1">
            <div class="font-bold text-lg mb-1">${upgrade.name}</div>
            <div class="text-sm opacity-75 mb-1">${upgrade.description}</div>
            ${!upgrade.isMaxed ? `<div class="text-xs text-yellow-400 mb-2">📈 ${benefit}</div>` : ''}
            <div class="flex items-center gap-3">
              <div class="text-xs opacity-60">Level ${upgrade.currentLevel}/${upgrade.maxLevel}</div>
              ${upgrade.currentLevel > 0 ? `<div class="text-xs text-green-400">✓ Active</div>` : ''}
            </div>
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

// Complete Task - With proper verification
async function completeTask(taskId) {
  try {
    console.log(`🎯 Attempting to complete task: ${taskId}`);
    
    // Find the task
    const tasksData = await apiCall('/tasks/list');
    const task = tasksData.tasks.find(t => t.taskId === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Check if already completed
    if (task.completed && task.type === 'one-time') {
      showNotification('❌ Task already completed');
      return;
    }
    
    // Check if can complete (cooldown)
    if (!task.canComplete) {
      const hours = Math.floor(task.timeRemaining / 3600);
      const minutes = Math.floor((task.timeRemaining % 3600) / 60);
      showNotification(`⏰ Wait ${hours}h ${minutes}m before completing again`);
      return;
    }
    
    let verified = false;
    
    // If task has a link, require verification
    if (task.link) {
      console.log(`🔗 Opening task link: ${task.link}`);
      
      // Open the link
      tg.openLink(task.link);
      
      // Wait 3 seconds to ensure user sees the content
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Show confirmation dialog
      const confirmed = await new Promise((resolve) => {
        tg.showConfirm(
          `Did you complete: ${task.title}?\n\nOnly confirm if you actually completed the task. False confirmations may result in account suspension.`,
          (result) => resolve(result)
        );
      });
      
      if (!confirmed) {
        console.log('❌ User cancelled task verification');
        showNotification('❌ Task cancelled');
        return;
      }
      
      verified = true;
    } else {
      // Tasks without links can be completed directly
      verified = true;
    }
    
    // Complete the task with verification
    console.log(`✅ Completing task with verification: ${verified}`);
    
    const data = await apiCall('/tasks/complete', 'POST', { 
      taskId,
      verification: {
        confirmed: verified,
        timestamp: Date.now()
      }
    });
    
    // Update balance
    userData.balance = data.balance;
    userData.tasksCompleted = data.tasksCompleted;
    
    // Update UI
    updateUI();
    await loadTasks();
    
    // Show success
    tg.HapticFeedback.notificationOccurred('success');
    showNotification(`🎉 Task completed! +${data.reward} coins`);
    
    console.log(`✅ Task completed successfully. New balance: ${userData.balance}`);
    
  } catch (error) {
    console.error('❌ Complete task error:', error);
    tg.HapticFeedback.notificationOccurred('error');
    showNotification(`❌ ${error.message || 'Failed to complete task'}`);
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
