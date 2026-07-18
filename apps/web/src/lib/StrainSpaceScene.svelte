<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OrbitControls } from "three/addons/controls/OrbitControls.js";
  import {
    CSS2DObject,
    CSS2DRenderer,
  } from "three/addons/renderers/CSS2DRenderer.js";

  import type { SceneModel } from "../presentation.js";

  interface Props {
    readonly model: SceneModel;
    readonly onSelect: (sourceId: string, targetId: string) => void;
  }

  let { model, onSelect }: Props = $props();
  let mount: HTMLDivElement;
  let scene: THREE.Scene | undefined;
  let camera: THREE.PerspectiveCamera | undefined;
  let renderer: THREE.WebGLRenderer | undefined;
  let labelRenderer: CSS2DRenderer | undefined;
  let controls: OrbitControls | undefined;
  let content: THREE.Group | undefined;
  let interactiveCells: THREE.Mesh[] = [];
  let frame = 0;
  let pointerStart = { x: 0, y: 0 };

  onMount(() => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07100f);
    scene.fog = new THREE.FogExp2(0x07100f, 0.035);

    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(11.5, 10.5, 14.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = "webgl-layer";
    mount.append(renderer.domElement);

    labelRenderer = new CSS2DRenderer();
    labelRenderer.domElement.className = "label-layer";
    mount.append(labelRenderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(-0.4, 0.2, -0.3);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.minDistance = 8;
    controls.maxDistance = 28;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minPolarAngle = Math.PI * 0.17;
    controls.update();

    const ambient = new THREE.HemisphereLight(0x9fffea, 0x07100f, 1.5);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xff8a5b, 3.2);
    key.position.set(-4, 10, 8);
    scene.add(key);
    const rim = new THREE.PointLight(0x6be3ce, 18, 30, 1.8);
    rim.position.set(7, 5, -3);
    scene.add(rim);

    const floor = new THREE.GridHelper(30, 30, 0x23483f, 0x142a27);
    floor.position.y = -0.04;
    scene.add(floor);
    const axis = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-7.5, 0.02, 3.5),
        new THREE.Vector3(7.5, 0.02, 3.5),
      ]),
      new THREE.LineBasicMaterial({ color: 0x3b6e63 }),
    );
    scene.add(axis);

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("keydown", handleKeyDown);
    renderer.domElement.tabIndex = 0;

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    rebuild(model);
    resize();
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
      controls?.dispose();
      disposeContent();
      renderer?.dispose();
      renderer?.domElement.remove();
      labelRenderer?.domElement.remove();
      scene = undefined;
      camera = undefined;
      renderer = undefined;
      labelRenderer = undefined;
    };
  });

  $effect(() => {
    const current = model;
    if (scene !== undefined) rebuild(current);
  });

  function animate() {
    frame = requestAnimationFrame(animate);
    controls?.update();
    if (scene !== undefined && camera !== undefined) {
      renderer?.render(scene, camera);
      labelRenderer?.render(scene, camera);
    }
  }

  function resize() {
    if (
      camera === undefined ||
      renderer === undefined ||
      labelRenderer === undefined
    )
      return;
    const { width, height } = mount.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.fov = width < 760 ? 56 : 42;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    labelRenderer.setSize(width, height);
  }

  function rebuild(current: SceneModel) {
    if (scene === undefined) return;
    disposeContent();
    const group = new THREE.Group();
    content = group;
    scene.add(group);
    interactiveCells = [];

    addLabel(
      group,
      ["RELATIONAL FIELD", "PAIR COVERAGE MATRIX"],
      -5.55,
      3.1,
      3.15,
      "scene-title",
    );
    addLabel(
      group,
      [
        `${current.coveragePercent}% COVERAGE`,
        `${current.coveredCells} / ${current.totalCells} relations cross criterion`,
      ],
      -5.55,
      2.35,
      3.15,
      "scene-summary",
    );

    current.columnLabels.forEach((label, column) => {
      addLabel(
        group,
        [label],
        -5.25 + column * 1.38,
        0.18,
        3.48,
        "axis-label column-label",
      );
    });
    current.rowLabels.forEach((label, row) => {
      addLabel(
        group,
        [label],
        -6.05,
        0.18,
        2.62 - row * 1.38,
        "axis-label row-label",
      );
    });

    current.cells.forEach((cell) => {
      const height = 0.22 + cell.capability * 2.2;
      const geometry = new THREE.BoxGeometry(1.04, height, 1.04);
      const material = new THREE.MeshStandardMaterial({
        color: cell.covered ? 0x2fb99e : 0xe06b47,
        emissive: cell.selected
          ? cell.covered
            ? 0x175d50
            : 0x73301f
          : 0x000000,
        emissiveIntensity: cell.selected ? 1.2 : 0,
        roughness: 0.42,
        metalness: 0.22,
        transparent: true,
        opacity: cell.selected ? 1 : 0.78,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        -5.25 + cell.column * 1.38,
        height / 2,
        2.62 - cell.row * 1.38,
      );
      mesh.userData = {
        sourceId: cell.sourceEntityId,
        targetId: cell.targetEntityId,
      };
      group.add(mesh);
      interactiveCells.push(mesh);
      addLabel(
        group,
        [cell.capabilityLabel, cell.covered ? "covered" : "exposed"],
        mesh.position.x,
        height + 0.23,
        mesh.position.z,
        `cell-label ${cell.covered ? "covered" : "exposed"} ${cell.selected ? "selected" : ""}`,
      );
      if (cell.selected) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.74, 0.035, 12, 64),
          new THREE.MeshBasicMaterial({ color: 0xffc4a8 }),
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(mesh.position.x, 0.08, mesh.position.z);
        group.add(ring);
      }
    });

    const selected = current.selected;
    addLabel(
      group,
      [
        "SELECTED RELATION",
        `${selected.sourceLabel} → ${selected.targetLabel}`,
      ],
      2.7,
      4.8,
      3.15,
      "scene-title relation-title",
    );
    addPanel(
      group,
      [
        `${selected.profileLabel} · ${selected.covered ? "COVERED" : "EXPOSED"}`,
        `POWER ${selected.power}  /  RESILIENCE ${selected.resilience}`,
        `${selected.coordinate} · ${selected.regionLabel} · ${selected.requirement}`,
        `ACCURACY ${selected.accuracy}  ·  EFFECT ${selected.effect}`,
        `PROTECTION FAIL ${selected.protectionFailure}  ·  ${selected.efficiency}`,
      ],
      2.7,
      3.35,
      2.8,
      selected.covered ? 0x2fb99e : 0xe06b47,
    );

    addLabel(
      group,
      ["PIECEWISE MAP", "THRESHOLD REGIONS"],
      1.0,
      1.6,
      0.72,
      "scene-title compact-title",
    );
    current.thresholdRegions.forEach((region, index) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.08, region.active ? 0.55 : 0.22, 0.72),
        new THREE.MeshStandardMaterial({
          color: region.active ? 0xe97750 : 0x24423c,
          emissive: region.active ? 0x642813 : 0x000000,
          emissiveIntensity: 0.8,
          roughness: 0.48,
        }),
      );
      mesh.position.set(0.7 + index * 1.25, region.active ? 0.275 : 0.11, 0.05);
      group.add(mesh);
      addLabel(
        group,
        [region.requirement, region.label],
        mesh.position.x,
        mesh.position.y + 0.52,
        mesh.position.z,
        `threshold-label ${region.active ? "active" : ""}`,
      );
    });

    addLabel(
      group,
      ["FINITE SAMPLE SPACE Ω", "SIX OUTCOME D6"],
      4.7,
      1.2,
      -1.05,
      "scene-title compact-title",
    );
    current.dice.forEach((die, index) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.72, 0.72),
        new THREE.MeshStandardMaterial({
          color: die.success ? 0x2fb99e : 0x293936,
          emissive: die.success ? 0x0e4e43 : 0x000000,
          emissiveIntensity: 0.65,
          roughness: 0.34,
        }),
      );
      mesh.position.set(0.72 + index * 1.03, 0.36, -1.75);
      mesh.rotation.y = index % 2 === 0 ? 0.08 : -0.08;
      group.add(mesh);
      addLabel(
        group,
        [String(die.face), die.success ? "success" : "miss"],
        mesh.position.x,
        0.92,
        mesh.position.z,
        `die-label ${die.success ? "success" : "failure"}`,
      );
    });

    addLabel(
      group,
      ["EXACT EFFECT DISTRIBUTION"],
      5.2,
      0.8,
      -2.78,
      "scene-title compact-title",
    );
    current.distribution.forEach((outcome, index) => {
      const width = Math.max(0.08, outcome.probability * 4.8);
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.18, 0.34),
        new THREE.MeshStandardMaterial({
          color: index === 0 ? 0x45615b : 0xe97750,
          roughness: 0.5,
        }),
      );
      bar.position.set(0.62 + width / 2, 0.12, -3.35 - index * 0.55);
      group.add(bar);
      addLabel(
        group,
        [outcome.label],
        0.35,
        0.48,
        bar.position.z,
        "distribution-label left",
      );
      addLabel(
        group,
        [outcome.probabilityLabel],
        5.82,
        0.48,
        bar.position.z,
        "distribution-label right",
      );
    });

    const holeColor = current.holes.length > 0 ? 0xe06b47 : 0x2fb99e;
    const marker = new THREE.Mesh(
      current.holes.length > 0
        ? new THREE.IcosahedronGeometry(0.62, 1)
        : new THREE.TorusKnotGeometry(0.43, 0.12, 80, 12),
      new THREE.MeshStandardMaterial({
        color: holeColor,
        emissive: current.holes.length > 0 ? 0x5b2114 : 0x0d4e42,
        emissiveIntensity: 1,
        roughness: 0.28,
      }),
    );
    marker.position.set(-4.45, 0.8, -3.25);
    group.add(marker);
    addLabel(
      group,
      current.holes.length > 0
        ? [
            "STRUCTURAL HOLE",
            current.holes.map((hole) => hole.targetLabel).join(" · "),
            `${current.holes[0]?.gap ?? ""} gap to criterion`,
          ]
        : [
            "FIELD CLOSED",
            "Every target region has a response",
            "Counterfactual recomputed exactly",
          ],
      -4.45,
      1.85,
      -3.25,
      `hole-label ${current.holes.length > 0 ? "open" : "closed"}`,
    );

    const selectedCell = current.cells.find((cell) => cell.selected);
    if (selectedCell !== undefined) {
      const points = [
        new THREE.Vector3(
          -5.25 + selectedCell.column * 1.38,
          0.08,
          2.62 - selectedCell.row * 1.38,
        ),
        new THREE.Vector3(-0.1, 0.08, 1.35),
        new THREE.Vector3(0.2, 0.08, -1.75),
      ];
      const link = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: 0xff9a73,
          transparent: true,
          opacity: 0.65,
        }),
      );
      group.add(link);
    }
  }

  function addPanel(
    parent: THREE.Group,
    lines: readonly string[],
    x: number,
    y: number,
    z: number,
    color: number,
  ) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(6.35, 1.35, 0.12),
      new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.24,
      }),
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    addLabel(parent, lines, x, y, z + 0.09, "relation-panel");
  }

  function addLabel(
    parent: THREE.Group,
    lines: readonly string[],
    x: number,
    y: number,
    z: number,
    className: string,
  ) {
    const element = document.createElement("div");
    element.className = className;
    lines.forEach((line) => {
      const span = document.createElement("span");
      span.textContent = line;
      element.append(span);
    });
    const label = new CSS2DObject(element);
    label.position.set(x, y, z);
    parent.add(label);
  }

  function disposeContent() {
    if (content === undefined || scene === undefined) return;
    content.traverse((object) => {
      if (object instanceof CSS2DObject) object.element.remove();
      if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
        const disposable = object as THREE.Object3D & {
          readonly geometry: THREE.BufferGeometry;
          readonly material: THREE.Material | THREE.Material[];
        };
        disposable.geometry.dispose();
        const objectMaterial = disposable.material;
        const materials = Array.isArray(objectMaterial)
          ? objectMaterial
          : [objectMaterial];
        materials.forEach((material) => material.dispose());
      }
    });
    scene.remove(content);
    content = undefined;
    interactiveCells = [];
  }

  function raycast(event: PointerEvent): THREE.Intersection | undefined {
    if (camera === undefined || renderer === undefined) return undefined;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(interactiveCells, false)[0];
  }

  function handlePointerDown(event: PointerEvent) {
    pointerStart = { x: event.clientX, y: event.clientY };
  }

  function handlePointerUp(event: PointerEvent) {
    if (
      Math.hypot(
        event.clientX - pointerStart.x,
        event.clientY - pointerStart.y,
      ) > 5
    )
      return;
    const hit = raycast(event);
    if (hit === undefined) return;
    const userData = hit.object.userData as unknown as {
      readonly sourceId?: unknown;
      readonly targetId?: unknown;
    };
    const sourceId = userData.sourceId;
    const targetId = userData.targetId;
    if (typeof sourceId === "string" && typeof targetId === "string")
      onSelect(sourceId, targetId);
  }

  function handlePointerMove(event: PointerEvent) {
    if (renderer !== undefined)
      renderer.domElement.style.cursor =
        raycast(event) === undefined ? "grab" : "pointer";
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    event.preventDefault();
    const selected =
      model.cells.find((cell) => cell.selected) ?? model.cells[0];
    if (selected === undefined) return;
    const nextRow = Math.max(
      0,
      Math.min(
        model.rowLabels.length - 1,
        selected.row +
          (event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0),
      ),
    );
    const nextColumn = Math.max(
      0,
      Math.min(
        model.columnLabels.length - 1,
        selected.column +
          (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0),
      ),
    );
    const next = model.cells.find(
      (cell) => cell.row === nextRow && cell.column === nextColumn,
    );
    if (next !== undefined) onSelect(next.sourceEntityId, next.targetEntityId);
  }
</script>

<div
  class="scene-mount"
  bind:this={mount}
  role="application"
  aria-label="Interactive three-dimensional force geometry. Drag to orbit, scroll to zoom, and use arrow keys on the canvas to move through matrix cells."
></div>
