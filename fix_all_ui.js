const fs = require('fs');

// Read the file
let content = fs.readFileSync('frontend/index.html', 'utf8');

// Fix all corrupted emojis with proper Unicode replacements
const fixes = [
  // Balance/Coins
  [/['']°/g, '💰'],
  // Tap Power
  [/['']ª/g, '💪'],
  // Taps
  [/['']†/g, '👆'],
  // Combo
  [/[""]¥/g, '🔥'],
  // Friends
  [/['']¥/g, '👥'],
  // Profile/User
  [/['']¤/g, '👤'],
  // Copy
  [/[""]‹/g, '📋'],
  // Share
  [/[""]¤/g, '📤'],
  // Broadcast
  [/[""]¢/g, '📢'],
  // Stats
  [/[""]Š/g, '📊'],
  // Refresh
  [/[""]„/g, '🔄'],
  // Ban
  [/«/g, '🚫'],
  // Check/Unban
  [/…/g, '✅'],
  // Find
  [/[""](?!\w)/g, '🔍'],
  // Claim
  [/¨/g, '✨'],
  // Leaderboard trophy
  [/†(?=\s*Leaderboard)/g, '🏆'],
  [/†(?=\s*Taps)/g, '👆'],
  // Tasks
  [/🎁¯/g, '🎯'],
  // Game icon
  [/🎁®/g, '🎮'],
  // Admin
  [/ï¿½/g, '🔐'],
  // Time
  [/â±ï¿½/g, '⏱️'],
];

// Apply all fixes
fixes.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

// Fix navigation bar - make icons bigger and better aligned
content = content.replace(
  /<button onclick="switchTab\('game', event\)" class="tab-btn tab-active flex-1 py-2 text-center">\s*<div class="text-xl mb-0\.5">.*?<\/div>\s*<div class="text-xs font-semibold">Game<\/div>/s,
  `<button onclick="switchTab('game', event)" class="tab-btn tab-active flex-1 py-3 text-center">
        <div class="text-2xl mb-1">🎮</div>
        <div class="text-xs font-semibold">Game</div>`
);

content = content.replace(
  /<button onclick="switchTab\('upgrades', event\)" class="tab-btn flex-1 py-2 text-center">\s*<div class="text-xl mb-0\.5">⚡<\/div>\s*<div class="text-xs font-semibold">Boost<\/div>/s,
  `<button onclick="switchTab('upgrades', event)" class="tab-btn flex-1 py-3 text-center">
        <div class="text-2xl mb-1">⚡</div>
        <div class="text-xs font-semibold">Boost</div>`
);

content = content.replace(
  /<button onclick="switchTab\('tasks', event\)" class="tab-btn flex-1 py-2 text-center">\s*<div class="text-xl mb-0\.5">.*?<\/div>\s*<div class="text-xs font-semibold">Tasks<\/div>/s,
  `<button onclick="switchTab('tasks', event)" class="tab-btn flex-1 py-3 text-center">
        <div class="text-2xl mb-1">🎯</div>
        <div class="text-xs font-semibold">Tasks</div>`
);

content = content.replace(
  /<button onclick="switchTab\('leaderboard', event\)" class="tab-btn flex-1 py-2 text-center">\s*<div class="text-xl mb-0\.5">.*?<\/div>\s*<div class="text-xs font-semibold">Top<\/div>/s,
  `<button onclick="switchTab('leaderboard', event)" class="tab-btn flex-1 py-3 text-center">
        <div class="text-2xl mb-1">🏆</div>
        <div class="text-xs font-semibold">Top</div>`
);

content = content.replace(
  /<button onclick="switchTab\('friends', event\)" class="tab-btn flex-1 py-2 text-center">\s*<div class="text-xl mb-0\.5">.*?<\/div>\s*<div class="text-xs font-semibold">Friends<\/div>/s,
  `<button onclick="switchTab('friends', event)" class="tab-btn flex-1 py-3 text-center">
        <div class="text-2xl mb-1">👥</div>
        <div class="text-xs font-semibold">Friends</div>`
);

content = content.replace(
  /<button onclick="switchTab\('admin', event\)" class="tab-btn flex-1 py-2 text-center hidden" id="adminTabBtn">\s*<div class="text-xl mb-0\.5">.*?<\/div>\s*<div class="text-xs font-semibold">Admin<\/div>/s,
  `<button onclick="switchTab('admin', event)" class="tab-btn flex-1 py-3 text-center hidden" id="adminTabBtn">
        <div class="text-2xl mb-1">🔐</div>
        <div class="text-xs font-semibold">Admin</div>`
);

content = content.replace(
  /<button onclick="switchTab\('profile', event\)" class="tab-btn flex-1 py-2 text-center">\s*<div class="text-xl mb-0\.5">.*?<\/div>\s*<div class="text-xs font-semibold">Me<\/div>/s,
  `<button onclick="switchTab('profile', event)" class="tab-btn flex-1 py-3 text-center">
        <div class="text-2xl mb-1">👤</div>
        <div class="text-xs font-semibold">Me</div>`
);

// Write back
fs.writeFileSync('frontend/index.html', content, 'utf8');

console.log('✅ Fixed all UI issues!');
console.log('✅ Fixed emoji encoding');
console.log('✅ Improved navigation alignment');
console.log('✅ Made icons bigger and clearer');
