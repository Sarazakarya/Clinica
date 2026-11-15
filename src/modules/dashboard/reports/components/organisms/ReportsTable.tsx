"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Badge, { type BadgeTone } from "@/shared/components/atoms/Badge";
import Button from "@/shared/components/atoms/Button";
import StatusCard from "@/shared/components/atoms/StatusCard";
import Text from "@/shared/components/atoms/Text";
import TableCard from "@/shared/components/molecules/TableCard";
import TableHeaderRow from "@/shared/components/molecules/TableHeaderRow";
import TableSkeleton from "@/shared/components/skeletons/TableSkeleton";
import InfoStatCard from "@/modules/dashboard/patients/components/atoms/InfoStatCard";
import {
  useAppointmentsReport,
  useInvoicesReport,
  usePatientsReport,
} from "../../hooks/useReports";
import type {
  AppointmentReportRecord,
  InvoiceReportRecord,
  ReportKind,
  ReportParams,
  VisitsByDoctorRecord,
} from "../../types/reports";

interface Props {
  report: ReportKind;
  params: ReportParams;
}
const dash = "—";
const statusTones: Record<string, BadgeTone> = {
  paid: "success",
  partial: "yellow",
  unpaid: "red",
  pending: "neutral",
  confirmed: "success",
  completed: "info",
  cancelled: "red",
  "no-show": "orange",
};
const statusTone = (status?: string | null): BadgeTone =>
  statusTones[status ?? ""] ?? "neutral";
