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

// render daftar transaksi
const renderList = (list) => {
    listEl.innerHTML = list.map(item => `
        <li class="transaction">
            <span>${item.desc}</span>
            <span class="${item.type}">
                ${item.type === 'income' ? '+' : '-'} ${formatRupiah(item.amount)}
            </span>
        </li>
    `).join('');
};

// handler submit form
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = descInput.value;
    const amount = amountInput.value;
    const type = typeInput.value;

    if (!desc.trim() || !amount) return;

    const newTx = createTransaction(desc, amount, type);
    transactions = [newTx, ...transactions];

    renderList(transactions);
    updateSummary(transactions);

    form.reset();
    descInput.focus();
});
