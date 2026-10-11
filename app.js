// ==========================================
// PENGELOLAAN DOM & INTERAKSI WEB
// ==========================================

// helper local storage
const STORAGE_KEY = 'money_tracker_data';

const loadData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// elemen DOM
const form = document.getElementById('transaction-form');
const typeInput = document.getElementById('type');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const balanceEl = document.getElementById('balance');
const listEl = document.getElementById('transaction-list');

// state data transaksi
let transactions = loadData();

// update tampilan dashboard web
const updateUI = () => {
    // kalkulasi memanggil fungsi dari functional.js
    incomeEl.textContent = formatRupiah(getIncome(transactions));
    expenseEl.textContent = formatRupiah(getExpense(transactions));

    const balance = getBalance(transactions);
    balanceEl.textContent = formatRupiah(balance);
    balanceEl.style.color = balance < 0 ? '#ef4444' : '#10b981';

    // render daftar memanggil fungsi dari functional.js
    listEl.innerHTML = renderList(transactions);
};

// handler submit form transaksi baru
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const desc = descInput.value;
    const amount = amountInput.value;
    const type = typeInput.value;

    if (!desc.trim() || !amount || Number(amount) <= 0) return;

    // buat transaksi & update secara immutable
    const newTx = createTransaction(desc, amount, type);
    transactions = addTransaction(transactions, newTx);

    saveData(transactions);
    updateUI();

    form.reset();
    descInput.focus();
});

// handler klik tombol hapus transaksi
listEl.addEventListener('click', (e) => {
    if (e.target.dataset.action === 'delete') {
        const id = e.target.dataset.id;

        // hapus secara immutable
        transactions = removeTransaction(transactions, id);

        saveData(transactions);
        updateUI();
    }
});

// render tampilan awal
updateUI();
