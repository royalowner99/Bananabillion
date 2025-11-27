#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Fix corrupted emojis in index.html

with open('frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace corrupted characters with proper emojis
replacements = {
    "'°": "💰",
    "'ª": "💪",
    "'¥": "👥",
    "'¤": "👤",
    "'🏆": "👆",
    ""¥": "🔥",
    ""‹": "📋",
    ""¤": "📤",
    ""¢": "📢",
    ""Š": "📊",
    ""„": "🔄",
    "ï¿½": "🔐",
    "«": "🚫",
    "…": "✅",
    """: "🔍",
    "¨": "✨",
    "â±ï¿½": "⏱️",
    "div>div>": "</div>",  # Fix the typo
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Write back
with open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all emojis in index.html")
