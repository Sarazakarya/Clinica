export type ReportKind = "appointments" | "invoices" | "patients";

export type ReportsFilters = {
  report: ReportKind;
  status: string;
  type: string;
  paymentMethod: string;
  doctor: string;
  startDate: string;
  endDate: string;
};

export type ReportParams = Record<string, string>;

export type AppointmentReportFilters = {
  status?: string; type?: string; doctor?: string; startDate?: string; endDate?: string;
};
export type InvoiceReportFilters = {
  status?: string; paymentMethod?: string; doctor?: string; startDate?: string; endDate?: string;
};
export type PatientReportFilters = { startDate?: string; endDate?: string };

type ReportDoctor = { _id: string; name?: string | null };
type ReportPatient = { _id: string; personalInformation?: { name?: string | null; phone?: string | null } | null };

export type AppointmentReportRecord = {
  _id: string; patientType?: string | null; patient?: ReportPatient | null; doctor?: ReportDoctor | null;
  date: string; startTime?: string | null; duration?: number | null; status?: string | null; type?: string | null;
};
export type InvoiceService = { name: string; price: number; discount: number; total: number };
export type InvoiceReportRecord = {
  _id: string; invoiceNumber: string; patient?: ReportPatient | null; doctor?: ReportDoctor | null;
  invoiceDate: string; services?: InvoiceService[]; total: number; paid: number; remaining: number;
  paymentMethod?: string | null; status?: string | null;
};
export type VisitsByDoctorRecord = {
  doctor?: ReportDoctor | string | null; doctorName?: string | null; visits?: number | null;
  totalVisits?: number | null; count?: number | null;
};
export type AppointmentsReportResponse = { status: string; results?: number; data: { appointments: AppointmentReportRecord[] } };
export type InvoicesReportResponse = { status: string; results?: number; data: { invoices: InvoiceReportRecord[] } };
export type PatientsReportResponse = {
  status: string;
  data: { summary: { uniquePatients: number; totalVisits: number; newPatients: number }; visitsByDoctor: VisitsByDoctorRecord[] };
};
