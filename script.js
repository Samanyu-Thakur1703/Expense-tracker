

const APP_NAME = "Smart Expense Tracker"; // const: string never changes
const VERSION  = "1.0.0";                 // const: version string literal

// let: these will be reassigned as transactions are added/removed
let transactions   = [];    // Reference type – Array (mutable contents)
let totalIncome    = 0;     // Primitive type – Number
let totalExpenses  = 0;     // Primitive type – Number
let balance        = 0;     // Primitive type – Number
let monthlyBudget  = 0;     // Primitive type – Number
let budgetChecker  = null;  // Reference type – Object (starts as null primitive)


// const arrays: reference (binding) is fixed, contents are mutable
const incomeCategories  = ["Salary", "Freelance", "Investment"];
const expenseCategories = ["Food", "Transport", "Shopping",
                           "Entertainment", "Bills", "Health", "Other"];

// Spread operator (...): creates a NEW array by expanding both arrays.
// This is an *expression* that produces a new Array reference.
const allCategories = [...incomeCategories, ...expenseCategories];


/**
 *     @returns {number}  Unique-ish numeric ID (primitive Number)
 */
function generateId() {
    // Date.now() → primitive Number (Unix timestamp in ms)
    // Math.random() → float [0, 1)   Math.floor() → integer
    return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * formatCurrency
 *
 * @param {number} amount  Primitive Number (passed by value)
 * @returns {string}       Formatted string, e.g. "₹1,234.56"
 */
function formatCurrency(amount) {
    return '₹' + Math.abs(amount).toFixed(2);

}

/**
 * getCurrentDate
 *
 * Demonstrates:
 *  • new Date() – creates a Date object (reference type)
 *  • String(n)  – explicit type conversion: Number → String
 *  • String.prototype.padStart(length, char) – pads to minimum length
 *  • Template literal `${expression}` – ES6 string interpolation
 *
 * @returns {string}  Date formatted as DD/MM/YYYY
 */
function getCurrentDate() {
    const date  = new Date();                              // Reference type: Date object
    const day   = String(date.getDate()).padStart(2, '0'); // Number → String → padded String
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const year  = date.getFullYear();                     // Number
    return `${day}/${month}/${year}`;                     // Template literal
}


/**
 * validateTransaction

 * @param {string}        description  Primitive String (by value)
 * @param {string|number} amount       May be string from <input>
 * @param {string}        category     Primitive String (by value)
 * @returns {boolean}
 */
function validateTransaction(description, amount, category) {

    // Logical NOT (!), OR (||), strict equality (===), property access (.length)
    if (!description || description.trim() === "" || description.trim().length < 2) {
        console.error("❌ Invalid description");   // console.error() – outputs to stderr
        return false;                              // Boolean primitive
    }

    // isNaN() coerces then tests; parseFloat converts "42" → 42
    if (isNaN(amount) || amount === "" || parseFloat(amount) === 0) {
        console.error("❌ Invalid amount");
        return false;
    }

    // Array.includes() – returns Boolean; short-circuit via !
    if (!category || !allCategories.includes(category)) {
        console.error("❌ Invalid category");
        return false;
    }

    return true;  // All checks passed
}

// ============================================================
//  CRUD OPERATIONS
// ============================================================

/**
 *
 * @param {string}        description
 * @param {string|number} amount
 * @param {string}        category
 * @returns {boolean}
 */
function addTransaction(description, amount, category) {
    if (!validateTransaction(description, amount, category)) {
        return false;   // Early return (guard clause)
    }

    // parseFloat: String → Number (primitive conversion)
    let parsedAmount = parseFloat(amount);

    // if / else if block: enforce sign based on category membership
    if (expenseCategories.includes(category)) {
        parsedAmount = -Math.abs(parsedAmount);  // Expenses are negative
    } else if (incomeCategories.includes(category)) {
        parsedAmount = Math.abs(parsedAmount);   // Income is positive
    }

    // Object literal: groups related primitives into one Reference type
    const newTransaction = {
        id:          generateId(),            // Number
        description: description.trim(),      // String
        amount:      parsedAmount,            // Number
        category:    category,                // String
        // Ternary operator: condition ? trueValue : falseValue
        type:        parsedAmount >= 0 ? "Income" : "Expense",
        date:        getCurrentDate(),        // String
        timestamp:   Date.now()              // Number – used for sorting
    };

    transactions.push(newTransaction);        // Array.push() mutates in-place
    console.log("✅ Transaction added!");
    console.table([newTransaction]);          // console.table() – tabular output
    updateAll();
    return true;
}

// ──────────────────────────────────────────────────────────
//  FUNCTION EXPRESSION
//  Assigned to a variable; NOT hoisted (only the variable
//  declaration is hoisted, with value undefined).
//  Can be anonymous (no name after `function`).
// ──────────────────────────────────────────────────────────

/**
 * deleteTransaction
 *
 * FUNCTION EXPRESSION (anonymous, assigned to const).
 *
 * Demonstrates:
 *  • Traditional for loop  (init ; condition ; update)
 *  • Sentinel value pattern  (index = -1)
 *  • break  – exits loop early once match found
 *  • Strict equality (===) for ID comparison
 *  • Array.prototype.splice(start, deleteCount) – mutates array
 *
 * @param {number} id  ID of transaction to delete
 * @returns {boolean}
 */
const deleteTransaction = function(id) {
    let index = -1;  // Sentinel: -1 means "not found yet"

    // for loop: counter-based iteration; index i is needed here
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].id === id) {  // strict equality (===)
            index = i;
            break;   // break: stop iterating once found
        }
    }

    if (index === -1) {
        console.error("❌ Not found");
        return false;
    }

    // splice(start, deleteCount) mutates the original array
    transactions.splice(index, 1);
    console.log("🗑️ Deleted");
    updateAll();
    return true;
};

