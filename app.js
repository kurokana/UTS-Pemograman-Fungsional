// format angka ke rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(angka);
};

// fungsi murni buat object transaksi
const createTransaction = (desc, amount, type) => ({
    id: Date.now().toString(),
    desc: desc.trim(),
    amount: Math.abs(Number(amount)),
    type,
    date: new Date().toLocaleDateString('id-ID')
});

// filter berdasarkan tipe transaksi (HOF currying)
const isType = (type) => (item) => item.type === type;

// kalkulasi total nominal pakai reduce
const sumAmount = (list) => list.reduce((total, item) => total + item.amount, 0);

// fungsi kalkulasi pemasukan, pengeluaran, dan saldo
const getIncome = (list) => sumAmount(list.filter(isType('income')));
const getExpense = (list) => sumAmount(list.filter(isType('expense')));
const getBalance = (list) => getIncome(list) - getExpense(list);

// penambahan & penghapusan data secara immutable
const addTransaction = (list, newItem) => [newItem, ...list];
const removeTransaction = (list, id) => list.filter(item => item.id !== id);

// render html tiap item transaksi
const renderItem = (item) => {
    const isIncome = item.type === 'income';
    const tanda = isIncome ? '+' : '-';
    const tipeClass = isIncome ? 'income' : 'expense';

    return `
        <li class="transaction" data-id="${item.id}">
            <div class="transaction-info">
                <span class="transaction-desc">${item.desc}</span>
                <span class="transaction-date">${item.date}</span>
            </div>
            <div class="transaction-meta">
                <span class="transaction-amount ${tipeClass}">
                    ${tanda} ${formatRupiah(item.amount)}
                </span>
                <button type="button" class="btn-delete" data-action="delete" data-id="${item.id}">
                    Hapus
                </button>
            </div>
        </li>
    `;
};

// render seluruh daftar transaksi
const renderList = (list) => {
    if (list.length === 0) {
        return `<li class="empty-state">Belum ada transaksi.</li>`;
    }
    return list.map(renderItem).join('');
};

// local storage helper
const STORAGE_KEY = 'money_tracker_data';
const loadData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};
const saveData = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

// elemen DOM
const form = document.getElementById('transaction-form');
const typeInput = document.getElementById('type');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const balanceEl = document.getElementById('balance');
const listEl = document.getElementById('transaction-list');

// state transaksi
let transactions = loadData();

// update tampilan aplikasi
const updateUI = () => {
    incomeEl.textContent = formatRupiah(getIncome(transactions));
    expenseEl.textContent = formatRupiah(getExpense(transactions));

    const balance = getBalance(transactions);
    balanceEl.textContent = formatRupiah(balance);
    balanceEl.style.color = balance < 0 ? '#ef4444' : '#10b981';

    listEl.innerHTML = renderList(transactions);
};

// event tambah transaksi
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const desc = descInput.value;
    const amount = amountInput.value;
    const type = typeInput.value;

    if (!desc.trim() || !amount || Number(amount) <= 0) return;

    const newTx = createTransaction(desc, amount, type);
    transactions = addTransaction(transactions, newTx);
    saveData(transactions);
    updateUI();

    form.reset();
    descInput.focus();
});

// event hapus transaksi
listEl.addEventListener('click', (e) => {
    if (e.target.dataset.action === 'delete') {
        const id = e.target.dataset.id;
        transactions = removeTransaction(transactions, id);
        saveData(transactions);
        updateUI();
    }
});

// render awal
updateUI();
