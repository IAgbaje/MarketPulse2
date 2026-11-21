import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  LiveMarketPlace,
  checkAndEmitQuotaError,
  extractLiveMarketPlace,
} from '../../lib/googleMaps';

// Modern Places API (New) Autocomplete using AutocompleteSuggestion + AutocompleteSessionToken
// Docs: https://developers.google.com/maps/documentation/javascript/place-autocomplete-data?utm_campaign=gmp_mcp_codeassist_v1_aistudio

interface MarketPlacesAutocompleteProps {
  regionName: string;
  onPlaceSelected: (
    place: LiveMarketPlace,
    viewport?: google.maps.LatLngBounds | null
  ) => void;
}

export const MarketPlacesAutocomplete: React.FC<MarketPlacesAutocompleteProps> = ({
  regionName,
  onPlaceSelected,
}) => {
  const placesLib = useMapsLibrary('places');

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = null;
    setSuggestions([]);
    setIsOpen(false);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Places API (New) AutocompleteSuggestion request with session token reuse
  useEffect(() => {
    if (!placesLib) return;

    const trimmed = inputValue.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }

        setIsLoading(true);
        const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['ng'],
          language: 'en',
        });

        if (!cancelled) {
          setSuggestions(res?.suggestions ?? []);
          setIsOpen(true);
        }
      } catch (err) {
        if (!cancelled) {
          checkAndEmitQuotaError(err);
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 240);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [placesLib, inputValue]);

  const handleSelectSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!placesLib || !suggestion.placePrediction) return;

      try {
        setIsFetchingDetails(true);
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'viewport',
            'rating',
            'userRatingCount',
            'regularOpeningHours',
            'googleMapsURI',
            'primaryTypeDisplayName',
          ],
        });

        const extracted = extractLiveMarketPlace(place);
        if (extracted) {
          setInputValue(extracted.name);
          onPlaceSelected(extracted, place.viewport ?? null);
        }
        // Reset session token immediately after completing the place detail fetch
        resetSession();
      } catch (err) {
        checkAndEmitQuotaError(err);
      } finally {
        setIsFetchingDetails(false);
      }
    },
    [placesLib, onPlaceSelected, resetSession]
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <span
          className="material-symbols-outlined text-[18px] text-[#6e6e73] absolute left-3.5 pointer-events-none"
          aria-hidden="true"
        >
          search
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={`Search any market or supermarket in ${regionName} or Nigeria...`}
          aria-label="Search Nigerian markets with Google Places"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-autocomplete="list"
          className="w-full min-h-[44px] pl-10 pr-10 py-2.5 bg-white rounded-xl border border-black/[0.1] text-sm text-[#1d1d1f] placeholder:text-[#8e8e93] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#00567c]/30 focus:border-[#00567c] transition-all"
        />
        {(isLoading || isFetchingDetails) ? (
          <span
            className="w-4 h-4 rounded-full border-2 border-[#00567c]/25 border-t-[#00567c] animate-spin absolute right-3.5"
            aria-label="Searching places"
          />
        ) : inputValue.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              resetSession();
            }}
            aria-label="Clear market search"
            className="absolute right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-[#6e6e73] hover:bg-black/[0.05] hover:text-[#1d1d1f] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        ) : null}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl border border-black/[0.08] shadow-lg overflow-hidden z-30 divide-y divide-black/[0.05]"
        >
          {suggestions.map((suggestion, index) => {
            const mainText =
              suggestion.placePrediction?.mainText?.text ||
              suggestion.placePrediction?.text?.text ||
              '';
            const secondaryText =
              suggestion.placePrediction?.secondaryText?.text || '';
            const key = suggestion.placePrediction?.placeId || `sug-${index}`;

            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => void handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-[#f5f5f7] transition-colors flex items-start gap-3"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#00567c] mt-0.5 shrink-0">
                    location_on
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#1d1d1f] truncate">
                      {mainText}
                    </span>
                    {secondaryText && (
                      <span className="block text-xs text-[#6e6e73] truncate mt-0.5">
                        {secondaryText}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
          <li className="px-4 py-2 bg-[#f5f5f7]/70 flex items-center justify-end">
            <span className="text-[10px] font-medium text-[#8e8e93]">
              Powered by Google Places
            </span>
          </li>
        </ul>
      )}
    </div>
  );
};
