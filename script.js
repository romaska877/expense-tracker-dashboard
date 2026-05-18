const themeToggle = document.getElementById("themeToggle");
const transactionForm = document.getElementById("transactionForm");
const transactionName = document.getElementById("transactionName");
const transactionAmount = document.getElementById("transactionAmount");
const transactionType = document.getElementById("transactionType");
const transactionCategory = document.getElementById("transactionCategory");
const formMessage = document.getElementById("formMessage");

const balanceAmount = document.getElementById("balanceAmount");
const incomeAmount = document.getElementById("incomeAmount");
const expenseAmount = document.getElementById("expenseAmount");

const transactionList = document.getElementById("transactionList");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const sortTransactions = document.getElementById("sortTransactions");
const chartList = document.getElementById("chartList");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "Light" : "Dark";
});

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function formatMoney(amount) {
  return `£${amount.toFixed(2)}`;
}

function renderSummary() {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = income - expenses;

  balanceAmount.textContent = formatMoney(balance);
  incomeAmount.textContent = formatMoney(income);
  expenseAmount.textContent = formatMoney(expenses);
}

function getFilteredTransactions() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = filterCategory.value;
  const selectedSort = sortTransactions.value;

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.name.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || transaction.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  filteredTransactions.sort((a, b) => {
    if (selectedSort === "newest") {
      return b.id - a.id;
    }

    if (selectedSort === "oldest") {
      return a.id - b.id;
    }

    if (selectedSort === "highest") {
      return b.amount - a.amount;
    }

    if (selectedSort === "lowest") {
      return a.amount - b.amount;
    }
  });

  return filteredTransactions;
}

function renderTransactions() {
  const filteredTransactions = getFilteredTransactions();

  transactionList.innerHTML = "";

  if (filteredTransactions.length === 0) {
    transactionList.innerHTML = `<p class="empty-state">No transactions found.</p>`;
    return;
  }

  filteredTransactions.forEach((transaction) => {
    const sign = transaction.type === "income" ? "+" : "-";

    const transactionItem = document.createElement("div");
    transactionItem.className = "transaction-item";

    transactionItem.innerHTML = `
      <div class="transaction-info">
        <h3>${transaction.name}</h3>
        <p>${transaction.category} • ${transaction.date}</p>
      </div>

      <p class="transaction-amount ${transaction.type}">
        ${sign}${formatMoney(transaction.amount)}
      </p>

      <button class="delete-btn" data-id="${transaction.id}">×</button>
    `;

    transactionList.appendChild(transactionItem);
  });
}

function renderChart() {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense"
  );

  chartList.innerHTML = "";

  if (expenseTransactions.length === 0) {
    chartList.innerHTML = `<p class="empty-state">No expense data yet.</p>`;
    return;
  }

  const totalsByCategory = {};

  expenseTransactions.forEach((transaction) => {
    if (!totalsByCategory[transaction.category]) {
      totalsByCategory[transaction.category] = 0;
    }

    totalsByCategory[transaction.category] += transaction.amount;
  });

  const highestAmount = Math.max(...Object.values(totalsByCategory));

  Object.entries(totalsByCategory).forEach(([category, amount]) => {
    const percentage = (amount / highestAmount) * 100;

    const chartRow = document.createElement("div");
    chartRow.className = "chart-row";

    chartRow.innerHTML = `
      <div class="chart-info">
        <span>${category}</span>
        <strong>${formatMoney(amount)}</strong>
      </div>

      <div class="chart-bar">
        <div class="chart-fill" style="width: ${percentage}%"></div>
      </div>
    `;

    chartList.appendChild(chartRow);
  });
}

function renderApp() {
  renderSummary();
  renderTransactions();
  renderChart();
}

transactionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = transactionName.value.trim();
  const amount = Number(transactionAmount.value);
  const type = transactionType.value;
  const category = transactionCategory.value;

  if (name === "" || amount <= 0) {
    formMessage.textContent = "Please enter a valid name and amount.";
    return;
  }

  const newTransaction = {
    id: Date.now(),
    name,
    amount,
    type,
    category,
    date: new Date().toLocaleDateString("en-GB"),
  };

  transactions.push(newTransaction);
  saveTransactions();
  renderApp();

  transactionForm.reset();
  formMessage.textContent = "";
});

transactionList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const id = Number(event.target.dataset.id);

    transactions = transactions.filter((transaction) => transaction.id !== id);

    saveTransactions();
    renderApp();
  }
});

searchInput.addEventListener("input", renderTransactions);
filterCategory.addEventListener("change", renderTransactions);
sortTransactions.addEventListener("change", renderTransactions);

renderApp();