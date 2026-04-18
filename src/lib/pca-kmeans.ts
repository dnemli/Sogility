/**
 * Minimal PCA (2D) + k-means used for archetype visualization, aligned with Analysis/cluster.py:
 * - KMeans on RPS-style skill vectors (here: mean cohort percentiles per ability).
 * - PCA projection for 2D scatter (PC1 / PC2).
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

function addMat(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((x, j) => x + (B[i]?.[j] ?? 0)));
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

export function kmeans(X: number[][], k: number, seed = 42): { labels: number[]; centers: number[][] } {
  const n = X.length;
  const d = X[0]?.length ?? 0;
  if (n === 0 || k <= 0) return { labels: [], centers: [] };

  let rng = seed;
  const rand = () => {
    rng = (rng * 1103515245 + 12345) % 2147483647;
    return rng / 2147483647;
  };

  const centers: number[][] = [];
  const picks = new Set<number>();
  while (centers.length < k && picks.size < n) {
    const idx = Math.floor(rand() * n);
    if (!picks.has(idx)) {
      picks.add(idx);
      centers.push([...X[idx]!]);
    }
  }
  while (centers.length < k) {
    centers.push([...X[centers.length % n]!]);
  }

  const labels = Array.from({ length: n }, () => 0);

  for (let iter = 0; iter < 50; iter++) {
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const dist = norm(subtract(X[i]!, centers[c]!));
        if (dist < bestD) {
          bestD = dist;
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
      const cnt = Math.max(1, counts[c]!);
      for (let j = 0; j < d; j++) {
        newCenters[c]![j]! /= cnt;
      }
    }
    centers.splice(0, centers.length, ...newCenters);
  }

  return { labels, centers };
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