/**

 * @returns {boolean}
 */
const clearAllTransactions = () => {
    if (transactions.length === 0) {
        console.warn("⚠️ No transactions");  // console.warn() – yellow warning
        return false;
    }

    transactions = [];  // Reassign (only possible because `transactions` is let)
    console.log("🧹 Cleared");
    updateAll();
    return true;
};


/**

 *
 * @returns {number}  Total income (primitive)
 */
const calculateTotalIncome = () =>
    transactions
        .filter(t => t.amount > 0)               // HOF: filter with arrow callback
        .reduce((sum, t) => sum + t.amount, 0);  // HOF: reduce; 0 is initial accumulator

/**
 * calculateTotalExpenses
 *
 * Chained filter + reduce, wrapped in Math.abs() to return positive value.
 * Arrow function with implicit return.
 *
 * @returns {number}  Total expenses (positive Number)
 */
const calculateTotalExpenses = () => Math.abs(
    transactions
        .filter(t => t.amount < 0)               // filter: only negative (expense) amounts
        .reduce((sum, t) => sum + t.amount, 0)   // reduce: accumulates negative sum
);

/**
 * calculateBalance
 *
 * Arrow function with BLOCK BODY (explicit return required).
 * Accesses outer-scope `let` variables – this is a CLOSURE.
 *
 * CLOSURE: A function that retains access to variables from its
 * enclosing (lexical) scope even after that scope has returned.
 * Here, calculateBalance "closes over" totalIncome & totalExpenses.
 *
 * @returns {number}
 */
const calculateBalance = () => {
    return totalIncome - totalExpenses;  // References outer let variables (closure)
};

/**
 * updateTotals
 *
 * Calls the calculation functions and stores results in global let variables.
 */
const updateTotals = () => {
    totalIncome   = calculateTotalIncome();
    totalExpenses = calculateTotalExpenses();
    balance       = calculateBalance();
};

// ============================================================
//  FILTERING & SORTING  (switch, for...of, HOFs)
// ============================================================

/**
 * filterByType
 *
 * Demonstrates:
 *  • switch statement – compares type using ===
 *  • return inside each case (avoids need for break)
 *  • default case – fallback when no case matches
 *  • filter() HOF – returns NEW array
 *
 * @param {string} type  "income" | "expense" | "all"
 * @returns {Array}      New filtered array
 */
const filterByType = (type) => {
    // switch: cleaner than multiple if/else when testing one variable
    switch (type) {
        case "income":
            return transactions.filter(t => t.amount > 0);  // HOF: filter
        case "expense":
            return transactions.filter(t => t.amount < 0);
        default:                                             // fallback case
            return transactions;
    }
};

/**
 * filterByCategory
 *
 * Arrow function: single parameter (parens optional for one param).
 * Ternary returns either all transactions or a filtered subset.
 *
 * @param {string} category
 * @returns {Array}
 */
