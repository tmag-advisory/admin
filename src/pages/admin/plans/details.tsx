import { useParams, Link } from "react-router-dom";
import {
    LucideArrowLeft,
    LucideMapPin,
    LucideCalendar,
    LucideUser,
    LucideLoader2,
    LucideClock,
    LucideCheckCircle2,
    LucideFileText,
    LucideAlertTriangle,
} from "lucide-react";
import { useTravelPlan, useEmployee } from "../../../api/hooks";

function parseGeneratedPlanJson(raw: unknown): Record<string, unknown> | null {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === "string") {
        try {
            return JSON.parse(raw) as Record<string, unknown>;
        } catch {
            return null;
        }
    }
    return raw as Record<string, unknown>;
}

const PlanDetails = () => {
    const { id } = useParams();
    const planId = Number(id);
    const { data: plan, isLoading, isError } = useTravelPlan(planId);
    const { data: employee } = useEmployee(plan?.employeeId ?? 0);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LucideLoader2 className="w-8 h-8 text-accent animate-spin mb-3" />
                <p className="text-sm text-muted">Loading plan details...</p>
            </div>
        );
    }

    if (isError || !plan) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-lg font-serif text-heading mb-4">Plan not found</p>
                <Link to="/admin/plans" className="text-accent font-medium hover:underline flex items-center gap-2">
                    <LucideArrowLeft className="w-4 h-4" /> Back to Plans
                </Link>
            </div>
        );
    }

    const generatedPlanJson = parseGeneratedPlanJson(plan.generatedPlan?.planJson);

    const riskLabel = plan.riskScore <= 2 ? "Low" : plan.riskScore <= 5 ? "Moderate" : "High";
    const riskColor = riskLabel === "Low" ? "text-accent" : riskLabel === "Moderate" ? "text-gold" : "text-red-600";
    const riskBg = riskLabel === "Low" ? "bg-accent/10" : riskLabel === "Moderate" ? "bg-gold/10" : "bg-red-50";
    const borderColor = riskLabel === "Low" ? "border-accent/30" : riskLabel === "Moderate" ? "border-gold/30" : "border-red-200";
    const dotColor = riskLabel === "Low" ? "bg-accent" : riskLabel === "Moderate" ? "bg-gold" : "bg-red-500";

    const statusIcon = plan.status === "COMPLETED" ? (
        <LucideCheckCircle2 className="w-5 h-5 text-accent" />
    ) : (
        <LucideClock className="w-5 h-5 text-gold" />
    );

    const generatedPlan = generatedPlanJson as Record<string, unknown> | null;
    const tripAtGlance = generatedPlan?.tripAtGlance as Record<string, unknown> | undefined;
    const hardStop = generatedPlan?.hardStop as Record<string, unknown> | null | undefined;
    const nextSteps = generatedPlan?.nextSteps as string[] | undefined;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Link to="/admin/plans" className="p-2 rounded-xl hover:bg-white transition-colors">
                    <LucideArrowLeft className="w-5 h-5 text-muted" />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-heading truncate">{plan.destination}</h1>
                    <p className="text-sm text-muted mt-1">{plan.country} &middot; {plan.duration} day{plan.duration !== 1 ? "s" : ""}</p>
                </div>
            </div>

            {/* Quick Info Card */}
            <div className={`rounded-3xl bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] border ${borderColor} p-6`}>
                <div className="flex flex-wrap gap-3 mb-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${riskBg} ${riskColor}`}>
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        {riskLabel} Risk
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-accent/10 text-accent">
                        {statusIcon}
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1).toLowerCase()}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <LucideUser className="w-4 h-4" />
                        {employee?.name ?? "Unknown"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <LucideCalendar className="w-4 h-4" />
                        {new Date(plan.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <LucideMapPin className="w-4 h-4" />
                        {plan.destination}
                    </div>
                    {tripAtGlance?.purpose ? (
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <LucideFileText className="w-4 h-4" />
                            {tripAtGlance.purpose as string}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Critical Advisory (if any) — keep this as it's important for admins */}
            {hardStop && (
                <div className="rounded-3xl bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] border border-red-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-red-100 bg-red-50/50">
                        <h2 className="text-sm font-semibold text-red-700 flex items-center gap-2">
                            <LucideAlertTriangle className="w-4 h-4" />
                            Critical Advisory
                        </h2>
                    </div>
                    <div className="p-5">
                        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm">
                            <p className="font-semibold text-red-700">{(hardStop.conditionTriggered as string) ?? "Hard stop condition"}</p>
                            {hardStop.reason ? <p className="text-red-700/90 mt-1">{hardStop.reason as string}</p> : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick summary — brief overview only */}
            <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-6">
                <h2 className="text-sm font-semibold text-heading mb-3">Trip Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {tripAtGlance?.durationDays ? (
                        <div>
                            <span className="text-muted">Duration:</span>{" "}
                            <span className="text-heading font-medium">{tripAtGlance.durationDays as number} days</span>
                        </div>
                    ) : null}
                    {tripAtGlance?.purpose ? (
                        <div>
                            <span className="text-muted">Purpose:</span>{" "}
                            <span className="text-heading font-medium">{tripAtGlance.purpose as string}</span>
                        </div>
                    ) : null}
                    {tripAtGlance?.travelling ? (
                        <div>
                            <span className="text-muted">Travel with:</span>{" "}
                            <span className="text-heading font-medium">{tripAtGlance.travelling as string}</span>
                        </div>
                    ) : null}
                    {tripAtGlance?.accommodation ? (
                        <div>
                            <span className="text-muted">Accommodation:</span>{" "}
                            <span className="text-heading font-medium">{tripAtGlance.accommodation as string}</span>
                        </div>
                    ) : null}
                    {tripAtGlance?.insurance ? (
                        <div>
                            <span className="text-muted">Insurance:</span>{" "}
                            <span className="text-heading font-medium">{tripAtGlance.insurance as string}</span>
                        </div>
                    ) : null}
                    {plan.purpose && !tripAtGlance?.purpose && (
                        <div className="col-span-full">
                            <span className="text-muted">Purpose:</span>{" "}
                            <span className="text-heading font-medium">{plan.purpose}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Next Steps (brief) — useful for admin awareness */}
            {nextSteps && nextSteps.length > 0 && (
                <div className="rounded-3xl border border-border-light/60 bg-white backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(10,20,18,0.04),0_8px_28px_-18px_rgba(10,20,18,0.07)] p-6">
                    <h2 className="text-sm font-semibold text-heading mb-3 flex items-center gap-2">
                        <LucideFileText className="w-4 h-4 text-accent" />
                        Next Steps
                    </h2>
                    <ul className="space-y-2">
                        {nextSteps.slice(0, 3).map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-heading">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                                {step}
                            </li>
                        ))}
                        {nextSteps.length > 3 && (
                            <p className="text-xs text-muted ml-3.5">+{nextSteps.length - 3} more steps</p>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PlanDetails;
