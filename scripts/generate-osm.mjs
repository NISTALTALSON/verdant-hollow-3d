#!/usr/bin/env node
/**
 * Repeatable, provider-friendly acquisition helper.
 * Usage: node scripts/generate-osm.mjs --output data/verdant-hollow.json
 * It downloads only a bounded Overpass query and writes a provenance record.
 * For production, replace the sample renderer with validated OSM/DEM tiling.
 */
import { mkdir, writeFile } from 'node:fs/promises';
const output = process.argv[process.argv.indexOf('--output') + 1] || 'data/verdant-hollow.json';
const query = `[out:json][timeout:60];(way(-0.045,-0.045,0.045,0.045)[highway];way(-0.045,-0.045,0.045,0.045)[building];node(-0.045,-0.045,0.045,0.045)[name];);out body;>;out skel qt;`;
const endpoint = 'https://overpass-api.de/api/interpreter';
const response = await fetch(endpoint, { method: 'POST', body: query, headers: { 'content-type': 'text/plain' } });
if (!response.ok) throw new Error(`Overpass request failed: ${response.status}`);
const payload = await response.json();
await mkdir(output.split('/').slice(0, -1).join('/') || '.', { recursive: true });
await writeFile(output, JSON.stringify({ provenance: { source: endpoint, query, retrievedAt: new Date().toISOString(), license: 'OpenStreetMap ODbL' }, payload }, null, 2));
console.log(`Wrote ${payload.elements.length} elements to ${output}`);
