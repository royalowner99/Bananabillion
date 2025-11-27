const fs = require('fs');

let content = fs.readFileSync('frontend/index.html', 'utf8');

// Use template literals and escape properly
content = content.replace(/mb-1">'¥<\/div>/g, 'mb-1">👥</div>');  // Friends
content = content.replace(/mb-1">"<\/div>/g, 'mb-1">🔐</div>');  // Admin  
content = content.replace(/mb-1">'¤<\/div>/g, 'mb-1">👤</div>');  // Profile

// Fix content
content = content.replace(/'🏆 Taps/g, '👆 Taps');
content = content.replace(/"¥ Combo/g, '🔥 Combo');

fs.writeFileSync('frontend/index.html', content, 'utf8');

console.log('✅ PERFECT UI!');
console.log('Navigation: 🎮 ⚡ 🎯 🏆 👥 🔐 👤');
console.log('Content: 💪 👆 🔥 ⚡');
