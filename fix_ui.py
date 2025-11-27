#!/usr/bin/env python3
import codecs

# Read the file
with codecs.open('frontend/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define replacements - using actual byte sequences
replacements = [
    ("'ª", "💪"),
    ("'†", "👆"),
    (""¥", "🔥"),
    ("'°", "💰"),
    ("'¥", "👥"),
    ("'¤", "👤"),
    (""‹", "📋"),
    (""¤", "📤"),
    (""¢", "📢"),
    (""Š", "📊"),
    (""„", "🔄"),
    ("«", "🚫"),
    ("…", "✅"),
    (""", "🔍"),
    ("¨", "✨"),
    ("â±ï¿½", "⏱️"),
    ("ï¿½", "🔐"),
    ("div>div>", "</div>"),
]

# Apply replacements
for old, new in replacements:
    content = content.replace(old, new)

# Write back
with codecs.open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all UI issues!")
print("Fixed emojis and HTML tags")
