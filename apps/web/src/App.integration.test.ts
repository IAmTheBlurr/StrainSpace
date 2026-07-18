import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import App from "./lib/App.svelte";
import { loadFixtureDataset } from "./data.js";

describe("StrainSpace three-dimensional vertical slice", () => {
  it("loads validated fixtures and closes the seeded hole through the counterfactual control", async () => {
    const user = userEvent.setup();
    render(App, { props: { renderScene: false } });

    expect(
      screen.getByText("Loading exact fixture geometry…"),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Pair coverage matrix" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A response region is missing."),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Apply counterfactual/i }),
    );
    expect(
      await screen.findByText("The seeded response gap is closed."),
    ).toBeInTheDocument();
    expect(screen.getByText("Absolute hole closed")).toBeInTheDocument();
  });

  it("renders a safe error state when validation fails", async () => {
    render(App, {
      props: {
        renderScene: false,
        loader: () => Promise.reject(new Error("Synthetic validation failure")),
      },
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Synthetic validation failure",
    );
  });

  it("renders the explicit empty state when fewer than two fixtures exist", async () => {
    const dataset = await loadFixtureDataset();
    render(App, {
      props: {
        renderScene: false,
        loader: () =>
          Promise.resolve({
            ...dataset,
            factions: dataset.factions.slice(0, 1),
          }),
      },
    });
    expect(
      await screen.findByText("Load at least two validated force fixtures."),
    ).toBeInTheDocument();
  });
});
