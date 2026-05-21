import api from "./axios";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  SelectOption,
  // Auth
  LoginRequest,
  AuthResponse,
  CompanyAdminUser,
  // Company
  CompanyResponse,
  CompanyCodeValidationResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  // Employee
  EmployeeResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  AllocateEmployeeCreditsRequest,
  UpdateEmployeeStatusRequest,
  PurchaseCreditsRequest,
  // Travel Plan
  TravelPlanResponse,
  // Credit Request
  CreditRequestResponse,
  CreateCreditRequestRequest,
  UpdateCreditRequestRequest,
  // Health Profile
  HealthProfileResponse,
  CreateHealthProfileRequest,
  UpdateHealthProfileRequest,
  // Country
  CountryResponse,
  CreateCountryRequest,
  UpdateCountryRequest,
  // Country Health Alert
  CountryHealthAlertResponse,
  // Country Accommodation
  CountryAccommodationResponse,
  // Credit
  CreditResponse,
  CreateCreditRequest,
  // Notification
  NotificationResponse,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  // Pricing Plan
  PricingPlanResponse,
  // Invoice
  InvoiceResponse,
  CreateInvoiceRequest,
  // Blog Post
  BlogPostResponse,
  // FAQ Item
  FaqItemResponse,
  // Company User
  CompanyUserResponse,
  CreateCompanyUserRequest,
  MyCompanyMembership,
  // Profile
  ProfileResponse,
  UpdateProfileRequest,
  UpdateProfilePasswordRequest,
  // Onboarding
  UserOnboardingResponse,
  UpsertOnboardingRequest,
  AdvanceStageRequest,
  OnboardingQuestionCategoryResponse,
  SubmitQuestionnaireRequest,
  QuestionnaireProgressRequest,
  // API Keys
  ApiKeyResponse,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  // Company Plans
  CompanyPlanResponse,
  // Company Admin Management
  CompanyAdminUserCreateRequest,
  CompanyAdminUserUpdateRequest,
  CompanyAdminCreditAllocationRequest,
  CompanyTeamMember,
  // Settings
  CompanySettingsResponse,
  CompanySettingsUpdateRequest,
  // Reports
  UsageReportSummary,
  PlanHistoryDto,
  DashboardAnalyticsDto,
  ComplianceReportDto,
} from "./types";

// ─── Generic CRUD helpers ────────────────────────────────────

function buildParams(params?: PaginationParams) {
  if (!params) return {};
  return {
    page: params.page !== undefined ? params.page - 1 : undefined,
    size: params.per_page, // Spring Data JPA Pageable uses 'size' instead of 'per_page'
    search: params.search,
    sort: params.sort,
    order: params.order,
    companyId: params.companyId,
  };
}

// ─── Auth (company-admin) ────────────────────────────────────

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>("/company-admin/auth/login", data).then((r) => r.data.data),

  logout: () =>
    api.post<ApiResponse<null>>("/company-admin/auth/logout").then((r) => r.data.data),

  getCurrentUser: () =>
    api.get<ApiResponse<CompanyAdminUser>>("/company-admin/auth/me").then((r) => r.data.data),
};

// ─── Companies ───────────────────────────────────────────────

