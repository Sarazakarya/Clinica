"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../lib/reportsApi";
import type { ReportParams } from "../types/reports";

export const reportKeys = {
  all: ["reports"] as const,
  appointments: (params: ReportParams) =>
    [...reportKeys.all, "appointments", params] as const,
  invoices: (params: ReportParams) =>
    [...reportKeys.all, "invoices", params] as const,
  patients: (params: ReportParams) =>
    [...reportKeys.all, "patients", params] as const,
};

export const useAppointmentsReport = (params: ReportParams) =>
  useQuery({
    queryKey: reportKeys.appointments(params),
    queryFn: () => reportsApi.getAppointmentsReport(params),
  });
export const useInvoicesReport = (params: ReportParams) =>
  useQuery({
    queryKey: reportKeys.invoices(params),
    queryFn: () => reportsApi.getInvoicesReport(params),
  });
export const usePatientsReport = (params: ReportParams) =>
  useQuery({
    queryKey: reportKeys.patients(params),
    queryFn: () => reportsApi.getPatientsReport(params),
  });
