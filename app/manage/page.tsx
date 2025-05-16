"use client"
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { liquidityPoolAbi } from "@/lib/liquiditypool-abi";
import { microloanAbi } from "@/lib/microloan-abi";
import { feePoolAbi } from "@/lib/feepool-abi";
import { usdcAbi } from "@/lib/usdc-abi";
import { parseUnits, formatUnits } from 'viem';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toastprovider";

const MXN_ADDR = process.env.NEXT_PUBLIC_MXN_ADDRESS!;
const USD_ADDR = process.env.NEXT_PUBLIC_USD_ADDRESS!;

const estimatedAPY = 12 * 0.9;

export default function ManagePage() {
    const { showToast } = useToast();
    const { address } = useAccount();
    const [depositAmt, setDepositAmt] = useState("");

    const { data: userBalanceInMXNData, refetch: getUserBalanceMXN, isLoading: isUserBalanceInMXNLoading } = useBalance({
        address,
        token: MXN_ADDR as `0x${string}` | undefined,
    });
    const { data: userBalanceInUSDData, refetch: getUserBalanceUSD } = useBalance({
        address,
        token: USD_ADDR as `0x${string}` | undefined,
    });

    return (
        <div className="min-h-screen text-white flex flex-col items-center px-4 py-12">
            <h1 className="text-3xl font-bold mt-6 mb-6">Manage Now</h1>
            {address ? (
                <>
                    <div className="w-full max-w-md mx-auto mt-6 mb-6 p-8 border border-[#264C73] rounded-lg space-y-6 text-center relative">
                        <h2 className="text-2xl font-semibold mb-2">USD Balance</h2>
                        <div className="h-1 w-16 bg-[#264C73] mx-auto rounded mb-6" />
                        <span className="text-[#50e2c3]">You have</span>
                        <p className="text-xl font-bold ">{Number(userBalanceInUSDData?.formatted).toFixed(2)} USDC</p>
                    </div>

                    <div className="w-full max-w-md mx-auto mt-6 mb-6 p-8 border border-[#264C73] rounded-lg space-y-6 text-center relative">
                        <h2 className="text-2xl font-semibold mb-2">MXN Balance</h2>
                        <div className="h-1 w-16 bg-[#264C73] mx-auto rounded mb-6" />
                        <span className="text-[#50e2c3]">You have</span>
                        <p className="text-xl font-bold ">{Number(userBalanceInMXNData?.formatted).toFixed(2)} MXNe</p>
                    </div>
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