export const companiesApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CompanyResponse>>>("/companies", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/companies/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CompanyResponse>>(`/companies/${id}`).then((r) => r.data.data),

  create: (data: CreateCompanyRequest) =>
    api.post<ApiResponse<CompanyResponse>>("/companies", data).then((r) => r.data.data),

  update: (id: number, data: UpdateCompanyRequest) =>
    api.put<ApiResponse<CompanyResponse>>(`/companies/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/companies/${id}`).then((r) => r.data.data),

  uploadLogo: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResponse<{ url: string }>>(`/companies/${id}/logo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  removeLogo: (id: number) =>
    api.delete<ApiResponse<null>>(`/companies/${id}/logo`).then((r) => r.data.data),

  validateCode: (code: string) =>
    api.get<ApiResponse<CompanyCodeValidationResponse>>("/companies/validate-code", { params: { code } }).then((r) => r.data.data),

  purchaseCredits: (id: number, data: PurchaseCreditsRequest) =>
    api.post<ApiResponse<CompanyResponse>>(`/companies/${id}/purchase-credits`, data).then((r) => r.data.data),
};

// ─── Company Admin Credits ───────────────────────────────────────────────

export const companyAdminCreditsApi = {
  getQuote: (companyId: number, credits: number) =>
    api.post<ApiResponse<any>>("/company-admin/credits/quote", null, { params: { companyId, credits } }).then((r) => r.data.data),
  
  purchase: (data: { credits: number; companyId: number }) =>
    api.post<ApiResponse<any>>("/company-admin/credits/purchase", data).then((r) => r.data.data),

  verify: (txRef: string, transactionId?: string) =>
    api.get<ApiResponse<{ success: boolean; purchase: any }>>(`/company-admin/credits/verify/${txRef}`, {
      params: transactionId ? { transaction_id: transactionId } : {},
    }).then((r) => r.data.data),

  getPurchase: (txRef: string) =>
    api.get<ApiResponse<any>>(`/company-admin/credits/${txRef}`).then((r) => r.data.data),

  getHistory: (companyId?: number) =>
    api.get<ApiResponse<any[]>>("/company-admin/credits/history", {
      params: companyId ? { companyId } : {},
    }).then((r) => r.data.data),
};

// ─── Employees ───────────────────────────────────────────────

export const employeesApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<EmployeeResponse>>>("/employees", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/employees/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<EmployeeResponse>>(`/employees/${id}`).then((r) => r.data.data),

  create: (data: CreateEmployeeRequest) =>
    api.post<ApiResponse<EmployeeResponse>>("/employees", data).then((r) => r.data.data),

  update: (id: number, data: UpdateEmployeeRequest) =>
    api.put<ApiResponse<EmployeeResponse>>(`/employees/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/employees/${id}`).then((r) => r.data.data),

  allocateCredits: (id: number, data: AllocateEmployeeCreditsRequest) =>
    api.put<ApiResponse<EmployeeResponse>>(`/employees/${id}/credits`, data).then((r) => r.data.data),

  updateStatus: (id: number, data: UpdateEmployeeStatusRequest) =>
    api.put<ApiResponse<EmployeeResponse>>(`/employees/${id}/status`, data).then((r) => r.data.data),

  invite: (data: { name: string; email: string; department: string; creditsAllocated: number; companyId: number }) =>
    api.post<ApiResponse<EmployeeResponse>>("/employees/invite", data).then((r) => r.data.data),
};

// ─── Travel Plans ────────────────────────────────────────────

export const travelPlansApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<TravelPlanResponse>>>("/travel-plans", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/travel-plans/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<TravelPlanResponse>>(`/travel-plans/${id}`).then((r) => r.data.data),


};

// ─── Credit Requests ─────────────────────────────────────────

export const creditRequestsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CreditRequestResponse>>>("/credit-requests", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/credit-requests/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CreditRequestResponse>>(`/credit-requests/${id}`).then((r) => r.data.data),

  create: (data: Partial<CreateCreditRequestRequest>) =>
    api.post<ApiResponse<CreditRequestResponse>>("/credit-requests", data).then((r) => r.data.data),

  update: (id: number, data: UpdateCreditRequestRequest) =>
    api.put<ApiResponse<CreditRequestResponse>>(`/credit-requests/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/credit-requests/${id}`).then((r) => r.data.data),

  approve: (id: number) =>
    api.post<ApiResponse<CreditRequestResponse>>(`/credit-requests/${id}/approve`).then((r) => r.data.data),

  reject: (id: number) =>
    api.post<ApiResponse<CreditRequestResponse>>(`/credit-requests/${id}/reject`).then((r) => r.data.data),
};

// ─── Health Profiles ─────────────────────────────────────────

export const healthProfilesApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<HealthProfileResponse>>>("/health-profiles", { params: buildParams(params) }).then((r) => r.data.data),

  getMine: () =>
    api.get<ApiResponse<HealthProfileResponse>>("/health-profiles/my").then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/health-profiles/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<HealthProfileResponse>>(`/health-profiles/${id}`).then((r) => r.data.data),

  create: (data: CreateHealthProfileRequest) =>
    api.post<ApiResponse<HealthProfileResponse>>("/health-profiles", data).then((r) => r.data.data),

  update: (id: number, data: UpdateHealthProfileRequest) =>
    api.put<ApiResponse<HealthProfileResponse>>(`/health-profiles/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/health-profiles/${id}`).then((r) => r.data.data),
};

// ─── Countries ───────────────────────────────────────────────

export const countriesApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CountryResponse>>>("/countries", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<CountryResponse[]>>("/countries/all")
      .then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CountryResponse>>(`/countries/${id}`).then((r) => r.data.data),

  create: (data: CreateCountryRequest) =>
    api.post<ApiResponse<CountryResponse>>("/countries", data).then((r) => r.data.data),

  update: (id: number, data: UpdateCountryRequest) =>
    api.put<ApiResponse<CountryResponse>>(`/countries/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/countries/${id}`).then((r) => r.data.data),
};

// ─── Country Health Alerts ───────────────────────────────────

export const countryHealthAlertsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CountryHealthAlertResponse>>>("/country-health-alerts", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/country-health-alerts/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CountryHealthAlertResponse>>(`/country-health-alerts/${id}`).then((r) => r.data.data),
};

// ─── Country Accommodations ──────────────────────────────────

export const countryAccommodationsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CountryAccommodationResponse>>>("/country-accommodations", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/country-accommodations/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CountryAccommodationResponse>>(`/country-accommodations/${id}`).then((r) => r.data.data),
};

// ─── Credits ─────────────────────────────────────────────────

export const creditsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CreditResponse>>>("/credits", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/credits/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CreditResponse>>(`/credits/${id}`).then((r) => r.data.data),

  create: (data: CreateCreditRequest) =>
    api.post<ApiResponse<CreditResponse>>("/credits", data).then((r) => r.data.data),
};

// ─── Notifications ───────────────────────────────────────────

export const notificationsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<NotificationResponse>>>("/notifications", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/notifications/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<NotificationResponse>>(`/notifications/${id}`).then((r) => r.data.data),

  create: (data: CreateNotificationRequest) =>
    api.post<ApiResponse<NotificationResponse>>("/notifications", data).then((r) => r.data.data),

  update: (id: number, data: UpdateNotificationRequest) =>
    api.put<ApiResponse<NotificationResponse>>(`/notifications/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/notifications/${id}`).then((r) => r.data.data),
};

// ─── Pricing Plans ───────────────────────────────────────────

export const pricingPlansApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<PricingPlanResponse>>>("/pricing-plans", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/pricing-plans/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<PricingPlanResponse>>(`/pricing-plans/${id}`).then((r) => r.data.data),
};

// ─── Invoices ────────────────────────────────────────────────

export const invoicesApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<InvoiceResponse>>>("/invoices", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/invoices/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<InvoiceResponse>>(`/invoices/${id}`).then((r) => r.data.data),

  create: (data: CreateInvoiceRequest) =>
    api.post<ApiResponse<InvoiceResponse>>("/invoices", data).then((r) => r.data.data),
};

// ─── Blog Posts ──────────────────────────────────────────────

export const blogPostsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<BlogPostResponse>>>("/blog-posts", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/blog-posts/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<BlogPostResponse>>(`/blog-posts/${id}`).then((r) => r.data.data),

  uploadFeaturedImage: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResponse<{ url: string }>>(`/blog-posts/${id}/featured-image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  removeFeaturedImage: (id: number) =>
    api.delete<ApiResponse<null>>(`/blog-posts/${id}/featured-image`).then((r) => r.data.data),
};

// ─── FAQ Items ───────────────────────────────────────────────

export const faqItemsApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<FaqItemResponse>>>("/faq-items", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/faq-items/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<FaqItemResponse>>(`/faq-items/${id}`).then((r) => r.data.data),
};

// ─── Company Users ───────────────────────────────────────────

export const companyUsersApi = {
  list: (params?: PaginationParams) =>
    api.get<ApiResponse<PaginatedResponse<CompanyUserResponse>>>("/company-users", { params: buildParams(params) }).then((r) => r.data.data),

  listAll: () =>
    api.get<ApiResponse<SelectOption[]>>("/company-users/all").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CompanyUserResponse>>(`/company-users/${id}`).then((r) => r.data.data),

  create: (data: CreateCompanyUserRequest) =>
    api.post<ApiResponse<CompanyUserResponse>>("/company-users", data).then((r) => r.data.data),

  update: (id: number, data: Partial<CreateCompanyUserRequest>) =>
    api.put<ApiResponse<CompanyUserResponse>>(`/company-users/${id}`, data).then((r) => r.data.data),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/company-users/${id}`).then((r) => r.data.data),

  mine: () =>
    api.get<ApiResponse<MyCompanyMembership[]>>("/profile/companies")
      .then((r) => r.data.data),
};

// ─── Profile ─────────────────────────────────────────────────

export const profileApi = {
  get: () =>
    api.get<ApiResponse<ProfileResponse>>("/profile").then((r) => r.data.data),

  update: (data: UpdateProfileRequest) =>
    api.put<ApiResponse<ProfileResponse>>("/profile", data).then((r) => r.data.data),

  updateAvatar: (file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    return api.put<ApiResponse<ProfileResponse>>("/profile/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  updatePassword: (data: UpdateProfilePasswordRequest) =>
    api.put<ApiResponse<null>>("/profile/password", data).then((r) => r.data.data),
};

// ─── Onboarding ──────────────────────────────────────────────
export const onboardingApi = {
  get: () =>
    api.get<ApiResponse<UserOnboardingResponse>>("/onboarding").then((r) => r.data.data),

  upsert: (data: UpsertOnboardingRequest) =>
    api.post<ApiResponse<UserOnboardingResponse>>("/onboarding", data).then((r) => r.data.data),

  advanceStage: (data: AdvanceStageRequest) =>
    api.put<ApiResponse<{ stage: number; role: string }>>("/onboarding/stage", data).then((r) => r.data.data),

  getQuestions: () =>
    api.get<ApiResponse<OnboardingQuestionCategoryResponse[]>>("/onboarding/questions").then((r) => r.data.data),

  submitQuestionnaire: (data: SubmitQuestionnaireRequest) =>
    api.post<ApiResponse<UserOnboardingResponse>>("/onboarding/questionnaire", data).then((r) => r.data.data),

  saveProgress: (data: QuestionnaireProgressRequest) =>
    api.post<ApiResponse<null>>("/onboarding/progress", data).then((r) => r.data.data),

  getProgress: () =>
    api.get<ApiResponse<any>>("/onboarding/progress").then((r) => r.data.data),
};

// ─── Company API Keys ─────────────────────────────────────────

export const apiKeysApi = {
  list: (companyId: number) =>
    api.get<ApiResponse<ApiKeyResponse[]>>("/company-admin/api-keys", { params: { companyId } })
      .then((r) => r.data.data),

  create: (data: CreateApiKeyRequest) =>
    api.post<ApiResponse<CreateApiKeyResponse>>("/company-admin/api-keys", data)
      .then((r) => r.data.data),

  revoke: (id: number, companyId: number) =>
    api.delete<ApiResponse<null>>(`/company-admin/api-keys/${id}`, { params: { companyId } })
      .then((r) => r.data.data),
};

// ─── Company Settings ─────────────────────────────────────────

export const settingsApi = {
  get: (companyId: number) =>
    api.get<ApiResponse<CompanySettingsResponse>>("/company-admin/settings", { params: { companyId } })
      .then((r) => r.data.data),

  update: (data: CompanySettingsUpdateRequest) =>
    api.put<ApiResponse<CompanySettingsResponse>>("/company-admin/settings", data)
      .then((r) => r.data.data),

  updateBillingCurrency: (companyId: number, currency: string) =>
    api.put("/company-admin/settings/billing-currency", null, { params: { companyId, currency } })
      .then((r) => r.data),
};

// ─── Admin Reports ────────────────────────────────────────────────

export const adminReportsApi = {
  getDashboardAnalytics: (companyId?: number) =>
    api
      .get<ApiResponse<DashboardAnalyticsDto>>("/company-admin/reports/dashboard/analytics", {
        params: companyId !== undefined ? { companyId } : {},
      })
      .then((r) => r.data.data),

  getUsageReport: (companyId?: number) =>
    api.get<ApiResponse<UsageReportSummary>>("/company-admin/reports/usage", { params: companyId ? { companyId } : {} }).then((r) => r.data.data),

  getUsageReportCsv: (companyId?: number) =>
    api.get<string>("/company-admin/reports/usage/csv", { params: companyId ? { companyId } : {}, responseType: 'text' }),

  getPlanHistory: (companyId?: number) =>
    api.get<ApiResponse<PlanHistoryDto[]>>("/company-admin/reports/plans", { params: companyId ? { companyId } : {} }).then((r) => r.data.data),

  getPlanHistoryCsv: (companyId?: number) =>
    api.get<string>("/company-admin/reports/plans/csv", { params: companyId ? { companyId } : {}, responseType: 'text' }),

  getComplianceReport: (companyId?: number) =>
    api.get<ApiResponse<ComplianceReportDto>>("/company-admin/reports/compliance", { params: companyId ? { companyId } : {} }).then((r) => r.data.data),

  getComplianceReportCsv: (companyId?: number) =>
    api.get<string>("/company-admin/reports/compliance/csv", { params: companyId ? { companyId } : {}, responseType: 'text' }),

  getTeamReport: (companyId?: number) =>
    api.get<ApiResponse<UsageReportSummary>>("/company-admin/reports/team", { params: companyId ? { companyId } : {} }).then((r) => r.data.data),

  getTeamReportCsv: (companyId?: number) =>
    api.get<string>("/company-admin/reports/team/csv", { params: companyId ? { companyId } : {}, responseType: 'text' }),
};

// ─── Credit Plans (Essential / Standard / Premium) ─────────

export const companyPlansApi = {
  list: () =>
    api.get<ApiResponse<CompanyPlanResponse[]>>("/user-credit-plans").then((r) => r.data.data),

  get: (id: number) =>
    api.get<ApiResponse<CompanyPlanResponse>>(`/user-credit-plans/${id}`).then((r) => r.data.data),
};

// ─── Company Admin Management ──────────────────────────────

export const companyAdminManagementApi = {
  viewTeamMembers: (companyId: number) =>
    api.get<ApiResponse<CompanyTeamMember[]>>("/company-admin/team-members", { params: { companyId } })
      .then((r) => r.data.data),

  listUsers: (companyId: number) =>
    api.get<ApiResponse<CompanyTeamMember[]>>("/company-admin/users", { params: { companyId } })
      .then((r) => r.data.data),

  createUser: (data: CompanyAdminUserCreateRequest) =>
    api.post<ApiResponse<CompanyTeamMember>>("/company-admin/users", data).then((r) => r.data.data),

  updateUser: (companyUserId: number, data: CompanyAdminUserUpdateRequest) =>
    api.put<ApiResponse<CompanyTeamMember>>(`/company-admin/users/${companyUserId}`, data).then((r) => r.data.data),

  deleteUser: (companyUserId: number) =>
    api.delete<ApiResponse<null>>(`/company-admin/users/${companyUserId}`).then((r) => r.data.data),

  restrictAccess: (companyUserId: number, restricted: boolean) =>
    api.put<ApiResponse<{ user_id: number; restricted: boolean; is_active: boolean }>>(
      `/company-admin/users/${companyUserId}/restrict-access`,
      { restricted }
    ).then((r) => r.data.data),

  removeEmployee: (employeeId: number, companyId: number) =>
    api.delete<ApiResponse<null>>(`/company-admin/employees/${employeeId}`, { params: { companyId } })
      .then((r) => r.data.data),

  exportCompanyData: (companyId: number) =>
    api.get<ApiResponse<Record<string, unknown>>>("/company-admin/export/company-data", { params: { companyId } })
      .then((r) => r.data.data),

  deleteCompany: (companyId: number) =>
    api.delete<ApiResponse<null>>(`/company-admin/companies/${companyId}`).then((r) => r.data.data),

  allocateCredits: (data: CompanyAdminCreditAllocationRequest) =>
    api.post<ApiResponse<CompanyTeamMember>>("/company-admin/allocate-credits", data).then((r) => r.data.data),
};
