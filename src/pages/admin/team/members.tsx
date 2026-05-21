import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    LucidePlus,
    LucideSearch,
    LucideMoreVertical,
    LucideUserCog,
    LucideUserX,
    LucideLoader2,
    LucideCheck,
    LucideX,
    LucideCoins,
    LucideTrash2,
} from "lucide-react";
import { useMyCompanies, useCompanyTeamMembers, useCompanyAdminAllocateCredits, useDeleteCompanyAdminUser, useRestrictUserAccess, useUpdateCompanyAdminUser } from "../../../api/hooks";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

const AVAILABLE_ROLES = ["Individual", "Admin", "Manager", "Viewer"];

const TeamMembers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showMenu, setShowMenu] = useState<number | null>(null);
    const [allocatingFor, setAllocatingFor] = useState<number | null>(null);
    const [newCredits, setNewCredits] = useState("");
    const [changingRoleFor, setChangingRoleFor] = useState<number | null>(null);
    const [confirmRemove, setConfirmRemove] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on click outside — capturing mousedown
    useEffect(() => {
        if (showMenu === null) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(null);
            }
        };
        document.addEventListener("mousedown", handler, true);
        return () => document.removeEventListener("mousedown", handler, true);
    }, [showMenu]);

    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const companyId = company?.id;

    const { data: teamMembersData, isLoading } = useCompanyTeamMembers(companyId);
    const restrictAccess = useRestrictUserAccess();
    const deleteCompanyUser = useDeleteCompanyAdminUser();
    const allocateCredits = useCompanyAdminAllocateCredits();
    const updateCompanyUser = useUpdateCompanyAdminUser();

    const allMembers = teamMembersData || [];
    const members = searchQuery
        ? allMembers.filter(
            (m) =>
                m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : allMembers;

    const handleStatusChange = (companyUserId: number, currentEmployeeStatus: string) => {
        const isCurrentlyActive = currentEmployeeStatus === "active";
        restrictAccess.mutate(
            { companyUserId, restricted: isCurrentlyActive },
            {
                onSuccess: () => toast.success(isCurrentlyActive ? "Member deactivated" : "Member activated"),
                onError: () => toast.error("Failed to update status"),
            }
        );
        setShowMenu(null);
    };

    const handleAllocateCredits = (companyUserId: number) => {
        const amount = parseInt(newCredits);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid credit amount");
            return;
        }
        if (!companyId) {
            toast.error("Company not found");
            return;
        }
        allocateCredits.mutate(
            { companyId, companyUserId, creditsAllocated: amount },
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
                }
            }
        );
    };

    const handleRoleChange = (companyUserId: number, newRole: string) => {
        if (!companyId) {
            toast.error("Company not found");
            return;
        }
        updateCompanyUser.mutate(
            { companyUserId, data: { role: newRole } },
            {
                onSuccess: () => {
                    toast.success("Role updated");
                    setChangingRoleFor(null);
                },
                onError: () => toast.error("Failed to update role"),
            }
        );
    };

    const handleRemove = (companyUserId: number) => {
        deleteCompanyUser.mutate(companyUserId, {
            onSuccess: () => {
                toast.success("Member removed");
                setConfirmRemove(null);
            },
            onError: () => toast.error("Failed to remove member"),
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading">Team Members</h1>
                    <p className="text-sm text-muted mt-1">Manage your company&apos;s team members and roles</p>
                </div>
                <Link
                    to="/admin/team/invite"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark text-background-primary font-semibold text-sm hover:bg-darkest transition-colors duration-200"
                >
                    <LucidePlus className="w-4 h-4" />
                    Invite Members
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-button-secondary border border-border-light rounded-xl text-sm text-heading placeholder:text-brand-muted outline-none focus:border-accent transition-colors"
                        />
                    </div>
                    <Link
                        to="/admin/team/onboarding"
                        className="px-4 py-2.5 rounded-xl border border-border-light text-sm font-medium text-heading hover:border-accent/50 transition-colors"
                    >
                        Onboarding Status
                    </Link>
                </div>
            </div>

            {/* Members Table */}
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] overflow-visible">
                <table className="w-full">
                    <thead className="bg-background-primary border-b border-border-light/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                Credits
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                                Usage
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-muted uppercase tracking-wider">
                                Actions
                            </th>
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
                            members.map((member) => (
                                <tr key={member.company_user_id} className="hover:bg-background-primary/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-heading">{member.name}</p>
                                            <p className="text-xs text-muted">{member.email}</p>
                                        </div>
                                        {allocatingFor === member.company_user_id && (
                                            <div className="flex items-center gap-2 mt-2 max-w-xs">
                                                <input
                                                    type="number"
                                                    value={newCredits}
                                                    onChange={(e) => setNewCredits(e.target.value)}
                                                    placeholder="Credits to add"
                                                    className="border border-border-light rounded-lg px-3 py-1.5 text-sm text-heading outline-none focus:border-accent flex-1 min-w-0"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleAllocateCredits(member.company_user_id);
                                                        if (e.key === "Escape") {
                                                            setAllocatingFor(null);
                                                            setNewCredits("");
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleAllocateCredits(member.company_user_id)}
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
                                    <td className="px-6 py-4">
                                        {changingRoleFor === member.company_user_id ? (
                                            <div className="flex items-center gap-1">
                                                <select
                                                    defaultValue={member.role || "Individual"}
                                                    onChange={(e) => handleRoleChange(member.company_user_id, e.target.value)}
                                                    className="border border-border-light rounded-lg px-2 py-1 text-xs font-semibold text-heading outline-none focus:border-accent"
                                                    autoFocus
                                                    onBlur={() => setChangingRoleFor(null)}
                                                >
                                                    {AVAILABLE_ROLES.map((r) => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                                                {member.role || "Member"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-heading font-medium">{member.credits_used ?? 0}</span>
                                        <span className="text-xs text-muted"> / {member.credits_allocated ?? 0}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${member.employee_status === "active"
                                                ? "bg-green-50 text-green-700"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {member.employee_status === "active" ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-heading">{member.credits_used > 0 ? Math.floor(member.credits_used) : 0}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right relative">
                                        <div className="relative inline-block">
                                            <button
                                                onClick={() => showMenu === member.company_user_id ? setShowMenu(null) : setShowMenu(member.company_user_id)}
                                                className="p-1 rounded-lg hover:bg-background-primary transition-colors"
                                            >
                                                <LucideMoreVertical className="w-5 h-5 text-muted" />
                                            </button>

                                            {showMenu === member.company_user_id && (
                                                <div
                                                    ref={menuRef}
                                                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-border-light/50 shadow-lg py-2 z-50"
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setAllocatingFor(member.company_user_id);
                                                            setShowMenu(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-heading hover:bg-background-primary transition-colors flex items-center gap-2"
                                                    >
                                                        <LucideCoins className="w-4 h-4" />
                                                        Allocate credits
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setChangingRoleFor(member.company_user_id);
                                                            setShowMenu(null);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-heading hover:bg-background-primary transition-colors flex items-center gap-2"
                                                    >
                                                        <LucideUserCog className="w-4 h-4" />
                                                        Change Role
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(member.company_user_id, member.employee_status)}
                                                        className="w-full px-4 py-2 text-left text-sm text-heading hover:bg-background-primary transition-colors flex items-center gap-2"
                                                    >
                                                        <LucideUserX className="w-4 h-4" />
                                                        {member.employee_status === "active" ? "Deactivate" : "Activate"}
                                                    </button>
                                                    {confirmRemove === member.company_user_id ? (
                                                        <div className="px-4 py-2 space-y-2">
                                                            <p className="text-xs text-muted">Remove this member?</p>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleRemove(member.company_user_id)}
                                                                    disabled={deleteCompanyUser.isPending}
                                                                    className="flex-1 px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                                                >
                                                                    {deleteCompanyUser.isPending ? "Removing..." : "Remove"}
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmRemove(null)}
                                                                    className="px-2 py-1 text-xs font-semibold text-heading bg-button-secondary rounded-lg hover:bg-border-light transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmRemove(member.company_user_id)}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <LucideTrash2 className="w-4 h-4" />
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        {!isLoading && members.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <p className="text-sm text-muted">No team members found.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamMembers;
