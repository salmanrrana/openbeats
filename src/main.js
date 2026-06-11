import * as Tone from "tone";
import { createIcons, icons } from "lucide";
import "./styles.css";

const MAX_STEPS = 32;
const STORAGE_PREFIX = "openbeats-slot-";
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const ROOTS = NOTE_NAMES;

const SCALES = {
  minorPent: { label: "Minor pent", intervals: [0, 3, 5, 7, 10, 12, 15, 17] },
  majorPent: { label: "Major pent", intervals: [0, 2, 4, 7, 9, 12, 14, 16] },
  dorian: { label: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10, 12] },
  phrygian: { label: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10, 12] },
  blues: { label: "Blues", intervals: [0, 3, 5, 6, 7, 10, 12, 15] },
  chroma: { label: "Chromatic", intervals: [0, 1, 2, 3, 4, 5, 6, 7] }
};

const TRACK_DEFS = [
  {
    id: "kick",
    name: "Kick",
    role: "body",
    kind: "drum",
    instrument: "kick",
    color: "oklch(0.74 0.165 91)",
    density: 0.28
  },
  {
    id: "snare",
    name: "Snare",
    role: "snap",
    kind: "drum",
    instrument: "snare",
    color: "oklch(0.66 0.22 348)",
    density: 0.18
  },
  {
    id: "hat",
    name: "Hat",
    role: "metal",
    kind: "drum",
    instrument: "hat",
    color: "oklch(0.78 0.15 72)",
    density: 0.46
  },
  {
    id: "clap",
    name: "Clap",
    role: "noise",
    kind: "drum",
    instrument: "clap",
    color: "oklch(0.71 0.15 18)",
    density: 0.12
  },
  {
    id: "bass",
    name: "Bass",
    role: "square",
    kind: "melodic",
    instrument: "bass",
    color: "oklch(0.72 0.16 145)",
    density: 0.30,
    octave: 2
  },
  {
    id: "lead",
    name: "Lead",
    role: "pulse",
    kind: "melodic",
    instrument: "lead",
    color: "oklch(0.68 0.17 205)",
    density: 0.24,
    octave: 4
  },
  {
    id: "arp",
    name: "Arp",
    role: "needle",
    kind: "melodic",
    instrument: "arp",
    color: "oklch(0.70 0.19 285)",
    density: 0.34,
    octave: 5
  },
  {
    id: "chord",
    name: "Chord",
    role: "stack",
    kind: "melodic",
    instrument: "chord",
    color: "oklch(0.72 0.13 175)",
    density: 0.14,
    octave: 3
  },
  {
    id: "zap",
    name: "Zap",
    role: "fx",
    kind: "melodic",
    instrument: "zap",
    color: "oklch(0.72 0.18 35)",
    density: 0.10,
    octave: 5
  }
];

const PRESETS = [
  { id: "bossDoor", name: "Boss Door", bpm: 118, root: "G", scale: "minorPent", color: "oklch(0.74 0.165 91)" },
  { id: "neonRun", name: "Neon Run", bpm: 124, root: "A", scale: "dorian", color: "oklch(0.68 0.17 205)" },
  { id: "ghostCart", name: "Ghost Cart", bpm: 104, root: "D", scale: "blues", color: "oklch(0.70 0.19 285)" },
  { id: "coinStorm", name: "Coin Storm", bpm: 132, root: "C", scale: "majorPent", color: "oklch(0.78 0.15 72)" }
];

// The sound machine. Our signature callouts ported from the drum sampler
// project sit on the number row — press 1-9, 0, - or = to fire them
// instantly. They preload on boot, no extra clicks needed.
const PAD_KEYS = [
  { key: "1", code: "Digit1" },
  { key: "2", code: "Digit2" },
  { key: "3", code: "Digit3" },
  { key: "4", code: "Digit4" },
  { key: "5", code: "Digit5" },
  { key: "6", code: "Digit6" },
  { key: "7", code: "Digit7" },
  { key: "8", code: "Digit8" },
  { key: "9", code: "Digit9" },
  { key: "0", code: "Digit0" },
  { key: "-", code: "Minus" },
  { key: "=", code: "Equal" }
];

const KIT_PAD_DEFS = [
  { name: "I'm a scientist", url: "/sounds/drum_sampler/scientist.m4a", hue: 91 },
  { name: "another one", url: "/sounds/drum_sampler/anotherone.m4a", hue: 205 },
  { name: "boy good", url: "/sounds/drum_sampler/boygood.m4a", hue: 348 },
  { name: "start the show", url: "/sounds/drum_sampler/start_the_show.m4a", hue: 285 },
  { name: "mama", url: "/sounds/drum_sampler/mama.m4a", hue: 145 },
  { name: "fiestas", url: "/sounds/drum_sampler/fiestas.m4a", hue: 35 },
  { name: "chikaa", url: "/sounds/drum_sampler/chikaa.m4a", hue: 72 },
  { name: "synth", url: "/sounds/drum_sampler/synth.m4a", hue: 250 },
  { name: "kick", url: "/sounds/drum_sampler/kick.wav", hue: 18 },
  { name: "snare", url: "/sounds/drum_sampler/snare.wav", hue: 320 },
  { name: "clap", url: "/sounds/drum_sampler/clap.wav", hue: 175 },
  { name: "open hat", url: "/sounds/drum_sampler/openhat.wav", hue: 60 }
];

const EXTRA_PAD_DEFS = [
  { name: "hat", url: "/sounds/drum_sampler/hihat.wav", hue: 110 },
  { name: "boom", url: "/sounds/drum_sampler/boom.wav", hue: 15 },
  { name: "tom", url: "/sounds/drum_sampler/tom.wav", hue: 230 },
  { name: "tink", url: "/sounds/drum_sampler/tink.wav", hue: 300 },
  { name: "ride", url: "/sounds/drum_sampler/ride.wav", hue: 80 }
];

const MAX_USER_PADS = 12;

const THEMES = [
  { id: "arcade", name: "Arcade", blurb: "neon CRT glow" },
  { id: "studio", name: "Studio", blurb: "clean hardware" },
  { id: "concrete", name: "Concrete", blurb: "raw and loud" },
  { id: "candy", name: "Candy", blurb: "soft and playful" }
];
const THEME_STORAGE_KEY = "openbeats-theme";

const effectFields = [
  { id: "crush", label: "Crush", min: 2, max: 12, step: 1 },
  { id: "drive", label: "Drive", min: 0, max: 0.9, step: 0.01 },
  { id: "delay", label: "Delay", min: 0, max: 0.65, step: 0.01 },
  { id: "reverb", label: "Room", min: 0, max: 0.65, step: 0.01 },
  { id: "tone", label: "Tone", min: 1200, max: 12000, step: 50 }
];

let state = createInitialState();
let audio = null;
let transportEvent = null;
let rafId = 0;
let previousStep = -1;
let toastTimer = null;
let userPadReplaceIndex = 0;
let theme = loadStoredTheme();

const kitPads = KIT_PAD_DEFS.map((def, index) => makePad(def, { key: PAD_KEYS[index] }));
const extraPads = EXTRA_PAD_DEFS.map((def) => makePad(def));
const userPads = [];

const PAD_KEY_LOOKUP = Object.fromEntries(PAD_KEYS.map((entry, index) => [entry.code, index]));

function makePad(def, { key = null } = {}) {
  return {
    name: def.name,
    url: def.url,
    hue: def.hue ?? 205,
    key,
    player: null,
    ready: false,
    failed: false,
    connected: false,
    objectUrl: false
  };
}

function loadStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES.some((item) => item.id === stored) ? stored : THEMES[0].id;
  } catch {
    return THEMES[0].id;
  }
}

