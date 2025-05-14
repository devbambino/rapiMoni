"use client"
import { useState, useEffect } from "react";
import { useAccount, useSimulateContract, useWriteContract, useReadContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { usdcAbi } from "@/lib/usdc-abi";
import { liquidityPoolAbi } from "@/lib/liquiditypool-abi";
import { feePoolAbi } from "@/lib/feepool-abi";
import { parseUnits, formatUnits } from 'viem';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toastprovider";
import { AlertCircle } from "lucide-react";

const LP_ADDR = process.env.NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS!;
const FP_ADDR = process.env.NEXT_PUBLIC_FEE_POOL_ADDRESS!;
const MXN_ADDR = process.env.NEXT_PUBLIC_MXN_ADDRESS!;
const USD_ADDR = process.env.NEXT_PUBLIC_USD_ADDRESS!;

export default function LendPage() {
    const { address } = useAccount();
    const { data: hash, isPending, writeContractAsync } = useWriteContract();
    const [depositAmt, setDepositAmt] = useState("");
    const [alertMsj, setAlertMsj] = useState("");
    const { showToast } = useToast();

    const userBalanceInMXNData = useBalance({
        address,
        token: MXN_ADDR as `0x${string}` | undefined,
    });
    const poolBalanceInMXNData = useBalance({
        address: LP_ADDR as `0x${string}`,
        token: MXN_ADDR as `0x${string}` | undefined,
    });
    const poolBalanceInUSDData = useBalance({
        address: LP_ADDR as `0x${string}`,
        token: MXN_ADDR as `0x${string}` | undefined,
    });

    // 1) Fetch totals & user shares
    const { data: totalShares } = useReadContract({ address: LP_ADDR as `0x${string}`, abi: liquidityPoolAbi, functionName: 'totalShares' });
    const { data: userShares } = useReadContract({ address: LP_ADDR as `0x${string}`, abi: liquidityPoolAbi, functionName: 'shares', args: [address!] });
    const { data: userBalanceTimestamp } = useReadContract({ address: LP_ADDR as `0x${string}`, abi: liquidityPoolAbi, functionName: 'balancesTimestamp', args: [address!] });

    // 2) Prepare deposit
    const { data: depositConfig } = useSimulateContract({
        address: LP_ADDR as `0x${string}`,
        abi: liquidityPoolAbi,
        functionName: 'deposit',
        args: [parseUnits(depositAmt, 6)],
    });
    const { data: depositHash, writeContract: deposit, isPending: depositIsPending } = useWriteContract();
    const { isLoading: depositConfirming, isSuccess: depositConfirmed } = useWaitForTransactionReceipt({ hash: depositHash });
    /*deposit({
        address: LP_ADDR! as `0x${string}`,
        abi: liquidityPoolAbi,
        functionName: 'deposit',
        args: [parseUnits(depositAmt, 6)],
    });*/

    // 3) Prepare claim
    const { data: claimConfig } = useSimulateContract({
        address: FP_ADDR as `0x${string}`,
        abi: feePoolAbi,
        functionName: 'claim'
    });
    const { data: claimHash, writeContract: claim, isPending: claimIsPending } = useWriteContract();
    const { isLoading: claimConfirming, isSuccess: claimConfirmed } = useWaitForTransactionReceipt({ hash: claimHash });
    //const { write: claim, isLoading: claiming } = useWriteContract(claimConfig)

    // 4) Withdraw funds
    const { data: withdrawConfig } = useSimulateContract({
        address: LP_ADDR as `0x${string}`,
        abi: liquidityPoolAbi,
        functionName: 'withdraw'
    });
    const { data: withdrawHash, writeContract: withdraw, isPending: withdrawIsPending } = useWriteContract();
    const { isLoading: withdrawConfirming, isSuccess: withdrawConfirmed } = useWaitForTransactionReceipt({ hash: withdrawHash });

    const onDeposit = async () => {
        if (!depositAmt || !address) return;

        try {
            let userBalanceInMXN = userBalanceInMXNData.data?.formatted;
            console.log("userBalanceInMXN:", userBalanceInMXN!," depositAmt:",depositAmt!);
            showToast("You don't have enough MXNe to deposit.", "error");

            if (+depositAmt > +userBalanceInMXN!) {
                showToast("You don't have enough MXNe to deposit.", "error");
                return;
            }

            if (totalShares! > 0) {
                showToast("You have already deposited funds, for adding more please withdraw all first.", "error");
                return;
            }

            const hashApproval = await writeContractAsync({
                abi: usdcAbi,// reuse usdcAbi as it has similar functions
                address: MXN_ADDR as `0x${string}`,
                functionName: 'approve',
                args: [LP_ADDR as `0x${string}`, parseUnits(depositAmt, 6)],
            });
            console.log("onDeposit hashApproval:", hashApproval);
            deposit(depositConfig!.request);
            setAlertMsj("Congrats: Deposit done!");
        } catch (err: any) {
            setAlertMsj("");
            console.error("Deposit Error onDeposit:", err);
            // Extract a string error message from the error object
            const errorStr =
                typeof err === "string"
                    ? err
                    : err?.message || err?.reason || JSON.stringify(err);

            if (errorStr.includes("cancelled transaction")) {
                showToast(
                    `You rejected the request, please try again when you are ready to make the payment.`,
                    "error"
                );
            } else {
                showToast("An error occurred while processing the deposit. Please try again later.", "error");
            }
        } finally {
        }
    };

    const onClaim = async () => {
        if (!address) return;
        try {
            setAlertMsj("Congrats: Claim done!");
            claim(claimConfig!.request);
        } catch (err: any) {
            setAlertMsj("");
            console.error("Claim Error onClaim:", err);
            // Extract a string error message from the error object
            const errorStr =
                typeof err === "string"
                    ? err
                    : err?.message || err?.reason || JSON.stringify(err);

            if (errorStr.includes("cancelled transaction")) {
                showToast(
                    `You rejected the request, please try again when you are ready to make the payment.`,
                    "error"
                );
            } else {
                showToast("An error occurred while processing the claim. Please try again later.", "error");
            }
        } finally {

        }
    };

    const onWithdraw = async () => {
        if (!address) return;
        try {
            setAlertMsj("Congrats: Withdrawal done!");
            withdraw(withdrawConfig!.request);
        } catch (err: any) {
            setAlertMsj("");
            console.error("Withdrawal Error onWithdraw:", err);
            // Extract a string error message from the error object
            const errorStr =
                typeof err === "string"
                    ? err
                    : err?.message || err?.reason || JSON.stringify(err);

            if (errorStr.includes("cancelled transaction")) {
                showToast(
                    `You rejected the request, please try again when you are ready to make the payment.`,
                    "error"
                );
            } else {
                showToast("An error occurred while processing the withdrawal. Please try again later.", "error");
            }
        } finally {

        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold mt-6 mb-6">Lend Now</h1>
            {address ? (
                <>
                    {/* Loading animation overlay */}
                    {(depositConfirming || claimConfirming || withdrawConfirming) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10 rounded-lg">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                            <p>Processing...</p>
                        </div>
                    )}
                    {(depositConfirmed || claimConfirmed || withdrawConfirmed) && (
                        <Alert variant="default" className="mb-6 slide-in-from-top animate-in">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Confirmed</AlertTitle>
                            <AlertDescription>{alertMsj}</AlertDescription>
                        </Alert>
                    )}
                    {/* KPI Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="border-[#1453EE]/20">
                            <CardHeader>
                                <CardTitle className="text-[#1453EE]">Lending Pool</CardTitle>
                                <CardDescription className="text-[#1453EE]/80">
                                    Details about the lending pool
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium mb-1 text-[#1453EE]">Total Deposited</h3>
                                        <p className="text-[#1453EE]/80">{`${Number(totalShares ?? 0) / 1e6} MXNe`}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1 text-[#1453EE]">Your Share</h3>
                                        <p className="text-[#1453EE]/80">{`${Number(userShares ?? 0) / 1e6} MXNe`}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1 text-[#1453EE]">APY</h3>
                                        <p className="text-[#1453EE]/80 break-all">~4.5%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Deposit Widget */}
                    <div className="p-6 bg-primary/90 rounded-lg">
                        <h3>Deposit MXNe</h3>
                        <input
                            type="number"
                            placeholder="Amount in MXNe"
                            value={depositAmt}
                            onChange={e => setDepositAmt(e.target.value)}
                            className="p-2 rounded border"
                        />
                        <Button onClick={onDeposit} disabled={depositIsPending}>
                            {depositIsPending ? "Depositing…" : "Deposit"}
                        </Button>
                    </div>

                    {/* Claim Rewards */}
                    <div className="p-6 bg-primary/90 rounded-lg">
                        <h3>Claim Rewards</h3>
                        <Button onClick={onClaim} disabled={claimIsPending}>
                            {claimIsPending ? "Claiming…" : "Claim"}
                        </Button>
                    </div>

                    {/* Claim Rewards */}
                    <div className="p-6 bg-primary/90 rounded-lg">
                        <h3>Withdraw funds</h3>
                        <Button onClick={onWithdraw} disabled={withdrawIsPending}>
                            {withdrawIsPending ? "Withdrawing…" : "Withdraw"}
                        </Button>
                    </div>
                </>
            ) : (
                <div className="mt-8">
                    <p className="text-lg text-gray-500">
                        Please connect your wallet to lend money and claim rewards.
                    </p>
                </div>
            )}
        </div>
    )
}
