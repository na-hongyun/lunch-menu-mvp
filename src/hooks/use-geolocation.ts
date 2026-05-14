"use client";

import type { GeoCoordinates } from "@/lib/restaurants/types";
import { useEffect, useState } from "react";

export type GeolocationStatus =
  | "pending"
  | "ok"
  /** ブラウザ GPS 失敗後に IP 推定などで取れた位置 */
  | "approximate"
  | "unsupported"
  | "denied";

export interface UseGeolocationResult {
  /**
   * 地図・検索の基準座標。
   * 確定前は null（フォールバックを早期に使わず誤表示を防ぐ）。
   */
  coords: GeoCoordinates | null;
  status: GeolocationStatus;
  /** ブラウザまたはサーバー補助で得た座標（無ければ null） */
  preciseCoords: GeoCoordinates | null;
}

const IP_GEO_TIMEOUT_MS = 12_000;
/** GPS タイムアウト（12s）＋ IP 取得の余裕 */
const LOCATION_WATCHDOG_MS = 14_000;

async function fetchGoogleIpGeolocation(): Promise<GeoCoordinates | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), IP_GEO_TIMEOUT_MS);

  try {
    const res = await fetch("/api/geolocation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: controller.signal,
    });

    const payload = (await res.json().catch(() => ({}))) as {
      latitude?: number;
      longitude?: number;
      message?: string;
    };

    if (
      !res.ok ||
      typeof payload.latitude !== "number" ||
      typeof payload.longitude !== "number"
    ) {
      return null;
    }

    return {
      latitude: payload.latitude,
      longitude: payload.longitude,
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function useGeolocation(fallback: GeoCoordinates): UseGeolocationResult {
  const [status, setStatus] = useState<GeolocationStatus>("pending");
  const [preciseCoords, setPreciseCoords] = useState<GeoCoordinates | null>(null);

  useEffect(() => {
    let cancelled = false;

    const watchdogId = window.setTimeout(() => {
      if (cancelled) return;
      setStatus((prev) => (prev === "pending" ? "denied" : prev));
    }, LOCATION_WATCHDOG_MS);

    async function tryIpApproximation(): Promise<void> {
      const coords = await fetchGoogleIpGeolocation();
      if (cancelled) return;
      if (coords) {
        setPreciseCoords(coords);
        setStatus("approximate");
      } else {
        setStatus("denied");
      }
    }

    const kickoffId = window.setTimeout(() => {
      try {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          void tryIpApproximation();
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            setPreciseCoords({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
            setStatus("ok");
          },
          () => {
            if (cancelled) return;
            void tryIpApproximation();
          },
          { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 },
        );
      } catch {
        if (cancelled) return;
        void tryIpApproximation();
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(kickoffId);
      window.clearTimeout(watchdogId);
    };
  }, []);

  const coords: GeoCoordinates | null =
    status === "denied"
      ? fallback
      : status === "ok" || status === "approximate"
        ? preciseCoords
        : null;

  return { coords, preciseCoords, status };
}