const filterByCategory = (category) => {
    // Ternary: concise if/else for simple conditionals
    return category === "all"
        ? transactions
        : transactions.filter(t => t.category === category); // HOF: filter
};

/**
 * getFilteredTransactions
 *
 * Reads DOM values and chains filter operations.
 *
 * Demonstrates:
 *  • DOM API: document.getElementById().value
 *  • if statements with !== operator
 *  • HOF: filter with closure over categoryFilter variable
 *
 * @returns {Array}  Filtered transactions array
 */
const getFilteredTransactions = () => {
    const typeFilter     = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;

    let result = transactions;

    if (typeFilter !== "all") {
        result = filterByType(typeFilter);
    }
    if (categoryFilter !== "all") {
        // Arrow function closes over categoryFilter (closure)
        result = result.filter(t => t.category === categoryFilter);
    }

    return result;
};

/**
 * sortTransactions
 *
 * Demonstrates:
 *  • Spread operator [...arr] – shallow copy to avoid mutating original
 *  • sort() HOF – compare function returns negative / 0 / positive
 *  • Math.abs() inside comparator for absolute-value comparison
 *  • switch with return in each case
 *
 * @param {Array}  arr       Array to sort (not mutated – we spread first)
 * @param {string} sortType  Sorting criterion
 * @returns {Array}          New sorted array
 */
const sortTransactions = (arr, sortType) => {
    const sorted = [...arr];  // Spread: shallow copy (new array, same object refs)

    switch (sortType) {
        case "date-desc":
            // sort() HOF: b - a → descending (largest timestamp first)
            return sorted.sort((a, b) => b.timestamp - a.timestamp);
        case "date-asc":
            return sorted.sort((a, b) => a.timestamp - b.timestamp);
        case "amount-desc":
            return sorted.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        case "amount-asc":
            return sorted.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
        default:
            return sorted;
    }
};

// ============================================================
//  STATISTICS  (reduce patterns, Math methods)
// ============================================================

/**
 * getAverageTransaction
 *
 * Demonstrates:
 *  • Guard clause with ternary for empty-array edge case
 *  • reduce() HOF accumulating sum, then dividing by length
 *
 * @returns {number}  Average absolute transaction amount
 */
const getAverageTransaction = () => {
    if (transactions.length === 0) return 0;  // Guard clause

    // reduce: accumulate sum of absolute amounts, then divide
    return transactions.reduce(
        (sum, t) => sum + Math.abs(t.amount), 0
    ) / transactions.length;
};

/**
 * getLargestIncome
 *
 * Demonstrates:
 *  • filter() then reduce() chained
 *  • reduce() as a max-finder (ternary inside callback)
 *
 * @returns {number}
 */
const getLargestIncome = () => {
    const incomes = transactions.filter(t => t.amount > 0);
    if (incomes.length === 0) return 0;
    // reduce as maximum-finder: keep larger of accumulator vs current
    return incomes.reduce((max, t) => t.amount > max ? t.amount : max, 0);
};

/**
 * getLargestExpense
 *
 * Demonstrates:
 *  • reduce() as minimum-finder (most negative number)
 *  • Math.abs() converts result to positive
 *
 * @returns {number}
 */
const getLargestExpense = () => {
    const expenses = transactions.filter(t => t.amount < 0);
    if (expenses.length === 0) return 0;
    // reduce: track minimum (most negative); Math.abs makes it positive
    return Math.abs(
        expenses.reduce((min, t) => t.amount < min ? t.amount : min, 0)
    );
};

/**
 * getExpensesByCategory
 *
 * Demonstrates:
 *  • reduce() building an OBJECT accumulator (not a number)
 *  • Bracket notation: acc[cat] (dynamic property access)
 *  • Logical OR default: (acc[cat] || 0) initialises missing keys
 *
 * @returns {Object}  { "Food": 4500, "Transport": 1200, ... }
 */
const getExpensesByCategory = () => {
    return transactions
        .filter(t => t.amount < 0)       // HOF: keep expenses only
        .reduce((acc, t) => {            // HOF: build object accumulator
            const cat = t.category;
            // (acc[cat] || 0): if key absent → 0; otherwise existing total
            acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
            return acc;                  // MUST return accumulator each iteration
        }, {});                          // Initial value: empty object {}
};



