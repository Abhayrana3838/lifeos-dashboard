'use client'
import { useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════════════
   VERTEX SHADER — full-screen clip-space quad (no projection needed)
════════════════════════════════════════════════════════════════════════ */
const VERT_SRC = `
attribute vec2 aPos;
varying   vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

/* ═══════════════════════════════════════════════════════════════════════
   FRAGMENT SHADER — Gravitational Singularity Engine
   Features:
     1. Starfield + procedural nebula (background, sampled through bent UV)
     2. Cosmic web filaments
     3. Schwarzschild gravitational lensing (bends UV toward BH)
     4. Event horizon (true blackness at r < r_s)
     5. Photon ring at r ≈ 1.5 * r_s (Einstein ring)
     6. Accretion disk — blackbody temperature coloring, Doppler beaming
     7. Relativistic polar jets (synchrotron blue-purple)
     8. Gravitational wave rings expanding outward
     9. Infalling matter streams (spiraling toward BH)
    10. Chromatic aberration near horizon
    11. Full HDR tone mapping + cinematic LUT
    12. uEnergy reactive (intensity scales with user productivity)
    13. Mouse gravity field (cursor creates subtle energy ripple)
════════════════════════════════════════════════════════════════════════ */
const FRAG_SRC = `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform float uEnergy;
uniform vec2  uMouse;    // 0..1 normalized
uniform vec2  uRes;      // viewport resolution (px)

/* ── Hashing / Noise ─────────────────────────────────────────────── */
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  return fract(p * (p + p));
}
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash12(i),             b = hash12(i + vec2(1,0));
  float c = hash12(i + vec2(0,1)), d = hash12(i + vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.55;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for(int i = 0; i < 7; i++) { v += a*noise(p); p = rot*p*2.1; a *= 0.5; }
  return v;
}
float fbm3(vec2 p) { return fbm(p + fbm(p + fbm(p))); }

/* ── Starfield ───────────────────────────────────────────────────── */
vec3 starfield(vec2 uv) {
  vec3 stars = vec3(0.0);
  for(int layer = 0; layer < 4; layer++) {
    float scale  = 60.0 + float(layer) * 55.0;
    float bright = 1.0 - float(layer) * 0.2;
    vec2  grid   = floor(uv * scale);
    vec2  local  = fract(uv * scale);
    float h      = hash12(grid + float(layer) * 7.3);
    if (h > 0.88) {
      vec2  pos    = hash22(grid + float(layer)) - 0.5;
      float d      = length(local - 0.5 - pos * 0.4);
      float sz     = h * h * 0.006;
      float twinkle= 0.6 + 0.4 * sin(uTime * (1.0 + h*4.0) + h*6.28);
      float star   = smoothstep(sz, 0.0, d) * twinkle * bright;
      /* Color tint by temperature class */
      vec3 sc = mix(vec3(1.0,0.7,0.4), vec3(0.7,0.85,1.0), h);
      stars += sc * star;
    }
  }
  return stars;
}

/* ── Nebula / Cosmic Fog ─────────────────────────────────────────── */
vec3 nebula(vec2 uv) {
  float n1 = fbm3(uv * 1.1 + uTime * 0.006);
  float n2 = fbm(uv * 0.85 - uTime * 0.004 + 5.31);
  float n3 = fbm(uv * 1.5  + uTime * 0.009 + 2.17);

  vec3 c1 = vec3(0.22, 0.04, 0.55) * pow(n1, 1.8) * 1.2;
  vec3 c2 = vec3(0.03, 0.12, 0.50) * pow(n2, 2.0) * 0.9;
  vec3 c3 = vec3(0.55, 0.07, 0.28) * pow(n3 * n1, 2.5) * 1.5;
  vec3 c4 = vec3(0.02, 0.35, 0.45) * pow(n2 * n3, 2.0) * 0.8;

  return (c1 + c2 + c3 + c4) * 0.10;
}

/* ── Cosmic Web ──────────────────────────────────────────────────── */
vec3 cosmicWeb(vec2 uv) {
  float web = 0.0;
  for(int i = 0; i < 6; i++) {
    float fi   = float(i);
    vec2 warp  = vec2(
      fbm(uv * 0.7 + fi * 3.11 + uTime * 0.018),
      fbm(uv * 0.7 + fi * 5.47 - uTime * 0.015 + 4.0)
    );
    float line = 0.012 / (length(warp - 0.5) + 0.003);
    web += line;
  }
  vec3 webColor = mix(vec3(0.18,0.06,0.45), vec3(0.05,0.25,0.55), fract(web * 0.4));
  return webColor * web * 0.005;
}

