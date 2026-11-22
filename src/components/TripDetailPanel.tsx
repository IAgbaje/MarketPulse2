import React, { useState, useEffect } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { Trip, TripItem } from '../types';
import { FoodIconBadge } from './ui/FoodIconBadge';
import { NairaInput } from './ui/NairaInput';
import { CalendarPicker } from './ui/CalendarPicker';

interface TripDetailPanelProps {
  trip: Trip;
  onDeleted?: () => void;
}

export const TripDetailPanel: React.FC<TripDetailPanelProps> = ({ trip, onDeleted }) => {
  const { deleteTrip, updateTrip, selectCommodityById } = useMarketPulse();
  const [isEditing, setIsEditing] = useState(false);
  const [items, setItems] = useState<TripItem[]>(trip.items || []);
  const [tripDate, setTripDate] = useState(trip.date);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setItems(trip.items || []);
    setTripDate(trip.date);
    setIsEditing(false);
    setIsConfirmingDelete(false);
  }, [trip]);

  const currentTotal = items.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const handleRemoveItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    updateTrip(trip.id, { items: updated });
  };

  const handlePriceChange = (id: string, newPrice: number | '') => {
    const numPrice = typeof newPrice === 'number' ? newPrice : 0;
    const updated = items.map((i) => (i.id === id ? { ...i, price: numPrice } : i));
    setItems(updated);
    updateTrip(trip.id, { items: updated });
  };

  const handleDateChange = (formatted: string, iso: string) => {
    setTripDate(formatted);
    updateTrip(trip.id, { date: formatted, rawDate: iso });
  };

  const handleDeleteEntireTrip = () => {
    deleteTrip(trip.id);
    setIsConfirmingDelete(false);
    onDeleted?.();
  };

  const openCommodityIfMatched = (itemName: string) => {
    const lower = itemName.toLowerCase();
    if (lower.includes('tomato')) selectCommodityById('tomatoes-fresh');
    else if (lower.includes('rice')) selectCommodityById('rice-50kg');
    else if (lower.includes('bean')) selectCommodityById('beans-oloyin');
    else if (lower.includes('garri')) selectCommodityById('garri-white');
    else if (lower.includes('palm oil') || lower.includes('red oil')) selectCommodityById('palm-oil-5l');
    else if (lower.includes('veg') || lower.includes('groundnut oil') || lower.includes('oil')) selectCommodityById('veg-oil-5l');
    else if (lower.includes('egg')) selectCommodityById('eggs-crate');
    else if (lower.includes('beef') || lower.includes('meat')) selectCommodityById('beef-1kg');
    else if (lower.includes('chicken')) selectCommodityById('chicken-frozen-1kg');
    else if (lower.includes('fish') || lower.includes('titus') || lower.includes('mackerel')) selectCommodityById('fish-titus-1kg');
    else if (lower.includes('maize') || lower.includes('corn')) selectCommodityById('maize-paint');
    else if (lower.includes('yam')) selectCommodityById('yam-tuber');
    else if (lower.includes('onion')) selectCommodityById('onions-dry');
    else if (lower.includes('bread')) selectCommodityById('bread-sliced');
    else if (lower.includes('plantain')) selectCommodityById('plantain-bunch');
    else if (lower.includes('mango')) selectCommodityById('mango-basket');
  };

  return (
    <div className="space-y-5">
      {/* Header Info Card */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-black/[0.06] shadow-2xs">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-xl sm:text-2xl text-[#1d1d1f] leading-snug">
              {trip.market}
            </h1>
            <div className="text-xs sm:text-sm text-[#6e6e73] mt-1 flex flex-wrap items-center gap-1.5">
              <span>{tripDate}</span>
              <span aria-hidden="true">·</span>
              <span>
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#00567c]">
                  {trip.syncStatus === 'synced' ? 'cloud_done' : 'phone_iphone'}
                </span>
                <span>
                  {trip.syncStatus === 'synced' ? 'Backed up online' : 'Saved on this device'}
                </span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 min-h-[40px] ${
              isEditing
                ? 'bg-[#00567c] text-white'
                : 'bg-[#f2f2f7] text-[#1d1d1f] hover:bg-[#e5e5ea]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">
              {isEditing ? 'check' : 'edit'}
            </span>
            <span>{isEditing ? 'Done' : 'Edit receipt'}</span>
          </button>
        </div>

        {/* Inline Calendar Picker when editing */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t border-black/[0.06] max-w-xs">
            <CalendarPicker
              id="trip-detail-date-picker"
              label="Market Day"
              value={tripDate}
              onChange={handleDateChange}
              compact
            />
          </div>
        )}

        {/* Summary Metrics Strip */}
        <div className="mt-5 pt-4 border-t border-black/[0.06] flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-[#6e6e73]">Total spent</div>
            <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#1d1d1f] tabular-nums mt-0.5">
              ₦{currentTotal.toLocaleString('en-NG')}
            </div>
          </div>
          {trip.pctChange !== undefined && trip.pctChange > 0 && (
            <div
              className={`text-xs font-semibold flex items-center gap-1 font-mono-num ${
                trip.isPositiveChange ? 'text-[#b91c1c]' : 'text-[#15803d]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {trip.isPositiveChange ? 'arrow_upward' : 'arrow_downward'}
              </span>
              <span>{trip.pctChange}% vs last time</span>
            </div>
          )}
        </div>
      </section>

      {/* Items Bought List */}
      <section className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-sm font-bold text-[#1d1d1f]">What you bought</h2>
          <span className="text-xs text-[#6e6e73]">
            Tap tracked items to check their price trend
          </span>
        </div>

        {items.length > 0 ? (
          <div className="divide-y divide-black/[0.05]">
            {items.map((item) => {
              const isTracked =
                item.name.toLowerCase().includes('tomato') ||
                item.name.toLowerCase().includes('rice') ||
                item.name.toLowerCase().includes('oil');

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-[#f5f5f7]/70 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => openCommodityIfMatched(item.name)}
                    disabled={!isTracked}
                    className={`flex items-center gap-3 text-left min-w-0 flex-1 ${
                      isTracked ? 'cursor-pointer group' : 'cursor-default'
                    }`}
                  >
                    <FoodIconBadge name={item.name} category={item.category} size="sm" />
                    <div className="min-w-0">
                      <span
                        className={`font-semibold text-sm sm:text-[15px] text-[#1d1d1f] flex items-center gap-1.5 ${
                          isTracked ? 'group-hover:text-[#00567c]' : ''
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        {isTracked && (
                          <span className="material-symbols-outlined text-[15px] text-[#00567c] shrink-0">
                            trending_up
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-[#6e6e73] mt-0.5 block truncate">
                        {item.unitDetail || `${item.quantity} ${item.unit}`} · {item.category}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-32 sm:w-36">
                          <NairaInput
                            value={item.price}
                            onChange={(val) => handlePriceChange(item.id, val)}
                            size="sm"
                            align="right"
                            ariaLabel={`Price for ${item.name}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                          className="min-w-[36px] min-h-[36px] rounded-xl text-[#b91c1c] hover:bg-red-50 flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="font-mono-num font-bold text-sm sm:text-base text-[#1d1d1f]">
                          ₦{item.price.toLocaleString('en-NG')}
                        </div>
                        {item.previousPrice && item.previousPrice !== item.price && (
                          <div
                            className={`text-[11px] font-mono-num font-medium ${
                              item.price > item.previousPrice ? 'text-[#b91c1c]' : 'text-[#15803d]'
                            }`}
                          >
                            {item.price > item.previousPrice ? '+' : '-'}₦
                            {Math.abs(item.price - item.previousPrice).toLocaleString('en-NG')} vs
                            prev
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[#6e6e73]">
            No items left on this receipt.
          </div>
        )}
      </section>

      {/* Delete Action (Reversible via Undo Toast) */}
      <div className="pt-1">
        {isConfirmingDelete ? (
          <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#b91c1c]">Remove this market trip?</p>
              <p className="text-xs text-[#6e6e73]">
                You can bring it right back using the Undo button if you change your mind.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-3.5 py-2 rounded-xl bg-white border border-black/[0.08] text-xs font-semibold text-[#1d1d1f] hover:bg-[#f2f2f7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEntireTrip}
                className="px-3.5 py-2 rounded-xl bg-[#b91c1c] text-white text-xs font-semibold hover:bg-red-800"
              >
                Remove trip
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="text-xs font-semibold text-[#b91c1c] hover:bg-red-50 px-3 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">delete_outline</span>
            <span>Remove trip</span>
          </button>
        )}
      </div>
    </div>
  );
};
