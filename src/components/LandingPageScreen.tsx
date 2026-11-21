import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';

export const LandingPageScreen: React.FC = () => {
  const { navigateTo } = useMarketPulse();

  const handleOpenPriceMap = (tab: 'map' | 'markets' | 'basket' = 'map') => {
    navigateTo('price-map', { tab });
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-[#111827] overflow-x-hidden">
      {/* Top Marketing Navigation — Clean 3-Zone Contract */}
      <nav className="sticky top-0 z-50 glass-surface border-b border-slate-900/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#00567c] flex items-center justify-center text-white font-display font-extrabold text-lg shadow-2xs">
              M
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-[#00567c] whitespace-nowrap">
              MarketPulse
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#475569]">
            <a
              href="#how-it-works"
              className="hover:text-[#00567c] transition-colors whitespace-nowrap"
            >
              How it works
            </a>
            <a
              href="#live-map-preview"
              className="hover:text-[#00567c] transition-colors whitespace-nowrap"
            >
              Price Map
            </a>
            <a
              href="#privacy-trust"
              className="hover:text-[#00567c] transition-colors whitespace-nowrap"
            >
              Privacy
            </a>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="hidden sm:inline-flex text-sm font-semibold text-[#475569] hover:text-[#00567c] px-2 py-2 transition-colors whitespace-nowrap"
            >
              Open Dashboard
            </button>
            <button
              id="landing-nav-log-btn"
              type="button"
              onClick={() => navigateTo('log-choice')}
              className="min-h-[40px] bg-[#00567c] hover:bg-[#003e5a] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              Log First Trip
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#00567c] via-[#003e5a] to-[#0f172a] text-white pt-14 pb-24 lg:pt-20 lg:pb-32 hero-clip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#d4e8f7]">
                No account needed · Works offline · Free for households
              </div>

              <h1
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                Know what groceries really cost — at your market, this week.
              </h1>

              <p className="text-base sm:text-lg text-[#d4e8f7]/90 max-w-2xl leading-relaxed">
                Track household grocery spending, separate market inflation from volume changes, and
                compare live crowdsourced prices across Nigerian markets.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3.5">
                <button
                  id="landing-hero-log-btn"
                  type="button"
                  onClick={() => navigateTo('log-choice')}
                  className="min-h-[52px] bg-white text-[#00567c] hover:bg-[#f6f8fb] font-bold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>Log your first trip</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
                <button
                  id="landing-hero-map-btn"
                  type="button"
                  onClick={() => handleOpenPriceMap('map')}
                  className="min-h-[52px] bg-white/10 hover:bg-white/20 text-white border border-white/25 font-semibold text-sm sm:text-base px-6 py-3.5 rounded-xl backdrop-blur-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[20px]">map</span>
                  <span>Explore Price Map</span>
                </button>
              </div>
            </div>

            {/* Hero Interactive Product Preview */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-[350px] bg-white rounded-3xl p-4 shadow-2xl border border-slate-900/12 text-[#111827] space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-900/8">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#00567c] text-white text-xs font-display font-bold flex items-center justify-center">
                      M
                    </span>
                    <span className="font-display font-bold text-sm text-[#111827]">
                      Lagos Market Snapshot
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#64748b] font-mono-num">
                    Oct 14
                  </span>
                </div>

                {/* Mini Budget Pace Card */}
                <div className="bg-[#f6f8fb] p-4 rounded-2xl border border-slate-900/8 space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                    <span>Monthly Budget Pace</span>
                    <span className="text-[#00567c] font-mono-num">64%</span>
                  </div>
                  <div className="font-display font-mono-num text-2xl font-extrabold text-[#111827]">
                    ₦77,400{' '}
                    <span className="text-xs font-medium text-[#64748b]">/ ₦120,000</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-[64%] bg-[#00567c] h-full rounded-full" />
                  </div>
                </div>

                {/* Live Price Rows */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                    Notable Movers
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('commodity-detail', { entityId: 'rice-50kg' })}
                    className="w-full text-left bg-white p-3 rounded-xl border border-slate-900/10 flex justify-between items-center hover:border-[#00567c] transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#111827]">Rice (50kg Bag)</div>
                      <div className="text-[11px] text-[#64748b]">Mile 12 · 14 reports</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono-num text-[#111827]">₦42,500</div>
                      <div className="text-[11px] font-semibold text-[#15803d] font-mono-num">
                        ↓ 4%
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('commodity-detail', { entityId: 'tomatoes-fresh' })}
                    className="w-full text-left bg-white p-3 rounded-xl border border-slate-900/10 flex justify-between items-center hover:border-[#00567c] transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#111827]">Tomatoes (Basket)</div>
                      <div className="text-[11px] text-[#64748b]">Mile 12 · 11 reports</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono-num text-[#111827]">₦18,500</div>
                      <div className="text-[11px] font-semibold text-[#b91c1c] font-mono-num">
                        ↑ 12%
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPriceMap('basket')}
                    className="w-full text-left bg-[#d4e8f7]/45 p-3 rounded-xl border border-[#00567c]/15 flex justify-between items-center hover:bg-[#d4e8f7]/70 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#00567c]">
                        Cheapest Basket Nearby
                      </div>
                      <div className="text-[11px] text-[#334155]">
                        Mile 12 saves ₦3,300 vs usual
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#00567c] text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2
            className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]"
            style={{ textWrap: 'balance' }}
          >
            How MarketPulse Works
          </h2>
          <p className="mt-3 text-base text-[#64748b]">
            Turn everyday market runs into personal budget clarity and verified local price
            intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-7 border border-slate-900/8 shadow-2xs space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#d4e8f7] text-[#00567c] flex items-center justify-center font-display font-extrabold text-lg">
              1
            </div>
            <h3 className="font-display text-lg font-bold text-[#111827]">
              Snap or type your receipt
            </h3>
            <p className="text-[#64748b] leading-relaxed text-sm">
              Log items in seconds with local Nigerian units including <em>derica</em>,{' '}
              <em>paint rubber</em>, <em>basket</em>, and <em>tuber</em>.
            </p>
            <div className="bg-[#f6f8fb] p-3.5 rounded-xl border border-slate-900/8 flex items-center gap-2.5 text-xs font-semibold text-[#111827]">
              <span className="material-symbols-outlined text-[#00567c] text-[18px]">
                receipt_long
              </span>
              <span>&ldquo;1 paint Garri Ijebu — ₦2,800&rdquo;</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-slate-900/8 shadow-2xs space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#d4e8f7] text-[#00567c] flex items-center justify-center font-display font-extrabold text-lg">
              2
            </div>
            <h3 className="font-display text-lg font-bold text-[#111827]">
              See what changed &amp; why
            </h3>
            <p className="text-[#64748b] leading-relaxed text-sm">
              Instantly separate price inflation from basket volume so you know why your monthly
              spend moved.
            </p>
            <div className="bg-[#f6f8fb] p-3.5 rounded-xl border border-slate-900/8 flex justify-between items-center text-xs font-semibold font-mono-num">
              <span className="text-[#b91c1c]">Prices: +₦9,200 ↑</span>
              <span className="text-[#15803d]">Volume: -₦1,400 ↓</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-slate-900/8 shadow-2xs space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#d4e8f7] text-[#00567c] flex items-center justify-center font-display font-extrabold text-lg">
              3
            </div>
            <h3 className="font-display text-lg font-bold text-[#111827]">
              Find cheaper markets nearby
            </h3>
            <p className="text-[#64748b] leading-relaxed text-sm">
              Compare your recurring 12-item household basket across nearby open markets and
              supermarkets before you leave home.
            </p>
            <div className="bg-[#f6f8fb] p-3.5 rounded-xl border border-slate-900/8 flex justify-between items-center text-xs">
              <span className="font-bold text-[#111827]">Mile 12 Market</span>
              <span className="text-[#15803d] font-bold font-mono-num">Save ₦3,300</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Intelligence Preview */}
      <section
        id="live-map-preview"
        className="py-16 lg:py-20 bg-white border-y border-slate-900/8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Basket Comparison */}
            <div className="space-y-5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#00567c]">
                Live Market Intelligence
              </div>
              <h2
                className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]"
                style={{ textWrap: 'balance' }}
              >
                Where is your basket cheapest today?
              </h2>
              <p className="text-base text-[#64748b] leading-relaxed">
                MarketPulse aggregates anonymous receipt logs from shoppers across Lagos, Abuja,
                Kano, Ibadan, and Port Harcourt with transparent confidence tiers.
              </p>

              <div className="bg-[#f6f8fb] rounded-2xl p-5 border border-slate-900/8 space-y-3">
                <button
                  type="button"
                  onClick={() => handleOpenPriceMap('basket')}
                  className="w-full text-left flex justify-between items-center p-3.5 rounded-xl bg-white border border-[#15803d]/35 hover:border-[#15803d] transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-[#111827]">
                      #1 Mile 12 Market{' '}
                      <span className="text-[11px] font-bold text-[#15803d] ml-1">Best Value</span>
                    </div>
                    <div className="text-xs text-[#64748b]">100% (12/12) items covered</div>
                  </div>
                  <div className="text-right font-mono-num">
                    <div className="font-bold text-sm text-[#111827]">₦31,200</div>
                    <div className="text-xs font-semibold text-[#15803d]">Save ₦3,300</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenPriceMap('basket')}
                  className="w-full text-left flex justify-between items-center p-3.5 rounded-xl bg-white border border-slate-900/8 hover:border-[#00567c] transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-[#111827]">#2 Shoprite Ikeja</div>
                    <div className="text-xs text-[#64748b]">83% (10/12) items covered</div>
                  </div>
                  <div className="text-right font-mono-num">
                    <div className="font-bold text-sm text-[#111827]">₦32,800</div>
                    <div className="text-xs font-semibold text-[#15803d]">Save ₦1,700</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenPriceMap('basket')}
                  className="w-full min-h-[44px] py-2.5 bg-[#00567c] text-white font-semibold text-xs rounded-xl hover:bg-[#003e5a] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Compare Your Own Basket</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Right: Interactive Choropleth Preview */}
            <div className="bg-[#f6f8fb] rounded-2xl p-6 border border-slate-900/8 space-y-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-display font-bold text-base text-[#111827]">
                    Lagos State — Rice (50kg Bag)
                  </h3>
                  <p className="text-xs text-[#64748b]">30-day price movement by LGA</p>
                </div>
                <span className="font-mono-num text-xs font-bold text-[#b91c1c]">
                  Avg: ₦43,200 (↑6%)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { name: 'Ikeja', price: '₦45k', sub: '↑ 8% · 24 logs', cls: 'bg-[#fef2f2] border-[#b91c1c]/25 text-[#b91c1c]' },
                  { name: 'Surulere', price: '₦42k', sub: '↓ 2% · 19 logs', cls: 'bg-[#ecfdf5] border-[#15803d]/25 text-[#15803d]' },
                  { name: 'Eti-Osa', price: '₦48k', sub: '↑ 12% · 31 logs', cls: 'bg-[#fef2f2] border-[#b91c1c]/25 text-[#b91c1c]' },
                  { name: 'Alimosho', price: '~₦43k', sub: '< 5 reports', cls: 'pattern-hatched bg-white border-slate-300 text-[#475569]' },
                  { name: 'Kosofe', price: '₦41k', sub: '↓ 5% · 42 logs', cls: 'bg-[#ecfdf5] border-[#15803d]/50 text-[#15803d]' },
                  { name: 'Ikorodu', price: 'No data', sub: '+ Log a trip', cls: 'pattern-dots bg-white border-dashed border-slate-400 text-[#64748b]' },
                ].map((tile) => (
                  <button
                    key={tile.name}
                    type="button"
                    onClick={() => handleOpenPriceMap('map')}
                    className={`text-left border rounded-xl p-3 flex flex-col justify-between min-h-[88px] hover:border-[#00567c] transition-colors ${tile.cls}`}
                  >
                    <span className="text-xs font-bold text-[#111827]">{tile.name}</span>
                    <div>
                      <div className="font-display font-mono-num text-sm font-extrabold">
                        {tile.price}
                      </div>
                      <div className="text-[10px] font-semibold opacity-90">{tile.sub}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900/8 text-xs">
                <span className="text-[#64748b]">Striped = &lt;5 logs · Dotted = no data</span>
                <button
                  type="button"
                  onClick={() => handleOpenPriceMap('map')}
                  className="text-[#00567c] font-semibold hover:underline"
                >
                  Open Interactive Map →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Privacy Section */}
      <section id="privacy-trust" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#111827]">
            Built for Trust &amp; Offline Resilience
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#64748b]">
            Engineered for Nigerian shoppers with patchy market reception and full data ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: 'wifi_off',
              title: 'Works offline',
              body: 'Log prices inside busy markets with zero signal. Syncs automatically when back online.',
            },
            {
              icon: 'no_accounts',
              title: 'No account required',
              body: 'Start logging immediately on your device. Add Google Cloud sync only when you want it.',
            },
            {
              icon: 'download',
              title: 'Your data is yours',
              body: 'Export your complete shopping history to CSV or JSON anytime, or wipe it in one tap.',
            },
            {
              icon: 'verified',
              title: 'Honest data confidence',
              body: 'We never invent estimates. Markets with fewer than 5 logs are clearly striped.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white p-6 rounded-2xl border border-slate-900/8 shadow-2xs space-y-2.5"
            >
              <span className="material-symbols-outlined text-[#00567c] text-[28px] block">
                {item.icon}
              </span>
              <h3 className="font-display font-bold text-base text-[#111827]">{item.title}</h3>
              <p className="text-sm text-[#64748b] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-900/8 py-10 text-xs text-[#64748b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-display font-bold text-[#00567c] text-sm">MarketPulse Nigeria</div>
          <div className="flex flex-wrap justify-center gap-6">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="hover:text-[#00567c] font-medium"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => handleOpenPriceMap('map')}
              className="hover:text-[#00567c] font-medium"
            >
              Price Map
            </button>
            <button
              type="button"
              onClick={() => navigateTo('weekly-report')}
              className="hover:text-[#00567c] font-medium"
            >
              Weekly Report
            </button>
            <button
              type="button"
              onClick={() => navigateTo('data-mgmt')}
              className="hover:text-[#00567c] font-medium"
            >
              Data &amp; Privacy
            </button>
          </div>
          <div>© 2026 MarketPulse · Built for Nigerian Households</div>
        </div>
      </footer>
    </div>
  );
};