function createInitialState() {
  return {
    playing: false,
    bpm: 148,
    swing: 10,
    humanize: 4,
    root: "G",
    scale: "minorPent",
    steps: 16,
    currentStep: -1,
    selectedSlot: 1,
    effects: {
      crush: 7,
      drive: 0.22,
      delay: 0.18,
      reverb: 0.22,
      tone: 7800
    },
    tracks: TRACK_DEFS.map((def) => ({
      id: def.id,
      muted: false,
      solo: false,
      cells: Array.from({ length: MAX_STEPS }, (_, step) => ({
        on: false,
        accent: false,
        degree: seedDegree(def, step)
      }))
    }))
  };
}

function seedDegree(def, step) {
  const motifs = {
    bass: [0, 0, 2, 0, 3, 2, 4, 2],
    lead: [7, 5, 4, 2, 3, 5, 7, 8],
    arp: [0, 2, 4, 7, 4, 2, 5, 7],
    chord: [0, 3, 4, 2, 0, 5, 3, 4],
    zap: [7, 9, 5, 11, 6, 10, 4, 8]
  };
  const motif = motifs[def.instrument] || [0, 2, 4, 5, 7, 5, 4, 2];
  return motif[step % motif.length];
}

function renderApp() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <main class="app-shell ${state.playing ? "is-playing" : ""}" style="--steps: ${state.steps}">
      <header class="top-bar">
        <div class="brand-lockup">
      <h1 class="app-title">Openbeats</h1>
          <div class="status-line">
            <span class="status-pill"><span class="status-dot"></span>${state.playing ? "playing" : "idle"}</span>
            <span class="status-pill">${state.root} ${SCALES[state.scale].label}</span>
            <span class="status-pill">${state.bpm} bpm</span>
          </div>
        </div>
        <nav class="theme-switch" aria-label="Choose a look">
          ${THEMES.map((item) => `
            <button class="theme-tab ${item.id === theme ? "active" : ""}" type="button" data-theme-pick="${item.id}" title="${item.blurb}" aria-pressed="${item.id === theme}">
              <span class="theme-dot" aria-hidden="true"></span>${item.name}
            </button>
          `).join("")}
        </nav>
      </header>

      <section class="transport" aria-label="Sequencer transport">
        <div class="transport-panel">
          <div class="transport-buttons">
            <button class="icon-button primary" id="playBtn" type="button" title="${state.playing ? "Stop" : "Play"}" aria-label="${state.playing ? "Stop" : "Play"}">
              <i data-lucide="${state.playing ? "square" : "play"}"></i>
            </button>
            <button class="icon-button" id="restartBtn" type="button" title="Restart" aria-label="Restart">
              <i data-lucide="rotate-ccw"></i>
            </button>
            <button class="icon-button" id="nudgeBtn" type="button" title="Nudge pattern" aria-label="Nudge pattern">
              <i data-lucide="skip-forward"></i>
            </button>
            <button class="icon-button danger" id="panicBtn" type="button" title="Panic stop" aria-label="Panic stop">
              <i data-lucide="zap"></i>
            </button>
          </div>
          <div class="controls-grid">
            <div class="field">
              <label for="bpmInput">BPM</label>
              <input class="number-field" id="bpmInput" type="number" min="60" max="240" value="${state.bpm}" />
            </div>
            <div class="field">
              <label for="swingInput">Swing <span id="swingValue">${state.swing}%</span></label>
              <input id="swingInput" type="range" min="0" max="55" value="${state.swing}" />
            </div>
            <div class="field">
              <label for="rootSelect">Root</label>
              <select class="select-field" id="rootSelect">
                ${ROOTS.map((root) => `<option value="${root}" ${root === state.root ? "selected" : ""}>${root}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label for="scaleSelect">Scale</label>
              <select class="select-field" id="scaleSelect">
                ${Object.entries(SCALES).map(([id, scale]) => `<option value="${id}" ${id === state.scale ? "selected" : ""}>${scale.label}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>

        <div class="meter-panel">
          <div class="scope-wrap">
            <span class="section-label">Scope</span>
            <canvas class="scope" id="scope" width="420" height="90" aria-label="Audio waveform"></canvas>
          </div>
          <div class="readout-stack">
            <span class="readout-value" id="stepReadout">${formatStepReadout()}</span>
            <span class="readout-sub">${state.bpm} BPM</span>
          </div>
        </div>
      </section>

      ${renderSoundboardPanel()}

      <section class="workbench">
        <div class="work-panel">
          <div class="panel-header">
            <h2 class="panel-title">Pattern grid</h2>
            <div class="toolbar" aria-label="Grid controls">
              <button class="chip-button ${state.steps === 16 ? "active" : ""}" type="button" data-steps="16">16</button>
              <button class="chip-button ${state.steps === 32 ? "active" : ""}" type="button" data-steps="32">32</button>
              <button class="chip-button" id="compactBtn" type="button" title="Random sparse pattern"><i data-lucide="circle-dot"></i>Sparse</button>
              <button class="chip-button" id="denseBtn" type="button" title="Random dense pattern"><i data-lucide="sparkles"></i>Dense</button>
            </div>
          </div>
          <div class="sequencer-scroll" id="sequencerGrid" style="--steps: ${state.steps}"></div>
        </div>

        <aside class="side-panel" aria-label="Sequencer tools">
          <section class="side-section start-section">
            <button class="start-button original" id="originalBtn" type="button">
              <i data-lucide="disc-3"></i>
              <span class="start-copy">
                <span class="start-name">Load the original</span>
                <span class="start-sub">our signature groove, ready to roll</span>
              </span>
            </button>
            <button class="start-button fresh" id="freshBtn" type="button">
              <i data-lucide="plus"></i>
              <span class="start-copy">
                <span class="start-name">Start fresh</span>
                <span class="start-sub">empty grid, build your own</span>
              </span>
            </button>
          </section>

          <section class="side-section">
            <div class="section-head">
              <h2 class="section-title">Build</h2>
              <span class="tool-label">pattern</span>
            </div>
            <div class="button-grid">
              <button class="text-button primary" id="randomBtn" type="button"><i data-lucide="dice-5"></i>Surprise me</button>
              <button class="text-button" id="mutateBtn" type="button"><i data-lucide="wand-sparkles"></i>Mutate</button>
              <button class="text-button" id="clearBtn" type="button"><i data-lucide="trash-2"></i>Clear</button>
              <button class="text-button" id="dupeBtn" type="button"><i data-lucide="copy"></i>Double</button>
            </div>
          </section>

          <details class="side-section advanced">
            <summary class="advanced-summary">
              <span class="section-title">More controls</span>
              <i data-lucide="chevron-down"></i>
            </summary>

            <div class="advanced-body">
              <div class="advanced-group">
                <span class="tool-label">Starters</span>
                <div class="pattern-list">
                  ${PRESETS.map((preset) => `
                    <button class="preset-button" type="button" data-preset="${preset.id}" style="--track: ${preset.color}">
                      <span class="preset-dot"></span>
                      <span class="preset-name">${preset.name}</span>
                      <span class="preset-tempo">${preset.bpm}</span>
                    </button>
                  `).join("")}
                </div>
              </div>

              <div class="advanced-group">
                <span class="tool-label">Save &amp; share</span>
                <div class="slot-grid">
                  ${[1, 2, 3, 4].map((slot) => `
                    <button class="slot-button ${slot === state.selectedSlot ? "active" : ""}" type="button" data-slot="${slot}" title="${hasSlot(slot) ? "Load slot" : "Select slot"}">${slot}${hasSlot(slot) ? "*" : ""}</button>
                  `).join("")}
                </div>
                <div class="button-grid">
                  <button class="text-button" id="saveBtn" type="button"><i data-lucide="save"></i>Save</button>
                  <button class="text-button" id="shareBtn" type="button"><i data-lucide="share-2"></i>Share</button>
                  <button class="text-button" id="exportBtn" type="button"><i data-lucide="download"></i>Export</button>
                  <button class="text-button" id="importBtn" type="button"><i data-lucide="upload"></i>Import</button>
                </div>
                <input class="sr-only" id="importFile" type="file" accept="application/json,.json" />
              </div>

              <div class="advanced-group">
                <span class="tool-label">Sound shaping</span>
                <div class="effect-grid">
                  ${effectFields.map((field) => `
                    <label class="effect-row" for="effect-${field.id}">
                      <span>${field.label}</span>
                      <input id="effect-${field.id}" data-effect="${field.id}" type="range" min="${field.min}" max="${field.max}" step="${field.step}" value="${state.effects[field.id]}" />
                      <span class="effect-value" id="effect-value-${field.id}">${formatEffectValue(field.id)}</span>
                    </label>
                  `).join("")}
                  <label class="effect-row" for="humanizeInput">
                    <span>Loose</span>
                    <input id="humanizeInput" type="range" min="0" max="30" value="${state.humanize}" />
                    <span class="effect-value" id="humanizeValue">${state.humanize}</span>
                  </label>
                </div>
              </div>
            </div>
          </details>
        </aside>
      </section>
    </main>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  `;

  bindControls();
  renderGrid();
  refreshIcons();
  drawScopeFrame();
}

function renderSoundboardPanel() {
  return `
    <section class="soundboard-panel" id="soundboardPanel" aria-label="Sound machine">
      <div class="panel-header soundboard-header">
        <div>
          <h2 class="panel-title">Sound machine</h2>
          <p class="panel-note">Smash <kbd>1</kbd>–<kbd>9</kbd> <kbd>0</kbd> <kbd>-</kbd> <kbd>=</kbd> on your keyboard, or tap a pad.</p>
        </div>
        <div class="toolbar" aria-label="Soundboard controls">
          <button class="chip-button" id="boardRandomBtn" type="button" title="Trigger random sound"><i data-lucide="shuffle"></i>Blast</button>
          <button class="chip-button" id="boardStopBtn" type="button" title="Stop soundboard clips"><i data-lucide="octagon-x"></i>Stop</button>
          <label class="chip-button file-button" for="soundImport" title="Load MP3 or WAV clips"><i data-lucide="folder-input"></i>Add sounds</label>
          <input class="sr-only" id="soundImport" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a" multiple />
        </div>
      </div>
      <div class="pad-grid">
        ${kitPads.map((pad, index) => renderPadButton(pad, "kit", index)).join("")}
      </div>
      <div class="extra-strip" aria-label="Extra sounds">
        ${extraPads.map((pad, index) => renderPadButton(pad, "extra", index)).join("")}
        ${userPads.map((pad, index) => renderPadButton(pad, "user", index)).join("")}
      </div>
    </section>
  `;
}

function renderPadButton(pad, bank, index) {
  const stateClass = pad.failed ? "failed" : pad.ready ? "ready" : "loading";
  const keyLabel = pad.key ? pad.key.key : bank === "user" ? "you" : "+";
  return `
    <button
      class="sound-pad ${bank} ${stateClass}"
      type="button"
      data-pad-bank="${bank}"
      data-pad-index="${index}"
      style="--pad-h: ${pad.hue}"
      aria-label="Play ${escapeHtml(pad.name)}"
      ${pad.failed ? "disabled" : ""}
    >
      <span class="pad-key">${escapeHtml(keyLabel)}</span>
      <span class="pad-name">${escapeHtml(pad.name)}</span>
      <span class="pad-state">${pad.failed ? "missing" : pad.ready ? "ready" : "loading"}</span>
    </button>
  `;
}

function renderGrid() {
  const grid = document.querySelector("#sequencerGrid");
  if (!grid) return;

  grid.style.setProperty("--steps", state.steps);
  const ruler = `
    <div class="step-ruler">
      <div class="step-ruler-label"></div>
      ${Array.from({ length: state.steps }, (_, index) => `
        <div class="step-number ${index % 4 === 0 ? "downbeat" : ""} ${index === state.currentStep ? "playing" : ""}" data-ruler-step="${index}">
          ${String(index + 1).padStart(2, "0")}
        </div>
      `).join("")}
    </div>
  `;

  const rows = state.tracks.map((track) => {
    const def = getTrackDef(track.id);
    return `
      <div class="track-row" data-track-row="${track.id}" style="--track: ${def.color}">
        <div class="track-strip">
          <span class="track-color" aria-hidden="true"></span>
          <span class="track-copy">
            <span class="track-name">${def.name}</span>
            <span class="track-role">${def.role}</span>
          </span>
          <button class="mini-toggle ${track.muted ? "active" : ""}" type="button" data-track-toggle="${track.id}" data-toggle-kind="muted" title="Mute ${def.name}" aria-label="Mute ${def.name}" aria-pressed="${track.muted}">M</button>
          <button class="mini-toggle ${track.solo ? "active" : ""}" type="button" data-track-toggle="${track.id}" data-toggle-kind="solo" title="Solo ${def.name}" aria-label="Solo ${def.name}" aria-pressed="${track.solo}">S</button>
        </div>
        ${track.cells.slice(0, state.steps).map((cell, step) => renderCell(def, track, cell, step)).join("")}
      </div>
    `;
  }).join("");

  grid.innerHTML = `${ruler}<div class="tracks">${rows}</div>`;
}

function renderCell(def, track, cell, step) {
  const activeClass = cell.on ? (cell.accent ? "accent" : "on") : "";
  const playheadClass = step === state.currentStep ? "playhead" : "";
  const downbeatClass = step % 4 === 0 ? "downbeat" : "";
  const label = `${def.name} step ${step + 1}`;
  const content = cell.on
    ? `<span class="cell-note">${def.kind === "melodic" ? formatDegree(cell.degree) : cell.accent ? "A" : ""}</span><span class="cell-energy"></span>`
    : "";

  return `
    <button
      class="step-cell ${activeClass} ${playheadClass} ${downbeatClass}"
      type="button"
      data-track="${track.id}"
      data-step="${step}"
      aria-label="${label}"
      aria-pressed="${cell.on}"
      title="${label}"
    >${content}</button>
  `;
}

function bindControls() {
  document.querySelector("#playBtn")?.addEventListener("click", () => {
    if (state.playing) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });

  document.querySelector("#restartBtn")?.addEventListener("click", async () => {
    if (state.playing) {
      stopPlayback(false);
      await startPlayback();
    } else {
      state.currentStep = -1;
      updatePlayhead(-1);
      toast("Restarted");
    }
  });

  document.querySelector("#panicBtn")?.addEventListener("click", () => panicStop());
  document.querySelector("#nudgeBtn")?.addEventListener("click", () => nudgePattern(1));
  document.querySelector("#originalBtn")?.addEventListener("click", () => loadSignature({ play: true }));
  document.querySelector("#freshBtn")?.addEventListener("click", () => startFresh());
  document.querySelector("#randomBtn")?.addEventListener("click", () => randomizePattern("balanced"));
  document.querySelector("#compactBtn")?.addEventListener("click", () => randomizePattern("sparse"));
  document.querySelector("#denseBtn")?.addEventListener("click", () => randomizePattern("dense"));
  document.querySelector("#mutateBtn")?.addEventListener("click", () => mutatePattern());
  document.querySelector("#clearBtn")?.addEventListener("click", () => clearPattern());
  document.querySelector("#dupeBtn")?.addEventListener("click", () => doublePattern());
  document.querySelector("#saveBtn")?.addEventListener("click", () => saveSelectedSlot());
  document.querySelector("#shareBtn")?.addEventListener("click", () => sharePattern());
  document.querySelector("#exportBtn")?.addEventListener("click", () => exportPattern());
  document.querySelector("#importBtn")?.addEventListener("click", () => document.querySelector("#importFile")?.click());
  document.querySelector("#boardRandomBtn")?.addEventListener("click", () => triggerRandomPad());
  document.querySelector("#boardStopBtn")?.addEventListener("click", () => stopSoundboard());

  document.querySelector("#importFile")?.addEventListener("change", importPattern);
  document.querySelector("#soundImport")?.addEventListener("change", importSoundboardSamples);

  document.querySelector("#bpmInput")?.addEventListener("input", (event) => {
    state.bpm = clamp(Math.round(Number(event.target.value) || 120), 60, 240);
    applyTransportSettings();
    updateReadouts();
  });

  document.querySelector("#swingInput")?.addEventListener("input", (event) => {
    state.swing = clamp(Math.round(Number(event.target.value) || 0), 0, 55);
    document.querySelector("#swingValue").textContent = `${state.swing}%`;
    applyTransportSettings();
  });

  document.querySelector("#rootSelect")?.addEventListener("change", (event) => {
    state.root = event.target.value;
    renderApp();
  });

  document.querySelector("#scaleSelect")?.addEventListener("change", (event) => {
    state.scale = event.target.value;
    renderApp();
  });

  document.querySelector("#humanizeInput")?.addEventListener("input", (event) => {
    state.humanize = clamp(Math.round(Number(event.target.value) || 0), 0, 30);
    document.querySelector("#humanizeValue").textContent = state.humanize;
  });

  document.querySelectorAll("[data-steps]").forEach((button) => {
    button.addEventListener("click", () => {
      state.steps = Number(button.dataset.steps);
      state.currentStep = -1;
      renderApp();
    });
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => loadPreset(button.dataset.preset));
  });

  document.querySelectorAll("[data-slot]").forEach((button) => {
    button.addEventListener("click", () => {
      const slot = Number(button.dataset.slot);
      state.selectedSlot = slot;
      if (hasSlot(slot)) {
        loadSlot(slot);
      } else {
        renderApp();
        toast(`Slot ${slot} selected`);
      }
    });
  });

  document.querySelectorAll("[data-effect]").forEach((input) => {
    input.addEventListener("input", () => {
      const id = input.dataset.effect;
      state.effects[id] = Number(input.value);
      document.querySelector(`#effect-value-${id}`).textContent = formatEffectValue(id);
      applyEffects();
    });
  });

  const grid = document.querySelector("#sequencerGrid");
  grid?.addEventListener("click", onGridClick);
  grid?.addEventListener("contextmenu", onGridContext);
  grid?.addEventListener("wheel", onGridWheel, { passive: false });

  document.querySelectorAll("[data-pad-bank]").forEach((button) => {
    button.addEventListener("click", () => playPad(button.dataset.padBank, Number(button.dataset.padIndex)));
  });

  document.querySelectorAll("[data-theme-pick]").forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.themePick));
  });
}