/**
 * @param {number} limit  Monthly spending limit
 * @returns {Object}      Budget checker with methods
 */
function createBudgetChecker(limit) {
    // budgetLimit is a PRIVATE variable (closed over by returned methods)
    let budgetLimit = limit;

    return {
        // check() – closure: reads & uses budgetLimit from outer scope
        check: function(expenses) {
            const percentage = (expenses / budgetLimit) * 100;  // Arithmetic
            let status, message;

            // if / else if / else chain – sequential condition evaluation
            if (percentage >= 100) {
                status  = "danger";
                message = "🚨 Budget EXCEEDED!";
            } else if (percentage >= 80) {
                status  = "warning";
                message = "⚠️ Approaching limit!";
            } else if (percentage >= 50) {
                status  = "caution";
                message = "📊 Over half used.";
            } else {
                status  = "safe";
                message = "✅ Within budget!";
            }

            // Shorthand property names (ES6): { status } ≡ { status: status }
            return { status, message, percentage, remaining: budgetLimit - expenses };
        },

        // getter – returns private closed-over variable
        getLimit: function() { return budgetLimit; },

        // setter with validation – mutates the closed-over variable
        setLimit: function(newLimit) {
            if (newLimit > 0) {
                budgetLimit = newLimit;  // Modifies closed-over private variable
                return true;
            }
            return false;
        }
    };
}

/**
 * setMonthlyBudget
 *
 * Function Declaration. Validates input, then calls the closure factory.
 *
 * @param {number|string} amount
 * @returns {boolean}
 */
function setMonthlyBudget(amount) {
    if (isNaN(amount) || amount <= 0) {
        console.error("❌ Invalid budget");
        return false;
    }

    monthlyBudget = parseFloat(amount);
    // budgetChecker stores the closure object (reference type)
    budgetChecker = createBudgetChecker(monthlyBudget);
    console.log("💰 Budget: " + formatCurrency(monthlyBudget));
    updateBudgetDisplay();
    return true;
}

// ============================================================
//  DOM DISPLAY FUNCTIONS
// ============================================================
//
//  DOM (Document Object Model) – browser's tree of HTML elements.
//  document.getElementById(id) – returns an HTMLElement or null.
//  element.textContent – sets/gets visible text (safe: no HTML parsing).
//  element.innerHTML   – sets/gets raw HTML string (use carefully).
//  element.classList.add/remove/toggle – CSS class management.
//  element.style.property – inline CSS manipulation.

/**
 * displayBalance
 *
 * Demonstrates:
 *  • DOM query: getElementById
 *  • classList.remove(multiple) – removes several classes at once
 *  • classList.add – applies conditional CSS class
 *  • if / else if for conditional class application
 */
const displayBalance = () => {
    const el = document.getElementById('balance');
    el.textContent = formatCurrency(balance);      // textContent assignment

    el.classList.remove('positive', 'negative');   // Remove both, then add correct one

    if (balance > 0) {
        el.classList.add('positive');
    } else if (balance < 0) {
        el.classList.add('negative');
    }
    // if balance === 0, neither class is added
};

/** displayTotals – updates income & expense DOM elements */
const displayTotals = () => {
    document.getElementById('total-income').textContent   = '+' + formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = '-' + formatCurrency(totalExpenses);
};

/**
 * updateBudgetDisplay
 *
 * Demonstrates:
 *  • Number.prototype.toFixed(2) – formats number to 2 decimal places
 *  • Calling closure method: budgetChecker.check()
 *  • Math.min() – clamps value to maximum of 100
 *  • style.width – inline CSS via JavaScript
 *  • Template literals for dynamic className
 */
const updateBudgetDisplay = () => {
    document.getElementById('budget-amount').textContent = monthlyBudget.toFixed(2);
    document.getElementById('spent-amount').textContent  = totalExpenses.toFixed(2);

    const progressFill = document.getElementById('progress-fill');
    const budgetStatus = document.getElementById('budget-status');

    if (monthlyBudget > 0 && budgetChecker) {        // Logical AND (&&)
        const result = budgetChecker.check(totalExpenses);  // Closure method call
        const pct    = Math.min(result.percentage, 100);    // Clamp to 100

        progressFill.style.width = pct + '%';
        // Template literal produces dynamic class string
        progressFill.className = `progress-fill ${result.status}`;
        budgetStatus.className  = `budget-status ${result.status}`;
        budgetStatus.textContent = result.message;
    } else {
        progressFill.style.width     = '0%';
        progressFill.className       = 'progress-fill';
        budgetStatus.className       = 'budget-status';
        budgetStatus.textContent     = 'Set a budget to track spending';
    }
};

