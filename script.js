/**
 * SMART EXPENSE TRACKER - JavaScript Fundamentals Demonstration
 *
 * This file demonstrates core JavaScript concepts including:
 * - Variables (var, let, const) and their scope implications
 * - Data Types (Primitive and Reference)
 * - Operators, Control Flow, Functions, Closures, and Higher-Order Functions
 */

// ==================== GLOBAL SCOPE ====================
// Global variables (accessible throughout the entire script)
// Using const for values that should not be reassigned (mutability: constant reference only)
const APP_NAME = "Smart Expense Tracker";
const VERSION = "1.0.0";

// Global mutable state using let (block-scoped, can be reassigned)
let transactions = [];            // Reference type: Array (mutable, passed by reference)
let totalIncome = 0;              // Primitive type: Number
let totalExpenses = 0;            // Primitive type: Number
let balance = 0;                  // Primitive type: Number
let monthlyBudget = 0;            // Primitive type: Number
let budgetChecker = null;         // Reference type: Object (or null)

// Constant arrays (const prevents reassignment, but array content remains mutable)
const incomeCategories = ["Salary", "Freelance", "Investment"];  // Reference type: Array
const expenseCategories = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Other"];  // Array
const allCategories = [...incomeCategories, ...expenseCategories];  // Spread operator: creates new array literal

// ==================== UTILITY FUNCTIONS ====================
// Function Declaration: Hoisted (can be called before declaration in code)
// These are pure functions (no side effects, return same output for same input)

/**
 * GENERATE UNIQUE ID
 * Demonstrates: expressions, Math operations, Date object
 * @returns {number} Unique identifier using timestamp + random
 */
function generateId() {
    // Date.now() returns current timestamp (primitive Number)
    // Math.random() generates random number between 0 and 1
    // Math.floor() rounds down to nearest integer
    return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * FORMAT CURRENCY
 * Demonstrates: string concatenation, Math.abs(), toFixed()
 * @param {number} amount - Amount to format (primitive Number)
 * @returns {string} Formatted currency string with ₹ symbol
 */
function formatCurrency(amount) {
    // Primitive Number methods: toFixed() returns string
    // Math.abs() returns absolute value (positive)
    // + operator for string concatenation
    return '₹' + Math.abs(amount).toFixed(2);
}

/**
 * GET CURRENT DATE
 * Demonstrates: Date object, String methods, padStart()
 * @returns {string} Date in DD/MM/YYYY format
 */
function getCurrentDate() {
    const date = new Date();                    // Reference type: Date object
    const day = String(date.getDate()).padStart(2, '0');   // String primitive with padStart()
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();           // Primitive Number
    // Template literal (backticks) for string construction
    return `${day}/${month}/${year}`;
}

// ==================== VALIDATION ====================
/**
 * VALIDATE TRANSACTION
 * Demonstrates: conditionals (if/else), logical operators (||, &&), type checking
 * Call by value: primitives (description, amount) are passed by value
 * Call by reference: category (string primitive) is passed by value
 * @param {string} description - Transaction description (primitive String)
 * @param {string|number} amount - Transaction amount (could be string or number)
 * @param {string} category - Transaction category (primitive String)
 * @returns {boolean} true if valid, false otherwise
 */
function validateTransaction(description, amount, category) {
    // Logical OR (||): short-circuits if first truthy
    // String methods: trim(), length
    // Strict equality (===) compares type and value
    if (!description || description.trim() === "" || description.trim().length < 2) {
        console.error("❌ Invalid description");  // console.error() for errors
        return false;                             // Primitive Boolean
    }

    // isNaN() checks if value is Not-a-Number
    // parseFloat() converts string to Number
    if (isNaN(amount) || amount === "" || parseFloat(amount) === 0) {
        console.error("❌ Invalid amount");
        return false;
    }

    // Array.includes() checks if category exists
    if (!category || !allCategories.includes(category)) {
        console.error("❌ Invalid category");
        return false;
    }

    return true;
}

// ==================== CRUD OPERATIONS ====================
/**
 * ADD TRANSACTION
 * Demonstrates: object literals, ternary operator, array methods (push), closures (outside scope)
 * @param {string} description - Transaction description
 * @param {string|number} amount - Transaction amount
 * @param {string} category - Transaction category
 * @returns {boolean} true if added successfully
 */
function addTransaction(description, amount, category) {
    // Validation
    if (!validateTransaction(description, amount, category)) {
        return false;
    }

    let parsedAmount = parseFloat(amount);  // Convert string to Number (primitive type)

    // Ternary operator (condition ? true : false)
    // Automatically handle sign based on category
    if (expenseCategories.includes(category)) {
        parsedAmount = -Math.abs(parsedAmount);  // Make negative for expenses
    } else if (incomeCategories.includes(category)) {
        parsedAmount = Math.abs(parsedAmount);   // Make positive for income
    }

    // Object literal: Creating a new transaction object (reference type)
    const newTransaction = {
        id: generateId(),                      // Number (primitive)
        description: description.trim(),       // String (primitive)
        amount: parsedAmount,                  // Number (primitive)
        category: category,                    // String (primitive)
        type: parsedAmount >= 0 ? "Income" : "Expense",  // Ternary operator
        date: getCurrentDate(),               // String (primitive)
        timestamp: Date.now()                 // Number (primitive, Unix timestamp for sorting)
    };

    // Array method: push() adds element to end (mutates original array)
    transactions.push(newTransaction);
    console.log("✅ Transaction added!");     // console.log() for info
    console.table([newTransaction]);         // console.table() displays array of objects as table

    updateAll();  // Call another function (nested function call)
    return true;
}

// Function Expression: Assigned to variable (not hoisted)
// Can be anonymous or named
const deleteTransaction = function(id) {
    // Linear search algorithm: for loop
    let index = -1;  // Initialize with sentinel value

    // For loop: traditional iteration (counter-based)
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {  // Strict equality (===)
            index = i;
            break;  // break: exits the loop early when found
        }
    }

    if (index === -1) {
        console.error("❌ Not found");
        return false;
    }

    // Array.splice() mutates array by removing element at index
    transactions.splice(index, 1);  // Remove 1 element at position index
    console.log("🗑️ Deleted");
    updateAll();
    return true;
};

