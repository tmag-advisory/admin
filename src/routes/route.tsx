import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "../layouts/adminlayout";
import AuthLayout from "../layouts/authlayouts";


// Pages
const Login = lazy(() => import("../pages/auth/login"));
const Dashboard = lazy(() => import("../pages/admin/dashboard"));
const CompanyProfile = lazy(() => import("../pages/admin/company/profile"));
const TeamMembers = lazy(() => import("../pages/admin/team/members"));
const InviteMembers = lazy(() => import("../pages/admin/team/invite"));
const Credits = lazy(() => import("../pages/admin/credits/overview"));
const PaymentCallback = lazy(() => import("../pages/admin/credits/callback"));
const Invoices = lazy(() => import("../pages/admin/credits/invoices"));
const InvoiceDetail = lazy(() => import("../pages/admin/credits/invoice-detail"));
const TravelPlans = lazy(() => import("../pages/admin/plans/list"));
const PlanDetails = lazy(() => import("../pages/admin/plans/details"));
const CreatePlan = lazy(() => import("../pages/admin/plans/create"));
const CreditRequests = lazy(() => import("../pages/admin/requests/list"));
const Reports = lazy(() => import("../pages/admin/reports/overview"));
const OnboardingStatus = lazy(() => import("../pages/admin/team/onboarding-status"));
const Settings = lazy(() => import("../pages/admin/settings/general"));
const AuditLog = lazy(() => import("../pages/admin/audit/log"));
const ApiKeys = lazy(() => import("../pages/admin/api-keys/manage"));
const DataExport = lazy(() => import("../pages/admin/settings/data-export"));

const LoadingFallback = () => (
    <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-darkest flex items-center justify-center">
                <span className="text-white font-bold">TM</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
        </div>
    </div>
);

const withSuspense = (element: ReactNode) => (
    <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
);

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/admin" replace />,
    },
    {
        path: "/auth",
        element: <AuthLayout />,
        children: [
            { index: true, element: <Navigate to="/auth/login" replace /> },
            { path: "login", element: withSuspense(<Login />) },
        ],
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: withSuspense(<Dashboard />),
            },
            {
                path: "company",
                element: withSuspense(<CompanyProfile />),
            },
            {
                path: "team",
                element: withSuspense(<TeamMembers />),
            },
            {
                path: "team/invite",
                element: withSuspense(<InviteMembers />),
            },
            {
                path: "team/onboarding",
                element: withSuspense(<OnboardingStatus />),
            },
            {
                path: "credits",
                element: withSuspense(<Credits />),
            },
            {
                path: "credits/callback",
                element: withSuspense(<PaymentCallback />),
            },
            {
                path: "credits/invoices",
                element: withSuspense(<Invoices />),
            },
            {
                path: "credits/invoices/:id",
                element: withSuspense(<InvoiceDetail />),
            },
            {
                path: "plans",
                element: withSuspense(<TravelPlans />),
            },
            {
                path: "plans/create",
                element: withSuspense(<CreatePlan />),
            },
            {
                path: "plans/:id",
                element: withSuspense(<PlanDetails />),
            },
            {
                path: "requests",
                element: withSuspense(<CreditRequests />),
            },
            {
                path: "reports",
                element: withSuspense(<Reports />),
            },
            {
                path: "audit",
                element: withSuspense(<AuditLog />),
            },
            {
                path: "api-keys",
                element: withSuspense(<ApiKeys />),
            },
            {
                path: "settings",
                element: withSuspense(<Settings />),
            },
            {
                path: "settings/export",
                element: withSuspense(<DataExport />),
            },
        ],
    },
    // Catch-all redirect
    {
        path: "*",
        element: <Navigate to="/admin" replace />,
    },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
