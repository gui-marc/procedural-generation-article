import './style.css';

import { GUI } from 'lil-gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

import noise from './noise';

const DebugGUI = new GUI();

const NOISE_PARAMETERS = {
  seed: 2000,
  scale: 159,
  octaves: 8,
  persistence: 0.75,
  lacunarity: 1.75,
  exponentiation: 4,
  height: 70,
};

export type NoiseParameters = typeof NOISE_PARAMETERS;

const PARAMETERS = {
  size: 100,
  resolution: 128,
  wireframe: true,
  color: 0xffffff,
};

const canvas = document.querySelector('#game-canvas')!;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);

const terrain = new THREE.Mesh(
  new THREE.PlaneGeometry(PARAMETERS.size, PARAMETERS.size, PARAMETERS.resolution, PARAMETERS.resolution),
  new THREE.MeshStandardMaterial({
    wireframe: PARAMETERS.wireframe,
    color: PARAMETERS.color,
    side: THREE.FrontSide,
  }),
);
terrain.castShadow = false;
terrain.receiveShadow = true;

let light = new THREE.DirectionalLight(0x808080, 1);
light.position.set(-100, 100, -100);
light.target.position.set(0, 0, 0);
light.castShadow = false;
scene.add(light);

light = new THREE.DirectionalLight(0x404040, 1);
light.position.set(100, 100, -100);
light.target.position.set(0, 0, 0);
light.castShadow = false;
scene.add(light);

camera.position.z = 50;
camera.position.y = 50;
camera.position.x = 50;
camera.lookAt(0, 0, 0);

terrain.rotation.x = -Math.PI / 2;

scene.add(terrain);

function generateTerrain() {
  const positions = terrain.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);

    positions.setZ(i, noise(x, y, NOISE_PARAMETERS));
  }
}

generateTerrain();

function updateTerrain() {
  terrain.geometry = new THREE.PlaneGeometry(
    PARAMETERS.size,
    PARAMETERS.size,
    PARAMETERS.resolution,
    PARAMETERS.resolution,
  );
  terrain.material = new THREE.MeshStandardMaterial({
    wireframe: PARAMETERS.wireframe,
    color: PARAMETERS.color,
    side: THREE.FrontSide,
  });
  terrain.castShadow = false;
  terrain.receiveShadow = true;
  //   terrain.position.y = -NOISE_PARAMETERS.height / 2;
  generateTerrain();
}

function update() {
  requestAnimationFrame(update);
  controls.update();
  renderer.render(scene, camera);
}

update();

const terrainFolder = DebugGUI.addFolder('Terrain');
terrainFolder.add(PARAMETERS, 'size', 1, 300).onChange(updateTerrain);
terrainFolder.add(PARAMETERS, 'resolution', 1, 500).onChange(updateTerrain);
terrainFolder.add(PARAMETERS, 'wireframe').onChange(updateTerrain);
terrainFolder.addColor(PARAMETERS, 'color').onChange(updateTerrain);

const noiseFolder = DebugGUI.addFolder('Noise');
noiseFolder.add(NOISE_PARAMETERS, 'seed', 0, 10000).onChange(updateTerrain);
noiseFolder.add(NOISE_PARAMETERS, 'scale', 45, 500).onChange(updateTerrain);
noiseFolder.add(NOISE_PARAMETERS, 'octaves', 0, 10, 1).onChange(updateTerrain);
noiseFolder.add(NOISE_PARAMETERS, 'persistence', 0, 1).onChange(updateTerrain);
noiseFolder.add(NOISE_PARAMETERS, 'lacunarity', 0, 3, 0.1).onChange(updateTerrain);
noiseFolder.add(NOISE_PARAMETERS, 'exponentiation', 0, 10).onChange(updateTerrain);
noiseFolder.add(NOISE_PARAMETERS, 'height', 0, 1000).onChange(updateTerrain);
