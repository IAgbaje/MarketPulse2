import React, { useState, useMemo } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { UnitType, ItemCategory, TripItem } from '../types';
import { COMMON_NIGERIAN_GROCERIES } from '../data/initialData';

export const LogChoiceScreen: React.FC = () => {
  const {
    stagingItems,
    addStagingItem,
    removeStagingItem,
    stagingMarket,
    setStagingMarket,
    stagingDate,
    setStagingDate,
    availableMarkets,
    navigateTo,
    goBack,
  } = useMarketPulse();

  const [inputName, setInputName] = useState('');
  const [inputQty, setInputQty] = useState<number | ''>(1);
  const [inputUnit, setInputUnit] = useState<UnitType>('kg');
  const [inputPrice, setInputPrice] = useState<number | ''>('');
  const [inputCategory, setInputCategory] = useState<ItemCategory>('Produce');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Autocomplete matching
  const suggestions = useMemo(() => {
    if (!inputName.trim()) return [];
    return COMMON_NIGERIAN_GROCERIES.filter((g) =>
      g.name.toLowerCase().includes(inputName.toLowerCase())
    );
  }, [inputName]);

  const runningTotal = stagingItems.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const handleSelectSuggestion = (item: (typeof COMMON_NIGERIAN_GROCERIES)[0]) => {
    setInputName(item.name);
    setInputUnit(item.defaultUnit);
    setInputPrice(item.defaultPrice);
    setInputCategory(item.category);
    setShowSuggestions(false);
  };

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputName.trim()) return;

    addStagingItem({
      name: inputName.trim(),
      category: inputCategory,
      quantity: Number(inputQty) || 1,
      unit: inputUnit,
      unitDetail: `${Number(inputQty) || 1} ${inputUnit}`,
      price: Number(inputPrice) || 0,
      annotationType: 'none',
    });

    // Reset input
    setInputName('');
    setInputQty(1);
    setInputPrice('');
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-16 pb-52 px-4 md:px-6 max-w-md mx-auto w-full overflow-x-hidden">
      {/* Top Trip Context & Scan Receipt Header */}
      <div className="pt-3 pb-3.5 border-b border-[#c0c7cf]/30 mb-3 space-y-2.5">
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs font-bold text-[#40484e] uppercase tracking-wider">
            Trip Details
          </span>

          {/* Scan receipt button */}
          <button
            id="log-scan-receipt-btn"
            onClick={() => navigateTo('log-scan')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#cbe3f7] text-[#00567c] text-xs font-bold rounded-lg hover:bg-[#2a6f97] hover:text-white transition-colors shrink-0 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">document_scanner</span>
            <span>Scan receipt</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Market Field */}
          <div className="bg-white border border-[#c0c7cf]/60 rounded-xl px-3 py-2 flex flex-col min-w-0 shadow-2xs focus-within:border-[#00567c] focus-within:ring-1 focus-within:ring-[#00567c]">
            <label
              htmlFor="log-market-select"
              className="text-[10px] font-bold text-[#71787f] uppercase tracking-wider flex items-center gap-1 mb-0.5"
            >
              <span className="material-symbols-outlined text-[13px] text-[#00567c]">
                storefront
              </span>
              <span>Market</span>
            </label>
            <div className="relative w-full min-w-0">
              <select
                id="log-market-select"
                value={stagingMarket}
                onChange={(e) => setStagingMarket(e.target.value)}
                className="w-full appearance-none bg-transparent text-xs sm:text-sm font-bold text-[#00567c] pr-5 py-0.5 border-0 focus:ring-0 focus:outline-none truncate cursor-pointer"
              >
                {availableMarkets.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-[#71787f] text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Date Field */}
          <div className="bg-white border border-[#c0c7cf]/60 rounded-xl px-3 py-2 flex flex-col min-w-0 shadow-2xs focus-within:border-[#00567c] focus-within:ring-1 focus-within:ring-[#00567c]">
            <label
              htmlFor="log-date-input"
              className="text-[10px] font-bold text-[#71787f] uppercase tracking-wider flex items-center gap-1 mb-0.5"
            >
              <span className="material-symbols-outlined text-[13px] text-[#00567c]">
                calendar_today
              </span>
              <span>Date</span>
            </label>
            <input
              id="log-date-input"
              type="text"
              value={stagingDate}
              onChange={(e) => setStagingDate(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#191c1f] py-0.5 border-0 focus:ring-0 focus:outline-none truncate"
              placeholder="Today, 14 Oct"
            />
          </div>
        </div>
      </div>

      {/* Logged items list */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-[#c0c7cf]/30">
          {stagingItems.map((item: TripItem) => (
            <div key={item.id} className="flex items-center justify-between py-3.5 group">
              <div className="flex-1 pr-2">
                <h4 className="font-semibold text-sm text-[#191c1f] leading-snug">
                  {item.name}
                </h4>
                <p className="text-xs text-[#40484e]">
                  {item.unitDetail || `${item.quantity} ${item.unit}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-sm tabular-nums text-[#00567c]">
                  ₦{item.price.toLocaleString()}
                </span>
                <button
                  onClick={() => removeStagingItem(item.id)}
                  className="p-1.5 text-[#71787f] hover:text-[#ba1a1a] transition-colors rounded-full hover:bg-[#ffdad6]/30"
                  aria-label={`Delete ${item.name}`}
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed bottom input tray */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f2f3f7] border-t border-[#c0c7cf]/40 p-4 z-40 shadow-lg">
        <div className="max-w-md mx-auto">
          {/* Running total header */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#40484e] text-sm font-semibold">Total</span>
            <span className="text-2xl font-extrabold tabular-nums text-[#00567c]">
              ₦{runningTotal.toLocaleString()}
            </span>
          </div>

          {/* Quick Input Row */}
          <form onSubmit={handleAddItem} className="space-y-2 mb-3">
            <div className="relative">
              <input
                id="log-item-name-input"
                type="text"
                value={inputName}
                onChange={(e) => {
                  setInputName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Item name (e.g. Tomatoes, Rice)"
                className="w-full bg-white border border-[#c0c7cf]/60 rounded-xl p-3 text-sm text-[#191c1f] placeholder-[#71787f] focus:ring-2 focus:ring-[#00567c] outline-none"
              />

              {/* Live Autocomplete Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 bg-white border border-[#c0c7cf]/60 rounded-xl mb-1 shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto divide-y divide-[#e1e2e6]">
                  {suggestions.map((s) => (
                    <div
                      key={s.name}
                      onClick={() => handleSelectSuggestion(s)}
                      className="p-3 text-sm text-[#191c1f] hover:bg-[#cbe3f7]/40 cursor-pointer flex justify-between items-center transition-colors"
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-[#71787f]">₦{s.defaultPrice} / {s.defaultUnit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={inputQty}
                  onChange={(e) => setInputQty(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Qty"
                  className="w-full bg-white border border-[#c0c7cf]/60 rounded-xl p-2.5 text-sm tabular-nums text-center text-[#191c1f] focus:ring-2 focus:ring-[#00567c] outline-none"
                />
              </div>

              <div className="col-span-4">
                <select
                  value={inputUnit}
                  onChange={(e) => setInputUnit(e.target.value as UnitType)}
                  className="w-full bg-white border border-[#c0c7cf]/60 rounded-xl p-2.5 text-xs font-medium text-[#191c1f] focus:ring-2 focus:ring-[#00567c] outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="bag">bag</option>
                  <option value="basket">basket</option>
                  <option value="paint">paint</option>
                  <option value="derica">derica</option>
                  <option value="L">L</option>
                  <option value="pack">pack</option>
                  <option value="bunch">bunch</option>
                  <option value="pieces">pieces</option>
                  <option value="sachet">sachet</option>
                  <option value="tuber">tuber</option>
                </select>
              </div>

              <div className="col-span-4">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#71787f]">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Price"
                    className="w-full bg-white border border-[#c0c7cf]/60 rounded-xl p-2.5 pl-6 text-sm tabular-nums font-bold text-[#191c1f] focus:ring-2 focus:ring-[#00567c] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                id="log-add-item-submit-btn"
                className="flex-1 bg-[#2a6f97] text-white font-bold py-3 rounded-xl hover:bg-[#00567c] active:scale-[0.98] transition-transform text-sm shadow-xs flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Item</span>
              </button>

              <button
                type="button"
                id="log-proceed-confirm-btn"
                onClick={() => navigateTo('log-confirm')}
                className="flex-1 bg-[#00567c] text-white font-bold py-3 rounded-xl hover:bg-[#2a6f97] active:scale-[0.98] transition-transform text-sm shadow-xs flex items-center justify-center gap-1"
              >
                <span>Confirm ({stagingItems.length})</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
