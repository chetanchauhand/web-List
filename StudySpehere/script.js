
let tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let notes = JSON.parse(localStorage.getItem("studyNotes")) || [];
let sessions = Number(localStorage.getItem("studySessions")) || 0;

let remaining = 25 * 60;
let timer = null;

document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

function saveTasks() {
    localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function renderTasks() {
    const list = document.getElementById("taskList");

    list.innerHTML = tasks.map((task, index) => `
        <li class="${task.done ? "done" : ""}">
            <span>${escapeHTML(task.text)}</span>
            <div>
                <button onclick="toggleTask(${index})">
                    ${task.done ? "Undo" : "Done"}
                </button>
                <button onclick="deleteTask(${index})">Delete</button>
            </div>
        </li>
    `).join("");

    document.getElementById("completed").textContent =
        tasks.filter(t => t.done).length;

    document.getElementById("pending").textContent =
        tasks.filter(t => !t.done).length;
}

function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
    })[char]);
}

document.getElementById("taskForm").addEventListener("submit", e => {
    e.preventDefault();

    const input = document.getElementById("taskInput");
    const value = input.value.trim();

    if (!value) return;

    tasks.push({ text: value, done: false });
    input.value = "";
    saveTasks();
    renderTasks();
});

function toggleTask(index) {
    tasks[index].done = !tasks[index].done;
    saveTasks();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function updateClock() {
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;

    document.getElementById("clock").textContent =
        `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function startTimer() {
    if (timer !== null) return;

    document.getElementById("timerStatus").textContent = "Focus session running...";

    timer = setInterval(() => {
        remaining--;
        updateClock();

        if (remaining <= 0) {
            clearInterval(timer);
            timer = null;
            sessions++;
            localStorage.setItem("studySessions", sessions);
            document.getElementById("sessions").textContent = sessions;
            document.getElementById("timerStatus").textContent =
                "Focus session completed! Take a short break.";
            alert("Congratulations! Your focus session is complete.");
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    timer = null;
    document.getElementById("timerStatus").textContent = "Timer paused.";
}

function resetTimer() {
    pauseTimer();
    remaining = 25 * 60;
    updateClock();
    document.getElementById("timerStatus").textContent = "Timer reset.";
}

function saveNote() {
    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();

    if (!title || !content) {
        alert("Enter note title and content.");
        return;
    }

    notes.push({ title, content });
    localStorage.setItem("studyNotes", JSON.stringify(notes));

    document.getElementById("noteTitle").value = "";
    document.getElementById("noteContent").value = "";

    renderNotes();
}

function renderNotes() {
    document.getElementById("noteList").innerHTML =
        notes.map((note, index) => `
            <div class="note">
                <h3>${escapeHTML(note.title)}</h3>
                <p>${escapeHTML(note.content)}</p>
                <button onclick="deleteNote(${index})">Delete</button>
            </div>
        `).join("");
}

function deleteNote(index) {
    notes.splice(index, 1);
    localStorage.setItem("studyNotes", JSON.stringify(notes));
    renderNotes();
}

document.getElementById("sessions").textContent = sessions;

renderTasks();
renderNotes();
updateClock();
