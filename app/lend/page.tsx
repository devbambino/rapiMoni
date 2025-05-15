"use client"
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { useWriteContracts } from 'wagmi/experimental';
import { usdcAbi } from "@/lib/usdc-abi";
import { liquidityPoolAbi } from "@/lib/liquiditypool-abi";
import { microloanAbi } from "@/lib/microloan-abi";
import { feePoolAbi } from "@/lib/feepool-abi";
import { parseUnits, formatUnits } from 'viem';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const LP_ADDR = process.env.NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS!;
const FP_ADDR = process.env.NEXT_PUBLIC_FEE_POOL_ADDRESS!;
const MA_ADDR = process.env.NEXT_PUBLIC_MANAGER_ADDRESS!;
const MXN_ADDR = process.env.NEXT_PUBLIC_MXN_ADDRESS!;
const USD_ADDR = process.env.NEXT_PUBLIC_USD_ADDRESS!;

export default function LendPage() {
    const { address } = useAccount();
    const { data: hash, isPending, writeContractAsync } = useWriteContract();
    //const { data: hash, error, isPending, writeContractsAsync } = useWriteContracts();
    const [depositAmt, setDepositAmt] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    //const [alertMsj, setAlertMsj] = useState("");

    const { data: userBalanceInMXNData, refetch: getUserBalanceMXN } = useBalance({
        address,
        token: MXN_ADDR as `0x${string}` | undefined,
    });
    const { data: poolBalanceInMXNData, refetch: getPoolBalanceMXN } = useBalance({
        address: LP_ADDR as `0x${string}`,
        token: MXN_ADDR as `0x${string}` | undefined,
    });
    const { data: poolBalanceInUSDData, refetch: getPoolBalanceUSD } = useBalance({
        address: LP_ADDR as `0x${string}`,
        token: MXN_ADDR as `0x${string}` | undefined,
    });

    // Fetch pools info
    const { data: currentTimestamp, refetch: getCurrentTimestamp } = useReadContract({ address: MA_ADDR as `0x${string}`, abi: microloanAbi, functionName: 'getCurrentTimestamp' });
    const { data: lockedInPeriod } = useReadContract({ address: LP_ADDR as `0x${string}`, abi: liquidityPoolAbi, functionName: 'lockedInPeriod' });
    const { data: claimTerm } = useReadContract({ address: FP_ADDR as `0x${string}`, abi: feePoolAbi, functionName: 'claimTerm' });
    const { data: claimableFees, refetch: getClaimableFees } = useReadContract({ address: FP_ADDR as `0x${string}`, abi: feePoolAbi, functionName: 'claimableFees' });
    // Fetch user's info
    const { data: totalShares, refetch: getTotalShares } = useReadContract({ address: LP_ADDR as `0x${string}`, abi: liquidityPoolAbi, functionName: 'totalShares' });
    const { data: userShares, refetch: getUserShares } = useReadContract({ address: LP_ADDR as `0x${string}`, abi: liquidityPoolAbi, functionName: 'shares', args: [address!] });
    const { data: userBalanceTimestamp, refetch: getUserBalanceTimestamp } = useReadContract({ address: LP_ADDR as `0x${string}`, abi: liquidityPoolAbi, functionName: 'balancesTimestamp', args: [address!] });
    const { data: userClaimed, refetch: getUserClaimed } = useReadContract({ address: FP_ADDR as `0x${string}`, abi: feePoolAbi, functionName: 'claimed', args: [address!] });
    
    const { data: approveDepositHash, error: approveDepositError, writeContractAsync: approveDeposit, isPending: approveDepositIsPending } = useWriteContract();
    const { isLoading: approveDepositConfirming, isSuccess: approveDepositConfirmed } = useWaitForTransactionReceipt({ hash: approveDepositHash });

    const { data: depositHash, error: depositError, writeContractAsync: deposit, isPending: depositIsPending } = useWriteContract();
    const { isLoading: depositConfirming, isSuccess: depositConfirmed } = useWaitForTransactionReceipt({ hash: depositHash });

    const { data: claimHash, error: claimError, writeContractAsync: claim, isPending: claimIsPending } = useWriteContract();
    const { isLoading: claimConfirming, isSuccess: claimConfirmed } = useWaitForTransactionReceipt({ hash: claimHash });

    const { data: withdrawHash, writeContractAsync: withdraw, isPending: withdrawIsPending } = useWriteContract();
    const { isLoading: withdrawConfirming, isSuccess: withdrawConfirmed } = useWaitForTransactionReceipt({ hash: withdrawHash });

    useEffect(() => {
        if (address) {
            getTotalShares();
            getUserShares();
            getUserBalanceMXN();
            console.log("onDeposit  depositHash:", depositHash, " depositConfirming:", depositConfirming, " depositConfirmed:", depositConfirmed);
        }
    }, [depositConfirmed, claimConfirmed, withdrawConfirmed, address]);

    const onDeposit = async () => {
        if (!depositAmt || !address) return;
        setIsLoading(true);
        try {
            getUserShares();
            getUserBalanceMXN();
            let userBalanceInMXN = userBalanceInMXNData?.formatted;
            console.log("onDeposit userBalanceInMXN:", userBalanceInMXN!, " depositAmt:", depositAmt!);

            if (+depositAmt > +userBalanceInMXN!) {
                toast.warning("You don't have enough MXNe to deposit.");
                console.log("onDeposit You don't have enough MXNe to deposit.");
                return;
            } else {
                console.log("onDeposit You have enough MXNe to deposit.", "success");
            }

            if (userShares! > 0) {
                toast.warning("You have already deposited funds, for adding more please withdraw all first.");
                console.log("onDeposit You have already deposited funds, for adding more please withdraw all first.");
                return;
            } else {
                console.log("onDeposit You can deposit funds.", "success");
            }

            /*const depositId = await writeContractsAsync({
                contracts: [
                    {
                        abi: usdcAbi,// reuse usdcAbi as it has similar functions
                        address: MXN_ADDR as `0x${string}`,
                        functionName: 'approve',
                        args: [LP_ADDR as `0x${string}`, parseUnits(depositAmt, 6)],
                    },
                    {
                        address: LP_ADDR as `0x${string}`,
                        abi: liquidityPoolAbi,
                        functionName: 'deposit',
                        args: [parseUnits(depositAmt, 6)],
                    }
                ],
            });
            console.log("onDeposit depositId:", depositId);
            await new Promise(res => setTimeout(res, 1000));*/

            await approveDeposit({
                abi: usdcAbi,// reuse usdcAbi as it has similar functions
                address: MXN_ADDR as `0x${string}`,
                functionName: 'approve',
                args: [LP_ADDR as `0x${string}`, parseUnits(depositAmt, 6)],
            });
            console.log("onDeposit  hashApprove:", approveDepositHash);

            await deposit({
                address: LP_ADDR as `0x${string}`,
                abi: liquidityPoolAbi,
                functionName: 'deposit',
                args: [parseUnits(depositAmt, 6)],
            });
            console.log("onDeposit  depositHash:", depositHash);

            setDepositAmt("");

            toast.success("Congrats: Deposit done!");

        } catch (err: any) {
            console.error("onDeposit  Error onDeposit:", err);
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
            setIsLoading(false);
        }
    };

    const onClaim = async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            //require(block.timestamp - userBalanceTimestamp > claimTerm, "Claims are not allowed yet");
            getUserBalanceTimestamp();
            getCurrentTimestamp();
            console.log(" userBalanceTimestamp:", userBalanceTimestamp, " claimTerm:", claimTerm, " currentTimestamp:", currentTimestamp);
            if (currentTimestamp! - userBalanceTimestamp! < claimTerm!) {
                toast.error("Claims are not allowed yet");
                console.error("Claims are not allowed yet");
                return;
            }
            //uint256 entitled = (claimableFees * userShares) / totalShares;
            //uint256 claimable = entitled - claimed[msg.sender];
            //require(claimable > 0, "Nothing to claim");
            getTotalShares();
            getUserShares();
            getClaimableFees();
            getUserClaimed();
            console.log("claimableFees:", claimableFees, " userShares:", userShares, " userClaimed:", userClaimed);
            if ( (claimableFees! * userShares!) / totalShares! <= userClaimed!) {
                toast.error("Nothing to claim");
                console.error("Nothing to claim");
                return;
            }
            
            await claim({
                address: FP_ADDR as `0x${string}`,
                abi: feePoolAbi,
                functionName: 'claim'
            });
            console.log("onClaim  claimHash:", claimHash);
            toast.success("Congrats: Claim done!");

        } catch (err: any) {
            console.error("Claim Error onClaim:", err);
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
            setIsLoading(false);
        }
    };

    const onWithdraw = async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            getUserBalanceTimestamp();
            getCurrentTimestamp();
            console.log(" userBalanceTimestamp:", userBalanceTimestamp, " lockedInPeriod:", lockedInPeriod, " currentTimestamp:", currentTimestamp);
            if (currentTimestamp! - userBalanceTimestamp! < lockedInPeriod!) {
                toast.error("Withdraws are not allowed yet");
                console.error("Withdraws are not allowed yet");
                return;
            }

            await withdraw({
                address: LP_ADDR as `0x${string}`,
                abi: liquidityPoolAbi,
                functionName: 'withdraw'
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
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-white flex flex-col items-center px-4 py-12">
            <h1 className="text-3xl font-bold mt-6 mb-6">Lend Now</h1>
            {address ? (
                <>
                    <div className="w-full max-w-md mx-auto mt-6 mb-6 p-8 border border-[#264C73] rounded-lg space-y-6 text-center relative">
                        {/* Loading animation overlay */}
                        {withdrawConfirming && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10 rounded-lg">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                                <p>Processing withdrawal...</p>
                            </div>
                        )}
                        {/* Stepper UI */}
                        <h2 className="text-2xl font-semibold mb-2">Lending Pool</h2>
                        <div className="h-1 w-16 bg-[#264C73] mx-auto rounded mb-6" />
                        <span className="text-xl text-[#50e2c3]">Total Deposited</span>
                        <p className="">{`${Number(totalShares ?? 0) / 1e6} MXNe`}</p>
                        <span className="text-xl text-[#50e2c3]">Your Share</span>
                        <p className="">{`${Number(userShares ?? 0) / 1e6} MXNe`}</p>
                        <span className="text-xl text-[#50e2c3]">APY</span>
                        <p className="">~4.5%</p>
                        {userShares! > 0 && (
                            <>
                                <Button onClick={onWithdraw} disabled={withdrawIsPending} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full">{withdrawIsPending ? "Withdrawing…" : "Withdraw"}</Button>
                            </>
                        )}

                    </div>

                    {/* Deposit Widget */}
                    <div className="w-full max-w-md mx-auto mt-6 mb-6 p-8 border border-[#264C73] rounded-lg space-y-6 text-center relative">
                        {/* Loading animation overlay */}
                        {depositConfirming && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10 rounded-lg">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                                <p>Processing deposit...</p>
                            </div>
                        )}
                        <h2 className="text-2xl font-semibold mb-2">Deposit MXNe</h2>
                        <div className="h-1 w-16 bg-[#264C73] mx-auto rounded mb-6" />
                        <span className="text-xl text-[#50e2c3]">You have</span>
                        <p className="">{userBalanceInMXNData?.formatted} MXNe</p>
                        <Input
                            type="number"
                            placeholder="Amount in MXNe"
                            value={depositAmt}
                            onChange={e => setDepositAmt(e.target.value)}
                            className="w-full p-3 rounded-md border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#50e2c3]"
                        />
                        <Button onClick={onDeposit} disabled={approveDepositIsPending || depositIsPending || userShares! > 0} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full">{approveDepositIsPending || depositIsPending ? "Depositing…" : userShares! > 0 ? "Deposit done" : "Deposit"}</Button>
                    </div>

                    {/* Claim Rewards */}
                    {userShares! > 0 && (
                        <div className="w-full max-w-md mx-auto mt-6 mb-6 p-8 border border-[#264C73] rounded-lg space-y-6 text-center relative">
                            {/* Loading animation overlay */}
                            {claimConfirming && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10 rounded-lg">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                                    <p>Processing claim...</p>
                                </div>
                            )}
                            <h2 className="text-2xl font-semibold mb-2">Claim Rewards</h2>
                            <div className="h-1 w-16 bg-[#264C73] mx-auto rounded mb-6" />
                            <Button onClick={onClaim} disabled={claimIsPending} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full">{claimIsPending ? "Claiming…" : "Claim"}</Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="mt-8">
                    <p className="text-lg text-gray-500">
                        Please connect your wallet to scan the QR code and pay.
                    </p>
                </div>
            )}
        </div>

    )
}
