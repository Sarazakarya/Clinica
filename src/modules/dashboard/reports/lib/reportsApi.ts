import axiosConfig from "@/services/axiosConfig";
import type {
  AppointmentsReportResponse,
  InvoicesReportResponse,
  PatientsReportResponse,
  ReportParams,
} from "../types/reports";

const getAppointmentsReport = async (params: ReportParams) =>
  (
    await axiosConfig.get<AppointmentsReportResponse>("/reports/appointments", {
      params,
    })
  ).data;

const getInvoicesReport = async (params: ReportParams) =>
  (
    await axiosConfig.get<InvoicesReportResponse>("/reports/invoice", {
      params,
    })
  ).data;

const getPatientsReport = async (params: ReportParams) =>
  (
    await axiosConfig.get<PatientsReportResponse>("/reports/patient", {
      params,
    })
  ).data;

export const reportsApi = {
  getAppointmentsReport,
  getInvoicesReport,
  getPatientsReport,
};
