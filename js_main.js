// ================== ХРАНИЛИЩЕ ==================
let appState = {
    level: 0,
    score: 0,
    doneTasks: [false, false, false],
    quizAnswers: { q1: null, q2: null, q3: null },
    quizChecked: false,
    settings: { dark: true, fontSize: '16px' }
};

const tasks = [
    { 
        title: "Переменная", 
        story: "Объяви переменную name и выведи её в консоль.", 
        desc: "Создайте переменную name со значением 'Витязь' и выведите её в консоль.", 
        hint: "let name = 'Витязь'; console.log(name);", 
        check: (code) => code.includes('let name') && code.includes('console.log') 
    },
    { 
        title: "Функция", 
        story: "Создай функцию приветствия.", 
        desc: "Напишите функцию sayHi, которая возвращает строку 'Бум!'.", 
        hint: "function sayHi() { return 'Бум!'; }", 
        check: (code) => code.includes('function sayHi') && code.includes('return') 
    },
    { 
        title: "Цикл", 
        story: "Выведи числа от 1 до 3.", 
        desc: "Используя цикл for, выведите в консоль числа 1, 2, 3.", 
        hint: "for(let i=1; i<=3; i++) { console.log(i); }", 
        check: (code) => code.includes('for') && code.includes('console.log') && code.includes('i')
    }
];

// ================= ЗАГРУЗКА =================
function loadData() {
    let raw = localStorage.getItem('codeQuestSave');
    if(raw) {
        try {
            let saved = JSON.parse(raw);
            appState = { ...appState, ...saved };
            if(!appState.doneTasks) appState.doneTasks = [false, false, false];
            if(!appState.quizAnswers) appState.quizAnswers = { q1: null, q2: null, q3: null };
        } catch(e) {
            console.log("Ошибка загрузки");
        }
    }
    let scoreSpan = document.getElementById('headerScore');
    if(scoreSpan) scoreSpan.innerText = appState.score;
    if(window.location.pathname.includes('index')) renderTask();
    if(window.location.pathname.includes('quiz')) renderQuizAnswers();
    if(window.location.pathname.includes('progress')) updateStatsUI();
    if(window.location.pathname.includes('settings')) applySettingsUI();
}

function saveAll() {
    localStorage.setItem('codeQuestSave', JSON.stringify(appState));
    let scoreSpan = document.getElementById('headerScore');
    if(scoreSpan) scoreSpan.innerText = appState.score;
}

// ================= СТРАНИЦА ПРАКТИКИ =================
function renderTask() {
    let t = tasks[appState.level];
    if(!t) return;
    let titleEl = document.getElementById('taskTitle');
    let descEl = document.getElementById('taskDesc');
    let storyEl = document.getElementById('storyTxt');
    let hintEl = document.getElementById('hintText');
    if(titleEl) titleEl.innerText = t.title;
    if(descEl) descEl.innerText = t.desc;
    if(storyEl) storyEl.innerText = t.story;
    if(hintEl) hintEl.innerText = t.hint;
    let nextBtn = document.getElementById('nextBtn');
    if(nextBtn) {
        if(appState.doneTasks[appState.level]) nextBtn.disabled = false;
        else nextBtn.disabled = true;
    }
}

// Запуск кода
function runCode() {
    let codeInput = document.getElementById('codeInput');
    let consoleOut = document.getElementById('consoleOut');
    if(!codeInput || !consoleOut) return;
    
    let code = codeInput.value;
    if(!code.trim()) {
        consoleOut.innerHTML = "> Напишите код в редакторе!";
        return;
    }
    
    try {
        let originalLog = console.log;
        let output = [];
        console.log = function(...args) {
            output.push(args.join(' '));
        };
        
        let func = new Function(code);
        func();
        
        console.log = originalLog;
        
        if(output.length > 0) {
            consoleOut.innerHTML = "> " + output.join('\n> ');
        } else {
            consoleOut.innerHTML = "> Код выполнен успешно! (нет вывода console.log)";
        }
    } catch(err) {
        consoleOut.innerHTML = "> Ошибка: " + err.message;
    }
}