/* ── Gravitational Lensing ───────────────────────────────────────── */
/* Bends background UV coordinates away from BH (apparent source shifts) */
vec2 gravLens(vec2 uv, vec2 bhPos, float rs) {
  vec2  d = uv - bhPos;
  float r = length(d);
  float r2 = r * r;

  /* Deflection field (Einstein bending, weak-field): ∝ rs / r */
  float def = 1.6 * rs * rs / (r2 + 0.0001);
  def = clamp(def, 0.0, 1.2);

  /* Strong lensing: add secondary image ring near photon sphere */
  float photonR = rs * 1.5;
  float strong  = smoothstep(photonR * 1.6, photonR, r) * 0.35;
  def += strong;

  return uv + normalize(d) * def; /* Push UV OUTWARD (apparent background moves out) */
}

/* ── Blackbody Color ─────────────────────────────────────────────── */
/* temp: 0.0 = cold (red) → 1.0 = hot (blue-white) */
vec3 blackbody(float temp) {
  temp = clamp(temp, 0.0, 1.0);
  if (temp < 0.25) return mix(vec3(0.15,0.0,0.0),  vec3(0.9,0.2,0.03),  temp*4.0);
  if (temp < 0.5)  return mix(vec3(0.9,0.2,0.03),  vec3(1.0,0.85,0.3),  (temp-0.25)*4.0);
  if (temp < 0.75) return mix(vec3(1.0,0.85,0.3),  vec3(1.0,1.0,0.85),  (temp-0.5)*4.0);
                   return mix(vec3(1.0,1.0,0.85),   vec3(0.75,0.88,1.0), (temp-0.75)*4.0);
}

/* ── Accretion Disk ──────────────────────────────────────────────── */
vec4 accretionDisk(vec2 uv, vec2 bh, float rs) {
  vec2  d    = uv - bh;
  float r    = length(d);
  float ang  = atan(d.y, d.x);

  float rISCO = rs * 3.0;   /* Innermost stable circular orbit */
  float rOut  = rs * 11.0;  /* Outer disk edge */

  if (r < rISCO * 0.88 || r > rOut) return vec4(0.0);

  /* Vertical extent — we view the disk slightly tilted */
  float ar       = uRes.x / uRes.y;
  float yFrac    = abs(d.y / (d.x + 0.001)) * ar;  /* Tilt factor */
  float diskH    = 0.18 + 0.08 * (r / rOut);        /* Disk flares outward */
  float inDisk   = smoothstep(diskH, diskH * 0.25, yFrac);
  if (inDisk < 0.005) return vec4(0.0);

  /* Temperature profile: T ∝ r^(-3/4) */
  float tempNorm = pow(clamp(1.0 - (r - rISCO) / (rOut - rISCO), 0.0, 1.0), 1.2);
  vec3  diskColor = blackbody(tempNorm);

  /* Relativistic Doppler beaming */
  /* Matter orbits CCW: right side (cos≈1) approaches → blueshift+bright */
  /* Left side (cos≈-1) recedes → redshift+dim */
  float v_r    = cos(ang + uTime * 0.12); /* Simplified orbital velocity component */
  float beaming = pow(1.0 + 0.75 * v_r, 3.0);
  beaming = clamp(beaming, 0.08, 3.5);

  /* Apply blueshift/redshift to disk color */
  diskColor = mix(diskColor * vec3(0.6, 0.3, 0.1),  /* receding: redder */
                  diskColor * vec3(0.9, 1.1, 1.4),  /* approaching: bluer */
                  (v_r * 0.5 + 0.5));

  /* MHD turbulence (magnetorotational instability) */
  float turb1 = fbm(d * 3.5  + vec2(uTime * 0.4, 0.0));
  float turb2 = fbm(d * 7.0  - vec2(0.0, uTime * 0.6));
  float turb  = 0.55 + 0.45 * mix(turb1, turb2, 0.5);

  /* Spiral accretion streams */
  float streamAng = ang * 2.5 - uTime * 1.8 + r * 8.0;
  float stream    = pow(abs(sin(streamAng)), 7.0) * (1.0 - r / rOut) * 1.5;

  float brightness = inDisk * turb * beaming * (0.4 + 0.6 * tempNorm + stream * 0.35);

  return vec4(diskColor * brightness * uEnergy, brightness);
}

