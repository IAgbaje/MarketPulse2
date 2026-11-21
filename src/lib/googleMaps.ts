// Google Maps Platform configuration & Places API (New) helpers for MarketPulse
// Docs: https://developers.google.com/maps/documentation/javascript/overview?utm_campaign=gmp_mcp_codeassist_v1_aistudio

export const GOOGLE_MAPS_API_KEY: string = (
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
).trim();

/** Required AI Studio usage attribution ID */
export const GMP_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';

/** Map ID required for rendering AdvancedMarkerElement */
export const GMP_MAP_ID = 'DEMO_MAP_ID';

/** Neutral country-level fallback center before live Places results load and fit bounds */
export const NIGERIA_DEFAULT_CENTER: google.maps.LatLngLiteral = {
  lat: 9.082,
  lng: 8.6753,
};

export interface LiveMarketPlace {
  id: string;
  name: string;
  address: string;
  location: google.maps.LatLngLiteral;
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: string;
  weekdayDescriptions?: string[];
  googleMapsURI?: string;
}

export interface RouteSummaryInfo {
  distanceMeters: number;
  durationMillis: number;
  travelMode: 'DRIVING' | 'WALKING';
}

/**
 * Tier-2 Quota Defense (Demo Key):
 * Checks errors from Places API (New) and Routes API for quota exhaustion
 * without triggering false positives on empty results or generic network issues.
 */
export function checkAndEmitQuotaError(err: unknown): boolean {
  if (!err) return false;

  const status =
    typeof err === 'object' && err !== null && 'status' in err
      ? String((err as { status?: unknown }).status)
      : '';
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code)
      : '';
  const message =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
      ? String((err as { message?: unknown }).message)
      : String(err);

  const combined = `${status} ${code} ${message}`;
  const isQuotaError =
    combined.includes('RESOURCE_EXHAUSTED') ||
    combined.includes('OVER_QUERY_LIMIT') ||
    combined.includes('OverQuotaMapError') ||
    combined.includes('QuotaExceededError') ||
    code === '429' ||
    status === '429';

  if (isQuotaError) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }

  return isQuotaError;
}

/**
 * Normalizes a google.maps.LatLng or LatLngLiteral into a plain POJO { lat, lng }.
 */
export function toLatLngLiteral(
  loc: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined
): google.maps.LatLngLiteral | null {
  if (!loc) return null;
  if (typeof (loc as google.maps.LatLng).lat === 'function') {
    const gLoc = loc as google.maps.LatLng;
    return { lat: gLoc.lat(), lng: gLoc.lng() };
  }
  const literal = loc as google.maps.LatLngLiteral;
  if (typeof literal.lat === 'number' && typeof literal.lng === 'number') {
    return { lat: literal.lat, lng: literal.lng };
  }
  return null;
}

/**
 * Extracts live, Google-sourced fields from a Places API (New) Place instance.
 */
export function extractLiveMarketPlace(
  place: google.maps.places.Place
): LiveMarketPlace | null {
  const location = toLatLngLiteral(place.location);
  if (!location) return null;

  const rawName = place.displayName;
  const name =
    typeof rawName === 'string' && rawName.trim().length > 0
      ? rawName.trim()
      : 'Unnamed Market';

  const id = place.id || `${name}-${location.lat.toFixed(5)}-${location.lng.toFixed(5)}`;

  return {
    id,
    name,
    address: place.formattedAddress || 'Nigeria',
    location,
    rating: typeof place.rating === 'number' ? place.rating : undefined,
    userRatingCount:
      typeof place.userRatingCount === 'number' ? place.userRatingCount : undefined,
    primaryTypeDisplayName: place.primaryTypeDisplayName || undefined,
    weekdayDescriptions: place.regularOpeningHours?.weekdayDescriptions || undefined,
    googleMapsURI: place.googleMapsURI || undefined,
  };
}

/**
 * Returns today's opening hours line from Google Places weekdayDescriptions if available.
 */
export function getTodayHoursLine(weekdayDescriptions?: string[]): string | null {
  if (!weekdayDescriptions || weekdayDescriptions.length === 0) return null;
  // weekdayDescriptions is typically Monday (0) .. Sunday (6)
  const jsDay = new Date().getDay(); // 0 = Sun, 1 = Mon ...
  const googleIdx = jsDay === 0 ? 6 : jsDay - 1;
  return weekdayDescriptions[googleIdx] || weekdayDescriptions[0] || null;
}

export function formatDistanceKm(distanceMeters: number): string {
  if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) return '—';
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

export function formatDurationMins(durationMillis: number): string {
  if (!Number.isFinite(durationMillis) || durationMillis <= 0) return '—';
  const totalMins = Math.max(1, Math.round(durationMillis / 60000));
  if (totalMins < 60) return `${totalMins} min`;
  const hrs = Math.floor(totalMins / 60);
  const rem = totalMins % 60;
  return rem > 0 ? `${hrs} hr ${rem} min` : `${hrs} hr`;
}

/**
 * Builds an official Google Maps turn-by-turn directions URL for external launch.
 * Docs: https://developers.google.com/maps/documentation/urls/get-started?utm_campaign=gmp_mcp_codeassist_v1_aistudio
 */
export function buildGoogleMapsDirectionsUrl(
  market: LiveMarketPlace,
  travelMode: 'DRIVING' | 'WALKING' = 'DRIVING',
  origin?: google.maps.LatLngLiteral | null
): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${market.location.lat},${market.location.lng}`,
    travelmode: travelMode.toLowerCase(),
  });

  if (market.id && !market.id.includes('-')) {
    params.set('destination_place_id', market.id);
  }

  if (origin) {
    params.set('origin', `${origin.lat},${origin.lng}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
