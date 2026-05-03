/**
 * PCA (2D) + k-means for archetype visualization, aligned with Analysis/cluster.py:
 * - KMeans(n_clusters=4, random_state=42, n_init=10) — k-means++ init, best run by inertia.
 * - PCA(n_components=2, random_state=42) structure: center columns of X with sample mean,
 *   covariance with divisor (n−1); first two PCs by power iteration on the covariance.
 */

function zeros(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
}

function matVec(C: number[][], v: number[]): number[] {
  return C.map((row) => row.reduce((s, c, i) => s + c * (v[i] ?? 0), 0));
}

function dot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0);
}

function norm(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
}

function scale(v: number[], s: number): number[] {
  return v.map((x) => x * s);
}

function subtract(v: number[], w: number[]): number[] {
  return v.map((x, i) => x - (w[i] ?? 0));
}

function outer(u: number[], v: number[]): number[][] {
  const out = zeros(u.length, v.length);
  for (let i = 0; i < u.length; i++) {
    for (let j = 0; j < v.length; j++) {
      out[i]![j] = u[i]! * v[j]!;
    }
  }
  return out;
}

function dist2Row(a: number[], b: number[]): number {
  let s = 0;
  for (let j = 0; j < a.length; j++) {
    const d = (a[j] ?? 0) - (b[j] ?? 0);
    s += d * d;
  }
  return s;
}

/** xorshift32 + Mulberry-ish mix → uniform [0, 1); deterministic stream per seed (approx. sklearn RNG usage). */
function createRng(seed: number): { next01: () => number; nextInt: (bound: number) => number } {
  let state = seed >>> 0 || 2463534242;
  return {
    next01(): number {
      state ^= state << 13;
      state >>>= 0;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      const t = Math.imul(state ^ (state >>> 15), state | 1);
      return ((t ^ (t >>> 7)) >>> 0) / 4294967296;
    },
    nextInt(bound: number): number {
      if (bound <= 0) return 0;
      return Math.floor(this.next01() * bound);
    },
  };
}

function kmeansPlusPlusCenters(X: number[][], k: number, rng: ReturnType<typeof createRng>): number[][] {
  const n = X.length;
  const centers: number[][] = [];
  const c0 = rng.nextInt(n);
  centers.push([...X[c0]!]);
  while (centers.length < k) {
    const distSq = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      let minD = Infinity;
      for (const c of centers) {
        const d2 = dist2Row(X[i]!, c);
        if (d2 < minD) minD = d2;
      }
      distSq[i] = minD;
    }
    let total = 0;
    for (let i = 0; i < n; i++) total += distSq[i]!;
    if (total <= 0 || !Number.isFinite(total)) {
      centers.push([...X[rng.nextInt(n)]!]);
      continue;
    }
    let r = rng.next01() * total;
    let pick = n - 1;
    for (let i = 0; i < n; i++) {
      r -= distSq[i]!;
      if (r <= 0) {
        pick = i;
        break;
      }
    }
    centers.push([...X[pick]!]);
  }
  return centers;
}

function inertiaLloyd(X: number[][], labels: number[], centers: number[][]): number {
  let s = 0;
  for (let i = 0; i < X.length; i++) {
    const c = labels[i] ?? 0;
    s += dist2Row(X[i]!, centers[c]!);
  }
  return s;
}

function kmeansSingle(
  X: number[][],
  k: number,
  initCenters: number[][],
  maxIter = 300,
  tol = 1e-4,
): { labels: number[]; centers: number[][] } {
  const n = X.length;
  const d = X[0]?.length ?? 0;
  let centers = initCenters.map((row) => [...row]);
  const labels = Array.from({ length: n }, () => 0);

  for (let iter = 0; iter < maxIter; iter++) {
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d2 = dist2Row(X[i]!, centers[c]!);
        if (d2 < bestD) {
          bestD = d2;
          best = c;
        }
      }
      labels[i] = best;
    }

    const newCenters = zeros(k, d);
    const counts = Array.from({ length: k }, () => 0);
    for (let i = 0; i < n; i++) {
      const c = labels[i]!;
      counts[c]!++;
      for (let j = 0; j < d; j++) {
        newCenters[c]![j]! += X[i]![j] ?? 0;
      }
    }

    for (let c = 0; c < k; c++) {
      if (counts[c]! === 0) {
        let bestI = 0;
        let bestScore = -1;
        for (let i = 0; i < n; i++) {
          let minToOthers = Infinity;
          for (let cc = 0; cc < k; cc++) {
            if (cc === c) continue;
            const dd = dist2Row(X[i]!, centers[cc]!);
            if (dd < minToOthers) minToOthers = dd;
          }
          if (minToOthers > bestScore) {
            bestScore = minToOthers;
            bestI = i;
          }
        }
        newCenters[c] = [...X[bestI]!];
      } else {
        const cnt = counts[c]!;
        for (let j = 0; j < d; j++) newCenters[c]![j]! /= cnt;
      }
    }

    let shift = 0;
    for (let c = 0; c < k; c++) {
      shift += dist2Row(centers[c]!, newCenters[c]!);
    }
    centers = newCenters;
    if (shift <= tol) break;
  }

  return { labels, centers };
}

