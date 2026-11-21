import React, { useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { ItemCategory, TripItem } from '../types';
import { CATEGORY_REGISTRY } from '../data/nigerianFoodRegistry';
import { AdaptiveSheet } from './ui/AdaptiveSheet';
import { FoodIconBadge } from './ui/FoodIconBadge';
import { CalendarPicker } from './ui/CalendarPicker';
import { NairaInput } from './ui/NairaInput';
import { MarketPicker } from './ui/MarketPicker';

export const LogConfirmScreen: React.FC = () => {
  const {
    stagingItems,
    setStagingItems,
    stagingMarket,
    setStagingMarket,
    stagingDate,
    setStagingDate,
    activeRegion,
    saveStagingTrip,
    navigateTo,
    setPendingRawInput,
  } = useMarketPulse();

  const [editingItem, setEditingItem] = useState<TripItem | null>(null);
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [editQty, setEditQty] = useState<string>('');
  const [editCategory, setEditCategory] = useState<ItemCategory>('Produce');

  const totalSpend = stagingItems.reduce((acc, i) => acc + (i.price || 0), 0);
  const flaggedCount = stagingItems.filter(
    (i) => i.annotationType === 'outlier' || i.annotationType === 'unsure'
  ).length;

  const handleStartEdit = (item: TripItem) => {
    if (item.name.toLowerCase().includes('mayonnaise') || item.annotationType === 'unsure') {
      setPendingRawInput(`${item.name} - ${stagingMarket}`);
    }
    setEditingItem(item);
    setEditPrice(item.price);
    setEditQty(item.quantity.toString());
    setEditCategory(item.category);
  };

  const handleSaveItemEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const newPrice = Number(editPrice) || editingItem.price;
    const newQty = parseFloat(editQty) || editingItem.quantity;

    setStagingItems((prev) =>
      prev.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              price: newPrice,
              quantity: newQty,
              category: editCategory,
              unitDetail: `${newQty} ${i.unit}`,
              annotationType: 'none',
            }
          : i
      )
    );
    setEditingItem(null);
  };

  const handleAddNewItem = () => {
    const newItem: TripItem = {
      id: `stg-new-${Date.now()}`,
      name: 'Ugwu Leaves (Pumpkin)',
      category: 'Produce',
      quantity: 2,
      unit: 'bunch',
      unitDetail: '2 bunches',
      price: 600,
      annotationType: 'none',
    };
    setStagingItems((prev) => [...prev, newItem]);
  };

  const handleSaveTrip = () => {
    saveStagingTrip();
    navigateTo('log-success');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-16 pb-32 lg:pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <header>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            Check Before Saving
          </h1>
          <p className="text-sm text-[#6e6e73] mt-1">
            Tap any item below if you want to correct the price, quantity, or market day.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Market & Date + Item Verification List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Searchable Market / Supermarket Picker */}
              <div className="bg-white rounded-2xl p-1.5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] min-w-0">
                <MarketPicker
                  id="confirm-market-picker-btn"
                  label="Market or Supermarket"
                  value={stagingMarket}
                  activeRegionId={activeRegion.id}
                  activeRegionName={activeRegion.name}
                  onChange={(name) => setStagingMarket(name)}
                  compact
                />
              </div>

              {/* Calendar Picker */}
              <div className="bg-white rounded-2xl p-1.5 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <CalendarPicker
                  id="confirm-date-picker-btn"
                  label="Market Day"
                  value={stagingDate}
                  onChange={(formatted) => setStagingDate(formatted)}
                  compact
                />
              </div>
            </div>

            {/* Line Items */}
            <section className="space-y-2.5">
              {stagingItems.map((item) => {
                const isOutlier = item.annotationType === 'outlier';
                const isUnsure = item.annotationType === 'unsure';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className={`w-full text-left flex flex-col p-4 rounded-2xl transition-all border shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                      isOutlier
                        ? 'bg-[#fef2f2] border-[#c81e1e]/30 hover:border-[#c81e1e]/60'
                        : isUnsure
                        ? 'bg-[#f8fafc] border-dashed border-slate-400 hover:border-[#00567c]'
                        : 'bg-white border-black/[0.06] hover:border-[#00567c]/40'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-3 w-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <FoodIconBadge name={item.name} category={item.category} size="md" />
                        <div className="min-w-0">
                          <span className="font-semibold text-[#1d1d1f] text-sm sm:text-base flex items-center gap-1.5">
                            <span className="truncate">{item.name}</span>
                            <span className="material-symbols-outlined text-[14px] text-[#86868b]">
                              edit
                            </span>
                          </span>
                          <span className="text-xs text-[#6e6e73]">
                            {item.unitDetail || `${item.quantity} ${item.unit}`} · {item.category}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`font-display font-mono-num font-bold text-base shrink-0 ${
                          isOutlier ? 'text-[#c81e1e]' : 'text-[#1d1d1f]'
                        }`}
                      >
                        ₦{item.price.toLocaleString()}
                      </span>
                    </div>

                    {item.annotationType === 'history' && (
                      <div className="flex items-center gap-1.5 text-xs text-[#00567c] mt-2.5 pl-[52px]">
                        <span className="material-symbols-outlined text-[15px]">history</span>
                        <span>{item.annotationText || 'Previous purchase available'}</span>
                      </div>
                    )}

                    {item.annotationType === 'community' && (
                      <div className="flex items-center gap-1.5 text-xs text-[#00567c] mt-2.5 pl-[52px] font-medium">
                        <span className="material-symbols-outlined text-[15px]">group</span>
                        <span>{item.annotationText || 'Shoppers near you logged similar prices'}</span>
                      </div>
                    )}

                    {item.annotationType === 'unsure' && (
                      <div className="flex items-center gap-1.5 text-xs text-[#48484a] mt-2.5 pl-[52px] font-medium">
                        <span className="material-symbols-outlined text-[15px]">
                          psychology_alt
                        </span>
                        <span>
                          {item.annotationText || 'Not sure about this price — tap to confirm.'}
                        </span>
                      </div>
                    )}

                    {item.annotationType === 'outlier' && (
                      <div className="flex items-center gap-1.5 text-xs text-[#c81e1e] mt-2.5 pl-[52px] font-semibold">
                        <span className="material-symbols-outlined text-[15px]">warning</span>
                        <span>
                          {item.annotationText || 'Looks high for today — double-check the zeros'}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleAddNewItem}
                className="w-full min-h-[46px] flex items-center justify-center gap-2 py-3 border border-dashed border-black/15 rounded-2xl text-[#00567c] font-semibold text-xs hover:bg-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add Another Item (e.g. Fresh Ugwu)</span>
              </button>
            </section>
          </div>

          {/* Right Sticky Desktop Summary */}
          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-20">
            <div className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
              <div>
                <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wider">
                  Total Spent
                </span>
                <div className="font-display font-mono-num text-3xl font-extrabold text-[#1d1d1f] mt-1">
                  ₦{totalSpend.toLocaleString()}
                </div>
                <p className="text-xs text-[#6e6e73] mt-0.5 font-mono-num">
                  {stagingItems.length} items · {stagingMarket}
                </p>
              </div>

              {flaggedCount > 0 && (
                <div className="p-3.5 rounded-xl bg-[#fffbeb] border border-[#b45309]/20 text-xs text-[#92400e] flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                    info
                  </span>
                  <span>
                    {flaggedCount} {flaggedCount === 1 ? 'item needs' : 'items need'} a quick look.
                    Tap any highlighted row to confirm.
                  </span>
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                <button
                  id="log-confirm-save-trip-desktop-btn"
                  type="button"
                  onClick={handleSaveTrip}
                  className="w-full min-h-[48px] bg-[#00567c] text-white font-semibold py-3 rounded-xl hover:bg-[#004361] transition-colors flex items-center justify-center gap-2 text-sm shadow-xs"
                >
                  <span>Save Market Run</span>
                  <span className="material-symbols-outlined text-[19px]">check</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('log-pending')}
                  className="w-full min-h-[42px] py-2.5 bg-[#f5f5f7] text-[#48484a] font-semibold rounded-xl text-xs hover:bg-[#ebebf0] transition-colors"
                >
                  Preview Pending Item State
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky Save Container */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-surface border-t border-black/[0.08] p-4 pb-safe z-40 shadow-lg">
        <div className="max-w-lg mx-auto flex gap-2.5">
          <button
            type="button"
            onClick={() => navigateTo('log-pending')}
            className="min-h-[48px] px-4 py-3 bg-[#f2f2f7] text-[#48484a] font-semibold rounded-xl text-xs hover:bg-[#e5e5ea] whitespace-nowrap"
          >
            Pending
          </button>

          <button
            id="log-confirm-save-trip-btn"
            type="button"
            onClick={handleSaveTrip}
            className="flex-1 min-h-[48px] bg-[#00567c] text-white font-semibold py-3 rounded-xl hover:bg-[#004361] transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <span>Save · ₦{totalSpend.toLocaleString()}</span>
            <span className="material-symbols-outlined text-[19px]">check</span>
          </button>
        </div>
      </div>

      {/* AdaptiveSheet Quick Edit Modal with Accounting NairaInput */}
      <AdaptiveSheet
        open={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title={editingItem ? editingItem.name : 'Edit Item'}
        subtitle="Adjust quantity, price, or food category"
        maxWidthClass="md:max-w-sm"
      >
        {editingItem && (
          <form onSubmit={handleSaveItemEdit} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f5f7]">
              <FoodIconBadge name={editingItem.name} category={editCategory} size="md" />
              <div className="min-w-0">
                <div className="font-semibold text-sm text-[#1d1d1f] truncate">
                  {editingItem.name}
                </div>
                <div className="text-xs text-[#6e6e73]">{editCategory}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#48484a] mb-1">
                  Quantity ({editingItem.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  value={editQty}
                  onChange={(e) => setEditQty(e.target.value)}
                  className="w-full border border-black/[0.09] bg-[#f5f5f7] rounded-xl px-3.5 py-2.5 text-sm font-mono-num focus:bg-white focus:border-[#00567c] focus:ring-2 focus:ring-[#00567c]/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48484a] mb-1">
                  Price Paid (₦)
                </label>
                <NairaInput
                  value={editPrice}
                  onChange={setEditPrice}
                  placeholder="0"
                  size="md"
                  ariaLabel="Price paid in Naira"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48484a] mb-1">
                  Food Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as ItemCategory)}
                  className="w-full border border-black/[0.09] bg-[#f5f5f7] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#1d1d1f] focus:bg-white focus:border-[#00567c] outline-none"
                >
                  {(Object.keys(CATEGORY_REGISTRY) as ItemCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_REGISTRY[cat].icon} {cat} — {CATEGORY_REGISTRY[cat].shortLabel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 min-h-[44px] py-2.5 bg-[#f2f2f7] text-[#48484a] font-semibold text-xs rounded-xl hover:bg-[#e5e5ea] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 min-h-[44px] py-2.5 bg-[#00567c] text-white font-semibold text-xs rounded-xl hover:bg-[#004361] transition-colors"
              >
                Update Item
              </button>
            </div>
          </form>
        )}
      </AdaptiveSheet>
    </div>
  );
};