function applyTheme(id, { render = true } = {}) {
  theme = THEMES.some((item) => item.id === id) ? id : THEMES[0].id;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // private mode — theme just won't persist
  }
  if (render) renderApp();
}

function onGridClick(event) {
  const toggle = event.target.closest("[data-track-toggle]");
  if (toggle) {
    const track = getTrackState(toggle.dataset.trackToggle);
    track[toggle.dataset.toggleKind] = !track[toggle.dataset.toggleKind];
    renderGrid();
    return;
  }

  const button = event.target.closest(".step-cell");
  if (!button) return;

  const track = getTrackState(button.dataset.track);
  const def = getTrackDef(track.id);
  const step = Number(button.dataset.step);
  const cell = track.cells[step];

  if (!cell.on) {
    cell.on = true;
    cell.accent = false;
  } else if (!cell.accent) {
    cell.accent = true;
  } else {
    cell.on = false;
    cell.accent = false;
  }

  renderGrid();
  auditionCell(def, track, cell);
}

function onGridContext(event) {
  const button = event.target.closest(".step-cell");
  if (!button) return;
  const track = getTrackState(button.dataset.track);
  const def = getTrackDef(track.id);
  if (def.kind !== "melodic") return;

  event.preventDefault();
  const step = Number(button.dataset.step);
  const cell = track.cells[step];
  cell.on = true;
  cell.degree = wrapDegree(cell.degree + 1);
  renderGrid();
  auditionCell(def, track, cell);
}

