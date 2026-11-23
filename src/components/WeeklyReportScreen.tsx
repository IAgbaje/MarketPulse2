import React, { useMemo } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { useToast } from '../context/ToastContext';
import { FoodIconBadge } from './ui/FoodIconBadge';

function getCurrentWeekLabel(): string {
  const end = new Date();
  const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export const WeeklyReportScreen: React.FC = () => {
  const { trips, commodities, activeRegion, navigateTo, selectCommodityById } = useMarketPulse();
  const { showToast } = useToast();

  const latestTrip = trips[0];
  const previousTrip = trips[1];
  const weeklySpend = latestTrip ? latestTrip.total : 24500;
  const itemsLoggedCount = latestTrip ? latestTrip.items.length : 0;
  const weekRangeLabel = useMemo(() => getCurrentWeekLabel(), []);
  const primaryMarket = activeRegion.markets[0] || 'Local Market';
  const secondaryMarket = activeRegion.markets[1] || primaryMarket;
  const multiplier = activeRegion.priceMultiplier || 1;

  const spendDeltaPct = useMemo(() => {
    if (!latestTrip || !previousTrip || previousTrip.total <= 0) return -6;
    return Math.round(((latestTrip.total - previousTrip.total) / previousTrip.total) * 100);
  }, [latestTrip, previousTrip]);

  const movers = useMemo(() => {
    const featuredIds = ['palm-oil-5l', 'tomatoes-fresh', 'rice-50kg'];
    return featuredIds
      .map((id, idx) => {
        const c = commodities.find((item) => item.id === id);
        if (!c) return null;
        const regionalPrice = Math.round((c.latestPrice * multiplier) / 100) * 100;
        const mom = typeof c.momChangePct === 'number' ? c.momChangePct : c.priceChangePct;
        const isUp = mom > 0;
        return {
          id: c.id,
          name: c.name,
          market: activeRegion.markets[idx % activeRegion.markets.length] || primaryMarket,
          price: `₦${regionalPrice.toLocaleString('en-NG')}`,
          delta: `${isUp ? '↑' : '↓'} ${Math.abs(mom).toFixed(1)}%`,
          tone: (isUp ? 'danger' : 'positive') as 'danger' | 'positive',
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [commodities, multiplier, activeRegion.markets, primaryMarket]);

  const shareText = useMemo(() => {
    const deltaWord =
      spendDeltaPct <= 0
        ? `↓ ${Math.abs(spendDeltaPct)}% vs previous trip`
        : `↑ ${spendDeltaPct}% vs previous trip`;
    const moverLines = movers
      .map((m) => `• ${m.name}: ${m.price} (${m.delta} at ${m.market})`)
      .join('\n');
    return `MarketPulse Weekly Summary (${activeRegion.name})\n${weekRangeLabel}\nTotal Spent: ₦${weeklySpend.toLocaleString('en-NG')} (${deltaWord})\n${itemsLoggedCount} Food Items Recorded\n\nPrices That Moved:\n${moverLines}\n\nTrack Nigerian market prices on MarketPulse.`;
  }, [activeRegion.name, weekRangeLabel, weeklySpend, spendDeltaPct, itemsLoggedCount, movers]);

  const handleShareWhatsApp = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MarketPulse Weekly Summary',
          text: shareText,
        });
        showToast({
          message: 'Weekly summary shared',
          tone: 'success',
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        showToast({
          message: 'Weekly summary copied',
          description: 'Paste it straight into WhatsApp.',
          tone: 'success',
        });
      }
    } catch {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText).catch(() => {});
      }
      showToast({
        message: 'Weekly summary copied',
        tone: 'success',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-20 lg:pt-24 pb-28 lg:pb-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <header>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            Weekly Summary
          </h1>
          <p className="text-sm text-[#6e6e73] mt-1">
            Your home&apos;s food spending snapshot for {weekRangeLabel} in {activeRegion.name}.
          </p>
        </header>

        {/* Desktop 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Shareable Summary Card + WhatsApp Actions */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-gradient-to-br from-[#00567c] to-[#00344d] rounded-2xl p-6 sm:p-7 text-white shadow-md space-y-6">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4e8f7]">
                    MarketPulse Weekly
                  </span>
                  <h2 className="font-display text-2xl font-extrabold mt-1">Your Week in Food</h2>
                  <p className="text-xs text-[#d4e8f7]/80 mt-0.5">
                    {weekRangeLabel} · {activeRegion.name}
                  </p>
                </div>
                <span className="material-symbols-outlined text-3xl text-[#d4e8f7]/50">
                  insights
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white/10 p-4 rounded-xl border border-white/12">
                  <div className="text-xs text-[#d4e8f7]/85">Latest Market Run</div>
                  <div className="font-display font-mono-num text-2xl font-extrabold mt-1">
                    ₦{weeklySpend.toLocaleString('en-NG')}
                  </div>
                  <div
                    className={`text-[11px] font-semibold mt-1 font-mono-num ${
                      spendDeltaPct <= 0 ? 'text-[#86efac]' : 'text-[#fde68a]'
                    }`}
                  >
                    {spendDeltaPct <= 0
                      ? `↓ ${Math.abs(spendDeltaPct)}% less than previous run`
                      : `↑ ${spendDeltaPct}% above previous run`}
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/12">
                  <div className="text-xs text-[#d4e8f7]/85">Food Items Saved</div>
                  <div className="font-display font-mono-num text-2xl font-extrabold mt-1">
                    {itemsLoggedCount}
                  </div>
                  <div className="text-[11px] text-[#d4e8f7] mt-1">Helped update local prices</div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl px-4 py-3 text-xs flex items-center justify-between gap-2 border border-white/10">
                <span className="text-[#d4e8f7]">Top wholesale hub nearby</span>
                <span className="font-bold text-white whitespace-nowrap truncate">
                  {primaryMarket}
                </span>
              </div>
            </div>

            {/* Share Actions */}
            <div className="space-y-2.5">
              <button
                id="weekly-share-whatsapp-btn"
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.99] text-white font-semibold text-sm shadow-2xs flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[19px]">share</span>
                <span>Share With Family</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-white border border-black/[0.08] text-[#1d1d1f] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#f2f2f7] transition-colors shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px] text-[#16a34a]">
                  open_in_new
                </span>
                <span>Send Straight to WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right: Prices That Moved + Smart Market Tip */}
          <div className="lg:col-span-6 space-y-4">
            <section className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between gap-2">
                <h3 className="font-display font-bold text-base text-[#1d1d1f]">
                  Prices That Moved in {activeRegion.state.replace(' State', '')}
                </h3>
                <button
                  type="button"
                  onClick={() => navigateTo('price-map')}
                  className="text-xs font-semibold text-[#00567c] hover:underline whitespace-nowrap"
                >
                  Open Price Map →
                </button>
              </div>

              <div className="divide-y divide-black/[0.05]">
                {movers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => selectCommodityById(m.id)}
                    className="w-full text-left p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-[#f5f5f7]/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <FoodIconBadge name={m.name} size="md" />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-[#1d1d1f] truncate">
                          {m.name}
                        </div>
                        <div className="text-xs text-[#6e6e73] truncate">{m.market}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-mono-num font-bold text-sm text-[#1d1d1f]">
                        {m.price}
                      </div>
                      <div
                        className={`font-mono-num text-xs font-semibold ${
                          m.tone === 'danger' ? 'text-[#b91c1c]' : 'text-[#15803d]'
                        }`}
                      >
                        {m.delta}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Market Breakdown Note */}
            <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#00567c]">
                <span className="material-symbols-outlined text-[17px]">storefront</span>
                <span>Smart Market Tip</span>
              </div>
              <p className="text-sm text-[#3a3a3c] leading-relaxed">
                Compare fresh produce at <strong>{primaryMarket}</strong> against dry-food bulk
                staples at <strong>{secondaryMarket}</strong> before your next market run in{' '}
                {activeRegion.name}.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('price-map', { tab: 'basket' })}
                className="text-xs font-semibold text-[#00567c] hover:underline inline-flex items-center gap-1"
              >
                <span>Compare full market bag across {activeRegion.state.replace(' State', '')}</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
