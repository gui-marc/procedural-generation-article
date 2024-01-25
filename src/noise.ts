import { SimplexNoise } from 'three/examples/jsm/Addons.js';

export interface Noise {
  sample(x: number, y: number): number;
}

export class FractalNoise implements Noise {
  constructor(
    private readonly baseNoise: Noise,
    private readonly octaves: number,
    private readonly persistence: number,
    private readonly scale: number,
    private readonly lacunarity: number,
    private readonly exponentiation: number,
    private readonly heightMultiplier: number,
  ) {}

  sample(x: number, y: number): number {
    const xScaled = x / this.scale;
    const yScaled = y / this.scale;

    const G = 2.0 ** -this.persistence;

    let amplitude = 1.0;
    let frequency = 1.0;
    let normalization = 0.0;
    let total = 0.0;

    for (let octave = 0; octave < this.octaves; octave++) {
      const value = this.baseNoise.sample(xScaled * frequency, yScaled * frequency) * 0.5 + 0.5;
      total += value * amplitude;
      normalization += amplitude;
      amplitude *= G;
      frequency *= this.lacunarity;
    }

    total /= normalization;

    return Math.pow(total, this.exponentiation) * this.heightMultiplier;
  }
}

export class PerlinNoise implements Noise {
  constructor(
    private readonly scale: number,
    private readonly simplex: SimplexNoise = new SimplexNoise(),
  ) {}

  sample(x: number, y: number): number {
    const xScaled = x / this.scale;
    const yScaled = y / this.scale;

    const value = this.simplex.noise(xScaled, yScaled) * 0.5 + 0.5;

    console.log({ coords: [x, y], value });

    return value;
  }
}
