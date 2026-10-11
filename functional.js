// ==========================================
// LOGIKA PEMROGRAMAN FUNGSIONAL
// ==========================================

// format angka ke rupiah (pure function)
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

// kalkulasi total nominal menggunakan reduce
const sumAmount = (list) => list.reduce((total, item) => total + item.amount, 0);

// fungsi kalkulasi fungsional: pemasukan, pengeluaran, saldo
const getIncome = (list) => sumAmount(list.filter(isType('income')));
const getExpense = (list) => sumAmount(list.filter(isType('expense')));
const getBalance = (list) => getIncome(list) - getExpense(list);

// penambahan & penghapusan secara immutable (tanpa mengubah array asli)
const addTransaction = (list, newItem) => [newItem, ...list];
const removeTransaction = (list, id) => list.filter(item => item.id !== id);

// pure template: membuat html tiap item transaksi
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

// transformasi seluruh list menjadi kumpulan html menggunakan map
const renderList = (list) => {
    if (list.length === 0) {
        return `<li class="empty-state">Belum ada transaksi.</li>`;
    }
    return list.map(renderItem).join('');
};