// Проверка задания
function checkTask() {
    let codeInput = document.getElementById('codeInput');
    let consoleOut = document.getElementById('consoleOut');
    if(!codeInput || !consoleOut) return;
    
    if(appState.doneTasks[appState.level]) {
        consoleOut.innerHTML = "⚠️ Этот уровень уже пройден! Переходите дальше.";
        return;
    }
    
    let code = codeInput.value;
    if(!code.trim()) {
        consoleOut.innerHTML = "> Напишите код перед проверкой!";
        return;
    }
    
    let currentTask = tasks[appState.level];
    if(currentTask.check(code)) {
        appState.doneTasks[appState.level] = true;
        let addPoints = 100;
        appState.score += addPoints;
        saveAll();
        consoleOut.innerHTML = "✅ ПРАВИЛЬНО! +" + addPoints + " XP\n🎉 Отличная работа!";
        
        let nextBtn = document.getElementById('nextBtn');
        if(nextBtn) nextBtn.disabled = false;
        renderTask();
    } else {
        consoleOut.innerHTML = "❌ НЕВЕРНО.\n💡 Подсказка: " + currentTask.hint;
    }
}

// Следующий уровень
function nextLevel() {
    let consoleOut = document.getElementById('consoleOut');
    if(!consoleOut) return;
    
    if(!appState.doneTasks[appState.level]) {
        consoleOut.innerHTML = "⚠️ Сначала решите текущее задание!";
        return;
    }
    
    if(appState.level + 1 < tasks.length) {
        appState.level++;
        saveAll();
        renderTask();
        let codeInput = document.getElementById('codeInput');
        if(codeInput) codeInput.value = '';
        consoleOut.innerHTML = "> Новый уровень! Вперёд! 🚀";
        let nextBtn = document.getElementById('nextBtn');
        if(nextBtn) nextBtn.disabled = true;
    } else {
        consoleOut.innerHTML = "🏆 ПОЗДРАВЛЯЮ! Ты прошёл ВСЕ уровни! Ты настоящий герой кода! 🏆";
        let nextBtn = document.getElementById('nextBtn');
        if(nextBtn) nextBtn.disabled = true;
    }
}

// ================= ТЕСТЫ =================
function renderQuizAnswers() {
    if(appState.quizAnswers.q1) {
        let radio = document.querySelector(`input[name="q1"][value="${appState.quizAnswers.q1}"]`);
        if(radio) radio.checked = true;
    }
    if(appState.quizAnswers.q2) {
        let radio = document.querySelector(`input[name="q2"][value="${appState.quizAnswers.q2}"]`);
        if(radio) radio.checked = true;
    }
    if(appState.quizAnswers.q3) {
        let radio = document.querySelector(`input[name="q3"][value="${appState.quizAnswers.q3}"]`);
        if(radio) radio.checked = true;
    }
}

function saveQuiz() {
    let ans1 = document.querySelector('input[name="q1"]:checked')?.value;
    let ans2 = document.querySelector('input[name="q2"]:checked')?.value;
    let ans3 = document.querySelector('input[name="q3"]:checked')?.value;
    let msgDiv = document.getElementById('quizMsg');
    
    if(!ans1 || !ans2 || !ans3) {
        if(msgDiv) msgDiv.innerHTML = "❌ Ответьте на все три вопроса!";
        return;
    }
    
    appState.quizAnswers = { q1: ans1, q2: ans2, q3: ans3 };
    let pointsEarned = 0;
    if(ans1 === 'number') pointsEarned += 50;
    if(ans2 === 'const') pointsEarned += 50;
    if(ans3 === 'добавляет') pointsEarned += 50;
    
    appState.score += pointsEarned;
    appState.quizChecked = true;
    saveAll();
    
    if(msgDiv) msgDiv.innerHTML = `✅ Тест сохранён! Получено +${pointsEarned} XP.`;
    updateStatsUI();
}

