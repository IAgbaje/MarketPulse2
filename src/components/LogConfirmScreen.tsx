import React, { useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { TripItem } from '../types';
import { INITIAL_MARKETS } from '../data/initialData';

export const LogConfirmScreen: React.FC = () => {
  const {
    stagingItems,
    setStagingItems,
    stagingMarket,
    setStagingMarket,
    stagingDate,
    setStagingDate,
    availableMarkets,
    saveStagingTrip,
    navigateTo,
    goBack,
    setPendingRawInput,
  } = useMarketPulse();

  const [isEditingMarket, setIsEditingMarket] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);

  // Edit item state
  const [editingItem, setEditingItem] = useState<TripItem | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editQty, setEditQty] = useState<string>('');

  const handleStartEdit = (item: TripItem) => {
    // If it's a new or unsure item, user might also want to inspect pending review flow
    if (item.name.toLowerCase().includes('mayonnaise') || item.annotationType === 'unsure') {
      setPendingRawInput(`${item.name} - ${stagingMarket}`);
    }
    setEditingItem(item);
    setEditPrice(item.price.toString());
    setEditQty(item.quantity.toString());
  };

  const handleSaveItemEdit = () => {
    if (!editingItem) return;
    const newPrice = parseInt(editPrice.replace(/[^0-9]/g, ''), 10) || editingItem.price;
    const newQty = parseFloat(editQty) || editingItem.quantity;

    setStagingItems((prev) =>
      prev.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              price: newPrice,
              quantity: newQty,
              unitDetail: `${newQty} ${i.unit}`,
              annotationType: 'none', // cleared once verified
            }
          : i
      )
    );
    setEditingItem(null);
  };

  const handleAddNewItem = () => {
    const newItem: TripItem = {
      id: `stg-new-${Date.now()}`,
      name: 'Fresh Ugwu Leaves',
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
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-20 pb-36 px-4 md:px-6 max-w-md mx-auto w-full overflow-x-hidden">
      {/* Header Editable Info */}
      <section className="flex flex-col gap-2 mb-4">
        <h2 className="text-xs font-bold text-[#40484e] uppercase tracking-wider">
          Confirm Receipt
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Location Button / Selector */}
          <div className="p-3 bg-[#f2f3f7] rounded-xl flex flex-col items-start border border-[#c0c7cf]/30 min-w-0">
            <span className="text-[11px] text-[#71787f] font-semibold mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#00567c]">
                storefront
              </span>
              Location <span className="material-symbols-outlined text-[13px]">edit</span>
            </span>
            {isEditingMarket ? (
              <select
                value={stagingMarket}
                onChange={(e) => {
                  setStagingMarket(e.target.value);
                  setIsEditingMarket(false);
                }}
                className="w-full min-w-0 bg-white text-xs font-bold text-[#191c1f] p-1.5 rounded-lg border border-[#c0c7cf] truncate"
                autoFocus
              >
                {(availableMarkets.length > 0 ? availableMarkets : INITIAL_MARKETS).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={() => setIsEditingMarket(true)}
                className="font-bold text-sm text-[#191c1f] text-left hover:text-[#00567c] truncate w-full"
              >
                {stagingMarket}
              </button>
            )}
          </div>

          {/* Date Button / Input */}
          <div className="p-3 bg-[#f2f3f7] rounded-xl flex flex-col items-start border border-[#c0c7cf]/30 min-w-0">
            <span className="text-[11px] text-[#71787f] font-semibold mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#00567c]">
                calendar_today
              </span>
              Date <span className="material-symbols-outlined text-[13px]">edit</span>
            </span>
            {isEditingDate ? (
              <input
                type="text"
                value={stagingDate}
                onChange={(e) => setStagingDate(e.target.value)}
                onBlur={() => setIsEditingDate(false)}
                className="w-full min-w-0 bg-white text-xs font-bold text-[#191c1f] p-1.5 rounded-lg border border-[#c0c7cf]"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingDate(true)}
                className="font-bold text-sm text-[#191c1f] text-left hover:text-[#00567c] truncate w-full"
              >
                {stagingDate}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-[#40484e] mt-1 leading-relaxed">
          Review items carefully before saving. Tap any item or price to correct it.
        </p>
      </section>

      {/* Items List with Contextual Annotations */}
      <section className="flex flex-col gap-2.5 mb-4">
        {stagingItems.map((item) => {
          const isOutlier = item.annotationType === 'outlier';
          const isUnsure = item.annotationType === 'unsure';

          return (
            <div
              key={item.id}
              onClick={() => handleStartEdit(item)}
              className={`flex flex-col p-4 rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.99] border ${
                isOutlier
                  ? 'bg-[#ffdad6]/20 border-[#ba1a1a]/40'
                  : isUnsure
                  ? 'bg-[#e1e2e6]/40 border-[#c0c7cf] border-dashed'
                  : 'bg-white border-[#c0c7cf]/40'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex flex-col pr-2">
                  <span className="text-left font-semibold text-[#191c1f] text-base flex items-center gap-1.5">
                    {item.name}
                    <span className="material-symbols-outlined text-xs text-[#71787f]">
                      edit
                    </span>
                  </span>
                  <span className="text-xs text-[#40484e]">
                    {item.unitDetail || `${item.quantity} ${item.unit}`}
                  </span>
                </div>

                <div
                  className={`px-3 py-1 rounded-md text-right shrink-0 ${
                    isOutlier
                      ? 'bg-[#ffdad6] text-[#ba1a1a] font-bold border border-[#ba1a1a]/30'
                      : 'bg-[#f2f3f7] text-[#191c1f] font-bold'
                  }`}
                >
                  <span className="text-base tabular-nums">
                    ₦{item.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Annotation Badges */}
              {item.annotationType === 'history' && (
                <div className="flex items-center gap-1 text-[11px] text-[#4b6172] bg-[#cbe3f7]/30 px-2 py-0.5 rounded-md w-fit mt-1">
                  <span className="material-symbols-outlined text-[13px]">history</span>
                  <span>{item.annotationText || 'Previous purchase available'}</span>
                </div>
              )}

              {item.annotationType === 'community' && (
                <div className="flex items-center gap-1 text-[11px] text-[#00567c] bg-[#cbe3f7]/40 px-2 py-0.5 rounded-md w-fit mt-1 font-medium">
                  <span className="material-symbols-outlined text-[13px]">group</span>
                  <span>{item.annotationText || 'Community reports available'}</span>
                </div>
              )}

              {item.annotationType === 'unsure' && (
                <div className="flex items-center gap-1 text-[11px] text-[#40484e] bg-[#e1e2e6] px-2 py-0.5 rounded-md w-fit mt-1 font-medium">
                  <span className="material-symbols-outlined text-[13px]">psychology_alt</span>
                  <span>{item.annotationText || 'Unsure if this is correct. Tap to verify.'}</span>
                </div>
              )}

              {item.annotationType === 'outlier' && (
                <div className="flex items-center gap-1 text-[11px] text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-md w-fit mt-1 font-semibold">
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  <span>{item.annotationText || 'Check this: unusually high for today'}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Add another item button */}
        <button
          onClick={handleAddNewItem}
          className="flex items-center justify-center gap-2 py-3.5 mt-1 border-2 border-dashed border-[#c0c7cf] rounded-xl text-[#00567c] font-semibold text-sm hover:bg-[#f2f3f7] active:scale-[0.98] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add another item</span>
        </button>
      </section>

      {/* Save Action Sticky Container */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f8f9fd] border-t border-[#c0c7cf]/40 p-4 z-40 shadow-md">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={() => navigateTo('log-pending')}
            className="px-4 py-3.5 bg-[#eceef1] text-[#40484e] font-semibold rounded-xl text-xs hover:bg-[#e1e2e6]"
            title="Preview pending review status"
          >
            Pending state
          </button>

          <button
            id="log-confirm-save-trip-btn"
            onClick={handleSaveTrip}
            className="flex-1 bg-[#00567c] text-white font-bold py-3.5 rounded-xl shadow-xs hover:bg-[#2a6f97] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
          >
            <span>Save & Log Trip</span>
            <span className="material-symbols-outlined text-[20px]">check</span>
          </button>
        </div>
      </div>

      {/* Quick Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl border border-[#c0c7cf]/40 space-y-4">
            <h3 className="font-bold text-base text-[#191c1f]">
              Edit: {editingItem.name}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#40484e] mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={editQty}
                  onChange={(e) => setEditQty(e.target.value)}
                  className="w-full border border-[#c0c7cf] rounded-lg p-2 text-sm tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#40484e] mb-1">
                  Price (₦)
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full border border-[#c0c7cf] rounded-lg p-2 text-sm tabular-nums font-bold text-[#00567c]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-2.5 bg-[#eceef1] text-[#40484e] font-semibold text-xs rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItemEdit}
                className="flex-1 py-2.5 bg-[#00567c] text-white font-bold text-xs rounded-lg hover:bg-[#2a6f97]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
