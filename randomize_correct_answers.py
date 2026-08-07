import json
import random

def randomize_answers():
    # Set seed for reproducible professional shuffling
    random.seed(42)

    with open('frontend_development_template.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    total_questions = 0
    answer_distribution = {0: 0, 1: 0, 2: 0, 3: 0}

    for module in data['modules']:
        for lesson in module['lessons']:
            quiz = lesson.get('quiz', {})
            questions = quiz.get('questions', [])

            for q_idx, q in enumerate(questions):
                total_questions += 1
                options = q.get('options', [])
                current_correct_idx = q.get('correctAnswer', 0)

                # Get the correct text
                correct_text = options[current_correct_idx]

                # Target index for variety: distribute 0, 1, 2, 3 evenly
                target_idx = (q_idx + random.randint(0, 3)) % 4

                # Swap option[current_correct_idx] with option[target_idx]
                options[current_correct_idx], options[target_idx] = options[target_idx], options[current_correct_idx]

                # Update correctAnswer to target_idx
                q['correctAnswer'] = target_idx
                q['options'] = options

                answer_distribution[target_idx] += 1

    with open('frontend_development_template.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"SUCCESS! Randomized correct answers across {total_questions} questions.")
    print("Answer Index Distribution:")
    for idx, count in answer_distribution.items():
        pct = (count / total_questions) * 100
        print(f" - Option [{idx}]: {count} questions ({pct:.1f}%)")

if __name__ == '__main__':
    randomize_answers()
