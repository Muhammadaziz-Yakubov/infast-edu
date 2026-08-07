# verify_backend_audit.py
# Audit Verification Suite for backend_development_template.json

import json
from collections import Counter

def verify_backend_curriculum(file_path):
    print(f"Verifying {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    modules = data.get('modules', [])
    assert len(modules) == 6, f"Expected 6 modules, found {len(modules)}"

    total_lessons = 0
    total_quizzes = 0
    answer_dist = Counter()
    missing_exp_count = 0
    weak_desc_count = 0
    weak_prac_count = 0

    for m in modules:
        lessons = m.get('lessons', [])
        for l in lessons:
            total_lessons += 1
            title = l.get('title', '')
            desc = l.get('description', '')

            # 1. Check Description Depth
            if len(desc) < 150 or "📌 **Nima uchun kerak:**" not in desc:
                weak_desc_count += 1

            # 2. Check Practice Quality
            prac = l.get('practice', {})
            s_code = prac.get('starterCode', '')
            rules = prac.get('validationRules', [])
            xp = prac.get('xpReward', 0)
            coins = prac.get('coinReward', 0)

            if len(s_code) < 30 or len(rules) == 0 or xp == 0 or coins == 0:
                weak_prac_count += 1

            # 3. Check Quizzes
            quiz = l.get('quiz', {})
            questions = quiz.get('questions', [])
            assert len(questions) == 9, f"Lesson '{title}' has {len(questions)} questions instead of 9"

            for q in questions:
                total_quizzes += 1
                c_ans = q.get('correctAnswer')
                answer_dist[c_ans] += 1

                exp = q.get('explanation', '')
                if not exp or len(exp) < 10:
                    missing_exp_count += 1

    print("\n================ VERIFICATION SUMMARY ================")
    print(f"Total Modules: {len(modules)}")
    print(f"Total Lessons: {total_lessons}")
    print(f"Total Quiz Questions: {total_quizzes}")
    print(f"Weak Descriptions: {weak_desc_count}")
    print(f"Weak Practices: {weak_prac_count}")
    print(f"Missing Explanations: {missing_exp_count}")
    print("Correct Answer Index Distribution:")
    for idx in sorted(answer_dist.keys()):
        pct = (answer_dist[idx] / total_quizzes) * 100
        print(f"  Index {idx}: {answer_dist[idx]} ({pct:.2f}%)")

    assert weak_desc_count == 0, f"Found {weak_desc_count} weak descriptions"
    assert weak_prac_count == 0, f"Found {weak_prac_count} weak practices"
    assert missing_exp_count == 0, f"Found {missing_exp_count} missing explanations"
    print("\n[SUCCESS] ALL AUDIT VERIFICATION CHECKS PASSED PERFECTLY!")

if __name__ == '__main__':
    verify_backend_curriculum('backend_development_template.json')
