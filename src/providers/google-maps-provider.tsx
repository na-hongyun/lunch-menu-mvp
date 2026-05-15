"use client";

import { MAPS_UI_LANGUAGE, MAPS_UI_REGION } from "@/lib/constants";
import { sanitizeAsciiApiKey } from "@/lib/env/sanitize-api-key";
import { APIProvider } from "@vis.gl/react-google-maps";
import type { ReactNode } from "react";

/**
 * Maps JavaScript API ローダー。ブラウザ用キーが無いときは子だけ描画する。
 */
export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const apiKey = sanitizeAsciiApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "");

  if (!apiKey) {
    return <>{children}</>;
  }

  return (
    <APIProvider apiKey={apiKey} language={MAPS_UI_LANGUAGE} region={MAPS_UI_REGION}>
      {children}
    </APIProvider>
  );
}
