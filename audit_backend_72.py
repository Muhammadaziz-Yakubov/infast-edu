# audit_backend_72.py
# Master Audit & Quality Enhancement Script for backend_development_template.json

import json
import random
import sys

# Load helper modules
from build_backend_audit import get_backend_lesson_data
from handcraft_backend_curriculum import HANDCRAFTED_BACKEND_LESSONS

def process_backend_curriculum(file_path):
    print(f"Reading template from {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_lessons = 0
    lesson_counter = 0

    for module in data.get('modules', []):
        for lesson in module.get('lessons', []):
            lesson_counter += 1
            l_num = lesson_counter
            title = lesson.get('title', f"Lesson {l_num}")

            # Fetch handcrafted or procedurally enriched content
            if l_num in HANDCRAFTED_BACKEND_LESSONS:
                custom_data = HANDCRAFTED_BACKEND_LESSONS[l_num]
                desc = custom_data['description']
                prac = custom_data['practice']
                # Merge procedural quiz questions with custom descriptions
                quiz_data = get_backend_lesson_data(l_num, title)['quizzes']
            else:
                custom_data = get_backend_lesson_data(l_num, title)
                desc = custom_data['description']
                prac = custom_data['practice']
                quiz_data = custom_data['quizzes']

            # Update lesson description
            lesson['description'] = desc

            # Update practice
            old_prac = lesson.get('practice', {})
            old_prac['title'] = prac['title']
            old_prac['description'] = prac['description']
            old_prac['language'] = prac.get('language', 'javascript')
            old_prac['starterCode'] = prac['starterCode']
            old_prac['validationType'] = "contains"
            old_prac['validationRules'] = prac['validationRules']
            old_prac['xpReward'] = prac['xpReward']
            old_prac['coinReward'] = prac['coinReward']
            lesson['practice'] = old_prac

            # Update Quiz Questions (3 rounds x 3 questions = 9 questions)
            quiz = lesson.get('quiz', {})
            quiz['passingScore'] = 80

            new_questions = []
            for q_info in quiz_data:
                # Randomize correct answer index across 0..3
                rnd_ans = random.randint(0, 3)
                opts = list(q_info['opts'])
                old_ans = q_info['ans']
                
                # Swap so correct option is at rnd_ans
                opts[old_ans], opts[rnd_ans] = opts[rnd_ans], opts[old_ans]

                q_obj = {
                    "question": q_info['q'],
                    "options": opts,
                    "correctAnswer": rnd_ans,
                    "round": q_info['round'],
                    "explanation": q_info['exp']
                }
                new_questions.append(q_obj)

            quiz['questions'] = new_questions
            lesson['quiz'] = quiz

            total_lessons += 1

    print(f"Processed {total_lessons} lessons across {len(data.get('modules', []))} modules.")

    # Write back updated valid JSON
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Successfully saved audit enhancements to {file_path}!")

if __name__ == '__main__':
    process_backend_curriculum('backend_development_template.json')
