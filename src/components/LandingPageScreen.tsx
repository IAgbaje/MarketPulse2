import React, { useMemo, useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import {
  LATEST_OFFICIAL_CPI,
  NBS_CBN_MONTHLY_CPI,
  getCommodityAnnualAverages,
} from '../data/foodInflationData';
import { trackFeatureAction } from '../lib/analytics';
import { ALL_NIGERIAN_MARKETS } from '../data/nigerianMarketsRegistry';
import heroMarketImg from '../assets/images/hero_nigerian_market_1795349017011.jpg';
import staplesCounterImg from '../assets/images/nigerian_staples_counter_1795349017492.jpg';

const QUICK_STATES = ['lagos', 'abuja', 'kano', 'portharcourt', 'ibadan', 'enugu'] as const;

export const LandingPageScreen: React.FC = () => {
  const {
    navigateTo,
    regions,
    activeRegion,
    setActiveRegionId,
    commodities,
    selectCommodityById,
  } = useMarketPulse();

  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [staplesImgFailed, setStaplesImgFailed] = useState(false);

  const multiplier = activeRegion.priceMultiplier || 1;
  const totalMappedMarkets = ALL_NIGERIAN_MARKETS.length;

  const markOnboarded = () => {
    try {
      localStorage.setItem('mp_onboarded', '1');
    } catch {
      // ignore
    }
  };

  const enterApp = (
    destination: 'home' | 'price-map' | 'log-choice' | 'budget' | 'commodity-detail',
    ctaName: string,
    options?: { tab?: 'map' | 'markets' | 'basket'; entityId?: string }
  ) => {
    markOnboarded();
    trackFeatureAction({
      action: 'landing_cta_click',
      detail: ctaName,
      screen: 'landing',
      region: activeRegion.name,
    });
    navigateTo(destination, options);
  };

  const handleStatePick = (regionId: string, label: string) => {
    setActiveRegionId(regionId);
    trackFeatureAction({
      action: 'landing_state_pick',
      detail: label,
      screen: 'landing',
      region: label,
    });
  };

  // Live 2023 -> 2024 -> Nov 2026 showcase items computed directly from the authoritative dataset
  const showcaseStaples = useMemo(() => {
    const ids = ['rice-50kg', 'tomatoes-fresh', 'beans-oloyin', 'garri-white', 'eggs-crate', 'palm-oil-5l'];
    return ids
      .map((id) => commodities.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => {
        const avgs = getCommodityAnnualAverages(c, multiplier);
        const series = c.chartData.datasets[0]?.data || [];
        const latest = Math.round(((series[series.length - 1] ?? c.latestPrice) * multiplier) / 50) * 50;
        const jan23 = Math.round(((series[0] ?? c.latestPrice) * multiplier) / 50) * 50;
        const jumpPct = jan23 ? Math.round(((latest - jan23) / jan23) * 100) : 0;
        return {
          commodity: c,
          avg2023: avgs[2023],
          avg2024: avgs[2024],
          latest,
          jumpPct,
        };
      });
  }, [commodities, multiplier]);

  const riceLatest = showcaseStaples[0]?.latest ?? 88500;
  const tomatoLatest = showcaseStaples[1]?.latest ?? 41500;
  const peak2024Food = useMemo(
    () => Math.max(...NBS_CBN_MONTHLY_CPI.filter((m) => m.year === 2024).map((m) => m.foodInflationYoY)),
    []
  );

  const shortStateName = activeRegion.state.replace(' State', '');

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] overflow-x-clip">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-50 bg-[#f5f5f7]/90 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-[#00567c] whitespace-nowrap shrink-0"
          >
            MarketPulse
          </button>

          {/* Zone 2: 4 Concise Single-Line Text Nav Links */}
          <nav
            aria-label="Landing Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#48484a]"
          >
            <a href="#start-journey" className="hover:text-[#00567c] transition-colors whitespace-nowrap shrink-0">
              Explore
            </a>
            <a href="#multi-year-data" className="hover:text-[#00567c] transition-colors whitespace-nowrap shrink-0">
              2023–2026 Data
            </a>
            <a href="#built-for-nigeria" className="hover:text-[#00567c] transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <button
              type="button"
              onClick={() => enterApp('price-map', 'nav_price_map', { tab: 'map' })}
              className="hover:text-[#00567c] transition-colors whitespace-nowrap shrink-0"
            >
              Price Map
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0">
            <button
              id="landing-nav-open-btn"
              type="button"
              onClick={() => enterApp('home', 'nav_open_app')}
              className="min-h-[40px] sm:min-h-[42px] bg-[#00567c] hover:bg-[#004361] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-xl transition-colors whitespace-nowrap shrink-0"
            >
              Open App
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section — Balanced 2-Column Split + Full-Width Live Pulse Strip */}
      <section className="pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 lg:space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Copy & Instant State-Aware Journey Control */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4 sm:space-y-5">
                <p className="text-xs sm:text-[13px] font-medium text-[#6e6e73] flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-[#00567c]">All 36 States &amp; FCT Abuja</span>
                  <span aria-hidden="true">·</span>
                  <span>NBS &amp; CBN Data (2023–2026)</span>
                  <span aria-hidden="true">·</span>
                  <span>No Sign-Up Needed</span>
                </p>

                <h1
                  className="font-display font-extrabold tracking-tight text-[#1d1d1f] leading-[1.08]"
                  style={{ fontSize: 'clamp(2.1rem, 4.3vw, 3.55rem)', textWrap: 'balance' }}
                >
                  Know what food really costs at your market before you leave home.
                </h1>

                <p className="text-[15px] sm:text-base lg:text-lg text-[#48484a] max-w-2xl leading-relaxed">
                  Compare prices across {totalMappedMarkets}+ Nigerian open markets and
                  supermarkets, inspect official NBS &amp; CBN food, fuel, and FX trends since
                  2023, and track every naira of your household food budget.
                </p>
              </div>

              {/* Instant State Picker + Single Primary CTA */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.07] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label
                    htmlFor="landing-state-select"
                    className="text-xs font-semibold text-[#1d1d1f]"
                  >
                    1. Pick your state to personalize prices immediately
                  </label>
                  <select
                    id="landing-state-select"
                    value={activeRegion.id}
                    onChange={(e) => {
                      const chosen = regions.find((r) => r.id === e.target.value);
                      if (chosen) handleStatePick(chosen.id, chosen.name);
                    }}
                    className="bg-[#f5f5f7] border border-black/[0.08] rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-[#1d1d1f] outline-none focus:border-[#00567c] min-h-[42px]"
                  >
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.state} ({r.markets[0]})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Popular States Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {QUICK_STATES.map((id) => {
                    const reg = regions.find((r) => r.id === id);
                    if (!reg) return null;
                    const active = activeRegion.id === reg.id;
                    return (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => handleStatePick(reg.id, reg.name)}
                        className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#00567c] text-white'
                            : 'bg-[#f5f5f7] text-[#3a3a3c] hover:bg-[#e8e8ed]'
                        }`}
                      >
                        {reg.state.replace(' State', '').replace('Federal Capital Territory', 'Abuja')}
                      </button>
                    );
                  })}
                </div>

                {/* Primary Conversion CTA + Clean Secondary Text Link */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <button
                    id="landing-hero-primary-btn"
                    type="button"
                    onClick={() => enterApp('home', 'hero_enter_state_dashboard')}
                    className="min-h-[48px] flex-1 bg-[#00567c] hover:bg-[#004361] text-white font-semibold text-sm sm:text-[15px] px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span>Explore {shortStateName} Market Prices</span>
                    <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
                  </button>
                  <button
                    id="landing-hero-inflation-btn"
                    type="button"
                    onClick={() =>
                      enterApp('commodity-detail', 'hero_open_nbs_cbn_2023_2026', {
                        entityId: 'inflation',
                      })
                    }
                    className="min-h-[48px] px-4 py-3 text-sm font-semibold text-[#00567c] hover:bg-[#eef6fb] rounded-xl transition-colors whitespace-nowrap text-center"
                  >
                    View 2023–2026 NBS/CBN Data
                  </button>
                </div>
              </div>
            </div>

            {/* Right Dominant Visual Anchor — Editorial Nigerian Market Photography */}
            <div className="lg:col-span-5">
              <div className="relative w-full h-72 sm:h-96 lg:h-full min-h-[320px] rounded-2xl overflow-hidden border border-black/[0.08] bg-gradient-to-br from-[#00567c] to-[#00344d]">
                {!heroImgFailed ? (
                  <img
                    src={heroMarketImg}
                    alt="Fresh Nigerian market stall displaying ripe tomatoes, yams, local rice and beans"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/90 p-6 text-center">
                    <span className="material-symbols-outlined text-5xl mb-2">storefront</span>
                    <span className="font-display font-bold text-lg">Nigerian Market Intelligence</span>
                  </div>
                )}

                {/* Measured Contrast Scrim + Dynamic State Snapshot Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-5 sm:p-6 text-white space-y-2.5">
                  <div className="text-xs text-white/80 font-medium">
                    {activeRegion.name} · {activeRegion.markets[0]} · {LATEST_OFFICIAL_CPI.month}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="text-[11px] text-white/75">Local Rice (50kg)</div>
                      <div className="font-display font-mono-num text-lg sm:text-xl font-bold">
                        ₦{riceLatest.toLocaleString('en-NG')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-white/75">Tomatoes (Basket)</div>
                      <div className="font-display font-mono-num text-lg sm:text-xl font-bold">
                        ₦{tomatoLatest.toLocaleString('en-NG')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Official NBS & CBN Pulse Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() =>
                enterApp('commodity-detail', 'pulse_food_inflation', { entityId: 'inflation' })
              }
              className="text-left bg-white hover:border-[#00567c]/35 rounded-2xl p-4 sm:p-5 border border-black/[0.06] transition-colors space-y-1"
            >
              <div className="text-xs text-[#6e6e73]">NBS Food Inflation ({LATEST_OFFICIAL_CPI.month})</div>
              <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f]">
                {LATEST_OFFICIAL_CPI.foodInflationYoY.toFixed(2)}%
              </div>
              <div className="text-xs text-[#15803d] font-medium">
                Down from {peak2024Food.toFixed(1)}% in 2024
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                enterApp('commodity-detail', 'pulse_cbn_rates', { entityId: 'inflation' })
              }
              className="text-left bg-white hover:border-[#00567c]/35 rounded-2xl p-4 sm:p-5 border border-black/[0.06] transition-colors space-y-1"
            >
              <div className="text-xs text-[#6e6e73]">CBN MPR · Official FX</div>
              <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f]">
                {LATEST_OFFICIAL_CPI.cbnMpr.toFixed(1)}%
              </div>
              <div className="text-xs text-[#48484a] font-mono-num">
                ₦{LATEST_OFFICIAL_CPI.usdNgnOfficial.toLocaleString('en-NG')}/$ · $
                {LATEST_OFFICIAL_CPI.externalReservesUsdBn.toFixed(1)}B Res.
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                enterApp('commodity-detail', 'pulse_fuel_gas', { entityId: 'inflation' })
              }
              className="text-left bg-white hover:border-[#00567c]/35 rounded-2xl p-4 sm:p-5 border border-black/[0.06] transition-colors space-y-1"
            >
              <div className="text-xs text-[#6e6e73]">Petrol (PMS) · Gas 12.5kg</div>
              <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#1d1d1f]">
                ₦{LATEST_OFFICIAL_CPI.petrolPmsPerLitre.toLocaleString('en-NG')}
                <span className="text-sm font-semibold text-[#6e6e73]">/L</span>
              </div>
              <div className="text-xs text-[#48484a] font-mono-num">
                LPG ₦{LATEST_OFFICIAL_CPI.cookingGas125kg.toLocaleString('en-NG')} · 47M tracked
              </div>
            </button>

            <button
              type="button"
              onClick={() => enterApp('price-map', 'pulse_mapped_markets', { tab: 'markets' })}
              className="text-left bg-white hover:border-[#00567c]/35 rounded-2xl p-4 sm:p-5 border border-black/[0.06] transition-colors space-y-1"
            >
              <div className="text-xs text-[#6e6e73]">Nationwide Directory</div>
              <div className="font-display font-mono-num text-2xl sm:text-3xl font-extrabold text-[#00567c]">
                {totalMappedMarkets}+
              </div>
              <div className="text-xs text-[#48484a]">
                Open markets &amp; supermarkets mapped
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Smooth 1-Tap User Journeys */}
      <section
        id="start-journey"
        className="py-12 sm:py-16 lg:py-20 bg-white border-y border-black/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1d1d1f]">
              Jump straight into what you need today
            </h2>
            <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed">
              No sign-up wall or onboarding maze. Pick a task below and start immediately with{' '}
              <strong className="text-[#1d1d1f]">{activeRegion.name}</strong> preloaded.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {[
              {
                num: '01.',
                title: 'Compare nearby markets & get directions',
                body: `Browse ${activeRegion.markets.slice(0, 3).join(', ')} and 290+ open markets & supermarkets on Google Maps before buying.`,
                cta: 'Open Live Price Map',
                onClick: () => enterApp('price-map', 'journey_price_map', { tab: 'map' }),
              },
              {
                num: '02.',
                title: 'Inspect 2023–2026 NBS & CBN inflation data',
                body: 'Track 47 months of Nigerian food prices, CPI inflation, CBN MPR, official NFEM FX, petrol, diesel, and 12.5kg cooking gas.',
                cta: 'Open 2023–2026 Observatory',
                onClick: () =>
                  enterApp('commodity-detail', 'journey_inflation_2023_2026', {
                    entityId: 'inflation',
                  }),
              },
              {
                num: '03.',
                title: 'Record today’s market trip in seconds',
                body: 'Log items using everyday Nigerian units (derica, paint rubber, basket, tuber, crate) or snap your paper receipt.',
                cta: 'Record a Market Run',
                onClick: () => enterApp('log-choice', 'journey_log_trip'),
              },
              {
                num: '04.',
                title: 'See why your food budget moved',
                body: 'Separate market price inflation from buying extra items so your household stays ahead of monthly food costs.',
                cta: 'Open Food Budget',
                onClick: () => enterApp('budget', 'journey_budget'),
              },
            ].map((item) => (
              <button
                key={item.num}
                type="button"
                onClick={item.onClick}
                className="group text-left bg-[#f5f5f7] hover:bg-[#eef6fb] rounded-2xl p-5 sm:p-6 border border-black/[0.06] hover:border-[#00567c]/30 transition-colors flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="font-display font-bold text-base sm:text-lg text-[#1d1d1f]">
                    <span className="text-[#00567c] mr-1.5 font-mono-num">{item.num}</span>
                    {item.title}
                  </div>
                  <p className="text-sm text-[#48484a] leading-relaxed">{item.body}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00567c]">
                  <span>{item.cta}</span>
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
                    arrow_forward
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Live 2023 → 2026 Staple Price Proof + Editorial Food Photography */}
      <section id="multi-year-data" className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Editorial Visual */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative flex-1 min-h-[260px] rounded-2xl overflow-hidden border border-black/[0.07] bg-white">
                {!staplesImgFailed ? (
                  <img
                    src={staplesCounterImg}
                    alt="Nigerian household food staples including palm oil, rice, oloyin beans, garri, eggs, tomatoes, onions and yam"
                    referrerPolicy="no-referrer"
                    onError={() => setStaplesImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#eef6fb] flex items-center justify-center p-8 text-[#00567c] font-display font-bold">
                    16 Tracked Nigerian Household Staples
                  </div>
                )}
              </div>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Every staple includes 47 monthly data points from Jan 2023 to Nov 2026 grounded in
                NBS Selected Food Price Watch and CBN CPI bulletins.
              </p>
            </div>

            {/* Right Interactive 2023 vs 2024 vs Nov 2026 Table */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d1d1f]">
                  Four years of Nigerian food prices at a glance ({shortStateName})
                </h2>
                <p className="text-sm sm:text-base text-[#6e6e73]">
                  Tap any item below to open its full 47-month interactive chart and compare local
                  markets against the NBS national average.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f5f5f7] text-[11px] font-semibold text-[#6e6e73] border-b border-black/[0.06]">
                        <th className="py-3 px-4 whitespace-nowrap">Staple</th>
                        <th className="py-3 px-3 text-right whitespace-nowrap hidden sm:table-cell">2023 Avg</th>
                        <th className="py-3 px-3 text-right whitespace-nowrap hidden sm:table-cell">2024 Avg</th>
                        <th className="py-3 px-3 text-right whitespace-nowrap">Nov 2026</th>
                        <th className="py-3 px-4 text-right whitespace-nowrap">vs Jan 23</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.05] text-xs sm:text-sm">
                      {showcaseStaples.map(({ commodity, avg2023, avg2024, latest, jumpPct }) => (
                        <tr
                          key={commodity.id}
                          onClick={() => {
                            markOnboarded();
                            trackFeatureAction({
                              action: 'landing_staple_click',
                              detail: commodity.id,
                              screen: 'landing',
                              region: activeRegion.name,
                            });
                            selectCommodityById(commodity.id, true);
                          }}
                          className="hover:bg-[#f5f5f7] cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#1d1d1f]">{commodity.name}</div>
                            <div className="text-[11px] text-[#6e6e73]">{commodity.unitDescription}</div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono-num text-[#6e6e73] whitespace-nowrap hidden sm:table-cell">
                            ₦{avg2023.toLocaleString('en-NG')}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-num text-[#6e6e73] whitespace-nowrap hidden sm:table-cell">
                            ₦{avg2024.toLocaleString('en-NG')}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-num font-bold text-[#1d1d1f] whitespace-nowrap">
                            ₦{latest.toLocaleString('en-NG')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono-num font-bold text-[#b91c1c] whitespace-nowrap">
                            +{jumpPct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#6e6e73]">
                  Showing 6 of {commodities.length} tracked staples · Prices adjusted for {activeRegion.name}
                </span>
                <button
                  type="button"
                  onClick={() => enterApp('commodity-detail', 'table_view_all_16_staples')}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#00567c] hover:bg-[#004361] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  Inspect All {commodities.length} Staples
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Built for Everyday Nigerian Phone Browsers & Offline Reality */}
      <section
        id="built-for-nigeria"
        className="py-12 sm:py-16 bg-white border-t border-black/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1d1d1f]">
              Built for Nigerian markets and phone browsers
            </h2>
            <p className="text-sm sm:text-base text-[#6e6e73]">
              Fast on mobile data, usable offline in crowded open markets, and respectful of your
              privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Works offline inside markets',
                body: 'Record items when network bars disappear at Mile 12, Wuse, or Bodija. Everything saves locally first.',
              },
              {
                title: 'Local Nigerian measurements',
                body: 'Native support for derica, paint rubber, mudu, congo, basket, crate of 30, and 5L kegs — no awkward conversions.',
              },
              {
                title: 'Credible NBS & CBN grounding',
                body: 'Continuous Jan 2023 – Nov 2026 CPI, MPR, FX, PMS, Diesel, and LPG series paired with live shopper reports.',
              },
              {
                title: 'Full ownership of your records',
                body: 'No forced sign-in. Export your entire household history to CSV or JSON anytime in one tap.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.05] space-y-2"
              >
                <h3 className="font-display font-bold text-base text-[#1d1d1f]">{item.title}</h3>
                <p className="text-sm text-[#48484a] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-[#f5f5f7] border-t border-black/[0.06] py-8 text-xs text-[#6e6e73] pb-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-display font-bold text-[#00567c] text-sm">MarketPulse Nigeria</div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <button
              type="button"
              onClick={() => enterApp('home', 'footer_dashboard')}
              className="hover:text-[#00567c] font-medium py-1"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => enterApp('price-map', 'footer_price_map', { tab: 'map' })}
              className="hover:text-[#00567c] font-medium py-1"
            >
              Price Map
            </button>
            <button
              type="button"
              onClick={() =>
                enterApp('commodity-detail', 'footer_nbs_cbn', { entityId: 'inflation' })
              }
              className="hover:text-[#00567c] font-medium py-1"
            >
              NBS &amp; CBN Data
            </button>
          </div>
          <div>© 2026 MarketPulse · Built for Nigerian Households</div>
        </div>
      </footer>
    </div>
  );
};