/**
 * displayTransactions
 *
 * Demonstrates:
 *  • map() HOF – transforms each transaction into an HTML string
 *  • Array.prototype.join('') – concatenates array of strings
 *  • Template literals with embedded expressions
 *  • Ternary inside template literal for conditional class/prefix
 *  • innerHTML – injects HTML string into DOM
 *  • classList.add / remove  for show/hide
 */
const displayTransactions = () => {
    let filtered = getFilteredTransactions();
    filtered = sortTransactions(filtered, document.getElementById('sort-by').value);

    document.getElementById('transaction-count').textContent =
        filtered.length + ' transactions';  // String concatenation

    const clearBtn = document.getElementById('clear-all-btn');
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

    // map() HOF: transform each transaction object into an HTML string
    // join('') merges the resulting array into one large HTML string
    listEl.innerHTML = filtered.map(t => {
        // Ternary operators inside template literals
        const typeClass = t.amount >= 0 ? 'income' : 'expense';
        const prefix    = t.amount >= 0 ? '+' : '-';

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
    }).join('');  // join: Array → String
};

/**
 * displayStatistics
 *
 * Demonstrates:
 *  • Object.keys(obj)   – returns array of own property keys
 *  • Object.values(obj) – returns array of own property values
 *  • Spread into Math.max(...values) – passes array elements as args
 *  • sort() with comparator for descending order
 *  • map() + join() pattern for HTML generation
 */
