<script lang="ts">
  import { onMount } from "svelte";

  import "../styles.css";

  import {
    exactToPercent,
    projectCleanSequenceV1,
  } from "@strainspace/geometry-engine";
  import type {
    CounterProfileFixtureV1,
    ProxyFactionV1,
  } from "@strainspace/rule-schema";

  import { analyzeForces, type AnalysisSnapshot } from "../analysis.js";
  import { loadFixtureDataset, type FixtureDataset } from "../data.js";
  import {
    buildSceneModel,
    representationLabels,
    type PairCoordinateView,
    type SceneModel,
  } from "../presentation.js";
  import StrainSpaceScene from "./StrainSpaceScene.svelte";

  type LoadState =
    | { readonly kind: "loading" }
    | { readonly kind: "error"; readonly message: string }
    | { readonly kind: "ready"; readonly dataset: FixtureDataset };

  type ResolvedView =
    | { readonly kind: "empty" }
    | { readonly kind: "error"; readonly message: string }
    | {
        readonly kind: "ready";
        readonly dataset: FixtureDataset;
        readonly source: ProxyFactionV1;
        readonly target: ProxyFactionV1;
        readonly counter?: CounterProfileFixtureV1;
        readonly snapshot: AnalysisSnapshot;
        readonly model: SceneModel;
      };

  interface Props {
    readonly loader?: () => Promise<FixtureDataset>;
    readonly renderScene?: boolean;
  }

  let { loader = loadFixtureDataset, renderScene = true }: Props = $props();
  let loadState = $state<LoadState>({ kind: "loading" });
  let sourceFactionId = $state("");
  let targetFactionId = $state("");
  let representation = $state<PairCoordinateView>("approximate-log-ratio");
  let counterfactualApplied = $state(false);
  let selectedSourceId = $state("");
  let selectedTargetId = $state("");

  onMount(() => {
    let active = true;
    void loader()
      .then((dataset) => {
        if (active) loadState = { kind: "ready", dataset };
      })
      .catch((error: unknown) => {
        if (active)
          loadState = {
            kind: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          };
      });
    return () => {
      active = false;
    };
  });

  const resolved = $derived.by<ResolvedView | undefined>(() => {
    if (loadState.kind !== "ready") return undefined;
    const dataset = loadState.dataset;
    if (dataset.factions.length < 2) return { kind: "empty" };
    const source =
      dataset.factions.find(
        (faction) => faction.factionId === sourceFactionId,
      ) ?? dataset.factions[0];
    const defaultTarget = dataset.factions.find(
      (faction) => faction.factionId !== source?.factionId,
    );
    const requestedTarget = dataset.factions.find(
      (faction) => faction.factionId === targetFactionId,
    );
    const target =
      requestedTarget?.factionId === source?.factionId
        ? defaultTarget
        : (requestedTarget ?? defaultTarget);
    if (source === undefined || target === undefined) return { kind: "empty" };

    const counter = dataset.counterProfiles.find(
      (candidate) => candidate.replaces.factionId === source.factionId,
    );
    const analysis = analyzeForces(
      source,
      target,
      dataset.criterion,
      counterfactualApplied ? counter : undefined,
    );
    if (!analysis.ok) return { kind: "error", message: analysis.error.message };
    const snapshot = analysis.value;
    const selectedCell =
      snapshot.matrix.cells.find(
        (cell) =>
          cell.sourceEntityId === selectedSourceId &&
          cell.targetEntityId === selectedTargetId,
      ) ?? snapshot.matrix.cells.at(-1);
    if (selectedCell === undefined) return { kind: "empty" };
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
    )
      return {
        kind: "error",
        message: "The selected coverage cell could not be resolved.",
      };
    const projection = projectCleanSequenceV1(
      selectedProfile,
      selectedTarget.defense,
    );
    if (!projection.ok)
      return { kind: "error", message: projection.error.message };

    return {
      kind: "ready",
      dataset,
      source,
      target,
      ...(counter === undefined ? {} : { counter }),
      snapshot,
      model: buildSceneModel(
        snapshot,
        selectedSource,
        selectedTarget,
        selectedProfile,
        projection.value,
        dataset.thresholdMap,
        representation,
        counterfactualApplied,
      ),
    };
  });

  function changeSource(nextId: string) {
    if (loadState.kind !== "ready") return;
    const nextTarget = loadState.dataset.factions.find(
      (faction) => faction.factionId !== nextId,
    );
    sourceFactionId = nextId;
    targetFactionId = nextTarget?.factionId ?? "";
    counterfactualApplied = false;
    selectedSourceId = "";
    selectedTargetId = "";
  }

  function changeTarget(nextId: string) {
    targetFactionId = nextId;
    counterfactualApplied = false;
    selectedTargetId = "";
  }

  function selectCell(sourceId: string, targetId: string) {
    selectedSourceId = sourceId;
    selectedTargetId = targetId;
  }
</script>

