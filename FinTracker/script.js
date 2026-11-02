
const form = document.getElementById("transactionForm");

let transactions = JSON.parse(
    localStorage.getItem("fintrackTransactions") || "[]"
);

function saveData() {
    localStorage.setItem(
        "fintrackTransactions",
        JSON.stringify(transactions)
    );
}

function formatMoney(amount) {
    return "₹" + amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function updateDashboard() {
    const income = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    document.getElementById("income").textContent =
        formatMoney(income);

    document.getElementById("expense").textContent =
        formatMoney(expense);

    document.getElementById("balance").textContent =
        formatMoney(income - expense);

    displayTransactions();
    displayChart();
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const category = document.getElementById("category").value;

    if (!title || !Number.isFinite(amount) || amount <= 0) {
        alert("Please enter valid transaction details.");
        return;
    }

    const transaction = {
        id: Date.now() + Math.random(),
        title,
        amount,
        type,
        category,
        date: new Date().toLocaleDateString("en-IN")
    };

    transactions.unshift(transaction);

    saveData();
    updateDashboard();
    form.reset();
});

function displayTransactions() {
    const container = document.getElementById("transactions");

    if (transactions.length === 0) {
        container.textContent = "No transactions added yet.";
        return;
    }

    container.innerHTML = transactions.map(t => `
        <div class="transaction">
            <div>
                <strong>${escapeHTML(t.title)}</strong>
                <small>${escapeHTML(t.category)} · ${escapeHTML(t.date)}</small>
            </div>

            <strong class="${t.type === "income" ? "income-text" : "expense-text"}">
                ${t.type === "income" ? "+" : "-"}${formatMoney(t.amount)}
            </strong>

            <button class="delete-btn" onclick="deleteTransaction('${t.id}')">
                Delete
            </button>
        </div>
    `).join("");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function deleteTransaction(id) {
    transactions = transactions.filter(
        t => String(t.id) !== String(id)
    );

    saveData();
    updateDashboard();
}

function displayChart() {
    const container = document.getElementById("chart");

    const expenses = transactions.filter(
        t => t.type === "expense"
    );

    const categories = {};

    expenses.forEach(t => {
        categories[t.category] =
            (categories[t.category] || 0) + t.amount;
    });

    const entries = Object.entries(categories);

    if (entries.length === 0) {
        container.textContent = "Add expenses to see your breakdown.";
        return;
    }

    const maxAmount = Math.max(...entries.map(item => item[1]));

    container.innerHTML = entries.map(([category, amount]) => `
        <div class="chart-row">
            <div class="chart-label">
                <span>${escapeHTML(category)}</span>
                <strong>${formatMoney(amount)}</strong>
            </div>

            <div class="chart-bar">
                <div class="chart-fill"
                    style="width:${amount / maxAmount * 100}%">
                </div>
            </div>
        </div>
    `).join("");
}

updateDashboard();
