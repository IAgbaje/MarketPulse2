import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Commodity, ItemCategory, RegionProfile } from '../types';
import {
  DATA_YEARS,
  DataYear,
  FIRST_OFFICIAL_CPI,
  LATEST_OFFICIAL_CPI,
  MonthlyCpiDataPoint,
  NBS_CBN_MONTHLY_CPI,
  OFFICIAL_AUTHORITY_SOURCES,
  PREVIOUS_OFFICIAL_CPI,
  computeBasketInflationSummary,
  getCommodityAnnualAverages,
} from '../data/foodInflationData';
import { FoodIconBadge } from './ui/FoodIconBadge';

interface FoodInflationPanelProps {
  commodities: Commodity[];
  activeRegion: RegionProfile;
  onSelectCommodity: (commodityId: string) => void;
}

type IndicatorSuite = 'inflation' | 'cbn-macro' | 'energy-transport';
type YearScope = 'ALL' | DataYear;

interface MetricConfig {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  unit: '%' | '₦' | '$bn';
  getValue: (pt: MonthlyCpiDataPoint) => number;
  format: (v: number) => string;
}

const SUITE_METRICS: Record<IndicatorSuite, MetricConfig[]> = {
  inflation: [
    {
      id: 'foodInflationYoY',
      label: 'Food Inflation (YoY %)',
      shortLabel: 'Food YoY',
      color: '#00567c',
      unit: '%',
      getValue: (p) => p.foodInflationYoY,
      format: (v) => `${v.toFixed(2)}%`,
    },
    {
      id: 'headlineInflationYoY',
      label: 'Headline CPI (YoY %)',
      shortLabel: 'Headline YoY',
      color: '#0f766e',
      unit: '%',
      getValue: (p) => p.headlineInflationYoY,
      format: (v) => `${v.toFixed(2)}%`,
    },
    {
      id: 'coreInflationYoY',
      label: 'Core Inflation (YoY %)',
      shortLabel: 'Core YoY',
      color: '#6366f1',
      unit: '%',
      getValue: (p) => p.coreInflationYoY,
      format: (v) => `${v.toFixed(2)}%`,
    },
    {
      id: 'foodInflationMoM',
      label: 'Food Month-on-Month (%)',
      shortLabel: 'Food MoM',
      color: '#d97706',
      unit: '%',
      getValue: (p) => p.foodInflationMoM,
      format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(2)}%`,
    },
  ],
  'cbn-macro': [
    {
      id: 'cbnMpr',
      label: 'CBN Policy Rate (MPR %)',
      shortLabel: 'MPR %',
      color: '#00567c',
      unit: '%',
      getValue: (p) => p.cbnMpr,
      format: (v) => `${v.toFixed(2)}%`,
    },
    {
      id: 'usdNgnOfficial',
      label: 'Official USD/NGN (NFEM)',
      shortLabel: 'USD / NGN',
      color: '#b45309',
      unit: '₦',
      getValue: (p) => p.usdNgnOfficial,
      format: (v) => `₦${Math.round(v).toLocaleString('en-NG')}`,
    },
    {
      id: 'externalReservesUsdBn',
      label: 'Gross External Reserves ($bn)',
      shortLabel: 'Reserves ($bn)',
      color: '#15803d',
      unit: '$bn',
      getValue: (p) => p.externalReservesUsdBn,
      format: (v) => `$${v.toFixed(1)}B`,
    },
    {
      id: 'tbill364Yield',
      label: '364-Day T-Bill Yield (%)',
      shortLabel: '364D T-Bill',
      color: '#475569',
      unit: '%',
      getValue: (p) => p.tbill364Yield,
      format: (v) => `${v.toFixed(1)}%`,
    },
  ],
  'energy-transport': [
    {
      id: 'petrolPmsPerLitre',
      label: 'Petrol / PMS (₦ per Litre)',
      shortLabel: 'Petrol (PMS)',
      color: '#b91c1c',
      unit: '₦',
      getValue: (p) => p.petrolPmsPerLitre,
      format: (v) => `₦${Math.round(v).toLocaleString('en-NG')}/L`,
    },
    {
      id: 'dieselAgoPerLitre',
      label: 'Diesel / AGO (₦ per Litre)',
      shortLabel: 'Diesel (AGO)',
      color: '#00567c',
      unit: '₦',
      getValue: (p) => p.dieselAgoPerLitre,
      format: (v) => `₦${Math.round(v).toLocaleString('en-NG')}/L`,
    },
    {
      id: 'cookingGas125kg',
      label: 'Cooking Gas LPG (12.5kg)',
      shortLabel: 'Gas 12.5kg',
      color: '#d97706',
      unit: '₦',
      getValue: (p) => p.cookingGas125kg,
      format: (v) => `₦${Math.round(v).toLocaleString('en-NG')}`,
    },
    {
      id: 'intraCityBusFare',
      label: 'Intra-City Bus Fare (NBS)',
      shortLabel: 'Bus Fare',
      color: '#475569',
      unit: '₦',
      getValue: (p) => p.intraCityBusFare,
      format: (v) => `₦${Math.round(v).toLocaleString('en-NG')}`,
    },
  ],
};

export const FoodInflationPanel: React.FC<FoodInflationPanelProps> = ({
  commodities,
  activeRegion,
  onSelectCommodity,
}) => {
  const [suite, setSuite] = useState<IndicatorSuite>('inflation');
  const [selectedMetricId, setSelectedMetricId] = useState<string>('foodInflationYoY');
  const [yearScope, setYearScope] = useState<YearScope>('ALL');
  const [inspectedIdx, setInspectedIdx] = useState<number>(NBS_CBN_MONTHLY_CPI.length - 1);
  const [sortBy, setSortBy] = useState<'since23-desc' | 'mom-desc' | 'mom-asc' | 'yoy-desc'>('since23-desc');
  const chartRef = useRef<HTMLDivElement | null>(null);

  const multiplier = activeRegion.priceMultiplier || 1;

  const basketSummary = useMemo(
    () => computeBasketInflationSummary(commodities, multiplier),
    [commodities, multiplier]
  );

  const suiteMetrics = SUITE_METRICS[suite];
  const activeMetric =
    suiteMetrics.find((m) => m.id === selectedMetricId) || suiteMetrics[0];

  const handleSuiteChange = (nextSuite: IndicatorSuite) => {
    setSuite(nextSuite);
    setSelectedMetricId(SUITE_METRICS[nextSuite][0].id);
  };

  const visibleSeries = useMemo(() => {
    if (yearScope === 'ALL') return NBS_CBN_MONTHLY_CPI;
    return NBS_CBN_MONTHLY_CPI.filter((p) => p.year === yearScope);
  }, [yearScope]);

  const safeInspectedIdx = Math.min(inspectedIdx, visibleSeries.length - 1);
  const inspectedMonth =
    visibleSeries[safeInspectedIdx] || visibleSeries[visibleSeries.length - 1] || LATEST_OFFICIAL_CPI;

  // Build SVG coordinates for interactive multi-year macro/inflation line+area chart
  const values = visibleSeries.map((pt) => activeMetric.getValue(pt));
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padY = Math.max(0.5, (rawMax - rawMin) * 0.14);
  const minVal = rawMin < 0 ? rawMin - padY : Math.max(0, rawMin - padY);
  const maxVal = rawMax + padY;
  const rangeVal = maxVal - minVal || 1;

  const vbW = 640;
  const vbH = 230;
  const padL = 58;
  const padR = 14;
  const padT = 18;
  const padB = 28;
  const plotW = vbW - padL - padR;
  const plotH = vbH - padT - padB;

  const getX = (i: number) =>
    visibleSeries.length <= 1 ? padL : padL + (i / (visibleSeries.length - 1)) * plotW;
  const getY = (v: number) => padT + plotH - ((v - minVal) / rangeVal) * plotH;

  const points = visibleSeries.map((pt, i) => ({
    x: getX(i),
    y: getY(activeMetric.getValue(pt)),
    val: activeMetric.getValue(pt),
    pt,
    i,
  }));

  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length < 2) return '';
    const baseY = padT + plotH;
    return `${linePath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
  }, [linePath, points, plotH]);

  // Index of Jan 25 rebasing marker inside visibleSeries (when viewing CPI & Inflation across ALL)
  const rebaseIdx = useMemo(() => {
    if (suite !== 'inflation') return -1;
    return visibleSeries.findIndex((p) => p.year === 2025 && p.monthIndex === 1);
  }, [suite, visibleSeries]);

  const handleChartPointer = (clientX: number) => {
    const el = chartRef.current;
    if (!el || visibleSeries.length === 0) return;
    const rect = el.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * vbW;
    const ratio = Math.max(0, Math.min(1, (relX - padL) / plotW));
    const idx = Math.round(ratio * (visibleSeries.length - 1));
    setInspectedIdx(idx);
  };

  const xStep = visibleSeries.length > 24 ? 7 : visibleSeries.length > 12 ? 3 : 2;

  // Multi-year food staple breakdown table (2023 Avg, 2024 Avg, 2025 Avg, Nov 26, MoM %, 12M %, Since Jan 23 %)
  const sortedStaples = useMemo(() => {
    const rows = commodities.map((c) => {
      const hub = c.chartData.datasets[0]?.data || [];
      const lastIdx = hub.length - 1;
      const curRaw = hub[lastIdx] ?? c.latestPrice;
      const prevRaw = hub[Math.max(0, lastIdx - 1)] ?? c.latestPrice;
      const yrRaw = hub[Math.max(0, lastIdx - 12)] ?? hub[0] ?? c.latestPrice;
      const jan23Raw = hub[0] ?? c.latestPrice;

      const curState = Math.round((curRaw * multiplier) / 50) * 50;
      const momPct = prevRaw ? Number((((curRaw - prevRaw) / prevRaw) * 100).toFixed(1)) : 0;
      const yoyPct = yrRaw ? Number((((curRaw - yrRaw) / yrRaw) * 100).toFixed(1)) : 0;
      const since23Pct = jan23Raw ? Number((((curRaw - jan23Raw) / jan23Raw) * 100).toFixed(0)) : 0;
      const avgs = getCommodityAnnualAverages(c, multiplier);

      return {
        commodity: c,
        curState,
        avgs,
        momPct,
        yoyPct,
        since23Pct,
      };
    });

    return rows.sort((a, b) => {
      if (sortBy === 'since23-desc') return b.since23Pct - a.since23Pct;
      if (sortBy === 'mom-desc') return b.momPct - a.momPct;
      if (sortBy === 'mom-asc') return a.momPct - b.momPct;
      return b.yoyPct - a.yoyPct;
    });
  }, [commodities, multiplier, sortBy]);

  return (
    <div className="space-y-6">
      {/* Top 4 Live NBS & CBN Snapshot KPI Cards (Nov 2026 vs Jan 2023) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="text-xs font-medium text-[#6e6e73]">
            NBS Food Inflation · {LATEST_OFFICIAL_CPI.month}
          </div>
          <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f]">
            {LATEST_OFFICIAL_CPI.foodInflationYoY.toFixed(2)}%
          </div>
          <p className="text-xs text-[#15803d] font-medium">
            MoM {LATEST_OFFICIAL_CPI.foodInflationMoM.toFixed(2)}% · down from{' '}
            {PREVIOUS_OFFICIAL_CPI.foodInflationYoY.toFixed(2)}% in {PREVIOUS_OFFICIAL_CPI.month}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="text-xs font-medium text-[#6e6e73]">
            CBN Policy Rate (MPR) · FX Rate
          </div>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f]">
              {LATEST_OFFICIAL_CPI.cbnMpr.toFixed(2)}%
            </span>
            <span className="font-mono-num text-sm font-bold text-[#00567c]">
              ₦{LATEST_OFFICIAL_CPI.usdNgnOfficial.toLocaleString('en-NG')}/$
            </span>
          </div>
          <p className="text-xs text-[#6e6e73]">
            Reserves: ${LATEST_OFFICIAL_CPI.externalReservesUsdBn.toFixed(1)}B · 364D T-Bill{' '}
            {LATEST_OFFICIAL_CPI.tbill364Yield.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-1.5">
          <div className="text-xs font-medium text-[#6e6e73]">
            NBS Fuel &amp; Cooking Gas Watch
          </div>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <span className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f]">
              ₦{LATEST_OFFICIAL_CPI.petrolPmsPerLitre.toLocaleString('en-NG')}
              <span className="text-xs font-semibold text-[#6e6e73]">/L</span>
            </span>
            <span className="font-mono-num text-xs font-bold text-[#b45309]">
              LPG ₦{LATEST_OFFICIAL_CPI.cookingGas125kg.toLocaleString('en-NG')}
            </span>
          </div>
          <p className="text-xs text-[#6e6e73]">
            PMS up from ₦{FIRST_OFFICIAL_CPI.petrolPmsPerLitre}/L in Jan 23 · Diesel ₦
            {LATEST_OFFICIAL_CPI.dieselAgoPerLitre.toLocaleString('en-NG')}/L
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#00567c]/20 shadow-2xs space-y-1.5">
          <div className="text-xs font-semibold text-[#00567c] truncate">
            {commodities.length}-Staple Basket · {activeRegion.state.replace(' State', '')}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display font-mono-num text-2xl sm:text-3xl font-extrabold ${
                basketSummary.basketMoMPct <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
              }`}
            >
              {basketSummary.basketMoMPct > 0 ? '+' : ''}
              {basketSummary.basketMoMPct.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-[#6e6e73]">MoM</span>
          </div>
          <p className="text-xs text-[#6e6e73]">
            +{basketSummary.basketSince2023Pct.toFixed(0)}% since Jan 2023 ·{' '}
            {basketSummary.coolingCount} items eased in Nov
          </p>
        </div>
      </div>

      {/* Multi-Year Interactive NBS & CBN Observatory (Jan 2023 – Nov 2026) */}
      <section className="bg-white rounded-2xl p-4 sm:p-6 border border-black/[0.06] shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div>
            <h2 className="font-display font-bold text-base sm:text-lg text-[#1d1d1f]">
              Nigeria Official NBS &amp; CBN Multi-Year Data (2023 – 2026)
            </h2>
            <p className="text-xs text-[#6e6e73] mt-0.5">
              47 consecutive monthly releases · Slide or tap anywhere on the chart to inspect any
              month
            </p>
          </div>

          {/* Year Scope Filter */}
          <div
            role="tablist"
            aria-label="Filter years"
            className="inline-grid grid-cols-5 bg-[#f2f2f7] p-1 rounded-xl border border-black/[0.05] w-full lg:w-auto shrink-0"
          >
            {(['ALL', ...DATA_YEARS] as YearScope[]).map((yr) => {
              const active = yearScope === yr;
              return (
                <button
                  key={yr}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  onClick={() => {
                    setYearScope(yr);
                    setInspectedIdx(999);
                  }}
                  className={`relative px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    active ? 'text-[#00567c]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="macro-year-pill"
                      transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                      className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-black/[0.05]"
                    />
                  )}
                  <span className="relative z-10">{yr === 'ALL' ? '2023–26' : yr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Indicator Suite Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-y border-black/[0.06] py-3">
          <div className="grid grid-cols-3 sm:inline-flex gap-1.5">
            {(
              [
                { id: 'inflation', label: 'NBS Inflation' },
                { id: 'cbn-macro', label: 'CBN Macro & FX' },
                { id: 'energy-transport', label: 'Fuel & Gas' },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSuiteChange(s.id)}
                className={`px-3 py-2 min-h-[40px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  suite === s.id
                    ? 'bg-[#00567c] text-white'
                    : 'bg-[#f5f5f7] text-[#3a3a3c] hover:bg-[#e8e8ed]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Metric Selector within Suite */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {suiteMetrics.map((m) => {
              const active = activeMetric.id === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMetricId(m.id)}
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#eef6fb] border-[#00567c]/35 text-[#00567c]'
                      : 'bg-white border-black/[0.07] text-[#48484a] hover:bg-[#f5f5f7]'
                  }`}
                >
                  {m.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Multi-Year SVG Line/Area Explorer */}
        <div
          ref={chartRef}
          onPointerMove={(e) => handleChartPointer(e.clientX)}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            handleChartPointer(e.clientX);
          }}
          className="bg-[#f6f8fb] rounded-2xl border border-black/[0.06] p-2.5 sm:p-4 select-none touch-none cursor-crosshair"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 mb-2 text-xs">
            <span className="font-semibold text-[#1d1d1f]">{activeMetric.label}</span>
            <span className="font-mono-num font-bold text-[#00567c]">
              {inspectedMonth.fullLabel}: {activeMetric.format(activeMetric.getValue(inspectedMonth))}
            </span>
          </div>

          <svg
            viewBox={`0 0 ${vbW} ${vbH}`}
            className="w-full h-48 sm:h-60 overflow-visible"
            role="img"
            aria-label={`${activeMetric.label} chart from 2023 to 2026`}
          >
            <defs>
              <linearGradient id="macro-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={activeMetric.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={activeMetric.color} stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((r) => {
              const y = padT + plotH - r * plotH;
              const v = minVal + r * rangeVal;
              const lbl =
                activeMetric.unit === '%'
                  ? `${v.toFixed(0)}%`
                  : activeMetric.unit === '$bn'
                  ? `$${v.toFixed(0)}B`
                  : v >= 1000
                  ? `₦${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`
                  : `₦${Math.round(v)}`;
              return (
                <g key={r}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={vbW - padR}
                    y2={y}
                    stroke="rgba(15,23,42,0.08)"
                    strokeDasharray={r === 0 ? undefined : '3 3'}
                  />
                  <text
                    x={padL - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10.5"
                    fill="#64748b"
                    className="font-mono-num"
                  >
                    {lbl}
                  </text>
                </g>
              );
            })}

            {/* NBS Rebased CPI (2024=100) structural break marker in Jan 2025 */}
            {rebaseIdx > 0 && (
              <g>
                <line
                  x1={getX(rebaseIdx)}
                  y1={padT}
                  x2={getX(rebaseIdx)}
                  y2={padT + plotH}
                  stroke="#d97706"
                  strokeWidth="1.25"
                  strokeDasharray="3 3"
                />
                <text
                  x={getX(rebaseIdx) + 5}
                  y={padT + 11}
                  fontSize="9.5"
                  fontWeight="700"
                  fill="#b45309"
                >
                  NBS Rebased (2024=100)
                </text>
              </g>
            )}

            {/* Area & Curve */}
            {areaPath && <path d={areaPath} fill="url(#macro-area-grad)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={activeMetric.color}
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Inspected Vertical Hairline + Active Dot */}
            {points[safeInspectedIdx] && (
              <g>
                <line
                  x1={points[safeInspectedIdx].x}
                  y1={padT}
                  x2={points[safeInspectedIdx].x}
                  y2={padT + plotH}
                  stroke={activeMetric.color}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.7"
                />
                <circle
                  cx={points[safeInspectedIdx].x}
                  cy={points[safeInspectedIdx].y}
                  r="9"
                  fill={activeMetric.color}
                  opacity="0.18"
                />
                <circle
                  cx={points[safeInspectedIdx].x}
                  cy={points[safeInspectedIdx].y}
                  r="4.5"
                  fill="#ffffff"
                  stroke={activeMetric.color}
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* X-Axis Labels */}
            {visibleSeries.map((pt, idx) => {
              const isLast = idx === visibleSeries.length - 1;
              const tooClose = visibleSeries.length - 1 - idx < Math.max(2, Math.floor(xStep / 2));
              if (!(idx === 0 || isLast || (!tooClose && idx % xStep === 0))) return null;
              return (
                <text
                  key={pt.month}
                  x={getX(idx)}
                  y={vbH - 7}
                  textAnchor={idx === 0 ? 'start' : isLast ? 'end' : 'middle'}
                  fontSize="10.5"
                  fontWeight={idx === safeInspectedIdx ? '700' : '500'}
                  fill={idx === safeInspectedIdx ? '#00567c' : '#64748b'}
                >
                  {pt.month}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Full Inspected Month Economic Dossier (All NBS + CBN + Energy figures for that month) */}
        <div className="p-4 rounded-xl bg-[#eef6fb]/60 border border-[#00567c]/15 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-display font-bold text-sm text-[#1d1d1f]">
                {inspectedMonth.fullLabel}
              </span>
              <span aria-hidden="true" className="text-[#86868b]">·</span>
              <span className="font-medium text-[#00567c]">CPI Base: {inspectedMonth.cpiBase}</span>
            </div>
            <span className="text-[11px] font-mono-num text-[#6e6e73]">
              Food CPI Index: {inspectedMonth.foodCpiIndex.toFixed(1)}
            </span>
          </div>

          <p className="text-xs text-[#3a3a3c] leading-relaxed">{inspectedMonth.note}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-black/[0.06] font-mono-num">
            <div>
              <div className="text-[11px] font-sans text-[#6e6e73]">Food YoY / MoM</div>
              <div className="text-xs font-bold text-[#1d1d1f] mt-0.5">
                {inspectedMonth.foodInflationYoY.toFixed(2)}%{' '}
                <span
                  className={
                    inspectedMonth.foodInflationMoM <= 0 ? 'text-[#15803d]' : 'text-[#b91c1c]'
                  }
                >
                  ({inspectedMonth.foodInflationMoM > 0 ? '+' : ''}
                  {inspectedMonth.foodInflationMoM.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-sans text-[#6e6e73]">Headline / Core</div>
              <div className="text-xs font-bold text-[#1d1d1f] mt-0.5">
                {inspectedMonth.headlineInflationYoY.toFixed(2)}% /{' '}
                {inspectedMonth.coreInflationYoY.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[11px] font-sans text-[#6e6e73]">CBN MPR / CRR</div>
              <div className="text-xs font-bold text-[#1d1d1f] mt-0.5">
                {inspectedMonth.cbnMpr.toFixed(2)}% / {inspectedMonth.crrPct.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[11px] font-sans text-[#6e6e73]">NFEM FX / Res</div>
              <div className="text-xs font-bold text-[#1d1d1f] mt-0.5">
                ₦{inspectedMonth.usdNgnOfficial.toLocaleString('en-NG')} · $
                {inspectedMonth.externalReservesUsdBn.toFixed(1)}B
              </div>
            </div>
            <div>
              <div className="text-[11px] font-sans text-[#6e6e73]">PMS / Diesel</div>
              <div className="text-xs font-bold text-[#1d1d1f] mt-0.5">
                ₦{inspectedMonth.petrolPmsPerLitre.toLocaleString('en-NG')} / ₦
                {inspectedMonth.dieselAgoPerLitre.toLocaleString('en-NG')}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-sans text-[#6e6e73]">LPG 12.5kg / Bus</div>
              <div className="text-xs font-bold text-[#1d1d1f] mt-0.5">
                ₦{inspectedMonth.cookingGas125kg.toLocaleString('en-NG')} / ₦
                {inspectedMonth.intraCityBusFare.toLocaleString('en-NG')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Year Staple Inflation Table Across All 16 Tracked Nigerian Food Items */}
      <section className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-base text-[#1d1d1f]">
              2023 – 2026 Staple Price Evolution ({activeRegion.name})
            </h2>
            <p className="text-xs text-[#6e6e73] mt-0.5">
              Tap any staple to inspect its full 47-month NBS/CBN chart &amp; state market spread
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {(
              [
                { id: 'since23-desc', label: 'Biggest 2023–26 Jump' },
                { id: 'mom-desc', label: 'MoM Risers' },
                { id: 'mom-asc', label: 'MoM Drops' },
                { id: 'yoy-desc', label: '12M Jump' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                className={`px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  sortBy === opt.id
                    ? 'bg-[#00567c] text-white'
                    : 'bg-[#f5f5f7] text-[#48484a] hover:bg-[#e5e5ea]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f5f7]/80 text-[11px] font-semibold text-[#6e6e73] border-b border-black/[0.06]">
                <th className="py-3 px-4 sm:px-5 whitespace-nowrap">Food Item</th>
                <th className="py-3 px-3 text-right whitespace-nowrap hidden lg:table-cell">2023 Avg</th>
                <th className="py-3 px-3 text-right whitespace-nowrap hidden md:table-cell">2024 Avg</th>
                <th className="py-3 px-3 text-right whitespace-nowrap hidden sm:table-cell">2025 Avg</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Nov 2026</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">MoM %</th>
                <th className="py-3 px-4 sm:px-5 text-right whitespace-nowrap">vs Jan 23</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05] text-sm">
              {sortedStaples.map(({ commodity, curState, avgs, momPct, since23Pct }) => {
                const isCooling = momPct < 0;
                const isSteady = momPct === 0;
                return (
                  <tr
                    key={commodity.id}
                    onClick={() => onSelectCommodity(commodity.id)}
                    className="hover:bg-[#f5f5f7]/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 sm:px-5">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <FoodIconBadge
                          name={commodity.name}
                          category={commodity.category as ItemCategory}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-[#1d1d1f] truncate max-w-[145px] sm:max-w-none">
                            {commodity.name}
                          </div>
                          <div className="text-[11px] text-[#6e6e73] truncate max-w-[145px] sm:max-w-none">
                            {commodity.unitDescription}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num text-xs text-[#6e6e73] whitespace-nowrap hidden lg:table-cell">
                      ₦{avgs[2023].toLocaleString('en-NG')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num text-xs text-[#6e6e73] whitespace-nowrap hidden md:table-cell">
                      ₦{avgs[2024].toLocaleString('en-NG')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num text-xs text-[#6e6e73] whitespace-nowrap hidden sm:table-cell">
                      ₦{avgs[2025].toLocaleString('en-NG')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num font-bold text-[#1d1d1f] whitespace-nowrap">
                      ₦{curState.toLocaleString('en-NG')}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-mono-num text-xs font-bold ${
                          isSteady
                            ? 'text-[#6e6e73]'
                            : isCooling
                            ? 'text-[#15803d]'
                            : 'text-[#b91c1c]'
                        }`}
                      >
                        {momPct > 0 ? `+${momPct.toFixed(1)}%` : `${momPct.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className="py-3 px-4 sm:px-5 text-right font-mono-num text-xs font-bold text-[#b91c1c] whitespace-nowrap">
                      +{since23Pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Credible Institutional Sources Footer */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1d1d1f]">
          <span className="material-symbols-outlined text-[18px] text-[#00567c]">
            verified
          </span>
          <span>Official Authorities &amp; Methodology (Jan 2023 – Nov 2026)</span>
        </div>
        <p className="text-xs text-[#6e6e73] leading-relaxed">
          Historical 2023–2024 CPI figures follow Nigeria&apos;s pre-rebased 2009 = 100 base;
          January 2025 onward reflects the NBS Rebased CPI (2024 = 100). Food staple series, PMS,
          Diesel, Cooking Gas (12.5kg), and CBN MPR/NFEM/Reserves indicators are compiled continuously
          across all 47 months with state market multipliers applied to reflect your local market bag.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {OFFICIAL_AUTHORITY_SOURCES.map((src) => (
            <a
              key={src.name}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-[#f5f5f7] hover:bg-[#eef6fb] text-xs font-semibold text-[#00567c] transition-colors"
            >
              <span>{src.name}</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
