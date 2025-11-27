#!/usr/bin/env python3
import re

# Read the file
with open('frontend/index.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Simple character-by-character replacements
content = content.replace('\u2019\u00aa', '💪')  # Tap Power
content = content.replace('\u2019\u2020', '👆')  # Taps
content = content.replace('\u201c\u00a5', '🔥')  # Combo
content = content.replace('\u2019\u00b0', '💰')  # Balance/Coins
content = content.replace('\u2019\u00a5', '👥')  # Friends
content = content.replace('\u2019\u00a4', '👤')  # Profile/User
content = content.replace('\u201c\u2039', '📋')  # Copy
content = content.replace('\u201c\u00a4', '📤')  # Share
content = content.replace('\u201c\u00a2', '📢')  # Broadcast
content = content.replace('\u201c\u0160', '📊')  # Stats
content = content.replace('\u201c\u201e', '🔄')  # Refresh
content = content.replace('\u00ab', '🚫')  # Ban
content = content.replace('\u2026', '✅')  # Unban/Check
content = content.replace('\u201c', '🔍')  # Find
content = content.replace('\u00a8', '✨')  # Claim
content = content.replace('\u00e2\u00b1\u00ef\u00bf\u00bd', '⏱️')  # Time
content = content.replace('\u00ef\u00bf\u00bd', '🔐')  # Admin
content = content.replace('div>div>', '</div>')  # Fix typo

# Write back
with open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all UI issues!")
