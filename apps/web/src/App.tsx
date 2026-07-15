import { useEffect, useState } from "react";

import {
  BASIC_POWER_RESILIENCE_THRESHOLD_MAP,
  projectCleanSequence,
  rationalToNumber,
  rationalToPercent,
} from "@strainspace/geometry-engine";
import type { PairRepresentation } from "@strainspace/rule-schema";

import { analyzeForces } from "./analysis.js";
import { loadFixtureDataset, type FixtureDataset } from "./data.js";

type LoadState =
  | { readonly kind: "loading" }
  | { readonly kind: "error"; readonly message: string }
  | { readonly kind: "ready"; readonly dataset: FixtureDataset };

export interface AppProps {
  readonly loader?: () => Promise<FixtureDataset>;
}

const representationLabels: Record<PairRepresentation, string> = {
  difference: "Difference",
  ratio: "Ratio",
  "log-ratio": "Log ratio",
};

export function App({ loader = loadFixtureDataset }: AppProps) {
  const [loadState, setLoadState] = useState<LoadState>({ kind: "loading" });
  const [sourceFactionId, setSourceFactionId] = useState("");
  const [targetFactionId, setTargetFactionId] = useState("");
  const [representation, setRepresentation] =
    useState<PairRepresentation>("log-ratio");
  const [counterfactualApplied, setCounterfactualApplied] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [selectedTargetId, setSelectedTargetId] = useState("");

  useEffect(() => {
    let active = true;
    loader()
      .then((dataset) => {
        if (active) setLoadState({ kind: "ready", dataset });
      })
      .catch((error: unknown) => {
        if (active)
          setLoadState({
            kind: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          });
      });
    return () => {
      active = false;
    };
  }, [loader]);

  if (loadState.kind === "loading") return <LoadingState />;
  if (loadState.kind === "error")
    return <ErrorState message={loadState.message} />;
  if (loadState.dataset.factions.length < 2) return <EmptyState />;

  const { factions, criterion, counterProfiles } = loadState.dataset;
  const source =
    factions.find((faction) => faction.factionId === sourceFactionId) ??
    factions[0];
  const defaultTarget = factions.find(
    (faction) => faction.factionId !== source?.factionId,
  );
  const requestedTarget = factions.find(
    (faction) => faction.factionId === targetFactionId,
  );
  const target =
    requestedTarget?.factionId === source?.factionId
      ? defaultTarget
      : (requestedTarget ?? defaultTarget);
  if (source === undefined || target === undefined) return <EmptyState />;

  const availableCounter = counterProfiles.find(
    (candidate) => candidate.replaces.factionId === source.factionId,
  );
  const snapshot = analyzeForces(
    source,
    target,
    criterion,
    representation,
    counterfactualApplied ? availableCounter : undefined,
  );
  const fallbackCell = snapshot.matrix.cells.at(-1);
  const selectedCell =
    snapshot.matrix.cells.find(
      (cell) =>
        cell.sourceEntityId === selectedSourceId &&
        cell.targetEntityId === selectedTargetId,
    ) ?? fallbackCell;
  if (selectedCell === undefined) return <EmptyState />;

  const selectedSource = snapshot.source.entities.find(
    (entity) => entity.id === selectedCell.sourceEntityId,
  );
  const selectedTarget = snapshot.target.entities.find(
    (entity) => entity.id === selectedCell.targetEntityId,
  );
  const selectedProfile = selectedSource?.attackProfiles.find(
    (profile) => profile.id === selectedCell.best.sourceProfileId,
  );
  if (
    selectedSource === undefined ||
    selectedTarget === undefined ||
    selectedProfile === undefined
  ) {
    return (
      <ErrorState message="The selected coverage cell could not be resolved." />
    );
  }
  const projection = projectCleanSequence(
    selectedProfile,
    selectedTarget.defense,
    representation,
  );
  const coveredCells = snapshot.matrix.cells.filter(
    (cell) => cell.best.covered,
  ).length;
  const coveragePercent = Math.round(
    (coveredCells / snapshot.matrix.cells.length) * 100,
  );
  const activeRegion = BASIC_POWER_RESILIENCE_THRESHOLD_MAP.regions.find(
    (region) =>
      region.regionId === projection.powerResilience.relation.regionId,
  );

  function changeSource(nextId: string) {
    const nextTarget = factions.find((faction) => faction.factionId !== nextId);
    setSourceFactionId(nextId);
    setTargetFactionId(nextTarget?.factionId ?? "");
    setCounterfactualApplied(false);
    setSelectedSourceId("");
    setSelectedTargetId("");
  }

  function changeTarget(nextId: string) {
    setTargetFactionId(nextId);
    setCounterfactualApplied(false);
    setSelectedTargetId("");
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            S²
          </span>
          <div>
            <p className="eyebrow">Deterministic force geometry</p>
            <h1>StrainSpace</h1>
          </div>
        </div>
        <p className="hero-thesis">
          Find the response your force <em>doesn’t</em> have—then cross the
          exact boundary that repairs it.
        </p>
        <div className="exact-badge">
          <span className="status-dot" /> Exact D6 enumeration
        </div>
      </header>

      <section className="control-ribbon" aria-label="Analysis controls">
        <label>
          <span>Analyzing force</span>
          <select
            value={source.factionId}
            onChange={(event) => changeSource(event.target.value)}
          >
            {factions.map((faction) => (
              <option key={faction.factionId} value={faction.factionId}>
                {faction.displayName}
              </option>
            ))}
          </select>
        </label>
        <div className="direction-arrow" aria-hidden="true">
          against
        </div>
        <label>
          <span>Opposing force</span>
          <select
            value={target.factionId}
            onChange={(event) => changeTarget(event.target.value)}
          >
            {factions
              .filter((faction) => faction.factionId !== source.factionId)
              .map((faction) => (
                <option key={faction.factionId} value={faction.factionId}>
                  {faction.displayName}
                </option>
              ))}
          </select>
        </label>
        <div className="representation-control">
          <span>Pair coordinate</span>
          <div className="segmented" role="group" aria-label="Pair coordinate">
            {(Object.keys(representationLabels) as PairRepresentation[]).map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  className={representation === option ? "active" : ""}
                  aria-pressed={representation === option}
                  onClick={() => setRepresentation(option)}
                >
                  {representationLabels[option]}
                </button>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="summary-strip" aria-label="Analysis summary">
        <article>
          <span>Pair coverage</span>
          <strong>{coveragePercent}%</strong>
          <small>
            {coveredCells} of {snapshot.matrix.cells.length} relations meet
            criterion
          </small>
        </article>
        <article className={snapshot.holes.length > 0 ? "warning" : "positive"}>
          <span>Absolute holes</span>
          <strong>{snapshot.holes.length.toString().padStart(2, "0")}</strong>
          <small>
            {snapshot.holes.length > 0
              ? "No adequate response exists"
              : "All target regions covered"}
          </small>
        </article>
        <article>
          <span>Coverage criterion</span>
          <strong>{rationalToPercent(criterion.threshold)}</strong>
          <small>
            chance to remove ≥ {criterion.minimumModelsRemoved} model
          </small>
        </article>
        <article>
          <span>Selected strain</span>
          <strong>
            {formatStrain(
              projection.powerResilience.relation.strain,
              representation,
            )}
          </strong>
          <small>{activeRegion?.label ?? "Unknown region"}</small>
        </article>
      </section>

      <section className="workspace-grid">
        <article className="panel matrix-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Relational field</p>
              <h2>Pair coverage matrix</h2>
            </div>
            <div className="legend" aria-label="Coverage legend">
              <span>
                <i className="swatch covered" /> Covered
              </span>
              <span>
                <i className="swatch exposed" /> Exposed
              </span>
            </div>
          </div>
          <p className="panel-note">
            Rows act; columns resist. Select a cell to inspect its complete
            projection.
          </p>
          <div className="matrix-scroll">
            <table className="coverage-table">
              <thead>
                <tr>
                  <th scope="col" className="corner-label">
                    source ↓ / target →
                  </th>
                  {snapshot.target.entities.map((entity) => (
                    <th scope="col" key={entity.id}>
                      <span>{entity.displayName}</span>
                      <small>
                        R{entity.defense.resilience} · P
                        {entity.defense.protectionThreshold}+
                      </small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {snapshot.source.entities.map((sourceEntity) => (
                  <tr key={sourceEntity.id}>
                    <th scope="row">
                      <span>{sourceEntity.displayName}</span>
                      <small>{sourceEntity.cost} resource</small>
                    </th>
                    {snapshot.target.entities.map((targetEntity) => {
                      const cell = snapshot.matrix.cells.find(
                        (candidate) =>
                          candidate.sourceEntityId === sourceEntity.id &&
                          candidate.targetEntityId === targetEntity.id,
                      );
                      if (cell === undefined)
                        return <td key={targetEntity.id}>—</td>;
                      const selected = cell === selectedCell;
                      return (
                        <td key={targetEntity.id}>
                          <button
                            type="button"
                            className={`matrix-cell ${cell.best.covered ? "covered" : "exposed"} ${selected ? "selected" : ""}`}
                            aria-label={`${sourceEntity.displayName} against ${targetEntity.displayName}: ${rationalToPercent(cell.best.capability, 1)}`}
                            aria-pressed={selected}
                            onClick={() => {
                              setSelectedSourceId(sourceEntity.id);
                              setSelectedTargetId(targetEntity.id);
                            }}
                          >
                            <strong>
                              {rationalToPercent(cell.best.capability, 0)}
                            </strong>
                            <span>
                              {cell.best.covered ? "covered" : "holeward"}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="panel pair-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Selected relation</p>
              <h2>
                {selectedSource.displayName} <span>→</span>{" "}
                {selectedTarget.displayName}
              </h2>
            </div>
            <span
              className={`coverage-pill ${selectedCell.best.covered ? "covered" : "exposed"}`}
            >
              {selectedCell.best.covered ? "Covered" : "Exposed"}
            </span>
          </div>
          <p className="profile-name">
            Best profile · {selectedProfile.displayName}
          </p>
          <div className="scalar-pair">
            <div>
              <span>Power</span>
              <strong>{selectedProfile.power}</strong>
            </div>
            <div className="strain-link">
              <span>{representationLabels[representation]}</span>
              <strong>
                {formatStrain(
                  projection.powerResilience.relation.strain,
                  representation,
                )}
              </strong>
            </div>
            <div>
              <span>Resilience</span>
              <strong>{selectedTarget.defense.resilience}</strong>
            </div>
          </div>
          <dl className="stage-list">
            <div>
              <dt>Accuracy</dt>
              <dd>
                {selectedProfile.accuracyThreshold}+ ·{" "}
                {rationalToPercent(projection.accuracy.probability, 1)}
              </dd>
            </div>
            <div>
              <dt>Power / resilience</dt>
              <dd>
                {projection.powerResilience.relation.threshold}+ ·{" "}
                {rationalToPercent(
                  projection.powerResilience.outcomeSpace.probability,
                  1,
                )}
              </dd>
            </div>
            <div>
              <dt>Failed protection</dt>
              <dd>
                {projection.penetrationProtection.effectiveThreshold}+ save ·{" "}
                {rationalToPercent(
                  projection.penetrationProtection.failedProtectionProbability,
                  1,
                )}
              </dd>
            </div>
            <div>
              <dt>Effect per attack</dt>
              <dd>
                {rationalToPercent(projection.singleAttackEffectProbability, 1)}
              </dd>
            </div>
            <div>
              <dt>Efficiency</dt>
              <dd>
                {selectedCell.best.efficiencyPer100Cost.toFixed(2)} dmg / 100
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="projection-grid">
        <article className="panel threshold-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Piecewise map</p>
              <h2>Threshold region</h2>
            </div>
            <strong className="large-threshold">
              {projection.powerResilience.relation.threshold}+
            </strong>
          </div>
          <div className="threshold-track">
            {BASIC_POWER_RESILIENCE_THRESHOLD_MAP.regions
              .toReversed()
              .map((region) => (
                <div
                  key={region.regionId}
                  className={
                    region.regionId === activeRegion?.regionId ? "active" : ""
                  }
                >
                  <span>{region.threshold}+</span>
                  <small>{region.label}</small>
                </div>
              ))}
          </div>
          <p className="math-note">
            Boundary lines are defined by the ratio P/R. The selected pair sits
            in <strong>{activeRegion?.label.toLowerCase()}</strong> territory;
            values inside this region share one D6 projection.
          </p>
        </article>

        <article className="panel dice-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Finite sample space Ω</p>
              <h2>Six-outcome dice space</h2>
            </div>
            <span className="fraction">
              {projection.powerResilience.outcomeSpace.probability.numerator}/6
            </span>
          </div>
          <div
            className="dice-row"
            aria-label="Power-resilience successful D6 faces"
          >
            {projection.powerResilience.outcomeSpace.faces.map((face) => {
              const success =
                projection.powerResilience.outcomeSpace.successfulFaces.includes(
                  face,
                );
              return (
                <div key={face} className={success ? "success" : "failure"}>
                  <span>{face}</span>
                  <small>{success ? "success" : "miss"}</small>
                </div>
              );
            })}
          </div>
          <p className="math-note">
            Every face is enumerated once. No model-generated arithmetic enters
            this result.
          </p>
        </article>

        <article className="panel distribution-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Projected effect</p>
              <h2>Removal distribution</h2>
            </div>
            <span className="fraction">
              E {projection.effectDistribution.expectedModelsRemoved.numerator}/
              {projection.effectDistribution.expectedModelsRemoved.denominator}
            </span>
          </div>
          <div className="distribution-bars">
            {projection.effectDistribution.outcomes.map((outcome) => (
              <div key={outcome.damagingHits}>
                <span>{outcome.modelsRemoved} removed</span>
                <i>
                  <b
                    style={{
                      width: `${Math.max(2, rationalToNumber(outcome.probability) * 100)}%`,
                    }}
                  />
                </i>
                <strong>{rationalToPercent(outcome.probability, 1)}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="hole-section">
        <div className="hole-copy">
          <p className="eyebrow">Structural diagnosis</p>
          <h2>
            {snapshot.holes.length > 0
              ? "A response region is missing."
              : "The seeded response gap is closed."}
          </h2>
          <p>
            {snapshot.holes.length > 0
              ? "No profile crosses the declared reliability boundary for the target region below. Aggregate strength alone would not isolate this absence."
              : "The counter-profile crosses both the pair threshold and removal-probability boundary. Coverage is recomputed from the same exact operators."}
          </p>
          {availableCounter !== undefined && (
            <button
              type="button"
              className={`counterfactual-button ${counterfactualApplied ? "active" : ""}`}
              onClick={() => setCounterfactualApplied((current) => !current)}
            >
              <span>
                {counterfactualApplied
                  ? "Restore baseline"
                  : "Apply counterfactual"}
              </span>
              <strong>
                {counterfactualApplied
                  ? "Anchor Shear"
                  : availableCounter.profile.displayName}
              </strong>
              <i aria-hidden="true">→</i>
            </button>
          )}
        </div>
        <div className="hole-list" aria-live="polite">
          {snapshot.holes.length === 0 ? (
            <div className="closed-hole">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>Absolute hole closed</strong>
                <small>
                  Every target region now has at least one adequate response.
                </small>
              </div>
            </div>
          ) : (
            snapshot.holes.map((hole) => {
              const entity = snapshot.target.entities.find(
                (candidate) => candidate.id === hole.targetEntityIds[0],
              );
              return (
                <article key={hole.holeId}>
                  <div>
                    <span className="hole-index">
                      H{snapshot.holes.indexOf(hole) + 1}
                    </span>
                    <strong>
                      {entity?.displayName ?? hole.targetRegionId}
                    </strong>
                  </div>
                  <dl>
                    <div>
                      <dt>Region</dt>
                      <dd>
                        R{entity?.defense.resilience} · P
                        {entity?.defense.protectionThreshold}+ · H
                        {entity?.defense.health}
                      </dd>
                    </div>
                    <div>
                      <dt>Gap to criterion</dt>
                      <dd>{rationalToPercent(hole.missingCapability, 1)}</dd>
                    </div>
                    <div>
                      <dt>Best available</dt>
                      <dd>{hole.bestAvailableResponse}</dd>
                    </div>
                  </dl>
                </article>
              );
            })
          )}
        </div>
      </section>

      <footer>
        <span>STRNSPC / deterministic vertical slice</span>
        <span>Finite spaces · explicit assumptions · original proxy data</span>
      </footer>
    </main>
  );
}

function formatStrain(
  value: number,
  representation: PairRepresentation,
): string {
  if (representation === "ratio") return `${value.toFixed(2)}×`;
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
}

function LoadingState() {
  return (
    <main className="state-shell" aria-busy="true">
      <div className="state-mark">S²</div>
      <p className="eyebrow">Constructing finite spaces</p>
      <h1>Loading exact fixture geometry…</h1>
      <div className="loading-line">
        <span />
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <main className="state-shell">
      <div className="state-mark">∅</div>
      <p className="eyebrow">No relation to project</p>
      <h1>Load at least two validated force fixtures.</h1>
      <p>The analysis surface needs one acting force and one opposing force.</p>
    </main>
  );
}

function ErrorState({ message }: { readonly message: string }) {
  return (
    <main className="state-shell error" role="alert">
      <div className="state-mark">!</div>
      <p className="eyebrow">Validation stopped safely</p>
      <h1>The force geometry could not be constructed.</h1>
      <p>{message}</p>
    </main>
  );
}