{#if loadState.kind === "loading"}
  <main class="state-shell" aria-busy="true">
    <div class="state-mark">S²</div>
    <p class="eyebrow">Constructing finite spaces</p>
    <h1>Loading exact fixture geometry…</h1>
    <div class="loading-line"><span></span></div>
  </main>
{:else if loadState.kind === "error"}
  <main class="state-shell error" role="alert">
    <div class="state-mark">!</div>
    <p class="eyebrow">Validation stopped safely</p>
    <h1>The force geometry could not be constructed.</h1>
    <p>{loadState.message}</p>
  </main>
{:else if resolved?.kind === "empty"}
  <main class="state-shell">
    <div class="state-mark">∅</div>
    <p class="eyebrow">No relation to project</p>
    <h1>Load at least two validated force fixtures.</h1>
    <p>The analysis surface needs one acting force and one opposing force.</p>
  </main>
{:else if resolved?.kind === "error"}
  <main class="state-shell error" role="alert">
    <div class="state-mark">!</div>
    <p class="eyebrow">Projection stopped safely</p>
    <h1>The force geometry could not be constructed.</h1>
    <p>{resolved.message}</p>
  </main>
{:else if resolved?.kind === "ready"}
  <main class="app-shell">
    <header class="hud brand-hud">
      <div class="brand-mark" aria-hidden="true">S²</div>
      <div>
        <p class="eyebrow">Deterministic force geometry</p>
        <h1>StrainSpace</h1>
      </div>
      <div class="exact-badge"><i></i> Exact D6 enumeration</div>
    </header>

    <section class="hud control-hud" aria-label="Analysis controls">
      <label>
        <span>Analyzing force</span>
        <select
          value={resolved.source.factionId}
          onchange={(event) => changeSource(event.currentTarget.value)}
        >
          {#each resolved.dataset.factions as faction (faction.factionId)}
            <option value={faction.factionId}>{faction.displayName}</option>
          {/each}
        </select>
      </label>
      <span class="against">against</span>
      <label>
        <span>Opposing force</span>
        <select
          value={resolved.target.factionId}
          onchange={(event) => changeTarget(event.currentTarget.value)}
        >
          {#each resolved.dataset.factions.filter((faction) => faction.factionId !== resolved.source.factionId) as faction (faction.factionId)}
            <option value={faction.factionId}>{faction.displayName}</option>
          {/each}
        </select>
      </label>
      <fieldset>
        <legend>Pair coordinate</legend>
        {#each Object.entries(representationLabels) as [value, label] (value)}
          <button
            type="button"
            class:active={representation === value}
            aria-pressed={representation === value}
            onclick={() => (representation = value as PairCoordinateView)}
            >{label}</button
          >
        {/each}
      </fieldset>
    </section>

    <section class="hud summary-hud" aria-label="Analysis summary">
      <div>
        <span>Coverage</span>
        <strong>{resolved.model.coveragePercent}%</strong>
        <small
          >{resolved.model.coveredCells}/{resolved.model.totalCells} pairs</small
        >
      </div>
      <div class:warning={resolved.model.holes.length > 0}>
        <span>Absolute holes</span>
        <strong
          >{resolved.model.holes.length.toString().padStart(2, "0")}</strong
        >
        <small
          >{resolved.model.holes.length > 0
            ? "response absent"
            : "field closed"}</small
        >
      </div>
      <div>
        <span>Criterion</span>
        <strong>{exactToPercent(resolved.dataset.criterion.threshold)}</strong>
        <small>removal event</small>
      </div>
    </section>

    {#if renderScene}
      <StrainSpaceScene model={resolved.model} onSelect={selectCell} />
    {:else}
      <div class="scene-placeholder" aria-hidden="true"></div>
    {/if}

    <section class="hud selected-hud" aria-live="polite">
      <p class="eyebrow">Selected relation</p>
      <h2>
        {resolved.model.selected.sourceLabel} <span>→</span>
        {resolved.model.selected.targetLabel}
      </h2>
      <p>
        {resolved.model.selected.profileLabel} · {resolved.model.selected
          .regionLabel}
      </p>
      <dl>
        <div>
          <dt>Coordinate</dt>
          <dd>{resolved.model.selected.coordinate}</dd>
        </div>
        <div>
          <dt>Requirement</dt>
          <dd>{resolved.model.selected.requirement}</dd>
        </div>
        <div>
          <dt>Effect</dt>
          <dd>{resolved.model.selected.effect}</dd>
        </div>
      </dl>
    </section>

    <section class="hud counterfactual-hud" aria-live="polite">
      <p class="eyebrow">Structural diagnosis</p>
      <h2>
        {resolved.model.holes.length > 0
          ? "A response region is missing."
          : "The seeded response gap is closed."}
      </h2>
      {#if resolved.model.holes.length > 0}
        {#each resolved.model.holes as hole (hole.id)}
          <p class="hole-line">{hole.targetLabel} · {hole.gap} gap</p>
        {/each}
      {:else}
        <p class="closed-line">Absolute hole closed</p>
      {/if}
      {#if resolved.counter !== undefined}
        <button
          type="button"
          class:active={counterfactualApplied}
          onclick={() => (counterfactualApplied = !counterfactualApplied)}
        >
          <span
            >{counterfactualApplied
              ? "Restore baseline"
              : "Apply counterfactual"}</span
          >
          <strong
            >{counterfactualApplied
              ? "Anchor Shear"
              : resolved.counter.profile.displayName}</strong
          >
        </button>
      {/if}
    </section>

    <p class="interaction-hint">
      Drag to orbit · scroll to zoom · select a matrix tower
    </p>

    <section class="sr-only" aria-label="Accessible coverage data">
      <h2>Pair coverage matrix</h2>
      <table>
        <caption>Exact pair coverage results</caption>
        <thead>
          <tr
            ><th>Source</th><th>Target</th><th>Capability</th><th>Status</th
            ></tr
          >
        </thead>
        <tbody>
          {#each resolved.model.cells as cell (`${cell.sourceEntityId}:${cell.targetEntityId}`)}
            <tr>
              <td>{cell.sourceLabel}</td><td>{cell.targetLabel}</td>
              <td>{cell.capabilityLabel}</td><td
                >{cell.covered ? "Covered" : "Exposed"}</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  </main>
{/if}
