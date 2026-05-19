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
} from "lucide-react";
import { useMyCompanies, useCompanyTeamMembers, useCompanyAdminAllocateCredits, useDeleteCompanyAdminUser, useRestrictUserAccess } from "../../../api/hooks";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

const TeamMembers = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showMenu, setShowMenu] = useState<number | null>(null);
    const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [allocatingFor, setAllocatingFor] = useState<number | null>(null);
    const [newCredits, setNewCredits] = useState("");
    const menuBtnRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    const openMenu = (id: number) => {
        setShowMenu(id);
    };



    useEffect(() => {
        if (showMenu === null) return;
        const onScroll = () => setShowMenu(null);
        window.addEventListener("scroll", onScroll, true);
        return () => window.removeEventListener("scroll", onScroll, true);
    }, [showMenu]);

    useEffect(() => {
        window.addEventListener("click", (e) => {
            if (showMenu === null) return;
            const btn = menuBtnRefs.current.get(showMenu);
            if (btn && btn.contains(e.target as Node)) {
                const rect = btn.getBoundingClientRect();
                setMenuPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
            } else {
                setShowMenu(null);
            }
        })
    }, [])

    const { data: companiesData } = useMyCompanies();
    const company = companiesData?.[0];
    const companyId = company?.id;

    const { data: teamMembersData, isLoading } = useCompanyTeamMembers(companyId);
    const restrictAccess = useRestrictUserAccess();
    const deleteCompanyUser = useDeleteCompanyAdminUser();
    const allocateCredits = useCompanyAdminAllocateCredits();

    const allMembers = teamMembersData || [];
    const members = searchQuery
        ? allMembers.filter(
            (m) =>
                m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : allMembers;

    const handleStatusChange = (companyUserId: number, currentStatus: string) => {
        const restricted = currentStatus === "active";
        restrictAccess.mutate(
            { companyUserId, restricted },
            {
                onSuccess: () => toast.success(restricted ? "User deactivated" : "User activated"),
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
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] ">
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
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                                            {member.role || "Member"}
                                        </span>
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
                                        <button
                                            ref={(el) => { if (el) menuBtnRefs.current.set(member.company_user_id, el); }}
                                            onClick={() => showMenu === member.company_user_id ? setShowMenu(null) : openMenu(member.company_user_id)}
                                            className="p-1 rounded-lg hover:bg-background-primary transition-colors"
                                        >
                                            <LucideMoreVertical className="w-5 h-5 text-muted" />
                                        </button>

                                        {showMenu === member.company_user_id && (
                                            <>
                                                <div className="inset-0 z-40" onClick={() => setShowMenu(null)} />
                                                <div
                                                    className="absolute top-0 left-0 w-48 bg-white rounded-xl border border-border-light/50 shadow-lg py-2 z-50"
                                                    style={{ top: menuPos.top, left: menuPos.left }}
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
                                                    <button className="w-full px-4 py-2 text-left text-sm text-heading hover:bg-background-primary transition-colors flex items-center gap-2">
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
                                                    <button
                                                        onClick={() => { deleteCompanyUser.mutate(member.company_user_id); setShowMenu(null); }}
                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                    >
                                                        <LucideUserX className="w-4 h-4" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </>
                                        )}
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
