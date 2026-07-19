# Campus Rush Repository Guide

## Scope

This repository contains a browser-only Phaser 3 endless runner. Keep gameplay
logic deterministic, assets attributable, and changes deployable as a static
Vite build.

## Structure

- `src/game/scenes/`: scene orchestration and high-level game flow.
- `src/game/`: reusable gameplay systems, constants, audio, visuals, and assets.
- `public/assets/`: distributable runtime assets. Every third-party asset must
  have its source and license recorded in `public/assets/ART_CREDITS.md`.
- `scripts/`: deterministic validators and maintenance utilities.
- `work/`: local scratch output only; never commit it.
- `dist/`: generated build output; never edit it manually.

## Naming and State

- Use descriptive English names for files, functions, variables, configuration
  keys, and commit messages.
- Keep user-facing copy in Chinese unless the surrounding UI intentionally uses
  a short English label.
- Store shared gameplay constants in `src/game/constants.js`; do not duplicate
  physics values across systems.
- A long-lived gameplay transition must use an explicit state, not a set of
  loosely related booleans.

## Gameplay Rules

- Treat the rendered sprite, collision body, and player-perceived collision
  envelope as separate concerns. Collision bodies must be centered unless an
  intentional asymmetric shape is documented.
- Keep obstacle bodies slightly inside visible opaque bounds. Do not globally
  shrink every hitbox to repair one bad asset.
- Slope support must not toggle gravity on and off during continuous contact.
  Release support only for an explicit jump, a missing surface beyond tolerance,
  or a destroyed route.
- Player body shape changes must preserve the body's current foot position and
  motion history. Never call `updateFromGameObject()` during a physics frame:
  the Game Object still contains the previous frame's position and would erase
  the movement that Arcade Physics has already integrated.
- Slope support corrections must move the Arcade Body only. Let the physics
  post-update synchronize the Game Object once, or fast landings will apply the
  same vertical correction twice and visibly oscillate.
- Rendering must account for high-DPI displays without changing the logical
  `960x540` gameplay coordinate system.

## Audio and Rights

- Do not add scraped speech, celebrity voice clips, cloned voices, copyrighted
  music, or assets with unclear redistribution rights.
- Prefer original recordings, browser-local generic speech synthesis, or assets
  with an explicit redistribution license.
- Speech synthesis must have a silent/programmatic fallback because browser
  voice availability differs by platform.
- Snow Peak dialogue uses the licensed CC0 kitten recording as deterministic
  cat-language chatter. Chinese meaning stays in subtitles; do not reintroduce
  an operating-system voice or an unlicensed meme recording for this character.
- Record the source and license for every bundled audio file in
  `public/assets/ART_CREDITS.md`.

## Verification

Run the narrowest relevant checks after each change. Before declaring a gameplay
change complete, run:

```bash
npm run validate:gameplay
npm run validate:routes
npm run build
```

For rendering or interaction changes, also open the local Vite build in a real
browser and verify the menu plus the affected gameplay path at desktop size.

## Git and Deployment

- Preserve unrelated user changes.
- Do not commit generated `dist/` output.
- Use concise English commit messages describing intent.
- Deployment is performed only through the repository's documented GitHub
  Actions workflow. A Git push is not itself a deployment instruction.
