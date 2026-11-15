"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Title from "@/shared/components/atoms/Title";
import Button from "@/shared/components/atoms/Button";
import ReportsFilters from "../components/organisms/ReportsFilters";
import ReportsTable from "../components/organisms/ReportsTable";
import { getReportParams } from "../lib/reportParams";
import type { ReportsFilters as ReportsFiltersState } from "../types/reports";

const initialFilters: ReportsFiltersState = {
  report: "appointments",
  status: "",
  type: "",
  paymentMethod: "",
  doctor: "",
  startDate: "",
  endDate: "",
};

const createInitialFilters = (
  report: ReportsFiltersState["report"] = "appointments",
): ReportsFiltersState => ({ ...initialFilters, report });

export default function ReportsTemplate() {
  const t = useTranslations("reports");
  const [filters, setFilters] = useState(createInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState(createInitialFilters);
  const params = useMemo(
    () => getReportParams(appliedFilters.report, appliedFilters),
    [appliedFilters],
  );
  const selectReport = (report: ReportsFiltersState["report"]) => {
    const next = createInitialFilters(report);
    setFilters(next);
    setAppliedFilters(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <Title size="lg">{t("title")}</Title>
        <p className="ds-text-secondary mt-2 text-sm">{t("subtitle")}</p>
      </div>
      <nav
        className="ds-bg-card ds-shadow-sm flex w-full gap-2 overflow-x-auto rounded-[18px] p-2"
        aria-label={t("tabsLabel")}
      >
        {(["appointments", "invoices", "patients"] as const).map((report) => (
          <Button
            key={report}
            type="button"
            size="sm"
            variant={filters.report === report ? "primary" : "ghost"}
            onClick={() => selectReport(report)}
            className="shrink-0"
          >
            {t(`reportTypes.${report}`)}
          </Button>
        ))}
      </nav>
      <ReportsFilters
        filters={filters}
        onChange={setFilters}
        onApply={() => setAppliedFilters(filters)}
        onReset={() => {
          const next = createInitialFilters(filters.report);
          setFilters(next);
          setAppliedFilters(next);
        }}
      />
      <ReportsTable report={appliedFilters.report} params={params} />
    </div>
  );
}
