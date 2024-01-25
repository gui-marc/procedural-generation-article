import * as THREE from 'three';

import Debug from './debug';
import Game from './game';

const TERRAIN_PARAMETERS = {
  wireframe: true,
  color: 0xcccccc,
  resolution: 10,
};

export default class Terrain extends THREE.Mesh {
  constructor() {
    super();
    this.geometry = new THREE.PlaneGeometry(10, 10, TERRAIN_PARAMETERS.resolution, TERRAIN_PARAMETERS.resolution);
    this.material = new THREE.MeshBasicMaterial({
      color: TERRAIN_PARAMETERS.color,
      wireframe: TERRAIN_PARAMETERS.wireframe,
    });
    this.rotation.x = -Math.PI / 2;
  }
}

// DEBUG

const terrainFolder = Debug.GetInstance().gui.addFolder('Terrain');

terrainFolder.add(TERRAIN_PARAMETERS, 'resolution', 1, 100, 1).onChange(() => Game.GetInstance().Restart());
terrainFolder.add(TERRAIN_PARAMETERS, 'wireframe').onChange(() => Game.GetInstance().Restart());
terrainFolder.addColor(TERRAIN_PARAMETERS, 'color').onChange(() => Game.GetInstance().Restart());
