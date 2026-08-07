import json
import re

# Load original template
with open('frontend_development_template.json', 'r', encoding='utf-8') as f:
    template = json.load(f)

print(f"Loaded template with {len(template['modules'])} modules.")
