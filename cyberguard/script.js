
function checkPassword() {
    const password = document.getElementById("password").value;
    const bar = document.getElementById("bar");
    const result = document.getElementById("result");

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        "Very Weak",
        "Weak",
        "Fair",
        "Good",
        "Strong",
        "Very Strong"
    ];

    bar.style.width = (score / 5 * 100) + "%";
    bar.style.background =
        score <= 1 ? "#ff4444" :
        score <= 3 ? "#ffb52e" : "#00e5a0";

    result.textContent = password
        ? "Strength: " + levels[score]
        : "Please enter a password.";
}

function checkURL() {
    const value = document.getElementById("url").value.trim();
    const output = document.getElementById("urlResult");

    if (!value) {
        output.textContent = "Please enter a URL.";
        return;
    }

    try {
        const url = new URL(
            value.includes("://") ? value : "https://" + value
        );

        const warnings = [];

        if (url.protocol !== "https:") {
            warnings.push("Not using HTTPS");
        }

        if (url.hostname.includes("@")) {
            warnings.push("Contains unusual @ character");
        }

        if (url.hostname.split(".").length > 4) {
            warnings.push("Unusually long subdomain");
        }

        output.textContent = warnings.length
            ? "Warning: " + warnings.join(" | ")
            : "No obvious URL structure warnings found.";

    } catch {
        output.textContent = "Invalid URL format.";
    }
}

const questions = [
    {
        question: "What does HTTPS indicate?",
        answers: ["Encrypted connection", "Free website", "Faster internet"],
        correct: 0
    },
    {
        question: "Which is a strong password?",
        answers: ["123456", "password", "R@in#82Moon!"],
        correct: 2
    },
    {
        question: "What is phishing?",
        answers: [
            "A type of computer",
            "A fraudulent attempt to steal information",
            "A programming language"
        ],
        correct: 1
    }
];

let currentQuestion = 0;

function loadQuestion() {
    const q = questions[currentQuestion];

    document.getElementById("question").textContent = q.question;

    document.getElementById("answers").innerHTML =
        q.answers.map((answerText, index) =>
            `<button onclick="answer(${index})">${answerText}</button>`
        ).join("");

    document.getElementById("quizResult").textContent = "";
}

function answer(index) {
    const correct = questions[currentQuestion].correct;

    document.getElementById("quizResult").textContent =
        index === correct ? "Correct answer!" : "Incorrect. Try again!";
}

function nextQuestion() {
    currentQuestion = (currentQuestion + 1) % questions.length;
    loadQuestion();
}

loadQuestion();