function onGridWheel(event) {
  const button = event.target.closest(".step-cell");
  if (!button) return;
  const track = getTrackState(button.dataset.track);
  const def = getTrackDef(track.id);
  if (def.kind !== "melodic") return;

  event.preventDefault();
  const step = Number(button.dataset.step);
  const cell = track.cells[step];
  cell.on = true;
  cell.degree = wrapDegree(cell.degree + (event.deltaY < 0 ? 1 : -1));
  renderGrid();
}

async function startPlayback() {
  await Tone.start();
  await ensureAudio();

  if (state.playing) return;
  Tone.Transport.cancel();
  state.currentStep = -1;
  previousStep = -1;
  applyTransportSettings();
  transportEvent = Tone.Transport.scheduleRepeat((time) => {
    const nextStep = (state.currentStep + 1) % state.steps;
    playStep(nextStep, time);
  }, "16n");
  Tone.Transport.start("+0.04");
  state.playing = true;
  renderApp();
  startScope();
}

function stopPlayback(render = true) {
  if (transportEvent !== null) {
    Tone.Transport.clear(transportEvent);
    transportEvent = null;
  }
  Tone.Transport.stop();
  Tone.Transport.cancel();
  state.playing = false;
  state.currentStep = -1;
  previousStep = -1;
  cancelAnimationFrame(rafId);
  if (render) {
    renderApp();
  }
}

function panicStop() {
  stopPlayback();
  stopSoundboard(false);
  if (audio) {
    Object.values(audio.instruments).forEach((instrument) => releaseInstrument(instrument));
  }
  toast("Stopped");
}

function releaseInstrument(instrument) {
  if (!instrument) return;
  if (typeof instrument.releaseAll === "function") {
    instrument.releaseAll();
    return;
  }
  if (typeof instrument.triggerRelease === "function") {
    instrument.triggerRelease();
    return;
  }
  // Layered drums are plain objects holding their component synths.
  Object.values(instrument).forEach((part) => releaseInstrument(part));
}

function getPadBank(bank) {
  if (bank === "kit") return kitPads;
  if (bank === "extra") return extraPads;
  return userPads;
}

function allPads() {
  return [...kitPads, ...extraPads, ...userPads];
}

// Kick off buffer loading for the built-in kit immediately. Decoding works
// even while the AudioContext is still suspended, so by the time the user
// presses a key the samples are already in memory.
function preloadKitPads() {
  [...kitPads, ...extraPads].forEach((pad) => loadPadPlayer(pad));
}

function loadPadPlayer(pad) {
  pad.player = new Tone.Player();
  pad.player.fadeOut = 0.01;
  connectPad(pad);
  pad.player.load(pad.url)
    .then(() => {
      pad.ready = true;
      updatePadElement(pad);
    })
    .catch(() => {
      pad.failed = true;
      updatePadElement(pad);
    });
}

function connectPad(pad) {
  if (!pad.player || pad.connected || !audio) return;
  pad.player.connect(audio.soundboard.bus);
  pad.connected = true;
}

function connectAllPads() {
  allPads().forEach((pad) => connectPad(pad));
}

