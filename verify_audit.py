import json
import re

with open('frontend_development_template.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

total_modules = len(data['modules'])
total_lessons = 0
total_questions = 0
code_questions = 0
broken_strings = 0
missing_desc_sections = 0

issues = []

required_sections = [
    '📌 NIMA UCHUN KERAK',
    '📍 QAYERDA ISHLATILADI',
    '❌ KO\'P YO\'L QO\'YILADIGAN XATOLAR',
    '💡 BEST PRACTICES',
    '🚀 REAL-WORLD MISOLLAR',
    '💼 INTERVIEW TIPS',
    '⚡ PERFORMANCE & ACCESSIBILITY'
]

for m_idx, module in enumerate(data['modules']):
    for l_idx, lesson in enumerate(module['lessons']):
        total_lessons += 1
        title = lesson.get('title', '')
        desc = lesson.get('description', '')

        # Check description sections
        for sec in required_sections:
            if sec not in desc:
                missing_desc_sections += 1
                issues.append(f'Lesson {total_lessons} ({title}): missing section "{sec}"')

        # Check practice
        p = lesson.get('practice', {})
        if not p.get('starterCode') or not p.get('expectedOutput') or len(p.get('validationRules', [])) == 0:
            issues.append(f'Lesson {total_lessons} ({title}): practice fields incomplete')

        # Check quiz
        q = lesson.get('quiz', {})
        questions = q.get('questions', [])
        if len(questions) != 9:
            issues.append(f'Lesson {total_lessons} ({title}): question count is {len(questions)}, expected 9')

        for qn in questions:
            total_questions += 1
            q_text = qn.get('question', '')
            if '```' in q_text:
                code_questions += 1
            
            # Check for broken string residues
            if 'funksiyalar:' in q_text or 'tushunchalar:' in q_text:
                broken_strings += 1
                issues.append(f'Lesson {total_lessons}: broken string in question: "{q_text[:50]}"')
            
            for opt in qn.get('options', []):
                if 'funksiyalar:' in opt or 'tushunchalar:' in opt:
                    broken_strings += 1
                    issues.append(f'Lesson {total_lessons}: broken string in option: "{opt[:50]}"')

print(f'Total Modules: {total_modules}')
print(f'Total Lessons: {total_lessons}')
print(f'Total Questions: {total_questions}')
print(f'Code Questions: {code_questions}/{total_questions} ({(code_questions/total_questions)*100:.1f}%)')
print(f'Missing Description Sections: {missing_desc_sections}')
print(f'Broken String Residues: {broken_strings}')
print(f'Total Issues Found: {len(issues)}')

if issues:
    print('\nFirst 10 Issues:')
    for iss in issues[:10]:
        print(' -', iss)
