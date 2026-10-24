import React, { useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { INITIAL_COMMODITIES } from '../data/initialData';

export const CommodityDetailScreen: React.FC = () => {
  const { selectedCommodity, selectCommodityById, goBack } = useMarketPulse();
  const [activeMarketView, setActiveMarketView] = useState<'both' | 'mile12' | 'oyingbo'>('both');

  const commodity = selectedCommodity || INITIAL_COMMODITIES[0];

  // SVG Chart points calculation
  const labels = commodity.chartData.labels;
  const ds1 = commodity.chartData.datasets[0];
  const ds2 = commodity.chartData.datasets[1];

  const allValues = [
    ...(ds1?.data.filter((v): v is number => v !== null) || []),
    ...(ds2?.data.filter((v): v is number => v !== null) || []),
  ];
  const minVal = Math.min(...allValues, 30000);
  const maxVal = Math.max(...allValues, 50000);
  const valRange = maxVal - minVal || 1;

  const chartHeight = 160;
  const chartWidth = 280;

  const getPoints = (data: (number | null)[]) => {
    return data
      .map((val, idx) => {
        if (val === null) return null;
        const x = (idx / (labels.length - 1)) * chartWidth;
        const y = chartHeight - ((val - minVal) / valRange) * chartHeight;
        return { x, y, val };
      })
      .filter((p): p is { x: number; y: number; val: number } => p !== null);
  };

  const pts1 = ds1 ? getPoints(ds1.data) : [];
  const pts2 = ds2 ? getPoints(ds2.data) : [];

  const createSvgPath = (points: { x: number; y: number }[]) => {
    if (!points.length) return '';
    return points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  };

  // Crowd position percentage
  const crowdMin = commodity.crowdRangeMin;
  const crowdMax = commodity.crowdRangeMax;
  const crowdPercent = Math.min(
    100,
    Math.max(0, ((commodity.latestPrice - crowdMin) / (crowdMax - crowdMin)) * 100)
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-20 pb-32 px-4 md:px-6 max-w-3xl mx-auto w-full space-y-6">
      <button
        onClick={goBack}
        className="flex items-center text-[#40484e] hover:text-[#00567c] transition-colors text-xs font-semibold w-fit -mb-2"
      >
        <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
        Back
      </button>

      {/* Commodity Selector Pill Row */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {INITIAL_COMMODITIES.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCommodityById(c.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              commodity.id === c.id
                ? 'bg-[#00567c] text-white shadow-xs'
                : 'bg-white text-[#40484e] border border-[#c0c7cf]/40 hover:bg-[#eceef1]'
            }`}
          >
            <span>{c.emoji}</span>
            <span>{c.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Header Section */}
      <section className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#eceef1] flex items-center justify-center text-2xl shadow-xs border border-[#c0c7cf]/30">
            <span>{commodity.emoji}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#191c1f] tracking-tight">
              {commodity.name}
            </h2>
            <p className="text-[#40484e] text-xs font-medium">
              {commodity.unitDescription}
            </p>
          </div>
        </div>

        {/* Latest Price Card */}
        <div className="bg-white rounded-2xl p-5 border border-[#c0c7cf]/30 shadow-xs mt-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold text-[#40484e] uppercase tracking-wider mb-1">
                Your Latest Price
              </p>
              <p className="text-4xl font-extrabold text-[#00567c] tabular-nums tracking-tight">
                ₦{commodity.latestPrice.toLocaleString()}
              </p>
              <p className="text-xs text-[#71787f] mt-1">
                {commodity.latestMarket} • {commodity.recencyText}
              </p>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-[#ba1a1a] bg-[#ffdad6]/50 px-2.5 py-1 rounded-md mb-1 font-bold text-xs tabular-nums">
                <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                <span>
                  ₦{commodity.priceChangeAmount.toLocaleString()} ({commodity.priceChangePct}%)
                </span>
              </div>
              <p className="text-[11px] text-[#71787f]">{commodity.vsPeriodText}</p>
            </div>
          </div>

          {/* Crowd Comparison */}
          <div className="mt-5 pt-4 border-t border-[#e1e2e6]">
            <div className="flex justify-between items-center mb-2 text-xs font-semibold text-[#40484e]">
              <span>Crowd Comparison</span>
              <span className="text-[#71787f] text-[11px]">
                {commodity.crowdReportsCount} reports this week
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-3.5 bg-[#e1e2e6] rounded-full overflow-hidden relative shadow-inner">
                {/* 25th - 75th percentile box */}
                <div className="absolute left-[20%] right-[25%] h-full bg-[#cbe3f7]" />
                {/* User price indicator bar */}
                <div
                  className="absolute w-1.5 h-full bg-[#00567c] rounded-full z-10 shadow-xs"
                  style={{ left: `${crowdPercent}%` }}
                  title="Your latest logged price"
                />
              </div>
              <div className="text-xs font-bold text-[#191c1f] tabular-nums whitespace-nowrap">
                ₦{Math.round(commodity.crowdRangeMin / 1000)}k - ₦{Math.round(commodity.crowdRangeMax / 1000)}k
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chart Section */}
      <section className="bg-white rounded-2xl p-5 border border-[#c0c7cf]/30 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-base text-[#191c1f]">Price History</h3>
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveMarketView('both')}
              className={`px-2 py-1 rounded text-[11px] font-semibold ${
                activeMarketView === 'both' ? 'bg-[#cbe3f7] text-[#00567c]' : 'text-[#71787f]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveMarketView('mile12')}
              className={`px-2 py-1 rounded text-[11px] font-semibold ${
                activeMarketView === 'mile12' ? 'bg-[#cbe3f7] text-[#00567c]' : 'text-[#71787f]'
              }`}
            >
              Mile 12
            </button>
          </div>
        </div>

        {/* Custom SVG Line Chart */}
        <div className="w-full relative px-2 py-3 bg-[#f8f9fd] rounded-xl border border-[#e1e2e6]">
          <svg viewBox={`-30 -10 ${chartWidth + 50} ${chartHeight + 40}`} className="w-full h-48 overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight - ratio * chartHeight;
              const val = Math.round((minVal + ratio * valRange) / 1000);
              return (
                <g key={ratio}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#e1e2e6"
                    strokeDasharray="3 3"
                  />
                  <text x="-8" y={y + 4} textAnchor="end" fontSize="10" fill="#71787f">
                    ₦{val}k
                  </text>
                </g>
              );
            })}

            {/* X Axis labels */}
            {labels.map((lbl, idx) => {
              const x = (idx / (labels.length - 1)) * chartWidth;
              return (
                <text
                  key={lbl}
                  x={x}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#40484e"
                >
                  {lbl}
                </text>
              );
            })}

            {/* Line 2: Oyingbo */}
            {(activeMarketView === 'both' || activeMarketView === 'oyingbo') && ds2 && (
              <>
                <path
                  d={createSvgPath(pts2)}
                  fill="none"
                  stroke="#4b6172"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                {pts2.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#ffffff"
                    stroke="#4b6172"
                    strokeWidth="2"
                  />
                ))}
              </>
            )}

            {/* Line 1: Mile 12 */}
            {(activeMarketView === 'both' || activeMarketView === 'mile12') && ds1 && (
              <>
                <path
                  d={createSvgPath(pts1)}
                  fill="none"
                  stroke="#00567c"
                  strokeWidth="3"
                />
                {pts1.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill="#ffffff"
                    stroke="#00567c"
                    strokeWidth="2.5"
                  />
                ))}
              </>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-xs font-semibold text-[#40484e]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#00567c] block" />
            <span>Mile 12 Market</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#4b6172] block" />
            <span>Oyingbo Market</span>
          </div>
        </div>
      </section>

      {/* Logged Purchases List */}
      <section>
        <h3 className="font-bold text-base text-[#191c1f] mb-3 px-1">
          Your Logged Purchases
        </h3>
        <div className="space-y-2.5">
          {commodity.loggedPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white rounded-xl p-4 border border-[#c0c7cf]/30 shadow-xs flex items-center justify-between hover:bg-[#f2f3f7] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="bg-[#eceef1] rounded-lg p-2 text-[#40484e] shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    receipt_long
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[#191c1f] text-sm leading-tight">
                    {purchase.market}
                  </p>
                  <p className="text-xs text-[#71787f] mt-0.5">
                    {purchase.date} • {purchase.quantityDesc}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-base text-[#191c1f] tabular-nums">
                  ₦{purchase.totalAmount.toLocaleString()}
                </p>
                <p className="text-xs text-[#71787f] tabular-nums">
                  {purchase.unitPriceDesc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
