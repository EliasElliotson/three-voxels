import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { VoxelMesh } from './VoxelMesh.js';

// Main scene setup
function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);

  const voxelMesh = new VoxelMesh();
  voxelMesh.addVoxel(0, 0, 0);
  voxelMesh.addVoxel(1, 0, 0);
  voxelMesh.addVoxel(0, 1, 0);
  voxelMesh.updateGeometry();

  scene.add(voxelMesh);

  camera.position.z = 5;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // Handle mouse clicks to add or remove voxels
  window.addEventListener('click', () => {
    const x = Math.floor(Math.random() * 5 - 2);
    const y = Math.floor(Math.random() * 5 - 2);
    const z = Math.floor(Math.random() * 5 - 2);

    if (Math.random() > 0.5) {
      console.log(`Adding voxel at (${x}, ${y}, ${z})`);
      voxelMesh.addVoxel(x, y, z);
    } else {
      console.log(`Removing voxel at (${x}, ${y}, ${z})`);
      voxelMesh.removeVoxel(x, y, z);
    }

    voxelMesh.updateGeometry();
  });
}

init();