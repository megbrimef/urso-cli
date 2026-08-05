# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@urso/cli` — a Node.js CLI tool (bin name `urso`) for packing and generating game assets (texture atlases, sound sprites, "uber" JSON bundles, webp conversions). It's built with `commander` and is meant to be run from inside a *separate* game project directory, not from this repo.

## Commands

- `npm run build` — compiles `src/urso.ts` via Rollup (`rollup.config.mjs`) into a single CJS bundle at `bin/urso.js` (+ sourcemap). This is the only build step; there is no watch mode.
- `npm start` — runs the built `bin/urso.js` directly (equivalent to running the compiled `urso` binary).
- There are no test or lint scripts configured in this repo.

`bin/` is gitignored — it's a local build artifact, not checked in. Run `npm run build` after any source change before trying `npm start` or invoking `urso` locally.

The Rollup config keeps `fs`, `commander`, `util`, `path`, `child_process` external (not bundled) and replaces `__APP_VERSION__` with the `version` field from `package.json` at build time — that's what `urso --version` prints.

## Architecture

### Command tree

`src/urso.ts` is the entry point: it registers hooks (`addHooks`), registers commands (`addCommands`), then calls `program.parseAsync()`.

Commands are declared as a recursive tree in `src/commands/index.ts`:
```ts
type CommandsConfig = { generator: (program: Command) => Command, subcommands?: CommandsConfig[] }
```
Each node's `generator` attaches a commander `Command`, and `addCommands` recurses into `subcommands`, passing the parent `Command` down. To add a new subcommand, add a `generator` function under the appropriate parent in `src/commands/index.ts` rather than wiring commander calls directly in `urso.ts`.

Current tree: `init` (top-level) and `assets` → `make`, `pack`, `generate`.

### Config-gated commands

`src/hooks/preSubcommandHook.ts` runs before every subcommand and calls `program.error(...)` if `assets.config.json` (the "game config", path from `getConfigCfgPath()` in `src/data/gameConfigData.ts`) doesn't exist in the *current working directory* — except when running `init`. This means every command other than `init` assumes a config file is already present in the project the user is running `urso` in.

`src/data/gameConfigData.ts` lazily reads and caches (module-level singleton) that config file as a `GameConfig` (see `src/shared/interfaces/GameConfig.ts`). `urso init` writes the default config (`src/commands/init/config.ts`) via `writeFileAsync`.

### Path resolution is relative to the invoking project, not this repo

`getAbsolutePath()` in `src/shared/helpers.ts` resolves against `process.cwd()`. Since `urso` is meant to be run inside a target game project, all source/output folders in the `GameConfig` (`general.sourceFolder`, `general.outputFolder`, etc.) are relative to *that* project's directory, not `urso-cli`'s.

### Generators (`src/generators/`)

Each generator is a standalone async function that reads files under the config's `sourceFolder` and writes packed output under `outputFolder`. They're invoked from `src/commands/assets/pack.ts`'s `action`, which switches on a `CFG_TYPE` (`src/shared/enums/assets.ts`) argument (`all` runs everything in sequence):

- `textureAtlasGenerator.ts` — shells out to the external `texturepacker` CLI binary (must be on `PATH`) for every `.tps` file found; optionally also emits a `--webp` variant if `-w/--webp <quality>` is passed to `pack`.
- `soundAtlasGenerator.ts` — uses the `audiosprite` npm package to build sound sprites from per-config JSON files (see below).
- `uberGenerator.ts` — merges every generated JSON under `uber.folders` into one JSON keyed by filename, written to `uber.output`.
- `extraGenerator.ts` — base64-encodes matched files into a JSON asset map (used for lazily-loaded asset bundles), driven by `extraAssets` config.
- `webpGenerator.ts` — shells out to the external `cwebp` CLI binary to convert `.png` files to `.webp`; invoked via `urso assets generate webp <path>`, separate from the main `pack` flow.
- Plain file copying (the `copy` config section) is handled directly by `copyAll` in `src/shared/io.ts`, not a generator.

### Sound config discovery ("URC" marker files)

`urso assets make sound <name> <path>` (`src/commands/assets/make.ts`) scaffolds a per-sprite JSON config via `soundConfigGenerator.ts`'s `getSoundTemplate`. These generated JSON files are tagged with `"meta": "URC"` and a `type`. `getAllConfigsOfType()` in `src/shared/helpers.ts` recursively scans the source folder for `.json` files matching that meta/type combination — this is how `packAllSounds` discovers which sprite configs to build, rather than reading them from the main `assets.config.json`.

Sound configs merge three layers via `deepmerge` (`soundConfigGenerator.ts`): built-in defaults → the config file's `shared` block → each `variants` entry (e.g. a full-quality desktop variant and a lower-bitrate mobile variant sharing one config).

### Errors

`src/errors/` (`NoGameConfigError`, `GameConfigWasCreatedError`) exist but most command flows currently signal these conditions via `console.log`/`program.error` rather than throwing them — check call sites before assuming they're wired up everywhere.
