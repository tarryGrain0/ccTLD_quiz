// HTML要素の取得
const startContainer = document.getElementById('start-container');
const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const timerEl = document.getElementById('timer');
const resultContainer = document.getElementById('result-container');
const quizContainer = document.getElementById('quiz-container');
const accuracyEl = document.getElementById('accuracy');
const totalTimeEl = document.getElementById('total-time');
const currentQuestionEl = document.getElementById('current-question');
const totalQuestionsEl = document.getElementById('total-questions');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let startTime;
let timerInterval;
let userAnswers = []; // ユーザーの回答履歴を記録する配列を追加

// 1. JSONファイルを読み込んでクイズ問題を生成する
async function loadQuiz() {
    try {
        const res = await fetch('./ccTLD_Data.json');
        const ccTLDData = await res.json();

        // ランダムに10問の問題を生成
        questions = generateQuestions(ccTLDData, 10);
        startQuiz();
    } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
        questionEl.textContent = 'データの読み込みに失敗しました。ページを再読み込みしてください。';
    }
}

// クイズ問題を生成する
function generateQuestions(data, count) {
    const generatedQuestions = [];
    const usedIndices = new Set();

    while (generatedQuestions.length < count && usedIndices.size < data.length) {
        const randomIndex = Math.floor(Math.random() * data.length);

        if (usedIndices.has(randomIndex)) continue;
        usedIndices.add(randomIndex);

        const correctAnswer = data[randomIndex];

        // 間違いの選択肢を3つ選ぶ
        const wrongChoices = [];
        while (wrongChoices.length < 3) {
            const wrongIndex = Math.floor(Math.random() * data.length);
            if (wrongIndex !== randomIndex &&
                !wrongChoices.find(choice => choice.country_name_jp === data[wrongIndex].country_name_jp)) {
                wrongChoices.push(data[wrongIndex]);
            }
        }

        // 選択肢をシャッフル
        const choices = [correctAnswer, ...wrongChoices].sort(() => Math.random() - 0.5);

        generatedQuestions.push({
            question: `.${correctAnswer.ccTDL}`,
            choices: choices.map(choice => choice.country_name_jp),
            answer: correctAnswer.country_name_jp
        });
    }

    return generatedQuestions;
}

// 2. クイズを開始する
function startQuiz() {
    startContainer.classList.add('hidden');
    quizContainer.classList.remove('hidden');

    currentQuestionIndex = 0;
    score = 0;
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);

    if (totalQuestionsEl) {
        totalQuestionsEl.textContent = questions.length;
    }

    showQuestion();
}

// 3. 問題と選択肢を表示する
function showQuestion() {
    const question = questions[currentQuestionIndex];
    questionEl.textContent = question.question;

    if (currentQuestionEl) {
        currentQuestionEl.textContent = currentQuestionIndex + 1;
    }

    choicesEl.innerHTML = '';
    question.choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.onclick = () => selectAnswer(choice);
        choicesEl.appendChild(button);
    });
}

// 4. タイマーを更新する
function updateTimer() {
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    timerEl.textContent = elapsed;
}

// 5. 回答を選択したときの処理
function selectAnswer(selectedChoice) {
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedChoice === question.answer;

    // ユーザーの回答を記録
    userAnswers.push({
        questionIndex: currentQuestionIndex,
        question: question.question,
        userAnswer: selectedChoice,
        correctAnswer: question.answer,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        score++;
    }
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

// 6. 結果を表示する
function showResult() {
    clearInterval(timerInterval);
    const totalTime = Math.floor((new Date() - startTime) / 1000);
    const accuracy = Math.round((score / questions.length) * 100);

    quizContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    accuracyEl.textContent = accuracy;
    totalTimeEl.textContent = totalTime;

    // 正誤判定表を表示
    displayResultTable();
}

// 7. 正誤判定表を表示する
function displayResultTable() {
    const resultBody = document.getElementById('result-body');
    resultBody.innerHTML = '';

    userAnswers.forEach((answer, index) => {
        const row = document.createElement('tr');
        row.className = answer.isCorrect ? 'correct' : 'incorrect';

        row.innerHTML = `
            <td>${answer.question}</td>
            <td>${answer.userAnswer}</td>
            <td>${answer.correctAnswer}</td>
            <td class="result-icon">${answer.isCorrect ? '✓' : '✗'}</td>
        `;

        resultBody.appendChild(row);
    });
}