import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LucideSearch,
    LucideUserPlus,
    LucideMoreHorizontal,
    LucideLoader2,
    LucideCheck,
    LucideX,
    LucideCoins,
    LucideUsers,
} from "lucide-react";
import { useMyCompanies, useEmployees, useInviteEmployee, useAllocateEmployeeCredits, useUpdateEmployeeStatus, useDeleteEmployee } from "../../../api/hooks";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const AVAILABLE_ROLES = ["Individual", "Admin", "Manager", "Viewer"];

const Employees = () => {
    const navigate = useNavigate();
    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const companyIdNum = company?.id;

    const [search, setSearch] = useState("");
    const [showInvite, setShowInvite] = useState(false);
    const [inviteName, setInviteName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteDept, setInviteDept] = useState("");
    const [inviteRole, setInviteRole] = useState("Individual");
    const [inviteCredits, setInviteCredits] = useState("");
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const [allocatingFor, setAllocatingFor] = useState<number | null>(null);
    const [newCredits, setNewCredits] = useState("");

    const { data: employeesData, isLoading } = useEmployees({
        companyId: companyIdNum,
        search: search || undefined,
    });
    const inviteEmployee = useInviteEmployee();
    const allocateCredits = useAllocateEmployeeCredits();
    const updateStatus = useUpdateEmployeeStatus();
    const deleteEmployee = useDeleteEmployee();

    const employees = employeesData?.data || [];

    const handleInvite = () => {
        if (!companyIdNum || !inviteName || !inviteEmail) return;
        inviteEmployee.mutate(
            {
                companyId: companyIdNum,
                name: inviteName,
                email: inviteEmail,
                department: inviteDept,
                role: inviteRole,
                creditsAllocated: parseInt(inviteCredits) || 0,
            },
            {
                onSuccess: () => {
                    setShowInvite(false);
                    setInviteName("");
                    setInviteEmail("");
                    setInviteDept("");
                    setInviteRole("Individual");
                    setInviteCredits("");
                    toast.success("Employee invited successfully");
                },
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        toast.error(error?.response?.data?.error || "Failed to invite employee");
                    } else {
                        toast.error("Failed to invite employee");
                    }
                },
            }
        );
    };

    const handleAllocateCredits = (id: number) => {
        const amount = parseInt(newCredits);
        if (!companyIdNum) return;
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid credit amount");
            return;
        }
        allocateCredits.mutate(
            { id, data: { creditsAllocated: amount } },
            {
                onSuccess: () => {
                    setAllocatingFor(null);
                    setNewCredits("");
                    toast.success("Credits allocated successfully");
                },
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        toast.error(error?.response?.data?.error || "Failed to allocate credits");
                    } else {
                        toast.error("Failed to allocate credits");
                    }
                },
            }
        );
    };

    const handleRemoveEmployee = (id: number) => {
        deleteEmployee.mutate(id, {
            onSuccess: () => {
                toast.success("Employee removed");
                setMenuOpenId(null);
            },
            onError: () => toast.error("Failed to remove employee"),
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">Employees</h1>
                    <p className="text-sm text-muted mt-1">Manage your company&apos;s employees, invite new members, and allocate credits</p>
                </div>
                <button
                    onClick={() => setShowInvite(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200 self-start cursor-pointer"
                >
                    <LucideUserPlus className="w-4 h-4" />
                    Invite Employee
                </button>
            </div>

            {/* Search */}
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-4">
                <div className="relative">
                    <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search employees by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-button-secondary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted outline-none focus:border-accent transition-colors"
                    />
                </div>
            </div>

            {/* Invite form */}
            {showInvite && (
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-6">
                    <h3 className="text-base font-semibold text-heading mb-4">Invite New Employee</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <input
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                            placeholder="Full name"
                            className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors"
                        />
                        <input
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="Email address"
                            type="email"
                            className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors"
                        />
                        <input
                            value={inviteDept}
                            onChange={(e) => setInviteDept(e.target.value)}
                            placeholder="Department (optional)"
                            className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors"
                        />
                        <div className="flex gap-2">
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading outline-none focus:border-accent transition-colors flex-1"
                            >
                                {AVAILABLE_ROLES.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            <input
                                value={inviteCredits}
                                onChange={(e) => setInviteCredits(e.target.value)}
                                placeholder="Credits"
                                type="number"
                                className="bg-background-primary border border-border-light rounded-xl px-4 py-3 text-sm text-heading placeholder:text-border outline-none focus:border-accent transition-colors w-28"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleInvite}
                            disabled={inviteEmployee.isPending || !inviteName || !inviteEmail}
                            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-dark text-background-primary font-semibold text-sm cursor-pointer hover:bg-darkest transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {inviteEmployee.isPending && <LucideLoader2 className="w-3.5 h-3.5 animate-spin" />}
                            Send invite
                        </button>
                        <button
                            onClick={() => setShowInvite(false)}
                            className="py-2.5 px-5 rounded-xl bg-button-secondary text-heading font-semibold text-sm cursor-pointer hover:bg-border-light transition-colors duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Employees table */}
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-visible">
                <table className="w-full">
                    <thead className="bg-background-primary border-b border-border-light/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Credits</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Plans</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <LucideLoader2 className="w-6 h-6 text-accent animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-background-primary/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/admin/employees/${emp.id}`)}
                                            className="flex items-center gap-3 text-left cursor-pointer group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-button-secondary flex items-center justify-center text-xs font-semibold text-heading shrink-0">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-heading group-hover:text-accent transition-colors">{emp.name}</p>
                                                <p className="text-xs text-muted">{emp.email}</p>
                                            </div>
                                        </button>
                                        {allocatingFor === emp.id && (
                                            <div className="flex items-center gap-2 mt-2 max-w-xs">
                                                <input
                                                    type="number"
                                                    value={newCredits}
                                                    onChange={(e) => setNewCredits(e.target.value)}
                                                    placeholder="Credits to add"
                                                    className="border border-border-light rounded-lg px-3 py-1.5 text-sm text-heading outline-none focus:border-accent flex-1 min-w-0"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleAllocateCredits(emp.id);
                                                        if (e.key === "Escape") {
                                                            setAllocatingFor(null);
                                                            setNewCredits("");
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleAllocateCredits(emp.id)}
                                                    disabled={allocateCredits.isPending}
                                                    className="p-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors disabled:opacity-50"
                                                >
                                                    <LucideCheck className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setAllocatingFor(null); setNewCredits(""); }}
                                                    className="p-1.5 rounded-lg hover:bg-button-secondary text-muted transition-colors"
                                                >
                                                    <LucideX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-body hidden md:table-cell">{emp.department}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-heading font-medium">{emp.creditsUsed}</span>
                                        <span className="text-xs text-muted"> / {emp.creditsAllocated}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-body hidden sm:table-cell">{emp.plansGenerated}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                            emp.status === "active" ? "text-accent bg-accent/10" : "text-muted bg-button-secondary"
                                        }`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 relative text-right">
                                        <button
                                            onClick={() => setMenuOpenId(menuOpenId === emp.id ? null : emp.id)}
                                            className="p-1.5 rounded-lg hover:bg-button-secondary transition-colors duration-150 cursor-pointer"
                                        >
                                            <LucideMoreHorizontal className="w-4 h-4 text-muted" />
                                        </button>
                                        {menuOpenId === emp.id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                                                <div className="absolute right-6 top-full mt-1 bg-white border border-border-light rounded-xl shadow-lg z-20 min-w-44 py-1">
                                                    <button
                                                        onClick={() => { setAllocatingFor(emp.id); setMenuOpenId(null); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-heading hover:bg-background-secondary transition-colors flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <LucideCoins className="w-3.5 h-3.5" />
                                                        Allocate credits
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            updateStatus.mutate({ id: emp.id, data: { status: emp.status === "active" ? "inactive" : "active" } });
                                                            setMenuOpenId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm text-heading hover:bg-background-secondary transition-colors cursor-pointer"
                                                    >
                                                        {emp.status === "active" ? "Deactivate" : "Activate"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveEmployee(emp.id)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        {!isLoading && employees.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <LucideUsers className="w-10 h-10 text-muted mx-auto mb-3" />
                                    <p className="text-base font-semibold text-heading mb-1">No employees found</p>
                                    <p className="text-sm text-muted mb-4">Invite your first employee to get started</p>
                                    <button
                                        onClick={() => setShowInvite(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors cursor-pointer"
                                    >
                                        <LucideUserPlus className="w-4 h-4" />
                                        Invite Employee
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Employees;
