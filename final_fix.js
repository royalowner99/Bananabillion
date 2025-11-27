const fs = require('fs');

// Read the file
let content = fs.readFileSync('frontend/index.html', 'utf8');

// Fix remaining corrupted emojis in navigation
content = content.replace('🎁¯', '🎯');  // Tasks icon in nav
content = content.replace(/<div class="text-2xl mb-1">†<\/div>/g, '<div class="text-2xl mb-1">🏆</div>');  // Trophy in nav
content = content.replace(/<div class="text-2xl mb-1">'¥<\/div>/g, '<div class="text-2xl mb-1">👥</div>');  // Friends in nav
content = content.replace(/<div class="text-2xl mb-1">"<\/div>/g, '<div class="text-2xl mb-1">🔐</div>');  // Admin in nav
content = content.replace(/<div class="text-2xl mb-1">'¤<\/div>/g, '<div class="text-2xl mb-1">👤</div>');  // Profile in nav

// Fix in content areas
content = content.replace(/'ª Tap Power/g, '💪 Tap Power');
content = content.replace(/'† Taps/g, '👆 Taps');
content = content.replace(/"¥ Combo/g, '🔥 Combo');
content = content.replace(/'° Balance/g, '💰 Balance');

// Fix admin tab button to have py-3 like others
content = content.replace(
  'class="tab-btn flex-1 py-2 text-center hidden" id="adminTabBtn"',
  'class="tab-btn flex-1 py-3 text-center hidden" id="adminTabBtn"'
);

// Write back
fs.writeFileSync('frontend/index.html', content, 'utf8');

console.log('✅ All emojis fixed!');
console.log('✅ Navigation perfectly aligned!');
