import type { Restaurant } from "@/lib/restaurants/types";
import { RestaurantMapExplorerProvider } from "@/contexts/restaurant-map-explorer-context";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RestaurantListPanel } from "./restaurant-list-panel";

const SAMPLE_RESTAURANTS: Restaurant[] = [
  {
    id: "r1",
    name: "テストそば店",
    address: "東京都千代田区",
    coordinates: { latitude: 35.68, longitude: 139.76 },
    distanceMeters: 200,
  },
];

function renderPanel(props: {
  leafLabel: string | null;
  restaurants: Restaurant[] | undefined;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
}) {
  return render(
    <RestaurantMapExplorerProvider restaurants={props.restaurants}>
      <RestaurantListPanel
        leafLabel={props.leafLabel}
        restaurants={props.restaurants}
        isLoading={props.isLoading ?? false}
        isError={props.isError ?? false}
        errorMessage={props.errorMessage ?? null}
        geoHint="現在地"
      />
    </RestaurantMapExplorerProvider>,
  );
}

describe("RestaurantListPanel", () => {
  it("renders restaurant rows after a successful load", async () => {
    const user = userEvent.setup();

    renderPanel({
      leafLabel: "かけそば",
      restaurants: SAMPLE_RESTAURANTS,
    });

    expect(screen.getByText("テストそば店")).toBeInTheDocument();
    expect(screen.getByText(/選択：かけそば/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /テストそば店/ }));

    expect(
      screen.getByRole("button", { name: /テストそば店/, pressed: true }),
    ).toBeInTheDocument();
  });

  it("shows the empty-state copy when the API returns zero rows", () => {
    renderPanel({
      leafLabel: "レアメニュー",
      restaurants: [],
    });

    expect(screen.getByText(/約1km圏内に見つかりませんでした/)).toBeInTheDocument();
  });

  it("shows destructive messaging when loading failed", () => {
    renderPanel({
      leafLabel: "ラーメン",
      restaurants: undefined,
      isError: true,
      errorMessage: "Places API が無効です",
    });

    expect(screen.getByText(/読み込めませんでした/)).toBeInTheDocument();
    expect(screen.getByText(/Places API が無効です/)).toBeInTheDocument();
  });
});
