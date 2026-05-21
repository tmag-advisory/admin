import { lazy, Suspense } from "react";
import { LucideUsers, LucideCoins, LucideFileText, LucideClipboardCheck, LucideArrowRight, LucideLoader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMyCompanies, useEmployees, useTravelPlans, useCreditRequests, useCompanyCreditHistory, useDashboardAnalytics } from "../../api/hooks";

const DashboardAnalyticsCharts = lazy(() => import("../../components/admin/DashboardAnalyticsCharts"));

const ChartLoadingFallback = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {[1, 2].map((i) => (
            <div
                key={i}
                className="bg-white rounded-2xl border border-border-light/50 p-8 flex items-center justify-center min-h-[280px]"
            >
                <LucideLoader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        ))}
    </div>
);

const Dashboard = () => {
    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const companyId = company?.id;

    const { data: employeesData, isLoading: employeesLoading } = useEmployees(
        companyId ? { companyId, per_page: 100 } : undefined
    );
    const { data: plansData, isLoading: plansLoading } = useTravelPlans(
        companyId ? { companyId, per_page: 100 } : undefined
    );
    const { data: requestsData, isLoading: requestsLoading } = useCreditRequests(
        companyId ? { companyId } : undefined
    );
    const { data: creditPurchases } = useCompanyCreditHistory(companyId);
    const { data: dashboardAnalytics, isLoading: analyticsLoading } = useDashboardAnalytics(companyId);

    const totalEmployees = employeesData?.pagination.total ?? 0;
    const totalCredits = company?.total_credits ?? 0;
    const usedCredits = company?.used_credits ?? 0;
    const remainingCredits = totalCredits - usedCredits;
    const activePlans = plansData?.data.filter(p => p.status === "COMPLETED" || p.status === "PROCESSING").length ?? 0;
    const pendingRequests = requestsData?.data.filter(r => r.status === "PENDING").length ?? 0;

    // Build recent activity from real data
    const planActivities = (plansData?.data ?? []).map((p) => ({
        action: `Travel plan created for ${p.destination}`,
        user: p.country,
        time: new Date(p.createdAt).toLocaleDateString(),
        sortDate: new Date(p.createdAt).getTime(),
        type: "plan" as const,
    }));
    const requestActivities = (requestsData?.data ?? []).map((r) => ({
        action: `Credit request ${r.status?.toLowerCase()}: ${r.creditsRequested} credits`,
        user: r.reason || "",
        time: r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : new Date(r.createdAt).toLocaleDateString(),
        sortDate: new Date(r.submittedAt || r.createdAt).getTime(),
        type: "request" as const,
    }));
    const purchaseActivities = (creditPurchases ?? []).map((p) => ({
        action: `Credit purchase: ${p.creditsPurchased} credits`,
        user: `${p.currencySymbol || "$"}${(p.amountPaid || p.amount).toLocaleString()}`,
        time: new Date(p.paidAt || p.createdAt).toLocaleDateString(),
        sortDate: new Date(p.paidAt || p.createdAt).getTime(),
        type: "billing" as const,
    }));
    const recentActivity = [...planActivities, ...requestActivities, ...purchaseActivities]
        .sort((a, b) => b.sortDate - a.sortDate)
        .slice(0, 5);

    const stats = [
        { label: "Total Team Members", value: totalEmployees, icon: LucideUsers, href: "/admin/team", loading: employeesLoading },
        { label: "Credits Remaining", value: remainingCredits, icon: LucideCoins, href: "/admin/credits", loading: false },
        { label: "Active Travel Plans", value: activePlans, icon: LucideFileText, href: "/admin/plans", loading: plansLoading },
        { label: "Pending Requests", value: pendingRequests, icon: LucideClipboardCheck, href: "/admin/requests", loading: requestsLoading },
    ];


    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">
                    Dashboard
                </h1>
                <p className="text-sm text-muted mt-1">
                    Overview of your company&apos;s travel health management
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        to={stat.href}
                        className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-4 sm:p-6 flex flex-col gap-3 hover:border-accent/30 transition-colors duration-150"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                                {stat.label}
                            </span>
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                {stat.loading ? (
                                    <LucideLoader2 className="w-4 h-4 text-accent animate-spin" />
                                ) : (
                                    <stat.icon className="w-4 h-4 text-accent" />
                                )}
                            </div>
                        </div>
                        <span className="text-2xl sm:text-3xl font-serif text-heading tabular-nums">
                            {stat.loading ? "—" : stat.value}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1">
                            View <LucideArrowRight className="w-3 h-3" />
                        </span>
                    </Link>
                ))}
            </div>

            <Suspense fallback={<ChartLoadingFallback />}>
                <DashboardAnalyticsCharts data={dashboardAnalytics} isLoading={analyticsLoading} />
            </Suspense>

            {/* Quick Actions */}
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-6">
                <h2 className="text-base font-semibold text-heading mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link
                        to="/admin/team/invite"
                        className="p-4 rounded-xl border border-border-light/50 bg-background-primary/30 hover:border-accent/40 transition-colors duration-150"
                    >
                        <p className="text-sm font-semibold text-heading">Invite Team Members</p>
                        <p className="text-xs text-muted mt-1">Add new employees to your company</p>
                    </Link>
                    <Link
                        to="/admin/credits"
                        className="p-4 rounded-xl border border-border-light/50 bg-background-primary/30 hover:border-accent/40 transition-colors duration-150"
                    >
                        <p className="text-sm font-semibold text-heading">Purchase Credits</p>
                        <p className="text-xs text-muted mt-1">Add credits to your balance</p>
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-light/50">
                    <h2 className="text-base font-semibold text-heading">Recent Activity</h2>
                </div>
                <div className="divide-y divide-border-light/50">
                    {recentActivity.map((activity, i) => (
                        <div
                            key={i}
                            className="px-4 sm:px-6 py-4 flex items-center justify-between gap-3 hover:bg-background-secondary/50 transition-colors duration-150"
                        >
                            <div>
                                <p className="text-sm font-medium text-heading">{activity.action}</p>
                                <p className="text-xs text-muted mt-0.5">{activity.user}</p>
                            </div>
                            <span className="text-xs text-muted">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
