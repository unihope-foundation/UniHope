"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { formatINR } from "@/components/admin/admin-utils";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DonationActivityCalendar() {
  const [istNow] = useState(() => {
    const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    return {
      year: now.getUTCFullYear(),
      month: now.getUTCMonth(),
      dateKey: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`,
    };
  });

  const [cursor, setCursor] = useState({
    year: istNow.year,
    month: istNow.month,
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const activity = useQuery(api.dashboard.getCalendarActivity, {
    year: cursor.year,
    month: cursor.month,
  });

  const cells = useMemo(() => {
    const firstWeekday = new Date(
      Date.UTC(cursor.year, cursor.month, 1),
    ).getUTCDay();
    const daysInMonth = new Date(
      Date.UTC(cursor.year, cursor.month + 1, 0),
    ).getUTCDate();

    const list: Array<{ day: number | null; dateKey: string | null }> = [];
    for (let i = 0; i < firstWeekday; i++) {
      list.push({ day: null, dateKey: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(cursor.month + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      list.push({ day: d, dateKey: `${cursor.year}-${mStr}-${dStr}` });
    }
    return list;
  }, [cursor]);

  const handlePrevMonth = () => {
    setSelectedDateKey(null);
    setCursor((prev) =>
      prev.month === 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: prev.month - 1 },
    );
  };

  const handleNextMonth = () => {
    setSelectedDateKey(null);
    setCursor((prev) =>
      prev.month === 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: prev.month + 1 },
    );
  };

  const selectedDayDonations = useMemo(() => {
    if (!activity?.donations || !selectedDateKey) return [];
    return activity.donations.filter((d) => d.dateKey === selectedDateKey);
  }, [activity, selectedDateKey]);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#012A5F]">
            Donation Calendar
          </h2>
          {activity && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {activity.totalCount} in month
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-[#012A5F] cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[96px] text-center text-xs font-semibold text-slate-700">
            {MONTH_NAMES[cursor.month].slice(0, 3)} {cursor.year}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-[#012A5F] cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="text-center text-[10px] font-semibold uppercase text-slate-400"
            >
              {wd}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (!cell.day || !cell.dateKey) {
              return <div key={`empty-${idx}`} className="h-7" />;
            }
            const dayStats = activity?.days?.[cell.dateKey];
            const hasActivity = Boolean(dayStats && dayStats.count > 0);
            const isSelected = selectedDateKey === cell.dateKey;
            const isToday = istNow.dateKey === cell.dateKey;

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() =>
                  setSelectedDateKey(isSelected ? null : cell.dateKey)
                }
                title={
                  hasActivity
                    ? `${cell.dateKey}: ${dayStats!.count} donations (${formatINR(dayStats!.amount)})`
                    : cell.dateKey
                }
                className={`relative flex h-7 items-center justify-center rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#012A5F] text-white font-semibold"
                    : hasActivity
                      ? "bg-[#12715B]/12 text-[#12715B] font-semibold hover:bg-[#12715B]/20"
                      : isToday
                        ? "border border-[#F88C29] text-[#012A5F]"
                        : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cell.day}
                {hasActivity && !isSelected && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#12715B]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Activity Preview */}
      <div className="mt-3 border-t border-slate-100 pt-2.5">
        {selectedDateKey ? (
          selectedDayDonations.length === 0 ? (
            <p className="text-[11px] text-slate-400 text-center py-1">
              No donations on {selectedDateKey}.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {selectedDayDonations.map((d) => (
                <Link
                  key={d._id}
                  href={`/admin/donations/${d._id}`}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] hover:bg-slate-100 transition-colors"
                >
                  <span className="truncate font-medium text-slate-700">
                    {d.donorName} · {d.receiptNumber}
                  </span>
                  <span className="font-semibold text-[#12715B] tabular-nums shrink-0 ml-2">
                    {formatINR(d.amount)}
                  </span>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-[#12715B]" />
              Click any highlighted day to inspect
            </span>
            {activity && (
              <span className="font-semibold text-[#012A5F] tabular-nums">
                {formatINR(activity.totalAmount)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