function updatePadElement(pad) {
  const bank = kitPads.includes(pad) ? "kit" : extraPads.includes(pad) ? "extra" : "user";
  const index = getPadBank(bank).indexOf(pad);
  const element = document.querySelector(`[data-pad-bank="${bank}"][data-pad-index="${index}"]`);
  if (!element) return;
  element.classList.remove("loading", "ready", "failed");
  element.classList.add(pad.failed ? "failed" : pad.ready ? "ready" : "loading");
  element.querySelector(".pad-state").textContent = pad.failed ? "missing" : pad.ready ? "ready" : "loading";
  if (pad.failed) element.setAttribute("disabled", "true");
}

async function playPad(bank, index) {
  const pad = getPadBank(bank)[index];
  if (!pad || pad.failed || !pad.player) return;
  await Tone.start();
  await ensureAudio();
  connectPad(pad);
  if (!pad.ready) return;
  pad.player.stop();
  pad.player.start(Tone.now());
  pulseElement(document.querySelector(`[data-pad-bank="${bank}"][data-pad-index="${index}"]`));
}

async function triggerRandomPad() {
  const ready = allPads().filter((pad) => pad.ready);
  if (!ready.length) return;
  const pad = randomChoice(ready);
  const bank = kitPads.includes(pad) ? "kit" : extraPads.includes(pad) ? "extra" : "user";
  await playPad(bank, getPadBank(bank).indexOf(pad));
}

async function importSoundboardSamples(event) {
  const files = Array.from(event.target.files || []).filter((file) => {
    return file.type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a)$/i.test(file.name);
  });
  event.target.value = "";
  if (!files.length) {
    toast("No audio files found");
    return;
  }

  for (const file of files) {
    const pad = makePad({
      name: file.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 36),
      url: URL.createObjectURL(file),
      hue: Math.floor(Math.random() * 360)
    });
    pad.objectUrl = true;
    if (userPads.length < MAX_USER_PADS) {
      userPads.push(pad);
    } else {
      const slot = userPadReplaceIndex % MAX_USER_PADS;
      userPadReplaceIndex += 1;
      const existing = userPads[slot];
      existing.player?.dispose();
      if (existing.objectUrl) URL.revokeObjectURL(existing.url);
      userPads[slot] = pad;
    }
    loadPadPlayer(pad);
  }
  renderApp();
  toast(`Added ${files.length} sound${files.length === 1 ? "" : "s"}`);
}

function stopSoundboard(showToast = true) {
  allPads().forEach((pad) => pad.player?.stop());
  if (showToast) toast("Soundboard stopped");
}

function pulseElement(element) {
  if (!element) return;
  element.classList.remove("triggered");
  void element.offsetWidth;
  element.classList.add("triggered");
}

function playStep(step, time) {
  state.currentStep = step;
  const soloed = state.tracks.some((track) => track.solo);

  state.tracks.forEach((track) => {
    const def = getTrackDef(track.id);
    const cell = track.cells[step];
    if (!cell.on || track.muted || (soloed && !track.solo)) return;

    const loose = (state.humanize / 1000) * randomBetween(-1, 1);
    const velocity = cell.accent ? 1 : 0.72;
    const triggerTime = Math.max(time + loose, time);
    try {
      triggerTrack(def, track, cell, triggerTime, velocity);
    } catch {
      // Overlapping retrigger on a mono envelope (extreme tempo + humanize
      // jitter) — drop this hit rather than crash the transport callback.
    }
    Tone.Draw.schedule(() => pulseCell(track.id, step), triggerTime);
  });

  Tone.Draw.schedule(() => updatePlayhead(step), time);
}

async function auditionCell(def, track, cell) {
  if (!cell.on) return;
  await Tone.start();
  await ensureAudio();
  try {
    triggerTrack(def, track, cell, Tone.now() + 0.015, cell.accent ? 1 : 0.72);
  } catch {
    // Rapid re-click can land inside the previous hit's envelope — skip.
  }
}

function triggerTrack(def, track, cell, time, velocity) {
  if (!audio) return;
  const instrument = audio.instruments[track.id];
  const accentGain = cell.accent ? 1 : 0.82;
  const v = clamp(velocity * accentGain, 0.05, 1);

  if (def.instrument === "kick") {
    instrument.drum.triggerAttackRelease(cell.accent ? "C1" : "A0", "8n", time, v);
    instrument.click.triggerAttackRelease("64n", time, v * 0.5);
    return;
  }
  if (def.instrument === "snare") {
    instrument.noise.triggerAttackRelease("16n", time, v * 0.95);
    instrument.body.triggerAttackRelease(cell.accent ? "A2" : "G2", "16n", time, v * 0.6);
    return;
  }
  if (def.instrument === "hat") {
    instrument.triggerAttackRelease(cell.accent ? "16n" : "32n", time, v * 0.55);
    return;
  }
  if (def.instrument === "clap") {
    // Three staggered bursts — the classic 909 clap trick. The first two are
    // the "hand spread", the last one rings out. Durations are absolute
    // seconds (not note values) so each burst releases before the next
    // attack regardless of tempo.
    instrument.triggerAttackRelease(0.01, time, v * 0.45);
    instrument.triggerAttackRelease(0.01, time + 0.013, v * 0.38);
    instrument.triggerAttackRelease(0.06, time + 0.026, v * 0.7);
    return;
  }

  const note = noteFromDegree(def, cell.degree);
  if (def.instrument === "bass") {
    instrument.triggerAttackRelease(note, cell.accent ? "8n" : "16n", time, v * 0.85);
  } else if (def.instrument === "lead") {
    instrument.triggerAttackRelease(note, cell.accent ? "8n" : "16n", time, v * 0.62);
  } else if (def.instrument === "arp") {
    instrument.triggerAttackRelease(noteFromDegree(def, cell.degree + (cell.accent ? 7 : 0)), "32n", time, v * 0.56);
  } else if (def.instrument === "chord") {
    const chord = [0, 2, 4].map((offset) => noteFromDegree(def, cell.degree + offset));
    instrument.triggerAttackRelease(chord, "8n", time, v * 0.36);
  } else if (def.instrument === "zap") {
    instrument.frequency.setValueAtTime(noteToFrequency(note), time);
    instrument.frequency.exponentialRampToValueAtTime(noteToFrequency(note) * 0.35, time + 0.09);
    instrument.triggerAttackRelease(note, "32n", time, v * 0.48);
  }
}

async function ensureAudio() {
  if (audio) return audio;

  const master = new Tone.Gain(0.9);
  const filter = new Tone.Filter({ type: "lowpass", frequency: state.effects.tone, rolloff: -12 });
  const crusher = new Tone.BitCrusher(state.effects.crush);
  crusher.wet.value = 0.22;
  const drive = new Tone.Distortion(state.effects.drive);
  drive.wet.value = 0.18;
  const delay = new Tone.FeedbackDelay("8n", 0.28);
  delay.wet.value = state.effects.delay;
  const reverb = new Tone.Reverb(2.2);
  reverb.wet.value = state.effects.reverb;
  // Glue stage: shelf EQ adds weight down low and air up top, then a
  // slow-attack compressor lets the transient spike through before it
  // clamps the body — that gap is what reads as "punch".
  const eq = new Tone.EQ3({ low: 3.5, mid: 0, high: 1.5 });
  const comp = new Tone.Compressor({ threshold: -14, ratio: 3, attack: 0.016, release: 0.16, knee: 10 });
  const limiter = new Tone.Limiter(-0.6);
  const analyser = new Tone.Analyser("waveform", 256);

  master.chain(filter, crusher, drive, delay, reverb, eq, comp, limiter, Tone.Destination);
  limiter.connect(analyser);

  const buses = {};
  const instruments = {};
  TRACK_DEFS.forEach((def) => {
    const bus = new Tone.Volume(trackDefaultDb(def)).connect(master);
    buses[def.id] = bus;
    instruments[def.id] = createInstrument(def, bus);
  });
  // Sample pads bypass the sequencer's crush/delay chain so callouts stay
  // crisp — they get their own fast compressor straight into the limiter.
  const boardComp = new Tone.Compressor({ threshold: -15, ratio: 4, attack: 0.003, release: 0.1 });
  const boardBus = new Tone.Volume(1);
  boardBus.chain(boardComp, limiter);
  const soundboard = { bus: boardBus, comp: boardComp };

  audio = { master, filter, crusher, drive, delay, reverb, eq, comp, limiter, analyser, buses, instruments, soundboard };
  connectAllPads();
  await reverb.generate();
  applyEffects();
  return audio;
}

