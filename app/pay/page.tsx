"use client";

import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { useToast } from "@/components/ui/toastprovider";
import stableTokenAbiJson from "@/lib/usdc-abi.json";
import {  formatUnits } from "viem";

const rate = Number(process.env.NEXT_PUBLIC_EQUIPAY_FEE); // Fee rate charged per payment
const rapiMoniAddress = process.env.NEXT_PUBLIC_RAPIMONI_WALLET; // wallet address for collecting fees

const USDTokenAddress = process.env.NEXT_PUBLIC_USD_ADDRESS; // Testnet
const MXNTokenAddress = process.env.NEXT_PUBLIC_MXN_ADDRESS; // Testnet
const BRZTokenAddress = process.env.NEXT_PUBLIC_BRZ_ADDRESS; // Testnet

export default function PayPage() {
    const client = usePublicClient();
    const stableTokenAbi = stableTokenAbiJson.abi;
    const { address } = useAccount();
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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSwapRequired, setIsSwapRequired] = useState<boolean>(false);
    const [waitingTime, setWaitingTime] = useState<number>(1500);//2 seconds
    const { showToast } = useToast();

    // Helper to resolve token address
    const getTokenAddress = (token: string) => {
        switch (token) {
            case "brl": return BRZTokenAddress!;
            case "mxn": return MXNTokenAddress!;
            default: return USDTokenAddress!;
        }
    };

    const getBalance = async (token: string, account: `0x${string}`) => {
        let decimals = 18;
        if (token === process.env.NEXT_PUBLIC_USDC_ADDRESS!) { decimals = 6; }
        const bal: any = useReadContract({
            address: token as `0x${string}`,
            abi: stableTokenAbi,
            functionName: "balanceOf",
            args: [account],
        });

        return formatUnits(bal as bigint, decimals).toString();
    };

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

    // Decide which path
    const onPay = async () => {
        if (!payload || !address) return;
        setIsLoading(true);
        const { merchant, amount, token, allowFallback } = payload;
        const tokenAddress = getTokenAddress(token);
        try {
            // 1) Direct pay in same token
            let balanceInMerchantsToken = await getBalance(tokenAddress, address);
            console.log("balanceInMerchantsToken", balanceInMerchantsToken);
            if (+balanceInMerchantsToken >= +amount) {
                //Payment to the merchant
                let fee = rate * Number(amount);
                const amountWithFee = (Number(amount) - fee).toFixed(3);
                /*const hash = await sendERC20(tokenAddress, merchant, amountWithFee, address);
                //console.log("onPay localToken merchant", hash);
                setTxHash(hash);

                await new Promise(res => setTimeout(res, waitingTime));

                //Payment to rapimoni 
                let balanceAfterPayment = Number(balanceInMerchantsToken) - +amountWithFee;
                let adjustedFee = fee;
                if (balanceAfterPayment < fee) { adjustedFee = balanceAfterPayment; }
                const hashFee = await sendERC20(tokenAddress, rapiMoniAddress!, `${adjustedFee}`, address);
                //console.log("onPay localToken fee", hashFee);
                setTxHash(hashFee);
                */

                setStep("done");
                showToast("Payment done!", "success");
                return;
            }

            // 2) Paying with USD
            let balanceInFallbackToken = await getBalance(USDTokenAddress!, address);
            if (+balanceInFallbackToken < 0) {
                showToast(`Insufficient balance, please add ${token.toUpperCase()} or USD to your wallet and try again later.`, "error");
                return;
            }

            const adjustedQuote = amount;
            setQuote(adjustedQuote);
            if (+balanceInFallbackToken >= +adjustedQuote) {
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
            //console.error("Pay Error onPay:", err);
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
            } else {
                showToast("An error occurred while processing the payment. Please try again later.", "error");
            }
            setStep("scan");
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
                const currentBalance = await getBalance(tokenAddress, address);
                showToast(`Insufficient balance in ${token.toUpperCase()}, please add more USD and try again later.`, "error");

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
                                <Button onClick={onPay} title={`Pay ${payload.amount} ${payload.token.toLocaleUpperCase()}`} disabled={isLoading} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full" />
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
                                <Button onClick={onConfirmSwap} title="Confirm & Pay" disabled={isLoading} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full" />
                            </>
                        )}
                        {step === "done" && txHash && (
                            <>
                                <p>🎉 <span className="text-xl text-[#50e2c3]">Congrats!!!</span> 🎉
                                    <br /><br />You paid {quote ? (<>
                                        <strong>{quote} USD</strong> (≈ {payload?.amount} {payload?.token.toLocaleUpperCase()})
                                    </>
                                    ) : (<strong>{payload?.amount} {payload?.token.toLocaleUpperCase()}</strong>)} to the merchant!</p>
                                <Button onClick={() => setStep("init")} title="New Payment" disabled={isLoading} className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full" />
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
