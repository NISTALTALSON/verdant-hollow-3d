import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import './styles.css';

const ORIGIN = { lat: 0, lon: 0 };
const M_PER_DEG_LAT = 110_900;
const M_PER_DEG_LON = 109_600;

type Poi = { id: string; name: string; kind: string; lat: number; lon: number; color: string };
const POIS: Poi[] = [
  { id: 'town', name: 'Aurora Commons', kind: 'Central hub', lat: 0, lon: 0, color: '#e4ff75' },
  { id: 'marthoma', name: 'Ember Archive', kind: 'Landmark', lat: 0.0032, lon: -0.0026, color: '#ffb86b' },
  { id: 'bhoothathan', name: 'Cloudbreak Dam', kind: 'Nature', lat: 0.1024, lon: 0.0758, color: '#6dd6b5' },
  { id: 'hospital', name: 'Lumen Clinic', kind: 'Health', lat: -0.0029, lon: 0.0028, color: '#c5a8ff' },
  { id: 'river', name: 'Glasswater Front', kind: 'Waterway', lat: 0.0183, lon: -0.0096, color: '#68b9f5' }
];

function geoToWorld(lat: number, lon: number) {
  return { x: (lon - ORIGIN.lon) * M_PER_DEG_LON, z: -(lat - ORIGIN.lat) * M_PER_DEG_LAT };
}
function worldToGeo(x: number, z: number) {
  return { lat: ORIGIN.lat - z / M_PER_DEG_LAT, lon: ORIGIN.lon + x / M_PER_DEG_LON };
}
function formatCoord(n: number) { return n.toFixed(5); }

function createGroundTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#193a2b';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 900; i++) {
    const shade = 22 + Math.floor(Math.random() * 22);
    ctx.fillStyle = `rgba(${shade}, ${70 + shade}, ${42 + shade / 2}, .28)`;
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(18, 18);
  return texture;
}

function createWorld(scene: THREE.Scene) {
  scene.background = new THREE.Color('#07110f');
  scene.fog = new THREE.Fog('#07110f', 180, 720);
  scene.add(new THREE.HemisphereLight('#d7f7df', '#17251f', 2.1));
  const sun = new THREE.DirectionalLight('#ffd7a2', 3.2);
  sun.position.set(-140, 260, 180); sun.castShadow = true; scene.add(sun);
  scene.userData.sun = sun;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900, 20, 20), new THREE.MeshStandardMaterial({ map: createGroundTexture(), roughness: .92, metalness: .03 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const roadMat = new THREE.MeshStandardMaterial({ color: '#283c3a', roughness: .95 });
  const road = (x: number, z: number, w: number, d: number, rot = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, .12, d), roadMat);
    mesh.position.set(x, .06, z); mesh.rotation.y = rot; mesh.receiveShadow = true; scene.add(mesh);
  };
  road(0, 0, 500, 12); road(28, -35, 12, 430); road(-94, -70, 9, 250, -.35); road(108, 65, 10, 210, .72);
  const river = new THREE.Mesh(new THREE.PlaneGeometry(260, 42, 24, 4), new THREE.MeshStandardMaterial({ color: '#1e6970', roughness: .18, metalness: .18, transparent: true, opacity: .86 }));
  river.rotation.x = -Math.PI / 2; river.rotation.z = -.35; river.position.set(-100, .04, 125); river.userData.water = true; scene.add(river);
  const buildingMat = new THREE.MeshStandardMaterial({ color: '#c8a77a', roughness: .75 });
  const roofMat = new THREE.MeshStandardMaterial({ color: '#713f35', roughness: .85 });
  for (let i = 0; i < 46; i++) {
    const x = ((i * 83) % 360) - 180; const z = ((i * 137) % 260) - 130;
    if (Math.abs(x) < 14 || Math.abs(z + 35) < 15) continue;
    const w = 7 + (i % 4) * 2; const h = 5 + (i % 5) * 1.8;
    const house = new THREE.Mesh(new THREE.BoxGeometry(w, h, 8 + (i % 3) * 2), buildingMat);
    house.position.set(x, h / 2, z); house.castShadow = true; scene.add(house);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, 8) * .72, 3.3, 4), roofMat);
    roof.position.set(x, h + 1.1, z); roof.rotation.y = Math.PI / 4; roof.castShadow = true; scene.add(roof);
  }
  const trunk = new THREE.MeshStandardMaterial({ color: '#5a3a25' });
  const canopy = new THREE.MeshStandardMaterial({ color: '#2c744d', roughness: 1 });
  for (let i = 0; i < 80; i++) {
    const x = ((i * 47) % 800) - 400; const z = ((i * 91) % 700) - 350;
    if (Math.abs(x) < 35 && Math.abs(z) < 35) continue;
    const tree = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.45, .65, 5, 7), trunk); stem.position.y = 2.5;
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(3.8 + (i % 3), 1), canopy); leaves.position.y = 6.2;
    tree.add(stem, leaves); tree.position.set(x, 0, z); tree.scale.setScalar(.8 + (i % 4) * .12); tree.userData.sway = .4 + (i % 4) * .1; scene.add(tree);
  }
  POIS.forEach((poi) => {
    const p = geoToWorld(poi.lat, poi.lon);
    const marker = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 7, 12), new THREE.MeshBasicMaterial({ color: poi.color }));
    marker.position.set(p.x, 3.5, p.z); marker.userData = { poiId: poi.id, beacon: true }; scene.add(marker);
  });
}

