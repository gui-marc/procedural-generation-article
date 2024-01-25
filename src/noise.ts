const WORLD_BORDER = 284839;
const FACTOR = 255;

export class SeedablePRNG {
  constructor(private seed: number) {}

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

/**
 * Params that can change the world
 */
export interface NoiseWorldParams {
  width: number;
  height: number;
  persistence: number;
  octaves: number;
  wavelengthValue: number;
  prng: SeedablePRNG;
}

/**
 * Params that can mutate without changing the world
 */
export interface NoiseMutableParams {
  offsetX: number;
  offsetY: number;

  peaks: number;
  expoent: number;
  amplitude: number;
}

interface NoiseParams {
  world: NoiseWorldParams;
  mutable: NoiseMutableParams;
}

export function perlinNoise({ world, mutable }: NoiseParams) {
  // Grid of random gradient vectors
  const gradients = new Array(world.width + 1);
  for (let i = 0; i < world.width; i++) {
    gradients[i] = new Array(world.height + 1);
    for (let j = 0; j < world.height; j++) {
      gradients[i][j] = [world.prng.next() * 2 - 1, world.prng.next() * 2 - 1];
    }
  }

  // Array to store the noise values
  const noise = new Array(world.width);
  for (let i = 0; i < world.width; i++) {
    noise[i] = new Array(world.height);
  }

  // Generate the Perlin Noise
  for (let x = 0; x < world.width; x++) {
    for (let y = 0; y < world.height; y++) {
      noise[x][y] = 0;

      const k = x + mutable.offsetX + WORLD_BORDER;
      const j = y + mutable.offsetY + WORLD_BORDER;

      for (let o = 0, wavelength = world.wavelengthValue, amplitude = mutable.amplitude; o < world.octaves; o++) {
        // Calculate the coordinates of the grid cell that the point is in
        const x0 = Math.floor(k / wavelength);
        const x1 = x0 + 1;
        const y0 = Math.floor(j / wavelength);
        const y1 = y0 + 1;

        // Calculate the dot products of the gradients at each corner of the grid cell with the distance vector from each corner to the point
        const dot00 = dotProduct(gradients[(x0 + world.width) % world.width][(y0 + world.height) % world.height], [
          k / wavelength - x0,
          j / wavelength - y0,
        ]);
        const dot01 = dotProduct(gradients[(x0 + world.width) % world.width][(y1 + world.height) % world.height], [
          k / wavelength - x0,
          j / wavelength - y1,
        ]);
        const dot10 = dotProduct(gradients[(x1 + world.width) % world.width][(y0 + world.height) % world.height], [
          k / wavelength - x1,
          j / wavelength - y0,
        ]);
        const dot11 = dotProduct(gradients[(x1 + world.width) % world.width][(y1 + world.height) % world.height], [
          k / wavelength - x1,
          j / wavelength - y1,
        ]);

        // Interpolate the values using bilinear interpolation
        const tx = easeInOutQuad(k / wavelength - x0);
        const ty = easeInOutQuad(j / wavelength - y0);
        const nx0 = lerp(dot00, dot10, tx);
        const nx1 = lerp(dot01, dot11, tx);
        const nxy = lerp(nx0, nx1, ty);

        // Add the value to the Perlin noise value
        noise[x][y] += amplitude / 4 - Math.abs(nxy * amplitude);

        wavelength = Math.max(wavelength / 2, 1);
        amplitude *= world.persistence;
      }

      // Convert the Perlin noise value to a terrain value
      noise[x][y] = Math.max(
        0,
        Math.min(254, Math.floor(Math.pow((noise[x][y] + 1) / 2 + mutable.peaks, mutable.expoent) * FACTOR)),
      );
    }
  }

  return noise;
}

// Helper function to calculate the dot product of two vectors
function dotProduct(v1: number[], v2: number[]) {
  return v1[0] * v2[0] + v1[1] * v2[1];
}

// Helper function to interpolate between two values using a quadratic easing function
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Helper function to interpolate between two values using linear interpolation
function lerp(a: number, b: number, t: number) {
  return (1 - t) * a + t * b;
}
