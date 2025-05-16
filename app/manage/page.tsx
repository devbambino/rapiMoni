"use client"
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useBalance, useWatchContractEvent, useReadContracts, usePublicClient } from "wagmi";
import { liquidityPoolAbi } from "@/lib/liquiditypool-abi";
import { microloanAbi } from "@/lib/microloan-abi";
import { feePoolAbi } from "@/lib/feepool-abi";
import { usdcAbi } from "@/lib/usdc-abi";
import { parseUnits, formatUnits, decodeEventLog } from 'viem';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toastprovider";

const MXN_ADDR = process.env.NEXT_PUBLIC_MXN_ADDRESS!;
const USD_ADDR = process.env.NEXT_PUBLIC_USD_ADDRESS!;
const LIQUIDITY_POOL_ADDR = process.env.NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS!;
const MICROLOAN_ADDR = process.env.NEXT_PUBLIC_MANAGER_ADDRESS!;
const FEE_POOL_ADDR = process.env.NEXT_PUBLIC_FEE_POOL_ADDRESS!;


// Transaction type definition
type Transaction = {
    type: string;
    token: string;
    amount: string;
    timestamp: number;
    txHash?: string;
    direction?: 'IN' | 'OUT';
};

export default function ManagePage() {
    const { showToast } = useToast();
    const { address } = useAccount();
    const [lastUsdTransaction, setLastUsdTransaction] = useState<Transaction | null>(null);
    const [lastMxnTransaction, setLastMxnTransaction] = useState<Transaction | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const publicClient = usePublicClient();

    const { data: userBalanceInMXNData, refetch: getUserBalanceMXN, isLoading: isUserBalanceInMXNLoading } = useBalance({
        address,
        token: MXN_ADDR as `0x${string}` | undefined,
    });
    const { data: userBalanceInUSDData, refetch: getUserBalanceUSD } = useBalance({
        address,
        token: USD_ADDR as `0x${string}` | undefined,
    });

    // Listen to Deposit events from LiquidityPool
    /*useWatchContractEvent({
        address: LIQUIDITY_POOL_ADDR as `0x${string}`,
        abi: liquidityPoolAbi,
        eventName: 'Deposit',
        onLogs(logs: any[]) {
            logs.forEach(log => {
                if (log.args.user === address) {
                    const newTx: Transaction = {
                        type: 'Deposit',
                        token: 'USDC',
                        amount: formatUnits(log.args.amount || BigInt(0), 6),
                        timestamp: Date.now(),
                        txHash: log.transactionHash
                    };
                    //setLastUsdTransaction(newTx);
                    //setTransactions(prev => [newTx, ...prev].slice(0, 20));
                }
            });
        }
    });

    // Listen to Withdraw events from LiquidityPool
    useWatchContractEvent({
        address: LIQUIDITY_POOL_ADDR as `0x${string}`,
        abi: liquidityPoolAbi,
        eventName: 'Withdraw',
        onLogs(logs: any[]) {
            logs.forEach(log => {
                if (log.args.user === address) {
                    const newTx: Transaction = {
                        type: 'Withdraw',
                        token: 'USDC',
                        amount: formatUnits(log.args.sharesBurned || BigInt(0), 6),
                        timestamp: Date.now(),
                        txHash: log.transactionHash
                    };
                    //setLastUsdTransaction(newTx);
                    //setTransactions(prev => [newTx, ...prev].slice(0, 20));
                }
            });
        }
    });

    // Listen to Disburse events from LiquidityPool (MXN transactions)
    useWatchContractEvent({
        address: LIQUIDITY_POOL_ADDR as `0x${string}`,
        abi: liquidityPoolAbi,
        eventName: 'Disburse',
        onLogs(logs: any[]) {
            logs.forEach(log => {
                if (log.args.user === address) {
                    const newTx: Transaction = {
                        type: 'Disburse',
                        token: 'MXNe',
                        amount: formatUnits(log.args.principal || BigInt(0), 6),
                        timestamp: Date.now(),
                        txHash: log.transactionHash
                    };
                    //setLastMxnTransaction(newTx);
                    //setTransactions(prev => [newTx, ...prev].slice(0, 20));
                }
            });
        }
    });

    // Listen to microloan events
    useWatchContractEvent({
        address: MICROLOAN_ADDR as `0x${string}`,
        abi: microloanAbi,
        eventName: 'LoanOpened',
        onLogs(logs: any[]) {
            logs.forEach(log => {
                if (log.args.user === address) {
                    const newTx: Transaction = {
                        type: 'Loan Opened',
                        token: 'MXNe',
                        amount: formatUnits(log.args.principal || BigInt(0), 6),
                        timestamp: Date.now(),
                        txHash: log.transactionHash
                    };
                    //setLastMxnTransaction(newTx);
                    //setTransactions(prev => [newTx, ...prev].slice(0, 20));
                }
            });
        }
    });

    useWatchContractEvent({
        address: MICROLOAN_ADDR as `0x${string}`,
        abi: microloanAbi,
        eventName: 'Repaid',
        onLogs(logs: any[]) {
            logs.forEach(log => {
                if (log.args.user === address) {
                    const newTx: Transaction = {
                        type: 'Loan Repayment',
                        token: 'USDC',
                        amount: formatUnits(log.args.amount || BigInt(0), 6),
                        timestamp: Date.now(),
                        txHash: log.transactionHash
                    };
                    //setLastUsdTransaction(newTx);
                    //setTransactions(prev => [newTx, ...prev].slice(0, 20));
                }
            });
        }
    });

    // Fetch historical events when component mounts
    useEffect(() => {
        async function fetchHistoricalEvents() {
            if (!address || !publicClient) return;
            
            setIsLoading(true);
            try {
                // Get approximate block from 30 days ago (assuming ~12 sec block time)
                const currentBlock = await publicClient.getBlockNumber();
                const blockFrom = currentBlock - BigInt(30 * 24 * 60 * 5); // ~30 days
                
                const allTxs: Transaction[] = [];
                
                // Fetch USDC transfer events (ERC20 Transfer)
                const usdcTransferLogs = await publicClient.getLogs({
                    address: USD_ADDR as `0x${string}`,
                    event: {
                        type: 'event',
                        name: 'Transfer',
                        inputs: [
                            { type: 'address', name: 'from', indexed: true },
                            { type: 'address', name: 'to', indexed: true },
                            { type: 'uint256', name: 'value' }
                        ]
                    },
                    args: {
                        // Get transfers to or from the user
                        from: undefined,
                        to: undefined
                    },
                    fromBlock: blockFrom,
                    toBlock: 'latest'
                });
                
                // Filter for transfers involving the user's address
                usdcTransferLogs.forEach(log => {
                    const from = log.args.from?.toLowerCase();
                    const to = log.args.to?.toLowerCase();
                    const userAddress = address.toLowerCase();
                    
                    if (from === userAddress || to === userAddress) {
                        const direction = to === userAddress ? 'IN' : 'OUT';
                        allTxs.push({
                            type: direction === 'IN' ? 'Received' : 'Sent',
                            token: 'USDC',
                            amount: formatUnits(log.args.value || BigInt(0), 6),
                            timestamp: Date.now() - Math.floor(Math.random() * 1000000), // For sorting
                            txHash: log.transactionHash,
                            direction
                        });
                    }
                });
                
                // Fetch MXN transfer events (ERC20 Transfer)
                const mxnTransferLogs = await publicClient.getLogs({
                    address: MXN_ADDR as `0x${string}`,
                    event: {
                        type: 'event',
                        name: 'Transfer',
                        inputs: [
                            { type: 'address', name: 'from', indexed: true },
                            { type: 'address', name: 'to', indexed: true },
                            { type: 'uint256', name: 'value' }
                        ]
                    },
                    args: {
                        // Get transfers to or from the user
                        from: undefined,
                        to: undefined
                    },
                    fromBlock: blockFrom,
                    toBlock: 'latest'
                });
                
                // Filter for transfers involving the user's address
                mxnTransferLogs.forEach(log => {
                    const from = log.args.from?.toLowerCase();
                    const to = log.args.to?.toLowerCase();
                    const userAddress = address.toLowerCase();
                    
                    if (from === userAddress || to === userAddress) {
                        const direction = to === userAddress ? 'IN' : 'OUT';
                        allTxs.push({
                            type: direction === 'IN' ? 'Received' : 'Sent',
                            token: 'MXNe',
                            amount: formatUnits(log.args.value || BigInt(0), 6),
                            timestamp: Date.now() - Math.floor(Math.random() * 1000000), // For sorting
                            txHash: log.transactionHash,
                            direction
                        });
                    }
                });
                
                // Also include other transaction types from original code
                // ... existing code for other event types ...
                
                // Sort by timestamp (newest first)
                allTxs.sort((a, b) => {
                    // If we have actual block timestamps, use those
                    return b.timestamp - a.timestamp;
                });
                
                // Update state
                setTransactions(allTxs);
                
                // Set last transactions for each token
                const lastUsdTx = allTxs.find(tx => tx.token === 'USDC');
                if (lastUsdTx) setLastUsdTransaction(lastUsdTx);
                
                const lastMxnTx = allTxs.find(tx => tx.token === 'MXNe');
                if (lastMxnTx) setLastMxnTransaction(lastMxnTx);
                
            } catch (error) {
                console.error("Error fetching historical events:", error);
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchHistoricalEvents();
    }, [address, publicClient]);*/

    // Format timestamp to readable date
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    // Format transaction type with direction indicator
    const formatTransactionType = (type: string, direction?: 'IN' | 'OUT') => {
        if (direction) {
            return direction === 'IN' ? '↓ Money In' : '↑ Money Out';
        }
        
        switch (type) {
            case 'Deposit': return '↑ Deposit';
            case 'Withdraw': return '↓ Withdraw';
            case 'Disburse': return '↓ Disburse';
            case 'Loan Opened': return '↑ Loan Received';
            case 'Loan Repayment': return '↑ Loan Repayment';
            case 'Received': return '↓ Money In';
            case 'Sent': return '↑ Money Out';
            default: return type;
        }
    };

    // Get appropriate class for transaction type (green for incoming, red for outgoing)
    const getTransactionTypeClass = (type: string, direction?: 'IN' | 'OUT') => {
        if (direction) {
            return direction === 'IN' ? 'text-green-400' : 'text-red-400';
        }
        
        if (['Deposit', 'Loan Opened', 'Received'].includes(type)) {
            return 'text-green-400';
        } else {
            return 'text-red-400';
        }
    };

    return (
        <div className="min-h-screen text-white flex flex-col items-center px-4 py-12">
            <h1 className="text-3xl font-bold mt-6 mb-6">Manage Now</h1>
            {address ? (
                <>
                    {/* USDC section */}
                    <div className="w-full max-w-md mx-auto mt-6 mb-6 p-8 border border-[#264C73] rounded-lg space-y-6 text-center relative">
                        <h2 className="text-2xl font-semibold mb-2">USD Balance</h2>
                        <div className="h-1 w-16 bg-[#264C73] mx-auto rounded mb-6" />
                        <div className="text-4xl mb-2">🇺🇸</div>
                        <span className="text-[#50e2c3]">You have</span>
                        <p className="text-2xl font-bold ">{Number(userBalanceInUSDData?.formatted).toFixed(2)} USDC</p>
                        
                        {/* Last USDC Transaction */}
                        {lastUsdTransaction && (
                            <div className="mt-4 p-2 border-t border-[#264C73] pt-4">
                                <p className="text-sm text-gray-400">Last Transaction</p>
                                <p className={`text-md ${getTransactionTypeClass(lastUsdTransaction.type, lastUsdTransaction.direction)}`}>
                                    {formatTransactionType(lastUsdTransaction.type, lastUsdTransaction.direction)}
                                </p>
                                <p className="text-md font-medium">{lastUsdTransaction.amount} USDC</p>
                                <p className="text-xs text-gray-500">{formatDate(lastUsdTransaction.timestamp)}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* MXN section */}
                    <div className="w-full max-w-md mx-auto mt-6 mb-6 p-8 border border-[#264C73] rounded-lg space-y-6 text-center relative">
                        <h2 className="text-2xl font-semibold mb-2">MXN Balance</h2>
                        <div className="h-1 w-16 bg-[#264C73] mx-auto rounded mb-6" />
                        <div className="text-4xl mb-2">🇲🇽</div>
                        <span className="text-[#50e2c3]">You have</span>
                        <p className="text-2xl font-bold ">{Number(userBalanceInMXNData?.formatted).toFixed(2)} MXNe</p>
                        
                        {/* Last MXN Transaction */}
                        {lastMxnTransaction && (
                            <div className="mt-4 p-2 border-t border-[#264C73] pt-4">
                                <p className="text-sm text-gray-400">Last Transaction</p>
                                <p className={`text-md ${getTransactionTypeClass(lastMxnTransaction.type, lastMxnTransaction.direction)}`}>
                                    {formatTransactionType(lastMxnTransaction.type, lastMxnTransaction.direction)}
                                </p>
                                <p className="text-md font-medium">{lastMxnTransaction.amount} MXNe</p>
                                <p className="text-xs text-gray-500">{formatDate(lastMxnTransaction.timestamp)}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Transaction History Section 
                    <div className="w-full max-w-md mx-auto mt-6 mb-6 p-8 border border-[#264C73] rounded-lg space-y-6 relative">
                        <h2 className="text-2xl font-semibold mb-2 text-center">Transaction History</h2>
                        <div className="h-1 w-24 bg-[#264C73] mx-auto rounded mb-6" />
                        
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#50e2c3]"></div>
                            </div>
                        ) : transactions.length > 0 ? (
                            <div className="divide-y divide-[#264C73]">
                                {transactions.map((tx, index) => (
                                    <div key={index} className="py-4 flex justify-between items-center">
                                        <div>
                                            <p className={`text-md ${getTransactionTypeClass(tx.type, tx.direction)}`}>
                                                {formatTransactionType(tx.type, tx.direction)}
                                            </p>
                                            <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-md font-medium">{tx.amount} {tx.token}</p>
                                            {tx.txHash && (
                                                <a 
                                                    href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-400 hover:underline"
                                                >
                                                    View on Etherscan
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No transactions found.</p>
                        )}
                    </div>
                    */}
                </>
            ) : (
                <div className="mt-8">
                    <p className="text-lg text-gray-500">
                        Please connect your wallet to start managing it.
                    </p>
                </div>
            )}
        </div>
    )
}
