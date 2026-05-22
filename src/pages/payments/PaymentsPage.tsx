import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users } from '../../data/users';

type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'funding';
type TransactionStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    sender: string;
    receiver: string;
    status: TransactionStatus;
    date: string;
    note: string;
}

const initialTransactions: Transaction[] = [
    {
        id: 't1',
        type: 'deposit',
        amount: 5000,
        sender: 'Bank Account',
        receiver: 'My Wallet',
        status: 'completed',
        date: '2024-02-15',
        note: 'Initial deposit',
    },
    {
        id: 't2',
        type: 'funding',
        amount: 25000,
        sender: 'Michael Rodriguez',
        receiver: 'Sarah Johnson',
        status: 'completed',
        date: '2024-02-14',
        note: 'Seed funding — TechWave AI',
    },
    {
        id: 't3',
        type: 'transfer',
        amount: 1500,
        sender: 'My Wallet',
        receiver: 'Jennifer Lee',
        status: 'pending',
        date: '2024-02-13',
        note: 'Consulting fee',
    },
    {
        id: 't4',
        type: 'withdraw',
        amount: 2000,
        sender: 'My Wallet',
        receiver: 'Bank Account',
        status: 'completed',
        date: '2024-02-12',
        note: 'Withdrawal',
    },
    {
        id: 't5',
        type: 'funding',
        amount: 50000,
        sender: 'Jennifer Lee',
        receiver: 'David Chen',
        status: 'pending',
        date: '2024-02-11',
        note: 'Series A — GreenLife Solutions',
    },
];

const typeColors: Record<TransactionType, string> = {
    deposit: 'bg-green-50 text-green-600',
    withdraw: 'bg-red-50 text-red-500',
    transfer: 'bg-blue-50 text-blue-600',
    funding: 'bg-purple-50 text-purple-600',
};

const statusColors: Record<TransactionStatus, string> = {
    completed: 'bg-green-50 text-green-600',
    pending: 'bg-amber-50 text-amber-600',
    failed: 'bg-red-50 text-red-500',
};

const typeIcons: Record<TransactionType, string> = {
    deposit: '⬇️',
    withdraw: '⬆️',
    transfer: '↔️',
    funding: '🤝',
};

