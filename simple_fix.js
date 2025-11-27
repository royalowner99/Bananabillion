const fs = require('fs');

// Read the file
let content = fs.readFileSync('frontend/index.html', 'utf8');

// Simple, safe replacements - only fix the specific corrupted sequences
content = content.replace(/'\u00aa/g, '💪');  // Tap Power
content = content.replace(/'\u2020/g, '👆');  // Taps
content = content.replace(/"\u00a5/g, '🔥');  // Combo
content = content.replace(/'\u00b0/g, '💰');  // Balance
content = content.replace(/'\u00a5/g, '👥');  // Friends
content = content.replace(/'\u00a4/g, '👤');  // Profile
content = content.replace(/"\u2039/g, '📋');  // Copy
content = content.replace(/"\u00a4/g, '📤');  // Share
content = content.replace(/"\u00a2/g, '📢');  // Broadcast
content = content.replace(/"\u0160/g, '📊');  // Stats
content = content.replace(/"\u201e/g, '🔄');  // Refresh
content = content.replace(/\u00ab/g, '🚫');  // Ban
content = content.replace(/\u2026/g, '✅');  // Check
content = content.replace(/\u00a8/g, '✨');  // Claim
content = content.replace(/\u2020 Leaderboard/g, '🏆 Leaderboard');  // Trophy
content = content.replace(/🎁\u00af Tasks/g, '🎯 Tasks');  // Tasks icon
content = content.replace(/🎁\u00ae/g, '🎮');  // Game icon

// Fix navigation - change py-2 to py-3 and text-xl to text-2xl for better alignment
content = content.replace(/class="tab-btn tab-active flex-1 py-2 text-center"/g, 'class="tab-btn tab-active flex-1 py-3 text-center"');
content = content.replace(/class="tab-btn flex-1 py-2 text-center"/g, 'class="tab-btn flex-1 py-3 text-center"');
content = content.replace(/<div class="text-xl mb-0\.5">/g, '<div class="text-2xl mb-1">');

// Write back
fs.writeFileSync('frontend/index.html', content, 'utf8');

console.log('✅ Fixed all emojis and improved navigation!');
