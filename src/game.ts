import * as THREE from 'three';
// @ts-expect-error - OrbitControls is not typed
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import Debug from './debug';
import { FractalNoise, PerlinNoise } from './noise';
import Terrain from './terrain';

const NOISE_PARAMETERS = {
  scale: 10,
  octaves: 1,
  persistence: 0.5,
  lacunarity: 2,
  exponentiation: 1,
  heightMultiplier: 1,
};

export default class Game {
  private static instance: Game;

  private canvas: HTMLCanvasElement = document.querySelector('#game-canvas')!;
  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  private controls: OrbitControls;
  private scene: THREE.Scene = new THREE.Scene();
  private terrain: THREE.Mesh = new Terrain();

  private constructor() {
    this.canvas = document.querySelector('#game-canvas')!;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setClearColor(0x000000);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.initCamera();
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.scene.add(this.terrain);

    this.setupLights();
  }

  public static GetInstance() {
    if (!Game.instance) {
      Game.instance = new Game();
    }
    return Game.instance;
  }

  Start() {
    this.Update();
  }

  Update() {
    requestAnimationFrame(this.Update.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  Restart() {
    this.scene.remove(this.terrain);
    this.generateTerrain();
  }

  GetScene() {
    return this.scene;
  }

  private generateTerrain() {
    this.terrain = new Terrain();

    const positionAttribute = this.terrain.geometry.getAttribute('position') as THREE.BufferAttribute;

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);

      const noise = new FractalNoise(
        new PerlinNoise(NOISE_PARAMETERS.scale),
        NOISE_PARAMETERS.octaves,
        NOISE_PARAMETERS.persistence,
        NOISE_PARAMETERS.scale,
        NOISE_PARAMETERS.lacunarity,
        NOISE_PARAMETERS.exponentiation,
        NOISE_PARAMETERS.heightMultiplier,
      );

      const z = noise.sample(x, y);

      positionAttribute.setZ(i, z);
    }

    this.scene.add(this.terrain);
  }

  private initCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
    this.camera.position.y = 5;
    this.camera.position.x = 5;
    this.camera.lookAt(0, 0, 0);
  }

  private setupLights() {
    let light = new THREE.DirectionalLight(0x808080, 1);
    light.position.set(-100, 100, -100);
    light.target.position.set(0, 0, 0);
    light.castShadow = false;
    this.scene.add(light);

    light = new THREE.DirectionalLight(0x404040, 1);
    light.position.set(100, 100, -100);
    light.target.position.set(0, 0, 0);
    light.castShadow = false;
    this.scene.add(light);
  }
}

const noiseFolder = Debug.GetInstance().gui.addFolder('Noise');

noiseFolder.add(NOISE_PARAMETERS, 'scale', 1, 100, 1).onChange(() => Game.GetInstance().Restart());
noiseFolder.add(NOISE_PARAMETERS, 'octaves', 1, 10, 1).onChange(() => Game.GetInstance().Restart());
noiseFolder.add(NOISE_PARAMETERS, 'persistence', 0, 1, 0.01).onChange(() => Game.GetInstance().Restart());
noiseFolder.add(NOISE_PARAMETERS, 'lacunarity', 1, 10, 0.01).onChange(() => Game.GetInstance().Restart());
noiseFolder.add(NOISE_PARAMETERS, 'exponentiation', 0, 10, 0.01).onChange(() => Game.GetInstance().Restart());
noiseFolder.add(NOISE_PARAMETERS, 'heightMultiplier', 0, 10, 0.01).onChange(() => Game.GetInstance().Restart());
