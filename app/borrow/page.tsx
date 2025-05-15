"use client"
import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useBalance } from "wagmi"
import { liquidityPoolAbi } from "@/lib/liquiditypool-abi";
import { usdcAbi } from "@/lib/usdc-abi";
import { microloanAbi } from "@/lib/microloan-abi";
import { toast } from "sonner";
import { parseUnits, formatUnits } from 'viem';
import { Button } from "@/components/ui/button";
import { BanknoteX } from "lucide-react";

const LP_ADDR = process.env.NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS!;
const MA_ADDR = process.env.NEXT_PUBLIC_MANAGER_ADDRESS!;
const MXN_ADDR = process.env.NEXT_PUBLIC_MXN_ADDRESS!;
const USD_ADDR = process.env.NEXT_PUBLIC_USD_ADDRESS!;

interface Loan {
    collateral: bigint;
    principal: bigint;
    fee: bigint;
    startTime: bigint;
    term: bigint;// in seconds
    termInPeriods: bigint;// 1 to 6
    pendingPayments: bigint;// 6 to 0, in periods
    paid: bigint;// amount repaid
    liquidated: bigint;// # of liquidations
    active: boolean;
}

export default function BorrowPage() {
    const { address } = useAccount();

    const { data: userBalanceInMXNData, refetch: getUserBalanceMXN } = useBalance({
        address,
        token: MXN_ADDR as `0x${string}` | undefined,
    });
    const { data: userBalanceInUSDData, refetch: getUserBalanceUSD } = useBalance({
        address,
        token: USD_ADDR as `0x${string}` | undefined,
    });
    const { data: poolBalanceInUSDData, refetch: getPoolBalanceUSD } = useBalance({
        address: MA_ADDR as `0x${string}`,
        token: USD_ADDR as `0x${string}` | undefined,
    });
    const { data: poolBalanceInMXNData, refetch: getPoolBalanceMXN } = useBalance({
        address: LP_ADDR as `0x${string}`,
        token: MXN_ADDR as `0x${string}` | undefined,
    });

    // Fetch user's info
    //const { data: totalShares, refetch: getTotalShares } = useReadContract({ address: MA_ADDR as `0x${string}`, abi: microloanAbi, functionName: 'totalShares' });
    const { data, refetch: getUserLoan } = useReadContract({ address: MA_ADDR as `0x${string}`, abi: microloanAbi, functionName: 'loans', args: [address!] });
    const loan = data as any as Loan;
    const { data: userCollateral, refetch: getUserCollateral } = useReadContract({ address: MA_ADDR as `0x${string}`, abi: microloanAbi, functionName: 'collateral', args: [address!] });
    

    if (!loan?.active) {
        return (
            <div className="text-center mt-20 py-20 space-y-20">
                <BanknoteX className="h-20 w-20 text-[#50e2c3] mx-auto mb-4" />
                <p>You have no active loan</p>
                <a href="/pay" className="p-4 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full">Start a new purchase</a>
            </div>
        )
    }

    // 1) Calculate progress
    const elapsed = (Date.now() / 1000 - Number(loan.startTime));
    const pct = Math.min(100, (elapsed / Number(loan.term)) * 100);

    // 2) Prepare repay 100 + 400 / 4, 200, 
    const nextDue = Number(loan.startTime) + Number(loan.term / loan.termInPeriods) * (1 + Number(loan.termInPeriods - loan.pendingPayments));/* compute next due date from loan.startTime + intervals */
    //const minPayment = Math.ceil((Number(loan.principal) - Number(loan.paid)) / Number(loan.pendingPayments));
    const minPayment = (loan.principal - loan.paid) / loan.pendingPayments;
    const { data: approveRepayHash, error: approveRepayError, writeContractAsync: approveRepay, isPending: approveRepayIsPending } = useWriteContract();
    const { isLoading: approveRepayConfirming, isSuccess: approveRepayConfirmed } = useWaitForTransactionReceipt({ hash: approveRepayHash });
    const { data: repayHash, error: repayError, writeContractAsync: repay, isPending: repayIsPending } = useWriteContract();
    const { isLoading: repayConfirming, isSuccess: repayConfirmed } = useWaitForTransactionReceipt({ hash: repayHash });

    const { data: withdrawHash, writeContractAsync: withdraw, isPending: withdrawIsPending } = useWriteContract();
    const { isLoading: withdrawConfirming, isSuccess: withdrawConfirmed } = useWaitForTransactionReceipt({ hash: withdrawHash });


    const onRepay = async () => {
        if (!address) return;
        //setIsLoading(true);
        try {
            getUserBalanceMXN();
            let userBalanceInMXN = userBalanceInMXNData?.value;
            console.log("onRepay userBalanceInMXN:", userBalanceInMXN!, " minPayment:", minPayment!);

            if (minPayment > userBalanceInMXN!) {
                toast.warning("You don't have enough MXNe to make repayment.");
                console.log("onRepay You don't have enough MXNe to deposit.");
                return;
            }

            await approveRepay({
                abi: usdcAbi,// reuse usdcAbi as it has similar functions
                address: MXN_ADDR as `0x${string}`,
                functionName: 'approve',
                args: [LP_ADDR as `0x${string}`, minPayment],
            });
            console.log("onRepay  approveRepayHash:", approveRepayHash);

            await repay({
                address: MA_ADDR as `0x${string}`,
                abi: microloanAbi,
                functionName: 'repay',
                args: [minPayment],
            });
            console.log("onRepay  repayHash:", repayHash);

            toast.success("Congrats: Repayment done!");

        } catch (err: any) {
            console.error("onRepay  Error onRepay:", err);
            // Extract a string error message from the error object
            const errorStr =
                typeof err === "string"
                    ? err
                    : err?.message || err?.reason || JSON.stringify(err);

            if (errorStr.includes("cancelled transaction")) {
                toast.error("You rejected the request, please try again when you are ready to make the payment.");
            } else {
                toast.error("An error occurred while processing the deposit. Please try again later.");
            }
        } finally {
            //setIsLoading(false);
        }
    };

    const onWithdraw = async () => {
        if (!address) return;
        //setIsLoading(true);
        try {

            await withdraw({
                address: MA_ADDR as `0x${string}`,
                abi: microloanAbi,
                functionName: 'withdrawCollateral'
            });
            console.log("onWithdraw  withdrawHash:", withdrawHash);
            toast.success("Congrats: Withdrawal done!");

        } catch (err: any) {
            console.error("Withdrawal Error onWithdraw:", err);
            // Extract a string error message from the error object
            const errorStr =
                typeof err === "string"
                    ? err
                    : err?.message || err?.reason || JSON.stringify(err);

            if (errorStr.includes("cancelled transaction")) {
                toast.error("You rejected the request, please try again when you are ready to make the payment.");
            } else {
                toast.error("An error occurred while processing the deposit. Please try again later.");
            }
        } finally {
            //setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
            {/* Loan Card */}
            <div className="p-6 bg-primary/90 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="font-bold">Merchant ABC</span>
                    <span>{Number(loan.principal) / 1e6} MXNe</span>
                </div>
                <div className="mt-4 h-2 bg-gray-700 rounded overflow-hidden">
                    <div style={{ width: `${pct}%` }}
                        className="h-full bg-secondary" />
                </div>
                <p className="mt-2 text-sm">{Math.floor(pct)}% elapsed</p>
            </div>

            {/* Repayment Schedule */}
            <table className="w-full text-left">
                <thead><tr>
                    <th>Due Date</th><th>Amount</th><th>Status</th>
                </tr></thead>
                <tbody>
                    {/* Map over 1..termInPeriods */}
                    {[...Array(Number(loan.termInPeriods)).keys()].map(i => {
                        const dueDate = Number(loan.startTime) + ((i + 1) * (Number(loan.term) / Number(loan.termInPeriods)))
                        const paid = (i + 1) <= (Number(loan.termInPeriods) - Number(loan.pendingPayments))
                        return (
                            <tr key={i}>
                                <td>{new Date(dueDate * 1000).toLocaleDateString()}</td>
                                <td>{(Number(loan.principal) / 1e6 / Number(loan.termInPeriods)).toFixed(2)} MXNe</td>
                                <td>{paid ? "✔️ Paid" : (i + 1 === (Number(loan.termInPeriods) - Number(loan.pendingPayments)))
                                    ? `Due in ${Math.ceil((dueDate * 1000 - Date.now()) / 86400000)}d`
                                    : "Pending"}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {/* Next Payment & Repay */}
            <div className="p-4 bg-primary/90 rounded-lg flex justify-between items-center">
                <div>
                    <p>Next: {new Date(nextDue * 1000).toLocaleDateString()}</p>
                    <p className="font-bold">{(Number(minPayment) / 1e6).toFixed(2)} MXNe</p>
                </div>
                <Button onClick={onRepay} disabled={approveRepayIsPending || repayIsPending || !loan.active} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full">{approveRepayIsPending || repayIsPending ? "Repaying…" : !loan.active ? "Nothing to repay" : "Repay"}</Button>
            </div>

            {/* Collateral Section */}
            {userCollateral! > 0 && (
                <div className="p-4 bg-primary/90 rounded-lg">
                    <p>Collateral Locked: {(Number(loan.collateral) / 1e6).toFixed(2)} USDC</p>
                    {!loan.active && (
                        <Button onClick={onWithdraw} disabled={withdrawIsPending} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full">{withdrawIsPending ? "Withdrawing…" : "Withdraw"}</Button>
                    )}
                </div>
            )}

        </div>
    )
}
