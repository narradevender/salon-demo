"use client";

import { motion } from "framer-motion";

// ----------------------------------------------------------------------------
// Area chart for time-series (e.g. revenue over days)
// ----------------------------------------------------------------------------
type AreaPoint = { x: string; y: number };
type AreaFormat = "number" | "inr-compact" | "inr";

function formatByMode(v: number, mode: AreaFormat): string {
  if (mode === "inr-compact") return `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`;
  if (mode === "inr") return `₹${v}`;
  return String(v);
}

export function AreaChart({
  data,
  format = "number",
  height = 260,
}: {
  data: AreaPoint[];
  format?: AreaFormat;
  height?: number;
}) {
  const formatValue = (v: number) => formatByMode(v, format);
  const width = 800;
  const padding = { top: 24, right: 24, bottom: 36, left: 56 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const maxY = Math.max(...data.map((d) => d.y), 1);
  const stepX = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerH - (d.y / maxY) * innerH,
  }));

  let linePath = "";
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      linePath += `M ${points[i].x} ${points[i].y}`;
    } else {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      linePath += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
  }
  const lastX = points[points.length - 1]?.x ?? padding.left;
  const firstX = points[0]?.x ?? padding.left;
  const areaPath = `${linePath} L ${lastX} ${padding.top + innerH} L ${firstX} ${padding.top + innerH} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({
    y: padding.top + innerH - p * innerH,
    label: formatValue(Math.round(p * maxY)),
  }));

  // Show roughly 6 x-axis labels
  const stride = Math.max(1, Math.ceil(data.length / 6));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="area-amber" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={tick.y}
            y2={tick.y}
            stroke="rgba(255,255,255,0.07)"
            strokeDasharray="3 4"
          />
          <text
            x={padding.left - 10}
            y={tick.y + 3}
            fill="#64748b"
            fontSize="10"
            textAnchor="end"
          >
            {tick.label}
          </text>
        </g>
      ))}

      <motion.path
        d={areaPath}
        fill="url(#area-amber)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay: 0.5 }}
      />
      <motion.path
        d={linePath}
        stroke="#fbbf24"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3.5"
          fill="#0f172a"
          stroke="#fbbf24"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3, delay: 1.0 + i * 0.03 }}
        />
      ))}

      {data.map((d, i) => {
        if (i % stride !== 0 && i !== data.length - 1) return null;
        return (
          <text
            key={i}
            x={padding.left + i * stepX}
            y={height - 12}
            fill="#64748b"
            fontSize="10"
            textAnchor="middle"
          >
            {d.x}
          </text>
        );
      })}
    </svg>
  );
}

// ----------------------------------------------------------------------------
// Horizontal bars (e.g. top services)
// ----------------------------------------------------------------------------
type BarRow = { label: string; value: number; sub?: string };

export function HorizontalBarChart({
  rows,
  accentClass = "bg-gradient-to-r from-amber-400 to-amber-200",
}: {
  rows: BarRow[];
  accentClass?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
        No data yet.
      </p>
    );
  }

  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-4">
      {rows.map((row, i) => {
        const pct = (row.value / max) * 100;
        return (
          <li key={row.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-white">{row.label}</span>
              {row.sub && (
                <span className="shrink-0 text-xs text-slate-400">{row.sub}</span>
              )}
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className={`h-full rounded-full ${accentClass}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ----------------------------------------------------------------------------
// Donut chart (e.g. booking sources)
// ----------------------------------------------------------------------------
type DonutSlice = { label: string; value: number; color: string };

export function DonutChart({
  slices,
  total,
  totalLabel = "Total",
}: {
  slices: DonutSlice[];
  total: number;
  totalLabel?: string;
}) {
  const radius = 56;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative">
        <svg viewBox="-80 -80 160 160" className="h-44 w-44 -rotate-90">
          <circle
            cx="0"
            cy="0"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {slices.map((slice, i) => {
            const fraction = total > 0 ? slice.value / total : 0;
            const length = fraction * circumference;
            const dashOffset = -cumulativeOffset;
            cumulativeOffset += length;
            return (
              <motion.circle
                key={slice.label}
                cx="0"
                cy="0"
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${length} ${circumference}`}
                strokeDashoffset={dashOffset}
                initial={{ opacity: 0, pathLength: 0 }}
                whileInView={{ opacity: 1, pathLength: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: "easeOut" }}
              />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold text-white">{total}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-slate-400">
            {totalLabel}
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {slices.map((slice) => {
          const pct = total > 0 ? Math.round((slice.value / total) * 100) : 0;
          return (
            <li key={slice.label} className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="font-medium capitalize text-white">{slice.label}</span>
              <span className="text-xs text-slate-400">
                {slice.value} ({pct}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Hourly bars (all 24 hours)
// ----------------------------------------------------------------------------
type HourBar = { hour: number; value: number };

function formatHour12(h: number) {
  const period = h < 12 ? "AM" : "PM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display} ${period}`;
}

export function HourlyBarsChart({ hours }: { hours: HourBar[] }) {
  const max = Math.max(...hours.map((h) => h.value), 1);
  return (
    <div>
      <div className="flex h-48 items-end gap-1">
        {hours.map((h, i) => {
          const pct = h.value > 0 ? (h.value / max) * 100 : 0;
          const isPeak = h.value === max && h.value > 0;
          return (
            <div
              key={h.hour}
              className="group relative flex flex-1 flex-col items-center justify-end gap-1"
              title={`${h.value} bookings · ${formatHour12(h.hour)}`}
            >
              <span
                className={`text-[10px] font-medium transition-opacity ${
                  isPeak ? "text-amber-200 opacity-100" : "text-slate-500 opacity-0 group-hover:opacity-100"
                }`}
              >
                {h.value > 0 ? h.value : ""}
              </span>
              <motion.div
                className={`w-full rounded-t-md transition-colors ${
                  isPeak
                    ? "bg-gradient-to-t from-amber-500 to-amber-200"
                    : h.value > 0
                      ? "bg-sky-400/70 group-hover:bg-sky-300"
                      : "bg-white/5"
                }`}
                style={{ minHeight: h.value > 0 ? 4 : 2 }}
                initial={{ height: 0 }}
                whileInView={{ height: `${Math.max(pct, h.value > 0 ? 4 : 1)}%` }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.02, ease: "easeOut" }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between text-[10px] text-slate-500">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
}