// Arrow Function Expression: Concise syntax, lexical this
const clearAllTransactions = () => {
    // Check if array is empty (length property)
    if (transactions.length === 0) {
        console.warn("⚠️ No transactions");  // console.warn() for warnings
        return false;
    }

    // Reassign global variable (primitive assignment)
    transactions = [];  // Empty array (new reference)
    console.log("🧹 Cleared");
    updateAll();
    return true;
};

// ==================== CALCULATIONS ====================
// Arrow Functions: Concise, single-expression, implicit return
// Callback functions passed to array methods (higher-order functions)

// Array.filter() creates new array with elements that pass test
// Higher-order function: takes function as argument (predicate)
// Implicit return for single-expression arrow functions
const calculateTotalIncome = () => transactions
    .filter(t => t.amount > 0)                           // filter(): Higher-Order Function
    .reduce((sum, t) => sum + t.amount, 0);             // reduce(): Accumulator pattern

const calculateTotalExpenses = () => Math.abs(
    transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0)           // Sum negative amounts
);

// Arrow function with block body (needs explicit return)
const calculateBalance = () => {
    // Accessing outer scope variables (closure)
    // Primitive values: totalIncome and totalExpenses are accessed directly
    return totalIncome - totalExpenses;
};

// Function updating multiple global variables
const updateTotals = () => {
    totalIncome = calculateTotalIncome();      // Assignment operator (=)
    totalExpenses = calculateTotalExpenses();
    balance = calculateBalance();
};

// ==================== FILTERING & SORTING ====================
// Demonstrates: switch statements, array methods, closures

/**
 * FILTER BY TYPE
 * Demonstrates: switch statement, return in each case
 * @param {string} type - "income", "expense", or "all"
 * @returns {Array} Filtered array (new array)
 */
const filterByType = (type) => {
    // Switch statement: multiple condition branches
    switch (type) {
        case "income":
            // filter() returns NEW array (does not mutate original)
            return transactions.filter(t => t.amount > 0);
        case "expense":
            return transactions.filter(t => t.amount < 0);
        default:  // Fallback case
            return transactions;  // Return reference to original array
    }
};

// Arrow function with single parameter, concise body
const filterByCategory = (category) => {
    // Ternary operator for conditional return
    return category === "all" ? transactions : transactions.filter(t => t.category === category);
};

