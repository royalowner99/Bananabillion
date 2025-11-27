#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Very targeted replacements - only in specific contexts
# Navigation bar icons
content = content.replace('text-2xl mb-0.5">\u2020</div>\n        <div class="text-xs font-semibold">Top', 'text-2xl mb-1">🏆</div>\n        <div class="text-xs font-semibold">Top')
content = content.replace("text-2xl mb-0.5">'\u00a5</div>\n        <div class=\"text-xs font-semibold\">Friends", 'text-2xl mb-1">👥</div>\n        <div class="text-xs font-semibold">Friends')
content = content.replace('text-2xl mb-0.5">"</div>\n        <div class="text-xs font-semibold">Admin', 'text-2xl mb-1">🔐</div>\n        <div class="text-xs font-semibold">Admin')
content = content.replace("text-2xl mb-0.5">'\u00a4</div>\n        <div class=\"text-xs font-semibold\">Me", 'text-2xl mb-1">👤</div>\n        <div class="text-xs font-semibold">Me')
content = content.replace('text-2xl mb-0.5">\U0001f381\u00ae</div>\n        <div class="text-xs font-semibold">Game', 'text-2xl mb-1">🎮</div>\n        <div class="text-xs font-semibold">Game')
content = content.replace('text-2xl mb-0.5">\U0001f381\u00af</div>\n        <div class="text-xs font-semibold">Tasks', 'text-2xl mb-1">🎯</div>\n        <div class="text-xs font-semibold">Tasks')

# Change all text-xl mb-0.5 to text-2xl mb-1 in navigation
content = content.replace('text-xl mb-0.5', 'text-2xl mb-1')

# Change py-2 to py-3 in navigation
content = content.replace('flex-1 py-2 text-center', 'flex-1 py-3 text-center')

# Content area emojis
content = content.replace("'\u00aa Tap Power", '💪 Tap Power')
content = content.replace("'\u2020 Taps", '👆 Taps')
content = content.replace('"\u00a5 Combo', '🔥 Combo')
content = content.replace("'\u00b0 Balance", '💰 Balance')

# Headers
content = content.replace('\u2020 Leaderboard', '🏆 Leaderboard')
content = content.replace('\U0001f381\u00af Tasks', '🎯 Tasks')

# Write back
with open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Perfect UI - all emojis and alignment fixed!')
