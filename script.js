/* ================================================================
   SMART EXPENSE TRACKER - JAVASCRIPT
   ================================================================ */

// ==================== VARIABLES ====================

const APP_NAME = "Smart Expense Tracker";
const VERSION = "1.0.0";

let transactions = [];
let totalIncome = 0;
let totalExpenses = 0;
let balance = 0;
let monthlyBudget = 0;
let budgetChecker = null;

const incomeCategories = ["Salary", "Freelance", "Investment"];
const expenseCategories = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Other"];
const allCategories = [...incomeCategories, ...expenseCategories];


// ==================== UTILITY FUNCTIONS ====================

function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function formatCurrency(amount) {
    return '₹' + Math.abs(amount).toFixed(2);
}

function getCurrentDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return day + '/' + month + '/' + year;
}


// ==================== VALIDATION ====================

function validateTransaction(description, amount, category) {
    if (!description || description.trim() === "" || description.trim().length < 2) {
        console.error("❌ Invalid description");
        return false;
    }
    
    if (isNaN(amount) || amount === "" || parseFloat(amount) === 0) {
        console.error("❌ Invalid amount");
        return false;
    }
    
    if (!category || !allCategories.includes(category)) {
        console.error("❌ Invalid category");
        return false;
    }
    
    return true;
}


// ==================== CORE FUNCTIONS ====================

function addTransaction(description, amount, category) {
    if (!validateTransaction(description, amount, category)) {
        return false;
    }
    
    let parsedAmount = parseFloat(amount);
    
    // Automatically handle sign based on category
    if (expenseCategories.includes(category)) {
        parsedAmount = -Math.abs(parsedAmount);
    } else if (incomeCategories.includes(category)) {
        parsedAmount = Math.abs(parsedAmount);
    }
    
    const newTransaction = {
        id: generateId(),
        description: description.trim(),
        amount: parsedAmount,
        category: category,
        type: parsedAmount >= 0 ? "Income" : "Expense",
        date: getCurrentDate(),
        timestamp: Date.now()
    };
    
    transactions.push(newTransaction);
    console.log("✅ Transaction added!");
    console.table([newTransaction]);
    
    updateAll();
    return true;
}

function deleteTransaction(id) {
    let index = -1;
    
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {
            index = i;
            break;
        }
    }
    
    if (index === -1) {
        console.error("❌ Not found");
        return false;
    }
    
    transactions.splice(index, 1);
    console.log("🗑️ Deleted");
    updateAll();
    return true;
}

function clearAllTransactions() {
    if (transactions.length === 0) {
        console.warn("⚠️ No transactions");
        return false;
    }
    
    transactions = [];
    console.log("🧹 Cleared");
    updateAll();
    return true;
}


// ==================== CALCULATIONS ====================

const calculateTotalIncome = () => transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

const calculateTotalExpenses = () => Math.abs(
    transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)
);

const calculateBalance = () => totalIncome - totalExpenses;

const updateTotals = () => {
    totalIncome = calculateTotalIncome();
    totalExpenses = calculateTotalExpenses();
    balance = calculateBalance();
};


// ==================== FILTERING & SORTING ====================

const filterByType = (type) => {
    switch (type) {
        case "income": return transactions.filter(t => t.amount > 0);
        case "expense": return transactions.filter(t => t.amount < 0);
        default: return transactions;
    }
};

const filterByCategory = (category) => {
    return category === "all" ? transactions : transactions.filter(t => t.category === category);
};

const getFilteredTransactions = () => {
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    
    let result = transactions;
    
    if (typeFilter !== "all") result = filterByType(typeFilter);
    if (categoryFilter !== "all") result = result.filter(t => t.category === categoryFilter);
    
    return result;
};

const sortTransactions = (arr, sortType) => {
    const sorted = [...arr];
    
    switch (sortType) {
        case "date-desc": return sorted.sort((a, b) => b.timestamp - a.timestamp);
        case "date-asc": return sorted.sort((a, b) => a.timestamp - b.timestamp);
        case "amount-desc": return sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        case "amount-asc": return sorted.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
        default: return sorted;
    }
};


// ==================== STATISTICS ====================

const getAverageTransaction = () => {
    if (transactions.length === 0) return 0;
    return transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length;
};

const getLargestIncome = () => {
    const incomes = transactions.filter(t => t.amount > 0);
    if (incomes.length === 0) return 0;
    return incomes.reduce((max, t) => t.amount > max ? t.amount : max, 0);
};

