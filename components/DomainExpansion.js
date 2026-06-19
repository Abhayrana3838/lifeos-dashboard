'use client'
import { useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════════════
   SUKUNA'S DOMAIN — MALEVOLENT SHRINE (呪術廻戦)
   "I don't need tools for this level of target."
   
   Visual elements:
   • Void-black base with blood-crimson cursed energy
   • Shrine lattice grid (wooden bars of the shrine)
   • Cursed energy slashes ripping through space
   • Black flames / dark smoke rising
   • "Ten Shadows" cursed marks blooming outward
   • Kanji-like decay marks in background
   • Blood moon (red distorted circle)
   • Everything decaying — the shrine consumes all
════════════════════════════════════════════════════════════════════════ */

const SUKUNA_VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const SUKUNA_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;

/* ── Noise ────────────────────────────────────────────────────────── */
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float hash1(float v) { return fract(sin(v * 127.1) * 43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  float v=0.0,a=0.5; mat2 r=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<6;i++){v+=a*noise(p);p=r*p*2.1;a*=0.48;}
  return v;
}

/* ── Shrine Lattice ──────────────────────────────────────────────── */
float shrineLattice(vec2 uv) {
  /* Perspective grid — appears to stretch into depth */
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  vec2 p = (uv - 0.5) * asp;

  /* Warp the grid slightly with cursed energy */
  float warp = fbm(p * 1.5 + uTime * 0.08) * 0.06;
  p += warp;

  /* Grid of shrine bars — 6×9 grid */
  vec2 grid = fract(p * vec2(5.0, 7.0) + 0.5);
  float bars = min(
    smoothstep(0.07, 0.0, abs(grid.x - 0.5) - 0.38),
    smoothstep(0.07, 0.0, abs(grid.y - 0.5) - 0.38)
  );

  /* Decay / burning — some bars disappear */
  float decay = hash(floor(p * vec2(5.0, 7.0)));
  float burn  = smoothstep(0.5, 0.8, fbm(p * 3.0 + uTime * 0.12));
  bars *= (1.0 - burn * (1.0 - decay * 0.5));

  return bars;
}

/* ── Cursed Slashes ──────────────────────────────────────────────── */
float cursedSlash(vec2 uv, float seed, float timeOffset) {
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  vec2 p = (uv - 0.5) * asp;

  float t     = uTime * 0.4 + timeOffset;
  float epoch = floor(t + seed);
  float phase = fract(t + seed);

  /* Randomize slash direction and position per epoch */
  float angle  = hash1(epoch * 3.7 + seed)  * 3.14159 * 2.0;
  vec2  origin = vec2(hash1(epoch * 5.1 + seed) - 0.5, hash1(epoch * 2.9 + seed) - 0.5) * 1.2;
  vec2  dir    = vec2(cos(angle), sin(angle));
  vec2  perp   = vec2(-dir.y, dir.x);

  float along  = dot(p - origin, dir);
  float across = dot(p - origin, perp);

  /* Slash is a thin line that appears then fades */
  float appear = smoothstep(0.0, 0.12, phase);
  float fade   = 1.0 - smoothstep(0.4, 1.0, phase);
  float life   = appear * fade;

  float width  = 0.0025 + 0.002 * hash1(epoch + seed * 7.1);
  float len    = 0.5 + 0.4 * hash1(epoch * 1.3 + seed);

  float slash  = smoothstep(width, 0.0, abs(across))
               * smoothstep(len, 0.0, abs(along))
               * life;

  /* Afterglow — slightly wider glow around the slash */
  float glow   = smoothstep(0.03, 0.0, abs(across))
               * smoothstep(len * 1.3, 0.0, abs(along))
               * life * 0.4;

  return slash + glow;
}

/* ── Cursed Energy Smoke / Black Flames ──────────────────────────── */
vec3 cursedSmoke(vec2 uv) {
  vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0);

  /* Upward drifting smoke */
  vec2 sp = p + vec2(0.0, uTime * 0.15);
  float n1 = fbm(sp * 2.5);
  float n2 = fbm(sp * 1.2 + 3.1);

  /* Dark smoke — very slightly lighter than black */
  float smoke = pow(n1 * n2, 1.5) * 0.6;

  /* Bottom-heavy — more smoke at the base */
  float base = smoothstep(0.6, -0.4, p.y);
  smoke *= base;

  /* Color: nearly black with a hint of deep crimson */
  return mix(vec3(0.0), vec3(0.25, 0.0, 0.02), smoke);
}