function createInstrument(def, destination) {
  // Drums are layered: a tuned body plus a transient layer. The click/crack
  // on top is what makes a synth drum feel like it hits instead of hums.
  if (def.instrument === "kick") {
    return {
      drum: new Tone.MembraneSynth({
        pitchDecay: 0.048,
        octaves: 10,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.52, sustain: 0.01, release: 0.4 }
      }).connect(destination),
      click: new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.018, sustain: 0, release: 0.01 }
      }).connect(destination)
    };
  }

  if (def.instrument === "snare") {
    return {
      noise: new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.17, sustain: 0, release: 0.08 }
      }).connect(destination),
      body: new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 3,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.09, sustain: 0, release: 0.03 }
      }).connect(destination)
    };
  }

  if (def.instrument === "hat") {
    return new Tone.MetalSynth({
      frequency: 360,
      envelope: { attack: 0.001, decay: 0.07, release: 0.03 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 6200,
      octaves: 1.6
    }).connect(destination);
  }

  if (def.instrument === "clap") {
    return new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.1 }
    }).connect(destination);
  }

  if (def.instrument === "bass") {
    // MonoSynth with a snappy filter envelope — the squelch on each note
    // attack carries way more weight than the old soft FM sine.
    return new Tone.MonoSynth({
      oscillator: { type: "fatsawtooth", count: 2, spread: 14 },
      envelope: { attack: 0.002, decay: 0.16, sustain: 0.45, release: 0.12 },
      filter: { type: "lowpass", rolloff: -24, Q: 2 },
      filterEnvelope: { attack: 0.001, decay: 0.16, sustain: 0.18, release: 0.1, baseFrequency: 85, octaves: 3.4 }
    }).connect(destination);
  }

  if (def.instrument === "lead") {
    return new Tone.DuoSynth({
      vibratoAmount: 0.12,
      vibratoRate: 5.4,
      harmonicity: 1.51,
      voice0: {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.18, release: 0.09 }
      },
      voice1: {
        oscillator: { type: "square" },
        envelope: { attack: 0.006, decay: 0.12, sustain: 0.12, release: 0.08 }
      }
    }).connect(destination);
  }

  if (def.instrument === "arp") {
    return new Tone.AMSynth({
      harmonicity: 2.7,
      oscillator: { type: "pulse", width: 0.24 },
      envelope: { attack: 0.002, decay: 0.08, sustain: 0.05, release: 0.05 },
      modulation: { type: "square" },
      modulationEnvelope: { attack: 0.001, decay: 0.05, sustain: 0.02, release: 0.04 }
    }).connect(destination);
  }

  if (def.instrument === "chord") {
    return new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fatsawtooth", count: 3, spread: 24 },
      envelope: { attack: 0.018, decay: 0.22, sustain: 0.24, release: 0.32 }
    }).connect(destination);
  }

  return new Tone.Synth({
    oscillator: { type: "fmsquare", modulationType: "sawtooth", modulationIndex: 2 },
    envelope: { attack: 0.001, decay: 0.055, sustain: 0.01, release: 0.05 }
  }).connect(destination);
}

function applyTransportSettings() {
  Tone.Transport.bpm.rampTo(state.bpm, 0.05);
  Tone.Transport.swing = state.swing / 100;
  Tone.Transport.swingSubdivision = "16n";
}

function applyEffects() {
  if (!audio) return;
  setParam(audio.filter.frequency, state.effects.tone);
  setCrusherBits(Math.round(state.effects.crush));
  audio.drive.distortion = state.effects.drive;
  audio.drive.wet.value = clamp(state.effects.drive * 0.55, 0, 0.6);
  audio.delay.wet.value = state.effects.delay;
  audio.reverb.wet.value = state.effects.reverb;
}

function setCrusherBits(value) {
  if (!audio?.crusher) return;
  if (typeof audio.crusher.bits === "number") {
    audio.crusher.bits = value;
    return;
  }
  setParam(audio.crusher.bits, value);
}

function setParam(param, value) {
  if (!param) return;
  if (typeof param !== "object" && typeof param !== "function") return;
  if (typeof param.rampTo === "function") {
    param.rampTo(value, 0.05);
  } else if ("value" in param) {
    param.value = value;
  }
}

function loadPreset(id, silent = false) {
  const preset = PRESETS.find((item) => item.id === id);
  if (!preset) return;
  clearCells();
  state.bpm = preset.bpm;
  state.root = preset.root;
  state.scale = preset.scale;
  state.steps = 16;

  if (id === "bossDoor") {
    setTrack("kick", [0, [3, 0, true], 6, 8, [11, 0, true], 14]);
    setTrack("snare", [4, 12]);
    setTrack("hat", [0, 2, 4, 6, 8, 10, 12, 14]);
    setTrack("clap", [7, 15]);
    setTrack("bass", [[0, 0, true], [3, 0], [6, 2], [8, 3, true], [11, 2], [14, 4]]);
    setTrack("lead", [[2, 7], [5, 5], [7, 4, true], [10, 8], [13, 7], [15, 10, true]]);
    setTrack("arp", [[1, 0], [3, 2], [5, 4], [7, 7], [9, 4], [11, 2], [13, 5], [15, 7]]);
    setTrack("zap", [[15, 11, true]]);
  }

  if (id === "neonRun") {
    setTrack("kick", [0, 4, [7, 0, true], 8, 12, 15]);
    setTrack("snare", [4, 12]);
    setTrack("hat", [0, 1, 2, 4, 6, 7, 8, 10, 12, 14, 15]);
    setTrack("clap", [11]);
    setTrack("bass", [[0, 0], [2, 0], [4, 2], [7, 4, true], [8, 3], [10, 2], [12, 0], [15, 5, true]]);
    setTrack("lead", [[1, 5], [3, 7], [6, 8], [9, 10, true], [11, 7], [14, 12]]);
    setTrack("arp", [[0, 7], [2, 9], [4, 12], [6, 9], [8, 7], [10, 5], [12, 4], [14, 2]]);
    setTrack("chord", [[0, 0], [8, 3]]);
  }

  if (id === "ghostCart") {
    setTrack("kick", [0, 5, 8, 13]);
    setTrack("snare", [4, [10, 0, true], 12]);
    setTrack("hat", [1, 3, 6, 7, 9, 11, 14, 15]);
    setTrack("clap", [12]);
    setTrack("bass", [[0, 0, true], [5, 2], [8, 5], [13, 3]]);
    setTrack("lead", [[2, 6], [4, 5], [7, 3], [10, 7, true], [14, 5]]);
    setTrack("chord", [[0, 0], [6, 4], [12, 3]]);
    setTrack("zap", [[3, 10], [11, 8]]);
  }

  if (id === "coinStorm") {
    setTrack("kick", [0, 3, 6, 8, 10, 13]);
    setTrack("snare", [4, 12]);
    setTrack("hat", Array.from({ length: 16 }, (_, step) => step));
    setTrack("clap", [7, 15]);
    setTrack("bass", [[0, 0], [3, 2], [6, 4], [8, 5], [10, 4], [13, 2]]);
    setTrack("lead", [[0, 7], [1, 8], [3, 9], [4, 11], [6, 12], [9, 9], [12, 7], [15, 14, true]]);
    setTrack("arp", Array.from({ length: 16 }, (_, step) => [step, step % 2 ? 7 : 4, step % 4 === 3]));
    setTrack("zap", [[7, 9], [15, 14, true]]);
  }

  applyTransportSettings();
  renderApp();
  if (!silent) toast(`${preset.name} loaded`);
}

