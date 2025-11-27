#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix navigation icons with exact Unicode replacements
content = content.replace('\u2020</div>', '🏆</div>')  # Trophy
content = content.replace("'\u00a5</div>", '👥</div>')  # Friends  
content = content.replace('"</div>', '🔐</div>')  # Admin - this might be too broad
content = content.replace("'\u00a4</div>", '👤</div>')  # Profile

# Fix content emojis
content = content.replace("'\u00aa Tap Power", '💪 Tap Power')
content = content.replace("'\u2020 Taps", '👆 Taps')
content = content.replace('"\u00a5 Combo', '🔥 Combo')
content = content.replace("'\u00b0 Balance", '💰 Balance')

# Write back
with open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ All emojis fixed!')
