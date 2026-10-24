import React, { useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';

export const WeeklyReportScreen: React.FC = () => {
  const { trips, activeRegion, navigateTo, selectCommodityById } = useMarketPulse();
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const latestTrip = trips[0];
  const weeklySpend = latestTrip ? latestTrip.total : 24500;
  const itemsLoggedCount = latestTrip ? latestTrip.items.length : 14;

  const shareText = `📊 *MarketPulse Weekly Wrap-up (${activeRegion.name})*\n🗓 Oct 16 - Oct 22\n💰 Total Spend: ₦${weeklySpend.toLocaleString()} (↓ 8% vs last week)\n🛒 ${itemsLoggedCount} Items Logged\n\n*This Week's Movers:*\n• Tomatoes (Basket): ₦18,500 (↑ 12% at Mile 12)\n• Rice (Derica): ₦1,100 (↓ 4% at Oyingbo)\n• Palm Oil (5L): ₦4,200 (Stable at Mile 12)\n\nTrack Nigerian market prices on MarketPulse!`;

  const handleShareWhatsApp = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MarketPulse Weekly Wrap-up',
          text: shareText,
        });
        setShareFeedback('Shared weekly report successfully!');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setShareFeedback('Weekly WhatsApp summary copied to clipboard! Paste in WhatsApp.');
      } else {
        setShareFeedback('Weekly summary ready to share on WhatsApp!');
      }
    } catch {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText).catch(() => {});
      }
      setShareFeedback('Weekly WhatsApp summary copied to clipboard!');
    }
    setTimeout(() => setShareFeedback(null), 4000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-20 pb-32 px-4 md:px-6 max-w-xl mx-auto w-full space-y-6">
      {/* Shareable Summary Hero Card */}
      <div className="bg-gradient-to-br from-[#00567c] to-[#00344d] rounded-3xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#cbe3f7] bg-white/10 px-2.5 py-1 rounded-full">
              MarketPulse
            </span>
            <h2 className="text-2xl font-extrabold mt-2">Weekly Wrap-up</h2>
            <p className="text-xs text-[#cbe3f7]/80">Oct 16 - Oct 22 · {activeRegion.name}</p>
          </div>
          <span className="material-symbols-outlined text-3xl text-[#cbe3f7]/40">insights</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-[#cbe3f7]/80">Total Spend</div>
            <div className="text-2xl font-extrabold tabular-nums mt-0.5">
              ₦{weeklySpend.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#4ade80] font-bold mt-1">↓ 8% vs last week</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-[#cbe3f7]/80">Items Logged</div>
            <div className="text-2xl font-extrabold tabular-nums mt-0.5">{itemsLoggedCount}</div>
            <div className="text-[11px] text-[#cbe3f7] mt-1">Helps local map</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-3 text-xs flex items-center justify-between">
          <span className="text-[#cbe3f7]">Cheapest nearby market this week:</span>
          <span className="font-bold text-white">Mile 12 Market</span>
        </div>
      </div>

      {/* Feedback Banner */}
      {shareFeedback && (
        <div className="p-3.5 bg-[#dcfce7] text-[#16a34a] border border-[#16a34a]/30 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{shareFeedback}</span>
        </div>
      )}

      {/* This Week's Movers */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-[#191c1f]">This Week's Movers</h3>
          <button
            onClick={() => navigateTo('price-map')}
            className="text-xs font-bold text-[#00567c] hover:underline"
          >
            Compare markets →
          </button>
        </div>

        <div className="space-y-2.5">
          <div
            onClick={() => selectCommodityById('tomatoes-fresh')}
            className="bg-white p-3.5 rounded-xl border border-[#e1e2e6] flex justify-between items-center cursor-pointer hover:bg-[#f2f3f7] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#fee2e2] text-[#ba1a1a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
              </div>
              <div>
                <div className="font-bold text-sm text-[#191c1f]">Tomatoes (Basket)</div>
                <div className="text-xs text-[#71787f]">Mile 12 Market</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm tabular-nums text-[#191c1f]">₦18,500</div>
              <div className="text-xs font-bold text-[#ba1a1a] tabular-nums">↑ 12%</div>
            </div>
          </div>

          <div
            onClick={() => selectCommodityById('rice-50kg')}
            className="bg-white p-3.5 rounded-xl border border-[#e1e2e6] flex justify-between items-center cursor-pointer hover:bg-[#f2f3f7] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#dcfce7] text-[#16a34a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">trending_down</span>
              </div>
              <div>
                <div className="font-bold text-sm text-[#191c1f]">Rice (Derica)</div>
                <div className="text-xs text-[#71787f]">Oyingbo Market</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm tabular-nums text-[#191c1f]">₦1,100</div>
              <div className="text-xs font-bold text-[#16a34a] tabular-nums">↓ 4%</div>
            </div>
          </div>

          <div
            onClick={() => selectCommodityById('palm-oil-25l')}
            className="bg-white p-3.5 rounded-xl border border-[#e1e2e6] flex justify-between items-center cursor-pointer hover:bg-[#f2f3f7] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#f2f3f7] text-[#40484e] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">trending_flat</span>
              </div>
              <div>
                <div className="font-bold text-sm text-[#191c1f]">Palm Oil (5L)</div>
                <div className="text-xs text-[#71787f]">Mile 12 Market</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm tabular-nums text-[#191c1f]">₦4,200</div>
              <div className="text-xs font-bold text-[#71787f] tabular-nums">~ 0%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Share on WhatsApp CTA */}
      <div className="space-y-3 pt-2">
        <button
          id="weekly-share-whatsapp-btn"
          onClick={handleShareWhatsApp}
          className="w-full py-4 rounded-xl bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <span className="material-symbols-outlined text-[20px]">share</span>
          <span>Share on WhatsApp</span>
        </button>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl bg-white border border-[#c0c7cf] text-[#191c1f] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#f2f3f7] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px] text-[#25D366]">open_in_new</span>
          <span>Open Directly in WhatsApp Web / App</span>
        </a>
      </div>
    </div>
  );
};