// The "original" — a warm, mid-tempo groove that sounds finished the moment
// it loads. This is what greets people instead of a frantic 148bpm pattern.
async function loadSignature({ play = false } = {}) {
  clearCells();
  state.bpm = 92;
  state.swing = 16;
  state.humanize = 6;
  state.root = "A";
  state.scale = "dorian";
  state.steps = 16;
  state.effects = { crush: 12, drive: 0.12, delay: 0.22, reverb: 0.34, tone: 6800 };

  setTrack("kick", [[0, 0, true], 6, [8, 0, true], 14]);
  setTrack("snare", [4, 12]);
  setTrack("hat", [2, 6, 10, 14, [7, 0], [15, 0]]);
  setTrack("clap", [12]);
  setTrack("bass", [[0, 0, true], [3, 4], [6, 2], [8, 0], [11, 4], [14, 5]]);
  setTrack("chord", [[0, 0], [8, 3]]);
  setTrack("lead", [[4, 4], [7, 6], [12, 7], [15, 5, true]]);
  setTrack("arp", [[2, 0], [6, 4], [10, 2], [13, 6]]);

  applyTransportSettings();
  applyEffects();
  renderApp();

  if (play) {
    if (state.playing) stopPlayback(false);
    await startPlayback();
  } else {
    toast("Original groove loaded");
  }
}

// A clean slate: empty grid, gentle default tempo, ready to build from scratch.
function startFresh() {
  if (state.playing) stopPlayback(false);
  clearCells();
  state.bpm = 96;
  state.swing = 8;
  state.root = "A";
  state.scale = "minorPent";
  state.steps = 16;
  state.currentStep = -1;
  applyTransportSettings();
  renderApp();
  toast("Fresh start");
}

function setTrack(trackId, entries) {
  const track = getTrackState(trackId);
  entries.forEach((entry) => {
    const [step, degree = seedDegree(getTrackDef(trackId), Number(entry)), accent = false] = Array.isArray(entry) ? entry : [entry];
    if (step < 0 || step >= MAX_STEPS) return;
    track.cells[step].on = true;
    track.cells[step].accent = Boolean(accent);
    track.cells[step].degree = degree;
  });
}

function randomizePattern(mode = "balanced") {
  clearCells();
  const densityBias = mode === "sparse" ? 0.68 : mode === "dense" ? 1.38 : 1;
  state.bpm = Math.round(randomBetween(104, mode === "dense" ? 194 : 176));
  state.root = ROOTS[Math.floor(Math.random() * ROOTS.length)];
  state.scale = randomChoice(Object.keys(SCALES));

  TRACK_DEFS.forEach((def) => {
    const track = getTrackState(def.id);
    const density = clamp(def.density * densityBias, 0.05, 0.78);

    for (let step = 0; step < state.steps; step += 1) {
      let active = Math.random() < density;
      if (def.instrument === "kick") active = [0, 8].includes(step % 16) || Math.random() < density * 0.65;
      if (def.instrument === "snare") active = [4, 12].includes(step % 16) || Math.random() < density * 0.35;
      if (def.instrument === "hat") active = step % 2 === 0 || Math.random() < density * 0.6;
      if (def.instrument === "chord") active = step % 8 === 0 && Math.random() < 0.85;
      if (!active) continue;

      track.cells[step].on = true;
      track.cells[step].accent = Math.random() < (step % 4 === 0 ? 0.42 : 0.16);
      if (def.kind === "melodic") {
        const drift = Math.round(randomBetween(-2, 5));
        track.cells[step].degree = wrapDegree(seedDegree(def, step) + drift);
      }
    }
  });

  renderApp();
  applyTransportSettings();
  toast(`${mode[0].toUpperCase() + mode.slice(1)} pattern`);
}

function mutatePattern() {
  state.tracks.forEach((track) => {
    const def = getTrackDef(track.id);
    const changes = Math.ceil(state.steps * (def.kind === "drum" ? 0.13 : 0.18));
    for (let i = 0; i < changes; i += 1) {
      const step = Math.floor(Math.random() * state.steps);
      const cell = track.cells[step];
      if (Math.random() < 0.5) cell.on = !cell.on;
      if (cell.on && Math.random() < 0.38) cell.accent = !cell.accent;
      if (def.kind === "melodic" && cell.on) cell.degree = wrapDegree(cell.degree + Math.round(randomBetween(-3, 3)));
    }
  });
  renderGrid();
  toast("Mutated");
}

function clearPattern() {
  clearCells();
  state.currentStep = -1;
  renderGrid();
  toast("Cleared");
}

function clearCells() {
  state.tracks.forEach((track) => {
    const def = getTrackDef(track.id);
    track.cells.forEach((cell, step) => {
      cell.on = false;
      cell.accent = false;
      cell.degree = seedDegree(def, step);
    });
  });
}

function nudgePattern(amount) {
  state.tracks.forEach((track) => {
    const visible = track.cells.slice(0, state.steps);
    const shifted = visible.map((_, index) => visible[(index - amount + state.steps) % state.steps]);
    shifted.forEach((cell, index) => {
      track.cells[index] = { ...cell };
    });
  });
  renderGrid();
  toast("Nudged");
}

function doublePattern() {
  if (state.steps === 16) {
    state.tracks.forEach((track) => {
      for (let step = 0; step < 16; step += 1) {
        track.cells[step + 16] = { ...track.cells[step] };
      }
    });
    state.steps = 32;
  } else {
    state.tracks.forEach((track) => {
      for (let step = 0; step < 16; step += 1) {
        track.cells[step + 16] = { ...track.cells[step], degree: wrapDegree(track.cells[step].degree + 2) };
      }
    });
  }
  renderApp();
  toast("Doubled");
}

function serialize() {
  return {
    version: 1,
    bpm: state.bpm,
    swing: state.swing,
    humanize: state.humanize,
    root: state.root,
    scale: state.scale,
    steps: state.steps,
    effects: state.effects,
    tracks: state.tracks.map((track) => ({
      id: track.id,
      muted: track.muted,
      solo: track.solo,
      cells: track.cells.map((cell) => ({ ...cell }))
    }))
  };
}

function hydrate(data) {
  if (!data || typeof data !== "object") throw new Error("Invalid pattern");
  const next = createInitialState();
  next.bpm = clamp(Math.round(Number(data.bpm) || next.bpm), 60, 240);
  next.swing = clamp(Math.round(Number(data.swing) || 0), 0, 55);
  next.humanize = clamp(Math.round(Number(data.humanize) || 0), 0, 30);
  next.root = ROOTS.includes(data.root) ? data.root : next.root;
  next.scale = SCALES[data.scale] ? data.scale : next.scale;
  next.steps = [16, 32].includes(Number(data.steps)) ? Number(data.steps) : next.steps;
  next.effects = { ...next.effects, ...(data.effects || {}) };

  if (Array.isArray(data.tracks)) {
    data.tracks.forEach((incoming) => {
      const target = next.tracks.find((track) => track.id === incoming.id);
      if (!target || !Array.isArray(incoming.cells)) return;
      target.muted = Boolean(incoming.muted);
      target.solo = Boolean(incoming.solo);
      incoming.cells.slice(0, MAX_STEPS).forEach((cell, index) => {
        target.cells[index] = {
          on: Boolean(cell.on),
          accent: Boolean(cell.accent),
          degree: wrapDegree(Number(cell.degree) || 0)
        };
      });
    });
  }

  next.selectedSlot = state.selectedSlot;
  state = next;
  applyTransportSettings();
  applyEffects();
  renderApp();
}

