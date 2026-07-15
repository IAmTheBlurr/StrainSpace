import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "./App.js";
import { loadFixtureDataset } from "./data.js";

describe("StrainSpace vertical slice", () => {
  it("loads validated fixtures and closes the seeded hole through the counterfactual control", async () => {
    const user = userEvent.setup();
    render(<App />);

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
    render(
      <App
        loader={() => Promise.reject(new Error("Synthetic validation failure"))}
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Synthetic validation failure",
    );
  });

  it("renders the explicit empty state when fewer than two fixtures exist", async () => {
    const dataset = await loadFixtureDataset();
    render(
      <App
        loader={() =>
          Promise.resolve({
            ...dataset,
            factions: dataset.factions.slice(0, 1),
          })
        }
      />,
    );
    expect(
      await screen.findByText("Load at least two validated force fixtures."),
    ).toBeInTheDocument();
  });
});
