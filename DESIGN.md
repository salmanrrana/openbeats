# Design

## Overview
Music Man is a dense browser music tool with a restrained dark instrument surface, sharp saturated accents, a grid-first layout, and a performance pad bank. The mood is "night arcade control room: amber LEDs, cyan meters, hot magenta accents, matte black hardware."

## Color
Use OKLCH custom properties only. The palette is dark neutral architecture with warm amber as the primary action color, cyan for metering/playhead feedback, and magenta for mutation/accent states.

- Background: `oklch(0.085 0 0)`
- Surface: `oklch(0.135 0.012 252)`
- Surface raised: `oklch(0.18 0.016 252)`
- Ink: `oklch(0.93 0.012 95)`
- Muted: `oklch(0.69 0.018 250)`
- Primary: `oklch(0.74 0.165 91)`
- Accent: `oklch(0.68 0.17 205)`
- Hot: `oklch(0.66 0.22 348)`
- Success: `oklch(0.72 0.16 145)`
- Warning: `oklch(0.78 0.15 72)`

## Typography
Use the system UI stack for labels and controls, with `ui-monospace` for counters, steps, note names, and transport readouts. Keep sizes fixed in rem units. Labels are concise, mixed case, and readable at compact density.

## Layout
The first viewport is the app. Use a sticky top transport, a two-column workbench on desktop, and a single-column layout on narrower screens. The sequencer grid scrolls horizontally when needed, with stable cell dimensions so playback never shifts layout.

## Components
- Transport buttons: square icon buttons with clear active/disabled states.
- Step cells: fixed-size toggle buttons with velocity/accent represented through fill, outline, and small pitch text.
- Track strips: compact row labels, mute/solo controls, volume sliders, and random/clear actions.
- Pattern tools: segmented and icon+text buttons for preset, randomize, mutate, save, import, export, and share.
- Soundboard pads: large click targets with key labels, source type labels, bundled kit slots, loaded sample states, and clear stop/load actions.
- Meters: canvas waveform and step energy bars tied to live audio state.

## Motion
Motion is state feedback only: playhead pulse, active cell glow, meter animation, and short button responses. All animations reduce to immediate state changes under `prefers-reduced-motion`.