// ================= СТАТИСТИКА =================
function updateStatsUI() {
    let doneCount = appState.doneTasks.filter(v => v === true).length;
    let quizDoneCount = 0;
    if(appState.quizAnswers.q1 && appState.quizAnswers.q2 && appState.quizAnswers.q3) quizDoneCount = 3;
    
    let totalScoreSpan = document.getElementById('totalScoreStat');
    let practicesSpan = document.getElementById('completedPractices');
    let quizzesSpan = document.getElementById('completedQuizzes');
    let progressBar = document.getElementById('globalProgressBar');
    
    if(totalScoreSpan) totalScoreSpan.innerText = appState.score;
    if(practicesSpan) practicesSpan.innerText = `${doneCount}/${tasks.length}`;
    if(quizzesSpan) quizzesSpan.innerText = `${quizDoneCount}/3`;
    
    if(progressBar) {
        let totalPercent = ((doneCount / tasks.length) * 50) + ((quizDoneCount / 3) * 50);
        progressBar.style.width = totalPercent + '%';
    }
}

function exportCSV() {
    let doneCount = appState.doneTasks.filter(v => v === true).length;
    let quizDoneCount = (appState.quizAnswers.q1 && appState.quizAnswers.q2 && appState.quizAnswers.q3) ? 3 : 0;
    let data = `Тип,Прогресс,Очки\nПрактика,${doneCount}/${tasks.length},${appState.score}\nТесты,${quizDoneCount}/3,${appState.score}`;
    let blob = new Blob([data], {type: 'text/csv'});
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'codequest_stats.csv';
    a.click();
}

// ================= НАСТРОЙКИ =================
function applySettingsUI() {
    let root = document.documentElement;
    if(appState.settings.dark) {
        document.body.style.background = "linear-gradient(145deg, #0b1a33 0%, #0a1222 100%)";
        document.body.style.color = "#eef5ff";
    } else {
        document.body.style.background = "#f0f4fc";
        document.body.style.color = "#1a2a4a";
    }
    document.body.style.fontSize = appState.settings.fontSize;
    
    let toggle = document.getElementById('darkModeToggle');
    if(toggle) toggle.checked = appState.settings.dark;
    
    let select = document.getElementById('fontSizeSelect');
    if(select) select.value = appState.settings.fontSize;
}

function toggleDark(e) {
    appState.settings.dark = e.target.checked;
    applySettingsUI();
    saveAll();
}

function changeFont(e) {
    appState.settings.fontSize = e.target.value;
    applySettingsUI();
    saveAll();
}

function hardReset() {
    if(confirm("Сбросить ВСЁ: прогресс, очки и настройки?")) {
        localStorage.removeItem('codeQuestSave');
        location.reload();
    }
}

// ================= ЗАПУСК =================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Привязываем кнопки
    let runBtn = document.getElementById('runBtn');
    if(runBtn) runBtn.onclick = runCode;
    
    let checkBtn = document.getElementById('checkBtn');
    if(checkBtn) checkBtn.onclick = checkTask;
    
    let nextBtn = document.getElementById('nextBtn');
    if(nextBtn) nextBtn.onclick = nextLevel;
    
    let submitQuiz = document.getElementById('submitQuizBtn');
    if(submitQuiz) submitQuiz.onclick = saveQuiz;
    
    let exportBtn = document.getElementById('exportStatsBtn');
    if(exportBtn) exportBtn.onclick = exportCSV;
    
    let darkToggle = document.getElementById('darkModeToggle');
    if(darkToggle) darkToggle.onchange = toggleDark;
    
    let fontSizeSelect = document.getElementById('fontSizeSelect');
    if(fontSizeSelect) fontSizeSelect.onchange = changeFont;
    
    let resetBtn = document.getElementById('hardResetBtn');
    if(resetBtn) resetBtn.onclick = hardReset;
});