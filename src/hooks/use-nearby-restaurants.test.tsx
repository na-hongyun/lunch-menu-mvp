import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { useNearbyRestaurants } from "./use-nearby-restaurants";
import { server } from "@/test/msw/server";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useNearbyRestaurants", () => {
  it("resolves restaurant rows when the nearby API succeeds", async () => {
    const { result } = renderHook(
      () =>
        useNearbyRestaurants(
          "和食 蕎麦 かけそば ランチ レストラン",
          { latitude: 35.681236, longitude: 139.767125 },
          1000,
        ),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe("モックキッチン");
  });

  it("surfaces errors when the nearby API fails", async () => {
    server.use(
      http.get(
        ({ request }) =>
          new URL(request.url).pathname === "/api/restaurants/nearby",
        () =>
          HttpResponse.json({ message: "ネットワーク障害" }, { status: 502 }),
      ),
    );

    const { result } = renderHook(
      () =>
        useNearbyRestaurants(
          "テストクエリ",
          { latitude: 35.681236, longitude: 139.767125 },
          1000,
        ),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toMatch(/ネットワーク障害/);
  });

  it("stays idle while origin coordinates are missing", async () => {
    const { result } = renderHook(
      () => useNearbyRestaurants("和食", null, 1000),
      { wrapper: createWrapper() },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });
});
