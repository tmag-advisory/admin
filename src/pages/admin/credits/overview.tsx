import { Link } from "react-router-dom";
import { LucideCoins, LucideFileText, LucideArrowRight, LucideLoader2, LucideCreditCard } from "lucide-react";
import { useMyCompanies, useCompanyAdminPurchaseCredits, useCompanyAdminCreditQuote, useCredits, useCompanySettings } from "../../../api/hooks";
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import LaunchDiscountBanner from "../../../components/LaunchDiscountBanner";

type Quotes = {
    currencySymbol: string;
    basePrice: number;
    discountAmount: number;
    totalAmount: number;
    originalTotalAmount?: number | null;
    launchDiscountAmount?: number | null;
};

const Credits = () => {
    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const companyId = company?.id;

    const { data: settingsData } = useCompanySettings(companyId ?? 0);
    const billingCurrency = (settingsData?.settings?.pref_currency?.value as string) || "NGN";

    const { data: creditsData, isLoading } = useCredits(companyId ? { companyId, per_page: 10 } : undefined);
    const purchaseCredits = useCompanyAdminPurchaseCredits();
    const getQuote = useCompanyAdminCreditQuote();

    const companyTotals = company as
        | { total_credits?: number; used_credits?: number; totalCredits?: number; usedCredits?: number }
        | undefined;
    const totalCredits = Number(companyTotals?.total_credits ?? companyTotals?.totalCredits ?? 0);
    const usedCredits = Number(companyTotals?.used_credits ?? companyTotals?.usedCredits ?? 0);
    const remainingCredits = Math.max(totalCredits - usedCredits, 0);

    const transactions = creditsData?.data || [];

    const [quotes, setQuotes] = useState<Record<number, Quotes>>({});
    const creditPackages = useMemo(() => [50, 100, 200], []);

    useEffect(() => {
        if (!companyId) return;
        creditPackages.forEach(async (credits) => {
            try {
                const quote = await getQuote.mutateAsync({ companyId, credits });
                setQuotes((prev) => ({ ...prev, [credits]: quote }));
            } catch (err) {
                console.error(`Failed to fetch quote for ${credits} credits`, err);
            }
        });
    }, [companyId, billingCurrency, creditPackages]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePurchase = async (credits: number) => {
        if (!companyId) return;
        try {
            const result = await purchaseCredits.mutateAsync({ credits, companyId });
            if (result?.paymentLink) {
                window.location.href = result.paymentLink;
            } else {
                toast.error("No payment link received");
            }
        } catch (err) {
            if (err instanceof AxiosError) {
                toast.error(err.response?.data?.error || err.response?.data?.message || "Purchase failed");
            } else {
                toast.error("Purchase failed");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">Credits & Billing</h1>
                    <p className="text-sm text-muted mt-1">Manage your company&apos;s credit balance and billing</p>
                </div>
                <Link
                    to="/admin/credits/invoices"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-sm font-medium text-heading hover:border-accent/50 transition-colors"
                >
                    <LucideFileText className="w-4 h-4" />
                    View Invoices
                </Link>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                            Total Credits
                        </span>
                        <LucideCoins className="w-5 h-5 text-muted" />
                    </div>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-heading tabular-nums">{isLoading ? "—" : totalCredits}</p>
                </div>

                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                            Used
                        </span>
                        <LucideCoins className="w-5 h-5 text-muted" />
                    </div>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-heading tabular-nums">{isLoading ? "—" : usedCredits}</p>
                </div>

                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                            Remaining
                        </span>
                        <LucideCoins className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-serif text-accent tabular-nums">{isLoading ? "—" : remainingCredits}</p>
                </div>
            </div>

            {/* Purchase Credits */}
            <LaunchDiscountBanner variant="page" className="mb-4" />
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-6">
                <h2 className="text-base font-semibold text-heading mb-4">Purchase Credits</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {creditPackages.map((credits, idx) => {
                        const quote = quotes[credits];
                        const isPopular = idx === 1;
                        return (
                            <div
                                key={credits}
                                className={`relative p-6 rounded-xl border-2 transition-colors ${isPopular
                                        ? "border-accent bg-accent/5"
                                        : "border-border-light hover:border-accent/50"
                                    }`}
                            >
                                {isPopular && (
                                    <span className="absolute -top-2 right-4 px-2 py-0.5 bg-dark text-background-primary text-xs font-semibold rounded-full">
                                        Popular
                                    </span>
                                )}
                                <div className="text-2xl sm:text-3xl font-serif text-heading tabular-nums mb-2">{credits}</div>
                                <div className="text-sm text-muted mb-4">credits</div>
                                {quote ? (
                                    <>
                                        <div className="text-2xl font-semibold text-heading mb-1">
                                            {quote.currencySymbol}{quote.totalAmount.toLocaleString()}
                                        </div>
                                        {(quote.launchDiscountAmount && quote.launchDiscountAmount > 0)
                                            ? (
                                                <div className="text-xs text-emerald-700 mb-2">
                                                    <span className="line-through text-muted mr-1">
                                                        {quote.currencySymbol}{Number(quote.originalTotalAmount ?? 0).toLocaleString()}
                                                    </span>
                                                    Launch discount applied
                                                </div>
                                            )
                                            : quote.discountAmount > 0 && (
                                                <div className="text-xs text-muted line-through mb-2">
                                                    {quote.currencySymbol}{quote.basePrice}
                                                </div>
                                            )}
                                    </>
                                ) : (
                                    <div className="h-8 mb-4 flex items-center">
                                        <LucideLoader2 className="w-4 h-4 text-muted animate-spin" />
                                    </div>
                                )}
                                <button
                                    onClick={() => handlePurchase(credits)}
                                    disabled={purchaseCredits.isPending || !quote}
                                    className="w-full py-2.5 cursor-pointer rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {purchaseCredits.isPending ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : <LucideCreditCard className="w-4 h-4" />}
                                    Pay Now
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light/50 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-heading">Recent Transactions</h2>
                    <button className="text-sm text-accent font-medium hover:underline flex items-center gap-1">
                        View All
                        <LucideArrowRight className="w-4 h-4" />
                    </button>
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-background-primary border-b border-border-light/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                    Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light/50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-background-primary/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-heading">{tx.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`text-sm font-semibold ${tx.amount > 0 ? "text-green-600" : "text-heading"
                                                }`}
                                        >
                                            {tx.amount > 0 ? "+" : ""}
                                            {tx.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-muted">
                                            {tx.reference || "Credit transaction"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                            Completed
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <p className="text-sm text-muted">No transactions yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Credits;