function Loading({ columns }: { columns: string[] }) {
  return (
    <TableCard minWidth="min-w-[900px]">
      <TableHeaderRow columns={columns} />
      <tbody>
        <TableSkeleton columns={columns.length} />
      </tbody>
    </TableCard>
  );
}
function Summary({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <InfoStatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
function StateBadge({
  status,
  label,
}: {
  status?: string | null;
  label: string;
}) {
  return status ? (
    <Badge tone={statusTone(status)}>{label}</Badge>
  ) : (
    <span className="ds-text-secondary">{dash}</span>
  );
}

function Appointments({ params }: { params: ReportParams }) {
  const t = useTranslations("reports");
  const format = useFormatter();
  const query = useAppointmentsReport(params);
  const columns = [
    t("table.columns.appointmentDateTime"),
    t("table.columns.patient"),
    t("table.columns.patientType"),
    t("table.columns.doctor"),
    t("table.columns.type"),
    t("table.columns.duration"),
    t("table.columns.status"),
  ];
  if (query.isLoading) return <Loading columns={columns} />;
  if (query.isError)
    return (
      <StatusCard
        tone="error"
        description={t("table.loadError")}
        actionLabel={t("table.retry")}
        onAction={() => query.refetch()}
      />
    );
  const rows = query.data?.data.appointments ?? [];
  const completeResultSet =
    query.data?.results === undefined || query.data.results === rows.length;
  const count = (status: string) =>
    rows.filter((row) => row.status === status).length;
  return (
    <section className="space-y-4">
      {completeResultSet && (
        <Summary
          items={[
            {
              label: t("summary.totalAppointments"),
              value: String(query.data?.results ?? rows.length),
            },
            {
              label: t("summary.pendingAppointments"),
              value: String(count("pending")),
            },
            {
              label: t("summary.completedAppointments"),
              value: String(count("completed")),
            },
            {
              label: t("summary.cancelledAppointments"),
              value: String(count("cancelled")),
            },
          ]}
        />
      )}
      {rows.length === 0 ? (
        <StatusCard description={t("table.empty")} />
      ) : (
        <TableCard minWidth="min-w-[1100px]">
          <TableHeaderRow columns={columns} />
          <tbody>
            {rows.map((row) => (
              <AppointmentRow key={row._id} row={row} format={format} />
            ))}
          </tbody>
        </TableCard>
      )}
    </section>
  );
  function AppointmentRow({
    row,
    format: numberFormat,
  }: {
    row: AppointmentReportRecord;
    format: ReturnType<typeof useFormatter>;
  }) {
    return (
      <tr className="ds-border-gray border-b last:border-0 hover:bg-black/[0.02]">
        <td className="ds-text px-5 py-4 text-sm">
          {numberFormat.dateTime(new Date(row.date), { dateStyle: "medium" })}
          {row.startTime ? ` · ${row.startTime}` : ""}
        </td>
        <td className="ds-text px-5 py-4 text-sm">
          {row.patient?.personalInformation?.name ??
            t("table.patientUnavailable")}
        </td>
        <td className="ds-text-secondary px-5 py-4 text-sm">
          {row.patientType ? t(`patientTypes.${row.patientType}`) : dash}
        </td>
        <td className="ds-text px-5 py-4 text-sm">
          {row.doctor?.name ?? dash}
        </td>
        <td className="ds-text-secondary px-5 py-4 text-sm">
          {row.type ? t(`appointmentTypes.${row.type}`) : dash}
        </td>
        <td className="ds-text-secondary px-5 py-4 text-sm">
          {row.duration == null
            ? dash
            : t("table.minutes", { count: row.duration })}
        </td>
        <td className="px-5 py-4">
          <StateBadge
            status={row.status}
            label={t(`statusLabels.${row.status}`)}
          />
        </td>
      </tr>
    );
  }
}

function Invoices({ params }: { params: ReportParams }) {
  const t = useTranslations("reports");
  const format = useFormatter();
  const query = useInvoicesReport(params);
  const columns = [
    t("table.columns.invoiceNumber"),
    t("table.columns.invoiceDate"),
    t("table.columns.patient"),
    t("table.columns.doctor"),
    t("table.columns.total"),
    t("table.columns.paid"),
    t("table.columns.remaining"),
    t("table.columns.paymentMethod"),
    t("table.columns.status"),
    t("table.columns.services"),
  ];
  if (query.isLoading) return <Loading columns={columns} />;
  if (query.isError)
    return (
      <StatusCard
        tone="error"
        description={t("table.loadError")}
        actionLabel={t("table.retry")}
        onAction={() => query.refetch()}
      />
    );
  const rows = query.data?.data.invoices ?? [];
  const completeResultSet =
    query.data?.results === undefined || query.data.results === rows.length;
  const totals = rows.reduce(
    (sum, row) => ({
      total: sum.total + row.total,
      paid: sum.paid + row.paid,
      remaining: sum.remaining + row.remaining,
    }),
    { total: 0, paid: 0, remaining: 0 },
  );
  const money = (value: number) =>
    format.number(value, { maximumFractionDigits: 2 });
  return (
    <section className="space-y-4">
      {completeResultSet && (
        <Summary
          items={[
            {
              label: t("summary.totalInvoices"),
              value: String(query.data?.results ?? rows.length),
            },
            { label: t("summary.invoiceAmount"), value: money(totals.total) },
            { label: t("summary.totalPaid"), value: money(totals.paid) },
            {
              label: t("summary.totalRemaining"),
              value: money(totals.remaining),
            },
          ]}
        />
      )}
      {rows.length === 0 ? (
        <StatusCard description={t("table.empty")} />
      ) : (
        <TableCard minWidth="min-w-[1300px]">
          <TableHeaderRow columns={columns} />
          <tbody>
            {rows.map((row) => (
              <InvoiceRow key={row._id} row={row} />
            ))}
          </tbody>
        </TableCard>
      )}
    </section>
  );
  function InvoiceRow({ row }: { row: InvoiceReportRecord }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <tr className="ds-border-gray border-b hover:bg-black/[0.02]">
          <td className="ds-text px-5 py-4 text-sm font-semibold">
            {row.invoiceNumber}
          </td>
          <td className="ds-text-secondary px-5 py-4 text-sm" dir="ltr">
            {format.dateTime(new Date(row.invoiceDate), {
              dateStyle: "medium",
            })}
          </td>
          <td className="ds-text px-5 py-4 text-sm">
            {row.patient?.personalInformation?.name ??
              t("table.patientUnavailable")}
          </td>
          <td className="ds-text px-5 py-4 text-sm">
            {row.doctor?.name ?? dash}
          </td>
          <td className="ds-text px-5 py-4 text-sm">{money(row.total)}</td>
          <td className="ds-text px-5 py-4 text-sm">{money(row.paid)}</td>
          <td className="ds-text px-5 py-4 text-sm font-medium">
            {money(row.remaining)}
          </td>
          <td className="ds-text-secondary px-5 py-4 text-sm">
            {row.paymentMethod
              ? t(`paymentMethods.${row.paymentMethod}`)
              : dash}
          </td>
          <td className="px-5 py-4">
            <StateBadge
              status={row.status}
              label={t(`invoiceStatuses.${row.status}`)}
            />
          </td>
          <td className="px-5 py-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
            >
              {t("table.columns.services")}
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </td>
        </tr>
        {open && (
          <tr className="ds-border-gray border-b">
            <td colSpan={10} className="ds-bg-grey p-5">
              <Text size="sm" className="mb-3 font-semibold">
                {t("table.columns.services")}
              </Text>
              {row.services?.length ? (
                <div className="grid gap-2 text-sm">
                  {row.services.map((service, index) => (
                    <div
                      key={`${service.name}-${index}`}
                      className="grid grid-cols-4 gap-3"
                    >
                      <span>{service.name}</span>
                      <span>
                        {t("table.price")}: {money(service.price)}
                      </span>
                      <span>
                        {t("table.discount")}: {money(service.discount)}
                      </span>
                      <span>
                        {t("table.columns.total")}: {money(service.total)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <Text size="sm" variant="secondary">
                  {t("table.noServices")}
                </Text>
              )}
            </td>
          </tr>
        )}
      </>
    );
  }
}

function Patients({ params }: { params: ReportParams }) {
  const t = useTranslations("reports");
  const query = usePatientsReport(params);
  const columns = [t("table.columns.doctor"), t("table.columns.visits")];
  if (query.isLoading) return <Loading columns={columns} />;
  if (query.isError)
    return (
      <StatusCard
        tone="error"
        description={t("table.loadError")}
        actionLabel={t("table.retry")}
        onAction={() => query.refetch()}
      />
    );
  const data = query.data?.data;
  const rows = data?.visitsByDoctor ?? [];
  return (
    <section className="space-y-4">
      <Summary
        items={[
          {
            label: t("summary.uniquePatients"),
            value: String(data?.summary.uniquePatients ?? 0),
          },
          {
            label: t("summary.totalVisits"),
            value: String(data?.summary.totalVisits ?? 0),
          },
          {
            label: t("summary.newPatients"),
            value: String(data?.summary.newPatients ?? 0),
          },
        ]}
      />
      <div>
        <Text size="lg" className="mb-3 font-bold">
          {t("visitsByDoctor")}
        </Text>
        {rows.length === 0 ? (
          <StatusCard description={t("table.emptyVisits")} />
        ) : (
          <TableCard minWidth="min-w-[500px]">
            <TableHeaderRow columns={columns} />
            <tbody>
              {rows.map((row, index) => (
                <VisitRow key={index} row={row} />
              ))}
            </tbody>
          </TableCard>
        )}
      </div>
    </section>
  );
  function VisitRow({ row }: { row: VisitsByDoctorRecord }) {
    const name =
      typeof row.doctor === "string"
        ? row.doctor
        : (row.doctor?.name ?? row.doctorName ?? dash);
    return (
      <tr className="ds-border-gray border-b last:border-0">
        <td className="ds-text px-5 py-4 text-sm">{name}</td>
        <td className="ds-text px-5 py-4 text-sm">
          {row.visits ?? row.totalVisits ?? row.count ?? 0}
        </td>
      </tr>
    );
  }
}

export default function ReportsTable({ report, params }: Props) {
  return report === "appointments" ? (
    <Appointments params={params} />
  ) : report === "invoices" ? (
    <Invoices params={params} />
  ) : (
    <Patients params={params} />
  );
}
