import type {
  ReportKind,
  ReportParams,
  ReportsFilters,
} from "../types/reports";

const cleanParams = (params: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value.trim() !== ""),
  );

export const getReportParams = (
  report: ReportKind,
  filters: ReportsFilters,
): ReportParams => {
  const dateRange = { startDate: filters.startDate, endDate: filters.endDate };

  if (report === "appointments") {
    return cleanParams({
      ...dateRange,
      status: filters.status,
      type: filters.type,
      doctor: filters.doctor,
    });
  }
  if (report === "invoices") {
    return cleanParams({
      ...dateRange,
      status: filters.status,
      paymentMethod: filters.paymentMethod,
      doctor: filters.doctor,
    });
  }
  return cleanParams(dateRange);
};
