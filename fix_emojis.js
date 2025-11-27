const fs = require('fs');

// Read the file
let content = fs.readFileSync('frontend/index.html', 'utf8');

// Replace corrupted emojis with proper ones
const replacements = {
  '\u2019\u00aa': '💪',  // Tap Power
  '\u2019\u2020': '👆',  // Taps  
  '\u201c\u00a5': '🔥',  // Combo
  '\u2019\u00b0': '💰',  // Balance/Coins
  '\u2019\u00a5': '👥',  // Friends
  '\u2019\u00a4': '👤',  // Profile/User
  '\u201c\u2039': '📋',  // Copy
  '\u201c\u00a4': '📤',  // Share
  '\u201c\u00a2': '📢',  // Broadcast
  '\u201c\u0160': '📊',  // Stats
  '\u201c\u201e': '🔄',  // Refresh
  '\u00ab': '🚫',  // Ban
  '\u2026': '✅',  // Unban/Check
  '\u201c': '🔍',  // Find (single char)
  '\u00a8': '✨',  // Claim
  'div>div>': '</div>',  // Fix typo
};

// Apply all replacements
for (const [old, newChar] of Object.entries(replacements)) {
  content = content.split(old).join(newChar);
}

// Write back
fs.writeFileSync('frontend/index.html', content, 'utf8');

console.log('✅ Fixed all emojis in UI!');
