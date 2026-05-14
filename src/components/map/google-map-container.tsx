"use client";

import { RestaurantInfoWindowContent } from "@/components/map/restaurant-info-window-content";
import { useRestaurantMapExplorer } from "@/contexts/restaurant-map-explorer-context";
import { useSavedRestaurants } from "@/contexts/saved-restaurants-context";
import type { GeoCoordinates, Restaurant } from "@/lib/restaurants/types";
import { cn } from "@/lib/utils";
import {
  AdvancedMarker,
  ColorScheme,
  InfoWindow,
  Map,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { Loader2, MapPin } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface GoogleMapContainerProps {
  /** null のときは地図を描かず現在地取得 UI を表示 */
  baseCenter: GeoCoordinates | null;
  /** 既定ズーム（選択なし時の視点） */
  defaultZoom?: number;
  className?: string;
}

function MapExploreCameraRig({
  userCenter,
  selectedId,
  markers,
}: {
  userCenter: { lat: number; lng: number };
  selectedId: string | null;
  markers: Restaurant[];
}) {
  const map = useMap();

  const markerFitSignature = useMemo(
    () =>
      markers
        .map(
          (r) =>
            `${r.id}:${r.coordinates.latitude.toFixed(5)},${r.coordinates.longitude.toFixed(5)}`,
        )
        .join("|"),
    [markers],
  );

  useEffect(() => {
    if (!map) return;

    if (selectedId) {
      const hit = markers.find((r) => r.id === selectedId);
      if (hit) {
        map.panTo({ lat: hit.coordinates.latitude, lng: hit.coordinates.longitude });
      }
      return;
    }

    if (markers.length === 0) {
      map.panTo(userCenter);
      return;
    }

    if (markers.length === 1) {
      const r = markers[0]!;
      map.panTo({ lat: r.coordinates.latitude, lng: r.coordinates.longitude });
      return;
    }

    const gm = (globalThis as unknown as { google?: typeof google }).google?.maps;
    if (gm?.LatLngBounds) {
      const bounds = new gm.LatLngBounds();
      bounds.extend(userCenter);
      for (const r of markers.slice(0, 20)) {
        bounds.extend({ lat: r.coordinates.latitude, lng: r.coordinates.longitude });
      }
      map.fitBounds(bounds, { top: 52, right: 44, bottom: 44, left: 44 } as google.maps.Padding);
      return;
    }

    map.panTo(userCenter);
  }, [map, userCenter.lat, userCenter.lng, selectedId, markerFitSignature]);

  return null;
}

function restaurantMarkerPin(
  active: boolean,
  saved: boolean,
): { background: string; borderColor: string; glyphColor: string; scale: number } {
  if (active) {
    return {
      background: "#38bdf8",
      borderColor: "#ffffff",
      glyphColor: "#0f172a",
      scale: 1.1,
    };
  }
  if (saved) {
    return {
      background: "#34d399",
      borderColor: "#ffffff",
      glyphColor: "#0f172a",
      scale: 1.02,
    };
  }
  return {
    background: "#64748b",
    borderColor: "#ffffff",
    glyphColor: "#f8fafc",
    scale: 0.95,
  };
}

/**
 * Google Maps とリスト選択コンテキストの連携。
 * ルートに `GoogleMapsProvider` が必要。
 */
export function GoogleMapContainer({
  baseCenter,
  defaultZoom = 15,
  className,
}: GoogleMapContainerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const { restaurants, selectedRestaurantId, selectRestaurant } =
    useRestaurantMapExplorer();
  const { addSavedRestaurant, isSaved } = useSavedRestaurants();

  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "DEMO_MAP_ID";

  const markerRefMap = useRef<
    globalThis.Map<string, google.maps.marker.AdvancedMarkerElement>
  >(
    new globalThis.Map(),
  );
  const selectedIdRef = useRef<string | null>(selectedRestaurantId);

  useLayoutEffect(() => {
    selectedIdRef.current = selectedRestaurantId;
  }, [selectedRestaurantId]);

  const [anchorMarker, setAnchorMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  const registerMarker = useCallback(
    (id: string, instance: google.maps.marker.AdvancedMarkerElement | null) => {
      const mapRef = markerRefMap.current;
      if (instance) mapRef.set(id, instance);
      else mapRef.delete(id);

      if (selectedIdRef.current === id) {
        setAnchorMarker(instance);
      }
    },
    [],
  );

  /* eslint-disable react-hooks/set-state-in-effect -- Maps Marker は imperative。選択 ID と既存 Marker をレイアウト後に同期 */
  useLayoutEffect(() => {
    if (!selectedRestaurantId) {
      setAnchorMarker(null);
      return;
    }
    setAnchorMarker(markerRefMap.current.get(selectedRestaurantId) ?? null);
  }, [selectedRestaurantId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectedRestaurant = useMemo(
    () =>
      selectedRestaurantId
        ? restaurants.find((r) => r.id === selectedRestaurantId)
        : undefined,
    [restaurants, selectedRestaurantId],
  );

  const initialCenter = useMemo(() => {
    if (!baseCenter) return null;
    return { lat: baseCenter.latitude, lng: baseCenter.longitude };
  }, [baseCenter]);

  const mapMarkers = useMemo(
    () =>
      restaurants.filter(
        (r) =>
          Number.isFinite(r.coordinates.latitude) && Number.isFinite(r.coordinates.longitude),
      ),
    [restaurants],
  );

  const dismissInfo = useCallback(() => {
    selectRestaurant(null);
  }, [selectRestaurant]);

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/15 bg-card/50 p-10 text-center text-sm text-muted-foreground backdrop-blur-[16px]",
          className,
        )}
      >
        <MapPin className="size-8 opacity-60" aria-hidden />
        <p className="max-w-xs leading-relaxed">
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>
          를 .env.local 에 넣으면 Google 지도가 표시됩니다.
        </p>
      </div>
    );
  }

  if (!baseCenter || !initialCenter) {
    return (
      <div
        className={cn(
          "flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/15 bg-card/45 p-10 text-center text-sm text-muted-foreground backdrop-blur-[16px]",
          className,
        )}
      >
        <Loader2
          className="size-10 animate-spin text-primary"
          aria-hidden
        />
        <p className="text-base font-bold text-foreground">현재 위치를 확인하는 중…</p>
        <p className="max-w-sm text-sm leading-relaxed">
          브라우저에서 위치를 허용하면 더 정확해요. 거부하면 네트워크 기준 대략 위치로 전환됩니다.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-[280px] flex-1 overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_28px_80px_-40px_oklch(0_0_0/0.65)] ring-1 ring-white/5",
        className,
      )}
    >
      <Map
        className="size-full min-h-[280px]"
        defaultCenter={initialCenter}
        defaultZoom={defaultZoom}
        mapId={mapId}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        colorScheme={ColorScheme.LIGHT}
      >
        <MapExploreCameraRig
          userCenter={initialCenter}
          selectedId={selectedRestaurantId}
          markers={mapMarkers}
        />

        {mapMarkers.map((r) => {
          const selected = r.id === selectedRestaurantId;
          const saved = isSaved(r.id);
          return (
            <AdvancedMarker
              key={r.id}
              ref={(instance) => registerMarker(r.id, instance)}
              position={{
                lat: r.coordinates.latitude,
                lng: r.coordinates.longitude,
              }}
              title={r.name}
              onClick={() => selectRestaurant(r.id)}
              zIndex={selected ? 50 : saved ? 40 : 10}
            >
              <Pin {...restaurantMarkerPin(selected, saved)} />
            </AdvancedMarker>
          );
        })}

        {selectedRestaurant && anchorMarker ? (
          <InfoWindow
            anchor={anchorMarker}
            headerDisabled
            maxWidth={400}
            shouldFocus={false}
            onClose={dismissInfo}
            onCloseClick={dismissInfo}
          >
            <RestaurantInfoWindowContent
              restaurant={selectedRestaurant}
              onClose={dismissInfo}
              onAddToList={() => addSavedRestaurant(selectedRestaurant)}
              isAlreadySaved={isSaved(selectedRestaurant.id)}
            />
          </InfoWindow>
        ) : null}
      </Map>
    </div>
  );
}
