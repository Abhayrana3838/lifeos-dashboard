const lerp = (a, b, t) => a + (b - a) * t;
const perlinPerm = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]]
  }
  return [...p, ...p]
})();

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10) }
function grad(hash, x, y) {
  const h = hash & 3
  const u = h < 2 ? x : y
  const v = h < 2 ? y : x
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v)
}
function noise2D(x, y) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255
  x -= Math.floor(x); y -= Math.floor(y)
  const u = fade(x), v = fade(y)
  const a = perlinPerm[X] + Y, b = perlinPerm[X + 1] + Y
  return lerp(v,
    lerp(u, grad(perlinPerm[a], x, y), grad(perlinPerm[b], x - 1, y)),
    lerp(u, grad(perlinPerm[a + 1], x, y - 1), grad(perlinPerm[b + 1], x - 1, y - 1))
  ) * 0.5 + 0.5
}

console.log("Starting noise test...");
for (let i = 0; i < 100000; i++) {
  const x = Math.random() * 1000 - 500;
  const y = Math.random() * 1000 - 500;
  const val = noise2D(x, y);
  if (isNaN(val) || val === undefined) {
    console.error(`Error at x=${x}, y=${y}: val is ${val}`);
    process.exit(1);
  }
}
console.log("Noise test completed successfully!");
