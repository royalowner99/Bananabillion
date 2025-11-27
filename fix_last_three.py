#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the last 3 navigation emojis - very carefully
content = content.replace("mb-1\">'¥</div>", 'mb-1">👥</div>')  # Friends
content = content.replace('mb-1">"</div>', 'mb-1">🔐</div>')  # Admin
content = content.replace("mb-1\">'¤</div>", 'mb-1">👤</div>')  # Profile

# Fix last 2 content emojis
content = content.replace("'🏆 Taps", '👆 Taps')
content = content.replace('"¥ Combo', '🔥 Combo')

with open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ PERFECT! All emojis fixed!')
print('Navigation: 🎮 ⚡ 🎯 🏆 👥 🔐 👤')
print('Content: 💪 👆 🔥 ⚡')