function WorldCanvas({ position, setPosition, setMessage, weather, time, setLoaded }: { position: { x: number; z: number }; setPosition: (p: { x: number; z: number }) => void; setMessage: (m: string) => void; weather: string; time: string; setLoaded: (loaded: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ keys: new Set<string>(), yaw: 0, pitch: .25, dragging: false, lastX: 0, lastY: 0, pos: position, weather, time });
  useEffect(() => { state.current.pos = position; }, [position]);
  useEffect(() => { state.current.weather = weather; state.current.time = time; }, [weather, time]);
  useEffect(() => {
    if (!ref.current) return;
    const scene = new THREE.Scene(); createWorld(scene);
    const camera = new THREE.PerspectiveCamera(58, 1, .1, 1200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; ref.current.appendChild(renderer.domElement);
    const player = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(1.15, 2.8, 5, 10), new THREE.MeshStandardMaterial({ color: '#e4ff75' })); body.position.y = 2.2; body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(.85, 16, 12), new THREE.MeshStandardMaterial({ color: '#d79a75' })); head.position.y = 4.5; head.castShadow = true; player.add(body, head); scene.add(player);
    const resize = () => { const { clientWidth: w, clientHeight: h } = ref.current!; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }; resize();
    const onKey = (e: KeyboardEvent) => { state.current.keys.add(e.key.toLowerCase()); if (e.code === 'Space') e.preventDefault(); };
    const offKey = (e: KeyboardEvent) => state.current.keys.delete(e.key.toLowerCase());
    const onDown = (e: PointerEvent) => { state.current.dragging = true; state.current.lastX = e.clientX; state.current.lastY = e.clientY; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
    const onUp = () => { state.current.dragging = false; };
    const onMove = (e: PointerEvent) => { if (!state.current.dragging) return; const dx = e.clientX - state.current.lastX; const dy = e.clientY - state.current.lastY; state.current.yaw -= dx * .006; state.current.pitch = THREE.MathUtils.clamp(state.current.pitch + dy * .004, -.1, .85); state.current.lastX = e.clientX; state.current.lastY = e.clientY; };
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', offKey); renderer.domElement.addEventListener('pointerdown', onDown); renderer.domElement.addEventListener('pointerup', onUp); renderer.domElement.addEventListener('pointermove', onMove); window.addEventListener('resize', resize);
    let frame = 0; let last = performance.now(); let jump = 0; setLoaded(true);
    const animate = (now: number) => {
      const dt = Math.min((now - last) / 1000, .05); last = now; const s = state.current; const speed = s.keys.has('shift') ? 34 : 18;
      const forward = new THREE.Vector3(Math.sin(s.yaw), 0, Math.cos(s.yaw)); const right = new THREE.Vector3(Math.cos(s.yaw), 0, -Math.sin(s.yaw)); const move = new THREE.Vector3();
      if (s.keys.has('w')) move.addScaledVector(forward, -1); if (s.keys.has('s')) move.add(forward); if (s.keys.has('a')) move.addScaledVector(right, -1); if (s.keys.has('d')) move.add(right);
      if (move.lengthSq()) { move.normalize().multiplyScalar(speed * dt); const next = { x: s.pos.x + move.x, z: s.pos.z + move.z }; if (Math.abs(next.x) < 430 && Math.abs(next.z) < 430) { s.pos = next; setPosition(next); } player.rotation.y = Math.atan2(move.x, move.z); }
      if (s.keys.has(' ') || s.keys.has('space')) jump = .3; jump = Math.max(0, jump - dt); player.position.set(s.pos.x, Math.sin(jump * Math.PI / .3) * 4, s.pos.z);
      const target = new THREE.Vector3(s.pos.x, 2.5, s.pos.z); const cam = target.clone().add(new THREE.Vector3(Math.sin(s.yaw) * 18, 8 + s.pitch * 8, Math.cos(s.yaw) * 18)); camera.position.lerp(cam, .12); camera.lookAt(target);
      const hour = Number.parseInt(s.time.split(':')[0], 10) || 9;
      const daylight = THREE.MathUtils.clamp(Math.sin(((hour - 6) / 12) * Math.PI), .12, 1);
      const sun = scene.userData.sun as THREE.DirectionalLight;
      sun.intensity = daylight * (s.weather === 'Misty' ? 1.35 : 2.8);
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.color.set(s.weather === 'Monsoon' ? '#10252a' : s.weather === 'Misty' ? '#253932' : '#07110f');
        scene.fog.near = s.weather === 'Misty' ? 70 : 180;
      }
      scene.traverse((object) => {
        if (object.userData.sway) object.rotation.z = Math.sin(now * .0012 + object.position.x) * object.userData.sway * .035;
        if (object.userData.beacon) object.position.y = 3.5 + Math.sin(now * .003 + object.position.x) * .45;
        if (object.userData.water) object.position.y = .04 + Math.sin(now * .0015) * .025;
      });
      renderer.render(scene, camera); frame = requestAnimationFrame(animate);
    }; frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', offKey); window.removeEventListener('resize', resize); renderer.dispose(); ref.current?.removeChild(renderer.domElement); };
  }, [setPosition]);
  return <div ref={ref} className="world-canvas" role="application" aria-label="Interactive Verdant Hollow 3D explorer" tabIndex={0} onDoubleClick={() => setMessage('Camera reset — drag to orbit, use WASD to explore.')} />;
}

