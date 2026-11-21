import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { UnitType, ItemCategory, TripItem } from '../types';
import {
  POPULAR_MARKET_STAPLES,
  NigerianFoodItem,
  resolveFoodVisual,
  searchNigerianFoods,
} from '../data/nigerianFoodRegistry';
import { FoodIconBadge } from './ui/FoodIconBadge';
import { CalendarPicker } from './ui/CalendarPicker';
import { NairaInput } from './ui/NairaInput';
import { MarketPicker } from './ui/MarketPicker';

const NIGERIAN_UNITS: { value: UnitType; label: string }[] = [
  { value: 'derica', label: 'derica' },
  { value: 'paint', label: 'paint' },
  { value: 'basket', label: 'basket' },
  { value: 'bag', label: 'bag' },
  { value: 'crate', label: 'crate' },
  { value: 'tuber', label: 'tuber' },
  { value: 'mudu', label: 'mudu' },
  { value: 'congo', label: 'congo' },
  { value: 'kg', label: 'kg' },
  { value: 'L', label: 'L (litres)' },
  { value: 'bottle', label: 'bottle' },
  { value: 'tin', label: 'tin' },
  { value: 'pack', label: 'pack' },
  { value: 'bunch', label: 'bunch' },
  { value: 'loaf', label: 'loaf' },
  { value: 'pieces', label: 'pieces' },
  { value: 'sachet', label: 'sachet' },
  { value: 'roll', label: 'roll' },
];