const PaymentsPage = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(28500);
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'funding'>('overview');
    const [showModal, setShowModal] = useState<'deposit' | 'withdraw' | 'transfer' | 'funding' | null>(null);
    const [form, setForm] = useState({ amount: '', receiver: '', note: '' });
    const [successMsg, setSuccessMsg] = useState('');

    const otherUsers = users.filter(u => u.id !== user?.id);

    const handleTransaction = () => {
        const amount = parseFloat(form.amount);
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        if ((showModal === 'withdraw' || showModal === 'transfer' || showModal === 'funding') && amount > balance) {
            alert('Insufficient balance');
            return;
        }
        if ((showModal === 'transfer' || showModal === 'funding') && !form.receiver) {
            alert('Please select a receiver');
            return;
        }

        const receiverName = showModal === 'transfer' || showModal === 'funding'
            ? users.find(u => u.id === form.receiver)?.name || 'Unknown'
            : showModal === 'deposit' ? 'My Wallet' : 'Bank Account';

        const newTransaction: Transaction = {
            id: 't' + Date.now(),
            type: showModal!,
            amount,
            sender: showModal === 'deposit' ? 'Bank Account' : user?.name || 'Me',
            receiver: receiverName,
            status: 'completed',
            date: new Date().toISOString().split('T')[0],
            note: form.note || showModal!,
        };

        // Update balance correctly
        if (showModal === 'deposit') {
            setBalance(prev => prev + amount);
        } else {
            setBalance(prev => prev - amount);
        }

        setTransactions(prev => [newTransaction, ...prev]);
        setSuccessMsg(`${showModal} of $${amount.toLocaleString()} was successful!`);
        setTimeout(() => setSuccessMsg(''), 4000);
        setShowModal(null);
        setForm({ amount: '', receiver: '', note: '' });
    };
    const totalIn = transactions
        .filter(t => t.status === 'completed' && t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalOut = transactions
        .filter(t => t.status === 'completed' && (t.type === 'withdraw' || t.type === 'transfer' || t.type === 'funding'))
        .reduce((sum, t) => sum + t.amount, 0);

    const pendingCount = transactions.filter(t => t.status === 'pending').length;

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Payments</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your wallet and transactions</p>
            </div>

            {/* Success Message */}
            {successMsg && (
                <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-medium">
                    ✅ {successMsg}
                </div>
            )}

            {/* Wallet Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 mb-6 text-white shadow-lg">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-indigo-200 text-sm mb-1">Total Balance</p>
                        <p className="text-4xl font-bold">${balance.toLocaleString()}</p>
                        <p className="text-indigo-200 text-xs mt-1">{user?.name} · Nexus Wallet</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                        <p className="text-2xl">💳</p>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: 'Deposit', icon: '⬇️', action: 'deposit' },
                        { label: 'Withdraw', icon: '⬆️', action: 'withdraw' },
                        { label: 'Transfer', icon: '↔️', action: 'transfer' },
                        { label: 'Fund Deal', icon: '🤝', action: 'funding' },
                    ].map(btn => (
                        <button
                            key={btn.action}
                            onClick={() => setShowModal(btn.action as any)}
                            className="flex flex-col items-center gap-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 transition rounded-xl py-3 px-2"
                        >
                            <span className="text-xl">{btn.icon}</span>
                            <span className="text-xs font-medium text-white">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Money In</p>
                    <p className="text-xl font-bold text-green-600">
                        +${totalIn.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Money Out</p>
                    <p className="text-xl font-bold text-red-500">
                        -${totalOut.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Pending</p>
                    <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {[
                    { key: 'overview', label: 'Overview' },
                    { key: 'history', label: 'Transaction History' },
                    { key: 'funding', label: 'Funding Deals' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${activeTab === tab.key
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">
                            Recent Transactions
                        </h2>
                        <div className="space-y-3">
                            {transactions.slice(0, 5).map(t => (
                                <div key={t.id} className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${typeColors[t.type]}`}>
                                        {typeIcons[t.type]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{t.note}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{t.date} · {t.sender} → {t.receiver}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className={`text-sm font-bold ${t.type === 'deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                                            {t.type === 'deposit' ? '+' : '-'}${t.amount.toLocaleString()}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>
                                            {t.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction History Tab */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50">
                        <h2 className="text-base font-semibold text-gray-900">All Transactions</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sender</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Receiver</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[t.type]}`}>
                                                {typeIcons[t.type]} {t.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-32 truncate">{t.note}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{t.sender}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{t.receiver}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            ${t.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[t.status]}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">{t.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Funding Deals Tab */}
            {activeTab === 'funding' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">
                            Funding Deals
                        </h2>
                        {transactions
                            .filter(t => t.type === 'funding')
                            .map(t => (
                                <div key={t.id} className="border border-gray-100 rounded-xl p-4 mb-3 last:mb-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{t.note}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{t.date}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[t.status]}`}>
                                            {t.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full">
                                            {t.sender}
                                        </span>
                                        <span className="text-gray-400 text-xs">→</span>
                                        <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
                                            {t.receiver}
                                        </span>
                                        <span className="ml-auto text-sm font-bold text-gray-900">
                                            ${t.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Transaction Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-lg font-bold text-gray-900 mb-5 capitalize">
                            {showModal === 'funding' ? '🤝 Fund a Deal' :
                                showModal === 'deposit' ? '⬇️ Deposit' :
                                    showModal === 'withdraw' ? '⬆️ Withdraw' : '↔️ Transfer'}
                        </h2>

                        {/* Current Balance */}
                        <div className="bg-indigo-50 rounded-xl p-3 mb-4">
                            <p className="text-xs text-indigo-400">Current Balance</p>
                            <p className="text-lg font-bold text-indigo-600">${balance.toLocaleString()}</p>
                        </div>

                        {/* Amount */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Amount (USD)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={form.amount}
                                    onChange={e => setForm({ ...form, amount: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                                />
                            </div>
                        </div>

                        {/* Receiver (for transfer and funding) */}
                        {(showModal === 'transfer' || showModal === 'funding') && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {showModal === 'funding' ? 'Fund Entrepreneur' : 'Send To'}
                                </label>
                                <select
                                    value={form.receiver}
                                    onChange={e => setForm({ ...form, receiver: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                                >
                                    <option value="">Select a person</option>
                                    {otherUsers
                                        .filter(u => showModal === 'funding' ? u.role === 'entrepreneur' : true)
                                        .map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} ({u.role})
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}

                        {/* Note */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Note (optional)
                            </label>
                            <input
                                type="text"
                                placeholder="Add a note..."
                                value={form.note}
                                onChange={e => setForm({ ...form, note: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleTransaction}
                                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(null);
                                    setForm({ amount: '', receiver: '', note: '' });
                                }}
                                className="flex-1 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm font-medium text-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;