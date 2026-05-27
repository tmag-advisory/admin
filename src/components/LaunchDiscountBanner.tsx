import { LucidePartyPopper, LucideTag } from "lucide-react";
import { useLaunchDiscount } from "../api";

interface LaunchDiscountBannerProps {
  /** `"page"` is a full-width strip; `"inline"` is a rounded pill. */
  variant?: "page" | "inline";
  className?: string;
}

const cx = (...parts: Array<string | false | undefined | null>) =>
  parts.filter(Boolean).join(" ");

const LaunchDiscountBanner = ({
  variant = "page",
  className,
}: LaunchDiscountBannerProps) => {
  const { data } = useLaunchDiscount();
  if (!data || !data.active) return null;

  const headline =
    data.label && data.label.trim().length > 0
      ? data.label
      : `Launch promo — ${data.percentage}% off`;

  if (variant === "inline") {
    return (
      <div
        role="status"
        className={cx(
          "inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/90 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm",
          className,
        )}
      >
        <LucideTag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="leading-none">
          {headline} <span className="font-bold">({data.percentage}% off)</span>
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={`${headline}. ${data.percentage}% off applied automatically.`}
      className={cx(
        "relative isolate overflow-hidden rounded-2xl border border-emerald-300/60 bg-gradient-to-r from-emerald-500 via-emerald-600 to-amber-500 px-5 py-3.5 text-white shadow-md",
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <LucidePartyPopper className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold tracking-wide">{headline}</p>
        </div>
        <p className="text-xs sm:text-sm font-medium text-emerald-50">
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-white">
            {data.percentage}% off
          </span>{" "}
          applied automatically
        </p>
      </div>
    </div>
  );
};

export default LaunchDiscountBanner;
