import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { useMarketPulse } from '../../context/MarketPulseContext';
import {
  GMP_ATTRIBUTION_ID,
  GMP_MAP_ID,
  GOOGLE_MAPS_API_KEY,
  LiveMarketPlace,
  NIGERIA_DEFAULT_CENTER,
  RouteSummaryInfo,
  buildGoogleMapsDirectionsUrl,
  checkAndEmitQuotaError,
  extractLiveMarketPlace,
  formatDistanceKm,
  formatDurationMins,
  getTodayHoursLine,
} from '../../lib/googleMaps';
import {
  MARKET_TYPE_LABELS,
  NigerianMarketEntry,
  getMarketsByState,
} from '../../data/nigerianMarketsRegistry';
import { AdaptiveSheet } from '../ui/AdaptiveSheet';
import { MarketPlacesAutocomplete } from './MarketPlacesAutocomplete';
import { MarketRouteLayer } from './MarketRouteLayer';

// Interactive Nigerian Market Locator powered by Maps JS API, Places API (New), Advanced Markers, and Routes API
// Docs: https://developers.google.com/maps/documentation/javascript/overview?utm_campaign=gmp_mcp_codeassist_v1_aistudio

type MarketCategoryFilter = 'food-markets' | 'supermarkets' | 'produce';

const CATEGORY_FILTERS: {
  id: MarketCategoryFilter;
  label: string;
  queryPrefix: string;
  icon: string;
}[] = [
  {
    id: 'food-markets',
    label: 'Food Markets',
    queryPrefix: 'open food market',
    icon: 'storefront',
  },
  {
    id: 'supermarkets',
    label: 'Supermarkets',
    queryPrefix: 'grocery supermarket',
    icon: 'shopping_cart',
  },
  {
    id: 'produce',
    label: 'Fresh Produce',
    queryPrefix: 'fresh produce fruit vegetable market',
    icon: 'eco',
  },
];

interface LiveMarketGoogleMapProps {
  watchlistMarkets: string[];
  onToggleWatchlist: (marketName: string) => void;
  onLogAtMarket: (marketName?: string) => void;
}

interface MarketMarkerPinProps {
  market: LiveMarketPlace;
  isSelected: boolean;
  isWatchlisted: boolean;
  onSelect: (market: LiveMarketPlace) => void;
  onCloseInfoWindow: () => void;
  onGetDirections: (market: LiveMarketPlace) => void;
  onLogAtMarket: (marketName: string) => void;
  onToggleWatchlist: (marketName: string) => void;
}

