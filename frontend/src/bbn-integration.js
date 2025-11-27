// BillionBanana (BBN) Frontend Integration
// This file adds BBN features to the existing game

// BBN Configuration
const BBN_CONFIG = {
  DAILY_LIMIT: 1500,
  TOTAL_SUPPLY: 100000000,
  BBN_TO_INR: 0.00001, // 1M BBN = ₹10
  RAZORPAY_KEY: 'rzp_test_RkqZbX5NtH8bf4'
};

// Load Razorpay script
function loadRazorpay() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Initialize BBN features
async function initBBN() {
  console.log('🍌 Initializing BBN features...');
  
  // Load Razorpay
  await loadRazorpay();
  
  // Update UI to show BBN
  updateCoinDisplayToBBN();
  
  // Load BBN stats
  await loadBBNStats();
  
  // Add BBN event listeners
  addBBNEventListeners();
  
  console.log('✅ BBN features initialized');
}

// Update all coin displays to BBN
function updateCoinDisplayToBBN() {
  // Replace "coins" with "BBN" throughout the UI
  document.querySelectorAll('.coin-label').forEach(el => {
    el.textContent = el.textContent.replace(/coins?/gi, 'BBN');
  });
  
  // Update balance display
  const balanceEl = document.getElementById('balance');
  if (balanceEl) {
    const currentText = balanceEl.textContent;
    balanceEl.textContent = currentText.replace(/coins?/gi, 'BBN');
  }
}

// Load BBN mining stats
async function loadBBNStats() {
  try {
    const response = await fetch(`${API_URL}/mining/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Update UI with BBN stats
      updateBBNDisplay(data);
    }
  } catch (error) {
    console.error('Failed to load BBN stats:', error);
  }
}

// Update BBN display
function updateBBNDisplay(stats) {
  // Update balance
  if (stats.balance !== undefined) {
    document.getElementById('balance').textContent = formatNumber(stats.balance) + ' BBN';
  }
  
  // Update daily limit
  if (stats.dailyMined !== undefined && stats.dailyLimit !== undefined) {
    const dailyProgress = (stats.dailyMined / stats.dailyLimit) * 100;
    updateDailyLimitDisplay(stats.dailyMined, stats.dailyLimit, dailyProgress);
  }
  
  // Update level & XP
  if (stats.level !== undefined) {
    updateLevelDisplay(stats.level, stats.xp, stats.xpForNextLevel);
  }
}

// Update daily limit display
function updateDailyLimitDisplay(mined, limit, progress) {
  const container = document.getElementById('daily-limit-container');
  if (!container) {
    // Create daily limit display
    const gameTab = document.getElementById('gameTab');
    const limitHTML = `
      <div id="daily-limit-container" class="mt-4 p-3 rounded-xl bg-black bg-opacity-30">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm opacity-75">Daily Mining</span>
          <span class="text-sm font-bold">${mined}/${limit} BBN</span>
        </div>
        <div class="w-full bg-black bg-opacity-50 rounded-full h-2">
          <div id="daily-limit-bar" class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all" style="width: ${progress}%"></div>
        </div>
      </div>
    `;
    gameTab.insertAdjacentHTML('afterbegin', limitHTML);
  } else {
    // Update existing display
    container.querySelector('span.font-bold').textContent = `${mined}/${limit} BBN`;
    document.getElementById('daily-limit-bar').style.width = `${progress}%`;
  }
}

// Update level display
function updateLevelDisplay(level, xp, xpForNext) {
  const container = document.getElementById('level-container');
  const xpProgress = (xp / xpForNext) * 100;
  
  if (!container) {
    // Create level display
    const gameTab = document.getElementById('gameTab');
    const levelHTML = `
      <div id="level-container" class="mt-4 p-3 rounded-xl bg-black bg-opacity-30">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm opacity-75">Level ${level}</span>
          <span class="text-sm font-bold">${xp}/${xpForNext} XP</span>
        </div>
        <div class="w-full bg-black bg-opacity-50 rounded-full h-2">
          <div id="level-bar" class="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all" style="width: ${xpProgress}%"></div>
        </div>
      </div>
    `;
    gameTab.insertAdjacentHTML('afterbegin', levelHTML);
  } else {
    // Update existing display
    container.querySelector('span.opacity-75').textContent = `Level ${level}`;
    container.querySelector('span.font-bold').textContent = `${xp}/${xpForNext} XP`;
    document.getElementById('level-bar').style.width = `${xpProgress}%`;
  }
}

// Add BBN event listeners
function addBBNEventListeners() {
  // Override tap function to use BBN mining
  const originalTap = window.tap;
  window.tap = async function() {
    try {
      const response = await fetch(`${API_URL}/mining/tap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ taps: 1 })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update displays
        updateBBNDisplay(data.user);
        
        // Show earned BBN
        if (data.bbnEarned > 0) {
          showFloatingText(`+${data.bbnEarned} BBN`, '#FFD700');
        }
        
        // Show level up
        if (data.levelRewards && data.levelRewards.length > 0) {
          data.levelRewards.forEach(reward => {
            showNotification(`🎉 Level ${reward.level}! +${reward.reward} BBN`, 'success');
          });
        }
      } else {
        if (data.error.includes('Daily mining limit')) {
          showNotification('⏰ Daily limit reached! Come back tomorrow', 'warning');
        } else {
          showNotification(data.error, 'error');
        }
      }
    } catch (error) {
      console.error('Tap error:', error);
      // Fallback to original tap
      if (originalTap) originalTap();
    }
  };
}

// Purchase booster with Razorpay
async function purchaseBooster(boosterId, price) {
  try {
    // Create order
    const orderResponse = await fetch(`${API_URL}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        itemType: 'booster',
        itemId: boosterId,
        amount: price
      })
    });
    
    const orderData = await orderResponse.json();
    
    if (!orderResponse.ok) {
      throw new Error(orderData.error);
    }
    
    // Open Razorpay checkout
    const options = {
      key: BBN_CONFIG.RAZORPAY_KEY,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'BillionBanana',
      description: `Purchase ${boosterId}`,
      order_id: orderData.orderId,
      handler: async function(response) {
        // Verify payment
        const verifyResponse = await fetch(`${API_URL}/payment/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });
        
        const verifyData = await verifyResponse.json();
        
        if (verifyResponse.ok) {
          showNotification('✅ Purchase successful!', 'success');
          // Reload boosters
          loadBoosters();
        } else {
          showNotification('❌ Payment verification failed', 'error');
        }
      },
      prefill: {
        name: userData.firstName
      },
      theme: {
        color: '#FFD700'
      }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
    
  } catch (error) {
    console.error('Purchase error:', error);
    showNotification('❌ Purchase failed', 'error');
  }
}

// Load boosters
async function loadBoosters() {
  try {
    const response = await fetch(`${API_URL}/booster/list`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      displayBoosters(data.boosters);
    }
  } catch (error) {
    console.error('Load boosters error:', error);
  }
}

// Display boosters
function displayBoosters(boosters) {
  // This would create the booster shop UI
  // Implementation depends on where you want to show it
  console.log('Boosters loaded:', boosters);
}

// Initialize BBN when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBBN);
} else {
  initBBN();
}

// Export functions for global use
window.BBN = {
  initBBN,
  loadBBNStats,
  purchaseBooster,
  loadBoosters,
  BBN_CONFIG
};
