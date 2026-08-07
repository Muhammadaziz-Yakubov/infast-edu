import json
import re

def build_curriculum():
    with open('frontend_development_template.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Dictionary containing custom implementations for lessons
    # We will generate comprehensive lesson data for all 114 lessons.
    
    lesson_counter = 0
    for m_idx, module in enumerate(data['modules']):
        for l_idx, lesson in enumerate(module['lessons']):
            lesson_counter += 1
            order = lesson['order'] # global order or module order
            title = lesson['title']
            
            # Determine global lesson number from title (e.g. "1-Dars: ...")
            match = re.match(r'(\d+)-Dars', title)
            global_id = int(match.group(1)) if match else lesson_counter

            # Determine language based on module / topic
            if global_id <= 12:
                lang = "html"
            elif global_id <= 34:
                lang = "css"
            elif global_id <= 39:
                lang = "html" if global_id in [33, 34, 39] else "javascript"
            elif global_id <= 76:
                lang = "javascript"
            else:
                lang = "jsx"

            # Determine difficulty level text for context
            if global_id <= 24:
                difficulty = "Easy"
            elif global_id <= 76:
                difficulty = "Medium"
            elif global_id <= 102:
                difficulty = "Hard"
            else:
                difficulty = "Professional"

            # Create practice object
            practice = create_practice_for_lesson(global_id, title, lang, difficulty)
            
            # Create quiz object
            quiz = create_quiz_for_lesson(global_id, title, lang, difficulty)

            # Preserve rewards & passing score
            practice["xpReward"] = lesson.get('practice', {}).get('xpReward', 50)
            practice["coinReward"] = lesson.get('practice', {}).get('coinReward', 10)
            
            lesson['practice'] = practice
            lesson['quiz'] = quiz

    with open('frontend_development_template.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Successfully updated all {lesson_counter} lessons in frontend_development_template.json!")

def create_practice_for_lesson(lesson_id, title, lang, difficulty):
    # Topic extracted from title after colon
    topic = title.split(':', 1)[1].strip() if ':' in title else title

    if lang == "html":
        starter = f"<!DOCTYPE html>\n<html lang=\"uz\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>{topic}</title>\n</head>\n<body>\n    <!-- TODO: Topshiriq: {topic} bo'yicha HTML elementlarini yozing -->\n    \n</body>\n</html>"
    elif lang == "css":
        starter = f"/* {title} */\n/* TODO: {topic} bo'yicha CSS qoidalarini yozing */\n\n.container {{\n    /* Bu yerga stil bering */\n}}\n"
    elif lang == "javascript":
        starter = f"// {title}\n// TODO: {topic} bo'yicha mantiqiy funksiya va kodni yozing\n\nfunction solution() {{\n    // kodingizni shu yerga yozing\n}}\n"
    else:
        starter = f"import React from 'react';\n\n// {title}\n// TODO: {topic} bo'yicha komponent tayyorlang\nexport default function Component() {{\n    return (\n        <div>\n            {/* Komponent mazmuni */}\n        </div>\n    );\n}}\n"

    # We will build specific structural validation rules for each lesson_id
    val_rules = get_validation_rules(lesson_id, topic, lang)

    return {
        "title": f"{lesson_id}-Dars Amaliyoti: {topic}",
        "description": f"Ushbu amaliy topshiriqda '{topic}' bo'yicha real frontend vazifasini bajaring. Standartlarga va semantik qoidalarga strictly amal qiling.",
        "language": lang,
        "starterCode": starter,
        "expectedOutput": f"Kutilgan natija '{topic}' mavzusiga mos ravishda to'g'ri struktura va mantiqqa ega bo'lishi kerak.",
        "hints": [
            f"{topic} mavzusida o'rganilgan asosiy sintaksis va metodlardan foydalaning.",
            "Teglar, atributlar yoki funksiya nomlari to'g'ri yozilganligini tekshiring.",
            "Koddagi ortiqcha va xato sintaksislardan xoli bo'ling."
        ],
        "validationType": "structure",
        "validationRules": val_rules
    }

def get_validation_rules(lesson_id, topic, lang):
    # Specialized rules for specific lessons
    rules_map = {
        1: ["<!DOCTYPE html>", "<html[^>]*>", "<head>", "<body[^>]*>", "<h1[^>]*>.*?</h1>", "<p[^>]*>.*?</p>"],
        2: ["<!DOCTYPE html>", "<html[^>]*lang=[\"']uz[\"'][^>]*>", "<title>.*?</title>", "<header[^>]*>", "<main[^>]*>", "<footer[^>]*>"],
        3: ["<h1[^>]*>.*?</h1>", "<h2[^>]*>.*?</h2>", "<p[^>]*>.*?</p>", "<hr\\s*/?>"],
        4: ["<strong[^>]*>.*?</strong>", "<em[^>]*>.*?</em>", "<mark[^>]*>.*?</mark>", "<span[^>]*>.*?</span>"],
        5: ["<a[^>]*href=[\"']http[^\"']+[\"'][^>]*target=[\"']_blank[\"'][^>]*>", "rel=[\"'].*?noopener.*?[\"']"],
        6: ["<figure[^>]*>", "<img[^>]*src=[\"'].*?[\"'][^>]*alt=[\"'].+?[\"'][^>]*>", "<figcaption[^>]*>.*?</figcaption>"],
        7: ["<ul[^>]*>", "<ol[^>]*>", "<li[^>]*>.*?</li>", "<dl[^>]*>", "<dt[^>]*>", "<dd[^>]*>"],
        8: ["<form[^>]*action=[\"'].*?[\"'][^>]*method=[\"']POST[\"'][^>]*>", "<label[^>]*for=[\"'].*?[\"'][^>]*>", "<input[^>]*type=[\"'](text|password|email)[\"'][^>]*id=[\"'].*?[\"'][^>]*>"],
        9: ["<select[^>]*>", "<option[^>]*value=[\"'].*?[\"'][^>]*>", "<textarea[^>]*>", "<button[^>]*type=[\"']submit[\"'][^>]*>"],
        10: ["<header[^>]*>", "<nav[^>]*>", "<main[^>]*>", "<section[^>]*>", "<article[^>]*>", "<footer[^>]*>"],
        11: ["<meta[^>]*charset=[\"']UTF-8[\"'][^>]*>", "<meta[^>]*name=[\"']viewport[\"'][^>]*content=[\"'].*?width=device-width.*?[\"'][^>]*>", "<meta[^>]*name=[\"']description[\"'][^>]*>"],
        12: ["<!DOCTYPE html>", "<html[^>]*>", "<main[^>]*>", "alt=[\"'].+?[\"']"],
        13: ["<link[^>]*rel=[\"']stylesheet[\"'][^>]*href=[\"'].*?\\.css[\"'][^>]*>"],
        14: ["\\.[a-zA-Z0-9_-]+\\s*\\{", "#[a-zA-Z0-9_-]+\\s*\\{"],
        15: ["color:\\s*(#[0-9a-fA-F]{3,6}|rgba?\\([^)]+\\)|hsl\\([^)]+\\))"],
        16: ["font-family:", "font-size:", "font-weight:", "line-height:"],
        17: ["padding:", "margin:", "border:"],
        18: ["box-sizing:\\s*border-box"],
        19: ["position:\\s*(relative|absolute|fixed|sticky)", "top:", "z-index:"],
        20: ["display:\\s*(block|inline-block|flex|grid|none)"],
        21: ["overflow(-y|-x)?:\\s*(hidden|auto|scroll)", "z-index:\\s*\\d+"],
        22: [":hover", ":nth-child\\([^)]+\\)"],
        23: ["::before|::after", "content:\\s*[\"'].*?[\"']"],
        24: ["--[a-zA-Z0-9_-]+:", "var\\(--[a-zA-Z0-9_-]+\\)"],
        25: ["display:\\s*flex", "justify-content:", "align-items:"],
        26: ["flex-direction:", "flex-wrap:", "gap:"],
        27: ["display:\\s*grid", "grid-template-columns:\\s*.*?(fr|repeat)"],
        28: ["grid-template-areas:", "grid-area:|gap:"],
        29: ["@media\\s*\\([^)]*min-width:[^)]+\\)"],
        30: ["@media\\s*\\(min-width:\\s*\\d+px\\)"],
        31: ["transition:", "transform:\\s*(translate|scale|rotate)"],
        32: ["@keyframes\\s+[a-zA-Z0-9_-]+", "animation:"],
        35: ["git init", "git add", "git commit"],
        36: ["git branch", "git checkout|git merge"],
        37: ["git remote add origin", "git push"],
        40: ["console\\.log\\("],
        41: ["const\\s+[a-zA-Z0-9_]+", "let\\s+[a-zA-Z0-9_]+"],
        42: ["typeof\\s+"],
        43: ["===", "&&|\\|\\|"],
        44: ["if\\s*\\(", "\\?\\s*.*?\\s*:"],
        45: ["switch\\s*\\(", "case\\s+.*?:", "break;"],
        46: ["for\\s*\\(", "while\\s*\\("],
        47: ["function\\s+[a-zA-Z0-9_]+\\s*\\("],
        48: ["=>"],
        50: ["return\\s+function"],
        52: ["\\.push\\(", "\\.pop\\("],
        53: ["\\.map\\(", "\\.filter\\("],
        54: ["\\.find\\("],
        55: ["Object\\."],
        57: ["const\\s*\\{[^}]+\\}\\s*="],
        58: ["\\.\\.\\."],
        64: ["document\\.querySelector"],
        66: ["\\.textContent|\\.innerHTML"],
        67: ["\\.classList\\.(add|remove|toggle)"],
        68: ["\\.addEventListener\\(['\"]click['\"]"],
        69: ["e\\.preventDefault\\(\\)"],
        70: ["document\\.createElement"],
        72: ["new Promise", "\\.then\\("],
        73: ["async\\s+function|async\\s*\\(", "await\\s+"],
        74: ["fetch\\("],
        75: ["localStorage\\.(setItem|getItem)"],
        77: ["createRoot|ReactDOM"],
        79: ["className=", "<React\\.Fragment>|<>"],
        80: ["function\\s+[A-Z][a-zA-Z0-9_]*"],
        81: ["props|\\{[^}]+\\}"],
        82: ["children"],
        83: ["useState\\("],
        84: ["onClick=\\{", "onChange=\\{"],
        85: ["\\?\\s*.*?\\s*:", "&&"],
        86: ["\\.map\\(", "key=\\{"],
        87: ["value=\\{", "onChange=\\{"],
        88: ["useEffect\\("],
        89: ["useEffect\\(", "fetch\\("],
        90: ["useRef\\("],
        91: ["function\\s+use[A-Z][a-zA-Z0-9_]*"],
        92: ["createContext\\("],
        93: ["useContext\\("],
        94: ["useMemo\\("],
        95: ["useCallback\\("],
        96: ["createBrowserRouter|Routes"],
        97: ["useNavigate|Link|NavLink"],
        98: ["useParams\\("],
        99: ["<Outlet\\s*/?>"],
        100: ["className=[\"'].*?(flex|grid|p-|m-|text-).*?[\"']"],
        104: ["create\\("],
        105: ["createSlice|configureStore"],
        106: ["useSelector|useDispatch"],
        107: ["useQuery|useMutation"],
        108: ["axios\\.create|interceptors"],
        109: ["lazy\\(", "<Suspense"],
        110: ["Bearer|Authorization"],
        111: ["componentDidCatch|ErrorBoundary"],
        112: ["npm run build|bundle"]
    }
    
    return rules_map.get(lesson_id, [rf"{lang}", rf"{topic.split()[0]}"])

def create_quiz_for_lesson(lesson_id, title, lang, difficulty):
    topic = title.split(':', 1)[1].strip() if ':' in title else title

    # Build 9 specialized questions for each lesson:
    # 3 round 1 (conceptual)
    # 3 round 2 (code reading)
    # 3 round 3 (practical / problem solving)
    
    # We will generate specific tailored questions for all lessons!
    questions = generate_questions_for_lesson(lesson_id, topic, lang, difficulty)
    
    return {
        "passingScore": 80,
        "questions": questions
    }

def generate_questions_for_lesson(lesson_id, topic, lang, difficulty):
    # This function creates 9 tailored, topic-specific questions with realistic code snippets & distractors
    
    # Let's import or load full question generator data
    from question_bank import get_questions_for_id
    return get_questions_for_id(lesson_id, topic, lang, difficulty)

if __name__ == '__main__':
    build_curriculum()
