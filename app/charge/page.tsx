"use client";

import { useState, useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useToast } from "@/components/ui/toastprovider";

const USDTokenAddress = process.env.NEXT_PUBLIC_USD_ADDRESS; // Testnet
const MXNTokenAddress = process.env.NEXT_PUBLIC_MXN_ADDRESS; // Testnet
const BRZTokenAddress = process.env.NEXT_PUBLIC_BRZ_ADDRESS; // Testnet
const rate = Number(process.env.NEXT_PUBLIC_RAPIMONI_FEE); // Fee rate charged bu EuiPay per payment

export default function SellPage() {
    const [mounted, setMounted] = useState(false);
    const { address } = useAccount();
    const [amount, setAmount] = useState("");
    const [token, setToken] = useState("mxn");
    const [description, setDescription] = useState("");
    const [allowFallback, setAllowFallback] = useState(false);
    const [quote, setQuote] = useState<string>("");
    const qrRef = useRef<HTMLDivElement>(null);
    const qrInstance = useRef<QRCodeStyling | null>(null);
    const [fee, setFee] = useState(0);
    const [feeUsd, setFeeUsd] = useState(0);
    const [fiat, setFiat] = useState("$");
    const [payload, setPayload] = useState("");
    const [link, setLink] = useState("");
    const [copied, setCopied] = useState(false);
    const { showToast } = useToast();

    // Helper to resolve token address
    const getTokenAddress = (token: string) => {
        switch (token) {
            case "brl": return BRZTokenAddress!;
            case "mxn": return MXNTokenAddress!;
            default: return USDTokenAddress!;
        }
    };

    // Update subtotals and payload
    useEffect(() => {
        if (amount && !isNaN(Number(amount))) {

            let symbol = "MXNe";
            let fiat = "$";
            let name = "MXN";
            let decimals = 2;
            if (token === "mxn") {
                symbol = "MXNe"; fiat = "MXN$"; name = "MXN"; decimals = 2;
            } else if (token === "brl") {
                symbol = "BRZ"; fiat = "R$"; name = "BRL"; decimals = 2;
            }
            setFee(rate * Number(amount));
            setFeeUsd(0);
            setFiat(fiat);

        } else {
            setQuote("");
        }
    }, [amount, token, allowFallback]);

    // Copy link handler
    const handleCopy = () => {
        if (link) {
            navigator.clipboard.writeText(link);
            setCopied(true);
            showToast("Copied to clipboard", "success");
            setTimeout(() => setCopied(false), 1500);
        }
    };

    // Only render after mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Init QR once
    useEffect(() => {
        console.log(`Updating payload qrRef:${qrRef.current} qrInstance:${qrInstance.current} mounted:${mounted}`);
        if (mounted && qrRef.current && !qrInstance.current) {
            const qr = new QRCodeStyling({ width: 256, height: 256, data: "" });
            qrRef.current.innerHTML = "";
            qr.append(qrRef.current);
            qrInstance.current = qr;
        }
    }, [mounted]);

    // Update payload whenever inputs change
    useEffect(() => {
        console.log(`Updating payload qrInstance:${qrInstance.current} amount:${amount} token:${token} description:${description} allowFallback:${allowFallback} address:${address}`);
        if (qrInstance.current && amount && address) {
            const payload = {
                merchant: address,
                amount,
                token,
                description,
                allowFallback,
            };
            setLink(
                `${typeof window !== "undefined" ? window.location.origin : ""}/pay?data=${encodeURIComponent(
                    JSON.stringify(payload)
                )}`
            );
            setPayload(JSON.stringify(payload, null, 2));
            qrInstance.current.update({
                data: JSON.stringify(payload),
            });
        } else {
            setPayload("");
            setLink("");
        }
    }, [amount, token, description, allowFallback, address]);

    return (
        <div className="min-h-screen text-white flex flex-col items-center px-4 py-12">
            <h1 className="text-3xl font-bold mb-6 mt-6">Charge Now</h1>
            {mounted && address ? (
                <>
                    <div className="w-full max-w-md mx-auto p-8 border border-[#264C73] rounded-lg shadow-lg space-y-6 text-center">
                        <h2 className="text-2xl font-semibold mb-2">Payment Details</h2>
                        <div className="h-1 w-16 bg-[#264C73] mx-auto rounded mb-6" />
                        {/* Grouped Card for Inputs */}
                        <div className="p-6 space-y-4 mb-4">
                            <Input
                                type="number"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-3 rounded-md border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#50e2c3]"
                            />
                            <Input
                                type="string"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-3 rounded-md border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#50e2c3]"
                            />
                            <select
                                className="w-full p-3 rounded-md border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#50e2c3]"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                            >
                                <option value="brl">BRL</option>
                                <option value="mxn">MXN</option>
                                <option value="usd">USD</option>
                            </select>
                            <label className="inline-flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={allowFallback}
                                    onChange={e => setAllowFallback(e.target.checked)}
                                />
                                <span>USD fallback <span className="text-sm text-[#50e2c3]">(Receive USD if customer doesn't have local currency)</span></span>
                            </label>
                        </div>
                        {/* Subtotal */}
                        {amount && !isNaN(Number(amount)) && (
                            <div className="text-lg font-medium text-[#50e2c3] mb-2">
                                You will receive {fiat}{(Number(amount) - fee).toFixed(2)}* {quote && (
                                    <>
                                        (≈ $USD {(Number(quote) - feeUsd).toFixed(2)})
                                        <br /><span className="text-xs text-white">($USD 1  ≈ {fiat}{(Number(amount) / Number(quote)).toFixed(2)})</span>
                                    </>
                                )}
                                <br /><span className="text-xs text-white">*Including 1% fee of {fiat}{(Number(fee)).toFixed(2)} {quote && (`(≈ $USD ${(Number(feeUsd)).toFixed(2)})`)}</span>
                            </div>
                        )}
                        {/* QR and Copy Link */}
                        <div className="flex flex-col items-center space-y-2 mt-6">
                            <div ref={qrRef} className="mb-2" />
                            {link && (
                                <Button
                                    title={copied ? "Copied!" : "Copy payment link"}
                                    onClick={handleCopy}
                                    variant="default"
                                    size="sm"
                                    className="mt-2 bg-[#264C73] hover:bg-[#50e2c3] text-white hover:text-gray-900 rounded-full"
                                />
                            )}
                        </div>
                        {/* JSON Preview */}
                        {payload && (
                            <div className="bg-gray-900 rounded-md p-4 mt-4 text-left text-xs text-gray-300 overflow-x-auto">
                                <div className="font-bold text-yellow-400 mb-1">Payment Payload Preview</div>
                                <pre>{payload}</pre>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="mt-8">
                    <p className="text-lg text-gray-500">
                        Please connect your wallet to generate the payment QR code.
                    </p>
                </div>
            )}
        </div>
    );
}
