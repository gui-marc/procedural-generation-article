import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

import Debug, { Debuggable } from './debug';
import World from './world';

class Terrain extends THREE.Mesh {
  constructor(color: number, resolution: number, wireframe: boolean) {
    super();
    this.geometry = new THREE.PlaneGeometry(10, 10, resolution, resolution);
    this.material = new THREE.MeshBasicMaterial({
      color,
      wireframe,
    });
    this.rotation.x = -Math.PI / 2;
  }
}

export default class Game extends Debuggable {
  private static instance: Game;

  static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game();
    }
    return Game.instance;
  }

  private terrainParams = {
    color: 0x00ff00,
    resolution: 100,
    wireframe: true,
  };

  private canvas: HTMLCanvasElement = document.querySelector('#game-canvas')!;
  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  private controls: OrbitControls;
  private scene: THREE.Scene = new THREE.Scene();
  private terrain: THREE.Mesh = new Terrain(
    this.terrainParams.color,
    this.terrainParams.resolution,
    this.terrainParams.wireframe,
  );
  private world = new World(this.terrain, 255);

  private constructor() {
    super();

    this.canvas = document.querySelector('#game-canvas')!;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setClearColor(0x000000);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene.add(this.terrain);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
    this.camera.position.y = 5;
    this.camera.position.x = 5;
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, this.canvas);
  }

  private updateTerrain() {
    this.scene.remove(this.terrain);
    this.terrain = new Terrain(this.terrainParams.color, this.terrainParams.resolution, this.terrainParams.wireframe);
    this.scene.add(this.terrain);
    this.world.setTerrain(this.terrain);
    this.world.generate();
  }

  start() {
    this.world.generate();
    this.update();
  }

  update() {
    requestAnimationFrame(this.update.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  debug(): void {
    Debug.getInstance().UI.getFolder('Terrain').addColor(this.terrainParams, 'color');
    Debug.getInstance().UI.getFolder('Terrain').add(this.terrainParams, 'resolution', 1, 1000, 1);
    Debug.getInstance().UI.getFolder('Terrain').add(this.terrainParams, 'wireframe');

    Debug.getInstance().onChange({ path: 'Terrain', c: () => this.updateTerrain() });
  }
}