// Function that reads DOM and returns filtered data
const getFilteredTransactions = () => {
    // DOM manipulation: getElementById() returns Element or null
    const typeFilter = document.getElementById('filter-type').value;  // .value property (string)
    const categoryFilter = document.getElementById('filter-category').value;

    let result = transactions;  // Start with all transactions

    // if statements (multiple conditions)
    if (typeFilter !== "all") {
        // Nested function call: filterByType() returns array (reference)
        result = filterByType(typeFilter);
    }
    if (categoryFilter !== "all") {
        // Array.filter() with arrow function (lexical this, closure on categoryFilter)
        result = result.filter(t => t.category === categoryFilter);
    }

    return result;  // Returns array (reference type)
};

/**
 * SORT TRANSACTIONS
 * Demonstrates: array spreading [...], sort() with compare function, switch
 * @param {Array} arr - Array to sort (reference)
 * @param {string} sortType - Sorting criterion
 * @returns {Array} Sorted array (new array, original not mutated due to spread)
 */
const sortTransactions = (arr, sortType) => {
    // Spread operator: creates shallow copy (new array with same object references)
    const sorted = [...arr];

    switch (sortType) {
        case "date-desc":
            // sort() mutates array but we're sorting copy
            // Compare function: returns negative, 0, positive
            // Subtraction: numeric comparison
            return sorted.sort((a, b) => b.timestamp - a.timestamp);
        case "date-asc":
            return sorted.sort((a, b) => a.timestamp - b.timestamp);
        case "amount-desc":
            // Math.abs() for absolute value comparison
            return sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        case "amount-asc":
            return sorted.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
        default:
            return sorted;
    }
};

// ==================== STATISTICS ====================
// Demonstrates: reduce() with accumulator, Math.max/min, Object methods

/**
 * GET AVERAGE TRANSACTION
 * Demonstrates: ternary (if empty), reduce() for aggregation
 * @returns {number} Average transaction amount (primitive)
 */
const getAverageTransaction = () => {
    // Ternary operator for boundary check
    if (transactions.length === 0) return 0;
    // reduce(): sum all amounts then divide
    return transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length;
};

/**
 * GET LARGEST INCOME
 * Demonstrates: filter + reduce, nested ternary
 * @returns {number} Largest income amount
 */
const getLargestIncome = () => {
    const incomes = transactions.filter(t => t.amount > 0);  // Filter incomes
    if (incomes.length === 0) return 0;
    // reduce() with comparison: finds maximum
    return incomes.reduce((max, t) => t.amount > max ? t.amount : max, 0);
};

/**
 * GET LARGEST EXPENSE
 * Demonstrates: reduce with Math.abs
 * @returns {number} Largest expense (absolute value)
 */
const getLargestExpense = () => {
    const expenses = transactions.filter(t => t.amount < 0);
    if (expenses.length === 0) return 0;
    // Ternary inside reduce: track minimum (most negative)
    return Math.abs(expenses.reduce((min, t) => t.amount < min ? t.amount : min, 0));
};

/**
 * GET EXPENSES BY CATEGORY
 * Demonstrates: reduce() building object accumulator
 * @returns {Object} Object with category keys and summed amounts
 */
const getExpensesByCategory = () => {
    return transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => {
            // Object property access: bracket notation (dynamic)
            const cat = t.category;
            // Logical OR for default: acc[cat] || 0
            acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
            return acc;  // Must return accumulator for next iteration
        }, {});  // Initial value: empty object (reference type)
};

// ==================== BUDGET CLOSURE ====================
// Demonstrates: Closures (factory function returning object with private state)
// Object methods, lexical scope

/**
 * CREATE BUDGET CHECKER (Closure Factory)
 * Demonstrates: closures - returned object retains access to budgetLimit variable
 * @param {number} limit - Monthly budget limit
 * @returns {Object} Budget checker object with methods checking spending
 */
function createBudgetChecker(limit) {
    let budgetLimit = limit;  // Private variable captured by closure

    // Return object literal with methods (closures accessing budgetLimit)
    return {
        // Method: check expenses against budget
        check: function(expenses) {
            // Arithmetic with division and multiplication
            const percentage = (expenses / budgetLimit) * 100;
            let status, message;

            // Nested if/else if/else chain
            if (percentage >= 100) {
                status = "danger";
                message = "🚨 Budget EXCEEDED!";
            } else if (percentage >= 80) {
                status = "warning";
                message = "⚠️ Approaching limit!";
            } else if (percentage >= 50) {
                status = "caution";
                message = "📊 Over half used.";
            } else {
                status = "safe";
                message = "✅ Within budget!";
            }

            // Object literal return
            return { status, message, percentage, remaining: budgetLimit - expenses };
        },
        // Getter method (getter pattern)
        getLimit: function() { return budgetLimit; },
        // Setter method with validation
        setLimit: function(newLimit) {
            if (newLimit > 0) {
                budgetLimit = newLimit;  // Modifies closed-over variable
                return true;
            }
            return false;
        }
    };
}