const getLargestExpense = () => {
    const expenses = transactions.filter(t => t.amount < 0);
    if (expenses.length === 0) return 0;
    return Math.abs(expenses.reduce((min, t) => t.amount < min ? t.amount : min, 0));
};

const getExpensesByCategory = () => {
    return transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => {
            const cat = t.category;
            acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
            return acc;
        }, {});
};


// ==================== BUDGET CLOSURE ====================

function createBudgetChecker(limit) {
    let budgetLimit = limit;
    
    return {
        check: function(expenses) {
            const percentage = (expenses / budgetLimit) * 100;
            let status, message;
            
            if (percentage >= 100) { status = "danger"; message = "🚨 Budget EXCEEDED!"; }
            else if (percentage >= 80) { status = "warning"; message = "⚠️ Approaching limit!"; }
            else if (percentage >= 50) { status = "caution"; message = "📊 Over half used."; }
            else { status = "safe"; message = "✅ Within budget!"; }
            
            return { status, message, percentage, remaining: budgetLimit - expenses };
        },
        getLimit: function() { return budgetLimit; },
        setLimit: function(newLimit) { if (newLimit > 0) { budgetLimit = newLimit; return true; } return false; }
    };
}

function setMonthlyBudget(amount) {
    if (isNaN(amount) || amount <= 0) {
        console.error("❌ Invalid budget");
        return false;
    }
    
    monthlyBudget = parseFloat(amount);
    budgetChecker = createBudgetChecker(monthlyBudget);
    console.log("💰 Budget: " + formatCurrency(monthlyBudget));
    updateBudgetDisplay();
    return true;
}


// ==================== DISPLAY FUNCTIONS ====================

const displayBalance = () => {
    const el = document.getElementById('balance');
    el.textContent = formatCurrency(balance);
    el.classList.remove('positive', 'negative');
    if (balance > 0) el.classList.add('positive');
    else if (balance < 0) el.classList.add('negative');
};

const displayTotals = () => {
    document.getElementById('total-income').textContent = '+' + formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = '-' + formatCurrency(totalExpenses);
};

const updateBudgetDisplay = () => {
    document.getElementById('budget-amount').textContent = monthlyBudget.toFixed(2);
    document.getElementById('spent-amount').textContent = totalExpenses.toFixed(2);
    
    const progressFill = document.getElementById('progress-fill');
    const budgetStatus = document.getElementById('budget-status');
    
    if (monthlyBudget > 0 && budgetChecker) {
        const result = budgetChecker.check(totalExpenses);
        const pct = Math.min(result.percentage, 100);
        
        progressFill.style.width = pct + '%';
        progressFill.className = 'progress-fill ' + result.status;
        budgetStatus.className = 'budget-status ' + result.status;
        budgetStatus.textContent = result.message;
    } else {
        progressFill.style.width = '0%';
        progressFill.className = 'progress-fill';
        budgetStatus.className = 'budget-status';
        budgetStatus.textContent = 'Set a budget to track spending';
    }
};

