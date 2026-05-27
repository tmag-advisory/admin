import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useVerifyCompanyCreditPurchase } from "../../../api/hooks";
import { LucideCheckCircle, LucideXCircle, LucideLoader2 } from "lucide-react";

type PaymentStatus = "verifying" | "success" | "failed";

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<PaymentStatus>("verifying");
    const [creditsPurchased, setCreditsPurchased] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const { mutateAsync: verifyPurchase } = useVerifyCompanyCreditPurchase();
    const hasVerified = useRef(false);

    const txRef = searchParams.get("tx_ref");
    const flwStatus = searchParams.get("status");
    const transactionId = searchParams.get("transaction_id");
    const callbackSuccess = searchParams.get("success");
    const callbackError = searchParams.get("error");

    useEffect(() => {
        if (hasVerified.current) return;

        const verifyPayment = async () => {
            if (!txRef) {
                setStatus("failed");
                setErrorMessage(callbackError || "Missing transaction reference");
                return;
            }

            if (callbackSuccess === "false" || (flwStatus && flwStatus !== "successful" && flwStatus !== "completed")) {
                setStatus("failed");
                setErrorMessage(
                    callbackError ||
                    (flwStatus === "cancelled"
                        ? "Payment was cancelled"
                        : "Payment was not completed")
                );
                return;
            }

            hasVerified.current = true;

            try {
                const result = await verifyPurchase({
                    txRef,
                    transactionId: transactionId || undefined,
                });

                if (result?.success && result?.purchase?.status === "completed") {
                    setCreditsPurchased(result.purchase?.creditsPurchased || 0);
                    setStatus("success");
                } else {
                    setStatus("failed");
                    setErrorMessage(
                        result?.purchase?.failedReason ||
                        (result?.purchase?.status === "failed" ? "Payment failed" : "Payment was not completed")
                    );
                }
            } catch (error: unknown) {
                const apiError = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
                setStatus("failed");
                setErrorMessage(
                    apiError?.response?.data?.error ||
                    apiError?.response?.data?.message ||
                    "Failed to verify payment"
                );
            }
        };

        verifyPayment();
    }, [txRef, flwStatus, transactionId, callbackSuccess, callbackError, verifyPurchase]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                {status === "verifying" && (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                            <LucideLoader2 className="w-7 h-7 text-accent animate-spin" />
                        </div>
                        <h1 className="text-2xl font-serif text-heading mb-3">
                            Verifying payment
                        </h1>
                        <p className="text-sm text-muted mb-4">
                            Please wait while we confirm your transaction...
                        </p>
                        {txRef && (
                            <p className="text-xs text-muted font-mono">
                                Ref: {txRef}
                            </p>
                        )}
                    </div>
                )}

                {status === "success" && (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6">
                            <LucideCheckCircle className="w-7 h-7 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-serif text-heading mb-3">
                            Payment successful
                        </h1>
                        <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-6 mb-6">
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                Credits added
                            </p>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-accent tabular-nums">
                                +{creditsPurchased}
                            </p>
                        </div>
                        <p className="text-sm text-muted mb-6">
                            Your credits have been added to your company account.
                        </p>
                        <Link
                            to="/admin/credits"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
                        >
                            Back to Credits
                        </Link>
                    </div>
                )}

                {status === "failed" && (
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
                            <LucideXCircle className="w-7 h-7 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-serif text-heading mb-3">
                            Payment failed
                        </h1>
                        <p className="text-sm text-muted mb-2">
                            {errorMessage || "We couldn't verify your payment. Please try again."}
                        </p>
                        {txRef && (
                            <p className="text-xs text-muted font-mono mb-6">
                                Ref: {txRef}
                            </p>
                        )}
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/admin/credits"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
                            >
                                Try Again
                            </Link>
                            <Link
                                to="/admin"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-button-secondary text-heading font-semibold text-sm hover:bg-border-light transition-colors"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;
