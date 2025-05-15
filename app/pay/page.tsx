"use client";

import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, useReadContract, useSimulateContract } from "wagmi";
import { useToast } from "@/components/ui/toastprovider";
import { usdcAbi } from "@/lib/usdc-abi";
import { poolAbi } from "@/lib/simplepool-abi";
import { useWriteContracts } from 'wagmi/experimental';
import { parseUnits, formatUnits } from 'viem';

const rate = Number(process.env.NEXT_PUBLIC_RAPIMONI_FEE); // Fee rate charged per payment
const rapiMoniAddress = process.env.NEXT_PUBLIC_RAPIMONI_WALLET; // wallet address for collecting fees

const USD_ADDR = process.env.NEXT_PUBLIC_USD_ADDRESS; // Testnet
const MXN_ADDR = process.env.NEXT_PUBLIC_MXN_ADDRESS; // Testnet
const BRZ_ADDR = process.env.NEXT_PUBLIC_BRZ_ADDRESS; // Testnet
const mockMerchantAddress = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS; // Testnet
const poolMXNeUSDCAddress = process.env.NEXT_PUBLIC_POOL_MXN_USD; // Testnet

export default function PayPage() {
    const { address } = useAccount();
    const { writeContractsAsync } = useWriteContracts();
    const { writeContract } = useWriteContract();
    const [payload, setPayload] = useState<{
        merchant: string;
        description: string
        amount: string;
        token: string;
        allowFallback: boolean;
    } | null>(null);
    const [step, setStep] = useState<"init" | "scan" | "decide" | "confirm" | "done">("init");
    const [quote, setQuote] = useState<string>("");
    const [txHash, setTxHash] = useState<string>("");
    const [reservesUSD, setReservesUSD] = useState<bigint>();
    const [reservesMXN, setReservesMXN] = useState<bigint>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSwapRequired, setIsSwapRequired] = useState<boolean>(false);
    const [waitingTime, setWaitingTime] = useState<number>(1500);//2 seconds
    const { showToast } = useToast();

    // Helper to resolve token address
    const getTokenAddress = (token: string) => {
        switch (token) {
            case "brl": return BRZ_ADDR!;
            case "mxn": return MXN_ADDR!;
            default: return USD_ADDR!;
        }
    };

    const merchantTokenAddress = payload ? getTokenAddress(payload.token) : undefined;

    const balanceInMerchantsTokenData = useBalance({
        address,
        token: merchantTokenAddress as `0x${string}` | undefined,
    });

    const balanceInUSDData = useBalance({
        address,
        token: USD_ADDR! as `0x${string}` | undefined,
    });

    const {
        data: reservesData,
        isError: reservesIsError,
        isPending: reservesIsPending,
    } = useReadContract({
        address: poolMXNeUSDCAddress as `0x${string}`,
        abi: poolAbi,
        functionName: 'getReserves',
    });

    useEffect(() => {
        if (reservesData) {
            const [r0, r1] = reservesData as [bigint, bigint];
            console.log('reserves r0:', r0, ' r1:', r1);
            setReservesUSD(r0);
            setReservesMXN(r1);
        }
    }, [reservesData]);

    const { data: approveConfig } = useSimulateContract({
        address: USD_ADDR! as `0x${string}`,
        abi: usdcAbi,
        functionName: 'approve',
        args: [poolMXNeUSDCAddress! as `0x${string}`, parseUnits(quote, 6)],
    });
    const { data: transferConfig } = useSimulateContract({
        address: USD_ADDR! as `0x${string}`,
        abi: usdcAbi,
        functionName: 'transfer',
        args: [poolMXNeUSDCAddress! as `0x${string}`, parseUnits(quote, 6)],
    });
    const { data: swapConfig } = useSimulateContract({
        address: poolMXNeUSDCAddress! as `0x${string}`,
        abi: poolAbi,
        functionName: 'swap',
        args: [
            parseUnits("0", 6),                                 // amount0Out = tMXNe amount is output1?
            parseUnits((payload ? +payload?.amount! : 0).toFixed(6), 6), // amount1Out = tMXNe
            address!                           // recipient
        ],
    });
    const { writeContract: swap, isPending: swapIsPending } = useWriteContract();


    // QR decoded
    const handleScan = (detectedCodes: { rawValue: string }[]) => {
        if (detectedCodes.length > 0) {
            const code = detectedCodes[0].rawValue;
            if (code) {
                try {
                    setPayload(JSON.parse(code));
                    setStep("decide");
                } catch (e) {
                    showToast("Invalid QR", "error");
                    setStep("scan");
                }
            }
        }
    };

    //const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({hash,});

    // Decide which path
    const onPay = async () => {
        if (!payload || !address) return;
        setIsLoading(true);
        const { merchant, amount, token, allowFallback } = payload;
        const tokenAddress = getTokenAddress(token);
        try {
            // 1) Direct pay in same token
            let balanceInMerchantsToken = balanceInMerchantsTokenData.data?.formatted;
            console.log("balanceInMerchantsToken", balanceInMerchantsToken);
            if (+balanceInMerchantsToken! >= +amount) {
                //Payment to the merchant
                let fee = rate * Number(amount);
                const amountWithFee = (Number(amount) - fee).toFixed(3);
                console.log(`amountWithFee:${amountWithFee} fee:${fee}`);

                //Payment to rapimoni 
                let balanceAfterPayment = Number(balanceInMerchantsToken) - +amountWithFee;
                let adjustedFee = fee;
                if (balanceAfterPayment < fee) { adjustedFee = balanceAfterPayment; }
                const hashPay = await writeContractsAsync({
                    contracts: [
                        {
                            address: tokenAddress as `0x${string}`,
                            abi: usdcAbi,
                            functionName: 'transfer',
                            args: [
                                mockMerchantAddress as `0x${string}`,
                                +amountWithFee * 1000000,
                                // Optional data
                            ],
                        },
                        {
                            abi: usdcAbi,
                            address: tokenAddress as `0x${string}`,
                            functionName: 'transfer',
                            args: [
                                rapiMoniAddress! as `0x${string}`,
                                adjustedFee * 1000000,
                                // Optional data
                            ],
                        }
                    ],
                });
                console.log("onPay localToken total", hashPay);
                setTxHash(hashPay.id);

                /*const hashPayment = await writeContractAsync({
                    abi: stableTokenAbi,
                    address: tokenAddress as `0x${string}`,
                    functionName: 'transfer',
                    args: [
                        mockMerchantAddress as `0x${string}`, // Replace with recipient's address
                        +amountWithFee * 1000000,          // Example: Transfer X USDC
                        // Optional data
                    ],
                });
                console.log("onPay localToken merchant", hashPayment);
                setTxHash(hashPayment);

                await new Promise(res => setTimeout(res, waitingTime));

                //Payment to rapimoni 
                let balanceAfterPayment = Number(balanceInMerchantsToken) - +amountWithFee;
                let adjustedFee = fee;
                if (balanceAfterPayment < fee) { adjustedFee = balanceAfterPayment; }
                const hashFee = await writeContractAsync({
                    abi: stableTokenAbi,
                    address: tokenAddress as `0x${string}`,
                    functionName: 'transfer',
                    args: [
                        rapiMoniAddress! as `0x${string}`, // Replace with recipient's address
                        adjustedFee * 1000000,          // Example: Transfer X USDC
                        // Optional data
                    ],
                });
                console.log("onPay localToken fee", hashFee);
                setTxHash(hashFee);*/

                setStep("done");
                showToast("Payment done!", "success");
                return;
            }

            // 2) Paying with USD
            let balanceInFallbackToken = balanceInUSDData.data?.formatted;
            console.log("balanceInFallbackToken", balanceInFallbackToken);
            if (+balanceInFallbackToken! < 0) {
                showToast(`Insufficient balance, please add ${token.toUpperCase()} or USD to your wallet and try again later.`, "error");
                return;
            }

            // 2. Compute amountOut via x*y=k => y₂ = reserve1 - k/(reserve0 + amountIn), with r0=USDC, and r1=MXNe
            // amountIn in USDC
            /*let amountOut = 0;
            if (reserves) {
                const [r0, r1] = reserves as [bigint, bigint];
                const amIn = BigInt(Math.floor(amountIn * 1e6)); // 6 decimals
                const k = BigInt(r0) * BigInt(r1);
                const newR0 = BigInt(r0) + amIn;
                const newR1 = k / newR0;
                amountOut = Number((BigInt(r1) - newR1)) / 1e6;
            }*/
            // amountIn in MXN
            let amountOut = 0;
            console.log("reserves", reservesData);
            if (reservesData) {
                const [r0, r1] = reservesData as [bigint, bigint];
                const amIn = BigInt(Math.floor(+amount * 1e6)); // 6 decimals
                const k = BigInt(r0) * BigInt(r1);
                const newR1 = BigInt(r1) + amIn;
                const newR0 = k / newR1;
                amountOut = Number((BigInt(r0) - newR0)) / 1e6;
            }

            const adjustedQuote = `${amountOut}`;
            setQuote(adjustedQuote);

            if (+balanceInFallbackToken! >= amountOut) {
                //Not enough balance in merchants token, but enough in USD
                if (allowFallback) {
                    // 2) Send USD directly
                    setIsSwapRequired(false);
                    /*const hash = await sendUSD(merchant, neededInFallbackToken, address);
                    setTxHash(hash);
                    setStep("done");
                    showToast("Transaction submitted", "success");*/
                } else {
                    // 3) Swap USD to  merchant currency
                    setIsSwapRequired(true);
                }
                setStep("confirm");
                showToast(`Not enough ${token.toUpperCase()} in your wallet. We will use USD instead.`, "info");
                return;
            } else {
                showToast(`Insufficient balance, please add ${token.toUpperCase()} or USD to you wallet and try again later.`, "error");
                return;
            }
        } catch (err: any) {
            console.error("Pay Error onPay:", err);
            // Extract a string error message from the error object
            const errorStr =
                typeof err === "string"
                    ? err
                    : err?.message || err?.reason || JSON.stringify(err);

            if (errorStr.includes("no valid median")) {
                //Trading temporarily paused.  Unable to determine accurately X to USDC exchange rate now. Please try again later.
                showToast(
                    `The oracle for the ${token.toUpperCase()}/USD pair is temporarily not working. Please try again later or use another currency.`,
                    "error"
                );
            } else if (errorStr.includes("cancelled transaction")) {
                showToast(
                    `You rejected the request, please try again when you are ready to make the payment.`,
                    "error"
                );
            } else {
                showToast("An error occurred while processing the payment. Please try again later.", "error");
            }

            if (payload) { setStep("decide"); } else { setStep("scan"); }

        } finally {
            setIsLoading(false);
        }
    };

    // Confirm swap & pay
    const onConfirmSwap = async () => {
        if (!payload || !address) return;
        setIsLoading(true);
        const { merchant, token, amount } = payload;
        const tokenAddress = getTokenAddress(token);
        try {
            if (isSwapRequired) {
                // 3) Swap USD to  merchant currency
                let currentBalance = balanceInUSDData.data?.formatted;
                console.log("currentBalance", currentBalance);
                console.log('reserves usd:', reservesUSD, ' mxn:', reservesMXN);

                /*writeContract(approveConfig!.request);
                await new Promise(r => setTimeout(r, 1500));
                writeContract(transferConfig!.request);
                await new Promise(r => setTimeout(r, 1500));
                swap({
                    address: poolMXNeUSDCAddress as `0x${string}`,
                    abi: poolAbi,
                    functionName: 'swap',
                    args: [
                        parseUnits("0", 6),                                 // amount0Out = tMXNe amount is output1?
                        parseUnits((payload ? +payload?.amount! : 0).toFixed(6), 6), // amount1Out = tMXNe
                        address!                           // recipient
                    ],
                });*/

                console.log('swapping quote:', parseUnits(quote, 6), ' tokenOut:', parseUnits((payload ? +payload?.amount! : 0).toFixed(6), 6));

                //writeContract(transferConfig!.request);
                //await new Promise(r => setTimeout(r, 1500));
                //writeContract(swapConfig!.request);

                /*const hashSwap = await writeContractsAsync({
                    contracts: [
                       
                        {
                            address: USDTokenAddress! as `0x${string}`,
                            abi: usdcAbi,
                            functionName: 'transfer',
                            args: [poolMXNeUSDCAddress! as `0x${string}`, +quote * 1000000 ],
                        },
                        {
                            address: poolMXNeUSDCAddress! as `0x${string}`,
                            abi: poolAbi,
                            functionName: 'swap',
                            args: [
                                parseUnits("0", 6),                                 // amount0Out = tMXNe amount is output1?
                                parseUnits((payload ? +payload?.amount! : 0).toFixed(6), 6), // amount1Out = tMXNe
                                address!                           // recipient
                            ],
                        }
                    ],
                });
                console.log("onSwap localToken total", hashSwap);
                setTxHash(hashSwap.id);*/

                let balanceInMerchantsToken = balanceInMerchantsTokenData.data?.formatted;
                console.log("balanceInMerchantsToken", balanceInMerchantsToken);

                /*
                // 2) Wait a few seconds or for the approval tx
                await new Promise(r => setTimeout(r, 3000));
                writeContract(swapConfig!.request);
                const hashSwap = await writeContractsAsync({
                    contracts: [
                        {
                            address: USDTokenAddress as `0x${string}`,
                            abi: usdcAbi,
                            functionName: 'approve',
                            args: [poolMXNeUSDCAddress! as `0x${string}`, parseUnits(quote, 6)],
                        },
                        {
                            address: poolMXNeUSDCAddress as `0x${string}`,
                            abi: poolAbi,
                            functionName: 'swap',
                            args: [
                                parseUnits("0", 6),                                 // amount0Out = tMXNe amount is output1?
                                parseUnits((payload ? +payload?.amount! : 0).toFixed(6), 6), // amount1Out = tMXNe
                                address!                           // recipient
                            ],
                        }
                    ],
                });
                console.log("onSwap localToken total", hashSwap);*/

                setStep("done");
                showToast("Payment done!", "success");

                //showToast(`Insufficient balance in ${token.toUpperCase()}, please add more USD and try again later.`, "error");

            } else {
                //2) Send USD directly
                //let balanceInFallbackToken = await getBalance(USDTokenAddress!, address);

                //Payment to the merchant
                const fee = rate * Number(quote);
                const quoteWithFee = (Number(quote) - fee).toFixed(3);
                /*const hashPayment = await sendUSD(merchant, quoteWithFee, address);
                //console.log("onSwap USD merchant", hashPayment);
                setTxHash(hashPayment);

                // Wait for the merchant payment to reflect in the balance
                await new Promise(res => setTimeout(res, 1000));
                //await waitForBalance(balanceInFallbackToken);

                //Payment to rapimoni
                const hashFee = await sendUSD(rapiMoniAddress!, `${Number(quote) - Number(quoteWithFee)}`, address);
                //console.log("onSwap USD fee", hashFee);
                setTxHash(hashFee);
*/
                setStep("done");
                showToast("Payment done!", "success");
            }

        } catch (err: any) {
            //console.error("Swap Error onSwap:", err);
            // Extract a string error message from the error object
            const errorStr =
                typeof err === "string"
                    ? err
                    : err?.message || err?.reason || JSON.stringify(err);
            if (errorStr.includes("no valid median")) {
                //Trading temporarily paused.  Unable to determine accurately X to USDC exchange rate now. Please try again later.
                showToast(
                    `The oracle for the ${token.toUpperCase()}/USD pair is temporarily not working . Please try again later or use another currency.`,
                    "error"
                );
            } else {
                showToast("An error occurred while processing the payment. Please try again later.", "error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Load payload from URL if present
    useEffect(() => {
        if (typeof window !== "undefined" && !payload) {
            const params = new URLSearchParams(window.location.search);
            const data = params.get("data");
            if (data) {
                try {
                    const parsed = JSON.parse(decodeURIComponent(data));
                    setPayload(parsed);
                    setStep("decide");
                } catch (e) {
                    // If invalid, stay on scan/init
                    setPayload(null);
                }
            }
        }
    }, []);

    return (
        <div className="min-h-screen text-white flex flex-col items-center px-4 py-12">
            <h1 className="text-3xl font-bold mt-6 mb-6">Pay Now</h1>
            {address ? (
                <>
                    <div className="w-full max-w-md mx-auto p-8 border border-[#264C73] rounded-lg space-y-6 text-center relative">
                        {/* Loading animation overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10 rounded-lg">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                                <p>Processing...</p>
                            </div>
                        )}
                        {/* Stepper UI */}
                        <h2 className="text-2xl font-semibold mb-2">Payment Flow</h2>
                        <div className="h-1 w-16 bg-[#264C73] mx-auto rounded mb-6" />
                        <div className="flex justify-between items-center mb-6">
                            <div className={`flex-1 text-xs ${step === "scan" || step === "init" ? "text-[#50e2c3]" : "text-gray-400"}`}>Scan</div>
                            <div className="w-4 h-0.5 bg-gray-600 mx-1" />
                            <div className={`flex-1 text-xs ${step === "decide" ? "text-[#50e2c3]" : "text-gray-400"}`}>Choose path</div>
                            <div className="w-4 h-0.5 bg-gray-600 mx-1" />
                            <div className={`flex-1 text-xs ${step === "confirm" ? "text-[#50e2c3]" : "text-gray-400"}`}>Confirm</div>
                            <div className="w-4 h-0.5 bg-gray-600 mx-1" />
                            <div className={`flex-1 text-xs ${step === "done" ? "text-[#50e2c3]" : "text-gray-400"}`}>Receipt</div>
                        </div>
                        {/* ...existing code... */}
                        {step === "init" && (
                            <>
                                <br /><span className="text-sm text-[#50e2c3]">(You will need testnet ETH and USDC. Please, get them in the Coinbase faucet.)</span>
                                <br /><Button onClick={() => setStep("scan")} disabled={isLoading} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full">Scan to Pay</Button>
                            </>
                        )}
                        {step === "decide" && payload && (
                            <>
                                <p>
                                    You’ll pay <strong>{payload?.amount} {payload?.token.toLocaleUpperCase()}</strong> {payload?.description ? (<>for {payload?.description}</>) : ("")}
                                </p>
                                <Button onClick={onPay} disabled={isLoading} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full">{`Pay ${payload.amount} ${payload.token.toLocaleUpperCase()}`}</Button>
                            </>
                        )}
                        {step === "confirm" && (
                            <>
                                <p>
                                    You’ll pay <strong>{payload?.amount} {payload?.token.toLocaleUpperCase()}</strong> using <strong>{quote} USD</strong> from your wallet.
                                    {quote && (
                                        <>
                                            <br /><span className="text-xs text-[#50e2c3]">(Rate: 1 USD ≈ {(Number(payload?.amount) / Number(quote)).toFixed(2)} {payload?.token.toLocaleUpperCase()})</span>
                                        </>
                                    )}
                                </p>
                                <Button onClick={onConfirmSwap} disabled={isLoading} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full">Confirm & Pay</Button>
                            </>
                        )}
                        {step === "done" && txHash && (
                            <>
                                <p>🎉 <span className="text-xl text-[#50e2c3]">Congrats!!!</span> 🎉
                                    <br /><br />You paid {quote ? (<>
                                        <strong>{quote} USD</strong> (≈ {payload?.amount} {payload?.token.toLocaleUpperCase()})
                                    </>
                                    ) : (<strong>{payload?.amount} {payload?.token.toLocaleUpperCase()}</strong>)} to the merchant!</p>
                                <Button onClick={() => setStep("init")} disabled={isLoading} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full">New Payment</Button>
                            </>
                        )}
                        {/* Scanner is only shown if step is scan and payload is not set */}
                        {step === "scan" && !payload && (
                            <Scanner onScan={handleScan} onError={() => setStep("init")} />
                        )}
                    </div>
                </>
            ) : (
                <div className="mt-8">
                    <p className="text-lg text-gray-500">
                        Please connect your wallet to scan the QR code and pay.
                    </p>
                </div>
            )}
        </div>
    );
}