const displayTransactions = () => {
    let filtered = getFilteredTransactions();
    filtered = sortTransactions(filtered, document.getElementById('sort-by').value);
    
    document.getElementById('transaction-count').textContent = filtered.length + ' transactions';
    
    const clearBtn = document.getElementById('clear-all-btn');
    if (transactions.length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
    
    const listEl = document.getElementById('transaction-list');
    
    if (filtered.length === 0) {
        listEl.innerHTML = '<p class="empty-message">No transactions found.</p>';
        return;
    }
    
    listEl.innerHTML = filtered.map(t => {
        const typeClass = t.amount >= 0 ? 'income' : 'expense';
        const prefix = t.amount >= 0 ? '+' : '-';
        
        return `
            <div class="transaction-item ${typeClass}">
                <div class="transaction-info">
                    <div class="transaction-description">${t.description}</div>
                    <div class="transaction-meta">
                        <span class="transaction-category">${t.category}</span>
                        <span class="transaction-date">${t.date}</span>
                    </div>
                </div>
                <span class="transaction-amount ${typeClass}">${prefix}${formatCurrency(t.amount)}</span>
                <button class="btn btn-delete" onclick="handleDelete(${t.id})">✕</button>
            </div>
        `;
    }).join('');
};

const displayStatistics = () => {
    document.getElementById('stat-total').textContent = transactions.length;
    document.getElementById('stat-average').textContent = formatCurrency(getAverageTransaction());
    document.getElementById('stat-largest-income').textContent = formatCurrency(getLargestIncome());
    document.getElementById('stat-largest-expense').textContent = formatCurrency(getLargestExpense());
    
    const categoryData = getExpensesByCategory();
    const categories = Object.keys(categoryData);
    const containerEl = document.getElementById('category-stats');
    
    if (categories.length === 0) {
        containerEl.innerHTML = '<p class="empty-message">No expense data</p>';
        return;
    }
    
    const maxAmount = Math.max(...Object.values(categoryData));
    categories.sort((a, b) => categoryData[b] - categoryData[a]);
    
    containerEl.innerHTML = categories.map(cat => {
        const amount = categoryData[cat];
        const pct = (amount / maxAmount) * 100;
        
        return `
            <div class="category-item">
                <span class="category-name">${cat}</span>
                <div class="category-bar">
                    <div class="category-bar-fill" style="width: ${pct}%"></div>
                </div>
                <span class="category-amount">${formatCurrency(amount)}</span>
            </div>
        `;
    }).join('');
};

function updateAll() {
    updateTotals();
    displayBalance();
    displayTotals();
    displayTransactions();
    displayStatistics();
    updateBudgetDisplay();
}


// ==================== EVENT HANDLERS ====================

function handleFormSubmit(event) {
    event.preventDefault();
    
    const desc = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    
    if (addTransaction(desc, amount, category)) {
        document.getElementById('transaction-form').reset();
        document.getElementById('description').focus();
    }
}

function handleDelete(id) {
    if (confirm('Delete this transaction?')) {
        deleteTransaction(id);
    }
}

function handleSetBudget() {
    const amount = document.getElementById('budget-input').value;
    if (setMonthlyBudget(amount)) {
        document.getElementById('budget-input').value = '';
    }
}

function handleFilterChange() {
    displayTransactions();
}

function handleClearAll() {
    if (confirm('Delete ALL transactions?')) {
        clearAllTransactions();
    }
}


// ==================== SAMPLE DATA ====================

function addSampleData() {
    console.log("📝 Adding sample data...");
    
    const samples = [
        { desc: "Salary", amount: 75000, cat: "Salary" },
        { desc: "Freelance", amount: 15000, cat: "Freelance" },
        { desc: "Dividends", amount: 3000, cat: "Investment" },
        { desc: "Groceries", amount: -4500, cat: "Food" },
        { desc: "Restaurant", amount: -1800, cat: "Food" },
        { desc: "Uber", amount: -1200, cat: "Transport" },
        { desc: "Petrol", amount: -3000, cat: "Transport" },
        { desc: "Amazon", amount: -5500, cat: "Shopping" },
        { desc: "Movie", amount: -800, cat: "Entertainment" },
        { desc: "Netflix", amount: -499, cat: "Entertainment" },
        { desc: "Electricity", amount: -2500, cat: "Bills" },
        { desc: "Internet", amount: -999, cat: "Bills" },
        { desc: "Medicine", amount: -650, cat: "Health" }
    ];
    
    for (let t of samples) {
        addTransaction(t.desc, t.amount, t.cat);
    }
    
    setMonthlyBudget(25000);
    
    console.log("✅ Done! " + transactions.length + " transactions added.");
}


// ==================== INITIALIZATION ====================

function init() {
    console.log("═══════════════════════════════════════");
    console.log("  💰 " + APP_NAME + " v" + VERSION);
    console.log("═══════════════════════════════════════");
    console.log("📌 Type: addSampleData()");
    console.log("═══════════════════════════════════════");
    
    document.getElementById('transaction-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('set-budget-btn').addEventListener('click', handleSetBudget);
    document.getElementById('budget-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleSetBudget();
    });
    document.getElementById('filter-type').addEventListener('change', handleFilterChange);
    document.getElementById('filter-category').addEventListener('change', handleFilterChange);
    document.getElementById('sort-by').addEventListener('change', handleFilterChange);
    document.getElementById('clear-all-btn').addEventListener('click', handleClearAll);
    
    updateAll();
    console.log("✅ Ready!");
}

document.addEventListener('DOMContentLoaded', init);


// ==================== GLOBAL EXPORTS ====================

window.addTransaction = addTransaction;
window.deleteTransaction = deleteTransaction;
window.clearAllTransactions = clearAllTransactions;
window.setMonthlyBudget = setMonthlyBudget;
window.addSampleData = addSampleData;
window.handleDelete = handleDelete;
window.transactions = transactions;