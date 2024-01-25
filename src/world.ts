import Debug, { Debuggable } from './debug';
import { DEFAULTS } from './defaults';
import { NoiseMutableParams, NoiseWorldParams, SeedablePRNG, perlinNoise } from './noise';

const WORLD_HEIGHT = 100;
const WORLD_WIDTH = 100;

export default class World extends Debuggable {
  private worldParams: Omit<NoiseWorldParams, 'prng'> = {
    height: WORLD_HEIGHT,
    width: WORLD_WIDTH,
    persistence: DEFAULTS.PERSISTENCE,
    octaves: DEFAULTS.OCTAVES,
    wavelengthValue: DEFAULTS.WAVELENGTH,
  };

  private mutableParams: NoiseMutableParams = {
    amplitude: DEFAULTS.AMPLITUDE,
    expoent: DEFAULTS.EXPONENT,
    peaks: DEFAULTS.PEAKS,
    offsetX: 0,
    offsetY: 0,
  };

  constructor(
    private terrain: THREE.Mesh,
    private seed: number,
  ) {
    super();
  }

  setTerrain(terrain: THREE.Mesh) {
    this.terrain = terrain;
  }

  getResolution() {
    return this.worldParams.width;
  }

  generate() {
    const noise = perlinNoise({
      mutable: this.mutableParams,
      world: {
        ...this.worldParams,
        prng: new SeedablePRNG(this.seed),
      },
    });

    const positionAttribute = this.terrain.geometry.getAttribute('position') as THREE.BufferAttribute;

    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let minY = Infinity;
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);

      console.log(x, y);

      if (x < minX) {
        minX = x;
      }
      if (x > maxX) {
        maxX = x;
      }

      if (y < minY) {
        minY = y;
      }
      if (y > maxY) {
        maxY = y;
      }
    }

    function getX(x: number) {
      return x + Math.abs(minX);
    }

    function getY(y: number) {
      return y + Math.abs(minY);
    }

    for (let x = minX; x < maxX; x++) {
      for (let y = minY; y < maxY; y++) {
        console.log(getX(x), getY(y));
      }
    }
  }

  debug(): void {
    Debug.getInstance().UI.getFolder('Game').add(this.mutableParams, 'offsetX', 0, 1000, 1);
    Debug.getInstance().UI.getFolder('Game').add(this.mutableParams, 'offsetY', 0, 1000, 1);

    Debug.getInstance().UI.getFolder('World').add(this.worldParams, 'width', 1, 1000, 1);
    Debug.getInstance().UI.getFolder('World').add(this.worldParams, 'height', 1, 1000, 1);
    Debug.getInstance().UI.getFolder('World').add(this.worldParams, 'persistence', 0, 1, 0.01);
    Debug.getInstance().UI.getFolder('World').add(this.worldParams, 'octaves', 1, 10, 1);
    Debug.getInstance().UI.getFolder('World').add(this.worldParams, 'wavelengthValue', 1, 1000, 1);

    Debug.getInstance().UI.getFolder('Terrain').add(this.mutableParams, 'amplitude', 0, 1000, 1);
    Debug.getInstance().UI.getFolder('Terrain').add(this.mutableParams, 'expoent', 0, 1000, 1);
    Debug.getInstance().UI.getFolder('Terrain').add(this.mutableParams, 'peaks', 0, 1, 0.01);

    Debug.getInstance().onChange({ c: () => this.generate() });
  }
}
