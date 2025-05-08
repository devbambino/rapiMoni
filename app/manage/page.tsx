'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBalances, fetchTransactions } from '@/lib/api'; // your API utils
import { Line } from 'react-chartjs-2';                        // for chart rendering
import { Wallet } from '@coinbase/onchainkit/wallet';

export default function ManagePage() {
    /*const walletAddress = '0xYourWalletAddress' as `0x${string}`;

    // 1. Fetch on-chain balances & transaction history supplying the address
    const { data: balances } = useQuery(['balances', walletAddress], () =>
        fetchBalances(walletAddress)
    );
    const { data: txns } = useQuery(['transactions', walletAddress], () =>
        fetchTransactions(walletAddress)
    );

    // 2. Prepare chart data
    const chartData = {
        labels: balances?.history.map((h) => h.date) ?? [],
        datasets: [
            {
                label: 'Net Flow',
                data: balances?.history.map((h) => h.net) ?? [],
                fill: false,
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-primary text-white p-4 pt-24 md:pt-32">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Your Funds</h1>
                <Wallet          // we display custom balances
                />
            </div>

            <section className="bg-primary/90 p-4 rounded-lg mb-8">
                <h2 className="text-xl mb-2">Settlements Over Time</h2>
                <Line data={chartData} />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'USDC', balance: balances?.usdc },
                    { label: 'MXNe', balance: balances?.mxne },
                    { label: 'BRZ', balance: balances?.brz },
                ].map((cur) => (
                    <div key={cur.label} className="bg-primary/90 p-4 rounded-lg">
                        <h3 className="font-semibold">{cur.label}</h3>
                        <p className="text-2xl">{cur.balance ?? '—'}</p>
                        <div className="mt-2 space-x-2">
                            {cur.label === 'USDC' && (
                                <button className="px-3 py-1 bg-secondary rounded">Withdraw to Fiat</button>
                            )}
                            {cur.label !== 'USDC' && (
                                <button className="px-3 py-1 bg-secondary rounded">Swap to USDC</button>
                            )}
                        </div>
                    </div>
                ))}
            </section>

            <section className="bg-primary/90 p-4 rounded-lg">
                <h2 className="text-xl mb-4">Transaction History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr>
                                <th>Date</th><th>Type</th><th>Amount</th><th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {txns?.map((tx) => (
                                <tr key={tx.id} className="border-t border-primary/70">
                                    <td>{tx.date}</td>
                                    <td>{tx.type}</td>
                                    <td>{tx.amount}</td>
                                    <td>{tx.status}</td>
                                </tr>
                            )) ?? (
                                    <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
    */
}