const displayStatistics = () => {
    document.getElementById('stat-total').textContent          = transactions.length;
    document.getElementById('stat-average').textContent        = formatCurrency(getAverageTransaction());
    document.getElementById('stat-largest-income').textContent = formatCurrency(getLargestIncome());
    document.getElementById('stat-largest-expense').textContent = formatCurrency(getLargestExpense());

    const categoryData = getExpensesByCategory();       // Object reference
    const categories   = Object.keys(categoryData);    // Array of key strings
    const containerEl  = document.getElementById('category-stats');

    if (categories.length === 0) {
        containerEl.innerHTML = '<p class="empty-message">No expense data</p>';
        return;
    }

    // Spread Object.values() into Math.max() — spread turns array into arg list
    const maxAmount = Math.max(...Object.values(categoryData));

    // sort() HOF with comparator – descending by amount (mutates categories copy)
    categories.sort((a, b) => categoryData[b] - categoryData[a]);

    containerEl.innerHTML = categories.map(cat => {
        const amount = categoryData[cat];
        const pct    = (amount / maxAmount) * 100;  // Arithmetic: percentage

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

// ============================================================
//  FUNCTION COMPOSITION  –  updateAll
// ============================================================

/**
 * updateAll
 *
 * Central orchestrator: calls each display function in sequence.
 * Demonstrates FUNCTION COMPOSITION – calling multiple functions
 * to produce a combined effect (refresh entire UI).
 *
 * Function Declaration – hoisted, can be called above its definition.
 */
function updateAll() {
    updateTotals();          // 1. Recalculate income / expenses / balance
    displayBalance();        // 2. Update balance element
    displayTotals();         // 3. Update income & expense totals
    displayTransactions();   // 4. Rebuild transaction list
    displayStatistics();     // 5. Rebuild statistics panel
    updateBudgetDisplay();   // 6. Update budget progress bar
}

// ============================================================
//  EVENT HANDLERS
// ============================================================
//
//  Events are asynchronous signals (user interactions, timers, etc.)
//  An event handler (listener) is a function called when an event fires.
//  addEventListener(type, callback) – preferred (can attach multiple).
//  Inline onclick="fn()" – attaches single handler via HTML attribute.

/**
 * handleFormSubmit
 *
 * Demonstrates:
 *  • event.preventDefault() – stops the default browser action (page reload)
 *  • DOM value retrieval from form inputs
 *  • element.reset() – clears all form fields
 *  • element.focus() – moves cursor to element
 *
 * @param {Event} event  DOM Event object (reference type, passed by reference)
 */
function handleFormSubmit(event) {
    event.preventDefault();  // Stop form from submitting (and reloading page)

    const desc     = document.getElementById('description').value;
    const amount   = document.getElementById('amount').value;
    const category = document.getElementById('category').value;

    if (addTransaction(desc, amount, category)) {
        document.getElementById('transaction-form').reset();  // Clear all fields
        document.getElementById('description').focus();       // Move cursor to first field
    }
}

/**
 * handleDelete
 *
 * Demonstrates:
 *  • window.confirm() – shows browser dialog; returns Boolean
 *  • Conditional function call
 *
 * @param {number} id  Transaction ID (primitive Number, passed by value)
 */
function handleDelete(id) {
    if (confirm('Delete this transaction?')) {  // confirm() returns true/false
        deleteTransaction(id);
    }
}

/** handleSetBudget – reads budget input and calls setMonthlyBudget */
function handleSetBudget() {
    const amount = document.getElementById('budget-input').value;
    if (setMonthlyBudget(amount)) {
        document.getElementById('budget-input').value = '';  // Clear field
    }
}

/** handleFilterChange – re-renders list when filter dropdowns change */
function handleFilterChange() {
    displayTransactions();
}

/** handleClearAll – confirms then clears all data */
function handleClearAll() {
    if (confirm('Delete ALL transactions?')) {
        clearAllTransactions();
    }
}

// ============================================================
//  SAMPLE DATA  (for...of loop, array of objects)
// ============================================================

/**
 * addSampleData
 *
 * Function Declaration – hoisted.
 *
 * Demonstrates:
 *  • Array of object literals  [{ }, { }, ...]
 *  • for...of loop – iterates over iterable VALUES (no index needed)
 *    Contrast with for...in (iterates over keys/indices)
 *  • console.log() with string concatenation
 *
 * Usage: type addSampleData() in browser console to load demo data.
 */
function addSampleData() {
    console.log("📝 Adding sample data...");

    // Array of plain objects (reference types inside reference type)
    const samples = [
        { desc: "Salary",       amount:  75000, cat: "Salary"        },
        { desc: "Freelance",    amount:  15000, cat: "Freelance"      },
        { desc: "Dividends",    amount:   3000, cat: "Investment"     },
        { desc: "Groceries",    amount:  -4500, cat: "Food"           },
        { desc: "Restaurant",   amount:  -1800, cat: "Food"           },
        { desc: "Uber",         amount:  -1200, cat: "Transport"      },
        { desc: "Petrol",       amount:  -3000, cat: "Transport"      },
        { desc: "Amazon",       amount:  -5500, cat: "Shopping"       },
        { desc: "Movie",        amount:   -800, cat: "Entertainment"  },
        { desc: "Netflix",      amount:   -499, cat: "Entertainment"  },
        { desc: "Electricity",  amount:  -2500, cat: "Bills"          },
        { desc: "Internet",     amount:   -999, cat: "Bills"          },
        { desc: "Medicine",     amount:   -650, cat: "Health"         }
    ];

    // for...of: iterates each element value; t is a copy of the object reference
    for (let t of samples) {
        addTransaction(t.desc, t.amount, t.cat);
    }

    setMonthlyBudget(25000);
    console.log("✅ Done! " + transactions.length + " transactions added.");
}

/**
 * init
 *
 * Function Declaration – hoisted.
 * Called when DOM is fully parsed (DOMContentLoaded).
 *
 * Demonstrates:
 *  • addEventListener(type, callback) – event-driven programming
 *  • Passing FUNCTION REFERENCES (no parentheses) as callbacks
 *  • Anonymous arrow function as inline callback
 *  • Keyboard event: e.key property
 *  • IIFE-adjacent pattern: runs once at page load
 */
function init() {
    console.log("═══════════════════════════════════════");
    console.log("  💰 " + APP_NAME + " v" + VERSION);
    console.log("═══════════════════════════════════════");
    console.log("📌 Type: addSampleData()");
    console.log("═══════════════════════════════════════");

    // addEventListener(eventType, callbackReference)
    // Note: handleFormSubmit (no parentheses) – we pass the function, not its result
    document.getElementById('transaction-form')
        .addEventListener('submit', handleFormSubmit);   // Callback reference

    document.getElementById('set-budget-btn')
        .addEventListener('click', handleSetBudget);

    // Inline anonymous arrow function as callback (closure over handleSetBudget)
    document.getElementById('budget-input')
        .addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {   // e.key – String property of KeyboardEvent
                handleSetBudget();
            }
        });

    // Change events: fired when <select> value changes
    document.getElementById('filter-type').addEventListener('change', handleFilterChange);
    document.getElementById('filter-category').addEventListener('change', handleFilterChange);
    document.getElementById('sort-by').addEventListener('change', handleFilterChange);
    document.getElementById('clear-all-btn').addEventListener('click', handleClearAll);

    updateAll();  // Initial render (function composition)
    console.log("✅ Ready!");
}

// DOMContentLoaded fires when HTML is parsed (before images/stylesheets load).
// We pass init as a callback (function reference, not called immediately).
document.addEventListener('DOMContentLoaded', init);

// ============================================================
//  GLOBAL SCOPE EXPORTS  (window object)
// ============================================================
//
//  Inline HTML handlers (onclick="handleDelete(123)") look up
//  functions on the global `window` object.  Explicitly assigning
//  functions to window properties makes them globally accessible
//  regardless of module scope.

window.addTransaction      = addTransaction;
window.deleteTransaction   = deleteTransaction;
window.clearAllTransactions = clearAllTransactions;
window.setMonthlyBudget    = setMonthlyBudget;
window.addSampleData       = addSampleData;
window.handleDelete        = handleDelete;
window.transactions        = transactions;  // Expose data array for console inspection

(function initScrollGradient() {
    if (typeof document === 'undefined') return;  // Guard for non-browser environments

    const colors = [
        'var(--gradient-color-1)',
        'var(--gradient-color-2)',
        'var(--gradient-color-3)',
        'var(--gradient-color-4)',
        'var(--gradient-color-5)'
    ];

    let ticking = false;  // Throttle flag

    // Arrow function – no `this` needed; lexical scope is sufficient
    function updateGradient() {
        const scrollTop     = window.scrollY;
        const docHeight     = document.documentElement.scrollHeight - window.innerHeight;
        // Ternary guard: avoid division by zero if page has no scroll
        const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

        // Arithmetic with modulo (%) for cyclic position values 0–100
        const pos1 = (scrollPercent * 100 + 20) % 100;
        const pos2 = (scrollPercent * 100 + 40) % 100;
        const pos3 = (scrollPercent * 100 + 60) % 100;
        const pos4 = (scrollPercent * 100 + 80) % 100;
        const pos5 = (scrollPercent * 100)       % 100;

        // setProperty: update CSS custom variables on :root
        document.documentElement.style.setProperty('--gradient-pos-1', pos1 + '%');
        document.documentElement.style.setProperty('--gradient-pos-2', pos2 + '%');
        document.documentElement.style.setProperty('--gradient-pos-3', pos3 + '%');
        document.documentElement.style.setProperty('--gradient-pos-4', pos4 + '%');
        document.documentElement.style.setProperty('--gradient-pos-5', pos5 + '%');

        // Rotate color array based on scroll position
        const colorIndex = Math.floor(scrollPercent * 8) % colors.length;
        // slice() + spread to build rotated array (no mutation)
        const newColors   = [...colors.slice(colorIndex), ...colors.slice(0, colorIndex)];

        document.documentElement.style.setProperty('--gradient-color-1', newColors[0]);
        document.documentElement.style.setProperty('--gradient-color-2', newColors[1] || colors[0]);
        document.documentElement.style.setProperty('--gradient-color-3', newColors[2] || colors[0]);
        document.documentElement.style.setProperty('--gradient-color-4', newColors[3] || colors[0]);
        document.documentElement.style.setProperty('--gradient-color-5', newColors[4] || colors[0]);

        ticking = false;  // Reset throttle flag
    }

    // Throttled scroll handler: requestAnimationFrame batches updates
    window.addEventListener('scroll', function() {
        if (!ticking) {
            // requestAnimationFrame: runs callback before next repaint (~60fps)
            window.requestAnimationFrame(updateGradient);
            ticking = true;  // Block further queueing until frame fires
        }
    }, { passive: true });  // passive: true → browser knows we won't call preventDefault

    updateGradient();  // Run once immediately on load
})();  // IIFE: ( function )( ) – define and immediately invoke