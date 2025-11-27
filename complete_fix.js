const fs = require('fs');

// Read the file
let content = fs.readFileSync('frontend/index.html', 'utf8');

// Fix navigation icons - exact replacements
content = content.replace('text-2xl mb-1">🎁¯</div>', 'text-2xl mb-1">🎯</div>');
content = content.replace('text-2xl mb-1">†</div>', 'text-2xl mb-1">🏆</div>');
content = content.replace('text-2xl mb-1">\'¥</div>', 'text-2xl mb-1">👥</div>');
content = content.replace('text-2xl mb-1">"</div>', 'text-2xl mb-1">🔐</div>');
content = content.replace('text-2xl mb-1">\'¤</div>', 'text-2xl mb-1">👤</div>');

// Fix content area emojis
content = content.replace('\'ª Tap Power', '💪 Tap Power');
content = content.replace('\'† Taps', '👆 Taps');
content = content.replace('"¥ Combo', '🔥 Combo');

// Write back
fs.writeFileSync('frontend/index.html', content, 'utf8');

console.log('✅ All UI fixed perfectly!');
