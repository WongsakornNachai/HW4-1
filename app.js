document.addEventListener("DOMContentLoaded", function () {
    displayExpenses();
    displaySummary();

    document.getElementById("expense-form").addEventListener("submit", function (e) {
        e.preventDefault();

        const expense = {
            id: Date.now().toString(),
            title: document.getElementById("title").value,
            amount: parseFloat(document.getElementById("amount").value),
            category: document.getElementById("category").value,
            date: document.getElementById("date").value
        };

        addExpense(expense);
        displayExpenses();
        displaySummary();
        this.reset();
    });
});

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error reading from localStorage:", error);
        return [];
    }
}

function addExpense(expenseData) {
    let expenses = getFromLocalStorage("expenses");

    if (!expenseData.title || isNaN(expenseData.amount) || !expenseData.date) {
        console.error("Invalid expense data");
        return;
    }

    expenses.push(expenseData);
    saveToLocalStorage("expenses", expenses);
}

function getExpensesByDate(date) {
    const expenses = getFromLocalStorage("expenses");
    return expenses.filter(expense => expense.date === date);
}

function calculateTotalByCategory(category) {
    const expenses = getFromLocalStorage("expenses");
    return expenses
        .filter(expense => expense.category === category)
        .reduce((total, expense) => total + expense.amount, 0);
}

function generateMonthlyReport() {
    const expenses = getFromLocalStorage("expenses");
    const monthlyTotal = expenses.reduce((acc, expense) => {
        const month = expense.date.substring(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
    }, {});
    return monthlyTotal;
}

function displayExpenses() {
    const expenses = getFromLocalStorage("expenses");
    const expenseList = document.getElementById("expense-list");
    expenseList.innerHTML = "";

    expenses.forEach(expense => {
        const li = document.createElement("li");
        li.classList.add("expense-item");
        li.innerHTML = `${expense.title} - ${expense.amount} บาท (${expense.category}) - ${expense.date}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "ลบ";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.onclick = function () {
            deleteExpense(expense.id);
        };

        li.appendChild(deleteBtn);
        expenseList.appendChild(li);
    });
}

function deleteExpense(expenseId) {
    let expenses = getFromLocalStorage("expenses");
    expenses = expenses.filter(expense => expense.id !== expenseId);
    saveToLocalStorage("expenses", expenses);
    displayExpenses();
    displaySummary();
}

function displaySummary() {
    const summaryDiv = document.getElementById("summary");
    summaryDiv.innerHTML = "";

    const categories = ["food", "transport", "entertainment", "other"];
    categories.forEach(category => {
        const total = calculateTotalByCategory(category);
        if (total > 0) {
            const p = document.createElement("p");
            p.textContent = `หมวดหมู่ ${category}: ${total} บาท`;
            summaryDiv.appendChild(p);
        }
    });

    const monthlyReport = generateMonthlyReport();
    for (const [month, total] of Object.entries(monthlyReport)) {
        const p = document.createElement("p");
        p.textContent = `เดือน ${month}: ${total} บาท`;
        summaryDiv.appendChild(p);
    }
}