import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    LucideBuilding2,
    LucideUsers,
    LucideCoins,
    LucideFileText,
    LucideClipboardList,
    LucideBarChart3,
    LucideSettings,
    LucideShield,
    LucideKey,
    LucideLayoutDashboard,
    LucideLogOut,
    LucideX,
    LucideBriefcase,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMobileSidebar } from "../../context/MobileSidebarContext";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";
import { useCompanyPlans, useMyCompanies } from "../../api/hooks";
import { useMemo } from "react";

const navItems = [
    { label: "Dashboard", href: "/admin", icon: LucideLayoutDashboard, end: true },
    { label: "Company Profile", href: "/admin/company", icon: LucideBuilding2 },
    { label: "Team Members", href: "/admin/team", icon: LucideUsers },
    { label: "Employees", href: "/admin/employees", icon: LucideBriefcase },
    { label: "Credits & Billing", href: "/admin/credits", icon: LucideCoins },
    { label: "Travel Plans", href: "/admin/plans", icon: LucideFileText },
    { label: "Credit Requests", href: "/admin/requests", icon: LucideClipboardList },
    { label: "Reports", href: "/admin/reports", icon: LucideBarChart3 },
    { label: "Audit Log", href: "/admin/audit", icon: LucideShield },
    { label: "API Keys", href: "/admin/api-keys", icon: LucideKey },
    { label: "Settings", href: "/admin/settings", icon: LucideSettings },
];

const AdminSidebar = () => {
    const { open, setOpen } = useMobileSidebar();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { data: myCompanies } = useMyCompanies();
    const { data: plans } = useCompanyPlans();
    const companyPlan = myCompanies?.[0]?.plan?.toLowerCase();

    const activePlan = useMemo(() => {
        if (!companyPlan || !plans) return null;
        return plans.find((plan) => plan.code.toLowerCase() === companyPlan) || null;
    }, [companyPlan, plans]);

    const hasDiamondApiAccess = useMemo(() => activePlan?.serviceLevel === "PREMIUM", [activePlan]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate("/auth/login");
        } catch {
            toast.error("Logout failed");
        }
    };

    const nav = (
        <>
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/6">
                <Link
                    to="/admin"
                    className="flex flex-col gap-0.5"
                    onClick={() => setOpen(false)}
                >
                    <span className="text-xl font-serif font-medium tracking-tight text-white">
                        TMAG
                    </span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">
                        Company admin
                    </span>
                </Link>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors duration-150 cursor-pointer"
                >
                    <LucideX className="w-4 h-4 text-white/50" />
                </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems
                    .filter((item) => item.href !== "/admin/api-keys" || hasDiamondApiAccess)
                    .map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.end}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-white/45 hover:text-white hover:bg-white/4",
                                )
                            }
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            {item.label}
                        </NavLink>
                    ))}
            </nav>

            <div className="px-4 py-4 border-t border-white/6">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white/70 font-serif">
                        {(user?.name ?? "A").charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.name || "Admin"}
                        </p>
                        <p className="text-xs text-white/30 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/4 transition-colors duration-150 cursor-pointer"
                >
                    <LucideLogOut className="w-4 h-4" />
                    Sign out
                </button>
            </div>
        </>
    );

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen w-64 bg-darkest text-white flex flex-col z-50 transition-transform duration-300",
                    open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                )}
            >
                {nav}
            </aside>
        </>
    );
};

export default AdminSidebar;