/**
 * SET MONTHLY BUDGET
 * @param {number} amount - Budget amount
 * @returns {boolean} true if set successfully
 */
function setMonthlyBudget(amount) {
    // Validation: isNaN(), comparison
    if (isNaN(amount) || amount <= 0) {
        console.error("❌ Invalid budget");
        return false;
    }

    monthlyBudget = parseFloat(amount);           // Convert to Number
    budgetChecker = createBudgetChecker(monthlyBudget);  // Store closure
    console.log("💰 Budget: " + formatCurrency(monthlyBudget));
    updateBudgetDisplay();
    return true;
}

// ==================== DISPLAY FUNCTIONS ====================
// Demonstrates: DOM manipulation, template literals, array methods

/**
 * DISPLAY BALANCE
 * Demonstrates: DOM methods (getElementById), classList API, conditional classes
 */
const displayBalance = () => {
    const el = document.getElementById('balance');  // Returns HTMLElement or null
    // Template literal with string interpolation
    el.textContent = formatCurrency(balance);

    // classList methods: remove() and add()
    el.classList.remove('positive', 'negative');  // Remove multiple classes

    // Nested if/else for conditional class application
    if (balance > 0) {
        el.classList.add('positive');
    } else if (balance < 0) {
        el.classList.add('negative');
    }
};

/**
 * DISPLAY TOTALS
 * Demonstrates: getElementById, textContent assignment
 */
const displayTotals = () => {
    document.getElementById('total-income').textContent = '+' + formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = '-' + formatCurrency(totalExpenses);
};

/**
 * UPDATE BUDGET DISPLAY
 * Demonstrates: style manipulation, conditional logic, template literals
 */
const updateBudgetDisplay = () => {
    // .toFixed() on number to format decimal
    document.getElementById('budget-amount').textContent = monthlyBudget.toFixed(2);
    document.getElementById('spent-amount').textContent = totalExpenses.toFixed(2);

    const progressFill = document.getElementById('progress-fill');
    const budgetStatus = document.getElementById('budget-status');

    if (monthlyBudget > 0 && budgetChecker) {
        // Closer method call: budgetChecker.check()
        const result = budgetChecker.check(totalExpenses);
        const pct = Math.min(result.percentage, 100);  // Math.min() restricts to 100%

        // DOM style manipulation
        progressFill.style.width = pct + '%';            // String concatenation
        // Template literal with dynamic class
        progressFill.className = `progress-fill ${result.status}`;
        budgetStatus.className = `budget-status ${result.status}`;
        budgetStatus.textContent = result.message;
    } else {
        progressFill.style.width = '0%';
        progressFill.className = 'progress-fill';
        budgetStatus.className = 'budget-status';
        budgetStatus.textContent = 'Set a budget to track spending';
    }
};

/**
 * DISPLAY TRANSACTIONS
 * Demonstrates: map(), join(), template literals in loops, conditional classes
 */
const displayTransactions = () => {
    let filtered = getFilteredTransactions();
    // Call higher-order function with comparator
    filtered = sortTransactions(filtered, document.getElementById('sort-by').value);

    // .textContent assignment with template literal
    document.getElementById('transaction-count').textContent = filtered.length + ' transactions';

    const clearBtn = document.getElementById('clear-all-btn');
    // Conditional class toggle
    if (transactions.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }

    const listEl = document.getElementById('transaction-list');

    if (filtered.length === 0) {
        listEl.innerHTML = '<p class="empty-message">No transactions found.</p>';
        return;
    }

    // Array.map(): transform each element (higher-order function)
    // Returns new array of HTML strings (template literals)
    listEl.innerHTML = filtered.map(t => {
        const typeClass = t.amount >= 0 ? 'income' : 'expense';  // Ternary
        const prefix = t.amount >= 0 ? '+' : '-';

        // Template literal with multi-line string and expressions
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
    }).join('');  // join() concatenates array elements into single string
};

