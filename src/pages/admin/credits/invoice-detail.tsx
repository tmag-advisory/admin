import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LucideArrowLeft, LucideLoader2, LucideFileText, LucideDownload } from "lucide-react";
import { useInvoice, useMyCompanies } from "../../../api/hooks";
import api from "../../../api/axios";
import LaunchDiscountBanner from "../../../components/LaunchDiscountBanner";

const InvoiceDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { data: invoice, isLoading, error } = useInvoice(Number(id));
    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const [downloading, setDownloading] = useState(false);

    const currencySymbol = invoice?.currency === "NGN" ? "₦" : invoice?.currency === "EUR" ? "€" : invoice?.currency === "GBP" ? "£" : "$";

    const handleDownloadPdf = async () => {
        if (!invoice || downloading) return;
        
        setDownloading(true);
        try {
            const response = await api.get(`/invoices/${invoice.id}/pdf`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `INV-${invoice.id.toString().padStart(6, "0")}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download PDF:", err);
        } finally {
            setDownloading(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LucideLoader2 className="w-8 h-8 text-accent animate-spin mb-3" />
                <p className="text-sm text-muted">Loading invoice...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LucideFileText className="w-12 h-12 text-muted mb-3" />
                <p className="text-lg font-serif text-heading mb-2">Invoice not found</p>
                <p className="text-sm text-muted mb-4">The invoice you're looking for doesn't exist.</p>
                <Link
                    to="/admin/credits/invoices"
                    className="px-4 py-2 bg-dark text-background-primary rounded-xl text-sm font-semibold hover:bg-darkest transition-colors duration-200"
                >
                    Back to Invoices
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Link to="/admin/credits/invoices" className="p-2 rounded-xl hover:bg-white transition-colors">
                        <LucideArrowLeft className="w-5 h-5 text-muted" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">Invoice details</h1>
                        <p className="text-sm text-muted mt-1">Invoice #{invoice.id}</p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-dark text-background-primary rounded-xl text-sm font-semibold hover:bg-darkest transition-colors duration-200 disabled:opacity-50"
                >
                    {downloading ? (
                        <LucideLoader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <LucideDownload className="w-4 h-4" />
                    )}
                    {downloading ? "Downloading..." : "Download PDF"}
                </button>
            </div>

            <LaunchDiscountBanner variant="page" />

            {/* Invoice Card */}
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                {/* Invoice Header */}
                <div className="p-8 pb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs text-muted tracking-widest uppercase">Travel Medicine</p>
                            <h2 className="text-3xl font-serif text-accent">TMAG</h2>
                            <p className="text-xs text-muted tracking-widest uppercase">Global Advisory</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-4xl font-serif text-heading">INVOICE</h2>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <p className="text-sm text-body">www.tmag.com</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-heading">INV-{invoice.id.toString().padStart(6, "0")}</p>
                        </div>
                    </div>

                    {/* Teal accent bar */}
                    <div className="h-1 bg-accent rounded-full mb-6" />
                </div>

                {/* Bill To + Info */}
                <div className="px-8 pb-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs font-bold text-heading uppercase tracking-wider mb-2">Bill To</p>
                            <p className="text-lg font-semibold text-heading">{company?.name || "Customer"}</p>
                            {invoice.companyId && (
                                <p className="text-xs text-muted mt-1">Company #{invoice.companyId}</p>
                            )}
                        </div>
                        <div className="text-right space-y-1">
                            <div className="flex items-center justify-end gap-4 text-sm">
                                <span className="text-muted">Invoice Date</span>
                                <span className="font-semibold text-heading w-28">{formatDate(invoice.issuedAt)}</span>
                            </div>
                            {invoice.dueDate && (
                                <div className="flex items-center justify-end gap-4 text-sm">
                                    <span className="text-muted">Due Date</span>
                                    <span className="font-semibold text-heading w-28">{formatDate(invoice.dueDate)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-end gap-4 text-sm">
                                <span className="text-muted">Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                    invoice.status?.toLowerCase() === "paid" 
                                        ? "bg-accent/10 text-accent" 
                                        : "bg-gold/10 text-gold"
                                }`}>
                                    {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1).toLowerCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="px-8 pb-6">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-background-primary">
                                <th className="text-left py-3 px-3 text-xs font-bold text-heading uppercase tracking-wider rounded-l-lg">Description</th>
                                <th className="text-center py-3 px-3 text-xs font-bold text-heading uppercase tracking-wider">Qty</th>
                                <th className="text-right py-3 px-3 text-xs font-bold text-heading uppercase tracking-wider">Unit Price</th>
                                <th className="text-right py-3 px-3 text-xs font-bold text-heading uppercase tracking-wider rounded-r-lg">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-border-light">
                                <td className="py-4 px-3">
                                    <p className="font-semibold text-heading">{invoice.description || "Credit Purchase"}</p>
                                    <p className="text-xs text-muted mt-0.5">TMAG Platform Credits</p>
                                </td>
                                <td className="py-4 px-3 text-center text-heading">1</td>
                                <td className="py-4 px-3 text-right font-semibold text-heading">{currencySymbol}{(invoice.amount).toLocaleString()}</td>
                                <td className="py-4 px-3 text-right font-bold text-heading">{currencySymbol}{(invoice.amount).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="px-8 pb-6">
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-body">Subtotal</span>
                                <span className="text-heading">{currencySymbol}{(invoice.amount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-body">Tax (0%)</span>
                                <span className="text-heading">{currencySymbol}0.00</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t-2 border-heading pt-2 mt-2">
                                <span className="text-heading">TOTAL</span>
                                <span className="text-accent">{currencySymbol}{(invoice.amount).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment + Transaction Details */}
                <div className="px-8 pb-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs font-bold text-heading uppercase tracking-wider mb-2">Payment</p>
                            <p className="text-sm text-body">Method: {invoice.paymentMethod || "Online Payment"}</p>
                            <p className="text-sm text-body">Currency: {invoice.currency || "USD"}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-heading uppercase tracking-wider mb-2">Transaction</p>
                            <p className="text-sm text-body">Invoice #{invoice.id}</p>
                            <p className="text-sm text-body">Created: {formatDateTime(invoice.createdAt)}</p>
                            {invoice.paidAt && <p className="text-sm text-body">Paid: {formatDateTime(invoice.paidAt)}</p>}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-background-primary">
                    <div className="h-1 bg-accent rounded-b-xl" />
                    <div className="px-8 py-6">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-xl font-serif text-accent">Thank you for your business</p>
                                <p className="text-xs text-muted mt-1">Travel Medicine Advisory Global</p>
                                <p className="text-xs text-muted">Professional travel health solutions</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted">Questions? Contact</p>
                                <p className="text-sm font-semibold text-heading">support@tmag.com</p>
                                <p className="text-xs text-muted">www.tmag.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back button */}
            <Link
                to="/admin/credits/invoices"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border-light rounded-xl text-sm font-medium text-heading hover:bg-white transition-colors"
            >
                <LucideArrowLeft className="w-4 h-4" />
                Back to Invoices
            </Link>
        </div>
    );
};

export default InvoiceDetail;