export const LogChoiceScreen: React.FC = () => {
  const {
    stagingItems,
    addStagingItem,
    removeStagingItem,
    updateStagingItem,
    stagingMarket,
    setStagingMarket,
    stagingDate,
    setStagingDate,
    activeRegion,
    navigateTo,
  } = useMarketPulse();

  const [inputName, setInputName] = useState('');
  const [inputQty, setInputQty] = useState<number | ''>(1);
  const [inputUnit, setInputUnit] = useState<UnitType>('derica');
  const [inputPrice, setInputPrice] = useState<number | ''>('');
  const [inputCategory, setInputCategory] = useState<ItemCategory>('Produce');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    if (!inputName.trim()) return [];
    return searchNigerianFoods(inputName, 7);
  }, [inputName]);

  const liveVisual = useMemo(
    () => resolveFoodVisual(inputName, inputCategory),
    [inputName, inputCategory]
  );

  const runningTotal = stagingItems.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const handleSelectSuggestion = (item: NigerianFoodItem) => {
    setInputName(item.name);
    setInputUnit(item.defaultUnit);
    setInputPrice(item.defaultPrice);
    setInputCategory(item.category);
    setShowSuggestions(false);
  };

  const handleQuickAddStaple = (item: NigerianFoodItem) => {
    addStagingItem({
      name: item.name,
      category: item.category,
      quantity: 1,
      unit: item.defaultUnit,
      unitDetail: `1 ${item.defaultUnit}`,
      price: item.defaultPrice,
      annotationType: 'none',
    });
  };

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputName.trim()) return;

    const resolved = resolveFoodVisual(inputName.trim(), inputCategory);
    const qty = Number(inputQty) || 1;

    addStagingItem({
      name: inputName.trim(),
      category: resolved.category,
      quantity: qty,
      unit: inputUnit,
      unitDetail: `${qty} ${inputUnit}`,
      price: Number(inputPrice) || 0,
      annotationType: 'none',
    });

    setInputName('');
    setInputQty(1);
    setInputPrice('');
    setShowSuggestions(false);
  };

  const handleAdjustQty = (item: TripItem, delta: number) => {
    const nextQty = Math.max(1, (item.quantity || 1) + delta);
    const unitPrice = item.quantity > 0 ? Math.round(item.price / item.quantity) : item.price;
    updateStagingItem(item.id, {
      quantity: nextQty,
      unitDetail: `${nextQty} ${item.unit}`,
      price: unitPrice * nextQty,
    });
  };

  const renderComposerForm = (dropdownDirection: 'up' | 'down') => (
    <form onSubmit={handleAddItem} className="space-y-3">
      {/* Item Name with Live Matching Food Icon */}
      <div className="relative">
        <div className="flex items-center gap-2.5 bg-[#f5f5f7] border border-black/[0.08] rounded-xl pl-2 pr-3 py-1.5 focus-within:bg-white focus-within:border-[#00567c] focus-within:ring-2 focus-within:ring-[#00567c]/15 transition-all">
          <FoodIconBadge
            name={inputName || 'Tomatoes'}
            category={liveVisual.category}
            size="sm"
          />
          <input
            id={dropdownDirection === 'down' ? 'log-item-name-input-desktop' : 'log-item-name-input'}
            type="text"
            value={inputName}
            onChange={(e) => {
              const val = e.target.value;
              setInputName(val);
              setShowSuggestions(true);
              const matched = resolveFoodVisual(val, inputCategory).matchedItem;
              if (matched) {
                setInputCategory(matched.category);
                setInputUnit(matched.defaultUnit);
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
            placeholder="Type food item (e.g. Eggs, Yam, Mango, Rice)"
            className="w-full bg-transparent py-1.5 text-sm font-medium text-[#1d1d1f] placeholder-[#86868b] outline-none"
          />
          {inputName && (
            <button
              type="button"
              onClick={() => setInputName('')}
              aria-label="Clear item name"
              className="text-[#86868b] hover:text-[#1d1d1f] p-1 rounded-full"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: dropdownDirection === 'up' ? 6 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className={`absolute left-0 right-0 bg-white/98 backdrop-blur-xl border border-black/[0.09] rounded-2xl shadow-xl shadow-black/10 z-50 overflow-hidden max-h-64 overflow-y-auto divide-y divide-black/[0.05] ${
                dropdownDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
              }`}
            >
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(s);
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-sm text-[#1d1d1f] hover:bg-[#f5f5f7] cursor-pointer flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FoodIconBadge name={s.name} category={s.category} size="xs" />
                    <div className="min-w-0">
                      <div className="font-semibold text-[13px] truncate">{s.name}</div>
                      <div className="text-[11px] text-[#6e6e73] truncate">{s.category}</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#00567c] font-mono-num whitespace-nowrap shrink-0">
                    ₦{s.defaultPrice.toLocaleString()} / {s.defaultUnit}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quantity + Nigerian Unit + Accounting Naira Price */}
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-3">
          <input
            type="number"
            min="0.1"
            step="any"
            value={inputQty}
            onChange={(e) => setInputQty(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Qty"
            aria-label="Quantity"
            className="w-full bg-[#f5f5f7] border border-black/[0.09] rounded-xl py-2.5 px-2 text-sm font-mono-num font-semibold text-center text-[#1d1d1f] focus:bg-white focus:border-[#00567c] focus:ring-2 focus:ring-[#00567c]/20 outline-none transition-all"
          />
        </div>

        <div className="col-span-4 relative">
          <select
            value={inputUnit}
            onChange={(e) => setInputUnit(e.target.value as UnitType)}
            aria-label="Unit"
            className="w-full appearance-none bg-[#f5f5f7] border border-black/[0.09] rounded-xl py-2.5 pl-3 pr-7 text-xs font-semibold text-[#1d1d1f] focus:bg-white focus:border-[#00567c] focus:ring-2 focus:ring-[#00567c]/20 outline-none transition-all cursor-pointer"
          >
            {NIGERIAN_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#86868b] text-[16px] pointer-events-none">
            expand_more
          </span>
        </div>

        <div className="col-span-5">
          <NairaInput
            value={inputPrice}
            onChange={setInputPrice}
            placeholder="Price"
            size="md"
            ariaLabel="Item price in Naira"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2.5 pt-1">
        <button
          type="submit"
          id={dropdownDirection === 'down' ? 'log-add-item-desktop-btn' : 'log-add-item-submit-btn'}
          className="flex-1 min-h-[44px] bg-[#00567c]/10 hover:bg-[#00567c]/18 text-[#00567c] font-semibold py-2.5 rounded-xl transition-colors text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Add to Bag</span>
        </button>

        <button
          type="button"
          id={dropdownDirection === 'down' ? 'log-proceed-confirm-desktop-btn' : 'log-proceed-confirm-btn'}
          onClick={() => navigateTo('log-confirm')}
          className="flex-1 min-h-[44px] bg-[#00567c] text-white font-semibold py-2.5 rounded-xl hover:bg-[#004361] transition-colors text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98]"
        >
          <span>Check &amp; Save ({stagingItems.length})</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-16 pb-64 lg:pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Clean Apple-style Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
              Record Market Run
            </h1>
            <p className="text-sm text-[#6e6e73] mt-0.5">
              Add what you bought today or snap your paper receipt — takes less than a minute.
            </p>
          </div>

          <button
            id="log-scan-receipt-btn"
            type="button"
            onClick={() => navigateTo('log-scan')}
            className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/[0.08] text-[#00567c] text-xs font-semibold rounded-full hover:bg-[#00567c] hover:text-white hover:border-[#00567c] transition-all shadow-2xs shrink-0 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[17px]">document_scanner</span>
            <span>Snap Receipt</span>
          </button>
        </header>

        {/* Responsive 2-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Market & Date Picker + Add Item + Quick Staples */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
            {/* Market & Date Card */}
            <section className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3.5">
              <div className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                Where &amp; When You Shopped
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {/* Searchable Nationwide Market & Supermarket Picker */}
                <MarketPicker
                  id="log-market-select"
                  label="Market or Supermarket"
                  value={stagingMarket}
                  activeRegionId={activeRegion.id}
                  activeRegionName={activeRegion.name}
                  onChange={(name) => setStagingMarket(name)}
                />

                {/* Interactive Apple Calendar Picker */}
                <CalendarPicker
                  id="log-date-picker-btn"
                  label="Market Day"
                  value={stagingDate}
                  onChange={(formatted) => setStagingDate(formatted)}
                />
              </div>
            </section>

            {/* Desktop Add Item Composer */}
            <section className="hidden lg:block bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                  Add What You Bought
                </span>
                <span className="text-[11px] text-[#86868b]">Hit Enter to add</span>
              </div>
              {renderComposerForm('down')}
            </section>

            {/* Quick-Tap Popular Nigerian Staples */}
            <section className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                  Tap to Add Everyday Staples
                </span>
                <span className="text-[11px] text-[#86868b]">1-tap add</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_MARKET_STAPLES.slice(0, 10).map((staple) => (
                  <button
                    key={staple.id}
                    type="button"
                    onClick={() => handleQuickAddStaple(staple)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#d4e8f7]/60 hover:text-[#003852] border border-black/[0.05] text-xs font-medium text-[#1d1d1f] transition-all active:scale-95"
                  >
                    <span className="text-[15px] leading-none" aria-hidden="true">
                      {staple.icon}
                    </span>
                    <span>{staple.name.split(' (')[0]}</span>
                    <span className="material-symbols-outlined text-[14px] text-[#00567c]">
                      add
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Interactive Market Bag */}
          <section className="lg:col-span-7 bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-5 py-4 border-b border-black/[0.06] flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-base text-[#1d1d1f]">
                  Your Market Bag ({stagingItems.length})
                </h2>
                <p className="text-xs text-[#6e6e73]">
                  {stagingMarket} · {stagingDate} · Tap any price to edit
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-medium text-[#6e6e73] block">Total Spent</span>
                <span className="font-display font-mono-num text-xl sm:text-2xl font-extrabold text-[#00567c]">
                  ₦{runningTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {stagingItems.length === 0 ? (
              <div className="p-12 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] mx-auto flex items-center justify-center text-2xl">
                  🛍️
                </div>
                <p className="font-display font-bold text-base text-[#1d1d1f]">
                  Your market bag is empty
                </p>
                <p className="text-xs text-[#6e6e73] max-w-xs mx-auto leading-relaxed">
                  Type an item on the left, tap an everyday staple, or snap your receipt to fill
                  your bag.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {stagingItems.map((item: TripItem) => {
                  const isEditingPrice = inlineEditId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-[#f5f5f7]/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FoodIconBadge name={item.name} category={item.category} size="md" />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-[#1d1d1f] truncate">
                            {item.name}
                          </h3>
                          <p className="text-xs text-[#6e6e73] truncate">
                            {item.unitDetail || `${item.quantity} ${item.unit}`} · {item.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* Inline Quantity Stepper */}
                        <div className="hidden sm:inline-flex items-center bg-[#f5f5f7] rounded-full border border-black/[0.06] p-0.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustQty(item, -1)}
                            aria-label={`Decrease quantity for ${item.name}`}
                            className="w-6 h-6 rounded-full hover:bg-white flex items-center justify-center text-[#48484a] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">remove</span>
                          </button>
                          <span className="px-2 text-xs font-mono-num font-semibold text-[#1d1d1f]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustQty(item, 1)}
                            aria-label={`Increase quantity for ${item.name}`}
                            className="w-6 h-6 rounded-full hover:bg-white flex items-center justify-center text-[#48484a] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                          </button>
                        </div>

                        {/* Tap-to-edit Accounting Price */}
                        {isEditingPrice ? (
                          <div className="w-28">
                            <NairaInput
                              value={item.price}
                              onChange={(val) =>
                                updateStagingItem(item.id, { price: Number(val) || 0 })
                              }
                              size="sm"
                              align="right"
                              autoFocus
                              ariaLabel={`Edit price for ${item.name}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') {
                                  setInlineEditId(null);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setInlineEditId(item.id)}
                            title="Tap to edit price"
                            className="px-2.5 py-1.5 rounded-lg hover:bg-[#d4e8f7]/45 font-mono-num font-bold text-sm text-[#1d1d1f] hover:text-[#00567c] transition-colors"
                          >
                            ₦{item.price.toLocaleString()}
                          </button>
                        )}

                        {isEditingPrice ? (
                          <button
                            type="button"
                            onClick={() => setInlineEditId(null)}
                            aria-label="Done editing price"
                            className="min-w-[34px] min-h-[34px] flex items-center justify-center text-[#00567c] bg-[#d4e8f7]/60 rounded-full"
                          >
                            <span className="material-symbols-outlined text-[17px]">check</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeStagingItem(item.id)}
                            className="min-w-[34px] min-h-[34px] flex items-center justify-center text-[#86868b] hover:text-[#c81e1e] hover:bg-[#fef2f2] rounded-full transition-colors"
                            aria-label={`Remove ${item.name}`}
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Fixed Bottom Composer Tray */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-surface border-t border-black/[0.08] p-4 pb-safe z-40 shadow-lg">
        <div className="max-w-lg mx-auto space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-[#6e6e73]">
              Total Spent ({stagingItems.length} {stagingItems.length === 1 ? 'item' : 'items'})
            </span>
            <span className="font-display font-mono-num text-xl font-extrabold text-[#00567c]">
              ₦{runningTotal.toLocaleString()}
            </span>
          </div>
          {renderComposerForm('up')}
        </div>
      </div>
    </div>
  );
};
