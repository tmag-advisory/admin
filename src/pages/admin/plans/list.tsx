import { useState } from "react";
import { Link } from "react-router-dom";
import { LucideSearch, LucideMapPin, LucideCalendar, LucideChevronRight, LucideUser, LucideLoader2 } from "lucide-react";
import { useMyCompanies, useTravelPlans } from "../../../api/hooks";

const TravelPlans = () => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "COMPLETED" | "PROCESSING" | "PENDING">("all");

    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const companyId = company?.id;

    const { data: plansData, isLoading } = useTravelPlans(
        companyId ? { companyId, per_page: 50, search: search || undefined } : undefined
    );

    const plans = plansData?.data || [];

    const filtered = plans.filter((p) => {
        const matchesSearch =
            p.destination.toLowerCase().includes(search.toLowerCase()) ||
            p.country.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getRiskLabel = (score: number) => {
        if (score <= 1) return "Low";
        if (score === 2) return "Moderate";
        return "High";
    };

    const riskBadge = (risk: string) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
            risk === "Low" ? "bg-accent/10 text-accent" :
            risk === "Moderate" ? "bg-gold/10 text-gold" :
            "bg-red-50 text-red-600"
        }`}>
            {risk} Risk
        </span>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">Travel Plans</h1>
                    <p className="text-sm text-muted mt-1">View and manage all employee travel health plans</p>
                </div>
            </div>

            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by destination, country, or employee..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-button-secondary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(["all", "COMPLETED", "PROCESSING", "PENDING"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                    statusFilter === f ? "bg-dark text-background-primary" : "bg-button-secondary text-muted hover:bg-border-light"
                                }`}
                            >
                                {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <LucideLoader2 className="w-6 h-6 text-accent animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-12 text-center">
                    <div className="w-14 h-14 rounded-full bg-button-secondary flex items-center justify-center mx-auto mb-4">
                        <LucideMapPin className="w-7 h-7 text-muted" />
                    </div>
                    <p className="text-base font-semibold text-heading mb-1">No travel plans found</p>
                    <p className="text-sm text-muted mb-4">Try adjusting your search or filters</p>
                    <p className="text-sm text-muted">Plans can be created by employees through their dashboard or by a support agent.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((plan) => {
                        const riskLabel = getRiskLabel(plan.riskScore);
                        return (
                            <Link
                                key={plan.id}
                                to={`/admin/plans/${plan.id}`}
                                className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-5 hover:border-accent/30 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                            riskLabel === "Low" ? "bg-accent" :
                                            riskLabel === "Moderate" ? "bg-gold" : "bg-red-500"
                                        }`} />
                                        <span className="text-sm font-semibold text-heading">{plan.destination}</span>
                                    </div>
                                    <LucideChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {riskBadge(riskLabel)}
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        plan.status === "COMPLETED" ? "bg-accent/10 text-accent" :
                                        plan.status === "PROCESSING" ? "bg-gold/10 text-gold" :
                                        "bg-button-secondary text-muted"
                                    }`}>
                                        {plan.status.charAt(0) + plan.status.slice(1).toLowerCase()}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <LucideMapPin className="w-3.5 h-3.5" />
                                        {plan.country}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <LucideCalendar className="w-3.5 h-3.5" />
                                        {plan.duration} days
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted">
                                        <LucideUser className="w-3.5 h-3.5" />
                                        {new Date(plan.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TravelPlans;