/* ── Blood Moon (Sukuna's eye / sun in the domain) ───────────────── */
float bloodMoon(vec2 uv) {
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  vec2 p = (uv - 0.5) * asp;

  /* Moon is offset slightly upward */
  vec2 mc = vec2(0.0, 0.08);
  float r  = length(p - mc);

  /* Core disk */
  float moon = smoothstep(0.18, 0.14, r);

  /* Bleeding corona */
  float corona = smoothstep(0.45, 0.14, r) * 0.3;

  /* Pulsing */
  float pulse = 0.85 + 0.15 * sin(uTime * 1.2);
  moon *= pulse;

  /* Blood drip texture on the moon surface */
  float drip = fbm(p * 6.0 + uTime * 0.05) * 0.4;
  moon = mix(moon, moon * (0.7 + drip), 0.5);

  return moon + corona * pulse;
}

/* ── Cursed Marks (Sukuna's tattoo patterns) ─────────────────────── */
float cursedMarks(vec2 uv) {
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  vec2 p = (uv - 0.5) * asp;

  float r = length(p);
  float a = atan(p.y, p.x);

  /* Radiating marks — 4 sets at 90° intervals (Sukuna has 4 eyes/marks) */
  float marks = 0.0;
  for(int i = 0; i < 4; i++) {
    float fi    = float(i);
    float theta = fi * 1.5708 + uTime * 0.05; /* 90° apart */
    float da    = mod(a - theta + 3.14159, 3.14159 * 2.0) - 3.14159;

    /* Blade-like mark radiating outward */
    float blade = smoothstep(0.04, 0.0, abs(da) - 0.015 * (1.0 + r * 2.0))
                * smoothstep(0.05, 0.12, r)
                * smoothstep(1.2, 0.3, r);
    marks += blade;
  }

  /* Expanding ring from center — the domain boundary */
  float ring = smoothstep(0.012, 0.0, abs(r - 0.45 - 0.05 * sin(uTime * 0.8)))
             * smoothstep(0.5, 0.2, r * 0.5);
  marks += ring * 0.6;

  return marks;
}

/* ── Vignette ────────────────────────────────────────────────────── */
float vignette(vec2 uv) {
  vec2 p = uv - 0.5;
  return 1.0 - dot(p, p) * 2.8;
}

