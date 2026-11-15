"use client";

import { CalendarDays, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import useDoctors from "@/modules/dashboard/doctors/hooks/useDoctors";
import Button from "@/shared/components/atoms/Button";
import Input from "@/shared/components/atoms/Input";
import Select from "@/shared/components/atoms/Select";
import Text from "@/shared/components/atoms/Text";
import type { ReportsFilters as ReportsFiltersState } from "../../types/reports";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
} from "@/modules/dashboard/appointments/lib/appointmentOptions";

interface ReportsFiltersProps {
  filters: ReportsFiltersState;
  onChange: (filters: ReportsFiltersState) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function ReportsFilters({
  filters,
  onChange,
  onApply,
  onReset,
}: ReportsFiltersProps) {
  const t = useTranslations("reports");
  const { data: doctors = [] } = useDoctors();
  const update = (key: keyof ReportsFiltersState, value: string) =>
    onChange({ ...filters, [key]: value });
  const doctorOptions = [
    { value: "", label: t("filters.allDoctors") },
    ...doctors.map((doctor) => ({ value: doctor.id, label: doctor.name })),
  ];

  return (
    <section className="ds-bg-card ds-shadow-sm rounded-[18px] p-5 sm:p-6">
      <h2 className="ds-text mb-6 text-lg font-bold">{t("filters.title")}</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filters.report === "appointments" && (
          <Select
            label={t("filters.status")}
            value={filters.status}
            onChange={(value) => update("status", value)}
            options={[
              { value: "", label: t("filters.allStatuses") },
              ...APPOINTMENT_STATUSES.map((value) => ({
                value,
                label: t(`statusLabels.${value}`),
              })),
            ]}
          />
        )}
        {filters.report === "appointments" && (
          <Select
            label={t("filters.appointmentType")}
            value={filters.type}
            onChange={(value) => update("type", value)}
            options={[
              { value: "", label: t("filters.allTypes") },
              ...APPOINTMENT_TYPES.map((value) => ({
                value,
                label: t(`appointmentTypes.${value}`),
              })),
            ]}
          />
        )}
        {filters.report === "invoices" && (
          <Select
            label={t("filters.status")}
            value={filters.status}
            onChange={(value) => update("status", value)}
            options={[
              { value: "", label: t("filters.allStatuses") },
              ...["paid", "partial", "unpaid"].map((value) => ({
                value,
                label: t(`invoiceStatuses.${value}`),
              })),
            ]}
          />
        )}
        {filters.report === "invoices" && (
          <Select
            label={t("filters.paymentMethod")}
            value={filters.paymentMethod}
            onChange={(value) => update("paymentMethod", value)}
            options={[
              { value: "", label: t("filters.allPaymentMethods") },
              ...["cash", "card", "insurance"].map((value) => ({
                value,
                label: t(`paymentMethods.${value}`),
              })),
            ]}
          />
        )}
        {filters.report !== "patients" && (
          <Select
            label={t("filters.doctor")}
            value={filters.doctor}
            onChange={(value) => update("doctor", value)}
            options={doctorOptions}
          />
        )}
        <DateFilter
          label={t("filters.startDate")}
          value={filters.startDate}
          onChange={(value) => update("startDate", value)}
        />
        <DateFilter
          label={t("filters.endDate")}
          value={filters.endDate}
          onChange={(value) => update("endDate", value)}
        />
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onReset}
        >
          <X size={18} />
          {t("filters.resetFilters")}
        </Button>
        <Button type="button" size="sm" className="gap-2" onClick={onApply}>
          <Search size={18} />
          {t("filters.applyFilters")}
        </Button>
      </div>
    </section>
  );
}

function DateFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Text size="sm" variant="secondary">
        {label}
      </Text>
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        trailingIcon={<CalendarDays size={18} />}
      />
    </div>
  );
}
