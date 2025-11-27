#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix remaining navigation icons
content = content.replace("mb-1">'¥</div>", 'mb-1">👥</div>')  # Friends
content = content.replace('mb-1">"</div>', 'mb-1">🔐</div>')  # Admin
content = content.replace("mb-1">'¤</div>", 'mb-1">👤</div>')  # Profile

# Fix content area
content = content.replace("'ª Tap Power", '💪 Tap Power')
content = content.replace("'🏆 Taps", '👆 Taps')
content = content.replace('"¥ Combo', '🔥 Combo')
content = content.replace("'° Balance", '💰 Balance')

# Fix headers
content = content.replace('🏆 Leaderboard', '🏆 Leaderboard')  # Already correct

with open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Perfect! All emojis and alignment fixed!')
