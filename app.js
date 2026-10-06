// format angka ke rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(angka);
};

// fungsi murni membuat data transaksi baru
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

// penambahan & penghapusan secara immutable
const addTransaction = (list, newItem) => [newItem, ...list];
const removeTransaction = (list, id) => list.filter(item => item.id !== id);

// elemen dom
const form = document.getElementById('transaction-form');
const typeInput = document.getElementById('type');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const balanceEl = document.getElementById('balance');
const listEl = document.getElementById('transaction-list');

// state data
let transactions = [];

// update ringkasan pemasukan, pengeluaran, saldo
const updateSummary = (list) => {
    incomeEl.textContent = formatRupiah(getIncome(list));
    expenseEl.textContent = formatRupiah(getExpense(list));
    balanceEl.textContent = formatRupiah(getBalance(list));
};

// render tiap baris transaksi
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

// render daftar transaksi
const renderList = (list) => {
    listEl.innerHTML = list.map(renderItem).join('');
};

// handler submit form
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = descInput.value;
    const amount = amountInput.value;
    const type = typeInput.value;

    if (!desc.trim() || !amount) return;

    const newTx = createTransaction(desc, amount, type);
    transactions = addTransaction(transactions, newTx);

    renderList(transactions);
    updateSummary(transactions);

    form.reset();
    descInput.focus();
});

// handler hapus transaksi
listEl.addEventListener('click', (e) => {
    if (e.target.dataset.action === 'delete') {
        const id = e.target.dataset.id;
        transactions = removeTransaction(transactions, id);
        renderList(transactions);
        updateSummary(transactions);
    }
});