const MarketMarkerPin: React.FC<MarketMarkerPinProps> = ({
  market,
  isSelected,
  isWatchlisted,
  onSelect,
  onCloseInfoWindow,
  onGetDirections,
  onLogAtMarket,
  onToggleWatchlist,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const todayHours = getTodayHoursLine(market.weekdayDescriptions);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={market.location}
        title={market.name}
        zIndex={isSelected ? 20 : 1}
        onClick={() => onSelect(market)}
      >
        <Pin
          background={isSelected ? '#15803d' : '#00567c'}
          borderColor={isSelected ? '#0f5132' : '#003e5a'}
          glyphColor="#ffffff"
          scale={isSelected ? 1.25 : 1.0}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={290}
          onCloseClick={onCloseInfoWindow}
        >
          <div className="p-1 text-[#1d1d1f] space-y-2.5 font-sans">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display font-bold text-sm text-[#1d1d1f] leading-snug">
                  {market.name}
                </h4>
              </div>
              {market.primaryTypeDisplayName && (
                <div className="text-[11px] font-medium text-[#00567c] mt-0.5">
                  {market.primaryTypeDisplayName}
                </div>
              )}
              <p className="text-xs text-[#6e6e73] mt-1 leading-snug">
                {market.address}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {typeof market.rating === 'number' && (
                <span className="inline-flex items-center gap-1 font-semibold text-[#1d1d1f]">
                  <span className="text-amber-500">★</span>
                  <span>{market.rating.toFixed(1)}</span>
                  {typeof market.userRatingCount === 'number' && (
                    <span className="text-[#6e6e73] font-normal">
                      ({market.userRatingCount.toLocaleString()})
                    </span>
                  )}
                </span>
              )}
              {todayHours && (
                <span className="text-[11px] text-[#6e6e73] truncate max-w-[230px]">
                  {todayHours}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onGetDirections(market)}
                className="px-2.5 py-2 rounded-lg bg-[#00567c] text-white text-xs font-semibold hover:bg-[#003e5a] transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">directions</span>
                <span>Directions</span>
              </button>
              <button
                type="button"
                onClick={() => onLogAtMarket(market.name)}
                className="px-2.5 py-2 rounded-lg bg-[#eef6fb] text-[#00567c] text-xs font-semibold hover:bg-[#d4e8f7] transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">add_shopping_cart</span>
                <span>Log Run</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-black/[0.06] text-[11px]">
              <button
                type="button"
                onClick={() => onToggleWatchlist(market.name)}
                className="font-semibold text-[#00567c] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isWatchlisted ? 'bookmark_added' : 'bookmark_add'}
                </span>
                <span>{isWatchlisted ? 'Saved to Watchlist' : 'Watch Market'}</span>
              </button>
              {market.googleMapsURI && (
                <a
                  href={market.googleMapsURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#6e6e73] hover:text-[#1d1d1f] underline"
                >
                  Google Maps ↗
                </a>
              )}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

interface LiveMarketMapContentProps extends LiveMarketGoogleMapProps {}

const LiveMarketMapContent: React.FC<LiveMarketMapContentProps> = ({
  watchlistMarkets,
  onToggleWatchlist,
  onLogAtMarket,
}) => {
  const { activeRegion } = useMarketPulse();
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const apiStatus = useApiLoadingStatus();

  const [category, setCategory] = useState<MarketCategoryFilter>('food-markets');
  const [markets, setMarkets] = useState<LiveMarketPlace[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<LiveMarketPlace | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [locatingDirectoryId, setLocatingDirectoryId] = useState<string | null>(null);

  // Explicit user-initiated location & routing state
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const [routeTarget, setRouteTarget] = useState<LiveMarketPlace | null>(null);
  const [travelMode, setTravelMode] = useState<'DRIVING' | 'WALKING'>('DRIVING');
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeSummary, setRouteSummary] = useState<RouteSummaryInfo | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Confirmation prompt when user clicks Directions
  const [directionsConfirmTarget, setDirectionsConfirmTarget] =
    useState<LiveMarketPlace | null>(null);

  const activeCategoryMeta = useMemo(
    () => CATEGORY_FILTERS.find((c) => c.id === category) || CATEGORY_FILTERS[0],
    [category]
  );

  // Imported directory markets for the active state (quick-lookup via live Places API New)
  const stateDirectoryMarkets = useMemo(
    () => getMarketsByState(activeRegion.id),
    [activeRegion.id]
  );

  // Discover real Nigerian markets via Places API (New) Text Search whenever active state or category changes
  useEffect(() => {
    if (
      !placesLib ||
      apiStatus === APILoadingStatus.FAILED ||
      apiStatus === APILoadingStatus.AUTH_FAILURE
    ) {
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    setSearchError(null);
    setRouteTarget(null);
    setRouteSummary(null);
    setRouteError(null);
    setDirectionsConfirmTarget(null);

    const query = `${activeCategoryMeta.queryPrefix} in ${activeRegion.name}, Nigeria`;

    placesLib.Place.searchByText({
      textQuery: query,
      fields: [
        'id',
        'displayName',
        'formattedAddress',
        'location',
        'rating',
        'userRatingCount',
        'regularOpeningHours',
        'googleMapsURI',
        'primaryTypeDisplayName',
      ],
      maxResultCount: 12,
      language: 'en',
      region: 'NG',
    })
      .then((response) => {
        if (cancelled) return;
        const found = (response?.places ?? [])
          .map((p) => extractLiveMarketPlace(p))
          .filter((item): item is LiveMarketPlace => item !== null);

        setMarkets(found);
        setSelectedMarket(found[0] ?? null);

        if (
          map &&
          found.length > 0 &&
          typeof google !== 'undefined' &&
          google.maps?.LatLngBounds
        ) {
          const bounds = new google.maps.LatLngBounds();
          found.forEach((m) => bounds.extend(m.location));
          map.fitBounds(bounds, { top: 44, right: 44, bottom: 44, left: 44 });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const wasQuota = checkAndEmitQuotaError(err);
        setSearchError(
          wasQuota
            ? 'Google Maps Platform daily quota reached for live market search.'
            : `We could not load live ${activeCategoryMeta.label.toLowerCase()} in ${activeRegion.name} right now.`
        );
        setMarkets([]);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [placesLib, apiStatus, activeRegion.id, activeRegion.name, activeCategoryMeta, map]);

  // Resolve a pre-imported Nigerian directory market using live Places API (New)
  const handleLocateDirectoryMarket = useCallback(
    async (entry: NigerianMarketEntry) => {
      if (!placesLib) return;
      setLocatingDirectoryId(entry.id);
      setSearchError(null);

      try {
        const res = await placesLib.Place.searchByText({
          textQuery: `${entry.name}, ${entry.city}, ${entry.stateName}, Nigeria`,
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
          maxResultCount: 1,
          language: 'en',
          region: 'NG',
        });

        const firstPlace = res?.places?.[0];
        const extracted = firstPlace ? extractLiveMarketPlace(firstPlace) : null;

        if (extracted) {
          setMarkets((prev) => {
            const exists = prev.some((m) => m.id === extracted.id);
            return exists ? prev : [extracted, ...prev];
          });
          setSelectedMarket(extracted);
          setRouteTarget(null);
          setRouteSummary(null);
          setRouteError(null);

          if (map) {
            if (firstPlace?.viewport) {
              map.fitBounds(firstPlace.viewport);
            } else {
              map.panTo(extracted.location);
              map.setZoom(15);
            }
          }
        }
      } catch (err) {
        checkAndEmitQuotaError(err);
      } finally {
        setLocatingDirectoryId(null);
      }
    },
    [placesLib, map]
  );

  // Handle selection from Places API (New) Autocomplete bar
  const handleAutocompleteSelect = useCallback(
    (place: LiveMarketPlace, viewport?: google.maps.LatLngBounds | null) => {
      setMarkets((prev) => {
        const exists = prev.some((m) => m.id === place.id);
        return exists ? prev : [place, ...prev];
      });
      setSelectedMarket(place);
      setRouteTarget(null);
      setRouteSummary(null);
      setRouteError(null);

      if (map) {
        if (viewport) {
          map.fitBounds(viewport);
        } else {
          map.panTo(place.location);
          map.setZoom(15);
        }
      }
    },
    [map]
  );

  // Explicit user-click Geolocation request (never triggered silently on load)
  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationNotice('Location access is not supported in this browser.');
      return;
    }

    setIsLocatingUser(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: google.maps.LatLngLiteral = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setIsLocatingUser(false);
        if (map) {
          map.panTo(coords);
          map.setZoom(13);
        }
      },
      () => {
        setIsLocatingUser(false);
        setLocationNotice(
          `Location permission was declined. Directions will start from ${activeRegion.name} centre instead.`
        );
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, [map, activeRegion.name]);

  const handleSelectMarketFromList = useCallback(
    (market: LiveMarketPlace) => {
      setSelectedMarket(market);
      if (map) {
        map.panTo(market.location);
        const currentZoom = map.getZoom();
        if (!currentZoom || currentZoom < 13) {
          map.setZoom(14);
        }
      }
    },
    [map]
  );

  // When user clicks Directions: compute live route AND automatically ask to confirm opening Google Maps
  const handleStartDirections = useCallback((market: LiveMarketPlace) => {
    setSelectedMarket(market);
    setRouteTarget(market);
    setDirectionsConfirmTarget(market);
  }, []);

  const routeOrigin = useMemo<google.maps.LatLngLiteral | string | null>(() => {
    if (!routeTarget) return null;
    if (userLocation) return userLocation;
    return `${activeRegion.name}, Nigeria`;
  }, [routeTarget, userLocation, activeRegion.name]);

  const externalDirectionsUrl = useMemo(() => {
    const target = directionsConfirmTarget || routeTarget;
    if (!target) return '#';
    return buildGoogleMapsDirectionsUrl(target, travelMode, userLocation);
  }, [directionsConfirmTarget, routeTarget, travelMode, userLocation]);

  if (apiStatus === APILoadingStatus.FAILED || apiStatus === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="bg-white rounded-2xl border border-black/[0.08] p-8 text-center space-y-3">
        <span className="material-symbols-outlined text-4xl text-amber-600">
          map_search
        </span>
        <h3 className="font-display text-lg font-bold text-[#1d1d1f]">
          Google Maps could not load right now
        </h3>
        <p className="text-sm text-[#6e6e73] max-w-md mx-auto">
          Please check your internet connection or API key permissions. You can switch to the{' '}
          <span className="font-semibold text-[#1d1d1f]">State Price Grid</span> above at any
          time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Category Filter Controls + Imported State Markets Quick-Jump */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-2xs p-4 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1 min-w-0">
            <MarketPlacesAutocomplete
              regionName={activeRegion.name}
              onPlaceSelected={handleAutocompleteSelect}
            />
          </div>

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocatingUser}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 border ${
              userLocation
                ? 'bg-[#ecfdf5] text-[#15803d] border-[#15803d]/30'
                : 'bg-[#f5f5f7] text-[#1d1d1f] border-black/[0.08] hover:bg-[#e5e5ea]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {userLocation ? 'my_location' : 'location_searching'}
            </span>
            <span>
              {isLocatingUser
                ? 'Finding you...'
                : userLocation
                ? 'Using My Location'
                : 'Use My Location'}
            </span>
          </button>
        </div>

        {/* Category Pills + State Context */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((item) => {
              const active = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? 'bg-[#00567c] text-white shadow-2xs'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e5e5ea]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-[#6e6e73] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#15803d] inline-block" />
            <span>
              Live Google Places in{' '}
              <strong className="text-[#1d1d1f]">{activeRegion.name}</strong>
            </span>
          </div>
        </div>

        {/* Pre-Imported Major Markets & Supermarkets in Active State */}
        {stateDirectoryMarkets.length > 0 && (
          <div className="pt-2.5 border-t border-black/[0.05] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6e6e73]">
                Major Food Markets &amp; Supermarkets in {activeRegion.name} ({stateDirectoryMarkets.length})
              </span>
              <span className="text-[11px] text-[#86868b] hidden sm:inline">
                Tap any market to locate it live on Google Maps
              </span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {stateDirectoryMarkets.map((entry) => {
                const meta = MARKET_TYPE_LABELS[entry.type];
                const isLocating = locatingDirectoryId === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    disabled={isLocating}
                    onClick={() => void handleLocateDirectoryMarket(entry)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#eef6fb] hover:text-[#00567c] border border-black/[0.06] text-xs font-medium text-[#1d1d1f] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px] text-[#00567c]">
                      {isLocating ? 'progress_activity' : meta.icon}
                    </span>
                    <span>{entry.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {locationNotice && (
          <p className="text-xs text-[#6e6e73] bg-[#f5f5f7] px-3 py-2 rounded-lg">
            {locationNotice}
          </p>
        )}
      </div>

      {/* Main Split View: Live Google Map + Discovered Markets Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Google Map Canvas (Explicit CSS height prevents 0x0 collapse - CF2) */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden relative">
          <div className="w-full h-[440px] sm:h-[520px] relative">
            <GoogleMap
              mapId={GMP_MAP_ID}
              defaultCenter={NIGERIA_DEFAULT_CENTER}
              defaultZoom={6}
              gestureHandling="greedy"
              streetViewControl={false}
              mapTypeControl={false}
              fullscreenControl={true}
              internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
              className="w-full h-full"
            >
              {markets.map((market) => (
                <MarketMarkerPin
                  key={market.id}
                  market={market}
                  isSelected={selectedMarket?.id === market.id}
                  isWatchlisted={watchlistMarkets.includes(market.name)}
                  onSelect={setSelectedMarket}
                  onCloseInfoWindow={() => setSelectedMarket(null)}
                  onGetDirections={handleStartDirections}
                  onLogAtMarket={(name) => onLogAtMarket(name)}
                  onToggleWatchlist={onToggleWatchlist}
                />
              ))}

              {/* Optional user GPS pin after explicit consent */}
              {userLocation && (
                <AdvancedMarker position={userLocation} title="Your current location" zIndex={30}>
                  <div className="w-4 h-4 rounded-full bg-[#007aff] border-2 border-white shadow-md ring-4 ring-[#007aff]/25" />
                </AdvancedMarker>
              )}

              {/* Live Routes API polyline overlay */}
              <MarketRouteLayer
                origin={routeOrigin}
                destination={routeTarget?.location ?? null}
                travelMode={travelMode}
                onRouteLoadingChange={setRouteLoading}
                onRouteCalculated={setRouteSummary}
                onRouteError={setRouteError}
              />
            </GoogleMap>

            {/* Floating Route Summary Card when directions are active */}
            {routeTarget && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-black/[0.08] shadow-lg p-3.5 z-20 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#00567c]">
                      Route to Market
                    </div>
                    <div className="font-display font-bold text-sm text-[#1d1d1f] truncate">
                      {routeTarget.name}
                    </div>
                    <div className="text-[11px] text-[#6e6e73] truncate">
                      From: {userLocation ? 'Your current location' : `${activeRegion.name} centre`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRouteTarget(null);
                      setRouteSummary(null);
                      setRouteError(null);
                    }}
                    aria-label="Clear route"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#6e6e73] hover:bg-black/[0.06] shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                {/* Travel Mode Switcher */}
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex bg-[#f2f2f7] p-0.5 rounded-lg border border-black/[0.05]">
                    {(['DRIVING', 'WALKING'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTravelMode(mode)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                          travelMode === mode
                            ? 'bg-white text-[#00567c] shadow-2xs'
                            : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {mode === 'DRIVING' ? 'directions_car' : 'directions_walk'}
                        </span>
                        <span>{mode === 'DRIVING' ? 'Drive' : 'Walk'}</span>
                      </button>
                    ))}
                  </div>

                  {routeLoading ? (
                    <span className="text-xs text-[#6e6e73] font-medium">
                      Calculating route...
                    </span>
                  ) : routeSummary ? (
                    <div className="text-right font-mono-num">
                      <span className="text-sm font-extrabold text-[#00567c]">
                        {formatDurationMins(routeSummary.durationMillis)}
                      </span>
                      <span className="text-xs text-[#6e6e73] ml-1.5">
                        ({formatDistanceKm(routeSummary.distanceMeters)})
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="pt-1 border-t border-black/[0.06] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectionsConfirmTarget(routeTarget)}
                    className="text-xs font-semibold text-[#00567c] hover:underline inline-flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                    <span>Open turn-by-turn in Google Maps</span>
                  </button>
                </div>

                {routeError && (
                  <p className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                    {routeError}
                  </p>
                )}
              </div>
            )}

            {/* Subtle loading overlay when switching states */}
            {isSearching && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full border border-black/[0.08] shadow-md flex items-center gap-2 z-20">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-[#00567c]/25 border-t-[#00567c] animate-spin" />
                <span className="text-xs font-semibold text-[#1d1d1f]">
                  Finding {activeCategoryMeta.label.toLowerCase()} in {activeRegion.name}...
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Live Discovered Markets List */}
        <aside className="lg:col-span-4 bg-white rounded-2xl border border-black/[0.06] shadow-2xs overflow-hidden flex flex-col max-h-[520px]">
          <div className="px-4 py-3.5 border-b border-black/[0.06] flex items-center justify-between gap-2 shrink-0">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm text-[#1d1d1f] truncate">
                {activeRegion.name} · {activeCategoryMeta.label}
              </h3>
              <p className="text-[11px] text-[#6e6e73]">
                {isSearching
                  ? 'Loading real locations...'
                  : `${markets.length} verified places found`}
              </p>
            </div>
            <span className="material-symbols-outlined text-[#00567c] text-[20px] shrink-0">
              pin_drop
            </span>
          </div>

          <div className="overflow-y-auto divide-y divide-black/[0.05] flex-1">
            {searchError ? (
              <div className="p-5 text-center space-y-2">
                <span className="material-symbols-outlined text-2xl text-amber-600">
                  info
                </span>
                <p className="text-xs text-[#6e6e73] leading-relaxed">{searchError}</p>
              </div>
            ) : !isSearching && markets.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <span className="material-symbols-outlined text-2xl text-[#8e8e93]">
                  search_off
                </span>
                <p className="text-xs text-[#6e6e73]">
                  No places matched this filter in {activeRegion.name}. Try tapping a market
                  chip or searching above.
                </p>
              </div>
            ) : (
              markets.map((market) => {
                const isSelected = selectedMarket?.id === market.id;
                const isWatchlisted = watchlistMarkets.includes(market.name);
                return (
                  <div
                    key={market.id}
                    className={`p-3.5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#eef6fb]' : 'hover:bg-[#f5f5f7]'
                    }`}
                    onClick={() => handleSelectMarketFromList(market)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm text-[#1d1d1f] leading-snug truncate">
                          {market.name}
                        </h4>
                        <p className="text-xs text-[#6e6e73] mt-0.5 line-clamp-2 leading-snug">
                          {market.address}
                        </p>
                      </div>
                      {typeof market.rating === 'number' && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold shrink-0">
                          <span>★</span>
                          <span>{market.rating.toFixed(1)}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartDirections(market);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-black/[0.08] text-[#1d1d1f] hover:border-[#00567c] hover:text-[#00567c] text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">directions</span>
                        <span>Directions</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLogAtMarket(market.name);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[#00567c] text-white hover:bg-[#003e5a] text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          add_shopping_cart
                        </span>
                        <span>Record Run</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(market.name);
                        }}
                        aria-label={
                          isWatchlisted
                            ? `Remove ${market.name} from watchlist`
                            : `Watch ${market.name}`
                        }
                        className={`ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isWatchlisted
                            ? 'bg-[#ecfdf5] text-[#15803d]'
                            : 'text-[#6e6e73] hover:bg-black/[0.05]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isWatchlisted ? 'bookmark_added' : 'bookmark_add'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>

      {/* Automatic Confirmation Dialog when user clicks Directions */}
      <AdaptiveSheet
        open={Boolean(directionsConfirmTarget)}
        onClose={() => setDirectionsConfirmTarget(null)}
        title="Open Google Maps?"
        subtitle="Confirm if you want turn-by-turn navigation in Google Maps"
        maxWidthClass="md:max-w-md"
      >
        {directionsConfirmTarget && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] space-y-1.5">
              <div className="flex items-start gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#00567c] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">directions</span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-sm text-[#1d1d1f] leading-snug">
                    {directionsConfirmTarget.name}
                  </div>
                  <p className="text-xs text-[#6e6e73] mt-0.5 leading-snug">
                    {directionsConfirmTarget.address}
                  </p>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-black/[0.06] flex items-center justify-between gap-2">
                <div className="inline-flex bg-white p-0.5 rounded-lg border border-black/[0.06]">
                  {(['DRIVING', 'WALKING'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTravelMode(mode)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                        travelMode === mode
                          ? 'bg-[#00567c] text-white'
                          : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {mode === 'DRIVING' ? 'directions_car' : 'directions_walk'}
                      </span>
                      <span>{mode === 'DRIVING' ? 'Drive' : 'Walk'}</span>
                    </button>
                  ))}
                </div>

                {routeLoading ? (
                  <span className="text-xs text-[#6e6e73]">Estimating...</span>
                ) : routeSummary ? (
                  <span className="text-xs font-mono-num font-bold text-[#00567c]">
                    {formatDurationMins(routeSummary.durationMillis)} ·{' '}
                    {formatDistanceKm(routeSummary.distanceMeters)}
                  </span>
                ) : null}
              </div>
            </div>

            <p className="text-xs text-[#6e6e73] leading-relaxed">
              Would you like to open Google Maps for live turn-by-turn directions, or stay here
              to view the route preview inside MarketPulse?
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDirectionsConfirmTarget(null)}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#f2f2f7] text-[#1d1d1f] font-semibold text-xs hover:bg-[#e5e5ea] transition-colors"
              >
                Stay in MarketPulse
              </button>
              <a
                href={externalDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDirectionsConfirmTarget(null)}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#00567c] text-white font-semibold text-xs hover:bg-[#003e5a] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Open Google Maps</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>
          </div>
        )}
      </AdaptiveSheet>
    </div>
  );
};

export const LiveMarketGoogleMap: React.FC<LiveMarketGoogleMapProps> = (props) => {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-white rounded-2xl border border-black/[0.08] p-8 text-center space-y-3">
        <span className="material-symbols-outlined text-4xl text-[#00567c]">
          public
        </span>
        <h3 className="font-display text-lg font-bold text-[#1d1d1f]">
          Google Maps API key not configured
        </h3>
        <p className="text-sm text-[#6e6e73] max-w-md mx-auto">
          Add <code className="font-mono text-xs bg-[#f5f5f7] px-1.5 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
          to your environment to enable interactive market search and live driving directions.
        </p>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      language="en"
      region="NG"
      libraries={['places', 'marker', 'routes']}
    >
      <LiveMarketMapContent {...props} />
    </APIProvider>
  );
};