void main() {
  vec2 uv = vUv;

  /* ── Base: black void ───────────────────────────────────────────── */
  vec3 col = vec3(0.0);

  /* ── Cursed energy background glow ──────────────────────────────── */
  vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0);
  float en1 = fbm(p * 1.4 + uTime * 0.06);
  float en2 = fbm(p * 0.9 - uTime * 0.04 + 2.1);
  float cursedEnergy = pow(en1 * en2, 2.0);

  /* Deep crimson energy swirling in the background */
  col += vec3(0.35, 0.0, 0.01) * cursedEnergy * 0.8;
  col += vec3(0.15, 0.0, 0.0) * pow(fbm(p * 2.5 + uTime * 0.1), 3.0) * 0.6;

  /* ── Shrine lattice ─────────────────────────────────────────────── */
  float lattice = shrineLattice(uv);
  col += vec3(0.4, 0.05, 0.02) * lattice * 0.5;
  col += vec3(0.9, 0.15, 0.05) * lattice * lattice * 0.15; /* Glowing edges */

  /* ── Blood moon ─────────────────────────────────────────────────── */
  float moon = bloodMoon(uv);
  col += vec3(0.8, 0.02, 0.01) * moon;
  col += vec3(0.4, 0.0, 0.0)   * pow(moon, 0.5) * 0.4; /* Corona */

  /* ── Cursed marks ───────────────────────────────────────────────── */
  float marks = cursedMarks(uv);
  col += vec3(0.9, 0.05, 0.02) * marks * 0.9;
  col += vec3(0.3, 0.0, 0.0)   * marks * 0.4;

  /* ── Cursed slashes ─────────────────────────────────────────────── */
  float slashes = 0.0;
  slashes += cursedSlash(uv, 0.13, 0.0);
  slashes += cursedSlash(uv, 0.71, 0.37);
  slashes += cursedSlash(uv, 0.29, 0.82);
  slashes += cursedSlash(uv, 0.55, 1.41);
  slashes += cursedSlash(uv, 0.93, 2.03);

  /* White-hot at center of slash, blood red at edges */
  col += mix(vec3(1.0, 0.8, 0.8), vec3(0.8, 0.0, 0.0), 0.5) * slashes;

  /* ── Black flames / smoke ───────────────────────────────────────── */
  col += cursedSmoke(uv);

  /* ── Mouse influence (curse tracks the viewer) ──────────────────── */
  vec2 mouse = (uMouse - 0.5) * vec2(uRes.x/uRes.y, 1.0);
  float mDist = length(p - mouse);
  col += vec3(0.5, 0.0, 0.0) * smoothstep(0.5, 0.0, mDist) * 0.15;

  /* ── Vignette ───────────────────────────────────────────────────── */
  float vig = clamp(vignette(uv), 0.0, 1.0);
  col *= vig;

  /* ── Tone ───────────────────────────────────────────────────────── */
  col = col / (col + vec3(0.8));          /* Reinhard */
  col = pow(col, vec3(0.9));              /* Gamma */

  /* Deep shadows should be almost-black with a blood warmth */
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(0.04, 0.0, 0.0) * lum, col, 0.9);

  gl_FragColor = vec4(col, 1.0);
}
`

/* ═══════════════════════════════════════════════════════════════════════
   GOJO'S DOMAIN — INFINITE VOID / MUGEN (無限)
   "Within my domain, all attacks are guaranteed to hit.
    But more importantly — you'll experience everything."
   
   Visual elements:
   • Infinite geometric grid stretching to the horizon
   • The Six Eyes iris pattern at center (Gojo's eyes)
   • Hollow Purple energy (blue+red convergence into violet)
   • Fibonacci spiral arms of information
   • Blue-white celestial light overflowing
   • Infinity symbol (∞) formed by lensing
   • Space itself appears to fold and repeat
   • Everything is magnified — infinite sensory information
════════════════════════════════════════════════════════════════════════ */

const GOJO_VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const GOJO_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;

/* ── Noise ─────────────────────────────────────────────────────────── */
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float hash1(float v) { return fract(sin(v*127.1)*43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0,a=0.5; mat2 r=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.1;a*=0.5;}
  return v;
}

/* ── Infinite Void Grid (perspective looking into eternity) ──────── */
float infiniteGrid(vec2 uv) {
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  vec2 p = (uv - 0.5) * asp;

  /* Polar to create radial grid */
  float r = length(p);
  float a = atan(p.y, p.x);

  /* Map to infinite-looking depth: the grid appears to rush FROM the center */
  float depth = 1.0 / (r + 0.01);
  vec2 gUV = vec2(
    a / (3.14159) * 6.0,
    log(depth) - uTime * 0.5
  );

  vec2 gf = fract(gUV) - 0.5;
  float grid = min(
    smoothstep(0.04, 0.0, abs(gf.x) - 0.44),
    smoothstep(0.04, 0.0, abs(gf.y) - 0.44)
  );

  /* Fade toward center (where the eyes are) */
  float fade = smoothstep(0.02, 0.5, r);
  /* Fade toward edge */
  float outer = smoothstep(1.2, 0.5, r);

  return grid * fade * outer;
}

/* ── The Six Eyes ────────────────────────────────────────────────── */
/* Gojo's cursed technique stems from his Six Eyes — an iris with
   hexagonal facets that see everything at the atomic level */
float sixEyes(vec2 p) {
  float r = length(p);
  float a = atan(p.y, p.x);

  /* Outer iris rim */
  float iris = smoothstep(0.32, 0.28, r) * smoothstep(0.04, 0.1, r);

  /* Iris texture — concentric ripples */
  float irisDetail = 0.0;
  for(int i = 1; i <= 6; i++) {
    float fi   = float(i);
    float ring = smoothstep(0.018, 0.0, abs(r - fi * 0.045));
    irisDetail += ring * (1.0 - fi * 0.12);
  }

  /* Six radial lines (the six eyes) emanating from pupil */
  float sixLines = 0.0;
  for(int i = 0; i < 6; i++) {
    float fi    = float(i) / 6.0 * 3.14159 * 2.0;
    float da    = mod(a - fi + 3.14159, 3.14159*2.0) - 3.14159;
    float spoke = smoothstep(0.03, 0.0, abs(da)) * smoothstep(0.0, 0.05, r) * smoothstep(0.29, 0.05, r);
    sixLines += spoke;
  }

  /* Pupil (black center — the void) */
  float pupil = smoothstep(0.045, 0.035, r);

  return (iris * 0.6 + irisDetail * 0.7 + sixLines * 0.8) * (1.0 - pupil) + pupil * 0.0;
}

/* ── Hollow Purple (Red technique + Blue technique = Purple) ──────── */
/* The convergence of +∞ and -∞ produces an unstoppable force */
float hollowPurple(vec2 uv) {
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  vec2 p = (uv - 0.5) * asp;

  /* Two beams: Red (infinity+) from left, Blue (infinity-) from right
     They converge at center into the Purple */
  float t = uTime * 0.3;

  /* Red beam position */
  vec2 redOrigin  = vec2(-1.5, sin(t * 0.7) * 0.1);
  /* Blue beam position */
  vec2 blueOrigin = vec2( 1.5, sin(t * 0.7 + 1.57) * 0.1);
  /* They meet at center */
  vec2 purpleCenter = vec2(0.0, 0.0);

  /* Line from redOrigin to purpleCenter */
  vec2 redDir = normalize(purpleCenter - redOrigin);
  vec2 redPerp = vec2(-redDir.y, redDir.x);
  float redAlong = dot(p - redOrigin, redDir);
  float redAcross = dot(p - redOrigin, redPerp);
  float redBeam = smoothstep(0.04, 0.0, abs(redAcross))
                * step(0.0, redAlong)
                * smoothstep(length(purpleCenter - redOrigin) + 0.1, 0.0, redAlong);

  /* Line from blueOrigin to purpleCenter */
  vec2 blueDir = normalize(purpleCenter - blueOrigin);
  vec2 bluePerp = vec2(-blueDir.y, blueDir.x);
  float blueAlong = dot(p - blueOrigin, blueDir);
  float blueAcross = dot(p - blueOrigin, bluePerp);
  float blueBeam = smoothstep(0.04, 0.0, abs(blueAcross))
                 * step(0.0, blueAlong)
                 * smoothstep(length(purpleCenter - blueOrigin) + 0.1, 0.0, blueAlong);

  /* Purple impact sphere at center */
  float purpleSphere = smoothstep(0.15, 0.0, length(p)) * 0.5;
  float purpleGlow   = smoothstep(0.5,  0.0, length(p)) * 0.2;

  return (redBeam + blueBeam) * (0.5 + 0.5 * sin(uTime * 2.0)) + purpleSphere + purpleGlow;
}

/* ── Fibonacci Spiral of Information ─────────────────────────────── */
/* In the Infinite Void, you perceive EVERYTHING simultaneously.
   Fibonacci spirals represent the infinite information overwhelming the mind */
float fibSpiral(vec2 uv) {
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  vec2 p = (uv - 0.5) * asp;
  float r = length(p);
  float a = atan(p.y, p.x);

  /* Golden angle: 137.5° = 2π / φ² */
  float golden = 2.39996;

  float spiral = 0.0;
  for(int i = 0; i < 3; i++) {
    float fi     = float(i);
    float spiralR = sqrt(fi * 0.08 + 0.01);
    float spiralA = fi * golden;
    float da      = mod(a - spiralA - uTime * 0.1, 3.14159 * 2.0);
    float dr      = abs(r - spiralR - 0.015 * cos(da * 8.0 - uTime));
    spiral += smoothstep(0.012, 0.0, dr) * (1.0 - fi * 0.25) * 0.3;
  }
  return spiral;
}

/* ── Starfield of Information ─────────────────────────────────────── */
float infoStars(vec2 uv) {
  float stars = 0.0;
  for(int layer = 0; layer < 3; layer++) {
    float sc = 80.0 + float(layer) * 60.0;
    vec2  g  = floor(uv * sc);
    vec2  f  = fract(uv * sc);
    float h  = hash(g + float(layer) * 7.3);
    if(h > 0.9) {
      float d = length(f - 0.5 - (fract(vec2(h*13.1, h*7.7)) - 0.5)*0.4);
      float sz = h * h * 0.006;
      float tw = 0.5 + 0.5 * sin(uTime*(1.0+h*4.0)+h*6.28);
      stars += smoothstep(sz, 0.0, d) * tw * (1.0 - float(layer)*0.2);
    }
  }
  return stars;
}

/* ── Void Ripples (the domain pulsing) ───────────────────────────── */
float voidRipples(vec2 uv) {
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  vec2 p   = (uv-0.5)*asp;
  float r  = length(p);

  float ripples = 0.0;
  for(int i = 0; i < 4; i++) {
    float fi  = float(i);
    float rad = fract(uTime * 0.2 + fi * 0.25) * 1.8;
    ripples  += smoothstep(0.008, 0.0, abs(r - rad)) * (1.0 - rad/1.8);
  }
  return ripples;
}

void main() {
  vec2 uv = vUv;
  vec2 asp = vec2(uRes.x/uRes.y, 1.0);
  vec2 p   = (uv - 0.5) * asp;

  /* ── Base: deep space void ──────────────────────────────────────── */
  vec3 col = vec3(0.0, 0.005, 0.02);

  /* ── Starfield — the infinite information ──────────────────────── */
  float stars = infoStars(uv);
  col += vec3(0.7, 0.85, 1.0) * stars * 0.9;

  /* ── Infinite grid ─────────────────────────────────────────────── */
  float grid = infiniteGrid(uv);
  col += mix(vec3(0.05, 0.15, 0.4), vec3(0.2, 0.5, 1.0), grid) * grid * 1.1;
  col += vec3(0.1, 0.3, 0.8) * grid * 0.3; /* Grid glow */

  /* ── Void ripples ──────────────────────────────────────────────── */
  float ripples = voidRipples(uv);
  col += vec3(0.15, 0.4, 0.9) * ripples * 0.6;

  /* ── Fibonacci spiral ──────────────────────────────────────────── */
  float fib = fibSpiral(uv);
  col += vec3(0.3, 0.7, 1.0) * fib;

  /* ── Hollow Purple beam ────────────────────────────────────────── */
  float hp  = hollowPurple(uv);
  vec3 hpCol = mix(vec3(0.5, 0.0, 1.0), vec3(1.0, 0.0, 0.6), hp * 0.5 + 0.2 * sin(uTime));
  col += hpCol * hp * 0.8;

  /* ── Blue-white celestial glow from center ──────────────────────── */
  float cGlow = smoothstep(1.2, 0.0, length(p)) * 0.4;
  col += vec3(0.1, 0.3, 0.8) * cGlow;
  float cCore = smoothstep(0.5, 0.0, length(p)) * 0.3;
  col += vec3(0.5, 0.8, 1.0) * cCore;

  /* ── Six Eyes iris ─────────────────────────────────────────────── */
  float eyes = sixEyes(p);
  /* Iris: ice-blue with hints of gold (the Six Eyes see all) */
  vec3 eyeCol = mix(
    vec3(0.1, 0.55, 1.0),    /* Blue iris */
    vec3(0.9, 0.95, 1.0),    /* White pupil-ring */
    smoothstep(0.0, 0.3, length(p))
  );
  col += eyeCol * eyes * 1.5;
  col += vec3(0.2, 0.6, 1.0) * eyes * eyes * 2.0; /* Bright glow */

  /* ── Mouse gravity ─────────────────────────────────────────────── */
  vec2 mouse = (uMouse - 0.5) * asp;
  float mDist = length(p - mouse);
  col += vec3(0.1, 0.3, 0.8) * smoothstep(0.4, 0.0, mDist) * 0.25;

  /* ── Vignette (the void has soft edges — it goes on forever) ────── */
  float vig = 1.0 - dot(p*0.5, p*0.5) * 0.8;
  col *= clamp(vig, 0.0, 1.0);

  /* ── Tone mapping ──────────────────────────────────────────────── */
  col = col / (col + vec3(0.6));
  col = pow(col, vec3(0.88));

  /* Cinematic blue shadow lift */
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(0.0, 0.01, 0.04) * (1.0 - lum), col, 0.88);

  gl_FragColor = vec4(col, 1.0);
}
`

