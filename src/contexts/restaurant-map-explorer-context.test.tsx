import type { Restaurant } from "@/lib/restaurants/types";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  RestaurantMapExplorerProvider,
  useRestaurantMapExplorer,
} from "./restaurant-map-explorer-context";

const RA: Restaurant = {
  id: "a",
  name: "店舗A",
  address: "",
  coordinates: { latitude: 35.68, longitude: 139.76 },
};

const RB: Restaurant = {
  id: "b",
  name: "店舗B",
  address: "",
  coordinates: { latitude: 35.681, longitude: 139.761 },
};

function ExplorerProbe() {
  const { selectedRestaurantId, selectRestaurant, restaurants } =
    useRestaurantMapExplorer();

  return (
    <div>
      <span data-testid="count">{restaurants.length}</span>
      <span data-testid="selected">{selectedRestaurantId ?? "none"}</span>
      <button type="button" onClick={() => selectRestaurant("a")}>
        店舗Aを選択
      </button>
      <button type="button" onClick={() => selectRestaurant("b")}>
        店舗Bを選択
      </button>
      <button type="button" onClick={() => selectRestaurant(null)}>
        選択解除
      </button>
    </div>
  );
}

describe("RestaurantMapExplorerProvider", () => {
  it("selectRestaurant toggles off when the same id is chosen twice", async () => {
    const user = userEvent.setup();

    render(
      <RestaurantMapExplorerProvider restaurants={[RA, RB]}>
        <ExplorerProbe />
      </RestaurantMapExplorerProvider>,
    );

    await user.click(screen.getByRole("button", { name: "店舗Aを選択" }));
    expect(screen.getByTestId("selected")).toHaveTextContent("a");

    await user.click(screen.getByRole("button", { name: "店舗Aを選択" }));
    expect(screen.getByTestId("selected")).toHaveTextContent("none");
  });

  it("selectRestaurant(null) clears the selection", async () => {
    const user = userEvent.setup();

    render(
      <RestaurantMapExplorerProvider restaurants={[RA, RB]}>
        <ExplorerProbe />
      </RestaurantMapExplorerProvider>,
    );

    await user.click(screen.getByRole("button", { name: "店舗Bを選択" }));
    expect(screen.getByTestId("selected")).toHaveTextContent("b");

    await user.click(screen.getByRole("button", { name: "選択解除" }));
    expect(screen.getByTestId("selected")).toHaveTextContent("none");
  });

  it("drops stale selection when the chosen id disappears from list data", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <RestaurantMapExplorerProvider restaurants={[RA, RB]}>
        <ExplorerProbe />
      </RestaurantMapExplorerProvider>,
    );

    await user.click(screen.getByRole("button", { name: "店舗Aを選択" }));
    expect(screen.getByTestId("selected")).toHaveTextContent("a");

    rerender(
      <RestaurantMapExplorerProvider restaurants={[RB]}>
        <ExplorerProbe />
      </RestaurantMapExplorerProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("selected")).toHaveTextContent("none");
    });
  });

  it("clears selection when restaurant list becomes empty", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <RestaurantMapExplorerProvider restaurants={[RA]}>
        <ExplorerProbe />
      </RestaurantMapExplorerProvider>,
    );

    await user.click(screen.getByRole("button", { name: "店舗Aを選択" }));

    rerender(
      <RestaurantMapExplorerProvider restaurants={[]}>
        <ExplorerProbe />
      </RestaurantMapExplorerProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("selected")).toHaveTextContent("none");
    });
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
