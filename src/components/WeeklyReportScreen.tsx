import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { useToast } from '../context/ToastContext';
import { FoodIconBadge } from './ui/FoodIconBadge';

export const WeeklyReportScreen: React.FC = () => {
  const { trips, activeRegion, navigateTo, selectCommodityById } = useMarketPulse();
  const { showToast } = useToast();

  const latestTrip = trips[0];
  const weeklySpend = latestTrip ? latestTrip.total : 24500;
  const itemsLoggedCount = latestTrip ? latestTrip.items.length : 14;

  const shareText = `MarketPulse Weekly Summary (${activeRegion.name})\nOct 16 - Oct 22\nTotal Spent: ₦${weeklySpend.toLocaleString('en-NG')} (↓ 8% vs last week)\n${itemsLoggedCount} Food Items Recorded\n\nPrices That Moved:\n• Tomatoes (Basket): ₦18,500 (↑ 12% at Mile 12)\n• Rice (Derica): ₦1,100 (↓ 4% at Oyingbo)\n• Palm Oil (5L): ₦4,200 (Same as last week at Mile 12)\n\nTrack Nigerian market prices on MarketPulse.`;

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

  const movers = [
    {
      id: 'palm-oil-5l',
      name: 'Palm Oil (5L Keg)',
      market: 'Mile 12 Market',
      price: '₦13,200',
      delta: '↑ 3.9%',
      tone: 'danger' as const,
    },
    {
      id: 'tomatoes-fresh',
      name: 'Tomatoes (Basket)',
      market: 'Mile 12 Market',
      price: '₦46,500',
      delta: '↓ 4.1%',
      tone: 'positive' as const,
    },
    {
      id: 'rice-50kg',
      name: 'Rice (Local 50kg)',
      market: 'Oyingbo Market',
      price: '₦89,500',
      delta: '↓ 2.2%',
      tone: 'positive' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-20 lg:pt-24 pb-28 lg:pb-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <header>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            Weekly Summary
          </h1>
          <p className="text-sm text-[#6e6e73] mt-1">
            Your home&apos;s food spending snapshot for Oct 16 – Oct 22 in {activeRegion.name}.
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
                    Oct 16 – Oct 22 · {activeRegion.name}
                  </p>
                </div>
                <span className="material-symbols-outlined text-3xl text-[#d4e8f7]/50">
                  insights
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white/10 p-4 rounded-xl border border-white/12">
                  <div className="text-xs text-[#d4e8f7]/85">Total Spent</div>
                  <div className="font-display font-mono-num text-2xl font-extrabold mt-1">
                    ₦{weeklySpend.toLocaleString('en-NG')}
                  </div>
                  <div className="text-[11px] text-[#86efac] font-semibold mt-1 font-mono-num">
                    ↓ 8% less than last week
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
                <span className="text-[#d4e8f7]">Cheapest market nearby this week</span>
                <span className="font-bold text-white whitespace-nowrap">Mile 12 Market</span>
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
                  Prices That Moved This Week
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
                          m.tone === 'danger'
                            ? 'text-[#b91c1c]'
                            : m.tone === 'positive'
                            ? 'text-[#15803d]'
                            : 'text-[#6e6e73]'
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
                Your market bag was <strong>8% cheaper</strong> than last week mostly because rice
                dropped at Oyingbo and palm oil stayed steady. Try buying fresh pepper &amp; tomatoes
                at Mile 12 and dry food in bulk at Daleko next week.
              </p>
              <button
                type="button"
                onClick={() => navigateTo('price-map', { tab: 'basket' })}
                className="text-xs font-semibold text-[#00567c] hover:underline inline-flex items-center gap-1"
              >
                <span>Compare full market bag across Lagos</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