/** Column means of n×d matrix */
export function colMeans(X: number[][]): number[] {
  const n = X.length;
  const d = X[0]?.length ?? 0;
  const mu = Array.from({ length: d }, () => 0);
  for (const row of X) {
    for (let j = 0; j < d; j++) {
      mu[j]! += row[j] ?? 0;
    }
  }
  return mu.map((x) => x / Math.max(1, n));
}

export function centerMatrix(X: number[][], mu: number[]): number[][] {
  return X.map((row) => row.map((x, j) => x - (mu[j] ?? 0)));
}

/** Covariance of centered n×d matrix */
function covarianceCentered(Xc: number[][]): number[][] {
  const n = Xc.length;
  const d = Xc[0]?.length ?? 0;
  const C = zeros(d, d);
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      let s = 0;
      for (const row of Xc) {
        s += (row[i] ?? 0) * (row[j] ?? 0);
      }
      C[i]![j] = s / Math.max(1, n - 1);
    }
  }
  return C;
}

function powerEigenpair(C: number[][]): { lambda: number; v: number[] } {
  const d = C.length;
  let v = Array.from({ length: d }, (_, i) => Math.sin(i + 1));
  for (let iter = 0; iter < 80; iter++) {
    const w = matVec(C, v);
    const n = norm(w);
    v = scale(w, 1 / n);
  }
  const Cv = matVec(C, v);
  const lambda = dot(v, Cv);
  return { lambda, v };
}

function deflate(C: number[][], lambda: number, v: number[]): number[][] {
  const vv = outer(v, v);
  return C.map((row, i) => row.map((x, j) => x - lambda * (vv[i]?.[j] ?? 0)));
}

/** First two principal components (eigenvectors) of covariance */
export function pcaTwoComponents(Xc: number[][]): { v1: number[]; v2: number[]; scores: [number, number][] } {
  const C = covarianceCentered(Xc);
  const { lambda: l1, v: e1 } = powerEigenpair(C);
  const C2 = deflate(C, l1, e1);
  const { v: e2raw } = powerEigenpair(C2);
  let e2 = subtract(e2raw, scale(e1, dot(e2raw, e1)));
  e2 = scale(e2, 1 / norm(e2));

  const scores: [number, number][] = Xc.map((row) => [
    dot(row, e1),
    dot(row, e2),
  ]);
  return { v1: e1, v2: e2, scores };
}

/**
 * K-means matching sklearn defaults used in Analysis/cluster.py:
 * k-means++ initialization, n_init=10, max_iter=300, tol=1e-4, random_state stream from `seed`.
 */
export function kmeans(X: number[][], k: number, seed = 42, nInit = 10): { labels: number[]; centers: number[][] } {
  const n = X.length;
  if (n === 0 || k <= 0) return { labels: [], centers: [] };
  if (k === 1) {
    const d = X[0]?.length ?? 0;
    const mu = Array.from({ length: d }, () => 0);
    for (const row of X) {
      for (let j = 0; j < d; j++) mu[j]! += row[j] ?? 0;
    }
    for (let j = 0; j < d; j++) mu[j]! /= n;
    return { labels: Array.from({ length: n }, () => 0), centers: [mu] };
  }

  const rng = createRng(seed >>> 0);
  let bestLabels: number[] = [];
  let bestCenters: number[][] = [];
  let bestInertia = Infinity;

  for (let run = 0; run < nInit; run++) {
    const init = kmeansPlusPlusCenters(X, k, rng);
    const { labels, centers } = kmeansSingle(X, k, init);
    const inertia = inertiaLloyd(X, labels, centers);
    if (inertia < bestInertia) {
      bestInertia = inertia;
      bestLabels = labels;
      bestCenters = centers;
    }
  }

  return { labels: bestLabels, centers: bestCenters };
}

/** Min-max scale each coordinate to [pad, size - pad] */
export function scaleToCanvas(
  pts: [number, number][],
  width: number,
  height: number,
  pad = 48,
): { x: number; y: number }[] {
  if (!pts.length) return [];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rx = maxX - minX || 1;
  const ry = maxY - minY || 1;
  const innerW = width - 2 * pad;
  const innerH = height - 2 * pad;
  return pts.map(([x, y]) => ({
    x: pad + ((x - minX) / rx) * innerW,
    y: pad + (1 - (y - minY) / ry) * innerH,
  }));
}