/* ── Polar Jets (synchrotron radiation) ──────────────────────────── */
float polarJets(vec2 uv, vec2 bh, float rs) {
  vec2  d    = uv - bh;
  float r    = length(d);
  float ar   = uRes.x / uRes.y;

  /* Collimated beam along vertical axis */
  float xNorm  = abs(d.x) / ar;
  float yAbs   = abs(d.y);

  /* Jet only outside ISCO */
  float startY = rs * 1.4;
  if (yAbs < startY || xNorm > 0.06 + yAbs * 0.05) return 0.0;

  /* Collimation factor — tighter near BH, expands outward */
  float col  = smoothstep(0.06 + yAbs * 0.05, 0.0, xNorm);

  /* Fade at top */
  float fade = smoothstep(rs * 14.0, rs * 4.0, yAbs);

  /* Turbulent brightness */
  float noise1 = fbm(vec2(d.x * 6.0, d.y * 2.0 - uTime * 2.5));
  float brt    = col * fade * (0.35 + 0.65 * noise1);

  /* Limb brightening ring along jet */
  float kink = sin(d.y * 15.0 - uTime * 3.0) * 0.04;
  float jet2 = smoothstep(0.02, 0.0, abs(d.x / ar - kink)) * fade * 0.6;

  return brt + jet2;
}

/* ── Gravitational Wave Rings ────────────────────────────────────── */
float gravWaves(float r) {
  float t    = uTime * 0.35;
  float rings = 0.0;
  for(int i = 0; i < 5; i++) {
    float fi    = float(i);
    float radius = fract(t + fi * 0.2) * 2.2;
    float fade   = 1.0 - radius / 2.2;
    float ring   = smoothstep(0.009, 0.0, abs(r - radius)) * fade * fade;
    rings += ring;
  }
  return rings;
}

/* ── Infalling Matter Streams ────────────────────────────────────── */
float infallingMatter(vec2 uv, vec2 bh, float rs) {
  vec2  d    = uv - bh;
  float r    = length(d);
  float ang  = atan(d.y, d.x);

  if (r > rs * 15.0 || r < rs * 0.8) return 0.0;

  /* Logarithmic spiral: ang + log(r) * factor */
  float spiral  = ang + log(r / rs + 1.0) * 4.0 - uTime * 0.9;
  float streams = pow(abs(sin(spiral * 2.0)), 9.0);
  float density = (1.0 - r / (rs * 15.0)) * smoothstep(rs, rs * 2.5, r);

  return streams * density * 0.6;
}

/* ── Chromatic Aberration (near horizon) ─────────────────────────── */
vec3 chromaticAberration(vec2 uv, vec2 bh, float rs, float t) {
  vec2  d    = uv - bh;
  float r    = length(d);
  float power= clamp(rs * 2.5 / (r + rs * 0.5), 0.0, 1.0);

  vec2 dir = normalize(d) * power * 0.018;

  vec3 colR = starfield(uv + dir * 1.2) + nebula(uv + dir * 1.2);
  vec3 colG = starfield(uv)              + nebula(uv);
  vec3 colB = starfield(uv - dir * 1.2) + nebula(uv - dir * 1.2);

  return vec3(colR.r, colG.g, colB.b);
}

