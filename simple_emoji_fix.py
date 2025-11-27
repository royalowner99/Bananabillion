#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Simple character-by-character replacements
replacements = [
    ('\u2020', '🏆'),  # Trophy
    ("'\u00a5", '👥'),  # Friends
    ("'\u00a4", '👤'),  # Profile
    ("'\u00aa", '💪'),  # Tap Power
    ('"\u00a5', '🔥'),  # Combo
    ("'\u00b0", '💰'),  # Balance
    ('\u00a8', '✨'),  # Claim
    ('\U0001f381\u00af', '🎯'),  # Tasks
    ('\U0001f381\u00ae', '🎮'),  # Game
]

for old, new in replacements:
    content = content.replace(old, new)

# Fix admin icon - be careful with quotes
content = content.replace('mb-1">"</div>', 'mb-1">🔐</div>')

# Improve navigation alignment
content = content.replace('text-xl mb-0.5', 'text-2xl mb-1')
content = content.replace('flex-1 py-2 text-center', 'flex-1 py-3 text-center')

with open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ All emojis fixed!')
print('✅ Navigation aligned perfectly!')