/**
 * DISPLAY STATISTICS
 * Demonstrates: Object.keys(), Math.max with spread operator, sort with comparator
 */
const displayStatistics = () => {
    document.getElementById('stat-total').textContent = transactions.length;
    document.getElementById('stat-average').textContent = formatCurrency(getAverageTransaction());
    document.getElementById('stat-largest-income').textContent = formatCurrency(getLargestIncome());
    document.getElementById('stat-largest-expense').textContent = formatCurrency(getLargestExpense());

    const categoryData = getExpensesByCategory();  // Returns object (reference)
    const categories = Object.keys(categoryData);  // Returns array of keys (new array)
    const containerEl = document.getElementById('category-stats');

    if (categories.length === 0) {
        containerEl.innerHTML = '<p class="empty-message">No expense data</p>';
        return;
    }

    // Spread operator to convert values to array for Math.max()
    const maxAmount = Math.max(...Object.values(categoryData));
    // Array.sort() with comparator (mutates copy, not original)
    categories.sort((a, b) => categoryData[b] - categoryData[a]);  // Descending sort

    containerEl.innerHTML = categories.map(cat => {
        const amount = categoryData[cat];
        // Division and multiplication for percentage
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

// ==================== UPDATE ALL ====================
/**
 * UPDATE ALL DISPLAYS
 * Demonstrates: function composition (calling multiple functions)
 * Central update function that refreshes all UI components
 */
function updateAll() {
    updateTotals();              // Recalculate sums
    displayBalance();            // Update balance display
    displayTotals();             // Update income/expense totals
    displayTransactions();      // Update transaction list
    displayStatistics();        // Update statistics panel
    updateBudgetDisplay();      // Update budget progress
}

// ==================== EVENT HANDLERS ====================
// Demonstrates: event objects, preventDefault(), DOM form handling

/**
 * HANDLE FORM SUBMIT
 * Demonstrates: event.preventDefault(), form reset, focus management
 * @param {Event} event - DOM submit event object
 */
function handleFormSubmit(event) {
    event.preventDefault();  // Prevent form submission (page reload)

    // DOM value retrieval
    const desc = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;

    if (addTransaction(desc, amount, category)) {
        // Form reset: clear all inputs
        document.getElementById('transaction-form').reset();
        // Set focus to description field for next entry
        document.getElementById('description').focus();
    }
}

/**
 * HANDLE DELETE
 * Demonstrates: confirm() dialog, function call in onclick attribute
 * @param {number} id - Transaction ID to delete
 */
function handleDelete(id) {
    // confirm() returns boolean (primitive)
    if (confirm('Delete this transaction?')) {
        deleteTransaction(id);
    }
}

/**
 * HANDLE SET BUDGET
 * Demonstrates: input value retrieval, clear after submit
 */
function handleSetBudget() {
    const amount = document.getElementById('budget-input').value;
    if (setMonthlyBudget(amount)) {
        document.getElementById('budget-input').value = '';  // Clear input field
    }
}

/**
 * HANDLE FILTER CHANGE
 * Event handler: called when filter dropdowns change
 */
function handleFilterChange() {
    displayTransactions();  // Refresh list with new filters
}

/**
 * HANDLE CLEAR ALL
 * Demonstrates: confirm() with destructive operation
 */
function handleClearAll() {
    if (confirm('Delete ALL transactions?')) {
        clearAllTransactions();
    }
}

// ==================== SAMPLE DATA ====================
/**
 * ADD SAMPLE DATA
 * Demonstrates: array iteration, calling addTransaction in loop
 * Function declaration (hoisted, can be called anywhere)
 */
function addSampleData() {
    console.log("📝 Adding sample data...");

    // Array literal with objects (reference types)
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

    // For...of loop: iterates iterable values (array elements)
    // Modern loop replacing traditional for when index isn't needed
    for (let t of samples) {
        addTransaction(t.desc, t.amount, t.cat);
    }

    setMonthlyBudget(25000);

    console.log("✅ Done! " + transactions.length + " transactions added.");
}

// ==================== INITIALIZATION ====================
/**
 * INITIALIZE APPLICATION
 * Demonstrates: addEventListener(), initialization pattern
 * IIFE-like: runs when script loads via DOMContentLoaded
 */
function init() {
    console.log("═══════════════════════════════════════");
    console.log("  💰 " + APP_NAME + " v" + VERSION);
    console.log("═══════════════════════════════════════");
    console.log("📌 Type: addSampleData()");
    console.log("═══════════════════════════════════════");

    // Event listeners: passing function references (no parentheses)
    // Demonstrates: callback pattern, event-driven programming
    document.getElementById('transaction-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('set-budget-btn').addEventListener('click', handleSetBudget);

    // Keypress event with inline arrow function (anonymous)
    // Demonstrates: closures (handleSetBudget in outer scope)
    document.getElementById('budget-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSetBudget();
        }
    });

    // Change events for filters (trigger on dropdown change)
    document.getElementById('filter-type').addEventListener('change', handleFilterChange);
    document.getElementById('filter-category').addEventListener('change', handleFilterChange);
    document.getElementById('sort-by').addEventListener('change', handleFilterChange);
    document.getElementById('clear-all-btn').addEventListener('click', handleClearAll);

    updateAll();  // Initial render
    console.log("✅ Ready!");
}

// DOMContentLoaded event: waits for HTML to load before executing init()
// This is an event listener passed a function reference
document.addEventListener('DOMContentLoaded', init);

// ==================== GLOBAL EXPORTS ====================
// Expose functions to global window object for inline HTML event handlers
// e.g., onclick="handleDelete(123)" requires window.handleDelete
// Browser global scope: window object
// This is necessary for onclick attributes in HTML to access these functions

window.addTransaction = addTransaction;
window.deleteTransaction = deleteTransaction;
window.clearAllTransactions = clearAllTransactions;
window.setMonthlyBudget = setMonthlyBudget;
window.addSampleData = addSampleData;
window.handleDelete = handleDelete;
window.transactions = transactions;  // Expose data array globally

// ==================== SCROLL-BASED GRADIENT ====================
/**
 * DYNAMIC SCROLL GRADIENT
 * Changes background gradient colors based on scroll position
 * Demonstrates: scroll events, requestAnimationFrame, CSS custom properties
 */
(function initScrollGradient() {
    // Check if body exists (for non-DOM environments)
    if (typeof document === 'undefined') return;

    const colors = [
        'var(--gradient-color-1)',
        'var(--gradient-color-2)',
        'var(--gradient-color-3)',
        'var(--gradient-color-4)',
        'var(--gradient-color-5)'
    ];

    let ticking = false;

    // Update gradient positions based on scroll
    function updateGradient() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

        // Cycle through gradient positions based on scroll
        const pos1 = (scrollPercent * 100 + 20) % 100;
        const pos2 = (scrollPercent * 100 + 40) % 100;
        const pos3 = (scrollPercent * 100 + 60) % 100;
        const pos4 = (scrollPercent * 100 + 80) % 100;
        const pos5 = (scrollPercent * 100) % 100;

        // Apply CSS custom properties
        document.documentElement.style.setProperty('--gradient-pos-1', pos1 + '%');
        document.documentElement.style.setProperty('--gradient-pos-2', pos2 + '%');
        document.documentElement.style.setProperty('--gradient-pos-3', pos3 + '%');
        document.documentElement.style.setProperty('--gradient-pos-4', pos4 + '%');
        document.documentElement.style.setProperty('--gradient-pos-5', pos5 + '%');

        // Cycle gradient colors based on scroll position (8 color stops)
        const colorIndex = Math.floor(scrollPercent * 8) % colors.length;
        const nextColorIndex = (colorIndex + 1) % colors.length;
        const blend = (scrollPercent * 8) % 1;

        // Rotate colors for smooth transition
        const newColors = [...colors.slice(colorIndex), ...colors.slice(0, colorIndex)];
        document.documentElement.style.setProperty('--gradient-color-1', newColors[0]);
        document.documentElement.style.setProperty('--gradient-color-2', newColors[1] || colors[0]);
        document.documentElement.style.setProperty('--gradient-color-3', newColors[2] || colors[0]);
        document.documentElement.style.setProperty('--gradient-color-4', newColors[3] || colors[0]);
        document.documentElement.style.setProperty('--gradient-color-5', newColors[4] || colors[0]);

        ticking = false;
    }

    // Throttled scroll handler using requestAnimationFrame
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateGradient);
            ticking = true;
        }
    }, { passive: true });

    // Initial call
    updateGradient();
})();