function App() {
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const [query, setQuery] = useState(''); const [selected, setSelected] = useState<Poi>(POIS[0]); const [message, setMessage] = useState('Explore the generated town core');
  const [weather, setWeather] = useState('Clear'); const [time, setTime] = useState('09:42'); const [showMap, setShowMap] = useState(true); const [loaded, setLoaded] = useState(false);
  const geo = worldToGeo(position.x, position.z);
  const results = POIS.filter((p) => `${p.name} ${p.kind}`.toLowerCase().includes(query.toLowerCase()));
  const teleport = (poi: Poi) => { const p = geoToWorld(poi.lat, poi.lon); setPosition(p); setSelected(poi); setMessage(`Teleported to ${poi.name}`); };
  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">VH</span><div><strong>VERDANT HOLLOW <em>3D</em></strong><small>FICTIONAL WORLD / EXPLORATION BUILD</small></div></div><div className="status"><span className="live-dot" /> LIVE SIMULATION <span className="divider" /> <span className="coverage">● GENERATED CORE / PENDING EXPANSION</span></div></header>
    <section className="hero"><div className="hero-copy"><span className="eyebrow">FICTIONAL REGION · LOCAL FRAME · SAMPLE WORLD</span><h1>A living map,<br /><span>under your feet.</span></h1><p>Walk the Verdant Hollow town core with a local-frame camera, discover landmarks, and preview the pipeline that grows this fictional digital twin.</p><div className="hero-actions"><button className="primary" onClick={() => setMessage('Use WASD to move · drag to look · Shift to run · Space to jump')}>▶ START EXPLORING</button><button className="ghost" onClick={() => setShowMap(!showMap)}>◎ {showMap ? 'HIDE' : 'SHOW'} MAP</button></div></div><div className="metrics"><div><b>01</b><span>ACTIVE CHUNK</span></div><div><b>5</b><span>VERIFIED POIs</span></div><div><b>10.2 km²</b><span>DEFINED BOUNDARY</span></div></div></section>
    <section className="workspace"><div className="viewport-card"><div className="viewport-label"><span className="pill green">CHUNK 0 / LOD 2</span><span>PROCEDURAL TERRAIN + OSM-READY STREET GRID</span></div>{!loaded && <div className="loading-state"><span className="loader" /><b>Preparing the town core</b><small>Generating browser-safe terrain and materials…</small></div>}<WorldCanvas position={position} setPosition={setPosition} setMessage={setMessage} weather={weather} time={time} setLoaded={setLoaded} /><div className="coordinates"><span>LOCAL FRAME</span><b>{formatCoord(geo.lat)}° N</b><b>{formatCoord(geo.lon)}° E</b><i>fictional sample transform</i></div><div className="controls"><span><kbd>W A S D</kbd> MOVE</span><span><kbd>SHIFT</kbd> RUN</span><span><kbd>SPACE</kbd> JUMP</span><span><kbd>DRAG</kbd> CAMERA</span><span><kbd>E</kbd> INTERACT</span></div></div>
      {showMap && <aside className="map-panel"><div className="panel-head"><div><span className="eyebrow">NAVIGATION</span><h2>Town map <small>01</small></h2></div><button className="icon-btn" onClick={() => setPosition({ x: 0, z: 0 })}>⌖</button></div><div className="map"><div className="map-grid" /><div className="map-road road-a" /><div className="map-road road-b" /><div className="map-river" /><div className="map-boundary" />{POIS.map((p) => { const q = geoToWorld(p.lat, p.lon); const left = 50 + q.x / 9; const top = 50 + q.z / 9; return <button aria-label={p.name} key={p.id} className={`map-pin ${selected.id === p.id ? 'active' : ''}`} style={{ left: `${left}%`, top: `${top}%`, background: p.color }} onClick={() => teleport(p)} />; })}<div className="player-pin" style={{ left: `${50 + position.x / 9}%`, top: `${50 + position.z / 9}%` }} /></div><div className="compass"><b>N</b><span /> <b>NE</b><span /> <b>E</b><span /> <b>SE</b></div><div className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search places, roads, landmarks..." /></div><div className="poi-list">{results.map((p) => <button className="poi" key={p.id} onClick={() => teleport(p)}><span className="poi-dot" style={{ background: p.color }} /><span><b>{p.name}</b><small>{p.kind} · {Math.round(Math.hypot(geoToWorld(p.lat, p.lon).x - position.x, geoToWorld(p.lat, p.lon).z - position.z))}m away</small></span><i>↗</i></button>)}{!results.length && <p className="empty">No indexed places in this loaded chunk.</p>}</div></aside>}</section>
    <section className="bottom-grid"><div className="info-card"><div><span className="eyebrow">WORLD STATE</span><h2>{message}</h2></div><div className="world-controls"><label>WEATHER <select value={weather} onChange={(e) => setWeather(e.target.value)}><option>Clear</option><option>Monsoon</option><option>Misty</option></select></label><label>LOCAL TIME <input value={time} onChange={(e) => setTime(e.target.value)} /></label><button onClick={() => setMessage(`Interaction queued at ${formatCoord(geo.lat)}, ${formatCoord(geo.lon)}`)}>E INTERACT</button></div></div><div className="coverage-card"><div className="coverage-title"><span className="eyebrow">DATA CONFIDENCE</span><b>Coverage ledger</b></div><div className="bar"><span /></div><div className="coverage-row"><span><i className="dot sample" />Sample / generated</span><b>72%</b></div><div className="coverage-row"><span><i className="dot pending" />Pending OSM + DEM</span><b>28%</b></div></div></section>
    <footer><span>© 2026 VERDANT HOLLOW 3D · PROTOTYPE BUILD 0.1</span><span>DATA SOURCES: OSM / DEM / FICTIONAL SURVEY <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">ATTRIBUTION ↗</a></span><span>QUALITY <b>HIGH</b></span></footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