/* ── HDR Tone Mapping ────────────────────────────────────────────── */
vec3 aces(vec3 x) {
  float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

/* ── Cinematic Color Grade ────────────────────────────────────────── */
vec3 colorGrade(vec3 c) {
  /* Lift shadows to deep blue-purple */
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  vec3 shadow = mix(vec3(0.015, 0.008, 0.04), vec3(1.0), lum);
  c = mix(shadow, c, 0.85);
  /* Slight teal in midtones */
  c = mix(c, c * vec3(0.92, 1.02, 1.05), 0.25);
  /* Slight contrast S-curve */
  c = mix(c, pow(c, vec3(1.1)), 0.4);
  return c;
}

/* ═════════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════════ */
void main() {
  vec2 ar    = vec2(uRes.x / uRes.y, 1.0);
  vec2 uv    = (vUv - 0.5) * ar;    /* Centered, aspect-corrected NDC */

  /* Black hole at screen center; size reacts to energy */
  vec2  bhPos = vec2(0.0);
  float rs    = 0.13 * uEnergy;

  float r = length(uv - bhPos);

  /* ── 1. Gravitational lensing: bend background UV ─────────────── */
  vec2 lensedUV = gravLens(uv / ar, bhPos / ar, rs / ar.x) * ar;

  /* ── 2. Background through bent space ────────────────────────── */
  vec3 bg = vec3(0.0);

  /* Chromatic aberration near horizon */
  bg += chromaticAberration(lensedUV / ar, bhPos / ar, rs / ar.x, uTime) * 0.5;

  /* Cosmic web */
  bg += cosmicWeb(lensedUV * 0.85 + uTime * 0.003);

  /* ── 3. Event horizon (the abyss) ────────────────────────────── */
  float horizon = smoothstep(rs, rs * 0.78, r);
  bg *= 1.0 - horizon;

  /* ── 4. Accretion disk ────────────────────────────────────────── */
  vec4 disk = accretionDisk(uv, bhPos, rs);
  bg = mix(bg, disk.rgb, clamp(disk.a * (1.0 - horizon * 1.5), 0.0, 1.0));

  /* Disk glow halo */
  vec4 diskGlow = accretionDisk(uv * 0.94, bhPos, rs);
  bg += diskGlow.rgb * 0.06 * (1.0 - horizon);

  /* ── 5. Photon ring ──────────────────────────────────────────── */
  float photonR  = rs * 1.5;
  float photon   = smoothstep(photonR * 1.35, photonR, r) * smoothstep(photonR * 0.65, photonR, r);
  float photonMask = 1.0 - smoothstep(photonR * 0.8, rs * 0.85, r); /* Above event horizon */
  bg += vec3(0.92, 0.97, 1.0) * photon * photonMask * 0.8;

  /* ── 6. Polar jets ───────────────────────────────────────────── */
  float jet = polarJets(uv, bhPos, rs);
  vec3  jetCol = mix(vec3(0.25, 0.04, 0.9), vec3(0.05, 0.6, 1.0), jet * 0.7);
  bg += jetCol * jet * 0.25 * uEnergy;

  /* ── 7. Gravitational waves ──────────────────────────────────── */
  float waves = gravWaves(r);
  bg += vec3(0.35, 0.15, 0.85) * waves * (1.0 - horizon) * 0.12;

  /* ── 8. Infalling matter ─────────────────────────────────────── */
  float matter = infallingMatter(uv, bhPos, rs);
  vec3  matterCol = mix(vec3(0.7, 0.3, 0.05), vec3(0.15, 0.55, 0.9), matter * 0.5);
  bg += matterCol * matter * 0.12 * (1.0 - horizon);

  /* ── 9. Mouse gravity field ──────────────────────────────────── */
  vec2  mouseNDC = (uMouse - 0.5) * ar;
  float mDist    = length(uv - mouseNDC);
  float mGlow    = smoothstep(0.6, 0.0, mDist) * 0.06;
  bg += vec3(0.18, 0.06, 0.45) * mGlow;

  /* ── 10. Vignette (deep space falloff) ───────────────────────── */
  float vig = 1.0 - smoothstep(0.65, 1.9, length(uv));
  bg *= vig;

  /* ── 11. Tone mapping + color grade ─────────────────────────── */
  bg = aces(bg * 1.1);
  bg = colorGrade(bg);
  bg = pow(bg, vec3(0.88)); /* Gamma */

  gl_FragColor = vec4(bg, 1.0);
}
`

/* ═══════════════════════════════════════════════════════════════════
   WebGL helpers
══════════════════════════════════════════════════════════════════════ */
function buildShader(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(s))
    return null
  }
  return s
}

function buildProgram(gl, vert, frag) {
  const p = gl.createProgram()
  gl.attachShader(p, buildShader(gl, gl.VERTEX_SHADER, vert))
  gl.attachShader(p, buildShader(gl, gl.FRAGMENT_SHADER, frag))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(p))
    return null
  }
  return p
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function LivingBackground({ stats }) {
  const canvasRef = useRef(null)
  const energy = Math.max(0.4, Math.min(1.6, ((stats?.scores?.overallScore || 30) / 60) + ((stats?.streak || 0) * 0.015)))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    /* Init WebGL */
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) { console.warn('WebGL not supported'); return }

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    /* Full-screen quad: two triangles covering clip space */
    const quadVerts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW)

    const prog = buildProgram(gl, VERT_SRC, FRAG_SRC)
    if (!prog) return

    gl.useProgram(prog)

    /* Attribute */
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    /* Uniforms */
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uEnergy = gl.getUniformLocation(prog, 'uEnergy')
    const uMouse = gl.getUniformLocation(prog, 'uMouse')
    const uRes = gl.getUniformLocation(prog, 'uRes')

    /* Mouse tracking */
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const onMove = (e) => { mouse.tx = e.clientX / window.innerWidth; mouse.ty = 1 - e.clientY / window.innerHeight }
    window.addEventListener('mousemove', onMove)

    /* Resize */
    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    /* Render loop */
    const start = performance.now()
    let raf

    function render() {
      raf = requestAnimationFrame(render)
      const t = (performance.now() - start) * 0.001

      /* Smooth mouse */
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05

      gl.uniform1f(uTime, t)
      gl.uniform1f(uEnergy, energy)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform2f(uRes, canvas.width, canvas.height)

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
  }, [energy])

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
