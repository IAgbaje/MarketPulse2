import React, { useState } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { TripItem } from '../types';

export const TripDetailScreen: React.FC = () => {
  const { selectedTrip, goBack, deleteTrip, updateTrip, navigateTo, selectCommodityById } = useMarketPulse();
  const [isEditing, setIsEditing] = useState(false);
  const [items, setItems] = useState<TripItem[]>(selectedTrip?.items || []);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!selectedTrip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <p className="text-[#40484e] mb-4">No trip selected.</p>
        <button
          onClick={() => navigateTo('history')}
          className="bg-[#00567c] text-white px-5 py-2.5 rounded-full font-medium"
        >
          View all trips
        </button>
      </div>
    );
  }

  const currentTotal = items.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const handleRemoveItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    updateTrip(selectedTrip.id, { items: updated });
  };

  const handlePriceChange = (id: string, newPrice: number) => {
    const updated = items.map((i) => (i.id === id ? { ...i, price: newPrice } : i));
    setItems(updated);
    updateTrip(selectedTrip.id, { items: updated });
  };

  const handleDeleteEntireTrip = () => {
    deleteTrip(selectedTrip.id);
    navigateTo('history');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-20 pb-32 px-4 md:px-6 max-w-md mx-auto w-full">
      <button
        onClick={goBack}
        className="flex items-center text-[#40484e] hover:text-[#00567c] transition-colors text-xs font-semibold mb-3 w-fit"
      >
        <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
        Back to Trips
      </button>

      {/* Header Info Card */}
      <section className="bg-white rounded-2xl p-5 shadow-xs border border-[#c0c7cf]/30 flex flex-col gap-3 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-bold text-2xl text-[#191c1f] mb-0.5">
              {selectedTrip.market}
            </h1>
            <p className="text-[#40484e] text-[15px]">{selectedTrip.date}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-[#00567c] hover:bg-[#e7e8ec] rounded-full transition-colors active:scale-95"
            title="Toggle Edit Mode"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isEditing ? 'check' : 'edit'}
            </span>
          </button>
        </div>

        {/* Ambient Sync Status */}
        <div className="flex items-center gap-2 text-[13px] text-[#40484e] bg-[#eceef1] rounded-lg px-3 py-2 w-fit">
          <span className="material-symbols-outlined text-[16px] animate-pulse text-[#71787f]">
            {selectedTrip.syncStatus === 'synced' ? 'cloud_done' : 'cloud_off'}
          </span>
          <span>
            {selectedTrip.syncStatus === 'synced'
              ? 'Backed up to cloud'
              : 'Saved on this device, will sync when online'}
          </span>
        </div>
      </section>

      {/* Items List Bento Style */}
      <section className="flex flex-col gap-2.5 mb-6">
        <div className="flex justify-between items-center pl-1">
          <h2 className="font-semibold text-sm text-[#40484e] uppercase tracking-wider">
            Items bought
          </h2>
          <span className="text-xs text-[#71787f]">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-[#c0c7cf]/30 overflow-hidden divide-y divide-[#e1e2e6]/70">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-4 hover:bg-[#f2f3f7] transition-colors"
            >
              <div
                className="flex flex-col gap-0.5 cursor-pointer"
                onClick={() => {
                  if (item.name.toLowerCase().includes('tomato')) {
                    selectCommodityById('tomatoes-fresh');
                  } else if (item.name.toLowerCase().includes('rice')) {
                    selectCommodityById('rice-50kg');
                  } else if (item.name.toLowerCase().includes('oil')) {
                    selectCommodityById('palm-oil-25l');
                  }
                }}
              >
                <span className="font-semibold text-[#191c1f] text-[16px] hover:text-[#00567c] flex items-center gap-1.5">
                  {item.name}
                  <span className="material-symbols-outlined text-[14px] text-[#71787f]">
                    trending_up
                  </span>
                </span>
                <span className="text-[#40484e] text-xs">
                  {item.unitDetail || `${item.quantity} ${item.unit}`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#71787f]">₦</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                        className="w-24 pl-6 pr-2 py-1 text-sm font-bold bg-[#f8f9fd] border border-[#c0c7cf] rounded-md tabular-nums text-right"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-md"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ) : (
                  <div className="font-bold text-lg text-[#191c1f] tabular-nums">
                    ₦{item.price.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary Total Card */}
      <section className="mb-6">
        <div className="bg-[#00567c] text-white rounded-2xl p-5 shadow-xs flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#d7ecff] mb-0.5">
              Total Spent
            </span>
            <span className="text-[#d7ecff]/80 text-xs">
              {items.length} items
            </span>
          </div>
          <div className="font-extrabold text-3xl tabular-nums tracking-tight">
            ₦{currentTotal.toLocaleString()}
          </div>
        </div>
      </section>

      {/* Danger Zone Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={() => navigateTo('log-choice')}
          className="w-full py-3 bg-[#e7e8ec] text-[#00567c] font-semibold rounded-xl hover:bg-[#cbe3f7] transition-colors active:scale-98 text-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add more items to this trip
        </button>

        {isConfirmingDelete ? (
          <div className="p-3 bg-[#ffdad6]/40 border border-[#ba1a1a]/40 rounded-xl flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#ba1a1a]">Delete this trip?</span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3 py-1.5 bg-white text-xs font-semibold text-[#40484e] rounded-lg border border-[#c0c7cf]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEntireTrip}
                className="px-3 py-1.5 bg-[#ba1a1a] text-xs font-bold text-white rounded-lg hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsConfirmingDelete(true)}
            className="w-full py-2.5 text-[#ba1a1a] text-xs font-semibold hover:bg-[#ffdad6]/30 rounded-xl transition-colors"
          >
            Delete this trip record
          </button>
        )}
      </div>
    </div>
  );
};