function saveSelectedSlot() {
  localStorage.setItem(`${STORAGE_PREFIX}${state.selectedSlot}`, JSON.stringify(serialize()));
  renderApp();
  toast(`Saved slot ${state.selectedSlot}`);
}

function loadSlot(slot) {
  const stored = localStorage.getItem(`${STORAGE_PREFIX}${slot}`);
  if (!stored) return;
  hydrate(JSON.parse(stored));
  state.selectedSlot = slot;
  renderApp();
  toast(`Loaded slot ${slot}`);
}

function hasSlot(slot) {
  try {
    return Boolean(localStorage.getItem(`${STORAGE_PREFIX}${slot}`));
  } catch {
    return false;
  }
}

async function sharePattern() {
  const hash = encodePattern(serialize());
  const url = `${window.location.origin}${window.location.pathname}#${hash}`;
  try {
    await navigator.clipboard.writeText(url);
    toast("Share link copied");
  } catch {
    window.location.hash = hash;
    toast("Share link ready");
  }
}

function exportPattern() {
  const blob = new Blob([JSON.stringify(serialize(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `openbeats-${Date.now()}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  toast("Exported JSON");
}

function importPattern(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      hydrate(JSON.parse(String(reader.result)));
      toast("Imported");
    } catch (error) {
      toast(error.message || "Import failed");
    }
  });
  reader.readAsText(file);
  event.target.value = "";
}

function encodePattern(pattern) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(pattern))))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function decodePattern(hash) {
  const normalized = hash.replace(/^#/, "").replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(decodeURIComponent(escape(atob(padded))));
}

function loadHashPattern() {
  if (!window.location.hash || window.location.hash.length < 8) return false;
  try {
    hydrate(decodePattern(window.location.hash));
    toast("Share pattern loaded");
    return true;
  } catch {
    return false;
  }
}

function updatePlayhead(step) {
  document.querySelectorAll(".playhead").forEach((element) => element.classList.remove("playhead"));
  document.querySelectorAll(".step-number.playing").forEach((element) => element.classList.remove("playing"));

  if (step >= 0) {
    document.querySelectorAll(`.step-cell[data-step="${step}"]`).forEach((cell) => cell.classList.add("playhead"));
    document.querySelector(`[data-ruler-step="${step}"]`)?.classList.add("playing");
  }

  previousStep = step;
  updateReadouts();
}

function pulseCell(trackId, step) {
  const cell = document.querySelector(`.step-cell[data-track="${trackId}"][data-step="${step}"]`);
  if (!cell) return;
  cell.classList.remove("hit");
  void cell.offsetWidth;
  cell.classList.add("hit");
}

function startScope() {
  cancelAnimationFrame(rafId);
  drawScopeFrame();
}

function drawScopeFrame() {
  const canvas = document.querySelector("#scope");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "oklch(0.08 0 0)";
  ctx.fillRect(0, 0, width, height);

  const values = audio?.analyser ? audio.analyser.getValue() : new Float32Array(256).fill(0);
  ctx.lineWidth = Math.max(1, dpr * 1.6);
  ctx.strokeStyle = state.playing ? "oklch(0.68 0.17 205)" : "oklch(0.32 0.016 252)";
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = (0.5 + Number(value) * 0.38) * height;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = state.playing ? "oklch(0.74 0.165 91 / 0.32)" : "oklch(0.24 0.016 252)";
  for (let i = 0; i < state.steps; i += 1) {
    const x = (i / state.steps) * width;
    const activeCount = state.tracks.reduce((sum, track) => sum + (track.cells[i]?.on ? 1 : 0), 0);
    const barHeight = Math.max(2 * dpr, (activeCount / TRACK_DEFS.length) * height * 0.42);
    ctx.fillRect(x + 1 * dpr, height - barHeight - 2 * dpr, Math.max(2 * dpr, width / state.steps - 2 * dpr), barHeight);
  }

  if (state.playing) {
    rafId = requestAnimationFrame(drawScopeFrame);
  }
}

function updateReadouts() {
  const readout = document.querySelector("#stepReadout");
  if (readout) readout.textContent = formatStepReadout();
  const sub = document.querySelector(".readout-sub");
  if (sub) sub.textContent = `${state.bpm} BPM`;
}

function formatStepReadout() {
  return state.currentStep >= 0 ? `${String(state.currentStep + 1).padStart(2, "0")}/${state.steps}` : `--/${state.steps}`;
}

function formatDegree(degree) {
  const scaleLength = SCALES[state.scale].intervals.length;
  return String(((degree % scaleLength) + scaleLength) % scaleLength + 1);
}

function noteFromDegree(def, degree) {
  const intervals = SCALES[state.scale].intervals;
  const normalized = ((degree % intervals.length) + intervals.length) % intervals.length;
  const octaveLift = Math.floor(degree / intervals.length) * 12;
  const rootMidi = (def.octave + 1) * 12 + ROOTS.indexOf(state.root);
  const midi = rootMidi + intervals[normalized] + octaveLift;
  return midiToNote(midi);
}

function midiToNote(midi) {
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

function noteToFrequency(note) {
  return Tone.Frequency(note).toFrequency();
}

function wrapDegree(value) {
  const scaleLength = SCALES[state.scale].intervals.length * 2;
  return ((Math.round(value) % scaleLength) + scaleLength) % scaleLength;
}

function trackDefaultDb(def) {
  const levels = {
    kick: -3,
    snare: -7,
    hat: -15,
    clap: -11,
    bass: -6,
    lead: -11,
    arp: -14,
    chord: -15,
    zap: -13
  };
  return levels[def.instrument] ?? -10;
}

function formatEffectValue(id) {
  const value = state.effects[id];
  if (id === "tone") return `${Math.round(value / 100) / 10}k`;
  if (id === "crush") return `${Math.round(value)}`;
  return value.toFixed(2).replace(/^0/, "");
}

function getTrackDef(id) {
  return TRACK_DEFS.find((track) => track.id === id);
}

function getTrackState(id) {
  return state.tracks.find((track) => track.id === id);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomChoice(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

function refreshIcons() {
  createIcons({ icons, attrs: { "stroke-width": 2, width: 17, height: 17, "aria-hidden": "true" } });
}

function toast(message) {
  const element = document.querySelector("#toast");
  if (!element) return;
  clearTimeout(toastTimer);
  element.textContent = message;
  element.classList.add("show");
  toastTimer = setTimeout(() => element.classList.remove("show"), 1800);
}

function bindKeyboard() {
  window.addEventListener("keydown", (event) => {
    if (event.target.matches("input, select, textarea")) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const padIndex = PAD_KEY_LOOKUP[event.code];
    if (padIndex !== undefined) {
      event.preventDefault();
      if (event.repeat) return;
      playPad("kit", padIndex);
      return;
    }
    if (event.code === "Space") {
      event.preventDefault();
      state.playing ? stopPlayback() : startPlayback();
    }
    if (event.key.toLowerCase() === "r") randomizePattern("balanced");
    if (event.key.toLowerCase() === "m") mutatePattern();
    if (event.key.toLowerCase() === "c") clearPattern();
  });
}

function boot() {
  applyTheme(theme, { render: false });
  preloadKitPads();
  renderApp();
  bindKeyboard();
  if (!loadHashPattern()) {
    loadSignature();
  }
}

boot();
