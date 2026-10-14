# Verdant Hollow 3D data pipeline

The browser build intentionally labels the current town core as **generated/sample**. It uses a fictional local coordinate frame and fictional landmark names; the visible buildings, vegetation, and street mesh are procedural placeholders. It does **not** claim real-world geographic coverage.

## Acquire and validate

1. Run `node scripts/generate-osm.mjs --output data/verdant-hollow.json` to download a bounded Overpass extract for a replaceable sample envelope. Respect the endpoint's rate limits and [OSM attribution/licensing](https://www.openstreetmap.org/copyright).
2. Acquire a DEM from a provider whose terms allow your deployment, then validate its CRS, voids, vertical datum, and resolution before mapping it into the fictional world.
3. Filter the extract to the configured sample boundary and retain source IDs/timestamps. Replace the sample envelope only in a private deployment configuration.
4. Reproject validated features to the local metric frame centered at the fictional origin; keep source metadata for provenance and attribution.

## Generate and stream

Convert `highway`, `building`, water, landuse, and named-node features into versioned chunk files (for example `z/x/y.json`). Triangulate DEM tiles, extrude validated building footprints, and generate road collision meshes. At runtime, request the current chunk plus a one-chunk ring, cache by source hash, and use simplified collision/LOD meshes beyond 250m. Instance vegetation and cull by frustum; never silently substitute missing source data.

## Coverage ledger

Each generated chunk should include `source`, `retrievedAt`, `license`, `confidence` (`verified`, `estimated`, `procedural`, or `pending`), and feature counts. The HUD's 72/28 split is a prototype status indicator, not a survey claim. Expand the map only after the ledger and validation report are generated.

## Acceptance smoke checks

- Launch with `npm install && npm run dev`; movement responds to WASD, Shift, Space, pointer drag, and the interaction button.
- Local-frame text changes as the player moves; the player marker and selected POI map pins use the same transform.
- Search filters indexed POIs; clicking a POI teleports and updates the status line.
- Repeated `npm run build` succeeds without network data, so the sample fallback remains usable offline.
