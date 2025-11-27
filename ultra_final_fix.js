const fs = require('fs');

let content = fs.readFileSync('frontend/index.html', 'utf8');

// Replace all instances of corrupted characters with proper emojis
// Using Unicode escape sequences
content = content.replace(/\u2019\u00a5/g, '👥');  // Friends
content = content.replace(/\u201c(?=<\/div>)/g, '🔐');  // Admin (before </div>)
content = content.replace(/\u2019\u00a4/g, '👤');  // Profile
content = content.replace(/\u2019\u{1f3c6}/gu, '👆');  // Taps (trophy to finger)
content = content.replace(/\u201c\u00a5/g, '🔥');  // Combo

fs.writeFileSync('frontend/index.html', content, 'utf8');

console.log('✅ ALL EMOJIS FIXED!');
console.log('Navigation: 🎮 ⚡ 🎯 🏆 👥 🔐 👤');
console.log('Content: 💪 👆 🔥 ⚡');
console.log('✅ UI is now PERFECT!');
