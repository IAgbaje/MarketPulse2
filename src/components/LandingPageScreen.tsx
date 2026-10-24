import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';

export const LandingPageScreen: React.FC = () => {
  const { navigateTo, setActivePriceMapTab } = useMarketPulse();

  const handleOpenPriceMap = (tab: 'map' | 'markets' | 'basket' = 'map') => {
    setActivePriceMapTab(tab);
    navigateTo('price-map');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-[#191c1f] font-sans overflow-x-hidden">
      {/* Top Marketing Navigation */}
      <nav className="sticky top-0 z-50 bg-[#f8f9fd]/90 backdrop-blur-md border-b border-[#e1e2e6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#00567c] flex items-center justify-center text-white font-bold text-lg shadow-xs">
              M
            </div>
            <span className="font-bold text-xl tracking-tight text-[#00567c]">MarketPulse</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#40484e]">
            <a href="#how-it-works" className="hover:text-[#00567c] transition-colors">
              How it works
            </a>
            <a href="#live-map-preview" className="hover:text-[#00567c] transition-colors">
              Price Map
            </a>
            <a href="#privacy-trust" className="hover:text-[#00567c] transition-colors">
              Privacy
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigateTo('home')}
              className="text-xs sm:text-sm font-semibold text-[#00567c] hover:bg-[#cbe3f7]/40 px-3.5 py-2 rounded-full transition-colors"
            >
              Open Dashboard
            </button>
            <button
              id="landing-nav-log-btn"
              onClick={() => navigateTo('log-choice')}
              className="bg-[#00567c] hover:bg-[#003e5a] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full transition-all shadow-xs hover:shadow active:scale-95"
            >
              Log your first trip
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#00567c] via-[#003e5a] to-[#191c1f] text-white pt-12 pb-24 lg:pt-20 lg:pb-32 hero-clip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-medium text-[#cbe3f7]">
                <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
                No account needed to start · Works offline · Free
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Know what groceries really cost — at your market, this week.
              </h1>

              <p className="text-lg sm:text-xl text-[#cbe3f7]/90 max-w-2xl font-normal leading-relaxed">
                Track your household grocery spending, separate price inflation from volume changes,
                and crowdsource real-time commodity prices across Nigerian markets.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3.5">
                <button
                  id="landing-hero-log-btn"
                  onClick={() => navigateTo('log-choice')}
                  className="bg-white text-[#00567c] hover:bg-[#f2f3f7] font-bold text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Log your first trip</span>
                  <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
                <button
                  id="landing-hero-map-btn"
                  onClick={() => handleOpenPriceMap('map')}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/25 font-semibold text-base px-7 py-4 rounded-xl backdrop-blur-xs transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">map</span>
                  <span>Explore Price Map</span>
                </button>
              </div>
            </div>

            {/* Hero Visual / App Mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-[330px] bg-[#f8f9fd] rounded-[2.5rem] p-3 shadow-2xl border-4 border-white/20 text-[#191c1f] transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-[2rem] overflow-hidden border border-[#e1e2e6] h-[480px] flex flex-col">
                  {/* Mockup Header */}
                  <div className="bg-[#f8f9fd] px-4 py-3 border-b border-[#e1e2e6] flex justify-between items-center">
                    <span className="font-bold text-sm text-[#00567c]">MarketPulse</span>
                    <div className="w-6 h-6 rounded-full bg-[#cbe3f7] text-[#00567c] flex items-center justify-center text-[10px] font-bold">
                      AO
                    </div>
                  </div>

                  {/* Mockup Body */}
                  <div className="p-4 space-y-4 flex-1 bg-[#f8f9fd] overflow-hidden">
                    <div className="bg-white p-3.5 rounded-xl border border-[#e1e2e6] shadow-2xs">
                      <div className="text-[10px] font-bold text-[#40484e] uppercase tracking-wider mb-1">
                        Monthly Budget Pace
                      </div>
                      <div className="text-2xl font-extrabold tabular-nums text-[#191c1f]">
                        ₦42,500
                      </div>
                      <div className="text-xs text-[#714800] font-medium mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        ₦4,200 over pace
                      </div>
                      <div className="w-full h-2 bg-[#e1e2e6] rounded-full mt-2 overflow-hidden flex">
                        <div className="w-1/2 bg-[#00567c] h-full"></div>
                        <div className="w-[15%] bg-[#714800] h-full"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#191c1f]">Prices went up</div>
                      <div
                        onClick={() => navigateTo('commodity-detail')}
                        className="bg-white p-3 rounded-lg border border-[#e1e2e6] flex justify-between items-center cursor-pointer hover:border-[#00567c] transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#191c1f]">Rice (50kg)</div>
                          <div className="text-[10px] text-[#71787f]">Mile 12 · 14 reports</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold tabular-nums">₦42,000</div>
                          <div className="text-[10px] font-bold text-[#ba1a1a] tabular-nums">
                            ↑ ₦3,500
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => navigateTo('commodity-detail')}
                        className="bg-white p-3 rounded-lg border border-[#e1e2e6] flex justify-between items-center cursor-pointer hover:border-[#00567c] transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#191c1f]">
                            Palm Oil (5L)
                          </div>
                          <div className="text-[10px] text-[#71787f]">Oyingbo · 9 reports</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold tabular-nums">₦8,500</div>
                          <div className="text-[10px] font-bold text-[#ba1a1a] tabular-nums">
                            ↑ ₦1,000
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => handleOpenPriceMap('basket')}
                        className="bg-[#cbe3f7]/40 p-3 rounded-lg border border-[#cbe3f7] flex justify-between items-center cursor-pointer hover:bg-[#cbe3f7]/60 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#00567c]">
                            Cheapest Basket Nearby
                          </div>
                          <div className="text-[10px] text-[#40484e]">
                            Mile 12 saves you ₦3,300
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[#00567c] text-[18px]">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Price Alert Badge */}
              <div className="hidden sm:flex absolute -bottom-4 -left-4 bg-white p-3.5 rounded-xl shadow-xl border border-[#e1e2e6] items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fee2e2] text-[#ba1a1a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">trending_up</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#191c1f]">Tomatoes (Big Basket)</div>
                  <div className="text-xs text-[#ba1a1a] font-semibold tabular-nums">
                    ↑ 18% in Mile 12 this week
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3-Step Flow) */}
      <section id="how-it-works" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-[#191c1f] sm:text-4xl">
            How MarketPulse Works
          </h2>
          <p className="mt-4 text-lg text-[#40484e]">
            Turn your everyday market runs into personal financial clarity and community price
            intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-8 border border-[#e1e2e6] shadow-xs relative overflow-hidden group hover:border-[#00567c] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#cbe3f7] text-[#00567c] flex items-center justify-center font-bold text-xl mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-[#191c1f] mb-3">Snap or type your receipt</h3>
            <p className="text-[#40484e] leading-relaxed mb-6 text-sm sm:text-base">
              Log items in seconds while at the market or when you get home. Supports local Nigerian
              units like <em>derica</em>, <em>paint rubber</em>, <em>mudu</em>, and{' '}
              <em>olonka</em>.
            </p>
            <div className="bg-[#f2f3f7] p-4 rounded-xl border border-[#e1e2e6]">
              <div className="flex items-center gap-3 text-sm font-medium text-[#191c1f]">
                <span className="material-symbols-outlined text-[#00567c]">receipt_long</span>
                <span>"1 paint GarriIjebu — ₦2,800"</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-8 border border-[#e1e2e6] shadow-xs relative overflow-hidden group hover:border-[#00567c] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#cbe3f7] text-[#00567c] flex items-center justify-center font-bold text-xl mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-[#191c1f] mb-3">
              See your spend & what changed
            </h3>
            <p className="text-[#40484e] leading-relaxed mb-6 text-sm sm:text-base">
              Know immediately if you spent more because market prices rose or because you bought
              larger quantities for the house.
            </p>
            <div className="bg-[#f2f3f7] p-4 rounded-xl border border-[#e1e2e6] flex justify-between items-center text-xs font-semibold">
              <span className="text-[#ba1a1a] tabular-nums">Prices: +₦9,200 ↑</span>
              <span className="text-[#71787f]">|</span>
              <span className="text-[#16a34a] tabular-nums">Volume: -₦1,400 ↓</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-8 border border-[#e1e2e6] shadow-xs relative overflow-hidden group hover:border-[#00567c] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#cbe3f7] text-[#00567c] flex items-center justify-center font-bold text-xl mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-[#191c1f] mb-3">
              Find cheaper markets nearby
            </h3>
            <p className="text-[#40484e] leading-relaxed mb-6 text-sm sm:text-base">
              Compare your entire shopping basket across nearby open markets and supermarkets before
              you leave home.
            </p>
            <div className="bg-[#f2f3f7] p-4 rounded-xl border border-[#e1e2e6] flex justify-between items-center text-xs">
              <span className="font-bold text-[#191c1f]">Mile 12 Market</span>
              <span className="bg-[#dcfce7] text-[#16a34a] font-bold px-2 py-0.5 rounded">
                Save ₦3,300
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Intelligence Preview */}
      <section
        id="live-map-preview"
        className="py-16 lg:py-20 bg-[#f2f3f7] border-y border-[#e1e2e6]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Basket Comparison Preview */}
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-[#cbe3f7] text-[#00567c] text-xs font-bold uppercase tracking-wider mb-4">
                Live Market Intelligence
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#191c1f] sm:text-4xl mb-4">
                Where is your basket cheapest today?
              </h2>
              <p className="text-base sm:text-lg text-[#40484e] mb-8">
                Stop guessing which market has better deals. MarketPulse aggregates anonymous
                receipt logs from shoppers in your area to show real prices and data confidence.
              </p>

              <div className="bg-white rounded-2xl p-6 border border-[#e1e2e6] shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-[#e1e2e6] pb-3">
                  <div>
                    <div className="text-xs text-[#71787f] font-medium">
                      Sample 12-Item Household Basket
                    </div>
                    <div className="font-bold text-[#191c1f]">Lagos Mainland Comparison</div>
                  </div>
                  <span className="text-xs bg-[#f2f3f7] px-2.5 py-1 rounded font-medium text-[#40484e]">
                    Updated 2h ago
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Rank 1 */}
                  <div
                    onClick={() => handleOpenPriceMap('basket')}
                    className="flex justify-between items-center p-3 rounded-xl bg-[#dcfce7]/40 border border-[#16a34a]/30 cursor-pointer hover:bg-[#dcfce7]/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#16a34a] text-white text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <div>
                        <div className="font-bold text-sm text-[#191c1f] flex items-center gap-2">
                          Mile 12 Market
                          <span className="text-[10px] bg-[#16a34a] text-white px-1.5 py-0.5 rounded font-bold">
                            BEST VALUE
                          </span>
                        </div>
                        <div className="text-xs text-[#40484e]">100% (12/12) items covered</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-base tabular-nums text-[#191c1f]">
                        ₦31,200
                      </div>
                      <div className="text-xs font-bold text-[#16a34a] tabular-nums">
                        Save ₦3,300
                      </div>
                    </div>
                  </div>

                  {/* Rank 2 */}
                  <div
                    onClick={() => handleOpenPriceMap('basket')}
                    className="flex justify-between items-center p-3 rounded-xl bg-[#f8f9fd] border border-[#e1e2e6] cursor-pointer hover:border-[#00567c] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#e1e2e6] text-[#40484e] text-xs font-bold flex items-center justify-center">
                        2
                      </span>
                      <div>
                        <div className="font-bold text-sm text-[#191c1f]">Shoprite Ikeja</div>
                        <div className="text-xs text-[#714800] font-medium">
                          83% (10/12) items covered
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-base tabular-nums text-[#191c1f]">
                        ₦32,800
                      </div>
                      <div className="text-xs font-medium text-[#16a34a] tabular-nums">
                        Save ₦1,700
                      </div>
                    </div>
                  </div>

                  {/* Rank 3 */}
                  <div
                    onClick={() => handleOpenPriceMap('basket')}
                    className="flex justify-between items-center p-3 rounded-xl bg-[#f8f9fd] border border-[#e1e2e6] cursor-pointer hover:border-[#00567c] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#e1e2e6] text-[#40484e] text-xs font-bold flex items-center justify-center">
                        3
                      </span>
                      <div>
                        <div className="font-bold text-sm text-[#191c1f]">
                          Oyingbo Market (Your Usual)
                        </div>
                        <div className="text-xs text-[#40484e]">100% (12/12) items covered</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-base tabular-nums text-[#191c1f]">
                        ₦34,500
                      </div>
                      <div className="text-xs text-[#71787f]">Baseline</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenPriceMap('basket')}
                  className="w-full py-3 bg-[#00567c] text-white font-bold text-xs rounded-xl hover:bg-[#2a6f97] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Compare Your Own Basket</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Right: Interactive Choropleth Preview */}
            <div className="bg-white rounded-3xl p-6 border border-[#e1e2e6] shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-base text-[#191c1f]">
                    Lagos State — Rice (50kg Bag)
                  </h3>
                  <p className="text-xs text-[#71787f]">30-day price movement by LGA</p>
                </div>
                <span className="text-xs font-bold text-[#ba1a1a] bg-[#fee2e2] px-2.5 py-1 rounded-full tabular-nums">
                  State Avg: ₦43,200 (↑6%)
                </span>
              </div>

              {/* Stylized LGA Choropleth Map Representation */}
              <div className="relative h-72 bg-[#eef2f6] rounded-2xl overflow-hidden border border-[#e1e2e6] p-4 flex flex-col justify-between">
                <div className="grid grid-cols-3 gap-2 h-full">
                  <div
                    onClick={() => handleOpenPriceMap('map')}
                    className="bg-[#fee2e2] border border-[#ba1a1a]/30 rounded-xl p-3 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#191c1f]">Ikeja</span>
                    <div>
                      <div className="text-sm font-extrabold tabular-nums text-[#ba1a1a]">
                        ₦45k
                      </div>
                      <div className="text-[10px] text-[#ba1a1a] font-medium">↑ 8% · 24 logs</div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleOpenPriceMap('map')}
                    className="bg-[#dcfce7] border border-[#16a34a]/30 rounded-xl p-3 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#191c1f]">Surulere</span>
                    <div>
                      <div className="text-sm font-extrabold tabular-nums text-[#16a34a]">
                        ₦42k
                      </div>
                      <div className="text-[10px] text-[#16a34a] font-medium">↓ 2% · 19 logs</div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleOpenPriceMap('map')}
                    className="bg-[#fee2e2] border border-[#ba1a1a]/40 rounded-xl p-3 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#191c1f]">Eti-Osa</span>
                    <div>
                      <div className="text-sm font-extrabold tabular-nums text-[#ba1a1a]">
                        ₦48k
                      </div>
                      <div className="text-[10px] text-[#ba1a1a] font-medium">↑ 12% · 31 logs</div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleOpenPriceMap('map')}
                    className="map-pattern-thin bg-white border border-[#c0c7cf] rounded-xl p-3 flex flex-col justify-between cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#40484e]">Alimosho</span>
                    <div>
                      <div className="text-xs font-bold tabular-nums text-[#40484e]">~₦43k</div>
                      <div className="text-[10px] text-[#71787f] font-medium">
                        &lt; 5 reports
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleOpenPriceMap('map')}
                    className="bg-[#dcfce7] border border-[#16a34a]/40 rounded-xl p-3 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#191c1f]">Kosofe (Mile 12)</span>
                    <div>
                      <div className="text-sm font-extrabold tabular-nums text-[#16a34a]">
                        ₦41k
                      </div>
                      <div className="text-[10px] text-[#16a34a] font-medium">↓ 5% · 42 logs</div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleOpenPriceMap('map')}
                    className="map-pattern-nodata bg-[#f8f9fd] border border-dashed border-[#c0c7cf] rounded-xl p-3 flex flex-col justify-between cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#71787f]">Ikorodu</span>
                    <div>
                      <div className="text-[11px] font-medium text-[#71787f]">No data</div>
                      <div className="text-[10px] text-[#00567c] underline">Log a trip</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#40484e] pt-2 border-t border-[#e1e2e6]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#dcfce7] border border-[#16a34a]"></span>
                    Solid = 5+ reports
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs map-pattern-thin border border-[#71787f]"></span>
                    Striped = &lt;5 reports
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs map-pattern-nodata border border-dashed border-[#71787f]"></span>
                    Dotted = No data
                  </span>
                </div>
                <button
                  onClick={() => handleOpenPriceMap('map')}
                  className="text-[#00567c] font-bold hover:underline"
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
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-[#191c1f]">
            Built for Trust & Privacy
          </h2>
          <p className="mt-3 text-[#40484e]">
            Designed specifically for Nigerian shoppers with unreliable networks and strict privacy
            expectations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#e1e2e6]">
            <span className="material-symbols-outlined text-[#00567c] text-3xl mb-3 block">
              wifi_off
            </span>
            <h3 className="font-bold text-base text-[#191c1f] mb-2">Works offline</h3>
            <p className="text-sm text-[#40484e]">
              Log your prices right inside crowded markets with zero signal. Your device syncs
              automatically when back online.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e1e2e6]">
            <span className="material-symbols-outlined text-[#00567c] text-3xl mb-3 block">
              no_accounts
            </span>
            <h3 className="font-bold text-base text-[#191c1f] mb-2">No account required</h3>
            <p className="text-sm text-[#40484e]">
              Start logging immediately. Only add an email or phone number later if you want cloud
              backup across phones.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e1e2e6]">
            <span className="material-symbols-outlined text-[#00567c] text-3xl mb-3 block">
              download
            </span>
            <h3 className="font-bold text-base text-[#191c1f] mb-2">Your data is yours</h3>
            <p className="text-sm text-[#40484e]">
              Export your complete shopping history to CSV or JSON anytime, or permanently wipe it
              with one tap.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e1e2e6]">
            <span className="material-symbols-outlined text-[#00567c] text-3xl mb-3 block">
              verified
            </span>
            <h3 className="font-bold text-base text-[#191c1f] mb-2">Honest about data gaps</h3>
            <p className="text-sm text-[#40484e]">
              We never guess prices. When a market has fewer than 5 reports, we clearly mark it as
              low-confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-[#00567c] rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Ready to take control of your market budget?
          </h2>
          <p className="text-[#cbe3f7] max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Join thousands of households tracking prices across Lagos, Abuja, Port Harcourt, Ibadan,
            and Kano.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigateTo('log-choice')}
              className="bg-white text-[#00567c] hover:bg-[#f2f3f7] font-bold text-base px-8 py-4 rounded-xl shadow-md transition-all active:scale-95"
            >
              Log your first trip — it takes 30 seconds
            </button>
            <button
              onClick={() => navigateTo('home')}
              className="bg-[#2a6f97] text-white hover:bg-[#003e5a] font-semibold text-base px-6 py-4 rounded-xl transition-all"
            >
              Go to App Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e1e2e6] py-10 text-center text-xs text-[#71787f]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-bold text-[#00567c] text-sm">MarketPulse Nigeria</div>
          <div className="flex gap-6">
            <button onClick={() => navigateTo('home')} className="hover:text-[#00567c]">
              Dashboard
            </button>
            <button onClick={() => handleOpenPriceMap('map')} className="hover:text-[#00567c]">
              Price Map
            </button>
            <button onClick={() => navigateTo('weekly-report')} className="hover:text-[#00567c]">
              Weekly Report
            </button>
            <button onClick={() => navigateTo('data-mgmt')} className="hover:text-[#00567c]">
              Data & Privacy
            </button>
          </div>
          <div>© 2026 MarketPulse · Built for Nigerian Households</div>
        </div>
      </footer>
    </div>
  );
};
