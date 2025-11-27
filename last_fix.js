const fs = require('fs');

let content = fs.readFileSync('frontend/index.html', 'utf8');

// Fix the last 3 navigation icons - using exact byte sequences
content = content.replace("mb-1">'¥</div>", 'mb-1">👥</div>');  // Friends
content = content.replace('mb-1">"</div>', 'mb-1">🔐</div>');  // Admin  
content = content.replace("mb-1">'¤</div>", 'mb-1">👤</div>');  // Profile

// Fix last 2 content emojis
content = content.replace("'🏆 Taps", '👆 Taps');
content = content.replace('"¥ Combo', '🔥 Combo');

fs.writeFileSync('frontend/index.html', content, 'utf8');

console.log('✅ PERFECT! All emojis fixed!');
console.log('✅ Navigation: 🎮 ⚡ 🎯 🏆 👥 🔐 👤');
console.log('✅ Content: 💪 👆 🔥 ⚡');
