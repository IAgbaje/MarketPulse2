import React, { useEffect, useRef } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { RouteSummaryInfo, checkAndEmitQuotaError } from '../../lib/googleMaps';

// Modern Routes API integration using useMapsLibrary('routes') -> Route.computeRoutes()
// Docs: https://developers.google.com/maps/documentation/javascript/routes?utm_campaign=gmp_mcp_codeassist_v1_aistudio

interface MarketRouteLayerProps {
  origin: google.maps.LatLngLiteral | string | null;
  destination: google.maps.LatLngLiteral | null;
  travelMode: 'DRIVING' | 'WALKING';
  onRouteLoadingChange: (loading: boolean) => void;
  onRouteCalculated: (summary: RouteSummaryInfo | null) => void;
  onRouteError: (message: string | null) => void;
}

export const MarketRouteLayer: React.FC<MarketRouteLayerProps> = ({
  origin,
  destination,
  travelMode,
  onRouteLoadingChange,
  onRouteCalculated,
  onRouteError,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    // Clear any previously rendered route polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!routesLib || !map || !origin || !destination) {
      onRouteCalculated(null);
      onRouteError(null);
      onRouteLoadingChange(false);
      return;
    }

    let cancelled = false;
    onRouteError(null);
    onRouteLoadingChange(true);

    const request = {
      origin,
      destination,
      travelMode,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
    };

    // Route.computeRoutes is the modern JS SDK wrapper for Routes API (avoids CORS & legacy DirectionsService)
    const RouteClass = (
      routesLib as unknown as {
        Route?: {
          computeRoutes: (req: typeof request) => Promise<{
            routes?: Array<{
              distanceMeters?: number;
              durationMillis?: number;
              viewport?: google.maps.LatLngBounds;
              createPolylines: () => google.maps.Polyline[];
            }>;
          }>;
        };
      }
    ).Route;

    if (!RouteClass || typeof RouteClass.computeRoutes !== 'function') {
      onRouteLoadingChange(false);
      onRouteError('Route calculation is not ready yet. Please try again.');
      return;
    }

    RouteClass.computeRoutes(request)
      .then((response) => {
        if (cancelled) return;
        onRouteLoadingChange(false);

        const primaryRoute = response?.routes?.[0];
        if (!primaryRoute) {
          onRouteCalculated(null);
          onRouteError('No direct route could be calculated for this market.');
          return;
        }

        const newPolylines = primaryRoute.createPolylines();
        newPolylines.forEach((polyline) => {
          polyline.setOptions({
            strokeColor: '#00567c',
            strokeOpacity: 0.92,
            strokeWeight: 5,
          });
          polyline.setMap(map);
        });
        polylinesRef.current = newPolylines;

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, {
            top: 48,
            right: 48,
            bottom: 48,
            left: 48,
          });
        }

        onRouteCalculated({
          distanceMeters: primaryRoute.distanceMeters ?? 0,
          durationMillis: primaryRoute.durationMillis ?? 0,
          travelMode,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        onRouteLoadingChange(false);
        const wasQuota = checkAndEmitQuotaError(err);
        onRouteCalculated(null);
        onRouteError(
          wasQuota
            ? 'Google Maps route quota reached. You can still open directions directly in Google Maps.'
            : 'Could not calculate route right now. Try opening directions in Google Maps.'
        );
      });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [
    routesLib,
    map,
    origin,
    destination,
    travelMode,
    onRouteCalculated,
    onRouteError,
    onRouteLoadingChange,
  ]);

  return null;
};
