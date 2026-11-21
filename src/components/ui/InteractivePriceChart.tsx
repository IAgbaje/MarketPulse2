import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'motion/react';

export interface ChartDataset {
  label: string;
  data: (number | null)[];
  color: string;
}

interface InteractivePriceChartProps {
  labels: string[];
  datasets: ChartDataset[];
  priceMultiplier?: number;
}

type TimeRangeKey = '1M' | '3M' | '6M' | 'ALL';

const RANGE_OPTIONS: { key: TimeRangeKey; label: string; points: number }[] = [
  { key: '1M', label: '1M', points: 3 },
  { key: '3M', label: '3M', points: 6 },
  { key: '6M', label: '6M', points: 10 },
  { key: 'ALL', label: 'All', points: 999 },
];

export const InteractivePriceChart: React.FC<InteractivePriceChartProps> = ({
  labels,
  datasets,
  priceMultiplier = 1,
}) => {
  const [range, setRange] = useState<TimeRangeKey>('ALL');
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  const sliceCount = useMemo(() => {
    const opt = RANGE_OPTIONS.find((r) => r.key === range);
    return Math.min(labels.length, Math.max(2, opt?.points ?? labels.length));
  }, [range, labels.length]);

  const startIdx = Math.max(0, labels.length - sliceCount);
  const visibleLabels = useMemo(() => labels.slice(startIdx), [labels, startIdx]);

  const scaledDatasets = useMemo(() => {
    return datasets.map((ds) => ({
      ...ds,
      visible: !hiddenSeries[ds.label],
      data: ds.data
        .slice(startIdx)
        .map((v) => (v === null ? null : Math.round((v * priceMultiplier) / 100) * 100)),
    }));
  }, [datasets, hiddenSeries, startIdx, priceMultiplier]);

  const activeValues = useMemo(() => {
    const vals: number[] = [];
    scaledDatasets.forEach((ds) => {
      if (!ds.visible) return;
      ds.data.forEach((v) => {
        if (v !== null) vals.push(v);
      });
    });
    return vals;
  }, [scaledDatasets]);

  const rawMin = activeValues.length ? Math.min(...activeValues) : 10000;
  const rawMax = activeValues.length ? Math.max(...activeValues) : 50000;
  const pad = Math.max(1000, Math.round((rawMax - rawMin) * 0.14));
  const minVal = Math.max(0, rawMin - pad);
  const maxVal = rawMax + pad;
  const valRange = maxVal - minVal || 1;

  // Logical coordinate space for crisp SVG rendering
  const padLeft = 52;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 30;
  const vbWidth = 620;
  const vbHeight = 250;
  const plotW = vbWidth - padLeft - padRight;
  const plotH = vbHeight - padTop - padBottom;

  const getX = (idx: number) => {
    if (visibleLabels.length <= 1) return padLeft;
    return padLeft + (idx / (visibleLabels.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    return padTop + plotH - ((val - minVal) / valRange) * plotH;
  };

  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const buildAreaPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    const linePath = buildSmoothPath(pts);
    const baselineY = padTop + plotH;
    return `${linePath} L ${pts[pts.length - 1].x} ${baselineY} L ${pts[0].x} ${baselineY} Z`;
  };

  const updateScrubFromClientX = (clientX: number) => {
    const container = svgContainerRef.current;
    if (!container || visibleLabels.length === 0) return;
    const rect = container.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * vbWidth;
    const ratio = Math.max(0, Math.min(1, (relX - padLeft) / plotW));
    const nearest = Math.round(ratio * (visibleLabels.length - 1));
    setScrubIndex(nearest);
  };

  const toggleSeries = (label: string) => {
    const visibleCount = scaledDatasets.filter((d) => d.visible).length;
    if (visibleCount <= 1 && !hiddenSeries[label]) return; // keep at least 1 series active
    setHiddenSeries((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const effectiveIdx = scrubIndex !== null ? Math.min(scrubIndex, visibleLabels.length - 1) : null;
  const activeScrubLabel = effectiveIdx !== null ? visibleLabels[effectiveIdx] : null;
  const activeScrubEntries = useMemo(() => {
    if (effectiveIdx === null) return [];
    return scaledDatasets
      .filter((d) => d.visible && d.data[effectiveIdx] !== null)
      .map((d) => ({
        label: d.label,
        color: d.color,
        value: d.data[effectiveIdx] as number,
      }));
  }, [effectiveIdx, scaledDatasets]);

  const scrubSpread =
    activeScrubEntries.length >= 2
      ? Math.abs(activeScrubEntries[0].value - activeScrubEntries[1].value)
      : null;

  // Show evenly spaced X-axis labels so they never collide
  const xLabelStep = visibleLabels.length > 7 ? 2 : 1;

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Range Segmented Control & Hint */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center bg-[#eef2f6] p-1 rounded-xl border border-slate-900/6">
          {RANGE_OPTIONS.map((opt) => {
            const isActive = range === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setRange(opt.key);
                  setScrubIndex(null);
                }}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  isActive ? 'text-[#003852]' : 'text-[#64748b] hover:text-[#111827]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="chart-range-pill"
                    transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                    className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-900/6"
                  />
                )}
                <span className="relative z-10">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-[#64748b] hidden sm:inline">
          Hover or drag across the chart to inspect exact prices
        </span>
      </div>

      {/* Interactive Scrubbing Canvas */}
      <div
        ref={svgContainerRef}
        onPointerMove={(e) => updateScrubFromClientX(e.clientX)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          updateScrubFromClientX(e.clientX);
        }}
        onPointerLeave={() => setScrubIndex(null)}
        onPointerUp={() => setScrubIndex(null)}
        className="relative w-full rounded-2xl bg-[#f6f8fb] border border-slate-900/8 p-2 sm:p-3 select-none touch-none cursor-crosshair"
      >
        {/* Floating Scrub Tooltip */}
        {effectiveIdx !== null && activeScrubEntries.length > 0 && (
          <div
            className="pointer-events-none absolute top-3 z-20 glass-card rounded-xl border border-slate-900/12 shadow-lg px-3 py-2.5 min-w-[175px] transition-all duration-75"
            style={{
              left:
                effectiveIdx > visibleLabels.length * 0.62
                  ? '12px'
                  : `min(calc(${(getX(effectiveIdx) / vbWidth) * 100}% + 12px), calc(100% - 195px))`,
            }}
          >
            <div className="text-[11px] font-semibold text-[#64748b] mb-1.5">
              {activeScrubLabel}
            </div>
            <div className="space-y-1">
              {activeScrubEntries.map((entry) => (
                <div key={entry.label} className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-[#475569] truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="truncate">{entry.label.replace(' Market', '')}</span>
                  </span>
                  <span className="font-mono-num font-bold text-[#111827] whitespace-nowrap">
                    ₦{entry.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            {scrubSpread !== null && scrubSpread > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-900/8 flex items-center justify-between text-[11px]">
                <span className="text-[#64748b]">Market spread</span>
                <span className="font-mono-num font-semibold text-[#00567c]">
                  ₦{scrubSpread.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        <svg
          viewBox={`0 0 ${vbWidth} ${vbHeight}`}
          className="w-full h-56 sm:h-64 overflow-visible"
          role="img"
          aria-label="Interactive commodity price history chart"
        >
          <defs>
            <linearGradient id="mp-primary-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00567c" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#00567c" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Tabular Y Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padTop + plotH - ratio * plotH;
            const val = minVal + ratio * valRange;
            const formatted =
              val >= 1000 ? `₦${Math.round(val / 1000)}k` : `₦${Math.round(val)}`;
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={vbWidth - padRight}
                  y2={y}
                  stroke="rgba(15, 23, 42, 0.08)"
                  strokeDasharray={ratio === 0 ? undefined : '3 3'}
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                  className="font-mono-num"
                >
                  {formatted}
                </text>
              </g>
            );
          })}

          {/* X-Axis Labels */}
          {visibleLabels.map((lbl, idx) => {
            const show =
              idx === 0 ||
              idx === visibleLabels.length - 1 ||
              idx % xLabelStep === 0 ||
              idx === effectiveIdx;
            if (!show) return null;
            const x = getX(idx);
            const isHighlighted = idx === effectiveIdx;
            return (
              <text
                key={`${lbl}-${idx}`}
                x={x}
                y={vbHeight - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isHighlighted ? '700' : '500'}
                fill={isHighlighted ? '#00567c' : '#64748b'}
              >
                {lbl}
              </text>
            );
          })}

          {/* Scrub Vertical Crosshair */}
          {effectiveIdx !== null && (
            <line
              x1={getX(effectiveIdx)}
              y1={padTop}
              x2={getX(effectiveIdx)}
              y2={padTop + plotH}
              stroke="#00567c"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.65"
            />
          )}

          {/* Render Secondary Lines First, Primary Line On Top */}
          {[...scaledDatasets].reverse().map((ds, revIdx) => {
            if (!ds.visible) return null;
            const isPrimary = revIdx === scaledDatasets.length - 1;
            const pts = ds.data
              .map((val, idx) => (val === null ? null : { x: getX(idx), y: getY(val), val, idx }))
              .filter((p): p is { x: number; y: number; val: number; idx: number } => p !== null);

            return (
              <g key={ds.label}>
                {isPrimary && pts.length >= 2 && (
                  <path d={buildAreaPath(pts)} fill="url(#mp-primary-area)" />
                )}
                <path
                  d={buildSmoothPath(pts)}
                  fill="none"
                  stroke={ds.color}
                  strokeWidth={isPrimary ? 2.75 : 2}
                  strokeDasharray={isPrimary ? undefined : '5 3'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {pts.map((p) => {
                  const isScrubbed = p.idx === effectiveIdx;
                  return (
                    <g key={p.idx}>
                      {isScrubbed && (
                        <circle cx={p.x} cy={p.y} r="9" fill={ds.color} opacity="0.16" />
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isScrubbed ? 5 : isPrimary ? 3.5 : 3}
                        fill="#ffffff"
                        stroke={ds.color}
                        strokeWidth={isScrubbed ? 2.5 : 2}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Market Series Toggles */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {scaledDatasets.map((ds) => (
          <button
            key={ds.label}
            type="button"
            onClick={() => toggleSeries(ds.label)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              ds.visible
                ? 'bg-white border-slate-900/12 text-[#111827] shadow-2xs'
                : 'bg-[#eef2f6] border-transparent text-[#64748b] opacity-60'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: ds.visible ? ds.color : '#94a3b8' }}
            />
            <span>{ds.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