/* ═══════════════════════════════════════════════════════════════════
   WebGL bootstrap helpers
══════════════════════════════════════════════════════════════════════ */
function compileShader(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(s))
    return null
  }
  return s
}

function linkProgram(gl, vert, frag) {
  const p = gl.createProgram()
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, vert))
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, frag))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(p))
    return null
  }
  return p
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT — accepts domain='sukuna' | 'gojo'
══════════════════════════════════════════════════════════════════════ */
export default function DomainExpansion({ domain = 'gojo' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return

    const isSukuna = domain === 'sukuna'
    const prog = linkProgram(gl, isSukuna ? SUKUNA_VERT : GOJO_VERT, isSukuna ? SUKUNA_FRAG : GOJO_FRAG)
    if (!prog) return

    gl.useProgram(prog)

    /* Full-screen quad */
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    /* Uniform locations */
    const uTime  = gl.getUniformLocation(prog, 'uTime')
    const uRes   = gl.getUniformLocation(prog, 'uRes')
    const uMouse = gl.getUniformLocation(prog, 'uMouse')

    /* Mouse */
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const onMove = (e) => {
      mouse.tx = e.clientX / window.innerWidth
      mouse.ty = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)

    /* Resize */
    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    /* Render */
    const start = performance.now()
    let raf
    function render() {
      raf = requestAnimationFrame(render)
      const t = (performance.now() - start) * 0.001
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      gl.uniform1f(uTime,  t)
      gl.uniform2f(uRes,   canvas.width, canvas.height)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
    }
  }, [domain])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
